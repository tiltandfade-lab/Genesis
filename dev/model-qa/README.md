# MODEL-QA capture rig

The infrastructure that makes the **§7b blind-recognition loop** (`docs/MODEL-GRAMMAR.md` §7b)
runnable, and gives Adam his first real look at the procedural creature figures. This rig fixes the
**seeing** problem — capture, not modeling. The models themselves stay placeholder-tier
(`DESIGN-GUIDE` §II.0b); this is how you *judge* them without Adam sitting inside every pass.

Pieces:

| file | what it is |
|---|---|
| `dev/model-lineup.html` | the fixture page — loads the REAL theater modules over localhost and renders figures in grid / solo / grip / named / **pilot** / **scene** modes (query-param driven). SAME camera + recipe→figure pipeline as the in-game battle theater. |
| `dev/model-qa/gen-top100.mjs` | derives the "top-100 most encounterable" creature set (there is no explicit walk-frequency field on a bestiary entry, so it's derived from CR band × role × habitat breadth) and writes `top100.json`. |
| `dev/model-qa/top100.json` | the stable top-100 list. Its weight-sorted slug order IS the A1..E5 cell order. Regenerate after a bestiary change. |
| `dev/model-qa/pilot.json` | **the STANDING ~16-figure approval lineup** (REFERENCE-DIRECTION.md "The approval flow"): Row-B beasts + core humanoids + the 3 PC loadout fixtures + giant/flyer/horror. HAND-AUTHORED — changing a pick is a deliberate act; every entry documents its family and why it was chosen. |
| `dev/model-qa/capture.mjs` | the headless capture driver — serves the worktree (verifying the served ROOT — see the port note), drives Chrome via puppeteer-core, screenshots every mode, writes `round1/` / `round1b/` PNGs + `key.json`. |
| `dev/model-qa/round1/` | round-1 artifacts (top-100 blind/named sheets, grips, key.json) — shot PALETTE-ONLY (see the texture note; kept as the before-state record). |
| `dev/model-qa/round1b/` | round-1b artifacts: the pilot approval sheet (blind + named) + 3 environment scene shots (marsh/dungeon/camp) — **textured board, props, light profiles**. |

---

## Why `file://` can't work (one line)

three.js resolves the bare `"three"` specifier through an `<script type="importmap">`, and the
browser blocks ES-module scripts (the boot module) on the `file:` scheme — **a double-click shows a
blank page.** Serve over localhost. (Same law as `genesis.html` itself — CLAUDE.md.)

---

## Run it

### 1. Generate the top-100 set (only needed once, or after a bestiary change)

```
cd <repo>
node dev/model-qa/gen-top100.mjs
```

Writes `dev/model-qa/top100.json` and prints the type/CR spread.

### 2. Capture (the one command per round)

```
cd <repo>
node dev/model-qa/capture.mjs            # round-1: top-100 blind+named sheets + grips -> round1/
node dev/model-qa/capture.mjs round1b    # round-1b: the PILOT sheet (blind+named) + 3 scenes -> round1b/
```

Verbatim, either command:
- serves the worktree starting at **`http://127.0.0.1:5178`** — and **verifies the served root**: if a
  port is busy serving a DIFFERENT tree (a parallel agent session's own server was found squatting on
  5178, which made captures silently hit the WRONG worktree), it walks to the next free port
  (5180, 5181, …). **Never 5175** (live DM bridge, and never the `.dm/` mailbox) and **never 5179**
  (Adam's manual-viewing launcher);
- launches **system Chrome** (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) via
  `puppeteer-core` (installed in `~/.genesis-jsdom`, the repo's dev-dep scratch dir);
- captures at **deviceScaleFactor 2** so a ~150px grid cell reads crisply. round1 produces
  `sheet-{1..4}.png` (blind) / `named-{1..4}.png` / `grip-*.png` / `key.json`; round1b produces
  `pilot-blind.png` / `pilot-named.png` / `scene-{marsh,dungeon,camp}.png` / `key.json`;
- logs the page's **textures ON/OFF** state on every line (`tex=ON(12)`), so a palette-only capture
  can never again pass silently as "the textured board".

Env knobs: `QA_PORT=<port>` (pin one port), `QA_SHEETS=1,2,3,4` (round1 only), `QA_KEEP_SERVER=1`,
`QA_ANGLE=1` (force SwiftShader on the first launch).

### 3. Look at a mode live (no capture)

Easiest: double-click **`~/Desktop/Launchers/Open Model QA.command`** (serves port 5179 + opens
Chrome). Or by hand:

```
cd <repo> && python3 -m http.server 5179
```

then open any of (the page shows a self-help panel if opened via file:// or an app preview —
those environments can't run ES modules/WebGL):

| URL | mode |
|---|---|
| `…/dev/model-lineup.html?sheet=1&per=25&set=top100` | **GRID (blind)** — 5×5, cells keyed A1..E5, no names |
| `…/dev/model-lineup.html?sheet=1&named=1` | **NAMED** — the same grid with names (contact sheet) |
| `…/dev/model-lineup.html?set=pilot&named=1` | **PILOT** — the standing 4×4 approval lineup (pilot.json) |
| `…/dev/model-lineup.html?scene=marsh` | **SCENE** — environment beauty shot (`marsh` / `dungeon` / `camp`), textured board + props + light profile + scale figures |
| `…/dev/model-lineup.html?slug=goblin-warrior&yaw=90` | **SOLO** — one figure large, yaw 0/90/180/270 |
| `…/dev/model-lineup.html?grip=fighter-greatsword` | **GRIP** — hands/weapon closeup, 2 angles |
| `…/dev/model-lineup.html?grip=biped` | **GRIP** — a fixed archetype (biped/quadruped/flyer/serpent/swarm/giant/ooze/arachnid/amorphous-horror) |

The page writes a machine-readable `#rig-status` line (`data-ready` when the render finished) that the
capture driver polls, and exposes `window.__rigErrors()` (in-page console-error tally),
`window.__rigKeyMap` (the cell→creature map), and `window.__rigTextures` ({on, keys}).

### Textures (why round-1 was palette-only, and how it's fixed)

Round-1 shot palette-only for a two-layer reason: (1) the capture worktree **predated the texture
gap-fill merge**, so `assets/textures-psx/manifest.json` 404'd at that root; (2) even with the file
present, `setBoard` builds tile materials AT CALL TIME while the boot module's own manifest fetch is
async — a texture that resolves later only repaints the same untextured materials (the live game
re-calls setBoard on every combat event, so textures pop in there; a one-shot capture doesn't).
The rig now **warms the textures itself** before any render: it fetches the manifest, pre-fetches
every image, hands RESOLVED absolute paths to the public `Theater.setTextures` API, and only then
starts rendering — so every capture is textured, and every status line + `key.json` records the
textured state. A missing manifest degrades to palette-only, plainly labeled `tex=OFF`.

---

## WebGL-in-headless

Chrome's default `--headless=new` renders WebGL fine here via ANGLE (the round-1 capture ran clean on
default ANGLE — no SwiftShader needed). The driver still **probes**: it captures blind sheet 1 first,
and if the canvas comes back blank (mean luminance below the pure-void floor), it relaunches with
`--use-angle=swiftshader` and starts over. If a future environment returns blank sheets, that fallback
kicks in automatically; you can also force it with `QA_ANGLE=1`.

---

## Judge protocol (the next step — §7b steps 2-4)

The rig produces the images; a **fresh judge** scores them. Never let the authoring agent grade its own
models (no self-grading, ever — §7b).

1. **Give a fresh agent ONLY the blind sheets** (`round1/sheet-{1..4}.png`) — never the recipe, never
   `key.json`, never `docs/MODEL-GRAMMAR.md`. Prompt: *"For each labeled cell (A1..E5 on each sheet),
   name the creature you think it is. One free-text guess per cell. If you can only tell the broad
   family (e.g. 'some large cat', 'a skeleton-ish humanoid', 'a swarm'), say that."*
2. **Score each answer against `key.json`** (exact / family / miss):
   - **exact** — the right creature (or an unmistakable synonym: "skeletal archer" for `skeleton-archer`).
   - **family** — the right family but not the species ("some undead humanoid" for a ghoul; "a big
     brute" for an ogre; "a swarm of small things" for `swarm-of-rats`). *Honestly generic beats
     wrongly specific* (§7b) — a family-pass is a real pass for the long tail.
   - **miss** — wrong creature, or an unreadable blob.
3. **Thresholds respect the tail** (§7b step 4): the top-100 here are the most-encountered set — they
   should aim to PASS (exact or a strong family read). A miss is not a failure of the rig; it's a
   **G5 override-queue entry**. Collect the misses (cell → slug from `key.json`) into the queue Adam's
   G5 hero session works from.
4. **Record results** in a committed scorecard. The spec names
   `dev/model-recognition-report.json` (§7b step 4) so progress is measurable across passes — this rig
   is the capture half; that scorecard is written by the judging half.
5. **Iterate** (§7b step 3): failing recipes go to a tuning executor that first pulls reference imagery
   for the creature family, adjusts the recipe, re-renders (re-run `capture.mjs`), and re-judges with
   *another* fresh judge. Cap ~3 attempts, then log the miss for the G5 hand-override session rather than
   looping forever.

Adam's role (§7b step 5): the **named** contact sheets + the G5 hero sessions — taste rulings, not QA.

---

## Notes

- The top-100 weighting is **deliberately flatter than raw encounter frequency**: a faithful spawn
  curve buries the sheet in near-identical CR≤1 minions and never shows the mid-tier iconic silhouettes
  (ogre, dire wolf, giant spider, the low bosses) a party fights on the way to level 10. The curve keeps
  the low band the plurality (~76/100 at CR≤1) but keeps CR 2-6 well-populated (~24/100) for coverage.
  See `gen-top100.mjs`'s own comments.
- `dev/theater-preview.html` is the older, single-page manual preview (fixtures on a live board, verb
  demo, env/light toggles). It was **broken** (see below) and is now fixed; it and `model-lineup.html`
  are complementary — the preview is for *interactive* poking at a live board + verbs; the lineup is for
  *systematic blind capture* of solo figures. Neither supersedes the other.

### The `theater-preview.html` fix (and a real theater-boot.js bug found in passing)

Two problems were blocking `dev/theater-preview.html` ("the little in-app preview window never works"):

1. **A fatal JS syntax error in the preview's own inline script.** The `g5lineup` fixture's `units`
   array was never closed — its last entry ended with `] }` and the code jumped straight to
   `deadstate: {` with no `]` closing the array and no `},` closing the `g5lineup` object. That's a
   hard `SyntaxError`, so the *entire* inline `<script>` never ran and the page did nothing. Fixed by
   closing the array/object.
2. **`file://` can't load it** (the one-liner above) — it needs localhost, exactly like `genesis.html`.

While loading the real modules for the capture rig, the rig also surfaced — and this branch fixes — a
**genuine bug in `src/ui/theater-boot.js` on `master` that stopped the whole theater module from
parsing** (which is *also* why "the preview never works" and "I haven't seen enough monsters"):

- `scorchTintFor()` was missing its closing `}` (its body silently absorbed the `LIGHT_PROFILES` table
  and `lightProfileFor` that followed).
- inside `setUnits`, `const x = u.x - cx, z = u.z - cz;` was declared **twice** in the same `forEach`
  body (the obliterated branch `return`s before the second one, so it's the same block scope) — a
  duplicate `const` is a hard `SyntaxError`. The second declaration was removed (the values are already
  in scope from the first).

With both fixed, `node --check` passes on the module, all five theater verify harnesses are green
(`verify-theater-data` 149/0, `verify-model-grammar` 76/0, `verify-model-parts` 261/0,
`verify-theater-verbs` 59/0, `verify-theater-lighting` 21/0), and the figures render.

### Two MORE theater-boot.js bugs found by the round-1b scene captures (fixed on `feat/model-qa-rig-2`)

Both invisible until now for the same reason: the prop visual gate (`theater-preview.html`) was
syntax-dead when they landed, so no one ever *saw* a board prop render.

3. **`setUnits` erased every board prop on every render.** The DEAD-STATE pass added a wholesale
   `clearGroup(S.propGroup)` at the top of `setUnits` (to sweep stale obliteration scorch markers) —
   but `S.propGroup` also holds every board prop `setBoard` just built (cover columns, walk-feature
   props, their grounding blobs), and the game always calls `setBoard` then `setUnits` per render.
   **No board prop has ever survived to the screen since that pass landed — in the live game too.**
   Fix: scorch markers are tagged (`userData.scorchMarker`) and `setUnits` removes/disposes ONLY
   them, leaving the board's props standing.
4. **Prop `params.scale` was silently dropped.** `theater-data.js`'s own keyword rules emit
   `{scale: 0.6}` (candelabra), `{scale: 1.8}` (colossal statue), `{scale: 0.4}` (grate rubble) —
   but no part function reads a scale param, so every scaled rule mis-rendered at 1.0. Fix:
   `setBoard`'s prop branch honors `partParams.scale` at the group level (one multiply, the same
   pattern `SIZE_SCALE` uses for figures).

Related capture-side note: the part library authors props at raw sub-tile size (a crate is 0.5 world
units vs. figures at 1.5×), so even rendered they read tiny at board-fit distance. **In-game prop
scale is a model-wave question** — the SCENE fixture passes `partParams.scale ≈ 2.4` (pure data,
via the now-honored parameter) purely so the APPROVAL shots read; the in-game default look is
untouched.
