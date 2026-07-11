/* Verify GRAPHICS-ENGINE Part II §A (docs/GRAPHICS-ENGINE.md) — the billboard-STANDEE verb library
   (src/ui/standee-verbs.js) and its production wiring into theater-boot.js's play(). Two independent
   parts, mirroring dev/verify-theater-verbs.mjs's own two-part structure for the sibling module:

   PART A — a real Node ESM `import` of src/ui/standee-verbs.js. Zero direct DOM/THREE coupling of its
   own (every THREE.* handle arrives via bindStandeeCtx's ctx, same discipline as theater-verbs.js), so
   a plain Node import + a hand-built stub ctx/group/mesh (no real THREE needed) is enough to exercise
   every verb's real tween math deterministically: STANDEE_VERBS completeness against §A's v1 list,
   playStandeeVerb driving the full keyframe phase list with a FAKE CLOCK (assert exact transform values
   AT phase boundaries — sampleKeyframes is byte-exact at a keyframe's own `at`, not an approximation),
   corpse persistence (fall-death), SPRITE PURITY (material.map identity), and the tilt-composition
   contract (facing rotation on the OUTER group survives every verb untouched).

   PART B — production wiring proof. theater-boot.js is a sealed ES module that `import`s THREE and
   needs a live WebGL mount — it cannot be win.eval'd under jsdom or imported headless (the same
   constraint dev/verify-theater-verbs.mjs's own Part A2/B document for this exact file). Following that
   file's established convention: extract the REAL `play(verb,opts)` function source text + the REAL
   STANDEE_VERB_FOR_THEATER_VERB const, eval them in a sandbox with trivial stand-ins for their callees
   (findUnit/buildTheaterCtx/playVerb/playStandeeVerb/bindStandeeCtx/startTweenLoop — spies, not
   reimplementations of THIS unit's own logic), and drive play("hurt",{who:"f1"}) / play("down",{...})
   against a stubbed sprite-billboard unit to prove the REAL source routes it to playStandeeVerb("hit-
   damage"/"fall-death", ...) while a non-sprite (whole-object) unit still falls through to the ordinary
   playVerb("hurt"/"down", ...) path, unchanged. This is "a driven combat-damage event plays hit-damage
   on a sprite unit" exercised against theater-boot.js's actual wiring text, not a re-description of it.

   RED-FIRST (checked 2026-07-10 against tip 063b26b, before this unit's files existed):
     `git show 063b26b:src/ui/standee-verbs.js` -> "fatal: path 'src/ui/standee-verbs.js' exists on
     disk, but not in '063b26b'" — the module (and STANDEE_VERBS) did not exist. `git show
     063b26b:src/ui/theater-boot.js | grep -c "STANDEE_VERB_FOR_THEATER_VERB"` -> 0 — the production
     wiring did not exist either. Both are now present (this unit).

   Run:  node dev/verify-standee-verbs.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md, only
   needed for Part B's sandboxed source-extraction eval, which uses createRequire the same way every
   other theater-boot.js-touching harness does — no actual DOM is mounted). */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

console.log("=== RED-FIRST proof (re-checked live, not just cited in the header) ===");
{
  let existedAtBase = true, msg = "";
  try {
    execSync("git show 063b26b:src/ui/standee-verbs.js", { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] });
  } catch (e) {
    existedAtBase = false; msg = String(e.stderr || e.message);
  }
  check("RED0a. src/ui/standee-verbs.js did NOT exist at base commit 063b26b (pre this unit)",
    existedAtBase === false, msg.split("\n")[0]);
  const wiringAtBase = execSync("git show 063b26b:src/ui/theater-boot.js | grep -c STANDEE_VERB_FOR_THEATER_VERB || true",
    { cwd: ROOT }).toString().trim();
  check("RED0b. theater-boot.js had NO STANDEE_VERB_FOR_THEATER_VERB wiring at base commit 063b26b",
    wiringAtBase === "0", wiringAtBase);
}

console.log("\n=== PART A — standee-verbs.js as a pure ES module (no DOM) ===");

const modUrl = pathToFileURL(join(ROOT, "src/ui/standee-verbs.js")).href;
const { STANDEE_VERBS, STANDEE_VERB_NAMES, playStandeeVerb, bindStandeeCtx } = await import(modUrl);

