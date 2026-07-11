/* GENESIS MODULE — src/engine/place-dressing.js — GRAPHICS-ENGINE.md Part II §D DRESSING SYSTEM,
   build unit GR2 (docs/GRAPHICS-ENGINE.md "Build units — GR2 — props+foliage cards"). Classic
   <script> (shared global scope) — pure engine-layer DATA code, no THREE/canvas/DOM, mirroring
   src/ui/theater-interior.js's own "data in this file, GL in theater-boot.js" split (this file IS
   the data half; src/ui/theater-boot.js's setInteriorBoard mounts a `dressingGroup` off its output
   — see that file's own header comment for the render half).

   dressPlan(plan, opts) → plan.dressing = [{slug, x, y, primary, cardKind, roomSegNum, lightAffine}]:
   a seeded per-room prop/foliage placement pass over a spatializePlan()/semanticizePlan() output,
   per the spec's own rules —
     - density by room.role (Wildermyth density rule: entrance sparse, pocket dense, finale staged,
       1-3 FOCAL pieces per room max, filler beyond that — DRESSING_DENSITY_BY_ROLE below);
     - cards land on FLOOR cells only (never DOOR/WALL cells — those codes are never in a room's own
       floor-cell list to begin with) and never inside the room's own combat-space CENTER 2x2 (dpCenter2x2);
     - BLOCKER cards land within 1 cell of a WALL cell (dpAdjacentToWall);
     - WALL-HANG cards land adjacent to a wall cell too (the "hang ON the wall" reading);
     - LIGHT-primary cards co-locate with the room's own light seeds — this file independently
       reimplements theater-interior.js's itrRoomLightCandidates/itrRoomLightCount/light-seed formula
       (same "u3-light:"+plan.seed+":"+segNum+":"+x","+y hash, same perimeter-ring candidate list,
       same seeded Fisher-Yates) rather than calling into it: ENGINE PURITY LAW (CLAUDE.md/this repo's
       standing discipline) means src/engine/* never reaches into a src/ui/* render module, even a
       DOM-free one — two independent implementations of the SAME deterministic formula over the SAME
       inputs necessarily agree, byte-for-byte, without an import.

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
    Object.freeze({ slug: "chrome-flora-cableplanter", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "chrome-flora-neonbonsai", primary: "focal", size: "small", lightAffine: true }),
    Object.freeze({ slug: "chrome-flora-hologram-fern", primary: "wall-hang", size: "small" }),
    Object.freeze({ slug: "chrome-flora-antennagrass", primary: "floor", size: "small" }),
    Object.freeze({ slug: "chrome-flora-solarvine", primary: "wall-hang", size: "medium" }),
    Object.freeze({ slug: "chrome-flora-datamoss", primary: "wall-hang", size: "small", lightAffine: true }),
    Object.freeze({ slug: "chrome-flora-scraptree", primary: "setPiece", size: "large" }),
    Object.freeze({ slug: "chrome-flora-neonlily", primary: "focal", size: "small", lightAffine: true }),
    Object.freeze({ slug: "chrome-flora-wireweed", primary: "floor", size: "small" }),
    Object.freeze({ slug: "chrome-flora-lightpod", primary: "focal", size: "medium", lightAffine: true }),
    Object.freeze({ slug: "chrome-flora-fiberreed", primary: "blocker", size: "medium" }),
    Object.freeze({ slug: "chrome-flora-circuitmoss", primary: "floor", size: "small" }),
    Object.freeze({ slug: "chrome-flora-vendingivy", primary: "wall-hang", size: "small" }),
    Object.freeze({ slug: "chrome-flora-hazardfern", primary: "floor", size: "small" }),
    Object.freeze({ slug: "chrome-flora-drone-hive", primary: "focal", size: "small" }),
    Object.freeze({ slug: "chrome-flora-billboardvine", primary: "setPiece", size: "large" }),
    Object.freeze({ slug: "chrome-flora-steamvent-moss", primary: "floor", size: "small" }),
    Object.freeze({ slug: "chrome-flora-glasscoral", primary: "focal", size: "medium" }),
    Object.freeze({ slug: "chrome-flora-cableplanter-alt", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "chrome-flora-neonbonsai-alt", primary: "focal", size: "small", lightAffine: true }),
    Object.freeze({ slug: "chrome-clutter-brokenscreen", primary: "wall-hang", size: "small" }),
    Object.freeze({ slug: "chrome-clutter-cablesnarl", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "chrome-clutter-drone-husk", primary: "floor", size: "small" }),
    Object.freeze({ slug: "chrome-clutter-neonshard", primary: "floor", size: "small" }),
    Object.freeze({ slug: "chrome-clutter-vendingwreck", primary: "setPiece", size: "medium" }),
    Object.freeze({ slug: "chrome-clutter-circuitscrap", primary: "floor", size: "small" }),
    Object.freeze({ slug: "chrome-clutter-antennastack", primary: "wall-hang", size: "small" }),
    Object.freeze({ slug: "chrome-clutter-batterypack", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "chrome-clutter-signfragment", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "chrome-clutter-cctv-eye", primary: "wall-hang", size: "small" }),
    Object.freeze({ slug: "chrome-clutter-coolantstain", primary: "floor", size: "small" }),
    Object.freeze({ slug: "chrome-clutter-crateseal", primary: "floor", size: "small" }),
    Object.freeze({ slug: "chrome-clutter-turnstile", primary: "blocker", size: "medium" }),
    Object.freeze({ slug: "chrome-clutter-keyboardpile", primary: "floor", size: "small" }),
    Object.freeze({ slug: "chrome-clutter-brokenscreen-alt", primary: "wall-hang", size: "small" }),
    Object.freeze({ slug: "chrome-clutter-cablesnarl-alt", primary: "floor", size: "medium" }),
  ]),
  gloom: Object.freeze([
    Object.freeze({ slug: "gloom-flora-deadhedge", primary: "blocker", size: "medium" }),
    Object.freeze({ slug: "gloom-flora-cattails", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "gloom-flora-wiltrose", primary: "focal", size: "small" }),
    Object.freeze({ slug: "gloom-flora-mournvine", primary: "wall-hang", size: "medium" }),
    Object.freeze({ slug: "gloom-flora-bonelichen", primary: "wall-hang", size: "small" }),
    Object.freeze({ slug: "gloom-flora-driedwreath", primary: "focal", size: "small" }),
    Object.freeze({ slug: "gloom-flora-witheredwillow", primary: "setPiece", size: "large" }),
    Object.freeze({ slug: "gloom-flora-graveturf", primary: "floor", size: "small" }),
    Object.freeze({ slug: "gloom-flora-mossgrave", primary: "floor", size: "small" }),
    Object.freeze({ slug: "gloom-flora-thornbriar", primary: "blocker", size: "medium" }),
    Object.freeze({ slug: "gloom-flora-driedivy", primary: "wall-hang", size: "medium" }),
    Object.freeze({ slug: "gloom-flora-nightshade", primary: "floor", size: "small" }),
    Object.freeze({ slug: "gloom-flora-rootcrack", primary: "floor", size: "small" }),
    Object.freeze({ slug: "gloom-flora-witherstalk", primary: "floor", size: "small" }),
    Object.freeze({ slug: "gloom-flora-mournbell", primary: "focal", size: "small" }),
    Object.freeze({ slug: "gloom-flora-fungalcrust", primary: "wall-hang", size: "small" }),
    Object.freeze({ slug: "gloom-flora-deadorchard", primary: "setPiece", size: "large" }),
    Object.freeze({ slug: "gloom-flora-mourningfern", primary: "floor", size: "small" }),
    Object.freeze({ slug: "gloom-flora-deadhedge-alt", primary: "blocker", size: "medium" }),
    Object.freeze({ slug: "gloom-flora-cattails-alt", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "gloom-clutter-brokentombstone", primary: "setPiece", size: "medium" }),
    Object.freeze({ slug: "gloom-clutter-funeralbell", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "gloom-clutter-bonepile", primary: "floor", size: "small" }),
    Object.freeze({ slug: "gloom-clutter-coffinlid", primary: "wall-hang", size: "medium" }),
    Object.freeze({ slug: "gloom-clutter-mourningveil", primary: "wall-hang", size: "small" }),
    Object.freeze({ slug: "gloom-clutter-candlewax-pool", primary: "floor", size: "small" }),
    Object.freeze({ slug: "gloom-clutter-shovelstuck", primary: "focal", size: "small" }),
    Object.freeze({ slug: "gloom-clutter-urnshard", primary: "floor", size: "small" }),
    Object.freeze({ slug: "gloom-clutter-ironfence-gap", primary: "blocker", size: "medium" }),
    Object.freeze({ slug: "gloom-clutter-driedwreathpile", primary: "floor", size: "small" }),
    Object.freeze({ slug: "gloom-clutter-lanternrust", primary: "wall-hang", size: "small", lightAffine: true }),
    Object.freeze({ slug: "gloom-clutter-coffinnail-scatter", primary: "floor", size: "small" }),
    Object.freeze({ slug: "gloom-clutter-mausoleumdoor-shard", primary: "setPiece", size: "medium" }),
    Object.freeze({ slug: "gloom-clutter-shroudrag", primary: "wall-hang", size: "small" }),
    Object.freeze({ slug: "gloom-clutter-brokentombstone-alt", primary: "setPiece", size: "medium" }),
    Object.freeze({ slug: "gloom-clutter-funeralbell-alt", primary: "floor", size: "medium" }),
  ]),
  fantasy: Object.freeze([
    Object.freeze({ slug: "fantasy-flora-oak", primary: "setPiece", size: "large" }),
    Object.freeze({ slug: "fantasy-flora-fern", primary: "floor", size: "small" }),
    Object.freeze({ slug: "fantasy-flora-ivywall", primary: "wall-hang", size: "medium" }),
    Object.freeze({ slug: "fantasy-flora-mushroomring", primary: "focal", size: "small" }),
    Object.freeze({ slug: "fantasy-flora-brambleblocker", primary: "blocker", size: "medium" }),
    Object.freeze({ slug: "fantasy-flora-wildflowerpatch", primary: "floor", size: "small" }),
    Object.freeze({ slug: "fantasy-flora-willowdrape", primary: "setPiece", size: "large" }),
    Object.freeze({ slug: "fantasy-flora-mossboulder", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "fantasy-flora-cattailreed", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "fantasy-flora-vinelattice", primary: "wall-hang", size: "medium" }),
    Object.freeze({ slug: "fantasy-flora-thistlecluster", primary: "floor", size: "small" }),
    Object.freeze({ slug: "fantasy-flora-herbbundle", primary: "wall-hang", size: "small" }),
    Object.freeze({ slug: "fantasy-flora-toadstool", primary: "focal", size: "small" }),
    Object.freeze({ slug: "fantasy-flora-birchgrove", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "fantasy-flora-rootarch", primary: "setPiece", size: "large" }),
    Object.freeze({ slug: "fantasy-flora-lilypad", primary: "floor", size: "small" }),
    Object.freeze({ slug: "fantasy-flora-honeycomb-nook", primary: "focal", size: "small" }),
    Object.freeze({ slug: "fantasy-flora-hedgerow", primary: "blocker", size: "medium" }),
    Object.freeze({ slug: "fantasy-flora-oak-alt", primary: "setPiece", size: "large" }),
    Object.freeze({ slug: "fantasy-flora-fern-alt", primary: "floor", size: "small" }),
    Object.freeze({ slug: "fantasy-clutter-woodpile", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "fantasy-clutter-brokencart-wheel", primary: "wall-hang", size: "small" }),
    Object.freeze({ slug: "fantasy-clutter-hayloose", primary: "floor", size: "small" }),
    Object.freeze({ slug: "fantasy-clutter-potteryshard", primary: "floor", size: "small" }),
    Object.freeze({ slug: "fantasy-clutter-rusted-plow", primary: "setPiece", size: "medium" }),
    Object.freeze({ slug: "fantasy-clutter-lanternhook", primary: "wall-hang", size: "small", lightAffine: true }),
    Object.freeze({ slug: "fantasy-clutter-firewoodstack", primary: "floor", size: "small" }),
    Object.freeze({ slug: "fantasy-clutter-tornbanner", primary: "wall-hang", size: "medium" }),
    Object.freeze({ slug: "fantasy-clutter-shieldwall-fragment", primary: "floor", size: "small" }),
    Object.freeze({ slug: "fantasy-clutter-rubblewall", primary: "blocker", size: "medium" }),
    Object.freeze({ slug: "fantasy-clutter-emptybarrel", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "fantasy-clutter-tackleheap", primary: "floor", size: "small" }),
    Object.freeze({ slug: "fantasy-clutter-candlestub", primary: "wall-hang", size: "small", lightAffine: true }),
    Object.freeze({ slug: "fantasy-clutter-brokenwheelbarrow", primary: "floor", size: "small" }),
    Object.freeze({ slug: "fantasy-clutter-woodpile-alt", primary: "floor", size: "medium" }),
    Object.freeze({ slug: "fantasy-clutter-brokencart-wheel-alt", primary: "wall-hang", size: "small" }),
  ]),
});
// GENERATED:REALM_DRESSING:END
const DRESSING_DEFAULT_REALM = "chrome"; // matches theater-interior.js's INTERIOR_DEFAULT_KIT

function dressingRosterFor(realmId) {
  return REALM_DRESSING[realmId] || REALM_DRESSING[DRESSING_DEFAULT_REALM];
}

// ─── density by room role (Wildermyth density rule: entrance sparse / pocket dense / finale staged,
// 1-3 focal pieces per room MAX regardless of role — dpPlaceRoom clamps focal to this cap even if a
// role table entry were ever mistuned above it) ──────────────────────────────────────────────────
const DRESSING_FOCAL_CAP = 3;
const DRESSING_DENSITY_BY_ROLE = Object.freeze({
  entrance: Object.freeze({ focal: 1, filler: 1 }),
  pocket: Object.freeze({ focal: 3, filler: 3 }),
  finale: Object.freeze({ focal: 3, filler: 5 }),
  path: Object.freeze({ focal: 2, filler: 2 }),
  side: Object.freeze({ focal: 2, filler: 2 }),
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
function dpPlaceRoom(room, plan, roster, rng) {
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
      out.push({ slug: entry.slug, x: cell.x, y: cell.y, primary: "light", cardKind: entry.size, roomSegNum: room.segNum, lightAffine: true });
    });
  }

  // 2) focal pieces — capped at DRESSING_FOCAL_CAP regardless of the role table's own value.
  const focalCount = Math.min(density.focal, DRESSING_FOCAL_CAP);
  for (let i = 0; i < focalCount; i++) {
    const cell = takeCell(shuffledPlaceable);
    if (!cell) break;
    const entry = dpPickRoster(focalRoster.length ? focalRoster : fillerRoster, rng);
    if (!entry) break;
    out.push({ slug: entry.slug, x: cell.x, y: cell.y, primary: entry.primary, cardKind: entry.size, roomSegNum: room.segNum });
  }

  // 3) one blocker, wall-adjacent only (never placed if no wall-adjacent cell remains free).
  if (blockerRoster.length) {
    const cell = takeCell(wallAdjacent);
    if (cell) {
      const entry = dpPickRoster(blockerRoster, rng);
      out.push({ slug: entry.slug, x: cell.x, y: cell.y, primary: entry.primary, cardKind: entry.size, roomSegNum: room.segNum });
    }
  }

  // 4) wall-hangs — pocket/finale get 2, everything else gets 1 (also wall-adjacent only).
  const wallHangCount = (room.role === "pocket" || room.role === "finale") ? 2 : 1;
  if (wallHangRoster.length) {
    for (let i = 0; i < wallHangCount; i++) {
      const cell = takeCell(wallAdjacent);
      if (!cell) break;
      const entry = dpPickRoster(wallHangRoster, rng);
      out.push({ slug: entry.slug, x: cell.x, y: cell.y, primary: entry.primary, cardKind: entry.size, roomSegNum: room.segNum });
    }
  }

  // 5) filler — general floor clutter, fills out the role's own density budget.
  if (fillerRoster.length) {
    for (let i = 0; i < density.filler; i++) {
      const cell = takeCell(shuffledPlaceable);
      if (!cell) break;
      const entry = dpPickRoster(fillerRoster, rng);
      out.push({ slug: entry.slug, x: cell.x, y: cell.y, primary: entry.primary, cardKind: entry.size, roomSegNum: room.segNum });
    }
  }

  return out;
}

/** dressPlan(plan, opts) → plan.dressing = [{slug, x, y, primary, cardKind, roomSegNum, lightAffine?}]
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
  const fingerprint = opts.walkId != null ? String(opts.walkId) : String(plan.seed || "");
  const dressing = [];
  plan.rooms.forEach((room) => {
    const seed = dspHashStr("u4-dress:" + fingerprint + ":" + room.segNum + ":" + room.x + "," + room.y);
    const rng = dspMulberry32(seed);
    dpPlaceRoom(room, plan, roster, rng).forEach((d) => dressing.push(d));
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
