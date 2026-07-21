---
type: design-study
status: OPEN
wave: 10
part: 2
legacy_sections: "11.14-11.33"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 10 — Inspection, Feedback, and Combat

<!-- BEGIN VERBATIM MIGRATION: original lines 16920-18387 -->

### 11.14 F10.3b ruling - full scrollable inspector stays on the board

**Adam's ruling (2026-07-20):** reject the recommended Card J-preview/Card K-full-inspector split. The player should
receive a **full board card** for the selected object, with the complete known description and interaction content
scrolling inside the card's own bounded container. The persistent right side remains exclusively for DM chat and
narration, not structured object inspection or controls.

This supersedes Card K as the proposed primary object-inspection home while preserving it as rejected taste
evidence. Card J becomes the starting composition reference, amended from a small preview into a complete
scrollable board inspector.

The accepted F10.3b baseline is:

- selecting an object opens one structured card inside the central SceneTray/BattleMat surface, visibly linked to
  the selected canonical object through highlight and/or leader treatment;
- the card has a bounded width and height. Identity, obvious state, and primary actions remain visible in a fixed
  header/action region; longer description, known evidence, ownership, history, and secondary controls scroll
  **inside the card**, never by scrolling the whole game shell;
- the card can display a canonical sprite or governed fallback, full player-known description, state, distance,
  evidence, custody/ownership, and currently legal interaction controls. Every row remains reveal- and viewpoint-
  gated;
- card actions submit the same validated `ActionIntent` used by direct board and prose input. The inspector owns no
  gameplay state and does not mutate an object directly;
- examination, opening, lockpicking, activation, pickup, or other resolved outcomes may receive ordinary DM
  narration in the right rail because they happened in play. Raw object fields, persistent stat panels, and
  interaction controls do not occupy that rail;
- changing object focus updates/replaces the board card. It does not insert inspector snapshots into the DM
  conversation transcript;
- unknown traps, contents, provenance, evidence, and ownership remain absent. A scrollbar must never imply hidden
  row count or reserve space that leaks secret information.

Example:

```text
┌ IRON CHEST · Closed · 5 ft ──────────┐
│ [canonical chest sprite]             │  fixed header
│ [Examine] [Open] [Pick Lock]         │  fixed primary actions
├──────────────────────────────────────┤
│ Heavy iron construction...           │
│ Known owner: the watch               │  internally scrollable known content
│ Visible evidence: corroded lock...   │
│ ...                                  │
└──────────────────────────────────────┘
```

This decision accepts a **high spatial-layout/accessibility cost** rather than spending right-rail space. The board
must manage card/object linkage, collision and occlusion, internal mouse-wheel/touch/keyboard scrolling, focus
capture, controller navigation, camera/layout changes, large text, small landscape tablets, and interaction with
movement/target overlays. A single `ObjectFocusProjection` still prevents state drift; the complexity moves into
central-surface composition rather than duplicating data across board and chat.

F10.3b's **home and scroll model are closed**. Placement, persistence, and simultaneous-focus behavior remain
generated follow-ups.

#### F10.3c - how does the full card avoid covering the game?

- **Option A - automatic nearest-quadrant anchor:** place the card beside the object in the clearest available
  quadrant and move it automatically as composition changes. Simple for the player, but it may jump and still fail
  in crowded scenes.
- **Option B - fixed board-edge inspector:** reserve a consistent strip inside the SceneTray and reframe the board
  around it. Predictable, but permanently sacrifices board area while open and feels less directly attached.
- **Option C - smart anchor with bounded pan plus optional drag/pin (recommended):** open beside the object in a
  collision-safe quadrant with a leader; never cover the selected object or active PC. If no valid placement exists,
  pan the board a bounded amount without changing tactical coordinates or zoom. The player may drag/pin the card
  inside the SceneTray; a reset control restores automatic placement. On the smallest landscape target, fall back
  to a board-edge card inside the central tray—not the DM rail.

Option C has the highest interaction implementation cost, but it preserves spatial attachment, gives the player an
escape from bad automatic placement, and supplies a deterministic minimum-width fallback. All variants require
internal-scroll focus rules so wheel/touch input over the card never moves the camera accidentally.

Does Adam accept Option C? If so, follow with one-card-versus-pinned-multiple persistence and the exact behavior
when character focus or targeting begins. Wave 10 remains **OPEN**; no build is authorized.

### 11.15 F10.3c ruling - ephemeral smart-tooltip card, automatic placement only

**Adam's ruling (2026-07-20):** the full scrollable board card behaves like a well-designed **smart tooltip**, not
a persistent window. It appears only when the player clicks an object. Any click outside the card hides it. The card
chooses its own position from the object's screen position and must never run offscreen.

This rejects F10.3c's recommended drag/pin complexity and selects a stricter automatic variant of Option A:

- only one object card may be open. Clicking another object replaces it with that object's card; there is no
  multi-card desktop, pinning, or manual dragging;
- object hover may still provide ordinary highlight/cursor affordance, but the full card does not appear until
  click/tap/keyboard activation. Mere pointer travel cannot cover the board with cards;
- clicking inside the card—including scrolling, selecting text where allowed, focusing a row, or operating a
  control—does not count as an outside click;
- clicking anywhere outside dismisses the card and continues the underlying nonmodal board/UI interaction where
  that interaction is otherwise legal. Dismissal may not consume a separate click or create a modal curtain;
- `Escape`/controller Back dismisses the card. Focus returns predictably to the originating object or board;
- the placement solver evaluates candidate sides/quadrants around the selected object's projected screen bounds,
  scores occlusion against the object, active PC, important overlays, and occupied UI-safe regions, then chooses a
  stable best fit;
- the card is constrained to the central SceneTray's **safe rectangle**, excluding the left rail, right DM rail,
  open character drawer, EngagementLens, viewport insets, and touch-safe margins. “On screen” does not mean hidden
  underneath translucent chrome;
- placement may flip sides and clamp/nudge within that safe rectangle. Responsive max width/height and internal
  scrolling guarantee fit at the accepted minimum viewport. The card does not change tactical coordinates;
- if composition or camera movement changes while the card is open, it repositions stably rather than drifting
  offscreen. If the object leaves the visible/eligible projection, the card closes;
- a leader/selection highlight preserves object linkage when the best card position is no longer immediately
  adjacent. Secret facts never influence a player-visible placement choice in a way that leaks them.

This simultaneously resolves the earlier persistence and simultaneous-focus forks: the card is ephemeral and
single-focus. Clicking a character, destination, target, action menu, chat control, or empty board dismisses it as
part of that new focus. Object-card state does not compete with targeting or the character dossier.

The implementation cost is **medium-high UI geometry and input work**, lower than the rejected drag/pin design.
It requires safe-rectangle ownership, deterministic candidate scoring, responsive size caps, internal-scroll event
containment, outside-click routing, keyboard/controller focus restoration, touch behavior, and native-size
occlusion fixtures. It does not require saved window positions, multiple-card layout, or pin-state persistence.

F10.3c and the placement/persistence/multiple-focus branches are closed.

#### F10.3d - what happens after an action inside the card?

Suppose the player opens the chest card and clicks `Examine`, `Open`, `Pick Lock`, `Take`, or `Activate`:

- **Option A - close immediately:** maximizes board visibility, but the player loses object context while validation
  and DM narration occur and must reopen the card to see the new state.
- **Option B - stay open through the object transaction and update in place (recommended):** the card shows pending/
  refusal/resolved state without owning canon; the DM narrates the result in the right rail; the same card refreshes
  from the new canonical object projection. It still closes on any outside click, when the object becomes
  ineligible/disappears, or when focus moves elsewhere.
- **Option C - always close after success but remain on refusal:** predictable in one sense, but creates different
  spatial behavior based on outcome and makes multi-step object interaction unnecessarily click-heavy.

Under Option B, `Open` may change `Iron Chest · Closed` to `Iron Chest · Open`, reveal only newly earned contents/
evidence, and update the legal actions without creating a second card. Picking the chest up or destroying it closes
the board card because its scene referent is gone; an inventory surface may then own it. A refused `Pick Lock`
stays visible with the typed reason. The right rail carries the DM's narration, not a duplicate inspector.

Does Adam accept Option B? If so, exhaust pending-state, long-DM-response, and disappear/transfer edge cases, then
close the object-inspector branch and return to the next Wave 10 follow-up. Wave 10 remains **OPEN**; no build is
authorized.

### 11.16 F10.3d ruling - card updates in place; the board must perform the receipt

**Adam's ruling (2026-07-20):** accept Option B on the condition that the board supplies clear action feedback. The
PC piece should visibly move when movement occurs; a chest should visibly open when its state changes; and actions
should have appropriate sound feedback. The card may remain open and update, but it cannot be the only evidence
that something happened in the world.

The accepted object-transaction sequence is:

1. an inside-card control submits a proposal; the card may show a compact pending/validation state but does not
   mutate or promise the result;
2. the deterministic rules layer validates and commits a typed receipt;
3. the BattleMat performs that receipt immediately through the applicable actor path, object-state animation,
   effect cue, sound cue, and accessible text equivalent;
4. the open card refreshes from the new canonical projection rather than patching its own fields;
5. the DM narrates the resolved event in the exclusive right conversation rail, without blocking local mechanical
   feedback or duplicating the inspector.

Concrete examples:

- `Open`: if adjacency is required, the PC standee animates along the committed exact path, stopping for any
  reactions. After arrival and successful resolution, the chest lid rotates or its governed closed/open visual
  state swaps; hinges/lock receive an appropriate sound token and caption; then the card reads `Open` and reveals
  only newly earned contents/evidence;
- `Pick Lock`: a refusal leaves the card open with the typed reason and only a restrained UI refusal cue. A resolved
  attempt performs the roll/result receipt, visible lock/object response, and perceptible sound—never a success
  animation before the roll commits;
- `Take`: custody transfer removes the scene object only when the receipt says it moved to inventory/another
  holder. A pickup motion/cue makes the transfer legible; the board card closes because the board referent is gone;
- `Activate`: a lever, door, light, platform, or invented object uses its governed state transition or a truthful
  fallback pulse/marker/caption. The card refreshes or closes according to continued scene eligibility.

Sound is additive feedback, never the sole carrier. Every consequential cue needs a visual and/or captioned
equivalent; user audio settings and reduced-motion settings cannot make state unreadable. Conversely, animation
and sound are viewpoint-gated: an inaudible distant latch, hidden trap, or unseen state change cannot leak through
a global cue. The feedback layer consumes receipts and owns no game rules.

Pending/latency/transfer edge cases close as follows:

- dismissing the card while a valid action is pending does not cancel an already committed proposal; board
  feedback and DM narration still occur. A separate explicit cancel is legal only before the transaction commits;
- mechanical resolution and board feedback do not wait for AI narration. The DM may narrate afterward from the
  same receipt;
- receipt/object version ids prevent a late validation or DM response from repainting an obsolete card or reverting
  a newer state;
- refusal leaves the eligible card open; successful state change refreshes it; destruction, pickup, transfer out
  of scene, loss of perception, or other ineligibility closes it;
