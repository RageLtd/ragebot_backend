import { useEffect, useState } from "react";
import NotificationLogEntry from "./NotificationLogEntry/NotificationLogEntry";

import styles from "./NotificationLog.module.css";

interface NotificationLogProps {
  twitchUserInfo: {
    username?: string;
  };
}

export interface TwitchNotification {
  event: {
    user_name: string;
    total?: string;
    cumulative_total?: string;
    tier?: string;
    message?:
      | {
          text: string;
        }
      | string;
    streak_months?: number;
    cumulative_months?: number;
    duration_months?: number;
    bits?: number;
    from_broadcaster_user_name?: string;
    viewers?: number;
    user_input?: string;
    reward?: {
      title: string;
    };
  };
  subscription: {
    id: string;
    type: string;
    created_at: string;
  };
}

export default function NotificationLog({
  twitchUserInfo,
}: NotificationLogProps) {
  const [log, setLog] = useState<TwitchNotification[]>([]);
  const [highWater, setHighWater] = useState<string>();

  const getNotificationLog = () =>
    fetch(`/api/alerts/${twitchUserInfo.username?.toLowerCase()}/log`)
      .then((res) => res.json())
      .then((res) => setLog(res.data.reverse()))
      .catch(console.error);

  useEffect(() => {
    if (twitchUserInfo.username) {
      getNotificationLog();
      const messageSource = new EventSource(
        `/api/alerts/${twitchUserInfo.username.toLowerCase()}/feed`
      );

      messageSource.onmessage = () => getNotificationLog();
    }
  }, [twitchUserInfo.username]);

  const handleHighWaterClick = (id: string) => setHighWater(id);

  return (
    <div>
      <h4>Notifications</h4>
      <ul className={styles.notificationList}>
        {log.map((notification) => (
          <NotificationLogEntry
            onClick={handleHighWaterClick}
            className={
              highWater === notification.subscription.id
                ? styles.highWater
                : undefined
            }
            key={notification.subscription.id}
            {...notification}
          />
        ))}
      </ul>
    </div>
  );
}
