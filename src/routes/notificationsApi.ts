import { Router } from "express";
import { NotificationVariablesResponse } from "../notifications/notificationQueries";
import {
  getNotificationVariables,
  applyNotificationVariables,
  NotificationVariables,
} from "../notifications/notificationUtils";
import { notification_sse_clients } from "../ragebotServer";

const notificationsApiRouter = Router();

notificationsApiRouter.get("/:userName/feed", async (req, res) => {
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

export default notificationsApiRouter;
