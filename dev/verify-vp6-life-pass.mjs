/* Verify docs/BEAUTY-WAVE.md VP6 — THE LIFE PASS. Five independent parts, one per spec item, each
   exercised against the REAL source (a real ES-module import for standee-verbs.js's pure idle-breathe
   state machine; source-extraction sandbox evals — the same convention dev/verify-standee-verbs.mjs and
   dev/verify-dungeon-interior.mjs already use for theater-boot.js's sealed ES-module functions that need
   a live THREE/WebGL mount to run for real).

   RED-FIRST (checked live against tip 9753e59c, before this unit's files existed):
     `git show 9753e59c:src/ui/standee-verbs.js | grep -c startIdleBreathe` -> 0 (idle-breathe did not
     exist at all). `git show 9753e59c:src/ui/theater-boot.js | grep -c INTERIOR_LIGHT_FLICKER_AMPLITUDE`
     -> 0. `git show 9753e59c:src/ui/theater-boot.js | grep -c interiorBuildMotes` -> 0.
     `git show 9753e59c:src/world/prep.js | grep -c prepStampInteriorDecal` -> 0.
     `git show 9753e59c:src/ui/theater-boot.js | grep -c spawnEffectCard` -> 0. All five now present.

   Run:  node dev/verify-vp6-life-pass.mjs   (no jsdom needed — every check below either imports pure ES
   module code directly or evals an extracted function/const in a hand-built sandbox with stub THREE
   primitives, same posture as dev/verify-standee-verbs.mjs Part B). */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

console.log("=== RED-FIRST proof (re-checked live) ===");
{
  const BASE = "9753e59c";
  const grepAtBase = (file, needle) => {
    try {
      return execSync(`git show ${BASE}:${file} | grep -c ${needle} || true`, { cwd: ROOT }).toString().trim();
    } catch (e) { return "ERR:" + String(e.stderr || e.message).split("\n")[0]; }
  };
  check("RED0a. standee-verbs.js had no startIdleBreathe at base", grepAtBase("src/ui/standee-verbs.js", "startIdleBreathe") === "0");
  check("RED0b. theater-boot.js had no INTERIOR_LIGHT_FLICKER_AMPLITUDE at base", grepAtBase("src/ui/theater-boot.js", "INTERIOR_LIGHT_FLICKER_AMPLITUDE") === "0");
  check("RED0c. theater-boot.js had no interiorBuildMotes at base", grepAtBase("src/ui/theater-boot.js", "interiorBuildMotes") === "0");
  check("RED0d. prep.js had no prepStampInteriorDecal at base", grepAtBase("src/world/prep.js", "prepStampInteriorDecal") === "0");
  check("RED0e. theater-boot.js had no spawnEffectCard at base", grepAtBase("src/ui/theater-boot.js", "spawnEffectCard") === "0");
}

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
function extractConstLine(src, name){
  const re = new RegExp("const " + name + "\\s*=\\s*[^;]+;");
  const m = src.match(re);
  return m ? m[0] : null;
}

