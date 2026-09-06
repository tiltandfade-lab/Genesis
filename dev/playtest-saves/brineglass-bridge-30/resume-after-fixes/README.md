# Brineglass repair continuation

Run date: 2026-08-05  
Source: `../raw/final-state.json` (copied and migrated; the original 30-turn evidence is untouched)  
Current extent: **65 additional player interactions, for 95 total campaign turns**  
Provider calls / actual API cost: **0 / $0**

`state.json` is the resumable canonical snapshot. It contains the complete player/DM transcript,
applied-event results, ledger, Codex, custody, telemetry, and current world state. Exact later
TurnRequests, TurnResponses, pre-response snapshots, and roll receipts live under `packets/`.
Seven locally resolved branch rolls do not create separate player transcript lines, so the transcript
has 88 player lines while the campaign counter correctly records 95 player interactions.

## What the continuation tested

| Campaign turn | Probe | Result |
| ---: | --- | --- |
| 31 | Ask Tessa to distinguish a living reply from an archive echo | Exact Tessa + newly carried tube retrieval worked after the first identity repair. |
| 32 | Deliberately false-premise button test | The tube invented a plausible answer; a new thread persisted. This exposed false `sealed` location retrieval. |
| 33 | Consent-based one-hour loan to William | Stable item identity moved to voluntary `loan` custody with no fake recovery quest. |
| 34–35 | Repeat exact holder query | First call reproduced the wasted model route; the repaired repeat was a zero-model local fact. |
| 36 | End the loan early | Custody-to-PC pickup preserved the exact instance id and cleared the neutral transfer cleanly. |
| 37–39 | Ask about the road without promising travel, then use only pronouns/descriptions | No travel was forced. Exact records survived one anaphoric beat; unrelated places stayed omitted after repair. |
| 40 | Explicitly reject both road leads and pivot to Katherine | Pivot was honored. Katherine chose a mixed public/secret policy rather than obeying a binary player command. |
| 41 | Ask Naivara for her buried secret | A real Persuasion 8 failed locally; the refusal persisted without hostility, retry pressure, or a second model turn. |
| 42–43 | Accept failure; author and rehearse the public warning | Consequence advanced through two explicitly addressed actors. The repaired packet retained both at 3,066 bytes. |
| 44–45 | Repeat combined HP/conditions query | First call exposed another wasted model route; repaired repeat returned locally with a zero-byte digest. |
| 46 | Exact short rest in the accumulated save | Mechanics resolved first. It also exposed an unenforced typed rest-row promise. |
| 47–49 | Enter the urban walk, inspect a plaque, and prepare a hidden bedroll | The 8–12 segment walk resumed as story space and presented concrete generated affordances. |
| 50–52 | Stealth, an illusory sled, and a failed Sleight of Hand attempt | Failed ideas changed the situation instead of stalling it; the second failure opened combat. |
| 53 | Dodge and speak while two guards attack | The first application exposed a lethal combat-state bug. The preserved pre-response snapshot was repaired and replayed: Dodge applied to both ordinary foe actions and both missed. |
| 54 | Escape rather than win the fight | `pc-fled` ended combat without victory XP, preserving the player's chosen loss/escape. |
| 55–56 | Advance to the Office of Amber Weights, then ask an exact continuity question | Walk truth advanced; the recall question resolved locally without mutation. |
| 57–59 | Enter a hub, notice a pickpocket, fail Insight, then check the pouch while questioning the clerk | The composite turn exposed and then verified bounded inventory truth alongside an open social ruling. The planted tag persisted. |
| 60–62 | Reject Room Seven, build a public wrong-note trap, then ask where the tag is | The alternative plan worked; Performance 16 drew an answer, and the exact custody query was repaired to a zero-model local fact. |
| 63–64 | Reject Room Seven again, follow someone else, then roll a natural 20 | Immediate next-segment detail was repaired into the digest. The amplified-major critical follow-up routed deep; Captain Ilyra Venn defected and broke the void mechanism without forced combat. |
| 65 | Refuse a private-protection bargain but offer public copies | The player set the terms. Venn produced tracked evidence, made three copies, and the public-choice consequence persisted. |
| 66–75 | Rest, refuse the direct crowd route, publish the orders, fail a notice-cage attempt, choose the belfry, attempt a smoke rescue, and query custody | Typed rest effects and fixed-world solo danger were exercised. Failed approaches changed state without scaling the world down; an alternate route and explicit retreat remained viable. |
| 76–82 | Recruit a public witness, backtrack through resolved segments, inspect a mob square, fail a decoy, crawl the runoff, and roll a natural 20 | Backtracking, branch exits, plural custody, `toSegment`/`n` aliases, and non-railroaded recovery from failure were repaired. The critical success resolved the mob surge without forcing combat or movement. |
| 83–88 | Test drowned guards with a candle, bypass them with illusion, probe false flooring, rescue civilians remotely, and enter the finale unarmed | Pre-engagement spell packets regained active-walk truth. Generated objects, exits, resolutions, and the actual 11-segment total remained coherent through the finale transition. |
| 89–91 | Publicly challenge the false noble, win Persuasion 19, reject his reward, and inventory the strongbox into public custody | Unresolved finales now deep-route. The boss was exposed without combat; newly revealed loot can originate at a scene holder, so the magic trident, coin parcel, and gem never teleported through Mira's inventory. |
| 92–93 | Repeat “Show current item custody” before and after repair | The first zero-cost answer leaked two remote entrusted items. The repaired repeat listed only the seven objects physically left at the completed site and retained exact global retrieval for named items. |
| 94–95 | Spend one Hit Die on a short rest, receive a tracking mark, refuse to follow it, preserve a rubbing, and return to Tessa | Mechanics resolved first (6→10 HP, one hour, one Hit Die). Typed pending situations now deep-route; the tracker became a durable thread, refusal caused no forced encounter, and retrieved locations now carry the verified `mapNodeId` required for real movement. |

