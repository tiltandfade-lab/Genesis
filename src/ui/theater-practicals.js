/* THEATER PRACTICALS — the INTERIOR PRACTICAL-FIXTURE family: the E0 VISIBLE PRACTICALS rig
   (docs/WALL-VOLUMES-PRACTICALS.md), the U3 shadow-caster budget, the P-1 emitter nub / light card,
   the BW3-4 light-shaft cone and the diagnostic glow disc — extracted VERBATIM from
   src/ui/theater-boot.js in split step B5 (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   OWNERSHIP: turning src/ui/theater-interior.js's plain `data.lights` entries into REAL THREE objects.
   interiorBuildLights is the one funnel; under it sit the shadow-caster budget
   (INTERIOR_SHADOW_CASTER_CAP / INTERIOR_SHADOW_MAP_SIZE / interiorAssignShadowCasters), the physical
   fixture builders (ITR_FIXTURE_BODY_PARTS / ITR_FIXTURE_EMITTER_GEO / interiorFixtureBodyMaterial /
   interiorFixtureEmitterMaterial / interiorBuildFixtureGroup), the placement resolvers
   (interiorEnvLightHalfExtent / interiorNearestWallMountSlot / interiorResolveFixturePlacement), and
   the three optional visible-source builders (interiorBuildGlowDisc, interiorBuildLightCard,
   interiorBuildLightEmitterNub, interiorBuildLightCone) with their own authored consts —
   ITR_LIGHT_DISTANCE_CAP travelled with them (its only reader is interiorBuildLights).

   NO SCHEDULER, NO STATE: censused — this module never touches `S` (the only `S.` strings left in it
   are prose inside comments), so unlike theater-lighting.js / theater-post.js it takes NO SyncState.
   The flicker TARGETS it collects are returned to the caller as plain data; the flicker LOOP that
   consumes them stays in theater-lighting.js, and the MOTE loop stays in theater-motes.js — the brief's
   scheduler-separation contract is untouched, nothing was unified.

   CTX LAW (recon §7.3 — acyclic imports; same shape as every B1-B4 module): this module NEVER imports
   theater-boot.js. Capabilities arrive ONCE via practicalsInit(ctx) into the module-local mirrors below.
   It DOES import four symbols DIRECTLY from its sibling src/ui/theater-lighting.js (celestialArcFor,
   CELESTIAL_PROFILE_SET, CELESTIAL_MIN_KEY_HEIGHT for the ENV-1c-aware exterior light entries;
   INTERIOR_LIGHT_FLICKER_AMPLITUDE for the per-fixture flicker default) — a one-way leaf->leaf edge,
   censused acyclic (theater-lighting.js reads nothing from this file).

   ROOT-OWNED, DELIBERATELY NOT MOVED (they arrive through ctx instead):
     ITR_BRIGHT_SUPPRESS_PRACTICALS, ITR_GLOW_DISC_DIAGNOSTIC, ITR_LIGHT_CONE_ENABLED — mutable root
       `let`s that window.Theater's setBrightPracticalsSuppressed / setGlowDiscDiagnosticForTest /
       setLightConeEnabled seams reassign at runtime. Import bindings are read-only and copied mirrors
       would go stale the moment a harness flips one, so all three are read LIVE through accessors
       (practicalsCtxBrightSuppressPracticals / practicalsCtxGlowDiscDiagnostic /
       practicalsCtxLightConeEnabled) — B2/B3/B4's flag law. These are the ONLY THREE non-verbatim
       production lines in this file, each marked with an inline `split B5` note at the exact line.
       (ITR_LIGHT_EMITTER_NUB_ENABLED is a fourth root-owned `let` of the same family, but it is read
       ONLY by its own window.Theater getter/setter pair — no body here reads it — so it needs no
       accessor; it simply stayed in the root with its own header prose.)
     LIGHT_TUNABLES (the live tunables object — interiorBuildLights reads .lightRenderGain through it),
       BLOOM_LAYER (interiorBuildFixtureGroup stamps it on every true emitter; shared with
       theater-post.js's mask and the clay room's ctx, so the root stays its single owner),
       ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE, interiorFloorTopAt (the derived floor-top law, read by a
       dozen non-practical root sites) and dressingTextureFor (the dressing-card texture join).

   NON-VERBATIM EDITS (the complete list): this header, the import/mirror/init prologue below, the four
   `split B5` chunk-boundary notes marking where a root-owned declaration was left behind, the three
   accessor lines named above, and the trailing `export {...}` block. Not one other byte inside a moved
   declaration changed. */
import * as THREE from "three";
// split B5: the sibling lighting module (leaf->leaf, one-way — see this file's header). Identical
// specifier spelling to theater-boot.js's own import of the same file, so both resolve to the ONE
// cached module instance and celestialArcFor here IS the function the root calls.
import {
  celestialArcFor, CELESTIAL_PROFILE_SET, CELESTIAL_MIN_KEY_HEIGHT, INTERIOR_LIGHT_FLICKER_AMPLITUDE
} from "./theater-lighting.js";

// ---- root-capability mirrors (wired once by practicalsInit; this module never reads S) ----
let practicalsCtxBrightSuppressPracticals, practicalsCtxGlowDiscDiagnostic, practicalsCtxLightConeEnabled;
let BLOOM_LAYER, ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE, LIGHT_TUNABLES, dressingTextureFor, interiorFloorTopAt;

export function practicalsInit(ctx){
  ({ BLOOM_LAYER,
    ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE,
    LIGHT_TUNABLES,
    dressingTextureFor,
    interiorFloorTopAt } = ctx);
  practicalsCtxBrightSuppressPracticals = ctx.practicalsCtxBrightSuppressPracticals;
  practicalsCtxGlowDiscDiagnostic = ctx.practicalsCtxGlowDiscDiagnostic;
  practicalsCtxLightConeEnabled = ctx.practicalsCtxLightConeEnabled;
}

// BW2-4b item 1 — INTERIOR LIGHT RANGE CAP. The torch/lamp PointLights (data.lights, default range 12)
// spilled far enough that an 8-torch room had NO dark corner — every cell sat in some pool, so a sprite
// read ~0.7 of full-bright everywhere (the BRIGHTNESS LAW's exact failure). Capping the range tightens
// each pool to the mock's small hot circle, so the gaps between pools go genuinely dark and a standee
// standing there reads dim. Pool brightness (near the flame) is untouched — only the far spill is cut.
const ITR_LIGHT_DISTANCE_CAP = 7;

// split B5: ITR_LIGHT_DISTANCE_CAP travelled here from theater-boot.js's stage-const block (its only
// reader is interiorBuildLights, below). Its neighbours in that block — ITR_CAMERA_KEY_INTENSITY,
// ITR_CAMERA_KEY_CASTS_SHADOW, the ITR_SCENE_*/ITR_BRIGHT_*/ITR_EMISSIVE_* families and
// SPRITE_CAMERA_FILL_* — all have non-practical readers and stayed in the root.

// DUNGEON-GRAPH.md U3 iteration-2, ruling 2: cap total shadow-CASTING lights per interior board —
// each shadow-casting PointLight is its own shadow-map render pass, so an unbounded count on an
// 80-room whole-plan render would tank frame time. Non-casting lights still LIGHT the scene (real
// PointLight, real falloff, real color) — they just skip the shadow-map cost. Nearest-to-focus wins
// (see interiorAssignShadowCasters below); this is a render-BUDGET cap, not a data-shape cap — U3's
// own instance/draw-call budget is untouched.
const INTERIOR_SHADOW_CASTER_CAP = 4;
const INTERIOR_SHADOW_MAP_SIZE = 512; // small per-light map — 4 lights x 512^2 stays cheap on the dev machine

