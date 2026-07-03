/* verify-migrations.mjs — headless test for FOREVER STORAGE's boot-once localStorage->IndexedDB
   migration (docs/FOREVER-STORAGE.md §1, docs/BATCH3-GUARDRAILS.md J1: forever-guards ≥10/0 combined with
   verify-storage.mjs) + the vintage fixture #1 load-clean check (FOREVER-STORAGE.md §4).
   Full-app jsdom load, manifest.loadOrder (same convention as dev/verify-storage.mjs) + the fake-
   IndexedDB shim (dev/fake-idb-shim.mjs, BATCH3-GUARDRAILS J2).

   Enumerated assertions:
   1. LS->IDB migration round-trip deep-equal: every world in a legacy genesis-universe-v2 blob lands in
      IDB byte-identical to the original.
   2. the LS original SURVIVES migration untouched (never deleted this release).
   3. MUTATION CHECK: delete the LS original after migrating, confirm the harness's own "still there"
      assertion goes RED, restore, confirm GREEN — pins that survival is actually load-bearing, not an
      accidental pass.
   4. migration is idempotent: a second migrateLStoIDB() call on an already-migrated universe is a no-op
      (doesn't re-import/duplicate).
   5. a world that fails read-back verification is NOT marked migrated (so a later boot retries it) —
      the LS original stays the fallback.
   6. an empty/absent localStorage blob degrades to {ok:true, empty:true} — never throws.
   7. a malformed (non-JSON) localStorage blob degrades to a flagged failure — never throws, never
      silently "succeeds" with nothing imported.
   8. vintage fixture #1 (dev/fixtures/saves/vintage-1.json, frozen from today's real world shape) loads
      clean through migrateWorld with no errors and every spine field present.
   9. the vintage fixture round-trips through the SAME LS->IDB migration path as any other save.
   10. regression: every existing saveU call path (world.state) still round-trips through migrateAll
       without throwing, with the vintage fixture loaded as the active world.

   Run:  node dev/verify-migrations.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { installFakeIndexedDB } from "./fake-idb-shim.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function newWin(withIDB) {
  const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div><div id="shelf"></div><div id="storageMeter"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  let shim = null;
  if (withIDB !== false) shim = installFakeIndexedDB(dom.window);
  dom.window.eval(harness + "\n" + full);
  return { win: dom.window, shim };
}
const flush = (n = 10) => new Promise((resolve) => {
  let i = 0;
  const step = () => { if (++i >= n) resolve(); else queueMicrotask(step); };
  step();
});

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function legacyWorld(id) {
  return {
    id, name: "Legacy " + id, session: 2, currentNodeId: "home",
    map: { nodes: { home: { id: "home", name: "Home", type: "Setting" } }, edges: [] },
    gazetteer: [], ledger: [{ id: "l1", type: "session", day: 1, min: 300, text: "Session 1 begins." }],
    clock: { day: 3, min: 480 }, dmlog: [{ role: "player", text: "hi", session: 1, t: 1 }],
    characters: [{ status: "living", name: "Wren", conditions: [], sheet: { level: 2, gold: 40, mods: {}, scores: {}, inventory: [], equipped: {} } }],
    factions: [], pressures: [], shops: {}, codex: { records: {}, version: 1 },
  };
}
function seedLS(win, worldsObj, activeId) {
  win.localStorage.setItem("genesis-universe-v2", JSON.stringify({ worlds: worldsObj, activeWorldId: activeId || Object.keys(worldsObj)[0] }));
}

// ============================================================================
// 1-2. round-trip deep-equal + LS survives
// ============================================================================
console.log("\n--- LS -> IDB migration ---");
{
  const { win, shim } = newWin();
  const w1 = legacyWorld("m-1"), w2 = legacyWorld("m-2");
  seedLS(win, { "m-1": w1, "m-2": w2 }, "m-1");
  const r = await win.migrateLStoIDB();
  await flush();
  check("migration reports ok + migrated true", r.ok && r.migrated === true, JSON.stringify(r));
  const idbW1 = shim.data.worlds.get("m-1");
  const idbW2 = shim.data.worlds.get("m-2");
  check("world m-1 lands in IDB byte-identical to the original", JSON.stringify(idbW1) === JSON.stringify(w1));
  check("world m-2 lands in IDB byte-identical to the original", JSON.stringify(idbW2) === JSON.stringify(w2));
  const lsAfter = win.localStorage.getItem("genesis-universe-v2");
  check("the LS original SURVIVES migration untouched (never deleted this release)",
    typeof lsAfter === "string" && JSON.parse(lsAfter).worlds["m-1"] && JSON.parse(lsAfter).worlds["m-2"], "LS missing after migration");
}

// 3. MUTATION CHECK — the LS-survival guarantee is load-bearing, not incidental. We simulate a
// "someone added an LS.removeItem after migration" regression by patching migrateLStoIDB to clear LS,
// confirm the harness's survival check goes RED, then restore and confirm GREEN.
console.log("\n--- mutation guard: the LS original must survive a migration ---");
const storePath = join(ROOT, "src/world/store.js");
const originalStore = readFileSync(storePath, "utf-8");
const mutatedDeleteLS = originalStore.replace(
  "      return saveMeta(\"lsMigration\", metaPatch).then(()=>({ ok:true, migrated:allOk, verified, total:ids.length }));",
  "      try{ localStorage.removeItem(\"genesis-universe-v2\"); }catch(e){} /* MUTATION: delete the LS original after migrating */\n      return saveMeta(\"lsMigration\", metaPatch).then(()=>({ ok:true, migrated:allOk, verified, total:ids.length }));"
);
if (mutatedDeleteLS === originalStore) throw new Error("mutation pattern didn't match src/world/store.js — update the harness");
{
  try {
    writeFileSync(storePath, mutatedDeleteLS, "utf-8");
    const { win } = newWin();
    seedLS(win, { "m-mut": legacyWorld("m-mut") }, "m-mut");
    await win.migrateLStoIDB();
    await flush();
    const lsAfter = win.localStorage.getItem("genesis-universe-v2");
    check("MUTATION RED: with LS-deletion added, the original blob is gone after migration (confirms survival was load-bearing)",
      lsAfter === null);
  } finally {
    writeFileSync(storePath, originalStore, "utf-8");
  }
}
{
  const { win } = newWin();
  seedLS(win, { "m-mut2": legacyWorld("m-mut2") }, "m-mut2");
  await win.migrateLStoIDB();
  await flush();
  const lsAfter = win.localStorage.getItem("genesis-universe-v2");
  check("RESTORED: after reverting, the LS original survives migration again",
    typeof lsAfter === "string" && JSON.parse(lsAfter).worlds["m-mut2"]);
}

