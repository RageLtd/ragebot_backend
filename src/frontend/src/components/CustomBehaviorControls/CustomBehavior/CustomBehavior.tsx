import Button from "../../Button/Button";
import EditableProperty from "../../EditableProperty/EditableProperty";
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
  modOnly,
  subOnly,
  ...behavior
}: CustomBehaviorProps) {
  const handleRemoveCustomBehavior = () => {
    remove(behavior);
  };
  const handlePropertySave = ({
    value,
    name,
  }: {
    value: any;
    name: string;
  }) => {
    save({
      behaviorName: behavior.name,
      propertyName: name,
      value,
    });
  };
  return (
    <li>
      <div className={styles.nameContainer}>
        {<EditableProperty value={behavior.name} save={save} name="name" />}
        <Button
          className={styles.removeButton}
          weight="danger"
          onClick={handleRemoveCustomBehavior}
        >
          Remove
        </Button>
      </div>
      <details>
        {[
          ...Object.keys(behavior)
            .slice(1)
            .filter((key) => behavior[key] !== "")
            .map((prop) => {
              if (prop === "behavior") {
                return (
                  <EditableProperty
                    key={prop + "select"}
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
                    save={handlePropertySave}
                  />
                );
              }
              if (prop === "voice") {
                return (
                  <EditableProperty
                    key={prop + "select"}
                    name={prop}
                    type="select"
                    options={window.speechSynthesis.getVoices().map((v) => (
                      <option value={v.name}>{v.name}</option>
                    ))}
                    value={behavior[prop]}
                    save={handlePropertySave}
                  />
                );
              }
              return (
                <EditableProperty
                  key={prop + behavior[prop]}
                  type={prop === "response" ? "textarea" : undefined}
                  name={prop}
                  value={behavior[prop]}
                  save={handlePropertySave}
                />
              );
            }),
          <EditableProperty
            key="radiopermissions"
            type="radio"
            name="permissions"
            value={{ modOnly, subOnly, everyone: !modOnly && !subOnly }}
            save={handlePropertySave}
          />,
        ]}
      </details>
    </li>
  );
}
