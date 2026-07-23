# MATERIAL-LANE.md — the Material Maker pipeline: methodology, taste gate, engine ladder, mutator plan

**status: FOLDED INTO CANON 2026-07-23 (Fable gate session, on Adam's instruction) — this file
remains the material lane's source of truth.** The §8 checklist was executed same-day: ADC
correction + SUBTLE-TEXTURE split + PSX residue appended (decision-capture), GPRW headless gate
flipped PASSED, OFFLINE-ART-FOUNDRY ruling + toolchain.json pin updated, HANDOFF annotated,
MATERIAL-IDENTITY reconciled, NEXT-STEPS registered, charter §5 adoption entry added. The Codex
authoring handoff is `docs/CODEX-MATERIAL-BRIEF.md`. Stage A is open now (dev tooling/offline
authoring); Stage B queues behind the visual-proof track (C1I window) per §6.

Provenance: authored 2026-07-23 from the Material Maker crash investigation + Adam's design
consult (this session). All rulings quoted below with dates are Adam's.

---

## 1. Standing facts (established 2026-07-23, evidence in-session)

### 1a. The hardware ceiling
The gate machine (MacBookPro15,4, Intel Iris Plus 645, 16 GB, macOS 15.7.7) **cannot run
Godot-4-based apps** — Material Maker 1.7 (Godot 4.7) crashes in every renderer (Vulkan
forward_plus, Vulkan mobile, GL compatibility, ANGLE-absent). Root cause: the Iris 645's
Metal and legacy-GL shader compilers both fail on Godot-4-era shaders ("AIR builtin function
was called but no definition was found"), and the app derefs the failed null resources. Not
fixable by flags. **Adam's machine is the gate on the game** (his ruling): everything must run
here; beauty shots may come from a higher-end sandbox, but the playable target is this GPU.

### 1b. The pinned tool
**Material Maker 1.3** (last Godot-3.5.2 release with a macOS build) is installed at
`/Applications/Material Maker 1.3.app`, verified working end-to-end (node graph → shader →
3D preview, 40–97 FPS). Binary sha256 prefix `597b199fae597c4f` — this is the **pinned
executable** the adoption doctrine requires. The 1.7 app has been deleted (Adam trashed it
2026-07-23). Canon still says 1.7 in several places — see §8.

### 1c. Headless compile contract — PROVEN
The charter's blocking gate ("export without GUI interaction on the supported machine",
GRAPHICS-PRODUCTION-RESEARCH-WAVE.md:146; "GUI-only authoring" is a reject trigger,
GRAPHICS-CONVERGENCE-CHARTER.md:243) is **passed**:

```
"/Applications/Material Maker 1.3.app/Contents/MacOS/material_maker" \
  --export-material --target "Godot/Godot 4 ORM" -o <outdir> <graph>.ptex
```

- Runs windowless, initializes GLES3 on the Iris 645, exits clean.
- Valid targets: `Blender`, `Godot/Godot 3 Spatial`, `Godot/Godot 4 ORM`,
  `Godot/Godot 4 Standard`, `Unity/3D`, `Unity/HDRP`, `Unreal/Unreal Engine 4`,
  `Unreal/Unreal Engine 5`. **`Godot/Godot 4 ORM` is ours** — it emits
  `<name>_albedo.png`, `<name>_normal.png`, `<name>_orm.png` (AO=R, Roughness=G,
  Metalness=B), which is exactly the channel packing three.js reads natively.
- **Determinism proven**: two independent exports of the same `.ptex` produced
  byte-identical PNGs (sha256-verified). Same graph + same params → same bytes.
- **`.ptex` files are JSON** — node graphs are text documents. Codex (the art department)
  authors and mutates them directly; the GUI is for Adam's taste passes only. No MCP server,
  no automation scaffold: the compile step is a plain shell invocation Codex already runs.
- Boundary law (unchanged from Adam's 2026-07-22 ruling): MM is an **offline compiler**,
  never runtime authority, never a player dependency. The engine consumes exported PNGs only.
- Caveat: headless export still initializes a GL context — it works on this Mac as-is; a
  GPU-less cloud sandbox would need extra scaffolding. Keep material compilation local.

### 1d. The renderer cost model (what materials cost on the gate machine)
- **Texture memory is a non-issue at sane sizes.** GPU cost = w×h×4 bytes ×1.33 (mips):
  full PBR set (albedo+normal+ORM) ≈ **4 MB at 512²**, 17 MB at 1024², 67 MB at 2048².
  Only one realm is resident at a time; a realm's surface set at 512² is ~15–20 MB. Fine.
  MM's default export is 2048² — export resolution is a build flag, and 512² (or 256²) is
  both cheaper and closer to the texel-density register.
- **Fragment cost × resolution is the real gate.** `MeshStandardMaterial` (required for
  normal/roughness/metalness) costs ~2–3× `MeshLambertMaterial` per fragment. The renderer
  currently runs the drawing buffer at `min(devicePixelRatio, 2)` = **DPR 2 on the gate
  machine** (~4M fragments fullscreen) — the exact setting Adam manually undoes in every
  other game he plays here ("I have to run at 50% resolution", 2026-07-23).
- **The DPR trade (the doorway everything walks through):** DPR 2→1 frees 4× the fragment
  budget; Standard costs 2–3×. Therefore **DPR 1 + full PBR + normal maps is CHEAPER than
  today's DPR 2 + flat Lambert** (~0.5–0.75× the fragment work) — the vision look and higher
  FPS at the same time. Genesis-specific cushion: only the theater canvas drops resolution;
  all text/UI is DOM and stays retina-sharp regardless.
- Forward renderer: Standard's cost scales per dynamic light. Keep ≤2–3 (the LIGHT RIG LAW
  rig — one soft key + practicals — already complies, and raking practicals are the ideal
  rig for normal maps).
- Channel menu: albedo (`map`, works on Lambert today, free); roughness+AO+metalness (one
  ORM texture, needs the Standard switch, then ~free); normal (moderate, biggest visual
  payoff under the practicals); **metalness reads dead-charcoal without an envMap** — needs
  one small shared PMREM environment per realm, do only when chrome demands; opacity via
  `alphaTest` cutout is cheap (already used on sprites), blended transparency sparingly,
  `transmission` never on this GPU. Displacement/parallax: skip. SSAO post: skip (gate GPU).
- Filtering: albedo may stay crisp/nearest per the pixel register; **normal and ORM maps use
  linear filtering** (nearest-filtered normals sparkle). Mixed per-map filtering is correct.
- Wiring detail: depending on the pinned three revision, `aoMap` may want a second UV set —
  check at implementation time.
- WebGL/three limits: none blocking. 16 guaranteed texture units (PBR uses ~5–7); Chrome's
  ANGLE→Metal path is ironically the most stable GPU stack on this machine. Uncompressed
  textures until/unless a KTX2/Basis pipeline is adopted (real 4–6× win; defer — only pays
  at resolutions the gate machine shouldn't run anyway).

### 1e. SUBTLE-TEXTURE law — principle survives, implementation clause retires
The law (GRAPHICS-ENGINE.md:59, theater-materials.js) has two separable halves.
**Principle (KEEP, becomes the taste-card review bar):** low-contrast, readable-at-glance,
"never noisy, never photographic" — the stage stays quiet so the standees stay the stars.
**Implementation clause (SUPERSEDED by MM output):** 64px boot-time procedural CanvasTextures,
grain 0.07–0.12 — written when the painters were the only texture source. The painters remain
the canonical FALLBACK for surfaces without an admitted MM material.

### 1f. PSX residue inventory (PS1 already retired game-wide — HANDOFF.md:1959, BW2-0)
Legacy, steer-by-no-longer: `psxEnabled`/`PSX_RES_SCALE` escape hatch (default false);
`assets/textures-psx/` + manifest (ACTIVE generic tile/prop texture source despite the name —
this is precisely what MM output supersedes; rename when it does); the `antialias:false`
"PSX authenticity" comment (visually fine at high DPR, rationale stale); the PS1 shader on
the parked model lane. **NOT residue (KEEP):** NearestFilter on sprite/albedo texels and the
TEXEL DENSITY LAW — those serve the pixel canon, not PS1 nostalgia.

---

## 2. Stage A — MATERIAL TASTE CARDS (Adam approves before any engine wiring)

**The gate: no material touches the engine until its card is PASS-ruled.** Same review
grammar as the sprite review tool (pass/fail rulings persisted, rulings fold into a registry).

### 2a. What a taste card is
One card per material (or mutator strip), a single deterministic PNG composed of:

1. **1:1 tile** — the albedo at native texels, crisp, unlit. (Does the material read?)
2. **3×3 tiled field** — same map repeated. (Does it tile? Repetition artifacts? Seams?)
3. **Lit slab render** — floor slab + wall slab under the Genesis LIGHT RIG LAW rig (one
   soft key + one raking practical), rendered with `MeshStandardMaterial` + the full
   albedo/normal/ORM set, **in a three.js harness, not MM's viewport**. Taste is judged in
   the target renderer; "looked great in MM, dead in engine" dies here.
4. **Sprite-context strip** — the same lit slab with one canonical standee sprite standing
   on it. This is the SUBTLE-TEXTURE principle made testable: *does the stage fight the
   actor?* A material that upstages the sprite FAILS regardless of how good it looks alone.
5. Metadata footer: slug, family, intended realm(s), `.ptex` path + params hash, export
   resolution, output sha256 prefix, date.

### 2b. The harness + review loop
- `dev/material-cards.mjs` (to build): loads exported map sets, renders cards headlessly
  (jsdom+GL or a small local page under the existing review-server pattern), deterministic
  output. Card PNGs land in `dev/material-cards/out/` (gitignored until admitted).
- Review UI: extend the sprite-review pattern (localhost tool, PASS/FAIL/notes per card,
  rulings persist to `dev/material-cards/rulings.json`). Adam rules; only PASS materials
  proceed to Stage B. FAIL notes route back to Codex as graph revisions.
- Batch flow: **Codex authors `.ptex` → headless export → card render → Adam rules → PASS
  set advances.** Mutators are reviewed as strips (see §5a) with the same PASS/FAIL gate.

---

## 3. Coverage roster ("every standard texture imaginable")

Organized by the charter's recipe grammar (family × construction). Waves are priority order.

**Wave 1 — supersede the existing recipe keys (drop-in demand).** The ~12
`FLOOR_MATERIAL_RECIPES` keys already rolled by `REALM_SURFACES` are the live demand list:
flagstone, cobble, cracked-earth, cave-rock, grass, plank, mud, metal-panel, and siblings.
One MM material per key, so the painter fallback can be superseded surface-by-surface with
zero data-shape change.

**Wave 2 — realm flagship gaps.** Whatever each of the 11 realms' floor/wall/trim needs
that Wave 1 didn't cover (chrome: brushed steel, corrugated, grate-cutout; suburb: concrete,
asphalt, painted drywall; lost-world: overgrown stone, coral, bone; gloom: rotted plank,
slate, moss ground; bright-kingdom: dressed ashlar, glazed tile, parquet; cosmic/astral:
obsidian, crystal; etc.).

**Wave 3 — the full standard library.**
- Stone: brick, rough-hewn block, ashlar, rubble, marble, slate, sandstone.
- Wood: wall plank/siding, beam, log, parquet, thatch.
- Earth: sand, gravel, clay, snow, ash, turf.
- Metal: iron plate, riveted panel, rusted sheet, polished/chrome, mesh (cutout).
- Fabric/organic: canvas, carpet, leather, rope-wrap, flesh/chitin, bone, coral.
- Ceramic/build: glazed tile, mosaic, plaster, stucco, wattle-daub, concrete, asphalt.
- Exotic: ice, obsidian, crystal, void-stone (realm-specific one-offs).

Coverage requirement at close: every realm's floor+wall+trim mappable from PASS-ruled
materials; every existing recipe key covered 1:1.

---

## 4. Stage B — engine implementation ladder (after taste approval only)

1. **Albedo widening (zero engine change).** PASS-ruled albedos enter `REALM_TEXTURES`
   (theater-interior.js) — the registry shape already widens 3→11 realms and adds variants
   with no code change. Immediate, cheap, diffuse-level win.
2. **The clay-room experiment (P10.10's first real numbers).** Four cells on the gate
   machine: {DPR 2, DPR 1} × {Lambert flat, Standard + MM albedo/ORM/normal}, measured with
   `renderer.info` + the async timer-query law. Hypothesis on record: DPR 1 + Standard beats
   DPR 2 + Lambert on both beauty and FPS. The measured numbers become the first ratified
   budget lines.
3. **Standard switch + map wiring** for the large surface meshes only (floors, walls,
   pillars — the few draws covering most pixels), behind a quality-tier flag. Props, sprites,
   glow stubs stay Lambert/Basic.
4. **Render scale becomes a first-class quality setting** (auto-defaulted per machine; DPR
   1–1.25 expected on the gate machine). Protected-core renderer change — rides with the
   experiment, never hot-patched.
5. **Trim GL-wiring** (already owed — trim textures registered but not wired) using
   PASS-ruled trim-sheet content per TRIM-SHEET-PIPELINE.
6. **envMap + metalness** only when chrome earns it (one shared low-res PMREM per realm).
7. Asset convention: `assets/materials/<slug>/{albedo,normal,orm}.png` + a generated
   manifest keyed by slug; `assets/textures-psx/` naming retired as it's superseded.

Acceptance per unit: WIRING LAW (production entry points, not harness-only), A/B visual
captures, deterministic regeneration, budget lines from step 2. Quality tiers are a
**re-export, not a re-author**: same `.ptex` graphs at 512² for the gate tier, 2048² + env
for the beauty sandbox.

---

## 5. The mutator plan — condition as a rolled fact, expressed twice

### 5a. Texture half (MM filter subgraphs)
A **mutator** is a reusable MM filter node with an `amount` parameter, appended after a base
graph: `brick → algae(a) → crumble(b)`. New castle = both at 0; ancient dungeon = algae 0.7,
crumble 0.5. Same brick graph, no re-authoring. Planned mutator library (each authored ONCE,
composable across every base): algae/moss, crumble/chip, rot, warp, rust, scorch, wet/damp,
dust, frost, overgrowth, wear/polish, grime. Key MM capability: mutators key off the base
graph's own **height output** (height → curvature/AO → masks), so grime settles in mortar
lines and wear brightens brick edges automatically — texture-space "knows where the crevices
are." (Mesh-space smart-material texturing — dirt in the actual 3D room's corners — is the
Substance Painter technique; per the charter split it applies to UV-baked hero props later,
not procedural architecture. Adobe docs remain the authorized research source for rebuilding
those mask behaviors as MM nodes.)

Taste-carding mutators: reviewed as **strips** — base → 25% → 50% → 100% — same PASS/FAIL.

Combinatorics control: variants are exported **on demand per accepted site archetype**, never
exhaustively (30 bases × 12 mutators × levels would explode). A realm carries a curated
mutator palette (≤2 active mutators per site), and exports bucket amounts (0/33/66/100).

### 5b. Map-roller half (the anti-drift half — engine owns the nouns)
Condition must be a **rolled world fact**, not an art-side whim. Proposal for the folding
session to spec fully:

- The room/site roll gains a **condition vector** — age, moisture, overgrowth, damage —
  derived deterministically from already-rolled facts (realm, areaType, depth, site history)
  and the seed. The script rolls it; nothing invents it downstream.
- The vector selects the pre-exported variant bucket (nearest bucket per dominant mutator;
  runtime map blending is deferred shader work — buckets first).
- **The same vector drives everything that expresses condition:** the texture variant, decal
  density (spot accents stay runtime decals — mutators set site-wide character, decals mark
  "THIS wall took the fireball"), foliage-card placement (the moss mask doubles as the grass
  tuft spawn map — CARD LAW cross-pair cards, alpha-cut, shadow-casting, instanced), and the
  DM's prose ("algae-slick ancient stone") — script owns the condition, art and narration
  both express the same fact. This is the anti-drift mechanization pattern applied to
  surfaces.

### 5c. Grass / foliage cards (Adam 2026-07-23)
Perpendicular-to-floor grass sprites are already law — GRAPHICS-ENGINE.md CARD LAW (cross-pair
alpha-cut shadow-casting cards; the sprite pipeline generates per-realm foliage sheets). The
engine already runs the technique (alphaTest + customDepthMaterial on figure standees).
New here: placement masks come from the condition vector / mutator masks per §5b.

---

## 6. Sequencing + gates

- Q12-B remains the build gate (NEXT-STEPS.md:90 "nothing builds before Q12-B fires").
  Stage A (taste cards) is **dev tooling + offline authoring** — it can proceed as research
  lane; Stage B units are build work and queue behind the gate unless Adam schedules
  otherwise. The declared visual proof track (clay-room → texture pass → guard's post)
  is the road this lane rides.
- MM never becomes runtime. The roller consumes exported artifacts only.
- Nothing in this file edits canon. Folding is §8, owed to a future session.

## 7. Open questions for Adam (to rule at taste-card review time)

1. Card export resolution for review vs production (review at 512², production TBD by the
   clay-room numbers?).
2. Neutral-tinted cards vs realm-tinted variant rows (the engine currently tints
   procedurally; do cards show base + tint swatch row?).
3. Mutator palette per realm (which ≤2 mutators each realm leans on) — taste call.
4. Whether sprite-companion channels (normals ON sprites) enter this lane or stay parked
   (canon requires sprite-scale review either way).

## 8. Folding checklist (for the future Fable session — mechanical)

- [ ] ART-DIRECTION-CANON.md:1170 — correct 1.7 → 1.3, note 1.7 deleted + why (hardware
      ceiling), pin sha `597b199fae597c4f`, path `/Applications/Material Maker 1.3.app`.
- [ ] ART-DIRECTION-CANON — append the SUBTLE-TEXTURE principle/implementation split (§1e)
      and mark the PSX residue inventory (§1f) as legacy per the decision-capture rule.
- [ ] GRAPHICS-PRODUCTION-RESEARCH-WAVE.md:146 — headless gate: **PASSED** (evidence §1c);
      JS/Pillow recipes remain canonical fallback until Stage B supersession.
- [ ] OFFLINE-ART-FOUNDRY-RESEARCH.md:231 — "defer pending macOS headless proof" → proof
      delivered; move to adopt-candidate with pinned binary.
- [ ] HANDOFF.md:475 — update MM status line (1.3, headless-proven, taste-card gate defined).
- [ ] NEXT-STEPS.md — register Stage A/B units in the visual proof track.
- [ ] MATERIAL-IDENTITY.md — reconcile (its per-realm normal-map spike is subsumed by this
      lane's Stage B step 3).
- [ ] DPR/render-scale quality setting — protected-core change, needs its charter entry.
- [ ] Cowork memory — update the graphics-convergence memory with the lane's existence.
