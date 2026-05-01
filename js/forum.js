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
            if (scale && scale !== 100) {
                document.documentElement.style.fontSize = scale + '%';
            }
        } catch (e) {}
    });

    app.initializers.add('linkrobins-font-sizer', function() {});

})();

module.exports = {};
