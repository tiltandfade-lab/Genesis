---
type: design-study
status: CLOSED — 2026-07-22 at §16.7 (founder-review session; sweep §16.6)
wave: 7
part: 01
legacy_sections: "16"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 7 running record — proposed dispositions (section 16)

Drafted by Fable in the 2026-07-22 canon-and-scope pass. Question wording is preserved verbatim
from the master questionnaire (`../QUESTIONNAIRE.md`, Wave 7 bank + additive G bank). Labels
follow the canon coverage vocabulary: `INHERITED` (already entailed by closed waves/rulings —
not re-asked), `FABLE-PROPOSED` (objective technical default drafted here), `EVIDENCE-GATED`
(honest answer requires a retained proof/measurement), `OPEN-ADAM` (genuine founder fork),
`DEFERRED` (seam + destination + trigger retained). Per the phasing amendment, every proposed
ruling carries its phase form, seam, promotion evidence, debt, and first Clay Pass.

## 16.1 Inherited law recovered before any new question

Wave 7 does not re-ask: exact `SpatialPlan` cells/elevation/occupancy as the intended release
combat authority with bands/zones as derived fallback (W10 §11.7); incremental movement spend,
explicit Dash-source selection, dim locked extension preview, one concise route-consequence
warning, bounded undo, resource-bounded route ranking (W10 §11.7-11.11); the mandatory
receipt-derived EngagementLens and deterministic block initiative with ±3 edges (W10 §11.19-
11.33); BodyForm/combat-control space, typed activity capacity, SRD-first-then-DC constrained
movement, typed participation roles with real contribution windows (W6 §15.4/15.6); canonical
connections/traversal transactions/pursuit distance (W4); assemblies declaring an explicit
interaction/tactics layer with protected circulation (W5); typed hard/exclusive/compatible/soft
reservations (W3 P3.6); the reservation that dressing may create tactical friction but never
accidentally block the only required route (FOUNDATION §2.7); surfaced-spotlight Crit
eligibility, the 15/3/1/1 ladder, reward anchors, and no crit fishing (W2 §10.11.28-44); "Open
intent, constrained outcome" with Lane A/B/C compilation (W2 §10.11.25-26); joint danger/
attrition/consumable/rest budgeting with no reactive punishment for found loot (W1 §8.11.1);
`contest` never auto-implying combat (W1 §8.18.2); the noisy risk/reward rise with effective
access depth (W1 §8.20); and R2's adopted cell/height query spine, transit-vs-stop distinction,
declarative range/area decomposition, and immutable preview/commit receipts (W6 §15.3).

## 16.2 Proposed dispositions

### P7.1 — authoritative tactical abstraction
> "Which cells, zones, bands, lanes, elevations, adjacency, orientation, occupancy, and
> uncertainty are mechanical truth in exploration and conflict, and how can different views
> project them without changing rules?"

**Disposition: INHERITED core + FABLE-PROPOSED completion.**
Inherited: exact cells/elevation/occupancy are combat truth; zones/bands/lanes are derived
projections; precision tiers (exact/anchored/zone/unresolved) carry uncertainty honestly; views
never change rules (renderer boundary).
Proposal — the **TacticalQueryKernel**: one pure, deterministic spatial-query boundary over the
committed `SpatialPlan` (reach, adjacency, path/cost, line of sight, line of effect, area
resolution, elevation relations, occupancy/footprint fit via BodyForm). Every consumer — player
UI, enemy selection, DM digest, accessibility navigator — asks the same kernel; no view computes
its own answer. Orientation/facing is **not** mechanical truth (stock 5.5e has no facing;
rules-posture law), recorded as a rejected-default with the SRD as authority. Exploration uses
the same kernel at the scene's honest precision tier.
Dungeon example: a goblin behind a crate at +5 ft elevation — the kernel answers cover, reach,
and path cost identically for the player's preview and the goblin's tactic scoring.
DM-seat example: any provider asking "can Varka reach the lever this turn?" receives the
kernel's answer as fact; no model may assert reach prose-first.
Cost: engine M (kernel + consumers), authoring nil, runtime low (bounded queries), persistence
nil, QA M. Phase: PRE-ALPHA CRITICAL (it is the C1B/C1D substance). Seam: kernel API + receipt
ids. Promotion: broader query families (swim/climb/burrow/fly volumes) as content demands.
Debt: first kernel serves land movement + simple volumes only; truthful refusal elsewhere.
First Clay Pass: C1B; MVP gate C1D. Owner: this record; conflicts: none (R2 amendment already
bars one-unweighted-BFS-owns-everything).

