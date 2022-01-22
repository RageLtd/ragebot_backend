import { format, isBefore, startOfToday } from "date-fns";
import { ReactElement } from "react";
import { TwitchNotification } from "../NotificationLog";

import styles from "./NotificationLogEntry.module.css";

interface NotificationLogEntryProps extends TwitchNotification {}

enum SubscriptionTypes {
  FOLLOW = "channel.follow",
  SUBSCRIBE = "channel.subscribe",
  GIFT = "channel.subscription.gift",
  RESUB = "channel.subscription.message",
  CHEER = "channel.cheer",
  RAID = "channel.raid",
  REDEMPTION = "channel.channel_points_custom_reward_redemption.add",
}

const NotificationDetailsChrome = ({
  children,
  timestamp,
}: {
  children: ReactElement | ReactElement[] | string;
  timestamp: string;
}) => (
  <>
    <span style={{ paddingRight: ".5em" }}>{timestamp}</span>
    {children}
  </>
);

function getNotificationDetails(
  subscription: TwitchNotification["subscription"],
  event: TwitchNotification["event"]
) {
  const eventTimestamp = new Date(subscription.created_at);
  const formatted = isBefore(eventTimestamp, startOfToday())
    ? format(eventTimestamp, "LLL d, p")
    : format(eventTimestamp, "p");

  switch (subscription.type) {
    case SubscriptionTypes.FOLLOW:
      return (
        <NotificationDetailsChrome timestamp={formatted}>
          <>
            <span className={styles.username}>{event.user_name}</span>{" "}
            <span className={styles.action}>followed</span>.
          </>
        </NotificationDetailsChrome>
      );
    case SubscriptionTypes.SUBSCRIBE:
      return (
        <NotificationDetailsChrome timestamp={formatted}>
          <>
            <span className={styles.username}>{event.user_name}</span>{" "}
            <span className={styles.action}>subscribed.</span>
          </>
        </NotificationDetailsChrome>
      );
    case SubscriptionTypes.GIFT:
      return (
        <NotificationDetailsChrome timestamp={formatted}>
          <>
            <span className={styles.username}>{event.user_name}</span>{" "}
            <span className={styles.action}>
              gifted {event.total} subs @ Tier {Number(event.tier) / 1000}
            </span>
            , for a total of {event.cumulative_total}.
          </>
        </NotificationDetailsChrome>
      );
    case SubscriptionTypes.RESUB:
      return (
        <NotificationDetailsChrome timestamp={formatted}>
          <>
            <span className={styles.username}>{event.user_name}</span>{" "}
            <span className={styles.action}>
              resubscribed for {event.duration_months} months
            </span>
            . {event.cumulative_months} months total with a{" "}
            {event.streak_months} month streak.
            {event.message && (
              <p>
                {typeof event.message === "string"
                  ? event.message
                  : event.message?.text}
              </p>
            )}
          </>
        </NotificationDetailsChrome>
      );
    case SubscriptionTypes.CHEER:
      return (
        <NotificationDetailsChrome timestamp={formatted}>
          <>
            <span className={styles.username}>{event.user_name}</span>{" "}
            <span className={styles.action}>cheered {event.bits} bits</span>.
            {event.message && (
              <p>
                {typeof event.message === "string"
                  ? event.message
                  : event.message?.text}
              </p>
            )}
          </>
        </NotificationDetailsChrome>
      );
    case SubscriptionTypes.RAID:
      return (
        <NotificationDetailsChrome timestamp={formatted}>
          <>
            <span className={styles.username}>
              {event.from_broadcaster_user_name}
            </span>{" "}
            <span className={styles.action}>
              raided with {event.viewers} viewers
            </span>
            .
          </>
        </NotificationDetailsChrome>
      );
    case SubscriptionTypes.REDEMPTION:
      return (
        <NotificationDetailsChrome timestamp={formatted}>
          <>
            <span className={styles.username}>{event.user_name}</span>{" "}
            <span className={styles.action}>
              redeemed {event.reward?.title}
            </span>
            .{event.user_input && <p>{event.user_input}</p>}
          </>
        </NotificationDetailsChrome>
      );
    default:
      return <></>;
  }
}

export default function NotificationLogEntry({
  event,
  subscription,
}: NotificationLogEntryProps) {
  return (
    <li className={styles.entry}>
      {getNotificationDetails(subscription, event)}
    </li>
  );
}