- save/load either resumes a declared resumable presentation or snaps to canonical final state with the receipt
  available for recap; it never replays a state-changing action merely to reconstruct animation.

This adds **medium-high feedback-system cost** beyond the inspector: receipt-to-presentation tokens, exact-path
actor movement, interruptible trigger boundaries, governed state transitions, sound families, captions, reduced-
motion fallbacks, stale-response guards, and native-resolution proof. The reusable grammar is cheaper to maintain
than bespoke animation code for every object, but the product still needs a minimum feedback-quality bar.

F10.3d and the inspector pending/latency/disappear/transfer branch are closed. One material follow-up remains before
the inspector branch can close: how broad the minimum board-feedback grammar must be for pre-alpha.

#### F10.3e - minimum board-action feedback grammar

- **Option A - bespoke animation and sound for every action/object:** highest specificity, but it recreates the
  content-production scope Wave 10 is trying to control and leaves procedural/invented objects without coverage.
- **Option B - one generic pulse/click for everything:** cheap, but does not clearly distinguish movement, opening,
  pickup, attack, spell, failure, or environmental state change.
- **Option C - tiered receipt-driven feedback families with truthful fallbacks (recommended):** build reusable
  movement, open/close, pickup/transfer, strike/impact, projectile, spell/area, activate/toggle, damage/heal,
  failure/refusal, reveal, and environmental-change families. Use object-specific geometry/sprites/sounds where a
  governed binding exists; otherwise use a consistent highlight/motion/effect/caption fallback tied to the exact
  actor, object, path, and state transition. Bespoke polish may replace a fallback later without changing rules.

Under Option C, a chest gets a real lid/sprite transition because its cheap geometry is governed; an invented
turtle communicator might use a localized light/pulse, communicator sound family, and caption until bespoke art or
animation exists. Neither becomes a silent database update, and neither requires the DM to fake mechanical
feedback in prose.

Does Adam accept Option C as the best-case/pre-alpha feedback architecture? If so, define the minimum slice and
fallback quality gate, close the object-inspector branch, and resume the remaining Wave 10 visual questions. Wave
10 remains **OPEN**; no build is authorized.

### 11.17 F10.3e ruling - tiered receipt-driven feedback families accepted

**Adam's ruling (2026-07-20):** Option C is the right target. Genesis should aim for reusable receipt-driven
feedback families with truthful fallbacks; later production can add more specific animation and sound for objects
or actions that merit it.

The accepted specificity ladder is:

1. **governed specific binding:** use a real stateful construction-class response when one exists—chest lid,
   door leaf, lever rotation, platform movement, exact projectile, authored spell family, or another validated
   object/action binding;
2. **typed family binding:** use a reusable movement, open/close, pickup/transfer, strike/impact, projectile,
   spell/area, activate/toggle, damage/heal, failure/refusal, reveal, or environmental-change presentation;
3. **truthful localized fallback:** if no specific visual exists, bind the exact actor/object/cell and receipt to a
   restrained motion/highlight/effect, suitable sound-family token where perceptible, and explicit caption/state
   change. Never substitute a misleading animation merely because it is prettier;
4. **tracked coverage gap:** if even the fallback cannot represent the receipt honestly, report a typed presentation
   gap for QA and rely on accessible text/DM narration while preserving mechanics. A gap may not erase, invent, or
   delay the canonical result.

Bespoke feedback is therefore an additive replacement for a fallback, not a new rules implementation. It inherits
the same receipt id, target binding, timing, viewpoint filter, accessibility contract, performance budget, and
deterministic replay semantics. Later specificity can improve taste without forcing save migrations or action-law
forks.

The architecture costs **medium-high initially and scales well afterward**: a versioned feedback registry,
construction/action-family bindings, sound and caption tokens, deterministic timing, reduced-motion variants,
coverage telemetry, and visual fixtures. Content maintenance becomes explicit—new actions declare a feedback
family or a tracked gap—rather than depending on the DM to describe silent mechanics.

This closes F10.3e's architecture choice. The best-case family bank is not a claim that every action receives
bespoke feedback in pre-alpha.

#### F10.3f - minimum pre-alpha feedback proof

How broad must the first exact-cell/inspector slice be before this architecture counts as proven?

- **Option A - object-only minimum:** exact PC movement plus chest open/pickup and generic refusal. Fastest, but it
  does not prove that the same receipt grammar spans combat targeting, projectiles, areas, and damage.
- **Option B - representative vertical spine (recommended):** prove exact movement/Dash with trigger pause; chest
  and door open/close; pickup/custody transfer; one melee impact; Fire Bolt projectile; Fireball point/area effect;
  damage/heal state feedback; one lever/platform or invented-object activate/toggle fallback; reveal; and typed
  refusal. Other surfaced actions must at least receive the truthful localized fallback or a visible tracked gap—
  never a silent update.
- **Option C - complete family bank before proof:** strongest coverage, but turns the first slice into a broad
  content-production milestone and delays learning whether the board/card/receipt architecture works.

Option B's minimum quality gate is:

- every committed perceptible receipt in the slice localizes feedback to the correct actor, path, object, cell, or
  area and displays the resulting state without waiting for DM prose;
- movement follows canonical cells/elevation and pauses at actual reaction/hazard boundaries;
- object visuals and card fields agree after open/close/pickup/transfer;
- projectile and area feedback agree with the exact targeting kernel and affected-citizen preview;
- failure/refusal never plays success feedback; hidden or inaudible facts never leak;
- sound has visual/caption parity, reduced motion remains legible, and dismissal/latency/save-load cannot duplicate
  or suppress the canonical action;
- the same deterministic fixture passes at the native desktop and minimum landscape-tablet proof sizes later
  chosen by F10.6b, with performance gates later quantified by P10.7/F10.7.

Does Adam accept Option B as the minimum proof while retaining the full Option C family architecture as the target?
If so, close the object-inspector/feedback branch and resume F10.6b native-resolution proof. Wave 10 remains
**OPEN**; no build is authorized.

### 11.18 F10.3f ruling - representative proof accepted; EngagementLens may carry interim combat animation

**Adam's ruling (2026-07-20):** accept Option B as the pre-alpha feedback proof boundary while retaining the full
tiered family architecture as the target. For the interim, some feedback may use the FF6-style bottom
EngagementLens if that is easier than producing the corresponding animation directly on the 3D board.

The accepted pre-alpha proof therefore covers:

- exact movement and Dash, including reaction/hazard pauses;
- chest and door open/close;
- pickup and custody transfer;
- one melee impact;
- Fire Bolt projectile targeting/impact;
- Fireball point selection, exact area, and affected-citizen feedback;
- damage/heal state feedback;
- one lever/platform or invented-object activation through the truthful fallback family;
- reveal/discovery and typed refusal/failure;
- truthful fallback or a visible tracked presentation gap for every other surfaced receipt, never silence.

The proof may compose more than one presentation adapter from the same receipt:

```text
committed canonical receipt
  -> BattleMat truth adapter
       exact path / cells / area / object state / hazards / occupancy
  -> EngagementLens drama adapter
       sprite lunge / recoil / projectile / spell / reaction / damage beat
  -> shared audio-caption adapter
  -> object card refresh where eligible
  -> DM narration when available
```

This does not restore a second combat model. The EngagementLens remains derived from exact positions, targets,
distance, elevation, resources, and results. It cannot decide movement, reach, line of sight/effect, areas, cover,
damage, or object state. A lens animation may be more expressive than the interim board response, but both consume
the same receipt id and neither waits for DM prose.

The representative proof costs **medium-high cross-projection integration** rather than complete bespoke 3D
animation. The savings are real: canonical pixel sprites can lunge, recoil, cast, and react in the bottom lens while
the high-resolution 3D substrate uses simple standee movement, route traces, cell/area overlays, state swaps,
localized effects, and contact feedback. The added maintenance risk is synchronization; one deterministic
presentation timeline must prevent lens drama, board truth, card state, audio, and narration from contradicting or
double-playing a receipt.

F10.3f's minimum proof boundary is closed. The new lens allowance creates one final material feedback fork.

#### F10.3g - what may the EngagementLens replace in the interim?

- **Option A - lens may carry nearly all action feedback:** the board may snap to final state while the lens shows
  movement, attacks, spells, and reactions. Cheapest visually, but exact paths, trigger cells, and area causality
  become hard to read and the board feels disconnected from its own authority.
- **Option B - board carries spatial truth; lens carries expressive combat drama (recommended):** the board always
  shows movement/path progression, trigger pauses, destination/occupancy, exact target/area, persistent hazards,
  and object/custody state through simple truthful cues. The lens may carry the richer melee, projectile, spell,
  reaction, damage, and character-performance animation. Audio/captions bind both. Object actions such as opening a
  chest still need a visible board state change even if the lens or sound adds flavor.
- **Option C - board must carry every animation now:** clearest single surface, but forfeits the proposed interim
  production savings and pushes the BattleMat toward a much more expensive animation system before the core is
  proven.

Examples under Option B:

- movement animates the standee or a clear path-progress marker across exact cells; the lens may show the selected
  hero advancing, but cannot replace the path;
- an opportunity attack pauses the board at its trigger cell; the lens shows the attacker strike/recoil beat;
- Fire Bolt preserves its exact origin/target/ray cue on the board while the lens carries the expressive projectile
  and impact;
- Fireball preserves the chosen cell, sphere footprint, and caught citizens on the board while the lens may show a
  stylized explosion/reaction tableau;
- a chest changes from closed to open on the board; sound and card refresh reinforce it without moving object truth
  into the combat lens.

Does Adam accept Option B? If so, define sequencing/fallback behavior when the lens is collapsed or disabled, close
the inspector/feedback branch, and resume F10.6b native-resolution proof. Wave 10 remains **OPEN**; no build is
authorized.

### 11.19 F10.3g ruling - board carries tactical truth; lens carries expressive combat drama

**Adam's ruling (2026-07-20):** accept Option B. The exact BattleMat always presents the spatial and persistent
truth required to understand the action. The bottom EngagementLens may carry richer interim character/action
performance from the same receipt.

The mandatory board layer is:

- exact path progression, destination, elevation, and occupancy;
- reaction/hazard trigger cells and pauses;
- exact entity/object target, line/path, selected point, area footprint, and affected-citizen indication;
- persistent hazards, terrain/object state, open/closed/activated state, custody transfer, removal, and destruction;
- localized minimum impact/state feedback sufficient to understand the result when the lens is unavailable.

The optional lens layer may add:

- sprite advance/lunge, wind-up, recoil, hit/heal reaction, and character-performance timing;
- expressive projectile, spell, reaction, damage, and condition beats;
- direct actor/target labels, distance/elevation context, and dramatic framing derived from the board state.

One deterministic presentation timeline sequences both adapters:

```text
preview on board
  -> commit receipt
  -> begin/present exact board path or area
  -> pause at a real reaction/impact boundary when required
  -> play eligible lens performance + shared audio/caption
  -> apply/show canonical resulting board and card state
  -> continue interrupted path if the receipt permits
  -> DM narration from the same receipt
```

