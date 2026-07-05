/* GENESIS MODULE — src/engine/walk.js — the segment walk-roller (docs/SESSION-PREP.md §2)
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Reads the compiled tables (window.GENESIS_TABLES, via row[5] = structured cells) at call-time.

   Ported from the Obsidian Templater "Urban Procedure v3.1 Generator" into the Genesis engine:
   picks a TOPOLOGY (16 graph shapes, each a pacing grammar), builds the segment graph, assigns
   each node a label, rolls the matching segment sub-table (dedup + overflow), an encounter, and a
   scene frame, then returns the walk as a DATA STRUCTURE (segments=nodes, transitions=edges) — the
   sub-map + prep payload for the Session-Prep synthesis pass. No file/canvas output (that was the
   Obsidian half). All internals are `walk`/`WALK_`-prefixed to avoid shared-scope collisions. */

/* ============================================================
   SEGMENT WALK-ROLLER — the emergence backbone (cheap, pure dice)
   ============================================================ */

const URBAN_TOPOLOGIES = [
  "The Trail", "The Web", "The Mosaic", "The Shell Game",
  "The Turf", "The Layer Cake", "The Stronghold", "The Gauntlet",
  "The Rundown", "The Carousel", "The Stakeout", "The Crucible",
  "The Double Cross", "The Tightrope", "The Ratchet", "The Fracture",
];

// ─── composition slot map (which CR slots an enemy composition pulls) ─────────
const WALK_SLOT_MAP = {
  "The Crowd": ["low"], "The Gang": ["low"], "Enforcers & Watch": ["mid","low"],
  "The Ambush": ["mid"], "Boss & Muscle": ["boss","low"], "Boss & Guard": ["boss","mid"],
  "The Spellcaster & Allies": ["mid","low"], "The Elite Pair": ["mid"],
  "The Solo Threat": ["boss"], "Factional Conflict": null,
};

const WALK_TOPOLOGY_MIN_SEGS = {
  "The Trail": 2, "The Web": 3, "The Mosaic": 3, "The Shell Game": 2,
  "The Turf": 3, "The Layer Cake": 3, "The Stronghold": 3, "The Gauntlet": 3,
  "The Rundown": 2, "The Carousel": 3, "The Stakeout": 3, "The Crucible": 2,
  "The Double Cross": 3, "The Tightrope": 3, "The Ratchet": 3, "The Fracture": 4,
};

const WALK_TOPOLOGY_FALLBACK = {
  "The Web": "The Trail", "The Mosaic": "The Trail",
  "The Turf": "The Trail", "The Layer Cake": "The Trail", "The Stronghold": "The Trail",
  "The Gauntlet": "The Rundown",
  "The Carousel": "The Crucible", "The Stakeout": "The Rundown",
  "The Fracture": "The Double Cross", "The Double Cross": "The Crucible",
  "The Tightrope": "The Crucible", "The Ratchet": "The Rundown",
};

const WALK_TOPOLOGY_LABELS = {
  "The Trail":        { seq: ["Opening","Lead","Lead","Lead","Lead","Hub"], finale: "Finale" },
  "The Mosaic":       { seq: ["Fragment","Fragment","Fragment","Fragment","Cold Scene"], finale: "Revelation" },
  "The Carousel":     { seq: ["Arrival","Event Scene","Event Scene","Event Scene","Hub","Event Scene","Event Scene","Event Scene"], finale: "Climax" },
  "The Crucible":     { seq: ["Containment","Pressure","Pressure","Pressure","Event Scene","Pressure","Pressure","Pressure"], finale: "Release" },
  "The Tightrope":    { seq: ["Introduction","Faction Scene","Faction Scene","Faction Scene","Hub","Faction Scene","Faction Scene","Faction Scene"], finale: "Reckoning" },
  "The Gauntlet":     { seq: ["Start","Waypoint","Waypoint","Waypoint","Escalation","Waypoint","Waypoint","Waypoint"], finale: "Haven" },
  "The Rundown":      { seq: ["Spark","Escalation","Escalation","Escalation","Hub","Escalation","Escalation","Escalation","Event Scene"], finale: "Breaking Point" },
  "The Shell Game":   { seq: ["Cold Scene","Cold Scene","Warm Scene","Hot Scene","Hot Scene"], finale: "Finale" },
  "The Layer Cake":   { layers: ["Surface","Surface","Threshold","Inner","Inner","Inner"], finale: "Core" },
  "The Stronghold":   { layers: ["Approach","Approach","Outer Ring","Inner Ring","Inner Ring"], finale: "Sanctum" },
  "The Stakeout":     { seq: ["Setup","Watch","Watch","Incident","Incident","Incident"], finale: "Payoff" },
  "The Ratchet":      { seq: ["Open","Open","Narrowing","Narrowing","Narrowing","Narrowing"], finale: "Cornered" },
  "The Web":          { seq: ["Opening","Core Lead","Core Lead","Core Lead","Core Lead","Core Lead"], branch: "Side Lead", finale: "Finale" },
  "The Turf":         { hub: "Hub", spokeSeq: ["Excursion","Excursion","Excursion","Surface","Excursion","Excursion","Excursion","Event Scene"], finale: "Finale" },
  "The Double Cross": { pathA: "Path A", pathB: "Path B", opening: "Opening", convergence: "Convergence", finale: "Finale" },
  "The Fracture":     { opening: "Opening", splitPoint: "Split Point", threadA: "Thread A", threadB: "Thread B", reunion: "Reunion", finale: "Finale" },
};

// Encounter weights — order: Enemy, Social, Problem, Hazard, Commerce, Spectacle, Rumor, Empty
const WALK_ENCOUNTER_WEIGHTS = {
  "The Trail":[10,20,15,5,5,5,30,10], "The Web":[15,20,10,5,10,10,20,10], "The Mosaic":[10,15,10,10,10,15,25,5],
  "The Shell Game":[15,20,15,5,10,5,20,10], "The Turf":[15,20,10,5,15,10,15,10], "The Layer Cake":[15,15,20,10,5,5,15,15],
  "The Stronghold":[25,10,20,15,5,0,10,15], "The Gauntlet":[30,5,15,20,0,5,5,20], "The Rundown":[25,5,15,20,0,10,10,15],
  "The Carousel":[15,15,10,10,10,25,10,5], "The Stakeout":[20,15,10,10,5,5,25,10], "The Crucible":[20,25,15,10,5,5,10,10],
  "The Double Cross":[20,15,15,10,10,5,15,10], "The Tightrope":[15,30,5,5,15,10,15,5], "The Ratchet":[25,10,15,15,5,5,10,15],
  "The Fracture":[20,15,15,10,10,5,15,10],
};
const WALK_ENCOUNTER_BRANCHES = ["Enemy","Social","Problem","Hazard","Commerce","Spectacle","Rumor","Empty"];

