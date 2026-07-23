---
type: research-input
status: RETAINED — descriptive claims verified by direct fetch 2026-07-22; applicability mappings are proposals, not rulings
created: 2026-07-22
source: theliquidfire.com tutorial corpus (Adam-supplied link), mined by Claude (Fable) via four parallel subagent read passes
authority: Research evidence only; not an accepted design ruling, dependency admission, implementation spec, or license approval
---

# Retention note

This file preserves Claude's 2026-07-22 mining of The Liquid Fire's Tactics RPG tutorial corpus (the classic
Unity FFT-clone series plus its Godot remake), distilled against current Genesis engine gaps. Adam's framing for
the pass: the visual/map bar is not the interest — Genesis already targets above this corpus — but "some of the
other mechanics might be useful to consider."

Boundaries this input does **not** move:

- **No closed Wave 10 decision is reopened.** Deterministic bonus-ordered faction-block initiative with tie-only
  d20s is closed; the FFT charge-time material below is contrast/reference for the deferred per-creature dial
  only. Facing-based evasion is described but explicitly **not** recommended for Genesis (5.5e has no facing).
- **No dependency or code admission.** The corpus is Unity C# / Godot GDScript authored by The Liquid Fire.
  Genesis adopts *patterns* only; all production code remains independently authored. Nothing here grants
  permission to copy tutorial code, assets, or text into the product.
- **Applicability mappings are proposals.** Descriptive claims about what each lesson contains were verified by
  fetching the lessons on 2026-07-22. The mappings onto Genesis items (C1D, monster tactics policy, victory
  conditions, terrain→cover) are Claude's inference and require the owning design wave's acceptance.
- The global implementation hold remains active. This file changes no code.

Genesis cross-references used throughout: `docs/COMBAT.md` (combat spec + open questions),
`docs/BATTLEMAP-TOWNTRAY-COMPOSITION.md` (the FFT-standard composition study; §3.4 missing layer, §3.5 C1D),
`docs/procedural-dungeon-direction/` Wave 10 records (initiative, receipts, EngagementLens, attention ladder),
`src/engine/place-spatialize.js` (cell/tier truth), `src/engine/combat.js` (resolver primitives).

---

# Source corpus

Author/site: **The Liquid Fire**, https://theliquidfire.com/projects/ — long-running free tutorial series that
build a Final Fantasy Tactics-style game from scratch. Two series matter:

## Unity Tactics RPG (2015–2016, 26 lessons, complete through AI)

1. Introduction — https://theliquidfire.com/2015/05/04/tactics-rpg-series-intro/
2. Project Setup — https://theliquidfire.com/2015/05/11/tactics-rpg-project-setup/
3. Board Generator — https://theliquidfire.com/2015/05/18/tactics-rpg-board-generator/
4. User Input Controller — https://theliquidfire.com/2015/05/24/user-input-controller/
5. State Machine — https://theliquidfire.com/2015/06/01/tactics-rpg-state-machine/
6. Path Finding — https://theliquidfire.com/2015/06/08/tactics-rpg-path-finding/
7. Anchored UI — https://theliquidfire.com/2015/06/22/tactics-rpg-anchored-ui/
8. Conversations — https://theliquidfire.com/2015/06/29/tactics-rpg-conversations/
9. Ability Menu — https://theliquidfire.com/2015/07/13/ability-menu/
10. Stats — https://theliquidfire.com/2015/07/27/tactics-rpg-stats/
11. Items and Equipment — https://theliquidfire.com/2015/08/03/tactics-rpg-items-and-equipment/
12. Jobs — https://theliquidfire.com/2015/08/10/tactics-rpg-jobs/
13. Stat Panel — https://theliquidfire.com/2015/08/17/tactics-rpg-stat-panel/
14. Ability Range — https://theliquidfire.com/2015/08/24/tactics-rpg-ability-range/
15. Ability Area Of Effect — https://theliquidfire.com/2015/08/31/tactics-rpg-ability-area-of-effect/
16. Turn Order — https://theliquidfire.com/2015/09/07/tactics-rpg-turn-order/
17. Status Effects — https://theliquidfire.com/2015/09/14/tactics-rpg-status-effects/
18. Hit Rate — https://theliquidfire.com/2015/09/21/tactics-rpg-hit-rate/
19. Ability Effects — https://theliquidfire.com/2015/10/12/tactics-rpg-ability-effects/
20. Magic — https://theliquidfire.com/2015/10/19/tactics-rpg-magic/
21. Unit Factory — https://theliquidfire.com/2015/11/02/tactics-rpg-unit-factory/
22. Victory Conditions — https://theliquidfire.com/2015/11/16/tactics-rpg-victory-conditions/
23. Intro To A.I. — https://theliquidfire.com/2015/11/30/tactics-rpg-intro-to-a-i/
24. A.I. Part 1 — https://theliquidfire.com/2015/12/07/tactics-rpg-a-i-part-1/
25. A.I. Part 2 — https://theliquidfire.com/2015/12/21/tactics-rpg-a-i-part-2/
26. Music — https://theliquidfire.com/2016/12/12/tactics-rpg-music/

