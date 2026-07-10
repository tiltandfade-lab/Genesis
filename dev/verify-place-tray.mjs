/* Verify PLACE-GEN.md ADDENDUM §7 unit 7 — the tray `node` source: a minted, realm-typed place
   renders as the standing table's diorama. jsdom, real genesis.html modules in document order (same
   convention as dev/verify-tabletop-u1.mjs). window.Theater is not needed here — this harness only
   exercises the pure data layer (theaterNodeBoardBuild/trayFrom) and the null-safe render.js source
   read (theaterHereSourceFor/theaterNodeSourceFor), never the GL boot module.

   Checks:
     (a) node source: a fixture gloom Watering-hole place record (dims {w:4,d:3}) -> trayFrom
         ({kind:"node",record}) returns exactly 12 floor tiles in a 4x3 arrangement (x in [0,4),
         z in [0,3)), props array non-empty, env/light honored.
     (b) determinism: two calls on the identical (source,scene,opts) snapshot -> identical JSON
         (§9.1 purity — trayFrom never touches RNG for a node board).
     (c) byte-gate: dev/verify-tabletop-u1.mjs itself still passes in full (this unit's edits must
         not perturb the existing segment/idle/interior combat byte-gate).
     (d) render source read (theaterHereSourceFor): a fixture world with a typed-place node bound at
         w.currentNodeId and no active walk -> kind "node"; an active walk -> kind "segment" (segment
         wins even with a typed node also present); an untyped node (no codex place mint, or a mint
         with no rolled.archetypeKey) -> kind "idle".
     (e) mutation (shown RED then restored): stub the dims read to null (dims:null on a cloned
         record) -> (a)'s 4x3/12-tile assert fails via the 1x1 fallback path — proves dims actually
         drives the board, not a hardcoded fixture coincidence.

   Run:  node dev/verify-place-tray.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

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

function freshWin(customSrc) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (customSrc || srcText));
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// FIXTURE — a minted gloom Watering-hole place record (PLACE-GEN §5 unit 2 rollPlace shape)
// ============================================================================
const FIXTURE_RECORD = {
  id: "loc:fixture-watering-hole",
  kind: "location", name: "The Drowned Lamp", provenance: "rolled",
  rolled: {
    archetypeKey: "1", archetypeLabel: "Watering-hole", space: "roomy",
    dims: { w: 4, d: 3 }, staff: { min: 1, max: 2 }, cast: { anchorCls: "service", ambientCls: ["labor"] }
  },
  fields: { desc: "a sunken tavern", type: "Watering-hole" },
  dm: { itemsPool: "realm-items-gloom", dressing: { props: "gloom", surfaces: "gloom" } },
  status: { soft: true, at: "n1" }
};

// ============================================================================
// (a) node source: 4x3 = 12 tiles, props non-empty, env/light honored
// ============================================================================
{
  const win = freshWin();
  const board = win.trayFrom({ kind: "node", record: FIXTURE_RECORD, realms: ["gloom"], env: "urban" }, null, {});
  check("a1. exactly 12 tiles (4x3 GRID-LAW footprint, not the cmZoneGrid patch derivation)",
    Array.isArray(board.tiles) && board.tiles.length === 12, board.tiles && board.tiles.length);
  const xs = new Set(board.tiles.map(t => t.x)), zs = new Set(board.tiles.map(t => t.z));
  check("a2. tiles span x in [0,4) and z in [0,3) — exactly the dims.w x dims.d rectangle",
    xs.size === 4 && zs.size === 3 && [...xs].every(x => x >= 0 && x < 4) && [...zs].every(z => z >= 0 && z < 3),
    JSON.stringify({ xs: [...xs], zs: [...zs] }));
  check("a3. every tile is a plain floor tile (h:0, kind:floor) — no combat elevation/hazard concept here",
    board.tiles.every(t => t.h === 0 && t.kind === "floor"));
  check("a4. props array is non-empty (gloom Watering-hole dressing resolves real props)",
    Array.isArray(board.props) && board.props.length > 0, board.props && board.props.length);
  check("a5. env honored", board.env === "urban", board.env);
  check("a6. light is a real profile object, never absent", !!(board.light && board.light.profile), JSON.stringify(board.light));
  check("a7. grid.bandCount/laneCount mirror d/w (synthetic row/col labels, documented divergence)",
    board.grid && board.grid.bandCount === 3 && board.grid.laneCount === 4, JSON.stringify(board.grid));
  check("a8. realmId resolves off the record's own dressing pointer (gloom), not a hardcoded default",
    board.realmId === "gloom", board.realmId);
}

// ============================================================================
// (b) determinism — §9.1 purity
// ============================================================================
{
  const win = freshWin();
  const b1 = win.trayFrom({ kind: "node", record: FIXTURE_RECORD, realms: ["gloom"], env: "urban" }, null, {});
  const b2 = win.trayFrom({ kind: "node", record: FIXTURE_RECORD, realms: ["gloom"], env: "urban" }, null, {});
  check("b1. two calls on the identical snapshot -> identical JSON (no RNG in the node board path)",
    JSON.stringify(b1) === JSON.stringify(b2));
}

// ============================================================================
// (c) byte-gate — the existing combat/segment/idle harness must stay fully green
// ============================================================================
{
  try {
    const out = execFileSync("node", ["dev/verify-tabletop-u1.mjs"], { cwd: ROOT, encoding: "utf-8" });
    const stillGreen = /RESULT:\s*(ALL GREEN|OK|PASS)/i.test(out) || !/✗/.test(out);
    check("c1. dev/verify-tabletop-u1.mjs (the combat byte-gate) stays fully green after this unit",
      stillGreen, stillGreen ? "" : out.slice(-800));
  } catch (e) {
    fail++; console.log("  ✗ c1. dev/verify-tabletop-u1.mjs errored —", e.message);
  }
}

// ============================================================================
// (d) render.js source read — priority combat(caller-level, not this fn) > segment > node > idle
// ============================================================================
{
  const win = freshWin();
  // a minimal world fixture: a node bound to the fixture place record via mapOf/codexGet.
  win.eval(`
    var w = { currentNodeId: "n1", map: { nodes: { n1: { codexId: "${FIXTURE_RECORD.id}" } } },
      codex: { records: { "${FIXTURE_RECORD.id}": ${JSON.stringify(FIXTURE_RECORD)} } } };
  `);
  const srcNode = win.theaterHereSourceFor(win.w);
  check("d1. typed-place node + no active walk -> kind 'node'", srcNode.kind === "node", srcNode.kind);
  check("d2. node source carries the record", srcNode.record && srcNode.record.id === FIXTURE_RECORD.id);

  // an active walk present -> segment wins over the node (priority: segment before node).
  win.eval(`
    var prepOf = function(){ return { activeWalkId: "walk1", nodes: { walk1: { cursor: { current: 1 } } } }; };
    var walkOfFrontier = function(){ return { environment: "wilderness", segments: [{ num: 1, id: "s1" }] }; };
  `);
  const srcSeg = win.theaterHereSourceFor(win.w);
  check("d3. active walk -> kind 'segment' (segment still wins over a typed node at the same node)",
    srcSeg.kind === "segment", srcSeg.kind);

  // untyped node (a mint with no archetypeKey) -> idle, no active walk.
  const win2 = freshWin();
  win2.eval(`
    var w = { currentNodeId: "n2", map: { nodes: { n2: { codexId: "loc:untyped" } } },
      codex: { records: { "loc:untyped": { id:"loc:untyped", kind:"location", rolled:{} } } } };
  `);
  const srcUntyped = win2.theaterHereSourceFor(win2.w);
  check("d4. untyped node (no rolled.archetypeKey) -> kind 'idle'", srcUntyped.kind === "idle", srcUntyped.kind);

  // no node binding at all -> idle.
  const win3 = freshWin();
  win3.eval(`var w = { currentNodeId: "n3", map: { nodes: {} }, codex: { records: {} } };`);
  const srcNone = win3.theaterHereSourceFor(win3.w);
  check("d5. no codex-bound node -> kind 'idle'", srcNone.kind === "idle", srcNone.kind);
}

// ============================================================================
// (e) MUTATION (shown RED then restored): dims stubbed null -> the 4x3/12-tile assert fails
// ============================================================================
{
  const win = freshWin();
  const mutatedRecord = Object.assign({}, FIXTURE_RECORD, {
    rolled: Object.assign({}, FIXTURE_RECORD.rolled, { dims: null })
  });
  const board = win.trayFrom({ kind: "node", record: mutatedRecord, realms: ["gloom"], env: "urban" }, null, {});
  const stillTwelve = Array.isArray(board.tiles) && board.tiles.length === 12;
  check("MUTATION (shown RED then restored): dims:null degrades to a 1x1 fallback, NOT 12 tiles — proves dims drives the board",
    !stillTwelve, stillTwelve ? "mutation did not move the check — dims may not be load-bearing" : "confirmed RED under mutation (tiles=" + board.tiles.length + "), as expected");
  check("e2. dims:null -> exactly 1 tile (the documented total-function default)",
    board.tiles.length === 1, board.tiles.length);
}

// ============================================================================
// (f) PLACE-PARTS-WAVE Wave A — a Threshold place renders its checkpoint-gate anchor through the
// PRODUCTION node path (trayFrom -> theaterNodeBoardBuild -> sceneDressingForPlace), never a
// hand-fed prop key (THE WIRING LAW). RED-FIRST: fails on the pre-wiring tree.
// ============================================================================
{
  const win = freshWin();
  const thresholdRecord = {
    id: "loc:fixture-threshold-gate",
    kind: "location", name: "The Toll Gap", provenance: "rolled",
    rolled: {
      archetypeKey: "13", archetypeLabel: "Threshold", space: "tight",
      dims: { w: 3, d: 2 }, staff: { min: 1, max: 2 }, cast: { anchorCls: "guard", ambientCls: [] }
    },
    fields: { desc: "a controlled crossing", type: "Threshold" },
    dm: { itemsPool: "realm-items-frontier", dressing: { props: "frontier", surfaces: "frontier" } },
    status: { soft: true, at: "n1" }
  };
  const board = win.trayFrom({ kind: "node", record: thresholdRecord, realms: ["frontier"], env: "urban" }, null, {});
  const models = (board.props || []).map((p) => p.model).filter(Boolean);
  check("f1. a frontier Threshold node tray carries prop:gate-checkpoint via the production dressing path",
    models.includes("prop:gate-checkpoint"), JSON.stringify(models));
  const gate = (board.props || []).find((p) => p.model === "prop:gate-checkpoint");
  check("f2. the gate prop entry carries name + size (came from the realm pool, not invented)",
    !!gate && typeof gate.realmPropName === "string" && typeof gate.size === "string",
    JSON.stringify(gate));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
