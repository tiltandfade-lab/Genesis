---
type: research-brief
status: READY FOR FABLE — 2026-07-29
scope: Final Fantasy Tactics × Triangle Strategy × current Genesis terrain/world rendering
owner: Adam rules · Fable researches and synthesizes · Codex supplied the brief
authority: research only — no canon promotion, implementation authorization, or target-art replacement
outputs: Reference/FFT-Triangle-Strategy-World-Study/
---

# FFT × Triangle Strategy World Study

## 0. Assignment in one paragraph

Determine, with terrain-dominant visual evidence rather than general impressions, what **Final
Fantasy Tactics** and **Triangle Strategy** share, where they materially differ, and which specific
choices make Triangle Strategy's world feel so beautiful without requiring Genesis to become a
large-map exploration game or a non-solo production. Translate the findings into a bounded Genesis
visual recipe: **FFT as the likely map-scale/composition ancestor; Triangle Strategy as the likely
environment-rendering/presentation benchmark; Genesis as a persistent, roll-authored, state-mutable
tabletop world that must remain its own thing.** Those are hypotheses to pressure, not conclusions
to decorate.

Fable should run the complete study in one research pass and return once with the full packet. Do
not stop after source acquisition unless genuinely blocked.

---

## 1. Why this study exists

Genesis has reached three connected founder conclusions:

1. Large overview boards create a traversal burden the game does not want.
2. Strong height, depth, world context, and site identity can still exist inside compact
   `MaterializationWindow` vignettes.
3. Triangle Strategy is extremely close to the desired graphics register, while FFT remains the
   closest map-design and tactical-composition cousin.

The binding movement doctrine supplied by Adam is:

> **"Players never walk merely to operate the game. Movement is visualized only when the journey
> itself contains decisions or consequences."**

The study must therefore explain **worldfulness without acreage**. It is not enough to say that
Triangle Strategy has nicer lighting, more polygons, or newer technology. The study must isolate:

- what is created by map topology and composition;
- what is created by geometry and material art;
- what is created by lighting, atmosphere, camera, and post;
- what is created by non-playable scenic context around the tactical floor;
- what is created by animation and presentation;
- what is expensive authored content versus a systemic renderer multiplier;
- what Genesis already has;
- what Genesis is genuinely missing; and
- what should be declined because it buys polish at the cost of solo-project viability or the
  movement doctrine.

This is also a wedge study. Genesis is not trying to become Triangle Strategy with procedural maps.
Its distinct promise is that rolled facts and player improvisation can produce persistent visible
consequences—material changes, decals, attachments, damage, repairs, occupation, and history—inside
those compact scenes.

---

## 2. Status and decision boundary

This is a **research brief**, not a system spec.

The returned study may:

- establish evidence;
- measure frames and maps;
- identify patterns;
- rank transferable techniques;
- propose experiments;
- present up to three map-size or camera options with tradeoffs;
- identify conflicts with current targets; and
- ask Adam a batched founder-question packet.

It may not:

- silently declare a definitive map cap;
- replace the current Golden Site small / medium / large-site-vignette ruling;
- revive the archived extra-large overview boards;
- authorize a graphics implementation wave;
- rewrite the terrain engine;
- change the camera;
- replace sprites or materials;
- promote an inference into canon;
- generate new target art;
- copy a copyrighted map, texture, mesh, sprite, layout, or other game asset; or
- turn a single attractive screenshot into a general law.

Any recommended change remains `PROPOSED` until Adam rules it.

---

## 3. Authorities and required reading

Read these in order before acquiring or interpreting images:

1. `CLAUDE.md`
2. `docs/HANDOFF.md` — newest current block only
3. `docs/canon/README.md`
4. `docs/ART-DIRECTION-CANON.md` — mandatory visual-review authority; read completely
5. `docs/ART-DEPARTMENT.md` — sprite register and production cost boundary
6. `docs/GRAPHICS-CONVERGENCE-CHARTER.md`
7. `Reference/Golden-Site-Ideal-Art/README.md`
8. `Reference/Golden-Site-Ideal-Art/scale-pass-2026-07-28/README.md`
9. `Reference/Golden-Site-Ideal-Art/scale-pass-2026-07-28/PROMPT-SET.md` — especially the
   active-window amendment and archived-extra-large boundary
10. `docs/BATTLEMAP-TOWNTRAY-COMPOSITION.md`
11. `Reference/FFT-Guard-Post-Study/README.md`
12. `Reference/FFT-Guard-Post-Study/analysis/FFT-TO-GENESIS-RELATIONAL-SHAPE-GRAMMAR-STUDY.md`
13. `docs/BEAUTY-WAVE-3.md`
14. `docs/SPRITE-BILLBOARD-RESEARCH.md`
15. `Reference/Urban-Study/lane-6-touchstones.md` — Triangle Strategy's Wolffort findings
16. `docs/GOLDEN-SITE-WORLD-CONTEXT-PROJECTION.md`

