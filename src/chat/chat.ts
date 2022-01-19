import _, { merge } from "lodash";
import fetch from "cross-fetch";
import { Userstate } from "tmi.js";
import { clientRegistry } from "..";
import { getAuthToken } from "../authToken";
import { chat_sse_clients, TWITCH_HELIX_API } from "../ragebotServer";
import { ChatStylesResponse, getChatStylesQuery } from "./chatQueries";

interface EmoteObject {
  url: string;
  startIndex: number;
  endIndex: number;
}

interface BadgeVersion {
  id: string;
  image_url_1x: string;
}

interface BadgeCategory {
  set_id: string;
  versions: BadgeVersion[];
}

interface ChatBadgeRegistry {
  [key: string]: BadgeCategory[];
}

const chatBadges: ChatBadgeRegistry = {};

async function getBadgeUrlByChannel(
  channel: string,
  badge: string,
  version: string
) {
  if (chatBadges[channel]) {
    return chatBadges[channel]
      .find(({ set_id }) => set_id === badge)
      ?.versions.find(({ id }) => id === version)?.image_url_1x;
  }

  const authToken = await getAuthToken();

  const globalBadgesRes = await fetch(
    `${TWITCH_HELIX_API}/chat/badges/global`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
      },
    }
  );

  const globalBages = await globalBadgesRes.json();

  const userRes = await fetch(`${TWITCH_HELIX_API}/users?login=${channel}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
    },
  });

  const userJson = await userRes.json();

  const chatSpecificBadgesRes = await fetch(
    `${TWITCH_HELIX_API}/chat/badges?broadcaster_id=${userJson.data[0].id}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
      },
    }
  );

  const chatSpecificBadges = await chatSpecificBadgesRes.json();

  chatBadges[channel] = merge(globalBages.data, chatSpecificBadges.data);

  return chatBadges[channel]
    .find(({ set_id }) => set_id === badge)
    ?.versions.find(({ id }) => id === version)?.image_url_1x;
}

export async function postToChat(
  target: string,
  userState: Userstate,
  message: string
) {
  const userIdentity = `<div class="identity">${await parseUser(
    target.substring(1),
    userState
  )}</div>`;
  const messageWithEmotes = `<span class="message ${
    userState["message-type"] === "action" ? " italics" : ""
  }">${parseEmotes(message, userState.emotes)}</span>`;

  const chatHTML = userIdentity + messageWithEmotes;

  chat_sse_clients[target.substring(1)]?.forEach(({ res }) =>
    res.write(`data: ${chatHTML}\n\n`)
  );
}

export function parseEmotes(
  message: string,
  emotes: {
    [emoteid: string]: string[];
  } = {}
) {
  const emoteArray = _.chain(emotes)
    .map(function (emoteLocations: string[], emoteId: string) {
      return _.map(emoteLocations, (chars) => {
        const indexes = chars.split("-");
        return {
          // url: `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/${
          //   emoteId.startsWith("emotesv2_") ? "animated" : "static"
          // }/light/1.0`,
          url: `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/light/1.0`,
          startIndex: parseInt(indexes[0]),
          endIndex: parseInt(indexes[1]) + 1,
        };
      });
    })
    .flatten()
    .sortBy(["startIndex"])
    .value() as unknown as EmoteObject[];

  return emoteArray.reduceRight((message: string, emote: EmoteObject) => {
    return `${message.substring(0, emote.startIndex)}${makeImage(
      emote.url,
      "emote"
    )}${message.substring(emote.endIndex)}`;
  }, message);
}

function makeImage(url: string, classString: string) {
  return `<img class="${classString}" src="${url}" />`;
}

interface UserColor {
  [key: string]: string;
}

const userColor: UserColor = {};

async function parseUser(channel: string, userState: Userstate) {
  const badges = await Promise.all(
    Object.keys(userState.badges || {}).map(async (badge) => {
      const url = await getBadgeUrlByChannel(
        channel,
        badge,
        userState.badges![badge]!
      );
      return makeImage(url || "", `badge ${badge}`);
    })
  );

  if (!userColor[userState["user-id"]!]) {
    userColor[userState["user-id"]!] =
      userState.color ||
      `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )}, ${Math.floor(Math.random() * 256)})`;
  }

  return (
    badges.join("") +
    `<span class="username" style="color: ${
      userColor[userState["user-id"]!]
    }">${userState["display-name"]}</span>`
  );
}

export async function getChatStyles(username: string) {
  const client = await clientRegistry.getClient(`#${username}`);
  const { data: elements = {} } = (await client?.query(
    getChatStylesQuery()
  )) as ChatStylesResponse;
  return Object.keys(elements)
    .map((element) => `${element} ${elements[element]}`)
    .join(" ");
}
