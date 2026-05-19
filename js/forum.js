'use strict';

(function() {

    var COOKIE_TEXT = 'lr_text_scale';
    var COOKIE_UI   = 'lr_ui_size';
    var TEXT_MIN    = 100;
    var TEXT_MAX    = 150;
    var UI_LARGE    = 115;

    // --- i18n helpers ---------------------------------------------------
    //
    // The modal is built with raw `document.createElement` and assigns
    // strings via `.textContent`, not through Mithril -- so we always
    // need a plain string back from the translator. tx() asks Flarum's
    // translator for the extracted string form, and falls back to the
    // key itself if the translator isn't ready yet (e.g. if the script
    // somehow runs before `app.translator` is bound). The fallback keeps
    // the UI rendering rather than throwing.
    function tx(key, params) {
        try {
            if (typeof app !== 'undefined' && app && app.translator
                && typeof app.translator.trans === 'function') {
                return app.translator.trans(key, params || {}, true);
            }
        } catch (e) {}
        return key;
    }

    var DEFAULTS = {
        heroMobile:   16,
        heroDesktop:  22,
        body:         14,
        listMobile:   14,
        listDesktop:  16
    };

    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    }

    function setCookie(name, value) {
        var expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        // Add `Secure` on HTTPS pages so the cookie is never sent over
        // plain HTTP. The cookie payload isn't sensitive (it's just a
        // percentage or 'large'/'default'), but `Secure` is the
        // standard hygiene and costs nothing on https sites; on http
        // dev sites we leave it off so the cookie still applies.
        var secure = '';
        try {
            if (typeof location !== 'undefined' && location.protocol === 'https:') {
                secure = '; Secure';
            }
        } catch (e) {}
        document.cookie = name + '=' + encodeURIComponent(value) +
            '; expires=' + expires.toUTCString() + '; path=/; SameSite=Lax' + secure;
    }

    // Clamp a percent value to the [TEXT_MIN, TEXT_MAX] range. Used on
    // cookie load so a stale or manually-tampered cookie can't produce
    // 1000% text or `NaNpx` CSS output.
    function clampScale(n) {
        if (typeof n !== 'number' || isNaN(n)) return TEXT_MIN;
        if (n < TEXT_MIN) return TEXT_MIN;
        if (n > TEXT_MAX) return TEXT_MAX;
        return n;
    }

    function getAdminDefault() {
        try {
            var el = document.getElementById('flarum-json-payload');
            if (!el) return TEXT_MIN;
            var payload = JSON.parse(el.textContent);
            return parseInt((payload.resources[0].attributes['linkrobinsFontScale']) || TEXT_MIN, 10);
        } catch (e) { return TEXT_MIN; }
    }

    var textScale, uiLarge;

    function getAdminUIDefault() {
        try {
            var el = document.getElementById('flarum-json-payload');
            if (!el) return false;
            var payload = JSON.parse(el.textContent);
            return (payload.resources[0].attributes['linkrobinsFontSizerUi'] === 'large');
        } catch (e) { return false; }
    }

    function loadState() {
        var cookieText = getCookie(COOKIE_TEXT);
        var cookieUI   = getCookie(COOKIE_UI);
        // clampScale handles parseInt() returning NaN (garbage cookie)
        // and out-of-range values, falling back to TEXT_MIN.
        textScale = cookieText !== null
            ? clampScale(parseInt(cookieText, 10))
            : clampScale(getAdminDefault());
        uiLarge   = cookieUI   !== null ? (cookieUI === 'large')   : getAdminUIDefault();
    }

    function px(base, scale) {
        return Math.round(base * (scale / 100)) + 'px';
    }

    function injectTextStyles() {
        var old = document.getElementById('lr-text-sizer');
        if (old) old.remove();
        if (textScale === TEXT_MIN) return;

        var s = document.createElement('style');
        s.id = 'lr-text-sizer';
        s.textContent = [
            '.Post-body, .Post-body p, .Post-body li,',
            '.Post-body blockquote, .Post-body td, .Post-body th,',
            '.Post-body pre, .Post-body code {',
            '    font-size: ' + px(DEFAULTS.body, textScale) + ' !important;',
            '}',
            '.item-excerpt, .DiscussionListItem-excerpt {',
            '    font-size: ' + px(DEFAULTS.body - 2, textScale) + ' !important;',
            '}',
            '.Hero h1, .DiscussionHero .DiscussionHero-title {',
            '    font-size: ' + px(DEFAULTS.heroMobile, textScale) + ' !important;',
            '}',
            '@media (min-width: 768px) {',
            '    .Hero h1, .DiscussionHero .DiscussionHero-title {',
            '        font-size: ' + px(DEFAULTS.heroDesktop, textScale) + ' !important;',
            '    }',
            '}',
            '.DiscussionListItem-title {',
            '    font-size: ' + px(DEFAULTS.listMobile, textScale) + ' !important;',
            '}',
            '@media (min-width: 768px) {',
            '    .DiscussionListItem-title {',
            '        font-size: ' + px(DEFAULTS.listDesktop, textScale) + ' !important;',
            '    }',
            '}'
        ].join('\n');
        document.head.appendChild(s);
    }

    function injectUIStyles() {
        var old = document.getElementById('lr-ui-sizer');
        if (old) old.remove();
        if (!uiLarge) return;

        var s = document.createElement('style');
        s.id = 'lr-ui-sizer';
        s.textContent = [
            '#header .Button, #header .LinksButton {',
            '    font-size: ' + px(14, UI_LARGE) + ' !important;',
            '}',
            '.DiscussionPage-nav .Button {',
            '    font-size: ' + px(14, UI_LARGE) + ' !important;',
            '}',
            '.item-nav .Button, .item-nav .LinkButton, .item-nav .TagLinkButton,',
            '.item-nav .Dropdown-menu .Button, .item-nav .Dropdown-menu .LinkButton {',
            '    font-size: ' + px(14, UI_LARGE) + ' !important;',
            '}',
            '.Button:not(.Post-body .Button) {',
            '    font-size: ' + px(13, UI_LARGE) + ' !important;',
            '}',
            '.TagLabel-name {',
            '    font-size: ' + px(12, UI_LARGE) + ' !important;',
            '}',
            '.DiscussionListItem-info {',
            '    font-size: ' + px(12, UI_LARGE) + ' !important;',
            '}',
            '.App-footer, #modern-footer {',
            '    font-size: ' + px(13, UI_LARGE) + ' !important;',
            '}'
        ].join('\n');
        document.head.appendChild(s);
    }

    function applyAll() {
        injectTextStyles();
        injectUIStyles();
    }

    (function() {
        var s = document.createElement('style');
        s.textContent = '@media (min-width: 768px) {' +
            ' .FontSizerDropdown .Button-label { display: none; }' +
            ' .FontSizerDropdown .Button { width: 36px; padding: 8px 0; }' +
            ' .FontSizerDropdown .Button-icon { font-size: 16px; margin: 0; }' +
            ' }';
        document.head.appendChild(s);
    })();


    function textLabel(val) {
        return tx('linkrobins-font-sizer.forum.modal.reading_text_value', { percent: val });
    }

    function openModal() {
        if (document.getElementById('lr-sizer-modal-overlay')) return;

        var overlay = document.createElement('div');
        overlay.id = 'lr-sizer-modal-overlay';
        overlay.style.cssText = [
            'position:fixed;inset:0;z-index:99999;',
            'background:rgba(0,0,0,0.5);',
            'display:flex;align-items:center;justify-content:center;',
            'padding:16px;'
        ].join('');

        var box = document.createElement('div');
        box.style.cssText = [
            'background:var(--body-bg);',
            'color:var(--body-color);',
            'border-radius:var(--border-radius, 4px);',
            'padding:24px 24px 20px;',
            'width:360px;max-width:100%;',
            'box-shadow:0 7px 15px var(--shadow-color);',
            'font-family:inherit;font-size:14px;'
        ].join('');

        var titleRow = document.createElement('div');
        titleRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;';

        var titleEl = document.createElement('strong');
        titleEl.style.cssText = 'font-size:1rem;color:var(--heading-color,var(--body-color));';
        titleEl.textContent = tx('linkrobins-font-sizer.forum.modal.title');

        var closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        // Accessible label for the close button (screen-readers see this
        // instead of the bare "×" glyph).
        closeBtn.setAttribute('aria-label', tx('linkrobins-font-sizer.forum.modal.close_button_label'));
        closeBtn.style.cssText = [
            'background:none;border:none;cursor:pointer;',
            'font-size:1.4rem;line-height:1;padding:0;',
            'color:var(--muted-color);',
            'transition:color .1s;'
        ].join('');
        closeBtn.onmouseover = function() { closeBtn.style.color = 'var(--body-color)'; };
        closeBtn.onmouseout  = function() { closeBtn.style.color = 'var(--muted-color)'; };
        closeBtn.onclick = closeModal;

        titleRow.appendChild(titleEl);
        titleRow.appendChild(closeBtn);

        function divider() {
            var hr = document.createElement('hr');
            hr.style.cssText = 'border:none;margin:0 -24px 16px;';
            return hr;
        }

        function sectionLabel(text) {
            var el = document.createElement('div');
            el.style.cssText = [
                'font-size:.75rem;font-weight:700;',
                'text-transform:uppercase;letter-spacing:.06em;',
                'color:var(--muted-color);margin-bottom:10px;'
            ].join('');
            el.textContent = text;
            return el;
        }

        var sec1 = document.createElement('div');
        sec1.style.marginBottom = '18px';
        sec1.appendChild(sectionLabel(tx('linkrobins-font-sizer.forum.modal.reading_text_heading')));

        var sliderRow = document.createElement('div');
        sliderRow.style.cssText = 'display:flex;align-items:center;gap:12px;';

        var slider = document.createElement('input');
        slider.type  = 'range';
        slider.min   = TEXT_MIN;
        slider.max   = TEXT_MAX;
        slider.step  = 5;
        slider.value = textScale;
        slider.style.cssText = 'flex:1;accent-color:var(--primary-color);cursor:pointer;';

        var sliderLbl = document.createElement('span');
        sliderLbl.style.cssText = 'min-width:80px;font-size:.8rem;font-weight:600;text-align:right;color:var(--body-color);white-space:nowrap;';
        sliderLbl.textContent = textLabel(textScale);

        slider.oninput = function() {
            textScale = parseInt(slider.value, 10);
            sliderLbl.textContent = textLabel(textScale);
            setCookie(COOKIE_TEXT, String(textScale));
            injectTextStyles();
        };

        sliderRow.appendChild(slider);
        sliderRow.appendChild(sliderLbl);
        sec1.appendChild(sliderRow);

        var hint = document.createElement('div');
        hint.style.cssText = 'font-size:.75rem;color:var(--muted-color);margin-top:6px;';
        hint.textContent = tx('linkrobins-font-sizer.forum.modal.reading_text_hint');
        sec1.appendChild(hint);

        var sec2 = document.createElement('div');
        sec2.style.marginBottom = '20px';
        sec2.appendChild(sectionLabel(tx('linkrobins-font-sizer.forum.modal.interface_size_heading')));

        var btnGroup = document.createElement('div');
        btnGroup.style.cssText = 'display:flex;gap:8px;';

        function makeUIBtn(label, isLarge) {
            var btn = document.createElement('button');
            btn.textContent = label;
            btn.style.cssText = [
                'flex:1;padding:8px 0;',
                'border-radius:var(--border-radius,4px);',
                'cursor:pointer;font-size:.85rem;font-weight:600;',
                'border:1px solid var(--control-color);',
                'transition:all .15s;font-family:inherit;'
            ].join('');
            function refresh() {
                var active = (uiLarge === isLarge);
                btn.style.background = active ? 'var(--primary-color)' : 'var(--body-bg)';
                btn.style.color      = active ? '#fff' : 'var(--body-color)';
                btn.style.borderColor = active ? 'var(--primary-color)' : 'var(--control-color)';
            }
            refresh();
            btn.onclick = function() {
                uiLarge = isLarge;
                setCookie(COOKIE_UI, isLarge ? 'large' : 'default');
                injectUIStyles();
                refreshUIBtns();
            };
            return { el: btn, refresh: refresh };
        }

        var btnDef   = makeUIBtn(tx('linkrobins-font-sizer.forum.modal.ui_default'), false);
        var btnLarge = makeUIBtn(tx('linkrobins-font-sizer.forum.modal.ui_large'),   true);
        function refreshUIBtns() { btnDef.refresh(); btnLarge.refresh(); }

        var uiHint = document.createElement('div');
        uiHint.style.cssText = 'font-size:.75rem;color:var(--muted-color);margin-top:6px;';
        uiHint.textContent = tx('linkrobins-font-sizer.forum.modal.interface_size_hint');

        btnGroup.appendChild(btnDef.el);
        btnGroup.appendChild(btnLarge.el);
        sec2.appendChild(btnGroup);
        sec2.appendChild(uiHint);

        var resetRow = document.createElement('div');
        resetRow.style.cssText = 'padding-top:12px;text-align:center;';
        var resetBtn = document.createElement('button');
        resetBtn.textContent = tx('linkrobins-font-sizer.forum.modal.reset_button');
        resetBtn.style.cssText = [
            'background:none;border:none;cursor:pointer;',
            'font-size:.8rem;color:var(--muted-color);',
            'text-decoration:underline;font-family:inherit;',
            'transition:color .1s;'
        ].join('');
        resetBtn.onmouseover = function() { resetBtn.style.color = 'var(--body-color)'; };
        resetBtn.onmouseout  = function() { resetBtn.style.color = 'var(--muted-color)'; };
        resetBtn.onclick = function() {
            var d  = clampScale(getAdminDefault());
            var ui = getAdminUIDefault();
            textScale    = d;
            uiLarge      = ui;
            slider.value = d;
            sliderLbl.textContent = textLabel(d);
            setCookie(COOKIE_TEXT, String(d));
            setCookie(COOKIE_UI,   ui ? 'large' : 'default');
            applyAll();
            refreshUIBtns();
        };
        resetRow.appendChild(resetBtn);

        box.appendChild(titleRow);
        box.appendChild(divider());
        box.appendChild(sec1);
        box.appendChild(sec2);
        box.appendChild(resetRow);
        overlay.appendChild(box);
        overlay.onclick = function(e) { if (e.target === overlay) closeModal(); };

        document.addEventListener('keydown', onKeydown);
        document.body.appendChild(overlay);
    }

    function onKeydown(e) {
        if (e.key === 'Escape') { closeModal(); }
    }

    function closeModal() {
        var el = document.getElementById('lr-sizer-modal-overlay');
        if (el) el.remove();
        document.removeEventListener('keydown', onKeydown);
    }

    app.initializers.add('linkrobins-font-sizer', function() {
        loadState();
        applyAll();

        var extend          = flarum.reg.get('core', 'common/extend').extend;
        var HeaderSecondary = flarum.reg.get('core', 'forum/components/HeaderSecondary');

        extend(HeaderSecondary.prototype, 'items', function(items) {
            items.add('font-sizer',
                m('div', { className: 'HeaderDropdown FontSizerDropdown' },
                    m('button', {
                        type: 'button',
                        className: 'Button Button--flat',
                        title: tx('linkrobins-font-sizer.forum.header_button.title'),
                        'aria-label': tx('linkrobins-font-sizer.forum.header_button.title'),
                        onclick: openModal
                    },
                        m('i', { className: 'icon fas fa-text-height Button-icon', 'aria-hidden': 'true' }),
                        m('span', { className: 'Button-label' },
                            m('span', { className: 'Button-labelText' }, tx('linkrobins-font-sizer.forum.header_button.label'))
                        )
                    )
                ),
                -100
            );
        });
    });

    document.addEventListener('DOMContentLoaded', function() {
        loadState();
        applyAll();
    });

})();

module.exports = {};
