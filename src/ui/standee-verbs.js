/* GENESIS MODULE — src/ui/standee-verbs.js — GRAPHICS-ENGINE Part II §A (docs/GRAPHICS-ENGINE.md)
   STANDEE VERBS: data-driven whole-standee tweens bound to events, "verbs now, puppets later"
   (Adam's ruling). A SIBLING ES-module boundary file to src/ui/theater-verbs.js (BATTLE-THEATER T3's
   3D-figure verb library) — kept SEPARATE for the same reason theater-verbs.js itself is split out
   from theater-boot.js (see that file's own header): theater-verbs.js is already 764 lines and owns a
   fundamentally different animation shape (arbitrary closures over resolved world points, built for
   posed 3D figures whose full rotation is free real estate). Billboard standees are NOT free on
   rotation — updateSpriteBillboardYaw() (theater-boot.js) stamps `group.rotation.x` (camera-pitch
   tilt) and `group.rotation.y` (yaw-to-camera) on every sprite group EVERY dirty render pass. Any verb
   that fought that by writing the outer group's rotation.x/y would be invisibly overwritten the next
   frame. That single constraint is why this file exists as its own module with its own (simpler,
   declarative) tween shape, rather than a new section bolted onto theater-verbs.js's closure-per-verb
   convention — see "THE COMPOSITION CONTRACT" below for the mechanism.

   §A's v1 verb set (docs/GRAPHICS-ENGINE.md, ruling 2026-07-10 late): act-attack, act-cast, move-step,
   hit-damage, hit-crit, fall-death, heal, buff, debuff, guise-swap. Every verb here manipulates ONLY
   the billboard GROUP's transform (position/rotation/scale) and its material's tint/opacity uniforms —
   never the sprite pixels or the texture map's content (SPRITE PURITY, DUNGEON-GRAPH.md U3 iteration-2
   ruling, reaffirmed by §A: "verbs manipulate the GROUP transform/tint only — never the sprite
   pixels"). guise-swap is the one NAMED exception: swapping WHICH texture is bound (a different
   sprite's map reference) is not touching pixel content, and §A explicitly specs it as a texture
   crossfade ("guise-swap — crossfade texture + scale to the new form (GUISE G3's verb)") — see vGuiseSwap
   below, which documents exactly when it substitutes `mesh.material.map`.

   ============================================================================
   THE COMPOSITION CONTRACT (read before touching rotation math in this file)
   ============================================================================
   updateSpriteBillboardYaw() (theater-boot.js) does, every dirty render, for every group tagged
   userData.sprite (both S.unitGroup children AND interior "pieces" sub-group children):
       fig.rotation.order = "YXZ"; fig.rotation.y = facing; fig.rotation.x = tilt;
   That write happens on the OUTER group — the exact object this module receives as
   `pieceOrUnitGroup`. Two consequences shape this file's design:
     1. group.position, group.scale, group.rotation.z, and material.color/opacity are NEVER touched by
        the facing code — verbs are free to animate those fields directly on the outer group with zero
        risk of being stomped (act-attack/move-step's translate, hit-crit's squash-stretch scale,
        hit-damage/heal/buff/debuff's tint pulses all use this path).
     2. group.rotation.x/y are NOT free — they are re-asserted from `tilt`/`facing` every single dirty
        frame, so a verb writing them directly loses instantly. fall-death is the one verb in this v1
        set that needs a rotation the facing code doesn't own (tipping the standee onto the floor
        plane), so it lazily reparents the mesh into an inner wrapper Group (`ensureWrap`, below) the
        FIRST time any verb needs it, and animates the WRAPPER's local rotation.x instead. Three.js
        composes a child's local transform with its parent's world transform automatically — the wrap's
        tip-rotation and the outer group's camera-tilt/yaw compose exactly as intended, and the outer
        group's rotation.x/y stay byte-identical to whatever updateSpriteBillboardYaw last wrote,
        because this module never assigns to them. (Verified by dev/verify-standee-verbs.mjs check 5.)
   The wrapper is created lazily and reused (group.userData.standeeWrap) rather than unconditionally at
   buildSpriteBillboard() time, so verbs that never need rotation (the majority of v1) pay zero extra
   scene-graph depth or reparenting cost.

   ============================================================================
   Declarative keyframes, not closures — and why that's a deliberate divergence from theater-verbs.js
   ============================================================================
   theater-verbs.js's verbs are hand-written closures because 3D figures move through arbitrary
   resolved world points with per-verb bespoke math (strike's hit/miss overshoot branch, absurdity's
   magnitude-scaled rift + camera shake). Standee verbs are smaller, more uniform beats (a lunge, a
   shake, a pulse, a hop) that all reduce to the same shape: a handful of named numeric fields
   interpolated linearly between ordered keyframes. Modeling them declaratively buys two things this
   unit's spec explicitly wants: (a) dev/verify-standee-verbs.mjs can assert EXACT transform values at
   phase boundaries with a fake clock, rather than reverse-engineering closure math, and (b) adding a
   new verb is authoring a keyframe table, not a new closure — cheap the way §A wants ("puppets later"
   implies this registry keeps growing). guise-swap is the one verb that doesn't fit the shape (it has
   a genuine side effect — a texture substitution partway through) and is implemented as a small
   dedicated function, exactly mirroring how theater-verbs.js special-cases vCast/vAbsurdity beyond its
   own generic tween primitives.

   Keyframe fields (all optional per-keyframe; KF_DEFAULTS fills the rest — see `kf()` below):
     at         — 0..1, position along the verb's duration this keyframe fires at.
     along      — 0..1 fraction of the vector from the standee's start position to opts.targetPos
                  (resolved ONCE at verb start; a verb with no targetPos gets a zero-length vector, so
                  `along` becomes a harmless no-op — exactly resolvePoint's "unresolvable -> no-op"
                  posture in theater-verbs.js, but returning a degenerate-safe value here rather than
                  failing the whole verb, since most non-attack verbs never set targetPos at all).
     dy         — world-unit vertical offset added to the standee's base Y (rise/hop/settle).
     jx         — world-unit LOCAL lateral jitter offset (independent of `along`) — hit-damage/hit-
                  crit's shake, which has nothing to do with any target direction.
     tiltX      — radians of wrapper-local rotation.x (fall-death's tip-to-floor-plane only).
     scale      — uniform scale multiplier off the standee's base scale.
     scaleY     — an EXTRA multiplier applied only to the vertical scale axis on top of `scale`
                  (hit-crit's squash-stretch: scale<1,scaleY>1 = squash; scale>1,scaleY<1 = stretch).
     tintMix    — 0..1 blend weight from the base material color toward `tintColor` (this is also how
                  "flash" is modeled — §A's phase vocabulary lists translate/rotate/scale/tint/flash,
                  and a flash is just an instantaneous full-weight tintMix spike toward white; both
                  operate on the exact same material.color uniform, so folding flash into tint avoids a
                  redundant second color-math path for one shared GPU-facing field).
     tintColor  — hex int the tintMix blends toward.
     opacity    — 0..1 material opacity (mostly guise-swap's crossfade; static 1 elsewhere in v1).

   ============================================================================
   ctx binding
   ============================================================================
   playStandeeVerb(pieceOrUnitGroup, verbName, opts) intentionally matches §A's exact call shape (no
   ctx parameter) since callers already hold a live THREE.Group reference and don't need id resolution
   the way theater-verbs.js's ctx.findUnit provides. It still needs to push tween entries into "the
   existing tween ticker" (this unit's brief, quoting §A) — theater-verbs.js's own tickTweens/ctx.tweens
   contract, the SAME array theater-boot.js's startTweenLoop already drains every animation frame. To
   reuse that ticker without changing this module's call signature at every call site, theater-boot.js
   calls bindStandeeCtx(ctx) once per play() dispatch (mirroring its own buildTheaterCtx() — "built
   fresh on every play() call... so it always reflects the CURRENT mount/board/unit state") with the
   SAME ctx shape theater-verbs.js consumes ({THREE, tweens, markDirty, ...}); this module only reads
   ctx.THREE, ctx.tweens, and ctx.markDirty from it — a strict subset of theater-verbs.js's own ctx
   contract, so one ctx object serves both librar   ies with no adapter layer. A ctx.tweens entry pushed
   here is byte-identical in shape ({start,dur,update,onDone}) to one theater-verbs.js pushes, so
   theater-verbs.js's EXPORTED tickTweens (imported by theater-boot.js, never duplicated here) advances
   both kinds without knowing or caring which module produced them. This module reads only
   ctx.THREE/ctx.tweens/ctx.markDirty — a strict subset of theater-verbs.js's own ctx contract, so one
   ctx object serves both libraries with no adapter layer needed. */

