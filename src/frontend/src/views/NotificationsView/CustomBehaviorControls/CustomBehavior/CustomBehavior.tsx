import { remove } from "lodash";
import Button from "../../../../components/Button/Button";
import EditableValue from "../../../../components/EditableProperty/EditableProperty";
import { getAdditionalBehaviorOptions } from "../AddNewCustomBehaviorForm/AddNewCustomBehaviorForm";
import { Behavior } from "../CustomBehaviorControls";

import styles from "./CustomBehavior.module.css";

interface CustomBehaviorProps extends Behavior {
  save: Function;
  remove: Function;
  behaviorType: string;
}

export default function CustomBehavior({
  save,
  behaviorType,
  remove,
  ...behavior
}: CustomBehaviorProps) {
  const handleRemoveCustomBehavior = () => {
    remove(behavior);
  };
  return (
    <li>
      <div className={styles.nameContainer}>
        {<EditableValue value={behavior.name} save={save} name="name" />}
        <Button
          className={styles.removeButton}
          weight="danger"
          onClick={handleRemoveCustomBehavior}
        >
          Remove
        </Button>
      </div>
      <details>
        {Object.keys(behavior)
          .slice(1)
          .filter((key) => behavior[key] !== "")
          .map((prop) => {
            if (prop === "behavior") {
              return (
                <EditableValue
                  type="select"
                  options={
                    <>
                      <option value="sound">Play Sound</option>
                      <option value="say">Post to chat</option>
                      {getAdditionalBehaviorOptions(behaviorType)}
                    </>
                  }
                  name={prop}
                  value={behavior[prop]}
                  save={save}
                />
              );
            }
            return (
              <EditableValue
                type={prop === "response" ? "textarea" : undefined}
                name={prop}
                value={behavior[prop]}
                save={save}
              />
            );
          })}
      </details>
    </li>
  );
}
