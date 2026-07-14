/* verify-prep-autopilot.mjs — headless test for PREP-AUTOPILOT (docs/PREP-AUTOPILOT.md,
   BATCH-GUARDRAILS G8): the digest.prepPending signal (prepPendingDigest in src/world/prep.js,
   wired into dmDigest() in src/world/dm.js) + `dev/peek-state.py handoff` reading the raw bundle.

   Loads the real modules with app-global stubs — same "new Function + stubs" pattern as
   dev/verify-travel-walks.mjs (no jsdom needed; this unit touches no DOM).
   Run: node dev/verify-prep-autopilot.mjs   (from repo root) */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
const read = p => readFileSync(p, "utf8");

const stubs = `
  var localStorage={getItem:()=>null,setItem:()=>{}};
  var U={worlds:{},activeWorldId:null,revealed:{}};
  var GS={}, SEED=1;
  function toast(){} function renderWorld(){} function wakeReveal(){} function pushDmLog(){}
  function saveU(){}
  var fetch=()=>Promise.reject("no-net");
`;
const files = ["tables.js","data/world-tables.js","data/names.js","data/bestiary.js","data/items.js","data/tarot.js",
  "src/engine/core.js","src/engine/tables.js","src/engine/hexmap.js","src/engine/compiled.js",
  "src/engine/walk.js","src/engine/dungeon-walk.js","src/engine/wild-walk.js","src/engine/quest-hook.js",
  "src/engine/codex-roll.js","src/engine/prep-bundle.js","src/engine/combat.js","src/engine/tarot.js",
  "src/world/state.js","src/world/codex.js","src/world/seam.js","src/world/prep.js","src/world/play.js",
  "src/world/capture.js","src/world/dm.js"];
const factory = new Function("window",
  stubs + "\n" + files.map(read).join("\n") +
  ";return { startPrep, applyPrep, prepOf, mapOf, ledgerOf, prepPendingDigest, dmDigest, applyEvent, " +
  "walkComplete, walkSetActive, walkAdvance, U };");
const A = factory({});

let pass=0, fail=0; const fails=[];
const ok=(c,m)=>{ if(c) pass++; else { fail++; fails.push(m); } };

function freshWorld(){
  const w = { id:"w"+Math.random().toString(36).slice(2), name:"Test World", session:0, currentNodeId:"home",
    map:{ nodes:{ home:{id:"home",name:"Home",type:"Setting",x:0,y:0} }, edges:[] },
    gazetteer:[], ledger:[], log:[], clock:{day:1,min:600},
    characters:[{status:"living",name:"Wren",conditions:[],sheet:{level:3}}],
    factions:[], pressures:[],
    seed:{ master:{name:"x",desc:"x"}, smell:{name:"x"}, sound:{name:"x"}, arch:{name:"x"},
           taboo:{name:"x",desc:"x"}, myth:{name:"x",desc:"x"} } };
  A.U.worlds[w.id]=w; A.U.activeWorldId=w.id;
  return w;
}

// ── 1. no prep staged → prepPending absent (null) ────────────────────────────
const w1 = freshWorld();
ok(A.prepPendingDigest(w1)===null, "prepPendingDigest null with no bundle staged");
ok(A.dmDigest().prepPending===null, "dmDigest().prepPending null with no bundle staged");

// ── 2. startPrep stages a bundle → every frontier lacks an overlay → prepPending present,
//       reason:"no-overlays", frontiers lists all 3, shape EXACTLY {session,frontiers,reason} ──
w1.session=1;
A.startPrep(w1);
const pend2 = A.prepPendingDigest(w1);
ok(!!pend2, "prepPending present right after startPrep (no overlays yet)");
ok(pend2 && pend2.reason==="no-overlays", `reason is "no-overlays" (got ${pend2 && pend2.reason})`);
ok(pend2 && pend2.session===1, "session carried through");
ok(pend2 && Array.isArray(pend2.frontiers) && pend2.frontiers.length===3, `all 3 frontiers listed (got ${pend2 && pend2.frontiers.length})`);
ok(pend2 && Object.keys(pend2).sort().join(",")==="frontiers,reason,session", "shape EXACTLY {session,frontiers,reason} — no extra keys");
ok(A.dmDigest().prepPending!==null, "dmDigest() surfaces the same signal");

// ── 3. applyPrep overlays every env → prepPending absent again (the all-clear) ───────────────
const softIds = Object.keys(A.prepOf(w1).nodes);
const envs = [...new Set(softIds.map(id=>A.prepOf(w1).nodes[id].env))];
const overlays = {}; envs.forEach(e=>{ overlays[e]={ env:e, briefing:"Reskinned.", segments:[{ref:"S1",role:"spine"}] }; });
A.applyPrep(w1, { harvest:{throughline:"..."}, overlays });
ok(A.prepPendingDigest(w1)===null, "prepPending absent once every frontier has an overlay (all-clear)");
ok(A.dmDigest().prepPending===null, "dmDigest() reflects the all-clear too");

// ── 4. a WALK-CONSUMPTION promotion sets needsReskin → prepPending reappears,
//       reason:"needsReskin" — even though every OTHER node already has an overlay ───────────
const firstId = softIds[0];
A.walkSetActive(w1, firstId);
// drive walkComplete directly (finale reach isn't required by walkComplete's contract — it just
// promotes the next un-walked frontier and flags it needsReskin per src/world/prep.js:458)
const promo = A.walkComplete(w1, { nodeId:firstId });
ok(promo && promo.ok, "walkComplete ran");
const pend4 = A.prepPendingDigest(w1);
ok(!!pend4, "prepPending reappears after a promotion sets needsReskin");
ok(pend4 && pend4.reason==="needsReskin", `reason is "needsReskin" (got ${pend4 && pend4.reason})`);
ok(pend4 && pend4.frontiers.length===1, `exactly the 1 promoted frontier listed (got ${pend4 && pend4.frontiers.length})`);