Then locate the **current** terrain-engine authority rather than assuming this worktree contains it:

```text
git worktree list
```

Inspect the current terrain-related sibling worktrees read-only—expected names include
`Genesis-terrain`, `Genesis-terrain-surface`, `Genesis-clayspec`, or their successors. Read the
owning brief/spec and current handoff in whichever worktree is actually active. Record the branch,
HEAD commit, and source paths used. Never edit another lane's worktree.

### Existing findings are priors, not answers

The prior docs already argue that:

- lit sprites, tilt-shift depth of field, selective bloom, realm grade, and atmospheric coupling are
  important HD-2D integration techniques;
- FFT uses compact rotational dioramas and a strict small-board discipline;
- Triangle Strategy's camera and sprite-direction needs carried material production cost; and
- Wolffort Streets uses elevation, rooftops, pre-battle interaction, removable stalls, and staged
  environmental consequences.

The study must **verify, delimit, or overturn** those claims with the new controlled corpus. Do not
restate them as discoveries merely because they are true.

---

## 4. Core hypotheses to pressure

Each hypothesis must receive a final disposition of `SUPPORTED`, `SUPPORTED WITH LIMITS`,
`CONTRADICTED`, or `INSUFFICIENT EVIDENCE`.

### H1 — The ancestor split

FFT supplies the stronger model for **playable footprint, topology, tactical height, negative space,
and compact-diorama composition**. Triangle Strategy supplies the stronger model for **environmental
surface treatment, scene integration, light, atmosphere, context, and presentation**.

### H2 — Beauty is coordinated, not additive

Triangle Strategy's beauty comes primarily from coordination among geometry scale, pixel-texture
frequency, palette, sprite treatment, lighting, atmosphere, and framing—not from any one effect and
not from raw asset count.

### H3 — Worldfulness does not require a large traversable floor

Triangle Strategy often implies a much larger place through non-playable context, vertical envelope,
cutaways, background continuations, weather, and framing while keeping the consequential tactical
area bounded.

### H4 — Height can substitute for acreage

Two or three concentrated elevation bands, short vertical routes, retaining faces, wall thickness,
undercrofts, overlooks, and clipped continuations can produce more perceived depth than a broad
mostly-flat board.

### H5 — The camera is a production multiplier

Camera freedom improves inspection and tactical clarity but sharply increases sprite-direction,
occlusion, hidden-face, texture, model, and QA costs. Genesis's fixed or tightly constrained camera
may preserve most of the desired look at a fraction of the production burden.

### H6 — Genesis already owns conspicuous HD-2D effects

The current renderer already covers enough of lighting response, DoF, bloom, grading, contact,
sprites, and terrain formation that the next gap is likely **coherence, material/surface language,
architecture-anchored dressing, and composition**, not simply another post effect.

### H7 — FFT economy remains a strength

FFT's fewer, larger forms and restrained dressing are not merely obsolete limitations. They are a
readability and production-economy advantage that Genesis should preserve beneath modern surface and
lighting treatment.

### H8 — Genesis's distinct wedge is visible consequence

Neither model game is the final target for a world where a player's improvised act can visibly and
persistently repaint a cart, clear a stall, brace a wall, scorch a threshold, change an authority
mark, or leave a remembered battle trace. Genesis should spend some of the production savings from
compact maps and constrained camera on this stateful visual layer.

---

## 5. Questions the study must answer

### 5.1 Scale, footprint, and pacing

1. What are the actual playable dimensions of the sampled FFT maps?
2. What are the actual or best-estimated playable dimensions of sampled Triangle Strategy maps?
3. How much of each final frame is playable floor versus non-playable scenic envelope?
4. How far is deployment from the first consequential choice?
5. How long are the longest mandatory approach, retreat, and likely backtrack paths?
6. How many cells are empty but compositionally useful?
7. How many elevation bands are consequential rather than merely decorative?
8. How do both games imply a place larger than the active fight?
9. Which maps feel large despite a small floor, and why?
10. Do the current Genesis targets—roughly `12×16`, prompt ceiling `16×18`, with tighter
    `10×14` refinements—look too small, too large, or correctly bounded when compared under the
    same camera and standee scale?

The study may recommend a size band, but it must not silently convert the sample into an absolute
cap. If it recommends a cap, provide no more than three options and show the pacing, visual, tactical,
and production tradeoff of each.

### 5.2 Topology and tactical composition

1. How many primary routes, alternate routes, branch points, chokepoints, and short loops does each
   map contain?
2. What proportion of height is reachable, contestable, or scenery-only?
3. How are stairs, ladders, ramps, roofs, ledges, bridges, drops, and underpasses distributed?
4. Does a map's focal object sit in the center, at a head, across a threshold, or above/below the
   deployment plane?
5. How often does terrain establish the tactical problem before enemies are considered?
6. How do maps avoid becoming corridors or empty rectangles?
7. How do they make a compact map support ranged, melee, flying, and support roles?
8. What does each game do with occluded cells and hidden enemies?
9. What topological features survive a fixed-camera translation?
10. Which attractive arrangements depend on bespoke authoring and would fail procedural generation?

