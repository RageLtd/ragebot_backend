import { Router } from "express";
import { clientRegistry } from "..";
import { getChatStylesQuery, saveChatStylesQuery } from "../chat/chatQueries";
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

chatApiRouter.post("/:userName/styles", async (req, res) => {
  const { userName } = req.params;
  const styles = req.body;
  const client = await clientRegistry.getClient(`#${userName.toLowerCase()}`);

  const saveRes = await client
    ?.query(saveChatStylesQuery(styles))
    .catch(console.error);

  res.send(saveRes);
});

chatApiRouter.get("/:userName/styles", async (req, res) => {
  const { userName } = req.params;
  const client = await clientRegistry.getClient(`#${userName.toLowerCase()}`);

  const stylesRes = await client
    ?.query(getChatStylesQuery())
    .catch(console.error);

  /// @ts-expect-error
  res.send(stylesRes.data);
});

export default chatApiRouter;
