import {
  FormEvent,
  useState,
  ChangeEvent,
  useRef,
  useEffect,
  ReactElement,
  ChangeEventHandler,
  Ref,
} from "react";
import Button from "../Button/Button";
import Input from "../Input/Input";
import RadioInput from "../RadioInput/RadioInput";

import styles from "./EditableProperty.module.css";

interface EditableValueProps {
  [key: string]: any;
  value: any;
  name: string;
  save: Function;
  type?: "input" | "textarea" | "select" | "radio";
  options?: ReactElement | ReactElement[];
}

function camelToHuman(string: string) {
  const uppercaseCharacters = string.match(/[A-Z]/gm);
  if (uppercaseCharacters === null) {
    return string[0].toUpperCase() + string.substring(1);
  }
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

const getInputElement = (
  type: string,
  editedValue: any,
  {
    isEditing,
    updateProperty,
    textAreaRef,
    options,
  }: {
    isEditing: boolean;
    updateProperty: ChangeEventHandler;
    textAreaRef?: Ref<HTMLTextAreaElement>;
    options?: ReactElement | ReactElement[];
  }
) => {
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
        throw new Error("If you want to use a select you must give it options");
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

export default function EditableProperty({
  value,
  name,
  save,
  type = "input",
  options,
  ...rest
}: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current?.tagName.toLowerCase() === "textarea") {
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [textAreaRef, editedValue]);

  useEffect(() => {
    setEditedValue(value);
  }, [value]);

  const toggleEdit = (e: ChangeEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(!isEditing);
  };
  const updateProperty = (e: ChangeEvent<HTMLInputElement>) => {
    setEditedValue(e.target.value);
  };

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditedValue(
      Object.keys(editedValue).reduce((acc: { [key: string]: boolean }, v) => {
        acc[v] = v === e.target.value;
        return acc;
      }, {})
    );
  };

  const saveEdit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    save({ value: editedValue, name });
    setIsEditing(false);
  };

  const discardEdit = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setEditedValue(value);
    setIsEditing(false);
  };

  return (
    <form onSubmit={saveEdit}>
      <label>
        {(name.match(/[A-Z]/gm) ?? []).length > 0
          ? camelToHuman(name)
          : name[0].toUpperCase() + name.slice(1)}
        :
        {type !== "radio" && (
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
            {getInputElement(type, editedValue, {
              isEditing,
              updateProperty,
              options,
            })}
          </Input>
        )}
        {type === "radio" && (
          <>
            {!isEditing && <Button onClick={toggleEdit}>Edit</Button>}
            {isEditing && (
              <Button weight="secondary" type="submit">
                Save
              </Button>
            )}
            {isEditing && <Button onClick={discardEdit}>Cancel</Button>}
            <div className={styles.radioContainer}>
              {
                <>
                  {Object.keys(editedValue).map((v) => {
                    return (
                      <RadioInput
                        key={name + v}
                        name={name}
                        value={v}
                        onChange={handleRadioChange}
                        checked={editedValue[v]}
                        disabled={!isEditing}
                      >
                        {camelToHuman(v)}
                      </RadioInput>
                    );
                  })}
                </>
              }
            </div>
            {rest.helper && <div className={styles.helper}>{rest.helper}</div>}
          </>
        )}
      </label>
    </form>
  );
}