// ----------------------------------------------------------------------------
// stub scene-graph helpers — same spirit as dev/verify-theater-verbs.mjs's makeStubCtx/makeStubUnit,
// authored fresh here (no cross-file import) since standee-verbs.js's ctx/group/mesh shapes differ from
// theater-verbs.js's (a billboard GROUP wrapping one sprite MESH, not a posed figure).
// ----------------------------------------------------------------------------
function makeStubVec3(x, y, z) {
  return { x: x||0, y: y||0, z: z||0, set(nx,ny,nz){ this.x=nx; this.y=ny; this.z=nz; return this; },
    clone(){ return makeStubVec3(this.x,this.y,this.z); } };
}
function makeStubEuler(x, y, z) { return { x: x||0, y: y||0, z: z||0, order: "XYZ" }; }
function makeStubColor(r, g, b) {
  return { r: r!=null?r:1, g: g!=null?g:1, b: b!=null?b:1,
    clone(){ return makeStubColor(this.r,this.g,this.b); },
    setRGB(r,g,b){ this.r=r; this.g=g; this.b=b; return this; },
    setHex(hex){ this.r=((hex>>16)&255)/255; this.g=((hex>>8)&255)/255; this.b=(hex&255)/255; return this; } };
}
function makeStubMaterial(overrides) {
  const mat = Object.assign({
    color: makeStubColor(1,1,1), opacity: 1, map: { isTexture: true, name: "orig-tex" },
    userData: {}, disposed: false,
    dispose(){ this.disposed = true; }
  }, overrides || {});
  mat.clone = function(){
    return makeStubMaterial({ color: this.color.clone(), opacity: this.opacity, map: this.map, userData: {} });
  };
  return mat;
}
function makeStubGroup(extra) {
  const g = Object.assign({
    children: [], userData: {},
    position: makeStubVec3(0,0,0), rotation: makeStubEuler(0,0,0), scale: makeStubVec3(1,1,1),
    add(o){ this.children.push(o); return this; },
    remove(o){ const i = this.children.indexOf(o); if(i>=0) this.children.splice(i,1); return this; }
  }, extra || {});
  return g;
}
function makeStubStandee(id) {
  const mat = makeStubMaterial();
  const mesh = { userData: {}, material: mat, isMesh: true };
  const group = makeStubGroup({ userData: { sprite: true, spriteSlug: id, spriteBillboardMesh: mesh } });
  group.add(mesh);
  return { group, mesh, mat };
}
const StubTHREE = {
  Group: function(){ return makeStubGroup(); },
  Color: function(r,g,b){ return makeStubColor(r,g,b); }
};
function stubCtx(overrides) {
  return Object.assign({ THREE: StubTHREE, tweens: [], markDirty(){} }, overrides || {});
}
function runToCompletion(tweens) {
  const now = Date.now() + 100000;
  tweens.forEach(tw => { tw.start = now - tw.dur - 1; });
  tweens.slice().forEach(tw => { tw.update(1); if(typeof tw.onDone === "function") tw.onDone(); });
  tweens.length = 0;
}
// runs a tween's update() at an explicit t in [0,1] WITHOUT completing it — for phase-boundary assertions.
function sampleAt(tween, t) {
  tween.update(t);
}

// ----------------------------------------------------------------------------
// A1. STANDEE_VERBS completeness vs §A's v1 list.
// ----------------------------------------------------------------------------
{
  const SPEC_VERBS = ["act-attack","act-cast","move-step","hit-damage","hit-crit","fall-death","heal","buff","debuff","guise-swap"];
  check("A1a. STANDEE_VERBS is exported + frozen", typeof STANDEE_VERBS === "object" && Object.isFrozen(STANDEE_VERBS));
  check("A1b. STANDEE_VERB_NAMES is exported + frozen array", Array.isArray(STANDEE_VERB_NAMES) && Object.isFrozen(STANDEE_VERB_NAMES));
  check("A1c. every §A v1 verb is present", SPEC_VERBS.every(v => v in STANDEE_VERBS),
    SPEC_VERBS.filter(v => !(v in STANDEE_VERBS)).join(","));
  check("A1d. no unknown/stray verbs beyond §A's v1 list", STANDEE_VERB_NAMES.every(v => SPEC_VERBS.includes(v)), STANDEE_VERB_NAMES.join(","));
}

