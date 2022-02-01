import { Userstate } from "tmi.js";
import { faunaClient, filterRegistry, tmiClient } from ".";
import { Database } from "./channelEvents";
import { postToChat } from "./chat/chat";
import { getIsModerationEnabledQuery } from "./chat/chatQueries";
import { enableBot, isBotEnabled } from "./commands/utils";
import { parseKeywords } from "./messages/parseKeywords";
import { parseMessage } from "./messages/parseMessage";
import { isModerator } from "./utils/permissioning";

async function checkProfanity(target: string, message: string) {
  const filter = await filterRegistry.getFilter(target);
  return filter.isProfane(message);
}

async function isModerationEnabled(target: string) {
  const {
    data: { isModerationEnabled },
  } = (await faunaClient
    .query(getIsModerationEnabledQuery(target.substring(1)))
    .catch(console.error)) as Database;
  return isModerationEnabled;
}

export const messageHandler = async (
  channel: string,
  userState: Userstate,
  message: string,
  self: boolean
) => {
  const messageArr = message.split(" ");
  const command = messageArr.shift()!;

  if (command === "!on" && isModerator(userState)) {
    enableBot(channel);
    return;
  }

  if (!(await isBotEnabled(channel))) {
    return;
  }

  if (message.startsWith("!")) {
    parseMessage(channel, userState, message);
    return;
  }

  if (
    (await isModerationEnabled(channel)) &&
    (await checkProfanity(channel, message))
  ) {
    tmiClient
      .timeout(
        channel,
        userState.username,
        1,
        `${channel.substring(
          1
        )} does not allow a potentially offensive word in your message: ${message}`
      )
      .catch((err) => console.error(err));
    return;
  }

  parseKeywords(channel, userState, message);

  postToChat(channel, userState, message);
};
