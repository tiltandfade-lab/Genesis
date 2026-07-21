---
type: design-study
status: CLOSED
wave: 2
part: 4
legacy_sections: "10.11.25-10.11.57"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 2 — Question 11, Part B

<!-- BEGIN VERBATIM MIGRATION: original lines 9802-12180 -->

#### 10.11.25 Skeptical follow-up 9 — the DM may not narrate an event the engine rejects

The final queue item attacks the boundary between AI performance and engine truth. A model can narrate,
“You wrench the loose stool free, jam it into the gears, and the gate crashes open,” while its emitted
object assertion or gate event later fails because the stool had no legal reserve, the gate was already
destroyed, the target version changed, or the action lacked a required method. If the player has read the
success prose, quietly recording `applied.ok:false` does not repair the lie.

Genesis also cannot solve this by adding a separate proposal and narration model call to every ordinary
action; that would violate the accepted one-call routine path and first-token targets.

##### Option 1 — narrate freely, then apply whatever events validate

This preserves speed and DM freedom but lets prose and canon diverge, allows partial event batches, and
teaches the player that described success is unreliable. **Rejected.**

##### Option 2 — proposal call, engine validation, then narration call on every turn

This can make the final narration consistent with accepted state, but doubles routine model latency and
cost, creates more failure seams, and makes environmental interaction sluggish. **Rejected as the normal
path.** It remains legal for rare genuinely ambiguous/high-impact actions.

##### Option 3 — engine-first resolution receipts plus guaranteed tokens and a buffered commit header

Most actions follow one of two single-call-safe paths:

1. **Pre-resolved action:** the engine already owns the target, rules, open roll/result, inventory,
   resource cost, witnesses, and event consequences. It commits or version-locks the resolution and sends
   the DM a `ResolutionReceipt` describing only facts it may narrate.
2. **Guaranteed choice:** the active digest offers a small set of prevalidated, version-locked action or
   latent-affordance tokens. The DM's structured response begins with a hidden compact commit header that
   selects among those guaranteed choices. The engine validates and atomically applies that header before
   releasing consequential narration from the same streamed model call.

Illustrative receipt:

```text
turn id + base world version + nonce/expiry
player intent and direct target ids/versions
resolved roll/check/result and resource changes
selected prevalidated action/affordance token
atomic core event batch and dependent post-commit reactions
knowledge/witness scopes and observation changes
narration license: success/failure, established nouns, consequences, uncertainty, and prohibited claims
```

The DM may interpret, phrase, pace, characterize, and sensorially realize the receipt. It may not promote
a failed attempt to success, invent an unlicensed consequential object, change a target, or narrate an
uncommitted mutation.

##### Transaction boundary

```text
player action
  -> engine resolves common mechanics and/or supplies guaranteed tokens
  -> one model stream emits hidden structured commit header first
  -> schema + target/version + knowledge + resource + token validation
  -> atomic application of the core transaction
  -> consequential narration is released/streamed under the accepted receipt
  -> independent causal reactions schedule from committed truth
```

The commit header is small and buffered rather than shown to the player. On the pre-resolved path there
may be nothing left for the DM to select. On the guaranteed-choice path, every offered token is already
legal at the locked version, so ordinary validation should be a fast acceptance rather than a solver or
second AI round trip.

Event batches distinguish:

- **atomic core:** mutually dependent facts either all apply or none do—the stool is committed, consumed,
  inserted, and the licensed gate state changes together;
- **derived reactions:** guard response, faction knowledge, noise propagation, or later mechanical
  consequences derive from the committed core and may schedule as explicit events;
- **optional color:** prose that changes no canon and stays inside the prevalidated contextual reserve.

##### Ambiguous and high-impact path

If the engine cannot identify the intent/target, no guaranteed token covers it, or the action could cause
a major topology, identity, contract, death, ownership, realm, or irreversible resource change, use a
rarer preflight:

```text
intent/proposal without success narration
  -> engine resolution/clarification/roll
  -> accepted receipt
  -> final narration call
```

The UI acknowledges immediately and may present neutral attempt framing, but it does not stream a claimed
outcome before resolution. This exceptional path is measured separately and must not become the default
for ordinary inspection, movement, conversation, inventory use, attacks, checks, or prevalidated dressing
interaction.

##### Failure and race behavior

- Single-player actions receive P0 version priority; lower-priority background mutation cannot race a
  locked direct target. State-changing background results enter through versioned events between safe
  commit points.
- A stale/invalid header exposes no consequential prose. The engine rebases where deterministic, uses a
  safe receipt-grounded fallback narration, or performs one explicit retry/preflight; it never shows the
  invalid success and quietly drops the event.
- Invalid optional side events cannot partially survive if their narration depends on the rejected core.
- Every committed receipt, selected token, applied event, rejection, fallback, latency, and visible
  narration id is logged for replay and contradiction testing.
- The engine must offer deterministic safe fallback wording for common outcomes so a malformed model
  response does not require lying or freezing the game.

##### Honest limit of prose validation

No schema can mathematically prove that unrestricted natural-language prose contains no unsupported
implication. Genesis narrows this risk by making consequential claims receipt-bound, forcing the commit
header before visible result prose, restricting improvisable physical nouns to contextual reserves,
partitioning knowledge before prompting, and testing narration against adversarial fixtures. Absolute
semantic proof would require a second interpreter/critic or templated prose and would violate either
latency or DM freedom. The acceptance claim must therefore be precise: **mechanical and canonical outcome
claims are transactionally grounded; residual descriptive drift is monitored and corrected, not falsely
declared impossible.**

##### Recommendation

Adopt Option 3. Resolve common mechanics engine-first, let the DM select only guaranteed version-locked
tokens when choice remains, validate/apply a hidden commit header before releasing consequential prose,
and reserve the two-stage preflight for genuinely ambiguous/high-impact actions. Treat narration/event
divergence as a failed turn protocol, not an ignorable event error.

**Open follow-up:** does this strike the right balance—one streamed call remains the routine path and the
DM retains expressive narration, but every consequential success/failure/object/mutation claim must rest
on an engine-owned receipt or guaranteed token committed before the player sees the result?

#### 10.11.26 Follow-up — guaranteed tokens are a fast lane, never the player's action menu

Adam identifies the central product risk: transactional truth sounds necessary to make the game work,
but if players may act only through prevalidated tokens then creative players are heavily limited. The
beauty of an AI DM is that it can respond to almost anything; the corresponding failure is an
over-permissive DM that lets desire substitute for possibility.

That objection is correct. If Option 3 means a whitelist of legal commands, it fails Genesis's existing
open-handoff law and the D&D soul of the redesign. The indexed research supports semantic affordances,
hard/soft constraints, hierarchical assemblies, and candidate validation, but it does not solve open-ended
AI adjudication. Genesis must add a compositional ruling layer rather than misrepresent the papers or
turn their constraint vocabulary into a menu.

The product law should be:

> **Open intent, constrained outcome.** The player may attempt anything expressible in the fiction. The
> engine and dice determine whether the required entities, properties, access, time, capability, cost,
> uncertainty, and consequences support success. The AI may never grant success merely because the idea
> is vivid or the player asks confidently.

The visible handoff remains open; no numbered action menu is presented. Guaranteed tokens accelerate
common and already-licensed actions behind the screen. They do not define the limit of imagination.

##### Three resolution lanes

###### Lane A — receipt/guaranteed fast lane

Movement, ordinary inspection, inventory use, known attacks/spells, conversation, established
interactables, common checks, and contextual latent affordances resolve engine-first or through guaranteed
tokens. One streamed call remains normal.

###### Lane B — compositional creative-action lane

The AI compiles arbitrary player language into a structured plan made from registered semantic
primitives and canonical properties:

```text
intent and desired effect
targets and referenced/required objects
primitive operations and ordering
method, tools, capabilities, spell/rules authority
preconditions and physical/social/magical constraints
time, resource, exposure, noise, ownership, and collateral costs
uncertainty/check/DC or deterministic result
core state effects and dependent consequences
```

Useful cross-domain primitive families include:

- inspect, compare, trace, reveal, and test;
- take, carry, drag, throw, place, wedge, tie, attach, support, and combine;
- open, close, lock, block, break, damage, disable, repair, and restore;
- ignite, extinguish, heat, cool, pour, mix, contaminate, clean, release, and contain;
- climb, cross, dig, brace, redirect, signal, conceal, distract, lure, and create cover;
- ask, bargain, persuade, deceive, threaten, impersonate, recruit, testify, and coordinate;
- deliver, steal, ration, substitute, reroute, sabotage, protect, and expose operational flows.

These are semantic operations, not promises that every verb works on every target. They compose against
material, scale, condition, attachment, mobility, containment, flammability, load-bearing, visibility,
ownership, access, knowledge, motive, doctrine, resource, topology, and realm-law facts. Qualitative bands
and typed effects handle most play; Genesis does not need a molecular physics simulation.

The model may propose a plan in the hidden commit header. If every operation and consequence validates,
the same-call narration proceeds. If the plan needs a ruling or legal repair, no claimed outcome is
released and it moves to Lane C.

###### Lane C — negotiated novel/high-impact ruling

A genuinely ambiguous, multi-step, unsupported, or irreversible proposal receives preflight. The AI
proposes an `ActionPlan` without success prose; the engine resolves targets, properties, checks, time,
costs, effects, and legal event channels; then the DM narrates the receipt. The extra latency is the price
of preserving a rare creative action, not a reason to forbid it or to slow every routine action.

When no bespoke mechanic exists, the engine should resolve at the highest honest generic effect level it
supports—object state, position/access, condition/hazard, resource/flow, advantage/check modifier,
knowledge, relationship, progress/clock, or explicit topology event—and store a provenance-bearing
`RulingReceipt`. Repeated materially equivalent attempts consult the precedent/signature so the DM does
not give contradictory rulings simply because the phrasing changed. Precedent remains context-sensitive;
one wooden tavern door does not establish that the same trick works on a planar vault.

##### Honest adjudication ladder

A creative proposal may produce:

```text
automatic success because the fiction and mechanics make it certain
success after a check/roll
partial success or success with a known cost/consequence
meaningful progress requiring time or several steps
failure after a fair uncertain attempt
diegetic impossibility because a required fact/method is absent
clarification because the intent or target is genuinely ambiguous
```

The engine should prefer “you can attempt it; here is what it requires or risks” over “that command is not
implemented.” It must still say no when canon, physics, realm law, access, resources, or rules make the
attempt impossible. Freedom to attempt is not entitlement to success.

##### Concrete creative-action traces

- **Wedge the jail door with a stool:** the stool must exist or consume a legal latent furniture reserve;
  its size, strength, location, and attachment meet the door's force/state; the action commits the stool
  and door state and creates noise/witness consequences.
- **Throw flour into the air to expose an invisible creature:** flour must actually be available, dry,
  accessible, and sufficient; air movement, visibility, creature position, and turn economy determine the
  effect. The DM cannot invent flour because the tactic is clever.
- **Ignite that flour:** the engine evaluates powder concentration, ignition source, enclosure, range,
  fire/collapse risk, and collateral harm through qualitative hazard rules. It does not simply grant an
  explosion because the player knows the trope.
- **Redirect prison sewage into the hidden lab:** a multi-step plan checks discovered topology, valves or
  breach methods, elevation/flow, capacity, time, contamination, witnesses, and dependent systems. It may
  work brilliantly, partially flood the wrong zone, or prove impossible without another route.
- **Impersonate a royal inspector:** attire/documents, witnesses, institutional knowledge, doctrine,
  current alarm, relationships, and the social check matter; an AI cannot accept the title at face value.
- **Dig through a wall:** material, thickness, support role, tools, time, noise, fatigue, custody response,
  and collapse risk decide feasibility. “Not instantly” is not the same as “not allowed.”
- **Fly to the moon with no method:** the open input is accepted, but the fictional attempt cannot achieve
  the declared result. The DM responds honestly instead of rewarding confidence with a new power.

##### Freedom also requires engine breadth

This model is only a promise until Genesis builds and wires:

- a controlled but extensible property/affordance vocabulary;
- compositional action-plan and generic effect schemas;
- context/realm/rules adapters and explicit exclusions;
- target/version/ownership/knowledge/capability validation;
- deterministic checks, costs, partial effects, and event application;
- action precedents/ruling receipts and synonym-resistant identity;
- persistence, inventory, renderer, topology, resource, social, combat, and DM integration;
- graceful abstract resolution when exact simulation is unnecessary;
- production-path creative-action gauntlets rather than helper-only validation.

The papers' constraint techniques can legalize entities, space, paths, sockets, and required affordances.
They do not remove this high implementation and content cost. Claiming “players can try anything” before
the generic resolver reaches the actual DM turn path would repeat the promise-versus-implementation failure
Adam warned about.

Acceptance must sample adversarial off-book actions across environment, combat, social play, resources,
magic, groups, knowledge, and multi-step plans. Reports distinguish one-call acceptance, preflight,
clarification, fair refusal, invalid-model proposal, fallback, latency, state persistence, and repeat-
ruling consistency. The target rates wait for real traces; the freedom contract does not.

##### Revised recommendation

Retain transactional narration, but amend Option 3 explicitly:

> Guaranteed tokens are the common-action fast lane. They are never the legal-action whitelist. Arbitrary
> player intent enters a compositional action planner; genuinely novel or high-impact plans receive a
> slower engine-owned ruling. The engine should support broad generic consequences and honest costs while
> refusing impossible outcomes. Consequential narration still waits for the accepted receipt.

This aims for the tabletop virtue—responsive rulings over open intent—without the AI-DM vice of saying yes
to everything.

**Open follow-up:** is this the freedom boundary you want: the player can type and attempt anything, common
actions stay fast, creative combinations are validated compositionally or receive a rarer ruling pass,
and the engine may answer yes, roll, partial/cost, progress, failure, impossible, or clarify—but the AI may
never convert open-ended input into automatic success?

#### 10.11.27 Critical implementation follow-up — mechanizing Crit Magnitude as real world change

Adam accepts rolls and identifies the critical implementation: Genesis's Crit Magnitude system is
intended to occasionally produce a level of insanity that genuinely breaks reality. The compositional
action and transactional-narration model must therefore distinguish “this attempt is impossible” from the
rare dice result that is explicitly licensed to force a new impossible thing into canon.

##### What already exists

The locked `CRIT-MAGNITUDE.md` rule and current engine provide a strong dice ritual:

```text
natural 20 or natural 1 on a d20 action
  -> openly roll a second d20 for magnitude
  -> first die sets triumph/disaster
  -> magnitude sets Standard / Amplified / Mythic band and nominal scope
  -> Amplified/Mythic draws distinct success/failure lenses
  -> the place lens may hand off to the Myth suite
```

`src/engine/crit.js` implements the band lookup and lens draw. `resolveCheck` gives natural 20 automatic
success, natural 1 automatic failure, and computes `absurdity`—how far the natural result defied the DC
math. Combat threads magnitude without adding damage. `crit_outcome` writes an abstract Ledger entry;
Mythic results use the `canon` ledger type, and theater code can play an `absurdity` effect.

That is not yet the promised world-mutation system. The current event does not:

- permanently alter the person named by a person lens;
- create the object/entity promised by a creation lens;
- add a legal passage/Breach/topology mutation;
- install and enforce a local law of nature;
- create a mechanically meaningful bond, debt, name-power, fate tilt, boon, curse, or permanent wound;
- reveal knowledge through the correct witness/holder boundary;
- end/amplify a threat through its actual owner;
- create the immediate and deferred manifestations of the cascade;
- atomically validate that the AI's filled-in outcome matches the rolled lenses before narration.

Today the lens is mostly prose plus a Ledger label. That is exactly the promise-versus-implementation gap
the redesign must not carry forward.

