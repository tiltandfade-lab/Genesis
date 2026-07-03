/* verify-idb-hydration.mjs — headless test for the IDB->U boot hydration (fix/idb-boot-hydration).

   THE BUG (found LIVE in a browser combat proof, 2026-07-03): loadU() reads localStorage only, and no
   boot path ever read the IndexedDB `worlds` store back into U — the forever-store was WRITE-ONLY. A
   lost/overwritten localStorage mirror (quota churn, eviction, a stray small write) booted an EMPTY
   universe while every world sat intact in IDB, invisible, with no in-app recovery. Recovery that day
   was a hand-typed console script; this fix + harness make it automatic and pinned.

   Checks (the mutation check #4 IS the red proof — it stubs the fix out and asserts the pre-fix shape):
   1. lost-LS boot: IDB holds worlds, U boots empty -> storeHydrateFromIDB adopts them all into U.worlds.
   2. healthy boot: a world present in BOTH keeps the U (localStorage) copy — IDB never overwrites a
      live world (LS is the synchronous copy; IDB is debounced -> U is never older).
   3. the boot chain repairs the LS mirror: after adoption, saveU persists the recovered worlds so the
      NEXT boot's loadU() sees them without IDB.
   4. MUTATION CHECK: with the hydrate stubbed to a no-op, check 1's scenario leaves U empty (the RED
      shape) — proves these checks detect the pre-fix behavior.
   5. NULL-SAFE: no IDB at all -> {ok:false,reason:"no-idb"}, never throws, U untouched.
   6. no-universe guard: U absent -> {ok:false,reason:"no-universe"}, never throws.
   7. boot-chain order pins (structural, against genesis.html): migrate LS->IDB first, hydrate second,
      saveU repair on adoption.

   Boot convention copied from dev/verify-storage.mjs (loadOrder paths, one concatenated eval, var-U
   harness, fake-idb-shim installed pre-eval).
   Run:  node dev/verify-idb-hydration.mjs  */
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
const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");

function newWin(opts) {
  opts = opts || {};
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div><div id="shelf"></div><div id="storageMeter"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  let shim = null;
  if (opts.withIDB !== false) shim = installFakeIndexedDB(dom.window);
  const uInit = JSON.stringify(opts.universe || { worlds: {}, activeWorldId: null, revealed: {} });
  dom.window.eval(`var U=${uInit}; var SEED=null;\n` + full);
  return { win: dom.window, shim };
}

const flush = (n = 12) => new Promise((resolve) => {
  let i = 0;
  const step = () => { if (++i >= n) resolve(); else queueMicrotask(step); };
  step();
});

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function idbPutWorld(win, world) {
  // write through the app's own layer (storeWriteWorldNow) — the shim's tx settle needs flushes
  win.eval(`storeWriteWorldNow(${JSON.stringify(world)});`);
  return flush(24);
}

const W1 = { id: "w-lost-1", name: "Lost World One", characters: [], ledger: [] };
const W2 = { id: "w-lost-2", name: "Lost World Two", characters: [], ledger: [] };

console.log("--- 1. lost-LS boot: IDB worlds adopted into an empty U ---");
{
  const { win } = newWin();                                    // the 3.7KB-stub scenario: U boots empty
  await idbPutWorld(win, W1); await idbPutWorld(win, W2);
  let r; win.eval("storeHydrateFromIDB().then(x=>{ window.__hyd=x; });"); await flush(24);
  r = win.__hyd;
  check("1. hydrate reports ok", r && r.ok === true, JSON.stringify(r));
  check("1b. both lost worlds adopted", r && r.adopted.length === 2 && !!win.U.worlds["w-lost-1"] && !!win.U.worlds["w-lost-2"], JSON.stringify(r && r.adopted));
  check("1c. adopted world carries its data", win.U.worlds["w-lost-1"] && win.U.worlds["w-lost-1"].name === "Lost World One");
}

console.log("--- 2. healthy boot: the U copy wins for worlds present in both ---");
{
  const lsCopy = { id: "w-both", name: "LS Fresh Copy", marker: "ls-is-fresher", characters: [], ledger: [] };
  const idbCopy = { id: "w-both", name: "IDB Stale Copy", marker: "idb-is-staler", characters: [], ledger: [] };
  const { win } = newWin({ universe: { worlds: { "w-both": lsCopy }, activeWorldId: "w-both", revealed: {} } });
  await idbPutWorld(win, idbCopy);
  win.eval("storeHydrateFromIDB().then(x=>{ window.__hyd=x; });"); await flush(24);
  const r = win.__hyd;
  check("2. nothing adopted on a healthy boot", r && r.ok === true && r.adopted.length === 0, JSON.stringify(r));
  check("2b. the live U copy is untouched", win.U.worlds["w-both"].marker === "ls-is-fresher", win.U.worlds["w-both"].marker);
}

console.log("--- 3. the boot chain repairs the LS mirror ---");
{
  const { win } = newWin();
  await idbPutWorld(win, W1);
  win.eval("storeHydrateFromIDB().then(x=>{ window.__hyd=x; });"); await flush(24);
  win.eval("saveU(U);");                                       // what the genesis.html chain does on adoption
  const nextBoot = JSON.parse(win.localStorage.getItem("genesis-universe-v2"));
  check("3. recovered world persisted to the LS mirror", !!(nextBoot.worlds && nextBoot.worlds["w-lost-1"]), Object.keys(nextBoot.worlds || {}).join(","));
}

console.log("--- 4. MUTATION CHECK: stubbed hydrate leaves the pre-fix red shape ---");
{
  const { win } = newWin();
  await idbPutWorld(win, W1);
  win.eval("storeHydrateFromIDB = function(){ return Promise.resolve({ok:false,reason:'stubbed'}); };");
  win.eval("storeHydrateFromIDB().then(x=>{ window.__hyd=x; });"); await flush(24);
  check("4. without the fix the lost world stays invisible (U empty)", !win.U.worlds["w-lost-1"]);
}

console.log("--- 5/6. null-safe degrades ---");
{
  const { win } = newWin({ withIDB: false });                  // no IDB shim installed at all
  win.eval("storeHydrateFromIDB().then(x=>{ window.__hyd=x; });"); await flush(24);
  const r5 = win.__hyd;
  check("5. no IDB -> flagged no-op, U untouched", r5 && r5.ok === false && r5.reason === "no-idb" && Object.keys(win.U.worlds).length === 0, JSON.stringify(r5));
  const { win: win6 } = newWin();
  win6.eval("var __saved=U; U=undefined; storeHydrateFromIDB().then(x=>{ window.__hyd=x; U=__saved; });"); await flush(24);
  const r6 = win6.__hyd;
  check("6. no universe -> flagged no-op", r6 && r6.ok === false && r6.reason === "no-universe", JSON.stringify(r6));
}

console.log("--- 7. boot-chain order pins (genesis.html, structural) ---");
{
  const html = read("genesis.html");
  const mi = html.indexOf("migrateLStoIDB()");
  const hi = html.indexOf("storeHydrateFromIDB()");
  check("7. hydrate chains AFTER the LS->IDB migrate", mi > -1 && hi > mi, "migrate@" + mi + " hydrate@" + hi);
  check("7b. adoption repairs the mirror via saveU in the chain", html.indexOf("saveU(U)", mi) > -1);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
