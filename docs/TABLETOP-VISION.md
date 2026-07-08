---
type: system-spec
status: SPECCED 2026-07-07 (Fable, final window) — Adam-exempted from the DIRECTION §3.4 spec
  moratorium ("i give you allowance to bypass the guardrails here"). SPEC ONLY — the §4 fidelity
  freeze still governs BUILD timing: nothing here opens a build track before soak evidence, but
  when visual investment opens, this doc is the destination map and the unit queue.
consumer: post-Fable executor waves (Sonnet units, Opus review) + Adam's taste rulings
created: 2026-07-07
related:
  - "[[DESIGN-GUIDE]]"          # Part II Ivalice bible; T6 supersedes into this doc's V-map
  - "[[DIRECTION]]"             # §4 freeze + §3.4 exemption note
  - "[[DREAM-HORIZON]]"         # §0 TEXT-FIRST FOREVER — this doc is a lens, never the game
  - "[[SPEED-DOCTRINE]]"        # no model call in the assembly loop
  - "[[ON-DEMAND-GEN]]"         # effectDie + ambient pool + gen[] handshake
  - "[[SPATIAL-MODEL]]"
  - "dev/model-qa (whole-object roster) + src/ui/theater-figures.js (registry)"
---

# TABLETOP-VISION — the visual end-state and how every layer projects from state

Genesis's visual identity: **a tabletop full of miniatures.** The game is and remains text
(DREAM-HORIZON §0); the center of the screen is an optional lens showing a diorama of whatever
the party is doing — combat, a market haggle, a cave mouth — as low-poly *game pieces* on a
table, under realm lighting, moved by an invisible hand. No cartoony rendering ever; realistic
low-poly, PS1 grit (the shipped theater shader). The player never drives it with mouse or
controller; it has no inputs. Blind players lose nothing by construction (§8).

## §0 The three laws (constitution-level; everything below derives from them)

1. **The table renders only what the state can name.** Every piece on the table maps to a state
   record (segment field, codex record, combat unit, event-derived trace). DM improvisation
   NEVER stages a piece *directly* — but the boundary is **capture, not origin** (Charter §8.5
   invention-licensed-but-captured): a DM invention reaches the table only by first becoming
   state (codex mint, gen[] handshake, `walk_update` overlay), at which point it stages like
   any rolled noun. Uncaptured prose stays prose. This is the anti-drift boundary made visible,
   and it is what makes blankness structural instead of an art-direction tightrope.
   *(Adam-ruled 2026-07-07: DM-improvised STAGING is a licensed long-run lane — mechanical
   staging is the default, but "the DM improvises a stage" is the differentiator once the
   technology catches up. The law governs the ROUTE, not the ambition: a DM-staged scene
   arrives as captured state through the typed channels, never as a side-channel. See V6.)*
2. **The miniature is the ontology.** We render a *representation* of the world sitting on a
   table, not the world. A painted mini invites imagination; an animated character claims to BE
   the thing. Therefore: animation never leaves the piece (breath-bob at most, museum-grade
   restraint); pieces slide/lift under the invisible hand, they never walk; no faces beyond
   paint-dab fidelity; the void past the table edge is rendered darkness — the imagination
   space as literal negative space.
3. **The invisible hand is the DM.** Pieces are PLACED at the moment narration reveals them
   (Charter soft-until-contact, visually enacted). Placement/removal are visual verbs riding
   the existing event stream — no new game state, ever. The renderer reads; it never writes.

## §1 The stage (Adam-ruled 2026-07-07)

- **Standing table**: the theater generalizes from combat-only popup to the permanent center
  stage. Empty table under realm light when nothing is staged; realm → light rig (the
  `realmRenderProfile` grading + `LIGHT_PROFILES` pass in theater-boot.js already implement
  this — V1 is plumbing, not new tech).
- **Table edge barely visible; darkness beyond.** (Ruled.)
- **The table stays set until the scene changes.** No clearing between exchanges. (Ruled.)
- **Shell layout rides with the Standing Table** (ruled): three columns — LEFT = mechanical
  truth (sheet/party/inventory/clocks), CENTER = the table (collapsible to zero; game whole
  without it), RIGHT = the DM zone (narration + input — the actual game). ARIA landmark order:
  right, left; center `aria-hidden` (its content reaches blind players as the prose twins that
  already ride the digest). The dice overlay and any other `aria-live` element sit OUTSIDE
  the hidden center subtree (§9.11) — hiding the stage must never mute an announcement.

