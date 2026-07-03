---
type: system-spec
project: Genesis
status: SPECCED 2026-07-03 — T1 build-ready; T2 gated on pack download; RULED by Adam (low-poly 3D / FFT grammar / three.js / pre-built packs)
created: 2026-07-03
author: Fable (grammar grounded in FFT PS1 reference frames reviewed with Adam in-session)
related:
  - "[[DESIGN-GUIDE]]"       # T6 milestone; §II.0a — the battle-scene half of the style probe is now RULED
  - "[[BATTLE-VISUALS]]"     # Phase A (panel composition) proceeds unchanged; this doc IS Phase C, arrived early
  - "[[BLOCKWRIGHT]]"        # pivots to scenery/FX/fallback-figures; its diorama slot retires when T1 lands
  - "[[COMBAT-LIFECYCLE]]"   # the event stream the theater renders
  - "[[SPEED-DOCTRINE]]"     # zero model calls in the render loop; the theater is a pure event consumer
  - "[[DREAM-HORIZON]]"      # §0 TEXT-FIRST: the theater is an optional LENS; prose stays the game
---

# BATTLE-THEATER — the FFT-grammar three.js battle stage

## §0 The ruling (Adam, 2026-07-03)

Move to **three.js now**; use **pre-built low-poly packs**; keep **blockwright for scenery +
spell effects** unless the packs cover it; **environmental destructibility/modifiability**
matters; ship a **basic animation vocabulary for player imagination** ("if a player uses a
grappling hook to swing further than his basic moveset, or a crit's magnitude of absurdity
creates a hole in space-time, there should be something there"); think **FFT battlefields —
mostly rectangular blocks, now and then simple polygons for terrain incline.** The current
diorama is retired on sight ("it looks like an old autechre video").

This RESOLVES the battle-scene half of DESIGN-GUIDE §II.0a: **early-dev model style = low-poly
FFT.** The UI chrome stays engraved (the de-facto hybrid — low-poly scene in engraved chrome —
is the shipped state until a later probe says otherwise).

## §1 The FFT grammar (from the reference frames, 2026-07-03)

What makes an FFT field readable at a glance — each rule is binding on T1:

1. **Terrain is a heightfield of square tiles**, each a vertical-sided column with a flat top;
   heights step in DISCRETE half-unit increments. Slopes are the occasional single angled
   polygon between two heights — never smooth gradients.
2. **Top ≠ side**: tile tops and tile sides get strongly contrasted flat colors (grass top /
   dirt side). This one contrast does most of the legibility work.
3. **The board floats in void** (near-black background, no horizon) — figure/ground for free.
4. **Fixed isometric-feel camera** (orthographic, ~35° elevation), rotatable in 90° steps only.
5. **Units stand on tile centers**, ~1-tile footprint; props (rocks/trees/walls) are just
   taller decorated columns; water is a flat tinted tile set lower.

**Genesis mapping:** the board IS the zone grid extruded — bands = depth rows, lanes =
columns, each band×lane zone = a 3×3 tile patch (so a full 4×3 grid = 12×9 tiles; a 2-band
room = 6×9). `segment.dims` sizes it (the existing `cmZoneGrid` derivation), `scene.elevZones`
raises tile patches one step, cover objects render as prop columns at their zone, hazards tint
tiles, water/pit variants sink them. **One derivation, three views:** the same zone grid drives
the theater, the 2D tracker grid, and `cmbProseSummary` — they can never disagree.

## §2 Tech shape (no app-wide ES migration)

- **three.js vendored** at `vendor/three/` (MIT, version pinned, committed — the offline/
  no-CDN law). Loaded via ONE `<script type="module">` boot file (`src/ui/theater-boot.js`)
  that imports three and exposes a narrow classic-script API:
  `window.Theater = { mount(el), setBoard(data), setUnits(list), play(verb, opts), applyMod(mod), retire() }`.
  Classic scripts keep calling plain globals; module scope stays sealed inside the boot file.
  **The ES-module migration does NOT ride in with this** — the boundary is one file.
- Renderer: `WebGLRenderer`, **orthographic camera**, 90°-step rotation control, flat-shaded
  materials (`MeshLambertMaterial`, vertex-color tiles), **no shadow maps** — a dark blob quad
  under each unit (cheap, FFT-authentic). Budget: < 5k tris, zero per-frame allocations,
  render-on-demand (dirty flag; nothing repaints between events — SPEED-DOCTRINE hygiene).
- **Headless-testable by construction:** the board/unit/verb layer is PURE DATA
  (`theaterBoardFrom(segment, scene)` → `{tiles:[{x,z,h,kind,tint}], units:[{id,x,z,facing}]}` —
  an ordinary classic-script module, `src/engine/theater-data.js`, jsdom-verifiable like
  everything else). The GL half only consumes that data; it gets a browser smoke pass, not a
  jsdom harness.
- Degrade: no WebGL / module load fails → the slot hides, the tracker grid + prose stand alone
  (TEXT-FIRST §0 — the theater is a lens, never load-bearing).

## §3 Models — procedural low-poly figures ARE the creatures (RULED, Adam 2026-07-03 evening)

**Ruling: run with the 3D low-poly models.** The sprite/billboard route (explored same day:
ChatGPT sheet manifests + slicer, `docs/SPRITE-SHEETS.md`) is **retired** — browser-driven
generation proved too slow to operate, and the angular procedural minis fit the deeper ethos:
*"leave room for imagination to do the work."* The VS-proportioned composed-cuboid archetype
figures (T1.5) are promoted from "fallback" to **the creature representation**, placeholder-tier
per §II.0b like everything else. The upgrade path when art arrives is real gritty low-poly
MESHES (commissioned / artist-directed / matured AI gen) swapping in per-archetype through the
same manifest seam — never cartoony packs (Quaternius rejected 2026-07-03 as tone-setting).
The sprite pipeline (manifests + slicer) stays in the repo, parked, in case pixel-art ever
re-enters through an artist's hands.

### §3-history (superseded original: packs first, procedural fallback always)

- **Packs:** Quaternius (CC0 — Ultimate Monsters / RPG Characters / Fantasy RPG) + Kenney
  (CC0 — fantasy kits) in glTF. Stored at `assets/models/` with `ATTRIBUTION.md` capturing
  pack, source URL, license, download date. **Pack download is a gated pre-step** (network +
  Adam's go); everything in T1 ships before any pack exists.
- **Mapping is data:** `data/theater-models.js` maps `creatureType × size` (both already on
  every resolved foe) → `{file, scale, tint}`. ~12 archetype entries cover the 510-entry
  bestiary; named/leader foes may pin specific models later.
- **The fallback tier is first-class:** any creature with no pack match renders as a
  **composed-cuboid figure** (biped/quadruped/flyer/serpent/swarm kits — 3–8 boxes, built in
  three.js from the same seeded determinism blockwright uses). No creature is ever a bare slab
  again, packs or no packs. (This absorbs the BLOCKWRIGHT-KITS idea; a separate CSS-3D kit
  unit is dropped.)
- The PC + companions: distinct silhouette + a gold ring decal at the base (the banked ring
  art's job moves into the theater as a texture).

## §4 The animation vocabulary — imagination support (the point of the whole thing)

A small library of **named verbs**, each a cheap parametric tween on position/rotation/scale —
no skeletal rigs in v1. The engine owns WHEN (events); the theater owns HOW it looks:

| verb | motion | fired by |
|---|---|---|
| `advance` / `withdraw` | glide between zone centers | `move_zone` |
| `strike` | lunge toward target + recoil | `attack` / `foe_action` hit or miss (miss = overshoot) |
| `hurt` | flash + jitter | damage application |
| `down` | topple 90° + desaturate | foe/PC hits 0 |
| `cast` | rise + orbiting glyph quad | `cast` |
| `arc` | parametric arc between ANY two points (jump, thrown, **grappling-hook swing**) | `stage_fx` |
| `knockback` | fast slide + bounce | shove/blast `stage_fx` |
| `sink` / `burst` | descend into / erupt from a tile | burrow, ambush reveal |
| `flee` | sprint to board edge + fade | `foe_morale` flee |
| `absurdity` | **the reality tear**: a void-black rift quad + emissive rim + camera shake + tile flicker, SCALED by the crit-magnitude die | `crit_outcome` |

- Spell/impact FX: blockwright-idiom **primitive bursts** (colored boxes/planes/`THREE.Points`)
  keyed by damage type — fire/frost/lightning/necrotic each get a tint + motion signature.
  Packs are NOT used for FX; primitives are the low-poly point ("low cost to do a wide
  variety of things" — the ruling, verbatim intent).
- **`stage_fx` (new applyEvent case, additive):** `{verb, who?, from?, to?, note?}` — the DM's
  hand for improvised beats the fixed events don't carry (the grappling swing). It ledgers a
  prose line (the twin) and forwards to `Theater.play`. Unknown verbs no-op safely.
- Existing events need NO new fields — the theater subscribes to the ledger/event stream and
  maps semantics it already carries (attacker, target, damage, crit magnitude, zones).

## §5 Destructibility / modifiability (D&D battles run on imagination)

- **`terrain_change` (new applyEvent case):** `{op, zone|tiles, note?}` with v1 op vocabulary
  `break | burn | flood | collapse | raise | hole`. Effects: prop → rubble scatter (its own
  cuboids tumble), tiles tint scorched, tiles sink to water, patch drops a step, patch rises a
  step, **tiles removed entirely — the void shows through** (the space-time hole comes free
  with the void background).
- Mods append to `GS.combat.scene.mods[]` so any re-render (or a reload re-declare) replays the
  board deterministically. Each ledgers its prose line. Mechanical consequences stay where
  they already live (cover/elevation/hazard fields — the theater renders state, never rules).
- DM-declared (or detected off hazards later); the runbook's fight section gains two lines:
  *when the fiction breaks the field, say so with `terrain_change`; when a player improvises
  movement the verbs don't cover, stage it with `stage_fx`.*

## §6 Panel placement

The theater takes the retired diorama's slot atop the combat panel, sized ~16:9 of the panel
width. The 2D zone grid below it stays the tap/command surface (BATTLE-VISUALS Phase A
unchanged), `cmbProseSummary` stays the accessible truth (BLIND-PLAYABLE untouched). Rotation
control: one ⟳ button, 90° steps.

## §7 Build ladder (units for the wave; estimates in WAVES, not weeks)

- **T1 `feat/theater-core`** — vendor three + boot module + `theaterBoardFrom` (pure data) +
  board render (tiles/heights/void/ortho camera/rotation) + placeholder units (fallback-kit
  figures at zone centers) + mount behind `GS.flags.theater` default ON with clean degrade +
  `dev/verify-theater-data.mjs` (pure-layer, red-first: dims→tile counts, elevZones raise,
  hazard tints, band/lane→tile-center math, mods replay). Browser smoke + screenshots as the
  visual gate. *(One wave unit.)*
- **T2 `feat/theater-models`** — pack manifest + glTF loader + type/size mapping + tint
  variants. *(Gated on the pack download pre-step.)*
- **T3 `feat/theater-verbs`** — the verb library + event→verb subscription + `stage_fx` seam +
  the absurdity tear. *(One wave unit; the seam edit in dm.js is ~20 lines.)*
- **T4 `feat/theater-terrain`** — `terrain_change` + mods replay + rubble/void ops. *(One wave
  unit.)*
- T1 ∥ T3-seam can run parallel; T3 visuals and T4 build on T1's scene. DM-BRIDGE runbook +
  EVENT-CONTRACT rows ride whichever unit lands its event.

## §8 Supersessions & doc coherence (do in the same change as T1)

- `BATTLE-VISUALS.md`: §B marked RESOLVED-for-battle (this ruling), §C pointer → this doc.
  Phase A proceeds unchanged EXCEPT the diorama-toggle item becomes "diorama slot replaced by
  the theater (T1)".
- `BLOCKWRIGHT.md` header note: pivoted to scenery/FX idiom + the fallback figure kits inside
  the theater; the CSS-3D diorama surface retires with T1.
- `DESIGN-GUIDE.md` §II.0a: record the partial ruling (battle scene RULED low-poly FFT
  2026-07-03; UI chrome stays engraved pending any later probe). T6 status: IN BUILD.
