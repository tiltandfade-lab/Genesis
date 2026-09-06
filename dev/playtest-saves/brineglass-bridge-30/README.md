# Brineglass Bridge: 30-turn zero-provider study

Run date: 2026-08-04  
World: The Brineglass Reach (`msfjud9ebcves`)  
PC: Mira Quill, level-1 Human Bard  
Mode: the real browser UI and mailbox bridge, with a human-operated DM seat and no API provider

The character/world creation flow and the bridge's automatic opening request are setup. The study begins with Mira's first declared action and contains exactly 30 subsequent turn requests. The exact request/response packets and final state are in [`raw/`](raw/).

## Verdict

The text-first loop can produce the kind of play Genesis is aiming for. The session formed a coherent beginning, escalation, climax, resolution, and optional new hook without a battlefield. Player-created motifs and physical props accumulated meaning instead of being discarded. Failed rolls changed the situation instead of stopping it. The DM honored two explicit attempts to reject an apparent plot funnel.

The engine seam is not ready for a provider bake-off yet. This run exposed one visible mailbox failure, an avoidable model-routed inventory lookup, three response-contract violations, several digest/retrieval identity errors, a misleading item-custody legacy state, and packets that are still larger and responses longer than the four-second experience wants.

## Repair continuation (2026-08-05)

The preserved turn-30 state has now been migrated into
[`resume-after-fixes/`](resume-after-fixes/) and continued for 65 more player interactions—95 total
campaign interactions—with **zero provider calls**. The complete 11-segment urban walk, noncombat
finale, public reward custody, post-finale rest consequence, and return home are now represented in
the resumable state. The longer soak found and repaired rest-effect enforcement, fixed-world solo
danger, walk aliases/totals/finale detail, pre-engagement spell context, climax quality routing,
direct world-loot placement, completed-walk residue, current-vs-global custody scope, pending-rest
quality routing, and Codex-to-map destination identity.

The campaign is intentionally **not** cleared for paid provider use. State correctness is much
stronger, but model-shaped digests now average about 5.2 KiB with an 8.8 KiB maximum, the real UI
level-up choice flow remains unexercised by this headless seat, and one more promoted-frontier tranche
should stop finding P0/P1 defects before any paid comparison. See the continuation README for the
turn ledger, pacing/agency audit, exact resumable state, and next zero-cost probes.

## Evaluation scorecard

| Criterion | Result | Evidence |
| --- | --- | --- |
| Did anything break? | **Yes** | Turn 4's response arrived after the bridge deadline and was rejected. The UI emitted `No DM answered`; turn 5 then relied on information from the rejected response. See the failure list below. |
| Did the DM drift? | **Partly** | Narrative continuity remained strong, but engine-supplied state drifted: the active interior, Tessa, full inventory, and newly minted tube were omitted or confused at different points. |
| Was the story interesting? | **Yes** | A three-note call, a candle, an altered evacuation order, a stolen shadow, and a live challenge rhythm all changed meaning through play and converged at the climax. |
| Was it tense? | **Yes, narratively; only partly mechanically** | The storm/grate rescue and public succession confrontation carried pressure. No HP, consumable, ally, or lasting position was actually lost, so the danger was less mechanically credible than the prose suggested. |
| Did action happen? | **Yes** | Investigation, a failed bluff, a brine surge, a physical rescue, descent, ritual, public confrontation, and release of the borrowed identities all happened. There was no combat or chase. |
| Did play stagnate? | **No, except for the technical failure** | Longest fictionally stagnant streak: 0 turns. Longest observed no-change streak: 1 turn, the rejected turn 4 response. Turn 28 was a state query rather than story advancement, but it successfully clarified state. |
| Did the DM railroad? | **No outright railroading observed** | Longest railroad streak: 0. At turn 16 Mira left the black tube behind and the story followed her upstairs. At turn 25 she explicitly rejected the tube as required and proposed a new random challenge; the DM accepted the better plan. |
| Was player agency meaningful? | **Yes** | The player authored the investigative methods, rescue, shelter restoration, consent-based ritual, public song, authentication protocol, and final yes/no demand. Consequences followed those choices. |
| Was the DM too accommodating? | **Sometimes** | Nearly every clever non-roll experiment produced a useful discovery, and most player proposals became the correct path. That is not railroading, but it is a softer risk: causal generosity can make opposition feel decorative. |
| Can this run measure provider speed? | **No** | The DM seat was operated manually and mailbox responses were non-streamed. The run tests packet shape, waiting behavior, and timeout handling—not model latency. |

