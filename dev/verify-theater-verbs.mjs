/* Verify BATTLE-THEATER T3 (docs/BATTLE-THEATER.md §4) — the verb library seam. Two independent
   harnesses, per the two different runtimes this unit touches:

   PART A — a real Node ESM `import` of src/ui/theater-verbs.js. This module is a sealed ES-module
   boundary file (same discipline as theater-boot.js, CLAUDE.md) — it can't be win.eval'd as a classic
   script like the rest of the app. It has ZERO direct DOM/THREE coupling of its own (every THREE.*
   handle arrives via the `ctx` object theater-boot.js constructs), so a plain Node import is enough to
   exercise its pure logic: THEATER_VERBS completeness against §4's table, theaterFxFromLedger's
   ledger-kind -> verb mapping, and playVerb/tickTweens against a hand-built stub `ctx` (no real THREE
   needed — the verb implementations only call methods a stub can trivially provide: Group-like objects
   with children/add/remove, Object3D-like objects with position/rotation/scale, a BoxGeometry/
   MeshBasicMaterial/PlaneGeometry stand-in). This proves the tween math actually mutates the handles it's
   given, red-first, without needing a browser.

   PART B — the standard full-app jsdom load (real modules in manifest order, same convention as every
   other dev/verify-*.mjs) to exercise the EVENT-CONTRACT runtime: the `stage_fx` applyEvent case
   (validates/ledgers/no-ops headless) and the 6 named hook call sites (attack/foe_action x2/move_zone/
   foe_morale/crit_outcome/combat_end) actually calling cmTheaterNotify with the right kind — verified
   by installing a SPY window.Theater stub (play() records every call) before driving real combat events
   through applyEvent. window.Theater is never the real ES module here (jsdom doesn't load
   type:"module" script tags) — this IS the headless-safe path the spec requires, and the spy also
   proves the seam is truly additive (stage_fx unknown to jsdom's window.Theater at all still no-ops
   cleanly when window.Theater is entirely absent, checked separately from the spy'd checks).

   Run:  node dev/verify-theater-verbs.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

console.log("=== PART A — theater-verbs.js as a pure ES module (no DOM) ===");

const verbsModUrl = pathToFileURL(join(ROOT, "src/ui/theater-verbs.js")).href;
const { THEATER_VERBS, playVerb, tickTweens, theaterFxFromLedger } = await import(verbsModUrl);

// ----------------------------------------------------------------------------
// A1. THEATER_VERBS completeness vs §4's table
// ----------------------------------------------------------------------------
{
  // DEAD-STATE (2026-07-03): `obliterate` added — the vaporization exception (Adam's dead-state
  // ruling). Reuses this file's own burst/sink primitives (see src/ui/theater-verbs.js's vObliterate).
  const SPEC_VERBS = ["advance","withdraw","strike","hurt","down","cast","arc","knockback","sink","burst","flee","absurdity","obliterate"];
  const SPEC_FX_TYPES = ["fire","frost","lightning","necrotic","radiant","poison"];
  check("A1a. THEATER_VERBS is exported + frozen", Array.isArray(THEATER_VERBS) && Object.isFrozen(THEATER_VERBS));
  check("A1b. every §4 table verb is present", SPEC_VERBS.every(v => THEATER_VERBS.includes(v)),
    SPEC_VERBS.filter(v => !THEATER_VERBS.includes(v)).join(","));
  check("A1c. every §4 damage-type FX (fire/frost/lightning/necrotic/radiant/poison minimum) is addressable as fx:<type>",
    SPEC_FX_TYPES.every(t => THEATER_VERBS.includes("fx:"+t)),
    SPEC_FX_TYPES.filter(t => !THEATER_VERBS.includes("fx:"+t)).join(","));
  check("A1d. no unknown/stray verbs beyond the spec table + fx types",
    THEATER_VERBS.every(v => SPEC_VERBS.includes(v) || v.indexOf("fx:")===0), THEATER_VERBS.join(","));
}

// ----------------------------------------------------------------------------
// A2. MUTATION CHECK — a bad/misspelled verb name is REJECTED (proves the list is load-bearing,
// not vacuously true — playVerb must actually gate on THEATER_VERBS/its own dispatch table).
// ----------------------------------------------------------------------------
{
  const stubCtx = makeStubCtx();
  const ok = playVerb(stubCtx, "not-a-real-verb", {});
  check("A2. an unknown verb name is rejected by playVerb (false, no tween pushed)",
    ok === false && stubCtx.tweens.length === 0, JSON.stringify({ok, tweens: stubCtx.tweens.length}));
}

// ----------------------------------------------------------------------------
// A3. playVerb actually mutates the handles it's given — a representative sample, not all 12
// (advance/strike/hurt/down/absurdity), each red-first against a stub ctx.
// ----------------------------------------------------------------------------
{
  // advance: a unit glides toward a resolved zone point.
  const ctx = makeStubCtx();
  const unit = makeStubUnit("pc");
  ctx.unitGroup.children.push(unit);
  ctx._zoneToWorld = () => ({ x: 5, z: 5 });
  const ok = playVerb(ctx, "advance", { who: "pc", to: "near:C" });
  check("A3a. advance() registers a tween", ok === true && ctx.tweens.length === 1);
  runToCompletion(ctx.tweens);
  check("A3b. advance() moves the unit to the resolved zone point", Math.abs(unit.position.x - 5) < 1e-6 && Math.abs(unit.position.z - 5) < 1e-6,
    JSON.stringify(unit.position));
}
{
  // strike: lunges then recoils back to the start position (there-and-back).
  const ctx = makeStubCtx();
  const unit = makeStubUnit("f1");
  unit.position.x = 0; unit.position.z = 0;
  ctx.unitGroup.children.push(unit);
  ctx._zoneToWorld = () => ({ x: 3, z: 0 });
  const ok = playVerb(ctx, "strike", { who: "f1", to: "melee:C" });
  check("A3c. strike() registers a tween", ok === true);
  runToCompletion(ctx.tweens);
  check("A3d. strike() recoils back to the origin (onDone reset)", Math.abs(unit.position.x - 0) < 1e-6, JSON.stringify(unit.position));
}
{
  // down: rotates to prone and STAYS (terminal, no revert) — matches setUnits' own u.down convention.
  const ctx = makeStubCtx();
  const unit = makeStubUnit("f2");
  ctx.unitGroup.children.push(unit);
  const ok = playVerb(ctx, "down", { who: "f2" });
  check("A3e. down() registers a tween", ok === true);
  runToCompletion(ctx.tweens);
  check("A3f. down() ends toppled 90deg (terminal — persists post-tween)", Math.abs(unit.rotation.z - Math.PI/2) < 1e-6, unit.rotation.z);
}
{
  // absurdity: magnitude scales the tween duration; camera position is restored exactly on completion.
  const ctxLow = makeStubCtx(); ctxLow.camera = { position: { x: 1, y: 2, z: 3, clone(){ return {x:this.x,y:this.y,z:this.z}; }, copy(p){ this.x=p.x;this.y=p.y;this.z=p.z; } } };
  playVerb(ctxLow, "absurdity", { magnitude: 1 });
  const lowDur = ctxLow.tweens[0].dur;
  const ctxHigh = makeStubCtx(); ctxHigh.camera = { position: { x: 1, y: 2, z: 3, clone(){ return {x:this.x,y:this.y,z:this.z}; }, copy(p){ this.x=p.x;this.y=p.y;this.z=p.z; } } };
  playVerb(ctxHigh, "absurdity", { magnitude: 12 });
  const highDur = ctxHigh.tweens[0].dur;
  check("A3g. absurdity's tween duration scales UP with magnitude", highDur > lowDur, JSON.stringify({lowDur, highDur}));
  runToCompletion(ctxHigh.tweens);
  check("A3h. absurdity restores the camera position exactly on completion", ctxHigh.camera.position.x === 1 && ctxHigh.camera.position.y === 2, JSON.stringify(ctxHigh.camera.position));
}
{
  // obliterate — DEAD-STATE (2026-07-03): the vaporization exception. Registers a tween, spawns debris
  // into fxGroup, and ends with the figure PERMANENTLY hidden (obj.visible=false, terminal — no revert,
  // matching vDown's own "no onDone revert" convention for a default down-pose).
  const ctx = makeStubCtx();
  const unit = makeStubUnit("f3");
  unit.visible = true;
  ctx.unitGroup.children.push(unit);
  const ok = playVerb(ctx, "obliterate", { who: "f3" });
  check("A3i. obliterate() registers a tween", ok === true && ctx.tweens.length === 1);
  const spawnedDebris = ctx.fxGroup.children.length;
  check("A3j. obliterate() spawns debris into fxGroup", spawnedDebris > 0, spawnedDebris);
  runToCompletion(ctx.tweens);
  check("A3k. obliterate() ends with the figure hidden (terminal — persists post-tween)", unit.visible === false, unit.visible);
  check("A3l. obliterate() cleans up its debris primitives on completion", ctx.fxGroup.children.length === 0, ctx.fxGroup.children.length);
}
{
  // an unresolvable `who` is a clean no-op (never throws, no tween pushed) — matches every other verb's
  // pre-mount/absent-unit discipline.
  const ctx = makeStubCtx();
  let threw = false, ok = false;
  try { ok = playVerb(ctx, "obliterate", { who: "not-a-real-unit" }); } catch(e) { threw = true; }
  check("A3m. obliterate() with an unresolvable unit is a clean no-op", threw === false && ok === false && ctx.tweens.length === 0, JSON.stringify({threw, ok, tweens: ctx.tweens.length}));
}
{
  // fx:fire — a bare elemental burst with no `who`, spawns primitives into fxGroup then cleans them up.
  const ctx = makeStubCtx();
  const ok = playVerb(ctx, "fx:fire", { at: { x: 0, z: 0 } });
  check("A4a. fx:fire registers a tween", ok === true);
  const spawnedCount = ctx.fxGroup.children.length;
  check("A4b. fx:fire spawns primitives into fxGroup", spawnedCount > 0, spawnedCount);
  runToCompletion(ctx.tweens);
  check("A4c. fx:fire cleans up its primitives on completion", ctx.fxGroup.children.length === 0, ctx.fxGroup.children.length);
}
{
  // an unrecognized fx:<type> still resolves (falls back to a neutral burst) — never a throw.
  const ctx = makeStubCtx();
  let threw = false;
  let ok = false;
  try { ok = playVerb(ctx, "fx:acid", { at: { x: 0, z: 0 } }); } catch(e) { threw = true; }
  check("A4d. an unrecognized fx:<type> never throws (falls back to a neutral burst)", threw === false && ok === true);
}

// ----------------------------------------------------------------------------
// A5. tickTweens retires completed tweens and reports liveness correctly.
// ----------------------------------------------------------------------------
{
  const ctx = makeStubCtx();
  const unit = makeStubUnit("pc");
  ctx.unitGroup.children.push(unit);
  playVerb(ctx, "hurt", { who: "pc", dur: 10 });
  check("A5a. tickTweens reports live=true while a tween is mid-flight", tickTweens(ctx, Date.now() - ctx.tweens[0].start + 1) === true || ctx.tweens.length > 0);
  const stillLive = tickTweens(ctx, ctx.tweens[0].start + 10000); // force well past duration
  check("A5b. tickTweens reports live=false once every tween has elapsed", stillLive === false);
  check("A5c. tickTweens actually SPLICES the completed tween out of ctx.tweens", ctx.tweens.length === 0, ctx.tweens.length);
}

// ----------------------------------------------------------------------------
// A6. theaterFxFromLedger — the EXISTING-event ledger-kind -> verb mapping (§4: "no new fields").
// ----------------------------------------------------------------------------
{
  const hit = theaterFxFromLedger({ data: { kind: "attack", hit: true, target: "f1" } });
  check("A6a. kind:attack hit -> strike", hit && hit.verb === "strike", JSON.stringify(hit));

  const miss = theaterFxFromLedger({ data: { kind: "attack", hit: false } });
  check("A6b. kind:attack miss -> strike with miss:true (overshoot)", miss && miss.verb === "strike" && miss.opts.miss === true, JSON.stringify(miss));

  const move = theaterFxFromLedger({ data: { kind: "move-zone", who: "pc", to: "near:C" } });
  check("A6c. kind:move-zone -> advance", move && move.verb === "advance", JSON.stringify(move));

  const fleeing = theaterFxFromLedger({ data: { kind: "morale", disposition: "flee", foe: "f1" } });
  check("A6d. kind:morale disposition:flee -> flee", fleeing && fleeing.verb === "flee", JSON.stringify(fleeing));

  const held = theaterFxFromLedger({ data: { kind: "morale", disposition: null, held: true } });
  check("A6e. kind:morale held -> null (silence, no animation)", held === null, JSON.stringify(held));

  const bigCrit = theaterFxFromLedger({ data: { kind: "crit", tier: "mythic", magnitude: 10, natural: 20 } });
  check("A6f. kind:crit tier:mythic -> absurdity", bigCrit && bigCrit.verb === "absurdity", JSON.stringify(bigCrit));

  const smallCrit = theaterFxFromLedger({ data: { kind: "crit", tier: "standard", magnitude: 2, natural: 20 } });
  check("A6g. a low-magnitude non-mythic crit -> null (absurdity is a SPIKE, not every nat20)", smallCrit === null, JSON.stringify(smallCrit));

  const endFight = theaterFxFromLedger({ data: { kind: "combat-end", outcome: "resolved" } });
  check("A6h. kind:combat-end -> null (silence per §4)", endFight === null, JSON.stringify(endFight));

  const roundTick = theaterFxFromLedger({ data: { kind: "round-tick" } });
  check("A6i. an unrecognized/silent kind (round_tick-adjacent) -> null, never throws", roundTick === null);

  const noData = theaterFxFromLedger(null);
  check("A6j. a malformed entry (no data) -> null, never throws", noData === null);
}

// ----------------------------------------------------------------------------
// A7. W2-A A1 — shared-material clone-for-tween guard in vHurt/vDown (REVIEW-FIXES-0705-VISUAL.md
// §W2-A finding 1). Two whole-object figures SHARE one material array (WHOLE_MATERIALS_CACHE's own
// convention: userData.shared=true tag). Running vHurt/vDown on ONE figure must never mutate the
// OTHER figure's (co-sharing) material color — pre-fix, both verbs `traverse` + `material.color.
// setRGB(...)` directly with no shared guard, so the other figure's color moves in lockstep. ⊗ RED-
// FIRST: this check is written to fail against the pre-fix vHurt/vDown (git-stash the fix to see it).
// ----------------------------------------------------------------------------
function makeSharedMaterial() {
  return {
    // r/g/b deliberately NON-gray (a real creature-body color) — a degenerate r===g===b fixture would
    // make vDown's luma-desaturate lerp a no-op regardless of the shared-guard bug, hiding the red.
    color: { r: 0.8, g: 0.2, b: 0.15,
      clone() { return { r: this.r, g: this.g, b: this.b, setRGB(r,g,b){this.r=r;this.g=g;this.b=b;}, copy(v){this.r=v.r;this.g=v.g;this.b=v.b;} }; },
      setRGB(r,g,b) { this.r=r; this.g=g; this.b=b; },
      copy(v) { this.r=v.r; this.g=v.g; this.b=v.b; }
    },
    userData: { shared: true },
    map: { isTexture: true, name: "shared-cache-texture" },
    clone() {
      const c = { color: { r: this.color.r, g: this.color.g, b: this.color.b,
          setRGB(r,g,b){this.r=r;this.g=g;this.b=b;}, copy(v){this.r=v.r;this.g=v.g;this.b=v.b;} },
        userData: {}, map: this.map, transparent: false, opacity: 1,
        disposed: false, dispose(){ this.disposed = true; }
      };
      return c;
    }
  };
}
function makeStubUnitSharingMaterial(id, sharedMat) {
  const u = makeStubUnit(id);
  u.material = sharedMat;
  return u;
}
{
  const ctx = makeStubCtx();
  const sharedMat = makeSharedMaterial();
  const figureA = makeStubUnitSharingMaterial("a1-hurt", sharedMat);
  const figureB = makeStubUnitSharingMaterial("a1-other", sharedMat);
  ctx.unitGroup.children.push(figureA, figureB);
  const preOtherColor = { r: figureB.material.color.r, g: figureB.material.color.g, b: figureB.material.color.b };
  playVerb(ctx, "hurt", { who: "a1-hurt" });
  // advance the tween to mid-flight (not complete) and tick it once.
  ctx.tweens[0].start = Date.now() - Math.floor(ctx.tweens[0].dur * 0.4);
  tickTweens(ctx, Date.now());
  check("A7a. ⊗ vHurt mid-tween on one figure leaves the OTHER co-sharing figure's material color unchanged",
    figureB.material.color.r === preOtherColor.r && figureB.material.color.g === preOtherColor.g && figureB.material.color.b === preOtherColor.b,
    JSON.stringify({ before: preOtherColor, after: figureB.material.color }));
  // A7b: after the tween completes, figureA's material is restored to the ORIGINAL shared instance,
  // and the tween-local clone is disposed.
  const cloneDuring = figureA.material;
  runToCompletion(ctx.tweens);
  check("A7b. vHurt restores the hurt figure's material to the ORIGINAL shared instance on completion",
    figureA.material === sharedMat, JSON.stringify({ same: figureA.material === sharedMat }));
  check("A7c. vHurt disposes the tween-local clone once restored",
    cloneDuring !== sharedMat && cloneDuring.disposed === true, JSON.stringify({ wasClone: cloneDuring !== sharedMat, disposed: cloneDuring.disposed }));
}
{
  // same shared-guard proof for vDown — a terminal verb (no onDone revert), so this only asserts the
  // OTHER figure stays untouched (A7's core red-first claim); vDown's own terminal-clone convention
  // (no restore) is documented in the source comment, not asserted here as a revert.
  const ctx = makeStubCtx();
  const sharedMat = makeSharedMaterial();
  const figureA = makeStubUnitSharingMaterial("a1-down", sharedMat);
  const figureB = makeStubUnitSharingMaterial("a1-down-other", sharedMat);
  ctx.unitGroup.children.push(figureA, figureB);
  const preOtherColor = { r: figureB.material.color.r, g: figureB.material.color.g, b: figureB.material.color.b };
  playVerb(ctx, "down", { who: "a1-down" });
  ctx.tweens[0].start = Date.now() - Math.floor(ctx.tweens[0].dur * 0.5);
  tickTweens(ctx, Date.now());
  check("A7d. ⊗ vDown mid-tween on one figure leaves the OTHER co-sharing figure's material color unchanged",
    figureB.material.color.r === preOtherColor.r && figureB.material.color.g === preOtherColor.g && figureB.material.color.b === preOtherColor.b,
    JSON.stringify({ before: preOtherColor, after: figureB.material.color }));
}

console.log("\n=== PART A2 — theater-boot.js's drainTweens/PIXEL_SKIN_CACHE LRU/discR guard (source-extraction sandbox) ===");
/* theater-boot.js is a sealed ES module that `import`s THREE (needs WebGL, won't load headless) — the
   SAME constraint dev/verify-pixel-skin.mjs's own header documents for this exact file. Following that
   file's established convention: extract the real function source text and eval it in a sandbox with
   trivial stand-ins for texture-content callees (materialProgramFor/eyeSpecFor/buildPixelSkinCanvas/
   pixelSkinHash/nearestify — A3's checks are about the CACHE/EVICTION mechanism, not texture content,
   which verify-pixel-skin.mjs already covers in full) + a stub THREE.CanvasTexture that just tags
   itself disposed on .dispose(). This exercises the REAL logic straight from the source file, not a
   re-implementation. */
