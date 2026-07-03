/* Verify the BREACH-TOUCHED NPC rider (BATCH3-PLAN unit 8; docs/BREACH.md §2d + BATCH3-GUARDRAILS
   J1/J2) — a rare fray-scaled d12 rider on rollNPC(), landing on `dm.breachTouch` only. Full-app
   jsdom load + compiled tables.js (same convention as dev/verify-codex-roll.mjs).

   Also asserts the content-link half of the spec: Distant Word's Mythic row (breach rumor) and
   TIYL's slipped/doorway Uncanny-Encounter rows exist verbatim in the corpus this rider composes
   with (per docs/BREACH.md §2d: "composes with what exists ... free" — no new call site into
   either, so the harness checks the referenced text is really there, not a stale citation).

   Run:  node dev/verify-touched-npcs.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
// NPC_BREACH_TOUCH is a top-level `const` in codex-roll.js — a lexical binding, never a `window`
// property, even under runScripts. Same convention as verify-regions.mjs's FRAY_D accessor: append
// a tiny same-scope accessor function (a `function` DECLARATION, which does attach to window) so the
// harness can read it without touching the module's own const-vs-var discipline.
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src
  + "\nfunction __npcBreachTouch(){return NPC_BREACH_TOUCH;}");

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// --- symbols present ---
for (const f of ["rollNPC", "touchedNpcChance", "rollNpcBreachTouch", "frayLevel"])
  check(`global ${f}`, typeof win[f] === "function", typeof win[f]);
check("NPC_BREACH_TOUCH is a d12 vocabulary array", Array.isArray(win.__npcBreachTouch()) && win.__npcBreachTouch().length === 12,
  `length=${win.__npcBreachTouch() && win.__npcBreachTouch().length}`);
check("NPC_BREACH_TOUCH: every row is non-empty prose text", win.__npcBreachTouch().every(t => typeof t === "string" && t.length > 10));

// --- touchedNpcChance: the ~2% -> ~8% fray-scaled curve (BATCH3-GUARDRAILS J2 exact numbers) ---
check("touchedNpcChance(0) == 0.02 (the floor)", Math.abs(win.touchedNpcChance(0) - 0.02) < 1e-9, win.touchedNpcChance(0));
check("touchedNpcChance(1) == 0.08 (the rim ceiling)", Math.abs(win.touchedNpcChance(1) - 0.08) < 1e-9, win.touchedNpcChance(1));
check("touchedNpcChance(0.5) == 0.05 (linear midpoint)", Math.abs(win.touchedNpcChance(0.5) - 0.05) < 1e-9, win.touchedNpcChance(0.5));
check("touchedNpcChance clamps fray>1 at the ceiling", Math.abs(win.touchedNpcChance(5) - 0.08) < 1e-9, win.touchedNpcChance(5));
check("touchedNpcChance(undefined) degrades to the floor, never higher", Math.abs(win.touchedNpcChance(undefined) - 0.02) < 1e-9, win.touchedNpcChance(undefined));
check("touchedNpcChance(-1) degrades to the floor (never negative fray)", Math.abs(win.touchedNpcChance(-1) - 0.02) < 1e-9, win.touchedNpcChance(-1));

// --- rollNpcBreachTouch: distribution sampling at origin (fray=0) vs the rim (fray=1) ---
let originHits = 0, rimHits = 0;
const N = 20000;
for (let i = 0; i < N; i++) { if (win.rollNpcBreachTouch(0)) originHits++; }
for (let i = 0; i < N; i++) { if (win.rollNpcBreachTouch(1)) rimHits++; }
const originRate = originHits / N, rimRate = rimHits / N;
check(`rollNpcBreachTouch(0) fires ~2% over ${N} samples`, Math.abs(originRate - 0.02) < 0.006, `${(originRate*100).toFixed(2)}%`);
check(`rollNpcBreachTouch(1) fires ~8% over ${N} samples`, Math.abs(rimRate - 0.08) < 0.012, `${(rimRate*100).toFixed(2)}%`);
check("the rim rate is meaningfully higher than the origin rate (fray actually scales it)", rimRate > originRate * 2);

// --- rollNpcBreachTouch shape: null on miss, {text,index} on hit, text always from the vocabulary ---
let shapeOk = true, textOk = true;
for (let i = 0; i < 2000; i++) {
  const t = win.rollNpcBreachTouch(1);
  if (t !== null && !(typeof t.text === "string" && typeof t.index === "number")) shapeOk = false;
  if (t !== null && win.__npcBreachTouch()[t.index] !== t.text) textOk = false;
}
check("rollNpcBreachTouch: every hit is {text,index}, every miss is null", shapeOk);
check("rollNpcBreachTouch: text always matches NPC_BREACH_TOUCH[index] verbatim", textOk);

// --- rollNPC integration: dm.breachTouch appears ONLY on the rare roll, never in player `fields` ---
const originRegion = { center: { q: 0, r: 0 } };
const rimRegion = { center: { q: 1000, r: 1000 } };   // far beyond FRAY_D=40 -> frayLevel clamps to 1
let touchedAtRim = 0, leakedToFields = 0, wellFormedWithTouch = 0;
const RN = 3000;
for (let i = 0; i < RN; i++) {
  const npc = win.rollNPC({ region: rimRegion });
  if (npc.dm.breachTouch) {
    touchedAtRim++;
    if (win.__npcBreachTouch().includes(npc.dm.breachTouch)) wellFormedWithTouch++;
  }
  if (npc.fields.breachTouch) leakedToFields++;
}
check(`rollNPC({region:rim}) mints dm.breachTouch on a plausible share of ${RN} rolls (rim rate ~8%)`,
  touchedAtRim > 0 && touchedAtRim / RN < 0.15, `${touchedAtRim}/${RN}`);
check("rollNPC: every minted breachTouch is a verbatim NPC_BREACH_TOUCH row", wellFormedWithTouch === touchedAtRim);
check("rollNPC: breachTouch NEVER leaks into player-safe `fields`", leakedToFields === 0, `${leakedToFields}/${RN}`);

// --- rollNPC without opts.region: byte-identical shape to before the rider existed (mutation-safe
//     baseline) — dm.breachTouch is simply ABSENT on the vast majority (floor rate), never forced. ---
let noRegionTouched = 0;
const NR = 3000;
for (let i = 0; i < NR; i++) { if (win.rollNPC().dm.breachTouch) noRegionTouched++; }
check(`rollNPC() with no region still only touches at the floor rate (~2%) over ${NR} rolls`,
  noRegionTouched / NR < 0.06, `${noRegionTouched}/${NR}`);

// --- MUTATION CHECK (spec-named, BATCH-GUARDRAILS G1): breaking the fray-scale must fail the harness.
//     Temporarily force touchedNpcChance to ALWAYS return the rim ceiling regardless of fray, confirm
//     the origin-vs-rim distribution assertion above would now be VIOLATED, then restore. This proves
//     the harness has real teeth on the fray-scaling claim (not just checking shape). */
{
  const realFn = win.touchedNpcChance;
  win.touchedNpcChance = function(){ return 0.08; };   // mutate: ignore fray entirely
  let mutatedOriginHits = 0;
  const MN = 5000;
  for (let i = 0; i < MN; i++) { if (win.rollNpcBreachTouch(0)) mutatedOriginHits++; }
  const mutatedRate = mutatedOriginHits / MN;
  const brokenAsExpected = Math.abs(mutatedRate - 0.08) < 0.015 && Math.abs(mutatedRate - 0.02) > 0.02;
  console.log(`  [mutation] touchedNpcChance forced constant 0.08 -> origin(fray=0) rate = ${(mutatedRate*100).toFixed(2)}% (expected ~8%, i.e. WRONG vs the real 2% floor) -> RED as expected: ${brokenAsExpected}`);
  check("MUTATION: forcing touchedNpcChance constant breaks the fray-scale guarantee (shown RED)", brokenAsExpected);
  win.touchedNpcChance = realFn;   // restore
  let restoredHits = 0;
  for (let i = 0; i < MN; i++) { if (win.rollNpcBreachTouch(0)) restoredHits++; }
  const restoredRate = restoredHits / MN;
  check("MUTATION restored: origin rate back to ~2% after undoing the mutation", Math.abs(restoredRate - 0.02) < 0.01, `${(restoredRate*100).toFixed(2)}%`);
}

// --- content-link half: the corpus this rider composes with is really there (BREACH §2d "free") ---
check("compiled distant-word table has 100 rows (Mythic row 100 carries breach rumor)",
  win.GENESIS_TABLES && win.GENESIS_TABLES["distant-word"] && win.GENESIS_TABLES["distant-word"].rows.length === 100);
const dwRow100 = win.GENESIS_TABLES["distant-word"].rows.find(r => r[0] === 100);
check("distant-word row 100 is Mythic + reads as breach-adjacent (the word arrived before the event)",
  !!dwRow100 && dwRow100[2] === "Mythic" && /arrived before the event/.test(dwRow100[3]));
const lifeOriginsText = read("Engine/03. _Tables/04. Character Genesis/Life & Origins.md");
check("TIYL Life & Origins carries the 91-95 'slipped into the wild-beyond' row (Volatile)",
  /91–95[^\n]*slipped[^\n]*wild-beyond[^\n]*Volatile/.test(lifeOriginsText));
check("TIYL Life & Origins carries the 96-00 'doorway...another world' row (thread, Volatile)",
  /96–00[^\n]*doorway you believe opens onto another world[^\n]*thread, Volatile/.test(lifeOriginsText));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
