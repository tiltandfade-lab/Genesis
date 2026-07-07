---
type: rough-spec
project: Genesis
status: ROUGH — Adam direction captured; future Fable spec-session queue; do not build until re-gated
created: 2026-07-06
related:
  - "[[REFERENCE-SHELF]]"
  - "[[BESTIARY-MANUAL]]"
  - "[[TABLE-EDIT-SAFETY]]"
  - "[[TABLE-USAGE-AUDIT]]"
---

# FABLE DEV TOOLS — reference companions for authoring, tuning, and prep

This is a future-tool sketch for the big Fable planning queue. It is not a build order yet.

North star: Genesis should stop making Adam read raw generated/code-adjacent `.md` files whenever
he wants to understand, tune, or expand the game. The Monster Manual and Wiki proved the pattern:
read-only, live-data reference surfaces first; manual editors only after source ownership and
writeback rules are boringly explicit.

The tools below are companions to the Reference Shelf, the Monster Manual, and the feature index.
For now, the Reference Shelf is also the dev-tool section; do not create a separate Dev Tools shelf
until the project is actually building proper authoring tooling. They are Adam-authoring and prep
surfaces first, with a later table-flip path: player-custom authoring tools, pre-alpha creation
telemetry, and eventually "Adam/player as DM vs PC AI" workflows.

Blind-playable is a guiding principle, not merely an accessibility afterthought. Every dev tool and
visual surface should have a text/queryable equivalent that carries the same game-state meaning.
Graphics are notation and inspection aids; the text/simulation spine remains the primary playable
surface.

## Tool 1 — Table Atlas

A read-only table viewer for the whole compiled table corpus.

### Problem

The table corpus is now too large to inspect by opening markdown files one by one. Adam needs a way
to answer authoring questions quickly:

- What tables exist?
- What rows do they contain?
- Which tables are wired into play vs Oracle-only?
- Which systems call them?
- How often do they actually fire in play?
- Where are the Grounded/Textured/Strange/Volatile/Mythic rows concentrated?
- Which tables need a rewrite, richer row contract, wiring, or retirement?

### v1 shape — read-only atlas

Mount as a Reference Shelf app beside Monster Manual and Wiki. Table Atlas is a companion to both,
not a separate authoring/debugging product surface yet.

- Left rail: categories/subcategories from `table-registry.json`.
- Main list: every table with name, id, category, die, row count, status, source path, and wiring
  status.
- Detail panel: rendered rows from `tables.json`, with roll ranges, Band/spice tier, text, and any
  optional columns the compiler exposes.
- Sort and filter by:
  - spice tier / Band coverage;
  - table class when available;
  - category/subcategory;
  - row count and die shape;
  - wired/procedure/chained/Oracle-only;
  - source path;
  - text search.
- "Wired to" block: show consumers from `docs/TABLE-USAGE-AUDIT.md` / its generator data, grouped
  as procedure, roll-chain, and code call site. Any connection counts; do not hide Oracle/manual,
  procedure, chained, code, test, or edge-case consumers.
- "Fires in play" block: show how many times each table has been rolled in test sessions. Adam's
  only hard requirement is total roll count per table; Fable may choose whether this lives in the
  existing DM/session telemetry or a separate roll-log artifact.
- Row/body preview: the viewer must show enough of the table for a human to judge whether the table
  is spicy enough for its stated Band/tier. Do not reduce the atlas to counts alone.
- Band distribution strip: show a labeled mini heat strip/histogram for each table, e.g.
  `Grounded 12 · Textured 18 · Strange 14 · Volatile 5 · Mythic 1`, with colors matching the
  Band palette. This is the readable version of the earlier shorthand; never show unexplained
  initials like "GGG TTT SSS VV M."
- Copy bundle per table: table id/name, source path, generated artifact path, wiring consumers, and
  suggested edit target.

Design goal: Adam can skim the table world like a dashboard instead of spelunking the file tree.

### v1 data seams

Use existing artifacts first:

- `table-registry.json` for table catalog, source path, die, rows, category, active/archive/stub.
- `tables.json` for compiled rows and Band cells.
- `docs/TABLE-USAGE-AUDIT.md` as the human artifact for wiring; ideally split its generator output
  into `data/table-usage.js` or `table-usage.json` so the app does not parse prose.
- `build/lint-tables.py` output, later, for warnings/errors surfaced inline.

Do not parse raw markdown in the browser for v1. The atlas should reflect compiled reality, with a
clear link back to source.

### Firing frequency telemetry

Static wiring answers "can this fire?" Frequency answers "does this fire?"

Future roll telemetry should stamp every automatic table roll with:

```js
{
  tableId,
  tableName,
  rowRange,
  band,
  caller,
  procedure,
  sessionId,
  turnId,
  worldDay,
  surfacedToPlayer: true | false
}
```

The atlas can then show:

- total fires across all sessions;
- total fires in test sessions;
- fires per play hour/session;
- last fired;
- top callers;
- player-visible vs plumbing-only;
- cold tables that are wired but never firing;
- hot tables whose weak rows deserve re-authoring first.

### v2 shape — manual editor, gated later

Do not write to source in v1.

Dream dev tools have true in-browser writability. The eventual editor should be source-aware, not
generated-artifact-aware:

- edits write only to `Engine/03. _Tables/**/*.md` or approved asset source files;
- compiled files are regenerated by the normal pipeline;
- every save runs table lint and shows exact warnings before commit;
- row reordering/renumbering is assisted, with range gaps/overlaps impossible in the UI;
- Band edits use a constrained tier control;
- row-contract columns are schema-aware by table family;
- writeback shows a diff before apply.

Acceptance bar for editor mode: Adam can make a row edit, regenerate, and see the compiled result
without any ambiguity about which source file changed.

## Tool 2 — NPC Library

A browseable and eventually editable library of pre-made NPCs.

Priority note: NPC cards are a HIGH-priority small visual win because the same asset can serve the
authoring library and the in-game journal/codex.

### v1 shape

- Reads `Asset Library/NPCs/**/*.md` and any compiled/generated NPC records that already exist.
- Primarily browses pre-made NPCs, but PCs from live games should be able to appear with an option
  to promote them into an any-world roster of potential NPCs.
- Browse by role, faction, town relationship, danger, utility, secret type, attitude baseline,
  knowledge grade, likely environment/affinity, and "ready for play" completeness.
- Detail view shows:
  - identity and role;
  - what they want now;
  - what they know;
  - what they can offer;
  - pressure clock / if ignored;
  - faction ties;
  - secrets and reveal channels;
  - mechanical chassis if any;
  - source path and copyable id.
- "Ready for play" can be a low threshold. The AI DM can flesh out on demand; a strong seed like a
  behavior quirk plus a vibe can be enough for a usable scene NPC.
- Companion to `NPC-KNOWLEDGE-GRADES` eventually, but do not assume the "NPCs know too much"
  problem has already been encountered in play. Editing NPCs already in play is a later design
  question; v1 edits the bench of likely NPCs to be cast.

### Later editor

The editor should create or update NPC source files using a template, then optionally publish an NPC
into a town, faction, encounter, or starting-state pool. It should never silently blend a one-off
NPC, a reusable NPC asset, and a world-instance NPC into the same thing.

Key distinction to preserve:

- NPC asset: reusable authored template.
- NPC instance: this world's specific person with state, attitude, memory, wounds, debts.
- NPC generator row: table material that can create either of the above.
- Promoted PC: a former live-game PC made available as a reusable any-world NPC candidate.

### NPC card visual

Use compact, reusable cards rather than portrait-first assets:

- name / role / source;
- readiness badge;
- vibe/quirk line;
- want;
- secret or hidden field indicator;
- environment/affinity chips;
- faction/town relationship chips;
- "cast into scene" / copy bundle affordance later.

The journal version may hide authoring-only fields and show only what the player knows.

## Tool 3 — Town Builder

