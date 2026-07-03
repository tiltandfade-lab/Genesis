/* verify-storage.mjs — headless test for FOREVER STORAGE §1/§2 (docs/FOREVER-STORAGE.md,
   docs/BATCH3-GUARDRAILS.md J1: forever-guards ≥10/0 combined with verify-migrations.mjs).
   Full-app jsdom load, manifest.loadOrder (same "const-via-eval" convention as
   dev/verify-durability.mjs / dev/verify-gap-wiring.mjs) + the fake-IndexedDB shim (dev/fake-idb-shim.mjs,
   BATCH3-GUARDRAILS J2: "if fake-indexeddb isn't available, SHIM the minimal IDB surface in the harness").

   Enumerated assertions (FOREVER-STORAGE.md §4 + BATCH3-GUARDRAILS J1):
   1. changed-world-only writes: saving world A never rewrites world B (spy on the archive/worlds map).
   2. debounce coalesces a burst of saveWorld calls on the SAME world into one underlying IDB write.
   3. debounce: two DIFFERENT world ids each get their own independent timer (world B's save isn't
      delayed or dropped by world A's in-flight debounce).
   4. quota-failure path surfaces the export offer (storeQuotaOffer) — never swallowed.
   5. MUTATION CHECK: swallow the write-failure path (no storeHandleWriteFailure call), confirm the
      export offer does NOT fire (RED), restore, confirm it fires again (GREEN).
   6. archive moves prose past HOT_SESSIONS into the archive store; the ledger is UNTOUCHED.
   7. archived prose still renders on demand (archiveReadForWorld returns it, oldest-first).
   8. archive is additive/idempotent: calling archiveOldSessions twice in a row doesn't double-move or
      duplicate entries.
   9. a session within the hot window (session > threshold) stays in w.dmlog, not archived.
   10. storageEstimate degrades to {ok:false} when navigator.storage is absent — never throws.
   11. saveU (world.state, UNCHANGED at its 37 call sites) still writes localStorage synchronously AND
       additionally fires the new debounced IDB save for the active world — regression: the existing
       synchronous contract is intact even with world.store loaded.
   12. NULL-SAFE regression: every store.js function degrades to a flagged no-op (never throws) when
       indexedDB is entirely absent (a real old-browser scenario, distinct from the shim being installed).
   13. the no-idb degrade path stays SILENT — no alarming toast, no export-offer — since absence isn't a
       write failure (a regression pin for a real bug caught during this unit's own full-sweep run: an
       earlier version of storeWriteWorldNow/saveMeta/archiveAppend treated "no-idb" as a failure and
       fired the quota alarm on every saveU call in EVERY other harness in the repo).

   Run:  node dev/verify-storage.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync } from "node:fs";
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

// small helper: flush enough microtask turns for the shim's multi-hop tx settle + store.js's .then chains
const flush = (n = 8) => new Promise((resolve) => {
  let i = 0;
  const step = () => { if (++i >= n) resolve(); else queueMicrotask(step); };
  step();
});

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function mkWorld(win, opts) {
  opts = opts || {};
  const w = {
    id: opts.id || "w-store", name: opts.name || "Test World", session: opts.session != null ? opts.session : 1,
    startNodeId: "home", currentNodeId: "home",
    map: { nodes: { home: { id: "home", name: "Home", type: "Setting" } }, edges: [] },
    gazetteer: [], ledger: opts.ledger || [], log: [], clock: { day: 1, min: 300 },
    dmlog: opts.dmlog || [],
    characters: [{ status: "living", name: "Wren", conditions: [], sheet: { level: 3, gold: 100, mods: {}, scores: {}, inventory: [], equipped: {} } }],
    factions: [], pressures: [], shops: {}, codex: { records: {}, version: 1 },
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

// ============================================================================
// §1. IDB LAYER — changed-world-only, debounce, quota safety net
// ============================================================================
console.log("\n--- §1. IDB layer ---");

// 1. changed-world-only: saving world A never rewrites world B
{
  const { win, shim } = newWin();
  const wa = mkWorld(win, { id: "w-a", name: "Alpha" });
  const wb = mkWorld(win, { id: "w-b", name: "Beta" });
  await win.saveWorld(wa, { immediate: true });
  await flush();
  const betaBefore = shim.data.worlds.get("w-b");
  check("world B is absent before it's ever saved", betaBefore === undefined);
  wa.name = "Alpha (mutated)";
  await win.saveWorld(wa, { immediate: true });
  await flush();
  check("world A's own save landed", shim.data.worlds.get("w-a") && shim.data.worlds.get("w-a").name === "Alpha (mutated)");
  check("world B still absent — saving A never touched/rewrote B", shim.data.worlds.get("w-b") === undefined);
}

// 2. debounce coalesces a burst of saves on the SAME world into one write
{
  const { win, shim } = newWin();
  const w = mkWorld(win, { id: "w-burst" });
  w.name = "v1"; win.saveWorld(w);
  w.name = "v2"; win.saveWorld(w);
  w.name = "v3"; win.saveWorld(w);           // only the LAST of a same-tick burst should land
  await new Promise((r) => setTimeout(r, 350)); // past the 250ms debounce window
  await flush();
  const rec = shim.data.worlds.get("w-burst");
  check("a burst of saveWorld calls on one world coalesces to the latest snapshot", rec && rec.name === "v3", JSON.stringify(rec));
}

// 3. two different world ids each get their own independent debounce timer
{
  const { win, shim } = newWin();
  const wa = mkWorld(win, { id: "w-ta", name: "TA" });
  const wb = mkWorld(win, { id: "w-tb", name: "TB" });
  win.saveWorld(wa); win.saveWorld(wb);
  await new Promise((r) => setTimeout(r, 350));
  await flush();
  check("world A's independent debounce landed", shim.data.worlds.get("w-ta") && shim.data.worlds.get("w-ta").name === "TA");
  check("world B's independent debounce landed too (not dropped by A's in-flight timer)",
    shim.data.worlds.get("w-tb") && shim.data.worlds.get("w-tb").name === "TB");
}

// 4. quota-failure path surfaces the export offer
{
  const { win, shim } = newWin();
  win.eval(`window.__toasts=[]; window.toast=function(m){window.__toasts.push(m);}; window.__exportCalled=false; window.exportWorldFile=function(){window.__exportCalled=true;};`);
  const w = mkWorld(win, { id: "w-quota" });
  shim.forceNextWriteToFail();
  const r = await win.saveWorld(w, { immediate: true });
  await flush();
  check("a failed write is reported (not ok)", r && r.ok === false, JSON.stringify(r));
  check("the failure surfaces a toast", win.__toasts.length > 0, JSON.stringify(win.__toasts));
  check("the failure triggers the export-on-failure offer", win.__exportCalled === true);
}

console.log(`\n✓ §1 (pre-mutation): ${pass} passed, ${fail} failed so far`);

// 5. MUTATION CHECK — swallow the write-failure path, confirm the export offer stops firing (RED),
// restore, confirm it fires again (GREEN).
console.log("\n--- mutation guard: a failed IDB write must never be swallowed silently ---");
const storePath = join(ROOT, "src/world/store.js");
const originalStore = readFileSync(storePath, "utf-8");
const mutatedSwallow = originalStore.replace(
  "    if(!r.ok && r.reason!==\"no-idb\") storeHandleWriteFailure(r, w);",
  "    /* MUTATION: write failures are silently swallowed, no export offer */"
);
if (mutatedSwallow === originalStore) throw new Error("mutation pattern (§1) didn't match src/world/store.js — update the harness");
{
  const fs = await import("node:fs");
  try {
    fs.writeFileSync(storePath, mutatedSwallow, "utf-8");
    const { win, shim } = newWin();
    win.eval(`window.__exportCalled=false; window.exportWorldFile=function(){window.__exportCalled=true;}; window.toast=function(){};`);
    const w = mkWorld(win, { id: "w-mut-quota" });
    shim.forceNextWriteToFail();
    await win.saveWorld(w, { immediate: true });
    await flush();
    check("MUTATION RED: with the failure-handling call removed, a quota failure is swallowed (no export offer)",
      win.__exportCalled === false);
  } finally {
    fs.writeFileSync(storePath, originalStore, "utf-8");
  }
  const { win: win2, shim: shim2 } = newWin();
  win2.eval(`window.__exportCalled=false; window.exportWorldFile=function(){window.__exportCalled=true;}; window.toast=function(){};`);
  const w2 = mkWorld(win2, { id: "w-mut-quota2" });
  shim2.forceNextWriteToFail();
  await win2.saveWorld(w2, { immediate: true });
  await flush();
  check("RESTORED: after reverting the mutation, a quota failure surfaces the export offer again", win2.__exportCalled === true);
}

