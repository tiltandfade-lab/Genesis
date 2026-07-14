/* verify-walk.mjs — headless test for the segment walk-rollers (urban/dungeon/wilderness).
   Loads the compiled tables.js + the three engine modules into one shared scope with a window
   shim, then rolls walks across topologies/biomes and asserts the data structures are well-formed.
   Run: node dev/verify-walk.mjs   (from repo root) */
import { readFileSync } from "node:fs";

const read = p => readFileSync(p, "utf8");
const factory = new Function("window",
  read("tables.js") + "\n" +
  read("src/engine/walk.js") + "\n" +
  read("src/engine/dungeon-walk.js") + "\n" +
  read("src/engine/wild-walk.js") + "\n" +
  ";return { rollUrbanWalk, URBAN_TOPOLOGIES, rollDungeonWalk, DUNGEON_TOPOLOGIES, rollWildernessWalk };");
const win = {};
const A = factory(win);

let pass = 0, fail = 0; const fails = [];
const ok = (c, m) => { if (c) pass++; else { fail++; fails.push(m); } };

ok(win.GENESIS_TABLES && Object.keys(win.GENESIS_TABLES).length > 300, "tables.js populated");

// ── shared structural checks for a topology walk (urban + dungeon) ───────────
function checkGraphWalk(w, segCount, tag, structuralLabels) {
  ok(w && typeof w === "object", `${tag}: object`);
  ok(w.segments.length === segCount + 1, `${tag}: ${w.segments.length} segs (want ${segCount+1})`);
  const nums = w.segments.map(s => s.num).sort((a,b)=>a-b);
  ok(nums[0] === 1 && nums[nums.length-1] === w.segments.length, `${tag}: contiguous numbers`);
  const finales = w.segments.filter(s => s.isFinale);
  ok(finales.length === 1 && finales[0].num === w.segments.length, `${tag}: one finale, last`);
  const N = w.segments.length;
  let edgeOk = w.edges.length > 0;
  for (const [a,b] of w.edges) if (a<1||a>N||b<1||b>N) edgeOk = false;
  ok(edgeOk, `${tag}: edges valid (${w.edges.length})`);
  ok(new Set(w.edges.flat()).has(N), `${tag}: finale connected`);
  return finales[0];
}

// ── URBAN ────────────────────────────────────────────────────────────────────
ok(A.URBAN_TOPOLOGIES.length === 16, "16 urban topologies");
for (const topo of A.URBAN_TOPOLOGIES) for (const sc of [2,4,8,12]) {
  const w = A.rollUrbanWalk({ topology: topo, segCount: sc, tier: 1 });
  const tag = `URB ${topo}@${sc}`;
  const fin = checkGraphWalk(w, sc, tag);
  ok(w.threat && w.threat.id && w.threat.boss, `${tag}: threat`);
  ok(w.setup && w.setup.skin && w.setup.catalyst, `${tag}: setup`);
  ok(fin.finale && fin.finale.track, `${tag}: finale track`);
  const STRUCT = new Set(["Convergence","Split Point","Reunion"]);
  for (const s of w.segments.filter(s=>!s.isFinale)) {
    ok(s.encounter && s.encounter.type, `${tag} S${s.num}: encounter`);
    if (!STRUCT.has(s.label)) ok(!!s.segType && !!s.transition, `${tag} S${s.num} (${s.label}): scene`);
  }
}
ok(A.rollUrbanWalk({topology:"The Fracture",segCount:2}).fallbackFrom==="The Fracture", "urban fallback");

// ── DUNGEON ──────────────────────────────────────────────────────────────────
ok(A.DUNGEON_TOPOLOGIES.length === 12, "12 dungeon topologies");
for (const topo of A.DUNGEON_TOPOLOGIES) for (const sc of [1,3,5,9]) {
  const w = A.rollDungeonWalk({ topology: topo, segCount: sc, tier: 1 });
  const tag = `DUN ${topo}@${sc}`;
  const fin = checkGraphWalk(w, sc, tag);
  ok(w.threat && w.threat.id && w.threat.boss, `${tag}: threat`);
  ok(w.haul && typeof w.haul.common === "number", `${tag}: loot budget`);
  ok(fin.finale && fin.finale.bossArchetype && fin.finale.revelation, `${tag}: boss + revelation`);
  ok(fin.loot && typeof fin.loot.coin === "string", `${tag}: finale coin`);
  for (const s of w.segments.filter(s=>!s.isFinale)) {
    ok(!!s.areaType && !!s.scene, `${tag} R${s.num}: area+scene`);
    ok(s.encounter && s.encounter.type, `${tag} R${s.num}: encounter`);
    ok(s.loot && typeof s.loot.coin === "string", `${tag} R${s.num}: loot/coin`);
  }
  // magic item count never exceeds the budget
  const budgetTotal = w.haul.common + w.haul.uncommon + w.haul.rare + w.haul.veryRare;
  const magicGiven = w.segments.filter(s=>s.loot && s.loot.magic).length;
  ok(magicGiven <= budgetTotal, `${tag}: magic given ${magicGiven} <= budget ${budgetTotal}`);
  // T1/T2 cap guard (docs/TIER-SCOPE.md): the in-game loot path must NEVER surface the deferred
  // Outlandish / Legendary / Artifact bands — those ride with the T3/T4 expansion.
  const DEFERRED = ["outlandish","legendary","artifact"];
  for (const s of w.segments) if (s.loot && s.loot.magic && s.loot.magic.rarity)
    ok(!DEFERRED.includes(s.loot.magic.rarity.toLowerCase()), `${tag} R${s.num}: loot rarity '${s.loot.magic.rarity}' is T1/T2 (not a deferred band)`);
}
ok(A.rollDungeonWalk({topology:"The Labyrinth Fragment",segCount:1}).fallbackFrom==="The Labyrinth Fragment", "dungeon fallback");

