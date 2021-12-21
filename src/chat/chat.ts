import _ from "lodash";
import { Userstate } from "tmi.js";
import { clientRegistry } from "..";
import { chat_sse_clients } from "../ragebotServer";
import { ChatStylesResponse, getChatStylesQuery } from "./chatQueries";

interface EmoteObject {
  url: string;
  startIndex: number;
  endIndex: number;
}

export function postToChat(
  target: string,
  userState: Userstate,
  message: string
) {
  const userIdentity = `<div class="identity">${parseUser(userState)}</div>`;
  const messageWithEmotes = `<span class="message">${parseEmotes(
    message,
    userState.emotes
  )}</span>`;

  const chatHTML = userIdentity + messageWithEmotes;

  chat_sse_clients[target.substring(1)]?.forEach(({ res }) =>
    res.write(`data: ${chatHTML}\n\n`)
  );
}

function parseEmotes(
  message: string,
  emotes: {
    [emoteid: string]: string[];
  } = {}
) {
  const emoteArray = _.chain(emotes)
    .map(function (emote: string, index: string[]) {
      return _.map(emote, (chars) => {
        const indexes = chars.split("-");
        return {
          url: "http://static-cdn.jtvnw.net/emoticons/v1/" + index + "/1.0",
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

function parseUser(userState: Userstate) {
  // TODO: Get badge backgrounds
  const badges = Object.keys(userState.badges || {})
    .map((badge) => {
      if (badge === "founder") {
        return makeImage(
          "https://static-cdn.jtvnw.net/badges/v1/511b78a9-ab37-472f-9569-457753bbe7d3/1",
          `badge ${badge}`
        );
      }
      return makeImage(
        `http://cdn.frankerfacez.com/static/badges/twitch/2/${badge}/${
          userState.badges![badge]
        }/1.png`,
        `badge ${badge}`
      );
    })
    .join("");

  if (!userColor[userState["user-id"]!]) {
    userColor[userState["user-id"]!] =
      userState.color ||
      `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )}, ${Math.floor(Math.random() * 256)})`;
  }

  return (
    badges +
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
    .map(
      (element) =>
        `${element} { ${Object.keys(elements[element])
          .map((style) => `${style}: ${elements[element][style]};`)
          .join("\r\n")} }`
    )
    .join(" ");
}
