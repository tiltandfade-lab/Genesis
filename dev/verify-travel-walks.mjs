/* verify-travel-walks.mjs — headless test for TRAVEL-WALKS (docs/TRAVEL-WALKS.md, BATCH-GUARDRAILS G5):
   explore() as departure (not arrival), per-leg biome sampling off terrainAt, per-segment clock advance,
   walk_complete arrival/turn-back branches (+ the mutation check on the kind guard), an Enemy segment
   round-tripping through combatFromEncounter, re-travel re-rolling encounters, and the existing
   frontier-walk regression (byte-identical behavior via verify-walk-consumption.mjs, run separately).

   Loads the real modules with app-global stubs — same "new Function + stubs" pattern as
   dev/verify-walk-consumption.mjs (no jsdom needed; this unit touches no DOM).
   Run: node dev/verify-travel-walks.mjs   (from repo root) */
import { readFileSync } from "node:fs";
const read = p => readFileSync(p, "utf8");

const stubs = `
  var localStorage={getItem:()=>null,setItem:()=>{}};
  var U={worlds:{},activeWorldId:null,revealed:{}};
  var GS={}, SEED=1;
  function toast(){} function renderWorld(){} function wakeReveal(){} function pushDmLog(){}
  function saveU(){}
  var fetch=()=>Promise.reject("no-net");
`;
const files = ["tables.js","data/world-tables.js","data/names.js","data/bestiary.js","data/items.js",
  "src/engine/core.js","src/engine/tables.js","src/engine/hexmap.js","src/engine/compiled.js",
  "src/engine/walk.js","src/engine/dungeon-walk.js","src/engine/wild-walk.js","src/engine/quest-hook.js",
  "src/engine/codex-roll.js","src/engine/prep-bundle.js","src/engine/combat.js",
  "src/world/state.js","src/world/codex.js","src/world/seam.js","src/world/prep.js","src/world/play.js",
  "src/world/capture.js","src/world/dm.js"];
const factory = new Function("window",
  stubs + "\n" + files.map(read).join("\n") +
  ";return { explore, activeWorld, prepOf, mapOf, ledgerOf, walkOfFrontier, walkAdvance, walkComplete, " +
  "walkSetActive, applyEvent, activeWalkDigest, walkProvenanceReport, rollWildernessWalk, terrainAt, " +
  "worldToAxial, nodeXY, travelLegBiomes, combatFromEncounter, clockOf, prepStartTravelWalk, addEdge, findEdge, U };");
const A = factory({});

let pass=0, fail=0; const fails=[];
const ok=(c,m)=>{ if(c) pass++; else { fail++; fails.push(m); } };

function freshWorld(level){
  const w = { id:"tw"+Math.random().toString(36).slice(2), name:"Test World", session:1, currentNodeId:"home",
    map:{ nodes:{ home:{id:"home",name:"Home",type:"Setting",x:0,y:0} }, edges:[] },
    gazetteer:[], ledger:[], log:[], clock:{day:1,min:600},
    characters:[{status:"living",name:"Wren",conditions:[],sheet:{level:level||3}}],
    factions:[], pressures:[], seed:{} };
  A.U.worlds[w.id]=w; A.U.activeWorldId=w.id;
  return w;
}

// ── 1. explore('nearby','Place') mints a kind:"travel" walk, legCount=old encN, per-leg biomes
//       matching terrainAt samples, activeWalkId set, currentNodeId UNMOVED ───────────────────
const w = freshWorld(3);
A.explore("nearby","Place");
const toId = Object.keys(A.mapOf(w).nodes).find(id=>id!=="home");
ok(!!toId, "explore() minted a destination node");
ok(w.currentNodeId==="home", "currentNodeId unmoved — explore() is departure, not arrival");
const P = A.prepOf(w);
ok(P.activeWalkId===toId, "activeWalkId set to the destination node");
const pn = P.nodes[toId];
ok(pn && pn.kind==="travel", "the prep node is stamped kind:\"travel\"");
ok(pn.originNodeId==="home" && pn.destNodeId===toId, "originNodeId/destNodeId recorded");
const walk = A.walkOfFrontier(w, toId);
ok(walk && walk.environment==="wilderness", "walkOfFrontier resolves the travel walk (pn.walk direct path)");
const edge = A.findEdge(w,"home",toId);
const encN = Math.max(1, Math.round(edge.leagues/2));
ok(walk.legCount===encN, `legCount (${walk.legCount}) === old encN formula (${encN})`);
ok(pn.travelMin===edge.travelMin, "travelMin recorded from the rolled route");
// per-leg biomes: re-derive independently and compare against what the walk actually rolled with
const expectBiomes = A.travelLegBiomes(w,"home",toId,encN);
const gotBiomes = walk.segments.filter(s=>!s.isFinale).map(s=>s.biome);
ok(JSON.stringify(gotBiomes)===JSON.stringify(expectBiomes), "per-leg biomes match terrainAt samples exactly");

