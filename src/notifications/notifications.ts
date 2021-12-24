import { get, merge, replace } from "lodash";
import { clientRegistry } from "..";
import { parseEmotes } from "../chat/chat";
import { notification_sse_clients } from "../ragebotServer";
import {
  getNotificationStylesQuery,
  getNotificationVariablesQuery,
  NotificationStylesResponse,
} from "./notificationQueries";

export interface NotificationVariables {
  userFollowMessage: string;
  followPrefixString: string;
  followPostfixString: string;
  newSubMessage: string;
  newSubPrefixString: string;
  newSubPostfixString: string;
  resubMessage: string;
  resubPrefixString: string;
  resubPostfixString: string;
  timeoutInMillis: number;
}

interface TwitchNotification {
  subscription: {
    type: string;
  };
  event: {
    user_id: string;
    user_name: string;
    broadcaster_user_name?: string;
    to_broadcaster_user_name?: string;
    message?: {
      emotes?: { begin: number; end: number; id: string }[];
      text: string;
    };
  };
}

interface TwitchNotificationEvent {
  [key: string]: string | number | boolean | undefined | null;
  user_name: string;
  cumulative_months?: number;
  duration_months?: number;
  message?: string;
  streak_months?: number;
  tier?: string;
  is_anonymous?: boolean;
  cumulative_total?: number | null;
}

interface FormattedEmotes {
  [key: string]: string[];
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

export function applyNotificationVariables(variables: NotificationVariables) {
  followMessage = variables.userFollowMessage || followMessage;
  followPrefixString = variables.followPrefixString || followPrefixString;
  followPostfixString = variables.followPostfixString || followPostfixString;
  newSubMessage = variables.newSubMessage || newSubMessage;
  newSubPrefixString = variables.newSubPrefixString || newSubPrefixString;
  newSubPostfixString = variables.newSubPostfixString || newSubPostfixString;
  resubMessage = variables.resubMessage || resubMessage;
  resubPrefixString = variables.resubPrefixString || resubPrefixString;
  resubPostfixString = variables.resubPostfixString || resubPostfixString;
  timeoutInMillis = variables.timeoutInMillis || timeoutInMillis;
}

function getUserName(notification: TwitchNotification) {
  if (notification.event.broadcaster_user_name) {
    return notification.event.broadcaster_user_name === "testBroadcaster"
      ? "rageltd"
      : notification.event.broadcaster_user_name!;
  }
  return notification.event.to_broadcaster_user_name === "testBroadcaster"
    ? "rageltd"
    : notification.event.to_broadcaster_user_name!;
}

export function sendNotification(notification: TwitchNotification) {
  const broadcasterUsername = getUserName(notification);

  let eventWithParsedMessage = {};

  if (notification.event.message) {
    const formattedEmotes = notification.event.message.emotes?.reduce(
      (acc: FormattedEmotes, { id, begin, end }) => {
        acc[id] = acc[id]
          ? [...acc[id], `${begin}-${end}`]
          : [`${begin}-${end}`];
        return acc;
      },
      {}
    );
    eventWithParsedMessage = {
      ...notification.event,
      message: parseEmotes(notification.event.message.text, formattedEmotes),
    };
  }

  const parsedNotification = {
    ...notification,
    event: merge(notification.event, eventWithParsedMessage),
  };

  const notificationHTML = generateNotificationHTML(parsedNotification);

  notification_sse_clients[broadcasterUsername].forEach((sse_client) => {
    sse_client.res.write(
      `data: ${JSON.stringify({
        notificationHTML,
        timeoutInMillis,
      })}\n\n`
    );
  });
}

export async function getNotificationVariables(username: string) {
  const client = await clientRegistry.getClient(`#${username}`);
  return await client?.query(getNotificationVariablesQuery());
}

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

let timeoutInMillis = 5 * 1000;

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

function generateNotificationHTML(parsedNotification: TwitchNotification) {
  const eventData =
    parsedNotification.event as unknown as TwitchNotificationEvent;

  switch (parsedNotification.subscription.type) {
    case "channel.follow": {
      return parseFollowNotification(eventData);
    }
    case "channel.subscribe": {
      return parseNewSubscription(eventData);
    }
    case "channel.subscription.message": {
      return parseResubMessage(eventData);
    }
    case "channel.subscription.gift": {
      return parseGiftSubMessage(eventData);
    }
    case "channel.cheer": {
      return parseCheerMessage(eventData);
    }
    case "channel.raid": {
      return parseRaidMessage(eventData);
    }
    case "channel.channel_points_custom_reward_redemption.add": {
      return parseChannelPointRedemptionMessage(eventData);
    }
  }
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

function parseFollowNotification(eventData: TwitchNotificationEvent) {
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

function parseNewSubscription(eventData: TwitchNotificationEvent) {
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

function parseResubMessage(eventData: TwitchNotificationEvent) {
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

function parseGiftSubMessage(eventData: TwitchNotificationEvent) {
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

function parseCheerMessage(eventData: TwitchNotificationEvent) {
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

function parseRaidMessage(eventData: TwitchNotificationEvent) {
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

function parseChannelPointRedemptionMessage(
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
