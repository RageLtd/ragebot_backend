import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Button from "../Button/Button";
import Input from "../Input/Input";
import EditableUrl from "./EditableUrl/EditableUrl";

interface IntegrationProps {
  name: string;
  webhookUrls: string[];
  save: Function;
  remove: Function;
}

export default function Integration({
  name,
  webhookUrls,
  save,
  remove,
}: IntegrationProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedUrls, setEditedUrls] = useState(webhookUrls);
  const [draftUrl, setDraftUrl] = useState("");

  useEffect(() => setEditedUrls(webhookUrls), [webhookUrls]);

  const toggleEdit = () => setIsEditing(!isEditing);

  const handleRemove = () => {
    remove({ name: editedName, webhookUrls: editedUrls });
  };

  if (!isEditing) {
    return (
      <li>
        <p>Name: {editedName[0].toUpperCase() + editedName.slice(1)}</p>
        <div>{editedUrls.join(", ")}</div>
        <Button onClick={toggleEdit}>Edit</Button>
        <Button weight="danger" onClick={handleRemove}>
          Remove
        </Button>
      </li>
    );
  }

  const updateName = (e: ChangeEvent<HTMLSelectElement>) =>
    setEditedName(e.target.value);

  const handleCancel = () => {
    setEditedName(name);
    setEditedUrls(webhookUrls);
    toggleEdit();
  };

  const generateSaveEditedUrl = (url: string) => {
    const urlIndex = editedUrls.indexOf(url);
    return (newUrl: string) => {
      setEditedUrls([
        ...editedUrls.slice(0, urlIndex),
        newUrl,
        ...editedUrls.slice(urlIndex + 1),
      ]);
    };
  };

  const updateDraftUrl = (e: ChangeEvent<HTMLInputElement>) =>
    setDraftUrl(e.target.value);

  const addDraftUrl = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDraftUrl("");
    setEditedUrls([...editedUrls, draftUrl]);
  };

  const generateRemoveUrl = (url: string) => () => {
    const urlIndex = editedUrls.indexOf(url);
    setEditedUrls([
      ...editedUrls.slice(0, urlIndex),
      ...editedUrls.slice(urlIndex + 1),
    ]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await save({ name: editedName, webhookUrls: editedUrls });
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <li>
      <p>
        <label>
          Name:
          <select name="name" onChange={updateName} value={name}>
            <option value="discord">Discord</option>
          </select>
        </label>
      </p>
      <div>
        <ul>
          {editedUrls.map((url) => (
            <EditableUrl
              key="url"
              url={url}
              save={generateSaveEditedUrl(url)}
              remove={generateRemoveUrl(url)}
            />
          ))}
        </ul>
      </div>

      <div>
        <form onSubmit={addDraftUrl}>
          <label>
            add new url:
            <Input postfix={<Button type="submit">+</Button>}>
              <input
                type="text"
                name="url"
                onChange={updateDraftUrl}
                value={draftUrl}
              />
            </Input>
          </label>
        </form>
      </div>
      <Button weight="secondary" onClick={handleSave}>
        Save
      </Button>
      <Button onClick={handleCancel}>Cancel</Button>
    </li>
  );
}
