import {
  FormEvent,
  useState,
  ChangeEvent,
  useRef,
  useEffect,
  ReactElement,
} from "react";
import Button from "../Button/Button";
import Input from "../Input/Input";

import styles from "./EditableProperty.module.css";

interface EditableValueProps {
  [key: string]: any;
  value: any;
  name: string;
  save: Function;
  type?: "input" | "textarea" | "select";
  options?: ReactElement | ReactElement[];
}

function camelToHuman(string: string) {
  const uppercaseCharacters = string.match(/[A-Z]/gm);
  const words: string[] = [];

  uppercaseCharacters?.reduce((acc, char, idx, arr) => {
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
  type = "input",
  options,
  ...rest
}: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  const textAreaRef = useRef(null);

  useEffect(() => {
    /// @ts-expect-error
    if (textAreaRef.current?.tagName.toLowerCase() === "textarea") {
      /// @ts-expect-error
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [textAreaRef, editedValue]);

  const toggleEdit = () => setIsEditing(!isEditing);
  const updateProperty = (e: ChangeEvent) => {
    /// @ts-expect-error
    setEditedValue(e.target.value);
  };

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

  const getInputElement = (type: string) => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            ref={textAreaRef}
            disabled={!isEditing}
            onChange={updateProperty}
            value={editedValue}
          />
        );
      case "select": {
        if (!options) {
          throw new Error(
            "If you want to use a select you must give it options"
          );
        }
        return (
          <select
            disabled={!isEditing}
            value={editedValue}
            onChange={updateProperty}
          >
            {options}
          </select>
        );
      }
      default:
        return (
          <input
            type="text"
            disabled={!isEditing}
            onChange={updateProperty}
            value={editedValue}
          />
        );
    }
  };

  return (
    <form onSubmit={saveEdit}>
      <label>
        {(name.match(/[A-Z]/gm) ?? []).length > 0
          ? camelToHuman(name)
          : name[0].toUpperCase() + name.slice(1)}
        :
        <Input
          className={styles.input}
          disabled={!isEditing}
          postfix={
            <>
              {!isEditing && <Button onClick={toggleEdit}>Edit</Button>}
              {isEditing && (
                <Button weight="secondary" type="submit">
                  Save
                </Button>
              )}
              {isEditing && <Button onClick={discardEdit}>Cancel</Button>}
            </>
          }
          {...rest}
        >
          {getInputElement(type)}
        </Input>
      </label>
    </form>
  );
}
