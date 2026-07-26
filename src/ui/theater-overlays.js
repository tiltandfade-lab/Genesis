/* THEATER OVERLAYS — the FEEDBACK LAYER that reads ON TOP of the scene rather than being part of it:
   VP6's visible-history decals, VP6's hit-effect cards, VP5's diegetic selection ring (with MF-4's
   300ms ring slide), and VP5's damage floaters with their unit->screen projector — extracted VERBATIM
   from src/ui/theater-boot.js in split step B7 (2026-07-25;
   docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   THE PROTECTED CONTRACT THIS FILE CARRIES (the brief's §Protected contracts — "selection feedback"
   in the pixel-sprite register): setActingUnit's whole decision table moved byte-identically. The
   slide-eligibility shape (exactly one previous id, exactly one new id, they differ, exactly one live
   ring mesh with a parent) is unchanged; every other shape — first reveal, full clear, a multi-unit
   acting SIDE on either end, a repeated id — still takes the pre-MF-4 instant path verbatim. The
   ring radius/Y derivations (interior base-rim vs the tabletop 0.6 / +0.003 vs -0.48 convention) are
   unchanged, the base glow still toggles INSTANTLY on both paths (never slid), and the return value
   is still the number of rings actually mounted.

   SCHEDULER LAW (the brief's §Protected contracts): both animations here ride the SHARED S.tweens /
   tickTweens channel (theater-verbs.js) exactly as they did in the monolith — the effect card's
   EFFECT_CARD_DUR opacity fade and MF-4's MF4_RING_SLIDE_DUR ring slide, the same channel the camera
   glide, every verb, and the occlusion fade already use. This module owns no requestAnimationFrame
   loop of its own (censused: zero) and no timer except spawnFloater's own 650ms DOM-node reap, which
   is the monolith's own deterministic cleanup, unchanged. `startTweenLoop` is still the root's one
   entry point and arrives through ctx. The ring-slide retarget discipline is unchanged too: the
   isRingSlideTween filter cancels a stale slide instead of stacking a second one.

   CTX LAW (recon §7.3 — acyclic imports; the same shape as every B1-B6 module): this module NEVER
   imports theater-boot.js. Capabilities arrive ONCE via overlaysInit(ctx) into the module-local
   mirrors below, so every moved body keeps its bare identifiers. It DOES read and write the live
   theater state record (S.tweens / S.scene / S.fxGroup / S.effectTexCache / S.actingIds /
   S.actingRingMeshes / S.actingGlowBaseMeshes / S.floaterEl / S.mounted / S.camera / S.renderer), so
   the root also calls overlaysSyncState(S) at BOTH `S = createTheaterState()` reassignment sites,
   beside the existing clayRoomSyncState / lightLabSyncState / postSyncState / lightingSyncState /
   motesSyncState / cameraSyncState / occlusionSyncState calls.

   THIS MODULE IS A LEAF-LEVEL PEER, NOT A ROOT — two one-way leaf->leaf edges, both censused acyclic,
   both spelled with the IDENTICAL specifier theater-boot.js uses for the same file so all resolve to
   the ONE cached module instance:
     - src/ui/theater-camera.js for mf1EaseOutCubic + mf1Lerp (MF-4's ring slide reuses MF-1's easing
       verbatim — the monolith's own note that they are "generic numeric-ease helpers despite the
       mf1-prefixed name"). This is the same edge src/ui/theater-occlusion.js already takes.
     - src/ui/theater-standee-mount.js for setBaseGlow (BW2-2b's turn glow, toggled from both the
       slide and instant paths). That module reads nothing from this file.

   ROOT-OWNED, DELIBERATELY NOT MOVED (they arrive through ctx instead):
     findUnit — HARD PIN: dev/verify-standee-verbs.mjs text-extracts play() from theater-boot.js and
       evals it against a findUnit stub; the root's own verb plumbing, mount/retire and half a dozen
       facade seams read it. setActingUnit and projectUnit take it through ctx.
     interiorFloorTopAt — the FLOOR half of the BW2-2 contact law, itself a d4-doors text-extraction
       pin (see src/ui/theater-standee-mount.js's header). interiorBuildDecals consumes it.
     markDirty / startTweenLoop — the root's dirty-frame scheduler entry point and the shared tween
       loop starter.
     textureLoader / nearestify — the root's one shared THREE.TextureLoader and its nearest-filter
       stamp, used by effectCardFor's async art seam exactly as before.
     S.floaterEl itself — the persistent overlay div is CREATED by mount()/reattach() and torn down by
       retire(), all root board-lifecycle code; spawnFloater only ever appends into it.
     spawnEffectCard's PRODUCTION CALLER (play()'s hit/down wiring) and the acting-ring facade seams
       stay in the root, unmoved.

   NON-VERBATIM EDITS (the complete list): this header, the import/mirror/init prologue below, the
   three `split B7` chunk-boundary notes marking where root-owned code was left behind, and the
   trailing `export {...}` block. There is not ONE accessor swap in this file — every moved production
   line is byte-identical to the monolith. */
