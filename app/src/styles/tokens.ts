/**
 * Design tokens — the single source of truth (rule R6).
 *
 * The values live in `tokens.json` because two worlds consume them:
 * `tailwind.config.js` (CommonJS, build time) and the application code
 * (TypeScript). JSON avoids duplicating the values in two formats.
 *
 * Prefer the utility classes (`bg-brand`, `text-ink-muted`). Import from here
 * only when you need the raw value — animations, native APIs such as
 * `SystemUI.setBackgroundColorAsync`, or props that do not accept className.
 */
import tokens from "./tokens.json";

export const { colors, fontFamily, radius } = tokens;

export type Colors = typeof colors;
export type FontFamily = typeof fontFamily;

export default tokens;
