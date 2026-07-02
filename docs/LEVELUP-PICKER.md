---
type: system-spec
status: specced 2026-07-01 late night — build-ready (UI = Claude's lane; the TIER-SCOPE queued fast-follow)
created: 2026-07-01
related:
  - "[[TIER-SCOPE]]"
  - "[[ADVANCEMENT]]"
  - "[[CHAR-CREATION]]"
---

# Level-Up Picker — interpretive picks, in-app, minimal

## §0. Scope (Claude's autonomous UI calls; no open forks)

v1 left interpretive level-up picks (spells / ASI-or-feat / subclass) DM-narrated. This builds the
queued in-app picker: **guided-minimal** — the script lists what's LEGAL, the player taps, the DM
narrates the ceremony after. No builds-theorycrafting surface; the no-coaching rule extends here
(present options neutrally, never recommend).

## §1. Flow

On `applyLevelUp` detecting pending interpretive picks (from `CLASS_PROGRESSION` at the new
level): the rest completes, the level applies, and a **pick queue** opens as a game panel
(shop-panel pattern): one screen per pending pick, in order —
1. **Subclass** (L3): the class's SRD subclasses, name + one-line identity each.
2. **ASI-or-feat** (L4/8…): +2/+1+1 allocator (the creator's tap-to-assign pattern) or the feat
   list (SRD, `data/feats.js`).
3. **Spells known/prepared/swap** (casters): legal picks filtered by class list + level
   (`data/spells-slim.js`), the same glance-read rows as the creator's spell step.
Confirm per screen → writes through the existing sheet mutators; a `session` ledger line records
the picks; the DM's next digest carries `levelUp: {picks…}` so it can narrate the ceremony
("something settles into your hands…").

## §2. Constraints

- Legality only from `CLASS_PROGRESSION` + SRD data — never free-text, never DM-invented options.
- Skippable ("decide later"): the queue persists on the sheet until resolved; the rest-gate does
  NOT re-block (levels land; picks are riders).
- Reuses creator components (tap-assign, list rows) — no new visual language, asset-light (§II.0a
  gate holds).

## §3. Build + verify

1. Pick-queue state on the sheet + panel screens + mutator writes. 2. `levelUp` digest block.
3. `dev/verify-levelup-picker.mjs`: L3 barbarian gets exactly the legal subclasses · ASI allocator
enforces +2/+1+1 · wizard L4 spell picks filter by class+level (mutation check: loosen the filter,
harness fails) · skip persists the queue across reload · picks write the sheet + ledger + digest ·
regression `verify-advancement` green.
