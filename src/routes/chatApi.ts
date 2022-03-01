import { Router } from "express";
import { clientRegistry, faunaClient, filterRegistry } from "..";
import { Database } from "../channelEvents";
import {
  ChatStylesResponse,
  getChatStylesQuery,
  getIsModerationEnabledQuery,
  saveChatStylesQuery,
  setIsModerationEnabledQuery,
} from "../chat/chatQueries";
import {
  getBlacklistQuery,
  getUsingDefaultBlocklistQuery,
  setUsingDefaultBlocklistQuery,
} from "../messages/filterQueries";
import { getBlacklist, getWhitelist } from "../messages/filterRegistry";
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

  const { data } = (await client
    ?.query(getChatStylesQuery())
    .catch(console.error)) as ChatStylesResponse;

  res.send(data);
});

chatApiRouter.get("/:userName/allowlist", async (req, res) => {
  const { userName } = req.params;
  const client = await clientRegistry.getClient(`#${userName.toLowerCase()}`);

  const getRes = await getWhitelist(client!);

  res.send(getRes);
});

chatApiRouter.post("/:userName/allowlist", async (req, res) => {
  const { userName } = req.params;
  const addRes = await filterRegistry
    .addToWhitelist(`#${userName.toLowerCase()}`, req.body.value)
    .catch(console.error);

  res.send(addRes);
});

chatApiRouter.delete("/:userName/allowlist", async (req, res) => {
  const { userName } = req.params;
  const removeRes = await filterRegistry
    .removeFromWhitelist(`#${userName}`, req.body.value)
    .catch(console.error);

  res.send(removeRes);
});

chatApiRouter.get("/:userName/blocklist", async (req, res) => {
  const { userName } = req.params;
  const client = await clientRegistry.getClient(`#${userName.toLowerCase()}`);

  const getRes = await getBlacklist(client!);

  res.send(getRes);
});

chatApiRouter.post("/:userName/blocklist", async (req, res) => {
  const { userName } = req.params;
  const addRes = await filterRegistry
    .addToBlacklist(`#${userName.toLowerCase()}`, req.body.value)
    .catch(console.error);

  res.send(addRes);
});

chatApiRouter.get("/:userName/blocklist/useDefaults", async (req, res) => {
  const { userName } = req.params;
  const {
    data: { useDefaultBlocklist },
  } = await faunaClient.query<Database>(
    getUsingDefaultBlocklistQuery(userName)
  );

  res.send(JSON.stringify({ useDefaultBlocklist }));
});

chatApiRouter.patch("/:userName/blocklist/useDefaults", async (req, res) => {
  const { userName } = req.params;
  const defaultsRes = await faunaClient.query(
    setUsingDefaultBlocklistQuery(
      userName.toLowerCase(),
      req.body.useDefaultBlocklist
    )
  );

  filterRegistry.initializeFilter(`#${userName.toLowerCase()}`);

  res.send(defaultsRes);
});

chatApiRouter.delete("/:userName/blocklist", async (req, res) => {
  const { userName } = req.params;
  const removeRes = await filterRegistry
    .removeFromBlacklist(`#${userName}`, req.body.value)
    .catch(console.error);

  res.send(removeRes);
});

chatApiRouter.get("/:userName/moderation", async (req, res) => {
  const { userName } = req.params;

  const moderationRes = await faunaClient
    .query(getIsModerationEnabledQuery(userName.toLowerCase()))
    .catch(console.error);

  /// @ts-expect-error
  const { isModerationEnabled } = moderationRes.data;

  res.send({ data: { isModerationEnabled } });
});

chatApiRouter.patch("/:userName/moderation", async (req, res) => {
  const { userName } = req.params;

  const moderationRes = await faunaClient
    .query(
      setIsModerationEnabledQuery(
        userName.toLowerCase(),
        req.body.isModerationEnabled
      )
    )
    .catch(console.error);

  res.send(moderationRes);
});

export default chatApiRouter;