##### Concrete inconsistencies found in the current seam

1. **Standard magnitude 8–10 currently reaches reality-tear presentation and combat obliteration.** The
   locked success band says magnitude 1–10 is a standard critical success with no lens, yet theater treats
   `magnitude >= 8` as `absurdity`, and a confirmed killing blow at that threshold may obliterate the
   target. If retained, obliteration must be an explicitly separate combat-presentation rule; it cannot
   silently redefine the Standard band as Mythic.
2. **The coded Mythic “full cascade” is exactly three lenses.** The spec says 3+, and the canonical
   Lathander example contains at least place transformation, permanent person change, hidden-truth reveal,
   and enduring bond—four distinct lenses. The implementation cannot currently reproduce its own example.
3. **`absurdity` is computed but not consumed by `rollCritMagnitude`.** Comments say it feeds the lens,
   but the magnitude atom does not accept or retain it.
4. **Amplified lens permanence is not mechanized.** An `outcome` ledger line may remain, but the actual
   NPC, topology, law, knowledge, faction, threat, item, and capability state do not change.
5. **Lens dice/count and reality authorization are not one transaction.** The engine can know the vector
   while leaving the AI to invent an unvalidated consequence afterward.

These are redesign findings, not implementation authorization in this session.

##### Rejected mechanical approaches

- **AI narration plus abstract Ledger entry:** current approach; expressive but does not make the world
  obey the result.
- **A bespoke outcome table for every verb, target, purpose, realm, and stakes combination:** would create
  an impossible Cartesian corpus and still miss creative combinations.
- **A generic numeric multiplier to damage/reward:** destroys the count×intensity/lens design and cannot
  create the Light of Lathander, a hell-wound, a bond, a truth revelation, or a new law.

##### Recommended pipeline — Check Contract to Crit Mandate to atomic Cascade Plan

###### Step 0 — earn roll permission before dice

The action resolver first decides that meaningful uncertainty exists. It records a `CheckContract`:

```text
declared intent and achievable standard effect
targets, method, tools/capabilities, and current versions
DC/rules source and normal success/failure envelope
stakes, threatened values, witnesses, knowledge boundary, and causal anchors
protected canon and legal event/effect families
```

Certain actions resolve without a roll. Fictionally impossible actions receive no roll and therefore
cannot be spammed until a 20/20 creates the requested power. Flapping bare arms to fly to the moon does
not receive a check. Attempting an unstable lunar ritual with a real planar method may receive one; a
20/20 could then permanently open a moon-road because the roll and its causal anchor were legitimate.

This is the key boundary:

> A Mythic crit may break the ordinary outcome envelope of a legitimately rolled action. It may not
> retroactively make an illegitimate no-method request into a roll.

###### Step 1 — roll the direction and magnitude openly

The action d20 resolves through the existing check/attack/save spine. A natural 20 or 1 produces the
visible second d20. Standard results receive the best/worst legal ordinary interpretation. Amplified and
Mythic results produce a stored `CritMandate`, not finished prose:

```text
check-contract id + action/scene anchors
natural + magnitude + success/failure direction
tier + reach/intensity authority + lens count
distinct lens rows and table/source versions
stakes register + absurdity/defied margin
protected invariants + allowed mythic effect adapters
```

The `absurdity` score does not secretly promote the tier—the open magnitude die owns that. It tells the
resolver how much causal bridge the outcome must visibly provide when the natural roll defied the normal
math.

###### Step 2 — replace one scalar scope with a reach vector

Local/Regional/Planar remains useful presentation, but mechanical intensity needs several dimensions:

```text
affected subjects/count
spatial/domain reach
duration/permanence
systemic depth and dependency propagation
reversibility/recovery difficulty
```

The magnitude tier grants and requires a meaningful reach envelope. Not every amplified parry must alter
an entire geographic region: permanently transforming one rival, founding a durable oath, exposing a
regional conspiracy, or changing a lineage may spend the reach through duration/systemic depth instead.
Mythic must permanently cross at least one ordinary constraint through an explicit Mythic license; it is
not merely a louder standard success.

###### Step 3 — resolve each lens through a typed effect adapter

The twelve mirrored lens pairs map to shared world systems:

| Lens axis | Required mechanical owner/effect family |
|---|---|
| Place transformed/scarred | domain/site transformation, operational/topology evidence, Myth-suite handoff |
| Person changed/broken | NPC/creature traits, motives, relationships, conditions, identity-safe events |
| New/right-or-wrong thing enters | persistent entity/item/ecology/root creation with commitment capsule |
| Passage opens/forbidden door opens | explicit topology/Breach edge mutation and access/knowledge effects |
| Local law bends | scoped realm/physics rule with target, behavior, evidence, duration, and enforcement |
| Name becomes force/curse | reputation/name-trigger rule with witnesses, territory, powers, and effect |
| Lost returns/lost beyond recovery | restoration or irreversible-loss events over an established target |
| Bond forged/debt comes due | relationship, faction, pact, obligation, inheritance, and scheduler state |
| Hidden truth revealed/dangerous truth released | canonical fact selection/creation authority, witness knowledge, evidence, propagation |
| Fate favors/turns | persistent omen/fortune modifier, attention from powers, event triggers |
| Threat broken/unleashed | threat/root/front lifecycle, dependent groups, consequences, recovery |
| Doer elevated/diminished | feature/mark/boon/curse/condition and visible character-state projection |

The AI synthesizes concrete content from the rolled lens plus the action/scene anchors, but outputs a
structured `CritEffect` for the owning adapter:

```text
lens id + causal root + anchor ids
effect family and typed payload
reach-vector spend and permanence
immediate atomic events
deferred manifestations/promises with service horizons
evidence, witnesses, and knowledge changes
recovery/reversibility, if any
source rolls, versions, and reconciliation trace
```

The engine validates existence, target/version, causal fit, tier authority, protected canon, topology,
realm rules, safety, event support, and combined-cascade coherence. A lens that genuinely cannot attach is
openly rerolled with provenance rather than silently dropped or filled with decorative prose.

###### Step 4 — weave one causal cascade, not independent miracles

All lenses share one `CausalCritRoot`. Immediate manifestations commit now; large aftermath may create
minimal durable promises and event schedules rather than eagerly generating an entire shrine, cult,
bloodline, or regional network. The Lathander result might atomically commit:

- the enduring-light local law and transformed site/domain fact;
- the bandit's permanent motive/relationship change;
- the exact hidden-operation truth he now intends to reveal and his knowledge of it;
- the enduring debt/bond;
- a sourced settlement promise that a maintained shrine can emerge through later social events.

The engine does not need to generate every future mason immediately, but none of those threads is merely
a sentence the DM may forget.

###### Step 5 — commit before consequential narration

The finished `CritCascadePlan` is an atomic core transaction plus typed deferred reactions. It becomes a
`ResolutionReceipt` under the transactional-narration law. Only after validation/application does the DM
narrate the impossible thing becoming true. If one dependent lens effect cannot apply, the engine repairs
or rerolls before prose; it never commits two lenses and quietly loses the third.

Mythic topology/law/entity creation is a legal **event**, not a retcon: the world was one way, the dice
broke it, and the provenance-preserving event changed it. Observed history remains intact.

###### Step 6 — preserve stakes without capping the insanity

The pre-roll stakes register controls harm and tone, not whether Mythic may break reality:

- low-stakes 1/1 defaults to permanent, reality-bending memorable comedy or social/material disaster;
- high-stakes 1/1 may become lethal, planar, or cosmically dark only when that danger was fairly present;
- a 20/20 remains wondrous and world-altering, but its form grows from the attempted act rather than
  granting any unrelated wish;
- no cooldown, pity timer, saturation cap, or secret downgrade may suppress honest double-crit dice.

The integrated salience system may pace the aftermath, but every rolled effect becomes canon.

##### Combat remains mechanically orthogonal

The ordinary combat crit still follows the 5.5e damage rule; magnitude does not multiply damage. Magnitude
instead controls collateral, persistent, social, environmental, threat, and mythic consequences through
the same lens adapters. A foe may be obliterated, transformed, spared into legend, exposed as something
else, become a nemesis, break a threat root, open a Breach, or mark the battlefield—but only through a
documented combat rule or validated lens/effect, not an accidental numeric threshold that conflicts with
the tier table.

##### The actual frequency must be confronted

On straight independent d20s:

- Mythic success `20/20` occurs on 1 in 400 eligible rolls (0.25%).
- Mythic failure `1/1` occurs on 1 in 400 eligible rolls (0.25%).
- Either Mythic extreme occurs on 1 in 200 eligible rolls (0.5%).
- Any Amplified-or-Mythic result on either direction occurs on 1 in 20 eligible rolls (5%).
- Across 50 eligible d20 rolls, the chance of at least one Mythic extreme is about 22%.

That may be excellent for a dice-driven world, but it is not rare if every minion attack, internal
simulation check, and batch update is eligible. The recommended interpretation of “any d20 action” is any
**surfaced spotlight action roll**: every player action check, independently narrated named-actor action,
and one explicit group/cohort roll where many minor actors are resolved together. Internal solver rolls,
background simulation, and per-minion batch bookkeeping do not get independent reality-cascade chances.
There is no hidden frequency throttle after a roll qualifies.

This preserves honest player and major-opponent dice while keeping the world's mythic frequency tied to
actual narrated action beats rather than CPU activity. The current path, which can magnitude-roll every
foe attack, needs an explicit later ruling and distribution trace rather than being assumed correct.

##### Full-cascade count recommendation

Keep Amplified major at two to three distinct lenses. Change Mythic from the coded fixed three to an open
`d3 + 2` distinct lenses (three to five, average four), which matches the spec's `3+` language and can
reproduce the four-thread Lathander example. Display the lens draws as part of the exceptional dice ritual.
If five cannot cohere, reroll incoherent lenses rather than reduce the magnitude.

##### Acceptance gates

The implementation is not complete when `critBand()` returns the correct string. It must prove, through
the actual player/DM turn path:

- every lens axis reaches its canonical owning system and persists/revisits;
- immediate and deferred cascade threads share one root and all fulfill;
- Mythic topology, realm-law, entity, NPC, knowledge, group, threat, and character mutations replay;
- impossible no-method actions cannot fish for a roll;
- high-absurdity lawful rolls visibly bridge the defied math;
- low-stakes and high-stakes 1/1 registers differ without suppressing permanence;
- no partial commit or narration/event divergence;
- repeated/missing-mod/version-upgrade saves preserve the result through commitment capsules;
- combat damage remains orthogonal and current magnitude-8 behavior is explicitly reconciled;
- roll volume reports spotlight eligibility and realized Amplified/Mythic incidence;
- latency remains exceptional but comprehensible through the visible multi-die ritual.

##### Recommendation and generated decisions

Adopt the `CheckContract -> CritMandate -> typed lens adapters -> atomic CritCascadePlan ->
ResolutionReceipt -> narration` architecture. It preserves the original two-d20 soul while turning the
result into actual engine-owned mutation rather than permissive AI fiction.

This creates three decisions to exhaust in order:

1. **Roll permission/reality boundary:** a legitimate uncertain action may break its ordinary envelope on
   a Mythic result; a no-method impossible request receives no roll and cannot crit-fish.
2. **Eligibility/frequency:** full Crit Magnitude applies to surfaced spotlight d20 actions, not internal
   or per-unit batch simulation rolls; no cooldown applies once eligible.
3. **Cascade/count and current seam:** Mythic draws 3–5 lenses rather than fixed three, and magnitude-8
   obliteration/FX is either documented as a separate combat presentation rule or reconciled to the actual
   tier/lens system.

**Open decision 1:** should Genesis lock the roll-permission boundary as recommended—the engine must grant
a real uncertain check before dice, after which a Mythic double-crit is explicitly allowed to break the
ordinary result envelope through validated lens events, while fictionally impossible no-method requests
receive no roll and therefore cannot fish for reality-breaking success?

#### 10.11.28 Ruling — legitimate stakes may include terminal catastrophe; no crit fishing

Adam emphatically accepts the no-crit-fishing boundary and clarifies the high-stakes side. If a character
is trying to stabilize the magic crystal holding an entire town together or preventing it from being
absorbed into a hell plane, a 1/1 may absolutely send that town into oblivion, never to return.

That is not an exception to the recommended `CheckContract`; it is exactly why the contract records stakes
before dice. The engine must not use “fairness” to save a terminally threatened town after an honestly
telegraphed Mythic failure. In this example the contract may own:

```text
target: the stabilizing crystal and its town/domain dependency
method: a real but uncertain stabilization procedure
ordinary failure envelope: instability, damage, partial planar absorption, or another authored result
mythic failure envelope: terminal crystal collapse; town/domain absorbed or erased
threatened values: site, population, routes, institutions, relationships, quests, regional dependencies
stakes register: existential and already telegraphed
legal terminal events: domain destruction/relocation, topology severance, population/site terminal state,
                       quest/contract consequences, hell-plane Breach/root, survivor/death resolution
```

The base action consequence does not wait for a particular lens if the rolled check contract already
licenses it. A 1/1 takes the failure to the Mythic end of the declared stakes—the town is gone—and the
three-or-more lenses determine the distinct persistent cascade around that loss: perhaps the forbidden
door opens, a local planar law curdles, a threat enters, a bloodline inherits a debt, and the doer is
marked. The lens oracle enriches and spreads the catastrophe; it does not protect the advertised core
stake through a lucky lens omission.

Likewise, a low-stakes 1/1 may still break reality permanently, but it may not manufacture mass death or
terminal loss that was not present in the scene. Stakes control the legal harm register; magnitude controls
how deeply and strangely the lawful result propagates.

No-crit-fishing is now explicit:

- no meaningful uncertainty, method, or consequence means no roll;
- an identical retry against unchanged facts does not create another check;
- a new check requires a materially changed method, resource, position, assistance, target state, or
  consequence, with provenance;
- time, tools, consumables, exposure, noise, fatigue, witness response, clocks, and failed-attempt state
  prevent costless repetition where retries are fictionally possible;
- one plan is not split into artificial micro-checks merely to multiply natural-20 opportunities;
- cohort/batch action uses the resolution's declared group dice rather than one hidden crit chance per
  simulated member;
- the DM may not call unnecessary checks to create drama or fish for either Mythic direction;
- once a legitimate roll qualifies, no cooldown, saturation budget, or secret correction suppresses its
  Crit Magnitude result.

Decision 1—roll permission and the reality-breaking boundary—is closed.

#### 10.11.29 Open decision 2 — exact Mythic frequency and roll eligibility

Adam asks whether `20/20` is Mythic and whether a 5% chance followed by another 5% chance produces a 22%
chance of two consecutive 20s across 50 rolls.

Yes: Mythic success is natural 20 followed by magnitude 20. For one eligible action roll:

```text
P(20/20) = 1/20 × 1/20 = 1/400 = 0.25%
P(1/1)   = 1/20 × 1/20 = 1/400 = 0.25%
P(either Mythic extreme)   = 2/400 = 1/200 = 0.5%
```

The cumulative chance over repeated **eligible action rolls** is:

| Eligible action rolls | At least one 20/20 | At least one 20/20 or 1/1 |
|---:|---:|---:|
| 10 | 2.5% | 4.9% |
| 20 | 4.9% | 9.5% |
| 50 | 11.8% | 22.2% |
| 100 | 22.1% | 39.4% |

So 22.2% is not the chance of at least one double-20 alone. It is the chance of at least one Mythic
extreme in either direction across 50 eligible action opportunities. The double-20 success alone is about
11.8%; the double-1 failure alone is also about 11.8%. These are cumulative chances, not a guarantee that
one occurs every 200 or 400 rolls.

The remaining mechanical question is what counts as an eligible roll.

##### Option 1 — every d20 the software happens to roll