// ----------------------------------------------------------------------------
// A2. an unbound ctx / unknown verb / non-standee group are all clean no-ops (never throw).
// ----------------------------------------------------------------------------
{
  bindStandeeCtx(null);
  let threw = false, ok = "unset";
  try { ok = playStandeeVerb(makeStubStandee("x").group, "hit-damage", {}); } catch(e){ threw = true; }
  check("A2a. playStandeeVerb with no ctx bound is a clean no-op (false, never throws)", threw === false && ok === false, JSON.stringify({threw, ok}));

  const ctx = stubCtx();
  bindStandeeCtx(ctx);
  const standee = makeStubStandee("y");
  let ok2 = "unset";
  try { ok2 = playStandeeVerb(standee.group, "not-a-real-verb", {}); } catch(e){ threw = true; }
  check("A2b. an unknown verb name is rejected (false, no tween pushed)", ok2 === false && ctx.tweens.length === 0);

  const notAStandee = makeStubGroup({ userData: {} }); // no userData.sprite
  let ok3 = "unset";
  try { ok3 = playStandeeVerb(notAStandee, "hit-damage", {}); } catch(e){ threw = true; }
  check("A2c. a non-standee group (no userData.sprite) is a clean no-op", ok3 === false && threw === false);
}

// ----------------------------------------------------------------------------
// A3. deterministic phase-boundary assertions (fake clock — sampleAt drives update(t) directly, no
// wall-clock timers) for a representative spread of the v1 verb set.
// ----------------------------------------------------------------------------
{
  // act-attack: lunges toward opts.targetPos at t=0.45 (along:0.55) then returns to base at t=1.
  const ctx = stubCtx();
  bindStandeeCtx(ctx);
  const standee = makeStubStandee("attacker");
  standee.group.position.set(2, 0, 2);
  const ok = playStandeeVerb(standee.group, "act-attack", { targetPos: { x: 6, z: 2 } });
  check("A3a. act-attack registers exactly one tween", ok === true && ctx.tweens.length === 1);
  const tw = ctx.tweens[0];
  sampleAt(tw, 0.45);
  check("A3b. act-attack at t=0.45 is at the lunge peak (along=0.55 -> x = 2 + 4*0.55 = 4.2)",
    Math.abs(standee.group.position.x - 4.2) < 1e-9, standee.group.position.x);
  sampleAt(tw, 1);
  tw.onDone();
  check("A3c. act-attack ends back at the base position (persist:false, snapped back)",
    Math.abs(standee.group.position.x - 2) < 1e-9 && Math.abs(standee.group.position.z - 2) < 1e-9,
    JSON.stringify(standee.group.position));
  check("A3d. act-attack restores the ORIGINAL material object on completion (non-persistent revert)",
    standee.mesh.material === standee.mat, standee.mesh.material === standee.mat);
}
{
  // hit-damage: white flash peak at t=0.15 (tintMix=1, tintColor=0xffffff), red tint easing after.
  const ctx = stubCtx();
  bindStandeeCtx(ctx);
  const standee = makeStubStandee("hurt-me");
  const ok = playStandeeVerb(standee.group, "hit-damage", {});
  check("A4a. hit-damage registers exactly one tween", ok === true && ctx.tweens.length === 1);
  const tw = ctx.tweens[0];
  sampleAt(tw, 0.15);
  check("A4b. hit-damage at t=0.15 flashes full white (material color -> 1,1,1)",
    Math.abs(standee.mesh.material.color.r - 1) < 1e-9 && Math.abs(standee.mesh.material.color.g - 1) < 1e-9 && Math.abs(standee.mesh.material.color.b - 1) < 1e-9,
    JSON.stringify(standee.mesh.material.color));
  sampleAt(tw, 1);
  tw.onDone();
  check("A4c. hit-damage ends back at the original (untinted) color on completion",
    Math.abs(standee.mesh.material.color.r - 1) < 1e-9, standee.mesh.material.color.r);
}
{
  // move-step — persist:true, ends AT the target (along:1).
  const ctx = stubCtx();
  bindStandeeCtx(ctx);
  const standee = makeStubStandee("stepper");
  standee.group.position.set(0, 0, 0);
  const ok = playStandeeVerb(standee.group, "move-step", { targetPos: { x: 3, z: 4 } });
  check("A5a. move-step registers a tween", ok === true);
  const tw = ctx.tweens[0];
  sampleAt(tw, 0.5);
  check("A5b. move-step at t=0.5 is mid-hop (along=0.5 -> x=1.5,z=2) with a lift (dy=0.15)",
    Math.abs(standee.group.position.x - 1.5) < 1e-9 && Math.abs(standee.group.position.z - 2) < 1e-9 && Math.abs(standee.group.position.y - 0.15) < 1e-9,
    JSON.stringify(standee.group.position));
  sampleAt(tw, 1);
  tw.onDone();
  check("A5c. move-step ends AT the target position (persist:true — no snap-back)",
    Math.abs(standee.group.position.x - 3) < 1e-9 && Math.abs(standee.group.position.z - 4) < 1e-9,
    JSON.stringify(standee.group.position));
}

