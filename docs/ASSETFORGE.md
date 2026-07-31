---
type: production-machinery-spec
status: PRIMARY-ASSET-FACTORY-CANDIDATE-SUITE
created: 2026-07-27
updated: 2026-07-29
owner: art-pipeline
first_implementation: build/assetforge.py
---

# Assetforge

## Purpose

Assetforge is Genesis's **primary asset factory**: the shared front door and compiler protocol for
turning generated or authored visual material into reviewable, repeatable asset candidates. New
production-asset processes should enter through Assetforge's manifest, quarantine, evidence,
receipt, and admission envelope instead of becoming disconnected one-off scripts.

Primary does not mean monolithic. Assetforge wraps canonical specialist engines where they already
exist, and it must consolidate duplicate algorithms rather than compete with them. It is not an
automatic taste authority, a second registry, or permission to route compiler output directly into
the game.

The protocol is:

```text
canonical source + typed manifest
  -> exact generation packet
  -> generated return in quarantine
  -> deterministic extraction/assembly
  -> family-specific technical proof
  -> machine-readable receipt + visual proof board
  -> explicit art admission
```

Image generation owns appearance proposals. Deterministic code owns topology, slicing, naming,
alignment, packing, negative controls, and provenance. A technical `PASS` means that the artifact
obeys measurable contracts; it never means that the art director approved its taste or identity.

## Program policy and maturity

All thirteen current factories are **candidate-ready and not yet proved**. Each has enough
implementation to justify a dedicated proving pass for the particular problem it is intended to
solve. Earlier positive fixtures, real-asset receipts, proof boards, and engine captures are
preliminary evidence; they do not constitute a tool-level proof verdict.

The proving and admission lifecycle is:

```text
source
  -> Assetforge candidate
  -> dedicated tool proving pass
  -> governed engine proof where relevant
  -> founder visual verdict
  -> explicit production admission
```

Only the last step makes an asset live. In this document:

- **Candidate-ready** means executable enough to enter its own proving pass.
- **Gate PASS** means one named measurable invariant passed in one run.
- **Tool proved** requires a dedicated, problem-specific pass and is currently `NO` for every
  family.
- **Visually accepted** means Adam accepted the demonstrated direction, not that the tool is
  finished.
- **Production-ready** is not currently claimed by any Assetforge family.

Every factory remains an evolving prototype and carries improvement debt, some much more than
others. Improve shared tooling before multiplying production outputs. Progress is judged by how
much uncertainty a tool removes, not by the number of candidate images it emits.

## Build classification

- **Execution:** build-time only.
- **Convergence:** principally C4 sprite citizenship; C6 when state variants make a named game
  state more legible.
- **Canonical inputs:** live source assets, semantic registries/manifests, exact realm style blocks,
  scale/grounding contracts, and family production format.
- **Protected boundary:** outputs remain under `dev/model-qa/` until explicitly admitted. A failed
  generation cannot remove or silently replace a live asset.
- **Determinism:** generation is reproducible by its prompt packet and provider receipt; every
  operation after generation is reproducible byte-for-byte from source hashes, manifest, algorithm
  version, and seed.
- **Fallback:** the canonical source asset remains live whenever generation, proof, or admission
  fails.

## Shared job envelope

Every Assetforge family uses a JSON job with these common fields:

```json
{
  "schemaVersion": 1,
  "family": "sprite-emote",
  "jobId": "emote-spr-pc-human-fighter-male-v001",
  "algorithmVersion": "sprite-emote-v1",
  "source": {
    "path": "assets/sprites/spr-pc-human-fighter-male.png",
    "sha256": "<hex>",
    "registryId": "spr-pc-human-fighter-male"
  },
  "generation": {
    "promptPath": "<job-id>.prompt.md",
    "provider": null,
    "model": null,
    "generationCallId": null,
    "seed": null
  },
  "admission": {
    "scope": "candidate-only",
    "tasteApproval": null,
    "approvedBy": null
  }
}
```

Family fields may extend this envelope but may not weaken it. The ingest receipt records actual
input and output hashes, not only paths.

## Shared commands

The CLI surface grows by family without changing the envelope:

```text
python3 build/assetforge.py emote init ...
python3 build/assetforge.py emote ingest ...
python3 build/assetforge.py emote review ...
python3 build/assetforge.py emote self-test ...

python3 build/assetforge.py boundary init MATERIAL --dialect enclosure --output JOB.json
python3 build/assetforge.py boundary init MATERIAL --outside-material OUTSIDE.png --dialect path --output JOB.json
python3 build/assetforge.py boundary compile JOB.json --output-dir DIR
python3 build/assetforge.py ground-field compile JOB.json --output-dir DIR
python3 build/assetforge.py repeat compile JOB.json --output-dir DIR
python3 build/assetforge.py prop-kit compile JOB.json --output-dir DIR
python3 build/assetforge.py condition compile JOB.json --output-dir DIR
python3 build/assetforge.py palette compile JOB.json --output-dir DIR
python3 build/assetforge.py trim compile JOB.json --output-dir DIR
python3 build/assetforge.py decal compile JOB.json --output-dir DIR
python3 build/assetforge.py citizenship compile JOB.json --output-dir DIR
python3 build/assetforge.py atlas compile JOB.json --output-dir DIR
python3 build/assetforge.py material compile JOB.json --output-dir DIR
python3 build/assetforge.py regression compare JOB.json --output-dir DIR
python3 build/assetforge.py suite self-test --force
```

Each family must provide:

1. an `init` or equivalent manifest authoring command;
2. a self-contained prompt packet when generation is involved;
3. an ingest/compile command which never writes directly into live asset directories;
4. a proof board at actual aspect ratio and at relevant play scale;
5. a JSON receipt with source/output hashes and individual gate results;
6. at least one preserved negative fixture which makes the verifier exit nonzero;
7. a separate, explicit promotion step if the family is ever allowed to enter production.

## Factory candidacy and improvement ledger

Debt priority is relative within the prototype program. `CRITICAL` means the current correctness or
visual result is rejected; it does not mean the candidate tool should be discarded. Every row is
`CANDIDATE-READY / NOT PROVED`.

