# Zero-provider replay corpus

Status: **preflight passed**, 2026-08-04. This corpus spends **$0** and makes no provider call.

## Purpose

The provider study should pay for acting, interpretation, rulings, and meaning—not rediscover basic
state bugs. The replay corpus therefore runs the real production turn preparation seam
(`dmResolveTurnRoute` → mechanical receipt → `dmPrepareTurn` → beat digest) and the real
`applyResponse`/`applyEvent` seam across fresh processes and persistent state.

It is not a substitute for model evaluation. It is the mechanical filter before model evaluation.
The recorded narration carries a small dramatic-evidence baseline so state correctness and dramatic
contribution remain two different axes. A later provider run replaces the response author, not the
scenario or engine checks.

## Corpus shape

Seven four-turn arcs, 28 turns total:

| Arc | Cross-turn pressure |
|---|---|
| `custody` | place a stable item, leave its segment, inspect scope, try to pick it back up |
| `rest` | mechanics-first receipt, duplicate narrator event, combat refusal, local post-rest fact |
| `combat` | open combat, take concentration-threatening damage, refuse rest, reload mid-fight |
| `knowledge` | exact off-scene name, ambiguous title, interpreted correction, later retrieval |
| `walks` | advance walk A, suspend it for B, resume A at its cursor, complete A |
| `failures` | failed purchase, over-capacity pickup, missing social target, valid recovery event |
| `identity` | matching response, duplicate response, wrong-world response, independent world continues |

The existing 12 state-eval goldens and four negative controls remain separate single-turn sentinels;
they are preflight, not part of the 28-turn count.

## Result meanings

- `green`: behavior that must pass now. A failure blocks provider spending.
- `known-gap`: a temporary survey classification only. The fixed corpus carries zero accepted
  known-gap sentinels; every former limitation is now a required green assertion.
- `dramatic`: recorded narration contains the scenario's required continuity/meaning anchors. It is
  deliberately scored separately from state mutation.
- `aiRole:none`: a local fact turn; no dramatic score and no model call are expected.

## Resolved survey gaps

All six surveyed gaps are fixed and their corpus checks are green:

1. walk placements stamp `walkId` + segment and disappear outside that exact segment;
2. `item_transfer` can source a custody record and return its stable instance to a PC;
3. active combat is owned by `w.combat` and rehydrated into `GS.combat` after reload/return;
4. exact multi-word Codex identities are retrieved canonically and pinned through byte fitting;
5. applied `turnId`s are remembered, so duplicate responses cannot replay events;
6. responses resolve against their pending-turn owner, queue while that world is inactive, and apply
   when it becomes active.

Current recorded result: **38/38 green checks**, **26/26 dramatic anchors**, two local/no-model
turns, zero known-gap sentinels, and two consecutive clean full-corpus runs.

## Commands

```sh
node dev/replay-corpus/run.mjs
node dev/replay-corpus/run.mjs --only custody
node dev/replay-corpus/run.mjs --json
node dev/verify-replay-corpus.mjs
```

The test boots the full app in a new jsdom process for every command. Its wall-clock duration is test
harness startup cost, not the in-game turn latency measurement. Turn latency/cost belongs to the later
bridged provider pass.

## Provider-spend gate

The no-cost gate is now satisfied:

1. all 38 green state checks pass on two consecutive corpus runs;
2. the state-eval verifier passes 12/12 goldens, four negative controls, and 7/7 regression checks;
3. the manifest checker returns `RESULT: OK`;
4. all six known gaps are fixed, with no accepted sentinel left;
5. dramatic contribution stays separate from state hygiene, and latency telemetry separates route,
   mechanics, digest, first meaningful feedback, and completion.

The next step may be the small capped blind provider bake-off. It should reuse these exact scenarios,
pin model/settings, use no live campaign state, and keep a hard token/cost cap.