## Godot Tactics RPG (2023–2026, 19 lessons, the author's lessons-learned remake)

1. Intro & Setup — https://theliquidfire.com/2023/11/09/godot-tactics-rpg-01-intro-setup/
2. Board Generator — https://theliquidfire.com/2023/12/07/godot-tactics-rpg-02-board-generator/
3. Input & Camera — https://theliquidfire.com/2024/02/19/godot-tactics-rpg-03-input-camera/
4. State Machine — https://theliquidfire.com/2024/03/19/godot-tactics-rpg-04-state-machine/
5. Pathfinding — https://theliquidfire.com/2024/04/11/godot-tactics-rpg-05-pathfinding/
6. Anchored UI — https://theliquidfire.com/2024/04/25/godot-tactics-rpg-06-anchored-ui/
7. Conversations — https://theliquidfire.com/2024/06/05/godot-tactics-rpg-07-conversations/
8. Ability Menu — https://theliquidfire.com/2024/08/08/godot-tactics-rpg-08-ability-menu/
9. Stats — https://theliquidfire.com/2024/10/10/godot-tactics-rpg-09-stats/
10. Items and Equipment — https://theliquidfire.com/2024/10/23/godot-tactics-rpg-10-items-and-equipment/
11. Jobs — https://theliquidfire.com/2025/01/06/godot-tactics-rpg-11-jobs/
12. Stat Panel — https://theliquidfire.com/2025/01/20/godot-tactics-rpg-12-stat-panel/
13. Ability Range — https://theliquidfire.com/2025/02/06/godot-tactics-rpg-13-ability-range/
14. Ability Area of Effect — https://theliquidfire.com/2025/03/17/godot-tactics-rpg-14-ability-area-of-effect/
15. Turn Order — https://theliquidfire.com/2025/03/27/godot-tactics-rpg-15-turn-order/
16. Status Effects — https://theliquidfire.com/2025/07/21/godot-tactics-rpg-16-status-effects/
17. Hit Rate — https://theliquidfire.com/2025/08/29/godot-tactics-rpg-17-hit-rate/
18. Ability Effects — https://theliquidfire.com/2025/11/29/godot-tactics-rpg-18-ability-effects/
19. Magic — https://theliquidfire.com/2026/07/02/godot-tactics-rpg-19-magic/

## Method and coverage

Four parallel subagent read passes on 2026-07-22: (1) board/movement — Unity 3, 6 + Godot 2, 3, 5; (2)
targeting/turn order — Unity 14, 15, 16 + Godot 13, 14, 15; (3) combat resolution — Unity 17, 18, 19, 20 +
Godot 17, 19; (4) AI/victory/stats — Unity 10, 21, 22, 23, 24, 25. **Not read:** the architecture/UI lessons
(state machine, anchored UI, conversations, menus, jobs, stat panel, items, music — low relevance; Genesis owns
its own equivalents) and Godot 16/18 (their Unity counterparts were read; the Godot deltas judged minor from the
series pattern). The remake is valuable specifically where it *diverges* from 2015 — those deltas are the
author's own debugging of his original design and are flagged below.

---

# Findings

## F1 — Negative finding: the corpus has nothing to teach Genesis about map quality