**Inference cost (SPEED rule 1):** V0–V5 = ZERO per-turn model calls — every layer is a pure
projection of existing state; assembly is deterministic engine work. V6a rides the existing
gen[] handshake budget (selection only). V6b/V6c are LICENSED but UNPRICED: each must declare
its own latency + token budget in its unlock proposal before any build.

## §2 Piece taxonomy (from the 2026-07-07 commercial census; census text = appendix file)

Nine classes converged on by every serious terrain system (Dwarven Forge, WarLock, OpenLOCK,
DRAGONLOCK, TerrainCrate, Monster Scenery, Loke), adapted:

| class | Genesis meaning | source of truth on the table |
|---|---|---|
| **tray** | THE scene object — a region that owns its pieces; scenes swap as whole trays | walk segment / interior / overland ref |
| **mat** | ground skin on the tray (biome × realm) | `environment` + realm + `footing` |
| **rim** | tray-edge treatment + **doorway pieces at exits** (walls demoted — Adam ruled walls lowest priority; room-by-room dioramas need edge *reads*, not architecture) | `exits[]` (dungeon exits already carry typed `door`) |
| **riser** | elevation (`elevZones` in combat; dims/areaType hints) | scene/segment |
| **prop** | scene-identity carriers (census: props = room archetype, orthogonal to skin) | `feature`, `dressing.text`, interactable tags |
| **centerpiece** | the one showpiece slot (§4) | `feature` → `object`/`interactable` |
| **figure** | creatures/NPCs/PCs on base discs (exists — whole-object roster) | combat roster, codex, ambient pool |
| **overlay** | flat dressing ON pieces/mat: two lanes, ambient + trace (§5) | `dressing.condition`, `footing`, `signOfPassage`; event stream |
| *(connector)* | not an asset — the assembler grammar + registry schema (§3) | code |

**Registry schema (the OpenLOCK lesson — standardize exactly two things):** every piece entry
declares `footprint` (in 1-unit grid multiples; the click-grid lives at the piece-interface
level ONLY — game placement stays symbolic, the no-coordinates thesis holds) and `sockets`
(where it may attach/stand). Everything else — height, silhouette, art, even role — stays free
tags. Two orthogonal tag axes: `archetype:` (tavern/shrine/cell/market/…) and skin (`env` ×
`realm`). A Noir shrine and a Verdant shrine share a prop list and differ by grade/skin —
combinatoric novelty with zero invention. Extends `WHOLE_OBJECT_REGISTRY`
(theater-figures.js:41) — same module/fn/dynamic-import pattern, same fallback discipline.

**Fallback chain (never absent, never blocks):** exact key → `NEAREST_SUB` alias → archetype
generic → **the blank piece** (unpainted meeple for figures, plain block for props). Doctrine:
soft/ambient NPCs (minted `dm.ambient:true` — prep.js:73-101) stage as blank meeples;
codex contact swaps in the painted piece under the hand. The visual is the codex state.
This is the proxy-mini every real DM grabs, made native.
**Parity condition (adversarial-pass fix; direction Adam-ruled 2026-07-07):** ambient NPCs
are off-digest until contacted (codex.js:410-460), so staging them raw would show sighted
players figures prose never mentions — a §0.1 violation. The fix runs in the TABLE's favor:
**co-location = visible.** If the player enters the room/stage where the meeple would be, it
stages — the meeple objectifies the answer to "who's here / who can I talk to," so
surroundings questions point at state instead of DM invention (the anti-drift lens). Parity
is preserved by raising the DIGEST to match the table, not by hiding the table: entering a
stage fires the ambient-presence lines into the here-digest in the same event (count/texture;
names withheld until contact — the slow drip holds on identity, not on presence). The
invariant stands: a staged figure with no digest-side presence is a hard failure (§9.6).

## §3 Tray grammar

