/* GENESIS MODULE — src/ui/theater-verbs.js — BATTLE-THEATER T3 (docs/BATTLE-THEATER.md §4)
   THE VERB LIBRARY. A parallel ES-module boundary file to src/ui/theater-boot.js — kept SEPARATE
   (its own file, its own manifest entry, its own `<script type="module">` tag) specifically so this
   unit doesn't collide with parallel units editing theater-boot.js's figure geometry / palette
   constants (the orchestrator's file-split instruction for this wave). theater-boot.js imports this
   module and exposes `Theater.play(verb, opts)` + the tween tick loop as its own small wiring layer;
   ALL the verb definitions, tween math, and FX-primitive construction live HERE.

   Design (§4): "A small library of named verbs, each a cheap parametric tween on position/rotation/
   scale — no skeletal rigs in v1. The engine owns WHEN (events); the theater owns HOW it looks."

   Public surface (imported by theater-boot.js):
     THEATER_VERBS            -> frozen array of every verb name this library supports (§4's table +
                                  the FX-primitive damage-type set), the single source of truth
                                  dev/verify-theater-verbs.mjs checks completeness against.
     playVerb(ctx, verb, opts) -> bool. `ctx` is theater-boot.js's live scene handles (see below);
                                  returns false (no-op, never throws) for an unknown verb or a verb
                                  attempted before the ctx is ready (pre-mount) — mirrors theater-
                                  boot.js's own null-safe-before-mount discipline. Registers one or
                                  more live tweens into ctx.tweens (theater-boot.js's own array) and
                                  calls ctx.markDirty()/ctx.scheduleRender() to kick the render loop;
                                  it does NOT own the requestAnimationFrame loop itself (§ the spec's
                                  "render-on-demand — animate only while a tween is live" belongs to
                                  theater-boot.js's tick, this module only ever appends work to it).
     tickTweens(ctx, nowMs)   -> bool (true if any tween is still live this frame, so the caller knows
                                  whether to keep scheduling frames). Advances every live tween by
                                  elapsed time, applies its parametric position/rotation/scale, and
                                  retires it (removing from ctx.tweens + running any cleanup) once its
                                  duration elapses. Pure w.r.t. THIS module's own state — all mutation
                                  is on the THREE.Object3D handles ctx hands in, exactly like theater-
                                  boot.js's existing setBoard/setUnits pattern.
     damageTypeFx(ctx, kind, atPos) -> spawns a primitive burst (boxes/planes/THREE.Points) tinted +
                                  motion-signed by `kind` (fire/frost/lightning/necrotic/radiant/poison
                                  minimum, §4) at a world position, auto-retiring itself as a tween.

   `ctx` shape theater-boot.js hands in (documented here since this module has no other way to declare
   its dependency — it never imports THREE itself; every THREE.* handle it touches is one ctx passes,
   so this file has ZERO direct three.js coupling of its own beyond the values it's handed, keeping it
   trivially unit-testable in isolation if a future jsdom-with-stub-ctx harness wants that):
     ctx.THREE        — the live THREE namespace (theater-boot.js's own `import * as THREE from "three"`,
                         handed through rather than re-imported — one three.js instance in the app).
     ctx.scene        — the live THREE.Scene (for FX primitives to attach to; a dedicated ctx.fxGroup
                         is used when present so retire()/clearGroup() can sweep FX same as tiles/units).
     ctx.fxGroup      — a THREE.Group FX primitives are added to (theater-boot.js creates + clears it).
     ctx.unitGroup    — the live unit figures, keyed by id (ctx.findUnit(id) below) — verbs move THESE
                         Object3D handles directly (position/rotation/scale), never rebuild geometry.
     ctx.findUnit(id) — (unitId) -> THREE.Object3D | null. Resolves a unit id to its mounted figure
                         group (theater-boot.js's own unitGroup.children, tagged with .userData.unitId
                         at setUnits() time — see theater-boot.js's wiring comment).
     ctx.zoneToWorld(band, lane) -> {x,z} | null. Resolves a "band:lane" zone pair to the SAME world
                         tile-space coordinates theaterUnitsFrom already places units at (theater-
                         boot.js forwards this from the last setBoard's grid/origin bookkeeping) — so
                         `arc`/`advance`/`withdraw`/`knockback` land verbs exactly where a real unit
                         would be standing there, no coordinate drift between the two derivations.
     ctx.tweens        — theater-boot.js's live array this module pushes {id,start,dur,update,onDone}
                         entries onto; tickTweens() (this module) is the only thing that ever iterates
                         or splices it, so ownership stays single-threaded despite living in ctx.
     ctx.markDirty()   — theater-boot.js's render-on-demand dirty flag + scheduleRender() combo.
     ctx.camera        — the live THREE.Camera (absurdity's camera-shake verb nudges this directly,
                          restoring its base position once the shake tween completes).

   Headless-safety: this module is imported ONLY from theater-boot.js's module-scope import statement
   — it never touches `window` or `document` directly, so it loads cleanly under jsdom (a jsdom run
   that imports theater-boot.js will fail at `import * as THREE from "three"` regardless of this file,
   which is exactly why BATTLE-THEATER.md §2 keeps the GL half browser-smoke-tested, not jsdom-tested
   — this module's OWN pure-data pieces (THEATER_VERBS, the verb dispatch table's existence) are
   still importable/inspectable without a DOM via a dynamic import in a Node ESM context, which is
   what dev/verify-theater-verbs.mjs's verb-completeness check uses (see that file's own header). The
   stage_fx EVENT-CONTRACT plumbing (src/world/dm.js) is fully headless-safe on its own — it only ever
   calls `window.Theater?.play(...)`, a null-safe optional call theater-verbs.js has no part in when
   window.Theater is absent (jsdom/headless). */

/* ============================================================================
   §4 THE VERB TABLE — one entry per named verb. Each entry is a pure function
   (ctx, opts) -> tween spec(s) it registers into ctx.tweens. Kept as small parametric numeric tweens
   on position/rotation/scale per the spec's letter — no skeletal rigs, no per-frame allocation beyond
   what a single tween object needs (SPEED-DOCTRINE hygiene, matching theater-boot.js's own render-on-
   demand discipline). `opts` carries whatever the caller supplied (stage_fx's payload fields, or the
   EXISTING-event hook's own derived opts — see theaterFxFromLedger below).
   ============================================================================ */

const DEFAULT_DUR = {
  advance: 420, withdraw: 420, strike: 260, hurt: 220, down: 480, cast: 620,
  arc: 560, knockback: 380, sink: 420, burst: 420, flee: 900, absurdity: 900,
  obliterate: 620
};

/* the full verb vocabulary per §4's table, PLUS the FX damage-type keys (§4: "fire/frost/lightning/
   necrotic/radiant/poison minimum, each a tint + motion signature") exposed as their own addressable
   `fx:<type>` verbs so stage_fx can request a bare elemental burst with no unit motion attached (e.g.
   an environmental effect with no clean attacker/target). This is the SAME frozen array `stage_fx`'s
   applyEvent case (src/world/dm.js) validates an incoming verb name against — the single source of
   truth for "known verb" both here and in the EVENT-CONTRACT runtime. */
/* DEAD-STATE (2026-07-03, Adam's ruling — "obliterated by a crit or a spell or the environment...
   would vaporize them"): `obliterate` is the ONE new verb this pass adds — the exception to the
   default corpse/down state. It plays the burst+sink FX (this file's own existing vBurst/vSink
   primitives, aliased — see vObliterate below) and ends with the figure hidden; theater-boot.js's
   setUnits owns the RESTING state afterward (no figure at all, a scorch tile marker), matching how
   `down`'s terminal pose is split the same way (this file animates the transition, setUnits renders
   the settled state on every subsequent refresh). */
