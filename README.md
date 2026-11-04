# Link Robins Font Sizer

A Flarum 2.0 extension that gives users accessibility-focused font size controls directly in the forum header, no CSS editing required. Admins set sitewide defaults; users override them with their own preferences, saved in cookies.

## Features

- **Header button**: a `fa-text-height` icon in the forum header opens a size dialog for all users, including guests
- **Reading text size**: a slider that scales post body text and discussion titles from 80% to 150% in 5% increments
- **Interface size toggle**: Default or Large (115%) mode for navigation, buttons, and other UI elements
- **Cookie persistence**: preferences are saved for 1 year so returning visitors keep their settings
- **Admin defaults**: set a sitewide default for both reading text size and interface size from the extension settings page
- **Configurable base sizes**: tell the extension what your theme's post, excerpt, and title sizes are (in px) from the settings page; useful for fonts with a small x-height that need a larger base, no Custom CSS required
- **Live preview**: the admin settings page previews every control as you change it
- **Reset to site default**: a button in the dialog clears the visitor's choices and returns them to whatever you set as the default
- **Debounced save**: admin changes save 300ms after you stop adjusting, so rapid changes coalesce into a single write
- **No permissions needed**: every visitor can use the button, and nothing about it is stored on your server per user; preferences live in the visitor's own browser
- **Theme agnostic**: uses Flarum CSS variables throughout; works on all light and dark themes

## How it works

The reading text size runs from **80%** to **150%** in 5% increments, with **100%** being the Flarum default at which the extension asserts nothing. The interface size toggle offers **Default** or **Large** (115%). Both values are stored as cookies (`lr_text_scale` and `lr_ui_size`) on the user's browser. If no cookie exists, the user sees whatever the admin has configured as the sitewide default.

Admin defaults are saved to Flarum's settings table under `linkrobins-font-sizer.scale` and `linkrobins-font-sizer.ui`, and served to the forum frontend in the page payload.

When a user picks a non-default size, the extension sets two CSS custom properties (`--lr-text-scale` and `--lr-ui-scale`) on the `<html>` element and toggles a gate class (`lr-text-scaling` / `lr-ui-scaling`). At the default size both are removed, so the theme renders untouched. The shipped rules, gated behind those classes, multiply each target's base size by the variable:

```css
html.lr-text-scaling .Post-body { font-size: calc(var(--lr-text-base, 14px) * var(--lr-text-scale, 1)); }
```

### Base sizes

The pixel bases the scale multiplies are themselves configurable, because a theme's font may want different starting sizes than Flarum's stock 14px (many serif fonts render optically smaller at the same px size). Three base variables cover the reading-text targets:

| Variable | Default | Applies to |
| --- | --- | --- |
| `--lr-text-base` | `14px` | Post bodies, mobile discussion-list titles |
| `--lr-text-small` | `12px` | Excerpts |
| `--lr-text-title` | `16px` | Heroes and desktop list titles (the desktop hero derives from it at the historical 16:22 ratio) |

There are two ways to set them:

- **Admin settings page** (no CSS needed): the "Base Text Sizes" inputs. Values changed here apply sitewide, for everyone, even at 100% scale (a dedicated gate class, `lr-text-bases`, activates the rules), and user scaling multiplies on top.
- **Custom CSS** (theme authors): `:root { --lr-text-base: 16px; }`. This only takes effect while a user is scaling, i.e. it tells the extension what base your theme's own CSS already establishes, so scaling starts from the right size. The admin settings, when changed away from the defaults, take precedence over this route.

## Extending it to your own content

Out of the box the extension scales core's reading text (post bodies, titles, excerpts) and interface chrome. Because text set in pixels can only be scaled by the element that owns it, content from other extensions opts in explicitly. There are two ways, and both are live: they update as the user changes their size, and they are inert at the default size.

**1. Add a class** to your readable-content root or chrome element:

```js
// readable content (article bodies, chat messages, custom posts)
m('div', { className: 'MyExtension-body FontSizer-text' }, ...)

// interface chrome (custom nav items, toolbars)
m('button', { className: 'Button FontSizer-ui' }, ...)
```

**2. Or reference the variables** directly in your own LESS/CSS, with a fallback of `1` so nothing changes when the extension is absent or at its default:

```css
.MyExtension-body { font-size: calc(1em * var(--lr-text-scale, 1)); }
```

Use `--lr-text-scale` for reading content and `--lr-ui-scale` for interface elements.

## Installation

```sh
composer require linkrobins/font-sizer
```

Then switch it on in the admin panel's Extensions page. The defaults are ready to use; adjust them on the extension's settings page if you like.

To update later: `composer update linkrobins/font-sizer`, then `php flarum cache:clear`.

## Compatibility

- Flarum 2.0 or later
- PHP 8.3+
- No dependencies beyond `flarum/core`

## License

MIT
