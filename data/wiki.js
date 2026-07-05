/* GENESIS DATA — data/wiki.js — GENERATED, do not hand-edit.
   Source: docs/ARCHITECTURE.md. Compile: python3 build/gen-wiki.py
   Then: python3 build/check-manifest.py

   Owns: WIKI_INDEX — the in-game Wiki's index (src/ui/ref-wiki.js renders this;
   docs/REFERENCE-SHELF.md "Registered app #2 — Wiki"). Each entry:
   {system, slug, layer, whatItIs, howItWorks, livesIn[], spec}.
   Edit docs/ARCHITECTURE.md and re-run the compile command above — never hand-edit this file. */
const WIKI_INDEX = [
  {
    "system": "Table-Roll Primitives & Fragment Oracle (Track A)",
    "slug": "table-roll-primitives-fragment-oracle-track-a",
    "layer": "Engine layer",
    "whatItIs": "The core dice/roll primitives over the inline world/setting tables.",
    "howItWorks": "`data/world-tables.js` holds `T` (tables) and `FRAG` (the player-facing Fragment oracle veil, row-aligned to `T`); `src/engine/tables.js` supplies `rollTbl` (flat/bell rolls), `fragAt` (veil lookup), `ebRoll` (opening-bundle roll), and `concretize` (resolves an uncanny multi-step roll-chain). The engine-rolls-atoms half — the AI turns the returned fragments into prose.",
    "livesIn": [
      "src/engine/tables.js",
      "data/world-tables.js"
    ],
    "spec": null
  },
  {
    "system": "Compiled-Tables Dice Engine (Track B)",
    "slug": "compiled-tables-dice-engine-track-b",
    "layer": "Engine layer",
    "whatItIs": "The runtime that rolls against the big *generated* table corpus.",
    "howItWorks": "`compile-tables.py` compiles the Engine markdown into `tables.js` (a global `GENESIS_TABLES` with dice type, bell flag, veil flag, row ranges/text); `src/engine/compiled.js` reads it into `CT`, exposing `rollExpr` (parse dice-strings) and `rollTable(id)` (range-based row lookup). Distinct from Track A, which rolls the smaller inline tables.",
    "livesIn": [
      "src/engine/compiled.js",
      "tables.js"
    ],
    "spec": "docs/TABLE-EDIT-SAFETY.md"
  },
  {
    "system": "World Genesis — Factions, Pressures, Starting State & Entry",
    "slug": "world-genesis-factions-pressures-starting-state-entry",
    "layer": "Engine layer",
    "whatItIs": "The roll-chain that gives a fresh world a standing situation.",
    "howItWorks": "`src/engine/world-gen.js` chains the primitives into `rollFaction`/`rollPressure` (Dungeon-World-Fronts-style \"danger with momentum\"), `rollStartingState`, and the Entry bridge (`rollEntry`/`pickTension`/faction proximity); `ssFactionTurn` advances factions turn-over-turn. Borrows the *structure* (not content) of DW Fronts + SWN factions; all writes land in the ledger, and the DM only narrates what's already rolled.",
    "livesIn": [
      "src/engine/world-gen.js",
      "data/creation-flow.js"
    ],
    "spec": "docs/STARTING-STATE-MODELS.md"
  },
  {
    "system": "Hex Substrate (Lazy Geometry)",
    "slug": "hex-substrate-lazy-geometry",
    "layer": "Engine layer",
    "whatItIs": "An unbounded, never-stored hex terrain plane under the node map.",
    "howItWorks": "`src/engine/hexmap.js` hashes `(seed,q,r)` → biome deterministically with no storage (chunkgen-style, never enters AI context); axial math converts world↔hex, and `setNodeXY`/`placeTravelNode` pin narrative nodes with write-once route/bearing canon winning over raw distance. The SVG paint (`renderHexMap`) lives in the render layer, kept separate.",
    "livesIn": [
      "src/engine/hexmap.js"
    ],
    "spec": "docs/SPATIAL-MODEL.md"
  },
  {
    "system": "Node-Graph Cognition & Travel",
    "slug": "node-graph-cognition-travel",
    "layer": "Engine layer",
    "whatItIs": "The tiny symbolic map the AI actually reasons in — places as nodes, travelled routes as edges.",
    "howItWorks": "Two layers stay deliberately separate: the node-graph is what the AI holds (\"the horde is at the Salt-Garrison, ~5 days NE\"); the hex substrate never enters context. `src/world/ play.js` builds the graph (`addNode`/`addEdge`/`rollRoute`) and turns a route's crossed hexes into a deterministic wilderness-encounter series the AI only narrates.",
    "livesIn": [
      "src/world/play.js"
    ],
    "spec": "docs/SPATIAL-MODEL.md"
  },
  {
    "system": "Regions & Name Cultures",
    "slug": "regions-name-cultures",
    "layer": "Engine layer",
    "whatItIs": "A coarse land-region layer giving every area a rolled identity that biases what spawns there.",
    "howItWorks": "`src/engine/region.js` hashes region centers and rolls a write-once identity (name, character, flavor vector: archetype/skin bias, cultures, econ/spice tilt); that vector then biases walk generation, shop economy, and NPC naming. `frayLevel`/`fraySpiceFloor` raise the spice floor (Grounded→Mythic) with distance from the lived-in center.",
    "livesIn": [
      "src/engine/region.js"
    ],
    "spec": "docs/REGIONS-NAMES.md"
  },
  {
    "system": "Combat Resolver",
    "slug": "combat-resolver",
    "layer": "Engine layer",
    "whatItIs": "The theater-of-the-mind 5.5e combat math — resolution, initiative, attacks, saves, damage, bands.",
    "howItWorks": "`combat.js` is pure/deterministic on the combat objects it's passed (never touches `w`/`U`/codex): `resolveCreature` → BESTIARY stat block (CR-band fallback if unknown), side-based initiative, and attacks that accept a pre-rolled player d20 (dice transparency) while the engine rolls monsters' dice. `combatFromEncounter` is the walk→combat seam; `combatOutcomeEvents` derives the EVENT-CONTRACT payloads that `world/dm.js` prices and emits.",
    "livesIn": [
      "src/engine/combat.js"
    ],
    "spec": "docs/COMBAT.md"
  },
  {
    "system": "Combat Actions (Action Economy)",
    "slug": "combat-actions-action-economy",
    "layer": "Engine layer",
    "whatItIs": "The martial action-economy layer — action/bonus/reaction budgets, Extra Attack, opportunity attacks, grapple/shove.",
    "howItWorks": "`resetTurnBudget`/`spendBudget` track a per-turn budget and refuse double-spends; `attacksPerAction` derives Extra Attack from `CLASS_PROGRESSION`; `opportunityAttack` fires on an undefended departure; `resolveGrapple`/`resolveShove` implement the SRD contested check. Pure on the passed combatants, mirroring `combat.js`.",
    "livesIn": [
      "src/engine/combat-actions.js"
    ],
    "spec": "docs/SRD-MECHANIZATION.md"
  },
  {
    "system": "Monster Tactics & Morale",
    "slug": "monster-tactics-morale",
    "layer": "Engine layer",
    "whatItIs": "How foes decide to act — a scripted tactic ladder plus a binding morale check.",
    "howItWorks": "`proposeTactic` runs an anti-drift ladder (creature's own custom d10 table → the walk-rolled Behavior hook → a generic state machine) as an advisory proposal; morale is binding — `moraleTrigger` detects once-per-fight conditions and the engine rolls an open WIS save, a failure rolling a flee/surrender/rout disposition. Low-CR trash can autoplay a full turn when the DM allows.",
    "livesIn": [
      "src/engine/monster-tactics.js"
    ],
    "spec": "docs/MONSTER-TACTICS.md"
  },
  {
    "system": "Advancement (XP Economy & Leveling)",
    "slug": "advancement-xp-economy-leveling",
    "layer": "Engine layer",
    "whatItIs": "The XP pricing and leveling spine, capped at the Tier-2 ceiling (L10).",
    "howItWorks": "`awardXp` prices XP off resolved-tension events (CR-based, with a per-session decay guard against farming); `levelForXp` clamps to `LEVEL_CEILING=10`; `applyLevelUp` re-derives HP/PB/ spell slots/resources from `CLASS_PROGRESSION` on a rest. Interpretive picks (spells/ASI/subclass) are left to the DM or the level-up picker.",
    "livesIn": [
      "src/engine/advancement.js"
    ],
    "spec": "docs/ADVANCEMENT.md"
  },
  {
    "system": "Social Resolver (Attitude / Parley)",
    "slug": "social-resolver-attitude-parley",
    "layer": "Engine layer",
    "whatItIs": "The social analog of the combat resolver — a check becomes an attitude-ladder shift.",
    "howItWorks": "Pure functions returning a delta: `socialDC` maps current attitude → the DC to warm one step (Hostile 25 → Friendly 10, Helpful terminal); `applyLeverage` folds Want/Fear/Leverage/ Trust (±5) and can flag a decisive auto-shift; `resolveSocialCheck` resolves one step (caught lie −2, near-miss −1, intimidation overshoot → Terrified). The event layer commits via `codexSetAttitude`.",
    "livesIn": [
      "src/engine/social.js"
    ],
    "spec": "docs/SOCIAL.md"
  },
  {
    "system": "Walk Generators (Urban / Dungeon / Wilderness)",
    "slug": "walk-generators-urban-dungeon-wilderness",
    "layer": "Engine layer",
    "whatItIs": "The three procedural crawl generators that build a session's traversable map.",
    "howItWorks": "Each roller ports an Obsidian Templater procedure (Urban v3.1, Dungeon v4.2, an authored wilderness set) into pure data: pick a topology (pacing grammar), build a node/edge graph, roll each node's sub-table/encounter/scene from the compiled tables, and layer on a shared loot lane (`dwalkLoot`, defined once and reused), a walk-skin, macguffin chances, and a per-node interactable.",
    "livesIn": [
      "src/engine/walk.js",
      "dungeon-walk.js",
      "wild-walk.js"
    ],
    "spec": "docs/SESSION-PREP.md"
  },
  {
    "system": "Walk Archetypes (Creature Roster Resolution)",
    "slug": "walk-archetypes-creature-roster-resolution",
    "layer": "Engine layer",
    "whatItIs": "The registry mapping a walk's rolled archetype label to an actual bestiary creature.",
    "howItWorks": "`WALK_ARCHETYPES` maps each archetype string to bestiary tag filters + a CR band; `resolveArchetypePool` unions that filtered pool with the table-authored A/B/C pool (authored kept at a ~35% floor so hand-tuned flavor survives) and returns one name. This is also how Adam's custom creatures enter rotation by CR. (The shared `bestiaryResolve`/slug-index lives in `combat.js`.)",
    "livesIn": [
      "src/engine/walk-archetypes.js"
    ],
    "spec": null
  },
  {
    "system": "Quest Hook Roller",
    "slug": "quest-hook-roller",
    "layer": "Engine layer",
    "whatItIs": "Generates the raw narrative hook (destination, macguffin, complication, urgency, pitch) bound to a prepped environment.",
    "howItWorks": "`rollQuestHook({environment})` is pure table generation producing raw hook material without assigning a questgiver identity — that binding is deliberately left to the AI synthesis pass; `qhookMaybeParleyAngle` adds social framing where relevant.",
    "livesIn": [
      "src/engine/quest-hook.js"
    ],
    "spec": "docs/SYNTHESIS-CONTRACT.md"
  },
  {
    "system": "Prep Bundle Assembler",
    "slug": "prep-bundle-assembler",
    "layer": "Engine layer",
    "whatItIs": "The deterministic pre-step that fires all the walk rollers + hooks and gathers world context into one bundle for AI synthesis.",
    "howItWorks": "`assemblePrepBundle` calls the walk rollers + `rollQuestHook` per requested environment and pulls NPC/place/item rolls + ledger context — entirely dice-and-lookup, no LLM call; `prepBundleSummary` gives the cheap Stage-1 view for a lighter first pass.",
    "livesIn": [
      "src/engine/prep-bundle.js"
    ],
    "spec": "docs/SYNTHESIS-CONTRACT.md"
  },
  {
    "system": "Tarot / Session-Draw Engine",
    "slug": "tarot-session-draw-engine",
    "layer": "Engine layer",
    "whatItIs": "The Session Draw mutator — a tarot pull that flavors a session's rolled environments.",
    "howItWorks": "`data/tarot.js` authors only the omen lines + major-arcana directives; `src/engine/ tarot.js` derives each minor card's domain weight/intensity/valence at draw time from suit/rank/ reversal, keeping the authored surface small.",
    "livesIn": [
      "src/engine/tarot.js",
      "data/tarot.js"
    ],
    "spec": "docs/TAROT-SESSION.md"
  },
  {
    "system": "Economy Engine (Pricing / Stock / Transactions)",
    "slug": "economy-engine-pricing-stock-transactions",
    "layer": "Engine layer",
    "whatItIs": "The buy/sell spine — prices, shop stock, and transactions off the economy data.",
    "howItWorks": "`src/engine/economy.js` + `src/world/shop.js` compute prices (rarity-derived), stock (gated by settlement tier, not PC level), and transactions, emitting `item_changed` events; it never invents a parallel pricing system. Money is the priority currency (the hub buying partial access to others).",
    "livesIn": [
      "src/engine/economy.js",
      "src/world/shop.js"
    ],
    "spec": "docs/ITEMS.md"
  },
  {
    "system": "World Spine (State, Clock, Ledger, Map)",
    "slug": "world-spine-state-clock-ledger-map",
    "layer": "World layer",
    "whatItIs": "The persistence + bookkeeping backbone — the save-file, clock, append-only ledger, and node map.",
    "howItWorks": "`loadU`/`saveU` serialize the universe to localStorage with additive migration; the mutable global `U` is app-owned while transient session state lives in `GS`. `addLedger` is the append-only event log other systems write growth/drift signals into; the map tracks seen nodes with fog-of-war exposed to render.",
    "livesIn": [
      "src/world/state.js"
    ],
    "spec": "docs/FOREVER-STORAGE.md"
  },
  {
    "system": "World Flow / Exploration Loop",
    "slug": "world-flow-exploration-loop",
    "layer": "World layer",
    "whatItIs": "The world lifecycle — genesis ritual, session start, explore/passTime, spawn, destroy.",
    "howItWorks": "`startGenesis`/`bindWorld` run the creation ritual (and cast the starting town's ambient pool); `beginSession` draws one tarot before prep; `explore`/`enterWorld` drive the walk loop. `passTime` is the rest gate — it rolls rest-risk before recovery, claims any pending level-up, and runs companion/pet upkeep.",
    "livesIn": [
      "src/world/play.js"
    ],
    "spec": null
  },
  {
    "system": "Codex (Relational Entity Memory)",
    "slug": "codex-relational-entity-memory",
    "layer": "World layer",
    "whatItIs": "The world's living wiki-linked memory of NPCs / Locations / Items / Factions — all-knowing, and (until touched) all-shiftable.",
    "howItWorks": "Each record carries `rolled` (the immutable soul), `fields` (player-safe), `dm` (secrets), typed `links[]`, and `status`. Records are SOFT (recontextualizable to a new role, preserving the rolled soul) until the player makes contact, then locked HARD to canon forever. Writes flow only through `codex_*` events from `applyEvent`; `codexPlayerView` projects a knowledge-gated slice.",
    "livesIn": [
      "src/world/codex.js"
    ],
    "spec": "docs/CODEX.md"
  },
  {
    "system": "Companions (Hirelings + Sidekick)",
    "slug": "companions-hirelings-sidekick",
    "layer": "World layer",
    "whatItIs": "Hired help — disposable wage-earning hirelings, one leveling sidekick, and befriended pets.",
    "howItWorks": "`w.companions` is pure ledger/state math (engine owns loyalty/wages, DM owns voice): hirelings must be minted off a real codex NPC, `companionChargeWages` runs at rest and unpaid wages erode loyalty to desertion; the sidekick is creation-as-promotion (CR≤1/2, one class, singular slot) that levels with the PC and never rebirths. Render helpers expose only coarse loyalty *words*.",
    "livesIn": [
      "src/world/companions.js"
    ],
    "spec": "docs/COMPANIONS.md"
  },
  {
    "system": "Session Prep (Soft Canon / Frontiers)",
    "slug": "session-prep-soft-canon-frontiers",
    "layer": "World layer",
    "whatItIs": "The staging layer that binds rolled environments to \"rumored frontier\" map nodes, hardening to canon only on arrival.",
    "howItWorks": "`startPrep` assembles the multi-environment bundle and binds each to a SOFT frontier node (the quest hook); `applyPrep` enriches from the DM's synthesis overlays; `lockOnContact` flips soft→hard the instant the player enters. Travel walks tick per-segment and can roll a rust-exposure check on a water leg; unvisited soft prep is recycled, not discarded.",
    "livesIn": [
      "src/world/prep.js"
    ],
    "spec": "docs/SESSION-PREP.md"
  },
  {
    "system": "DM Bridge (applyEvent + Digest)",
    "slug": "dm-bridge-applyevent-digest",
    "layer": "World layer",
    "whatItIs": "The client-side half of the DM protocol — builds the state digest, applies the typed events the DM returns.",
    "howItWorks": "`dmDigest()` builds the scoped JSON twin of the prose handoff; `sendTurn`/`pollResponse`/ `applyResponse` ship the turn and render the answer. `applyEvent(w,e)` is the *sole* mutator surface the DM can reach — it never writes `U` directly, only fires typed events (`item_use`, `charge_spend`, `open_shop`, `foe_morale`, …) this runtime translates into real mutations. `cmTheaterNotify` bridges select combat events into the Battle Theater.",
    "livesIn": [
      "src/world/dm.js"
    ],
    "spec": "docs/DM-BRIDGE.md"
  },
  {
    "system": "Death & Rebirth (Fate)",
    "slug": "death-rebirth-fate",
    "layer": "World layer",
    "whatItIs": "The death-to-new-soul pipeline — stamp the fall, run the bardo, roll a successor.",
    "howItWorks": "`killCharacter` writes the fall to canon; `openBardo` drifts the world gap and dreams 14 visions over the dead PC's Saga; `closeBardo` rolls a wholly new successor. Death is permanent and generative — the legacy \"respawn into the same adventure\" behavior is retired.",
    "livesIn": [
      "src/world/fate.js",
      "src/world/rebirth.js"
    ],
    "spec": "docs/DEATH-AND-REBIRTH.md"
  },
  {
    "system": "DM Handoff Export",
    "slug": "dm-handoff-export",
    "layer": "World layer",
    "whatItIs": "The human-readable character + world/scene briefing text, with a clipboard fallback for manual play.",
    "howItWorks": "`charHandoff` composes a first-person character summary; the world/scene handoff assembles state/time/location/transitions into prose. Both are copy-to-clipboard — the manual alternative to the structured `dmDigest()` path.",
    "livesIn": [
      "src/world/handoff.js"
    ],
    "spec": null
  },
  {
    "system": "World & Map Rendering / Walk-to-Theater Seam",
    "slug": "world-map-rendering-walk-to-theater-seam",
    "layer": "UI & Battle Theater",
    "whatItIs": "The DOM render of the world panel, maps, ledger, sheet, shop, and the read-only combat tracker — plus the seam handing combat events to the theater.",
    "howItWorks": "`mapVisibleIds` computes fog-of-war; `shopPanel`/`combatPanel`/`charSheetBody` render display-only views using coarse words (never raw HP/AC/reputation numbers). `cmTheaterNotify` forwards up to eight combat ledger sites through `window.Theater.fxFromLedger` — a no-op (never a throw) when WebGL is absent.",
    "livesIn": [
      "src/world/render.js"
    ],
    "spec": "docs/BATTLE-THEATER.md"
  },
  {
    "system": "Oracle Tab",
    "slug": "oracle-tab",
    "layer": "UI & Battle Theater",
    "whatItIs": "The player panel for freely browsing and rolling any compiled table.",
    "howItWorks": "`src/ui/oracle.js` owns the tab state and wires `oracleRoll` into the Track-B engine (`CT`/`rollTable`), painting the matched row — a thin shell over the compiled-tables engine.",
    "livesIn": [
      "src/ui/oracle.js"
    ],
    "spec": null
  },
  {
    "system": "Theater Board/Scene Data Derivation",
    "slug": "theater-board-scene-data-derivation",
    "layer": "UI & Battle Theater",
    "whatItIs": "The pure-data layer turning combat state into the tile/unit shapes the renderer consumes — one source of truth for the theater, the 2D tracker, and the prose.",
    "howItWorks": "`theaterBoardFrom`/`theaterUnitsFrom` re-project the zone grid into `{tiles,units}` without mutating, calling RNG, or touching globals (each band×lane → a 3×3 patch; `THEATER_ENV_PALETTE` for FFT-legible contrast), and fold in REALM-RENDER-STYLE grading. Plain classic-script, jsdom-testable with zero GL coupling.",
    "livesIn": [
      "src/engine/theater-data.js"
    ],
    "spec": "docs/BATTLE-THEATER.md"
  },
  {
    "system": "Theater Renderer (three.js boot / stage)",
    "slug": "theater-renderer-three-js-boot-stage",
    "layer": "UI & Battle Theater",
    "whatItIs": "Genesis's one ES-module boundary — a WebGL battle stage with an FFT-style camera, PS1-grit shading, and a narrow `window.Theater` API.",
    "howItWorks": "Loaded via a single `<script type=\"module\">` over vendored three.js; `setBoard` consumes the pure tile data, `setUnits` builds figures via a precedence chain (whole-object model → PC recipe → bestiary recipe → cuboid fallback, so no creature is a bare slab). Render-on-demand (dirty flag), flat Lambert + NearestFilter + low internal res for the PSX look; degrades cleanly (no throw) without WebGL.",
    "livesIn": [
      "src/ui/theater-boot.js"
    ],
    "spec": "docs/BATTLE-THEATER.md"
  },
  {
    "system": "Model Grammar (parts, recipes, whole-object registry)",
    "slug": "model-grammar-parts-recipes-whole-object-registry",
    "layer": "UI & Battle Theater",
    "whatItIs": "The \"recipes, not models\" system that gives almost every creature a distinct figure cheaply.",
    "howItWorks": "`theater-parts.js` exports ~42 pure part-functions with a fixed anchor contract and semantic tint channels; `data/model-recipes.js` (generated from the bestiary) names which parts each creature assembles; `theater-figures.js` is the whole-object registry pointing at 73+ hand-authored creature/prop modules, with a nearest-sub alias table and null-fallback to the cuboid chain.",
    "livesIn": [
      "src/ui/theater-parts.js",
      "src/ui/theater-figures.js",
      "data/model-recipes.js"
    ],
    "spec": "docs/MODEL-GRAMMAR.md"
  },
  {
    "system": "Theater Verb Library (animation vocabulary)",
    "slug": "theater-verb-library-animation-vocabulary",
    "layer": "UI & Battle Theater",
    "whatItIs": "The named-verb animation system — advance/strike/hurt/down/cast/knockback/flee/absurdity + elemental FX — motion without skeletal rigs.",
    "howItWorks": "`theater-verbs.js` (an ES-module boundary) exports `THEATER_VERBS` + `playVerb`, which registers parametric position/rotation/scale tweens into the renderer's tween array; the engine owns *when* a verb fires (mapped off combat events + the DM's `stage_fx`), this module owns *how it looks*. Zero direct three.js coupling — every handle comes through the passed `ctx`.",
    "livesIn": [
      "src/ui/theater-verbs.js"
    ],
    "spec": "docs/BATTLE-THEATER.md"
  },
  {
    "system": "DM Charter — the persona/behavior contract",
    "slug": "dm-charter-the-persona-behavior-contract",
    "layer": "DM Seat",
    "whatItIs": "The DM's \"constitution\" — the single spec governing voice, agency, pacing, and invention-capture.",
    "howItWorks": "Pure documentation the system prompt distills: second-person present-tense one-narrator voice; the agency floor (never roll the player's dice, never speak as the PC, open handoffs not menus); the slow-drip discipline; and §8.5 — anything the DM invents must land as a codex record / ledger fact / typed event, never free-floating prose-canon.",
    "livesIn": [
      "docs/DM-CHARTER.md"
    ],
    "spec": "docs/DM-CHARTER.md"
  },
  {
    "system": "DM Bridge — the local mailbox protocol",
    "slug": "dm-bridge-the-local-mailbox-protocol",
    "layer": "DM Seat",
    "whatItIs": "A tiny local HTTP mailbox letting an AI DM play turns without duplicating game logic server-side.",
    "howItWorks": "The app POSTs a TurnRequest (action + open rolls + digest) to `/turn`; the DM reads it, composes narration + typed events (never resolving dice), writes a TurnResponse to `/response`; the app applies events through its own `applyEvent`. A strict two-call-per-turn budget cuts latency; `dmTriage` stamps each turn fast/deep to route routine beats to a cheaper model.",
    "livesIn": [
      "dev/dm-bridge.py",
      "src/world/triage.js"
    ],
    "spec": "docs/DM-BRIDGE.md"
  },
  {
    "system": "Digest Diet — the per-turn state economy",
    "slug": "digest-diet-the-per-turn-state-economy",
    "layer": "DM Seat",
    "whatItIs": "The token-cost fix that ships only the scene-relevant slice of state each turn instead of the whole world.",
    "howItWorks": "Full codex records only for the current node, the active walk's cast, and anything freshly changed since the DM's last turn; one-line roster stubs for everything else so the DM knows things exist without re-reading them (deeper records pulled on demand). Cut a ~43KB duplicated block to a scene slice.",
    "livesIn": [
      "src/world/dm.js` (`dmDigest`)",
      "dev/peek-state.py"
    ],
    "spec": "docs/DIGEST-DIET.md"
  },
  {
    "system": "DM-SEAT — the API-direct DM (launch path)",
    "slug": "dm-seat-the-api-direct-dm-launch-path",
    "layer": "DM Seat",
    "whatItIs": "The specced successor to the mailbox: a same-origin proxy calling a provider API directly for narration.",
    "howItWorks": "`src/world/seat.js` assembles the prompt (SEAT-PROMPT system message + bootstrap + rolling window + the turn's digest) and streams one call per turn to the bridge's `/seat` route (key injected server-side, cost logged); the response is schema-validated then applied through the same `applyEvent` path — the mailbox DM stays a drop-in fallback.",
    "livesIn": [
      "src/world/seat.js",
      "dev/dm-bridge.py"
    ],
    "spec": "docs/DM-SEAT.md"
  },
  {
    "system": "New Game Flow / The Bardo",
    "slug": "new-game-flow-the-bardo",
    "layer": "Creator",
    "whatItIs": "The single guided onboarding rite — a spirit-guide wizard that creates a world and a character together.",
    "howItWorks": "A NEWGAME/BARDO state machine sequences four stages (World Coalesces → Soul Takes Shape → Threads Bind → Incarnation), each roll click-to-roll with juice scaled to the spice band and a shared 3-reroll budget; nothing is canon until the soul wakes, and the DM enters only at the final waking beat.",
    "livesIn": [
      "src/creator/bardo.js",
      "data/creation-flow.js"
    ],
    "spec": "docs/NEW-GAME-FLOW.md"
  },
  {
    "system": "Character Creation — the Sheet",
    "slug": "character-creation-the-sheet",
    "layer": "Creator",
    "whatItIs": "The guided SRD-legal Level-1 mechanical build.",
    "howItWorks": "Choose species/class/background (19 backgrounds), open-roll ability scores (4d6-drop, auto-assigned then reassignable); `src/creator/scores.js` computes modifiers + derived numbers. \"Of your choice\" grants are surfaced as real picks, not silent auto-fills; heavy rules text stays a pointer the DM resolves, never duplicated.",
    "livesIn": [
      "src/creator/scores.js",
      "src/creator/sheet.js",
      "data/srd-creator.js"
    ],
    "spec": "docs/CHAR-CREATION.md"
  },
  {
    "system": "Character Creation — the Life",
    "slug": "character-creation-the-life",
    "layer": "Creator",
    "whatItIs": "The biographical roll-chain over the Sheet — an XGE \"This Is Your Life\" backstory that seeds the ledger.",
    "howItWorks": "Roll through Origins → Personal Decisions → an age-scaled Life Events pass (branching into Adventures/Tragedies/War/Crime…); `src/creator/life.js` runs the lookups and writes any produced people + open threads into the ledger as canon a successor can later intersect.",
    "livesIn": [
      "src/creator/life.js",
      "data/creation-flow.js"
    ],
    "spec": "docs/CHAR-CREATION.md"
  },
  {
    "system": "Wandering Souls Roster",
    "slug": "wandering-souls-roster",
    "layer": "Creator",
    "whatItIs": "The bank of created-but-unplayed characters a player can save and later launch.",
    "howItWorks": "`src/creator/roster.js` banks/reads/removes roster entries (`soulFromCGEN` banks a fully-walked creator character) and owns lightweight name generators used as quick-pick fallbacks. Adam's canon souls seed into every roster.",
    "livesIn": [
      "src/creator/roster.js"
    ],
    "spec": null
  },
  {
    "system": "Level-Up Choice Picker",
    "slug": "level-up-choice-picker",
    "layer": "Creator",
    "whatItIs": "The in-app modal for the interpretive level choices the engine can't decide — new spells and the L4/L8 ASI.",
    "howItWorks": "`src/creator/levelup.js` computes per-level deltas from `CLASS_PROGRESSION`, opens a modal only when a level offers a real choice, and applies picks via one mutator; the mechanical recompute is applied separately by the engine's `level_applied` event. Subclass stays DM-narrated in v1.",
    "livesIn": [
      "src/creator/levelup.js"
    ],
    "spec": "docs/ADVANCEMENT.md"
  },
  {
    "system": "Table Compile Pipeline",
    "slug": "table-compile-pipeline",
    "layer": "Data & Pipeline",
    "whatItIs": "The markdown-tables → runtime dice-index pipeline.",
    "howItWorks": "Adam edits pipe-table markdown under `Engine/`; `lint-tables.py` pre-checks range gaps/overlaps; `compile-tables.py --emit` runs a content-safety denylist scan (aborts whole on any hit), derives each table's dice method from its heading, and writes `tables.json`/`.js` as range-based rows. Per-family jsdom harnesses exercise the compiled tables after every compile; source + artifact commit together.",
    "livesIn": [
      "Engine/00. _System/compile-tables.py",
      "build/lint-tables.py",
      "tables.js"
    ],
    "spec": "docs/TABLE-EDIT-SAFETY.md"
  },
  {
    "system": "Manifest / Module System",
    "slug": "manifest-module-system",
    "layer": "Data & Pipeline",
    "whatItIs": "The single index of every JS module — the spine that keeps the classic-script codebase from drifting.",
    "howItWorks": "`manifest.json` lists each module (`id`/`path`/`owns`/`desc`) + a `loadOrder` matching the `<script>` order in `genesis.html`; `check-manifest.py` validates after every edit — paths exist, each `owns` symbol is defined exactly once, no orphan files, tags match load order (ES-module exemption for the theater boot).",
    "livesIn": [
      "manifest.json",
      "build/check-manifest.py",
      "genesis.html"
    ],
    "spec": null
  },
  {
    "system": "Bestiary & Monster Data",
    "slug": "bestiary-monster-data",
    "layer": "Data & Pipeline",
    "whatItIs": "The generated monster-stat index + its flavor/realm-reskin sidecars.",
    "howItWorks": "`gen-bestiary.py` parses hand-authored stat-block markdown → `data/bestiary.js` (510 blocks, AC/HP/CR/actions/tags + custom d10 tables carried verbatim, never mechanized); `monster-flavor.js` adds desc + a d8 flavor table per id; `realm-bestiary.js` is the per-realm layer (1307 creatures, each `frame` = a real bestiary chassis, `model` = a render key); `model-recipes.js` derives a figure recipe per entry.",
    "livesIn": [
      "data/bestiary.js",
      "data/realm-bestiary.js",
      "data/monster-flavor.js",
      "build/gen-bestiary.py"
    ],
    "spec": "docs/MODEL-GRAMMAR.md"
  },
  {
    "system": "Items & Economy Data",
    "slug": "items-economy-data",
    "layer": "Data & Pipeline",
    "whatItIs": "The type/instance gear index + the hand-authored economy balance tables.",
    "howItWorks": "`gen-items.py` builds `data/items.js` (`ITEMS_BY_NAME` objective facts + 261 magic items) from SRD sources — the same type/instance split as the bestiary; `data/economy.js` is hand-authored (rarity price bands, 0.5 sell ratio, settlement-tier stock gates). The engine computes off this data, never a parallel system.",
    "livesIn": [
      "data/items.js",
      "data/economy.js",
      "build/gen-items.py"
    ],
    "spec": "docs/ITEMS.md"
  },
  {
    "system": "Character/Class Progression Data",
    "slug": "character-class-progression-data",
    "layer": "Data & Pipeline",
    "whatItIs": "Generated L1-20 advancement data (classes, subclasses, sidekicks, feats, spells).",
    "howItWorks": "`gen-class-progression.py` parses SRD classes → `data/class-progression.js` (PB, full-text features, spell/resource scalers, cross-validated against canonical slot matrices); sibling generators do subclasses, sidekicks (Tasha's, re-voiced), and the 339-spell index + creator-facing slim view. `srd-creator.js`/`feats.js` are hand-curated.",
    "livesIn": [
      "data/class-progression.js",
      "data/spells.js",
      "build/gen-class-progression.py"
    ],
    "spec": "docs/ADVANCEMENT.md"
  },
  {
    "system": "World & Realm Vocabulary Data",
    "slug": "world-realm-vocabulary-data",
    "layer": "Data & Pipeline",
    "whatItIs": "The frozen 11-realm taxonomy + per-realm surface/prop/skin vocabularies.",
    "howItWorks": "`data/realms.js` is hand-authored frozen source (the 11 realm ids + register/voice); `realm-surfaces.js`/`realm-props.js` are generated, cross-validating every `base`/`model` reference against the live render-part vocabulary (unresolved → `net-new:` placeholders for the model queue); `skin-motifs.js` drives motif'd walks.",
    "livesIn": [
      "data/realms.js",
      "data/realm-surfaces.js",
      "data/realm-props.js",
      "data/skin-motifs.js"
    ],
    "spec": "docs/BREACH.md"
  },
  {
    "system": "Naming & Cultural Identity Data",
    "slug": "naming-cultural-identity-data",
    "layer": "Data & Pipeline",
    "whatItIs": "Per-species and per-culture name pools for minting NPCs with regional names.",
    "howItWorks": "`data/names.js` is a hand-authored per-species pool; `names-cultures.js` is generated into 12 regional banks (the region-culture NPC mint is a later wiring unit); `souls-canon.js` holds Adam's canon Wandering Souls, seeded into every roster.",
    "livesIn": [
      "data/names.js",
      "data/names-cultures.js",
      "data/souls-canon.js"
    ],
    "spec": "docs/REGIONS-NAMES.md"
  },
  {
    "system": "Corpus Health Tooling",
    "slug": "corpus-health-tooling",
    "layer": "Data & Pipeline",
    "whatItIs": "The audit/lint scripts that scan the whole corpus for duplication, IP risk, and coverage gaps.",
    "howItWorks": "`corpus-intensity-map.py` scores every table for spice ceiling/floor; `find-dup-rows`/ `collapse-duped-tables` merge duplicates; `scan-creature-ip`/`apply-creature-scrub` handle IP language; `gen-table-usage-audit.py` maps every compiled table to its consumer (or flags Oracle-only).",
    "livesIn": [
      "build/corpus-intensity-map.py",
      "build/gen-table-usage-audit.py",
      "build/scan-creature-ip.py"
    ],
    "spec": "docs/CORPUS-INTENSITY-MAP.md"
  }
];