// ── 5. reason precedence: if BOTH a no-overlay node and a needsReskin node exist, needsReskin wins ──
// synthesize a second frontier node still lacking an overlay, alongside the already-needsReskin one
// from step 4 (avoids startPrep's prepRecycleStale deleting the unlocked promoted node — see
// src/world/prep.js:99-121 — which a second startPrep() call would trigger).
A.prepOf(w1).nodes["synthetic-no-overlay"] = { env:"wilderness", idx:99, soft:true, locked:false, hook:null };
const pend5 = A.prepPendingDigest(w1);
ok(pend5 && pend5.reason==="needsReskin", `needsReskin wins over no-overlays when both exist (got ${pend5 && pend5.reason})`);
ok(pend5 && pend5.frontiers.length===1, "frontiers list stays scoped to the needsReskin node(s), not the no-overlay ones, when needsReskin wins");

// ── MUTATION CHECK 1: break prepPendingDigest's needsReskin-wins branch → assert the harness
//    itself would catch it (invert the ?: so no-overlays "wins" instead) → restore ─────────────
{
  const PREP_PATH = new URL("../src/world/prep.js", import.meta.url).pathname;
  const orig = read(PREP_PATH);
  const NEEDLE = 'reason:needsReskin.length?"needsReskin":"no-overlays" };';
  ok(orig.includes(NEEDLE), "mutation anchor line found in src/world/prep.js (guard against drift)");
  const broken = orig.replace(NEEDLE, 'reason:noOverlay.length?"no-overlays":"needsReskin" };');
  ok(broken!==orig, "mutation actually changed the file text");
  writeFileSync(PREP_PATH, broken);
  try{
    const A2 = new Function("window", stubs + "\n" + files.map(p=>p===PREP_PATH.split("/Genesis/")[1]?read(PREP_PATH):read(p)).join("\n") +
      ";return { startPrep, applyPrep, prepOf, prepPendingDigest, walkComplete, U };")({});
    const w2 = (function(){ const w={ id:"m1", name:"Mut", session:2, currentNodeId:"home",
      map:{ nodes:{ home:{id:"home",name:"Home",type:"Setting",x:0,y:0} }, edges:[] },
      gazetteer:[], ledger:[], log:[], clock:{day:1,min:600},
      characters:[{status:"living",name:"Wren",conditions:[],sheet:{level:3}}],
      factions:[], pressures:[],
      seed:{ master:{name:"x",desc:"x"}, smell:{name:"x"}, sound:{name:"x"}, arch:{name:"x"},
             taboo:{name:"x",desc:"x"}, myth:{name:"x",desc:"x"} } }; A2.U.worlds[w.id]=w; A2.U.activeWorldId=w.id; return w; })();
    A2.startPrep(w2);
    const ids = Object.keys(A2.prepOf(w2).nodes);
    const ovs = {}; [...new Set(ids.map(id=>A2.prepOf(w2).nodes[id].env))].forEach(e=>{ ovs[e]={env:e,briefing:"x",segments:[]}; });
    A2.applyPrep(w2, { overlays: ovs });
    A2.walkComplete(w2, { nodeId: ids[0] }); // promotes a needsReskin node
    w2.session=3; A2.startPrep(w2); // adds fresh no-overlay nodes alongside the needsReskin one
    const brokenResult = A2.prepPendingDigest(w2);
    ok(brokenResult && brokenResult.reason==="no-overlays", "MUTATION RED: with the guard inverted, reason wrongly flips to \"no-overlays\" — the harness catches it");
  } finally {
    writeFileSync(PREP_PATH, orig);
    ok(read(PREP_PATH)===orig, "mutation restored — file back to original");
  }
}

// ── 6. peek-state.py handoff: {} with no state.json; the raw bundle once one exists ─────────
{
  const FIXTURE = new URL("./.tmp-peek-fixture.json", import.meta.url).pathname;
  try{
    const stateNoBundle = { activeWorldId:"w1", worlds:{ w1:{ id:"w1", prep:{ bundle:null } } } };
    writeFileSync(FIXTURE, JSON.stringify(stateNoBundle));
    const out1 = execFileSync("python3", ["dev/peek-state.py","--state",FIXTURE,"handoff"], { encoding:"utf8" });
    ok(JSON.parse(out1)!=null && Object.keys(JSON.parse(out1)).length===0, "peek-state handoff prints {} when no bundle staged");

    const bundle = { environments:[{kind:"urban",hook:{leadsTo:null},walk:{segments:[]}}] };
    const stateWithBundle = { activeWorldId:"w1", worlds:{ w1:{ id:"w1", prep:{ bundle } } } };
    writeFileSync(FIXTURE, JSON.stringify(stateWithBundle));
    const out2 = execFileSync("python3", ["dev/peek-state.py","--state",FIXTURE,"handoff"], { encoding:"utf8" });
    ok(JSON.stringify(JSON.parse(out2))===JSON.stringify(bundle), "peek-state handoff prints the raw bundle byte-equivalent (round-trips through JSON)");
  } finally {
    if(existsSync(FIXTURE)) unlinkSync(FIXTURE);
  }
}

console.log(`prep-autopilot: ${pass}/${pass+fail} passed`);
if(fail){ console.log("FAILED:\n" + fails.map(f=>" - "+f).join("\n")); process.exit(1); }