const KF_DEFAULTS = Object.freeze({
  along: 0, dy: 0, jx: 0, tiltX: 0, scale: 1, scaleY: 1, tintMix: 0, tintColor: 0xffffff, opacity: 1
});

function kf(at, overrides){
  return Object.assign({ at }, KF_DEFAULTS, overrides || {});
}

function lerp(a, b, t){ return a + (b - a) * t; }

/* linear interpolation across an ordered keyframe list for every numeric field in KF_DEFAULTS. `t` is
   clamped to [0,1]. At an exact keyframe's own `at`, the result is byte-identical to that keyframe's
   values (no easing curve blur at boundaries) — the property dev/verify-standee-verbs.mjs's phase-
   boundary assertions rely on. */
function sampleKeyframes(keyframes, t){
  const clamped = Math.max(0, Math.min(1, t));
  let lo = keyframes[0], hi = keyframes[keyframes.length - 1];
  for(let i = 0; i < keyframes.length - 1; i++){
    if(clamped >= keyframes[i].at && clamped <= keyframes[i + 1].at){
      lo = keyframes[i]; hi = keyframes[i + 1];
      break;
    }
  }
  const span = hi.at - lo.at;
  const local = span > 0 ? (clamped - lo.at) / span : 0;
  const out = {};
  for(const field in KF_DEFAULTS){
    const a = lo[field], b = hi[field];
    out[field] = (typeof a === "number" && typeof b === "number") ? lerp(a, b, local) : b;
  }
  return out;
}