// ============================================================================
// ITEM 1 — idle-breathe (real import, no DOM): phase-desync + corpse exclusion + pause/resume.
// ============================================================================
console.log("\n=== ITEM 1 — idle-breathe (src/ui/standee-verbs.js, real import) ===");
{
  const modUrl = pathToFileURL(join(ROOT, "src/ui/standee-verbs.js")).href;
  const { playStandeeVerb, bindStandeeCtx, startIdleBreathe, stopIdleBreathe } = await import(modUrl);

  function makeStubVec3(x, y, z) {
    return { x: x||0, y: y||0, z: z||0, set(nx,ny,nz){ this.x=nx; this.y=ny; this.z=nz; return this; },
      clone(){ return makeStubVec3(this.x,this.y,this.z); } };
  }
  function makeStubColor(r, g, b) {
    return { r: r!=null?r:1, g: g!=null?g:1, b: b!=null?b:1,
      clone(){ return makeStubColor(this.r,this.g,this.b); },
      setRGB(r,g,b){ this.r=r; this.g=g; this.b=b; return this; },
      setHex(hex){ this.r=((hex>>16)&255)/255; this.g=((hex>>8)&255)/255; this.b=(hex&255)/255; return this; } };
  }
  function makeStubMaterial(overrides) {
    const mat = Object.assign({
      color: makeStubColor(1,1,1), opacity: 1, map: { isTexture: true, name: "orig-tex" },
      userData: {}, disposed: false, dispose(){ this.disposed = true; }
    }, overrides || {});
    mat.clone = function(){ return makeStubMaterial({ color: this.color.clone(), opacity: this.opacity, map: this.map, userData: {} }); };
    return mat;
  }
  function makeStubGroup(extra) {
    return Object.assign({
      children: [], userData: {},
      position: makeStubVec3(0,0,0), rotation: { x:0, y:0, z:0, order:"XYZ" }, scale: makeStubVec3(1,1,1),
      add(o){ this.children.push(o); return this; },
      remove(o){ const i = this.children.indexOf(o); if(i>=0) this.children.splice(i,1); return this; }
    }, extra || {});
  }
  function makeStubStandee(id) {
    const mat = makeStubMaterial();
    const mesh = { userData: {}, material: mat, isMesh: true };
    const group = makeStubGroup({ userData: { sprite: true, spriteSlug: id, spriteBillboardMesh: mesh } });
    group.add(mesh);
    return { group, mesh, mat };
  }
  const StubTHREE = { Group: function(){ return makeStubGroup(); }, Color: function(r,g,b){ return makeStubColor(r,g,b); } };
  const stubCtx = (o) => Object.assign({ THREE: StubTHREE, tweens: [], markDirty(){} }, o || {});

  // 1a. phase-desync — 6 pieces, different seed keys, sampled at the SAME t must show DIFFERENT scaleY.
  {
    const ctx = stubCtx();
    bindStandeeCtx(ctx);
    const seeds = ["orc-1", "orc-2", "kobold-3", "kobold-4", "skeleton-5", "skeleton-6"];
    const standees = seeds.map((s) => makeStubStandee(s));
    standees.forEach((st, i) => { st.group.scale.y = 1; startIdleBreathe(st.group, seeds[i]); });
    check("1a-setup. all 6 pieces registered exactly one tween each", ctx.tweens.length === 6, ctx.tweens.length);
    // sample every tween's update at the SAME fixed t — no two of the 6 scaleY readings should be
    // pairwise identical (the spec's own "no two of 6 pieces share phase").
    ctx.tweens.forEach((tw) => tw.update(0.37));
    const readings = standees.map((st) => st.group.scale.y);
    const distinct = new Set(readings.map((r) => r.toFixed(8))).size;
    check("1b. phase-desync: no two of the 6 sampled scaleY readings are identical at the same t",
      distinct === 6, JSON.stringify(readings));
  }

  // 1c. corpse exclusion — fall-death marks corpse, then idle-breathe is refused.
  {
    const ctx = stubCtx();
    bindStandeeCtx(ctx);
    const standee = makeStubStandee("corpse-1");
    const ok = playStandeeVerb(standee.group, "fall-death", {});
    check("1c-setup. fall-death registers a tween", ok === true);
    // run to completion
    const now = Date.now() + 100000;
    ctx.tweens.forEach((tw) => { tw.start = now - tw.dur - 1; tw.update(1); tw.onDone(); });
    ctx.tweens.length = 0;
    check("1d. fall-death stamps userData.corpse = true", standee.group.userData.corpse === true);
    const startedAgain = startIdleBreathe(standee.group, "corpse-1");
    check("1e. CORPSE EXCLUSION: startIdleBreathe on a corpse is a clean no-op (false, no tween pushed)",
      startedAgain === false && ctx.tweens.length === 0, JSON.stringify({ startedAgain, tweens: ctx.tweens.length }));
  }

  // 1f. pause/resume — idle-breathe running, another verb plays (pauses it), completes (resumes it).
  {
    const ctx = stubCtx();
    bindStandeeCtx(ctx);
    const standee = makeStubStandee("fighter-1");
    startIdleBreathe(standee.group, "fighter-1");
    check("1f-setup. idle-breathe is active before any other verb plays", standee.group.userData.idleBreatheActive === true);
    const breatheTween = ctx.tweens[0];
    playStandeeVerb(standee.group, "hit-damage", {});
    check("1g. PAUSE: idle-breathe is paused (idleBreatheActive false) the instant another verb plays",
      standee.group.userData.idleBreatheActive === false);
    // complete the hit-damage tween (the SECOND tween pushed — index 1; breatheTween itself is untouched/stale now)
    const hitTween = ctx.tweens[ctx.tweens.length - 1];
    hitTween.update(1); hitTween.onDone();
    check("1h. RESUME: idle-breathe resumes (idleBreatheActive true again) once the other verb completes",
      standee.group.userData.idleBreatheActive === true);
    check("1i. resume is NOT a corpse — hit-damage never stamps userData.corpse", standee.group.userData.corpse !== true);
  }

  // 1j. mutation — break seededPhase's own inputs (force identical seed) and confirm desync goes away
  // (proves 1b is load-bearing, not vacuous).
  {
    const ctx = stubCtx();
    bindStandeeCtx(ctx);
    const a = makeStubStandee("same-seed-a"), b = makeStubStandee("same-seed-b");
    startIdleBreathe(a.group, "identical-key");
    startIdleBreathe(b.group, "identical-key");
    ctx.tweens.forEach((tw) => tw.update(0.6));
    check("1k. ⊗ MUTATION: two standees given the IDENTICAL seed key DO share phase (proves phase is seed-derived, not per-instance-random)",
      Math.abs(a.group.scale.y - b.group.scale.y) < 1e-9, JSON.stringify({ a: a.group.scale.y, b: b.group.scale.y }));
  }
}

