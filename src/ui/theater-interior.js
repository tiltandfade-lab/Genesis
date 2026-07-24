/* GENESIS MODULE — src/ui/theater-interior.js — DUNGEON-GRAPH U3: the volumetric interior renderer
   (docs/DUNGEON-GRAPH.md "Build units" U3). Classic <script> (shared global scope) — NOT the ES-module
   boundary (that stays sealed to src/ui/theater-boot.js, CLAUDE.md's one documented exception). This
   file mirrors src/engine/theater-data.js's own discipline instead: it turns SEMANTIC DATA (a U1/U2
   SpatialPlan) into PLAIN INSTANCE-TRANSFORM DATA — no THREE, no canvas, no DOM — and hands that data
   to theater-boot.js (window.Theater.setInteriorBoard) to actually build geometry. Registered in
   manifest.json + genesis.html, loaded directly after theater-data.js (same "data layer before the GL
   layer" load-order convention place-spatialize.js -> place-semantics.js -> theater-data.js already
   establishes).

   WHY A SEPARATE FILE (not folded into theater-boot.js, per the spec's own instruction): keeps the ES-
   module boundary's already-large figure/board machinery from growing a second concern, and keeps this
   unit's own pure-data logic independently readable/testable (dev/battle-gate/capture-interior-study.mjs
   drives it directly in a real browser without needing to touch theater-boot.js's module internals).

   BRIDGE TO THE ES-MODULE BOUNDARY: top-level `function` declarations in a classic script attach to
   `window` automatically (var semantics) — a plain classic-script->classic-script consumer (this file
   reads SPATIAL_CELL as a bare identifier, same as place-semantics.js does) never needs this. But
   theater-boot.js's ES-module scope is SEALED (src/ui/ref-globals-bridge.js's header comment documents
   the same root cause) and can only reach in via `window.`, and `const INTERIOR_TILE_KITS` specifically
   would NOT auto-attach (only `var`/function declarations do) — so both symbols are explicitly
   republished onto `window` at the bottom of this file, mirroring ref-globals-bridge.js's convention.

   interiorBuildBoard(plan, opts) → InteriorBoard (this unit's own data shape, see the function's own
   doc comment below): GRID LAW — 1 SpatialPlan cell = 5 ft = 1 world unit (theaterNodeBoardBuild's own
   divergence note in theater-data.js: "every OTHER trayFrom branch derives its grid from cmZoneGrid...
   a minted place already carries its own real footprint in cells... does NOT run it through cmZoneGrid's
   patch derivation at all" — this unit follows that SAME literal 1-cell-1-tile convention, not the
   zone-patch abstraction combat boards use).

   DETERMINISM: pure function of (plan, opts) — no Math.random/Date.now. plan is already deterministic
   (U1/U2's own seeded-RNG discipline); this file adds none of its own (every pillar/wall/door placement
   below is a plain geometric derivation off already-fixed room/cell data). */

// ─── realm tile kits (law 3: chrome/gloom/fantasy minimum, GR1 extends to all 12 realms below;
// THEATER_ENV_PALETTE reused as the no-kit fallback's neutral base, per the spec's "reuse
// THEATER_ENV_PALETTE where it fits") ───────────────────────────────────────────────────────────────
// DUNGEON-GRAPH.md U3 iteration-2, ruling 2 (real environmental light sources): each kit also names
// its own light FLAVOR — chrome reads as cool wall-strip/lamp fixtures (an artificial-light realm),
// gloom/fantasy read as open-flame torches (a pre-industrial realm) — `lightKind` drives which
// interiorBuildLightMarker shape theater-boot.js builds (lamp = a short horizontal strip; torch = a
// vertical flame quad), `lightColor`/`lightIntensity` are the PointLight's own color/brightness.
// floorPattern/wallPattern are RETIRED as of GR1 (docs/GRAPHICS-ENGINE.md build unit GR1, §E TEXTURE-
// PER-REALM): every kit's floor/wall texture is now a REALM_MATERIALS-driven procedural material
// painter (src/ui/theater-materials.js's materialTexturePixels, baked into a real CanvasTexture by
// theater-boot.js's interiorMaterialTexture) — the old 2-tone pattern-grid texture path
// (interiorPatternTexture) is gone from the wiring below the kits. Kits keep floorColor/wallColor/
// trimColor (still the flat trim/doorframe/pillar color, and the palette anchor REALM_MATERIALS' own
// entries paint the material AROUND) + fog + light flavor, unchanged in shape from U3.
// GR3 (docs/GRAPHICS-ENGINE.md build unit GR3, LIGHT RIG LAW): each kit's own `grade` field —
// {tint, strength, fogWhisper} — REPLACES the old ad-hoc per-kit `fog.density` numbers (GR1-era kits
// each hand-picked a density 0.02-0.035 with no shared rationale; GR3's taste ruling is explicit:
// "fog off by default except a whisper where the realm earns it — gloom keeps a whisper, others 0").
// `tint`/`strength` feed theater-boot.js's existing gradeColorLocal (the SAME GL-side grade mirror the
// flat standing table already uses for its own REALM-RENDER-STYLE profile — GR3's "apply the same
// hemisphere+grade to the flat standing table" parity is the shared FUNCTION, not a duplicated table)
// — strength is a tint-blend fraction, bound LOW (<=0.15, GR3's own acceptance) so it reads as a mood
// wash on the void/fog backdrop, never a color-replace. `fogWhisper` is the interior board's own fog
// density default (setInteriorBoard reads kit.fogWhisper off tileKit, below) — 0 for every realm
// except gloom, which keeps the tiniest whisper (its own crypt-fog identity, GR1 era already implied
// this by giving gloom the densest ad-hoc fog of the three original kits).
const INTERIOR_TILE_KITS = Object.freeze({
  chrome: Object.freeze({
    realmId: "chrome",
    floorColor: "#8fa6b0", wallColor: "#3d525d", trimColor: "#d8f0f8",
    fog: Object.freeze({ color: "#0d1518" }),
    grade: Object.freeze({ tint: "#bfe8ff", strength: 0.08, fogWhisper: 0 }),
    lightKind: "lamp", lightColor: "#bfe8ff", lightIntensity: 1.1
  }),
  gloom: Object.freeze({
    realmId: "gloom",
    floorColor: "#453b4d", wallColor: "#2a222e", trimColor: "#6b5878",
    fog: Object.freeze({ color: "#0a0710" }),
    grade: Object.freeze({ tint: "#6b5878", strength: 0.12, fogWhisper: 0.015 }),
    lightKind: "torch", lightColor: "#ff9a44", lightIntensity: 1.3
  }),
  fantasy: Object.freeze({
    realmId: "fantasy",
    floorColor: "#7a6248", wallColor: "#4a3b2c", trimColor: "#c9a85c",
    fog: Object.freeze({ color: "#120d08" }),
    grade: Object.freeze({ tint: "#ffb347", strength: 0.07, fogWhisper: 0 }),
    lightKind: "torch", lightColor: "#ffb347", lightIntensity: 1.3
  }),
  // ─── GR1: the other 9 realms (docs/GRAPHICS-ENGINE.md GR1 acceptance — "cover ALL 12 realms"),
  // identity colors pulled from each realm's own Setting/Palette lines in
  // dev/model-qa/regen-v3/<realm>.md (grep'd verbatim at authoring time, cited per kit below) ────────
  ash: Object.freeze({
    // regen-v3/ash.md: "volcanic ash wasteland — basalt hide, ember cracks, rust, toxic biolume" /
    // "grey-ash base with ember orange and toxic green accents"
    realmId: "ash",
    floorColor: "#46423d", wallColor: "#2f2c28", trimColor: "#ff6a2e",
    fog: Object.freeze({ color: "#1a1613" }),
    grade: Object.freeze({ tint: "#ff6a2e", strength: 0.1, fogWhisper: 0 }),
    lightKind: "torch", lightColor: "#ff7a3d", lightIntensity: 1.3
  }),
  "bright-kingdom": Object.freeze({
    // regen-v3/bright-kingdom.md: "bright toy kingdom rebuilt in Nintendo-era video-game vocabulary" /
    // "rich storybook palette with real shadow"
    realmId: "bright-kingdom",
    floorColor: "#c9a15c", wallColor: "#8a6d4a", trimColor: "#f4d35e",
    fog: Object.freeze({ color: "#221a10" }),
    grade: Object.freeze({ tint: "#f4d35e", strength: 0.06, fogWhisper: 0 }),
    lightKind: "torch", lightColor: "#ffcf6b", lightIntensity: 1.2
  }),
  cosmic: Object.freeze({
    // regen-v3/cosmic.md: "midnight cosmic-Egyptian realm — deep navy bodies traced with gold
    // constellation sigils" / "disciplined navy-and-gold with rich accent color"
    realmId: "cosmic",
    floorColor: "#171b33", wallColor: "#10132a", trimColor: "#d4af37",
    fog: Object.freeze({ color: "#07091a" }),
    grade: Object.freeze({ tint: "#d4af37", strength: 0.09, fogWhisper: 0 }),
    lightKind: "lamp", lightColor: "#e8c25a", lightIntensity: 1.2
  }),
  frontier: Object.freeze({
    // regen-v3/frontier.md: "wild-west frontier — sun-bleached earth tones, period costume, weathered
    // wood and leather" / "earthy palette"
    realmId: "frontier",
    floorColor: "#a9865c", wallColor: "#7c5f3e", trimColor: "#9c8a63",
    fog: Object.freeze({ color: "#1c150c" }),
    grade: Object.freeze({ tint: "#ffb347", strength: 0.07, fogWhisper: 0 }),
    lightKind: "torch", lightColor: "#ffb347", lightIntensity: 1.2
  }),
  "high-seas": Object.freeze({
    // regen-v3/high-seas.md: "drowned age-of-sail realm — brine, barnacle crust, kelp rot, weathered
    // rope and teal spectral glow" / "muted brine palette with rich teal/brass accents"
    realmId: "high-seas",
    floorColor: "#3f4a45", wallColor: "#2a332f", trimColor: "#b08d3e",
    fog: Object.freeze({ color: "#0a1210" }),
    grade: Object.freeze({ tint: "#6fd9c9", strength: 0.1, fogWhisper: 0 }),
    lightKind: "lamp", lightColor: "#6fd9c9", lightIntensity: 1.1
  }),
  "lost-world": Object.freeze({
    // regen-v3/lost-world.md: "prehistoric lost-world jungle — dinosaurs and primeval fauna" / "rich
    // naturalist jungle palette"
    realmId: "lost-world",
    floorColor: "#3d4a2e", wallColor: "#2a3320", trimColor: "#d8c9a3",
    fog: Object.freeze({ color: "#0f1509" }),
    grade: Object.freeze({ tint: "#ffa64d", strength: 0.08, fogWhisper: 0 }),
    lightKind: "torch", lightColor: "#ffa64d", lightIntensity: 1.2
  }),
  noir: Object.freeze({
    // regen-v3/noir.md: "rain-slick noir port city — sepia and soot, streetlamp monochrome" /
    // "desaturated sepia-grayscale palette"
    realmId: "noir",
    floorColor: "#3a3530", wallColor: "#4a423a", trimColor: "#8a7a63",
    fog: Object.freeze({ color: "#141210" }),
    grade: Object.freeze({ tint: "#d9c48a", strength: 0.11, fogWhisper: 0 }),
    lightKind: "lamp", lightColor: "#d9c48a", lightIntensity: 1.0
  }),
  suburb: Object.freeze({
    // regen-v3/suburb.md: "uncanny modern suburbia — groomed surfaces hiding menace" / "bright
    // suburban palette, muted for feral subjects"
    realmId: "suburb",
    floorColor: "#cfc7a0", wallColor: "#b8a97e", trimColor: "#7c8a6a",
    fog: Object.freeze({ color: "#17160f" }),
    grade: Object.freeze({ tint: "#ffcf8a", strength: 0.05, fogWhisper: 0 }),
    lightKind: "lamp", lightColor: "#ffcf8a", lightIntensity: 1.0
  }),
  theater: Object.freeze({
    // regen-v3/theater.md: "endless-war theater realm — WWI trench grime, mud, rust, gas-haze,
    // war-torn cloth" / "narrow mud-olive palette with drab military tones"
    realmId: "theater",
    floorColor: "#4a4632", wallColor: "#3a3826", trimColor: "#8a7f5c",
    fog: Object.freeze({ color: "#141208" }),
    grade: Object.freeze({ tint: "#d9a24d", strength: 0.1, fogWhisper: 0 }),
    lightKind: "torch", lightColor: "#d9a24d", lightIntensity: 1.2
  })
});
const INTERIOR_DEFAULT_KIT = "chrome";
const INTERIOR_GRADE_STRENGTH_MAX = 0.15; // GR3 acceptance bound — every kit's grade.strength stays <= this

/* ─── GR1 — REALM_MATERIALS (docs/GRAPHICS-ENGINE.md §E TEXTURE-PER-REALM) ────────────────────────
   Per realm x surface (floor/wall/trim) -> {material, grainIntensity}. A SIBLING registry to
   INTERIOR_TILE_KITS (not folded into the kits themselves) ON PURPOSE: the kit's own floorColor/
   wallColor/trimColor stay the single source of truth for a realm's palette anchor (realmMaterialFor,
   below, reads color off the kit) — duplicating color fields onto this registry too would just be a
   second place for the two to drift out of sync. `material` names one of src/ui/theater-materials.js's
   MATERIAL_FAMILY entries (stone-course/slab/moss-stone -> "stone" painter family, plank -> "plank",
   metal-panel -> "metal", everything else -> the generic "mottle" painter) - an unknown/typo'd material
   string degrades to mottle rather than throwing (interiorTileKitFor's own "never throws" discipline,
   mirrored here). `grainIntensity` is this surface's own low-contrast band (SUBTLE-TEXTURE LAW: LOW
   ALWAYS, ~0.08-0.12 below — never the "busy" range). Only floor/wall are actually wired to a baked
   CanvasTexture this pass (theater-boot.js's floorTex/wallTex path, per GR1's own scope) — trim stays
   flat-colored (doorframe/pillar instances pass texture:null today, unchanged); trim's entry here is
   real registry data (truthful, not a stub) for a future GR unit to pick up, not yet GL-wired. */
const REALM_MATERIALS = Object.freeze({
  chrome: Object.freeze({
    floor: Object.freeze({ material: "metal-panel", grainIntensity: 0.09 }),
    wall: Object.freeze({ material: "metal-panel", grainIntensity: 0.09 }),
    trim: Object.freeze({ material: "metal-panel", grainIntensity: 0.07 })
  }),
  gloom: Object.freeze({
    floor: Object.freeze({ material: "stone-course", grainIntensity: 0.12 }),
    wall: Object.freeze({ material: "stone-course", grainIntensity: 0.12 }),
    trim: Object.freeze({ material: "flesh", grainIntensity: 0.1 })
  }),
  fantasy: Object.freeze({
    floor: Object.freeze({ material: "stone-course", grainIntensity: 0.12 }),
    wall: Object.freeze({ material: "stone-course", grainIntensity: 0.12 }),
    trim: Object.freeze({ material: "metal-panel", grainIntensity: 0.1 })
  }),
  ash: Object.freeze({
    floor: Object.freeze({ material: "stone-course", grainIntensity: 0.12 }),
    wall: Object.freeze({ material: "stone-course", grainIntensity: 0.12 }),
    trim: Object.freeze({ material: "metal-panel", grainIntensity: 0.1 })
  }),
  "bright-kingdom": Object.freeze({
    floor: Object.freeze({ material: "plank", grainIntensity: 0.1 }),
    wall: Object.freeze({ material: "stone-course", grainIntensity: 0.1 }),
    trim: Object.freeze({ material: "metal-panel", grainIntensity: 0.08 })
  }),
  cosmic: Object.freeze({
    floor: Object.freeze({ material: "slab", grainIntensity: 0.08 }),
    wall: Object.freeze({ material: "stone-course", grainIntensity: 0.1 }),
    trim: Object.freeze({ material: "metal-panel", grainIntensity: 0.08 })
  }),
  frontier: Object.freeze({
    floor: Object.freeze({ material: "plank", grainIntensity: 0.11 }),
    wall: Object.freeze({ material: "plank", grainIntensity: 0.11 }),
    trim: Object.freeze({ material: "metal-panel", grainIntensity: 0.1 })
  }),
  "high-seas": Object.freeze({
    floor: Object.freeze({ material: "plank", grainIntensity: 0.11 }),
    wall: Object.freeze({ material: "metal-panel", grainIntensity: 0.1 }),
    trim: Object.freeze({ material: "metal-panel", grainIntensity: 0.09 })
  }),
  "lost-world": Object.freeze({
    floor: Object.freeze({ material: "moss-stone", grainIntensity: 0.12 }),
    wall: Object.freeze({ material: "stone-course", grainIntensity: 0.12 }),
    trim: Object.freeze({ material: "bone", grainIntensity: 0.1 })
  }),
  noir: Object.freeze({
    floor: Object.freeze({ material: "asphalt", grainIntensity: 0.1 }),
    wall: Object.freeze({ material: "stone-course", grainIntensity: 0.1 }),
    trim: Object.freeze({ material: "metal-panel", grainIntensity: 0.08 })
  }),
  suburb: Object.freeze({
    floor: Object.freeze({ material: "linoleum", grainIntensity: 0.08 }),
    wall: Object.freeze({ material: "plank", grainIntensity: 0.09 }),
    trim: Object.freeze({ material: "metal-panel", grainIntensity: 0.08 })
  }),
  theater: Object.freeze({
    floor: Object.freeze({ material: "asphalt", grainIntensity: 0.12 }),
    wall: Object.freeze({ material: "metal-panel", grainIntensity: 0.12 }),
    trim: Object.freeze({ material: "bone", grainIntensity: 0.1 })
  })
});
const REALM_MATERIAL_DEFAULT_SURFACE = Object.freeze({ material: "mottle", grainIntensity: 0.1 });

/* realmMaterialFor(realmId, surface) -> {material, grainIntensity, color} — resolves REALM_MATERIALS
   plus the kit's own color for that surface (floorColor/wallColor/trimColor), defaulting cleanly
   (never throws, never undefined) on an unknown realm/surface — same total-function discipline
   interiorTileKitFor already keeps. */
function realmMaterialFor(realmId, surface) {
  const kit = interiorTileKitFor(realmId);
  const realmEntry = REALM_MATERIALS[kit.realmId] || REALM_MATERIALS[INTERIOR_DEFAULT_KIT];
  const surfEntry = (realmEntry && realmEntry[surface]) || REALM_MATERIAL_DEFAULT_SURFACE;
  const color = surface === "wall" ? kit.wallColor : surface === "trim" ? kit.trimColor : kit.floorColor;
  return { material: surfEntry.material, grainIntensity: surfEntry.grainIntensity, color };
}

