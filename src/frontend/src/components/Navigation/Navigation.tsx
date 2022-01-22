import { useAuth0 } from "@auth0/auth0-react";
import { ChangeEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../Button/Button";
import Spinner from "../Spinner/Spinner";
import Toggle from "../Toggle/Toggle";

import styles from "./Navigation.module.css";

async function getRagebotEnabled(username: string) {
  return fetch(`/api/ragebot/state/${username.toLowerCase()}`)
    .then((res) => res.text())
    .then((res) => res === "true");
}

async function setRagebotRemote(botEnabledState: boolean, username: string) {
  return fetch(`/api/ragebot/state/${username.toLowerCase()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ botEnabledState }),
  })
    .then((res) => res.text())
    .then((res) => res === "true");
}

interface NavigationProps {
  twitchUserInfo: {
    username?: string;
  };
}

export default function Navigation({ twitchUserInfo }: NavigationProps) {
  const [isRagebotEnabled, setRagebotEnabled] = useState(false);
  const [isLoadingRagebot, setIsLoadingRagebot] = useState(true);
  const { logout } = useAuth0();
  const handleLogout = () => logout({ returnTo: window.location.origin });
  useEffect(() => {
    if (twitchUserInfo.username) {
      getRagebotEnabled(twitchUserInfo.username).then((state) => {
        setRagebotEnabled(state);
        setIsLoadingRagebot(false);
      });
    }
  }, [twitchUserInfo.username]);

  const setRagebot = (e: ChangeEvent<HTMLInputElement>) => {
    setIsLoadingRagebot(true);

    setRagebotRemote(e.target.checked, twitchUserInfo.username!).then((res) => {
      setRagebotEnabled(res);
      setIsLoadingRagebot(false);
    });
  };
  return (
    <nav className={styles.nav}>
      <ul>
        <li className={styles.navItem}>
          <Link to="/">Dashboard</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/commands">Commands</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/triggers">Triggers</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/backlog">Backlog</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/notifications">Notifications</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/chat-config">Chat</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/integrations">Integrations</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/followers">Followers</Link>
        </li>
      </ul>
      <div>
        <Toggle
          disabled={isLoadingRagebot}
          state={isRagebotEnabled}
          onChange={setRagebot}
        >
          Ragebot {isRagebotEnabled ? "On" : "Off"}
          {isLoadingRagebot && <Spinner className={styles.spinner} />}
        </Toggle>
        <Button onClick={handleLogout}>Log out</Button>
      </div>
    </nav>
  );
}