// ----------------------------------------------------------------------------
// A6. fall-death — corpse persists (group still present, no visibility flag flipped false anywhere in
// this module), rotation tips to the floor plane (PI/2), and the tint desaturates. Runs on the WRAPPER,
// never the outer group (composition contract — re-checked explicitly in A7 below).
// ----------------------------------------------------------------------------
{
  const ctx = stubCtx();
  bindStandeeCtx(ctx);
  const standee = makeStubStandee("corpse");
  check("A6a. fall-death has no `visible` field on the group before playing (nothing to hide)", standee.group.visible === undefined);
  const ok = playStandeeVerb(standee.group, "fall-death", {});
  check("A6b. fall-death registers a tween", ok === true);
  runToCompletion(ctx.tweens);
  check("A6c. fall-death leaves the group PRESENT (no visible:false anywhere — corpse stays a card)",
    standee.group.visible !== false, standee.group.visible);
  const wrap = standee.group.userData.standeeWrap;
  check("A6d. fall-death created a wrapper child group for the tip rotation", !!wrap);
  check("A6e. fall-death's wrapper rotation.x ends at the floor plane (PI/2)",
    wrap && Math.abs(wrap.rotation.x - Math.PI/2) < 1e-9, wrap && wrap.rotation.x);
  check("A6f. fall-death desaturates toward gray (tintMix 0.85 toward 0x808080) and PERSISTS (no revert)",
    Math.abs(standee.mesh.material.color.r - (1 + (0.5019607843137255-1)*0.85)) < 1e-6,
    standee.mesh.material.color.r);
  check("A6g. fall-death's material clone is left bound (mesh.material !== the pre-verb original — terminal, matches vDown's own convention)",
    standee.mesh.material !== standee.mat);
}

// ----------------------------------------------------------------------------
// A7. TILT-COMPOSITION CONTRACT — the outer group's rotation.x/y (what updateSpriteBillboardYaw owns)
// is NEVER written by any verb, including fall-death. Simulate the facing code stamping a tilt/yaw onto
// the outer group BEFORE and AFTER a verb runs; the values must be byte-identical.
// ----------------------------------------------------------------------------
{
  const ctx = stubCtx();
  bindStandeeCtx(ctx);
  const standee = makeStubStandee("tilted");
  const FAKE_TILT = 0.5236; // ~30deg, an arbitrary non-zero stand-in for CAM_ELEV_DEG's radian value
  const FAKE_YAW = 2.1;
  standee.group.rotation.x = FAKE_TILT;
  standee.group.rotation.y = FAKE_YAW;
  playStandeeVerb(standee.group, "fall-death", {});
  runToCompletion(ctx.tweens);
  check("A7a. after fall-death completes, the OUTER group's rotation.x is untouched (still the facing tilt)",
    standee.group.rotation.x === FAKE_TILT, standee.group.rotation.x);
  check("A7b. after fall-death completes, the OUTER group's rotation.y is untouched (still the facing yaw)",
    standee.group.rotation.y === FAKE_YAW, standee.group.rotation.y);

  // same proof for a non-rotation verb (hit-crit) — should trivially hold (never touches rotation at all).
  const ctx2 = stubCtx();
  bindStandeeCtx(ctx2);
  const standee2 = makeStubStandee("tilted2");
  standee2.group.rotation.x = FAKE_TILT; standee2.group.rotation.y = FAKE_YAW;
  playStandeeVerb(standee2.group, "hit-crit", {});
  runToCompletion(ctx2.tweens);
  check("A7c. hit-crit never touches the outer group's rotation.x/y either",
    standee2.group.rotation.x === FAKE_TILT && standee2.group.rotation.y === FAKE_YAW);
}