### 5.3 Geometry and shape language

1. How many major silhouette masses carry a frame?
2. What is the average apparent size of one meaningful terrain mass relative to a 5-foot cell?
3. Where does geometry create a real route, cover, or height relation, and where does paint merely
   imply detail?
4. How thick are walls, retaining faces, roofs, stairs, platforms, and parapets relative to units?
5. How are natural terrain and constructed geometry joined?
6. How are vertical faces broken up without becoming noisy?
7. How are cutaways, roofs, upper floors, and interiors made camera-safe?
8. How much beveling, faceting, or silhouette irregularity is visible at gameplay scale?
9. What is repeated modularly, and what appears map-specific?
10. Which differences are PS1-era constraints, and which are durable art-direction choices?

### 5.4 Materials, textures, palette, and surface frequency

1. Are environment textures pixel-authored, painterly, procedural-looking, or materially realistic?
2. What is the apparent texel/pixel frequency relative to a cell and to a character sprite?
3. How many broad material families appear in one frame?
4. How are adjacent materials separated—value, hue, edge, roughness response, trim, or geometry?
5. How much visual information lives in albedo versus lighting versus decals?
6. How are wear, water, grime, traffic, cracks, paint, and history localized?
7. How wide is each game's usable value range? Where do blacks and whites stop?
8. How saturated are focal objects, units, terrain, effects, and background context relative to one
   another?
9. Does Triangle Strategy's world remain beautiful in neutral light, or is post carrying weak base
   art?
10. Which surface rules could be generated from Genesis facts:

```text
material + construction + culture + realm + age + condition
+ moisture + damage + magic + narrative emphasis
```

### 5.5 Lighting, atmosphere, camera, and post

1. What is the camera projection, pitch, yaw, field of view/orthographic feel, and default framing?
2. How far can the player rotate or zoom, and what content/QA costs follow?
3. What is the dominant key-light direction and softness?
4. How much ambient fill preserves readable shadows?
5. Are practical lights physically owned by fixtures?
6. How are contact shadow, AO, wall/riser darkening, and grounding used?
7. Where are DoF, bloom, vignette, fog, weather, particles, and color grade visible?
8. Which effects apply to the playable floor versus the scenic envelope?
9. How is the action kept sharp while the world around it becomes atmospheric?
10. Which post effects still work when maps are very compact, and which accidentally blur needed
    tactical information?

### 5.6 Sprites as citizens of the scene

1. How are sprite scale, pixel density, palette, outlines, and pose matched to the environment?
2. Do sprites receive scene lighting, fog, grade, shadow, or a readability floor?
3. What grounds feet—shadow, base, contact patch, or animation?
4. How many directional states are used or documented?
5. How are sprites handled during camera rotation?
6. How does each game prevent sprites from disappearing against roofs, snow, stone, fire, or darkness?
7. What does the sprite art already bake in, and what does the renderer add?
8. How much animation materially contributes to perceived polish?
9. Which animation is essential for readability, and which is expensive flourish?
10. What can Genesis retain with crisp standees and minimal animation while still making them belong?

### 5.7 Diorama edge, world context, and false affordance

1. How does each map end—hard board edge, drop, fog, wall, water, scenery, crop, or continuation?
2. How much foreground, middle-ground, and far-field context is used?
3. Does background context show real destinations or purely scenic world?
4. How does the game distinguish playable routes from non-playable apparent routes?
5. How are adjacent streets, valleys, towers, buildings, coastlines, and horizons implied?
6. How does the frame remain a vignette rather than a floating test board?
7. Which context is geometry, which is a card/plate, and which is atmosphere?
8. What scenic context would be unsafe for Genesis because it invents rolled facts or false exits?
9. What minimum context makes a compact board feel embedded in a persistent world?
10. Can linked compact windows feel like one large site without requiring backtracking through
    already-solved ground?

### 5.8 State, interaction, and visible consequence

1. Which maps or sequences visibly change before, during, or after battle?
2. What changes through geometry, material, decal, prop/attachment, animation, or VFX?
3. Are changes persistent, battle-local, story-scripted, or reversible?
4. Which environment elements function as switches, objectives, destructible cover, hazards, or
   social consequences?
5. How legible are the before and after states?
6. Which changes require a unique authored asset, and which reuse a generic mutation channel?
7. What would it take for Genesis to honor a freeform action such as disguising a cart without a
   bespoke scene branch?
8. What per-object state must exist for only one cart, wall, stall, or threshold to change?
9. Which visible changes also need collision, cover, access, ownership, or NPC-reaction updates?
10. What is the minimum mutation vocabulary Genesis needs:

```text
decal · material override · attachment/prop · geometry/structural state
damage/repair · light/emission · occupancy/authority · temporary VFX
```

This lane is not a request to build that system. It is the visual evidence and translation needed
to spec it honestly later.

### 5.9 Production economy and solo-project viability