The lens never changes the receipt, selection, position, area, damage, or action economy. If an expressive lens
animation is missing, late, collapsed, disabled, or skipped, the board adapter still completes truthful feedback
and play continues. The two surfaces cannot each emit separate sounds/damage numbers for one receipt; shared
presentation ids suppress duplication.

This split has **medium synchronization/timeline cost** and materially lower 3D animation-production cost. It
requires adapter coverage checks, interruption points, shared ids, skip/fast-forward behavior, and captures with
the lens both present and absent. It does not authorize lens-only spatial resolution.

F10.3g is closed.

#### F10.3h - may feedback auto-open or steal focus for the EngagementLens?

- **Option A - auto-open/follow every acting citizen:** maximizes spectacle, but constantly reframes the board,
  changes visible cast, and can fight the player's selected PC, object card, drawer, or target planning.
- **Option B - never auto-open solely for feedback (recommended):** retain the already accepted rule that selecting
  a PC opens its lens. The lens animates relevant receipts while it is already visible; it may show an enemy's
  attack/reaction against that selected PC without changing selection. If the lens is collapsed by deselection,
  drawer/layout pressure, minimum viewport, reduced-presentation setting, or player choice, the board plus shared
  audio/caption families carry the complete result. Feedback never steals focus.
- **Option C - auto-open only for “high-impact” events:** dramatic, but requires a salience policy, risks repeated
  layout shifts, and can turn a presentation preference into an opaque importance judgment.

Examples under Option B:

- selected PC casts Fire Bolt: the already-open lens performs the cast/impact while the board shows exact target;
- Goblin 2 opportunity-attacks the selected PC during movement: the board pauses at the trigger and the visible
  lens performs the reaction beat;
- an enemy attacks an unselected companion: the board performs complete feedback; the lens does not switch actors
  or open itself;
- opening the character drawer collapses the lens as already accepted; ongoing mechanics remain understandable on
  the reframed board;
- with the lens disabled or reduced motion enabled, no rule, target, consequence, or receipt disappears.

Does Adam accept Option B? If so, the inspector/feedback branch has no remaining material follow-up and can close
before F10.6b native-resolution proof. Wave 10 remains **OPEN**; no build is authorized.

### 11.20 F10.3h ruling - active-character auto-follow, provisional pending playtest

**Adam's ruling (2026-07-20):** reject the no-focus-theft recommendation and provisionally choose Option A. The
EngagementLens should follow whoever the active character is. Adam explicitly marks this as a behavior that will
require playtesting; use Option A for now rather than pretending the tradeoff is already proven.

“Active character” means the current turn owner/active combat citizen, not every secondary reactor, projectile,
hazard, summoned effect, or narration subject:

- at turn/activation transition, the lens opens if combat presentation permits and changes its focused actor to
  the new canonical active citizen;
- the lens focus is presentation state derived from `activeActorId`; it does not change turn ownership, selection
  legality, target state, or player control;
- reactions, opportunity attacks, counter-effects, and environmental interrupts perform inside the active
  citizen's current tableau without recursively stealing focus. The board pauses at the exact trigger and remains
  authoritative;
- outside turn-based combat, the earlier click/selection rule remains: selecting a PC opens that PC's lens;
- if the lens is explicitly disabled, unavailable at the minimum layout, or suppressed by an accessibility mode,
  auto-follow does not override the setting. The complete board/audio/caption feedback remains;
- the player may still inspect/select citizens on the board without changing the active-turn lens unless a later
  explicit focus control is accepted.

The required playtest must compare at least active-follow versus selected-PC-only behavior across a one-PC duel,
party combat, several enemies, reinforcements, opportunity reactions, fast enemy turns, character drawer use, and
minimum landscape-tablet layout. Observe action comprehension, unwanted layout movement, target-selection errors,
turn ownership recognition, animation skip rate, and whether players fight the focus. If active-follow fails, Wave
10 reopens this ruling explicitly rather than silently changing it in implementation.

The implementation cost is **medium focus/timeline work** plus meaningful visual QA: active-actor events,
animation queue handoff, board/lens synchronization, layout transition restraint, user setting overrides, and
turn-boundary tests. It is still cheaper than requiring every expressive beat on the 3D board.

F10.3h is provisionally closed at design level with a mandatory playtest gate. It exposes a direct conflict with
the earlier PC-left/enemy-right composition that must be ruled now.

#### F10.3i - does the active actor change sides in the EngagementLens?

- **Option A - active actor always on the left, targets on the right:** every turn reads in one action direction,
  but party and enemy sides mirror repeatedly. Goblins jump from right to left on their turns, weakening faction
  recognition and contradicting the left-side PC UI relationship.
- **Option B - stable faction sides; active actor highlighted wherever it stands (recommended):** party/companions
  remain on the left and hostiles on the right. On a PC turn the active actor attacks left-to-right; on an enemy
  turn the highlighted active enemy acts right-to-left against the relevant party targets. Reactions animate from
  their stable side without refocusing. A turn banner/halo/name identifies the active citizen.
- **Option C - keep one selected PC on the left even when unrelated actors act:** preserves the earlier selected-PC
  tableau but cannot honestly frame an enemy attacking a different companion or two non-selected citizens.

Option B retains spatial/faction memory while still honoring active-character auto-follow. It costs more animation
direction variants than Option A, but sprite mirroring, projectile direction, lunge/recoil, labels, and target
framing can remain family-level rules. It also avoids UI whiplash from swapping the whole cast every turn.

Does Adam accept Option B? If so, resolve neutral/third-party placement and manual-collapse behavior, close the
inspector/feedback branch with its playtest obligation, and resume F10.6b. Wave 10 remains **OPEN**; no build is
authorized.

### 11.21 F10.3i ruling - stable faction sides with active actor highlighted

**Adam's ruling (2026-07-20):** accept Option B. Party members and companions remain on the left of the
EngagementLens; hostiles remain on the right. The lens follows the active character by highlighting and framing
that citizen wherever it stands rather than mirroring the entire cast on hostile turns.

The accepted orientation contract is:

- party-controlled PCs and companions occupy the left faction band; hostiles occupy the right faction band;
- the canonical active citizen receives a strong shape/halo/turn banner/name treatment that does not rely on color
  alone;
- PC/companion actions perform left-to-right; hostile actions perform right-to-left;
- reactions originate from the reactor's stable faction side without changing active-character focus;
- reusable feedback families support direction reversal through governed sprite facing/mirroring, projectile
  direction, lunge/recoil anchors, cast poses, labels, and effect origin/target bindings;
- the stable left-side party relationship remains aligned with the product's left character rail even while an
  active enemy owns the turn;
- the exact board remains authoritative if a crowded lens omits a nonessential figure; faction-side stability may
  not alter target legality or citizen position.

Example: on Goblin 2's turn, Goblin 2 remains on the right with the active-turn treatment and attacks the relevant
companion on the left. During the PC's turn, Goblin 2's opportunity attack still comes from the right while the PC
remains the active focus.

This adds **medium presentation-family cost** rather than new mechanics: directional sprite/effect variants,
active-state emphasis, stable cluster layout, and multi-actor capture fixtures. It reduces cognitive/layout churn
relative to active-actor-always-left mirroring.

F10.3i is closed. Manual collapse and neutral/third-party placement remain.

#### F10.3j - how long does a manual lens collapse override active-follow?

- **Option A - current beat/turn only:** the lens reopens automatically on the next active actor. This preserves
  spectacle but can make a player repeatedly close a surface they do not currently want.
- **Option B - current encounter until explicitly reopened (recommended):** active-follow is the default when
  combat begins, but a deliberate collapse suppresses all automatic reopening for the rest of that encounter. A
  compact Expand control remains. The next new combat restores the default unless the player has separately chosen
  the global/accessibility `Lens Off` preference.
- **Option C - collapse becomes a global preference:** respects the gesture strongly, but silently turns a local
  layout decision into a lasting product setting and makes the lens seem to disappear in later sessions.

Under Option B, collapsing during Goblin 2's turn keeps the lens closed through later PC/enemy turns; all feedback
continues on the board/audio/caption stack. Manually reopening restores active-follow immediately. Character-drawer
or minimum-layout suppression is temporary layout state, not the same as deliberate encounter-scoped collapse.

The implementation cost is low: separate `autoFollow`, encounter `manualCollapse`, transient layout suppression,
and global `Lens Off` states so one cause never overwrites another. Playtest must observe whether encounter reset is
expected or surprising.

Does Adam accept Option B? If so, rule neutral/third-party bands, then close inspector/feedback with the active-
follow playtest obligation and resume F10.6b. Wave 10 remains **OPEN**; no build is authorized.

### 11.22 F10.3j ruling and F10.3k expansion - encounter-scoped collapse; top-center initiative ribbon

**Adam's ruling (2026-07-20):** accept F10.3j Option B as good enough for now. A deliberate manual collapse of the
EngagementLens suppresses active-follow for the rest of the current encounter until the player explicitly expands
it. A new combat restores the normal active-follow default unless the player has separately chosen a durable
global/accessibility `Lens Off` preference. Character-drawer and minimum-layout suppression remain transient layout
states and do not overwrite either manual encounter collapse or the durable preference.

Adam also adds a required combat-shell element:

> "also i think we need an initiate order line. We can position it just like BG3 top center line, vertically centered on the line are the square portrait images (derived from big sprites) assuming there is a function smart enough to autocrop the sprites into portraits"

The **top-center initiative ribbon** is accepted as the intended visual direction. It belongs inside the central
SceneTray safe rectangle, centered along the upper edge rather than spending either persistent side rail. A thin
horizontal rule carries square portrait tiles centered vertically on it. It must leave a governed board-safe top
gutter so neither tiles nor labels hide tactically important cells. The right rail remains DM chat/narration only;
the left rail remains character/system navigation. The current compact round/acting-side language should be
absorbed into or immediately adjacent to the ribbon rather than surviving as a competing third combat header.

At minimum, the ribbon projection must:

- show only citizens known to be participating from the player's viewpoint; hidden combatants do not leak through
  an empty slot, count, silhouette, initiative gap, or preallocated spacing;
- preserve each citizen's canonical id and stable speakable combat label, so two goblins using one sprite remain
  distinct and the relevant tile can be focused as `Goblin 1`, `Goblin 2`, or learned `Varka`;
- identify the acting side and, whenever a particular citizen is resolving a receipt, give that tile a strong
  non-color-only active treatment; down, defeated, fled, spent, delayed, or unavailable states may not be conveyed
  by color alone;
- insert revealed reinforcements and remove/retire participants only when canonical combat state licenses it,
  without renumbering survivors;
- use a governed symbol tile for an environmental, lair, hazard, or crisis activation that has no creature sprite,
  rather than inventing a portrait;
- remain keyboard/controller/touch readable and expose the same round, side, citizen label, and state in accessible
  text. Clicking a tile may focus/inspect its citizen, but may not silently change turn ownership or select an
  illegal target.

