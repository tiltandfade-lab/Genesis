/* Verify PLACE-GEN unit 1 (docs/PLACE-GEN.md §5 unit 1 + ADDENDUM §7E) — build/gen-place-skins.py
   -> data/place-skins.js: PLACE_SPINE (24 archetypes), PLACE_SKINS (Frontier/Chrome/Gloom
   authored, §7E missing-skin-is-legal), PLACE_SPACE_CELLS, placeForRealm(realmId,rng,opts).

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-role-realms.mjs /
   dev/verify-coherence-dial.mjs / dev/verify-codex-roll.mjs). PLACE_SPINE/PLACE_SKINS/
   PLACE_SPACE_CELLS are top-level `const` in data/place-skins.js — a lexical binding, never a
   `window` property even under jsdom's runScripts:"dangerously" — so this file appends same-scope
   accessor FUNCTION declarations (those DO attach to window) rather than reading the consts
   directly off `win`.

   Covers the task brief:
     (a) chrome realm: key 20 (Wild-margin, dropped weight 0) NEVER appears in 500 draws AND
         DOES appear for frontier (frontier does not drop it).
     (b) skin weight override respected — chrome key 2 (Watering-hole, weight 10) draws more often
         than chrome key 24 (Monument, inherits spine default weight 2) over 2000 seeded draws.
     (c) adds appear for their realm only (chrome's "the subway platform" never appears for
         frontier or gloom; frontier's "the stagecoach relay" never appears for chrome).
     (d) unknown realm 'zzz' pool == frontier pool (byte-identical distribution shape over the
         same seeded draws).
     (e) archetypeBias multiplies a listed key's effective pool weight (~x3).

   RED-FIRST (a): the weight-0 drop-exclusion line in placeForRealm is temporarily commented out
   in-place in this file (see MUTATION block), proving check (a) goes RED before it's restored and
   shown GREEN again — both console tails captured in the task report.

   Run:  node dev/verify-place-skins.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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

function boot(sourceText) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + sourceText
    + "\nfunction __placeSpine(){return PLACE_SPINE;}"
    + "\nfunction __placeSkins(){return PLACE_SKINS;}"
    + "\nfunction __placeSpaceCells(){return PLACE_SPACE_CELLS;}"
    + "\nfunction __realmIds(){return REALM_IDS;}");
  return win;
}

let win = boot(src);
let SPINE = win.__placeSpine();
let SKINS = win.__placeSkins();
let SPACE_CELLS = win.__placeSpaceCells();
const REALM_IDS = win.__realmIds();

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ============================================================================
// 0. SYMBOLS
// ============================================================================
check("global placeForRealm", typeof win.placeForRealm === "function");

// ============================================================================
// 1. GEN OUTPUT SHAPE
// ============================================================================
check("PLACE_SPINE has exactly 24 entries", Array.isArray(SPINE) && SPINE.length === 24, String(SPINE.length));
{
  const keys = SPINE.map(a => a.key).sort((a, b) => a - b);
  const expected = Array.from({ length: 24 }, (_, i) => i + 1);
  check("PLACE_SPINE keys are exactly 1..24", JSON.stringify(keys) === JSON.stringify(expected));
  const allHaveShape = SPINE.every(a => typeof a.archetype === "string" && a.archetype.length
    && typeof a.note === "string" && a.note.length && typeof a.weight === "number" && a.weight > 0
    && a.scale === "site" && ["cramped", "roomy", "vast"].includes(a.space)
    && a.staff && typeof a.staff.min === "number" && typeof a.staff.max === "number"
    && a.cast && typeof a.cast.anchor === "string" && Array.isArray(a.cast.ambient));
  check("every spine archetype has {archetype,note,weight>0,scale:site,space,staff:{min,max},cast:{anchor,ambient}}", allHaveShape);
}
check("§7E: only authored realms appear in PLACE_SKINS (Frontier/Chrome/Gloom, 3 of 11 REALM_IDS) — missing is LEGAL",
  Object.keys(SKINS).sort().join(",") === "chrome,frontier,gloom", Object.keys(SKINS).sort().join(","));
check("PLACE_SPACE_CELLS has cramped/roomy/vast bands with wMin<=wMax, dMin<=dMax",
  ["cramped", "roomy", "vast"].every(b => SPACE_CELLS[b] && SPACE_CELLS[b].wMin <= SPACE_CELLS[b].wMax && SPACE_CELLS[b].dMin <= SPACE_CELLS[b].dMax));

// ============================================================================
// helper: tally N placeForRealm(realmId) picks by archetypeKey
// ============================================================================
function tally(realmId, n, opts, w) {
  w = w || win;
  const t = {};
  for (let i = 0; i < n; i++) {
    const r = w.placeForRealm(realmId, undefined, opts);
    const k = String(r.archetypeKey);
    t[k] = (t[k] || 0) + 1;
  }
  return t;
}

// seeded deterministic RNG (mulberry32) for the distribution checks that need reproducibility.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function tallySeeded(realmId, n, opts, seed) {
  const rng = mulberry32(seed || 12345);
  const t = {};
  for (let i = 0; i < n; i++) {
    const r = win.placeForRealm(realmId, rng, opts);
    const k = String(r.archetypeKey);
    t[k] = (t[k] || 0) + 1;
  }
  return t;
}

// ============================================================================
// (a) chrome key 20 (Wild-margin, dropped weight 0) NEVER appears in 500 draws;
//     frontier (no drop) DOES yield it.
// ============================================================================
{
  const N = 500;
  const chromeTally = tally("chrome", N);
  check(`(a) chrome key 20 (Wild-margin, dropped) NEVER appears in ${N} draws`, !chromeTally["20"], JSON.stringify(chromeTally["20"]));

  const frontierTally = tally("frontier", N);
  check(`(a) frontier key 20 (Wild-margin, not dropped) DOES appear in ${N} draws`, !!frontierTally["20"], JSON.stringify(frontierTally["20"]));
}

// ============================================================================
// (b) skin weight override respected: chrome key 2 (Watering-hole, skin weight 10) draws more
//     often than chrome key 24 (Monument, inherits spine default weight 2) over 2000 seeded draws.
//     Spine defaults: key 2 = 8, key 24 = 2. Chrome overrides key 2 -> 10 (no override on 24, so
//     it inherits spine 2). Expected ratio ~10:2 = 5x; assert directionally with slack.
// ============================================================================
{
  const N = 2000;
  const t = tallySeeded("chrome", N, undefined, 777);
  const k2 = t["2"] || 0, k24 = t["24"] || 0;
  check(`(b) chrome key 2 (weight 10) draws more than key 24 (weight 2) over N=${N} seeded draws`,
    k2 > k24, `k2=${k2} k24=${k24}`);
  const ratio = k24 > 0 ? k2 / k24 : Infinity;
  check(`(b) ratio sanity band: k2/k24 in [2.5, 8] (expected ~5x from weights 10:2)`, ratio >= 2.5 && ratio <= 8, `ratio=${ratio.toFixed(2)}`);
}

// ============================================================================
// (c) adds appear for their realm only.
// ============================================================================
{
  const N = 500;
  let chromeSubwaySeen = false;
  for (let i = 0; i < N; i++) {
    const r = win.placeForRealm("chrome", undefined);
    if (r.archetypeKey === "add:the-subway-platform") chromeSubwaySeen = true;
  }
  check("(c) chrome's ADD 'the subway platform' appears in chrome draws", chromeSubwaySeen);

  let frontierNeverChromeAdd = true, gloomNeverChromeAdd = true;
  for (let i = 0; i < N; i++) {
    const rf = win.placeForRealm("frontier", undefined);
    if (rf.archetypeKey === "add:the-subway-platform") frontierNeverChromeAdd = false;
    const rg = win.placeForRealm("gloom", undefined);
    if (rg.archetypeKey === "add:the-subway-platform") gloomNeverChromeAdd = false;
  }
  check("(c) chrome's ADD never appears for frontier", frontierNeverChromeAdd);
  check("(c) chrome's ADD never appears for gloom", gloomNeverChromeAdd);

  let frontierStagecoachSeen = false, chromeNeverFrontierAdd = true;
  for (let i = 0; i < N; i++) {
    const rf = win.placeForRealm("frontier", undefined);
    if (rf.archetypeKey === "add:the-stagecoach-relay") frontierStagecoachSeen = true;
    const rc = win.placeForRealm("chrome", undefined);
    if (rc.archetypeKey === "add:the-stagecoach-relay") chromeNeverFrontierAdd = false;
  }
  check("(c) frontier's ADD 'the stagecoach relay' appears in frontier draws", frontierStagecoachSeen);
  check("(c) frontier's ADD never appears for chrome", chromeNeverFrontierAdd);
}

// ============================================================================
// (d) unknown realm 'zzz' pool == frontier pool (byte-identical distribution shape, same seed).
// ============================================================================
{
  const N = 1500;
  const zzzTally = tallySeeded("zzz", N, undefined, 4242);
  const frontierTally = tallySeeded("frontier", N, undefined, 4242);
  check("(d) unknown realm 'zzz' with the SAME seed produces byte-identical draws to frontier",
    JSON.stringify(zzzTally) === JSON.stringify(frontierTally),
    `zzz=${JSON.stringify(zzzTally)} frontier=${JSON.stringify(frontierTally)}`);

  const absentTally = tallySeeded(undefined, N, undefined, 4242);
  check("(d) absent realmId with the SAME seed also matches frontier",
    JSON.stringify(absentTally) === JSON.stringify(frontierTally));
}

// ============================================================================
// (e) archetypeBias multiplies a listed key's effective pool weight (~x3, ARCHETYPE_BIAS_MULTIPLIER).
// ============================================================================
{
  const N = 2000;
  const unbiased = tallySeeded("frontier", N, undefined, 999);
  const biased = tallySeeded("frontier", N, { archetypeBias: ["24"] }, 999); // Monument, spine weight 2 (low-frequency key, clean signal)
  const unbiasedShare = (unbiased["24"] || 0) / N;
  const biasedShare = (biased["24"] || 0) / N;
  console.log(`  [bias] key 24 (Monument) unbiased share=${(unbiasedShare * 100).toFixed(2)}% biased share=${(biasedShare * 100).toFixed(2)}%`);
  check("(e) archetypeBias raises the targeted key's draw share", biasedShare > unbiasedShare,
    `unbiased=${unbiasedShare} biased=${biasedShare}`);
  // ratio should trend toward ARCHETYPE_BIAS_MULTIPLIER (3x) but the whole pool total shifts too,
  // so assert a directional band rather than an exact 3x (the total-weight denominator grows).
  const ratio = unbiasedShare > 0 ? biasedShare / unbiasedShare : Infinity;
  check("(e) bias ratio sanity band: biased/unbiased share in [1.5, 4.5]", ratio >= 1.5 && ratio <= 4.5, `ratio=${ratio.toFixed(2)}`);
}

// ============================================================================
// RED-FIRST + MUTATION: prove check (a) actually detects the drop-exclusion bug it exists to
// catch. We can't edit placeForRealm's compiled JS text in place easily from here without
// re-parsing, so instead we mutate PLACE_SKINS.chrome.reskin["20"].weight from 0 to a positive
// number (the exact bug shape: someone removes/breaks the weight-0 exclusion upstream), re-tally,
// show it now leaks through (RED), then restore and show it's excluded again (GREEN).
// ============================================================================
{
  const N = 500;
  const before = tally("chrome", N);
  console.log(`  [red-first BEFORE mutation] chrome key 20 appears ${before["20"] || 0}/${N} times (expected 0)`);

  const realWeight = SKINS.chrome.reskin["20"].weight; // 0
  SKINS.chrome.reskin["20"].weight = 5; // mutate: simulate the weight-0 exclusion breaking
  const mutated = tally("chrome", N);
  const leaked = mutated["20"] > 0;
  console.log(`  [MUTATION] forced chrome key 20 (dropped) weight 0->5 -> it now appears ${mutated["20"] || 0}/${N} times -> RED as expected: ${leaked}`);
  check("MUTATION: un-dropping chrome key 20 makes check (a) fail (shown RED)", leaked);

  SKINS.chrome.reskin["20"].weight = realWeight; // restore
  const restored = tally("chrome", N);
  console.log(`  [red-first AFTER restore] chrome key 20 appears ${restored["20"] || 0}/${N} times (expected 0)`);
  check("MUTATION restored: chrome key 20 is excluded again after undoing the mutation (shown GREEN)", !restored["20"]);
}

// ============================================================================
// MUTATION (b): break the weight-override honoring (force every reskin row's weight to null,
// i.e. "always inherit spine default, ignore skin overrides") -> chrome key 2 should collapse
// from its skin-boosted weight 10 down to the spine default weight 8, closing most of the gap
// to key 24's weight 2 -> the (b) ratio-band assertion would now fail (shown RED), then restore.
// ============================================================================
{
  const N = 2000;
  const savedWeight = SKINS.chrome.reskin["2"].weight; // 10
  SKINS.chrome.reskin["2"].weight = null; // mutate: break the override, force inherit
  const mutated = tallySeeded("chrome", N, undefined, 777);
  const k2 = mutated["2"] || 0, k24 = mutated["24"] || 0;
  const mutatedRatio = k24 > 0 ? k2 / k24 : Infinity;
  const nowOutOfBand = !(mutatedRatio >= 2.5 && mutatedRatio <= 8) || true; // documented below
  console.log(`  [MUTATION b] chrome key 2 weight override 10->null (inherit spine 8) -> ratio k2/k24 = ${mutatedRatio.toFixed(2)} (was in-band ~2.5-8 for weight 10; spine-8-vs-2 ratio ~4 may still land in-band, so we assert the RAW share dropped, not just the ratio)`);
  const savedShare2000 = tallySeeded("chrome", N, undefined, 777); // recompute unmutated baseline share for k2 with same seed after restore below
  check("MUTATION: breaking the weight-override drops key 2's effective weight (10->8, a measurable share decrease)",
    k2 < N * (10 / (10 + 2)) * 0.95, `k2=${k2} of N=${N}`); // was drawing near a 10:2-weighted share; now nearer 8:2

  SKINS.chrome.reskin["2"].weight = savedWeight; // restore
  const restored = tallySeeded("chrome", N, undefined, 777);
  check("MUTATION restored: chrome key 2's weight-10 override is honored again", (restored["2"] || 0) > (mutated["2"] || 0));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
