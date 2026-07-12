/* GENESIS MODULE — src/engine/place-dressing.js — GRAPHICS-ENGINE.md Part II §D DRESSING SYSTEM,
   build unit GR2 (docs/GRAPHICS-ENGINE.md "Build units — GR2 — props+foliage cards"). Classic
   <script> (shared global scope) — pure engine-layer DATA code, no THREE/canvas/DOM, mirroring
   src/ui/theater-interior.js's own "data in this file, GL in theater-boot.js" split (this file IS
   the data half; src/ui/theater-boot.js's setInteriorBoard mounts a `dressingGroup` off its output
   — see that file's own header comment for the render half).

   dressPlan(plan, opts) → plan.dressing = [{slug, x, y, primary, cardKind, renderStrategy, roomSegNum, lightAffine}]:
   a seeded per-room prop/foliage placement pass over a spatializePlan()/semanticizePlan() output,
   per the spec's own rules —
     - density by room.role (Wildermyth density rule: entrance sparse, pocket dense, finale staged,
       1-3 FOCAL pieces per room max, filler beyond that — DRESSING_DENSITY_BY_ROLE below);
     - cards land on FLOOR cells only (never DOOR/WALL cells — those codes are never in a room's own
       floor-cell list to begin with) and never inside the room's own combat-space CENTER 2x2 (dpCenter2x2);
     - BLOCKER cards land within 1 cell of a WALL cell (dpAdjacentToWall), BIASED away from the
       room's own canonical camera-side band (BEAUTY-WAVE-2.md BW2-1b item 2, dpIsCameraSideOfRoom)
       — never a hard exclusion (a slender room with no far-side wall-adjacent cell free still gets
       its blocker), just a preferred ordering so a blocker card rarely seeds itself between the
       default view and the room's own combat space;
     - WALL-HANG cards land adjacent to a wall cell too (the "hang ON the wall" reading);
     - LIGHT-primary cards co-locate with the room's own light seeds — this file independently
       reimplements theater-interior.js's itrRoomLightCandidates/itrRoomLightCount/light-seed formula
       (same "u3-light:"+plan.seed+":"+segNum+":"+x","+y hash, same perimeter-ring candidate list,
       same seeded Fisher-Yates) rather than calling into it: ENGINE PURITY LAW (CLAUDE.md/this repo's
       standing discipline) means src/engine/* never reaches into a src/ui/* render module, even a
       DOM-free one — two independent implementations of the SAME deterministic formula over the SAME
       inputs necessarily agree, byte-for-byte, without an import;
     - SEAM-SOFTENING (BW3-5, docs/BEAUTY-WAVE-3.md, "why the wolf room's foliage almost belongs"): a
       small filler sub-pass, seeded ALONG the wall-base line (RHYTHM-sampled at intervals — dpWallBaseCells/
       dpAdjacentToDoor/dpAdjacentCellsWithin1/dpRoomColumnCell below), at column feet (dpRoomColumnCell
       independently mirrors theater-interior.js's own u3-column pillar formula, same ENGINE PURITY LAW
       discipline as the light-seed co-location above) and furniture feet (adjacent to this room's own
       blocker/setPiece pieces), and in doorway-adjacent corners — texture for architecture SEAMS, not
       more floor clutter, bounded by its own DRESSING_DENSITY_BY_ROLE `seam` budget and marked
       `seam:true, seamKind` on the emitted entry.

   REALM_DRESSING is GENERATED (BEAUTY-WAVE.md §VP2, 2026-07-10 — build/gen-realm-dressing.py
   --emit, between the GENERATED:REALM_DRESSING:BEGIN/END markers below; never hand-edit that
   block, edit the dressing-gen manifests or the script and regenerate). It folds every flora+
   clutter cell from the dev/model-qa/dressing-gen/manifests/<realm>-{flora-dg-01,clutter-dg-02}
   .json manifests for chrome/gloom/fantasy (the only realms with an INTERIOR_TILE_KITS entry —
   a realm with no interior kit has no interior dressing pass) into the full roster (36 entries
   each, up from the original ~6-entry hand-authored stub). objects-dg-03 is deliberately
   excluded (its cells are stateful interactables — door/chest/lever/trap/portal/shrine/campfire/
   container archetype+state pairs, no `size` field — dressPlan has no state-selection channel for
   them yet; see gen-realm-dressing.py's own docstring). assets/dressing/<slug>.png for every
   slug below is ART-READY on disk (build/slice-dressing-arrivals.py; dev/verify-dungeon-
   dressing.mjs check 5 is the art-readiness join proof — every registry slug must resolve to a
   real manifest cell).

   DETERMINISM LAW (GRAPHICS-ENGINE.md law 7): dressPlan is a pure function of (plan, opts) — no
   Math.random/Date.now. All rolls seed off opts.walkId (falling back to plan.seed when walkId is
   omitted) folded with the room's own segNum/rect, using the SAME dspHashStr/dspMulberry32 reference
   PRNG src/engine/place-spatialize.js already establishes (loaded before this file — see manifest.json
   loadOrder / genesis.html script order: place-spatialize.js -> place-semantics.js -> place-dressing.js
   -> theater-interior.js, "data layer before the GL layer"). */

