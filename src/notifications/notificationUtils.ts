import { replace, get } from "lodash";
import { clientRegistry } from "..";
import {
  getNotificationStylesQuery,
  getNotificationVariablesQuery,
  NotificationStylesResponse,
} from "./notificationQueries";
import { TwitchNotification, TwitchNotificationEvent } from "./notifications";

let followMessage = "Thanks for the follow, %user_name%!";
let followPrefixString = "";
let followPostfixString = "";
let newSubMessage = "%user_name% just subscribed!";
let newSubPrefixString = "";
let newSubPostfixString = "";
let resubMessage = "%user_name% just resubscribed!";
let resubPrefixString = "";
let resubPostfixString = "%message%";
let channelGiftMessage =
  "%user_name% is gifting %total% subs to the community!";
let channelGiftPrefixString = "";
let channelGiftPostfixString = "";
let cheerMessage = "%user_name% sent %bits% bits!";
let cheerPrefixString = "";
let cheerPostfixString = "%message%";
let raidMessage =
  "%from_broadcaster_user_name% is raiding with %viewers% viewers!";
let raidPrefixString = "";
let raidPostfixString = "";
let redemptionMessage = "%user_name% redeemed %reward.title%";
let redemptionPrefixString = "";
let redemptionPostfixString = "%user_input%";

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
  followMessage = variables.followMessage || followMessage;
  followPrefixString = variables.followPrefixString || followPrefixString;
  followPostfixString = variables.followPostfixString || followPostfixString;
  newSubMessage = variables.newSubMessage || newSubMessage;
  newSubPrefixString = variables.newSubPrefixString || newSubPrefixString;
  newSubPostfixString = variables.newSubPostfixString || newSubPostfixString;
  resubMessage = variables.resubMessage || resubMessage;
  resubPrefixString = variables.resubPrefixString || resubPrefixString;
  resubPostfixString = variables.resubPostfixString || resubPostfixString;
  channelGiftMessage = variables.channelGiftMessage || channelGiftMessage;
  channelGiftPrefixString =
    variables.channelGiftPrefixString || channelGiftPrefixString;
  channelGiftPostfixString =
    variables.channelGiftPostfixString || channelGiftPostfixString;
  cheerMessage = variables.cheerMessage || cheerMessage;
  cheerPrefixString = variables.cheerPrefixString || cheerPrefixString;
  cheerPostfixString = variables.cheerPostfixString || cheerPostfixString;
  raidMessage = variables.raidMessage || raidMessage;
  raidPrefixString = variables.raidPrefixString || raidPrefixString;
  raidPostfixString = variables.raidPostfixString || raidPostfixString;
  redemptionMessage = variables.redemptionMessage || redemptionMessage;
  redemptionPrefixString =
    variables.redemptionPrefixString || redemptionPrefixString;
  redemptionPostfixString =
    variables.redemptionPostfixString || redemptionPostfixString;

  timeoutInMillis = variables.timeoutInMillis || timeoutInMillis;
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
  return await client?.query(getNotificationVariablesQuery());
}

export function parseFollowNotification(eventData: TwitchNotificationEvent) {
  const [formattedPrefixString, formattedMessage, formattedPostfixString] =
    formatMessages(
      [...alwaysTokens, ...followTokens],
      [followPrefixString, followMessage, followPostfixString],
      eventData
    );

  return (
    `<div>${formattedPrefixString}</div>` +
    `<span>${formattedMessage}</span>` +
    `<div>${formattedPostfixString}</div>`
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
    `<div>${formattedPrefixString}</div>` +
    `<span>${formattedMessage}</span>` +
    `<div>${formattedPostfixString}</div>`
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
    `<div>${formattedPrefixString}</div>` +
    `<span>${formattedMessage}</span>` +
    `<div>${formattedPostfixString}</div>`
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
    `<div>${formattedPrefixString}</div>` +
    `<span>${formattedMessage}</span>` +
    `<div>${formattedPostfixString}</div>`
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
    `<div>${formattedPrefixString}</div>` +
    `<span>${formattedMessage}</span>` +
    `<div>${formattedPostfixString}</div>`
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
    `<div>${formattedPrefixString}</div>` +
    `<span>${formattedMessage}</span>` +
    `<div>${formattedPostfixString}</div>`
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
    `<div>${formattedPrefixString}</div>` +
    `<span>${formattedMessage}</span>` +
    `<div>${formattedPostfixString}</div>`
  );
}

function formatMessages(
  tokens: string[],
  messages: string[],
  eventData: TwitchNotificationEvent
) {
  return tokens.reduce((messages, token) => {
    const tokenIndex = token.substring(1, token.length - 1);

    return messages.map((message) => {
      if (eventData.is_anonymous && tokenIndex === "user_name") {
        return replace(
          message,
          token,
          `<span class="${tokenIndex}">An Anonymous user</span>`
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
        `<span class="${tokenIndex}">${get(
          eventData,
          tokenIndex
        )?.toString()}</span>`
      );
    });
  }, messages);
}
