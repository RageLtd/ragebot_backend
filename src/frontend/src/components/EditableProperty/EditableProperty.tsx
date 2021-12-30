import { FormEvent, useState, MouseEvent, ChangeEvent } from "react";

interface EditableValueProps {
  value: any;
  name: string;
  save: Function;
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
        {name}:
        <input
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