- **tray = deterministic projection**, not new state:
  `trayFrom(source, scene?, {env, realms})` → `{ trayId, size, mat, rim, pieces[],
  overlays[], lightProfile, realmProfile, exits[] }`. Generalizes `theaterBoardFrom`
  (theater-data.js:693) which already produces 90% of this shape for combat.
  **Source vocabulary (adversarial-pass fix — walks aren't the only stage):**
  `walk segment | interior | node | overland`. Node trays cover settlement/hub scenes (the
  market haggle happens at a NODE, not a walk segment) — cast from the ambient pool +
  `status.at` + pre-cast, dressing from the place record. Overland = the V5 parchment.
- **Reconciliation rule (adversarial-pass fix): segment data proposes; current state
  disposes.** Raw `segment.encounter` is a proposal from mint-time — figures stage only after
  reconciling against codex/combat truth (dead → corpse trace or absent; befriended → painted
  companion; moved → not here). Re-deriving a tray must never resurrect a defeated encounter.
  Pure-function contract: tray = f(segment ∪ codex ∪ traces), never f(segment) alone.
  *(Adam-ruled 2026-07-07: no resurrected dead, but dead bodies are OK — the corpse piece is
  the DEFAULT disposition for a defeated foe; absence happens only via decay / obliteration /
  removal events, never by projection amnesia. The table keeps its dead.)*
- **Size** S/M/L from `areaType`/`dims` (dungeon/wild arrival) or `segType` (urban). Sizes are
  the Monster-Scenery triad; no continuous scaling.
- **One tray per room/segment**; walk = tray swap on movement (the hand lifts the old tray off,
  sets the new one down — the ONLY inter-piece animation that exists).
- **Persistence**: `trayFrom` is a pure READ of the already-persisted segment record — walk
  RNG runs ONCE at generation (raw `Math.random()`, walk.js:146; NOT re-derivable — only
  lighting is seeded) and is never re-rolled. What must *persist beyond the segment record*
  is only the trace-overlay lane + piece removals, which ride the existing per-segment
  reskin/`walk_update` overlay mechanism (prep.js:493-509) — event-sourced, no new store.
  A revisited room's tray returns as it was left, corpses and all. (Skeptic-pass fix: the
  first draft claimed "walk rolls are seeded" — false; an executor re-rolling from a seed
  would mint a different room per call.)
- **Combat does not spawn a second surface**: `combat_start` RECONFIGURES the current tray into
  the band-lane arrangement (setBoard already consumes segment+scene); combat_end relaxes it
  back, leaving traces. One table, many arrangements. **Dedup law (adversarial-pass fix):
  one noun → one piece.** The cover keyword scan pools the same feature/dressing text that
  staged the standing props (theater-data.js:503-507) — combat must RE-TAG standing pieces as
  cover/hazard zones, never stage a second copy of the same noun. Guarded by gate §9.10.
- **Rim by env**: dungeon/interior trays get rim + doorway pieces at exits (dungeon exits
  already carry typed `door`); urban rims are street-mouth markers; **wilderness trays have
  NO rim** — open mat + scatter, the census's wilderness inversion.
- **Arrangement grammar** (placement stays symbolic): a small archetype set — `facing-pair`
  (parley), `ring` (camp/social), `march` (travel), `shopfront` (market), `lanes` (combat),
  `vignette` (default: centerpiece + scatter). Attitude maps to distance+facing in social
  arrangements (hostile = far + square-on; friendly = near + angled) — the parley subsystem's
  free visual.

## §4 Centerpiece law (honors existing rolls — Adam-ruled; NO table rework required)

