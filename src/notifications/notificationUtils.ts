import { Client } from "faunadb";
import { replace, get } from "lodash";
import { clientRegistry, tmiClient } from "..";
import { addBacklogQuery } from "../commands/backlog/backlogQueries";
import {
  getNotificationStylesQuery,
  getNotificationVariablesQuery,
  NotificationStylesResponse,
  NotificationVariablesResponse,
} from "./notificationQueries";
import { TwitchNotification, TwitchNotificationEvent } from "./notifications";

let followMessage: string;
let followPrefixString: string;
let followPostfixString: string;
let newSubMessage: string;
let newSubPrefixString: string;
let newSubPostfixString: string;
let resubMessage: string;
let resubPrefixString: string;
let resubPostfixString: string;
let channelGiftMessage: string;
let channelGiftPrefixString: string;
let channelGiftPostfixString: string;
let cheerMessage: string;
let cheerPrefixString: string;
let cheerPostfixString: string;
let raidMessage: string;
let raidPrefixString: string;
let raidPostfixString: string;
let redemptionMessage: string;
let redemptionPrefixString: string;
let redemptionPostfixString: string;

const alwaysTokens = ["%user_name%", "%broadcaster_user_name%"];
const followTokens: string[] = [];
const newSubTokens = ["%tier%"];
const resubTokens = [
  "%cumulative_months%",
  "%streak_months%",
  "%tier%",
  "%message%",
  "%duration_months%",
];
const giftSubTokens = ["%total%", "%tier%", "%cumulative_total%"];
const cheerTokens = ["%bits%", "%message%"];
const raidTokens = ["%from_broadcaster_user_name%", "%viewers%"];
const redemptionTokens = [
  "%user_input%",
  "%reward.title%",
  "%reward.prompt%",
  "%reward.cost%",
];

export let timeoutInMillis = 5 * 1000;

export interface NotificationVariables {
  followMessage: string;
  followPrefixString: string;
  followPostfixString: string;
  newSubMessage: string;
  newSubPrefixString: string;
  newSubPostfixString: string;
  resubMessage: string;
  resubPrefixString: string;
  resubPostfixString: string;
  channelGiftMessage: string;
  channelGiftPrefixString: string;
  channelGiftPostfixString: string;
  cheerMessage: string;
  cheerPrefixString: string;
  cheerPostfixString: string;
  raidMessage: string;
  raidPrefixString: string;
  raidPostfixString: string;
  redemptionMessage: string;
  redemptionPrefixString: string;
  redemptionPostfixString: string;

  timeoutInMillis: number;
}

export function applyNotificationVariables(variables: NotificationVariables) {
  ({
    cheerMessage,
    cheerPostfixString,
    cheerPrefixString,
    followMessage,
    followPrefixString,
    followPostfixString,
    newSubMessage,
    newSubPrefixString,
    newSubPostfixString,
    resubMessage,
    resubPrefixString,
    resubPostfixString,
    channelGiftMessage,
    channelGiftPrefixString,
    channelGiftPostfixString,
    raidMessage,
    raidPrefixString,
    raidPostfixString,
    redemptionMessage,
    redemptionPrefixString,
    redemptionPostfixString,
    timeoutInMillis,
  } = variables);
}

export async function getNotificationStyles(username: string) {
  const client = await clientRegistry.getClient(`#${username}`);
  const { data: elements = {} } = (await client?.query(
    getNotificationStylesQuery()
  )) as NotificationStylesResponse;
  return Object.keys(elements)
    .map(
      (element) =>
        `${element} { ${Object.keys(elements[element])
          .map((style) => `${style}: ${elements[element][style]};`)
          .join("\r\n")} }`
    )
    .join(" ");
}

export function getUserName(notification: TwitchNotification) {
  if (notification.event.broadcaster_user_name) {
    return notification.event.broadcaster_user_name === "testBroadcaster"
      ? "RageLtd"
      : notification.event.broadcaster_user_name!;
  }
  return notification.event.to_broadcaster_user_name === "testBroadcaster"
    ? "RageLtd"
    : notification.event.to_broadcaster_user_name!;
}

export async function getNotificationVariables(username: string) {
  const client = await clientRegistry.getClient(`#${username}`);
  return (await client?.query(
    getNotificationVariablesQuery()
  )) as NotificationVariablesResponse;
}

export function parseFollowNotification(eventData: TwitchNotificationEvent) {
  const [formattedPrefixString, formattedMessage, formattedPostfixString] =
    formatMessages(
      [...alwaysTokens, ...followTokens],
      [followPrefixString, followMessage, followPostfixString],
      eventData
    );

  return (
    `<div class="prefix">${formattedPrefixString}</div>` +
    `<span class="message">${formattedMessage}</span>` +
    `<div class="postfix">${formattedPostfixString}</div>`
  );
}

export function parseNewSubscription(eventData: TwitchNotificationEvent) {
  const [formattedPrefixString, formattedMessage, formattedPostfixString] =
    formatMessages(
      [...alwaysTokens, ...newSubTokens],
      [newSubPrefixString, newSubMessage, newSubPostfixString],
      eventData
    );

  return (
    `<div class="prefix">${formattedPrefixString}</div>` +
    `<span class="message">${formattedMessage}</span>` +
    `<div class="postfix">${formattedPostfixString}</div>`
  );
}

