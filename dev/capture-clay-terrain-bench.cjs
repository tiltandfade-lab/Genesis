/* CL-F07a / CL-F08a capture rig — rung-1 terrain plus the authored feature book.

   Production renderer only: genesis.html + the real ?clayroom=1 mount + the real CL-F07/CL-F08
   fixtures.
   This rig never draws terrain, never sets a height, and never declares a visual verdict — it
   drives the page, banks frames, and writes a receipt. Judgement is Adam's and Codex's.

   Every scene banks FOUR frames, because §4.2 condition 1 makes terrain's camera pair mandatory:
   a height difference can read as a texture change at a low pitch, so a piece legible in only one
   of the two is not built.
     -01-early-production   right after mount, fixed production camera
     -02-settled-production the same frame after every async rebuild (the CR-1 settle timeline)
     -03-settled-strategic  the governed 72-degree map-reading pitch, same bearing/pan/target
     -04-clean-production   settled, diagnostic panel hidden, so nothing is framed behind chrome

   Usage (a server must already be serving THIS worktree):
     node dev/capture-clay-terrain-bench.cjs <outDir> [port] [sceneId|all]
*/
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

/* R2 (2026-07-28) — named flags for the variants Adam's rulings created. Positional args are kept
   byte-compatible so every existing invocation banks exactly what it always did; grade, overhang
   mode and skirt depth are opt-in and are RECORDED IN THE RECEIPT, so a frame can never be
   mislabelled as a variant it did not render. */
const FLAGS = {};
process.argv.slice(2).forEach((a) => {
  const m = /^--([a-z]+)=(.*)$/.exec(a);
  if (m) FLAGS[m[1]] = m[2];
});
const POS = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const OUT = POS[0];
const PORT = POS[1] || "5176";
const ONLY = POS[2] || "all";
/* TERRAIN-EXPRESSION §5 — an explicit rung remains one rung per run, over an otherwise identical
   field: same seed, same camera, same layout. When omitted, each scene uses its production default:
   the seven CL-F07 bin-isolation scenes remain `naked`; authored feature maps use `all`, because a
   feature proof is a picture of the battlefield rather than the box-per-cell control. */
const RUNG_OVERRIDE = FLAGS.rung || POS[3] || null;
const PROBE = FLAGS.probe || POS[4] || null;
const SEED = FLAGS.seed || POS[5] || null;
const GRADE = FLAGS.grade || null;
const OVERHANG = FLAGS.overhang || null;
const SKIRT = FLAGS.skirt != null ? FLAGS.skirt : null;
const ARCH_VARIANT = FLAGS.archvariant || null;
const GUARD_PROFILE = FLAGS.guardprofile || null;
const GROUND_REPEAT = FLAGS.groundrepeat == null ? null : Number(FLAGS.groundrepeat);
const GROUND_CANDIDATE = FLAGS.groundcandidate || null;
const MASONRY_CANDIDATE = FLAGS.masonrycandidate || null;
const CONDITION_CANDIDATE = FLAGS.conditioncandidate || null;
const PARTY_PROOF = FLAGS.partyproof || null;
const HIDE_ARCH = FLAGS.hidearch
  ? FLAGS.hidearch.split(",").map((value) => value.trim()).filter(Boolean) : [];