The tutorials' board generation (Unity 3 / Godot 2) is grow/shrink random-rectangle stacking over a sparse
`(x, z) → heightSteps` dictionary — accumulated noise mounds, hand-editable in an editor. This is precisely the
"noisy height map" failure mode `docs/BATTLEMAP-TOWNTRAY-COMPOSITION.md` §2 defines the FFT standard *against*
(elevation masses, route hierarchy, landmarks, shaped negative space, composed deployment). The corpus **validates
the TacticalCompositionPlan direction by omission**: nothing in 45 lessons composes a board; FFT-quality maps in
the genre are hand-authored. Genesis's composition-first C1H bet is the differentiator, not a solved problem being
reinvented.

Two structural nuggets survive the negative finding:

- **The entire mechanical board model is `(x, z, heightSteps)`** — the author's own binary save format is 3
  bytes/tile. Confirms the exact-cell `SpatialPlan` authority can stay tiny; everything else is derivation.
- **One step constant feeds everything.** Height as integer steps (step = ¼ tile width) drives terrain visuals,
  jump gating, cursor placement, and animation arcs from one number. One authority constant, many consumers —
  the same law Genesis already applies at the cell contract.

## F2 — C1D exact-cell battle spine: a worked reference implementation exists

`docs/BATTLEMAP-TOWNTRAY-COMPOSITION.md` §3.5: the live resolver still owns the legacy 12-zone band model;
exact-cell authority is accepted but unimplemented. The corpus's movement layer (Unity 6, Godot 5) is a complete,
engine-independent reference for what C1D needs:

- **One traversal engine, injected rules.** Movement range, ability range, AoE expansion, and AI position
  enumeration are all the *same* BFS flood fill with different edge predicates and different root cells. The
  `next.distance <= current+1` comparison doubles as the visited set; `prev` breadcrumbs give every reachable
  cell its own path at O(1) storage. Building this seam first makes targeting and AI predicate declarations,
  not new systems.
- **Reachability-first beats A\*** for tactics UX: the player chooses a destination *from* the reachable set, so
  one flood fill per selection is simultaneously the range highlight and the pathfinder. Dovetails with the
  closed Wave 10 receipt ruling that committed movement animates the exact path — the breadcrumb chain *is*
  that path.
- **The whole verticality grammar is one integer per edge:** `|Δheight| ≤ jump`, vertical steps cost no
  horizontal movement, jump orthogonal to move. `place-spatialize.js` already emits signed tiers per cell; the
  mechanical layer that makes a rendered riser mean something is this small.
- **Pass-over vs stop-on are distinct occupancy rules** (fliers cross occupied cells, can't end on them; walkers
  neither). 5.5e movement-through-creatures has the same shape — encode as two checks from the start.
- **Known bug class (2015 shipped it, 2024 remake fixed it):** terrain-ignoring movement is a *different query*
  (plain Manhattan sweep with `prev = start`), not a different BFS predicate — BFS wrongly shortens fly range
  across holes/obstacles the mover ignores. (Godot 5, "RangeSearch".)
- **Targeting search must drop walkability constraints entirely** — a fireball is aimed over the wall you can't
  walk through. (Godot 13, stated as a law.)

## F3 — Spell/ability targeting as declarative data (the "targeting trinity")

Unity 14/15 + Godot 13/14 converge on a three-axis decomposition that maps nearly one-to-one onto 5.5e spell
geometry: **Range** (shape + reach + min-range + vertical tolerance + direction-oriented flag) × **Area** (shape
expanded from the confirmed aim point, *not* the caster) × **EffectTarget** (validity predicates — living/dead/
faction — with multiple targeters per ability: Cure heals living AND burns undead with zero branching). Every
shape reduces to either BFS-with-predicate or a `pos + dir·i + perpendicular·j` loop — portable to any grid
engine with a cell lookup.

Details worth carrying into the exact-cell targeting spec:

- **Vertical tolerance is measured from the caster for range, from the aimed cell for area, and lerped along the
  beam for lines** (Godot 14's height-ramped line area). Cheap, complete height rules.
- **Shape parameters grow — declare records with room.** Everything the 2015 comment section bolted on (min
  range for archer donuts, beam width, cone offset) became first-class exported data in the 2025 remake.
- **Effects target cells, not units** (Unity 19's `Predict(Tile)`/`Apply(Tile)`). This decision paid off years
  later as free terrain deformation (Godot 19's Earthquake lowers cell heights through the same effect pipeline)
  and clean forced movement (Knockback resolves a destination cell; fall damage = height drop × rate). 5.5e
  shove/thunderwave and the accepted attention-ladder "changed/historical" board state both want cell-centric
  effects. The author *flags* the hard edge cases rather than solving them — push off map edge, landing-cell
  contention at a cliff base, falls into holes — a ready-made adversarial checklist for the Genesis version.
- **Aim/confirm is a two-state input grammar** matching the range/area split (aim within range → confirm shows
  the area footprint → resolve). Consistent with the closed click-only smart-card and preview rulings.

## F4 — Monster tactics: a deterministic, LLM-free answer to the open COMBAT.md question

`docs/COMBAT.md` open question: *"Monster AI tactics policy (Fable) — when/if the script drives foe turn
decisions instead of the DM."* Unity 23/24/25 is a complete worked answer to the tactical half, aligned with
three standing Genesis doctrines at once (SPEED — no model call in mechanical loops; the ≤15s DM-turn latency
law; anti-drift mechanization — "can the script own this?"):

- **The stack:** (a) a designer-authored ability rotation — which ability + which target *type*, FF1/FFXII-gambit
  style, shipped as *content data* on the unit recipe (Unity 21 adds `strategy` as just another recipe field);
  (b) a brute-force spatial evaluator — enumerate move-position × fire-location (dedup fire locations whose AoE
  footprint is position-independent), score = desired-targets-hit − undesired-targets-hit, tie-break by a
  secondary quality score, pick among final ties; (c) a nearest-foe fallback — when nothing is worth casting,
  walk the pathfinding breadcrumb chain toward the closest enemy as far as movement allows, so **no turn is ever
  wasted**; (d) end-of-turn defensive orientation. MiniMax/MCTS are explicitly rejected on branching-factor and
  scoring-validity grounds (~2,500 options per turn before lookahead).
- **`PlanOfAttack` is a serializable turn-intent object** (ability, target type, move cell, fire cell) computed
  once, then *replayed through the same state machine the human player uses*. This is the shape of a DM-bridge
  event. The natural Genesis split: **the engine computes and scores candidate plans; the DM seat approves,
  flavors, or overrides** — script proposes tactics, DM owns intent. Routine foe turns stop costing a frontier
  round-trip; monster tactical competence stops being invention-prone.
- **Design stances that fit hard-and-dangerous:** the author argues *exploitable AI is a feature* — players
  learning and denying a legible rotation (siphon the caster's mana, watch it waste a turn) is the mastery loop —
  and difficulty scales through stats/unit count, not algorithmic depth.
- **Caveats mapping to existing Genesis scar tissue:** the tutorial's tie-breaks are unseeded randomness
  (collides with the 2026-07-19 seeded-RNG CI lesson — seed them); the planner never checks resource costs
  before committing (gate plans on slots/recharge/uses); all plan evaluation is simulate-and-restore (any
  evaluator that mutates board state must restore it or the game desyncs — same integrity class as the receipt
  discipline). Also: control ownership as swappable per-unit data (`Driver`: human/computer/status-override) is
  the pre-laid hook for charm/frighten/command-style takeovers.

## F5 — Combat-resolution patterns: steal four, skip one

- **SKIP facing.** Front/side/back evasion (Unity 18, Godot 17) is FFT's signature, but 5.5e has no facing;
  grafting it on deviates from SRD math and reopens closed ground. The transferable *framing*: facing is a
  modifier channel on the defender's avoidance — structurally the slot Genesis's cover bonus (+2/+5 AC in
  `resolveAttack`) already occupies. The terrain→cover auto-objectification fast-follow is the Genesis version
  of that channel.
- **Check ordering is itself a design decision.** The tutorial's physical hit type checks auto-hit before
  auto-miss; its status type checks the reverse — so *immunity beats guaranteed-hit* for statuses. 5.5e has the
  identical question (nat-20 vs condition immunity: immunity wins). Make the ordering explicit and commented in
  the resolution pipeline, never emergent.
- **Status = one effect + N condition locks** (Unity 17). An effect persists while *any* lock holds; each source
  removes only its own lock; self-removing locks (a condition deletes itself when its predicate fails) avoid
  dead-reference cleanup chains. Maps cleanly onto 5.5e: "poisoned until save ends" and "poisoned while the
  cursed ring is equipped" are two lock types on one condition; save-ends is a lock whose tick is a saving
  throw instead of a countdown.
- **One modifier seam with explicit ordering.** Every stat write flows through an interceptable event; modifiers
  carry sort order; clamps apply last; Haste must multiply the *delta*, not the total (an actual shipped
  tutorial bug). The Godot remake's worst bug — 8× damage from modifier listeners scoped to the unit instead of
  the ability instance (Godot 19) — is the HQ2-1 per-handler-coercion bug shape wearing a different hat. Genesis
  law already covers this at `dmFoldPayload`; the same single-seam discipline should govern combat modifier
  stacking when exact-cell combat lands.
- **Victory conditions as typed pluggable observers** (Unity 22). Per-encounter objective objects (defeat-all,
  defeat-target, survive-N, escort) attached from encounter data, watching HP/status events, setting a Victor
  the flow reads. Mechanizes "is this combat over" while the DM keeps morale/flee/parley *meaning* — an
  anti-drift candidate consistent with the receipts architecture. Related: KO modeled as reversible status,
  never entity deletion — matching Genesis's event-sourced state and death/bardo systems. Documented hole to
  check in the Genesis combat lifecycle: a unit killed mid-own-turn silently finishes its turn unless something
  cancels it.

## F6 — Quiet validations (no action; recorded as convergence evidence)

- **Camera:** the tutorial recipe (orthographic, 45° yaw, ~35° pitch, never straight down, zoom = ortho size not
  dolly, lerp-follow the cursor; Godot 3) is nearly identical to the accepted Genesis production family
  (45° dimetric yaw / 35° elevation / gentle 20° FOV with mandatory orthographic fallback). Independent
  convergence on the same reading angle.
- **Turn order:** the FFT charge-time scheduler (Unity 16, Godot 15) is ~40 lines and four constants
  (threshold 1000; costs 500 base / +300 move / +200 act; speed accrues per tick; wait acts sooner). Genesis
  initiative is **closed** (deterministic faction blocks, tie-only d20s) and nothing here argues to reopen it —
  but the deferred per-creature "Fable upgrade" dial is mechanically that cheap, and the initiative ribbon was
  already ruled a projection adapter that could absorb per-creature ordering without UI rework. Known CT
  gotchas if ever needed: cold-start dead rounds (normalize starting counters), actor-dies-mid-turn hangs, and
  "complete in X turns" objectives stop being a free primitive under CT.
- **Input feel:** discrete grid-cursor stepping rate-limited by a repeater (~250ms; ideally
  long-first-delay-then-short-repeat) is a named feel parameter, relevant if a keyboard/gamepad grid cursor
  ever joins the click-first UI.

## F7 — Recurring pitfall families (cross-cutting adversarial checklist)

1. **Simulate-and-restore integrity** — plan evaluation, angle scoring, and range probing all temporarily move
   actors; forgetting to restore position *and* orientation desyncs truth from visuals.
2. **Unseeded tie-breaking randomness** — variety insurance in the tutorials; a determinism/CI violation in
   Genesis. Seed every tie-break.
3. **Modifier ordering and scoping** — sort explicitly, scope listeners to the owning instance, clamp last,
   delta-vs-total decided per modifier. (The 8×-damage scoping bug; the Haste delta bug.)
4. **Preview/apply divergence at clamp edges** — deterministic forecast + variance-on-apply is the right split,
   but clamps applied independently in both paths can make the shown number unreachable.
5. **Resource gating in planners** — never let an AI (or a DM-proposed plan) commit an action it cannot pay for.
6. **Mid-turn death** — a turn's owner dying during its own turn needs an explicit cancellation path.
7. **Stale derived bounds** — board min/max maintained only at load silently breaks range shapes after dynamic
   edits (relevant once Earthquake-class terrain mutation exists).
8. **Metric mismatch** — targeting range and movement range should share a distance metric, or chase dynamics
   degenerate (stated re: Euclidean targeting over Manhattan movement).

---

# What this input does not establish

- Any Genesis-specific taste, UI, camera, or art ruling (those require Genesis evidence per the standing law).
- Any argument for FFT hit-percent math, facing, charge-time initiative, or job systems in Genesis v1 — the
  5.5e SRD chassis and the closed Wave 10 rulings stand.
- Any license/provenance basis for using tutorial code or assets. Concepts were studied; no code was copied.
- Quality claims about the tutorials' own game — the corpus is a *patterns* source, demonstrably not a
  *composition* source (F1).

# Suggested reading order for the corpus

For the C1D/exact-cell lane: Unity 6 → Godot 5 → Godot 13 → Godot 14 → Unity 15. For the monster-tactics
question: Unity 23 → 24 → 25 → 21. For resolution/status patterns: Unity 17 → 19 → 20 → Godot 19 (the
sender-scoping bug). The 2015↔remake deltas are the highest-signal content wherever both exist.

---

# Genesis applicability audit (Codex, 2026-07-22)

This audit was added after Adam asked whether the retained tutorial mining should affect, aid, or warn future
Genesis visual-engine work. It preserves all earlier research text and dispositions the proposals without turning
them into accepted design, dependency, or implementation authority.

## Protected inheritances

Nothing in this corpus replaces or reopens the following Genesis decisions:

- the walk/cards/state remain canonical and the renderer remains a projection;
- C1H's composition-first `TacticalCompositionPlan` remains the answer to deliberate battlefield structure;
- one fixed production camera family remains accepted; the tutorial camera is convergence evidence only;
- Genesis's current five-foot cells, one-foot tier provenance, typed connectors, D&D mechanics, and later
  `BodyForm`/capacity owners outrank the tutorial's quarter-tile height constant and movement-cost assumptions;
- the existing custom-table/behavior/state-machine tactics ladder, binding morale, bounded trash autoplay, and
  provider-neutral DM-seat authority remain intact;
- deterministic faction-block initiative remains closed; FFT charge time and facing remain rejected for v1;
- Wave 8 retains terrain/structure mutation authority; cell-centric effect examples do not authorize mutation;
- no tutorial code, assets, layouts, text, dependency, or license inference enters production.

## Adopt / amend / reject / defer dispositions

| Finding | Disposition | Genesis use |
| --- | --- | --- |
| F1 map generation | **REJECT as generator; RETAIN as negative evidence** | Random rectangle/height noise does not compose a Genesis battlefield. It strengthens rather than replaces C1H. |
| F2 compact cell/height spine | **ADOPT principle; AMEND mechanics** | Keep one canonical spatial/height owner and shared query boundary. Do not copy the tutorial's height quantum, free vertical movement, or claim one unweighted BFS can own every mobility mode. |
| F2 shared traversal queries | **ADOPT seam; AMEND algorithm claim** | Movement, path previews, targeting, AI enumeration, and diagnostics should consume the same versioned cells/surfaces/connectors and injected rules. Uniform-cost movement may use BFS; difficult terrain, squeezing, typed connectors, large footprints, and other variable costs require an appropriate bounded cost search. Flight, teleportation, lines, cones, and targeting remain distinct query modes. |
| F2 pass-over versus stop-on | **ADOPT** | Represent transit legality separately from destination occupancy from the first exact-cell proof. Wave 6 supplies body/occupancy/capacity detail. |
| F3 range × area × effect target | **ADOPT with D&D amendment** | Use declarative targeting data to drive mechanics, truthful previews, EngagementLens staging, camera anchors, and VFX. A spatial anchor may yield affected cells/volumes, then eligible creature/object/terrain targets; Genesis does not reduce every D&D effect to a cell-only target. |
| F3 cell-centric effects | **DEFER mutation breadth** | Forced movement and area anchors aid C1E. Terrain deformation remains Wave 8-owned and must invalidate derived spatial products through versioned receipts. |
| F4 `PlanOfAttack` evaluator | **DEFER as bounded extension** | Genesis already has advisory tactics, binding morale, and trash autoplay. A future exact-cell candidate scorer may emit a serializable advisory plan beneath that authority; it may not replace custom tables/behavior, guarantee that every foe advances on the nearest target, leak hidden intent, or make the visual engine the tactics owner. |
| F5 status/modifier/victory patterns | **ADOPT as mechanics warnings; project visually** | Canonical condition/effect lifecycles and typed objective state may drive VFX, objective anchors, and lens beats. Renderer-local timers/listeners may not own condition duration, modifier order, victory, KO, or death. Facing remains rejected. |
| F6 camera/input observations | **RETAIN as convergence evidence** | No camera ruling changes. Cursor repeat timing is a later input/accessibility feel parameter requiring Genesis device evidence. |
| F7 pitfall checklist | **ADOPT as candidate negative controls** | Use it to harden C1D/C1E preview, commit, targeting, AI-plan, cache, and cancellation gates without broadening the first proof. |

## Candidate implementation boundary

The transferable architecture is a pure, versioned query boundary rather than tutorial code or a renderer-owned
pathfinder:

```text
canonical SpatialPlan/connection/body/occupancy state
  -> pure spatial query with explicit mobility/targeting predicates
  -> immutable preview or committed receipt
  -> overlays / path animation / ShotPlan / EngagementLens / DM-seat facts
```

The renderer may display reachable cells, a ghost path, an area footprint, cover/height relations, and committed
movement. It may not decide legality, mutate a temporary actor to discover an answer, reveal an enemy's uncommitted
intent, or substitute presentation physics for canonical mechanics.

## Candidate negative controls routed to later gates

The following are retained as specification inputs, not yet accepted implementation obligations:

1. pass-through legality and destination legality disagree only through an explicit rule;
2. a legal ranged/area target is not rejected merely because its cells are not walkable;
3. terrain-ignoring movement does not lose or gain range because an ordinary ground route detours;
4. preview and commit use the same cells, costs, connectors, target footprint, and destination;
5. preview queries do not mutate position, orientation, form, occupancy, resources, conditions, caches, or visuals;
6. all tie-breaking is seeded and replayable;
7. resource-ineligible actions never become commit-ready plans;
8. incapacitation or death during an owned sequence has an explicit cancellation path;
9. structural mutation invalidates derived bounds, reachability, cover, visibility, range, and renderer caches;
10. preview/apply remain congruent across clamps, immunity, resistance, and ordered modifiers;
11. movement and targeting metrics differ only through an explicit rule; and
12. every player-facing spatial overlay has a viewpoint-legal text/nonvisual equivalent and survives governed
    production-camera occlusion handling.

## Phasing and promotion routing

- **C1D:** prospective owner for the minimal pure exact-cell query, path preview/commit receipt, transit-versus-stop
  distinction, seeded determinism, and renderer/EngagementLens projection in one retained duel.
- **C1E:** prospective owner for one representative declarative range/area/eligible-target case and preview/apply
  congruence over the C1D seam.
- **C1H:** unchanged. It composes the battlefield that C1D mechanics and projections consume; the tutorial supplies
  no substitute composition algorithm.
- **Wave 6:** P6.1 `BodyForm`, P6.2 capacity/occupancy, P6.3 constrained movement, P6.8 form swaps, and P6.10 access
  tells become required query inputs or projections if their Option B paths are accepted. This research changes no
  current P6.1-P6.10 option or recommendation.
- **Waves 7-8:** detailed tactical affordances/AI-plan breadth and environment mutation remain with their future
  owners. This audit does not pre-answer them.
- **Feature-Promotion Ledger:** no row changes yet. Research evidence alone creates no accepted MVP obligation;
  accepted Wave 6 dispositions and later C1D/C1E specifications must reconcile the routed candidates.

All material implications generated by this research interruption now have an adopt, amend, reject, or defer route.
No unresolved research question blocks re-presenting P6.1-P6.10, and Wave 6 remains open until Adam answers and
explicitly closes it.
