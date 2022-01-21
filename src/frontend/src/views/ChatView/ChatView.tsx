import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useState,
} from "react";
import Button from "../../components/Button/Button";
import EditableProperty from "../../components/EditableProperty/EditableProperty";
import Input from "../../components/Input/Input";
import styles from "./ChatView.module.css";

interface ChatViewProps {
  twitchUserInfo?: {
    username: string;
  };
}

async function getChatStyles(username: string) {
  const res = await fetch(`/api/chat/${username.toLowerCase()}/styles`);
  const json = await res.json();
  const formattedStyles = Object.keys(json)
    .map((selector) => {
      let value = json[selector];
      if (typeof value === "object") {
        value = Object.keys(json[selector])
          .map((name) => `${name}: ${json[selector][name]};`)
          .join("\r\n");
      }
      return `${selector} ${value}`;
    })
    .join("\n");
  return formattedStyles;
}

async function getAllowList(username: string) {
  const res = await fetch(`/api/chat/${username.toLowerCase()}/allowlist`);
  return await res.json().then((res) => res.data);
}

async function getBlockList(username: string) {
  const res = await fetch(`/api/chat/${username.toLowerCase()}/blocklist`);
  return await res.json().then((res) => res.data);
}

export default function ChatView({ twitchUserInfo }: ChatViewProps) {
  const [chatStyles, setChatStyles] = useState("");
  const [blockList, setBlockList] = useState<string[]>([]);
  const [allowList, setAllowList] = useState<string[]>([]);
  const [newAllowlistEntry, setNewAllowlistEntry] = useState("");
  const [newBlocklistEntry, setNewBlocklistEntry] = useState("");

  useEffect(() => {
    if (twitchUserInfo?.username) {
      getChatStyles(twitchUserInfo.username).then((res) => {
        setChatStyles(res);
      });
      getAllowList(twitchUserInfo.username).then((res) => setAllowList(res));
      getBlockList(twitchUserInfo.username).then((res) => setBlockList(res));
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

  const handleNewBlocklistEntryChange = (e: ChangeEvent) =>
    /// @ts-expect-error
    setNewBlocklistEntry(e.target.value);

  const addNewBlocklistEntry = async () => {
    await fetch(
      `/api/chat/${twitchUserInfo!.username.toLowerCase()}/blocklist`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: newBlocklistEntry,
        }),
      }
    );

    getBlockList(twitchUserInfo!.username).then((res) => setBlockList(res));
    setNewBlocklistEntry("");
  };

  const generateRemoveBlocklistEntry = (value: string) => async () => {
    await fetch(
      `/api/chat/${twitchUserInfo!.username.toLowerCase()}/blocklist`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      }
    );
    getBlockList(twitchUserInfo!.username).then((res) => setBlockList(res));
  };

  const handleNewAllowlistEntryChange = (e: ChangeEvent) =>
    /// @ts-expect-error
    setNewAllowlistEntry(e.target.value);

  const addNewAllowlistEntry = async () => {
    await fetch(
      `/api/chat/${twitchUserInfo!.username.toLowerCase()}/allowlist`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: newAllowlistEntry,
        }),
      }
    );

    getAllowList(twitchUserInfo!.username).then((res) => setAllowList(res));
    setNewAllowlistEntry("");
  };

  const generateRemoveAllowlistEntry = (value: string) => async () => {
    await fetch(
      `/api/chat/${twitchUserInfo!.username.toLowerCase()}/allowlist`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      }
    );

    getAllowList(twitchUserInfo!.username).then((res) => setAllowList(res));
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
      <h3>Allowlist</h3>
      <label>
        New entry
        <Input
          helper="A new entry for the allow list"
          postfix={<Button onClick={addNewAllowlistEntry}>Add</Button>}
        >
          <input
            value={newAllowlistEntry}
            onChange={handleNewAllowlistEntryChange}
            onKeyDown={(e: KeyboardEvent) => {
              /// @ts-expect-error
              if (e.key === "Enter" && e.target.value !== "") {
                addNewAllowlistEntry();
              }
            }}
          />
        </Input>
      </label>
      <ul className={styles.list}>
        {allowList.map((word) => (
          <li key={`allowlist_${word}`} className={styles.listItem}>
            {word}
            <Button
              weight="danger"
              onClick={generateRemoveAllowlistEntry(word)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <h3>Blocklist</h3>
      <label>
        New entry
        <Input
          helper="A new entry for the block list"
          postfix={<Button onClick={addNewBlocklistEntry}>Add</Button>}
        >
          <input
            value={newBlocklistEntry}
            onChange={handleNewBlocklistEntryChange}
            onKeyDown={(e: KeyboardEvent) => {
              /// @ts-expect-error
              if (e.key === "Enter" && e.target.value !== "") {
                addNewBlocklistEntry();
              }
            }}
          />
        </Input>
      </label>
      <ul className={styles.list}>
        {blockList.map((word) => (
          <li key={`blocklist_${word}`} className={styles.listItem}>
            {word}
            <Button
              weight="danger"
              onClick={generateRemoveBlocklistEntry(word)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