#### Portrait derivation - smart enough, deterministic, and honest about strange bodies

The inspected Genesis `sprites-r4b` corpus makes automatic derivation feasible but rules out a universal face crop.
Its canonical sources include upright humanoid 4:5 figures alongside wide quadrupeds, sharks, many-limbed monsters,
huge dragons, and extremely small subjects such as a caged canary. The slicing pipeline already reasons about
alpha/content bounds, and Stage C already calls for per-asset content bounds and anchors. Build on those assets
rather than commissioning a second portrait library for pre-alpha:

1. Resolve the sprite's keyed/alpha content bounds and ignore transparent padding.
2. Apply an asset-level `portraitMode`/silhouette preset when known: an upright humanoid may use a head-and-torso
   square; a quadruped may favor the head/front mass; a centered or amorphous creature uses a whole-subject square.
3. Score the candidate square for subject occupancy and clipping. If confidence is low or the subject would be
   mutilated, fall back to the entire sprite contained inside the square frame. A tiny but complete canary is better
   than a confident crop of three pixels; a whole dragon is better than a wing mistaken for a face.
4. Permit one optional deterministic per-**asset** focus override such as `{x,y,scale}`. Every citizen using that
   sprite inherits it; individual NPC records do not accumulate hand-authored portrait crops.
5. Derive/cache the thumbnail from the canonical sprite and asset-version key. Do not create a second identity or
   let a nondeterministic runtime model recrop portraits between sessions.

This is a **medium one-time asset/tooling and visual-QA cost**, then low per-citizen maintenance. A simple whole-
sprite contain thumbnail is low cost and always available; convincing bust/head crops across the representative
silhouette corpus add the medium work. A general face-detection dependency is not recommended: fantasy pixel
creatures routinely violate its assumptions, while deterministic presets plus rare asset overrides are inspectable,
cacheable, save/replay stable, and reusable anywhere Genesis needs a portrait.

#### Existing combat-law conflict exposed by the ribbon

Genesis currently locks **side-based initiative** in `COMBAT.md`, `INITIATIVE-UI.md`, and the DESIGN registry. The
engine stores the acting `pc` or `enemy` side and deliberately has no canonical per-creature order; the existing
stage highlights every live actor on the acting side. Therefore the accepted portrait ribbon does **not** by itself
authorize a BG3-like per-creature initiative rewrite. Its visual meaning must be settled explicitly.

#### F10.3k - what order do the portrait tiles actually represent?

- **Option A - change to literal per-creature initiative now:** each PC, companion, goblin, and monster owns a fixed
  place in the round, and the active marker advances portrait by portrait. This most closely matches BG3. It is also
  a high mechanics migration: initiative rolling and ties, companion control, monster choice timing, ready/delay,
  reactions, summons, reinforcements, incapacitation, round boundaries, AI/DM receipts, saves, accessibility prose,
  balance, and tests all acquire actor-order state. It supersedes a deliberately locked solo-pacing rule.
- **Option B - keep side initiative and make an honest side-block activation ribbon (recommended for pre-alpha):**
  portraits are grouped into the two true initiative blocks in winner-first order. The acting block is emphasized;
  the particular citizen currently resolving an action receives the active treatment. Within a side, portraits are
  a roster/availability projection, not a falsely fixed speed order: the player may choose among legal party actors
  and the DM may choose the legal hostile sequence. This needs actor-level active/spent projection to become fully
  useful, but preserves the combat model and can later be rewired to per-creature ordering without replacing the
  shell or portrait system. Example: `[PC][Mira] | [Goblin 1][Varka][Wolf]`, with the whole winning side first and
  the currently resolving portrait raised on the line.
- **Option C - postpone the portrait ribbon until per-creature initiative is built:** retain the current Round/You
  Act/They Act banner and combatant strip so the interface cannot imply an order the rules do not own. This is the
  lowest implementation and semantic risk, but gives up Adam's desired top-center identity/readability aid during
  the pre-alpha period.

**Codex recommendation: Option B.** It gives the top-center line immediate truthful work—who is in the fight,
which side won, which side acts, which citizen is resolving, and who is still available—without smuggling a large
combat-rules rewrite into a renderer questionnaire. The visual structure and portrait derivation are not throwaway:
later per-creature initiative can change the grouping/order adapter while retaining the same tiles, active states,
labels, responsive layout, and accessibility contract.

Does Adam accept Option B, or does the portrait-by-portrait BG3 behavior justify reopening the side-initiative law
now? After this, exhaust ribbon state/overflow follow-ups and neutral/third-party lens placement before closing the
inspector/feedback branch. Wave 10 remains **OPEN**; no build is authorized.

### 11.23 F10.3k ruling - winner-first side-block initiative ribbon accepted

**Adam's ruling (2026-07-20):** accept Option B. Genesis preserves side-based initiative for pre-alpha. The
top-center ribbon presents the two canonical side blocks in initiative-winner-first order, with every revealed
participant represented by a square portrait or governed non-creature activation symbol. It does not assign or
imply a fixed speed order to citizens within a side.

Example:

```text
ROUND 3    [ PC ][ Mira ]  |  [ Goblin 1 ][ Varka ][ Wolf ]
             PARTY ACTS              HOSTILES
```

If the party won initiative, its block remains first for the encounter. The acting side receives a clear block-
level treatment. When the PC casts Fire Bolt, the PC tile receives the individual active treatment; when Varka
later resolves a hostile action, Varka's tile receives it without moving the hostile block or changing the stable
EngagementLens faction sides. A reaction may highlight its actual source without becoming a new initiative slot.
Hidden enemies still do not appear before reveal.

The accepted ribbon is an **adapter over existing side initiative**, not decorative misinformation and not a new
combat authority. A later per-creature-initiative upgrade may replace the grouping/order adapter while reusing the
same portrait derivation, labels, active/state treatments, safe-area layout, interaction, and accessibility work.

F10.3k is closed. It exposes a necessary actor-availability question because the current combat owner knows which
side acts but does not yet own complete per-citizen activation state for allies.

#### F10.3l - after one citizen acts, should their portrait move or stay put?

- **Option A - fixed portrait positions with explicit available/active/spent states (recommended):** a citizen's
  tile never changes position during the encounter. Available portraits remain fully present; the resolving citizen
  rises/frames on the line; a completed activation leaves a non-color-only spent check and restrained dimming. Down,
  defeated, fled, incapacitated, and hidden are distinct states rather than synonyms for spent. Example: after the
  PC acts, `[PC✓][Mira]` stays in the same order, immediately showing that Mira remains available on the party side.
- **Option B - move spent portraits behind a divider or to the block's tail:** available actors collect nearest the
  active point and spent actors slide away. This makes remaining capacity obvious, but portraits continually change
  position, weakens rapid identity recognition, complicates focus/tooltip anchoring, and visually suggests a queue
  even though the side may choose any legal actor.
- **Option C - show only acting side and current receipt source:** portraits remain fixed but receive no individual
  available/spent state. This is the lowest-cost honest projection of today's combat model, but the ribbon cannot
  answer the useful tactical question “who on this side still has an activation?”

**Codex recommendation: Option A.** Stable positions preserve the fast visual memory Adam wants from square
portraits, while explicit state makes the side-block ribbon materially more useful than the current side banner.
It adds a **medium actor-state and receipt-integration cost**: canonical per-round availability/spent projection,
ally seams, summon/reinforcement initialization, incapacitation, action completion, round reset, save/replay, and
accessible text. It does not change who wins initiative or force an order within the side. Option B needs the same
state plus reorder animation and more visual QA; Option C is low cost but leaves substantial ambiguity.

Does Adam accept Option A? If so, next settle crowded-ribbon overflow without leaking hidden counts, then neutral/
third-party EngagementLens placement. Wave 10 remains **OPEN**; no build is authorized.

### 11.24 F10.3l revision - bonus-ordered actors inside average-priority faction blocks

Adam proposes a stronger hybrid than the fixed-but-freely-ordered side block:

> "so each character has an initiative bonus right? why not just let the characters go in the order of their initiative bonus? how much more difficult is that to calculate? we can still keep it as Faction chunked turns, but within that faction turns go in order of initiative. faction with highest average initiative bonus should go first unless narrative says otherwise"

#### Plain answer - yes, and the arithmetic is almost free

Every **mechanically realized combatant should** have one canonical initiative bonus. Genesis already has most of
this seam:

- the living PC supplies `pc.init` or currently falls back to the sheet's Dexterity modifier;
- every resolved bestiary foe carries `init` from the stat block, falling back to zero when absent;
- a promoted sidekick has a resolved creature `statBase`, from which initiative can be carried;
- some hirelings, provisional/invented NPCs, hazards, and non-creature crisis actors do not yet expose a complete
  combat initiative record. They need a canonical chassis/priority or an explicit governed fallback before joining
  exact combat; the UI must not invent a flattering number merely to place them.

Calculating Adam's rule is trivial:

```text
initiativeBlock.priority = average(live starting members' initiativeBonus)
initiativeBlock.members  = members sorted by initiativeBonus descending
combat block order       = priority descending, unless a typed opening override applies
```

Example:

```text
Party:    PC +3, Mira +1                 average +2.00
Hostiles: Goblin 1 +2, Varka +2, Wolf +1 average +1.67

ROUND 1    [ PC +3 ][ Mira +1 ]  |  [ Goblin 1 +2 ][ Varka +2 ][ Wolf +1 ]
```

The party block acts first. The PC acts before Mira; then the hostile block begins, with the two +2 goblins tied
ahead of the +1 wolf. The ribbon keeps each portrait in that stable order and applies the accepted active/spent
states as the cursor advances.

This is **not** full BG3-style interleaving. A +5 goblin still does not jump between two party members once the
party block has won. It is deterministic ordered activation **inside** faction/chunk turns, which preserves the
speed and comprehensibility Adam wanted from side initiative while letting every initiative bonus matter.

#### Difficulty and maintenance cost

The numeric calculation is **low/trivial cost**: one linear average per block and one small sort. The product work
is **medium**, not high:

- introduce one normalized `initiativeBonus` projection instead of scattering PC Dexterity and foe `init` rules;
- give every legal combat actor a `combatSideId`/initiative block, bonus provenance, active/spent state, and stable
  tie position;
- carry sidekick/hireling/invented-actor chassis into combat and refuse or visibly default unresolved actors;
- snapshot block and member ordering, advance an actor cursor, reset availability each round, and preserve it in
  save/replay/receipts;
- handle down/incapacitated/fled actors, summons, reinforcements, allegiance changes, environmental activations,
  reactions, and combat ending mid-block;
- update DM/AI action envelopes, prose/accessibility twins, ribbon states, and deterministic verification.

Most of that actor-state work was already implied by F10.3l's useful available/active/spent portraits. The extra
cost of sorting by a number and averaging a block is negligible. Compared with full per-creature interleaving, this
avoids the hardest cross-faction scheduling, delay/ready insertion, and continuous turn-queue churn.

#### Necessary guardrails on “faction” and “narrative says otherwise”

