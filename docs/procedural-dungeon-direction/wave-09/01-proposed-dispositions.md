---
type: design-study
status: CLOSED — 2026-07-22 at §18.7 (founder-review session; sweep §18.6)
wave: 9
part: 01
legacy_sections: "18"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 9 running record — proposed dispositions (section 18)

Question wording preserved verbatim from `../QUESTIONNAIRE.md`. Labels and phasing fields as in
the Wave 7 record.

## 18.1 Inherited law recovered before any new question

Wave 9 does not re-ask: the DM works a thin filtered hand — MUST PLAY → PLAY SOON → PLAY IF FIT
→ RESERVE → LOCAL SPICE — with "ASAP" defined as the earliest semantically, geographically,
spatially, and canonically legal opportunity, deferral raising pressure until a diegetic
delivery or dedicated hook-walk resolves it (W1 §8.10); service guarantees advance within a
bounded window of suitable opportunities, normally as progress beats (W1 §8.10); promissory
cards expand seeded → tugged → pursued → committed and must materialize honestly under direct
pursuit (W1 §8.9); callback eligibility is selective — "player-created significance can qualify
an otherwise ordinary noun while mere DM repetition cannot" (G2.1.3-4); a card licenses bounded
generation only through the REPLAY/DERIVE/ROLL/PROPOSE/SYNTHESIZE lanes with nine typed
relation modes (G2.1.4-6); invention authority is the valence-neutral C0-C4 matrix with hostile
causal-commitment windows, graduated counters, and no reactive scaling (G2.1.7-11); provisional
casting uses the bounded ActorCard pool with rooting events (G2.1-NPC-POOL); private DM
deliberation is tiered, read-only, and never canonical (G2.1-DM-SCRATCH); saturation is a typed
per-scene-family vector over causal situations, with the exposition-burst license for earned
info-delivery scenes (W2 §10.11.24); the DM narrates from the active viewpoint-knowledge
boundary and may not leak hidden canon (W1 §8.15.3); the DM never coaches, never menus options,
and honors refusal and silence (DM-CHARTER §3); simulation feeds bounded DM context, never a
player dashboard (P2.19); the digest is scoped and delta-based (DIGEST-DIET; G6.1
relevance-scoped retrieval — active causal frontier + deltas + one-line roster + pull-by-id);
environmental cards spend only prepared/licensed reserves through typed owner requests
(F10.9k's projection-request pattern; W8's registry); and every supported provider receives the
same facts, mechanics, and refusal contracts (provider-neutral seat).

## 18.2 Proposed dispositions

### P9.1 — card families and sources
> "What distinct cards represent obligations, consequences, callbacks, motifs, faction moves,
> environmental opportunities, threats, quiet beats, discoveries, rewards, tutorials, and
> local Spice; which canonical event/owner may mint each?"

**Disposition: FABLE-PROPOSED.** One **Card registry** typed by mint authority — cards are
projections of owner state, never a second store: obligation/service (minted by contract
receipts, W1 Q10) · consequence (by mutation/crisis receipts) · callback/motif (by dormant
SceneFact stubs + MotifDeck entries) · faction move (by front/clock owners, W1 Q18) ·
environmental opportunity (by W7 AffordanceTags + W8 prepared reserves) · threat/pressure (by
clocks/fronts) · quiet beat (by the cadence controller, P9.6) · discovery delivery (by
promissory story cards, W1 Q9) · reward (by reward-anchor receipts, W2) · tutorial/assist (by
the assist posture, Q9-B) · local Spice (by scoped Spice events, W1 §8.17). A card with no
owner receipt cannot exist — the anti-drift law applied to the DM's hand.
Cost: engine M, QA S. Phase: PRE-ALPHA CRITICAL for the registry shape (C2B/C4C consume it);
family breadth MVP→GOAL. Seam: card = {kind, owner ref, legality predicate, priority inputs,
service horizon}. Clay: C2B (promise/payoff) then C4C. Owner: this record over W1/W2 sources.

### P9.2 — permissions and legal windows
> "What can each card request versus establish; which REPLAY, DERIVE, ROLL, PROPOSE, or
> SYNTHESIZE lane applies; and what semantic, geographic, spatial, temporal, knowledge,
> resource, and C-band conditions make a play legal now?"