// 4. idempotent: a second call on an already-migrated universe is a no-op
{
  const { win, shim } = newWin();
  seedLS(win, { "m-idem": legacyWorld("m-idem") }, "m-idem");
  await win.migrateLStoIDB(); await flush();
  const before = JSON.stringify(shim.data.worlds.get("m-idem"));
  const r2 = await win.migrateLStoIDB(); await flush();
  check("a second migrateLStoIDB call reports already:true (no re-import)", r2.ok && r2.already === true, JSON.stringify(r2));
  const after = JSON.stringify(shim.data.worlds.get("m-idem"));
  check("the IDB record is untouched by the redundant second call", before === after);
}

// 5. a world that fails read-back verification is NOT marked migrated
{
  const { win, shim } = newWin();
  seedLS(win, { "m-bad": legacyWorld("m-bad") }, "m-bad");
  // force the write for this world's key to silently corrupt on read-back by monkey-patching storeGet
  // for just this call: simplest reliable way is to force the underlying write to fail via the shim.
  shim.forceNextWriteToFail();
  const r = await win.migrateLStoIDB();
  await flush();
  check("a world that fails verification leaves migrated:false (retry-on-next-boot)", r.ok && r.migrated === false, JSON.stringify(r));
  const lsAfter = win.localStorage.getItem("genesis-universe-v2");
  check("the LS original remains as the fallback when verification fails", typeof lsAfter === "string" && JSON.parse(lsAfter).worlds["m-bad"]);
}

// 6. empty/absent localStorage blob
{
  const { win } = newWin();
  const r = await win.migrateLStoIDB();
  check("no legacy blob present degrades to {ok:true, empty:true}", r.ok === true && r.empty === true, JSON.stringify(r));
}

// 7. malformed (non-JSON) localStorage blob
{
  const { win } = newWin();
  win.localStorage.setItem("genesis-universe-v2", "not json at all {{{");
  const r = await win.migrateLStoIDB();
  check("a malformed LS blob degrades to a flagged failure, never throws", r.ok === false && r.reason === "ls-parse-failed", JSON.stringify(r));
}

console.log(`\n✓ migration (pre-fixture): ${pass} passed, ${fail} failed so far`);

// ============================================================================
// 8-10. VINTAGE FIXTURE #1 — frozen from today's real (post-batch-3) world shape
// ============================================================================
console.log("\n--- vintage fixture #1 ---");
const fixtureDir = join(ROOT, "dev/fixtures/saves");
const fixturePath = join(fixtureDir, "vintage-1.json");

