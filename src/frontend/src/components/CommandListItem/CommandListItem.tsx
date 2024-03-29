import { ChangeEvent, FormEvent, MouseEvent, useState } from "react";
import { Command } from "../../views/Commands/CommandsView";
import Button from "../Button/Button";
import CustomBehaviorControls from "../CustomBehaviorControls/CustomBehaviorControls";
import EditableProperty from "../EditableProperty/EditableProperty";
import RadioInput from "../RadioInput/RadioInput";
import Toggle from "../Toggle/Toggle";

import styles from "./CommandListItem.module.css";

interface CommandListItemProps extends Command {
  username: string;
  removeCommand: Function;
  setCommandEnabled: Function;
}

function getHelperText(property: string) {
  switch (property) {
    case "name":
      return "The name of your command";
    case "behavior":
      return "Commands can trigger a response, a count or be auto-run on a timer";
    case "response":
      return "What reponse would you like to see in chat?";
    case "permissions":
      return "Who should be able to trigger the command?";
  }
}

function getPropertyType(name: string) {
  switch (name) {
    case "behavior":
      return "select";
    case "response":
      return "textarea";
    default:
      return "input";
  }
}

export default function CommandListItem({
  username,
  removeCommand,
  setCommandEnabled,
  isEnabled,
  ...command
}: CommandListItemProps) {
  const [modOnly, setModOnly] = useState(command.modOnly);
  const [subOnly, setSubOnly] = useState(command.subOnly);
  const [isCaseSensitive, setIsCaseSensitive] = useState(
    command.isCaseSensitive
  );
  const [isEditingCaseSensitive, setIsEditingCaseSensitive] = useState(false);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);

  const saveProperty = (property: { name: string; value: any }) => {
    return fetch(`/api/commands/${username}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...command,
        [property.name]: property.value,
      }),
    });
  };

  const handleRemoveClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // eslint-disable-next-line
    if (confirm(`Are you sure you want to delete "${command.name}?"`)) {
      removeCommand(command);
    }
  };

  const handlePermissionsChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "modonly") {
      setModOnly(true);
      setSubOnly(false);
    }

    if (e.target.value === "subonly") {
      setSubOnly(true);
      setModOnly(false);
    }

    if (e.target.value === "everyone") {
      setModOnly(false);
      setSubOnly(false);
    }
  };

  const handlePermissionsSave = async (e: FormEvent) => {
    e.stopPropagation();
    e.preventDefault();

    await Promise.all([
      saveProperty({ name: "modOnly", value: modOnly }),
      saveProperty({ name: "subOnly", value: subOnly }),
    ]);

    setIsEditingPermissions(false);
  };

  const handlePermissionsCancelClick = () => {
    setModOnly(command.modOnly);
    setSubOnly(command.subOnly);
    setIsEditingPermissions(false);
  };

  const handleSetCommandEnabled = async (e: ChangeEvent<HTMLInputElement>) => {
    setCommandEnabled(e.target.checked);
  };

  const handleCaseSensitiveChange = (e: ChangeEvent<HTMLInputElement>) =>
    setIsCaseSensitive(e.target.checked);
  const handleCaseSensitiveCancelClick = () => {
    setIsCaseSensitive(command.isCaseSensitive);
    setIsEditingCaseSensitive(false);
  };
  const handleCaseSensitiveSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    saveProperty({ name: "isCaseSensitive", value: isCaseSensitive });
    setIsEditingCaseSensitive(false);
  };

  return (
    <li>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h3>{`!${command.name}`}</h3>
          <Toggle state={isEnabled} onChange={handleSetCommandEnabled}>
            {isEnabled ? "On" : "Off"}
          </Toggle>
        </div>
        {Object.keys(command)
          .filter(
            (key) =>
              key !== "id" &&
              key !== "modOnly" &&
              key !== "subOnly" &&
              key !== "caseSensitive"
          )
          .map((property) => {
            return (
              <EditableProperty
                key={command.id + property}
                name={property}
                value={command[property]}
                save={saveProperty}
                type={getPropertyType(property)}
                helper={getHelperText(property)}
                options={
                  property === "behavior" ? (
                    <>
                      <option value="respond">Respond</option>
                      <option value="count">Count</option>
                      <option value="timer">Timer</option>
                    </>
                  ) : undefined
                }
              />
            );
          })}
        <div>
          Permissions:{" "}
          {!isEditingPermissions && (
            <Button onClick={() => setIsEditingPermissions(true)}>Edit</Button>
          )}
          {isEditingPermissions && (
            <Button weight="secondary" onClick={handlePermissionsSave}>
              Save
            </Button>
          )}
          {isEditingPermissions && (
            <Button onClick={handlePermissionsCancelClick}>Cancel</Button>
          )}
          <form
            onSubmit={handlePermissionsSave}
            className={styles.radioContainer}
          >
            <RadioInput
              name="permissions"
              value="modonly"
              onChange={handlePermissionsChange}
              checked={modOnly}
              disabled={!isEditingPermissions}
            >
              Mod Only
            </RadioInput>
            <RadioInput
              name="permissions"
              value="subonly"
              onChange={handlePermissionsChange}
              checked={subOnly}
              disabled={!isEditingPermissions}
            >
              Sub Only
            </RadioInput>
            <RadioInput
              name="permissions"
              value="everyone"
              onChange={handlePermissionsChange}
              checked={!subOnly && !modOnly}
              disabled={!isEditingPermissions}
            >
              Anyone
            </RadioInput>
          </form>
          <div className={styles.helper}>
            Who should be able to trigger the command?
          </div>
          <form onSubmit={handleCaseSensitiveSubmit}>
            Case Sensitivity{" "}
            {!isEditingCaseSensitive && (
              <Button onClick={() => setIsEditingCaseSensitive(true)}>
                Edit
              </Button>
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
              state={isCaseSensitive}
            >
              {isCaseSensitive ? "Case Sensitive" : "Not Case Sensitive"}
            </Toggle>
          </form>
        </div>
        <CustomBehaviorControls
          category="commands"
          name={command.name}
          formattedName={`!${command.name}`}
          twitchUserInfo={{ username }}
        />
      </div>
      <Button weight="danger" onClick={handleRemoveClick}>
        Delete Command
      </Button>
    </li>
  );
}
