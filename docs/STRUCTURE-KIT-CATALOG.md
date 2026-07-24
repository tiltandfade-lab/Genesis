---
type: design-spec
status: DRAFT — Adam redline pending (open redlines in §12)
created: 2026-07-24
owner: Fable (named writing task, NEXT-STEPS 2026-07-23 block, C1H opener)
related:
  - "[[MATERIAL-LANE]]"
  - "[[TRIM-SHEET-PIPELINE]]"
  - "[[BATTLEMAP-TOWNTRAY-COMPOSITION]]"
  - "[[C1A-CLAY-ROOM]]"
  - "[[CODEX-MATERIAL-BRIEF]]"
diagrams:
  - diagrams/structure-kit-roof-parapet-vocabulary.svg
  - diagrams/guard-post-anchor-layout.svg
---

# STRUCTURE-KIT CATALOG — the set-piece module contract for the twelve golden sites

The structure kit is the game's box of tabletop set-piece modules — legos in the polygon
language of Final Fantasy Tactics: simple low-poly masses, patched together to create the
illusion of a rich world with history, varying states, and beautiful tactical gameplay
(Adam, 2026-07-24). This catalog is the authored declarative source (the P11.3 pattern)
that defines what pieces exist, how they socket, what they demand from the material lane,
and how the procedural engine rolls them into infinite legal configurations.

Scope boundary: this catalog owns STRUCTURE (ground, shells, roofs, circulation). Furnishing
assemblies stay in the Wave-5/C1J lane; door leaves stay in the C1B door lane (this catalog
owns the doorframe socket they mount into); materials stay in MATERIAL-LANE (this catalog
states the demand).

## 1. Tone laws (Adam, 2026-07-24 — binding)

1. **Fun over reproduction.** The goal is fun environments for tactical strategy battles,
   not reproducing reality. Reality is inspiration; the map must be fun every time.
2. **The FFT masterclass rule.** If in doubt, consult the FFT battle maps
   (`Reference/FFT Battle Maps/`) — they are masterclasses in exactly the style of tactical
   map we are aiming for. Their core lesson: richness lives in the paint; geometry exists
   for silhouette and tactical truth.
3. **Near-universal access.** Pretty much every surface has some type of access for
   non-flying units — stairs, terracing, rocks, stacked crates, ladders.
4. **Simpler is better (for now).** Stairs, rocks, and terracing are preferred over
   ladders, because ladder movement is not yet designed. When it is, XCOM's climb
   mechanic (no cost punishment for vertical distance traversed) is the reference
   candidate, alongside the SRD athletics climb (§6).

## 2. Grid law (proposed numbers — redline R1)

- Horizontal cell: **5 ft** — the existing combat-grid cell. One floor tile = one cell.
- Vertical quantum: **h = 2.5 ft** (half-cell). Every standable surface sits at n×h.
- Storey height: **4h** (10 ft floor-to-floor, the SRD-standard ceiling).
- Parapet/merlon height: **2h** above the wall walk (cover-granting).
- Free step-up: **≤1h** costs nothing (stairs/terrace steps). 2h in one move = climb (§6).
- Walkable slope: **≤30°** (matches the uneven-ground proof's audited limit); steeper
  ground is "guarded slope" — visible, not standable.
- Terraces are ground at n×h with retaining faces; the wall walk is the same contract
  on top of a built piece. One law, two expressions
  (see `diagrams/structure-kit-roof-parapet-vocabulary.svg`, panel 3).

## 3. Two-tier grain (Adam ruling 2026-07-24)

- **Piece (fine tier):** the socketed atom — wall panel, floor tile, roof plane, stair run.
- **Assembly (chunk tier):** a named, taste-reviewed composition of pieces — "watchtower
  storey," "post-house bay," "yard gate." The procedural engine rolls at assembly level;
  the fine tier exists for patching, variation, and future assemblies.

Assemblies are how the FFT hand-built look survives procedural rolling: composition taste
is frozen into the assembly, the roller only chooses among proven assemblies and their
parameter ranges.

## 4. Six-face socket schema (candidate formalism — redline R2)

Every piece declares, per face (±X, ±Y, ±Z):

- **socket id** — from a small enumerated set (v1 proposal): `open` (exterior air),
  `wall-join`, `floor-join`, `roof-pitch-join`, `terrain-join`, `walk-surface`,
  `none` (sealed).
- **access class** — §6.
- **skin band** — which material/trim band paints this face (§8).

Blueprint validation (BLOCK gates, before any spawning — Adam's architecture review
2026-07-23): every socket pairing legal; an exit path exists; **every standable surface
reachable by a non-flying route** (§6 — the tone law made countable); slope law honored;
approach + gate present where the assembly demands them. A ruling is not recorded until
its enforcing check exists (teeth law): the reachability and socket checks land with the
first C1H validator; until then they are OWED, not claimed.

## 5. Geometry/paint split (Adam ruling 2026-07-24)

Gameplay-legible = geometry: doors/doorframes, arrow slits (shootable), windows
(climbable/sightline), merlons (cover), stairs, gates, retaining faces. Dressing = paint:
shutters, timber framing, signage, shingle pattern, mortar detail — trim-sheet bands,
decals, and MM field materials. FFT's division of labor, adopted as law.

## 6. Access classes — the SRD-native gradient (from the 2026-07-24 climb discussion)

SRD 5.2.1 already grades climbing (rules-glossary, quoted):

> "While you're climbing, each foot of movement costs 1 extra foot (2 extra feet in
> Difficult Terrain). … At the GM's option, climbing a slippery surface or one with few
> handholds might require a successful DC 15 Strength (Athletics) check."

