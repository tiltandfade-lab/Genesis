---
type: design-study
status: OPEN
wave: 10
part: 5
legacy_sections: "11.57-11.61"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 10 — Consequence Presentation

<!-- BEGIN VERBATIM MIGRATION: original lines 20558-21083 -->

### 11.57 F10.8a ruling and F10.8b expansion - causal cue scheduler accepted; choose input authority during playback

**Adam's ruling (2026-07-20):** choose Option B.

Committed receipts feed dependency-bearing transactional cue graphs. Hard causal edges remain serial; genuinely
simultaneous/independent siblings may overlap; repeated homogeneous feedback may compress only through explicit
cue-family law. Every affected identity/state remains readable through board/card/caption/history, and material PC,
named citizen, topology, hazard, condition, death, custody, or transformation consequences cannot disappear inside
crowd compression. Board truth is the minimum lane. Pause, speed, skip, reduced motion, lens state, or terminal
rebuild change presentation only and land on identical committed state. F10.8a closes.

#### F10.8b - may the player act while committed consequences are still being shown?

In plain English: mechanics may already know that the reaction hit, the fighter fell, and the door shattered while
the board is still animating the crossing. Should Genesis lock every input until all particles and narration finish,
let the player issue the next action against terminal state before seeing it, or separate harmless/drafting input
from mechanically consequential declarations and reopen those only at a player-visible decision boundary?

- **Option A - hard input lock until the entire cue graph and narration finish:** no action, selection, card,
  camera, or composer input is accepted until every animation/audio/caption/DM beat completes. This is simple and
  prevents visual races, but makes long queues feel non-interactive, lets cosmetic tails and slow Gemini prose block
  play, harms accessibility/control, and encourages players to skip everything merely to regain agency.
- **Option B - explicit decision-boundary gates with safe input and one editable pending intent (recommended):**
  camera/accessibility/speed/pause/skip/catch-up controls, log/card reading where safe, and chat drafting remain
  available. A new mechanically or fictionally consequential declaration may preview/commit only after all cues
  needed to understand its legal state have reached a player-visible stable boundary. The player may buffer one
  clearly pending editable/cancelable intent; it is revalidated at the boundary and never resolves against stale or
  unseen assumptions. Cosmetic tails and expressive narration cannot hold the gate closed.
- **Option C - optimistic input against canonical terminal state while presentation catches up:** the next action
  becomes selectable/committable as soon as mechanics finish, even if the board still shows the actor moving, the
  old door, living targets who are already dead, or prior custody. This maximizes speed but lets UI reveal or use
  outcomes before their cues, creates severe focus/camera races, and can make players issue actions they would not
  have chosen after watching the consequence.

Option B exposes a small presentation/input state machine:

| Presentation state | Player authority |
|---|---|
| **RESOLVING** | Required causal cues between the visible presentation cursor and the next decision boundary are still playing. Pause, speed, skip/catch-up, non-world UI, accessible review, camera controls that do not hide required truth, and composer drafting remain available. New consequential commits wait. |
| **PENDING INTENT** | The player may stage one clearly labeled editable/cancelable declaration for after resolution. It is not a committed action, spends nothing, creates no preview that leaks unseen state, and may be invalidated or require confirmation when the boundary arrives. |
| **DECISION READY** | Every material fact needed for the next choice has been shown through normal or reduced/static equivalents. Current legal selection, previews, object actions, and natural-language declarations may validate and commit. |
| **COSMETIC TAIL** | Nonessential particle decay, camera settle, sound reverb, or lens flourish may finish while DECISION READY input proceeds. Tail effects cannot conceal cells, targets, labels, cards, or new feedback. |
| **CATCH UP / REBUILD** | Skip or missed/background presentation applies all required static/terminal cues, cancels obsolete drawables, exposes a concise accessible consequence summary, and then enters DECISION READY. Mechanics never replay. |

The **decision boundary** is semantic, not “animation duration reached zero.” Required board/static equivalents for
new locations, spent resources, triggered reactions, damage/down/death, conditions, reveal, hazard/topology/object
state, custody, initiative/active actor, and other facts the next action may consume must be player-visible. A
fireball's smoke can linger after input reopens; Goblin 2 cannot remain visually alive/selectable when the next
turn begins if the receipt killed it.

Concrete examples:

- The fighter crosses a threshold and triggers a reaction. While crossing/reaction cues resolve, the player can pan,
  open the event summary, adjust speed, or draft `attack the cultist`. The attack cannot preview/commit until the
  reaction damage, fighter state, broken door, cell, and active-turn legality have been shown. If the fighter fell,
  the pending intent becomes invalid with the truthful reason; it never spends an action.
- A fireball damages six goblins. Once the area, each resulting damage/down/death/condition state, dropped object,
  and next active actor are visible, input reopens while smoke and sound tails fade. The player need not wait for
  six sequential recoil flourishes.
- The player opens and loots a chest. `Open` state and contents/custody transfer must visibly settle before a second
  pickup/use declaration. Lid wobble or sparkle may continue as a cosmetic tail. Clicking outside may close the card
  under its accepted law without canceling the committed receipt.
- The freight lift crashes. No next movement/path preview appears until new elevation, attachments, damage,
  topology, hazards, and active actor are shown. Catch Up may snap all those facts to their static terminal forms and
  present the consequence summary immediately.
- The persistent right-side composer remains typeable during playback. A world-mutating action submission becomes
  the single pending intent or waits for DECISION READY; Gemini prose cannot advance it early. Pure UI/OOC controls
  remain outside the world-action gate.

Pending intent must be conservative. It records the player's words/selected verb and any **already visible** target
reference, not an optimistic resolved path/area/cost derived from hidden terminal state. At DECISION READY the system
revalidates identity, viewpoint knowledge, target existence, legality, resource cost, current actor, and known
consequences. A harmless wording repair may proceed; a changed target, cost, or consequence requires an updated
preview/confirmation rather than silently substituting another action.

**Implementation/maintenance cost:** Option A is low-medium input-lock work and high pacing/accessibility/skip debt.
Option B is **high but reusable interaction orchestration**: canonical-head versus presentation-cursor tracking,
semantic decision boundaries, required-cue completion, safe-control routing, one pending-intent model, stale-intent
revalidation, composer integration, cosmetic-tail classification, catch-up summaries, focus/camera protection, and
fast-play fixtures. Option C is medium optimistic-UI work and very high race, leakage, stale-action, and trust debt.

**Codex recommendation: Option B.** Keep the interface alive while the world explains itself, but do not let the
player commit against consequences they have not yet been shown. Reopen at truth-complete decision boundaries, not
at the end of every flourish and not at the mechanics head.

Does Adam accept Option B, prefer complete input lock under Option A, prefer optimistic action under Option C, or
want to amend one input state? If B is accepted, follow into F10.8c: what pause, skip, interruption, tab-background,
save/load, and scene-switch operations do to an in-flight cue graph and its pending intent. Wave 10 remains **OPEN**;
no build is authorized.

### 11.58 F10.8b ruling and F10.8c expansion - truth-complete decision boundaries accepted; choose interruption recovery law

**Adam's ruling (2026-07-20):** choose Option B.

Genesis keeps safe interface authority alive while consequence presentation resolves, but it does not let a new
world-changing declaration commit against material consequences the player has not yet been shown. One pending
intent may be drafted, edited, or canceled without spending or leaking anything; at the truth-complete decision
boundary it is revalidated against the now-visible actor, target, location, legality, cost, knowledge, and
consequences. Material board/static truth opens the gate. Cosmetic tails and expressive Gemini prose do not hold it
closed. F10.8b closes.

#### F10.8c - what survives when consequence playback is interrupted?

In plain English: the fighter has crossed the threshold, the reaction receipt has committed, and the board is
halfway through showing the fall and shattered door. The player pauses, skips, changes tabs, saves and reloads, or a
legal transition leaves the room. Should Genesis preserve the exact animation frame, rebuild from committed truth
while accounting for what the player still needs to learn, or silently discard whatever presentation was missed?