import * as THREE from "three";
// split B7: sibling leaf modules (leaf->leaf, one-way — see this file's header). Identical specifier
// spelling to theater-boot.js's own imports of the same files, so both resolve to the ONE cached
// module instance and the easing used by the ring slide IS the easing the camera glide uses.
import { mf1EaseOutCubic, mf1Lerp } from "./theater-camera.js";
import { setBaseGlow } from "./theater-standee-mount.js";

// ---- root-capability mirrors (wired once by overlaysInit; S re-synced by overlaysSyncState) ----
let S;
let findUnit, interiorFloorTopAt, markDirty, nearestify, startTweenLoop, textureLoader;

export function overlaysInit(ctx){
  ({ findUnit,
    interiorFloorTopAt,
    markDirty,
    nearestify,
    startTweenLoop,
    textureLoader } = ctx);
  S = ctx.S;
}
export function overlaysSyncState(nextS){ S = nextS; }

// BEAUTY-WAVE.md VP6 item 4 — VISIBLE HISTORY (render half). data.decals mirrors data.dressing/
// data.pieces (a plain field the caller sets directly on the board object, sourced from
// src/world/prep.js's spatialDecalsForSeg(pn, segNum) — the PERSIST half lives there, not here; this
// function only renders whatever decal records that call already returned). Each entry
// {x,y,kind,roomSegNum} — kind in {blood,scorch,impact,dust} — reuses the SAME flat-ground-quad
// convention the cover-patch channel established (theater-interior.js's itrCoverCardFor/proceduralSplat
// seam, VP3 item 3): a colored CircleGeometry card laid flat at the floor plane, no real art needed (the
// spec's own "VP3's cover channel" instruction — reuse the render idiom, not a new mechanism). No
// dedicated decal art has landed (assets/dressing has no per-decal slugs), so every decal is currently
// the procedural tint card — the seam is here (kindColor) the moment real decal art wants to join it.
const DECAL_KIND_COLOR = {
  blood: 0x6e1414, scorch: 0x2a2018, impact: 0x8a8478, dust: 0xcfc9a8
};
const DECAL_GEO_CACHE = {};
function decalGeoFor(radius){
  const key = radius.toFixed(3);
  if(!DECAL_GEO_CACHE[key]) DECAL_GEO_CACHE[key] = new THREE.CircleGeometry(radius, 10);
  return DECAL_GEO_CACHE[key];
}
const INTERIOR_DECAL_Y_OFFSET = 0.010; // BW2-2: relative to THIS cell's own floor top (interiorFloorTopAt), not the bare -0.5 plane — clears the contact-pool layer's own +0.003 offset
function interiorBuildDecals(decals, cx, cz, floorTopMap){
  const group = new THREE.Group();
  (decals || []).forEach((d) => {
    const color = DECAL_KIND_COLOR[d.kind] || DECAL_KIND_COLOR.impact;
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(decalGeoFor(0.32), mat);
    mesh.rotation.x = -Math.PI / 2;
    // BW2-2: a hair above THIS cell's own real floor top (interiorFloorTopAt), never the bare -0.5
    // plane the pre-BW2-2 hardcode assumed — visible history reads ON the actual floor surface, still
    // above the contact-pool layer so the two never fight for the same plane.
    const floorTop = interiorFloorTopAt(floorTopMap, d.x || 0, d.y || 0);
    mesh.position.set((d.x || 0) - (cx || 0), floorTop + INTERIOR_DECAL_Y_OFFSET, (d.y || 0) - (cz || 0));
    mesh.userData.decalKind = d.kind || "impact";
    group.add(mesh);
  });
  return group;
}

