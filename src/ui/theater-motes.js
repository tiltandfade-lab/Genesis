/* THEATER MOTES — BEAUTY-WAVE.md VP6 item 3, the AMBIENT MOTE FIELD and its OWN drift scheduler,
   extracted VERBATIM from src/ui/theater-boot.js in split step B5 (2026-07-25;
   docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   OWNERSHIP: the whole mote family and nothing else — the seeded hash/RNG (moteHash32 / moteRng), the
   kit-driven ember-vs-dust classifier (interiorMoteKindFor / MOTE_TINT), the soft additive speck
   texture (moteSoftTexture), the per-room field builder (interiorBuildMotes) and the drift loop
   (startMoteDrift / stopMoteDrift).

   SCHEDULER LAW (the brief's §Protected contracts, verbatim: "the intentional separation between the
   dirty-frame scheduler, verb tween scheduler, practical flicker scheduler, mote scheduler, and dev
   readout timers"): this module keeps its OWN requestAnimationFrame ownership, intact and unshared.
   startMoteDrift still guards on S.moteRaf, still self-stops the instant S.mounted is false or the mote
   group is gone or empty, still calls markDirty() per step, and stopMoteDrift still cancels exactly that
   one rAF handle. The FLICKER scheduler is a separate loop in a separate file
   (src/ui/theater-lighting.js's startLightFlicker). NOTHING WAS UNIFIED — the two loops never met.

   CTX LAW (recon §7.3 — acyclic imports; same shape as every B1-B4 module): this module NEVER imports
   theater-boot.js. Capabilities arrive ONCE via motesInit(ctx) into the module-local mirrors below. It
   reads the live theater state record (S.moteRaf / S.mounted / S.moteGroup), so the root also calls
   motesSyncState(S) at BOTH `S = createTheaterState()` reassignment sites, beside the existing
   clayRoomSyncState / lightLabSyncState / postSyncState / lightingSyncState calls.

   NOTE on the module-local mirror name `S`: moteSoftTexture's own body declares a FUNCTION-LOCAL
   `const S = 64` (the canvas edge length) which shadows the state mirror inside that one function —
   exactly as it already shadowed the root's module-scope `S` in the monolith. The move is verbatim and
   the shadowing behaviour is byte-identical; flagged here only so a future reader does not "fix" it.

   ROOT-OWNED, DELIBERATELY NOT MOVED: markDirty (the root's dirty-frame scheduler entry point) arrives
   through ctx. The mote GROUP's own lifecycle (S.moteGroup assignment in setInteriorBoard, its disposal
   in retire()/clearGroup) stays in the root — this module builds and animates, it does not own
   end-of-life, so there is still ONE true dispose point.

   NON-VERBATIM EDITS (the complete list): this header, the import/mirror/init prologue below, and the
   trailing `export {...}` block. Not one byte inside a moved declaration changed — there is not a
   single accessor swap in this file. */
import * as THREE from "three";

// ---- root-capability mirrors (wired once by motesInit; S re-synced by motesSyncState) ----
let S;
let markDirty;

export function motesInit(ctx){
  ({ markDirty } = ctx);
  S = ctx.S;
}
export function motesSyncState(nextS){ S = nextS; }

