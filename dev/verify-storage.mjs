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
   14. PRUNE-AFTER-SUCCESS regression (code-review blocker fix): eligible dmlog prose survives, un-pruned,
       whenever archiveOldSessions could NOT durably archive it — IDB entirely absent (14a), or IDB present
       but the archive write itself fails (14b). Pins the fix for a real data-loss bug: an earlier version
       spliced w.dmlog BEFORE the archive write was confirmed, so a failed/skipped write silently destroyed
       the only copy of that prose (gone from dmlog, never landed in the archive store, then persisted-gone
       by the very next saveU).
   15. Chronicle on-demand read (FOREVER-STORAGE §2 "viewable on demand from the Chronicle", §4 item 3):
       charHistoryBody always renders the vault affordance CLOSED by default, and rendering it fires NO
       archive read (the read must never sit on the render hot path).
   16. opening the vault (archiveVaultToggle) fetches the archived prose and renders it OLDEST-FIRST,
       alongside the untouched ledger view.
   17. re-render echo guard: a toggle whose open-state already matches GS (the <details open> re-parse
       echo) is a no-op — no second fetch, no state churn.
   18. closing the vault clears the fetched prose from GS and from the rendered panel.
   19. an empty archive renders the explanatory empty line — never throws, never fakes content.
   20. escaping: archived prose is escHtml'd on the way into the DOM (a <script> payload stays inert).
   21. null-safety: archiveReadForWorld absent/broken (load-order or old-browser degrade) — opening the
       vault never throws and settles on the empty-vault line.

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

// 14. PRUNE-AFTER-SUCCESS regression (the forever-guards blocker fix): eligible prose must survive in
// w.dmlog, un-pruned, whenever it could NOT be durably archived — whether because IDB is entirely
// absent, or because IDB is present but the archive write itself fails (quota, etc). A version that
// splices w.dmlog BEFORE confirming the archive write would fail these two checks by silently losing
// the prose (gone from dmlog, never landed in the archive store either).
{
  // 14a. IDB entirely absent -> the sweep must be skipped and the prose must stay hot.
  const { win } = newWin(false);
  const dmlog = [{ role: "player", text: "must survive (no idb)", session: 1, t: 1 }];
  const w = mkWorld(win, { id: "w-noidb-survive", session: 9, dmlog });
  const r = await win.archiveOldSessions(w);
  check("no-idb: archiveOldSessions does not report entries moved", r.ok !== false && r.moved === 0, JSON.stringify(r));
  check("no-idb: the eligible prose is still in w.dmlog, un-pruned", w.dmlog.length === 1 && w.dmlog[0].text === "must survive (no idb)", JSON.stringify(w.dmlog));
}
{
  // 14b. IDB present but the archive write fails -> the prose must stay hot, not be silently lost.
  const { win, shim } = newWin();
  win.eval(`window.exportWorldFile=function(){window.__exportCalled=true;};`); // stub: jsdom has no URL.createObjectURL for the real download path
  const dmlog = [{ role: "player", text: "must survive (write fails)", session: 1, t: 1 }];
  const w = mkWorld(win, { id: "w-writefail-survive", session: 9, dmlog });
  shim.forceNextWriteToFail();
  const r = await win.archiveOldSessions(w);
  await flush();
  check("write-fails: archiveOldSessions reports the failure (not ok)", r.ok === false, JSON.stringify(r));
  check("write-fails: the eligible prose is still in w.dmlog, un-pruned", w.dmlog.length === 1 && w.dmlog[0].text === "must survive (write fails)", JSON.stringify(w.dmlog));
  const archived = await win.archiveReadForWorld("w-writefail-survive");
  check("write-fails: nothing landed in the archive store either (it truly failed, not just under-reported)", archived.length === 0, JSON.stringify(archived));
}

// ============================================================================
// §4. CHRONICLE ON-DEMAND READ — the archived-narration vault in the Character › History panel
// (FOREVER-STORAGE §2 "viewable on demand from the Chronicle", §4 build item 3).
// renderWorld is stubbed to a counter here: the vault's state machine + string renderers are the unit
// under test, not the full world paint (which needs a complete live world this fixture doesn't build).
// ============================================================================
console.log("\n--- §4. Chronicle on-demand read (the vault) ---");

const stubRender = (win) => win.eval(
  `window.__renders=0; renderWorld=function(){window.__renders++;};
   (function(){ var orig=archiveReadForWorld; window.__archReads=0;
     archiveReadForWorld=function(id){ window.__archReads++; return orig(id); }; })();`);

