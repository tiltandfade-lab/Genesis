/* GENESIS MODULE — src/ui/theater-boot.js — BATTLE-THEATER T1 (docs/BATTLE-THEATER.md §2/§3/§7).
   THE ONE ES-MODULE BOUNDARY FILE in Genesis. Everything else in this app is a classic <script>
   sharing global scope (CLAUDE.md: "ES-module migration is deferred (rides in with the eventual
   graphics engine)") — this file is that one sealed exception, loaded via
   `<script type="module" src="src/ui/theater-boot.js">` + an importmap resolving the bare "three"
   specifier to the vendored `vendor/three/three.module.js` (BATTLE-THEATER.md §2: "Classic scripts
   keep calling plain globals; module scope stays sealed inside the boot file"). It exposes exactly
   one classic-script-reachable surface: `window.Theater`.

   T1 scope (per the orchestrator's scope note on this unit): board render (tile columns, void
   background, orthographic camera + 90°-step rotation, flat Lambert materials, blob-shadow quads)
   + composed-cuboid FALLBACK figures for all five archetypes (biped/quadruped/flyer/serpent/swarm) —
   no glTF pack loading (T2), no verb/animation library beyond mount/setBoard/setUnits/rotate (T3),
   no terrain_change mutation replay (T4). Render-on-demand only: nothing repaints unless setBoard/
   setUnits/rotate/mount is called (SPEED-DOCTRINE hygiene, §2).

   window.Theater = {
     mount(el)   -> bool. Creates the renderer/scene/camera inside `el`. Returns false (clean degrade,
                    no throw) if WebGL is unavailable or `el` is falsy — callers must treat a false
                    return as "the theater isn't here," never as an error to surface.
     setBoard(d) -> void. `d` is a theaterBoardFrom(...)-shaped {tiles,props,grid}. Rebuilds the tile
                    mesh + prop columns from scratch (T1 has no incremental diffing — boards are cheap,
                    a whole fight's tile count tops out at 12x9=108 tiles).
     setUnits(u) -> void. `u` is a theaterUnitsFrom(...)-shaped {units:[...]}. Rebuilds unit figures
                    (fallback composed-cuboids only in T1) + their blob shadows.
     rotate()    -> void. Steps the camera 90° around the board's vertical axis (BATTLE-THEATER §1
                    rule 4: "rotatable in 90° steps only").
     retire()    -> void. Disposes geometries/materials/renderer + detaches the canvas. Safe to call
                    on an unmounted instance (no-op).
   }

   Every method is null-safe pre-mount (calling setBoard/setUnits/rotate before a successful mount()
   is a no-op, not a throw) so a caller can wire these up before the mount gate resolves. */
import * as THREE from "three";

const VOID_BG = 0x0a0908;
const CAM_ELEV_DEG = 35;
const CAM_DIST = 26;
const TILE_SIZE = 1;          // world units per abstract tile (theater-data's x/z are already tile-indexed)
const TILE_GAP = 0.04;        // thin void seam between tile columns (reads as grid without a wireframe)
const SHADOW_OPACITY = 0.35;

const ARCHETYPE_BUILDERS = {
  biped: buildBiped,
  quadruped: buildQuadruped,
  flyer: buildFlyer,
  serpent: buildSerpent,
  swarm: buildSwarm
};

/* ============================================================================
   Fallback composed-cuboid figures (BATTLE-THEATER §3: "3-8 boxes each"). Deterministic — every
   builder is a pure function of a seed number (from theaterWithinZoneOffset's hash, so a given unit
   id always composes the same figure), no Math.random. Colors are flat per-kind tints (pc/ally/foe
   distinguished by the caller via a group-level material tint, not baked into the geometry here).
   ============================================================================ */
function seededJitter(seed, i, spread){
  // tiny deterministic pseudo-jitter so repeated boxes in one figure don't look copy-pasted identical;
  // NOT a security/statistical RNG, just a cheap hash -> [-spread, spread] mapper.
  const h = Math.abs(Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453);
  return ((h - Math.floor(h)) * 2 - 1) * spread;
}

