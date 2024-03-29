import cors from "cors";
import express, { Response } from "express";
import path from "path";
import helmet from "helmet";
import { webPort } from ".";
import { handleEventSubPost } from "./webhooks/twitchEventSub";
import followRouter from "./routes/follows";
import chatRouter from "./routes/chat";
import alertsApiRouter from "./routes/alertsApi";
import alertsRouter from "./routes/alerts";
import chatApiRouter from "./routes/chatApi";
import integrationsApiRouter from "./routes/integrationsApi";
import commandsApiRouter from "./routes/commandsApi";
import userSetupApiRouter from "./routes/userSetupApi";
import backlogApiRouter from "./routes/backlogApi";
import ragebotRouter from "./routes/ragebotApi";
import triggersApiRouter from "./routes/triggersApi";
import paymentsApiRouter from "./routes/paymentApi";
import raffleRouter from "./routes/raffle";

export const TWITCH_HELIX_API = "https://api.twitch.tv/helix";

interface SSEClient {
  id: number;
  res: Response;
}

export let chat_sse_clients: { [key: string]: SSEClient[] } = {};
export const notification_sse_clients: { [key: string]: SSEClient[] } = {};
export const raffle_sse_clients: { [key: string]: SSEClient[] } = {};

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
          imgSrc: ["https:", "http:", "self", "static-cdn.jtvnw.net", "data:"],
          scriptSrc: [
            "self",
            "http:",
            "https:",
            process.env.NODE_ENV !== "production" ? "unsafe-inline" : "",
          ],
          frameSrc: ["self", "https:"],
          mediaSrc: ["self", "https:"],
        },
      },
      crossOriginResourcePolicy: {
        policy: "cross-origin",
      },
    })
  );

  ragebot.use("/chat", chatRouter);
  ragebot.use("/alerts", alertsRouter);

  ragebot.use("/api/alerts", alertsApiRouter);
  ragebot.use("/api/backlog", backlogApiRouter);
  ragebot.use("/api/chat", chatApiRouter);
  ragebot.use("/api/commands", commandsApiRouter);
  ragebot.use("/api/follows", followRouter);
  ragebot.use("/api/integrations", integrationsApiRouter);
  ragebot.use("/api/payments", paymentsApiRouter);
  ragebot.use("/api/raffle", raffleRouter);
  ragebot.use("/api/ragebot", ragebotRouter);
  ragebot.use("/api/triggers", triggersApiRouter);
  ragebot.use("/api/user-setup", userSetupApiRouter);

  ragebot.post("/eventsub", handleEventSubPost);

  // ragebot.get("/*", (req, res) =>
  //   res.sendFile(path.resolve(__dirname, "../public/index.html"))
  // );

  ragebot.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../public/index.html"));
  });

  ragebot.listen(webPort, () => {
    console.log(`Webserver listening on: ${webPort}`);
  });
}
