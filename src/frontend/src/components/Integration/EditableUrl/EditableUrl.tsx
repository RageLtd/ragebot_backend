import { ChangeEvent, FormEvent, MouseEventHandler, useState } from "react";

interface EditableUrlProps {
  url: string;
  save: Function;
  remove: MouseEventHandler;
}

export default function EditableUrl({ url, save, remove }: EditableUrlProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUrl, setEditedUrl] = useState(url);

  const toggleEdit = () => setIsEditing(!isEditing);
  /// @ts-expect-error
  const updateUrl = (e: ChangeEvent) => setEditedUrl(e.target.value);

  const saveEdit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    save(editedUrl);
    toggleEdit();
  };

  const discardEdit = () => {
    setEditedUrl(url);
    toggleEdit();
  };

  return (
    <li>
      <form onSubmit={saveEdit}>
        <input disabled={!isEditing} onChange={updateUrl} value={editedUrl} />
        {!isEditing && <button onClick={toggleEdit}>Edit</button>}
        {!isEditing && <button onClick={remove}>-</button>}
        {isEditing && <button type="submit">Save</button>}
        {isEditing && <button onClick={discardEdit}>Cancel</button>}
      </form>
    </li>
  );
}
