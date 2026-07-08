/* Verify TABLETOP-UNITS.md §U4 — Cast tableau + arrangement grammar (TABLETOP-VISION.md §3,
   §9.1 determinism, the §U4 hostile-attitude mutation check).

   jsdom, real genesis.html classic modules in document order (dev/verify-tabletop-u1.mjs/u2.mjs/
   u3.mjs's own established convention) — castFrom/arrangeTableau (src/engine/theater-data.js)
   read live global functions (prepEligibleCompanionCreatures, codexHereNowIds, codexOf,
   codexGetAttitude, codexAmbientPresenceFor) that only resolve correctly in a real classic-script
   execution context.

   Checks:
     1. shopfront scenario: a market node with a shop open, one contacted NPC + 2 soft ambients +
        1 eligible companion -> painted NPC lands in "shopfront" slot 1, ambients land in "back"
        slots, PC lands "front-center". (§U4 acceptance (a).)
     2. attitude shift (facing-pair, no shop, no walk, exactly 1 contacted NPC): bumping the NPC's
        codex attitude changes ONLY that NPC's stamped x/z — PC/ally/ambient positions are
        byte-identical before and after (the dirty-key check, §U4 acceptance (b)).
     3. §9.1 purity: two castFrom calls over the IDENTICAL world snapshot (no mutation between
        them) produce a deep-equal unit list.
     4. §U4 MUTATION CHECK [RED-FIRST]: with the "-2" (hostile) row PRESENT, a hostile NPC in
        facing-pair sits at the hostile-specific far distance (3.0) — proven first. Then the row
        is deleted from the live THEATER_ATTITUDE_PLACEMENT table and the SAME hostile NPC is
        re-arranged: it now falls back to the neutral DEFAULT distance (2.0), not 3.0 — proving
        the table (not decoration) actually drives placement. Restored after.
     5. combat path untouched: theaterUnitsFrom's own shape/behavior is unaffected by this unit
        (a quick combat fixture still produces bandidx/laneidx-derived units, sanity-only).

   Run:  node dev/verify-tabletop-u4.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const CLASSIC_FILES = man.loadOrder.filter((p) => p.endsWith(".js"));
const moduleSrc = CLASSIC_FILES.map(read).join("\n;\n");
const TABLES_SRC = read("tables.js");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null; var GS={dm:{},combat:{active:false}};
  function toast(){} function renderWorld(){} function wakeReveal(){}`;

// test-only bridge: THEATER_ATTITUDE_PLACEMENT/_DEFAULT are top-level `const`s in theater-data.js,
// which (per ui.ref-globals-bridge's own header note) never attach to `window` — a SEPARATE
// win.eval() call afterwards can't see them (each indirect eval gets its own lexical scope; only
// the ONE big eval that ran the classic modules can close over them, same as every function
// declaration in this file). Republishing them here, inside the SAME eval call, is the only way
// this harness can reach in for the mutation test (§U4's own production code stays untouched).
const ATTITUDE_BRIDGE_TAIL = "\nwindow.__U4_ATTITUDE_TABLE = THEATER_ATTITUDE_PLACEMENT; window.__U4_ATTITUDE_DEFAULT = THEATER_ATTITUDE_PLACEMENT_DEFAULT;";

function freshWin(customSrc) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (customSrc || (TABLES_SRC + "\n;\n" + moduleSrc)) + ATTITUDE_BRIDGE_TAIL);
  return win;
}

function freshWorld(over) {
  return Object.assign({
    id: "w1", name: "Test World", session: 1, currentNodeId: "market",
    map: { nodes: { market: { id: "market", name: "Market Square", type: "Setting", x: 0, y: 0 } }, edges: [] },
    ledger: [], clock: { day: 1, min: 600 }, dmlog: [{ role: "player", text: "already-going" }], dm: {}, gazetteer: [],
    characters: [{ status: "living", name: "Wren", conditions: [], sheet: { level: 3, hp: 20, hpCur: 20, class: "fighter", mods: {}, ac: 15, skillProfs: [] } }],
    factions: [], pressures: [],
    seed: { master: { name: "Test Realm", desc: "d" }, smell: { name: "s" }, sound: { name: "n" }, arch: { name: "a" },
      taboo: { name: "t", desc: "td" }, myth: { name: "m", desc: "md" } },
  }, over || {});
}
function stubActiveWorld(win, w) { win.U.worlds[w.id] = w; win.U.activeWorldId = w.id; }

function addContactedNpc(win, w, id, nodeId, name) {
  win.codexAdd(w, { id, kind: "npc", name: name || id, provenance: "rolled",
    status: { known: true, soft: false, at: nodeId } });
  return id;
}
function addAmbient(win, w, nodeId, n, startIdx) {
  const ids = [];
  for (let i = (startIdx || 0); i < (startIdx || 0) + n; i++) {
    const id = "npc:ambient-" + nodeId + "-" + i;
    win.codexAdd(w, { id, kind: "npc", name: "Ambient " + i, provenance: "rolled",
      status: { soft: true, at: nodeId }, dm: { ambient: true } });
    ids.push(id);
  }
  return ids;
}
function addCompanion(win, w, id, name) {
  win.codexAdd(w, { id, kind: "creature", name, provenance: "rolled",
    fields: { type: "beast", size: "medium" }, status: { known: true, soft: false, at: null } });
  win.codexAttitudeOpen(w, id, 1, {});
  return id;
}

// ============================================================================
// 1. shopfront scenario
// ============================================================================
console.log("=== 1: shopfront arrangement ===");
{
  const win = freshWin();
  const w = freshWorld();
  stubActiveWorld(win, w);
  addContactedNpc(win, w, "npc:shopkeep", "market", "Old Bram");
  addAmbient(win, w, "market", 2);
  addCompanion(win, w, "creature:fox", "Fox");

  const units = win.castFrom(w, { hereNodeId: "market", shopOpen: true, walking: false });
  const pc = units.find(u => u.kind === "pc");
  const npc = units.find(u => u.kind === "npc");
  const ambients = units.filter(u => u.kind === "ambient");
  const ally = units.find(u => u.kind === "ally");

  check("PC lands front-center", !!pc && pc.band === "front-center", JSON.stringify(pc));
  check("painted NPC lands in shopfront slot 1", !!npc && npc.band === "shopfront" && npc.slot === 1, JSON.stringify(npc));
  check("2 ambient blanks staged, both in the back band", ambients.length === 2 && ambients.every(a => a.band === "back"), JSON.stringify(ambients));
  check("ambients carry pieceKey blank:figure + blank:true", ambients.every(a => a.pieceKey === "blank:figure" && a.blank === true), JSON.stringify(ambients));
  check("companion ally is staged", !!ally, JSON.stringify(units.map(u => u.kind)));
  check("PC and NPC occupy different z (front vs counter row)", pc && npc && pc.z !== npc.z, JSON.stringify({ pcz: pc && pc.z, npcz: npc && npc.z }));
}

// ============================================================================
// 2. attitude shift moves only the NPC's band (dirty-key check), facing-pair
// ============================================================================
console.log("\n=== 2: attitude shift moves only the attitude-mapped unit ===");
{
  const win = freshWin();
  const w = freshWorld();
  stubActiveWorld(win, w);
  addContactedNpc(win, w, "npc:guard", "market", "Guard Rennick");
  addAmbient(win, w, "market", 1);
  addCompanion(win, w, "creature:fox", "Fox");
  win.codexSetAttitude(w, "npc:guard", 0, "opening-neutral");

  const before = win.castFrom(w, { hereNodeId: "market", shopOpen: false, walking: false });
  const npcBefore = before.find(u => u.kind === "npc");
  const pcBefore = before.find(u => u.kind === "pc");
  const allyBefore = before.find(u => u.kind === "ally");
  const ambBefore = before.find(u => u.kind === "ambient");
  check("exactly 1 contacted NPC selects facing-pair (sanity)", !!npcBefore && npcBefore.band === "facing", JSON.stringify(npcBefore));

  win.codexSetAttitude(w, "npc:guard", 2, "won-over"); // helpful now — near + angled
  const after = win.castFrom(w, { hereNodeId: "market", shopOpen: false, walking: false });
  const npcAfter = after.find(u => u.kind === "npc");
  const pcAfter = after.find(u => u.kind === "pc");
  const allyAfter = after.find(u => u.kind === "ally");
  const ambAfter = after.find(u => u.kind === "ambient");

  check("the NPC's own position changed (attitude 0 -> 2 moves it nearer)",
    npcBefore.x !== npcAfter.x || npcBefore.z !== npcAfter.z, JSON.stringify({ before: npcBefore, after: npcAfter }));
  check("PC position is byte-identical (untouched by the NPC's attitude shift)",
    pcBefore.x === pcAfter.x && pcBefore.z === pcAfter.z, JSON.stringify({ before: pcBefore, after: pcAfter }));
  check("ally position is byte-identical", allyBefore.x === allyAfter.x && allyBefore.z === allyAfter.z, "");
  check("ambient position is byte-identical", ambBefore.x === ambAfter.x && ambBefore.z === ambAfter.z, "");
}

// ============================================================================
// 3. §9.1 purity — identical snapshot -> identical unit list
// ============================================================================
console.log("\n=== 3: §9.1 determinism/purity ===");
{
  const win = freshWin();
  const w = freshWorld();
  stubActiveWorld(win, w);
  addContactedNpc(win, w, "npc:a", "market", "A");
  addContactedNpc(win, w, "npc:b", "market", "B");
  addAmbient(win, w, "market", 3);
  addCompanion(win, w, "creature:fox", "Fox");

  const source = { hereNodeId: "market", shopOpen: false, walking: false };
  const u1 = win.castFrom(w, source);
  const u2 = win.castFrom(w, source);
  check("two castFrom calls over the identical snapshot produce a deep-equal unit list",
    JSON.stringify(u1) === JSON.stringify(u2), "u1=" + JSON.stringify(u1) + " u2=" + JSON.stringify(u2));
  check("ring arrangement selected for >1 contacted NPC (sanity)",
    u1.some(u => u.kind === "npc" && u.band === "ring"), JSON.stringify(u1.filter(u => u.kind === "npc")));
}

// ============================================================================
// 4. §U4 MUTATION CHECK [RED-FIRST] — remove the hostile ("-2") attitude-table row
// ============================================================================
console.log("\n=== 4: §U4 mutation check — hostile row removal breaks default-distance ===");
{
  const win = freshWin();
  const w = freshWorld();
  stubActiveWorld(win, w);
  addContactedNpc(win, w, "npc:foe", "market", "Hostile Foe");
  win.codexSetAttitude(w, "npc:foe", -2, "opening-hostile");

  const source = { hereNodeId: "market", shopOpen: false, walking: false };

  console.log("  --- GREEN (table intact): hostile NPC sits at the hostile-specific far distance ---");
  const clean = win.castFrom(w, source);
  const npcClean = clean.find(u => u.kind === "npc");
  const distClean = npcClean ? Math.hypot(npcClean.x, npcClean.z) : null;
  // top-level `const` in a classic <script> never attaches to `window` (the ui.ref-globals-bridge
  // module's own header notes this exact jsdom gotcha) — freshWin's ATTITUDE_BRIDGE_TAIL republishes
  // these two onto window from WITHIN the same eval call that defined them, so this is the real,
  // live object castFrom's closure reads (not a clone).
  const ATTITUDE_TABLE = win.__U4_ATTITUDE_TABLE;
  const ATTITUDE_DEFAULT = win.__U4_ATTITUDE_DEFAULT;
  const HOSTILE_DIST = ATTITUDE_TABLE["-2"].dist;
  const DEFAULT_DIST = ATTITUDE_DEFAULT.dist;
  check("[RED-FIRST PROOF, pre-mutation / GREEN] hostile NPC distance === the hostile row's dist ("
      + HOSTILE_DIST + "), which differs from the neutral default (" + DEFAULT_DIST + ")",
    Math.abs(distClean - HOSTILE_DIST) < 1e-9 && HOSTILE_DIST !== DEFAULT_DIST,
    "distClean=" + distClean + " hostileDist=" + HOSTILE_DIST + " defaultDist=" + DEFAULT_DIST);

  console.log("  --- RED (table row deleted): the SAME hostile NPC now reads as default distance ---");
  const savedHostileRow = ATTITUDE_TABLE["-2"];
  delete ATTITUDE_TABLE["-2"];
  const mutated = win.castFrom(w, source);
  const npcMutated = mutated.find(u => u.kind === "npc");
  const distMutated = npcMutated ? Math.hypot(npcMutated.x, npcMutated.z) : null;
  check("[MUTATION RED] with the hostile row deleted, distance falls to the DEFAULT (" + DEFAULT_DIST
      + "), no longer the hostile-specific value (" + HOSTILE_DIST + ") — proves the table (not "
      + "decoration) drives placement",
    Math.abs(distMutated - DEFAULT_DIST) < 1e-9 && Math.abs(distMutated - HOSTILE_DIST) > 1e-9,
    "distMutated=" + distMutated);

  ATTITUDE_TABLE["-2"] = savedHostileRow;
  const restored = win.castFrom(w, source);
  const npcRestored = restored.find(u => u.kind === "npc");
  const distRestored = npcRestored ? Math.hypot(npcRestored.x, npcRestored.z) : null;
  check("[RESTORED] hostile distance reads correctly again after restoring the table row",
    Math.abs(distRestored - HOSTILE_DIST) < 1e-9, "distRestored=" + distRestored);
}

// ============================================================================
// 5. combat path untouched — theaterUnitsFrom sanity (band/lane grid, not the tableau)
// ============================================================================
console.log("\n=== 5: combat path (theaterUnitsFrom) untouched ===");
{
  const win = freshWin();
  const combat = { pc: { band: "melee", lane: "C" }, pcRef: { class: "fighter" }, allies: [], foes: [
    { fid: "f1", band: "near", lane: "L", name: "Wolf", creatureType: "beast" }
  ], grid: { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"] } };
  const { units } = win.theaterUnitsFrom(combat);
  check("theaterUnitsFrom still returns band/lane-derived units (untouched by castFrom/arrangeTableau)",
    Array.isArray(units) && units.length === 2 && units.every(u => typeof u.x === "number" && typeof u.z === "number"),
    JSON.stringify(units));
}

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail > 0 ? 1 : 0);
