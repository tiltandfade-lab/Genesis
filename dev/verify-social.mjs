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

// ════════════════════════════════════════════════════════════════════════════════════════════
// PHASE 3 — the event layer (applyEvent in src/world/dm.js) + the review-fix regression guards.
// ════════════════════════════════════════════════════════════════════════════════════════════
console.log("\n— Phase 3: events + review fixes —");
check("global applyEvent", typeof win.applyEvent === "function");

// ── review fixes (regression guards) ─────────────────────────────────────────────────────────
const w3 = { id:"w3", name:"Fixes", gazetteer:[], factions:[], ledger:[], clock:{day:1,min:360} };
// FIX#1 — clearing terror on a NEVER-frightened NPC must not mint a Hostile record
win.codexAdd(w3, { kind:"npc", name:"Never", provenance:"rolled" });
const clr = win.codexSetTerrified(w3, "npc:never", false, 5);
check("FIX#1 terror-clear on never-scared NPC is a no-op (no minted attitude)",
  win.codexGet(w3,"npc:never").status.attitude === undefined && clr.value === 0);
// FIX#3 — ANY decisive lever auto-shifts (a buy-off encoded as a 'want', not only 'leverage')
check("FIX#3 decisive 'want' lever auto-shifts (the buy-off)",
  win.applyLeverage(15, [{type:"want",decisive:true}]).autoShift === true);
// FIX#2 — a clamped enemy at a sub-Indifferent ceiling is a WALL, not a granted ask
const wall = win.resolveSocialCheck({ value:-1, ceiling:-1, floor:-2, skill:"persuasion", dc:20, total:30 });
check("FIX#2 enemy clamped below Indifferent → wall, refused", wall.outcome==="wall" && wall.granted===false && wall.shift===0);
const capOk = win.resolveSocialCheck({ value:0, ceiling:0, skill:"persuasion", dc:15, total:20 });
check("FIX#2 cap AT Indifferent still grants (cooperative)", capOk.outcome==="capped" && capOk.granted===true);
// FIX#5 — codexAdd deep-merges the attitude sub-object (a partial re-add can't drop the clamps)
win.codexAdd(w3, { kind:"npc", name:"Sworn", provenance:"rolled" });
win.codexAttitudeOpen(w3, "npc:sworn", -2, { ceiling:-1, floor:-2, cause:"oath" });
win.codexAdd(w3, { kind:"npc", name:"Sworn", status:{ at:"node-7" } });   // partial idempotent re-add
const sworn = win.codexGet(w3,"npc:sworn").status;
check("FIX#5 re-add PRESERVES the attitude clamp (ceiling −1 survives)",
  sworn.attitude && sworn.attitude.ceiling === -1 && sworn.attitude.opening === -2);
check("FIX#5 re-add still applies the flat status field (at)", sworn.at === "node-7");

// ── event wiring ─────────────────────────────────────────────────────────────────────────────
const w2 = { id:"w2", name:"Events", gazetteer:[], factions:[], ledger:[], clock:{day:3,min:360}, currentNodeId:"square" };
const ev = (type, payload, source) => win.applyEvent(w2, { type, payload, source:source||"declared" });
win.codexAdd(w2, { kind:"npc", name:"Informant", provenance:"rolled", status:{ at:"square" } });
win.codexAdd(w2, { kind:"npc", name:"Goblin",    provenance:"rolled", status:{ at:"cave"   } });

// parley_open stamps the rolled opening once
const po = ev("parley_open", { target:"npc:informant", openingAttitude:-1, want:"a way out" });
check("parley_open stamps opening (Wary −1)", po.ok && po.opening === -1 && win.codexGetAttitude(w2,"npc:informant").value === -1);

// social_check §8.1 — Wary + trust-lever (−5 → DC15), Persuasion 17 → success +1 → Indifferent, committed
const sc = ev("social_check", { target:"npc:informant", skill:"persuasion", lever:"trustLever", total:17 });
check("social_check prices DC from CURRENT attitude + lever (20−5=15)", sc.dc === 15);
check("social_check success → +1 step (Wary→Indifferent), granted", sc.from===-1 && sc.to===0 && sc.granted===true);
check("social_check COMMITTED the shift to the codex", win.codexGetAttitude(w2,"npc:informant").value === 0);
// anti-drift: the DM can't inflate it — an honest miss moves nothing up
const scMiss = ev("social_check", { target:"npc:informant", skill:"persuasion", total:14 });   // DC15, miss by 1
check("social_check honest miss does not raise attitude", scMiss.granted===false && win.codexGetAttitude(w2,"npc:informant").value === 0);
// decisive lever → auto-shift even on a terrible roll
const scAuto = ev("social_check", { target:"npc:informant", skill:"persuasion", lever:{type:"want",decisive:true}, total:1 });
check("social_check decisive lever auto-shifts despite a low roll", scAuto.outcome==="auto-shift" && scAuto.to===1);
// missing record → graceful no-target, never throws
const noT = ev("social_check", { target:"npc:ghost", skill:"persuasion", total:20 });
check("social_check on a missing record → no-target (no throw)", noT.ok===false && /no-target/.test(noT.reason));

