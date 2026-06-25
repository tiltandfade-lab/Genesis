/* verify-session.mjs — headless test for the CODEX Phase 4 session frame (src/world/play.js):
   startSession (enter → beginSession casts the codex → cinematic) + endSession (close → recycle →
   back to world-select). Loads the real logic chain with the UI/DM layer stubbed.
   Run: node dev/verify-session.mjs   (from repo root) */
import { readFileSync } from "node:fs";
const read = p => readFileSync(p, "utf8");

const stubs = `
  var localStorage={ _s:{}, getItem(k){return this._s[k]||null;}, setItem(k,v){this._s[k]=v;} };
  var document={ getElementById:()=>null, querySelectorAll:()=>[], querySelector:()=>null };
  var GS={};
  var U={worlds:{},activeWorldId:null,revealed:{}}, SEED=1;
  var DM_BASE=""; function sendTurn(){}
  var fetch=()=>({ then:()=>({ catch:()=>{} }) });   // no DM bridge in the harness
  function renderWorld(){} function renderShelf(){} function showTab(t){ GS._tab=t; } function toast(){}
`;
const files = ["tables.js","src/engine/core.js","data/names.js","src/engine/compiled.js",
  "src/engine/walk.js","src/engine/dungeon-walk.js","src/engine/wild-walk.js","src/engine/quest-hook.js",
  "src/engine/codex-roll.js","src/engine/prep-bundle.js",
  "src/world/state.js","src/world/saga.js","src/world/codex.js","src/world/prep.js","src/world/play.js"];
const factory = new Function("window",
  stubs + "\n" + files.map(read).join("\n") +
  `;return { startSession, endSession, beginSession, U, codexOf, prepOf, mapOf, ledgerOf,
     setU(x){ U.worlds=x.worlds; U.activeWorldId=x.activeWorldId; }, getGS(){ return GS; } };`);
const A = factory({});

let pass=0, fail=0; const fails=[];
const ok=(c,m)=>{ if(c) pass++; else { fail++; fails.push(m); } };

function freshWorld(id){
  return { id, name:"Saltrest", session:0, currentNodeId:"home",
    seed:{ master:{name:"Saltrest",desc:"a salt-crusted port"} },
    map:{ nodes:{ home:{id:"home",name:"Saltrest",type:"Setting",x:0,y:0} }, edges:[] },
    ledger:[], log:[], dmlog:[], clock:{day:1,min:600}, gazetteer:[],
    characters:[{ id:"pc1", name:"Pendleton", status:"living", sheet:{level:2} }],
    factions:[{name:"Cinder Syndicate",dominant:true,agenda:"own the docks",method:"debt",clock:{filled:0,size:6}}],
    pressures:[{kind:"internal",danger:"a strike",clock:{filled:0,size:6}}], seed2:{} };
}
A.U.worlds = { w1: freshWorld("w1") };
A.U.activeWorldId = null;

// ── startSession: enters the world, begins a session, casts the codex ─────────
A.startSession("w1");
const w = A.U.worlds.w1;
ok(A.U.activeWorldId==="w1", "startSession selects the world");
ok(w.sessionLive===true, "session marked live");
ok(w.session===1, "session counter incremented to 1");
const cast = Object.values(A.codexOf(w).records).filter(r=>r.provenance==="prep");
ok(cast.length>=6, `startSession cast the codex (≥6 prep records; got ${cast.length})`);
ok(cast.some(r=>r.kind==="location") && cast.some(r=>r.kind==="npc"), "cast has locations + NPCs");
ok(w.prep && w.prep.bundle && w.prep.bundle.environments.length===3, "prep bundle staged (3 frontiers)");
ok(A.ledgerOf(w).some(e=>e.data&&e.data.kind==="prep"), "prep staged in ledger");

// ── idempotent: re-starting a LIVE session doesn't double-increment / re-cast ──
const castBefore = Object.keys(A.codexOf(w).records).length;
A.startSession("w1");
ok(w.session===1, "re-starting a live session does NOT increment the counter");
ok(Object.keys(A.codexOf(w).records).length===castBefore, "re-starting a live session does NOT re-cast");

// ── endSession: close cleanly + recycle unvisited soft prep + back to shelf ────
const softFrontiersBefore = Object.keys(A.mapOf(w).nodes).filter(id=>A.mapOf(w).nodes[id].soft).length;
ok(softFrontiersBefore===3, `3 soft frontiers on the map before end (got ${softFrontiersBefore})`);
A.endSession();
ok(w.sessionLive===false, "endSession clears the live flag");
ok(A.ledgerOf(w).some(e=>e.data&&e.data.kind==="session-end"), "session-end written to the ledger");
const softAfter = Object.keys(A.mapOf(w).nodes).filter(id=>A.mapOf(w).nodes[id].soft).length;
ok(softAfter===0, `unvisited soft frontiers recycled on end (got ${softAfter})`);
ok(A.getGS()._tab==="universe", "endSession returns to the world-select (universe) tab");
// the soft codex cast survives as the reusable pool (recontextualization, §8b)
ok(Object.values(A.codexOf(w).records).filter(r=>r.provenance==="prep").length>=6, "soft cast survives end as the reusable pool");

// ── a fresh Start after End begins session 2 ──────────────────────────────────
A.startSession("w1");
ok(w.session===2 && w.sessionLive===true, "starting again after end begins session 2");

console.log(`\n${fail===0?"✅ PASS":"❌ FAIL"} — ${pass} assertions passed, ${fail} failed`);
if(fail){ for(const f of fails) console.log("   ✗ "+f); process.exit(1); }
