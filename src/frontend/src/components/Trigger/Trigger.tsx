import CustomBehaviorControls from "../CustomBehaviorControls/CustomBehaviorControls";
import Button from "../Button/Button";

import styles from "./Trigger.module.css";
import Toggle from "../Toggle/Toggle";
import { ChangeEvent, FormEvent, useState } from "react";

export interface iTrigger {
  keyword: string;
  isEnabled: boolean;
  behaviors?: {
    behavior: string;
    response?: string;
    src?: string;
  }[];
  isCaseSensitive: boolean;
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
  isCaseSensitive,
}: TriggerProps) {
  const [editedIsCaseSensitive, setEditedIsCaseSensitive] =
    useState(isCaseSensitive);
  const [isEditingCaseSensitive, setIsEditingCaseSensitive] = useState(false);
  const saveProperty = async (property: { name: string; value: any }) => {
    await fetch(
      `/api/triggers/${twitchUserInfo.username?.toLowerCase()}/${keyword}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [property.name]: property.value,
        }),
      }
    );
    onChange();
  };
  const handleCaseSensitiveChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEditedIsCaseSensitive(e.target.checked);
  const handleCaseSensitiveCancelClick = () => {
    setEditedIsCaseSensitive(isCaseSensitive);
    setIsEditingCaseSensitive(false);
  };
  const handleCaseSensitiveSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    saveProperty({ name: "isCaseSensitive", value: editedIsCaseSensitive });
    setIsEditingCaseSensitive(false);
  };
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
      <form onSubmit={handleCaseSensitiveSubmit}>
        Case Sensitivity{" "}
        {!isEditingCaseSensitive && (
          <Button onClick={() => setIsEditingCaseSensitive(true)}>Edit</Button>
        )}
        {isEditingCaseSensitive && (
          <Button weight="secondary" type="submit">
            Save
          </Button>
        )}
        {isEditingCaseSensitive && (
          <Button onClick={handleCaseSensitiveCancelClick}>Cancel</Button>
        )}
        <Toggle
          disabled={!isEditingCaseSensitive}
          onChange={handleCaseSensitiveChange}
          state={editedIsCaseSensitive}
        >
          {editedIsCaseSensitive ? "Case Sensitive" : "Not Case Sensitive"}
        </Toggle>
      </form>
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