- **Option A - exact audiovisual snapshot and exact-frame resume:** persist the active cue, animation time, particle
  population, camera tween, audio position, caption, Gemini sentence, focus, and pending intent, then resume from the
  same instant after every pause, background, save/load, or scene return. This promises cinematic continuity, but
  transient renderer/audio/stream state is brittle across versions and devices; a half-spoken line or half-drawn
  movement can be less comprehensible after a long absence; and exact resumption risks making presentation state a
  second world state.
- **Option B - canonical receipt cursor plus boundary-safe catch-up/rebuild (recommended):** persist committed world
  state, receipt head, the last player-visible semantic boundary, unresolved required presentation obligations, and
  any uncommitted intent draft—not exact particle or prose frames. Pause may preserve an in-memory frame; every
  lossy interruption can rebuild exact current board truth, realize missed material changes through static/reduced
  equivalents and a concise accessible consequence summary, cancel obsolete flourishes, revalidate the intent, and
  reopen only at DECISION READY. Nothing mechanical replays.
- **Option C - silent terminal snap:** on any interruption, discard the remaining cue graph and pending intent,
  redraw current canonical state, and immediately allow input with no missed-consequence account. This is simple
  and guarantees mechanical correctness, but the player may return to a dead ally, open vault, moved lift, missing
  object, or burning room without learning what caused the change.

Option B gives each interruption an explicit law:

1. **Pause:** freeze presentation clocks and spoken/caption progression in memory. Canonical turn-based mechanics do
   not continue merely because a visual clock is paused. Safe review, accessibility, and resume controls remain.
   The pending intent remains an uncommitted editable draft. A long/device-level pause may degrade to catch-up
   rebuild rather than demand exact-frame continuity.
2. **Skip / Catch Up to Current:** do not jump past meaning. Resolve every outstanding required cue obligation into
   its static or reduced-motion equivalent, rebuild terminal board/card truth, cancel cosmetic tails, and show one
   ordered, inspectable consequence summary. Skip changes duration and flourish, never receipt order, facts, or the
   next decision boundary.
3. **Hidden/background tab or missed frames:** do not rely on browser animation time to communicate events while the
   player cannot see them. On return, compare the player-visible semantic cursor with the canonical receipt head,
   rebuild if necessary, and present missed material consequences before enabling commits. The system need not
   replay idle particles or repeat every recoil animation.
4. **Save/load, refresh, crash recovery, or version-tolerant resume:** save canonical state and receipts first,
   together with a compact presentation checkpoint: last completed semantic boundary, unresolved required cue
   families/receipt range, acknowledged consequence-summary state, and the pending intent draft if safe. Do not
   serialize transient particles, audio samples, camera subframes, or Gemini token position as authoritative. Load
   rebuilds current truth and completes outstanding obligations without firing triggers, spending resources, or
   duplicating history.
5. **Scene/lens switch:** a merely presentational switch—opening a card, collapsing the lens, or moving between
   board/lens views—cannot lose obligations. A legal world transition may leave the source scene only after its
   decision-relevant outgoing consequences have reached a static/summary boundary; it then cancels source-scene
   flourishes and reconstructs the destination from canonical state. No cue continues invisibly in an abandoned
   renderer, and revisiting does not replay mechanics.
6. **New committed receipts while presentation trails:** append them in canonical order to the same dependency
   stream. A higher-priority reaction or crisis cue may pre-empt a cosmetic tail, never an unshown prerequisite.
   Presentation backpressure invokes typed compression or catch-up rather than reordering or erasing causes.
7. **Gemini-DM interruption:** streamed prose is presentation, not a transaction lock. It may pause, stop, or be
   replaced after recovery by a fresh expressive retelling of the same fact-locked receipts. Genesis preserves the
   causal content and viewpoint envelope, not the exact unfinished wording. Gemini cannot claim that an unseen cue
   completed or make save/load wait for a sentence.

Pending intent persists conservatively. It keeps the player's authored wording and references that were already
visible at drafting time, carries a conspicuous **uncommitted / recheck after catch-up** status, spends nothing, and
cannot preserve a hidden-state-derived path, target, cost, or preview. After rebuild, a still-identical harmless
intent may proceed to normal confirmation/commit; any material actor, target, legality, cost, knowledge, or outcome
change invalidates it or demands a new preview. An old draft never auto-fires on load or tab return.

Concrete dungeon/Gemini-DM examples:

- The fighter crosses a trapped threshold and the tab is backgrounded during the reaction. On return, Genesis shows
  the fighter prone at the committed cell, reaction damage, spent reaction, shattered door, and debris; an ordered
  summary explains the crossing and hit. The drafted `attack the cultist` remains visibly uncommitted and fails
  honestly if prone/current-turn law makes it illegal.
- The player skips a six-goblin fireball. The blast animation and repeated flinches compress away, but every current
  position, damage/down/death/condition state, dropped communicator, concentration loss, and next actor appears
  before input. The summary retains source and affected identities. Mechanics do not roll again.
- A save occurs after the freight-lift crash receipt but before the camera settles. Loading reconstructs elevation,
  attachments, damage, knocked-loose objects, hazards, and topology, then marks those consequence obligations
  acknowledged through the catch-up summary. It does not respawn falling particles or apply crash damage twice.
- The player collapses EngagementLens while oil ignition cues are running. The BattleMat/static lane still shows
  spill, ignition, affected cells, and current hazard; reopening the lens projects current truth rather than
  restarting the flame sequence.
- Gemini is cut off midway through describing a guardian's fall. On recovery it may say the same committed outcome
  in fresh dramatic language, but it cannot resurrect the guardian, invent a different cause, or force the player
  to hear the abandoned sentence before acting.

**Implementation/maintenance cost:** Option A is **very high and fragile**: serializing renderer/audio/camera/
stream internals, exact asset/version compatibility, lifecycle cleanup, and cross-device resume fixtures. Option B
is **high but bounded reusable recovery work**: semantic presentation cursors, required-obligation checkpoints,
static cue equivalents, terminal rebuild, ordered accessible summaries, pending-intent persistence/revalidation,
background detection, idempotence tests, and versioned checkpoint migration. Option C is low implementation cost
and high comprehension, accessibility, narrative-coherence, and player-trust debt.

**Codex recommendation: Option B.** Save truth and what the player is still owed, not a fragile audiovisual
instant. Recovery should reconstruct the exact world, summarize every missed material consequence in causal order,
and never replay mechanics or silently strand an intent.

Does Adam accept Option B, prefer exact-frame persistence under Option A, prefer silent terminal snap under Option
C, or want to amend an interruption law? If B is accepted, follow into F10.8d: how cue acknowledgment and the
missed-consequence summary avoid both mandatory click-through fatigue and unnoticed state changes. Wave 10 remains
**OPEN**; no build is authorized.

### 11.59 F10.8c ruling and F10.8d expansion - boundary-safe recovery accepted; choose consequence acknowledgment law

**Adam's ruling (2026-07-20):** choose Option B.

Interruption recovery preserves canonical world state, receipt head, the last player-visible semantic boundary,
unresolved required presentation obligations, and a conservative uncommitted intent draft. It does not make
particles, camera/audio subframes, or unfinished Gemini wording authoritative save data. Pause may preserve an
in-memory instant; lossy interruption, skip, background return, save/load, crash recovery, and scene transition
rebuild exact truth, discharge missed material cues through governed static/reduced equivalents and an ordered
summary, cancel obsolete flourishes, and revalidate without replaying mechanics. F10.8c closes.

#### F10.8d - must the player click through consequences to prove acknowledgment?

In plain English: after Catch Up, Genesis may need to say that the fighter fell, the door shattered, the key changed
hands, and fire closed the eastern route. Requiring `OK` after every change guarantees interruption; allowing the
summary to vanish as soon as it appears risks unnoticed state changes. What presentation law carries those facts
into the next decision without turning play into receipt administration?

