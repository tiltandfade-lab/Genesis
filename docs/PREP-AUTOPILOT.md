---
type: system-spec
status: specced 2026-07-01 night — build-ready (overnight batch; the smallest unit — a wiring memo)
created: 2026-07-01
related:
  - "[[DM-BRIDGE]]"
  - "[[SYNTHESIS-CONTRACT]]"
  - "[[SESSION-PREP]]"
  - "[[SPECULATIVE-PREFETCH]]"
---

# Prep Autopilot — latency leg 2's missing trigger

## §0. Scope

Leg 2 is 95% built: `dev/prep-fanout.workflow.js` (Haiku harvest → parallel per-env reskin →
stat-block preload), the `prep_applied` event (`src/world/dm.js:1264`), `applyPrep`
(`src/world/prep.js:166`), and every-turn consumption via `activeWalkDigest` all exist and are
wired. **The only gap is the trigger** — nothing tells the DM loop to run the workflow, so deep
prep never happens unless someone remembers. This spec adds the signal + the standing rule.

## §1. The signal — `digest.prepPending`

`dmDigest()` gains a small block when staged prep lacks synthesis:

```jsonc
"prepPending": { "session": 4, "frontiers": ["frontier-s4-0 (urban)", "…"],
                 "reason": "no-overlays" | "needsReskin" }
```

- Present when `P.bundle` exists and any prep node has no overlay (or `needsReskin` from a
  WALK-CONSUMPTION promotion). Absent otherwise — its absence is the all-clear.
- Rides the (post-DIET) lean digest; it's ~100 bytes.

## §2. The standing rule (frontier-tier prose, lands in `DM-BRIDGE.md` with the batch)

When `digest.prepPending` appears: run
`Workflow({scriptPath:"dev/prep-fanout.workflow.js"}, <the handoff bundle — pull via
dev/peek-state.py, never raw state.json>)` in the background, and when it returns, post ONE
`prep_applied` event with `{harvest, overlays}`. Fire-and-continue: never block the current
narration turn on it; the walks work un-reskinned (soft) until it lands. It runs on Haiku —
cost is cents. If it fails, skip silently and retry next time the flag appears.

## §3. Build plan

1. `prepPending` assembly in `dmDigest()` (read `P.bundle`/`P.overlays`/`needsReskin` flags).
2. `peek-state.py` (from DIGEST-DIET) gains a `handoff` query returning the prep bundle JSON
   (the workflow's input shape — reconcile against `prepHandoff`/`P.bundle`).
3. The §2 runbook block (frontier-tier).
4. Asserts in `dev/verify-prep` extension or a small `verify-prep-autopilot.mjs`: flag present
   when overlays missing → absent after `applyPrep` → reappears when `walk_complete` promotion
   sets `needsReskin`.

## §4. Acceptance

Session 2+ starts with reskinned, stat-block-preloaded walks without anyone touching anything —
and the first playtest after the batch shows `briefing`/`reskin` fields populated in
`activeWalkDigest` instead of null.
