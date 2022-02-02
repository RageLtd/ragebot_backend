import { clientRegistry, faunaClient, tmiClient } from "..";
import { childDbExists } from "../clientRegistry";
import indexDefinitions from "./indexDefinitions";
import {
  addNewChannelQuery,
  createBaseCollectionsQuery,
  createBaseIndexesQuery,
  createDefaultChatStylesQuery,
  createDefaultNotificationStylesQuery,
  createDefaultNotificationVarsQuery,
  createUserChildDBQuery,
} from "./setupUserDbQueries";

export const customBehaviorTypes = [
  "channel",
  "cheer",
  "follow",
  "new",
  "raid",
  "redemption",
  "resub",
  "commands",
];

export async function setupUserDb(username: string, twitchId: string) {
  // TODO: Fix potential DB creation exploit
  if (await childDbExists(`#${username}`).catch(console.error)) {
    return;
  }
  await faunaClient
    .query(createUserChildDBQuery(username, twitchId))
    .then(() => console.log("DB created"))
    .catch(console.error);

  await faunaClient.query(addNewChannelQuery(username)).catch(console.error);

  const client = await clientRegistry
    .getClient(`#${username}`)
    .then((res) => {
      console.log("Key created successfully");
      return res;
    })
    .catch(console.error);

  await client
    ?.query(
      createBaseCollectionsQuery([
        "backlog",
        "chat_styles",
        "commands",
        "counters",
        "filter_blacklist",
        "filter_whitelist",
        "game",
        "lobby",
        "notification_log",
        "notification_styles",
        "notification_variables",
        "run",
        "triggers",
        "webhooks",
        ...customBehaviorTypes.map((type) => `${type}_custom_behaviors`),
      ])
    )
    .then(() => console.info(`Created collections for new user: ${username}`))
    .catch(console.error);

  await client
    ?.query(createBaseIndexesQuery(indexDefinitions))
    .catch(console.error);

  await client
    ?.query(createDefaultNotificationVarsQuery())
    .catch(console.error);
  await client
    ?.query(createDefaultNotificationStylesQuery())
    .catch(console.error);

  await client?.query(createDefaultChatStylesQuery()).catch(console.error);

  await tmiClient.join(`#${username}`);
}