- **Option A - explicit modal acknowledgment for every material transaction:** pause world input behind a receipt
  panel until the player clicks or confirms each committed event group. This gives a clear audit signal, but click
  count is not comprehension; repeated damage, reactions, movement, and environmental chains become modal churn;
  and impatient players learn to dismiss mechanically.
- **Option B - tiered nonblocking decision brief with durable recent-change trail (recommended):** required changes
  reach a stable visible board/card state and a compact causal brief at the decision boundary. Choice-invalidating
  facts stay anchored while input reopens; supporting detail remains expandable; bounded change traces persist
  through the next choice and then recede into inspectable recent history. No generic `I read this` click is
  required. Explicit reconfirmation is reserved for a materially changed pending intent or another action-specific
  ambiguity, not for consuming narration.
- **Option C - board-only truth with transient highlights:** redraw exact state, briefly pulse changed citizens/
  cells, and offer no separate consequence brief or persistent trail. This keeps the screen quiet and interaction
  fast, but a player can miss custody, concentration, reaction expenditure, forced movement, revealed objects, or
  the causal relationship between several simultaneous changes.

Option B distinguishes **delivery**, **decision relevance**, and **human attention** rather than pretending a click
proves understanding:

1. **Delivered, not psychically read:** Genesis may mark a presentation obligation delivered only when its material
   board/card/static equivalent and structured summary entry have been available together at a stable decision
   boundary. It never claims to know where the player looked. Opening, dwelling on, or clicking a row is not needed
   to make world state canonical.
2. **Decision brief:** one compact `What changed` surface groups the outstanding receipt range in causal order. It
   leads with the handful of facts that alter the immediate choice—current actor/PC incapacity, forced position,
   invalidated target, route/topology/hazard change, material resource/condition, custody/object availability—and
   lets supporting sources, amounts, affected citizens, and turning points expand. It is not one toast per receipt.
3. **Anchored critical facts:** a choice-invalidating fact cannot auto-vanish merely because its animation ended.
   It remains in the compact brief and as an honest board/card state while the next decision is composed. It may
   recede after a new valid consequential action commits, or after the player deliberately reviews/dismisses the
   brief, because durable recent history remains available.
4. **Bounded physical change traces:** affected cells/citizens may carry a restrained source-to-result trace or
   recent-change treatment through the decision boundary. The trace must not obscure current topology, targets,
   labels, custody, or conditions; repeated homogeneous siblings share a group treatment while every result remains
   inspectable. This is evidence of a recent transition, not a permanent quest-marker layer.
5. **Intent-specific confirmation:** if catch-up changes the pending intent's actor, target, path, area, cost,
   legality, or known consequence materially, Genesis presents that delta and requires a fresh preview/confirmation.
   If the intent is invalid, it stays editable with the truthful reason. This is the one place where explicit action
   matters: the player confirms the changed choice, not that they consumed a story card.
6. **Narration is complementary:** Gemini may turn the same fact-locked causal group into a vivid beat, emphasize a
   known turning point, or respond to a follow-up. The structured brief cannot be replaced by prose, and prose
   completion cannot be a prerequisite for dismissing or acting. Dry ledger recital and invented drama both fail.
7. **Secret-safe projection:** the brief contains only consequences visible or otherwise known to the active
   viewpoint under P10.7 law. A hidden witness, secret transfer, dormant mechanism, or undiscovered causal parent
   creates no blank row, unexplained count, disabled expansion, or suggestive ordering. Later discovery may remount
   the same canonical receipts at honestly earned precision.
8. **History without clutter:** once the immediate brief recedes, its entries join the ordinary recent-event/
   historical inspection path rather than a second notification archive. Reopening shows the same known causal
   facts and current corrections; it does not revive animations, reopen a decision gate, or duplicate receipts.

Concrete dungeon/Gemini-DM examples:

- After the threshold reaction, the brief leads with `Fighter: prone at C6`, `reaction damage`, and `door:
  shattered`; the BattleMat already shows those facts. Source, roll, spent reaction, and debris detail expand. The
  player can begin the next choice without clicking three receipts. A pending attack invalidated by the fall needs a
  new confirmation, not an `OK` on the narration.
- Catching up through a six-goblin fireball yields one causal group rather than six modals. Death, concentration
  loss, the dropped communicator, and the next actor are prominent; unchanged survivors' individual damage remains
  inspectable. Gemini can make the blast frightening without reading six ledger rows aloud.
- The lift crash brief connects descent to impact, passenger damage, a knocked-loose key, and a blocked lower exit.
  Current elevation, custody, and topology remain on the board. Choosing a new route naturally retires the brief to
  history; the key and blockage remain current truth.
- A thief secretly takes a relic outside the active viewpoint. No `something changed` badge or missing summary row
  appears. When evidence later makes the loss known, the card/brief can remount the earned fact without presenting
  it as a second theft.
- If only smoke, camera shake, and a Gemini sentence were interrupted, Catch Up produces no inflated mechanical
  warning. Those flourishes may disappear because all decision-relevant facts were already delivered.

**Implementation/maintenance cost:** Option A is medium modal/receipt work and very high pacing, controller-flow,
and habituation debt. Option B is **high but reusable information-orchestration work**: materiality tiers, causal
grouping, stable delivery cursors, anchored decision briefs, bounded board traces, recent-history integration,
secret filtering, pending-intent deltas, and crowded-chain comprehension fixtures. Option C is low-medium rendering
work and high missed-change, causality, accessibility, and support/debug debt.

**Codex recommendation: Option B.** Require the system to deliver material truth durably, not the player to certify
attention with ritual clicks. Keep immediate choice-changing facts anchored, let the rest expand or recede into the
same history, and ask for explicit confirmation only when the player's actual intended action changed.

Does Adam accept Option B, prefer mandatory modal acknowledgment under Option A, prefer board-only transient
highlights under Option C, or want to amend the decision brief? If B is accepted, follow into F10.8e: how long the
brief/change traces persist across successive transactions and how several unresolved briefs merge without hiding
causal boundaries. Wave 10 remains **OPEN**; no build is authorized.

### 11.60 F10.8d ruling and F10.8e expansion - nonblocking consequence brief accepted; choose persistence and merge law

**Adam's ruling (2026-07-20):** choose Option B.

Genesis delivers missed/material consequences through a compact nonblocking `What changed` decision brief, honest
current board/card truth, bounded change traces, expandable causal detail, and the same durable recent-history path.
It does not demand generic acknowledgment clicks or pretend a dismissal proves comprehension. Explicit
confirmation is reserved for material changes to the player's pending intent or another action-specific ambiguity.
Only viewpoint-known facts project; Gemini may dramatize but neither replace the structured lane nor block input.
F10.8d closes.

#### F10.8e - when do briefs and change traces recede, and how do successive consequences merge?

In plain English: a fireball resolves, then a death reaction opens a gate, then the released gas moves two guards
and drops a key—all before the player chooses again. Should each change disappear after a timer, remain as a growing
unread stack until manually cleared, or follow a semantic lifecycle that groups shared causes while preserving the
boundaries between different causes?

- **Option A - fixed-duration traces and one rolling feed:** every highlight/brief lives for a prescribed number of
  seconds or one nominal turn, and later receipts append into a single chronological stream. This is easy to reason
  about visually, but reading speed, pause, backgrounding, reduced motion, and long CrisisChains make time a poor
  proxy for delivery; unrelated causes flatten together; and important changes can expire while the player is
  inspecting something else.
- **Option B - semantic lifecycle with causally nested episodes (recommended):** each consequence group moves from
  owed to delivered to immediate-decision to recent to historical according to committed decision boundaries and
  player actions, not wall-clock time. Receipts sharing a root transaction or explicit dependency form one
  expandable episode with ordered child groups; independent causes stay visibly separate. New consequences arriving
  before the next decision extend or nest under the active episode without erasing earlier groups. Immediate
  emphasis recedes after the player commits a new valid consequential choice or deliberately reviews/dismisses it;
  current truth and durable history remain.
