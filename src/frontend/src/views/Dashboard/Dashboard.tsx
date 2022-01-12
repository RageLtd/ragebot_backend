import { ChangeEvent, useEffect, useState } from "react";
import Spinner from "../../components/Spinner/Spinner";
import Toggle from "../../components/Toggle/Toggle";

import styles from "./Dashboard.module.css";

interface DashboardViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

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

export default function DashboardView({ twitchUserInfo }: DashboardViewProps) {
  const [isRagebotEnabled, setRagebotEnabled] = useState(false);
  const [isLoadingRagebot, setIsLoadingRagebot] = useState(true);

  useEffect(() => {
    if (twitchUserInfo.username) {
      getRagebotEnabled(twitchUserInfo.username).then((state) => {
        setRagebotEnabled(state);
        setIsLoadingRagebot(false);
      });
    }
  }, [twitchUserInfo.username]);

  const setRagebot = (e: ChangeEvent) => {
    setIsLoadingRagebot(true);

    /// @ts-expect-error
    setRagebotRemote(e.target.checked, twitchUserInfo.username!).then((res) => {
      setRagebotEnabled(res);
      setIsLoadingRagebot(false);
    });
  };
  return (
    <div>
      <Toggle
        disabled={isLoadingRagebot}
        state={isRagebotEnabled}
        onChange={setRagebot}
      >
        Ragebot {isRagebotEnabled ? "On" : "Off"}
        {isLoadingRagebot && <Spinner className={styles.spinner} />}
      </Toggle>
      <p>Holy shit auth is working</p>
      <p>Username: {twitchUserInfo?.username}</p>
    </div>
  );
}
