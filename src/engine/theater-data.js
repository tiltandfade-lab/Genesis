/* GENESIS MODULE — src/engine/theater-data.js — BATTLE-THEATER T1 (docs/BATTLE-THEATER.md §1/§7).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   PURE DATA LAYER for the three.js battle stage. Turns the existing zone-grid combat state into two
   plain-object shapes the GL boot module (src/ui/theater-boot.js) consumes and never has to derive
   itself — "one derivation, three views: the same zone grid drives the theater, the 2D tracker grid,
   and cmbProseSummary — they can never disagree" (§1). Every function here is a pure read: takes a
   segment/combat/scene snapshot, returns a fresh object, never mutates its inputs, never touches
   GS/w/U, never calls rollDie or any RNG (placement determinism is inherited from cmZoneGrid/
   cmPlaceFoeLane's own seeded math — this layer only re-projects zone/lane coordinates it is handed).
   Headless-testable by construction (dev/verify-theater-data.mjs, jsdom, no GL). */

/* §1 tile-grid shape constants. Each band×lane zone is a 3x3 tile patch (BATTLE-THEATER.md §1's
   FFT mapping: "board IS the zone grid extruded — bands = depth rows, lanes = columns"). Tile units
   are abstract grid cells (1 tile = 1 unit); the GL layer scales to world space. */
const THEATER_PATCH = 3;             // tiles per zone edge (3x3 patch)
const THEATER_STEP = 0.5;            // one discrete height increment (§1 rule 1: half-unit steps)

/* band index -> depth row (0 = nearest the void's front edge, increasing with CM_BANDS order so
   "melee" sits at row 0 and "out" sits furthest back — mirrors the existing melee-outward convention
   the rest of combat.js uses). lane index -> column, using whatever lane subset cmZoneGrid produced
   (already centered/clamped there — this layer never re-derives lane centering). */
function theaterZoneOrigin(bandIdx, laneIdx){
  return { x: laneIdx * THEATER_PATCH, z: bandIdx * THEATER_PATCH };
}

/* a hazard's free-text `kind` -> a sink amount (0 = no sink, just a tint) + a tint override. No fixed
   hazard vocabulary exists upstream (kind is DM-narrated free text, src/world/dm.js's hazardTick
   consumers) so this is a best-effort keyword read, not a registry: water/flood-ish words sink+tint
   blue, pit/hole/chasm-ish words sink+tint dark, anything else just tints amber (a marked-but-solid
   hazard tile) without sinking. Never throws on a missing/empty kind. */
function theaterHazardVariant(kind){
  const k = String(kind || "").toLowerCase();
  if(/water|flood|swamp|bog/.test(k)) return { sink: 1, tint: "#2b5d78" };
  if(/pit|hole|chasm|collapse|sink/.test(k)) return { sink: 1, tint: "#1a1712" };
  return { sink: 0, tint: "#7a4a1e" };
}

/* zone key "band:lane" -> {bandIdx, laneIdx} against a given grid's own band/lane order. Returns null
   for a zone key that isn't actually in this grid (defensive — a stale elevZone/hazardZone entry from
   a since-shrunk room never crashes the derivation, it's just skipped). */
function theaterZoneIndex(grid, zoneKey){
  if(!grid || !zoneKey) return null;
  const parts = String(zoneKey).split(":");
  if(parts.length !== 2) return null;
  const bandIdx = (grid.bands || []).indexOf(parts[0]);
  const laneIdx = (grid.lanes || []).indexOf(parts[1]);
  if(bandIdx < 0 || laneIdx < 0) return null;
  return { bandIdx, laneIdx };
}

/* §1 THE BOARD: segment (rolled room, carries .dims) + scene ({elevZones,hazards,hazardZones,cover,
   zoneCover,exits}) -> {tiles:[{x,z,h,kind,tint}], grid:{bands,lanes,bandCount,laneCount}, props:[...]}.
   Reuses cmZoneGrid (engine.combat, same file loads earlier in manifest) for the grid derivation —
   never re-implements the dims parse. Absent cmZoneGrid (module not loaded, e.g. a narrow test
   harness) degrades to the same full-4x3 default cmZoneGrid itself falls back to, so this function
   never throws on a partial load. */
