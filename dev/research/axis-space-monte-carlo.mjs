#!/usr/bin/env node
/* Research harness (branch docs/spatial-compiler-research) — NOT a CI gate.

   Question: how many perceived-distinct compositions does the Guard Post eight-axis
   diversity gate (GOLDEN-SITE-SPATIAL-COMPILER-PLAN.md §7.2) actually yield?

   Gate: a pair of compositions is categorically distinct only when >= 4 of the 8 axes
   differ. Non-counting surface (footprint dims, roof pitch, props, culture, condition,
   palette) is excluded by construction here.

   Axis value counts (ASSUMED, per the research brief):
     1 route topology/profile ... 5   (straight, bend, switchback, split/merge, rock-cut)
     2 handedness / post side ... 2
     3 post-to-route relation ... 4   (overlook, abut, straddle, embed)
     4 chassis family ........... K  (swept: 3, 6, 10)
     5 earthwork signature ...... 4   (cut, fill, stepped, bridged/pinned)
     6 lookout position ......... 3
     7 retaining/yard ........... 3
     8 deployment geometry ...... 3

   Three measurements per K:
   a) EXACT pair-difference distribution (independent uniform axis draws; DP convolution)
      -> q = P(two random tuples differ on >= 4 axes); collision c = 1 - q;
      -> D_eff = 1/c, the size of the uniform pool a memoryless roller behaves like
         in birthday terms (two uniform draws from D distinct items collide w.p. 1/D).
   b) MONTE CARLO check of q over 1,000,000 seeded random pairs.
   c) GREEDY MAX-LIBRARY packing: shuffle the FULL enumeration of tuples, keep each tuple
      that differs on >= 4 axes from every kept tuple. The kept set is a maximal
      pairwise-distinct library (a lower bound on the true maximum); the mixed-alphabet
      Singleton bound (delete the 3 largest axes; product of the remaining 5) is the
      matching upper bound.

   Run:  node dev/research/axis-space-monte-carlo.mjs
   Deterministic: local mulberry32-style RNG, fixed seeds. */

const KS = [3, 6, 10];
const MC_PAIRS = 1_000_000;
const GREEDY_RESTARTS = 3;
const GATE = 4; // axes that must differ

function axesFor(K) { return [5, 2, 4, K, 4, 3, 3, 3]; }

function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* a) exact distribution of the number of differing axes between two independent
      uniform tuples: per-axis P(same)=1/v, convolved across the 8 axes. */
function exactDiffDist(axes) {
  let dist = [1];
  for (const v of axes) {
    const pSame = 1 / v;
    const next = new Array(dist.length + 1).fill(0);
    for (let j = 0; j < dist.length; j++) {
      next[j] += dist[j] * pSame;
      next[j + 1] += dist[j] * (1 - pSame);
    }
    dist = next;
  }
  return dist;
}

function diffCount(a, b) {
  let d = 0;
  for (let i = 0; i < 8; i++) if (a[i] !== b[i]) d++;
  return d;
}
function randomTuple(axes, rand) { return axes.map(v => Math.floor(rand() * v)); }

/* c) full enumeration of the tuple space */
function enumerateTuples(axes) {
  const total = axes.reduce((a, b) => a * b, 1);
  const out = new Array(total);
  for (let idx = 0; idx < total; idx++) {
    let rem = idx;
    const t = new Array(8);
    for (let i = 7; i >= 0; i--) { t[i] = rem % axes[i]; rem = Math.floor(rem / axes[i]); }
    out[idx] = t;
  }
  return out;
}
function shuffle(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function greedyLibrary(tuples, rand) {
  const order = shuffle(tuples.slice(), rand);
  const kept = [];
  outer: for (const t of order) {
    for (const k of kept) if (diffCount(t, k) < GATE) continue outer;
    kept.push(t);
  }
  return kept.length;
}
function singletonBound(axes) {
  // Deleting any d-1 = 3 coordinates must leave all library members distinct, so
  // |C| <= product of the remaining 5 alphabet sizes; tightest when the 3 largest go.
  const sorted = axes.slice().sort((a, b) => b - a);
  return sorted.slice(3).reduce((a, b) => a * b, 1);
}

console.log(`# axis-space-monte-carlo — §7.2 eight-axis gate, distinct = >=${GATE} axes differ`);
console.log(`# axes [route=5, hand=2, relation=4, chassis=K, earthwork=4, lookout=3, retaining=3, deployment=3] (ASSUMED counts)\n`);

for (const K of KS) {
  const axes = axesFor(K);
  const raw = axes.reduce((a, b) => a * b, 1);
  const dist = exactDiffDist(axes);
  const q = dist.slice(GATE).reduce((a, b) => a + b, 0);
  const c = 1 - q;
  const dEff = 1 / c;
  const meanDiff = dist.reduce((s, p, j) => s + p * j, 0);

  const mcRand = rng(0xC0FFEE ^ K);
  let mcPass = 0;
  for (let i = 0; i < MC_PAIRS; i++) {
    if (diffCount(randomTuple(axes, mcRand), randomTuple(axes, mcRand)) >= GATE) mcPass++;
  }

  const tuples = enumerateTuples(axes);
  const libs = [];
  for (let rIdx = 0; rIdx < GREEDY_RESTARTS; rIdx++) libs.push(greedyLibrary(tuples, rng(0x5EED + 97 * K + rIdx)));

  console.log(`## K=${K} chassis  (raw tuple space ${raw.toLocaleString("en-US")})`);
  console.log(`   exact  P(>= ${GATE} axes differ) q=${q.toFixed(4)}  collision c=${c.toFixed(4)}  mean differing axes=${meanDiff.toFixed(2)}`);
  console.log(`   exact  diff-count pmf 0..8: [${dist.map(p => p.toFixed(4)).join(", ")}]`);
  console.log(`   MC     q=${(mcPass / MC_PAIRS).toFixed(4)}  (${MC_PAIRS.toLocaleString("en-US")} seeded pairs)`);
  console.log(`   D_eff  (memoryless birthday-equivalent pool) = 1/c = ${dEff.toFixed(1)}`);
  console.log(`   greedy max-library over full enumeration x${GREEDY_RESTARTS} shuffles = [${libs.join(", ")}]  (lower bound on max)`);
  console.log(`   Singleton upper bound (drop 3 largest axes) = ${singletonBound(axes)}\n`);
}

console.log(`# Reading: a memoryless roller of these axes behaves, for repeat-perception purposes,`);
console.log(`# like uniform dealing from a pool of D_eff compositions. A dealer WITH anti-repeat`);
console.log(`# memory can instead bank on the max-library size: every dealt pair passes the gate.`);
