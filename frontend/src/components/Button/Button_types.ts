import type { ButtonHTMLAttributes } from "react";
import type { ButtonSize, ButtonVariant } from "@/data/Button/Button-data";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};
