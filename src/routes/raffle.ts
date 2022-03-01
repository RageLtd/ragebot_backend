import { Router } from "express";
import { closeRaffle, openRaffle, raffles } from "../commands/raffle/raffle";
import { raffle_sse_clients } from "../ragebotServer";

const raffleRouter = Router();

raffleRouter.get("/:userName/state", async (req, res) => {
  const { userName } = req.params;

  const state = !!raffles[`#${userName.toLowerCase()}`];

  res.send(JSON.stringify({ state }));
});

raffleRouter.post("/:userName/open", async (req, res) => {
  const { userName } = req.params;

  openRaffle(`#${userName.toLowerCase()}`).catch(console.error);

  res.sendStatus(200);
});

raffleRouter.post("/:userName/close", async (req, res) => {
  const { userName } = req.params;

  const winner = closeRaffle(`#${userName.toLowerCase()}`);

  res.send(JSON.stringify({ winner }));
});

raffleRouter.get("/:userName/feed", async (req, res) => {
  const { userName } = req.params;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  });

  const clientId = Date.now();

  if (
    !raffle_sse_clients[`#${userName.toLowerCase()}`] ||
    raffle_sse_clients[`#${userName.toLowerCase()}`].length === 0
  ) {
    raffle_sse_clients[`#${userName.toLowerCase()}`] = [];
  }

  raffle_sse_clients[`#${userName.toLowerCase()}`].push({
    id: clientId,
    res,
  });

  res.write("Heartbeat \n\n");

  if (!!raffles[`#${userName.toLowerCase()}`]) {
    res.write(
      `data: ${JSON.stringify(Array.from(raffles[`#${userName}`]))}\r\n\r\n`
    );
  }

  const interval = setInterval(() => res.write("Heartbeat \n\n"), 50 * 1000);

  req.on("close", () => {
    clearInterval(interval);
    raffle_sse_clients[`#${userName.toLowerCase()}`] = raffle_sse_clients[
      `#${userName.toLowerCase()}`
    ].filter((client) => client.id !== clientId);
  });
});

export default raffleRouter;
