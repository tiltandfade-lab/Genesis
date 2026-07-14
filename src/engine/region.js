/* GENESIS MODULE — src/engine/region.js — the land-region layer (docs/REGIONS-NAMES.md §1–2).
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Reads mapOf/codexAdd/addLedger/rollTable/slug (world.state/world.codex/engine.compiled) at call-time.

   Coarse hash-seeded region CENTERS sit one level above the hex substrate (the same "terrainAt trick":
   zero storage, unbounded, deterministic — every hex belongs to its nearest center, computed on demand,
   never precomputed/stored as geometry). The first time a node/walk lands in an untouched region cell,
   the engine rolls a WRITE-ONCE identity (name + one-line character + a flavor vector) off the compiled
   `region-identity` table and locks it to `w.regions[cellKey]` + a codex `region` record + a `canon`
   ledger line — never re-rolled once minted (REGIONS-NAMES.md §1, §0 Adam's fork: "full roll-chain on
   first touch... write-once canon").

   NOTE ON NAMING: `w.region` (singular, {q,r}) already exists — DEATH-AND-REBIRTH.md's per-world slot
   on the shared connected plane (src/world/state.js placeRegion/regionRingPos). That is a DIFFERENT
   concept (which plane-cell this whole WORLD occupies). This module's land-regions are `w.regions`
   (plural, a map keyed by cell coordinate) — many per world, geometry INSIDE one world's hex substrate.
   Do not conflate the two; do not touch `w.region`. */

/* ============================================================
   §1 GEOMETRY — coarse hash-seeded region centers over the hex substrate
   ============================================================ */
const REGION_CELL = 9;                 // hex spacing between region centers (BATCH2-GUARDRAILS H3)
const FRAY_D = 40;                     // §2 frayLevel divisor (hex distance)
const FRAY_1 = 15;                     // §2 first threshold: spice FLOOR +1 band
const FRAY_2 = 28;                     // §2 second threshold: Mythic ceiling unlocked by default

/* the region CELL a hex (q,r) belongs to: snap to the REGION_CELL grid, then hash-jitter the exact
   center within a +/-2 hex radius of that grid point (so region boundaries aren't a visible perfect
   grid) — same discipline as terrainAt's hashCoord: zero storage, stable, deterministic per world. */
function regionCellOf(q, r){
  return { cq: Math.round(q/REGION_CELL), cr: Math.round(r/REGION_CELL) };
}
function regionCellKey(cq, cr){ return cq+","+cr; }
/* the jittered center point for a region cell (deterministic per world+cell — never stored). */
function regionCenter(w, cq, cr){
  const seed=(w&&w.id)||"x";
  const jq=(hashCoord(seed+":rcq", cq, cr)-0.5)*4;   // +/-2 hex jitter on each axis
  const jr=(hashCoord(seed+":rcr", cq, cr)-0.5)*4;
  return { q: cq*REGION_CELL+jq, r: cr*REGION_CELL+jr };
}
/* regionAt(w,q,r) → the region cell a given hex belongs to. Nearest-center among the jittered center
   of the hex's own grid cell + its 8 neighbors (so a hex near a boundary can belong to a neighboring
   cell's jittered center rather than always its own snapped cell — avoids a visible perfect grid). */
function regionAt(w, q, r){
  const home=regionCellOf(q, r);
  let best=null, bestD=Infinity;
  for(let dq=-1; dq<=1; dq++){
    for(let dr=-1; dr<=1; dr++){
      const cq=home.cq+dq, cr=home.cr+dr;
      const c=regionCenter(w, cq, cr);
      const d=hexDist(q-c.q, r-c.r);
      if(d<bestD){ bestD=d; best={cq, cr, center:c}; }
    }
  }
  return { key: regionCellKey(best.cq, best.cr), cq: best.cq, cr: best.cr, center: best.center };
}

/* ============================================================
   §2 THE FRAYING RIM — frayLevel + spice floor/Mythic-ceiling thresholds
   ============================================================ */