- **Option C - persistent unread stack with manual clearing:** every material group remains badged and highlighted
  until the player explicitly clears it. This guarantees nothing expires automatically, but creates notification
  debt, permanent glow, controller chores, and an incentive to mass-clear without understanding. It also turns
  historical causality into inbox state.

Option B uses a bounded semantic lifecycle:

1. **OWED:** a receipt consequence is canonical but its required visual/static/summary projection has not yet reached
   the active viewpoint. It cannot be treated as delivered and consequential commits remain behind the relevant
   boundary.
2. **DELIVERED / IMMEDIATE:** current board/card truth and its decision-brief entry are stable and available. Facts
   that alter the next choice remain anchored; supporting details are expandable. Cosmetic animation may finish.
3. **RECENT:** once the player commits a new valid consequential action—or deliberately reviews/dismisses the
   immediate brief—the special decision emphasis recedes. A restrained recent-change trace and the compact causal
   episode remain inspectable. Mere camera movement, opening a card, typing, waiting, or Gemini finishing a sentence
   does not retire it.
4. **HISTORICAL:** after a later semantic boundary makes the transition no longer locally immediate, its transition
   treatment disappears from the live scene. The same known receipts remain in ordinary object/place/citizen and
   event history; current effects such as `prone`, `burning`, `door shattered`, or `key held by Varka` remain visible
   for as long as they are current facts.
5. **UNRESOLVED INTENT DELTA:** a group that invalidates or materially changes the pending intent retains its compact
   delta until that intent is edited, canceled, or freshly confirmed. It does not vanish because another receipt
   arrived or the broader brief was collapsed.

Merging follows causal identity, not visual similarity:

- A fireball and its six damage results are one root episode; a death-triggered gate opening is a labeled child
  group; gas released by that gate is a later child; guard movement and the dropped key nest beneath the gas. The
  player can read the headline terminal truth first, then expand the actual chain.
- Two unrelated traps firing in the same presentation window remain two sibling episodes even if both deal fire
  damage. They may share scheduling time under F10.8a but do not become one fictional cause.
- Repeated homogeneous children may coalesce into a typed aggregate only if every affected identity/result remains
  recoverable and named/PC/topology/custody/condition/death turning points retain individual emphasis.
- A later correction or lifecycle change appends to the same canonical fact/history under P10.7 law; it does not
  edit an earlier brief into implying that the later state was always true.
- Secret-filtered parents do not create blank hierarchy. If the viewpoint sees gas moving guards but not the hidden
  mechanism that released it, the episode begins honestly at the visible/known cause (`gas floods the passage`) and
  may remount deeper ancestry after discovery.

The live projection stays bounded without truncating truth. The collapsed brief shows current choice-changing
outcomes and a small number of causal episode headlines; older or supporting groups fold under those episodes and
remain inspectable. If a CrisisChain is too large for the immediate surface, Genesis compresses repeated typed
children, prioritizes current decision effects, and offers the complete known ordered chain in the same history
surface. It never drops receipts, invents `+12 more` gaps that conceal identities, or uses an unread number that
could leak secret events.

Concrete dungeon/Gemini-DM examples:

- Fireball kills a cultist whose death opens a reliquary and releases gas. The brief reads as one episode with
  `blast`, `cultist killed`, `reliquary opened`, and `gas released` as ordered levels, not four modals or one vague
  `several things happened`. If gas then changes the pending route, that delta remains until the route is changed or
  reconfirmed.
- Two pressure plates fire independently while the party splits. Their bolts can animate in parallel, but the brief
  retains two source groups so Gemini cannot narrate one plate as causing both volleys.
- The player spends several minutes examining the dropped communicator before choosing. The brief does not expire
  on a timer. Opening the communicator card does not count as dismissing the door collapse or the fighter's prone
  state. The next valid action retires transition emphasis while current facts remain.
- A shattered bridge remains visibly shattered for days of world time; its orange recent-change treatment does not.
  Later inspection can still show when and why it broke from the same known history.
- Gemini can narrate the causal episode as one dramatic escalation rather than a ledger dump. Its timing and prose
  do not merge unrelated sources, retire the brief, or decide which facts are historical.

**Implementation/maintenance cost:** Option A is low-medium timer/feed work and high comprehension, pause, and
accessibility debt. Option B is **high reusable semantic-lifecycle work**: episode/root/dependency projection,
delivery and decision cursors, state transitions, aggregation contracts, bounded collapsed summaries, intent-delta
retention, current-versus-recent styling, history remounting, secret-safe ancestry, and long-chain fixtures. Option
C is medium notification-state work and high clutter, clearing, save persistence, and habituation debt.

**Codex recommendation: Option B.** Let decision events—not seconds or inbox chores—retire emphasis. Merge receipts
only when they truly share causality, preserve independent sources, and let transition traces fade while current
world truth and durable history remain.

Does Adam accept Option B, prefer timed rolling presentation under Option A, prefer manually cleared persistence
under Option C, or want to amend the lifecycle/merge rules? If B is accepted, follow into F10.8f: how required cues
may request camera, focus, lens, sound, and Gemini attention without stealing the player's inspection/composer state
or obscuring simultaneous higher-priority truth. Wave 10 remains **OPEN**; no build is authorized.

### 11.61 F10.8d visual reconsideration and F10.8d.1 expansion - Gemini-led consequence prose; prove board events before adding information layers

**Adam's ruling (2026-07-21):** for now, consequence communication runs through Gemini's prose and the clean existing
DM surface. Genesis must first prove that actual canonical events can be rendered truthfully on the BattleMat before
adding automatic mechanical briefs, anchored consequence labels, or another information layer to it. An unrewritten
dump such as `ward spent` breaks fiction and asks the player to decode engine vocabulary.

This supersedes one visual part of section 11.60 without deleting its useful principles or alternatives:

- the no-ritual-`OK` principle survives;
- the proposed automatic `What changed` board brief is **not** the current target;
- the generated board-edge brief and map-callout frames remain exploration evidence, not accepted UI;
- the generated DM-led frame is closest only after removing its structured `OUTCOME` block: the right rail should
  carry a natural dramatic rewrite, not prose followed by a mechanical receipt dump;
- F10.8e's brief-persistence/merge fork is **parked unanswered**, because Genesis should not specify the lifecycle of
  a visual information layer whose necessity has not survived BattleMat event-rendering proof;
- the previously accepted click-invoked object inspector remains a separate player-requested interaction surface,
  not an automatic consequence notification. This ruling adds no automatic consequence/history fields to it.

The provisional responsibility split is now:

1. **Canonical receipts remain internal authority.** They retain exact source, target, order, state deltas,
   resources, conditions, topology, custody, knowledge, and provenance for mechanics, replay, testing, and Gemini
   grounding. Internal structure is not player copy.
2. **The BattleMat proves physical events and current world truth.** Movement follows the committed route; a citizen
   falls or otherwise shows the governed result; a gate breaks and changes passage geometry; a chest opens; fire
   occupies the affected cells; a dropped object moves custody/location; an expended visible mechanism changes its
   physical state. Animation, sound, and static/reduced equivalents may communicate the event, but no raw receipt
   label substitutes for missing physical rendering.
3. **Gemini performs the rewrite pass.** It receives fact-locked receipts and expresses the known causal result in
   natural, scene-appropriate prose with the accepted freedom over cadence, imagery, emphasis, emotion, and voice.
   It must preserve outcome, cause, order, current state, viewpoint, uncertainty, and action-relevant consequence
   without exposing implementation vocabulary.
