import { ChangeEvent, FormEvent, useState } from "react";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import RadioInput from "../../../components/RadioInput/RadioInput";

import styles from "./AddNewCommandForm.module.css";

interface AddNewCommandFormProps {
  onSubmit: Function;
  onCancel: Function;
}

function getHelperDescription(behavior: string) {
  switch (behavior) {
    case "respond": {
      return (
        <p>
          Respond will cause Ragebot to say the Response value in chat whenever
          the command is called
        </p>
      );
    }
    case "timeout": {
      return (
        <p>Timeout will cause Ragebot to repeat an action after a delay</p>
      );
    }
    case "random": {
      return (
        <p>
          Random will cause Ragebot to post a random value that has been added
          with the <span className={styles.code}>!add&lt;commandname&gt;</span>{" "}
          command.
        </p>
      );
    }
    case "count": {
      return (
        <p>
          Count will cause Ragebot to post the number of times the command has
          been called in chat. To add the count to the response, use{" "}
          <span className={styles.code}>%%</span> token
        </p>
      );
    }
    default:
      return "";
  }
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

  const handlePermissionsChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleTimeoutChange = (e: ChangeEvent<HTMLInputElement>) =>
    setTimeoutInMillis(Number(e.target.value));

  const handleResponseChange = (e: ChangeEvent<HTMLInputElement>) =>
    setResponse(e.target.value);

  const handleBehaviorChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setBehavior(e.target.value);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    setName(e.target.value);

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Command</h2>
      <div className={styles.fieldContainer}>
        <div>
          <label>
            Name
            <Input helper="The name of your command">
              <input type="text" value={name} onChange={handleNameChange} />
            </Input>
          </label>
        </div>
        <div>
          <label>
            Behavior
            <Input
              helper={
                <>
                  <p>
                    Commands can trigger a response, a count or be auto-run on a
                    timer
                  </p>
                  {getHelperDescription(behavior)}
                </>
              }
            >
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
            Response
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
          Permissions
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
            Interval
            <Input helper="How many milliseconds should there be between runs of the command?">
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
