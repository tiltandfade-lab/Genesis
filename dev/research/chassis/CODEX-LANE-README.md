# Codex chassis probe — lane packet (R4)

Authority: `docs/research/CODEX-CHASSIS-THROUGHPUT-PROBE.md` (founder-authorized GO,
2026-07-31). This folder is the complete working packet.

## Your inputs

1. `dev/research/chassis-schema.md` — the ChassisV0 contract. Read it whole. Reuse its
   socket vocabulary (`butt-join-n/e/s/w`, `walk-surface`, `top-surface`, `open`);
   invent no parallel terms.
2. `dev/research/chassis/exemplar-watchhouse.json` — one complete worked example (the
   current guard watchhouse, three envelopes as one parameterized chassis). Match its
   structure, `_source`-style provenance comments, and its honesty: unknowns are
   declared, not painted over.
3. `dev/research/verify-chassis-gate.mjs` — the gate. Run it yourself before submitting:
   `node dev/research/verify-chassis-gate.mjs <your-chassis.json>` (exit 0 = green).
   `--suite` shows you every failure mode with its negative fixture.

## The ask

TEN new chassis under `dev/research/chassis/candidates/`, across three families:
- compact watch structures (3-4)
- road-service structures (3-4)
- retained/embedded structures (2-3)

Each: 3+ meaningful parameters with honest min/max envelopes; program obligations
declared as data; every parameter combination legal (the sweep gate re-runs all checks
at min/mid/max per parameter — parameter honesty IS the probe's core metric).

## Rules

- First-submission state is measured: run the gate, but do NOT iterate a chassis more
  than once after a red — the probe measures authoring throughput, not persistence.
  Leave a failing chassis in place with a `_status: "red-first-submission"` field and
  move on; repair distance is a metric, not an embarrassment.
- New files only. No edits to the schema, exemplar, or harness — if the contract seems
  wrong, note it in your chassis's `_notes` and proceed; contract disputes are findings.
- No renders, no assets, no src/ edits. Data only.
