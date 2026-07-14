---
type: system-spec
project: Genesis
status: SPECCED — 2026-07-14 (Adam's direction: "get a bot to play for a bit, capture screens from
  real play, and then learn what all is still outstanding, broken, ugly, not working")
governed_by: GRAPHICS-CONVERGENCE-CHARTER.md
audience: Sonnet executor (rig build), then orchestrated audit runs
---

# PLAY-LENS — the bot-play visual audit (play-driven prioritization)

The taste cards are diagnostic fixtures; the mockups are aspirations. PLAY-LENS is the third
instrument: a bot plays REAL sessions with the theater rendering, every scene is captured, and a
vision audit grades the captures into a ranked defect ledger. **The ledger — not spec age — orders
the remaining visual waves** (Stage E, ENV, P3-2, UNIFICATION, town/daytime, D5).

## PL-1 — the capture rig  ·  branch `feat/pl1-play-lens-rig`

### Decision
Extend the PROVEN pieces; invent nothing new:
- **Driver:** `dev/playtest-bridgeless.mjs` (the headless jsdom playtest loop + bug probes) is the
  play brain — REUSE its session-driving conventions (it already plays whole sessions bridgeless).
  The rig is a NEW `dev/play-lens.mjs` that composes that driving pattern with a real render
  (puppeteer, the `capture-dungeon-loop.mjs` mount pattern) instead of jsdom-only.
- **Capture policy:** one PNG at every SCENE CHANGE (new board/tray/room via trayFrom or
  setInteriorBoard) + every COMBAT ROUND start + every state_transition — filenames
  `pl-<seq>-<kind>-<context>.png` + a `manifest.json` row per shot {seq, kind, realm, env,
  nodeKind, walkId/segNum, lightProfile, fps, notes}. Cap per run: PLAY_LENS_MAX_SHOTS=120 (named
  const; log when hit — no silent cap).
- **Session shape per run:** a REAL rolled world (no fixtures): TIYL start → town/settlement node
  (tray) → travel → a dungeon walk with combat → at least one shop/interior place → rest. That
  route deliberately crosses the surfaces Adam named (town scene, daylight-ish exteriors,
  interiors, combat) so the ledger covers them. Multiple runs vary realm (core-3 first).
- **Determinism note:** production rolls are intentionally unseeded (real play). The manifest's
  context rows are the reproducibility record — a defect cites its shot + context, not a reroll.

### Verification (PL-1 gates)
Rig runs one full session end-to-end unattended; ≥20 shots spanning ≥4 distinct kinds; manifest
rows complete; zero harness-aborts; `check-manifest.py` OK (dev-only). The rig's own capture READ:
2 sampled frames confirmed non-black/non-blank.

## PL-2 — the audit pass (orchestrated, repeatable)

After each PL-1 run: vision-read EVERY capture (orchestrator + vision executors), grade each frame
on the ledger axes:
- **BROKEN** (renders wrong: clipping, z-fights, missing geometry, orphaned objects)
- **UGLY** (renders right, reads bad: crusty sprite, bland surface, blown bloom, bad composition)
- **MISSING** (the scene calls for something that has no visual at all: daytime sky, town street,
  weather, water…)
- **WORKING** (positively good — protect it; regressions against WORKING entries are P0)
Output: `dev/play-lens/ledger.md` — one row per finding {shot, axis, severity 1–3, surface
(sprites/materials/light/geometry/placement/UI), the wave it belongs to (Stage E / ENV / P3-2 /
UW / D5 / town / NEW)}, deduped across shots, ranked by (severity × frequency). The ranked
surface totals ARE the wave ordering; Adam red-pens the top of the ledger, not the raw frames.

## Standing law
PLAY-LENS runs again after EVERY landed visual wave — the ledger deltas (fixed / regressed / new)
are the wave's real acceptance, alongside its own gates. WORKING entries form the protection set.