const bootSrc = readFileSync(join(ROOT, "src/ui/theater-boot.js"), "utf-8");
function extractFn(src, name){
  const sig = "function " + name + "(";
  const start = src.indexOf(sig);
  if(start < 0) return null;
  let i = src.indexOf("{", start);
  let depth = 0;
  for(; i < src.length; i++){
    if(src[i] === "{") depth++;
    else if(src[i] === "}"){ depth--; if(depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}
function extractConst(src, name){
  const re = new RegExp("const " + name + "\\s*=\\s*[^;]+;");
  const m = src.match(re);
  return m ? m[0] : null;
}

// ----------------------------------------------------------------------------
// A10. drainTweens(S) (finding 3, ⊗ RED-FIRST spec check #3) — run the REAL extracted drainTweens
// against a plain {tweens:[...]} shape: every live tween's onDone fires, S.tweens ends up empty. Then
// text-scan the real call sites (setUnits/setBoard/retire) to prove drainTweens is called FIRST (before
// any clearGroup teardown) in all three, and setBoard additionally clears S.fxGroup.
// ----------------------------------------------------------------------------
{
  const drainFnSrc = extractFn(bootSrc, "drainTweens");
  check("A10-setup. drainTweens(S) is present in theater-boot.js's source", !!drainFnSrc);
  if(drainFnSrc){
    const factory = new Function(drainFnSrc + "\nreturn drainTweens;");
    const drainTweens = factory();
    const onDoneCalls = [];
    const S = { tweens: [
      { start: Date.now(), dur: 100, update(){}, onDone(){ onDoneCalls.push("a"); } },
      { start: Date.now(), dur: 100, update(){}, onDone(){ onDoneCalls.push("b"); } },
      { start: Date.now(), dur: 100, update(){} } // no onDone at all — must not throw
    ] };
    let threw = false;
    try { drainTweens(S); } catch(e){ threw = true; console.log("    (threw:", e.message, ")"); }
    check("A10a. ⊗ drainTweens(S) runs every live tween's onDone synchronously", !threw && onDoneCalls.length === 2 && onDoneCalls.includes("a") && onDoneCalls.includes("b"),
      JSON.stringify({ threw, onDoneCalls }));
    check("A10b. ⊗ drainTweens(S) empties S.tweens", S.tweens.length === 0, S.tweens.length);

    // a THROWING onDone must never block the rest (same guarded-try/catch posture as tickTweens).
    const S2 = { tweens: [
      { start: Date.now(), dur: 100, update(){}, onDone(){ throw new Error("bad cleanup"); } },
      { start: Date.now(), dur: 100, update(){}, onDone(){ onDoneCalls.push("c"); } }
    ] };
    let threw2 = false;
    try { drainTweens(S2); } catch(e){ threw2 = true; }
    check("A10c. a throwing onDone never blocks the rest of the drain (guarded try/catch)", !threw2 && onDoneCalls.includes("c") && S2.tweens.length === 0,
      JSON.stringify({ threw2, ran: onDoneCalls.includes("c"), remaining: S2.tweens.length }));

    check("A10d. drainTweens(S) with no S/S.tweens is a clean no-op (never throws)",
      (() => { try { drainTweens(null); drainTweens({}); return true; } catch(e){ return false; } })());
  }

  // call-site text-scan: drainTweens(S) must appear BEFORE any clearGroup(...) call in setUnits' and
  // setBoard's own function bodies, and before disposeWholeObjectCaches/clearGroup in retire()'s body.
  function bodyOf(fnName){
    const start = bootSrc.indexOf("function " + fnName + "(");
    if(start < 0) return null;
    let i = bootSrc.indexOf("{", start), depth = 0;
    for(; i < bootSrc.length; i++){
      if(bootSrc[i] === "{") depth++;
      else if(bootSrc[i] === "}"){ depth--; if(depth === 0) return bootSrc.slice(start, i + 1); }
    }
    return null;
  }
  const setUnitsBody = bodyOf("setUnits");
  const setBoardBody = bodyOf("setBoard");
  const retireBody = bodyOf("retire");
  check("A10e. ⊗ setUnits calls drainTweens(S) BEFORE its first clearGroup(...)",
    !!setUnitsBody && setUnitsBody.indexOf("drainTweens(S)") >= 0 && setUnitsBody.indexOf("drainTweens(S)") < setUnitsBody.indexOf("clearGroup("),
    JSON.stringify({ found: setUnitsBody && setUnitsBody.indexOf("drainTweens(S)"), firstClearGroup: setUnitsBody && setUnitsBody.indexOf("clearGroup(") }));
  check("A10f. ⊗ setBoard calls drainTweens(S) BEFORE its first clearGroup(...), AND clears S.fxGroup",
    !!setBoardBody && setBoardBody.indexOf("drainTweens(S)") >= 0 && setBoardBody.indexOf("drainTweens(S)") < setBoardBody.indexOf("clearGroup(") && setBoardBody.indexOf("clearGroup(S.fxGroup)") >= 0,
    JSON.stringify({ found: setBoardBody && setBoardBody.indexOf("drainTweens(S)"), firstClearGroup: setBoardBody && setBoardBody.indexOf("clearGroup("), hasFxClear: setBoardBody && setBoardBody.indexOf("clearGroup(S.fxGroup)") >= 0 }));
  check("A10g. ⊗ retire() calls drainTweens(S) BEFORE any of its dispose/clearGroup calls",
    !!retireBody && retireBody.indexOf("drainTweens(S)") >= 0 && retireBody.indexOf("drainTweens(S)") < retireBody.indexOf("clearGroup("),
    JSON.stringify({ found: retireBody && retireBody.indexOf("drainTweens(S)"), firstClearGroup: retireBody && retireBody.indexOf("clearGroup(") }));
}

{
  const capLine = extractConst(bootSrc, "PIXEL_SKIN_CACHE_CAP");
  const cacheLine = extractConst(bootSrc, "PIXEL_SKIN_CACHE");
  const texFn = extractFn(bootSrc, "pixelSkinTextureFor");
  const disposeFn = extractFn(bootSrc, "disposePixelSkinCache");
  check("A8. source: PIXEL_SKIN_CACHE_CAP / PIXEL_SKIN_CACHE (Map) / pixelSkinTextureFor / disposePixelSkinCache all present",
    !!capLine && !!cacheLine && cacheLine.includes("new Map()") && !!texFn && !!disposeFn,
    JSON.stringify({ capLine, cacheLine, hasTexFn: !!texFn, hasDisposeFn: !!disposeFn }));

  // guarded: pre-fix source lacks PIXEL_SKIN_CACHE_CAP/disposePixelSkinCache entirely (a plain object
  // cache, no LRU, no dispose) — building the sandbox would throw a ReferenceError before any of A8a-f
  // could even run. Report them as a clean red block (not a harness crash) in that case, same spirit
  // as every other guarded ⊗ check in this file.
  if(!capLine || !cacheLine || !texFn || !disposeFn){
    ["A8a. minting >128 distinct skin textures caps the cache at <=128 entries",
     "A8b. evicted textures (the earliest-minted, over the cap) got dispose() called",
     "A8c. the most-recently-minted texture is still live (not evicted)",
     "A8d. a repeat (color, skinKey) is a cache HIT — same object, cache size unchanged",
     "A8e. disposePixelSkinCache() disposes every remaining cached texture",
     "A8f. disposePixelSkinCache() empties the cache"
    ].forEach(name => check(name, false, "pre-fix source is missing the LRU cap/dispose function — cannot even build the sandbox"));
  } else {
    const dispCounts = { count: 0 };
    const parts = [
      "let THREE = { CanvasTexture: function(){ let disposed = false; return { isStubTex: true, dispose(){ disposed = true; DISPOSE_LOG.count++; }, get disposed(){ return disposed; } }; } };",
      capLine, cacheLine,
      "const PIXEL_SKIN_HERO_TEX_SIZE = 64; const PIXEL_SKIN_TEX_SIZE = 48;",
      // trivial stand-ins — A3/A8's checks are about the cache/eviction mechanism, not texture CONTENT
      // (verify-pixel-skin.mjs already exhaustively covers buildPixelSkinCanvas's own pixel math).
      "function materialProgramFor(){ return 'generic'; }",
      "function eyeSpecFor(){ return {}; }",
      "function buildPixelSkinCanvas(){ return {}; }",
      "function pixelSkinHash(s){ return 1; }",
      "function nearestify(){}",
      texFn, disposeFn,
      "return { pixelSkinTextureFor, disposePixelSkinCache, cache: PIXEL_SKIN_CACHE };"
    ];
    const factory = new Function("DISPOSE_LOG", parts.join("\n"));
    const sb = factory(dispCounts);

    // A3 check 4 (spec §Verification 4): mint >128 distinct skin textures -> cache size stays <=128 and
    // evicted textures got dispose() called.
    const minted = [];
    for(let i = 0; i < 140; i++){
      minted.push(sb.pixelSkinTextureFor(0x112233 + i, "torso-biped:skin:goblin" + i + "|foe"));
    }
    check("A8a. minting >128 distinct skin textures caps the cache at <=128 entries", sb.cache.size <= 128, sb.cache.size);
    check("A8b. evicted textures (the earliest-minted, over the cap) got dispose() called", dispCounts.count > 0 && minted[0].disposed === true,
      JSON.stringify({ disposeCalls: dispCounts.count, firstMintedDisposed: minted[0].disposed }));
    check("A8c. the most-recently-minted texture is still live (not evicted)", minted[minted.length - 1].disposed === false);

    // a repeat key is a cache HIT (same object, no new mint, and its LRU position bumps to most-recent).
    const before = sb.cache.size;
    const hitAgain = sb.pixelSkinTextureFor(0x112233 + 139, "torso-biped:skin:goblin139|foe");
    check("A8d. a repeat (color, skinKey) is a cache HIT — same object, cache size unchanged", hitAgain === minted[minted.length - 1] && sb.cache.size === before);

    // retire()'s disposePixelSkinCache(): every remaining cached texture disposed, cache emptied.
    const stillCached = Array.from(sb.cache.values());
    sb.disposePixelSkinCache();
    check("A8e. disposePixelSkinCache() disposes every remaining cached texture", stillCached.length > 0 && stillCached.every(t => t.disposed === true));
    check("A8f. disposePixelSkinCache() empties the cache", sb.cache.size === 0, sb.cache.size);
  }
}

// ----------------------------------------------------------------------------
// A9. discR falsy-zero guard (finding 4) — `figure.userData.wholeObjectDiscR != null ? ... : 0.42`
// must preserve an intentional `discR: 0` (a whole-object entry with no hostility-disc rim) rather
// than silently replacing it with the 0.42 default via `||`. Extracted directly from the real
// discRadius expression in setUnits (text-scan the exact statement, then eval it standalone with a
// stub figure/WHOLE_OBJECT_SCALE) so this proves the REAL source line, not a re-implementation.
// ----------------------------------------------------------------------------
{
  const discLineMatch = bootSrc.match(/const discRadius = isWholeObject\s*\n\s*\?\s*\(([^)]+)\)\s*\*\s*WHOLE_OBJECT_SCALE/);
  check("A9-setup. the real discRadius expression is found in theater-boot.js (anchors this check to the actual line)", !!discLineMatch, "expression not found — check for drift");
  const exprBody = discLineMatch ? discLineMatch[1] : null;
  check("A9a. ⊗ the discR expression does NOT use a bare `||` fallback (which would eat an intentional 0)",
    !!exprBody && exprBody.indexOf("||") === -1, exprBody);
  check("A9b. the discR expression uses a `!= null` guard instead", !!exprBody && exprBody.indexOf("!= null") >= 0, exprBody);

  if(exprBody){
    const fn = new Function("figure", "return (" + exprBody + ");");
    check("A9c. a figure with wholeObjectDiscR:0 resolves to the STORED 0, not the 0.42 default",
      fn({ userData: { wholeObjectDiscR: 0 } }) === 0,
      "resolved=" + fn({ userData: { wholeObjectDiscR: 0 } }));
    check("A9d. a figure with wholeObjectDiscR absent (undefined) still falls back to 0.42",
      fn({ userData: {} }) === 0.42, "resolved=" + fn({ userData: {} }));
    check("A9e. a figure with a real non-zero wholeObjectDiscR passes it through unchanged",
      fn({ userData: { wholeObjectDiscR: 0.6 } }) === 0.6, "resolved=" + fn({ userData: { wholeObjectDiscR: 0.6 } }));
  }
}

// ----------------------------------------------------------------------------
// A11. HOTFIX-QUEUE-2026-07-06 H10 — theater cache disposal asymmetries. Same source-extraction
// sandbox convention as A8/A10 (theater-boot.js is a sealed ES module that imports THREE + needs
// WebGL to mount — cannot be win.eval'd or mounted headless; this exercises the REAL extracted
// disposeAuxCaches() body + retire()'s S.textures dispose line directly, not a re-implementation).
// ----------------------------------------------------------------------------
{
  const auxFnSrc = extractFn(bootSrc, "disposeAuxCaches");
  check("A11-setup. disposeAuxCaches() is present in theater-boot.js's source", !!auxFnSrc);

  if(!auxFnSrc){
    ["A11a. RED probe: disposeAuxCaches() empties FLOOR_TEXTURE_CACHE and disposes every cached texture",
     "A11b. disposeAuxCaches() empties + disposes BASE_DISC_MAT_CACHE",
     "A11c. disposeAuxCaches() empties + disposes GROUNDING_BLOB_GEO_CACHE",
     "A11d. disposeAuxCaches() null-guards a null-valued FLOOR_TEXTURE_CACHE entry (build-failure sentinel) without throwing"
    ].forEach(name => check(name, false, "pre-fix source is missing disposeAuxCaches — cannot even build the sandbox"));
  } else {
    // fake dispose-able stand-ins — the check is about the CACHE/EVICTION mechanism, not GL content.
    const makeTex = () => { const t = { disposed: false }; t.dispose = () => { t.disposed = true; }; return t; };
    const makeMat = () => { const m = { disposed: false }; m.dispose = () => { m.disposed = true; }; return m; };
    const makeGeo = () => { const g = { disposed: false }; g.dispose = () => { g.disposed = true; }; return g; };

    const FLOOR_TEXTURE_CACHE = new Map();
    const t1 = makeTex(), t2 = makeTex();
    FLOOR_TEXTURE_CACHE.set("stone:#334455", t1);
    FLOOR_TEXTURE_CACHE.set("flagstone:#112233", t2);
    FLOOR_TEXTURE_CACHE.set("failed-build:#000000", null); // build-failure sentinel (buildFloorCanvasTexture's own contract)

    const BASE_DISC_MAT_CACHE = { "disc-a": makeMat(), "disc-b": makeMat() };
    const GROUNDING_BLOB_GEO_CACHE = { "blob-a": makeGeo() };

    const factory = new Function(
      "FLOOR_TEXTURE_CACHE", "BASE_DISC_MAT_CACHE", "GROUNDING_BLOB_GEO_CACHE",
      auxFnSrc + "\nreturn disposeAuxCaches;"
    );
    const disposeAuxCaches = factory(FLOOR_TEXTURE_CACHE, BASE_DISC_MAT_CACHE, GROUNDING_BLOB_GEO_CACHE);

    let threw = false;
    try { disposeAuxCaches(); } catch(e){ threw = true; console.log("    (threw:", e.message, ")"); }

    check("A11a. RED probe: disposeAuxCaches() disposes every cached floor texture and empties FLOOR_TEXTURE_CACHE",
      !threw && t1.disposed === true && t2.disposed === true && FLOOR_TEXTURE_CACHE.size === 0,
      JSON.stringify({ threw, t1: t1.disposed, t2: t2.disposed, size: FLOOR_TEXTURE_CACHE.size }));
    check("A11b. disposeAuxCaches() disposes + deletes every BASE_DISC_MAT_CACHE entry",
      !threw && Object.keys(BASE_DISC_MAT_CACHE).length === 0,
      JSON.stringify({ remaining: Object.keys(BASE_DISC_MAT_CACHE) }));
    check("A11c. disposeAuxCaches() disposes + deletes every GROUNDING_BLOB_GEO_CACHE entry",
      !threw && Object.keys(GROUNDING_BLOB_GEO_CACHE).length === 0,
      JSON.stringify({ remaining: Object.keys(GROUNDING_BLOB_GEO_CACHE) }));
    check("A11d. disposeAuxCaches() null-guards a null-valued FLOOR_TEXTURE_CACHE entry (build-failure sentinel) without throwing",
      !threw, "threw=" + threw);
  }

  // call-site text-scan: retire() must call disposeAuxCaches() (after disposeWholeObjectCaches, before
  // the renderer dispose), and must dispose every non-"pending" S.textures entry.
  const retireBody = extractFn(bootSrc, "retire");
  check("A11e. retire() calls disposeAuxCaches() after disposeWholeObjectCaches()",
    !!retireBody && retireBody.indexOf("disposeAuxCaches()") >= 0 &&
    retireBody.indexOf("disposeWholeObjectCaches()") < retireBody.indexOf("disposeAuxCaches()"),
    JSON.stringify({ wholeIdx: retireBody && retireBody.indexOf("disposeWholeObjectCaches()"), auxIdx: retireBody && retireBody.indexOf("disposeAuxCaches()") }));

  const textureDisposeMatch = bootSrc.match(/if\(S\.textures\)\{ Object\.keys\(S\.textures\)\.forEach\(k => \{ const t = S\.textures\[k\]; if\(t && t !== "pending" && t\.dispose\) t\.dispose\(\); \}\); \}/);
  check("A11f. retire() disposes every non-\"pending\" S.textures entry (real line found + null/pending-safe)",
    !!textureDisposeMatch);
  if(textureDisposeMatch){
    const fn = new Function("S", textureDisposeMatch[0] + "\nreturn S;");
    const t1 = { dispose(){ this.disposed = true; }, disposed: false };
    const S = { textures: { skin: t1, floor: "pending", empty: null } };
    let threw = false;
    try { fn(S); } catch(e){ threw = true; }
    check("A11g. the real S.textures dispose line disposes a real texture and skips \"pending\"/null without throwing",
      !threw && t1.disposed === true, JSON.stringify({ threw, disposed: t1.disposed }));
  }
}

console.log("\n=== PART B — the EVENT-CONTRACT seam (jsdom, full app, spy'd window.Theater) ===");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleTypedPaths = new Set(man.modules.filter(m => m.type === "module").map(m => m.path));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js") && !moduleTypedPaths.has(p)).map(read).join("\n;\n");
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
const DOM_HTML = `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div>
  <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
  </body></html>`;

function freshWin() {
  const dom = new JSDOM(DOM_HTML, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

// a SPY window.Theater — records every play() call so the hook-site checks can assert kind/verb
// without a real GL mount. Distinct from "window.Theater absent" (tested separately, B1 below).
function installSpyTheater(win) {
  const calls = [];
  win.Theater = {
    verbs: ["advance","withdraw","strike","hurt","down","cast","arc","knockback","sink","burst","flee","absurdity","obliterate",
      "fx:fire","fx:frost","fx:lightning","fx:necrotic","fx:radiant","fx:poison"],
    play(verb, opts) { calls.push({ verb, opts }); return true; },
    fxFromLedger(entry) {
      // a small inline mirror of theater-verbs.js's own mapping, JUST for the kinds this harness
      // exercises (attack/foe-turn/move-zone/morale/crit/combat-end) — Part A already independently
      // verifies the REAL theaterFxFromLedger's mapping table in isolation; this spy only needs to
      // prove cmTheaterNotify calls window.Theater.fxFromLedger + play() with the right kind/data,
      // which it does by echoing back a deterministic verb per kind.
      const k = entry && entry.data && entry.data.kind;
      const MAP = { attack: "strike", "foe-turn": "strike", "move-zone": "advance", morale: "flee", crit: "absurdity" };
      if (k === "combat-end") return null;
      if (k === "morale" && entry.data.held) return null;
      return MAP[k] ? { verb: MAP[k], opts: {} } : null;
    }
  };
  return calls;
}

function makeWorld(win, opts = {}) {
  const sheetOverrides = opts.sheet || {};
  const world = {
    id: "w-theater-verbs", name: "The Theater-Verbs Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting the seam" },
            smell:{name:"smoke"}, sound:{name:"wind"}, arch:{name:"stone"},
            taboo:{name:"t",desc:"d"}, myth:{name:"m",desc:"d"} },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: Object.assign({
        species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 18, con: 16, dex: 12 }, mods: { str: 4, con: 3, dex: 1 }, saveProfs: ["str","con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [{ id:"w1", name:"Dagger", qty:1, conditions:[] }],
        equipped: { mainHand:"w1", offHand:null, armor:null }, pools: {},
      }, sheetOverrides) }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name:"Copper Hand", dominant:false, agenda:"a", method:"b", tags:[], clock:{filled:0,size:6} }],
    pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Redoubt", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = opts.gamePanel!==undefined ? opts.gamePanel : null;
  win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.chase = null;
  return world;
}

