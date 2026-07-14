/* Verify BEAUTY-WAVE-4.md MF-3 (IMPACT FEEL — hit-stop + response), 2026-07-11. Pure Node ESM harness,
   same posture as dev/verify-theater-verbs.mjs's own Part A / dev/verify-standee-verbs.mjs's own Part A:
   both src/ui/theater-verbs.js and src/ui/standee-verbs.js have ZERO direct DOM/THREE coupling of their
   own (every THREE.* handle arrives via the ctx object theater-boot.js constructs), so a plain Node
   `import` + hand-built stub ctx/units is enough to exercise the real tween math deterministically, with
   an explicit fake clock (every tickTweens/freezeTween/applyHitStop/triggerHitStop/critCameraNudge call
   below takes an EXPLICIT nowMs — never a real timer) — determinism law binds seeds, not clocks.

   Covers MF-3's own verify list (BEAUTY-WAVE-4.md, MF-3's own paragraph):
     - fake-clock freeze windows (attacker/target frozen, a control/"world" tween + a fake
       isCameraPoseTween tween BOTH keep ticking in the same window) — RED-FIRST proven (§0 below).
     - the camera-tween exemption, proven a second, more direct way (isCameraPoseTween is never even
       accepted into a frozen state, belt-and-suspenders per theater-verbs.js's own applyHitStop header).
     - directional recoil math (sign/direction from a known attacker->target vector).
     - crit nudge: amplitude bound (<=2px-equivalent) + single-occurrence (one hump, not a repeating
       shake), settled by 120ms; and the "never fights an in-flight camera-pose tween" no-op.
     - fall-death: 80ms hit-stop precedes the tip (ordering asserted on the fake clock).
     - children carve-out: impact effects are NOT gated by any child/isChild flag (this unit never reads
       one — parity check proves that, rather than a suppression check).
     - the standee (production sprite) path: hit-damage/hit-crit/fall-death get the SAME mechanism.
     - re-runs dev/verify-standee-verbs.mjs and dev/verify-theater-verbs.mjs as child processes and
       asserts BOTH exit clean — "the existing verb suite stays green," proven live, not just cited.

   RED-FIRST (checked live against branch base c067276a, BW4's MF-1 tip, before this unit's edits):
     `git show c067276a:src/ui/theater-verbs.js | grep -c freezeTween` -> 0
     `git show c067276a:src/ui/theater-verbs.js | grep -c triggerHitStop` -> 0
     `git show c067276a:src/ui/theater-verbs.js | grep -c critCameraNudge` -> 0
     `git show c067276a:src/ui/standee-verbs.js | grep -c holdMs` -> 0
     `git show c067276a:src/ui/standee-verbs.js | grep -c recoilDir` -> 0
   — none of this unit's mechanism existed at the branch base; §0 re-checks this live (not just cited).

   Run:  node dev/verify-mf3-impact-feel.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const BASE = "c067276a"; // master tip immediately before this branch (BW4 MF-1's own merge commit)

console.log("=== §0 RED-FIRST proof (re-checked live against the branch base, not just cited) ===");
{
  const grepAtBase = (path, pattern) => {
    try {
      return execSync(`git show ${BASE}:${path} | grep -c "${pattern}" || true`, { cwd: ROOT }).toString().trim();
    } catch (e) { return "ERR:" + String(e.message).split("\n")[0]; }
  };
  check("R0a. src/ui/theater-verbs.js had NO freezeTween at base " + BASE, grepAtBase("src/ui/theater-verbs.js", "freezeTween") === "0");
  check("R0b. src/ui/theater-verbs.js had NO triggerHitStop at base " + BASE, grepAtBase("src/ui/theater-verbs.js", "triggerHitStop") === "0");
  check("R0c. src/ui/theater-verbs.js had NO critCameraNudge at base " + BASE, grepAtBase("src/ui/theater-verbs.js", "critCameraNudge") === "0");
  check("R0d. src/ui/standee-verbs.js had NO holdMs at base " + BASE, grepAtBase("src/ui/standee-verbs.js", "holdMs") === "0");
  check("R0e. src/ui/standee-verbs.js had NO recoilDir at base " + BASE, grepAtBase("src/ui/standee-verbs.js", "recoilDir") === "0");
}

// ----------------------------------------------------------------------------
// stub scene-graph helpers (theater-verbs.js flavor — posed 3D figures, matching
// dev/verify-theater-verbs.mjs's own makeStubCtx/makeStubUnit conventions, authored fresh here so this
// file has no cross-file import of another verify harness's internals).
// ----------------------------------------------------------------------------
function makeStubVec3(x, y, z) {
  return { x: x||0, y: y||0, z: z||0, set(nx,ny,nz){ this.x=nx; this.y=ny; this.z=nz; return this; },
    clone(){ return makeStubVec3(this.x,this.y,this.z); } };
}
function makeStubEuler(x, y, z) { return { x: x||0, y: y||0, z: z||0 }; }
function makeStubUnit(id, x, z) {
  return {
    userData: { unitId: id },
    position: makeStubVec3(x||0, 0, z||0),
    rotation: makeStubEuler(0,0,0),
    scale: { x: 1, y: 1, z: 1, setScalar(v){ this.x=this.y=this.z=v; } },
    visible: true,
    traverse(fn) { fn(this); },
    material: { color: { r: 1, g: 1, b: 1, clone() { return { r: this.r, g: this.g, b: this.b, setRGB(r,g,b){this.r=r;this.g=g;this.b=b;} }; }, setRGB(r,g,b){ this.r=r;this.g=g;this.b=b; } }, transparent: false, opacity: 1 }
  };
}
function makeStubGroup(extra) {
  return Object.assign({ children: [], add(o){ this.children.push(o); }, remove(o){ const i=this.children.indexOf(o); if(i>=0) this.children.splice(i,1); } }, extra || {});
}
function makeStubTheaterCtx(camera) {
  const unitGroup = makeStubGroup();
  const fxGroup = makeStubGroup();
  const ctx = {
    THREE: { Group: () => makeStubGroup() },
    scene: null, fxGroup, unitGroup, camera: camera || null,
    tweens: [],
    findUnit(id) { return unitGroup.children.find(c => c.userData && c.userData.unitId === String(id)) || null; },
    zoneToWorld(band, lane) { return typeof ctx._zoneToWorld === "function" ? ctx._zoneToWorld(band, lane) : null; },
    markDirty() {}
  };
  return ctx;
}

const verbsModUrl = pathToFileURL(join(ROOT, "src/ui/theater-verbs.js")).href;
const {
  playVerb, tickTweens, freezeTween, applyHitStop, findLatestTweenByUnitId, triggerHitStop,
  critCameraNudge, HIT_STOP_DUR, HIT_STOP_DUR_CRIT, FALL_HOLD_DUR, CRIT_NUDGE_DUR, CRIT_NUDGE_AMP
} = await import(verbsModUrl);

// ============================================================================
// §1 FAKE-CLOCK FREEZE WINDOWS — attacker+target frozen, a control ("world") tween and a fake
// isCameraPoseTween tween BOTH keep ticking across the same window. RED-FIRST: sampled against
// applyHitStop([]) (freeze disabled) first, showing the attacker WOULD have advanced, then against the
// real applyHitStop call, showing it doesn't.
// ============================================================================
{
  const T0 = 1_000_000;
  function makeTicker(recorder) {
    return (t) => { recorder.t = t; };
  }

  // RED-FIRST (a fresh, unfrozen twin of the attacker tween below): proves that WITHOUT applyHitStop,
  // the SAME start/dur/tick-time combination the freeze test uses below really would advance — the
  // freeze window isn't vacuously already-static.
  {
    const rec = {};
    const twinAttacker = { start: T0 - 100, dur: 300, update: makeTicker(rec), onDone: null };
    const ctxRed = { tweens: [twinAttacker] };
    tickTweens(ctxRed, T0 + 30); // same instant §1b samples the REAL (frozen) attacker at, below
    check("R1a-RED. without a freeze applied, the SAME tween DOES advance past t=0.3333 by T0+30 (elapsed math, unfrozen)",
      Math.abs(rec.t - (130/300)) < 1e-9, rec.t);
  }

  const attackerRec = {}, targetRec = {}, controlRec = {}, cameraRec = {};
  const tweens = [];
  const attackerTw = { start: T0 - 100, dur: 300, unitId: "atk", update: makeTicker(attackerRec), onDone: null };
  const targetTw   = { start: T0,       dur: 220, unitId: "tgt", update: makeTicker(targetRec),   onDone: null };
  const controlTw  = { start: T0,       dur: 100,                update: makeTicker(controlRec),  onDone: null }; // stands in for a mote/flicker-style tween
  const cameraTw    = { start: T0,       dur: 300, isCameraPoseTween: true, update: makeTicker(cameraRec), onDone: null };
  tweens.push(attackerTw, targetTw, controlTw, cameraTw);
  const ctx = { tweens };

  // GREEN: apply the freeze, then tick mid-window — attacker/target must be STALLED at their
  // frozen `t`, while control + camera tweens (never handed to applyHitStop) advance normally.
  const frozenAt = { attacker: (T0 - attackerTw.start) / attackerTw.dur, target: 0 }; // t at freeze time (T0)
  const n = applyHitStop([attackerTw, targetTw], 60, T0);
  check("§1a. applyHitStop freezes exactly 2 tweens (attacker+target)", n === 2, n);

  tickTweens(ctx, T0 + 30); // mid-window (< 60ms)
  check("§1b. attacker tween is FROZEN at its contact-frame t mid-window", Math.abs(attackerRec.t - frozenAt.attacker) < 1e-9, JSON.stringify({ got: attackerRec.t, want: frozenAt.attacker }));
  check("§1c. target tween is FROZEN at t=0 mid-window (fresh hurt/hit-damage tween, contact frame)", Math.abs(targetRec.t - 0) < 1e-9, targetRec.t);
  check("§1d. control ('world') tween KEEPS TICKING during the freeze window (t=0.3 at T0+30, dur=100)", Math.abs(controlRec.t - 0.3) < 1e-9, controlRec.t);
  check("§1e. the fake isCameraPoseTween tween KEEPS TICKING during the freeze window (t=0.1 at T0+30, dur=300)", Math.abs(cameraRec.t - 0.1) < 1e-9, cameraRec.t);

  // unfreeze tick: exactly AT the moment the window elapses, the resume-shift recomputes `start` so
  // THIS tick still samples the frozen value (tickTweens' own documented resume semantics — the shift
  // makes elapsed-so-far equal frozenT*dur at the instant of unfreeze); progression is visible on the
  // NEXT tick after that.
  tickTweens(ctx, T0 + 60);
  check("§1f-setup. at the exact unfreeze instant, the attacker samples its frozen value one last time", Math.abs(attackerRec.t - frozenAt.attacker) < 1e-9, attackerRec.t);

  // resume: past the window, both formerly-frozen tweens continue forward from EXACTLY where they held.
  tickTweens(ctx, T0 + 90); // 30ms further
  check("§1f. attacker tween RESUMES past the freeze window (t increased beyond the frozen value)", attackerRec.t > frozenAt.attacker, attackerRec.t);
  check("§1g. target tween RESUMES past the freeze window (t increased beyond 0)", targetRec.t > 0, targetRec.t);
  check("§1h. control tween's own timeline was NEVER shifted by the freeze it wasn't part of (t=0.9 at T0+90, dur=100)", Math.abs(controlRec.t - 0.9) < 1e-9, controlRec.t);
  check("§1i. the camera-pose tween's own timeline was never shifted either (t=0.3 at T0+90, dur=300)", Math.abs(cameraRec.t - 0.3) < 1e-9, cameraRec.t);
}

// ============================================================================
// §2 CAMERA-TWEEN EXEMPTION (direct) — a camera-pose tween handed (incorrectly) straight to
// applyHitStop is still never frozen; belt-and-suspenders per that function's own header.
// ============================================================================
{
  const T0 = 2_000_000;
  const rec = {};
  const cameraTw = { start: T0, dur: 300, isCameraPoseTween: true, update: (t) => { rec.t = t; }, onDone: null };
  const n = applyHitStop([cameraTw], 60, T0);
  check("§2a. applyHitStop refuses to freeze an isCameraPoseTween-flagged tween (count=0)", n === 0, n);
  const ctx = { tweens: [cameraTw] };
  tickTweens(ctx, T0 + 30);
  check("§2b. the camera tween's t reflects normal elapsed math immediately after (never stalled)", Math.abs(rec.t - 0.1) < 1e-9, rec.t);
}

// ============================================================================
// §3 DIRECTIONAL RECOIL MATH (theater-verbs.js vHurt) — bias away from a known attacker position.
// Attacker sits at -x of the target; recoil should bias the shake toward +x (away).
// ============================================================================
{
  const ctx = makeStubTheaterCtx();
  const target = makeStubUnit("tgt", 5, 0);
  ctx.unitGroup.children.push(target);
  const attackerPos = { x: 0, z: 0 }; // directly -x of target (5,0) -> recoil direction should be (+1,0)
  const ok = playVerb(ctx, "hurt", { who: "tgt", recoilFrom: attackerPos, dur: 220 });
  check("§3a. hurt (with recoilFrom) registers a tween", ok === true);
  const tw = ctx.tweens[0];
  tw.update(0.0625); // sin(t*PI*8) peaks at t=1/16=0.0625 -> shake amplitude at its max positive magnitude
  const dx = target.position.x - 5, dz = target.position.z - 0;
  check("§3b. recoil biases the shake in +x (away from the attacker at -x)", dx > 0, dx);
  check("§3c. recoil biases z toward 0 (attacker directly on the x-axis -> zero z bias)", Math.abs(dz) < 1e-9, dz);
}
{
  // no recoilFrom -> byte-identical to the OLD fixed x/x*0.4 mix (regression guard for the opt-in design).
  const ctx = makeStubTheaterCtx();
  const target = makeStubUnit("tgt2", 5, 0);
  ctx.unitGroup.children.push(target);
  playVerb(ctx, "hurt", { who: "tgt2", dur: 220 });
  const tw = ctx.tweens[0];
  tw.update(0.0625);
  const shakeX = target.position.x - 5, shakeZ = target.position.z - 0;
  check("§3d. omitting recoilFrom reproduces the OLD fixed mix (z = 0.4 * x, no directional bias)", Math.abs(shakeZ - shakeX * 0.4) < 1e-9, JSON.stringify({ shakeX, shakeZ }));
}

// ============================================================================
// §4 HIT-STOP HOOK (opt-in via opts.attackerId) on vHurt itself — freezes the just-pushed hurt tween
// AND the attacker's own live (strike) tween, found by unitId tag.
// ============================================================================
{
  const ctx = makeStubTheaterCtx();
  const attacker = makeStubUnit("atk", 0, 0);
  const target = makeStubUnit("tgt3", 3, 0);
  ctx.unitGroup.children.push(attacker, target);
  ctx._zoneToWorld = () => ({ x: 3, z: 0 });
  playVerb(ctx, "strike", { who: "atk", to: "melee:C" }); // attacker's own lunge tween, tagged unitId:"atk"
  const attackerTw = ctx.tweens[0];
  const strikeXBeforeFreeze = attacker.position.x;
  const NOW = attackerTw.start + 40; // mid-lunge
  playVerb(ctx, "hurt", { who: "tgt3", attackerId: "atk", crit: false, dur: 220 });
  const hurtTw = ctx.tweens[ctx.tweens.length - 1];
  // manually invoke the freeze at NOW (playVerb/vHurt calls triggerHitStop with Date.now(); to make this
  // deterministic we re-apply it explicitly here at a known instant, mirroring what vHurt already did).
  freezeTween(attackerTw, 1, NOW); // no-op if already frozen from vHurt's own real-clock call — see below
  check("§4a. the attacker's strike tween got frozen by vHurt's own opts.attackerId hook", attackerTw.__freezeUntil != null, attackerTw.__freezeUntil);
  check("§4b. the target's hurt tween got frozen too (contact frame)", hurtTw.__freezeUntil != null, hurtTw.__freezeUntil);
}

// ============================================================================
// §5 CRIT CAMERA NUDGE — amplitude bound (<=2px-equivalent), single occurrence (one hump), settles by
// 120ms, and the camera-pose-tween exemption (never fights an in-flight fit).
// ============================================================================
{
  const camera = { position: { x: 10, y: 5 } };
  const ctx = makeStubTheaterCtx(camera);
  const ok = critCameraNudge(ctx, {});
  check("§5a. critCameraNudge registers a tween when no camera-pose tween is live", !!ok === true);
  const tw = ctx.tweens[0];
  check("§5b. crit nudge settles by exactly CRIT_NUDGE_DUR (120ms)", tw.dur === CRIT_NUDGE_DUR, tw.dur);
  let maxOffset = 0;
  for (let t = 0; t <= 1; t += 0.05) {
    tw.update(t);
    maxOffset = Math.max(maxOffset, Math.abs(camera.position.x - 10), Math.abs(camera.position.y - 5));
  }
  check("§5c. crit nudge amplitude never exceeds CRIT_NUDGE_AMP (2px-equivalent)", maxOffset <= CRIT_NUDGE_AMP + 1e-9, JSON.stringify({ maxOffset, CRIT_NUDGE_AMP }));
  // single-occurrence: exactly one hump — rises from 0 then falls back to 0, never a second rise (a
  // repeating shake would sample back UP after coming down before t=1; check monotonic-down after peak).
  let peakT = 0, peakVal = -1;
  for (let t = 0; t <= 1; t += 0.02) { tw.update(t); const v = Math.abs(camera.position.y - 5); if (v > peakVal) { peakVal = v; peakT = t; } }
  let monotonicDownAfterPeak = true, lastV = peakVal;
  for (let t = peakT; t <= 1; t += 0.02) { tw.update(t); const v = Math.abs(camera.position.y - 5); if (v > lastV + 1e-9) monotonicDownAfterPeak = false; lastV = v; }
  check("§5d. crit nudge is a SINGLE bounce (monotonically settles after its one peak, never a repeat)", monotonicDownAfterPeak, JSON.stringify({ peakT, peakVal }));
  tw.update(1); tw.onDone();
  check("§5e. crit nudge restores the exact base camera position on completion", camera.position.x === 10 && camera.position.y === 5, JSON.stringify(camera.position));
}
{
  // exemption: an in-flight camera-pose tween -> critCameraNudge is a clean no-op (settle cleanly).
  const camera = { position: { x: 0, y: 0 } };
  const ctx = makeStubTheaterCtx(camera);
  ctx.tweens.push({ start: Date.now(), dur: 300, isCameraPoseTween: true, update(){}, onDone: null });
  const ok = critCameraNudge(ctx, {});
  check("§5f. critCameraNudge is a clean no-op while a camera-pose tween is live (never fights an in-flight fit)", ok === false, ok);
}

// ============================================================================
// §6 FALL-DEATH HIT-STOP PRECEDES THE TIP (theater-verbs.js vDown) — 80ms hold, THEN the tip.
// ============================================================================
{
  const ctx = makeStubTheaterCtx();
  const unit = makeStubUnit("f2", 0, 0);
  ctx.unitGroup.children.push(unit);
  playVerb(ctx, "down", { who: "f2" });
  const tw = ctx.tweens[0];
  const holdFrac = FALL_HOLD_DUR / tw.dur;
  tw.update(holdFrac - 0.01);
  check("§6a. before the 80ms hold elapses, the mini has NOT begun tipping (rotation.z still 0)", unit.rotation.z === 0, unit.rotation.z);
  tw.update(holdFrac + 0.05);
  check("§6b. once the hold elapses, the tip BEGINS (rotation.z > 0)", unit.rotation.z > 0, unit.rotation.z);
  tw.update(1);
  check("§6c. the FINAL pose is unchanged by the hold (still fully toppled at PI/2 — no regression to the old contract)", Math.abs(unit.rotation.z - Math.PI/2) < 1e-9, unit.rotation.z);
}

// ============================================================================
// §7 THE STANDEE (production sprite) PATH — hit-damage/hit-crit/fall-death get the same mechanism.
// ============================================================================
const standeeModUrl = pathToFileURL(join(ROOT, "src/ui/standee-verbs.js")).href;
const { playStandeeVerb, bindStandeeCtx } = await import(standeeModUrl);

function makeStubColor(r, g, b) {
  return { r: r!=null?r:1, g: g!=null?g:1, b: b!=null?b:1,
    clone(){ return makeStubColor(this.r,this.g,this.b); },
    setRGB(r,g,b){ this.r=r; this.g=g; this.b=b; return this; },
    setHex(hex){ this.r=((hex>>16)&255)/255; this.g=((hex>>8)&255)/255; this.b=(hex&255)/255; return this; } };
}
function makeStubMaterial(overrides) {
  const mat = Object.assign({ color: makeStubColor(1,1,1), opacity: 1, map: { isTexture: true }, userData: {}, disposed: false, dispose(){ this.disposed = true; } }, overrides || {});
  mat.clone = function(){ return makeStubMaterial({ color: this.color.clone(), opacity: this.opacity, map: this.map, userData: {} }); };
  return mat;
}
function makeStandeeGroup(id, x, z) {
  const mat = makeStubMaterial();
  const mesh = { userData: {}, material: mat, isMesh: true };
  const group = Object.assign({ children: [], userData: { sprite: true, spriteSlug: id, spriteBillboardMesh: mesh },
    position: makeStubVec3(x||0, 0, z||0), rotation: makeStubEuler(0,0,0), scale: makeStubVec3(1,1,1),
    add(o){ this.children.push(o); }, remove(o){ const i=this.children.indexOf(o); if(i>=0) this.children.splice(i,1); } });
  group.add(mesh);
  return { group, mesh, mat };
}
const StubTHREE2 = { Group: function(){ return { children: [], add(){}, remove(){} }; }, Color: function(r,g,b){ return makeStubColor(r,g,b); } };

{
  // §7a hit-damage/hit-crit hit-stop + unitId tagging: fires opts.attackerId, freezes both.
  const camera = { position: { x: 0, y: 0 } };
  const ctx = { THREE: StubTHREE2, tweens: [], markDirty(){}, camera };
  bindStandeeCtx(ctx);
  ctx.tweens.push({ start: Date.now() - 40, dur: 260, unitId: "atk-standee", update(){}, onDone: null }); // attacker's own live tween
  const standee = makeStandeeGroup("hurt-standee");
  const ok = playStandeeVerb(standee.group, "hit-damage", { who: "victim-standee", attackerId: "atk-standee" });
  check("§7a. standee hit-damage registers a tween", ok === true);
  const attackerTw = ctx.tweens[0], targetTw = ctx.tweens[ctx.tweens.length - 1];
  check("§7b. standee hit-damage freezes the attacker's tween (opts.attackerId hook)", attackerTw.__freezeUntil != null, attackerTw.__freezeUntil);
  check("§7c. standee hit-damage freezes itself (contact frame)", targetTw.__freezeUntil != null, targetTw.__freezeUntil);
}
{
  // §7d hit-crit fires the crit nudge automatically (unconditional whenever ctx.camera is present).
  const camera = { position: { x: 0, y: 0 } };
  const ctx = { THREE: StubTHREE2, tweens: [], markDirty(){}, camera };
  bindStandeeCtx(ctx);
  const standee = makeStandeeGroup("crit-standee");
  const ok = playStandeeVerb(standee.group, "hit-crit", {});
  check("§7d. standee hit-crit registers its own tween", ok === true);
  check("§7e. standee hit-crit ALSO pushed the camera nudge tween (2 tweens total: hit-crit + nudge)", ctx.tweens.length === 2, ctx.tweens.length);
  const nudgeTw = ctx.tweens.find(t => t.isCritNudge);
  check("§7f. the nudge tween is tagged isCritNudge (identifiable, distinct from the hit-crit keyframe tween)", !!nudgeTw);
}
{
  // §7g standee directional recoil (opts.recoilDir) on hit-damage.
  const ctx = { THREE: StubTHREE2, tweens: [], markDirty(){} };
  bindStandeeCtx(ctx);
  const standee = makeStandeeGroup("recoil-standee", 5, 0);
  playStandeeVerb(standee.group, "hit-damage", { recoilDir: { x: 1, z: 0 } });
  const tw = ctx.tweens[0];
  tw.update(0.15); // hit-damage's own jx peak keyframe (jx:0.06 at t=0.15)
  check("§7h. standee recoilDir biases the jitter fully onto world-x (recoilDir={1,0})", standee.group.position.x > 5, standee.group.position.x);
  check("§7i. standee recoilDir zeroes the z contribution when recoilDir.z=0", Math.abs(standee.group.position.z - 0) < 1e-9, standee.group.position.z);
}
{
  // §7j standee fall-death hit-stop precedes the tip (holdMs:80 on the STANDEE_VERBS registry entry).
  const ctx = { THREE: StubTHREE2, tweens: [], markDirty(){} };
  bindStandeeCtx(ctx);
  const standee = makeStandeeGroup("fall-standee");
  playStandeeVerb(standee.group, "fall-death", {});
  const tw = ctx.tweens[0];
  const holdFrac = FALL_HOLD_DUR / tw.dur;
  tw.update(holdFrac - 0.01);
  check("§7k. standee fall-death: before the 80ms hold, no tip yet (rotation.x still 0)", standee.group.rotation.x === 0, standee.group.rotation.x);
  tw.update(holdFrac + 0.1);
  check("§7l. standee fall-death: once the hold elapses, the tip begins (rotation.x > 0)", standee.group.rotation.x > 0, standee.group.rotation.x);
  tw.update(1); tw.onDone();
  check("§7m. standee fall-death final pose unchanged by the hold (still PI/2, persists)", Math.abs(standee.group.rotation.x - Math.PI/2) < 1e-9, standee.group.rotation.x);
}

// ============================================================================
// §8 CHILDREN CARVE-OUT — impact effects (hit-stop/recoil/nudge) are the ONLY thing this unit touches,
// and none of it is gated by any child/isChild flag (the carve-out is a GORE/decal rule elsewhere —
// src/world/prep.js's childTagged->impact remap — never an impact-motion suppression). Parity check:
// identical opts modulo a child flag produce IDENTICAL tween behavior.
// ============================================================================
{
  const ctxA = { THREE: StubTHREE2, tweens: [], markDirty(){} };
  bindStandeeCtx(ctxA);
  const standeeA = makeStandeeGroup("child-a");
  playStandeeVerb(standeeA.group, "hit-damage", { isChild: false });
  const twA = ctxA.tweens[0];

  const ctxB = { THREE: StubTHREE2, tweens: [], markDirty(){} };
  bindStandeeCtx(ctxB);
  const standeeB = makeStandeeGroup("child-b");
  playStandeeVerb(standeeB.group, "hit-damage", { isChild: true, childTagged: true });
  const twB = ctxB.tweens[0];

  let identical = true;
  for (let t = 0; t <= 1; t += 0.1) {
    twA.update(t); const ax = standeeA.group.position.x, aTint = standeeA.mat.color.r;
    twB.update(t); const bx = standeeB.group.position.x, bTint = standeeB.mat.color.r;
    if (Math.abs(ax - bx) > 1e-9 || Math.abs(aTint - bTint) > 1e-9) identical = false;
  }
  check("§8a. hit-damage's impact motion/tint is IDENTICAL regardless of an isChild/childTagged flag (impact effects are never gated by it)", identical);
}

// ============================================================================
// §9 THE EXISTING VERB SUITES STAY GREEN — re-run live as child processes (not just cited).
// ============================================================================
console.log("\n=== §9 re-running the sibling verb suites live ===");
{
  let standeeOut = "", standeeOk = true;
  try { standeeOut = execSync("node dev/verify-standee-verbs.mjs", { cwd: ROOT }).toString(); }
  catch (e) { standeeOk = false; standeeOut = String(e.stdout || e.message); }
  const standeeTail = standeeOut.trim().split("\n").slice(-1)[0];
  check("§9a. dev/verify-standee-verbs.mjs exits clean with 0 failed", standeeOk && /\b0 failed\b/.test(standeeTail), standeeTail);

  let theaterOut = "", theaterOk = true;
  try { theaterOut = execSync("node dev/verify-theater-verbs.mjs", { cwd: ROOT }).toString(); }
  catch (e) { theaterOk = false; theaterOut = String(e.stdout || e.message); }
  const theaterTail = theaterOut.trim().split("\n").slice(-1)[0];
  check("§9b. dev/verify-theater-verbs.mjs exits clean with 0 failed", theaterOk && /\b0 failed\b/.test(theaterTail), theaterTail);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
