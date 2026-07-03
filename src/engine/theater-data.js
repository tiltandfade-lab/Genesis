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

/* T1.5 PSX GRIT PASS (docs/BATTLE-THEATER.md ruling extended 2026-07-03 by Adam: "gritty PS1 —
   Vagrant Story surface feel, FFT board grammar; kill the clean/cartoon read"). ENV -> palette
   table, pure data so it stays jsdom-testable (dev/verify-theater-data.mjs) with zero GL coupling.
   Each palette is a DESATURATED earth pairing: oxblood/steel/bone/moss mood, low saturation, ONE
   accent color per env (never more — that's what keeps it grim instead of colorful). Fields:
     top / side       — the tile column's default floor top/side pair (§1 rule 2's top!=side trick)
     altTop           — a second top tone for the checker alternation (rule 2 again, "stronger
                         top-face checker alternation... the FFT reference's legibility trick")
     water            — sunk/hazard-water tint (theaterHazardVariant's water branch reads this)
     scorch           — burn/scorch-mark tint (terrain_change's future "burn" op, T4; also used here
                         as the non-water/pit hazard tint so a caltrops-style hazard reads in-palette)
     prop             — cover/prop column tint (rocks, rubble, crates — replaces the old flat brown)
     voidTint         — the GL void background for this env (near-black, palette-tinted, not pure
                         0x000000 — keeps every env's void a hair different so a screenshot can tell
                         dungeon void from breach void even with nothing else on screen)
     accent           — the ONE saturated color this env is allowed (elevated/marked tiles use it
                         sparingly; never spent on plain floor) */
const THEATER_ENV_PALETTE = {
  dungeon: {
    top: "#4a4038", side: "#241f1a", altTop: "#413830",
    water: "#28414a", scorch: "#3a2418", prop: "#332b24",
    voidTint: "#0a0807", accent: "#7a2e28" // oxblood
  },
  urban: {
    top: "#5c564c", side: "#2c2822", altTop: "#524c43",
    water: "#31474f", scorch: "#3f2c1c", prop: "#413c34",
    voidTint: "#09090a", accent: "#6e6558" // bone/dust
  },
  wilderness: {
    top: "#42452e", side: "#22241a", altTop: "#3a3c28",
    water: "#274a45", scorch: "#3a2a16", prop: "#38361f",
    voidTint: "#07090a", accent: "#4d5a34" // moss
  },
  breach: {
    top: "#40383f", side: "#1e181c", altTop: "#382f36",
    water: "#2a3350", scorch: "#421f2c", prop: "#312a34",
    voidTint: "#0a0610", accent: "#5a3a5e" // bruised violet — the "wrongness" accent
  }
};
const THEATER_DEFAULT_ENV = "dungeon";

/* env key -> its palette, defaulting cleanly on an unknown/absent key (never throws, never returns
   undefined — every caller can treat this as total). */
function theaterPaletteFor(env){
  return THEATER_ENV_PALETTE[env] || THEATER_ENV_PALETTE[THEATER_DEFAULT_ENV];
}

/* band index -> depth row (0 = nearest the void's front edge, increasing with CM_BANDS order so
   "melee" sits at row 0 and "out" sits furthest back — mirrors the existing melee-outward convention
   the rest of combat.js uses). lane index -> column, using whatever lane subset cmZoneGrid produced
   (already centered/clamped there — this layer never re-derives lane centering). */
function theaterZoneOrigin(bandIdx, laneIdx){
  return { x: laneIdx * THEATER_PATCH, z: bandIdx * THEATER_PATCH };
}

