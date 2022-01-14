import { Router } from "express";
import { clientRegistry } from "..";
import {
  getCustomBehaviorsQuery,
  getNotificationVariablesQuery,
  NotificationVariablesResponse,
  removeCustomBehaviorQuery,
  saveCustomBehaviorQuery,
  updateNotificationStringQuery,
} from "../notifications/notificationQueries";
import {
  getNotificationVariables,
  applyNotificationVariables,
  NotificationVariables,
} from "../notifications/notificationUtils";
import { notification_sse_clients } from "../ragebotServer";

const alertsApiRouter = Router();

alertsApiRouter.get("/:userName/feed", async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Feature-Policy": "autoplay *",
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

alertsApiRouter.get("/:userName", async (req, res) => {
  const { userName } = req.params;
  const target = `#${userName.toLowerCase()}`;
  const client = await clientRegistry.getClient(target);

  const notificationsResponse = await client?.query(
    getNotificationVariablesQuery()
  );

  res.send(notificationsResponse);
});

alertsApiRouter.patch("/:userName", async (req, res) => {
  const { userName } = req.params;
  const target = `#${userName.toLowerCase()}`;
  const client = await clientRegistry.getClient(target);

  const { name, value } = req.body;

  const notificationSaveResponse = await client?.query(
    updateNotificationStringQuery(name, value)
  );

  res.send(notificationSaveResponse);
});

alertsApiRouter.post("/:userName/behaviors/:type", async (req, res) => {
  const { userName, type } = req.params;
  const target = `#${userName.toLowerCase()}`;
  const client = await clientRegistry.getClient(target);

  const behaviorSaveResponse = await client?.query(
    saveCustomBehaviorQuery(type, req.body)
  );

  res.send(behaviorSaveResponse);
});

alertsApiRouter.get("/:userName/behaviors/:type", async (req, res) => {
  const { userName, type } = req.params;
  const target = `#${userName.toLowerCase()}`;
  const client = await clientRegistry.getClient(target);

  const getBehaviorsResponse = await client?.query(
    getCustomBehaviorsQuery(type)
  );

  res.send(getBehaviorsResponse);
});

alertsApiRouter.delete("/:userName/behaviors/:type", async (req, res) => {
  const { userName, type } = req.params;
  const behavior = req.body;
  const target = `#${userName.toLowerCase()}`;
  const client = await clientRegistry.getClient(target);

  const deleteBehaviorResponse = await client
    ?.query(removeCustomBehaviorQuery(type, behavior))
    .catch(console.error);

  res.send(deleteBehaviorResponse);
});

export default alertsApiRouter;
