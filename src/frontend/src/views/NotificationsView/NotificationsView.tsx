import { useEffect, useState } from "react";
import EditableValue from "../../components/EditableProperty/EditableProperty";

import styles from "./NotificationsView.module.css";

interface NotificationsViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

interface NotificationStrings {
  [key: string]: any;
}

interface TokenMap {
  [key: string]: string[];
}

const tokens: TokenMap = {
  alwaysTokens: ["%user_name%", "%broadcaster_user_name%"],
  followTokens: [],
  newsubTokens: ["%tier%"],
  resubTokens: [
    "%cumulative_months%",
    "%streak_months%",
    "%tier%",
    "%message%",
    "%duration_months%",
  ],
  channelGiftTokens: ["%total%", "%tier%", "%cumulative_total%"],
  cheerTokens: ["%bits%", "%message%"],
  raidTokens: ["%from_broadcaster_user_name%", "%viewers%"],
  redemptionTokens: [
    "%user_input%",
    "%reward.title%",
    "%reward.prompt%",
    "%reward.cost%",
  ],
};

function getOtherTokens(type: string) {
  const matches = type.match(/[A-Z]/gm)!;

  const prefix = type.substring(0, type.indexOf(matches.shift()!));

  const [key] = Object.keys(tokens).filter((key) => key.startsWith(prefix));

  return tokens[key];
}

export default function NotificationsView({
  twitchUserInfo,
}: NotificationsViewProps) {
  const [notificationStrings, setNotificationStrings] =
    useState<NotificationStrings>({});
  const getNotifications = () =>
    fetch(`/api/notifications/${twitchUserInfo.username?.toLowerCase()}`)
      .then((res) => res.json())
      .then((json) => setNotificationStrings(json.data));

  const saveString = (string: { name: string; value: string }) => {
    fetch(`/api/notifications/${twitchUserInfo.username?.toLowerCase()}`, {
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
      <ul className={styles.notificationList}>
        {Object.values(prefixGrouped).map((group) => (
          <div key={group.toString()} className={styles.prefixGroup}>
            {group.map((type) => (
              <li className={styles.notificationItem} key={type}>
                <EditableValue
                  key={type}
                  name={type}
                  value={notificationStrings[type]}
                  save={saveString}
                  type="textarea"
                />
                {type !== "timeoutInMillis" && (
                  <div className={styles.helper} key={type + "Tokens"}>
                    <p>You have access to the following tokens:</p>
                    <div className={styles.tokenContainer}>
                      {[...tokens.alwaysTokens, ...getOtherTokens(type)].map(
                        (token) => (
                          <pre key={type + token} className={styles.token}>
                            {token}
                          </pre>
                        )
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </div>
        ))}
      </ul>
    </>
  );
}