/* a hazard's free-text `kind` -> a sink amount (0 = no sink, just a tint) + a tint override, read off
   the env's own palette (T1.5: no more hardcoded tints — every hazard color is now palette-derived,
   so a dungeon water tile and a wilderness water tile read as the SAME env's palette family, not a
   universal blue). No fixed hazard vocabulary exists upstream (kind is DM-narrated free text,
   src/world/dm.js's hazardTick consumers) so this is a best-effort keyword read, not a registry:
   water/flood-ish words sink+tint to the palette's water color, pit/hole/chasm-ish words sink+tint
   near-black (always near-black regardless of env — a hole reads as void everywhere), anything else
   just tints to the palette's scorch color (a marked-but-solid hazard tile) without sinking. Never
   throws on a missing/empty kind or palette. */
function theaterHazardVariant(kind, palette){
  const p = palette || theaterPaletteFor();
  const k = String(kind || "").toLowerCase();
  if(/water|flood|swamp|bog/.test(k)) return { sink: 1, tint: p.water };
  if(/pit|hole|chasm|collapse|sink/.test(k)) return { sink: 1, tint: "#1a1712" };
  return { sink: 0, tint: p.scorch };
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
   zoneCover,exits}) + opts ({env}) -> {tiles:[{x,z,h,kind,tint,altTop,zone}], grid:{bands,lanes,
   bandCount,laneCount}, props:[...], env}. Reuses cmZoneGrid (engine.combat, same file loads earlier
   in manifest) for the grid derivation — never re-implements the dims parse. Absent cmZoneGrid
   (module not loaded, e.g. a narrow test harness) degrades to the same full-4x3 default cmZoneGrid
   itself falls back to, so this function never throws on a partial load.
   T1.5: opts.env (default THEATER_DEFAULT_ENV, "dungeon") selects the palette (theaterPaletteFor) —
   every tint below now reads off that palette instead of a hardcoded literal. Each tile also carries
   `altTop` (bool): a checkerboard flag ((tileX+tileZ) parity, computed in WORLD tile coordinates so
   the pattern is continuous across zone boundaries, not just within one zone's 3x3 patch) the GL
   layer uses to alternate between the palette's `top`/`altTop` colors on plain floor tiles — §1 rule
   2's "stronger top-face checker alternation... the FFT reference's legibility trick". Hazard/
   elevated/water tiles keep their own single tint (the checker only applies to plain floor, so a
   hazard patch still reads as one solid warning color, not diluted by alternation). */
function theaterBoardFrom(segment, scene, opts){
  scene = scene || {};
  opts = opts || {};
  const env = opts.env || THEATER_DEFAULT_ENV;
  const palette = theaterPaletteFor(env);
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
      const variant = hz ? theaterHazardVariant(hz.kind, palette) : null;
      const baseH = elevated ? THEATER_STEP : 0;
      // sink is relative to the FLOOR (0), not clamped there — a water/pit patch reads as visibly
      // BELOW the surrounding floor tiles (the whole legibility point of a sunk tile). An elevated
      // zone that's also hazarded (an edge case no fixture currently exercises) still nets negative
      // if the sink outweighs the raise, which is the honest reading of "this patch is now a hole."
      const h = variant ? (baseH - variant.sink * THEATER_STEP) : baseH;
      const kind = variant ? (variant.sink ? "water" : "hazard") : (elevated ? "elevated" : "floor");
      const tint = variant ? variant.tint : (elevated ? palette.accent : palette.top);
      for(let tx = 0; tx < THEATER_PATCH; tx++){
        for(let tz = 0; tz < THEATER_PATCH; tz++){
          const wx = origin.x + tx, wz = origin.z + tz;
          // checker alternation is WORLD-coordinate parity (continuous across zone seams), and only
          // applies to plain, unmarked floor — a hazard/elevated tile stays one solid warning color
          // so the checker never competes with the "something is different here" signal.
          const altTop = (kind === "floor") && (((wx + wz) % 2) !== 0);
          const faceTint = altTop ? palette.altTop : tint;
          tiles.push({ x: wx, z: wz, h, kind, tint: faceTint, altTop, zone: zoneKey });
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

  return {
    tiles, props, env,
    grid: { bands, lanes, bandCount: grid.bandCount, laneCount: grid.laneCount }
  };
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
