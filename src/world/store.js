/* GENESIS MODULE — src/world/store.js — FOREVER STORAGE (docs/FOREVER-STORAGE.md, BATCH3-PLAN unit 13,
   BATCH3-GUARDRAILS J1/J2 "forever-guards"). Classic <script>, shared global scope.

   §1 IndexedDB, incremental — DB `genesis`, stores `worlds`/`meta`/`archive`. saveWorld(w) persists ONLY
   the changed world, async, debounced (~250ms trailing) — the 370KB-per-event full-U stringify (world.state's
   saveU) dies as the hot-path cost; per-turn cost becomes one world's delta. saveU(u) is left AS-IS at every
   one of its 37 existing call sites (G0: minimal diffs, no drive-by refactor sweep) — it keeps writing the
   synchronous localStorage blob (the spec's own "keep the LS original untouched for one release" belt-and-
   suspenders backup) and ADDITIONALLY fires the new debounced per-world IDB save for whichever world is
   active, off the synchronous path. Migration (boot, once): a `genesis-universe-v2` blob found in
   localStorage imports world-by-world into IDB, verifies read-back deep-equal, THEN writes a pointer stub
   (`{migrated:true, at}`) — the original LS blob is never deleted in this release. Quota safety net: every
   IDB write wrapped; on failure -> an in-app alert + an immediate export download offered (storeQuotaOffer),
   never a silent loss. storageEstimate() wraps navigator.storage.estimate() for the ⚙ Menu's storage meter
   (a dial, not a countdown — IDB quotas are GB-scale).

   §2 History lifecycle — the mechanical ledger stays whole forever (small; it IS the world's memory).
   dmlog PROSE past the last HOT_SESSIONS (default 3) moves to the `archive` IDB store, keyed by world id;
   the hot world object (and so the bridge's postState snapshot) stays lean. archiveOldSessions(w) is
   idempotent-additive: every eligible entry is SPLICED OUT of w.dmlog only AFTER archiveAppend's write
   is CONFIRMED successful (prune-after-success — a failed or unconfirmed write leaves w.dmlog intact,
   so the prose is never destroyed without a durable copy existing first), so a second successful call
   simply finds nothing left to move (idempotent by construction, not by a separate cursor flag). When
   IndexedDB is entirely absent there is no store to archive into, so the sweep is skipped outright and
   the prose stays hot. Chronicle reads archived prose on demand via archiveReadForWorld(worldId).

   §3 Game saves — LOCKED (Adam, 2026-07-02): IRONMAN ALWAYS, no checkpoint slots, no restore, ever (see
   docs/FOREVER-STORAGE.md §3; the retcon-negotiation protocol is DM-CHARTER frontier prose, out of this
   unit's code scope per BATCH-GUARDRAILS G0 — SKIPPED, listed in skippedProseSteps).

   Reads U/uid (world.state/engine.core) and toast (ui.chrome) at call-time. NULL-SAFE throughout: no
   IndexedDB in the runtime (a very old browser, or a jsdom harness with no IDB shim) degrades every
   function here to a flagged no-op — saveU's existing localStorage write is completely unaffected, so a
   missing IDB never loses a single write. */

/* ---------- constants ---------- */
const STORE_DB_NAME = "genesis";
const STORE_DB_VERSION = 1;
const STORE_DEBOUNCE_MS = 250;
const HOT_SESSIONS = 3;
const STORE_BACKUP_NUDGE_DAYS = 14;