## Momentum and agency

Twenty-eight of the 30 requests produced a consequential fictional change. One produced a state-only answer (turn 28), and one produced no applied change because the response was rejected (turn 4). There were no stretches of ominous description without advancement.

The opposite failure—forcing the player down a prepared path—also did not occur. The cleanest tests were deliberate:

- Turn 16 abandoned the apparently important black tube, returned to the evacuees, and changed the investigation to authorship. The DM followed the choice and advanced time.
- Turn 25 rejected the black tube as a necessary proof mechanism. The DM accepted a future-random rhythm generated after the First Voice arrived.
- Turn 27 gave Malquis an independent NPC decision rather than narrating Mira into a result. The NPC said yes, released the borrowed identities, and called a public succession.

There is a subtler concern. The DM rewarded almost every improvised physical or semantic test with a useful answer. The candle, handwriting comparison, countersign, document wording, and public-memory solution all worked cleanly. Future tests should include plausible ideas that reveal ambiguity, impose a cost, or simply fail without secretly becoming the intended key.

## What mechanization accomplished

- The engine recognized one exact declared mechanic: the short rest. It resolved 60 minutes, resource changes, interruption, and rest risk before narration.
- Six roll requests occurred. Three carried complete local branches (Investigation, Acrobatics, Performance), so their results were resolved without a second DM request. This saves three model calls in an equivalent provider run.
- Two checks remained live because the result substantially changed identity, access, or meaning (Deception and Arcana). One open `3d6` roll generated a future-unknown challenge rhythm.
- Casts, clock changes, item custody, attitude, codex contacts/updates, the front closure, and inventory changes survived into state.

This is close to the desired boundary: the engine owns arithmetic and application; the DM owns what the result means. The failures below show where routing and state retrieval still leak work back to the DM.

## Failures and recommended fixes

### P0: mailbox timeout caused a continuity break

Turn 4's valid response file exists, but it arrived too late to be applied. The UI displayed `No DM answered`. The following player turn referred to the three translucent pegs learned only in that rejected response, contaminating continuity.

Fix: preserve late responses as explicit stale artifacts, never silently let a study driver see and use them, and add a retry/resume affordance that either reapplies against the same acknowledged state version or regenerates from the current version. The UI should distinguish `provider timeout`, `late stale response`, and `invalid response`.

### P0: exact inventory lookup incorrectly called the DM

Turn 28, `What am I carrying right now?`, routed as `freeform-ruling`. Its digest included only two inventory entries plus `inventoryMore: 9`. The manual DM had to inspect the full state to answer a question the engine already knows.

Fix: add a local-fact route for inventory, equipment, HP, conditions, resources, clock, known relationships, and current custody. Render the complete authoritative answer locally and make no model call.

### P0: retrieval confused newly minted and older items

Turn 30 minted `The First Answer Tube`, but the relevant codex slice supplied `The Shadowless Message Tube` instead. Worse, the older tube's generated fields described a brass fish watch-fob, while the new tube's stored fields describe a glass eye. The narration avoided those fields, but a provider could easily have incorporated the contradiction.

Fix: pin exact IDs from the current action, current inventory, custody events, and the immediately preceding mint before semantic retrieval. Do not apply a generic plot-item roll to a specifically named object unless the generated object's type/name agrees. A newly minted entity must outrank fuzzy same-kind matches for at least the next beat.

### P1: three branched checks violated the response contract

The Investigation, Acrobatics, and Performance responses set `ruling.outcomeBranches` to an array (`["success","nearMiss","fail"]`). The validator requires an object or null. The actual executable branches lived correctly in `rollRequest.branches`, so play continued, but telemetry recorded `ok: false` for all three.