Per-room resolution order:
1. `feature {name,flavor}` (dungeon rooms, wilderness legs/arrivals) — stages if piece-resolvable;
2. else `object` (dungeon) / `interactable` (urban `{name,tag,tag2,signal,visibility,tone}`,
   wilderness `{name,flavor}`) — urban's tag columns are the model: tag-resolution beats
   keyword-scan and is where T6.2 "scene objectification" lands (authored tags replace the
   `theaterPropForText` derivation over time; keyword scan stays as legacy fallback).
   *Honesty note: only urban carries tags today — dungeon/wilderness centerpieces ride the
   keyword scan at v1. Tag columns for those tables are an OPTIONAL craft-pass enhancement
   (Adam's hands, opportunistic), not a prerequisite of any V-layer;*
3. else **no centerpiece — blankness is legal.**

The `effectDie` (the "one significant d8–d20", ON-DEMAND-GEN §4) **never auto-stages** — it is
DM-interpretive and may be hidden. Its consequences stage only when they become state (codex
mint, item, trace). Dungeon `secret {tier,desc,reveal,skills}` stages ONLY on its reveal event
— the hand placing a piece mid-scene IS the reveal beat. If the craft pass later wants dedicated
centerpiece rolls for a table family, that enters through Adam's craft program, never as a
mechanical column bolted on to satisfy this spec (validator law).

## §5 Overlay system — two lanes

- **Ambient (rolled — the sources already exist):** `dressing.condition`, wilderness `footing`,
  `signOfPassage {name,effect}` map to flat overlay pieces (moss, crack-webs, standing water,
  drag-marks, tracks). No new tables required for v1; richer overlay tables are a
  craft-pass option, rolled in the walk set like dressing.
- **Trace (earned — the table remembers):** derived from the event stream: combat aftermath
  (corpse topple already persists; obliteration vaporizes — existing doctrine), scorch/frost
  from damage types, spilled/dropped items, Item Legacy marks, Scene-Risk aftermath. Traces
  persist on the segment overlay and return on revisit. Consequence made furniture —
  the hard-and-dangerous pillar on the table.
- Atmo (air/odor/sound) **never renders** — already deliberately excluded
  (theater-data.js:243-247); it is prose-lane forever. Regression-guarded (§9).

## §6 The layer order (V-map; supersedes DESIGN-GUIDE T6's internal sequence)

Ordering law: each layer is a pure projection of existing state, ships with its prose twin,
cheapest-imagination-per-triangle first. Figures before terrain; mats before props; props
before shells (census: props carry scene identity; Loke proves painted ground alone works).

- **V0 (exists, frozen):** band-lane theater, ~120-piece whole-object roster, PS1 shader,
  keyword-derived props, realm grading, per-room light profiles.
- **V1 — Standing Table + shell:** theater becomes the permanent center column;
  `trayFrom(segment)` renders OUTSIDE combat; empty-table idle; 3-column shell (§1) lands in
  the same pass (ruled: arrive together). Trigger point for the ES-module/bundler migration
  (SCALING.md) exactly as T6.3 planned.
- **V2 — Cast tableau:** figures staged outside combat from ambient pool + pre-cast + codex
  `status.at`; blank-meeple/painted-piece soft/contact doctrine; arrangement grammar + attitude
  placement.
- **V3 — Mats, props, overlays:** per-archetype asset packs (mat + ~12 props + 1–2
  centerpieces, the census budget); ambient overlay lane; tag-resolution (T6.2) replacing
  keyword scan.
- **V4 — The invisible hand:** verb set — lift-and-place, slide, topple, remove, tray-swap;
  reveal-placement as the signature beat; breath-bob idle (restraint law).
- **V5 — The table absorbs the map:** node-graph journey as parchment ON the table, party
  piece moved along it; overland/montage reuse the same stage. **Knowledge-gated
  (adversarial-pass fix):** the parchment draws only visited/known nodes (the `map` remembers
  bucket) — the lazily-generated graph beyond the player's knowledge NEVER renders. The slow
  drip holds on the map or the map leaks the world.
- **V6 — Novel assembly at speed (staged gates, Adam-amended):**
  - **V6a select:** the seat picks/tints from the registry via the gen[] handshake. No geometry
    invention. SPEED law: no model call in the assembly loop — the seat *requests*, the engine
    assembles from prefetched pieces.
  - **V6b kitbash:** the seat composes new pieces from the part vocabulary *within the socket
    standard* at runtime — real invention that cannot go off-style because the parts are the
    style. Unlocks when V6a's loop is proven inside the latency budget.
  - **V6c generate:** unconstrained mesh generation. Unlocks ONLY on proof of (i) the latency
    budget end-to-end and (ii) the style gate: the ~100px blind-recognition loop (§7b
    instrument) — a generated piece unreadable as a mini at tabletop distance fails regardless
    of quality. (Adam 2026-07-07: invention allowed once a system proves the allocated time
    acceptability.)
  - **V6 applies to SCENES, not just pieces (Adam-ruled 2026-07-07):** the same select →
    kitbash → generate ladder governs whole-tray composition — the endgame is the DM
    improvising a *stage* through the captured channels (§0.1), the product's differentiator
    once the technology catches up. Same gates, bigger canvas.

## §7 Pre-alpha cut (the wedge)

Pre-alpha = **V1 + V2** + the blank-piece fallback + the trace lane's existing citizens
(corpses) + the 3-column shell. That is: every scene of play gets a live diorama with real
cast, real light, real persistence — built almost entirely from plumbing that exists. V3
asset packs grow post-launch behind swap-cheap seams (§II.0b all-art-is-placeholder). V4+
follow soak friction. This slice plus modest UI polish is the launchable wedge; nothing in it
waits on new art beyond the blank pieces and one mat per env.

## §8 Blind parity (BLIND-PLAYABLE FULLY — the tax stays paid, by construction)

Law §0.1 does the work: every staged piece maps to a state record, AND staging is further
gated on digest visibility (the §2 parity condition) — a record the digest suppresses (soft
ambient pre-contact) stages nothing beyond its aggregate presence line. Therefore the table
can never show what prose can't say. *(Skeptic-pass fix: the first draft claimed every state
record "already reaches" the digest — false; codex.js:410-420 deliberately suppresses
untouched ambient records. Visibility is a gate, not a given.)* Per-layer obligations: tray swaps announce as scene transitions (already narrated);
reveal-placements coincide with their narration beat (the same event drives both); the center
column is `aria-hidden` decoration and fully collapsible; acceptance gate remains one full
session via screen reader, screen off. A piece with no prose twin is a §0.1 violation — the
harness (§9) treats it as a hard failure, not a warning.