// ---- split B7 chunk boundary: nothing was skipped here — interiorBuildDecals and the hit-effect
// seam are adjacent in the monolith. ----

/* BEAUTY-WAVE.md VP6 item 5 — HIT-EFFECTS SEAM. hit-damage/fall-death (act-cast stays out of scope for
   THIS unit's production wiring — see below) spawn an effect card at the target: real effects-core art
   the moment it lands (effectCardFor's own async cache-with-placeholder-replay convention, same idiom
   as dressingTextureFor/dressingPlaceholderTexture just above) OR a procedural flash-ring quad standing
   in behind the SAME seam while no art has landed yet (`effectCardFor(name) || proceduralRing`, the
   spec's own literal words). Oversized 1.5-2x at the target per GRAPHICS-ENGINE §B. Lives in S.fxGroup
   (already swept every board swap by clearGroup(S.fxGroup) in setInteriorBoard/retire — zero new
   cleanup bookkeeping needed) and expires via a normal S.tweens entry (the SAME tween array
   buildTheaterCtx/tickTweens already drain every frame) fading opacity to 0 over EFFECT_CARD_DUR ms,
   then removing + disposing itself — "assert spawn+expiry" per the spec's own verify line. */
const EFFECT_CARD_DUR = 420;
const EFFECT_RING_GEO_CACHE = {};
function effectRingGeoFor(radius){
  const key = radius.toFixed(3);
  if(!EFFECT_RING_GEO_CACHE[key]) EFFECT_RING_GEO_CACHE[key] = new THREE.RingGeometry(radius * 0.55, radius, 20);
  return EFFECT_RING_GEO_CACHE[key];
}
const EFFECT_PROC_COLOR = { "hit-damage": 0xff5040, "fall-death": 0x8a8478, "act-cast": 0x8a6bff };
// effectCardFor(name) — real effects-core art seam (VP2's fold, GR2 §D-adjacent convention): tries
// assets/dressing/effect-<name>.png via the SAME async TextureLoader-with-cache pattern as
// dressingTextureFor, but returns null (not a placeholder) synchronously until a real texture resolves —
// an absent effect texture is the documented `|| proceduralRing` fallback below, never a labeled
// placeholder card (a placeholder reads as "art is coming"; a procedural ring reads as "this IS the
// effect, art will refine it later" — the correct fallback register for a combat-feedback flash).
function effectCardFor(name){
  if(!S.effectTexCache) S.effectTexCache = {};
  const key = "effect:" + name;
  if(!(key in S.effectTexCache)){
    S.effectTexCache[key] = null; // pending
    textureLoader.load(
      "assets/dressing/effect-" + name + ".png",
      (tex) => { nearestify(tex); S.effectTexCache[key] = tex; },
      undefined,
      () => { S.effectTexCache[key] = false; } // confirmed missing — never retried
    );
  }
  const cached = S.effectTexCache[key];
  return cached ? cached : null;
}
function spawnEffectCard(name, x, y, z, oversize){
  if(!S.fxGroup) return null;
  const size = 1 * (oversize || 1.7); // "oversized 1.5-2x" — 1.7 is the seam's own default midpoint
  const tex = effectCardFor(name);
  const color = EFFECT_PROC_COLOR[name] || 0xffffff;
  const mat = new THREE.MeshBasicMaterial({
    map: tex || null, color: tex ? 0xffffff : color, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  });
  const geo = tex ? new THREE.PlaneGeometry(size, size) : effectRingGeoFor(size * 0.5);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.userData.effectCard = name;
  S.fxGroup.add(mesh);
  const baseOpacity = mat.opacity;
  S.tweens.push({
    start: Date.now(), dur: EFFECT_CARD_DUR,
    update(t){ mat.opacity = baseOpacity * (1 - t); },
    onDone(){
      if(mesh.parent) mesh.parent.remove(mesh);
      if(mat.dispose) mat.dispose();
      if(geo && geo.dispose && !tex) { /* cached ring geo — never dispose the shared cache entry */ }
    }
  });
  startTweenLoop();
  return mesh;
}