// ── WILDERNESS ───────────────────────────────────────────────────────────────
for (const lc of [1,4,8,12]) {
  const w = A.rollWildernessWalk({ legCount: lc });
  const tag = `WILD@${lc}`;
  ok(w.segments.length === lc + 1, `${tag}: ${w.segments.length} legs (want ${lc+1})`);
  const arr = w.segments[w.segments.length-1];
  ok(arr.isFinale && arr.label === "Arrival" && !!arr.areaType, `${tag}: arrival site`);
  ok(w.edges.length === lc, `${tag}: ${w.edges.length} linear edges (want ${lc})`);
  for (const s of w.segments.filter(s=>!s.isFinale)) {
    ok(!!s.biome, `${tag} L${s.num}: biome`);
    ok(s.encounter && s.encounter.type, `${tag} L${s.num}: encounter`);
    ok(!!s.sensory, `${tag} L${s.num}: sensory`);
    // DIFFICULTY.md threat-signaling: every Enemy leg telegraphs danger BEFORE the player commits
    if (s.encounter && s.encounter.isEnemy)
      ok(!!s.encounter.signal && !!s.encounter.severity, `${tag} L${s.num}: Enemy leg signals danger (signal+severity)`);
  }
}
// wilderness is now tier-aware + clamped to the T2 cap
ok(A.rollWildernessWalk({legCount:4, tier:3}).tier === 2, "wilderness: tier:3 clamps to T2");
ok(A.rollWildernessWalk({legCount:4, tier:1}).tier === 1, "wilderness: tier:1 stays T1");
{ // a T2 wilderness Enemy leg signals 'grave'; a T1 leg signals 'present'
  const findEnemy = (t) => { for (let i=0;i<40;i++){ const w=A.rollWildernessWalk({legCount:6, tier:t});
    const e=w.segments.find(s=>s.encounter && s.encounter.isEnemy); if(e) return e.encounter; } return null; };
  const e2=findEnemy(2); if(e2) ok(e2.severity==="grave", "wilderness T2 Enemy leg severity = grave");
  const e1=findEnemy(1); if(e1) ok(e1.severity==="present", "wilderness T1 Enemy leg severity = present"); }

// ── TIER-2 CAP: a T3+ input is clamped to T2 content (never silently degrades to T1, never reaches T3) ──
ok(A.rollDungeonWalk({segCount:4, tier:3}).tier === "T2", "dungeon: tier:3 clamps to T2");
ok(A.rollDungeonWalk({segCount:4, tier:1}).tier === "T1", "dungeon: tier:1 stays T1");
ok(A.rollUrbanWalk({segCount:4, tier:4}).tier === 2, "urban: tier:4 clamps to T2");
ok(A.rollUrbanWalk({segCount:4, tier:1}).tier === 1, "urban: tier:1 stays T1");

// ── sample dumps ─────────────────────────────────────────────────────────────
function dumpDungeon() {
  const w = A.rollDungeonWalk({ topology:"The Branch", segCount:4, tier:1 });
  console.log(`\n── DUNGEON — ${w.topology} (T${w.tier==="T2"?2:1}) · Haul: ${w.haul.common}C/${w.haul.uncommon}U/${w.haul.rare}R/${w.haul.veryRare}VR ──`);
  console.log(`Threat: ${w.threat.id} (${w.threat.role}) | Myth: ${w.setup.mythSeed}`);
  for (const s of w.segments) {
    if (s.isFinale) { console.log(`  R${s.num} ★ ${s.areaType} — Boss: ${s.finale.bossCreature} (${s.finale.bossArchetype}); ${s.finale.revelation}`); continue; }
    console.log(`  R${s.num} ${s.label?`[${s.label}] `:""}${s.areaType} (depth ${s.depth})`);
    console.log(`       ⚔ ${s.encounter.type}: ${s.encounter.text}`);
    console.log(`       💰 ${s.loot.magic?`[${s.loot.magic.rarity}] ${s.loot.magic.name} · `:""}${s.loot.coin}`);
  }
}
function dumpWild() {
  const w = A.rollWildernessWalk({ legCount:4 });
  console.log(`\n── WILDERNESS — start biome ${w.startBiome} (${w.legCount} legs) ──`);
  for (const s of w.segments) {
    if (s.isFinale) { console.log(`  L${s.num} ★ ARRIVAL: ${s.areaType} — ${s.feature.name}`); continue; }
    console.log(`  L${s.num} [${s.biome}] ⚔ ${s.encounter.type}: ${s.encounter.text}`);
    console.log(`       ~ ${s.sensory}`);
  }
}
dumpDungeon();
dumpWild();

console.log(`\n${fail===0 ? "✅ PASS" : "❌ FAIL"} — ${pass} assertions passed, ${fail} failed`);
if (fail) { for (const f of fails.slice(0,40)) console.log("   ✗ " + f); process.exit(1); }
