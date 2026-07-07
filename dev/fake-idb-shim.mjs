/* dev/fake-idb-shim.mjs — a MINIMAL in-memory IndexedDB surface for the forever-guards harnesses
   (dev/verify-storage.mjs, dev/verify-migrations.mjs). jsdom ships no `indexedDB` global and this repo
   takes no new npm dependencies (BATCH-GUARDRAILS G0) — BATCH3-GUARDRAILS J2 explicitly rules "if
   fake-indexeddb isn't available as a dependency, SHIM the minimal IDB surface in the harness", so this
   file IS that shim, factored out so both harnesses share one implementation.

   Covers exactly the surface src/world/store.js actually calls: indexedDB.open(name, version) ->
   IDBOpenDBRequest (onupgradeneeded/onsuccess/onerror), db.transaction(storeNames, mode) ->
   IDBTransaction (oncomplete/onerror/onabort), db.createObjectStore(name, {keyPath}), and on a store:
   put/get/getAll (each returning an IDBRequest with onsuccess/onerror). Every callback fires via
   queueMicrotask (never synchronously) so store.js's real Promise-wrapping logic is exercised the same
   way it runs against a real browser. A put() failure inside a transaction marks that transaction failed,
   so it fires onerror/onabort instead of oncomplete — matching real IndexedDB's "an unhandled request
   error aborts its transaction" behavior, which src/world/store.js's storeTx relies on. */

export function installFakeIndexedDB(win, opts) {
  opts = opts || {};
  const data = opts.seedData || { worlds: new Map(), meta: new Map(), archive: new Map() };
  let failNextWrite = false; // test hook: simulate a QuotaExceededError on the NEXT write op only

  function makeRequest() { return { onsuccess: null, onerror: null, result: undefined, error: null }; }
  function fireSuccess(req, result) {
    req.result = result;
    queueMicrotask(() => { if (typeof req.onsuccess === "function") req.onsuccess({ target: req }); });
  }
  function fireError(req, err) {
    req.error = err;
    queueMicrotask(() => { if (typeof req.onerror === "function") req.onerror({ target: req }); });
  }

  function makeStore(storeName, tx) {
    const map = data[storeName];
    return {
      put(record) {
        const req = makeRequest();
        queueMicrotask(() => {
          if (failNextWrite) {
            failNextWrite = false;
            const err = new Error("QuotaExceededError (simulated)");
            err.name = "QuotaExceededError";
            tx._failed = true; tx._error = err;
            fireError(req, err);
            return;
          }
          const key = storeName === "meta" ? record.key : (storeName === "archive" ? record.worldId : record.id);
          map.set(key, JSON.parse(JSON.stringify(record)));
          fireSuccess(req, key);
        });
        return req;
      },
      get(key) {
        const req = makeRequest();
        queueMicrotask(() => fireSuccess(req, map.has(key) ? JSON.parse(JSON.stringify(map.get(key))) : undefined));
        return req;
      },
      getAll() {
        const req = makeRequest();
        queueMicrotask(() => fireSuccess(req, Array.from(map.values()).map(v => JSON.parse(JSON.stringify(v)))));
        return req;
      },
      delete(key) {
        // HOTFIX-QUEUE-2026-07-06 H1: storeDeleteWorld needs store.delete(id) — deleting a
        // missing key succeeds (matches real IndexedDB's delete semantics).
        const req = makeRequest();
        queueMicrotask(() => { map.delete(key); fireSuccess(req, undefined); });
        return req;
      },
    };
  }

  function makeTransaction(storeNames) {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames];
    const tx = { oncomplete: null, onerror: null, onabort: null, error: null, _failed: false, _error: null, _settled: false };
    tx.objectStore = (name) => {
      if (!names.includes(name)) throw new Error("store not in transaction scope: " + name);
      return makeStore(name, tx);
    };
    // Settle a couple microtask hops out so any put()/get() the caller issued synchronously after
    // objectStore() has had its own microtask(s) resolve first.
    queueMicrotask(() => queueMicrotask(() => queueMicrotask(() => {
      if (tx._settled) return;
      tx._settled = true;
      if (tx._failed) {
        tx.error = tx._error;
        if (typeof tx.onerror === "function") tx.onerror({ target: tx });
        if (typeof tx.onabort === "function") tx.onabort({ target: tx });
      } else if (typeof tx.oncomplete === "function") tx.oncomplete({ target: tx });
    })));
    return tx;
  }

  const db = {
    objectStoreNames: { contains: (n) => Object.prototype.hasOwnProperty.call(data, n) },
    createObjectStore(name) { if (!data[name]) data[name] = new Map(); return makeStore(name, { _failed: false }); },
    transaction(storeNames) { return makeTransaction(storeNames); },
  };

  win.indexedDB = {
    open(name, version) {
      const req = makeRequest();
      req.result = db; // real IndexedDB sets request.result to the (in-progress) db before onupgradeneeded fires
      queueMicrotask(() => {
        if (typeof req.onupgradeneeded === "function") req.onupgradeneeded({ target: req, oldVersion: 0, newVersion: version });
        fireSuccess(req, db);
      });
      return req;
    },
  };

  return {
    data,
    forceNextWriteToFail() { failNextWrite = true; },
  };
}
