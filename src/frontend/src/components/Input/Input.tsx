import { ReactElement } from "react";
import styles from "./Input.module.css";

interface InputProps {
  [key: string]: any;
  children: ReactElement | ReactElement[];
  prefix?: ReactElement;
  postfix?: ReactElement;
  disabled?: boolean;
  helper?: ReactElement | string;
}

export default function Input({
  children,
  prefix,
  postfix,
  className,
  disabled,
  helper,
  ...rest
}: InputProps) {
  return (
    <>
      <div
        className={`${styles.wrapper} ${className} ${
          disabled && styles.disabled
        }`}
        {...rest}
      >
        {prefix && <div className={styles.prefixContainer}>{prefix}</div>}
        <div className={styles.inputContainer}>{children}</div>
        {postfix && <div className={styles.postfixContainer}>{postfix}</div>}
      </div>
      {helper && <div className={styles.helper}>{helper}</div>}
    </>
  );
}
