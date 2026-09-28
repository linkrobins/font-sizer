/**
 * Shared constants for both the forum and admin entry points.
 *
 * The supported reading-text range is [TEXT_MIN, TEXT_MAX] percent, and
 * TEXT_DEFAULT is the neutral value inside it: the size at which the extension
 * asserts nothing and the theme renders exactly as it would without it. Keep
 * the two ideas separate. They were the same number until the floor dropped
 * below 100, and collapsing them again would make the floor the sitewide
 * default and reset users to it. UI_LARGE
 * is the single fixed multiplier used for the "Large" interface mode (there is
 * no per-step UI sizing — it's a boolean default/large toggle).
 */
export const COOKIE_TEXT = 'lr_text_scale';
export const COOKIE_UI = 'lr_ui_size';

export const TEXT_MIN = 80;
export const TEXT_MAX = 150;
export const TEXT_DEFAULT = 100;
export const UI_LARGE = 115;

/**
 * Admin-configurable base font sizes (px) that the scale percentage is
 * applied to. The defaults match the sizes the extension historically
 * hard-coded, so an untouched install renders identically. `base` covers post
 * bodies and mobile list titles, `small` covers excerpts, `title` covers hero
 * and desktop list titles (the desktop hero derives from it at the historical
 * 16:22 ratio in the stylesheet).
 */
export const BASE_DEFAULTS = {
  base: 14,
  small: 12,
  title: 16,
};

/** Supported range for the admin base-size inputs, in px. */
export const BASE_MIN = 10;
export const BASE_MAX = 32;

/**
 * Clamp a percent value to the [TEXT_MIN, TEXT_MAX] range, mapping non-numeric
 * input to TEXT_DEFAULT (not TEXT_MIN: unreadable input should land on the
 * neutral size, never on the smallest one). Used on cookie/setting load so a
 * stale or manually
 * tampered value can't produce 1000% text or `NaNpx` CSS output. The server
 * (`extend.php`) clamps too — this is defense in depth on the client.
 */
export function clampScale(n: number): number {
  if (typeof n !== 'number' || isNaN(n)) return TEXT_DEFAULT;
  if (n < TEXT_MIN) return TEXT_MIN;
  if (n > TEXT_MAX) return TEXT_MAX;
  return n;
}

/**
 * Clamp a base size (px) to the [BASE_MIN, BASE_MAX] range, mapping
 * non-numeric input to the given default. Same defense-in-depth role as
 * `clampScale`: the server clamps on serialize, this clamps on read.
 */
export function clampBase(n: number, fallback: number): number {
  if (typeof n !== 'number' || isNaN(n)) return fallback;
  if (n < BASE_MIN) return BASE_MIN;
  if (n > BASE_MAX) return BASE_MAX;
  return n;
}
