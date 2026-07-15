---
type: build-plan
project: Genesis
status: ACTIVE — the re-specced build order for the VQ2/sprite-flip pass (2026-07-15)
governed_by: GRAPHICS-CONVERGENCE-CHARTER.md, ART-DIRECTION-CANON.md (quoted, never paraphrased)
composes: SOL-SOLUTIONS.md (vq2-world-looks), dev/play-lens/ledger.md, PHASE-3-WAVE-2-SPECS.md,
  FACETED-ART-REGENERATION-PRODUCTION-PLAN.md, ENV-EXTERIOR-WAVE.md, EXTRUDED-SPRITE-PROP-LIBRARY.md
  (codex/extruded-prop-pilot), docs/PLAY-LENS.md
audience: orchestrator (Fable) + Sonnet executors (one section = one unit = one branch)
---

# VQ2 RESPEC — the build order for this pass

Adam's directives (2026-07-15, verbatim intent): fold the VQ2 vision quest + `SOL-SOLUTIONS.md`
in as *suggestions for law, not law* · orchestrate gameplay rounds across settings to measure
what the DM needs vs what renders vs what comes back null · **do the sprite flip but keep the
old sprites in reserve** · inventory the new sprites (tags + expected height per creature;
Adam tweaks later in the sprite editor) · get the sprite-extrusion plan going · re-spec the
build order and orchestrate if sound.

## 0. Ground facts (measured this session)

- **Sol's recipes are grounded**: all 17 engine symbols named in SOL-SOLUTIONS RECIPE blocks
  (`LIGHT_PROFILES`, `applyLightProfile`, `STAGE_AMBIENT_FLOOR`, `walkSceneFrom`, `shotPlanFrom`,
  `composeShot`, `trayFrom`, `setInteriorBoard`, `theaterUnitsFrom`, `theaterBoardBuild`, …) exist
  at the claimed seams. The frames were rendered BEFORE the autonomous arc landed — P-A's rig
  values are partially superseded by ENV-1/1b/1c (celestial arc); its *ratios and luminance gates*
  are the surviving contribution.
- **The new sprite corpus** is 419 uncut magenta-keyed candidates (891/901 fantasy identities)
  on `codex/faceted-f1-consolidation` (`dev/model-qa/faceted-sheets/*-returns/`), naming
  `<runtime-slug>-candidate-NNN.png`, one PNG may hold multiple identities (provenance `cells[]`).
  None are cut, none admitted (`runtimeAdmitted:false` throughout). Master's `assets/sprites/`
  (896 cut v3 PNGs) and `data/sprite-registry.js` (4,316 entries; 897 cut with `feet`/`scaleTrue`)
  are untouched by the branch.
- **The flip seam is narrow**: one texture-path literal (`theater-boot.js:2905`
  `"assets/sprites/" + slug + ".png"`) + the registry. The B1 spec (PHASE-3-WAVE-2-SPECS.md)
  already defines the admission fields (`legacyAsset`/`candidateAsset`/`artStyleVersion`/
  `qaStatus`/`runtimeAdmitted`) — the flip IS B1's mechanism, batch-applied.
- **"Null requests" are fallback tiers, not crashes**: figure→cuboid (`figureFor` chain),
  dressing→name-label placeholder card (`dressingTextureFor`), settlement NPC street cards→100%
  placeholder cards, town facades→`facadeTextureFile:null` + procedural material (no door/window/
  roof art at all), unknown material→"mottle". No census instrument exists; `shotPlanFrom`
  records demand (`provenance[]`) but not resolution outcome.
- **Play-lens realm coverage is emergent**: `--realm` only steers the settlement mint; the world
  realm rolls unseeded. Multi-realm coverage needs either repeated runs or a small rig extension.

## 1. Sol law dispositions (suggestions-for-law → rulings for this pass)

Adopted PROVISIONALLY under Adam's delegation; every visual unit still ships capture cards for
his red-pen. Registered in DESIGN.md as provisional; nothing here edits ART-DIRECTION-CANON.md
(Adam-signoff-only file).