Use a combat-time **initiative block**, not blindly the persistent political-faction id. A guild hireling fighting
beside the PC belongs to the party's current combat block; two hostile political factions cooperating in this fight
may share a hostile block; a genuine three-way conflict may expose three blocks. Political identity remains canon,
but present allegiance determines who acts together.

The opening block priorities should be snapshotted when combat starts. Later reinforcements must not recalculate an
average and retroactively make the whole round reorder. They insert at the correct initiative-bonus tier inside
their block under a later explicit entry-timing rule.

“Narrative says otherwise” must compile into a typed, player-legible `initiativeOverride` with provenance—an
established ambush, surprise/preparation state, preemptive action, scenario rule, or other already-canonical fact.
It cannot mean that the DM silently dislikes the calculated result. The opening receipt names the cause, and the
ribbon/prose explains why the lower-average block acts first. This preserves the creative DM's authority to realize
fiction while keeping the engine authoritative and the exception trackable.

The procedural-research corpus does not determine whether average initiative is the best combat-balance rule. It
does support this implementation posture: semantic facts compile into explicit constraints/priorities; ordering is
deterministic and inspectable; exceptions are typed and provenance-bearing; missing actor data produces a governed
fallback or honest refusal rather than an invented value. That is the Tutenel/Henderson/Whitehead/Merrell seam
applied here, not a claim that those papers studied initiative.

#### Revised F10.3l recommendation

**Codex recommends accepting Adam's hybrid.** It supersedes the earlier “free choice inside a side” part of F10.3k
without discarding the accepted side-block ribbon:

- block order = highest snapshotted average initiative bonus first;
- member order inside each block = highest initiative bonus first;
- portraits keep stable positions and show available, active, and spent states;
- a typed, visible, provenance-bearing opening override may supersede calculated block order;
- arithmetic ties, reinforcement timing, and the exact override-authority list remain generated follow-ups.

Does Adam want this locked as the best-case initiative law? If yes, settle equal-bonus/average ties first, then
reinforcements, narrative overrides, ribbon overflow, and neutral/third-party lens placement. Wave 10 remains
**OPEN**; no build is authorized.

### 11.25 Revised F10.3l ruling and F10.3m expansion - deterministic bonus order; dice break ties only

**Adam's ruling (2026-07-20):** lock the deterministic Option A reading. Ordinary initiative does not roll a d20.
The highest-average initiative block acts first; citizens within a block act from highest initiative bonus to
lowest. If necessary, equal priorities are settled with d20 rolls.

The exact accepted ordering contract is:

1. Every legal combat citizen exposes a canonical `initiativeBonus` with source/provenance.
2. At combat start, group present citizens into current combat-side/faction `initiativeBlock`s.
3. Compare block averages exactly. Implementation should retain `{sum,count}` and compare rational values by cross-
   multiplication rather than rounding displayed decimals and creating false ties.
4. Order blocks from highest exact average to lowest. Snapshot that order for the encounter.
5. Inside each block, order citizens from highest individual `initiativeBonus` to lowest and retain those stable
   portrait positions.
6. If two or more block averages are exactly equal, each tied block makes one open, unmodified d20 tie roll. If two
   or more citizens in one block have equal priority, each tied citizen makes one open, unmodified d20 tie roll.
   Re-roll only unresolved exact ties. Player-side tie dice are player-open; adversary/other-block dice are also
   shown under the existing open-adversary-dice posture.
7. Record the tie results in the combat-start receipt and freeze them for the encounter. They do not reroll each
   round, so the ribbon does not shuffle and save/replay reproduces the same order.
8. The cursor advances through fixed portraits; available, active, and spent states remain distinct from down,
   incapacitated, defeated, fled, hidden, or not-yet-arrived.

This supersedes the old side d20 plus modifier and the prior freely chosen within-side order. It remains faction-
chunked rather than cross-faction interleaving. The calculation itself stays trivial; the medium actor-state and
edge-case integration described in section 11.24 remains future implementation work.

#### Existing-rule audit - deterministic initiative cannot silently erase advantage/disadvantage

The repository contains several initiative-roll modifiers that the new deterministic rule must translate:

- SRD surprise imposes Disadvantage on Initiative;
- class/subclass and sidekick features grant Advantage on Initiative;
- canonical magic items such as the Awareness Ioun Stone, Sentinel Shield, Rod of Alertness, Weapon of Warning,
  and other authored items grant Advantage;
- Genesis realm items, dungeon/wilderness effects, art/background events, and composition tables grant advantage,
  disadvantage, flat initiative bonuses, or special arrival priorities such as “Initiative 0.”

Flat numeric bonuses can remain part of `initiativeBonus`. Advantage/disadvantage cannot, because the ordinary roll
they modified no longer exists. Letting those entries do nothing would break character choices and existing
procedural rewards/costs.

#### F10.3m - what does initiative advantage/disadvantage mean without an ordinary roll?

- **Option A - deterministic priority edge of +3/-3 (recommended):** derive `initiativePriority` from the canonical
  bonus plus `+3` for net Advantage or `-3` for net Disadvantage. Multiple sources do not stack; one of each cancels,
  following ordinary advantage/disadvantage law. Sort members and calculate block averages from priority, while the
  sheet retains the true bonus separately. If an exact priority tie still reaches the d20 fallback, advantage or
  disadvantage also applies to that tie roll only if it has not already been consumed into the ±3 edge—never count
  it twice. Codex recommends simply using the edge and rolling an unmodified tie die.
- **Option B - advantage/disadvantage affects ties only:** bonuses determine ordinary order; on an exact tie,
  Advantage rolls 2d20 and keeps the higher while Disadvantage keeps the lower. This preserves the familiar dice
  procedure but makes major class features and magic items irrelevant in most combats.
- **Option C - retain initiative rolls only for affected citizens:** an advantaged or disadvantaged actor rolls
  while ordinary actors use deterministic bonuses. This mixes incomparable random totals and fixed bonuses,
  reintroduces most of the variance Adam just removed, and makes the ribbon harder to explain.

**Codex recommendation: Option A.** The expected benefit of d20 Advantage is roughly three points, so a nonstacking
integer ±3 priority edge is legible, deterministic, and materially preserves those features. It is not written back
as a fake sheet bonus. Implementation/maintenance cost is **low-medium**: one normalized priority derivation,
advantage cancellation, provenance/tooltips, block-average use, and fixtures covering surprise/items/features. It
is lower and more consistent than reviving selective initiative rolls.

Does Adam accept the ±3 deterministic priority edge? After this, settle reinforcement insertion, exact narrative-
override authority, ribbon overflow, and neutral/third-party lens placement. Wave 10 remains **OPEN**; no build is
authorized.

### 11.26 F10.3m ruling and F10.3n expansion - deterministic initiative edge accepted; place reinforcements in time

**Adam's ruling (2026-07-20):** accept Option A. A citizen's ordering value is a derived
`initiativePriority = initiativeBonus + initiativeEdge`, where net Advantage contributes `+3`, net Disadvantage
contributes `-3`, and no net state contributes zero. Multiple Advantage or Disadvantage sources do not stack; any
amount of both cancels to zero under the ordinary cancellation law.

The canonical sheet/stat-block `initiativeBonus` remains unchanged and separately inspectable. `initiativeEdge`
records its source/provenance—surprise, feature, item, condition, realm effect, or other licensed rule—and expires
when that source says it does. Member sorting and starting block averages use `initiativePriority`. If an exact tie
survives, the accepted d20 tie-break is unmodified because the edge has already represented Advantage/Disadvantage;
never apply the same source twice.

Examples:

- a ranger with canonical `+2` initiative and an Awareness Ioun Stone has priority `+5`;
- a `+2` goblin surprised at combat start has priority `-1`;
- a `+2` sidekick with two separate Advantage sources still has priority `+5`, not `+8`;
- the same sidekick with at least one Advantage and at least one Disadvantage source returns to priority `+2`;
- if two citizens remain tied at priority `+5`, they each make the accepted open unmodified d20 tie roll once and
  keep that order for the encounter.

This gives all audited initiative features a deterministic effect without selectively reviving ordinary initiative
rolls. F10.3m is closed. Reinforcement insertion is now the next material ordering edge.

#### F10.3n - when can a newly revealed reinforcement act?

- **Option A - insert at its true priority position; act only if that position has not passed (recommended):** the
  new citizen appears in its block at the sorted `initiativePriority` tier. If the block has not begun this round,
  it acts normally. If the block is in progress and the cursor has not yet passed that tier, it may act when reached;
  if its tier already passed or its block already finished, it is visibly waiting until next round. The encounter's
  snapshotted block averages/order never recalculate.
- **Option B - every reinforcement waits until next round:** insert the portrait immediately but mark it waiting,
  regardless of when its block acts. This is simplest and prevents surprise extra actions, but a guard revealed
  before the hostile block begins can stand inert through an entire round for no mechanical reason.
- **Option C - every reinforcement acts immediately after arrival:** dramatic and easy to narrate, but it lets
  summoning/reveal timing manufacture extra actions, interrupts the stable block cursor, and makes a high-priority
  late arrival stronger than a high-priority citizen present from the start.

Under Option A:

```text
Hostile block order: [ Varka +4 ][ Goblin 1 +2 ][ Wolf +1 ]
Current cursor:                         ^ Goblin 1 resolving
```

- a second wolf at `+1` arrives now: its tier is still ahead, so it may act when the cursor reaches `+1`;
- a captain at `+4` arrives now: that tier already passed, so its tile enters with a waiting marker and acts next
  round;
- either actor revealed during the earlier party block may act normally when the hostile block begins;
- either actor revealed after the hostile block finishes waits until next round.

Ties at the current tier join that still-open tier and use the accepted tie d20 only if a stable relative order is
needed. A specific spell/feature that says a summon acts immediately after its summoner, or an authored scheduled
arrival such as `Initiative 0`, compiles as an explicit timing override rather than being approximated by the
generic rule. Arrival itself may carry a governed entry effect, but that effect is not secretly a full activation.

The ribbon creates no hidden placeholder. On reveal it animates/inserts the actual portrait at its stable slot and
states `available this round` or `waiting until next round` without color alone. Replays use the reveal receipt and
cursor position, not a fresh timing guess.

**Implementation/maintenance cost:** Option A is **medium-low beyond the already accepted cursor**: insertion by
priority, passed-tier comparison, waiting state, reveal receipt, round reset, tie handling, and scheduled/specific-
rule overrides. Option B is low; Option C is superficially low but creates high balance and interruption debt.

**Codex recommendation: Option A.** It makes initiative priority matter without time travel, treats arrivals before
their block fairly, and gives authored summon/arrival rules an explicit override seam.

Does Adam accept Option A? If so, audit a genuinely new faction/block entering mid-combat, then lock exact opening-
override authority, crowded-ribbon overflow, and neutral/third-party lens placement. Wave 10 remains **OPEN**; no
build is authorized.

### 11.27 F10.3n ruling and F10.3o expansion - priority insertion without backward time

