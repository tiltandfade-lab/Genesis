---
type: system-spec
status: specced 2026-07-02 midday — batch-3 unit 9. Verified gap: typed buildings absent; Tavern 2.0 + Settlement 1.1 are robust but VAULT-ONLY (zero in-app wiring); no persistent city structure.
created: 2026-07-02
related:
  - "[[ON-DEMAND-GEN]]"
  - "[[ECONOMY-SINKS]]"
  - "[[TABLE-GAPS-070126]]"
  - "[[REGIONS-NAMES]]"
  - "[[SHOP-UI]]"
---

# Urban Fabric — typed buildings, lazy districts, the tavern as a surface

## §0. Verified findings + Adam's forks (2026-07-02)

Street layer = the corpus's richest lane (~45 tables; scene-frame d400). But: **no typed
institution machinery** (temple/guildhall/manor/garrison/court/bathhouse/den/warehouse/dock = pure
invention today); **Tavern Generator 2.0 (487 lines) and Settlement & District v1.1 (348 lines)
are vault procedures with ZERO in-app wiring** (in-app urban buildings = `makeShop` +
`rollBuildingInterior`, full stop); **no persistent city structure** (a city is one node).

| Fork | Adam's call |
| --- | --- |
| Port vs kit | **Distill into TYPE KITS; the procedures are SOURCE.** One roller for all types; Tavern 2.0's chains become the tavern kit's tables (content preserved, original archived per the vault discipline); Settlement 1.1's logic becomes the district-mint rules. One engine, no parallel machinery. |
| Persistence | **Lazy: districts mint on entry (write-once codex records); buildings mint SOFT on approach, lock on contact.** A city accumulates exactly the geography you've touched. |

## §1. The typed building roller

`rollBuilding(type, opts)` = the `building-interior` base roll + a **TYPE KIT**
(`data/building-kits.js`): `{ function-line, proprietor (a rollNPC roleHint — always a rolled
person), patrons-lane (kit-biased draw), economyTie, hookLane, namePattern }`.
- **v1 types (~12):** `tavern · temple · guildhall · manor · garrison · court · bathhouse ·
  gambling-den · warehouse · dock-house` + the shop kinds (`smithy/apothecary/general/arcanist`)
  which DELEGATE to `makeShop` (the kit adds the room around the counter).
- **Tavern = the flagship kit**, distilled from Tavern 2.0: its inline chains are EXTRACTED into
  proper Engine table files (`Tavern - *`; the procedure archived, never deleted — Adam's
  authored content moves, verbatim). The tavern kit binds the week's systems together: contact
  here fires a **Distant Word** roll; **Downtime** carouse resolves here; the proprietor IS the
  **lodging** owner NPC (attitude tint live); `tavern-encounters` (19 rows — expansion flagged
  for a later wave) seasons it.
- **Gen handshake: NO new kind** — `gen kind:"interior"` gains `opts.type` consuming the kit
  (ON-DEMAND-GEN's contract unchanged; the runbook line updates).

## §2. District fabric (Settlement 1.1, distilled)

- **On first entry** to a settlement node: mint districts as write-once codex records linked to
  the node — count by PLACE_TIERS tier: hamlet 0 (the place is one fabric) · village 1 ·
  town 1d2 · city 1d3+1. Each: `urban-district-type` + a character line (Settlement 1.1's
  distilled logic) + a dominant-faction tint where the web reaches.
- **The active district contextualizes everything local:** urban walks take it as a bias (like
  region, one level down), the ambient pool and shops bind to it, drift rolls can name it.
- Buildings mint soft on approach (player intent or DM `gen`), lock on contact — never
  pre-built. Big cities grow across visits, capped by tier.

## §3. Build + verify (batch-3 unit 9)

1. `data/building-kits.js` + `rollBuilding` (+ shop delegation). 2. The Tavern 2.0 extraction
pass (tables out, procedure archived; compile clean). 3. District mint-on-entry + codex links +
walk bias. 4. `gen interior opts.type` + runbook line (frontier prose). 5. The tavern's three
system-surfaces (distant-word fire, carouse venue, lodging owner). 6. `dev/verify-urban-fabric.mjs`
(≥10/0): typed roll always yields a rolled proprietor (mutation check: freehand proprietor,
fails) · shop kinds delegate to makeShop · district count by tier, minted ONCE (mutation check:
re-entry re-mints, fails) · buildings soft→lock on contact · tavern contact fires distant-word ·
extraction preserves Tavern 2.0 row text verbatim (diff-check vs archive) · regression: economy/
shop/gen suites unchanged.
