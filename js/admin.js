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

            
            document.documentElement.style.fontSize = val === MIN ? '' : val + '%';

            
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
                        'Adjusts the base font size across the entire forum. ' +
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
                            document.documentElement.style.fontSize = '';
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
