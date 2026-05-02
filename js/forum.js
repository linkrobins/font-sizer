'use strict';

(function() {

    document.addEventListener('DOMContentLoaded', function() {
        try {
            var el = document.getElementById('flarum-json-payload');
            if (!el) return;
            var payload = JSON.parse(el.textContent);
            var scale = parseInt((payload.resources[0].attributes['linkrobinsFontScale']) || '100', 10);
            if (!scale || scale === 100) return;

            var pct = scale + '%';

            var style = document.createElement('style');
            style.textContent = [
                '.Post-body, .Post-body p, .Post-body li,',
                '.Post-body blockquote, .Post-body td, .Post-body th,',
                '.Post-body pre, .Post-body code {',
                '    font-size: ' + pct + ' !important;',
                '}',
                '.DiscussionHero .DiscussionHero-title,',
                '.DiscussionPage .Hero-title,',
                'h2.DiscussionListItem-title, h3.DiscussionListItem-title {',
                '    font-size: ' + pct + ' !important;',
                '}'
            ].join('\n');
            document.head.appendChild(style);
        } catch (e) {}
    });

    app.initializers.add('linkrobins-font-sizer', function() {});

})();

module.exports = {};
