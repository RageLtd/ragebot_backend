import { ReactElement } from "react";

import styles from "./Button.module.css";

interface ButtonProps {
  [key: string]: any;
  children: ReactElement | string;
  prefix?: ReactElement;
  postfix?: ReactElement;
  className?: string;
  weight?: "attention" | "primary" | "secondary" | "danger";
}

export default function Button({
  children,
  prefix,
  postfix,
  className,
  weight,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${weight ? styles[weight] : ""} ${
        className ?? ""
      }`}
      {...rest}
    >
      {prefix && <span>{prefix}</span>}
      {children}
      {postfix && <span>{postfix}</span>}
    </button>
  );
}