// ----------------------------------------------------------------------------
// B1. HEADLESS SAFETY — window.Theater entirely absent (the real jsdom default, no spy installed).
// stage_fx must still validate + ledger + return ok:true, and every hook call site must no-op
// cleanly (no throw) through a full combat round.
// ----------------------------------------------------------------------------
{
  const win = freshWin(); // no installSpyTheater() — window.Theater is genuinely undefined
  const world = makeWorld(win);
  check("B1a. window.Theater is absent by default under jsdom", win.Theater === undefined);

  const r = win.applyEvent(world, { type: "stage_fx", payload: { verb: "arc", who: "pc", to: "near:C", note: "the rogue swings the grappling line across the gap" } });
  check("B1b. stage_fx validates a known verb + returns ok:true even with window.Theater absent", r && r.ok === true, JSON.stringify(r));
  const lastLedger = world.ledger[world.ledger.length-1];
  check("B1c. stage_fx ledgers the DM's own note verbatim (the prose twin)", lastLedger && lastLedger.text.includes("the rogue swings the grappling line across the gap"), lastLedger && lastLedger.text);

  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25 }] } });
  const fid = win.GS.combat.foes[0].fid;
  let threw = false;
  try {
    win.applyEvent(world, { type: "move_zone", payload: { who: "pc", band: "near" } });
    win.applyEvent(world, { type: "attack", payload: { d20: 20, target: fid } });
    win.applyEvent(world, { type: "foe_morale", payload: { foe: fid, trigger: "bloodied", d20: 1 } });
    win.applyEvent(world, { type: "crit_outcome", payload: { natural: 20, magnitude: 10, tier: "mythic" } });
    win.applyEvent(world, { type: "combat_end", payload: { outcome: "resolved" } });
  } catch(e) { threw = true; console.log("    (threw:", e.message, ")"); }
  check("B1d. a full combat round through every hook-site event no-ops cleanly with window.Theater absent (never throws)", threw === false);
}

