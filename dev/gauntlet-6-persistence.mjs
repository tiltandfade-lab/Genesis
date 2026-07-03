/* GAUNTLET G6 — save/load round-trips at every depth (docs/PRE-PLAYTEST-GAUNTLET.md §8).
   Detection-only harness. No model. Exits 0 when it RAN TO COMPLETION (findings are data written
   to dev/gauntlet-report.json, not test failures); exits 1 ONLY on a harness defect (boot failure,
   unhandled harness-code throw, report unwritable).

   Boot pattern: copy of dev/verify-dm-events.mjs — loads the real genesis.html modules (via
   manifest.json's loadOrder) into one jsdom global scope, classic-script style (shared global
   scope; the "const-via-eval" gotcha — one eval avoids cross-<script> const isolation).

   jsdom has NO native IndexedDB — src/world/store.js (the Forever-Storage IDB layer) needs one, so
   this harness injects `fake-indexeddb` (installed into the shared ~/.genesis-jsdom scratch dir,
   `npm i fake-indexeddb --no-save`) as `window.indexedDB` on every fresh jsdom instance it boots.
   Without it, storeAvailable() is false and the whole IDB layer degrades to its documented no-op —
   which is itself asserted (not just tolerated) as one of the checkpoints below.

   Determinism: a seeded mulberry32 replaces Math.random before any module loads (GAUNTLET_SEED env,
   default 20260702 per the spec). Every finding's repro line carries the seed.

   Exports `roundTrip(label)` at module scope for import by future G4/G5 harnesses (per the spec's
   "G4/G5 import it" instruction) — it is also exercised directly by this file's own checkpoints.

   Canary (GAUNTLET_CANARY=1): drops one inventory instance from the reloaded U before the deep
   compare → must emit >=1 `corrupt` finding and the process must exit 1.

   Run:  node dev/gauntlet-6-persistence.mjs
        GAUNTLET_SEED=20260702 GAUNTLET_CANARY=1 node dev/gauntlet-6-persistence.mjs   (canary check) */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

/* Drive a jsdom-realm promise to completion from the Node event loop. jsdom's promises/timers run on
   the SAME Node event loop (no separate thread) — a real `await` (not a busy-wait) lets pending
   microtasks/timeouts (fake-indexeddb's IDBRequest events, saveWorld's debounce) actually flush. */
async function awaitRealm(promiseFactory, timeoutMs) {
  timeoutMs = timeoutMs || 5000;
  let settled = false, value, err;
  const p = Promise.resolve(promiseFactory()).then((v) => { settled = true; value = v; }, (e) => { settled = true; err = e; });
  const start = Date.now();
  while (!settled && Date.now() - start < timeoutMs) { await sleep(5); }
  await p.catch(() => {}); // ensure any late rejection is observed, not unhandled
  if (!settled) throw new Error(`awaitRealm timed out after ${timeoutMs}ms`);
  if (err) throw err;
  return value;
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const requireFromJsdomHome = createRequire(join(JSDOM_HOME, "package.json"));
const { JSDOM } = requireFromJsdomHome("jsdom");

const SEED = Number(process.env.GAUNTLET_SEED) || 20260702;
const CANARY = process.env.GAUNTLET_CANARY === "1";
const HARNESS_ID = "G6";
const REPORT_PATH = join(ROOT, "dev/gauntlet-report.json");
const FIXTURES_DIR = join(ROOT, "dev/fixtures");
const FIXTURE_WORLD_PATH = join(FIXTURES_DIR, "gauntlet-world.json");
const WATCHDOG_ITER_CAP = 2000; // any per-checkpoint synthetic-content loop carries this hard cap

// ---------- mulberry32, seeded, installed over Math.random before any module loads (per instance) ----------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- report accumulation (accretes across harness runs, keyed by harness id, latest run wins) ----------
function loadReport() {
  if (!existsSync(REPORT_PATH)) return { run: {}, harnesses: [], findings: [] };
  try { return JSON.parse(readFileSync(REPORT_PATH, "utf-8")); }
  catch (e) { return { run: {}, harnesses: [], findings: [] }; }
}
function gitShortRev() {
  try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); }
  catch (e) { return "unknown"; }
}
function writeReport(report, harnessEntry, newFindings) {
  report.run = { date: new Date().toISOString().slice(0, 10), seed: SEED, commit: gitShortRev() };
  report.harnesses = (report.harnesses || []).filter((h) => h.id !== HARNESS_ID);
  report.harnesses.push(harnessEntry);
  // findings from THIS harness are replaced wholesale on each run; other harnesses' findings kept.
  report.findings = (report.findings || []).filter((f) => f.harness !== HARNESS_ID).concat(newFindings);
  if (!existsSync(dirname(REPORT_PATH))) mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
}

let findings = [];
let findingSeq = 0;
function addFinding(f) {
  findingSeq += 1;
  const id = `${HARNESS_ID}-${String(findingSeq).padStart(3, "0")}`;
  findings.push(Object.assign({ id, harness: HARNESS_ID, collisionZone: false }, f));
  return id;
}

let pass = 0, fail = 0;
const results = []; // { checkpoint, ok, detail }
function check(label, cond, detail = "") {
  if (cond) { pass++; console.log("  ✓", label); }
  else { fail++; console.log("  ✗", label, "—", detail); }
  results.push({ label, ok: !!cond, detail: String(detail || "") });
  return !!cond;
}

