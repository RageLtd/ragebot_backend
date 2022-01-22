import { ChangeEvent, useEffect, useState } from "react";
import Toggle from "../../../components/Toggle/Toggle";
import { iTrigger } from "../../../components/Trigger/Trigger";
import { getTriggers } from "../../TriggersView/TriggersView";

import styles from "./TriggerToggles.module.css";

interface TriggerTogglesProps {
  twitchUserInfo: {
    username?: string;
  };
}

export default function TriggerToggles({
  twitchUserInfo,
}: TriggerTogglesProps) {
  const [triggers, setTriggers] = useState<iTrigger[]>([]);

  useEffect(() => {
    if (twitchUserInfo.username) {
      getTriggers(twitchUserInfo.username).then((res) => setTriggers(res.data));
    }
  }, [twitchUserInfo.username]);

  const generateToggleTriggerIsEnabled =
    (keyword: string) => async (e: ChangeEvent<HTMLInputElement>) => {
      await fetch(
        `/api/triggers/${twitchUserInfo.username?.toLowerCase()}/${keyword}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isEnabled: e.target.checked }),
        }
      );
      getTriggers(twitchUserInfo.username!).then((res) =>
        setTriggers(res.data)
      );
    };
  return (
    <div className={styles.container}>
      <h4>Triggers</h4>
      <ul className={styles.triggerList}>
        {triggers.map(({ isEnabled, keyword }) => (
          <li key={keyword} className={styles.triggerItem}>
            {keyword}
            <Toggle
              state={isEnabled}
              onChange={generateToggleTriggerIsEnabled(keyword)}
            >
              {isEnabled ? "On" : "Off"}
            </Toggle>
          </li>
        ))}
      </ul>
    </div>
  );
}