Fix: make the DM-seat template emit either the full branch object or null in `ruling.outcomeBranches`; ideally derive it from `rollRequest.branches` rather than asking the DM to duplicate it. Treat contract-invalid responses as a visible recoverable error instead of applying them with only a console warning.

### P1: digest continuity was semantically incomplete

- The newly discovered interior was initially minted as generic `an interior`; the DM had to rename/bind it to the Sealed Dispatch Landing.
- A later document-reading beat surfaced an unrelated remote location while the active interior was weakly represented.
- Tessa disappeared from relevant social digests despite being named and physically present.
- Item transfer back to the PC requires the PC ID, but the compact digest does not consistently expose that ID.

Fix: add a small pinned continuity band containing active location stack, actors addressed/present in the last two beats, exact IDs for mentioned held/custodied items, and the PC ID. Keep fuzzy retrieval separate and lower priority.

### P1: voluntary handoff became a loss/recovery hook

Mira deliberately entrusted the altered order to Tessa. Custody is correct, but legacy state labels it `claimed-npc` and creates a hidden `where it lies now` recovery thread. That semantics is appropriate for confiscation or loss, not consensual stewardship.

Fix: add transfer intent such as `gift`, `entrust`, `loan`, `confiscated`, `stolen`, and `lost`. Only involuntary or uncertain separation should create a recovery hook.

### P1: packets remain above the intended digest diet

Applied-turn digest bytes: median 3,498; p90 3,713; max 4,319. Full turn packets: median 4,777; p90 5,240; max 7,383. The 7,383-byte outlier is the short-rest receipt, which repeats the full inventory before and after even though it did not change.

Fix: encode mechanical receipts as deltas plus hashes/IDs. Include changed fields, important unchanged invariants, and a receipt reference—not two full PC snapshots.

### P1: the fast lane is still too verbose

Twenty-nine of 30 requests used the fast lane, yet narration was a median 101 words, p90 120, and max 146. At a four-second target, that much text delays generation and asks the player to read a paragraph before acting.

Fix: give the fast lane a 45–70 word narration budget with one concrete change and one actionable opening. Reserve 80–120 words for deep/climax beats. Do not reduce state events or ruling data to achieve the prose cut.

### P2: reward vocabulary can encourage fact spam

The PC ended at 218 XP: 18 one-XP canon discoveries plus 200 XP for closing the active front. The front reward may be correct, but using `fact_canonized` for nearly every useful beat makes minor continuity updates reward-bearing.

Fix: separate `scene_fact`/`continuity_note` from reward-bearing `discovery`. Let the engine, not the DM prose author, decide which facts earn XP.

## Performance and cost observations

Actual provider cost was **$0.00** because no provider was called. Telemetry's legacy Sonnet estimator priced the 29 applied response packets at **$0.30645** total (35,240 estimated input tokens and 13,385 output tokens). That is a hypothetical compatibility estimate, not a charge or current-provider quote; it excludes the rejected response.

Manual mailbox timing was median 33.1 seconds, p90 51.2 seconds, max 60.9 seconds, with 0/29 applied responses under eight seconds. This says nothing useful about API model speed. It does demonstrate that the current non-streamed mailbox path gives no meaningful feedback before the complete response and that a late answer can cross the rejection boundary.

Before paying for a provider bake-off, the most valuable speed/cost work is therefore:

1. Route exact state questions locally.
2. Shrink the rest receipt and pin compact continuity IDs.
3. Enforce a shorter fast-lane prose budget.
4. Remove duplicate branch metadata and reject malformed payloads cleanly.
5. Then run a small provider sample measuring first visible feedback, final unlock, contract pass rate, and narrative quality separately.

## Turn-by-turn agency ledger

`Player` means the player's declared method determined the next beat. `Consequence` means the DM/engine resolved a prior risk. `Negotiated` means the player established the question but an NPC retained an independent choice. None of the turns was scored as railroaded.