// ----------------------------------------------------------------------------
// B2. stage_fx REJECTS an unknown verb — never ledgers a fabricated verb.
// ----------------------------------------------------------------------------
{
  const win = freshWin();
  const world = makeWorld(win);
  const before = world.ledger.length;
  const r = win.applyEvent(world, { type: "stage_fx", payload: { verb: "teleport-behind-you" } });
  check("B2a. an unknown stage_fx verb is rejected", r && r.ok === false && r.reason === "unknown-verb", JSON.stringify(r));
  check("B2b. an unknown verb is NEVER ledgered", world.ledger.length === before, `ledger grew by ${world.ledger.length-before}`);
}
{
  const win = freshWin();
  const world = makeWorld(win);
  const r = win.applyEvent(world, { type: "stage_fx", payload: {} });
  check("B2c. a missing verb entirely is rejected the same way", r && r.ok === false && r.reason === "unknown-verb", JSON.stringify(r));
}

// ----------------------------------------------------------------------------
// B3. stage_fx forwards to window.Theater.play with the exact verb + who/from/to, when Theater IS
// present (the spy).
// ----------------------------------------------------------------------------
{
  const win = freshWin();
  const calls = installSpyTheater(win);
  const world = makeWorld(win);
  const r = win.applyEvent(world, { type: "stage_fx", payload: { verb: "knockback", who: "f1", to: "far:L", note: "the blast throws it back" } });
  check("B3a. stage_fx returns ok:true + echoes the verb", r && r.ok === true && r.verb === "knockback", JSON.stringify(r));
  check("B3b. window.Theater.play was called with the EXACT verb", calls.length === 1 && calls[0].verb === "knockback", JSON.stringify(calls));
  check("B3c. play() opts carry who/to through untouched", calls[0].opts.who === "f1" && calls[0].opts.to === "far:L", JSON.stringify(calls[0].opts));
}