/* frayLevel(hex) = clamp(hexDist(origin)/FRAY_D) per REGIONS-NAMES.md §2. Distance is measured from
   true world origin (0,0) — a DIFFERENT axis than hexmap.js's `_frayStart` (a rendering-radius cutoff
   derived from the visible map bounds). Do not conflate the two. */
function frayLevel(q, r){ return Math.min(1, hexDist(q, r)/FRAY_D); }
function frayBeyond1(q, r){ return hexDist(q, r) > FRAY_1; }
function frayBeyond2(q, r){ return hexDist(q, r) > FRAY_2; }

/* SPICE-RAISE §2a — the adopted spicy-world tier weights (Adam, 2026-07-06; GPT distributions
   verbatim, rim locked 0/5/25/45/25). Percentages; each row sums to 100. RETIRES the old spice-
   floor re-roll helper (removed): the tier weights ARE the floor now (fray1 has its own Grounded
   10, which the old hard floor-to-Textured would wrongly forbid). */
const SPICE_WEIGHTS = {
  baseline: { Grounded:25, Textured:25, Strange:25, Volatile:17, Mythic:8  },
  fray1:    { Grounded:10, Textured:20, Strange:35, Volatile:25, Mythic:10 },
  fray2:    { Grounded:0,  Textured:10, Strange:35, Volatile:35, Mythic:20 },
  rim:      { Grounded:0,  Textured:5,  Strange:25, Volatile:45, Mythic:25 }
};
/* spiceTierAt(q,r) -> "baseline"|"fray1"|"fray2"|"rim". null/undefined coords -> "baseline"
   (headless / unplaced node: never assume rim-ward — same default as breachFrayMod). */
function spiceTierAt(q, r){
  if(q==null || r==null) return "baseline";
  const d=hexDist(q, r);
  if(d>FRAY_D)  return "rim";
  if(d>FRAY_2)  return "fray2";
  if(d>FRAY_1)  return "fray1";
  return "baseline";
}
/* spiceBandPick(tier) -> one band, weighted by SPICE_WEIGHTS[tier] (unknown tier -> baseline). */
function spiceBandPick(tier){
  const wts=SPICE_WEIGHTS[tier]||SPICE_WEIGHTS.baseline;
  let n=Math.random()*100;
  const ladder=["Grounded","Textured","Strange","Volatile","Mythic"];
  for(let i=0;i<ladder.length;i++){ n-=wts[ladder[i]]; if(n<0) return ladder[i]; }
  return "Mythic";
}
/* spiceTierForNode(w,nodeId) — READ-ONLY tier resolve for a placed node (mirrors regionPeekNode:
   never mints, never rolls). No coords -> "baseline". */
function spiceTierForNode(w, nodeId){
  if(!w || typeof nodeXY!=="function" || typeof worldToAxial!=="function") return "baseline";
  const xy=nodeXY(w, nodeId); if(!xy) return "baseline";
  const a=worldToAxial(xy.x, xy.y);
  return spiceTierAt(a.q, a.r);
}
/* frayMythicUnlocked(q,r) — beyond FRAY_2, Mythic is unlocked "by default" per REGIONS-NAMES.md §2.
   walkSpiceBand reaches Mythic everywhere (8% baseline → 25% rim, SPICE-RAISE) — this flag stays
   forward-wiring for a future DM-facing Mythic-gate option, informational today. NULL-SAFE:
   callers that ignore it see no change. */
function frayMythicUnlocked(q, r){ return frayBeyond2(q, r); }

/* ============================================================
   §1 IDENTITY — first-touch roll, write-once canon
   ============================================================ */
/* parse the region-identity table's structured cells (docs/BATCH2-GUARDRAILS.md H2 wave-2a naming):
   [band, name, character, archetypeBias, skinBias, cultures, econTilt, spiceTilt]. Falls back to the
   flat `.text`/`.band` shape gracefully if `.cells` is absent (defensive — matches rollTable's own
   documented null-safety elsewhere in this codebase). */