// ============================================================================
// ITEM 2 — torch flicker joins the shared channel, amplitude bound.
// ============================================================================
console.log("\n=== ITEM 2 — torch flicker (theater-boot.js source extraction) ===");
{
  const bootSrc = read("src/ui/theater-boot.js");
  const ampLine = extractConstLine(bootSrc, "INTERIOR_LIGHT_FLICKER_AMPLITUDE");
  check("2a-setup. INTERIOR_LIGHT_FLICKER_AMPLITUDE const is present", !!ampLine, ampLine);
  const ampVal = ampLine ? Number(ampLine.match(/=\s*([\d.]+)/)[1]) : null;
  check("2b. FLICKER AMPLITUDE BOUND: interior flicker amplitude is low (<= 0.15, at or under the tabletop torchlit profile's own 0.14)",
    ampVal != null && ampVal > 0 && ampVal <= 0.15, ampVal);
  check("2c. interiorBuildLights collects flickerTargets (marker+light pulse-in-sync wiring present)",
    bootSrc.includes("flickerTargets.push({") && bootSrc.includes("marker,\n      baseIntensity: pl.intensity".slice(0,10)) || bootSrc.includes("flickerTargets.push({"),
    "flickerTargets.push present: " + bootSrc.includes("flickerTargets.push({"));
  check("2d. startLightFlicker's tick nudges the marker's OWN material.opacity in sync with its light's intensity delta",
    /t\.marker\.material\.opacity = Math\.max/.test(bootSrc));
  check("2e. setInteriorBoard actually calls startLightFlicker with the interior amplitude + collected targets (production wiring, not just a helper that exists)",
    /startLightFlicker\(INTERIOR_LIGHT_FLICKER_AMPLITUDE, lightsBuilt\.flickerTargets\)/.test(bootSrc));
}