// deterministic distance-sort + cap: the CENTER (cx,cz) is the focus-room-or-whole-plan centroid
// setInteriorBoard already computes (the SAME point placeCamera aims at) — lights nearest that point
// are the ones actually inside/adjacent the room the camera is looking at, so they're the ones worth
// paying the shadow-map cost for.
function interiorAssignShadowCasters(lights, cx, cz){
  const withDist = (lights || []).map((l, i) => ({
    l, i,
    priority: Number.isFinite(l.shadowBudgetPriority) ? l.shadowBudgetPriority : 1,
    d: Math.hypot((l.x || 0) - cx, (l.z || 0) - cz)
  })).filter((row) => row.l.castShadow !== false);
  withDist.sort((a, b) => b.priority - a.priority || a.d - b.d || a.i - b.i);
  const casterIdx = new Set(withDist.slice(0, INTERIOR_SHADOW_CASTER_CAP).map((w) => w.i));
  return (lights || []).map((l, i) => Object.assign({}, l, { castShadow: casterIdx.has(i) }));
}

// BW2-4 addendum (Adam, mid-flight: "I don't think I have seen any... in-world light sources") — THE
// LIGHT-MARKER SWAP. Adam's ruling 2 asked the source to "read as an object, not magic"; U3's first cut
// was a bare flame-colored RECTANGLE quad, which reads at board distance as a floating orange rectangle
// (Adam's complaint). Two replacements, both deterministic (same seeds, no RNG):
//  (a) EVERY light gets a soft additive GLOW DISC (radial-gradient, not a hard-edged rectangle) at the
//      flame point — the universal "this point emits" read, and the flicker channel's opacity target.
//  (b) Realms with a light-primary dressing card (INTERIOR_LIGHT_CARD) additionally get that card
//      standing self-lit on the floor at the light seed — a lantern/candle OBJECT (mock-01-finale.png
//      stands floor lanterns exactly this way). Where no card exists, the glow disc alone stands in.
// A realmId -> floor-standing light-card slug map. Grepped from assets/dressing: gloom/fantasy carry
// lantern/candle cards today; realms without one fall through to the glow-disc-only path (never a bare
// rectangle again). The emitter card never casts a shadow (it sits AT the light — a self-shadow on its
// own pool is degenerate) and is self-lit (MeshBasicMaterial), so it reads at the plunged ambient.
const INTERIOR_LIGHT_CARD = {
  gloom: "gloom-clutter-lanternrust",
  fantasy: "fantasy-clutter-lanternhook",
  chrome: "chrome-flora-lightpod", // BW2-4b item 5: chrome's folded light-pod card so its cones stand on a real fixture too
};
const INTERIOR_LIGHT_CARD_HEIGHT = 1.1; // world units — a small floor lantern, well under standee height
let INTERIOR_GLOW_TEXTURE = null;
function interiorGlowTexture(){
  if(INTERIOR_GLOW_TEXTURE) return INTERIOR_GLOW_TEXTURE;
  const size = 64;
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(cv);
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; // a soft glow — never nearest
  INTERIOR_GLOW_TEXTURE = tex;
  return tex;
}
// the soft additive glow disc — a camera-facing group (userData.sprite) so updateSpriteBillboardYaw
// turns it to face the camera; returns {group, mesh} so the flicker channel can pulse mesh.opacity.
// GLOW DISC SIZE/OPACITY (2026-07-12, Adam "I'm looking right at orbs"): the disc was sized UP
// (0.5/0.6 -> 0.85/1.0) + opacity 0.95 by BW2-4b so it read as the apex fixture of a light CONE. The
// cone was KILLED in DIEGETIC-LIGHT (ITR_LIGHT_CONE_ENABLED=false) — so an oversized near-opaque
// additive plane was left floating with no cone, reading as a big glowing ORB. Shrunk back to a tight
// flame-glow: the emitter NUB (interiorBuildLightEmitterNub, P-1) is the visible physical source now;
// this disc is just the flame's hot halo, not the source itself. Named + dial-able.
const ITR_GLOW_DISC_SIZE = 0.42;         // torch/fire; a tight flame glow, not a cell-wide orb
const ITR_GLOW_DISC_SIZE_LAMP = 0.36;    // lamps read a hair smaller/cooler
const ITR_GLOW_DISC_OPACITY = 0.6;       // softer than the old cone-apex 0.95

// split B5: ITR_GLOW_DISC_DIAGNOSTIC (a mutable root `let`, flipped live by
// window.Theater.setGlowDiscDiagnosticForTest) stayed in theater-boot.js with its own header prose and
// arrives through the practicalsCtxGlowDiscDiagnostic accessor — see this file's header.

function interiorBuildGlowDisc(light){
  const size = (light.kind === "lamp" ? ITR_GLOW_DISC_SIZE_LAMP : ITR_GLOW_DISC_SIZE);
  const geo = new THREE.PlaneGeometry(size, size);
  const mat = new THREE.MeshBasicMaterial({
    map: interiorGlowTexture(), color: light.color || "#ffbb66",
    transparent: true, opacity: ITR_GLOW_DISC_OPACITY, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide
  });
  mat.userData.psxExempt = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = false; mesh.receiveShadow = false; // a light's own glow never shadows itself
  const group = new THREE.Group();
  group.add(mesh);
  group.userData.sprite = true;
  return { group, mesh };
}
// the floor-standing emitter card (self-lit lantern/candle) — mirrors buildDressingCard's construction
// (dressingTextureFor's always-available placeholder-or-real join, alpha-cutout, psxExempt) but never
// casts a shadow (it sits AT its own light) and stands at a fixed small lantern height.
function interiorBuildLightCard(slug){
  const tex = dressingTextureFor(slug);
  const h = INTERIOR_LIGHT_CARD_HEIGHT;
  const geo = new THREE.PlaneGeometry(h, h);
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, depthWrite: true
  });
  mat.userData.psxExempt = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = h / 2;
  mesh.castShadow = false; mesh.receiveShadow = false;
  const g = new THREE.Group();
  g.add(mesh);
  g.userData.sprite = true;
  g.userData.dressingSlug = slug;
  g.userData.lightEmitterMarker = "card"; // P-1 problem 3 test-facing tag — see _interiorLightEmittersForTest
  return g;
}


// split B5: ITR_LIGHT_EMITTER_NUB_ENABLED (a mutable root `let`) stayed in theater-boot.js with its own
// header prose. No body in this file reads it — its only readers are its own window.Theater
// getter/setter pair — so it needs no ctx accessor at all.

const ITR_LIGHT_EMITTER_NUB_RADIUS = 0.16; // world units — a small stub, well under a standee's own scale
const ITR_LIGHT_EMITTER_NUB_HEIGHT = 0.3;
function interiorBuildLightEmitterNub(light){
  const geo = new THREE.CylinderGeometry(ITR_LIGHT_EMITTER_NUB_RADIUS * 0.7, ITR_LIGHT_EMITTER_NUB_RADIUS, ITR_LIGHT_EMITTER_NUB_HEIGHT, 8);
  const mat = new THREE.MeshBasicMaterial({ color: light.color || "#ffbb66" });
  mat.userData.psxExempt = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = ITR_LIGHT_EMITTER_NUB_HEIGHT / 2;
  mesh.castShadow = false; mesh.receiveShadow = false; // a light's own tiny fixture never shadows itself (same discipline as the glow disc/card)
  const g = new THREE.Group();
  g.add(mesh);
  g.userData.lightEmitterMarker = "nub"; // test-facing tag — see _interiorLightEmittersForTest
  return g;
}