function theaterBoardFrom(segment, scene){
  scene = scene || {};
  const grid = (typeof cmZoneGrid === "function")
    ? cmZoneGrid(segment && segment.dims)
    : { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"], bandCount: 4, laneCount: 3 };
  const bands = grid.bands || [];
  const lanes = grid.lanes || [];

  // elevZones: array of "band:lane" strings (cmZoneElev's own shape) -> the set of zones raised one step.
  const elevSet = {};
  (scene.elevZones || []).forEach(zk => { elevSet[zk] = true; });

  // hazardZones: [{zone:"band:lane", kind, revealed}]. Theater renders a hazard tint/sink regardless of
  // the player-visibility gate (cmHazardVisible) — the theater is the DM's/screen's board, not the
  // player-facing DOM (BATTLEMAP.md's "hidden from the player DOM" rule lives in render.js, untouched
  // by this file). Free-standing scene.hazards (a flat array, no zone attached) are folded in only when
  // an entry names/derives a zone key; unzoned hazard notes are skipped (nothing to place them at).
  const hazardByZone = {};
  (scene.hazardZones || []).forEach(hz => {
    if(!hz || !hz.zone) return;
    hazardByZone[hz.zone] = hz;
  });

  // cover sources: scene.zoneCover ({"band:lane":"half"|"three-quarters"|"full"}) is the mechanical
  // cover-level map (engine.combat's cmZoneCover reads it); scene.cover is the older/looser tag map
  // (render.js's combatPanel just lists its keys). Both are keyed by zone string when they carry one —
  // union them into one prop-zone set so a cover marker from either source gets a prop column, without
  // guessing at a cover LEVEL for scene.cover's looser keys (those just get a generic cover prop).
  const coverZones = {};
  Object.keys(scene.zoneCover || {}).forEach(zk => { coverZones[zk] = scene.zoneCover[zk]; });
  Object.keys(scene.cover || {}).forEach(zk => { if(!(zk in coverZones)) coverZones[zk] = true; });

  const tiles = [];
  const props = [];
  for(let bi = 0; bi < bands.length; bi++){
    for(let li = 0; li < lanes.length; li++){
      const zoneKey = bands[bi] + ":" + lanes[li];
      const origin = theaterZoneOrigin(bi, li);
      const elevated = !!elevSet[zoneKey];
      const hz = hazardByZone[zoneKey];
      const variant = hz ? theaterHazardVariant(hz.kind) : null;
      const baseH = elevated ? THEATER_STEP : 0;
      // sink is relative to the FLOOR (0), not clamped there — a water/pit patch reads as visibly
      // BELOW the surrounding floor tiles (the whole legibility point of a sunk tile). An elevated
      // zone that's also hazarded (an edge case no fixture currently exercises) still nets negative
      // if the sink outweighs the raise, which is the honest reading of "this patch is now a hole."
      const h = variant ? (baseH - variant.sink * THEATER_STEP) : baseH;
      const kind = variant ? (variant.sink ? "water" : "hazard") : (elevated ? "elevated" : "floor");
      const tint = variant ? variant.tint : (elevated ? "#8a6a24" : "#4a5a3c");
      for(let tx = 0; tx < THEATER_PATCH; tx++){
        for(let tz = 0; tz < THEATER_PATCH; tz++){
          tiles.push({ x: origin.x + tx, z: origin.z + tz, h, kind, tint, zone: zoneKey });
        }
      }
      if(zoneKey in coverZones){
        props.push({
          kind: "cover", zone: zoneKey,
          x: origin.x + (THEATER_PATCH - 1) / 2, z: origin.z + (THEATER_PATCH - 1) / 2,
          level: coverZones[zoneKey] === true ? "half" : coverZones[zoneKey]
        });
      }
    }
  }

  return { tiles, props, grid: { bands, lanes, bandCount: grid.bandCount, laneCount: grid.laneCount } };
}

/* §1 archetype mapping: bestiary creatureType (data/bestiary.js tags.type, resolved onto the combat
   foe as .creatureType by cmFoeFrom) x size -> a composed-cuboid fallback archetype key. Small lookup
   table, deliberately coarse (BATTLE-THEATER.md §3: "12 archetype entries cover the 510-entry
   bestiary" is the pack-mapping's budget; the fallback tier only needs 5 buckets: biped/quadruped/
   flyer/serpent/swarm). Type wins first (a dragon is a quadruped-with-wings -> flyer only if huge/
   gargantuan reads as an actual flier is out of scope for a coarse fallback, so dragons bucket
   quadruped here — packs get the nuance in T2); untyped/unknown types default biped (humanoids, the
   modal case). */
const THEATER_ARCHETYPE_BY_TYPE = {
  humanoid: "biped", giant: "biped", fiend: "biped", celestial: "biped",
  undead: "biped", construct: "biped", aberration: "biped", fey: "biped",
  beast: "quadruped", monstrosity: "quadruped", dragon: "quadruped",
  ooze: "quadruped", plant: "quadruped", elemental: "quadruped",
  swarm: "swarm"
};
function theaterArchetypeFor(creatureType, size){
  const t = String(creatureType || "").toLowerCase();
  if(/swarm/.test(t)) return "swarm";
  if(THEATER_ARCHETYPE_BY_TYPE[t]) return THEATER_ARCHETYPE_BY_TYPE[t];
  return "biped";
}

/* deterministic within-zone offset for the Nth occupant of a shared zone — same discipline as
   combat.js's cmSeedHash-driven cmPlaceFoeLane (never Math.random, so two calls over the same
   combat produce identical offsets). Spreads occupants across the zone's inner 3x3 patch on a small
   fixed ring so multiple units sharing one band:lane don't stack exactly on the zone center. */
const THEATER_OFFSET_RING = [
  { dx: 0, dz: 0 }, { dx: 0.7, dz: 0 }, { dx: -0.7, dz: 0 },
  { dx: 0, dz: 0.7 }, { dx: 0, dz: -0.7 }, { dx: 0.5, dz: 0.5 },
  { dx: -0.5, dz: 0.5 }, { dx: 0.5, dz: -0.5 }, { dx: -0.5, dz: -0.5 }
];
function theaterWithinZoneOffset(seedKey, occupantIdx){
  if(occupantIdx <= 0) return THEATER_OFFSET_RING[0];
  const h = (typeof cmSeedHash === "function") ? cmSeedHash(seedKey + ":" + occupantIdx) : occupantIdx;
  return THEATER_OFFSET_RING[1 + (h % (THEATER_OFFSET_RING.length - 1))];
}

/* §1 THE UNITS: a live `combat` object (GS.combat shape from combatStart — .grid, .pc, .foes[],
   .pcRef) -> units[] {id, kind, archetype, x, z, down, fled}. Reads the SAME grid the board was built
   from (combat.grid, set once by combatStart) so unit coordinates line up with theaterBoardFrom's
   tile origins with no re-derivation. Occupancy counting (for the within-zone offset) is done by a
   single pass keyed on "band:lane" — first occupant of a zone gets the center, subsequent occupants
   fan out on THEATER_OFFSET_RING, in encounter order (pc first, then foes in their existing array
   order) so the result is stable across two calls on the same combat object. */
function theaterUnitsFrom(combat){
  if(!combat) return { units: [] };
  const grid = combat.grid || { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"] };
  const seenPerZone = {};
  const occupantIndex = (zoneKey) => {
    const n = seenPerZone[zoneKey] || 0;
    seenPerZone[zoneKey] = n + 1;
    return n;
  };
  const unitFor = (id, kind, archetype, band, lane, flags) => {
    const bandIdx = grid.bands.indexOf(band);
    const laneIdx = grid.lanes.indexOf(lane);
    const safeB = bandIdx >= 0 ? bandIdx : 0;
    const safeL = laneIdx >= 0 ? laneIdx : 0;
    const zoneKey = (band || grid.bands[0]) + ":" + (lane || grid.lanes[0]);
    const origin = theaterZoneOrigin(safeB, safeL);
    const center = (THEATER_PATCH - 1) / 2;
    const occIdx = occupantIndex(zoneKey);
    const off = theaterWithinZoneOffset(zoneKey, occIdx);
    return Object.assign({
      id, kind, archetype,
      x: origin.x + center + off.dx, z: origin.z + center + off.dz
    }, flags || {});
  };

  const units = [];
  if(combat.pc){
    units.push(unitFor("pc", "pc", theaterArchetypeFor((combat.pcRef && combat.pcRef.creatureType) || "humanoid", null),
      combat.pc.band, combat.pc.lane, { down: !!combat.pc.down, fled: false }));
  }
  ((combat.allies) || []).forEach((a, i) => {
    units.push(unitFor(a.id || ("ally" + (i + 1)), "ally", theaterArchetypeFor(a.creatureType, a.size),
      a.band || (combat.pc && combat.pc.band), a.lane || (combat.pc && combat.pc.lane),
      { down: !!a.down, fled: !!a.fled }));
  });
  (combat.foes || []).forEach((f, i) => {
    units.push(unitFor(f.fid || ("f" + (i + 1)), "foe", theaterArchetypeFor(f.creatureType, f.size),
      f.band, f.lane, { down: !!f.down, fled: !!f.fled }));
  });

  return { units };
}