4. **The existing shell stays clean.** The persistent right rail remains DM chat/narration plus the composer. There
   is no automatic mechanical outcome box, board-edge receipt card, floating consequence-label field, or unread
   notification stack in the current proof target. Existing stable game surfaces such as HP/status, initiative,
   selection, legal action affordances, and clicked inspection do not become prose-only, but P10.8 adds no new
   dashboard layer before proof.
5. **Failure to understand is first evidence against rendering/prose, not automatic permission for more chrome.**
   Playtest the clean composition. If a player cannot tell what changed or what the next choice means, identify
   whether the missing evidence is physical state/animation, sound/caption, Gemini wording/timing, an existing
   action/status surface, or a genuinely irreducible information need. Only the last category may reopen a narrowly
   scoped information layer.

Concrete translation examples:

| Internal fact/receipt | BattleMat projection | Gemini-facing player expression |
|---|---|---|
| Threshold ward's one reaction is expended. | The engraved threshold flares, discharges, and goes visibly dark/inert; the reaction source no longer presents as active. | `The cut symbols blaze once beneath Mira's boot, then gutter into dead stone.` Not `WARD · REACTION SPENT`. |
| Mira takes damage and becomes prone at C6. | Her standee completes the crossing, receives the hit, and settles into a truthful prone/result treatment at C6; HP/status updates in their established surface. | `The blow folds Mira onto the flagstones just inside the doorway.` The prose need not recite coordinates or schema names. |
| The eastern gate shatters and passage becomes blocked. | Gate geometry breaks; rubble occupies/blocks the actual passage; route previews consume the new topology. | `Iron and masonry tear inward, choking the eastern way behind her.` Not `TOPOLOGY MUTATION: BLOCKED`. |
| A blast affects six goblins with different terminal results. | The board shows the area and every current damage/down/death/condition/drop result; simultaneous legal siblings may animate together. | Gemini shapes one vivid causal beat, naming exceptional known consequences naturally rather than reading six receipt rows. |
| A key is knocked loose from a guard. | The key visibly leaves the guard, lands at its committed location, and custody updates. | `Something brass skips from the guard's belt and vanishes beneath the lift rail.` Precision remains viewpoint-bound. |

The first proof gate is therefore not `can Genesis draw a change summary?` It is `can the actual receipt become a
legible physical event and persistent current state on the BattleMat while Gemini makes it fiction?` Representative
proof must eventually exercise movement plus reaction, damage/down/condition, object open/break, topology change,
multi-target area consequence, hazard propagation, and object drop/custody. This is a design acceptance corpus, not
build authorization in the current discussion.

**Implementation/maintenance consequence:** this ruling defers automatic brief/grouping/trace UI work, but it does
not make consequence communication free. It raises the importance of receipt-driven board animation/state binding,
sound/caption equivalence, a fact-locked Gemini consequence digest, player-language translation, streaming timing,
save/recovery parity, and combined comprehension/taste review. It also creates one material failure-path question:
what happens when Gemini is late, unavailable, interrupted, or produces prose that does not communicate a required
known consequence?

#### F10.8d.1 - if Gemini owns the rewrite pass, what is the clean fiction-first fallback?

In plain English: the board shows the ward flash and Mira fall, but the network stalls before Gemini can explain
that the threshold discharged and the eastern route is blocked. Should Genesis wait for Gemini, compile a restrained
fiction-first fallback sentence into the same DM rail, or expose raw mechanic labels so play can continue?

- **Option A - Gemini narration is required before the decision boundary:** safe controls and drafting remain, but
  a consequential commit waits until Gemini has delivered every action-relevant narrative anchor. This keeps one
  prose author and avoids template voice, but AI latency/outage becomes gameplay latency; malformed or drifting
  prose needs retries; and the game cannot reliably recover offline or after an interrupted stream without blocking.
- **Option B - Gemini normally writes; a deterministic fiction-first clause compiler is the deadline/failure
  fallback (recommended):** each material receipt family owns a small authored player-language semantic clause such
  as `the threshold flares and goes dark` or `rubble blocks the eastern way`. Gemini normally receives those clauses
  as hard anchors and rewrites/joins them expressively before the presentation deadline. If it is late or invalid,
  the authored clauses appear naturally in the same DM rail—never as raw fields, badges, or a second panel—and play
  can reach the truthful decision boundary. Later Gemini prose continues forward rather than redundantly narrating
  the same beat again.
- **Option C - fall back to raw mechanic/status output:** show `WARD SPENT`, `PRONE C6`, `GATE BLOCKED`, receipt ids,
  or a debug-style event list whenever Gemini is unavailable. This is the cheapest truth-preserving emergency lane,
  but it is exactly the fiction-breaking meta dump Adam rejected and trains content/system authors to leave player
  language unfinished.

Option B is not a second storytelling system. The deterministic clause is a **minimum player-language contract**:
factually complete enough for the next known choice, viewpoint-safe, short, source/result linked, and deliberately
plain but diegetic. Gemini owns rhythm, imagery, emotional/character framing, callbacks, and graceful combination.
The validator checks that Gemini's candidate covers the required anchors without contradiction; on failure the
already-authored clause is shown instead of a raw receipt or hallucinated repair.

Concrete examples:

- Internal `reactionSpent` never maps directly to those words. The family clause can be `The threshold's carved
  light gutters out.` If known action relevance must be explicit, it may add `The stones lie dormant now.` Gemini
  can render this as richer prose when timely.
- A terminal board rebuild after a backgrounded fireball can give Gemini the ordered clauses `the blast strikes all
  six`, `two goblins fall`, `the bone-mask guard loses concentration`, and `the turtle communicator lands by the
  western brazier`. Gemini joins them into one beat; the fallback uses a restrained coherent paragraph, not four
  schema rows.