/* ---------- IDB open (memoized single connection) ---------- */
let _storeDbPromise = null;
function storeAvailable(){ return typeof indexedDB !== "undefined" && indexedDB !== null; }
function storeOpenDb(){
  if(!storeAvailable()) return Promise.resolve(null);
  if(_storeDbPromise) return _storeDbPromise;
  _storeDbPromise = new Promise((resolve)=>{
    let req;
    try{ req = indexedDB.open(STORE_DB_NAME, STORE_DB_VERSION); }
    catch(e){ resolve(null); return; }
    req.onupgradeneeded = ()=>{
      const db = req.result;
      if(!db.objectStoreNames.contains("worlds")) db.createObjectStore("worlds", { keyPath:"id" });
      if(!db.objectStoreNames.contains("meta"))   db.createObjectStore("meta",   { keyPath:"key" });
      if(!db.objectStoreNames.contains("archive"))db.createObjectStore("archive",{ keyPath:"worldId" });
    };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror   = ()=>resolve(null);
  });
  return _storeDbPromise;
}
/* one object-store transaction, promisified; resolves {ok:false,reason} on any failure — never throws. */
function storeTx(storeName, mode, fn){
  return storeOpenDb().then(db=>{
    if(!db) return { ok:false, reason:"no-idb" };
    return new Promise(resolve=>{
      let tx;
      try{ tx = db.transaction(storeName, mode); }
      catch(e){ resolve({ ok:false, reason:"tx-open-failed", error:String(e&&e.message||e) }); return; }
      const store = tx.objectStore(storeName);
      let result;
      try{ result = fn(store); }
      catch(e){ resolve({ ok:false, reason:"op-threw", error:String(e&&e.message||e) }); return; }
      tx.oncomplete = ()=>resolve({ ok:true, result });
      tx.onerror = ()=>resolve({ ok:false, reason:"tx-error", error:String(tx.error&&tx.error.message||tx.error), isQuota: !!(tx.error && tx.error.name==="QuotaExceededError") });
      tx.onabort = ()=>resolve({ ok:false, reason:"tx-abort", error:String(tx.error&&tx.error.message||tx.error), isQuota: !!(tx.error && tx.error.name==="QuotaExceededError") });
    });
  });
}
function storeGet(storeName, key){
  return storeOpenDb().then(db=>{
    if(!db) return null;
    return new Promise(resolve=>{
      let tx, req;
      try{ tx = db.transaction(storeName, "readonly"); req = tx.objectStore(storeName).get(key); }
      catch(e){ resolve(null); return; }
      req.onsuccess = ()=>resolve(req.result===undefined?null:req.result);
      req.onerror = ()=>resolve(null);
    });
  });
}
function storeGetAll(storeName){
  return storeOpenDb().then(db=>{
    if(!db) return [];
    return new Promise(resolve=>{
      let tx, req;
      try{ tx = db.transaction(storeName, "readonly"); req = tx.objectStore(storeName).getAll(); }
      catch(e){ resolve([]); return; }
      req.onsuccess = ()=>resolve(req.result||[]);
      req.onerror = ()=>resolve([]);
    });
  });
}

/* ---------- §1b. saveWorld — debounced, async, changed-world-only ----------
   One pending timer PER WORLD ID, so saving world A never touches, delays, or rewrites world B (the
   spec's "changed-world-only" guarantee) — concurrent debounces for different ids are independent. */
const _storeSaveTimers = {};
function storeClearWorldTimer(id){ if(_storeSaveTimers[id]){ clearTimeout(_storeSaveTimers[id]); delete _storeSaveTimers[id]; } }
function saveWorld(w, opts){
  if(!w || !w.id) return Promise.resolve({ ok:false, reason:"no-world" });
  opts = opts || {};
  if(opts.immediate) return storeWriteWorldNow(w);
  return new Promise(resolve=>{
    storeClearWorldTimer(w.id);
    _storeSaveTimers[w.id] = setTimeout(()=>{
      delete _storeSaveTimers[w.id];
      storeWriteWorldNow(w).then(resolve);
    }, STORE_DEBOUNCE_MS);
  });
}
function storeWriteWorldNow(w){
  // snapshot NOW (JSON round-trip) so a later mutation to the live object can't rewrite an in-flight record
  let snap;
  try{ snap = JSON.parse(JSON.stringify(w)); }
  catch(e){ return Promise.resolve({ ok:false, reason:"serialize-failed", error:String(e&&e.message||e) }); }
  return storeTx("worlds", "readwrite", store=>store.put(snap)).then(r=>{
    // "no-idb" is a plain absence (old browser / a jsdom harness with no IDB shim) — a legitimate
    // degrade path, NOT a write failure. saveU's synchronous localStorage write is the durable copy in
    // that case, so this must stay silent (no alarming toast, no export-offer) — only a REAL write
    // failure against a PRESENT IndexedDB (quota or otherwise) is alarm-worthy.
    if(!r.ok && r.reason!=="no-idb") storeHandleWriteFailure(r, w);
    return r;
  });
}
/* Quota safety net (§1 "quota safety net"): a failed write AGAINST A PRESENT INDEXEDDB — whether the
   plain reason or the browser's QuotaExceededError specifically — surfaces an in-app alert + an
   immediate export offer. Never swallowed (mutation check J1: swallowing this path fails the harness). */
function storeHandleWriteFailure(r, w){
  if(typeof toast === "function")
    toast((r.isQuota ? "Storage is full — " : "Save failed — ") + "download a backup now to be safe.");
  if(typeof storeQuotaOffer === "function") storeQuotaOffer(w);
}
/* The export-on-failure surface itself: a thin wrapper around durability.js's exportWorldFile so this
   module doesn't duplicate the download glue. NULL-SAFE if durability.js hasn't loaded (load-order guard,
   though world.durability loads well before this file). */
