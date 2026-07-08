/* ONE-SHOT capture script (TABLETOP-UNITS.md §U1 STEP ZERO — the combat byte-gate). Run ONCE
   against the UNTOUCHED tree (before trayFrom/theaterBoardFrom's refactor lands) to snapshot
   theaterBoardFrom(segment, scene, opts)'s real output for a representative fixture segment+scene
   into dev/fixtures/tabletop-u1-board.json. dev/verify-tabletop-u1.mjs's FIRST check then deep-
   equals a fresh call against this committed snapshot — a byte-identical match proves the U1
   trayFrom/theaterBoardFrom split never altered combat's existing board shape.

   Do NOT re-run this after the refactor lands — the fixture is deliberately a frozen "before"
   snapshot, not something that regenerates itself (a self-regenerating "golden" file would make
   the byte-gate trivially green forever, exactly the "validators preserve the job" trap CLAUDE.md
   warns about).

   RE-BASELINED ONCE, 2026-07-08 (Adam's realm-floor-color ruling): the U1 trayFrom byte-gate's
   original job — proving the refactor changed nothing — was complete and landed; the checker-kill +
   tint-funnel change then altered board colors ON PURPOSE, so the fixture was regenerated as the
   new frozen baseline. The only drift vs the pre-2026-07-08 snapshot is tint values, altTop (all
   false now), and the new surfaceBaseTint board field — tile count/coords/zones/props/grid
   byte-identical (diff proven in the feat/realm-floor-color commit). The same law still applies
   going forward: never re-run to green a failing gate.

   Run:  node dev/gen-tabletop-u1-fixture.mjs */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval(harness + "\n" + srcText);

// The SAME fixture segment+scene dev/verify-tabletop-u1.mjs re-derives against — exercises
// hazards (fire, tinted+no-sink), elevation, a keyword-resolved cover prop ("table"), a realm
// (opts.realms), and an atmo field carrying a DECOY prop keyword ("barrel") that must NEVER spawn
// a prop (theater-data.js's atmo exclusion, §9.4). Kept in exact sync with the harness's own copy
// by convention (both files comment "KEEP IN SYNC WITH dev/gen-tabletop-u1-fixture.mjs").
export const FIXTURE_SEGMENT = {
  id: "seg-fixture-u1", num: 1, dims: "30' x 30'",
  feature: { name: "a scorched table", flavor: "cracked down the middle" },
  dressing: { text: "a dusty banner", condition: "cracked" },
  atmo: { text: "a barrel of pitch smell hangs heavy in the air" },
  light: null,
};
export const FIXTURE_SCENE = {
  elevZones: ["near:L"],
  hazardZones: [{ zone: "near:R", kind: "fire", revealed: true }],
  zoneCover: { "melee:C": "half" },
  cover: {},
  mods: [],
};
export const FIXTURE_OPTS = { env: "dungeon", realms: ["ember-kingdom"] };

const board = win.theaterBoardFrom(FIXTURE_SEGMENT, FIXTURE_SCENE, FIXTURE_OPTS);
const out = { FIXTURE_SEGMENT, FIXTURE_SCENE, FIXTURE_OPTS, board };
writeFileSync(join(ROOT, "dev/fixtures/tabletop-u1-board.json"), JSON.stringify(out, null, 2) + "\n");
console.log("Captured dev/fixtures/tabletop-u1-board.json — board keys:", Object.keys(board).join(", "));
console.log("tiles:", board.tiles.length, "props:", board.props.length);