// BEAUTY-WAVE.md VP6 item 3 — AMBIENT MOTES: 4-8 seeded drifting particle cards per room, ember-tinted
// for torch-lit realms / dust-tinted for lamp-lit ones (kit-driven, no new per-realm authoring table —
// reused off the SAME `light.kind` field interiorBuildLights already reads), slow vertical drift with
// wrap-around, additive blending (same "reads bright regardless of ambient" idiom as the light markers
// just above), tiny (0.05-0.12 world units — a speck, never a readable sprite). Seeded (mulberry32-style
// hash off a per-room string) so a room's mote field is stable across re-renders of the SAME board data,
// not re-rolled every frame/rebuild.
const MOTE_COUNT_MIN = 4, MOTE_COUNT_MAX = 8;
const MOTE_SIZE_MIN = 0.05, MOTE_SIZE_MAX = 0.12;
function moteHash32(str){
  let h = 2166136261 >>> 0;
  const s = String(str || "");
  for(let i = 0; i < s.length; i++){ h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; }
  return h >>> 0;
}
// a tiny deterministic PRNG seeded from moteHash32 — mulberry32, the same shape every other seeded-RNG
// spot in this codebase already uses (dspHashStr-adjacent convention in theater-interior.js), reimplemented
// locally rather than imported since this ES module can't reach that classic-script helper.
function moteRng(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// ember (torch/lava-flavored) is the default; a room whose lights are ALL "lamp" kind reads dust instead
// (dry/dusty interiors — lamplit halls, not open flame) — mirrors interiorBuildLightMarker's own
// isLamp branch rather than inventing a second per-realm classification.
function interiorMoteKindFor(lights){
  const list = lights || [];
  if(list.length && list.every((l) => l.kind === "lamp")) return "dust";
  return "ember";
}
const MOTE_TINT = { ember: 0xffb066, dust: 0xcfc9a8 };
// BW3-4 — MOTE COUPLING: a room's dust biases toward its own light pools (the mock's warm shaft reads
// as dust visible IN the light, not scattered evenly through a dark room) — MOTE_POOL_BIAS_FRACTION of
// spawns land within MOTE_POOL_RADIUS of a (seed-picked, deterministic) light center; the rest spawn
// uniformly across the room exactly like pre-unit VP6 did. A lightless room (no `lights` arg, or an
// empty one) degrades to that pre-unit uniform behavior byte-for-byte — see the pools.length guard
// below, and dev/verify-bw3-4-light-shafts.mjs's own regression check against the pre-unit call shape.
const MOTE_POOL_BIAS_FRACTION = 0.65;
const MOTE_POOL_RADIUS = 1.8;
// SOFT-MOTE TEXTURE (2026-07-11, Adam's "little floating tiny rhomboids" report): a mote was a bare
// PlaneGeometry with a FLAT MeshBasicMaterial — a hard-edged square that foreshortens into a diamond
// at the ~20° camera, reading as a floating rhomboid rather than a soft dust speck. A radial-gradient
// alpha (bright center → transparent edge) makes each mote a soft glowing dot whose foreshortening is
// imperceptible (a soft blob is a soft blob at any angle). Built once + cached (like every other
// generated texture in this file); additive blending keeps it a warm glow, not an opaque disc.
let MOTE_SOFT_TEX = null;
function moteSoftTexture(){
  if(MOTE_SOFT_TEX) return MOTE_SOFT_TEX;
  if(typeof document === "undefined" || !document.createElement) return null; // headless: no canvas, motes stay flat (never rendered there)
  const S = 64, canvas = document.createElement("canvas");
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(S/2, S/2, 0, S/2, S/2, S/2);
  g.addColorStop(0.0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.55)");
  g.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  MOTE_SOFT_TEX = new THREE.CanvasTexture(canvas);
  return MOTE_SOFT_TEX;
}
function interiorBuildMotes(seedStr, bounds, kind, lights, cx, cz){
  const group = new THREE.Group();
  const b = bounds || { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
  // BW3-4 COORDINATE FIX: `bounds` (data.bounds) is the board's RAW, pre-origin-shift footprint —
  // every OTHER piece of interior geometry (floor/wall/light/piece meshes, setInteriorBoard's own
  // convention throughout this file) mounts at (rawX - cx, rawZ - cz), cx/cz being the camera-fit
  // rect's own center. The pre-BW3-4 call site here passed raw bounds straight through with NO shift
  // at all, so the mote field silently floated at a (+cx,+cz) offset from the room it was meant to
  // dust whenever cx/cz != 0 (any room not centered on the whole-board origin — i.e. almost always on
  // a real multi-room plan) — invisible or drifting over the WRONG room entirely. Fixed here (this
  // unit's own pool-bias math needs the SAME coordinate space as `lights` to mean anything: a "bias
  // toward the pool" that's itself rendered in the wrong place doesn't read as coupling at all).
  // cx/cz default to 0 so a caller that still omits them (the pre-unit 3-arg call shape) is a clean
  // no-op shift, byte-identical to the old behavior.
  const shiftX = cx || 0, shiftZ = cz || 0;
  const minX = b.minX - shiftX, maxX = b.maxX - shiftX, minZ = b.minZ - shiftZ, maxZ = b.maxZ - shiftZ;
  const rng = moteRng(moteHash32(seedStr));
  const count = MOTE_COUNT_MIN + Math.floor(rng() * (MOTE_COUNT_MAX - MOTE_COUNT_MIN + 1));
  const color = MOTE_TINT[kind] || MOTE_TINT.ember;
  const yBottom = -0.2, yTop = 2.2; // a modest drift band above the floor, well under wall-height ceilings
  // shifted pool centers — same coordinate space as minX/maxX/minZ/maxZ above (raw light x/z, same
  // shift applied). An absent/empty `lights` list yields an empty pools array, which the per-mote loop
  // below treats identically to "no coupling" (the pre-unit uniform spawn).
  const pools = (lights || []).map((l) => ({ x: (l.x || 0) - shiftX, z: (l.z || 0) - shiftZ }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.z));
  for(let i = 0; i < count; i++){
    const size = MOTE_SIZE_MIN + rng() * (MOTE_SIZE_MAX - MOTE_SIZE_MIN);
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending,
      depthWrite: false, side: THREE.DoubleSide,
      map: moteSoftTexture() // soft radial dot, not a hard square (the "floating rhomboid" fix)
    });
    const mesh = new THREE.Mesh(geo, mat);
    let x, z;
    // MOTE COUPLING: pools.length is the ONLY gate — a lightless room never draws the extra rng() call
    // below, so its rng SEQUENCE (and therefore every downstream x/z/y/size/speed draw) stays exactly
    // what pre-unit interiorBuildMotes produced for the same seed (short-circuit && never evaluates
    // the right side when pools.length is 0).
    if(pools.length && rng() < MOTE_POOL_BIAS_FRACTION){
      const pool = pools[Math.floor(rng() * pools.length)];
      const angle = rng() * Math.PI * 2;
      const r = rng() * MOTE_POOL_RADIUS;
      x = Math.min(maxX, Math.max(minX, pool.x + Math.cos(angle) * r));
      z = Math.min(maxZ, Math.max(minZ, pool.z + Math.sin(angle) * r));
    } else {
      x = minX + rng() * Math.max(0.01, maxX - minX);
      z = minZ + rng() * Math.max(0.01, maxZ - minZ);
    }
    const y = yBottom + rng() * (yTop - yBottom);
    mesh.position.set(x, y, z);
    mesh.userData.motePiece = true;
    mesh.userData.driftSpeed = 0.04 + rng() * 0.05; // world units/sec, slow
    mesh.userData.wrapBottom = yBottom;
    mesh.userData.wrapTop = yTop;
    group.add(mesh);
  }
  return group;
}
// self-stopping rAF drift loop — same dedicated-loop discipline as startLightFlicker's setInterval
// (a continuous ambient effect, not a one-shot tween), self-stops the instant the mote group is gone
// (board swap/retire) rather than depending on an external caller to remember to cancel it.
function startMoteDrift(){
  if(S.moteRaf) return;
  let last = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  const step = (now) => {
    now = now || ((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now());
    if(!S.mounted || !S.moteGroup || !S.moteGroup.children.length){ S.moteRaf = null; return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    S.moteGroup.children.forEach((m) => {
      m.position.y += m.userData.driftSpeed * dt;
      if(m.position.y > m.userData.wrapTop) m.position.y = m.userData.wrapBottom;
    });
    markDirty();
    S.moteRaf = requestAnimationFrame(step);
  };
  S.moteRaf = requestAnimationFrame(step);
}
function stopMoteDrift(){
  if(S.moteRaf != null){ cancelAnimationFrame(S.moteRaf); S.moteRaf = null; }
}

export {
  interiorBuildMotes, interiorMoteKindFor, startMoteDrift, stopMoteDrift
};
