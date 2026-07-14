/* verify-prep.mjs — headless test for the Session-Prep state machine (src/world/prep.js):
   startPrep (assemble + bind soft frontiers), applyPrep (enrich from synthesis overlays),
   lockOnContact (soft→hard), recycle, debt. Loads the real modules with app-global stubs.
   Run: node dev/verify-prep.mjs   (from repo root) */
import { readFileSync } from "node:fs";
const read = p => readFileSync(p, "utf8");

const stubs = `
  var localStorage={getItem:()=>null,setItem:()=>{}};
  var U={worlds:{},activeWorldId:null,revealed:{}};
  var GS={}, SEED=1;
  function toast(){} function renderWorld(){}
`;
const files = ["tables.js","src/engine/core.js","data/names.js","src/engine/compiled.js",
  "src/engine/walk.js","src/engine/dungeon-walk.js",
  "src/engine/wild-walk.js","src/engine/quest-hook.js","src/engine/codex-roll.js","src/engine/prep-bundle.js",
  "src/world/state.js","src/world/codex.js","src/world/prep.js"];
const factory = new Function("window",
  stubs + "\n" + files.map(read).join("\n") +
  ";return { startPrep, prepHandoff, applyPrep, lockOnContact, walkOfFrontier, logPrepDebt, prepOf, mapOf, ledgerOf, codexOf, codexGet, codexDigest, prepCastId, codexAdd, codexEvictSoft, codexSoftPool, CODEX_SOFT_CAP };");
const A = factory({});

let pass=0, fail=0; const fails=[];
const ok=(c,m)=>{ if(c) pass++; else { fail++; fails.push(m); } };

// a minimal living world standing at one node
function freshWorld(){
  return { id:"w1", name:"Test World", session:0, currentNodeId:"home",
    map:{ nodes:{ home:{id:"home",name:"Home",type:"Setting",x:0,y:0} }, edges:[] },
    ledger:[], clock:{day:1,min:600},
    characters:[{status:"living",sheet:{level:3}}],
    factions:[{name:"Ashguild",dominant:true,agenda:"control the docks",method:"extortion",clock:{filled:1,size:6}}],
    pressures:[{kind:"external",danger:"a fleet",clock:{filled:1,size:8},real:{text:"a slaver armada"},doom:"the town falls"}],
    seed:{} };
}

// ── startPrep: assemble + bind soft frontiers ────────────────────────────────
const w = freshWorld(); w.session=1;
const handoff = A.startPrep(w);
ok(typeof handoff==="string" && handoff.includes("PREP HANDOFF"), "startPrep returns a handoff");
ok(w.prep && w.prep.bundle && w.prep.bundle.environments.length===3, "bundle staged (3 envs)");
const softIds = Object.keys(w.prep.nodes);
ok(softIds.length===3, `3 soft frontier nodes (got ${softIds.length})`);
ok(softIds.every(id=>A.mapOf(w).nodes[id] && A.mapOf(w).nodes[id].soft), "all frontiers marked soft on the map");
const softEdges = A.mapOf(w).edges.filter(e=>e.soft && e.from==="home");
ok(softEdges.length===3, `3 soft edges from current node (got ${softEdges.length})`);
ok(A.ledgerOf(w).some(e=>e.data&&e.data.kind==="prep"), "prep staged in ledger");
ok(handoff.includes("BUNDLE SUMMARY") && handoff.includes("FULL BUNDLE"), "handoff carries summary + full bundle");

// ── CODEX Phase 3: the casting pass minted soft entity records ───────────────
// (ensureCodex also migrated the world's faction → a record; the CAST is the provenance:"prep" slice.)
const cast = Object.values(A.codexOf(w).records).filter(r=>r.provenance==="prep");
ok(cast.length>=6, `codex cast minted (≥6 prep records: 3 locations + ≥3 NPCs; got ${cast.length})`);
ok(cast.every(r=>r.status.soft), "every cast record is soft");
ok(cast.every(r=>!r.status.known), "cast records start unknown (player learns them in play)");
ok(cast.filter(r=>r.kind==="location").length===3, "one cast location per frontier (3)");
ok(cast.filter(r=>r.kind==="npc").length>=3, "≥1 cast NPC per frontier");
ok(!!A.codexGet(w,"faction:ashguild"), "ensureCodex migrated the world faction alongside the cast");
// each frontier's location is bound to its map node; its NPCs are placed there
const someFront = softIds.find(id=>w.prep.nodes[id].cast && w.prep.nodes[id].cast.locId);
ok(!!someFront, "a frontier records its cast on the prep node");
const fcast = w.prep.nodes[someFront].cast;
ok(A.mapOf(w).nodes[someFront].codexId===fcast.locId, "frontier node bound to its location record");
ok(fcast.npcIds.every(id=>A.codexGet(w,id).status.at===fcast.locId), "cast NPCs placed at the frontier location (status.at)");
// item-casting (the macguffin): one plot-item per frontier, placed at its location
ok(cast.filter(r=>r.kind==="item").length===3, "one cast item (macguffin) per frontier (3)");
const fItem = fcast.itemIds && fcast.itemIds[0];
ok(!!fItem && A.codexGet(w,fItem).status.at===fcast.locId, "cast item placed at the frontier location (status.at)");
ok(!!fItem && A.codexGet(w,fItem).source && A.codexGet(w,fItem).source.type==="plot", "cast item is a plot pointer (§8b), not a duplicated definition");
// DM digest is all-seeing over the whole codex (soft cast + migrated faction)
ok(A.codexDigest(w).length===Object.keys(A.codexOf(w).records).length, "DM digest sees the whole codex");

