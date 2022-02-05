import { merge } from "lodash";
import { clientRegistry, webhookRegistry } from "..";
import { parseEmotes } from "../chat/chat";
import discord from "../discord/discord";
import { notification_sse_clients } from "../ragebotServer";
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
    reward?: {
      title: string;
    };
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

const services: { [key: string]: any } = {
  discord,
};

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

  const notificationHTML = await generateNotificationHTML(parsedNotification);

  notification_sse_clients[broadcasterUsername]?.forEach((sse_client) => {
    sse_client.res.write(
      `data: ${JSON.stringify({
        notificationHTML,
        timeoutInMillis,
        type: notification.subscription.type,
        alertName: notification.event.reward?.title,
      })}\n\n`
    );
  });
}

async function postStatusUpdate(
  webhooks: { [key: string]: Webhook[] },
  eventData: TwitchNotificationEvent,
  eventType: string
) {
  webhooks[eventType].map((service) => {
    switch (service.name) {
      case "discord": {
        services[service.name].sendMessage(
          service.webhookUrls || [],
          eventData
        );
        break;
      }
    }
  });
}

async function sendWebhookMessage(
  webhooks: { [key: string]: Webhook[] },
  notificationType: string,
  eventData: TwitchNotificationEvent
) {
  webhooks[notificationType].forEach((webhook) => {
    webhook.webhookUrls.forEach((url) => {
      services[webhook.name].sendMessage(url, eventData);
    });
  });
}

async function generateNotificationHTML(
  parsedNotification: TwitchNotification
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

  const customBehaviors: { [key: string]: any[] } = {};

  await Promise.all(
    customBehaviorTypes.map(async (type) => {
      const { data: behaviors } = (await client?.query(
        getCustomBehaviorsQuery(type)
      )) as { data: any[] };
      customBehaviors[type] = behaviors;
    })
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
        sendWebhookMessage(webhooks, notificationType, eventData);
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
        sendWebhookMessage(webhooks, notificationType, eventData);
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
        sendWebhookMessage(webhooks, notificationType, eventData);
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
        sendWebhookMessage(webhooks, notificationType, eventData);
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
        sendWebhookMessage(webhooks, notificationType, eventData);
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
        sendWebhookMessage(webhooks, notificationType, eventData);
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
        sendWebhookMessage(webhooks, notificationType, eventData);
      }
      return message;
    }
    case "channel.update": {
      return postStatusUpdate(
        webhooks,
        eventData,
        parsedNotification.subscription.type
      );
    }
  }
}