| Factory | Candidacy evidence | Debt | Dedicated proving-pass target |
|---|---|---:|---|
| Sprite-emote factory | V1 compiles state atlases and screens declared identity invariants | **HIGH** | Diverse real PCs/NPCs/monsters; emotion read; seated rest; true rear anatomy; hands and equipment attachment; fixed-scale runtime presentation. |
| Boundary auto-tile compiler | V2 emits enclosure/path/road/cliff topology dialects | **HIGH** | Engine-legible shoulders, intersections, cliff faces/elevation contact, biome language, ground-field integration, and governed-camera trials. |
| Ground-field compiler | V2 emits quilt/Wang/hash fields and has a governed Clayroom candidate | **HIGH** | Anti-repetition across biomes and camera envelopes; richer overlays/path wear; terrain-form/elevation integration; real wilderness routing. |
| Modular repeat compiler | V1 executes, but the real repeat result was rejected | **CRITICAL** | True component/course-period closure and multi-scale cadence without `forcePeriodic` edge laundering. |
| Prop/kit sheet compiler | V1 isolates, names, anchors, and packs components | **HIGH** | Unclipped real sources, exact production-camera equivalence, stable anchors, and ground-depth behavior that never clips stand-in sprites. |
| Condition-state factory | V1 registers and verifies declared state variants | **HIGH** | A visibly stronger canonical age ladder, broader conditions, identity continuity, and play-scale state readability. |
| Palette harmonizer | Assetforge wraps canonical `unify-corpus.py` | **MEDIUM** | Multi-realm and protected-semantic-color cohorts, intentional controls, and evidence that wrapper behavior cannot drift from its single authority. |
| Trim and nine-slice compiler | V1 emits fixed-cap/stretch-safe candidates | **MEDIUM** | More cap/center grammars, pathological dimensions, production consumer presets, and explicit routing versus CSS/runtime nine-slice. |
| Decal/stamp compiler | V1 extracts and emits declared rotation/scale variants | **MEDIUM** | Semantic surface placement, density, mip/fringe behavior, projection trials, and atlas integration. |
| Sprite citizenship adapter | Canonical registry adapter exists; low-light renderer candidate was rejected | **CRITICAL** | Pixel-sharp nearest-neighbor structure plus clean low-light readability in fixed-scale real-renderer A/Bs, without a second schema. |
| Atlas optimizer | V1 packs, extrudes, records UVs, and round-trips payloads | **MEDIUM** | Potpack/runtime convergence, batching and mip behavior, sprite-item/3D balance, and textured stand-ins in Clayroom. |
| Material-map baker | V1 proposal compiler exists; authority consolidation remains open | **HIGH** | Convert to a verifier/wrapper over Material Maker, the material workbench, and periodic-normal authority; do not retain parallel guessed-map authorship. |
| Visual regression foundry | V1 compares fixed images and emits receipts/diffs | **MEDIUM** | Perceptual masks, governed engine scenes, semantic thresholds, and explicit baseline admission/versioning. |

### Useful factories that should remain separate

Some processes share the envelope but should not share algorithms:

- An emote verifier must not use a roof-seam score as a proxy for identity.
- Palette conformance must not repaint source art during technical proof.
- A condition-state factory may change local silhouette only when the state contract licenses it;
  an emote factory may not casually remove equipment or limbs.
- Atlas packing is lossless infrastructure. It cannot become an admission shortcut.
- Visual regression detects change. It cannot decide that the change is tasteful.

That separation keeps each tool narrow without duplicating provenance and receipt machinery.

## V1 candidacy fixture suite

`build/assetforge_apps.py` implements the twelve non-emote vertical slices and is loaded by the
main `build/assetforge.py` command. The retained candidacy-evidence corpus lives at
`dev/model-qa/assetforge-suite/`.

The suite gate is:

```bash
python3 build/assetforge.py suite self-test --force
```

It must report all twelve positive fixtures as `PASS` and all twelve deliberately invalid fixtures
as `FAIL`. Each invalid fixture owns a specific bite:

| family | red-first control |
|---|---|
| boundary | non-periodic source material |
| ground field | repeated-single placement bypasses Wang/hash selection and retains exact tile cadence |
| repeat | empty component sheet |
| prop kit | isolated-component/id count mismatch |
| condition | unlicensed silhouette growth |
| palette | protected semantic color absent from the destination palette |
| trim | target smaller than fixed caps |
| decal | a source mark bleeding off the sheet |
| citizenship | source silhouette touching the delivery boundary |
| atlas | duplicate stable ids |
| material | a required seamless albedo with mismatched edges |
| regression | changed current capture against a zero-difference budget |

The suite board shows each positive output at its actual aspect and labels the paired
`PASS/FAIL` result. It also demonstrates in the retained run that the workspace root and live asset tree are rejected as
destructive output targets. Receipts—not filenames or console prose—are the durable evidence.

These are first vertical slices, not tool-level proofs or final production breadth. They establish
that each candidate can enter a dedicated proving pass and that the shared envelope has executable
failure behavior. Adding a new dialect, packing strategy, condition vocabulary, channel derivation,
or runtime adapter requires new manifests and negative controls without weakening the V1 receipt.

## Real-asset candidacy evidence

The synthetic suite above is the fast contract regression. Production-shaped qualification is a
separate retained harness:

```bash
python3 build/qualify-assetforge-real.py --force
```

The harness requires hydrated, decodable Git LFS content and fails loudly on pointer text or a
source-hash mismatch. It runs all twelve families against named Genesis assets, including the real
fighter sprite/emote return, floor and plaque art, slate components, dirty dressing exports, crack
decals, the existing material-workbench condition maps, and tracked floor/grass/path/road/rock/scree
materials for the boundary dialect suite. It records:

- tracked leaf-source paths, byte sizes, SHA-256 hashes, and decode status in
  `dev/model-qa/assetforge-real/source-evidence.json`;
- exact lineage for the two explicit staging composites (the prop qualification sheet and
  aged-wet condition state);
- one manifest, receipt, and individual proof board per process;
- twelve expected passing candidate runs plus one deliberately changed real-image regression
  control which must fail;
- a combined navigation board which is explicitly not accepted as proof by itself.

The retained qualification receipt is
`dev/model-qa/assetforge-real/qualification-receipt.json`. The 2026-07-28 run met all 13
expectations. The separate hash-bound inspection ledger is
`dev/model-qa/assetforge-real/individual-visual-review.json`; rerunning the qualifier deliberately
removes it so changed outputs cannot inherit a stale visual verdict. Individual inspection exposed
and repaired three defects before that result was
accepted: nominal grid slicing clipped a crack branch, and loose distance-based prop cleanup kept
neighboring-sheet fragments. Decals now support anchor-assigned alpha-component groups with an
all-source-alpha-assigned gate; the prop qualification uses zero-gap component ownership and
records its cleanup ratio. The repeat compiler also rejects a visually repetitive selection policy
in favor of deterministic adjacency-aware variant selection.

