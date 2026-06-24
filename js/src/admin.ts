import app from 'flarum/admin/app';
import { override } from 'flarum/common/extend';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import saveSettings from 'flarum/admin/utils/saveSettings';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
import Switch from 'flarum/common/components/Switch';
import type Mithril from 'mithril';

import { TEXT_MIN, TEXT_MAX, clampScale } from './constants';
import { applyTextScale, applyUiScale } from './styles';

const EXTENSION_ID = 'linkrobins-font-sizer';
const KEY_SCALE = 'linkrobins-font-sizer.scale';
const KEY_UI = 'linkrobins-font-sizer.ui';

// Granularity of the reading-size dropdown (matches the forum modal).
const STEP = 5;

function persist(scale: number, uiLarge: boolean): Promise<unknown> {
  const body: Record<string, string> = {};
  body[KEY_SCALE] = String(scale);
  body[KEY_UI] = uiLarge ? 'large' : 'default';
  return saveSettings(body).catch((e: unknown) => {
    console.error('[linkrobins/font-sizer] settings save failed', e);
  });
}

// Tiny trailing debounce so spinning the dropdown (or rapid toggles) coalesces
// into a single PUT instead of one network write per step. The live preview and
// stream updates stay synchronous; only the save is delayed. The handlers all
// read the current streams, so the last call carries the full, correct state.
function debounce<A extends unknown[]>(ms: number, fn: (...args: A) => void): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  };
}

const persistDebounced = debounce(300, (scale: number, uiLarge: boolean) => {
  persist(scale, uiLarge);
});

// Build the `{ value: label }` map for the dropdown across the supported range,
// always including the current value so a previously-saved off-grid value stays
// selectable rather than rendering blank.
function scaleOptions(current: number): Record<string, string> {
  const values: Record<number, true> = {};
  for (let v = TEXT_MIN; v <= TEXT_MAX; v += STEP) values[v] = true;
  values[current] = true;

  const options: Record<string, string> = {};
  Object.keys(values)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((v) => {
      options[String(v)] = app.translator.trans('linkrobins-font-sizer.admin.settings.text_size_value', { percent: v }, true);
    });
  return options;
}

// The preview reuses the exact apply path the forum runs (toggling the gate
// classes + variables on <html>), so it can't drift from real output. The
// scaling rules are mirrored in admin.less, and the settings page renders a
// sample with the FontSizer-text / FontSizer-ui classes so dragging the
// controls actually shows the effect.
function previewText(scale: number): void {
  applyTextScale(scale);
}

function previewUi(uiLarge: boolean): void {
  applyUiScale(uiLarge);
}

override(ExtensionPage.prototype, 'content', function (this: ExtensionPage, original: () => Mithril.Children) {
  if (!this.extension || this.extension.id !== EXTENSION_ID) {
    return original();
  }

  // `this.setting()` (from AdminPage) returns a memoised Stream bound to the
  // setting, the idiomatic admin accessor — no reaching into the raw
  // `app.data.settings` payload.
  const scaleStream = this.setting(KEY_SCALE, String(TEXT_MIN));
  const uiStream = this.setting(KEY_UI, 'default');

  const scale = clampScale(parseInt(scaleStream(), 10));
  const uiLarge = uiStream() === 'large';

  function onScale(value: string): void {
    const val = clampScale(parseInt(value, 10));
    scaleStream(String(val));
    previewText(val);
    persistDebounced(val, uiStream() === 'large');
  }

  function resetScale(): void {
    scaleStream(String(TEXT_MIN));
    previewText(TEXT_MIN);
    persistDebounced(TEXT_MIN, uiStream() === 'large');
  }

  function setUi(large: boolean): void {
    uiStream(large ? 'large' : 'default');
    previewUi(large);
    persistDebounced(clampScale(parseInt(scaleStream(), 10)), large);
  }

  return m('div', { className: 'ExtensionPage-settings' },
    m('div', { className: 'container' }, [
      // --- Default reading text size ------------------------------------
      m('div', { className: 'Form-group', style: 'margin-bottom:1.5rem;' }, [
        m('label', app.translator.trans('linkrobins-font-sizer.admin.settings.text_size_label')),
        m('p', { className: 'helpText' },
          app.translator.trans('linkrobins-font-sizer.admin.settings.text_size_help')
        ),
        Select.component({
          options: scaleOptions(scale),
          value: String(scale),
          wrapperAttrs: { className: 'FontSizerSettings-select' },
          onchange: onScale,
        }),
        scale !== TEXT_MIN &&
          Button.component(
            {
              className: 'Button Button--text FontSizerSettings-reset',
              onclick: resetScale,
            },
            app.translator.trans('linkrobins-font-sizer.admin.settings.reset_button')
          ),
      ]),

      // --- Default interface size ---------------------------------------
      m('div', { className: 'Form-group' }, [
        m('label', app.translator.trans('linkrobins-font-sizer.admin.settings.ui_size_label')),
        m('p', { className: 'helpText' },
          app.translator.trans('linkrobins-font-sizer.admin.settings.ui_size_help')
        ),
        Switch.component(
          {
            state: uiLarge,
            onchange: (checked: boolean) => setUi(checked),
          },
          app.translator.trans('linkrobins-font-sizer.admin.settings.ui_toggle_label')
        ),
      ]),

      // --- Live preview --------------------------------------------------
      // The sample carries the same FontSizer-text / FontSizer-ui contract
      // classes the forum exposes to extensions, so dragging the controls
      // above scales it exactly the way real content scales.
      m('div', { className: 'Form-group FontSizerSettings-preview' }, [
        m('label', app.translator.trans('linkrobins-font-sizer.admin.settings.preview_label')),
        m('div', { className: 'FontSizerSettings-previewBox' }, [
          m('p', { className: 'FontSizer-text' },
            app.translator.trans('linkrobins-font-sizer.admin.settings.preview_text')
          ),
          m('button', { className: 'Button FontSizer-ui', type: 'button' },
            app.translator.trans('linkrobins-font-sizer.admin.settings.preview_button')
          ),
        ]),
      ]),
    ])
  );
});