## Pacing, tension, and agency

- Across all 65 continuation interactions, the longest no-consequence stretch was **2 turns**, and
  every such pair was a deliberate repeated state-query probe. Fictional play itself never exceeded
  one non-consequential beat in a row.
- Longest railroad streak: **0**. The player escaped a fight rather than defeating it, rejected
  Room Seven twice, set a public wrong-note trap, abandoned that lead, followed a different person,
  and refused Venn's private bargain. The engine and authored DM responses honored every pivot.
- Action was not scarce: stealth, sabotage, failed plans, combat, Dodge, escape, exploration,
  pickpocketing, a performance trap, pursuit, two rescues, illusion, a critical outcome, defection,
  public confrontation, and an exposed disguised boss all changed the situation.
- Tension had mechanical stakes. The pre-fix guard round could kill the solo character; after the
  fix, the same preserved turn resolved under the declared Dodge state rather than by authorial mercy.
- The story remained causal rather than a chain of ominous rooms: the Office, hive tune, Room Seven,
  public trap, void mechanism, Venn's defection, and copied orders each followed from prior choices.

## Defects found and repaired

1. Tightened named-Codex and named-item selection so ordinary words (`glass`, `sealed`, `answer`,
   `use`, `hand`) cannot pin unrelated records or inventory.
2. Split current-action identity from short-lived continuity identity; stale subjects age out and
   do not follow a player pivot.
3. Preserved multiple explicitly addressed actors while fitting ordinary packets, and stopped old
   unrelated transferred items from bloating current-item turns.
4. Added exact local health and custody answers, including `Where is <item> now?`; consequential
   clauses still route to open adjudication.
5. Added safe pending-turn refresh, automatic pre-response snapshots, response-array normalization,
   and assertion-guarded replay/recovery without duplicate transcript or telemetry rows.
6. Unified canonical/transient combat state, refreshed per-round action budgets, applied PC
   conditions to ordinary foe actions, fixed next-turn Dodge expiry, accepted full critical atoms,
   clamped combatants to the actual room grid, and distinguished `pc-fled` from victory.
