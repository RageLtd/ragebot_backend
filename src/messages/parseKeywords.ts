import { Userstate } from "tmi.js";
import { clientRegistry } from "..";
import {
  executeCustomBehavior,
  timeoutInMillis,
} from "../notifications/notificationUtils";
import { notification_sse_clients } from "../ragebotServer";
import { getTriggersQuery } from "../triggers/triggerQueries";
import { userHasPermission } from "../utils/permissioning";

export async function parseKeywords(
  target: string,
  userState: Userstate,
  message: string
) {
  const keywords: {
    [key: string]: { name: string; modOnly: boolean; subOnly: boolean }[];
  } = {};

  const client = await clientRegistry.getClient(target);

  const { data: triggers } = (await client?.query(getTriggersQuery())) as {
    data: any[];
  };

  triggers.reduce((acc, trigger) => {
    acc[trigger.keyword] = trigger.behaviors;
    return acc;
  }, keywords);

  Object.keys(keywords).forEach((keyword) => {
    if (
      message.split(" ").includes(keyword) &&
      keywords[keyword] &&
      keywords[keyword].length > 0
    ) {
      keywords[keyword].forEach(async (behavior) => {
        if (!userHasPermission(userState, behavior)) {
          return;
        }
        const notificationHTML = await executeCustomBehavior(
          client!,
          target.substring(1),
          behavior,
          "",
          { user_name: userState.username! },
          message
        );
        notification_sse_clients[target.substring(1)]?.forEach((sse_client) => {
          sse_client.res.write(
            `data: ${JSON.stringify({
              notificationHTML,
              timeoutInMillis,
              type: "keyword",
              alertName: keyword,
            })}\n\n`
          );
        });
      });
    }
  });
}
