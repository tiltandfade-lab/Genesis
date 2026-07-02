/* GENESIS MODULE — src/engine/wild-walk.js — the wilderness leg-walk roller (docs/SESSION-PREP.md §2)
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Reuses the generic helpers from engine.walk — MUST load after src/engine/walk.js.

   Wilderness has no source generator (urban/dungeon were Templater ports; this is authored fresh from
   the wilderness table set + the SESSION-PREP "travel = legs" model). A journey is a LINEAR path of
   legs + an arrival/destination: each leg rolls a biome (which can shift along the way), an encounter
   (Wilderness Encounter Type → branch), and travel texture (sensory, feature, sign of passage,
   footing). Returns the journey as a data structure (legs=nodes, the route=edges). No topology, no
   threat-identity (wilderness enemy tables are self-contained). All internals `wwalk`/`WWALK_`-prefixed. */

/* ============================================================
   WILDERNESS LEG-WALK — a linear journey of travel legs
   ============================================================ */

const WILDERNESS_BIOMES = [
  "Arctic","Coastal","Desert","Forest","Grassland","Hill","Mountain","Swamp","Underdark","Jungle",
];

function wwalkBiome(){
  const rows=walkRows("wilderness-biome-type");
  if(!rows.length) return { biome:walkRnd(WILDERNESS_BIOMES), biomeDesc:"" };
  const c=walkRnd(rows)[5]||[];
  return { biome:(c[0]||"").trim(), biomeDesc:(c[1]||"").trim() };
}

// ─── encounter (Wilderness Encounter Type → branch) ──────────────────────────
// REGIONS-NAMES.md §1: optional `region` param (a w.regions[] record) softly biases the live-roster
// pick toward the region's archetypeBias ("barrow-country ups undead") via regionBiasedArchetypePool.
// No region passed / region module absent → identical to calling resolveArchetypePool directly
// (today's exact behavior preserved, byte-compatible fallback chain unchanged).
// TAROT-SESSION.md §1: optional `tarot` param (tarotVectorOf(w)) additionally biases a Swords-domain
// draw toward the live roster (composed with the region bias via tarotBiasedArchetypePool). No draw
// / tarot module absent → falls through to the region-only path (byte-compatible, unchanged).
function wwalkEncounter(tier, region, tarot){
  const [encType,encGuide]=walkPick("wilderness-encounter-type",1,2);
  const has=s=>encType.indexOf(s)>=0;
  if(has("Enemy")||has("Combat")){
    const [terrain]=walkPick("wilderness-tactical-terrain",1);
    const [compName,compRoster,compTactic]=walkPick("wilderness-enemy-composition",1,2,3);
    const [catName,creatures,behavior]=walkPick("wilderness-enemy-category",1,2,3);
    const faction=/conflict|clash|interrupt|rival/i.test(compName);
    if(faction){
      const [cat2,creatures2]=walkPick("wilderness-enemy-category",1,2);
      return { type:"Enemy", subtype:"Faction Clash", composition:compName, tactic:compTactic, terrain,
               factions:[{name:catName,creatures},{name:cat2,creatures:creatures2}], isEnemy:true,
               text:`Clash: ${catName} vs ${cat2} — ${compTactic}` };
    }
    // WALK-REFRESH §1: live roster resolution (resolveArchetypePool — registry-filtered BESTIARY ∪ the
    // authored pool as the floor); graceful fallback to walkPickFromPool if the registry isn't loaded.
    const creature=(typeof tarotBiasedArchetypePool==="function")
      ? tarotBiasedArchetypePool(tarot,"threat", region, catName, {tier:tier||1, biome:null, slot:null}, creatures)
      : ((typeof regionBiasedArchetypePool==="function")
      ? regionBiasedArchetypePool(region, catName, {tier:tier||1, biome:null, slot:null}, creatures)
      : ((typeof resolveArchetypePool==="function")
          ? resolveArchetypePool(catName, {tier:tier||1, biome:null, slot:null}, creatures) : walkPickFromPool(creatures)));
    return { type:"Enemy", composition:compName, roster:compRoster, tactic:compTactic, terrain,
             category:catName, creature, behavior, isEnemy:true,
             text:`${compName} — ${catName} (${compRoster}): ${behavior}` };
  }
  if(has("Hazard")||has("Obstacle")){ const [hn,hf]=walkPick("wilderness-hazard",1,2); return { type:"Hazard", isEnemy:false, text:`${hn} — ${hf}` }; }
  if(has("Social")||has("Interaction")){ const [entity,mood,hook]=walkPick("wilderness-contact",1,2,3); return { type:"Social", isEnemy:false, npc:{ entity, mood, hook }, text:`${entity} (${mood}) — ${hook}` }; }
  if(has("Trap")||has("Barrier")||has("Lock")){ const [obstacle,bypass]=walkPick("wilderness-problem",1,2); return { type:"Problem", isEnemy:false, text:`${obstacle} — ${bypass}` }; }
  if(has("Discovery")||has("Monument")){ const [feat,featFlavor,featTac]=walkPick("wilderness-feature",1,2,3);
    // WALK-REFRESH §2.3 — spice-gated (Strange+) chance the discovery IS a rollItem macguffin.
    const macguffin=(typeof walkIsStrangePlus==="function" && walkIsStrangePlus() && typeof rollItem==="function") ? rollItem({}) : null;
    return { type:"Discovery", isEnemy:false, feature:feat, macguffin, text:`${feat} — ${featFlavor||featTac||""}` }; }
  const [en,impact]=walkPick("wilderness-empty-result",1,2);
  return { type:"Empty", isEnemy:false, guidance:encGuide, text:`${en} — ${impact}` };
}

