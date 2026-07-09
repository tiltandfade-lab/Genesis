/* Verify ANIMAL-SOCIAL §6 U1 (docs/ANIMAL-SOCIAL.md) — wild-animal-kind table + ANIMAL_ENV_WEIGHTS
   weighted pools + rollPartial('animal', {env}) table/weight selection.

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-role-realms.mjs /
   dev/verify-codex-roll.mjs). Run:  node dev/verify-animal-social-u1.mjs
   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md)

   Accept criteria (spec §6 U1):
     1. rollTable('wild-animal-kind') returns rows.
     2. rollPartial('animal', {env:'wilderness'}) draws from the wild table.
     3. rollPartial('animal', {env:'city'}) over 200 trials never yields herd/working-beast rows
        more than the weights allow.
   Red-first: assert the env option changes the draw distribution — must FAIL today (before the
   fix) because rollPartial currently ignores opts.env entirely and always rolls 'animal-kind'. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

function boot() {
  const man = JSON.parse(read("manifest.json"));
  const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src
    + "\nfunction __animalEnvWeights(){return ANIMAL_ENV_WEIGHTS;}");
  return win;
}

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

console.log("=== RED-FIRST: env option currently ignored ===");
{
  const win = boot();
  check("wild-animal-kind is compiled", !!win.eval("(window.GENESIS_TABLES||{})['wild-animal-kind']"));
  check("rollTable('wild-animal-kind') returns rows", (() => {
    const r = win.eval("rollTable('wild-animal-kind')");
    return r && typeof r.text === "string" && r.text.length > 0;
  })());

  // The pre-fix claim: rollPartial('animal',{env}) draws the SAME table regardless of env.
  // Prove it by sampling animalKind text under env:'wilderness' vs env:'city' and checking the
  // wild-only marker text ("Territory wolf") NEVER appears under EITHER env pre-fix (since
  // rollPartial doesn't know about wild-animal-kind at all yet).
  const N = 60;
  win.eval(`var __redSamples = [];
    for (var i=0;i<${N};i++){ __redSamples.push(rollPartial('animal',{env:'wilderness'}).fields.animalKind); }
    __redSamples;`);
  const samples = win.eval("__redSamples");
  const sawWildMarker = samples.some((s) => /Territory wolf|pack-runner/.test(s || ""));
  // Informational only (not scored in pass/fail) — this line's truth value flips once the fix
  // lands, by design: it's the red-first evidence, captured once and pasted into the report, not
  // a standing regression gate (the GREEN section below is the standing gate for that behavior).
  console.log(`  ${sawWildMarker ? "(fix already landed — wild marker DID leak into wilderness draws, as expected post-fix)" : "(RED confirmed — env:'wilderness' does NOT yet draw from wild-animal-kind)"}`);
}

console.log("\n=== GREEN: post-fix behavior ===");
{
  const win = boot();

  check("rollTable('wild-animal-kind') returns rows", (() => {
    const r = win.eval("rollTable('wild-animal-kind')");
    return r && typeof r.text === "string" && r.text.length > 0;
  })());

  check("ANIMAL_ENV_WEIGHTS is defined with 5 bands", (() => {
    // ANIMAL_ENV_WEIGHTS is a top-level `const` — a lexical binding, never a `window` property
    // under jsdom's runScripts:"dangerously" (same gotcha dev/verify-role-realms.mjs documents),
    // so read it via a same-scope accessor function (attached in boot(), DOES attach to window).
    const w = win.__animalEnvWeights();
    return w && ["wilderness", "rural", "village", "city", "dungeon"].every((b) => Array.isArray(w[b]));
  })());

  // wilderness draws from wild-animal-kind: over N trials, every draw's fields.animalKind text
  // matches one of the wild table's row texts (never a domestic-only row like "Loyal dog").
  const N1 = 150;
  win.eval(`var __wildSamples = [];
    for (var i=0;i<${N1};i++){ __wildSamples.push(rollPartial('animal',{env:'wilderness'}).fields.animalKind); }
    __wildSamples;`);
  const wildSamples = win.eval("__wildSamples");
  const domesticOnlyMarker = /Loyal dog|Barn cat|Vermin-catcher/;
  check("rollPartial('animal',{env:'wilderness'}) draws from wild table over 150 trials",
    wildSamples.every((s) => !domesticOnlyMarker.test(s || "")),
    "a domestic-only row leaked into wilderness draws");
  check("wilderness draws show at least one wild-only marker (sanity, not vacuous)",
    wildSamples.some((s) => /Territory wolf|Grazing herd|Watcher-bird|Ambush predator|elder of the wood/.test(s || "")));

  // city: over 200 trials, herd + working-beast rows (animal-kind rows 2 & 6) must be rare —
  // the weight vector must suppress them well below an unweighted 2/12 ≈ 16.7% baseline.
  const N2 = 200;
  win.eval(`var __citySamples = [];
    for (var i=0;i<${N2};i++){ __citySamples.push(rollPartial('animal',{env:'city'}).fields.animalKind); }
    __citySamples;`);
  const citySamples = win.eval("__citySamples");
  const herdOrWorking = /Working beast|Herd animal/;
  const overshootCount = citySamples.filter((s) => herdOrWorking.test(s || "")).length;
  const overshootRate = overshootCount / N2;
  check(`rollPartial('animal',{env:'city'}) over ${N2} trials: herd/working-beast rate ${(overshootRate*100).toFixed(1)}% stays well under unweighted baseline (~16.7%)`,
    overshootRate < 0.10, `got ${overshootCount}/${N2} = ${(overshootRate*100).toFixed(1)}%`);

  // city should never draw from the wild-only table either.
  check("city draws never carry a wild-only marker",
    citySamples.every((s) => !/Territory wolf|elder of the wood/.test(s || "")));

  // rural/village should still be reachable (non-degenerate weight vectors).
  win.eval(`var __ruralSamples = [];
    for (var i=0;i<80;i++){ __ruralSamples.push(rollPartial('animal',{env:'rural'}).fields.animalKind); }
    __ruralSamples;`);
  const ruralSamples = win.eval("__ruralSamples");
  check("rural draws include herd/working-beast at a non-trivial rate (weights favor them there)",
    ruralSamples.filter((s) => herdOrWorking.test(s || "")).length / 80 > 0.20);

  // no-env call still works (back-compat / other callers unaffected) — falls back to unweighted
  // flat animal-kind, same as today.
  check("rollPartial('animal') with no opts still returns a valid animal partial",
    (() => { const p = win.eval("rollPartial('animal')"); return p && p.partialKind === "animal" && !!p.fields.animalKind; })());
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