| law | disposition | where it lands |
|---|---|---|
| **P-A** daylight = bright tray in a dark room (4:1 key:fill, tray-edge ≤12% luma, ≥6% profile-median separation, PC-face ≥18% floor, `EXTERIOR_AMBIENT_FLOOR` split from `STAGE_AMBIENT_FLOOR`, perimeter falloff 1.0→0.32) | **ACCEPT as gates + re-tune**, not a rebuild — ENV-1/1b/1c already landed the rig; the arc modulates, Sol's static directions don't replace it | F3 (Stage E gates) + an EXT-TUNE card in F3 |
| **P-B** Kenney = geometry reserve, never a render style; donor adapter at the GLTF boundary; three-card bridge gate (raw / DIRECT_MODULATED / grey silhouette) | **ACCEPT as a pilot** on the packs already on master (modular-dungeon, graveyard, mini-dungeon); fantasy-town kit rides only after the pilot passes its bridge gate (selective landing from `codex/kenney-mesh-audit`) | F4 |
| **P-C** town = street wedge (≤2 facades, 1 roof cap, 1 route, 1 practical, 1 prop, 2–4 citizens); `townSliceFrom` projection; no semantic aliases inventing dock props | **ACCEPT as refinement** of landed ENV-3/3b; budgets + provenance census adopted; facade-socket emission awaits F4 donors + Adam's facade packets | F5 (after F4 + L-wave census) |
| **P-D** a state beat earns a micro-stage (1 anchor + ≤3 support + 1 practical + minimal cast; states mutate the same scene graph) via a data registry consumed after `walkSceneFrom`, never event branches in theater-boot | **ACCEPT** — this is ledger #11 with a concrete recipe | F2 |
| **P-E** odd rolls = semantic substitution (`realizationClass` at the visual-recipe boundary; pseudo-glass caps; ≤8 sunk donors + one vein network) | **ACCEPT-DEFER** — sound, low frequency (d100 tail); specced now, built after F2/F5 | parked unit (F6) |
| **P-F** combat is a state layered on the explored room (byte-identical scene graph, units + grid overlay only, ≤10% camera tighten) via `trayFrom({kind:"interior"})`/`setInteriorBoard` instead of flat `setBoard` | **ACCEPT** — this is ledger #10 with a concrete recipe; the 10↔16 frame pair is the acceptance model | F1 |
| **Cut list** (no moon discs, no caustics, no whole-pack dumps, no 3D characters, no bespoke odd-roll kits, no inferred narrative props, no realistic grass/snow/water sim, no combat board swap) | **ACCEPT wholesale** — appended to each consuming unit's out-of-scope | all F units |

## 2. WAVE S — the sprite flip + inventory (fires first; this IS the "sprite-QA landing" that un-gates P3-2)

**Ruling being executed (Adam, 2026-07-15):** flip the runtime corpus to the faceted wave now,
keep the v3 corpus in reserve ("in case this direction is a failure"). This provisionally
supersedes §9 Step M's per-asset in-game-pass for the batch: the flip admits wholesale with
`qaStatus:"provisional-flip-2026-07-15"`; the B3 gallery + next lens run + Adam's editor rulings
are the retro-gate; one flag reverts everything. Old sprites are never deleted or overwritten
(§13 law): `assets/sprites/` stays byte-untouched; faceted cuts land in **`assets/sprites-faceted/`**.

- **S1 — land the corpus.** Merge `codex/faceted-f1-consolidation` → master (additive: 419
  candidate PNGs + packets F2–F15 + provenance + qa-ledger; `assets/sprites` unchanged on the
  branch — verified). Gate: no runtime file changes; check-manifest clean.
