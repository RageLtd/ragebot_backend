import { merge } from "lodash";
import fetch from "cross-fetch";
import { clientRegistry, webhookRegistry } from "..";
import { parseEmotes } from "../chat/chat";
import discord from "../socialServices/discord";
import twitter from "../socialServices/twitter";
import { notification_sse_clients, TWITCH_HELIX_API } from "../ragebotServer";
import { customBehaviorTypes } from "../users/setupUserDb";
import { Webhook } from "../webhooks/webhookQueries";
import {
  addNotificationLogEntryQuery,
  getCustomBehaviorsQuery,
} from "./notificationQueries";
import {
  applyNotificationVariables,
  executeCustomBehavior,
  getNotificationVariables,
  getUserName,
  NotificationVariables,
  parseChannelPointRedemptionMessage,
  parseCheerMessage,
  parseFollowNotification,
  parseGiftSubMessage,
  parseNewSubscription,
  parseRaidMessage,
  parseResubMessage,
  timeoutInMillis,
} from "./notificationUtils";
import { getAuthToken } from "../authToken";

export interface TwitchNotification {
  subscription: {
    type: string;
  };
  event: {
    user_id: string;
    user_name: string;
    broadcaster_user_id?: string;
    broadcaster_user_name?: string;
    broadcaster_user_login?: string;
    to_broadcaster_user_name?: string;
    message?: {
      emotes?: { begin: number; end: number; id: string }[];
      text: string;
    };
    reward?: {
      title: string;
    };
    user_input?: string;
    bits?: number;
  };
}

export interface TwitchNotificationEvent {
  [key: string]: any;
  user_name: string;
  cumulative_months?: number;
  duration_months?: number;
  message?: string;
  streak_months?: number;
  tier?: string;
  is_anonymous?: boolean;
  cumulative_total?: number | null;
  reward?: {
    id: string;
    title: string;
    cost: number;
  };
  user_input?: string;
}

interface FormattedEmotes {
  [key: string]: string[];
}

const services: {
  [key: string]: {
    sendMessage(
      url: string,
      notification: TwitchNotification,
      notificationString: string
    ): void;
  };
} = {
  discord,
  twitter,
};

function getCustomBehaviorCategoryShortcut(notificationType: string) {
  switch (notificationType) {
    case "channel.follow":
      return "follow";
    case "channel.subscribe":
      return "new";
    case "channel.subscription.gift":
      return "gift";
    case "channel.subscription.message":
      return "resub";
    case "channel.cheer":
    case "channel.raid":
      return notificationType.split(".")[1];
    case "channel.channel_points_custom_reward_redemption.add":
      return "redemption";
    case "channel.update":
      return "channel";
    case "stream.online":
      return "streamOnline";
    case "stream.offline":
      return "streamOffline";
    default:
      return "";
  }
}

export async function sendNotification(notification: TwitchNotification) {
  const broadcasterUsername = getUserName(notification).toLowerCase();

  const client = await clientRegistry
    .getClient(`#${broadcasterUsername.toLowerCase()}`)
    .catch(console.error);

  await client
    ?.query(addNotificationLogEntryQuery(notification))
    .catch(console.error);

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

  const customBehaviors: { [key: string]: any[] } = {};

  await Promise.all(
    customBehaviorTypes.map(async (type) => {
      const { data: behaviors } = (await client?.query(
        getCustomBehaviorsQuery(type)
      )) as { data: any[] };
      customBehaviors[type] = behaviors;
    })
  );

  const notificationHTML = await generateNotificationHTML(
    parsedNotification,
    customBehaviors
  );

  const hasTts = customBehaviors[
    getCustomBehaviorCategoryShortcut(notification.subscription.type)
  ].find((b) => {
    if (b.condition === "") {
      return (
        b.behavior === "tts" &&
        (notification.event.bits
          ? Number(b.minimum) <= notification.event.bits
          : true)
      );
    }
    return b.condition === notification.event.reward?.title;
  });

  notification_sse_clients[broadcasterUsername]?.forEach((sse_client) => {
    sse_client.res.write(
      `data: ${JSON.stringify({
        notificationHTML,
        timeoutInMillis,
        type: notification.subscription.type,
        alertName: notification.event.reward?.title,
        speech: {
          speak: !!hasTts,
          voice: hasTts ? hasTts.voice : undefined,
          message: !!hasTts
            ? (typeof notification.event.message === "string"
                ? notification.event.message
                : notification.event.message?.text) ||
              notification.event.user_input
            : undefined,
        },
      })}\n\n`
    );
  });
}

async function evaluateWebhookConditions(
  conditions: Webhook["conditions"],
  notification: TwitchNotification
) {
  /// @ts-expect-error
  return conditions.reduce(async (acc, condition) => {
    switch (condition) {
      case "streamOnline": {
        const { type } = await fetch(
          `${TWITCH_HELIX_API}/streams?user_id=${notification.event.broadcaster_user_id}`,
          {
            headers: {
              Authorization: `Bearer ${await getAuthToken()}`,
              "Client-Id": process.env.TWITCH_CLIENT_ID!,
            },
          }
        )
          .then((res) => res.json())
          .catch(console.error)
          .then((res) => {
            return res.data[0] ?? { type: false };
          });
        return acc && type === "live";
      }
      case "streamOffline": {
        const { type } = await fetch(
          `${TWITCH_HELIX_API}/streams?user_id=${notification.event.broadcaster_user_id}`,
          {
            headers: {
              Authorization: `Bearer ${await getAuthToken()}`,
              "Client-Id": process.env.TWITCH_CLIENT_ID!,
            },
          }
        )
          .then((res) => res.json())
          .catch(console.error)
          .then((res) => {
            return res.data[0] ?? { type: false };
          });
        return acc && type !== "live";
      }
      default:
        return acc;
    }
  }, true);
}

