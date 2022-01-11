import { merge } from "lodash";
import { clientRegistry, webhookRegistry } from "..";
import { parseEmotes } from "../chat/chat";
import discord from "../discord/discord";
import { notification_sse_clients } from "../ragebotServer";
import { customBehaviorTypes } from "../users/setupUserDb";
import { getCustomBehaviorsQuery } from "./notificationQueries";
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

export async function sendNotification(notification: TwitchNotification) {
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

  const customBehaviors: { [key: string]: any[] } = {};

  await Promise.all(
    customBehaviorTypes.map(async (type) => {
      const { data: behaviors } = (await client?.query(
        getCustomBehaviorsQuery(type)
      )) as { data: any[] };
      customBehaviors[type] = behaviors;
    })
  );

  switch (parsedNotification.subscription.type) {
    case "channel.follow": {
      if (customBehaviors.follow) {
        customBehaviors.follow.forEach((behavior) => {
          executeCustomBehavior(
            client!,
            broadcasterUsername,
            behavior,
            parsedNotification.subscription.type,
            eventData
          );
        });
      }
      return parseFollowNotification(eventData);
    }
    case "channel.subscribe": {
      if (customBehaviors.new) {
        customBehaviors.new.forEach((behavior) => {
          executeCustomBehavior(
            client!,
            broadcasterUsername,
            behavior,
            parsedNotification.subscription.type,
            eventData
          );
        });
      }
      return parseNewSubscription(eventData);
    }
    case "channel.subscription.message": {
      if (customBehaviors.resub) {
        customBehaviors.resub.forEach((behavior) => {
          executeCustomBehavior(
            client!,
            broadcasterUsername,
            behavior,
            parsedNotification.subscription.type,
            eventData
          );
        });
      }
      return parseResubMessage(eventData);
    }
    case "channel.subscription.gift": {
      if (customBehaviors.gift) {
        customBehaviors.gift.forEach((behavior) => {
          executeCustomBehavior(
            client!,
            broadcasterUsername,
            behavior,
            parsedNotification.subscription.type,
            eventData
          );
        });
      }
      return parseGiftSubMessage(eventData);
    }
    case "channel.cheer": {
      if (customBehaviors.cheer) {
        customBehaviors.cheer.forEach((behavior) => {
          executeCustomBehavior(
            client!,
            broadcasterUsername,
            behavior,
            parsedNotification.subscription.type,
            eventData
          );
        });
      }
      return parseCheerMessage(eventData);
    }
    case "channel.raid": {
      if (customBehaviors.raid) {
        customBehaviors.raid.forEach((behavior) => {
          executeCustomBehavior(
            client!,
            broadcasterUsername,
            behavior,
            parsedNotification.subscription.type,
            eventData
          );
        });
      }
      return parseRaidMessage(eventData);
    }
    case "channel.channel_points_custom_reward_redemption.add": {
      if (customBehaviors.redemption) {
        customBehaviors.redemption.forEach((behavior) => {
          executeCustomBehavior(
            client!,
            broadcasterUsername,
            behavior,
            parsedNotification.subscription.type,
            eventData
          );
        });
      }
      return parseChannelPointRedemptionMessage(eventData);
    }
    case "channel.update": {
      return postStatusUpdate(broadcasterUsername, eventData);
    }
  }
}
