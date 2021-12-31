import { Router } from "express";
import { chat_sse_clients } from "../ragebotServer";

const chatApiRouter = Router();

chatApiRouter.get("/:userName/feed", (req, res) => {
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

export default chatApiRouter;
