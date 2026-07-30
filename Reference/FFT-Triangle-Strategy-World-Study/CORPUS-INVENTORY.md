# Corpus inventory

Final state of the study corpus, 2026-07-29. Machine-readable ledgers (per-file URLs,
dimensions, selection/rejection reasons) live beside the images in `local-captures/`:
`fft-ledger.json` · `ts-ledger.json` · `ic-ledger.json` (+ `*-notes.md` prose).

## Counts vs the §13.A corpus gate

| requirement | achieved |
|---|---|
| ≥18 distinct FFT maps inventoried | **49** with usable imagery (421 ledger file-entries); **121** maps dimension-measured; **48** with exact FFHacktics per-tile grids |
| ≥18 distinct TS battle maps | **26** chapter-identified (+3 official-screenshot terrain entries) across 29 folders; 72 files; 8 grid-visible frames |
| ≥6 IC comparisons where available | **11** maps with Enhanced terrain evidence; **2 first-party same-camera Classic/Enhanced pairs** (Orbonne, Zeirchele) |
| ≥8 current Genesis captures inspected | **10** inspected across 4 worktrees (GENESIS-CAPTURE-INVENTORY.md) |
| 12 final comparison packets | ✓ below |
| terrain-image selection/rejection recorded | ✓ ledgers + `_quarantine`/`_rejected` dirs + this file |

## Version separation (§13.D)

Original FFT (five-angle render corpus + FFHacktics grids + 2008-era stills), **never
blended** with Ivalice Chronicles files (separate tree, `__enhanced__`/`__classic__` mode
tags in filenames, separate ledger). TS is its own tree. Genesis engine captures are
separated from Genesis *target renders* throughout (capture inventory vs scale-pass).

## The twelve packets

| # | archetype | FFT anchor (exact grid) | TS column (est. grid) | IC column | Genesis column |
|---|---|---|---|---|---|
| p01 | open field | Mandalia Plains 12–13×13 | Norzelia green field ~16-20×14-18 | Mandalia Plain (Enh) | Site-02 camp small (13×15 intent) |
| p02 | hill/cliff | Grog Hill 11×13 | Falkes wheat terraces ~18-24×14-18 | — (no matched capture; gap) | CL-F09 hillside fixture (capture) |
| p03 | forest/organic | Sweegy Woods 11×12 | Roselle village — **NON-HOMOLOGOUS** (no dense-forest battle exists in TS; declared) | Siedge Weald (Enh) | Site-02 camp medium — **NON-HOMOLOGOUS** (clearing) |
| p04 | bridge/water | Zirekile Falls 11×10 | Whiteholm bridge gate ~16-20×12-16 | Zeirchele **mode PAIR** | Site-12 bog crossing (15×18 intent) |
| p05 | snow/low-value | Fort Zeakden 9×13 | Twinsgate fortress ~18-24×14-18 | Ziekden Fortress (Enh) | **DECLARED GAP** — no Genesis snow target/capture |
| p06 | urban street/market | Dorter Trade City 9×11 | **Wolffort Streets** ~22-26×16-20 | Merchant Dorter (Enh) | Site-10 market-hall medium (26×30 intent) |
| p07 | fortified gate | Igros Main Gate 10×13 | Glenbrook ramparts ~18-24×14-18 | Lionel Castle Gate (Enh) | Site-09 rising gate small (18×22 intent) |
| p08 | monastery/sacred | Orbonne Monastery 10×14 | Hyzante Goddess court ~18-22×14-18 | Orbonne **mode PAIR** | Site-04 wrapped court medium (24×26 intent) |
| p09 | mine/industrial | Goug Machine City 8×11 | Grand Norzelia mine ~18-24×14-18 | — (Colliery thumbnails only; gap) | Site-05 strained drift medium (24×28 intent) |
| p10 | dense interior | Book Storage 5F 12×15 | Wolffort great hall — **NON-HOMOLOGOUS** (no roofed-interior TS frame; declared) | — | CL-F05 trimmed rooms (capture) |
| p11 | max verticality | Bervenia Free City 10×13–14 | Telliore reservoir dam ~18-22×14-18 ("Height 32" HUD) | Riovanes Roof (Enh) | Site-09 wall-stair vignette (active-window intent) |
| p12 | quiet/sparse control | Windmill Shed interior 7–8×8 | Norzelia dry steppe ~16-20×12-16 | Sand Rat's Sietch (ID med-high conf) | Site-03 stopped shelter small (14×16 intent) |

Declared honest gaps inside packets: p02-IC, p05-Genesis, p09-IC, p10-IC. A declared gap
was preferred to a forced pair throughout (§7.3 rule).

## Analytical plates (§9.3)

`local-analysis-plates/packets/` — 21 eight-panel sheets: all 12 packets carry the FFT
anchor sheet; Genesis columns for p02/p06/p10/p11; TS columns for p02/p06/p09; IC columns
for p04/p08. Annotation JSONs in `local-analysis-plates/annotations/`. All local-only
(copyrighted pixels).

## The terrain-image gate, as executed (§6.2)

1. Candidate inventories were built before selection (three agent ledgers + the five-angle
   sweep + the in-repo `Reference/FFT Battle Maps/` catalog).
2. Nothing was chosen by filename/ranking alone — every packet anchor was visually
   inspected by Fable (sheets in `local-analysis-plates/fft-cohort/`, per-frame reads in
   session record); the id-28/29/30 naming mismatch was caught exactly this way and the
   Colliery slot re-anchored to a verified map.
3. Full-map/high-angle terrain-dominant frames preferred everywhere; multi-view sets used
   where they exist (five-angle ×5, Fandom rotations, grid overlays).
4. Second frames acquired where effects obscure (weather pairs, mode pairs).
5. Rejections recorded with reasons (ledgers; `_quarantine`/`_rejected`: UI-buried,
   sprite-closeup, untraced-provenance, menu frames).
6. Known weaknesses stated: no first-party FFT stills (community renders of shipped map
   data, geometry-faithful, labeled); 21/72 TS files classified from captions (flagged
   per-file); 5 Steam TS frames tentative-ID; IC Colliery/Bethla unusable (thumbnail/fog).

## Genesis capture & target columns

Engine captures: see `GENESIS-CAPTURE-INVENTORY.md` (10 inspected, staleness rules).
Target renders: `Reference/Golden-Site-Ideal-Art/scale-pass-2026-07-28/` (27 active
targets + archived NOT-A-GOAL extra-large; documented cell intents in PROMPT-SET.md).
