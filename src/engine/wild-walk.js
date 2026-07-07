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
// REALM-WALK-WIRING §1 — mirrors REALM-WIRING §3 exactly: a 5th `opts` param carries the active-realm
// list (opts.realms, threaded from rollWildernessWalk's own skin call site). The single-creature shape
// (wilderness has no multi-slot composition) gets the SAME realm/statId/modelKey/cr/desc/summary
// fields a realm-tagged dungeon/urban slot carries. Back-compat: opts absent/opts.realms empty →
// byte-identical to pre-unit behavior. `realmEncounterPool`/`REALM_ADJACENCY` still live in
// dungeon-walk.js (cross-family now; NOT moved this unit — reached as classic-script globals).
function wwalkEncounter(tier, region, tarot, opts){
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
    // REALM-WALK-WIRING §1 — in a breach (opts.realms non-empty), try a realm creature first (the
    // single wilderness "slot" maps to REALM_BESTIARY role "elite" — no low/boss distinction here,
    // matching wilderness's own single-creature composition). Empty/missing realm pool falls straight
    // back to the normal live-roster path below — never a dangling encounter.
    const realms=(opts&&Array.isArray(opts.realms))?opts.realms:[];
    // ANOMALY LAW §2b — the friendly-spawn roll (dungeon-walk.js's rollFriendlySpawn). Wilderness has
    // no mook/boss slot distinction (a single "elite"-role pull per leg) — never a mook slot, so this
    // is ALWAYS eligible; one roll per encounter (shared by both the realm and live-roster returns
    // below, never double-rolled).
    const spawnDisposition=(typeof rollFriendlySpawn==="function")
      ? rollFriendlySpawn(false, opts&&opts.forceFriendlySpawnRoll, opts&&opts.forceFriendlySpawnSplit) : null;
    const stampSpawn=spec=>spawnDisposition ? Object.assign(spec, { spawnDisposition, nonHostile:true }) : spec;
    if(realms.length){
      const rc=(typeof realmEncounterPool==="function") ? realmEncounterPool(realms, "elite") : null;
      // REALM-TRAITS-APPLY §1 — carry rc.traits through (graceful-absent, same law as desc/summary);
      // stampSpawn = the anomaly law's friendly-spawn wrapper (recovery merge keeps both sides).
      if(rc) return stampSpawn({ type:"Enemy", composition:compName, roster:compRoster, tactic:compTactic, terrain,
               category:catName, creature:rc.name, behavior, isEnemy:true,
               statId:rc.frame, modelKey:rc.model, cr:rc.cr, realm:rc.__realm, realmRole:rc.role||null,
               desc:rc.desc||null, summary:rc.summary||null, traits:rc.traits||null,
               text:`${compName} — ${rc.name} (${compRoster}): ${behavior}` });
    }
    // WALK-REFRESH §1: live roster resolution (resolveArchetypePool — registry-filtered BESTIARY ∪ the
    // authored pool as the floor); graceful fallback to walkPickFromPool if the registry isn't loaded.
    const wwalkPick=()=>(typeof tarotBiasedArchetypePool==="function")
      ? tarotBiasedArchetypePool(tarot,"threat", region, catName, {tier:tier||1, biome:null, slot:null}, creatures)
      : ((typeof regionBiasedArchetypePool==="function")
      ? regionBiasedArchetypePool(region, catName, {tier:tier||1, biome:null, slot:null}, creatures)
      : ((typeof resolveArchetypePool==="function")
          ? resolveArchetypePool(catName, {tier:tier||1, biome:null, slot:null}, creatures) : walkPickFromPool(creatures)));
    let creature=wwalkPick();
    // MONSTER-STORY-WIRING §1 — natural setting as a selection factor. AFTER the existing pick, if it
    // doesn't fit the leg's rolled biome, re-pick ONCE preferring a fitter (wilderness has no boss
    // slot — the unslotted 50/50 rule applies uniformly). Still a misfit after the re-pick? KEEP it
    // and stamp displaced:true — a misfit monster is a story fact, not an error.
    const settingW={env:"wilderness", biome:(opts&&opts.biome)||null};
    let displaced;
    if(typeof monsterHabitatFit==="function" && !monsterHabitatFit(creature, settingW)){
      if(Math.random()<0.5){
        const repick=wwalkPick();
        if(monsterHabitatFit(repick, settingW)) creature=repick; else { creature=repick; displaced=true; }
      } else displaced=true;
    }
    return stampSpawn({ type:"Enemy", composition:compName, roster:compRoster, tactic:compTactic, terrain,
             category:catName, creature, behavior, isEnemy:true, displaced,
             text:`${compName} — ${catName} (${compRoster}): ${behavior}` });
  }
  if(has("Hazard")||has("Obstacle")){ const [hn,hf]=walkPick("wilderness-hazard",1,2); return { type:"Hazard", isEnemy:false, text:`${hn} — ${hf}` }; }
  if(has("Social")||has("Interaction")){ const [entity,mood,hook]=walkPick("wilderness-contact",1,2,3); return { type:"Social", isEnemy:false, npc:{ entity, mood, hook }, text:`${entity} (${mood}) — ${hook}` }; }
  if(has("Trap")||has("Barrier")||has("Lock")){ const [obstacle,bypass]=walkPick("wilderness-problem",1,2); return { type:"Problem", isEnemy:false, text:`${obstacle} — ${bypass}` }; }
  if(has("Discovery")||has("Monument")){ const [feat,featFlavor,featTac]=walkPick("wilderness-feature",1,2,3);
    // SPICE-RAISE loot ratchet: spice-gated (Volatile+, was Strange+) chance the discovery IS a rollItem macguffin.
    const macguffin=(typeof walkIsVolatilePlus==="function" && walkIsVolatilePlus() && typeof rollItem==="function") ? rollItem({}) : null;
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

  // SKIN-GRANTS.md §1 — "the skin rolls FIRST": rolled ahead of every leg. "Every walk, spice-gated"
  // (§0 fork) — travel walks (opts.kind==="travel") get it free too, unconditional at assembly.
  // BREACH.md §0 wraps the existing bias chain (CENTER resolver) in the 2d10 bell + fray-shift tail
  // dispatch (breach-core, engine.breach) — a center result is byte-identical to the pre-breach chain.
  // HQ2-8 (walk-tail): the shared walkResolveSkinAndSpice tail (engine.walk) — was triplicated
  // byte-for-byte here/dungeon-walk.js/walk.js; see its own comment there. REALM-WALK-WIRING §1: the
  // active realm list this walk's encounters draw from — [] outside a breach (byte-identical to
  // before this unit), non-empty inside one (or a marooned realm walk). Threaded into every leg's
  // wwalkEncounter call below (mirrors dungeon-walk.js/walk.js).
  const { hexAt, spiceTier, skin, activeRealms } = walkResolveSkinAndSpice("wilderness", opts);

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
    // DRESSING-WIRING.md §"Behavior" 1/2: one dressing roll per LEG — {text,condition} (the shape
    // theaterSegmentFeatureText/theaterPropForText and activeWalkDigest both key off, matching
    // dungeon-walk.js's/walk.js's own dressing rolls added alongside this one). Previously rolled
    // here under a `name` key (wiring-sweep-A) but never joined the theater text pool or the
    // digest — this is the field-shape fix + the actual wiring, not a new roll.
    const [d1]=walkPick("wilderness-set-dressing",1), [c1]=walkPick("wilderness-set-dressing-condition",1);
    // DRESSING-ATMOSPHERE.md: one atmo roll per LEG (air/odor/sound, uniform lane pick), same
    // shape/cadence as the dressing roll immediately above.
    const legAtmo=walkRollAtmo("wilderness");
    const survival = Math.random()<0.35 ? walkPick("wilderness-survival-constraint",1)[0] : null;
    // MONSTER-STORY-WIRING §1 — the leg's own rolled biome rides along opts so wwalkEncounter can
    // check habitat fit against the CURRENT terrain (additive key on the same opts object realms
    // already uses; absent/undefined biome degrades to "no filter", same as an unknown biome word).
    const enc=wwalkEncounter(tier, region, tarot, {realms:activeRealms, biome:cur.biome});
    // DIFFICULTY.md threat-signaling (non-optional, fiction-only): an Enemy leg telegraphs danger BEFORE
    // the player commits — the sign-of-passage IS the tell (tracks/spoor read ahead of the foe). Severity
    // scales with tier. (Richer threat-identity signals ride with the deferred wilderness-threat tables.)
    if(enc.isEnemy){ enc.tier=tier; enc.severity=tier===2?"grave":"present"; enc.signal=`${sign}: ${signEffect}`; }
    // WIRING-SWEEP-A §7 (docs/WIRING-MAP.md item 9): wilderness-interactable-object — the same
    // segment object lane dungeon-walk.js already wires for dungeons. Null-safe.
    const interactable=(typeof walkPickInteractable==="function") ? walkPickInteractable("wilderness") : null;
    // WIRING-SWEEP-A §5 (docs/WIRING-MAP.md item 10): region-encounter — an additive regional-flavor
    // roll, gated on `region` actually being present (null region -> null, byte-identical fallback).
    const regionEncounter=(typeof regionEncounterRoll==="function") ? regionEncounterRoll(region) : null;
    // WIRING-SWEEP-B §7 (docs/WIRING-MAP.md item 16, world.wiring-b): wilderness-active-magic +
    // wilderness-art give wilderness legs the same ambient-texture parity urban/dungeon already
    // carry (dungeon-art-motif/urban-art-motif) — both chance-gated (0.35, matching the survival
    // constraint's own ambient convention), both null-safe.
    const activeMagic=(typeof wwalkActiveMagicRoll==="function") ? wwalkActiveMagicRoll() : null;
    const artFind=(typeof wwalkArtRoll==="function") ? wwalkArtRoll() : null;
    // LIGHTING (docs/BATTLE-THEATER.md follow-up): seeded off this leg's own id + "light". Text pool
    // reads the leg's OWN feature/sensory text (the closest free-text a wilderness leg carries) for
    // the keyword override.
    const light=walkRollLight("wilderness", `l${i}:light`, [feature, featFlavor, sensory].filter(Boolean).join(" "));
    segments.push({
      num:i, id:`l${i}`, label:i===1?"Departure":"Leg", isFinale:false, biome:cur.biome, biomeDesc:cur.biomeDesc,
      encounter:enc, sensory, feature:{ name:feature, flavor:featFlavor }, light,
      signOfPassage:{ name:sign, effect:signEffect }, footing, dressing:{ text:d1, condition:c1 }, atmo:legAtmo, survival,
      interactable, regionEncounter, activeMagic, artFind,
      loot: wwalkLootFor(lootLane, i, false, enc.isEnemy, tier),
      exits:[{ targetId:`l${i+1}`, num:i+1, label:i+1>legCount?"Arrival":"Leg", isFinale:i+1>legCount }],
    });
  }

  // arrival / destination — the site the journey reaches
  const arrNum=legCount+1;
  const [areaType,dims,side]=walkPick("wilderness-area-type",1,2,3);
  const [arrFeature,arrFeatFlavor]=walkPick("wilderness-feature",1,2);
  const [arrSensory]=walkPick("wilderness-sensory",1);
  // DRESSING-WIRING.md §"Behavior" 1: arrival carries a `.feature` field the same as every other leg
  // (unlike urban's finale, which carries none) — dressing follows that same precedent rather than
  // treating arrival as feature-less.
  const [arrDressText]=walkPick("wilderness-set-dressing",1), [arrDressCond]=walkPick("wilderness-set-dressing-condition",1);
  // DRESSING-ATMOSPHERE.md: arrival carries atmo the same as every other leg (mirrors the
  // dressing precedent above — wilderness arrival is not exempted the way urban finales are).
  const arrAtmo=walkRollAtmo("wilderness");
  const arrLight=walkRollLight("wilderness", `l${arrNum}:light`, [arrFeature, arrFeatFlavor, arrSensory].filter(Boolean).join(" "));
  segments.push({
    num:arrNum, id:`l${arrNum}`, label:"Arrival", isFinale:true, biome:cur.biome, biomeDesc:cur.biomeDesc,
    areaType, dims, side, feature:{ name:arrFeature, flavor:arrFeatFlavor }, sensory:arrSensory, light:arrLight,
    dressing:{ text:arrDressText, condition:arrDressCond }, atmo:arrAtmo,
    loot: wwalkLootFor(lootLane, arrNum, true, false, tier), exits:[],
  });

  // linear route edges
  const edges=[]; for(let i=1;i<=legCount;i++) edges.push([i,i+1]);

  const walk = {
    environment:"wilderness", legCount, segCount:legCount, startBiome, tier,
    kind: opts.kind||"frontier",
    setup:{ biome:startBiome, biomeDesc: (opts.biome||biomes)?"":cur.biomeDesc, tier },
    // WALK-REFRESH §3 — the rolled skin (null-safe until tables-wave1 authors walk-skin-wilderness).
    skin,
    spiceTier,   // SPICE-RAISE: the walk's region spice tier (baseline|fray1|fray2|rim), stamped above
    segments, edges,
  };
  // SKIN-GRANTS.md §1/§1b — pay the skin's promise through rolled machinery + thread the motif kit.
  // Travel walks (opts.kind==="travel") get grants/motifs too — same unconditional assembly-time call.
  const out = (typeof applySkinGrants==="function") ? applySkinGrants(walk, skin, opts.world||null) : walk;
  // SCENE-RISK-CONTRACT §4.4 — stamp the fairness contract AFTER grants; travel walks get NO exemption.
  return (typeof sceneRiskOf==="function") ? sceneRiskOf(out, opts.world||null) : out;
}
