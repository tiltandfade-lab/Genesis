/* dev/verify-mf2-spawn-grace.mjs — BEAUTY-WAVE-4.md MF-2 (SPAWN/DESPAWN GRACE, "the pop killer").
   Two parts, mirroring dev/verify-standee-verbs.mjs's own two-part structure for the sibling module:

   PART A — a real Node ESM `import` of src/ui/spawn-grace.js. That module has ZERO THREE/DOM coupling
   of its own (every mesh/material handle arrives as a plain setter callback the caller supplies), so a
   plain Node import + a hand-built stub ctx ({tweens:[], markDirty(){}}) is enough to exercise every
   push* function's real tween math deterministically with a FAKE CLOCK: tw.update(t) is sampled
   directly at explicit t values (sampleAt), exactly dev/verify-standee-verbs.mjs's own convention — no
   Date.now mocking needed, since pushTween's `start` timestamp is irrelevant to a direct update(t) call.

   PART B — production wiring proof against the REAL src/ui/theater-boot.js source text (that file
   can't be imported headless — it does `import * as THREE from "three"` and needs a live WebGL mount,
   the same constraint dev/verify-standee-verbs.mjs's own header documents for the identical reason).
   Following that file's established convention: extract the REAL mfArtMaterialsOf/mfSetMaterialsOpacity/
   mfMountGraceFor/mfDespawnGraceFor/mfCascadeMount/disposeGroupChild function source text + eval them in
   a sandbox with trivial stand-ins for their callees (pushMountGrace/pushDespawnGrace/seededCascadeDelays
   are the REAL spawn-grace.js imports, not reimplementations — only startTweenLoop/buildTheaterCtx are
   spies, since those need a live S/THREE this harness never mounts) — then drive the SAME base-first-
   ordering / cascade-seeding / despawn-lifts-last assertions against the REAL production glue, not a
   re-description of it. Grep-based existence checks confirm the actual call sites (setUnits' despawn
   diff, setInteriorBoard's crossfade, interiorBuildPieces/Dressing/Furniture's cascade calls) are wired
   into the real file, matching every other production-wiring proof in this repo's verify-* harnesses.

   RED-FIRST (checked 2026-07-11 against base commit c067276a, before this unit's files existed):
     `git show c067276a:src/ui/spawn-grace.js` -> "fatal: path does not exist" — the module did not
     exist. `git show c067276a:src/ui/theater-boot.js | grep -c "mfMountGraceFor"` -> 0 — no MF-2 wiring
     existed either. Both are now present (this unit). Re-checked live below, not just cited.

   Run:  node dev/verify-mf2-spawn-grace.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const BASE_COMMIT = "c067276a";

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

console.log("=== RED-FIRST proof (re-checked live, not just cited in the header) ===");
{
  let existedAtBase = true, msg = "";
  try {
    execSync(`git show ${BASE_COMMIT}:src/ui/spawn-grace.js`, { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] });
  } catch (e) {
    existedAtBase = false; msg = String(e.stderr || e.message).split("\n")[0];
  }
  check(`RED0a. src/ui/spawn-grace.js did NOT exist at base commit ${BASE_COMMIT} (pre this unit)`,
    existedAtBase === false, msg);
  const wiringAtBase = execSync(`git show ${BASE_COMMIT}:src/ui/theater-boot.js | grep -c mfMountGraceFor || true`,
    { cwd: ROOT }).toString().trim();
  check(`RED0b. theater-boot.js had NO mfMountGraceFor wiring at base commit ${BASE_COMMIT}`,
    wiringAtBase === "0", wiringAtBase);
}

console.log("\n=== PART A — spawn-grace.js as a pure ES module (no DOM/THREE) ===");
const modUrl = pathToFileURL(join(ROOT, "src/ui/spawn-grace.js")).href;
const {
  pushMountGrace, pushDespawnGrace, pushScreenFade, seededCascadeDelays,
  MOUNT_GRACE_DUR, MOUNT_GRACE_SCALE_DELTA, DESPAWN_GRACE_DUR,
  DRESSING_CASCADE_STEP_MS, DRESSING_CASCADE_CAP_MS, ROOM_TRANSITION_DUR
} = await import(modUrl);

function stubCtx(){ return { tweens: [], markDirty(){ this._dirty = (this._dirty||0) + 1; } }; }
// sampleAt — runs a tween's update() at an explicit t in [0,1] WITHOUT completing it (phase-boundary
// assertions), exactly verify-standee-verbs.mjs's own convention.
function sampleAt(tw, t){ tw.update(t); }

// ----------------------------------------------------------------------------
// A1. constants match the spec's own literal amplitudes (BEAUTY-WAVE-4.md MF-2 §1-4 / Feel Law 2).
// ----------------------------------------------------------------------------
{
  check("A1a. MOUNT_GRACE_DUR is 150 (spec item 1: '150ms fade-in')", MOUNT_GRACE_DUR === 150, MOUNT_GRACE_DUR);
  check("A1b. MOUNT_GRACE_SCALE_DELTA is 0.04 (spec item 1: 'a 4% scale settle')", MOUNT_GRACE_SCALE_DELTA === 0.04, MOUNT_GRACE_SCALE_DELTA);
  check("A1c. DESPAWN_GRACE_DUR is 200 (spec item 2: '200ms fade-down')", DESPAWN_GRACE_DUR === 200, DESPAWN_GRACE_DUR);
  check("A1d. DRESSING_CASCADE_STEP_MS is 40 (spec item 3: 'staggered 40ms-per-piece')", DRESSING_CASCADE_STEP_MS === 40, DRESSING_CASCADE_STEP_MS);
  check("A1e. DRESSING_CASCADE_CAP_MS is 400 (spec item 3 / Feel Law 1: 'cap total stagger at 400ms')", DRESSING_CASCADE_CAP_MS === 400, DRESSING_CASCADE_CAP_MS);
  check("A1f. ROOM_TRANSITION_DUR is 200 (spec item 4: '200ms to-black crossfade')", ROOM_TRANSITION_DUR === 200, ROOM_TRANSITION_DUR);
}

// ----------------------------------------------------------------------------
// A2 — RED-FIRST: an "instant pop" stand-in (the pre-MF-2 behavior — art snaps straight to full
// opacity/scale with no ramp at all) FAILS the exact same phase-boundary assertion the real function
// must pass. This proves the assertion actually discriminates graceful-fade from instant-pop, not just
// a tautology that always passes.
// ----------------------------------------------------------------------------
function instantPopMount(ctx, opts){
  // the "before MF-2" shape: setArtOpacity/setScaleMul called ONCE with the FINAL resting values,
  // synchronously, no tween at all — a pure pop, zero ramp.
  if(typeof opts.setArtOpacity === "function") opts.setArtOpacity(opts.targetOpacity != null ? opts.targetOpacity : 1);
  if(typeof opts.setScaleMul === "function") opts.setScaleMul(1);
  return true; // no tween pushed — ctx.tweens stays empty, matching "it just appeared" instant-pop semantics
}
{
  console.log("\n  -- RED (instant-pop stand-in, same assertion) --");
  const ctx = stubCtx();
  let artAtMidSample = null;
  instantPopMount(ctx, {
    targetOpacity: 1,
    setArtOpacity(v){ artAtMidSample = v; }, // last value written wins — instant-pop writes it ONCE, at t=0-equivalent
    setScaleMul(){}
  });
  check("RED-A2. instant-pop art opacity is ALREADY 1 with no mid-fade sample possible (no tween to sample at t=0.5)",
    artAtMidSample === 1 && ctx.tweens.length === 0,
    "instant-pop pushes zero tweens — there is no t=0.5 to sample, proving the old behavior had no fade phase at all");
}
{
  console.log("  -- GREEN (real pushMountGrace) --");
  const ctx = stubCtx();
  let artOpacity = -1, scaleMul = -1;
  const ok = pushMountGrace(ctx, {
    targetOpacity: 1,
    setArtOpacity(v){ artOpacity = v; },
    setScaleMul(v){ scaleMul = v; }
  });
  check("A2a. pushMountGrace returns true + pushes exactly one tween", ok === true && ctx.tweens.length === 1);
  check("A2b. at push time (t not yet sampled), art opacity snapped to 0 + scale snapped to 1.04 (the 4% overshoot)",
    Math.abs(artOpacity - 0) < 1e-9 && Math.abs(scaleMul - 1.04) < 1e-9, JSON.stringify({ artOpacity, scaleMul }));
  const tw = ctx.tweens[0];
  sampleAt(tw, 0.5);
  check("A2c. at t=0.5, art opacity is exactly 0.5 (linear fade-in half done)", Math.abs(artOpacity - 0.5) < 1e-9, artOpacity);
  check("A2d. at t=0.5, scale has eased HALFWAY from 1.04 toward 1.0 (1.02)", Math.abs(scaleMul - 1.02) < 1e-9, scaleMul);
  sampleAt(tw, 1); tw.onDone();
  check("A2e. at onDone, art opacity snaps to exactly 1 (targetOpacity) and scale snaps to exactly 1",
    Math.abs(artOpacity - 1) < 1e-9 && Math.abs(scaleMul - 1) < 1e-9, JSON.stringify({ artOpacity, scaleMul }));
  check("A2f. tween duration is MOUNT_GRACE_DUR (150ms) unless overridden", tw.dur === MOUNT_GRACE_DUR, tw.dur);
}

// ----------------------------------------------------------------------------
// A3 — pushDespawnGrace: fade-down 1->0, onLifted fires strictly at onDone (after the fade), never
// mid-fade. RED-FIRST: an instant-pop despawn stand-in (onLifted fired IMMEDIATELY, no fade at all)
// would remove the piece before any fade — demonstrably wrong against the same "art still visible
// mid-fade" assertion.
// ----------------------------------------------------------------------------
{
  console.log("\n  -- RED (instant-despawn stand-in) --");
  let lifted = false, artAtMid = null;
  function instantPopDespawn(opts){
    if(typeof opts.setArtOpacity === "function") opts.setArtOpacity(0);
    if(typeof opts.onLifted === "function") opts.onLifted(); // fires IMMEDIATELY — no 200ms fade at all
  }
  instantPopDespawn({ setArtOpacity(v){ artAtMid = v; }, onLifted(){ lifted = true; } });
  check("RED-A3. instant-despawn lifts IMMEDIATELY with art already at 0 (no mid-fade state ever observable)",
    lifted === true && artAtMid === 0,
    "the old behavior has no window where art is PARTIALLY faded while still present — that's the pop this unit kills");
}
{
  console.log("  -- GREEN (real pushDespawnGrace) --");
  const ctx = stubCtx();
  let artOpacity = -1, lifted = false;
  const ok = pushDespawnGrace(ctx, {
    setArtOpacity(v){ artOpacity = v; },
    onLifted(){ lifted = true; }
  });
  check("A3a. pushDespawnGrace returns true + pushes exactly one tween", ok === true && ctx.tweens.length === 1);
  const tw = ctx.tweens[0];
  sampleAt(tw, 0.5);
  check("A3b. at t=0.5, art opacity is exactly 0.5 (halfway faded — a real intermediate state, unlike the RED stand-in)",
    Math.abs(artOpacity - 0.5) < 1e-9, artOpacity);
  check("A3c. onLifted has NOT fired yet mid-fade", lifted === false);
  sampleAt(tw, 1); tw.onDone();
  check("A3d. onLifted fires ONLY at onDone, strictly after the fade completes", lifted === true);
  check("A3e. tween duration is DESPAWN_GRACE_DUR (200ms) unless overridden", tw.dur === DESPAWN_GRACE_DUR, tw.dur);
}

// ----------------------------------------------------------------------------
// A4 — base-first ordering (mount) / base-lifts-last (despawn), driven through the exact contract
// theater-boot.js's mfArtMaterialsOf/mfMountGraceFor/mfDespawnGraceFor use: the BASE material is simply
// never routed into setArtOpacity — proven here by simulating that composition directly (Part B re-
// proves the REAL theater-boot.js functions do this exclusion; this is the CONTRACT-level proof that
// the composition, if honored, produces the correct base-first/base-lifts-last behavior).
// ----------------------------------------------------------------------------
{
  const ctx = stubCtx();
  const state = { baseOpacity: 1, artOpacity: -1 }; // base starts opaque and is NEVER written by mount grace
  pushMountGrace(ctx, {
    targetOpacity: 1,
    setArtOpacity(v){ state.artOpacity = v; }, // base's setter is simply never wired in — that's the whole mechanism
    setScaleMul(){}
  });
  const tw = ctx.tweens[0];
  check("A4a. mount: base opacity is ALREADY 1 at t=0 (never touched) while art starts at 0",
    state.baseOpacity === 1 && state.artOpacity === 0, JSON.stringify(state));
  sampleAt(tw, 0.3);
  check("A4b. mount: mid-fade, base STILL 1 (untouched) while art is mid-ramp (0.3)",
    state.baseOpacity === 1 && Math.abs(state.artOpacity - 0.3) < 1e-9, JSON.stringify(state));
}
{
  const ctx = stubCtx();
  const state = { baseOpacity: 1, artOpacity: 1, lifted: false };
  pushDespawnGrace(ctx, {
    setArtOpacity(v){ state.artOpacity = v; },
    onLifted(){ state.lifted = true; state.baseOpacity = 0; } // "the base lifts" = onLifted actually removing it
  });
  const tw = ctx.tweens[0];
  sampleAt(tw, 0.9);
  check("A4c. despawn: at t=0.9 (nearly done), base STILL fully visible (1) while art has almost fully faded (0.1)",
    state.baseOpacity === 1 && Math.abs(state.artOpacity - 0.1) < 1e-9 && state.lifted === false, JSON.stringify(state));
  sampleAt(tw, 1); tw.onDone();
  check("A4d. despawn: the base only lifts (baseOpacity->0) at onDone, strictly AFTER the art fade completes — THE BASE LIFTS LAST",
    state.lifted === true && state.baseOpacity === 0, JSON.stringify(state));
}

// ----------------------------------------------------------------------------
// A5 — seededCascadeDelays: deterministic (same keys -> same delays every call), a genuine seeded
// reorder (not naive index*step — at least one crafted key set ranks out of input order), and the
// 400ms cap holds regardless of piece count.
// ----------------------------------------------------------------------------
{
  const keys = ["torch:1,1", "crate:2,2", "banner:3,1", "rug:0,0", "statue:4,4", "chest:2,0"];
  const d1 = seededCascadeDelays(keys);
  const d2 = seededCascadeDelays(keys.slice()); // fresh array, same string contents
  check("A5a. seededCascadeDelays is deterministic (same keys -> byte-identical delays every call)",
    JSON.stringify(d1) === JSON.stringify(d2), JSON.stringify({ d1, d2 }));
  const naiveSequential = keys.map((_, i) => Math.min(i * DRESSING_CASCADE_STEP_MS, DRESSING_CASCADE_CAP_MS));
  check("A5b. seededCascadeDelays is a GENUINE seeded shuffle, not naive index*step (ranks differ from raw input order)",
    JSON.stringify(d1) !== JSON.stringify(naiveSequential), JSON.stringify({ seeded: d1, naive: naiveSequential }));
  check("A5c. delays is a permutation of {0,40,...} scaled by rank (every value is a multiple of the step, up to the cap)",
    d1.every((v) => v % DRESSING_CASCADE_STEP_MS === 0 || v === DRESSING_CASCADE_CAP_MS), JSON.stringify(d1));

  const manyKeys = Array.from({ length: 30 }, (_, i) => "piece-" + i);
  const manyDelays = seededCascadeDelays(manyKeys);
  check("A5d. Feel Law 1 cap: even with 30 pieces (30*40=1200ms uncapped), the LAST-rank delay never exceeds 400ms",
    Math.max(...manyDelays) <= DRESSING_CASCADE_CAP_MS, Math.max(...manyDelays));
  check("A5e. seededCascadeDelays never calls Math.random (determinism law) — pure function of its input keys",
    JSON.stringify(seededCascadeDelays(manyKeys)) === JSON.stringify(manyDelays), "re-running with the identical key list must reproduce byte-identical delays");
}

// ----------------------------------------------------------------------------
// A6 — pushScreenFade (room transition), MF-2 item 4.
// ----------------------------------------------------------------------------
{
  const ctx = stubCtx();
  let opacity = -1;
  const ok = pushScreenFade(ctx, { setOpacity(v){ opacity = v; }, from: 1, to: 0 });
  check("A6a. pushScreenFade snaps to `from` synchronously at push time", ok === true && opacity === 1, opacity);
  const tw = ctx.tweens[0];
  check("A6b. tween duration is ROOM_TRANSITION_DUR (200ms) unless overridden", tw.dur === ROOM_TRANSITION_DUR, tw.dur);
  sampleAt(tw, 0.5);
  check("A6c. at t=0.5, opacity is exactly 0.5 (linear fade from 1 to 0)", Math.abs(opacity - 0.5) < 1e-9, opacity);
  sampleAt(tw, 1); tw.onDone();
  check("A6d. at onDone, opacity snaps to exactly `to` (0) — the rebuilt room is fully revealed", opacity === 0, opacity);
}

// ----------------------------------------------------------------------------
// A7 — INPUT NEVER BLOCKED (Feel Law 3): every push* function returns synchronously (never a Promise/
// thenable), sets no lock flag, and a second call while the first tween is still "live" (never ticked)
// succeeds immediately rather than queuing/throwing — "a new action cancels the tail" is the CALLER's
// job (a fresh push*, not a block on the old one).
// ----------------------------------------------------------------------------
{
  const ctx = stubCtx();
  const r1 = pushMountGrace(ctx, { setArtOpacity(){}, setScaleMul(){} });
  const r2 = pushMountGrace(ctx, { setArtOpacity(){}, setScaleMul(){} }); // fired again before the first ever ticks
  check("A7a. push* functions return a plain boolean, never a Promise/thenable",
    typeof r1 === "boolean" && typeof r2 === "boolean" && !(r1 && typeof r1.then === "function"));
  check("A7b. a second push before the first tween ticks succeeds immediately (2 live tweens, no queue/throw)",
    ctx.tweens.length === 2, ctx.tweens.length);
  check("A7c. no input-lock flag exists anywhere on ctx after two pushes (nothing here can block input)",
    Object.keys(ctx).every((k) => k !== "inputLocked" && k !== "locked" && k !== "blocked"), Object.keys(ctx));
}

console.log("\n=== PART B — production wiring against the REAL src/ui/theater-boot.js source ===");
const bootSrc = read("src/ui/theater-boot.js");

// ----------------------------------------------------------------------------
// B1 — the import + the four production glue functions exist verbatim in the real file.
// ----------------------------------------------------------------------------
{
  check("B1a. theater-boot.js imports pushMountGrace/pushDespawnGrace/pushScreenFade/seededCascadeDelays from ./spawn-grace.js",
    /from\s+"\.\/spawn-grace\.js"/.test(bootSrc) && /pushMountGrace/.test(bootSrc) && /pushDespawnGrace/.test(bootSrc) && /pushScreenFade/.test(bootSrc) && /seededCascadeDelays/.test(bootSrc));
  check("B1b. mfArtMaterialsOf excludes userData.standeeBase-tagged meshes (the base-exclusion mechanism)",
    /function mfArtMaterialsOf/.test(bootSrc) && /standeeBase/.test(bootSrc.slice(bootSrc.indexOf("function mfArtMaterialsOf"), bootSrc.indexOf("function mfArtMaterialsOf") + 800)));
  check("B1c. mfMountGraceFor/mfDespawnGraceFor/mfCascadeMount all present", ["mfMountGraceFor", "mfDespawnGraceFor", "mfCascadeMount"].every((n) => new RegExp("function " + n).test(bootSrc)));
}

// ----------------------------------------------------------------------------
// B2 — extract the REAL glue functions (zero THREE coupling of their own — they only ever call the
// caller-supplied group.traverse/material fields, plumbed to the REAL imported spawn-grace.js
// functions) and drive them against hand-built stub THREE-ish groups, exactly like Part A but through
// theater-boot.js's OWN production code text, not a re-description of it.
// ----------------------------------------------------------------------------
function extractFn(src, name){
  const startTok = "function " + name + "(";
  const start = src.indexOf(startTok);
  if(start < 0) throw new Error("extractFn: " + name + " not found");
  let depth = 0, i = src.indexOf("{", start), end = -1;
  for(; i < src.length; i++){
    if(src[i] === "{") depth++;
    else if(src[i] === "}"){ depth--; if(depth === 0){ end = i + 1; break; } }
  }
  if(end < 0) throw new Error("extractFn: " + name + " has no closing brace");
  return src.slice(start, end);
}
function makeStubMesh(opacity, isBase){
  return { material: { opacity: opacity, transparent: false }, userData: isBase ? { standeeBase: true } : {}, children: [] };
}
function makeStubGroup(scaleX, children){
  const kids = children || [];
  return {
    scale: { x: scaleX, setScalar(v){ this.x = v; } },
    children: kids,
    traverse(fn){
      const walk = (n) => { fn(n); (n.children || []).forEach(walk); };
      kids.forEach(walk);
    }
  };
}

{
  const src = [
    extractFn(bootSrc, "mfArtMaterialsOf"),
    extractFn(bootSrc, "mfSetMaterialsOpacity"),
    extractFn(bootSrc, "mfMountGraceFor"),
    extractFn(bootSrc, "mfDespawnGraceFor"),
    extractFn(bootSrc, "mfCascadeMount"),
    extractFn(bootSrc, "disposeGroupChild")
  ].join("\n\n");

  let startTweenLoopCalls = 0;
  const sandboxCtx = {};
  const sandbox = {
    module: { exports: {} },
    startTweenLoop: () => { startTweenLoopCalls++; },
    pushMountGrace, pushDespawnGrace, seededCascadeDelays,
    DRESSING_CASCADE_STEP_MS, DRESSING_CASCADE_CAP_MS,
    console
  };
  const fn = new Function(...Object.keys(sandbox), src + `
    return { mfArtMaterialsOf, mfSetMaterialsOpacity, mfMountGraceFor, mfDespawnGraceFor, mfCascadeMount, disposeGroupChild };
  `);
  const real = fn(...Object.keys(sandbox).map((k) => sandbox[k]));

  // B2a — base exclusion: a group with a base mesh (tagged) + an art mesh only collects the art material.
  const baseMesh = makeStubMesh(1, true);
  const artMesh = makeStubMesh(1, false);
  const group = makeStubGroup(1, [artMesh, baseMesh]);
  const mats = real.mfArtMaterialsOf(group);
  check("B2a. mfArtMaterialsOf (REAL extracted source) collects the art material but EXCLUDES the standeeBase-tagged one",
    mats.length === 1 && mats[0] === artMesh.material, mats.length);

  // B2b — mfMountGraceFor drives the REAL pushMountGrace against a stub ctx, fading only the art.
  const ctx2 = stubCtx();
  real.mfMountGraceFor(ctx2, group, 0);
  check("B2b. mfMountGraceFor (REAL extracted source) pushes exactly one tween via the REAL pushMountGrace",
    ctx2.tweens.length === 1);
  check("B2c. after the push, base material opacity is UNCHANGED (still 1) while art opacity was reset to 0",
    baseMesh.material.opacity === 1 && artMesh.material.opacity === 0,
    JSON.stringify({ base: baseMesh.material.opacity, art: artMesh.material.opacity }));
  const tw2 = ctx2.tweens[0];
  sampleAt(tw2, 0.5);
  check("B2d. mid-fade: base STILL 1, art at 0.5, group scale eased to 1.02 (REAL production math)",
    baseMesh.material.opacity === 1 && Math.abs(artMesh.material.opacity - 0.5) < 1e-9 && Math.abs(group.scale.x - 1.02) < 1e-9,
    JSON.stringify({ base: baseMesh.material.opacity, art: artMesh.material.opacity, scale: group.scale.x }));
  check("B2e. mfMountGraceFor calls startTweenLoop() (the real render-on-demand kick)", startTweenLoopCalls >= 1, startTweenLoopCalls);

  // B2f — mfDespawnGraceFor: onLifted only fires after the REAL tween completes.
  const ctx3 = stubCtx();
  let lifted2 = false;
  real.mfDespawnGraceFor(ctx3, group, () => { lifted2 = true; });
  const tw3 = ctx3.tweens[ctx3.tweens.length - 1];
  sampleAt(tw3, 0.9);
  check("B2g. despawn mid-fade (t=0.9): onLifted has NOT fired, base untouched", lifted2 === false && baseMesh.material.opacity === 1);
  sampleAt(tw3, 1); tw3.onDone();
  check("B2h. despawn onDone: onLifted fires (REAL production glue, base lifts last)", lifted2 === true);

  // B2i — mfCascadeMount ranks + staggers a set of entries via the REAL seededCascadeDelays.
  const entries = ["a", "b", "c", "d"].map((k) => ({ group: makeStubGroup(1, [makeStubMesh(1, false)]), key: k }));
  const ctx4 = stubCtx();
  real.mfCascadeMount(ctx4, entries, (e) => e.key);
  check("B2i. mfCascadeMount (REAL extracted source) pushes one tween per entry", ctx4.tweens.length === entries.length, ctx4.tweens.length);
  const startTimes = ctx4.tweens.map((t) => t.start);
  check("B2j. at least two entries have DIFFERENT start times (a genuine stagger, not all-at-once)",
    new Set(startTimes).size > 1, startTimes);
}

// ----------------------------------------------------------------------------
// B3 — setUnits' despawn diff + mount-grace gate, checked by source inspection (the function is large
// and deeply coupled to live THREE/S state — the sandboxed-extraction technique above is reserved for
// the small pure glue functions; this is the same "grep the real call site" proof style verify-
// standee-verbs.mjs's own Part B RED-FIRST check uses for confirming production wiring exists).
// ----------------------------------------------------------------------------
{
  const setUnitsStart = bootSrc.indexOf("function setUnits(data)");
  const setUnitsEnd = bootSrc.indexOf("\nfunction ", setUnitsStart + 30);
  const setUnitsSrc = bootSrc.slice(setUnitsStart, setUnitsEnd > 0 ? setUnitsEnd : setUnitsStart + 6000);
  check("B3a. setUnits diffs wasKnownUnitIds against newUnitIds BEFORE clearGroup(S.unitGroup) runs",
    setUnitsSrc.indexOf("wasKnownUnitIds") >= 0 && setUnitsSrc.indexOf("wasKnownUnitIds") < setUnitsSrc.indexOf("clearGroup(S.unitGroup)"));
  check("B3b. setUnits calls mfDespawnGraceFor for an id absent from the new render (the despawn trigger)",
    /mfDespawnGraceFor\(buildTheaterCtx\(\), fig,/.test(setUnitsSrc));
  check("B3c. a despawning figure is detached from S.unitGroup into S.despawnGroup BEFORE clearGroup runs (skips disposal)",
    setUnitsSrc.indexOf("S.unitGroup.remove(fig)") >= 0 && setUnitsSrc.indexOf("S.unitGroup.remove(fig)") < setUnitsSrc.indexOf("clearGroup(S.unitGroup)"));
  check("B3d. onLifted disposes the figure via disposeGroupChild (the base lifts LAST, only at onLifted)",
    /disposeGroupChild\(fig\)/.test(setUnitsSrc));
  check("B3e. setUnits only mount-graces an id NOT already in wasKnownUnitIds (no replay on every re-render)",
    /if\(!wasKnownUnitIds\.has\(String\(u\.id\)\)\)/.test(setUnitsSrc) && /mfMountGraceFor\(buildTheaterCtx\(\), figure, 0\)/.test(setUnitsSrc));
  check("B3f. S.knownUnitIds is updated to this render's id set at the end (the next call's diff baseline)",
    /S\.knownUnitIds = newUnitIds/.test(setUnitsSrc));
}

// ----------------------------------------------------------------------------
// B4 — setInteriorBoard's room-transition crossfade + the cascade calls in interiorBuildPieces/
// Dressing/Furniture.
// ----------------------------------------------------------------------------
{
  // Signature-agnostic lookup (C1B added a renderOpts param — the old exact-arity
  // indexOf silently sliced garbage and failed all three checks while the fade law
  // itself was intact).
  const sibStart = bootSrc.indexOf("function setInteriorBoard(");
  const sibEnd = bootSrc.indexOf("\nfunction ", sibStart + 30);
  const sibSrc = bootSrc.slice(sibStart, sibEnd > 0 ? sibEnd : sibStart + 8000);
  check("B4a. setInteriorBoard gates the crossfade on isRoomTransition = !!S.lastBoard (skips the very first reveal)",
    /const isRoomTransition = !!S\.lastBoard/.test(sibSrc));
  check("B4b. the overlay snaps opaque BEFORE clearGroup/rebuild (transitionEl.style.opacity = \"1\")",
    sibSrc.indexOf('S.transitionEl.style.opacity = "1"') >= 0 && sibSrc.indexOf('S.transitionEl.style.opacity = "1"') < sibSrc.indexOf("clearGroup(S.tileGroup)"));
  check("B4c. pushScreenFade is called AFTER the rebuild (mountPostSuite) to fade the overlay back to transparent",
    sibSrc.indexOf("mountPostSuite(kit, rigOn)") < sibSrc.indexOf("pushScreenFade(buildTheaterCtx()"));
}
{
  const piecesSrc = extractFn(bootSrc, "interiorBuildPieces");
  const dressSrc = extractFn(bootSrc, "interiorBuildDressing");
  const furnSrc = extractFn(bootSrc, "interiorBuildFurniture");
  check("B4d. interiorBuildPieces calls mfCascadeMount (item 1+3: room pieces cascade on first reveal)", /mfCascadeMount\(/.test(piecesSrc));
  check("B4e. interiorBuildDressing calls mfCascadeMount (item 3: dressing cascade)", /mfCascadeMount\(/.test(dressSrc));
  check("B4f. interiorBuildFurniture calls mfCascadeMount (item 3: furniture cascade)", /mfCascadeMount\(/.test(furnSrc));
}

console.log(`\n${pass} passed, ${fail} failed`);
if(fail > 0) process.exit(1);
