<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js'),

    (new Extend\Settings())
        // Clamp to the supported 100-150% range server-side so the forum
        // payload can never carry an out-of-range or non-numeric value,
        // whatever ends up in the settings table. Defense in depth: the
        // frontend also clamps on read.
        ->serializeToForum('linkrobinsFontScale', 'linkrobins-font-sizer.scale', function ($value) {
            return (string) max(100, min(150, (int) $value));
        })
        // Only ever emit one of the two known values.
        ->serializeToForum('linkrobinsFontSizerUi', 'linkrobins-font-sizer.ui', function ($value) {
            return $value === 'large' ? 'large' : 'default';
        })
        ->default('linkrobins-font-sizer.scale', '100')
        ->default('linkrobins-font-sizer.ui',    'default'),

    new Extend\Locales(__DIR__ . '/locale'),
];