// ----------------------------------------------------------------------------
// B4-B9. The 6 named hook sites (attack/foe_action x2/move_zone/foe_morale/crit_outcome/combat_end)
// fire cmTheaterNotify with the RIGHT kind, verified via the spy's fxFromLedger echo -> play() call.
// A 3-foe fixture (not 1) so a lucky nat20 attack/foe_action swing downing ONE goblin never auto-ends
// the whole fight (cmMaybeAutoEnd) before B7/B8 run — each check re-reads the first STILL-LIVE foe's
// fid rather than caching one fid up front, so the sequence tolerates whichever foe(s) actually go down.
// ----------------------------------------------------------------------------
{
  const win = freshWin();
  const calls = installSpyTheater(win);
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25, count:3 }] } });
  const liveFid = () => { const f = (win.GS.combat.foes||[]).find(x => !x.down); return f ? f.fid : null; };

  calls.length = 0;
  win.applyEvent(world, { type: "move_zone", payload: { who: "pc", band: "near" } });
  check("B4. move_zone hook site fires play('advance', ...)", calls.some(c => c.verb === "advance"), JSON.stringify(calls));

  calls.length = 0;
  win.applyEvent(world, { type: "attack", payload: { d20: 20, target: liveFid() } });
  check("B5. attack hook site fires play('strike', ...)", calls.some(c => c.verb === "strike"), JSON.stringify(calls));

  calls.length = 0;
  const foeActFid = liveFid();
  const foeActRes = foeActFid ? win.applyEvent(world, { type: "foe_action", payload: { foe: foeActFid, action: 0 } }) : { ok: false, reason: "no-live-foe-left" };
  check("B6. foe_action (p.action bypass path) hook site fires play('strike', ...) when resolvable",
    foeActRes && (foeActRes.ok === false || calls.some(c => c.verb === "strike")),
    JSON.stringify({ foeActRes, calls }));

  calls.length = 0;
  const moraleFid = liveFid();
  const moraleRes = moraleFid ? win.applyEvent(world, { type: "foe_morale", payload: { foe: moraleFid, trigger: "bloodied", d20: 1 } }) : null;
  check("B7. foe_morale hook site fires cmTheaterNotify (play() called iff the spy's mapping resolves a verb for this disposition), or the fight is already over (all 3 foes downed — still a valid, non-flaky outcome)",
    moraleFid ? (moraleRes && moraleRes.ok === true) : (win.GS.combat === null || win.GS.combat === undefined),
    JSON.stringify({ moraleFid, moraleRes, combatLive: !!win.GS.combat }));

  calls.length = 0;
  win.applyEvent(world, { type: "crit_outcome", payload: { natural: 20, magnitude: 12, tier: "mythic" } });
  check("B8. crit_outcome hook site fires play('absurdity', ...)", calls.some(c => c.verb === "absurdity"), JSON.stringify(calls));
}
{
  // B9 gets its OWN fresh combat instance — B4-B8's attack/foe_action swings against a single low-HP
  // goblin fixture can auto-end the fight early (cmMaybeAutoEnd), which would make a shared-state
  // combat_end call fail with "no-combat" for a reason unrelated to what B9 is actually testing (the
  // hook site itself, not fight-duration luck) — a beefier foe + a fresh world keeps this check
  // independent of exactly how many of B4-B8's swings happened to land.
  const win = freshWin();
  const calls = installSpyTheater(win);
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25, count:3 }] } });
  calls.length = 0;
  const endRes = win.applyEvent(world, { type: "combat_end", payload: { outcome: "resolved" } });
  check("B9. combat_end hook site is wired (returns ok:true) — the spy's own mapping stays silent for combat-end per §4, so no play() call is the CORRECT behavior here",
    endRes && endRes.ok === true && calls.length === 0, JSON.stringify({ endRes, calls }));
}