function regionParseIdentityRoll(roll){
  const c=(roll&&roll.cells)||null;
  if(c){
    return {
      band: c[0]||roll.band||null,
      name: c[1]||null,
      character: c[2]||null,
      archetypeBias: c[3]||null,
      skinBias: c[4]||null,
      culturesRaw: c[5]||null,
      econTilt: c[6]||"0",
      spiceTilt: c[7]||"0",
    };
  }
  return { band: roll?roll.band:null, name: roll?roll.text:null, character:null,
    archetypeBias:null, skinBias:null, culturesRaw:null, econTilt:"0", spiceTilt:"0" };
}
/* "Thornwald + Varnic" → ["Thornwald","Varnic"] (§3: each region's identity roll assigns 2 of 12). */
function regionParseCultures(raw){
  return (raw||"").split(/\s*\+\s*/).map(s=>s.trim()).filter(Boolean);
}
/* econTilt/spiceTilt glyph strings ("0"/"+"/"++"/"-") → a small signed integer (magnitude = glyph
   count, "−" reads as -1). Used as bounded nudges, never as a hard override of existing tier logic. */
function regionTiltToInt(tilt){
  const s=(tilt||"0").trim();
  if(s==="0"||!s) return 0;
  if(/^-|−/.test(s)) return -1;   // spec's samples only ever show a single "−", no "--" — one step down
  return s.length;                // "+"→1, "++"→2, "+++"→3, "++++"→4
}

/* ============================================================
   §1b NAME-PER-WORLD GENERATOR (ADAM-REVIEW-1 §2 "Region Identity — the name-collision fix")
   ============================================================
   The region-identity row's name is BAKED (row 1 is always "The Weeping Downs") — every world that
   rolls the same row got the identical name, only the CHARACTER/vector are meant to be the row's
   fixed soul. The fix: generate the surface NAME per-world from the table's OWN authored vocabulary
   (recombined, never invented) so "the same soul, new name each universe" holds. REGION_NAME_DESCRIPTORS
   (89 entries) and REGION_NAME_SUFFIXES (12 entries) are extracted verbatim from all 100 region-identity
   rows' two-word "<Descriptor> <Landform>" names (docs/ADAM-REVIEW-1.md §2) — recombining the table's
   own words rather than hand-authoring a new bank keeps the register intact without a second G9 guess. */
const REGION_NAME_DESCRIPTORS=["Amberwood","Ashfallow","Backward","Basketwillow","Bellcast","Bloodmere","Bonewater","Bracken","Bramblewick","Broadwater","Broken Crown","Cairnroad","Cartway","Cartwright's","Chalkdown","Cindered","Coinweight","Coldflame","Coldspring","Coldwell","Contested","Coopersfield","Cornfast","Countglass","Crownward","Dovecote","Drover's","Drystone","Duelist's","Duskmeadow","Fallowfield","Fallowmere","Ferrous","Foundered","Foxglove","Glassroot","Godsgrave","Greyfen","Greystone","Guildstone","Herdsman's","Hollow Toll","Hollowmead","Hollyhock","Honeycomb","Larkfield","Larkspur","Ledger","Longfence","Millpond","Millrace","Millstone","Millwright's","Netherfield","Nettlefield","Nightwatch","Orchard","Peatcutter's","Quernstone","Quiet","Ropewalk","Rushmere","Rustbelt","Sablewood","Salt Flats","Salted","Screaming","Second Harvest","Sicklebrook","Sicklefield","Silvered","Slatehill","Slowbend","Smokewatch","Split Orchard","Stakerow","Stonehedge","Sundial","Tallgrass","Tanbark","Thornback","Tollgate","Unmapped","Waking Stones","Weeping","Wickerfen","Wickfield","Windrow","Wintermoor"];
const REGION_NAME_SUFFIXES=["Downs","Fens","Marches","Reach","Hills","Common","Vale","Verge","Weald","Plain","Coast","Table"];