**Adam's ruling (2026-07-20):** accept Option A. A newly revealed citizen joining an existing initiative block is
inserted at its stable derived-priority tier. It may take an ordinary activation in the current round only when both
its block and that tier remain ahead of the current cursor. If its tier or whole block has passed, its portrait enters
with a non-color-only waiting marker and becomes available next round.

The arrival receipt records the citizen id, block id, priority and provenance, reveal point, cursor position,
computed insertion slot, current-round eligibility, and any specific timing override. The starting block average and
block order remain frozen. Later members cannot improve or reduce a side's already-earned encounter position.

Specific authored timing beats generic insertion: a summon that explicitly acts immediately after its summoner, a
scheduled `Initiative 0` arrival, or a governed entry action uses a typed override. An entry effect is not silently a
complete activation. Hidden placeholders/counts remain forbidden; the portrait appears only when the citizen is
revealed as a participant. F10.3n is closed.

#### F10.3o - what if the arrival belongs to a genuinely new combat faction/block?

This is different from another wolf joining the existing hostile block. Examples include city guards entering a
party-versus-cult fight without yet siding with either, two hostile factions turning on one another, or a dragon
arriving with goals opposed to everyone already present.

- **Option A - insert the new block by its frozen entry average, with no backward-time activation (recommended):**
  calculate the new block's exact average from its revealed starting members at entry and freeze it. Insert it among
  the existing blocks by priority while preserving existing blocks' relative order. If the new block's rightful
  slot is still ahead of the round cursor, it may act this round; if that slot has passed, it waits until next round.
- **Option B - append it to the end for this round, then sort it next round:** simple and guarantees an arrival never
  interrupts remaining blocks, but a very fast third party revealed before its proper slot acts after everyone for
  an arbitrary first round and then jumps elsewhere on the ribbon.
- **Option C - give the new faction an immediate entry turn:** maximizes drama but treats arrival itself as a free
  faction activation, encourages timing exploits, and can interrupt an action/receipt already resolving.

Option A examples:

```text
Initial block order: PARTY +3 | HOSTILES +1
Current cursor:      PARTY resolving
```

- city guards enter at average `+2`: their rightful block belongs between Party and Hostiles, so they may act this
  round after Party and before Hostiles;
- a dragon enters at average `+5`: its rightful slot is before the already-active Party block, so it enters visibly
  waiting, then leads the next round;
- scavengers enter at average `0` after the Hostile block has completed: their slot has passed with the round, so
  they wait until next round.

A citizen is not placed into a separate block merely because it belongs to a different political faction. The
combat owner creates a new block only when present allegiance and independent objectives make it a genuinely
separate acting side. A guard who has not joined the fight remains a scene citizen, not a hidden initiative tile; a
guard who commits to helping the PC joins the party block under F10.3n; guards pursuing both sides become their own
block. Viewpoint projection may describe their allegiance as uncertain without exposing DM-only intent.

The new block's member positions and tie result freeze at entry. Subsequent reinforcements use F10.3n and do not
recalculate its average. A later allegiance change requires a separate typed transfer rule rather than silently
dragging a portrait between blocks mid-activation.

**Implementation/maintenance cost:** Option A is **medium-low beyond accepted insertion machinery**: create/freeze a
block at an entry receipt, compare its rational average, locate it relative to the round cursor, update the ribbon
without hidden leakage, and persist it. Option B is slightly cheaper; Option C shifts cost into balance,
interruption, and replay bugs.

**Codex recommendation: Option A.** It extends the accepted priority law consistently: new information may enter
the remaining future, never rewrite the already-spent past.

Does Adam accept Option A? If so, settle later allegiance changes, then exact narrative-opening overrides,
crowded-ribbon overflow, and neutral/third-party EngagementLens placement. Wave 10 remains **OPEN**; no build is
authorized.

### 11.28 F10.3o ruling and F10.3p expansion - new blocks enter the remaining future

**Adam's ruling (2026-07-20):** accept Option A. When a genuinely independent combat side becomes a revealed
participant mid-encounter, create a new initiative block from its revealed entry roster, calculate its exact average
priority, freeze that average, and insert the block among existing blocks without changing those blocks' relative
order.

The new block may act in the current round only if its rightful priority slot remains ahead of the round cursor. If
that slot has passed, the whole block enters visibly waiting and begins at its stable position next round. Later
members use F10.3n without recalculating the new block's entry average. A political faction id alone never creates
an initiative block: present combat allegiance and independent objectives do. A guard helping the PC joins the
party block; guards committed against both party and cult may become their own block; an undecided bystander stays
off the initiative ribbon until it becomes a combat participant.

The new-block receipt records entry roster, priorities/provenance, exact average, tie result if any, insertion slot,
cursor position, eligibility, allegiance evidence visible to the player, and any typed timing override. F10.3o is
closed.

#### F10.3p - what happens when a citizen changes sides after acting or waiting?

Examples include Varka accepting a mid-fight parley and helping the party, a dominated companion becoming hostile,
a guard choosing one combat side, a charmed enemy temporarily treating former allies as enemies, or a mercenary
defecting when morale breaks.

- **Option A - change allegiance immediately, carry the citizen's round-activation state across the transfer
  (recommended):** targeting, hostility, control, and faction-sensitive effects update at the committing receipt.
  Move the portrait to the destination block at its stable priority tier, but carry `actedRound`/availability with
  the citizen. An actor that already acted remains spent; an unspent actor may act only if the destination block and
  tier have not passed; otherwise it waits. Never grant a second activation merely because the block changed.
- **Option B - defer the whole allegiance change until next round:** the ribbon stays simple, but the citizen remains
  mechanically allied with the wrong side after betrayal, charm, surrender, or domination has already become true.
  Target legality, auras, opportunity attacks, and DM narration can contradict one another for the rest of the
  round.
- **Option C - transfer immediately and refresh the actor in the destination block:** visually direct but highly
  exploitable. A citizen can act, defect, and act again; charm/domination becomes an unintended action-economy
  engine.

Option A examples:

- Varka attacks on the hostile block, then defects before the party's next block: Varka moves to the party block
  immediately for targeting and reactions but remains spent for the current round;
- an unspent `+1` guard joins the party while the party block is currently resolving its `+3` PC: the guard's tier
  remains ahead, so the guard may act at `+1` this round;
- an unspent `+4` guard joins after the party cursor has passed `+4`: the guard waits until next round rather than
  traveling backward;
- a companion becomes dominated during the hostile block after already acting for the party: it moves to the
  hostile block and is hostile immediately, but cannot receive another ordinary action this round;
- ending a temporary charm transfers the same canonical citizen back under the same law; no duplicate portrait or
  fresh activation is minted.

If allegiance changes during that citizen's currently resolving receipt, complete or interrupt that receipt only as
the causative rule explicitly says, then commit the transfer at a receipt boundary. Do not relocate a portrait
halfway through an unresolved mechanical transaction. The transfer animation is purposeful state feedback: one
portrait crosses between blocks with an icon/caption naming the player-known cause, preserving canonical id,
speakable label, tie result, and `actedRound`. It may not reveal secret duration, controller identity, or hidden
motive.

For a genuinely independent destination, create/locate its block under F10.3o. If the departing citizen was the
only member of a block, retire the empty block after the receipt; if it later reforms, it is a new entry event rather
than a ghost placeholder. Existing block averages remain their frozen encounter/entry values even when membership
changes; otherwise charm, death, or defection would make block order oscillate.

**Implementation/maintenance cost:** Option A is **medium**: canonical combat allegiance, transferable actor
availability, destination insertion, empty-block retirement, transaction-boundary sequencing, target/aura/reaction
revalidation, ribbon/lens motion, accessibility text, save/replay, and tests. Option B is lower initiative-state cost
but creates high cross-system inconsistency; Option C creates balance and exploit debt.

**Codex recommendation: Option A.** Allegiance truth should change when the world changes, while the activation
receipt follows the citizen so changing teams never creates time or a duplicate turn.

Does Adam accept Option A? If so, settle exact narrative-opening override authority, then crowded-ribbon overflow
and neutral/third-party EngagementLens placement. Wave 10 remains **OPEN**; no build is authorized.

### 11.29 F10.3p ruling and F10.3q expansion - allegiance moves now; activation time follows the citizen

**Adam's ruling (2026-07-20):** accept Option A. A committed allegiance change immediately updates the canonical
citizen's combat block, hostility, control, target legality, faction-sensitive auras, opportunity relations, and
other side-dependent mechanics. The same citizen and portrait move to the destination block at the stable priority
tier, carrying `actedRound` and current availability. Transfer never refreshes an activation.

An already-spent actor remains spent. An unspent actor may act this round only if the destination block and tier
remain ahead of the cursor; otherwise it waits. Commit a transfer at a mechanical receipt boundary, after completing
or interrupting the causative action exactly as its rule says, never midway through unresolved state mutation.
Temporary control ending transfers the same id back under the same law. Empty blocks retire without ghost slots;
all affected block averages remain frozen so membership changes cannot oscillate initiative order.

The ribbon/lens performs one purposeful non-color-only transfer cue with player-known cause, preserving identity,
label, tie result, and spent state without revealing hidden controller, motive, or duration. F10.3p is closed.

#### F10.3q - exactly when may “the narrative” override calculated opening order?

The creative DM needs authority to honor real fictional setup, but “narrative says otherwise” cannot be an
unreceipted license to discard initiative whenever a dramatic sentence sounds better. Several different situations
must not be collapsed into one full-faction override.

- **Option A - tiered typed opening authority (recommended):** use the least powerful rule that truthfully realizes
  the established setup: readiness/surprise changes initiative priority; a legal already-committed trigger may
  resolve one opening action/effect; only an explicit authored scenario/system rule may force a whole block first or
  last. Every exception has provenance and player-legible cause.
- **Option B - DM may declare any fictionally justified block first:** maximizes improvisational freedom but gives
  the DM an invisible balance lever, makes initiative builds unreliable, permits contradictory rulings, and cannot
  be reproduced or tested from world state.
- **Option C - calculated priority can never be overridden:** maximally deterministic, but can force absurd results
  when a bomb is already exploding, a readied arrow's trigger has committed, or a governed scenario explicitly
  begins with an environmental beat.

Option A has three ordered authority tiers:

1. **Priority condition, not an override.** Established surprise, vigilance, preparation, item, feature, or scene
   state applies the accepted `initiativeEdge` or a licensed flat modifier before averages freeze. Goblins hidden
   behind a door against an unaware party usually impose Surprise/Disadvantage (`-3`) on the affected citizens; they
   do not automatically receive a free hostile block.
2. **One opening receipt before Round 1.** An action/effect already declared, validated, and causally triggered
   before combat formally begins may resolve once, then deterministic block order begins unchanged. Examples: a PC's
   valid “I loose the arrow if the cultist rings the bell” trigger fires when the bell is touched; a collapsing-floor
   hazard already triggered resolves its fall; an assassin's released projectile resolves only if the ambush/setup
   procedure actually licensed that release. This is not a whole block and cannot smuggle movement plus every ally's
   actions into the opening.
