import { ChangeEvent, useEffect, useState } from "react";
import CustomBehaviorControls from "../../components/CustomBehaviorControls/CustomBehaviorControls";

import notifications from "./testNotifications";
import {
  getHumanGroupHeader,
  tokens,
  getOtherTokens,
  getHumanGroupName,
} from "./notificationViewUtils";
import styles from "./NotificationsView.module.css";
import Button from "../../components/Button/Button";
import EditableProperty from "../../components/EditableProperty/EditableProperty";

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

function getNotificationStyles(username: string) {
  return fetch(`/api/alerts/${username.toLowerCase()}/styles`)
    .then((res) => res.json())
    .then((res) => {
      const formattedStyles = Object.keys(res)
        .map((selector) => {
          let value = res[selector];
          if (typeof value === "object") {
            value = Object.keys(res[selector])
              .map((name) => `${name}: ${res[selector][name]};`)
              .join("\r\n");
          }
          return `${selector} ${value}`;
        })
        .join("\n");
      return formattedStyles;
    });
}

export default function NotificationsView({
  twitchUserInfo,
}: NotificationsViewProps) {
  const [notificationStrings, setNotificationStrings] =
    useState<NotificationStrings>({});
  const [notificationStyles, setNotificationStyles] = useState("");

  const handleStylesChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setNotificationStyles(e.target.value);

  const handleSaveStyles = async () => {
    const formattedStyles = notificationStyles
      .split("}")
      .map((string) => (string + "}").trim())
      .slice(0, -1)
      .map((string) => {
        const separated = string.split("{");
        separated[1] = `{${separated[1]}`;
        return separated;
      })
      .reduce((acc: { [key: string]: string }, style) => {
        acc[style[0].trim()] = style[1]
          .split(": ")
          .map((string, idx) => {
            if ((idx + 1) % 2 === 0 && !string.includes(";")) {
              return `${string.slice(
                0,
                string.lastIndexOf(" ")
              )};${string.slice(string.lastIndexOf(" "))}`;
            }
            return string;
          })
          .join(": ");
        return acc;
      }, {});

    await fetch(
      `/api/alerts/${twitchUserInfo?.username?.toLowerCase()}/styles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedStyles),
      }
    );

    getNotificationStyles(twitchUserInfo?.username!).then((res) =>
      setNotificationStyles(res)
    );
  };

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
      getNotificationStyles(twitchUserInfo.username).then((res) =>
        setNotificationStyles(res)
      );
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

  const stylesHelper = (
    <>
      <span>Classes available to style are:</span>
      <ul className={styles.tokenContainer}>
        <li>
          <pre className={styles.code}>.prefix</pre>
        </li>
        <li>
          <pre className={styles.code}>.postfix</pre>
        </li>
        <li>
          <pre className={styles.code}>.message</pre>
        </li>
        {Object.values(tokens)
          .reduce((acc, tokenArr) => {
            acc.push(...tokenArr);
            return acc;
          }, [])
          .map((token) => (
            <li>
              <pre className={styles.code}>.{token.slice(1, -1)}</pre>
            </li>
          ))}
        <li>
          Any other classes you add to your configuration (it takes valid HTML)
        </li>
      </ul>
    </>
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
      <p>
        To have your notifications show up on stream add a Browser Source in OBS
        and set the URL to{" "}
        <span className={styles.code}>
          {window.location.origin}/alerts/
          {twitchUserInfo.username?.toLowerCase()}
        </span>
        . You can then configure the size and any custom styling within OBS
        itself.
      </p>
      <h2>Configuration</h2>
      <EditableProperty
        name="styles"
        type="textarea"
        helper={
          <>
            <p>
              Define how your notification display looks using{" "}
              <a href="https://developer.mozilla.org/en-US/docs/Web/CSS">CSS</a>
              .
            </p>
            {stylesHelper}
          </>
        }
        value={notificationStyles}
        onChange={handleStylesChange}
        save={handleSaveStyles}
      />
      <ul className={styles.notificationList}>
        {Object.keys(prefixGrouped).map((groupName) => (
          <div key={groupName} className={styles.prefixGroup}>
            <div>
              {getHumanGroupHeader(groupName)}
              <Button
                weight="secondary"
                className={styles.testButton}
                onClick={generateSendTestNotification(
                  groupName,
                  twitchUserInfo.username!
                )}
              >
                Send Test Notification
              </Button>
            </div>
            {prefixGrouped[groupName].map((type) => (
              <li className={styles.notificationItem} key={type}>
                <EditableProperty
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
              category="alerts"
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
