/* verify-prep-bundle.mjs — headless test for the synthesis-pass deterministic half:
   the prep-bundle assembler + quest-hook roller (docs/SYNTHESIS-CONTRACT.md).
   Proves the INPUT bundle the staged synthesis prompts consume is well-formed (the LLM synthesis
   itself runs over the DM Bridge — qualitative, not tested here).
   Run: node dev/verify-prep-bundle.mjs   (from repo root) */
import { readFileSync } from "node:fs";
const read = p => readFileSync(p, "utf8");
const factory = new Function("window",
  ["tables.js","src/engine/walk.js","src/engine/dungeon-walk.js","src/engine/wild-walk.js",
   "src/engine/quest-hook.js","src/engine/prep-bundle.js"].map(read).join("\n") +
  ";return { assemblePrepBundle, prepBundleSummary, rollQuestHook };");
const A = factory({});

let pass=0, fail=0; const fails=[];
const ok=(c,m)=>{ if(c) pass++; else { fail++; fails.push(m); } };

// ── quest hook ───────────────────────────────────────────────────────────────
const h = A.rollQuestHook({ environment:"dungeon" });
ok(h.leadsTo==="dungeon", "hook bound to environment");
ok(h.macguffin.name && h.complication.name && h.urgency.name, "hook rolled macguffin/complication/urgency");
ok(h.questgiver===null, "questgiver left for synthesis to assign");

// ── default multi-environment bundle (no live world) ─────────────────────────
const b = A.assemblePrepBundle({});
ok(b.schema==="prep-bundle/v1", "bundle schema");
ok(b.environments.length===3, `3 environments (got ${b.environments.length})`);
const kinds = b.environments.map(e=>e.kind).sort();
ok(kinds.join()==="dungeon,urban,wilderness", `kinds: ${kinds.join()}`);
ok(b.ledger && b.ledger.tier===1 && Array.isArray(b.ledger.factions), "headless ledger context (empty, tier 1)");
for(const e of b.environments){
  ok(e.walk && e.walk.segments && e.walk.segments.length>0, `${e.kind}: walk has segments`);
  ok(e.hook && e.hook.leadsTo===e.kind, `${e.kind}: hook bound`);
}

// ── Stage-1 summary view ─────────────────────────────────────────────────────
const sum = A.prepBundleSummary(b);
ok(sum.schema==="prep-bundle-summary/v1", "summary schema");
ok(sum.environments.length===3, "summary has 3 envs");
for(const e of sum.environments){
  ok(e.walk.segments.every(s=>s.ref && s.label!==undefined), `${e.kind}: summary segs have ref/label`);
  ok(e.walk.segments.some(s=>s.finale), `${e.kind}: summary marks a finale`);
  ok(e.hook && e.hook.macguffin, `${e.kind}: summary hook`);
}
// summary should be much smaller than the full bundle
const fullLen=JSON.stringify(b).length, sumLen=JSON.stringify(sum).length;
ok(sumLen < fullLen*0.6, `summary (${sumLen}) < 60% of full (${fullLen})`);

// ── override + a stub live world (ledger extraction) ─────────────────────────
const b2 = A.assemblePrepBundle({ environments:[{kind:"dungeon",segCount:3,tier:1}] });
ok(b2.environments.length===1 && b2.environments[0].kind==="dungeon", "environment override works");

const stubWorld = {
  currentNodeId:"saltmarsh", map:{nodes:{saltmarsh:{name:"Saltmarsh"}}},
  characters:[{status:"living",sheet:{level:6}}],
  factions:[{name:"Ashguild",dominant:true,agenda:"control the docks",method:"extortion",clock:{filled:2,size:6}}],
  pressures:[{kind:"external",danger:"a fleet on the horizon",clock:{filled:1,size:8},real:{text:"it's a slaver armada"},doom:"the town falls"}],
  ledger:[{type:"canon",text:"The lighthouse has been dark for a year."}],
};
const b3 = A.assemblePrepBundle({ world: stubWorld });
ok(b3.ledger.pcLocation==="Saltmarsh", "ledger pcLocation from world");
ok(b3.ledger.tier===2, "tier derived from PC level 6 → T2");
ok(b3.ledger.factions.length===1 && b3.ledger.factions[0].name==="Ashguild", "factions extracted");
ok(b3.ledger.dripTargets.length===1 && /slaver/.test(b3.ledger.dripTargets[0].truth), "drip targets = hidden pressure truths");
ok(b3.ledger.canon.length===1, "canon facts extracted");
ok(b3.meta.tier===2, "bundle meta tier follows world");

// ── sample dump ──────────────────────────────────────────────────────────────
console.log("\n── SAMPLE PREP-BUNDLE SUMMARY (Stage-1 input) ──");
console.log(`ledger: loc=${b3.ledger.pcLocation} tier=${b3.ledger.tier} factions=${b3.ledger.factions.map(f=>f.name).join(",")} drip=${b3.ledger.dripTargets.length}`);
for(const e of A.prepBundleSummary(b3).environments){
  console.log(`\n[${e.kind}] ${e.walk.topology||e.walk.biome||""} — hook: seek "${e.hook.macguffin}" (${e.hook.urgency}); twist: ${e.hook.complication}`);
  for(const s of e.walk.segments.slice(0,4)) console.log(`   ${s.ref} ${s.label?`[${s.label}] `:""}${s.gist}${s.finale?" ★":""}`);
  if(e.walk.segments.length>4) console.log(`   … +${e.walk.segments.length-4} more`);
}

console.log(`\n${fail===0?"✅ PASS":"❌ FAIL"} — ${pass} assertions passed, ${fail} failed`);
if(fail){ for(const f of fails.slice(0,30)) console.log("   ✗ "+f); process.exit(1); }
