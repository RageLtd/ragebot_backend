import { useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import Trigger, { iTrigger } from "../../components/Trigger/Trigger";
import AddNewTriggerForm from "./AddNewTriggerForm/AddNewTriggerForm";

interface TriggersViewProps {
  twitchUserInfo: {
    username?: string;
  };
}

export function getTriggers(username: string) {
  return fetch(`/api/triggers/${username.toLowerCase()}`).then((res) =>
    res.json()
  );
}

export default function TriggersView({ twitchUserInfo }: TriggersViewProps) {
  const [triggers, setTriggers] = useState<iTrigger[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    if (twitchUserInfo.username) {
      getTriggers(twitchUserInfo.username).then((res) => {
        setTriggers(res.data);
      });
    }
  }, [twitchUserInfo.username]);

  const handleNewTriggerClick = () => setIsAddingNew(true);
  const handleSubmit = async (trigger: iTrigger) => {
    await fetch(`/api/triggers/${twitchUserInfo.username?.toLowerCase()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trigger),
    });

    getTriggers(twitchUserInfo.username!).then((res) => setTriggers(res.data));
    setIsAddingNew(false);
  };

  const handleRemove = async (trigger: iTrigger) => {
    await fetch(
      `/api/triggers/${twitchUserInfo.username?.toLowerCase()}/${
        trigger.keyword
      }`,
      {
        method: "DELETE",
      }
    );

    getTriggers(twitchUserInfo.username!).then((res) => setTriggers(res.data));
  };
  const handleCancel = () => setIsAddingNew(false);

  const handleTriggerChange = () =>
    getTriggers(twitchUserInfo.username!).then((res) => setTriggers(res.data));

  return (
    <>
      <h1>Triggers</h1>
      <p>
        Triggers are behaviors that occur whenever a user enters a keyword in
        chat. They are similar to commands, but do not have any inherent
        behavior associated with them by default. You can enable custom
        behaviors in the configuration section below.
      </p>
      <h2>Configuration</h2>
      {!isAddingNew && (
        <Button onClick={handleNewTriggerClick}>New Trigger</Button>
      )}
      {isAddingNew && (
        <AddNewTriggerForm onSubmit={handleSubmit} onCancel={handleCancel} />
      )}
      <ul>
        {triggers.map((trigger) => (
          <Trigger
            key={trigger.keyword}
            {...trigger}
            twitchUserInfo={twitchUserInfo}
            remove={handleRemove}
            onChange={handleTriggerChange}
          />
        ))}
      </ul>
    </>
  );
}
