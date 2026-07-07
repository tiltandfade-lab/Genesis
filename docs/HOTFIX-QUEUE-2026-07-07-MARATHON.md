# HOTFIX-QUEUE — 2026-07-07 MARATHON (HQ3)

type: build-queue · status: **SPECCED, awaiting Adam's ledger review** · built: no

Provenance: the 2026-07-07 background playtest marathon (11 sets / 110 turns, Sella earnest ×5 +
Rennick adversarial ×6). Findings ledger: `dev/playtest-0707/FINDINGS.md`; editorial:
`dev/playtest-0707/MARATHON-REPORT.html`. Every unit below is specced Sonnet-ready (zero open
questions; decisive defaults collected in each spec's **"Adam's ledger"** header — read those four
headers to review every taste call in one pass).

Specs: [HQ3-A-ECONOMY-KIT](HQ3-A-ECONOMY-KIT.md) · [HQ3-B-COMBAT-SEAM-TRIAGE](HQ3-B-COMBAT-SEAM-TRIAGE.md)
· [HQ3-C-REST-CONCENTRATION](HQ3-C-REST-CONCENTRATION.md) · [HQ3-D-STATE-CODEX-HARNESS](HQ3-D-STATE-CODEX-HARNESS.md)

## Units

| id | unit | pri | from | verify anchor |
|---|---|---|---|---|
| A1 | bundle weights (`bundle:true`) + surfaced over-capacity refusals + kit audit (audit: no qty changes needed) | **HIGH** | SET-05-F1 | verify-items |
| A2 | digest ships top-level `pc.gold` | **HIGH** | SET-04-F1 | verify-digest-diet |
| A3 | `item_changed` affordability: atomic REFUSE on overdrawing purchases (`force:true` overrides; gold-only deductions keep the clamp) | **HIGH** | SET-04-F2 | verify-economy |
| B1 | encounter XP gated on foes actually down + `ENCOUNTER_OUTCOME_MULT` matrix + seat-prompt docs for `combat_end`/`outcome` | **HIGH** | SET-08-F1 | verify-xp-retune + verify-combat-lifecycle (upgrade: block 5 currently documents the bug as intended) |
| B3 | `resolveBranch` injects the live d20 `total`/`natural` into branch `social_check` payloads (authored literal discarded) | MED | SET-02-F2 | verify-roll-branches |
| C1 | Hit-Dice pool (`sh.hitDice`) + short-rest HD-spend heal + `resources.hitDice` in digest | MED-HIGH | SET-07-F2 | new verify-rest |
| C2 | interrupted rest burns a ROLLED partial window (long: 2–6h), not the full 480 | MED | SET-07-F1 | verify-rest |
| C4 | rest-risk outcomes promoted to `w.dm.pendingSituation` → next digest, ack-cleared in `applyResponse` (threaded through the dm.js:602 rebuild) | MED | SET-03-F1 | verify-rest |
| C5 | concentration expiry (parse `data/spells.js` durations, 10-min default; `concentrationTick` off `advanceClock`; clears on long rest) + `pc.concentration` in digest | MED | SET-06-F2 + SET-08-F3 | verify-concentration |
| D1 | durable marks: `sheet.marks[]` unified on object shape + `mark_added`/`mark_removed` events + digest + seat-prompt docs | MED-HIGH | SET-02-F1 | verify-dm-events |
| D2+D5 | codex-note coherence: `{text,day,min,supersedes?}` stamps, newest-first digest slice, 6-note budget via shared `dmNotesForDigest` + seat rule: prose relationship commits MUST fire `attitude_shift` | MED | SET-10-F1 + SET-12-F2 + SET-01-F3 | verify-codex + verify-digest-diet |
| D3 | crit fall-through persisted to `w.dm.pendingRoll` (survives process boundary; `digest` no longer clears mid-roll) | MED | SET-01-F2 / BUG-08 half | verify-roll-branches + harness |
| B2 | `combat_end` accepts free-text `reason` (alias `note`) via DM_EVENT_FIELDS — no drift line | LOW | SET-08-F2 | verify-combat-lifecycle |
| B4 | dmTriage negation-scoping guard (one regex; keyword heuristic stays cheap) | LOW | SET-01-F1 + SET-12-F1 | verify-triage |
| C3 | once-per-24h long-rest benefit gate (`restored:"no-benefit-24h"`; clock+risk still run) | LOW | SET-06-F1 | verify-rest |
| D4 | harness `advance --toClock` / `--toBand` absolute set (backward allowed) | LOW | SET-03-F2 | harness self-check |

## Build order (recommended waves)

1. **Wave 1 — the cut-the-line four:** A1, A2, A3, B1 (independent; all HIGH; player-facing).
2. **Wave 2 — seat-truth + rest economy:** D1, C1, C4, C5, B3, D2+D5, D3, C2
   (C-units share the rest handler — one executor or sequenced; D2+D5 share `dmNotesForDigest`).
3. **Wave 3 — small honest tails:** B2, B4, C3, D4.

Shared step: B1, C4, D1, D2 all touch the seat prompt — the events section is GENERATED
(`build/gen-dm-contract.py --emit` splices between markers into `docs/SEAT-PROMPT.md` + the playtest
snapshot); registry/`PROMPT_TAUGHT` edits + one regen at each wave's close, hand-edited prose bullets
go ABOVE the marker. Every unit carries acceptance criteria + a revert-goes-RED mutation check in its
spec; per the standing rubric, the orchestrator re-gates each unit — never trust a subagent's
self-reported green.

## Not queued (deliberate)

- SET-10-NOTE-A's latent transcript-injection note → keep "seat reads digest-only, never raw
  transcript" as an explicit invariant (a doctrine line, not a build).
- BUG-15 (blank `fact_canonized` XP) — already filed in PLAYTEST-BUGS.md; seat-declined in play;
  not part of this queue.