// ============================================================================
// §2. HISTORY LIFECYCLE — archive past HOT_SESSIONS, ledger untouched
// ============================================================================
console.log("\n--- §2. History lifecycle ---");

// 6. archive moves prose past HOT_SESSIONS; ledger untouched
{
  const { win } = newWin();
  const dmlog = [
    { role: "player", text: "s1 line", session: 1, t: 1 },
    { role: "dm", text: "s1 reply", session: 1, t: 2 },
    { role: "player", text: "s5 line", session: 5, t: 3 },
  ];
  const ledger = [{ id: "l1", type: "outcome", day: 1, min: 300, text: "ledger stays put", data: {} }];
  const w = mkWorld(win, { id: "w-arch", session: 5, dmlog, ledger }); // threshold = 5-3=2 → session<=2 archives
  const r = await win.archiveOldSessions(w);
  await flush();
  check("archiveOldSessions reports 2 moved (both session-1 entries)", r.ok && r.moved === 2, JSON.stringify(r));
  check("the two session-1 entries are gone from the hot dmlog", w.dmlog.length === 1 && w.dmlog[0].session === 5, JSON.stringify(w.dmlog));
  check("the ledger is completely untouched", JSON.stringify(w.ledger) === JSON.stringify(ledger));
}

// 7. archived prose still renders on demand
{
  const { win } = newWin();
  const dmlog = [{ role: "player", text: "an old line", session: 1, t: 1 }];
  const w = mkWorld(win, { id: "w-arch2", session: 4, dmlog }); // threshold = 4-3=1 → session<=1 archives
  await win.archiveOldSessions(w);
  await flush();
  const archived = await win.archiveReadForWorld("w-arch2");
  check("the archived entry is readable on demand", archived.length === 1 && archived[0].text === "an old line", JSON.stringify(archived));
}

