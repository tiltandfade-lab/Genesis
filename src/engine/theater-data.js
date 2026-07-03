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
const THEATER_STEP = 1.0;            // one discrete height increment (§1 rule 1: half-unit steps in
                                      // the FFT sense; G9 tune 2 doubled the WORLD-unit value from 0.5
                                      // -> 1.0 so a raise/sink is unmistakable at the ~35° camera —
                                      // was reading as barely-there at the old value)

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
     accent           — the ONE saturated color this env is allowed, reserved for HAZARD tiles
                         (scorch/lava-style alarm reads); never spent on plain floor or elevation
     elevTint         — the elevated-patch tint (G9 tune 2): a lightened variant of this env's
                         stone `top`, NOT `accent` — elevation must read as height, not danger */
/* G9 TUNE 1 (docs/PRE-PLAYTEST-GAUNTLET.md §10b): orchestrator verdict was "mood right, legibility
   overshot into murk" — tile TOP colors lifted ~+35% luminance (HSL-lightness scale, dungeon was the
   worst offender at lum 0.257) and `altTop` pushed FURTHER from `top` (was a ~0.03 luminance delta —
   invisible after dither; now ~0.12-0.17, a real checkerboard) so the checker is plainly visible at a
   glance. `side` colors are UNCHANGED — they were already the dark half of the top/side contrast
   mechanism (FFT rule 2) and this tune only touches the top face.
   `elevTint` (NEW field, G9 tune 2): the elevated-patch color. Previously elevated tiles borrowed
   `accent` (dungeon's is oxblood #7a2e28 — reads as a hazard/alarm, not a height cue). `elevTint` is
   a lightened variant of THIS env's (post-tune) stone `top` (~+45% HSL lightness) so a raised patch
   reads as "brighter ground, same family" — height, not danger. `accent` stays reserved for actual
   hazards (scorch/lava/the one saturated color a hazard is allowed to spend). */
