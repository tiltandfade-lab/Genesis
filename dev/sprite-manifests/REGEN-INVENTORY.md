# Fantasy pixel-sprite regen inventory

**Scope:** fantasy pixel art only (`assets/sprites/spr-fantasy-*.png`). Faceted reserve and the
non-fantasy realms are explicitly out of scope per Adam (2026-07-16 — "we aren't using any of the
faceted stuff… all we are worried about is the pixel art now… get [fantasy] up and running before
we start adding other realms").

**Sheet structure follows the art department** (`docs/ART-DEPARTMENT.md` §3 grid ladder + the XL
ruling). Cells-per-sheet by size band:

| tier | size band | grid | per sheet |
|---|---|---|---|
| T0 titanic / T1 gargantuan | 1×1 | **1 (own sheet)** |
| T2 huge | 2×1 | **2 (share with one other)** |
| T3 large | 2×2 | 4 |
| T4 medium-large beast | 3×3 | 9 |
| T5 medium | 4×4 | 16 · humanoids always 4×6 = 24 |
| T6 small | 5×5 | 25 |

> Adam's XL ruling (quoted in `docs/ART-DEPARTMENT.md` §6): *"creatures 9' and up need to be
> regened at 2x on sheets with less sprites — 4 per sheet for the big ones, and the real badass
> titanic ones get their own sheet."*

Regenerate via **Runbook A** (`docs/ART-DEPARTMENT.md` §6) or the XL path
(`build/gen-xl-regen-sheets.py` → `XL-REGEN-PROMPTS.md`). Slices overwrite the original slug in place.

---

## 1. ALL REGEN CANDIDATES ARE NOW QUEUED (Adam 2026-07-16: "re-gen anything questionable")

Every definite + questionable sprite is now in `xl-regen-manifest.json` / `XL-REGEN-PROMPTS.md`.
Two overlay edits made this happen (flameskull + giant-toad → `verdict:fail`, folding them into the
redo lane); `giant-crocodile` was already `fail` but the manifest was stale — a re-run of
`build/gen-xl-regen-sheets.py` picked it up. Placement per the selector
(`eff_ft = scale × 6 × size_plane`):

| sprite | size | current px | lands in | image |
|---|---|---|---|---|
| Purple Worm | Gargantuan | 78×78 | **titan solo** (28 ft eff) | [png](../../assets/sprites/spr-fantasy-purple-worm.png) |
| Swarm of Piranhas | Medium | 71×71 | XL (10.6 ft eff) | [png](../../assets/sprites/spr-fantasy-swarm-of-piranhas.png) |
| Giant Constrictor Snake | Huge | 46×47 | XL (10 ft eff) | [png](../../assets/sprites/spr-fantasy-giant-constrictor-snake.png) |
| Swarm of Larvae | Large | 60×45 | XL (13 ft eff) | [png](../../assets/sprites/spr-fantasy-swarm-of-larvae.png) |
| Animated Rug of Smothering | Large | 35×30 | XL (11 ft eff) | [png](../../assets/sprites/spr-fantasy-animated-rug-of-smothering.png) |
| **Giant Crocodile** | Huge | 60×47 | **redo-1** (the true gap; was stale) | [png](../../assets/sprites/spr-fantasy-giant-crocodile.png) |
| Giant Toad | Large | 116×78 | redo-1 | [png](../../assets/sprites/spr-fantasy-giant-toad.png) |
| Swarm of Stirges | Medium | 84×98 | redo-1 | [png](../../assets/sprites/spr-fantasy-swarm-of-stirges.png) |
| Flameskull | Tiny | 80×112 | redo-2 | [png](../../assets/sprites/spr-fantasy-flameskull.png) |

Review contact sheet (NEAREST-upscaled): `scratchpad/regen-candidates.png`.

---

## 2. THE REGEN ORDER — 65 sheets, 206 creatures

Generate top-to-bottom (biggest → smallest); each block is one ImageGen paste from
`XL-REGEN-PROMPTS.md`. Slice a returned PNG with
`slice-sprites.py <png> --manifest-v2 <sheetId> --manifest-path dev/sprite-manifests/xl-regen-manifest.json --review`
(overwrites the original slug in place).

1. **24 titan solos** — 1/sheet, full-frame 2× (the "own sheet" tier): kraken, colossus, tarrasque,
   the 9 ancient dragons, roc, purple-worm, dragon-turtle, elemental-cataclysm, blob-of-annihilation,
   shadow-dragon, the adult chromatic/metallic dragons, …
2. **39 XL sheets** — 4/sheet, 9–24 ft (the "share with one other/three" tier): cloud-giant/treant/
   behir, storm-giant/giant-squid/remorhaz, hydra, the adult dragons, giants, … (~155 creatures).
3. **2 redo sheets** — 25/sheet, <9 ft rejects: **redo-1** (25) holds the genuine low-res fixes —
   giant-crocodile, giant-toad, swarm-of-stirges, swarm-of-rats — alongside the auto-scale fails;
   **redo-2** (2) = swarm-of-insects, flameskull.

**Caveat on redo-1:** ~18 of its 25 cells are creatures flagged `fail` only for *auto-scale framing*
(killer-whale, archmage, aberrant-cultist, banshee, ghost, specter, sea-hag, …) whose **art is
actually fine**. Regenerating them is a re-roll at the same resolution, not a quality fix — trim
them from the lane if you only want the genuinely-mushy ones redone.

---

## 4. NOT regen — scale-metadata fix only

These render *too small in-world* but the **pixel art is crisp and correct** — they need a
footprint-aware scale fix, not new art. Root cause: the auto-scaler derives in-world size from
**height above ground**, so low/long creatures (crocodile, lion, tiger, wolves, bears, sharks,
dinosaurs) get undersized.

- **61 Medium+ creatures** render < 60% of their size-cohort median scale — full list in
  `scratchpad/too-small.json`. Overwhelmingly low-slung quadrupeds.
- **~50 of the 56 `verdict=fail` sprites** are `⚠ auto-scale (art likely extends above head)`
  framing flags on **high-resolution, good art** (dragons/titans at 200–490 px — Kraken 470×428,
  Tarrasque 492×430, ancient dragons ~230–260). These are the massive-creature XL set; they need
  the 2× re-cut (scale) already queued in `XL-REGEN-PROMPTS.md`, not quality regen.

---

## 5. NOT regen — needs review + rescale (unreviewed backlog)

**131 fantasy monsters** carry no pass/fail verdict in the redline overlay (plus 75 NPCs). Size
split: **Medium 53, Small 14, Tiny 7, Large 27, Huge 7, Gargantuan 0** — i.e. **mostly
medium/small; only 34 (25%) are Large+.** So the unreviewed set is *not* "the massive creatures" —
the massive-creature axis is the 9-ft+ XL set in §4, which is already queued. The unreviewed set
needs the review pass (`dev/sprite-review.py`) + scale ruling, not regeneration. Spot-checks
(Stone Giant, Iron Golem, Gnoll Warrior, Giant Spider, farmers) all looked clean.

---

## 6. Not a problem (verified)

- **Coverage:** fantasy is 100% present (680/680) — nothing missing.
- **Neighbor-bleed / sloppy cuts:** connected-component scan of all 680 came back clean — top
  hits were legitimate swarms and naturally multi-part creatures. Either already fixed or was in
  the (abandoned) faceted set.
- **MC-2 magenta cleanup** (parallel session, committed today): verified non-destructive — worst
  sharpness drop 3%, zero significant opacity loss across all 372 touched sprites.

---

## Suggested first sheet (per the grid ladder)

One **T2 huge 2-up** sheet to fix the only true gap plus its neighbor:
`giant-crocodile` + `giant-shark` (or `giant-constrictor-snake`), regenerated at 2× per the XL
ruling. Then run the existing `XL-REGEN-PROMPTS.md` sheets for the rest of §2.
