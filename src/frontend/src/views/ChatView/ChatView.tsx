import { useEffect, useState } from "react";
import EditableProperty from "../../components/EditableProperty/EditableProperty";
import styles from "./ChatView.module.css";

interface ChatViewProps {
  twitchUserInfo?: {
    username?: string;
  };
}

function getChatStyles(username: string) {
  return fetch(`/api/chat/${username.toLowerCase()}/styles`)
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

export default function ChatView({ twitchUserInfo }: ChatViewProps) {
  const [chatStyles, setChatStyles] = useState("");

  useEffect(() => {
    if (twitchUserInfo?.username) {
      getChatStyles(twitchUserInfo?.username).then((res) => {
        setChatStyles(res);
      });
    }
  }, [twitchUserInfo?.username]);

  /// @ts-expect-error
  const handleStylesChange = (e: ChangeEvent) => setChatStyles(e.target.value);

  const handleSaveStyles = async () => {
    const formattedStyles = chatStyles
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

    await fetch(`/api/chat/${twitchUserInfo?.username?.toLowerCase()}/styles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedStyles),
    });

    getChatStyles(twitchUserInfo?.username!).then((res) => setChatStyles(res));
  };
  return (
    <>
      <h1>Chat</h1>
      <p>Here you can configure on-stream chat.</p>
      <p>
        To display chat on-stream add a Browser Source in OBS and set the URL to{" "}
        <span className={styles.code}>
          {window.location.origin}/chat/
          {twitchUserInfo?.username?.toLowerCase()}
        </span>
        . You can then customize the size and styles in OBS.
      </p>
      <span>Classes available to style are:</span>
      <ul>
        <li>
          <span className={styles.code}>#chat-container</span>
        </li>
        <li>
          <span className={styles.code}>.identity</span>
        </li>
        <li>
          <span className={styles.code}>.message</span>
        </li>
        <li>
          Any other classes you add to your configuration (it takes valid HTML)
        </li>
      </ul>
      <p>You can also set your custom styles on this page.</p>
      <h2>Configuration</h2>
      <EditableProperty
        name="styles"
        type="textarea"
        helper={
          <p>
            Define how your chat display looks using{" "}
            <a href="https://developer.mozilla.org/en-US/docs/Web/CSS">CSS</a>.
          </p>
        }
        value={chatStyles}
        onChange={handleStylesChange}
        save={handleSaveStyles}
      />
    </>
  );
}
