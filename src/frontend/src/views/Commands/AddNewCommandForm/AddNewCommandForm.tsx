import { ChangeEvent, FormEvent, useState } from "react";

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
      <div>
        <label>
          Name:
          <input type="text" value={name} onChange={handleNameChange} />
        </label>
      </div>
      <div>
        <label>
          Behavior:
          <select value={behavior} onChange={handleBehaviorChange}>
            <option value="respond">Respond</option>
            <option value="count">Count</option>
            <option value="timer">Timer</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Response:
          <input type="text" value={response} onChange={handleResponseChange} />
        </label>
      </div>
      <div>
        Permissions:
        <label>
          Mod only
          <input
            type="radio"
            name="permissions"
            value="modonly"
            onChange={handlePermissionsChange}
          />
        </label>
        <label>
          Sub only
          <input
            type="radio"
            name="permissions"
            value="subonly"
            onChange={handlePermissionsChange}
          />
        </label>
        <label>
          Anyone
          <input
            type="radio"
            name="permissions"
            defaultChecked
            value="everyone"
            onChange={handlePermissionsChange}
          />
        </label>
      </div>
      <div>
        <label>
          Timeout
          <input
            type="number"
            value={timeoutInMillis}
            onChange={handleTimeoutChange}
          />
        </label>
      </div>
      <button type="submit">Save</button>
      <button onClick={handleCancel}>Cancel</button>
    </form>
  );
}
