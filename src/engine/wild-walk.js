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
function wwalkEncounter(){
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
    return { type:"Enemy", composition:compName, roster:compRoster, tactic:compTactic, terrain,
             category:catName, creature:walkPickFromPool(creatures), behavior, isEnemy:true,
             text:`${compName} — ${catName} (${compRoster}): ${behavior}` };
  }
  if(has("Hazard")||has("Obstacle")){ const [hn,hf]=walkPick("wilderness-hazard",1,2); return { type:"Hazard", isEnemy:false, text:`${hn} — ${hf}` }; }
  if(has("Social")||has("Interaction")){ const [entity,mood,hook]=walkPick("wilderness-contact",1,2,3); return { type:"Social", isEnemy:false, npc:{ entity, mood, hook }, text:`${entity} (${mood}) — ${hook}` }; }
  if(has("Trap")||has("Barrier")||has("Lock")){ const [obstacle,bypass]=walkPick("wilderness-problem",1,2); return { type:"Problem", isEnemy:false, text:`${obstacle} — ${bypass}` }; }
  if(has("Discovery")||has("Monument")){ const [feat,featFlavor,featTac]=walkPick("wilderness-feature",1,2,3); return { type:"Discovery", isEnemy:false, feature:feat, text:`${feat} — ${featFlavor||featTac||""}` }; }
  const [en,impact]=walkPick("wilderness-empty-result",1,2);
  return { type:"Empty", isEnemy:false, guidance:encGuide, text:`${en} — ${impact}` };
}

/* ============================================================
   PUBLIC — roll a wilderness journey → data structure
   opts: { legCount=4, biomeShiftChance=0.25, biome? }
   ============================================================ */
function rollWildernessWalk(opts){
  opts=opts||{};
  const legCount=Math.max(1, Math.min(20, opts.legCount||4));
  const shiftChance=typeof opts.biomeShiftChance==="number"?opts.biomeShiftChance:0.25;

  // starting biome (override or rolled)
  let cur = opts.biome ? { biome:opts.biome, biomeDesc:"" } : wwalkBiome();
  const startBiome=cur.biome;

  const segments=[];
  for(let i=1;i<=legCount;i++){
    if(i>1 && Math.random()<shiftChance) cur=wwalkBiome(); // the terrain changes underfoot
    const [sensory]=walkPick("wilderness-sensory",1);
    const [feature,featFlavor]=walkPick("wilderness-feature",1,2);
    const [sign,signEffect]=walkPick("wilderness-sign-of-passage",1,2);
    const [footing]=walkPick("wilderness-footing",1);
    const [d1]=walkPick("wilderness-set-dressing",1), [c1]=walkPick("wilderness-set-dressing-condition",1);
    const survival = Math.random()<0.35 ? walkPick("wilderness-survival-constraint",1)[0] : null;
    segments.push({
      num:i, id:`l${i}`, label:i===1?"Departure":"Leg", isFinale:false, biome:cur.biome, biomeDesc:cur.biomeDesc,
      encounter:wwalkEncounter(), sensory, feature:{ name:feature, flavor:featFlavor },
      signOfPassage:{ name:sign, effect:signEffect }, footing, dressing:{ name:d1, condition:c1 }, survival,
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
    areaType, dims, side, feature:{ name:arrFeature, flavor:arrFeatFlavor }, sensory:arrSensory, exits:[],
  });

  // linear route edges
  const edges=[]; for(let i=1;i<=legCount;i++) edges.push([i,i+1]);

  return {
    environment:"wilderness", legCount, segCount:legCount, startBiome,
    setup:{ biome:startBiome, biomeDesc: opts.biome?"":cur.biomeDesc },
    segments, edges,
  };
}
