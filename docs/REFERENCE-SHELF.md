---
type: system-spec
project: Genesis
status: SPECCED — forks ruled (Adam design-talk 2026-07-05); for Fable review
updated: 2026-07-05
hosts: docs/BESTIARY-MANUAL.md (Monster Manual) · the Wiki (below) · [future] Props & Scenery
---

# REFERENCE SHELF — the opening-screen reference launcher

A shared, **expandable** launcher on the game's opening screen that hosts in-product reference
apps. v1 ships two buttons — **Monster Manual** and **Wiki** — with the framework built so a third
(**Props & Scenery**) and beyond drop in as a one-line registration, never a rebuild.

This reframes the Monster Manual (BESTIARY-MANUAL.md) and the Wiki from "dev-only pages" to
**player-reachable reference features** launched from the opening screen. They remain
dev-openable directly over localhost too (the QA/authoring value is preserved), but the primary
surface is the opening-screen shelf.

## Rulings (Adam design-talk 2026-07-05)

1. **Opening-screen buttons.** The opening screen (genesis.html start view) gains a **Reference**
   section with a button per registered app. v1: `Monster Manual`, `Wiki`.
2. **Built to expand.** Adding an app = ONE registry entry, not new launcher plumbing. Props &
   Scenery is the named next entry; the registry must make it trivial.
3. **The Wiki is the design-doc wiki.** Its content is "every system + a brief description of how
   it works." v1 = the **index with simple descriptions**; it is *designed as* a wiki (each entry
   links to a deeper detail page) but the detail pages are a fast-follow — v1 links can resolve to
   a stub / the raw spec.

## The framework (build this once)

- **Registry** — a module-owned array, e.g.
  `REFERENCE_APPS = [{ id, label, icon, order, mount(container), teardown(container) }]`.
  Each reference app is its own module that pushes one entry. The opening screen renders a button
  per entry (sorted by `order`); clicking opens the shared shell and calls `mount`.
  Concretely: the opening screen is `renderStart()` (src/world/render.js:1763), which paints
  `#startView` inside `#panel-start` (genesis.html:1051-1052) and is re-invoked on every
  `showTab('start')` (src/ui/chrome.js:4). The registry module is `src/ui/reference-shelf.js`
  (classic `<script>`, owns `REFERENCE_APPS`, `referenceShelfRegister`, `referenceShelfOpen`,
  `referenceShelfClose`, `referenceShelfSectionHTML`), loaded before render.js in loadOrder.
  `renderStart()` gains one line: append `referenceShelfSectionHTML()` (guarded
  `typeof !== "undefined"` for jsdom) after the Begin-button block. The shell is a static
  `<div id="refShelf" hidden>` overlay in genesis.html markup, `role="dialog" aria-modal="true"`,
  Esc-close + focus trap.