// BEAUTY-WAVE-3.md BW3-4 — LIGHT SHAFTS: the classic cheap fake-volumetric "god ray" — a single
// camera-yaw-facing gradient-cone billboard per light, apex at the flame/lamp point, widening
// DOWNWARD to the room's own floor (interiorFloorTopAt — the derived law, never a bare -0.5 plane),
// bridging the glow-disc marker to the floor pool the mock (mock-01-fantasy-explore.png) reads as one
// warm shaft. Cheap quads only: one PlaneGeometry + one CanvasTexture, additive+depthWrite:false (never
// occludes — the same "additive glow" family the glow disc/light card already are), no ray-marching,
// no post pass (BW3-0's composer seam is a sibling unit — this stays independent of it, same MeshBasic
// family as everything else in this render).
const ITR_LIGHT_CONE_WIDTH_RATIO = 0.55; // base (floor) width as a fraction of the apex->floor height
const ITR_LIGHT_CONE_MIN_HEIGHT = 0.6;   // guards a degenerate sliver when a light sits almost on the floor
const ITR_LIGHT_CONE_OPACITY = { lamp: 0.22, torch: 0.3 }; // a whisper — this is atmosphere, not a second light source

// split B5: ITR_LIGHT_CONE_ENABLED (a mutable root `let`, flipped live by
// window.Theater.setLightConeEnabled) stayed in theater-boot.js with its own L-1 CONE GATE header and
// arrives through the practicalsCtxLightConeEnabled accessor — see this file's header.