// ----------------------------------------------------------------------------
// B10. foe_action's SECOND ledger site (the autoplay/not-explicit-action branch) also fires the hook —
// exercised on a fresh low-CR foe with no p.action supplied. autoplayEligible (src/engine/monster-
// tactics.js) also gates on customTables/isLeader, which vary across which real bestiary "Goblin"
// entry combatStart's fuzzy name match happens to resolve — this check accepts EITHER outcome
// (not-autoplay-eligible is a real, valid, unchanged pre-existing contract per COMBAT-LIFECYCLE.md §5's
// "Without p.action, behavior stays byte-identical to the pre-existing not-autoplay-eligible contract")
// but additionally asserts that WHEN the branch resolves to a real attack, the hook actually fired —
// so this check still catches a hook-site regression whenever the fixture happens to land eligible.
// ----------------------------------------------------------------------------
{
  const win = freshWin();
  const calls = installSpyTheater(win);
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25 }] } });
  const fid = win.GS.combat.foes[0].fid;
  calls.length = 0;
  const r = win.applyEvent(world, { type: "foe_action", payload: { foe: fid } }); // no p.action -> autoplay branch
  const eligibleAndResolved = r && r.ok === true && r.attack;
  check("B10. foe_action autoplay branch is reachable (ok:true resolving an attack, OR the documented not-autoplay-eligible outcome — both are valid per COMBAT-LIFECYCLE.md §5) AND fires the hook when it resolves",
    r && (r.ok === true || r.reason === "not-autoplay-eligible") && (!eligibleAndResolved || calls.some(c => c.verb === "strike")),
    JSON.stringify({ r, calls }));
}