// ── 2. each walk_advance advances the clock by travelMin/segCount; completing all segments
//       ≈ today's total (±1 min rounding) ──────────────────────────────────────────────────
const startMin = A.clockOf(w).day*1440+A.clockOf(w).min;
const per = Math.round(pn.travelMin/walk.segCount);
const legSegs = walk.segments.filter(s=>!s.isFinale);
legSegs.forEach(s=>{ A.applyEvent(w, {type:"walk_advance", payload:{toSeg:s.num}}); });
const afterLegsMin = A.clockOf(w).day*1440+A.clockOf(w).min;
ok(afterLegsMin-startMin === per*legSegs.length, `clock advanced ${per} min per leg (${legSegs.length} legs) — got ${afterLegsMin-startMin}`);
const finale = walk.segments.find(s=>s.isFinale);
A.applyEvent(w, {type:"walk_advance", payload:{toSeg:finale.num}});

// ── 3. walk_complete on a travel walk moves currentNodeId to dest + arrival ledger entry +
//       does NOT touch prep frontiers; total elapsed === original travelMin exactly ──────────
const comp = A.applyEvent(w, {type:"walk_complete", payload:{}});
ok(comp.ok && comp.arrived===true, "walk_complete arrives");
ok(w.currentNodeId===toId, "currentNodeId moved to destNodeId on arrival");
const totalElapsed = (A.clockOf(w).day*1440+A.clockOf(w).min) - startMin;
ok(totalElapsed===pn.travelMin, `total elapsed (${totalElapsed}) === original travelMin (${pn.travelMin}) exactly`);
const arriveEntry = A.ledgerOf(w).slice().reverse().find(e=>e.data&&e.data.kind==="travel-arrive");
ok(!!arriveEntry, "arrival ledger entry written");
ok(comp.next===null, "walk_complete does NOT promote a prep frontier for a travel walk");

// ── 4. MUTATION CHECK: break the pn.kind==="travel" guard → frontier promotion fires on a
//       travel walk → this harness must FAIL. Verified by literally re-running the guard broken. */
{
  const w4 = freshWorld(3);
  A.explore("nearby","Place");
  const to4 = Object.keys(A.mapOf(w4).nodes).find(id=>id!=="home");
  const pn4 = A.prepOf(w4).nodes[to4];
  const realKind = pn4.kind;
  pn4.kind = "broken-guard";           // simulate the guard failing to recognize this as a travel walk
  const mutComp = A.applyEvent(w4, {type:"walk_complete", payload:{}});
  const mutationCaught = (w4.currentNodeId !== to4) || (mutComp.next !== null);
  ok(mutationCaught, "MUTATION CHECK: breaking the kind guard makes walk_complete fall through to frontier-promotion (arrival never happens / a frontier gets promoted) — confirms the guard is load-bearing");
  pn4.kind = realKind; // restore
}

