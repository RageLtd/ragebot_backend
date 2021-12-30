import cors from "cors";
import express, { Response } from "express";
import path from "path";
import fetch from "cross-fetch";
import helmet from "helmet";
import { customCommandRegistry, webhookRegistry, webPort } from ".";
import { getAuthToken } from "./authToken";
import { childDbExists } from "./clientRegistry";
import { setupUserDb } from "./users/setupUserDb";
import { readFileSync } from "fs";
import { getChatStyles } from "./chat/chat";
import { NotificationVariablesResponse } from "./notifications/notificationQueries";
import { handleEventSubPost } from "./webhooks/twitchEventSub";
import {
  applyNotificationVariables,
  getNotificationStyles,
  getNotificationVariables,
  NotificationVariables,
} from "./notifications/notificationUtils";

export const TWITCH_HELIX_API = "https://api.twitch.tv/helix";

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

  ragebot.get("/api/user-setup", async (req, res) => {
    const { username } = req.query;

    const exists = await childDbExists(`#${username}`);

    if (exists) {
      res.sendStatus(200);
      return;
    }
    res.sendStatus(404);
  });

  ragebot.get("/api/follows", async (req, res) => {
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

  ragebot.post("/api/user-setup", async (req, res) => {
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

  ragebot.get("/api/chat/:userName/feed", (req, res) => {
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

  ragebot.get("/api/notifications/:userName", async (req, res) => {
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

  ragebot.get("/api/notifications/:userName/feed", async (req, res) => {
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

  ragebot.get("/api/integrations/:userName", async (req, res) => {
    const { userName } = req.params;

    res.status(200).send(await webhookRegistry.getWebhookUrls(`#${userName}`));
  });

  ragebot.patch("/api/integrations/:userName", async (req, res) => {
    const { userName } = req.params;
    const faunaRes = await webhookRegistry.updateWebhook(userName, req.body);

    /// @ts-expect-error
    res.send(faunaRes?.data);
  });

  ragebot.get("/api/commands/:userName", async (req, res) => {
    const { userName } = req.params;

    const commandRes = await customCommandRegistry.getCommands(`#${userName}`);

    res.status(200).send(commandRes);
  });

  ragebot.patch("/api/commands/:userName", async (req, res) => {
    const { userName } = req.params;

    const commandRes = await customCommandRegistry.updateCommand(
      `#${userName.toLowerCase()}`,
      req.body
    );

    /// @ts-expect-error
    res.send(commandRes.data);
  });

  ragebot.post("/api/commands/:userName", async (req, res) => {
    const { userName } = req.params;

    const commandRes = await customCommandRegistry
      .addCommand(`#${userName.toLowerCase()}`, req.body)
      .catch((err) => res.send(err));

    res.send(commandRes);
  });

  ragebot.delete("/api/commands/:userName", async (req, res) => {
    const { userName } = req.params;

    const commandRes = await customCommandRegistry
      .removeCommand(`#${userName.toLowerCase()}`, req.body)
      .catch(console.error);

    res.send(commandRes);
  });

  ragebot.post("/eventsub", handleEventSubPost);

  // ragebot.get("/*", (req, res) =>
  //   res.sendFile(path.resolve(__dirname, "../public/index.html"))
  // );

  ragebot.listen(webPort, () => {
    console.log(`Webserver listening on: ${webPort}`);
  });
}
