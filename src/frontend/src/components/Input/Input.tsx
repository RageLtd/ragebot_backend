import { ReactElement } from "react";
import styles from "./Input.module.css";

interface InputProps {
  [key: string]: any;
  input: ReactElement;
  prefix?: ReactElement;
  postfix?: ReactElement;
  disabled?: boolean;
}

export default function Input({
  input,
  prefix,
  postfix,
  className,
  disabled,
  ...rest
}: InputProps) {
  return (
    <div
      className={`${styles.wrapper} ${className} ${
        disabled && styles.disabled
      }`}
      {...rest}
    >
      {prefix && <div className={styles.prefixContainer}>{prefix}</div>}
      <div className={styles.inputContainer}>{input}</div>
      {postfix && <div className={styles.postfixContainer}>{postfix}</div>}
    </div>
  );
}