Per-face access classes:

| class | meaning | mechanics | examples |
|---|---|---|---|
| `walk` | normal movement | no cost, no roll | floors, terraces via ≤1h steps, stairs |
| `climb-cost` | rough climbable | double movement, **no roll** (SRD baseline) | rock clusters, rubble, low walls, crate stacks |
| `climb-dc` | sheer/slippery | Athletics check, DC on the piece (default 15) | smooth curtain wall, wet cliff face |
| `ladder` | DEFERRED | movement undesigned; XCOM model candidate | — |
| `none` | inaccessible | — | overhangs, sealed faces |

**The shortcut law (proposed):** a `climb-dc` face may never be the ONLY route to a
standable surface. Validation guarantees full reachability through `walk` + `climb-cost`
alone; DC climbs are optional shortcuts and flanking spice. This preserves both the
universal-access tone law and the gamble's fun.

**The climb gamble (PARKED — post-MVP, Adam 2026-07-24):** player selects a `climb-dc`
face → DC prompt → margin-graded outcomes per the standing degrees-of-failure doctrine:
fail by 1–2 = lost grip (movement wasted, no fall); fail by 3+ = fall from current height
(SRD: 1d6 per 10 ft + Prone). Crits compose with the existing Crit-Magnitude system
(second-d20 spike) rather than minting new grammar; Adam's sketched rewards (regained
movement, bonus action) are natural lens outputs there. MVP ships classes `walk` +
`climb-cost` only — deterministic, FFT-legible — but every piece face carries its access
class from day one so the gamble layers on without retrofit.

## 7. Roof families + build order (Adam confirmed 2026-07-24)

Both families are in the kit; all forms arrive eventually. Build order:

1. **Parapet** — flat walk + merlon cap + coping + stair access. Easiest geometry, but it
   forces the height quantum, walkable-surface contract, access validation, and cutaway —
   the systems terracing and everything else reuse. Native to the guard post.
2. **Shed / lean-to** — the minimal pitched form: one plane. Teaches paint-on-slope, eave
   overhang, and the roof-meets-wall junction. The guard post's supporting rooms are sheds.
3. **Gable** — adds the ridge joint + gable-end wall variant. Unlocks domestic sites.
4. **Hip** — deferred past site 1; only new problem is corner joints; arrives with the
   institutional site that wants it (monastery/prison).

Vocabulary reference: `diagrams/structure-kit-roof-parapet-vocabulary.svg`.

## 8. Realm-skin axis + the material kit catalogue (bill of materials)

Pieces demand materials; materials never demand pieces. The guard post's CLOSED shopping
list (redline R8):

| demand | material | status |
|---|---|---|
| wall field | M01 coursed stone + M02 fitted rubble | ✅ 4 candidates exported (GP-MM-STONE-V001); Adam picks one of each |
| roof field (shed) | timber shingle/plank roofing | ☐ invent — next Codex batch |
| timber set | post / beam / door / lintel | ☐ invent — next Codex batch |
| interior floor | flagstone + plank | ☐ Wave-1 keys, already in CODEX-MATERIAL-BRIEF |
| exterior ground | grass / dirt / worn path | ◐ uneven-ground + meadow-road proofs carry the technique |
| trim bands | coping · base course · cornice (architecture-core-v1 roles) | ◐ layout proof landed; production bands owed |
| condition | age / erosion / wetness overrides | ◐ workbench proof landed; §5b roller spec owed |

Skin binding: realm/culture selects the material picks and trim variants
(CultureVisualConstitution → SiteCultureImprint per Wave 3); the rolled condition vector
selects override buckets (MATERIAL-LANE §5). Same fact drives texture, decals, and prose.

## 9. Guard-post shopping list (bill of pieces — PROPOSED, redline R4)

**Fine tier:** terrain slab (uneven-ground output) · terrace retaining face (1h/2h) ·
terrain stair cut · rock access cluster · floor plate · wall panel (solid) · wall panel
(arrow slit) · wall panel (window) · doorframe (C1B socket) · gate arch · parapet run
(merlons + coping) · wall-walk plate · built stair run · shed roof plane · eave trim ·
pillar/post · crate stack (access prop, shared with prop lane).

