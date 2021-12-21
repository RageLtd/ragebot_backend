import cors from "cors";
import express, { Response } from "express";
import path from "path";
import fetch from "cross-fetch";
import { webPort } from ".";
import { getAuthToken } from "./authToken";
import { childDbExists } from "./commands/channels/clientRegistry";
import { setupUserDb } from "./users/setupUserDb";
import { readFileSync } from "fs";
import { getChatStyles } from "./chat/chat";
import { getNotificationStyles } from "./notifications/notifications";

const TWITCH_HELIX_API = "https://api.twitch.tv/helix";

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

    res.write(
      `data: <span class="message">Connected to ${req.params.userName}'s chatroom</span>\n\n`
    );

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

    req.on("close", () => {
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

  ragebot.get("/notifications/:userName/feed", (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });

    res.write(
      `data: { "data": "Connected to ${req.params.userName}'s notifications" }\n\n`
    );

    const clientId = Date.now();

    if (
      !notification_sse_clients[req.params.userName] ||
      notification_sse_clients[req.params.userName].length === 0
    ) {
      notification_sse_clients[req.params.userName] = [];
    }

    notification_sse_clients[req.params.userName].push({
      id: clientId,
      res,
    });

    req.on("close", () => {
      notification_sse_clients[req.params.userName] = notification_sse_clients[
        req.params.userName
      ].filter((client) => client.id !== clientId);
    });
  });

  ragebot.listen(webPort, () => {
    console.log(`Webserver listening on: ${webPort}`);
  });
}