This is preliminary qualification evidence, not a tool-level proof or art-admission boundary.
Emote identity/taste, material-channel authorship, and every production routing decision remain
explicitly reviewable.

### Founder review correction — 2026-07-28

Adam's individual review rejected the current repeat output and the current prop proof, requested a
stronger age treatment, and required consolidation rather than parallel implementations for
palette, citizenship, and material maps. The durable review is
`dev/model-qa/assetforge-real/founder-review-2026-07-28.json`.

- **Repeat:** technical `PASS` is invalid as a production claim. The 512-pixel tile does not close
  the 82×72 course period; `forcePeriodic` launders the outermost pixels without closing placement
  phase.
- **Prop kit:** fragment cleanup works, but every selected leaf source already touches an image
  edge. Camera equivalence and production ground-depth behavior were not proved.
- **Condition:** Assetforge is the state registration/verifier layer. Stronger age generation
  belongs to the canonical material workbench.
- **Palette:** resolved. `build/unify-corpus.py` remains the only algorithm authority; Assetforge
  now wraps its shared defringe, Lab quantization, CIEDE2000, dominant-hue, forbidden-chroma, alpha,
  and semantic-color gates.
- **Citizenship:** resolved at the tool/schema boundary. Assetforge is a source-canvas-preserving
  single-asset adapter over `build/gen-sprite-registry.py`. The existing Theater renderer now owns
  the v2 low-light contract and its real Clayroom A/B proof.
- **Atlas:** retained as a promising compiler, but must converge on the documented potpack/runtime
  atlas contract before later Clayroom proof.
- **Material maps:** the periodic normal companion, material workbench, and Material Maker lane
  remain canonical. The parallel Assetforge baker is slated for removal or wrapper conversion.

### Consolidation response — 2026-07-28

The palette and citizenship duplication findings are resolved in the prototype toolchain:

- `palette compile` dynamically loads `build/unify-corpus.py` and uses its shared defringe, Lab
  nearest-palette mapping, CIEDE2000 metrics, dominant-hue gate, and forbidden-chroma gate.
  Assetforge adds only the manifest/hash validation, semantic-color gate, quarantine, receipt, and
  proof board. The retained real result reports mean/p95 CIEDE2000 `4.1830`/`8.2468`, dominant-hue
  shift `3.6507°`, value-rank agreement `0.9549`, and zero forbidden pixels.
- `citizenship compile` dynamically loads `build/gen-sprite-registry.py` and delegates the
  `footX`, `footY`, `worldHeight`, `heightSource`, `contentBounds`, `alphaCutoff`, and
  `shadowProfile` contract. It preserves the source canvas rather than creating a second trimmed
  coordinate system.
- `lit-standee-v2` remains in the canonical renderer path. Minification uses trilinear mipmaps,
  standee materials use alpha-to-coverage, the low-light readability floor is `0.12`, and realm
  tint strength is `0.15`. The retained A/B compares real v1 and v2 production-renderer captures
  under moonlight, torchlight, magic glow, and a daylit negative control. It proves seven real
  registry textures and 63 standee materials:
  `dev/model-qa/assetforge-real/runs/citizenship/low-light-proof/citizenship-v2-before-after.png`.

This is a tool-quality response inside the prototype zone. It does not make any current sprite
final or admitted.

### Founder re-review — 2026-07-28

The consolidation is structurally correct, but two visual claims from the response above are
withdrawn:

- `lit-standee-v2` changed minification from single-level linear sampling to trilinear mipmapped
  sampling. Magnification remained nearest, but play-scale sprites are minified; the mip chain
  visibly softened them. Adam rejected the candidate as blurry. The canonical adapter remains, but
  the renderer recipe returns to `REVISE`.
- The wilderness-path proof uses Assetforge's continuous 2D field renderer over a repeated material
  canvas. It proves route topology, not production terrain presentation. Adam could not tell what it
  would look like in the engine, so it is not an accepted visual proof.
- The proof helper calls `periodic_material()` once and tiles that result across the field. This
  makes the source grass landmarks repeat brutally. Seam closure, per-cell tone jitter, and sparse
  cover splats do not constitute an anti-repetition system.

The next boundary proof must consume a deterministic anti-repeat ground field and run through the
production terrain renderer with the governed camera, standees, elevation/contact, and dressing.

## Non-emote V1 contracts

- **Modular repeat:** keys a component sheet, isolates connected components, places every component
  with a deterministic seed, wraps components across both axes, and emits an exact toroidal tile
  plus a 4×4 cadence proof.
- **Prop/kit:** keys and isolates a declared ordered component sheet, names every component, emits
  normalized foot anchors, packs a lossless atlas, and rejects count or id ambiguity.
- **Condition state:** compares every state to one source identity, locks dimensions, measures
  changed area, enforces declared severity order, and rejects alpha outside a dilated silhouette
  license.
- **Palette:** delegates to the canonical `build/unify-corpus.py` perceptual engine, preserves
  source alpha and protected semantic colors, and records CIEDE2000 mean/p95, dominant-hue shift,
  forbidden-chroma count, and value-rank agreement.
- **Trim/nine-slice:** preserves all four caps byte-for-byte while compiling every declared target
  dimension; targets too small for fixed caps reject.
- **Decal/stamp:** isolates source marks, defringes transparent pixels, builds the complete
  four-rotation/three-scale matrix, checks half-scale readability, and rejects source bleed.
- **Sprite citizenship:** delegates bounds, foot anchor, world height, alpha cutoff, and shadow
  profile to `build/gen-sprite-registry.py`, preserves the original source canvas, and emits a
  preflight card. Renderer proof separately exercises canonical metadata under real light recipes.
- **Atlas optimizer:** sorts stable ids, shelf-packs with payload-preserving extrusion, emits
  normalized UVs and source hashes, proves byte-exact payload round trips, and enforces a byte
  budget.
- **Material-map baker:** preserves the admitted albedo, emits explicitly noncanonical height,
  normal, roughness, and emissive proposals, checks channel ranges and periodic seams, and never
  promotes inferred relief to geometry truth.
