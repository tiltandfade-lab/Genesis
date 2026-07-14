---
type: system-spec
project: Genesis
status: SPECCED — all forks ruled (Adam design-talk + Fable review 2026-07-05); build-ready as wave 3
updated: 2026-07-05
depends-on: the pass-2 battle-visual GL-lifecycle fixes (REVIEW-FIXES-0705-visual) — the lazy
  live-3D grid REQUIRES correct figure/texture dispose (LANDED — verified on master 2026-07-05:
  LRU PIXEL_SKIN_CACHE cap 128 + disposePixelSkinCache, shared-aware clearGroup, disposeWholeObjectCaches)
---

# BESTIARY MANUAL — "our own Monster Manual" (a dev/authoring instrument)

A browsable, in-browser Monster Manual for the whole game: every creature with a **live 3D
render**, full stats, actions, traits, the spice-graded **d8 flavor table**, and its narrative
bits — so Adam can do a deep overview of the entire roster and dictate precise per-monster edit
requests. Read-only in v1 (editable-in-bestiary is banked as a dream *game* feature).

**Access model (updated 2026-07-05):** the Monster Manual is **registered app #1 of the Reference
Shelf** (docs/REFERENCE-SHELF.md) — reached from a button on the game's opening screen, alongside
the Wiki (and, later, Props & Scenery). It mounts into the shelf's shared shell; its lazy-grid
mount/teardown wires into the shell lifecycle (teardown = dispose every live canvas + release the
shared renderer). It remains directly openable over localhost for dev/QA. It never runs on the
game's per-turn hot paths.

## Why it's cheap (the disk/perf answer, ruled)

- Creature "models" are **procedural builder functions** (`dev/model-qa/creatures/*.js` +
  `theater-parts.js`), not GLB assets — a few KB of code each, already in the repo.
- The manual **reuses the game's own figure-build path** (`theater-figures.js`
  `WHOLE_OBJECT_REGISTRY` → builder, with the `theaterArchetypeFor` fallback) and the game's
  **live data** (`data/bestiary.js`, `data/realm-bestiary.js`). Zero new assets, zero data
  duplication → **the lightest option on disk**, and it can never drift from what battle renders.
- The only real cost is **runtime GPU memory** — solved by lazy rendering (below), not
  pre-rendered images.

## Rulings (locked at design-talk)

1. **Live 3D, lazy-loaded.** Grid thumbnails are live mini-canvases mounted on scroll-into-view
   (IntersectionObserver) and **disposed on scroll-away**; the detail view is one full rotatable
   viewer. NOT static PNGs (those would be the disk bloat).
2. **Both corpora, unified** — ~1,817 entries (510 `BESTIARY` + 1,307 `REALM_BESTIARY`),
   filterable.
3. **Read-only** — dictate edits in chat; each entry shows a stable id to reference.
4. **Live game data** — served over the existing localhost; edit source → recompile → refresh.

## Non-goals (v1)

In-page editing / write-back; annotations export; a built portable snapshot; any change to the
game or to `data/*` shapes; mobile layout; printing.

---

## Architecture