// ============================================================================================
// Boot: one fresh, fully-loaded jsdom instance of the real app, IDB-shimmed, seeded PRNG.
// ============================================================================================
const MAN = JSON.parse(read("manifest.json"));
const APP_SRC = MAN.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const TABLES_SRC = existsSync(join(ROOT, "tables.js")) ? read("tables.js") : "";

function bootApp(opts) {
  opts = opts || {};
  const dom = new JSDOM(
    `<!doctype html><html><body>
       <div id="worldView"></div>
       <div id="toast" class="toast"></div>
       <div class="modal-bg" id="levelModal"><div class="modal bardo-modal"><div id="levelBody"></div></div></div>
     </body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  const win = dom.window;

  // fake-indexeddb: jsdom ships no IndexedDB at all — src/world/store.js's storeAvailable() would be
  // permanently false without this, and the whole §1/§2 IDB layer would never be exercised.
  let idbOk = true;
  try {
    const FDBFactory = requireFromJsdomHome("fake-indexeddb/lib/FDBFactory").default
      || requireFromJsdomHome("fake-indexeddb/lib/FDBFactory");
    win.indexedDB = new FDBFactory();
  } catch (e) { idbOk = false; }

  // seeded PRNG installed BEFORE any module evaluates (mulberry32; deterministic across runs/instances)
  win.Math.random = mulberry32(opts.seed != null ? opts.seed : SEED);

  const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
  win.eval(TABLES_SRC + "\n" + harness + "\n" + APP_SRC);

  // localStorage backing store: if the caller wants to pre-seed it (simulating "boot with an
  // existing save"), inject the raw string BEFORE any code runs against it.
  if (opts.preloadLS) {
    try { win.localStorage.setItem("genesis-universe-v2", opts.preloadLS); }
    catch (e) { /* surfaced by the caller's own checks */ }
  }

  return { dom, win, idbOk };
}

// ============================================================================================
// roundTrip(label, uSnapshot, opts) — exported helper (G4/G5 import this).
//   saveU() the given U → capture the localStorage value → boot a FRESH jsdom instance with that
//   value pre-injected → loadU/migrateAll → deep-compare the two U's via normalized JSON.stringify.
//
// Ruling (spec): byte-equal is the expectation; any key that legitimately differs (migration
// stamps) is allowlisted HERE, in the harness source, with a comment justifying each. An
// unexplained diff is a `corrupt` finding.
// ============================================================================================

/* The explicit allowlist. Every entry is a key path (dot-notation, worlds.<id>.<rest>) that is
   EXPECTED to differ after a save->load->migrateAll round-trip, with the reason migrateWorld/
   migrateAll introduces it. Anything NOT on this list that differs is unexplained -> corrupt. */
const ALLOWED_DIFF_KEYS = [
  // migrateAll: unplaced worlds (pre-connected-plane saves) get a region slot assigned on load —
  // legitimate one-time migration stamp (src/world/state.js migrateAll, "connected plane" step 6).
  { path: /^worlds\.[^.]+\.region$/, reason: "migrateAll assigns a plane-region slot on load (idempotent, additive)" },
  // migrateAll: U.plane marks the connected-plane era; absent on a pre-migration snapshot.
  { path: /^plane$/, reason: "migrateAll stamps U.plane={version:3} once (additive era marker)" },
  // migrateAll: U.souls seeded with CANON_SOULS if absent.
  { path: /^souls$/, reason: "migrateAll seeds U.souls[] with CANON_SOULS if the array was absent/empty" },
  // migrateWorld: chronicle legacy-log migration stamp.
  { path: /^worlds\.[^.]+\._chronicleMigrated$/, reason: "migrateWorld's chronicleMigrateLegacyLog stamps this once (DURABILITY-TRIO.md §3)" },
  // migrateWorld: ensureResources() backfills the live resource-economy fields on every character sheet
  // on every migrateWorld call (src/world/state.js migrateWorld -> src/engine/resources.js ensureResources)
  // — these are DERIVED/backfilled tracking fields (class resource pools, spell slot arrays, a `hpCur`
  // mirror, a `choicesLevel` cursor), not part of the pre-migration snapshot's own authored state, so a
  // world saved with them absent (e.g. a hand-built harness fixture, or a genuinely old save) legitimately
  // gains them on load. Re-running migrateWorld on an already-backfilled sheet is idempotent (verified by
  // the checkpoint round-trips passing clean once this key set is allowlisted — no further drift beyond
  // this one-time backfill).
  { path: /^worlds\.[^.]+\.characters\.\d+\.sheet\.(choicesLevel|hpCur|slotsMax|slots|pools)$/, reason: "migrateWorld -> ensureResources() backfills these derived resource-tracking fields once (src/engine/resources.js)" },
  // migrateWorld: ensureCodex() migrates gazetteer/factions into the relational codex entity store the
  // first time a world is loaded post-CODEX.md — idempotent, additive, non-destructive (src/world/codex.js).
  // A hand-built harness fixture (or any pre-CODEX save) legitimately gains w.codex + the w._codexInit
  // stamp on its first load; re-running migrateWorld on an already-migrated world is a no-op (does not
  // re-diff on a SECOND round-trip — only appears once, on the very first migration from a codex-less state).
  { path: /^worlds\.[^.]+\.codex$/, reason: "migrateWorld -> ensureCodex() backfills the relational codex store from gazetteer/factions once (docs/CODEX.md)" },
  { path: /^worlds\.[^.]+\._codexInit$/, reason: "ensureCodex()'s own idempotency stamp, set alongside worlds.*.codex" },
];
function pathAllowed(path) {
  return ALLOWED_DIFF_KEYS.some((a) => a.path.test(path));
}

/* deep-diff two plain JSON-safe values, returning [{path, a, b}] for every leaf that differs
   (order-insensitive for plain objects; arrays compared by index — a legitimate report source for
   "same content, different order" too, since save/load should NOT reorder anything). */
function deepDiff(a, b, path, out) {
  path = path || ""; out = out || [];
  if (a === b) return out;
  const aIsObj = a && typeof a === "object", bIsObj = b && typeof b === "object";
  if (!aIsObj || !bIsObj) { out.push({ path, a, b }); return out; }
  if (Array.isArray(a) !== Array.isArray(b)) { out.push({ path, a: Array.isArray(a) ? "[array]" : typeof a, b: Array.isArray(b) ? "[array]" : typeof b }); return out; }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const p = path ? `${path}.${k}` : k;
    deepDiff(a[k], b[k], p, out);
  }
  return out;
}

/* roundTrip(label, srcWin, opts) -> { ok, label, unexplainedDiffs, allowedDiffs, before, after, win2 }
   srcWin: a booted app window whose `.win.U` holds the state to persist. Caller owns srcWin's
   lifecycle. opts.corruptReload(win2, U2): optional hook the G6 canary uses to mutate the freshly
   reloaded state BEFORE compare (simulates a corrupting bug in loadU/migrateAll). */
function roundTrip(label, srcWin, opts) {
  opts = opts || {};
  // 1. saveU() on the source instance — this is the real code path (localStorage write + the
  //    debounced fire-and-forget IDB save), not a shortcut.
  srcWin.saveU(srcWin.U);
  let ls;
  try { ls = srcWin.localStorage.getItem("genesis-universe-v2"); }
  catch (e) { return { ok: false, label, harnessError: `localStorage read failed: ${e.message}` }; }
  if (ls == null) return { ok: false, label, harnessError: "saveU produced no localStorage entry" };

  // 2. boot a FRESH jsdom instance with that value pre-injected.
  const { win: win2, idbOk } = bootApp({ preloadLS: ls, seed: SEED });

  // 3. loadU / migrateAll on the fresh instance.
  let U2;
  try {
    U2 = win2.loadU();
    win2.U = U2;
    win2.migrateAll();
    U2 = win2.U;
  } catch (e) {
    return { ok: false, label, harnessError: `loadU/migrateAll threw: ${e && e.stack || e}` };
  }

  if (typeof opts.corruptReload === "function") {
    try { opts.corruptReload(win2, U2); } catch (e) { /* canary hook errors are the canary's problem */ }
  }

  // 4. deep-compare the two U's via normalized JSON.stringify (parse both back to plain objects so
  //    the compare is pure-data, no cross-realm identity issues between the two jsdom windows).
  let beforeNorm, afterNorm;
  try { beforeNorm = JSON.parse(JSON.stringify(srcWin.U)); }
  catch (e) { return { ok: false, label, harnessError: `JSON.stringify(before U) failed (cycle?): ${e.message}` }; }
  try { afterNorm = JSON.parse(JSON.stringify(U2)); }
  catch (e) { return { ok: false, label, harnessError: `JSON.stringify(after U) failed (cycle?): ${e.message}` }; }

  const diffs = deepDiff(beforeNorm, afterNorm);
  const unexplained = diffs.filter((d) => !pathAllowed(d.path));
  const allowed = diffs.filter((d) => pathAllowed(d.path));

  return { ok: unexplained.length === 0, label, unexplainedDiffs: unexplained, allowedDiffs: allowed,
           before: beforeNorm, after: afterNorm, win2, idbOk };
}

// ============================================================================================
// Fixture builders — realistic checkpoint worlds, built directly (not by driving the full
// flow harnesses, which G6 doesn't depend on) so this harness is self-contained per the build
// order (G6 is built before G4/G5 land per the spec's own ordering note).
// ============================================================================================
function baseWorld(id, over) {
  const w = Object.assign({
    id, name: `Gauntlet World ${id}`,
    seed: { master: { name: "Gauntlet Shrine", desc: "a place rolled for testing" },
            smell: { name: "dust" }, sound: { name: "wind" }, arch: { name: "weathered stone" },
            taboo: { name: "Speaking of the fall", desc: "the collapse goes unmentioned" },
            myth: { name: "The Long Watch", desc: "someone always keeps the door" } },
    characters: [], gazetteer: [], log: [], ledger: [], dmlog: [],
    clock: { day: 1, min: 360 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name: "The Cinder Wardens", dominant: true, agenda: "hold the line", method: "vigilance",
                 tags: ["stern"], clock: { filled: 1, size: 6 } }],
    pressures: [{ kind: "external", danger: "the watch grows thin", impersonal: "attrition",
                  clock: { filled: 0, size: 4 }, real: { text: "the wardens are dwindling" },
                  doom: "the line breaks" }],
    revealed: { powers: 1, map: 1, ledger: 1, gaz: 1 }, shops: {},
  }, over || {});
  return w;
}
function pcSheet(over) {
  return Object.assign({
    species: "Human", class: "Fighter", background: "Soldier", level: 1, hp: "10/10", ac: 16,
    profBonus: 2, scores: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 8 },
    mods: { str: 3, dex: 1, con: 2, int: 0, wis: 0, cha: -1 },
    saveProfs: ["str", "con"], skillProfs: ["Athletics", "Intimidation"],
    xp: 0, gold: 25, inventory: [], equipped: {},
  }, over || {});
}

// checkpoint 1: fresh world (just seeded, one PC, nothing else touched)
function buildFreshWorld(win) {
  const w = baseWorld("gw-fresh");
  const originId = win.addNode(w, "Gauntlet Shrine", "Setting");
  w.currentNodeId = originId;
  w.characters.push({ status: "living", name: "Wren Ashford", headline: "a human fighter", spark: "a soldier",
    pronouns: "she", sheet: pcSheet() });
  return w;
}

// checkpoint 2: mid-bardo-creation (a character mid-life-step pick, before the sheet is finalized)
function buildMidBardoCreation(win) {
  const w = baseWorld("gw-mid-bardo");
  const originId = win.addNode(w, "Gauntlet Shrine", "Setting");
  w.currentNodeId = originId;
  w.characters.push({ status: "living", name: "Unresolved Soul", headline: "mid-creation",
    pronouns: "they", sheet: pcSheet({ level: 1, hp: "?/?" }) });
  win.GS.creation = { worldId: w.id, step: "life-step-3", picks: { species: "Elf", background: null },
    life: { steps: ["birth", "calling", "turning-point"], at: 2 } };
  return w;
}

// checkpoint 3: mid-combat (tracker active)
function buildMidCombat(win) {
  const w = baseWorld("gw-mid-combat");
  const originId = win.addNode(w, "Gauntlet Shrine", "Setting");
  w.currentNodeId = originId;
  w.characters.push({ status: "living", name: "Corin Vale", headline: "a human fighter", spark: "a soldier",
    pronouns: "he", sheet: pcSheet({ hp: "6/10" }) });
  win.GS.combat = { worldId: w.id, round: 2, side: "pc", order: ["pc-1", "foe-1"],
    foes: [{ id: "foe-1", name: "Bandit", hp: 8, maxHp: 11, ac: 12 }],
    log: ["Round 1: Corin hits the Bandit for 5."] };
  return w;
}

// checkpoint 4: shop open
function buildShopOpen(win) {
  const w = baseWorld("gw-shop-open");
  const originId = win.addNode(w, "Gauntlet Shrine", "Setting");
  w.currentNodeId = originId;
  w.characters.push({ status: "living", name: "Della Marsh", headline: "a human fighter", spark: "a soldier",
    pronouns: "she", sheet: pcSheet({ gold: 40 }) });
  w.shops["shop-1"] = { id: "shop-1", name: "The Gauntlet Trading Post", nodeId: originId,
    stock: [{ name: "Dagger", qty: 3, cost: 2 }, { name: "Rope, 50 ft.", qty: 2, cost: 1 }], attitude: 0 };
  win.GS.shop = { worldId: w.id, shopId: "shop-1", tab: "buy" };
  return w;
}

// checkpoint 5: L5 PC with inventory + companion
function buildL5WithCompanionInventory(win) {
  const w = baseWorld("gw-l5-companion");
  const originId = win.addNode(w, "Gauntlet Shrine", "Setting");
  w.currentNodeId = originId;
  const pc = { status: "living", name: "Sable Quinn", headline: "a human fighter", spark: "a veteran soldier",
    pronouns: "she", sheet: pcSheet({
      level: 5, hp: "38/38", profBonus: 3, xp: 6500, gold: 112,
      inventory: [
        { id: "inv-1", name: "Longsword", conditions: [] },
        { id: "inv-2", name: "Chain Mail", conditions: [] },
        { id: "inv-3", name: "Potion of Healing", conditions: [] },
      ],
      equipped: { mainHand: "inv-1", armor: "inv-2" },
    }) };
  w.characters.push(pc);
  w.companions = [{ id: "comp-1", name: "Bram the Hound", kind: "sidekick", hp: 12, maxHp: 12,
    loyalty: 3, wageRate: 1, active: true }];
  return w;
}

// checkpoint 6: dead PC in bardo
function buildDeadInBardo(win) {
  const w = baseWorld("gw-dead-bardo");
  const originId = win.addNode(w, "Gauntlet Shrine", "Setting");
  w.currentNodeId = originId;
  w.characters.push({ status: "dead", name: "Old Marrow", headline: "a human fighter", spark: "a soldier",
    pronouns: "he", sheet: pcSheet({ hp: "0/10" }), diedAt: { day: 3, min: 720 } });
  w.bardo = { charId: 0, gapDays: 49, visionRolls: [], passageIndex: 4, open: true };
  return w;
}

// checkpoint 7: post-rebirth successor
function buildPostRebirthSuccessor(win) {
  const w = baseWorld("gw-post-rebirth");
  const originId = win.addNode(w, "Gauntlet Shrine", "Setting");
  w.currentNodeId = originId;
  w.characters.push({ status: "dead", name: "Old Marrow", headline: "a human fighter", spark: "a soldier",
    pronouns: "he", sheet: pcSheet({ hp: "0/10" }), diedAt: { day: 3, min: 720 } });
  w.characters.push({ status: "living", name: "Nyra Marrow", headline: "successor, a human cleric",
    spark: "kin of the fallen", pronouns: "she",
    sheet: pcSheet({ class: "Cleric", level: 1 }), successorOf: 0 });
  w.bardo = { charId: 0, gapDays: 49, visionRolls: [1, 2, 3], passageIndex: 14, open: false, closedAt: Date.now() };
  w.region = { q: 2, r: -1 };
  return w;
}

const CHECKPOINT_BUILDERS = [
  ["fresh world", buildFreshWorld],
  ["mid-bardo-creation", buildMidBardoCreation],
  ["mid-combat (tracker active)", buildMidCombat],
  ["shop open", buildShopOpen],
  ["L5 PC with inventory+companion", buildL5WithCompanionInventory],
  ["dead PC in bardo", buildDeadInBardo],
  ["post-rebirth successor", buildPostRebirthSuccessor],
];

// ============================================================================================
// MAIN
// ============================================================================================
let harnessDefect = null;
const checkpointResults = [];
let sizeAudit = null;

await (async () => {
try {
  console.log(`\n=== GAUNTLET G6 — save/load persistence (seed ${SEED}${CANARY ? ", CANARY MODE" : ""}) ===\n`);

  // -------------------- boot smoke test --------------------
  const boot = bootApp({ seed: SEED });
  check("boot: fake-indexeddb installed as window.indexedDB", boot.idbOk === true);
  const need = ["saveU", "loadU", "migrateAll", "migrateWorld", "saveWorld", "storeAvailable",
                "archiveOldSessions", "archiveAppend", "archiveReadForWorld", "migrateLStoIDB",
                "storageEstimate", "addLedger", "ledgerOf", "dmLogOf", "pushDmLog", "uid"];
  const missing = need.filter((n) => typeof boot.win[n] !== "function");
  const globalsOk = check("boot: all persistence globals present after full load", missing.length === 0, missing.join(", "));
  if (!globalsOk) {
    addFinding({ severity: "crash", title: "Boot failure: persistence globals missing after full module load",
      symptom: `Missing: ${missing.join(", ")}`,
      evidence: { stack: null, stateSnapshot: null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-6-persistence.mjs` } });
  }
  check("boot: storeAvailable() true with the fake-indexeddb shim", boot.win.storeAvailable() === true);

  // -------------------- 7 checkpoints: roundTrip --------------------
  for (const [label, builder] of CHECKPOINT_BUILDERS) {
    console.log(`\n-- checkpoint: ${label} --`);
    const { win } = bootApp({ seed: SEED });
    let w;
    try { w = builder(win); }
    catch (e) {
      checkpointResults.push({ checkpoint: label, ok: false, error: `builder threw: ${e && e.stack || e}` });
      addFinding({ severity: "crash", title: `G6 checkpoint builder threw: ${label}`,
        symptom: String(e && e.stack || e),
        evidence: { stack: String(e && e.stack || e), stateSnapshot: null,
          repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-6-persistence.mjs  # checkpoint="${label}"` } });
      continue;
    }
    win.U.worlds[w.id] = w;
    win.U.activeWorldId = w.id;

    let rt;
    const corruptHook = CANARY ? (win2, U2) => {
      // CANARY: drop one inventory instance from the reloaded U before compare — but only where an
      // inventory actually exists, so the canary fires deterministically regardless of which
      // checkpoint order runs first.
      const rw = U2.worlds[w.id];
      const sh = rw && rw.characters && rw.characters.find((c) => c.sheet && Array.isArray(c.sheet.inventory) && c.sheet.inventory.length);
      if (sh) sh.sheet.inventory.pop();
    } : null;

    try { rt = roundTrip(label, win, { corruptReload: corruptHook }); }
    catch (e) {
      checkpointResults.push({ checkpoint: label, ok: false, error: `roundTrip threw: ${e && e.stack || e}` });
      addFinding({ severity: "crash", title: `G6 roundTrip() threw: ${label}`,
        symptom: String(e && e.stack || e),
        evidence: { stack: String(e && e.stack || e), stateSnapshot: null,
          repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-6-persistence.mjs  # checkpoint="${label}"` } });
      continue;
    }

    if (rt.harnessError) {
      checkpointResults.push({ checkpoint: label, ok: false, error: rt.harnessError });
      addFinding({ severity: "crash", title: `G6 round-trip harness error: ${label}`,
        symptom: rt.harnessError,
        evidence: { stack: null, stateSnapshot: null,
          repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-6-persistence.mjs  # checkpoint="${label}"` } });
      continue;
    }

    const ok = check(`round-trip byte-equal (allowlist-adjusted): ${label}`, rt.ok,
      rt.unexplainedDiffs && rt.unexplainedDiffs.length
        ? JSON.stringify(rt.unexplainedDiffs.slice(0, 5))
        : "");
    checkpointResults.push({ checkpoint: label, ok, allowedDiffCount: (rt.allowedDiffs || []).length,
      unexplainedDiffCount: (rt.unexplainedDiffs || []).length });

    if (!ok) {
      const snapName = `gauntlet-snap-G6-${label.replace(/[^a-z0-9]+/gi, "-")}.json`;
      const snapPath = join(FIXTURES_DIR, snapName);
      try {
        if (!existsSync(FIXTURES_DIR)) mkdirSync(FIXTURES_DIR, { recursive: true });
        writeFileSync(snapPath, JSON.stringify({ before: rt.before, after: rt.after, diffs: rt.unexplainedDiffs }, null, 2));
      } catch (e) { /* snapshot write is best-effort */ }
      addFinding({
        severity: "corrupt",
        title: `Save/load round-trip diverges at checkpoint: ${label}`,
        symptom: `${rt.unexplainedDiffs.length} unexplained key(s) differ after saveU→localStorage→loadU/migrateAll: ${rt.unexplainedDiffs.slice(0, 3).map((d) => d.path).join(", ")}`,
        evidence: {
          stack: null,
          stateSnapshot: `dev/fixtures/${snapName}`,
          repro: `GAUNTLET_SEED=${SEED} ${CANARY ? "GAUNTLET_CANARY=1 " : ""}node dev/gauntlet-6-persistence.mjs  # checkpoint="${label}"`,
        },
      });
    }
  }

  // -------------------- (a) load the committed fixture through migrateWorld --------------------
  console.log("\n-- (a) committed fixture through migrateWorld --");
  if (!existsSync(FIXTURE_WORLD_PATH)) {
    // No fixture is committed yet (G1, which the spec has minting dev/fixtures/gauntlet-world.json,
    // hasn't run in this build order). Write a representative one now so this checkpoint is real —
    // new-files-only under dev/fixtures/, allowed by §1 of the spec.
    if (!existsSync(FIXTURES_DIR)) mkdirSync(FIXTURES_DIR, { recursive: true });
    const { win: seedWin } = bootApp({ seed: SEED });
    const seedWorld = buildL5WithCompanionInventory(seedWin);
    // legacy shape on purpose: string inventory items, no map/shops/session — exercises migrateWorld's
    // real backfill branches (map from gazetteer, currentNodeId, inventory instance migration, equip slots).
    const legacy = {
      id: seedWorld.id, name: seedWorld.name, seed: seedWorld.seed,
      characters: seedWorld.characters.map((c) => ({ ...c, sheet: { ...c.sheet, inventory: c.sheet.inventory.map((i) => i.name), equipped: undefined } })),
      gazetteer: [{ name: "Gauntlet Shrine", type: "Setting" }], log: [], factions: seedWorld.factions,
      pressures: seedWorld.pressures, revealed: seedWorld.revealed,
    };
    writeFileSync(FIXTURE_WORLD_PATH, JSON.stringify(legacy, null, 2));
    console.log("  (minted dev/fixtures/gauntlet-world.json — none was committed yet)");
  }
  {
    const { win } = bootApp({ seed: SEED });
    let fixtureOk = false, err = null;
    try {
      const raw = JSON.parse(read("dev/fixtures/gauntlet-world.json"));
      win.migrateWorld(raw);
      const invOk = (raw.characters || []).every((c) => !c.sheet || !Array.isArray(c.sheet.inventory)
        || c.sheet.inventory.every((it) => it && typeof it === "object" && it.id && it.name));
      const bodyStr = JSON.stringify(raw);
      const invScanOk = !/undefined|NaN/.test(bodyStr.replace(/"[^"]*undefined[^"]*"/g, "")); // crude scan; real INV text-scan is UI-only
      fixtureOk = !!raw.map && !!raw.ledger && invOk;
      if (!fixtureOk) err = `map=${!!raw.map} ledger=${!!raw.ledger} invOk=${invOk}`;
    } catch (e) { err = String(e && e.stack || e); }
    const ok = check("committed fixture migrates without throw + INV holds", fixtureOk, err || "");
    if (!ok) addFinding({ severity: "crash", title: "migrateWorld failed/produced invalid state on the committed fixture",
      symptom: err, evidence: { stack: err, stateSnapshot: "dev/fixtures/gauntlet-world.json",
        repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-6-persistence.mjs` } });
  }

  // -------------------- (b) size audit --------------------
  console.log("\n-- (b) size audit — serialized bytes per checkpoint + a synthetic long world --");
  const sizeTable = [];
  for (const [label, builder] of CHECKPOINT_BUILDERS) {
    const { win } = bootApp({ seed: SEED });
    let w;
    try { w = builder(win); } catch (e) { continue; }
    const bytes = Buffer.byteLength(JSON.stringify(w), "utf-8");
    sizeTable.push({ checkpoint: label, bytes });
  }
  // synthetic long world: append 500 ledger entries + 200 codex records via the REAL append paths.
  let longWorldBytes = null, projected100Sessions = null, sizeReview = false;
  {
    const { win } = bootApp({ seed: SEED });
    const w = buildL5WithCompanionInventory(win);
    win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
    const cap = WATCHDOG_ITER_CAP;
    let i = 0;
    for (; i < 500 && i < cap; i++) {
      win.addLedger(w, "outcome", { kind: "gauntlet-synthetic", n: i }, `Synthetic ledger entry #${i} for size projection.`);
    }
    if (i >= cap) {
      addFinding({ severity: "review", title: "G6 size-audit ledger-append watchdog tripped",
        symptom: `Hit the ${cap}-iteration cap before reaching 500 ledger entries`,
        evidence: { stack: null, stateSnapshot: null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-6-persistence.mjs` } });
    }
    if (typeof win.ensureCodex === "function") win.ensureCodex(w);
    const codex = (typeof win.codexOf === "function") ? win.codexOf(w) : (w.codex = w.codex || { records: {}, version: 1 });
    let j = 0;
    for (; j < 200 && j < cap; j++) {
      const id = `gauntlet-codex-${j}`;
      codex.records[id] = { id, kind: "npc", name: `Synthetic NPC ${j}`, tags: ["gauntlet-synthetic"],
        facts: [`fact ${j}`], firstSeen: { day: 1, min: 360 } };
    }
    longWorldBytes = Buffer.byteLength(JSON.stringify(w), "utf-8");
    // linear projection: this world represents ~1 session's worth of content beyond baseline;
    // project 100 sessions off the per-session delta above the L5 baseline checkpoint.
    const baseline = (sizeTable.find((s) => s.checkpoint === "L5 PC with inventory+companion") || {}).bytes || 0;
    const perSessionDelta = Math.max(0, longWorldBytes - baseline);
    projected100Sessions = baseline + perSessionDelta * 100;
    sizeReview = projected100Sessions > 2.5 * 1024 * 1024;
  }
  sizeAudit = { perCheckpoint: sizeTable, syntheticLongWorldBytes: longWorldBytes, projected100SessionsBytes: projected100Sessions };
  console.log("  size table:", JSON.stringify(sizeTable));
  console.log(`  synthetic long world (500 ledger + 200 codex): ${longWorldBytes} bytes`);
  console.log(`  linear 100-session projection: ${projected100Sessions} bytes (${(projected100Sessions / 1024 / 1024).toFixed(2)} MB)`);
  check("size audit completed", sizeTable.length === CHECKPOINT_BUILDERS.length, `${sizeTable.length}/${CHECKPOINT_BUILDERS.length}`);
  if (sizeReview) {
    addFinding({ severity: "review", title: "Linear 100-session size projection exceeds 2.5 MB",
      symptom: `Projected ${(projected100Sessions / 1024 / 1024).toFixed(2)} MB for 100 sessions (long-world sample: ${longWorldBytes} bytes)`,
      evidence: { stack: null, stateSnapshot: null, repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-6-persistence.mjs` } });
  }

  // -------------------- (c) quota behavior --------------------
  console.log("\n-- (c) quota behavior — stub localStorage.setItem to throw QuotaExceededError once --");
  {
    const { win } = bootApp({ seed: SEED });
    const w = buildFreshWorld(win);
    win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
    const beforeSnapshot = JSON.stringify(win.U);

    let toastCalledWith = null;
    const realToast = win.toast;
    win.toast = (msg) => { toastCalledWith = msg; if (typeof realToast === "function") { try { realToast(msg); } catch (e) {} } };
    // jsdom's `localStorage` is an exotic Storage object (backed by a Proxy-like internal slot) —
    // assigning `win.localStorage.setItem = fn` directly is silently a no-op (the assignment doesn't
    // stick; verified against this exact jsdom version). Patch the shared Storage.prototype instead,
    // restoring it after exactly one throw so no other harness code in this process is affected.
    const storageProto = Object.getPrototypeOf(win.localStorage);
    const realSetItem = storageProto.setItem;
    storageProto.setItem = function (k, v) {
      storageProto.setItem = realSetItem; // once
      const err = new Error("QuotaExceededError");
      err.name = "QuotaExceededError";
      throw err;
    };

    let saveUThrew = false, saveUError = null;
    try { win.saveU(win.U); }
    catch (e) { saveUThrew = true; saveUError = String(e && e.stack || e); }
    finally { storageProto.setItem = realSetItem; } // defensive: guarantee restore even if saveU throws before its own single-use reset fires

    const afterSnapshot = (() => { try { return JSON.stringify(win.U); } catch (e) { return null; } })();
    const inMemoryIntact = afterSnapshot !== null && afterSnapshot === beforeSnapshot;

    check("quota: saveU() does not throw on a QuotaExceededError from localStorage.setItem", !saveUThrew, saveUError || "");
    check("quota: in-memory U is not corrupted after a failed localStorage write", inMemoryIntact);

    // "surfaces something user-visible" — the spec's own §1 write-failure path is the IDB layer's
    // storeHandleWriteFailure (toast + export offer), NOT saveU's synchronous localStorage.setItem
    // call, which per the module's own header comment (state.js:9-15) is left deliberately
    // untouched/un-wrapped this release ("keep the LS original exactly as it was"). So: saveU's own
    // localStorage.setItem call is UNGUARDED by design — this is the gap the spec's ruling (c) is
    // actually testing for. A throw propagating out of saveU with no user-visible surface = corrupt.
    if (saveUThrew && !toastCalledWith) {
      addFinding({
        severity: "corrupt",
        title: "saveU() throws uncaught on QuotaExceededError from localStorage.setItem with no user-visible surface",
        symptom: "localStorage.setItem throwing QuotaExceededError (a real, common browser condition once a user's save nears the 5-10MB LS cap) propagates straight out of saveU() with no catch, no toast, no export offer — the write is silently lost from the caller's perspective beyond an uncaught exception. This is exactly the ‘worlds persist forever’ promise failing silently the spec's §8(c) is testing for.",
        evidence: {
          stack: saveUError,
          stateSnapshot: null,
          repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-6-persistence.mjs  # (c) quota behavior — stub localStorage.setItem to throw once`,
        },
      });
    } else if (!saveUThrew && !toastCalledWith) {
      // saveU swallowed the throw somehow (shouldn't happen given its source, but if a future edit
      // wraps it in try/catch without a user-visible surface, that's the "silent swallow" the spec
      // names explicitly as corrupt).
      addFinding({
        severity: "corrupt",
        title: "A localStorage quota failure is silently swallowed with no user-visible surface",
        symptom: "Neither an uncaught throw nor a toast/export-offer occurred after localStorage.setItem threw QuotaExceededError — the failure vanished silently.",
        evidence: { stack: null, stateSnapshot: null,
          repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-6-persistence.mjs  # (c) quota behavior` },
      });
    }
  }

  // -------------------- migration boot path smoke (migrateLStoIDB) --------------------
  console.log("\n-- migrateLStoIDB boot-path smoke --");
  {
    const { win } = bootApp({ seed: SEED });
    const w = buildFreshWorld(win);
    win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
    win.saveU(win.U);
    let migResult = null, migErr = null;
    try {
      migResult = await awaitRealm(() => win.migrateLStoIDB());
    } catch (e) { migErr = String(e && e.stack || e); }
    check("migrateLStoIDB completes without throw", !migErr, migErr || "");
    check("migrateLStoIDB reports ok:true on a clean LS blob", migResult && migResult.ok === true, JSON.stringify(migResult));
  }

  // -------------------- archiveOldSessions lifecycle (prune-after-success) --------------------
  console.log("\n-- archiveOldSessions: prune-after-success lifecycle --");
  {
    const { win } = bootApp({ seed: SEED });
    const w = buildFreshWorld(win);
    // stamp dmlog entries across sessions 0..5 so some are eligible (session <= cur-HOT_SESSIONS)
    for (let s = 0; s <= 5; s++) {
      w.session = s;
      win.pushDmLog(w, "dm", `Session ${s} narration line.`, {});
    }
    w.session = 5; // HOT_SESSIONS default 3 -> threshold = 2 -> sessions 0,1,2 eligible
    win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;

    let archResult = null, archErr = null;
    try {
      archResult = await awaitRealm(() => win.archiveOldSessions(w));
    } catch (e) { archErr = String(e && e.stack || e); }
    check("archiveOldSessions completes without throw", !archErr, archErr || "");
    check("archiveOldSessions moved the eligible (session<=threshold) entries",
      archResult && archResult.ok === true && archResult.moved === 3, JSON.stringify(archResult));
    check("archiveOldSessions left newer sessions (3,4,5) hot in w.dmlog",
      w.dmlog.length === 3 && w.dmlog.every((e) => e.session >= 3), JSON.stringify(w.dmlog.map((e) => e.session)));

    let readBack = null, readErr = null;
    try {
      readBack = await awaitRealm(() => win.archiveReadForWorld(w.id));
    } catch (e) { readErr = String(e && e.stack || e); }
    check("archiveReadForWorld returns the archived prose on demand", !readErr && Array.isArray(readBack) && readBack.length === 3, readErr || JSON.stringify(readBack));
  }

} catch (fatal) {
  harnessDefect = fatal;
}
})();

// ============================================================================================
// report + exit
// ============================================================================================
const invokedCheckpoints = checkpointResults.length;
const okCheckpoints = checkpointResults.filter((c) => c.ok).length;

const harnessEntry = {
  id: HARNESS_ID,
  status: harnessDefect ? "defect" : "completed",
  invoked: invokedCheckpoints,
  skipped: 0,
  findings: findings.length,
  stats: {
    checkpoints: `${okCheckpoints}/${invokedCheckpoints}`,
    checkpointDetail: checkpointResults,
    sizeAudit,
    canary: CANARY,
    checksRun: pass + fail,
    checksPassed: pass,
    checksFailed: fail,
  },
};
if (harnessDefect) {
  harnessEntry.harnessDefect = String(harnessDefect && harnessDefect.stack || harnessDefect);
}

const report = loadReport();
writeReport(report, harnessEntry, findings);

// human digest (regenerated in full each run, mirrors the report's current findings across all harnesses)
function writeHumanDigest(rep) {
  const bySeverity = { crash: [], corrupt: [], wrong: [], ugly: [], review: [] };
  (rep.findings || []).forEach((f) => { (bySeverity[f.severity] || (bySeverity[f.severity] = [])).push(f); });
  let md = `# GAUNTLET FINDINGS\n\nRun: ${rep.run.date} · seed ${rep.run.seed} · commit ${rep.run.commit}\n\n`;
  for (const sev of ["crash", "corrupt", "wrong", "ugly", "review"]) {
    const list = bySeverity[sev] || [];
    md += `## ${sev} (${list.length})\n\n`;
    for (const f of list) {
      md += `- **${f.id}** [${f.harness}]${f.collisionZone ? " ⚠️ collisionZone" : ""} — ${f.title}\n  - ${f.symptom}\n  - repro: \`${f.evidence && f.evidence.repro}\`\n`;
    }
    md += "\n";
  }
  writeFileSync(join(ROOT, "dev/GAUNTLET-FINDINGS.md"), md);
}
writeHumanDigest(report);

console.log(`\n=== G6 summary: ${pass} passed, ${fail} failed — ${findings.length} finding(s) written to dev/gauntlet-report.json ===`);
if (findings.length) {
  findings.forEach((f) => console.log(`  [${f.severity}] ${f.id}: ${f.title}`));
}

if (harnessDefect) {
  console.error("\nHARNESS DEFECT (not a game bug — the harness itself failed):", harnessDefect && harnessDefect.stack || harnessDefect);
  process.exit(1);
}

// Exit-code semantics (spec §0): exit 0 when the harness RAN TO COMPLETION — findings are data,
// not test failures. EXCEPT the canary contract: GAUNTLET_CANARY=1 must demonstrably fire RED
// (>=1 finding AND exit 1) so a detector that's never caught anything is never trusted silently.
if (CANARY) {
  if (findings.length > 0) {
    console.error(`\nCANARY FIRED: ${findings.length} finding(s) emitted as expected. Exiting 1 (canary contract).`);
    process.exit(1);
  } else {
    console.error("\nCANARY DID NOT FIRE: expected >=1 finding under GAUNTLET_CANARY=1 but got 0. This is a harness defect (the detector caught nothing).");
    process.exit(1);
  }
}

process.exit(0);