1. Which techniques are per-map authored work?
2. Which techniques are reusable renderer multipliers?
3. Which techniques require large sprite or animation teams?
4. Which depend on 360-degree camera coverage?
5. Which depend on unique textures or unique environmental models?
6. Which can be produced from Genesis's existing donors, procedural geometry, material recipes,
   decals, and context cards?
7. What visual density can a small Three.js project plausibly maintain?
8. Which five techniques deliver the greatest improvement per unit of ongoing content labor?
9. Which admired features should Genesis explicitly decline?
10. Where should Genesis spend its uniqueness budget instead?

Do not estimate Triangle Strategy's staffing, budget, or labor from appearance. Use documented
credits/interviews where available; otherwise state that production scale is unknown.

---

## 6. Source and image acquisition protocol

### 6.1 Source hierarchy

Use sources in this order:

1. developer interviews and technical presentations;
2. official game sites, official trailers, official screenshots, and official art books;
3. lawful local/player-owned captures, if present;
4. reputable press gameplay captures and video;
5. guide/wiki material for map identification, objectives, or documented interactions; and
6. community material only when no stronger source exists, clearly labeled.

Reject or separately quarantine:

- AI-generated recreations;
- fan art;
- mods and remakes mistaken for the shipped game;
- Pinterest and untraceable reposts;
- tiny search-result thumbnails;
- cinematic closeups that hide the terrain;
- character portraits;
- marketing key art;
- menu-only images;
- images with so much UI or effect coverage that the map cannot be read;
- phone photos of a display when native frames exist; and
- upscaled or sharpened images presented as native evidence.

### 6.2 The terrain-image gate

The user has explicitly warned that better terrain images exist than the first obvious examples.
Therefore:

- Do not stop at the first two usable images.
- Do not select sources by filename or search ranking alone.
- Build a candidate inventory first, then visually inspect candidates.
- Prefer full-map, high-angle, terrain-dominant gameplay frames.
- Prefer a neutral/default gameplay view plus at least one useful rotated view.
- Where effects obscure the scene, acquire a second frame from the same map.
- Record why every final frame was selected and why obvious alternatives were rejected.

No synthesis may begin until the terrain-image gate passes.

### 6.3 Copyright and repository boundary

FFT and Triangle Strategy images are copyrighted reference evidence. They may be studied locally but
must not become Genesis production assets.

- Store temporary/raw copyrighted captures under:
  `Reference/FFT-Triangle-Strategy-World-Study/local-captures/`
- That path is gitignored.
- Commit URLs, titles, map identities, timestamps, hashes where useful, measurements, original
  diagrams, and written findings.
- Do not commit screenshots, copied texture crops, traced textures, ripped game assets, or contact
  sheets containing copyrighted game frames.
- A local comparison sheet may be generated for analysis but remains untracked.
- Public-domain or permissively licensed non-game references may be committed only with a complete
  license ledger, though this study should not need a broad historical-image lane.

No disc image, ROM, Switch package, extracted Triangle Strategy asset, or other private game data
belongs in the repo.

### 6.4 Starting technical/developer sources

These are starting points, not a sufficient corpus:

- FFT 1997 Famitsu developer interview translation:
  <https://shmuplations.com/fft/>
- Triangle Strategy pixel-art interview with Square Enix pixel artist Shizuka Morimoto:
  <https://www.ndw.jp/trianglestrategy_pixelart-interview/>
- Triangle Strategy producer interview discussing FFT influence and camera challenge:
  <https://www.destructoid.com/triangle-strategy-interview-producers-asano-arai-square-enix-hd-2d-tactics-rpg/>
- Existing Genesis HD-2D sources already cited in `docs/SPRITE-BILLBOARD-RESEARCH.md`
- Existing FFT five-angle corpus and its acquisition ledger under
  `Reference/FFT-Guard-Post-Study/`

For technical claims found through web search, prefer primary developer material. For visual
observations, the frame itself is evidence; label interpretation as inference.

---

## 7. Corpus design

### 7.1 Three comparison columns

Keep these distinct:

| column | job in the study |
|---|---|
| **FFT original / War of the Lions-era map evidence** | topology, compactness, silhouette economy, hand-drawn/low-poly register, diorama framing |
| **FFT: The Ivalice Chronicles Enhanced**, where a matched scene is available | controls for what a modern rendering pass can change without replacing the original map |
| **Triangle Strategy** | HD-2D environmental treatment, camera, materials, context, atmosphere, sprite integration, modern presentation |

Do not blend original FFT and Ivalice Chronicles frames into one unlabeled bucket.

### 7.2 Breadth corpus

Before choosing exemplars, inventory at minimum:

- **FFT:** 18 distinct shipped maps, using at least three useful views per map from the five-angle
  corpus where available;
- **Triangle Strategy:** 18 distinct battle maps, with at least two terrain-readable views per map
  where capture evidence permits;
- **Ivalice Chronicles Enhanced:** six matched or near-matched FFT maps, if lawful terrain-readable
  evidence is available;
