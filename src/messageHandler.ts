import { Userstate } from "tmi.js";
import { filterRegistry, tmiClient } from ".";
import { parseMessage } from "./messages/parseMessage";

async function checkProfanity(target: string, message: string) {
  const filter = await filterRegistry.getFilter(target);
  return filter.isProfane(message);
}

export const messageHandler = async (
  channel: string,
  userState: Userstate,
  message: string,
  self: boolean
) => {
  if (self) {
    return;
  }

  if (message.startsWith("!")) {
    parseMessage(channel, userState, message);
  }

  if (await checkProfanity(channel, message)) {
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
  }
};
