/* dev/door-workbench/clay-room-boot.page.js — the KGR-8 clay proving room, booted INSIDE the
   engine page for the door workbench. This is capture-kgr8-clay-room.mjs's page-context code
   (bootToInSession / waitForTheater / clayPlan / kitRecipe / prepBoard / mountBoard /
   mountKitModules / clayPass / zoom-out framing) transcribed to run in the page realm the
   workbench iframe hosts — the SAME engine path the rig drives: real interiorBuildBoard, real
   TheaterDonor.loadDonorPiece admission, real production camera (frozen at pitch 28 / yaw 45 by
   CAM_ELEV_DEG + rotationStep-0), the fixture-side parapet-cut mirror, and the clay pass.
   The leaf fit itself is the shared window.kgr8FitLeafToAperture (kgr8-leaf-fit.page.js — the
   file the rig evals too), so what Adam positions here is EXACTLY what the rig reproduces.
   Loaded as a classic script into the genesis.html iframe by workbench.js; exposes
   window.KGR8WB = { bootAll, fitLeaf, cameraDolly, cameraFull, renderFrame, state }. */
(function () {
  "use strict";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const SPATIAL_CELL = { VOID: 0, FLOOR: 1, WALL: 2, DOOR: 3, WATER: 4 };
  const S = { phase: "idle", board: null, fx: null, fullCam: null, frozen: false };

  /* ── clayPlan / kitRecipe — verbatim from the rig (single 1-cell aperture, corner "post") ── */
  function clayPlan() {
    const w = 7, d = 7;
    const cells = new Array(w * d).fill(SPATIAL_CELL.VOID);
    for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) {
      if (x >= 1 && x <= 5 && y >= 1 && y <= 5) cells[y * w + x] = SPATIAL_CELL.FLOOR;
      else cells[y * w + x] = SPATIAL_CELL.WALL;
    }
    const doorCells = [{ x: 3, y: 0 }];
    doorCells.forEach((c) => { cells[c.y * w + c.x] = SPATIAL_CELL.DOOR; });
    const room = { segNum: 1, x: 1, y: 1, w: 5, d: 5, role: "start", scaleDomain: 1.0, shape: "rect" };
    return { w, d, cells, room, doorCell: doorCells[0], doorCells };
  }
  function kitRecipe() {
    const WALL = { pack: "kenney-modular-dungeon-kit", slug: "template-wall", nativeHeight: 2.075 };
    const HALF = { pack: "kenney-modular-dungeon-kit", slug: "template-wall-half", nativeHeight: 2.075 };
    const CORNER_QUARTER = { pack: "kenney-modular-dungeon-kit", slug: "template-wall-corner", nativeHeight: 2.025 };
    const FLOOR = { pack: "kenney-modular-dungeon-kit", slug: "template-floor", nativeHeight: null };
    const R0 = 0, R90 = Math.PI / 2, R180 = Math.PI, R270 = -Math.PI / 2;
    const modules = [];
    const add = (m, x, z, rotY, role) => modules.push({ pack: m.pack, slug: m.slug, nativeHeight: m.nativeHeight, x, z, rotY, role });
    {
      const centers = [1.5, 3.5, 4.5];
      centers.forEach((bx, ix) => centers.forEach((bz, iz) => {
        const eps = (ix === 2 ? 0.0006 : 0) + (iz === 2 ? 0.0012 : 0);
        modules.push({ pack: FLOOR.pack, slug: FLOOR.slug, nativeHeight: null, x: bx, z: bz, rotY: R0, role: "floor", yOffset: -eps });
      }));
    }
    add(WALL, 1.5, 0.5, R0, "wall-n");
    add(WALL, 4.5, 0.5, R0, "wall-n");
    add(WALL, 1.5, 5.5, R180, "wall-s");
    add(HALF, 3.0, 5.5, R180, "wall-s");
    add(WALL, 4.5, 5.5, R180, "wall-s");
    add(WALL, 0.5, 1.5, R90, "wall-w");
    add(HALF, 0.5, 3.0, R90, "wall-w");
    add(WALL, 0.5, 4.5, R90, "wall-w");
    add(WALL, 5.5, 1.5, R270, "wall-e");
    add(HALF, 5.5, 3.0, R270, "wall-e");
    add(WALL, 5.5, 4.5, R270, "wall-e");
    add(CORNER_QUARTER, 0.5, 0.5, R0, "corner-nw");
    add(CORNER_QUARTER, 5.5, 0.5, R270, "corner-ne");
    add(CORNER_QUARTER, 5.5, 5.5, R180, "corner-se");
    add(CORNER_QUARTER, 0.5, 5.5, R90, "corner-sw");
    return modules;
  }

  /* ── bootToInSession — verbatim from the rig (auto-runs the bardo to a live session) ── */
  function bootToInSession() {
    const notes = [];
    try {
      if (typeof startBardo !== "function") return { ok: false, stage: "startBardo-missing" };
      startBardo();
      if (typeof bardoBegin === "function") bardoBegin();
      function autoFillStep(step) {
        if (!step) return;
        try {
          if (step.t === "choose") {
            if (!GS.CGEN[step.field]) {
              const src = step.field === "species" ? SPECIES : step.field === "class" ? CLASSES : BACKGROUNDS;
              const k = Object.keys(src || {})[0];
              if (k) cgChoose(step.field, k);
            }
          } else if (step.t === "scores") {
            while (GS.CGEN.scoreRolls.length < 6) bardoRollScore();
            if (!GS.CGEN.assigned) bardoAssign("best");
          } else if (step.t === "skills") { if (typeof cgSkillAuto === "function") cgSkillAuto(); }
          else if (step.t === "equipment") { if (typeof cgKitAuto === "function") cgKitAuto(); }
          else if (step.t === "tools") { if (typeof cgToolsAuto === "function") cgToolsAuto(); }
          else if (step.t === "languages") { if (typeof cgLangAuto === "function") cgLangAuto(); }
          else if (step.t === "spells") { if (typeof cgSpellsAuto === "function") cgSpellsAuto(); }
          else if (step.t === "feat") { if (typeof cgFeatAuto === "function") cgFeatAuto(); }
          else if (step.t === "life") { if (GS.CGEN.lifeQ && !GS.CGEN.lifeLog[GS.CGEN.lifeI] && typeof bardoLifeRoll === "function") bardoLifeRoll(); }
          else if (step.t === "hometown") { if (!GS.BARDO.rolled[step.key] && typeof bardoRollHometown === "function") bardoRollHometown(); }
          else if (step.t === "world") { if (!GS.BARDO.rolled[step.key] && typeof bardoRollWorld === "function") bardoRollWorld(); }
        } catch (e) { notes.push("autoFillStep threw at " + (step && step.t) + ": " + e.message); }
      }
      const seq = GS.BARDO.seq;
      let guard = 0; const MAX_STEPS = seq.length + 10;
      while (GS.BARDO && GS.BARDO.i < seq.length - 1 && guard < MAX_STEPS) {
        const step = seq[GS.BARDO.i];
        autoFillStep(step);
        if (step && step.t === "life" && GS.CGEN.lifeQ) {
          let lifeGuard = 0;
          while (GS.CGEN.lifeI < GS.CGEN.lifeQ.length - 1 && lifeGuard < 40) { autoFillStep(step); if (typeof bardoLifeStepNext === "function") bardoLifeStepNext(); lifeGuard++; }
          autoFillStep(step); if (typeof bardoLifeStepNext === "function") bardoLifeStepNext();
        }
        bardoAdvance(); guard++;
      }
      const nameEl = document.getElementById("charName");
      if (nameEl) nameEl.value = "KGR-8 Door Witness";
      if (typeof bardoWake === "function") bardoWake(); else if (typeof bardoFound === "function") bardoFound();
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return { ok: false, stage: "no-active-world-after-found", notes };
      if (!world.characters || !world.characters.some((c) => c.status === "living")) return { ok: false, stage: "no-living-pc-after-found", notes };
      if (typeof startSession === "function") { startSession(world.id); notes.push("startSession() called"); }
      showTab("world");
      return { ok: true, notes, worldId: world.id, worldName: world.name };
    } catch (e) { return { ok: false, stage: "exception", error: e.message, stack: e.stack, notes }; }
  }

  async function waitForTheater() {
    const deadline = Date.now() + 30000;
    let state = null;
    while (Date.now() < deadline) {
      const host = document.getElementById("worldView");
      state = {
        hasBattleStage: !!(host && host.querySelector(".game.battle-stage")),
        theaterMounted: !!(typeof GS !== "undefined" && GS.theaterMounted),
        hasCanvas: !!(host && host.querySelector(".theater-stage-canvas canvas")),
        hasSetInteriorBoard: !!(window.Theater && typeof window.Theater.setInteriorBoard === "function"),
        hasDonor: !!(window.TheaterDonor && typeof window.TheaterDonor.loadDonorPiece === "function"),
      };
      if (state.hasBattleStage && state.theaterMounted && state.hasCanvas && state.hasSetInteriorBoard && state.hasDonor) return state;
      try { renderWorld(); } catch (e) {}
      await sleep(300);
    }
    return state;
  }

  /* ── prepBoard — the rig's board build + prism strip, kept in-realm (no serialization) ── */
  function prepBoard(fx) {
    window.KIT_SHELL_ENABLED = false; // never the retired mixed-shell experiment
    window.KIT_DOORS_ENABLED = false; // KGR-8 demolition default — flat leaf only
    const doorCells = fx.doorCells || [fx.doorCell];
    const plan = {
      cellW: fx.w, cellD: fx.d, cells: fx.cells, rooms: [fx.room],
      corridors: [{ fromSeg: 1, toSeg: 1, cells: doorCells.map((c) => ({ x: c.x, y: c.y })) }],
      doors: doorCells.map((c) => ({ x: c.x, y: c.y, squeeze: false })),
      seed: "kgr8-clay-01",
    };
    const board = interiorBuildBoard(plan, { realmId: "fantasy", env: "dungeon", focusSegNum: fx.room.segNum });
    const strippedMeta = {
      prismFloor: board.instances.floor.length, prismWall: board.instances.wall.length,
      prismDoorframe: board.instances.doorframe.length, prismPillar: board.instances.pillar.length,
      portals: board.portals.length,
    };
    board.instances.floor = [];
    board.instances.wall = [];
    board.instances.doorframe = [];
    board.instances.pillar = [];
    board.cover = [];
    board.furniture = [];
    board.wallProps = [];
    board.lights = [];
    board.daisTop = [];
    board.portals = []; // shut-leaf card: the darkness portal would cover the leaf (rig deviation 2)
    board.renderProfile = null;
    board.lightProfile = "overcast";
    board.interactables = [{
      archetype: "door", sourceRef: "kgr8.clay01.door", state: "shut",
      x: fx.doorCell.x, y: fx.doorCell.y, slug: "door", name: "Plain Door", flavor: "a flat leaf",
      extrudeDepth: 0.32, reserve: false,
    }];
    board.pieces = [];
    board.dressing = [];
    board.decals = [];
    return { board, strippedMeta };
  }

  /* ── mountBoard — the rig's live-scene capture via the temporary Object3D.add hook ── */
  async function mountBoard(board) {
    const THREE = await import("three");
    const K = (window.__KGR8 = window.__KGR8 || {});
    K.THREE = THREE;
    if (!K.renderHooked) {
      const origRender = THREE.WebGLRenderer.prototype.render;
      if (origRender) {
        THREE.WebGLRenderer.prototype.render = function (scene, camera) {
          if (scene && scene.isScene && camera && camera.isCamera) { K.scene = scene; K.camera = camera; }
          return origRender.call(this, scene, camera);
        };
      }
      const origLookAt = THREE.Object3D.prototype.lookAt;
      THREE.Object3D.prototype.lookAt = function (...a) {
        if (this.isCamera) K.camera = this;
        return origLookAt.apply(this, a);
      };
      K.renderHooked = true;
    }
    const origAdd = THREE.Object3D.prototype.add;
    THREE.Object3D.prototype.add = function (...objs) {
      if (this.isScene) K.scene = this;
      return origAdd.apply(this, objs);
    };
    try {
      window.Theater._resetInteriorDoorStateForTest();
      window.Theater.setInteriorBoard(board);
    } finally {
      THREE.Object3D.prototype.add = origAdd;
    }
    if (!K.scene) throw new Error("scene never captured via add hook");
    K.interiorGroup = null;
    K.scene.traverse((o) => {
      if (K.interiorGroup) return;
      if (o.isGroup && o.children.some((c) => c.userData && c.userData.interiorKind)) K.interiorGroup = o;
    });
    if (!K.interiorGroup) {
      let best = null, bestN = 0;
      K.scene.children.forEach((o) => {
        let n = 0; o.traverse((c) => { if (c.userData && c.userData.interiorKind) n++; });
        if (n > bestN) { bestN = n; best = o; }
      });
      K.interiorGroup = best;
    }
    if (!K.interiorGroup) throw new Error("interior group not found in captured scene");
    return { origin: window.Theater.interiorBoardOrigin() };
  }

  /* ── mountKitModules — real admission path + hand placement + parapet-cut mirror ── */
  async function mountKitModules(modules, opts) {
    const K = window.__KGR8;
    const THREE = K.THREE;
    if (!K || !K.interiorGroup) throw new Error("mountBoard must run first");
    if (K.kitGroup) { K.kitGroup.parent && K.kitGroup.parent.remove(K.kitGroup); K.kitGroup = null; }
    const origin = window.Theater.interiorBoardOrigin() || { cx: 0, cz: 0 };
    const FLOOR_TOP_Y = -0.3;
    const FLOOR_BASE_Y = -0.5;
    const group = new THREE.Group();
    group.userData = { interiorKind: "kgr8-clay-kit" };
    const templates = {};
    for (const m of modules) {
      const key = m.pack + "/" + m.slug;
      if (!templates[key]) {
        templates[key] = await window.TheaterDonor.loadDonorPiece(m.pack, m.slug, {
          realmId: "fantasy", realmProfile: null, seedKey: "kgr8-clay:" + key,
        });
      }
    }
    let placed = 0;
    for (const m of modules) {
      const key = m.pack + "/" + m.slug;
      const piece = templates[key].clone(true);
      const sockets = (templates[key].userData && templates[key].userData.sockets) || [];
      const fm = sockets.find((s) => s.type === "floor-mount" && Array.isArray(s.position));
      const off = fm ? fm.position : [0, 0, 0];
      piece.position.set(-off[0], -off[1], -off[2]);
      piece.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      const holder = new THREE.Group();
      holder.add(piece);
      const isFloor = m.role === "floor";
      holder.position.set(m.x - origin.cx, (isFloor ? FLOOR_TOP_Y : FLOOR_BASE_Y) + (m.yOffset || 0), m.z - origin.cz);
      holder.rotation.y = m.rotY || 0;
      if (!isFloor && opts.wallHeightBase && m.nativeHeight) holder.scale.y = opts.wallHeightBase / m.nativeHeight;
      holder.userData = { kgr8Module: key, role: m.role, planX: m.x, planZ: m.z };
      group.add(holder);
      placed++;
    }
    let parapetCut = 0;
    if (opts.focusRect) {
      const fr = opts.focusRect;
      const yaw = (45 * Math.PI) / 180; // rotationStep-0 fresh-session camera (theater-boot.js itrCameraSideBand mirror)
      const dirX = Math.sin(yaw), dirZ = Math.cos(yaw);
      group.children.forEach((holder) => {
        if (holder.userData.role === "floor") return;
        const wx = holder.userData.planX, wz = holder.userData.planZ;
        const inBand = wx >= fr.minX - 1 && wx <= fr.maxX + 1 && wz >= fr.minZ - 1 && wz <= fr.maxZ + 1;
        if (!inBand) return;
        const rx = wx - origin.cx, rz = wz - origin.cz;
        if ((rx * dirX + rz * dirZ) > 0) { holder.scale.y *= 0.4; parapetCut++; }
      });
    }
    K.interiorGroup.add(group);
    K.kitGroup = group;
    return { placed, parapetCut };
  }

  /* ── clayPass — verbatim clay/void/light discipline from the rig ── */
  function clayPass() {
    const K = window.__KGR8;
    const THREE = K.THREE;
    if (!K || !K.scene || !K.interiorGroup) throw new Error("mount steps must run first");
    const clay = K.clayMat || (K.clayMat = new THREE.MeshStandardMaterial({ color: 0xa8a29a, roughness: 0.93, metalness: 0.0 }));
    const leafClay = clay;
    let clayed = 0, pointsRemoved = 0;
    const clayTargets = [];
    if (K.kitGroup) clayTargets.push({ root: K.kitGroup, mat: clay });
    K.interiorGroup.children.forEach((child) => {
      if (child.userData && child.userData.bySourceRef) clayTargets.push({ root: child, mat: leafClay });
      if (child.userData && child.userData.interiorKind === "skirt") {
        child.material = K.skirtMat || (K.skirtMat = new THREE.MeshStandardMaterial({ color: 0x2b2926, roughness: 1.0, metalness: 0 }));
      }
    });
    const toRemove = [];
    clayTargets.forEach(({ root, mat }) => root.traverse((o) => {
      if (!o.isMesh) return;
      const kind = (o.userData && o.userData.interiorKind) || null;
      if (kind === "portal") return;
      o.material = mat;
      clayed++;
    }));
    K.interiorGroup.traverse((o) => { if (o.isPoints) toRemove.push(o); });
    K.interiorGroup.children.forEach((child) => {
      if (!child.isGroup || (child.userData && (child.userData.interiorKind || child.userData.bySourceRef))) return;
      let meshCount = 0, allTiny = true;
      child.traverse((c) => {
        if (!c.isMesh) return;
        meshCount++;
        const box = new THREE.Box3().setFromObject(c);
        const size = box.getSize(new THREE.Vector3());
        if (Math.max(size.x, size.y, size.z) > 0.35) allTiny = false;
      });
      if (meshCount > 0 && allTiny) toRemove.push(child);
    });
    toRemove.forEach((o) => { o.parent && o.parent.remove(o); pointsRemoved++; });
    let voidDarkened = 0;
    const voidMat = K.voidMat || (K.voidMat = new THREE.MeshBasicMaterial({ color: 0x14100c }));
    K.scene.traverse((o) => {
      if (!o.isMesh) return;
      let inInterior = false;
      for (let p = o; p; p = p.parent) if (p === K.interiorGroup) { inInterior = true; break; }
      if (inInterior) return;
      const box = new THREE.Box3().setFromObject(o);
      const size = box.getSize(new THREE.Vector3());
      if (Math.max(size.x, size.z) > 6 && size.y < 1.2) { o.material = voidMat; voidDarkened++; }
    });
    K.scene.fog = null;
    if (!K.clayLights) {
      const rig = new THREE.Group();
      rig.add(new THREE.HemisphereLight(0xffffff, 0x777770, 0.85));
      const key = new THREE.DirectionalLight(0xffffff, 0.75);
      key.position.set(6, 12, 9);
      key.target.position.set(0, 0, 0);
      rig.add(key); rig.add(key.target);
      K.scene.add(rig);
      K.clayLights = rig;
    }
    if (window.Theater._setPostChainEnabledForTest) window.Theater._setPostChainEnabledForTest(false);
    if (window.Theater._setOcclusionFadeDisabledForTest) window.Theater._setOcclusionFadeDisabledForTest(true);
    renderFrame();
    return { clayed, pointsRemoved, voidDarkened };
  }

  function renderFrame() {
    if (window.Theater && window.Theater._renderFrameForTest) window.Theater._renderFrameForTest();
  }

  /* ── the camera-freeze trick (rig discipline: instance-level position locks + no-op lookAt,
        so no engine re-fit can move the view out from under Adam) ── */
  function unfreezeCam() {
    const cam = window.__KGR8 && window.__KGR8.camera;
    if (!cam || !S.frozen) return;
    const fx = cam.position.x, fy = cam.position.y, fz = cam.position.z;
    delete cam.position.x; delete cam.position.y; delete cam.position.z;
    cam.position.set(fx, fy, fz);
    delete cam.lookAt;
    S.frozen = false;
  }
  function freezeCam() {
    const cam = window.__KGR8 && window.__KGR8.camera;
    if (!cam || S.frozen) return;
    const fx = cam.position.x, fy = cam.position.y, fz = cam.position.z;
    Object.defineProperty(cam.position, "x", { configurable: true, get: () => fx, set: () => {} });
    Object.defineProperty(cam.position, "y", { configurable: true, get: () => fy, set: () => {} });
    Object.defineProperty(cam.position, "z", { configurable: true, get: () => fz, set: () => {} });
    cam.lookAt = function () {};
    S.frozen = true;
  }
  function cameraFull() {
    const K = window.__KGR8;
    if (!K || !K.camera || !S.fullCam) return { ok: false, error: "no saved full-view camera" };
    unfreezeCam();
    K.camera.position.fromArray(S.fullCam.pos);
    K.camera.quaternion.fromArray(S.fullCam.quat);
    K.camera.updateMatrixWorld(true);
    freezeCam();
    renderFrame();
    return { ok: true, mode: "full" };
  }
  function cameraDolly(dist) {
    // the rig's door-card dolly: production DIRECTION held (yaw/pitch recovered from the saved
    // full-view camera), orbit center = the leaf's own live box center, distance dist (rig: 13).
    const K = window.__KGR8;
    const THREE = K && K.THREE;
    if (!K || !K.camera || !S.fullCam) return { ok: false, error: "no saved full-view camera" };
    unfreezeCam();
    const cam = K.camera;
    cam.position.fromArray(S.fullCam.pos);
    cam.quaternion.fromArray(S.fullCam.quat);
    cam.updateMatrixWorld(true);
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    const yaw = Math.atan2(-dir.x, -dir.z);
    const pitch = Math.asin(Math.max(-1, Math.min(1, -dir.y)));
    let hinge = null;
    K.interiorGroup.children.forEach((c) => { if (c.userData && c.userData.bySourceRef && c.children.length) hinge = c.children[0]; });
    if (!hinge) return { ok: false, error: "leaf hinge not found" };
    hinge.updateWorldMatrix(true, true);
    const lb = new THREE.Box3().setFromObject(hinge);
    const center = lb.getCenter(new THREE.Vector3());
    const horiz = Math.cos(pitch) * dist;
    cam.position.set(center.x + Math.sin(yaw) * horiz, center.y + Math.sin(pitch) * dist, center.z + Math.cos(yaw) * horiz);
    cam.lookAt(center);
    cam.updateProjectionMatrix();
    freezeCam();
    renderFrame();
    return { ok: true, mode: "dolly", dist, yawDeg: +((yaw * 180) / Math.PI).toFixed(3), pitchDeg: +((pitch * 180) / Math.PI).toFixed(3) };
  }

  /* ── fitLeaf — the shared helper + a frame ── */
  function fitLeaf(params) {
    const r = window.kgr8FitLeafToAperture(window.__KGR8, params || {});
    renderFrame();
    return r;
  }

  /* ── bootAll — the whole rig sequence, one call ── */
  async function bootAll(onProgress) {
    const say = (phase) => { S.phase = phase; try { if (onProgress) onProgress(phase); } catch (e) {} };
    say("bardo: rolling the witness world…");
    const boot = bootToInSession();
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    say("waiting for the theater…");
    const theater = await waitForTheater();
    if (!theater || !theater.hasSetInteriorBoard || !theater.hasDonor) throw new Error("Theater/TheaterDonor never mounted: " + JSON.stringify(theater));
    say("building the 5×5 clay board…");
    const fx = clayPlan();
    const prep = prepBoard(fx);
    S.fx = fx; S.board = prep.board;
    say("mounting the board (production path)…");
    await mountBoard(prep.board);
    await sleep(3000); // camera tween settle (rig discipline)
    say("mounting the Kenney kit shell…");
    const placed = await mountKitModules(kitRecipe(), { focusRect: prep.board.focusRect, wallHeightBase: prep.board.wallHeightBase });
    say("first leaf fit + clay pass…");
    const fit1 = fitLeaf({});
    if (!fit1.ok) throw new Error("leaf fit failed: " + fit1.error);
    clayPass();
    say("framing (production zoom-out ×3)…");
    for (let i = 0; i < 3; i++) window.Theater.zoom(-1);
    await sleep(800);
    clayPass();
    say("late-async settle…");
    await sleep(2500); // late texture/donor replays can re-dress the board (rig discipline)
    clayPass();
    const fit2 = fitLeaf({});
    if (!fit2.ok) throw new Error("leaf re-fit failed: " + fit2.error);
    const K = window.__KGR8;
    if (!K.camera) throw new Error("no live camera captured");
    // recovered-pitch sanity (card 04 unit 3: the frozen production camera must read 28/45)
    const dir = new K.THREE.Vector3();
    K.camera.getWorldDirection(dir);
    const cameraCheck = {
      pitchDeg: +(((Math.asin(Math.max(-1, Math.min(1, -dir.y)))) * 180) / Math.PI).toFixed(3),
      yawDeg: +(((Math.atan2(-dir.x, -dir.z)) * 180) / Math.PI).toFixed(3),
    };
    S.fullCam = { pos: K.camera.position.toArray(), quat: K.camera.quaternion.toArray() };
    freezeCam(); // nothing moves this view but the dolly toggle
    renderFrame();
    say("ready");
    return { ok: true, placed: placed.placed, parapetCut: placed.parapetCut, strippedMeta: prep.strippedMeta, cameraCheck, fit: fit2 };
  }

  window.KGR8WB = { bootAll, fitLeaf, clayPass, cameraDolly, cameraFull, renderFrame, state: S };
})();
