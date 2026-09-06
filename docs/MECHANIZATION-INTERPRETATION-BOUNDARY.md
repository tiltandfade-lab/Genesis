---
type: research-record
status: PHASE 2F IN PROGRESS — 95-turn repair soak completed one full walk; provider spend gated
created: 2026-08-04
updated: 2026-08-05
related:
  - "[[TEXT-FIRST-WALK-RESTORATION]]"
  - "[[DM-BRIDGE]]"
  - "[[DM-SEAT]]"
  - "[[DIGEST-DIET]]"
  - "[[EVENT-CONTRACT]]"
  - "[[STATE-HYGIENE-EVAL]]"
---

# Mechanization / Interpretation Boundary

## 0. The ruling

Genesis should spend model attention on **acting, interpretation, consequence, revelation, and
meaning-making**. It should not spend model attention reading the character sheet back to the
player, doing arithmetic, moving inventory counters, advancing clocks, or deciding facts the engine
already knows.

The desired turn order is:

> **understand intent → resolve what the script can resolve → give the model a compact dramatic
> packet → narrate from the settled result → persist only through engine-owned mutators**

The current general path is closer to `model narrates → model declares events → engine applies`.
That remains useful for ambiguous actions, but it is the wrong default for routine mechanics. The
fast/deep lane decides *which model* receives a turn; it does not yet decide whether a model is
needed at all.

No visual renderer is part of this contract. Story mode, walks, realms, sprites, nodes, and future
projections all consume the same canonical state after the turn resolves.

## 1. Phase-1 method — real bridge, no API

On 2026-08-04 a fresh world and L1 Fighter were created through the real `genesis.html` UI, served
by `dev/dm-bridge.py` on an isolated dev port. The app produced its real `dmDigest()`, posted real
TurnRequests to `/turn`, long-polled `/response`, applied real events through `applyEvent()`, posted
the resulting state snapshot, and wrote real mailbox telemetry.

The seat was intentionally **unconfigured** (`SEAT_BASE_URL` and `SEAT_API_KEY` absent). A human
study driver authored six controlled TurnResponses through the mailbox. Therefore:

- provider calls: **0**;
- metered API cost: **$0**;
- the logged `cost.estimated` rows are legacy hypothetical estimates, not charges;
- logged latency includes the study driver's inspection/composition time and says nothing about
  provider or bridge speed.

The ephemeral `.dm/` mailbox is evidence for this pass but is not a repository artifact. The
durable result is the boundary ruling and the reproducible probe set below.

## 2. The six probes

| Turn | Route today | Digest | Engine event | What the probe established |
|---|---:|---:|---|---|
| Opening scene at High-Harrow Gate | deep / new-place | 8,672 B | none | Correct AI territory: compose rolled setting, opening tension, ambient people, and a clean hook into one scene. |
| “I look around and listen” | fast / routine:look | 8,238 B | none | AI adds value by selecting sensory clues and deciding what ordinary attention reveals, but the packet was much broader than the beat. |
| “I check exactly what I carry” | fast / default-fast | 8,238 B | none | Should be local and immediate. The model acted as an inventory formatter and spent a whole turn repairing a fiction/state contradiction. |
| Lay one of eight javelins on the coffin | fast / default-fast | 8,238 B | `item_changed` | Best hybrid shape: engine persisted 8→7; AI supplied the mourners' reaction and made the offering mean “witness.” |
| Ask the mourner about the coffin | fast / routine:ask | 8,265 B | none + `gen[npc]` | Strong AI territory: perform the NPC, reinterpret “your funeral,” create a mystery, and ask the engine to mint the newly consequential speaker. |
| Take a short rest | fast / routine:rest | 8,908 B | `rest` | The ordering is wrong for resolved narration: the engine rolled “Street Shift” only after the DM prose had been written, so the prose could honestly narrate only the start of the rest. |

Across the sample, **50,559 digest bytes** crossed the bridge; median digest size was **8,265 B**.
Five turns routed fast and one deep. Two turns mutated state. The sample is intentionally too small
for frequency claims; it is enough to expose contract shape.

## 3. Findings

### 3.1 Narration must not be allowed to move canonical objects

The opening prose placed Charles's greatsword in a mourner's hands even though the digest said it
was equipped in Charles's main hand. The inventory probe had to repair the fiction by reclassifying
the mourner's prop as a grave-sword made to resemble it.

This is not mainly a prose-quality problem. It is an authority problem:

