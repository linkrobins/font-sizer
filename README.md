# Link Robins Font Sizer

A Flarum 2.0 extension that gives users accessibility-focused font size controls directly in the forum header — no CSS editing required. Admins set sitewide defaults; users override them with their own preferences, saved in cookies.

## Features

- **Header button** — a font size icon in the forum header opens a modal for all users, including guests
- **Reading text slider** — scales post body text and discussion titles from 100% to 150% in 5% increments
- **Interface size toggle** — Default or Large (115%) mode for navigation, buttons, and other UI elements
- **Cookie persistence** — preferences are saved for 1 year so returning visitors keep their settings
- **Admin defaults** — set a sitewide default for both reading text size and interface size from the extension settings page
- **Live preview** — the admin panel previews changes as you drag the slider
- **Debounced save** — settings save 500ms after you stop dragging to prevent API conflicts
- **Theme agnostic** — uses Flarum CSS variables throughout; works on all light and dark themes

## How it works

The reading text slider runs from **100%** (Flarum default) to **150%** in 5% increments. The interface size toggle offers **Default** or **Large** (115%). Both values are stored as cookies (`lr_text_scale` and `lr_ui_size`) on the user's browser. If no cookie exists, the user sees whatever the admin has configured as the sitewide default.

Admin defaults are saved to Flarum's settings table under `linkrobins-font-sizer.scale` and `linkrobins-font-sizer.ui`, and served to the forum frontend in the page payload.

## Installation

```
composer require linkrobins/font-sizer
```

## Compatibility

- Flarum 2.0 RC1+
- No dependencies beyond `flarum/core`

## License

MIT