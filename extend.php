<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),

    (new Extend\Settings())
        // Clamp to the supported 80-150% range server-side so the forum
        // payload can never carry an out-of-range or non-numeric value,
        // whatever ends up in the settings table. Defense in depth: the
        // frontend also clamps on read.
        ->serializeToForum('linkrobinsFontScale', 'linkrobins-font-sizer.scale', function ($value) {
            // Non-numeric input resolves to the neutral 100%, never to the 80%
            // floor: a garbled settings row must not shrink the text for every
            // visitor who has no cookie. Mirrors clampScale() on the frontend.
            if (!is_numeric($value)) {
                return '100';
            }

            return (string) max(80, min(150, (int) $value));
        })
        // Only ever emit one of the two known values.
        ->serializeToForum('linkrobinsFontSizerUi', 'linkrobins-font-sizer.ui', function ($value) {
            return $value === 'large' ? 'large' : 'default';
        })
        // Base sizes (px) that scaling multiplies. Clamped to the same
        // 10-32px range the admin inputs allow; the stylesheet falls back to
        // the historical defaults (14/12/16) when these match them.
        ->serializeToForum('linkrobinsFontSizerTextBase', 'linkrobins-font-sizer.text_base', function ($value) {
            return (string) max(10, min(32, (int) $value));
        })
        ->serializeToForum('linkrobinsFontSizerTextSmall', 'linkrobins-font-sizer.text_small', function ($value) {
            return (string) max(10, min(32, (int) $value));
        })
        ->serializeToForum('linkrobinsFontSizerTextTitle', 'linkrobins-font-sizer.text_title', function ($value) {
            return (string) max(10, min(32, (int) $value));
        })
        ->default('linkrobins-font-sizer.scale', '100')
        ->default('linkrobins-font-sizer.ui',    'default')
        ->default('linkrobins-font-sizer.text_base',  '14')
        ->default('linkrobins-font-sizer.text_small', '12')
        ->default('linkrobins-font-sizer.text_title', '16'),

    new Extend\Locales(__DIR__ . '/locale'),
];