- narration can describe an object's appearance, significance, history, and perceived behavior;
- only an accepted mechanical receipt can change possession, quantity, location, condition, or
  equipment state;
- a response that makes a concrete object-state claim without the matching receipt should be
  rejected, softened, or flagged before it becomes player-facing canon.

The rule extends to NPC position, wounds, doors, clocks, money, spell slots, conditions, and walk
cursors. The engine owns the noun's state. The model owns what that state means.

### 3.2 Local factual queries are zero-model turns

Inventory, equipped gear, known spells, current conditions, clock, map facts, visible combat stats,
and already-known Codex facts should render directly from state. If the player merely asks to see
them, the result belongs in the UI or a local system line. A model may add color only when the
situation itself makes the act consequential: searching a pack while pursued, concealing an item
from a guard, or recognizing why an object matters.

The current routine vocabulary also missed “carrying” and “equipped,” but expanding a keyword list
would only change fast-model routing. It would not remove the unnecessary call. The new router needs
a `local` outcome, not just more fast-lane synonyms.

### 3.3 Routine mechanics should resolve before narration

Rest is the clearest example. `applyEvent(rest)` owns interruption, risk, recovery, clock movement,
lodging, wages, charges, exhaustion, and other riders. Because those values are rolled only after
the TurnResponse arrives, a one-call DM must either guess, write evasive setup prose, or contradict
the engine.

The same sequencing risk exists anywhere an event performs hidden/random resolution. The preferred
shape is:

1. recognize the declared routine action;
2. resolve it locally and produce an immutable mechanical receipt;
3. decide whether the receipt deserves narration;
4. if yes, send only the relevant scene context plus the receipt to the model;
5. render the returned prose without allowing it to revise the receipt.

The rest probe's receipt was: short rest, 60 minutes, nothing to restore, not interrupted, plus the
rolled “Street Shift” consequence. That complete receipt—not a bare `{type:"rest"}` request—is what
the narrator should have received.

### 3.4 Hybrid turns now have a first-class object transfer operation

The javelin turn exposed the gap: `item_split` minted a new id without a destination, while
`item_changed` could remove a whole stack but could not conserve identity through placement. Phase
2B closes it with `item_transfer {itemId, qty?, to, note?}`. The source is the active PC's inventory
or an existing custody record;
the destination is an explicit stable holder of kind `pc`, `npc`, `creature`, `faction`, `container`,
`corpse`, `place`, or `object`.

A whole transfer keeps the instance id. A partial transfer keeps the old id on the remainder and
returns a new moved id plus exact remaining quantity. All instance state follows the moved object;
storied stacks cannot split one Codex identity into two. PC inventories and `corpse.items` retain
their existing ownership; other holders live in the additive `w.itemCustody` registry. A placement
made during a walk is visible only on that exact `walkId` + segment; legacy node-only custody retains
node scope. Custody can transfer back to a PC without reminting the item. Only current-scene custody
(cap 8) rides the digest. Clean failures are byte-identical, including on old saves with no custody
store. The narrator receives the settled receipt and still decides reaction, interpretation, and
meaning.

### 3.5 Dialogue and meaning-making justify the call

The mourner exchange did work only a model should do: it held a voice, read Charles's question as
fear rather than a database request, transformed the rolled funeral premise into “your death arrived
before you did,” and created a new dramatic question. It also correctly used `gen[npc]` instead of
inventing stable atoms for the newly consequential speaker.

This is the standard for an AI turn: the output should change the player's understanding of the
moment, not merely repeat state in sentences.

### 3.6 The captured digest was scoped globally, not to the beat

On steady-state turns the largest repeated sections were approximately:

- `codexRoster`: 2,735 B;
- `pc`: 1,748 B (including roughly 772 B of inventory);
- `recentLedger`: 966–993 B;
- `powers`: 851 B;
- `gazetteer`: 733 B;
- `fronts`: 523 B.

The look, inventory, javelin, and dialogue turns all received almost the same 8.2 KB packet. Yet the
inventory query needed almost none of the world roster; the dialogue needed the local speaker and
scene history but not every carried piton; the javelin transfer needed the javelin instance and
coffin context, not the full gazetteer.

The API seat already carries a stable system prompt, a session bootstrap, and a rolling conversation
window. Repeating the same roster, powers, fronts, ledger lines, and full PC block inside every turn
adds both token load and attention competition. Prompt caching can reduce price; it does not make
irrelevant context useful.

### 3.7 Built correction: `beat-digest/v1`