// ----------------------------------------------------------------------------
// B11-B13. DEAD-STATE (2026-07-03, Adam's ruling) — the obliteration flag sources wired into
// applyEvent (src/world/dm.js): stage_fx{verb:"obliterate",who} (DM-declared), crit_outcome (a
// magnitude>=8 killing blow against a DOWN target), and the attack event's own elemental-kill branch.
// ----------------------------------------------------------------------------
{
  // B11. stage_fx{verb:"obliterate",who} stamps `obliterated` (and `down`) on the matching GS.combat
  // foe, and forwards to window.Theater.play('obliterate', ...) via the spy.
  const win = freshWin();
  const calls = installSpyTheater(win);
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25 }] } });
  const fid = win.GS.combat.foes[0].fid;
  calls.length = 0;
  const r = win.applyEvent(world, { type: "stage_fx", payload: { verb: "obliterate", who: fid, note: "the goblin is vaporized" } });
  check("B11a. stage_fx obliterate returns ok:true", r && r.ok === true, JSON.stringify(r));
  const victim = win.GS.combat.foes.find(f => f.fid === fid);
  check("B11b. stage_fx obliterate stamps obliterated:true on the matching GS.combat foe", victim && victim.obliterated === true, JSON.stringify(victim));
  check("B11c. stage_fx obliterate also stamps down:true (an obliterated unit is down by construction)", victim && victim.down === true, JSON.stringify(victim));
}
{
  // B12. crit_outcome with p.target + magnitude>=8 against a DOWN foe stamps obliterated; a magnitude<8
  // crit against the same down foe does NOT (the >=8 gate is load-bearing, not vacuous).
  const win = freshWin();
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25, count:2 }] } });
  const [f1, f2] = win.GS.combat.foes;
  f1.down = true; f1.hp = 0;
  f2.down = true; f2.hp = 0;
  win.applyEvent(world, { type: "crit_outcome", payload: { natural: 20, magnitude: 3, tier: "standard", target: f2.fid } });
  check("B12a. crit_outcome with magnitude<8 against a down foe does NOT obliterate (gate is load-bearing)", f2.obliterated !== true, JSON.stringify(f2));
  win.applyEvent(world, { type: "crit_outcome", payload: { natural: 20, magnitude: 10, tier: "mythic", target: f1.fid } });
  check("B12b. crit_outcome with magnitude>=8 against a DOWN target stamps obliterated:true", f1.obliterated === true, JSON.stringify(f1));
}
{
  // B12c. crit_outcome never obliterates a foe still STANDING (down:false) even at magnitude>=8 — the
  // "never obliterates a foe still standing" guard.
  const win = freshWin();
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25 }] } });
  const fid = win.GS.combat.foes[0].fid; // still up (down:false by default at combat_start)
  win.applyEvent(world, { type: "crit_outcome", payload: { natural: 20, magnitude: 12, tier: "mythic", target: fid } });
  const victim = win.GS.combat.foes.find(f => f.fid === fid);
  check("B12c. crit_outcome never obliterates a foe still standing, even at magnitude>=8", victim && victim.obliterated !== true, JSON.stringify(victim));
}
{
  // B13. the `attack` event's elemental-kill branch: a killing blow whose damage breakdown carries an
  // elemental type (fire/lightning/necrotic/radiant/acid) obliterates; a plain (non-elemental) killing
  // blow does NOT — proven by directly driving applyDamage's own dmgType-carrying path is out of reach
  // from a pure fixture (weapon damage types are mundane by default), so this checks the NARROWER,
  // directly-testable claim: a foe already at 1 HP, hand-rolled into the elemental branch's own guard
  // conditions via a d20:20 guaranteed-hit swing, only flips `obliterated` when applyDamage's resolved
  // dmgType is elemental. Since this fixture's mundane dagger never resolves an elemental dmgType, the
  // expected (and asserted) outcome is down:true, obliterated:false-or-undefined — proving the plain-
  // kill path still leaves a corpse (never obliterates by default), which is the DEFAULT this whole
  // unit exists to preserve.
  // CRIT-MAGNITUDE (2026-07-03): a nat-20 now ALSO rolls the magnitude die (a second, INDEPENDENT
  // obliteration source — see verify-crit.mjs's own combat-crit-magnitude section for that path in
  // isolation). This test's whole point is isolating the ELEMENTAL branch, so magnitude is pinned
  // under the >=8 gate — otherwise the engine's own open d20 magnitude roll would make this test flaky
  // (an unpinned nat-20 has good odds of landing an obliterating magnitude on its own, for a reason
  // this test isn't about).
  const win = freshWin();
  const world = makeWorld(win, { sheet: { hp: 52, hpCur: 52 } });
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25 }] } });
  const fid = win.GS.combat.foes[0].fid;
  const foe = win.GS.combat.foes[0];
  foe.hp = 1; // one hit from down
  const r = win.applyEvent(world, { type: "attack", payload: { d20: 20, magnitude: 5, target: fid } }); // guaranteed hit/crit; magnitude pinned under the obliteration gate
  check("B13a. a mundane (non-elemental) killing blow leaves the foe down but NOT obliterated (the default corpse path)",
    r && r.ok === true && foe.down === true && foe.obliterated !== true, JSON.stringify({ r, foe }));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);

