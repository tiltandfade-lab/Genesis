/* verify-walk-consumption.mjs — headless test for WALK-CONSUMPTION (docs/WALK-CONSUMPTION.md):
   Step A (active-walk digest + cursor), Step B (advance/reskin on complete), Step C (provenance),
   Step D (substantive default length) + suspension/resume. Loads the real modules with app-global stubs.
   Run: node dev/verify-walk-consumption.mjs   (from repo root) */
import { readFileSync } from "node:fs";
const read = p => readFileSync(p, "utf8");

const stubs = `
  var localStorage={getItem:()=>null,setItem:()=>{}};
  var U={worlds:{},activeWorldId:null,revealed:{}};
  var GS={}, SEED=1;
  function toast(){} function renderWorld(){} function wakeReveal(){} function pushDmLog(){}
  var fetch=()=>Promise.reject("no-net");
`;
const files = ["tables.js","src/engine/core.js","data/names.js","src/engine/compiled.js",
  "src/engine/walk.js","src/engine/dungeon-walk.js","src/engine/wild-walk.js","src/engine/quest-hook.js",
  "src/engine/codex-roll.js","src/engine/prep-bundle.js",
  "src/world/state.js","src/world/codex.js","src/world/seam.js","src/world/prep.js",
  "src/world/capture.js","src/world/dm.js"];
const factory = new Function("window",
  stubs + "\n" + files.map(read).join("\n") +
  ";return { startPrep, applyPrep, lockOnContact, walkOfFrontier, walkAdvance, walkComplete, walkSetActive, walkStamp, prepOf, mapOf, ledgerOf, codexOf, codexGet, activeWalkDigest, dmDigestLocationLine, applyEvent, walkProvenanceReport, seamHarvest, assemblePrepBundle };");
const A = factory({});

let pass=0, fail=0; const fails=[];
const ok=(c,m)=>{ if(c) pass++; else { fail++; fails.push(m); } };

function freshWorld(level){
  return { id:"w1", name:"Test World", session:1, currentNodeId:"home",
    map:{ nodes:{ home:{id:"home",name:"Home",type:"Setting",x:0,y:0} }, edges:[] },
    ledger:[], clock:{day:1,min:600},
    characters:[{status:"living",name:"Wren",conditions:[],sheet:{level:level||3}}],
    factions:[{name:"Ashguild",dominant:true,agenda:"control the docks",method:"extortion",clock:{filled:1,size:6}}],
    pressures:[{kind:"external",danger:"a fleet",clock:{filled:1,size:8},real:{text:"a slaver armada"},doom:"the town falls"}],
    seed:{} };
}

// ── Step A: lockOnContact sets the active walk + cursor; the digest carries it ─────
const w = freshWorld(3);
A.startPrep(w);
const urbanId = Object.keys(w.prep.nodes).find(id=>w.prep.nodes[id].env==="urban");
const lr = A.lockOnContact(w, urbanId);
ok(lr.ok, "lockOnContact ok");
ok(w.prep.activeWalkId===urbanId, "activeWalkId set to the contacted frontier");
const walk = A.walkOfFrontier(w, urbanId);
const entry = walk.segments.find(s=>s.depth===0) || walk.segments[0];
ok(w.prep.nodes[urbanId].cursor && w.prep.nodes[urbanId].cursor.current===entry.num, "cursor starts at the entry segment");

let dig = A.activeWalkDigest(w);
ok(dig && dig.nodeId===urbanId, "activeWalkDigest non-null for the active walk");
ok(dig.cursor.total===walk.segments.length, "digest cursor.total includes the real appended finale");
ok(dig.segments.length===walk.segments.length, "digest carries every segment");
ok(dig.segments.filter(s=>s.state==="here").length===1, "exactly one segment is 'here'");
ok(dig.segments.find(s=>s.num===entry.num).state==="here", "the entry segment is 'here'");
ok(dig.segments.filter(s=>s.state==="ahead").length===walk.segments.length-1, "the rest are 'ahead'");
const reachableNums=new Set((entry.exits||[]).map(e=>e.num));
const approaches=dig.segments.filter(s=>s.approach);
ok(approaches.length===reachableNums.size&&approaches.every(s=>reachableNums.has(s.num)),
  "only immediate graph exits carry actionable approach previews");
ok(approaches.every(s=>s.gist&&((s.encounter&&s.encounter.type)||
    (s.isFinale&&s.finale&&(s.finale.track||s.finale.sceneFrame)))),
  "immediate approach previews expose generated scene/encounter or finale truth before arrival");
ok(dig.segments.filter(s=>s.state==="ahead"&&!s.approach).every(s=>!s.gist&&!s.encounter),
  "farther-ahead segments remain veiled stubs");