export const THEATER_VERBS = Object.freeze([
  "advance", "withdraw", "strike", "hurt", "down", "cast", "arc", "knockback",
  "sink", "burst", "flee", "absurdity", "obliterate",
  "fx:fire", "fx:frost", "fx:lightning", "fx:necrotic", "fx:radiant", "fx:poison"
]);

/* damage-type -> {tint, motion} — §4: "each a tint + motion signature." `motion` is a short tag the
   FX builder switches on to vary the primitive's shape/animation (burst=radial expand, spark=jittery
   points, surge=a stretched beam, drain=inward pull, pillar=vertical column, bubble=rising blobs) —
   distinct enough silhouettes that fire/frost/lightning/necrotic/radiant/poison never look alike even
   as flat-tinted primitives, matching the "primitive bursts... low cost to do a wide variety of
   things" ruling verbatim (BATTLE-THEATER.md §4). */
const DAMAGE_TYPE_FX = {
  fire:      { tint: 0xd25a2a, motion: "burst"  },
  frost:     { tint: 0x8fd0e6, motion: "bubble"  }, // "frost" per §4's literal table name (aliases "cold")
  cold:      { tint: 0x8fd0e6, motion: "bubble"  },
  lightning: { tint: 0xe8e14a, motion: "spark"  },
  necrotic:  { tint: 0x4a2e4a, motion: "drain"  },
  radiant:   { tint: 0xf0e0a0, motion: "pillar" },
  poison:    { tint: 0x6a9c3c, motion: "bubble"  }
};
const DEFAULT_FX = { tint: 0xb8b0a0, motion: "burst" };

function fxFor(kind){
  const k = String(kind || "").toLowerCase();
  return DAMAGE_TYPE_FX[k] || DEFAULT_FX;
}

/* ---------------------------------------------------------------------------
   Tween primitives — every verb below composes from these two shapes:
     lerpTween(obj, field, from, to, dur, ease?, onDone?)   — vector/number lerp over a THREE field
     keyedTween(dur, onUpdate(t), onDone?)                   — an arbitrary per-frame callback, `t` in
                                                                 [0,1], for verbs that touch more than
                                                                 one Object3D field at once (e.g. strike's
                                                                 lunge+recoil, absurdity's multi-target
                                                                 shake+flicker).
   Both register into ctx.tweens as the SAME plain-object shape theater-boot.js's tickTweens loop
   (delegated to this module's own tickTweens, exported below) understands: {start,dur,update,onDone}.
   `start` is stamped at PUSH time (Date.now()) so a verb fired mid-frame doesn't inherit a stale clock.
   --------------------------------------------------------------------------- */
/* BEAUTY-WAVE-4.md MF-3 (2026-07-11): `meta` is an optional plain object Object.assign'd onto the
   pushed tween record (e.g. {unitId} tagging so a LATER hit can locate "the attacker's live tween" —
   see findLatestTweenByUnitId/triggerHitStop below). Purely additive: every existing call site that
   omits `meta` gets byte-identical tween objects to before this unit. Returns the pushed tween OBJECT
   (truthy) instead of a bare `true` — every existing caller only ever did `return pushTween(...)` or
   `!!pushTween(...)`, both of which stay correct against a truthy object, so this is a safe widening,
   not a breaking change; the new value lets THIS unit's own verbs (and a future caller) hand the live
   tween reference to applyHitStop/freezeTween without a second lookup. */
function pushTween(ctx, dur, onUpdate, onDone, meta){
  if(!ctx || !ctx.tweens) return false;
  const tw = { start: Date.now(), dur: Math.max(1, dur), update: onUpdate, onDone: onDone || null };
  if(meta) Object.assign(tw, meta);
  ctx.tweens.push(tw);
  if(typeof ctx.markDirty === "function") ctx.markDirty();
  return tw;
}

/* ============================================================================
   BEAUTY-WAVE-4.md MF-3 — IMPACT FEEL (hit-stop + response). Self-contained primitives, opt-in via new
   OPTIONAL opts/meta fields only (opts.attackerId, opts.recoilFrom/recoilDir, opts.crit) — no existing
   call site changes its default output, so dev/verify-theater-verbs.mjs / dev/verify-standee-verbs.mjs
   stay green unchanged (re-run, not just cited). "px-equivalent" has no prior canonical world-unit
   mapping anywhere in this codebase (grepped: only docs prose uses the phrase) — IMPACT_PX_UNIT below is
   THIS unit's own conversion anchor, sized off vHurt's existing 0.06-world-unit jitter amplitude (the
   only prior "small shake" reference point) reading as roughly a 2px shake at the tabletop's typical fit.
   ============================================================================ */
const IMPACT_PX_UNIT = 0.03; // world-units per "px-equivalent" (this unit's own anchor — see header)
const HIT_STOP_DUR = 60;      // ms, non-crit (BW4 MF-3 spec)
const HIT_STOP_DUR_CRIT = 90; // ms, crit (BW4 MF-3 spec)
const FALL_HOLD_DUR = 80;     // ms, fall-death hold-before-tip (BW4 MF-3 spec)
const CRIT_NUDGE_DUR = 120;   // ms, single-bounce settle (BW4 MF-3 spec)
const CRIT_NUDGE_AMP = 2 * IMPACT_PX_UNIT; // "2px-equivalent" (BW4 MF-3 spec)

/* freezeTween — stalls ONE tween's `t` fraction at its CURRENT value for `durMs`, then resumes smoothly
   (tickTweens below does the resume-shift). Never touches a tween already frozen (idempotent re-call —
   a tween can't be frozen twice into a longer window by accident; the caller decides the ONE window).
   Fake-clock testable via the optional `nowMs` (defaults to Date.now(), same convention as tickTweens
   itself taking an explicit nowMs). */
function freezeTween(tw, durMs, nowMs){
  if(!tw || tw.__freezeUntil != null) return false;
  const now = nowMs != null ? nowMs : Date.now();
  const elapsed = now - tw.start;
  const t = Math.max(0, Math.min(1, elapsed / tw.dur));
  tw.__frozenT = t;
  tw.__freezeUntil = now + Math.max(1, durMs);
  return true;
}

/* applyHitStop — freezes an explicit LIST of tween references (never "everything live" — the whole
   point of MF-3's law is the ACTION freezes while the WORLD (motes/flicker — neither of which ever rides
   ctx.tweens at all, see theater-boot.js's own separate moteRaf/flickerRaf headers — and MF-1's camera-
   pose tween, which DOES ride this same ctx.tweens array) keeps ticking). Belt-and-suspenders: even if a
   caller accidentally hands in a camera-pose tween, it's skipped here too (never frozen by this path). */
function applyHitStop(tweenRefs, durMs, nowMs){
  const now = nowMs != null ? nowMs : Date.now();
  let count = 0;
  (tweenRefs || []).forEach((tw) => {
    if(!tw || tw.isCameraPoseTween) return;
    if(freezeTween(tw, durMs, now)) count++;
  });
  return count;
}

/* findLatestTweenByUnitId — the most-recently-pushed LIVE tween tagged with this unitId (pushTween's
   `meta` param above). Scans from the end since ctx.tweens preserves push order for survivors across
   tickTweens' own splice-and-rebuild. Returns null for no match (clean no-op upstream). */