- **S2 — faceted cut pipeline** (`build/cut-faceted.py`, new). §9 Steps F+G for the faceted
  format: chroma removal (magenta #FF00FF, green #00FF00 fallback per §7.1), split multi-identity
  candidates by provenance `cells[]` (never assume one slug per file), component merge, crop to
  alpha + family padding, emit `assets/sprites-faceted/<slug>.png` + a sidecar
  `dev/model-qa/faceted-cut-report.json` (per slug: contentBounds, pxHeight, foot-contact
  estimate, source candidate, cells provenance). Model on `build/slice-sprites.py` (the proven
  keyer) but target the 887×1774-class 4:8 frames. Gate: ⊗ red-first (a fixture candidate with
  2 cells yields 2 cut PNGs); zero magenta residue at tolerance; every cut slug appears in the
  report; quarantined/crop-fail candidates excluded (respect `final-crop-fails.json` + qa-ledger
  rejects).
- **S3 — B1 registry contract + the faceted admission + THE INVENTORY.** Extend
  `build/gen-sprite-registry.py` per PHASE-3-WAVE-2-SPECS.md B1 (contract fields `footX`/`footY`/
  `worldHeight`/`contentBounds`/`alphaCutoff`/`shadowProfile`; admission fields `legacyAsset`/
  `candidateAsset`/`artStyleVersion:"faceted-v1"`/`qaStatus`/`runtimeAdmitted`). **Height
  inventory:** `worldHeight` derives from, in order: existing `feet` (corpus-sizing/v3-sizing
  joins) → SRD `size`-band default ladder (named table, tiny→gargantuan midpoints in feet) →
  loud `null` (no silent guess). **Tag inventory:** carry existing `tags` by slug; entries new
  to the faceted wave get the default `[realm,kind,role,type,size]` set. Emit
  `dev/model-qa/faceted-inventory-report.json`: per slug — tags, worldHeight, height *source*
  (measured|band-default|missing) — the artifact Adam red-pens. Gate: `verify-sprite-registry.mjs`
  extended red-first; `--check` clean; regenerated never hand-edited; default `runtimeAdmitted`
  keeps render byte-identical (the flip is S5, not S3).
- **S4 — miscast join fix (ledger P0 #1).** `spriteEntryFor` (theater-boot.js:2863) joins
  `recipeSlug` (a bestiary id) against registry display-`name` by normalization — the rat-as-
  robed-humanoid class. Add a deterministic id→slug map at the registry generator (bestiary id
  column joined at build time, not render time), keep name-join as fallback with a logged
  mismatch counter; never resolve via the `frame` field. Gate: ⊗ red-first fixture (a bestiary id
  whose normalized name collides resolves correctly); the L-wave census (L2) counts join outcomes.
- **S5 — THE FLIP.** `spriteTextureFor` resolves `candidateAsset` when the entry says
  `runtimeAdmitted:"candidate"`, else `legacyAsset` (today's path). Batch-set candidate admission
  for every S2-cut faceted slug via the generator (a `--admit-faceted` input, not hand-edits).
  Global kill switch `FACETED_FLIP_ENABLED` (theater-boot const, default true after gate) forces
  legacy corpus-wide — the one-flag revert Adam asked for. Guise audit: persisted
  `guise.forms[].spriteSlug` values bypass the name-join — slugs are UNCHANGED by the flip
  (same namespace, new art), assert so in the gate. Gate: flip on = faceted textures load
  (spot-fixture set incl. dire-wolf/skeleton/giant-rat); flip off = byte-identical to pre-wave;
  `verify-theater-shot`/`verify-dungeon-interior`/sprite harness green; capture card (same scene,
  legacy vs faceted, wolf+skeleton protection set) for Adam.
- **S6 — sprite-editor extension.** `dev/sprite-review.py`: serve `assets/sprites-faceted/` for
  candidate entries, display legacy-vs-candidate side-by-side, and add `feet` (expected height)
  to `ALLOWED_KEYS` so Adam's height tweaks flow overlay → regen → registry, same as
  scale/verdict/tags today. Gate: overlay round-trip writes `feet`; regen folds it; no
  registry hand-edits.

Then **P3-2 Stage B auto-fires** (Adam's standing delegation — S3 *is* the registry landing):
B2 physical standee ∥ B3 acceptance gallery → B4 kill size-inference, per PHASE-3-WAVE-2-SPECS.md
unchanged. B3's gallery doubles as the faceted-flip taste gate.

## 3. WAVE L — the lens matrix + demand census (parallel with S after S5; owns dev/ + shot-provenance only)

- **L1 — rig extensions (PL-1b + realm forcing).** The four ledger wishlist items: the bot FIGHTS
  (real attack/move events so rounds differ — also the honest re-test for P0 #2), transition
  camera focuses the transition room, shop-panel render verified in-capture, a record-less
  settlement node leg (the town builder's lens read, still owed). Plus: `--force-realm` (steer
  `bardoRollWorld` toward a target realm behind a dev-only flag; production stays unseeded) and
  `--route` variants (travel-heavy | dungeon-heavy | town+beats). Rig-only changes; game logic
  untouched.
- **L2 — the demand census instrument.** Extend `noteProvenance` (theater-shot.js:453) so every
  provenanced element also records its resolution outcome:
  `resolved | sprite-legacy | sprite-faceted | placeholder-card | cuboid | mottle | null-facade`.
  Instrument the five seams: `figureFor` cuboid tier, `spriteTextureFor` failed/pending,
  `dressingTextureFor` placeholder path, `materialFamilyFor` mottle fallback,
  `facadeTextureFile:null`. Emit `census.json` per play-lens run next to `manifest.json`.
  Read-only observation — zero behavior change (⊗ assert frames byte-identical with census on).
- **L3 — PL-4: the matrix runs + THE DEMAND LEDGER.** Runs: fantasy + gloom + chrome (forced),
  route variants × the fixed cross-section (each run already crosses boot/town/travel/dungeon/
  combat/shop/rest). Synthesize `dev/play-lens/DEMAND-LEDGER.md`: per setting, what the DM/theater
  REQUESTED, what RESOLVED (and to which corpus), what fell to placeholder/cuboid/null — ranked
  by frequency×visibility, naming the exact fill (sprite slug? dressing art? facade packet? beat
  prop?). This ledger + the play-lens ledger jointly order the F-wave and all future art packets.
  Combat legs also re-grade P0 #1/#2 honestly post-S4/S5.

## 4. WAVE F — the VQ2 build units (ledger-ordered, census-informed)

- **F1 — combat-in-room (ledger #10, Sol P-F).** Route interior combat through
  `trayFrom({kind:"interior"})`/`setInteriorBoard`; preserve walkScene, dressed plan,
  `activeRoomId`, tileKit, lights, recipe hash; enrich with `combat.units = theaterUnitsFrom(GS.combat).units`;
  map bands/lanes onto the active room's real `rooms[].cells` (dressing-blocked cells excluded)
  at the contract boundary; grid = thin umber lines on the room floor (`depthWrite:false`,
  `opacity:0.16`, polygonOffset, radial fade before wall-adjacent cells); camera yaw/pitch
  preserved, target/distance delta clamped 10%. Gate: Sol's deterministic
  exploration→combat→combat-end harness over rectangular/octagon/cave/tiered/overloaded rooms —
  identical scene recipe hash + interactable ids, zero new architecture/material/light instances,
  legal unique unit cells, camera within clamp, exact restoration after combat end. `pl-022`
  protected. Out of scope (cut list): extra torches, combat spotlights, board swap, camera reset.
- **F2 — staging-beat registry (ledger #11, Sol P-D).** A data registry consumed after
  `walkSceneFrom` (never event branches in theater-boot): `shop_open` (counter + 2 shelves +
  lamp + shopkeep/pc) · `shop_closed` (same instance ids, shutter state, lamp 0, shopkeep hidden) ·
  `long_rest` (campfire-pit + tent + bedroll + pc.seated) · `walk_complete` (rolled arrival
  feature + rolled areaType stage). Practical mounts before `applyLightProfile` so
  `S.lightPropAnchor` owns the light; stable ids across state changes; provenance on every entry.
  Gate: source ledger per capture — every noun resolves to beat grammar or a rolled field; ≤4
  prop instances, 1 bright practical, 0 unprovenanced nouns; beats visibly differ from the idle
  pedestal in captures. Cut list: no merchandise invention, no rest-implies-forest.
- **F3 — Stage E: exposure floor + emissive-masked bloom + the P-A gates (ledger #12/13).**
  The ledger spec as planned, now with Sol's measurable acceptance: exterior daylit tray-edge
  ≤12% display luma · profile medians separated ≥6% · PC-face luminance ≥18% in every profile ·
  no clipped white >3% of frame · `EXTERIOR_AMBIENT_FLOOR` (0.12 draft) split from
  `STAGE_AMBIENT_FLOOR` · perimeter falloff to 0.32 at tray edge (named consts, Adam re-tunes).
  Bloom gated by emissive mask so it stops re-blowing what AgX compressed; interior crush floor
  per ledger evidence. Gate: the four-profile W-GRASS-class capture with image-statistics
  assertions (the P-A RISK test, automated) + interior before/afters.
- **F4 — Kenney donor adapter pilot (Sol P-B).** One adapter at the GLTF boundary keyed
  `{pack, slug, admissionClass, semanticParts, sockets, canonicalScale}`: discard authored pastel
  materials, classify node/material names → `stone|wood|iron|roof|glass|cloth`, rebuild with
  Genesis recipes (roughness 0.82–0.94, metalness 0 except iron 0.35, five-band albedo through
  `gradeColorLocal`, nearest 32×32 grain via `interiorMaterialTexture`, realm outline), grime
  through the decal lane (naturalistic — the decal exemption, never faceted noise), cache
  normalized GLTF by recipe hash, source packs untouched. Pilot donors = the master-resident
  packs only: dungeon `room-small/gate-door/stairs`, graveyard `crypt/gravestone-cross/iron-fence/
  pine-crooked/lightpost-single/lantern-glass`. Gate: Sol's three-card bridge (raw /
  DIRECT_MODULATED / grey silhouette at gameplay size) — reject to CHASSIS if the source style
  is identifiable in the modulated thumbnail, any material off-palette, or >1 unowned bright
  source. Fantasy-town kit lands selectively ONLY after this gate passes.
- **F5 — town-slice refinement (Sol P-C; after F4 + L3).** `townSliceFrom(walkScene, seed)`
  emitting facade sockets with Sol's fixed budgets (≤2 facades, 1 roof cap, 1 route strip,
  1 curb family, 1 vehicle/trade prop, 1 practical, ≤4 citizens); motif/skin fields map to
  material treatments only when the rolled field licenses them (no dock props from the word
  "Harborfront"); facade/action-center anchors outweigh tray bounds in `composeShot`; settlement
  nodes keep the separate roof-cluster recipe (≤7 masses, 1 lit window, exterior standee headroom).
  Gate: provenance census (every instance has `sourceRef`), budget asserts, medium standee ≥18%
  frame height. Consumes L3's null-facade counts + Adam's facade/NPC-card packets when they land.
- **F6 (parked) — odd-roll realization classes (Sol P-E).** Specced per Sol (pseudo-glass
  MeshPhysicalMaterial recipe w/o caustics; ≤8 sunk donors + one seeded 64×64 vein mask, one
  pulse phase; `sourceRef` stamped). Fires after F2+F5 when the census shows odd-tail frequency
  warrants it.

## 5. The extrusion lane (plan now, build after B2)

`docs/EXTRUDED-SPRITE-PROP-LIBRARY.md` (on `codex/extruded-prop-pilot`, ES-0/ES-1 in progress,
three-core-realm scope locked) is the governing plan — it does not need re-authoring, it needs
**landing + reconciling**:

- **X1 —** land the spec + pilot artifacts to master (with `dev/model-foundry/` §3/§4/§7 prop
  canon the ART-DIRECTION-CANON already points at); reconcile with the faceted harvest: the
  consolidation branch's `p1props-returns/` (33 EXTRUDE-routed items) + `p4items-returns/`
  (375-item universe, 15 sheets) are the ES pipeline's input queue — index them in the ES plan's
  bank schema.
- **X2 —** the compiler slice: alpha contour → simplified polygon → `ExtrudeGeometry` (or
  build-time mesh emit) with front/back albedo from the cut sprite + side-shell material;
  §H classes only (EXTRUDE/FACED_BOX/MODEL — no fourth class, no flat-card revival);
  determinism + recipe-hash caching per the no-human contract. First tranche = §12 F1 pilot
  (wall shield/relief, tablet, switch kit, floor-trap kit, plaque/grate/sign).
- **Sequencing:** X1 rides Wave S (doc/index work, no runtime); X2 fires after B2 (physical
  standee) so the standee card and the extruded prop share the side-shell/plinth vocabulary
  rather than inventing two.

## 6. Execution order, dependencies, Adam's ledger

```text
S1 → S2 → S3 → S4 → S5 → S6        (serial-ish; S4 ∥ S3 possible — different files)
        └→ then P3-2: B2 ∥ B3 → B4  (standing delegation)
L1 ∥ (anything)   L2 after S5 (census reads the flip tiers)   L3 after L1+L2
F1, F2 after S5 (standees on the new corpus in their gates)
F3 after L3 evidence (its gates cite census + profile stats)
F4 independent (may run early)      F5 after F4 + L3           F6 parked
X1 rides Wave S                     X2 after B2
```

**Adam's red-pen ledger (nothing blocks; all reversible):**
1. The **flip taste call** — B3 gallery + the S5 legacy-vs-faceted card; `FACETED_FLIP_ENABLED=false`
   is the one-flag retreat.
2. The **inventory report** (`faceted-inventory-report.json`) — heights marked band-default are
   the ones worth his editor pass (S6 makes `feet` editable there).
3. **F3/F5 look consts** (ambient floors, falloff, budgets) — named tables, one place each.
4. The **cut-list adoptions** + P-E deferral — flag if any should move.
5. Sol's **Follow-up queue** stays live: implementation blockers go back to Sol via Adam, appended
   to SOL-SOLUTIONS.md, never rewriting P-A..P-F.
