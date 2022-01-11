import { useEffect, useState } from "react";
import Button from "../../../components/Button/Button";
import AddNewCustomBehaviorForm from "./AddNewCustomBehaviorForm/AddNewCustomBehaviorForm";
import CustomBehavior from "./CustomBehavior/CustomBehavior";

interface CustomBehaviorControlsProps {
  name: string;
  formattedName: string;
  twitchUserInfo: {
    username?: string;
  };
}

export interface Behavior {
  [key: string]: any;
  name: string;
}

export default function CustomBehaviorControls({
  name,
  formattedName,
  twitchUserInfo,
}: CustomBehaviorControlsProps) {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [isAddingBehavior, setIsAddingBehavior] = useState(false);

  const getBehaviors = async (username: string, categoryName: string) => {
    const { data } = await fetch(
      `/api/alerts/${username.toLowerCase()}/behaviors/${name}`
    ).then((res) => res.json());
    setBehaviors(data);
  };

  useEffect(() => {
    if (twitchUserInfo.username) {
      getBehaviors(twitchUserInfo.username, name);
    }
  }, [twitchUserInfo.username, name]);

  const handleAddBehaviorClick = () => setIsAddingBehavior(true);
  const handleCancelAddBehavior = () => setIsAddingBehavior(false);

  const addNewBehavior = async (behavior: Behavior) => {
    await fetch(
      `/api/alerts/${twitchUserInfo.username?.toLowerCase()}/behaviors/${name}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(behavior),
      }
    ).catch(console.error);

    getBehaviors(twitchUserInfo.username!, name);
  };

  const updateBehaviorProperty = (property: { name: string; value: any }) =>
    console.log(property);

  return (
    <div>
      <h4>{formattedName} Custom Behaviors</h4>
      {!isAddingBehavior && (
        <Button weight="secondary" onClick={handleAddBehaviorClick}>
          Add New Behavior
        </Button>
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
        {behaviors.map((behavior) => (
          <CustomBehavior
            key={behavior.name}
            {...behavior}
            save={updateBehaviorProperty}
            behaviorType={name}
          />
        ))}
      </ul>
    </div>
  );
}