- If a hidden mechanism caused the gate to close, the active viewpoint's fallback says only what is known—`The gate
  slams shut`—and does not expose the secret source to improve causal completeness.

**Implementation/maintenance cost:** Option A is low-medium local copy work and high service-latency, outage,
validation, recovery, and support debt. Option B is **medium-high authored semantic-language work**: receipt-family
clauses, inflection/entity reference, causal joining, viewpoint filtering, anchor validation, deadline routing,
stream cancellation, nonduplicate continuation, localization, and a dryness/clarity corpus. Option C is low output
work and very high immersion, accessibility, terminology, and long-term content-quality debt.

**Codex recommendation: Option B.** Keep Gemini as the normal visible author and the DM rail as the only new
consequence-language surface, but require every material mechanic to possess a tested fiction-first minimum phrase.
That protects the clean composition and the game loop without ever showing `ward spent` to the player.

Does Adam accept Option B, prefer to wait for Gemini under Option A, permit raw emergency mechanics under Option C,
or want to amend the fallback? F10.8e remains **PARKED AND UNANSWERED**. Wave 10 remains **OPEN**; no build is
authorized.

<!-- END VERBATIM MIGRATION: original lines 20558-21083 -->

### 11.62 F10.8d.1 ruling and F10.8d.2 expansion - fiction-first fallback accepted; choose actionable explicitness

**Adam's ruling (2026-07-21):** Option B sounds more ideal.

Every material receipt family therefore owns a tested minimum player-language clause. Gemini receives the exact
viewpoint-safe clauses as hard anchors and normally combines/rewrites them with the accepted freedom over rhythm,
imagery, emphasis, emotion, character framing, and scene voice. If Gemini misses the presentation deadline, is
unavailable/interrupted, or fails anchor validation, Genesis writes the deterministic fiction-first result into the
same DM rail. It never exposes raw fields, opens a second consequence panel, or waits indefinitely. Once the fallback
has carried the beat, later Gemini prose continues forward rather than repeating or replacing it. F10.8d.1 closes.

#### F10.8d.2 - may the minimum prose state actionable meaning, or only describe sensory evidence?

In plain English: after a threshold ward fires, `the carved light gutters into dead stone` is vivid sensory evidence.
But does that tell the player the ward cannot fire again? Should the fallback report only what the character sees,
translate every mechanic explicitly, or add a natural-language actionable conclusion only when this viewpoint has
actually earned it?

- **Option A - sensory fiction only:** the clause names visible/audible/physical change and stops: `The runes flare
  and go dark.` This is maximally diegetic and never overexplains, but important known consequences may remain
  ambiguous; the player may repeatedly test an already understood one-use mechanism or fail to realize that a route,
  target, spell, condition, or custody state changed their next legal choice.
- **Option B - sensory event plus viewpoint-known actionable meaning, still in fiction (recommended):** lead with
  what happened in the world, then state the minimum consequence the active viewpoint can honestly use. A known
  one-use ward may become `The runes gutter out; whatever charge waited in the threshold is gone.` A merely dark
  mechanism of unknown recharge says only that it is dark or uncertain. Current legal actions, route previews,
  established HP/status, and click-invoked inspection continue carrying their ordinary exact jobs; the DM prose
  explains the fictional causal meaning without schema terms or a new dashboard.
- **Option C - sensory prose followed by explicit mechanic translation:** `The runes go dark (ward spent; reaction
  unavailable).` This makes rule consequence unmistakable and is cheap to test, but reintroduces engine vocabulary,
  duplicates established UI, makes every dramatic beat feel tutorialized, and turns the clean DM rail into the
  mechanical receipt dump Adam rejected.

Option B treats actionable explicitness as an **epistemic projection**, not a universal tooltip:

1. **Observed fact first:** describe the committed physical event/result that this viewpoint can perceive—impact,
   fall, extinguishing light, broken gate, dropped key, receding flame, released captive, or changed allegiance
   behavior.
2. **Known consequence second, only when material:** state the smallest natural conclusion needed for the next
   choice when the character/player has lawfully learned it. `The eastern way is choked with rubble` is both fiction
   and route meaning. Do not append a lesson to every cosmetic or already obvious change.
3. **Uncertainty remains language, not leakage:** if the ward may recharge and the viewpoint does not know whether
   it is exhausted, say `The runes are dark now` or `For the moment, the threshold lies still`; never grant permanent
   safety because the internal receipt contains a duration/owner the character cannot know.
4. **Established exact UI keeps its job:** HP/resources, conditions, initiative, current legal actions, custody,
   selection, paths, and object state remain on their accepted surfaces. Gemini/fallback prose need not recite
   coordinates, arithmetic, internal ids, duration counters, or option legality already clear there.
5. **No hidden-source repair:** actionable clarity cannot reveal the unseen hand, mechanism, motive, witness, owner,
   or future response that caused an observed result. `The gate slams shut, sealing the western passage` can be
   complete while its secret trigger remains absent.
6. **Askable depth remains with the DM/card:** if the player asks whether a ward could recharge or clicks the known
   mechanism, Gemini and the existing focused card may explain only the evidence, history, uncertainty, and actions
   that viewpoint has earned. The automatic consequence beat stays short.

Concrete dungeon/Gemini-DM examples:

- **Known one-use ward:** the BattleMat shows flare/discharge/dark state. Minimum prose: `The threshold's carved
  light gutters out. Whatever charge waited there is gone.` No `reactionSpent` label is needed.
- **Unknown cycling ward:** the same visible dark state does not license permanence. Minimum prose: `The symbols dim
  to embers. Whether they are dead or gathering strength, Mira cannot tell.` If even that uncertainty exceeds her
  evidence, stop after the first sentence.
- **Gate collapse:** physical rubble and route validation own exact topology. Minimum prose: `Iron and stone choke
  the eastern way.` It need not say `blocked cell set`.
- **Mira becomes prone:** the board/result treatment and established condition surface own exact state. Gemini may
  say `The blow folds Mira onto the flagstones`; it need not append `(PRONE)` unless ordinary game vocabulary in an
  existing status surface already does so.
- **Concentration breaks:** if the viewpoint knows the bone-mask guard sustained the binding spell and sees the
  captive's chains loosen, prose may connect them. If the caster/source is unknown, describe the chains loosening
  without inventing or revealing the causal owner.
- **Dropped communicator:** the board moves the object to its lawful cell. Prose calls attention only if the drop is
  perceivable/material: `The turtle communicator skips from Varka's hand and comes to rest beside the brazier.`

**Implementation/maintenance cost:** Option A is low clause-authoring cost and high ambiguity, repeated-query, and
support debt. Option B is **medium-high semantic-language work**: materiality rules, knowledge/uncertainty variants,
observation-to-consequence phrasing, entity inflection, established-UI deduplication, anchor validation, and
clarity-without-overexplanation playtests. Option C is low-medium formatting/test work and very high immersion,
terminology, repetition, and long-term copy debt.

**Codex recommendation: Option B.** Let the fiction tell the player what the character can honestly act on, not
merely what changed color and not how the engine encoded it. Sensory evidence leads; material known consequence may
follow in ordinary language; uncertainty and secrets stay intact.

Does Adam accept Option B, prefer sensory-only fallback under Option A, prefer explicit mechanic translation under
Option C, or want to amend when actionable meaning may be stated? F10.8e remains **PARKED AND UNANSWERED**. If this
closes, audit the remaining P10.8/G10.2 obligations—especially camera/focus/sound/Gemini attention—without reviving
an automatic consequence brief. Wave 10 remains **OPEN**; no build is authorized.

### 11.63 F10.8d.2 ruling, P10.8 audit, and F10.8f expansion - known actionable meaning stays fictional; choose attention arbitration

**Adam's ruling (2026-07-21):** Option B is fine.

Minimum consequence prose leads with the viewpoint-perceivable physical event, then may state the smallest material
actionable conclusion this viewpoint has actually earned. It does not expose engine vocabulary, duplicate exact
jobs already owned by HP/status/initiative/path/custody/action surfaces, manufacture certainty about recharge or
duration, or reveal a hidden source/owner/motive. Known one-use exhaustion, blocked passage, lost concentration,
dropped custody, or another immediate consequence may be stated naturally; unresolved evidence remains unresolved
in the language. F10.8d.2 closes.

#### P10.8/G10.2 remaining-obligation audit

Rechecking the preserved P10.8 wording, the accepted P10.7/G10.2 closure, F10.3 feedback laws, and every generated
F10.8 branch yields this map:

| Obligation | Settled owner | Audit result |
|---|---|---|
| Placement/reveal, movement, attack, reaction, damage, condition, transformation, door/portal use, topology change, destruction, pickup/transfer, and scene transition | F10.3d-F10.3g plus F10.8a | Receipt-driven typed feedback families and dependency-bearing cue graphs preserve exact event/state order; no second mechanics graph. |
| Simultaneous/crowded consequences | F10.8a | Hard causal edges serialize; legal siblings overlap; typed repetition compresses without erasing identities or material terminal truth. |
| Input while consequences play | F10.8b | Safe controls/drafting remain; consequential commits wait for a truth-complete decision boundary; one pending intent revalidates. |
| Pause, skip, background, save/load, recovery, and scene switch | F10.8c | Canonical receipt cursor plus owed semantic obligations rebuilds truth without exact audiovisual serialization or mechanic replay. |
| Automatic consequence brief/acknowledgment | F10.8d-F10.8e, superseded by 11.61 | No ritual clicks survive. The automatic board brief/callout target and its lifecycle question are parked until BattleMat event proof creates evidence that another layer is genuinely needed. This is a deliberate proof gate, not a skipped answer. |
| Gemini timing/failure and player-language consequence | F10.8d.1-F10.8d.2 | Gemini normally rewrites hard anchors; deterministic fiction-first fallback prevents latency blocking/raw meta; known actionable meaning may be natural and viewpoint-safe. |
| Interaction, promoted affordances, secret tells, attention, and accumulated history | P10.7/G10.2 closure at 11.56 | Already closed provisionally behind its review/playtest corpus. The discarded consequence brief does not reopen or replace it. |
| Camera, focus, sound, and narrator attention under an in-flight causal chain | Existing F10.3h-F10.3j and F10.6g establish baselines only | **One material gap remains:** arbitrate a consequence's request for attention against active player inspection, camera control, composer focus, the EngagementLens, shared sound, and Gemini stream without hiding required truth or stealing control. |

