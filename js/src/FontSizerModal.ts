/**
 * The user-facing font-size dialog.
 *
 * A standard Flarum Mithril modal: it participates in the virtual-DOM
 * lifecycle and inherits focus-trapping, z-index stacking, the close button,
 * Esc-to-dismiss and backdrop-click-to-dismiss from the core `Modal`
 * component, so none of that has to be reimplemented by hand.
 *
 * The controls: a live slider for the reading-text size (a dropdown between
 * v1.3 and v1.5; the slider came back by request, d/39187/62) and a core
 * `Switch` for the larger-interface toggle — wrapped in the usual
 * `Form` / `Form-group` structure, so the dialog looks and behaves like the
 * rest of Flarum. Every change applies live; the primary button just closes.
 */
import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
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
    return m(
      'div',
      { className: 'Modal-body' },
      m('div', { className: 'Form' }, [
        // --- Reading text size --------------------------------------------
        m('div', { className: 'Form-group' }, [
          m('label', app.translator.trans('linkrobins-font-sizer.forum.modal.reading_text_heading')),
          m('div', { className: 'FontSizerModal-slider' }, [
            m('input', {
              type: 'range',
              min: TEXT_MIN,
              max: TEXT_MAX,
              step: STEP,
              value: state.textScale,
              // oninput, not onchange: the page rescales live under the
              // drag, which is the entire point of a slider.
              oninput: (e: InputEvent) => setTextScale(parseInt((e.target as HTMLInputElement).value, 10)),
              'aria-valuetext': state.textScale + '%',
            }),
            m('span', { className: 'FontSizerModal-sliderValue' }, state.textScale + '%'),
          ]),
          m('p', { className: 'helpText' }, app.translator.trans('linkrobins-font-sizer.forum.modal.reading_text_hint')),
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
          m('p', { className: 'helpText' }, app.translator.trans('linkrobins-font-sizer.forum.modal.interface_size_hint')),
        ]),

        // --- Actions ------------------------------------------------------
        m(
          'div',
          { className: 'Form-group Form-controls' },
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
}