export function parseResubMessage(eventData: TwitchNotificationEvent) {
  const [formattedPrefixString, formattedMessage, formattedPostfixString] =
    formatMessages(
      [...alwaysTokens, ...resubTokens],
      [resubPrefixString, resubMessage, resubPostfixString],
      eventData
    );

  return (
    `<div class="prefix">${formattedPrefixString}</div>` +
    `<span class="message">${formattedMessage}</span>` +
    `<div class="postfix">${formattedPostfixString}</div>`
  );
}

export function parseGiftSubMessage(eventData: TwitchNotificationEvent) {
  const [formattedPrefixString, formattedMessage, formattedPostfixString] =
    formatMessages(
      [...alwaysTokens, ...giftSubTokens],
      [channelGiftPrefixString, channelGiftMessage, channelGiftPostfixString],
      eventData
    );

  return (
    `<div class="prefix">${formattedPrefixString}</div>` +
    `<span class="message">${formattedMessage}</span>` +
    `<div class="postfix">${formattedPostfixString}</div>`
  );
}

export function parseCheerMessage(eventData: TwitchNotificationEvent) {
  const [formattedPrefixString, formattedMessage, formattedPostfixString] =
    formatMessages(
      [...alwaysTokens, ...cheerTokens],
      [cheerPrefixString, cheerMessage, cheerPostfixString],
      eventData
    );
  return (
    `<div class="prefix">${formattedPrefixString}</div>` +
    `<span class="message">${formattedMessage}</span>` +
    `<div class="postfix">${formattedPostfixString}</div>`
  );
}

export function parseRaidMessage(eventData: TwitchNotificationEvent) {
  const [formattedPrefixString, formattedMessage, formattedPostfixString] =
    formatMessages(
      raidTokens,
      [raidPrefixString, raidMessage, raidPostfixString],
      eventData
    );
  return (
    `<div class="prefix">${formattedPrefixString}</div>` +
    `<span class="message">${formattedMessage}</span>` +
    `<div class="postfix">${formattedPostfixString}</div>`
  );
}

export function parseChannelPointRedemptionMessage(
  eventData: TwitchNotificationEvent
) {
  const [formattedPrefixString, formattedMessage, formattedPostfixString] =
    formatMessages(
      [...alwaysTokens, ...redemptionTokens],
      [redemptionPrefixString, redemptionMessage, redemptionPostfixString],
      eventData
    );
  return (
    `<div class="prefix">${formattedPrefixString}</div>` +
    `<span class="message">${formattedMessage}</span>` +
    `<div class="postfix">${formattedPostfixString}</div>`
  );
}

export function formatMessages(
  tokens: string[],
  messages: string[],
  eventData: TwitchNotificationEvent,
  isHTML: boolean = true
) {
  return tokens.reduce((messages, token) => {
    const tokenIndex = token.substring(1, token.length - 1);

    return messages.map((message) => {
      if (eventData.is_anonymous && tokenIndex === "user_name") {
        return replace(
          message,
          token,
          `${isHTML ? `<span class="${tokenIndex}">` : ""}An Anonymous user${
            isHTML ? "</span>" : ""
          }`
        );
      }
      if (eventData.is_anonymous && tokenIndex === "cumulative_total") {
        return "";
      }
      if (tokenIndex === "%user_input%" && !eventData.user_input) {
        return "";
      }
      return replace(
        message,
        token,
        `${isHTML ? `<span class="${tokenIndex}">` : ""}${get(
          eventData,
          tokenIndex
        )?.toString()}${isHTML ? `</span>` : ""}`
      );
    });
  }, messages);
}

export async function executeCustomBehavior(
  client: Client,
  broadcasterUsername: string,
  behavior: any,
  type: string,
  eventData: TwitchNotificationEvent,
  message: string
) {
  switch (behavior.behavior) {
    case "addToBacklog": {
      if (behavior.condition === eventData.reward?.title) {
        await client.query(
          addBacklogQuery(eventData.user_input!, eventData.user_name)
        );
        tmiClient.say(
          `#${broadcasterUsername.toLowerCase()}`,
          `${eventData.user_name} added ${eventData.user_input} to the backlog`
        );
      }
      return message;
    }
    case "say": {
      const [message] = formatMessages(
        [...alwaysTokens, ...getTokensByEventType(type)],
        [behavior.response],
        eventData,
        false
      );
      tmiClient.say(`#${broadcasterUsername.toLowerCase()}`, message);
      return message;
    }
    case "sound": {
      return `${message}<audio src=${behavior.sound} autoplay />`;
    }
    default:
      return message;
  }
}

function getTokensByEventType(type: string) {
  switch (type) {
    case "channel.follow":
      return followTokens;
    case "channel.subscribe":
      return newSubTokens;
    case "channel.subscription.gift":
      return giftSubTokens;
    case "channel.subscription.message":
      return resubTokens;
    case "channel.cheer":
      return cheerTokens;
    case "channel.raid":
      return raidTokens;
    case "channel.channel_points_custom_reward_redemption.add":
      return redemptionTokens;
    default:
      return [];
  }
}