let locationLine=A.dmDigestLocationLine(w);
ok(locationLine.includes("segment "+entry.num)&&locationLine.includes(entry.areaType)&&locationLine.includes(entry.dims),
  "location line names the live walk segment instead of only the underlying frontier place");

// ── Step A: walk_advance moves the cursor; reaching a finale does NOT complete ────
const immediateNum=(entry.exits&&entry.exits[0]&&entry.exits[0].num);
const second = walk.segments.find(s=>s.num===immediateNum) || walk.segments.find(s=>s.num!==entry.num) || walk.segments[1] || entry;
second.exits=second.exits||[];
if(!second.exits.some(e=>e&&e.num===entry.num))second.exits.push({targetId:entry.id,num:entry.num,label:entry.label,isFinale:!!entry.isFinale});
const adv = A.applyEvent(w, {type:"walk_advance", payload:{toSegment:second.num}});
ok(adv.ok && adv.current===second.num, "walk_advance folds natural toSegment alias and moves the cursor");
dig = A.activeWalkDigest(w);
locationLine=A.dmDigestLocationLine(w);
ok(dig.cursor.touched.indexOf(entry.num)>=0 && dig.cursor.touched.indexOf(second.num)>=0, "touched accumulates entry + new segment");
ok(dig.segments.find(s=>s.num===second.num).state==="here", "the new segment is 'here'");
ok(dig.segments.find(s=>s.num===entry.num).state==="behind", "the entry segment is now 'behind'");
ok(dig.segments.find(s=>s.num===entry.num).approach===true,
  "a reachable return exit stays actionable even when its segment is behind/touched");
ok(dig.segments.find(s=>s.num===entry.num).gist&&dig.segments.find(s=>s.num===entry.num).encounter,
  "a reachable return exit retains generated scene/encounter truth");
ok(locationLine.includes("segment "+second.num)&&locationLine.includes(second.areaType)&&locationLine.includes(second.dims),
  "location line follows walk_advance to the new current segment");
const resolved=A.applyEvent(w,{type:"encounter_resolved",payload:{foes:[],method:"stealth",objectiveRef:"cross unseen",outcome:"averted"}});
dig=A.activeWalkDigest(w);
const resolvedHere=dig.segments.find(s=>s.num===second.num);
ok(resolved.ok&&resolved.walkResolution&&resolvedHere.resolution&&resolvedHere.resolution.state==="resolved",
  "encounter resolution folds into the active segment overlay");
ok(resolvedHere.resolution.method==="stealth"&&resolvedHere.resolution.outcome==="averted",
  "active-walk digest exposes the segment's settled method and outcome");
const fin = walk.segments.find(s=>s.isFinale);
if(fin){ A.applyEvent(w, {type:"walk_advance", payload:{toSeg:fin.num}});
  ok(w.prep.nodes[urbanId].cursor.done===false, "reaching the finale segment does NOT auto-complete the walk");
  const finaleDigest=A.activeWalkDigest(w).segments.find(s=>s.num===fin.num);
  ok(finaleDigest&&finaleDigest.finale&&finaleDigest.finale.track&&finaleDigest.finale.sceneFrame,
    "actionable finale digest exposes its nested track, authored scene, and consequence truth");
  ok(finaleDigest&&finaleDigest.reward&&finaleDigest.reward.coin,
    "actionable finale digest exposes its rolled reward instead of inviting invention"); }
else ok(true, "(no finale segment in this topology — skip)");

// ── Step A: no active walk → digest null ──────────────────────────────────────────
const w2 = freshWorld(3); A.startPrep(w2);
ok(A.activeWalkDigest(w2)===null, "no contact → activeWalk digest is null");

// Switching walks suspends; returning resumes the exact cursor.
const ws = freshWorld(3); A.startPrep(ws);
const wsUrban = Object.keys(ws.prep.nodes).find(id=>ws.prep.nodes[id].env==="urban");
const wsDungeon = Object.keys(ws.prep.nodes).find(id=>ws.prep.nodes[id].env==="dungeon");
A.lockOnContact(ws,wsUrban);
const wsWalk=A.walkOfFrontier(ws,wsUrban);
const wsNext=wsWalk.segments.find(s=>s.num!==ws.prep.nodes[wsUrban].cursor.current);
A.walkAdvance(ws,wsNext.num);
const savedCursor=JSON.stringify(ws.prep.nodes[wsUrban].cursor);
A.lockOnContact(ws,wsDungeon);
ok(ws.prep.nodes[wsUrban].walkState==="suspended", "switching walks marks the prior walk suspended");
ok(ws.prep.nodes[wsUrban].cursor.done===false, "switching does not mark the prior walk done");
ok(!A.ledgerOf(ws).some(e=>e.data&&e.data.kind==="walk-complete"&&e.data.nodeId===wsUrban), "switching writes no abandonment/completion ledger fact");
A.lockOnContact(ws,wsUrban);
ok(ws.prep.nodes[wsDungeon].walkState==="suspended", "the walk switched away from is also suspended");
ok(ws.prep.nodes[wsUrban].walkState==="active", "returning marks the original walk active");
ok(JSON.stringify(ws.prep.nodes[wsUrban].cursor)===savedCursor, "returning resumes the exact current/touched/ticked cursor");