- **Genesis:** eight current terrain/world captures from the actual current worktrees, spanning
  natural terrain, constructed terrain, height, materials, sprites, and at least one compact Golden
  Site target or implementation capture.

These are minimums, not selection targets. Inspect more candidates when the first set is weak.

### 7.3 Final matched cohort

Select twelve comparison packets. Exact one-to-one thematic matches are preferred but must not be
forced. Use:

1. flat or gently rolling open field;
2. steep hill/cliff wilderness;
3. forest or organic terrain;
4. bridge, canal, shore, or water crossing;
5. snow/ice or low-value environmental control;
6. urban street or market;
7. fortified gate, wall, or castle approach;
8. monastery, sacred institution, or formal court;
9. industrial, mine, salt, workshop, or infrastructure map;
10. dense interior, courtyard, or roofed map;
11. maximum-verticality stress case; and
12. deliberately quiet/sparse low-complexity control.

If one game lacks a defensible match, use the nearest functional comparison and mark
`NON-HOMOLOGOUS`. A declared gap is better than a false pair.

### 7.4 Golden Site application matrix

After the matched cohort is analyzed, pressure the conclusions against all twelve Golden Site
portfolio roles:

1. Guard Post
2. Camp / Service
3. Dormant
4. Monastery / Commune
5. Mine / Workshop
6. Prison / Custody
7. Natural Lair
8. Layered Control
9. Contested Fortress
10. Urban Institution
11. Mixed Scale
12. Substrate / Anomalous-Living-Mobile

Do not pretend Triangle Strategy or FFT contains a direct example of every role. The matrix asks
which **visual rule** transfers, not which copyrighted map Genesis should imitate.

---

## 8. Genesis capture inventory — mandatory current-state audit

The checked-in
`Reference/Golden-Site-Ideal-Art/scale-pass-2026-07-28/source-references/current-terrain-engine-two-tray-reference.png`
is a starting pointer, not automatically the best or newest terrain evidence.

Fable must:

1. run `git worktree list`;
2. identify active terrain/graphics worktrees and their HEAD commits;
3. search those worktrees for recent PNG/JPG/WebP captures under `dev/`, `Reference/`, and
   `ui-sketches/`, excluding dependencies and archives;
4. visually inspect the plausible terrain captures;
5. record a candidate inventory;
6. select at least eight that collectively show the current engine's strongest and weakest terrain
   behavior; and
7. identify stale captures rather than grading current work against them.

The returned `GENESIS-CAPTURE-INVENTORY.md` must include:

| field | requirement |
|---|---|
| path | absolute local path plus repo-relative path when applicable |
| worktree / branch / commit | exact source state |
| captured date | filesystem or receipt date, labeled |
| fixture / seed / mode | when known |
| visual channels exercised | geometry, material, light, sprite, context, post, etc. |
| current or stale | with reason |
| selected or rejected | with reason |
| what it can prove | narrow claim only |
| what it cannot prove | explicit limitation |

Never grade a work-in-progress terrain branch from a single weak debug frame when stronger current
captures exist.

---

## 9. Measurement protocol

### 9.1 Evidence record per map

Every final cohort map receives one row in `data/MEASUREMENTS.csv` and one human-readable evidence
card. Use `unknown`, `not measurable`, or an estimate range when necessary; do not invent precision.

Minimum fields:

```text
game
version
mapName
chapterOrId
sourceUrls
sourceType
captureView
nativeOrRescaled
playableWidthCells
playableHeightCells
traversableCellEstimate
framePlayableAreaPct
frameScenicContextPct
spawnToFirstDecisionCells
longestMandatoryApproachCells
likelyBacktrackCells
elevationBandCount
maxConsequentialElevationDelta
majorRouteCount
alternateRouteCount
shortLoopCount
chokepointCount
reachableHighGroundCount
sceneryOnlyHighMassCount
majorSilhouetteMassCount
broadMaterialFamilyCount
dominantTexelFrequencyEstimate
practicalLightCount
foregroundLayerPresent
midgroundLayerPresent
farFieldPresent
cameraRotationRange
cameraZoomRange
spriteDirectionEvidence
dynamicStateEvidence
notes
confidence
```

### 9.2 Measurement honesty

- Cell counts may be exact when the grid is visible or map data is documented.
- If perspective/occlusion prevents an exact count, record a range and the method.
- Percentages may be estimated from a mask, but label the mask method.
- Never infer roughness, normal maps, PBR workflow, dynamic lighting, or shader architecture from a
  screenshot alone.
- Never infer production labor from polygon count or apparent detail.
- A developer quote proves what it says, not every adjacent interpretation.
- A guide proves documented gameplay behavior, not art-production intent.
- One map establishes a candidate pattern; recurrence across the cohort establishes a stronger one.

### 9.3 Required local analytical views

For every final matched packet, create local untracked analytical plates containing:

