import { clientRegistry, faunaClient } from "..";
import { childDbExists } from "../clientRegistry";
import indexDefinitions from "./indexDefinitions";
import {
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
        "commands",
        "counters",
        "game",
        "lobby",
        "run",
        "filter_whitelist",
        "filter_blacklist",
        "chat_styles",
        "notification_styles",
        "notification_variables",
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
}
