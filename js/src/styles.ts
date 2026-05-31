/**
 * Shared CSS generation + injection.
 *
 * The forum entry point uses these to apply the live, user-chosen sizes; the
 * admin settings page uses the exact same builders for its preview, so the
 * preview can never drift from what the forum actually renders. Both layers
 * inject a single <style> element keyed by id and update its text in place
 * (rather than removing + recreating), so there is no flash of unstyled
 * content between updates.
 */
import { TEXT_DEFAULTS, UI_LARGE } from './constants';

export function px(base: number, scale: number): string {
  return Math.round(base * (scale / 100)) + 'px';
}

/** Reading-text stylesheet for a given scale percentage. */
export function buildTextCss(scale: number): string {
  const { body, heroMobile, heroDesktop, listMobile, listDesktop } = TEXT_DEFAULTS;
  return [
    '.Post-body, .Post-body p, .Post-body li,',
    '.Post-body blockquote, .Post-body td, .Post-body th,',
    '.Post-body pre, .Post-body code {',
    `    font-size: ${px(body, scale)} !important;`,
    '}',
    '.item-excerpt, .DiscussionListItem-excerpt {',
    `    font-size: ${px(body - 2, scale)} !important;`,
    '}',
    '.Hero h1, .DiscussionHero .DiscussionHero-title {',
    `    font-size: ${px(heroMobile, scale)} !important;`,
    '}',
    '@media (min-width: 768px) {',
    '    .Hero h1, .DiscussionHero .DiscussionHero-title {',
    `        font-size: ${px(heroDesktop, scale)} !important;`,
    '    }',
    '}',
    '.DiscussionListItem-title {',
    `    font-size: ${px(listMobile, scale)} !important;`,
    '}',
    '@media (min-width: 768px) {',
    '    .DiscussionListItem-title {',
    `        font-size: ${px(listDesktop, scale)} !important;`,
    '    }',
    '}',
  ].join('\n');
}

/** Interface ("Large" mode) stylesheet. Fixed multiplier, no parameter. */
export function buildUiCss(): string {
  const s = UI_LARGE;
  return [
    '#header .Button, #header .LinksButton {',
    `    font-size: ${px(14, s)} !important;`,
    '}',
    '.DiscussionPage-nav .Button {',
    `    font-size: ${px(14, s)} !important;`,
    '}',
    '.item-nav .Button, .item-nav .LinkButton, .item-nav .TagLinkButton,',
    '.item-nav .Dropdown-menu .Button, .item-nav .Dropdown-menu .LinkButton {',
    `    font-size: ${px(14, s)} !important;`,
    '}',
    '.Button:not(.Post-body .Button) {',
    `    font-size: ${px(13, s)} !important;`,
    '}',
    '.TagLabel-name {',
    `    font-size: ${px(12, s)} !important;`,
    '}',
    '.DiscussionListItem-info {',
    `    font-size: ${px(12, s)} !important;`,
    '}',
    '.App-footer, #modern-footer {',
    `    font-size: ${px(13, s)} !important;`,
    '}',
  ].join('\n');
}

/** Create the <style id> if missing, then set its contents. Idempotent. */
export function injectStyle(id: string, css: string): void {
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

export function removeStyle(id: string): void {
  const el = document.getElementById(id);
  if (el) el.remove();
}