// ---- split B7 chunk boundary: nothing was skipped here — the effect seam and the selection ring
// are adjacent in the monolith. ----

/* BEAUTY-WAVE VP5 item 2 — diegetic selection: "the acting unit's chip highlights AND its standee
   gets a ground-ring glow (reuse the blob-quad channel, accent color)." Same convention as
   addGroundingBlob just above (a flat circle quad, seated at the floor plane) but a thin RING
   (inner radius carved out) so it reads as a glow ANNOUNCING the figure rather than a shadow
   grounding it, and it rides the accent gold rather than near-black. Mounted as a CHILD of the
   unit's own figure group (not a separate group tracked by world x/z) so it inherits the figure's
   position/rotation for free and gets swept automatically the instant clearGroup() disposes that
   figure on the next setUnits() — no separate cleanup bookkeeping needed beyond the one call below
   that removes the previous ring before adding a new one. */
const ACTING_RING_MAT = new THREE.MeshBasicMaterial({
  color: 0xd4af6e, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false
});
const ACTING_RING_GEO_CACHE = {};
function actingRingGeoFor(radius){
  const key = radius.toFixed(3);
  if(!ACTING_RING_GEO_CACHE[key]) ACTING_RING_GEO_CACHE[key] = new THREE.RingGeometry(radius * 0.7, radius, 28);
  return ACTING_RING_GEO_CACHE[key];
}
// BEAUTY-WAVE-4.md MF-4 item 1 (the rhythm layer): the acting-ring's own slide duration, same
// tween-channel discipline as MF-1's placeCameraTweened (reuses mf1EaseOutCubic/mf1Lerp above —
// they're generic numeric-ease helpers despite the mf1-prefixed name, not camera-specific).
const MF4_RING_SLIDE_DUR = 300;
// interior standees wrap their own base rim (radius derived from the stamped base radius); tabletop
// figures use the fixed 0.6 floor-blob convention. Pulled out of setActingUnit's old inline body so
// both the slide path and the instant (re)mount path below share one derivation.
function actingRingRadiusFor(fig){
  const interiorFig = !!(fig.userData && fig.userData.interiorTrueScale);
  return interiorFig ? Math.max(0.12, (fig.userData.interiorBaseRadius || 0.3) * 1.2) : 0.6;
}
// world-space target for the ring: the fig's own world position plus the SAME fixed local y offset
// the pre-MF-4 child-of-fig mount used (a hair above local y=0 for an interior standee's base-rim
// contact line, -0.48 for a tabletop figure — see the original comment preserved on the instant path
// below). A ring is a flat disc rotated flat (-90° on local X) so it's radially symmetric — reading
// its position in world space instead of as a fig-child is visually identical as long as the fig
// itself never scales/tilts off the vertical (true for every figure this renders today), which is
// exactly what lets the MF-4 slide below move the SAME mesh across two different figures' local
// frames without a re-parent mid-flight.
function actingRingWorldPosFor(fig){
  const interiorFig = !!(fig.userData && fig.userData.interiorTrueScale);
  const world = new THREE.Vector3();
  fig.getWorldPosition(world);
  world.y += interiorFig ? 0.003 : -0.48;
  return world;
}
/* setActingUnit(idOrIds) — takes a single unit id OR an array (COMBAT.md's side-based initiative has
   no single "current actor," only a currently-acting SIDE — the PC is one unit so its turn lights one
   ring, but the foes' turn can mean several live foes could act, so the caller passes every live id on
   the acting side; the existing .cmb-active chip class already does the identical "highlight the whole
   side" thing, this is that same design call applied to standees). id(s)=null/[] clears every ring
   (between rounds / no fight). Returns the count of rings actually mounted (0 if none resolved).

   BEAUTY-WAVE-4.md MF-4 item 1: "the gold base glow + ring TWEEN between units — a 300ms slide of the
   ring to the next actor — instead of blinking/teleporting." A clean single-actor-to-single-actor
   HANDOFF (exactly one previous acting id, exactly one new one, and they differ — the common "whose
   turn it is" case for the PC or a lone acting foe) now SLIDES the existing ring mesh from the old
   actor's world position to the new actor's over MF4_RING_SLIDE_DUR ms on the shared S.tweens channel,
   instead of the old instant remove+recreate. Any other shape — first reveal (0 -> N), a full clear
   (N -> 0), a multi-unit acting SIDE on either end, or the same id repeated — keeps the pre-MF-4
   instant behavior verbatim (a slide only reads as "the eye follows whose turn it is" between exactly
   two rings; interpolating N>1 rings has no single well-defined path and isn't asked for). The base
   glow itself is NOT slid (a base is a fixed mesh per unit — there's nothing physical to interpolate
   between two different bases) — it keeps toggling instantly per the existing BW2-2b law; only the
   one ring object animates. */
