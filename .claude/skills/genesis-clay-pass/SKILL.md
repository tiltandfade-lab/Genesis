---
name: genesis-clay-pass
description: >-
  Land one Clay Pass (C1A, C1B, … C5x) of the Genesis procedural-dungeon build under the
  arrival law: spec it Sonnet-ready with its gate-matrix BLOCK/WARN gates, background-execute,
  personally re-gate the back end with measurable proof, then hand Adam a capture packet so HE
  rules the front end — Claude never declares a visual "on." Use whenever a clay pass, ladder
  step, capture packet, gate matrix, or slice unit is being built or verified. Composes with
  genesis-orchestrate (the generic pipeline); this skill adds the clay-specific gates and the
  front-end/back-end gate split. ONLY for the Genesis repo (~/Desktop/Work/projects/Genesis).
---

# Genesis Clay Pass — spec → execute → re-gate back end → Adam gates the front end

Adam's 2026-07-23 gate-session ruling, the reason this skill exists: **historically the
back-end/bridge measurements have been trustworthy, but visual "it looks right" claims were
repeatedly wrong. So the gates are split: Claude owns the back-end gate with machine-measurable
proof; Adam owns the front-end gate.** Claude's only visual claims are countable facts;
ON/OFF is Adam's ruling, always.

## Read first (in order)

1. The pass's definition in `docs/procedural-dungeon-direction/CLAY-PROOF-LADDER.md`.
2. Its gate matrix row(s) — `docs/procedural-dungeon-direction/wave-12/SLICE-1-GATE-MATRIX.md`
   (or the current slice's matrix): every gate typed BLOCK (truth/recovery/legality/leak) or
   WARN (polish/beauty/perf-target). Truth is never warned away; ugliness never blocks truth.
3. The arrival law — `docs/FEATURE-PRIORITIZATION.md` §0 (fresh deterministic green · personal
   re-gate · human eyes on actual output · ledger flip with evidence).
4. The owning wave record for any contract the pass lands (the §.6 sweep riders are law).

## The assumption law (before any implementation)

Unclear calls surface to Adam BEFORE code: batch them ≤10, plain English, ids in parentheses,
**Claude's default stated per item** so each is answerable in a word. Assumptions are made
*with* Adam, never silently. Record his answers verbatim in the owning record.

## The loop (one pass = one unit = one branch-merge)

1. **Spec** — Sonnet-ready per the 6-point rubric; the pass's BLOCK gates become acceptance
   checks wired to PRODUCTION entry points (WIRING LAW — a check that drives a test-only
   harness proves nothing). Fixtures are seeded, deterministic, and retained forever.
2. **Execute** — background executor per genesis-orchestrate (effort per task; never in the
   repo root; check-manifest after any module edit).
3. **Re-gate the back end personally** — never trust the executor's green. Fresh runs of:
   the pass fixtures (new seeds archived) · replay determinism (same seed → byte-identical
   receipts) · consumer-identity asserts (no view computes its own answer) · crash/interrupt
   fixtures where the pass owns them · leak checks (world-tier + zero-telemetry) ·
   `check-manifest.py` · the jsdom CI sweep. Output: a one-page **pass receipt** listing every
   check that ran with links to evidence. This is the proof Adam signs off on for the back end.
4. **Capture packet** (any pass with a visual surface) — capture FILES on disk (committed to
   the retained corpus, never only inline in chat), plus a **plain-English cover**: for every
   image, one short paragraph of "what this proves" in human words BEFORE any countable
   claims — no registry-speak, no untranslated ids (Adam's 2026-07-23 packet-#1 ruling: "none
   of this stuff makes any sense in plain english"). Then the countable checklist: only
   assertions Adam can verify against pixels ("count 6 cells between goblin and door", "HP
   reads 4/11"). If several shots share one scene, say plainly what VARIES between them. No
   aesthetic claims. Adam rules ON/OFF; his redlines become fixtures (the W11 teaching loop).
5. **Mint goldens** — captures Adam approved become regression goldens; from then on, drift
   from a golden is machine-detected (pixel/scene-graph diff), so his re-review is only needed
   when the picture is *supposed* to change.
6. **Bookkeep arrival** — ledger row flips (MAPPED → PROVED) with evidence links; fixture into
   the retained corpus; CHANGELOG line. No flip without all four arrival-law legs.
7. **Merge** `--no-ff`, delete the branch; regenerate generated artifacts at the master merge,
   never hand-merge them.

## Never

- Declare a visual "on" — that is Adam's call, on the packet, every time.
- Skip the personal re-gate or accept an executor's self-reported green.
- Satisfy a gate mechanically (validators preserve the thing's job).
- Overwrite an earlier pass's fixture/expected trace (the faster gate must survive).
- Start the next pass while the current pass's BLOCK gates are red.