### P7.2 — movement, range, sight, sound, and cover
> "How are distance, path cost, reach, line of sight/effect, hearing, concealment,
> partial/total cover, elevation, facing where relevant, and uncertain positions resolved
> consistently for player and enemies?"

**Disposition: INHERITED rules + FABLE-PROPOSED derivation stack.**
Inherited: the SRD owns the mechanics (distances, cover grades, concealment, senses); the same
truth serves player and enemies (symmetry law F4.9b's spirit); uncertain positions are precision
tiers, never fake exactness.
Proposal: deterministic derivations — path cost from cells + difficult terrain + BodyForm
movement modes; LOS/LOE by cell-edge raycast mapping to SRD half/three-quarters/total cover;
concealment from light/obscurement state (DIEGETIC-LIGHT seam); hearing as a bounded typed
propagation query stub whose rich medium behavior stays a Wave 8 propagation consumer. Facing:
none (per P7.1). EVIDENCE-GATED: the exact corner-rule variant for cover raycasts (candidate
variants are all SRD-compatible; C1D captures decide by readability/fairness, not taste).
Dungeon example: Fire Bolt across a brazier-lit hall — LOE clear, half cover from the pew line,
disadvantage beyond a torch's dim radius; identical numbers if the cultist returns fire.
DM-seat: the digest carries "half cover, dim light" as facts; fallback clause renders them as
fiction ("the pews swallow half your line").
Cost: engine M, QA M (golden ray fixtures). Phase: PRE-ALPHA CRITICAL (movement/cover) with
hearing breadth as PROOF→MVP→GOAL. Seam: kernel query families + light/obscurement state ids.
Promotion: measured comprehension of cover tells (C1D captures). Debt: hearing v1 is coarse
(room/connection audibility classes). Clay: C1B/C1D. Owner: this record.

### P7.3 — terrain and hazard affordances
> "How do surfaces, height, chokepoints, obstacles, fluids, fire, smoke, darkness, machinery,
> unstable structures, and interactable props advertise and supply tactical options without
> every room becoming a puzzle arena?"

**Disposition: INHERITED.** W3/W5 already rule that architecture and dressing deliberately
generate affordances (cover, chokepoints, flanking lanes, elevation, destructibles, hazards,
interaction opportunities) inside function-first rooms; W5's interaction/tactics layer declares
them; P6.10's viewpoint-legal tells advertise them; the anti-puzzle-arena guard is Wave 1's
function-led generation plus the protected-random allocation (most rooms roll no combat, FOUNDATION
§2.4). Wave 7 adds only a registry formality (FABLE-PROPOSED): a typed **AffordanceTag**
vocabulary (cover, chokepoint, elevation, hazard, interactable, concealment, unstable[W8-seam],
fluid[W8-seam]) emitted by the compiler so tactic scoring, tells, and the DM digest consume one
list. Fire/smoke/fluid *behavior* is Wave 8's; Wave 7 consumes their committed states only.
Phase: MVP (tags on supported nouns). Clay: C1D/C1J. Debt: unsupported nouns simply carry no
tag — honest absence, not fake affordance.

### P7.4 — starting state and reinforcement
> "How do approach, scouting, surprise, formation, stealth, room use, occupant routine, doors,
> alarm state, reserves, escape routes, and reinforcements determine fair initial positions and
> later arrivals rather than camera-friendly placement?"

**Disposition: INHERITED.** C2D already binds deployment to established location/approach/legal
terrain with a deterministic formation resolver and non-rerollable placement; F10.3n/o bind
reinforcements to true initiative tiers ("insert into the remaining future, never rewrite the
past"); W2's operating state + cadence law supply occupant routine and alarm posture; SRD owns
surprise/stealth mechanics; W4 owns doors/escape routes. FABLE-PROPOSED thin addition: an
**EncounterStart receipt** that records the compiled inputs (approach vector, alertness, room
use, reserves) so fairness is auditable and replayable. Phase: PRE-ALPHA CRITICAL (it is C2D's
deployment content). Clay: C1D/C2D.

### P7.5 — action and resource economy
> "How do standard actions, movement, reactions, bonus actions, checks, saves, item uses,
> spells, help, preparation, simultaneous/cooperative effort, and scene-specific operations
> share one declared-and-detected mechanical contract?"

**Disposition: INHERITED + FABLE-PROPOSED schema.**
Inherited: SRD action economy verbatim; EVENT-CONTRACT's detected>declared doctrine; W10 §11.6's
dual-input law (UI selection and natural language both compile into one validated
`ActionIntent`); explicit payment sources (no auto-Dash); typed participation windows (P6.9).
Proposal: the **ActionIntent/ActionReceipt pair** as the single combat-and-crisis contract:
intent = {actor, action-economy slot, target domain (entity/object/point/area/self), payment,
parameters}; receipt = validated outcome + consumed windows + emitted consequences. Scene-
specific operations (man the pump, slam the portcullis) are typed operations registered by their
owners (W5 interactables, W8 mutations, G2.2 crisis contributions) consuming the same slots.
Cost: engine M-L (this is the combat-core program W10 already priced); QA M. Phase: PRE-ALPHA
CRITICAL. Seam: intent/receipt schema + target-domain typing (Fire Bolt entity vs Fireball
point/area — W10 §11.6). Clay: C1D; MVP gate C1E. Owner: this record (schema), SRD (economy).

### P7.6 — enemy environmental intelligence
> "How do creatures and factions select tactics from canonical goals, abilities, knowledge,
> morale, coordination, and perceived terrain; learn or adapt lawfully; and avoid perfect
> omniscience, scripted stupidity, or reactive difficulty scaling?"

**Disposition: FABLE-PROPOSED mechanism + OPEN-ADAM posture (Q7-A, §16.4).**
Inherited constraints: viewpoint knowledge binds enemies too (no omniscience — W1 §8.15's scopes
apply to NPCs); no reactive scaling (locked, multiple sources); morale binds (MONSTER-TACTICS's
built morale seam); hostile adaptation needs causal windows (G2.1.8).
Proposal: deterministic **tactic scoring** — each combat-capable actor draws candidate actions
from its real abilities, scores them against canonical goals, morale, its *known* subset of the
kernel's terrain answers (perception-filtered), and a bounded doctrine/personality profile
(MONSTER-FLAVOR seam); the script proposes, the DM may overrule *decisions* only within its
authority (script-owns-numbers law). Learning = knowledge receipts (a goblin that watched the
ambush knows the corridor), never hidden stat changes. What remains genuinely Adam's is the
default acumen posture — how ruthlessly the scorer plays — presented as Q7-A below.
Cost: engine M, authoring M (doctrine profiles), QA M (golden tactic fixtures). Phase:
PROOF→MVP→GOAL (proof: one archetype family in the retained room; MVP: representative bestiary
archetypes; goal: faction-coordinated squads via W9 strategy draws). Seam: score inputs =
kernel + knowledge + morale receipts. Promotion: playtest comprehension/fairness evidence.
Debt: v1 squads coordinate only via shared doctrine, not planning. Clay: C1D/C1E. Owner: this
record; W9 owns faction-level strategy.

### P7.7 — arbitrary creative intent
> "How does the player attempt anything physically/socially/magically plausible; how do engine
> owners expose legal primitives and stakes; and when may the semantic resolver create a new
> affordance, technique, tool, or consequence without bypassing checks or resource cost?"

**Disposition: INHERITED.** This is the already-locked creative constitution applied in tactical
space: "Open intent, constrained outcome"; Lane A fast-path / Lane B compositional plans over
registered primitives / Lane C novel rulings; the semantic resolver and SYNTHESIZE envelope with
C0-C4 authority and least-new-mechanics routing; checks/costs always resolve through the real
CheckContract; W5's evidence-gated physical-improvisation reserves. Wave 7 adds (FABLE-PROPOSED,
thin): stake exposure — the pre-roll CheckContract's stakes and the kernel's legality answer are
surfaced to the player in the same breath (F4.9a's qualitative-danger pattern), so "I swing from
the chandelier" gets cost/DC/consequence before dice. Phase: MVP (Lane B tactical breadth);
proof = one creative-action trace in C1D/C1K. Owner: W2 G2.1 (constitution); this record
(tactical stake exposure).

### P7.8 — honest failure and momentum (with G7.1)
> P7.8: "Under G7.1, how does a failed action miss its declared objective while producing
> proportional new position, cost, exposure, threat, partial information, complication, or
> alternate affordance only when licensed by the pre-roll contract?"
> G7.1: "How does a failed action honestly miss its declared objective while still creating a
> concrete complication, changed position, cost, threat advance, exposure, or new affordance
> that keeps play moving?"

**Disposition: INHERITED principle + FABLE-PROPOSED contract detail.**
Inherited: "Failed rolls must honestly miss their declared objective while creating real
complications or affordances rather than secret success" (W2 improvisation boundary, DESIGN.md
2026-07-22 block); margin-graded degrees of failure (near-miss tight); fail-forward Charter
default; nat-1 ladder (W2 §10.11.46).
Proposal: the **failure clause of the CheckContract** — before dice, the contract records the
declared objective, stakes, and which typed complication families are licensed (position change,
resource/time cost, exposure/notice, threat-clock advance, partial information, new affordance);
on failure the engine selects within license by margin, and the DM narrates the selected fact.
No complication outside the licensed families; no un-narrated silent complications; never secret
success. G7.1 is thereby answered as mechanism, not vibe.
Dungeon example: failed Athletics to shoulder the portcullis — margin −2: it holds but the bar
bends (new affordance: leverage point, +2 next attempt); margin −7: it holds, the clang advances
the alarm clock.
DM-seat: fallback clause renders the selected complication family in fiction; a provider cannot
substitute a different consequence.
Cost: engine M, QA M. Phase: PRE-ALPHA CRITICAL (it guards trust). Seam: CheckContract failure-
license fields. Clay: C1B (movement checks) / C1D. Owner: this record; sources: W2 boundary +
Charter §6.

### P7.9 — cooperation, setup/payoff, and Style/Combo (with G7.2)
> P7.9: "Under G7.2, what rewards synchronized intent, callbacks, environmental setup,
> sacrifice, timing, and multiple-character contribution without fabricating die results,
> multiplying actions, bypassing limits, or trespassing on Crit Magnitude?"
> G7.2: "What bounded `Style/Combo` rules reward synchronized creativity, callbacks,
> setup/payoff, and multi-character contribution without fabricating a natural result,
> bypassing action economy, enabling crit fishing, or trespassing on Crit Magnitude?"

**Disposition: INHERITED constraints + FABLE-PROPOSED bounded mechanism.**
Inherited: typed participation receipts (G6.2); Help/advantage/cover as the SRD's own
cooperation currency; reward-anchor law and the 16-19 bounded reward *spreads* (W2 §10.11.36-44);
"Style/combination rewards must not counterfeit crit authority" (W2, DESIGN.md 2026-07-22);
no invisible action economy (G6.2); callback legality via the relation-mode lanes (G2.1.4).
Proposal — **StyleReceipts, spend-side only**: qualifying play (declared setup consumed by an
ally, meaningful sacrifice, motif callback landed, synchronized timing through real Ready/Help
actions) mints a bounded style receipt. Receipts never touch dice, action economy, or crit
eligibility; they spend only through existing sinks — Inspiration (SRD-capped), reward-spread
eligibility when a 16-19 crit already fired, and DM color obligations (the beat gets narrated
as the cool thing it was). Environmental setup itself resolves as real state (tip the brazier =
a W5/W8 mutation that changes the kernel's answers) — the "combo" is world truth, not a bonus.
Cost: engine S-M, QA S. Phase: PROOF→MVP→GOAL (proof: one setup/payoff trace; MVP: receipts +
Inspiration sink; goal: motif-aware style vocabulary with W9's deck). Seam: receipt type +
sink registry. Promotion: soak evidence that play *feels* rewarded without inflation. Debt: v1
style vocabulary is small; silence is a valid style. Clay: C1D/C1E. Owner: this record under
W2's crit law; W9 owns motif sourcing.

### P7.10 — risk, reward, retreat, and non-victory
> "How do danger/reward profiles, telegraphs, readable skill opportunities, escape, surrender,
> parley, rescue, pursuit, objective completion, and unwinnable encounters remain brutal but
> fair across improvised reshaping?"

**Disposition: INHERITED.** The fairness stack already exists: SCENE-RISK-CONTRACT (danger/
reward bands, telegraphs, escape modes, death stakes on every walk); brutal-but-fair and
telegraphed-lethality Charter law; unwinnable-iff-flight-telegraphed; the built chase system +
CHASE-BITE; MONSTER-PARLEY/SOCIAL for surrender/parley; W4 traversal transactions for pursuit
and escape routes; rescue via typed participation; effective-access-depth risk scheduling (W1).
FABLE-PROPOSED integration only: the EncounterStart receipt (P7.4) carries the scene's
risk-contract slice so telegraphs and escape-route existence are auditable per encounter, and
retreat compiles as a first-class validated route intent (never DM fiat). Non-victory outcomes
(objective complete, withdrawal, surrender, capture) end combat through COMBAT-LIFECYCLE's
existing reasons extended by typed dispositions. Phase: MVP. Clay: C1D/C2N (pursuit/rescue).
Owner: SCENE-RISK-CONTRACT + this record's integration note.

### P7.11 — encounter reconfiguration and aftermath
> "How do changed terrain, opened routes, alarms, morale, reinforcements, casualties,
> loot/custody, fleeing actors, environmental spread, and unresolved objectives persist when
> combat begins/ends or the party leaves?"

**Disposition: INHERITED.** P10.9's law is exactly this: combat reconfigures the established
scene through SceneLineage; aftermath is explicit before relevance-based compaction; casualties
resolve through TerminalDisposition + ITEM-LEGACY custody; fleeing actors become site/cold
records (CHASE-SOFT-RECALL pattern, cold-record law); alarms/morale persist as site operating
state and clocks; environmental spread hands to Wave 8 owners; unresolved objectives stay
obligations in the DM hand. FABLE-PROPOSED thin addition: a **CombatEnd fold receipt**
enumerating tactical deltas (terrain changes, opened routes, dropped custody, active hazards)
that the site/lineage owners must acknowledge — so nothing persists only in board memory.
Phase: PRE-ALPHA CRITICAL (C2D's aftermath content). Clay: C2C/C2D. Owner: P10.9 law; this
record's fold receipt.

### P7.12 — Wave 7 acceptance corpus
> "Which tactical archetypes, noncombat crises, creative actions, failures, cooperative chains,
> enemy strategies, scale mixes, retreats, environmental transformations, and replay traces
> prove legality, variety, fairness, intelligence, and visual readability?"

**Disposition: FABLE-PROPOSED (structure) + EVIDENCE-GATED (thresholds).**
Proposal: the P6.12 pattern — an incremental tactical-risk overlay on the retained fixtures,
never a separate showcase corpus. Minimum archetype families to accumulate, each admitted only
when it covers a missing risk: open assault · chokepoint defense · elevation fight · hazard
fight (fire/fluid once W8 supplies state) · stealth-open → alarm escalation · retreat + pursuit
· parley pivot mid-combat · rescue/cooperative crisis (noncombat, G2.2-driven) · creative-action
trace (Lane B) · honest-failure trace (each licensed family) · mixed-scale fight (Large+ vs
party, BodyForm truth) · replay/interruption trace. Each fixture keeps deterministic seeds,
expected receipts, and captures at the fixed camera. Thresholds/counts are measured outcomes
(P10.12 process), not authored today.
Clay: grows C1D/C1E/C2C/C2N; gates via the ledger's existing combat rows. Owner: this record +
P10.12 evidence law.

## 16.3 Generated follow-up

### F7.1 — the stealth/detection contract (material, engine-owned)
The bank covers sight/cover but stock stealth resolution is famously loose at a table; an
engine must pick one deterministic reading. **FABLE-PROPOSED:** passive Perception is the
standing floor against a committed Stealth check; active Search is an action consuming the
kernel's LOS/light/obscurement answers; hiding legality derives from cover/concealment state;
detection state transitions (unaware → suspicious → alerted) are typed receipts feeding alarm
clocks (P7.4). The SRD's wording stays authoritative; the contract only fixes evaluation order
and state storage. EVIDENCE-GATED: the suspicion-threshold feel needs playtest calibration.
Phase: MVP (stealth-open is a corpus archetype). Clay: C1D variant. No founder fork: this is
rules-reading, reversible, and SRD-bounded.

## 16.4 The founder question (easy batch, one item)

### Q7-A — default enemy tactical acumen posture (OPEN-ADAM)
How ruthlessly should the tactic scorer play its hand *by default*? All options obey the locked
constraints (real abilities only, viewpoint knowledge, morale binds, no reactive scaling).

- **A. Flavor-first.** Creatures favor their MONSTER-FLAVOR/doctrine color over optimal play;
  only INT 16+ or doctrine-drilled foes fight cleverly. Feel: pulpy, forgiving of positioning
  errors. Cost: lowest; risk: undercuts "hard & dangerous."
- **B. Doctrine/INT-tiered competence (recommended).** Baseline animals fight like animals,
  trained troops use cover/focus/withdrawal doctrine, INT-high foes exploit kernel affordances
  well; cruelty scales with the fiction. Matches P5 hard-but-fair and telegraphed lethality;
  playtest may tune tiers without reopening the wave.
- **C. Ruthless-optimal default.** Every combatant plays near-optimally unless flavor forbids.
  Maximum danger; risks "scripted-perfect" feel and punishes the solo PC beyond the telegraphed
  fairness contract.

Recommendation: **B**, with the acumen tier stored as a centralized versioned control surface
(W2 §10.11.42 law) so a later campaign profile could offer C.

#### Founder ruling — 2026-07-22 (Adam, Batch 1)

**Q7-A: B.** Adam's answer, verbatim: "B." Default enemy tactical acumen is doctrine/INT-tiered
competence — animals fight like animals, trained troops use doctrine, INT-high foes exploit
kernel affordances; cruelty scales with the fiction. Stored as a centralized versioned control
surface per the recommendation (W2 §10.11.42 law), so flavor-first and ruthless-optimal remain
selectable campaign-profile candidates later. **Q7-A is LOCKED.** The scoring mechanism itself
(P7.6's FABLE-PROPOSED component) still awaits the Wave 7 sweep.

## 16.5 Coverage and authority audit (proposed)

All 14 bank questions dispositioned; 1 generated follow-up (F7.1); 1 founder item (Q7-A).
Authority: Wave 7 owns tactical laws over W3-W6 truth beneath W10's projection contract; it does
not touch mutation ownership (W8), card scheduling (W9), or renderer/initiative presentation
(closed W10). No contradiction with closed waves found while drafting; the facing/flanking
rejected-default is recorded against the SRD rules-posture law, reopenable only by Adam as a
rules bend. Ledger reconciliation: see [PHASING-AUDIT.md](PHASING-AUDIT.md). **No closure is
claimed; no implementation is authorized.**

## 16.6 Wave 7 sweep — 2026-07-22 founder review (Adam)

Adam swept the thirteen items (P7.1-P7.12 + F7.1) in the plain-language founder review.
Verbatim rulings and their dispositions:

1. **P7.1 — ACCEPTED (delegated), with a founder vision captured.** First response: "i'll
   trust your ruling here." On the plain-language re-present: "ok, this is kind of pivotal.
   in real life the DM can decide when and where to bend the rules, and they always find some
   way to balance or explain it and fit it into the rules going forward. I can see how that
   opens up an entire universe of problems and exploits but it would be the best feature of
   all time if we could get it to work." → The kernel stands as proposed; the rule-bend
   aspiration is captured as **F7.2** below, not as a change to kernel/SRD authority.
2. **P7.2 — ACCEPTED.** "yeah, i think that's true." (Earlier: "your call.")
3. **P7.3 — ACCEPTED, expansion noted into F7.2.** "this is the safest approach, though we
   might want to expand on this in the future if we can prove that the DM reliably makes
   sound decisions outside of the bounds and knows how to reconcile those decisions back
   into the bounds."
4. **P7.4 — ACCEPTED, founder rationale recorded.** "yes, because there might still be time
   to talk your way out of a fight once initiative is rolled, depending on what started
   combat, that is one reason among many to capture the combat paper trail." (Aligns with
   the parley-pivot archetype in P7.12 and MONSTER-PARLEY.)
5. **P7.5 — ACCEPTED, interpretive split confirmed.** "yes, i think the DM decides what that
   means. 'I shove the brazier at him' will count as an action, and the DM will need to
   decide if that requires a Strength check, sleight of hand check, or a throw. Yeah? The
   idea is basic stuff like spells and attacks can be done through UI easily, but weirder
   more creative stuff you want to declare to the DM, basic stuff can also be declared to
   the DM." → Confirmed in session as exactly the dual-input law: UI fast-path and declared
   intent compile to one ActionIntent; choosing the check/framing is the DM's interpretive
   job; the engine validates legality and owns every number.
6. **P7.6 — ACCEPTED.** "most definitely, this is core to the idea of D&D."
7. **P7.7 — ACCEPTED with an open display amendment (DC timing) + a new founder feature.**
   "yeah, but the DC isn't revealed to the player until they ar ecommited to the roll right?
   or is that too clunky? sometimes knowing the DC is less fun. I am open to debate. Also
   one last feature I want in this game, I want a mode that allows players to roll their own
   dice and report the numbers. That will let them cheat but who cares, it's fun to roll
   your own dice." → DC-timing resolution pending in session (recorded at the closure
   section when it lands); the physical-dice mode is captured as **F7.3** below.
8. **P7.8 — ACCEPTED with the crit carve-out made explicit.** "true, but critical fails can
   get out of hand by design." → The failure license governs ordinary margin-graded failure;
   natural-1 escalation resolves through the W2 nat-1 ladder / Crit Magnitude authority,
   which may exceed the ordinary licensed families — by design — while remaining bounded by
   the crit system's own ladder. No change to either owner; the boundary is now recorded.
9. **P7.9 — ACCEPTED at MVP scope; goal tightened.** "cool moment for now, potential reward
   system in the future once we know how to measure cool." → MVP = color + Inspiration sink;
   the richer reward vocabulary is a feature goal whose promotion evidence is a working
   measurement of "cool" (the soak instrument), not taste.
10. **P7.10 — ACCEPTED with the no-exit carve-out.** "I would say ALMOST every fight has an
    exit, by design yes they should all theoretically have an exit, but I can also imagine
    rare scenarios that are fight to the death, like if you find yourself in a gladiator
    arena. We don't really want the game swooping in and saving you. But the player in
    desperation might be able to come up with a clever solution that the DM can then rule is
    a way out of certain doom." → Exits are the strong default; a diegetically-true no-exit
    scene is legal when telegraphed as such (consistent with unwinnable-iff-flight-
    telegraphed — here the telegraph is "no flight"); the engine never swoops in to rescue;
    the creative lane (P7.7 / G2.1) remains the honest path to an invented exit under real
    checks and costs.
11. **P7.11 — ACCEPTED, law sharpened.** "it's either still true or a clock has passed and a
    clean up crew, looters, rebuilders, or something else has come thru and changed the
    state, but there is no unexplained reversion to a previous state." → Recorded as the
    **no-unexplained-reversion law**: post-combat state changes only through owner-driven,
    clock-passed causes. (Cross-confirms Q8-A's persistent-until-repaired default.)
12. **P7.12 — ACCEPTED.** "yes."
13. **F7.1 — ACCEPTED.** "yes."

Open before closure: the P7.7 DC-timing amendment (recommendation presented in session; Adam
to rule).

### F7.2 — DM rule-bend-and-reconcile authority (founder vision; deferred feature goal)

Generated from Adam's P7.1/P7.3 sweep language (verbatim above): the human-DM superpower of
bending a rule in the moment and reconciling the bend back into the ruleset going forward —
"the best feature of all time if we could get it to work." Disposition: **DEFERRED feature
goal, evidence-gated** — not a Wave 7 mechanism; no change to kernel/SRD authority now.
Routing: the constitution that would host it is the closed W2 G2.1 creative family (C0-C4
authority, SYNTHESIZE lane) plus GEN-DM-8's "DM seat proves itself" conformance ladder. Its
promotion trigger is Adam's own P7.3 phrasing — proof "that the DM reliably makes sound
decisions outside of the bounds and knows how to reconcile those decisions back into the
bounds." Seam retained: **rulings-as-receipts** — every bend recorded as an explicit,
versioned ruling object a future reconciliation pass can promote into the ruleset, the same
shape as G2.1's precedent capture (P0-P4). Expanding it is an explicit Adam decision at that
evidence, through the W2 reopen law, never silent drift.

### F7.3 — player-rolled physical dice mode (founder feature request)

Verbatim (P7.7 sweep): "I want a mode that allows players to roll their own dice and report
the numbers. That will let them cheat but who cares, it's fun to roll your own dice."
Disposition: **ACCEPTED as a tracked feature goal.** Shape: a dice-source abstraction on the
check/roll pipeline — {engine-rolled | player-reported} — with receipts marking provenance;
player-reported honors the number as reported (cheating is the player's own table, by
ruling). Aligned with the standing DM-agency law "never roll the player's dice." Phase:
feature goal (post-MVP); seam: dice-source field on roll receipts; rides this wave's ledger
reconciliation at acceptance rather than adding a top-level row today. Owner: this record;
the roll pipeline hosts.

## 16.7 Wave 7 closure — 2026-07-22 (Adam)

**DC-timing resolution (the P7.7 amendment):** recommendation accepted. Pre-commitment, the
player receives the qualitative difficulty read plus the licensed failure stakes — no number;
the exact DC is revealed at commitment, shown with the roll (dice stay transparent and
un-fudgeable); a per-player setting flips to always-show or never-show, defaulting to
reveal-at-commit. Adam, verbatim, in response to the recommendation and the closure ask
together: "yep, sounds great."

**Closure:** Adam explicitly closed Wave 7 in the 2026-07-22 founder-review session — the
sweep at §16.6 (all thirteen items ruled, verbatim), the phasing audit as presented (four
pre-alpha-critical contracts; the proof→MVP→goal table; ledger refinements plus the
tactical-corpus line), and the amendments recorded above (crit carve-out, no-exit carve-out,
no-unexplained-reversion law, MVP-scoped Style, DC timing). Wave 7 is **CLOSED on its
recorded phased basis**: design disposition and traceability only; no implementation,
evidence, dependency, or release claim; the implementation hold stands until Wave 12's gate.
Reopening requires an explicit named contradiction per the reopen law.