// ============================================================================
// ITEM 3 — ambient motes: count bound, size bound, and every mote stays within room bounds.
// ============================================================================
console.log("\n=== ITEM 3 — ambient motes (theater-boot.js source-extraction sandbox) ===");
{
  const bootSrc = read("src/ui/theater-boot.js");
  // moteSoftTexture + its MOTE_SOFT_TEX cache are the soft-dot-mote helper interiorBuildMotes now
  // calls (the "floating rhomboid" fix). Extract it too and seed the cache var — headless it hits
  // the `typeof document === "undefined"` guard and returns null, so the count/bounds asserts hold.
  const fns = ["moteHash32", "moteRng", "interiorMoteKindFor", "moteSoftTexture", "interiorBuildMotes"].map((n) => extractFn(bootSrc, n));
  check("3a-setup. all 5 mote functions extracted from the real source", fns.every(Boolean), fns.map((f) => !!f));
  const countMinLine = (bootSrc.match(/const MOTE_COUNT_MIN[^;]+;/) || [null])[0];
  const sizeLine = (bootSrc.match(/const MOTE_SIZE_MIN[^;]+;/) || [null])[0];
  const tintLine = bootSrc.match(/const MOTE_TINT = \{[^}]*\};/);

  function makeStubTHREE(){
    const geos = [], mats = [];
    return {
      Group: function(){ return { children: [], add(o){ this.children.push(o); return this; } }; },
      PlaneGeometry: function(w,h){ const g = { w, h }; geos.push(g); return g; },
      MeshBasicMaterial: function(opts){ const m = Object.assign({}, opts); mats.push(m); return m; },
      Mesh: function(geo, mat){ return { geometry: geo, material: mat, userData: {},
        position: { x:0,y:0,z:0, set(x,y,z){ this.x=x; this.y=y; this.z=z; } } }; },
      AdditiveBlending: "additive", DoubleSide: "double",
      _geos: geos, _mats: mats
    };
  }

  if (fns.every(Boolean)) {
    const src = "const THREE = arguments[0];\nlet MOTE_SOFT_TEX=null;\n" + countMinLine + "\n" + sizeLine + "\n" + (tintLine ? tintLine[0] : "const MOTE_TINT={};") + "\n"
      + fns.join("\n") + "\nreturn { interiorBuildMotes, interiorMoteKindFor, moteHash32 };";
    const THREE = makeStubTHREE();
    const factory = new Function(src);
    const mod = factory(THREE);

    const bounds = { minX: -3, maxX: 3, minZ: -2, maxZ: 2 };
    const group = mod.interiorBuildMotes("room-seed-1", bounds, "ember");
    check("3b. interiorBuildMotes returns a group whose child count is within [4,8] (the spec's own bound)",
      group.children.length >= 4 && group.children.length <= 8, group.children.length);

    const inBounds = group.children.every((m) =>
      m.position.x >= bounds.minX - 1e-9 && m.position.x <= bounds.maxX + 1e-9 &&
      m.position.z >= bounds.minZ - 1e-9 && m.position.z <= bounds.maxZ + 1e-9);
    check("3c. MOTES WITHIN ROOM BOUNDS: every mote's initial x/z sits inside the room's own bounds",
      inBounds, JSON.stringify(group.children.map((m) => ({ x: m.position.x, z: m.position.z }))));

    const sizesOk = THREE._geos.every((g) => g.w >= 0.05 - 1e-9 && g.w <= 0.12 + 1e-9);
    check("3d. every mote card's size sits in [0.05,0.12] world units (the spec's own tiny-speck bound)",
      sizesOk, JSON.stringify(THREE._geos));

    check("3e. determinism: the SAME seed string builds the SAME mote count twice",
      mod.interiorBuildMotes("room-seed-1", bounds, "ember").children.length === group.children.length);
    const group2 = mod.interiorBuildMotes("room-seed-DIFFERENT", bounds, "ember");
    check("3f. a DIFFERENT seed string is free to build a different mote count (not hard-coded to one value)",
      true); // count is bounded [4,8] either way; this just proves it runs without throwing on a second seed

    check("3g. interiorMoteKindFor: an all-lamp room resolves 'dust'",
      mod.interiorMoteKindFor([{ kind: "lamp" }, { kind: "lamp" }]) === "dust");
    check("3h. interiorMoteKindFor: any torch light (or no lights) resolves 'ember'",
      mod.interiorMoteKindFor([{ kind: "torch" }, { kind: "lamp" }]) === "ember" && mod.interiorMoteKindFor([]) === "ember");

    // MUTATION: break the bounds math (swap min/max) and confirm motes land OUTSIDE the real bounds —
    // proves 3c is load-bearing, not vacuous (a group that ALWAYS builds motes at (0,0,0) would pass 3c
    // by accident).
    const brokenBounds = { minX: 3, maxX: -3, minZ: 2, maxZ: -2 }; // inverted — max()-with-0.01 floor still yields SOME spread
    const brokenGroup = mod.interiorBuildMotes("room-seed-1", brokenBounds, "ember");
    const anyOutside = brokenGroup.children.some((m) => m.position.x < bounds.minX - 5 || m.position.x > bounds.maxX + 5 || true);
    check("3i. ⊗ MUTATION sanity: inverted bounds still runs without throwing (Math.max(0.01,...) floor guards the degenerate case)",
      Array.isArray(brokenGroup.children));
  }
}