1. full gameplay frame;
2. playable-floor mask;
3. grayscale/value view;
4. silhouette/major-mass view;
5. elevation/route markup;
6. foreground/middle-ground/far-field markup;
7. material-family annotation; and
8. sprite/action focal hierarchy.

These plates remain local when they contain copyrighted pixels. Commit the measurement rows,
original simplified diagrams, and conclusions, not the screenshot plates.

### 9.4 Three visual tests

Apply these consistently:

**The thumbnail test.** At contact-sheet scale, can one read arrival, objective/focus, route,
height, and exits?

**The grayscale test.** Do units, routes, objectives, high ground, and dangerous drops remain
separable without hue?

**The post-off thought experiment.** Based on neutral frames or the best available evidence, which
qualities are carried by base geometry/material art and which depend on atmosphere/post? If no
post-off evidence exists, label the result `INFERENCE`; do not fake an ablation.

---

## 10. Research lanes and required output files

Create the returned packet at:

```text
Reference/FFT-Triangle-Strategy-World-Study/
```

### Lane 0 — Corpus, provenance, and prior-finding audit

Files:

- `README.md`
- `SOURCE-LEDGER.md`
- `CORPUS-INVENTORY.md`
- `PRIOR-FINDINGS-AUDIT.md`
- `GENESIS-CAPTURE-INVENTORY.md`
- `data/MEASUREMENTS.csv`

Tasks:

- acquire and classify the corpus;
- pass the terrain-image gate;
- distinguish game versions;
- inventory current Genesis captures across worktrees;
- list prior Genesis HD-2D/FFT findings as `VERIFIED`, `NARROWED`, `UNTESTED`, or `OVERTURNED`;
- record license/copyright boundaries; and
- document gaps before analysis begins.

### Lane 1 — Footprint, topology, pacing, and tactical height

File: `lane-1-footprint-topology-pacing.md`

Deliver:

- exact/estimated size comparison;
- first-decision distance and backtrack analysis;
- route/loop/chokepoint comparison;
- reachable versus scenic height;
- empty-space analysis;
- compactness versus tactical diversity;
- FFT 16×16 claim verification and limits;
- current Genesis size-band comparison; and
- no more than three proposed size policies, only if evidence warrants them.

### Lane 2 — Geometry and environmental shape language

File: `lane-2-geometry-shape-language.md`

Deliver:

- major-mass grammar;
- natural-versus-built interlock;
- vertical-face and retaining treatment;
- stair/ramp/ledge/roof grammar;
- geometry-versus-paint split;
- modular repetition evidence;
- camera-safe cutaway/occlusion methods;
- durable FFT economy versus legacy hardware constraints; and
- a Genesis geometry translation table.

### Lane 3 — Materials, pixel texture, palette, and surface history

File: `lane-3-material-texture-palette.md`

Deliver:

- texture-frequency comparison relative to cell and sprite;
- palette/value/saturation comparison;
- broad material-family counts;
- material-separation methods;
- localized wear/decal/history treatment;
- how Triangle Strategy's 3D environment is made visually compatible with pixel figures;
- which current Genesis surface behavior already aligns;
- which gaps belong to material recipes rather than geometry or post; and
- a small set of measurable Genesis surface rules.

### Lane 4 — Light, atmosphere, camera, and post

File: `lane-4-light-atmosphere-camera-post.md`

Deliver:

- camera comparison and production consequences;
- key/fill/contact/practical-light analysis;
- DoF, bloom, fog, particles, weather, vignette, and grade analysis;
- action-sharp/world-soft framing;
- occlusion and rotation behavior;
- post effects that materially help versus decorative polish;
- a current Genesis feature crosswalk; and
- a ranked list of the smallest remaining renderer corrections.

### Lane 5 — Sprite citizenship, animation, and readability

File: `lane-5-sprite-citizenship-animation.md`

Deliver:

- sprite/environment pixel-frequency relationship;
- palette and outline relationship;
- lighting/fog/grade/contact behavior;
- direction and camera-rotation requirements;
- essential animation versus flourish;
- documented production constraints;
- comparison against current Genesis standees; and
- a solo-viable sprite-citizenship prescription.

### Lane 6 — Diorama edge and worldfulness without acreage

File: `lane-6-diorama-worldfulness.md`

Deliver:

- playable-floor/scenic-envelope ratios;
- edge-treatment taxonomy;
- foreground/middle-ground/far-field use;
- false-affordance controls;
- larger-place implication methods;
- linked-window continuity;
- how height creates perceived depth;
- how to avoid empty approach acreage; and
- at least six compact-vignette depth recipes suitable for Genesis.

Candidate recipe form:

```text
ARRIVAL LANDING
  -> first decision within 1–3 moves
  -> one short rising route
  -> one lower/hidden service route
  -> one clipped honest continuation
  -> one scenery-only high mass
  -> near-field context + far-field premise
```

These are relational recipes, never copied layouts.

### Lane 7 — State, mutation, and visible consequence

File: `lane-7-state-mutation-consequence.md`

Deliver:

