import { ChangeEvent, FormEvent, useState } from "react";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import RadioInput from "../../../components/RadioInput/RadioInput";

import styles from "./AddNewCommandForm.module.css";

interface AddNewCommandFormProps {
  onSubmit: Function;
  onCancel: Function;
}

export default function AddNewCommandForm({
  onSubmit,
  onCancel,
}: AddNewCommandFormProps) {
  const [timeoutInMillis, setTimeoutInMillis] = useState(0);
  const [modOnly, setModOnly] = useState(false);
  const [subOnly, setSubOnly] = useState(false);
  const [name, setName] = useState("");
  const [behavior, setBehavior] = useState("respond");
  const [response, setResponse] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit({
      name,
      behavior,
      response,
      modOnly,
      subOnly,
      timeoutInMillis,
    });
  };

  const handleCancel = () => onCancel();

  const handlePermissionsChange = (e: ChangeEvent) => {
    /// @ts-expect-error
    if (e.target.value === "modonly") {
      setModOnly(true);
      setSubOnly(false);
    }
    /// @ts-expect-error
    if (e.target.value === "subonly") {
      setSubOnly(true);
      setModOnly(false);
    }
    /// @ts-expect-error
    if (e.target.value === "everyone") {
      setModOnly(false);
      setSubOnly(false);
    }
  };

  const handleTimeoutChange = (e: ChangeEvent) =>
    /// @ts-expect-error
    setTimeoutInMillis(e.target.value);

  const handleResponseChange = (e: ChangeEvent) =>
    /// @ts-expect-error
    setResponse(e.target.value);

  const handleBehaviorChange = (e: ChangeEvent) =>
    /// @ts-expect-error
    setBehavior(e.target.value);

  const handleNameChange = (e: ChangeEvent) =>
    /// @ts-expect-error
    setName(e.target.value);

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Command</h2>
      <div className={styles.fieldContainer}>
        <div>
          <label>
            Name:
            <Input helper="The name of your command">
              <input type="text" value={name} onChange={handleNameChange} />
            </Input>
          </label>
        </div>
        <div>
          <label>
            Behavior:
            <Input helper="Commands can trigger a response, a count or be auto-run on a timer">
              <select value={behavior} onChange={handleBehaviorChange}>
                <option value="respond">Respond</option>
                <option value="count">Count</option>
                <option value="timer">Timer</option>
                <option value="random">Random</option>
              </select>
            </Input>
          </label>
        </div>
        <div>
          <label>
            Response:
            <Input helper="What reponse would you like to see in chat?">
              <input
                type="text"
                value={response}
                onChange={handleResponseChange}
              />
            </Input>
          </label>
        </div>
        <div>
          Permissions:
          <div className={styles.radioContainer}>
            <RadioInput
              name="permissions"
              value="modonly"
              checked={modOnly}
              onChange={handlePermissionsChange}
            >
              Mod Only
            </RadioInput>
            <RadioInput
              name="permissions"
              value="subonly"
              checked={subOnly}
              onChange={handlePermissionsChange}
            >
              Sub Only
            </RadioInput>
            <RadioInput
              name="permissions"
              checked={!modOnly && !subOnly}
              value="everyone"
              onChange={handlePermissionsChange}
            >
              Anyone
            </RadioInput>
          </div>
          <div className={styles.helper}>
            Who should be able to trigger the command?
          </div>
        </div>
        <div>
          <label>
            Timeout
            <Input>
              <input
                type="number"
                value={timeoutInMillis}
                onChange={handleTimeoutChange}
              />
            </Input>
          </label>
        </div>
      </div>
      <Button weight="secondary" type="submit">
        Save
      </Button>
      <Button onClick={handleCancel}>Cancel</Button>
    </form>
  );
}
