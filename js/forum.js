'use strict';

(function() {

    var scale;

    var DEFAULTS = {
        heroMobile:  16,
        heroDesktop: 22,
        body:        14,
        list:        14
    };

    function getScale() {
        try {
            var el = document.getElementById('flarum-json-payload');
            if (!el) return 100;
            var payload = JSON.parse(el.textContent);
            return parseInt((payload.resources[0].attributes['linkrobinsFontScale']) || '100', 10);
        } catch (e) { return 100; }
    }

    function px(base) {
        return Math.round(base * (scale / 100)) + 'px';
    }

    function injectStyles() {
        var old = document.getElementById('lr-font-sizer');
        if (old) old.remove();

        if (!scale || scale === 100) return;

        var style = document.createElement('style');
        style.id = 'lr-font-sizer';
        style.textContent = [
            '.Post-body, .Post-body p, .Post-body li,',
            '.Post-body blockquote, .Post-body td, .Post-body th,',
            '.Post-body pre, .Post-body code {',
            '    font-size: ' + px(DEFAULTS.body) + ' !important;',
            '}',

            '.Hero h1, .DiscussionHero .DiscussionHero-title {',
            '    font-size: ' + px(DEFAULTS.heroMobile) + ' !important;',
            '}',
            '@media (min-width: 768px) {',
            '    .Hero h1, .DiscussionHero .DiscussionHero-title {',
            '        font-size: ' + px(DEFAULTS.heroDesktop) + ' !important;',
            '    }',
            '}',
            '.DiscussionListItem-title {',
            '    font-size: ' + px(DEFAULTS.list) + ' !important;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    document.addEventListener('DOMContentLoaded', function() {
        scale = getScale();
        injectStyles();
    });

    app.initializers.add('linkrobins-font-sizer', function() {
        scale = getScale();
        injectStyles();
    });

})();

module.exports = {};