// ── applyPrep: enrich frontiers from synthesis overlays + soft canon ─────────
const urbanId = softIds.find(id=>w.prep.nodes[id].env==="urban");
const res = A.applyPrep(w, {
  harvest:{ dramaticQuestion:"Who silenced the lighthouse?", throughline:"..." },
  overlays:{ urban:{ env:"urban", briefing:"The Gilded Quarter seethes.", segments:[{ref:"S1",role:"spine"}],
    newCanon:[{type:"npc",name:"Vex the Fence",detail:"runs the night market"}] } },
});
ok(res.ok && res.softCanon===1, "applyPrep wrote 1 soft canon");
ok(w.prep.harvest && /lighthouse/.test(w.prep.harvest.dramaticQuestion), "harvest stored");
ok(w.prep.nodes[urbanId].briefing && /Gilded/.test(w.prep.nodes[urbanId].briefing), "urban frontier enriched with briefing");
ok(A.ledgerOf(w).some(e=>e.data&&e.data.soft && /Vex/.test(e.text)), "soft canon entry for Vex");
ok(A.ledgerOf(w).some(e=>e.data&&e.data.kind==="prep-throughline"), "throughline logged soft");

// ── lockOnContact: soft → hard, returns the walk ─────────────────────────────
const lr = A.lockOnContact(w, urbanId);
ok(lr.ok && lr.walk && lr.walk.environment==="urban", "lockOnContact returns the urban walk");
ok(A.mapOf(w).nodes[urbanId].soft===false, "frontier locked to hard canon");
ok(w.prep.nodes[urbanId].locked===true, "prep node marked locked");
ok(A.ledgerOf(w).some(e=>e.data&&e.data.kind==="prep-contact"), "contact written to canon");
ok(A.mapOf(w).edges.filter(e=>(e.to===urbanId||e.from===urbanId)&&e.soft).length===0, "soft edge to it hardened");
// touch = canon (§8b): the frontier's cast location locked soft→hard on entry
const urbanLocId = w.prep.nodes[urbanId].cast && w.prep.nodes[urbanId].cast.locId;
ok(urbanLocId && A.codexGet(w,urbanLocId).status.soft===false, "entering the frontier locked its location record to canon");
ok(urbanLocId && A.codexGet(w,urbanLocId).status.known===true, "...and revealed it to the player");

// ── recycle: a new session drops the UNVISITED soft frontiers, keeps the locked ─
w.session=2;
A.startPrep(w);
ok(A.mapOf(w).nodes[urbanId], "locked frontier survives into next session");
const stillSoftFromS1 = softIds.filter(id=>id!==urbanId).filter(id=>A.mapOf(w).nodes[id]);
ok(stillSoftFromS1.length===0, "unvisited soft frontiers from S1 were recycled");
const freshSoft = Object.keys(w.prep.nodes).filter(id=>w.prep.nodes[id].soft && !w.prep.nodes[id].locked);
ok(freshSoft.length===3, `fresh prep staged 3 new soft frontiers (got ${freshSoft.length}); locked one survives alongside`);
ok(A.ledgerOf(w).some(e=>e.data&&e.data.kind==="prep-recycle"), "recycle logged");

// ── soft-pool eviction cap: many sessions accumulate orphaned soft cast; recycle bounds the pool ─
// (each session casts ~9–12 soft. The KEY invariant: pool size is independent of session count — the
//  cap bounds the orphaned pool; the current session's bound cast + the locked frontier's sit on top.)
for(let s=3;s<=10;s++){ w.session=s; A.startPrep(w); }
const poolAt10 = A.codexSoftPool(w).length;
for(let s=11;s<=30;s++){ w.session=s; A.startPrep(w); }
const poolAt30 = A.codexSoftPool(w).length;
ok(A.ledgerOf(w).some(e=>e.data&&e.data.kind==="codex-evict"), "eviction fired and was logged once the pool exceeded the cap");
ok(poolAt30 <= poolAt10 + 15, `soft pool plateaus, not grows with sessions (s10=${poolAt10}, s30=${poolAt30}) — bounded, not unbounded`);
ok(poolAt30 < 30*9*0.5, `soft pool far below unbounded growth (${poolAt30} ≪ ~${30*9} without eviction)`);
ok(urbanLocId && A.codexGet(w,urbanLocId), "the locked frontier's location is never evicted (hard = sacred)");

// ── prepCastId disambiguates same-named cast records (no silent codexAdd merge) ─
const cw={ id:"cw", name:"C", ledger:[], factions:[], gazetteer:[], clock:{day:1,min:360} };
const id1=A.prepCastId(cw,"location","The Old Mill"); A.codexAdd(cw,{ id:id1, kind:"location", name:"The Old Mill", provenance:"prep" });
const id2=A.prepCastId(cw,"location","The Old Mill"); A.codexAdd(cw,{ id:id2, kind:"location", name:"The Old Mill", provenance:"prep" });
ok(id1!==id2, "two same-named cast locations get distinct ids");
ok(Object.keys(A.codexOf(cw).records).length===2, "...and mint two distinct records, not a silent merge");

// ── debt ─────────────────────────────────────────────────────────────────────
A.logPrepDebt(w, "the north road");
ok(w.prep.debt.length===1 && /north road/.test(w.prep.debt[0].frontier), "prep debt logged");

console.log(`\n${fail===0?"✅ PASS":"❌ FAIL"} — ${pass} assertions passed, ${fail} failed`);
if(fail){ for(const f of fails) console.log("   ✗ "+f); process.exit(1); }
