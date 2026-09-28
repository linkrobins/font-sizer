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
 * This module's only job is to flip the CSS custom properties (the two scale
 * multipliers plus the three admin base sizes) and their gate classes on
 * <html>. Because the rules are already in the loaded
 * stylesheet, toggling them is instant and flash-free, and any element -- in
 * core or in another extension -- that carries the `FontSizer-text` /
 * `FontSizer-ui` class (or references the variables) scales along with it.
 */
import { TEXT_DEFAULT, UI_LARGE, BASE_DEFAULTS } from './constants';

export const TEXT_SCALE_VAR = '--lr-text-scale';
export const UI_SCALE_VAR = '--lr-ui-scale';
export const TEXT_SCALE_CLASS = 'lr-text-scaling';
export const UI_SCALE_CLASS = 'lr-ui-scaling';

export const TEXT_BASE_VAR = '--lr-text-base';
export const TEXT_SMALL_VAR = '--lr-text-small';
export const TEXT_TITLE_VAR = '--lr-text-title';
export const TEXT_BASES_CLASS = 'lr-text-bases';

/** The three admin-configurable base sizes, in px. */
export interface TextBases {
  base: number;
  small: number;
  title: number;
}

function root(): HTMLElement | null {
  return typeof document !== 'undefined' ? document.documentElement : null;
}

/**
 * Apply (or clear) the reading-text scale. `scale` is a percentage; at exactly
 * TEXT_DEFAULT the gate class and variable are removed so the theme renders
 * exactly as it would without the extension. The test is equality, not `<=`:
 * the range now runs below 100, and treating everything under the default as
 * "nothing to do" would silently disable the whole lower half of the slider.
 * Callers pass a clamped value (see `clampScale`).
 */
export function applyTextScale(scale: number): void {
  const el = root();
  if (!el) return;
  if (scale === TEXT_DEFAULT) {
    el.classList.remove(TEXT_SCALE_CLASS);
    el.style.removeProperty(TEXT_SCALE_VAR);
    return;
  }
  el.style.setProperty(TEXT_SCALE_VAR, String(scale / 100));
  el.classList.add(TEXT_SCALE_CLASS);
}

/**
 * Apply (or clear) the admin-configured base sizes. Each variable is only
 * asserted inline when it differs from the historical default, so a theme's
 * own `:root { --lr-text-base: ... }` Custom CSS keeps working while the
 * admin leaves the settings alone. The `lr-text-bases` gate class activates
 * the pixel rules whenever any base is customised, which is what makes admin
 * bases apply sitewide even for users at 100% scale.
 */
export function applyTextBases(bases: TextBases): void {
  const el = root();
  if (!el) return;

  const entries: Array<[string, number, number]> = [
    [TEXT_BASE_VAR, bases.base, BASE_DEFAULTS.base],
    [TEXT_SMALL_VAR, bases.small, BASE_DEFAULTS.small],
    [TEXT_TITLE_VAR, bases.title, BASE_DEFAULTS.title],
  ];

  let customized = false;
  for (const [name, value, fallback] of entries) {
    if (value === fallback) {
      el.style.removeProperty(name);
    } else {
      el.style.setProperty(name, value + 'px');
      customized = true;
    }
  }

  el.classList.toggle(TEXT_BASES_CLASS, customized);
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