/* interiorTileKitFor(realmId) → a kit from INTERIOR_TILE_KITS, defaulting cleanly (never throws, never
   returns undefined) on an unknown/absent realmId — same total-function discipline theaterPaletteFor
   (theater-data.js) already keeps for env. */
function interiorTileKitFor(realmId) {
  return INTERIOR_TILE_KITS[realmId] || INTERIOR_TILE_KITS[INTERIOR_DEFAULT_KIT];
}

/* ─── BW2-3 MATERIAL TEXEL — REALM_TEXTURES (docs/BEAUTY-WAVE-2.md BW2-3, §1 GENERATED-FIRST) ────────
   Folded PACKET-02 texture-file pointers per realm x surface, produced by build/fold-textures.py
   (fold gate: wrap-shift tileability grade -> `wrap`, loose palette bound, contrast cap, integer-ratio
   resample). Only the three FLAGSHIPS (fantasy/gloom/chrome) carry entries — the 9 non-flagship realms
   have NO entry, so interiorTextureVariantFor returns null for them and theater-boot's floorTex/wallTex
   path falls back to the procedural painter (theater-materials.js). The seam is EXACTLY
   `interiorTextureVariantFor(realm,surface,seed) || <procedural>` (GENERATED-FIRST: file wins, painter
   backstops).

   THE VARIANT ROLL (Adam 2026-07-11: textures "mechanically created and added to the walk rolls"):
   every surface value is a variant ARRAY (length 1 today). interiorTextureVariantFor PICKS one seeded
   per walkId+room (plan.seed + focus segNum) — the SAME deterministic dspHashStr/dspMulberry32 roll
   every dressing pick uses (DETERMINISM LAW, law 7). A future packet WIDENS a pool by appending a
   `{file,wrap}` to the array — zero code change, the roll spreads across the new pool automatically.
   `wrap` is the fold gate's verdict: "repeat" (perfect tile -> RepeatWrapping) or "mirror" (near/poor
   -> MirroredRepeatWrapping, ping-pong hides the residual seam, per §2b WALLS law). */
const REALM_TEXTURES = Object.freeze({
  fantasy: Object.freeze({
    wall: Object.freeze([Object.freeze({ file: "assets/textures/fantasy-wall-1.png", wrap: "mirror" })]),
    floor: Object.freeze([Object.freeze({ file: "assets/textures/fantasy-floor-1.png", wrap: "repeat" })]),
    "floor-alt": Object.freeze([Object.freeze({ file: "assets/textures/fantasy-floor-alt-1.png", wrap: "mirror" })]),
    trim: Object.freeze([Object.freeze({ file: "assets/textures/fantasy-trim-1.png", wrap: "repeat" })]),
  }),
  gloom: Object.freeze({
    wall: Object.freeze([Object.freeze({ file: "assets/textures/gloom-wall-1.png", wrap: "mirror" })]),
    floor: Object.freeze([Object.freeze({ file: "assets/textures/gloom-floor-1.png", wrap: "repeat" })]),
    "floor-alt": Object.freeze([Object.freeze({ file: "assets/textures/gloom-floor-alt-1.png", wrap: "repeat" })]),
    trim: Object.freeze([Object.freeze({ file: "assets/textures/gloom-trim-1.png", wrap: "repeat" })]),
  }),
  chrome: Object.freeze({
    wall: Object.freeze([Object.freeze({ file: "assets/textures/chrome-wall-1.png", wrap: "repeat" })]),
    floor: Object.freeze([Object.freeze({ file: "assets/textures/chrome-floor-1.png", wrap: "repeat" })]),
    "floor-alt": Object.freeze([Object.freeze({ file: "assets/textures/chrome-floor-alt-1.png", wrap: "repeat" })]),
    trim: Object.freeze([Object.freeze({ file: "assets/textures/chrome-trim-1.png", wrap: "mirror" })]),
  }),
});

/* interiorTextureVariantFor(realmId, surface, seedKey) -> {file, wrap} | null. null == "no folded
   texture for this realm/surface" -> the caller falls back to the procedural painter. Deterministic:
   the SAME (realm, surface, seedKey) always picks the SAME variant (law 7). seedKey is the caller's
   walkId+room key (plan.seed + focus segNum). */
function interiorTextureVariantFor(realmId, surface, seedKey) {
  const kit = interiorTileKitFor(realmId);
  const realmEntry = REALM_TEXTURES[kit.realmId];
  const pool = realmEntry && realmEntry[surface];
  if (!pool || !pool.length) return null;
  const seed = dspHashStr("bw2-3-texvariant:" + kit.realmId + ":" + surface + ":" + (seedKey || ""));
  const rng = dspMulberry32(seed);
  const chosen = pool[Math.floor(rng() * pool.length) % pool.length];
  return { file: chosen.file, wrap: chosen.wrap };
}

// ─── plan indexing helpers (pure, no mutation of the caller's plan) ─────────────────────────────────
function itrRoomIndex(plan) {
  // per-cell room lookup, built once by rasterizing each room's own rect (cheap: O(total room area),
  // never O(cells*rooms) — the naive per-cell scan this avoids).
  const byCell = new Map();
  (plan.rooms || []).forEach((r) => {
    for (let yy = r.y; yy < r.y + r.d; yy++) {
      for (let xx = r.x; xx < r.x + r.w; xx++) {
        byCell.set(xx + "," + yy, r);
      }
    }
  });
  return byCell;
}

function itrCorridorIndex(plan) {
  // per-cell corridor lookup off corridor.cells (U1 already carries the exact carved cell list per
  // corridor — never re-derived/re-walked here).
  const byCell = new Map();
  (plan.corridors || []).forEach((c) => {
    (c.cells || []).forEach((cell) => { byCell.set(cell.x + "," + cell.y, c); });
  });
  return byCell;
}

// itrRoomRoleNear(x,y,plan,roomIdx) -> the room owning (x,y) itself, or the first 4-neighbor room
// found (a DOOR/WALL cell sits BETWEEN rooms in roomIdx, never inside one — same gap itrWallScale's
// own neighbor-scan already bridges for scaleDomain). Returns null off-map/no neighbor (degrades to
// SCD_DEFAULT_ROLE at the call site, never throws).
function itrRoomRoleNear(x, y, plan, roomIdx) {
  const here = roomIdx.get(x + "," + y);
  if (here) return here;
  const deltas = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let i = 0; i < deltas.length; i++) {
    const nx = x + deltas[i][0], ny = y + deltas[i][1];
    if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) continue;
    const r = roomIdx.get(nx + "," + ny);
    if (r) return r;
  }
  return null;
}

function itrDoorIndex(plan) {
  const byCell = new Map();
  (plan.doors || []).forEach((d) => { byCell.set(d.x + "," + d.y, d); });
  return byCell;
}

// QF-D1 (docs/DESIGN-REVIEW-2026-07-15.md §0, docs/KENNEY-SOCKET-WAVE.md KS-2): the door aperture's
// WIDTH axis — which cell axis the frame's two jambs offset along, vs. which axis is the passage/
// depth direction — used to derive off room-rect EDGE MEMBERSHIP (onLeftRight/onTopBottom against
// doorRoom's own bounding rect, below). That silently defaults WRONG on corner cells (on BOTH edges at
// once), doors whose doorRoom resolves to the NEIGHBORING room rather than the room whose wall is
// actually pierced, and non-rectangular rooms' notch cells (octagon/L/cave — Stage C made these
// common): the frame rotates 90deg from the wall it's actually set into, reading as "a hollow column
// construction hanging out in front of the door" (Adam's own description, DESIGN-REVIEW-2026-07-15.md
// §0) rather than a doorframe IN the wall. The fix: read the LOCAL WALL RUN directly off the cell grid
// — a plain WALL cell adjacent to the door, along an axis, IS that wall's run direction (shape-
// independent, corner-safe: a corner door's true local wall run is whichever direction still has
// contiguous WALL next to it, regardless of which edge(s) of the room's abstract bounding rect it
// happens to sit on). Scans outward up to ITR_WALL_RUN_SCAN_MAX cells per direction (a door sitting
// right at a room corner may need to look past the immediate corner-turn cell before the WALL run is
// unambiguous) and picks whichever axis's nearest WALL evidence is closer; a genuine tie (including "no
// WALL found on either axis within the scan window" — a truly degenerate/interior-door topology)
// demotes to the OLD room-rect edge read as a documented TIEBREAK ONLY, never the primary signal
// (Adam's own KS-2 ruling: "room-rect edge membership demoted to tiebreak only").
// itrCellCodeAt(x,y,plan) is DEFINED FURTHER DOWN this file (the BW2-5 door-reveal general-purpose
// bounds-checked lookup, `function itrCellCodeAt(x, y, plan)` — reused here rather than duplicated
// with a different arg order, which would silently shadow it via classic-script function hoisting).
const ITR_WALL_RUN_SCAN_MAX = 3;
function itrWallRunScanDist(plan, x, y, dx, dy) {
  for (let d = 1; d <= ITR_WALL_RUN_SCAN_MAX; d++) {
    const code = itrCellCodeAt(x + dx * d, y + dy * d, plan);
    if (code === SPATIAL_CELL.WALL) return d;
    if (code == null) return Infinity; // ran off the map before finding a wall -> no evidence this axis
  }
  return Infinity;
}
function itrDoorWidthAxisIsZ(x, y, plan, onLeftRight, onTopBottom) {
  const nsEvidence = Math.min(itrWallRunScanDist(plan, x, y, 0, -1), itrWallRunScanDist(plan, x, y, 0, 1));
  const ewEvidence = Math.min(itrWallRunScanDist(plan, x, y, -1, 0), itrWallRunScanDist(plan, x, y, 1, 0));
  if (nsEvidence < ewEvidence) return true;  // nearer N/S WALL -> the wall runs north-south -> width axis Z
  if (ewEvidence < nsEvidence) return false; // nearer E/W WALL -> the wall runs east-west -> width axis X
  return !(onTopBottom && !onLeftRight); // genuine tie/no-evidence: the OLD room-rect read, tiebreak only
}

// KS-2 (docs/KENNEY-SOCKET-WAVE.md): itrKitDoorEligible — "a kit doorway piece fits the aperture
// (standard 1-cell doors)". The admitted kenney-modular-dungeon-kit/gate-door piece is a FIXED-WIDTH
// module measuring 2.2 world units across its own width axis (dev/model-foundry/KS1-PROVENANCE.json —
// butt-join-e/w at +-1.1) against Genesis's 1.0-world-unit (5ft) GRID LAW cell: mounted centered on a
// single door cell, its extra half-cell of width on each side (1.1 - 0.5 = 0.6 world units) overhangs
// into the TWO cells flanking the door along the width axis. That overhang is architecturally honest
// (masonry doorway jambs legitimately extend into the flanking wall mass) ONLY when those flanking
// cells are themselves solid WALL — never void, floor, or another door, which would read as the frame
// punching into open space or colliding with a second doorway. Squeeze/crawl apertures (a narrower,
// irregular passage by design) never fit this fixed-width module — prism only, always.
function itrKitDoorEligible(x, y, plan, widthAxisIsZ, squeeze) {
  if (squeeze) return false;
  const dx = widthAxisIsZ ? 0 : 1, dz = widthAxisIsZ ? 1 : 0;
  return itrCellCodeAt(x + dx, y + dz, plan) === SPATIAL_CELL.WALL
    && itrCellCodeAt(x - dx, y - dz, plan) === SPATIAL_CELL.WALL;
}

// scaleDomain per cell (rooms carry their own; corridors carry .heightScale when part of a >1.0 domain;
// everything else defaults to 1.0 human scale) — used to size FLOOR/DOOR instances, whose cell IS
// directly inside a room/corridor.
function itrCellScale(x, y, roomIdx, corridorIdx) {
  const room = roomIdx.get(x + "," + y);
  if (room) return room.scaleDomain || 1.0;
  const corridor = corridorIdx.get(x + "," + y);
  if (corridor) return corridor.heightScale || 1.0;
  return 1.0;
}

// a WALL cell (U1's rasterize stage — a derived cell, never a room/corridor member itself) has no
// scaleDomain of its own: it takes the MAX scale of its passable (room/corridor) 4-neighbors, so a
// scale-4.0 lair's perimeter wall reads at 4.0 even though the WALL cell itself isn't "in" the room
// rect. Falls back to 1.0 if no scaled neighbor is found (an isolated/human-scale wall).
function itrWallScale(x, y, plan, roomIdx, corridorIdx) {
  let best = 1.0;
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) return;
    const code = plan.cells[ny * plan.cellW + nx];
    if (code !== SPATIAL_CELL.FLOOR && code !== SPATIAL_CELL.DOOR && code !== SPATIAL_CELL.WATER) return;
    best = Math.max(best, itrCellScale(nx, ny, roomIdx, corridorIdx));
  });
  return best;
}

// bounds-checked raw cell-code lookup — null off-map (never throws), used by the BW2-5 door-reveal
// axis detection below (itrWallScale already inlines an equivalent scan for its own narrower purpose;
// this is the general-purpose version).
function itrCellCodeAt(x, y, plan) {
  if (x < 0 || y < 0 || x >= plan.cellW || y >= plan.cellD) return null;
  return plan.cells[y * plan.cellW + x];
}

// BFS room-adjacency within `radius` hops of `focusSegNum` (via the corridor graph — the exact same
// edge source U1/U2 use, never an invented adjacency) — "current room + immediate surroundings"
// (DUNGEON-GRAPH.md U3 item 2). radius<=0 or no focusSegNum given -> null (caller renders the WHOLE
// plan, e.g. for the draw-call-budget check on an 80-room plan, or the study card's single-room scenes
// where "the whole plan" IS the one room).
function itrFocusRoomSet(plan, focusSegNum, radius) {
  if (focusSegNum == null || !(radius > 0)) return null;
  const adj = {};
  (plan.rooms || []).forEach((r) => { adj[r.segNum] = new Set(); });
  (plan.corridors || []).forEach((c) => {
    if (adj[c.fromSeg] && adj[c.toSeg]) { adj[c.fromSeg].add(c.toSeg); adj[c.toSeg].add(c.fromSeg); }
  });
  if (!adj[focusSegNum]) return null; // unknown focus -> render everything rather than nothing
  const keep = new Set([focusSegNum]);
  let frontier = [focusSegNum];
  for (let hop = 0; hop < radius; hop++) {
    const next = [];
    frontier.forEach((seg) => {
      Array.from(adj[seg] || []).forEach((nb) => { if (!keep.has(nb)) { keep.add(nb); next.push(nb); } });
    });
    frontier = next;
  }
  return keep;
}

// ─── STAGE-A A1 (docs/STAGE-A.md, docs/GRAPHICS-NORTH-STAR.md §4.3): ONE-ROOM-LITERAL ─────────────────
// "the active room ALONE owns render geometry" — a doorway becomes a shallow DARKNESS PORTAL, never
// the adjacent room's own shell. Pre-A1, interiorBuildBoard always ran itrFocusRoomSet(plan,
// focusSegNum, radius) above, keeping the focus room PLUS `radius` hops of neighbors (a small map
// overview, not a staged single room). `var` (not `const`) — same classic-script "auto-attaches to
// window" convention this file's own header documents for function declarations — so a live session
// or a verify harness can flip it at runtime (`window.ITR_ACTIVE_ROOM_ONLY = false`) for an A/B
// capture without touching S.boardKey/dirty-key plumbing (theater-boot.js's setInteriorBoard already
// treats any board-shape change, including a flag-driven one, as a fresh board via its own JSON-diff
// dirty key). Default ON; OFF restores the pre-A1 multi-room (radius-hop) render byte-for-byte — see
// itrFocusRoomSet just above, still the ONLY function that computes a neighbor-hop keep set (this
// unit never edits it, just stops calling it by default).
var ITR_ACTIVE_ROOM_ONLY = true;

// ─── KS-2 (docs/KENNEY-SOCKET-WAVE.md): KIT_DOORS_ENABLED — "the doorway becomes an assembly" ─────────
// Default ON (Adam's KS-1 gate having landed): a standard 1-cell door whose kit piece FITS the aperture
// (itrKitDoorEligible, below — non-squeeze, both wall-run neighbors genuinely WALL so the kit frame's
// extra width lands on solid wall mass, never void/floor/another door) mounts the normalized
// kenney-modular-dungeon-kit/gate-door piece (frame socketed into the wall run via its butt-join
// sockets + leaf mounted on the frame's `hinge` socket, theater-boot.js's interiorBuildInteractables)
// INSTEAD of the D4d prism jambs/header/arch below — this file only decides ELIGIBILITY + the frame's
// PLACEMENT transform (pure data, no THREE); theater-boot.js's ES-module GL layer owns the actual mesh
// swap (async donor-piece load, following the SAME preload-then-clone convention
// loadWholeObjectBuilders/glbLoadScene already established for whole-object GLBs — see that file's own
// header). `var` (not `const`) — same classic-script "auto-attaches to window" convention
// ITR_ACTIVE_ROOM_ONLY above documents — so a live session or a verify harness can flip it at runtime
// (`window.KIT_DOORS_ENABLED = false`) for an A/B capture; OFF restores the prism path for EVERY door,
// byte-for-byte identical to pre-KS-2 (the QF-D1 axis fix above still applies either way — it is a
// correctness fix to the prism path itself, not part of the kit swap). Squeeze crawls, odd widths, and
// any aperture the kit can't fit ALWAYS fall back to the (QF-D1-fixed) prism path regardless of this
// flag's state — "every prism path survives as fallback" per the wave's own posture.
var KIT_DOORS_ENABLED = true;