**Disposition: INHERITED.** The lanes and the C-band matrix are closed law (G2.1); "ASAP = the
earliest … legal opportunity" already defines the window axes (W1 §8.10); cards request through
typed owner receipts and establish nothing themselves (F10.9k pattern). FABLE-PROPOSED thin
formality: a card's **legality predicate** is stored data (the P9.1 schema field) evaluated
against current state — never re-argued in prose by a provider. Owner: G2.1 + W1 §8.10.

### P9.3 — priority hand and service
> "How do MUST PLAY, PLAY SOON, PLAY IF FIT, RESERVE, and LOCAL SPICE interact with salience,
> deadlines, player attention, contracts, scene load, danger, quiet, and opportunity so
> priorities are honored without overwriting rolled room identity?"

**Disposition: INHERITED tiers + FABLE-PROPOSED scoring + EVIDENCE-GATED numbers.**
Proposal: deterministic **hand assembly** each beat — eligible cards score on (deadline
pressure, salience from player engagement, contract weight, fit to the current scene's
saturation headroom, danger/quiet need from the cadence controller); tiers are score bands;
hand size is capped (provisional cap: 5-9 visible cards, measured); "rooms keep their rolled
identities while gaining relationships and meaning" (W1 Q10 language) is enforced because a
card may *bind to* a room's existing nouns but never replace its rolled identity. Exact
weights, caps, and horizons are soak-measured (the W2 G2.1-CLOSE deferral honored), with the
STATE-HYGIENE-EVAL harness as the measuring instrument.
Cost: engine M, QA M. Phase: MVP (small hand, plain scoring) → GOAL (tuned weights, dense
campaigns). Seam: score-input fields on the card schema. Clay: C2B; C4C. Owner: this record.

### P9.4 — deferral, expiry, and forced delivery
> "When may the DM defer a card, what raises pressure, what expires versus persists, and when
> must the system create a diegetic delivery, messenger, consequence, dedicated hook-walk, or
> honest failure rather than silently dropping a promise?"

**Disposition: INHERITED.** W1 Q10 is the ruling: recorded deferrals raise pressure; an
expiring service horizon forces a diegetic delivery or dedicated hook-walk rather than a
silent drop; HOOK-WALKS is the built-adjacent instrument. FABLE-PROPOSED detail: expiry
classes on the card schema (persist-until-served for committed promises; expire-with-evidence
for opportunities — an expired opportunity emits an honest world consequence, not amnesia);
"honest failure" of a promise is itself a consequence card with evidence. EVIDENCE-GATED:
horizon lengths. Owner: W1 Q10; this record's expiry classes.

### P9.5 — motif/callback memory (with G9.1)
> P9.5: "Under G9.1, how are player phrases, humor, music references, fears, relationships,
> action styles, scars, objects, and prior hostile inventions sourced, scoped, budgeted,
> transformed, cooled, and separated from private/profile-local versus shippable content?"
> G9.1: "How should a sourced `Motif/CallbackDeck` remember player phrases, humor, music
> references, fears, relationships, and action styles with recurrence budgets and explicit
> mechanical permission, while separating private/user-local material from shippable authored
> content?"

**Disposition: FABLE-PROPOSED (mechanism) over INHERITED privacy law.**
Proposal — the **MotifDeck**: entries mint only from receipts of actual play (player-authored
phrases, landed jokes, named fears, signature tactics, scars, kept objects, hostile inventions
survived), each carrying source receipt, scope (this-world by default), recurrence budget,
cooldown, and transformation lane (the nine relation modes govern how a motif may return —
echo/analogy vs. causal recurrence stay distinct). Recurrence spends budget; budgets refill
only through fresh player engagement (the G2.1.3 salience law — DM repetition cannot). Cooling
folds an entry dormant; nothing is erased. Privacy: world-local by default; profile-local
cross-world motifs are the same opt-in lane as G2.1-CERT's private toolbox; nothing player-
derived becomes shippable content without explicit consent (W12 P12.8 owns the consent
surface). Mechanical permission: a motif card is color unless it binds through a real lane —
it never grants dice, items, or authority by sentiment.
Dungeon example: the player's running joke naming every mule "Chancellor" → motif entry; three
sessions later a ROLL-lane livestock table result may surface a mule the DM captions
"Chancellor IV" (echo mode, budget spent); the mule gains no mechanical specialness.
DM-seat: the digest carries at most the top-k eligible motifs with budgets; a provider may not
resurface an exhausted motif.
Cost: engine M, QA S-M. Phase: PROOF→MVP→GOAL (proof: one motif minted/spent/cooled in a soak
trace; MVP: deck live with small k; goal: rich transformation vocabulary). Seam: motif entry
schema + budget receipts. Promotion: soak evidence callbacks feel earned, not nagging. Debt:
v1 sources are explicit receipts only (no mining of free prose). Clay: C4C + soak. Owner: this
record; privacy law: G2.1-CERT/P12.8.