// ─── REALM_DRESSING — GENERATED full card registry (build/gen-realm-dressing.py --emit), 36
// entries per supported interior realm kit (chrome/gloom/fantasy — the same 3 INTERIOR_TILE_KITS
// theater-interior.js ships; a realm with no interior kit has no interior dressing pass either,
// same "no kit -> default kit" degrade theater-interior.js already establishes via
// DRESSING_DEFAULT_REALM below) ───────────────────────────────────────────────────────────────
// Every entry: { slug (real dressing-gen manifest slug), primary (the manifest's own tags.primary —
// focal|floor|wall-hang|blocker|setPiece), size (small|medium|large — the manifest's own `size`
// field, GR2's render half maps this to 0.6/1.0/1.6 world-unit card height), lightAffine (this
// unit's OWN classification, not a manifest tag — the corpus carries no "light" primary tag yet;
// these are the entries whose label reads as a light fixture — lanternhook/lightpod/lanternrust —
// picked to co-locate with the room's real PointLight seeds). }
// GENERATED:REALM_DRESSING:BEGIN — python3 build/gen-realm-dressing.py --emit
const REALM_DRESSING = Object.freeze({
  chrome: Object.freeze([
    Object.freeze({ slug: "chrome-flora-cableplanter", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-flora-neonbonsai", primary: "focal", size: "small", renderStrategy: "billboard", lightAffine: true }),
    Object.freeze({ slug: "chrome-flora-hologram-fern", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "chrome-flora-antennagrass", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-flora-solarvine", primary: "wall-hang", size: "medium", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "chrome-flora-datamoss", primary: "wall-hang", size: "small", renderStrategy: "extruded-card", lightAffine: true }),
    Object.freeze({ slug: "chrome-flora-scraptree", primary: "setPiece", size: "large", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-flora-neonlily", primary: "focal", size: "small", renderStrategy: "billboard", lightAffine: true }),
    Object.freeze({ slug: "chrome-flora-wireweed", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-flora-lightpod", primary: "focal", size: "medium", renderStrategy: "billboard", lightAffine: true }),
    Object.freeze({ slug: "chrome-flora-fiberreed", primary: "blocker", size: "medium", renderStrategy: "full-3d-prop" }),
    Object.freeze({ slug: "chrome-flora-circuitmoss", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-flora-vendingivy", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "chrome-flora-hazardfern", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-flora-drone-hive", primary: "focal", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-flora-billboardvine", primary: "setPiece", size: "large", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-flora-steamvent-moss", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-flora-glasscoral", primary: "focal", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-flora-cableplanter-alt", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-flora-neonbonsai-alt", primary: "focal", size: "small", renderStrategy: "billboard", lightAffine: true }),
    Object.freeze({ slug: "chrome-clutter-brokenscreen", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "chrome-clutter-cablesnarl", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-clutter-drone-husk", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-clutter-neonshard", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-clutter-vendingwreck", primary: "setPiece", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-clutter-circuitscrap", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-clutter-antennastack", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "chrome-clutter-batterypack", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-clutter-signfragment", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-clutter-cctv-eye", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "chrome-clutter-coolantstain", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-clutter-crateseal", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-clutter-turnstile", primary: "blocker", size: "medium", renderStrategy: "full-3d-prop" }),
    Object.freeze({ slug: "chrome-clutter-keyboardpile", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "chrome-clutter-brokenscreen-alt", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "chrome-clutter-cablesnarl-alt", primary: "floor", size: "medium", renderStrategy: "billboard" }),
  ]),
  gloom: Object.freeze([
    Object.freeze({ slug: "gloom-flora-deadhedge", primary: "blocker", size: "medium", renderStrategy: "full-3d-prop" }),
    Object.freeze({ slug: "gloom-flora-cattails", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-flora-wiltrose", primary: "focal", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-flora-mournvine", primary: "wall-hang", size: "medium", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "gloom-flora-bonelichen", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "gloom-flora-driedwreath", primary: "focal", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-flora-witheredwillow", primary: "setPiece", size: "large", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-flora-graveturf", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-flora-mossgrave", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-flora-thornbriar", primary: "blocker", size: "medium", renderStrategy: "full-3d-prop" }),
    Object.freeze({ slug: "gloom-flora-driedivy", primary: "wall-hang", size: "medium", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "gloom-flora-nightshade", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-flora-rootcrack", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-flora-witherstalk", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-flora-mournbell", primary: "focal", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-flora-fungalcrust", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "gloom-flora-deadorchard", primary: "setPiece", size: "large", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-flora-mourningfern", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-flora-deadhedge-alt", primary: "blocker", size: "medium", renderStrategy: "full-3d-prop" }),
    Object.freeze({ slug: "gloom-flora-cattails-alt", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-clutter-brokentombstone", primary: "setPiece", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-clutter-funeralbell", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-clutter-bonepile", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-clutter-coffinlid", primary: "wall-hang", size: "medium", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "gloom-clutter-mourningveil", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "gloom-clutter-candlewax-pool", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-clutter-shovelstuck", primary: "focal", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-clutter-urnshard", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-clutter-ironfence-gap", primary: "blocker", size: "medium", renderStrategy: "full-3d-prop" }),
    Object.freeze({ slug: "gloom-clutter-driedwreathpile", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-clutter-lanternrust", primary: "wall-hang", size: "small", renderStrategy: "extruded-card", lightAffine: true }),
    Object.freeze({ slug: "gloom-clutter-coffinnail-scatter", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-clutter-mausoleumdoor-shard", primary: "setPiece", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-clutter-shroudrag", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "gloom-clutter-brokentombstone-alt", primary: "setPiece", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "gloom-clutter-funeralbell-alt", primary: "floor", size: "medium", renderStrategy: "billboard" }),
  ]),
  fantasy: Object.freeze([
    Object.freeze({ slug: "fantasy-flora-oak", primary: "setPiece", size: "large", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-fern", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-ivywall", primary: "wall-hang", size: "medium", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "fantasy-flora-mushroomring", primary: "focal", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-brambleblocker", primary: "blocker", size: "medium", renderStrategy: "full-3d-prop" }),
    Object.freeze({ slug: "fantasy-flora-wildflowerpatch", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-willowdrape", primary: "setPiece", size: "large", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-mossboulder", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-cattailreed", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-vinelattice", primary: "wall-hang", size: "medium", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "fantasy-flora-thistlecluster", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-herbbundle", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "fantasy-flora-toadstool", primary: "focal", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-birchgrove", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-rootarch", primary: "setPiece", size: "large", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-lilypad", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-honeycomb-nook", primary: "focal", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-hedgerow", primary: "blocker", size: "medium", renderStrategy: "full-3d-prop" }),
    Object.freeze({ slug: "fantasy-flora-oak-alt", primary: "setPiece", size: "large", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-flora-fern-alt", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-clutter-woodpile", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-clutter-brokencart-wheel", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "fantasy-clutter-hayloose", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-clutter-potteryshard", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-clutter-rusted-plow", primary: "setPiece", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-clutter-lanternhook", primary: "wall-hang", size: "small", renderStrategy: "extruded-card", lightAffine: true }),
    Object.freeze({ slug: "fantasy-clutter-firewoodstack", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-clutter-tornbanner", primary: "wall-hang", size: "medium", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "fantasy-clutter-shieldwall-fragment", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-clutter-rubblewall", primary: "blocker", size: "medium", renderStrategy: "full-3d-prop" }),
    Object.freeze({ slug: "fantasy-clutter-emptybarrel", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-clutter-tackleheap", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-clutter-candlestub", primary: "wall-hang", size: "small", renderStrategy: "extruded-card", lightAffine: true }),
    Object.freeze({ slug: "fantasy-clutter-brokenwheelbarrow", primary: "floor", size: "small", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-clutter-woodpile-alt", primary: "floor", size: "medium", renderStrategy: "billboard" }),
    Object.freeze({ slug: "fantasy-clutter-brokencart-wheel-alt", primary: "wall-hang", size: "small", renderStrategy: "extruded-card" }),
    Object.freeze({ slug: "fantasy-painting-1", primary: "wall-hang", size: "medium", renderStrategy: "extruded-card", paintingOf: "spr-fantasy-ancient-red-dragon" }),
    Object.freeze({ slug: "fantasy-painting-2", primary: "wall-hang", size: "medium", renderStrategy: "extruded-card", paintingOf: "spr-fantasy-colossus" }),
    Object.freeze({ slug: "fantasy-painting-3", primary: "wall-hang", size: "medium", renderStrategy: "extruded-card", paintingOf: "spr-fantasy-kraken" }),
    Object.freeze({ slug: "fantasy-painting-4", primary: "wall-hang", size: "medium", renderStrategy: "extruded-card", paintingOf: "spr-fantasy-tarrasque" }),
  ]),
});
// GENERATED:REALM_DRESSING:END
const DRESSING_DEFAULT_REALM = "chrome"; // matches theater-interior.js's INTERIOR_DEFAULT_KIT

function dressingRosterFor(realmId) {
  return REALM_DRESSING[realmId] || REALM_DRESSING[DRESSING_DEFAULT_REALM];
}

// Explicit geometry seam: the render layer consumes this field and never infers geometry from a
// filename. Legacy/projected entries degrade to the strategy implied by the existing primary tag.
function dressingRenderStrategyFor(entry) {
  if (entry && entry.renderStrategy) return entry.renderStrategy;
  if (entry && entry.primary === "wall-hang") return "extruded-card";
  if (entry && entry.primary === "blocker") return "full-3d-prop";
  return "billboard";
}

// ─── density by room role (Wildermyth density rule: entrance sparse / pocket dense / finale staged,
// 1-3 focal pieces per room MAX regardless of role — dpPlaceRoom clamps focal to this cap even if a
// role table entry were ever mistuned above it) ──────────────────────────────────────────────────
const DRESSING_FOCAL_CAP = 3;
// `seam` (BW3-5 SEAM-SOFTENING, docs/BEAUTY-WAVE-3.md): the seam-filler sub-pass's OWN density
// budget — same "entrance sparse -> finale staged" role convention as `filler`, a sibling number
// not a re-use of `filler` (seam fillers target a different zone — wall-base/column-foot/door-
// corner — and are bounded independently so a dense room's general clutter budget can't silently
// starve the seam pass, or vice versa).
const DRESSING_DENSITY_BY_ROLE = Object.freeze({
  entrance: Object.freeze({ focal: 1, filler: 1, seam: 2 }),
  pocket: Object.freeze({ focal: 3, filler: 3, seam: 4 }),
  finale: Object.freeze({ focal: 3, filler: 5, seam: 6 }),
  path: Object.freeze({ focal: 2, filler: 2, seam: 3 }),
  side: Object.freeze({ focal: 2, filler: 2, seam: 3 }),
});
function dressingDensityFor(role) {
  return DRESSING_DENSITY_BY_ROLE[role] || DRESSING_DENSITY_BY_ROLE.side;
}

// ─── plan-cell helpers (pure, no mutation of the caller's plan — engine-layer discipline this file
// shares with theater-interior.js's own itrRoomIndex-style helpers) ─────────────────────────────
function dpRoomFloorCells(room, plan) {
  const cells = [];
  for (let yy = room.y; yy < room.y + room.d; yy++) {
    for (let xx = room.x; xx < room.x + room.w; xx++) {
      if (xx < 0 || yy < 0 || xx >= plan.cellW || yy >= plan.cellD) continue;
      if (plan.cells[yy * plan.cellW + xx] === SPATIAL_CELL.FLOOR) cells.push({ x: xx, y: yy });
    }
  }
  return cells;
}

// MUTATION-TESTABLE GUARD (dev/verify-dungeon-dressing.mjs check 3 + its mutation): flip this
// literal to `false` to disable the room's own combat-space exclusion — a single named boolean, not
// buried arithmetic, so the mutation test can string-replace exactly this line and nothing else.
const DP_CENTER_EXCLUDE_ENABLED = true;

// the room's own CENTER 2x2 — "combat space", never dressed (GRAPHICS-ENGINE.md §D + this unit's own
// task brief). A 1xN/2xN sliver room clamps to whatever 2x2-or-smaller block sits at its center.
function dpCenter2x2(room) {
  const set = new Set();
  if (!DP_CENTER_EXCLUDE_ENABLED) return set; // mutation path: exclusion disabled -> empty set
  const cx0 = room.x + Math.max(0, Math.floor((room.w - 2) / 2));
  const cy0 = room.y + Math.max(0, Math.floor((room.d - 2) / 2));
  for (let dx = 0; dx < 2; dx++) {
    for (let dy = 0; dy < 2; dy++) {
      const xx = cx0 + dx, yy = cy0 + dy;
      if (xx < room.x + room.w && yy < room.y + room.d) set.add(xx + "," + yy);
    }
  }
  return set;
}

function dpAdjacentToWall(x, y, plan) {
  const deltas = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  return deltas.some(([dx, dy]) => {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) return false;
    return plan.cells[ny * plan.cellW + nx] === SPATIAL_CELL.WALL;
  });
}

// ─── BW3-5 SEAM-SOFTENING (docs/BEAUTY-WAVE-3.md unit BW3-5) — helpers for the seam-filler sub-
// pass added to dpPlaceRoom below. The mock's foliage sits at ARCHITECTURE SEAMS (wall-floor joint,
// column/furniture feet, doorway-adjacent corners), never mid-floor — this is a texture for seams,
// not a new clutter budget. ───────────────────────────────────────────────────────────────────────
function dpAdjacentToDoor(x, y, plan) {
  const deltas = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  return deltas.some(([dx, dy]) => {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) return false;
    return plan.cells[ny * plan.cellW + nx] === SPATIAL_CELL.DOOR;
  });
}

// the wall-base LINE for a room: its own FLOOR cells that are wall-adjacent, in stable row-major
// order (dpRoomFloorCells' own order) — a deterministic, roughly-perimeter-following sequence the
// RHYTHM-style interval sampler below walks across, so sampled fillers spread along the joint
// instead of clustering wherever the shuffle happened to land.
function dpWallBaseCells(room, plan) {
  return dpRoomFloorCells(room, plan).filter((c) => dpAdjacentToWall(c.x, c.y, plan));
}

// the 4-neighbor FLOOR cells around an arbitrary (x,y) — used to find a "foot" cell beside a column
// or an already-placed furniture (blocker/setPiece) piece. Never returns a WALL/DOOR/VOID neighbor
// (FLOOR-cells-only law, same guard as every other placement step in this file).
function dpAdjacentCellsWithin1(cell, plan) {
  const deltas = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const out = [];
  deltas.forEach(([dx, dy]) => {
    const nx = cell.x + dx, ny = cell.y + dy;
    if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) return;
    if (plan.cells[ny * plan.cellW + nx] === SPATIAL_CELL.FLOOR) out.push({ x: nx, y: ny });
  });
  return out;
}

// mirrors theater-interior.js's OWN u3-column pillar-placement formula (ITR_PILLAR_MIN_DIM=6,
// ITR_COLUMN_CHANCE=0.14, the SAME 4-corner candidate list, the SAME "u3-column:"+seed+":"+segNum+
// ":"+x","+y hash) — an INDEPENDENT reimplementation of the SAME deterministic formula over the SAME
// inputs (this file's header note's own ENGINE PURITY LAW discipline: place-dressing.js never reaches
// into src/ui/theater-interior.js, even a DOM-free render-data module — two independent
// implementations of the same formula necessarily agree, byte-for-byte, without an import). Used
// ONLY to learn WHERE a room's column (if any) will render this seed, so a seam-filler card can sit
// at its foot; never mutates or duplicates the pillar itself (theater-interior.js still owns
// rendering it). Runs its own seeded stream, never the caller's `rng` (same convention as
// dpRoomLightCells above), so this lookup never perturbs the room's own dressing roll order.
const DP_PILLAR_MIN_DIM = 6;
const DP_COLUMN_CHANCE = 0.14;
function dpRoomColumnCell(room, plan) {
  if (room.w < DP_PILLAR_MIN_DIM || room.d < DP_PILLAR_MIN_DIM) return null;
  const seed = dspHashStr("u3-column:" + (plan.seed || "") + ":" + room.segNum + ":" + room.x + "," + room.y);
  const rng = dspMulberry32(seed);
  if (rng() >= DP_COLUMN_CHANCE) return null; // the common case: no column at all
  const corners = [
    { x: room.x + 1, y: room.y + 1 }, { x: room.x + room.w - 2, y: room.y + 1 },
    { x: room.x + 1, y: room.y + room.d - 2 }, { x: room.x + room.w - 2, y: room.y + room.d - 2 },
  ].filter((c) => c.x >= 0 && c.y >= 0 && c.x < plan.cellW && c.y < plan.cellD
    && plan.cells[c.y * plan.cellW + c.x] === SPATIAL_CELL.FLOOR);
  if (!corners.length) return null;
  return corners[Math.floor(rng() * corners.length) % corners.length];
}

// ─── BEAUTY-WAVE-2.md BW2-1b (THE OCCLUSION LAW), item 2 — PLACEMENT BIAS: mirrors src/ui/theater-
// boot.js's CAM_YAW_OFFSET_DEG (45deg) at the default rotationStep=0 view — the ONE canonical camera
// direction dressPlan can reason about at ROLL time (rotation is a later, render-time-only lever;
// the dynamic pillar/wall cutaway, item 1, is what handles every OTHER rotation the player turns
// to). Two independent constants declaring the SAME number — same "two independent implementations
// of the SAME deterministic formula... without an import" ENGINE PURITY LAW discipline
// dpRoomLightCandidates already keeps mirroring theater-interior.js's itrRoomLightCandidates (this
// file's own header note).
const DP_CAM_YAW_OFFSET_DEG = 45;
const DP_CAM_DIR_X = Math.sin((DP_CAM_YAW_OFFSET_DEG * Math.PI) / 180);
const DP_CAM_DIR_Z = Math.cos((DP_CAM_YAW_OFFSET_DEG * Math.PI) / 180);

// a cell sits on the CAMERA SIDE of the room's own center (a cheap proxy for "in front of the
// walkable/combat space, from the canonical viewing angle") when its offset from the room's center
// projects positive onto the canonical view direction — the SAME rx*dirX+rz*dirZ>0 "near side" test
// theater-boot.js's own CUTAWAY WALLS section runs against a room's perimeter walls (that file's own
// header comment), just applied to a candidate DRESSING cell instead of a wall instance.
function dpIsCameraSideOfRoom(x, y, room) {
  const centerX = room.x + (room.w - 1) / 2, centerY = room.y + (room.d - 1) / 2;
  const rx = x - centerX, rz = y - centerY;
  return (rx * DP_CAM_DIR_X + rz * DP_CAM_DIR_Z) > 0;
}

// ─── light-seed co-location (independently mirrors theater-interior.js's itrRoomLightCandidates/
// itrRoomLightCount/itrRoomLights EXACTLY — same candidate list, same count thresholds, same
// "u3-light:"+seed+":"+segNum+":"+x","+y hash, same seeded Fisher-Yates — so this file's picks land
// on the SAME cells the render layer's real PointLights sit at, without this engine module ever
// calling into that render module. See this file's header note (ENGINE PURITY LAW). ) ────────────
function dpRoomLightCandidates(room) {
  const pts = [];
  for (let yy = room.y; yy < room.y + room.d; yy++) {
    for (let xx = room.x; xx < room.x + room.w; xx++) {
      const onEdge = xx === room.x || xx === room.x + room.w - 1 || yy === room.y || yy === room.y + room.d - 1;
      if (onEdge) pts.push({ x: xx, y: yy });
    }
  }
  return pts.length ? pts : [{ x: room.x, y: room.y }];
}
function dpRoomLightCount(room) {
  const area = room.w * room.d;
  if (area < 30) return 1;
  if (area < 80) return 2;
  return 3;
}
function dpRoomLightCells(room, plan) {
  const seed = dspHashStr("u3-light:" + (plan.seed || "") + ":" + room.segNum + ":" + room.x + "," + room.y);
  const rng = dspMulberry32(seed);
  const candidates = dpRoomLightCandidates(room);
  const shuffled = candidates.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
  }
  const n = Math.min(dpRoomLightCount(room), shuffled.length);
  return shuffled.slice(0, n);
}

// deterministic Fisher-Yates over a plain candidate array, using the CALLER'S rng stream (so a
// room's whole dressing roll — lights, focal, blockers, wall-hangs, filler — draws from ONE
// continuous seeded sequence, matching DETERMINISM LAW's "pure function of (plan,opts)").
function dpShuffle(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = out[i]; out[i] = out[j]; out[j] = t;
  }
  return out;
}
function dpPickRoster(roster, rng) {
  if (!roster.length) return null;
  return roster[Math.floor(rng() * roster.length) % roster.length];
}

// ─── per-room roll: lights (co-located) -> focal (capped 3) -> blockers (wall-adjacent) ->
// wall-hangs (wall-adjacent) -> filler (general floor) — fixed order over ONE seeded rng stream so
// two identical (plan,opts) calls always draw the exact same cells in the exact same sequence. ────
function dpPlaceRoom(room, plan, roster, rng, seamRoster) {
  const out = [];
  const floorCells = dpRoomFloorCells(room, plan);
  const centerSet = dpCenter2x2(room);
  const placeable = floorCells.filter((c) => !centerSet.has(c.x + "," + c.y));
  if (!placeable.length) return out;

  const occupied = new Set();
  const takeCell = (list) => {
    for (const c of list) {
      const key = c.x + "," + c.y;
      if (occupied.has(key)) continue;
      occupied.add(key);
      return c;
    }
    return null;
  };

  const density = dressingDensityFor(room.role);
  const focalRoster = roster.filter((e) => e.primary === "focal" || e.primary === "setPiece");
  const fillerRoster = roster.filter((e) => e.primary === "floor");
  const blockerRoster = roster.filter((e) => e.primary === "blocker");
  const wallHangRoster = roster.filter((e) => e.primary === "wall-hang" && !e.lightAffine);
  const lightRoster = roster.filter((e) => e.lightAffine);

  const shuffledPlaceable = dpShuffle(placeable, rng);
  const wallAdjacent = dpShuffle(shuffledPlaceable.filter((c) => dpAdjacentToWall(c.x, c.y, plan)), rng);
  // BW2-1b item 2 (placement bias): the FAR-side subset of wallAdjacent — never on the canonical
  // camera side of the room's own center (dpIsCameraSideOfRoom, above) — is the blocker step's
  // PREFERRED candidate list below; a slender/skewed room with no far-side wall-adjacent cell free
  // still falls back to the full wallAdjacent list (never a stricter placement guarantee than
  // pre-unit — a blocker still lands, just without the bias, in that degenerate case).
  const wallAdjacentFarSide = wallAdjacent.filter((c) => !dpIsCameraSideOfRoom(c.x, c.y, room));

  // 1) light-primary cards, co-located with the room's own light seeds (never re-derived off
  // shuffledPlaceable — these positions come from dpRoomLightCells, the shared-formula co-location).
  if (lightRoster.length) {
    dpRoomLightCells(room, plan).forEach((cell) => {
      const key = cell.x + "," + cell.y;
      if (centerSet.has(key) || occupied.has(key)) return; // rare tiny-room overlap guard
      // the room's own light-candidate ring is the wall/door-adjacent perimeter band (theater-
      // interior.js's own itrRoomLightCandidates comment) — a light SEED may legitimately land on a
      // DOOR cell (a torch beside a doorway), but a dressing CARD never may (FLOOR-cells-only law,
      // this file's header). Co-location is best-effort: skip the card rather than break the law.
      if (plan.cells[cell.y * plan.cellW + cell.x] !== SPATIAL_CELL.FLOOR) return;
      occupied.add(key);
      const entry = dpPickRoster(lightRoster, rng);
      out.push({ slug: entry.slug, x: cell.x, y: cell.y, primary: "light", cardKind: entry.size, renderStrategy: dressingRenderStrategyFor(entry), roomSegNum: room.segNum, lightAffine: true });
    });
  }

  // 2) focal pieces — capped at DRESSING_FOCAL_CAP regardless of the role table's own value.
  // VP4 (docs/BEAUTY-WAVE.md §VP4, "key-light-as-composition"): tag the room's SINGLE chosen focal
  // cell so theater-interior.js's itrRoomLights can relocate the key light beside it without
  // re-deriving "which piece is focal" itself — a setPiece wins over a plain focal (item 4's "finale
  // rooms get ... the setPiece focal" staging law), else the first focal piece placed this room.
  const focalCount = Math.min(density.focal, DRESSING_FOCAL_CAP);
  let chosenFocal = null;
  for (let i = 0; i < focalCount; i++) {
    const cell = takeCell(shuffledPlaceable);
    if (!cell) break;
    const entry = dpPickRoster(focalRoster.length ? focalRoster : fillerRoster, rng);
    if (!entry) break;
    const placed = { slug: entry.slug, x: cell.x, y: cell.y, primary: entry.primary, cardKind: entry.size, renderStrategy: dressingRenderStrategyFor(entry), roomSegNum: room.segNum };
    out.push(placed);
    if (!chosenFocal || (placed.primary === "setPiece" && chosenFocal.primary !== "setPiece")) chosenFocal = placed;
  }
  if (chosenFocal) chosenFocal.focal = true;

  // 3) one blocker, wall-adjacent only (never placed if no wall-adjacent cell remains free).
  // BW2-1b item 2: prefer the FAR-side subset first (never seeds a blocker between the canonical
  // camera and this room's own combat space) — falls back to the full wallAdjacent list only when
  // the far side has nothing free, so a blocker still places rather than silently vanishing.
  if (blockerRoster.length) {
    const cell = takeCell(wallAdjacentFarSide) || takeCell(wallAdjacent);
    if (cell) {
      const entry = dpPickRoster(blockerRoster, rng);
      out.push({ slug: entry.slug, x: cell.x, y: cell.y, primary: entry.primary, cardKind: entry.size, renderStrategy: dressingRenderStrategyFor(entry), roomSegNum: room.segNum });
    }
  }

  // 4) wall-hangs — pocket/finale get 2, everything else gets 1 (also wall-adjacent only).
  const wallHangCount = (room.role === "pocket" || room.role === "finale") ? 2 : 1;
  if (wallHangRoster.length) {
    for (let i = 0; i < wallHangCount; i++) {
      const cell = takeCell(wallAdjacent);
      if (!cell) break;
      const entry = dpPickRoster(wallHangRoster, rng);
      out.push({ slug: entry.slug, x: cell.x, y: cell.y, primary: entry.primary, cardKind: entry.size, renderStrategy: dressingRenderStrategyFor(entry), roomSegNum: room.segNum });
    }
  }

  // 5) filler — general floor clutter, fills out the role's own density budget.
  if (fillerRoster.length) {
    for (let i = 0; i < density.filler; i++) {
      const cell = takeCell(shuffledPlaceable);
      if (!cell) break;
      const entry = dpPickRoster(fillerRoster, rng);
      out.push({ slug: entry.slug, x: cell.x, y: cell.y, primary: entry.primary, cardKind: entry.size, renderStrategy: dressingRenderStrategyFor(entry), roomSegNum: room.segNum });
    }
  }

  // 6) SEAM-SOFTENING (BW3-5, docs/BEAUTY-WAVE-3.md — "why the wolf room's foliage almost belongs"):
  // small filler cards seeded ALONG the wall-base line (RHYTHM-sampled at intervals, never every
  // cell — a texture, not a flood), at column/furniture feet, and in doorway-adjacent corners. This
  // is composition FOR SEAMS, not more floor clutter: bounded by `density.seam` (role-scaled,
  // entrance sparse -> finale staged, same convention as `filler` above), and every candidate cell
  // still comes from `placeable` (FLOOR-only, never this room's own center 2x2 — the SAME CLEAR-law
  // guard every earlier step already obeys) or from the shared `occupied` set (never double-books a
  // cell another step already took). `seamRoster` is realm-true filler-shaped entries picked from
  // the roster that ALREADY EXISTS (primary:"floor" && size:"small" — fantasy grass/roots/moss,
  // gloom bone-dust/crack/grave clutter, chrome cable/grime/moss slugs read this way by construction,
  // never an invented slug); dressPlan logs (once, not per-room) and skips this whole sub-pass for a
  // realm whose roster has none, per the spec's own "log realms whose pools lack fillers rather than
  // inventing slugs" ruling.
  const seamBudget = Math.max(0, (density.seam || 0));
  if (seamRoster && seamRoster.length && seamBudget > 0) {
    const seamTargets = [];

    // (a) doorway-adjacent corners — a tuft tucked right where the door frame meets the wall face.
    dpShuffle(placeable.filter((c) => dpAdjacentToDoor(c.x, c.y, plan) && dpAdjacentToWall(c.x, c.y, plan)), rng)
      .forEach((c) => seamTargets.push({ cell: c, kind: "doorCorner" }));

    // (b) column foot — this room's own column cell, IF the independent column-formula rolls one
    // for this seed (dpRoomColumnCell, above) — a foot cell adjacent to it, still inside `placeable`.
    const columnCell = dpRoomColumnCell(room, plan);
    if (columnCell) {
      const feet = dpShuffle(dpAdjacentCellsWithin1(columnCell, plan).filter((c) => placeable.some((p) => p.x === c.x && p.y === c.y)), rng);
      if (feet.length) seamTargets.push({ cell: feet[0], kind: "columnFoot" });
    }

    // (c) furniture feet — adjacent to THIS room's own already-placed blocker/setPiece pieces (the
    // furniture channel + large set-dressing, BW2-5) — moss/roots grounding the big prop's base.
    out.filter((d) => d.primary === "blocker" || d.primary === "setPiece").forEach((d) => {
      const feet = dpShuffle(dpAdjacentCellsWithin1({ x: d.x, y: d.y }, plan).filter((c) => placeable.some((p) => p.x === c.x && p.y === c.y)), rng);
      if (feet.length) seamTargets.push({ cell: feet[0], kind: "furnitureFoot" });
    });

    // (d) wall-base line — RHYTHM-style interval sampling fills whatever budget (a)-(c) left over;
    // a phase offset (seeded, not always 0) keeps the sampled start from always landing on the same
    // corner of the room.
    const remaining = Math.max(0, seamBudget - seamTargets.length);
    if (remaining > 0) {
      const wallBase = dpWallBaseCells(room, plan);
      if (wallBase.length) {
        const interval = Math.max(1, Math.floor(wallBase.length / remaining));
        const phase = Math.floor(rng() * interval);
        for (let i = phase; i < wallBase.length; i += interval) seamTargets.push({ cell: wallBase[i], kind: "wallBase" });
      }
    }

    let placedSeam = 0;
    for (const t of seamTargets) {
      if (placedSeam >= seamBudget) break;
      const key = t.cell.x + "," + t.cell.y;
      if (occupied.has(key)) continue; // another step already took this cell — never double-book
      occupied.add(key);
      const entry = dpPickRoster(seamRoster, rng);
      out.push({
        slug: entry.slug, x: t.cell.x, y: t.cell.y, primary: entry.primary, cardKind: entry.size,
        renderStrategy: dressingRenderStrategyFor(entry),
        roomSegNum: room.segNum, seam: true, seamKind: t.kind,
      });
      placedSeam++;
    }
  }

  return out;
}

/** dressPlan(plan, opts) → plan.dressing = [{slug, x, y, primary, cardKind, renderStrategy, roomSegNum, lightAffine?}]
 * `plan` is a spatializePlan()/semanticizePlan() output (a bare U1 plan degrades cleanly — every
 * room.role defaults to null, which falls through dressingDensityFor's own `|| DENSITY.side`
 * fallback, same total-function/never-throw discipline theater-interior.js keeps).
 * `opts`: { realmId, walkId } — realmId selects the REALM_DRESSING roster (falls back to
 * DRESSING_DEFAULT_REALM on an unknown/absent realm, mirroring interiorTileKitFor); walkId seeds
 * the per-room RNG (falls back to plan.seed when omitted).
 * Pure: same (plan,opts) snapshot always yields byte-identical dressing arrays (DETERMINISM LAW). */
function dressPlan(plan, opts) {
  opts = opts || {};
  if (!plan || !Array.isArray(plan.rooms) || !plan.rooms.length || !plan.cells) {
    throw new Error("dressPlan: plan.rooms[]/plan.cells are required (spatializePlan/semanticizePlan output expected)");
  }
  const roster = dressingRosterFor(opts.realmId);
  // BW3-5 SEAM-SOFTENING: the seam-filler sub-pass's own roster slice — small floor-primary entries
  // ALREADY IN the roster (never an invented slug). Computed ONCE per dressPlan call (not per room)
  // so an empty pool logs exactly once, not once per room.
  const seamRoster = roster.filter((e) => e.primary === "floor" && e.size === "small");
  if (!seamRoster.length && typeof console !== "undefined" && console.warn) {
    console.warn(
      "dressPlan (BW3-5 seam-softening): realm '" + (opts.realmId != null ? opts.realmId : DRESSING_DEFAULT_REALM) +
      "' roster has no small floor-primary entries — seam-filler sub-pass skipped for this walk (never inventing a filler slug)."
    );
  }
  const fingerprint = opts.walkId != null ? String(opts.walkId) : String(plan.seed || "");
  const dressing = [];
  plan.rooms.forEach((room) => {
    const seed = dspHashStr("u4-dress:" + fingerprint + ":" + room.segNum + ":" + room.x + "," + room.y);
    const rng = dspMulberry32(seed);
    dpPlaceRoom(room, plan, roster, rng, seamRoster).forEach((d) => dressing.push(d));
  });
  const out = Object.assign({}, plan, { dressing });
  return out;
}

// ─── ES-module bridge (mirrors theater-interior.js's own convention: top-level `const` never
// auto-attaches to `window`, and theater-boot.js's sealed ES-module scope can only reach in via
// `window.` — see that file's header note for the full explanation) ────────────────────────────
window.REALM_DRESSING = REALM_DRESSING;
window.dressPlan = dressPlan;
window.dressingRosterFor = dressingRosterFor;
