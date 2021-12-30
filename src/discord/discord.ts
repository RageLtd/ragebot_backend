import fetch from "cross-fetch";
import { get, replace } from "lodash";
import { TwitchNotificationEvent } from "../notifications/notifications";
const messageContentTokens = [
  "%broadcaster_user_name%",
  "%broadcaster_user_login%",
  "%category_name%",
  "%language%",
  "%is_mature%",
  "%title%",
];
let messageContentString = `@here %broadcaster_user_name% is streaming %category_name%: %title%\r\nhttps://twitch.tv/%broadcaster_user_login%`;

function formatContent(
  tokens: string[],
  message: string,
  eventData: TwitchNotificationEvent
) {
  return tokens.reduce((message, token) => {
    const tokenIndex = token.substring(1, token.length - 1);
    return replace(message, token, `${get(eventData, tokenIndex)?.toString()}`);
  }, message);
}

function sendMessage(
  webhookUrls: string[],
  eventData: TwitchNotificationEvent
) {
  webhookUrls.forEach((url) => {
    fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: formatContent(
          messageContentTokens,
          messageContentString,
          eventData
        ),
      }),
    }).catch((err) => console.error(err));
  });
}

export default {
  sendMessage,
};