3. **Rare explicit block-order override.** Only a named, versioned scenario/system contract may state that a block
   acts first/last or at a fixed phase—for example a boss-phase rule, scheduled lair/environment block, or validated
   transition from a chase/breach procedure. The opening receipt names the rule and reason. Freeform narration alone
   cannot create this tier.

The precedence is:

```text
canonical pre-combat facts
  -> apply priority edges/modifiers
  -> resolve any licensed single opening receipt(s) in their governed order
  -> apply rare explicit block-order contract if present
  -> otherwise freeze exact average-priority order and tie results
```

Examples and boundaries:

- “The goblins look ready” is narration, not authority. Their actual hidden/readied/surprise facts provide the rule.
- A player shouting “I stab him before combat starts” does not evade initiative. It needs an already-established
  legal trigger, deception/awareness resolution, or other validated setup; otherwise it enters ordinary order.
- A cultist completing a ritual that triggers an explosion may commit the explosion as an opening hazard receipt;
  the cultist faction does not thereby gain its whole block first.
- An authored dragon phase that explicitly says `hostile block first` may override averages, with the ribbon and
  accessible prose stating the known cause. If the cause is secret, show the observable honest consequence without
  revealing its hidden explanation.
- Conflicting opening authorities resolve by fixed authority/specificity and then an explicit tie procedure; the DM
  may not choose whichever is most punishing after seeing the calculated order.

This preserves DM invention: the DM may propose that an ambush, betrayal, unstable bridge, ritual threshold, or
readied response matters. The resolver classifies that meaning into supported priority, opening-action, or rare
block-order authority and validates it against canon. It is the same Wave 2 semantic-authorship/mechanical-
compilation law applied to initiative.

**Implementation/maintenance cost:** Option A is **medium**: a closed opening-authority vocabulary, source
provenance, pre-round receipt phase, precedence/conflict rules, digest support, ribbon/prose explanation, secrecy
projection, save/replay, and adversarial fixtures. Option B is cheap to prototype but high unbounded maintenance and
fairness cost; Option C is low but breaks legitimate authored transitions.

**Codex recommendation: Option A.** It gives the DM meaningful creative authority while ensuring inventions become
real trackable mechanics instead of invisible fiat—the core vision Adam established in Wave 2.

Does Adam accept Option A? If so, audit conflicting/secret opening causes only as needed, then settle crowded-ribbon
overflow and neutral/third-party EngagementLens placement. Wave 10 remains **OPEN**; no build is authorized.

### 11.30 F10.3q ruling and F10.3r expansion - narrative setup compiles into bounded opening authority

**Adam's ruling (2026-07-20):** accept Option A. “Narrative says otherwise” is not freeform initiative fiat. The
resolver uses the least powerful typed authority that truthfully realizes already-established fiction:

1. readiness, surprise, features, items, and scene conditions normally modify deterministic initiative priority;
2. one already-declared, validated, causally triggered action/effect may resolve as an opening receipt before Round
   1 without granting its faction a whole block;
3. only a named, versioned scenario/system contract may force an entire block first/last or to a fixed phase.

Every opening exception carries provenance and an honest player-facing consequence. A quick declaration after
hostility is obvious does not bypass initiative; hidden goblins normally use the surprise/priority law; a readied
arrow needs an established trigger; a collapsing floor may resolve its triggered hazard; a boss/lair block override
must already exist as an authored rule. F10.3q is closed.

#### F10.3r - when several opening triggers fire together, who resolves first and what may stay secret?

Example: the cultist touches the bell. That touch satisfies the PC's readied-arrow condition, starts an authored
bells-and-fire trap, and licenses a boss reaction. All three cannot be ordered after the fact according to which
outcome the DM prefers.

- **Option A - deterministic opening window with viewpoint-safe receipts (recommended):** collect all candidate
  openings licensed by the same committed trigger, classify their timing (`before`, `interrupt`, `after`), order
  equal-timing candidates by explicit rule specificity/priority and then source `initiativePriority`, using the
  accepted d20 only for a remaining exact tie. Commit one receipt at a time and revalidate later candidates. Show
  every observable action/consequence and the honest existence of an exceptional opening, while withholding only
  hidden source, motive, duration, or rule text the viewpoint has not earned.
- **Option B - resolve every opening simultaneously as one batch:** appears neutral but cannot handle one opening
  disabling another, interrupted movement, resource contention, death before a later action, or a trap whose trigger
  remains committed after its triggering actor falls.
- **Option C - let the DM choose the most dramatically satisfying order:** easy to narrate, but turns hidden timing
  into untrackable outcome control and makes save/replay, tactical planning, and adversarial testing unreliable.

Option A's opening-window contract:

```text
committed trigger receipt
  -> collect licensed opening candidates from preexisting state
  -> classify before / interrupt / after
  -> explicit specific timing rule wins
  -> otherwise higher source initiativePriority
  -> otherwise one open d20 tie-break, frozen in the opening receipt
  -> commit candidate
  -> revalidate remaining candidates against new canonical state
  -> continue or cancel with reason
  -> begin Round 1 under frozen block order
```

Concrete consequences:

- touching the bell commits first. If the trap says it fires **after** contact while the arrow is a legal interrupt,
  the arrow resolves first; killing the cultist does not un-touch the bell, so the already-triggered trap may still
  fire after revalidation;
- two legal readied arrows with the same timing use their sources' initiative priorities, then a d20 only if still
  tied. This ordering is receipted once, not improvised or rerolled;
- if the first opening destroys the second archer's bow, moves its target out of legal reach, consumes the shared
  resource, or otherwise invalidates that candidate, the later opening cancels with a typed reason rather than
  resolving from stale state;
- an unobserved magical item may be the DM-side provenance for an enemy's priority edge. The player sees the enemy
  move with supernatural readiness or sees `opening order altered by an unseen factor` only when that fact itself is
  perceptible; the UI does not expose the item name, exact duration, or hidden owner;
- a visible collapsing floor receives visible board/audio/caption feedback and an ordinary known label. Secrecy is
  never a reason to make an observable consequence silent.

The right narration rail may dramatize these committed receipts but does not choose their order. The top ribbon may
briefly show a compact `OPENING` phase and source portrait/symbol, then return to Round 1; the board remains complete
when the EngagementLens is collapsed. Accessibility prose names known source, action, target/consequence, cancel
reason where player-legible, and the transition into normal block order.

**Implementation/maintenance cost:** Option A is **medium** beyond F10.3q: candidate collection, timing vocabulary,
precedence, source priority/tie rolls, sequential transactional revalidation, cancellation receipts, secrecy
projection, UI phase, save/replay, and conflict fixtures. Option B trades explicit work for stale-state bugs; Option
C has low code cost but unacceptable fairness and reproducibility debt.

**Codex recommendation: Option A.** It preserves causal chains and DM creativity while making simultaneous dramatic
ideas mechanically real, ordered, replayable, and honest about what the player can know.

Does Adam accept Option A? If so, the opening-authority branch can close and F10.3s can settle crowded-ribbon
overflow. Neutral/third-party EngagementLens placement follows. Wave 10 remains **OPEN**; no build is authorized.

### 11.31 F10.3r ruling - deterministic transactional opening window accepted

**Adam's ruling (2026-07-20):** accept Option A. When one committed pre-combat trigger licenses several opening
effects, collect every candidate from preexisting canonical state, classify its explicit `before`/`interrupt`/
`after` timing, and order it by specific authored timing authority, then source `initiativePriority`, then one open
d20 only for a remaining exact tie.

Commit candidates sequentially and revalidate every remaining candidate after each receipt. A later candidate may
resolve, change truthfully, or cancel with a typed reason; it never executes against stale state merely because it
was present in the initial list. A committed cause is not undone retroactively—a cultist dying after touching the
bell does not un-touch it—but a destroyed bow, moved target, lost resource, dead source, or invalidated condition may
cancel a later opening whose own requirements no longer hold.

Observable actions and consequences receive complete board/audio/caption/accessibility feedback. Player-facing
projection may conceal only unearned source, owner, motive, duration, or rule text; the DM-side receipt retains full
provenance. The narration rail dramatizes committed order and does not choose it. A compact `OPENING` ribbon phase
may identify known sources/symbols before Round 1 without exposing hidden participants. F10.3r and the current
opening-authority branch are closed.

#### F10.3s - how should the initiative ribbon handle more portraits than fit across the board?

- **Option A - one bounded row with adaptive tile size, then horizontal overflow navigation (recommended):** keep a
  single unambiguous order line. Reduce tiles only to a legible minimum; beyond that, clip to a scrollable/steppable
  viewport. The active tile automatically enters view. Edge chevrons and known offscreen counts state that more
  revealed citizens exist without implying hidden slots. Wheel/trackpad, drag, buttons, keyboard, controller, and
  touch all navigate the same order; focus/hover exposes the stable speakable label.
- **Option B - wrap the ribbon into two or more rows:** exposes more portraits simultaneously, but steals a variable
  amount of tactical board height, makes reading block/order direction ambiguous at row breaks, and causes large
  layout jumps as reinforcements appear.
- **Option C - collapse similar citizens into stack tiles such as `Goblin ×8`:** compact and visually calm, but
  destroys the accepted individual bonus order, active/spent state, stable `Goblin 1`/`Varka` labels, targeting,
  allegiance transfer, and reinforcement insertion unless the combat rules themselves canonically model that group
  as one swarm/unit.

Option A behavior:

- the ribbon remains centered in the SceneTray's governed top safe gutter and never grows downward over cells;
- tile sizes may step through a small approved desktop/tablet scale set, never shrink continuously into illegibility;
- the current actor is always brought fully into view with restrained motion; reduced-motion mode changes the scroll
  position without animated travel;
- manual browsing is not immediately stolen by unrelated hover or board selection. Auto-follow resumes on the next
  true active-actor transition, with a visible Return to Active control available sooner;
- block separators/labels remain visible or receive sticky edge context so a clipped viewport never makes party,
  hostile, or third-party portraits look like one faction;
- left/right edge affordances show only counts of **revealed** offscreen tiles, such as `‹ 3`, never reserved spaces
  or hidden totals. Defeated/fled/retired visible citizens follow the accepted state/retirement law;
- the DOM/order owner retains the complete known sequence. Visual clipping does not remove accessible list items,
  natural-language targeting aliases, controller traversal, or receipt focus;
- extremely large battles may virtualize portrait rendering for performance, but virtualization may not aggregate
  mechanically independent actors or change initiative truth. A canonical swarm/mob is one tile only when the
  combat model says it is one actor.

**Implementation/maintenance cost:** Option A is **medium responsive-UI work**: discrete tile scales, measured safe
width, overflow viewport, active auto-follow, manual-browse grace, input parity, sticky block context, accessibility,
reduced motion, reveal insertion, and dense fixtures. Option B is lower initial interaction work but high layout and
order-comprehension debt. Option C is cheap only by silently changing mechanics.

**Codex recommendation: Option A.** It preserves every individual mechanical citizen and one readable order axis
while bounding the ribbon's claim on the battle board.

