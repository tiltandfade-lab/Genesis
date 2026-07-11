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

function itrDoorIndex(plan) {
  const byCell = new Map();
  (plan.doors || []).forEach((d) => { byCell.set(d.x + "," + d.y, d); });
  return byCell;
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
const ITR_LIGHT_HEIGHT = { lamp: 1.8, torch: 1.4 };
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
// per-room deterministic light list — `plan.seed` (U1's own stored seed, always present) folded into
// the per-room hash so two rooms with identical rects in DIFFERENT plans never pick the same pattern,
// while the SAME plan replayed twice (the determinism acceptance every U1-U4 harness checks) always
// yields byte-identical lights.
function itrRoomLights(room, plan, kit) {
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
  return shuffled.slice(0, n).map((c) => ({
    x: c.x, z: c.y, y: height,
    color: kit.lightColor || "#ff9a44",
    intensity: kit.lightIntensity || 1.2,
    kind, roomSegNum: room.segNum
  }));
}

const ITR_WALL_HEIGHT_BASE = 2.4;   // world units — taller than GLB_TARGET_HEIGHT (1.5, a human figure)
const ITR_FLOOR_HEIGHT = 0.2;
const ITR_DOOR_HEIGHT_FRAC = 0.85;  // a normal doorframe reads slightly lower than the full wall
const ITR_SQUEEZE_HEIGHT_FRAC = 0.5;
const ITR_SQUEEZE_WIDTH_FRAC = 0.6;
const ITR_PILLAR_MIN_DIM = 6;       // room must be >= this many cells per axis to earn corner pillars

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

/** interiorBuildBoard(plan, opts) → InteriorBoard:
 * { kind:"interior3d", env, realmId, cellSize:1, wallHeightBase, fog:{color},
 *   tileKit:{floorColor,wallColor,trimColor,
 *     floorMaterial,wallMaterial,trimMaterial,floorGrain,wallGrain,trimGrain,
 *     gradeTint,gradeStrength,fogWhisper},
 *   instances:{ floor:[{x,z,sx,sy,sz,color}], wall:[...], doorframe:[{...,squeeze}], pillar:[...] },
 *   skirt:[{x,z,sx,sy,sz,color}] (GR4 — the diorama edge band, a sibling of `instances`, never counted
 *     toward the "4 known instance kinds" data-shape check: it's a separate render channel),
 *   bounds:{minX,maxX,minZ,maxZ}, meta:{roomCount,floorCount,wallCount,doorCount,pillarCount,skirtCount} }
 * `plan` is a U1 spatializePlan() output, ideally U2-extended (semanticizePlan) for room.scaleDomain/
 * door.transition/door.squeeze — a bare U1 plan degrades cleanly (every room defaults scaleDomain 1.0,
 * every door renders as a normal non-squeeze frame), never throws.
 * `opts`: { realmId, env, focusSegNum, radius=1 } — focusSegNum+radius trims to "current room +
 * immediate surroundings" (DUNGEON-GRAPH.md U3 item 2); omit focusSegNum to render the WHOLE plan
 * (the 80-room draw-call-budget check, and the study card's single-room scenes).
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
  const keepSet = itrFocusRoomSet(plan, opts.focusSegNum, radius);
  const kept = itrBuildKeepGrid(plan, keepSet, roomIdx, corridorIdx);

  const idx = (x, y) => y * plan.cellW + x;
  const floor = [], wall = [], doorframe = [], pillar = [];
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  const track = (x, z) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); };

  for (let y = 0; y < plan.cellD; y++) {
    for (let x = 0; x < plan.cellW; x++) {
      if (!kept[idx(x, y)]) continue;
      const code = plan.cells[idx(x, y)];
      if (code === SPATIAL_CELL.FLOOR || code === SPATIAL_CELL.DOOR || code === SPATIAL_CELL.WATER) {
        const scale = itrCellScale(x, y, roomIdx, corridorIdx);
        floor.push({ x, z: y, sx: 1, sy: ITR_FLOOR_HEIGHT, sz: 1, color: kit.floorColor, scaleDomain: scale });
        track(x, y);
      }
      if (code === SPATIAL_CELL.DOOR) {
        const d = doorIdx.get(x + "," + y);
        const squeeze = !!(d && d.squeeze);
        const baseH = ITR_WALL_HEIGHT_BASE * (d ? (d.heightScale || 1.0) : 1.0);
        const h = baseH * (squeeze ? ITR_SQUEEZE_HEIGHT_FRAC : ITR_DOOR_HEIGHT_FRAC);
        const wFrac = squeeze ? ITR_SQUEEZE_WIDTH_FRAC : 0.8;
        doorframe.push({ x, z: y, sx: wFrac, sy: h, sz: wFrac, color: kit.trimColor, squeeze, transition: !!(d && d.transition) });
        track(x, y);
      } else if (code === SPATIAL_CELL.WALL) {
        const scale = itrWallScale(x, y, plan, roomIdx, corridorIdx);
        const h = ITR_WALL_HEIGHT_BASE * scale;
        wall.push({ x, z: y, sx: 1, sy: h, sz: 1, color: kit.wallColor, scaleDomain: scale });
        track(x, y);
      }
    }
  }

  // pillars: deterministic corner placement for any KEPT room whose both dims clear ITR_PILLAR_MIN_DIM
  // — a pure geometric derivation off room rect + scaleDomain, no RNG, no dressing-table roll (that's
  // a future unit's job; U3's own job is volumetric geometry, not prop variety).
  (plan.rooms || []).forEach((r) => {
    if (keepSet !== null && !keepSet.has(r.segNum)) return;
    if (r.w < ITR_PILLAR_MIN_DIM || r.d < ITR_PILLAR_MIN_DIM) return;
    const h = ITR_WALL_HEIGHT_BASE * (r.scaleDomain || 1.0);
    const corners = [
      { x: r.x + 1, y: r.y + 1 }, { x: r.x + r.w - 2, y: r.y + 1 },
      { x: r.x + 1, y: r.y + r.d - 2 }, { x: r.x + r.w - 2, y: r.y + r.d - 2 },
    ];
    corners.forEach((c) => {
      if (c.x < 0 || c.y < 0 || c.x >= plan.cellW || c.y >= plan.cellD) return;
      if (!kept[idx(c.x, c.y)]) return;
      if (plan.cells[idx(c.x, c.y)] !== SPATIAL_CELL.FLOOR) return; // never plant a pillar on a wall/door/void cell
      pillar.push({ x: c.x, z: c.y, sx: 0.5, sy: h, sz: 0.5, color: kit.trimColor, scaleDomain: r.scaleDomain || 1.0 });
      track(c.x, c.y);
    });
  });

  // DUNGEON-GRAPH.md U3 iteration-2, ruling 2: one light list per KEPT room, folded into a single flat
  // array (theater-boot.js's interiorBuildLights consumes the whole board's lights at once — the room
  // grouping is preserved per-entry via roomSegNum, not via nested structure, matching the flat
  // instances.{floor,wall,...} convention this function already keeps).
  const lights = [];
  (plan.rooms || []).forEach((r) => {
    if (keepSet !== null && !keepSet.has(r.segNum)) return;
    itrRoomLights(r, plan, kit).forEach((l) => lights.push(l));
  });

  const roomCount = keepSet === null ? plan.rooms.length : keepSet.size;
  if (!Number.isFinite(minX)) { minX = 0; maxX = 0; minZ = 0; maxZ = 0; } // degenerate empty-keep guard
  const skirt = itrBuildSkirtRing({ minX: minX, maxX: maxX, minZ: minZ, maxZ: maxZ }, kit);

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
      fogWhisper: (kit.grade && kit.grade.fogWhisper) || 0 },
    instances: { floor: floor, wall: wall, doorframe: doorframe, pillar: pillar },
    // GR4 (docs/GRAPHICS-ENGINE.md build unit GR4 STAGE LAW): the edge skirt, computed off the SAME
    // bounds this function already tracked above (no second bounds derivation) — a sibling of
    // `instances`, not a 5th member of it (see this function's own doc comment on why check 2's "4
    // known instance kinds" data-shape claim is untouched by this addition).
    skirt: skirt,
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
      skirtCount: skirt.length }
  };
}

// ─── ES-module bridge (see header note) — theater-boot.js reads these off `window.` ─────────────────
window.INTERIOR_TILE_KITS = INTERIOR_TILE_KITS;
window.interiorBuildBoard = interiorBuildBoard;
window.interiorTileKitFor = interiorTileKitFor;
window.REALM_MATERIALS = REALM_MATERIALS;
window.realmMaterialFor = realmMaterialFor;