// ─── KS-3 (docs/KENNEY-SOCKET-WAVE.md): KIT_SHELL_ENABLED — "room shells from the kit" ────────────────
// Default ON (Adam's ruling — "build around the kit… archive the old stuff, anything we have to retire
// for functionality of procedural arrangement"): rolled room shells assemble from kit wall/floor
// modules wherever the geometry can honestly support it — straight WALL-cell runs of 2+ cells tile with
// kenney-modular-dungeon-kit/template-wall modules (2-world-unit span, butt-joined end to end); FLOOR
// cells tile in 2x2 kenney-modular-dungeon-kit/template-floor blocks. Corners, T/cross junctions,
// isolated wall cells, door apertures + their immediate flanking cells, any single-cell run remainder,
// and any room/cell this file's own eligibility tests can't cleanly classify ALWAYS stay on the prism
// path below (itrKitShellWallRuns/itrKitShellFloorBlocks below are the ONLY two places that decide
// eligibility; the main per-cell loop just skips whatever they've claimed) — MIXED shells are legal and
// expected, per the wave's own spec text ("kit modules where runs are straight; prism walls where the
// kit can't turn the corner"). Same `var` auto-attach-to-window convention as ITR_ACTIVE_ROOM_ONLY/
// KIT_DOORS_ENABLED above, so a live session or a harness can flip it (`window.KIT_SHELL_ENABLED =
// false`) for an A/B capture — OFF means itrKitShellWallRuns/itrKitShellFloorBlocks return empty
// claim-sets, so EVERY cell falls through to the untouched prism per-cell push below: byte-identical to
// pre-KS-3 output (the flag is the retreat).
var KIT_SHELL_ENABLED = true;

// itrKitWallRunAxis(x,y,plan) -> 'x' | 'z' | null. A WALL cell qualifies for kit-module tiling only when
// exactly ONE perpendicular pair of its 4-neighbors is "open" (FLOOR/DOOR/WATER — a room/passage
// interior) and the other pair is not: open only to its north/south -> this cell's own wall FACE reads
// north/south, which means the wall itself physically RUNS east-west (the world X axis) -> 'x'. Open
// only to its east/west -> the wall runs north-south (world Z) -> 'z'. Open on BOTH perpendicular pairs
// (a true corner) or on NEITHER (an isolated/diagonal-only wall cell, e.g. an octagon's chamfered notch)
// returns null — exactly the "kit can't turn the corner" cells the spec licenses straight to the prism
// path, with zero special-casing needed for octagon/L/cave shapes: this test is purely local per-cell
// topology, so it naturally finds only the straight stretches on ANY Stage-C shape.
function itrKitWallRunAxis(x, y, plan) {
  const isOpen = (code) => code === SPATIAL_CELL.FLOOR || code === SPATIAL_CELL.DOOR || code === SPATIAL_CELL.WATER;
  const nsOpen = isOpen(itrCellCodeAt(x, y - 1, plan)) || isOpen(itrCellCodeAt(x, y + 1, plan));
  const ewOpen = isOpen(itrCellCodeAt(x - 1, y, plan)) || isOpen(itrCellCodeAt(x + 1, y, plan));
  if (nsOpen && !ewOpen) return "x";
  if (ewOpen && !nsOpen) return "z";
  return null;
}

// itrKitWallRunDoorAdjacent(x,y,plan,axis) -> true when this (otherwise run-eligible) WALL cell sits
// immediately next to a DOOR cell ALONG the run's own axis. KS-2's kit gate-door frame overhangs half a
// module into each of its two flanking wall cells (itrKitDoorEligible's own header) — excluding those
// exact cells from wall-run tiling (they stay prism) guarantees a kit wall module can never spatially
// double up against a kit door frame's own overhang, the seam-integrity gate's "no overlap/z-fighting"
// requirement satisfied by construction rather than by a runtime geometry check.
function itrKitWallRunDoorAdjacent(x, y, plan, axis) {
  const dx = axis === "x" ? 1 : 0, dz = axis === "x" ? 0 : 1;
  return itrCellCodeAt(x + dx, y + dz, plan) === SPATIAL_CELL.DOOR || itrCellCodeAt(x - dx, y - dz, plan) === SPATIAL_CELL.DOOR;
}

// itrKitShellEmitRun(startIdx, endIdx, fixedCoord, axis, scale, wallRuns, claimedWall): tiles a maximal
// eligible run [startIdx..endIdx] (inclusive, along `axis`, at the run's own fixed perpendicular
// coordinate) into as many 2-cell kit modules as fit, anchored at the run's OWN start (deterministic,
// never a global-grid anchor a run's own position could drift against). `scale` is this run's uniform
// wall scaleDomain (itrWallScale) — KIT_SHELL v1 SCOPE: only scale===1.0 runs tile with the kit (a fixed
// module can't stretch to a lair's own scaled wall height without visible distortion); a scaled run's
// cells are simply never claimed, falling to the existing per-cell prism path unchanged. Any 1-cell
// remainder (an odd-length run) is left unclaimed at the run's own tail — same fate.
function itrKitShellEmitRun(startIdx, endIdx, fixedCoord, axis, scale, wallRuns, claimedWall) {
  if (scale !== 1.0) return;
  const len = endIdx - startIdx + 1;
  const modules = Math.floor(len / 2);
  for (let m = 0; m < modules; m++) {
    const c0 = startIdx + m * 2, c1 = c0 + 1;
    const mid = (c0 + c1) / 2;
    const run = axis === "x" ? { x: mid, z: fixedCoord, axis, span: 2 } : { x: fixedCoord, z: mid, axis, span: 2 };
    wallRuns.push(run);
    if (axis === "x") { claimedWall.add(c0 + "," + fixedCoord); claimedWall.add(c1 + "," + fixedCoord); }
    else { claimedWall.add(fixedCoord + "," + c0); claimedWall.add(fixedCoord + "," + c1); }
  }
}

/* itrKitShellWallRuns(plan, kept, roomIdx, corridorIdx) -> { wallRuns:[{x,z,axis,span}], claimedWall:Set }
   Pure/deterministic (no RNG) — a straight function of the already-fixed cell grid. Two passes over the
   KEPT grid: axis-'x' runs are grouped row-major (consecutive x at a fixed y), axis-'z' runs are grouped
   column-major (consecutive y at a fixed x) — a cell's axis is a single deterministic value (never both),
   so the two passes never double-claim the same cell. KIT_SHELL_ENABLED=false short-circuits to empty
   (the flag's own retreat, checked once here rather than at every call site).

   KS-3b item 4 (docs/KENNEY-SOCKET-WAVE.md's own KS-3 gate flag) — WHY TRUE CORNERS (itrKitWallRunAxis
   returning null, just below) have NO dedicated kit corner piece mounted into the gap, and never will
   under this v1: kenney-modular-dungeon-kit's own `template-wall-corner` was investigated (measured via
   dev/model-foundry/KS1-PROVENANCE.json + a raw-vertex dump of its source GLB) as the obvious candidate
   to fill exactly this gap. It is a genuine, self-contained L-shaped corner-turret unit (160 verts, a
   real stepped/crenellated profile, not a plain box) — but its own natural footprint measures 0.5x0.5
   world units (scaledDims [0.5, 2.025, 0.5]), a QUARTER the area of the 1.0x1.0-unit room-grid cell a
   corner needs to fill, and its own butt-join sockets sit only 0.25 units from its center — a SMALLER,
   INCOMPATIBLE module grid from the wall/floor pieces' clean 2.0-unit span (KIT_WALL_NATIVE_HEIGHT's own
   neighbor consts, theater-boot.js). "Compose two corner pieces per grid corner cell" (the option this
   unit's own spec text offered) does not tile this piece cleanly: it is one indivisible turret shape,
   not a repeatable tile, so two (or four) copies do not compose into a larger corner the way two
   template-wall halves compose into one module — they'd either float centered in a visibly oversized
   cell (leaving a 0.25-unit gap on every side against the neighboring 2.0-unit-wide kit wall panels) or
   need a SECOND, un-audited canonicalScale/placement convention specific to this one piece (exactly the
   risk the original KS-3 scope note flagged). RULING (permanent, v1): corners stay on the prism path.
   The prism per-cell corner geometry (interiorBuildBoard's own instances.wall / the corner-pillar pass
   above) already renders every corner cleanly today — mixed kit+prism shells are legal and expected per
   this wave's own spec text, and a corner is exactly the class of cell that spec licenses to prism. A
   future unit that wants an authored kit-native corner would need Kenney's OWN corner-piece convention
   (their kit ships this turret sized to their own smaller sub-grid, not this project's 1-cell grid) —
   solvable, but a genuinely new placement contract, not a cheap follow-on to this one. */
function itrKitShellWallRuns(plan, kept, roomIdx, corridorIdx) {
  const wallRuns = [], claimedWall = new Set();
  if (!KIT_SHELL_ENABLED) return { wallRuns, claimedWall };
  const idx = (x, y) => y * plan.cellW + x;
  const isKept = (x, y) => x >= 0 && y >= 0 && x < plan.cellW && y < plan.cellD && kept[idx(x, y)];
  const axisOf = new Map();
  for (let y = 0; y < plan.cellD; y++) {
    for (let x = 0; x < plan.cellW; x++) {
      if (!isKept(x, y) || plan.cells[idx(x, y)] !== SPATIAL_CELL.WALL) continue;
      let axis = itrKitWallRunAxis(x, y, plan);
      if (axis && itrKitWallRunDoorAdjacent(x, y, plan, axis)) axis = null;
      if (axis) axisOf.set(x + "," + y, axis);
    }
  }
  for (let y = 0; y < plan.cellD; y++) {
    let start = null, runScale = 1.0;
    for (let x = 0; x <= plan.cellW; x++) {
      const a = x < plan.cellW ? axisOf.get(x + "," + y) : undefined;
      if (a === "x") {
        if (start === null) { start = x; runScale = itrWallScale(x, y, plan, roomIdx, corridorIdx); }
      } else if (start !== null) {
        itrKitShellEmitRun(start, x - 1, y, "x", runScale, wallRuns, claimedWall); start = null;
      }
    }
  }
  for (let x = 0; x < plan.cellW; x++) {
    let start = null, runScale = 1.0;
    for (let y = 0; y <= plan.cellD; y++) {
      const a = y < plan.cellD ? axisOf.get(x + "," + y) : undefined;
      if (a === "z") {
        if (start === null) { start = y; runScale = itrWallScale(x, y, plan, roomIdx, corridorIdx); }
      } else if (start !== null) {
        itrKitShellEmitRun(start, y - 1, x, "z", runScale, wallRuns, claimedWall); start = null;
      }
    }
  }
  return { wallRuns, claimedWall };
}