- **Shared shell** — one overlay/route host (`referenceShelfOpen(id)` / `referenceShelfClose()`)
  providing: the frame chrome, a back-to-shelf control, close, title, and **keyboard + ARIA**
  (Esc closes, focus trap, the shelf and every app announce via the prose-twin convention). Apps
  render into the shell's content container; on close/switch the shell calls the app's `teardown`
  (dispose renderers, cancel RAF, release listeners — critical for the Monster Manual's live-3D).
- **Lifecycle contract** — exactly one app mounted at a time; switching apps tears down the
  previous first. This bounds GPU/DOM cost and rides the W2-A dispose discipline (now landed).
  **Registration timing (executor trap):** ES-module apps (the Monster Manual) execute AFTER the
  inline `showTab('start')` boot call (genesis.html:1275) — the first `renderStart()` paint
  predates their registration. `referenceShelfRegister(entry)` must therefore, after pushing,
  re-invoke `renderStart()` when `#panel-start` is the active panel, so late registrants appear
  without a tab switch. The expand-proof stub test must register late (post-boot) to prove this.
- **Blind-playable (doctrine):** the shelf itself and every app ship a prose/ARIA twin — a
  screen-reader user reaches the same reference content as text. The Wiki is inherently
  prose-first; the Monster Manual needs its stat/flavor/narrative text exposed independent of the
  3D canvas (BESTIARY-MANUAL.md already specs the full text panel — that IS the twin).

## Registered app #1 — Monster Manual

Per docs/BESTIARY-MANUAL.md, now mounted as a shelf app (not a standalone dev page). No design
change beyond: it registers a `REFERENCE_APPS` entry and renders into the shell's container; its
lazy-grid mount/teardown wires into the shell lifecycle (mount = build grid, teardown = dispose
every live canvas + release the shared renderer). Everything else in that spec stands.

## Registered app #2 — Wiki (the design-doc wiki)

**Source of truth:** `docs/ARCHITECTURE.md` — the authored, human-readable index of every system
(one elevator line + a 2-4 sentence "how it works" + where it lives + its spec), grouped by layer
(Engine / World / UI-Theater / Data-Pipeline / DM-Bridge / Creator). Being produced now by the
systems-survey fan-out; a human/AL reading the repo cold uses this file directly.

**Compile seam (edit-source→compile-artifact, the repo's DNA):** `build/gen-wiki.py` parses
`docs/ARCHITECTURE.md` → `data/wiki.js` (owns `WIKI_INDEX`: `[{system, whatItIs, howItWorks,
livesIn[], spec, layer, slug}]`). Never hand-edit `data/wiki.js`; edit ARCHITECTURE.md and
recompile. Register `data/wiki.js` in manifest.json.

**The Wiki app (v1 — index + simple description):**
- Renders `WIKI_INDEX` grouped by layer: a left nav of systems (by layer), a main panel showing
  the selected system's card (whatItIs, howItWorks, livesIn, spec link).
- Free-text filter/search over system names + descriptions; layer filter.
- **Wiki-linking, forward-designed:** each system card carries a `[[system]]`-style link surface
  and a "full detail →" affordance. v1: "full detail" resolves to the linked `spec` doc rendered
  read-only (or a "detail page coming" stub if no spec) — the DETAIL PAGES are a fast-follow, not
  v1. The data shape already carries `slug` + `spec` so detail routing is a later addition, not a
  reshape.

**Out of scope (v1):** authored per-system detail pages beyond linking to the existing spec;
editing from the wiki; cross-reference graph/backlinks (a dream-feature, like the editable
bestiary).

## Expansion — the proof the design holds

**Props & Scenery** (future entry #3): the same grid+detail pattern as the Monster Manual but over
`data/realm-props.js` + `data/realm-surfaces.js` (live-3D prop/floor previews + their data). It
must require only: a new module that registers a `REFERENCE_APPS` entry and reuses the shell +
the theater render path. If building the Wiki or Monster Manual forces any launcher change to
accommodate a hypothetical third app, the framework isn't done — that's the acceptance bar for
"built to expand."

## Build units (wave 3)

| unit | branch | what | depends on |
|---|---|---|---|
| S1 | `feat/reference-shelf` | `src/ui/reference-shelf.js` (registry + shell logic) + the `#refShelf` overlay markup & CSS in genesis.html + the `renderStart()` one-liner + manifest entries (`ui.reference-shelf` owning the four globals) + ARIA/keyboard | — |
| S2 | `feat/monster-manual` | `src/ui/ref-bestiary.js` (own `<script type="module">` tag) + the tiny `Theater.refFigure` seam in theater-boot.js (live-3D lazy grid, shared-renderer blit, detail viewer, alt-menu mechanism) | S1; W2-A (landed) |
| S3 | `feat/wiki-app` | `build/gen-wiki.py` + `data/wiki.js` (owns `WIKI_INDEX`; manifest-registered, `<script>` in the data block) + `src/ui/ref-wiki.js` (classic script; registers the shelf entry; index v1 per the parser contract below) | S1; docs/ARCHITECTURE.md (landed) |

S1 lands first (S2/S3 mount into it). S2 and S3 are then independent, parallel.

## Verification
- S1: opening screen shows both buttons; open→mount→close→teardown cycles leak nothing (assert the
  shell calls teardown; live-canvas/context count returns to baseline after close); Esc + focus
  trap + ARIA announce work; a stubbed third app registers and appears with zero shell edits (the
  expand proof).
- S2/S3: per each app's own spec (BESTIARY-MANUAL.md verification; the Wiki: `WIKI_INDEX` length ==
  system count in ARCHITECTURE.md, every entry renders, filter/search works, spec links resolve).
- `check-manifest.py` OK (new modules + `data/wiki.js` registered).

## Rulings (Fable, 2026-07-05)
- **Placement/label:** a labeled **Reference** section on the start page with direct per-app
  buttons, under the Begin button (fewer clicks; matches Adam's two-buttons framing; the registry
  renders it, so a third app is still one entry).
- **Chrome:** plain-but-consistent (existing parchment vars + `.btn ghost` idiom); no bespoke
  treatment until the art ladder advances (§II.0b).
- **Shelf DOM:** one static `<div id="refShelf" hidden>` overlay (a modal lens over the start
  screen, `role="dialog" aria-modal="true"`), NOT a new tab — tabs are game surfaces.

## gen-wiki.py — the parser contract (S3 must implement exactly; write into the script header)

ARCHITECTURE.md is cleanly parseable (Fable spot-checked three entries). Rules:
1. **Layer** = an `## ` heading that contains ≥1 `### ` subsection carrying `**What it is.**`
   (this skips the preamble + "The two spines"). Layer label = heading text with the trailing
   ` (…)` parenthetical stripped (`Engine layer`→`Engine`, `UI & Battle Theater`, `DM Seat`, etc.).
2. **System** = each `### ` heading; `system` = full heading text; `slug` = lowercase, non-alnum→`-`,
   collapsed.
3. **Fields** (punctuation lives INSIDE the bold): `**What it is.**` / `**How it works.**` — value =
   remainder of that line + continuation lines until the next `**`-prefixed line. `**Lives in:**` —
   value up to the next `**Spec:**` (which may be same-line OR next-line — both occur); split on
   commas, strip backticks + trailing period → `livesIn[]`. `**Spec:**` — strip; `—` → `null`.
4. **Hard-fail** (non-zero exit) if any `###` lacks any of the four fields, or field counts disagree
   with the `###` count. **Warn** if the footer `*N systems indexed` ≠ parsed count.
5. Emit `data/wiki.js`: generated-file header (with the compile command), `const WIKI_INDEX =
   [{system,slug,layer,whatItIs,howItWorks,livesIn,spec}...]` in file order. Idempotent (same input
   → byte-identical). Verify `WIKI_INDEX.length === 48` today; every non-null `spec` matches a real
   `docs/…` path.