A prep/authoring tool for building a readable settlement package.

### v1 shape

- Generates or assembles a town from existing systems: region, pressures, factions, rumors, local
  economy, notable NPCs, district/building set, nearby dangers, and starting clocks.
- Shows the result as a navigable map of town facts:
  - public face;
  - hidden pressure;
  - factions and clocks;
  - NPC roster;
  - key buildings;
  - rumors and job board;
  - routes out;
  - what changes if ignored.
- Map doctrine: start with node/walk graph views before promising legible full-town geometry.
  Overhead maps of nodes and walks are likely near-term because the graph already exists. A visually
  legible town with buildings, roads, districts, and travel affordances is later and should keep a
  text twin: searchable locations, route descriptions, adjacency, travel cost, and notable features.
- Export/copy bundle for the DM seat and for source authoring.

### Design constraints

The builder should not create a beautiful town with no gameplay handles. Every generated town needs
visible decisions, pressure, resources, and consequence paths.

Existing procedural town-generation apps/libraries may be useful scaffolding later, but only if the
output can be converted into Genesis-owned graph/location/building data rather than a purely visual
map. The gameplay object is the navigable settlement model; the picture is a lens over it.

### Town scaffold preview

Spec-worthy later: a district-bubble and road-link preview before full town geometry. Start with:

- districts as labeled nodes;
- roads/routes as edges;
- key buildings hanging off districts;
- faction/pressure badges on districts;
- known vs rumored routes;
- text twin listing districts, adjacency, travel costs, and notable features.

This is not a pretty town map yet; it is the settlement graph made legible.

## Tool 4 — Building Builder

A smaller prep tool for reusable buildings and site interiors.

### v1 shape

- Starts from building type, district, owner/faction, current event, secret, risk, and reward.
- Produces:
  - readable exterior;
  - interior zones/rooms;
  - occupants;
  - one immediate problem;
  - one hidden truth;
  - interactable objects;
  - exits and complications;
  - table/source provenance.
- Works with `Asset Library/Buildings` and the urban/dungeon table families.

### Later editor

Eventually this becomes the place where a generated building can be promoted into a reusable asset
or stamped into a specific town instance.

## Cheap Visual Wins Queue

These are graphical wins that fit the "visuals as notation" doctrine and should not drag the
project into asset-production debt.

### 1. Map graph UI — YES, high value

Near-term because the node/walk graph already exists. Show:

- current node;
- known routes;
- rumored routes;
- danger/spice tint;
- travel time;
- unresolved hook/clock badges;
- text twin with route list, costs, known/rumored status, and danger notes.

### 2. Table heatmaps — YES

Use labeled Band distribution strips/histograms in Table Atlas. The goal is to let Adam judge
whether a table's rows are spicy enough for their Band before reading every row.

At this stage of development, a flag is useful: mark tables that appear under-spiced or whose Band
distribution looks suspicious against the current spice doctrine. This can start as an authoring
review flag, not an automated truth claim.

### 3. NPC cards — HIGH priority small win

Reusable in the authoring library and in-game journal. Cards should be scannable, text-first, and
source/provenance-aware, not portrait-dependent.

### 4. Item legacy plaques — YES

For significant items, show a provenance/legacy strip:

```text
found at -> wielded by -> lost at -> claimed by -> recoverable?
```

This should reinforce the item-as-story-object loop without needing bespoke item art. It must have
a text twin and should distinguish player-known history from DM-only truth.

Some legendary/provenance facts should be revealable through appraisal, lore, bards, merchants,
faction experts, recovered records, or similar in-world channels. The plaque should support
"known history" growing over time rather than showing the full truth immediately.

### 5. Combat state diagram — MOST important cheap visual

Prioritize diagrammatic combat readability over prettier models. Show:

- sides;
- range bands;
- lanes/zones;
- engaged lines;
- cover / hazard markers;
- target arrows;
- turn order chips;
- condition and wound badges;
- clear text/prose twin of the same state.

