import { useEffect, useState } from "react";
import Button from "../Button/Button";
import AddNewCustomBehaviorForm from "./AddNewCustomBehaviorForm/AddNewCustomBehaviorForm";
import CustomBehavior from "./CustomBehavior/CustomBehavior";

import styles from "./CustomBehaviorControls.module.css";

interface CustomBehaviorControlsProps {
  category: string;
  name: string;
  formattedName: string;
  twitchUserInfo: {
    username?: string;
  };
}

export interface Behavior {
  [key: string]: any;
  name: string;
  modOnly: boolean;
  subOnly: boolean;
}

export default function CustomBehaviorControls({
  category,
  name,
  formattedName,
  twitchUserInfo,
}: CustomBehaviorControlsProps) {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [isAddingBehavior, setIsAddingBehavior] = useState(false);

  const getBehaviors = async (username: string) => {
    const { data } = await fetch(
      `/api/${category}/${username.toLowerCase()}/behaviors/${name}`
    ).then((res) => res.json());
    setBehaviors(data || []);
  };

  useEffect(() => {
    if (twitchUserInfo.username) {
      getBehaviors(twitchUserInfo.username);
    }
  }, [twitchUserInfo.username, name]);

  const handleAddBehaviorClick = () => setIsAddingBehavior(true);
  const handleCancelAddBehavior = () => setIsAddingBehavior(false);

  const addNewBehavior = async (behavior: Behavior) => {
    await fetch(
      `/api/${category}/${twitchUserInfo.username?.toLowerCase()}/behaviors/${name}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(behavior),
      }
    ).catch(console.error);

    getBehaviors(twitchUserInfo.username!);
  };

  const removeCustomBehavior = async (behavior: Behavior) => {
    await fetch(
      `/api/${category}/${twitchUserInfo.username?.toLowerCase()}/behaviors/${name}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(behavior),
      }
    ).catch(console.error);

    getBehaviors(twitchUserInfo.username!);
  };

  const updateBehaviorProperty = async ({
    propertyName,
    behaviorName,
    value,
  }: {
    behaviorName: string;
    propertyName: string;
    value: any;
  }) => {
    let payload = { [propertyName]: value };
    if (propertyName === "permissions") {
      payload = Object.keys(value).reduce(
        (acc: { [key: string]: any }, key) => {
          acc[key] = value[key];
          return acc;
        },
        {}
      );
    }
    await fetch(
      `/api/${category}/${twitchUserInfo.username?.toLowerCase()}/behaviors/${name}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, behaviorName }),
      }
    );

    getBehaviors(twitchUserInfo.username!.toLowerCase());
  };

  return (
    <div>
      <h4 className={styles.title}>{formattedName} Custom Behaviors</h4>
      {!isAddingBehavior && (
        <Button onClick={handleAddBehaviorClick}>Add New Behavior</Button>
      )}
      {isAddingBehavior && (
        <AddNewCustomBehaviorForm
          save={addNewBehavior}
          cancel={handleCancelAddBehavior}
          type={name}
          twitchUserInfo={twitchUserInfo}
        />
      )}
      <ul>
        {behaviors.length === 0 && <li>No custom behaviors added</li>}
        {behaviors
          .map(({ commandName, ...rest }) => rest)
          .map((behavior) => (
            <CustomBehavior
              key={behavior.name}
              {...behavior}
              save={updateBehaviorProperty}
              remove={removeCustomBehavior}
              behaviorType={name}
            />
          ))}
      </ul>
    </div>
  );
}
