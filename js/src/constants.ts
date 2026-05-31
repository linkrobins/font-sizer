/**
 * Shared constants for both the forum and admin entry points.
 *
 * The supported reading-text range is [TEXT_MIN, TEXT_MAX] percent. UI_LARGE
 * is the single fixed multiplier used for the "Large" interface mode (there is
 * no per-step UI sizing — it's a boolean default/large toggle).
 */
export const COOKIE_TEXT = 'lr_text_scale';
export const COOKIE_UI = 'lr_ui_size';

export const TEXT_MIN = 100;
export const TEXT_MAX = 150;
export const UI_LARGE = 115;

/** Base font sizes (px at 100%) that the scale percentage is applied to. */
export const TEXT_DEFAULTS = {
  heroMobile: 16,
  heroDesktop: 22,
  body: 14,
  listMobile: 14,
  listDesktop: 16,
};

/**
 * Clamp a percent value to the [TEXT_MIN, TEXT_MAX] range, mapping non-numeric
 * input to TEXT_MIN. Used on cookie/setting load so a stale or manually
 * tampered value can't produce 1000% text or `NaNpx` CSS output. The server
 * (`extend.php`) clamps too — this is defense in depth on the client.
 */
export function clampScale(n: number): number {
  if (typeof n !== 'number' || isNaN(n)) return TEXT_MIN;
  if (n < TEXT_MIN) return TEXT_MIN;
  if (n > TEXT_MAX) return TEXT_MAX;
  return n;
}