/* regionGenerateName() -> "The <Descriptor> <Suffix>" — one fresh per-world draw. Pure recombination,
   no state, no dedup-across-regions (a world with many regions may repeat a combination same as the
   source table itself has no uniqueness guarantee across its own 100 rows either — not a regression). */
function regionGenerateName(){
  return "The "+pick(REGION_NAME_DESCRIPTORS)+" "+pick(REGION_NAME_SUFFIXES);
}

/* regionEnsure(w,q,r) → the region-identity record for the cell containing (q,r), rolling it ONCE on
   first touch (write-once canon) and reusing it forever after. Mints a codex `region` record + a
   `canon` ledger line on first roll only (idempotent — repeat calls for an already-minted cell are a
   pure cache read, no re-roll, no duplicate ledger/codex writes). NULL-SAFE: region-identity isn't
   compiled → returns a minimal deterministic stand-in {key,name:null,...} rather than throwing, so
   every consumer (archetype bias, skin bias, econ, culture draw) degrades to "no bias" gracefully. */
function regionEnsure(w, q, r){
  if(!w) return null;
  if(!w.regions) w.regions={};
  const at=regionAt(w, q, r);
  const existing=w.regions[at.key];
  if(existing) return existing;

  // SPICE-RAISE: region identity rolls band-first at the cell's own tier — the tier weights
  // subsume the old spice-floor re-roll (retired).
  const tier=spiceTierAt(at.center.q, at.center.r);
  let roll=(typeof rollTableSpiced==="function") ? rollTableSpiced("region-identity", tier)
          : ((typeof rollTable==="function") ? rollTable("region-identity") : null);
  const rim=frayBeyond1(at.center.q, at.center.r);   // kept: the record's rim flag (consumers unchanged)
  const parsed=regionParseIdentityRoll(roll);
  const cultures=regionParseCultures(parsed.culturesRaw);
  // ADAM-REVIEW-1 §2 name-collision fix: the SURFACE name generates per-world (regionGenerateName);
  // the row's own baked name (parsed.name) is kept only as the last-resort fallback (generator
  // unavailable / uncompiled table with no parsed name either) — never both silently returned.
  const genName=(typeof regionGenerateName==="function") ? regionGenerateName() : null;
  const rec={
    key: at.key, cq: at.cq, cr: at.cr,
    name: genName || parsed.name || "an unnamed reach",
    character: parsed.character || null,
    band: parsed.band || null,
    vector: {
      archetypeBias: parsed.archetypeBias || null,
      skinBias: parsed.skinBias || null,
      cultures: cultures,
      econTilt: regionTiltToInt(parsed.econTilt),
      spiceTilt: regionTiltToInt(parsed.spiceTilt),
    },
    rim,
    spiceTier: tier,   // SPICE-RAISE: baseline|fray1|fray2|rim — additive, queryable via peek-state
    ref: roll ? ("region-identity#"+roll.total) : null,
    mintedDay: (typeof clockOf==="function") ? (clockOf(w).day||1) : null,
  };
  w.regions[at.key]=rec;

  // codex region record (Distant-Word/recall fodder per §1) + write-once canon ledger line.
  if(typeof codexAdd==="function"){
    const id="region:"+(typeof slug==="function" ? slug(rec.name+"-"+at.key) : at.key);
    codexAdd(w, {
      id, kind:"region", name:rec.name, provenance:"rolled",
      rolled:{ character:rec.character, vector:rec.vector, ref:rec.ref },
      fields:{ desc:rec.character },
      dm:{ vector:rec.vector, cell:at.key, rim:rec.rim },
      status:{ known:false, soft:false },   // write-once canon — never recontextualized (mirrors §1's "hard" intent)
    });
    rec.codexId=id;
  }
  if(typeof addLedger==="function"){
    // TERSE by design: region minting can fire several times in one turn (prep/walk assembly touches
    // many nodes across an area, each a potential new region cell) — the full character prose lives on
    // the codex record (rec.character, queryable via peek-state.py), never in the ledger text, so a
    // burst of new-region touches can't crowd dmDigest's recentLedger (slice(-6), DIGEST-DIET's <12 KB
    // guard) the way a full-prose line per touch would. Matches the terse-canon-line convention used
    // elsewhere (e.g. codex_contact's "◆ ${name} — encountered; locked to canon.").
    addLedger(w, "canon", { kind:"region-identity", cell:at.key, name:rec.name, ref:rec.ref },
      "◆ "+rec.name+" — a region takes shape on the map.");
  }
  return rec;
}
/* convenience: resolve the region for a NODE (its world-unit x,y → axial → region), ensuring/rolling
   identity on first touch. Returns null if the node has no placed coords yet (nodeXY's own contract).
   Only call this at genuine "the player is HERE now" touch sites (seeNode, walk assembly, NPC minting
   at a node) — it MINTS (rolls + writes codex/ledger canon) if the cell is untouched. */