- **Visual regression foundry:** compares fixed baseline/current captures, emits ordinary and
  amplified diffs, records both hashes and a normalized difference score, and applies a declared
  threshold without making a taste decision.

## Golden Vignette expansion applications — specified, not built

Adam authorized a marriage pass between the retained FFT/Triangle Strategy findings, Golden
Vignette visual direction, the surface/material pipeline, and Assetforge. The complete
machine-readable application ledger is
`docs/intel/golden-vignette-assetforge-applications-v1.json`; the visual contract is
`docs/GOLDEN-VIGNETTE-VISUAL-GUIDE.md`.

These applications are `SPECCED / UNBUILT`. They are not part of the thirteen candidate-ready
factories above, and this section does not inflate that count. Each application is an orchestrator
or a narrowly new compiler over canonical owners. It must reuse the shared Assetforge manifest,
quarantine, source hashes, negative controls, proof boards, receipts, visual review, and explicit
admission boundary.

### AF-GV-1 — Surface-demand router

**Problem.** `SemanticAssetDemand` can reserve an identity obligation before geometry, but exact
material, trim, decal, and shallow-relief work cannot be requested until a real face exists.

**Contract.**

```text
SemanticIdentityReservation[]
  + SurfaceAssemblyPlan faces[] with stable local frames
  + mechanic/source facts
  -> SurfaceMaterialDemand[]
  -> typed Assetforge child jobs or explicit truthful fallback
```

The router binds every realized treatment to `surfaceRef`/`faceRef`, records face role, local
frame, mask, texel scale, mechanic truths, realm/culture/construction, condition channels,
cause refs, candidate lanes, and fallback. It may leave a demand unresolved. It may not invent a
face, choose a vendor before routing, convert a reservation into cosmetic clutter, or let a
material create an opening, route, support, cover edge, or interaction.

**Required proof.** One Guard Post and one Tavern request must retain every identity reservation
through geometry, produce no orphan face demand, send every demand to exactly one admitted
candidate/fallback/unresolved result, and preserve plan/mechanics fingerprints.

**Negative controls.** Request treatment before the face exists; delete the controlled-threshold
reservation; bind a sign to an underside; allow paint to create a doorway; change collision while
resolving a material; send one demand to two competing child jobs.

### AF-GV-2 — Material-family composer

**Problem.** Individual good textures do not make a coherent battlefield. Each active window needs
a small family whose ground, wall, retaining, roof, trim, support, and decal roles share material
DNA, texel register, value logic, palette, roughness, and light response without becoming a
same-color wash.

**Contract.** The composer wraps—not replaces—Material Maker parents, the ground-field compiler,
the canonical palette engine, trim/decal/atlas tools, and the Material Lane taste-card harness. It
consumes a family manifest with:

- role coverage and allowed omissions;
- exact parent/output hashes and parameter hashes;
- realm, culture, construction, and maintenance doctrine;
- approved texel register and per-role projection policy;
- value, saturation, roughness, metalness, and normal-intensity envelopes;
- one controlled accent/emissive family where licensed;
- condition/mutation hooks that remain instance-bound; and
- procedural fallback for every required role.

It emits a versioned family manifest, resolved role maps, missing-role debt, a grayscale/value
strip, full PBR slabs, a three-to-six-family composed scene card, a standee-context strip, and
light-recipe/four-bearing captures. The soft three-to-six family target and provisional highlight
and texel A/Bs remain labeled calibration, never disguised as hard technical gates.

**Required proof.** The same Guard Post geometry must compare clay, current fallback, and composed
family under identical camera/light/actors. The family must improve face separation and world
citizenship at gameplay and 50% contact-sheet scale without increasing prop count or changing
geometry.

**Negative controls.** One texture per face; mixed texel registers; nearest-filtered normal map;
palette harmonization that destroys a protected sign/crest color; every role at the same value and
roughness; a material family that reads better alone but fights the standee; a missing fallback.

### AF-GV-3 — World-surface projection compiler

**Problem.** The flat ground-field candidate does not prove a material over connected hills,
convex/concave transitions, cut faces, retaining faces, curved paths, switchbacks, corners, or
quarter-turn views. Restarting UV phase per tile would recreate the same zipper and Minecraft
rhythm in texture space even when geometry is continuous.

**Contract.** Consume stable face frames, adjacency, material family, texel register, grain or
gravity direction, and seam policy. Emit world-locked UV/projection data, chart adjacency,
directional exceptions, trim sockets, and a projection receipt. Natural joined surfaces share
phase across tactical cells; intentional cliffs and constructed seams may split charts. Writing,
heraldry, waterlines, grain, courses, soot, and drainage remain world-oriented and cannot flip to
face the camera.

This compiler changes mapping only. It never moves vertices, closes a crack in source geometry,
adds a riser, or smooths a mechanics-owned edge.

**Required proof.** Use the retained hillside/switchback, ravine, bluff, and earthwork fields.
Capture all four bearings with a UV diagnostic and dressed family; report shared-edge phase error,
texel-density distribution, directional-face correctness, and unchanged terrain/tactical
fingerprints.

**Negative controls.** Reset phase at each cell; mirror lettering on opposite bearings; project a
top role onto a cut face; stretch a switchback landing beyond budget; cross an intentional
cliff-chart split; use texture continuity to hide a geometric crack.

### AF-GV-4 — Identity-face treatment assembler

**Problem.** Purpose, claim, service, creature shaping, evidence, and objective emphasis need a
reliable home on actual visible faces. Random prop scatter and generic wall materials cannot carry
those semantic obligations.

**Contract.** Consume a `SemanticIdentityReservation`, eligible realized faces, visibility and
interaction priority, plus the admitted material family. Resolve the obligation through one or
more of: body material role, trim, joint, sign, crest/banner, decal, shallow extrusion/faced
component, fixture mount, or truthful proxy. Use existing trim, decal, atlas, prop-kit, and sprite
extrusion authorities; do not duplicate them.

The assembler records world orientation, mount/support, occlusion envelope, four-bearing
visibility, reading distance, condition/state relationship, and fallback. A ruined wall may carry
collapse and repair evidence without implying dormancy. A pure cavern cannot receive claimant
marks unless a real lair/claim fact exists.

**Required proof.** Tavern purpose survives social/combat projections; Guard Post control reads
without a label overlay; Prison and Asylum identity reservations choose different treatments on a
shared legal chassis; cavern and creature-made lair remain visually distinct.

