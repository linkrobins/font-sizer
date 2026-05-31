/**
 * The user-facing font-size dialog.
 *
 * A standard Flarum Mithril modal: it participates in the virtual-DOM
 * lifecycle and inherits focus-trapping, z-index stacking, the close button,
 * Esc-to-dismiss and backdrop-click-to-dismiss from the core `Modal`
 * component, so none of that has to be reimplemented by hand.
 *
 * The controls are core Flarum components — a `Select` for the reading-text
 * size and a `Switch` for the larger-interface toggle — wrapped in the usual
 * `Form` / `Form-group` structure, so the dialog looks and behaves like the
 * rest of Flarum. Every change applies live; the primary button just closes.
 */
import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
import Switch from 'flarum/common/components/Switch';
import type Mithril from 'mithril';

import { TEXT_MIN, TEXT_MAX } from './constants';
import { state, setTextScale, setUiLarge, resetToDefault } from './forumState';

// Granularity of the reading-size dropdown.
const STEP = 5;

export default class FontSizerModal extends Modal {
  className(): string {
    return 'FontSizerModal Modal--small';
  }

  title(): Mithril.Children {
    return app.translator.trans('linkrobins-font-sizer.forum.modal.title');
  }

  content(): Mithril.Children {
    return m('div', { className: 'Modal-body' },
      m('div', { className: 'Form' }, [
        // --- Reading text size --------------------------------------------
        m('div', { className: 'Form-group' }, [
          m('label', app.translator.trans('linkrobins-font-sizer.forum.modal.reading_text_heading')),
          Select.component({
            options: this.scaleOptions(),
            value: String(state.textScale),
            wrapperAttrs: { className: 'FontSizerModal-select' },
            onchange: (value: string) => setTextScale(parseInt(value, 10)),
          }),
          m('p', { className: 'helpText' },
            app.translator.trans('linkrobins-font-sizer.forum.modal.reading_text_hint')
          ),
        ]),

        // --- Interface size -----------------------------------------------
        m('div', { className: 'Form-group' }, [
          Switch.component(
            {
              state: state.uiLarge,
              onchange: (checked: boolean) => setUiLarge(checked),
            },
            app.translator.trans('linkrobins-font-sizer.forum.modal.interface_size_label')
          ),
          m('p', { className: 'helpText' },
            app.translator.trans('linkrobins-font-sizer.forum.modal.interface_size_hint')
          ),
        ]),

        // --- Actions ------------------------------------------------------
        m('div', { className: 'Form-group Form-controls' },
          Button.component(
            {
              className: 'Button Button--link FontSizerModal-reset',
              onclick: () => resetToDefault(),
            },
            app.translator.trans('linkrobins-font-sizer.forum.modal.reset_button')
          )
        ),
      ])
    );
  }

  /**
   * Build the dropdown's `{ value: label }` map across the supported range.
   * The current value is always included so an off-grid admin default (e.g.
   * 113%) stays selectable rather than rendering as a blank option.
   */
  private scaleOptions(): Record<string, string> {
    const values: Record<number, true> = {};
    for (let v = TEXT_MIN; v <= TEXT_MAX; v += STEP) values[v] = true;
    values[state.textScale] = true;

    const options: Record<string, string> = {};
    Object.keys(values)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((v) => {
        options[String(v)] = app.translator.trans(
          'linkrobins-font-sizer.forum.modal.reading_text_value',
          { percent: v },
          true
        );
      });
    return options;
  }
}
