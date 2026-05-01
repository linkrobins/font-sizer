'use strict';

(function() {
    // forum.js executes synchronously as the browser parses it, which is
    // BEFORE the flarum-json-payload <script> tag further down the page exists.
    // We must wait for DOMContentLoaded so the payload element is in the DOM.

    document.addEventListener('DOMContentLoaded', function() {
        try {
            var el = document.getElementById('flarum-json-payload');
            if (!el) return;
            var payload = JSON.parse(el.textContent);
            var scale = parseInt((payload.resources[0].attributes['linkrobinsFontScale']) || '100', 10);
            if (!scale || scale === 100) return;

            var ratio = scale / 100;
            document.documentElement.style.fontSize = scale + '%';

            var style = document.createElement('style');
            style.textContent = [
                'body, body * {',
                '    font-size: ' + ratio + 'em !important;',
                '}',
                'body .icon, body .Button-icon, body .Avatar,',
                'body i[class*="fa-"], body .emoji {',
                '    font-size: inherit !important;',
                '}'
            ].join('\n');
            document.head.appendChild(style);
        } catch (e) {}
    });

    app.initializers.add('linkrobins-font-sizer', function() {});

})();

module.exports = {};
