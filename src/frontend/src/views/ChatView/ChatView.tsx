import styles from "./ChatView.module.css";

interface ChatViewProps {
  twitchUserInfo?: {
    username?: string;
  };
}

export default function ChatView({ twitchUserInfo }: ChatViewProps) {
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
    </>
  );
}