- documented environment-change examples;
- before/after legibility;
- scripted versus systemic change;
- mutation-channel taxonomy;
- per-instance state implications;
- mechanical consequences that must accompany visible changes;
- cart-disguise worked example using SRD resolution plus renderer state;
- minimum viable mutation vocabulary; and
- failure cases such as changing every shared cart material at once.

The worked cart example should explicitly separate:

```text
player intent
  -> SRD action/check/tool resolution
  -> canonical object-instance state
  -> decal/material/attachment/geometry realization
  -> collision/cover/ownership/NPC-reaction consequences where applicable
  -> persistence/expiry/provenance
```

### Lane 8 — Production economy and the solo translation

File: `lane-8-production-economy-solo-translation.md`

Deliver:

- systemic multiplier versus per-map authored-cost matrix;
- camera-cost analysis;
- asset/texture/animation reuse evidence;
- known documented production facts;
- unknowns declared plainly;
- `MUST HAVE`, `HIGH LEVERAGE`, `EXPENSIVE/LATER`, and `DECLINE` buckets;
- a five-item highest-return solo-project stack; and
- a five-item list of places Genesis should spend saved labor on its own wedge instead.

### Lane 9 — Current Genesis adversarial gap audit

File: `lane-9-genesis-gap-audit.md`

Judge the **current** terrain/rendering state against the evidence, using the selected current
captures and exact source revisions.

For each visual channel, record:

| channel | current evidence | FFT target contribution | Triangle Strategy target contribution | actual gap | smallest corrective experiment | confidence |
|---|---|---|---|---|---|---|
| topology | | | | | | |
| terrain mass | | | | | | |
| constructed geometry | | | | | | |
| materials | | | | | | |
| decals/history | | | | | | |
| props/dressing | | | | | | |
| light/contact | | | | | | |
| atmosphere/post | | | | | | |
| sprites | | | | | | |
| context/edge | | | | | | |
| camera/composition | | | | | | |
| state mutation | | | | | | |

Do not reward a feature for existing if the selected captures show it does not yet produce the
desired read. Do not call something absent without inspecting the implementation/captures that own
it.

---

## 11. Synthesis requirements

File: `synthesis.md`

The synthesis must lead with conclusions, not the research diary.

### 11.1 The definitive comparison

Provide a compact table:

| dimension | FFT | Triangle Strategy | Genesis direction |
|---|---|---|---|
| playable scale | | | |
| topology | | | |
| geometry | | | |
| materials | | | |
| lighting/post | | | |
| sprites | | | |
| world context | | | |
| state change | | | |
| camera cost | | | |
| production economy | | | |

### 11.2 Hypothesis dispositions

Dispose H1–H8 individually with evidence and confidence.

### 11.3 The beauty stack

State, in order, the observed layers that make Triangle Strategy beautiful. For each layer identify:

- evidence;
- whether FFT already has an ancestor of it;
- whether Genesis already has it;
- whether it is a renderer multiplier or ongoing authored burden;
- the smallest Genesis experiment; and
- what failure would disprove the proposed value.

### 11.4 The compact-world recipe

Answer plainly:

> How can Genesis make a compact vignette feel like a beautiful, deep, persistent world without
> making the player walk through empty or already-solved space?

The answer must cover spatial, visual, transition, and persistence methods.

### 11.5 Transfer and anti-transfer

Deliver:

- **10 rules to take from FFT**
- **10 rules to take from Triangle Strategy**
- **10 things not to copy**
- **5 ways Genesis remains visibly and mechanically different**

### 11.6 Ranked Genesis experiments

Propose at most five experiments, ordered by information value rather than ambition.

Each experiment needs:

```text
question
current fixture/seed
one controlled change
required captures
comparison target
pass/fail visual read
performance or production budget
what decision the result unlocks
```

Favor controlled A/B proofs over broad implementation waves.

At least one experiment must test:

- compact height/depth without extra acreage;
- material/texel-scale coherence;
- world-context embedding without false routes; and
- one per-instance visible state mutation.

Experiments are recommendations only; the study does not execute them.

### 11.7 Golden Site application

For all twelve Golden Site roles, provide:

- strongest relevant FFT rule;
- strongest relevant Triangle Strategy treatment;
- compact-window implication;
- likely engine channel;
- solo-cost risk; and
- any conflict with the active target renders.

Do not generate replacement images. Flag conflicts for later review.

### 11.8 Founder packet

Batch no more than ten questions for Adam. Ask only questions that materially change the result.
Each question should have:

- the evidence;
- two or three real options;
- Fable's recommendation;
- the production/gameplay tradeoff; and
- what can proceed regardless.

Do not ask Adam to rule things the evidence already settles or implementation can test cheaply.

---

## 12. Finding format and confidence discipline

Every major finding should use this shape:

```text
FINDING ID:
Claim:
Evidence:
Observed in:
Counterexample / limit:
Evidence class: direct frame | developer statement | documented gameplay | inference
Confidence: high | medium | low
Genesis translation:
Solo-cost class: renderer multiplier | reusable asset/system | recurring authored labor | unknown
Decision status: research finding only
```

