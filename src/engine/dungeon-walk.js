/* GENESIS MODULE — src/engine/dungeon-walk.js — the dungeon walk-roller (docs/SESSION-PREP.md §2)
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Reuses the generic helpers from engine.walk (walkRnd/walkRows/walkPick/walkPickFromPool/
   walkBuildGraph/walkBfs/walkAssignSegNumbers) — so it MUST load after src/engine/walk.js.

   Ported from the Obsidian "Dungeon Procedure v4.2 Generator": picks a topology (12 graph shapes),
   builds the room graph, and for each room rolls area type, scene, encounter, depth-budgeted loot,
   and a secret — returning the dungeon as a DATA STRUCTURE (rooms=nodes, doors=edges). The finale
   room carries an affinity-filtered boss + revelation (filtered by the rolled Myth Seed). No file/
   canvas output. All internals are `dwalk`/`DWALK_`-prefixed. */

/* ============================================================
   DUNGEON WALK-ROLLER — topology-driven room graph (cheap, pure dice)
   ============================================================ */

const DUNGEON_TOPOLOGIES = [
  "The Spine","The Branch","The Cascade","The Ruin","The Loop","The Hub",
  "The Stronghold","The Figure-8","The Convergence","The Onion","The Web","The Labyrinth Fragment",
];

const DWALK_SLOT_MAP = {
  "The Horde":["low"],"The Staggered Mob":["low"],"Frontline & Shooter":["mid","low"],
  "The Ambush":["mid"],"Boss & Fodder":["boss","low"],"Boss & Guards":["boss","mid"],
  "The Controller & Thralls":["mid","low"],"The Elite Pair":["mid"],"The Solo Threat":["boss"],
  "Interrupted Conflict":null,
};
const DWALK_TOPO_SIZE = {
  "The Spine":"any","The Branch":"any","The Cascade":"any","The Ruin":"any","The Loop":"medium",
  "The Hub":"any","The Stronghold":"medium","The Figure-8":"medium","The Convergence":"any",
  "The Onion":"any","The Web":"medium","The Labyrinth Fragment":"small",
};
const DWALK_TOPOLOGY_MIN_SEGS = {
  "The Spine":1,"The Cascade":1,"The Branch":2,"The Ruin":2,"The Loop":3,"The Hub":3,
  "The Stronghold":3,"The Convergence":4,"The Onion":4,"The Web":4,"The Figure-8":5,"The Labyrinth Fragment":5,
};
const DWALK_TOPOLOGY_FALLBACK = {
  "The Figure-8":"The Loop","The Labyrinth Fragment":"The Web","The Web":"The Loop",
  "The Convergence":"The Loop","The Onion":"The Loop","The Loop":"The Branch","The Hub":"The Branch",
  "The Stronghold":"The Branch","The Ruin":"The Branch","The Branch":"The Spine","The Cascade":"The Spine",
};

function dwalkResolveTopology(name, segCount){
  let n=name; const orig=name;
  while(n && (DWALK_TOPOLOGY_MIN_SEGS[n]||1)>segCount) n=DWALK_TOPOLOGY_FALLBACK[n]||"The Spine";
  return { resolved:n||"The Spine", original:orig, wasFallback:(n||"The Spine")!==orig };
}

