/* GENESIS MODULE — src/ui/spawn-grace.js — BEAUTY-WAVE-4.md MF-2 (SPAWN/DESPAWN GRACE, "the pop
   killer"). A SIBLING pure ES-module boundary file to src/ui/theater-verbs.js/src/ui/standee-verbs.js
   — kept separate for the SAME reason those two are (see theater-verbs.js's own header): this module
   has ZERO direct THREE/DOM coupling of its own. Every mesh/material/scale handle it touches arrives
   as a plain callback the caller (theater-boot.js) supplies — `setArtOpacity(v)` / `setScaleMul(v)` /
   `setOpacity(v)` — so this file is trivially unit-testable via a real Node `import` (no jsdom, no
   THREE stub, no sandboxed eval) exactly like theater-verbs.js/standee-verbs.js's own Part A.

   THE FEEL LAWS this unit answers to (docs/BEAUTY-WAVE-4.md):
     1. NOTHING TELEPORTS — every push* function below registers a tween ≤ 400ms; dressing cascade
        delays are capped at DRESSING_CASCADE_CAP_MS so even the LAST staggered piece still arrives
        inside the law's own ceiling.
     2. SMALL IS CORRECT — 150/200/200ms durations, a 4% scale settle. Nothing here is amplitude-tuned
        past what the spec's own MF-2 section states verbatim.
     3. INPUT IS NEVER BLOCKED — every push* function returns synchronously (true/false, never a
        Promise/thenable) and never sets any input-lock flag; a tween is just a plain object appended
        to ctx.tweens, ticked by the SAME tickTweens loop (theater-verbs.js) every other verb already
        rides. Retriggering a push* call before the previous one finishes is a normal "new action
        cancels the tail" swap (the caller re-captures start values fresh each call) — this module
        never queues or defers a caller's own next action.

   ctx shape (a strict SUBSET of theater-verbs.js's own ctx contract, same "one ctx, no adapter" idiom
   standee-verbs.js's bindStandeeCtx documents): { tweens: Array, markDirty?: Function }. A tween
   pushed here is byte-identical in shape ({start,dur,update,onDone}) to one theater-verbs.js/
   standee-verbs.js push — theater-verbs.js's EXPORTED tickTweens (the only place that ever reads
   ctx.tweens) advances all three kinds without knowing or caring which module produced them. THIS
   MODULE NEVER TICKS ITS OWN CLOCK — no second tween system; it is a producer onto the one array. */

export const MOUNT_GRACE_DUR = 150;          // MF-2 item 1: "150ms fade-in"
export const MOUNT_GRACE_SCALE_DELTA = 0.04; // MF-2 item 1: "a 4% scale settle"
export const DESPAWN_GRACE_DUR = 200;        // MF-2 item 2: "200ms fade-down"
export const DRESSING_CASCADE_STEP_MS = 40;  // MF-2 item 3: "staggered 40ms-per-piece"
export const DRESSING_CASCADE_CAP_MS = 400;  // MF-2 item 3 / Feel Law 1: "cap total stagger at 400ms"
export const ROOM_TRANSITION_DUR = 200;      // MF-2 item 4: "200ms to-black (or to-fog) crossfade"

/* pushTween — the one place this module appends to ctx.tweens. Byte-identical shape to theater-
   verbs.js's own pushTween/standee-verbs.js's own pushTween (start stamped at Date.now() + an optional
   delay so a tween fired mid-frame doesn't inherit a stale clock, exactly those files' own convention)
   — a delayed tween is nothing more than a `start` timestamp in the future; tickTweens' own
   `t = clamp((now-start)/dur, 0, 1)` math already yields t=0 for every frame before `now` catches up,
   so a stagger needs NO separate scheduling mechanism, just a later `start`. */
function pushTween(ctx, dur, delayMs, onUpdate, onDone){
  if(!ctx || !ctx.tweens) return false;
  ctx.tweens.push({
    start: Date.now() + (delayMs || 0),
    dur: Math.max(1, dur),
    update: onUpdate,
    onDone: onDone || null
  });
  if(typeof ctx.markDirty === "function") ctx.markDirty();
  return true;
}

/* pushMountGrace — MF-2 item 1 (standee mount, "the pop killer" for an ARRIVAL). `opts`:
     setArtOpacity(v)  — required-ish; called with 0 at push time, then t*targetOpacity every tick,
                         then targetOpacity at onDone. Omit for a mount with no fadeable art (a base-
                         only re-mount) — the scale settle still runs.
     setScaleMul(v)    — optional; called with (1+MOUNT_GRACE_SCALE_DELTA) at push time, eased down to
                         1 by onDone. The BASE mesh is never touched by this function at all — per the
                         spec's own "base lands first / at full opacity from t=0", the base's opacity is
                         the CALLER's job to simply never wire into setArtOpacity (see theater-boot.js's
                         call sites: they collect only the sprite/art materials, explicitly excluding
                         any mesh tagged userData.standeeBase).
     targetOpacity     — the resting opacity this piece's art should end at (default 1).
     delayMs           — MF-2 item 3's per-piece cascade stagger; 0 for a lone spawn.
     dur               — override (tests only; production always uses MOUNT_GRACE_DUR).
     onDone            — caller's own completion hook (chained after this function's own snap-to-rest). */