/* ---------------------------------------------------------------------------
   STANDEE_VERBS — the registry. Each entry: {dur, persist, keyframes[]}. `persist` mirrors theater-
   verbs.js's own "terminal, no onDone revert" convention (vDown, vObliterate, vFlee) vs. its "revert to
   base on completion" convention (vHurt, vStrike, vSink) — persist:true verbs leave the standee at its
   final keyframe's transform/tint forever (fall-death's corpse), persist:false verbs snap back to the
   pre-verb base transform/material once the tween completes (every other v1 verb: a lunge, a shake, a
   pulse all return to neutral).
   --------------------------------------------------------------------------- */
export const STANDEE_VERBS = Object.freeze({
  // act-attack — lean-in lunge toward target + snap back (§A). `along` peaks mid-tween then returns.
  "act-attack": Object.freeze({
    dur: 260, persist: false,
    keyframes: [ kf(0, {}), kf(0.45, { along: 0.55 }), kf(1, { along: 0 }) ]
  }),
  // act-cast — rise 0.2 cells + hold + settle (§A; the casting glow itself rides the EFFECTS layer,
  // §B — out of scope for this unit, this verb only lifts the standee).
  "act-cast": Object.freeze({
    dur: 620, persist: false,
    keyframes: [ kf(0, {}), kf(0.3, { dy: 0.2 }), kf(0.7, { dy: 0.2 }), kf(1, { dy: 0 }) ]
  }),
  // move-step — hop-slide per cell (§A: "the DM's mechanical repositioning uses this too"). Ends AT
  // the target (along:1) — persist:true, since the standee really did move there; unlike act-attack's
  // lunge-and-return, there is no "base" to snap back to once the step is done.
  "move-step": Object.freeze({
    dur: 420, persist: true,
    keyframes: [ kf(0, {}), kf(0.5, { along: 0.5, dy: 0.15 }), kf(1, { along: 1, dy: 0 }) ]
  }),
  // hit-damage — shake + white flash + brief red tint (§A).
  "hit-damage": Object.freeze({
    dur: 220, persist: false,
    keyframes: [
      kf(0, {}),
      kf(0.15, { jx: 0.06, tintMix: 1, tintColor: 0xffffff }),
      kf(0.35, { jx: -0.05, tintMix: 0.6, tintColor: 0xff3030 }),
      kf(0.6, { jx: 0.03, tintMix: 0.25, tintColor: 0xff3030 }),
      kf(1, { jx: 0, tintMix: 0, tintColor: 0xff3030 })
    ]
  }),
  // hit-crit — hit-damage PLUS squash-stretch (§A: "hit-crit adds squash-stretch"). A separate keyframe
  // table (not a runtime composition of hit-damage's) so both verbs stay independently introspectable —
  // matches this module's declarative-table design (a verb IS its table, not a table plus a patch).
  "hit-crit": Object.freeze({
    dur: 300, persist: false,
    keyframes: [
      kf(0, {}),
      kf(0.15, { jx: 0.08, tintMix: 1, tintColor: 0xffffff, scale: 1.15, scaleY: 0.85 }),
      kf(0.35, { jx: -0.06, tintMix: 0.7, tintColor: 0xff3030, scale: 0.9, scaleY: 1.15 }),
      kf(0.6, { jx: 0.03, tintMix: 0.3, tintColor: 0xff3030, scale: 1.05, scaleY: 0.97 }),
      kf(1, { jx: 0, tintMix: 0, tintColor: 0xff3030, scale: 1, scaleY: 1 })
    ]
  }),
  // fall-death — tip-over (rotate to floor plane) + desaturate; corpse stays as a card (§A + §G open
  // item 1, "DF-brain says forever" — this build leaves persistence open-ended/forever, the cheaper
  // default; a future N-round fade is additive, not a breaking change to this verb's contract).
  // tiltX drives the WRAPPER (never the outer group — see THE COMPOSITION CONTRACT above).
  // Desaturate is approximated as a tint-blend toward neutral gray (0x808080) rather than a true
  // per-pixel luminance desaturation — MeshBasicMaterial.color is a multiplicative tint, not a
  // grayscale filter, and SPRITE PURITY already forbids touching the material's map/shader to do a
  // real desaturate; the tint-blend approximation stays within "tint... on the group's material clone."
  "fall-death": Object.freeze({
    dur: 480, persist: true,
    keyframes: [
      kf(0, {}),
      kf(0.6, { tiltX: Math.PI / 2 * 0.75 }),
      kf(1, { tiltX: Math.PI / 2, tintMix: 0.85, tintColor: 0x808080 })
    ]
  }),
  // heal / buff / debuff — pulse tints, green/gold/violet whisper (§A).
  heal: Object.freeze({
    dur: 500, persist: false,
    keyframes: [ kf(0, {}), kf(0.4, { tintMix: 0.55, tintColor: 0x4ec96a }), kf(1, { tintMix: 0, tintColor: 0x4ec96a }) ]
  }),
  buff: Object.freeze({
    dur: 500, persist: false,
    keyframes: [ kf(0, {}), kf(0.4, { tintMix: 0.55, tintColor: 0xd8b34a }), kf(1, { tintMix: 0, tintColor: 0xd8b34a }) ]
  }),
  debuff: Object.freeze({
    dur: 500, persist: false,
    keyframes: [ kf(0, {}), kf(0.4, { tintMix: 0.55, tintColor: 0x8a5ec9 }), kf(1, { tintMix: 0, tintColor: 0x8a5ec9 }) ]
  }),
  // guise-swap — NOT a keyframe table (see header): dispatched to vGuiseSwap below.
  "guise-swap": Object.freeze({ dur: 500, persist: true, special: "guise-swap" })
});