const SPRITE_EXTRUSION = FLAGS.spriteextrusion || null;
const CLOSEUP_ZOOM = FLAGS.closeupzoom == null ? null : Number(FLAGS.closeupzoom);
const CLOSEUP_FOCUS = FLAGS.closeupfocus || null;
const TURN = FLAGS.turn == null ? null : (((Number(FLAGS.turn) | 0) % 4 + 4) % 4);
if (!OUT) { console.error("usage: node dev/capture-clay-terrain-bench.cjs <outDir> [port] [sceneId|all] [rung] [probe] [seed] [--grade=g0..g4] [--overhang=rule|universal|none] [--skirt=<wu>] [--turn=0..3] [--archvariant=bounded|growth] [--guardprofile=institutional-frontier|upland-vernacular|neutral-clay] [--groundcandidate=v010|v011|v016|v017|v018] [--masonrycandidate=v010|v015] [--conditioncandidate=v013|v015] [--partyproof=32ppf] [--hidearch=<member-prefix,...>] [--spriteextrusion=1|0] [--closeupzoom=0.12..2.5] [--closeupfocus=architecture]"); process.exit(2); }
if (CLOSEUP_ZOOM != null && (!Number.isFinite(CLOSEUP_ZOOM)
  || CLOSEUP_ZOOM < 0.12 || CLOSEUP_ZOOM > 2.5)) {
  console.error("--closeupzoom must be within the governed Clayroom range 0.12..2.5");
  process.exit(2);
}
if (GROUND_REPEAT != null && [4.95, 6.6, 8.25, 9.9].indexOf(GROUND_REPEAT) < 0) {
  console.error("--groundrepeat must be one of 4.95, 6.6, 8.25, or 9.9 metres");
  process.exit(2);
}
if (GROUND_CANDIDATE != null
    && ["v010", "v011", "v016", "v017", "v018"].indexOf(GROUND_CANDIDATE) < 0) {
  console.error("--groundcandidate must be v010, v011, v016, v017, or v018");
  process.exit(2);
}
if (MASONRY_CANDIDATE != null && ["v010", "v015"].indexOf(MASONRY_CANDIDATE) < 0) {
  console.error("--masonrycandidate must be v010 or v015");
  process.exit(2);
}
if (CONDITION_CANDIDATE != null && ["v013", "v015"].indexOf(CONDITION_CANDIDATE) < 0) {
  console.error("--conditioncandidate must be v013 or v015");
  process.exit(2);
}
if (PARTY_PROOF != null && PARTY_PROOF !== "32ppf") {
  console.error("--partyproof must be 32ppf");
  process.exit(2);
}
if (CLOSEUP_FOCUS != null && CLOSEUP_FOCUS !== "architecture") {
  console.error("--closeupfocus must be architecture");
  process.exit(2);
}
const BASE = "http://127.0.0.1:" + PORT;
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };
const SCENES = [
  { id: "thirteen-piece-sheet", capture: 1, light: null },
  { id: "one-clamp-proof",      capture: 2, light: null },
  { id: "boundary-sheet",       capture: 3, light: null, frames: 6 },
  { id: "route-proof",          capture: 4, light: null },
  { id: "walk-down-16",         capture: 5, light: null },
  { id: "support-graph",        capture: 6, light: null },
  { id: "dark",                 capture: 7, light: "dark" },
  { id: "authored-feature-book",capture: 8, light: null, frames: 8 },
  { id: "defensive-ridgeworks", capture: 9, light: null },
  { id: "defensive-gateworks",  capture: 10, light: null },
  { id: "fft-hillside-proof",   capture: 11, light: null },
  { id: "fft-reverse-ridge-proof", capture: 12, light: null },
  { id: "fft-ravine-crossing-proof", capture: 13, light: null },
  { id: "fft-terraced-bluff-proof", capture: 14, light: null },
  { id: "fft-earthwork-breach-proof", capture: 15, light: null },
  { id: "gv-w2-guard-post-day", capture: 16, light: null },
  { id: "gv-w2-guard-post-night", capture: 17, light: "moonlit" },
  { id: "arch-af01-road-checkpoint", capture: 18, light: null },
  { id: "arch-af02-roadside-shelter", capture: 19, light: null },
  { id: "arch-af03-embedded-guardroom", capture: 20, light: null },
  { id: "arch-af04-workshop-shed", capture: 21, light: null },
  { id: "arch-af05-courtyard-range", capture: 22, light: null },
  { id: "arch-af06-market-hall", capture: 23, light: null },
  { id: "arch-af07-gatehouse", capture: 24, light: null },
  { id: "arch-af08-watchtower-ruin", capture: 25, light: null },
  { id: "arch-af09-party-wall-frontage", capture: 26, light: null },
  { id: "arch-af10-keeper-cell-block", capture: 27, light: null },
  { id: "arch-af11-shaft-head-hoist", capture: 28, light: null },
  { id: "arch-af12-terraced-commune", capture: 29, light: null },
  { id: "arch-af13-bridgehouse-waterwork", capture: 30, light: null },
  { id: "arch-af14-inn-manor-hip", capture: 31, light: null },
  { id: "arch-af15-hillside-stair-street", capture: 32, light: null },
  { id: "arch-af16-great-hall", capture: 33, light: null },
  { id: "arch-af17-sanctuary-nave", capture: 34, light: null },
  { id: "arch-af18-palace-processional-court", capture: 35, light: null },
  { id: "arch-af19-arcane-civic-aqueduct", capture: 36, light: null },
  { id: "arch-af20-star-archive-rotunda", capture: 37, light: null },
  { id: "arch-af21-grand-concourse-corner", capture: 38, light: null },
  { id: "arch-af22-market-hillside-precinct", capture: 39, light: null }
];
const FEATURE_SCENE_IDS = new Set([
  "authored-feature-book", "defensive-ridgeworks", "defensive-gateworks", "fft-hillside-proof",
  "fft-reverse-ridge-proof", "fft-ravine-crossing-proof", "fft-terraced-bluff-proof",
  "fft-earthwork-breach-proof", "gv-w2-guard-post-day", "gv-w2-guard-post-night",
  "arch-af01-road-checkpoint", "arch-af02-roadside-shelter",
  "arch-af03-embedded-guardroom", "arch-af04-workshop-shed",
  "arch-af05-courtyard-range", "arch-af06-market-hall",
  "arch-af07-gatehouse", "arch-af08-watchtower-ruin",
  "arch-af09-party-wall-frontage", "arch-af10-keeper-cell-block",
  "arch-af11-shaft-head-hoist", "arch-af12-terraced-commune",
  "arch-af13-bridgehouse-waterwork", "arch-af14-inn-manor-hip",
  "arch-af15-hillside-stair-street", "arch-af16-great-hall",
  "arch-af17-sanctuary-nave", "arch-af18-palace-processional-court",
  "arch-af19-arcane-civic-aqueduct", "arch-af20-star-archive-rotunda",
  "arch-af21-grand-concourse-corner", "arch-af22-market-hillside-precinct"
]);
function rungForScene(sceneId){
  return RUNG_OVERRIDE || (FEATURE_SCENE_IDS.has(sceneId) ? "all" : "naked");
}

