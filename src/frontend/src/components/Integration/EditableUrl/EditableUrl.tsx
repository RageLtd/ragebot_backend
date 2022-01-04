import { ChangeEvent, FormEvent, MouseEventHandler, useState } from "react";
import Button from "../../Button/Button";
import Input from "../../Input/Input";

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
        <Input
          input={
            <input
              disabled={!isEditing}
              onChange={updateUrl}
              value={editedUrl}
            />
          }
          postfix={
            <div>
              {!isEditing && <Button onClick={toggleEdit}>Edit</Button>}
              {!isEditing && <Button onClick={remove}>-</Button>}
              {isEditing && <Button type="submit">Save</Button>}
              {isEditing && <Button onClick={discardEdit}>Cancel</Button>}
            </div>
          }
        />
      </form>
    </li>
  );
}