// attitude_shift — a declared absolute set (story beat / group cascade)
const as = ev("attitude_shift", { target:"npc:goblin", to:-2, cause:"saw its kin die" });
check("attitude_shift sets the absolute value", as.ok && win.codexGetAttitude(w2,"npc:goblin").value === -2);

// morale_check — leader-fell DC15, failed save → broke + carries the DM's route; passed save → holds
const mc = ev("morale_check", { creature:"Goblin", trigger:"leader-fell", save:9, outcome:"parley" });
check("morale_check breaks on a failed save, carries the route", mc.held===false && mc.dc===15 && mc.outcome==="parley");
const mc2 = ev("morale_check", { creature:"Goblin", trigger:"bloodied", save:16 });
check("morale_check holds on a passed save", mc2.held===true && mc2.dc===10);

// kill{civilian} + co-location → DETECTED witness hostility on co-located NPCs ONLY
win.codexAdd(w2, { kind:"npc", name:"Farmer", provenance:"rolled", status:{ at:"farm" } });
ev("kill", { victimClass:"civilian", victimId:"npc:baker", at:"square" });
check("detected: co-located NPC (square) witnesses → Hostile", win.codexGetAttitude(w2,"npc:informant").value === -2);
check("detected: distant NPC (farm) never witnesses — no attitude minted", win.codexGet(w2,"npc:farmer").status.attitude === undefined);

// ════════════════════════════════════════════════════════════════════════════════════════════
// PHASE 4 — surfacing: the DM digest MATERIALIZES attitude · the player view GATES it on an Insight
// read · the Codex panel renders the five-step tell.
// ════════════════════════════════════════════════════════════════════════════════════════════
console.log("\n— Phase 4: surfacing (digest · gated player tell · panel) —");
const w4 = { id:"w4", name:"Surface", gazetteer:[], factions:[], ledger:[], clock:{day:1,min:360} };
const ev4 = (type, payload) => win.applyEvent(w4, { type, payload, source:"declared" });
win.codexAdd(w4, { kind:"npc",      name:"Guard", provenance:"rolled" });
win.codexAdd(w4, { kind:"location", name:"Gate",  provenance:"rolled" });

// the DM digest materializes attitude for EVERY npc — even a lazy-default one that never had it written
const dGuard = win.codexDigest(w4).find(r => r.id === "npc:guard");
check("digest materializes npc attitude (lazy default → Indifferent)", !!dGuard.attitude && dGuard.attitude.value === 0 && dGuard.attitude.label === "Indifferent");
check("digest flags the lazy default (lazy:true, read:false)", dGuard.attitude.lazy === true && dGuard.attitude.read === false);
check("digest does NOT attach attitude to non-npc records", !win.codexDigest(w4).find(r => r.id === "location:gate").attitude);

// give the Guard a real attitude + make it known; the player view STILL hides it until an Insight read
win.codexSetAttitude(w4, "npc:guard", -1, "wary of strangers");
win.codexReveal(w4, "npc:guard");
check("player view HIDES attitude before a read (known but unread, §6.2)",
  win.codexPlayerView(w4).find(r => r.id === "npc:guard").attitude === undefined);

// insight_read: a FAILED roll (below the hidden, scaled DC) reveals nothing
const ir0 = ev4("insight_read", { target:"npc:guard", total:8, guarded:true, masking:true, mentalMods:[3] });
check("insight_read prices the scaled DC (10 +5 guarded +3 masking = 18) and fails on a low roll", ir0.dc === 18 && ir0.read === false);
check("player view still hidden after a failed read", win.codexPlayerView(w4).find(r => r.id === "npc:guard").attitude === undefined);

// insight_read: a SUCCESS flips the player-view tell on
const ir1 = ev4("insight_read", { target:"npc:guard", total:12 });   // open read, DC 10
check("insight_read success reveals (read=true, carries the label)", ir1.read === true && ir1.dc === 10 && ir1.attitude.label === "Wary");
const pvAfter = win.codexPlayerView(w4).find(r => r.id === "npc:guard");
check("player view now exposes the COARSE tell (value+label)", !!pvAfter.attitude && pvAfter.attitude.value === -1 && pvAfter.attitude.label === "Wary");
check("player tell never leaks the DC / opening / clamps", !("opening" in pvAfter.attitude) && !("floor" in pvAfter.attitude) && !("dc" in pvAfter.attitude));

// the Codex panel renders the ladder for a read NPC
if (typeof win.codexPanel === "function"){
  const html = win.codexPanel(w4);
  check("codex panel renders the disposition tell for a read NPC", /disposition/.test(html) && /Wary/.test(html));
} else check("codex panel available", false, "codexPanel missing");

console.log(`\nSOCIAL Phase 1+2+3+4: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
process.exit(fail ? 1 : 0);
