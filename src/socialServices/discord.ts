import fetch from "cross-fetch";
import { get, replace } from "lodash";
import { getAuthToken } from "../authToken";
import {
  TwitchNotification,
  TwitchNotificationEvent,
} from "../notifications/notifications";
import { TWITCH_HELIX_API } from "../ragebotServer";
const messageContentTokens = [
  "%broadcaster_user_name%",
  "%broadcaster_user_login%",
  "%game_name%",
  "%language%",
  "%is_mature%",
  "%title%",
];

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

async function sendMessage(
  url: string,
  notification: TwitchNotification,
  notificationString: string
) {
  let streamInfo = {};

  if (notification.subscription.type === "stream.online") {
    streamInfo = await fetch(
      `${TWITCH_HELIX_API}/channels?broadcaster_id=${notification.event.broadcaster_user_id}`,
      {
        headers: {
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      }
    )
      .then((res) => res.json())
      .catch(console.error);
  }

  fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: formatContent(messageContentTokens, notificationString, {
        ...notification.event,
        ...streamInfo,
      } as TwitchNotificationEvent),
    }),
  }).catch((err) => console.error(err));
}

export default {
  sendMessage,
};