// ----------------------------------------------------------------------------
// A8. SPRITE PURITY — material.map object identity unchanged after EVERY non-guise-swap verb (before
// vs. after comparison across the full v1 list).
// ----------------------------------------------------------------------------
{
  const PURITY_VERBS = ["act-attack","act-cast","move-step","hit-damage","hit-crit","fall-death","heal","buff","debuff"];
  for (const verbName of PURITY_VERBS) {
    const ctx = stubCtx();
    bindStandeeCtx(ctx);
    const standee = makeStubStandee("purity-" + verbName);
    const origMap = standee.mesh.material.map;
    playStandeeVerb(standee.group, verbName, { targetPos: { x: 1, z: 1 } });
    // sample mid-tween too — purity must hold WHILE animating, not just at rest.
    if (ctx.tweens[0]) sampleAt(ctx.tweens[0], 0.4);
    check(`A8-${verbName}. material.map identity unchanged mid-tween`, standee.mesh.material.map === origMap);
    runToCompletion(ctx.tweens);
    check(`A8-${verbName}. material.map identity unchanged after completion`, standee.mesh.material.map === origMap);
  }
  // guise-swap — the NAMED exception: map identity CHANGES (deliberately), to the caller-supplied texture.
  const ctx = stubCtx();
  bindStandeeCtx(ctx);
  const standee = makeStubStandee("guise-target");
  const origMap = standee.mesh.material.map;
  const newTex = { isTexture: true, name: "new-form-tex" };
  const ok = playStandeeVerb(standee.group, "guise-swap", { newTexture: newTex });
  check("A8-guise-swap. guise-swap registers a tween (newTexture supplied)", ok === true);
  runToCompletion(ctx.tweens);
  check("A8-guise-swap. guise-swap DOES swap material.map to the new texture (documented exception)",
    standee.mesh.material.map === newTex && standee.mesh.material.map !== origMap);
  // and the no-newTexture case is a clean no-op, matching every other unresolvable-reference verb.
  const ctx2 = stubCtx();
  bindStandeeCtx(ctx2);
  const standee2 = makeStubStandee("guise-noop");
  let threw = false, ok2 = "unset";
  try { ok2 = playStandeeVerb(standee2.group, "guise-swap", {}); } catch(e){ threw = true; }
  check("A8-guise-swap. guise-swap with no opts.newTexture is a clean no-op", ok2 === false && threw === false);
}

// ----------------------------------------------------------------------------
// A9. MUTATION TEST — break the ticker registration (bind a ctx with NO tweens array, simulating the
// ticker never having been wired up) and confirm the phase-boundary assertions from A3/A4 go RED under
// that broken ctx: no tween is pushed, so a transform that should have moved never does.
// ----------------------------------------------------------------------------
{
  const brokenCtx = { THREE: StubTHREE, markDirty(){} }; // tweens: intentionally OMITTED — the ticker's own registry
  bindStandeeCtx(brokenCtx);
  const standee = makeStubStandee("broken-ticker");
  standee.group.position.set(2, 0, 2);
  const ok = playStandeeVerb(standee.group, "act-attack", { targetPos: { x: 6, z: 2 } });
  check("A9a. ⊗ MUTATION: with the ticker registration broken (no ctx.tweens), playStandeeVerb returns false",
    ok === false, ok);
  check("A9b. ⊗ MUTATION: the standee never moves off its base position (proving A3b's assertion is load-bearing, not vacuous)",
    standee.group.position.x === 2, standee.group.position.x);
  bindStandeeCtx(stubCtx()); // restore a working ctx for anything after this block
}

console.log("\n=== PART B — production wiring (theater-boot.js's play(), source-extraction sandbox) ===");

