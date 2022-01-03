import { FormEvent, useState, ChangeEvent } from "react";

import styles from "./EditableProperty.module.css";

interface EditableValueProps {
  value: any;
  name: string;
  save: Function;
}

function camelToHuman(string: string) {
  const uppercaseCharacters = string.match(/[A-Z]/gm);
  const words: string[] = [];

  uppercaseCharacters!.reduce((acc, char, idx, arr) => {
    words.push(acc.slice(0, acc.indexOf(char)));
    if (!arr[idx + 1]) {
      words.push(acc.slice(acc.indexOf(char)));
    }
    return acc.slice(acc.indexOf(char));
  }, string);

  return words
    .map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase())
    .join(" ");
}

export default function EditableValue({
  value,
  name,
  save,
}: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  const toggleEdit = () => setIsEditing(!isEditing);
  /// @ts-expect-error
  const updateProperty = (e: ChangeEvent) => setEditedValue(e.target.value);

  const saveEdit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    save({ value: editedValue, name });
    toggleEdit();
  };

  const discardEdit = () => {
    setEditedValue(value);
    toggleEdit();
  };

  return (
    <form onSubmit={saveEdit}>
      <label>
        {camelToHuman(name)}:
        <input
          className={styles.input}
          disabled={!isEditing}
          onChange={updateProperty}
          value={editedValue}
        />
      </label>
      {!isEditing && <button onClick={toggleEdit}>Edit</button>}
      {isEditing && <button type="submit">Save</button>}
      {isEditing && <button onClick={discardEdit}>Cancel</button>}
    </form>
  );
}