## §9 Acceptance gates + regression checks (rubric #7)

1. **Determinism (pure-function form):** identical world-state SNAPSHOT (segment + codex +
   traces) → identical tray (hash the piece list). Seed alone is NOT sufficient — cast and
   traces are state-dependent; a seed-only check would flake by design.
2. **Fallback never blocks:** delete/break any registry module → blank piece renders, prose
   unchanged, zero throws (extends the existing per-entry try/catch discipline).
3. **Anti-drift containment:** every staged piece's source ref resolves to a segment field /
   codex record / combat unit / trace event **that is digest-visible this turn** (skeptic-pass
   retarget: "has a state ref" alone passes for digest-suppressed records — the invariant blind
   parity needs is prose-reachability, not mere existence). No ref or a suppressed ref = hard
   failure.
4. **Atmo mutation check:** an atmo text stuffed with prop keywords must spawn zero props.
5. **Secret gating:** unrevealed `secret` stages nothing; the reveal event stages exactly one.
6. **Soft/painted swap + ambient parity (co-location rule):** entering a stage MUST fire the
   ambient-presence lines into the here-digest in the same event that stages the blank meeples
   (§2 — the digest rises to match the table); contact event swaps painted. A staged figure
   with no digest-side presence is a hard failure; so is an entered room whose ambient records
   stage nothing.
7. **Shell parity:** with the center column `display:none`, a scripted session (jsdom) completes
   identically; ARIA landmark order right→left verified.
8. **Perf:** tray assembly ≤250ms WARM on Adam's dev machine, where "assembly" = data
   projection + piece instancing with all builders preloaded (extend
   `loadWholeObjectBuilders` at boot — the prefetch doctrine — and ASSERT resolved before the
   budget window). V3+ asset packs get a separate cold-import budget declared per pack; no
   model call in the loop (SPEED).
9. **State hygiene:** renderer writes nothing to GS/U (mutation probe).
10. **No double-staging:** on `combat_start`, a noun already staged as a standing prop gains a
    cover/hazard tag — the piece count for that noun stays 1 (the §3 dedup law, mutation-tested
    with a feature text that matches both the prop and cover keyword rules).
11. **Live regions survive the hidden stage (skeptic-pass catch):** the dice overlay
    (`role="status"`, positioned over the board center) and every other `aria-live` element
    must live OUTSIDE the `aria-hidden` center subtree — an `aria-hidden` ancestor silently
    suppresses descendant announcements. Check: with the center column `aria-hidden`, a roll
    still announces its result via the live region.

## §10 Execution notes (post-Fable pipeline — spec-rubric handoff)

