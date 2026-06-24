/* verify-walk.mjs — headless test for the segment walk-roller (src/engine/walk.js).
   Loads the compiled tables.js + walk.js into a shared scope with a window shim, then
   rolls walks across all 16 topologies and asserts the data structure is well-formed.
   Run: node dev/verify-walk.mjs   (from repo root) */
import { readFileSync } from "node:fs";

const tablesJs = readFileSync("tables.js", "utf8");
const walkJs   = readFileSync("src/engine/walk.js", "utf8");

// Build a factory that evaluates both files in one scope with a `window` shim,
// then hands back the public API (top-level consts captured by the closure).
const factory = new Function("window",
  tablesJs + "\n" + walkJs + "\n;return { rollUrbanWalk, URBAN_TOPOLOGIES };");
const win = {};
const { rollUrbanWalk, URBAN_TOPOLOGIES } = factory(win);

let pass = 0, fail = 0;
const fails = [];
function ok(cond, msg){ if(cond){ pass++; } else { fail++; fails.push(msg); } }

ok(win.GENESIS_TABLES && Object.keys(win.GENESIS_TABLES).length > 300, "tables.js populated window.GENESIS_TABLES");
ok(Array.isArray(URBAN_TOPOLOGIES) && URBAN_TOPOLOGIES.length === 16, "16 topologies exported");

// Roll every topology at a few segment counts.
for (const topo of URBAN_TOPOLOGIES) {
  for (const segCount of [2, 4, 8, 12]) {
    const w = rollUrbanWalk({ topology: topo, segCount, tier: 1 });
    const tag = `${topo}@${segCount}`;
    ok(w && typeof w === "object", `${tag}: returns object`);
    ok(w.posture && w.finaleTrack && typeof w.heatStart === "number", `${tag}: meta present`);
    ok(w.threat && w.threat.id && w.threat.low && w.threat.boss, `${tag}: threat context`);
    ok(w.setup && w.setup.skin && w.setup.catalyst, `${tag}: setup briefing bag`);
    // segments: exactly segCount + 1 (the finale), numbered 1..N contiguously
    ok(w.segments.length === segCount + 1, `${tag}: ${w.segments.length} segs (want ${segCount+1})`);
    const nums = w.segments.map(s => s.num).sort((a,b)=>a-b);
    ok(nums[0] === 1 && nums[nums.length-1] === w.segments.length, `${tag}: contiguous seg numbers`);
    const finales = w.segments.filter(s => s.isFinale);
    ok(finales.length === 1 && finales[0].num === w.segments.length, `${tag}: exactly one finale, last`);
    ok(finales[0].finale && finales[0].finale.track, `${tag}: finale has a track`);
    // Structural graph nodes have no sub-table by design (handled by graph position).
    const STRUCTURAL = new Set(["Convergence", "Split Point", "Reunion"]);
    // every non-finale segment gets an encounter; non-structural ones also get a rolled scene
    for (const s of w.segments.filter(s=>!s.isFinale)) {
      ok(s.encounter && s.encounter.type, `${tag} S${s.num}: encounter present`);
      if (!STRUCTURAL.has(s.label)) {
        ok(!!s.segType && !!s.description && !!s.transition,
           `${tag} S${s.num} (${s.label}): scene rolled (type/desc/transition)`);
      }
    }
    // edges reference valid segment numbers and the graph is connected to the finale
    const N = w.segments.length;
    let edgeOk = w.edges.length > 0;
    for (const [a,b] of w.edges) if (a<1||a>N||b<1||b>N) edgeOk = false;
    ok(edgeOk, `${tag}: edges reference valid seg numbers (${w.edges.length} edges)`);
    const touched = new Set(w.edges.flat());
    ok(touched.has(N), `${tag}: finale (S${N}) is connected`);
  }
}

// Fallback: a min-4 topology asked for 2 segs must fall back, not crash.
const fb = rollUrbanWalk({ topology: "The Fracture", segCount: 2, tier: 1 });
ok(fb.fallbackFrom === "The Fracture" && fb.topology !== "The Fracture", "Fracture@2 falls back gracefully");

// Dedup: in a long Trail walk, Lead segments should mostly be distinct scene types.
const longWalk = rollUrbanWalk({ topology: "The Trail", segCount: 12, tier: 1 });
const leadTypes = longWalk.segments.filter(s=>s.label==="Lead" && s.segType).map(s=>s.segType);
const uniqueLeads = new Set(leadTypes);
ok(uniqueLeads.size >= Math.min(leadTypes.length, Math.ceil(leadTypes.length*0.7)),
   `dedup: ${uniqueLeads.size}/${leadTypes.length} Lead scenes distinct`);

// ── sample dump for eyeballing ───────────────────────────────────────────────
const sample = rollUrbanWalk({ topology: "The Trail", segCount: 5, tier: 1 });
console.log(`\n── SAMPLE WALK — ${sample.topology} (${sample.posture}, T${sample.tier}, Heat ${sample.heatStart}) ──`);
console.log(`Threat: ${sample.threat.id} | Catalyst: ${sample.setup.catalyst}`);
console.log(`Skin: ${sample.setup.skin} — ${sample.setup.skinVisual}`);
for (const s of sample.segments) {
  if (s.isFinale) { console.log(`  S${s.num} ★ FINALE (${s.finale.track}) — revelation: ${s.finale.revelation}`); continue; }
  console.log(`  S${s.num} [${s.label}] ${s.segType}`);
  console.log(`        ↳ ${s.description}`);
  console.log(`        ⚔ ${s.encounter.type}: ${s.encounter.text}`);
  console.log(`        → exits: ${s.exits.map(e=>`S${e.num}`).join(", ")}`);
}

console.log(`\n${fail===0 ? "✅ PASS" : "❌ FAIL"} — ${pass} assertions passed, ${fail} failed`);
if (fail) { for (const f of fails.slice(0,30)) console.log("   ✗ " + f); process.exit(1); }
