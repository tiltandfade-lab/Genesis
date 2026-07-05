---
type: system-spec
project: Genesis
status: SPECCED 2026-07-04 — realm props data layer + realm-filtered prop select + the
  prop-sizing render pass (NEXT-STEPS later-3 item 4). Prop-size mapping is PROVISIONAL
  (Adam veto row §5.2). Sonnet-executable.
created: 2026-07-04
related:
  - "[[REALM-PROPS-DRAFT]]"
  - "[[REALM-WIRING]]"
  - "[[REALM-MODELS-P3]]"
---

# REALM-PROPS-WIRING — breach rooms dress in their realm's furniture, at honest size

## §0 The gap

308 props are drafted with Size + Cover + crossRealm tags (REALM-PROPS-DRAFT.md) but no
`data/realm-props.js` exists; `THEATER_PROP_KEYWORD_RULES` (theater-data.js:227–289) derives
props from segment text realm-blind; and `Size` drives nothing — a Huge Gutted Tank Hulk would
render at crate scale in one zone tile.

## §1 Unit P1 — `data/realm-props.js` (generated)

- Author `dev/model-qa/realm-props.json` from the draft doc: per prop `{name, size, cover,
  crossRealm ("all" | [realm,...] | realm), model, summary}`. `model` = an existing
  WHOLE_OBJECT_REGISTRY prop key, or `net-new: <brief>` (the 31-model queue,
  [[REALM-MODELS-P3]] fills behind — missing model → existing generic prop fallback by cover
  kind, never a hole).
- **Dedupe law (Adam's "dedupe the cross-realm-all first"):** the 50 `all` props are single
  records; realm lists reference, never copy. The build validates no duplicate names corpus-wide.
- Generator `build/gen-realm-props.py` (`--check` mode) → `data/realm-props.js`
  (`REALM_PROPS` + `realmPropsFor(realms)` accessor), manifest + script-tag registered.

## §2 Unit P2 — realm-filtered prop select

In the G4 prop derivation (theater-data.js:620–684): when the walk skin carries active realms
(SAME `activeRealmsFor` seam), the keyword rules consult `realmPropsFor(realms)` FIRST — a
segment feature/cover/hazard text that matches a realm prop's name/summary emits that prop
(with its model key + size + cover); no match → the existing generic rules (regression law:
no realms → byte-identical). Cover values from the prop feed the existing cover fields
untouched. Prop names ride the prose twin (blind-playable).

## §3 Unit P3 — the prop-sizing render pass

PROVISIONAL mapping (veto row): props render footprint by Size —
`Small = 0.55× tile, decorative (units may share the tile)` ·
`Medium = 0.8×, shares` · `Large = 1.0×, OCCUPIES (unit may not stand on it)` ·
`Huge = 1.6× spanning toward a second tile, OCCUPIES both anchor tiles`.
Implementation: a `propFootprint(size)` helper in theater-boot.js's prop mount; occupancy
marks the zone tile(s) unstandable in placement (same structure the light-prop mount's
"nearest unoccupied tile" logic already navigates — reuse it). Scale multiplies the authored
model (props are authored at Medium-normal).

## §4 Build + verify

P1 → P2 → P3 stacked on `feat/realm-props-wiring`. check-manifest OK per step. Extend
`dev/verify-theater-data.mjs`: breach fixture with a matching feature → realm prop emitted with
model+size; non-breach → legacy rules only; every non-net-new model key resolves in the
registry; footprint: Huge marks 2 tiles occupied, Small marks none. MUTATION: break the realm
consult → frontier breach emits zero realm props → fail. Visual gate: one captured board with a
Small/Medium/Large/Huge prop row, orchestrator-judged.

## §5 Decisions (flag to veto)

| # | Decision | Ground |
|---|---|---|
| 1 | Missing model → generic prop fallback by cover kind | graceful; mirrors net-new creature → cuboid |
| 2 | **The §3 size→footprint table** | PROVISIONAL — Adam has not ruled a mapping; values chosen to read on the 45° board |
| 3 | Realm props consulted before generic keyword rules | the realm register should win inside a breach |
| 4 | `all` props deduped to single records | Adam's explicit instruction; shrinks the model queue |
