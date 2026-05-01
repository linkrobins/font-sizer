'use strict';

(function() {

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