// KS-3b item 1 (docs/KENNEY-SOCKET-WAVE.md's own KS-3 gate flag, "THE FLOOR CHECKER") — TONE JITTER,
// the pure-data half. The hard CHECKER itself was a Z-fighting bug in the outline-hull step (fixed at
// the source, theater-donor.js's own DONOR_OUTLINE_HULL_EXEMPT_CATEGORIES header carries the full
// diagnosis) — every kit floor block clone shares one identical graded material, so with the hull bug
// gone the floor reads as a perfectly FLAT, uniform tone. Adam's own Wildermyth law text (KS-3b's own
// task text, quoting DESIGN.md) wants "clean blocky with SUBTLE low-frequency variation" — perfectly
// flat reads just as artificial as a hard checker, so this file (the ELIGIBILITY/placement pure-data
// layer, per this section's own established split — theater-boot.js's interiorBuildKitShellFloors owns
// the THREE mesh mount only) stamps a small, deterministic, LOW-AMPLITUDE per-block value multiplier —
// never a per-node BAND SWAP (a hash-selected band from a short fixed list is a hard high-contrast
// jump — exactly what produced the checker read once, a hull z-fight the GPU resolved per-pixel); a
// smooth +/-KIT_FLOOR_TONE_JITTER_AMP multiplier is a soft per-instance dial, not a band selector.
// itrKitFloorToneHash mirrors theater-boot.js's own swarmHashLocal algorithm shape (mulberry-style,
// documented there as "the swarm one lives in theater-parts") — a SEPARATE, self-contained copy since
// this file and theater-boot.js's sealed ES-module scope can't share a function directly (same
// precedent as donorHashStr/dspHashStr elsewhere in this codebase), not a fresh invention.
const KIT_FLOOR_TONE_JITTER_AMP = 0.05;   // +/-5% value multiplier — subtle, never a hard band jump
const KIT_FLOOR_TONE_JITTER_SALT = 71;    // arbitrary/fixed for determinism (never Math.random/Date.now)
function itrKitFloorToneHash(i, salt) {
  let h = ((i + 1) * 374761393 + salt * 668265263) | 0;
  h = (h ^ (h >>> 13)) | 0; h = Math.imul(h, 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function itrKitFloorToneJitter(x, z) {
  const cell = Math.round((x || 0) * 2) * 131 + Math.round((z || 0) * 2) * 733;
  return 1 + (itrKitFloorToneHash(cell, KIT_FLOOR_TONE_JITTER_SALT) - 0.5) * 2 * KIT_FLOOR_TONE_JITTER_AMP;
}

/* itrKitShellFloorBlocks(plan, kept, roomGround, daisByRoom) -> { floorBlocks:[{x,z,room,toneJitter}], claimedFloor:Set }
   2x2 kenney template-floor tile blocks, anchored per-room at the room's OWN (r.x,r.y) origin corner
   (deterministic, room-local — never a global-grid anchor that could shear across two adjacent rooms of
   different offsets). KIT_SHELL v1 SCOPE (documented, not silently narrowed): a candidate block's 4
   cells must all be plain FLOOR (DOOR/WATER excluded), all in the SAME room, at room.scaleDomain===1.0
   (a scaled lair floor can't tile with a fixed-size module), and NONE of the 4 may be a VP3 ground-
   design "raised" cell, a STAGE-C terrain-tiered cell, or a BW2-5 finale-dais top/ring cell (all three
   ride the SAME `sy` override path — a jittered/tiered/dais step is deliberate texture the flat kit
   tile can't represent) — checked PER CELL, never per room: a room that's mostly flat with one raised
   corner (or a finale room whose dais covers only its own two rings) still kit-tiles everywhere else;
   only the actually-affected cells fall back to prism. */
function itrKitShellFloorBlocks(plan, kept, roomGround, daisByRoom) {
  const floorBlocks = [], claimedFloor = new Set();
  if (!KIT_SHELL_ENABLED) return { floorBlocks, claimedFloor };
  const idx = (x, y) => y * plan.cellW + x;
  const isKept = (x, y) => x >= 0 && y >= 0 && x < plan.cellW && y < plan.cellD && kept[idx(x, y)];
  (plan.rooms || []).forEach((r) => {
    if (!isKept(r.x, r.y) && !itrRoomCellList(r).some(({ x, y }) => isKept(x, y))) return;
    if ((r.scaleDomain || 1.0) !== 1.0) return;
    const gd = roomGround.get(r.segNum);
    const raised = gd && gd.raised;
    const dais = r.role === "finale" && daisByRoom ? daisByRoom.get(r.segNum) : null;
    for (let by = r.y; by < r.y + r.d; by += 2) {
      for (let bx = r.x; bx < r.x + r.w; bx += 2) {
        const cells = [[bx, by], [bx + 1, by], [bx, by + 1], [bx + 1, by + 1]];
        const ok = cells.every(([cx2, cy2]) => {
          if (!isKept(cx2, cy2)) return false;
          if (plan.cells[idx(cx2, cy2)] !== SPATIAL_CELL.FLOOR) return false;
          const key = cx2 + "," + cy2;
          if (raised && raised.has(key)) return false;
          if (plan.tiers && plan.tiers[idx(cx2, cy2)]) return false;
          if (dais && (dais.top.has(key) || dais.ring.has(key))) return false;
          return true;
        });
        if (!ok) continue;
        const bcx = bx + 0.5, bcz = by + 0.5;
        floorBlocks.push({ x: bcx, z: bcz, room: r.segNum, toneJitter: itrKitFloorToneJitter(bcx, bcz) });
        cells.forEach(([cx2, cy2]) => claimedFloor.add(cx2 + "," + cy2));
      }
    }
  });
  return { floorBlocks, claimedFloor };
}

// itrActiveRoomKeepSet(plan, focusSegNum) -> Set([focusSegNum]) | null. Mirrors itrFocusRoomSet's own
// A missing focusSegNum preserves the explicit whole-plan study/harness path (`null`). An explicit but
// unknown focus fails CLOSED to an empty set so stale room state can never reveal the whole dungeon.
function itrActiveRoomKeepSet(plan, focusSegNum) {
  if (focusSegNum == null) return null;
  const exists = (plan.rooms || []).some((r) => r.segNum === focusSegNum);
  return exists ? new Set([focusSegNum]) : new Set();
}

/* core-kept grid: true for a cell inside a kept room's rect, or a corridor cell whose corridor connects
   two kept rooms. `keepSet===null` means "keep everything" (whole-plan mode). */
function itrBuildKeepGrid(plan, keepSet, roomIdx, corridorIdx) {
  const kept = new Uint8Array(plan.cellW * plan.cellD);
  const idx = (x, y) => y * plan.cellW + x;
  for (let y = 0; y < plan.cellD; y++) {
    for (let x = 0; x < plan.cellW; x++) {
      const room = roomIdx.get(x + "," + y);
      if (room) { if (keepSet === null || keepSet.has(room.segNum)) kept[idx(x, y)] = 1; continue; }
      const corridor = corridorIdx.get(x + "," + y);
      if (corridor) {
        if (keepSet === null || (keepSet.has(corridor.fromSeg) && keepSet.has(corridor.toSeg))) kept[idx(x, y)] = 1;
      }
    }
  }
  // second pass: a WALL cell (or any cell not itself room/corridor-owned, e.g. the rasterized ring) is
  // kept if it's 8-adjacent to an already-kept cell — this is what lets a room's own perimeter walls
  // render even though the WALL cells themselves carry no room/corridor membership.
  const kept2 = kept.slice();
  for (let y = 0; y < plan.cellD; y++) {
    for (let x = 0; x < plan.cellW; x++) {
      if (kept[idx(x, y)]) continue;
      if (plan.cells[idx(x, y)] !== SPATIAL_CELL.WALL) continue;
      let adjKept = false;
      for (let dy = -1; dy <= 1 && !adjKept; dy++) {
        for (let dx = -1; dx <= 1 && !adjKept; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) continue;
          if (kept[idx(nx, ny)]) adjKept = true;
        }
      }
      if (adjKept) kept2[idx(x, y)] = 1;
    }
  }
  return kept2;
}

// ─── DUNGEON-GRAPH.md U3 iteration-2, ruling 2: per-room light sources ──────────────────────────────
// Deterministic (DETERMINISM LAW, this file's own header): seeded off dspHashStr/dspMulberry32, the
// SAME reference PRNG pattern src/engine/place-spatialize.js's own header names ("the same reference
// pattern src/ui/theater-boot.js's mulberry32 uses") — both functions are plain classic-script globals
// (place-spatialize.js loads before this file, per manifest.json's loadOrder), no re-implementation.
// BW2-4 addendum (shadow gate): light height. Torches/lamps used to sit at ~1.4-1.8 — roughly a
// standee's MID-height, so a standee's cast shadow threw near-HORIZONTALLY and landed on already-dark
// floor away from the light (invisible — Adam: "I don't think I have seen any cast shadows"). Raised
// ABOVE standee head height (~1.5 world) so the shadow casts DOWN-and-out onto the LIT pool floor around
// the figure, where it READS. A wall sconce / hanging lamp sits high anyway, so this also reads truer.
const ITR_LIGHT_HEIGHT = { lamp: 2.6, torch: 2.5 };
// BW2-4 THE VALUE PLUNGE (docs/BEAUTY-WAVE-2.md §BW2-4, item 1): torch/lamp pools go SMALL + HOT with a
// fast physical falloff. Emit an explicit per-kind `distance` (the THREE.PointLight cutoff radius) +
// `decay` on every light so interiorBuildLights stops falling back to its generic distance:12 default
// (a 12-unit pool floods a whole room — the "even mid-light" the mocks avoid). A torch pool spanning
// ~4-5 cells across (mock-01-gloom-combat.png's sconce) wants a cutoff radius near 6 cells with decay 2
// (most of the illuminance lands within ~1/3 of the cutoff, so the readable hot pool is ~4-5 cells).
const ITR_LIGHT_DISTANCE = { lamp: 6.5, torch: 6.0 };
const ITR_LIGHT_DECAY = 2;
function itrRoomLightCount(room) {
  const area = room.w * room.d;
  if (area < 30) return 1;
  if (area < 80) return 2;
  return 3;
}
// perimeter candidates: floor cells one ring in from the room's own rect edge (the wall/door-adjacent
// band) — "positions at wall/door positions" per the spec. Falls back to the room's own interior cells
// if the room is too small to have a distinct perimeter ring (e.g. a 1xN sliver room).
function itrRoomLightCandidates(room) {
  const pts = [];
  for (let yy = room.y; yy < room.y + room.d; yy++) {
    for (let xx = room.x; xx < room.x + room.w; xx++) {
      const onEdge = xx === room.x || xx === room.x + room.w - 1 || yy === room.y || yy === room.y + room.d - 1;
      if (onEdge) pts.push({ x: xx, y: yy });
    }
  }
  return pts.length ? pts : [{ x: room.x, y: room.y }];
}
// ─── E0 — VISIBLE PRACTICALS (docs/WALL-VOLUMES-PRACTICALS.md) ────────────────────────────────────
// Every light record additionally carries a resolved physical FIXTURE spec: the noun a C4.1a wall
// mount slot or the floor-top can seat something real onto, instead of a floating glow disc. Pure
// data: `fixtureId` + `mount` ("floor"|"wall" — "ceiling" DEFERRED, an open-top diorama has nothing to
// hang a lamp from) + a fixture-LOCAL `emitterLocal` point (the flame/bulb/crystal center).
// `emitterLocal` is AUTHORITATIVE: theater-boot.js's fixture-body builder places its own emissive
// submesh at exactly this point (never a second, independently-guessed height), so PointLight/emitter
// co-location holds by construction. `ownerSegIndex` stays null here — this module has no wall
// geometry (no mount-slot data reaches itrRoomLights); theater-boot.js resolves it against
// S.interiorLastRoomShell.mountSlots at render time (the spec's own "Seam for wall mounts").
//
// FIXTURE-RESOLUTION DATA GAP (documented deviation from the spec's literal table): the spec keys
// fixture choice off (realm, LIGHT PROFILE KEYWORD, kind) — "light profile keyword" being
// THEATER_LIGHT_TABLE's rolled vocabulary (torchlit/lamplit/dark/magic-glow/... — engine.theater-data,
// stamped on the WALK SEGMENT by walk.js's walkRollLight as `.light = {profile,rolled,overridden}`).
// That roll is never threaded onto plan.rooms/SpatialPlan today (grepped: no `.light` reader anywhere
// in place-spatialize.js/place-semantics.js/theater-interior.js) — a pre-existing gap this unit does
// not own or attempt to close. `kind` (kit.lightKind, "torch"|"lamp") is the closest available proxy:
// it already encodes the SAME torchlit/lamplit axis THEATER_LIGHT_KEYWORD_RULES maps those exact words
// to. Fixture resolution below therefore keys off (realmId, kind) plus a per-light SEEDED alternation
// (dspHashStr/dspMulberry32, never Math.random) standing in for the profile's own finer-grained texture
// (e.g. gloom's "ambient/dark" candle-cluster row, which has no separate per-light signal to key off).
// Authority order #1 (project stored fields, never re-roll) is respected: nothing here calls
// theaterRollLight — it simply has no per-light roll to read yet.
const ITR_FIXTURE_RECIPES = Object.freeze({
  "sconce-iron":     Object.freeze({ mount: "wall",  emitterLocal: Object.freeze({ x: 0, y: 0.05, z: 0.16 }) }),
  "sconce-torch":    Object.freeze({ mount: "wall",  emitterLocal: Object.freeze({ x: 0, y: 0.08, z: 0.18 }) }),
  "bracket-generic": Object.freeze({ mount: "wall",  emitterLocal: Object.freeze({ x: 0, y: 0.03, z: 0.12 }) }),
  "brazier-low":     Object.freeze({ mount: "floor", emitterLocal: Object.freeze({ x: 0, y: 0.32, z: 0 }) }),
  "candle-cluster":  Object.freeze({ mount: "floor", emitterLocal: Object.freeze({ x: 0, y: 0.28, z: 0.02 }) }),
  "lantern-handled": Object.freeze({ mount: "floor", emitterLocal: Object.freeze({ x: 0, y: 0.30, z: 0 }) }),
  "crystal-faceted": Object.freeze({ mount: "floor", emitterLocal: Object.freeze({ x: 0, y: 0.30, z: 0 }) }),
  "lamp-post":       Object.freeze({ mount: "floor", emitterLocal: Object.freeze({ x: 0, y: 0.90, z: 0 }) }),
});
// deterministic (roomSegNum + light index) seeded pick per realm family — WALL-VOLUMES-PRACTICALS.md
// §E0's own resolution table (see the gap note above for the kind-as-profile-proxy simplification).
function itrFixtureIdFor(realmId, kind, rng) {
  const r = rng();
  if (realmId === "gloom") {
    if (r < 0.45) return "sconce-iron";
    if (r < 0.85) return "brazier-low";
    return "candle-cluster";
  }
  if (realmId === "fantasy") {
    return r < 0.65 ? "sconce-torch" : "lantern-handled";
  }
  if (realmId === "chrome") return "crystal-faceted";
  // default bucket (the other 9 realms): a wall bracket, floor lamp-post is the render-layer's own
  // defensive fallback when no mount-slot data resolves near this light (interiorBuildLights).
  return "bracket-generic";
}
function itrFixtureFor(room, plan, kit, kind, i) {
  const seedKey = "u3-fixture:" + (plan.seed || "") + ":" + room.segNum + ":" + i;
  const rng = dspMulberry32(dspHashStr(seedKey));
  const fixtureId = itrFixtureIdFor(kit.realmId, kind, rng);
  const recipe = ITR_FIXTURE_RECIPES[fixtureId] || ITR_FIXTURE_RECIPES["lamp-post"];
  return { fixtureId, mount: recipe.mount, emitterLocal: recipe.emitterLocal, sourceRef: seedKey };
}

// per-room deterministic light list — `plan.seed` (U1's own stored seed, always present) folded into
// the per-room hash so two rooms with identical rects in DIFFERENT plans never pick the same pattern,
// while the SAME plan replayed twice (the determinism acceptance every U1-U4 harness checks) always
// yields byte-identical lights.
function itrRoomLights(room, plan, kit, dressingByRoom) {
  const seed = dspHashStr("u3-light:" + (plan.seed || "") + ":" + room.segNum + ":" + room.x + "," + room.y);
  const rng = dspMulberry32(seed);
  const candidates = itrRoomLightCandidates(room);
  // deterministic Fisher-Yates shuffle (seeded rng, not Math.random — DETERMINISM LAW)
  const shuffled = candidates.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
  }
  const n = Math.min(itrRoomLightCount(room), shuffled.length);
  const kind = kit.lightKind || "torch";
  const height = ITR_LIGHT_HEIGHT[kind] || 1.5;
  const baseIntensity = kit.lightIntensity || 1.2;
  const list = shuffled.slice(0, n).map((c, i) => {
    // E0 — VISIBLE PRACTICALS: resolve this light's own physical fixture (see the header block above).
    const fx = itrFixtureFor(room, plan, kit, kind, i);
    return {
      x: c.x, z: c.y, y: height,
      color: kit.lightColor || "#ff9a44",
      intensity: baseIntensity,
      // BW2-4 item 1: SMALL + HOT pools — an explicit per-kind cutoff radius + physical decay so
      // interiorBuildLights renders a ~4-5-cell pool instead of its generic 12-unit room flood.
      distance: ITR_LIGHT_DISTANCE[kind] != null ? ITR_LIGHT_DISTANCE[kind] : 6.0,
      decay: ITR_LIGHT_DECAY,
      kind, roomSegNum: room.segNum,
      fixtureId: fx.fixtureId, mount: fx.mount, ownerSegIndex: null,
      emitterLocal: fx.emitterLocal, sourceRef: fx.sourceRef,
    };
  });
  if (!list.length) return list;

  // VP4 item 2 (key-light-as-composition): the room's BRIGHTEST light (list[0], deterministic — same
  // seeded slot every replay) relocates adjacent to the room's chosen focal dressing piece
  // (place-dressing.js's dpPlaceRoom tags exactly one entry per room `.focal = true`) and steps up to
  // the role's focalLight value; every remaining light in the room dims to <= ITR_FILL_LIGHT_CAP of
  // the key's own intensity (item 2's "remaining lights dim to fill"). Finale rooms earn +1 key
  // intensity step on top (item 4's staging law).
  const sceneDir = sceneDirectionFor(kit.realmId, room.role);
  let keyIntensity = baseIntensity * sceneDir.valueScript.focalLight;
  if (room.role === "finale") keyIntensity *= ITR_FINALE_KEY_STEP;
  const key = list[0];
  key.intensity = keyIntensity;
  const roomDress = (dressingByRoom && dressingByRoom.get(room.segNum)) || null;
  const focalEntry = roomDress ? roomDress.find((d) => d.focal) : null;
  if (focalEntry) { key.x = focalEntry.x; key.z = focalEntry.y; }
  // BW2-5 item 3: finale rooms' key light prefers the DAIS TOP over a dressing card's cell — the
  // dressing focal card itself can never sit in the room's own center 2x2 (place-dressing.js's
  // dpCenter2x2 is a hard, mutation-tested law: dev/verify-dungeon-dressing.mjs check 3), so the
  // mock's "torchlight hits the boss standing on the dais" read has to come from the LIGHT anchor,
  // not the dressing anchor. Overrides focalEntry's relocation above on purpose (more specific rule).
  if (room.role === "finale") {
    const anchor = itrDaisAnchor(room);
    key.x = anchor.x; key.z = anchor.y;
  }
  for (let i = 1; i < list.length; i++) {
    list[i].intensity = Math.min(list[i].intensity, keyIntensity * ITR_FILL_LIGHT_CAP);
  }
  return list;
}

const ITR_WALL_HEIGHT_BASE = 2.4;   // world units — taller than GLB_TARGET_HEIGHT (1.5, a human figure)
const ITR_FLOOR_HEIGHT = 0.2;
const ITR_DOOR_HEIGHT_FRAC = 0.85;  // a normal doorframe reads slightly lower than the full wall
const ITR_SQUEEZE_HEIGHT_FRAC = 0.5;
const ITR_SQUEEZE_WIDTH_FRAC = 0.6;
const ITR_PILLAR_MIN_DIM = 6;       // room must be >= this many cells per axis to earn corner pillars

// STAGE-A A1 — DARKNESS PORTAL cards: a shallow recessed slab standing just past a boundary door's own
// frame, filling the spot a neighbor room's shell used to occupy. ITR_PORTAL_DEPTH is the card's own
// thickness (a card, not a wall); ITR_PORTAL_GAP is the extra push beyond the doorframe/reveal jambs
// before it sits, so the opening reads as a short corridor THROAT (frame, a beat of visible depth, then
// solid dark) rather than a flat plane flush against the arch.
const ITR_PORTAL_DEPTH = 0.12;
const ITR_PORTAL_GAP = 0.15;

// ─── BEAUTY-WAVE-2.md BW2-5 (SILHOUETTE UPGRADES): door arches + wall-thickness reveals ────────────
// "doorframe prisms gain an arch header (2-3 stacked prisms corbelling in)... + visible wall THICKNESS
// at openings" (mock-01-fantasy-explore.png's doorways read deep). Both features ride the SAME
// {x,z,sx,sy,sz,color} instance shape every doorframe/wall entry already uses, extended with two
// OPTIONAL fields (default 0, so every pre-existing instance renders identically to before this unit):
//   yBase — world-Y the prism's own BOTTOM sits at, above the shared floor plane (lets a prism STACK
//     on top of another instead of always growing up off y=-0.5 — theater-boot.js's
//     interiorBuildInstancedMesh, GL layer, reads this).
//   ox/oz — a world-space offset added to the instance's cell position (lets more than one prism
//     occupy sub-regions of the SAME 1x1 cell — a jamb reveal sitting in the margin beside a narrower
//     door frame, or a furniture assembly's several small prisms within one dressing cell).
// (arch-step consts retired 2026-07-23 — THE DOOR CONTRACT; the corbelled arch header is gone.)

// ─── docs/STAGE-D-WAVE-SPECS.md D4d — DOORFRAME MASS FIX (Adam's "big ass column" ruling: "there's
// a big ass column right in front of the door, so I can't really even see it"). The pre-unit frame
// was a SINGLE solid wFrac x wFrac x h box (the full aperture footprint fraction in BOTH cell axes)
// sitting square in the doorway cell — a stone column, not a frame, permanently occluding the D4
// leaf that fills this exact cell (proven RED against the landed geometry: every plain-frame
// instance measured sx=sz=0.8, both axes far over any slim-frame budget). A real doorframe reads as
// two slim JAMB POSTS (one on each side of the aperture's own WIDTH axis) plus a HEADER/lintel
// spanning between them, both hugging the WALL PLANE (thin along the passage/depth axis — the SAME
// axis the wall-thickness reveal jambs already occupy) — never filling the passage axis at all.
// Named budgets:
//   ITR_JAMB_WIDTH_FRAC — each jamb post's width across the aperture span, a cell fraction (spec:
//     "<= ~0.15 cell each").
//   ITR_FRAME_PROUD — how far the frame proudly sits past the wall's own cut thickness (the SAME
//     revealW the wall-thickness-reveal block below already computes) into the room — a shallow
//     lip, never a second wall. Frame depth = revealW + ITR_FRAME_PROUD (spec: "frame depth <= the
//     wall thickness + a small proud reveal"), so a squeeze door's own (wider) reveal margin still
//     yields a proportionally thin — never a thick — frame.
//   ITR_HEADER_HEIGHT — the lintel band's own height, stacked ABOVE the jambs' full h-tall span
//     (yBase=h, exactly where the arch-corbel steps used to start) so the jambs' own [0,h] range —
//     the D4 leaf's full clear opening — stays COMPLETELY unobstructed between them. The arch-corbel
//     steps (non-squeeze doors only, below) shift up by this same amount so they keep corbelling IN
//     from the header's own footprint, never the old wide column's.
// (ITR_JAMB_WIDTH_FRAC / ITR_FRAME_PROUD / ITR_HEADER_HEIGHT / the arch-step consts retired
// 2026-07-23 by THE DOOR CONTRACT — the frame ornament is deleted; see the door branch below.)
// THE KINDERGARTEN DOORWAY (Adam, 2026-07-23: "lets just focus on the bare minimum kindergarten
// version of door. rectangle hole with rectangle door. also average door dimensions are 36\" wide by
// 80\" tall"). GRID LAW: 1 world unit = 1 cell = 5 ft = 60 in. So the prototype DOOR is
// 36/60 = 0.6 u wide × 80/60 = 1.3333 u tall (theater-boot's ITR_DOOR_WIDTH/HEIGHT), and the
// DOORWAY is that rectangle plus a small even clearance, cut into the wall: two full-height wall
// side pieces + one wall band above the opening. Wall-colored, wall-scaled — DOORWAY construction,
// not door dressing. More door types come later via D14's catalog; this is the prototype.
const ITR_DOORWAY_OPENING_W = 0.61;  // 36" leaf + clearance
const ITR_DOORWAY_OPENING_H = 1.35;  // 80" leaf + clearance
const ITR_DOORWAY_DEPTH = 0.3;       // the doorway masonry's own thickness (shell-wall-scaled)

// ─── BW2-5 THE COLUMN DEMOTION (Adam 2026-07-10 night: "why are there so many uniform square
// columns?") — bare square columns become a RARE accent (<=1 per room, most rooms earn none at all)
// and VARIED (square/round/tapered/broken) when they do appear; see the pillar-building block below
// (interiorBuildBoard) for the seeded roll this replaces the old unconditional 4-corner placement with.
const ITR_COLUMN_CHANCE = 0.14;
const ITR_COLUMN_PROFILES = Object.freeze(["square", "round", "tapered", "broken"]);

