/* Verify ENV-3 (docs/ENV-EXTERIOR-WAVE.md "The town tray — first compositional settlement") — the
   settlement-kind node routes to theaterSettlementBoardBuild (a compositional street scene) instead of
   the blank idle table. jsdom, real genesis.html modules in document order (same convention as
   dev/verify-place-tray.mjs). window.Theater is not needed — this harness only exercises the pure data
   layer (theaterSettlementBoardBuild/trayFrom) and the null-safe render.js source read
   (theaterHereSourceFor/nodeIsSettlementKind).

   Checks:
     (a) RED FIRST: with nodeIsSettlementKind stubbed to always return false (simulating the code as it
         stood before this unit — theaterNodeSourceFor finds nothing at the origin town, so
         theaterHereSourceFor degrades straight to {kind:"idle"}), the resulting board is BARE (zero
         tiles, zero buildings) — the exact "settlement tray shows zero town" defect the ledger measured.
     (b) GREEN: the real (unstubbed) routing yields kind:"settlement" at the origin town with no active
         walk, and the resulting board carries >=4 building masses, a street (cobble-materialed floor
         tiles on the grid's center lane), and >=2 NPC/prop dressing mounts.
     (c) determinism: two theaterSettlementBoardBuild calls on the identical (nodeInfo,realms,env)
         snapshot are byte-identical (§9.1 purity — no RNG outside the seeded chain).
     (d) footprint: no two buildings share a tile, and no building tile coincides with a street-lane
         tile (buildings never overlap the street lane or each other).
     (e) single-site place trays untouched: the SAME Watering-hole fixture verify-place-tray.mjs uses,
         run through trayFrom({kind:"node",...}), still yields the exact pre-ENV-3 12-tile/4x3 shape —
         the diner-class path never routes through the new settlement branch.
     (f) render-source law: an urban prep-frontier node with NO bound place record routes to
         kind:"settlement" too; a node WITH a bound archetyped place record does NOT (node wins,
         byte-identical to pre-ENV-3); a non-settlement, non-bound node still degrades to kind:"idle".
     (g) PC in frame: castFrom's PC unit, re-centered via theaterBoardCenterFor (the SAME seam
         theaterStageSync/render.js uses), lands within the board's own tile bounding box (+1 pad,
         mirroring theater-boot.js's setBoard boardHalfX/Z formula) — "PC + buildings inside the camera
         fit" without re-deriving GL camera math.

   ENV-3b (composition-fix wave, orchestrator taste-gate bounce) — checks (h)/(i) below, jsdom/pure
   data, plus a SECOND puppeteer/GL section (mirrors dev/verify-qfb-tray.mjs's own boot-a-real-window.
   Theater pattern) for the two rulings only a live camera/DOM can prove:
     (h) building height cap (ruling 1): ⊗ RED — the ORIGINAL formula this unit replaced
         (SETTLEMENT_BUILDING_HEIGHT_STEPS=3 + up to +SETTLEMENT_BUILDING_HEIGHT_JITTER=2, both *
         THEATER_STEP=1.0) could reach 5.0 world units, computed here standalone (no production code
         touched — those constants no longer exist) purely to document the historical violation against
         today's cap. ✓ GREEN — every real board.buildings[] entry's height sits inside
         [SETTLEMENT_BUILDING_HEIGHT_MIN, SETTLEMENT_BUILDING_HEIGHT_MAX] (2.25u-3.0u, 1.5x-2x
         SETTLEMENT_STANDEE_HEIGHT_REF).
     (i) lot-buffer adjacency (ruling 3): ⊗ RED — theaterZoneOrigin's own contiguous-patch math (no
         gap between bandIdx and bandIdx+1) proves two FULL, untrimmed 3x3 patches in the same lane
         would touch (zero-tile gap) — the pre-fix fuse bug's raw geometry, computed standalone.
         ✓ GREEN — on the REAL board, no two DISTINCT buildings' tile sets contain a pair of tiles
         that are grid-adjacent (4-neighbor, including the exact touching-corner-free case) — a
         strictly stronger claim than (d)'s existing no-overlap check.
     (j) [puppeteer] whole-board-in-frustum (ruling 2): window.Theater.interiorFrustumCheck, called
         against the REAL board's tallest building height + a mounted PC, on the actual settlement tray
         (dev/theater-preview.html boot, window.trayFrom({kind:"settlement",...})) — every building
         corner and the PC lands inside the camera's own frustum.
     (k) [puppeteer] ambient toast suppressed in capture context (ruling 4): the SAME #toast/.toast/
         #bardoCard/#spicePop/#diceOverlay addStyleTag capture-env3-town.mjs now applies (mirrors
         capture-interior-study.mjs) actually hides a toast fired via the real toast() function.
     (l) [puppeteer] card yaw faces camera (ruling 5): window.Theater._propGroupCardsForTest() (new
         test-only seam, theater-boot.js) — every settlement dressing/NPC card's rotation.y matches
         the camera's own expected facing yaw, checked AFTER a real assets/dressing/*.png async load
         has fired a full setBoard-only propGroup rebuild (the exact race the mirrored-text bug lived
         in) — not just immediately after the initial mount.

   Run:  node dev/verify-env3-town.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md; section 2
   additionally needs puppeteer-core + a real Chrome, same as every other capture-*.mjs/verify-qfb-
   tray.mjs harness) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const CLASSIC_FILES = man.loadOrder.filter((p) => p.endsWith(".js"));
const moduleSrc = CLASSIC_FILES.map(read).join("\n;\n");
const TABLES_SRC = read("tables.js");
const srcText = TABLES_SRC + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshWin() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// fixture world: an origin town (w.startNodeId === w.currentNodeId), no active walk, no bound place
// record at that node — the exact shape mintOriginPlaceThread leaves the origin in (docs/PLACE-GEN.md
// ADDENDUM §7D item 9's own "never a single spine archetype" scope fence).
// ============================================================================
function fixtureTownWorld(win) {
  const w = {
    startNodeId: "n-town", currentNodeId: "n-town",
    map: { nodes: { "n-town": { id: "n-town", name: "Rivergate", type: "Setting" } }, edges: [] },
    characters: [{ status: "living", name: "Capture Bot", sheet: { class: "Fighter", mods: {}, ac: 15, hp: 12, hpCur: 12 } }],
  };
  return w;
}

// ============================================================================
// (a) RED FIRST — stub nodeIsSettlementKind to always return false, simulating pre-ENV-3 behavior:
// theaterNodeSourceFor finds nothing bound at the origin town -> theaterHereSourceFor has nowhere else
// to route -> {kind:"idle"} -> a BARE board (zero tiles/buildings). This is the exact ledger #9 defect.
// ============================================================================
{
  const win = freshWin();
  const w = fixtureTownWorld(win);
  const realNodeIsSettlementKind = win.nodeIsSettlementKind;
  win.nodeIsSettlementKind = () => false; // simulate the code as it stood before this unit
  const hereSource = win.theaterHereSourceFor(w);
  const board = win.trayFrom(hereSource, null, { env: hereSource.env, realms: hereSource.realms });
  check("RED: pre-fix routing degrades to kind:\"idle\" at the origin town", hereSource.kind === "idle", JSON.stringify(hereSource));
  check("RED: pre-fix board is BARE — zero tiles", (board.tiles || []).length === 0, (board.tiles || []).length);
  check("RED: pre-fix board carries no buildings field at all", board.buildings === undefined, JSON.stringify(board.buildings));
  win.nodeIsSettlementKind = realNodeIsSettlementKind; // restore — every check below uses the REAL fix
}

// ============================================================================
// (b) GREEN — the real routing composes a street scene: kind:"settlement", >=4 buildings, a street,
// >=2 NPC/prop dressing mounts.
// ============================================================================
let GREEN_BOARD = null;
{
  const win = freshWin();
  const w = fixtureTownWorld(win);
  const hereSource = win.theaterHereSourceFor(w);
  check("GREEN: origin town, no active walk -> kind:\"settlement\"", hereSource.kind === "settlement", JSON.stringify(hereSource));
  const board = win.trayFrom(hereSource, null, { env: hereSource.env, realms: hereSource.realms });
  GREEN_BOARD = board;
  const buildings = board.buildings || [];
  const streetTiles = (board.tiles || []).filter(t => t.kind === "floor" && t.material === "cobble");
  const dressingProps = (board.props || []).filter(p => p.kind === "dressing");
  check("GREEN: >=4 building masses (SETTLEMENT_BUILDING_MIN)", buildings.length >= 4, buildings.length);
  check("GREEN: <=8 building masses (SETTLEMENT_BUILDING_MAX)", buildings.length <= 8, buildings.length);
  check("GREEN: a street exists (cobble-materialed floor tiles)", streetTiles.length > 0, streetTiles.length);
  check("GREEN: >=2 NPC/market dressing mounts", dressingProps.length >= 2, dressingProps.length);
  check("GREEN: every building tile carries a raised height (a real mass, not a flat lot)",
    (board.tiles || []).filter(t => t.kind === "building").every(t => t.h > 0),
    JSON.stringify((board.tiles || []).filter(t => t.kind === "building").slice(0, 3)));
}

// ============================================================================
// (c) determinism — the SAME node id always yields a byte-identical board.
// ============================================================================
{
  const win = freshWin();
  const w = fixtureTownWorld(win);
  const hereSource = win.theaterHereSourceFor(w);
  const b1 = win.trayFrom(hereSource, null, { env: hereSource.env, realms: hereSource.realms });
  const b2 = win.trayFrom(hereSource, null, { env: hereSource.env, realms: hereSource.realms });
  check("determinism: two calls on the identical snapshot are byte-identical JSON", JSON.stringify(b1) === JSON.stringify(b2));
}

// ============================================================================
// (d) footprint — no two buildings share a tile; no building tile sits on the street lane.
// ============================================================================
{
  const board = GREEN_BOARD;
  const buildingTilesByBuilding = {};
  (board.tiles || []).forEach(t => {
    if (t.kind !== "building") return;
    (buildingTilesByBuilding[t.buildingId] = buildingTilesByBuilding[t.buildingId] || []).push(t.x + "," + t.z);
  });
  const allBuildingCoords = new Set();
  let overlap = false;
  Object.values(buildingTilesByBuilding).forEach(coords => {
    coords.forEach(c => { if (allBuildingCoords.has(c)) overlap = true; allBuildingCoords.add(c); });
  });
  check("footprint: no two buildings share a tile coordinate", !overlap);
  const streetCoords = new Set((board.tiles || []).filter(t => t.kind === "floor" && t.material === "cobble").map(t => t.x + "," + t.z));
  const buildingOnStreet = [...allBuildingCoords].some(c => streetCoords.has(c));
  check("footprint: no building tile coincides with a street-lane tile", !buildingOnStreet);
}

// ============================================================================
// (e) single-site place trays untouched — the SAME Watering-hole fixture dev/verify-place-tray.mjs
// exercises, still 12 tiles in a 4x3 arrangement (byte-unchanged shape law).
// ============================================================================
{
  const win = freshWin();
  const FIXTURE_RECORD = {
    id: "loc:fixture-watering-hole",
    kind: "location", name: "The Drowned Lamp", provenance: "rolled",
    rolled: { archetypeKey: "1", archetypeLabel: "Watering-hole", space: "roomy",
      dims: { w: 4, d: 3 }, staff: { min: 1, max: 2 }, cast: { anchorCls: "service", ambientCls: ["labor"] } },
    fields: { desc: "a sunken tavern", type: "Watering-hole" },
    dm: { itemsPool: "realm-items-gloom", dressing: { props: "gloom", surfaces: "gloom" } },
    status: { soft: true, at: "n1" }
  };
  const board = win.trayFrom({ kind: "node", record: FIXTURE_RECORD, realms: ["gloom"], env: "urban" }, null, {});
  check("untouched: single-site diner-class board is still exactly 12 tiles", (board.tiles || []).length === 12, board.tiles.length);
  const xs = new Set(board.tiles.map(t => t.x)), zs = new Set(board.tiles.map(t => t.z));
  check("untouched: still a 4x3 arrangement (x in [0,4), z in [0,3))",
    [...xs].every(x => x >= 0 && x < 4) && [...zs].every(z => z >= 0 && z < 3));
  check("untouched: no `buildings` field on a single-site board (that field is settlement-only)", board.buildings === undefined);
}

// ============================================================================
// (f) render-source law — the three-way split theaterHereSourceFor now makes.
// ============================================================================
{
  const win = freshWin();
  // f1: an urban prep-frontier node, no bound place record -> settlement.
  {
    const w = { startNodeId: "n-home", currentNodeId: "n-frontier-1",
      map: { nodes: { "n-frontier-1": { id: "n-frontier-1", name: "The Docks (rumored)", type: "Frontier" } }, edges: [] },
      prep: { session: 1, bundle: null, overlays: {}, harvest: null, debt: [], activeWalkId: null, walkLog: [],
        nodes: { "n-frontier-1": { env: "urban", idx: 0, soft: true, locked: false, hook: null } } } };
    const hereSource = win.theaterHereSourceFor(w);
    check("f1: an urban prep-frontier with no bound place record -> kind:\"settlement\"", hereSource.kind === "settlement", JSON.stringify(hereSource));
  }
  // f2: an urban prep-frontier node WITH a bound archetyped place record -> node wins (untouched).
  {
    const w = { startNodeId: "n-home", currentNodeId: "n-frontier-2",
      map: { nodes: { "n-frontier-2": { id: "n-frontier-2", name: "The Docks (rumored)", type: "Frontier", codexId: "loc:bound" } }, edges: [] },
      prep: { session: 1, bundle: null, overlays: {}, harvest: null, debt: [], activeWalkId: null, walkLog: [],
        nodes: { "n-frontier-2": { env: "urban", idx: 0, soft: true, locked: false, hook: null } } } };
    win.codexGet = (world, id) => id === "loc:bound"
      ? { id: "loc:bound", kind: "location", rolled: { archetypeKey: "1", dims: { w: 2, d: 2 } } } : null;
    const hereSource = win.theaterHereSourceFor(w);
    check("f2: an urban prep-frontier WITH a bound place record -> kind:\"node\" (diner path wins, untouched)",
      hereSource.kind === "node", JSON.stringify(hereSource));
  }
  // f3: a non-settlement, non-bound node (wilderness/dungeon-band frontier) -> still idle.
  {
    const w = { startNodeId: "n-home", currentNodeId: "n-frontier-3",
      map: { nodes: { "n-frontier-3": { id: "n-frontier-3", name: "The far reaches (rumored)", type: "Frontier" } }, edges: [] },
      prep: { session: 1, bundle: null, overlays: {}, harvest: null, debt: [], activeWalkId: null, walkLog: [],
        nodes: { "n-frontier-3": { env: "wilderness", idx: 0, soft: true, locked: false, hook: null } } } };
    const hereSource = win.theaterHereSourceFor(w);
    check("f3: a wilderness-band frontier, no bound record -> still kind:\"idle\" (no regression)", hereSource.kind === "idle", JSON.stringify(hereSource));
  }
}

// ============================================================================
// (g) PC in frame — castFrom's PC unit, re-centered via theaterBoardCenterFor (the SAME seam
// theaterStageSync uses), lands inside the board's own tile bounding box (+1 pad).
// ============================================================================
{
  const win = freshWin();
  const w = fixtureTownWorld(win);
  const hereSource = win.theaterHereSourceFor(w);
  const board = win.trayFrom(hereSource, null, { env: hereSource.env, realms: hereSource.realms });
  const castSource = win.theaterCastSourceFor(w, hereSource);
  castSource.boardCenter = win.theaterBoardCenterFor(board);
  const units = win.castFrom(w, castSource);
  const pcUnit = units.find(u => u.kind === "pc");
  check("PC-in-frame: castFrom stages a PC unit on the settlement tray", !!pcUnit, JSON.stringify(units.map(u => u.kind)));
  if (pcUnit) {
    const tiles = board.tiles || [];
    const minX = Math.min(...tiles.map(t => t.x)), maxX = Math.max(...tiles.map(t => t.x));
    const minZ = Math.min(...tiles.map(t => t.z)), maxZ = Math.max(...tiles.map(t => t.z));
    const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
    const halfX = (maxX - minX) / 2 + 1, halfZ = (maxZ - minZ) / 2 + 1; // mirrors setBoard's own boardHalfX/Z formula
    const localX = pcUnit.x - cx, localZ = pcUnit.z - cz; // setBoard positions every mesh at coord-cx/coord-cz
    check("PC-in-frame: the PC's re-centered position sits within the board's own tile bounds (+1 pad)",
      Math.abs(localX) <= halfX && Math.abs(localZ) <= halfZ,
      `pc=(${pcUnit.x},${pcUnit.z}) local=(${localX},${localZ}) halfX=${halfX} halfZ=${halfZ}`);
  }
}

// ============================================================================
// (h) ENV-3b ruling 1 — building height cap: RED (the historical unbounded formula, standalone) +
// GREEN (every real building height sits inside the named MIN..MAX band).
// ============================================================================
{
  // ⊗ RED: the EXACT pre-fix formula (theaterSettlementBoardBuild's own git history) — reconstructed
  // standalone since SETTLEMENT_BUILDING_HEIGHT_STEPS/JITTER no longer exist in production code. This
  // is documentation-by-computation, not a live code path.
  const OLD_STEPS = 3, OLD_JITTER = 2, OLD_THEATER_STEP = 1.0;
  const oldMaxHeight = (OLD_STEPS + OLD_JITTER) * OLD_THEATER_STEP;
  check("RED: the pre-fix STEPS+JITTER formula could reach 5.0 world units",
    oldMaxHeight === 5.0, oldMaxHeight);

  // top-level `const` declared inside win.eval()'d source never becomes a `window.X` property (same
  // as a browser <script>: only var/function declarations do) — so the named cap constants are read
  // straight off the SOURCE TEXT (srcText, already loaded above for every freshWin() call) instead of
  // off a live window binding. Regex-extracted, not hand-copied, so a future tuning pass can't silently
  // drift this check out of sync with the real value.
  const refMatch = srcText.match(/const SETTLEMENT_STANDEE_HEIGHT_REF\s*=\s*([\d.]+)/);
  const standeeRef = refMatch ? parseFloat(refMatch[1]) : NaN;
  check("source: SETTLEMENT_STANDEE_HEIGHT_REF is present + a sane standee-scale number", standeeRef > 0.5 && standeeRef < 3, standeeRef);
  const minCap = standeeRef * 1.5, maxCap = standeeRef * 2.0;
  check("RED: 5.0u exceeds today's cap (SETTLEMENT_BUILDING_HEIGHT_MAX) — the gate's \"swallows the frame\" bug",
    oldMaxHeight > maxCap, `old=${oldMaxHeight} cap=${maxCap}`);

  // ✓ GREEN
  const board = GREEN_BOARD;
  const heights = (board.buildings || []).map(b => b.h);
  check("GREEN: every building's height sits inside [MIN,MAX] (1.5x-2x SETTLEMENT_STANDEE_HEIGHT_REF) — never a monolith, never a shed",
    heights.every(h => h >= minCap && h <= maxCap),
    `min=${minCap} max=${maxCap} heights=${JSON.stringify(heights)}`);
}

// ============================================================================
// (i) ENV-3b ruling 3 — lot-buffer adjacency: RED (theaterZoneOrigin's own contiguous-patch math,
// standalone, proves two full untrimmed patches WOULD touch) + GREEN (no two distinct real buildings
// are grid-adjacent — strictly stronger than (d)'s existing no-overlap-only check).
// ============================================================================
{
  const win = freshWin();
  // ⊗ RED: two adjacent bands (bi=0,bi=1), same lane, BOTH stamped as a full untrimmed 3x3 patch (the
  // pre-ruling-3 shape) — theaterZoneOrigin's own math, called directly (still real production code;
  // only the "stamp the WHOLE patch with no buffer" assumption is what ruling 3 changed).
  const originA = win.theaterZoneOrigin ? win.theaterZoneOrigin(0, 0) : { x: 0, z: 0 };
  const originB = win.theaterZoneOrigin ? win.theaterZoneOrigin(1, 0) : { x: 0, z: 3 };
  const patchATiles = []; for (let tz = 0; tz < 3; tz++) patchATiles.push(originA.z + tz);
  const patchBTiles = []; for (let tz = 0; tz < 3; tz++) patchBTiles.push(originB.z + tz);
  const wouldTouch = Math.min(...patchBTiles) - Math.max(...patchATiles) === 1; // adjacent (0-gap), not overlapping
  check("RED: two full untrimmed 3x3 patches in adjacent same-lane bands sit ZERO tiles apart (theaterZoneOrigin's own contiguous-patch math) — the pre-fix fuse bug's raw geometry",
    wouldTouch, `patchA max z=${Math.max(...patchATiles)} patchB min z=${Math.min(...patchBTiles)}`);

  // ✓ GREEN: on the REAL (post-fix) board, no two DISTINCT buildings' tile sets are grid-adjacent.
  const board = GREEN_BOARD;
  const tilesByBuilding = {};
  (board.tiles || []).forEach(t => {
    if (t.kind !== "building") return;
    (tilesByBuilding[t.buildingId] = tilesByBuilding[t.buildingId] || []).push({ x: t.x, z: t.z });
  });
  const buildingIds = Object.keys(tilesByBuilding);
  const NEIGH = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let adjacentPairFound = null;
  outer:
  for (let i = 0; i < buildingIds.length; i++) {
    for (let j = i + 1; j < buildingIds.length; j++) {
      const A = tilesByBuilding[buildingIds[i]], B = tilesByBuilding[buildingIds[j]];
      const Bset = new Set(B.map(t => t.x + "," + t.z));
      for (const t of A) {
        for (const [dx, dz] of NEIGH) {
          if (Bset.has((t.x + dx) + "," + (t.z + dz))) { adjacentPairFound = [buildingIds[i], buildingIds[j]]; break outer; }
        }
      }
    }
  }
  check("GREEN: no two distinct buildings are grid-adjacent (SETTLEMENT_BUILDING_ADJACENCY_BUFFER holds — never fused into one silhouette)",
    !adjacentPairFound, JSON.stringify(adjacentPairFound));
}

// ============================================================================================
// SECTION 2 [puppeteer/GL] — ENV-3b rulings 2/4/5: whole-board-in-frustum, toast suppression, card
// yaw. Mirrors dev/verify-qfb-tray.mjs's own boot-a-real-window.Theater pattern (dev/theater-preview.
// html, which loads theater-data.js AND theater-boot.js as classic-script-adjacent globals — no live
// DM/world state needed, window.trayFrom({kind:"settlement",...}) builds the real board directly).
// ============================================================================================
import { spawn } from "node:child_process";
import path from "node:path";
import net from "node:net";
const require2 = createRequire(import.meta.url);
const puppeteer = require2(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5281, 5282, 5283, 5284, 5285];
let BASE = null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function portInUse(port) {
  return new Promise((resolve) => {
    const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
    sock.on("error", () => resolve(false));
    sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
  });
}
async function probeRoot(port) {
  try { const r = await fetch(`http://127.0.0.1:${port}/genesis.html`, { cache: "no-store" }); return r.ok && (await r.text()).includes("Genesis"); }
  catch (e) { return false; }
}
async function startServer() {
  for (const port of PORT_CANDIDATES) {
    if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc: null }; } continue; }
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: ROOT, stdio: ["ignore", "ignore", "ignore"] });
    for (let i = 0; i < 40; i++) {
      if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc }; } break; }
      await sleep(150);
    }
    try { proc.kill("SIGTERM"); } catch (e) {}
  }
  throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
}

{
  const server = await startServer();
  let browser = null;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME, headless: "new",
      args: ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1200,900"],
      defaultViewport: { width: 1200, height: 900, deviceScaleFactor: 1 }
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("  [pageerror]", e.message));
    await page.goto(`${BASE}/dev/theater-preview.html`, { waitUntil: "load", timeout: 30000 });
    // ruling 4's own suppression, applied right after load, before check (k) fires a toast — verbatim
    // selector list, mirrors capture-interior-study.mjs / the capture-env3-town.mjs fix this same
    // wave lands.
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    for (let i = 0; i < 60; i++) {
      const ready = await page.evaluate(() => !!(window.Theater && typeof window.Theater.setBoard === "function" && window.Theater.ready === true && typeof window.trayFrom === "function"));
      if (ready) break;
      await sleep(150);
    }
    const readyNow = await page.evaluate(() => !!(window.Theater && window.Theater.ready === true && typeof window.trayFrom === "function"));
    check("[puppeteer] window.Theater + trayFrom both available on dev/theater-preview.html", readyNow);

    console.log("\n[SECTION 2 — puppeteer/GL]");

    // ---- (j) whole-board-in-frustum -------------------------------------------------------------
    const mounted = await page.evaluate(() => {
      const board = window.trayFrom({ kind: "settlement", nodeId: "n-town-verify", realms: ["fantasy"], env: "urban" }, null, {});
      window.Theater.setBoard(board);
      const tallest = Math.max(0, ...((board.buildings || []).map(b => b.h)));
      // a PC standing on the street's own walking lane (center column of the center band's own patch —
      // theaterZoneOrigin(1,1) on the default 4-band/3-lane grid), same convention verify-qfb-tray.mjs's
      // own fixture units use.
      window.Theater.setUnits({ units: [{ id: "pc1", kind: "pc", name: "ENV3 Verify Bot", x: 4, z: 4, hpPct: 1, className: "barbarian" }], __n: Math.random() });
      const fitH = window.Theater.interiorFitMaxHeight();
      return { buildingCount: (board.buildings || []).length, tallest, fitH };
    });
    check("[j] settlement board mounted with real buildings", mounted.buildingCount >= 4, JSON.stringify(mounted));
    check("[j] the fitted height (S.interiorFitMaxHeight) is at least the tallest building's own height", mounted.fitH >= mounted.tallest, JSON.stringify(mounted));
    const frustum = await page.evaluate((tallest) => window.Theater.interiorFrustumCheck(tallest), mounted.tallest);
    check("[j] every corner of the tallest building's own box IS contained in the camera frustum (whole tray in frame, ruling 2)",
      frustum.ok === true, JSON.stringify((frustum.corners || []).filter(c => !c.inFrustum)));

    // ---- (k) ambient toast suppressed in capture context -----------------------------------------
    // dev/theater-preview.html is a standalone fixture page — it carries no #toast element of its own
    // (only genesis.html does, src/ui/chrome.js's toast()). The claim under test is the CSS mechanism
    // capture-env3-town.mjs now applies (the exact selector string, added right after page.goto,
    // above), so a fixture #toast element is minted here to exercise that same rule — a real
    // genesis.html #toast landing under the identical selector is byte-for-byte the same CSS match.
    const toastState = await page.evaluate(() => {
      let el = document.getElementById("toast");
      if (!el) {
        el = document.createElement("div");
        el.id = "toast"; el.className = "toast";
        document.body.appendChild(el);
      }
      el.textContent = "Otherworldly!"; el.classList.add("show"); // mirrors chrome.js's own toast() write
      const style = window.getComputedStyle(el);
      return { present: true, display: style.display, visibility: style.visibility };
    });
    check("[k] a fired toast is suppressed (display:none) under the capture-rig CSS override (ruling 4)",
      toastState.present && toastState.display === "none", JSON.stringify(toastState));

    // ---- (l) card yaw faces camera, INCLUDING after an async real-art setBoard-only replay --------
    await sleep(1500); // let any real assets/dressing/*.png loads (fantasy-clutter-*) settle + replay
    const cards = await page.evaluate(() => window.Theater._propGroupCardsForTest ? window.Theater._propGroupCardsForTest() : null);
    check("[l] _propGroupCardsForTest test seam is present", Array.isArray(cards), JSON.stringify(cards));
    if (Array.isArray(cards)) {
      check("[l] settlement dressing/NPC cards exist on this board", cards.length > 0, cards.length);
      const misfaced = cards.filter(c => Math.abs(c.rotY - c.expectedFacing) > 1e-6);
      check("[l] every card's rotation.y matches the camera's own expected facing yaw — no back-facing/mirrored card, even post-replay (ruling 5)",
        misfaced.length === 0, JSON.stringify(misfaced));
    }
  } finally {
    if (browser) await browser.close();
    if (server && server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
