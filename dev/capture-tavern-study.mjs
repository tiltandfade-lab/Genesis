/* capture-tavern-study.mjs
   Deterministic evidence capture for VENUE-TAVERN-01.

   This exercises two existing surfaces without changing either:
   1. the live integrated path: rollPlace -> codex mint -> buildingApproach("tavern")
      -> buildingContact; and
   2. the compiled-but-currently-unwired Tavern 2.0 depth tables.

   The seed search only selects first-roll Watering-hole/Lodging contexts. Every retained
   receipt records its search nonce, numeric seed, source refs, and complete returned atoms.

   Run:
     node dev/capture-tavern-study.mjs
*/
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "Reference", "Tavern-Study", "ROLL-RECEIPTS.json");
const read = (path) => readFileSync(join(ROOT, path), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");
const manifest = JSON.parse(read("manifest.json"));
const appSource =
  read("tables.js") +
  "\n;\n" +
  manifest.loadOrder.filter((path) => path.endsWith(".js")).map(read).join("\n;\n");
const harness = "var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;";

function newWindow() {
  const dom = new JSDOM(
    "<!doctype html><html><body><div id=\"worldView\"></div><div id=\"toast\"></div><div id=\"shelf\"></div></body></html>",
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  dom.window.eval(harness + "\n" + appSource);
  dom.window.Date.now = () => 1785081600000;
  return dom.window;
}

function hash32(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedWindow(win, seed) {
  win.Math.random = mulberry32(seed);
}

function makeWorld(win, realm, placePayload) {
  const world = {
    id: "tavern-study-" + realm,
    name: "Tavern Study — " + realm,
    session: 1,
    startNodeId: "home",
    currentNodeId: "home",
    map: {
      nodes: {
        home: { id: "home", name: placePayload.name, type: "Setting", x: 0, y: 0 },
        far: { id: "far", name: "Far Reach", type: "Setting", x: 6, y: 4 },
      },
      edges: [],
    },
    gazetteer: [],
    ledger: [
      {
        id: "prior-fact",
        type: "outcome",
        day: 35,
        data: { nodeId: "far" },
        text: "The bridge at Far Reach was closed after the flood.",
      },
    ],
    log: [],
    clock: { day: 40, min: 1080 },
    characters: [
      {
        status: "living",
        name: "Wren",
        conditions: [],
        sheet: {
          level: 3,
          gold: 100,
          mods: { str: 1, dex: 2 },
          scores: { str: 10 },
          inventory: [],
          equipped: {},
        },
      },
    ],
    factions: [],
    pressures: [],
    shops: {},
    codex: { records: {}, version: 1 },
    seed: { master: { realm } },
  };
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  const placeRecord = win.codexAdd(
    world,
    Object.assign({}, placePayload, { status: { soft: true, at: "home" } })
  );
  world.map.nodes.home.codexId = placeRecord.id;
  return { world, placeRecord };
}

function compactTableRoll(roll) {
  if (!roll) return null;
  return {
    id: roll.id,
    dice: roll.dice,
    total: roll.total,
    band: roll.band || null,
    text: roll.text,
    cells: roll.cells,
  };
}

function compactRecord(record) {
  if (!record) return null;
  return {
    id: record.id,
    kind: record.kind,
    name: record.name,
    provenance: record.provenance,
    source: record.source,
    rolled: record.rolled,
    fields: record.fields,
    dm: record.dm,
    status: record.status,
    links: record.links,
  };
}

function findHospitalitySeeds(win, realm, count) {
  const seeds = [];
  for (let nonce = 0; nonce < 5000 && seeds.length < count; nonce++) {
    const label = "VENUE-TAVERN-01/" + realm + "/" + nonce;
    const seed = hash32(label);
    seedWindow(win, seed);
    const place = win.rollPlace({ realm, depth: true, archetypeBias: [2, 11] });
    if (place && (place.rolled.archetypeKey === 2 || place.rolled.archetypeKey === 11)) {
      seeds.push({ label, seed, nonce });
    }
  }
  if (seeds.length !== count) {
    throw new Error("Could not find " + count + " hospitality seeds for " + realm);
  }
  return seeds;
}

function captureReceipt(realm, selection, ordinal) {
  const win = newWindow();

  seedWindow(win, selection.seed);
  const placePayload = win.rollPlace({ realm, depth: true, archetypeBias: [2, 11] });

  // Reseed so the direct typed-roll receipt and the integrated approach consume
  // the same tavern atoms. The direct receipt retains table provenance that the
  // codex record deliberately compacts away.
  seedWindow(win, selection.seed ^ 0x9e3779b9);
  const typedRoll = win.rollBuilding("tavern", { nodeId: "home", realm, tier: 2 });
  seedWindow(win, selection.seed ^ 0x9e3779b9);
  const { world, placeRecord } = makeWorld(win, realm, placePayload);
  const approach = win.buildingApproach(world, "tavern", {
    nodeId: "home",
    realm,
    tier: 2,
  });
  const proprietor = win.codexGet(world, approach.proprietorId);
  const contact = win.buildingContact(world, approach.id);
  const buildingAfterContact = win.codexGet(world, approach.id);
  const proprietorAfterContact = win.codexGet(world, approach.proprietorId);

  // These tables are compiled, callable, and preserved verbatim, but are not
  // consumed by buildingApproach/buildingContact today. Keep them in a visibly
  // separate evidence lane.
  seedWindow(win, selection.seed ^ 0x85ebca6b);
  const depthRolls = {
    foundation: {
      tavernType: compactTableRoll(
        win.rollTable("tavern-type-d20-source-dmg-p-113")
      ),
      qualityTier: compactTableRoll(
        win.rollTable("quality-tier-d6-source-phb-lifestyle-expenses")
      ),
      whoItServes: compactTableRoll(win.rollTable("who-it-serves-d10")),
      knownFor: compactTableRoll(
        win.rollTable("known-for-its-d20-source-adapted-from-dmg-p-114")
      ),
    },
    sensoryAtmosphere: compactTableRoll(win.rollTable("tavern-sensory-atmosphere")),
    barkeepQuirk: compactTableRoll(win.rollTable("tavern-barkeep-quirk")),
    inMediaRes: compactTableRoll(win.rollTable("tavern-in-media-res")),
  };

  return {
    receiptId: "TVR-" + realm.toUpperCase() + "-" + String(ordinal).padStart(2, "0"),
    realm,
    seed: {
      label: selection.label,
      value: selection.seed,
      selectionNonce: selection.nonce,
      selectionRule:
        "first rollPlace invocation must resolve to universal spine key 2 (Watering-hole) or 11 (Lodging)",
    },
    liveIntegratedPath: {
      place: compactRecord(placeRecord),
      typedBuildingRoll: {
        ok: typedRoll.ok,
        type: typedRoll.type,
        kit: typedRoll.kit,
        name: typedRoll.name,
        interior: typedRoll.interior,
      },
      approach: {
        ok: approach.ok,
        building: compactRecord(approach.record),
        proprietor: compactRecord(proprietor),
        ambient: approach.ambient,
      },
      contact: {
        result: contact,
        buildingStatusAfter: buildingAfterContact && buildingAfterContact.status,
        proprietorStatusAfter: proprietorAfterContact && proprietorAfterContact.status,
      },
    },
    compiledUnwiredDepthLane: depthRolls,
  };
}

const selectorWindow = newWindow();
const realms = ["frontier", "chrome", "gloom"];
const selected = Object.fromEntries(
  realms.map((realm) => [realm, findHospitalitySeeds(selectorWindow, realm, 4)])
);
const receipts = realms.flatMap((realm) =>
  selected[realm].map((selection, index) =>
    captureReceipt(realm, selection, index + 1)
  )
);

const result = {
  schema: "genesis.tavern-study.roll-receipts.v1",
  capturedOn: "2026-07-26",
  repositoryHead: execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf-8",
  }).trim(),
  sourcePaths: [
    "data/building-kits.js",
    "data/place-skins.js",
    "src/engine/codex-roll.js",
    "src/world/urban.js",
    "Engine/02. _Procedures/Tavern Generator 2.0.md",
    "Engine/03. _Tables/03. Session Mechanics/Tavern/",
  ],
  captureRules: {
    sampleCount: receipts.length,
    realms,
    samplesPerRealm: 4,
    placeBias: [2, 11],
    livePath:
      "rollPlace -> codexAdd -> buildingApproach('tavern') -> buildingContact",
    depthLane:
      "direct rollTable calls; compiled and preserved, explicitly not wired into the live typed-building lifecycle",
  },
  receipts,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n", "utf-8");
console.log(
  "Wrote " +
    receipts.length +
    " deterministic tavern receipts to " +
    relative(ROOT, OUT)
);