/* ============================================================
   PUBLIC — roll a wilderness journey → data structure
   opts: { legCount=4, biomeShiftChance=0.25, biome?, biomes?:[], kind? }
   TRAVEL-WALKS (docs/TRAVEL-WALKS.md §3): `biomes` is a per-leg array (one entry per leg, sampled
   from the hexes crossed) — when present it overrides both the single `biome` override AND the
   random biome-shift roll for that leg (the terrain IS what was sampled, not a fresh draw). Falls
   back to the existing single-`biome`/random-shift behavior when absent (frontier walks unaffected).
   `kind` passes through onto the returned walk (default "frontier") — travel() stamps "travel".
   ============================================================ */
// WALK-REFRESH §2.1 — the loot lane, closing L6 (wilderness had none). Reuses dwalkBudget/
// dwalkAssignLoot/dwalkLootSlot VERBATIM (src/engine/dungeon-walk.js) scaled by legCount as-is;
// only the presentation framing differs by environment (a small label map, no new tables).
// Graceful no-op if the dungeon-walk loot chain isn't loaded (a lean headless context).
const WWALK_LOOT_FRAME = "cache/remains/grave-goods";
function wwalkLootLane(legCount, tier){
  if(typeof dwalkBudget!=="function" || typeof dwalkAssignLoot!=="function") return null;
  const t2=tier===2;
  const order=[]; for(let i=1;i<=legCount+1;i++) order.push(i);   // legs 1..N + the arrival (finale slot)
  const depth={}; order.forEach(n=>depth[n]=n);                  // depth ~ position along the linear route
  const finaleId=legCount+1;
  const budget=dwalkBudget(legCount, t2);
  return { budget, lootByNode:dwalkAssignLoot(budget, order, depth, finaleId), finaleId };
}
function wwalkLootFor(lane, num, isFinale, hasEnemy, tier){
  if(!lane || typeof dwalkLoot!=="function") return null;
  const rarity=lane.lootByNode[num];
  const out=dwalkLoot(rarity, num, isFinale, tier===2, hasEnemy);
  out.frame=WWALK_LOOT_FRAME;                                     // presentation only — cache/remains/grave-goods
  return out;
}

