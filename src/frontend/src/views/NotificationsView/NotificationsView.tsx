import { useEffect, useState } from "react";
import EditableValue from "../../components/EditableProperty/EditableProperty";
import CustomBehaviorControls from "./CustomBehaviorControls/CustomBehaviorControls";

import notifications from "./testNotifications";
import {
  getHumanGroupHeader,
  tokens,
  getOtherTokens,
  getHumanGroupName,
} from "./notificationViewUtils";
import styles from "./NotificationsView.module.css";
import Button from "../../components/Button/Button";

interface NotificationsViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

interface NotificationStrings {
  [key: string]: any;
}

function generateSendTestNotification(groupName: string, username: string) {
  return () => {
    if (groupName === "timeout") {
      return;
    }
    return fetch("/eventsub", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Twitch-Eventsub-Message-Type": "notification",
      },
      body: JSON.stringify(
        (notifications as { [key: string]: any })[
          groupName === "new" ? "subscribe" : groupName
        ]
      ),
    });
  };
}

export default function NotificationsView({
  twitchUserInfo,
}: NotificationsViewProps) {
  const [notificationStrings, setNotificationStrings] =
    useState<NotificationStrings>({});
  const getNotifications = () =>
    fetch(`/api/alerts/${twitchUserInfo.username?.toLowerCase()}`)
      .then((res) => res.json())
      .then((json) => setNotificationStrings(json.data));

  const saveString = (string: { name: string; value: string }) => {
    fetch(`/api/alerts/${twitchUserInfo.username?.toLowerCase()}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(string),
    }).then(() => {
      getNotifications();
    });
  };

  useEffect(() => {
    if (twitchUserInfo.username) {
      getNotifications();
    }
  }, [twitchUserInfo.username]);

  const prefixGrouped = Object.keys(notificationStrings).reduce(
    (acc: { [key: string]: string[] }, string) => {
      const matches = string.match(/[A-Z]/gm)!;
      const prefix = string.substring(0, string.indexOf(matches.shift()!));

      const prefixArray: string[] = [];

      Object.keys(notificationStrings).forEach((notificationString: string) => {
        if (notificationString.startsWith(prefix)) {
          prefixArray.push(notificationString);
        }
      });
      acc[prefix] = prefixArray;
      return acc;
    },
    {}
  );

  return (
    <>
      <h1>Notifications</h1>
      <p>
        This is where you can control the notifications that show up at{" "}
        <span className={styles.code}>/alerts/:userName</span>. You can define
        custom strings using the tokens listed below each message and then the
        tokens will be replaced with data from Twitch's API
      </p>
      <h2>Configuration</h2>
      <ul className={styles.notificationList}>
        {Object.keys(prefixGrouped).map((groupName) => (
          <div key={groupName} className={styles.prefixGroup}>
            {getHumanGroupHeader(groupName)}
            <Button
              weight="secondary"
              onClick={generateSendTestNotification(
                groupName,
                twitchUserInfo.username!
              )}
            >
              Send Test Notification
            </Button>
            {prefixGrouped[groupName].map((type) => (
              <li className={styles.notificationItem} key={type}>
                <EditableValue
                  key={type}
                  name={type}
                  value={notificationStrings[type]}
                  save={saveString}
                  type="textarea"
                  helper={
                    type !== "timeoutInMillis" && (
                      <>
                        <p>You have access to the following tokens:</p>
                        <div className={styles.tokenContainer}>
                          {[
                            ...tokens.alwaysTokens,
                            ...getOtherTokens(type),
                          ].map((token) => (
                            <pre key={type + token} className={styles.token}>
                              {token}
                            </pre>
                          ))}
                        </div>
                      </>
                    )
                  }
                />
              </li>
            ))}
            <CustomBehaviorControls
              name={groupName}
              formattedName={getHumanGroupName(groupName)}
              twitchUserInfo={twitchUserInfo}
            />
          </div>
        ))}
      </ul>
    </>
  );
}
