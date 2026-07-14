#!/usr/bin/env node
/* dev/verify-occlusion-fade.mjs — docs/DIEGETIC-LIGHT.md unit S-1 (OCCLUSION FADE). Adam's report: the
   pre-unit cutaway (a height stub to a KNEE — ITR_PILLAR_STUB_FRAC's old 0.3, ~0.72 world units at the
   2.4 wallHeightBase default) still let columns AND walls obscure a figure — the stub never actually
   cleared a torso-height sight point. Adam's live steer during THIS unit's build (2026-07-11): don't
   fade to a mid-opacity translucency — cut the occluder down to a genuinely-low ANKLE height and
   render the REMOVED upper portion as a ~5% opacity GHOST, so the player can still tell a column/wall
   is there while the figure behind it reads clearly.

   Boots the real app (server + headless Chrome + THREE), same convention dev/verify-interior-camera-
   frustum.mjs and dev/verify-bw2-1b-occlusion.mjs's PART B already use — mount() directly on a bare
   div (given the real `.theater-stage-canvas` class so screenshotting actually finds the canvas — see
   that comment below), no character-creation boot needed (this harness never touches GS/bardo).

   Scene: a hand-built 7x7 room (deterministic bounds — no dungeon-generator RNG needed for this claim)
   with ONE figure cell and a tight "beat" camera fit on it (mirrors BW2-1b's own corner-pillar
   convention — the default whole-room fit puts this narrow-FOV interior camera too far away for a
   realistic occluder size to ever land in its valid occlusion window; see the in-file comment on
   OCC_HALF_EXTENT for the full empirical story). The figure's texture is deliberately left UNRESOLVED
   (never mounts a real billboard mesh — see that comment below) so only itrPieceSightPoints' pure math
   is exercised; the occluder position is found by sweeping the real camera->sightpoint segment against
   itrSegmentIntersectsAabb (the same primitive production code runs), then a CONTROL occluder is placed
   in a corner nowhere near any sightline.

   RED-FIRST: window.Theater._setOcclusionFadeDisabledForTest(true) reverts setInteriorBoard's
   occlusion pass to "nothing occludes at all" (full-height instances, no ankle stub, no ghost) — the
   honest "today's bug, if the fix were entirely absent" baseline. Sampling the occluder's own world
   position (a saturated, unmistakable red) against a baseline render with NO occluder at all proves
   the sight point reads OCCLUDED (solid red) when the fix is off.

   GREEN: fade re-enabled (the default) — the SAME occluder, sampled at the SAME point, now reads close
   to the baseline (background visible THROUGH the faded occluder). Structural assertions confirm the
   mechanism: the occluding instance is ankle-stubbed AND has a matching ghost entry (contiguous,
   summing back to the original height); the CONTROL instance (never on any sightline) stays completely
   untouched — full height, no ghost, proving the fade is scoped to actual occluders.

   fps measured via window.Theater.measureRenderFps(60) on the GREEN scene (>=30 gate).
   Captures before/after PNGs to dev/battle-gate/occlusion-fade/{baseline,red-occluded,green-through}.png.

   Run: node dev/verify-occlusion-fade.mjs */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(__dirname, "battle-gate", "occlusion-fade");
fs.mkdirSync(outDir, { recursive: true });

