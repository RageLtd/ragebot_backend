import { ChangeEvent } from "react";
import styles from "./Toggle.module.css";

interface ToggleProps {
  children: any;
  disabled?: boolean;
  state: boolean;
  onChange: Function;
}

export default function Toggle({
  children,
  disabled,
  onChange,
  state,
}: ToggleProps) {
  const handleChange = (e: ChangeEvent) => {
    onChange(e);
  };
  return (
    <label
      className={`${styles.container}${disabled ? ` ${styles.disabled}` : ""}`}
    >
      <input
        className={styles.hidden}
        type="checkbox"
        checked={state}
        onChange={handleChange}
        disabled={disabled}
      />
      <div
        className={`${styles.checkContainer}${
          state ? ` ${styles.checked}` : ""
        }`}
      ></div>
      {children}
    </label>
  );
}
