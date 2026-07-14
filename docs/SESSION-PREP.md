---
type: system-spec
branch: Genesis
status: draft
created: 2026-06-23
related:
  - "[[DM-CHARTER]]"
  - "[[SPATIAL-MODEL]]"
  - "[[SPICE-CURVE]]"
  - "[[CRIT-MAGNITUDE]]"
  - "[[TABLE-USAGE-AUDIT]]"
  - "[[DESIGN]]"
---

# Genesis — The Session-Prep System (spec v1)

How the AI DM **preps** like a human DM — staging maps, dungeons, NPCs, treasure, secrets,
and a throughline *before* the player engages, knowing the player may deviate entirely and
that's fine. Authored from Adam's design call (2026-06-23). This is the system that finally
**consumes the orphan tables** (`TABLE-USAGE-AUDIT.md`): the rich depth tables were unused
because lazy-loading only ever needed a thin slice — prep is the consumer they were built for.

## 0. The core principle — *the story is in the dice*

Genesis is emergent, not authored. So prep is **not** "the LLM plots a session." It is:

1. **Over-roll** cheap, high-quality material from the segment generators (deliberately more
   than will be used).
2. The AI DM does a **full synthesis pass**: it *harvests the throughline latent in the rolled
   elements* rather than imposing one, prunes the pile, connects the pieces (the segment
   transitions are the connective tissue), and reskins everything to this world.

**Honor the rolls maximally.** A story *drawn from* the elements beats a pile of surprising
rolls. Invention is encouraged only where it serves **fun and story / connection** — never to
overwrite what the dice gave. **The DM always has final say** about what the player experiences.

The AI is an **editor of an over-rolled pile, not a plotter.** (This is the `CRIT-MAGNITUDE`
lens pattern at session scale: *dice provide the spread, the AI provides the coherence.*)

## 1. It generalizes the Charter's §8.4

`DM-CHARTER` §8.4 already locks the mechanic prep needs — **pre-generate deeper than the player
can see; soft until contact, then hard forever.** §8.4 fires *once, at founding,* and only rolls
deep secrets + over-the-horizon threats. **Session-prep is §8.4 run on a heartbeat, fed the full
play surface.** Prepped content is real enough to foreshadow and reason about, but is **soft
(provisional)** until the player touches it — so deviation costs nothing and unused prep recycles.

The lazy/prep tension dissolves into one **resolution gradient**:

```
committed canon → PREPPED (soft) → stub → lazy-gen → fraying void
   (touched)       (this cycle)     (cheap)  (cold)    (unseen)
```

Prep just spends resolution ahead of the player where they'll probably go. This maps directly
onto the `SPATIAL-MODEL` fraying-edge (coherence decays with distance from the player).

## 2. The emergence backbone — the segment walk

The **segment families** (`Urban Segment *`, and the dungeon / wilderness equivalents) are a
self-chaining walk generator, fully table-encoded:

- Each segment table is a list of typed **scene modules** (a scene + a **Transition (d4/d6)**
  column). The transition *is the edge to the next segment* ("through the kitchen to back alleys
  / via the cellar to underground routes…").
- The segment **types** form a **pacing grammar**: Opening → Hub → Path / Lead / Side-Lead /
  Waypoint → Threshold → Surface / Inner → Cold / Warm / Hot Scene → Event / Faction Scene →
  Escalation → Excursion → Fragment.
- **Firing the walk** = roll an Opening → follow its transition → roll the matching next segment
  type → repeat up to ~20 segments. **Pure dice — cheap.** Emergence is structural.

> **Build note (2026-06-23):** **all three walk-rollers are BUILT** (engine, `src/engine/`):
> `rollUrbanWalk` (`walk.js`, ported from Obsidian `Urban Procedure v3.1` — 16 topologies, dedup+
> overflow, weighted encounters, scene frames), `rollDungeonWalk` (`dungeon-walk.js`, ported from
> `Dungeon Procedure v4.2` — 12 topologies, depth-budgeted loot, Myth-Seed-affinity boss/revelation),
> and `rollWildernessWalk` (`wild-walk.js`, authored fresh — a linear leg journey, biome can shift,
> arrival site). Each returns a walk data structure (segments=nodes, transitions/route=edges).
> Verified headless (`dev/verify-walk.mjs`, 2667 assertions across all three). Foundational compiler
> change shipped with the first: `compile-tables.py` now emits `row[5]` = structured per-row cells,
> so multi-column prep tables keep their columns.

**The walk becomes the sub-map.** Each segment is a node; each transition is a weighted edge;
the fired walk is pinned into the `SPATIAL-MODEL` node-graph/hex under the soft-until-contact
rule. **Exception:** when prepping into *already-defined* geography, the DM runs a **reconciliation
pass** — fit the walk to what's already pinned rather than overwrite (write-once spatial canon,
`DM-CHARTER` §8.3).

## 3. The prep cycle (the pipeline)

**Engine = cheap deterministic rolling + state. AI = the synthesis pass.** (The locked discipline.)