Player actions, every minion attack/save, background simulation, batch checks, and internal resolution
dice all receive independent magnitude opportunities. This makes world-breaking frequency depend on CPU
implementation and crowd size; a large offscreen battle can create more Mythic canon than an entire
player adventure. **Not recommended.**

##### Option 2 — only the player's d20s

This makes incidence legible and privileges player drama, but named enemies, allies, rivals, and world
actors can never create equivalent dice-driven miracles or catastrophes. It weakens the brutal symmetric
world and conflicts with the existing combat-crit ruling. **Not recommended.**

##### Option 3 — every surfaced spotlight d20 resolution

Full Crit Magnitude applies to:

- every player-facing attack, check, save, and other independently resolved d20 whose result matters;
- every individually narrated consequential roll by a named or currently foregrounded NPC/foe;
- one explicit group/cohort resolution when minor actors act collectively;
- any other roll deliberately promoted into a visible action beat with a real `CheckContract`.

It does not apply independently to passive arithmetic, solver probes, background catch-up, hidden batch
members, per-capita simulation, or other d20-shaped implementation details. Those systems may create one
surfaced group action when their collective uncertainty matters.

This interprets “any d20 action” as any real narrated action-resolution die, not any random number inside
the program. Advantage/disadvantage, class mechanics, explicit rerolls, and special d20 systems still need
an eligibility registry so no caller accidentally bypasses or duplicates the rule. The dice and magnitude
remain open wherever the player can witness the beat.

**Recommendation:** adopt Option 3. It preserves symmetry and genuine opponent/world miracles without
letting internal simulation volume inflate Mythic incidence. Once a roll is eligible, use the exact honest
table above—no cooldown, pity system, frequency correction, or cancellation.

**Open decision 2:** should full Crit Magnitude apply to every surfaced spotlight d20 resolution—all
player-facing d20s, individually narrated consequential named/foreground actor d20s, and consolidated
group rolls—while internal, background, and per-unit batch dice cannot generate independent cascades?

#### 10.11.30 Ruling — Crit Magnitude belongs to surfaced spotlight d20 resolutions

Adam locks Option 3. Full Crit Magnitude applies to every surfaced spotlight d20 resolution:

- player-facing attacks, checks, saves, and other independently resolved consequential d20 actions;
- individually narrated consequential d20 actions by named or foregrounded NPCs and foes;
- one explicit consolidated resolution when a minor cohort acts collectively;
- any otherwise-background action deliberately promoted into a visible action beat with a legitimate
  `CheckContract`.

Internal solver probes, passive arithmetic, background catch-up, hidden per-capita simulation, and the
individual members of a batch do not receive independent Crit Magnitude opportunities. An offscreen baker
does not accidentally make Mythic bread and rewrite the regional grain economy merely because the economy
simulation used a d20-shaped random number. If the baking becomes a real surfaced contest—perhaps the
player helps the royal baker complete a feast while a flour curse spreads through the ovens—its declared
action rolls may qualify normally.

The distinction is narrative-mechanical status, not actor privilege: the player, a foregrounded enemy,
a named ally, or a surfaced cohort can all generate honest Mythic change. No actor receives an invisible
volume advantage merely because the engine models more of its component actions. Eligibility must be
registered at the shared d20 resolution spine so callers cannot accidentally bypass or duplicate it.

Once eligible, a roll receives the honest magnitude result without cooldown, pity, suppression, or
frequency correction. Decision 2—Crit Magnitude eligibility and frequency—is closed.

#### 10.11.31 Open decision 3A — how many lenses constitute a Mythic cascade?

The current spec promises a Mythic “full cascade (3+),” but the implementation fixes every `20/20` and
`1/1` at exactly three distinct lenses. That cannot reproduce the canonical Light of Lathander example's
four mechanical threads: transformed place/enduring light, changed person/repentant bandit, revealed
truth/bandit operation, and forged bond/shrine obligation. Mythic count therefore needs an explicit rule.

##### Option 1 — keep exactly three lenses

Every Mythic result changes three distinct kinds of thing. This is fastest and most predictable, but it
quietly narrows `3+` to three, cannot directly express the founding example, and makes every ultimate
result structurally identical in count. A `20/20` plea might transform the shrine site, redeem the
bandit, and reveal the operation, but the enduring bond must be folded into another effect or omitted.

##### Option 2 — fix Mythic at four lenses

Every Mythic result changes four distinct kinds of thing. This matches the average desired weight and the
Lathander example while making implementation and presentation predictable. It still abandons count as a
rolled axis, however: stabilizing the hell-crystal and winning a transcendent cooking contest would always
produce the same number of persistent threads even though their content and reach differ.

##### Option 3 — openly roll `d3 + 2` distinct lenses (three to five, average four)

After `20/20` or `1/1`, roll the cascade count openly, then draw that many distinct success or failure
lenses. Three creates a concentrated Mythic event, four matches the canonical example, and five creates a
rare maximal braid. For the collapsing crystal:

- a three-lens `1/1` might erase the town as the core loss while opening the hell passage, scarring a
  survivor, and making the town's name a regional curse;
- a five-lens `1/1` could additionally release a named threat and impose a debt upon the survivors.

The core consequence licensed by the `CheckContract` does not consume or depend on drawing a particular
lens; lenses describe the distinct persistent propagation around it. Duplicate or mechanically
incoherent lenses are openly rerolled rather than silently reducing the count.

The engine cost is bursty but small in aggregate. Compared with fixed three, `d3 + 2` adds an average of
one typed effect only when a Mythic extreme occurs—about one extra effect per 200 eligible d20 actions on
straight independent dice. A maximal event validates and commits five adapters instead of three, so its
exceptional turn may take longer and needs a visible ritual/progress presentation. It does not require new
adapter families or larger lens tables; it reuses the same twelve orthogonal axes. The real expense is
writing and testing cross-lens coherence, rollback, and deferred fulfillment for up to five effects,
which the atomic cascade system needs regardless if Mythic outcomes are to be real rather than prose.

**Recommendation:** Option 3, `d3 + 2`. It preserves the original promise that magnitude controls both
count and intensity, matches the `3+` spec and four-thread canonical example, and gives the rarest events
meaningful structural variation without increasing ordinary-turn simulation cost.

**Open decision 3A:** should every Mythic `20/20` or `1/1` openly roll `d3 + 2` distinct lenses, producing
a three-to-five-thread persistent cascade, with the declared core action consequence resolved in addition
to and propagated through those lenses?

#### 10.11.32 Ruling — Mythic cascades openly roll `d3 + 2` lenses

Adam accepts the recommendation. Every Mythic `20/20` or `1/1` openly rolls `d3 + 2`, producing three to
five distinct success or failure lenses with an average of four. Duplicate lenses reroll openly. A lens
that cannot produce a legal, causally coherent typed effect is repaired or openly rerolled with provenance;
it is never silently dropped to make implementation easier.

The declared core consequence remains separately guaranteed by the `CheckContract`. Lenses specify the
distinct persistent ways that consequence reaches into people, places, topology, law, knowledge, bonds,
threats, and other canonical owners. A Mythic result therefore cannot fail to destroy the threatened town
merely because the place lens was absent, nor can the same destroyed-town fact be counted as five effects
by restating it five ways.

The implementation must expose the count roll and lens rolls as part of the rare Mythic ritual, validate
up to five effect adapters under one causal root, and atomically commit or repair the whole cascade before
consequential narration. The ordinary-turn cost remains zero; the exceptional Mythic turn is allowed a
clear, comprehensible burst of additional work.

Decision 3A—Mythic cascade count—is closed.

#### 10.11.33 Open decision 3B — separate tier, improbability, spectacle, and obliteration

The current engine conflates several different meanings around the number eight:

- `check.js` computes `absurdity` from how far a natural 20 or 1 defied the DC math;
- Crit Magnitude independently rolls a second d20 to determine Standard, Amplified, or Mythic authority;
- theater treats any crit magnitude `>= 8` as permission for a literal-looking reality-tear effect;
- a confirmed killing crit with magnitude `>= 8` may set `obliterated`, removing the corpse from the
  world rather than merely presenting a larger hit.

That threshold does not match the tier table. On a natural 20, magnitude 8–10 is still Standard and has
no lens. On a natural 1 the magnitude direction is inverted, so 11–20 is the mildest Standard failure—yet
the current `>= 8` visual gate makes those milder failures especially likely to display the strongest
“reality tear.” Among successful critical killing blows, `>= 8` also means 13 of 20 magnitude results, so
65% may erase the corpse. Obliteration is not cosmetic: it affects remains, carried loot, evidence,
necromancy, recovery, witnesses, and later room state.

##### Option 1 — preserve `magnitude >= 8` as a universal spectacle/obliteration threshold

This retains the current dramatic frequency and costs the least code churn. It leaves Standard crits
looking reality-breaking, makes failure presentation run backward against the inverted magnitude table,
and permits an arbitrary presentation threshold to make durable world-state decisions. **Not recommended.**

##### Option 2 — promote the threshold into the Crit Magnitude tier table

Reband magnitude 8–10 as Amplified and give those results lenses, then create a mirrored failure threshold.
This would make the visuals and world authority agree, but it substantially changes the accepted outcome
distribution merely to justify a legacy FX constant. It would also make Amplified changes much more common
and still would not explain why every qualifying sword kill destroys the corpse. **Not recommended.**

##### Option 3 — give each concept one owner and use semantic effects

Keep the accepted Crit Magnitude bands unchanged, but separate four signals:

1. Rename the check-math value conceptually to `defiedMargin`: it tells narration how much causal bridge is
   needed when the natural result overturned the ordinary DC math; it grants no world-change tier.
2. `critMagnitude` and its tier exclusively grant persistent lens/reach authority.
3. Standard crits may receive forceful but nonliteral hit/fumble presentation. Amplified and Mythic beats
   receive tier- and lens-aware spectacle. A Mythic ritual may visually stress the frame, but only an
   applied topology/law/place effect leaves an actual rift or changed terrain in canon.
4. `obliterated` remains a distinct terminal disposition owned by the resolved effect: an explicit
   spell/damage/environment capability, a validated finisher rule supported by target and attack fiction,
   or an Amplified/Mythic typed effect. A magnitude number alone does not delete remains.

Examples:

- A magnitude-9 Standard critical sword kill is spectacular but normally leaves the dead guard and their
  keys in the cell block.
- A magnitude-15 Amplified radiant killing blow may obliterate a vampire if its damage/effect contract and
  lens support that disposition; the lens changes persist through their proper owners.
- A natural-1/magnitude-18 Standard fumble is painful or memorable but does not display a cosmic rift just
  because 18 exceeds eight.
- A `1/1` during the crystal ritual may actually tear the planes because its Mythic cascade commits a
  topology/Breach event, not because the theater selected a dramatic animation.

This costs a small state/event migration and more semantic visual mappings, but it removes an expensive
long-term ambiguity: presentation can no longer silently mutate corpse, loot, topology, or canon state.
The redesign already requires effect adapters and transactional receipts, so those semantic owners are
not an extra simulation layer.

**Recommendation:** Option 3. Preserve dramatic crit presentation, but make visuals describe the resolved
event rather than decide it. Retire `magnitude >= 8` as a universal authority threshold, keep the accepted
tier table, distinguish `defiedMargin` from `critMagnitude`, and require a mechanically supported terminal
effect before marking a target obliterated.

**Open decision 3B:** should Genesis adopt this separation, preserving exciting crit visuals while
removing the universal magnitude-8 reality-tear/obliteration rule and allowing persistent rifts, destroyed
remains, and other canonical changes only through the resolved action/effect contract or typed lens?

#### 10.11.34 Ruling — resolved effects own spectacle and terminal state

Adam accepts Option 3. Genesis will retire `magnitude >= 8` as a universal reality-tear and obliteration
authority threshold. The accepted Crit Magnitude bands remain unchanged.

- `defiedMargin` (the current check-math `absurdity`) records how far a natural result overturned the
  ordinary DC math and tells the DM how much causal explanation the narration owes;
- Crit Magnitude alone grants Standard, Amplified, or Mythic reach and lens authority;
- presentation describes the accepted receipt and may be spectacular without pretending a canonical
  topology mutation occurred;
- persistent terrain, law, topology, body, and item changes require a resolved action/effect capability
  or validated typed lens rather than an FX threshold;
- an ordinary Standard critical kill leaves the default corpse unless the attack/effect contract supports
  a different terminal disposition.

The implementation may preserve `absurdity` as a compatibility field during migration, but the contracts,
documentation, and eventual public vocabulary must distinguish defied DC margin from the second d20's
Crit Magnitude. The literal-looking reality-tear effect must either become a noncanonical presentation
whose visual language cannot be mistaken for a persistent Breach, or be reserved for receipts that
actually commit the corresponding world change.

Decision 3B—the magnitude-8 seam—is closed.

#### 10.11.35 Open decision 3C — “obliterated” is too coarse for terminal consequences

Removing the numeric shortcut exposes an older modeling shortcut. The current `obliterated` boolean means
“do not stage a corpse; remove the figure.” It cannot distinguish a body burned to ash, disintegrated,
banished with its equipment, swallowed by a Breach, transformed into an object, or erased from existence.
Those outcomes disagree about where the target is, what remains, where carried inventory goes, what
evidence exists, whether recovery is possible, and what later visitors find.

This matters directly to accepted canon. Ordinary PC death currently leaves a fixed corpse plus carried
loot; rooms retain corpse traces; loot may be recovered until clock and context remove it; and witnessed
history cannot be retconned. A single absence flag cannot safely override those rules.

##### Option 1 — retain `obliterated: true` and hardcode each caller's side effects

The renderer continues to receive one convenient flag while spells, crits, hazards, and Mythic events each
manually decide loot and recovery elsewhere. This is initially cheap, but guarantees drift: one route will
remove the miniature while leaving loot on an invisible corpse, another will destroy quest evidence, and
a third will forget the target's destination. **Not recommended.**

##### Option 2 — define one universal obliteration bundle

Every obliteration means no body, no recoverable inventory, no recovery, and only a scorch/absence trace.
This is consistent but fictionally destructive. Banishment should transport equipment, petrification
should leave a stone body, divine translation may leave relics, and even disintegration may protect an
explicitly anchored story item. It turns a rendering convenience into a metaphysical law. **Not
recommended.**

##### Option 3 — replace the boolean's authority with a typed `TerminalDisposition`

Death or removal resolves a small semantic receipt whose axes are explicit:

```text
life/continuity: dead | banished | transformed | consumed | erased
body/remains: intact | damaged | ash | fragments | object | none
location/destination: current site | named holder/container | other place/realm | none
inventory: on remains | dropped | transported | damaged bundle | destroyed bundle
recovery: ordinary death rule | special requirement | blocked | impossible
evidence/trace: corpse | stain/scorch | fragments | portal residue | object | witnessed absence
identity/canon: observed history preserved; any name/soul/history effect must be explicitly licensed
```

Source/effect profiles fill those axes without simulating every atom:

- an ordinary sword death uses the existing default—corpse intact, carried inventory on the corpse,
  ordinary clock/context recovery;
- fire may leave a charred corpse or ash according to effect intensity, with an inventory bundle rule and
  explicit protected/story-item exceptions rather than one physics roll per item;
- banishment moves the target and carried gear to a declared destination and leaves portal evidence but
  no local corpse;
- petrification leaves an object that still has location, identity, equipment relationships, and a
  special recovery path;
- Mythic erasure may set no remains and impossible ordinary recovery, but it is still a provenance-kept
  event after everything previously witnessed—the engine does not rewrite old canon as though the target
  never existed unless a separately licensed name/history lens says exactly what changes.

The tabletop renderer may derive a compatibility projection such as `obliterated = body/remains is none`,
but that projection no longer owns gameplay. Inventory, death/rebirth, topology, knowledge, quest, and
visual systems consume their relevant disposition fields from the same receipt.

