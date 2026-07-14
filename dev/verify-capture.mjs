/* verify-capture.mjs — headless test for WALK-CONSUMPTION Step E (capture as re-entry, capture.js).
   Capture drops a subdued PC into a holding segment of the active walk (reuse or mint), nominates a
   pre-cast NPC as the lever, and lights a fireable disposition clock. Loads the real modules.
   Run: node dev/verify-capture.mjs   (from repo root) */
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
  ";return { startPrep, lockOnContact, walkOfFrontier, prepOf, mapOf, ledgerOf, codexGet, applyEvent, applyCapture, rollCapture, findClockTarget };");
const A = factory({});

let pass=0, fail=0; const fails=[];
const ok=(c,m)=>{ if(c) pass++; else { fail++; fails.push(m); } };

function freshWorld(){
  return { id:"w1", name:"Test World", session:1, currentNodeId:"home",
    map:{ nodes:{ home:{id:"home",name:"Home",type:"Setting",x:0,y:0} }, edges:[] },
    ledger:[], clock:{day:1,min:600},
    characters:[{status:"living",name:"Wren",conditions:[],sheet:{level:4}}],
    factions:[
      {name:"Ashguild",dominant:true,agenda:"control the docks",method:"extortion",clock:{filled:4,size:6}},
      {name:"Lamplighters",agenda:"keep the peace",method:"watch",clock:{filled:0,size:6}},
    ],
    pressures:[], seed:{} };
}

// ── rollCapture: the four sub-rolls produce well-formed nouns ─────────────────────
const r = A.rollCapture({disposition:"execution"});
ok(r.disposition && r.disposition.id==="execution", "rollCapture honors an explicit disposition");
ok(r.disposition.fuse>0 && r.disposition.fuse<=4, "execution-pending has a SHORT, fireable fuse");
ok(r.confiscation && r.opening && r.holdingNoun, "rollCapture yields confiscation + opening + holding noun");

// ── capture during an active walk: re-entry into a holding segment ────────────────
const w = freshWorld();
A.startPrep(w);
const urbanId = Object.keys(w.prep.nodes).find(id=>w.prep.nodes[id].env==="urban");
A.lockOnContact(w, urbanId);
const segCountBefore = A.walkOfFrontier(w, urbanId).segments.length;

const cap = A.applyEvent(w, {type:"capture", payload:{}});
ok(cap.ok, "capture event ok");
ok(cap.captor==="Ashguild", "captor = the faction most advanced against the PC (Ashguild 4/6)");
ok(w.characters[0].conditions.indexOf("captured")>=0, "PC gains the 'captured' condition");
ok(w.characters[0].captured && w.characters[0].captured.frontId, "PC carries a captured record (disposition + front)");

// holding segment: reused if one existed, else minted — either way the cursor sits on a holding node
const walkNow = A.walkOfFrontier(w, urbanId);
const holdSeg = walkNow.segments.find(s=>s.num===cap.holdingSeg);
ok(!!holdSeg, "capture points the cursor at a holding segment");
ok(w.prep.nodes[urbanId].cursor.current===cap.holdingSeg, "cursor moved to the holding segment");
ok(cap.minted ? walkNow.segments.length===segCountBefore+1 : walkNow.segments.length===segCountBefore,
   "minted → exactly one node appended; reused → no new node");

// lever: a pre-cast NPC nominated as possible-lever
ok(cap.leverId && A.codexGet(w, cap.leverId), "a lever NPC is nominated");
const lever = A.codexGet(w, cap.leverId);
ok(lever.dm && lever.dm.role==="possible-lever", "the lever is marked 'possible-lever' (DM decides ally/betray)");
const preCast = (w.prep.nodes[urbanId].cast && w.prep.nodes[urbanId].cast.npcIds)||[];
ok(preCast.indexOf(cap.leverId)>=0, "the lever is one of the pre-cast NPCs (no fresh invention)");

// disposition clock: a real, fireable front resolvable by the standard clock machinery
const tgt = A.findClockTarget(w, cap.frontId);
ok(tgt && tgt.kind==="front", "the disposition opened a front the clock machinery resolves");
ok(tgt.clock.size===cap.fuse && tgt.clock.size>0, "the disposition clock has a finite, fireable size");
const fired = A.applyEvent(w, {type:"clock_advanced", payload:{clockId:cap.frontId, delta:cap.fuse}});
ok(fired.fired===true, "advancing the disposition clock to its size FIRES it (capture can go wrong)");

// ledger beat carries the capture loop + walk provenance (Step C)
const beat = A.ledgerOf(w).slice().reverse().find(e=>e.data&&e.data.kind==="capture");
ok(beat && beat.data.walk && beat.data.walk.id===urbanId, "capture beat stamped with walk provenance");

// ── capture with NO active walk: mint a one-node holding walk ──────────────────────
const w2 = freshWorld();   // no startPrep / no contact → no active walk
const cap2 = A.applyCapture(w2, {});
ok(cap2.ok && cap2.minted, "capture with no active walk mints a holding walk");
ok(w2.prep.activeWalkId===cap2.at, "the minted holding walk becomes the active walk");
ok(w2.currentNodeId===cap2.at && A.mapOf(w2).nodes[cap2.at], "the PC is moved to the minted holding node");
ok(w2.characters[0].conditions.indexOf("captured")>=0, "PC captured in the no-walk path too");

console.log(`\n${fail===0?"✅ PASS":"❌ FAIL"} — ${pass} assertions passed, ${fail} failed`);
if(fail){ for(const f of fails) console.log("   ✗ "+f); process.exit(1); }