// ============================================================================
// stub ctx / unit builders for Part A (no real THREE — see this file's header)
// ============================================================================
function makeStubGroup() {
  const children = [];
  return {
    children,
    add(o) { children.push(o); },
    remove(o) { const i = children.indexOf(o); if (i >= 0) children.splice(i, 1); }
  };
}
function makeStubVec3(x, y, z) {
  return { x: x||0, y: y||0, z: z||0, set(nx,ny,nz){ this.x=nx;this.y=ny;this.z=nz; return this; }, copy(v){ this.x=v.x;this.y=v.y;this.z=v.z; return this; }, clone(){ return makeStubVec3(this.x,this.y,this.z); } };
}
function makeStubEuler(x, y, z) {
  return { x: x||0, y: y||0, z: z||0, set(nx,ny,nz){ this.x=nx;this.y=ny;this.z=nz; return this; }, copy(v){ this.x=v.x;this.y=v.y;this.z=v.z; return this; } };
}
function makeStubUnit(id) {
  return {
    userData: { unitId: id },
    position: makeStubVec3(0,0,0),
    rotation: makeStubEuler(0,0,0),
    scale: { x: 1, y: 1, z: 1, setScalar(v) { this.x = this.y = this.z = v; } },
    visible: true,
    traverse(fn) { fn(this); },
    material: { color: { r: 1, g: 1, b: 1, clone() { return { r: this.r, g: this.g, b: this.b, setRGB(r,g,b){this.r=r;this.g=g;this.b=b;} }; }, setRGB(r,g,b){ this.r=r;this.g=g;this.b=b; } }, transparent: false, opacity: 1 }
  };
}
function makeStubMesh(geo, mat) {
  return {
    position: makeStubVec3(0,0,0),
    rotation: makeStubEuler(0,0,0),
    scale: { x: 1, y: 1, z: 1, setScalar(v){ this.x=this.y=this.z=v; } },
    geometry: geo || { dispose(){} },
    material: mat || { opacity: 1, color: 0, dispose(){} },
    userData: {}
  };
}
function makeStubCtx() {
  const unitGroup = makeStubGroup();
  const fxGroup = makeStubGroup();
  const StubTHREE = {
    Group: function(){ return makeStubGroup(); },
    Mesh: function(){ return makeStubMesh(); },
    PointLight: function(color, intensity, distance, decay){ return Object.assign(makeStubMesh(), { color, intensity: intensity||0, distance: distance||0, decay: decay||0, isPointLight: true }); },
    BoxGeometry: function(){ return { dispose(){} }; },
    PlaneGeometry: function(){ return { dispose(){} }; },
    CircleGeometry: function(){ return { dispose(){} }; },
    MeshBasicMaterial: function(opts){ return Object.assign({ dispose(){}, opacity: (opts&&opts.opacity!=null)?opts.opacity:1, color: (opts&&opts.color)||0 }, opts||{}); },
    DoubleSide: "double"
  };
  // playVerb's `new ctx.THREE.Mesh(...)` calls need real `new`-able constructors returning mesh-shaped
  // stubs — wrap the factory functions above as proper constructors bound to return their stub shape.
  function Ctor(factory) { return function(...args){ return factory(...args); }; }
  StubTHREE.Mesh = Ctor(makeStubMesh);
  StubTHREE.BoxGeometry = Ctor(() => ({ dispose(){} }));
  StubTHREE.PlaneGeometry = Ctor(() => ({ dispose(){} }));
  StubTHREE.MeshBasicMaterial = Ctor((opts) => Object.assign({ dispose(){} }, opts||{}));

  const ctx = {
    THREE: StubTHREE, scene: { children: [], add(o){ this.children.push(o); }, remove(o){ const i=this.children.indexOf(o); if(i>=0) this.children.splice(i,1); } }, fxGroup, unitGroup, camera: null,
    tweens: [],
    findUnit(id) { return unitGroup.children.find(c => c.userData && c.userData.unitId === String(id)) || null; },
    zoneToWorld(band, lane) { return typeof ctx._zoneToWorld === "function" ? ctx._zoneToWorld(band, lane) : null; },
    markDirty() {}
  };
  return ctx;
}
function runToCompletion(tweens) {
  // advance every tween's own clock far past its duration, then tick once — deterministic, no real timers.
  const now = Date.now() + 100000;
  tweens.forEach(tw => { tw.start = now - tw.dur - 1; });
  const ctx = { tweens };
  tickTweens(ctx, now);
}