const WALK_HEAT_START = {
  "The Trail":0,"The Web":0,"The Mosaic":0,"The Shell Game":1,"The Turf":0,"The Layer Cake":0,
  "The Stronghold":1,"The Gauntlet":2,"The Rundown":3,"The Carousel":0,"The Stakeout":0,"The Crucible":1,
  "The Double Cross":0,"The Tightrope":1,"The Ratchet":1,"The Fracture":0,
};
const WALK_HEAT_GUIDANCE = {
  "The Trail":"Heat = exposure: the target learns you're asking questions.",
  "The Web":"Side leads don't generate Heat; core leads do.",
  "The Mosaic":"Heat is fragmented — fragments may track Heat independently.",
  "The Shell Game":"Heat means the target knows you're following. They move faster.",
  "The Turf":"Heat accumulates in the district. The Hub becomes less safe.",
  "The Layer Cake":"Each layer has its own Heat. Surface Heat doesn't reach Inner.",
  "The Stronghold":"Heat is expected. Starts at 1. Reaching 3 triggers lockdown.",
  "The Gauntlet":"Starts at Heat 2. Every segment risks +1. A pressure cooker.",
  "The Rundown":"Heat is the default — you're already Burning (Heat 3).",
  "The Carousel":"Heat = attention during a public event. Burning = the crowd turns.",
  "The Stakeout":"Heat = blown cover. 1 = suspicious, 3 = they know.",
  "The Crucible":"Heat = tension between trapped NPCs. Burning = someone snaps.",
  "The Double Cross":"Heat on one path doesn't affect the other unless they converge.",
  "The Tightrope":"Heat is faction-specific. Angering one raises Heat with them only.",
  "The Ratchet":"Heat only goes up. No resets. That's the whole point.",
  "The Fracture":"Threads track Heat independently. Reunion takes the higher value.",
};
const WALK_TOPOLOGY_POSTURE = {
  "The Trail":"Investigative","The Web":"Investigative","The Mosaic":"Investigative","The Shell Game":"Investigative",
  "The Turf":"Navigational","The Layer Cake":"Navigational","The Stronghold":"Navigational","The Gauntlet":"Navigational",
  "The Rundown":"Reactive","The Carousel":"Reactive","The Stakeout":"Reactive","The Crucible":"Reactive",
  "The Double Cross":"Competitive","The Tightrope":"Competitive","The Ratchet":"Competitive","The Fracture":"Competitive",
};
const WALK_FINALE_DEFAULTS = {
  "The Trail":"Discovery","The Web":"Discovery","The Mosaic":"Discovery","The Shell Game":"Discovery","The Layer Cake":"Discovery",
  "The Turf":"Discovery","The Stronghold":"Combat","The Gauntlet":"Combat","The Rundown":"Combat","The Ratchet":"Combat",
  "The Stakeout":"Social","The Crucible":"Social","The Tightrope":"Social","The Double Cross":"Social",
  "The Carousel":"Discovery","The Fracture":"Discovery",
};

// label → segment sub-table compiled id
const WALK_LABEL_TO_SUBTABLE = {
  "Opening":"urban-segment-opening","Arrival":"urban-segment-opening","Start":"urban-segment-opening",
  "Setup":"urban-segment-opening","Introduction":"urban-segment-opening","Containment":"urban-segment-opening",
  "Lead":"urban-segment-lead","Core Lead":"urban-segment-lead","Side Lead":"urban-segment-side-lead",
  "Fragment":"urban-segment-fragment","Cold Scene":"urban-segment-cold-scene","Warm Scene":"urban-segment-warm-scene",
  "Hot Scene":"urban-segment-hot-scene","Hub":"urban-segment-hub","Excursion":"urban-segment-excursion",
  "Surface":"urban-segment-surface","Threshold":"urban-segment-threshold","Inner":"urban-segment-inner",
  "Core":"urban-segment-inner","Inner Ring":"urban-segment-inner","Approach":"urban-segment-approach",
  "Outer Ring":"urban-segment-approach","Waypoint":"urban-segment-waypoint","Spark":"urban-segment-escalation",
  "Escalation":"urban-segment-escalation","Pressure":"urban-segment-escalation","Event Scene":"urban-segment-event-scene",
  "Watch":"urban-segment-event-scene","Incident":"urban-segment-event-scene","Path A":"urban-segment-path",
  "Path B":"urban-segment-path","Thread A":"urban-segment-path","Thread B":"urban-segment-path","Open":"urban-segment-path",
  "Faction Scene":"urban-segment-faction-scene","Narrowing":"urban-segment-faction-scene",
  "Convergence":null,"Split Point":null,"Reunion":null,
};
const WALK_SUBTABLE_OVERFLOW = {
  "urban-segment-opening":"urban-segment-event-scene","urban-segment-lead":"urban-segment-side-lead",
  "urban-segment-side-lead":"urban-segment-lead","urban-segment-fragment":"urban-segment-cold-scene",
  "urban-segment-cold-scene":"urban-segment-fragment","urban-segment-warm-scene":"urban-segment-hot-scene",
  "urban-segment-hot-scene":"urban-segment-warm-scene","urban-segment-hub":"urban-segment-surface",
  "urban-segment-excursion":"urban-segment-waypoint","urban-segment-surface":"urban-segment-hub",
  "urban-segment-threshold":"urban-segment-approach","urban-segment-inner":"urban-segment-threshold",
  "urban-segment-approach":"urban-segment-threshold","urban-segment-waypoint":"urban-segment-excursion",
  "urban-segment-escalation":"urban-segment-event-scene","urban-segment-event-scene":"urban-segment-escalation",
  "urban-segment-path":"urban-segment-excursion","urban-segment-faction-scene":"urban-segment-event-scene",
};
const WALK_FRAME_FULL  = ["Enemy","Hazard","Problem"];
const WALK_FRAME_LIGHT = ["Social","Commerce","Spectacle"];