The runtime cost is negligible because this resolves once per terminal event, not every turn. The build
cost is moderate: migrate death/removal event shapes, define a compact set of reusable profiles, and add
cross-system tests. Bounded bundle rules avoid per-item physics. This expense buys back large future costs
in resurrection, loot, evidence, Breach travel, corpse persistence, and Mythic reconciliation.

**Recommendation:** Option 3. Keep ordinary death's existing corpse-and-loot behavior as the default, but
replace `obliterated` as world authority with a typed terminal-disposition receipt. Retain the boolean only
as a temporary compatibility/render projection during migration.

**Open decision 3C:** should terminal removal use this typed disposition model so burning, disintegration,
banishment, transformation, planar consumption, and Mythic erasure each state what happens to the body,
location, inventory, recovery, evidence, and identity rather than sharing one `obliterated` boolean?

#### 10.11.36 Reopened foundational decision — recalibrate natural-20 magnitude bands

After sleeping on the system, Adam reopens the successful Crit Magnitude distribution. His intended shape
is now:

```text
natural 20 + magnitude 1–15: a badass guaranteed success with style and excellence
natural 20 + magnitude 16–18: the next degree
natural 20 + magnitude 19:    the next degree again
natural 20 + magnitude 20:    the ultimate crit that can break a game
```

This supersedes the earlier assumed success split of Standard 1–10, Amplified-minor 11–14,
Amplified-major 15–19, Mythic 20 if Adam locks the new calibration. No implementation or locked
`CRIT-MAGNITUDE.md` edit occurs during this design ruling; the running direction records the proposed
change first.

The no-crit-fishing boundary still applies before dice. “Guaranteed success at whatever they were doing”
means the best lawful success of the legitimate `CheckContract` the engine agreed to roll. It does not
grant a roll to an impossible no-method request. Once the engine grants a real check and the player rolls
a natural 20, however, magnitude 1–15 must not dilute that moment into partial success, a hidden cost, or
an AI refusal. The attempted action succeeds cleanly and impressively inside its declared ordinary success
envelope.

##### Recommended mechanical meanings

| Natural | Magnitude | Recommended tier | Mechanical authority |
|---:|---:|---|---|
| 20 | 1–15 | **Standard Critical Success** | Guaranteed best ordinary success, executed with style/excellence; no lens and no unrelated persistent mutation. |
| 20 | 16–18 | **Amplified Critical Success** | Core success plus **one** distinct coherent lens; the act creates one wider or lasting advantage/consequence. |
| 20 | 19 | **Legendary Critical Success** | Core success plus **two to three** distinct coherent lenses; persistent and capable of regional/systemic reach, but still operates through supported world systems. |
| 20 | 20 | **Mythic Critical Success** | Core success plus the already accepted open `d3 + 2` lenses; permanent and explicitly licensed to cross an ordinary constraint through typed world change. |

Concrete prison example—a character legitimately attempts to pick the master lock controlling a cell row:

- **20/1–15:** the lock opens perfectly, silently, and without damaging the tools; the character looks
  exceptionally competent. It does not secretly create a tunnel or rewrite the prison hierarchy.
- **20/16–18:** the lock opens, and one lens might reveal the repeatable master-key geometry, giving the
  party a durable access advantage elsewhere in this institution.
- **20/19:** the lock opens, the character discovers that the same concealed mechanism controls the whole
  cell block, and the exposed maintenance route/revealed corruption creates two or three persistent
  consequences through topology, knowledge, and faction/person systems.
- **20/20:** the mechanism yields in a way ordinary craft could not produce: perhaps every unjustly bound
  door in the institution opens, an impossible passage manifests, and three to five coherent permanent
  effects root outward. It may break the game's expected situation, but it still grows causally from the
  legitimate act rather than granting an unrelated wish.

Combat damage remains orthogonal: a Standard critical attack still uses the game's normal critical-damage
rule. Higher degrees grant collateral, social, environmental, threat, body-state, topology, or other typed
consequences; they do not multiply damage again merely because more lenses fired.

##### Frequency and engine impact

Because a natural 20 occurs on 5% of eligible d20s, the proposed successful degrees occur at these rates:

| Successful degree | Share of natural-20 crits | Share of all eligible d20s |
|---|---:|---:|
| Standard, magnitude 1–15 | 75% | 3.75% |
| Amplified, magnitude 16–18 | 15% | 0.75% |
| Legendary, magnitude 19 | 5% | 0.25% |
| Mythic, magnitude 20 | 5% | 0.25% |

The Mythic `20/20` frequency remains exactly 1 in 400 eligible d20 actions. What changes is the middle:
only 25% of natural-20 crits now create one or more lenses, down from 50% under the prior table. Across 50
eligible actions, the chance of at least one successful Amplified-or-higher result is about 46.7%, while
the chance of at least one `20/20` remains about 11.8%.

This reduces world-mutation volume and validation/commit work while making ordinary natural 20s more
consistently satisfying. The one-face magnitude-19 tier also gives the engine and player a clear
“legendary but not game-breaking” ritual instead of hiding materially different authority inside a broad
five-face band.

**Recommendation:** adopt Adam's 15/3/1/1 face distribution and define the degrees as Standard (no lens),
Amplified (one lens), Legendary (two to three lenses), and Mythic (`d3 + 2` lenses). This is cleaner,
rarer where persistent mutation begins, and truer to the stated experience: most natural 20s are simply
badass excellence; 19 is extraordinary canon; 20/20 is allowed to break the game.

The failure table should be discussed immediately after this success distribution closes rather than
being silently inferred. The clean mathematical mirror would be natural-1 magnitude 6–20 Standard, 3–5
Amplified, 2 Legendary, and 1 Mythic, but tone and consequence direction require Adam's explicit ruling.
The typed terminal-disposition follow-up remains open and is intentionally paused behind this reopened
foundational calibration.

**Open decision:** should the success table lock as 20/1–15 Standard with no lens, 20/16–18 Amplified with
one lens, 20/19 Legendary with two to three lenses, and 20/20 Mythic with the accepted `d3 + 2` lenses?

#### 10.11.37 Follow-up — reward anchors keep the DM pointed at what the action earned

Adam adds the missing control principle: the higher crit degrees must keep the DM on track about **what is
being rewarded**. The Light of Lathander example is not a bag of interchangeable miracles. Its effects
attach to several live sources:

- **character/class expression:** a cleric invokes Lathander, so holy light and genuine repentance reward
  the character fantasy and method actually brought to the scene;
- **quest/objective:** the bandit's revelation of the hideout advances the concrete problem the party is
  engaging;
- **world/context:** permanent light and the community's organic construction and maintenance of a shrine
  change the place and its future society.

This clarifies that reward source and effect lens are two orthogonal systems:

```text
reward anchor = why this consequence belongs to this action
effect lens   = what kind of canonical system change expresses it
```

For example, “the bandit repents” may use a person-changed lens while attaching to the cleric/Lathander
character anchor. “The hideout is revealed” uses a hidden-truth lens attached to the quest anchor.
“Permanent holy light” uses a place/local-law lens attached to both character and world anchors. “The
townsfolk found a shrine” uses place/bond/group effects attached to the world anchor. Lenses remain useful
because they specify mechanical owners; anchors prevent the DM from filling them with unrelated content.

##### Recommended `RewardAnchorSet`

The pre-roll `CheckContract` should capture a small provenance-backed set of active reward anchors:

| Reward lane | Possible source | What it protects |
|---|---|---|
| **Character expression** | actively used class feature, deity/domain, oath, spell, skill, background, bond, item, form, or tactic | The result rewards how this character approached the problem, not a generic protagonist fantasy. |
| **Story objective** | declared intent, quest, contract, investigation, pressure, promise, faction problem, or player-adopted thread | The result advances or transforms the problem actually in play rather than inventing unrelated content. |
| **World context** | target NPC, place, institution, faction, realm, history, witnesses, ecology, or current condition | The result belongs to this world and leaves consequences in the owners that can persist. |

The first lane should not literally mean “always use the class label.” If a cleric picks a mundane lock
with thieves' tools, the engine must not inject Lathander merely because `class = cleric`. Lathander becomes
an active anchor only when the declared method, feature, faith, established relationship, or scene fiction
actually invokes that power. Likewise, a feat, heirloom, friendship, oath, species trait, or clever tactic
may be the relevant character-expression anchor instead of class.

The story-objective lane does not require a formal quest-log entry. Every check has declared intent, but a
named quest, contract, or adopted story card attaches only when causally relevant. The engine may not claim
that a random distant quest advanced merely to satisfy coverage. The world lane uses the actual target,
place, factions, witnesses, and current canon; it does not generate a context-free “world reward.”

##### Recommended coverage by degree

- **Standard 20/1–15:** no persistent lens, but narration and the best ordinary success visibly reward the
  active character/method and declared objective.
- **Amplified 20/16–18:** the single lens must attach to the strongest causally relevant reward anchor; it
  cannot become a generic bonus detached from the action.
- **Legendary 20/19:** its two to three lenses should cover at least two distinct active reward lanes before
  deepening one lane twice. If three lenses and three relevant lanes exist, cover all three.
- **Mythic 20/20:** its three to five lenses must cover every relevant active reward lane before repeating
  one. Additional lenses braid or deepen the same causal root. A missing lane is not fabricated merely to
  meet a quota.

Each planned `CritEffect` therefore carries both a lens id and one or more anchor ids. Atomic validation
rejects an effect that has no causal anchor, contradicts its anchor, or double-counts the same mutation as
several rewards. The DM still has enormous creative freedom in filling the rolled combination, but the
engine can now tell whether the proposed consequence is actually about the character, objective, and
world that earned it.

This does not require bespoke outcome tables for every class × quest × location combination. Character
features, quest facts, and world entities already provide the content handles; the twelve effect lenses
provide reusable mechanical verbs. The Crit planner composes the two at resolution time and stores the
provenance. The writing burden lies in good feature/domain/realm tags and adapter examples, not a
Cartesian library of authored miracles.

**Recommendation:** lock reward-anchor coverage as part of the proposed success table. Magnitude decides
how many consequences may fire; the active anchor set decides what those consequences must reward; the
lenses decide which persistent systems change. This preserves the DM's poetry while giving it a causal
rail.

**Open follow-up:** should Legendary and Mythic cascades be required to cover the relevant
character-expression, story-objective, and world-context reward lanes as recommended—with no forced class,
quest, or world attachment when that lane was not genuinely active—before any lane receives additional
lenses?

#### 10.11.38 Correction — only `20/20` creates extra persistent world mutations

Adam draws a firmer boundary: only magnitude 20 should grant additional persistent states in the world.
The lesser successful degrees may spread the reward into character, objective/story, world-context, or
material lanes, but they should not install permanent supernatural/campaign mutations merely because the
magnitude exceeded 15. A magnitude-19 success on a treasure-chest lock should, for example, improve a
low-tier reward rather than found an institution or permanently rewrite the room.

This requires precise terminology because all honest play changes stored state. The following remain
ordinary persistent transaction results at every degree when the action earns them:

- the picked lock remains open or broken according to the resolution;
- acquired loot remains in inventory and leaves its prior holder/container;
- a revealed established fact remains known to the appropriate witnesses;
- quest progress, spent resources, time, noise, relationships, damage, and other normal consequences are
  committed rather than forgotten;
- a generated story lead/card may persist as a bounded promise for later fulfillment.

The restriction is on **extra crit-authored world mutation**: 16–19 cannot use magnitude alone to create a
new local law, permanent magical terrain, Breach, transformed person, supernatural bond, founded faction or
institution, erased history, inherited curse, or equivalent durable canonical system. Those typed lens
mutations are reserved for `20/20`.

##### Revised successful degrees

| Natural | Magnitude | Result | Extra authority beyond the core success |
|---:|---:|---|---|
| 20 | 1–15 | **Standard Critical Success** | None required: best lawful ordinary success, performed with style and excellence. |
| 20 | 16–18 | **Amplified Critical Success** | **One bounded reward spread** attached to the strongest relevant reward lane. No persistent mutation lens. |
| 20 | 19 | **Legendary Critical Success** | **Two bounded reward spreads**, preferably across distinct relevant lanes. No persistent mutation lens. |
| 20 | 20 | **Mythic Critical Success** | The core success plus the accepted `d3 + 2` typed persistent lenses; cover every active reward lane before repeating one. |

“Reward spread” is a bounded consequence inside systems that already exist. Eligible forms include:

- **mastery:** faster, quieter, cleaner, safer, broader ordinary execution; tools/resources conserved;
- **material:** improve a soft/unrevealed reward, add a bounded bonus reward, or improve its usefulness;
- **story:** reveal an existing relevant fact, increase clue specificity, or mint/promote an attached
  promissory story card without immediately changing the physical world;
- **objective:** advance, simplify, expose, or create leverage against the active quest/contract/pressure;
- **social:** a fitting immediate reaction, credibility gain, invitation, concession, or advantage through
  the existing relationship/reputation systems;
- **character expression:** a class/feature/faith/item/tactic payoff that remains inside established
  capabilities rather than manufacturing a permanent new supernatural feature.

The reward-anchor model therefore still governs 16–19, but lens coverage no longer does. Magnitude decides
the number of bounded spreads; target and method affinity decide which lane should be favored. `20/20`
alone hands those anchors to the persistent lens engine.

##### Treasure-chest magnitude 19

The pre-roll `CheckContract` should carry a `RewardEnvelope` for reward-bearing targets:

```text
container/reward-root id and commitment state
base loot tier or unresolved allocation
context/level/power cap and legal upgrade bands
available material, story, mastery, and objective reward adapters
crit-bonus provenance and already-claimed guard
```

On a `20/19` lockpick, the chest/material anchor has overwhelming target affinity, so at least one of the
two reward spreads should pay through the treasure unless canon or safety makes that impossible:

- if the contents are soft or not yet rolled and sit below the legal cap, promote one meaningful component
  by one reward/rarity band or make an equivalent bounded bonus draw;
- if the chest is already at its legal material ceiling, preserve it and spend that spread on a useful
  consumable, hidden compartment, provenance clue, quest evidence, or another fitting non-power reward;
- if contents were already observed and locked to canon, do not retcon them—the additional value must use
  a lawful unobserved affordance or another active lane;
- never downgrade a later room to “pay back” the crit. This is an earned, rare crit faucet recorded
  separately for economy telemetry;
- the same reward root cannot be checked repeatedly or split into several lock/trap/lid checks to farm
  upgrades.

For example, a low-tier prison pay-chest might replace a mundane consumable with a better tier-appropriate
one and also expose a coded payroll entry connecting the jail to a smuggling quest. A wealthy vault already
at its power cap might keep its treasure unchanged but add a hidden provenance ledger and allow the tools
to survive a lock designed to destroy them. Neither result permanently changes local physics or creates a
new shrine; both clearly reward the magnitude-19 success.

This is cheaper and safer than giving 16–19 persistent lenses. The engine needs a small bounded reward
adapter registry and reward-envelope checks, while the expensive typed world-mutation planner runs only on
`20/20`. Crit bonuses remain auditable and rare enough to be genuine rewards rather than a replacement for
ordinary dungeon budgeting.

**Recommendation:** lock the revised table above. Use one bounded reward spread at 16–18, two at 19, and
reserve `d3 + 2` persistent lens mutations exclusively for `20/20`. Preserve ordinary transactional
consequences at every degree so “not world-persistent” never means that opened locks, obtained loot, learned
truth, or quest progress evaporate.

**Open follow-up:** should Genesis lock this distinction and, specifically, guarantee that a magnitude-19
success against a low-tier reward container spends at least one of its two bounded reward spreads improving
that material reward within the legal envelope?