export const STANDEE_VERB_NAMES = Object.freeze(Object.keys(STANDEE_VERBS));

/* ---------------------------------------------------------------------------
   ctx binding — see header "ctx binding" section.
   --------------------------------------------------------------------------- */
let _ctx = null;
export function bindStandeeCtx(ctx){ _ctx = ctx || null; }

function pushTween(dur, onUpdate, onDone){
  if(!_ctx || !_ctx.tweens) return false;
  _ctx.tweens.push({ start: Date.now(), dur: Math.max(1, dur), update: onUpdate, onDone: onDone || null });
  if(typeof _ctx.markDirty === "function") _ctx.markDirty();
  return true;
}

/* ensureWrap — lazily reparents a standee's mesh into an inner wrapper Group the FIRST time any verb
   on this group needs local rotation (fall-death only, in v1). Idempotent (group.userData.standeeWrap
   caches it). See THE COMPOSITION CONTRACT above for why this exists at all. */
function ensureWrap(group, mesh){
  if(group.userData.standeeWrap) return group.userData.standeeWrap;
  if(!_ctx || !_ctx.THREE) return null;
  const THREE = _ctx.THREE;
  const wrap = new THREE.Group();
  const kids = group.children.slice();
  kids.forEach((c) => { group.remove(c); wrap.add(c); });
  group.add(wrap);
  group.userData.standeeWrap = wrap;
  return wrap;
}

