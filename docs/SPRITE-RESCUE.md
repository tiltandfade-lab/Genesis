---
type: system-spec
project: Genesis
status: SPECCED 2026-07-09 — Adam's go: "go ahead and build the scanner unmix review process" + the sizing re-pass. Wave runs on branch claude/sprite-gen-refactor-magenta-951964; master merge deferred to the sprite-gen wave sweep point.
created: 2026-07-09
related:
  - "[[SPRITE-TRANSITION]]"   # the parent lane: T5 cut the fantasy corpus this wave repairs
  - "[[SPRITE-SHEETS]]"       # slicer + keying conventions this wave extends
---

# SPRITE-RESCUE — magenta unmix + recut + sizing v2

Repairs the 2026-07-09 fantasy sprite corpus without losing art. Two defect families,
measured (2026-07-09 scan of all 896 cut sprites in `assets/sprites/`):

- **Magenta leak**: 415 sprites have >20 magenta-cast pixels, 84 severe (>500 px). The
  slicer's `defringe()` (build/slice-sprites.py:283) only treats a 2px edge band BY DESIGN
  (interior purples spared) — interior bleed (translucent bodies, membranes, glows) was
  never addressed. Adam's ruling: the tendrily designs must survive — fix, don't discard.
- **Sizing drift**: the auto-scale pass (2026-07-09, HANDOFF "852 computed heads-line-up
  scales") assumed the creature's body spans the full crop height. It doesn't: feet not
  flat on the ground line, art above the head, tails below the feet all break the
  assumption — a 6 ft creature reads taller. 471 cut sprites are unreviewed AND not
  regen-bound (excluded: 195 slugs in `dev/sprite-manifests/xl-regen-manifest.json` —
  Adam: don't waste tokens on regen-bound art). Adam's approved scales (366 pass
  verdicts) are rulings — NEVER overwritten.

**Decisions (locked, do not re-litigate):**

- D1 — Leak repair is **chroma-unmix**, not hue-nuking: model each contaminated pixel as
  `observed = α·art + (1−α)·#FF00FF`, estimate α from magenta excess, recover art color,
  emit α as transparency. Prototype proven on spr-fantasy-invisible-stalker (7,899 leak px
  → translucent wisp, every tendril intact). Grounds: erase/despill destroys tendril art;
  unmix converts contamination into intended translucency.
- D2 — Unmix never runs blind: a vision triage classifies flagged sprites first
  (art-purple creatures — purple worm, violet fungus — score high on the same detector
  and must not be washed out).
- D3 — Primary fix path is **recut from the parent sheet with unmix at slice time** (the
  raw cell's background is exactly #FF00FF — cleanest separation); post-hoc unmix on the
  cut PNG is the fallback when no parent sheet cell can be verified.
- D4 — Rescued fails exit the regen queue via the overlay, never by hand-editing
  `xl-regen-manifest.json` (it's generated — flip the verdict, re-run
  `build/gen-xl-regen-sheets.py`).
- D5 — Sizing v2 measures the crop: vision estimates a **crown line** and a **ground-contact
  line** per sprite; scale is computed from the creature's real span within the crop, not
  the crop height. New overlay key `groundOffset` (fraction of crop height below the
  ground-contact line) so feet sit on the disc.
- D6 — The billboard aspect bug is fixed in the same wave: 886/896 crops are non-square
  but `buildSpriteBillboard` (src/ui/theater-boot.js:2507) maps them onto a SQUARE plane
  (`new THREE.PlaneGeometry(h, h)` at :2519) — every sprite renders width-distorted
  (worst: spr-pc-goliath-paladin-male at 0.47 aspect, ~2.1× too wide). Plane width becomes
  `h × aspect`. Heights are untouched, so existing approved scales survive unchanged.
- D7 — All units land on `claude/sprite-gen-refactor-magenta-951964`; master merge waits
  for the running sprite-gen wave's sweep point (Adam's folder-refactor plan rides the
  same landing).

## Shared data shapes

**`dev/sprite-manifests/magenta-scan.json`** (U1 output, generated, committed):

```json
{ "_generated_by": "dev/scan-magenta.py", "_thresholds": {"margin": 50, "strong": 110},
  "spr-fantasy-invisible-stalker": {"opaque": 21390, "edge": 0, "interior": 7899,
                                    "strong": 6701, "pct": 36.9},
  "...": {} }
```
Magenta-cast pixel = opaque AND `min(r,b) − g > margin`. `edge` counts cast pixels within
2px of transparency (BFS, crop border counts as transparency — same convention as
`defringe()`), `interior` the rest, `strong` = interior with excess > 110. `pct` =
(edge+interior)/opaque × 100, one decimal.

**`dev/sprite-manifests/magenta-triage.json`** (U6 output, generated, committed):

```json
{ "_generated_by": "SPRITE-RESCUE U6 vision triage",
  "spr-fantasy-invisible-stalker": {"class": "unmix", "strength": 1.0,
                                     "note": "translucent body, tendrils — full unmix"},
  "spr-fantasy-purple-worm":       {"class": "art",   "note": "legitimately purple"},
  "spr-fantasy-example-ruined":    {"class": "regen", "note": "art itself is magenta mush"} }
```
`class` ∈ `art` (leave alone) | `unmix` (recut/unmix, `strength` 0.0–1.0) | `regen`
(unsalvageable — stays/goes in the regen queue).

**Overlay additions** (`dev/model-qa/sprite-tags-overlay.json`, existing file): new key
`groundOffset` (number, 0–0.5, fraction of crop height below the ground-contact line;
absent = 0). Sizing v2 rewrites `scale` and appends `note` ONLY on slugs with no verdict.

## U1 — magenta leak scanner gate

**Files:** new `dev/scan-magenta.py`; edit `dev/sprite-review.py`, `dev/sprite-review.html`.

1. `dev/scan-magenta.py [--sprites-dir assets/sprites] [--out dev/sprite-manifests/magenta-scan.json]`
   — scans every `*.png`, writes the shape above (skip non-PNG; deterministic order;
   atomic write like `save_overlay`, dev/sprite-review.py:66). Pure stdlib + PIL. Prints a
   histogram summary (buckets 0 / 1–20 / 21–100 / 101–500 / >500 for interior) and exits
   0; exits 2 if `--check` is passed and the file on disk differs from a fresh scan
   (drift-guard shape).
2. `dev/sprite-review.py`: `/api/data` (line 145) response gains `"magenta"`: the parsed
   scan JSON (`{}` if the file is missing — never a crash) and `"triage"`: the parsed
   `magenta-triage.json` (`{}` if missing).
3. `dev/sprite-review.html`: (a) rail + info panel show a magenta badge (`M:{interior}px`)
   when interior+edge > 20; (b) the `#fState` filter (line 76) gains options
   `magenta-flagged` (scan interior+edge > 20) and `rescued` (slug has a `_prev` A/B copy,
   U4). No framework; same vanilla style as the existing filters.

**Verify (V1):** ⊗ red-first: with the scan JSON absent, the tool loads and filters work
(prove by renaming the file, loading, restoring). `python3 dev/scan-magenta.py` output
matches the 2026-07-09 baseline counts (896 total, 415 >20px) within ±2 (PIL version
drift tolerance). `python3 build/check-manifest.py` OK (no module edit expected — the
review tool is dev-lane, not in manifest.json; confirm, don't register).

## U2 — chroma-unmix in the slicer

**Files:** edit `build/slice-sprites.py` only.

1. New function `unmix(crop, margin=30, full_at=230, strength=1.0)` placed beside
   `defringe()` (:283). Per opaque pixel: `m = min(r,b) − g`; if `m ≤ margin` untouched;
   else `bgf = min(1, (m − margin)/(full_at − margin)) × strength`, `α' = 1 − bgf`;
   if `α' ≤ 0.04` → fully transparent; else recover
   `r' = clamp((r − bgf·255)/α')`, `g' = clamp(g/α')`, `b' = clamp((b − bgf·255)/α')`,
   new alpha = `round(a × α')`. Mutates in place (defringe's convention).
2. Wire-in: new flag `--unmix[=STRENGTH]` (default off; bare flag = 1.0). When on, runs
   AFTER `crop_transparent` (:265) and BEFORE `defringe` in both the sheet path and the
   `--single` hero path (:547).
3. Post-hoc mode: `--unmix-file <png> [--strength S]` — unmix one already-cut sprite in
   place (the D3 fallback). Mirrors the existing `--defringe-dir` arg pattern (:609).
4. Docstring: extend the file header's numbered pipeline list; note D1 grounds and the
   D2 rule (never run blind — triage decides which sprites get it).

**Verify (V2):** ⊗ red-first on spr-fantasy-invisible-stalker: copy it to scratch, run
`--unmix-file`, assert (a) interior magenta-cast count (U1 detector, margin 50) drops
>95%, (b) the output has >500 pixels with alpha strictly between 10 and 245 (real
translucency, not erasure), (c) bounding box unchanged ±2px (no art loss). Idempotence:
running unmix twice ≈ once (max channel delta ≤ 2). A no-leak control sprite
(spr-fantasy-badger) passes through byte-identical at margin 30.

## U3 — recut-from-parent-sheet lane

**Files:** new `dev/recut-sprites.py`; consumes U2's `--unmix` and U6's triage JSON.
**Stacked on U2's branch tip.**

1. Source map: registry gives slug → `sheet` id + `cell` n (parse
   `data/sprite-registry.js` the way dev/sprite-review.py:parse_registry does);
   `dev/sprite-manifests/v2-manifest.json` gives the sheet's cell list. Raw PNG lookup in
   `ui-sketches/sprite-sheets/` by convention: `fantasy-monsters-N` → `fantasy-realm-NN.png`
   (zero-padded), `fantasy-npcs-N` → `fantasy-realm-npc-0N.png`, `fantasy-kids-1` →
   `fantasy-realm-kids-01.png`, `fantasy-{domestic,dungeon,wild}-animals-1` →
   `fantasy-realm-{domestic-animal,dungeon-animals,wild-animals}-01.png`. Retake variants
   (`-01b`, `-02c`, `-test`) exist: for EVERY candidate PNG (base + variants), slice the
   target cell region in memory and pick the candidate whose crop best matches the
   committed `assets/sprites/<slug>.png` (downscale both to 64px, mean absolute RGB diff
   over mutually-opaque pixels; accept < 24, else report `no-verified-source` and skip —
   NEVER guess).
2. `dev/recut-sprites.py --triage dev/sprite-manifests/magenta-triage.json [--slug SLUG ...] [--dry-run]`
   — for every triage `class:"unmix"` slug (or the explicit `--slug` list): verify source
   (step 1), back up the current sprite to `dev/sprite-manifests/review/prev/<slug>.png`
   (dir is gitignored via `dev/sprite-manifests/review/`, .gitignore:54 — create it),
   then re-slice JUST that cell from the raw sheet via slice-sprites' machinery with
   unmix at the triage's `strength`, overwriting `assets/sprites/<slug>.png`. Slugs whose
   source can't be verified fall back to `--unmix-file` post-hoc mode (still backing up
   first) and are listed under `FALLBACK:` in the report.
3. Report to stdout: per slug — source PNG chosen, match score, recut|fallback|skipped,
   before/after interior-leak counts (reuse U1's detector as an import or subprocess).
   Fail loud (exit 2) if any triage slug resolves to no action.

**Verify (V3):** ⊗ red-first: `--dry-run` on a hand-picked 5-slug sample prints the
source map with match scores and touches nothing (`git status` clean). Real run on the
sample: every output passes V2's (a)–(c) assertions; `prev/` holds 5 backups;
`python3 dev/scan-magenta.py` re-run shows the sample's interior counts collapsed.

## U4 — review-tool A/B + rescue flow

**Files:** edit `dev/sprite-review.py`, `dev/sprite-review.html`. Stacked on U1's tip.

1. `dev/sprite-review.py`: serve `GET /sprites-prev/<slug>.png` from
   `dev/sprite-manifests/review/prev/` (404 when absent — mirror the existing
   `/sprites/` handler); `/api/data` gains `"prev": [<slug>, ...]` (the list of slugs
   with a backup).
2. `dev/sprite-review.html`: when the focused slug has a prev copy, show an A/B toggle
   (key `x`, button `A/B`) swapping the stage image between `/sprites/…` and
   `/sprites-prev/…` with a visible `NEW`/`OLD` tag. PASS/FAIL semantics unchanged (they
   rule on the NEW art).
3. Rescue flow (docs, not code): a recut sprite that had `verdict:"fail"` gets re-ruled
   in the tool; on PASS the overlay flips, and the wave close re-runs
   `python3 build/gen-xl-regen-sheets.py` so the slug leaves the REDO tier (D4). Add
   this sentence to the tool's header docstring.

**Verify (V4):** ⊗ red-first: with no prev dir the tool behaves as today (no toggle).
With a prev copy planted for one slug: toggle swaps images (curl both endpoints, 200 +
distinct bytes), overlay POST unchanged. `node dev/verify-sprite-registry.mjs` green.

## U5a — billboard aspect + groundOffset (theater)

**Files:** edit `src/ui/theater-boot.js`, `dev/sprite-review.py` (ALLOWED_KEYS),
`build/gen-sprite-registry.py` (passthrough), `dev/sprite-review.html` (ground-line UI).

1. `buildSpriteBillboard` (src/ui/theater-boot.js:2507): read
   `aspect = tex.image.width / tex.image.height` (guard: finite, >0, else 1);
   `new THREE.PlaneGeometry(h * aspect, h)` replaces the square at :2519. Comment: D6,
   886/896 crops non-square.
2. `groundOffset`: registry entries may carry it (0–0.5). In `buildSpriteBillboard`,
   `mesh.position.y = h/2 − h × (entry.groundOffset || 0)` replaces :2524's `h / 2`.
3. `build/gen-sprite-registry.py` overlay whitelist (after the `note` block, :246–247):
   pass through `groundOffset` when `isinstance(..., (int,float)) and 0 <= v <= 0.5`,
   rounded to 3 decimals.
4. `dev/sprite-review.py` ALLOWED_KEYS (:79) gains `groundOffset`; validate the same
   range (mirror the `scale` validation block at :90).
5. `dev/sprite-review.html`: draw the ground line in the lineup at the offset (a 1px
   line already exists for the ground — shift the focused sprite's baseline by
   `groundOffset`); no editing UI required this wave (values come from the vision pass;
   Adam adjusts via SAVE only if the JSON is hand-tweaked — keep scope).
6. Run `python3 build/check-manifest.py` after the theater edit (module file).

**Verify (V5a):** ⊗ red-first mutation check: jsdom-load `genesis.html` in document
order, stub a registry entry with a 0.5-aspect texture, assert plane geometry width ==
height × 0.5 (fix off → square → red; fix on → green). groundOffset 0.1 shifts
mesh.position.y by −0.1 × h. `python3 build/check-manifest.py` OK; full
`for f in dev/verify-*.mjs` sweep by exit code; `node dev/verify-theater-sprites.mjs`
green.

## U5b — sizing pass v2 (vision fan-out; orchestrator-run, no code unit)

**Population:** the 471 slugs that are cut + verdict-absent + NOT in
`xl-regen-manifest.json` slugs. Approved (`pass`) and failed slugs untouched.

1. Vision protocol per sprite (Workflow fan-out, ~15 sprites/agent, agents Read the PNG):
   estimate `crownFrac` (top of the creature's head — EXCLUDE raised weapons/wings/horns
   held above the head, INCLUDE the skull), `groundFrac` (the ground-contact line — the
   midpoint of where the weight-bearing feet touch; for a 3/4 view the FRONT foot's
   contact, not the lowest trailing pixel; for serpents/oozes the belly line), and
   `estFt` (standing height crown-to-ground in feet; trust the bestiary/SRD height for
   the species when the art is ambiguous — the existing overlay note's "est N′" is the
   prior pass's estimate, visible for reference). Sidecar JSON per batch in the
   scratchpad: `{slug: {estFt, crownFrac, groundFrac, confidence: "high|low", note}}`.
2. Integrator (one fail-loud script, orchestrator-run): for each slug,
   `span = groundFrac − crownFrac` (guard 0.2 ≤ span ≤ 1.0, else flag + keep old scale);
   `planeFt = 6 × SPRITE_SIZE_SCALE[size]` (tiny .5, small/medium 1, large 2, huge 3,
   gargantuan 4 — src/ui/theater-boot.js:2455; size from the registry, medium when
   null); `scale = round(estFt / (planeFt × span), 3)`;
   `groundOffset = round(1 − groundFrac, 3)` (write only if ≥ 0.02). Write both + note
   `"auto-scale v2 (span {span}): est {estFt}′"` into the overlay for verdict-absent
   slugs ONLY; collision-check that no slug got two sidecar entries; fail loud on
   uncovered population.
3. Close: `python3 build/gen-sprite-registry.py --manifest dev/sprite-manifests/v2-manifest.json`
   + `python3 build/check-manifest.py` + `node dev/verify-sprite-registry.mjs`.

**Verify (V5b):** integrator asserts 100% population coverage (471 in, 471 written or
explicitly flagged), all scales in (0.05, 8) (the review tool's own range, :90), spot
Read of 5 random updated slugs' PNGs by the orchestrator comparing the JSON anchors
against the art.

## U6 — magenta triage (vision fan-out; orchestrator-run, no code unit)

**Population:** every slug with interior+edge > 20 in the scan (≈415) PLUS every
`verdict:"fail"` slug under 9 ft effective height (Adam: rescue candidates — "some were
fine otherwise"; 9 ft = the XL cutoff, so rescues shrink the REDO tier, not XL/titan).

1. Vision protocol (Workflow, ~15/agent, Read the PNG + the scan counts): classify per
   the triage shape (`art` / `unmix` + strength / `regen`). Guidance: near-pure magenta
   on wisps/membranes/glow edges → `unmix` 1.0; broad soft purple cast over otherwise
   good art → `unmix` 0.6–0.8; the creature IS purple art (worm, fungus, tieflings) →
   `art`; the art itself is malformed/magenta mush → `regen`. For failed slugs also
   answer: "fine otherwise?" — if yes, `unmix` (that marks it a rescue candidate).
2. Integrator merges sidecars into `dev/sprite-manifests/magenta-triage.json` (fail-loud
   on collisions/uncovered), prints class histogram.

**Verify (V6):** coverage assert; orchestrator spot-checks 8 classifications by Reading
the PNGs (2 per class + 2 rescues) before U3 consumes the file.

## Queue & dependencies

```
U1 scanner  ──┐                    (parallel: U1, U2, U5a code units; U6 vision fan-out)
U2 unmix    ──┼─→ U3 recut ─→ Adam re-review (A/B) ─→ close: gen-xl-regen-sheets re-run
U6 triage   ──┘
U1 ─→ U4 A/B (stacked on U1 tip)
U5a aspect  ── independent
U5b sizing  ── independent vision fan-out; integrator after U5a lands (groundOffset key exists)
```

## OUT of scope

- The folder refactor (Part A of the 2026-07-09 plan) — separate unit at the wave sweep
  point; nothing here moves directories.
- Regen prompt hardening + the transparent-background experiment — queued behind the
  running gen wave.
- Touching any slug with an Adam verdict (pass OR fail) in the sizing pass.
- The overlay is a live collision surface: Adam's review tool writes it in the MAIN tree.
  Integrators write it ONLY on this branch; landing reconciles per-slug (additive keys on
  disjoint slug sets — flag any overlap loudly at merge).
- ES-module conversion, render-path changes beyond :2519/:2524, any `GS`/state work.