**→ The queue is now SPEC-LOCKED per-unit in `docs/TABLETOP-UNITS.md`** (2026-07-07, same
window) — exact seams file:line, locked payload shapes, acceptance gates mapped to §9,
mutation checks, effort tiers. Executors consume THAT doc; this section stays as the summary.
Sonnet-executable units, Opus review, per the established orchestration pipeline. Queue
(dependency order): **U1** `trayFrom` extraction + idle/standing table · **U2** 3-column
shell + ARIA (+ collapse) · **U3** blank-piece fallback + soft/painted swap · **U4** cast
tableau + arrangement grammar · **U5** overlay lanes (ambient mapping + trace events) ·
**U6** tray persistence via walk overlay + combat reconfigure/relax · **U7** harness pack (§9)
· then V3+ as asset-pack lanes (Blender pipeline authoring between sessions: core kit ~15
shapes once → dressing packs per archetype → centerpiece lane — the industry packaging model).
U1–U3 are mechanical-to-spec (low/med effort); U4–U6 need med; the harness and any theater-boot
surgery get high + review. Adam's taste ledger owns: tray/mat looks per realm, the blank-piece
sculpt, arrangement feel, and every asset-pack skim.

## §11 Adversarial pass (2026-07-07, same window)

Fable's self-attack, applied inline above; executors should know these were the sharp edges:
1. §0.1 re-grounded on **capture-not-origin** — the original wording would have made Charter
   §8.5 captured inventions permanently invisible.
2. **Ambient parity hole closed** (§2/§9.6): blank meeples staged from off-digest records
   would have shown sighted players what prose never said — the spec's own law, violated by
   its own prettiest doctrine. Fix: aggregate presence line joins the here-digest first.
3. **Proposal/disposal reconciliation** (§3): naive tray re-derivation resurrects defeated
   encounters on revisit.
4. **Tray source vocabulary widened** (§3): node trays added — the market scene the whole
   vision opens with happens at a node, which the first draft forgot to make stageable.
5. **Combat dedup law** (§3/§9.10): the cover keyword scan and the prop stager read the same
   text; without the one-noun-one-piece rule, every fight doubles its altars.
6. **V5 knowledge gate**: the parchment draws only known nodes or the map leaks the world.
7. Gates tightened: §9.1 determinism restated as a pure-function-of-snapshot property (seed-only
   would flake); §9.8 budget defined WARM + boot preload mandated. Honesty note added at §4
   (only urban has interactable tags today).

**Independent skeptic pass (Opus, against 9ee28ca) — adjudicated same window.** It converged
unprompted on fixes 1–3 above (parity hole, determinism gate, capture-not-origin) — strong
cross-validation. Four of its findings survived against the amended spec and are applied:
8. §3's "(walk rolls are seeded)" was FALSE — walk RNG is raw `Math.random()` persisted at
   generation; only lighting is seeded. Re-derivation-by-reseed would mint a different room.
9. The `aria-hidden` center column would have silently muted the dice overlay's live-region
   announcements (an `aria-hidden` ancestor suppresses descendant `aria-live`) — §1 + gate
   §9.11 now pin live regions outside the hidden subtree.
10. §9.3 retargeted from "has a state ref" to "has a DIGEST-VISIBLE state ref" (the weaker
   invariant went green on the exact parity break §0.1 forbids); §8's blanket "every record
   reaches the digest" corrected — visibility is a gate, not a given.
11. The mandatory SPEED rule-1 inference-cost declaration was missing — added at §1.
Rejected: its harsher parity fix (never stage ambient blanks) — the aggregate-presence-line
solution keeps inhabited scenes from reading empty while restoring parity; engine-authored
digest input is the normal engine→DM flow, not a Charter front-run. Its killed-findings list
(no-coordinates compliance, GS hygiene, atmo exclusion, one-surface combat) matches ours.

**Post-pass Adam rulings (2026-07-07, same window):** (1) DM-improvised staging is a licensed
long-run lane through the capture channels — V6 extended from pieces to whole scenes; (2)
co-location = visible: meeples stage when the player enters their room, and the DIGEST rises
to match the table (the meeple objectifies "who can I talk to"); (3) no resurrected dead, but
dead bodies are OK — corpse piece is the default disposition, absence only by event.

*Census appendix: `docs/reference/TERRAIN-CENSUS-2026-07-07.md` (the 8-system survey this
taxonomy is drawn from — piece classes, ratios, minimum vocabularies, the OpenLOCK spec).*