| # | Beat | Driver | Consequence / audit note |
| ---: | --- | --- | --- |
| 1 | Three-note call in the storm | Player | Finds the courier and child by watching reactions. |
| 2 | Right-hand greeting and shelter question | Player | Respects the taboo; exposes the altered evacuation priority. |
| 3 | Minor Illusion breathing comparison | Player + local roll | Failed Investigation silences the real breathing but proves it reacts. |
| 4 | Candle airflow test | Player | Valid answer arrived late and was rejected; no applied change. |
| 5 | Candle marker, redirect evacuees, remove peg | Player | Opens the seam and changes William's behavior. Continuity is contaminated by turn 4. |
| 6 | Ask the child; listen at the gap | Player | Names Katherine and establishes that the passage answers Mira's motif. |
| 7 | Impersonate a Crier official | Player + live roll | The hidden listener demands a countersign. |
| 8 | Failed Deception result | Consequence | Bluff is exposed; brine surges and the faction clock advances. |
| 9 | Rescue Katherine and jam the grate | Player + local roll | Acrobatics succeeds; the crisis changes physical state. |
| 10 | Lower a relit candle on the lute strap | Player | Reveals a dry landing and messages fused into glass. |
| 11 | Descend with a three-knock safety signal | Player | Establishes the Sealed Dispatch Landing and sorting mechanism. |
| 12 | Turn/read the offered order safely | Player | Reveals original and mirrored correction plus shadowless mark. |
| 13 | Speak `warmth` and present the order | Player | Opens the archive and turns the order into tracked inventory. |
| 14 | Compare tubes with the original motif | Player | A black tube copies Mira's voice. |
| 15 | Use the original order's meaning | Player | Restores shelter and opens the broad stair. |
| 16 | Abandon the black tube and help evacuees | Player | Explicit anti-funnel choice is honored; Tessa is found. |
| 17 | Exact short rest | Engine + player | Engine advances 60 minutes and resolves rest risk before narration. |
| 18 | Blind handwriting comparison | Player | Proves the correction was mirrored from the reverse. |
| 19 | Consent-based shadow restitution | Player + live roll | Tessa consents; Arcana determines the cost. |
| 20 | Arcana near miss | Consequence | Restores Tessa's shadow but binds Mira's motif into the order. |
| 21 | Entrust order to Tessa; meet officials | Player | Custody persists; Naivara arrives. Legacy semantics misclassify the entrustment. |
| 22 | Sing the original order publicly | Player + local roll | Performance succeeds; crowd learns the order and Naivara warms. |
| 23 | Ask who benefits and why Naivara is dry | Player / NPC reveal | Naivara confesses the First Voice/archive succession crisis. |
| 24 | Propose a live broadcast proof | Player | Plan accepted; a rival messenger adds responsive pressure. |
| 25 | Reject the black tube; propose future randomness | Player | Explicit anti-rail test succeeds; superior alternative is accepted. |
| 26 | Roll the unseen `1-3-2` challenge | Consequence | Malquis reproduces it; the archive exposes itself with a false beat. |
| 27 | Ask Malquis a public yes/no question | Negotiated | Malquis independently releases identities and calls a succession; front closes. |
| 28 | Ask for current inventory | State query | Correct answer, but should have been local and digest was incomplete. |
| 29 | Name the song; assign order and message duties | Player | Katherine, Tessa, and William carry distinct consequences forward. |
| 30 | Accept and test the First Answer Tube | Player | Optional glass-bee hook answers; item retrieval collision appears in the digest. |

## Reproduction notes

- `raw/turn-*.json`: the 30 exact turn requests, excluding setup/opening.
- `raw/response-*.json`: the corresponding 30 DM-seat responses, including the late rejected turn 4 response.
- `raw/final-state.json`: the browser state after turn 30.
- Applied telemetry count is 29 because the late response was not applied.
- Character creation, world rolls, and the automatic opening request are intentionally outside the 30-turn count.

The previously remembered “Genesis ninja turtle session” was not found as a preserved transcript or state artifact in this worktree. The repository contains many TMNT-inspired Chrome realm references, but none is sufficient for a turn-count or pacing comparison. If that session exists only in an older worktree, browser save, or uncommitted state snapshot, it still needs to be recovered before it can serve as a quantitative baseline.