### P9.6 — pressure, release, and cadence
> "How do active crises, clocks, danger, player momentum, recent intensity, quiet needs,
> recurrence saturation, and campaign style determine whether the DM escalates, sustains,
> pivots, releases, or lets a room remain ordinary?"

**Disposition: INHERITED dials + FABLE-PROPOSED controller + OPEN-ADAM posture (Q9-A).**
Inherited: pacing is a script-owned tuned setting (PACING-DIALS rulings); saturation vector +
exposition-burst license (W2 §10.11.24); patient world + NPC/clock forward pressure with the
Charter's own "(provisional; tune toward Gemini-feel if dry)" flag; In-Media-Res escalation
table on player drag; quiet is a legitimate output ("let a room remain ordinary" — LOCAL SPICE
tier exists for exactly this).
Proposal: the **cadence controller** — a deterministic read of (active crisis count, nearest
clock pressure, recent intensity window, saturation headroom, quiet debt) that outputs one of
escalate/sustain/pivot/release/ordinary as the hand-assembly's danger/quiet input. The
controller implements whatever posture Adam selects in Q9-A; its thresholds are soak-tuned.
Phase: MVP (simple window math) → GOAL (campaign-style profiles as versioned control surfaces).
Clay: C4C + soak. Owner: this record beneath PACING-DIALS.

### P9.7 — attention, contracts, and player direction
> "How do questions, repeated investigation, promises, bargains, payment, pursuit, abandonment,
> and explicit goals promote cards and service guarantees without turning curiosity into an
> unavoidable quest or cooling into erasure?"

