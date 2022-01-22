import CustomBehaviorControls from "../CustomBehaviorControls/CustomBehaviorControls";
import Button from "../Button/Button";

import styles from "./Trigger.module.css";
import Toggle from "../Toggle/Toggle";
import { ChangeEvent } from "react";

export interface iTrigger {
  keyword: string;
  isEnabled: boolean;
  behaviors?: {
    behavior: string;
    response?: string;
    src?: string;
  }[];
}

interface TriggerProps extends iTrigger {
  twitchUserInfo: {
    username?: string;
  };
  remove: Function;
  onChange: Function;
}

export default function Trigger({
  keyword,
  behaviors,
  twitchUserInfo,
  remove,
  isEnabled,
  onChange,
}: TriggerProps) {
  const handleRemove = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure you want to remove this Trigger?")) {
      remove({ keyword, behaviors });
    }
  };

  const toggleTriggerIsEnabled = async (e: ChangeEvent<HTMLInputElement>) => {
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
    onChange();
  };

  return (
    <>
      <div className={styles.header}>
        <h3 className={styles.keyword}>{keyword}</h3>
        <Toggle state={isEnabled} onChange={toggleTriggerIsEnabled}>
          {isEnabled ? "On" : "Off"}
        </Toggle>
      </div>
      <CustomBehaviorControls
        category="triggers"
        name={keyword}
        formattedName={keyword}
        twitchUserInfo={twitchUserInfo}
      />
      <Button weight="danger" onClick={handleRemove}>
        Remove Trigger
      </Button>
    </>
  );
}