**Negative controls.** Drop the reservation; mount a sign on a hidden/invalid face; camera-face a
world-oriented crest; infer operating state from ruin; decorate a pure cavern as a lair; place a
shallow extrusion whose implied depth changes collision.

### AF-GV-5 — Causal surface-state compiler

**Problem.** Existing condition tooling registers and verifies authored states, but the Golden
engine needs surface changes derived from event, route use, exposure, water, drainage, load,
maintenance, ecology, magic, claim, and time.

**Contract.** Consume source facts and geometry-derived fields; emit cause-labeled masks,
attachments, overrides, state-layer ordering, coalescence rules, and per-instance mutation
receipts. It orchestrates Material Maker/state parents, condition validation, decals, ground
overlays, and the persistent object/surface owner. It never rolls undirected “age” or grunge.

Channels include foot wear, wheel ruts, waterline/wetness, drainage stain, soot, impact, scorch,
moss/vegetation, repair/patch, repaint, salvage, claimant mark, creature abrasion, magic
alteration, and accumulated residue. Every mark answers what caused it, when, where, and which
instance owns it.

**Required proof.** One threshold scorch and one repaired/repainted object survive
unmount/remount; sibling instances and parent materials remain byte-identical; removing the cause
removes the proposed mutation; before/after captures remain tactically identical unless a separate
mechanics event owns the change.

**Negative controls.** Uniform random grunge; wetness uphill from drainage; soot without fire;
traffic wear outside routes; shared-parent bleed; ruin state inventing vacancy; receipt omitted.

### AF-GV-6 — Natural/constructed join-treatment kit

**Problem.** The synthesizer owns `CUT_INTO`, `RESTS_ON`, `RETAINS`, `BRIDGES`, `PINS`, `ABUTS`,
and `BURIES`, but those relationships need reusable visual families for footings, toes, cuts,
coping, spill, drainage, supports, and accumulated debris.

**Contract.** Consume an engine-owned join and exact boundary frame. Compile eligible trim,
material, decal, shallow-relief, and prop/kit attachments for the relation, culture,
construction, substrate, exposure, and condition. Geometry, support, collision, grade, and
traversability remain engine-owned; Assetforge may only package/mount the visual members and
validate their fit.

**Required proof.** Each relation receives at least one generic proxy kit and one
material-family treatment across straight, convex, concave, height-changing, and terminal joins.
The dressed join must read from four bearings without hiding the legal connector or opening a
crack.

**Negative controls.** Foundation floats above ground; retaining toe blocks route; drainage runs
uphill; trim bridges an unsupported gap; kit changes join relation; sedimentary face bands recur
across unrelated natural cuts.

### AF-GV-7 — Context-band compiler

**Problem.** Compact windows need near support and far premise without FFT's black void or
decorative false exits.

**Contract.** Consume the context card, source facts, active-window boundary/frontiers, knowledge
policy, camera family, palette/light handshakes, and occlusion budget. Compile near apron/support
pieces, masks, far plates/cards, atmosphere layers, four-bearing eligibility, and a context
receipt. Reuse the existing plate/card and projection owners; Assetforge supplies the production
envelope and proofs.

**Required proof.** Context-off/on has identical active ids, geometry, mechanics, and knowledge.
Every visible portal continuation is true, the active floor remains sharpest, and all four
bearings avoid false reachable surfaces or leaked secrets.

**Negative controls.** False door/path/roof; hidden-site leak; horizon rotates inconsistently;
foreground obscures deployment; far plate owns collision; context mutates with combat promotion.

### AF-GV-8 — Governed vignette proof packager

**Problem.** Individual technical proof boards can hide a failure that appears only in the
composed scene, another bearing, gameplay scale, grayscale, context, or persistence.

**Contract.** Extend the existing visual regression foundry rather than creating a second diff
engine. Given one committed `VignettePlan`, assemble the required Golden review packet:
mechanics/clay overlay, starting beauty view, three quarter turns, gameplay and 50% scales,
grayscale/value, material-family/identity overlays, context off/on, state before/after, and
changed-seed siblings. Bind every image to plan, geometry, material, camera, light, context, state,
and source fingerprints.

It reports hard-rejection results and separate soft measures. It cannot average them into a
single score, promote taste, or let an aggregate green hide an individual failed frame.

**Negative controls.** Missing bearing; mixed plan fingerprint; unlabeled expression rung;
baseline captured under different light; grayscale not derived from the exact beauty frame;
context/state comparison changes mechanics; changed-seed image mislabeled as the same plan.

### Golden application delivery order

1. Build **AF-GV-1 Surface-demand router** as the Wave-2 semantic-to-face bridge.
2. Build **AF-GV-2 Material-family composer** for the smallest Tavern/Guard family A/B.
3. Build **AF-GV-3 World-surface projection** on the retained hills/switchback before calling the
   family terrain-capable.
4. Add **AF-GV-4 Identity-face treatment** and **AF-GV-8 proof packaging** to close the Wave-2
   visual receipt.
5. Build **AF-GV-6 join treatment** with institutional construction in Wave 4.
6. Build **AF-GV-5 causal surface state** with the Wave-5 history/condition gate.
7. Build **AF-GV-7 context bands** when the world-context projection gate opens.

No application advances merely because it is listed. A current Golden wave must name the demand,
fixtures, specialist authorities, negative controls, owner files, and stop condition.

# Sprite-emote factory

## Scope

The factory accepts any registered `monster`, `npc`, or `pc` source sprite. This is broader than
default runtime admission. Genesis still budgets emotes primarily for PCs and bosses; an ordinary
NPC or monster bundle remains a candidate until separately licensed.

An emote is one discrete static portrayal of the same identity. It is not:

- an animation frame;
- a different individual in the same role;
- a costume or equipment swap;
- an unlicensed scale or camera change;
- a replacement for procedural standee warps or DM-hand movement.

The default `genesis-core` state pack is:

| id | semantic cue |
|---|---|
| `neutral` | characteristic baseline expression and ready stance without a strong emotion |
| `angry` | anger or hostile intent at maximum readable clarity |
| `happy` | warmth, delight, or relieved happiness |
| `near-death` | severe exhaustion and pain; slumped but still a complete grounded standee |
| `resting` | a quiet seated field-rest pose, contemplative and momentarily unguarded |
| `rear-view` | the same individual turned 180° and viewed from behind; never a mirrored front |