// ─── BW2-5 FURNITURE CHANNEL — "mid-room verticality is FURNITURE, not columns" (the chrome mock's
// crates/cabinets/machines). furnitureFor(kind, realm) is the SHARED builder ROOM-GRAMMAR's own §4
// names as its dependency: a pure-data prism-assembly recipe (2-6 boxes, local offsets `dx`/`dz`
// (within a 1x1 dressing cell) + `yBase` (stacking height) + a per-face label for the texture seam
// below) — theater-boot.js turns this into real BoxGeometry meshes, textured per PACKET-02's planar-
// face law (§2b UV MAPPING LAWS: "FURNITURE: per-face planar, one self-contained face tile per face").
const ITR_FURNITURE_KINDS = Object.freeze(["crate", "cabinet", "barrel-cluster", "table", "bench", "shelf-unit"]);
const ITR_FURNITURE_RECIPES = Object.freeze({
  crate: Object.freeze([
    { dx: 0, dz: 0, yBase: 0, sx: 0.7, sy: 0.9, sz: 0.7, face: "crate-body" },
    { dx: 0, dz: 0, yBase: 0.9, sx: 0.76, sy: 0.08, sz: 0.76, face: "crate-lid" },
  ]),
  cabinet: Object.freeze([
    { dx: 0, dz: 0, yBase: 0, sx: 0.7, sy: 0.05, sz: 0.46, face: "cabinet-plinth" },
    { dx: 0, dz: 0, yBase: 0.05, sx: 0.65, sy: 1.1, sz: 0.42, face: "cabinet-body" },
    { dx: 0, dz: 0, yBase: 1.15, sx: 0.68, sy: 0.06, sz: 0.44, face: "cabinet-cap" },
  ]),
  "barrel-cluster": Object.freeze([
    { dx: -0.18, dz: -0.1, yBase: 0, sx: 0.35, sy: 0.8, sz: 0.35, face: "barrel" },
    { dx: 0.18, dz: -0.1, yBase: 0, sx: 0.35, sy: 0.8, sz: 0.35, face: "barrel" },
    { dx: 0, dz: 0.2, yBase: 0, sx: 0.35, sy: 0.72, sz: 0.35, face: "barrel" },
  ]),
  table: Object.freeze([
    { dx: 0, dz: 0, yBase: 0.75, sx: 0.9, sy: 0.08, sz: 0.6, face: "table-top" },
    { dx: -0.38, dz: -0.24, yBase: 0, sx: 0.08, sy: 0.75, sz: 0.08, face: "table-leg" },
    { dx: 0.38, dz: -0.24, yBase: 0, sx: 0.08, sy: 0.75, sz: 0.08, face: "table-leg" },
    { dx: -0.38, dz: 0.24, yBase: 0, sx: 0.08, sy: 0.75, sz: 0.08, face: "table-leg" },
    { dx: 0.38, dz: 0.24, yBase: 0, sx: 0.08, sy: 0.75, sz: 0.08, face: "table-leg" },
  ]),
  bench: Object.freeze([
    { dx: 0, dz: 0, yBase: 0.42, sx: 1.0, sy: 0.1, sz: 0.35, face: "bench-seat" },
    { dx: -0.4, dz: 0, yBase: 0, sx: 0.1, sy: 0.42, sz: 0.3, face: "bench-leg" },
    { dx: 0.4, dz: 0, yBase: 0, sx: 0.1, sy: 0.42, sz: 0.3, face: "bench-leg" },
  ]),
  "shelf-unit": Object.freeze([
    { dx: 0, dz: -0.3, yBase: 0, sx: 0.85, sy: 1.4, sz: 0.12, face: "shelf-back" },
    { dx: -0.42, dz: -0.15, yBase: 0, sx: 0.08, sy: 1.4, sz: 0.4, face: "shelf-side" },
    { dx: 0.42, dz: -0.15, yBase: 0, sx: 0.08, sy: 1.4, sz: 0.4, face: "shelf-side" },
    { dx: 0, dz: -0.15, yBase: 0.45, sx: 0.8, sy: 0.05, sz: 0.35, face: "shelf-board" },
    { dx: 0, dz: -0.15, yBase: 0.95, sx: 0.8, sy: 0.05, sz: 0.35, face: "shelf-board" },
  ]),
});
/* furnitureFor(kind, realm) -> {kind, prisms:[{dx,dz,yBase,sx,sy,sz,face}]} — never throws, degrades
 * to "crate" on an unknown kind (total-function discipline this file keeps everywhere else). */
function furnitureFor(kind, realm) {
  const k = ITR_FURNITURE_RECIPES[kind] ? kind : "crate";
  return { kind: k, realm: realm || null, prisms: ITR_FURNITURE_RECIPES[k] };
}
/* BW2-3 (the PACKET-02 crate-face arrivals landed): map each furnitureFor face LABEL to one of the six
 * sliced face tiles (build/fold-textures.py: crate-side/crate-top/cabinet-door/panel-vents/panel-glow/
 * panel-plain). Only the three FLAGSHIPS carry face tiles — a non-flagship realm/unknown face returns
 * null and the GL half falls back to proceduralPanelTexture (the seam is unchanged). */
const ITR_FLAGSHIP_FACE_REALMS = Object.freeze({ fantasy: true, gloom: true, chrome: true });
const ITR_FURNITURE_FACE_TILE = Object.freeze({
  "crate-body": "crate-side", "crate-lid": "crate-top",
  "cabinet-body": "panel-vents", "cabinet-door": "cabinet-door", "cabinet-plinth": "panel-plain", "cabinet-cap": "panel-glow",
  "barrel": "crate-side",
  "table-top": "crate-top", "table-leg": "panel-plain",
  "bench-seat": "crate-top", "bench-leg": "panel-plain",
  "shelf-back": "panel-plain", "shelf-side": "panel-plain", "shelf-board": "crate-top",
});
/* textureFaceFor(realm, face) -> a folded PACKET-02 face-texture FILE PATH, or null. theater-boot's
 * furniturePanelMaterial loads the path (per-face planar, ClampToEdge — §2b FURNITURE law) when
 * non-null, else falls back to proceduralPanelTexture. */
function textureFaceFor(realm, face) {
  if (!ITR_FLAGSHIP_FACE_REALMS[realm]) return null;
  const tile = ITR_FURNITURE_FACE_TILE[face];
  if (!tile) return null;
  return "assets/textures/" + realm + "-face-" + tile + "-1.png";
}
// deterministic per-dressing-entry furniture KIND pick (u3-furniture-kind seed) — the dressPlan roll
// already owns WHICH blocker slug/noun appears (nouns law unchanged); this is a SEPARATE, purely
// render-layer roll for the furniture SILHOUETTE that noun renders as, seeded off the entry's own
// stable identity (room+cell+slug) so the same seed always yields the same furniture kind.
function itrFurnitureKindFor(seedKey) {
  const seed = dspHashStr("u3-furniture-kind:" + seedKey);
  const rng = dspMulberry32(seed);
  return ITR_FURNITURE_KINDS[Math.floor(rng() * ITR_FURNITURE_KINDS.length) % ITR_FURNITURE_KINDS.length];
}

// ─── ADDENDUM (Adam, mid-flight, docs/BEAUTY-WAVE-2.md just above BW2-6): THE PROP PERSPECTIVE LAW —
// "surface-attached props (wall screens/paintings/shelves/sconces, floor rugs/grates) must mount as
// SHALLOW EXTRUSION prisms, not flat cards — baked-perspective art on a geometry-locked card fights
// the scene camera" (a wall-hang billboard always rotates to face the CAMERA regardless of which wall
// it's actually mounted on, so at the fixed isometric angle a "screen" can read backwards/sideways —
// Adam's own words, "a cyber screen at the exact opposite perspective"). Free-standing dressing
// (trees/gravestones — primary:"floor"/"focal"/"setPiece") stays billboard/card, unchanged, per the
// addendum's own instruction — only wall-hang (and any future floor-lay/rug) mounts route through
// this. extrusionPropFor(entry) is the pure-data half (this file); theater-boot.js's
// buildExtrusionProp/interiorBuildWallProps is the GL half (real BoxGeometry, front face = the art
// texture, side/back faces edge-sampled from the SAME art's own border pixels — automatic, no second
// authored color source).
const ITR_EXTRUSION_DEPTH_BY_ARCHETYPE = Object.freeze({
  painting: 0.04, screen: 0.05, sconce: 0.08, shelf: 0.3, rug: 0.01, default: 0.05,
});
function itrExtrusionArchetypeFor(entry) {
  const entrySlug = String((entry && entry.slug) || "");
  if (/paint/.test(entrySlug)) return "painting";
  if (/screen|monitor|billboard|hologram|cctv/.test(entrySlug)) return "screen";
  if (entry && entry.lightAffine) return "sconce";
  if (/shelf|rack/.test(entrySlug)) return "shelf";
  if (/rug|runner|carpet/.test(entrySlug)) return "rug";
  return "default";
}
/* extrusionPropFor(entry) -> {archetype, depth} — never throws, degrades to the "default" archetype's
 * depth (0.05, a thin generic panel) on anything unrecognized. */
function extrusionPropFor(entry) {
  const archetype = itrExtrusionArchetypeFor(entry);
  const depth = (ITR_EXTRUSION_DEPTH_BY_ARCHETYPE[archetype] != null)
    ? ITR_EXTRUSION_DEPTH_BY_ARCHETYPE[archetype] : ITR_EXTRUSION_DEPTH_BY_ARCHETYPE.default;
  return { archetype, depth };
}
// which side of the cell the adjacent WALL sits on ("n"/"s"/"e"/"w"), or null (an isolated wall-hang
// with no adjacent WALL cell — rare/degenerate; the GL layer falls back to no rotation rather than
// throwing). place-dressing.js already guarantees every wall-hang entry is wall-adjacent
// (dpAdjacentToWall) — this just names WHICH side, off the same plan.cells grid, never a second guess.
function itrWallSideAt(x, y, plan) {
  if (itrCellCodeAt(x, y - 1, plan) === SPATIAL_CELL.WALL) return "n";
  if (itrCellCodeAt(x, y + 1, plan) === SPATIAL_CELL.WALL) return "s";
  if (itrCellCodeAt(x - 1, y, plan) === SPATIAL_CELL.WALL) return "w";
  if (itrCellCodeAt(x + 1, y, plan) === SPATIAL_CELL.WALL) return "e";
  return null;
}

// ─── BW2-5 FINALE DAIS — "finale rooms get a centered 2-step dais platform... real 0.15-0.25 steps,
// walkable, combat-grid-aware". Mechanism: THE FLOOR CONTACT LAW (theater-boot.js) already derives
// every mount point's contact Y straight off the floor cell's own baked `sy` — so raising a finale
// room's center-cell `sy` for two deliberate ring/top tiers, instead of VP3's random micro-jitter, is
// ALL that's needed for the dais to read as a real stepped platform AND stay walkable/combat-grid-
// aware (the cell's own SPATIAL_CELL code never changes — still plain FLOOR, still routable; only its
// rendered height changes, exactly like VP3's own micro-steps already do for texture, just larger and
// deliberately shaped here). The room's own reserved CENTER 2x2 (itrCenter2x2 — VP3's own "never
// touched by height steps" exclusion) is exactly the dais TOP tier: that reservation exists so a
// deliberate architectural feature like this one can occupy it without fighting VP3's random jitter.
const ITR_DAIS_STEP = 0.2; // each of the 2 risers, within the spec's own 0.15-0.25 band
function itrDaisAnchor(room) {
  // the single canonical "dais top" cell (a stable reference point for the key-light/piece-preference
  // bias below) — the SAME corner itrCenter2x2 always starts its own 2x2 block from, so it's always
  // one of the four real dais-top cells the render actually raises.
  return {
    x: room.x + Math.max(0, Math.floor((room.w - 2) / 2)),
    y: room.y + Math.max(0, Math.floor((room.d - 2) / 2)),
  };
}
function itrDaisCellsFor(room) {
  const top = itrCenter2x2(room);
  const ring = new Set();
  top.forEach((key) => {
    const parts = key.split(",");
    const cx = parseInt(parts[0], 10), cy = parseInt(parts[1], 10);
    [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dx, dy]) => {
      const nx = cx + dx, ny = cy + dy;
      if (nx < room.x || ny < room.y || nx >= room.x + room.w || ny >= room.y + room.d) return;
      const k = nx + "," + ny;
      if (!top.has(k)) ring.add(k);
    });
  });
  return { top, ring };
}

// ─── GR4 (docs/GRAPHICS-ENGINE.md build unit GR4, STAGE LAW): the diorama edge skirt — a darkened
// realm-tinted prism band ringing the board's own bounding-rect perimeter, 0.4 cells deep, hanging
// BELOW the y=-0.5 floor plane (theater-boot.js's interiorBuildInstancedMesh's own "every column's
// base sits on the SAME y=-0.5 floor plane" convention — the skirt is the one instance kind that grows
// DOWN off that plane instead of up, see that function's shadowKind==="skirt" branch) — "so the
// floating slab reads finished from every yaw" (the spec's own words: a rectangular ring around the
// whole rendered footprint, not a per-room treatment, since the tray itself floats as ONE slab). Pure
// geometric derivation off the board's own tracked bounds, same discipline as pillars above (no RNG,
// no dressing-table roll). `kit` supplies the tint source (wallColor, darkened) so the skirt reads as
// realm-flavored, never a neutral grey collar. */
const ITR_SKIRT_DEPTH = 0.4;        // "0.4 cells deep" per the spec
const ITR_SKIRT_DARKEN = 0.4;       // multiplicative darken factor on kit.wallColor (band reads "in shadow")
function itrDarkenHex(hex, factor) {
  const h = String(hex || "#888888").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const v = Number.isFinite(n) ? n : 0x888888;
  const clamp = (x) => (x < 0 ? 0 : x > 255 ? 255 : Math.round(x));
  const r = clamp(((v >> 16) & 255) * factor), g = clamp(((v >> 8) & 255) * factor), b = clamp((v & 255) * factor);
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
// ─── BW2-4 THE VALUE PLUNGE (docs/BEAUTY-WAVE-2.md §BW2-4, item 2): the RIM VIGNETTE. A DETERMINISTIC
// graded darken band that rings the diorama's own outer bounds — floor/wall/pillar/skirt cells fall
// toward near-black as they approach the void edge (mock-01-gloom-combat.png / mock-01-finale.png: the
// diorama rim reads near-black, the box you look INTO). This is the outward extension of VP3's 8%
// per-room perimeter darken (theater-interior.js's ITR_PERIMETER_DARKEN, which only touches a room's
// OWN edge cells) into a board-wide vignette keyed on distance to the board bounding rect — NOT a
// screen-space shader (a post-pass over the already-built instance colors, pure function of cell
// position + bounds, so the determinism law + verify-scene-direction group 7 stay green). Doorframes
// are EXEMPT: the accent-discipline gate (verify-scene-direction group 5) counts a room's distinct
// doorframe colors, and a position-dependent darken would multiply kit.trimColor into several variants
// and trip it — the accent thread is a hue story, not a value story, so it opts out of the vignette.
const ITR_RIM_BAND = 2.5;   // cells: vignette band width, measured inward from the outer bounds
const ITR_RIM_MIN = 0.42;   // darkest multiplier, applied to a cell sitting ON the outer bounds edge
// BW2-4 item 4 (THE VALUE LAW: dark < mid floor < ONE bright): corner PILLARS ship with kit.trimColor
// (the bright accent hue — gloom #6b5878, fantasy #c9a85c), so mid-room columns read as BRIGHT verticals
// that fight the standees (round-1 READ: lavender/sand columns, where the mocks keep columns near-black
// stone). A value-only darken pulls them down toward wall value without touching the geometry builder
// (BW2-5's COLUMN DEMOTION owns the pillar.push line + shapes; this is purely the VALUE those verticals
// render at, applied in the same post-pass as the rim vignette). Not a hue change — trimColor's accent
// hue survives, only its value drops.
const ITR_PILLAR_VALUE = 0.32;
// depth = min cells to any of the 4 bounds edges; factor lerps ITR_RIM_MIN (edge) -> 1.0 (>= band in).
function itrRimFactor(x, z, bounds) {
  const depth = Math.min(x - bounds.minX, bounds.maxX - x, z - bounds.minZ, bounds.maxZ - z);
  if (depth >= ITR_RIM_BAND) return 1;
  const t = Math.max(0, depth) / ITR_RIM_BAND;
  return ITR_RIM_MIN + (1 - ITR_RIM_MIN) * t;
}
// ─── VP4 SCENE ART DIRECTION (docs/BEAUTY-WAVE.md §VP4) — a small color-math toolkit + the
// SCENE_DIRECTION table itself. dominantHue/accentHue are derived ONCE per realm off the kit's own
// wall/trim colors (GR3's "kit carries the final numbers" discipline — never a second hand-authored
// color source); valueScript is a realm-INDEPENDENT per-role compositional shape (floor < wall <
// focal light, item 1's painted-scene hierarchy), so every realm inherits the SAME hierarchy tuned to
// its own role, with finale earning the deepest floor + brightest key (item 4's staging law). ────────
function itrHexToHsl(hex) {
  const h = String(hex || "#888888").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const v = Number.isFinite(n) ? n : 0x888888;
  const r = ((v >> 16) & 255) / 255, g = ((v >> 8) & 255) / 255, b = (v & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue = 0; const l = (max + min) / 2; let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
  }
  return { h: hue, s, l };
}
function itrHslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) { r1 = c; g1 = x; } else if (h < 120) { r1 = x; g1 = c; }
  else if (h < 180) { g1 = c; b1 = x; } else if (h < 240) { g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; b1 = c; } else { r1 = c; b1 = x; }
  const clamp255 = (v) => Math.max(0, Math.min(255, Math.round((v) * 255)));
  const r = clamp255(r1 + m), g = clamp255(g1 + m), b = clamp255(b1 + m);
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}
function itrHueOfHex(hex) { return itrHexToHsl(hex).h; }
// itrTintTowardHue(hex, targetHue, strength) — blends hex's OWN hue toward targetHue by `strength`
// (0..1), keeping the source's own saturation/lightness (ACCENT DISCIPLINE item 3's "tint toward
// accentHue <= 0.1 strength" — a mood wash, never a color-replace, same low-strength law GR3's own
// per-realm grade tint already keeps for the void/fog backdrop).
function itrTintTowardHue(hex, targetHue, strength) {
  const hsl = itrHexToHsl(hex);
  let delta = ((targetHue - hsl.h + 540) % 360) - 180; // shortest signed hue-circle distance
  const newHue = hsl.h + delta * strength;
  return itrHslToHex(newHue, hsl.s, hsl.l);
}

