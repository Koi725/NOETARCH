export const BUTTON_VARIANTS = ["primary", "secondary", "danger"] as const;
export const BUTTON_SIZES = ["small", "medium"] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonSize = (typeof BUTTON_SIZES)[number];