function findLatestTweenByUnitId(tweens, unitId){
  if(!tweens || unitId == null) return null;
  for(let i = tweens.length - 1; i >= 0; i--){
    if(tweens[i] && tweens[i].unitId === unitId) return tweens[i];
  }
  return null;
}

/* triggerHitStop — the MF-3 entry point a hit-resolution call site (or this file's own vHurt) uses to
   freeze BOTH sides of a hit. `targetTween` is normally the just-pushed hurt/hit-damage tween (handed in
   directly by the caller, since it already holds the reference); `attackerId`, if given, is resolved
   against ctx.tweens to find the attacker's own in-flight tween (its lunge/act-attack) and freeze it at
   ITS current pose too — "at the contact frame" for both sides. A missing/unresolvable attacker is a
   graceful partial (target-only freeze), never a throw — matches this file's own null-safety posture. */
function triggerHitStop(ctx, opts){
  opts = opts || {};
  const now = opts.nowMs != null ? opts.nowMs : Date.now();
  const durMs = opts.crit ? HIT_STOP_DUR_CRIT : HIT_STOP_DUR;
  const refs = [];
  if(opts.targetTween) refs.push(opts.targetTween);
  if(ctx && ctx.tweens && opts.attackerId != null){
    const attackerTw = findLatestTweenByUnitId(ctx.tweens, opts.attackerId);
    if(attackerTw && attackerTw !== opts.targetTween) refs.push(attackerTw);
  }
  return applyHitStop(refs, durMs, now);
}

/* critCameraNudge — hit-crit's 2px-equivalent single-bounce camera nudge (MF-3 bullet 3). ONE hump
   (Math.sin(t*PI) rises then falls exactly once across CRIT_NUDGE_DUR — never a repeating shake), never
   fought against an in-flight MF-1 camera-pose tween: if one is live, this is a clean no-op (settle
   cleanly per the spec's own wording, rather than two tweens racing to write ctx.camera.position the
   same frame). Restores the exact base position on completion. */
