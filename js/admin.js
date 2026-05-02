'use strict';

(function() {
    var _extend      = flarum.reg.get('core', 'common/extend');
    var override     = _extend.override;
    var ExtensionPage = flarum.reg.get('core', 'admin/components/ExtensionPage');
    var saveSettings = flarum.reg.get('core', 'admin/utils/saveSettings');

    var SETTING_KEY  = 'linkrobins-font-sizer.scale';
    var MIN = 100; // percent — treated as "default"
    var MAX = 150;

    override(ExtensionPage.prototype, 'content', function(original) {
        if (!this.extension || this.extension.id !== 'linkrobins-font-sizer') {
            return original();
        }

        var self = this;

        
        var saved = parseInt(app.data.settings[SETTING_KEY] || MIN, 10);

        
        if (!self._scale) {
            self._scale = saved;
        }

        function onInput(e) {
            var val = parseInt(e.target.value, 10);
            self._scale = val;

            
            var existing = document.getElementById('lr-font-sizer-preview');
            if (val === MIN) {
                if (existing) existing.remove();
            } else {
                if (!existing) { existing = document.createElement('style'); existing.id = 'lr-font-sizer-preview'; document.head.appendChild(existing); }
                var pct = val + '%';
                existing.textContent = [
                    '.Post-body, .Post-body p, .Post-body li,',
                    '.Post-body blockquote, .Post-body td, .Post-body th,',
                    '.Post-body pre, .Post-body code { font-size: ' + pct + ' !important; }',
                    '.DiscussionHero .DiscussionHero-title,',
                    '.DiscussionPage .Hero-title,',
                    'h2.DiscussionListItem-title, h3.DiscussionListItem-title { font-size: ' + pct + ' !important; }'
                ].join('\n');
            }

            
            var body = {};
            body[SETTING_KEY] = String(val);
            saveSettings(body).catch(function() {});

            m.redraw();
        }

        var current = self._scale;
        var label   = current === MIN
            ? 'Default (' + MIN + '%)'
            : current + '%';

        return m('div', { className: 'ExtensionPage-settings' },
            m('div', { className: 'container' },
                m('div', { className: 'Form-group' }, [
                    m('label', 'Font Size'),
                    m('p', { className: 'helpText' },
                        'Adjusts the font size for post titles and post body text only. ' +
                        'All the way left is the default. Changes save and apply instantly.'
                    ),
                    m('div', { style: 'display:flex;align-items:center;gap:1rem;margin-top:.5rem;' }, [
                        m('input', {
                            type: 'range',
                            min: MIN,
                            max: MAX,
                            step: 1,
                            value: current,
                            oninput: onInput,
                            style: 'flex:1;',
                        }),
                        m('span', {
                            style: 'min-width:5rem;font-weight:600;font-size:.9rem;color:var(--body-color);',
                        }, label),
                    ]),
                    current !== MIN && m('button', {
                        className: 'Button Button--text',
                        style: 'margin-top:.5rem;font-size:.8rem;',
                        type: 'button',
                        onclick: function() {
                            self._scale = MIN;
                            var p = document.getElementById('lr-font-sizer-preview');
                            if (p) p.remove();
                            var body = {};
                            body[SETTING_KEY] = String(MIN);
                            saveSettings(body).catch(function() {});
                            m.redraw();
                        },
                    }, 'Reset to default'),
                ])
            )
        );
    });

    app.initializers.add('linkrobins-font-sizer-admin', function() {});

})();

module.exports = {};