Jobs may supply a different ordered state list. Runtime code must address state ids, never atlas
cell numbers.

## Identity locks

Every generation packet locks:

- the exact individual represented by the supplied source image;
- body plan, apparent age, face/head anatomy, skin/fur/scales, and major markings;
- clothing, armor, weapons, carried equipment, and which side carries them;
- realm palette, pixel density, outline language, lighting direction, camera, and scale;
- the source silhouette's grounding and apparent world height.

Only expression, gesture, and the minimum pose change needed to communicate the requested state may
change. `rear-view` is the sole default viewpoint exception: camera height/projection, scale, and
ground line remain locked while the same individual turns 180° to reveal true back anatomy and
physical equipment attachment. A rear view may not be manufactured by mirroring front artwork.
Creatures without readable human faces use ears, eyes, hackles, tail, wings, stance, compression,
reach, and signature effects. The full body and every identity-bearing component must remain
visible.

## Generation format

- Six states default to a `3 x 2` row-major sheet.
- Cell aspect follows the source silhouette rather than assuming a square.
- The exact realm `Style block:` is copied verbatim from its authority file.
- The source sprite is supplied to the generation worker as the identity reference.
- Background is flat `#FF00FF`.
- Repeating the same identity is a family-specific exception to the ordinary sprite-sheet
  distinct-subject rule. The cells are discrete state variants, explicitly **not animation
  frames**.
- No labels, dividers, scenery, floor planes, cast shadows, or state-to-state overlap.

## Mechanical proof

The v1 compiler proves:

- the job still resolves to the same source path and SHA-256;
- actual sheet dimensions are divisible by the declared grid;
- every required cell contains non-background content;
- every cell has chroma/transparent clearance on all four outer borders;
- keyed output has alpha and no excessive magenta edge residue;
- normalized content scale remains within the declared occupancy tolerance;
- deliberately seated/compressed states remain inside their separate licensed scale envelope;
- ground contact remains within the declared normalized baseline tolerance;
- coarse state palette coverage remains within the source-identity budget;
- atlas rectangles, UVs, state paths, hashes, and dimensions agree;
- the proof board renders the source, every labeled state, baseline guides, and a reduced
  play-scale row without distortion.

These gates prove technical identity invariants, not artistic sameness. The receipt therefore
reports:

```text
mechanicalIdentity: PASS | FAIL
visualIdentity: REVIEW_REQUIRED | APPROVED | REJECTED
```

No metric may silently promote `visualIdentity` to `APPROVED`.

Every ingest also emits `visual-review.json`. It requires a per-state verdict plus explicit checks
for state read, identity continuity, limb/hand anatomy, equipment presence and attachment,
grip/contact plausibility, silhouette continuity, and play-scale readability. Rear view adds true
back-construction and rear-equipment-attachment checks. Compile a filled checklist with:

```bash
python3 build/assetforge.py emote review <visual-review.json>
```

Any failed check produces `visualIdentity: FAIL`; any blank check produces `INCOMPLETE`. Only a
fully filled all-pass checklist can produce a visual `PASS`, and even that remains a candidate until
the separate runtime-admission boundary.

## Negative controls

The self-test must reject all of:

1. one blank required state;
2. a state shifted far enough off the shared ground line;
3. a state with source-palette identity replaced by an unrelated palette;
4. non-key contamination touching a cell boundary.

The self-test itself exits nonzero if a bad fixture passes or a valid fixture fails.

# Ground-field compiler

## Why this is not another seamless-tile maker

A seamless tile proves only that one image can meet itself. It does not prevent the image's
internal grass clumps, stones, color patches, or brush marks from repeating as a visible grid.
`ground-field` consumes seamless material parents and compiles one larger world field through six
ordered layers:

1. patch-quilt multiple interiors from the base material;
2. stamp exact Wang edge signatures and generate multiple interiors per signature;
3. place signatures and interior variants deterministically from world cell + seed;
4. apply a macro color/roughness field whose cells span multiple Wang cells;
5. place sparse typed overlays: bare soil, stones, grass clumps, and wear;
6. smooth a semantic path centerline and composite its material through a full core plus blended
   shoulder mask.

The real candidate manifest is
`dev/model-qa/assetforge-real/manifests/ground-field-real.json`. It compiles the tracked B03 meadow
and worn-path sources into a 15×15-cell, 2880×2880-pixel candidate:

```bash
python3 build/assetforge.py ground-field compile \
  dev/model-qa/assetforge-real/manifests/ground-field-real.json \
  --output-dir dev/model-qa/assetforge-real/runs/ground-field/positive --force
```

The current receipt records 64 quilted Wang variants, 4,096 exact compatible-neighbor checks, all
64 variants used across the 225-cell field, a 4% maximum identical-variant share, a 6×5 macro
field, a 148–238 roughness range, all four semantic overlay classes, seven path controls, and
matched height/normal/ORM channels. It also compares pixels one tile-period apart: the repeated
control remains exactly periodic (`0.0`) while the compiled field measures `14.321615`.

V2 normalizes each source material to one world cell before quilting. V1 incorrectly cropped a
96×96 window from the 1,254×1,254 one-cell meadow source and enlarged that small crop over a whole
cell, making the material vocabulary read roughly 13× too large. CL-F06 rejected that render.

## Runtime adapter and retained engine proof

`board.groundField` is an optional additive payload on the existing production Theater
`setBoard()` path:

```js
groundField: {
  albedo: "dev/.../field-albedo.png",
  normal: "dev/.../field-normal.png",
  orm: "dev/.../field-orm.png",
  roughness: "dev/.../field-roughness.png",
  compilerReceipt: "dev/.../receipt.json"
}
```

The shared adapter mounts one subdivided `MeshStandardMaterial` plane through either the flat
tabletop or production interior realizer. Compiled field UVs span 0–1 because the image already
contains the full 15×15 world field; they do not stretch one source tile over the room. The
material binds sRGB albedo plus linear normal/ORM, receives production shadows, supplies UV1 for
AO, and uses trilinear mipmapped minification plus up to 8× anisotropy for the wide oblique camera.
Albedo magnification remains nearest. Sprite sampling is a separate channel and was not changed.
Boards without `groundField` are unchanged.

The governed Clayroom proof uses the real production route:

```bash
node dev/capture-ground-field-clayroom-proof.mjs
```

