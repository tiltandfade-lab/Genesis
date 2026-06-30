/* verify-walk-consumption.mjs — headless test for WALK-CONSUMPTION (docs/WALK-CONSUMPTION.md):
   Step A (active-walk digest + cursor), Step B (advance/reskin on complete), Step C (provenance),
   Step D (stage-scaled length). Loads the real modules with app-global stubs.
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
  ";return { startPrep, applyPrep, lockOnContact, walkOfFrontier, walkAdvance, walkComplete, walkSetActive, walkStamp, prepOf, mapOf, ledgerOf, codexOf, codexGet, activeWalkDigest, applyEvent, walkProvenanceReport, seamHarvest, assemblePrepBundle };");
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
ok(dig.cursor.total===walk.segCount, "digest cursor.total === walk.segCount");
ok(dig.segments.length===walk.segments.length, "digest carries every segment");
ok(dig.segments.filter(s=>s.state==="here").length===1, "exactly one segment is 'here'");
ok(dig.segments.find(s=>s.num===entry.num).state==="here", "the entry segment is 'here'");
ok(dig.segments.filter(s=>s.state==="ahead").length===walk.segments.length-1, "the rest are 'ahead'");

// ── Step A: walk_advance moves the cursor; reaching a finale does NOT complete ────
const second = walk.segments.find(s=>s.num!==entry.num) || walk.segments[1] || entry;
const adv = A.applyEvent(w, {type:"walk_advance", payload:{toSeg:second.num}});
ok(adv.ok && adv.current===second.num, "walk_advance moves the cursor");
dig = A.activeWalkDigest(w);
ok(dig.cursor.touched.indexOf(entry.num)>=0 && dig.cursor.touched.indexOf(second.num)>=0, "touched accumulates entry + new segment");
ok(dig.segments.find(s=>s.num===second.num).state==="here", "the new segment is 'here'");
ok(dig.segments.find(s=>s.num===entry.num).state==="behind", "the entry segment is now 'behind'");
const fin = walk.segments.find(s=>s.isFinale);
if(fin){ A.applyEvent(w, {type:"walk_advance", payload:{toSeg:fin.num}});
  ok(w.prep.nodes[urbanId].cursor.done===false, "reaching the finale segment does NOT auto-complete the walk"); }
else ok(true, "(no finale segment in this topology — skip)");

// ── Step A: no active walk → digest null ──────────────────────────────────────────
const w2 = freshWorld(3); A.startPrep(w2);
ok(A.activeWalkDigest(w2)===null, "no contact → activeWalk digest is null");

// ── Step C: beat events carry a walk provenance stamp ─────────────────────────────
A.applyEvent(w, {type:"discovery", payload:{what:"a sealed grate"}});
const lastDisc = A.ledgerOf(w).slice().reverse().find(e=>e.data&&e.data.kind==="discovery");
ok(lastDisc && lastDisc.data.walk && lastDisc.data.walk.id===urbanId, "discovery beat stamped with the active walk id");
ok(lastDisc.data.walk.seg===fin?fin.num:second.num, "...stamped with the current segment");

// ── Step C: walkProvenanceReport reflects what ran ────────────────────────────────
const rep = A.walkProvenanceReport(w);
ok(rep.planned===3, "report: 3 walks planned");
ok(rep.walked===1, "report: 1 walk actually walked");
ok(rep.walks[0].ran === `${w.prep.nodes[urbanId].cursor.touched.length}/${walk.segCount}`, "report: ran reflects touched/total");
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

// ── Step D: walk length scales with level ─────────────────────────────────────────
const b1 = A.assemblePrepBundle({level:1});
const b10 = A.assemblePrepBundle({level:10});
const segOf = (b,kind)=> b.environments.find(e=>e.kind===kind).walk.segCount;
ok(segOf(b1,"urban")===3, `L1 urban walk is 3 segs (got ${segOf(b1,"urban")})`);
ok(segOf(b1,"dungeon")===3, `L1 dungeon walk is 3 segs (got ${segOf(b1,"dungeon")})`);
ok(segOf(b10,"urban")===7, `L10 urban walk is 7 segs (got ${segOf(b10,"urban")})`);
ok(segOf(b1,"wilderness")===3, `L1 wilderness is 3 legs (got ${segOf(b1,"wilderness")})`);
ok(segOf(b10,"wilderness")===5, `L10 wilderness is 5 legs (got ${segOf(b10,"wilderness")})`);
// monotonic non-decreasing across levels
let mono=true, prev=0;
for(let L=1;L<=10;L++){ const s=A.assemblePrepBundle({level:L}).environments.find(e=>e.kind==="urban").walk.segCount; if(s<prev) mono=false; prev=s; }
ok(mono, "urban seg length is monotonic non-decreasing L1→L10");

console.log(`\n${fail===0?"✅ PASS":"❌ FAIL"} — ${pass} assertions passed, ${fail} failed`);
if(fail){ for(const f of fails) console.log("   ✗ "+f); process.exit(1); }
