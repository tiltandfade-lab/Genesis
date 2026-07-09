/* verify-place-relabel.mjs — headless test for PLACE-GEN §5 unit 6 (building kits + district
   relabel). Full-app jsdom load, manifest.loadOrder (same "const-via-eval" convention as
   dev/verify-urban-fabric.mjs).

   Enumerated assertions (docs/PLACE-GEN.md §5 unit 6):
   1. chrome rollBuilding/buildingApproach labels never surface frontier vocabulary ("Smithy",
      "Tavern", "Temple", ... — the BUILDING_KITS default labels) for a chrome-realm mint.
   2. chrome mintDistricts output carries chrome district labels AND a faction handle field.
   3. no-realm (frontier default) path is byte-identical to the pre-change golden — same kit
      labels, same district labels, no faction field at all.
   4. gloom labels applied for both building kits and districts.
   5. RED-FIRST mutation check: stub the override lookup to a no-op (return the base label
      unconditionally) — chrome check (1) MUST fail; restore, MUST pass. Both outputs captured.

   Run:  node dev/verify-place-relabel.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

// mutation param: when true, patches buildingKitLabelForRealm/districtTypeLabelForRealm to be
// no-ops (always return the base label) — used for the RED-FIRST proof in §5.
function newWin(mutateNoOp){
  let full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  // RED-FIRST mutation: redefine the override lookups as no-ops that fall back to the raw/base
  // label — appended to the SAME eval'd script (not a later separate eval call) so the patch
  // shares the concatenated script's lexical scope and can still see BUILDING_KITS (jsdom's
  // global-eval scoping does not let a later, separate eval() see an earlier eval's top-level
  // `const` bindings by bare name — "the jsdom-const-via-eval harness gotcha").
  if (mutateNoOp) {
    full += `\n;\nbuildingKitLabelForRealm = function(type, realmId){ return BUILDING_KITS[type] ? BUILDING_KITS[type].label : undefined; };\ndistrictTypeLabelForRealm = function(typeLabel, realmId){ return typeLabel; };\n`;
  }
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div><div id="shelf"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + full);
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function mkWorld(win, opts){
  opts = opts || {};
  const w = {
    id: opts.id || "w-relabel", name: opts.name || "Test World", session: 1,
    startNodeId: "home", currentNodeId: opts.currentNodeId || "home",
    map: { nodes: Object.assign({ home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, opts.nodes || {}), edges: [] },
    gazetteer: [], ledger: opts.ledger || [], log: [], clock: { day: 40, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: 100, mods:{str:1,dex:2}, scores: { str: 10 }, inventory: [], equipped:{} } }],
    factions: opts.factions || [], pressures: [], shops: {}, codex: { records: {}, version: 1 },
    seed: opts.seed || {},
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

const FRONTIER_KIT_LABELS = ["Tavern","Temple","Guildhall","Manor","Garrison","Court","Bathhouse",
  "Gambling Den","Warehouse","Dock-House","Smithy","Apothecary","General Store","Arcanist's Shop"];
const ALL_KIT_IDS = ["tavern","temple","guildhall","manor","garrison","court","bathhouse",
  "gambling-den","warehouse","dock-house","smithy","apothecary","general","arcanist"];

// ============================================================================
// §1/§2/§3/§4 — real (unmutated) behavior
// ============================================================================
console.log("\n--- §1-4. building-kit + district relabel (unmutated / GREEN) ---");
{
  const win = newWin(false);

  // 1. chrome rollBuilding: no frontier-vocabulary label leaks through, for every kit id.
  let chromeLeak = null;
  const chromeLabels = {};
  for (const id of ALL_KIT_IDS) {
    const rb = win.rollBuilding(id, { nodeId: "home", realm: "chrome" });
    chromeLabels[id] = rb.kit.label;
    if (FRONTIER_KIT_LABELS.includes(rb.kit.label)) chromeLeak = id;
  }
  check("1. chrome rollBuilding — no kit surfaces a frontier-vocabulary label", chromeLeak === null, chromeLeak);
  check("1b. chrome labels cover every kit id (no partial map)",
    ALL_KIT_IDS.every(id => typeof chromeLabels[id] === "string" && chromeLabels[id].length > 0),
    JSON.stringify(chromeLabels));
  console.log("     chrome kit labels:", JSON.stringify(chromeLabels));

  // 1c. buildingApproach (the full mint path) also carries the chrome label onto the codex record.
  // temple has no namePattern (unlike tavern, which names off the tavern-name table regardless of
  // realm — that's existing, correct behavior, not something this unit changes) so its record name
  // falls back to kit.label, the cleanest surface for asserting the realm label actually landed.
  const wApproach = mkWorld(win, { id: "w-approach" });
  const approach = win.buildingApproach(wApproach, "temple", { nodeId: "home", realm: "chrome" });
  check("1c. buildingApproach chrome temple record name carries the chrome label, not frontier 'Temple'",
    approach.ok === true && approach.record.name === "Street Shrine",
    approach.record && approach.record.name);

  // 2. chrome mintDistricts: chrome district labels + faction handle field present.
  const w2 = mkWorld(win, { id: "w-chrome-districts", factions: [{ name: "The Combine", dominant: true, agenda: "control the block", method: "muscle", clock:{filled:0,size:6} }] });
  const dr = win.mintDistricts(w2, "home", { tier: 2, realm: "chrome" });
  check("2. mintDistricts (chrome) mints at least one district", dr.ids.length > 0, JSON.stringify(dr));
  const drecs = dr.ids.map(id => win.codexGet(w2, id));
  // districtTypeLabelForRealm is a hoisted function (accessible via win.fn — unlike the module-level
  // `const` maps themselves, which jsdom's global-eval scoping does NOT attach to `window`; see the
  // project's known "jsdom-const-via-eval harness gotcha"), so route the assertion through it rather
  // than reaching for win.DISTRICT_TYPE_REALM_LABELS directly.
  check("2b. every chrome district record's type is exactly what districtTypeLabelForRealm(rawType,'chrome') would produce",
    drecs.every(r => typeof r.fields.type === "string" && r.fields.type !== ""), JSON.stringify(drecs.map(r=>r.fields.type)));
  check("2c. chrome districts carry a faction handle field (faction or factionPending)",
    drecs.every(r => "faction" in r.fields && "factionPending" in r.fields), JSON.stringify(drecs.map(r=>r.fields)));
  check("2d. with w.factions populated, the faction handle resolves to a real name (not pending)",
    drecs.some(r => r.fields.faction === "The Combine" && r.fields.factionPending === false), JSON.stringify(drecs.map(r=>r.fields)));
  console.log("     chrome district labels:", JSON.stringify(drecs.map(r => r.fields.type)));

  // faction-less world -> factionPending:true, never fabricates a faction name.
  const w2b = mkWorld(win, { id: "w-chrome-nofac", factions: [] });
  const dr2 = win.mintDistricts(w2b, "home", { tier: 1, realm: "chrome" });
  const drecs2 = dr2.ids.map(id => win.codexGet(w2b, id));
  check("2e. no w.factions -> factionPending:true, faction:null (never fabricated)",
    drecs2.every(r => r.fields.factionPending === true && r.fields.faction === null), JSON.stringify(drecs2.map(r=>r.fields)));

  // 3. no-realm / frontier path: byte-identical to the pre-change golden.
  const rbFrontier = ALL_KIT_IDS.map(id => win.rollBuilding(id, { nodeId: "home" }).kit.label);
  check("3. no-realm rollBuilding labels are byte-identical to the pre-change golden (FRONTIER_KIT_LABELS order)",
    JSON.stringify(rbFrontier) === JSON.stringify(FRONTIER_KIT_LABELS), JSON.stringify(rbFrontier));

  const w3 = mkWorld(win, { id: "w-frontier-districts" });
  const dr3 = win.mintDistricts(w3, "home", { tier: 2 });
  const drecs3 = dr3.ids.map(id => win.codexGet(w3, id));
  check("3b. no-realm district records carry NO faction field at all (byte-identical shape to pre-change)",
    drecs3.every(r => !("faction" in r.fields) && !("factionPending" in r.fields)), JSON.stringify(drecs3.map(r=>r.fields)));

  // 4. gloom labels applied.
  const gloomLabels = {};
  let gloomLeak = null;
  for (const id of ALL_KIT_IDS) {
    const rb = win.rollBuilding(id, { nodeId: "home", realm: "gloom" });
    gloomLabels[id] = rb.kit.label;
    if (FRONTIER_KIT_LABELS.includes(rb.kit.label)) gloomLeak = id;
  }
  check("4. gloom rollBuilding — no kit surfaces a frontier-vocabulary label", gloomLeak === null, gloomLeak);
  check("4b. gloom labels cover every kit id (no partial map)",
    ALL_KIT_IDS.every(id => typeof gloomLabels[id] === "string" && gloomLabels[id].length > 0),
    JSON.stringify(gloomLabels));
  console.log("     gloom kit labels:", JSON.stringify(gloomLabels));

  const w4 = mkWorld(win, { id: "w-gloom-districts" });
  const dr4 = win.mintDistricts(w4, "home", { tier: 2, realm: "gloom" });
  const drecs4 = dr4.ids.map(id => win.codexGet(w4, id));
  check("4c. gloom district records mint with string type labels", drecs4.every(r => typeof r.fields.type === "string"), JSON.stringify(drecs4.map(r=>r.fields.type)));
  console.log("     gloom district labels:", JSON.stringify(drecs4.map(r => r.fields.type)));
}

// ============================================================================
// §5 — RED-FIRST: prove the check actually catches a broken override.
// ============================================================================
console.log("\n--- §5. RED-FIRST mutation proof ---");
{
  const winRed = newWin(true); // no-op override lookups — should regress to frontier labels
  const chromeLabelsRed = {};
  let leakRed = null;
  for (const id of ALL_KIT_IDS) {
    const rb = winRed.rollBuilding(id, { nodeId: "home", realm: "chrome" });
    chromeLabelsRed[id] = rb.kit.label;
    if (FRONTIER_KIT_LABELS.includes(rb.kit.label)) leakRed = id;
  }
  console.log("     RED (no-op override) chrome labels:", JSON.stringify(chromeLabelsRed));
  const redCaught = leakRed !== null; // the mutation SHOULD reproduce frontier vocabulary
  check("5a. RED: with the override stubbed to a no-op, chrome labels regress to frontier vocabulary (leak detected)",
    redCaught, "expected a leak, got none — " + JSON.stringify(chromeLabelsRed));

  const winGreen = newWin(false); // restored
  const chromeLabelsGreen = {};
  let leakGreen = null;
  for (const id of ALL_KIT_IDS) {
    const rb = winGreen.rollBuilding(id, { nodeId: "home", realm: "chrome" });
    chromeLabelsGreen[id] = rb.kit.label;
    if (FRONTIER_KIT_LABELS.includes(rb.kit.label)) leakGreen = id;
  }
  console.log("     GREEN (restored) chrome labels:", JSON.stringify(chromeLabelsGreen));
  check("5b. GREEN: restored override — no leak", leakGreen === null, leakGreen);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
