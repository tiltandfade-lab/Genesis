/* Verify SOCIAL — Phase 1 (the Attitude data model on the codex record) — full-app jsdom load
   (every module in manifest order, one eval). Asserts: the new globals exist; lazy Indifferent default;
   opening stamped once (not silently re-set); per-NPC floor/ceiling clamp enforcement; absolute set +
   clamp + cause/clock stamping; the per-encounter Terrified override; attitudeLabel mapping; and that
   attitude rides the DM digest but is stripped from the player projection (hidden-by-default, SOCIAL §6.2).
   Phase 1 is DATA MODEL ONLY — the resolver (src/engine/social.js) arrives in Phase 2.

   Run:  node dev/verify-social.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
win.eval("var U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ── globals present ────────────────────────────────────────────────────────────────────────
for (const f of ["codexGetAttitude","codexAttitudeOpen","codexSetAttitude","codexSetTerrified","attitudeLabel"])
  check(`global ${f}`, typeof win[f] === "function");
// (the ATTITUDE_MIN/MAX/STATES consts aren't queryable in this single-eval harness — they survive only as
//  closures inside the functions that captured them; in-browser each <script> makes them global. Their
//  values are exercised behaviorally by every clamp/label assertion below.)

const w = { id:"w1", name:"Test", gazetteer:[], factions:[], ledger:[], clock:{day:1,min:360} };
win.codexAdd(w, { kind:"npc", name:"Sabarra", provenance:"rolled" });
win.codexAdd(w, { kind:"npc", name:"Coll", provenance:"rolled" });
win.codexAdd(w, { kind:"npc", name:"Mire", provenance:"rolled" });
win.codexAdd(w, { kind:"npc", name:"Zealot", provenance:"rolled" });
win.codexAdd(w, { kind:"npc", name:"Hireling", provenance:"rolled" });

// ── lazy default: no attitude written until first contact; reads Indifferent ────────────────
const lazy = win.codexGetAttitude(w, "npc:sabarra");
check("lazy default reads Indifferent (value 0)", lazy.value === 0 && lazy.opening === 0);
check("lazy default is flagged lazy", lazy.lazy === true);
check("lazy read does NOT write status.attitude", win.codexGet(w,"npc:sabarra").status.attitude === undefined);
check("attitudeLabel(0) = Indifferent", win.attitudeLabel(0) === "Indifferent");
check("attitudeLabel(-2/+2) = Hostile/Helpful", win.attitudeLabel(-2) === "Hostile" && win.attitudeLabel(2) === "Helpful");
check("attitudeLabel clamps out-of-range", win.attitudeLabel(9) === "Helpful" && win.attitudeLabel(-9) === "Hostile");

// ── opening stamped once; not silently re-set (§1.1) ────────────────────────────────────────
const op = win.codexAttitudeOpen(w, "npc:coll", 1, { cause:"shared origin", clock:100 });
check("open stamps value+opening", op.value === 1 && op.opening === 1);
check("open is now persisted on the record", win.codexGet(w,"npc:coll").status.attitude.value === 1);
check("open is no longer lazy", !win.codexGetAttitude(w,"npc:coll").lazy);
const op2 = win.codexAttitudeOpen(w, "npc:coll", -2, { cause:"retry" });
check("re-open WITHOUT force does not overwrite (opening rolled once)", op2.value === 1 && op2.opening === 1);
const op3 = win.codexAttitudeOpen(w, "npc:coll", -1, { force:true, cause:"story beat" });
check("re-open WITH force overwrites", op3.value === -1 && op3.opening === -1);
check("opening clamps to the ladder (5 → +2)", win.codexAttitudeOpen(w,"npc:mire",5,{}).opening === 2);

// ── per-NPC clamps: a sworn enemy can't be talked to Friendly (ceiling −1) ───────────────────
win.codexAttitudeOpen(w, "npc:zealot", -2, { ceiling:-1, floor:-2, cause:"sworn to kill the PC" });
const z1 = win.codexSetAttitude(w, "npc:zealot", 2, "charmed", 150);   // try to force Friendly
check("ceiling clamp holds (set +2 → clamped to −1)", z1.value === -1);
check("set stamps cause + clock", z1.note === "charmed" && z1.lastShiftClock === 150);
// a loyal hireling: floor 0 — can't be driven Hostile by a bad roll
win.codexAttitudeOpen(w, "npc:hireling", 1, { floor:0, ceiling:2, cause:"sworn service" });
const h1 = win.codexSetAttitude(w, "npc:hireling", -2, "insulted");
check("floor clamp holds (set −2 → clamped to 0)", h1.value === 0);

// ── absolute set on a lazy record auto-opens an Indifferent baseline, then clamps ───────────
const s1 = win.codexSetAttitude(w, "npc:sabarra", 1, "returned her brother's knife", 142);
check("set on lazy record writes attitude", win.codexGet(w,"npc:sabarra").status.attitude.value === 1);
check("default clamps are full ladder (−2..+2)", s1.floor === -2 && s1.ceiling === 2);
const s2 = win.codexSetAttitude(w, "npc:sabarra", 99, "absurd");
check("set clamps to ladder max (+2)", s2.value === 2);

// ── the per-encounter Terrified override (§1) ───────────────────────────────────────────────
win.codexAttitudeOpen(w, "npc:mire", 1, { force:true, cause:"reset" });   // start Friendly-ish
const t1 = win.codexSetTerrified(w, "npc:mire", true, 200);
check("terrified flag set", t1.terrified === true);
check("terrified drops underlying to Hostile (compliance through fear)", t1.value === -2);
const t2 = win.codexSetTerrified(w, "npc:mire", false, 210);
check("clearing terror lifts the flag (value stays — now plain Hostile)", t2.terrified === false && t2.value === -2);

// ── digest carries attitude; player view never exposes it (hidden by default, §6.2) ─────────
win.codexReveal(w, "npc:coll");                         // make it known so it appears in player view
const dig = win.codexDigest(w).find(r => r.id === "npc:coll");
check("DM digest carries the attitude (status passes through)", dig.status.attitude && typeof dig.status.attitude.value === "number");
const pv = win.codexPlayerView(w).find(r => r.id === "npc:coll");
check("known record appears in player view", !!pv);
check("player view STRIPS attitude (hidden DC, §6.2)", pv.status.attitude === undefined);
check("player view keeps only at/condition", "at" in pv.status && "condition" in pv.status && Object.keys(pv.status).length === 2);

// ════════════════════════════════════════════════════════════════════════════════════════════
// PHASE 2 — the resolver (src/engine/social.js): pure, deterministic, returns deltas.
// ════════════════════════════════════════════════════════════════════════════════════════════
console.log("\n— Phase 2: resolver —");
for (const f of ["socialDC","applyLeverage","resolveSocialCheck","moraleDC","resolveMorale","insightReadDC"])
  check(`global ${f}`, typeof win[f] === "function");

// §2 — socialDC ladder (DC to shift one step friendlier; Helpful terminal)
check("socialDC: Hostile→25", win.socialDC(-2) === 25);
check("socialDC: Wary→20", win.socialDC(-1) === 20);
check("socialDC: Indifferent→15", win.socialDC(0) === 15);
check("socialDC: Friendly→10", win.socialDC(1) === 10);
check("socialDC: Helpful→terminal (null)", win.socialDC(2) === null);

// §2.1 — leverage adjusts the DC
check("applyLeverage: Want −5 (20→15)", win.applyLeverage(20, ["want"]).dc === 15);
check("applyLeverage: wrong lever +5 (15→20)", win.applyLeverage(15, ["wrongLever"]).dc === 20);
check("applyLeverage: stacks (20, want+trustLever → 10)", win.applyLeverage(20, ["want","trustLever"]).dc === 10);
check("applyLeverage: clamps to floor 5", win.applyLeverage(12, ["want","fear","leverage","trustLever"]).dc === 5);
check("applyLeverage: decisive leverage → autoShift", win.applyLeverage(20, [{type:"leverage",decisive:true}]).autoShift === true);
check("applyLeverage: non-decisive → no autoShift", win.applyLeverage(20, ["leverage"]).autoShift === false);

// §2 + §8 — resolveSocialCheck worked examples (the spec's fixtures)
const r1 = win.resolveSocialCheck({ value:-1, ceiling:2, floor:-2, skill:"persuasion", dc:15, total:17 });
check("§8.1 wary→indifferent on success (+1)", r1.outcome==="success" && r1.from===-1 && r1.to===0 && r1.shift===1);
const r2 = win.resolveSocialCheck({ value:0, skill:"persuasion", dc:20, total:12 });   // miss by 8
check("§8.2 miss-by-5+ backfires (−1)", r2.outcome==="backfire" && r2.to===-1 && r2.shift===-1);
const r3 = win.resolveSocialCheck({ value:0, skill:"deception", dc:15, total:10, caughtLie:true });
check("caught lie drops two (−2)", r3.to===-2 && r3.shift===-2);
const r4 = win.resolveSocialCheck({ value:0, skill:"persuasion", dc:15, total:13 });   // miss by 2
check("flat miss (<5) = no shift, approach spent", r4.outcome==="no-shift" && r4.shift===0);
const r5 = win.resolveSocialCheck({ value:1, ceiling:1, skill:"persuasion", dc:10, total:25 });
check("ceiling clamp: success at cap → capped, no shift", r5.outcome==="capped" && r5.shift===0 && r5.granted===true);
const r6 = win.resolveSocialCheck({ value:2, ceiling:2, skill:"persuasion", dc:5, total:99 });
check("Helpful is terminal (capped)", r6.outcome==="capped" && r6.shift===0);
const r7 = win.resolveSocialCheck({ value:0, skill:"intimidation", dc:10, total:20, overshoot:true });
check("intimidation overshoot → Terrified (→Hostile, flagged)", r7.outcome==="terrified" && r7.to===-2 && r7.terrified===true && r7.granted===true);
const r8 = win.resolveSocialCheck({ value:-2, floor:-2, skill:"persuasion", dc:99, total:1 });
check("floor clamp on backfire (can't drop below floor)", r8.to===-2);

// §3 — morale
check("moraleDC: bloodied→10", win.moraleDC("bloodied") === 10);
check("moraleDC: leader-fell→15", win.moraleDC("leader-fell") === 15);
check("moraleDC: overwhelming→20", win.moraleDC("overwhelming") === 20);
check("moraleDC: defending +5", win.moraleDC("leader-fell", {defending:true}) === 20);
check("moraleDC: desperate −5", win.moraleDC("leader-fell", {desperate:true}) === 10);
check("moraleDC: unknown trigger → 15", win.moraleDC("???") === 15);
check("resolveMorale: save≥dc holds", win.resolveMorale({save:16, dc:15}).held === true);
check("resolveMorale: save<dc breaks", win.resolveMorale({save:9, dc:15}).outcome === "broke");

// §6 — scaled insight-to-read-attitude DC
check("insightReadDC: open person = base 10", win.insightReadDC({}) === 10);
check("insightReadDC: guarded → 15", win.insightReadDC({guarded:true}) === 15);
check("insightReadDC: masking adds best mental mod", win.insightReadDC({masking:true, mentalMods:[3,1,4]}) === 14);
check("insightReadDC: guarded + masking sharp NPC is hard", win.insightReadDC({guarded:true, masking:true, mentalMods:[2,4,1]}) === 19);
check("insightReadDC: masking but dull (no positive mod) = no bump", win.insightReadDC({masking:true, mentalMods:[-1,0,-2]}) === 10);

console.log(`\nSOCIAL Phase 1+2: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
