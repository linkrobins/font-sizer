import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import HeaderSecondary from 'flarum/forum/components/HeaderSecondary';
import Button from 'flarum/common/components/Button';

import { loadState, applyAll } from './forumState';
import FontSizerModal from './FontSizerModal';

app.initializers.add('linkrobins-font-sizer', () => {
  // Resolve cookies/defaults and apply the stylesheets as early as the
  // initializer runs (before first paint of forum content), then expose the
  // control. A single load+apply here is enough — no separate DOMContentLoaded
  // pass, which previously double-read the cookies and re-injected the styles.
  loadState();
  applyAll();

  extend(HeaderSecondary.prototype, 'items', function (items) {
    // Place the control just before the profile block. For logged-in users,
    // priority 5 sits between core's 'notifications' (10) and 'session'/avatar
    // (0) -> immediately left of the avatar. For guests, priority 15 sits left
    // of the 'signUp' (10) / 'logIn' (0) pair, keeping those together.
    const priority = app.session.user ? 5 : 15;

    items.add(
      'font-sizer',
      m('div', { className: 'HeaderDropdown FontSizerDropdown' },
        Button.component(
          {
            className: 'Button Button--flat',
            icon: 'fas fa-text-height',
            title: app.translator.trans('linkrobins-font-sizer.forum.header_button.title'),
            'aria-label': app.translator.trans('linkrobins-font-sizer.forum.header_button.title'),
            onclick: () => app.modal.show(FontSizerModal),
          },
          app.translator.trans('linkrobins-font-sizer.forum.header_button.label')
        )
      ),
      priority
    );
  });
});
