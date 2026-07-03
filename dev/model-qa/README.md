# MODEL-QA capture rig

The infrastructure that makes the **§7b blind-recognition loop** (`docs/MODEL-GRAMMAR.md` §7b)
runnable, and gives Adam his first real look at the procedural creature figures. This rig fixes the
**seeing** problem — capture, not modeling. The models themselves stay placeholder-tier
(`DESIGN-GUIDE` §II.0b); this is how you *judge* them without Adam sitting inside every pass.

Pieces:

| file | what it is |
|---|---|
| `dev/model-lineup.html` | the fixture page — loads the REAL theater modules over localhost and renders solo figures in grid / solo / grip / named modes (query-param driven). SAME camera + recipe→figure pipeline as the in-game battle theater. |
| `dev/model-qa/gen-top100.mjs` | derives the "top-100 most encounterable" creature set (there is no explicit walk-frequency field on a bestiary entry, so it's derived from CR band × role × habitat breadth) and writes `top100.json`. |
| `dev/model-qa/top100.json` | the stable top-100 list. Its weight-sorted slug order IS the A1..E5 cell order. Regenerate after a bestiary change. |
| `dev/model-qa/capture.mjs` | the headless capture driver — serves the worktree, drives Chrome via puppeteer-core, screenshots every mode, writes `round1/` PNGs + `key.json`. |
| `dev/model-qa/round1/` | the captured artifacts (blind sheets, named sheets, grip closeups, key.json). |

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

### 2. Capture (the one command that does everything)

```
cd <repo>
node dev/model-qa/capture.mjs
```

Verbatim, this:
- serves the worktree on **`http://127.0.0.1:5178`** (a fresh `python3 -m http.server`, killed on
  exit — **never 5175**, where a live DM bridge may be, and never the `.dm/` mailbox);
- launches **system Chrome** (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) via
  `puppeteer-core` (installed in `~/.genesis-jsdom`, the repo's dev-dep scratch dir);
- captures at **deviceScaleFactor 2** so a ~150px grid cell reads crisply, into `dev/model-qa/round1/`:
  - `sheet-{1..4}.png` — **blind** sheets over the top-100 (cells keyed A1..E5 only);
  - `named-{1..4}.png` — the **same** sheets with creature-name labels (Adam's contact sheet);
  - `grip-*.png` — weapon-anchor closeups (9 archetypes + 3 PC loadout fixtures), two angles each;
  - `key.json` — every sheet+cell → `{slug, name}`, harvested from the page's own render map so it
    can never drift from what was actually drawn.

Env knobs: `QA_PORT=5178`, `QA_SHEETS=1,2,3,4`, `QA_KEEP_SERVER=1`, `QA_ANGLE=1` (force SwiftShader
on the first launch).

### 3. Look at a mode live (no capture)

```
cd <repo> && python3 -m http.server 5178 --bind 127.0.0.1
```

then open any of:

| URL | mode |
|---|---|
| `…/dev/model-lineup.html?sheet=1&per=25&set=top100` | **GRID (blind)** — 5×5, cells keyed A1..E5, no names |
| `…/dev/model-lineup.html?sheet=1&named=1` | **NAMED** — the same grid with names (contact sheet) |
| `…/dev/model-lineup.html?slug=goblin-warrior&yaw=90` | **SOLO** — one figure large, yaw 0/90/180/270 |
| `…/dev/model-lineup.html?grip=fighter-greatsword` | **GRIP** — hands/weapon closeup, 2 angles |
| `…/dev/model-lineup.html?grip=biped` | **GRIP** — a fixed archetype (biped/quadruped/flyer/serpent/swarm/giant/ooze/arachnid/amorphous-horror) |

The page writes a machine-readable `#rig-status` line (`data-ready` when the render finished) that the
capture driver polls, and exposes `window.__rigErrors()` (in-page console-error tally) and
`window.__rigKeyMap` (the cell→creature map). The only expected console error is a 404 for
`assets/textures-psx/manifest.json` — that's the palette-only baseline (a parallel textures unit hasn't
landed), harmless by design.

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
