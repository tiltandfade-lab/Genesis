#!/usr/bin/env node
/* Research harness (branch docs/spatial-compiler-research) — NOT a CI gate.

   Question: how often does a rolled walk demand a NEW materialized site, by host family?
   Method: load the production rollers + vignette observatory exactly the way
   dev/verify-vignette-observatory.mjs does (classic-script scope via new Function; no jsdom),
   roll N walks per environment under isolated audit RNG, feed each through
   vignetteRequestFromWalk, and count materializationIntent.disposition, bucketing
   MATERIALIZE_NEW by hostProgram.owner.

   Then convert the measured per-walk rates into campaign-scale need:
   for campaigns of 50/200/500 walks, expected encounters per family, and the number of
   perceived-distinct compositions D a memoryless generator needs so the probability of a
   player seeing the same categorical composition twice stays under 25% / 50%.
   The repeat probability marginalizes the birthday problem over the Binomial(L, rate)
   encounter count:  P(repeat) = 1 - sum_m Bin(L,rate)(m) * prod_{i<m}(1 - i/D).

   Run:  node dev/research/measure-site-demand.mjs [walksPerEnvironment=2000]
   Deterministic: named audit seeds; no Math.random leakage (vignetteWithAuditRandom). */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const exportsList = [
  "vignetteSeedFrom", "vignetteWithAuditRandom", "vignetteRequestFromWalk",
  "rollUrbanWalk", "rollDungeonWalk", "rollWildernessWalk"
];
const factory = new Function("window", [
  read("tables.js"),
  read("src/engine/walk.js"),
  read("src/engine/dungeon-walk.js"),
  read("src/engine/wild-walk.js"),
  read("src/engine/vignette-observatory.js"),
  `return {${exportsList.join(",")}};`
].join("\n;\n"));
const A = factory({});

const N = Math.max(100, Number(process.argv[2]) || 2000);
const ENVS = ["urban", "dungeon", "wilderness"];
const ROLLERS = {
  urban: (tier) => A.rollUrbanWalk({ segCount: 4, tier }),      // roller default segCount
  dungeon: (tier) => A.rollDungeonWalk({ segCount: 3, tier }),  // roller default segCount
  wilderness: (tier) => A.rollWildernessWalk({ legCount: 4, tier }) // roller default legCount
};

const perEnv = {};
for (const env of ENVS) {
  const stats = { n: N, dispositions: {}, newOwners: {}, decorateOwners: {}, unresolvedReasons: {}, ownerExamples: {} };
  for (let i = 0; i < N; i++) {
    const tier = (i % 2) + 1; // 50/50 tier mix (ASSUMED campaign mix)
    const seed = A.vignetteSeedFrom(["site-demand-v1", env, "t" + tier, i]);
    const walk = A.vignetteWithAuditRandom(seed, () => ROLLERS[env](tier));
    const id = `site-demand:${env}:${i}`;
    const req = A.vignetteRequestFromWalk(walk, { requestId: id, sourceRef: id, rootSeed: "site-demand-v1" });
    const disp = req.materializationIntent.disposition;
    stats.dispositions[disp] = (stats.dispositions[disp] || 0) + 1;
    const owner = req.hostProgram.owner || "(none)";
    if (disp === "MATERIALIZE_NEW") {
      stats.newOwners[owner] = (stats.newOwners[owner] || 0) + 1;
      if (!stats.ownerExamples[owner]) stats.ownerExamples[owner] = String(req.hostProgram.programRef || "").slice(0, 64);
    } else if (disp === "DECORATE_LOCAL") {
      stats.decorateOwners[owner] = (stats.decorateOwners[owner] || 0) + 1;
    } else if (disp === "UNRESOLVED") {
      const r = ((req.observatory && req.observatory.unresolvedReasons) || []).join("+") || "(none)";
      stats.unresolvedReasons[r] = (stats.unresolvedReasons[r] || 0) + 1;
    }
  }
  perEnv[env] = stats;
}

/* ---------- reporting ---------- */
const pct = (k, n) => (100 * k / n).toFixed(2) + "%";
console.log(`# measure-site-demand — ${N} walks per environment (${N * 3} total), tiers 1/2 alternating`);
console.log(`# seeds: vignetteSeedFrom(["site-demand-v1", env, "t"+tier, i]); adapter=vignette-observatory/1\n`);