function setActingUnit(idOrIds){
  const ids = idOrIds == null ? [] : (Array.isArray(idOrIds) ? idOrIds : [idOrIds]);

  // cancel any in-flight ring-slide tween first — never two competing slides live at once, same
  // retarget-not-stack discipline as MF-1's placeCameraTweened cancelling a stale camera-pose tween.
  if(S.tweens && S.tweens.length){
    S.tweens = S.tweens.filter((tw) => !(tw && tw.isRingSlideTween));
  }

  // BW2-2b item 3 (TURN GLOW): revert every PREVIOUSLY-glowing base before mounting the new set —
  // instant in every case, slide or not (see header above).
  (S.actingGlowBaseMeshes || []).forEach(function(m){ setBaseGlow(m, false); });
  S.actingGlowBaseMeshes = [];

  // resolve the new id set's figs up front — needed both for the slide-eligibility check and the
  // instant mount loop below.
  const figsById = {};
  ids.forEach(function(id){
    if(id == null) return;
    const fig = findUnit(id);
    if(fig) figsById[id] = fig;
  });
  const newResolvedIds = ids.filter((id) => figsById[id]);
  const prevIds = S.actingIds || [];

  const canSlide = prevIds.length === 1 && newResolvedIds.length === 1 && prevIds[0] !== newResolvedIds[0]
    && S.actingRingMeshes && S.actingRingMeshes.length === 1 && S.actingRingMeshes[0].parent;

  if(canSlide){
    const ringMesh = S.actingRingMeshes[0];
    const fromWorld = ringMesh.getWorldPosition(new THREE.Vector3());
    const toFig = figsById[newResolvedIds[0]];
    const toWorld = actingRingWorldPosFor(toFig);
    const toRadius = actingRingRadiusFor(toFig);
    const toInterior = !!(toFig.userData && toFig.userData.interiorTrueScale);

    // detach from the old fig and reparent to the scene root AT its current world position, so the
    // tween below can move it in pure world space without fighting either fig's local transform.
    if(ringMesh.parent) ringMesh.parent.remove(ringMesh);
    ringMesh.position.copy(fromWorld);
    ringMesh.rotation.x = -Math.PI / 2;
    S.scene.add(ringMesh);

    if(!S.tweens) S.tweens = [];
    S.tweens.push({
      start: Date.now(),
      dur: MF4_RING_SLIDE_DUR,
      isRingSlideTween: true,
      update: (t) => {
        const e = mf1EaseOutCubic(t);
        ringMesh.position.set(
          mf1Lerp(fromWorld.x, toWorld.x, e),
          mf1Lerp(fromWorld.y, toWorld.y, e),
          mf1Lerp(fromWorld.z, toWorld.z, e)
        );
      },
      onDone: () => {
        // dock into the new fig's local frame — matches the instant-mount convention exactly (see the
        // radius/Y comment on the instant path below), so any later board rebuild sees the same
        // parented-to-fig shape it always has, slide or not.
        toFig.add(ringMesh);
        ringMesh.position.set(0, toInterior ? 0.003 : -0.48, 0);
        const wantGeo = actingRingGeoFor(toRadius);
        if(ringMesh.geometry !== wantGeo) ringMesh.geometry = wantGeo;
      }
    });
    markDirty();
    startTweenLoop();

    // the new actor's base glow mounts instantly (unchanged BW2-2b law) — only the ring itself is
    // mid-flight this turn.
    if(toInterior && toFig.userData.standeeBaseMesh){
      setBaseGlow(toFig.userData.standeeBaseMesh, true);
      S.actingGlowBaseMeshes.push(toFig.userData.standeeBaseMesh);
    }
    S.actingIds = newResolvedIds;
    return 1;
  }

  // instant path — byte-identical to the pre-MF-4 behavior, used for first reveal, a full clear, any
  // multi-unit acting side, or a same-id no-op call.
  (S.actingRingMeshes || []).forEach(function(m){ if(m.parent) m.parent.remove(m); });
  S.actingRingMeshes = [];
  let mounted = 0;
  newResolvedIds.forEach(function(id){
    const fig = figsById[id];
    // BW2-2: an interior true-scale standee's ring relocates to wrap its own BASE rim (slightly
    // larger radius, same gold) instead of the tabletop's fixed 0.6-radius floor-blob convention below
    // — the base radius was stamped onto userData at mount time (interiorBuildPieces/setUnits, both
    // above) specifically for this. A non-interior (tabletop combat) figure carries no
    // interiorTrueScale flag at all, so it falls through to the exact pre-BW2-2 radius/Y — byte-
    // identical, untouched.
    const interiorFig = !!(fig.userData && fig.userData.interiorTrueScale);
    const ringRadius = actingRingRadiusFor(fig);
    const mesh = new THREE.Mesh(actingRingGeoFor(ringRadius), ACTING_RING_MAT);
    mesh.rotation.x = -Math.PI / 2;
    // interior: a hair above local y=0 — which IS the base's own top face / the standee's own
    // contact line (buildInteriorBase's header explains why local 0 is that shared reference point) —
    // so the ring reads as wrapping the base rim. tabletop (unchanged): -0.48, above the grounding
    // blob's -0.495 and below the hostility base disc, per the SAME layering law addGroundingBlob's
    // header documents ("never fighting it for the same plane").
    mesh.position.set(0, interiorFig ? 0.003 : -0.48, 0);
    fig.add(mesh);
    S.actingRingMeshes.push(mesh);
    // BW2-2b item 3: the base itself glows gold too (joins the ring, not a replacement) — only an
    // interior standee HAS a base mesh at all (stamped onto userData at mount time, same discriminator
    // as the ring radius above); a tabletop figure's own hostility disc/grounding blob are untouched.
    if(interiorFig && fig.userData.standeeBaseMesh){
      setBaseGlow(fig.userData.standeeBaseMesh, true);
      S.actingGlowBaseMeshes.push(fig.userData.standeeBaseMesh);
    }
    mounted++;
  });
  S.actingIds = newResolvedIds;
  markDirty();
  return mounted;
}