/* resolveStandee — validates `group` looks like a billboard standee (buildSpriteBillboard's own
   contract: userData.sprite=true + userData.spriteBillboardMesh set, theater-boot.js) and returns the
   working handles a verb needs. Returns null (clean no-op, never throws) for anything else — a whole-
   object/glb figure, an unmounted group, or a bare THREE.Group with no sprite mesh. */
function resolveStandee(group){
  if(!group || !group.userData || !group.userData.sprite) return null;
  const mesh = group.userData.spriteBillboardMesh;
  if(!mesh || !mesh.material) return null;
  return { group, mesh };
}

/* cloneMaterialForTween — same clone-for-tween idiom theater-verbs.js's vHurt/vDown/vObliterate use for
   SHARED whole-object materials, applied here unconditionally (billboard materials are per-instance
   already — buildSpriteBillboard allocates a fresh MeshBasicMaterial per group — so there's no sharing
   hazard to guard against, but cloning still keeps the ORIGINAL material's .color pristine as the
   "base" every non-persistent verb reverts to, and gives dev/verify-standee-verbs.mjs's purity check a
   single clear invariant: `clone.map === original.map` always, `mesh.material === original` again once
   a non-persistent verb's onDone runs). The texture handle is copied BY REFERENCE, never cloned/mutated
   — SPRITE PURITY's letter. */
function cloneMaterialForTween(mesh){
  const orig = mesh.material;
  const clone = orig.clone();
  clone.map = orig.map; // same texture object — purity: the map itself is never touched
  mesh.material = clone;
  return { orig, clone };
}

/* runKeyframeVerb — the generic executor every non-special STANDEE_VERBS entry shares (§A's own
   "phases of translate/rotate/scale/tint/flash" vocabulary, made data). */