// 15. the vault affordance renders closed by default; rendering fires NO archive read
{
  const { win } = newWin();
  stubRender(win);
  const w = mkWorld(win, { id: "w-vault-closed", session: 5 });
  const html = win.charHistoryBody(w, w.characters[0]);
  check("the Chronicle renders the vault affordance", html.includes("archiveVaultToggle('w-vault-closed'") && html.includes("Archived narration"), html.slice(0, 200));
  check("the vault is CLOSED by default (no open attribute, no body)", !/details class="cp-history" open/.test(html));
  check("rendering the Chronicle fires no archive read (on-demand only, never the hot path)", win.__archReads === 0);
}

// 16–19. open → oldest-first prose; echo guard; close clears; alongside the untouched ledger
{
  const { win } = newWin();
  stubRender(win);
  const dmlog = [
    { role: "player", text: "vault line from session one", session: 1, t: 1 },
    { role: "dm", text: "vault reply from session two", session: 2, t: 2 },
    { role: "dm", text: "still hot", session: 6, t: 3 },
  ];
  const ledger = [{ id: "l1", type: "outcome", day: 1, min: 300, text: "the ledger line", data: {} }];
  const w = mkWorld(win, { id: "w-vault", session: 6, dmlog, ledger }); // threshold 6-3=3 → sessions 1+2 archive
  await win.archiveOldSessions(w);
  await flush();

  // 16. open fetches + renders oldest-first
  win.archiveVaultToggle("w-vault", true);
  check("opening flips GS.archive open + loading", win.GS.archive.open === true && win.GS.archive.worldId === "w-vault");
  await flush(16);
  check("the fetch landed (2 archived entries, loading cleared)", win.GS.archive.loading === false && Array.isArray(win.GS.archive.entries) && win.GS.archive.entries.length === 2, JSON.stringify(win.GS.archive));
  const html = win.charHistoryBody(w, w.characters[0]);
  const i1 = html.indexOf("vault line from session one"), i2 = html.indexOf("vault reply from session two");
  check("archived prose renders on demand, oldest-first", i1 >= 0 && i2 >= 0 && i1 < i2, `i1=${i1} i2=${i2}`);
  check("player vs DM lines are distinguished", html.includes("➤ you") && html.includes("✦ dm"));
  check("the ledger view renders alongside, untouched", html.includes("the ledger line"));

  // 17. re-render echo guard: same-state toggle is a no-op (no refetch)
  const reads = win.__archReads;
  win.archiveVaultToggle("w-vault", true);
  await flush(16);
  check("a same-state toggle (the <details open> re-parse echo) fetches nothing again", win.__archReads === reads && win.GS.archive.open === true);

  // 18. close clears the prose from GS and from the panel
  win.archiveVaultToggle("w-vault", false);
  const closed = win.charHistoryBody(w, w.characters[0]);
  check("closing clears the fetched prose", win.GS.archive.open === false && win.GS.archive.entries === null && !closed.includes("vault line from session one"));
}

// 19. an empty archive renders the explanatory empty line — never throws
{
  const { win } = newWin();
  stubRender(win);
  const w = mkWorld(win, { id: "w-vault-empty", session: 1 });
  win.archiveVaultToggle("w-vault-empty", true);
  await flush(16);
  const html = win.charHistoryBody(w, w.characters[0]);
  check("an empty archive shows the empty-vault line", html.includes("Nothing rests in the vault yet"), html.slice(html.indexOf("vault")));
}

// 20. escaping: archived prose is escHtml'd — a <script> payload stays inert
{
  const { win } = newWin();
  stubRender(win);
  const dmlog = [{ role: "dm", text: "<script>alert(1)</script> **bold**", session: 1, t: 1 }];
  const w = mkWorld(win, { id: "w-vault-esc", session: 9, dmlog });
  await win.archiveOldSessions(w);
  await flush();
  win.archiveVaultToggle("w-vault-esc", true);
  await flush(16);
  const html = win.charHistoryBody(w, w.characters[0]);
  check("archived prose is escaped on the way into the DOM", html.includes("&lt;script&gt;") && !html.includes("<script>alert"), html.slice(0, 400));
  check("DM prose still gets the mdBold pass after escaping", html.includes("<b>bold</b>"));
}

// 21. null-safety: archiveReadForWorld absent → opening never throws, settles on the empty-vault line
{
  const { win } = newWin();
  stubRender(win);
  win.eval("archiveReadForWorld=undefined;");
  const w = mkWorld(win, { id: "w-vault-noread", session: 9 });
  let threw = false;
  try { win.archiveVaultToggle("w-vault-noread", true); await flush(16); } catch (e) { threw = true; }
  const html = win.charHistoryBody(w, w.characters[0]);
  check("a missing archiveReadForWorld never throws and settles empty", threw === false && html.includes("Nothing rests in the vault yet"));
}

// ============================================================================
console.log(`\n${fail ? "✗" : "✓"} STORAGE: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