// ---- split B7 chunk boundary: nothing was skipped here — the selection ring and the damage
// floaters are adjacent in the monolith. hashSeed (just below spawnFloater in the root) is shared
// with the verb/kilter families and stays in theater-boot.js, arriving here through ctx. ----

/* BEAUTY-WAVE VP5 item 3 — damage floaters. projectUnit(id) turns a mounted unit's world position
   into on-screen pixel coordinates (relative to the canvas host), the SAME Vector3.project(camera)
   math interiorFrustumCheck already uses above, just for one point instead of a room's corners.
   headHeight defaults to HUMAN_TRUE_HEIGHT-ish (1.1, matching interiorFrustumCheck's own default)
   so the floater spawns near a standing figure's head, not its feet. */
function projectUnit(id, headHeight){
  if(!S.mounted || !S.camera || !S.renderer) return null;
  const fig = findUnit(id);
  if(!fig) return null;
  const h = (typeof headHeight === "number" && isFinite(headHeight)) ? headHeight : 1.1;
  const world = new THREE.Vector3();
  fig.getWorldPosition(world);
  world.y += h;
  S.camera.updateMatrixWorld();
  const v = world.clone().project(S.camera);
  const rect = S.renderer.domElement.getBoundingClientRect();
  const w = rect.width || S.renderer.domElement.clientWidth || 1;
  const hgt = rect.height || S.renderer.domElement.clientHeight || 1;
  const x = (v.x * 0.5 + 0.5) * w;
  const y = (1 - (v.y * 0.5 + 0.5)) * hgt;
  const onscreen = v.z < 1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1;
  return { x, y, onscreen };
}