for (const env of ENVS) {
  const s = perEnv[env];
  console.log(`## ${env} (n=${s.n})`);
  console.log(`   dispositions: ${Object.entries(s.dispositions).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}=${v} (${pct(v, s.n)})`).join("  ")}`);
  const owners = Object.entries(s.newOwners).sort((a, b) => b[1] - a[1]);
  for (const [owner, count] of owners) {
    console.log(`   MATERIALIZE_NEW ${owner.padEnd(32)} ${String(count).padStart(5)}  ${pct(count, s.n).padStart(7)}  e.g. ${s.ownerExamples[owner]}`);
  }
  const dec = Object.entries(s.decorateOwners).sort((a, b) => b[1] - a[1]);
  if (dec.length) console.log(`   DECORATE_LOCAL: ${dec.map(([k, v]) => `${k}=${v} (${pct(v, s.n)})`).join("  ")}`);
  const unr = Object.entries(s.unresolvedReasons).sort((a, b) => b[1] - a[1]);
  if (unr.length) console.log(`   UNRESOLVED reasons: ${unr.map(([k, v]) => `${k}=${v}`).join("  ")}`);
  console.log("");
}

/* Blended per-walk rate per owner under an ASSUMED uniform environment mix (1/3 urban,
   1/3 dungeon, 1/3 wilderness). Per-environment rates are printed above for re-blending. */
const blended = {};
for (const env of ENVS) {
  for (const [owner, count] of Object.entries(perEnv[env].newOwners)) {
    blended[owner] = (blended[owner] || 0) + (count / perEnv[env].n) / ENVS.length;
  }
}
const blendedSorted = Object.entries(blended).sort((a, b) => b[1] - a[1]);
console.log(`## blended MATERIALIZE_NEW rate per walk (uniform 1/3 environment mix — ASSUMED)`);
let totalRate = 0;
for (const [owner, rate] of blendedSorted) { totalRate += rate; console.log(`   ${owner.padEnd(32)} ${(100 * rate).toFixed(2)}% per walk`); }
console.log(`   ${"ANY site family".padEnd(32)} ${(100 * totalRate).toFixed(2)}% per walk\n`);

/* ---------- campaign math ---------- */
/* Binomial pmf over encounter count m for L walks at per-walk rate r. */
function binomialPmf(L, r) {
  const pmf = new Array(L + 1).fill(0);
  if (r <= 0) { pmf[0] = 1; return pmf; }
  if (r >= 1) { pmf[L] = 1; return pmf; }
  let p = Math.pow(1 - r, L);
  pmf[0] = p;
  const ratio = r / (1 - r);
  for (let m = 1; m <= L; m++) { p = p * ((L - m + 1) / m) * ratio; pmf[m] = p; }
  return pmf;
}
/* P(no categorical repeat | m encounters, pool of D equally likely compositions). */
function noRepeatGivenM(m, D) {
  if (m > D) return 0;
  let prod = 1;
  for (let i = 1; i < m; i++) prod *= 1 - i / D;
  return prod;
}
function repeatProb(L, r, D) {
  const pmf = binomialPmf(L, r);
  let ok = 0;
  for (let m = 0; m <= L; m++) { if (pmf[m] < 1e-16) continue; ok += pmf[m] * noRepeatGivenM(m, D); }
  return 1 - ok;
}
/* Smallest D with P(repeat) <= p. */
function neededD(L, r, p) {
  if (repeatProb(L, r, 1) <= p) return 1;
  let hi = 2;
  while (repeatProb(L, r, hi) > p) { hi *= 2; if (hi > 1e7) return Infinity; }
  let lo = Math.floor(hi / 2);
  while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (repeatProb(L, r, mid) <= p) hi = mid; else lo = mid + 1; }
  return lo;
}

const CAMPAIGNS = [50, 200, 500];
const TOLERANCES = [0.25, 0.5];
console.log(`## needed perceived-distinct compositions D per family (memoryless uniform dealing)`);
console.log(`## exact birthday marginalized over Binomial(L, rate) encounter counts;`);
console.log(`## closed-form check: D ≈ m(m-1) / (2·ln(1/(1-p))) at m = L·rate\n`);
console.log(`   ${"family".padEnd(32)} ${"rate/walk".padStart(9)} | ${CAMPAIGNS.map(L => `L=${L}: m, D@25%, D@50%`.padStart(24)).join(" | ")}`);
for (const [owner, rate] of blendedSorted) {
  const cells = CAMPAIGNS.map(L => {
    const m = L * rate;
    const d25 = neededD(L, rate, TOLERANCES[0]);
    const d50 = neededD(L, rate, TOLERANCES[1]);
    return `${m.toFixed(1)}, ${d25}, ${d50}`.padStart(24);
  });
  console.log(`   ${owner.padEnd(32)} ${(100 * rate).toFixed(2).padStart(8)}% | ${cells.join(" | ")}`);
}
{
  const cells = CAMPAIGNS.map(L => {
    const m = L * totalRate;
    return `${m.toFixed(1)}, ${neededD(L, totalRate, 0.25)}, ${neededD(L, totalRate, 0.5)}`.padStart(24);
  });
  console.log(`   ${"ANY family (pooled)".padEnd(32)} ${(100 * totalRate).toFixed(2).padStart(8)}% | ${cells.join(" | ")}`);
}
console.log(`\n# NOTE: fresh walks only (no persistence layer in this harness), so every demand is a`);
console.log(`# first-visit MATERIALIZE_NEW — campaign returns (CONTINUE_EXISTING) would lower these`);
console.log(`# rates; treat them as upper bounds on new-site demand.`);
console.log(`# NOTE: a dealer with anti-repeat memory (rejects compositions that fail the diversity`);
console.log(`# gate against already-dealt sites of the family) needs only D ≥ m — linear, not quadratic.`);
