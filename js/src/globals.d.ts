import type Mithril from 'mithril';

// Flarum exposes Mithril's hyperscript as a runtime global `m`; core bundles
// Mithril and registers it on `window`, so extensions call `m(...)` directly
// rather than importing it (importing 'mithril' would bundle a second copy).
declare global {
  const m: Mithril.Static;
}

export {};
