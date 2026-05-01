# Link Robins Font Sizer

A Flarum 2.0 extension that lets you scale the base font size of your entire forum from the admin panel — no CSS editing required.

## Features

- **Slider control** in the extension's admin page
- **Instant save** — no submit button, changes are applied and persisted as you drag
- **Live preview** — the admin panel itself resizes as you adjust the slider so you can see the effect immediately
- **Reset button** — appears when the value is above default, letting you snap back to 100% in one click
- **Theme agnostic** — uses `font-size` on the `<html>` element so all `rem`-based sizing in Flarum and its extensions scales proportionally

## How it works

The slider runs from **100%** (default, all the way left) to **150%** (all the way right) in 1% increments. The selected value is saved to Flarum's settings table under the key `linkrobins-font-sizer.scale` and served to the forum frontend in the page payload.


## Installation

```
composer require linkrobins/font-sizer
```

## Compatibility

- Flarum 2.0 RC1+
- No dependencies beyond `flarum/core`

## License

MIT