function addBox(group, w, h, d, x, y, z, color){
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function buildBiped(seed, tint){
  const g = new THREE.Group();
  addBox(g, 0.34, 0.5, 0.24, 0, 0.62, 0, tint);               // torso
  addBox(g, 0.24, 0.24, 0.24, 0, 1.0, 0, tint);                // head
  addBox(g, 0.12, 0.46, 0.12, -0.13, 0.23, 0, tint);           // left leg
  addBox(g, 0.12, 0.46, 0.12, 0.13, 0.23, 0, tint);            // right leg
  addBox(g, 0.1, 0.36, 0.1, -0.24, 0.55, 0, tint);             // left arm
  addBox(g, 0.1, 0.36, 0.1, 0.24, 0.55, 0, tint);              // right arm
  return g;                                                     // 6 boxes
}

function buildQuadruped(seed, tint){
  const g = new THREE.Group();
  addBox(g, 0.7, 0.32, 0.34, 0, 0.4, 0, tint);                 // body
  addBox(g, 0.22, 0.24, 0.24, 0.42, 0.5, 0, tint);             // head
  const legY = 0.16, legXs = [-0.28, 0.28], legZs = [-0.13, 0.13];
  legXs.forEach(lx => legZs.forEach(lz => addBox(g, 0.1, 0.32, 0.1, lx, legY, lz, tint))); // 4 legs
  return g;                                                     // 6 boxes
}

function buildFlyer(seed, tint){
  const g = new THREE.Group();
  addBox(g, 0.3, 0.26, 0.3, 0, 0.7, 0, tint);                  // body
  addBox(g, 0.18, 0.18, 0.18, 0, 0.95, 0.14, tint);            // head
  addBox(g, 0.5, 0.05, 0.22, -0.36, 0.74, 0, tint);            // left wing
  addBox(g, 0.5, 0.05, 0.22, 0.36, 0.74, 0, tint);             // right wing
  addBox(g, 0.08, 0.3, 0.08, 0, 0.35, -0.12, tint);            // tail/legs stub
  return g;                                                     // 5 boxes
}

function buildSerpent(seed, tint){
  const g = new THREE.Group();
  const segs = 6;
  for(let i = 0; i < segs; i++){
    const t = i / (segs - 1);
    const w = 0.26 - t * 0.14;
    addBox(g, w, w, 0.3, 0, 0.14 + w / 2, -0.75 + i * 0.3 + seededJitter(seed, i, 0.02), tint);
  }
  return g;                                                     // 6 boxes
}

function buildSwarm(seed, tint){
  const g = new THREE.Group();
  const n = 8;
  for(let i = 0; i < n; i++){
    const ang = (i / n) * Math.PI * 2;
    const r = 0.28 + seededJitter(seed, i, 0.06);
    const x = Math.cos(ang) * r, z = Math.sin(ang) * r;
    const s = 0.09 + Math.abs(seededJitter(seed, i + 50, 0.03));
    addBox(g, s, s, s, x, 0.16 + Math.abs(seededJitter(seed, i + 100, 0.1)), z, tint);
  }
  return g;                                                     // 8 boxes
}

function figureFor(archetype, seed, tint){
  const build = ARCHETYPE_BUILDERS[archetype] || ARCHETYPE_BUILDERS.biped;
  return build(seed, tint);
}

function unitTint(kind){
  if(kind === "pc") return 0xc9a24b;      // gold ring lineage — the PC's distinct silhouette (§3)
  if(kind === "ally") return 0x6fa8c9;
  return 0x9c5040;                        // foe
}

function hashSeed(id){
  let h = 0;
  const s = String(id || "");
  for(let i = 0; i < s.length; i++){ h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h) % 1000;
}

/* ============================================================================
   The Theater instance. One live instance per mount() call; retire() tears it fully down so a
   fresh mount() can start clean (the caller owns the mount/retire lifecycle, e.g. across panel
   opens/closes — this file never assumes it's mounted exactly once per page load).
   ============================================================================ */
function createTheaterState(){
  return {
    mounted: false, el: null, renderer: null, scene: null, camera: null,
    tileGroup: null, propGroup: null, unitGroup: null, shadowGroup: null,
    rotationStep: 0, dirty: false, raf: null, resizeHandler: null
  };
}

let S = createTheaterState();

function supportsWebGL(){
  try{
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  }catch(e){ return false; }
}

function markDirty(){
  S.dirty = true;
  scheduleRender();
}

function scheduleRender(){
  if(!S.mounted || S.raf) return;
  S.raf = requestAnimationFrame(() => {
    S.raf = null;
    if(S.dirty && S.renderer && S.scene && S.camera){
      S.renderer.render(S.scene, S.camera);
      S.dirty = false;
    }
  });
}

function placeCamera(){
  if(!S.camera) return;
  const rad = (CAM_ELEV_DEG * Math.PI) / 180;
  const yaw = (S.rotationStep * 90 * Math.PI) / 180;
  const horiz = Math.cos(rad) * CAM_DIST;
  const y = Math.sin(rad) * CAM_DIST;
  const x = Math.sin(yaw) * horiz;
  const z = Math.cos(yaw) * horiz;
  S.camera.position.set(x, y, z);
  S.camera.lookAt(S.boardCenter || new THREE.Vector3(0, 0, 0));
  S.camera.updateProjectionMatrix();
}

function clearGroup(group){
  if(!group) return;
  while(group.children.length){
    const child = group.children.pop();
    if(child.geometry) child.geometry.dispose();
    if(child.material){
      if(Array.isArray(child.material)) child.material.forEach(m => m.dispose());
      else child.material.dispose();
    }
  }
}

function mount(el){
  if(!el || !supportsWebGL()) return false;
  retire(); // idempotent: a re-mount tears down any prior instance first
  S = createTheaterState();

  const width = el.clientWidth || 480;
  const height = el.clientHeight || Math.round(width * (9 / 16));

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setClearColor(VOID_BG, 1);
  renderer.shadowMap.enabled = false; // §2: "no shadow maps" — blob quads only
  el.innerHTML = "";
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(VOID_BG);

  const aspect = width / Math.max(1, height);
  const viewSize = 10;
  const camera = new THREE.OrthographicCamera(
    -viewSize * aspect, viewSize * aspect, viewSize, -viewSize, 0.1, 100
  );

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  const key = new THREE.DirectionalLight(0xffffff, 0.55);
  key.position.set(4, 10, 6);
  scene.add(ambient, key);

  const tileGroup = new THREE.Group();
  const propGroup = new THREE.Group();
  const unitGroup = new THREE.Group();
  const shadowGroup = new THREE.Group();
  scene.add(tileGroup, propGroup, shadowGroup, unitGroup);

  S.mounted = true;
  S.el = el;
  S.renderer = renderer;
  S.scene = scene;
  S.camera = camera;
  S.tileGroup = tileGroup;
  S.propGroup = propGroup;
  S.unitGroup = unitGroup;
  S.shadowGroup = shadowGroup;
  S.rotationStep = 0;
  S.boardCenter = new THREE.Vector3(0, 0, 0);

  placeCamera();

  S.resizeHandler = () => {
    if(!S.mounted || !S.el || !S.renderer || !S.camera) return;
    const w = S.el.clientWidth || width;
    const h = S.el.clientHeight || height;
    const a = w / Math.max(1, h);
    S.camera.left = -viewSize * a;
    S.camera.right = viewSize * a;
    S.camera.top = viewSize;
    S.camera.bottom = -viewSize;
    S.camera.updateProjectionMatrix();
    S.renderer.setSize(w, h);
    markDirty();
  };
  window.addEventListener("resize", S.resizeHandler);

  markDirty();
  return true;
}

function setBoard(data){
  if(!S.mounted || !data) return;
  clearGroup(S.tileGroup);
  clearGroup(S.propGroup);

  const tiles = data.tiles || [];
  let minX = 0, maxX = 0, minZ = 0, maxZ = 0;
  tiles.forEach(t => {
    minX = Math.min(minX, t.x); maxX = Math.max(maxX, t.x);
    minZ = Math.min(minZ, t.z); maxZ = Math.max(maxZ, t.z);
  });
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  S.boardCenter = new THREE.Vector3(cx, 0, cz);
  S.boardOrigin = { cx, cz };

  const topColorCache = {};
  const sideColorCache = {};
  const colorFor = (tint, factor, cache) => {
    const key = tint + ":" + factor;
    if(!cache[key]){
      const c = new THREE.Color(tint);
      c.multiplyScalar(factor);
      cache[key] = c;
    }
    return cache[key];
  };

  tiles.forEach(t => {
    const h = Math.max(0.15, 0.5 + (t.h || 0));
    const geo = new THREE.BoxGeometry(TILE_SIZE - TILE_GAP, h, TILE_SIZE - TILE_GAP);
    // §1 rule 2: top != side — strongly contrasted flat colors on the same column. BoxGeometry's
    // material groups are [+x,-x,+y,-y,+z,-z]; index 2 is +y (the top face).
    const topColor = colorFor(t.tint || "#4a5a3c", 1.35, topColorCache);
    const sideColor = colorFor(t.tint || "#4a5a3c", 0.6, sideColorCache);
    const materials = [
      new THREE.MeshLambertMaterial({ color: sideColor }),
      new THREE.MeshLambertMaterial({ color: sideColor }),
      new THREE.MeshLambertMaterial({ color: topColor }),
      new THREE.MeshLambertMaterial({ color: sideColor }),
      new THREE.MeshLambertMaterial({ color: sideColor }),
      new THREE.MeshLambertMaterial({ color: sideColor })
    ];
    const mesh = new THREE.Mesh(geo, materials);
    mesh.position.set(t.x - cx, h / 2 - 0.5, t.z - cz);
    S.tileGroup.add(mesh);
  });

  (data.props || []).forEach(p => {
    const geo = new THREE.BoxGeometry(0.5, 0.9, 0.5);
    const mat = new THREE.MeshLambertMaterial({ color: 0x6b5638 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(p.x - cx, 0.45, p.z - cz);
    S.propGroup.add(mesh);
  });

  placeCamera();
  markDirty();
}

function setUnits(data){
  if(!S.mounted || !data) return;
  clearGroup(S.unitGroup);
  clearGroup(S.shadowGroup);

  const cx = (S.boardOrigin && S.boardOrigin.cx) || 0;
  const cz = (S.boardOrigin && S.boardOrigin.cz) || 0;
  const shadowGeo = new THREE.CircleGeometry(0.3, 12);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000, transparent: true, opacity: SHADOW_OPACITY, depthWrite: false
  });

  (data.units || []).forEach(u => {
    const seed = hashSeed(u.id);
    const tint = unitTint(u.kind);
    const figure = figureFor(u.archetype, seed, tint);
    const x = u.x - cx, z = u.z - cz;
    figure.position.set(x, 0, z);
    if(u.down){
      figure.rotation.z = Math.PI / 2;
      figure.position.y += 0.12;
    }
    if(u.fled) figure.visible = false;
    S.unitGroup.add(figure);

    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, -0.49, z);
    if(u.fled) shadow.visible = false;
    S.shadowGroup.add(shadow);
  });

  markDirty();
}

function rotate(){
  if(!S.mounted) return;
  S.rotationStep = (S.rotationStep + 1) % 4;
  placeCamera();
  markDirty();
}

function retire(){
  if(S.resizeHandler) window.removeEventListener("resize", S.resizeHandler);
  if(S.raf) cancelAnimationFrame(S.raf);
  clearGroup(S.tileGroup);
  clearGroup(S.propGroup);
  clearGroup(S.unitGroup);
  clearGroup(S.shadowGroup);
  if(S.renderer){
    S.renderer.dispose();
    if(S.renderer.domElement && S.renderer.domElement.parentNode){
      S.renderer.domElement.parentNode.removeChild(S.renderer.domElement);
    }
  }
  S = createTheaterState();
}

window.Theater = { mount, setBoard, setUnits, rotate, retire };