const ITR_ACCENT_STRENGTH = 0.1;      // VP4 item 3: "<= 0.1 strength"
const ITR_FILL_LIGHT_CAP = 0.6;       // VP4 item 2: fill lights dim to <= 60% of key intensity
const ITR_FINALE_KEY_STEP = 1.15;     // VP4 item 4: finale rooms get +1 key intensity step
const SCD_DEFAULT_ROLE = "side";
// valueScript is per-ROLE (not per-realm): floor < wall < focalLight, always — the painted-scene
// hierarchy VP4 item 1 asks to ASSERT after grade application. finale carries the steepest spread
// (deepest floor, brightest focal light), matching item 4's staging law.
const SCD_ROLE_VALUE_SCRIPT = Object.freeze({
  entrance: Object.freeze({ floor: 0.82, wall: 1.00, focalLight: 1.18 }),
  path:     Object.freeze({ floor: 0.80, wall: 1.00, focalLight: 1.20 }),
  side:     Object.freeze({ floor: 0.80, wall: 1.00, focalLight: 1.22 }),
  pocket:   Object.freeze({ floor: 0.78, wall: 1.00, focalLight: 1.28 }),
  finale:   Object.freeze({ floor: 0.76, wall: 1.00, focalLight: 1.34 }),
});
// SCENE_DIRECTION[realmId][role] = {dominantHue, accentHue, valueScript} — per realm x room ROLE, per
// the spec's own data shape. dominantHue/accentHue repeat across a realm's own roles (they're the
// realm's identity anchors, not role-varying), valueScript varies by role (the compositional shape) —
// built once at load time off INTERIOR_TILE_KITS + SCD_ROLE_VALUE_SCRIPT so every realm's kit stays
// the single source of truth for its own hues (never a second hand-authored hue table to drift).
const SCENE_DIRECTION = Object.freeze(Object.keys(INTERIOR_TILE_KITS).reduce((acc, realmId) => {
  const kit = INTERIOR_TILE_KITS[realmId];
  const dominantHue = itrHueOfHex(kit.wallColor);
  const accentHue = itrHueOfHex(kit.trimColor);
  acc[realmId] = Object.freeze(Object.keys(SCD_ROLE_VALUE_SCRIPT).reduce((racc, role) => {
    racc[role] = Object.freeze({ dominantHue: dominantHue, accentHue: accentHue, valueScript: SCD_ROLE_VALUE_SCRIPT[role] });
    return racc;
  }, {}));
  return acc;
}, {}));
function sceneDirectionFor(realmId, role) {
  const byRealm = SCENE_DIRECTION[realmId] || SCENE_DIRECTION[INTERIOR_DEFAULT_KIT];
  return byRealm[role] || byRealm[SCD_DEFAULT_ROLE];
}

// itrBuildSkirtRing(bounds, kit) -> [{x,z,sx,sy,sz,color}] — one skirt instance per cell on the OUTER
// ring of the board's own tracked bounding rect (bounds.{minX,maxX,minZ,maxZ}, the SAME object
// interiorBuildBoard already computes for its own `bounds` field — never a second derivation). A
// degenerate 1-wide/1-deep bounds (every cell sits on an edge by definition) skirts the WHOLE strip,
// same as any other perimeter-of-a-1xN-rect degenerate case — never throws, never empty on a real board.
function itrBuildSkirtRing(bounds, kit) {
  const skirt = [];
  if (!bounds || !Number.isFinite(bounds.minX) || !Number.isFinite(bounds.maxX)) return skirt;
  const color = itrDarkenHex(kit.wallColor, ITR_SKIRT_DARKEN);
  for (let x = bounds.minX; x <= bounds.maxX; x++) {
    for (let z = bounds.minZ; z <= bounds.maxZ; z++) {
      const onEdge = x === bounds.minX || x === bounds.maxX || z === bounds.minZ || z === bounds.maxZ;
      if (!onEdge) continue;
      skirt.push({ x, z, sx: 1, sy: ITR_SKIRT_DEPTH, sz: 1, color });
    }
  }
  return skirt;
}

// ─── BEAUTY-WAVE VP3 (docs/BEAUTY-WAVE.md §VP3, GROUND DESIGN): floors that read composed, not
// extruded. All seeded off (plan.seed || opts.walkId derivation the caller already threads through
// plan.seed — DETERMINISM LAW, this file's own header) via dspHashStr/dspMulberry32, the SAME seeded-
// RNG convention itrRoomLights already keeps (never Math.random). Four features, all data-only (this
// file stays THREE/DOM-free per its own header) — the GL layer (theater-boot.js) needs zero new
// wiring for tone/height/perimeter (they ride the existing floor instance's color/sy fields); the
// `cover` array is a new sibling of `instances` (like `skirt` above) awaiting its own render pass.
const ITR_FLOOR_TONE_ROOM_MAX = 0.06;  // per-room floor tone nudge, +/- 6% (spec cap)
const ITR_FLOOR_TONE_CELL_MAX = 0.03;  // per-cell micro-jitter on top of the room tone, +/- 3% (spec cap)
const ITR_STEP_FRAC_MIN = 0.05;        // 5-15% of a room's ELIGIBLE floor cells get a micro height step
const ITR_STEP_FRAC_MAX = 0.15;
const ITR_STEP_MIN = 0.04;             // sy jitter magnitude, 0.04-0.08 world units (spec)
const ITR_STEP_MAX = 0.08;
const ITR_PERIMETER_DARKEN = 0.08;     // perimeter floor cells darken 8% toward the walls
const ITR_COVER_MIN = 1;               // 1-3 ground-cover patches seeded per room
const ITR_COVER_MAX = 3;
const ITR_COVER_FOOTPRINT = 0.6;       // quad-card world-unit footprint (a patch, not a full tile)
const ITR_COVER_Y_OFFSET = 0.01;       // flat ON the floor, +0.01 above the y=-0.5 plane (no z-fight)

// the room's central 2x2 — NEVER touched by height steps/tone-darken exclusions (the amendment's own
// words); a small local derivation (not a cross-file call into place-dressing.js's dpCenter2x2) since
// this file's own DETERMINISM LAW header keeps it dependency-free of the dressing module.
function itrCenter2x2(room) {
  const set = new Set();
  const cx0 = room.x + Math.floor((room.w - 1) / 2);
  const cz0 = room.y + Math.floor((room.d - 1) / 2);
  for (let dx = 0; dx <= 1; dx++) {
    for (let dz = 0; dz <= 1; dz++) set.add((cx0 + dx) + "," + (cz0 + dz));
  }
  return set;
}

// a cell counts as wall-adjacent if any 4-neighbor is a WALL cell OR falls off the plan's own grid
// (the board edge is a wall boundary too, even with no WALL cell code sitting past it).
function itrAdjacentToWall(x, y, plan) {
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => {
    const nx = x + dx, ny = y + dz;
    if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) return true;
    return plan.cells[ny * plan.cellW + nx] === SPATIAL_CELL.WALL;
  });
}

// itrRoomCellList(room) -> the room's ACTUAL cell set: STAGE-C C3's `room.cells` ([{x,y}] GLOBAL
// floor cells for a non-rect shape, place-spatialize.js's dspBuildPlanOnce) when present, else the
// room's bbox rect enumerated on the fly (a pre-C3 plan, SPATIAL_SHAPES off, or any other caller
// that never stamped `.cells`) — BYTE-IDENTICAL iteration order to the original inline double-loop
// in that fallback case. The single seam both VP3-ground precompute loops below iterate through, so
// neither one enumerates a non-rect room's VOID bbox cells (a circle/L/cave room's own missing
// corners/fringe) as ground-design candidates. Minimal, localized touch — STAGE-C.md C3's own
// instruction; the AO-gradient/render-shape extension itself stays out of scope (theater-room-
// mesh.js's isAxisAlignedRectPolygon gate already falls non-rect floors back to flat ear-clip).
function itrRoomCellList(room) {
  if (Array.isArray(room.cells) && room.cells.length) return room.cells;
  const out = [];
  for (let y = room.y; y < room.y + room.d; y++) {
    for (let x = room.x; x < room.x + room.w; x++) out.push({ x, y });
  }
  return out;
}

// AMENDED item 2 (docs/BEAUTY-WAVE.md §VP3): the combat grid routes a piece through ANY floor cell
// that ISN'T perimeter/wall-adjacent/dressing-blocked — pieces MOVE (move-step walks cells mid-combat),
// so "initially occupied" is the wrong test. Eligible-for-raising = {onEdge, wall-adjacent, dressing-
// blocked} minus the center 2x2, which is exactly the complement of "cells the combat grid ever routes
// through" per the amendment's own three-category list — never a routable cell.
function itrRoomGroundEligible(room, plan) {
  const center = itrCenter2x2(room);
  const dressingBlocked = new Set(
    (plan.dressing || []).filter((d) => d.roomSegNum === room.segNum).map((d) => d.x + "," + d.y)
  );
  const cells = [];
  itrRoomCellList(room).forEach(({ x, y }) => {
    if (plan.cells[y * plan.cellW + x] !== SPATIAL_CELL.FLOOR) return;
    const key = x + "," + y;
    if (center.has(key)) return;
    const onEdge = x === room.x || x === room.x + room.w - 1 || y === room.y || y === room.y + room.d - 1;
    if (onEdge || itrAdjacentToWall(x, y, plan) || dressingBlocked.has(key)) cells.push({ x, y });
  });
  return cells;
}

// deterministic Fisher-Yates off a seeded rng (never Math.random) — same shuffle shape itrRoomLights
// already keeps, reused verbatim for the ground-design seeded picks below.
function itrSeededShuffle(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = out[i]; out[i] = out[j]; out[j] = t;
  }
  return out;
}

// VP2/VP6 seam (the spec's own words): "coverCardFor(...) || proceduralSplat" — until a real `cover`
// dressing-gen roster lands (moss/dust/spill decal art), every patch falls back to a procedural tint
// splat off the room's own trim color. `realmId` picks the kit/tint source; `rng` is the room's own
// seeded stream (never a fresh Math.random draw) so the fallback stays deterministic too.
function itrCoverCardFor(realmId, rng) {
  const kit = interiorTileKitFor(realmId);
  const tint = itrDarkenHex(kit.trimColor, 0.55 + rng() * 0.35);
  return { slug: null, proc: true, color: tint };
}

/** interiorBuildBoard(plan, opts) → InteriorBoard:
 * { kind:"interior3d", env, realmId, cellSize:1, wallHeightBase, fog:{color},
 *   tileKit:{floorColor,wallColor,trimColor,
 *     floorMaterial,wallMaterial,trimMaterial,floorGrain,wallGrain,trimGrain,
 *     gradeTint,gradeStrength,fogWhisper},
 *   instances:{ floor:[{x,z,sx,sy,sz,color}] (VP3 GROUND DESIGN: color carries per-room tone +/-6%
 *     w/ per-cell +/-3% jitter and an 8% perimeter darken baked in; sy carries a +/-0.04-0.08 micro
 *     height step on 5-15% of eligible cells — perimeter/wall-adjacent/dressing-blocked ONLY, never
 *     the center 2x2 or any combat-routable cell; STAGE-C C2 (docs/STAGE-C.md) then folds in
 *     `plan.tiers[cell]` — a +1/-1 dais/pit tier parsed off the room's own rolled `side` prose —
 *     as a full ITR_DAIS_STEP shift, overriding VP3's jitter for that cell; the finale-dais block
 *     runs last and still wins if both apply), wall:[...], doorframe:[{...,squeeze}], pillar:[...] },
 *   skirt:[{x,z,sx,sy,sz,color}] (GR4 — the diorama edge band, a sibling of `instances`, never counted
 *     toward the "4 known instance kinds" data-shape check: it's a separate render channel),
 *   cover:[{x,z,y,sx,sy,sz,color,slug,proc,roomSegNum}] (VP3 item 3 — ground-cover decal cards, 1-3
 *     seeded per room, FLOOR cells only, flat +0.01 above the floor plane; another `instances` sibling,
 *     procedural tint-splat until real cover art lands via itrCoverCardFor's VP2/VP6 seam),
 *   portals:[{x,z,ox,oz,sx,sy,sz,color,yBase:0,roomSegNum,neighborSegNum}] (STAGE-A A1 — DARKNESS
 *     PORTAL cards: another `instances` sibling, one per boundary door whose OTHER side isn't in the
 *     render keep set — a shallow recessed dark slab standing just past the doorframe, filling the
 *     spot the neighbor room's own shell used to render. Only populated when ITR_ACTIVE_ROOM_ONLY is
 *     on (default) AND a focus room was requested; empty array otherwise (whole-plan renders, or the
 *     flag flipped off for an A/B capture, carry zero portals — every door is a plain open frame,
 *     same as pre-A1).
 *   bounds:{minX,maxX,minZ,maxZ},
 *   meta:{roomCount,floorCount,wallCount,doorCount,pillarCount,skirtCount,coverCount,portalCount} }
 * `plan` is a U1 spatializePlan() output, ideally U2-extended (semanticizePlan) for room.scaleDomain/
 * door.transition/door.squeeze — a bare U1 plan degrades cleanly (every room defaults scaleDomain 1.0,
 * every door renders as a normal non-squeeze frame), never throws.
 * `opts`: { realmId, env, focusSegNum, radius=1, projection? } — STAGE-A A1: with ITR_ACTIVE_ROOM_ONLY on (default),
 * focusSegNum alone selects the render keep set ({focusSegNum} exactly — radius is READ but ignored,
 * kept only so an OFF-flag caller/harness can still request the pre-A1 radius-hop behavior); omit
 * focusSegNum to render the WHOLE plan (the 80-room draw-call-budget check, and the study card's
 * whole-plan scenes). ITR_ACTIVE_ROOM_ONLY=false restores the pre-A1 "focusSegNum+radius trims to
 * current room + immediate surroundings" behavior (DUNGEON-GRAPH.md U3 item 2) byte-for-byte.
 * Pure: same (plan,opts) snapshot always yields byte-identical instance arrays (no RNG). */