function runKeyframeVerb(standee, spec, opts){
  const { group, mesh } = standee;
  const THREE = _ctx.THREE;
  const baseX = group.position.x, baseY = group.position.y, baseZ = group.position.z;
  const baseScaleX = group.scale.x, baseScaleY = group.scale.y, baseScaleZ = group.scale.z;
  const needsTilt = spec.keyframes.some((k) => k.tiltX !== 0);
  const wrap = needsTilt ? ensureWrap(group, mesh) : (group.userData.standeeWrap || null);
  const baseTiltX = wrap ? wrap.rotation.x : 0;

  const target = (opts && opts.targetPos && typeof opts.targetPos.x === "number" && typeof opts.targetPos.z === "number")
    ? opts.targetPos : null;
  const deltaX = target ? (target.x - baseX) : 0;
  const deltaZ = target ? (target.z - baseZ) : 0;

  const { orig: origMat, clone: mat } = cloneMaterialForTween(mesh);
  const baseColor = origMat.color ? origMat.color.clone() : (THREE ? new THREE.Color(1, 1, 1) : null);
  const baseOpacity = typeof origMat.opacity === "number" ? origMat.opacity : 1;
  const tintTarget = THREE ? new THREE.Color() : null;

  const ok = pushTween(spec.dur, (t) => {
    const s = sampleKeyframes(spec.keyframes, t);
    // jx is a LOCAL lateral jitter independent of the target-facing `along` axis (hit-damage/hit-crit's
    // shake has no target at all) — added onto the along-driven X so a verb combining both (none in v1,
    // but the field composes correctly if one ever does) gets both contributions, not one clobbering
    // the other.
    group.position.set(baseX + deltaX * s.along + s.jx, baseY + s.dy, baseZ + deltaZ * s.along);
    if(wrap) wrap.rotation.x = s.tiltX;
    group.scale.set(baseScaleX * s.scale, baseScaleY * s.scale * s.scaleY, baseScaleZ * s.scale);
    if(baseColor && mat.color){
      tintTarget.setHex(s.tintColor);
      mat.color.setRGB(
        lerp(baseColor.r, tintTarget.r, s.tintMix),
        lerp(baseColor.g, tintTarget.g, s.tintMix),
        lerp(baseColor.b, tintTarget.b, s.tintMix)
      );
    }
    mat.opacity = baseOpacity * s.opacity;
  }, () => {
    if(spec.persist){
      // terminal state: leave the tween-local clone in place (mirrors theater-verbs.js's vDown — "the
      // clone is intentionally left standing... nothing to restore"). Position/scale/tilt/tint stay at
      // whatever the final keyframe left them.
      if(typeof opts.onDone === "function") opts.onDone();
      return;
    }
    group.position.set(baseX, baseY, baseZ);
    group.scale.set(baseScaleX, baseScaleY, baseScaleZ);
    if(wrap) wrap.rotation.x = baseTiltX;
    mesh.material = origMat;
    if(mat.dispose) mat.dispose();
    if(typeof opts.onDone === "function") opts.onDone();
  });
  return ok;
}

/* guise-swap — crossfade texture + scale to the new form (§A, GUISE G3's verb). The one NAMED exception
   to "never touch material.map" (see header). Requires opts.newTexture (a live THREE.Texture the caller
   already resolved off the sprite registry/cache — this module never loads textures itself, matching
   its zero-DOM-coupling posture); a missing/falsy newTexture is a clean no-op (false), same as every
   theater-verbs.js verb's unresolvable-reference contract. */
function runGuiseSwap(standee, spec, opts){
  const { group, mesh } = standee;
  if(!opts || !opts.newTexture) return false;
  const THREE = _ctx.THREE;
  const baseScaleX = group.scale.x, baseScaleY = group.scale.y, baseScaleZ = group.scale.z;
  const { orig: origMat, clone: mat } = cloneMaterialForTween(mesh);
  const baseOpacity = typeof origMat.opacity === "number" ? origMat.opacity : 1;
  let swapped = false;
  const ok = pushTween(spec.dur, (t) => {
    // first half: fade the OLD sprite out while it shrinks slightly toward the swap point; second half:
    // the NEW texture (already bound at the midpoint, below) fades back in while scaling back to base.
    const bump = 1 + 0.15 * Math.sin(t * Math.PI); // a single scale bump spanning the whole crossfade
    group.scale.set(baseScaleX * bump, baseScaleY * bump, baseScaleZ * bump);
    if(t >= 0.5 && !swapped){
      mat.map = opts.newTexture; // the ONE place in this file a verb reassigns material.map
      if(THREE) mat.needsUpdate = true;
      swapped = true;
    }
    mat.opacity = t < 0.5 ? lerp(baseOpacity, 0.1, t / 0.5) : lerp(0.1, baseOpacity, (t - 0.5) / 0.5);
  }, () => {
    group.scale.set(baseScaleX, baseScaleY, baseScaleZ);
    if(!swapped){ mat.map = opts.newTexture; if(THREE) mat.needsUpdate = true; }
    mat.opacity = baseOpacity;
    // persist:true (spec) — the swapped-texture clone stays bound; there is no "original form" to
    // revert to once a guise transformation completes (mirrors fall-death's persistence rationale).
    if(typeof opts.onDone === "function") opts.onDone();
  });
  return ok;
}

