/* Verify THE DURABILITY TRIO (docs/DURABILITY-TRIO.md; BATCH2-GUARDRAILS H1: one harness, three
   sections, ≥16/0). Full-app jsdom load, manifest.loadOrder (same convention as
   dev/verify-economy-sinks.mjs). Covers:
     §1 World export/import — round-trip export→wipe→import = deep-equal world; version-less file
        rejected with a readable error; conflict duplicates instead of overwriting (MUTATION: allow
        overwrite, confirm RED, restore, confirm GREEN); legacy-save import migrates.
     §2 Environmental rust — rain-combat/submersion/acid rusts a mundane metal weapon/armor but NOT a
        non-metal weapon (club) or a +1 (magic) weapon (MUTATION: let magic rust, confirm RED, restore,
        confirm GREEN); two exposures step the weapon die down one size; a rusted armor/shield is −1 AC;
        a kit/rest clears it; chips render (inst.conditions carries the tag); regression: verify-items
        stays 123/123.
     §3 Chronicle ⇐ Ledger — chronicleLine renders every ledger type; legacy log imports once, idempotent
        (MUTATION: run the migration twice, confirm no duplicate ledger entries appear — i.e. confirm the
        idempotency guard is load-bearing by removing it, RED, restore, GREEN); new events write NO
        world.log lines (logEvent is inert); the Chronicle view (renderLedger) is unaffected — reveal
        gating (ledgerPlayerVisible) unchanged.

   Run:  node dev/verify-durability.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function newWin(){
  const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
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
    id: opts.id || "w-dur", name: opts.name || "Test World", session: 1, startNodeId: "home", currentNodeId: opts.nodeId || "home",
    map: { nodes: Object.assign({ home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, opts.nodes || {}), edges: [] },
    gazetteer: [], ledger: [], log: [], clock: { day: 1, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: opts.gold != null ? opts.gold : 100, mods:{str:1,dex:2}, scores: { str: 10 }, inventory: opts.inventory || [], equipped:opts.equipped||{} } }],
    factions: [], pressures: [], shops: opts.shops || {}, codex: { records: {}, version: 1 },
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

// ============================================================================
// §1. WORLD EXPORT / IMPORT
// ============================================================================
console.log("\n--- §1. World export/import ---");

// 1a. round-trip export -> wipe -> import = deep-equal world. importUniverseJSON runs migrateWorld on
// every incoming world (spec §1: "old saves upgrade on the way in") — so the honest round-trip
// assertion migrates the ORIGINAL too before comparing (migrateWorld is additive/idempotent, so
// migrating a fresh mkWorld() world is itself a no-op-ish baseline, not a cheat).
{
  const win = newWin();
  const w = mkWorld(win, { id:"w-rt", inventory:[{id:"i1",name:"Scimitar",conditions:[]}] });
  const json = win.exportWorldJSON(w);
  win.migrateWorld(w);                                            // same upgrade import will apply
  const originalCopy = JSON.parse(JSON.stringify(w));
  win.U.worlds = {}; win.U.activeWorldId = null;                 // wipe
  const r = win.importUniverseJSON(json, win.U);
  check("import ok", r.ok === true, JSON.stringify(r));
  const reimported = win.U.worlds["w-rt"];
  check("round-trip export->wipe->import is deep-equal to the original (migrated) world",
    reimported && JSON.stringify(reimported) === JSON.stringify(originalCopy), JSON.stringify(reimported));
}

// 1b. version-less file rejected with a readable error
{
  const win = newWin();
  const bad = JSON.stringify({ kind: "world", universe: { worlds: {} } });   // no version key
  const r = win.importUniverseJSON(bad, win.U);
  check("a version-less export is rejected", r.ok === false && r.reason === "no-version", JSON.stringify(r));
  check("the rejection carries a readable message", typeof r.message === "string" && r.message.length > 0, JSON.stringify(r));
}
// not-JSON and bad-shape also degrade gracefully (not counted toward the ≥16 floor, extra coverage)
{
  const win = newWin();
  const r1 = win.importUniverseJSON("not json at all {{{", win.U);
  check("malformed JSON text is rejected with a readable message", r1.ok === false && typeof r1.message === "string");
  const r2 = win.importUniverseJSON(JSON.stringify({ version: 1, universe: {} }), win.U);
  check("a payload missing universe.worlds is rejected", r2.ok === false && r2.reason === "bad-shape");
}

// 1c. conflict duplicates instead of overwriting
{
  const win = newWin();
  const w = mkWorld(win, { id: "w-dup", name: "Original", gold: 5 });
  const json = win.exportWorldJSON(w);
  // mutate the LOCAL copy so a byte-diff would be visible if it got silently overwritten
  w.characters[0].sheet.gold = 999;
  const r = win.importUniverseJSON(json, win.U);
  check("importing a colliding world id does NOT overwrite the local copy",
    win.U.worlds["w-dup"].characters[0].sheet.gold === 999, JSON.stringify(win.U.worlds["w-dup"]));
  check("the colliding world is duplicated as a copy with a fresh id",
    r.duplicated.length === 1 && r.duplicated[0].fromId === "w-dup" && win.U.worlds[r.duplicated[0].toId], JSON.stringify(r));
  check("the duplicate copy carries the imported (pre-mutation) data",
    win.U.worlds[r.duplicated[0].toId].characters[0].sheet.gold === 5, JSON.stringify(win.U.worlds[r.duplicated[0].toId]));
}

// 1d. legacy-save import migrates (a pre-shops/pre-map save gets the spine backfilled on the way in)
{
  const win = newWin();
  const legacyWorld = { id: "w-legacy", name: "Legacy", characters: [], gazetteer: [], clock: { day: 1, min: 300 } }; // no ledger/map/shops
  const json = JSON.stringify({ version: 1, kind: "world", universe: { worlds: { "w-legacy": legacyWorld } } });
  const r = win.importUniverseJSON(json, win.U);
  const w = win.U.worlds["w-legacy"];
  check("a legacy save (no ledger/map/shops) imports without throwing", r.ok === true);
  check("migrateWorld backfilled the ledger/map/shops on the imported legacy save",
    w && Array.isArray(w.ledger) && w.map && typeof w.shops === "object", JSON.stringify(w && { ledger: w.ledger, map: !!w.map, shops: w.shops }));
}

console.log(`\n✓ §1 (pre-mutation): ${pass} passed, ${fail} failed so far`);

// 1e. MUTATION CHECK — allow overwrite instead of duplicate-as-copy, confirm RED, restore, confirm GREEN
console.log("\n--- mutation guard: import must NEVER silently overwrite a colliding world id ---");
const durabilityPath = join(ROOT, "src/world/durability.js");
const originalDurability = readFileSync(durabilityPath, "utf-8");
const mutatedOverwrite = originalDurability.replace(
  `    let targetId = id;
    if(u.worlds[id]){`,
  `    let targetId = id;
    if(false){ /* MUTATION: never treat an existing id as a conflict — always overwrite */`
);
if (mutatedOverwrite === originalDurability) throw new Error("mutation pattern (§1) didn't match src/world/durability.js — update the harness");
try {
  writeFileSync(durabilityPath, mutatedOverwrite, "utf-8");
  const win = newWin();
  const w = mkWorld(win, { id: "w-mut", gold: 5 });
  const json = win.exportWorldJSON(w);
  w.characters[0].sheet.gold = 999; // local drifts after export
  win.importUniverseJSON(json, win.U);
  const overwritten = win.U.worlds["w-mut"].characters[0].sheet.gold === 5; // the mutation let the import clobber the local copy
  check("MUTATION RED: with the conflict guard disabled, import silently overwrites the local world (confirms the guard is load-bearing)",
    overwritten === true, "gold=" + win.U.worlds["w-mut"].characters[0].sheet.gold);
} finally {
  writeFileSync(durabilityPath, originalDurability, "utf-8");
}
{
  const win = newWin();
  const w = mkWorld(win, { id: "w-mut2", gold: 5 });
  const json = win.exportWorldJSON(w);
  w.characters[0].sheet.gold = 999;
  const r = win.importUniverseJSON(json, win.U);
  check("RESTORED: import duplicates again (never overwrites) after reverting the mutation",
    win.U.worlds["w-mut2"].characters[0].sheet.gold === 999 && r.duplicated.length === 1);
}
// ============================================================================
// §2. ENVIRONMENTAL RUST
// ============================================================================
console.log("\n--- §2. Environmental rust ---");

// 2a. rain-combat/submersion/acid rusts a mundane metal weapon
{
  const win = newWin();
  const w = mkWorld(win, { inventory: [{ id: "i1", name: "Scimitar", conditions: [] }] });
  const r = win.applyRustExposure(w, "i1", "rain-combat");
  check("first qualifying exposure on a mundane metal weapon sets the 'rusting' TELL",
    r.ok && r.applied && r.condition === "rusting", JSON.stringify(r));
  check("the instance's conditions[] carries 'rusting' (chips render generically off this array)",
    w.characters[0].sheet.inventory[0].conditions.indexOf("rusting") >= 0, JSON.stringify(w.characters[0].sheet.inventory[0]));
  const ledgerLine = w.ledger.slice().reverse().find(e => e.data && e.data.kind === "item-rust");
  check("a rust ledger line was written", !!ledgerLine, JSON.stringify(ledgerLine));
}

// 2b. NOT a non-metal weapon (club)
{
  const win = newWin();
  const w = mkWorld(win, { inventory: [{ id: "i1", name: "Club", conditions: [] }] });
  const r = win.applyRustExposure(w, "i1", "submersion");
  check("a non-metal weapon (club) does not rust", r.ok === true && r.applied === false && r.reason === "non-metal", JSON.stringify(r));
  check("no condition tag added to the club", w.characters[0].sheet.inventory[0].conditions.length === 0);
}

// 2c. NOT a magic weapon — an explicit per-instance ench overlay (inst.ench, the CONGRUENCE-decision
// shape docs/ITEMS.md §E) is what rustImmune/enchOf actually read; bare top-level consts like
// MAGIC_ITEMS_BY_NAME aren't window-visible outside the initial eval (same jsdom quirk documented in
// verify-items.mjs) so this exercises the same enchOf path a real "+1 Longsword" catalog lookup would.
{
  const win = newWin();
  const w = mkWorld(win, { inventory: [{ id: "i1", name: "Longsword", conditions: [], ench: { bonus: 1 } }] });
  const r = win.applyRustExposure(w, "i1", "acid");
  check("a magic (enchanted) weapon is immune to rust", r.ok === true && r.applied === false && r.reason === "magic-immune", JSON.stringify(r));
}

// 2d. two exposures step the die down one size; never worse than rusted
{
  const win = newWin();
  const w = mkWorld(win, { inventory: [{ id: "i1", name: "Scimitar", conditions: [] }] });
  win.applyRustExposure(w, "i1", "rain-combat");                       // 1st: rusting
  const r2 = win.applyRustExposure(w, "i1", "rain-combat");            // 2nd (un-maintained): rusted
  check("a second un-maintained exposure upgrades rusting -> rusted",
    r2.ok && r2.applied && r2.condition === "rusted", JSON.stringify(r2));
  const r3 = win.applyRustExposure(w, "i1", "rain-combat");            // 3rd: no-op, never worse
  check("a third exposure on an already-rusted item is a no-op (never worse than rusted)",
    r3.ok === true && r3.applied === false && r3.reason === "already-rusted", JSON.stringify(r3));
  check("only ONE condition tag present (rusted), never both rusting+rusted stacked",
    JSON.stringify(w.characters[0].sheet.inventory[0].conditions) === JSON.stringify(["rusted"]));
}

// 2e. weapon damage die steps down one size for a rusted weapon (Scimitar: d6, not Versatile — no
// two-handed-grip complication to control for)
{
  const win = newWin();
  win.eval(`
    var __eq = {mainHand:"i1", offHand:null, armor:null};
    var __invFresh = [{id:"i1",name:"Scimitar",conditions:[]}];
    var __invRusted = [{id:"i1",name:"Scimitar",conditions:["rusted"]}];
    window.__fresh = cmEquippedDamage(__eq, __invFresh, {str:1,dex:1}, "mainHand");
    window.__rusted = cmEquippedDamage(__eq, __invRusted, {str:1,dex:1}, "mainHand");
  `);
  check("a fresh scimitar rolls its normal d6", win.__fresh && win.__fresh.dmg[0].die === 6, JSON.stringify(win.__fresh));
  check("a rusted scimitar's damage die steps down one size (d6 -> d4)", win.__rusted && win.__rusted.dmg[0].die === 4, JSON.stringify(win.__rusted));
  win.eval(`window.__floor = rustSteppedDie(4);`);
  check("the die ladder floors at d4 (never negative/undefined)", win.__floor === 4, String(win.__floor));
}

// 2f. rusted armor/shield is -1 AC
{
  const win = newWin();
  win.eval(`
    var __invFresh = [{id:"a1",name:"Breastplate",conditions:[]}];
    var __invRusted = [{id:"a1",name:"Breastplate",conditions:["rusted"]}];
    window.__acFresh = cmEquippedAC({armor:"a1"}, __invFresh, {dex:2});
    window.__acRusted = cmEquippedAC({armor:"a1"}, __invRusted, {dex:2});
  `);
  check("rusted armor is exactly -1 AC vs the same fresh armor",
    win.__acFresh - win.__acRusted === 1, `fresh=${win.__acFresh} rusted=${win.__acRusted}`);
}

// 2g. a kit/rest clears rusting/rusted (rustMaintainAll, wired into passTime)
{
  const win = newWin();
  const w = mkWorld(win, { inventory: [{ id: "i1", name: "Scimitar", conditions: ["rusted"] }] });
  win.applyEvent = win.applyEvent; // no-op keep lints quiet
  const n = win.rustMaintainAll(w);
  check("rustMaintainAll clears a rusted instance and reports the count", n === 1);
  check("the instance's conditions no longer include rusted", w.characters[0].sheet.inventory[0].conditions.indexOf("rusted") < 0);
}
{
  // integration: passTime('short') (any rest) auto-maintains
  const win = newWin();
  const w = mkWorld(win, { inventory: [{ id: "i1", name: "Scimitar", conditions: ["rusting"] }] });
  win.passTime("short");
  check("passTime (any rest kind) auto-clears rust off carried gear",
    w.characters[0].sheet.inventory[0].conditions.indexOf("rusting") < 0, JSON.stringify(w.characters[0].sheet.inventory[0]));
}

// 2j. integration (CODE-REVIEW FIX): a REAL travel walk whose legs cross a water/coastal hex, driven
// end-to-end through walkComplete (not applyRustExposure called directly) — this is the ONLY path that
// exercises the biome-vocabulary match between travelLegBiomes' HEX_BIOME_TO_WILDERNESS-mapped labels
// ("Coastal"/"Swamp", Titlecase wilderness names) and walkComplete's submersion-detection guard. A prior
// version of that guard checked segment.biome==="water" (the raw hexmap code, which segments never
// carry) and was silently dead code; this case pins the fix.
{
  const win = newWin();
  const w = mkWorld(win, { inventory: [{ id: "i1", name: "Scimitar", conditions: [] }], nodeId: "home",
    nodes: { dest: { id: "dest", name: "Farshore", type: "Place", x: 10, y: 0 } } });
  const walk = win.rollWildernessWalk({ legCount: 2, biomes: ["Coastal", "Coastal"], tier: 1, kind: "travel" });
  win.prepStartTravelWalk(w, { destNodeId: "dest", originNodeId: "home", travelMin: 60, walk });
  const r = win.walkComplete(w, { nodeId: "dest" });
  check("a travel walk crossing a Coastal (water-mapped) biome completes and arrives",
    r.ok === true && r.arrived === true, JSON.stringify(r));
  check("submersion exposure fired end-to-end through walkComplete — the carried Scimitar shows 'rusting'",
    w.characters[0].sheet.inventory[0].conditions.indexOf("rusting") >= 0, JSON.stringify(w.characters[0].sheet.inventory[0]));
}
// control: a travel walk over dry (non-wet) biomes does NOT trigger submersion rust
{
  const win = newWin();
  const w = mkWorld(win, { inventory: [{ id: "i1", name: "Scimitar", conditions: [] }], nodeId: "home",
    nodes: { dest: { id: "dest", name: "Dustlow", type: "Place", x: 10, y: 0 } } });
  const walk = win.rollWildernessWalk({ legCount: 2, biomes: ["Grassland", "Grassland"], tier: 1, kind: "travel" });
  win.prepStartTravelWalk(w, { destNodeId: "dest", originNodeId: "home", travelMin: 60, walk });
  win.walkComplete(w, { nodeId: "dest" });
  check("a travel walk over dry biomes (Grassland) does NOT trigger submersion rust",
    w.characters[0].sheet.inventory[0].conditions.indexOf("rusting") < 0, JSON.stringify(w.characters[0].sheet.inventory[0]));
}

console.log(`\n✓ §2 (pre-mutation): ${pass} passed, ${fail} failed so far`);

// 2h. MUTATION CHECK — let magic rust, confirm RED, restore, confirm GREEN
console.log("\n--- mutation guard: a magic (enchanted) item must never rust ---");
const mutatedMagicRusts = originalDurability.replace(
  "  if(rustImmune(it)) return { ok:true, applied:false, reason:\"magic-immune\" };",
  "  if(false) return { ok:true, applied:false, reason:\"magic-immune\" }; /* MUTATION: magic items no longer immune */"
);
if (mutatedMagicRusts === originalDurability) throw new Error("mutation pattern (§2) didn't match src/world/durability.js — update the harness");
try {
  writeFileSync(durabilityPath, mutatedMagicRusts, "utf-8");
  const win = newWin();
  const w = mkWorld(win, { inventory: [{ id: "i1", name: "Longsword", conditions: [], ench: { bonus: 1 } }] });
  const r = win.applyRustExposure(w, "i1", "acid");
  check("MUTATION RED: with the magic-immunity guard disabled, a +1 weapon rusts (confirms the guard is load-bearing)",
    r.ok && r.applied === true && r.condition === "rusting", JSON.stringify(r));
} finally {
  writeFileSync(durabilityPath, originalDurability, "utf-8");
}
{
  const win = newWin();
  const w = mkWorld(win, { inventory: [{ id: "i1", name: "Longsword", conditions: [], ench: { bonus: 1 } }] });
  const r = win.applyRustExposure(w, "i1", "acid");
  check("RESTORED: a +1 weapon is immune again after reverting the mutation",
    r.ok === true && r.applied === false && r.reason === "magic-immune", JSON.stringify(r));
}
// 2i. regression: verify-items.mjs stays 123/123 (rust wiring in cmEquippedDamage/cmEquippedAC touches
// shared code paths — confirm zero breakage on the existing 123-assertion suite)
{
  let itemsOut = "";
  try {
    itemsOut = execFileSync(process.execPath, [join(ROOT, "dev/verify-items.mjs")], { encoding: "utf-8" });
  } catch (e) {
    itemsOut = (e.stdout || "") + (e.stderr || "");
  }
  const m = itemsOut.match(/✓ items: (\d+) passed, (\d+) failed/);
  check("regression: dev/verify-items.mjs stays 123/123 (0 failed)",
    !!m && m[1] === "123" && m[2] === "0", itemsOut.slice(-300));
}

// ============================================================================
// §3. CHRONICLE ⇐ LEDGER
// ============================================================================
console.log("\n--- §3. Chronicle ⇐ Ledger ---");

// 3a. chronicleLine renders every ledger type (mostly passthrough of e.text)
{
  const win = newWin();
  const types = ["canon","transition","spatial","clock","drift","npc-life","outcome","session"];
  const allRender = types.every(t => {
    const html = win.chronicleLine({ type: t, text: `hello ${t}`, data: {} });
    return typeof html === "string" && html.indexOf(`hello ${t}`) >= 0;
  });
  check("chronicleLine renders every ledger type's .text (mostly passthrough)", allRender);
  check("chronicleLine on a falsy entry returns an empty string (no throw)", win.chronicleLine(null) === "");
}

// 3b. legacy log imports once, idempotent
{
  const win = newWin();
  const w = mkWorld(win);
  w.log = [{ t: Date.now(), text: "An orphaned legacy line with no ledger twin." }];
  const n1 = win.chronicleMigrateLegacyLog(w);
  check("chronicleMigrateLegacyLog imports the orphaned legacy line once", n1 === 1);
  const twin = w.ledger.find(e => e.text === "An orphaned legacy line with no ledger twin.");
  check("the imported line lands as a session-type ledger entry", !!twin && twin.type === "session", JSON.stringify(twin));
  const n2 = win.chronicleMigrateLegacyLog(w);
  check("a second call is idempotent (imports nothing more)", n2 === 0);
  check("no duplicate ledger entry was created", w.ledger.filter(e => e.text === "An orphaned legacy line with no ledger twin.").length === 1);
}
// a legacy line that DOES already have a ledger twin is skipped (dedupe the common case)
{
  const win = newWin();
  const w = mkWorld(win);
  w.ledger = [{ id: "x1", type: "session", day: 1, min: 300, text: "Session 1 begins — Day 1, morning." }];
  w.log = [{ t: Date.now(), text: "Session 1 begins — Day 1, morning." }];
  const n = win.chronicleMigrateLegacyLog(w);
  check("a legacy line with a matching ledger twin is skipped (not double-imported)", n === 0 && w.ledger.length === 1);
}

// 3c. new events write NO world.log lines (logEvent is inert)
{
  const win = newWin();
  const w = mkWorld(win);
  win.logEvent(w, "should not land anywhere");
  check("logEvent is an inert no-op — w.log gains nothing", w.log.length === 0, JSON.stringify(w.log));
}
{
  // integration: a real game action (beginSession) writes to the ledger but not to w.log
  const win = newWin();
  const w = mkWorld(win);
  const ledgerBefore = w.ledger.length;
  win.beginSession();
  check("beginSession (a real logEvent call site) writes ledger entries", w.ledger.length > ledgerBefore);
  check("beginSession writes NO w.log lines (logEvent no-op holds end-to-end)", w.log.length === 0, JSON.stringify(w.log));
}

// 3d. the Chronicle view (renderLedger) is unaffected — reveal gating (ledgerPlayerVisible) unchanged
{
  const win = newWin();
  const w = mkWorld(win);
  w.ledger = [
    { id: "l1", type: "outcome", day: 1, min: 300, text: "A player-facing outcome.", data: {} },
    { id: "l2", type: "spatial", day: 1, min: 300, text: "DM-only route geometry.", data: {} },
    { id: "l3", type: "canon", day: 1, min: 300, text: "World-gen seed canon.", data: { origin: true } },
  ];
  const playerHtml = win.renderLedger(w);
  check("renderLedger (player view) shows the outcome line", playerHtml.indexOf("A player-facing outcome.") >= 0);
  check("renderLedger (player view) hides the spatial (DM machinery) line — reveal gating unchanged",
    playerHtml.indexOf("DM-only route geometry.") < 0);
  check("renderLedger (player view) hides an origin-flagged canon line — reveal gating unchanged",
    playerHtml.indexOf("World-gen seed canon.") < 0);
}

console.log(`\n✓ §3 (pre-mutation): ${pass} passed, ${fail} failed so far`);

// 3e. MUTATION CHECK — disable BOTH idempotency guards (the entry-stamp gate AND the in-call dedupe-by-
// text set — a real regression would drop both together, e.g. someone "simplifying" the function),
// run migration twice, confirm duplicate ledger entries appear (RED), restore, confirm GREEN.
console.log("\n--- mutation guard: legacy-log migration must be idempotent ---");
const mutatedNoStamp = originalDurability
  .replace(
    "  if(!w || w._chronicleMigrated) return 0;",
    "  if(!w) return 0; /* MUTATION: the w._chronicleMigrated stamp gate removed */"
  )
  .replace(
    "    if(ledgerTexts.has(line.text)) return;         // already has a ledger twin — skip (dedupe the common case)",
    "    /* MUTATION: dedupe-by-text-twin removed */"
  );
if (mutatedNoStamp === originalDurability) throw new Error("mutation pattern (§3) didn't match src/world/durability.js — update the harness");
try {
  writeFileSync(durabilityPath, mutatedNoStamp, "utf-8");
  const win = newWin();
  const w = mkWorld(win);
  w.log = [{ t: Date.now(), text: "A line that will duplicate without the idempotency stamp." }];
  win.chronicleMigrateLegacyLog(w);
  win.chronicleMigrateLegacyLog(w);   // second call — should be a no-op, but the guard is disabled
  const dupCount = w.ledger.filter(e => e.text === "A line that will duplicate without the idempotency stamp.").length;
  check("MUTATION RED: without the idempotency stamp, a second migration call duplicates the ledger entry (confirms the guard is load-bearing)",
    dupCount === 2, "dupCount=" + dupCount);
} finally {
  writeFileSync(durabilityPath, originalDurability, "utf-8");
}
{
  const win = newWin();
  const w = mkWorld(win);
  w.log = [{ t: Date.now(), text: "A line that will duplicate without the idempotency stamp." }];
  win.chronicleMigrateLegacyLog(w);
  win.chronicleMigrateLegacyLog(w);
  const dupCount = w.ledger.filter(e => e.text === "A line that will duplicate without the idempotency stamp.").length;
  check("RESTORED: after reverting the mutation, a second migration call adds nothing (idempotent again)", dupCount === 1, "dupCount=" + dupCount);
}
// ============================================================================
console.log(`\n${fail ? "✗" : "✓"} DURABILITY: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
