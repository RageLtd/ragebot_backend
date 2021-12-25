import cors from "cors";
import express, { Request, Response } from "express";
import crypto from "crypto";
import path from "path";
import fetch from "cross-fetch";
import helmet from "helmet";
import { webPort } from ".";
import { getAuthToken } from "./authToken";
import { childDbExists } from "./commands/channels/clientRegistry";
import { setupUserDb } from "./users/setupUserDb";
import { readFileSync } from "fs";
import { getChatStyles } from "./chat/chat";
import {
  applyNotificationVariables,
  getNotificationStyles,
  getNotificationVariables,
  NotificationVariables,
  sendNotification,
} from "./notifications/notifications";
import { NotificationVariablesResponse } from "./notifications/notificationQueries";

export const TWITCH_HELIX_API = "https://api.twitch.tv/helix";

const secret = process.env.WEBHOOK_SECRET;

// Notification request headers
const TWITCH_MESSAGE_ID = "Twitch-Eventsub-Message-Id".toLowerCase();
const TWITCH_MESSAGE_TIMESTAMP =
  "Twitch-Eventsub-Message-Timestamp".toLowerCase();
const TWITCH_MESSAGE_SIGNATURE =
  "Twitch-Eventsub-Message-Signature".toLowerCase();
const MESSAGE_TYPE = "Twitch-Eventsub-Message-Type".toLowerCase();

// Notification message types
const MESSAGE_TYPE_VERIFICATION = "webhook_callback_verification";
const MESSAGE_TYPE_NOTIFICATION = "notification";
const MESSAGE_TYPE_REVOCATION = "revocation";

// Prepend this string to the HMAC that's created from the message
const HMAC_PREFIX = "sha256=";

interface SSEClient {
  id: number;
  res: Response;
}

export let chat_sse_clients: { [key: string]: SSEClient[] } = {};
export const notification_sse_clients: { [key: string]: SSEClient[] } = {};

export function initializeRagebotServer() {
  const ragebot = express();

  ragebot.use(
    express.json({
      type: "application/json",
    })
  );
  ragebot.use(express.static(path.resolve(__dirname, "../public")));
  ragebot.use(cors());
  ragebot.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          imgSrc: ["self", "static-cdn.jtvnw.net"],
        },
      },
      crossOriginResourcePolicy: {
        policy: "cross-origin",
      },
    })
  );

  ragebot.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../public/index.html"));
  });

  ragebot.get("/user-setup", async (req, res) => {
    const { username } = req.query;

    const exists = await childDbExists(`#${username}`);

    if (exists) {
      res.sendStatus(200);
      return;
    }
    res.sendStatus(404);
  });

  ragebot.get("/follows", async (req, res) => {
    const { user_id, after } = req.query;

    const authToken = await getAuthToken();

    const twitchRes = await fetch(
      `${TWITCH_HELIX_API}/users/follows?to_id=${user_id}${
        after ? `&after=${after}` : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
        },
      }
    );

    res.status(twitchRes.status).send(await twitchRes.json());
  });

  ragebot.post("/user-setup", async (req, res) => {
    console.log(req.body);
    await setupUserDb(req.body.username.toLowerCase(), req.body.user_id);
    res.sendStatus(200);
  });

  ragebot.get("/chat/:userName", async (req, res) => {
    const chatPagePath = path.resolve(__dirname, "../public/chat/layout.html");
    const chatPage = readFileSync(chatPagePath).toString();
    const endOfBodyIndex = chatPage.indexOf("</body>");

    const { userName } = req.params;
    const chatStyles = await getChatStyles(userName);

    const styleTag = `<style>${chatStyles}</style>`;

    res
      .status(200)
      .send(
        chatPage.substring(0, endOfBodyIndex) +
          styleTag +
          chatPage.substring(endOfBodyIndex)
      );
  });

  ragebot.get("/chat/:userName/feed", (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });

    const clientId = Date.now();

    if (
      !chat_sse_clients[req.params.userName] ||
      chat_sse_clients[req.params.userName].length === 0
    ) {
      chat_sse_clients[req.params.userName] = [];
    }

    chat_sse_clients[req.params.userName].push({
      id: clientId,
      res,
    });

    res.write("Heartbeat \n\n");

    const interval = setInterval(() => res.write("Heartbeat \n\n"), 50 * 1000);

    req.on("close", () => {
      clearInterval(interval);
      chat_sse_clients[req.params.userName] = chat_sse_clients[
        req.params.userName
      ].filter((client) => client.id !== clientId);
    });
  });

  ragebot.get("/notifications/:userName", async (req, res) => {
    const notificationPagePath = path.resolve(
      __dirname,
      "../public/notifications/layout.html"
    );
    const notificationPage = readFileSync(notificationPagePath).toString();
    const endOfBodyIndex = notificationPage.indexOf("</body>");

    const { userName } = req.params;
    const notificationStyles = await getNotificationStyles(userName);

    const styleTag = `<style>${notificationStyles}</style>`;

    res
      .status(200)
      .send(
        notificationPage.substring(0, endOfBodyIndex) +
          styleTag +
          notificationPage.substring(endOfBodyIndex)
      );
  });

  ragebot.get("/notifications/:userName/feed", async (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });

    const { userName } = req.params;
    const { data: notificationVariables } = (await getNotificationVariables(
      userName
    ).catch(() => ({}))) as NotificationVariablesResponse;

    applyNotificationVariables(
      notificationVariables as unknown as NotificationVariables
    );

    const clientId = Date.now();

    if (
      !notification_sse_clients[userName] ||
      notification_sse_clients[userName].length === 0
    ) {
      notification_sse_clients[userName] = [];
    }

    notification_sse_clients[userName].push({
      id: clientId,
      res,
    });

    res.write("Heartbeat \n\n");

    const interval = setInterval(() => res.write("Heartbeat \n\n"), 50 * 1000);

    req.on("close", () => {
      clearInterval(interval);
      notification_sse_clients[userName] = notification_sse_clients[
        userName
      ].filter((client) => client.id !== clientId);
    });
  });

  ragebot.post("/eventsub", (req, res) => {
    const message = getHMACMessage(req);
    const hmac = HMAC_PREFIX + getHMAC(secret!, message);

    const notification = req.body;

    switch (req.headers[MESSAGE_TYPE]) {
      case MESSAGE_TYPE_NOTIFICATION: {
        sendNotification(notification);
        res.sendStatus(204);
        break;
      }
      case MESSAGE_TYPE_VERIFICATION: {
        res
          .header("Content-Type", "text/plain")
          .status(200)
          .send(notification.challenge);
        break;
      }
      case MESSAGE_TYPE_REVOCATION: {
        res.sendStatus(204);

        console.info(
          `${notification.subscription.type} notifications revoked!`
        );
        console.info(`reason: ${notification.subscription.status}`);
        console.info(
          `condition: ${JSON.stringify(
            notification.subscription.condition,
            null,
            4
          )}`
        );
        break;
      }
      default: {
        res.sendStatus(204);
        console.info(
          `Unknown message type received: ${req.headers[MESSAGE_TYPE]}`
        );
      }
    }
  });

  ragebot.listen(webPort, () => {
    console.log(`Webserver listening on: ${webPort}`);
  });
}

function getHMACMessage(request: Request) {
  return (
    (request.headers[TWITCH_MESSAGE_ID] as string) +
    request.headers[TWITCH_MESSAGE_TIMESTAMP] +
    request.body
  );
}

function getHMAC(secret: string, message: string) {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

function verifyMessage(hmac: string, verifySignature: any) {
  if (!verifySignature) {
    console.error("No signature to verify");
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(verifySignature)
  );
}