Does Adam accept Option A? If so, audit active-follow versus manual browsing only as needed, then resolve neutral/
third-party EngagementLens placement. Wave 10 remains **OPEN**; no build is authorized.

### 11.32 F10.3s ruling - bounded single-row initiative overflow accepted

**Adam's ruling (2026-07-20):** accept Option A. The top-center initiative ribbon remains one bounded horizontal
order axis. Portrait tiles step down only through a small approved set of legible desktop/tablet sizes; when the
known roster still exceeds the safe width, the ribbon becomes horizontally navigable rather than wrapping or
collapsing mechanically independent citizens into false stacks.

The active portrait always enters fully into view on a true actor transition. Reduced-motion mode snaps rather than
animates that movement. Manual browsing receives a grace state so hover, focus, or board inspection does not
instantly steal the viewport; auto-follow resumes at the next true activation, while Return to Active remains
available. Sticky block context and non-color-only separators prevent a clipped view from merging factions.

Edge controls/counts expose only revealed offscreen tiles (`‹ 3`, `4 ›`), never hidden totals or reserved slots.
All input modes navigate the same canonical order. Visual clipping or optional rendering virtualization never
removes accessible order/list content, speakable aliases, targetability, receipt focus, or state. A stack tile is
legal only when the combat model itself owns one swarm/mob actor. F10.3s and the initiative-ribbon overflow branch
are closed.

#### F10.3t - where do neutral and third-party actors stand in the EngagementLens?

The accepted lens keeps party/companions on the left and hostiles on the right. A genuine three-way fight or an
independent group cannot be forced into that binary without either falsely declaring allegiance or making actors
jump sides whenever the active target changes.

- **Option A - stable relationship anchors with a center/rear independent band (recommended):** party-aligned actors
  stay left. Actors hostile to the party stay right, separated into labeled faction subclusters when several hostile
  factions also oppose one another. A mechanically participating block that is independent but not hostile to the
  party occupies a smaller center/rear anchor with a non-color-only neutral/independent badge. True bystanders stay
  out of the combat lens. Allegiance receipts move the same citizen between anchors under F10.3p.
- **Option B - place every non-party citizen on the right:** preserves a simple left/right silhouette but makes
  undecided guards look hostile, compresses enemies who are fighting each other into one apparent team, and makes
  right-to-right attacks difficult to read without substantial subcluster grammar.
- **Option C - always place the active actor on the left and its targets on the right:** every exchange reads like a
  classic duel, but factions mirror constantly and directly reverses the accepted stable-side F10.3i ruling.

Option A examples:

- the party remains left; cultists hostile to the party remain right;
- city guards entering but opposing only the cultists appear in the center/rear independent anchor, with their
  `GUARDS` block badge and action travelling toward the cultist subcluster;
- if guards become hostile to everyone, they remain a distinct independent/right-side subcluster rather than being
  visually absorbed into the cultists. Their attacks identify source and target even when both non-party clusters
  occupy the right/center half;
- if guards formally join the party, the committing allegiance receipt moves their portraits/figures to the left;
  if Varka defects, Varka crosses from the hostile anchor to the party anchor once, carrying spent state;
- a dominated companion becomes mechanically hostile and moves to the right for the duration known to the engine,
  without revealing the controller or secret duration to the player;
- an undecided guard who has not entered combat, a terrified witness, and an ordinary bystander remain board/canon
  citizens but do not receive lens combat placement merely to balance the composition;
- hazards, lair beats, and environmental activations use governed symbol/effect anchors rather than pretending to be
  a faction of people.

The center/rear anchor is a **relationship presentation**, not a claim that those citizens occupy center cells or
higher elevation on the BattleMat. Exact positions, distance, cover, line of sight, and targeting remain board
truth. A badge/shape and labeled action path distinguish relationship role without relying on screen position or
color alone.

For more factions than the lens can honestly stage, do not miniaturize everyone into noise. The active block, its
material targets/reactors, and any immediate independent interrupter receive figures; other revealed participating
blocks remain represented by labeled edge/block indicators and complete board feedback until materially involved.
This is presentation filtering only—initiative portraits and board citizens remain individually available.

**Implementation/maintenance cost:** Option A is **medium presentation work**: third anchor, block badges,
subclusters, stable allegiance mapping, direction variants for center/right-to-right actions, transfer animation,
crowd filtering, accessibility, and three-way fixtures. Option B is lower initial layout cost but higher semantic
confusion; Option C discards the already accepted stability work.

**Codex recommendation: Option A.** It preserves the party-left/hostile-right memory, gives genuine independence a
truthful visual home, and lets allegiance changes become meaningful visible events without turning the lens into a
second spatial map.

Does Adam accept Option A? If so, audit crowd filtering and transient control only if a material conflict remains,
then the extended F10.3 inspector/feedback/lens branch can close with its mandatory active-follow playtest gate and
resume F10.6b native-resolution proof. Wave 10 remains **OPEN**; no build is authorized.

### 11.33 F10.3t ruling and extended F10.3 closure - three anchors, allegiance glows, mandatory playtest

**Adam's ruling (2026-07-20):** provisionally accept Option A and require playtesting. Party-aligned citizens occupy
the left EngagementLens anchor; citizens hostile to the party occupy the right, separated into labeled subclusters
when several hostile factions also oppose one another; a mechanically participating independent block that is not
hostile to the party occupies a smaller center/rear anchor. True bystanders remain off the combat lens. The board
continues to own exact space.

Adam also sets the allegiance-color target:

> "good guys blue (unless player declares their team is a different color) bad guys red neutral guys grey (glow colors around active pieces and active initiative portraits
>
> we'll try A, that will need some play testing"

“Good” and “bad” are player-facing shorthand, not objective moral canon. The presentation mapping is:

- **party/current allies:** blue by default, or the player's declared team color;
- **hostile to the party:** red;
- **neutral/independent:** grey;
- **active citizen:** the corresponding allegiance glow appears around both the exact board piece and its initiative
  portrait, binding the two projections to one canonical actor.

Color is a redundant identity channel, never the only one. The active citizen also receives a distinct ring/shape,
turn glyph, portrait elevation/frame, label, and accessible text; reduced motion retains the static form. Faction
block separators/badges and stable anchors remain legible in grayscale and common color-vision simulations. A
player-selected team color is presentation preference, not world state. Its preview must prove contrast against the
stage, hostile red, neutral grey, focus, selection, movement, and hazard cues; unsafe collisions require a truthful
secondary outline/pattern rather than silently changing allegiance.

Allegiance transfer uses the accepted receipt law: the same board piece and portrait move anchors/blocks once and
adopt their new glow without refreshing activation or revealing secret control/duration. A dominated companion may
therefore appear on the hostile side/red treatment while mechanically hostile; a charmed Varka joining the party may
move left/blue or the chosen team color. The display states current relation, not moral essence.

Mandatory F10.3 playtest/capture cases now include:

1. one-PC duel and ordinary party-versus-hostile combat;
2. independent guards attacking only cultists from the center/rear anchor;
3. two non-party hostile blocks attacking one another and the party;
4. reinforcement/new-block insertion, defection, surrender, charm/domination, and restoration;
5. active-follow across fast turns, reactions, manual lens collapse, character drawer, and minimum layout;
6. dense initiative overflow plus EngagementLens population filtering;
7. default blue/red/grey, at least two custom party colors, grayscale, common color-vision simulations, reduced
   motion, keyboard/controller/touch, and prose/screen-reader equivalents;
8. comprehension questions: identify active citizen, current allegiance, source/target, who remains available, and
   whether lens position is relational rather than an exact BattleMat cell.

Reopen F10.3h/F10.3t if active-follow creates focus fighting, center/rear reads as physical position, custom colors
collapse allegiance recognition, right-to-right actions become unclear, or filtering hides a material participant.
Do not “fix” a failed playtest silently during implementation.

F10.3t is provisionally closed. The extended F10.3 inspector/feedback/lens branch has no remaining material design
follow-up and closes at questionnaire level with the mandatory playtest gate above. Wave 10 itself remains open.

#### F10.6b - which native desktop and horizontal-tablet sizes must the visual target prove?

This decision must separate **layout coordinates** from **backing/render resolution**. Desktop captures can use
native pixels at device-pixel ratio 1. Tablet shell acceptance uses logical/CSS points plus safe-area insets, while
the 3D canvas and crisp pixel assets must also be checked at the device's backing scale. A 1024-point-wide tablet is
not a 1024-physical-pixel art target.

Current market evidence supports testing more than one comfortable hero frame. Valve's June 2026 Steam Hardware
Survey reports 1920×1080 as the primary display resolution for 51.12% of respondents and 2560×1440 for 21.44%.
Apple's current design references enumerate iPad point canvases including 1194×834, 1080×810, and 1024×768. These
sources do not choose Genesis's support floor, but they make a 1440p-only proof or one generic “tablet” capture
insufficient.

- **Option A - four-point proof matrix (recommended):** `2560×1440` desktop beauty/large-field target;
  `1920×1080` canonical desktop gameplay gate; `1194×834` logical-point landscape tablet representative; and
  `1024×768` logical-point hard layout floor. At the hard floor, chat/type/touch targets, exact board truth, object
  card, initiative navigation, and all actions remain usable; the EngagementLens may default collapsed and character
  drawers may reframe the board according to accepted laws. Test tablet backing scale separately.
- **Option B - modern-target three-point matrix:** `2560×1440`, `1920×1080`, and `1194×834`; do not promise the full
  shell at 1024×768. This reduces responsive work and gives the central board more room, but drops a real iPad-class
  logical size and leaves no smaller-layout adversarial gate.
- **Option C - two endpoints only:** `1920×1080` desktop and `1024×768` tablet. Cheapest corpus, but it never proves
  the higher-resolution beauty target Adam explicitly requested and provides no intermediate tablet diagnosis when
  the hard floor fails.

Option A is a capture/acceptance matrix, not a promise to render every device at identical effect quality. Semantic
invariants remain constant; P10.7/F10.7 may reduce shadow maps, post, particles, and other presentation costs at
lower performance tiers. Add optional 4K/ultrawide exploratory captures later, but do not make them replace the four
gates.

**Implementation/maintenance cost:** Option A is **medium-high responsive/capture QA** across safe rectangles,
rails, chat typography, cards/drawers, lens, initiative overflow, camera framing, touch targets, DPR sampling,
sprites, shadows, and scene complexity. Option B is medium; Option C is low-medium but under-tests the accepted
target.

**Codex recommendation: Option A.** It gives the high-resolution engine a real beauty target, protects the dominant
1080p desktop case, and makes “horizontal tablet” an executable promise with both a representative and adversarial
floor rather than a vague aspiration.

Does Adam accept Option A, amend one of the four sizes, or decline 1024×768 as a supported full-shell floor? After
F10.6b, proceed to F10.6c material/shadow truth and the remaining P10/G10 deep dives. Wave 10 remains **OPEN**; no
build is authorized.


<!-- END VERBATIM MIGRATION: original lines 16920-18387 -->
