---
type: architecture
project: Genesis
status: living index — regenerated from a systems survey 2026-07-05; keep current as systems land
updated: 2026-07-05
---

# Genesis — Architecture (the map of the machine)

*The one page that orients you to the whole system. Read this to hold Genesis in your head; the
linked specs hold the depth. This is the source the in-game **Wiki** (docs/REFERENCE-SHELF.md)
compiles from (`build/gen-wiki.py` → `data/wiki.js`) — so keep it true; edit here, recompile.*

**Not** a decision log (that's `DESIGN.md`) and **not** a status snapshot (that's `HANDOFF.md`).
This is the standing map: every system, what it is, how it works, where it lives.

## The two spines & the through-line

- **`manifest.json`** is the *code* spine — every module's id / path / owned globals / load order.
  `build/check-manifest.py` keeps the classic-`<script>` (shared-global, non-ES-module) codebase
  from drifting.
- **`DESIGN.md`** is the *decision* spine — why things are the way they are.
- **The doctrine that explains almost every seam below:** the **engine rolls atoms**
  (deterministic dice/state — the script owns every number) and the **AI DM assigns meaning**
  (interpretation/prose only). Paired with **edit-source → compile-artifact** (hand-authored
  markdown/JSON compiles to generated `data/*.js`; never hand-edit the artifacts) and
  **text-first-forever / blind-playable** (a prose-only Genesis must always run; visuals are an
  optional lens). When a module feels oddly split (pure engine here, mutation there), it's almost
  always these three laws holding the line.

---

## Engine layer (deterministic — rolls atoms, never narrates)

Pure, deterministic modules under `src/engine/`. They operate on what they're passed, own the
numbers, and never invent meaning or (mostly) touch persistent world state.

### Table-Roll Primitives & Fragment Oracle (Track A)
**What it is.** The core dice/roll primitives over the inline world/setting tables.
**How it works.** `data/world-tables.js` holds `T` (tables) and `FRAG` (the player-facing Fragment
oracle veil, row-aligned to `T`); `src/engine/tables.js` supplies `rollTbl` (flat/bell rolls),
`fragAt` (veil lookup), `ebRoll` (opening-bundle roll), and `concretize` (resolves an uncanny
multi-step roll-chain). The engine-rolls-atoms half — the AI turns the returned fragments into prose.
**Lives in:** `src/engine/tables.js`, `data/world-tables.js`. **Spec:** —

### Compiled-Tables Dice Engine (Track B)
**What it is.** The runtime that rolls against the big *generated* table corpus.
**How it works.** `compile-tables.py` compiles the Engine markdown into `tables.js` (a global
`GENESIS_TABLES` with dice type, bell flag, veil flag, row ranges/text); `src/engine/compiled.js`
reads it into `CT`, exposing `rollExpr` (parse dice-strings) and `rollTable(id)` (range-based row
lookup). Distinct from Track A, which rolls the smaller inline tables.
**Lives in:** `src/engine/compiled.js`, `tables.js`. **Spec:** docs/TABLE-EDIT-SAFETY.md

### World Genesis — Factions, Pressures, Starting State & Entry
**What it is.** The roll-chain that gives a fresh world a standing situation.
**How it works.** `src/engine/world-gen.js` chains the primitives into `rollFaction`/`rollPressure`
(Dungeon-World-Fronts-style "danger with momentum"), `rollStartingState`, and the Entry bridge
(`rollEntry`/`pickTension`/faction proximity); `ssFactionTurn` advances factions turn-over-turn.
Borrows the *structure* (not content) of DW Fronts + SWN factions; all writes land in the ledger,
and the DM only narrates what's already rolled.
**Lives in:** `src/engine/world-gen.js`, `data/creation-flow.js`. **Spec:** docs/STARTING-STATE-MODELS.md

### Hex Substrate (Lazy Geometry)
**What it is.** An unbounded, never-stored hex terrain plane under the node map.
**How it works.** `src/engine/hexmap.js` hashes `(seed,q,r)` → biome deterministically with no
storage (chunkgen-style, never enters AI context); axial math converts world↔hex, and
`setNodeXY`/`placeTravelNode` pin narrative nodes with write-once route/bearing canon winning over
raw distance. The SVG paint (`renderHexMap`) lives in the render layer, kept separate.
**Lives in:** `src/engine/hexmap.js`. **Spec:** docs/SPATIAL-MODEL.md