#### 10.11.39 Ruling — crit rewards must react to the situation's genuine anchors

Adam locks the anchor-coverage requirement because the crit must feel reactive to the situation at hand.
This ruling inherits the newer “only `20/20` creates extra persistent world mutations” boundary:

- a magnitude-19 **Legendary** success applies its bounded reward spreads across distinct genuinely active
  character-expression, story-objective, world-context, or material anchors where possible;
- a `20/20` **Mythic** success uses its persistent lens cascade to cover every genuinely active reward lane
  before deepening a lane twice;
- neither tier fabricates a class, quest, world, or material connection merely to fill a slot;
- target/method affinity matters: a locked low-tier treasure chest strongly licenses material reward, while
  a plea made through an invoked deity strongly licenses character/faith expression;
- every reward and lens retains both its causal anchor ids and its effect/reward adapter provenance so the
  engine can validate that the DM's proposed payoff is actually about this action.

This closes the prior anchor-coverage follow-up. Exact bounded-spread count and the full success table await
final confirmation after the following calibration exercise.

#### 10.11.40 Provisional calibration exercise — situational skill-crit spreads

Adam asks for a varied set of skill rolls and an initial reward sketch to test whether the new bands react
properly. These examples are deliberately provisional and should be amended from the discussion rather
than treated as final outcome tables. They demonstrate the compositional rule; implementation must not
hardcode these exact authored scenes.

##### Exercise A — thieves' tools: the jailer's low-tier confiscation chest

**Situation:** a rogue opens the jailer's confiscation chest while trying to recover prisoners' property.
The chest contents are still soft, currently allocated as low-tier loot. Evidence suggests the jailer has
been skimming valuables. Active anchors are the rogue's demonstrated lockcraft, the recovery/corruption
objective, the reward-bearing chest, and the jail institution.

- **20/1–15:** the chest opens silently and cleanly; tools survive; its ordinary allocated contents are
  accessible. No trap or extra compartment is invented unless the contract already included one.
- **20/16–18:** one bounded spread follows strongest affinity—normally improve one low-tier loot component
  by one legal step, or conserve a resource/avoid an established lock consequence if that is more valuable.
- **20/19:** improve one low-tier loot component, then expose a coded confiscation/payroll record or another
  attached corruption lead. Material and objective/story anchors both receive an earned payoff; later room
  rewards are not reduced to reimburse the crit.
- **20/20:** the core chest success remains, while three to five persistent lenses cover the active anchors.
  A coherent Mythic braid might permanently mark stolen property with its rightful owner's name, change the
  rogue through an earned key/lock affinity, reveal the full confiscation network, and transform the jail's
  restitution relationship. The exact effects must come from rolled lenses and typed owners, not this
  example as a canned answer.

##### Exercise B — Persuasion/Religion: the cleric pleads with Lathander's would-be bandit

**Situation:** the cleric explicitly invokes Lathander while persuading a bandit to stand down. The party is
investigating the bandit operation; townsfolk and the location can plausibly witness or inherit the event.
Active anchors are cleric/faith expression, the bandit quest, the bandit as a person, and the local world.

- **20/1–15:** the bandit stands down and accepts the best ordinary lawful appeal with an unmistakably holy
  moment of excellence; no permanent light or forced personality rewrite occurs.
- **20/16–18:** one bounded spread might win immediate cooperation, elicit one useful operational fact, or
  grant safe passage through a bandit checkpoint—the strongest relevant payoff beyond standing down.
- **20/19:** the bandit stands down, reveals the hideout, and provides a password/map/weakness or makes a
  credible immediate introduction. Character expression and quest objective are both rewarded without
  founding a shrine or permanently transforming local law.
- **20/20:** the canonical full braid becomes legal: genuine repentance/person change, hideout revelation,
  permanent Light of Lathander/place-law change, and the community's organic shrine/bond response, plus any
  fifth coherent rolled lens. Each effect covers a live anchor and commits through its real owner.

##### Exercise C — Survival: the ranger tracks a missing child after a raid

**Situation:** a ranger follows a child's trail through a storm-damaged forest before raiders move on. The
trail, elapsed-time pressure, local hazards, and raider objective are established. Active anchors are the
ranger's tracking method, rescue objective, child/raiders, and forest/weather context.

- **20/1–15:** the ranger finds and follows the correct trail as efficiently and safely as the ordinary
  situation permits; the DM cannot use weather as a hidden reason the guaranteed success fails.
- **20/16–18:** one bounded spread finds a safe shortcut, preserves time/supplies, detects the raider ambush
  early, or identifies a useful secondary sign.
- **20/19:** the party reaches the child before the next danger beat and also learns the raiders' direction,
  numbers, camp clue, or a safe return route. Rescue and hunt/world navigation receive two relevant payoffs.
- **20/20:** the rescue succeeds and the forest may permanently answer the ranger's act through rolled
  person/place/bond/fate/topology lenses: a path for the lost could root here, the raider threat could break,
  and ranger/child/community bonds could become mechanically real. Nothing demands that exact pastoral
  shape; active anchors constrain the rolled cascade.

##### Exercise D — Arcana: stabilize the crystal holding a town outside a hell realm

**Situation:** the wizard uses a legitimate planar procedure and scarce reagents to stabilize the failing
crystal. Terminal town loss was telegraphed as a possible failure. Active anchors are arcane method and
reagents, the stabilization objective, the crystal/town population, and the hell-realm boundary.

- **20/1–15:** the crystal stabilizes and the town is saved within the procedure's best ordinary envelope.
  The result is not weakened merely because the threatened value was enormous.
- **20/16–18:** conserve a reagent, restore an auxiliary ward, identify the failure's school/signature, or
  gain a bounded future advantage in maintaining this exact system.
- **20/19:** stabilize the crystal, restore a secondary protective function, and identify the saboteur,
  stress route, or hell signature. Mastery and objective/world knowledge both spread without installing a
  new permanent planar law.
- **20/20:** the successful stabilization may permanently rewrite the boundary, seal or transform the
  Breach, elevate the doer, break the hell threat, and bind the town to a new protection through three to
  five typed lenses. This is the sole band allowed to cross the ordinary procedural envelope persistently.

##### Exercise E — Athletics: hold the collapsing gate while refugees escape

**Situation:** a fighter braces a failing gate long enough for a known group of refugees to pass while an
enemy force closes. Active anchors are the fighter's physical method, the rescue objective, refugees and
pursuers, and the gate/settlement defense.

- **20/1–15:** the fighter holds the gate for the full declared rescue window with strength and control;
  the promised group escapes.
- **20/16–18:** avoid exhaustion/injury, save one established straggler, recover a trapped resource, or
  leave the gate usable long enough for the party's own escape.
- **20/19:** all refugees escape and two bounded spreads might save the named trapped guard while exposing
  a counterweight route that provides immediate leverage against the pursuers. No supernatural monument or
  permanent strength boon appears.
- **20/20:** rolled lenses might permanently change the gate so it can never bar refugees, mark/elevate the
  fighter, forge a civic bond, and break or redirect the pursuit threat. The settlement may memorialize the
  act only through committed social events, not a narration-only epilogue.

##### Exercise F — Medicine: treat the poisoned mayor during negotiations

**Situation:** a healer has a real antidotal method but limited doses. The mayor's survival affects an
active treaty; signs of a particular poisoner are present. Active anchors are medical method/resources,
patient survival, treaty/poisoning investigation, and the mayor/city factions.

- **20/1–15:** the treatment succeeds at the best ordinary level permitted by its method—stabilization or
  cure according to the declared contract—and is administered expertly.
- **20/16–18:** conserve a dose, shorten recovery, identify the poison family, or retain a clean sample.
- **20/19:** cure/stabilize the mayor, produce an extra bounded treatment from the existing dose, and/or
  identify a signature that advances the poisoning investigation. Patient, resource, and quest lanes
  receive appropriate payoffs without creating a permanent supernatural immunity.
- **20/20:** persistent lenses may create a new cure, permanently change the patient/healer, break the
  poison threat, reveal the full conspiracy, or found an enduring medical bond/institution. The rolled
  anchors and lenses determine which of these are legal; “found a hospital” is not automatic.

##### Exercise G — Deception: enter a cult under a false identity

**Situation:** a bard assumes an established cover identity to enter a cult archive. The cover has prepared
documents and known risks; the objective is to locate a prisoner and records. Active anchors are the bard's
covercraft, infiltration objective, false identity, cult hierarchy, archive, and prisoner.

- **20/1–15:** the guard accepts the cover to the best ordinary extent of the check and grants the intended
  access; the DM may not immediately negate it with an unearned second suspicion roll.
- **20/16–18:** receive an escort credential, learn a useful protocol, bypass one later ordinary challenge,
  or attract less scrutiny.
- **20/19:** gain archive access plus a high-value hierarchy/password clue and an immediate route toward the
  prisoner or records. The cover and objective both pay off without becoming magically true.
- **20/20:** only now may the lie acquire persistent world force through rolled name, faction, bond,
  knowledge, or fate lenses—the cult's prophecy might recognize the persona, the false name might gain
  power, or a faction split might root around it. Such effects may create obligations as well as boons and
  must remain causally tied to the declared deception.

##### Exercise H — Investigation: search an apparently empty prison cell

**Situation:** scratch marks and mismatched mortar establish meaningful uncertainty; an authored or soft
discovery opportunity exists. The player searches for what happened to the prior prisoner. Active anchors
are investigative method, the missing-prisoner thread, the cell/jail history, and any attached NPC facts.

- **20/1–15:** find and correctly notice the best ordinary discoverable evidence—the hidden child's note,
  scrape pattern, loose stone, or other actual packet—and avoid a false “you find nothing” crit.
- **20/16–18:** correctly interpret one additional implication, preserve fragile evidence, or learn how the
  hiding place was accessed.
- **20/19:** uncover the evidence plus two bounded payoffs such as a precise identity/location lead and a
  concealed tier-appropriate consumable or route clue. Story and practical/material lanes may both pay.
- **20/20:** rolled lenses can cause the discovery to become a permanent story/world hinge—open an
  impossible passage, restore a lost bond, release dangerous truth, or transform the place—only when the
  evidence and active anchors can causally bear that result.

**No-roll control:** if the same cell has no clues, no soft discovery opportunity, no meaningful uncertainty,
and no method capable of producing information, the DM does not call an Investigation check. A natural 20
cannot be farmed from empty simulation. The room's accepted every-room discovery opportunity should normally
prevent purposeless emptiness, but whatever exists must belong to generation/canon before the check grants
access to it.

##### Initial skeptical notes for the exercise

- Reward spreads must not become miniature unrolled lenses; 16–19 cannot smuggle permanent mutations in
  through phrases such as “the guard will trust you forever” or “you permanently learn all locks.”
- A high magnitude cannot add a consequence outside the declared target/method simply because that lane is
  mechanically convenient.
- “Two spreads” need not mean two unrelated prizes. They may be a causal pair—evidence plus its usable
  interpretation—so long as each is real and the degree is visibly better.
- Story rewards should first reveal/advance established facts. When they mint a future story card, it must
  attach to current canon with a service horizon rather than remain an unpayable hook.
- Material bumps need a shared `RewardEnvelope`; otherwise every caller will interpret “slightly better”
  differently and the economy will drift.
- Mythic examples above are possibility sketches, not menus or deterministic recipes. The openly rolled
  lenses still choose the actual axes.

#### 10.11.41 Extreme calibration pass — let `20/20` genuinely break the current game

Adam finds the first exercise implementable but asks for a second pass that deliberately pushes the
`20/20` outcomes far enough to break the game. The following are maximal five-lens possibility sketches,
not fixed recipes. Each begins with the core success, covers the live reward anchors, and then spends all
five persistent lenses without protecting the current quest structure, dungeon route, faction balance,
resource loop, or future obstacle design.

“Break the game” here means permanently invalidate or transform expected play structures through an honest
canonical event. It does not mean corrupt saves, ignore typed ownership, invent unrelated wishes, retcon
observed history without authority, or make the engine forget how the result occurred.

##### Extreme A — the jailer's confiscation chest becomes the Key of Restitution

The rogue's `20/20` opens the low-tier confiscation chest. A maximal coherent braid might commit:

1. **Creation/character:** the master lock comes free as the **Key of Restitution**, a permanent storied
   tool that can open any lock whose primary purpose is to secure stolen property or unjust confinement.
2. **Local law/place:** throughout this jail, locks can no longer remain closed against the rightful owner
   of what lies behind them; every qualifying door and strongbox resolves through that new rule.
3. **Knowledge/quest:** the confiscation ledger completes itself with the full chain of stolen goods,
   bribes, buyers, victims, and hidden caches—not merely the next clue in the investigation.
4. **Bond/group:** every living victim whose property is here becomes aware that restitution is possible,
   creating a claimant network rooted to the rogue's act rather than a generic friendly faction.
5. **Threat/institution:** the jailer's corruption operation loses its secrecy, inventory control, and
   institutional protection at once; its current quest structure ends or becomes an open political crisis.

**What it breaks:** most of this jail dungeon, future ordinary locks tied to theft/imprisonment, the paced
corruption investigation, and the planned low-tier reward envelope. The campaign must now react to a
powerful new key, exposed network, claimant movement, and destabilized institution.

##### Extreme B — the Light of Lathander becomes a regional dawn

The cleric's `20/20` plea succeeds. A maximal version of the canonical result might commit:

1. **Person/faith:** the bandit's repentance becomes a genuine permanent conversion of motive; he becomes
   an active dawn-bearer rather than merely a cooperative informant.
2. **Knowledge/quest:** every hideout, cache, password, patron, and intended raid the bandit truly knows is
   released through correct witness boundaries, collapsing the investigation rather than feeding one clue.
3. **Local law/place:** true dawn permanently shines at the site and suppresses undead, magical darkness,
   and concealed violence within its domain according to a typed regional rule.
4. **Bond/institution:** witnesses and later adherents found and maintain a shrine/order whose duties,
   resources, NPC casting, and faction relationships root from the event.
5. **Name/doer/threat:** the cleric's name becomes recognized by powers and enemies of the dawn; the local
   bandit front fractures as every member receives a real opportunity to follow or reject the repentant
   bandit's call.

**What it breaks:** the bandit quest, secrecy around its operation, undead/darkness encounters in the new
domain, local religious balance, and the cleric's prior anonymity. It creates a new institution and threat
alignment the campaign must simulate.

##### Extreme C — the Homeward Trail rewrites the forest

The ranger's `20/20` tracking check finds the missing child. A maximal braid might commit:

1. **Topology/place:** the child's path becomes the **Homeward Trail**, a persistent route that can connect
   a genuinely lost innocent in this forest to the safest reachable refuge.
2. **Local law/world:** paths subtly lengthen against kidnappers and shorten for rescuers who meet the
   Trail's declared conditions; navigation in this forest now obeys that rule.
3. **Threat/quest:** every currently captive child held by the same raider root receives a viable branch of
   the Trail, immediately turning the single rescue into a mass escape and collapsing the raiders' leverage.
4. **Knowledge:** the raiders' camp, travel network, collaborators, and concealed crossings become legible
   through the Trail's evidence to the ranger and appropriate rescuers.
5. **Doer/bond:** the ranger becomes the Trail's first warden, gaining a permanent, bounded ability to call
   a homeward path for the genuinely lost while inheriting responsibility for what follows it.

**What it breaks:** wilderness navigation difficulty, the current rescue arc, hidden raider geography,
future “find the lost” problems in this forest, and potentially travel-resource assumptions. It creates a
new terrain law and character capability rather than merely awarding a shortcut.

##### Extreme D — the town crystal becomes a planar anchor and gate

The wizard's `20/20` stabilization succeeds against the hell-realm absorption threat. A maximal braid might
commit:

1. **Place/local law:** the crystal becomes self-stabilizing and fixes the town's domain against involuntary
   planar absorption; the original maintenance crisis cannot recur in the same form.
2. **Topology:** the predatory Breach inverts into a controllable two-way gate whose keys and conditions are
   explicitly attached to the crystal and its new keeper.
3. **Restoration:** people, structures, and objects already partially taken by the ongoing absorption return
   to the last recoverable coherent state allowed by established canon.
4. **Threat:** the hell power's claim over this town and every dependency routed through this crystal is
   severed; its front loses the asset and must respond from a fundamentally worse position.
5. **Doer/bond:** the wizard becomes a living key/warden of the anchor, gaining real authority over the gate
   and an enduring reciprocal obligation to the town and whatever waits beyond it.

**What it breaks:** the town-destruction arc, recurring crystal maintenance, the current planar threat plan,
travel topology between realms, and any assumption that the wizard lacks gate authority. The former crisis
becomes a major campaign hub.

##### Extreme E — the Refuge Gate denies the siege

The fighter's `20/20` holds the collapsing gate for the refugees. A maximal braid might commit:

1. **Local law/place:** the repaired/transformed **Refuge Gate** can never close against someone genuinely
   fleeing unjust pursuit, and becomes supernaturally hard to destroy while sheltering them.
2. **Topology/count:** every member of the declared refugee cohort—including cut-off stragglers still
   causally inside the escape—finds the remaining distance compressed enough to cross during the hold.
3. **Threat:** the pursuing formation's immediate siege front breaks: engines fail, command coherence
   collapses, and the current assault can no longer continue as planned.
4. **Doer:** the fighter gains the permanent mantle **Bearer of the Last Gate**, allowing an extraordinary
   threshold-hold under explicit limits that future encounters must honor.
5. **Bond/institution:** the refugees form an oathbound civic network around mutual sanctuary and the
   fighter's deed, changing settlement politics, recruitment, shelter, and future obligations.

**What it breaks:** the escape encounter, the siege's planned next phases, future gate-control plots at
this site, ordinary crowd-distance constraints for the rescued cohort, and the fighter's prior capability
envelope. It also creates a politically consequential refugee institution.

##### Extreme F — the poison becomes the seed of a universal antidote

The healer's `20/20` treatment cures the mayor. A maximal braid might commit:

1. **Creation/knowledge:** the treatment produces a reproducible **First Antidote** formula that can adapt
   to the poison family rather than cure only this patient.
2. **Restoration/count:** every reachable victim poisoned from the same batch receives a viable cure path;
   the mayor's treatment propagates through prepared doses and explicit medical logistics.
3. **Truth/threat:** remaining samples visibly disclose their maker's signature, supply route, and intended
   targets to qualified examination, collapsing the poisoners' secrecy.
4. **Doer/person:** the healer acquires a permanent diagnostic gift for this poison family and becomes a
   mechanically recognized authority, not merely someone narrated as famous.
5. **Bond/institution:** the mayor, affected factions, and trained healers establish an antidote network
   with stockpiles, duties, access rules, enemies, and a service horizon.

**What it breaks:** the poisoning mystery, scarcity of its cure, future ordinary encounters using that
poison family, parts of the potion economy, and the healer's prior diagnostic limits. It creates a public
health institution and forces poison-using factions to adapt.

##### Extreme G — the bard's false identity becomes a true office

The bard's `20/20` deception gains access to the cult archive. A maximal braid might commit:

1. **Name/local law:** the false identity becomes a real metaphysical office from this moment forward—wards,
   oaths, and cult procedures recognize its bearer without rewriting evidence that the person did not
   previously exist.
2. **Fate/quest:** the cult's active prophecy resolves forward around that office, making the bard a lawful
   candidate for authority and changing scheduled faction behavior.
3. **Knowledge:** the archive opens its full relevant hierarchy, prisoner, patron, ritual, and weakness
   corpus through correct knowledge boundaries rather than dispensing one clue at a time.
4. **Bond/faction:** a consequential cult bloc transfers loyalty to the new office while an opposing bloc
   rejects it, immediately splitting the faction into mechanically real groups.
5. **Threat/topology:** the prisoner's wards recognize the office and release or relocate the captive along
   a committed route; the current infiltration/rescue threat is resolved in a new political crisis.

**What it breaks:** the infiltration sequence, archive-gating puzzle, prisoner-rescue route, cult hierarchy,
prophecy plan, and the bard's identity boundaries. The lie becomes a durable source of authority and
obligation rather than a temporary disguise.

##### Extreme H — the empty cell becomes the Door of the Unforgotten

The investigator's `20/20` search finds the hidden child's note and follows what happened to the prior
prisoner. A maximal braid might commit:

1. **Knowledge:** the note becomes a living evidentiary root that reveals every handler, transfer, false
   record, and presently knowable destination in this prisoner's disappearance.
2. **Topology:** the loose stone opens the **Door of the Unforgotten**, a persistent passage to the nearest
   viable point on the missing prisoner's true route—even across a realm boundary if the causal trail goes
   there.
3. **Bond:** writer and finder become capable of bounded two-way correspondence through additions to the
   note while both remain recoverably extant.
4. **Restoration/quest:** if the missing person is alive and reachable, the route makes immediate rescue
   possible; if established canon says otherwise, it instead restores remains, identity, proof, or the
   truth required to resolve the loss without retconning death.
5. **Place/local law:** this cell can no longer erase an unjust prisoner's identity from records or memory;
   names and evidence suppressed here leave a discoverable trace.

**What it breaks:** the paced disappearance mystery, prison transfer network, ordinary geographic rescue
route, institutional cover-up, and perhaps inter-realm travel. A minor note becomes permanent infrastructure
against enforced disappearance.

##### Extreme I — surfaced Mythic bread ends the famine loop

The offscreen baker normally receives no individual Crit Magnitude roll. In a surfaced royal-feast action,
however, the player and baker use cursed grain to feed a famine-struck city and roll `20/20`. A maximal
braid might commit:

1. **Creation/material:** the bake produces a living starter whose bread multiplies enough to meet a
   bounded daily subsistence load when maintained under explicit communal conditions.
2. **Local law/restoration:** the grain curse reverses within the city's food domain, converting afflicted
   stores into safe nourishment rather than merely purifying one batch.
3. **Threat/world:** the active famine front ends in this city; hoarders, relief factions, prices, unrest,
   migration, and enemies must react to the new abundance instead of continuing the shortage script.
4. **Bond/institution:** a communal oven order forms around stewardship and fair distribution of the
   starter, with rules, NPC roles, stores, failure modes, and service obligations.
5. **Doer/name:** the responsible cook/baker gains a mechanically meaningful bread-name or blessing tied to
   feeding communities, drawing gratitude, imitation, exploitation, and divine or factional attention.

**What it breaks:** the food-shortage resource loop, famine quest, local staple economy, unrest schedule,
and possibly future survival pressure in the city. The joke is only eligible because breadmaking became a
real surfaced action with city-scale stakes; once eligible, the honest Mythic roll is not suppressed.

##### Extreme-pass findings

- A five-lens Mythic success should often end, obsolete, or transform the quest that produced it. Preserving
  the planned adventure is not a protected invariant.
- “Wondrous” does not mean consequence-free. New gates, titles, institutions, cures, and local laws create
  attention, duties, enemies, migration, economic reactions, and maintenance—not as balance punishment,
  but because the world honestly responds to a new fact.
- Anchor coverage prevents game-breaking power from becoming arbitrary wish fulfillment. The Key of
  Restitution opens unjust theft/imprisonment locks, not every door in existence; the scope is enormous but
  causally shaped.
- Mythic success may invalidate difficulty in its earned domain. The engine must not secretly restore the
  same obstacle under a new name or reactively scale enemies to cancel the victory.
- Typed effects and commitment capsules matter more, not less, at this scale. Each broken subsystem needs
  an explicit new rule, owner, provenance root, evidence projection, and downstream invalidation/reaction
  path.

#### 10.11.42 Ruling — conservative Mythic by default; Worldbreaker crits as an opt-in profile

Adam wants both calibration passes as playable options. Default play uses the more conservative `20/20`
outcomes from §10.11.40. An optional setting enables the deliberately game-breaking `20/20` outcomes from
§10.11.41 because some players will love campaign-warping dice while others will hate them. Genesis should
be highly configurable by the end, and future designs must preserve that direction.

This is not a frequency, honesty, or eligibility toggle. Both modes retain:

- surfaced-spotlight d20 eligibility and no crit fishing;
- natural 20 followed by magnitude 20 as the 1-in-400 Mythic-success trigger;
- open `d3 + 2` distinct lens draws;
- persistent typed effects, atomic commit, provenance, and reactive anchor coverage;
- no cooldown, pity correction, secret downgrade, or post-roll cancellation;
- the rule that only magnitude 20 receives extra persistent world-mutation authority.

The setting changes the **reach envelope and legal systemic depth** of those same honest lenses.

##### Recommended user-facing profiles

| Profile | Default | Mythic authority |
|---|---:|---|
| **Mythic** | **Yes** | Permanent, wondrous, and situation-reactive, but concentrated around the scene, active story, and directly attached owners. It may create the Light of Lathander, repentance, a hideout revelation, and an organically maintained shrine without routinely invalidating whole subsystems. |
| **Worldbreaker** | No; explicit opt-in | May spend the same lenses at campaign/systemic depth: obsolete the current quest or dungeon route, create reusable capabilities, establish powerful local laws or institutions, change regional ecology/economy/faction balance, break threat fronts, or create consequential realm topology. |

“Mythic” is the proposed default label rather than “Conservative,” because the default remains capable of
permanent miracles and catastrophes and should not be framed as the lesser or cowardly way to play.
“Worldbreaker” accurately warns and attracts the audience for the expansive mode.

##### Same roll, different reach profile

For the confiscation chest:

- **Mythic:** the loot improves, the corruption network is revealed, a victim bond forms, and the jail or
  rogue receives a permanent but site-rooted change;
- **Worldbreaker:** the lock becomes the reusable Key of Restitution, all unjust locks in the institution
  fail, the full operation collapses, and claimant politics restructure the region.

For the planar crystal:

- **Mythic:** the town is saved, the crystal receives a durable stabilizing law, the wizard/town bond
  changes, and the hell threat suffers a lasting local defeat;
- **Worldbreaker:** the crystal becomes a regional planar anchor and controlled gate, restores partially
  absorbed structures, severs the hell power's claim, and grants the wizard a reusable gate authority.

The DM does not decide which temperament to use after seeing the dice. The `CheckContract` snapshots the
active campaign profile before the first d20, and the `CritMandate` inherits that profile/version. Lenses
resolve against the corresponding reach permissions.

##### Configurability architecture law

Genesis should not implement this as scattered checks such as `if (worldbreaker)` inside individual
spells, lenses, or renderers. A versioned, persisted `CampaignRulesProfile` should resolve player-facing
presets into bounded mechanical capabilities:

```text
crit.mythicProfile
crit.reach ceilings by spatial/domain, permanence, systemic depth, reversibility, and count
crit.permissions for reusable capability, quest invalidation, topology, institution, economy/ecology,
  faction/threat, and other typed effect families
rules-profile id/version and mod/source provenance
```

Typed adapters ask the resolved capability contract whether a proposed effect is legal; narration and
rendering consume the accepted receipt. The rule profile is saved with the campaign, exposed to the DM
handoff, included in deterministic traces, and stored on every exceptional outcome so later profile or mod
changes cannot reinterpret old canon.

The source should remain human-readable and mod-friendly—preferably compiled from the same table/roller
authoring idiom Genesis uses elsewhere—while runtime consumes a normalized profile. Presets provide a
simple surface for ordinary players; eventual advanced controls may expose selected independent levers.
Player-experience settings should remain orthogonal: Worldbreaker crits must not secretly imply harder
combat, greater hunger, inflated enemies, or a different economy difficulty.

This establishes a general forward rule for the redesign:

> When a decision represents a genuine difference in desired play rather than a correctness invariant,
> design a centralized, versioned control surface for it instead of hardcoding one taste as universal.

Not every implementation constant becomes a checkbox. Settings must correspond to comprehensible play
experiences, compose without contradiction, and use presets to prevent an unusable wall of knobs.

##### Open follow-up — when may the profile change?

Three plausible policies remain:

1. **World-creation lock:** choose once when creating the campaign. Strong reproducibility, but too rigid
   for players who discover their preference after several sessions.
2. **Unrestricted live toggle:** change at any time. Flexible, but permits switching after seeing a natural
   20 or while a cascade is being resolved and makes provenance ambiguous.
3. **Nonretroactive between-resolution toggle:** allow changes between fully resolved turns/scenes; snapshot
   the profile at `CheckContract` creation, forbid changes during a pending action/cascade, record the rules
   change in the Ledger, and never upgrade/downgrade existing outcomes. **Recommended.**

**Open follow-up:** should Mythic/Worldbreaker be a campaign setting that may be changed between resolved
actions or scenes, with every change ledger-recorded and strictly nonretroactive, while the profile is
frozen from check authorization through cascade commit?

#### 10.11.43 Ruling — reach-profile changes are between-resolution and nonretroactive

Adam locks the recommended switching policy. Mythic/Worldbreaker is a persisted campaign setting that may
change between completely resolved actions or scenes. It is not permanently fixed at campaign creation,
and it is never a live post-roll escalation switch.

- `CheckContract` snapshots the active profile id, version, normalized capabilities, and mod/source
  provenance before the first d20;
- that snapshot remains immutable through natural roll, magnitude roll, lens/count rolls, plan validation,
  atomic commit, and narration receipt;
- the setting UI is unavailable while an action/cascade is pending;
- every profile change is a sourced Ledger/rules event with the effective world time and prior/new profile;
- existing outcomes retain the profile snapshot under which they were created and are never upgraded,
  reduced, rerolled, or reinterpreted after a switch;
- scheduled/deferred manifestations continue under their originating mandate, while genuinely new actions
  use the currently active profile;
- save/replay, DM handoff, debugging traces, and mod reconciliation expose the active and originating
  profile rather than inferring temperament from prose.

This allows players to discover their preferred style without permitting a natural 20 to be held open
while the campaign changes from Mythic to Worldbreaker. The profile-switch follow-up is closed.

#### 10.11.44 Consolidated ruling — successful Crit Magnitude ladder

Adam previously accepts the conservative skill-crit spreads as implementable, clarifying that magnitude 19
is essentially magnitude 20 with only two lenses and no extra permanence: it is difficult enough to reach
after a natural 20 that it should be generous. Combined with the later two-profile ruling, the successful
ladder now resolves as follows:

| Natural | Magnitude | Degree | Bonus resolution beyond core success |
|---:|---:|---|---|
| 20 | 1–15 | **Standard Critical Success** | No bonus lens; guaranteed best lawful ordinary success with style and excellence. |
| 20 | 16–18 | **Amplified Critical Success** | One situation-reactive bounded reward lens; no extra persistent world mutation. |
| 20 | 19 | **Legendary Critical Success** | Two distinct situation-reactive bounded reward lenses; no extra persistent world mutation. |
| 20 | 20 | **Mythic Critical Success** | Open `d3 + 2` persistent lenses resolved under the snapshotted Mythic or Worldbreaker reach profile. |

The same orthogonal lens axes may guide all three elevated degrees, but the adapter mode differs:

- **bounded reward mode** at 16–19 may improve mastery, material reward, information, access, objective
  progress, immediate social response, or established character expression; it cannot independently
  install a permanent supernatural/campaign system;
- **persistent mutation mode** at 20 uses typed owner events and may create durable person, place, law,
  topology, group, threat, knowledge, character, and other lens effects at the selected reach profile.