Ordinary model turns now receive a sparse, deterministic projection from the full `dmDigest()`
truth. The complete digest remains the session-bootstrap, compatibility, and debug surface; it is
not re-shipped in every TurnRequest. `world.dm-digest` selects one primary view:

- `scene` — location, compact PC identity/state, local entities, immediate story pressure, and
  recent consequences;
- `inventory` — stable carried-item ids/state, equipment, gold, current custody, and item legacy;
- `combat` — live tactical state plus the PC resources/modifiers needed to adjudicate it;
- `travel` — the active walk's current segment, fairness/risk contract, cursor, and bounded context;
- `social` — local or explicitly named actors, hidden DM facts/status, attitude, and social PC state.

Every view keeps an invariant scene/PC/pressure/continuity core. Named off-scene Codex nouns are
retrieved by stable record before projection, rather than paying to send the entire roster in case
one name matters. Sparse omission means “not selected for this beat,” never false or erased canon;
the packet says so explicitly in `retrieval`. Context selection cannot mechanize an action—novel
placement, dialogue, travel, attacks, and object use still follow `dmRoute()` authority.

Retrieval distinguishes `actionCodexIds` (identities explicitly selected by the current action)
from `continuityCodexIds` (a two-turn bridge for pronouns and descriptive follow-ups). Continuity
cannot renew its own TTL, cannot override an explicit pivot, and cannot make an old record look as
though the player named it again. Carried named items require exact identity, two matching name
tokens, or a unique head noun; ordinary words cannot summon them accidentally.

The ordinary target is 3 KiB (`DM_BEAT_TARGET_BYTES=3072`). Structural fitting discards recall
conveniences before live truth and never removes location/clock/PC, newest consequence, hottest
pressure, the first relevant entity, live combat, the current walk segment, or a pending situation.
`verify-beat-digest` proves all five views, 1–3 KB upper-budget behavior on ordinary fixtures,
mentioned remote recall, knowledge/status preservation, read-only determinism, material reduction,
bounded continuity, multi-actor preservation, and the real `dmPrepareTurn` transport seam with zero
provider calls.

## 4. The built conservative router

The five-mode research sketch conflated two different decisions: **execution authority** and **model
quality**. The built contract keeps them separate. `dmRoute()` decides execution authority using
only three modes; `dmTriage()` independently chooses a fast/deep quality floor when a model call is
required.

| Mode | Model call | Typical actions | Contract |
|---|---|---|---|
| `local-fact` | none | exact inventory/sheet/map/HP/AC/gold display requests; trusted fact-panel UI actions | Render authoritative state immediately. Contextual acts such as searching a pack while pursued do not qualify. |
| `declared-mechanic` | after resolution when narration is useful | exact short/long rest text; a trusted rest or id-addressed item-transfer declaration | Apply the real engine operation first; send an immutable receipt and post-resolution digest; block response replay. Natural-language placement remains open until the DM/UI supplies the structured destination. |
| `freeform-ruling` | yes | every unknown/contextual utterance; attacks; novel object use; investigation; social play; dialogue; ordinary sensory interpretation | DM interprets intent/applicability/stakes and may return a ruling proposal plus executable top-level events. The engine validates and commits; prose never mutates state. |

The default is `freeform-ruling`. `DM_ROUTINE_VERBS` and `DM_COMBAT_VERBS` remain informative inputs
to quality triage only; they cannot grant execution authority. Spotlight remains a quality/context
decision, not a fourth execution mode. This is how Genesis avoids baking a closed video-game verb
list into a game whose central advantage is open TTRPG possibility.

### 4.1 Open ruling proposal

Freeform TurnRequests carry `rulingRequest` with the available proposal fields:
`understoodAction`, `ruling`, `needsRoll`, `proposedCheck`, `stakes`, `outcomeBranches`, and
`proposedEvents`. A response may omit `ruling` when it is merely acting/voice and no adjudication
needs to be explained. When present it is schema-validated.

`ruling.proposedEvents` is deliberation/audit material only. It is never applied. Executable state
changes must still appear in the response's top-level `events[]`, pass the event contract, and be
accepted by the engine. This prevents an explanatory proposal from becoming a parallel mutator.

### 4.2 Built rest and item-transfer receipts

`mechanical-receipt/v1` carries `id`, `kind`, `engineOwned`, `accepted`, the exact request/result,
relevant before/after snapshots, and `settledEventTypes`. For an exact declared rest, `applyEvent(rest)` runs
before `dmDigest()`. The request therefore carries the real recovery, interruption, clock, lodging,
resource, exhaustion, and pending-situation result. If the narrator emits `rest` anyway, the app
marks it `settled-by-receipt` and does not apply it again.

