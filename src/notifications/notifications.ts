import { merge } from "lodash";
import { webhookRegistry } from "..";
import { parseEmotes } from "../chat/chat";
import discord from "../discord/discord";
import { notification_sse_clients } from "../ragebotServer";
import {
  getUserName,
  parseChannelPointRedemptionMessage,
  parseCheerMessage,
  parseFollowNotification,
  parseGiftSubMessage,
  parseNewSubscription,
  parseRaidMessage,
  parseResubMessage,
  timeoutInMillis,
} from "./notificationUtils";

export interface TwitchNotification {
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

export interface TwitchNotificationEvent {
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

export function sendNotification(notification: TwitchNotification) {
  const broadcasterUsername = getUserName(notification).toLowerCase();

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

  notification_sse_clients[broadcasterUsername]?.forEach((sse_client) => {
    sse_client.res.write(
      `data: ${JSON.stringify({
        notificationHTML,
        timeoutInMillis,
      })}\n\n`
    );
  });
}

async function postStatusUpdate(
  broadcasterUsername: string,
  eventData: TwitchNotificationEvent
) {
  const webhookUrls = await webhookRegistry.getWebhookUrls(
    `#${broadcasterUsername.toLowerCase()}`
  );

  webhookUrls.map((service) => {
    switch (service.name) {
      case "discord": {
        discord.sendMessage(service.webhookUrls || [], eventData);
        break;
      }
    }
  });
}

function generateNotificationHTML(parsedNotification: TwitchNotification) {
  const broadcasterUsername = getUserName(parsedNotification);
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
    case "channel.update": {
      return postStatusUpdate(broadcasterUsername, eventData);
    }
  }
}