function critCameraNudge(ctx, opts, nowMs){
  if(!ctx || !ctx.camera) return false;
  if(ctx.tweens && ctx.tweens.some((tw) => tw && tw.isCameraPoseTween)) return false;
  opts = opts || {};
  const camera = ctx.camera;
  const baseX = camera.position.x, baseY = camera.position.y;
  const dir = (opts.dir && typeof opts.dir.x === "number") ? opts.dir : { x: 0, y: 1 };
  const amp = opts.amp != null ? opts.amp : CRIT_NUDGE_AMP;
  const dur = opts.dur != null ? opts.dur : CRIT_NUDGE_DUR;
  return pushTween(ctx, dur, (t) => {
    const bounce = Math.sin(Math.max(0, Math.min(1, t)) * Math.PI); // one hump: 0 -> 1 -> 0, never repeats
    camera.position.x = baseX + dir.x * amp * bounce;
    camera.position.y = baseY + dir.y * amp * bounce;
  }, () => {
    camera.position.x = baseX;
    camera.position.y = baseY;
  }, { isCritNudge: true });
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutQuad = (t) => (t < 0.5) ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function lerp(a, b, t){ return a + (b - a) * t; }

/* resolves an {x,z} world point for a verb's `who`/`from`/`to` opts. Accepts either a unit id (looked
   up via ctx.findUnit -> its live position) or a "band:lane" zone string (via ctx.zoneToWorld) or a
   literal {x,z} — covers stage_fx's free-form `who?/from?/to?` payload (§4: "the DM's hand for
   improvised beats") without forcing every caller to pre-resolve coordinates. Returns null (verb no-
   ops for that field) rather than throwing on an unresolvable reference. */
function resolvePoint(ctx, ref){
  if(ref == null) return null;
  if(typeof ref === "object" && typeof ref.x === "number" && typeof ref.z === "number") return { x: ref.x, z: ref.z };
  if(typeof ref === "string" && ref.indexOf(":") >= 0 && typeof ctx.zoneToWorld === "function"){
    const parts = ref.split(":");
    const p = ctx.zoneToWorld(parts[0], parts[1]);
    if(p) return p;
  }
  if(typeof ctx.findUnit === "function"){
    const obj = ctx.findUnit(ref);
    if(obj) return { x: obj.position.x, z: obj.position.z };
  }
  return null;
}

function resolveUnit(ctx, id){
  if(!id || typeof ctx.findUnit !== "function") return null;
  return ctx.findUnit(id);
}

/* ============================================================================
   Verb implementations. Each: (ctx, opts) -> bool (whether a tween was actually registered — false
   for an unresolvable unit/point, which the caller treats as a clean no-op, never a throw).
   ============================================================================ */

/* advance/withdraw — glide between zone centers (§4, fired by move_zone). `opts.who` (unit id),
   `opts.to` (zone string or point) required; `withdraw` is the same tween with an implied "step back"
   read (no geometric difference beyond which direction the caller already computed into `to` — the
   verb name itself is the semantic distinction the ledger/prose care about, matching move_zone's
   existing to/from zone strings 1:1). */
function vAdvance(ctx, opts){
  const obj = resolveUnit(ctx, opts.who);
  const to = resolvePoint(ctx, opts.to);
  if(!obj || !to) return false;
  const fromX = obj.position.x, fromZ = obj.position.z;
  return pushTween(ctx, opts.dur || DEFAULT_DUR.advance, (t) => {
    const e = easeOutCubic(t);
    obj.position.x = lerp(fromX, to.x, e);
    obj.position.z = lerp(fromZ, to.z, e);
  });
}
const vWithdraw = vAdvance; // §4: same glide-between-zone-centers tween; direction lives in the caller's to/from

/* strike — lunge toward target + recoil (§4, attack/foe_action hit or miss; miss = overshoot). A
   there-and-back keyed tween: first half eases toward (a fraction short of) the target, second half
   eases back to the start. On a MISS, the lunge overshoots past the target point before recoiling
   (opts.miss truthy) — the visual tell that the swing didn't connect. */
function vStrike(ctx, opts){
  const obj = resolveUnit(ctx, opts.who);
  const target = resolvePoint(ctx, opts.to);
  if(!obj || !target) return false;
  const fromX = obj.position.x, fromZ = obj.position.z;
  const reach = opts.miss ? 1.15 : 0.55; // hit stops short of the target tile; a miss overshoots past it
  const peakX = lerp(fromX, target.x, reach), peakZ = lerp(fromZ, target.z, reach);
  return pushTween(ctx, opts.dur || DEFAULT_DUR.strike, (t) => {
    const out = t < 0.5;
    const local = out ? (t / 0.5) : ((t - 0.5) / 0.5);
    const e = out ? easeOutCubic(local) : easeInOutQuad(local);
    obj.position.x = out ? lerp(fromX, peakX, e) : lerp(peakX, fromX, e);
    obj.position.z = out ? lerp(fromZ, peakZ, e) : lerp(peakZ, fromZ, e);
  }, () => { obj.position.x = fromX; obj.position.z = fromZ; },
  { unitId: opts.who }); // MF-3: tags the attacker's own lunge tween so a later hit can freeze it (triggerHitStop's attackerId lookup)
}

/* hurt — flash + jitter (§4, damage application). Flashes the figure's material emissive/color toward
   white-hot then back (via a tiny material color lerp on every mesh in the group — cheap, no shader),
   and applies a small positional jitter (a few quick shakes, amplitude decaying to 0). Reads
   opts.magnitude (default 1) to scale jitter amplitude — a bigger hit shakes harder, the same
   magnitude-scaling idiom `absurdity` uses at full strength. */
function vHurt(ctx, opts){
  const obj = resolveUnit(ctx, opts.who);
  if(!obj) return false;
  const baseX = obj.position.x, baseZ = obj.position.z;
  const amp = 0.06 * Math.max(0.4, Math.min(3, opts.magnitude || 1));
  // MF-3 directional recoil (bullet 2): opts.recoilFrom (a unit id / zone / point — same resolvePoint
  // contract every other verb here uses) biases the shake AWAY from the attacker instead of the old
  // fixed x/x*0.4 mix. Omitted opts.recoilFrom (every pre-MF-3 call site) reproduces the OLD mix
  // byte-for-byte (biasX=1, biasZ=0.4) — zero behavior change for dev/verify-theater-verbs.mjs.
  let biasX = 1, biasZ = 0.4;
  const recoilPt = opts.recoilFrom != null ? resolvePoint(ctx, opts.recoilFrom) : null;
  if(recoilPt){
    const dx = baseX - recoilPt.x, dz = baseZ - recoilPt.z;
    const len = Math.hypot(dx, dz) || 1;
    biasX = dx / len; biasZ = dz / len;
  }
  const meshes = [];
  obj.traverse((n) => { if(n.material && n.material.color) meshes.push(n); });
  // A1 (REVIEW-FIXES-0705-VISUAL §W2-A): whole-object figures share ONE material array per opacity
  // (WHOLE_MATERIALS_CACHE, theater-boot.js) — mutating `material.color` in place here would flash/
  // gray every co-sharing figure on the board, and a second concurrent hurt/down tween would race on
  // the same color. Ruled fix: clone-for-tween, not skip. Any mesh whose material is tagged shared
  // (userData.shared, the same convention disposeMeshMaybeShared already respects) gets a per-tween
  // clone swapped onto the mesh; the clone's `map` is copied BY REFERENCE (never clone the texture —
  // it's the same cached CanvasTexture every other sharer also points at). onDone restores the
  // ORIGINAL shared material instance and disposes the clone. Non-shared materials keep the plain
  // direct-mutation path (cheap, correct, unchanged).
  const origMaterials = meshes.map((m) => m.material);
  const origColors = meshes.map((m) => m.material.color.clone());
  const tweenMaterials = meshes.map((m) => {
    if(m.material && m.material.userData && m.material.userData.shared){
      const clone = m.material.clone();
      clone.map = m.material.map; // copy the texture handle by reference, never clone it
      clone.userData = Object.assign({}, m.material.userData, { shared: false, tweenClone: true });
      m.material = clone;
      return clone;
    }
    return m.material;
  });
  const tw = pushTween(ctx, opts.dur || DEFAULT_DUR.hurt, (t) => {
    const decay = 1 - t;
    const shake = Math.sin(t * Math.PI * 8) * amp * decay;
    obj.position.x = baseX + shake * biasX;
    obj.position.z = baseZ + shake * biasZ;
    const flash = Math.max(0, 1 - t * 2.2); // flashes bright in the first ~45% of the tween, then fades
    tweenMaterials.forEach((mat, i) => {
      const orig = origColors[i];
      mat.color.setRGB(
        lerp(orig.r, 1, flash), lerp(orig.g, 1, flash), lerp(orig.b, 1, flash)
      );
    });
  }, () => {
    obj.position.x = baseX; obj.position.z = baseZ;
    meshes.forEach((m, i) => {
      const tweenMat = tweenMaterials[i];
      m.material = origMaterials[i];
      if(tweenMat !== origMaterials[i] && tweenMat.dispose) tweenMat.dispose();
    });
  }, { unitId: opts.who });
  // MF-3 HIT-STOP (bullet 1): opt-in via opts.attackerId (a NEW optional field — every pre-MF-3 call
  // site omits it, so this is a clean no-op for them, zero regression risk). Freezes THIS just-pushed
  // hurt tween + the attacker's own live tween (found by unitId tag) at the contact frame.
  if(tw && opts.attackerId != null){
    triggerHitStop(ctx, { targetTween: tw, attackerId: opts.attackerId, crit: !!opts.crit });
  }
  return !!tw;
}

/* down — topple 90deg + desaturate (§4, foe/PC hits 0). A one-way rotate-to-prone + a material
   grayscale lerp (desaturate toward each mesh's own luminance — keeps relative shading, kills hue,
   the cheap no-shader desaturate trick). Terminal state persists after the tween ends (no onDone
   revert) — the figure STAYS toppled/gray, matching setUnits' own existing `u.down` prone rotation
   (theater-boot.js) so a later setUnits() re-render and this tween agree on the resting pose. */
function vDown(ctx, opts){
  const obj = resolveUnit(ctx, opts.who);
  if(!obj) return false;
  const fromRot = obj.rotation.z;
  const toRot = Math.PI / 2;
  const meshes = [];
  obj.traverse((n) => { if(n.material && n.material.color) meshes.push(n); });
  // A1 (REVIEW-FIXES-0705-VISUAL §W2-A): same clone-for-tween guard as vHurt above — down's material
  // desaturate must not corrupt a SHARED whole-object material array (every co-sharing figure at that
  // opacity would gray out with it). Terminal state (down persists, no onDone revert per this verb's
  // own contract) means the clone is intentionally left standing on the mesh after the tween — the
  // figure really IS toppled/gray forever, so there is nothing to restore. A LATER setUnits() refresh
  // rebuilds this figure's mesh from scratch (theater-boot.js's own gray-geometry-variant swap for
  // whole-object corpses), which naturally drops this clone's reference for GC — no explicit dispose
  // needed here since the mesh itself is torn down by clearGroup on the next render, same as any other
  // per-tween clone that outlives its tween.
  const origColors = meshes.map((m) => m.material.color.clone());
  meshes.forEach((m) => {
    if(m.material && m.material.userData && m.material.userData.shared){
      const clone = m.material.clone();
      clone.map = m.material.map; // copy the texture handle by reference, never clone it
      clone.userData = Object.assign({}, m.material.userData, { shared: false, tweenClone: true });
      m.material = clone;
    }
  });
  // MF-3 bullet 4 ("Kill weight"): fall-death/down gains an UNCONDITIONAL 80ms hit-stop hold BEFORE the
  // tip begins — the beat lands, THEN the mini falls. Modeled as a hold-then-motion remap on the SAME
  // single tween (not two chained tweens, matching this file's own multi-phase convention — vStrike's
  // lunge+recoil, vAbsurdity's rift+shake): the pushed duration grows by FALL_HOLD_DUR, and `t` is
  // remapped past the hold fraction before driving the existing rotate/desaturate math untouched. At
  // t=1 the remap always lands at localT=1 (fully toppled/gray) — byte-identical FINAL state to before
  // this unit, so runToCompletion-style tests (which only sample update(1)/onDone) see no regression;
  // only the mid-flight timing gains the hold.
  const baseDur = opts.dur || DEFAULT_DUR.down;
  const totalDur = baseDur + FALL_HOLD_DUR;
  const holdFrac = FALL_HOLD_DUR / totalDur;
  return pushTween(ctx, totalDur, (t) => {
    const localT = t < holdFrac ? 0 : (t - holdFrac) / (1 - holdFrac);
    const e = easeInOutQuad(localT);
    obj.rotation.z = lerp(fromRot, toRot, e);
    meshes.forEach((m, i) => {
      const orig = origColors[i];
      const gray = orig.r * 0.299 + orig.g * 0.587 + orig.b * 0.114;
      m.material.color.setRGB(lerp(orig.r, gray, e), lerp(orig.g, gray, e), lerp(orig.b, gray, e));
    });
  }, null, { unitId: opts.who });
}

/* cast — rise + orbiting glyph quad (§4, fired by `cast`). Lifts the figure a small hover height and
   spawns a thin emissive quad (a stand-in "glyph") that orbits the figure's head height for the
   tween's duration, then despawns. The glyph is added to ctx.fxGroup (swept by theater-boot.js's
   existing clearGroup on the next setUnits/retire, same lifecycle as any other FX primitive here). */
function vCast(ctx, opts){
  const obj = resolveUnit(ctx, opts.who);
  if(!obj || !ctx.THREE || !ctx.fxGroup) return false;
  const THREE = ctx.THREE;
  const baseY = obj.position.y;
  const glyphColor = opts.tint != null ? opts.tint : 0xc9a24b;
  const geo = new THREE.PlaneGeometry(0.22, 0.22);
  const mat = new THREE.MeshBasicMaterial({ color: glyphColor, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const glyph = new THREE.Mesh(geo, mat);
  ctx.fxGroup.add(glyph);
  return pushTween(ctx, opts.dur || DEFAULT_DUR.cast, (t) => {
    const rise = Math.sin(Math.min(1, t * 1.6) * Math.PI * 0.5) * 0.18;
    obj.position.y = baseY + rise;
    const ang = t * Math.PI * 2.4;
    glyph.position.set(obj.position.x + Math.cos(ang) * 0.4, 1.3, obj.position.z + Math.sin(ang) * 0.4);
    glyph.rotation.y = ang;
    mat.opacity = 0.85 * Math.min(1, (1 - t) * 3);
  }, () => {
    obj.position.y = baseY;
    ctx.fxGroup.remove(glyph);
    geo.dispose(); mat.dispose();
  });
}

/* arc — parametric arc between ANY two points (§4: jump, thrown, grappling-hook swing). A simple
   parabolic lerp in x/z with a sinusoidal y-hump, `opts.height` scaling the arc's peak (default reads
   as a solid jump/swing arc; a caller can flatten it for a thrown-object read or heighten it for a
   dramatic swing). Works on either a live unit (opts.who) OR a bare FX marker (no `who` — a small
   placeholder box the caller doesn't otherwise track, e.g. staging a thrown item) via opts.asObject. */
function vArc(ctx, opts){
  const from = resolvePoint(ctx, opts.from) || (opts.who ? (() => { const o = resolveUnit(ctx, opts.who); return o ? { x: o.position.x, z: o.position.z } : null; })() : null);
  const to = resolvePoint(ctx, opts.to);
  if(!from || !to) return false;
  const obj = opts.who ? resolveUnit(ctx, opts.who) : null;
  let marker = null;
  if(!obj && ctx.THREE && ctx.fxGroup){
    const THREE = ctx.THREE;
    const geo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    const mat = new THREE.MeshBasicMaterial({ color: opts.tint != null ? opts.tint : 0xc9a24b });
    marker = new THREE.Mesh(geo, mat);
    marker.position.set(from.x, 0.2, from.z);
    ctx.fxGroup.add(marker);
  }
  const target = obj || marker;
  if(!target) return false;
  const baseY = target.position.y;
  const height = opts.height != null ? opts.height : 1.1;
  return pushTween(ctx, opts.dur || DEFAULT_DUR.arc, (t) => {
    const e = t; // linear param on the arc itself reads best (constant-speed hop), easing is on the hump only
    target.position.x = lerp(from.x, to.x, e);
    target.position.z = lerp(from.z, to.z, e);
    target.position.y = baseY + Math.sin(e * Math.PI) * height;
  }, () => {
    target.position.y = baseY;
    if(marker && ctx.fxGroup){ ctx.fxGroup.remove(marker); marker.geometry.dispose(); marker.material.dispose(); }
  });
}

/* knockback — fast slide + bounce (§4, shove/blast stage_fx). A fast ease-out slide away from
   opts.from (or the unit's current position if no `from` given) to opts.to, with a small bounce
   overshoot-and-settle on arrival (a brief y-hop at landing) rather than a hard stop. */
function vKnockback(ctx, opts){
  const obj = resolveUnit(ctx, opts.who);
  const to = resolvePoint(ctx, opts.to);
  if(!obj || !to) return false;
  const fromX = obj.position.x, fromZ = obj.position.z, baseY = obj.position.y;
  return pushTween(ctx, opts.dur || DEFAULT_DUR.knockback, (t) => {
    const slide = Math.min(1, t / 0.75);
    const e = easeOutCubic(slide);
    obj.position.x = lerp(fromX, to.x, e);
    obj.position.z = lerp(fromZ, to.z, e);
    const bounce = t > 0.75 ? Math.sin(((t - 0.75) / 0.25) * Math.PI) * 0.12 : 0;
    obj.position.y = baseY + bounce;
  }, () => { obj.position.y = baseY; });
}

/* sink / burst — descend into / erupt from a tile (§4, burrow, ambush reveal). `sink`: scale+y ease
   down into the floor and fade. `burst`: the reverse — starts sunk/scaled-down and erupts up to full
   scale/height. Same tween shape mirrored, matching the spec's pairing ("sink / burst" as one row). */
function vSink(ctx, opts){
  const obj = resolveUnit(ctx, opts.who);
  if(!obj) return false;
  const baseY = obj.position.y, baseScale = obj.scale.x;
  return pushTween(ctx, opts.dur || DEFAULT_DUR.sink, (t) => {
    const e = easeInOutQuad(t);
    obj.position.y = baseY - e * 0.6;
    obj.scale.setScalar(baseScale * (1 - e * 0.9));
  }, () => { obj.visible = false; obj.position.y = baseY; obj.scale.setScalar(baseScale); });
}
function vBurst(ctx, opts){
  const obj = resolveUnit(ctx, opts.who);
  if(!obj) return false;
  obj.visible = true;
  const baseY = obj.position.y, baseScale = obj.scale.x;
  obj.position.y = baseY - 0.6; obj.scale.setScalar(baseScale * 0.1);
  return pushTween(ctx, opts.dur || DEFAULT_DUR.burst, (t) => {
    const e = easeOutCubic(t);
    obj.position.y = lerp(baseY - 0.6, baseY, e);
    obj.scale.setScalar(lerp(baseScale * 0.1, baseScale, e));
  }, () => { obj.position.y = baseY; obj.scale.setScalar(baseScale); });
}

/* obliterate — DEAD-STATE (2026-07-03, Adam's ruling): the vaporization exception (crit magnitude>=8,
   an elemental spell kill, a fatal hazard, or a DM-declared stage_fx). Reuses this file's OWN existing
   primitives per the brief ("reuse theater-verbs primitives") rather than inventing new tween math: an
   outward scale-punch (vBurst's expand shape, inverted — a quick violent GROW instead of erupt-from-
   nothing, since the unit is already standing there at full scale when this fires) immediately
   followed by vSink's own down-and-shrink collapse, then a bare fx:fire-style debris scatter (vDamageFx
   with a neutral scorch tint, not a damage-type lookup — this isn't a damage-type FX, just the same
   radial-debris primitive) at the unit's final position. Ends with the figure permanently hidden
   (obj.visible=false, no revert) — theater-boot.js's setUnits owns rendering NOTHING there on every
   subsequent refresh (plus the scorch tile marker), matching vDown's own "terminal, no onDone revert"
   convention for the default down-pose. A single combined tween (not three chained pushTween calls) so
   the whole sequence is one entry in ctx.tweens, matching every other multi-phase verb here (vStrike's
   lunge+recoil, vAbsurdity's rift+shake) rather than a bespoke chaining mechanism. */
function vObliterate(ctx, opts){
  const obj = resolveUnit(ctx, opts.who);
  if(!obj) return false;
  const baseY = obj.position.y, baseScale = obj.scale.x;
  const atX = obj.position.x, atZ = obj.position.z;
  const meshes = [];
  obj.traverse((n) => { if(n.material) meshes.push(n); });
  // W2-A (HOTFIX-QUEUE-2026-07-06 H2): same clone-for-tween guard as vHurt/vDown — obliterate's
  // transparent+opacity fade must not corrupt a SHARED whole-object material bucket.
  meshes.forEach((m) => {
    if(m.material && m.material.userData && m.material.userData.shared){
      const clone = m.material.clone();
      clone.map = m.material.map; // copy the texture handle by reference, never clone it
      clone.userData = Object.assign({}, m.material.userData, { shared: false, tweenClone: true });
      m.material = clone;
    }
    m.material.transparent = true;
  });
  // debris: a handful of small tinted fragments flying outward, spawned once up front (not per-frame)
  // and cleaned up in onDone — same fxGroup lifecycle every other FX primitive in this file uses.
  const debris = [];
  if(ctx.THREE && ctx.fxGroup){
    const THREE = ctx.THREE;
    const tint = scorchDebrisTint(opts);
    for(let i = 0; i < 8; i++){
      const ang = (i / 8) * Math.PI * 2;
      const geo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
      const mat = new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(atX, 0.3, atZ);
      ctx.fxGroup.add(mesh);
      debris.push({ mesh, ang, r: 0.35 + (i % 3) * 0.1 });
    }
  }
  return pushTween(ctx, opts.dur || DEFAULT_DUR.obliterate, (t) => {
    // phase 1 (0-0.35): a quick violent scale-punch — vBurst's expand shape, but FROM full scale
    // outward past it (a "before it collapses, it lurches" beat) rather than erupting from nothing.
    // phase 2 (0.35-1.0): vSink's own down-and-shrink collapse, carried the rest of the way to 0.
    if(t < 0.35){
      const local = t / 0.35;
      const e = easeOutCubic(local);
      obj.scale.setScalar(lerp(baseScale, baseScale * 1.35, e));
      obj.position.y = baseY + Math.sin(local * Math.PI) * 0.1;
    } else {
      const local = (t - 0.35) / 0.65;
      const e = easeInOutQuad(local);
      obj.scale.setScalar(lerp(baseScale * 1.35, 0, e));
      obj.position.y = lerp(baseY, baseY - 0.6, e);
      meshes.forEach((m) => { m.material.opacity = Math.max(0, 1 - e * 1.3); });
    }
    debris.forEach((d) => {
      const e = easeOutCubic(t);
      d.mesh.position.x = atX + Math.cos(d.ang) * d.r * e * 2.2;
      d.mesh.position.z = atZ + Math.sin(d.ang) * d.r * e * 2.2;
      d.mesh.position.y = 0.3 + Math.sin(e * Math.PI) * 0.35 - e * 0.2;
      d.mesh.material.opacity = 0.9 * Math.max(0, 1 - e);
    });
  }, () => {
    obj.visible = false;
    obj.position.y = baseY; obj.scale.setScalar(baseScale);
    debris.forEach((d) => { ctx.fxGroup.remove(d.mesh); d.mesh.geometry.dispose(); d.mesh.material.dispose(); });
  });
}
// a neutral ember/scorch tint for the debris scatter — obliterate is not itself a damage-type FX
// (no `kind` lookup against DAMAGE_TYPE_FX), just a caller-overridable flat tint (opts.tint) so a
// future richer caller CAN color it (e.g. a fire-obliteration vs. an acid-obliteration) without this
// verb needing its own damage-type table duplicate.
function scorchDebrisTint(opts){ return opts && opts.tint != null ? opts.tint : 0x4a2018; }

/* flee — sprint to board edge + fade (§4, foe_morale flee). A fast slide toward opts.to (a board-edge
   point the caller resolves — typically the fleeing unit's band pushed to "out"/off-grid) with an
   opacity fade-to-0 on every mesh across the tween, ending hidden (mirrors setUnits' own `u.fled`
   visibility=false terminal state — this tween just animates the transition to it). */
function vFlee(ctx, opts){
  const obj = resolveUnit(ctx, opts.who);
  const to = resolvePoint(ctx, opts.to);
  if(!obj) return false;
  const fromX = obj.position.x, fromZ = obj.position.z;
  const toX = to ? to.x : fromX, toZ = to ? to.z : fromZ - 4; // no explicit target -> just sprint "away" (+z)
  const meshes = [];
  obj.traverse((n) => { if(n.material) meshes.push(n); });
  // W2-A (HOTFIX-QUEUE-2026-07-06 H2): same clone-for-tween guard as vHurt/vDown — flee's
  // transparent+opacity fade must not corrupt a SHARED whole-object material bucket.
  meshes.forEach((m) => {
    if(m.material && m.material.userData && m.material.userData.shared){
      const clone = m.material.clone();
      clone.map = m.material.map; // copy the texture handle by reference, never clone it
      clone.userData = Object.assign({}, m.material.userData, { shared: false, tweenClone: true });
      m.material = clone;
    }
    m.material.transparent = true;
  });
  return pushTween(ctx, opts.dur || DEFAULT_DUR.flee, (t) => {
    const e = easeInOutQuad(t);
    obj.position.x = lerp(fromX, toX, e);
    obj.position.z = lerp(fromZ, toZ, e);
    const fade = Math.max(0, 1 - Math.max(0, (t - 0.4) / 0.6));
    meshes.forEach((m) => { m.material.opacity = fade; });
  }, () => { obj.visible = false; });
}

/* absurdity — THE REALITY TEAR (§4, fired by crit_outcome): a void-black rift quad + emissive rim +
   camera shake + tile flicker, SCALED by the crit-magnitude die. `opts.magnitude` (the rolled die
   value, typically 1-12 per CRIT-MAGNITUDE) drives rift size, shake amplitude, and flicker count —
   the single knob that makes a bigger crit visibly bigger, matching the ruling's verbatim intent
   ("a crit's magnitude of absurdity creates a hole in space-time"). Camera shake nudges ctx.camera's
   position directly and restores it exactly on completion (never leaves the camera drifted). */
function vAbsurdity(ctx, opts){
  if(!ctx.THREE) return false;
  const THREE = ctx.THREE;
  const mag = Math.max(1, Math.min(20, opts.magnitude || 4));
  const scale = mag / 6; // normalizes a typical d6-d12 magnitude range to a ~0.2x-3x visual scale factor
  const at = resolvePoint(ctx, opts.at || opts.who || opts.to) || { x: 0, z: 0 };

  let rift = null, camBase = null;
  if(ctx.fxGroup){
    const size = 0.5 + scale * 0.6;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({ color: 0x050208, transparent: true, opacity: 0.94, side: THREE.DoubleSide });
    rift = new THREE.Mesh(geo, mat);
    rift.position.set(at.x, 0.9, at.z);
    rift.rotation.x = -0.15;
    ctx.fxGroup.add(rift);
    // emissive rim: a slightly larger, dimmer plane behind the void quad, cheap "glow ring" without a shader
    const rimGeo = new THREE.PlaneGeometry(size * 1.35, size * 1.35);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x7a2ea8, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.copy(rift.position); rim.position.z -= 0.01; rim.rotation.copy(rift.rotation);
    ctx.fxGroup.add(rim);
    rift.userData.rim = rim;
  }
  if(ctx.camera){ camBase = ctx.camera.position.clone(); }

  const dur = opts.dur || (DEFAULT_DUR.absurdity * Math.min(2, 0.6 + scale * 0.3));
  return pushTween(ctx, dur, (t) => {
    if(rift){
      const pulse = 1 + Math.sin(t * Math.PI * (3 + scale)) * 0.08 * scale;
      rift.scale.setScalar(pulse);
      rift.userData.rim.scale.setScalar(pulse * 1.02);
      const fadeOut = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
      rift.material.opacity = 0.94 * fadeOut;
      rift.userData.rim.material.opacity = 0.35 * fadeOut;
    }
    if(camBase && ctx.camera){
      const decay = Math.max(0, 1 - t * 1.4);
      const amp = 0.12 * scale * decay;
      ctx.camera.position.x = camBase.x + (Math.random() * 2 - 1) * amp;
      ctx.camera.position.y = camBase.y + (Math.random() * 2 - 1) * amp;
    }
  }, () => {
    if(rift && ctx.fxGroup){
      ctx.fxGroup.remove(rift); ctx.fxGroup.remove(rift.userData.rim);
      rift.geometry.dispose(); rift.material.dispose();
      rift.userData.rim.geometry.dispose(); rift.userData.rim.material.dispose();
    }
    if(camBase && ctx.camera) ctx.camera.position.copy(camBase);
  });
}

/* fx:<type> — a bare elemental burst with no unit motion attached (§4: "Spell/impact FX: blockwright-
   idiom primitive bursts... keyed by damage type"). Reusable by both `cast`-adjacent callers and
   stage_fx's own free-form improvised beats. Builds 6-10 small tinted boxes/planes that fly outward
   (motion "burst"/"spark"), rise+dissipate ("bubble"/"pillar"), or pull inward then vanish ("drain") —
   the per-type `motion` signature from DAMAGE_TYPE_FX above. */
function vDamageFx(ctx, opts, kind){
  if(!ctx.THREE || !ctx.fxGroup) return false;
  const THREE = ctx.THREE;
  const at = resolvePoint(ctx, opts.at || opts.who || opts.to) || { x: 0, z: 0 };
  const { tint, motion } = fxFor(kind);
  const n = 7;
  const parts = [];
  for(let i = 0; i < n; i++){
    const ang = (i / n) * Math.PI * 2 + (i % 2) * 0.3;
    const geo = motion === "spark" ? new THREE.BoxGeometry(0.05, 0.22, 0.05) : new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.95 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(at.x, 0.3, at.z);
    ctx.fxGroup.add(mesh);
    parts.push({ mesh, ang, r: 0.3 + (i % 3) * 0.08 });
  }
  // BATTLE-THEATER LIGHTING follow-up (§ "spell-light note"): a brief point-light pulse riding the SAME
  // tween as the burst geometry above — "add a brief point-light pulse to the existing fx:* verbs (fire=
  // orange flash etc.) if cheap." Cheap here: one extra THREE.PointLight, added/removed on the identical
  // onDone as the burst meshes, intensity following the same ease-out-then-fade curve the burst opacity
  // already uses (no separate tween bookkeeping). Skipped cleanly if ctx.scene is absent (a narrow ctx
  // that only wires fxGroup, e.g. an isolated future test double) — the burst itself still plays.
  // decay:0 + a two-digit peak intensity — matches theater-boot.js's own LIGHT_PROFILES point lights
  // (same header comment there): three.js's physically-correct photometric units make a sub-2 intensity
  // read as functionally invisible at any real distance, found live in this unit's own browser check.
  const pulseLight = ctx.scene ? new THREE.PointLight(tint, 0, 0, 0) : null;
  if(pulseLight){
    pulseLight.position.set(at.x, 0.6, at.z);
    ctx.scene.add(pulseLight);
  }
  return pushTween(ctx, opts.dur || 500, (t) => {
    const e = easeOutCubic(t);
    parts.forEach((pt) => {
      const { mesh, ang, r } = pt;
      if(motion === "burst" || motion === "spark"){
        mesh.position.x = at.x + Math.cos(ang) * r * e * 2;
        mesh.position.z = at.z + Math.sin(ang) * r * e * 2;
        mesh.position.y = 0.3 + Math.sin(e * Math.PI) * 0.3;
      } else if(motion === "bubble"){
        mesh.position.x = at.x + Math.cos(ang) * r * 0.6;
        mesh.position.z = at.z + Math.sin(ang) * r * 0.6;
        mesh.position.y = 0.2 + e * 1.1;
      } else if(motion === "pillar"){
        mesh.position.x = at.x + Math.cos(ang) * r * (1 - e * 0.4);
        mesh.position.z = at.z + Math.sin(ang) * r * (1 - e * 0.4);
        mesh.position.y = 0.2 + e * 1.6;
      } else if(motion === "drain"){
        mesh.position.x = lerp(at.x + Math.cos(ang) * r * 1.6, at.x, e);
        mesh.position.z = lerp(at.z + Math.sin(ang) * r * 1.6, at.z, e);
        mesh.position.y = 0.3;
      }
      mesh.material.opacity = 0.95 * Math.max(0, 1 - e);
    });
    if(pulseLight){
      // quick rise then fade — peaks early (e~0.25) then decays to 0, so it reads as a flash, not a
      // sustained light (a spell-light "pulse," per the follow-up note, not a permanent fixture).
      const PULSE_PEAK = 16;
      pulseLight.intensity = e < 0.25 ? (e / 0.25) * PULSE_PEAK : Math.max(0, PULSE_PEAK * (1 - (e - 0.25) / 0.75));
    }
  }, () => {
    parts.forEach((pt) => { ctx.fxGroup.remove(pt.mesh); pt.mesh.geometry.dispose(); pt.mesh.material.dispose(); });
    if(pulseLight && ctx.scene) ctx.scene.remove(pulseLight);
  });
}

const VERB_IMPL = {
  advance: vAdvance, withdraw: vWithdraw, strike: vStrike, hurt: vHurt, down: vDown,
  cast: vCast, arc: vArc, knockback: vKnockback, sink: vSink, burst: vBurst,
  flee: vFlee, absurdity: vAbsurdity, obliterate: vObliterate
};

/* ============================================================================
   Public dispatch. playVerb resolves a plain verb name OR the "fx:<type>" damage-type addressable
   form (§4's FX table) into its implementation; unknown verbs return false (no-op) rather than throw
   — matching every other Theater method's pre-mount/absent-data null-safety convention.
   ============================================================================ */
export function playVerb(ctx, verb, opts){
  if(!ctx || !verb) return false;
  opts = opts || {};
  if(verb.indexOf("fx:") === 0) return !!vDamageFx(ctx, opts, verb.slice(3)); // MF-3: pushTween now returns the tween object, not a bare `true` — coerce to strict boolean here same as the VERB_IMPL path below
  const impl = VERB_IMPL[verb];
  if(!impl) return false;
  return !!impl(ctx, opts);
}

/* tickTweens — advances every live tween in ctx.tweens by the current time, applying each one's
   `update(t)` and retiring (splicing out + firing onDone) any tween whose duration has elapsed.
   Returns true iff at least one tween is still live AFTER this tick (theater-boot.js's render loop
   uses this to decide whether to keep scheduling frames — "animate only while a tween is live", §2's
   render-on-demand discipline extended to the animation layer). Never throws on an empty/absent
   ctx.tweens array. */
export function tickTweens(ctx, nowMs){
  if(!ctx || !ctx.tweens || !ctx.tweens.length) return false;
  const now = nowMs != null ? nowMs : Date.now();
  const still = [];
  for(let i = 0; i < ctx.tweens.length; i++){
    const tw = ctx.tweens[i];
    // MF-3 HIT-STOP: a tween frozen by freezeTween/applyHitStop stalls its `t` fraction at the value it
    // held the instant it was frozen — everything else (untouched tweens: motes/flicker never even ride
    // this array, and an isCameraPoseTween is simply never handed to applyHitStop) keeps ticking normally
    // this same pass. Once `now` passes __freezeUntil, `start` is shifted forward by exactly the frozen
    // window so the tween RESUMES from precisely the pose it was held at, never a jump.
    if(tw.__freezeUntil != null){
      if(now < tw.__freezeUntil){
        try { tw.update(tw.__frozenT); } catch(e) { /* a bad tween never crashes the render loop */ }
        still.push(tw);
        continue;
      }
      tw.start = now - tw.__frozenT * tw.dur;
      tw.__freezeUntil = null;
      tw.__frozenT = null;
    }
    const elapsed = now - tw.start;
    const t = Math.max(0, Math.min(1, elapsed / tw.dur));
    try { tw.update(t); } catch(e) { /* a bad tween never crashes the render loop */ }
    if(t >= 1){
      if(typeof tw.onDone === "function"){ try { tw.onDone(); } catch(e) { /* swallow — cleanup best-effort */ } }
    } else {
      still.push(tw);
    }
  }
  ctx.tweens.length = 0;
  ctx.tweens.push(...still);
  if(typeof ctx.markDirty === "function" && still.length) ctx.markDirty();
  return still.length > 0;
}

/* MF-3b (BEAUTY-WAVE-4B §C) — two more pure helpers for theater-boot.js's play() dispatch, kept HERE
   (not in theater-boot.js) so a harness can plain-Node `import` and assert them directly, matching this
   file's own header claim ("ZERO direct DOM/THREE coupling of their own") — theater-boot.js's GL surface
   is browser-smoke-tested only (its own manifest note), so anything that needs a jsdom/node unit test
   has to live on this side of the boundary. */
// standeeVerbForHurt — a crit hurt routes to the hit-crit standee verb (white-flash + single-bounce
// camera nudge, per MF-3's own bullet 3) instead of hit-damage; every other verb/opts combination keeps
// the caller's static map (theater-boot.js's STANDEE_VERB_FOR_THEATER_VERB) untouched.
function standeeVerbForHurt(verb, opts, staticMap){
  return (verb === "hurt" && opts && opts.crit) ? "hit-crit" : (staticMap ? staticMap[verb] : undefined);
}
// recoilDirFromPositions — the unit vector pointing target<-attacker (world-space {x,z}), or null when
// either position is missing or the two points coincide (never a throw, never a NaN/zero-length vector).
function recoilDirFromPositions(targetPos, attackerPos){
  if(!targetPos || !attackerPos) return null;
  const dx = targetPos.x - attackerPos.x, dz = targetPos.z - attackerPos.z;
  const len = Math.hypot(dx, dz);
  return len > 0 ? { x: dx / len, z: dz / len } : null;
}

export { freezeTween, applyHitStop, findLatestTweenByUnitId, triggerHitStop, critCameraNudge,
  IMPACT_PX_UNIT, HIT_STOP_DUR, HIT_STOP_DUR_CRIT, FALL_HOLD_DUR, CRIT_NUDGE_DUR, CRIT_NUDGE_AMP,
  standeeVerbForHurt, recoilDirFromPositions };

/* ============================================================================
   §4 "Existing events need NO new fields — the theater subscribes to the ledger/event stream and maps
   semantics it already carries." theaterFxFromLedger is that subscription: a pure function of one
   ledger entry (the SAME {kind,...} data shape addLedger's outcome/canon entries already carry, see
   src/world/dm.js's addLedger call sites) -> a {verb, opts} play instruction, or null for a ledger
   kind this library has no animation opinion about (round_tick/side flips, per §4 — "get no
   animation, silence is fine" — those never reach here in the first place since the hook call sites
   in dm.js are scoped to the six named events, but this dispatcher stays defensively total anyway).

   This is ALSO exactly what cmTheaterNotify (the tiny classic-script bridge in render.js, per this
   unit's brief) calls per hook site — cmTheaterNotify(kind, data) forwards straight into
   theaterFxFromLedger({data-shaped-as-a-ledger-entry}) so there is exactly ONE place that knows how
   to turn ledger semantics into a verb. Kept here (not duplicated in render.js) so the mapping table
   has one home. */
export function theaterFxFromLedger(entry){
  if(!entry || !entry.data) return null;
  const d = entry.data;
  switch(d.kind){
    // CRIT-MAGNITUDE (2026-07-03, Adam's ruling: "combat crits are still crits and the magnitude must
    // be weighed"): a magnitude-carrying crit (res.magnitude off resolveAttack, ledgered as d.magnitude)
    // scales the FX past the old flat crit?3:1 — a big crit (>=8, mirroring the obliteration threshold
    // and the "crit" ledger-kind's own absurdity gate above) plays the absurdity reality-tear instead of
    // a bigger strike; a smaller crit (magnitude present but <8) still lunges harder than a plain hit via
    // strike's own magnitude-scaled opts. A non-crit attack (d.magnitude null/undefined) keeps the old 1.
    case "attack": {
      if(d.magnitude >= 8) return { verb: "absurdity", opts: { at: d.target || "pc", magnitude: d.magnitude } };
      const verb = d.hit ? "strike" : "strike";
      return { verb, opts: { who: "pc", to: d.target || undefined, miss: !d.hit, magnitude: d.magnitude || (d.crit ? 3 : 1) } };
    }
    case "foe-turn":
      if(d.magnitude >= 8) return { verb: "absurdity", opts: { at: "pc", magnitude: d.magnitude } };
      return { verb: "strike", opts: { who: d.fid || d.foe, to: "pc", miss: !d.hit, magnitude: d.magnitude || (d.crit ? 3 : 1) } };
    case "opportunity-attack":
      return { verb: "strike", opts: { who: d.fid, to: "pc", miss: !d.hit } };
    case "move-zone":
      return { verb: "advance", opts: { who: d.who, to: d.to } };
    case "morale":
      if(d.disposition === "flee" || d.disposition === "rout-panic") return { verb: "flee", opts: { who: d.foe } };
      return null;
    case "combat-end":
      return null; // §4: silence — combat_end itself carries no single subject to animate
    case "crit": {
      if(d.tier !== "mythic" && !(d.magnitude >= 8)) return null; // low-magnitude crits stay silent — absurdity is a SPIKE, not every nat20
      return { verb: "absurdity", opts: { magnitude: d.magnitude || 4 } };
    }
    case "hp": {
      if(d.delta >= 0) return null;
      // MF-3b (BEAUTY-WAVE-4B): thread attacker/crit through so play() (theater-boot.js) can route a
      // crit to the hit-crit standee verb and wire MF-3's hit-stop/recoil to a real attacker. d.attacker
      // is undefined on every hp entry this unit doesn't touch (hazards, pre-MF-3b callers) — the
      // consumer treats a missing attackerId as "don't fire hit-stop," the pre-existing dormant behavior.
      return { verb: "hurt", opts: { who: d.pc ? "pc" : undefined, magnitude: Math.abs(d.delta) / 4, dropped: !!d.dropped, attackerId: d.attacker, crit: !!d.crit } };
    }
    default:
      return null;
  }
}