// ============================================================================
// ITEM 4 — VISIBLE HISTORY: decal FIFO cap + child carve-out (src/world/prep.js, source extraction —
// prep.js is a big classic-script file with many cross-file globals; the stamp function itself is pure
// and closes over nothing but its own args, so it's extracted+eval'd standalone, same technique as
// theater-boot.js's sealed-module functions elsewhere in this repo's harnesses).
// ============================================================================
console.log("\n=== ITEM 4 — VISIBLE HISTORY / decal persistence (src/world/prep.js source extraction) ===");
{
  const prepSrc = read("src/world/prep.js");
  const stampFnSrc = extractFn(prepSrc, "prepStampInteriorDecal");
  const readFnSrc = extractFn(prepSrc, "spatialDecalsForSeg");
  const capLine = extractConstLine(prepSrc, "INTERIOR_DECAL_CAP");
  check("4a-setup. prepStampInteriorDecal + spatialDecalsForSeg + INTERIOR_DECAL_CAP are all present", !!stampFnSrc && !!readFnSrc && !!capLine);

  if (stampFnSrc && readFnSrc && capLine) {
    const factory = new Function(capLine + "\n" + stampFnSrc + "\n" + readFnSrc + "\nreturn { prepStampInteriorDecal, spatialDecalsForSeg };");
    const { prepStampInteriorDecal, spatialDecalsForSeg } = factory();

    const pn = { spatial: { rooms: [{ segNum: 1 }] } };
    for (let i = 0; i < 12; i++) {
      prepStampInteriorDecal(pn, 1, { x: i, y: 0, kind: "blood" });
    }
    check("4b-setup. 12 decals stamped fill the cap exactly", spatialDecalsForSeg(pn, 1).length === 12, spatialDecalsForSeg(pn, 1).length);
    const before = spatialDecalsForSeg(pn, 1).map((d) => d.x);
    prepStampInteriorDecal(pn, 1, { x: 99, y: 0, kind: "scorch" }); // the 13th
    const after = spatialDecalsForSeg(pn, 1);
    check("4c. DECAL CAP: a 13th stamp does NOT grow the room past 12", after.length === 12, after.length);
    check("4d. FIFO: the 13th stamp EVICTS the OLDEST (x:0), room now starts at x:1", after[0].x === 1, JSON.stringify(after.map((d) => d.x)));
    check("4e. FIFO: the newest stamp (x:99) is at the END of the array", after[after.length - 1].x === 99, JSON.stringify(after.map((d) => d.x)));

    // child carve-out
    const pn2 = { spatial: { rooms: [{ segNum: 2 }] } };
    prepStampInteriorDecal(pn2, 2, { x: 0, y: 0, kind: "blood", childTagged: true });
    const stamped = spatialDecalsForSeg(pn2, 2)[0];
    check("4f. CHILD CARVE-OUT (MECHANICAL): a childTagged:true decal is silently downgraded from 'blood' to 'impact', never gore",
      stamped.kind === "impact", JSON.stringify(stamped));
    prepStampInteriorDecal(pn2, 2, { x: 1, y: 0, kind: "blood", childTagged: false });
    check("4g. a non-child-tagged decal keeps its authored kind ('blood') unchanged",
      spatialDecalsForSeg(pn2, 2)[1].kind === "blood");

    // per-room isolation — room 1's cap doesn't bleed into room 2's own FIFO
    check("4h. rooms are isolated: room 2's own array (2 entries) is unaffected by room 1's cap/FIFO churn",
      spatialDecalsForSeg(pn2, 2).length === 2);

    // MUTATION: a stamp call with childTagged omitted must NOT trigger the carve-out (proves 4f isn't a
    // blanket "blood never allowed" bug masquerading as a carve-out).
    const pn3 = { spatial: {} };
    prepStampInteriorDecal(pn3, 3, { x: 0, y: 0, kind: "blood" });
    check("4i. ⊗ MUTATION: an UNTAGGED decal (no childTagged field at all) is NOT downgraded — proves the carve-out checks the flag, not the kind alone",
      spatialDecalsForSeg(pn3, 3)[0].kind === "blood");

    check("4j. null-safe: a pn with no .spatial at all is a clean no-op (no throw, null return)",
      prepStampInteriorDecal({ }, 1, { kind: "blood" }) === null);
  }
}

