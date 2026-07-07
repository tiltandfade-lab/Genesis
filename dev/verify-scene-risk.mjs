/* verify-scene-risk.mjs — headless test for THE SCENE RISK CONTRACT
   (docs/SCENE-RISK-CONTRACT.md, SPEC-LOCKED 2026-07-06, §10: 14 enumerated checks, RED-FIRST).

   Modeled byte-for-byte on dev/verify-breach.mjs's jsdom loader (manifest loadOrder + tables.js,
   accessor-wrapper gotcha for top-level consts that don't attach to jsdom's `window` under win.eval).

   Run:  node dev/verify-scene-risk.mjs
   (jsdom installed per-environment — JSDOM_HOME overrides ~/.genesis-jsdom, see CLAUDE.md.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
// top-level `const`s (SCENE_RISK_VOCAB etc.) don't attach to jsdom's `window` under win.eval (same
// gotcha documented in verify-breach.mjs/verify-gen.mjs) — thin accessor wrappers expose them.
const accessors = "function __riskVocab(){return SCENE_RISK_VOCAB;} function __riskLadder(){return SCENE_RISK_LADDER;} " +
  "function __riskStakes(){return SCENE_RISK_STAKES;} function __riskFallback(){return SCENE_RISK_FALLBACK_TELEGRAPH;}";

// HOTFIX-QUEUE-2026-07-07 HQ2-10 — flake-proofing: rollUrbanWalk/rollDungeonWalk draw real dice over
// live Math.random, and test 4's "all three MOVED" assertion compares against a freshly-rolled center
// walk that can occasionally land on nightmare/corpse-hard-to-recover/map by chance alone (RED
// baseline: failed 2/10). Install a deterministic mulberry32 generator as the window's Math.random
// (idiom copied verbatim from dev/playtest-bridgeless.mjs's --seed path). --seed=<int> overrides; a
// FIXED default keeps an un-argumented run deterministic too.
const __seedArg = process.argv.find((a) => a.startsWith("--seed="));
const RNG_SEED = __seedArg ? (parseInt(__seedArg.slice(7), 10) >>> 0) || 1 : 20260707;
function installSeededRandom(win, seed){
  let s = seed >>> 0;
  win.Math.random = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function newWin() {
  const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n") + "\n;\n" + accessors;
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + full);
  installSeededRandom(dom.window, RNG_SEED);   // BEFORE any scenario's first roll (HQ2-10)
  dom.window.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", String(detail)));

function baseWorld(id){
  return {
    id, name: "The Scene-Risk Test",
    seed: { master: { name: "Test Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
            taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" } },
    characters: [{ status: "living", name: "Tester", headline: "a climber", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Folk Hero", level: 3, hp: "20/20", ac: 15,
               profBonus: 2, scores: {}, mods: { str: 2, dex: 1 }, saveProfs: [], skillProfs: ["Athletics"] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [], revealed: {}, dmlog: [],
  };
}

function mkSeg(num, opts){
  opts = opts || {};
  return Object.assign({ id:"s"+num, num, isFinale:false, encounter:{ type:"Empty", isEnemy:false } }, opts);
}

console.log("\n--- 1. module loads; vocab frozen + exact ---");
{
  const win = newWin();
  const vocab = win.__riskVocab();
  check("1. SCENE_RISK_VOCAB is frozen", Object.isFrozen(vocab));
  check("1b. dangerBand vocab exact", JSON.stringify(vocab.dangerBand) === JSON.stringify(["safe","risky","deadly","nightmare","mythic"]), JSON.stringify(vocab.dangerBand));
  check("1c. rewardBand vocab exact", JSON.stringify(vocab.rewardBand) === JSON.stringify(["ordinary","good","rare","strange","legendary"]), JSON.stringify(vocab.rewardBand));
  check("1d. telegraph vocab exact", JSON.stringify(vocab.telegraph) === JSON.stringify(["rumor","corpse","sign","scout","map","survivor"]), JSON.stringify(vocab.telegraph));
  check("1e. escapeModes vocab exact", JSON.stringify(vocab.escapeModes) === JSON.stringify(["flee","bargain","stealth","environment","sacrifice"]), JSON.stringify(vocab.escapeModes));
  check("1f. deathStakes vocab exact", JSON.stringify(vocab.deathStakes) === JSON.stringify(["loot-risk","corpse-hard-to-recover","bardo-only","world-shift"]), JSON.stringify(vocab.deathStakes));
  check("1g. persistentTrace vocab exact", JSON.stringify(vocab.persistentTrace) === JSON.stringify(["story","clock","map","world-shift"]), JSON.stringify(vocab.persistentTrace));
}

console.log("\n--- 2. T1 urban walk, forced Grounded skin -> deterministic recompute ---");
{
  const win = newWin();
  const walk = win.rollUrbanWalk({ segCount: 5, tier: 1 });
  check("2. rollUrbanWalk stamps walk.risk", !!walk.risk, JSON.stringify(walk.risk));
  const expectedBand = (() => {
    // recompute expected band in-harness from the SAME walk (derivation must agree, not a tautology
    // against itself — we don't call sceneRiskDangerBand a second time, we redo the §3.2 arithmetic).
    const enemyShare = walk.risk.derived.enemyShare;
    const bandScore = ({strange:1, volatile:2, mythic:3})[String(walk.skin && walk.skin.band||"").toLowerCase()] || 0;
    const score = (walk.tier===2?1:0) + (enemyShare>=0.5?1:0) + ((walk.heatStart||0)>=2?1:0) + bandScore;
    return score>=3 ? "deadly" : (score>=1 ? "risky" : "safe");
  })();
  check("2b. dangerBand matches independent recomputation of the §3.2 arithmetic", walk.risk.dangerBand === expectedBand,
    JSON.stringify({ got: walk.risk.dangerBand, expected: expectedBand, derived: walk.risk.derived }));
}

console.log("\n--- 3. MUTATION: band moves when skin/tier force a higher score ---");
{
  const win = newWin();
  const walk = win.rollUrbanWalk({ segCount: 5, tier: 1 });
  const before = walk.risk.dangerBand;
  delete walk.risk;
  walk.skin = { text:"x", band:"Volatile" };
  walk.tier = 2;
  // force enemyShare high too, so score = tier(1)+enemy(1)+heat(0)+bandScore(2) = 4 >= 3
  walk.segments = [mkSeg(1,{encounter:{type:"Combat",isEnemy:true}}), mkSeg(2,{encounter:{type:"Combat",isEnemy:true}}), mkSeg(3,{isFinale:true,encounter:{type:"Empty",isEnemy:false}})];
  const after = win.sceneRiskOf(walk, null);
  check("3. band MOVED (after !== before)", after.risk.dangerBand !== before, JSON.stringify({ before, after: after.risk.dangerBand }));
  check("3b. landed exactly where §3.2 arithmetic says (score 4 -> deadly)", after.risk.dangerBand === "deadly", JSON.stringify(after.risk));
}

console.log("\n--- 4. Breach-tail walk -> nightmare band + stakes/trace MOVED ---");
{
  const win = newWin();
  const centerWalk = win.rollUrbanWalk({ segCount: 4, tier: 1 });
  const breachWalk = JSON.parse(JSON.stringify({ environment:"urban", tier:1, segments: centerWalk.segments, heatStart:0 }));
  breachWalk.skin = { text:"x", band:"Grounded", tail:"breach" };
  const stamped = win.sceneRiskOf(breachWalk, null);
  check("4. dangerBand===nightmare", stamped.risk.dangerBand === "nightmare", JSON.stringify(stamped.risk));
  check("4b. deathStakes===corpse-hard-to-recover", stamped.risk.deathStakes === "corpse-hard-to-recover", stamped.risk.deathStakes);
  check("4c. persistentTrace===map", stamped.risk.persistentTrace === "map", stamped.risk.persistentTrace);
  check("4d. all three MOVED from the center walk's values", centerWalk.risk.dangerBand !== stamped.risk.dangerBand
    && centerWalk.risk.deathStakes !== stamped.risk.deathStakes
    && centerWalk.risk.persistentTrace !== stamped.risk.persistentTrace,
    JSON.stringify({ center: centerWalk.risk, breach: stamped.risk }));
}

console.log("\n--- 5. Marooned world -> mythic + world-shift + hunt clock ---");
{
  const win = newWin();
  const w = { realm: { active:true, physics:["huntRules"], debt:1 } };
  const walk = { environment:"dungeon", tier:1, segments:[mkSeg(1)] };
  const stamped = win.sceneRiskOf(walk, w);
  check("5. dangerBand===mythic", stamped.risk.dangerBand === "mythic", stamped.risk.dangerBand);
  check("5b. deathStakes===world-shift", stamped.risk.deathStakes === "world-shift", stamped.risk.deathStakes);
  check("5c. pressureClock.kind===hunt", stamped.risk.pressureClock && stamped.risk.pressureClock.kind === "hunt", JSON.stringify(stamped.risk.pressureClock));
}

console.log("\n--- 6. Ladder + stakes maps hold for all five bands ---");
{
  const win = newWin();
  const ladder = win.__riskLadder(), stakes = win.__riskStakes();
  const bands = win.__riskVocab().dangerBand;
  let allOk = true, detail = [];
  for(const b of bands){
    const walk = { environment:"dungeon", tier:1, segments:[mkSeg(1)] };
    let w = null;
    if(b==="mythic") w = { realm:{active:true, physics:[]} };
    else if(b==="nightmare") walk.skin = { tail:"nightmare" };
    else if(b==="deadly"){ walk.tier=2; walk.skin={band:"Mythic"}; walk.segments=[mkSeg(1,{encounter:{isEnemy:true}}), mkSeg(2,{isFinale:true})]; }
    else if(b==="risky"){ walk.tier=2; }
    // safe: defaults
    const stamped = win.sceneRiskOf(walk, w);
    const okLadder = stamped.risk.rewardBand === ladder[stamped.risk.dangerBand];
    const okStakes = stamped.risk.deathStakes === stakes[stamped.risk.dangerBand];
    if(!okLadder || !okStakes) { allOk = false; detail.push({ b, got: stamped.risk }); }
  }
  check("6. ladder+stakes round-trip for every band actually reached", allOk, JSON.stringify(detail));
}

console.log("\n--- 7. THE MANDATED PROBE (validator) ---");
{
  const win = newWin();
  const res = win.sceneRiskValidate({dangerBand:"deadly", rewardBand:"rare", deathStakes:"loot-risk",
    persistentTrace:"story", telegraphs:[], escapeModes:[]});
  check("7. ok===false", res.ok === false, JSON.stringify(res));
  check("7b. errors CONTAIN deadly-untelegraphed", res.errors.indexOf("deadly-untelegraphed") >= 0, JSON.stringify(res.errors));
  check("7c. errors CONTAIN no-escape", res.errors.indexOf("no-escape") >= 0, JSON.stringify(res.errors));
}

console.log("\n--- 8. sceneRiskOf can never emit an untelegraphed deadly+ shape ---");
{
  const win = newWin();
  const walk = { environment:"wilderness", tier:1, skin:{band:"Mythic"}, segments:[mkSeg(1,{encounter:{isEnemy:false}}), mkSeg(2,{isFinale:true})] };
  const stamped = win.sceneRiskOf(walk, null);
  check("8. telegraphs.length>=1", stamped.risk.telegraphs.length >= 1, JSON.stringify(stamped.risk.telegraphs));
  check("8b. [0].minted===true", stamped.risk.telegraphs[0].minted === true, JSON.stringify(stamped.risk.telegraphs[0]));
  check("8c. [0].source===scene-risk-fallback", stamped.risk.telegraphs[0].source === "scene-risk-fallback", stamped.risk.telegraphs[0].source);
}

console.log("\n--- 9. escapeModes[0]===flee always; stealth gated by posture ---");
{
  const win = newWin();
  const u = win.rollUrbanWalk({ segCount: 4, tier: 1 });
  check("9. escapeModes[0]===flee", u.risk.escapeModes[0] === "flee", JSON.stringify(u.risk.escapeModes));

  const reactiveWalk = { environment:"urban", tier:1, posture:"Reactive", segments:[mkSeg(1)] };
  const stampedReactive = win.sceneRiskOf(reactiveWalk, null);
  check("9b. Reactive urban EXCLUDES stealth", stampedReactive.risk.escapeModes.indexOf("stealth") < 0, JSON.stringify(stampedReactive.risk.escapeModes));

  const investigativeWalk = { environment:"urban", tier:1, posture:"Investigative", segments:[mkSeg(1)] };
  const stampedInvestigative = win.sceneRiskOf(investigativeWalk, null);
  check("9c. Investigative urban INCLUDES stealth", stampedInvestigative.risk.escapeModes.indexOf("stealth") >= 0, JSON.stringify(stampedInvestigative.risk.escapeModes));
}

console.log("\n--- 10. Bargain moves with a Social segment ---");
{
  const win = newWin();
  const withSocial = { environment:"dungeon", tier:1, segments:[mkSeg(1,{encounter:{type:"Social",isEnemy:false}})] };
  const stampedSocial = win.sceneRiskOf(withSocial, null);
  check("10. includes bargain with a Social segment", stampedSocial.risk.escapeModes.indexOf("bargain") >= 0, JSON.stringify(stampedSocial.risk.escapeModes));

  const withoutSocial = { environment:"dungeon", tier:1, segments:[mkSeg(1,{encounter:{type:"Empty",isEnemy:false}})] };
  const stampedFresh = win.sceneRiskOf(withoutSocial, null);
  check("10b. bargain GONE once the segment is stripped (moved, not just labeled)", stampedFresh.risk.escapeModes.indexOf("bargain") < 0, JSON.stringify(stampedFresh.risk.escapeModes));
}

console.log("\n--- 11. Idempotency ---");
{
  const win = newWin();
  const walk = win.rollDungeonWalk({ segCount: 4, tier: 1 });
  const first = JSON.stringify(walk.risk);
  win.sceneRiskOf(walk, null);
  const second = JSON.stringify(walk.risk);
  check("11. byte-identical on a second call", first === second, JSON.stringify({first, second}));

  // a mutated-then-restamped walk WITHOUT deleting risk is untouched
  const mutated = win.sceneRiskOf(walk, null);
  walk.skin = { band: "Mythic" };
  win.sceneRiskOf(walk, null);
  check("11b. mutating fields without deleting walk.risk leaves it untouched", JSON.stringify(walk.risk) === first, JSON.stringify(walk.risk));
}

console.log("\n--- 12. Digest ---");
{
  const win = newWin();
  const world = baseWorld("w-scenerisk-" + Math.random().toString(36).slice(2));
  const originId = win.addNode(world, "Test Hold", "Setting");
  world.currentNodeId = originId; world.startNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;

  const uw = win.rollUrbanWalk({ segCount: 4, tier: 1 });
  const P = win.prepOf(world);
  P.nodes[originId] = { env: "urban", soft: false, locked: false, hook: null, walk: uw, cursor: null };
  const setRes = win.walkSetActive(world, originId);
  check("12. walkSetActive succeeds against a directly-stored walk", setRes.ok === true, JSON.stringify(setRes));

  const digest = win.activeWalkDigest(world);
  check("12b. digest.risk non-null", digest && digest.risk != null, JSON.stringify(digest && digest.risk));
  check("12c. telegraphs.length<=2", digest.risk.telegraphs.length <= 2, JSON.stringify(digest.risk.telegraphs));
  check("12d. every telegraph text <=140 chars", digest.risk.telegraphs.every(t => (t.text||"").length <= 140), JSON.stringify(digest.risk.telegraphs));
  check("12e. digest.risk deep-equals sceneRiskDigest(walk.risk)", JSON.stringify(digest.risk) === JSON.stringify(win.sceneRiskDigest(uw.risk)),
    JSON.stringify({ digest: digest.risk, recomputed: win.sceneRiskDigest(uw.risk) }));
  check("12f. rule string contains 'unwarned trap is a bug'", digest.rule.indexOf("unwarned trap is a bug") >= 0, digest.rule);
  check("12g. rule string contains the exact §4.5 concatenation seam", digest.rule.indexOf("{type:'walk_complete'}. risk is the fairness contract") >= 0, digest.rule);
}

console.log("\n--- 13. Pre-contract walk: digest null, no re-stamp ---");
{
  const win = newWin();
  const world = baseWorld("w-scenerisk-precontract-" + Math.random().toString(36).slice(2));
  const originId = win.addNode(world, "Test Hold", "Setting");
  world.currentNodeId = originId; world.startNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;

  const uw = win.rollUrbanWalk({ segCount: 4, tier: 1 });
  delete uw.risk;
  const P = win.prepOf(world);
  P.nodes[originId] = { env: "urban", soft: false, locked: false, hook: null, walk: uw, cursor: null };
  win.walkSetActive(world, originId);

  const digest = win.activeWalkDigest(world);
  check("13. digest.risk===null", digest.risk === null, JSON.stringify(digest.risk));
  check("13b. digest read does NOT re-stamp (walk.risk still undefined)", uw.risk === undefined, JSON.stringify(uw.risk));
}

console.log("\n--- 14. Validator vocab sweep ---");
{
  const win = newWin();
  const good = { dangerBand:"safe", rewardBand:"ordinary", deathStakes:"loot-risk", persistentTrace:"story", telegraphs:[], escapeModes:["flee"] };
  const cases = [
    ["dangerBand:invalid", Object.assign({}, good, { dangerBand:"lethal" })],
    ["rewardBand:invalid", Object.assign({}, good, { rewardBand:"epic" })],
    ["deathStakes:invalid", Object.assign({}, good, { deathStakes:"nope" })],
    ["persistentTrace:invalid", Object.assign({}, good, { persistentTrace:"nope" })],
    ["ladder:broken", Object.assign({}, good, { rewardBand:"legendary" })],
    ["stakes:broken", Object.assign({}, good, { deathStakes:"world-shift" })],
    ["telegraph:kind-invalid", Object.assign({}, good, { telegraphs:[{kind:"nope", text:"x"}] })],
    ["escape:invalid", Object.assign({}, good, { escapeModes:["flee","nope"] })],
    ["deadly-untelegraphed", Object.assign({}, good, { dangerBand:"deadly", rewardBand:"rare", deathStakes:"loot-risk", telegraphs:[] })],
    ["no-escape", Object.assign({}, good, { escapeModes:[] })],
  ];
  let allOk = true, bad = [];
  for(const [errName, contract] of cases){
    const res = win.sceneRiskValidate(contract);
    if(res.errors.indexOf(errName) < 0){ allOk = false; bad.push({errName, errors: res.errors}); }
  }
  check("14. every §3.9 error string reachable by a crafted bad contract", allOk, JSON.stringify(bad));

  const bardoOnly = { dangerBand:"nightmare", rewardBand:"strange", deathStakes:"bardo-only", persistentTrace:"story", telegraphs:[{kind:"sign",text:"x"}], escapeModes:["flee"] };
  const bardoRes = win.sceneRiskValidate(bardoOnly);
  check("14b. bardo-only passes stakes (reserved-value carve-out)", bardoRes.errors.indexOf("stakes:broken") < 0, JSON.stringify(bardoRes.errors));

  const missing = win.sceneRiskValidate(null);
  check("14c. null risk -> risk:missing", missing.ok === false && missing.errors[0] === "risk:missing", JSON.stringify(missing));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