// ── Step C: beat events carry a walk provenance stamp ─────────────────────────────
A.applyEvent(w, {type:"discovery", payload:{what:"a sealed grate"}});
const lastDisc = A.ledgerOf(w).slice().reverse().find(e=>e.data&&e.data.kind==="discovery");
ok(lastDisc && lastDisc.data.walk && lastDisc.data.walk.id===urbanId, "discovery beat stamped with the active walk id");
ok(lastDisc.data.walk.seg===fin?fin.num:second.num, "...stamped with the current segment");

// ── Step C: walkProvenanceReport reflects what ran ────────────────────────────────
const rep = A.walkProvenanceReport(w);
ok(rep.planned===3, "report: 3 walks planned");
ok(rep.walked===1, "report: 1 walk actually walked");
ok(rep.walks[0].ran === `${w.prep.nodes[urbanId].cursor.touched.length}/${walk.segments.length}`, "report: ran reflects touched/actual graph total");
ok(rep.consumption>0 && rep.consumption<=1, "report: consumption ratio in (0,1]");
ok(A.seamHarvest(w).walkProvenance && A.seamHarvest(w).walkProvenance.walked===1, "seamHarvest surfaces the provenance report");

// ── Step B: walk_complete finalizes + promotes the next frontier (needsReskin) ────
const comp = A.applyEvent(w, {type:"walk_complete", payload:{}});
ok(comp.ok, "walk_complete ok");
ok(w.prep.activeWalkId===null, "active walk cleared on complete");
ok(w.prep.nodes[urbanId].cursor.done===true, "the completed walk is marked done");
ok(w.prep.walkLog.find(l=>l.walkId===urbanId).finaleReached===true, "walkLog records the finale reached");
ok(!!comp.next && w.prep.nodes[comp.next].needsReskin===true, "the next frontier is promoted + flagged for reskin");
ok(A.mapOf(w).edges.some(e=>e.from===w.currentNodeId && e.to===comp.next && e.soft), "a soft lead re-anchors from the party's position");

// ── Step B: applyPrep clears needsReskin on the promoted frontier ─────────────────
const nextEnv = w.prep.nodes[comp.next].env;
A.applyPrep(w, { overlays:{ [nextEnv]:{ env:nextEnv, briefing:"Reskinned to the new ground.", segments:[] } } });
ok(w.prep.nodes[comp.next].needsReskin===false, "applyPrep clears needsReskin once reskinned");

// ── Step B: abandon path ──────────────────────────────────────────────────────────
const w3 = freshWorld(3); A.startPrep(w3);
const u3 = Object.keys(w3.prep.nodes).find(id=>w3.prep.nodes[id].env==="urban");
A.lockOnContact(w3, u3);
const ab = A.applyEvent(w3, {type:"walk_complete", payload:{abandoned:true}});
ok(ab.ok && w3.prep.walkLog.find(l=>l.walkId===u3).finaleReached===false, "abandoned walk → finaleReached false");
ok(!!ab.next, "abandon still promotes the next frontier");

// ── Step D: default walks stay substantive at every level ─────────────────────────────────────────
const b1 = A.assemblePrepBundle({level:1});
const b10 = A.assemblePrepBundle({level:10});
const segOf = (b,kind)=> b.environments.find(e=>e.kind===kind).walk.segments.length;
for(const kind of ["urban","dungeon","wilderness"]){
  ok(segOf(b1,kind)>=8&&segOf(b1,kind)<=12, `L1 ${kind} walk is in the 8–12 band (got ${segOf(b1,kind)})`);
  ok(segOf(b10,kind)>=8&&segOf(b10,kind)<=12, `L10 ${kind} walk is in the 8–12 band (got ${segOf(b10,kind)})`);
  ok(segOf(b1,kind)===segOf(b10,kind), `${kind} length is not nerfed by character level`);
}

console.log(`\n${fail===0?"✅ PASS":"❌ FAIL"} — ${pass} assertions passed, ${fail} failed`);
if(fail){ for(const f of fails) console.log("   ✗ "+f); process.exit(1); }