A trusted `item-transfer` declaration uses the same seam. `applyEvent(item_transfer)` settles
quantity, identity, destination, equipment cleanup, ordinary custody, and linked legacy custody
before the digest is assembled. A narrator-returned `item_transfer` is likewise ignored when the
receipt already settled it. Prose such as “I balance the javelin across the coffin” remains
`freeform-ruling`; no object noun or intent is extracted by keywords.

Both mailbox and API-seat transports call the same preparation seam. Local facts call neither
transport and build no digest.

## 5. The compact dramatic packet

The narrator should not receive a generic world dump. It should receive a beat-shaped packet:

```jsonc
{
  "mode": "declared-mechanic",
  "playerAction": "I take a short rest.",
  "scene": {
    "place": "High-Harrow Gate",
    "sensory": ["sea-salt mist", "distant song"],
    "present": ["the oldest mourner", "two silent mourners"],
    "focusObjects": ["Charles's coffin", "the grave-sword"]
  },
  "actor": { "name": "Charles", "pronouns": "he", "relevant": ["HP 10/20", "Hit Dice 3/3"] },
  "receipt": {
    "schema": "mechanical-receipt/v1",
    "kind": "rest",
    "accepted": true,
    "result": { "rest": "short", "minutes": 60, "interrupted": false },
    "settledEventTypes": ["rest"]
  },
  "storyPressure": ["the funeral expected Charles to lie down"],
  "openQuestions": ["what did the mourners expect him to deliver?"],
  "limits": ["do not move another object or decide Charles's reaction"]
}
```

Rules for assembly:

- static charter and session premise ride the cached/bootstrap prefix once;
- per-turn state is a delta plus here/now retrieval, not the standing roster repeated wholesale;
- retrieve only 3–5 topical Codex records unless `spotlight` explicitly widens the field;
- include only action-relevant PC mechanics (the javelin, not every torch and ability score);
- include the complete mechanical receipt, including hidden/random outcomes the engine already
  resolved;
- include knowledge limits so narration cannot leak hidden facts or assert unknown stats;
- preserve enough story pressure and unresolved questions for the model to make surprising links.

Initial target: **1–3 KB for an ordinary narrated beat**, with larger packets reserved for openings,
finales, and continuity-heavy spotlight turns. This is a target to verify, not a blind hard cap.

## 6. Provider posture (dated 2026-08-04)

Do not pick a creative winner from vendor claims. Use direct providers and replay the same compact
packets blind.

Recommended first comparison:

1. **OpenAI direct** as the engineering baseline. The existing bridge already speaks an
   OpenAI-compatible dialect. Candidate lanes: GPT-5.6 Terra for the balanced voice baseline and
   GPT-5.6 Sol for spotlight/quality-ceiling turns.
2. **Anthropic direct** as the narrative challenger. Candidate lanes: Claude Sonnet 5 for ordinary
   voiced turns and Claude Fable 5 for the quality ceiling.
3. Retain GLM as an optional cost/latency control, not the default creative target. The old seat plan
   chose it before local/resolve routing existed; sparse frontier calls change that economics.
4. Avoid an aggregator in the first bake-off. Direct APIs give cleaner access to native caching,
   structured output, usage data, model versioning, and provider-specific controls. Add a routing
   vendor only if operational redundancy later becomes a real requirement.

The production default is **not decided** by this phase. Voice, coherence, state hygiene, latency,
and measured cost on Genesis scenes decide it.

## 7. No-cost Phase 2 before any provider spend

1. **DONE:** add pure conservative `dmRoute()` ahead of (and independent from) `dmTriage`;
   unknown/contextual free text falls to `freeform-ruling`.
2. **DONE:** define `mechanical-receipt/v1`; resolve exact declared rests before digest/narration;
   share the seam across both transports; reject response replay.
3. **DONE:** add stage telemetry for route, mechanics, digest, request acknowledgement, first
   token/meaningful feedback, response completion, and input unlock. The ≤4s target and ≥8s silent
   failure flag are measured fields, not performance claims.
4. **DONE:** add atomic quantity transfer/place for stackable objects, with stable identity,
   persistent destination/custody, current-scene digest projection, legacy linkage, save/reload,
   clean-failure atomicity, segment scope, custody pickup, and receipt replay protection
   Newly revealed objects already held in a scene can originate there through `item_placed`, and
   completed-walk residue remains discoverable at its node (`verify-item-transfer`: 38/38).