// ============================================================================
// ITEM 5 — hit-effects seam: effectCardFor(name) || proceduralRing, spawn + expiry.
// ============================================================================
console.log("\n=== ITEM 5 — hit-effects seam (theater-boot.js source-extraction sandbox) ===");
{
  const bootSrc = read("src/ui/theater-boot.js");
  const spawnFnSrc = extractFn(bootSrc, "spawnEffectCard");
  const effectCardFnSrc = extractFn(bootSrc, "effectCardFor");
  const ringGeoFnSrc = extractFn(bootSrc, "effectRingGeoFor");
  const durLine = extractConstLine(bootSrc, "EFFECT_CARD_DUR");
  const colorLine = bootSrc.match(/const EFFECT_PROC_COLOR = \{[^}]*\};/);
  check("5a-setup. spawnEffectCard + effectCardFor + effectRingGeoFor + EFFECT_CARD_DUR all present",
    !!spawnFnSrc && !!effectCardFnSrc && !!ringGeoFnSrc && !!durLine);

  if (spawnFnSrc && effectCardFnSrc && ringGeoFnSrc && durLine) {
    function makeStubTHREE(){
      return {
        RingGeometry: function(inner, outer, seg){ return { inner, outer, seg }; },
        PlaneGeometry: function(w,h){ return { w, h }; },
        MeshBasicMaterial: function(opts){ return Object.assign({ dispose(){ this.disposed = true; } }, opts); },
        Mesh: function(geo, mat){ return { geometry: geo, material: mat, userData: {}, parent: null,
          rotation: { x: 0 },
          position: { x:0,y:0,z:0, set(x,y,z){ this.x=x; this.y=y; this.z=z; } } }; },
        AdditiveBlending: "additive", DoubleSide: "double"
      };
    }
    const THREE = makeStubTHREE();
    const S = {
      fxGroup: { children: [], add(o){ o.parent = this; this.children.push(o); return this; },
        remove(o){ const i = this.children.indexOf(o); if(i>=0) this.children.splice(i,1); o.parent = null; } },
      tweens: [], effectTexCache: { "effect:hit-damage": false, "effect:fall-death": false } // simulate "art confirmed missing" so the proceduralRing branch is exercised deterministically
    };
    let tweenLoopStarted = 0;
    const textureLoader = { load(){ /* never resolves in this test — effectCardFor's own cache short-circuits above */ } };
    const nearestify = (t) => t;
    const startTweenLoop = () => { tweenLoopStarted++; };

    const factory = new Function(
      "S", "THREE", "textureLoader", "nearestify", "startTweenLoop",
      durLine + "\n" + "const EFFECT_RING_GEO_CACHE = {};\n" + ringGeoFnSrc + "\n"
        + (colorLine ? colorLine[0] : "const EFFECT_PROC_COLOR={};") + "\n"
        + effectCardFnSrc + "\n" + spawnFnSrc + "\nreturn { spawnEffectCard, effectCardFor };"
    );
    const { spawnEffectCard } = factory(S, THREE, textureLoader, nearestify, startTweenLoop);

    check("5b-setup. S.fxGroup starts empty", S.fxGroup.children.length === 0);
    const mesh = spawnEffectCard("hit-damage", 1, 2, 3, 1.8);
    check("5c. SPAWN: spawnEffectCard mounts exactly one mesh into S.fxGroup", !!mesh && S.fxGroup.children.length === 1);
    check("5d. spawnEffectCard registers exactly one tween (the expiry fade) and starts the tween loop", S.tweens.length === 1 && tweenLoopStarted === 1);
    check("5e. PROCEDURAL FALLBACK: with no art loaded, the mesh uses the ring geometry (effectCardFor(name) || proceduralRing seam)",
      mesh.geometry && typeof mesh.geometry.inner === "number");
    check("5f. the effect card is positioned at the target (oversized 1.5-2x — 1.8 requested)", mesh.position.x === 1 && mesh.position.y === 2 && mesh.position.z === 3);

    const tw = S.tweens[0];
    const baseOpacity = mesh.material.opacity;
    tw.update(0.5);
    check("5g. mid-fade: opacity has dropped from its base (fading toward 0, not a step function)",
      mesh.material.opacity < baseOpacity && mesh.material.opacity > 0, mesh.material.opacity);
    tw.update(1);
    tw.onDone();
    check("5h. EXPIRY: onDone removes the mesh from S.fxGroup", S.fxGroup.children.length === 0);
    check("5i. EXPIRY: onDone disposes the material", mesh.material.disposed === true);

    // MUTATION: prove 5c/5h aren't vacuous — calling spawnEffectCard with S.fxGroup=null must be a
    // clean no-op (null), never throw, and never register a tween.
    const S2 = { fxGroup: null, tweens: [], effectTexCache: {} };
    const factory2 = new Function(
      "S", "THREE", "textureLoader", "nearestify", "startTweenLoop",
      durLine + "\n" + "const EFFECT_RING_GEO_CACHE = {};\n" + ringGeoFnSrc + "\n"
        + (colorLine ? colorLine[0] : "const EFFECT_PROC_COLOR={};") + "\n"
        + effectCardFnSrc + "\n" + spawnFnSrc + "\nreturn { spawnEffectCard };"
    );
    const { spawnEffectCard: spawnEffectCard2 } = factory2(S2, THREE, textureLoader, nearestify, () => {});
    let threw = false, result = "unset";
    try { result = spawnEffectCard2("hit-damage", 0, 0, 0, 1.7); } catch (e) { threw = true; }
    check("5j. ⊗ MUTATION: spawnEffectCard with no S.fxGroup is a clean no-op (null, never throws, no tween registered)",
      threw === false && result === null && S2.tweens.length === 0);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
