export const targets = ["preboot", "boot", "gui"] as const;

export type Target = (typeof targets)[number];