function regionForNode(w, nodeId){
  if(typeof nodeXY!=="function" || typeof worldToAxial!=="function") return null;
  const xy=nodeXY(w, nodeId);
  if(!xy) return null;
  const a=worldToAxial(xy.x, xy.y);
  const rec=regionEnsure(w, a.q, a.r);
  // NPC-COHERENCE-FIXES.md §2: the shared, cached region-CELL record (rec, keyed on the coarse cell
  // and reused by every node inside it) carries no fray-relevant position of its own — rollNPC/
  // sceneTemperature/role-realms hybridization all read opts.region.center.{q,r} expecting the NODE's
  // own hex position (rim = high fray), not the cell's. Attaching it here, on a shallow-copy view
  // rather than mutating the cached rec, keeps that node-specific position from leaking onto other
  // nodes sharing the same region cell while leaving every existing rec-shape consumer unaffected.
  // Null-safe: no rec -> return as-is (unreachable today, regionEnsure only returns null if !w).
  return rec ? Object.assign({}, rec, { center:{ q:a.q, r:a.r } }) : rec;
}
/* READ-ONLY counterpart: resolves a node's ALREADY-MINTED region, or null — never rolls, never writes
   canon. For price-sensitive call sites (shop tier, lodging) that must not have a random dice roll +
   ledger/codex write fire as a side effect of a plain read (e.g. re-opening an already-known shop).
   Region-derived econ nudges only apply once a region has genuinely been established through real
   first-touch play (seeNode et al.), never conjured on demand by a price lookup. */
function regionPeekNode(w, nodeId){
  if(!w || !w.regions || typeof nodeXY!=="function" || typeof worldToAxial!=="function") return null;
  const xy=nodeXY(w, nodeId);
  if(!xy) return null;
  const a=worldToAxial(xy.x, xy.y);
  const at=regionAt(w, a.q, a.r);
  return w.regions[at.key] || null;
}

/* ============================================================
   §1 VECTOR CONSUMERS — the connection: regions flavor walks/econ/names in their area
   ============================================================ */
/* regionArchetypeWeight(region, archetypeName) → a multiplier (default 1) resolveArchetypePool-style
   callers can apply to nudge a weighted pick toward the region's archetypeBias. Reads WALK_ARCHETYPES'
   own structured `types[]` (never invents a second taxonomy) and matches them against words parsed out
   of the freeform archetypeBias prose ("undead/ambusher+" → ["undead","ambusher"]). A match bumps the
   weight; no match/no bias/unknown archetype → 1 (no-op, zero-regression when a region has no identity
   yet or the archetype name isn't registered). "barrow-country ups undead" (§1) — this is that up. */