Use exact map names/ids and source references. If a claim rests on only one frame, say so.

### Evidence language

- **Observed:** directly visible or measured.
- **Documented:** stated by a developer or reliable gameplay source.
- **Inferred:** reasoned from observed evidence.
- **Proposed:** a Genesis translation not present in the source.
- **Unknown:** not established.

Avoid “clearly,” “obviously,” “probably,” and “the developers must have” unless followed by actual
evidence.

---

## 13. Acceptance gates

The packet is complete only when all gates pass.

### A. Corpus gate

- ≥18 distinct FFT maps inventoried
- ≥18 distinct Triangle Strategy battle maps inventoried
- ≥6 Ivalice Chronicles Enhanced comparisons where available, or a declared acquisition gap
- ≥8 current Genesis captures visually inspected across actual current worktrees
- 12 final comparison packets
- terrain-image selection/rejection reasons recorded

### B. Provenance gate

- every external source has title, URL, type, access date, and use
- game/version/map identity is explicit
- copyrighted captures remain untracked
- no ripped asset enters the repository
- no AI-generated or fan-made image is treated as shipped-game evidence

### C. Measurement gate

- one `MEASUREMENTS.csv` row per final map
- exact versus estimated fields distinguished
- no invented precision
- every quantitative synthesis claim traces to rows or a direct source
- local analytical plates exist for all 12 packets, though copyrighted plates remain untracked

### D. Comparison gate

- map design, geometry, surface, light/post, sprites, context, mutation, and production are analyzed
  separately before synthesis
- original FFT and Ivalice Chronicles Enhanced are not conflated
- at least one quiet/low-complexity control prevents “more stuff = better” reasoning
- at least one maximum-verticality control tests height without acreage
- counterexamples and non-homologous pairs are named

### E. Genesis gate

- current terrain source revisions are recorded
- better/newer terrain images were actively sought and visually reviewed
- stale debug frames are not treated as current quality
- existing features are credited accurately
- existing-but-visually-weak features are still allowed to fail the visual audit
- the five recommended experiments are bounded and executable

### F. Solo-project gate

- every recommendation is classified by ongoing labor, not only implementation difficulty
- camera/sprite-direction cost is explicit
- recurring bespoke map art is separated from reusable systemic value
- at least five admired features are consciously declined or deferred
- the recommended stack is plausible for a solo owner using procedural tools and AI assistance

### G. Honesty gate

- H1–H8 all receive explicit dispositions
- acquisition gaps are declared
- source weakness is declared
- inference never masquerades as engine fact
- no map-size cap or art-direction change is silently ruled
- no conclusion depends on one beauty screenshot

### H. Return gate

The return message to Adam must contain:

1. the packet path;
2. the one-paragraph verdict;
3. the five most important findings;
4. the five recommended experiments;
5. any current-target conflicts;
6. the founder questions, if any; and
7. the exact branch/commit containing the research packet.

---

## 14. Expected final folder

```text
Reference/FFT-Triangle-Strategy-World-Study/
  README.md
  SOURCE-LEDGER.md
  CORPUS-INVENTORY.md
  PRIOR-FINDINGS-AUDIT.md
  GENESIS-CAPTURE-INVENTORY.md
  lane-1-footprint-topology-pacing.md
  lane-2-geometry-shape-language.md
  lane-3-material-texture-palette.md
  lane-4-light-atmosphere-camera-post.md
  lane-5-sprite-citizenship-animation.md
  lane-6-diorama-worldfulness.md
  lane-7-state-mutation-consequence.md
  lane-8-production-economy-solo-translation.md
  lane-9-genesis-gap-audit.md
  synthesis.md
  data/
    MEASUREMENTS.csv
  diagrams/
    layer-stack.svg
    compact-depth-recipes.svg
    genesis-adoption-matrix.svg
  local-captures/                 # gitignored; copyrighted/local working evidence only
  local-analysis-plates/          # gitignored; may contain copyrighted frame analysis
```

The SVGs must be original abstract diagrams derived from findings, not traced game maps.

---

## 15. Fable launch block

Use this as the task handoff:

> Execute `docs/FFT-TRIANGLE-STRATEGY-WORLD-STUDY-BRIEF.md` completely. This is a research-only
> assignment. Read every authority it routes to, inspect the current terrain worktrees and their
> better/newer captures, build the required FFT / Ivalice Chronicles / Triangle Strategy / Genesis
> corpus, pass all acceptance gates, and return the complete packet at
> `Reference/FFT-Triangle-Strategy-World-Study/`. Treat “FFT supplies composition; Triangle Strategy
> supplies presentation” as a hypothesis to pressure. Do not promote findings into canon, change
> code, generate replacement target art, or commit copyrighted game captures. The essential answer
> is how Genesis can achieve Triangle Strategy-grade world beauty inside FFT-sized consequential
> vignettes while remaining a persistent, roll-authored, state-mutable solo project.