let INTERIOR_CONE_TEXTURE = null;
// a triangular alpha gradient painted onto a plain rectangle (the fake-cone trick: the QUAD stays a
// simple billboard, the CONE SHAPE lives entirely in the texture's alpha) — apex at canvas top (y=0,
// centered), base spanning most of the canvas width at the bottom; a vertical gradient additionally
// fades the whole shape toward transparent by the floor so the shaft reads as dissipating light, not a
// hard-edged wedge.
function interiorConeTexture(){
  if(INTERIOR_CONE_TEXTURE) return INTERIOR_CONE_TEXTURE;
  const w = 128, h = 256;
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);    // apex — the flame/lamp point
  ctx.lineTo(w * 0.14, h); // floor-pool left edge
  ctx.lineTo(w * 0.86, h); // floor-pool right edge
  ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.5, "rgba(255,255,255,0.4)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fill();
  const tex = new THREE.CanvasTexture(cv);
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; // a soft gradient — never nearest
  INTERIOR_CONE_TEXTURE = tex;
  return tex;
}
// `height` is the apex->floor world-unit span (interiorBuildLights computes this off the light's own
// y and interiorFloorTopAt, below) — returns {group, mesh} so the flicker channel can pulse
// mesh.material.opacity in sync with its light, same contract as interiorBuildGlowDisc.
function interiorBuildLightCone(light, height){
  const h = Math.max(ITR_LIGHT_CONE_MIN_HEIGHT, height);
  const w = h * ITR_LIGHT_CONE_WIDTH_RATIO;
  const geo = new THREE.PlaneGeometry(w, h);
  const baseOpacity = ITR_LIGHT_CONE_OPACITY[light.kind] != null ? ITR_LIGHT_CONE_OPACITY[light.kind] : ITR_LIGHT_CONE_OPACITY.torch;
  const mat = new THREE.MeshBasicMaterial({
    map: interiorConeTexture(), color: light.color || "#ffbb66",
    transparent: true, opacity: baseOpacity, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide
  });
  mat.userData.psxExempt = true;
  const mesh = new THREE.Mesh(geo, mat);
  // the texture's apex (canvas y=0) maps to the plane's own top edge — shifting the mesh DOWN by
  // half its height puts that top edge at the group's local origin (where the group gets positioned
  // to the light's own apex point, below), so the cone's wide base descends from there toward the
  // floor, never the reverse.
  mesh.position.y = -h / 2;
  mesh.castShadow = false; mesh.receiveShadow = false; // a light's own volumetric shaft never shadows itself
  const group = new THREE.Group();
  group.add(mesh);
  group.userData.sprite = true; // camera-yaw-facing billboard, same convention as the glow disc/light card
  return { group, mesh };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
// E0 — VISIBLE PRACTICALS (docs/WALL-VOLUMES-PRACTICALS.md): a small deterministic recipe grammar —
// cylinders/cups/handles/brackets/wax columns/faceted crystals — one entry per fixtureId
// (src/ui/theater-interior.js's own ITR_FIXTURE_RECIPES names, kept in sync by convention, same
// one-way classic/ES-module boundary discipline the light-profile vocabulary already uses). Every
// recipe returns BODY parts (plain primitives, MeshLambertMaterial, NEVER emissive/bloom) plus the ONE
// emissive EMITTER submesh — built and POSITIONED at the light record's own `emitterLocal` (never a
// second, independently-guessed height), so the PointLight (also mounted at `emitterLocal`, below) and
// the emitter submesh's bounds agree BY CONSTRUCTION, not by two authors' numbers happening to match.
// ════════════════════════════════════════════════════════════════════════════════════════════════
const ITR_FIXTURE_BODY_PARTS = {
  "sconce-iron": (el) => [
    { geo: () => new THREE.BoxGeometry(0.05, 0.05, Math.max(0.05, el.z * 0.85)), pos: [0, el.y * 0.4, el.z * 0.42] },
    { geo: () => new THREE.CylinderGeometry(0.05, 0.07, 0.05, 8), pos: [0, el.y * 0.9 + 0.02, el.z] },
  ],
  "sconce-torch": (el) => [
    { geo: () => new THREE.BoxGeometry(0.055, 0.055, Math.max(0.06, el.z * 0.85)), pos: [0, el.y * 0.35, el.z * 0.42] },
    { geo: () => new THREE.CylinderGeometry(0.055, 0.08, 0.06, 8), pos: [0, el.y * 0.85, el.z] },
  ],
  "sconce-torch-clay": (el) => [
    // A legible, upright wooden haft and iron cup—not the short bracket + glowing orb used by the
    // calibration bulb. Keeping the flame at `emitterLocal` preserves point/emitter co-location.
    { geo: () => new THREE.CylinderGeometry(0.035, 0.045, 0.34, 7), pos: [0, el.y - 0.18, el.z] },
    { geo: () => new THREE.CylinderGeometry(0.065, 0.09, 0.07, 8), pos: [0, el.y - 0.035, el.z] },
  ],
  "bracket-generic": (el) => [
    { geo: () => new THREE.BoxGeometry(0.045, 0.045, Math.max(0.05, el.z * 0.85)), pos: [0, el.y * 0.4, el.z * 0.42] },
    { geo: () => new THREE.SphereGeometry(0.045, 6, 5), pos: [0, el.y * 0.9, el.z] },
  ],
  "brazier-low": (el) => [
    { geo: () => new THREE.CylinderGeometry(0.22, 0.13, 0.12, 10), pos: [0, el.y * 0.55, 0] },
    { geo: () => new THREE.CylinderGeometry(0.02, 0.02, Math.max(0.08, el.y * 0.5), 5), pos: [0.13, el.y * 0.22, 0.08] },
    { geo: () => new THREE.CylinderGeometry(0.02, 0.02, Math.max(0.08, el.y * 0.5), 5), pos: [-0.13, el.y * 0.22, 0.08] },
    { geo: () => new THREE.CylinderGeometry(0.02, 0.02, Math.max(0.08, el.y * 0.5), 5), pos: [0, el.y * 0.22, -0.15] },
  ],
  "candle-cluster": (el) => [
    { geo: () => new THREE.CylinderGeometry(0.032, 0.036, Math.max(0.1, el.y * 0.85), 7), pos: [0, el.y * 0.42, 0] },
    { geo: () => new THREE.CylinderGeometry(0.028, 0.032, Math.max(0.08, el.y * 0.62), 7), pos: [0.06, el.y * 0.30, 0.03] },
    { geo: () => new THREE.CylinderGeometry(0.028, 0.032, Math.max(0.09, el.y * 0.70), 7), pos: [-0.05, el.y * 0.34, -0.04] },
  ],
  "lantern-handled": (el) => [
    { geo: () => new THREE.CylinderGeometry(0.09, 0.09, Math.max(0.12, el.y * 0.9), 8), pos: [0, el.y * 0.5, 0] },
    { geo: () => new THREE.TorusGeometry(0.08, 0.012, 6, 12), pos: [0, el.y * 0.98, 0], rotX: Math.PI / 2 },
  ],
  // Checkpoint 3 (2026-07-25, "magic reads as a small violet bulb"): a believable arcane source —
  // a rock base with a CLUSTER of faceted shards in the canon's triangulated language. The main
  // shard is the emitter (below); these are its dark companions, so the glow reads as crystal
  // growing from stone, not a lamp.
  "crystal-faceted": (el) => [
    { geo: () => new THREE.CylinderGeometry(0.16, 0.22, Math.max(0.07, el.y * 0.3), 7), pos: [0, el.y * 0.12, 0] },
    { geo: () => new THREE.OctahedronGeometry(0.13), pos: [0.14, el.y * 0.3, 0.05], rotX: 0.35 },
    { geo: () => new THREE.OctahedronGeometry(0.09), pos: [-0.12, el.y * 0.26, -0.08], rotX: -0.5 },
  ],
  // Checkpoint 3 ("lava reads as a red point on the floor"): a molten fissure — low dark rock rim
  // around a flat emissive melt surface (the emitter, below). Floor-standing, deterministic.
  "lava-fissure": (el) => [
    { geo: () => new THREE.BoxGeometry(0.5, 0.08, 0.14), pos: [0, 0.04, 0.3], rotX: 0 },
    { geo: () => new THREE.BoxGeometry(0.44, 0.09, 0.13), pos: [0.06, 0.045, -0.3] },
    { geo: () => new THREE.BoxGeometry(0.14, 0.08, 0.42), pos: [0.32, 0.04, 0] },
    { geo: () => new THREE.BoxGeometry(0.13, 0.07, 0.4), pos: [-0.3, 0.035, 0.04] },
  ],
  "lamp-post": (el) => [
    { geo: () => new THREE.CylinderGeometry(0.03, 0.045, Math.max(0.2, el.y * 0.92), 8), pos: [0, el.y * 0.46, 0] },
  ],
};
const ITR_FIXTURE_EMITTER_GEO = {
  "sconce-iron": () => new THREE.ConeGeometry(0.04, 0.11, 6),
  "sconce-torch": () => new THREE.ConeGeometry(0.045, 0.13, 6),
  "sconce-torch-clay": () => new THREE.ConeGeometry(0.08, 0.22, 7),
  "bracket-generic": () => new THREE.SphereGeometry(0.05, 6, 5),
  "brazier-low": () => new THREE.ConeGeometry(0.09, 0.22, 7),
  "candle-cluster": () => new THREE.ConeGeometry(0.03, 0.09, 6),
  "lantern-handled": () => new THREE.SphereGeometry(0.06, 7, 6),
  "crystal-faceted": () => new THREE.OctahedronGeometry(0.3),
  "lava-fissure": () => new THREE.CylinderGeometry(0.34, 0.38, 0.05, 9),
  "lamp-post": () => new THREE.SphereGeometry(0.09, 8, 6),
};
// MeshStandard/PBR materials are out of E0's scope (WALL-VOLUMES-PRACTICALS.md Decisions: "No bloom
// mask... No MeshStandard/PBR materials"). MeshLambertMaterial is NOT a PBR material but DOES support
// `.emissive`/`.emissiveIntensity` (three.js's classic, non-physically-based emissive term) — that's
// the material this file already uses for every other body surface (walls/floor/props), so the emitter
// submesh stays in the SAME material family as its own fixture body, just with emissive lit on.
// tuned so the emitter's own pixel clears UnrealBloomPass's 0.68 linear threshold (bright.png/frame 03's
// "only the emitter glows" read) regardless of ambient darkness. Round 1 shipped at 2.4 — a live capture
// (dev/battle-gate/capture-practicals.mjs) showed the halo swallowing the smaller fixture bodies (candle/
// crystal) into a soft orb rather than a legible object with a tight hot core; dropped to 1.6 (still >=2x
// the 0.68 gate with real headroom) without touching the bloom pass itself (strength/radius/threshold stay
// out of scope, per the spec's own "no bloom mask" decision).
const ITR_FIXTURE_EMISSIVE_INTENSITY = 1.6;
let ITR_FIXTURE_BODY_MATERIAL_CACHE = null;
// E0-1 (docs/PHASE-3-WAVE-1-SPECS.md): `wantWall` (true for a fixture whose OWN light.mount ===
// "wall", regardless of whether placement later degrades to floor for lack of C4.1a slot data —
// see interiorResolveFixturePlacement) gets a CLONED, non-shared body material so its opacity can
// be tweened independently, joining its owning wall segment's occlusion-fade `fadeEntry.materials`
// (wired at the interiorBuildLights call site in setInteriorBoard, below). Every non-wall fixture
// keeps returning the ONE shared cached material — no perf regression for the common (floor-mount)
// case, which never needs independent per-fixture fading. `transparent = true` on the clone so the
// live occlusion tween (itrOcclusionClassify) can actually show fractional opacity the instant a
// fade starts, same discipline the wall-upper mesh materials already follow (see wallUpperMeshList's
// own `upperMat.transparent = true`, further below).
function interiorFixtureBodyMaterial(wantWall){
  if(!ITR_FIXTURE_BODY_MATERIAL_CACHE){
    ITR_FIXTURE_BODY_MATERIAL_CACHE = new THREE.MeshLambertMaterial({ color: "#33302a" });
  }
  if(wantWall){
    const clone = ITR_FIXTURE_BODY_MATERIAL_CACHE.clone();
    clone.transparent = true;
    return clone;
  }
  return ITR_FIXTURE_BODY_MATERIAL_CACHE;
}
function interiorFixtureEmitterMaterial(color, wantWall){
  const mat = new THREE.MeshLambertMaterial({ color: "#000000" });
  mat.emissive = new THREE.Color(color || "#ffbb66");
  mat.emissiveIntensity = ITR_FIXTURE_EMISSIVE_INTENSITY;
  mat.userData.psxExempt = true; // never PSX-shader-tweaked (dither/vertex-snap) — same exemption every self-lit marker in this file already carries
  // E0-1: a wall-mount fixture's emitter joins its owning wall segment's occlusion-fade
  // `fadeEntry.materials` (interiorBuildLights, below) — `transparent` must already be true so the
  // live tween can show fractional opacity the instant a fade starts, same reasoning
  // interiorFixtureBodyMaterial's own wall-clone branch documents. A non-wall fixture's emitter is
  // never appended to any fadeEntry, so it stays opaque (unchanged behavior).
  if(wantWall) mat.transparent = true;
  return mat;
}
// light -> {group, emitter}. `group` sits in MOUNT-LOCAL space (its own local origin IS the mount
// anchor — floor-top point or wall-slot point, positioned by the caller); `emitter` is the ONE named
// emissive submesh, positioned at exactly `light.emitterLocal` within that local frame. An unknown/
// missing fixtureId (a bare test literal, a future data gap) never throws — falls back to the
// default-bucket family for the requested mount, same defensive posture as the rest of this renderer.
function interiorBuildFixtureGroup(light){
  const wantWall = light.mount === "wall";
  const fixtureId = (light.fixtureId && ITR_FIXTURE_BODY_PARTS[light.fixtureId]) ? light.fixtureId
    : (wantWall ? "bracket-generic" : "lamp-post");
  const el = light.emitterLocal || (wantWall ? { x: 0, y: 0.05, z: 0.14 } : { x: 0, y: 0.5, z: 0 });
  const group = new THREE.Group();
  const bodyMat = interiorFixtureBodyMaterial(wantWall);
  const parts = ITR_FIXTURE_BODY_PARTS[fixtureId](el) || [];
  parts.forEach((part) => {
    const mesh = new THREE.Mesh(part.geo(), bodyMat);
    mesh.position.set(part.pos[0], part.pos[1], part.pos[2]);
    if(part.rotX) mesh.rotation.x = part.rotX;
    mesh.castShadow = true; mesh.receiveShadow = true;
    group.add(mesh);
  });
  const emitterGeoFn = ITR_FIXTURE_EMITTER_GEO[fixtureId] || ITR_FIXTURE_EMITTER_GEO["lamp-post"];
  const emitter = new THREE.Mesh(emitterGeoFn(), interiorFixtureEmitterMaterial(light.color, wantWall));
  emitter.name = "emitter";
  emitter.userData.fixtureEmitter = true;
  // LL-1 EMISSIVE-MASKED BLOOM (BLOOM_LAYER's own header comment, above): a true emitter joins
  // BLOOM_LAYER IN ADDITION TO layer 0 (three's default, left untouched — this is additive, never a
  // visibility change) so MaskedBloomPass's isolated bright-pass extraction can see it.
  // Guarded because the vm-extraction verify harnesses (verify-theater-light-props / -visible-practicals /
  // -bw3-4-light-shafts / -e0-1-fixture-fade, the whole fixture cluster) run this code against a stubbed
  // THREE whose Mesh has no `.layers` — a real THREE.Mesh always does, so this is a pure no-op in production.
  // The Clayroom torch's distant, sub-pixel cone was being upsampled by the coarse bloom mask into
  // a bright square card even though no card geometry existed. Keep the real emissive flame in the
  // beauty pass and the co-located shadow-casting PointLight, but do not feed this tiny source into
  // the masked blur. Larger fixture families retain the existing bloom punctuation.
  if(emitter.layers && fixtureId !== "sconce-torch-clay") emitter.layers.enable(BLOOM_LAYER);
  emitter.userData.bloomSuppressed = fixtureId === "sconce-torch-clay";
  emitter.position.set(el.x || 0, el.y || 0, el.z || 0);
  emitter.castShadow = false; emitter.receiveShadow = false; // a fixture's own flame/bulb never shadows itself, same discipline the old glow disc/nub kept
  group.add(emitter);
  group.userData.interiorFixture = true;
  group.userData.fixtureId = fixtureId;
  group.userData.emitterMesh = emitter; // direct-access seam (no traversal needed) — also findable via child.name === "emitter"
  // E0-1: `bodyMat` (a per-fixture clone when `wantWall`, else the shared cache — see
  // interiorFixtureBodyMaterial above) + `wantWall` ride along on the return so interiorBuildLights
  // (the only caller) can register this fixture's materials against its owning wall segment's
  // occlusion-fade entry without re-deriving anything or traversing the group.
  return { group, emitter, bodyMat, wantWall };
}
// nearest C4.1a mount slot (by XZ distance) to (x,z) — "the segment closest to the light's own (x,z)"
// per WALL-VOLUMES-PRACTICALS.md §E0. `wallMountData` is {mountSlots, wallSegments}; absent/empty
// (ITR_ROOM_SHELL off, or a room with zero wall segments) returns null — the caller's own defensive
// degrade-to-floor path.
// The board's local half-extent as seen from the light group's recentred frame — derived from the
// shell's OWN wall data (segment mids + mount-slot world positions are raw plan coordinates, the
// same frame `cx`/`cz` recenter). Fallback when a fixture has no wall data: a generous constant
// that covers the largest current fixture. Consumed by the environmental directional branch above
// to size the sun/moon shadow frustum; margin covers wall thickness + segment half-lengths.
function interiorEnvLightHalfExtent(wallMountData, cx, cz){
  let maxAbs = 0, found = false;
  const consider = (x, z) => {
    if(typeof x !== "number" || typeof z !== "number") return;
    maxAbs = Math.max(maxAbs, Math.abs(x - cx), Math.abs(z - cz));
    found = true;
  };
  ((wallMountData && wallMountData.wallSegments) || []).forEach((seg) => {
    if(seg && seg.mid) consider(seg.mid.x, seg.mid.z);
    if(seg && seg.a) consider(seg.a.x, seg.a.z);
    if(seg && seg.b) consider(seg.b.x, seg.b.z);
  });
  ((wallMountData && wallMountData.mountSlots) || []).forEach((s) => {
    if(s && s.worldPos) consider(s.worldPos.x, s.worldPos.z);
  });
  return found ? maxAbs + 3 : 12;
}
function interiorNearestWallMountSlot(wallMountData, x, z){
  const slots = wallMountData && wallMountData.mountSlots;
  if(!slots || !slots.length) return null;
  let best = null, bestD2 = Infinity;
  for(let i = 0; i < slots.length; i++){
    const s = slots[i];
    const dx = s.worldPos.x - x, dz = s.worldPos.z - z;
    const d2 = dx * dx + dz * dz;
    if(d2 < bestD2){ bestD2 = d2; best = s; }
  }
  return best;
}
// resolves a light's own fixture placement: wall-mount snaps to its nearest C4.1a slot (world position
// + inward normal, so orientation can never disagree with the wall itself); a wall-mount with no slot
// data DEGRADES to a floor mount at the light's own (x,z), logged once (WALL-VOLUMES-PRACTICALS.md
// §E0's own defensive contract — "floor fixtures work even if C4.1a mount data is absent").
function interiorResolveFixturePlacement(light, cx, cz, floorTopMap, wallMountData){
  // Checkpoint 2 (2026-07-25) — DIAGNOSTIC STUDIO FLOAT: mount "none" places the fixture at its
  // EXACT authored position (board-relative, y in world units). The physical-emitter honesty law
  // (CR-3) already distinguishes explicitly-labelled non-diegetic studio hardware from rolled
  // practicals; a calibration bulb that silently snaps to whatever wall slot happens to exist is
  // how the "opposing" pair ended up on ADJACENT walls with the readout still claiming opposition
  // (root-cause notes §2). Production rolled practicals keep the wall/floor mount contract.
  if(light.mount === "none"){
    return {
      mount: "none", ownerSegIndex: null,
      pos: { x: (light.x || 0) - cx, y: light.y != null ? light.y : 1.7, z: (light.z || 0) - cz },
      normal: null,
    };
  }
  if(light.mount === "wall"){
    const slot = interiorNearestWallMountSlot(wallMountData, light.x || 0, light.z || 0);
    if(slot){
      return {
        mount: "wall", ownerSegIndex: slot.ownerSegIndex,
        pos: { x: slot.worldPos.x - cx, y: slot.worldPos.y, z: slot.worldPos.z - cz },
        normal: slot.normal,
      };
    }
    if(typeof console !== "undefined" && console.warn){
      console.warn("[interiorBuildLights] wall-mount fixture had no mount slot data — degrading to floor:", light.fixtureId, light.roomSegNum);
    }
  }
  const floorTop = interiorFloorTopAt(floorTopMap, light.x || 0, light.z || 0);
  return { mount: "floor", ownerSegIndex: null, pos: { x: (light.x || 0) - cx, y: floorTop, z: (light.z || 0) - cz }, normal: null };
}

// data.lights -> {group, casters} — builds one THREE.PointLight + one physical FIXTURE (E0, above) per
// light entry (src/ui/theater-interior.js's interiorBuildBoard emits the plain {x,z,y,color,intensity,
// kind,roomSegNum,fixtureId,mount,emitterLocal,...} data; this is the ONE place that becomes real THREE
// objects, same "data in theater-interior.js, GL in theater-boot.js" split the rest of this render
// already keeps). Shadow-casting lights get a small shadow-map budget (INTERIOR_SHADOW_MAP_SIZE) + a
// near/far tuned to interior room scale (never the board-wide combat camera's frustum). `wallMountData`
// ({mountSlots, wallSegments}, C4.1a's own S.interiorLastRoomShell output) is OPTIONAL — a wall-mount
// fixture with no slot data degrades to floor (interiorResolveFixturePlacement, above), so floor
// practicals work even on a pre-C4.1a call site or a shell-less board.
function interiorBuildLights(lights, cx, cz, realmId, floorTopMap, pieces, isBrightRealm, wallMountData){
  const group = new THREE.Group();
  const assigned = interiorAssignShadowCasters(lights, cx, cz);
  let casters = 0;
  let glowCount = 0;
  // VP6/CL-R1: every nonsuppressed source exposes a local-state target to the shared scheduler, but
  // only a target explicitly authored `state:"flickering"` is updated. Steady is the default.
  const flickerTargets = [];
  // E0-1 (docs/PHASE-3-WAVE-1-SPECS.md): one entry per fixture that actually LANDED on a real wall
  // segment ({ownerSegIndex, materials: [bodyClone, emitterMat]}) — collected here (pure, no S.*
  // access — interiorBuildLights stays a function of its own arguments, same discipline flickerTargets
  // above already keeps) so the interiorBuildLights call site in setInteriorBoard (the one place that
  // ALSO has wallUpperMeshList/fadeEntry in scope) can append them into the SAME segment's occlusion-
  // fade entry. A fixture whose wall-mount request degraded to floor (no C4.1a slot data) never gets an
  // ownerSegIndex here, so it's simply never registered — the resolver's own defensive floor-degrade
  // stays untouched.
  const wallFixtureFadeTargets = [];
  assigned.forEach((light) => {
    // LIGHT-CLOSE unit (docs/GRAPHICS-NORTH-STAR.md task #16 / directive §4.7 "never leave a floating
    // glow disc as the source"): daylit/overcast/moonlit are the SKY's own diegetic reach (P-1's
    // ITR_BRIGHT_REALM_FILL hemisphere/fill, applied by setInteriorBoard) — a torch/lamp practical in
    // THAT room reads as a second, uncredited light source (and blows out — Adam's "nuclear bomb").
    // `isBrightRealm` is the CALLER's own classification (setInteriorBoard, off ITR_BRIGHT_PROFILES) —
    // interiorBuildLights stays a pure function of its arguments, same discipline as `realmId`/`pieces`.
    // `light.forceVisiblePractical` is a per-light escape hatch for a future realm declaring a
    // genuinely diegetic OUTDOOR local source (a campfire) even under a bright profile; no light sets
    // it today, so every bright-profile light suppresses uniformly.
    const suppressPractical = !!isBrightRealm && practicalsCtxBrightSuppressPracticals() && !light.forceVisiblePractical; // split B5: mutable root `let` (window.Theater.setBrightPracticalsSuppressed flips it live) — read through the ctx accessor
    const resolvedIntensity = (light.renderIntensity != null
      ? light.renderIntensity
      : (light.intensity != null ? light.intensity : 1.2) * LIGHT_TUNABLES.lightRenderGain
    ) * (suppressPractical ? ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE : 1);
    // CL-R1: a shared light recipe is an intentional, reviewed physical range. Generic/generated
    // interior lights still receive the small-pool safety cap, while recipe lights can opt into
    // their declared reach without changing the intensity or inverse-square falloff at the source.
    const declaredDistance = light.distance != null ? light.distance : 12;
    const resolvedDistance = light.authoredRange
      ? declaredDistance
      : Math.min(declaredDistance, ITR_LIGHT_DISTANCE_CAP);

    // CL-R1 mode separation: environmental/celestial sources do not acquire a fake lamp housing
    // merely because the production board carries a light record. Only a source whose recipe says a
    // visible emitter is required goes through the fixture branch below. The direct branch still
    // uses real THREE lights in this same production group; it simply has no counterfeit prop.
    if(light.visibleEmitterRequired === false){
      const localX = (light.x || 0) - cx;
      const localY = light.y != null ? light.y : 3;
      const localZ = (light.z || 0) - cz;
      let environmentalLight;
      if(light.lightType === "environment"){
        // The scene already owns one shared HemisphereLight. A recipe-level environment source
        // contributes colour/intensity without constructing a second hemisphere rig that could
        // drift between tabletop and interior channels.
        environmentalLight = new THREE.AmbientLight(light.color || "#ffffff", resolvedIntensity);
        environmentalLight.position.set(localX, localY, localZ);
      } else if(light.lightType === "directional"){
        environmentalLight = new THREE.DirectionalLight(light.color || "#ffffff", resolvedIntensity);
        // Visual-correction fix (Adam, 2026-07-25: "there's just one chunk of a rectangle showing
        // on the stairs but none of the proper cast shadows"): THREE's default directional shadow
        // camera is a 10x10-unit ortho box, so in a 15x15-cell room the sun/moon shadow map covered
        // only a corner and every cast shadow clipped to that chunk. Derive the room's local
        // half-extent from the shell's own wall data and size BOTH the light distance and the
        // shadow frustum from it, so everything the room contains casts a complete shadow.
        const envHalfExtent = interiorEnvLightHalfExtent(wallMountData, cx, cz);
        const envLightDistance = Math.max(10, envHalfExtent * 2.5);
        // Adam's ruling (2026-07-25): "the shadows should fall relative to the actual position of
        // the sun since its position is mapped to the actual clock." When a celestial light record
        // carries its world clock, the shared celestial arc (celestialArcFor — the ONE clock->sun/
        // moon direction owner, already driving the tabletop channel) supplies direction, arc
        // colour, and the elevation intensity curve. The authored azimuth/elevation are only the
        // no-clock fallback (a fixture or harness snapshot with no time threaded).
        const celestialClock = (light.clockMin != null && light.recipeId
          && CELESTIAL_PROFILE_SET[light.recipeId]) ? light.clockMin : null;
        if(celestialClock != null){
          const arc = celestialArcFor(light.recipeId, celestialClock);
          environmentalLight.position.set(
            arc.dir.x * envLightDistance,
            Math.max(CELESTIAL_MIN_KEY_HEIGHT, arc.dir.y * envLightDistance),
            arc.dir.z * envLightDistance
          );
          environmentalLight.color.setHex(arc.color); // under the clock, the arc owns colour too (dawn->zenith lerp)
          environmentalLight.intensity = resolvedIntensity * arc.intensityScale;
          environmentalLight.userData.celestial = {
            clockMin: celestialClock,
            derivedDir: { x: +arc.dir.x.toFixed(4), y: +arc.dir.y.toFixed(4), z: +arc.dir.z.toFixed(4) },
            intensityScale: +arc.intensityScale.toFixed(4)
          };
        } else {
          const azimuth = THREE.MathUtils.degToRad(light.azimuthDeg != null ? light.azimuthDeg : 0);
          const elevation = THREE.MathUtils.degToRad(light.elevationDeg != null ? light.elevationDeg : 45);
          environmentalLight.position.set(
            Math.cos(elevation) * Math.cos(azimuth) * envLightDistance,
            Math.sin(elevation) * envLightDistance,
            Math.cos(elevation) * Math.sin(azimuth) * envLightDistance
          );
        }
        environmentalLight.target.position.set(0, 0, 0);
        group.add(environmentalLight.target);
        if(environmentalLight.shadow && environmentalLight.shadow.camera){
          const sc = environmentalLight.shadow.camera;
          const frustumHalf = envHalfExtent * 1.15 + 1;
          sc.left = -frustumHalf; sc.right = frustumHalf;
          sc.top = frustumHalf; sc.bottom = -frustumHalf;
          sc.near = 0.5; sc.far = envLightDistance + envHalfExtent * 3;
          sc.updateProjectionMatrix();
        }
      } else {
        environmentalLight = new THREE.PointLight(
          light.color || "#ffffff",
          resolvedIntensity,
          resolvedDistance,
          light.decay != null ? light.decay : 2
        );
        environmentalLight.position.set(localX, localY, localZ);
      }
      if(light.castShadow && environmentalLight.shadow){
        environmentalLight.castShadow = true;
        const environmentalMapSize = [256, 512, 1024, 2048].indexOf(light.shadowMapSize) >= 0
          ? light.shadowMapSize : INTERIOR_SHADOW_MAP_SIZE;
        environmentalLight.shadow.mapSize.set(environmentalMapSize, environmentalMapSize);
        environmentalLight.shadow.bias = light.shadowBias != null ? light.shadowBias : -0.002;
        environmentalLight.shadow.normalBias = light.shadowNormalBias != null ? light.shadowNormalBias : 0;
        casters++;
      }
      environmentalLight.userData = environmentalLight.userData || {};
      environmentalLight.userData.lightId = String(light.id || light.sourceRef || "environment-light");
      environmentalLight.userData.recipeMode = light.recipeMode || "production-environment";
      group.add(environmentalLight);
      // Checkpoint 2 (2026-07-25) — READOUT TRUTH: environmental sources register in the SAME
      // live-light registry the practicals use, so the Lights readout and the lighting proof can
      // describe the sun/moon/ambient-shaping lights that actually reach the renderer. Before
      // this, the registry printed `lights: []` under full daylight (root-cause notes §3) — the
      // panel was structurally unable to tell the truth about five of seven recipes. Steady,
      // markerless rows; the snapshot reader is already null-tolerant on marker fields.
      flickerTargets.push({
        id: String(light.id || light.sourceRef || ("environment-light-" + flickerTargets.length)),
        sourceRef: light.sourceRef || String(light.id || "environment-light"),
        state: "steady",
        seed: String(light.id || "environment-light"),
        cadenceMs: 480, intervalJitter: 0, directionAmplitude: 0,
        sampleIndex: 0, normalizedSample: 1,
        directionSample: { x: 0, y: 0, z: 0 },
        pl: environmentalLight, marker: null, cone: null,
        emissiveFlicker: false,
        baseIntensity: environmentalLight.intensity,
        baseEmissiveIntensity: 0,
        baseOpacity: 1,
        basePointPosition: {
          x: environmentalLight.position.x,
          y: environmentalLight.position.y,
          z: environmentalLight.position.z
        },
        baseMarkerPosition: null, baseMarkerRotation: null,
        amplitude: 0
      });
      return;
    }

    // E0 — resolve WHERE the fixture physically stands: a wall mount snaps to its nearest C4.1a mount
    // slot (world position + inward normal, so it can never disagree with the wall itself); a floor
    // mount stands on the floor-top at the light's own (x,z). A wall request with no slot data
    // degrades to floor (logged once inside the resolver).
    const placement = interiorResolveFixturePlacement(light, cx, cz, floorTopMap, wallMountData);
    const fixture = interiorBuildFixtureGroup(light);
    fixture.group.position.set(placement.pos.x, placement.pos.y, placement.pos.z);
    if(placement.mount === "wall" && placement.normal){
      fixture.group.rotation.y = Math.atan2(placement.normal.x, placement.normal.z);
    }
    fixture.group.userData.mount = placement.mount;
    fixture.group.userData.ownerSegIndex = placement.ownerSegIndex;
    // render-time resolution written back onto the render layer's OWN light copy (interiorAssignShadow
    // Casters already returns a shallow per-light copy, never the original theater-interior.js record —
    // itrRoomLights' own `ownerSegIndex: null` doc comment names this exact seam) — a harness can read
    // either this field or fixture.group.userData.ownerSegIndex.
    light.ownerSegIndex = placement.ownerSegIndex;

    // E0-1: a fixture that actually LANDED on a real wall segment (placement.mount === "wall" AND a
    // real ownerSegIndex — the degrade-to-floor path above sets ownerSegIndex null, which this guard
    // excludes) registers its own [bodyClone, emitterMat] pair for the call site to append into that
    // segment's occlusion-fade `fadeEntry.materials`. `fixture.bodyMat` is already the per-fixture
    // clone (not the shared cache) whenever `fixture.wantWall` is true, which it always is here since
    // wantWall only ever reads light.mount — the same field that just resolved to a real wall segment.
    if(placement.mount === "wall" && placement.ownerSegIndex != null){
      wallFixtureFadeTargets.push({
        ownerSegIndex: placement.ownerSegIndex,
        materials: [fixture.bodyMat, fixture.emitter.material]
      });
    }

    // the PointLight mounts as a CHILD of the fixture group at the group-LOCAL emitterLocal — world
    // position = group transform × emitterLocal (WALL-VOLUMES-PRACTICALS.md §E0), so it can never sit
    // anywhere but exactly where the fixture's own visible emitter submesh is.
    const el = light.emitterLocal || { x: 0, y: 0, z: 0 };
    const pl = light.lightType === "spot"
      ? new THREE.SpotLight(
        light.color || "#ffbb66",
        resolvedIntensity,
        resolvedDistance,
        THREE.MathUtils.degToRad(light.spot && light.spot.coneDeg != null ? light.spot.coneDeg : 45),
        light.spot && light.spot.penumbra != null ? light.spot.penumbra : 0,
        light.decay != null ? light.decay : 2
      )
      : new THREE.PointLight(
      light.color || "#ffbb66",
      // BW2-4 item 1: render-side gain (see ITR_LIGHT_RENDER_GAIN) — the DATA intensity is the relative
      // value; this is the absolute decay-2 pool brightness. Preserves the fill<=60%-of-key ratio (both
      // key and fill are gained equally). LIGHT-CLOSE: a suppressed practical scales toward
      // ITR_BRIGHT_PRACTICAL_INTENSITY_SCALE (0 by default) — the sky fill carries the room instead.
      resolvedIntensity,
      // BW2-4b item 1 — generic lights retain the small-pool cap. A reviewed recipe may opt into its
      // authored physical reach through resolvedDistance (the torch does; other profiles do not).
      resolvedDistance,
      light.decay != null ? light.decay : 2
    );
    pl.position.set(el.x || 0, el.y || 0, el.z || 0);
    if(pl.isSpotLight){
      pl.target.position.set(el.x || 0, (el.y || 0) - 1, el.z || 0);
      fixture.group.add(pl.target);
    }
    if(light.castShadow && !suppressPractical){
      pl.castShadow = true;
      const authoredMapSize = [256, 512, 1024, 2048].indexOf(light.shadowMapSize) >= 0
        ? light.shadowMapSize : INTERIOR_SHADOW_MAP_SIZE;
      pl.shadow.mapSize.set(authoredMapSize, authoredMapSize);
      pl.shadow.camera.near = 0.1;
      pl.shadow.camera.far = light.distance != null ? light.distance : 12;
      pl.shadow.bias = light.shadowBias != null ? light.shadowBias : -0.002;
      pl.shadow.normalBias = light.shadowNormalBias != null ? light.shadowNormalBias : 0;
      casters++;
    }
    fixture.group.add(pl);

    // §E0 Decisions — "keep the fixture in bright realms, drop only the glow": the fixture BODY always
    // mounts (a suppressed practical still reads as a real, unlit object); only the emitter's own
    // emissive brightness suppresses.
    fixture.emitter.material.emissiveIntensity = suppressPractical ? 0 : ITR_FIXTURE_EMISSIVE_INTENSITY;
    group.add(fixture.group);

    // DIAGNOSTIC-ONLY glow disc (ITR_GLOW_DISC_DIAGNOSTIC, default false — see that flag's own header
    // note) — the production path never mounts it; glowCount stays 0. Rides the SAME fixture-group
    // transform (added as its child at the emitter-local point) so it never needs a second world-space
    // position derivation.
    if(practicalsCtxGlowDiscDiagnostic() && !suppressPractical){ // split B5: mutable root `let` — read through the ctx accessor (window.Theater.setGlowDiscDiagnosticForTest flips it live)
      const glow = interiorBuildGlowDisc(light);
      glow.group.position.set(el.x || 0, el.y || 0, el.z || 0);
      fixture.group.add(glow.group);
      glowCount++;
    }

    // BW3-4 — LIGHT SHAFTS (unrelated to E0, left wired but still gated OFF by default —
    // ITR_LIGHT_CONE_ENABLED): bridges from the SAME apex the fixture's own emitter now sits at (world
    // position, since the cone is added to the top-level `group`, not the fixture group) down to the
    // room's floor top — never a second/parallel floor formula.
    const emitterWorldPos = { x: placement.pos.x + (el.x || 0), y: placement.pos.y + (el.y || 0), z: placement.pos.z + (el.z || 0) };
    const floorTopAtLight = interiorFloorTopAt(floorTopMap, light.x || 0, light.z || 0);
    const coneHeight = emitterWorldPos.y - floorTopAtLight;
    const cone = (practicalsCtxLightConeEnabled() && !suppressPractical) ? interiorBuildLightCone(light, coneHeight) : null; // split B5: mutable root `let` — read through the ctx accessor (window.Theater.setLightConeEnabled flips it live)
    if(cone){
      cone.group.position.set(emitterWorldPos.x, emitterWorldPos.y, emitterWorldPos.z);
      group.add(cone.group);
    }

    // LIGHT-CLOSE: a suppressed practical never joins the flicker channel (nothing to flicker — the
    // emitter's gone dark and lightFlickerStep's own floor would otherwise re-introduce a
    // faint-but-nonzero torch flutter on a light that's supposed to read as OFF).
    if(!suppressPractical){
      const fallbackConeOpacity = ITR_LIGHT_CONE_OPACITY[light.kind] != null ? ITR_LIGHT_CONE_OPACITY[light.kind] : ITR_LIGHT_CONE_OPACITY.torch;
      const localState = light.state === "flickering" ? "flickering" : "steady";
      const localFlicker = light.flicker || {};
      const lightId = String(light.id || light.sourceRef || ("interior-light-" + flickerTargets.length));
      fixture.group.userData = fixture.group.userData || {};
      pl.userData = pl.userData || {};
      fixture.emitter.userData = fixture.emitter.userData || {};
      fixture.group.userData.lightId = lightId;
      fixture.group.userData.sceneObjectId = lightId;
      fixture.group.userData.lightState = localState;
      pl.userData.lightId = lightId;
      pl.userData.lightState = localState;
      pl.userData.flickerSample = 1;
      fixture.emitter.userData.lightId = lightId;
      fixture.emitter.userData.lightState = localState;
      fixture.emitter.userData.flickerSample = 1;
      flickerTargets.push({
        id: lightId,
        sourceRef: light.sourceRef || lightId,
        state: localState,
        seed: String(localFlicker.seed || light.sourceRef || lightId),
        cadenceMs: Math.max(120, Number(localFlicker.cadenceMs) || 480),
        intervalJitter: Math.max(0, Math.min(0.9,
          Number(localFlicker.intervalJitter) || 0
        )),
        directionAmplitude: Math.max(0, Math.min(0.08,
          Number(localFlicker.directionAmplitude) || 0
        )),
        sampleIndex: 0,
        normalizedSample: 1,
        directionSample: { x: 0, y: 0, z: 0 },
        pl, marker: fixture.emitter, cone: cone ? cone.mesh : null,
        emissiveFlicker: true, // E0 — pulse the emitter's OWN emissiveIntensity, not a disc's opacity (see lightFlickerStep)
        baseIntensity: pl.intensity,
        baseEmissiveIntensity: ITR_FIXTURE_EMISSIVE_INTENSITY,
        baseOpacity: fixture.emitter.material.opacity != null ? fixture.emitter.material.opacity : 1,
        baseConeOpacity: (cone && cone.mesh.material) ? cone.mesh.material.opacity : fallbackConeOpacity,
        basePointPosition: { x: pl.position.x, y: pl.position.y, z: pl.position.z },
        baseMarkerPosition: {
          x: fixture.emitter.position.x,
          y: fixture.emitter.position.y,
          z: fixture.emitter.position.z
        },
        baseMarkerRotation: {
          x: fixture.emitter.rotation.x,
          y: fixture.emitter.rotation.y,
          z: fixture.emitter.rotation.z
        },
        amplitude: Math.max(0, Math.min(0.45,
          localFlicker.amplitude != null ? Number(localFlicker.amplitude) : INTERIOR_LIGHT_FLICKER_AMPLITUDE
        ))
      });
    }
  });
  return { group, casters, flickerTargets, glowCount, wallFixtureFadeTargets };
}

export {
  interiorBuildLights, interiorBuildFixtureGroup, interiorBuildGlowDisc, interiorBuildLightCard,
  interiorBuildLightEmitterNub, interiorBuildLightCone, interiorAssignShadowCasters,
  ITR_LIGHT_DISTANCE_CAP, INTERIOR_SHADOW_CASTER_CAP, INTERIOR_SHADOW_MAP_SIZE
};
