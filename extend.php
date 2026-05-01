<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/forum.js'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/admin.js'),

    (new Extend\Settings())
        ->serializeToForum('linkrobinsFontScale', 'linkrobins-font-sizer.scale')
        ->default('linkrobins-font-sizer.scale', '100'),
];