function regionArchetypeWeight(region, archetypeName){
  const bias=region&&region.vector&&region.vector.archetypeBias;
  if(!bias || typeof WALK_ARCHETYPES==="undefined") return 1;
  const entry=WALK_ARCHETYPES[archetypeName];
  if(!entry || !entry.types || !entry.types.length) return 1;
  const words=bias.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  const hit=entry.types.some(t=>words.indexOf(t.toLowerCase())>=0);
  return hit ? 1.6 : 1;
}
/* regionBiasedArchetypePool(region, archetypeName, opts, authoredPoolStr) — thin wrapper around
   resolveArchetypePool: when the region's bias matches this archetype's creature types, re-roll once
   more and keep whichever draw actually landed a bestiary (registry) pick over the authored floor —
   a soft nudge toward "the live roster," never a hard override (resolveArchetypePool's own floor
   weight stays load-bearing). No region / no match / resolveArchetypePool missing → identical to
   calling resolveArchetypePool directly (byte-compatible fallback). */
function regionBiasedArchetypePool(region, archetypeName, opts, authoredPoolStr){
  if(typeof resolveArchetypePool!=="function") return authoredPoolStr;
  const w=regionArchetypeWeight(region, archetypeName);
  const first=resolveArchetypePool(archetypeName, opts, authoredPoolStr);
  if(w<=1 || Math.random()>=(1-1/w)) return first;
  // biased re-roll: try once more, keep the second draw (a simple "roll twice, prefer weighted" nudge —
  // deliberately not a full weighted-distribution rewrite of resolveArchetypePool's internals).
  return resolveArchetypePool(archetypeName, opts, authoredPoolStr);
}

/* regionBiasedWalkSkin(region, envKind, tier) — WALK-REFRESH §3's rollWalkSkin, soft-biased by the
   region's skinBias words (freeform prose, e.g. "wet / mournful"): rolls twice when a region is
   present and keeps whichever candidate's text contains more skinBias words (ties keep the first
   roll — no bias toward re-rolling). No region / no skinBias / rollWalkSkin missing → identical
   single roll (byte-compatible fallback; a region with no identity yet never changes existing
   walk-skin behavior). HQ2-8g: `tier` is an optional 3rd param threaded straight through to both
   rolls — omitted, rollWalkSkin falls back to its own GS.walkSpiceTier default (unchanged for old
   callers, e.g. dev/verify-regions.mjs's regionBiasedWalkSkin(null,"wilderness")). */
function regionBiasedWalkSkin(region, envKind, tier){
  if(typeof rollWalkSkin!=="function") return null;
  const first=rollWalkSkin(envKind, tier);
  const bias=region&&region.vector&&region.vector.skinBias;
  if(!bias || !first) return first;
  const words=bias.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  const score=t=>{ const lt=(t||"").toLowerCase(); return words.reduce((n,wd)=>n+(lt.indexOf(wd)>=0?1:0),0); };
  const second=rollWalkSkin(envKind, tier);
  if(!second) return first;
  return (score(second.text)>score(first.text)) ? second : first;
}

/* regionEconBump(region) → a small signed tier-nudge (from econTilt, clamped to +/-1 so a single
   region can never vault a hamlet straight to a city) for callers to add to a shop/lodging tier
   before clamping to PLACE_TIERS' [0,3] range. No region/no tilt → 0 (no-op). */
function regionEconBump(region){
  const t=region&&region.vector&&region.vector.econTilt;
  if(!t) return 0;
  return Math.max(-1, Math.min(1, t>0?1:(t<0?-1:0)));
}
function regionClampTier(tier, bump){
  return Math.max(0, Math.min(3, (typeof tier==="number"?tier:0)+(bump||0)));
}

/* regionCultureDraw(region) → one of the region's 2 assigned name cultures (70%), else null (the
   caller falls back to species megatable flavor — §3: "region culture (70%) × species flavor (30%)",
   blended not replaced). No region / no cultures assigned (table not compiled yet) → always null. */
function regionCultureDraw(region){
  const cs=region&&region.vector&&region.vector.cultures;
  if(!cs || !cs.length) return null;
  if(Math.random()>=0.70) return null;
  return pick(cs);
}
/* the §3 blend rule for npcRolledName: draws a region-culture name (70% of the time a region+cultures
   are available) from NAME_CULTURES, else falls back to the existing species-pool roll untouched.
   NULL-SAFE at every layer: no region passed, no cultures assigned yet, or NAME_CULTURES not loaded
   → identical to calling npcRolledName(species,gender) directly (today's exact behavior preserved). */