function storeQuotaOffer(w){
  if(typeof exportWorldFile === "function"){ try{ exportWorldFile(); }catch(e){ /* best-effort only */ } }
  else if(typeof exportUniverseFile === "function"){ try{ exportUniverseFile(); }catch(e){} }
}

/* ---------- §1c. meta store (universe header / settings / reveal state) ---------- */
function saveMeta(key, value){
  return storeTx("meta", "readwrite", store=>store.put({ key, value })).then(r=>{
    if(!r.ok && r.reason!=="no-idb") storeHandleWriteFailure(r, null); // see storeWriteWorldNow's note: absence isn't failure
    return r;
  });
}
function loadMeta(key){ return storeGet("meta", key); }

/* ---------- §1d. storage meter ---------- */
function storageEstimate(){
  if(typeof navigator === "undefined" || !navigator.storage || typeof navigator.storage.estimate !== "function")
    return Promise.resolve({ ok:false, reason:"unsupported" });
  return navigator.storage.estimate().then(e=>({ ok:true, usage:e.usage||0, quota:e.quota||0,
    pct: e.quota ? Math.round((e.usage||0)/e.quota*1000)/10 : null }));
}

/* ---------- §1e. migration boot path: localStorage -> IDB, once ----------
   Idempotent: a universe already stamped {migrated:true} in meta is a no-op on re-entry (mirrors the
   codebase's simple-truthy-flag migration convention, e.g. U.plane). Verifies read-back deep-equal per
   world BEFORE trusting the import; a world that fails verification is left OUT of the "migrated" set so a
   later boot retries it — the LS original is the fallback in every case (never deleted this release). */
function migrateLStoIDB(){
  if(!storeAvailable()) return Promise.resolve({ ok:false, reason:"no-idb" });
  return loadMeta("lsMigration").then(existing=>{
    if(existing && existing.value && existing.value.migrated) return { ok:true, already:true };
    let raw;
    try{ raw = localStorage.getItem("genesis-universe-v2"); }
    catch(e){ return { ok:false, reason:"ls-read-failed" }; }
    if(!raw) return { ok:true, empty:true };
    let parsed;
    try{ parsed = JSON.parse(raw); }
    catch(e){ return { ok:false, reason:"ls-parse-failed" }; }
    const worlds = (parsed && parsed.worlds) || {};
    const ids = Object.keys(worlds);
    const verified = [];
    return Promise.all(ids.map(id=>
      storeWriteWorldNow(worlds[id]).then(w=>storeGet("worlds", id).then(readBack=>{
        const ok = w.ok && readBack && JSON.stringify(readBack) === JSON.stringify(worlds[id]);
        if(ok) verified.push(id);
        return ok;
      }))
    )).then(()=>{
      const allOk = verified.length === ids.length;
      const metaPatch = { migrated: allOk, at: Date.now(), verifiedCount: verified.length, totalCount: ids.length };
      return saveMeta("lsMigration", metaPatch).then(()=>({ ok:true, migrated:allOk, verified, total:ids.length }));
    });
  });
}

/* storeHydrateFromIDB — the READ-BACK half migrateLStoIDB never had (found live 2026-07-03: a lost/
   overwritten localStorage mirror made the app boot an EMPTY universe while every world sat intact in
   IDB with no in-app path back — the forever-store was write-only). Adopt into the live U any world
   present in the IDB `worlds` store but MISSING from U.worlds. Worlds present in BOTH keep the U copy:
   saveU writes localStorage synchronously on every event while the IDB save is debounced+async, so when
   both copies exist the U/LS one is never older. On a healthy boot this adopts nothing and costs one
   getAll. PURE toward the app surface: mutates U.worlds only, returns {ok,adopted[]} — the boot chain
   (genesis.html) owns saveU/re-render/toast so this file stays render-free. NULL-SAFE like every other
   function here (no IDB / no U -> flagged no-op). */
function storeHydrateFromIDB(){
  if(typeof U === "undefined" || !U || !U.worlds) return Promise.resolve({ ok:false, reason:"no-universe" });
  if(!storeAvailable()) return Promise.resolve({ ok:false, reason:"no-idb" });
  return storeGetAll("worlds").then(rows=>{
    const adopted = [];
    (rows||[]).forEach(w=>{
      if(w && w.id && !U.worlds[w.id]){ U.worlds[w.id] = w; adopted.push(w.id); }
    });
    return { ok:true, adopted };
  });
}