#### F10.8f - when a committed consequence wants attention, may presentation take it from the player?

In plain English: the player is reading the shattered-gate card or drafting a response while a death reaction opens
a reliquary elsewhere, gas spills out, and two guards move. The receipts are canonical and Gemini can narrate them.
Should Genesis seize the camera/lens/focus to show every beat, never move anything automatically, or preserve the
player's interaction focus while allowing bounded, interruptible event framing when comprehension truly requires it?

- **Option A - cinematic auto-director owns every material beat:** camera pans/zooms to each causal source/result,
  EngagementLens follows the highlighted actor/effect, sound takes foreground priority, the DM rail follows the new
  narration, and inspection yields until the chain completes. This makes every event visible but creates camera
  tours, focus theft, lost reading position, slow CrisisChains, motion burden, and fights the player's attempt to
  understand or compose.
- **Option B - player-owned interaction focus plus governed material-event framing (recommended):** selection,
  object-card scroll/focus, composer cursor/draft, manual camera manipulation, and deliberately browsed DM history
  are never stolen by a consequence. If the relevant source/result is already inside the safe view, localized board
  feedback performs there. If it is outside view and material to the next choice, the camera may request one bounded
  causal fit only when the player is not actively manipulating/inspecting; otherwise it updates the accepted current
  focus for the existing recenter/follow path and lets fiction-first DM prose carry the immediate known meaning.
  Turn/scene boundaries retain their accepted governed refits; cosmetic or repeated siblings never earn a refit.
- **Option C - absolute manual camera and focus:** no committed consequence ever changes camera target, lens state,
  DM-scroll position, sound emphasis, or selection. The board updates wherever events occur and Gemini narrates;
  the player must pan/recenter/inspect manually. This best protects control and is simplest, but important offscreen
  topology, custody, death, or hazard change can remain physically unseen, and repeated navigation becomes a tax.

Option B extends rather than replaces the accepted camera/lens laws:

1. **Selection and text focus are sacred:** a consequence does not close/replace a clicked object card, move its
   internal scroll, change a selected target, blur the composer, submit/cancel a draft, or yank the DM transcript to
   the bottom while the player is reading earlier prose. An object becoming ineligible through canonical state may
   close/update its card under the existing law, with the reason carried truthfully.
2. **Existing visible view first:** if the source, path/area, and material results fit inside the current safe
   rectangle, animate them in place. Do not move the camera merely to make a better shot.
3. **One causal fit, not a tour:** when several linked offscreen changes are immediately choice-relevant and the
   player is idle, fit the smallest known causal set that remains readable. Do not pan source-to-child-to-grandchild
   if one overview/static terminal fit plus Gemini prose communicates the chain.
4. **Active manipulation defers refit:** recent drag/pan/zoom, board targeting, card interaction, drawer use,
   composer editing, or DM-history browsing suppresses automatic movement. The event becomes the current governed
   recenter/follow target without inserting another persistent notification layer. Required action validation and
   fiction-first prose remain truthful meanwhile.
5. **Combat lens baseline survives:** EngagementLens follows the canonical active citizen only at accepted
   activation boundaries and within its provisional playtest gate. Reactions, hazards, secondary effects, and
   narration subjects perform inside that tableau or on the board; they do not recursively refocus/open the lens.
6. **Sound has one presentation owner:** board, lens, and Gemini do not emit duplicate impact/result audio for one
   receipt. Known perceptible material sources receive governed priority; simultaneous siblings may share a mixed
   family cue; hidden/inaudible sources do not reveal themselves. Sound never changes selection or camera by itself.
7. **Gemini stream does not drive UI focus:** prose may arrive while the player reads or types. The rail preserves
   their scroll/cursor; new text accumulates normally and can resume ordinary follow when the player returns. Gemini
   naming a citizen or dramatic beat does not select it, move the camera, or reorder cues.
8. **Decision-boundary truth remains:** if an offscreen consequence materially changes the pending intent, the
   intent revalidation exposes the known fictional reason and requires a fresh preview/confirmation. Focus
   protection cannot let stale action commit merely because the player declined a refit.

Concrete dungeon/Gemini-DM examples:

- The player is scrolling the shattered-gate card when a distant cultist death opens the reliquary. The card does
  not vanish and the camera does not jump. The reliquary/gas/guard receipts update canonically; Gemini describes the
  known escalation. When the player leaves the card, existing recenter/follow can frame the current material focus
  if needed.
- Mira crosses the threshold and triggers a reaction inside the current route view. The board pauses at the trigger,
  performs hit/fall/gate state in place, and needs no camera move. A secondary reactor does not steal lens focus.
- A lift crashes offscreen while the player is idle and the resulting elevation/topology controls the next move.
  Genesis may perform one bounded fit containing the lift and relevant exits, not a sequence of dramatic zooms to
  every passenger and dropped object.
- Six goblins take one fireball inside the current view. The impact and legal sibling results share the view/sound
  window. Camera shake, six pans, six lens openings, and six repeated Gemini clauses are all forbidden.
- The player has scrolled upward in the DM rail to reread Varka's claim. New consequence prose enters the transcript
  without snapping them to the bottom. Their composer draft and board selection remain untouched.

**Implementation/maintenance cost:** Option A is high cinematic-director choreography plus very high focus,
camera, timing, motion, and test debt. Option B is **high but reusable arbitration work**: interaction-activity
leases, safe-view materiality checks, causal fit calculation, deferred recenter targets, DM-scroll ownership,
selection/card/composer invariants, one-owner audio mixing, intent-delta integration, and crowded/offscreen fixtures.
Option C is low-medium camera integration work and high comprehension, navigation, missed-event, and support debt.

**Codex recommendation: Option B.** The world may ask for attention; it may not seize the player's hands. Show
material events in the current view, use one bounded fit only when idle and necessary, preserve every active
interaction focus, and let Gemini carry known offscreen causal meaning without becoming a camera director.

Does Adam accept Option B, prefer cinematic automatic direction under Option A, prefer absolute manual focus under
Option C, or want to amend one focus lease? If accepted, perform the final P10.8 closure audit and proof-corpus pass
before advancing to mandatory P10.9. F10.8e remains parked behind BattleMat proof and may reopen only from evidence.
Wave 10 remains **OPEN**; no build is authorized.

### 11.64 F10.8f ruling and F10.8g closure audit - begin with automatic direction; preserve B as the later target

**Adam's ruling (2026-07-21):** start with Option A and aim for Option B later.

The pre-alpha proof target therefore auto-grants governed **material focus requests**. When a committed causal group
needs to be seen, presentation may move/refit the camera, follow the accepted active-citizen EngagementLens behavior,
foreground the shared sound cue, and follow current Gemini narration through the causal beat. This is the current
behavior to build/test conceptually—not a claim that focus theft is the desirable final interaction.

Option B remains the explicit later target: player-owned selection, inspection, composer, manual camera, and DM-
history focus with bounded idle-only event framing. The upgrade must be a policy change over the same receipt/cue
graph and focus-request stream, not a renderer rewrite.

The starting Option A is constrained so it can mature rather than become disposable:

1. **Focus unit is a material causal group:** the scheduler requests one framing for the fireball and its legal
   sibling results, not six goblin close-ups. Cosmetic tails, repeated flinches, prose emphasis, and sound reverb do
   not independently request camera/lens focus.
2. **Causal order remains canonical:** automatic direction follows hard dependency edges and may group only legal
   siblings. Camera choreography never decides which event occurred, who mattered, or what the terminal state is.
