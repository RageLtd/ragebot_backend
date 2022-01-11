import EditableValue from "../../../../components/EditableProperty/EditableProperty";
import { getAdditionalBehaviorOptions } from "../AddNewCustomBehaviorForm/AddNewCustomBehaviorForm";
import { Behavior } from "../CustomBehaviorControls";

interface CustomBehaviorProps extends Behavior {
  save: Function;
  behaviorType: string;
}

export default function CustomBehavior({
  save,
  behaviorType,
  ...behavior
}: CustomBehaviorProps) {
  return (
    <li>
      {<EditableValue value={behavior.name} save={save} name="name" />}
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