### Node-Graph Cognition & Travel
**What it is.** The tiny symbolic map the AI actually reasons in — places as nodes, travelled routes
as edges.
**How it works.** Two layers stay deliberately separate: the node-graph is what the AI holds ("the
horde is at the Salt-Garrison, ~5 days NE"); the hex substrate never enters context. `src/world/
play.js` builds the graph (`addNode`/`addEdge`/`rollRoute`) and turns a route's crossed hexes into a
deterministic wilderness-encounter series the AI only narrates.
**Lives in:** `src/world/play.js`. **Spec:** docs/SPATIAL-MODEL.md

### Regions & Name Cultures
**What it is.** A coarse land-region layer giving every area a rolled identity that biases what
spawns there.
**How it works.** `src/engine/region.js` hashes region centers and rolls a write-once identity (name,
character, flavor vector: archetype/skin bias, cultures, econ/spice tilt); that vector then biases
walk generation, shop economy, and NPC naming. `frayLevel`/`fraySpiceFloor` raise the spice floor
(Grounded→Mythic) with distance from the lived-in center.
**Lives in:** `src/engine/region.js`. **Spec:** docs/REGIONS-NAMES.md

### Combat Resolver
**What it is.** The theater-of-the-mind 5.5e combat math — resolution, initiative, attacks, saves,
damage, bands.
**How it works.** `combat.js` is pure/deterministic on the combat objects it's passed (never touches
`w`/`U`/codex): `resolveCreature` → BESTIARY stat block (CR-band fallback if unknown), side-based
initiative, and attacks that accept a pre-rolled player d20 (dice transparency) while the engine
rolls monsters' dice. `combatFromEncounter` is the walk→combat seam; `combatOutcomeEvents` derives
the EVENT-CONTRACT payloads that `world/dm.js` prices and emits.
**Lives in:** `src/engine/combat.js`. **Spec:** docs/COMBAT.md

### Combat Actions (Action Economy)
**What it is.** The martial action-economy layer — action/bonus/reaction budgets, Extra Attack,
opportunity attacks, grapple/shove.
**How it works.** `resetTurnBudget`/`spendBudget` track a per-turn budget and refuse double-spends;
`attacksPerAction` derives Extra Attack from `CLASS_PROGRESSION`; `opportunityAttack` fires on an
undefended departure; `resolveGrapple`/`resolveShove` implement the SRD contested check. Pure on the
passed combatants, mirroring `combat.js`.
**Lives in:** `src/engine/combat-actions.js`. **Spec:** docs/SRD-MECHANIZATION.md

### Monster Tactics & Morale
**What it is.** How foes decide to act — a scripted tactic ladder plus a binding morale check.
**How it works.** `proposeTactic` runs an anti-drift ladder (creature's own custom d10 table → the
walk-rolled Behavior hook → a generic state machine) as an advisory proposal; morale is binding —
`moraleTrigger` detects once-per-fight conditions and the engine rolls an open WIS save, a failure
rolling a flee/surrender/rout disposition. Low-CR trash can autoplay a full turn when the DM allows.
**Lives in:** `src/engine/monster-tactics.js`. **Spec:** docs/MONSTER-TACTICS.md

### Advancement (XP Economy & Leveling)
**What it is.** The XP pricing and leveling spine, capped at the Tier-2 ceiling (L10).
**How it works.** `awardXp` prices XP off resolved-tension events (CR-based, with a per-session decay
guard against farming); `levelForXp` clamps to `LEVEL_CEILING=10`; `applyLevelUp` re-derives HP/PB/
spell slots/resources from `CLASS_PROGRESSION` on a rest. Interpretive picks (spells/ASI/subclass)
are left to the DM or the level-up picker.
**Lives in:** `src/engine/advancement.js`. **Spec:** docs/ADVANCEMENT.md

### Social Resolver (Attitude / Parley)
**What it is.** The social analog of the combat resolver — a check becomes an attitude-ladder shift.
**How it works.** Pure functions returning a delta: `socialDC` maps current attitude → the DC to
warm one step (Hostile 25 → Friendly 10, Helpful terminal); `applyLeverage` folds Want/Fear/Leverage/
Trust (±5) and can flag a decisive auto-shift; `resolveSocialCheck` resolves one step (caught lie −2,
near-miss −1, intimidation overshoot → Terrified). The event layer commits via `codexSetAttitude`.
**Lives in:** `src/engine/social.js`. **Spec:** docs/SOCIAL.md

### Walk Generators (Urban / Dungeon / Wilderness)
**What it is.** The three procedural crawl generators that build a session's traversable map.
**How it works.** Each roller ports an Obsidian Templater procedure (Urban v3.1, Dungeon v4.2, an
authored wilderness set) into pure data: pick a topology (pacing grammar), build a node/edge graph,
roll each node's sub-table/encounter/scene from the compiled tables, and layer on a shared loot lane
(`dwalkLoot`, defined once and reused), a walk-skin, macguffin chances, and a per-node interactable.
**Lives in:** `src/engine/walk.js`, `dungeon-walk.js`, `wild-walk.js`. **Spec:** docs/SESSION-PREP.md

### Walk Archetypes (Creature Roster Resolution)
**What it is.** The registry mapping a walk's rolled archetype label to an actual bestiary creature.
**How it works.** `WALK_ARCHETYPES` maps each archetype string to bestiary tag filters + a CR band;
`resolveArchetypePool` unions that filtered pool with the table-authored A/B/C pool (authored kept at
a ~35% floor so hand-tuned flavor survives) and returns one name. This is also how Adam's custom
creatures enter rotation by CR. (The shared `bestiaryResolve`/slug-index lives in `combat.js`.)
**Lives in:** `src/engine/walk-archetypes.js`. **Spec:** —

### Quest Hook Roller
**What it is.** Generates the raw narrative hook (destination, macguffin, complication, urgency,
pitch) bound to a prepped environment.
**How it works.** `rollQuestHook({environment})` is pure table generation producing raw hook material
without assigning a questgiver identity — that binding is deliberately left to the AI synthesis pass;
`qhookMaybeParleyAngle` adds social framing where relevant.
**Lives in:** `src/engine/quest-hook.js`. **Spec:** docs/SYNTHESIS-CONTRACT.md

### Prep Bundle Assembler
**What it is.** The deterministic pre-step that fires all the walk rollers + hooks and gathers world
context into one bundle for AI synthesis.
**How it works.** `assemblePrepBundle` calls the walk rollers + `rollQuestHook` per requested
environment and pulls NPC/place/item rolls + ledger context — entirely dice-and-lookup, no LLM call;
`prepBundleSummary` gives the cheap Stage-1 view for a lighter first pass.
**Lives in:** `src/engine/prep-bundle.js`. **Spec:** docs/SYNTHESIS-CONTRACT.md

### NPC Generation & Coherence
**What it is.** The on-demand generator for NPCs (plus child/animal partials), and the coherence dial
that keeps a town legible — most people are clean archetypes; the full-atom weirdo is rare, so it lands.
**How it works.** `rollNPC(opts)` rolls the atom stack, then a **coherence tier** (archetype/wrinkled/
layered/tangled, picked by `pickCoherence` off the region-temperature curve) suppresses identity/lever
atoms to null at low tiers — `want`/`role`/`name`/`race` always fire, and the hook is never gated (it
lives on the scene, not the person). The **role** is realm-aware: `roleForRealm(realmId)` weighted-picks
a spine archetype and labels it from that realm's skin (`data/npc-role-skins.js`, generated by
`build/gen-role-skins.py` from the 11 `NPC Role Skin` tables + the 35-archetype `NPC Role Spine`), with
a breach-leak hybridization seam. `rollPartial(kind)` mints reduced-stack children/animals (a kid
carries a witness hook, an animal a tell). **Presence & hooks** (ambient population + hook discovery +
the three-tier if-ignored attention model) is built but PARKED on `feat/npc-presence-hooks` pending a
playtest.
**Lives in:** `src/engine/codex-roll.js`, `data/npc-role-skins.js`. **Spec:** docs/NPC-COHERENCE-DIAL.md

### Place Generation (realm-skinned, GRID-LAW)
**What it is.** The place mint — every rolled place is realm-true from birth: typed, dimensioned in
real 5-ft cells, cast, and dressed, mirroring the NPC role-skin architecture exactly (one universal
spine, per-realm skins).
**How it works.** `rollPlace(opts)` draws a site archetype via `placeForRealm(realmId)` (24-row
`Place Spine` × realm skins with relabel/drop/add/reweight; `data/place-skins.js`, generated by
`build/gen-place-skins.py`), emits `rolled.dims` in 5-ft cells from the archetype's space band
(`PLACE_SPACE_CELLS` — GRID LAW: the diorama floor divides into 5×5-ft cells), stamps
`dm.itemsPool`/`dm.dressing` pointers, and staffs via the castProfile (`roleForRealm` filtered-pool,
never-dangle). `sceneDressingForPlace` resolves per-archetype props/surface/light against the realm
pools (never-a-hole). Breach leak shares the NPC `ROLE_HYBRID_K` (minority cross-skin mints near a
leaky breach). Fights at a typed place derive their zone grid from the known cells
(`cmGridFromCells`: 1 band = 5 cells deep, 1 lane = 4 wide); the DM digest's location line and the
tray read the same record — prose and table can never disagree. Settlements stay compositional
(districts + skinned site draws; origin settlements carry realm pointers only).
**Lives in:** `src/engine/codex-roll.js`, `data/place-skins.js`, `build/gen-place-skins.py`.
**Spec:** docs/PLACE-GEN.md

### Tarot / Session-Draw Engine
**What it is.** The Session Draw mutator — a tarot pull that flavors a session's rolled environments.
**How it works.** `data/tarot.js` authors only the omen lines + major-arcana directives; `src/engine/
tarot.js` derives each minor card's domain weight/intensity/valence at draw time from suit/rank/
reversal, keeping the authored surface small.
**Lives in:** `src/engine/tarot.js`, `data/tarot.js`. **Spec:** docs/TAROT-SESSION.md

### Economy Engine (Pricing / Stock / Transactions)
**What it is.** The buy/sell spine — prices, shop stock, and transactions off the economy data.
**How it works.** `src/engine/economy.js` + `src/world/shop.js` compute prices (rarity-derived), stock
(gated by settlement tier, not PC level), and transactions, emitting `item_changed` events; it never
invents a parallel pricing system. Money is the priority currency (the hub buying partial access to
others).
**Lives in:** `src/engine/economy.js`, `src/world/shop.js`. **Spec:** docs/ITEMS.md

---

### Scene-Risk Contract
**What it is.** The fairness contract — WHY a scene is dangerous, what telegraphed it, which exits are real.
**How it works.** `sceneRiskOf` stamps every rolled walk (urban/dungeon/wild tails) with
`{dangerBand, rewardBand, telegraph, escapeModes, pressureClock, deathStakes, promisedReward,
persistentTrace}` from tier/skin/enemy-share arithmetic; `sceneRiskValidate` REDs a deadly-band
scene with no telegraph or no escape (a one-shot unwarned trap is a bug, not difficulty);
`sceneRiskDigest` rides `activeWalkDigest.risk` so the DM narrates the warning the player earned.
**Lives in:** `src/engine/scene-risk.js`. **Spec:** docs/SCENE-RISK-CONTRACT.md

### Spice Band Layer (the spicy world)
**What it is.** The adopted 2026-07-06 distribution stance as a roll-time layer — no authored row changed.
**How it works.** `SPICE_WEIGHTS` per region tier (baseline 25/25/25/17/8 → rim 0/5/25/45/25);
`spiceTierAt`/`spiceTierForNode` resolve a node's tier; `spiceBandPick` picks the band FIRST, then
`rollTableAtBand`/`rollTableSpiced` (compiled.js) roll a row within it. Walk rollers stamp
`walk.spiceTier`, the digest carries it, and DM-CHARTER §8.5c sizes the connective-weirdness
license by it. Replaces the retired `fraySpiceFloor`.
**Lives in:** `src/engine/region.js`, `src/engine/compiled.js` (band rollers). **Spec:** docs/SPICE-RAISE.md

### Crowning Eligibility (the ending, engine half)
**What it is.** The detected gate on the ending — never declared.
**How it works.** `rollStartingState` flags the external front `isDoom`; `doomFront(w)` finds it;
`crownEligible(w)` is pure detection (Doom-front closed + level ceiling + not sundered + not
crowned). The doom clock FIRING sets `w.sundered` (the dark twin — a cautionary legend,
uncrownable forever). The banner affordance renders from state; the ritual lives in the world layer.
**Lives in:** `src/engine/crowning.js`. **Spec:** docs/CROWNING-BASTION.md

### Dungeon Graph — spatializer + semantics [2026-07-10]
**What it is.** Turns a rolled walk's segment graph (segments=rooms, exits=edges, any of the 12
topologies) into a verified 5-ft cell-grid floor plan (SpatialPlan), then layers meaning on it.
**How it works.** `spatializePlan(segments, topology, {walkId})` — per-topology layout seed →
room placement → AABB separation → corridors along real edges only → rasterize → BFS
reachability verify (reroll ≤5, then honest-fail); deterministic per walkId.
`semanticizePlan(plan, segments, residents)` — room roles (entrance/finale/path/pocket/side),
depth=difficulty bands, SCALE DOMAINS (a big resident's territory builds at its scale;
prison-rule regrowth; transition/squeeze doors). Consumed by prep (`pn.spatial`), the theater
interior renderer (volumetric prism InstancedMesh tile kits), and combat cell dims (dm.js).
**Lives in:** `src/engine/place-{spatialize,semantics}.js`, `src/ui/theater-interior.js`. **Spec:** docs/DUNGEON-GRAPH.md

## World layer (persistent state, flow, and the event surface)

Modules under `src/world/` own the saved universe `U` and mutate it only through their accessors.

### World Spine (State, Clock, Ledger, Map)
**What it is.** The persistence + bookkeeping backbone — the save-file, clock, append-only ledger,
and node map.
**How it works.** `loadU`/`saveU` serialize the universe to localStorage with additive migration; the
mutable global `U` is app-owned while transient session state lives in `GS`. `addLedger` is the
append-only event log other systems write growth/drift signals into; the map tracks seen nodes with
fog-of-war exposed to render.
**Lives in:** `src/world/state.js`. **Spec:** docs/FOREVER-STORAGE.md

### World Flow / Exploration Loop
**What it is.** The world lifecycle — genesis ritual, session start, explore/passTime, spawn, destroy.
**How it works.** `startGenesis`/`bindWorld` run the creation ritual (and cast the starting town's
ambient pool); `beginSession` draws one tarot before prep; `explore`/`enterWorld` drive the walk loop.
`passTime` is the rest gate — it rolls rest-risk before recovery, claims any pending level-up, and
runs companion/pet upkeep.
**Lives in:** `src/world/play.js`. **Spec:** —

### Codex (Relational Entity Memory)
**What it is.** The world's living wiki-linked memory of NPCs / Locations / Items / Factions —
all-knowing, and (until touched) all-shiftable.
**How it works.** Each record carries `rolled` (the immutable soul), `fields` (player-safe), `dm`
(secrets), typed `links[]`, and `status`. Records are SOFT (recontextualizable to a new role,
preserving the rolled soul) until the player makes contact, then locked HARD to canon forever. Writes
flow only through `codex_*` events from `applyEvent`; `codexPlayerView` projects a knowledge-gated
slice.
**Lives in:** `src/world/codex.js`. **Spec:** docs/CODEX.md

### Companions (Hirelings + Sidekick)
**What it is.** Hired help — disposable wage-earning hirelings, one leveling sidekick, and befriended
pets.
**How it works.** `w.companions` is pure ledger/state math (engine owns loyalty/wages, DM owns voice):
hirelings must be minted off a real codex NPC, `companionChargeWages` runs at rest and unpaid wages
erode loyalty to desertion; the sidekick is creation-as-promotion (CR≤1/2, one class, singular slot)
that levels with the PC and never rebirths. Render helpers expose only coarse loyalty *words*.
**Lives in:** `src/world/companions.js`. **Spec:** docs/COMPANIONS.md

### Session Prep (Soft Canon / Frontiers)
**What it is.** The staging layer that binds rolled environments to "rumored frontier" map nodes,
hardening to canon only on arrival.
**How it works.** `startPrep` assembles the multi-environment bundle and binds each to a SOFT frontier
node (the quest hook); `applyPrep` enriches from the DM's synthesis overlays; `lockOnContact` flips
soft→hard the instant the player enters. Travel walks tick per-segment and can roll a rust-exposure
check on a water leg; unvisited soft prep is recycled, not discarded.
**Lives in:** `src/world/prep.js`. **Spec:** docs/SESSION-PREP.md

### DM Bridge (applyEvent + Digest)
**What it is.** The client-side half of the DM protocol — builds the state digest, applies the typed
events the DM returns.
**How it works.** `dmDigest()` builds the scoped JSON twin of the prose handoff; `sendTurn`/`pollResponse`/
`applyResponse` ship the turn and render the answer. `applyEvent(w,e)` is the *sole* mutator surface the
DM can reach — it never writes `U` directly, only fires typed events (`item_use`, `charge_spend`,
`open_shop`, `foe_morale`, …) this runtime translates into real mutations. `cmTheaterNotify` bridges
select combat events into the Battle Theater. **Typed contracts guard the seam:** `validateEvent` /
`validateTurnResponse` machine-check the two inbound shapes against the event contract before the engine
trusts them (`DM_EVENT_TYPES` = the type vocabulary + `DM_EVENT_SOURCES` = the provenance allow-list
`{detected,declared,player,branch}`, both parity-tested) — malformed envelopes no-op, unknown-but-well-formed
types pass (forward-compatible). **Forgiving payloads:** `dmFoldPayload` folds each event through the
`DM_EVENT_FIELDS` census once after validation — known field-name aliases (`id/faction→clockId`, `name/text→what`,
`to→target`, …) rewrite to canonical, and an unknown key **warns + drift-ledgers but is never dropped**, so a
mis-named field degrades to a loud warning instead of a silent no-op (the class BUG-01/06/09 came from). **Structured telemetry:**
`logDmTurn` records one row per completed turn (latency / lane / payload bytes / applied events / estimated
$) into the `GS.dm.telemetry` ring buffer + the bridge's `POST /telemetry` → `.dm/telemetry.jsonl`.
**Lives in:** `src/world/dm.js`. **Spec:** docs/DM-BRIDGE.md

### Death & Rebirth (Fate)
**What it is.** The death-to-new-soul pipeline — stamp the fall, run the bardo, roll a successor.
**How it works.** `killCharacter` writes the fall to canon; `openBardo` drifts the world gap and dreams
14 visions over the dead PC's Saga; `closeBardo` rolls a wholly new successor. Death is permanent and
generative — the legacy "respawn into the same adventure" behavior is retired.
**Lives in:** `src/world/fate.js`, `src/world/rebirth.js`. **Spec:** docs/DEATH-AND-REBIRTH.md

### DM Handoff Export
**What it is.** The human-readable character + world/scene briefing text, with a clipboard fallback for
manual play.
**How it works.** `charHandoff` composes a first-person character summary; the world/scene handoff
assembles state/time/location/transitions into prose. Both are copy-to-clipboard — the manual
alternative to the structured `dmDigest()` path.
**Lives in:** `src/world/handoff.js`. **Spec:** —

---

### Item Legacy (the death-loot loop)
**What it is.** Storied items get a custody lifecycle — brutal difficulty becomes emotionally profitable.
**How it works.** Legacy-grade instances stamp `r.legacy` on their CODEX record (never the
instance): `origin/claimant/lastSeen/lossState` + recovery hooks. `killCharacter` corpse-stamps;
the bardo runs scavenge teeth; `item_claimed` is the single custody-transition event (detected on
death/claim/scavenge folds, declared for off-screen custody); a recovered item overlay-restores its
ench/base. The `cached` lossState is the Bastion vault seam. Digest slice: `dmDigest.itemLegacy`.
**Lives in:** `src/world/item-legacy.js` (+ fate/rebirth/dm hooks). **Spec:** docs/ITEM-LEGACY.md

### Crowning Ritual & Bastion (the ending, world half)
**What it is.** A world can FINISH — retirement as state promotion, never deletion.
**How it works.** `openCrowning` (bardo-pattern modal) → Legend roll (`CROWN_LEGEND` d8, PROVISIONAL
rows) → crown epithet via reputation → testament via `computeSaga` → `w.crowned` + the PC retires to
`U.souls` → `legendRecord` banks into `U.legends` (capped), which `distantWordPick` concats so
crowned worlds leak legend into OTHER worlds' rumors. `markSundered` seals the dark twin. The
Bastion: `bastion_claim` (either-gate: closed front OR tier-scaled gold; one per world) mints
`w.bastion.vault`, unparking item-legacy's `cached` state; the heirloom echo lets a NEW soul's
origin draw a crowned vault's item via a cross-world `item_claimed` pair.
**Lives in:** `src/world/crowning-ritual.js`, `data/crown-legend.js`, `src/creator/sheet.js` (heirloom origin). **Spec:** docs/CROWNING-BASTION.md

## UI & Battle Theater (the optional visual lens over text-first truth)

The DOM UI and the three.js battle stage. All of it degrades cleanly — the prose/2D tracker is the
load-bearing accessible truth; the theater is a lens.

### World & Map Rendering / Walk-to-Theater Seam
**What it is.** The DOM render of the world panel, maps, ledger, sheet, shop, and the read-only combat
tracker — plus the seam handing combat events to the theater.
**How it works.** `mapVisibleIds` computes fog-of-war; `shopPanel`/`combatPanel`/`charSheetBody` render
display-only views using coarse words (never raw HP/AC/reputation numbers). `cmTheaterNotify` forwards
up to eight combat ledger sites through `window.Theater.fxFromLedger` — a no-op (never a throw) when
WebGL is absent.
**Lives in:** `src/world/render.js`. **Spec:** docs/BATTLE-THEATER.md

### Sprite Channel & Registry (creatures-as-sprites — SPRITE-TRANSITION)
**What it is.** The 2026-07-09 art-direction pivot: creature minis are 2D billboarded sprites on the
3D stage; the three.js engine keeps trays/architecture/props. Retire ≠ delete — the 3D bodies stay as
the fallback tier.
**How it works.** `SPRITE_REGISTRY` (`data/sprite-registry.js`, GENERATED by
`build/gen-sprite-registry.py` from the v2 sheet manifest + bestiary join + the Adam-redline tags
overlay) maps `spr-*` slugs → realm/kind/role/CR/size/tags/status. `figureFor` (theater-boot.js) tries
the sprite branch first for creature kinds: only `status:"cut"` entries render (NearestFilter alpha-cutout
plane on the existing base disc, plane height on an SRD size ladder so Gargantuan ≥4× Medium, Y-only
billboarding); pending/unmatched fall through to the whole-object → cuboid chain. Kill switch
`window.Theater.spriteChannel`. Sheets are authored as prompt files (`dev/model-qa/sprite-sheets/*.md`),
manifested by `build/gen-sprite-sheet-manifests.py`, sliced by `build/slice-sprites.py --manifest-v2`
(fail-loud, always-review-sheet).
**Lives in:** `src/ui/theater-boot.js`, `data/sprite-registry.js`, `build/gen-sprite-*.py`.
**Spec:** docs/SPRITE-TRANSITION.md

### Oracle Tab
**What it is.** The player panel for freely browsing and rolling any compiled table.
**How it works.** `src/ui/oracle.js` owns the tab state and wires `oracleRoll` into the Track-B engine
(`CT`/`rollTable`), painting the matched row — a thin shell over the compiled-tables engine.
**Lives in:** `src/ui/oracle.js`. **Spec:** —

### Theater Board/Scene Data Derivation
**What it is.** The pure-data layer turning combat state into the tile/unit shapes the renderer
consumes — one source of truth for the theater, the 2D tracker, and the prose.
**How it works.** `theaterBoardFrom`/`theaterUnitsFrom` re-project the zone grid into
`{tiles,units}` without mutating, calling RNG, or touching globals (each band×lane → a 3×3 patch;
`THEATER_ENV_PALETTE` for FFT-legible contrast), and fold in REALM-RENDER-STYLE grading. `trayFrom`
generalizes the same seam to the standing table's source kinds — segment / **node** (a typed place
record renders as its diorama: floor exactly `dims.w × dims.d` tiles, 1 tile = 1 cell = 5 ft, props
hash-scattered deterministically from the dressing pools) / interior (shape-reserved) / idle. Plain
classic-script, jsdom-testable with zero GL coupling.
**Lives in:** `src/engine/theater-data.js`. **Spec:** docs/BATTLE-THEATER.md

### Theater Renderer (three.js boot / stage)
**What it is.** Genesis's one ES-module boundary — a WebGL battle stage with an FFT-style camera,
PS1-grit shading, and a narrow `window.Theater` API.
**How it works.** Loaded via a single `<script type="module">` over vendored three.js; `setBoard`
consumes the pure tile data, `setUnits` builds figures via a precedence chain (whole-object model → PC
recipe → bestiary recipe → cuboid fallback, so no creature is a bare slab). Render-on-demand (dirty
flag), flat Lambert + NearestFilter + low internal res for the PSX look; degrades cleanly (no throw)
without WebGL.
**Lives in:** `src/ui/theater-boot.js`. **Spec:** docs/BATTLE-THEATER.md

### Model Grammar (parts, recipes, whole-object registry)
**What it is.** The "recipes, not models" system that gives almost every creature a distinct figure
cheaply.
**How it works.** `theater-parts.js` exports ~42 pure part-functions with a fixed anchor contract and
semantic tint channels; `data/model-recipes.js` (generated from the bestiary) names which parts each
creature assembles; `theater-figures.js` is the whole-object registry pointing at 73+ hand-authored
creature/prop modules, with a nearest-sub alias table and null-fallback to the cuboid chain.
**Lives in:** `src/ui/theater-parts.js`, `src/ui/theater-figures.js`, `data/model-recipes.js`.
**Spec:** docs/MODEL-GRAMMAR.md

### Theater Verb Library (animation vocabulary)
**What it is.** The named-verb animation system — advance/strike/hurt/down/cast/knockback/flee/absurdity
+ elemental FX — motion without skeletal rigs.
**How it works.** `theater-verbs.js` (an ES-module boundary) exports `THEATER_VERBS` + `playVerb`, which
registers parametric position/rotation/scale tweens into the renderer's tween array; the engine owns
*when* a verb fires (mapped off combat events + the DM's `stage_fx`), this module owns *how it looks*.
Zero direct three.js coupling — every handle comes through the passed `ctx`.
**Lives in:** `src/ui/theater-verbs.js`. **Spec:** docs/BATTLE-THEATER.md

---

## DM Seat (the narrator: persona, transport, economy)

### DM Charter — the persona/behavior contract
**What it is.** The DM's "constitution" — the single spec governing voice, agency, pacing, and
invention-capture.
**How it works.** Pure documentation the system prompt distills: second-person present-tense one-narrator
voice; the agency floor (never roll the player's dice, never speak as the PC, open handoffs not menus);
the slow-drip discipline; and §8.5 — anything the DM invents must land as a codex record / ledger fact /
typed event, never free-floating prose-canon.
**Lives in:** `docs/DM-CHARTER.md`. **Spec:** docs/DM-CHARTER.md

### DM Bridge — the local mailbox protocol
**What it is.** A tiny local HTTP mailbox letting an AI DM play turns without duplicating game logic
server-side.
**How it works.** The app POSTs a TurnRequest (action + open rolls + digest) to `/turn`; the DM reads it,
composes narration + typed events (never resolving dice), writes a TurnResponse to `/response`; the app
applies events through its own `applyEvent`. A strict two-call-per-turn budget cuts latency; `dmTriage`
stamps each turn fast/deep to route routine beats to a cheaper model.
**Lives in:** `dev/dm-bridge.py`, `src/world/triage.js`. **Spec:** docs/DM-BRIDGE.md

### Digest Diet — the per-turn state economy
**What it is.** The token-cost fix that ships only the scene-relevant slice of state each turn instead
of the whole world.
**How it works.** Full codex records only for the current node, the active walk's cast, and anything
freshly changed since the DM's last turn; one-line roster stubs for everything else so the DM knows
things exist without re-reading them (deeper records pulled on demand). Cut a ~43KB duplicated block to
a scene slice.
**Lives in:** `src/world/dm.js` (`dmDigest`), `dev/peek-state.py`. **Spec:** docs/DIGEST-DIET.md

### DM-SEAT — the API-direct DM (launch path)
**What it is.** The specced successor to the mailbox: a same-origin proxy calling a provider API
directly for narration.
**How it works.** `src/world/seat.js` assembles the prompt (SEAT-PROMPT system message + bootstrap +
rolling window + the turn's digest) and streams one call per turn to the bridge's `/seat` route
(key injected server-side, cost logged); the response is schema-validated then applied through the same
`applyEvent` path — the mailbox DM stays a drop-in fallback.
**Lives in:** `src/world/seat.js`, `dev/dm-bridge.py`. **Spec:** docs/DM-SEAT.md

---

## Creator (world + soul creation)

### New Game Flow / The Bardo
**What it is.** The single guided onboarding rite — a spirit-guide wizard that creates a world and a
character together.
**How it works.** A NEWGAME/BARDO state machine sequences four stages (World Coalesces → Soul Takes
Shape → Threads Bind → Incarnation), each roll click-to-roll with juice scaled to the spice band and a
shared 3-reroll budget; nothing is canon until the soul wakes, and the DM enters only at the final
waking beat.
**Lives in:** `src/creator/bardo.js`, `data/creation-flow.js`. **Spec:** docs/NEW-GAME-FLOW.md

### Character Creation — the Sheet
**What it is.** The guided SRD-legal Level-1 mechanical build.
**How it works.** Choose species/class/background (19 backgrounds), open-roll ability scores
(4d6-drop, auto-assigned then reassignable); `src/creator/scores.js` computes modifiers + derived
numbers. "Of your choice" grants are surfaced as real picks, not silent auto-fills; heavy rules text
stays a pointer the DM resolves, never duplicated.
**Lives in:** `src/creator/scores.js`, `src/creator/sheet.js`, `data/srd-creator.js`. **Spec:** docs/CHAR-CREATION.md

### Character Creation — the Life
**What it is.** The biographical roll-chain over the Sheet — an XGE "This Is Your Life" backstory that
seeds the ledger.
**How it works.** Roll through Origins → Personal Decisions → an age-scaled Life Events pass (branching
into Adventures/Tragedies/War/Crime…); `src/creator/life.js` runs the lookups and writes any produced
people + open threads into the ledger as canon a successor can later intersect.
**Lives in:** `src/creator/life.js`, `data/creation-flow.js`. **Spec:** docs/CHAR-CREATION.md

### Wandering Souls Roster
**What it is.** The bank of created-but-unplayed characters a player can save and later launch.
**How it works.** `src/creator/roster.js` banks/reads/removes roster entries (`soulFromCGEN` banks a
fully-walked creator character) and owns lightweight name generators used as quick-pick fallbacks.
Adam's canon souls seed into every roster.
**Lives in:** `src/creator/roster.js`. **Spec:** —

### Level-Up Choice Picker
**What it is.** The in-app modal for the interpretive level choices the engine can't decide — new
spells and the L4/L8 ASI.
**How it works.** `src/creator/levelup.js` computes per-level deltas from `CLASS_PROGRESSION`, opens a
modal only when a level offers a real choice, and applies picks via one mutator; the mechanical recompute
is applied separately by the engine's `level_applied` event. Subclass stays DM-narrated in v1.
**Lives in:** `src/creator/levelup.js`. **Spec:** docs/ADVANCEMENT.md

---

## Data & Pipeline (edit-source → compile-artifact)

The generated `data/*.js` are compiled from hand-authored sources — **never hand-edit the artifacts.**

### Table Compile Pipeline
**What it is.** The markdown-tables → runtime dice-index pipeline.
**How it works.** Adam edits pipe-table markdown under `Engine/`; `lint-tables.py` pre-checks range
gaps/overlaps; `compile-tables.py --emit` runs a content-safety denylist scan (aborts whole on any hit),
derives each table's dice method from its heading, and writes `tables.json`/`.js` as range-based rows.
Per-family jsdom harnesses exercise the compiled tables after every compile; source + artifact commit
together.
**Lives in:** `Engine/00. _System/compile-tables.py`, `build/lint-tables.py`, `tables.js`. **Spec:** docs/TABLE-EDIT-SAFETY.md

### Manifest / Module System
**What it is.** The single index of every JS module — the spine that keeps the classic-script codebase
from drifting.
**How it works.** `manifest.json` lists each module (`id`/`path`/`owns`/`desc`) + a `loadOrder` matching
the `<script>` order in `genesis.html`; `check-manifest.py` validates after every edit — paths exist,
each `owns` symbol is defined exactly once, no orphan files, tags match load order (ES-module exemption
for the theater boot).
**Lives in:** `manifest.json`, `build/check-manifest.py`, `genesis.html`. **Spec:** —

### Bestiary & Monster Data
**What it is.** The generated monster-stat index + its flavor/realm-reskin sidecars.
**How it works.** `gen-bestiary.py` parses hand-authored stat-block markdown → `data/bestiary.js` (510
blocks, AC/HP/CR/actions/tags + custom d10 tables carried verbatim, never mechanized); `monster-flavor.js`
adds desc + a d8 flavor table per id; `realm-bestiary.js` is the per-realm layer (1307 creatures, each
`frame` = a real bestiary chassis, `model` = a render key); `model-recipes.js` derives a figure recipe
per entry.
**Lives in:** `data/bestiary.js`, `data/realm-bestiary.js`, `data/monster-flavor.js`, `build/gen-bestiary.py`.
**Spec:** docs/MODEL-GRAMMAR.md

### Items & Economy Data
**What it is.** The type/instance gear index + the hand-authored economy balance tables.
**How it works.** `gen-items.py` builds `data/items.js` (`ITEMS_BY_NAME` objective facts + 261 magic
items) from SRD sources — the same type/instance split as the bestiary; `data/economy.js` is hand-authored
(rarity price bands, 0.5 sell ratio, settlement-tier stock gates). The engine computes off this data,
never a parallel system.
**Lives in:** `data/items.js`, `data/economy.js`, `build/gen-items.py`. **Spec:** docs/ITEMS.md

### Character/Class Progression Data
**What it is.** Generated L1-20 advancement data (classes, subclasses, sidekicks, feats, spells).
**How it works.** `gen-class-progression.py` parses SRD classes → `data/class-progression.js` (PB,
full-text features, spell/resource scalers, cross-validated against canonical slot matrices); sibling
generators do subclasses, sidekicks (Tasha's, re-voiced), and the 339-spell index + creator-facing slim
view. `srd-creator.js`/`feats.js` are hand-curated.
**Lives in:** `data/class-progression.js`, `data/spells.js`, `build/gen-class-progression.py`. **Spec:** docs/ADVANCEMENT.md

### World & Realm Vocabulary Data
**What it is.** The frozen 11-realm taxonomy + per-realm surface/prop/skin vocabularies.
**How it works.** `data/realms.js` is hand-authored frozen source (the 11 realm ids + register/voice);
`realm-surfaces.js`/`realm-props.js` are generated, cross-validating every `base`/`model` reference
against the live render-part vocabulary (unresolved → `net-new:` placeholders for the model queue);
`skin-motifs.js` drives motif'd walks.
**Lives in:** `data/realms.js`, `data/realm-surfaces.js`, `data/realm-props.js`, `data/skin-motifs.js`.
**Spec:** docs/BREACH.md

### Naming & Cultural Identity Data
**What it is.** Per-species and per-culture name pools for minting NPCs with regional names.
**How it works.** `data/names.js` is a hand-authored per-species pool; `names-cultures.js` is generated
into 12 regional banks (the region-culture NPC mint is a later wiring unit); `souls-canon.js` holds
Adam's canon Wandering Souls, seeded into every roster.
**Lives in:** `data/names.js`, `data/names-cultures.js`, `data/souls-canon.js`. **Spec:** docs/REGIONS-NAMES.md

### Corpus Health Tooling
**What it is.** The audit/lint scripts that scan the whole corpus for duplication, IP risk, and coverage
gaps.
**How it works.** `corpus-intensity-map.py` scores every table for spice ceiling/floor; `find-dup-rows`/
`collapse-duped-tables` merge duplicates; `scan-creature-ip`/`apply-creature-scrub` handle IP language;
`gen-table-usage-audit.py` maps every compiled table to its consumer (or flags Oracle-only).
**Lives in:** `build/corpus-intensity-map.py`, `build/gen-table-usage-audit.py`, `build/scan-creature-ip.py`.
**Spec:** docs/CORPUS-INTENSITY-MAP.md

---

### DM Contract Artifact (anti-drift keystone)
**What it is.** The machine-readable runtime contract — the prompt/handler drift class made unshippable.
**How it works.** `build/gen-dm-contract.py --emit` parses the DECLARED registries in `src/world/dm.js`
(`DM_EVENT_TYPES`, `DM_EVENT_FIELDS`, `DM_DIGEST_KEYS` — never a toString regex) + its own
EXAMPLES/DIGEST_NOTES maps into `dm-contract.json` (96 events, aliases, sources, digest shape,
one worked example each), and SPLICES the §events section of both seat prompts between
`DM-CONTRACT:EVENTS` markers. `dev/verify-dm-contract.mjs` is the three-way drift guard
(contract ↔ runtime ↔ prompts); the generator hard-fails on any event missing an example.
New event = registry row + example + `--emit`, or the build refuses.
**Lives in:** `build/gen-dm-contract.py`, `dm-contract.json`. **Spec:** docs/DM-CONTRACT-ARTIFACT.md

## Reference (opening-screen reference tools)

Player-reachable reference apps launched from a "Reference" section on the opening screen — an
expandable shelf, built so a new app is one registry entry.

### Reference Shelf
**What it is.** The expandable opening-screen launcher that hosts the reference apps (Monster Manual, Wiki, and future Props & Scenery).
**How it works.** `src/ui/reference-shelf.js` (classic script) owns `REFERENCE_APPS` + `referenceShelfRegister/Open/Close/SectionHTML`; each app pushes one `{id,label,icon,order,mount,teardown}` entry, `renderStart()` paints a button per entry, and one `#refShelf` modal (`role="dialog"`, Esc-close, focus-trap) mounts exactly one app at a time (teardown-before-switch). Because ES-module apps register after boot, `referenceShelfRegister` re-renders the start screen so late registrants appear. Adding an app is one entry — no launcher change.
**Lives in:** `src/ui/reference-shelf.js`, `genesis.html`. **Spec:** docs/REFERENCE-SHELF.md

### Monster Manual
**What it is.** A browsable in-game Monster Manual — every creature (510 regular + 1307 realm = 1817) with a live 3D render, stats, actions, traits, flavor d8, and narrative.
**How it works.** `src/ui/ref-bestiary.js` (ES module, shelf app #1) unifies both corpora via a `manualEntries()` adapter (derives ids, resolves realm stats off `BESTIARY[frame]`, pulls regular desc/d8 from `MONSTER_FLAVOR`); the grid lazy-renders through ONE shared offscreen `WebGLRenderer` blitting to per-card 2D canvases (static idle, orbit on hover), the detail view gets its own context + an alt-model bullet menu (mechanism-only today). It reuses the game's figure-build path via the `Theater.refFigure` seam so it can never drift from what battle renders. Read-only.
**Lives in:** `src/ui/ref-bestiary.js`, `src/ui/theater-boot.js`. **Spec:** docs/BESTIARY-MANUAL.md

### Wiki
**What it is.** The in-game design-doc wiki — every system with a brief description of how it works, browsable from the opening screen.
**How it works.** `build/gen-wiki.py` compiles this very file (`docs/ARCHITECTURE.md`) → `data/wiki.js` (`WIKI_INDEX`, one entry per `### ` system) — edit-source→compile, never hand-edit the artifact; `src/ui/ref-wiki.js` (shelf app #2, classic script) renders the index grouped by layer with a left nav, per-system card, free-text + layer filters, and a spec link per card. v1 is the index + descriptions; per-system detail pages are a fast-follow (the slug/spec plumbing is already carried).
**Lives in:** `build/gen-wiki.py`, `data/wiki.js`, `src/ui/ref-wiki.js`. **Spec:** docs/REFERENCE-SHELF.md

---

*61 systems indexed. When you add or materially change a system, add/update its entry here and
recompile the Wiki — this file is the source of truth the in-game Wiki renders.*

### Table Atlas
**What it is.** Reference Shelf app #3 — the whole table corpus as a live, inspectable instrument.
**How it works.** `build/gen-table-atlas.py` joins `table-registry.json` + `tables.json` + the
machine-readable usage audit (`data/table-usage.js`, split from the audit generator) + roll-count
telemetry (`data/roll-counts.js`, tallied by a `compiled.js` hook) into `data/table-atlas.js`;
`src/ui/ref-atlas.js` renders family/wiring-status/spice-band navigation with per-table roll counts.
Read-only v1 (writability is the dream endpoint, gated on source-safe writeback). Archived ids are
shown, never hidden, and excluded from live-id resolution.
**Lives in:** `src/ui/ref-atlas.js`, `build/gen-table-atlas.py` (+ 3 generated data files). **Spec:** docs/TABLE-ATLAS.md
