// CI-ONLY seeded RNG shim — makes Math.random deterministic for the verify-*.mjs test harnesses.
//
// WHY: ~10 harnesses (coherence-dial, elev1-elevation, breach, regions, role-realms, spice-raise,
// touched-npcs, presence-hooks, place-skins, place-distribution) sample N rolls and assert the
// outcome distribution is within a tight tolerance. On unseeded Math.random each run draws a fresh
// sample and ~2-3% of the time a category lands outside tolerance BY CHANCE — a false failure. With
// ~10 such tests, CI trips ~20-30% of runs for no real reason. A fixed seed makes each test draw the
// SAME sample every run → reproducible, no random false-alarms. Regression power is preserved: if a
// curve table actually changes, the fixed-seed sample shifts out of tolerance and the test still fails.
//
// THIS NEVER TOUCHES THE GAME. It is loaded ONLY by Node in CI via
//   NODE_OPTIONS=--require ./dev/ci-seed-rng.cjs   (see .github/workflows/ci.yml)
// The game runs in a browser (genesis.html) — browsers don't read NODE_OPTIONS and can't load a Node
// require-hook, and no game/engine module imports this file. In play, Math.random is real entropy.
//
// Set GENESIS_TEST_SEED=<int> to sweep seeds. Default chosen so the full suite passes deterministically.
"use strict";
const seed = (process.env.GENESIS_TEST_SEED ? parseInt(process.env.GENESIS_TEST_SEED, 10) : 0x6c0ffee) >>> 0;
let a = seed >>> 0;
// mulberry32 — small, fast, well-distributed deterministic PRNG.
Math.random = function () {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