// ─── 12 graph builders (rooms=nodes; structural labels) ──────────────────────
function dwalkBranch(n){
  const main=Math.max(2,Math.ceil(n*0.6)), branches=n-main, nodes=[], edges=[];
  for(let i=1;i<=main;i++){ nodes.push({id:`r${i}`,label:i===1?"Entry":"",isFinale:false}); if(i>1) edges.push([`r${i-1}`,`r${i}`]); }
  nodes.push({id:"finale",label:"Finale",isFinale:true}); edges.push([`r${main}`,"finale"]);
  for(let b=0;b<branches;b++){ const id=`b${b+1}`, range=main-1, raw=range<=1?2:2+Math.round(b*(range-1)/Math.max(branches-1,1)), at=Math.max(2,Math.min(main,raw));
    nodes.push({id,label:"Branch",isFinale:false}); edges.push([`r${at}`,id]); }
  return {...walkBuildGraph(nodes,edges),entry:"r1"};
}
const DWALK_GRAPH_BUILDERS = {
  "The Spine": n=>{ const nodes=[], edges=[];
    for(let i=1;i<=n;i++){ nodes.push({id:`r${i}`,label:i===1?"Entry":"",isFinale:false}); if(i>1) edges.push([`r${i-1}`,`r${i}`]); }
    nodes.push({id:"finale",label:"Finale",isFinale:true}); edges.push([`r${n}`,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"r1"}; },
  "The Branch": dwalkBranch,
  "The Cascade": n=>DWALK_GRAPH_BUILDERS["The Spine"](n),
  "The Ruin": n=>{ const g=dwalkBranch(n); for(const nd of g.nodes) if(nd.label==="Branch") nd.label="Isolated Section"; return g; },
  "The Loop": n=>{ const pA=Math.ceil((n-1)/2), pB=(n-1)-pA, nodes=[{id:"r1",label:"Entry",isFinale:false}], edges=[]; let id=2;
    const a=Array.from({length:pA},()=>{ const x=`r${id++}`; nodes.push({id:x,label:"",isFinale:false}); return x; });
    const b=Array.from({length:pB},()=>{ const x=`r${id++}`; nodes.push({id:x,label:"",isFinale:false}); return x; });
    nodes.push({id:"finale",label:"Finale",isFinale:true});
    edges.push(["r1",a.length?a[0]:"finale"]); for(let i=0;i<a.length-1;i++) edges.push([a[i],a[i+1]]); if(a.length) edges.push([a[a.length-1],"finale"]);
    if(b.length){ edges.push(["r1",b[0]]); for(let i=0;i<b.length-1;i++) edges.push([b[i],b[i+1]]); edges.push([b[b.length-1],"finale"]); }
    return {...walkBuildGraph(nodes,edges),entry:"r1"}; },
  "The Hub": n=>{ const spokes=n-2, nodes=[{id:"r1",label:"Entry",isFinale:false},{id:"r2",label:"Hub",isFinale:false}], edges=[["r1","r2"]];
    for(let i=0;i<spokes;i++){ const id=`r${i+3}`; nodes.push({id,label:"Spoke",isFinale:false}); edges.push(["r2",id]); }
    nodes.push({id:"finale",label:"Finale",isFinale:true}); edges.push(["r2","finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"r1"}; },
  "The Stronghold": n=>{ const g=DWALK_GRAPH_BUILDERS["The Hub"](n); for(const nd of g.nodes){ if(nd.label==="Hub") nd.label="Inner Gate"; if(nd.label==="Spoke") nd.label="Fortified Chamber"; } return g; },
  "The Figure-8": n=>{ const rem=n-2, loop=Math.floor(rem/2), appr=rem-loop, nodes=[{id:"r1",label:"Entry",isFinale:false},{id:"r2",label:"Connector",isFinale:false}], edges=[["r1","r2"]]; let id=3;
    const lp=Array.from({length:loop},(_,i)=>{ const x=`r${id++}`; nodes.push({id:x,label:i===0?"Loop":"",isFinale:false}); return x; });
    if(lp.length){ edges.push(["r2",lp[0]]); for(let i=0;i<lp.length-1;i++) edges.push([lp[i],lp[i+1]]); edges.push([lp[lp.length-1],"r2"]); }
    const ap=Array.from({length:appr},()=>{ const x=`r${id++}`; nodes.push({id:x,label:"",isFinale:false}); return x; });
    edges.push(["r2",ap.length?ap[0]:"finale"]); for(let i=0;i<ap.length-1;i++) edges.push([ap[i],ap[i+1]]); if(ap.length) edges.push([ap[ap.length-1],"finale"]);
    nodes.push({id:"finale",label:"Finale",isFinale:true});
    return {...walkBuildGraph(nodes,edges),entry:"r1"}; },
  "The Convergence": n=>{ const rooms=n-2, pA=Math.ceil(rooms/2), pB=rooms-pA, nodes=[{id:"r1",label:"Entry",isFinale:false}], edges=[]; let id=2;
    const a=Array.from({length:pA},(_,i)=>{ const x=`r${id++}`; nodes.push({id:x,label:i===0?"Path A":"",isFinale:false}); return x; });
    const b=Array.from({length:pB},(_,i)=>{ const x=`r${id++}`; nodes.push({id:x,label:i===0?"Path B":"",isFinale:false}); return x; });
    const conv=`r${id++}`; nodes.push({id:conv,label:"Convergence",isFinale:false}); nodes.push({id:"finale",label:"Finale",isFinale:true});
    edges.push(["r1",a.length?a[0]:conv]); for(let i=0;i<a.length-1;i++) edges.push([a[i],a[i+1]]); if(a.length) edges.push([a[a.length-1],conv]);
    edges.push(["r1",b.length?b[0]:conv]); for(let i=0;i<b.length-1;i++) edges.push([b[i],b[i+1]]); if(b.length) edges.push([b[b.length-1],conv]);
    edges.push([conv,"finale"]);
    return {...walkBuildGraph(nodes,edges),entry:"r1"}; },
  "The Onion": n=>{ const outer=Math.max(3,Math.ceil(n*0.6)), inner=n-outer, nodes=[], edges=[]; let id=1;
    const o=Array.from({length:outer},(_,i)=>{ const x=`r${id++}`; nodes.push({id:x,label:i===0?"Entry":"Outer Ring",isFinale:false}); return x; });
    for(let i=0;i<outer;i++) edges.push([o[i],o[(i+1)%outer]]);
    const gate=o[1], inn=Array.from({length:inner},(_,i)=>{ const x=`r${id++}`; nodes.push({id:x,label:i===0?"Inner Sanctum":"",isFinale:false}); return x; });
    if(inn.length){ edges.push([gate,inn[0]]); for(let i=0;i<inn.length-1;i++) edges.push([inn[i],inn[i+1]]); edges.push([inn[inn.length-1],"finale"]); }
    else edges.push([gate,"finale"]);
    nodes.push({id:"finale",label:"Finale",isFinale:true});
    return {...walkBuildGraph(nodes,edges),entry:o[0]}; },
  "The Web": n=>{ const g=dwalkBranch(n), ids=g.nodes.filter(nd=>!nd.isFinale).map(nd=>nd.id), cross=Math.min(2,Math.floor(n/2));
    for(let c=0;c<cross;c++) for(let t=0;t<20;t++){ const a=walkRnd(ids), b=walkRnd(ids); if(a!==b && !g.adj[a].includes(b)){ g.adj[a].push(b); g.adj[b].push(a); break; } }
    return g; },
  "The Labyrinth Fragment": n=>{ const g=DWALK_GRAPH_BUILDERS["The Web"](n), ids=g.nodes.filter(nd=>!nd.isFinale).map(nd=>nd.id), extra=Math.floor(n/2);
    for(let c=0;c<extra;c++) for(let t=0;t<30;t++){ const a=walkRnd(ids), b=walkRnd(ids); if(a!==b && !g.adj[a].includes(b)){ g.adj[a].push(b); g.adj[b].push(a); break; } }
    return g; },
};

// ─── area type (size-preference filtered) ────────────────────────────────────
function dwalkArea(sizePref){
  const rows=walkRows("dungeon-area-type");
  if(!rows.length) return { areaType:"", dims:"", side:"" };
  let pool=rows;
  if(sizePref==="small"){ const f=rows.filter(r=>!(/\b[4-9]\d'/.test((r[5]&&r[5][1])||""))); if(f.length>=5) pool=f; }
  else if(sizePref==="medium"){ const f=rows.filter(r=>!(/\b[5-9]\d'/.test((r[5]&&r[5][1])||""))); if(f.length>=5) pool=f; }
  const c=walkRnd(pool)[5]||[];
  return { areaType:(c[0]||"").trim(), dims:(c[1]||"").trim(), side:(c[2]||"").trim() };
}

// ─── loot (tier+depth budget; boss gets top) ─────────────────────────────────
function dwalkBudget(segCount, t2){
  if(t2){ if(segCount>=13) return {common:4,uncommon:6,rare:2,veryRare:1}; if(segCount>=9) return {common:3,uncommon:5,rare:1,veryRare:0}; return {common:2,uncommon:3,rare:0,veryRare:0}; }
  if(segCount>=13) return {common:3,uncommon:2,rare:1,veryRare:0}; if(segCount>=9) return {common:2,uncommon:2,rare:0,veryRare:0}; return {common:1,uncommon:1,rare:0,veryRare:0};
}
function dwalkAssignLoot(budget, order, depth, finaleId){
  const deck=[];
  for(let i=0;i<(budget.veryRare||0);i++) deck.push("very-rare");
  for(let i=0;i<(budget.rare||0);i++) deck.push("rare");
  for(let i=0;i<(budget.uncommon||0);i++) deck.push("uncommon");
  for(let i=0;i<(budget.common||0);i++) deck.push("common");
  const nonFin=order.filter(id=>id!==finaleId).sort((a,b)=>(depth[b]||0)-(depth[a]||0));
  const loot={}; loot[finaleId]=deck.length?deck.shift():null;
  for(const id of nonFin) loot[id]=deck.length?deck.shift():null;
  return loot;
}
/* dwalkCoinRoll(t2,depth,isFinale) -> {label, gp, maxGp} — the coin roll's numeric gp total + the
   expression's maximum possible gp (ECONOMY-SINKS §B / BATCH-GUARDRAILS G6: "maxed coin roll"
   threshold needs the real dice expression's max, per branch). label is byte-identical to the
   pre-existing dwalkCoin string output — dwalkCoin below is now a thin wrapper so every caller
   that only wants the string is unaffected (zero regression). */
function dwalkCoinRoll(t2, depth, isFinale){
  const roll=(n,s)=>Array.from({length:n},()=>Math.floor(Math.random()*s)+1).reduce((a,b)=>a+b,0);
  if(t2){
    if(isFinale){
      const coin=roll(2,6)*50, gems=roll(1,4);
      return { label:`${coin} gp + ${gems} gem${gems>1?"s":""} (50 gp ea)`, gp:coin+gems*50, maxGp:12*50+4*50 };
    }
    if(depth>=4){ const g=roll(2,6)*10; return { label:`${g} gp`, gp:g, maxGp:12*10 }; }
    if(depth>=2){ const g=roll(2,6)*5; return { label:`${g} gp`, gp:g, maxGp:12*5 }; }
    { const g=roll(2,6); return { label:`${g} gp`, gp:g, maxGp:12 }; }
  }
  if(isFinale){ const g=roll(2,6)*5; return { label:`${g} gp + 1 gem (10 gp)`, gp:g+10, maxGp:12*5+10 }; }
  if(depth>=4){ const g=roll(2,6); return { label:`${g} gp`, gp:g, maxGp:12 }; }
  if(depth>=2){ const sp=roll(1,6), gp=roll(1,4); return { label:`${sp} sp, ${gp} gp`, gp:sp*0.1+gp, maxGp:6*0.1+4 }; }
  { const cp=roll(2,6)*10; return { label:`${cp} cp`, gp:cp*0.01, maxGp:12*0.01 }; }
}
function dwalkCoin(t2, depth, isFinale){ return dwalkCoinRoll(t2,depth,isFinale).label; }
function dwalkLootSlot(rarity){
  const map={ "very-rare":["dungeon-loot-very-rare","Very Rare"], "rare":["dungeon-loot-rare","Rare"], "uncommon":["dungeon-loot-uncommon","Uncommon"], "common":["dungeon-loot-common","Common"] };
  const m=map[rarity]; if(!m) return null;
  const [name,desc]=walkPick(m[0],1,2);
  return { rarity:m[1], name, desc };
}
/* ECONOMY-SINKS §B / BATCH-GUARDRAILS G6 — "maxed coin roll" upgrade: the coin slot occasionally
   attaches a valuable alongside coin when the roll lands at/above 80% of that expression's maximum
   possible total (exact threshold; computed from the real dice expression via dwalkCoinRoll, not a
   fixed probability). Deterministic given the roll — no new budget math, no separate chance roll. */
function dwalkLoot(rarity, depth, isFinale, t2, hasEnemy){
  const cr=dwalkCoinRoll(t2,depth,isFinale);
  const valuable=(cr.gp>=0.8*cr.maxGp && typeof walkPick==="function") ? dwalkValuable() : null;
  return { magic: rarity?dwalkLootSlot(rarity):null, coin: cr.label, valuable, enemyLoot: !!(hasEnemy && !isFinale) };
}
/* dwalkValuable() — one draw off the valuables table (docs/ECONOMY-SINKS.md §B), shaped like an
   inventory-ready spec (name/value/note) so callers can hand it straight to item_changed's add[]. */
function dwalkValuable(){
  const [item,value,note]=walkPick("dungeon-loot-valuables",2,3,4);
  const gp=parseInt(value,10);
  return { name:item, value:(isNaN(gp)?null:gp), note };
}

/* WALK-REFRESH §2.2 — the Outlandish d300 (`dungeon-loot-outlandish`) L4 banding: PROVISIONAL, tags
   drafted by a later unit (tables-wave2b, BATCH2-GUARDRAILS H2 — a DM-only `Band` column: utility/
   combat/high-power/reality-breaking; rows byte-untouched otherwise). This unit ships the GATE
   null-safe: the compiler (Engine/00. _System/compile-tables.py) detects any header containing
   "band" and surfaces it per-row as rollTable()'s `.band` — that column doesn't exist on this table
   yet, so `.band` is "" on every row today and dwalkOutlandish() draws unfiltered (graceful: no
   crash, no silent drop). The moment tables-wave2b adds the column, `.band` populates and the level
   gate below activates automatically. Constants are tunable, named in one place per BATCH-GUARDRAILS
   G9.
   NOTE (code-review 2026-07-02): the compiler's `cols` (row[5]) keeps EVERY column except the die-
   index/legs/pool — it does NOT strip Band out, so once the Band column lands (leading, per the
   dungeon-loot-valuables convention: d100|Band|Item|Value|Note) row[5] becomes [Band,Item,Origin,
   Effect] and a fixed c[0]/c[1]/c[2] read would silently shift name/origin/effect by one column. The
   reads below are band-aware (skip the leading cell when it echoes row[2]'s band value) so they
   survive that future column shift with zero further code changes — matching how dwalkValuable()
   already skips the leading Band column via walkPick(...,2,3,4). */
const DWALK_OUTLANDISH_GATE = { utility:1, combat:3, "high-power":6, "reality-breaking":9 };
function dwalkOutlandishAllowed(level){
  const L=level||1;
  return Object.keys(DWALK_OUTLANDISH_GATE).filter(band=>L>=DWALK_OUTLANDISH_GATE[band]);
}
function dwalkOutlandish(level){
  if(typeof rollTable!=="function") return null;
  const rows=walkRows("dungeon-loot-outlandish");
  if(!rows.length) return null;
  const allowed=dwalkOutlandishAllowed(level);
  const tagged=rows.filter(r=>(r[2]||"").trim());        // r[2] = the compiled band col (absent today)
  const pool = tagged.length ? tagged.filter(r=>allowed.indexOf((r[2]||"").trim())>=0) : rows;
  const use = pool.length ? pool : rows;                 // never empty out the table on a too-low level
  const row=walkRnd(use), c=row[5]||[];
  const band=(row[2]||"").trim();
  // band-aware offset: if the leading content cell IS the band tag (future Band column), skip it.
  const base=(band && (c[0]||"").trim()===band) ? 1 : 0;
  return { band:row[2]||null, name:c[base]||null, origin:c[base+1]||null, effect:c[base+2]||null };
}

// ─── encounter (Dungeon Encounter Type → branch) ─────────────────────────────
function dwalkEncounter(threat, t2){
  const [encType]=walkPick("dungeon-encounter-type",1);
  const has=s=>encType.indexOf(s)>=0;
  if(has("Enemy")||has("Faction")){
    const [terrain]=walkPick("tactical-terrain",1);
    if(Math.random()<0.75){
      const [compName,compRoster,compT]=walkPick("dungeon-enemy-composition",1,2,3);
      if(compName==="Interrupted Conflict"){
        const [fA]=walkPick("dungeon-enemy-category",1), [fB]=walkPick("dungeon-enemy-category",1);
        return { type:"Enemy", subtype:"Faction Clash", factions:[fA,fB], tactic:compT, terrain, isEnemy:true, text:`Faction clash: ${fA} vs ${fB} — ${compT}` };
      }
      const slots=DWALK_SLOT_MAP[compName]||["low"];
      // WALK-REFRESH §1: live roster resolution — resolveArchetypePool (registry-filtered BESTIARY ∪ the
      // authored pool as the floor); graceful fallback to the old walkPickFromPool if the registry module
      // isn't loaded (a lean headless context that only concatenates dungeon-walk.js + walk.js).
      const dwalkPick=(pool,slot)=>(typeof resolveArchetypePool==="function")
        ? resolveArchetypePool(threat.id, {tier:t2?2:1, slot}, pool) : walkPickFromPool(pool);
      const creatures=slots.map(slot=>({ slot:(slot==="boss"?"Boss CR":slot==="mid"?"Mid CR":"Low CR"),
        creature: slot==="boss"?dwalkPick(threat.boss,"boss"):slot==="mid"?dwalkPick(threat.mid,"mid"):dwalkPick(threat.low,"low") }));
      return { type:"Enemy", composition:compName, roster:compRoster, tactic:compT, terrain, threatId:threat.id, creatures, isEnemy:true,
               text:`${compName} (${threat.id}): ${compRoster} — ${compT}` };
    }
    const [enemy]=walkPick("dungeon-enemy-category",1);
    return { type:"Enemy", subtype:"Complication", terrain, isEnemy:true, text:`Enemy complication: ${enemy}` };
  }
  if(has("Hazard")||has("Trap")){ const [hn,hc,hf]=walkPick("dungeon-hazard",1,2,3); return { type:"Hazard", isEnemy:false, text:`${hn} — ${hc} | ${hf}` }; }
  if(has("Social")||has("Contact")){ const [entity,hook]=walkPick("dungeon-contact",1,3); const [dn,ds,dm,dl]=walkPick("dungeon-narrative-device",1,2,3,4);
    return { type:"Social", isEnemy:false, npc:{ entity, hook }, device:{ name:dn, situation:ds, misread:dm, leverage:dl }, text:`${entity} — ${hook}` }; }
  if(has("Problem")||has("Lock")){ const [obstacle,bypass]=walkPick("dungeon-problem",1,2); return { type:"Problem", isEnemy:false, text:`${obstacle} — ${bypass}` }; }
  if(has("Discovery")){ const [form]=walkPick("dungeon-discovery-form",1), [content]=walkPick("dungeon-discovery-content",1);
    // WALK-REFRESH §2.3 — spice-gated (Strange+) chance the discovery IS a rollItem macguffin.
    const macguffin=(typeof walkIsStrangePlus==="function" && walkIsStrangePlus() && typeof rollItem==="function") ? rollItem({}) : null;
    return { type:"Discovery", isEnemy:false, form, content, macguffin, text:`${form}: ${content}` }; }
  if(has("Lore")){ const lc=walkRows("dungeon-lore-content"), la=walkRows("dungeon-lore-art");
    if(lc.length && la.length){ const i=Math.floor(Math.random()*Math.min(lc.length,la.length)); return { type:"Lore", isEnemy:false, revelation:(lc[i][5]&&lc[i][5][0])||"", art:(la[i][5]&&la[i][5][0])||"", text:`Lore: ${(lc[i][5]&&lc[i][5][0])||""}` }; }
    const [f]=walkPick("dungeon-lore-content",1); return { type:"Lore", isEnemy:false, text:`Lore: ${f}` }; }
  const [en,ef]=walkPick("dungeon-empty-result",2,3);
  return { type:"Empty", isEnemy:false, text:`${en} — ${ef}` };
}

function dwalkSecret(){
  const [tier,desc]=walkPick("dungeon-secret-tier",1,2);
  const [reveal,skills]=walkPick("dungeon-secret-reveal-type",1,2);
  return { tier, desc, reveal, skills };
}

// boss/revelation filtered by the rolled Myth Seed's affinity. NOTE: this returns an archetype FLAVOR
// (text), not a CR-numbered stat-block pull — so the Tier-2 CR ceiling is NOT enforced here. The real
// cap is the prep-bundle constraint `meta.crCeiling` (docs/TIER-SCOPE.md): the DM honors it when picking
// the actual stat block, never fielding a CR>crCeiling boss in a T2 scene.
function dwalkBoss(affinity){
  const rows=walkRows("dungeon-boss"); if(!rows.length) return { archetype:"[Boss?]", behavior:"" };
  const list=(affinity||"").split(/\s*,\s*/).map(s=>s.trim()).filter(Boolean);
  if(list.length){ const f=rows.filter(r=>list.some(a=>((r[5]&&r[5][0])||"").includes(a))); if(f.length>=3){ const c=walkRnd(f)[5]||[]; return { archetype:c[0]||"[Boss?]", behavior:c[1]||"" }; } }
  const c=walkRnd(rows)[5]||[]; return { archetype:c[0]||"[Boss?]", behavior:c[1]||"" };
}
function dwalkRevelation(affinity){
  const rows=walkRows("dungeon-revelation"); if(!rows.length) return "";
  const nums=(affinity||"").split(/\s*,\s*/).map(s=>parseInt(s.trim(),10)).filter(n=>!isNaN(n));
  if(nums.length>=2){ const f=rows.filter(r=>nums.includes(r[0])); if(f.length>=2) return (walkRnd(f)[5]||[])[0]||""; }
  return (walkRnd(rows)[5]||[])[0]||"";
}

/* ============================================================
   PUBLIC — roll a full dungeon → data structure
   opts: { segCount=3, tier=1, topology?, threat? }
   ============================================================ */
function rollDungeonWalk(opts){
  opts=opts||{};
  const region=opts.region||null;   // REGIONS-NAMES.md §1 — optional w.regions[] record (soft-biases the skin roll)
  const segCount=Math.max(1, Math.min(13, opts.segCount||3));
  const t2=Math.min(2, opts.tier||1)>=2;   // clamp to the Tier-2 cap: a T3+ input gets T2 content, never reaches for T3/T4
  const tier=t2?"T2":"T1";

  // setup rolls — the briefing bag
  const [typeArch,typeAtmo]=walkPick("dungeon-type",1,3);
  const [originCat,originFlav]=walkPick("dungeon-origin",1,3);
  const [skinName,skinVis]=walkPick("dungeon-environment-skin",1,2);
  const [motifName,motifDesc]=walkPick("dungeon-art-motif",1,2);
  const [modName,modDesc]=walkPick("dungeon-art-motif-modifier",1,2);
  const [restName,restDesc]=walkPick("dungeon-rest-complications",1,2);
  const [witnessDistort]=walkPick("myth-witness-distortion-table",1);
  const [mythSeed,bossAffinity,revelAffinity]=walkPick("myth-seeds",1,2,3);

  // topology: opts override → roll from table → validate → random fallback
  let topoName=opts.topology, topoDesc="";
  if(DUNGEON_TOPOLOGIES.indexOf(topoName)<0){ const [tn,td]=walkPick("dungeon-topology",1,2);
    topoName = DUNGEON_TOPOLOGIES.indexOf(tn)>=0 ? tn : walkRnd(DUNGEON_TOPOLOGIES); topoDesc=td||""; }

  // threat context (7 cols)
  const threatId = t2?"dungeon-threat-identity-t2":"dungeon-threat-identity-t1";
  let threat=opts.threat;
  if(!threat){ const tr=walkRows(threatId);
    if(tr.length){ const c=walkRnd(tr)[5]||[]; threat={ id:(c[0]||"Unknown").trim(), role:(c[1]||"").trim(), low:(c[2]||"Bandit").trim(), mid:(c[3]||"Captain").trim(), boss:(c[4]||"Boss").trim(), scale:(c[5]||"").trim(), signs:(c[6]||"").trim() }; }
    else threat={ id:"Unknown", role:"", low:"Bandit", mid:"Captain", boss:"Boss", scale:"", signs:"" }; }

  // topology → graph → ordering
  const { resolved, original, wasFallback }=dwalkResolveTopology(topoName, segCount);
  const sizePref=DWALK_TOPO_SIZE[resolved]||"any";
  const graph=DWALK_GRAPH_BUILDERS[resolved](segCount);
  const { order, depth }=walkBfs(graph.adj, graph.entry);
  const roomNum=walkAssignSegNumbers(order, graph.nodes);
  const nodeMap=Object.fromEntries(graph.nodes.map(n=>[n.id,n]));
  const finaleId=order.find(id=>nodeMap[id]?.isFinale)||order[order.length-1];
  const budget=dwalkBudget(segCount, t2);
  const lootByNode=dwalkAssignLoot(budget, order, depth, finaleId);

  const rooms=order.map(nodeId=>{
    const node=nodeMap[nodeId], num=roomNum[nodeId], d=depth[nodeId];
    const exits=(graph.adj[nodeId]||[]).map(t=>({ targetId:t, num:roomNum[t], label:nodeMap[t]?.label||"", isFinale:!!nodeMap[t]?.isFinale }));
    const area=dwalkArea(sizePref);
    const [scene]=walkPick("dungeon-scene",1);
    const [lighting,lightFlavor]=walkPick("dungeon-lighting",1,2);
    const [sensory]=walkPick("dungeon-sensory",1);
    const [object,objFlavor]=walkPick("dungeon-interactable-object",1,2);
    const [feature,featFlavor,featDims]=walkPick("dungeon-feature",1,2,3);
    const base={ id:nodeId, num, label:node.label, isFinale:!!node.isFinale, depth:d, exits,
                 areaType:area.areaType, dims:area.dims, side:area.side, scene, lighting, lightFlavor, sensory,
                 object:{ name:object, flavor:objFlavor }, feature:{ name:feature, flavor:featFlavor, dims:featDims },
                 secret:dwalkSecret() };
    if(node.isFinale){
      const boss=dwalkBoss(bossAffinity), revelation=dwalkRevelation(revelAffinity);
      const [finaleType,finaleDesc]=walkPick("dungeon-finale-type",1,3), [exitState]=walkPick("dungeon-exit-state",1);
      const [dn,ds,dm,dl]=walkPick("dungeon-narrative-device",1,2,3,4);
      const bossCreature=Math.random()<0.90
        ?(typeof resolveArchetypePool==="function"?resolveArchetypePool(threat.id,{tier:t2?2:1,slot:"boss"},threat.boss):walkPickFromPool(threat.boss))
        :boss.archetype;
      base.finale={ finaleType, finaleDesc, bossCreature, bossArchetype:boss.archetype, bossBehavior:boss.behavior,
                    device:{ name:dn, situation:ds, misread:dm, leverage:dl }, revelation, exitState };
      base.loot=dwalkLoot(lootByNode[nodeId], d, true, t2, false);
    } else {
      base.encounter=dwalkEncounter(threat, t2);
      base.loot=dwalkLoot(lootByNode[nodeId], d, false, t2, base.encounter.isEnemy);
    }
    return base;
  }).sort((a,b)=>a.num-b.num);

  const edgeSet=new Set(), edges=[];
  for(const n of graph.nodes) for(const nb of (graph.adj[n.id]||[])){ const k=[n.id,nb].sort().join("|"); if(!edgeSet.has(k)){ edgeSet.add(k); edges.push([roomNum[n.id],roomNum[nb]]); } }

  return {
    environment:"dungeon", topology:resolved, topologyDesc:topoDesc, tier, segCount,
    fallbackFrom: wasFallback?original:null, threat, haul:budget,
    setup:{ type:typeArch, atmosphere:typeAtmo, origin:originCat, originFlavor:originFlav, skin:skinName, skinVisual:skinVis,
            motif:motifName, motifDesc, motifModifier:modName, motifModifierDesc:modDesc, rest:restName, restDesc,
            mythSeed, witnessDistortion:witnessDistort },
    // WALK-REFRESH §3 — the rolled skin (null-safe until tables-wave1 authors walk-skin-dungeon).
    // REGIONS-NAMES.md §1: regionBiasedWalkSkin soft-biases toward the region's skinBias words.
    skin: (typeof regionBiasedWalkSkin==="function") ? regionBiasedWalkSkin(region,"dungeon")
        : ((typeof rollWalkSkin==="function") ? rollWalkSkin("dungeon") : null),
    segments:rooms, edges,
  };
}