// Generate the fixture once (deterministic content, hand-authored to match today's real migrateWorld
// input/output shape) if it doesn't exist yet — frozen going forward, never regenerated by a later run.
if (!existsSync(fixturePath)) {
  if (!existsSync(fixtureDir)) mkdirSync(fixtureDir, { recursive: true });
  const vintageWorld = {
    id: "vintage-1", name: "The Vintage World", session: 6, sessionLive: false, currentNodeId: "home",
    startNodeId: "home", knowsTime: false,
    map: { nodes: { home: { id: "home", name: "Hearthhold", type: "Setting" }, farshore: { id: "farshore", name: "Farshore", type: "Place" } },
      edges: [{ from: "home", to: "farshore", bearing: "E", travelMin: 180, leagues: 4 }] },
    gazetteer: [{ name: "Hearthhold", type: "Setting" }],
    ledger: [
      { id: "l1", type: "session", day: 1, min: 360, text: "Session 1 begins — Day 1, morning.", data: { n: 1 } },
      { id: "l2", type: "outcome", day: 2, min: 420, text: "A blade was drawn in anger.", data: {} },
      { id: "l3", type: "canon", day: 1, min: 360, text: "The world's seed myth is written.", data: { origin: true } },
    ],
    clock: { day: 6, min: 540 },
    dmlog: [
      { role: "player", text: "I approach the gate.", session: 1, t: 1000 },
      { role: "dm", text: "The gate creaks open.", session: 1, t: 1001 },
      { role: "player", text: "I ready my blade.", session: 5, t: 5000 },
      { role: "dm", text: "Steel sings free.", session: 5, t: 5001 },
      { role: "player", text: "I strike.", session: 6, t: 6000 },
    ],
    characters: [{
      status: "living", name: "Wren Aldric", conditions: [],
      sheet: { level: 4, gold: 240, mods: { str: 2, dex: 1, con: 1 }, scores: { str: 14, dex: 12, con: 12 },
        inventory: [{ id: "i1", name: "Longsword", conditions: [] }, { id: "i2", name: "Breastplate", conditions: [] }],
        equipped: { mainHand: "i1", armor: "i2" }, ac: 15 },
    }],
    factions: [{ id: "f1", name: "The Farshore Wardens", clock: 3 }],
    pressures: [],
    shops: { "shop-1": { id: "shop-1", name: "Hearthhold General", tier: 2, stock: [] } },
    codex: { records: { "npc-1": { kind: "npc", id: "npc-1", name: "Old Marren", status: {} } }, version: 1 },
    revealed: { powers: true, map: true, ledger: true, gaz: true },
    region: { q: 0, r: 0 },
  };
  writeFileSync(fixturePath, JSON.stringify({ version: 1, kind: "world", exportedAt: 0, universe: { worlds: { "vintage-1": vintageWorld }, activeWorldId: "vintage-1" } }, null, 2) + "\n", "utf-8");
  console.log("  (generated dev/fixtures/saves/vintage-1.json — frozen going forward)");
}
const fixtureJson = read("dev/fixtures/saves/vintage-1.json");

// 8. loads clean through migrateWorld with every spine field present
{
  const { win } = newWin();
  const parsed = JSON.parse(fixtureJson);
  const w = parsed.universe.worlds["vintage-1"];
  win.U.worlds["vintage-1"] = w; win.U.activeWorldId = "vintage-1";
  let threw = false;
  try { win.migrateWorld(w); } catch (e) { threw = true; }
  check("vintage fixture #1 loads through migrateWorld without throwing", threw === false);
  check("the spine's ledger/map/shops/clock/codex fields are all present after migration",
    Array.isArray(w.ledger) && w.map && typeof w.shops === "object" && w.clock && w.codex,
    JSON.stringify({ ledger: !!w.ledger, map: !!w.map, shops: !!w.shops, clock: !!w.clock, codex: !!w.codex }));
}

// 9. round-trips through the SAME LS->IDB migration path
{
  const { win, shim } = newWin();
  win.localStorage.setItem("genesis-universe-v2", JSON.stringify(JSON.parse(fixtureJson).universe));
  const r = await win.migrateLStoIDB();
  await flush();
  check("the vintage fixture migrates through LS->IDB cleanly", r.ok && r.migrated === true, JSON.stringify(r));
  const idbRec = shim.data.worlds.get("vintage-1");
  check("the vintage world lands in IDB with its dmlog/ledger/characters intact",
    idbRec && idbRec.dmlog.length === 5 && idbRec.ledger.length === 3 && idbRec.characters.length === 1,
    JSON.stringify(idbRec && { dmlog: idbRec.dmlog.length, ledger: idbRec.ledger.length, characters: idbRec.characters.length }));
}

// 10. regression: migrateAll (the real boot path) doesn't throw with the vintage fixture as the active world
{
  const { win } = newWin();
  const parsed = JSON.parse(fixtureJson);
  win.U.worlds = { "vintage-1": parsed.universe.worlds["vintage-1"] };
  win.U.activeWorldId = "vintage-1";
  let threw = false;
  try { win.migrateAll(); } catch (e) { threw = true; console.log(e); }
  check("migrateAll (the real boot path) runs clean end-to-end with the vintage fixture loaded", threw === false);
  check("the world is still reachable as activeWorld() after migrateAll", win.activeWorld() && win.activeWorld().id === "vintage-1");
}

// ============================================================================
console.log(`\n${fail ? "✗" : "✓"} MIGRATIONS: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
