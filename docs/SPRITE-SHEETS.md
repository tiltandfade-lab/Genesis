---
type: system-spec
project: Genesis
status: pipeline built 2026-07-03 (manifests + slicer + self-test green) — generation is Adam's, not started
created: 2026-07-03
related:
  - "[[BATTLE-THEATER]]"   # §3 — the T2-sprites unit consumes assets/sprites/ later
---

# Sprite Sheets — creature sprite generation + slicing pipeline

Two build scripts turn the 510-entry bestiary into game-ready 2D creature sprites via a
ChatGPT paste-a-prompt / drop-a-PNG workflow (Adam's established keying convention: flat
magenta `#FF00FF` background, key it out in post). Two lanes: **sheets** (6×6 grid, 36
creatures/image — the bulk tiers) and **hero singles** (one production sprite per image —
every CR ≥ 3 creature plus every `role: leader`).

## The pipeline

1. **`python3 build/gen-sprite-manifests.py`** reads `data/bestiary.js`, clusters all 508
   real creatures (2 non-creature bestiary rows dropped — doc-header artifacts, not stat
   blocks) into **15 style-coherent sheets** of up to 36 creatures each, selects the
   **266 heroes** (CR ≥ 3 or `role: leader`), and writes to `dev/sprite-manifests/`:
   - `MASTER-SPEC.md` — the master sprite specification as one fenced paste-ready block
     (the locked style preamble + explicit rules: 3/4 view facing left, angular
     near-realistic proportions, upper-left lighting, desaturated oxblood/steel/bone/moss
     palette, no outlines, no drop shadows, flat magenta background, consistent scale) plus
     the **reference-anchor step** (below).
   - `sheet-NN.md` — one ready-to-paste ChatGPT prompt per sheet (a one-line header, then
     the prompt in a fenced code block so it copies clean; the creature list is row-major,
     each creature with a short mechanically-derived visual descriptor — name +
     creatureType + size + CR-band wording, no invented lore).
   - `heroes.md` — one paste-ready single-sprite prompt per hero creature ("single
     creature, centered, larger detail" under the same master spec).
   - `manifest.json` — the sheet → ordered-slug map **and** the `heroes` slug list; the
     contract the slicer reads.
   All **generated but committed** (same discipline as `tables.json` — edit the generator
   or the bestiary source, never hand-edit the output, re-run to refresh).

2. **Adam generates in ChatGPT — anchor first, then sheets, then heroes.**
   - **Step 0 (the anchor):** paste `MASTER-SPEC.md`'s spec block, then its reference-anchor
     prompt — ONE definitive single sprite (a bandit, mid-CR humanoid). Refine it until the
     style is exactly right, quoting the specific violated rule when a generation drifts.
     Nothing else runs until the anchor is locked.
   - **Sheets:** in the SAME conversation (the anchor stays in context and holds the style),
     paste `sheet-01.md`'s block, review, then run the remaining sheets. Drop each PNG at
     `dev/sprite-sheets/incoming/sheet-NN.png` (git-ignored — large, regenerable, not
     source). If a later sheet drifts, point ChatGPT back at the anchor sprite.
   - **Heroes:** paste blocks from `heroes.md` one at a time (same conversation); heroes can
     trickle in over time — they're slug-addressed, so order and timing don't matter.
   - **ChatGPT Plus has an image-generation rate limit** — expect to spread the 15 sheets
     (plus hero singles as needed) across many sittings, a few images per sitting.

3. **Slice.**
   - Sheets: `python3 build/slice-sprites.py dev/sprite-sheets/incoming/sheet-01.png 1` —
     keys out the magenta (tolerant of compression fringe), finds the creature blobs, sorts
     them row-major, matches 1:1 against `manifest.json`'s slug order for that sheet, crops
     each with padding, writes `assets/sprites/<slug>.png` (transparent background).
     - Add `--review` to always get a labeled contact-sheet HTML
       (`dev/sprite-manifests/review/sheet-NN.html`) — check it by eye before trusting a
       sheet; a slug mis-assignment is a silent-wrong-art failure mode, not a crash.
     - The last sheet (sheet-15) only has 4 creatures — run it with `--expect 4`.
     - **Failure is honest, not guessed:** if the detected creature count doesn't match
       `--expect`, the script writes the review sheet, lists which manifest slugs got no
       match, and exits nonzero. Fix by re-generating the sheet, adjusting `--tolerance`,
       or a targeted manual crop — never by letting the script assign blindly.
   - Heroes: `python3 build/slice-sprites.py <hero.png> --single <slug>` — one image → one
     keyed-out, trimmed, transparent `assets/sprites/<slug>.png`. The slug must exist in
     `manifest.json`'s heroes list (typo guard). A hero single **overwrites** that slug's
     sheet-sliced sprite if one exists — that's the point; the single is the production
     version.

4. `assets/sprites/<slug>.png` is the hand-off point. **`docs/BATTLE-THEATER.md` §3's
   `feat/theater-models` (T2) unit consumes these later** as (or alongside) the pack/
   fallback-cuboid figure system — wiring that consumption is out of scope here; this spec
   only covers getting sprites *into* `assets/sprites/`.

## Verifying the slicer without real art

`python3 dev/verify-sprite-pipeline.py` builds synthetic PNGs in code and asserts all three
paths: a clean 36-blob sheet round-trips to exactly 36 correctly-row-major-assigned
transparent PNGs; a deliberately-broken 35-blob sheet fails loudly (nonzero exit, correct
missing-slug report, review HTML written); and `--single` mode trims a one-creature image
(union bbox — a key-split detached fragment is kept, not cropped away), produces a
transparent RGBA, and rejects a slug not in the heroes list. Run it after touching either
build script.

## Regenerating the manifests

If the bestiary changes (new creatures, a `gen-bestiary.py` re-run), re-run
`python3 build/gen-sprite-manifests.py` and re-commit `dev/sprite-manifests/`. This will
shift sheet boundaries/slugs — any sheets Adam already generated in ChatGPT for the old
manifest will need re-slicing against the new one, or (if the shift is large) regenerating
in ChatGPT too. Hero singles are immune to boundary shifts (slug-addressed, not
position-addressed). Not expected to be a frequent regen; the bestiary is stable at 510
entries.