**Assembly tier:** watchtower storey · tower parapet cap · post-house bay · lean-to bay ·
yard wall run · yard gate · wall-walk stair · terraced yard.

**Growth ladder = degeneration chain (Adam + Fable, 2026-07-24):** rung A watchtower alone
→ rung B tower + post house → rung C walled yard. Built upward, each rung is a reviewed,
legal configuration; when the roller degenerates a small-budget site, it lands on a proven
rung. Rung A's rolled variety axes: footprint, storeys, cap (parapet/shed), materials,
condition.

## 10. Anchor layout (Codex recommendation — prose pending, redline R6)

First layout to build: **hillside guard facility with a road passing by it, and the guard
house's supporting rooms** (Codex, via Adam 2026-07-24 — exact wording not yet in-repo;
paste to supersede this reconstruction). The repo already carries its terrain halves:
`upland-ruin` (raised knoll · eroded gully · approach route · level pad) and `meadow-road`
(preserved travel lane) in `dev/uneven-ground-proof/`. Composition: knoll-top tower,
terraced approach, road skirting the base, shed-roofed supporting rooms in the yard.
Plan sketch: `diagrams/guard-post-anchor-layout.svg`.

## 11. The procedural hook + the twelve-site expansion

**Blueprint grammar:** rolled facts (site family, size, operating state, condition vector,
culture arrivals) → assembly selection under the growth-ladder budget → socket-resolved
blueprint → BLOCK validation (§4) → skin bind (§8) → render. The walk supplies the nouns.
Adam 2026-07-24: the walk works and is backed up, but will be heavily modified to serve
the procedural system; table-style editability is kept where cheap, not binding; what we
preserve is the walk's principle — wildly differing environments, conditions, situations,
histories — re-expressed through this grammar. MVP first, then layer.

**Vernacular matrix (PROPOSED, redline R5).** Sites shop from shared construction
vernaculars; each buys few signature pieces. The goal: after twelve sites, enough
procedural shape language to construct anything the game needs.

| # | golden site | vernacular | inherits | invents (signature) |
|---:|---|---|---|---|
| 1 | guard post | military-masonry | — (founding buy) | the entire core (§9) |
| 2 | camp / service | timber | shed, posts, terrain | palisade run, fire ring, tent props |
| 3 | dormant / abandoned | any + condition | full host kit | collapse/rubble pieces, breach |
| 4 | monastery / commune | dressed-institutional | walls, terraces | cloister arcade, hip roof, courtyard |
| 5 | mine / workshop | excavated | stairs, terraces, timber | tunnel portal, shoring frames, ramps |
| 6 | prison / institution | military + dressed | walls, parapet, gates | cell partitions, bar grating (cutout) |
| 7 | natural lair | natural | rock clusters, terraces | cave shell set (modular-cave donor) |
| 8 | infiltrated / layered | host site's | full host kit | concealed pieces (false wall, trapdoor — W4 secrets) |
| 9 | contested fortress | military-masonry | full site-1 kit | gatehouse, keep storeys, broken wall + gate (§10.3) |
| 10 | urban institution | town | walls, gable, timber | street frontage, plaza, stalls (TownTray direction) |
| 11 | mixed-scale / dragon | any | full kits | titan-scale (2×) piece variants, hoard terrain |
| 12 | anomalous / living / mobile | exotic | smallest structural buy | organic/impossible connectors; biggest skin buy |

## 12. Kenney donor law + provenance

CC0 donor grammar (17 kits at `assets/models/`, castle-kit and fantasy-town-kit primary
donors for site 1) supplies clay-phase stand-in geometry, admitted INTO the contract
(models-normalized, socket-tagged), swapped native piece-by-piece via the
ALL-ART-IS-PLACEHOLDER seam when beauty passes earn it. Every catalog entry carries
`provenance` (author/source/license/donor-file) and survives the swap.

## 13. Open redlines for Adam

- **R1** grid numbers (§2): h=2.5 ft, storey 4h, parapet 2h, slope 30°.
- **R2** socket id set (§4): is the 7-id set minimal-but-sufficient?
- **R3** climb DCs (§6): flat SRD 15, or per-class 12/15/17 banding?
- **R4** guard-post piece list (§9): cuts/adds.
- **R5** vernacular matrix (§11): assignments + which site carries hip roofs first.
- **R6** anchor layout (§10): paste Codex's exact wording; confirm reconstruction.
- **R7** climb gamble parked post-MVP (§6): confirm placement.
- **R8** material picks (§8): one M01 + one M02 from the GP-MM-STONE-V001 cards; roof
  material family for the shed planes.