7. Preserved already-fitted canonical ledger facts, bounded composite social+inventory turns, and
   retained exact holder/custody semantics.
8. Exposed actionable detail for the current walk segment and its immediate graph exits while
   leaving farther segments veiled. The top-level location now follows the live cursor instead of
   contradicting it with the frontier's broad typed-place description.
9. Routed unresolved critical magnitude follow-ups to the deep lane automatically.
10. Folded `encounter_resolved` into a persistent per-segment overlay and exposed that resolution in
    later digests, preventing a bypassed threat from respawning in narration.
11. Added word-budget telemetry and preserved exact request/response/roll/recovery evidence as the
    soak proceeds.
12. Typed all twenty shared-semantics rest-table results. Exact recovery fractions, one-use
    disadvantage, next-segment duration, bonus resources, and interruption are engine-owned; vague
    Penalty/Insight/Boon meaning remains visible for DM interpretation.
13. Locked fixed-world danger against PC-level rubber-banding while requiring telegraphs and a
    flee-first escape on deadly solo scenes.
14. Folded `toSegment→toSeg` and `clock_advanced.n→delta`, corrected public walk totals to the actual
    graph (including an appended finale), and exposed authored finale/reward detail.
15. Kept active-walk truth in combat-shaped spell packets until combat actually starts; unresolved
    finales and typed pending situations now raise the deep quality floor without gaining execution
    authority.
16. Added `item_placed`, which originates congruent magic/mundane scene loot directly in durable
    custody, rejects duplicate Codex identities, and never pretends the active PC picked it up.
17. Made completed-walk object residue discoverable at its node, scoped generic current-custody
    answers locally, and preserved global lookup only for an exact item query.
18. Added verified `mapNodeId` to an explicitly retrieved location record so a DM can emit
    `move_node` without guessing across the Codex/map namespace boundary.

The segment-preview omission was first observed at turn 57, so that response was manually grounded
from the canonical walk record. The engine repair was in place and verified before the turn-63
transition. The lethal turn-53 application and the first turn-64 application are preserved as
superseded evidence; canonical state was restored from automatic snapshots and replayed with the
same player action and adjudication after their engine fixes.

## Cost measurement

- Actual external calls: **0**. Actual API bill: **$0**.
- Continuation telemetry contains 58 routed rows: 46 fast, 6 deep, and 6 zero-model local; seven
  local branch rolls are recorded outside that turn-telemetry table. Routes were 50 open rulings,
  2 declared mechanics, and 6 local facts.
- The harness's placeholder estimator assigns the full continuation a hypothetical **$0.55958**
  (84,607 input and 20,385 output tokens).
  These numbers are useful only for relative packet/routing comparisons; they are not a provider
  quote or a charge.
- The 52 model-shaped digests averaged 5,185 bytes, with an 8,542-byte p95 and 8,759-byte maximum.
  Nine narration responses missed their configured word ceiling, so correctness is now ahead of the
  preferred latency envelope. Manual bridge timings are not provider latency evidence.

## Open gates before provider spend

1. **Transition/walk packet compaction:** the immediate scene is truth-complete, but the heaviest
   packets exceed the ordinary 3 KiB target. Compact authored walk/finale detail without hiding
   actionable exits, critical lenses, custody, or established continuity.
2. **Level-up choice flow in the real UI:** the engine correctly raised Mira to level 3, but this
   headless seat cannot exercise the persistent two-spell choice banner. Verify that browser flow
   before using this save for another long adventure.
3. **One more targeted zero-provider tranche:** start the promoted dungeon frontier, exercise a
   typed next-check/next-segment rest rider in live play, revisit completed-site custody after leaving
   and returning, and reload during a new combat. Paid comparison remains gated until that tranche
   finds no new P0/P1 state defect.

## Resume command

```bash
node dev/playtest-bridgeless.mjs playerview --dir dev/playtest-saves/brineglass-bridge-30/resume-after-fixes
```

Then stage the next action with `digest`, author a zero-provider response, and apply it. New packets
will be archived automatically. Do not run a paid provider against this live campaign copy.