const THEATER_ENV_PALETTE = {
  dungeon: {
    top: "#64564c", side: "#241f1a", altTop: "#3e352f",
    water: "#28414a", scorch: "#3a2418", prop: "#332b24",
    voidTint: "#0a0807", accent: "#7a2e28", // oxblood — hazards only
    elevTint: "#917d6e" // lightened stone top — elevation reads as height, not alarm
  },
  urban: {
    top: "#7c7467", side: "#2c2822", altTop: "#4d4840",
    water: "#31474f", scorch: "#3f2c1c", prop: "#413c34",
    voidTint: "#09090a", accent: "#6e6558", // bone/dust — hazards only
    elevTint: "#ada79c"
  },
  wilderness: {
    top: "#595d3e", side: "#22241a", altTop: "#373a26",
    water: "#274a45", scorch: "#3a2a16", prop: "#38361f",
    voidTint: "#07090a", accent: "#4d5a34", // moss — hazards only
    elevTint: "#81875a"
  },
  breach: {
    top: "#564c55", side: "#1e181c", altTop: "#352f35",
    water: "#2a3350", scorch: "#421f2c", prop: "#312a34",
    voidTint: "#0a0610", accent: "#5a3a5e", // bruised violet — the "wrongness" accent, hazards only
    elevTint: "#7d6e7b"
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
      // G9 tune 2: elevated tiles use `elevTint` (a lightened stone-top variant), NOT `accent` — accent
      // is the env's one saturated hazard color (oxblood/etc.), which read as an alarm on a plain raised
      // patch. A hazard tile still uses its own variant.tint (unaffected by this change).
      const tint = variant ? variant.tint : (elevated ? palette.elevTint : palette.top);
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
   bestiary" is the pack-mapping's budget). PASS 2 (2026-07-03, "get the shapes covered"): grows the
   fallback tier from 5 buckets to 9 — biped/quadruped/flyer/serpent/swarm/giant/ooze/arachnid/
   amorphous-horror — so the remaining bestiary shapes (giants, oozes, spider-monstrosities,
   tentacled aberrations) stop reading as generic bipeds. Type wins first; a few overrides layer on
   top of the base type->archetype table:
     - giants: `giant` type always buckets giant. A huge/gargantuan creature of an otherwise-biped
       type (humanoid/fiend/celestial/undead/construct/fey) ALSO buckets giant — a huge fiend/undead/
       construct reads as a hulking brute, not a human-proportioned figure. Excluded: aberration (it
       has its own amorphous-horror bucket regardless of size) and any name matching THEATER_QUAD_WORD_RX,
       which routes to quadruped INSTEAD (not just "skip giant, fall through to biped") — a huge
       CELESTIAL ELK or fey DIRE WORG are real bestiary rows that are animal-shaped despite their
       generically-biped-mapped type tag; the size-override's false-positive guard corrects the shape,
       not just the giant bucket.
     - arachnid: a NAME-keyword override (spider/arachnid/tarantula) that fires regardless of type,
       because the bestiary's real spider rows are tagged beast/monstrosity, not a dedicated type —
       Giant Spider/Giant Wolf Spider/Spider (beast) and Phase Spider (monstrosity) all need the
       low-wide-plus-legs read a generic quadruped bucket can't give them.
     - ooze: `ooze` type -> its own low-wide-blob archetype (previously bucketed quadruped, which put
       a black pudding on four legs — wrong silhouette entirely).
     - amorphous-horror: `aberration` type (after the arachnid name-keyword override has first claim)
       -> asymmetric mass + tentacles, the aberration-specific read a biped bucket flattened away.
   Untyped/unknown types default biped (humanoids, the modal case). */
const THEATER_ARCHETYPE_BY_TYPE = {
  humanoid: "biped", fiend: "biped", celestial: "biped",
  undead: "biped", construct: "biped", fey: "biped",
  beast: "quadruped", monstrosity: "quadruped", dragon: "quadruped",
  plant: "quadruped", elemental: "quadruped",
  giant: "giant", ooze: "ooze", aberration: "amorphous-horror",
  swarm: "swarm"
};
// biped-mapped types eligible for the "huge/gargantuan -> giant" size override (aberration is
// excluded — it already has its own amorphous-horror bucket independent of size).
const THEATER_GIANT_SIZE_TYPES = { humanoid: 1, fiend: 1, celestial: 1, undead: 1, construct: 1, fey: 1 };
const THEATER_GIANT_SIZES = { huge: 1, gargantuan: 1 };
// name-keyword guard against the size-override's real false positives (a huge celestial elk / fey
// dire worg are animal-shaped, not humanoid brutes — both are actual bestiary rows this excludes).
const THEATER_QUAD_WORD_RX = /\b(elk|worg|wolf|horse|bear|stag|hound|steed|boar|lion|tiger|panther|hyena|dog)\b/i;
// name-keyword override for spider-shaped bestiary rows tagged beast/monstrosity (no dedicated type).
const THEATER_ARACHNID_WORD_RX = /spider|arachnid|tarantula/i;

function theaterArchetypeFor(creatureType, size, name){
  const t = String(creatureType || "").toLowerCase();
  const s = String(size || "").toLowerCase();
  const n = String(name || "");
  if(/swarm/.test(t)) return "swarm";
  if(THEATER_ARACHNID_WORD_RX.test(n)) return "arachnid";
  if(t === "giant") return "giant";
  if(THEATER_GIANT_SIZE_TYPES[t] && THEATER_GIANT_SIZES[s]){
    // the size override's own false-positive guard: an animal-shaped name (elk/worg/wolf/...) on an
    // otherwise-biped-mapped type (a mistagged celestial/fey critter, e.g. Giant Elk/Dire Worg) routes
    // straight to quadruped instead of falling through to that type's generic biped default below —
    // the guard isn't just "skip the giant bucket," it's "this row is actually animal-shaped."
    if(THEATER_QUAD_WORD_RX.test(n)) return "quadruped";
    return "giant";
  }
  if(THEATER_ARCHETYPE_BY_TYPE[t]) return THEATER_ARCHETYPE_BY_TYPE[t];
  return "biped";
}

/* ============================================================================
   MODEL-GRAMMAR G2 §4b — the shape-hint resolver (the mogwai clause). "Nothing that
   exists is ever shapeless, and the part menu never gates DM invention" (Adam 2026-07-03).
   When the DM introduces an original off-bestiary creature (gen handshake / codex_add), it
   may attach a `shape` hint: {base, size, modules:[{part,anchor,params?}], channels:{},
   stance?} — picked from the CLOSED part vocabulary (data/model-recipes.js's generated
   PART_NAMES snapshot of src/ui/theater-parts.js's own PARTS registry keys, read here as a
   plain global so this classic-script file never imports the ES-module part library
   directly — the classic/module boundary stays one-way, per CLAUDE.md's architecture note).
   The DM owns the MEANING; the script owns the PARTS (parts ARE the nouns) — so this
   resolver VALIDATES every name rather than trusting freeform input: an unknown part name
   drops to nearest-known (a module with no valid part is simply omitted — §4b's own "unknown
   attachment -> omitted"; an unknown BASE body falls back to "torso-biped", the modal
   archetypes-2 default, matching Decision 6's "never worse than today"), and every drop is
   recorded in the returned `gaps[]` array — the caller (codex.js's codexAdd, the sole state
   owner) is responsible for actually writing each gap to the `shape-gaps` ledger line (this
   file stays a PURE data layer per its own header: zero GS/w/U/ledger writes of its own).
   PURE + total: never throws on a missing/malformed hint (returns the pure fallback shape),
   ANCHOR_NAMES is inlined here (not read off theater-parts.js's own export, for the same
   one-way classic/module boundary reason PART_NAMES is a generated snapshot rather than a
   live import) — kept byte-identical to that file's §2 frozen list by convention+comment. */
const THEATER_SHAPE_ANCHOR_NAMES = ["mainHand", "offHand", "back", "head", "shoulders", "base", "mount"];
const THEATER_SHAPE_FALLBACK_BASE = "torso-biped";       // the archetypes-2 modal default (Decision 6)
const THEATER_SHAPE_VALID_SIZES = { tiny: 1, small: 1, medium: 1, large: 1, huge: 1, gargantuan: 1 };

/* the real part vocabulary — data/model-recipes.js (G2's generator) snapshots
   src/ui/theater-parts.js's PARTS registry keys into a global PART_NAMES array at generation
   time specifically so this file can validate against it without an ES-module import. Absent
   (module not loaded / a narrow test harness) degrades to an empty vocabulary — every name
   then counts as unknown/gapped rather than throwing, same total-function discipline the
   rest of this file already uses for a missing cmZoneGrid/cmSeedHash. */
function theaterPartVocabulary(){
  return (typeof PART_NAMES !== "undefined" && Array.isArray(PART_NAMES)) ? PART_NAMES : [];
}

function resolveShapeHint(shape){
  const vocab = theaterPartVocabulary();
  const knownPart = (name) => vocab.indexOf(name) >= 0;
  const gaps = [];
  const hint = shape || {};

  // BASE: an unknown/missing base body drops to the archetypes-2 fallback — logged as a gap
  // (the doc's own "nearest-known drops with a shape-gaps ledger line" — a body has no real
  // "nearest" part to interpolate toward besides the universal fallback, so base drops go
  // straight to torso-biped rather than attempting a body-to-body similarity guess).
  let base = hint.base;
  if(!base || !knownPart(base)){
    if(base) gaps.push({ kind: "base", requested: base, resolved: THEATER_SHAPE_FALLBACK_BASE });
    base = THEATER_SHAPE_FALLBACK_BASE;
  }

  // SIZE: free-text but constrained to the SRD size vocabulary (matches bestiary tags.size) —
  // an unrecognized size string is dropped (not gap-logged; size isn't a part-vocabulary
  // concern) and defaults "medium", the bestiary's own modal size.
  const size = (hint.size && THEATER_SHAPE_VALID_SIZES[String(hint.size).toLowerCase()])
    ? String(hint.size).toLowerCase() : "medium";

  // MODULES: each {part, anchor, params?} entry is validated independently — an unknown part
  // is DROPPED (§4b: "unknown attachment -> omitted"), not substituted, since a module (unlike
  // a body) has no single universal nearest-equivalent; an unrecognized anchor name on an
  // otherwise-known part is also dropped (the module would never resolve to a real transform).
  // Both cases push one gaps[] entry each so the growth signal captures WHAT was asked for.
  const modules = [];
  (Array.isArray(hint.modules) ? hint.modules : []).forEach((m) => {
    if(!m || !m.part){
      return; // a malformed module entry (no part name at all) is silently dropped, no gap —
              // nothing to log a "nearest-known" against; this is authoring noise, not a real ask.
    }
    if(!knownPart(m.part)){
      gaps.push({ kind: "module", requested: m.part, anchor: m.anchor || null, resolved: null });
      return;
    }
    const anchor = (m.anchor && THEATER_SHAPE_ANCHOR_NAMES.indexOf(m.anchor) >= 0) ? m.anchor : null;
    if(!anchor){
      gaps.push({ kind: "anchor", requested: m.anchor || null, part: m.part, resolved: null });
      return;
    }
    modules.push({ part: m.part, anchor, params: m.params || undefined });
  });

  // CHANNELS: passed through as-is (§5: semantic slot names, never validated against a fixed
  // palette here — the theater's palette stack resolves an unknown channel name to its own
  // default tint at render time, same discipline theater-boot.js's renderPartInto already uses
  // for an unrecognized channel key). Always an object, never undefined.
  const channels = (hint.channels && typeof hint.channels === "object") ? Object.assign({}, hint.channels) : {};

  const stance = hint.stance || null;

  return {
    resolved: { base, size, modules, channels, stance },
    gaps,
    hadHint: !!(shape && (shape.base || (shape.modules && shape.modules.length)))
  };
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

/* §3 CLASS SILHOUETTES (PC/ally figures only — Adam 2026-07-03: "read the PC's class... silhouette
   variant"). Coarse 4-bucket read off the sheet's class string (data/srd-creator.js's 12 base-class
   names, e.g. "Fighter"/"Wizard"/"Rogue"; the creator always writes the canonical capitalized name,
   src/creator/roster.js's own display reads the same field raw) -> a stance/silhouette family the GL
   builder composes differently:
     martial  — broad stance, sword-slab or axe-wedge sidearm (Fighter/Barbarian/Monk)
     ranger   — lean/crouched stance, bow or dagger pair (Ranger/Rogue)
     caster   — flared robe-skirt lower body, staff+tip (Wizard/Sorcerer/Warlock/Druid/Bard)
     cleric   — shield slab + mace (Cleric/Paladin)
   An unrecognized/absent class name defaults "martial" (the modal no-caster, no-shield read — never
   throws/undefined). Case-insensitive so a lowercase or oddly-cased sheet value still resolves. */
const THEATER_CLASS_SILHOUETTE = {
  fighter: "martial", barbarian: "martial", monk: "martial",
  ranger: "ranger", rogue: "ranger",
  wizard: "caster", sorcerer: "caster", warlock: "caster", druid: "caster", bard: "caster",
  cleric: "cleric", paladin: "cleric"
};
function theaterClassSilhouetteFor(className){
  const c = String(className || "").toLowerCase();
  return THEATER_CLASS_SILHOUETTE[c] || "martial";
}

/* §3 WEAPON SHAPES. PC/ally figures get their weapon off the class silhouette (silhouette->weapon,
   deterministic, no bestiary text to scan); foe bipeds get theirs off a NAME/ACTION-TEXT keyword scan
   (Adam: "foe bipeds with obvious weapon words in their name/actions... get the matching slab") since
   foes have no class field — actions carries the bestiary's real attack names (cmFoeFrom's
   `actions: entry.actions || []`, each `{name, ...}`), which is where most weapon words actually live
   (e.g. "Bandit Enforcer" -> action "Mace"; the creature's own NAME rarely names its weapon). Order
   matters (first match wins): a stat block sometimes carries multiple weapon-word actions (a
   shortsword+crossbow bandit) — earliest-listed action is treated as the primary/drawn weapon, matching
   reading order top-to-bottom the way a stat block lists its actions. "none" -> the archetype's own
   builder decides (a bare fist/claw figure, no weapon slab added). */
const THEATER_CLASS_WEAPON = { martial: "sword", ranger: "bow", caster: "staff", cleric: "mace" };
function theaterWeaponForClass(silhouette){
  return THEATER_CLASS_WEAPON[silhouette] || "none";
}
// NOTE: no leading \b on the word itself — real bestiary action names are compound ("Shortsword",
// "Greataxe", "Longbow", "Greatclub") with the size/quality prefix glued directly onto the weapon
// word (no boundary between "Short" and "sword"), so a leading \b would silently never match the
// most common real rows. A trailing \b still guards against matching inside an unrelated longer word.
const THEATER_WEAPON_WORD_RX = [
  ["bow", /(cross)?bow\b/i],
  ["axe", /axe\b/i],
  ["spear", /\b(spear|pike|lance|trident|halberd|glaive)\b/i],
  ["staff", /\b(staff|quarterstaff|wand|rod)\b/i],
  ["dagger", /\b(dagger|dirk|knife)\b/i],
  ["mace", /(mace|club|hammer|flail|morningstar)\b/i],
  ["sword", /sword\b|\b(blade|rapier|scimitar|saber|falchion)\b/i]
];
function theaterWeaponForFoe(name, actions){
  const haystacks = [String(name || "")].concat(
    (actions || []).map(a => (a && a.name) || "")
  );
  for(const hay of haystacks){
    for(const [key, rx] of THEATER_WEAPON_WORD_RX){
      if(rx.test(hay)) return key;
    }
  }
  return "none";
}

/* §1 THE UNITS: a live `combat` object (GS.combat shape from combatStart — .grid, .pc, .foes[],
   .pcRef) -> units[] {id, kind, archetype, x, z, down, fled, silhouette?, weapon}. Reads the SAME
   grid the board was built from (combat.grid, set once by combatStart) so unit coordinates line up
   with theaterBoardFrom's tile origins with no re-derivation. Occupancy counting (for the within-zone
   offset) is done by a single pass keyed on "band:lane" — first occupant of a zone gets the center,
   subsequent occupants fan out on THEATER_OFFSET_RING, in encounter order (pc first, then foes in
   their existing array order) so the result is stable across two calls on the same combat object.

   PASS 2 additions (silhouette/weapon, §3): PC/allies carry `silhouette` (theaterClassSilhouetteFor
   off pcRef.class / a.class) and `weapon` derived FROM that silhouette (theaterWeaponForClass) — a
   class always implies a signature weapon read, no bestiary text to scan for the player's own side.
   Foes carry no `silhouette` (undefined; the archetype alone drives their build) and `weapon` derived
   from a name/action-text keyword scan (theaterWeaponForFoe) — "none" when no weapon word is found,
   which the GL builder reads as "no weapon slab, archetype's bare-limb read only." */
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
    const silhouette = theaterClassSilhouetteFor(combat.pcRef && combat.pcRef.class);
    units.push(unitFor("pc", "pc", theaterArchetypeFor((combat.pcRef && combat.pcRef.creatureType) || "humanoid", null),
      combat.pc.band, combat.pc.lane,
      { down: !!combat.pc.down, fled: false, silhouette, weapon: theaterWeaponForClass(silhouette) }));
      // PC minis are the future loadout-mirror unit's scope (§2 "the loadout mirror" — G3), not a
      // bestiary recipe; no recipeSlug stamped here.
  }
  ((combat.allies) || []).forEach((a, i) => {
    const silhouette = theaterClassSilhouetteFor(a.class);
    units.push(unitFor(a.id || ("ally" + (i + 1)), "ally", theaterArchetypeFor(a.creatureType, a.size, a.name),
      a.band || (combat.pc && combat.pc.band), a.lane || (combat.pc && combat.pc.lane),
      // MODEL-GRAMMAR G2: a bestiary-backed ally (a companion/sidekick resolved via resolveCreature,
      // which stamps statId — src/engine/combat.js's cmFoeFrom) carries the SAME statId->recipeSlug
      // read the foe branch below uses; an ally with no statId (a pure PC-sheet companion) gets
      // recipeSlug:null, which theater-boot.js's recipeFor treats as "no recipe" and falls through to
      // the class-silhouette archetype figure exactly as it did before this unit existed.
      { down: !!a.down, fled: !!a.fled, silhouette, weapon: theaterWeaponForClass(silhouette), recipeSlug: a.statId || null }));
  });
  (combat.foes || []).forEach((f, i) => {
    units.push(unitFor(f.fid || ("f" + (i + 1)), "foe", theaterArchetypeFor(f.creatureType, f.size, f.name),
      f.band, f.lane,
      // MODEL-GRAMMAR G2: f.statId is the bestiary id cmFoeFrom stamped when this foe resolved off a
      // real BESTIARY entry (src/engine/combat.js) — the SAME key data/model-recipes.js's generator
      // used as its recipe slug (one bestiary id, one recipe, no separate mapping table to drift). A
      // quick-stats/statless walk-on foe (statId:null) simply gets recipeSlug:null, which
      // theater-boot.js's recipeFor/figureFor chain treats as "no recipe" — falls straight through to
      // today's archetype fallback, never a broken lookup.
      { down: !!f.down, fled: !!f.fled, weapon: theaterWeaponForFoe(f.name, f.actions), recipeSlug: f.statId || null }));
  });

  return { units };
}