This is a bigger win than model polish because it makes the rules and fiction easier to read.

Design ruling: this should be an overlay for the existing 3D battle system, not a replacement.
The diagrammatic layer is the readable combat UI; the 3D stage remains the spatial/theatrical lens.

Classic affordance to spec: on a player or monster turn, show movement/range before the move is
declared. Hover can show reachable bands/tiles/routes; click can open an inspect card for that unit.
The inspect card should behave like the spirit of BG3's inspect action: show as much as the PC can
reasonably know, never raw hidden stats or DM-only truth. For monsters/NPCs this can reuse the NPC
card language where applicable.

### 6. Realm/spice color grammar — YES

Use consistent accents/tokens for realm, danger, spice, faction-owned, breach-touched, hidden/known,
and player-visible/DM-only status. Keep it restrained and semantic; no broad reskin project.

### 7. Town scaffold preview — SPEC-worthy

See Town Builder above. District bubbles and road links first; full building/road geometry later.
Fable can build a real spec for this.

### 8. Story Timeline — YES as player story review, blocked on sanitization details

"Receipts" and "faction clocks" are dev vocabulary. The player-facing idea is a **Story Timeline**:
a beautiful, readable way to review what happened in the player's adventure. This is a strong visual
touch if it is framed as memory/story, not as raw machinery.

The hard part is sanitization. In a sandbox, ledger/codex/event data can contain DM-only truth. The
existing ledger/Powers surface already has a known-vs-DM toggle shape; a polished Story Timeline
should wait until there is a robust player-safe projection.

Potential player-safe timeline beats later:

- session starts/ends;
- places reached;
- routes discovered;
- combats survived;
- notable NPC meetings;
- witnessed NPC attitude shifts;
- item gained/lost/recovered;
- faction reaction the player has learned;
- public reputation/epithet;
- visible consequences of player choices.

Do not expose behind-the-screen causes, unrevealed faction clocks, hidden NPC motives, unobserved
world-turn results, or raw DM event payloads.

### 9. Powers / faction cards — promising redesign target

The existing Powers & Pressures surface already exists and was shelved for needing more thought.
Instead of presenting abstract faction clocks, consider faction cards in the same spirit as NPC
cards:

- faction name;
- public face / known role;
- relationship to the PC;
- known agenda or rumor of agenda;
- visible pressure / "what they are doing that you can see";
- known places/NPCs/items tied to them;
- player-known clock/urgency only when discovered in play;
- "more is hidden" language for the rest.

Faction cards are a better player-facing object than raw clocks. They can keep clocks behind the
screen while still giving the player a concrete memory aid for powers they have encountered.

Fable can build a real spec for this together with Story Timeline and sanitization.

### Deferred / needs more thought

- Clock rail: revisit only after Story Timeline + faction cards are designed. The core question is
  how much pressure should be explicit UI versus remembered through fiction.

## Shared doctrine for all tools

- Read-only first.
- Live compiled/game data first; source links always visible.
- Generated artifacts are never hand-edited.
- True in-browser writability is the dream endpoint, once safety and source ownership are clear.
- Blind-playable parity: every map, preview, atlas, and editor needs a text/query route to the same
  information and affordances.
- Visuals are notation: ship them when they improve comprehension, authoring, or trust in state;
  do not let them become rails or asset-production debt.
- Every app has a copy bundle for Adam-to-Claude edit requests.
- Every app distinguishes reusable assets from world instances.
- Every app should answer "what is this wired to?" and, once telemetry exists, "how often does it
  actually fire?"
- Every app should make weak spots visible: missing wiring, missing row contract, missing source
  provenance, stale generated artifact, no telemetry, no player-facing handle.

## Adam rulings already captured

- Reference Shelf remains the dev-tool home for now; no separate Dev Tools shelf until proper dev
  tools are actually being built.