**Disposition: INHERITED.** Fully answered by: promissory promotion states (seeded→tugged→
pursued→committed, W1 Q9); contract escalation on asking-for-terms and service guarantees on
agreement/payment/action (W1 Q9/Q10); salience prefers player-initiated signals (Consequence
Ladder's pin/ask/return; G2.1.3); the Diversion Rule — any thread can be walked away from and
the world doesn't sulk; cooling folds, never erases (G2.1 lifecycle; "moving on may cool or
fold a fact, but may not erase it from the world"). Curiosity alone promotes priority/detail,
never obligation — only commitment-bearing acts mint service guarantees. Owner: closed sources;
no addition needed.

### P9.8 — faction/NPC/environment strategy
> "How do actors and systems draw or create plans from goals, knowledge, resources,
> relationships, clocks, territory, prior observation, and doctrine; how do hostile cards obey
> causal preparation, graduated counters, and no-reactive-scaling law?"

**Disposition: INHERITED + FABLE-PROPOSED draw mechanism.** Inherited: event-driven occupation
fronts advancing only on recorded triggers (W1 Q18); hostile causal-commitment windows;
graduated counter ladder; no reactive scaling; NPC proactivity on faction clocks (Charter).
Proposal: **strategy draws** — when a front/clock fires, its owner assembles plan candidates
strictly from that actor's canonical goals, current knowledge receipts, real resources,
relationships, and doctrine profile, scored deterministically (the P7.6 tactic scorer at
strategic scale); the chosen plan mints faction-move cards with prepared-reserve commitments
(latent content committed before reveal). The DM performs the plan; it never invents one
outside the draw. Phase: PROOF→MVP→GOAL (proof: one faction executes one two-step plan in a
soak trace; MVP: single-front draws; goal: multi-front politics, W2's dynamic contested
operation). Seam: plan candidate schema + reserve commitments. Clay: C4A/C4C. Owner: this
record over W1 Q18 + G2.1.

### P9.9 — environmental authority
> "Which card effects may reposition threats, activate machinery, reveal prepared features,
> change weather/lighting, spend reserves, start propagation, close opportunities, or create
> expression-bearing complications; when must they defer to Wave 8 mutation and Wave 7 action
> owners?"

**Disposition: INHERITED.** The boundary is already law: cards *request*, owners *commit*
(F10.9k typed projection requests; W8's MutationOp registry is the only way environment
changes; W7's ActionIntent the only way actions resolve). A card may: play a prepared feature
(committed latent content), spend a licensed reserve, trigger an owner's machinery/weather
state change through its op, or start a propagation front the owner validates. It may never
reposition a threat outside movement law, mint an unprepared trap (quantum-trap bar), or
adjudicate outcomes. Expression-bearing complications route through the C0-C4 envelope.
Owner: G2.1 + W7/W8 boundaries; nothing new to decide.

### P9.10 — DM digest and assistance profile (with G9.2)
> P9.10: "Under G9.2, what bounded current hand, cast/fact validity, legal actions, due
> obligations, rules references, and per-player rules-only/affordance/tutorial posture reach
> the DM without an action menu, tactical steering, stale nouns, or context overload?"
> G9.2: "What active digest and validation boundary lets the DM sustain pressure, license quiet
> beats, mention only valid cast members and facts, and offer per-player rules/tutorial
> assistance without turning contextual examples into an action menu or tactical railroad?"

**Disposition: INHERITED composition + FABLE-PROPOSED digest schema + OPEN-ADAM default (Q9-B).**
Inherited: DIGEST-DIET's scoped/delta digest; G6.1's relevance-scoped retrieval (active causal
frontier + deltas + one-line roster + pull-by-id — never bulk world); cast validity from the
ActorCard/rooting law (no stale nouns: the digest lists only currently valid referents);
Charter §3's absolute bars on option menus and tactics coaching; fiction-first fallback.
Proposal: the **DM turn digest schema** — {current hand (capped), cast validity list, scene
facts at viewpoint precision, due obligations, legal-action *families* (never enumerated picks
for the player), relevant rules references, assist posture flags}. Rules assistance renders as
DM-voice explanation when the posture licenses it, never as a suggested move.
The *default* assist posture is Adam's (Q9-B). Phase: PRE-ALPHA CRITICAL (the digest is the
seat's food; C1G consumes it). Seam: digest schema versioned with the seat contract. Clay:
C1G; C4C. Owner: this record over DIGEST-DIET/G6.1.

### P9.11 — composition, saturation, and anti-railroad
> "Which cards may combine into one beat, how are competing owners arbitrated, what prevents
> recursive callbacks and nonstop escalation, and what measurable room remains for
> player-authored direction, surprise, refusal, silence, and genuine DM taste?"

**Disposition: INHERITED + FABLE-PROPOSED floors.** Inherited: causal-situation bundling before
saturation (W2 §10.11.24); competing owners arbitrate by deadline/authority then deterministic
tie-break (the F10.9l/W10 opening-window pattern); recursion is blocked by motif budgets +
cooling + the Diversion Rule; escalation is bounded by the cadence controller and honest class
ceilings. Proposal — **player-direction floors**: the hand cap reserves headroom (at least one
tier-slot beat per scene window left unbound for player-authored direction); refusal/silence
are always-legal plays the scheduler must never punish (Charter); "genuine DM taste" is the
performance layer — the DM chooses *among* legal cards and their expression, which is exactly
the Charter's licensed area. Floors are measured in soak (does play feel steered?). Phase: MVP.
Owner: this record beneath Charter/W2.

### P9.12 — Wave 9 acceptance corpus
> "Which long sessions, quiet/dense campaigns, deferred promises, expiring services, callbacks,
> factions, private motifs, invalid plays, context compactions, and adversarial card stacks
> prove memory, restraint, agency, legal authority, varied cadence, and causal delivery?"

**Disposition: FABLE-PROPOSED structure + EVIDENCE-GATED thresholds.** Incremental overlay,
soak-centric (this wave's proof medium is long deterministic sessions, not rooms): a deferred-
promise-served trace · an expiring-service forced-delivery trace · a callback minted/spent/
cooled trace · a faction two-step plan trace · a private-motif privacy trace (never leaves
world scope without consent) · an invalid-play rejection trace (card illegal now, provider
narration blocked) · a context-compaction trace (hand survives digest compaction) · a quiet-
session trace (cadence releases; no manufactured escalation) · a dense-stack arbitration trace
· long-session memory trace (STATE-HYGIENE-EVAL extended). Thresholds measured; harness =
state-hygiene eval + soak playtests. Owner: this record + P10.12 process.

## 18.3 Generated follow-up

### F9.1 — hand-state persistence and recovery (material gap)
Cards are projections, but the *hand state* (scores, deferral pressure, budgets, horizons) must
survive save/load and provider swaps without re-deriving differently. **FABLE-PROPOSED:** hand
state is a small canonical record (per the sparse-record law) rebuilt deterministically from
owner receipts on load — receipts are truth, the hand is a cached projection with a version
cursor (the P10.9 recovery pattern). A provider swap re-reads the same hand; it never re-scores
mid-scene. Phase: MVP. Clay: C4C recovery variant. No founder fork.

## 18.4 Founder questions (easy batch, two items)

### Q9-A — default DM initiative posture (OPEN-ADAM; the Charter's own provisional)
The Charter marked pacing "provisional; tune toward Gemini-feel if dry." With the cadence
controller real, what is the default posture the controller implements?

- **A. Patient world.** Pressure comes almost entirely from clocks/fronts; the DM rarely
  initiates beats unprompted; quiet is common. Purest sandbox; risks the dryness the Charter
  worried about.
- **B. Forward-leaning weaver (recommended).** Clocks/fronts press honestly AND the controller
  biases toward serving one live hand-beat per scene window when headroom exists; quiet is
  protected by the floors (P9.11), escalation stays causal. Closest to the Gemini-reference
  "causal generosity" Adam admired, without provider authority.
- **C. Relentless front-foot.** The controller treats idle windows as escalation debt; strong
  momentum, weakest quiet; risks tonal railroading the Charter forbids.

Recommendation: **B**, stored as a versioned campaign-profile control surface (W2 §10.11.42
law) so A/C remain selectable styles later.

### Q9-B — default assistance/tutorial posture (OPEN-ADAM)
G9.2 requires per-player rules/affordance/tutorial assistance without an action menu. The
per-player setting is inherited; the *default* for a new player is taste:

- **A. Rules-only.** Assistance appears only when a rule is actually invoked or misapplied.
  Purist; steepest onboarding.
- **B. Reactive affordance help (recommended).** Rules-only, plus the DM may answer "what can I
  do?"-class questions with honest capability summaries (never suggestions), and the Curve of
  Revelation announces new UI as it unlocks (existing NEW-GAME-FLOW law). No unprompted
  coaching; Charter-safe.
- **C. Proactive tutorial voice.** The DM volunteers guidance in early sessions, receding over
  time. Friendliest onboarding; brushes against the no-coaching law and needs careful voice
  work ("tutorial DM is later" — Charter note).

Recommendation: **B** now; C remains a tracked feature-goal candidate for a future onboarding
pass (the Charter already anticipates a later tutorial register).

#### Founder rulings — 2026-07-22 (Adam, Batch 1)

**Q9-A: B.** Adam's answer, verbatim: "B, will need to be tweaked through gameplay, but so
many systems are being added that's a ways out." Default DM initiative posture is the
forward-leaning weaver. Adam's tuning caveat is anticipated by the disposition itself: the
posture lives on a versioned campaign-profile control surface (W2 §10.11.42 law), and that
surface — not a wave reopen — is where the gameplay-driven tweaking happens when enough
systems exist to feel it. **Q9-A is LOCKED.**

**Q9-B: B.** Adam's answer, verbatim: "B." Reactive affordance help is the new-player default:
rules-only plus honest capability summaries on request (never suggestions), Curve of
Revelation announcements, no unprompted coaching. Proactive tutorial voice (C) remains a
tracked feature-goal register for a future onboarding pass. **Q9-B is LOCKED.** The cadence
controller and digest machinery (P9.6/P9.10/G9.2 FABLE-PROPOSED components) still await the
Wave 9 sweep.

## 18.5 Coverage and authority audit (proposed)

All 14 bank questions dispositioned; 1 generated follow-up (F9.1); 2 founder items (Q9-A/Q9-B).
Authority: Wave 9 owns hand policy, card registry/scheduling, motif memory, cadence, digest
composition, and strategy draws — beneath the Charter's agency laws and G2.1's authority
matrix, requesting through W7/W8 owners, never owning canon, provider-neutral throughout. No
contradiction with closed waves found while drafting; the Charter's provisional pacing flag is
surfaced (Q9-A) rather than silently resolved. **No closure is claimed; no implementation is
authorized.**

## 18.6 Wave 9 sweep — 2026-07-22 founder review (Adam)

Adam swept the thirteen items (P9.1-P9.12 + F9.1) in the plain-language founder review.
Verbatim rulings and their dispositions:

1. **P9.1 — ACCEPTED with founder enthusiasm; question answered in session; vision captured.**
   "i am liking the idea of a hand of cards a lot. can you see any reasons why a DM should not
   play from cards? it seems to solve a lot of our problems, and allows us to think in
   categories of card types that could be played as well. this idea also opens itself up to an
   entirely new game as a sequel where the player is the DM, or where a player could sit in
   the DM seat in a multiplayer version of the game." → The known risks of a carded DM (scene-
   level spontaneity feeling bureaucratic; early-world hand starvation; visible card seams;
   over-scheduling) were presented in session with their existing fences (the performance
   layer is never carded; LOCAL SPICE + quiet-beat supply; DM-side invisibility + motif
   budgets; P9.11 floors + clocks running regardless) — no disqualifying reason found; the
   "feels mechanical?" question is measured by the P9.12 soak corpus. The player-as-DM /
   multiplayer-DM-seat vision is captured as **F9.2** below.
2. **P9.2 — ACCEPTED.** "yes, a card should know when it can be played."
3. **P9.3 — ACCEPTED.** "yes."
4. **P9.4 — ACCEPTED.** "yes, no cold leads." (The founder phrase for the no-silent-drop
   law.)
5. **P9.5 — ACCEPTED.** "most definitely."
6. **P9.6 — ACCEPTED with the pacing touchstone bound.** "yes, by default we want the game's
   pace cranked up a bit. That gemini session should be somewhere in the references folder i
   believe, you can see the pacing on that i mean it was non stop action and the social
   scenes were beautiful, earned, and the non violent escalating ones were tense." → The
   Gemini reference session is the controller's soak-tuning target: nonstop *causal* action,
   earned social scenes, tense nonviolent escalations. It is cited today via PACING-DIALS.md
   and wave-02/04-question-11-b.md §11-B; the transcript itself was not found under
   `Reference/` — small gather task: locate/import it so the touchstone is a repo artifact.
7. **P9.7 — ACCEPTED with the cozy-register vision; captured as F9.3.** "that's right, you
   can let the world devolve into degenerate chaos and just farm carrots for all i care. the
   DM might have a hard time letting you do that though, but it would be cool if the DM were
   smart enough to pick up on the fact that you really like farming carrots. There is a cool
   new TTRPG that has a whole world at peace system of games and things. It would be nice to
   take a look at that system at some point and try to bring some of that into the game. Not
   everyone wants big wild chaotic adventures."
8. **P9.8 — ACCEPTED.** "yes."
9. **P9.9 — ACCEPTED as the starting setting, with the harness-off experiment instrument.**
   "yes, we'll have to do some playtesting with that but that is the setting we start with.
   we'll want to take the harness off the DM sometimes and see how it goes and see what is
   more fun." → Recorded as a sandboxed A/B instrument (the G2.1-DM-SCRATCH evidence
   pattern): harness-off runs are dev-side soak experiments, never shipped defaults; findings
   that argue against the request/commit boundary return as explicit reopen proposals with
   evidence — the boundary law does not loosen silently.
10. **P9.10 — ACCEPTED with the digest A/B instrument.** "yes, i think that is it. We should
    also a/b the digest and see what performs better at some point." → Digest-variant A/B is
    an evidence instrument on the soak/state-hygiene harness; the schema stays versioned with
    the seat contract so variants are comparable.
11. **P9.11 — ACCEPTED.** "yes, fine balance but should be the way."
12. **P9.12 — ACCEPTED with the both-media amendment.** "both, we'll need long sessions, but
    we will also need to test specific scenarios to make sure the DM is fully functional."
    → The corpus explicitly requires both long deterministic soaks AND short targeted
    scenario fixtures (the trace list stands as the scenario set; soaks prove memory/cadence
    over time).
13. **F9.1 — ACCEPTED.** "yes."

### F9.2 — the DM seat as a playable seat (founder product vision; deferred)

From Adam's P9.1 sweep language (verbatim above): the card architecture opens "an entirely
new game as a sequel where the player is the DM, or where a player could sit in the DM seat
in a multiplayer version of the game." Disposition: **DEFERRED product vision.** It changes
nothing now — Genesis remains standalone single-player (PRODUCT-SCOPE non-goals unchanged);
no multiplayer or player-DM work is authorized. What we bank: the card registry + receipts +
digest schema are exactly the interface a human in the DM seat would need (cards are a
teachable, handoff-able DM surface) — keeping that seat provider-neutral and contract-typed
IS the seam. Trigger: a post-1.0 explicit product decision by Adam.

#### Risk-rider exchange — 2026-07-22 (Adam, on the four carded-DM risks)

Presented with the four risks of a carded DM and their fences, Adam bound four riders,
verbatim:

1. On performance-layer freedom: "ok we must preserve room for the DM to have a personality
   and improvise." → **Binding rider:** the performance layer (voice, expression, choice
   among legal cards, in-scene improvisation within the Charter's licensed area) is never
   carded, never scheduled, never scored.
2. On hand starvation: "We need to ensure that there are always cards in the hand." →
   **Binding rider — the hand floor:** the hand may never be empty; LOCAL SPICE, quiet-beat
   supply, and walk-generated material guarantee a non-empty hand from the first room.
3. On visible seams / systematizing: "yeah, that's what I am really worried about with
   systematizing everything, but we'll see how it plays. I would rather have a harness and
   ID on everything first and then slowly cut things loose if it feels too uptight." →
   **Founder posture recorded: harness-first, loosen-by-evidence.** Everything ships typed
   and receipted; loosening is a deliberate, evidence-backed act (the harness-off instrument
   at item 9), never a starting assumption.
4. On over-scheduling: "i think always having extra cards in the hand will help with this.
   As long as we are aware of the pitfalls and have means of measuring and testing against
   them then we should be ok." → **Rider:** the four pitfalls are named measurement targets
   of the P9.12 corpus (steered-feel, nagging, dryness, simultaneity), not background
   worries.

### F9.3 — the cozy/peaceful play register (founder vision; research follow-up)

From Adam's P9.7 sweep language (verbatim above). Two parts: (a) **preference detection** —
the DM should read persistent player-authored signals (e.g. "you really like farming
carrots") through the existing salience/motif machinery and let the cadence controller honor
a nonviolent/pastoral register — this is a campaign-style profile on the already-planned
versioned control surface (P9.6 goal tier), not new authority; the Diversion Rule already
guarantees the *right* to farm carrots. (b) **Research gather** — survey peace-forward TTRPG
systems (the "whole world at peace" game Adam references, plus kin) and propose which
mechanics port. Trigger: a later research window on Adam's word; no wave reopen needed —
the profile surface is the seam.

## 18.7 Wave 9 closure — 2026-07-22 (Adam)

Adam explicitly closed Wave 9 in the 2026-07-22 founder-review session. Verbatim, in
response to the closure ask, after binding the four risk riders above: "ok let's get to
wave 11." The closure takes the sweep at §18.6 (all thirteen items ruled, verbatim), the
risk-rider exchange (performance-layer freedom · the hand floor · harness-first,
loosen-by-evidence · pitfalls as named measurement targets), the two founder rulings at
§18.4 (Q9-A B with the tune-through-play caveat; Q9-B B), the new follow-ups F9.2/F9.3 and
instruments (harness-off A/B, digest A/B, both-media corpus, Gemini-transcript gather), and
the phasing audit as presented. Wave 9 is **CLOSED on its recorded phased basis**: design
disposition and traceability only; no implementation, evidence, dependency, or release
claim; the implementation hold stands until Wave 12's gate. Reopening requires an explicit
named contradiction per the reopen law.