function pageProbe() {
  const T = window.Theater || {};
  const terrain = T._clayTerrainBenchForTest ? T._clayTerrainBenchForTest() : null;
  const canvas = document.querySelector("canvas");
  return {
    terrain: terrain,
    fixture: (typeof CL_F07_TERRAIN_BENCH !== "undefined")
      ? { id: CL_F07_TERRAIN_BENCH.id, version: CL_F07_TERRAIN_BENCH.version,
          status: CL_F07_TERRAIN_BENCH.status, question: CL_F07_TERRAIN_BENCH.question,
          sourceRows: CL_F07_TERRAIN_BENCH.sourceRows,
          sheetField: CL_F07_TERRAIN_BENCH.sheetField, medianTray: CL_F07_TERRAIN_BENCH.medianTray }
      : null,
    featureBook: (typeof CL_F08_TERRAIN_FEATURE_BOOK !== "undefined")
      ? { id: CL_F08_TERRAIN_FEATURE_BOOK.id, version: CL_F08_TERRAIN_FEATURE_BOOK.version,
          status: CL_F08_TERRAIN_FEATURE_BOOK.status, question: CL_F08_TERRAIN_FEATURE_BOOK.question,
          proof: CL_F08_TERRAIN_FEATURE_BOOK.proof,
          featureIds: CL_F08_TERRAIN_FEATURE_BOOK.featureIds,
          sources: CL_F08_TERRAIN_FEATURE_BOOK.sources }
      : null,
    goldenVignette: (typeof GOLDEN_VIGNETTE_WAVE2_FIXTURE !== "undefined")
      ? { id: GOLDEN_VIGNETTE_WAVE2_FIXTURE.id, version: GOLDEN_VIGNETTE_WAVE2_FIXTURE.version,
          status: GOLDEN_VIGNETTE_WAVE2_FIXTURE.status,
          question: GOLDEN_VIGNETTE_WAVE2_FIXTURE.question,
          proof: GOLDEN_VIGNETTE_WAVE2_FIXTURE.proof }
      : null,
    architectureFixture: (typeof ARCHITECTURE_FORM_PROOF_FIXTURE !== "undefined")
      ? { id: ARCHITECTURE_FORM_PROOF_FIXTURE.id,
          version: ARCHITECTURE_FORM_PROOF_FIXTURE.version,
          status: ARCHITECTURE_FORM_PROOF_FIXTURE.status,
          question: ARCHITECTURE_FORM_PROOF_FIXTURE.question,
          sceneIds: ARCHITECTURE_FORM_SCENE_IDS,
          promotionCensus: (typeof ARCHITECTURE_ASSET_PROMOTION_CENSUS !== "undefined")
            ? ARCHITECTURE_ASSET_PROMOTION_CENSUS : null }
      : null,
    /* The parameter sets and construction sentences that produced this exact frame — so the
       receipt carries the CLAIM beside the picture and Adam can check one against the other. */
    presets: (typeof TERRAIN_R1_PRESETS !== "undefined")
      ? Object.keys(TERRAIN_R1_PRESETS).map(function(k){
          return { pieceId: k, name: TERRAIN_R1_PRESETS[k].name,
            adamNamed: TERRAIN_R1_PRESETS[k].adamNamed,
            construction: TERRAIN_R1_PRESETS[k].construction,
            tacticalRole: TERRAIN_R1_PRESETS[k].tacticalRole,
            morphParams: TERRAIN_R1_PRESETS[k].morphParams };
        })
      : null,
    camera: T._clayCameraPoseForTest ? T._clayCameraPoseForTest() : null,
    postSuite: T._postSuiteForTest ? T._postSuiteForTest() : null,
    /* THE WITNESS FACING + CONTACT INSTRUMENT, read LIVE after the render pass. Before
       TERRAIN-EXPRESSION §1 P1 the terrain witnesses never billboarded at all (13 of 13 at 44.6-52.0
       degrees of facing error), so every banked terrain proof had exercised only the easy
       axis-aligned plinth yaw. This is what makes that countable rather than something a reviewer
       has to spot in a 2x crop — and it carries the NEAREST-CONTACT GAP under each plinth's
       footprint, which is the measurement WITNESS_MAX_GAP could never make. */
    witnessFacing: T._clayTerrainWitnessFacingForTest ? T._clayTerrainWitnessFacingForTest() : null,
    surfaceCensus: T._claySurfaceCensusForTest ? T._claySurfaceCensusForTest() : null,
    traversabilityGrid: T._clayTraversabilityGridForTest ? T._clayTraversabilityGridForTest() : null,
    lightRecipe: T._clayLightingRecipeForTest ? T._clayLightingRecipeForTest() : null,
    lightingProof: T._clayLightingProofForTest ? T._clayLightingProofForTest() : null,
    shadowContact: T._clayShadowContactForTest ? T._clayShadowContactForTest() : null,
    spriteShadowState: T._spriteShadowStateForTest ? T._spriteShadowStateForTest() : null,
    renderer: canvas ? { width: canvas.width, height: canvas.height,
      dpr: window.devicePixelRatio, style: canvas.getAttribute("style") } : null,
    /* Meshes actually placed, counted off the LIVE scene rather than off the spec — a receipt that
       reports what it intended to build is not a receipt. */
    placed: (function(){
      const counts = { cells: 0, water: 0, volumes: 0, spans: 0, overlays: 0, witnesses: 0,
        defenseStructures: 0, architectureMembers: 0, architectureAssets: 0,
        architectureAssetParts: 0 };
      const S = T._clayInteriorGroupForTest ? T._clayInteriorGroupForTest() : null;
      if (!S || !S.traverse) return Object.assign({ measured: false }, counts);
      S.traverse(function(node){
        const ud = node.userData || {};
        let inArchitectureAsset = false, cur = node;
        while (cur) {
          if (cur.userData && cur.userData.clayArchitectureAsset) inArchitectureAsset = true;
          cur = cur.parent;
        }
        if (ud.terrainCell) counts.cells++;
        else if (ud.terrainWater) counts.water++;
        else if (ud.terrainVolume) counts.volumes++;
        else if (ud.terrainSpan) counts.spans++;
        else if (ud.terrainDefenseStructure) counts.defenseStructures++;
        else if (ud.clayArchitectureMember) counts.architectureMembers++;
        else if (ud.clayArchitectureAsset) counts.architectureAssets++;
        else if (inArchitectureAsset && node.isMesh) counts.architectureAssetParts++;
        else if (ud.terrainSupportCell || ud.terrainRoute) counts.overlays++;
        else if (ud.clayTerrainWitness) counts.witnesses++;
      });
      return Object.assign({ measured: true }, counts);
    })()
  };
}