async function sendWebhookMessage(
  webhooks: { [key: string]: Webhook[] },
  notification: TwitchNotification
) {
  webhooks[notification.subscription.type].forEach(async (webhook) => {
    if (await evaluateWebhookConditions(webhook.conditions, notification)) {
      webhook.webhookUrls.forEach((url) => {
        services[webhook.name].sendMessage(
          url,
          notification,
          webhook.notificationString
        );
      });
    }
  });
}

async function generateNotificationHTML(
  parsedNotification: TwitchNotification,
  customBehaviors: { [key: string]: any[] }
) {
  const broadcasterUsername = getUserName(parsedNotification);
  const eventData =
    parsedNotification.event as unknown as TwitchNotificationEvent;

  const { data: variables } = await getNotificationVariables(
    broadcasterUsername.toLowerCase()
  );
  applyNotificationVariables(variables as unknown as NotificationVariables);

  const client = await clientRegistry.getClient(
    `#${broadcasterUsername.toLowerCase()}`
  );

  const webhooks = await webhookRegistry.getWebhookUrls(
    `#${broadcasterUsername.toLowerCase()}`
  );

  const notificationType = parsedNotification.subscription.type;

  switch (notificationType) {
    case "channel.follow": {
      let message = parseFollowNotification(eventData);
      if (customBehaviors.follow) {
        await Promise.all(
          customBehaviors.follow.map(async (behavior) => {
            message = await executeCustomBehavior(
              client!,
              broadcasterUsername,
              behavior,
              notificationType,
              eventData,
              message
            );
          })
        );
      }
      if (webhooks[notificationType]) {
        sendWebhookMessage(webhooks, parsedNotification);
      }
      return message;
    }
    case "channel.subscribe": {
      let message = parseNewSubscription(eventData);
      if (customBehaviors.new) {
        await Promise.all(
          customBehaviors.new.map(async (behavior) => {
            message = await executeCustomBehavior(
              client!,
              broadcasterUsername,
              behavior,
              parsedNotification.subscription.type,
              eventData,
              message
            );
          })
        );
      }
      if (webhooks[notificationType]) {
        sendWebhookMessage(webhooks, parsedNotification);
      }
      return message;
    }
    case "channel.subscription.message": {
      let message = parseResubMessage(eventData);
      if (customBehaviors.resub) {
        await Promise.all(
          customBehaviors.resub.map(async (behavior) => {
            message = await executeCustomBehavior(
              client!,
              broadcasterUsername,
              behavior,
              parsedNotification.subscription.type,
              eventData,
              message
            );
          })
        );
      }
      if (webhooks[notificationType]) {
        sendWebhookMessage(webhooks, parsedNotification);
      }
      return message;
    }
    case "channel.subscription.gift": {
      let message = parseGiftSubMessage(eventData);
      if (customBehaviors.gift) {
        await Promise.all(
          customBehaviors.gift.map(async (behavior) => {
            message = await executeCustomBehavior(
              client!,
              broadcasterUsername,
              behavior,
              parsedNotification.subscription.type,
              eventData,
              message
            );
          })
        );
      }
      if (webhooks[notificationType]) {
        sendWebhookMessage(webhooks, parsedNotification);
      }
      return message;
    }
    case "channel.cheer": {
      let message = parseCheerMessage(eventData);
      if (customBehaviors.cheer) {
        await Promise.all(
          customBehaviors.cheer.map(async (behavior) => {
            message = await executeCustomBehavior(
              client!,
              broadcasterUsername,
              behavior,
              parsedNotification.subscription.type,
              eventData,
              message
            );
          })
        );
      }
      if (webhooks[notificationType]) {
        sendWebhookMessage(webhooks, parsedNotification);
      }
      return message;
    }
    case "channel.raid": {
      let message = parseRaidMessage(eventData);
      if (customBehaviors.raid) {
        await Promise.all(
          customBehaviors.raid.map(async (behavior) => {
            message = await executeCustomBehavior(
              client!,
              broadcasterUsername,
              behavior,
              parsedNotification.subscription.type,
              eventData,
              message
            );
          })
        );
      }
      if (webhooks[notificationType]) {
        sendWebhookMessage(webhooks, parsedNotification);
      }
      return message;
    }
    case "channel.channel_points_custom_reward_redemption.add": {
      let message = parseChannelPointRedemptionMessage(eventData);
      if (customBehaviors.redemption) {
        await Promise.all(
          customBehaviors.redemption.map(async (behavior) => {
            message = await executeCustomBehavior(
              client!,
              broadcasterUsername,
              behavior,
              parsedNotification.subscription.type,
              eventData,
              message
            );
          })
        );
      }
      if (webhooks[notificationType]) {
        sendWebhookMessage(webhooks, parsedNotification);
      }
      return message;
    }
    case "channel.update":
    case "stream.offline":
    case "stream.online": {
      if (webhooks[notificationType]) {
        sendWebhookMessage(webhooks, parsedNotification);
      }
    }
  }
}