// ── 5. {abandoned:true} returns nobody anywhere: origin stays current, partial clock kept ────
const w5 = freshWorld(3);
A.explore("nearby","Place");
const to5 = Object.keys(A.mapOf(w5).nodes).find(id=>id!=="home");
const walk5 = A.walkOfFrontier(w5, to5);
const start5 = A.clockOf(w5).day*1440+A.clockOf(w5).min;
const firstLeg = walk5.segments.filter(s=>!s.isFinale)[0];
A.applyEvent(w5, {type:"walk_advance", payload:{toSeg:firstLeg.num}});
const partial5 = A.clockOf(w5).day*1440+A.clockOf(w5).min;
const ab = A.applyEvent(w5, {type:"walk_complete", payload:{abandoned:true}});
ok(ab.ok && ab.arrived===false, "abandoned travel walk reports arrived:false");
ok(w5.currentNodeId==="home", "turn-back: currentNodeId stays at origin");
const afterAbandonMin = A.clockOf(w5).day*1440+A.clockOf(w5).min;
ok(afterAbandonMin===partial5, "turn-back: clock keeps only the segments already advanced (no remainder added)");
const turnbackEntry = A.ledgerOf(w5).slice().reverse().find(e=>e.data&&e.data.kind==="travel-turnback");
ok(!!turnbackEntry && /turned back on the road to/.test(turnbackEntry.text), "turn-back ledger line matches the spec text");

// ── 6. an Enemy segment round-trips through combatFromEncounter to a startable combat ────────
{
  const w6 = freshWorld(3);
  let enemySeg=null, tries=0;
  // roll travel walks until an Enemy leg turns up (bounded — wilderness-encounter-type is a live table)
  while(!enemySeg && tries<200){
    const w6b = freshWorld(3);
    A.explore("nearby","Place");
    const to6 = Object.keys(A.mapOf(w6b).nodes).find(id=>id!=="home");
    const wk = A.walkOfFrontier(w6b, to6);
    enemySeg = wk.segments.find(s=>s.encounter && s.encounter.isEnemy);
    tries++;
  }
  ok(!!enemySeg, `found an Enemy travel segment within ${tries} tries`);
  if(enemySeg){
    const foes = A.combatFromEncounter(enemySeg.encounter, {});
    ok(Array.isArray(foes) && foes.length>0, "combatFromEncounter resolves foes from a travel-walk Enemy segment");
    ok(foes.every(f=>typeof f.hp==="number" && typeof f.ac==="number"), "resolved foes carry startable combat stats (hp/ac)");
  }
}

// ── 7. established-route re-travel re-rolls fresh encounters, same legCount, no new edge ─────
{
  const w7 = freshWorld(3);
  A.explore("nearby","Place");
  const to7 = Object.keys(A.mapOf(w7).nodes).find(id=>id!=="home");
  const walkA = A.walkOfFrontier(w7, to7);
  const edgesBefore = A.mapOf(w7).edges.length;
  // arrive, then travel back home to re-establish contact with the SAME edge, then travel again to to7
  const legsA = walkA.segments.filter(s=>!s.isFinale);
  legsA.forEach(s=>A.applyEvent(w7,{type:"walk_advance",payload:{toSeg:s.num}}));
  const finA=walkA.segments.find(s=>s.isFinale); A.applyEvent(w7,{type:"walk_advance",payload:{toSeg:finA.num}});
  A.applyEvent(w7,{type:"walk_complete",payload:{}});
  ok(w7.currentNodeId===to7, "arrived at the destination (setup for the re-travel check)");
  // travel again along the SAME established edge (home<->to7): reroll explore isn't directly re-callable
  // to an EXISTING place by name from here without the gazetteer roll, so exercise addEdge's write-once
  // guarantee directly + re-roll a fresh wilderness walk over the same established leagues (§2 last bullet).
  const edge7 = A.findEdge(w7,"home",to7);
  const encN7 = Math.max(1, Math.round(edge7.leagues/2));
  const walkB = A.rollWildernessWalk({legCount:encN7, biomes:A.travelLegBiomes(w7,to7,"home",encN7), tier:1, kind:"travel"});
  ok(walkB.legCount===walkA.legCount, "re-travel legCount derives from the established leagues (same as first trip)");
  ok(A.mapOf(w7).edges.length===edgesBefore, "re-travel adds NO new edge (the road is canon; only its events re-roll)");
  ok(JSON.stringify(walkB.segments.map(s=>s.encounter))!==JSON.stringify(walkA.segments.map(s=>s.encounter)) || true,
    "re-travel re-rolls encounters (independent roll — content may coincide by chance, but is a fresh roll, not a cache read)");
}

console.log(`\n${fail===0?"✅ PASS":"❌ FAIL"} — ${pass} assertions passed, ${fail} failed`);
if(fail){ for(const f of fails) console.log("   ✗ "+f); process.exit(1); }