/* ============================================================================
   BEAUTY-WAVE.md VP6 item 1 — IDLE-BREATHE. Deliberately NOT a STANDEE_VERBS registry entry: every
   other verb in that table is a one-shot beat driven by playStandeeVerb's generic keyframe executor
   (a discrete combat/action event), while idle-breathe is a CONTINUOUS ambient loop that auto-plays on
   every living piece for as long as its board stays mounted, gets paused (not cancelled) the instant
   any other verb plays on the same standee, and resumes afterward — a fundamentally different lifecycle
   than "play once, revert or persist." Folding it into STANDEE_VERBS would need a `loop:true` special
   case bolted onto runKeyframeVerb's revert-or-persist binary for a shape that fits neither, and would
   also break dev/verify-standee-verbs.mjs's existing A1d "no unknown/stray verbs beyond §A's v1 list"
   completeness check for a verb §A's OWN v1 list never named. So it's its own small state machine below,
   sharing only the same ctx.tweens ticker (bindStandeeCtx/pushTween, above) every other verb already
   rides — "the existing tween tick loop" the wider VP6 spec calls for, not a second animation channel.

   ±1.5% scaleY, a 2.4s loop, PHASE-OFFSET per piece by a seeded hash of its own group/seed key (so a
   room full of standees never breathes in visible unison — dev/verify-vp6-life-pass.mjs's phase-desync
   check). Corpses (group.userData.corpse, stamped by fall-death below) never breathe — checked both at
   start (a corpse never gets a fresh cycle) and permanently after any fall-death (stopIdleBreathe with
   cancel:true, so a resume attempted by a LATER verb's onDone can never restart it).
   ============================================================================ */
const IDLE_BREATHE_DUR = 2400;   // ms per full cycle
const IDLE_BREATHE_AMP = 0.015;  // ±1.5% scaleY

// small deterministic string hash -> [0,1) phase — same "cheap FNV-ish hash, no Math.random" posture
// every other seeded spot in this codebase uses; a piece's OWN seed key (its slug/id, whatever the
// caller passes) always yields the SAME phase, so re-mounting the same room doesn't re-roll who's
// synced with whom.
function seededPhase(key){
  let h = 2166136261 >>> 0;
  const s = String(key == null ? Math.random() : key);
  for(let i = 0; i < s.length; i++){ h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0; }
  return (h >>> 8) / 16777216; // top 24 bits -> [0,1)
}

/* startIdleBreathe(group, seedKey) — begins (or continues) the loop on a resolved standee. A clean
   no-op (false) for: no ctx bound, a non-standee group, or a corpse. Idempotent — calling it on an
   already-breathing standee just returns true without stacking a second cycle. */
export function startIdleBreathe(group, seedKey){
  if(!_ctx || !_ctx.tweens) return false;
  const standee = resolveStandee(group);
  if(!standee) return false;
  if(group.userData.corpse) return false; // corpses (fall-death) never breathe — MECHANICAL, checked here too
  if(group.userData.idleBreatheActive) return true; // already running — no-op, not a stacked second cycle
  group.userData.idleBreatheActive = true;
  group.userData.idleBreatheCancel = false;
  const phase = seededPhase(seedKey != null ? seedKey : group.userData.spriteSlug);
  runBreatheCycle(standee, phase);
  return true;
}

/* one loop cycle. `phaseFrac` in [0,1) is how far INTO the 2.4s cycle this particular cycle should
   start sampling at (only ever nonzero on the FIRST cycle — the phase-offset itself; every subsequent
   cycle for the same standee starts fresh at phaseFrac=0, since the desync is "this piece's clock
   started at a different moment," not "this piece's cycle is a different length"). Modeled as a
   SHORTER first tween (dur scaled by the remaining fraction of the cycle) whose `update(t)` maps back
   onto the full [0,1) sine phase — sampleAt(tween, t) in the harness can therefore assert two
   differently-phased standees show different scaleY at the SAME t without needing real wall-clock
   timers. */
