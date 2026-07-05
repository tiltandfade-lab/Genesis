---
type: system-spec
project: Genesis
status: SPECCED 2026-07-04 — the MODELING lane of the realm-enrichment wave (NEXT-STEPS later-3
  item 1): every net-new realm creature + prop model. Queue FREEZES only after the icons fold
  (REALM-ENRICHMENT-WRITING W1/W2) regenerates the data. Authoring contract = CREATURE-MODELS-P2
  §1–§3 verbatim; this doc adds the queue, waves, and prop addendum.
created: 2026-07-04
related:
  - "[[CREATURE-MODELS-P2]]"
  - "[[REALM-ENRICHMENT-WRITING]]"
  - "[[REALM-PROPS-WIRING]]"
---

# REALM-MODELS-P3 — the net-new realm geometry (≈230 creatures + ≤31 props)

## §0 Scope + the freeze rule

- **Creatures:** every `model: "net-new: …"` row in the REGENERATED `data/realm-bestiary.js`
  (post-fold). Pre-fold counts: 207 draft + up to 23 icons ≈ 230. **The executor derives the
  exact queue from the data, never from this doc** — run a queue-extract script first
  (`node -e` over REALM_BESTIARY, group by realm, emit slug + the net-new brief).
- **Props:** the `net-new:` rows of `data/realm-props.js` (≤31 after the `all`-dedupe,
  [[REALM-PROPS-WIRING]] P1). Props land in the SAME WHOLE_OBJECT_REGISTRY grammar with a
  `prop-` slug prefix; no bestiary size-law disc — props sit flat on the tile (mirror the
  shipped set-piece modules, e.g. the lighting props).

## §1 Authoring contract

CREATURE-MODELS-P2 §1 (whole-object, probe-lib primitives, VS palette, no eyes, base-disc size
law), §2 (three-place registration: module + ps1-sheet SETS row + WHOLE_OBJECT_REGISTRY), §3
(gates: check-manifest → verify-theater-figures → the ORCHESTRATOR-READ render sheet) apply
verbatim. Wave sets in ps1-sheet.html: one `p3-<realm>` set per realm wave, `p3-props` for props.

**Realm register rider:** each wave brief carries its realm's register line (data/realms.js) —
a chrome creature reads clean/hard-surfaced, an ash one scoured, a bright-kingdom one candy-OVER-
teeth (the ONE licensed exception to no-candy: bright-kingdom's surface register, still
VS-desaturated underneath per the draft doc's palette notes). suburb is LOCKED 1980s Americana.

## §2 The waves (by realm, heavy realms split; base-sharing within each)

Play-frequency + count ordered; each wave ≤12 models (the proven batch width for one executor):

| Wave | Set | ~Count | Notes |
|---|---|---|---|
| M1 | lost-world A/B/C/D | 47 | dinosaur/megafauna bases seed each other — author the base 4 first |
| M2 | ash A/B/C/D | 46 | mutant/wreck-dweller bases; heavy humanoid-variant sharing |
| M3 | theater A/B/C/D | 39 | era-lens silhouettes (trench/legion/musket…); soldier base + kit swaps |
| M4 | chrome A/B/C | 36 | drone/mech/synth bases |
| M5 | frontier A/B | 23 | beast + gunhand variants |
| M6 | high-seas | 10 | |
| M7 | cosmic + gloom + icons-remainder | ~29 | 4+2 draft + the icon net-news distributed by realm |
| M8 | props | ≤31 | after P1's dedupe; grouped by silhouette family |

Within each wave: pick the 2–3 seed silhouettes first (the wave brief names them), then variants
lift. Waves are independent across realms → parallel worktrees; sub-waves within a realm are
sequential (base before lift).

## §3 Gates (per wave — never per model)

1. `python3 build/check-manifest.py` OK + `node dev/verify-theater-figures.mjs` all pass.
2. Render sheet captured (`ps1-capture.mjs --set p3-<wave>`) and READ by the orchestrator against
   each model's net-new brief: reads-as-the-creature at a glance, on-disc, VS grit, no floating
   parts, no candy (bright-kingdom rider excepted). Fix passes expected (F2/F3 precedent).
3. Land per wave: `git merge --no-ff` by the orchestrator only; executors never merge.

## §4 Out of scope / decisions

No renderer edits; no alias deletions; no animation. Decisions: (1) queue derived from
regenerated data, not doc counts — the fold moves it; (2) per-realm waves ≤12 wide — the proven
executor batch width; (3) props share the registry with `prop-` prefix — one resolution path.
Flag to veto.