| # | Stage | Who | What |
|---|---|---|---|
| 0 | **Read state** | AI | Ledger sweep — PC position/tier, open threads, faction clocks, the drip plan. Decide the **frontier** and which environments are **spatially plausible** from here. No roll. |
| 1 | **Fire the walks** | Engine | Roll **multi-environment** segment walks for the plausible environments (urban district / dungeon / wilderness leg), ~up to 20 segments each, via the grammar + transitions. **Over-roll.** |
| 2 | **Roll the hooks** | Engine | Quest suite (`Quest Complication/Destination/Macguffin/Urgency/Questgiver`) → hooks that **lead to each environment** — the options that connect them. |
| 3 | **Roll the cast & payload** | Engine | NPC depth suite (`Personality/Ideal/Trauma/Grace/Motivation/Resource Control/If Cornered/If Ignored`) for key figures; monsters + `Monster Motivation/Behavior`; treasure by tier; environment identity from the Place suite (`Traits/History/Secret/Ruler/Relations`). Over-roll. |
| 4 | **Synthesis pass** | **AI** | The heavy lift. Read the over-rolled pile → **harvest the throughline** → prune segments that don't serve → connect via transitions → **reskin everything to the world** (factions, named NPCs, ledger threads) → **reconcile** against canon geography → set anticipated DCs. Invent only to serve fun/connection. DM final say. |
| 5 | **Bind the map** | Engine | Segments → nodes, transitions → edges, pinned into the node-graph/hex (reconciled per Stage 4). |
| 6 | **Write as soft** | Engine | The whole **reskinned** bundle → the ledger as **provisional (soft)** canon. Reskin happens **at prep** (Stage 4), so recycling later is clean. |
| 7 | **Advance the world** | Engine | Tick faction / pressure / grim-portent clocks since last cycle → "what changed off-screen." The world breathes whether or not the player engaged (`DM-CHARTER` §10.1). |

## 4. Soft canon, deviation & recycling

- **Touched → reveal + lock.** Prepped depth is revealed through narration (Fragment veil holds),
  and locks to write-once canon on first contact.
- **Deviated → lazy-gen + prep-debt.** The player outran prep: lazy-gen the immediate need, log a
  **prep-debt** so the next cycle covers the new frontier.
- **Unused soft prep → recycle.** Soft material was *never observed*, so relocating/reskinning it
  doesn't violate canon — it's the classic DM move (reuse the dungeon they skipped). Because the
  bundle was **already reskinned at prep**, recycling is cheap; **re-contextualize thoroughly** on
  reuse (names, ties, geography all re-fitted — never a visible seam).

## 5. Scope — multi-environment, plausibly reachable

Each cycle fires **several environments**, each reachable via a **quest hook**, so any direction
the player picks has real depth. But the environments must make **spatial/narrative sense from the
current position**: a session starting deep in a 20-room dungeon preps adjacent levels / **secret
exits** — not a non-sequitur wilderness, *unless* a secret exit justifies one (which is fine, and
a fun reason to add one). Plausibility is the AI's Stage-0 call.

## 6. Cadence — what fires a cycle

- **Soul creation → always fires a prep cycle** (locked). Can't rely on the player to declare a
  session.
- **Session start/end button** (planned): the DM analyzes the ledger and ensures enough is
  prepped, with a throughline that is meaningful and — above all — **FUN**. The button is the
  player-facing affordance; the heartbeat is the ledger sweep behind it.

## 7. What this wires (ties to `TABLE-USAGE-AUDIT`)

The orphan clusters are the prep payload: **segment families** → the walk (§2); **NPC depth
suite** → the cast (Stage 3); **Quest suite** → the hooks (Stage 2); **Place suite** →
environment identity (Stage 3); **Faction Turn / Grim Portent / Pressure** → the clocks (Stage 7).
Wiring session-prep is how ~89 Oracle-only files re-enter play.

## 8. Build status & open items

- **Spec:** draft, 2026-06-23 (this doc). Playtest-provisional — validate over the DM Bridge.
- **Built (2026-06-23):** all three **walk-rollers** — `rollUrbanWalk` / `rollDungeonWalk` /
  `rollWildernessWalk` (`src/engine/walk.js`, `dungeon-walk.js`, `wild-walk.js`) + the `row[5]`
  cells compiler change. Headless-verified (2667 assertions).
- **Built (2026-06-23):** the **synthesis-pass contract** — `docs/SYNTHESIS-CONTRACT.md` + the
  deterministic half (`prep-bundle.js` assembler + `quest-hook.js`) + the two staged prompts
  (`AI Prompts/synthesis-{harvest,reskin}.md`). Multi-environment, staged (harvest→reskin), output =
  roll-keyed overlay + briefing. Headless-verified (`dev/verify-prep-bundle.mjs`). *The LLM synthesis
  itself runs over the DM Bridge at play time (qualitative).*
- **Built (2026-06-23):** (3+5) **prep state + binding** — `src/world/prep.js`: `startPrep` binds each
  prepped environment to a **soft "rumored frontier"** node (soft edge = the quest hook), `applyPrep`
  enriches them from the DM's synthesis overlays + writes soft new-canon, `lockOnContact` flips
  soft→hard on entry (Charter §8.4), recycle/prep-debt for unvisited frontiers. (4) **cadence** —
  `beginSession()` fires prep every session; `⎘ Prep handoff` button + `prep_applied`/`prep_contact`
  EVENT-CONTRACT types; map renders soft frontiers dashed. Headless-verified (`dev/verify-prep.mjs`,
  22 assertions). *Browser render unverified in this env (preview sandbox-blocked) — confirm at playtest.*
- **Not built:** (6) a fuller **orchestrator** (plausibility-from-frontier; firing the NPC/Place depth
  rollers too) — refinement, not a blocker. **The system is now playtestable end-to-end over the Bridge.**
- **Open questions for playtest:** how *wide* "plausible from the frontier" should be; the over-roll
  multiplier (how much waste is worth the synthesis options); whether the synthesis pass is one LLM
  call or staged; cost ceiling per cycle.