function regionBlendedName(region, species, gender){
  const culture=regionCultureDraw(region);
  if(culture && typeof NAME_CULTURES!=="undefined" && NAME_CULTURES[culture]){
    const bank=NAME_CULTURES[culture];
    const pool=(gender==="female"&&bank.female&&bank.female.length) ? bank.female
              : (gender==="male"&&bank.male&&bank.male.length) ? bank.male
              : (bank.female||[]).concat(bank.male||[]);
    if(pool.length){
      const f=pick(pool);
      return (bank.family&&bank.family.length&&Math.random()<0.8) ? f+" "+pick(bank.family) : f;
    }
  }
  return (typeof npcRolledName==="function") ? npcRolledName(species, gender) : (species||"Stranger");
}

/* ============================================================
   §2 RIM-WARD PRESSURE BEARING + DISTANT-WORD CITATION BIAS
   ============================================================ */
/* the 8 compass points, matching hexmap.js's COMPASS keys — reused so a rim-ward bearing string is
   directly usable anywhere a route bearing already is (placeTravelNode et al). */
const REGION_BEARINGS=["N","NE","E","SE","S","SW","W","NW"];
/* regionRimBearing(w, aroundQ, aroundR) — "the doom has a geography": a compass bearing pointing from
   (aroundQ,aroundR) toward the highest-fray direction sampled around it (8-point compass, farthest
   hexDist-from-origin wins; ties keep the first sampled direction — deterministic order, not random).
   Defaults to origin (0,0) when no coords are given (world-gen creates external pressures before any
   node/region context exists — REGIONS-NAMES.md §2's "new/escalating external fronts take a bearing
   toward the highest-fray direction" still resolves to SOMETHING sensible: the plane's own outward
   spiral bias reads the same way as fray, both grow with hexDist-from-origin). */
function regionRimBearing(w, aroundQ, aroundR){
  const q0=aroundQ||0, r0=aroundR||0;
  const STEP=REGION_CELL;   // sample a region-cell's width outward — matches the geometry this bearing describes
  let best=REGION_BEARINGS[0], bestD=-1;
  REGION_BEARINGS.forEach(dir=>{
    const d=(typeof COMPASS!=="undefined") ? COMPASS[dir] : null;
    if(!d) return;
    const q=q0+d[0]*STEP, r=r0+d[1]*STEP;
    const dist=hexDist(q, r);
    if(dist>bestD){ bestD=dist; best=dir; }
  });
  return best;
}

/* distantWordRegionBias(w) — REGIONS-NAMES.md §2: "Distant Word's Volatile/Mythic rows preferentially
   cite rim-ward regions (the far away is the strange away)." No Distant-Word roller exists in this
   codebase yet (docs/TABLE-GAPS-070126.md §2 "rides WORLD-TURN" — unbuilt; `distant-word` compiles to
   tables.json but nothing calls rollTable("distant-word") anywhere). This is WIRING for that future
   roller: given a spice band, returns the already-minted region (from w.regions) farthest from origin
   on a Volatile/Mythic roll (rim-ward citation), else a random already-minted region (Grounded/Textured/
   Strange keep an even spread — §2 only singles out the top two bands). Returns null when w.regions is
   empty (nothing minted yet to cite) — the future caller falls back to citing no region (plain color). */
function distantWordRegionBias(w, band){
  const all=Object.values((w&&w.regions)||{});
  if(!all.length) return null;
  const rimBand = band==="Volatile" || band==="Mythic";
  if(!rimBand) return pick(all);
  return all.slice().sort((a,b)=>hexDist(b.cq*REGION_CELL,b.cr*REGION_CELL)-hexDist(a.cq*REGION_CELL,a.cr*REGION_CELL))[0];
}