5. **DONE:** build `beat-digest/v1` views (`scene`, `inventory`, `combat`, `travel`, `social`) behind
   the full compatibility/bootstrap digest. Verify the 3 KiB ordinary target, named off-scene
   retrieval, story pressure, knowledge/status limits, determinism, and transport use
   (`verify-beat-digest`: 55/55).
6. **DONE:** promote the probes plus existing state-eval cases into a 28-turn replay corpus.
   Add adversarial cases for object custody, hidden information, random-result ordering, failed
   purchases, impossible actions, and continuity across walk suspension/resumption. Seven persistent
   four-turn arcs now run through fresh processes in `dev/replay-corpus/`.
7. **DONE:** score every replay on two separate axes:
   - **state hygiene**: receipt/event correctness, no unauthorized mutation, no hidden-fact leak;
   - **dramatic contribution**: acting, interpretation, specificity, consequence, surprise,
     continuity, and whether the response did more than restate the packet.
   The recorded baseline passes 38/38 required state checks and 26/26 dramatic anchors twice in a
   row.
8. **DONE:** fix all six surveyed gaps: exact walk-segment custody, custody→PC pickup, persistent
   combat rehydration, exact-name pinning, duplicate-response suppression, and pending-turn/world
   response routing. The corpus now contains zero accepted known-gap sentinels.
9. **DONE, then deliberately extended:** preserve the 30-turn Brineglass browser session and resume
   it from a migrated copy with no provider. Sixty-five more interactions reached campaign turn 95
   and exposed defects that the smaller corpus missed: false ordinary-word pins, stale
   continuity, composite turns losing bounded inventory truth, exact state/custody questions using
   the model, missing immediate walk previews, PC conditions omitted from ordinary foe attacks,
   wrong Dodge/round/flee handling, critical follow-ups staying fast, resolved encounters respawning,
   and a broad place description contradicting the live walk segment. The engine defects are fixed;
   exact evidence is in `dev/playtest-saves/brineglass-bridge-30/resume-after-fixes/`.
10. **DONE through one full 11-segment walk:** the copied campaign has now exercised
    travel/walk entry, generated physical affordances, consequential failed ideas, lethal opposition,
    combat/recovery/reload state, escape without victory XP, custody, an alternative public trap,
    a natural-20 magnitude branch, and noncombat encounter resolution. Longest railroad streak is 0;
    longest no-consequence stretch is 2 diagnostic query turns and only 1 in fictional play.
11. **DONE:** all twenty shared-semantics rest rows have typed engine-owned application and
    consumption/expiry. Exact recovery fractions, one-use disadvantage, next-segment duration,
    resources, and interruption mechanize; vague authored meaning remains interpretive.
12. **DONE FOR THE FIXED-WORLD CONTRACT:** solo danger does not rubber-band rosters to the PC.
    Deadly danger is telegraphed, escape is available before entrapment, and noncombat resolution
    retains parity. The live soak proved failure, retreat, alternate routes, and rescue without
    silently weakening the world.
13. **OPEN PERFORMANCE:** compact truth-complete transition/walk/finale packets. The 52 model-shaped
    live packets averaged 5,185 bytes, with an 8,542-byte p95 and 8,759-byte maximum; do not remove
    immediate actionable segments, critical lenses, custody, or selected canon to meet the target.
14. **OPEN UI + FINAL SOAK:** exercise persistent level-up choices in the browser, then continue
    through a promoted frontier, live typed rest rider, completed-site revisit, and combat reload.
15. Only after the soak stops surfacing P0/P1 engine defects, spend a small fixed provider bake-off:
    identical copied packets, pinned model ids/settings, blind labels, hard token/cost cap, and no
    live campaign state.

### Phase 2F boundary result at turn 95

The full walk sharpened the division rather than moving more authority into the model. The engine
now owns rest riders, combat state, graph movement, walk totals and completion, item origin/custody,
completed-site residue, and exact place identity. The DM still owned the finale's public meaning,
the false noble's performance and defeat, the tracking mark's identity, Tessa's interpretation of
the rubbing, and how failure or refusal altered the social situation. Unresolved authored finales
and typed pending situations receive a deep quality floor, but that routing grants no state-writing
authority beyond accepted events.

The next implementation unit is packet compaction plus UI proof, followed by one final zero-provider
state soak. Provider comparison is not yet authorized by this gate.
