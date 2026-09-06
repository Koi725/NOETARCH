import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "small" | "medium";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};
