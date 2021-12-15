import cors from "cors";
import express from "express";
import path from "path";
import { webPort } from ".";
import { childDbExists } from "./commands/channels/clientRegistry";
import { setupUserDb } from "./users/setupUserDb";

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

  ragebot.post("/user-setup", async (req, res) => {
    console.log(req.body);
    await setupUserDb(req.body.username.toLowerCase(), req.body.user_id);
    res.sendStatus(200);
  });

  ragebot.listen(webPort, () => {
    console.log(`Webserver listening on: ${webPort}`);
  });
}