// dedicated range — never shared with capture-*.mjs's own dedicated ranges (5181-5225) or the other
// verify-*.mjs dedicated ranges already claimed (5231-5235 mf1/vp1c, 5241-5245 mf4).
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5251, 5252, 5253, 5254, 5255];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log("  ✓", label); } else { fail++; console.log("  ✗ FAIL:", label); } }
function group(name) { console.log("\n[" + name + "]"); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function portInUse(port) {
  return new Promise((resolve) => {
    const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
    sock.on("error", () => resolve(false));
    sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
  });
}
async function probeRoot(port) {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/genesis.html`, { cache: "no-store" });
    if (!r.ok) return false;
    const body = await r.text();
    return body.includes("Genesis");
  } catch (e) { return false; }
}
async function startServer() {
  for (const port of PORT_CANDIDATES) {
    if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc: null, port }; } continue; }
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: ["ignore", "ignore", "ignore"] });
    for (let i = 0; i < 40; i++) {
      if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc, port }; } break; }
      await sleep(150);
    }
    try { proc.kill("SIGTERM"); } catch (e) {}
  }
  throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
}
// BEAUTY-WAVE-4.md MF-1 (CAMERA TWEENS): setInteriorBoard's camera fit GLIDES (280-350ms) rather than
// snapping — dev/verify-interior-camera-frustum.mjs's own convention, copied verbatim: every claim
// this harness makes (camera position, screenshot, projectWorldPoint) is about the SETTLED pose, so
// every setInteriorBoard call below is followed by this wait before reading anything camera-dependent.
async function settleCameraTween(page) {
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
}

async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1200,900"];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 1200, height: 900, deviceScaleFactor: 1 } });
}

const FIGURE_SLUG = "s1-occfade-figure";
const FIG_CELL = { x: 5, z: 5 }; // far corner of the room, deterministic (see ROOM_SPAN below)

// hand-built board: bypasses the dungeon generator's RNG entirely (this claim needs deterministic
// camera/figure/occluder geometry, not a randomly-shaped room) — a plain 12x12 floored room with a
// full perimeter wall. instances.pillar starts empty; the harness injects synthetic occluding/control
// pillars (and a synthetic occluding/control WALL pair) once it knows the real camera position.
function buildHandBoardSrc() {
  return `
    const kit = interiorTileKitFor("gloom");
    const W = 7, D = 7, wallH = 2.4;
    const floor = [];
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) floor.push({ x, z, sx: 1, sy: 1, sz: 1, color: kit.floorColor });
    const wall = [];
    for (let x = -1; x <= W; x++) { wall.push({ x, z: -1, sx: 1, sy: wallH, sz: 1, color: kit.wallColor }); wall.push({ x, z: D, sx: 1, sy: wallH, sz: 1, color: kit.wallColor }); }
    for (let z = 0; z < D; z++) { wall.push({ x: -1, z, sx: 1, sy: wallH, sz: 1, color: kit.wallColor }); wall.push({ x: W, z, sx: 1, sy: wallH, sz: 1, color: kit.wallColor }); }
    return {
      kind: "interior3d", env: "dungeon", realmId: "gloom", cellSize: 1, wallHeightBase: wallH,
      tileKit: { floorColor: kit.floorColor, wallColor: kit.wallColor, trimColor: kit.trimColor,
        floorMaterial: kit.floorMaterial, wallMaterial: kit.wallMaterial, trimMaterial: kit.trimMaterial,
        floorGrain: 0, wallGrain: 0, trimGrain: 0, gradeTint: null, gradeStrength: 0, fogWhisper: 0 },
      instances: { floor, wall, doorframe: [], pillar: [] },
      bounds: { minX: -1, maxX: W, minZ: -1, maxZ: D },
      lightProfile: "torchlit",
      pieces: [],
    };
  `;
}

async function main() {
  console.log("[verify-occlusion-fade]");
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await browser.newPage();
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "load", timeout: 30000 });
    for (let i = 0; i < 40; i++) {
      const ready = await page.evaluate(() => !!(window.Theater && typeof window.Theater.setInteriorBoard === "function"));
      if (ready) break;
      await sleep(150);
    }
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    // PRE-EXISTING BUG discovered while building this harness (flagged separately, out of scope for
    // S-1 — NOT fixed here): theater-boot.js's module-scope `loadWholeObjectBuilders(...)` completion
    // callback (once per page load, a few hundred ms after import, once every whole-object creature
    // model settles) unconditionally replays `S.lastBoard` through `setBoard()` — the FLAT TABLETOP
    // path — without the `S.lastBoard.kind === "interior3d"` guard every OTHER replay site in the file
    // uses. If S.mounted is already true with an interior board active when that callback fires, it
    // force-restores the ORTHO camera (setBoard's own header: "the flat tabletop channel ALWAYS
    // renders ortho... Restoring S.orthoCamera here... setInteriorBoard is the only place that ever
    // swaps S.camera to perspective") against a bogus tabletop-shaped fit — corrupting the camera this
    // harness depends on. The callback is a no-op when S.mounted is still false, so waiting for
    // `window.Theater.ready` (flipped true by that SAME callback, after the stray replay) BEFORE ever
    // calling mount() sidesteps it entirely — the stray replay always resolves first, finds nothing
    // mounted yet, and skips both re-calls harmlessly.
    for (let i = 0; i < 60; i++) {
      const ready = await page.evaluate(() => !!(window.Theater && window.Theater.ready === true));
      if (ready) break;
      await sleep(150);
    }

    const mounted = await page.evaluate(() => {
      const el = document.createElement("div");
      // .theater-stage-canvas (genesis.html's own CSS: position:absolute;inset:0) is what every
      // OTHER capture/verify harness's `.theater-stage-canvas canvas` selector matches — this
      // harness's own bare unclassed div silently matched NOTHING (page.$ returned null), so every
      // "canvas screenshot" fell through to a whole-PAGE screenshot instead (this repo's own else
      // branch, meant as a defensive fallback) that never actually captured the theater canvas at
      // all — explaining three byte-IDENTICAL PNGs despite the scene graph genuinely differing
      // (proven separately via a live raycast hit). Giving the host div the real class fixes this.
      el.className = "theater-stage-canvas";
      el.style.position = "fixed"; el.style.left = "0"; el.style.top = "0";
      el.style.width = "1200px"; el.style.height = "900px";
      document.body.appendChild(el);
      return !!window.Theater.mount(el);
    });
    if (!mounted) throw new Error("Theater.mount failed");

    // register the synthetic figure slug (BW2-1b's own convention — extend the REAL SPRITE_REGISTRY
    // with a synthetic test entry). spriteEntryFor (theater-boot.js) joins a PIECE's own p.slug
    // against SPRITE_REGISTRY by NORMALIZED NAME (normalizeSpriteKey strips non-alphanumerics +
    // lowercases both sides), not by registry key — `name` is set to the SAME string as the slug so
    // the join is trivially exact.
    // Deliberately NOT stubbing _spriteTextureCache here (BW2-1b's own convention does, for ITS
    // raycast/position-only checks) — doing so resolves interiorSpriteBillboard synchronously and
    // mounts a REAL billboard+plinth-base+contact-blob mesh set for the piece, and this harness
    // discovered live that mounting one with a synthetic non-THREE.Texture stub image object
    // ({isTexture:true,image:{width,height}}, no real GL-uploadable pixel data) crashes
    // WebGLShadowMap's shadow-casting pass the first time this scene is actually RENDERED (a
    // TypeError deep in three.js's own refreshTransformUniform, unrelated to S-1 — reproduced with
    // a bare figure+no-pillar scene too). Since interior boards always run shadowMap.enabled=true,
    // any real render attempt hit this. Leaving the texture cache UNRESOLVED makes
    // interiorSpriteBillboard's own "texture not loaded yet" guard return null — the piece never
    // mounts a mesh at all (no billboard, no crash surface) — while itrPieceSightPoints (the ONLY
    // thing S-1's occlusion mask actually needs) still resolves a real sight point purely from the
    // SPRITE_REGISTRY entry (scaleTrue), independent of whether a mesh was ever built. The mask
    // fires on the real math either way; this harness just never asks the (crash-prone, unrelated)
    // sprite-render path to do anything at all.
    await page.evaluate((slug) => {
      SPRITE_REGISTRY[slug] = { realm: "gloom", kind: "monster", name: slug, size: "Medium", status: "cut", scaleTrue: 1.0, floor: 0 };
    }, FIGURE_SLUG);

    // ── BASELINE mount: the bare room + figure, NO occluders at all — this IS "what the figure's own
    // screen patch looks like with nothing in the way", the reference every occluded render is
    // compared against, AND (in the same mount) the source of the REAL, SETTLED camera position the
    // occluder-placement search below needs. Reading camera position from a SEPARATE throwaway mount
    // (tried first) proved unreliable — the beat-fit camera settled at a DIFFERENT distance on a
    // second/third setInteriorBoard call than on the very first one in this page session (a real,
    // if not-yet-root-caused, discrepancy) — so the fix is to never throw away and re-derive: compute
    // everything from THIS ONE settled mount, then only ADD to its board (never rebuild it from a
    // fresh JS object) for the RED/GREEN states below.
    group("BASELINE — figure fully visible, no occluder in the scene at all");
    await page.evaluate(({ boardSrc, figCell, slug }) => {
      window.Theater._setOcclusionFadeDisabledForTest(false);
      const buildBoard = new Function(boardSrc);
      const board = buildBoard();
      board.pieces = [{ slug, cellX: figCell.x, cellY: figCell.z }];
      // BW2-1 THE BEAT CAMERA: fit tightly to the figure's own cell (mirroring dev/verify-bw2-1b-
      // occlusion.mjs's own convention) rather than the whole room — the default "room" fit (whole
      // 7x7+perimeter bounds) puts the narrow-FOV (~20°) interior camera SO far away that a
      // wallHeightBase-tall box only ever straddles the sightline in a razor-thin window essentially
      // ON TOP of the figure's own cell (empirically confirmed: no 1-4 cell integer offset ever
      // worked at the "room" fit's distance) — which then collides with the BLOCKER-CELL EXCLUSION
      // nudge (a piece never mounts standing on/inside a pillar's own footprint), invalidating the
      // whole test. A tight beat fit brings the camera close enough that a normal ~1-cell-away
      // occluder genuinely occludes, matching how BW2-1b's own real-dungeon corner-pillar scenario
      // actually occludes at least once across its 100 seeds.
      board.cameraFit = { mode: "beat", cells: [{ x: figCell.x, y: figCell.z }] };
      window.__occfadeBoard = board; // stashed so the RED/GREEN mounts below ADD pillars to this
                                      // EXACT object rather than reconstructing a fresh one.
      window.Theater.setInteriorBoard(board);
    }, { boardSrc: buildHandBoardSrc(), figCell: FIG_CELL, slug: FIGURE_SLUG });
    await settleCameraTween(page);
    const geo = await page.evaluate(({ figCell, slug }) => {
      const origin = window.Theater.interiorBoardOrigin();
      const floorTopMap = window.Theater._interiorFloorTopMapForTest();
      // the SAME production math setInteriorBoard's own occlusion pass calls (itrPieceSightPoints)
      // — computed directly here rather than read off a mounted mesh, since the piece deliberately
      // never mounts one (see the texture-cache comment above). This IS the real sight point S-1's
      // mask tests against.
      const sightPoints = window.Theater._occlusionLawForTest.itrPieceSightPoints(
        [{ slug, cellX: figCell.x, cellY: figCell.z }], origin.cx, origin.cz, floorTopMap
      );
      return {
        cam: window.Theater._interiorCameraPositionForTest(),
        origin,
        sightPoints,
      };
    }, { figCell: FIG_CELL, slug: FIGURE_SLUG });

    ok(!!geo.cam && !!geo.origin, "bare-room mount resolved a real camera position + board origin");
    ok(geo.sightPoints.length === 1, `the figure resolves a real sight point via the production itrPieceSightPoints math (${geo.sightPoints.length} point(s))`);
    const figWorld = geo.sightPoints[0];

    // Pick the occluder position by a FINE-GRAINED search along the real 3D camera->figure segment,
    // testing each candidate t against the REAL itrSegmentIntersectsAabb (the same primitive production
    // code runs). The interior camera is a narrow-FOV (~20°) telephoto sitting many room-widths away —
    // depth compresses hard at that FOV, so a wallHeightBase-tall (2.4) box only actually straddles the
    // segment in a THIN window of t very close to the figure itself (an integer-cell offset of 1+ from
    // the figure overshoots past that window entirely — confirmed empirically: neither a 12x12 nor a
    // 7x7 hand-built room's own 1-4 cell integer offsets ever landed inside it). data.instances carry
    // plain x/z (no grid-snap enforced anywhere in the render path — see interiorBuildInstancedMesh's
    // own per-instance transform), so the occluder is placed at the exact FRACTIONAL position the
    // search finds, not rounded to a cell — this is still a fully valid instance, just not aligned to
    // the integer grid a real dungeon generator would author (harmless for this harness's own claim,
    // which is about the fade mechanism, not grid alignment).
    const camForCheck = geo.cam, figForCheck = figWorld;
    async function boxHitsAtT(t, halfExtent) {
      const px = camForCheck.x + t * (figForCheck.x - camForCheck.x);
      const pz = camForCheck.z + t * (figForCheck.z - camForCheck.z);
      const hit = await page.evaluate(({ camPos, figWorld, px, pz, halfExtent }) => {
        const law = window.Theater._occlusionLawForTest;
        const boxMin = { x: px - halfExtent, y: -0.5, z: pz - halfExtent };
        const boxMax = { x: px + halfExtent, y: 1.9, z: pz + halfExtent };
        return law.itrSegmentIntersectsAabb(camPos, figWorld, boxMin, boxMax);
      }, { camPos: camForCheck, figWorld: figForCheck, px, pz, halfExtent });
      return { hit, px, pz };
    }
    let occPos = null;
    // sweep t from very close to the figure (0.999) back toward the camera in fine steps — the first
    // hit found this way sits at the FARTHEST-from-figure edge of the valid window (still genuinely
    // "in front of" the figure from the camera's view, not degenerate/on top of it). OCC_HALF_EXTENT
    // (1.5, a deliberately generous "column" footprint, sx=sz=3 below) rather than a real 1-unit pillar
    // — this camera is a narrow-FOV (~20°) telephoto sitting many room-widths away, so a realistic
    // 1-unit column's valid occluding window is a razor-thin sliver of t essentially co-located with
    // the figure's own point (confirmed empirically: a 0.5 half-extent search only ever found a hit at
    // t=0.999, i.e. practically ON the figure — nowhere near wide enough a margin for a robust,
    // unambiguous SCREEN-SPACE coverage test). A generously-sized occluder is still a fully legitimate
    // exercise of the SAME fade mechanism (the mask/split/ghost logic has no size-dependent branch —
    // see itrPillarCutawayMask/itrSplitOccluderForAnkleGhost, both pure geometry over whatever
    // sx/sy/sz an instance carries), it just guarantees the visual proof isn't fighting sub-pixel
    // precision on top of the mechanism itself.
    const OCC_HALF_EXTENT = 1.5;
    for (let t = 0.999; t >= 0.80; t -= 0.001) {
      // eslint-disable-next-line no-await-in-loop
      const r = await boxHitsAtT(t, OCC_HALF_EXTENT);
      if (r.hit) { occPos = { x: r.px, z: r.pz, t }; break; }
    }
    ok(occPos != null, "found a real occluder position along the camera->figure segment whose full-height box genuinely intersects the sightline (fine t-sweep)");
    if (!occPos) { throw new Error("could not find an occluding position — cannot proceed"); }
    const occCell = { x: occPos.x + geo.origin.cx, z: occPos.z + geo.origin.cz };
    // control cell: a corner of the room nowhere near the camera->figure segment.
    const ctrlCell = { x: 1, z: 1 };
    console.log(`  camera (shifted frame): (${geo.cam.x.toFixed(2)}, ${geo.cam.y.toFixed(2)}, ${geo.cam.z.toFixed(2)}); figure: (${FIG_CELL.x},${FIG_CELL.z}); occluder position (raw, t=${occPos.t.toFixed(3)}): (${occCell.x.toFixed(3)},${occCell.z.toFixed(3)}); control cell: (${ctrlCell.x},${ctrlCell.z})`);

    // The visual sample point is the OCCLUDER's own position at torso height (occPos.x/z, y=1.146 —
    // the SAME HUMAN_TRUE_HEIGHT*0.5 torso convention itrPieceSightPoints itself uses), NOT the
    // figure's own mounted position: at this camera's razor-thin valid-occlusion window, the required
    // occluder position sits close enough to the figure's own cell that a real box there triggers the
    // BLOCKER-CELL EXCLUSION nudge (a piece never mounts standing on/inside a pillar's own footprint —
    // see interiorBuildPieces' own itrBlockerNudgeCell call), which would silently relocate the
    // figure's rendered position once the pillar exists, invalidating a figure-anchored sample point.
    // Sampling the OCCLUDER's own known, fixed position sidesteps that entirely and is a direct,
    // unambiguous test of the fade mechanism itself: y=1.146 sits ABOVE the ankle-cut top (0.288,
    // world y=-0.212) and WELL WITHIN the pre-cut full box's own y-range (world y up to 1.9) — so RED
    // (fade disabled) must show the occluder's own opaque color there, and GREEN (fade enabled) must
    // show only its ~5% ghost blended with whatever's behind, since the ankle-height solid stub no
    // longer reaches this y at all.
    const samplePoint = { x: occPos.x, y: 1.146, z: occPos.z };

    // ── take the BASELINE screenshot NOW, off this exact settled mount (no occluders yet) — before
    // ANY second setInteriorBoard call has a chance to touch camera state again.
    const baseline = await shootAndSample(samplePoint, "baseline");
    ok(!!baseline.sample, `baseline patch sampled (${JSON.stringify(baseline.sample || baseline.raw)})`);

    // ── mount WITH the occluding + control pillar injected onto the EXACT SAME board object
    // (window.__occfadeBoard, stashed above) — never reconstructed from scratch — so cameraFit's own
    // "beat on the figure's cell" resolves identically every time (the earlier "rebuild an
    // identical-by-VALUE-but-different-OBJECT board" approach measurably drifted camera distance
    // between calls in this same page session; mutating the SAME object side-steps whatever that
    // was, and is arguably more representative of a real "move-step" re-render anyway — see
    // setInteriorBoard's own header on move-steps forcing a fresh call against the SAME live data).
    async function mountWithOccluders(fadeDisabled) {
      await page.evaluate(({ occCell, ctrlCell, fadeDisabled, occSize }) => {
        window.Theater._setOcclusionFadeDisabledForTest(fadeDisabled);
        const board = window.__occfadeBoard;
        board.instances.pillar = [
          // a SATURATED, deliberately-unrealistic red — distinguishing "the occluder's own opaque
          // color is covering this screen point" from "the muted gray floor/wall kit shows through" is
          // the whole visual claim below, so the occluder must never be confusable with the scene's own
          // palette (the figure's OWN stub texture, {isTexture:true,image:{width,height}} with no real
          // pixel data — the same synthetic-registry convention dev/verify-bw2-1b-occlusion.mjs's own
          // raycast-only checks use — never renders a distinguishing color of its own, so this harness's
          // visual proof is about the OCCLUDER's rendered opacity at the sight point, not the figure's).
          { x: occCell.x, z: occCell.z, sx: occSize, sy: 2.4, sz: occSize, color: "#ff0000" },
          { x: ctrlCell.x, z: ctrlCell.z, sx: occSize, sy: 2.4, sz: occSize, color: "#ff0000" },
        ];
        // window.Theater.setInteriorBoard(board) directly would risk the dirty-key skip: `data` is the
        // SAME object across a fadeDisabled toggle between two calls with identical pillar content (the
        // RED->GREEN transition rebuilds nothing new in `data` itself — only the separate module-scope
        // ITR_OCCLUSION_FADE_DISABLED_FOR_TEST flag changes, which isn't part of the dirty-key at all).
        // setInteriorVariant({}) is the SAME "null S.boardKey, replay S.lastBoard" trick the study-rig
        // itself uses (see that function's own header) — S.lastBoard already points at this EXACT
        // object (set by the very first setInteriorBoard call above), so mutating board.instances.pillar
        // in place then forcing a replay is a genuine, guaranteed rebuild every time.
        window.Theater.setInteriorVariant({});
      }, { occCell, ctrlCell, fadeDisabled, occSize: OCC_HALF_EXTENT * 2 });
      await settleCameraTween(page);
      return await page.evaluate(() => ({
        pillarList: window.Theater._interiorPillarListForTest(),
        pillarGhostList: window.Theater._interiorPillarGhostListForTest(),
        pieces: window.Theater.interiorPiecesWorldPositions(),
        meshCount: window.Theater.interiorMeshCount(),
      }));
    }

    // sample the figure's own screen patch out of a just-captured canvas screenshot (preserveDrawing-
    // Buffer is off — capture-value-plunge.mjs's own established "screenshot then decode as a 2D-canvas
    // image" pattern, since drawImage(glCanvas) reads black once composited).
    async function shootAndSample(figWorldPos, tag) {
      await sleep(600); // generous — let the render-on-demand rAF tick actually paint
      const canvasEl = await page.$(".theater-stage-canvas canvas");
      const shotPath = path.join(outDir, tag + ".png");
      if (canvasEl) await canvasEl.screenshot({ path: shotPath }); else await page.screenshot({ path: shotPath });
      const pngB64 = fs.readFileSync(shotPath).toString("base64");
      const sample = await page.evaluate(({ pngB64, figWorldPos }) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const W = img.naturalWidth, H = img.naturalHeight;
          const c = document.createElement("canvas"); c.width = W; c.height = H;
          const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, W, H);
          let data; try { data = ctx.getImageData(0, 0, W, H).data; } catch (e) { return resolve({ err: "getImageData: " + e.message, W, H }); }
          const p = window.Theater.projectWorldPoint(figWorldPos.x, figWorldPos.y, figWorldPos.z);
          if (!p) return resolve({ err: "projectWorldPoint returned null", W, H, figWorldPos });
          const sx = Math.round((p.ndcX * 0.5 + 0.5) * W), sy = Math.round((1 - (p.ndcY * 0.5 + 0.5)) * H);
          const rad = Math.max(2, Math.floor(H * 0.02));
          let r = 0, g = 0, b = 0, n = 0;
          for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
            const x = sx + dx, y = sy + dy;
            if (x < 0 || y < 0 || x >= W || y >= H) continue;
            const i = (y * W + x) * 4; r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
          }
          const dbg = { p, camPos: window.Theater._interiorCameraPositionForTest(), figWorldPos };
          resolve(n ? { r: r / n, g: g / n, b: b / n, sx, sy, n } : { err: "0 in-bounds pixels sampled", W, H, sx, sy, dbg });
        };
        img.onerror = () => resolve({ err: "png decode failed" });
        img.src = "data:image/png;base64," + pngB64;
      }), { pngB64, figWorldPos });
      return { shotPath, sample: sample && !sample.err ? sample : null, raw: sample };
    }
    function colorDist(a, b) { if (!a || !b) return null; return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b); }

    // ── RED-FIRST: the occlusion pass forced OFF entirely (full-height occluder, no ankle stub, no
    // ghost) — the honest "if S-1's fix were absent" baseline. The figure's own patch must read
    // OCCLUDED (far from the baseline color — a wall-colored patch, not a figure-colored one).
    group("RED-FIRST — occlusion fade DISABLED (today's-bug baseline): the figure's own screen patch reads OCCLUDED");
    const redGeo = await mountWithOccluders(true);
    const meshDump = await page.evaluate((sp) => ({
      meshCount: window.Theater.interiorMeshCount(),
      pillarList: window.Theater._interiorPillarListForTest(),
      camPos: window.Theater._interiorCameraPositionForTest(),
      raycastAtSamplePoint: window.Theater._interiorRaycastClearForTest(sp),
    }), samplePoint);
    console.log("  DEBUG mesh dump (RED):", JSON.stringify(meshDump));
    const red = await shootAndSample(samplePoint, "red-occluded");
    ok(!!red.sample, `red-state figure patch sampled (${JSON.stringify(red.sample)})`);
    const redDist = colorDist(baseline.sample, red.sample);
    ok(redDist != null && redDist > 40, `RED: figure patch color distance from baseline is LARGE (${redDist && redDist.toFixed(1)}) — the full-height occluder (fade disabled) genuinely blocks the figure, proving this check is load-bearing before trusting any green`);
    ok(redGeo.pillarList.every((p) => Math.abs((p.sy || 1) - 2.4) < 1e-6), "RED: with fade disabled, BOTH injected pillars (occluder + control) stay at their full original height — the disable flag genuinely reverts to no-cutaway-at-all");
    ok(redGeo.pillarGhostList.length === 0, "RED: with fade disabled, zero ghost instances exist at all");

    // ── GREEN — the fix, default-on: the SAME occluder present, now ankle-cut + a ~5% ghost. The
    // figure's own patch should read close to baseline (visible through the faded occluder).
    group("GREEN — occlusion fade ENABLED (the fix): the figure's own screen patch reads THROUGH the faded occluder");
    const greenGeo = await mountWithOccluders(false);
    const green = await shootAndSample(samplePoint, "green-through");
    ok(!!green.sample, `green-state figure patch sampled (${JSON.stringify(green.sample)})`);
    const greenDist = colorDist(baseline.sample, green.sample);
    const greenVsRed = colorDist(green.sample, red.sample);
    ok(greenDist != null && greenDist < redDist * 0.5, `GREEN: figure patch color distance from baseline (${greenDist && greenDist.toFixed(1)}) is well BELOW the red-state distance (${redDist.toFixed(1)}) — the figure reads clearly through the faded occluder, not just marginally better`);
    ok(greenVsRed != null && greenVsRed > 20, `GREEN vs RED patch colors genuinely differ (${greenVsRed.toFixed(1)}) — the fade is not a no-op that renders identically to the disabled baseline`);

    // structural proof: the occluding pillar is ankle-stubbed + has a matching ghost; the control
    // pillar (never on any sightline) is completely untouched — full height, no ghost at all.
    const ankleH = await page.evaluate(() => window.Theater._occlusionLawForTest.itrOcclusionAnkleHeight(2.4));
    const occInList = greenGeo.pillarList.find((p) => p.x === occCell.x && p.z === occCell.z);
    const ctrlInList = greenGeo.pillarList.find((p) => p.x === ctrlCell.x && p.z === ctrlCell.z);
    const occGhost = greenGeo.pillarGhostList.find((p) => p.x === occCell.x && p.z === occCell.z);
    const ctrlGhost = greenGeo.pillarGhostList.find((p) => p.x === ctrlCell.x && p.z === ctrlCell.z);
    ok(!!occInList && Math.abs(occInList.sy - ankleH) < 1e-6, `GREEN: the OCCLUDING pillar is cut to the ankle height (${ankleH.toFixed(3)}), got sy=${occInList && occInList.sy}`);
    ok(!!occGhost, "GREEN: the OCCLUDING pillar has a matching ghost entry (the removed upper portion is still drawn, ~5% opacity)");
    if (occGhost) {
      ok(Math.abs((occGhost.yBase || 0) - ankleH) < 1e-6, `GREEN: ghost starts exactly at the ankle top (yBase=${occGhost.yBase}) — contiguous with the solid stub, no gap/overlap`);
      ok(Math.abs(((occGhost.yBase || 0) + occGhost.sy) - 2.4) < 1e-6, `GREEN: ghost top + stub reconstruct the FULL original height (${((occGhost.yBase || 0) + occGhost.sy).toFixed(3)} === 2.4) — the column reads as "still there", not gone`);
    }
    ok(!!ctrlInList && Math.abs(ctrlInList.sy - 2.4) < 1e-6, `GREEN: the CONTROL pillar (never on any sightline) stays at its FULL original height, sy=${ctrlInList && ctrlInList.sy} — non-occluding geometry is untouched`);
    ok(!ctrlGhost, "GREEN: the CONTROL pillar has NO ghost entry at all — it was never split");

    // ═══ STAGE-A A4 — DYNAMIC OCCLUSION v2 (docs/STAGE-A.md §A4) ═════════════════════════════════
    const occId = await page.evaluate(({ occCell }) => window.Theater._occlusionIdFor("pillar", occCell.x, occCell.z), { occCell });
    const ctrlId = await page.evaluate(({ ctrlCell }) => window.Theater._occlusionIdFor("pillar", ctrlCell.x, ctrlCell.z), { ctrlCell });

    // ── (a) RAYCAST proof the mini reads THROUGH the faded blocker — a robust, bloom/pixel-noise-
    // immune restatement of the same claim the pixel-color GREEN check above attempts: the SAME real
    // THREE.Raycaster BW2-1b's own GUARD already uses (intersects only the tagged SOLID kinds — a
    // ghost mesh is deliberately tagged kind+"-ghost", excluded from that set) reads OCCLUDED (RED,
    // fade disabled — meshDump.raycastAtSamplePoint above already proved this) vs CLEAR (GREEN, fade
    // enabled) at the EXACT SAME sample point. NOTE (known pre-existing defect, NOT introduced by A4 —
    // verified via `git stash` against master 46289a45 before any A4 edits landed, same failure):
    // the pixel-color "GREEN reads closer to baseline than RED" check just above is RED on unmodified
    // master too (a bloom/no-shadow-ghost interaction makes the un-shadowed ghost material bloom
    // brighter than the plain baseline, even at low opacity) — flagged separately, out of THIS unit's
    // scope to fix. The raycast proof below is the mechanism's own ground truth and is unaffected by it.
    group("A4-1 — RAYCAST (bloom-immune): the mini reads THROUGH the faded blocker");
    const greenRaycast = await page.evaluate((sp) => window.Theater._interiorRaycastClearForTest(sp), samplePoint);
    ok(!!meshDump.raycastAtSamplePoint && meshDump.raycastAtSamplePoint.clear === false, `RED-FIRST (re-stated): with fade disabled, the raycast at the sample point is BLOCKED — ${JSON.stringify(meshDump.raycastAtSamplePoint)}`);
    ok(!!greenRaycast && greenRaycast.clear === true, `GREEN: with fade enabled, the SAME raycast at the SAME sample point is CLEAR (the ghost mesh is tagged "pillar-ghost", excluded from the solid hit-test) — ${JSON.stringify(greenRaycast)}`);

    // ── (b) ONLY the blocking instance fades — non-blockers stay untouched, proven at the MATERIAL
    // level (not just the instance-descriptor level checks above): the occluding pillar's own live
    // ghost material(s) read the named upper-opacity const; the control pillar (never on any sightline)
    // was never classified as blocking at all — no fade-state entry, no material.
    group("A4-2 — ONLY the blocking instance fades (material-level proof)");
    const occOpacity = await page.evaluate((id) => window.Theater._occlusionGhostMaterialOpacityForTest(id), occId);
    const occEntry = await page.evaluate((id) => window.Theater._occlusionFadeEntryForTest(id), occId);
    const ctrlEntry = await page.evaluate((id) => window.Theater._occlusionFadeEntryForTest(id), ctrlId);
    const upperOpacity = await page.evaluate(() => window.Theater._occlusionLawForTest.ITR_OCCLUSION_UPPER_OPACITY);
    ok(!!occEntry && occEntry.blocking === true, `the OCCLUDING pillar's own fade-state entry reads blocking:true — ${JSON.stringify(occEntry)}`);
    ok(Array.isArray(occOpacity) && occOpacity.length > 0 && occOpacity.every((v) => Math.abs(v - upperOpacity) < 1e-3), `the OCCLUDING pillar's LIVE ghost material opacity settled at the named upper-opacity const (${upperOpacity}) — got ${JSON.stringify(occOpacity)}`);
    ok(!ctrlEntry || ctrlEntry.blocking === false, `the CONTROL pillar (never on any sightline) was never classified as blocking — ${JSON.stringify(ctrlEntry)}`);
    const ctrlOpacity = await page.evaluate((id) => window.Theater._occlusionGhostMaterialOpacityForTest(id), ctrlId);
    ok(ctrlOpacity === null, `the CONTROL pillar has NO live ghost material at all (never split, never faded) — got ${JSON.stringify(ctrlOpacity)}`);

    // ── (c) the fade TWEENS — fake-clock start(t=0)/mid(t~0.5)/end(t=1) are genuinely DISTINCT (a
    // real interpolation, not a step function). Same fake-clock convention dev/verify-mf1-camera-
    // tweens.mjs's own setFakeNowAndTick establishes: freeze Date.now() BEFORE the state-changing call
    // (so the tween's own `start` timestamp is a KNOWN fake value), then pump exactly one real
    // animation-frame pair per sample so the SAME tickTweens/rAF loop the live app runs reads the
    // frozen clock at each of the three probe times. A genuinely FRESH board object (never seen by
    // S.occlusionFadeState before) guarantees a first-ever classify -> a brand-new tween, not a
    // retarget of the already-settled GREEN tween above.
    group("A4-3 — TWEEN fake-clock math: start(t=0) / mid(t~0.5) / end(t=1) are distinct, converging to the upper-opacity target");
    await page.evaluate(() => { window.__a4RealDateNow = Date.now.bind(Date); });
    const durIn = await page.evaluate(() => window.Theater._occlusionLawForTest.ITR_OCCLUSION_FADE_IN_MS);
    ok(typeof durIn === "number" && durIn >= 120 && durIn <= 180, `fade-IN duration ${durIn}ms is inside the 120-180ms band`);
    const freshBoardSrc = buildHandBoardSrc();
    const t0Fake = 5000000;
    await page.evaluate((v) => { window.Date.now = () => v; }, t0Fake);
    const freshOccId = await page.evaluate(({ boardSrc, figCell, slug, occCell, ctrlCell, occSize }) => {
      window.Theater._setOcclusionFadeDisabledForTest(false);
      const buildBoard = new Function(boardSrc);
      const board = buildBoard();
      board.pieces = [{ slug, cellX: figCell.x, cellY: figCell.z }];
      board.cameraFit = { mode: "beat", cells: [{ x: figCell.x, y: figCell.z }] };
      board.instances.pillar = [{ x: occCell.x, z: occCell.z, sx: occSize, sy: 2.4, sz: occSize, color: "#ff0000" }];
      window.__a4FreshBoard = board;
      window.Theater.setInteriorBoard(board);
      return window.Theater._occlusionIdFor("pillar", occCell.x, occCell.z);
    }, { boardSrc: freshBoardSrc, figCell: FIG_CELL, slug: FIGURE_SLUG, occCell, ctrlCell, occSize: OCC_HALF_EXTENT * 2 });
    const t0Entry = await page.evaluate((id) => window.Theater._occlusionFadeEntryForTest(id), freshOccId);
    ok(!!t0Entry && t0Entry.blocking === true, `t=0: the fresh occluder is classified blocking the instant the fit fires (immediately after mount, before any tween tick) — ${JSON.stringify(t0Entry)}`);
    ok(Math.abs(t0Entry.opacity - 1) < 1e-3, `t=0: opacity is STILL the pre-tween start value (1, fully opaque) — no tick has run yet — got ${t0Entry.opacity}`);
    await page.evaluate((v) => { window.Date.now = () => v; }, t0Fake + Math.round(durIn * 0.5));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const midEntry = await page.evaluate((id) => window.Theater._occlusionFadeEntryForTest(id), freshOccId);
    await page.evaluate((v) => { window.Date.now = () => v; }, t0Fake + durIn + 50);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const endEntry = await page.evaluate((id) => window.Theater._occlusionFadeEntryForTest(id), freshOccId);
    ok(!!midEntry, `mid-tween entry read (${JSON.stringify(midEntry)})`);
    ok(!!endEntry, `end-tween entry read (${JSON.stringify(endEntry)})`);
    if (midEntry && endEntry) {
      ok(midEntry.opacity < 1 - 1e-3 && midEntry.opacity > endEntry.opacity + 1e-3, `t~0.5: opacity (${midEntry.opacity}) is strictly BETWEEN start (1) and end (${endEntry.opacity}) — a real interpolation, not a step function`);
      ok(Math.abs(endEntry.opacity - upperOpacity) < 1e-3, `t=1: opacity has converged to the named upper-opacity target (${upperOpacity}) — got ${endEntry.opacity}`);
    }
    await page.evaluate(() => { window.Date.now = window.__a4RealDateNow || Date.now; });

    // ── (d) RECLASSIFY HYSTERESIS — holds under a small camera move (no re-flicker), proven two ways:
    // (i) the PURE decision function directly (the product's own camera only ever moves in discrete
    // 90-degree rotate() steps or full ShotPlan re-composes — see itrOcclusionNextCommitted's own
    // header for why the pure math is the more direct proof surface for a genuinely SMALL delta); and
    // (ii) a LIVE integration check: a same-object replay with the camera bearing UNCHANGED never
    // disturbs the already-settled fade (no new tween, opacity untouched), while a replay after a real
    // rotate() (a 90-degree move, far past the hysteresis band) DOES re-anchor the bearing.
    group("A4-4 — RECLASSIFY HYSTERESIS: pure math");
    const law = await page.evaluate(() => {
      const L = window.Theater._occlusionLawForTest;
      return {
        heldOnset: L.itrOcclusionNextCommitted(true, false, true, true),   // was NOT blocking, camera barely moved, geometry now says yes -> held false
        heldOffset: L.itrOcclusionNextCommitted(false, true, true, true),  // WAS blocking, camera barely moved, geometry now says no -> held true
        freshTakesRaw: L.itrOcclusionNextCommitted(true, false, false, true), // never classified before -> raw wins even though holdPrior=true
        noHoldTakesRaw: L.itrOcclusionNextCommitted(false, true, true, false), // holdPrior=false -> always raw
        smallDelta: L.itrOcclusionBearingDeltaDeg(10, 12),
        largeDelta: L.itrOcclusionBearingDeltaDeg(10, 95),
        wrapDelta: L.itrOcclusionBearingDeltaDeg(179, -179),
      };
    });
    ok(law.heldOnset === false, `a blocker that just STARTED geometrically occluding is HELD at its prior (not-blocking) state under a small-move hold — got ${law.heldOnset}`);
    ok(law.heldOffset === true, `a blocker that just STOPPED geometrically occluding is HELD at its prior (blocking) state under a small-move hold — got ${law.heldOffset} (this is the no-flicker guarantee itself)`);
    ok(law.freshTakesRaw === true, `a brand-new (never-classified) id ignores the hold and takes the raw result — got ${law.freshTakesRaw}`);
    ok(law.noHoldTakesRaw === false, `with holdPrior=false, the raw result always wins regardless of the prior commitment — got ${law.noHoldTakesRaw}`);
    ok(law.smallDelta < 3, `a 2-degree bearing delta (${law.smallDelta}) is BELOW the 2-4deg hysteresis band`);
    ok(law.largeDelta >= 3, `an 85-degree bearing delta (${law.largeDelta}) is ABOVE the hysteresis band`);
    ok(Math.abs(law.wrapDelta - 2) < 1e-6, `bearing wrap-around: 179 vs -179 is a genuine 2-degree delta (${law.wrapDelta}), never the naive 358`);

    group("A4-5 — RECLASSIFY HYSTERESIS: live integration (same-object replay never flickers; a real rotate DOES re-anchor)");
    const beforeReplay = await page.evaluate((id) => window.Theater._occlusionFadeEntryForTest(id), freshOccId);
    const bearingBefore = await page.evaluate(() => window.Theater._occlusionBearingForTest());
    await page.evaluate(() => window.Theater.setInteriorVariant({})); // same-object replay — camera bearing unchanged
    await settleCameraTween(page);
    const afterSameBearingReplay = await page.evaluate((id) => window.Theater._occlusionFadeEntryForTest(id), freshOccId);
    const bearingAfterHold = await page.evaluate(() => window.Theater._occlusionBearingForTest());
    ok(!!beforeReplay && !!afterSameBearingReplay && Math.abs(beforeReplay.opacity - afterSameBearingReplay.opacity) < 1e-6 && beforeReplay.blocking === afterSameBearingReplay.blocking, `a same-object replay with the camera bearing UNCHANGED (delta ${Math.abs((bearingAfterHold.camera||0) - (bearingBefore.camera||0)).toFixed(3)} deg) never disturbs the already-settled fade — before ${JSON.stringify(beforeReplay)}, after ${JSON.stringify(afterSameBearingReplay)}`);
    await page.evaluate(() => window.Theater.rotate());
    await page.evaluate(() => window.Theater.setInteriorVariant({}));
    await settleCameraTween(page);
    const bearingAfterRotate = await page.evaluate(() => window.Theater._occlusionBearingForTest());
    ok(bearingAfterRotate.anchor !== bearingAfterHold.anchor, `a real 90-degree rotate() DOES move the camera bearing far enough to re-anchor the hysteresis (before ${bearingAfterHold.anchor}, after ${bearingAfterRotate.anchor})`);

    // fps gate — measured on the GREEN (fade-active) scene.
    group("PERFORMANCE — fps with the fade active");
    const fpsResult = await page.evaluate(() => window.Theater.measureRenderFps(60));
    ok(!!fpsResult && fpsResult.fps >= 30, `fps with occlusion fade active: ${fpsResult && fpsResult.fps.toFixed(1)} (>= 30 required) — ${JSON.stringify(fpsResult)}`);

    console.log(`\nCaptures written to ${outDir}: baseline.png, red-occluded.png, green-through.png`);
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail > 0 ? 1 : 0;
  } catch (e) {
    console.error("FAILED:", e.message, e.stack);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}
main();