function interiorBuildBoard(plan, opts) {
  opts = opts || {};
  if (!plan || !Array.isArray(plan.rooms) || !plan.rooms.length || !plan.cells) {
    throw new Error("interiorBuildBoard: plan.rooms[]/plan.cells are required (spatializePlan/semanticizePlan output expected)");
  }
  const kit = interiorTileKitFor(opts.realmId);
  const env = opts.env || "dungeon";
  const radius = opts.radius == null ? 1 : opts.radius;
  const roomIdx = itrRoomIndex(plan);
  const corridorIdx = itrCorridorIndex(plan);
  const doorIdx = itrDoorIndex(plan);
  // STAGE-A A1: the active room ALONE owns render geometry by default — keepSet collapses to
  // {focusSegNum}, never a radius-hop neighborhood. ITR_ACTIVE_ROOM_ONLY=false is the documented
  // escape hatch back to the pre-A1 itrFocusRoomSet(plan, focusSegNum, radius) neighbor-hop keep set.
  const keepSet = ITR_ACTIVE_ROOM_ONLY
    ? itrActiveRoomKeepSet(plan, opts.focusSegNum)
    : itrFocusRoomSet(plan, opts.focusSegNum, radius);
  const kept = itrBuildKeepGrid(plan, keepSet, roomIdx, corridorIdx);

  // BW2-3 MATERIAL TEXEL — resolve the folded PACKET-02 texture-file pointers for this board (THE
  // VARIANT ROLL: seeded per walkId+room = plan.seed + focus segNum, deterministic). null on a
  // non-flagship realm -> theater-boot's floorTex/wallTex path uses the procedural painter instead.
  const texSeedKey = (plan.seed || "") + ":" + (opts.focusSegNum != null ? opts.focusSegNum : "board");
  const floorTexVar = interiorTextureVariantFor(kit.realmId, "floor", texSeedKey);
  const wallTexVar = interiorTextureVariantFor(kit.realmId, "wall", texSeedKey);
  const trimTexVar = interiorTextureVariantFor(kit.realmId, "trim", texSeedKey);

  // VP4 (docs/BEAUTY-WAVE.md §VP4): index plan.dressing by room so itrRoomLights can find each room's
  // chosen focal cell without re-scanning the whole array per room. `plan` here IS the dressPlan()
  // output when dressing ran first (theater-data.js's own dressPlan-then-interiorBuildBoard order) —
  // a bare/undressed plan (every verify-dungeon-interior.mjs fixture, and any U1/U2-only caller)
  // simply carries no `.dressing`, and this degrades to an empty map (no focal relocation, same as
  // before this unit — total-function discipline, never throws).
  const dressingByRoom = new Map();
  if (Array.isArray(plan.dressing)) {
    plan.dressing.forEach((d) => {
      if (!dressingByRoom.has(d.roomSegNum)) dressingByRoom.set(d.roomSegNum, []);
      dressingByRoom.get(d.roomSegNum).push(d);
    });
  }
  const accentedRooms = new Set(); // VP4 item 3: exactly ONE accent thread (doorframe) per room

  const idx = (x, y) => y * plan.cellW + x;
  const floor = [], wall = [], doorframe = [], pillar = [];
  const kitDoors = []; // KS-2: one entry per KIT_DOORS_ENABLED-eligible door cell — {x,z,widthAxisIsZ,pack,slug}
  // DOOR TRANCHE (2026-07-23): one entry per door cell, kit-eligible or not — {x,z,widthAxisIsZ}.
  // itrDoorWidthAxisIsZ (the multi-cell wall-run scan, computed once per door below) is THE authority
  // for which axis the pierced wall runs; the frame has always consumed it, but the leaf
  // (interiorBuildInteractableDoorMesh) re-derived orientation from a lone east-west floor-neighbor
  // heuristic that misfires for a door on the room's own edge row (both lateral neighbors are room
  // floor there) — the clay fixture's leaf mounted PERPENDICULAR to its wall, a monolith jutting
  // into the room. The board now carries the frame's own answer so frame and leaf can never disagree.
  const doorAxes = [];
  const portals = []; // STAGE-A A1 — DARKNESS PORTAL cards, populated in the DOOR branch below
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  const track = (x, z) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); };

  // VP3 GROUND DESIGN (docs/BEAUTY-WAVE.md §VP3): one seeded pass per KEPT room, precomputed BEFORE
  // the main floor loop below so the loop's own per-cell color/sy math stays a pure lookup (no RNG
  // consumed inside the double for-loop, keeping the room's own rng stream stable regardless of cell
  // iteration order — same discipline itrRoomLights already keeps for its own seeded stream).
  const roomGround = new Map(); // segNum -> { toneDelta, raised:Map(key->deltaSy), coverCells:[{x,y}] }
  (plan.rooms || []).forEach((r) => {
    if (keepSet !== null && !keepSet.has(r.segNum)) return;
    const seed = dspHashStr("u3-ground:" + (plan.seed || "") + ":" + r.segNum + ":" + r.x + "," + r.y);
    const rng = dspMulberry32(seed);
    const toneDelta = (rng() * 2 - 1) * ITR_FLOOR_TONE_ROOM_MAX;

    const eligible = itrRoomGroundEligible(r, plan);
    const shuffledEligible = itrSeededShuffle(eligible, rng);
    const frac = ITR_STEP_FRAC_MIN + rng() * (ITR_STEP_FRAC_MAX - ITR_STEP_FRAC_MIN);
    const take = Math.round(shuffledEligible.length * frac);
    const raised = new Map();
    shuffledEligible.slice(0, take).forEach((c) => {
      const mag = ITR_STEP_MIN + rng() * (ITR_STEP_MAX - ITR_STEP_MIN);
      const sign = rng() < 0.5 ? -1 : 1;
      raised.set(c.x + "," + c.y, sign * mag);
    });

    // STAGE-C C3: iterate the room's ACTUAL cell set (itrRoomCellList, above) rather than its bbox
    // rect — a non-rect room's own VOID notch/fringe cells never get pushed as cover-placement
    // candidates. Byte-identical for a rect room (itrRoomCellList's own fallback IS this loop).
    const allFloor = itrRoomCellList(r).filter(({ x, y }) => plan.cells[y * plan.cellW + x] === SPATIAL_CELL.FLOOR);
    const shuffledFloor = itrSeededShuffle(allFloor, rng);
    const coverCount = Math.min(shuffledFloor.length, ITR_COVER_MIN + Math.floor(rng() * (ITR_COVER_MAX - ITR_COVER_MIN + 1)));
    const coverCells = shuffledFloor.slice(0, coverCount);

    roomGround.set(r.segNum, { toneDelta, raised, coverCells });
  });

  // BW2-5 item 3: FINALE DAIS — precomputed per finale room (segNum -> {top,ring}), consumed by the
  // floor loop below to override `sy` on exactly those cells (deliberate architecture, not VP3's
  // random jitter — see the itrDaisCellsFor/ITR_DAIS_STEP header comment for the full rationale).
  const daisByRoom = new Map();
  (plan.rooms || []).forEach((r) => {
    if (keepSet !== null && !keepSet.has(r.segNum)) return;
    if (r.role === "finale") daisByRoom.set(r.segNum, itrDaisCellsFor(r));
  });

  // KS-3 (docs/KENNEY-SOCKET-WAVE.md): precompute the kit-shell claim sets BEFORE the main per-cell
  // loop below — the loop's own floor.push/wall.push calls skip any cell these two functions have
  // claimed (a kit module renders it instead), mirroring the door aperture's existing skip. Depends on
  // `roomGround` + `daisByRoom` (both just above, for the floor blocks' per-cell "never a VP3-raised or
  // finale-dais cell" exclusion) and `kept` (already built above) — all already exist by this point.
  const kitShellWallData = itrKitShellWallRuns(plan, kept, roomIdx, corridorIdx);
  const kitShellFloorData = itrKitShellFloorBlocks(plan, kept, roomGround, daisByRoom);

  for (let y = 0; y < plan.cellD; y++) {
    for (let x = 0; x < plan.cellW; x++) {
      if (!kept[idx(x, y)]) continue;
      const code = plan.cells[idx(x, y)];
      if (code === SPATIAL_CELL.FLOOR || code === SPATIAL_CELL.DOOR || code === SPATIAL_CELL.WATER) {
        const scale = itrCellScale(x, y, roomIdx, corridorIdx);
        let color = kit.floorColor;
        let sy = ITR_FLOOR_HEIGHT;
        const room = roomIdx.get(x + "," + y);
        const gd = room && roomGround.get(room.segNum);
        if (gd) {
          // per-cell micro-jitter seeded independently of the room's own rng stream (a fresh hash per
          // x,y) so it never perturbs the room-level draws above regardless of loop iteration order.
          const cellSeed = dspHashStr("u3-ground-cell:" + (plan.seed || "") + ":" + x + "," + y);
          const cellRng = dspMulberry32(cellSeed);
          const cellDelta = (cellRng() * 2 - 1) * ITR_FLOOR_TONE_CELL_MAX;
          let factor = 1 + gd.toneDelta + cellDelta;
          const onEdge = x === room.x || x === room.x + room.w - 1 || y === room.y || y === room.y + room.d - 1;
          if (onEdge) factor *= (1 - ITR_PERIMETER_DARKEN);
          color = itrDarkenHex(kit.floorColor, factor);
          const stepDelta = gd.raised.get(x + "," + y);
          if (stepDelta != null) sy = ITR_FLOOR_HEIGHT + stepDelta;
        }
        // STAGE-C C2 STRUCTURAL TERRAIN (docs/STAGE-C.md C2): fold in the logical plan's own
        // per-cell `tiers` buffer (place-spatialize.js's dspParseSideTerrain, stamped from the
        // rolled segment.side prose) — a +1/-1 tier shifts `sy` by one ITR_DAIS_STEP quantum, the
        // SAME step size BW2-5's finale dais already uses per ring (so ROOM_SHELL_TIER_QUANTUM,
        // tuned to that exact step, still resolves this to a clean, DIFFERENT tier bucket than the
        // room's own baseline — theater-room-mesh.js's own header note). Additive over VP3's jitter
        // (replaces it outright for a terrain cell, same "deliberate architecture beats random
        // jitter" precedent BW2-5's dais already set) — and itself gets OVERRIDDEN by the finale-
        // dais block just below when both apply to the same room, so the finale dais path stays
        // completely undisturbed (STAGE-C.md C2 step 2's own instruction).
        const terrainTier = (plan.tiers && typeof plan.tiers[idx(x, y)] === "number") ? plan.tiers[idx(x, y)] : 0;
        if (terrainTier !== 0) sy = ITR_FLOOR_HEIGHT + terrainTier * ITR_DAIS_STEP;
        // BW2-5 item 3: the finale dais OVERRIDES whatever VP3 computed above for its own two tiers
        // (a deliberate platform, not random jitter) — the cell's own code stays plain FLOOR (still
        // routable/walkable, THE FLOOR CONTACT LAW just reads a taller `sy` here, same as it already
        // does for any other floor cell).
        if (room && room.role === "finale") {
          const dais = daisByRoom.get(room.segNum);
          if (dais) {
            const daisKey = x + "," + y;
            if (dais.top.has(daisKey)) sy = ITR_FLOOR_HEIGHT + ITR_DAIS_STEP * 2;
            else if (dais.ring.has(daisKey)) sy = ITR_FLOOR_HEIGHT + ITR_DAIS_STEP;
          }
        }
        // VP4 item 1: the painted-scene value hierarchy (floor darkest) — applied AFTER the ground-
        // design tone/jitter above, never replacing it (a further multiplicative darken, same
        // itrDarkenHex convention that pass already uses).
        const floorSceneDir = sceneDirectionFor(kit.realmId, room && room.role);
        color = itrDarkenHex(color, floorSceneDir.valueScript.floor);
        // KS-3: a cell itrKitShellFloorBlocks already claimed for a 2x2 kit floor tile skips the prism
        // push entirely (the kit mesh renders it instead) — `track` still runs unconditionally so the
        // room's own camera-fit bounds are never narrower just because a cell went kit instead of prism.
        if (!(KIT_SHELL_ENABLED && kitShellFloorData.claimedFloor.has(x + "," + y))) {
          floor.push({ x, z: y, sx: 1, sy, sz: 1, color, scaleDomain: scale });
        }
        track(x, y);
      }
      if (code === SPATIAL_CELL.DOOR) {
        const d = doorIdx.get(x + "," + y);
        const squeeze = !!(d && d.squeeze);
        const baseH = ITR_WALL_HEIGHT_BASE * (d ? (d.heightScale || 1.0) : 1.0);
        const h = baseH * (squeeze ? ITR_SQUEEZE_HEIGHT_FRAC : ITR_DOOR_HEIGHT_FRAC);
        const wFrac = squeeze ? ITR_SQUEEZE_WIDTH_FRAC : 0.8;
        // hoisted (D4d): the wall-thickness reveal block below already derives this as "the wall's
        // own cut thickness at the opening" — the D4d frame block just below needs the SAME number
        // (frame depth rides on top of it) so it's computed ONCE here rather than twice.
        const revealW = (1 - wFrac) / 2;
        // VP4 item 3 (accent discipline): exactly ONE accent thread per room — the first doorframe
        // cell whose neighboring room hasn't been accented yet earns the accentHue tint (<= 0.1
        // strength, a mood wash never a color-replace); every other doorframe/pillar in the room stays
        // the kit's own flat trimColor.
        const doorRoom = itrRoomRoleNear(x, y, plan, roomIdx);
        // hoisted so both the wall-thickness reveal block below AND the STAGE-A A1 darkness-portal
        // block (further below) share the SAME edge-axis detection off doorRoom's own rect — never a
        // second derivation. See the reveal block's own header comment for the "why room rect edge,
        // not a neighbor-WALL scan" rationale.
        const onLeftRight = !!doorRoom && (x === doorRoom.x || x === doorRoom.x + doorRoom.w - 1);
        const onTopBottom = !!doorRoom && (y === doorRoom.y || y === doorRoom.y + doorRoom.d - 1);
        let trimColor = kit.trimColor;
        if (doorRoom && !accentedRooms.has(doorRoom.segNum)) {
          const doorSceneDir = sceneDirectionFor(kit.realmId, doorRoom.role);
          trimColor = itrTintTowardHue(kit.trimColor, doorSceneDir.accentHue, ITR_ACCENT_STRENGTH);
          accentedRooms.add(doorRoom.segNum);
        }

        // D4d — DOORFRAME MASS FIX (replaces the old single wFrac x wFrac SOLID box). widthAxisIsZ
        // picks which cell axis the aperture's own WIDTH spans (jambs offset along it) vs. which axis
        // is the passage/depth direction (the frame's own slim axis). QF-D1 (2026-07-15, see
        // itrDoorWidthAxisIsZ's own header above): derived from the LOCAL WALL RUN (a wall-grid
        // neighbor scan), NOT room-rect edge membership — the old onLeftRight/onTopBottom read is
        // passed through only as that function's documented tiebreak. Shared by the wall-thickness
        // reveal block AND the STAGE-A A1 darkness-portal block below (both further down) — computed
        // ONCE here, never a second derivation, so the frame/reveal/portal geometry always agree on
        // which axis the pierced wall actually runs.
        const widthAxisIsZ = itrDoorWidthAxisIsZ(x, y, plan, onLeftRight, onTopBottom);
        // KS-2: does the admitted kenney-modular-dungeon-kit/gate-door piece fit THIS aperture? See
        // itrKitDoorEligible's own header. When it does (and the flag is on), the kit piece supplies
        // BOTH the static frame AND the dynamic hinge+leaf (theater-boot.js's interiorBuildKitDoorMesh)
        // — the prism jamb/header/arch prisms below are skipped entirely for this cell (never doubled
        // up with the kit mesh), while the wall-thickness reveal + STAGE-A A1 darkness-portal blocks
        // further down are UNCHANGED (they render the surrounding WALL, not the frame, regardless of
        // which frame geometry fills the aperture).
        // Every door cell, kit or prism — the leaf's one axis authority, plus the OUTWARD edge signs
        // (which way "out of the room" points along the passage axis, from the pierced room's own
        // rect). Pure geometry facts; the renderer decides what to DO with them (the door-mount
        // offset is a projection concern — where the wall system it built actually stands).
        let edgeSignX = 0, edgeSignZ = 0;
        if (doorRoom) {
          if (!widthAxisIsZ) edgeSignZ = (y <= doorRoom.y) ? -1 : ((y >= doorRoom.y + doorRoom.d - 1) ? 1 : 0);
          else edgeSignX = (x <= doorRoom.x) ? -1 : ((x >= doorRoom.x + doorRoom.w - 1) ? 1 : 0);
        }
        doorAxes.push({ x, z: y, widthAxisIsZ, edgeSignX, edgeSignZ });
        const kitEligible = !!KIT_DOORS_ENABLED && itrKitDoorEligible(x, y, plan, widthAxisIsZ, squeeze);
        if (kitEligible) {
          kitDoors.push({ x, z: y, widthAxisIsZ, pack: "kenney-modular-dungeon-kit", slug: "gate-door" });
        } else {
          // ─── THE DOOR CONTRACT, kindergarten form (Adam, 2026-07-23, verbatim: "THE DOOR IS JUST
          // AN EXTRUDED RECTANGLE... it's an extruded rectangle that sits in a doorway" · "rectangle
          // hole with rectangle door") ────────────────────────────────────────────────────────────
          // The doorway is a RECTANGLE HOLE cut to the prototype door's own size (0.61 × 1.35 u —
          // a 36"×80" door plus clearance), shaped by three pieces of PLAIN WALL: two full-height
          // side pieces and one band above the opening. The door is the hinged extruded rectangle
          // (theater-boot) filling the hole. Nothing else — jambs/header/arch/reveals are deleted.
          // All three ride the doorframe kind so the mount-offset patch sockets the whole doorway
          // at whichever wall plane the active wall system stands.
          const dwSceneDir = sceneDirectionFor(kit.realmId, doorRoom && doorRoom.role);
          const dwColor = itrDarkenHex(kit.wallColor, dwSceneDir.valueScript.wall);
          const openW = ITR_DOORWAY_OPENING_W * (squeeze ? ITR_SQUEEZE_WIDTH_FRAC : 1);
          const openH = Math.min(ITR_DOORWAY_OPENING_H * (squeeze ? ITR_SQUEEZE_HEIGHT_FRAC : 1), baseH - 0.05);
          const sideW = (1 - openW) / 2;
          const sideOff = openW / 2 + sideW / 2;
          // `squeeze`/`transition` ride every piece — the same per-entry fields the retired frame
          // pushes carried (downstream filters and harnesses key on them; dropping them was a
          // silent data-contract break the dungeon-interior harness caught).
          const dwFlags = { squeeze, transition: !!(d && d.transition) };
          [-1, 1].forEach((sign) => {
            doorframe.push(widthAxisIsZ
              ? Object.assign({ x, z: y, sx: ITR_DOORWAY_DEPTH, sy: baseH, sz: sideW, color: dwColor, oz: sign * sideOff, doorwaySide: true }, dwFlags)
              : Object.assign({ x, z: y, sx: sideW, sy: baseH, sz: ITR_DOORWAY_DEPTH, color: dwColor, ox: sign * sideOff, doorwaySide: true }, dwFlags));
          });
          if (baseH - openH > 0.02) {
            doorframe.push(widthAxisIsZ
              ? Object.assign({ x, z: y, sx: ITR_DOORWAY_DEPTH, sy: baseH - openH, sz: openW, color: dwColor, yBase: openH, lintel: true }, dwFlags)
              : Object.assign({ x, z: y, sx: openW, sy: baseH - openH, sz: ITR_DOORWAY_DEPTH, color: dwColor, yBase: openH, lintel: true }, dwFlags));
          }
        }
        track(x, y);

        // (BW2-5's wall-thickness reveal slabs were deleted by THE DOOR CONTRACT, 2026-07-23 — the
        // doorway is the full-cell hole; the adjacent wall bodies' own faces are its reveal.)

        // STAGE-A A1 (docs/STAGE-A.md, docs/GRAPHICS-NORTH-STAR.md §4.3): DARKNESS PORTAL — a boundary
        // door whose OTHER side (plan.doors' own `betweenSegs`, the corridor-edge room pair U1 already
        // stamped on this exact cell — never an invented adjacency) is NOT in the render keep set gets
        // a shallow recessed dark card standing just past its own frame, filling the spot the neighbor
        // room's shell used to render pre-A1. Gated on ITR_ACTIVE_ROOM_ONLY so the OFF state (the
        // documented reversibility escape hatch) renders every door as a plain open frame, byte-
        // identical to pre-A1 (zero portals emitted). Also gated on keepSet!==null (a focus room was
        // actually requested) — a whole-plan render has no "neighbor" concept to portal away.
        if (ITR_ACTIVE_ROOM_ONLY && keepSet !== null && doorRoom) {
          const neighborSeg = ((d && d.betweenSegs) || []).find((s) => s !== doorRoom.segNum);
          if (neighborSeg == null || !keepSet.has(neighborSeg)) {
            // outward = away from doorRoom's own center, along the passage axis (QF-D1: derived from
            // widthAxisIsZ, the hoisted LOCAL WALL RUN scan, above — never the room-rect edge test) —
            // the direction the corridor throat actually recedes into, not an arbitrary pick.
            let dirX = 0, dirZ = 0;
            if (widthAxisIsZ) dirX = (x === doorRoom.x) ? -1 : 1;
            else dirZ = (y === doorRoom.y) ? -1 : 1;
            // KINDERGARTEN DOORWAY (2026-07-23): the card covers exactly the rectangle OPENING —
            // the only see-through part of the door cell — measured from the cell edge.
            const cardW = ITR_DOORWAY_OPENING_W * (squeeze ? ITR_SQUEEZE_WIDTH_FRAC : 1) + 0.04;
            const cardH = Math.min(ITR_DOORWAY_OPENING_H * (squeeze ? ITR_SQUEEZE_HEIGHT_FRAC : 1), baseH - 0.05) + 0.04;
            const push = 0.5 + ITR_PORTAL_DEPTH / 2 + ITR_PORTAL_GAP;
            portals.push({
              x, z: y,
              ox: dirX * push, oz: dirZ * push,
              sx: dirX !== 0 ? ITR_PORTAL_DEPTH : cardW,
              sy: cardH,
              sz: dirZ !== 0 ? ITR_PORTAL_DEPTH : cardW,
              // the SAME void/backdrop color this realm's fog already reads as (kit.fog.color) — the
              // card reads as "the same darkness beyond the map edge", not a new invented tone.
              color: kit.fog.color,
              roomSegNum: doorRoom.segNum, neighborSegNum: neighborSeg != null ? neighborSeg : null,
            });
          }
        }
      } else if (code === SPATIAL_CELL.WALL) {
        const scale = itrWallScale(x, y, plan, roomIdx, corridorIdx);
        const h = ITR_WALL_HEIGHT_BASE * scale;
        const wallRoom = itrRoomRoleNear(x, y, plan, roomIdx);
        const wallSceneDir = sceneDirectionFor(kit.realmId, wallRoom && wallRoom.role);
        const wallColor = itrDarkenHex(kit.wallColor, wallSceneDir.valueScript.wall);
        // KS-3: a cell itrKitShellWallRuns already claimed for a kit wall module skips the prism push
        // (the kit mesh renders it instead) — `track` still runs unconditionally, same rationale as the
        // floor branch above.
        if (!(KIT_SHELL_ENABLED && kitShellWallData.claimedWall.has(x + "," + y))) {
          wall.push({ x, z: y, sx: 1, sy: h, sz: 1, color: wallColor, scaleDomain: scale });
        }
        track(x, y);
      }
    }
  }

  // BW2-5 THE COLUMN DEMOTION: pre-unit, this block placed FOUR corner pillars unconditionally in
  // every room clearing ITR_PILLAR_MIN_DIM, every seed — a pure geometric derivation with no roll at
  // all, which IS the "why are there so many uniform square columns?" complaint. Now: a seeded roll
  // per room decides whether it earns a column AT ALL (ITR_COLUMN_CHANCE — most eligible rooms earn
  // none), and when one lands it's exactly ONE instance (never a 4-corner colonnade — ROOM-GRAMMAR's
  // later, deliberately-rolled colonnade is a different feature), picked from a VARIED profile set
  // (square/round/tapered/broken). Seeded off (plan.seed, segNum) — the same dspHashStr/dspMulberry32
  // reference PRNG this file uses everywhere else (DETERMINISM LAW).
  (plan.rooms || []).forEach((r) => {
    if (keepSet !== null && !keepSet.has(r.segNum)) return;
    if (r.w < ITR_PILLAR_MIN_DIM || r.d < ITR_PILLAR_MIN_DIM) return;
    const seed = dspHashStr("u3-column:" + (plan.seed || "") + ":" + r.segNum + ":" + r.x + "," + r.y);
    const rng = dspMulberry32(seed);
    if (rng() >= ITR_COLUMN_CHANCE) return; // the common case: no column at all
    const h = ITR_WALL_HEIGHT_BASE * (r.scaleDomain || 1.0);
    const corners = [
      { x: r.x + 1, y: r.y + 1 }, { x: r.x + r.w - 2, y: r.y + 1 },
      { x: r.x + 1, y: r.y + r.d - 2 }, { x: r.x + r.w - 2, y: r.y + r.d - 2 },
    ].filter((c) => c.x >= 0 && c.y >= 0 && c.x < plan.cellW && c.y < plan.cellD
      && kept[idx(c.x, c.y)] && plan.cells[idx(c.x, c.y)] === SPATIAL_CELL.FLOOR); // never plant on a wall/door/void cell
    if (!corners.length) return;
    const corner = corners[Math.floor(rng() * corners.length) % corners.length];
    const profile = ITR_COLUMN_PROFILES[Math.floor(rng() * ITR_COLUMN_PROFILES.length) % ITR_COLUMN_PROFILES.length];
    let sx = 0.5, sz = 0.5, sy = h;
    if (profile === "round") { sx = 0.45; sz = 0.45; }
    else if (profile === "tapered") { sx = 0.38; sz = 0.38; }
    else if (profile === "broken") { sy = h * (0.4 + rng() * 0.3); }
    pillar.push({ x: corner.x, z: corner.y, sx, sy, sz, color: kit.trimColor, scaleDomain: r.scaleDomain || 1.0, profile });
    track(corner.x, corner.y);
    if (profile === "tapered") {
      // a second, narrower CAP prism stacked on top (via yBase) — the "corbelling in" read a single
      // box alone can't give; still ONE column (one assembly), per the spec's own <=1/room cap.
      pillar.push({ x: corner.x, z: corner.y, sx: 0.55, sy: h * 0.08, sz: 0.55, color: kit.trimColor,
        scaleDomain: r.scaleDomain || 1.0, profile: "tapered-cap", yBase: sy });
    }
  });

  // DUNGEON-GRAPH.md U3 iteration-2, ruling 2: one light list per KEPT room, folded into a single flat
  // array (theater-boot.js's interiorBuildLights consumes the whole board's lights at once — the room
  // grouping is preserved per-entry via roomSegNum, not via nested structure, matching the flat
  // instances.{floor,wall,...} convention this function already keeps).
  const lights = [];
  (plan.rooms || []).forEach((r) => {
    if (keepSet !== null && !keepSet.has(r.segNum)) return;
    itrRoomLights(r, plan, kit, dressingByRoom).forEach((l) => lights.push(l));
  });

  const roomCount = keepSet === null ? plan.rooms.length : keepSet.size;
  if (!Number.isFinite(minX)) { minX = 0; maxX = 0; minZ = 0; maxZ = 0; } // degenerate empty-keep guard
  const skirt = itrBuildSkirtRing({ minX: minX, maxX: maxX, minZ: minZ, maxZ: maxZ }, kit);

  // BW2-4 item 2: THE RIM VIGNETTE — graded darken toward the void edge, applied as a deterministic
  // post-pass over the already-built floor/wall/pillar/skirt colors now that bounds are final. Floors
  // already carry VP3's own 8% per-room perimeter darken + this unit's valueScript.floor; the vignette
  // rides ON TOP (a further multiplicative darken, same itrDarkenHex convention every color pass here
  // uses). Doorframes are deliberately excluded (see itrRimFactor's header — the accent-discipline gate).
  const rimBounds = { minX: minX, maxX: maxX, minZ: minZ, maxZ: maxZ };
  floor.forEach((f) => { f.color = itrDarkenHex(f.color, itrRimFactor(f.x, f.z, rimBounds)); });
  wall.forEach((w) => { w.color = itrDarkenHex(w.color, itrRimFactor(w.x, w.z, rimBounds)); });
  pillar.forEach((p) => { p.color = itrDarkenHex(p.color, ITR_PILLAR_VALUE * itrRimFactor(p.x, p.z, rimBounds)); });
  skirt.forEach((s) => { s.color = itrDarkenHex(s.color, itrRimFactor(s.x, s.z, rimBounds)); });

  // VP3 GROUND DESIGN item 3: ground-cover patches, a sibling of `instances` (like `skirt` above) —
  // FLOOR ONLY (roomGround's coverCells are drawn exclusively from that room's own FLOOR-code cells,
  // never wall/door/corridor), flat ON the floor at y=-0.5+ITR_COVER_Y_OFFSET (the renderer's "every
  // column base sits on y=-0.5" convention, theater-boot.js's interiorBuildInstancedMesh header note).
  const cover = [];
  for (const [segNum, gd] of roomGround) {
    gd.coverCells.forEach((c) => {
      const seed = dspHashStr("u3-cover:" + (plan.seed || "") + ":" + segNum + ":" + c.x + "," + c.y);
      const rng = dspMulberry32(seed);
      const card = itrCoverCardFor(kit.realmId, rng);
      cover.push({
        x: c.x, z: c.y, y: -0.5 + ITR_COVER_Y_OFFSET,
        sx: ITR_COVER_FOOTPRINT, sy: 0.02, sz: ITR_COVER_FOOTPRINT,
        color: card.color, slug: card.slug, proc: !!card.proc, roomSegNum: segNum,
      });
    });
  }

  // BW2-5 THE COLUMN DEMOTION / FURNITURE CHANNEL: the dressPlan `blocker` tag maps to a furniture-
  // class volume — a sibling of `instances`/`skirt`/`cover` (never a 5th instance kind, same
  // convention those already establish), built by scanning plan.dressing (already indexed above for
  // lights) for primary==="blocker" entries. The dressing ROLL still owns which NOUN/slug appears
  // (nouns law unchanged); this is a separate, purely render-layer pick of the furniture SILHOUETTE
  // that noun renders as (itrFurnitureKindFor).
  const furniture = [];
  // BW2-5 ADDENDUM (THE PROP PERSPECTIVE LAW): wall-hang entries mount as real extrusion prisms
  // (theater-boot.js's buildExtrusionProp), not flat camera-facing cards — same sibling-array
  // convention as `furniture` above, built off the SAME plan.dressing scan.
  const wallProps = [];
  if (Array.isArray(plan.dressing)) {
    plan.dressing.forEach((d) => {
      if (!d) return;
      const room = roomIdx.get(d.x + "," + d.y);
      if (keepSet !== null && room && !keepSet.has(room.segNum)) return;
      if (d.primary === "blocker") {
        const kind = itrFurnitureKindFor((plan.seed || "") + ":" + d.roomSegNum + ":" + d.x + "," + d.y + ":" + d.slug);
        furniture.push({ x: d.x, y: d.y, kind, realmId: kit.realmId, slug: d.slug, roomSegNum: d.roomSegNum,
          renderStrategy: d.renderStrategy || "full-3d-prop" });
      } else if (d.primary === "wall-hang") {
        const info = extrusionPropFor(d);
        wallProps.push({
          x: d.x, y: d.y, roomSegNum: d.roomSegNum, slug: d.slug, cardKind: d.cardKind,
          renderStrategy: d.renderStrategy || "extruded-card",
          archetype: info.archetype, depth: info.depth, wallSide: itrWallSideAt(d.x, d.y, plan),
          paintingOf: d.paintingOf || null,
        });
      }
    });
  }

  // BW2-5 item 3: the finale dais's own canonical anchor cell, exposed per finale room so a combat/
  // world-layer caller CAN prefer it for the boss standee's own cell (this render-data layer only
  // MOUNTS wherever a caller's data.pieces[].cellX/cellY says — it doesn't decide combat placement
  // itself; this is the mechanism that lets a future/optional caller ask "where's the dais top").
  const daisTop = [];
  (plan.rooms || []).forEach((r) => {
    if (keepSet !== null && !keepSet.has(r.segNum)) return;
    if (r.role !== "finale") return;
    const anchor = itrDaisAnchor(r);
    daisTop.push({ roomSegNum: r.segNum, x: anchor.x, y: anchor.y });
  });

  return {
    kind: "interior3d",
    env: env,
    realmId: kit.realmId,
    cellSize: 1,               // GRID LAW: 1 SpatialPlan cell = 5 ft = 1 world unit
    wallHeightBase: ITR_WALL_HEIGHT_BASE,
    fog: kit.fog,
    // GR1 (docs/GRAPHICS-ENGINE.md §E): floor/wall/trim each carry their own REALM_MATERIALS material+
    // grain alongside the flat color (theater-boot.js's floorTex/wallTex path bakes the material into a
    // real CanvasTexture; trim stays flat-colored today — see REALM_MATERIALS' own header note).
    tileKit: { floorColor: kit.floorColor, wallColor: kit.wallColor, trimColor: kit.trimColor,
      floorMaterial: realmMaterialFor(kit.realmId, "floor").material,
      wallMaterial: realmMaterialFor(kit.realmId, "wall").material,
      trimMaterial: realmMaterialFor(kit.realmId, "trim").material,
      floorGrain: realmMaterialFor(kit.realmId, "floor").grainIntensity,
      wallGrain: realmMaterialFor(kit.realmId, "wall").grainIntensity,
      trimGrain: realmMaterialFor(kit.realmId, "trim").grainIntensity,
      // GR3 (docs/GRAPHICS-ENGINE.md §E-adjacent, build unit GR3 LIGHT RIG LAW): the per-realm grade —
      // theater-boot.js's setInteriorBoard reads these three off tileKit directly (never re-resolves
      // the kit itself) to feed gradeColorLocal (the void/fog backdrop) and the fog-density default,
      // same "kit carries the final numbers, GL layer just applies them" split floorGrain/wallGrain
      // already keep.
      gradeTint: (kit.grade && kit.grade.tint) || null,
      gradeStrength: (kit.grade && kit.grade.strength) || 0,
      fogWhisper: (kit.grade && kit.grade.fogWhisper) || 0,
      // BW2-3 MATERIAL TEXEL (GENERATED-FIRST): the folded PACKET-02 texture-file pointers + fold-gate
      // wrap verdicts, null on a non-flagship realm (theater-boot's floorTex/wallTex path then paints
      // procedural). floorMaterial/wallMaterial above stay the PROCEDURAL FALLBACK the seam degrades to.
      floorTextureFile: floorTexVar ? floorTexVar.file : null, floorTextureWrap: floorTexVar ? floorTexVar.wrap : null,
      wallTextureFile: wallTexVar ? wallTexVar.file : null, wallTextureWrap: wallTexVar ? wallTexVar.wrap : null,
      trimTextureFile: trimTexVar ? trimTexVar.file : null, trimTextureWrap: trimTexVar ? trimTexVar.wrap : null },
    instances: { floor: floor, wall: wall, doorframe: doorframe, pillar: pillar },
    // KS-2 (docs/KENNEY-SOCKET-WAVE.md): one entry per KIT_DOORS_ENABLED-eligible door cell — a
    // sibling of `instances` (same "not a 5th instance kind" convention skirt/cover/furniture below
    // establish; the prism `instances.doorframe` list above already omits these cells' jamb/header/arch
    // entries entirely, never doubled up). theater-boot.js's interiorBuildInteractables reads this
    // (keyed "x,y") to decide, PER interactable door entry, whether to mount the kit gate-door
    // assembly or fall back to the prism hinge+leaf — pure placement data (position/rotation axis),
    // no THREE, no state; the state->pose mapping stays entirely theater-boot.js's job (D0's own split).
    kitDoors: kitDoors,
    doorAxes: doorAxes,
    // KS-3 (docs/KENNEY-SOCKET-WAVE.md): siblings of `instances`/`kitDoors` above — one entry per
    // kit-tiled wall module / floor block (pure placement data, no THREE; theater-boot.js's GL layer
    // owns the actual donor-piece mount). `instances.wall`/`instances.floor` above already omit every
    // cell these two arrays claim (itrKitShellWallRuns/itrKitShellFloorBlocks, see their own headers),
    // so a cell is NEVER double-rendered kit+prism. Empty arrays whenever KIT_SHELL_ENABLED is off —
    // "the flag is the retreat" (byte-identical prism output).
    kitShellWalls: kitShellWallData.wallRuns,
    kitShellFloors: kitShellFloorData.floorBlocks,
    // GR4 (docs/GRAPHICS-ENGINE.md build unit GR4 STAGE LAW): the edge skirt, computed off the SAME
    // bounds this function already tracked above (no second bounds derivation) — a sibling of
    // `instances`, not a 5th member of it (see this function's own doc comment on why check 2's "4
    // known instance kinds" data-shape claim is untouched by this addition).
    skirt: skirt,
    // VP3 GROUND DESIGN item 3: ground-cover decal cards — a sibling of `instances`/`skirt` above,
    // never a 5th instance kind (same "not counted toward the 4 known kinds" note skirt's own comment
    // makes) since the GL layer hasn't grown a cover render pass yet (VP2/VP6 will feed real art
    // through itrCoverCardFor's seam; this wave only proves the DATA channel + the procedural fallback).
    cover: cover,
    // BW2-5: furniture-class blocker volumes + wall-hang extrusion props — siblings of `instances`
    // (never counted toward the "4 known instance kinds" check, same convention skirt/cover establish).
    furniture: furniture,
    wallProps: wallProps,
    // STAGE-A A1 — DARKNESS PORTAL cards: a sibling of `instances` (same "not a 5th instance kind"
    // convention skirt/cover/furniture/wallProps already establish above). Empty unless
    // ITR_ACTIVE_ROOM_ONLY is on AND a focus room was requested (see this function's own doc comment).
    portals: portals,
    // Walk-card projection is already player-safe at this boundary. Carry its source references and
    // density signal for ShotPlan/debugging; concealed payloads never reach this board.
    projection: opts.projection || null,
    activeRoomId: opts.focusSegNum != null ? opts.focusSegNum : null,
    // STAGE-C3b (docs/STAGE-C.md C3b addendum, circle/ellipse render refinement): the active room's
    // own `shape` tag (STAGE-C C3's shapeForArchetype enum — 'rect'|'circle'|'octagon'|'ellipse'|'L'|
    // 'T'|'cross'|'cave'), or null when no focus room / a pre-C3 plan carries no `.shape`. Sibling of
    // `focusRect` immediately below (same `plan.rooms.find` lookup, just reading a different field) —
    // theater-boot.js's room-shell compile step reads this to gate the RENDER-ONLY radial smoothing
    // pass (theater-room-mesh.js's compileRoomShellData `opts.smoothShape`) onto circle/ellipse rooms
    // only. Purely additive: never changes `plan.cells`/`rooms[].cells` (the LOGICAL grid combat/
    // placement/pathing read) — see STAGE-C.md's own C3b note on why this stays render-side.
    activeRoomShape: (function(){
      if (opts.focusSegNum == null) return null;
      const fr = (plan.rooms || []).find(function(r){ return r.segNum === opts.focusSegNum; });
      return (fr && fr.shape) || null;
    })(),
    daisTop: daisTop,
    lights: lights,
    bounds: { minX: minX, maxX: maxX, minZ: minZ, maxZ: maxZ },
    // camera-framing hint: when a focus room was requested, carry its rect (raw plan cell space —
    // the same space every instance above uses) so setInteriorBoard can CENTER + FIT the camera on
    // the room itself instead of the whole kept-neighborhood footprint (study card v3: "camera
    // pulled into the room").
    focusRect: (function(){
      if (opts.focusSegNum == null) return null;
      const fr = (plan.rooms || []).find(function(r){ return r.segNum === opts.focusSegNum; });
      return fr ? { minX: fr.x, maxX: fr.x + fr.w - 1, minZ: fr.y, maxZ: fr.y + fr.d - 1 } : null;
    })(),
    meta: { roomCount: roomCount, floorCount: floor.length, wallCount: wall.length,
      doorCount: doorframe.length, pillarCount: pillar.length, lightCount: lights.length,
      skirtCount: skirt.length, coverCount: cover.length, furnitureCount: furniture.length,
      wallPropsCount: wallProps.length, portalCount: portals.length,
      // KS-2: doorCount above is the PRISM doorframe instance count (jamb/header/arch prisms) — it
      // legitimately shrinks whenever a door cell resolves to the kit path instead (those cells push
      // zero prism entries). kitDoorCount makes the swap visible rather than silently changing
      // doorCount's own meaning underfoot.
      kitDoorCount: kitDoors.length,
      // KS-3: wallCount/floorCount above are the PRISM instance counts — they legitimately shrink
      // whenever a run/block resolves to the kit path (same "make the swap visible" rationale as
      // kitDoorCount just above, applied to walls/floors).
      kitShellWallCount: kitShellWallData.wallRuns.length,
      kitShellFloorCount: kitShellFloorData.floorBlocks.length }
  };
}