“No extra permanence” does not erase ordinary transaction truth. An opened lock stays open, awarded loot
remains awarded, witnesses retain learned facts, and quest progress remains committed. The restriction is
that the magnitude-16–19 lens does not independently mint a permanent world rule, supernatural trait,
institution, Breach, or equivalent mutation.

Magnitude-19 reward lenses cover distinct genuine anchors where possible. A low-tier reward container
guarantees one materially affiliated reward improvement inside its legal envelope, because the target
itself makes that lane active; its other lens may reward story, mastery, objective, character, or another
genuine target affinity. The engine never reduces a later reward to reimburse the crit.

This closes the reopened successful-band distribution and its bounded-spread count. Playtest evidence may
later tune content and caps, but the implementable contract is now 15 faces Standard, 3 faces one-lens
Amplified, 1 face two-lens Legendary, and 1 face persistent Mythic.

#### 10.11.45 Open decision — should natural-1 magnitude mirror 15/3/1/1?

The successful ladder is now mathematically and experientially clean. The failure side still uses the old
provisional distribution in `CRIT-MAGNITUDE.md`: ten Standard faces, four minor-Amplified faces, five
major-Amplified faces, and one Mythic face. That would make half of all natural-1 failures generate bonus
complication lenses while only one quarter of natural-20 successes generate bonus reward lenses.

The magnitude die runs downward on a natural 1: lower is worse. Three plausible calibrations remain.

##### Option 1 — exact 15/3/1/1 mirror

| Natural | Magnitude | Degree | Bonus resolution beyond core failure |
|---:|---:|---|---|
| 1 | 6–20 | **Standard Critical Failure** | Core failure at the declared ordinary stakes; no bonus lens. |
| 1 | 3–5 | **Amplified Critical Failure** | One bounded situation-reactive complication lens; no extra persistent world mutation. |
| 1 | 2 | **Legendary Critical Failure** | Two distinct bounded complication lenses; no extra persistent world mutation. |
| 1 | 1 | **Mythic Critical Failure** | Open `d3 + 2` persistent failure lenses under Mythic or Worldbreaker reach, plus the Mythic end of the declared core stakes. |

This gives success and failure the same 75% Standard / 15% Amplified / 5% Legendary / 5% Mythic shape
after their triggering natural. It is easy to understand, table, trace, and mod. **Recommended.**

##### Option 2 — failure spikes only at the very bottom

Make magnitude 3–20 Standard, magnitude 2 Legendary, and magnitude 1 Mythic, with no one-lens Amplified
failure tier. This reduces disruptive fumble comedy/cost and makes failure less punishing than success is
generous, but discards the useful middle complication beat. It fits a more forgiving profile but is not the
best universal baseline.

##### Option 3 — retain the legacy asymmetric failure table

Keep 11–20 Standard, 7–10 one lens, 2–6 two-to-three lenses, and 1 Mythic. This makes natural-1 cascades
twice as common as natural-20 reward spreads and preserves the earlier authored table, but it no longer
matches the newly accepted degree structure and will make foregrounded combat/check failures generate much
more narrative/state workload than successes. **Not recommended.**

Concrete cult-infiltration calibration under Option 1:

- **1/6–20:** the cover fails within declared ordinary stakes—the guard refuses access or initiates the
  established suspicion response;
- **1/3–5:** one additional bounded complication fires, such as a credential being retained, a checkpoint
  alert, or a time/noise cost;
- **1/2:** two complications might expose the cover to this cell of the cult and advance the prisoner's
  danger clock, without making the false name a permanent curse;
- **1/1:** the core stakes reach their lawful Mythic failure end and three to five persistent lenses may
  curse the false identity, empower the prophecy, unleash the threat, transform faction alignments, or open
  a terrible route at the selected reach profile.

The town-crystal rule remains intact: on a legitimate existential stabilization check, `1/1` may send the
town into oblivion because terminal loss was in the declared stakes. The rolled persistent lenses describe
the additional causal cascade; the profile determines whether that cascade stays concentrated or becomes
Worldbreaker-scale.

**Recommendation:** Option 1, the exact inverted mirror. It preserves the same emotional rhythm in both
directions, keeps persistent change exclusive to double extremes, and makes the full Crit Magnitude table
human-readable as one 15/3/1/1 pattern read upward for success and downward for failure.

**Open decision:** should natural-1 magnitude lock to the exact inverted mirror—6–20 Standard, 3–5 one
bounded complication lens, 2 two bounded complication lenses, and 1 Mythic `d3 + 2` persistent lenses?

#### 10.11.46 Ruling — natural-1 magnitude is the exact inverted mirror

Adam locks Option 1. Natural-1 magnitude uses the exact inverted 15/3/1/1 distribution:

| Natural | Magnitude | Degree | Bonus resolution beyond core failure |
|---:|---:|---|---|
| 1 | 6–20 | **Standard Critical Failure** | Declared ordinary failure envelope; no bonus lens. |
| 1 | 3–5 | **Amplified Critical Failure** | One situation-reactive bounded complication lens; no extra persistent world mutation. |
| 1 | 2 | **Legendary Critical Failure** | Two distinct situation-reactive bounded complication lenses; no extra persistent world mutation. |
| 1 | 1 | **Mythic Critical Failure** | Open `d3 + 2` persistent failure lenses under the snapshotted reach profile, plus the Mythic end of the declared core stakes. |

The complete Crit Magnitude ritual is now human-readable as one pattern:

```text
natural 20 reads magnitude upward:   1–15 / 16–18 / 19 / 20
natural 1 reads magnitude downward: 20–6  / 5–3   / 2  / 1
degree face counts:                 15 Standard / 3 Amplified / 1 Legendary / 1 Mythic
bonus lens counts:                  0 / 1 bounded / 2 bounded / d3+2 persistent
```

The exact mirror governs distribution, number of reward/complication axes, and persistent threshold. It
does not require success and failure to share tone or core stakes: Standard success is stylish excellence;
Standard failure is the ordinary declared failure; Mythic success is wondrous; Mythic failure follows the
scene's fairly declared harm register and may be terminal when terminal danger was genuinely at stake.

The legacy asymmetric failure table is superseded for redesign/spec purposes. The locked
`CRIT-MAGNITUDE.md` and implementation remain unchanged until an authorized build/spec amendment.
The mirrored-distribution decision is closed.

#### 10.11.47 Open configurability follow-up — must success and failure share reach profile?

The exact mirror need not force the optional Mythic reach ceiling to be identical in both directions.
Different players may genuinely want:

- restrained persistent miracles and restrained persistent catastrophes;
- Worldbreaker triumphs but scene-rooted Mythic failures;
- scene-rooted Mythic triumphs but Worldbreaker disasters;
- Worldbreaker extremes in both directions.

##### Option 1 — one linked reach setting

`Mythic` or `Worldbreaker` applies to both `20/20` and `1/1`. This is simple, symmetric, and makes the
setting easy to explain, but a player who wants extravagant earned victories without region-erasing
fumbles cannot express that preference. It also hardcodes a coupling that the typed resolver does not
mechanically require.

##### Option 2 — expose separate success and failure settings immediately

Players select reach for Mythic success and Mythic failure independently from the start. This gives full
control but adds conceptual weight to an already unusual rules screen before many players have experienced
one double extreme.

##### Option 3 — independent engine fields, linked presets by default, advanced split later

Store and snapshot independent capabilities from the beginning:

```text
crit.successMythicProfile: mythic | worldbreaker
crit.failureMythicProfile: mythic | worldbreaker
```

The ordinary setup surface initially offers clear linked presets:

- **Mythic:** restrained reach in both directions—the default;
- **Worldbreaker:** expansive reach in both directions—the explicit chaos opt-in.

An advanced control, later release, or mod may expose the mixed combinations without a save-schema or
effect-contract migration:

- **Heroic Wild:** Worldbreaker successes, restrained failures;
- **Doom:** restrained successes, Worldbreaker failures.

The two values obey the same nonretroactive between-resolution switching rule and are snapshotted by the
`CheckContract`. Dice probability, mirrored lens count, anti-fishing, and anchor coverage never change.

**Recommendation:** Option 3. It costs little in the foundational schema and validator because the same
reach contract already resolves by direction, preserves a simple default UI, and honors Adam's long-term
configurability goal without presenting every player with a wall of knobs.

**Open follow-up:** should the engine represent success and failure Mythic reach independently from the
start, while the initial player-facing settings expose only the linked Mythic and Worldbreaker presets and
reserve mixed Heroic-Wild/Doom combinations for advanced configuration later?

#### 10.11.48 Ruling — independent reach fields beneath simple linked presets

Adam locks Option 3. The foundational campaign rules schema stores and snapshots Mythic-success reach and
Mythic-failure reach independently:

```text
crit.successMythicProfile: mythic | worldbreaker
crit.failureMythicProfile: mythic | worldbreaker
```

The initial player-facing interface exposes only the clear linked presets:

- **Mythic** (default): `mythic / mythic`;
- **Worldbreaker** (explicit opt-in): `worldbreaker / worldbreaker`.

Later advanced configuration or mods may expose the already-supported mixed combinations without changing
save shape or exceptional-outcome contracts:

- **Heroic Wild:** `worldbreaker / mythic`;
- **Doom:** `mythic / worldbreaker`.

Each direction's field follows the same between-resolution, ledger-recorded, nonretroactive switching law.
`CheckContract` snapshots the directionally applicable profile before dice, and no interface or DM action
may switch it while resolution is pending. Frequency, mirrored 15/3/1/1 distribution, count, anchor
coverage, persistence threshold, and dice honesty remain invariant across every combination.

This closes the reach-direction configurability follow-up.

#### 10.11.49 Resumed open decision — terminal disposition must outgrow `obliterated`

The Crit Magnitude branch now returns to the paused §10.11.35 question. The current `obliterated` boolean
only tells projection code not to stage a corpse. It cannot distinguish outcomes that the newly accepted
Mythic/Worldbreaker failure profiles may produce, and the problem also exists for ordinary spells,
environmental hazards, transformation, and Breach events independent of crits.

The recommended typed `TerminalDisposition` records the resolved semantic axes once:

```text
life/continuity: dead | banished | transformed | consumed | erased
body/remains: intact | damaged | ash | fragments | object | none
location/destination: current site | named holder/container | other place/realm | none
inventory: on remains | dropped | transported | damaged bundle | destroyed bundle
recovery: ordinary death rule | special requirement | blocked | impossible
evidence/trace: corpse | stain/scorch | fragments | portal residue | object | witnessed absence
identity/canon: observed history preserved; exceptional name/soul/history changes require explicit authority
```

That makes materially different results stay different:

- a fire death may leave a charred body, damaged inventory, and a scorch trace;
- disintegration may leave no usable remains while applying its declared equipment rule;
- banishment moves the living target and carried equipment to a named destination rather than killing it;
- petrification leaves a located stone object with identity, equipment relationships, and a special
  recovery route;
- planar consumption moves or contains the target under a Breach/root owner and leaves causal evidence;
- Mythic erasure may forbid ordinary recovery and leave no remains, but it remains a provenance-kept event
  after prior history rather than pretending the target never existed unless a separately licensed lens
  changes memory/name/history.

The ordinary default remains intact corpse plus carried loot under the existing death/decay rules. Effects
override only the axes they explicitly own. Bundle profiles avoid per-item physics while permitting
protected/story-item exceptions. The renderer may temporarily derive `obliterated` as a compatibility
projection, but the boolean no longer decides gameplay.

The alternatives remain a caller-by-caller boolean with inevitable drift, or one universal obliteration
bundle that incorrectly treats fire, banishment, petrification, and erasure as metaphysically identical.

**Recommendation:** adopt the typed terminal-disposition receipt. It resolves only at death/removal events,
so runtime cost is negligible; the moderate build cost prevents much larger contradictions across loot,
corpse persistence, evidence, revival/recovery, quests, rendering, and Breach topology.

**Resumed open decision:** should Genesis replace `obliterated` as world-state authority with this typed
terminal-disposition model, retaining the boolean only as a temporary renderer compatibility field?

#### 10.11.50 Ruling — terminal outcomes use typed disposition, not an authority boolean

Adam accepts the typed `TerminalDisposition` model. `obliterated` may survive temporarily as a renderer and
migration projection, but it no longer owns gameplay truth. Death, banishment, transformation, planar
consumption, disintegration, petrification, and Mythic erasure resolve their life continuity, remains,
destination, inventory, recovery, evidence, and identity/canon consequences explicitly.

Ordinary death retains the existing default: an intact corpse plus carried loot, governed by normal
clock/context recovery and disturbance. Special effects override only the disposition axes they actually
license. Bundled equipment profiles prevent per-item physics while supporting explicit protected/story-item
exceptions. Every terminal receipt preserves causal provenance and prior observed history unless a
separately authorized name/memory/history effect changes what later actors know or remember.

This closes the terminal-disposition follow-up.

#### 10.11.51 External play reference audit — “Double Dragon Multiverse Campaign”

Before continuing the redesign, Adam supplies the public Gemini conversation that inspired Genesis:

<https://share.gemini.google/cDjGQD2scNiO>

The public link resolves to the published Gemini share titled **Double Dragon Multiverse Campaign**. The
page exposes 39 complete user/Gemini turn pairs and roughly 105,000 text characters. The first visible turn
is Adam's full DM operating prompt; the final visible turn is Gemini explaining that its own active memory
could only reach back to Danzig's later sleight-of-hand scene and had lost the beginning while attempting to
generate a complete PDF. All 39 public user messages and all 39 public responses were present and read.

Access limitation: the page marks the uploaded DMG attachment as not shown, so its file contents cannot be
audited from the share. The two Gemini-generated PDF artifacts are visible as conversation events, but the
analysis concerns the complete published textual exchange rather than trusting either incomplete PDF.

This is a design reference, not content authorization to ship copyrighted franchise characters, lyrics,
or songs. Genesis should reproduce the play dynamics through IP-clean archetype grammars, user-supplied
local motifs, and mod/content surfaces rather than hardcoding the particular franchises.

#### 10.11.52 What made the session exceptional

The session's core pleasure was not merely energetic prose or familiar references. Gemini repeatedly took
an action-created fact and turned it into the next playable affordance:

```text
failed attack
  -> brandy-soaked/flammable character
  -> snow chosen to remove flammability
  -> failed detonator kick relocates the device into the roof
  -> chrono-static blast becomes a realm-transition event
  -> stolen flying vehicle accumulates position, damage, party-mode, and pursuit state
  -> critical mace strike embeds a real anchor and punctures a fuel line
  -> fuel trail becomes a solid-light route
  -> route + vehicle + group call enables the portal escape
  -> aftermath produces relationship-rooted loot and the next threat root
```

The fun therefore came from **causal generosity**: the DM treated player inventions, failures, props, NPC
reactions, and prior consequences as handles instead of resetting each check into an isolated pass/fail.
Specific strengths follow.

##### 1. Failure created a new situation rather than a dead end

Danzig's poor rolls drove prone, flammable, misplaced-device, wrong-control, dangling, spinning-vehicle,
and other playable states. The consequences were immediately legible and created different choices. The
player came to enjoy Danzig's bad-roll identity because failure generated authorship rather than withholding
play.

The correct Genesis lesson is not “turn every failure into secret success.” A failed roll must honestly
miss its declared objective. It should then commit a concrete complication, changed position, cost, threat
advance, lost resource, exposure, or new affordance from the established scene.

##### 2. Props accumulated identity and mechanical history

The door, tables, brandy shelf, snow, corpse, detonator, vehicle, dashboard controls, embedded mace, leaking
fuel, grappling line, billboard, and portal were not disposable dressing. Interaction promoted them into
stateful objects. Later narration reused their conditions instead of forgetting them. The embedded mace in
particular became position anchor, constraint, fuel damage source, solid-light route cause, and eventual
escape mechanism.