Retained evidence:

- compiler receipt: `dev/model-qa/assetforge-real/runs/ground-field/positive/receipt.json`;
- compiler board: `dev/model-qa/assetforge-real/runs/ground-field/positive/proof-board.png`;
- governed Clayroom default camera:
  `dev/model-qa/assetforge-real/runs/ground-field/clayroom-proof/clayroom-compiled-default.png`;
- same fixture with the repeated-single negative control:
  `dev/model-qa/assetforge-real/runs/ground-field/clayroom-proof/clayroom-repeated-control.png`;
- rotated governed Clayroom camera:
  `dev/model-qa/assetforge-real/runs/ground-field/clayroom-proof/clayroom-compiled-rotated.png`;
- Clayroom receipt:
  `dev/model-qa/assetforge-real/runs/ground-field/clayroom-proof/clayroom-proof-receipt.json`.

The route is `genesis.html?clayroom=1&clayfixture=ground-field` →
`clayRoomBoardFrom` → `interiorBuildBoard` → `setInteriorBoard`. CL-F06 requests zero pieces and
resolves zero model fallbacks. The earlier flat battlefield-style proof was withdrawn and removed.
Both compiler and Clayroom receipts are technical `PASS`; the outputs remain candidate-only and
are not production art admission.

# Boundary auto-tile compiler

## Why this is separate from seamless tiling

A seamless material answers “can this field repeat forever?” A boundary set answers “what happens
where that field stops, turns inward, forms an island, touches itself diagonally, or meets another
material?” A perfect seamless center tile can still produce broken corners, doubled outlines,
phase resets, and one-cell holes when used as an auto-tile family.

The boundary compiler consumes admitted repeatable fields; it does not replace the repeat compiler.

## V2 dialect matrix

The compiler does not force every boundary problem through Blob47. The manifest declares one of
four named dialects, each with its own topology and proof:

| Dialect | Runtime grammar | Visual job | Exhaustive proof |
|---|---|---|---|
| `enclosure` | sanitized eight-neighbor Blob47 | room, manor, church, courtyard, bounded floor field | 256 raw masks -> 47 shapes; 2,312 compatible pairs; topology torture maps |
| `path` | full eight-neighbor 256 network | narrow wilderness paths, game trails, diagonal ridges, loops, forks | all 256 masks; 49,152 compatible pairs; four real field renders |
| `road` | cardinal 16 network | wide roads with shoulders, paired ruts, crossings, dead ends | all 16 masks; 128 compatible pairs; four real field renders |
| `cliff` | cardinal 16 transitions + integer elevation | escarpments, terraces, mesas, outcrops, ravines | all 16 transitions; four elevation bands; four dimetric height-field renders |

`path` and `road` are intentionally different dialects. A road is not a path with a larger brush:
it owns shoulder width and paired track detail. A cliff is not a material outline: it owns integer
height and exposes shaded/striated faces between elevation bands.

The real multi-dialect manifest is
`dev/model-qa/assetforge-real/manifests/boundary-real.json`. Its individual proof boards are:

- `dev/model-qa/assetforge-real/runs/boundary/candidate/dialects/architectural-enclosure/proof-board.png`
- `dev/model-qa/assetforge-real/runs/boundary/candidate/dialects/wilderness-path/proof-board.png`
- `dev/model-qa/assetforge-real/runs/boundary/candidate/dialects/wilderness-road/proof-board.png`
- `dev/model-qa/assetforge-real/runs/boundary/candidate/dialects/cliff-elevation/proof-board.png`

The combined board at `dev/model-qa/assetforge-real/runs/boundary/candidate/proof-board.png` is a
navigation surface only.

## Blob47 enclosure semantic neighbor model

The enclosure dialect's canonical source key is an eight-neighbor mask:

```text
N E S W NE SE SW NW
```

Cardinal bits say whether the same connected material occupies that neighbor. A diagonal bit is
meaningful only when both adjacent cardinal bits are present. Sanitizing the 256 possible raw
eight-bit masks under that rule produces the standard 47 connected “blob” shapes.

The enclosure compiler emits both:

- all 47 canonical shapes, named by semantic mask rather than atlas position; and
- a deterministic lookup mapping every raw mask `0..255` to one canonical shape id.

Runtime consumers ask for a semantic mask. They never know that a particular corner happens to be
atlas cell 19.

Example id:

```text
n1-e1-s0-w0-ne1-se0-sw0-nw0
```

## Family manifest

`boundary init` can author a single dialect:

```bash
python3 build/assetforge.py boundary init assets/material.png \
  --dialect enclosure \
  --output dev/model-qa/jobs/enclosure.json

python3 build/assetforge.py boundary init assets/path.png \
  --outside-material assets/grass.png \
  --dialect path \
  --output dev/model-qa/jobs/path.json
```

`--outside-material` is required for `path`, `road`, and `cliff`. The real qualification manifest
uses a suite wrapper whose `dialects` array points to four compiled child manifests, so every
dialect retains its own receipt and proof.

```json
{
  "schemaVersion": 1,
  "family": "boundary-autotile",
  "familyId": "fantasy-packed-earth-to-void-v001",
  "algorithmVersion": "boundary-blob47-v1",
  "insideMaterial": {
    "tile": "assets/<approved-seamless-inside>.png",
    "sha256": "<hex>"
  },
  "outsideMaterial": {
    "mode": "transparent"
  },
  "edgeLanguage": {
    "sourceSheet": "dev/model-qa/<edge-components>.png",
    "sourceHash": "<hex>",
    "borderWidthPx": 12,
    "cornerRadiusPx": 8,
    "orientationPolicy": "rotatable-organic",
    "phasePolicy": "world-locked"
  },
  "tileSizePx": 128,
  "atlasColumns": 8,
  "seed": 73129,
  "admission": {
    "scope": "candidate-only"
  }
}
```

`outsideMaterial.mode` may be `transparent`, `solid`, or a second admitted repeatable material. A
two-material transition records both source hashes and declares which material owns the edge.

`orientationPolicy` is one of:

- `rotatable-organic`: rotations are declared equivalent and verified on each candidate;
- `authored-cardinals`: north/east/south/west pieces must be supplied separately;
- `directional-construction`: rotation/flip is forbidden; roof courses, grain, writing, and gravity
  retain their authored direction.

## Enclosure compilation algorithm