// 8. archive is additive/idempotent across two calls (no duplication)
{
  const { win } = newWin();
  const dmlog = [{ role: "player", text: "line one", session: 1, t: 1 }];
  const w = mkWorld(win, { id: "w-arch3", session: 4, dmlog });
  await win.archiveOldSessions(w); await flush();
  const r2 = await win.archiveOldSessions(w); // second call: nothing left in dmlog to archive
  await flush();
  check("a second archive call moves nothing more (dmlog already drained)", r2.ok && r2.moved === 0, JSON.stringify(r2));
  const archived = await win.archiveReadForWorld("w-arch3");
  check("no duplicate entries appear in the archive store", archived.length === 1, JSON.stringify(archived));
}

// 9. a session inside the hot window stays in dmlog, not archived
{
  const { win } = newWin();
  const dmlog = [
    { role: "player", text: "old", session: 1, t: 1 },
    { role: "player", text: "recent", session: 4, t: 2 },
  ];
  const w = mkWorld(win, { id: "w-arch4", session: 4, dmlog }); // threshold=1 → only session<=1 archives
  await win.archiveOldSessions(w);
  await flush();
  check("the recent (session 4) entry stays hot", w.dmlog.length === 1 && w.dmlog[0].text === "recent", JSON.stringify(w.dmlog));
}

console.log(`\n✓ §2 (pre-mutation): ${pass} passed, ${fail} failed so far`);

// ============================================================================
// §3. NULL-SAFE / regression
// ============================================================================
console.log("\n--- §3. Null-safety + saveU regression ---");

// 10. storageEstimate degrades gracefully when navigator.storage is absent
{
  const { win } = newWin();
  const r = await win.storageEstimate();
  check("storageEstimate degrades to {ok:false} with no navigator.storage (jsdom has none)", r.ok === false, JSON.stringify(r));
}

// 11. saveU (UNCHANGED call sites) still writes localStorage synchronously + fires the debounced IDB save
{
  const { win, shim } = newWin();
  const w = mkWorld(win, { id: "w-saveu" });
  win.saveU(win.U);
  const lsRaw = win.localStorage.getItem("genesis-universe-v2");
  check("saveU still writes localStorage synchronously (the existing contract, untouched)",
    typeof lsRaw === "string" && JSON.parse(lsRaw).worlds["w-saveu"], "no LS write found");
  await new Promise((r) => setTimeout(r, 350));
  await flush();
  check("saveU ALSO fired the new debounced IDB save for the active world",
    shim.data.worlds.get("w-saveu") !== undefined, "world never landed in IDB");
}

// 12. NULL-SAFE regression: no indexedDB at all -> every store.js function degrades, never throws
{
  const { win } = newWin(false); // withIDB=false: no shim installed, indexedDB stays undefined
  let threw = false;
  let r1, r2, r3;
  try {
    r1 = await win.saveWorld(mkWorld(win, { id: "w-noidb" }), { immediate: true });
    r2 = await win.archiveOldSessions(win.U.worlds["w-noidb"]);
    r3 = await win.migrateLStoIDB();
  } catch (e) { threw = true; }
  check("saveWorld/archiveOldSessions/migrateLStoIDB never throw with no indexedDB present", threw === false);
  check("saveWorld reports the no-idb reason instead of silently pretending success", r1 && r1.ok === false && r1.reason === "no-idb", JSON.stringify(r1));
  check("saveU itself still works fine with no indexedDB (localStorage path unaffected)", (() => {
    try { win.saveU(win.U); return true; } catch (e) { return false; }
  })());
}

// 13. the no-idb degrade path stays SILENT — no alarming toast, no export-offer (regression pin: an
// earlier version of this file fired the quota alarm on EVERY saveU call across the whole repo's test
// suite whenever indexedDB was simply absent, which is the common case in every OTHER harness).
{
  const { win } = newWin(false);
  win.eval(`window.__toasts=[]; window.toast=function(m){window.__toasts.push(m);}; window.__exportCalled=false; window.exportWorldFile=function(){window.__exportCalled=true;};`);
  const w = mkWorld(win, { id: "w-silent-noidb" });
  await win.saveWorld(w, { immediate: true });
  await win.saveMeta("someKey", 1);
  await win.archiveOldSessions(Object.assign(w, { session: 9, dmlog: [{ role: "player", text: "x", session: 1 }] }));
  check("no toast fires for a plain no-idb absence (not a write failure)", win.__toasts.length === 0, JSON.stringify(win.__toasts));
  check("no export-offer fires for a plain no-idb absence", win.__exportCalled === false);
}

// ============================================================================
console.log(`\n${fail ? "✗" : "✓"} STORAGE: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