/* Hide the bench, bank the empty frame, put it back. Visibility only — the group is never
   detached, and the restore is asserted by the very next probe still reporting its cells. */
async function plate(page, filename) {
  const hidden = await page.evaluate(() =>
    window.Theater._clayTerrainSetBenchVisibleForTest
      ? window.Theater._clayTerrainSetBenchVisibleForTest(false) : false);
  await new Promise((r) => setTimeout(r, 450));
  await page.screenshot({ path: path.join(OUT, filename) });
  await page.evaluate(() => {
    if (window.Theater._clayTerrainSetBenchVisibleForTest) {
      window.Theater._clayTerrainSetBenchVisibleForTest(true);
    }
  });
  await new Promise((r) => setTimeout(r, 450));
  return hidden;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: VIEWPORT,
  });

  const featureOnly = ONLY !== "all" && FEATURE_SCENE_IDS.has(ONLY);
  const index = {
    fixture: featureOnly ? "cl-f08-terrain-feature-book"
      : (ONLY === "all" ? "cl-f07-terrain-bench + cl-f08-terrain-feature-book"
        : "cl-f07-terrain-bench"),
    proof: featureOnly ? "CL-F08a" : (ONLY === "all" ? "CL-F07a + CL-F08a" : "CL-F07a"),
    captures: [],
    determinism: null, gate: null,
    rung: RUNG_OVERRIDE || "scene-default",
    rungPolicy: RUNG_OVERRIDE ? "explicit override" : "CL-F07 diagnostics=naked; authored features=all",
    probe: PROBE, seed: SEED,
    grade: GRADE, overhang: OVERHANG, skirt: SKIRT, quarterTurn: TURN,
    architectureVariant: ARCH_VARIANT, guardVisualProfile: GUARD_PROFILE,
    generatedAt: new Date().toISOString(), viewport: VIEWPORT };

  async function openScene(scene) {
    const sceneRung = rungForScene(scene.id);
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (r) => {
      if (new URL(r.url()).pathname === "/favicon.ico") r.respond({ status: 204 });
      else r.continue();
    });
    const consoleErrors = [], consoleWarnings = [], failedResponses = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
      else if (m.type() === "warning" || m.type() === "warn") consoleWarnings.push(m.text());
    });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedResponses.push({ status: response.status(), url: response.url() });
      }
    });
    const url = BASE + "/genesis.html?clayroom=1&clayfixture=terrain&terrainscene=" + scene.id
      + (scene.frameIndex != null ? "&terrainframe=" + scene.frameIndex : "")
      /* When no override was requested, omit the parameter and exercise the product default. The
         rig still carries the expected answer beside the live receipt, and a mismatch is NOT BUILT. */
      + (RUNG_OVERRIDE ? "&terrainrung=" + sceneRung : "")
      + (PROBE ? "&terrainprobe=" + PROBE : "")
      + (SEED ? "&terrainseed=" + SEED : "")
      + (GRADE ? "&terraingrade=" + GRADE : "")
      + (OVERHANG ? "&terrainoverhang=" + OVERHANG : "")
      + (SKIRT != null ? "&terrainskirt=" + SKIRT : "")
      + (ARCH_VARIANT ? "&architecturevariant=" + encodeURIComponent(ARCH_VARIANT) : "")
      + (GUARD_PROFILE ? "&guardprofile=" + encodeURIComponent(GUARD_PROFILE) : "")
      + (GROUND_REPEAT != null ? "&guardgroundrepeat=" + GROUND_REPEAT : "")
      + (GROUND_CANDIDATE ? "&guardgroundcandidate=" + encodeURIComponent(GROUND_CANDIDATE) : "")
      + (MASONRY_CANDIDATE
        ? "&guardmasonrycandidate=" + encodeURIComponent(MASONRY_CANDIDATE) : "")
      + (CONDITION_CANDIDATE
        ? "&guardconditioncandidate=" + encodeURIComponent(CONDITION_CANDIDATE) : "")
      + (PARTY_PROOF ? "&guardpartyproof=" + encodeURIComponent(PARTY_PROOF) : "")
      + (SPRITE_EXTRUSION ? "&spriteextrusion=" + encodeURIComponent(SPRITE_EXTRUSION) : "")
      + (TURN != null ? "&terrainturn=" + TURN : "");
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(
      () => document.querySelector("canvas") && document.getElementById("clay-room-overlay"),
      { timeout: 30000 });
    if (scene.light) {
      await page.evaluate((id) => {
        if (window.Theater && window.Theater._claySetLightingRecipeForTest) {
          window.Theater._claySetLightingRecipeForTest(id);
        }
      }, scene.light);
      await new Promise((r) => setTimeout(r, 400));
    }
    return { page, consoleErrors, consoleWarnings, failedResponses, sceneRung };
  }

  /* A multi-frame scene expands into one capture per frame. §4.3 capture 3 is literally "Six
     frames, one layout" — the six boundary strings on the SAME 60x80 kidney, each in its own frame,
     because six fields in one frame is a strip no governed camera can read. */
  const RUNS = [];
  SCENES.forEach((s) => {
    if (s.frames) {
      for (let i = 0; i < s.frames; i++) RUNS.push(Object.assign({}, s, { frameIndex: i }));
    } else RUNS.push(s);
  });

  for (const scene of RUNS) {
    if (ONLY !== "all" && ONLY !== scene.id) continue;
    const label = String(scene.capture).padStart(2, "0") + "-" + scene.id
      + (scene.frameIndex != null ? "-f" + scene.frameIndex : "")
      + (TURN != null ? "-q" + TURN : "");
    process.stdout.write("capture " + label + " ... ");
    let opened;
    try { opened = await openScene(scene); }
    catch (e) { console.log("FAILED to open:", e.message); continue; }
    const { page, consoleErrors, consoleWarnings, failedResponses, sceneRung } = opened;

    const architectureIsolation = HIDE_ARCH.length ? await page.evaluate((prefixes) => {
      const T = window.Theater || {};
      const group = T._clayInteriorGroupForTest ? T._clayInteriorGroupForTest() : null;
      const hiddenMemberIds = [];
      if (!group || !group.traverse) {
        return { applied: false, prefixes: prefixes, hiddenMemberIds: hiddenMemberIds };
      }
      group.traverse((node) => {
        const member = node.userData && node.userData.clayArchitectureMember;
        if (!member || !prefixes.some((prefix) => member.id.startsWith(prefix))) return;
        node.visible = false;
        hiddenMemberIds.push(member.id);
      });
      return {
        applied: true,
        prefixes: prefixes,
        hiddenMemberIds: hiddenMemberIds.sort()
      };
    }, HIDE_ARCH) : { applied: false, prefixes: [], hiddenMemberIds: [] };

    await new Promise((r) => setTimeout(r, 900));
    const early = await page.evaluate(pageProbe);
    await page.screenshot({ path: path.join(OUT, label + "-01-early-production.png") });

    await new Promise((r) => setTimeout(r, 4500));
    const settled = await page.evaluate(pageProbe);
    await page.screenshot({ path: path.join(OUT, label + "-02-settled-production.png") });

    /* FOUR CANONICAL BEARINGS, ONE IMMUTABLE MAP. Exercise the shipped production rotate verb
       through the Clayroom seam, make a full cycle, then return to the exact capture bearing.
       This is not a visual verdict; it proves rotation changes only the camera and does so in
       quarter turns, never by mutating or rebuilding terrain under a new view. */
    const quarterTurnGate = await page.evaluate(() => {
      const T = window.Theater || {};
      if(!T._clayTerrainBenchForTest || !T._clayTerrainSetQuarterTurnForTest){
        return { ok: false, reason: "quarter-turn terrain seam missing" };
      }
      const signature = (report) => JSON.stringify((report && report.fields || []).map((field) => ({
        id: field.id, fingerprint: field.fingerprint
      })));
      const start = T._clayTerrainBenchForTest();
      const startTurn = start && start.cameraQuarterTurn ? start.cameraQuarterTurn.step : 0;
      const startSignature = signature(start);
      const samples = [{
        step: startTurn,
        bearingDeg: start && start.cameraQuarterTurn ? start.cameraQuarterTurn.bearingDeg : null,
        signature: startSignature
      }];
      for(let i = 1; i <= 4; i++){
        T._clayTerrainSetQuarterTurnForTest((startTurn + i) % 4);
        const report = T._clayTerrainBenchForTest();
        samples.push({
          step: report.cameraQuarterTurn.step,
          bearingDeg: report.cameraQuarterTurn.bearingDeg,
          signature: signature(report)
        });
      }
      const increments = [];
      for(let i = 1; i < samples.length; i++){
        const delta = ((samples[i].bearingDeg - samples[i - 1].bearingDeg) % 360 + 360) % 360;
        increments.push(Number(delta.toFixed(3)));
      }
      return {
        ok: samples.length === 5
          && samples.every((sample) => sample.signature === startSignature)
          && increments.every((deg) => Math.abs(deg - 90) < 0.01)
          && samples[4].step === startTurn,
        canonicalBearings: 4,
        startStep: startTurn,
        samples: samples.map((sample) => ({
          step: sample.step, bearingDeg: sample.bearingDeg
        })),
        incrementsDeg: increments,
        topologyInvariant: samples.every((sample) => sample.signature === startSignature),
        returnedToStart: samples[4].step === startTurn
      };
    });
    await new Promise((r) => setTimeout(r, 500));

    /* THE 72-DEGREE STRATEGIC READ — the second half of the mandatory camera pair. */
    const strategic = await page.evaluate(() => {
      if (window.Theater && window.Theater._clayTerrainSetViewForTest) {
        return !!window.Theater._clayTerrainSetViewForTest("strategic");
      }
      return false;
    });
    await new Promise((r) => setTimeout(r, 900));
    const strategicProbe = await page.evaluate(pageProbe);
    await page.screenshot({ path: path.join(OUT, label + "-03-settled-strategic.png") });
    /* BACKDROP PLATE at the strategic pose — see the production plate below. */
    await plate(page, label + "-05-strategic-backdrop-plate.png");
    await page.evaluate(() => {
      if (window.Theater && window.Theater._clayTerrainSetViewForTest) {
        window.Theater._clayTerrainSetViewForTest("production");
      }
    });
    await new Promise((r) => setTimeout(r, 600));

    /* Panel hidden, so nothing in the frame is judged from behind chrome (Adam's 2026-07-23 note). */
    await page.evaluate(() => {
      if (window.Theater && window.Theater._clayTerrainClearSelectionForTest) {
        window.Theater._clayTerrainClearSelectionForTest();
      }
      ["clay-room-overlay", "clay-room-workbench-topbar", "clay-room-workbench-catalog",
       "clay-room-workbench-scene"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
      });
      /* Hiding docked chrome can change the canvas CSS box without generating a browser resize.
         Force the production renderer's resize listener to reconcile its drawing buffer before
         banking canvas-only evidence; otherwise a newly exposed strip can remain unrendered. */
      window.dispatchEvent(new Event("resize"));
    });
    await new Promise((r) => setTimeout(r, 500));
    /* Probed AGAIN after the chrome is hidden, because hiding the docked panels re-lays out the
       canvas: the clean frame is the one the pixel-coverage gate reads (nothing in it can be behind
       a panel), so it must carry its OWN camera projection and canvas rect, not the settled one. */
    const clean = await page.evaluate(pageProbe);
    await page.screenshot({ path: path.join(OUT, label + "-04-clean-production.png") });
    const canvas = await page.$("canvas");
    if (canvas) {
      await canvas.screenshot({ path: path.join(OUT, label + "-04b-beauty-canvas.png") });
    }
    /* Optional art-review crop. It uses the existing governed camera dolly—same target, bearing,
       and pitch—and is banked in addition to the measurement frame. Restore the exact clean pose
       before making the production backdrop plate, so the pixel-coverage proof remains honest. */
    let closeup = null;
    if (CLOSEUP_ZOOM != null) {
      closeup = await page.evaluate(({ requestedZoom, partyProof, closeupFocus }) => {
        const T = window.Theater || {};
        if (!T._clayCamPoseForTest || !T._clayCamPoseSetForTest) return null;
        const before = T._clayCamPoseForTest();
        let resolvedOffset = before.offset;
        let focusReceipt = null;
        if (closeupFocus === "architecture" && T._clayInteriorGroupForTest) {
          const root = T._clayInteriorGroupForTest();
          let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
          let memberCount = 0;
          if (root && root.traverse) {
            root.traverse((node) => {
              if (!(node.userData && node.userData.clayArchitectureMember)
                  || !node.getWorldPosition || !node.position) return;
              const point = node.position.clone();
              node.getWorldPosition(point);
              minX = Math.min(minX, point.x); maxX = Math.max(maxX, point.x);
              minZ = Math.min(minZ, point.z); maxZ = Math.max(maxZ, point.z);
              memberCount++;
            });
          }
          if (memberCount && before.target) {
            const center = { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 };
            resolvedOffset = {
              x: center.x - before.target[0],
              z: center.z - before.target[2]
            };
            focusReceipt = {
              mode: "architecture-member-world-position-bounds",
              memberCount: memberCount,
              center: center,
              offset: resolvedOffset
            };
          }
        }
        T._clayCamPoseSetForTest(resolvedOffset, requestedZoom);
        /* A close-up is allowed to crop terrain, never a governed cast member. When the explicit
           party proof is mounted, dolly outward until every real projected billboard box clears a
           24-physical-pixel review margin. This changes presentation only: target, bearing, pitch,
           topology, actor cells, and the clean measurement frame remain untouched. */
        let appliedZoom = requestedZoom;
        let rects = [];
        let clipped = [];
        let architectureRect = null;
        let architectureClipped = false;
        if ((partyProof && typeof T.__spriteScreenRects === "function")
            || (closeupFocus === "architecture"
              && typeof T.__architectureScreenRect === "function")) {
          const canvas = document.querySelector("canvas");
          const margin = 24;
          const classify = () => {
            rects = partyProof && typeof T.__spriteScreenRects === "function"
              ? T.__spriteScreenRects() : [];
            const width = canvas ? canvas.width : 0;
            const height = canvas ? canvas.height : 0;
            clipped = rects.filter((rect) => {
              const bounds = rect.bounds || {
                left: rect.cx - rect.w / 2, right: rect.cx + rect.w / 2,
                top: rect.cy - rect.h / 2, bottom: rect.cy + rect.h / 2
              };
              return bounds.left < margin || bounds.top < margin
                || bounds.right > width - margin || bounds.bottom > height - margin;
            });
            architectureRect = closeupFocus === "architecture"
              && typeof T.__architectureScreenRect === "function"
              ? T.__architectureScreenRect() : null;
            const architectureBounds = architectureRect && architectureRect.bounds;
            architectureClipped = !!(architectureBounds
              && (architectureBounds.left < margin || architectureBounds.top < margin
                || architectureBounds.right > width - margin
                || architectureBounds.bottom > height - margin));
          };
          classify();
          for (let attempt = 0;
            (clipped.length || architectureClipped) && attempt < 18; attempt++) {
            appliedZoom = Math.min(2.5, appliedZoom * 1.08);
            T._clayCamPoseSetForTest(resolvedOffset, appliedZoom);
            classify();
          }
        }
        return {
          requestedZoom: requestedZoom,
          appliedZoom: appliedZoom,
          focus: focusReceipt,
          partyProofFrameGuard: partyProof ? {
            marginPhysicalPixels: 24,
            spriteCount: rects.length,
            clippedCount: clipped.length,
            clippedSlugs: clipped.map((rect) => rect.slug)
          } : null,
          architectureFrameGuard: closeupFocus === "architecture" ? {
            marginPhysicalPixels: 24,
            memberCount: architectureRect ? architectureRect.memberCount : 0,
            clipped: architectureClipped,
            bounds: architectureRect ? architectureRect.bounds : null
          } : null,
          before: before,
          applied: T._clayCamPoseForTest()
        };
      }, {
        requestedZoom: CLOSEUP_ZOOM,
        partyProof: PARTY_PROOF,
        closeupFocus: CLOSEUP_FOCUS
      });
      await new Promise((r) => setTimeout(r, 500));
      if (canvas) {
        await canvas.screenshot({ path: path.join(OUT, label + "-04c-beauty-closeup.png") });
      }
      await page.evaluate((pose) => {
        const T = window.Theater || {};
        if (pose && pose.before && T._clayCamPoseSetForTest) {
          T._clayCamPoseSetForTest(pose.before.offset, pose.before.zoom);
        }
      }, closeup);
      await new Promise((r) => setTimeout(r, 300));
    }
    /* BACKDROP PLATE at the production pose. The pixel-coverage gate asks, at every declared cell,
       "is this pixel the frame or is it nothing?" — and in a frame with a vignette gradient no
       single colour answers that. The plate answers it per pixel: the same camera, the same lights,
       the same canvas, with the bench hidden. A declared cell whose pixel equals the plate was
       declared and not drawn. Both plates are small on disk (smooth gradient, no geometry). */
    await plate(page, label + "-06-production-backdrop-plate.png");

    const resolvedRung = settled.terrain && settled.terrain.expression
      ? settled.terrain.expression.rungId : null;
    const receipt = {
      fixture: "cl-f07-terrain-bench",
      proof: "CL-F07a",
      capture: scene.capture,
      sceneId: scene.id,
      rung: resolvedRung,
      expectedRung: sceneRung,
      rungOverride: RUNG_OVERRIDE,
      probe: PROBE,
      grade: GRADE,
      overhang: OVERHANG,
      skirt: SKIRT,
      architectureVariant: ARCH_VARIANT,
      guardGroundRepeatMeters: GROUND_REPEAT,
      guardGroundCandidate: GROUND_CANDIDATE,
      guardMasonryCandidate: MASONRY_CANDIDATE,
      guardConditionCandidate: CONDITION_CANDIDATE,
      architectureIsolation: architectureIsolation,
      spriteExtrusion: SPRITE_EXTRUSION == null ? "production-default" : SPRITE_EXTRUSION,
      closeupZoom: CLOSEUP_ZOOM,
      closeupFocus: CLOSEUP_FOCUS,
      closeup: closeup,
      quarterTurn: TURN,
      quarterTurnGate: quarterTurnGate,
      frameIndex: scene.frameIndex != null ? scene.frameIndex : null,
      claim: (settled.terrain && settled.terrain.sceneId === scene.id
        && resolvedRung === sceneRung) ? "built" : "NOT BUILT",
      lightRecipeRequested: scene.light,
      viewport: VIEWPORT,
      strategicViewApplied: strategic,
      frames: [
        label + "-01-early-production.png",
        label + "-02-settled-production.png",
        label + "-03-settled-strategic.png",
        label + "-04-clean-production.png",
        label + "-04b-beauty-canvas.png"
      ].concat(CLOSEUP_ZOOM != null ? [
        label + "-04c-beauty-closeup.png"
      ] : []),
      /* Not frames — REFERENCES. The measurement reads these to decide, per pixel, what "nothing"
         looks like; they are never judged as pictures. */
      backdropPlates: {
        production: label + "-06-production-backdrop-plate.png",
        strategic: label + "-05-strategic-backdrop-plate.png"
      },
      early: early,
      settled: settled,
      strategic: strategicProbe,
      clean: clean,
      consoleErrors: consoleErrors,
      failedResponses: failedResponses,
      consoleWarnings: consoleWarnings.slice(0, 40)
    };
    fs.writeFileSync(path.join(OUT, label + "-receipt.json"), JSON.stringify(receipt, null, 2));
    index.captures.push({ capture: scene.capture, sceneId: scene.id, label: label,
      frameIndex: scene.frameIndex != null ? scene.frameIndex : null,
      boundary: settled.terrain && settled.terrain.boundary ? settled.terrain.boundary.kind : null,
      frames: receipt.frames, backdropPlates: receipt.backdropPlates,
      receipt: label + "-receipt.json",
      rung: resolvedRung,
      expectedRung: sceneRung,
      built: receipt.claim === "built",
      consoleErrors: consoleErrors.length,
      failedResponses: failedResponses,
      quarterTurnGate: quarterTurnGate,
      fingerprints: settled.terrain ? settled.terrain.fields.map((f) => ({ id: f.id, fingerprint: f.fingerprint })) : null });
    if (settled.terrain && settled.terrain.gate) index.gate = settled.terrain.gate;
    console.log(receipt.claim, "· errors=" + consoleErrors.length);
    await page.close();
  }

  /* THE DETERMINISM GATE, in the browser and in the letter of §4.3: the same segment id built in
     TWO SEPARATE PAGE LOADS must be byte-identical. Two fresh pages, fingerprints compared. */
  if (ONLY === "all") {
    process.stdout.write("determinism (two separate page loads) ... ");
    const grab = async () => {
      const { page } = await openScene(SCENES[0]);
      await new Promise((r) => setTimeout(r, 2500));
      const out = await page.evaluate(() => {
        const ids = CL_F07_TERRAIN_BENCH.scenes.map((s) => s.id);
        const rows = [];
        ids.forEach((id) => {
          terrainBenchSceneBuild(id).fields.forEach((f) => {
            rows.push({ scene: id, id: f.id, fingerprint: f.fingerprint,
              heights: Array.from(f.heights).join(",") });
          });
        });
        return rows;
      });
      await page.close();
      return out;
    };
    const loadA = await grab();
    const loadB = await grab();
    const same = JSON.stringify(loadA) === JSON.stringify(loadB);
    const fpSame = JSON.stringify(loadA.map((r) => r.fingerprint))
      === JSON.stringify(loadB.map((r) => r.fingerprint));
    index.determinism = {
      gate: "same segment id -> byte-identical heightfield, twice, in separate page loads",
      pageLoads: 2, fieldsCompared: loadA.length,
      byteIdentical: same, fingerprintsIdentical: fpSame,
      fingerprints: loadA.map((r) => ({ scene: r.scene, id: r.id, fingerprint: r.fingerprint })),
      result: same && fpSame ? "PASS" : "FAIL"
    };
    console.log(index.determinism.result, "·", loadA.length, "fields");
  }

  fs.writeFileSync(path.join(OUT, "cl-f07a-index.json"), JSON.stringify(index, null, 2));
  await browser.close();
  console.log("\nwrote", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