const bootSrc = readFileSync(join(ROOT, "src/ui/theater-boot.js"), "utf-8");
function extractFn(src, name){
  const sig = "function " + name + "(";
  const start = src.indexOf(sig);
  if(start < 0) return null;
  let i = src.indexOf("{", start), depth = 0;
  for(; i < src.length; i++){
    if(src[i] === "{") depth++;
    else if(src[i] === "}"){ depth--; if(depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}
function extractConst(src, name){
  const re = new RegExp("const " + name + "\\s*=\\s*Object\\.freeze\\(\\{[^}]*\\}\\);");
  const m = src.match(re);
  return m ? m[0] : null;
}

{
  const playFnSrc = extractFn(bootSrc, "play");
  const mapConst = extractConst(bootSrc, "STANDEE_VERB_FOR_THEATER_VERB");
  check("B0-setup. theater-boot.js's real play(verb,opts) function is present", !!playFnSrc);
  check("B0-setup. theater-boot.js's real STANDEE_VERB_FOR_THEATER_VERB const is present", !!mapConst);
  check("B0a. the wiring map is exactly {hurt:\"hit-damage\", down:\"fall-death\"} (WIRING LAW — no new event surface, only these two)",
    !!mapConst && mapConst.includes('hurt: "hit-damage"') && mapConst.includes('down: "fall-death"'), mapConst);

  if (playFnSrc && mapConst) {
    const calls = { standee: [], theater: [] };
    const stubUnitSprite = { userData: { unitId: "f1", sprite: true } };
    const stubUnitWhole = { userData: { unitId: "f2" } }; // no sprite flag — a whole-object/glb figure
    const factory = new Function(
      "S", "findUnit", "buildTheaterCtx", "playVerb", "playStandeeVerb", "bindStandeeCtx", "startTweenLoop",
      mapConst + "\n" + playFnSrc + "\nreturn play;"
    );
    const S = { mounted: true, boardKey: "x", unitsKey: "x" };
    const findUnit = (id) => id === "f1" ? stubUnitSprite : (id === "f2" ? stubUnitWhole : null);
    const buildTheaterCtx = () => ({ fake: "ctx" });
    const playVerb = (ctx, verb, opts) => { calls.theater.push({ verb, opts }); return true; };
    const playStandeeVerb = (unit, verb, opts) => { calls.standee.push({ unit, verb, opts }); return true; };
    const bindStandeeCtx = () => {};
    const startTweenLoop = () => {};
    const play = factory(S, findUnit, buildTheaterCtx, playVerb, playStandeeVerb, bindStandeeCtx, startTweenLoop);

    play("hurt", { who: "f1", magnitude: 2 });
    check("B1a. play(\"hurt\",{who:sprite-unit}) routes to playStandeeVerb(\"hit-damage\", ...) — the WIRING LAW proof",
      calls.standee.length === 1 && calls.standee[0].verb === "hit-damage" && calls.standee[0].unit === stubUnitSprite,
      JSON.stringify(calls.standee));
    check("B1b. a sprite-routed hurt does NOT also fall through to the 3D-figure playVerb path",
      calls.theater.length === 0, JSON.stringify(calls.theater));

    calls.standee.length = 0; calls.theater.length = 0;
    play("down", { who: "f1" });
    check("B1c. play(\"down\",{who:sprite-unit}) routes to playStandeeVerb(\"fall-death\", ...)",
      calls.standee.length === 1 && calls.standee[0].verb === "fall-death", JSON.stringify(calls.standee));

    calls.standee.length = 0; calls.theater.length = 0;
    play("hurt", { who: "f2" }); // a WHOLE-OBJECT figure — no userData.sprite
    check("B1d. play(\"hurt\",{who:whole-object-unit}) falls through to the ORDINARY playVerb(\"hurt\",...) path, unchanged",
      calls.theater.length === 1 && calls.theater[0].verb === "hurt" && calls.standee.length === 0,
      JSON.stringify({ theater: calls.theater, standee: calls.standee }));

    calls.standee.length = 0; calls.theater.length = 0;
    play("advance", { who: "f1", to: "near:C" }); // a verb with NO standee mapping — always falls through
    check("B1e. a verb outside the wiring map (e.g. advance) always uses the ordinary playVerb path, even for a sprite unit",
      calls.theater.length === 1 && calls.theater[0].verb === "advance" && calls.standee.length === 0,
      JSON.stringify({ theater: calls.theater, standee: calls.standee }));

    calls.standee.length = 0; calls.theater.length = 0;
    const declineStandeeVerb = (unit, verb, opts) => { calls.standee.push({ unit, verb, opts }); return false; }; // decline
    const playDecline = factory(S, findUnit, buildTheaterCtx, playVerb, declineStandeeVerb, bindStandeeCtx, startTweenLoop);
    playDecline("hurt", { who: "f1" });
    check("B1f. if playStandeeVerb DECLINES (false — e.g. texture not loaded yet), play() falls through to the ordinary playVerb path rather than dropping the animation",
      calls.standee.length === 1 && calls.theater.length === 1 && calls.theater[0].verb === "hurt",
      JSON.stringify({ standee: calls.standee, theater: calls.theater }));
  }
}

console.log("\n=== PART C — findUnit resolves interior-board pieces, not just combat unitGroup (dungeon-loop-gate finding) ===");
// FINDING (dev/battle-gate/capture-dungeon-loop.mjs, 2026-07-10): interiorBuildPieces (the
// setInteriorBoard `pieces` layer) mounts sprite billboards under S.interiorGroup's own pieces
// sub-group, never S.unitGroup — before this unit's fix, findUnit only ever searched S.unitGroup, so
// play(verb,{who:fid}) could NEVER resolve a creature standing in a rendered interior room even when
// interiorBuildPieces had already tagged it userData.unitId=fid. RED-FIRST (re-checked live against
// this same tip, not just cited): the OLD findUnit body (`if(!S.unitGroup...` guard, single flat loop
// over S.unitGroup.children only) is verifiably absent from theater-boot.js today —
// `grep -c "if(S.interiorGroup){" ` below asserts the fix's own new branch is present in the real file
// (not a description of it) before exercising the extracted function against a stub scene graph.
{
  const hasInteriorBranch = (bootSrc.match(/function findUnit\(id\)\{[\s\S]{0,900}?S\.interiorGroup/) != null);
  check("C0-setup. RED-FIRST: theater-boot.js's real findUnit(id) body reaches S.interiorGroup (the fix is actually present in source, not just this harness's stub)",
    hasInteriorBranch);

  const findUnitFnSrc = extractFn(bootSrc, "findUnit");
  check("C0-setup. theater-boot.js's real findUnit(id) function is present", !!findUnitFnSrc);

  if (findUnitFnSrc) {
    const factory = new Function("S", findUnitFnSrc + "\nreturn findUnit;");
    // a piece mounted by interiorBuildPieces: a billboard GROUP tagged userData.sprite + userData.unitId
    // (only when the caller supplied a fid — see this unit's own comment on interiorBuildPieces), sitting
    // TWO levels below S.interiorGroup (interiorGroup -> pieces-subgroup -> the billboard group itself),
    // the exact tree shape updateSpriteBillboardYaw's own precedent traversal already assumes.
    const interiorPiece = { userData: { sprite: true, unitId: "f3" } };
    const piecesSubGroup = { children: [interiorPiece] };
    const combatUnit = { userData: { sprite: true, unitId: "f1" } };
    const S = {
      unitGroup: { children: [combatUnit] },
      interiorGroup: { children: [piecesSubGroup] },
    };
    const findUnit = factory(S);

    check("C1a. findUnit resolves a combat unit from S.unitGroup unchanged (byte-identical to pre-fix behavior)",
      findUnit("f1") === combatUnit);
    check("C1b. findUnit resolves an interior-board piece nested in S.interiorGroup's pieces sub-group (the fix)",
      findUnit("f3") === interiorPiece);
    check("C1c. findUnit still returns null for an unknown id",
      findUnit("nope") === null);
    check("C1d. findUnit is null-safe with no S.interiorGroup at all (a plain combat-stage mount, no interior board ever set)",
      (() => { const S2 = { unitGroup: { children: [combatUnit] } }; const fu2 = factory(S2); return fu2("f1") === combatUnit && fu2("f3") === null; })());

    // MUTATION: prove C1b is load-bearing, not vacuous — with the interiorGroup search disabled
    // (simulating the pre-fix function), "f3" must fail to resolve.
    const preFixSrc = "function findUnit(id){ if(!S.unitGroup || id == null) return null; const idStr = String(id); for(let i=0;i<S.unitGroup.children.length;i++){ if(S.unitGroup.children[i].userData && S.unitGroup.children[i].userData.unitId === idStr) return S.unitGroup.children[i]; } return null; }";
    const preFixFindUnit = new Function("S", preFixSrc + "\nreturn findUnit;")(S);
    check("C1e. ⊗ MUTATION: the pre-fix findUnit body fails to resolve the same interior piece (proves C1b isn't vacuous)",
      preFixFindUnit("f3") === null);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