This directly validates Wave 1's accepted promotion law: generated dressing may begin lightweight, but the
moment a player relies on it, the engine must validate/promote it and give the DM real handles for state,
affordances, exhaustion, effects, and later projection.

##### 3. Player-supplied motifs became reciprocal play

The players supplied catchphrases, musical cues, franchise recognition, jokes, and action framing. Gemini
did not merely acknowledge them; NPCs answered, the scene's aesthetic shifted, and later beats reincorporated
them. This made the experience feel co-authored rather than consumed.

Genesis needs a safe distinction:

- player language and motifs may become sourced callback/story cards and scene texture;
- established creative contribution may earn Inspiration, advantage, a group-combo opportunity, reputation,
  or another explicit bounded reward;
- a joke or phrase may not counterfeit a natural crit or silently mint unbounded mechanics;
- recurring user-supplied references remain local/mod/user content unless independently licensed for
  shipped material.

##### 4. The two players built one crisis together

The best sequence was a cooperative action chain rather than two isolated turns. One player cleared the
door so the other could kick the device; one caught passengers while the other piloted; Guidance supported
a maneuver; the mace anchor enabled rescue and later propulsion; NPC allies occupied meaningful roles.

Genesis needs a scene/challenge owner that can hold a shared objective, threat, cast positions, active
assets, complications, clocks, and each contribution's effect on the next legal action. It must not reduce
the sequence to an abstract progress bar, but an optional progress/risk summary may derive from the actual
facts.

##### 5. NPCs were immediately playable

The turtle analogues had sharply legible voices, methods, wants, props, and combat roles. Food, technical
analysis, aggression, and leadership gave players obvious social handles. The party's improvised relationship
then paid out through help, banter, rescue, farewell, and a keepsake rooted in shared events.

This is casting rather than generic NPC generation: stable identity plus live role in the current problem.
It supports the redesign's cast resolver, group membership, motive, relationship, and salience promotion
direction.

##### 6. Pace came from escalating external pressure

Every resolved beat exposed a next pressure: bounty hunter, detonator, realm blast, law patrol, hijacked
vehicle, pursuers, gridlock, interceptor, tractor beam, portal. The story almost never returned to neutral
between actions. The ending nevertheless supplied earned breathing room, social payoff, distinctive loot,
and a new root connecting the set piece back to the original world.

The mechanical target is a pressure/front hand that reacts to receipts—not a requirement that every turn
invent a larger threat. Quiet beats, aftermath, and rests are necessary contrast. Salience and active-hand
capacity decide when another pressure can enter.

##### 7. The reward commemorated what actually happened

The paired communication items were not anonymous treasure. Their form and cooperative initiative benefit
referred to the relationship and shared escape. The later body search produced material loot, evidence,
and a causal lead to the next threat.

Genesis should mint exceptional keepsakes through reward envelopes that consume participant, motif,
relationship, action, and event provenance. The item becomes a mechanical memory of play rather than a
random rarity upgrade.

#### 10.11.53 Where Gemini drifted—and what the engine must own

The same transcript is an unusually clear failure audit because the prose remained entertaining while
state and rules degraded.

##### Identity and cast drift

- The opening established four silhouettes but only some entered and received explicit positions.
- Gemini initially mislabeled the red-bandana actor as Leo; Adam corrected the identity to Raph.
- Later responses again used Leo in dialogue without a valid tracked location/entrance, and only after Adam
  repeatedly asked where Leo was did the narration place him on a nearby vehicle and reunite all four.
- The proprietor largely vanished from active casting during the transition and reappeared afterward with
  a condition supplied by prose rather than an audited state path.

Required owner: a `CastRoster`/entity projection with canonical id, aliases, group membership, current
location/zone, continuity state, initiative/availability, motive, voice cues, equipment, knowledge,
relationship, and last sourced transition. Narration may mention an actor only if the receipt includes that
actor or a validated entrance/promotion event creates the reference.

##### Character sheet and rule drift

- Gemini offered a spell Rajrik did not know; Adam had to correct it.
- It first missed Danzig's Dexterity modifier, then later accepted an erroneous +5 Athletics modifier even
  though the supplied sheet supported +3.
- Separate attacks reused one supplied roll; damage, NPC attacks, saves, and several benefits were rolled or
  invented opaquely.
- Resource/duration handling drifted: Guidance was reused after its check, Warding Flare was treated as a
  short-rest recovery, and spell/feature ownership was not consistently derived from the sheet.
- Position, action economy, reactions, difficulty, hit points, advantage/disadvantage, and rest effects were
  sometimes handled for momentum rather than from one authoritative resolution spine.

Required owner: the existing sheet/resources/combat/conditions systems must issue the legal action surface,
modifier, roll mode, cost, DC/defense, damage/healing, duration/expiry, and receipt. The DM may frame and
narrate but cannot substitute remembered arithmetic or improvise a missing feature.

##### Dice-authority drift

- A low noncritical roll was treated as though it carried magnitude authority.
- A group catchphrase later triggered a large “magnitude” shield without the required natural result and
  second d20.
- At least one check explicitly missed its declared DC but narration still granted the practical objective.
- Some failures generated excellent forward motion but quietly softened or reversed the actual result.

Required owner: `CheckContract -> open dice -> ResolutionReceipt`. Crit Magnitude can fire only through the
shared eligible d20 path. Creative-group energy needs a separate legal `Style/Combo` channel so the game can
reward a synchronized call or audacious stunt without lying about the dice.

##### Causality lived only in prose

The strongest states—flammable, chilled, detonator location, chrono-static, vehicle orientation, passenger
positions, embedded mace, fuel leak, party mode, gridlock, solid-light route, pursuit distance, portal,
NPC allegiance, and keepsake provenance—were mostly remembered sentences. Gemini did remarkable short-term
weaving with them, but no authoritative object ensured expiry, legality, replay, save/load, or later reaction.

Required owner: a typed `SceneFactGraph` whose facts record source event, owners/targets, state, evidence,
afforded actions, dependencies, expiry/consumption, and projection. DM invention becomes legal when it is
validated and captured into that graph, Codex, Ledger, relationship, topology, item, condition, or other
canonical owner in the same turn.

#### 10.11.54 Recommended mechanical reconstruction

Genesis's target is not “generate the same adventure.” It is:

> reproduce Gemini's causal generosity and reciprocal improvisation while the engine owns everything that
> Gemini forgot, miscalculated, fabricated, or silently softened.

The recommended live loop is:

```text
served scene bundle
  = CastRoster + SceneFactGraph + active pressures + places/props + player sheets + rules profile

player declares arbitrary intent and method
  -> ActionPlanner / CheckContract identifies targets, method, stakes, cost, legal effect envelope
  -> engine exposes roll and applies modifiers/resources
  -> receipt commits core result plus typed reward/complication/crit effects
  -> new/changed SceneFacts expose the next real affordances
  -> pressure/front hand reacts where due
  -> DM narrates only the accepted bundle and may propose capture-ready connective invention
```

##### A. `SceneFactGraph` — the missing center

Each promoted fact or condition should minimally carry:

```text
fact id/type; source event/roll; subject/target/holder; current location/zone
state and mechanical tags; evidence/knowledge boundary
affordances offered; dependencies and causal parents
duration/expiry/consumption/exhaustion; protected canon
projection needs; salience; owning adapter; reconciliation trace
```

Example chain:

```text
brandy_spill + character_in_zone -> soaked{flammable:true}
character_enters_snow -> soaked diluted/removed; chilled added
detonator moved_to roof -> blast origin changes
mace embedded_in vehicle -> anchored position + vehicle hull damage
hull damage at fuel line -> leaking fuel fact
chrono/static + luminous fuel + later authorized combo -> traversable solid-light route
```

The final transformation requires a legal effect/combo receipt; mere prose adjacency cannot manufacture a
bridge. But once committed, the route is real and can serve movement, pursuit, lighting, and later evidence.

##### B. `CrisisChain` / cooperative scene challenge

A live chase, escape, ritual, heist, negotiation, or environmental crisis needs a shared container:

```text
goal and failure stakes
active threats/fronts and clocks
cast/positions and turn/action ownership
assets, temporary facts, complications, and spent resources
legal contribution targets and combination opportunities
progress/risk summary derived from facts
terminal/transition conditions and aftermath obligations
```

Every roll must change an owned fact, cost, position, clock, knowledge state, or relationship. Suggestions
for a new player may be derived from actual legal affordances; they are examples, never the action whitelist.

##### C. `Style/Combo` is separate from Crit Magnitude

The group-call shield was joyful but mechanically dishonest under the declared crit rule. Genesis should
support the joy directly:

- player/NPC contributions can attach motif/callback tags to a shared active beat;
- an explicit rule may award Inspiration, advantage, temporary protection, coordinated movement, morale,
  or a one-scene combo when requirements are satisfied;
- every benefit declares duration, targets, stacking, costs, source contributions, and effect owner;
- style never fabricates a natural result, upgrades a magnitude band, or bypasses the Crit mandate.

This gives the DM permission to reward communal creativity without turning “say the magic phrase” into an
unbounded exploit.

##### D. `Motif/CallbackDeck` preserves player authorship

Player-supplied phrases, jokes, music references, names, fears, and aesthetic framings may enter a local
session deck with source, consent/visibility, attached actors/events, recurrence budget, tone, and mechanical
permission. The DM may reincorporate them where semantically relevant. Most callbacks are texture; some
attach to an explicit style, relationship, quest, or reward rule.

This is related to—but distinct from—world-generation motifs. It is the campaign learning what these players
find funny, heroic, frightening, or meaningful without granting the AI authority to rewrite mechanics.

##### E. `CastRoster` prevents the Leonardo failure

Groups require membership and individual state simultaneously. A four-member group can be established
without eagerly generating every biography, but surfaced members must receive stable ids and positions.
Identity constraints should prove:

- red/blue/purple/orange cues resolve to one canonical actor each;
- aliases and player corrections update the correct record with provenance;
- absent/offscreen/dangling/on-roof/in-cockpit actors cannot speak or act from another zone;
- reunification requires explicit movement/entrance/transition events;
- the DM digest includes the current cast and does not rely on conversation memory.

##### F. exceptional rewards mint from provenance

The end-of-sequence keepsake pattern should consume the relationship/event record:

```text
participants + rescued/helped relationship
shared motif and decisive actions
reward envelope/power cap
item function that recalls the play pattern
holder/custody and future reaction hooks
```

This can produce party-synergy items, titles, contacts, techniques, maps, or story tools whose mechanics are
bounded but whose meaning is unique to the campaign.

#### 10.11.55 Alignment with current Genesis direction

The reference strongly validates several systems already built or accepted:

- DM Charter's central law that deterministic state—not DM memory—is authoritative;
- Ledger/Codex/event provenance and same-turn capture of DM invention;
- conditions with engine-owned duration/expiry, concentration, spell/feature/resource legality;
- arbitrary-intent planning with `CheckContract`, transactional commit, and `ResolutionReceipt`;
- Crit Magnitude's open dice, anchor coverage, typed adapters, and distinct configuration profiles;
- narrative priority decks, salience, pressure/front scheduling, discovery cards, and persistent threat roots;
- place-object promotion and validated environmental creativity;
- cast/group/cohort distinctions and individual promotion on salience;
- typed terminal disposition, corpse/loot persistence, and aftermath rooted in actual events.

It also exposes important gaps that must enter later specs:

1. a general-purpose typed `SceneFactGraph` rather than condition tags plus prose;
2. a multi-actor `CrisisChain`/cooperative challenge owner;
3. cast identity/location validation at narration time;
4. a player-supplied `Motif/CallbackDeck` distinct from authored place motifs;
5. a bounded `Style/Combo` reward channel distinct from crits;
6. provenance-driven keepsake/reward minting;
7. digest projection that serves all active props, positions, effects, resources, NPCs, and unresolved
   pressures without overwhelming the DM;
8. executable traces proving a state created early in a long scene can be legally consumed much later
   without relying on context-window memory.

No build is authorized by this reference analysis. These requirements should sift the redesign and later
architecture/spec waves; they must not be bolted on as one giant subsystem without decomposition.

#### 10.11.56 Tensions and future decisions surfaced by the reference

##### Tutorial help versus player agency

The explicit action examples helped the new player understand movement, actions, bonus actions, reactions,
and possible checks. But later option lists sometimes became steering, repeated obvious advice, or framed
the situation as a menu. This conflicts with Genesis's current default DM rule against volunteered tactical
coaching.

A likely resolution is a per-player assistance profile rather than one campaign-wide DM temperament:

- **rules only:** answer questions and surface legal sheet/action information without suggestions;
- **affordance examples:** show a small number of context-legal examples plus an explicit open-input lane;
- **tutorial:** explain action economy and character features proactively, then taper as mastery grows.

This remains a future design question; the reference proves both the value and the cost.

##### Momentum versus honest failure

Gemini sometimes preserved excitement by letting a missed DC achieve the practical objective. Genesis must
instead preserve momentum through new state: failure may worsen position, advance threat, add cost, expose
another route, or create a partial result only when the pre-roll contract authorized partial success. The
DM cannot secretly change “failed to reach Donnie” into “reached Donnie with cosmetic scraping.”

##### Improvisational freedom versus state explosion

The scene generated many temporary objects and conditions quickly. Full simulation of every noun would be
too expensive; prose-only handling recreates Gemini drift. The accepted promotion model is the balance:
serve a bounded active scene bundle, promote only touched/relied-on nouns, aggregate inactive groups, give
temporary facts explicit TTL/consumption, and archive/compact resolved facts into evidence/history when the
scene ends.

##### Escalation versus saturation

The nonstop bomb-to-realm-to-police-to-chase-to-tank chain was exhilarating as a short session and exhausting
as a universal cadence. Mythic configuration, salience capacity, pressure decks, quiet beats, and player
momentum should determine when this density is legal. The engine should make this style reproducible without
making every cellar search become a trans-dimensional pursuit.

##### The design north star extracted from the game

> Genesis should feel as willing as this Gemini session to let a ridiculous player idea become the next
> real situation, while being categorically better at remembering who exists, where everyone is, what the
> dice said, which resources were spent, how long effects last, what objects can do, and what consequences
> remain after the laughter.

#### 10.11.57 Questionnaire relevance ruling and next live position

Adam asks that the Gemini lessons be inserted **additively** into every questionnaire section without losing
the original questionnaire. The preservation statement and supplemental `G1.1-G12.2` bank now live in the
question-wave protocol above.

The relevance audit finds no obsolete original wave and no original question that should be deleted:

- Wave 1's ontology remains valid and explicitly closed; its additive questions are validation against
  staged canon, definite lineage, promotion, and non-institutional site families, not an automatic reopening.
- Wave 2 Questions 1-11 remain valid. The original Question 11 material-flow ruling and its prior skeptical
  queue through typed terminal disposition have all received answers. The Gemini reference exposes two new
  Wave 2 integration questions—`G2.1 SceneFactGraph promotion` and `G2.2 CrisisChain ownership`—that must be
  discussed before proceeding to original Question 12.
- Waves 3-12 retain their original subject boundaries. Their new `G` questions sharpen the required
  integration and acceptance evidence rather than replacing their planned architectural work.

**Next live position:** Wave 2 remains open. Resume with **G2.1**, in plain English: when play turns an
ordinary generated noun or condition into something consequential, exactly what becomes engine truth, what
can it legally enable later, and how do we obtain that reliability without simulating every noun in the
scene? Exhaust its follow-ups, then G2.2, before returning to original Wave 2 Question 12. Do not declare Wave
2 complete or open Wave 3 until its original questions, additive questions, and all generated follow-ups have
passed the closure gate.


<!-- END VERBATIM MIGRATION: original lines 9802-12180 -->