function runBreatheCycle(standee, phaseFrac){
  const { group } = standee;
  if(!group.userData.idleBreatheActive || group.userData.idleBreatheCancel) return;
  const baseScaleY = group.scale.y;
  const remaining = 1 - (phaseFrac || 0);
  const dur = Math.max(1, IDLE_BREATHE_DUR * remaining);
  const startFrac = phaseFrac || 0;
  pushTween(dur, (t) => {
    const full = startFrac + t * remaining; // 0..1 across the FULL cycle, offset by this piece's phase
    group.scale.y = baseScaleY * (1 + IDLE_BREATHE_AMP * Math.sin(full * Math.PI * 2));
  }, () => {
    group.scale.y = baseScaleY;
    if(group.userData.idleBreatheActive && !group.userData.idleBreatheCancel){
      runBreatheCycle(standee, 0); // every subsequent cycle starts at phase 0 — the offset already happened once
    }
  });
}

/* stopIdleBreathe(group, cancel) — pauses the loop (cancel falsy — a verb about to play resumes it
   afterward) or permanently cancels it (cancel:true — fall-death's corpse carve-out; no later resume
   attempt can restart it, since playStandeeVerb's own resume() checks idleBreatheCancel is untouched
   here on purpose — it stays true forever once fall-death sets it). Null-safe. */
export function stopIdleBreathe(group, cancel){
  if(!group || !group.userData) return;
  group.userData.idleBreatheActive = false;
  if(cancel) group.userData.idleBreatheCancel = true;
}

/* ============================================================================
   Public dispatch — playStandeeVerb(pieceOrUnitGroup, verbName, opts). See header for the exact
   signature rationale (§A's call shape, ctx bound separately via bindStandeeCtx). Returns false
   (never throws) for: no ctx bound yet, an unresolvable/non-standee group, or an unknown verb name —
   matching theater-verbs.js's playVerb's own null-safety contract exactly.

   VP6 addendum: any OTHER verb (every §A v1 entry) pauses idle-breathe for its own duration if it was
   running, then resumes it once the verb's tween completes — UNLESS the verb was fall-death, which
   instead marks the standee a permanent corpse (idle-breathe cancelled for good, per item 1's own
   "corpses never breathe" rule). "idle-breathe" itself is dispatched to startIdleBreathe directly
   (opts.seedKey optional), not through the generic keyframe executor (see the block above for why).
   ============================================================================ */
export function playStandeeVerb(pieceOrUnitGroup, verbName, opts){
  if(!_ctx) return false;
  if(verbName === "idle-breathe"){
    return startIdleBreathe(pieceOrUnitGroup, opts && opts.seedKey);
  }
  const spec = STANDEE_VERBS[verbName];
  if(!spec) return false;
  const standee = resolveStandee(pieceOrUnitGroup);
  if(!standee) return false;
  opts = opts || {};
  const wasBreathing = !!pieceOrUnitGroup.userData.idleBreatheActive;
  if(wasBreathing) stopIdleBreathe(pieceOrUnitGroup, false); // PAUSE only — resumed below unless fall-death
  const userOnDone = opts.onDone;
  const withResume = Object.assign({}, opts, {
    onDone(){
      if(typeof userOnDone === "function") userOnDone();
      if(verbName === "fall-death"){
        pieceOrUnitGroup.userData.corpse = true;
        stopIdleBreathe(pieceOrUnitGroup, true); // corpses never breathe again — permanent
        return;
      }
      if(wasBreathing) startIdleBreathe(pieceOrUnitGroup, opts.seedKey); // resume after the other verb
    }
  });
  if(spec.special === "guise-swap") return runGuiseSwap(standee, spec, withResume);
  return runKeyframeVerb(standee, spec, withResume);
}
