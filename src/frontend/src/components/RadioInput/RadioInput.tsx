import { ChangeEvent, ReactElement } from "react";
import styles from "./RadioInput.module.css";

interface RadioInputProps {
  [key: string]: any;
  name: string;
  children: string | ReactElement;
  checked: boolean;
  disabled?: boolean;
  onChange: Function;
  value: string;
}

export default function RadioInput({
  checked,
  children,
  disabled,
  name,
  onChange,
  value,
  ...rest
}: RadioInputProps) {
  const handleChange = (e: ChangeEvent) => onChange(e);
  return (
    <span className={styles.container}>
      <label className={disabled ? ` ${styles.disabled}` : ""}>
        <span className={styles.hidden}>
          <input
            type="radio"
            name={name}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            value={value}
            {...rest}
          />
        </span>
        <span
          className={`${styles.radio}${checked ? ` ${styles.checked}` : ""}${
            disabled ? ` ${styles.disabled}` : ""
          }`}
        ></span>
        {children}
      </label>
    </span>
  );
}