export function pushMountGrace(ctx, opts){
  opts = opts || {};
  const dur = opts.dur || MOUNT_GRACE_DUR;
  const targetOpacity = opts.targetOpacity != null ? opts.targetOpacity : 1;
  const startScaleMul = 1 + MOUNT_GRACE_SCALE_DELTA;
  if(typeof opts.setArtOpacity === "function") opts.setArtOpacity(0);
  if(typeof opts.setScaleMul === "function") opts.setScaleMul(startScaleMul);
  return pushTween(ctx, dur, opts.delayMs, function(t){
    if(typeof opts.setArtOpacity === "function") opts.setArtOpacity(targetOpacity * t);
    if(typeof opts.setScaleMul === "function") opts.setScaleMul(startScaleMul + (1 - startScaleMul) * t);
  }, function(){
    if(typeof opts.setArtOpacity === "function") opts.setArtOpacity(targetOpacity);
    if(typeof opts.setScaleMul === "function") opts.setScaleMul(1);
    if(typeof opts.onDone === "function") opts.onDone();
  });
}

/* pushDespawnGrace — MF-2 item 2 ("defeat removal where corpses don't persist, guise swaps, board
   changes"). Fades ONLY the art (setArtOpacity 1->0 over DESPAWN_GRACE_DUR); the base is never touched
   by this function — the caller's `onLifted` (fired at onDone, i.e. strictly AFTER the 200ms fade
   completes) is where the whole assembly, base included, actually leaves the scene ("the base lifts
   LAST" — the base stays fully visible/standing the entire fade, and only disappears at the very end
   when the caller detaches+disposes it inside onLifted). `startOpacity` lets a caller despawn a piece
   that wasn't at full opacity yet (an interrupted mount cancelling into a despawn — law 3). */
export function pushDespawnGrace(ctx, opts){
  opts = opts || {};
  const dur = opts.dur || DESPAWN_GRACE_DUR;
  const startOpacity = opts.startOpacity != null ? opts.startOpacity : 1;
  return pushTween(ctx, dur, 0, function(t){
    if(typeof opts.setArtOpacity === "function") opts.setArtOpacity(startOpacity * (1 - t));
  }, function(){
    if(typeof opts.setArtOpacity === "function") opts.setArtOpacity(0);
    if(typeof opts.onLifted === "function") opts.onLifted(); // THE BASE LIFTS LAST
  });
}

/* pushScreenFade — MF-2 item 4 (room transition to-black/to-fog crossfade). A plain opacity ramp from
   `from` to `to` over `dur` ms — theater-boot.js uses this TWICE per real board swap: once to snap an
   overlay to fully opaque BEFORE the (synchronous) board rebuild runs (so the swap itself is hidden —
   see that call site's own header for why a single-threaded synchronous rebuild needs the opaque snap
   rather than a tweened fade-in), then once more, AFTER the rebuild completes, to fade the SAME overlay
   back down to transparent over ROOM_TRANSITION_DUR ms — "the rebuild happens under it." */
export function pushScreenFade(ctx, opts){
  opts = opts || {};
  const dur = opts.dur || ROOM_TRANSITION_DUR;
  const from = opts.from != null ? opts.from : 1;
  const to = opts.to != null ? opts.to : 0;
  if(typeof opts.setOpacity === "function") opts.setOpacity(from);
  return pushTween(ctx, dur, 0, function(t){
    if(typeof opts.setOpacity === "function") opts.setOpacity(from + (to - from) * t);
  }, function(){
    if(typeof opts.setOpacity === "function") opts.setOpacity(to);
    if(typeof opts.onDone === "function") opts.onDone();
  });
}

/* fnvHash — same tiny FNV-ish string hash idiom theater-boot.js's own kilterFor uses (deterministic,
   never Math.random — the determinism law binds seeds, not clocks/randomness). Reimplemented here
   (not imported) so this module keeps its zero-THREE-coupling, zero-theater-boot.js-coupling posture —
   a plain Node `import` of this file alone never needs anything theater-boot.js owns. */
function fnvHash(str){
  let h = 2166136261 >>> 0;
  const s = String(str == null ? "" : str);
  for(let i = 0; i < s.length; i++){ h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0; }
  return h >>> 0;
}

/* seededCascadeDelays(keys, stepMs?, capMs?) -> number[] (same length/order as `keys`), MF-2 item 3.
   Each key (a stable per-piece identity — theater-boot.js's own callers pass slug+cellX+cellY, the
   SAME identity kilterFor/idle-breathe already key off) hashes to a rank; pieces are staggered in
   RANK order (a deterministic shuffle of the input order — "the room sets itself" should not always
   cascade in raw array order, which would read as a fixed left-to-right wipe rather than a DM's hand),
   never Math.random. `delays[i]` is the stagger for `keys[i]`; ties break on original index for a
   fully total order (two identical keys never race). The cap (DRESSING_CASCADE_CAP_MS, Feel Law 1)
   compresses however many pieces exist into a fixed ≤400ms window — the LAST piece in rank order never
   starts later than the cap, regardless of how many pieces are in the room. */
export function seededCascadeDelays(keys, stepMs, capMs){
  const step = stepMs || DRESSING_CASCADE_STEP_MS;
  const cap = capMs != null ? capMs : DRESSING_CASCADE_CAP_MS;
  const list = keys || [];
  const order = list.map(function(k, i){ return { i: i, h: fnvHash(k) }; });
  order.sort(function(a, b){ return (a.h - b.h) || (a.i - b.i); });
  const delays = new Array(list.length);
  order.forEach(function(entry, rank){
    delays[entry.i] = Math.min(rank * step, cap);
  });
  return delays;
}