/* spawnFloater(id, text, opts) — appends one ephemeral DOM node into S.floaterEl (the persistent
   overlay div created at mount()/reattach() above, so it survives the host's innerHTML replacement
   on the NEXT combat re-render same as the canvas does). AMENDED per the VP5 spec's 2c-framing note:
   "either reproject per-frame while alive, or anchor at spawn and rely on the fast fade; never let a
   floater drift onto the wrong standee after a camera fit" — this picks anchor-at-spawn (the fade is
   only 600ms, well inside a single camera-fit beat, so drift risk is negligible and it avoids a
   per-frame rAF hook keeping a reference to a figure that might get disposed mid-fade). Returns the
   node (or null if the unit can't be projected — e.g. pre-mount, headless, or off-board). */
function spawnFloater(id, text, opts){
  if(!S.floaterEl) return null;
  const pos = projectUnit(id, opts && opts.headHeight);
  if(!pos) return null;
  const el = document.createElement("div");
  el.className = "theater-floater" + (opts && opts.variant ? (" theater-floater-" + opts.variant) : "");
  el.style.left = pos.x + "px";
  el.style.top = pos.y + "px";
  el.textContent = String(text == null ? "" : text);
  S.floaterEl.appendChild(el);
  // fast, deterministic cleanup — no reliance on an animationend listener firing (a re-render that
  // detaches floaterEl mid-fade must not leak the node or the timer's closure forever).
  setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 650);
  return el;
}

export {
  DECAL_KIND_COLOR, decalGeoFor, INTERIOR_DECAL_Y_OFFSET, interiorBuildDecals,
  EFFECT_CARD_DUR, effectRingGeoFor, EFFECT_PROC_COLOR, effectCardFor, spawnEffectCard,
  ACTING_RING_MAT, actingRingGeoFor, MF4_RING_SLIDE_DUR, actingRingRadiusFor, actingRingWorldPosFor,
  setActingUnit,
  projectUnit, spawnFloater
};
