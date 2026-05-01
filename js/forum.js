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

            var base = 16;
            var scaled = base * (scale / 100);
            document.documentElement.style.fontSize = scaled + 'px';

            var style = document.createElement('style');
            style.textContent = [
                'body { font-size: ' + scaled + 'px !important; }',
                'body p, body li, body td, body th, body span, body a,',
                'body h1, body h2, body h3, body h4, body h5, body h6,',
                'body input, body textarea, body button, body label,',
                'body .Post-body, body .DiscussionListItem-title,',
                'body .PostUser-name, body .DiscussionListItem-info {',
                '    font-size: ' + scaled + 'px !important;',
                '}'
            ].join('\n');
            document.head.appendChild(style);
        } catch (e) {}
    });

    app.initializers.add('linkrobins-font-sizer', function() {});

})();

module.exports = {};
