/**
 * Scaling application.
 *
 * The actual size rules live in the shipped stylesheet (`less/forum.less`,
 * mirrored in `less/admin.less` for the preview). They are written relative to
 * each element's own inherited size -- `font-size: calc(1em * var(--lr-text-scale))`
 * -- so they scale whatever the theme uses instead of asserting a fixed px
 * base, and they are gated behind a class on the root element so nothing is
 * touched at the default size.
 *
 * This module's only job is to flip the two CSS custom properties and their
 * gate classes on <html>. Because the rules are already in the loaded
 * stylesheet, toggling them is instant and flash-free, and any element -- in
 * core or in another extension -- that carries the `FontSizer-text` /
 * `FontSizer-ui` class (or references the variables) scales along with it.
 */
import { TEXT_MIN, UI_LARGE } from './constants';

export const TEXT_SCALE_VAR = '--lr-text-scale';
export const UI_SCALE_VAR = '--lr-ui-scale';
export const TEXT_SCALE_CLASS = 'lr-text-scaling';
export const UI_SCALE_CLASS = 'lr-ui-scaling';

function root(): HTMLElement | null {
  return typeof document !== 'undefined' ? document.documentElement : null;
}

/**
 * Apply (or clear) the reading-text scale. `scale` is a percentage; at the
 * minimum (100) the gate class and variable are removed so the theme renders
 * exactly as it would without the extension.
 */
export function applyTextScale(scale: number): void {
  const el = root();
  if (!el) return;
  if (scale <= TEXT_MIN) {
    el.classList.remove(TEXT_SCALE_CLASS);
    el.style.removeProperty(TEXT_SCALE_VAR);
    return;
  }
  el.style.setProperty(TEXT_SCALE_VAR, String(scale / 100));
  el.classList.add(TEXT_SCALE_CLASS);
}

/** Apply (or clear) the "Large" interface scale. */
export function applyUiScale(uiLarge: boolean): void {
  const el = root();
  if (!el) return;
  if (!uiLarge) {
    el.classList.remove(UI_SCALE_CLASS);
    el.style.removeProperty(UI_SCALE_VAR);
    return;
  }
  el.style.setProperty(UI_SCALE_VAR, String(UI_LARGE / 100));
  el.classList.add(UI_SCALE_CLASS);
}