/* ---------- §2. history lifecycle: archive dmlog prose past HOT_SESSIONS ----------
   The ledger (w.ledger) is NEVER touched here — it's small and it IS the world's memory (recall/drift/
   reputation/chronicle all read it). Only w.dmlog (the narration-feed prose) moves. An entry's session
   bucket is read from its own `.session` field (stamped by pushDmLog, world.state — additive: existing
   dmlog readers ignore unknown keys) with a session-less legacy entry treated as session 0 (archived
   first, oldest-first, never blocking newer entries from staying hot). */
function archiveThreshold(w, hotSessions){
  const hs = hotSessions == null ? HOT_SESSIONS : hotSessions;
  const cur = (w && w.session) || 0;
  return cur - hs; // sessions <= this number are eligible for archive
}
function archiveOldSessions(w, hotSessions){
  if(!w) return Promise.resolve({ ok:false, reason:"no-world" });
  const log = Array.isArray(w.dmlog) ? w.dmlog : (w.dmlog = []);
  const threshold = archiveThreshold(w, hotSessions);
  if(threshold < 0) return Promise.resolve({ ok:true, moved:0 }); // fewer than HOT_SESSIONS sessions played yet — nothing eligible
  const toArchive = [], toKeep = [];
  log.forEach(e=>{ ((e && (e.session||0)) <= threshold ? toArchive : toKeep).push(e); });
  if(!toArchive.length) return Promise.resolve({ ok:true, moved:0 });
  // If IndexedDB is entirely absent, there is no store to archive into — leave the prose HOT rather
  // than pruning it against a write that cannot happen (the "missing IDB never loses a single write"
  // promise, line 30). Skip the archive attempt outright in that case.
  if(!storeAvailable()) return Promise.resolve({ ok:true, moved:0, reason:"no-idb" });
  // PRUNE-AFTER-SUCCESS: w.dmlog is only mutated once archiveAppend's write is CONFIRMED successful.
  // A failed/unconfirmed archive write must never remove the only copy of this prose from the live
  // world — that would silently destroy it (it was never durably written anywhere, and saveU would
  // then persist the pruned dmlog to localStorage, erasing it from the last remaining copy too).
  return archiveAppend(w.id, toArchive).then(r=>{
    if(r.ok===false) return { ok:false, moved:0, reason:r.reason };
    w.dmlog = toKeep;
    return { ok:true, moved: toArchive.length };
  });
}
/* append-only merge into the archive store's one record per world (never overwrites older archived
   prose — read-modify-write under the existing record). */
function archiveAppend(worldId, entries){
  if(!worldId || !entries || !entries.length) return Promise.resolve({ ok:true, moved:0 });
  return storeGet("archive", worldId).then(existing=>{
    const rec = existing || { worldId, entries: [] };
    rec.entries = (rec.entries||[]).concat(entries);
    return storeTx("archive", "readwrite", store=>store.put(rec)).then(r=>{
      if(!r.ok && r.reason!=="no-idb") storeHandleWriteFailure(r, null); // see storeWriteWorldNow's note: absence isn't failure
      return r;
    });
  });
}
/* Chronicle on-demand read: the archived prose for one world, oldest-first (same order dmlog kept them
   in before they moved). Returns [] (never throws/undefined) if nothing is archived or IDB is absent. */
function archiveReadForWorld(worldId){
  if(!worldId) return Promise.resolve([]);
  return storeGet("archive", worldId).then(rec=>(rec && rec.entries) || []);
}

/* ---------- §1f / backup nudge ----------
   "It's been 2 weeks — download a backup?" — a periodic, non-blocking toast. Tracked in the meta store
   (lastBackupNudge), NOT localStorage — this is cosmetic scheduling, not durability-critical, so an IDB
   miss just means the nudge fires again next session (never a hard failure). */
function storeMaybeBackupNudge(){
  return loadMeta("lastBackupNudge").then(rec=>{
    const last = (rec && rec.value) || 0;
    const days = (Date.now() - last) / 86400000;
    if(last && days < STORE_BACKUP_NUDGE_DAYS) return { ok:true, nudged:false };
    if(typeof toast === "function")
      toast(days >= STORE_BACKUP_NUDGE_DAYS || !last ? "It's been a while — ⚙ Menu → Export universe for a backup?" : "");
    return saveMeta("lastBackupNudge", Date.now()).then(()=>({ ok:true, nudged:true }));
  });
}
