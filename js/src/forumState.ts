/**
 * Forum-side preference state.
 *
 * Holds the current reading-text scale and interface-size mode, reads/writes
 * the two cookies that persist them, derives the admin-configured defaults
 * from the forum payload, and (re)applies the generated stylesheets.
 */
import app from 'flarum/forum/app';
import { COOKIE_TEXT, COOKIE_UI, TEXT_MIN, clampScale } from './constants';
import { applyTextScale, applyUiScale } from './styles';

export const state = {
  textScale: TEXT_MIN,
  uiLarge: false,
};

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string): void {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  // Add `Secure` on HTTPS pages so the cookie is never sent over plain HTTP.
  // The payload isn't sensitive (a percentage or 'large'/'default'), but it's
  // standard hygiene and costs nothing; on http dev sites we omit it so the
  // cookie still applies.
  let secure = '';
  try {
    if (typeof location !== 'undefined' && location.protocol === 'https:') {
      secure = '; Secure';
    }
  } catch (e) {
    // location unavailable — leave Secure off.
  }
  document.cookie =
    name + '=' + encodeURIComponent(value) +
    '; expires=' + expires.toUTCString() + '; path=/; SameSite=Lax' + secure;
}

/**
 * Read a forum attribute. During `app.initializers` (when we first apply
 * styles to avoid a flash) core hasn't built `app.forum` from the payload yet,
 * so fall back to reading the bootstrap payload directly. Once booted (e.g. the
 * modal's "reset to default"), `app.forum.attribute()` is used.
 */
function forumAttribute(name: string): string | undefined {
  const forum = app.forum as { attribute?: (n: string) => unknown } | undefined;
  if (forum && typeof forum.attribute === 'function') {
    return forum.attribute(name) as string | undefined;
  }
  const resources = ((app.data as { resources?: Array<{ type?: string; attributes?: Record<string, unknown> }> })?.resources) ?? [];
  const forumRecord = resources.find((r) => r && r.type === 'forums');
  return forumRecord?.attributes?.[name] as string | undefined;
}

/** Admin-configured sitewide default scale. */
export function adminDefaultScale(): number {
  return clampScale(parseInt(forumAttribute('linkrobinsFontScale') ?? String(TEXT_MIN), 10));
}

/** Admin-configured sitewide default interface size. */
export function adminDefaultUi(): boolean {
  return forumAttribute('linkrobinsFontSizerUi') === 'large';
}

/** Resolve the effective state from cookies, falling back to admin defaults. */
export function loadState(): void {
  const cookieText = getCookie(COOKIE_TEXT);
  const cookieUI = getCookie(COOKIE_UI);
  state.textScale = cookieText !== null ? clampScale(parseInt(cookieText, 10)) : adminDefaultScale();
  state.uiLarge = cookieUI !== null ? cookieUI === 'large' : adminDefaultUi();
}

export function applyText(): void {
  applyTextScale(state.textScale);
}

export function applyUi(): void {
  applyUiScale(state.uiLarge);
}

export function applyAll(): void {
  applyText();
  applyUi();
}

export function setTextScale(value: number): void {
  state.textScale = clampScale(value);
  setCookie(COOKIE_TEXT, String(state.textScale));
  applyText();
}

export function setUiLarge(value: boolean): void {
  state.uiLarge = value;
  setCookie(COOKIE_UI, value ? 'large' : 'default');
  applyUi();
}

/** Restore the admin-configured sitewide defaults and persist them. */
export function resetToDefault(): void {
  state.textScale = adminDefaultScale();
  state.uiLarge = adminDefaultUi();
  setCookie(COOKIE_TEXT, String(state.textScale));
  setCookie(COOKIE_UI, state.uiLarge ? 'large' : 'default');
  applyAll();
}