function rollWildernessWalk(opts){
  opts=opts||{};
  const legCount=Math.max(1, Math.min(20, opts.legCount||4));
  const shiftChance=typeof opts.biomeShiftChance==="number"?opts.biomeShiftChance:0.25;
  const tier=Math.min(2, opts.tier||1)>=2?2:1;   // clamp to the Tier-2 cap (matches dungeon/urban)
  const biomes=Array.isArray(opts.biomes)&&opts.biomes.length?opts.biomes:null;
  const lootLane=wwalkLootLane(legCount, tier);
  const region=opts.region||null;   // REGIONS-NAMES.md §1 — the w.regions[] record for this walk's area (optional)
  const tarot=opts.tarot||null;     // TAROT-SESSION.md §1 — optional session vector (tarotVectorOf(w)); default-inert without a draw

  // starting biome (per-leg override, else single override, else rolled)
  let cur = biomes ? { biome:biomes[0], biomeDesc:"" } : (opts.biome ? { biome:opts.biome, biomeDesc:"" } : wwalkBiome());
  const startBiome=cur.biome;

  const segments=[];
  for(let i=1;i<=legCount;i++){
    if(biomes){ cur = { biome:biomes[Math.min(i-1,biomes.length-1)], biomeDesc:"" }; }
    else if(i>1 && Math.random()<shiftChance) cur=wwalkBiome(); // the terrain changes underfoot
    const [sensory]=walkPick("wilderness-sensory",1);
    const [feature,featFlavor]=walkPick("wilderness-feature",1,2);
    const [sign,signEffect]=walkPick("wilderness-sign-of-passage",1,2);
    const [footing]=walkPick("wilderness-footing",1);
    const [d1]=walkPick("wilderness-set-dressing",1), [c1]=walkPick("wilderness-set-dressing-condition",1);
    const survival = Math.random()<0.35 ? walkPick("wilderness-survival-constraint",1)[0] : null;
    const enc=wwalkEncounter(tier, region, tarot);
    // DIFFICULTY.md threat-signaling (non-optional, fiction-only): an Enemy leg telegraphs danger BEFORE
    // the player commits — the sign-of-passage IS the tell (tracks/spoor read ahead of the foe). Severity
    // scales with tier. (Richer threat-identity signals ride with the deferred wilderness-threat tables.)
    if(enc.isEnemy){ enc.tier=tier; enc.severity=tier===2?"grave":"present"; enc.signal=`${sign}: ${signEffect}`; }
    segments.push({
      num:i, id:`l${i}`, label:i===1?"Departure":"Leg", isFinale:false, biome:cur.biome, biomeDesc:cur.biomeDesc,
      encounter:enc, sensory, feature:{ name:feature, flavor:featFlavor },
      signOfPassage:{ name:sign, effect:signEffect }, footing, dressing:{ name:d1, condition:c1 }, survival,
      loot: wwalkLootFor(lootLane, i, false, enc.isEnemy, tier),
      exits:[{ targetId:`l${i+1}`, num:i+1, label:i+1>legCount?"Arrival":"Leg", isFinale:i+1>legCount }],
    });
  }

  // arrival / destination — the site the journey reaches
  const arrNum=legCount+1;
  const [areaType,dims,side]=walkPick("wilderness-area-type",1,2,3);
  const [arrFeature,arrFeatFlavor]=walkPick("wilderness-feature",1,2);
  const [arrSensory]=walkPick("wilderness-sensory",1);
  segments.push({
    num:arrNum, id:`l${arrNum}`, label:"Arrival", isFinale:true, biome:cur.biome, biomeDesc:cur.biomeDesc,
    areaType, dims, side, feature:{ name:arrFeature, flavor:arrFeatFlavor }, sensory:arrSensory,
    loot: wwalkLootFor(lootLane, arrNum, true, false, tier), exits:[],
  });

  // linear route edges
  const edges=[]; for(let i=1;i<=legCount;i++) edges.push([i,i+1]);

  return {
    environment:"wilderness", legCount, segCount:legCount, startBiome, tier,
    kind: opts.kind||"frontier",
    setup:{ biome:startBiome, biomeDesc: (opts.biome||biomes)?"":cur.biomeDesc, tier },
    // WALK-REFRESH §3 — the rolled skin (null-safe until tables-wave1 authors walk-skin-wilderness).
    // "Every walk, spice-gated" (§0 fork) — travel walks (opts.kind==="travel") get it free too, since
    // this fires unconditionally at assembly here rather than being gated on kind.
    // REGIONS-NAMES.md §1: regionBiasedWalkSkin soft-biases toward the region's skinBias words when a
    // region is present; falls back to a plain rollWalkSkin call otherwise (byte-identical to before).
    // TAROT-SESSION.md §1: tarotSpiceBiasedSkin additionally leans the roll toward the drawn card's
    // spice direction (Wands / a Major spiceNudge op) — composed with the region bias, same fallback.
    skin: (typeof tarotSpiceBiasedSkin==="function") ? tarotSpiceBiasedSkin(tarot, "wilderness", region)
        : ((typeof regionBiasedWalkSkin==="function") ? regionBiasedWalkSkin(region,"wilderness")
        : ((typeof rollWalkSkin==="function") ? rollWalkSkin("wilderness") : null)),
    segments, edges,
  };
}