- Table Atlas is a companion to Monster Manual/Wiki.
- Any connection should be listed as wiring.
- Roll frequency should count total rolls per table in test sessions.
- Fable may decide where roll telemetry lives, as long as total roll counts per table exist.
- The viewer should show enough table body to judge whether rows are spicy enough for their Band.
- Table heatmaps should use readable labeled Band counts, not cryptic shorthand.
- NPC cards are a high-priority small visual win and should be reusable in-game in the journal.
- Item legacy plaques are approved as a small visual win.
- Combat state diagram is the most important cheap visual win.
- Realm/spice color grammar is approved as a semantic accent system.
- Town scaffold preview is good for a future spec.
- Story Timeline is approved as a player-facing review surface, but must be sanitized from DM-only
  knowledge.
- "Receipts" and raw "faction clocks" are dev vocabulary; player-facing UI should say story,
  timeline, powers, factions, pressures, memories, etc.
- Factions may get cards like NPC cards; this is likely a better Powers redesign than showing raw
  clocks.
- Combat state diagram is an overlay for the 3D battle system, with hover/click inspect affordances
  and movement/range preview before a unit acts.
- Item legacy plaques should allow legendary facts to be revealed through appraisal, lore, bards,
  merchants, faction experts, and recovered records.
- Table heatmaps may carry authoring review flags for suspected under-spiced tables/rows.
- Town scaffold preview and true in-browser write safety are both Fable-spec candidates.
- Ideally players can author in pre-alpha; custom authoring is part of the product thesis, not just
  internal tooling.
- Clock rail overlaps with the shelved Powers surface and needs a later design pass on
  explicit UI pressure vs remembered/fictional pressure.
- Dream editor mode is true in-browser writability.
- Build order below is correct: Table Atlas, NPC Library, Town Builder, Building Builder.
- These are Adam-authoring tools first, with future custom-authoring/player-creation/pre-alpha
  telemetry potential.
- Blind-playable should guide the whole product: maps and graphics are welcome, but must remain
  optional lenses over a text-first, queryable simulation.
- Node/walk overhead maps are nearer-term than fully legible visual towns; town geometry/building
  maps should wait until they can compile into gameplay data with a prose twin.
- NPC Library is mainly pre-made NPCs, with live-game PCs promotable into an any-world roster.
- NPC bench editing comes before editing already-in-play NPCs.
- Add NPC affinities/environments so cast likelihood can be steered.

## Remaining Fable session questions

1. What exact machine-readable shape should replace/supplement `docs/TABLE-USAGE-AUDIT.md`?
2. What is the minimum test-session roll telemetry schema that gives table counts without bloating
   the DM seat logs?
3. What fields define NPC "ready for play" while keeping the threshold intentionally low?
4. Which NPC environment/affinity labels are enough for casting?
5. What safety steps are required before true in-browser writes can graduate from dream endpoint to
   executable spec?

## Fable Mega Agenda

Tonight is a spec-writing session, not a mini-agenda. If tokens/time allow high-tier item design,
great, but the primary job is frontier-model specification: turn Adam's rulings into guardrails
lower models can execute without invention.

Candidate mega-agenda:

1. Table Atlas machine data + roll telemetry + heatmap flags.
2. NPC Library: card fields, low-threshold readiness, affinity taxonomy, promoted-PC handling.
3. Combat state overlay: movement/range preview, inspect cards, player-known visibility rules.
4. Story Timeline + Powers/faction cards: player story review and sanitizer doctrine.
5. Item legacy plaques: reveal channels for legendary/provenance facts.
6. Town scaffold preview: district/road/building graph data model.
7. True in-browser writing: source safety, validation order, undo/diff, pre-alpha player authoring.
8. High-tier item philosophy, if there is enough session budget after the spec guardrails.

## Candidate build order

1. Split `gen-table-usage-audit.py` output into machine data (`table-usage.json` or `data/table-usage.js`).
2. Build read-only Table Atlas as a shelf app.
3. Add roll telemetry for automatic table fires.
4. Surface lint/status warnings inside the atlas.
5. Build NPC Library read-only.
6. Build Town Builder and Building Builder as prep assemblers.
7. Only then design writeback/editor mode.