### Where it lives
`src/ui/ref-bestiary.js` — a game module with its own `<script type="module">` tag in genesis.html
(the exact theater-parts/verbs/figures precedent, tags at genesis.html:1239/1246/1253; same
check-manifest ES-module exemption; loads AFTER theater-boot's tag). It imports `three` via the
existing importmap and `resolveWholeObject` from `./theater-figures.js` (an existing ES export,
theater-figures.js:710). It reads the classic-script globals `BESTIARY`, `REALM_BESTIARY`,
`MONSTER_FLAVOR`, `MODEL_RECIPES`, and `theaterArchetypeFor` (src/engine/theater-data.js:971) off
`window`. **`data/monster-flavor.js` is already in genesis.html's load order — confirm, don't
re-add.** No standalone dev page in v1 (the shelf over localhost is the dev access).

### The figure seam (new, tiny — part of S2)
theater-boot.js keeps `figureFor` (its :2248) and `clearGroup`/`disposeMeshMaybeShared` (its :~2620,
already shared-tag-aware: cached whole-object geometry + LRU pixel-skin textures are tagged
`userData.shared` and skipped) module-private. S2 adds ONE exposure block next to the existing
`window.Theater = {...}` (:4066) — no existing method changes shape:
```js
// REFERENCE-SHELF seam: build/dispose one standalone figure outside the battle stage.
window.Theater.refFigure = {
  build: function(o){ return figureFor(o.archetype, o.seed, o.tint, o.silhouette, o.weapon, o.recipeSlug, null, "foe", null); },
  dispose: function(group){ clearGroup(group); }
};
```
The manual calls `build` with: `recipeSlug` = the BESTIARY id (regular corpus) or `entry.model`
(realm corpus); `archetype` = `theaterArchetypeFor(type, size, name)`; `seed` = a stable hash of the
entry id; `tint` = null/neutral. Precedence (whole-object → recipe → archetype cuboid) comes free.
**Provenance tier:** `group.userData.wholeObject` → `registered`; else `window.MODEL_RECIPES[recipeSlug]`
truthy → `recipe`; else `cuboid`. The manual must `refFigure.dispose(group)` on every card unmount
and detail swap — never `geometry.dispose()` directly (shared-cache safety). The manual itself must
never call `Theater.retire()`.

### Data adapter (`manual.js`, the one new piece of logic)
A pure function `manualEntries()` that yields a UNIFORM entry array from both globals. It must
read whatever fields are actually present (do NOT hardcode a field list that could drift) and
normalize to:

```
{
  id,            // stable + DERIVED: regular = the BESTIARY key; realm = realm + ":" + slugify(name),
                 //   with a "-2","-3"… suffix on within-realm name collisions (REALM_BESTIARY entries
                 //   carry NO id field — verified). Derivation must be deterministic so Adam's dictated
                 //   ids stay stable across reloads.
  corpus,        // "regular" | "realm"
  name, realm?,  // realm only for realm creatures
  cr, type, size, ac, hp, speed,
                 // realm entries carry NO stats — resolve ac/hp/speed/abilities/actions from
                 //   BESTIARY[entry.frame] (the stat chassis); show a "frame: <id>" line in the detail
                 //   view. cr/type/size come from the realm entry itself.
  abilities,     // {str,dex,con,int,wis,cha} when present (regular: on the BESTIARY entry; realm: on the frame)
  actions,       // raw action entries (name + text; reuse combat.js cmParseActionText for atk/dmg display — READ-ONLY import of the parse, no combat state)
  traits,        // the traits array/blob
  flavorTable,   // the d8 {die:'d8', rows:[{n,band,text}...]} — regular: from MONSTER_FLAVOR[id]; realm: on the entry
  desc,          // narrative description — regular: MONSTER_FLAVOR[id]; realm: on the entry
  habitat, activity, treasure, factionFit, displaced?,   // when present
  modelKey       // the resolved recipeSlug/model used for the figure (drives provenance tier)
  // NOTE: _review flags exist ONLY in dev/model-qa/realm-bestiary-draft.json, NOT in compiled data — CUT from v1 (no badge).
}
```

Missing fields render as a muted "—", never as a crash or a blank that hides absence.

### The grid (browse)
- Virtualized/paged list (~1,817 is too many live canvases at once — render only what's near the
  viewport). Card = live mini-canvas + name + corpus/realm chip + CR + type.
- **IntersectionObserver**: on enter-viewport, mount a viewer (build the figure via the shared
  registry path, one small `WebGLRenderer` or a shared-context pool); on leave-viewport,
  **dispose geometry/material/texture + release the canvas** (this is why the pass-2 GL fixes are
  a hard dependency — the dispose seams must be correct).
- A hard cap on concurrently-live canvases (e.g. ≤ 24); a small renderer pool reused across
  cards rather than one context per card (avoid the browser's ~16-context limit).

### The detail view (inspect)
Click a card → a panel (or route `#id`) with:
- **One full rotatable viewer** (drag-orbit; slow idle turntable). Reuses the same builder.
- **Alt-model bullet menu** — when the resolved model has alternates (the registry entry declares
  an optional `alts` list of `{label, module, fn}` — e.g. pose/skin/variant builders, or NEAREST_SUB
  candidates), render a small bullet/segmented selector directly **under the 3D viewer** to swap the
  live model between alts; the selected alt re-mounts into the same viewer (`refFigure.dispose` the
  old, build the new). Absent/one model → no menu shown (never an empty control). The grid thumbnail
  uses the entry's default alt. (**No `WHOLE_OBJECT_REGISTRY` entry declares `alts` today — S2 ships
  the MECHANISM only, menu hidden everywhere; authoring real alts is a follow-on content unit.**)
- **Actions** — each with the parsed atk/dmg surfaced (via the read-only `cmParseActionText`),
  raw text beneath.
- **Traits** — rendered from the traits blob.
- **Flavor d8 table** — the 8 rows shown as a table, each row tinted by its spice band
  (Grounded/Textured/Strange/Volatile/Mythic — reuse the band palette).
- **Narrative** — `desc`, plus habitat / activity / treasure / faction-fit lines.
- **Model provenance** — the `modelKey` and which fallback tier resolved (registered whole-object
  vs archetype bucket vs cuboid) — so a "grey cuboid" entry is obvious at a glance (this doubles
  as a modeling-coverage audit surface).
- **The stable id, copyable**, so Adam can say "edit `ash-wight-03`, flavor row 6 →…".

### Filters / search
Corpus · realm · CR range · creature type · size · habitat · has-flavor-table · has-desc ·
model-tier (registered / recipe / cuboid) · free-text name search. Filter
state in the URL query so a filtered view is shareable/reproducible.

---

## Verification (browser tool → smoke + eyeball, not unit asserts)

1. **Headless smoke** (`dev/model-qa/verify-bestiary-manual.mjs`, copy `capture-piece.mjs`
   transport): serve, load the shelf inside genesis.html; the module assigns `window.manualEntries`
   for the harness. Assert (a) `manualEntries().length === BESTIARY count (510) +
   REALM_BESTIARY count (1307) === 1817` (no dropped/duplicated entries), (b) zero console errors on load, (c)
   scroll the grid programmatically through N screens and assert live-canvas count never exceeds
   the cap, (d) after scrolling a batch off-screen, assert per-card scene resources (geometries/
   materials the manual itself created) are disposed and the shared `PIXEL_SKIN_CACHE` size stays
   ≤ its LRU cap of 128 (the W2-A semantics — the cache is SUPPOSED to retain up to the cap;
   "returns to zero" would be the wrong assertion) (⊗ RED-FIRST: stub the manual's unmount dispose
   to prove the leak-check catches it).
2. **Coverage audit**: assert every entry resolves a `modelKey` and log the count per fallback
   tier (how many land on a cuboid) — a byproduct QA number Adam will want.
3. **Visual (orchestrator/Adam reads):** capture a grid screen + 3 detail views (one regular, one
   realm, one whose model resolves via NEAREST_SUB) and eyeball — renders read, flavor table bands
   are legible, the stat block is complete.
4. `python3 build/check-manifest.py` OK — `src/ui/ref-bestiary.js` + its `<script type="module">`
   tag + its manifest entry ARE manifest-tracked (the ES-module exemption pattern; it is a game
   module, not a `dev/` file).
5. **Alt-menu mechanism check:** inject a stub registry entry with `alts:[a,b]` (test-only), assert
   the bullet menu renders, swaps the live model (old group disposed via `refFigure.dispose`), and
   that every real entry (no `alts` today) shows NO menu. (⊗ RED-FIRST: assert the menu is absent
   before injecting the stub.)

## Build order / dependency

Build **after** the pass-2 battle-visual GL-lifecycle fixes land (undisposed-texture leak,
dispose-during-tween, board-teardown) — the lazy grid's mount/dispose cycle relies on those seams
being correct. Until then a prototype could leak GPU memory on long scrolls. Everything else is
independent of the running review-fix waves.

## Fable rulings (2026-07-05)

- **⚑ RULED — ONE shared offscreen `WebGLRenderer`, 2D-blit to card canvases.** Each visible card
  holds a plain 2D canvas; a single offscreen GL renderer draws each card's scene in turn and
  blits (`drawImage`) to the card. Grounds: it side-steps the browser's ~16-context limit
  entirely, makes the live-canvas cap a soft number instead of a hard resource wall, and static
  cards cost zero GL work after their first blit. The detail viewer gets its own dedicated second
  context (2 total, constant).
- **⚑ RULED — static idle in the grid; orbit on hover/focus only.** Grounds: with the blit
  architecture a static card is literally free after first paint; only the hovered card re-renders
  (and the detail view always orbits). Keeps a 1,817-row scroll cold.
- **Cache interaction (post W2-A):** the manual shares `PIXEL_SKIN_CACHE`, now a bounded LRU
  (cap 128) disposed at `retire()` — the manual must NOT hold its own references to cached
  textures across card unmounts (build via `refFigure.build` per mount, `refFigure.dispose` on
  unmount), and must never call `Theater.retire()` itself. The shared caches rebuild on demand
  (`wholeObjectGeometryFor` is cache-checked), so the manual tolerates a prior battle `retire()`.