// ─── ES-module bridge (see header note) — theater-boot.js reads these off `window.` ─────────────────
window.INTERIOR_TILE_KITS = INTERIOR_TILE_KITS;
window.interiorBuildBoard = interiorBuildBoard;
window.interiorTileKitFor = interiorTileKitFor;
window.REALM_MATERIALS = REALM_MATERIALS;
window.realmMaterialFor = realmMaterialFor;
// BW2-3 MATERIAL TEXEL: the folded-texture registry + variant roll (theater-boot reads the picked
// file/wrap off tileKit; a verify harness reaches the roll itself through these).
window.REALM_TEXTURES = REALM_TEXTURES;
window.interiorTextureVariantFor = interiorTextureVariantFor;
window.SCENE_DIRECTION = SCENE_DIRECTION;
window.sceneDirectionFor = sceneDirectionFor;
// BW2-5: the shared prism builders (ROOM-GRAMMAR.md §4 names furnitureFor as its own dependency) +
// the column-rarity/dais-anchor helpers a verify harness or a future consuming system may need.
window.furnitureFor = furnitureFor;
window.textureFaceFor = textureFaceFor;
window.extrusionPropFor = extrusionPropFor;
window.itrFurnitureKindFor = itrFurnitureKindFor;
window.itrWallSideAt = itrWallSideAt;
window.itrDaisAnchor = itrDaisAnchor;
window.itrDaisCellsFor = itrDaisCellsFor;
