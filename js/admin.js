'use strict';

(function() {
    var _extend       = flarum.reg.get('core', 'common/extend');
    var override      = _extend.override;
    var ExtensionPage = flarum.reg.get('core', 'admin/components/ExtensionPage');
    var saveSettings  = flarum.reg.get('core', 'admin/utils/saveSettings');

    var KEY_SCALE = 'linkrobins-font-sizer.scale';
    var KEY_UI    = 'linkrobins-font-sizer.ui';
    var MIN = 100;
    var MAX = 150;
    var UI_LARGE = 115;

    var saveTimer = null;

    function debouncedSave(body) {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
            saveSettings(body).catch(function() {});
        }, 500);
    }

    function currentBody(scale, uiLarge) {
        var b = {};
        b[KEY_SCALE] = String(scale);
        b[KEY_UI]    = uiLarge ? 'large' : 'default';
        return b;
    }

    override(ExtensionPage.prototype, 'content', function(original) {
        if (!this.extension || this.extension.id !== 'linkrobins-font-sizer') {
            return original();
        }

        var self = this;

        if (self._scale === undefined) {
            self._scale   = parseInt(app.data.settings[KEY_SCALE] || MIN, 10);
            self._uiLarge = (app.data.settings[KEY_UI] === 'large');
        }

        function onInput(e) {
            var val = parseInt(e.target.value, 10);
            self._scale = val;

            var ex = document.getElementById('lr-font-sizer-preview');
            if (val === MIN) {
                if (ex) ex.remove();
            } else {
                if (!ex) { ex = document.createElement('style'); ex.id = 'lr-font-sizer-preview'; document.head.appendChild(ex); }
                var D = { heroMobile: 16, heroDesktop: 22, body: 14, list: 14 };
                function px(base) { return Math.round(base * (val / 100)) + 'px'; }
                ex.textContent = [
                    '.Post-body, .Post-body p, .Post-body li,',
                    '.Post-body blockquote, .Post-body td, .Post-body th,',
                    '.Post-body pre, .Post-body code { font-size: ' + px(D.body) + ' !important; }',
                    '.Hero h1, .DiscussionHero .DiscussionHero-title { font-size: ' + px(D.heroMobile) + ' !important; }',
                    '@media (min-width: 768px) { .Hero h1, .DiscussionHero .DiscussionHero-title { font-size: ' + px(D.heroDesktop) + ' !important; } }',
                    '.DiscussionListItem-title { font-size: ' + px(D.list) + ' !important; }'
                ].join('\n');
            }

            debouncedSave(currentBody(val, self._uiLarge));
            m.redraw();
        }

        function setUI(isLarge) {
            self._uiLarge = isLarge;

            var ex = document.getElementById('lr-ui-sizer-preview');
            if (!isLarge) {
                if (ex) ex.remove();
            } else {
                if (!ex) { ex = document.createElement('style'); ex.id = 'lr-ui-sizer-preview'; document.head.appendChild(ex); }
                function upx(base) { return Math.round(base * (UI_LARGE / 100)) + 'px'; }
                ex.textContent = [
                    '#header .Button, #header .LinksButton { font-size: ' + upx(14) + ' !important; }',
                    '.item-nav .Button, .item-nav .LinkButton, .item-nav .TagLinkButton { font-size: ' + upx(14) + ' !important; }',
                    '.Button:not(.Post-body .Button) { font-size: ' + upx(13) + ' !important; }',
                    '.TagLabel-name { font-size: ' + upx(12) + ' !important; }',
                    '.DiscussionListItem-info { font-size: ' + upx(12) + ' !important; }'
                ].join('\n');
            }

            var body = {};
            body[KEY_SCALE] = String(self._scale);
            body[KEY_UI]    = isLarge ? 'large' : 'default';
            saveSettings(body).catch(function() {});
            m.redraw();
        }

        var current = self._scale;
        var uiLarge = self._uiLarge;
        var label   = current + '%';

        return m('div', { className: 'ExtensionPage-settings' },
            m('div', { className: 'container' },

                m('div', { className: 'Form-group' }, [
                    m('label', 'Default Reading Text Size'),
                    m('p', { className: 'helpText' },
                        'Sets the sitewide default for post body and title text. ' +
                        'Users can override this with the Font Size button in the header.'
                    ),
                    m('div', { style: 'display:flex;align-items:center;gap:1rem;margin-top:.5rem;' }, [
                        m('input', {
                            type: 'range',
                            min: MIN,
                            max: MAX,
                            step: 1,
                            value: current,
                            oninput: onInput,
                            style: 'flex:1;accent-color:var(--primary-color);',
                        }),
                        m('span', {
                            style: 'min-width:3rem;font-weight:600;font-size:.9rem;color:var(--body-color);text-align:right;',
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
                            if (saveTimer) clearTimeout(saveTimer);
                            saveSettings(currentBody(MIN, self._uiLarge)).catch(function() {});
                            m.redraw();
                        },
                    }, 'Reset to 100%'),
                ]),

                m('div', { className: 'Form-group' }, [
                    m('label', 'Default Interface Size'),
                    m('p', { className: 'helpText' },
                        'Sets the sitewide default for navigation, buttons, and UI elements. ' +
                        'Users can override this with the Font Size button in the header.'
                    ),
                    m('div', { className: 'ButtonGroup', style: 'margin-top:.5rem;' }, [
                        m('button', {
                            type: 'button',
                            className: 'Button' + (!uiLarge ? ' Button--primary' : ''),
                            onclick: function() { setUI(false); },
                        }, 'Default'),
                        m('button', {
                            type: 'button',
                            className: 'Button' + (uiLarge ? ' Button--primary' : ''),
                            onclick: function() { setUI(true); },
                        }, 'Large'),
                    ]),
                ])
            )
        );
    });

    app.initializers.add('linkrobins-font-sizer-admin', function() {});

})();

module.exports = {};