3. **Player data is non-destructive even when focus is taken:** automatic direction may temporarily suspend/defocus
   inspection, target planning, camera control, or consequential submission, but it cannot erase/edit/submit the
   composer draft, spend/cancel a pending intent, mutate selection authority, or lose card/history scroll state.
   Resolution completion restores the prior safe interaction state where still valid; canonical invalidation is
   explained truthfully.
4. **Skip/catch-up remains available:** the player may replace the camera sequence with the accepted static/terminal
   rebuild and fiction-first consequence account. Skip changes presentation, never mechanics or causal history.
5. **No hidden-source direction:** a camera move, lens population, sound, DM-scroll behavior, or focus duration may
   not expose an unknown actor, mechanism, witness, owner, or future event. Direction frames only viewpoint-legal
   evidence/results.
6. **One presentation owner per channel:** board/lens/audio/caption/Gemini share receipt presentation ids; automatic
   direction does not duplicate impact sound, damage expression, or narration merely because several adapters exist.
7. **Policy seam is mandatory:** cue families emit typed focus requests with causal group, known source/result set,
   required/optional framing, current safe fit, and terminal restore target. The starting policy grants material
   requests automatically. The later Option B policy adds interaction leases, idle tests, deferral, and recenter
   ownership without changing cue semantics.
8. **A-versus-B playtest is retained:** record camera-tour burden, lost reading/typing context, skip behavior, event
   comprehension, offscreen-state discovery, restored focus correctness, motion discomfort, and whether the player
   fights the director. Evidence can promote B sooner; A is not protected as final merely because it ships first.

Concrete starting behavior:

- Threshold crossing/reaction/fall/gate collapse already shares one route view, so A performs the causal group in
  place rather than manufacturing a pan.
- An offscreen lift crash material to the next move receives one auto-fit containing the lift, relevant exits, and
  terminal attachments/topology. It does not tour each passenger and dropped object.
- A fireball affecting six visible goblins uses one area fit and one shared consequence window; exceptional death,
  concentration, or dropped-custody results remain legible without six focus changes.
- If the player was reading the gate card, A may suspend that inspection to show a remote reliquary/gas escalation,
  but it preserves the card identity/scroll and returns afterward if the object remains eligible. The later B target
  will keep the inspection in control and defer/request the event frame instead.
- If Gemini is late during the auto-directed beat, the accepted fiction-first clause carries the same known causal
  anchors. Camera completion never waits indefinitely for prose.

**Implementation/maintenance cost:** starting A still requires **medium-high presentation-director work**—material
focus requests, causal grouping, safe fits, state suspension/restoration, hidden-source filtering, shared channel
ids, and skip/rebuild parity. It avoids B's first-pass interaction-lease/deferred-focus arbitration, but it is not a
cheap sequence of arbitrary camera cuts. Preserving the policy seam adds modest cost now and prevents high rewrite
cost later. The later B target adds interaction leases, idle detection, deferred recenter/follow, and DM-scroll/
composer/card ownership tests.

#### F10.8g - final P10.8/G10.2/generated-follow-up closure audit

With F10.8f ruled, every **principle-level** P10.8 branch now has an answer or an explicit evidence-triggered
non-applicability disposition:

1. **Verb coverage and physical truth:** placement/reveal, movement, attack, reaction, damage, condition,
   transformation, door/portal use, topology change, destruction, pickup/transfer, and scene transition consume
   canonical receipts through typed board/lens/audio/caption/Gemini families. Missing bespoke animation falls back
   truthfully; it never suppresses mechanics.
2. **Order and concurrency:** dependency-bearing transactional cue graphs serialize hard causes, overlap legal
   siblings, and compress typed repetition without losing identities, sources, material results, or terminal truth.
3. **Input timing:** safe controls/drafting may remain; consequential commitment waits for a truth-complete decision
   boundary; one pending intent is conservative, visibly uncommitted, and revalidated.
4. **Interruption/recovery:** pause, skip, background, save/load, crash recovery, and scene switch persist canonical
   truth plus owed semantic obligations, rebuild terminal/static presentation, and never replay mechanics.
5. **Player-language narration:** Gemini normally rewrites exact anchors; deterministic fiction-first clauses handle
   latency/failure. Sensory event leads, viewpoint-known actionable meaning may follow, secrets/uncertainty remain,
   and raw engine vocabulary never enters ordinary player presentation.
6. **Attention/focus:** pre-alpha begins with automatic material-causal direction under the constraints above; later
   B is the named player-owned target over the same focus-request policy seam and mandatory comparative playtest.
7. **Acknowledgment/brief branch:** ritual clicks are rejected. F10.8e's automatic `What changed` brief lifecycle is
   **retired from the current target**, not silently unanswered: BattleMat event rendering plus clean Gemini prose
   must first fail a comprehension playtest in a way existing physical state, feedback, DM prose, status/action
   surfaces, or clicked inspection cannot repair. Only that evidence reopens a narrowly scoped information-layer
   question.
8. **G10.2 relationship:** interaction, promotion, secret tells, attention, and accumulated history remain closed
   provisionally at P10.7/11.56 behind their review corpus. P10.8 does not replace those laws with consequence UI.

The mandatory P10.8 proof corpus is:

1. **Threshold chain:** exact movement, known reaction, damage/prone, one-use ward discharge, gate destruction,
   topology blockage, auto-direction, actionable Gemini/fallback prose, and pending-intent invalidation.
2. **Crowded area consequence:** six or more targets with simultaneous damage, at least one death/down, condition or
   concentration change, dropped object/custody, typed cue compression, one causal framing, and no duplicate sound.
3. **Moving platform catastrophe:** lift/vehicle motion, attached cast/objects, interruption, crash, damage, detach/
   drop, elevation/topology/hazard change, one bounded material fit, and exact terminal rebuild.
4. **Object interaction sequence:** click card, open/lockpick/fail/break/pickup/transfer, truthful physical state,
   sound/caption family, card eligibility/update, Gemini prose, and no card-only mechanics.
5. **Offscreen causal escalation:** death/reaction opens a mechanism, releases a hazard, moves citizens/objects, and
   changes the next choice; A shows bounded causal direction while preserving/restoring non-destructive draft/card
   state; later B comparison uses the same receipts.
6. **Secret/viewpoint case:** visible result with hidden source plus a private/party-known consequence; camera,
   sound, lens, fallback, labels, and prose leak no unknown noun, slot, count, or causal parent.
7. **Interruption matrix:** pause, skip, tab background, missed frames, save/load, refresh/crash recovery, lens
   collapse, and scene transition at several hard causal edges all land on identical state/history without duplicate
   triggers, damage, custody, or narration.
8. **Gemini failure matrix:** timely expressive prose, slow stream, invalid/missing anchor, interruption, unavailable
   service, and context-compacted recovery all preserve causal facts, viewpoint, actionable clarity, forward-only
   narration, and acceptable non-dry fallback language.
9. **Focus restoration:** auto-direction begins while inspecting, targeting, panning, typing, or reading DM history;
   A may suspend focus but preserves every safe state and restores/revalidates it. Record evidence for the B upgrade.
10. **Scene continuity handoff:** dungeon action into aftermath/inspection and a legal scene transition preserves ids,
    cast/object state, history, active hazards, camera orientation where lawful, and the same receipt account. This
    tests the P10.8 transition seam without substituting for mandatory P10.9 mode-continuity discussion.

A future failed corpus case reopens its named branch; it does not erase the rest of P10.8. Exact duration,
throughput, device tier, accessibility preference, and performance budgets remain P10.10/P10.12 owners except for
the presentation-semantic invariants already required here.

**Closure question:** does Adam agree to close P10.8 provisionally at the design-questionnaire level behind this
proof corpus, with automatic Option A focus as the starting target, player-owned Option B as the explicit later aim,
and F10.8e retired unless BattleMat-plus-Gemini comprehension evidence reopens it? If yes, advance to preserved
mandatory **P10.9 - map/town/exploration/combat continuity**. Wave 10 itself remains **OPEN**; no build is authorized.