1. Validate source hashes, dimensions, licenses, alpha mode, and declared orientation policy.
2. Enumerate all raw masks `0..255`.
3. Sanitize illegal diagonals and reduce them to the 47 canonical semantic masks.
4. For each canonical mask, rasterize the connected-cell occupancy shape at a higher internal
   resolution.
5. Sample the inside material in world-locked phase. Neighboring cells must sample the same
   infinite field coordinates; restarting texture phase in every tile is forbidden.
6. Construct convex and concave boundary bands from the semantic occupancy mask.
7. Apply supplied edge/corner components according to their orientation license. Generated
   components may propose appearance; mask topology remains deterministic.
8. Downsample with the declared pixel-art policy and cut each exact tile rectangle.
9. Pack canonical shapes into an atlas with padding/extrusion and emit stable semantic ids, pixel
   rects, normalized UVs, and the full 256-entry lookup.
10. Render exhaustive pair proofs and topology torture maps.

`boundary-blob47-v1` remains the named enclosure dialect; it was not broadened into a vague
universal algorithm. Path, road, and cliff use separate named topology compilers and gates.

## Enclosure proof maps

Every family renders, at minimum:

1. a one-cell island;
2. a solid rectangle large enough to expose material repetition;
3. a one-cell hole inside a solid field;
4. a donut with both convex and concave corners;
5. an L and mirrored L;
6. a one-cell-wide neck joining two masses;
7. a staircase diagonal;
8. disconnected diagonal kisses;
9. an S-curve/snake one cell wide;
10. a randomized seeded field containing every canonical shape;
11. for two-material families, reciprocal A/B regions and a closed A island inside B.

The board overlays optional semantic-mask labels outside the beauty capture. It also emits a clean
capture with no debug marks.

## Dialect-specific mechanical gates

### Exhaustive lookup

- all 256 raw masks resolve;
- exactly 47 canonical shapes exist for the blob-47 dialect;
- no atlas rect overlaps another;
- every canonical shape is referenced by at least one raw mask;
- mapping is stable across repeated builds.

### Neighbor closure

For every horizontally and vertically compatible pair:

- the binary inside/outside occupancy agrees along the shared edge;
- border thickness agrees within one delivery pixel;
- no double border, pinhole, or transparent crack exists;
- inside-material sampling has continuous world phase;
- outside-material sampling has continuous world phase when present.

### Topology preservation

For every torture map:

- connected-component count matches the semantic input;
- hole count/Euler characteristic matches the semantic input;
- no output pixel crosses outside its licensed occupancy plus border band;
- every input cell remains addressable and no one-cell neck disappears.

### Visual integrity

- boundary colors remain inside the declared palette budget;
- pixel density and outline language match the family source;
- proof captures preserve exact tile aspect and nearest-neighbor scale;
- clean and debug boards hash the same compiled tile atlas.

### Path and road networks

- every legal mask has an atlas entry and appears in the seeded stress field;
- every shared cardinal or diagonal connection agrees across both participating cells;
- the whole-field renderer remains continuous through turns, forks, loops, crossings, dead ends,
  switchbacks, and shortcuts;
- path diagonal joins do not pinch into separated dashes;
- road shoulders and paired ruts remain distinct from the narrow path language.

### Cliff elevation

- all 16 cardinal transition masks resolve;
- integer height bands remain stable across repeated compilation;
- every height discontinuity produces an exposed face with consistent shade and striation;
- the dimetric proof covers escarpment, terraced switchback, mesa/outcrop, and ravine layouts;
- at least four elevation bands appear in the retained stress set.

## Boundary negative controls

The verifier must preserve and reject at least these mutations:

- swap convex and concave corner components;
- ignore the diagonal-suppression rule;
- reset material phase at every tile origin;
- delete one canonical shape from the lookup;
- offset one edge by one or more delivery pixels;
- rotate a `directional-construction` component;
- relabel two atlas cells while leaving their pixels untouched.

These controls catch the common failure where an atlas looks plausible as a sheet but lies to the
runtime lookup.

## Boundary outputs and receipt

```text
<family-id>-atlas.png
<family-id>-atlas.json
<family-id>-lookup-256.json
<family-id>-proof-clean.png
<family-id>-proof-debug.png
<family-id>-pair-matrix.png
<family-id>-receipt.json
```

The V2 suite additionally emits `dialect-index.json`, a suite receipt, one child directory per
dialect, one atlas/receipt per child, and four individual field renders per path/road/cliff child.

The receipt records source hashes, dialect/version, seed, orientation policy, all 47 semantic
shapes, the 256-entry lookup hash, per-gate metrics, torture-map topology results, output hashes,
and:

```text
technicalStatus: PASS | FAIL
tasteStatus: REVIEW_REQUIRED | APPROVED | REJECTED
runtimeAdmission: CANDIDATE | ADMITTED
```

## Historical V1 delivery order

1. Land and use the sprite-emote factory as the shared-envelope proving ground.
2. Extract common hashing, path, receipt, and proof-board helpers only after the second family shows
   which abstractions are genuinely shared.
3. Implement `boundary-blob47-v1` with synthetic flat-color fixtures first.
4. Make every boundary negative control fail before ingesting generated edge art.
5. Adapt one already-approved seamless Genesis material.
6. Review the torture maps at play scale.
7. Only then add two-material transitions or alternate dialects.

That sequence is now complete for the first four dialects. The current next gate is Adam's
individual visual review of the real path, road, and cliff boards, followed by a separate runtime
routing decision if any dialect is accepted.

## Golden Site 1 sprite-citizenship renderer verdict (2026-07-30)

The `lit-standee-v2` citizenship route must emit and preserve this runtime sampling contract:

- sRGB color texture;
- nearest-neighbor magnification;
- one-level linear minification;
- `generateMipmaps: false`;
- registry alpha cutoff plus alpha-to-coverage.

The later trilinear-mipmap citizenship candidate is visually rejected. In identical settled
production frames it dissolved authored facial, limb, weapon, rim, and color-cluster edges into
soft interpolated patches. Assetforge now writes the restored contract into every new citizenship
receipt; the light-profile lock and runtime loader enforce the same values. Historical receipts
remain unchanged evidence of the rejected route.

The governed A/B is banked under `artifacts/golden-site-1-sprite-filter-audit/`. This verdict is
sprite-specific: material albedo, normal, ORM, shadow, and post-process textures keep their own
declared sampling contracts.