// ─── table access (compiled rows: [lo,hi,band,txt,frag,cells]) ────────────────
function walkTables(){ return (typeof window!=="undefined" && window.GENESIS_TABLES) || {}; }
function walkRows(id){ const t=walkTables()[id]; return (t&&t.rows)?t.rows:[]; }
function walkRnd(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
// cells of a random row, indexed by the ORIGINAL md column (col0=die → cells[i-1])
function walkPick(id, ...cols){
  const rows=walkRows(id);
  if(!rows.length) return cols.map(()=> "");
  const cells=walkRnd(rows)[5]||[];
  return cols.map(i => (cells[i-1]||"").trim());
}
// DRESSING-ATMOSPHERE.md: the mega tables' air/odor/sound lanes, one per env, keyed to their
// EXACT compiled table ids (verified against tables.js — no recompile needed for this unit).
// A separate `atmo` field, NOT folded into the existing sensory walkPick (that roll is untouched).
const WALK_ATMO_TABLES = {
  dungeon:   { air:"d100-air-currents",          odor:"d100-odors",              sound:"d100-unexplained-sounds-and-weird-noises" },
  urban:     { air:"d20-urban-air-currents",     odor:"d20-urban-odors",         sound:"d100-urban-sounds-and-weird-noises" },
  wilderness:{ air:"d100-wind-weather-currents", odor:"d100-wilderness-odors",   sound:"d100-wilderness-unexplained-sounds-and-weird-noises" } };
// One lane per room/leg/segment (uniform pick among air/odor/sound), rolled once and persisted
// on the segment like dressing/feature — null-safe (unknown env or empty table -> null).
function walkRollAtmo(env){
  const lanes=WALK_ATMO_TABLES[env]; if(!lanes) return null;
  const lane=walkRnd(["air","odor","sound"]);
  const [text]=walkPick(lanes[lane],1);
  return text ? { lane, text } : null;
}
function walkPickFromPool(str){
  const opts=(str||"").split(/\s*\/\s*/).map(s=>s.trim()).filter(Boolean);
  return opts.length ? walkRnd(opts) : (str||"[creature?]");
}
function walkWeighted(weights, labels){
  const total=weights.reduce((a,b)=>a+b,0); let r=Math.random()*total;
  for(let i=0;i<weights.length;i++){ r-=weights[i]; if(r<=0) return labels[i]; }
  return labels[labels.length-1];
}

/* WALK-REFRESH §2.3 — the standard spice curve (1–66 Grounded · 67–86 Textured · 87–95 Strange ·
   96–99 Volatile · 100 Mythic), independent of any single compiled table's row-band (the discovery/
   feature tables this gates aren't themselves spice-graded). walkIsStrangePlus() is the "Strange+"
   gate the plot-item-in-Discovery chance uses — true on the top 14% of a d100 (Strange/Volatile/Mythic). */
function walkSpiceBand(){
  const n=1+Math.floor(Math.random()*100);
  if(n<=66) return "Grounded"; if(n<=86) return "Textured"; if(n<=95) return "Strange";
  if(n<=99) return "Volatile"; return "Mythic";
}
function walkIsStrangePlus(){ const b=walkSpiceBand(); return b==="Strange"||b==="Volatile"||b==="Mythic"; }

/* LIGHTING (docs/BATTLE-THEATER.md follow-up, Adam 2026-07-03) — "the light becomes a ROLLED walk fact."
   Stamped at the SAME seam every segment is minted (this file's urban loop below, plus dungeon-walk.js/
   wild-walk.js's own room/leg loops — all three call THIS one helper so the light table lives in exactly
   one place, engine.theater-data, per the spec's own "in-code table... NOT the Engine markdown corpus"
   instruction). Seeded off the segment's own id/num (same discipline as engine.combat's cmSeedHash-driven
   lane placement — re-entering a room reproduces the same light) and re-checked against whatever free
   text the segment already carries (feature/description/scene — "DERIVE overrides... by keyword").
   Graceful until theater-data.js loads (theaterRollLight absent -> null; every walk consumer already
   treats a missing/absent field as "nothing about the walk changes," same WALK-REFRESH §3 discipline
   rollWalkSkin uses). `env` is the walk's own environment string (urban/dungeon/wilderness/breach). */
function walkRollLight(env, seedKey, textPool){
  if(typeof theaterRollLight!=="function") return null;
  return theaterRollLight(env, seedKey, textPool||"");
}

/* WALK-REFRESH §3 — the walk skin: one rolled lens per walk, EVERY walk, spice-gated (the curve does
   the gating — no opt-in flag). rollWalkSkin(envKind) rolls the compiled `walk-skin-<envKind>` table
   (Wilderness/Dungeon/Urban — tables-wave1 authors these, WALK-REFRESH §5 gate) via rollTable, which
   already carries the spice band (row[2]) from the standard curve baked into the table itself.
   GRACEFUL UNTIL AUTHORED: table absent/uncompiled → null, and nothing about the walk changes — the
   wiring ships now, skins activate the moment tables-wave1 lands. Stored on the walk as
   `walk.skin={text,band,ref}`; the synthesis pass reskins WITHIN the lens (SYNTHESIS-CONTRACT.md, a
   frontier-prose line — out of this unit's scope, listed in skippedProseSteps). */
function rollWalkSkin(envKind){
  if(typeof rollTable!=="function") return null;
  const r=rollTable("walk-skin-"+envKind);
  if(!r || !r.text) return null;
  return { text:r.text, band:r.band||null, ref:"walk-skin-"+envKind+"#"+r.total };
}

// ─── segment sub-table roll (dedup within walk, overflow into related table) ──
function walkSubTable(label, used){
  const tableId=WALK_LABEL_TO_SUBTABLE[label];
  if(!tableId) return null;
  const rows=walkRows(tableId);
  if(!rows.length) return null;
  const seg=r=>((r[5]&&r[5][0])||r[3]||"").trim();
  if(!used[tableId]) used[tableId]=new Set();
  let unused=rows.filter(r=>!used[tableId].has(seg(r)));
  if(!unused.length && WALK_SUBTABLE_OVERFLOW[tableId]){
    const ofId=WALK_SUBTABLE_OVERFLOW[tableId], ofRows=walkRows(ofId);
    if(ofRows.length){
      if(!used[ofId]) used[ofId]=new Set();
      const ofUnused=ofRows.filter(r=>!used[ofId].has(seg(r)));
      if(ofUnused.length){ const row=walkRnd(ofUnused), c=row[5]||[]; used[ofId].add(seg(row));
        return { segType:(c[0]||"").trim(), description:(c[1]||"").trim(), transition:(c[2]||"").trim(), from:ofId }; }
    }
  }
  const pool=unused.length?unused:rows, row=walkRnd(pool), c=row[5]||[];
  used[tableId].add(seg(row));
  return { segType:(c[0]||"").trim(), description:(c[1]||"").trim(), transition:(c[2]||"").trim(), from:tableId };
}

// ─── encounter builder (weighted per topology) ───────────────────────────────
// REALM-WALK-WIRING §1 — mirrors REALM-WIRING §3 (dungeon-walk.js's dwalkEncounter) exactly: a 4th
// `opts` param carries the active-realm list (opts.realms, threaded from rollUrbanWalk's own skin
// call site). `realmEncounterPool`/`activeRealmsFor`/`REALM_ADJACENCY` still live in dungeon-walk.js
// (cross-family now; NOT moved this unit — classic-script shared scope makes them reachable as
// globals here). Back-compat: `opts` absent/opts.realms empty → byte-identical to pre-unit behavior.
function walkEncounter(topo, threat, tier, opts){
  const weights=WALK_ENCOUNTER_WEIGHTS[topo]||WALK_ENCOUNTER_WEIGHTS["The Trail"];
  const branch=walkWeighted(weights, WALK_ENCOUNTER_BRANCHES);
  if(branch==="Enemy"){
    if(Math.random()<0.75){
      const [compName,compRoster,compT]=walkPick("urban-enemy-composition",1,2,3);
      if(compName==="Factional Conflict"){
        const [fA]=walkPick("urban-enemy-category",1), [fB]=walkPick("urban-enemy-category",1);
        return { type:"Enemy", subtype:"Faction Clash", text:`Faction clash: ${fA} vs ${fB} — ${compT}`, isEnemy:true, factions:[fA,fB], creatures:null };
      }
      const slots=WALK_SLOT_MAP[compName]||["low"];
      // WALK-REFRESH §1: live roster resolution (resolveArchetypePool — registry-filtered BESTIARY ∪ the
      // authored pool as the floor); graceful fallback to walkPickFromPool if the registry isn't loaded.
      const walkPickCreature=(pool,slot)=>(typeof resolveArchetypePool==="function")
        ? resolveArchetypePool(threat.id, {tier:tier||1, slot}, pool) : walkPickFromPool(pool);
      // REALM-WALK-WIRING §1 — in a breach (opts.realms non-empty), each slot first tries a realm
      // creature (realmEncounterPool, dungeon-walk.js §2) instead of the normal archetype pool. Slot
      // tier -> REALM_BESTIARY role: low->mook, mid->elite, boss->high (apex reachable via leak only).
      // An empty/missing realm pool for a slot falls straight back to walkPickCreature — never dangling.
      const realms=(opts&&Array.isArray(opts.realms))?opts.realms:[];
      const slotRole=slot=>slot==="boss"?"high":slot==="mid"?"elite":"mook";
      const creatures=slots.map(slot=>{
        const label=(slot==="boss"?"Boss CR":slot==="mid"?"Mid CR":"Low CR");
        if(realms.length){
          const rc=realmEncounterPool(realms, slotRole(slot));
          // carry desc/summary through when the bestiary entry has them (REALM-STORY-WIRING §1
          // parity — absent today degrades to null/null gracefully, same as dungeon-walk.js).
          if(rc) return { slot:label, creature:rc.name,
            statId:rc.frame, modelKey:rc.model, cr:rc.cr, realm:rc.__realm, realmRole:rc.role||null,
            desc:rc.desc||null, summary:rc.summary||null };
        }
        const creature = slot==="boss"?walkPickCreature(threat.boss,"boss") : slot==="mid"?walkPickCreature(threat.mid,"mid") : walkPickCreature(threat.low,"low");
        return { slot:label, creature };
      });
      return { type:"Enemy", composition:compName, roster:compRoster, tactic:compT, threatId:threat.id,
               text:`${compName} (${threat.id}): ${compRoster} — ${compT}`, isEnemy:true, creatures };
    }
    const [enemy]=walkPick("urban-enemy-category",1);
    return { type:"Enemy", subtype:"Complication", text:`Enemy complication: ${enemy}`, isEnemy:true, creatures:null };
  }
  if(branch==="Social"){
    if(Math.random()<0.30){ const [boon,desc,benefit]=walkPick("urban-boon",1,2,3);
      return { type:"Boon", text:`${boon}: ${desc} (benefit: ${benefit})`, isEnemy:false, npc:null }; }
    const [entity,event,hook]=walkPick("urban-contact",1,2,3);
    return { type:"Social", text:`${entity} — ${event} (hook: ${hook})`, isEnemy:false, npc:{ entity, hook } };
  }
  if(branch==="Problem"){ const [obstacle,solving]=walkPick("urban-problem",1,2);
    return { type:"Problem", text:`${obstacle} — ${solving}`, isEnemy:false }; }
  if(branch==="Hazard"){ const [ht,hd]=walkPick("urban-hazard",1,2);
    return { type:"Hazard", text:`${ht}: ${hd}`, isEnemy:false }; }
  if(branch==="Commerce"){
    if(Math.random()<0.25){ const [boon,desc,benefit]=walkPick("urban-boon",1,2,3);
      return { type:"Boon", text:`${boon}: ${desc} (benefit: ${benefit})`, isEnemy:false, npc:null }; }
    const [commerce]=walkPick("urban-commerce",1);
    return { type:"Commerce", text:commerce, isEnemy:false }; }
  if(branch==="Spectacle"){ const [s]=walkPick("urban-spectacle",1); return { type:"Spectacle", text:s, isEnemy:false }; }
  if(branch==="Rumor"){ const [r]=walkPick("urban-rumor-intel",1); return { type:"Rumor", text:r, isEnemy:false }; }
  const [er,impact]=walkPick("urban-empty-result",2,3);
  return { type:"Empty", text:`${er} — ${impact}`, isEnemy:false };
}

// ─── scene frame (single d400) ───────────────────────────────────────────────
function walkSceneFrame(encType){
  const [frame,dims,tactical]=walkPick("urban-scene-frame",1,2,3);
  if(!frame) return null;
  if(WALK_FRAME_FULL.indexOf(encType)>=0) return { frame, dims, tactical, detail:"full" };
  if(WALK_FRAME_LIGHT.indexOf(encType)>=0) return { frame, dims, detail:"light" };
  return null; // Rumor, Empty, Boon — skip
}

// ─── label helpers ───────────────────────────────────────────────────────────
function walkCycleLabel(i, seq){ if(i===1) return seq[0]; const c=seq.slice(1); return c[(i-2)%c.length]; }
function walkPureCycleLabel(i, seq){ return seq[(i-1)%seq.length]; }
function walkRampLabel(i, n, labels){ return labels[Math.min(Math.floor((i-1)*labels.length/n), labels.length-1)]; }

// ─── graph utilities ─────────────────────────────────────────────────────────
function walkBuildGraph(nodes, edges){ const adj={}; for(const{id}of nodes) adj[id]=[]; for(const[a,b]of edges){adj[a].push(b);adj[b].push(a);} return {adj,nodes}; }
function walkBfs(adj, entry){
  const seen=new Set(), q=[{id:entry,d:0}], order=[], depth={};
  while(q.length){ const{id,d}=q.shift(); if(seen.has(id))continue; seen.add(id); order.push(id); depth[id]=d;
    for(const nb of (adj[id]||[])) if(!seen.has(nb)) q.push({id:nb,d:d+1}); }
  return {order,depth};
}
function walkAssignSegNumbers(order, nodes){
  const map=Object.fromEntries(nodes.map(n=>[n.id,n]));
  const nonFin=order.filter(id=>!map[id]?.isFinale), fin=order.filter(id=>map[id]?.isFinale);
  const num={}; [...nonFin,...fin].forEach((id,i)=>num[id]=i+1); return num;
}
function walkResolveTopology(name, segCount){
  let n=name; const orig=name;
  while(n && (WALK_TOPOLOGY_MIN_SEGS[n]||1)>segCount) n=WALK_TOPOLOGY_FALLBACK[n]||"The Trail";
  return { resolved:n||"The Trail", original:orig, wasFallback:(n||"The Trail")!==orig };
}

// ─── 16 graph builders (shape + label grammar) ───────────────────────────────
const WALK_GRAPH_BUILDERS = {
  "The Trail": n=>{ const L=WALK_TOPOLOGY_LABELS["The Trail"], nodes=[], edges=[];
    for(let i=1;i<=n;i++){ nodes.push({id:`s${i}`,label:walkCycleLabel(i,L.seq),isFinale:false}); if(i>1) edges.push([`s${i-1}`,`s${i}`]); }
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([`s${n}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Web": n=>{ const L=WALK_TOPOLOGY_LABELS["The Web"], main=Math.max(2,Math.ceil(n*0.6)), branches=n-main, nodes=[], edges=[];
    for(let i=1;i<=main;i++){ nodes.push({id:`s${i}`,label:L.seq[Math.min(i-1,L.seq.length-1)],isFinale:false}); if(i>1) edges.push([`s${i-1}`,`s${i}`]); }
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([`s${main}`,"finale"]);
    for(let b=0;b<branches;b++){ const id=`b${b+1}`, range=main-1, raw=range<=1?2:2+Math.round(b*(range-1)/Math.max(branches-1,1)), at=Math.max(2,Math.min(main,raw));
      nodes.push({id,label:L.branch,isFinale:false}); edges.push([`s${at}`,id]); }
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Turf": n=>{ const L=WALK_TOPOLOGY_LABELS["The Turf"], spokes=n-1, nodes=[{id:"s1",label:L.hub,isFinale:false}], edges=[];
    for(let i=0;i<spokes;i++){ const id=`s${i+2}`; nodes.push({id,label:L.spokeSeq[i%L.spokeSeq.length],isFinale:false}); edges.push(["s1",id]); }
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push(["s1","finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Layer Cake": n=>{ const L=WALK_TOPOLOGY_LABELS["The Layer Cake"], nodes=[], edges=[];
    for(let i=1;i<=n;i++){ nodes.push({id:`s${i}`,label:walkRampLabel(i,n,L.layers),isFinale:false}); if(i>1) edges.push([`s${i-1}`,`s${i}`]); }
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([`s${n}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Mosaic": n=>{ const L=WALK_TOPOLOGY_LABELS["The Mosaic"], nodes=[], edges=[];
    for(let i=1;i<=n;i++){ nodes.push({id:`s${i}`,label:walkPureCycleLabel(i,L.seq),isFinale:false}); if(i>1) edges.push([`s${i-1}`,`s${i}`]); }
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([`s${n}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Shell Game": n=>{ const L=WALK_TOPOLOGY_LABELS["The Shell Game"], nodes=[], edges=[];
    for(let i=1;i<=n;i++){ nodes.push({id:`s${i}`,label:walkRampLabel(i,n,L.seq),isFinale:false}); if(i>1) edges.push([`s${i-1}`,`s${i}`]); }
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([`s${n}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Stronghold": n=>{ const L=WALK_TOPOLOGY_LABELS["The Stronghold"], nodes=[], edges=[];
    for(let i=1;i<=n;i++){ nodes.push({id:`s${i}`,label:walkRampLabel(i,n,L.layers),isFinale:false}); if(i>1) edges.push([`s${i-1}`,`s${i}`]); }
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([`s${n}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Gauntlet": n=>{ const L=WALK_TOPOLOGY_LABELS["The Gauntlet"], main=Math.max(2,Math.ceil(n*0.6)), branches=n-main, nodes=[], edges=[];
    for(let i=1;i<=main;i++){ nodes.push({id:`s${i}`,label:walkCycleLabel(i,L.seq),isFinale:false}); if(i>1) edges.push([`s${i-1}`,`s${i}`]); }
    for(let b=0;b<branches;b++){ const id=`b${b+1}`; nodes.push({id,label:"Waypoint",isFinale:false}); edges.push([id,`s${Math.min(main,2+b)}`]); }
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([`s${main}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Rundown": n=>{ const L=WALK_TOPOLOGY_LABELS["The Rundown"], cyc=L.seq.slice(1), nodes=[], edges=[];
    for(let i=1;i<=n;i++){ nodes.push({id:`s${i}`,label:(i===1?L.seq[0]:cyc[(i-2)%cyc.length]),isFinale:false}); if(i>1) edges.push([`s${i-1}`,`s${i}`]); }
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([`s${n}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Carousel": n=>{ const L=WALK_TOPOLOGY_LABELS["The Carousel"], nodes=[], edges=[];
    for(let i=1;i<=n;i++){ nodes.push({id:`s${i}`,label:walkCycleLabel(i,L.seq),isFinale:false}); if(i>1) edges.push([`s${i-1}`,`s${i}`]); }
    if(n>=3) edges.push([`s${n}`,"s2"]);
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([`s${n}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Stakeout": n=>{ const L=WALK_TOPOLOGY_LABELS["The Stakeout"], nodes=[], edges=[];
    for(let i=1;i<=n;i++){ nodes.push({id:`s${i}`,label:walkRampLabel(i,n,L.seq),isFinale:false}); if(i>1) edges.push([`s${i-1}`,`s${i}`]); }
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([`s${n}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Crucible": n=>{ const L=WALK_TOPOLOGY_LABELS["The Crucible"], nodes=[], edges=[];
    for(let i=1;i<=n;i++) nodes.push({id:`s${i}`,label:walkCycleLabel(i,L.seq),isFinale:false});
    for(let i=1;i<=n;i++) for(let j=i+1;j<=n;j++) edges.push([`s${i}`,`s${j}`]);
    nodes.push({id:"finale",label:L.finale,isFinale:true}); for(let i=1;i<=n;i++) edges.push([`s${i}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Double Cross": n=>{ const L=WALK_TOPOLOGY_LABELS["The Double Cross"], nodes=[{id:"s1",label:L.opening,isFinale:false}], edges=[];
    const rem=n-2, aN=Math.ceil(rem/2), bN=rem-aN; let idx=2; const aIds=[], bIds=[];
    for(let i=0;i<aN;i++){ const id=`s${idx++}`; nodes.push({id,label:L.pathA,isFinale:false}); aIds.push(id); }
    for(let i=0;i<bN;i++){ const id=`s${idx++}`; nodes.push({id,label:L.pathB,isFinale:false}); bIds.push(id); }
    const conv=`s${idx}`; nodes.push({id:conv,label:L.convergence,isFinale:false});
    if(aIds.length) edges.push(["s1",aIds[0]]); if(bIds.length) edges.push(["s1",bIds[0]]); if(!bIds.length) edges.push(["s1",conv]);
    for(let i=1;i<aIds.length;i++) edges.push([aIds[i-1],aIds[i]]); for(let i=1;i<bIds.length;i++) edges.push([bIds[i-1],bIds[i]]);
    if(aIds.length) edges.push([aIds[aIds.length-1],conv]); if(bIds.length) edges.push([bIds[bIds.length-1],conv]);
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([conv,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Tightrope": n=>{ const L=WALK_TOPOLOGY_LABELS["The Tightrope"], nodes=[], edges=[];
    for(let i=1;i<=n;i++){ nodes.push({id:`s${i}`,label:walkCycleLabel(i,L.seq),isFinale:false}); if(i>1) edges.push([`s${i-1}`,`s${i}`]); }
    for(let i=2;i<=n;i++) for(let j=i+2;j<=n;j++) if(Math.random()<0.4) edges.push([`s${i}`,`s${j}`]);
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([`s${n}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Ratchet": n=>{ const L=WALK_TOPOLOGY_LABELS["The Ratchet"], nodes=[], edges=[];
    for(let i=1;i<=n;i++){ nodes.push({id:`s${i}`,label:walkRampLabel(i,n,L.seq),isFinale:false}); if(i>1) edges.push([`s${i-1}`,`s${i}`]); }
    for(let i=1;i<=Math.floor(n/2);i++) for(let j=i+2;j<=Math.min(n,i+3);j++) edges.push([`s${i}`,`s${j}`]);
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([`s${n}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
  "The Fracture": n=>{ const L=WALK_TOPOLOGY_LABELS["The Fracture"], nodes=[{id:"s1",label:L.opening,isFinale:false},{id:"s2",label:L.splitPoint,isFinale:false}], edges=[["s1","s2"]];
    const rem=n-3, aN=Math.ceil(rem/2), bN=rem-aN; let idx=3; const aIds=[], bIds=[];
    for(let i=0;i<aN;i++){ const id=`s${idx++}`; nodes.push({id,label:L.threadA,isFinale:false}); aIds.push(id); }
    for(let i=0;i<bN;i++){ const id=`s${idx++}`; nodes.push({id,label:L.threadB,isFinale:false}); bIds.push(id); }
    const reunion=`s${idx}`; nodes.push({id:reunion,label:L.reunion,isFinale:false});
    if(aIds.length) edges.push(["s2",aIds[0]]); if(bIds.length) edges.push(["s2",bIds[0]]);
    for(let i=1;i<aIds.length;i++) edges.push([aIds[i-1],aIds[i]]); for(let i=1;i<bIds.length;i++) edges.push([bIds[i-1],bIds[i]]);
    if(aIds.length) edges.push([aIds[aIds.length-1],reunion]); else edges.push(["s2",reunion]);
    if(bIds.length) edges.push([bIds[bIds.length-1],reunion]);
    nodes.push({id:"finale",label:L.finale,isFinale:true}); edges.push([reunion,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"s1"}; },
};

// ─── finale (structured; ports the three-track finale data) ───────────────────
// TAROT-SESSION.md §1: optional `tarot` param (tarotVectorOf(w)) — a Swords-domain draw re-rolls the
// Combat-track boss pick toward the live roster (tarotBiasedArchetypePool, region:null since urban's
// finale isn't region-biased today either). No draw / tarot module absent → today's exact single roll.
function walkFinale(node, topo, threat, catalyst, tier, frame, tarot){
  const track=WALK_FINALE_DEFAULTS[topo]||"Discovery";
  const [revelation]=walkPick("urban-revelation",1);
  const [exitState]=walkPick("urban-exit-state",1);
  const out={ track, revelation, exitState, sceneFrame:frame };
  if(track==="Combat"){
    const [bossArch]=walkPick("urban-boss",1), [setup]=walkPick("urban-tactical-setup",1);
    const bossCreature=(typeof tarotBiasedArchetypePool==="function")
      ? tarotBiasedArchetypePool(tarot,"threat", null, threat.id, {tier:tier||1, slot:"boss"}, threat.boss)
      : ((typeof resolveArchetypePool==="function")
      ? resolveArchetypePool(threat.id, {tier:tier||1, slot:"boss"}, threat.boss) : walkPickFromPool(threat.boss));
    out.boss={ archetype:bossArch, creature:bossCreature, threatId:threat.id }; out.tacticalSetup=setup;
  } else if(track==="Social"){
    const [npc]=walkPick("urban-contact",1); out.keyNpc=npc;
    const nd=walkRows("urban-narrative-device");
    if(nd.length){ const c=walkRnd(nd)[5]||[]; out.narrativeDevice={ name:(c[0]||"").trim(), core:(c[1]||"").trim(), misread:(c[2]||"").trim(), leverage:(c[3]||"").trim() }; }
  } else {
    out.catalystCallback=catalyst;
    // WALK-REFRESH §2.3 — spice-gated (Strange+) chance the Discovery-track finale IS a rollItem macguffin.
    out.macguffin=(typeof walkIsStrangePlus==="function" && walkIsStrangePlus() && typeof rollItem==="function") ? rollItem({}) : null;
  }
  return out;
}

/* ============================================================
   PUBLIC — roll a full urban segment walk → data structure
   opts: { segCount=4, tier=1, topology="(random)", threat? }
   ============================================================ */
function rollUrbanWalk(opts){
  opts=opts||{};
  const region=opts.region||null;   // REGIONS-NAMES.md §1 — optional w.regions[] record (soft-biases the skin roll)
  const tarot=opts.tarot||null;     // TAROT-SESSION.md §1 — optional session vector (tarotVectorOf(w)); default-inert without a draw
  const segCount=Math.max(2, Math.min(30, opts.segCount||4));
  const tier=Math.min(2, opts.tier||1)>=2?2:1;   // clamp to the Tier-2 cap: a T3+ input gets T2 content, not T1
  const chosen=URBAN_TOPOLOGIES.indexOf(opts.topology)>=0 ? opts.topology : walkRnd(URBAN_TOPOLOGIES);

  // SKIN-GRANTS.md §1 — "the skin rolls FIRST": the ordering rule the batch-3 unit adds. Rolled here,
  // ahead of every other setup roll, so a later unit can bias setup rolls off the skin/motif without
  // a second pass. REGIONS-NAMES.md §1 / TAROT-SESSION.md §1 fallback chain preserved verbatim as the
  // CENTER resolver; BREACH.md §0 wraps it in the 2d10 bell + fray-shift tail dispatch (breach-core,
  // engine.breach) — a center result is byte-identical to the pre-breach chain.
  const centerSkinFn = ()=> (typeof tarotSpiceBiasedSkin==="function") ? tarotSpiceBiasedSkin(tarot, "urban", region)
      : ((typeof regionBiasedWalkSkin==="function") ? regionBiasedWalkSkin(region,"urban")
      : ((typeof rollWalkSkin==="function") ? rollWalkSkin("urban") : null));
  const nodeAt = (opts.world && typeof nodeXY==="function") ? nodeXY(opts.world, opts.world.currentNodeId) : null;
  const hexAt = (nodeAt && typeof worldToAxial==="function") ? worldToAxial(nodeAt.x, nodeAt.y) : null;
  const skin = (typeof rollWalkSkinBreach==="function")
      ? rollWalkSkinBreach("urban", { q: hexAt&&hexAt.q, r: hexAt&&hexAt.r, centerFn: centerSkinFn })
      : centerSkinFn();
  // REALM-WALK-WIRING §1: the active realm list this walk's encounters draw from — [] outside a
  // breach (byte-identical to before this unit), non-empty inside one (or a marooned realm walk).
  // Threaded into every non-finale segment's walkEncounter call below (mirrors dungeon-walk.js).
  const activeRealms=(typeof activeRealmsFor==="function") ? activeRealmsFor(skin, opts.world) : [];

  // setup rolls — the briefing bag the synthesis pass reskins from
  const [typeArch,typeAtmo]=walkPick("urban-type",1,2);
  const [originCat,originFlav]=walkPick("urban-origin",1,2);
  const [skinName,skinVis]=walkPick("urban-environment-skin",1,2);
  const [motifName,motifDesc]=walkPick("urban-art-motif",1,2);
  const [modName,modDesc]=walkPick("urban-art-motif-modifier",1,2);
  const [restName,restDesc]=walkPick("urban-rest-complications",1,2);
  const [catalyst]=walkPick("urban-catalyst",1);
  const [distName,distHow,distPrompt]=walkPick("urban-street-distortion",1,2,3);

  // tier-aware threat context
  const threatId=tier===2?"urban-threat-identity-t2":"urban-threat-identity-t1";
  let threat=opts.threat;
  if(!threat){ const tr=walkRows(threatId);
    if(tr.length){ const c=walkRnd(tr)[5]||[]; threat={ id:(c[0]||"Unknown Threat").trim(), low:(c[1]||"Bandit").trim(), mid:(c[2]||"Captain").trim(), boss:(c[3]||"Boss").trim() }; }
    else threat={ id:"Unknown Threat", low:"Bandit", mid:"Captain", boss:"Boss" }; }

  // topology → graph → ordering
  const { resolved, original, wasFallback }=walkResolveTopology(chosen, segCount);
  const graph=WALK_GRAPH_BUILDERS[resolved](segCount);
  const { order, depth }=walkBfs(graph.adj, graph.entry);
  const segNum=walkAssignSegNumbers(order, graph.nodes);
  const nodeMap=Object.fromEntries(graph.nodes.map(n=>[n.id,n]));
  const finaleId=order.find(id=>nodeMap[id]?.isFinale)||order[order.length-1];

  // WALK-REFRESH §2.1 — the loot lane, closing L6 (urban had none). Reuses dwalkBudget/dwalkAssignLoot/
  // dwalkLoot VERBATIM (src/engine/dungeon-walk.js) scaled by segCount as-is; keyed by segNum (the
  // resolver needs the same numeric ids dwalkAssignLoot's depth-sort expects). Presentation framing
  // only differs by environment (urban: stash/lockbox/strongbox) — graceful no-op if unavailable.
  const WALK_LOOT_FRAME = "stash/lockbox/strongbox";
  let lootByNode=null, lootBudget=null;
  if(typeof dwalkBudget==="function" && typeof dwalkAssignLoot==="function"){
    const numOrder=order.map(id=>segNum[id]), numDepth={}; order.forEach(id=>numDepth[segNum[id]]=depth[id]);
    lootBudget=dwalkBudget(segCount, tier===2);
    lootByNode=dwalkAssignLoot(lootBudget, numOrder, numDepth, segNum[finaleId]);
  }
  function walkLootFor(num, d, isFinale, hasEnemy){
    if(!lootByNode || typeof dwalkLoot!=="function") return null;
    const out=dwalkLoot(lootByNode[num], d, isFinale, tier===2, hasEnemy);
    out.frame=WALK_LOOT_FRAME;
    return out;
  }

  const used={}; // sub-table dedup state for this walk
  const segments=order.map(nodeId=>{
    const node=nodeMap[nodeId], num=segNum[nodeId];
    const exits=(graph.adj[nodeId]||[]).map(t=>({ targetId:t, num:segNum[t], label:nodeMap[t]?.label||"", isFinale:!!nodeMap[t]?.isFinale }));
    if(node.isFinale){
      const frame=walkSceneFrame("Enemy"); // finales always get a full frame
      const light=walkRollLight("urban", nodeId+":light", "");
      return { id:nodeId, num, label:node.label, isFinale:true, depth:depth[nodeId], exits, light,
               finale:walkFinale(node,resolved,threat,catalyst,tier,frame,tarot), loot:walkLootFor(num,depth[nodeId],true,false) };
    }
    const sub=walkSubTable(node.label, used);
    const encounter=walkEncounter(resolved, threat, tier, {realms:activeRealms});
    const sceneFrame=walkSceneFrame(encounter.type);
    // WIRING-SWEEP-A §7 (docs/WIRING-MAP.md item 9): urban-interactable-object — the same segment
    // object lane dungeon-walk.js already wires for dungeons. Null-safe (wiring-a.js absent/table
    // uncompiled → null, byte-identical to before this unit).
    const interactable=(typeof walkPickInteractable==="function") ? walkPickInteractable("urban") : null;
    // WIRING-SWEEP-B §3 (docs/WIRING-MAP.md item 12, world.wiring-b): urban-background-event — the
    // dispatch map's third leg (catalyst=plot ignition, spectacle=set-piece, background-event=
    // undirected ambience), chance-gated. Null-safe.
    const backgroundEvent=(typeof urbanBackgroundEventRoll==="function") ? urbanBackgroundEventRoll() : null;
    // DRESSING-WIRING.md §"Behavior" 1: one dressing roll per SEGMENT — Urban Set Dressing (as-is,
    // no reskin needed) + Urban Set Dressing Condition, stored {text,condition} (same shape
    // dungeon-walk.js's room loop and wild-walk.js's leg loop use). Finale segments are skipped —
    // they already carry no `.feature` field either (see this file's own note below on `sub`), so
    // dressing follows that same established asymmetry rather than inventing a finale-only lane.
    const [dressText]=walkPick("urban-set-dressing",1), [dressCond]=walkPick("urban-set-dressing-condition",1);
    // DRESSING-ATMOSPHERE.md: one atmo roll per SEGMENT (air/odor/sound, uniform lane pick),
    // same finale asymmetry as dressing above — finale segments return early and carry neither.
    const atmo=walkRollAtmo("urban");
    // LIGHTING: seeded off this segment's own node id + "light" (distinct seed namespace from lane
    // placement, which seeds off the segmentId alone) and re-checked against this segment's OWN
    // description text (urban segments carry no `.feature` field the way dungeon rooms do — the sub-
    // table's `description` is the closest free-text pool a keyword override can read here).
    const light=walkRollLight("urban", nodeId+":light", sub?sub.description:"");
    return { id:nodeId, num, label:node.label, isFinale:false, depth:depth[nodeId], exits, light,
             segType:sub?sub.segType:null, description:sub?sub.description:null, transition:sub?sub.transition:null, encounter, sceneFrame,
             dressing:{ text:dressText, condition:dressCond }, atmo,
             interactable, backgroundEvent, loot:walkLootFor(num,depth[nodeId],false,encounter.isEnemy) };
  }).sort((a,b)=>a.num-b.num);

  // dedup edges for the sub-map
  const edgeSet=new Set(), edges=[];
  for(const n of graph.nodes) for(const nb of (graph.adj[n.id]||[])){ const k=[n.id,nb].sort().join("|"); if(!edgeSet.has(k)){ edgeSet.add(k); edges.push([segNum[n.id],segNum[nb]]); } }

  const walk = {
    environment:"urban", topology:resolved, posture:WALK_TOPOLOGY_POSTURE[resolved],
    tier, segCount, fallbackFrom: wasFallback?original:null,
    heatStart:WALK_HEAT_START[resolved]||0, heatGuidance:WALK_HEAT_GUIDANCE[resolved],
    finaleTrack:WALK_FINALE_DEFAULTS[resolved], threat,
    setup:{ type:typeArch, atmosphere:typeAtmo, origin:originCat, originFlavor:originFlav, skin:skinName, skinVisual:skinVis,
            motif:motifName, motifDesc, motifModifier:modName, motifModifierDesc:modDesc, rest:restName, restDesc,
            catalyst, distortion:distName, distortionHow:distHow, distortionPrompt:distPrompt },
    // WALK-REFRESH §3 — the rolled skin (null-safe until tables-wave1 authors walk-skin-urban).
    skin,
    segments, edges,
  };
  // SKIN-GRANTS.md §1/§1b — pay the skin's promise through rolled machinery + thread the motif kit.
  // `w` (opts.world) is optional; every grant executor degrades gracefully without it (skin-grants.js).
  return (typeof applySkinGrants==="function") ? applySkinGrants(walk, skin, opts.world||null) : walk;
}
