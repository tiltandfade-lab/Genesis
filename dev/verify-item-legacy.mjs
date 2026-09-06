/* ============================================================================
   VERIFY: ITEM-LEGACY — the item lifecycle contract (docs/ITEM-LEGACY.md).
   ----------------------------------------------------------------------------
   Death → corpse → scavenge → recovery custody, tracked on the codex item
   record (r.legacy). One new event (item_claimed) + item_changed takenBy
   widening. No model call anywhere. RED-FIRST: this harness ships with the
   branch's first commit, BEFORE any engine edit, and must fail exactly:
       ✗ item-legacy: 3 passed, 21 failed   (§8.1)
   After the build (§8.2): ✓ item-legacy: 24 passed, 0 failed.

   Boot copied from dev/playtest-bug-probes.mjs:26–46 (manifest loadOrder eval,
   same STUBS list PLUS win.prompt + a #bardoModal/#bardoBody DOM so
   killCharacter→openBardo runs headless). EXPOSE adds LEGACY_LOSS_STATES (a
   top-level const does NOT auto-attach to window under jsdom the way a function
   declaration does — §8 note).

   Run:  node dev/verify-item-legacy.mjs
   ============================================================================ */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const srcText = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{},souls:[]}; var SEED=null;`;
// HQ2-8e: STAGES/SPECIES/CLASSES/BACKGROUNDS retired (zero other references in this file);
// DM_EVENT_TYPES/DM_EVENT_FIELDS/LEGACY_LOSS_STATES KEPT — all three have a real read below.
const EXPOSE = ["DM_EVENT_TYPES", "DM_EVENT_FIELDS", "LEGACY_LOSS_STATES"];
const expose = ";" + EXPOSE.map((n) => `try{window.${n}=${n};}catch(e){}`).join("");
const STUBS = ["renderWorld", "wakeReveal", "postState", "saveU", "toast", "showTab", "dieRoll",
  "streamDMText", "diceOverlay", "dmBridgeDown", "renderBardoPassage", "spawnSuccessorOnPlane"];

// §9c — the harness boot-once pattern. Classic <script> modules share global scope, so
// re-declaring every function 22× per scenario (~113 loadOrder modules + tables.js, ~16s wall)
// is pure waste: function redeclaration is idempotent under jsdom. Boot the JSDOM + eval the
// module set ONCE (bootOnce), then reset only the MUTABLE state a scenario can observe —
// U (the world registry) and GS (the transient-state container, src/state.js) — between
// scenarios via resetState. GS0 is a pristine JSON snapshot taken immediately after boot,
// before any scenario runs, and restored (a JSON round-trip: GS holds no functions) at the
// top of every scenario. If a future scenario is found to leak state some OTHER way (e.g.
// through a module-scope cache neither U nor GS reaches), give that one scenario its own
// bootOnce() call instead of reusing the shared window — correctness beats the speedup.
let _win = null, _GS0 = null;
function bootOnce() {
  if (_win) return _win;
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div>` +
    `<div id="bardoModal"><div id="bardoBody"></div></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText + "\n" + expose);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  win.prompt = () => "Probe Hold";
  for (const n of STUBS) { try { win.eval(`typeof ${n}==="function"&&(${n}=function(){});`); } catch (_) {} }
  win.GS.dm = { turnId: null, pending: false, rollReq: null, ask: null, telemetry: [] };
  _GS0 = JSON.stringify(win.GS);
  _win = win;
  return win;
}
function boot() {
  const win = bootOnce();
  win.U = { worlds: {}, activeWorldId: null, revealed: {}, souls: [] };
  win.SEED = null;
  win.GS = JSON.parse(_GS0);
  win.document.getElementById("bardoModal").classList.remove("show");
  win.document.getElementById("bardoBody").innerHTML = "";
  win.document.getElementById("worldView").innerHTML = "";
  return win;
}

// a minimal living world (playtest-bug-probes.mjs:49–68)
function seedWorld(win) {
  const w = {
    id: "w-probe", name: "Probe Hold",
    seed: { master: { name: "Probe Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
      taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" }, faction: { name: "The Probe Circle" } },
    characters: [{ id: "c1", status: "living", name: "Probe PC", headline: "a test", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Soldier", level: 1, xp: 0,
        hp: 9, hpCur: 9, ac: 14, tempHp: 0, profBonus: 2, scores: { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
        mods: { str: 1, dex: 1, con: 1, int: 0, wis: 0, cha: 0 }, saveProfs: [], skillProfs: [], conditions: [], inventory: [] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name: "The Ironwood Circle", dominant: true, agenda: "spread", method: "force", tags: [], clock: { size: 6, filled: 0 } }],
    pressures: [], revealed: {}, dmlog: [],
  };
  const origin = win.addNode(w, "Probe Hold", "Setting");
  w.currentNodeId = origin; win.seeNode(w, origin);
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  if (typeof win.ensureResources === "function") win.ensureResources(w.characters[0].sheet);
  return w;
}

// applyMutates (playtest-bug-probes.mjs:74–81) — flag AND a real before/after diff.
function applyMutates(win, w, e, snap) {
  const before = JSON.stringify(snap());
  const res = win.applyEvent(w, e);
  const after = JSON.stringify(snap());
  const okFlag = !!(res && res.ok === true && !res.untracked);
  const changed = before !== after;
  return { res, okFlag, changed, pass: okFlag && changed, before, after };
}

const checks = [];
function check(id, pass, detail) { checks.push({ id, pass: !!pass, detail: detail || "" }); }
// RED-FIRST safety: before the build these symbols don't exist — call through a guard so a
// missing function fails the check (not throws), yielding the clean 3-passed/21-failed baseline.
function scavenge(win, w, dead) { return (typeof win.corpseScavengeResolve === "function") ? win.corpseScavengeResolve(w, dead) : null; }

// Seed a PC carrying an enchanted, codex-storied longsword + mint its record.
// Stub rollDie→1 so the death path is deterministic: rollCorpseContext picks pool[0] = "sealed"
// (decayDays 120, SCAVENGE_TEETH 0 → the bardo scavenge never fires), and the bardo gap stays small
// — the corpse stays fresh + on-corpse through openBardo, isolating the death STAMP under test.
function seedHeirloom(win, w) {
  win.eval("rollDie=function(){return 1;}");
  const inst = { id: "inst-hl", name: "Longsword", ench: { bonus: 1 }, codexId: "item:probe-heirloom" };
  w.characters[0].sheet.inventory.push(inst);
  win.codexAdd(w, { id: "item:probe-heirloom", kind: "item", name: "Longsword",
    provenance: "rolled", fields: { object: "Longsword" }, status: { known: true } });
  return inst;
}
// force the clock past the corpse's decayDays so corpseStatus → "gone"
function ageCorpse(win, w, dead, extraDays) {
  const D = (dead.corpse && dead.corpse.context && dead.corpse.context.decayDays) || 7;
  w.clock.day = (dead.fellWhen ? dead.fellWhen.day : w.clock.day) + D + (extraDays || 0);
}

// ---- R1: baseline corpseStatus fresh→gone ladder unchanged (2 checks) --------
{
  const win = boot(); const w = seedWorld(win);
  const dead = w.characters[0];
  dead.status = "fallen"; dead.fellWhere = "Probe Hold"; dead.fellWhen = { day: 1, min: 480 };
  dead.corpse = { context: { tag: "wild", label: "wild", decayDays: 30 }, items: [], gold: 0, looted: false };
  const freshNow = win.corpseStatus(w, dead) === "fresh";
  w.clock.day = 1 + 30 + 1;
  const goneLater = win.corpseStatus(w, dead) === "gone";
  check("R1a", freshNow, `fresh at day 0 → ${win.corpseStatus(w, dead)}`);
  check("R1b", goneLater, `gone past decayDays → ${win.corpseStatus(w, dead)}`);
}

// ---- R3: baseline mundane-only corpse claim still hauls -----------------------
{
  const win = boot(); const w = seedWorld(win);
  const dead = w.characters[0];
  dead.status = "fallen"; dead.fellWhere = "Probe Hold"; dead.fellWhen = { day: 1, min: 480 };
  dead.corpse = { context: { tag: "wild", label: "wild", decayDays: 30 },
    items: [{ id: "m1", name: "Torch", conditions: [] }, { id: "m2", name: "Rope", conditions: [] }], gold: 5, looted: false };
  const taker = { id: "c2", status: "living", name: "Heir", sheet: { inventory: [], gold: 0 } };
  w.characters.push(taker);
  const before = taker.sheet.inventory.length;
  const haul = win.claimCorpse(w, dead, taker);
  check("R3", !!haul && taker.sheet.inventory.length === before + 2 && taker.sheet.gold === 5,
    `taker inventory ${before}→${taker.sheet.inventory.length}, gold=${taker.sheet.gold}`);
}

// ---- 4: LEGACY_LOSS_STATES length 10, has "transferred" + "cached" -----------
{
  const win = boot();
  const L = win.LEGACY_LOSS_STATES;
  check("4", Array.isArray(L) && L.length === 10 && L.indexOf("transferred") >= 0 && L.indexOf("cached") >= 0,
    `LEGACY_LOSS_STATES=${JSON.stringify(L)}`);
}

// ---- 5–6: legacyGrade predicate ----------------------------------------------
{
  const win = boot();
  const g = win.legacyGrade;
  const enchOK = typeof g === "function" && g({ name: "Longsword", ench: { bonus: 1 } }) === true;
  const potionNo = typeof g === "function" && g({ name: "Potion of Healing", ench: {} }) === false;   // consumable
  const stackNo = typeof g === "function" && g({ name: "Arrow", ench: { bonus: 1 }, qty: 20 }) === false;
  check("5", enchOK, `legacyGrade(ench non-consumable)=${enchOK}`);
  check("6", potionNo && stackNo, `potion→${potionNo}, stack qty20→${stackNo}`);
}

// ---- 7: P-DEATH — death stamps on-corpse (mutation on record JSON) -----------
{
  const win = boot(); const w = seedWorld(win);
  seedHeirloom(win, w);
  const preLen = w.characters[0].sheet.inventory.length;
  const before = JSON.stringify(win.codexGet(w, "item:probe-heirloom"));
  win.killCharacter("c1");
  const rec = win.codexGet(w, "item:probe-heirloom");
  const after = JSON.stringify(rec);
  const onCorpse = rec && rec.legacy && rec.legacy.lossState === "on-corpse";
  const dead = w.characters.find((x) => x.id === "c1");
  const onBody = dead && dead.corpse && dead.corpse.items.length === preLen;
  check("7", onCorpse && before !== after && onBody,
    `lossState=${rec && rec.legacy && rec.legacy.lossState}, recMoved=${before !== after}, corpse.items=${dead && dead.corpse && dead.corpse.items.length}/${preLen}`);
}

// ---- 8: death minted a recovery hook -----------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  seedHeirloom(win, w); win.killCharacter("c1");
  const rec = win.codexGet(w, "item:probe-heirloom");
  const hid = rec && rec.legacy && rec.legacy.recoveryHookId;
  const hook = hid ? win.codexGet(w, hid) : null;
  const linked = hook && (hook.links || []).some((l) => l.rel === "part-of" && l.to === "item:probe-heirloom");
  check("8", !!hook && hook.kind === "thread" && linked,
    `hookId=${hid}, kind=${hook && hook.kind}, linked=${linked}`);
}

// ---- 9: death stamped decayRef.charId ----------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  seedHeirloom(win, w); win.killCharacter("c1");
  const rec = win.codexGet(w, "item:probe-heirloom");
  check("9", rec && rec.legacy && rec.legacy.decayRef && rec.legacy.decayRef.charId === "c1",
    `decayRef=${JSON.stringify(rec && rec.legacy && rec.legacy.decayRef)}`);
}

// ---- 10: P-FIDELITY — claimCorpse preserves ench + codexId -------------------
{
  const win = boot(); const w = seedWorld(win);
  seedHeirloom(win, w); win.killCharacter("c1");
  const dead = w.characters.find((x) => x.id === "c1");
  const taker = { id: "c2", status: "living", name: "Heir", sheet: { inventory: [], gold: 0 } };
  w.characters.push(taker);
  win.claimCorpse(w, dead, taker);
  const hauled = taker.sheet.inventory.find((it) => it.codexId === "item:probe-heirloom");
  check("10", !!hauled && hauled.ench && hauled.ench.bonus === 1 && hauled.codexId === "item:probe-heirloom",
    `hauled=${JSON.stringify(hauled)}`);
}

// ---- 11: claim emitted a detected re-claim → held, claimant=taker ------------
// ---- 12: claim resolved the hook ---------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  seedHeirloom(win, w); win.killCharacter("c1");
  const dead = w.characters.find((x) => x.id === "c1");
  const taker = { id: "c2", status: "living", name: "Heir", sheet: { inventory: [], gold: 0 } };
  w.characters.push(taker);
  const rec0 = win.codexGet(w, "item:probe-heirloom");
  const preLoss = rec0.legacy && rec0.legacy.lossState;
  const hid = rec0.legacy && rec0.legacy.recoveryHookId;
  win.claimCorpse(w, dead, taker);
  const rec = win.codexGet(w, "item:probe-heirloom");
  const L11 = rec.legacy || {};
  check("11", L11.lossState === "held" && L11.claimant && L11.claimant.ref === taker.id && preLoss === "on-corpse",
    `lossState ${preLoss}→${L11.lossState}, claimant.ref=${L11.claimant && L11.claimant.ref}`);
  const hook = hid ? win.codexGet(w, hid) : null;
  check("12", hook && hook.status && hook.status.condition === "resolved",
    `hook.condition=${hook && hook.status && hook.status.condition}`);
}

// ---- 13: scavenge (den, rollDie→1): items 2→1, victim claimed-creature -------
function seedScavengeCorpse(win, w, opts) {
  opts = opts || {};
  const dead = w.characters[0];
  dead.status = "fallen"; dead.fellWhere = "Probe Hold"; dead.fellWhen = { day: 1, min: 480 };
  const enchInst = { id: "inst-hl", name: "Longsword", ench: { bonus: 1 }, codexId: "item:probe-heirloom" };
  // codexAdd does not persist a `legacy` field — assign r.legacy onto the returned record directly
  // (the engine's own writer is legacyEnsureRecord; the harness seeds pre-existing lifecycle state).
  const rec = win.codexAdd(w, { id: "item:probe-heirloom", kind: "item", name: "Longsword", provenance: "rolled",
    fields: { object: "Longsword" }, status: { known: true } });
  rec.legacy = { origin: { how: "start", ref: null }, claimant: { kind: "corpse", ref: "c1", name: "Probe PC" },
    lastSeen: { nodeId: w.currentNodeId, day: 1 }, lossState: "on-corpse", recoveryHookId: opts.hookId || null,
    factionInterest: opts.factionInterest || null, decayRef: { kind: "corpse", charId: "c1" },
    instSnapshot: { name: "Longsword", ench: { bonus: 1 } } };
  const items = [enchInst];
  if (!opts.enchOnly) items.push({ id: "m2", name: "Rope", conditions: [] });
  dead.corpse = { context: { tag: opts.tag || "den", label: opts.tag || "den", decayDays: opts.decayDays || 2 },
    items, gold: opts.gold || 0, looted: false };
  return dead;
}
{
  const win = boot(); const w = seedWorld(win);
  win.eval("rollDie=function(){return 1;}");
  const dead = seedScavengeCorpse(win, w, { tag: "den", decayDays: 2 });
  w.clock.day = 2;   // e = 1 day of 2 → disturbed
  const before = dead.corpse.items.length;
  const r = scavenge(win, w, dead);
  const rec = win.codexGet(w, "item:probe-heirloom");
  const L13 = rec.legacy || {};
  check("13", dead.corpse.items.length === before - 1 && L13.lossState === "claimed-creature" &&
    L13.claimant && L13.claimant.ref == null && r && r.taken === "item:probe-heirloom",
    `items ${before}→${dead.corpse.items.length}, lossState=${L13.lossState}, ref=${L13.claimant && L13.claimant.ref}, r=${JSON.stringify(r)}`);
}

// ---- 14: scavenge is once-only -----------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  win.eval("rollDie=function(){return 1;}");
  const dead = seedScavengeCorpse(win, w, { tag: "den", decayDays: 2 });
  w.clock.day = 2;
  const r1 = scavenge(win, w, dead);
  const snap = JSON.stringify(dead.corpse);
  const r2 = scavenge(win, w, dead);
  // the first call MUST have taken (rollDie→1 hit): scav stamped + a victim moved. The second is the
  // once-only proof. Guarding on r1 keeps this RED before corpseScavengeResolve exists.
  check("14", r1 && r1.taken === "item:probe-heirloom" && r2 === null && JSON.stringify(dead.corpse) === snap,
    `first=${JSON.stringify(r1)}, second call=${JSON.stringify(r2)}, corpse unchanged=${JSON.stringify(dead.corpse) === snap}`);
}

// ---- 15: scavenge miss (rollDie→6): scav.rolled true, taken null, items intact
{
  const win = boot(); const w = seedWorld(win);
  win.eval("rollDie=function(){return 6;}");
  const dead = seedScavengeCorpse(win, w, { tag: "den", decayDays: 2, enchOnly: true });
  w.clock.day = 2;
  const before = dead.corpse.items.length;
  scavenge(win, w, dead);
  check("15", dead.corpse.scav && dead.corpse.scav.rolled === true && dead.corpse.scav.taken === null &&
    dead.corpse.items.length === before,
    `scav=${JSON.stringify(dead.corpse.scav)}, items=${dead.corpse.items.length}/${before}`);
}

// ---- 16: factionInterest precedence (den, rollDie→1) → claimed-faction -------
{
  const win = boot(); const w = seedWorld(win);
  win.eval("rollDie=function(){return 1;}");
  const dead = seedScavengeCorpse(win, w, { tag: "den", decayDays: 2, enchOnly: true, factionInterest: "The Ironwood Circle" });
  w.clock.day = 2;
  scavenge(win, w, dead);
  const rec = win.codexGet(w, "item:probe-heirloom");
  const L16 = rec.legacy || {};
  check("16", L16.lossState === "claimed-faction",
    `lossState=${L16.lossState}, claimant=${JSON.stringify(L16.claimant)}`);
}

// ---- 17: gone-corpse sweep → remaining legacy item "unknown", hook still open
{
  const win = boot(); const w = seedWorld(win);
  win.eval("rollDie=function(){return 6;}");   // miss on the scavenge pick, gone sweep still runs
  const dead = seedScavengeCorpse(win, w, { tag: "wild", decayDays: 30, enchOnly: true, hookId: "thread:hook-17" });
  win.codexAdd(w, { id: "thread:hook-17", kind: "thread", provenance: "rolled", name: "hook", status: { known: false, soft: true } });
  win.codexLink(w, "thread:hook-17", "part-of", "item:probe-heirloom");
  ageCorpse(win, w, dead, 1);   // → gone
  scavenge(win, w, dead);
  const rec = win.codexGet(w, "item:probe-heirloom");
  const hook = win.codexGet(w, "thread:hook-17");
  const L17 = rec.legacy || {};
  check("17", L17.lossState === "unknown" && hook && hook.status.condition !== "resolved",
    `lossState=${L17.lossState}, hook.condition=${hook && hook.status && hook.status.condition}`);
}

function seedRecord(win, w, lossState, claimant, extra) {
  const rec = win.codexAdd(w, { id: "item:probe-heirloom", kind: "item", name: "Longsword", provenance: "rolled",
    fields: { object: "Longsword" }, status: { known: true } });
  rec.legacy = Object.assign({ origin: { how: "start", ref: null }, claimant,
    lastSeen: { nodeId: w.currentNodeId, day: 1 }, lossState, recoveryHookId: null,
    factionInterest: null, decayRef: null, instSnapshot: { name: "Longsword", ench: { bonus: 1 } } }, extra || {});
  return rec;
}

// ---- 18: declared item_claimed{claimed-npc} → ok && record JSON moved --------
{
  const win = boot(); const w = seedWorld(win);
  seedRecord(win, w, "held", { kind: "pc", ref: "c1", name: "Probe PC" });
  const m = applyMutates(win, w,
    { type: "item_claimed", source: "declared",
      payload: { codexId: "item:probe-heirloom", by: { kind: "npc", ref: null, name: "A Thief" }, lossState: "claimed-npc" } },
    () => win.codexGet(w, "item:probe-heirloom"));
  check("18", m.pass, `res=${JSON.stringify(m.res)}, moved=${m.changed}`);
}

// ---- 19: idempotent re-claim → {ok:true,unchanged:true}, ledger static -------
{
  const win = boot(); const w = seedWorld(win);
  seedRecord(win, w, "claimed-npc", { kind: "npc", ref: "npc:thief", name: "Thief" });
  const before = win.ledgerOf(w).length;
  const res = win.applyEvent(w, { type: "item_claimed", source: "declared",
    payload: { codexId: "item:probe-heirloom", by: { kind: "npc", ref: "npc:thief", name: "Thief" }, lossState: "claimed-npc" } });
  const after = win.ledgerOf(w).length;
  check("19", res && res.ok === true && res.unchanged === true && after === before,
    `res=${JSON.stringify(res)}, ledger ${before}→${after}`);
}

// ---- 20: item_claimed{cached} WITHOUT a bastion → refused no-bastion ---------
// CROWNING-BASTION.md §7.B1 unparked this seam (dev/verify-bastion.mjs owns the caching-WITH-a-
// bastion path in full). Before B1: {ok:false,reason:"bastion-parked"} (the seam didn't exist yet).
// After B1: a world with no w.bastion still refuses — but for a REAL reason ("no-bastion"), because
// the transition is live now, just gated on a bastion existing. This is the one sanctioned edit to
// this harness (docs/CROWNING-BASTION.md §7.B1.10) — B1 legitimately changes this behavior.
{
  const win = boot(); const w = seedWorld(win);
  seedRecord(win, w, "held", { kind: "pc", ref: "c1", name: "Probe PC" });
  const before = JSON.stringify(win.codexGet(w, "item:probe-heirloom"));
  const res = win.applyEvent(w, { type: "item_claimed", source: "declared",
    payload: { codexId: "item:probe-heirloom", by: { kind: "none" }, lossState: "cached" } });
  const after = JSON.stringify(win.codexGet(w, "item:probe-heirloom"));
  check("20", res && res.ok === false && res.reason === "no-bastion" && before === after,
    `res=${JSON.stringify(res)}, untouched=${before === after}`);
}

// ---- 21: item_changed removeIds + takenBy faction / no takenBy → dropped -----
{
  const win = boot(); const w = seedWorld(win);
  const sh = w.characters[0].sheet;
  sh.inventory.push({ id: "inst-hl", name: "Longsword", ench: { bonus: 1 }, codexId: "item:probe-heirloom" });
  seedRecord(win, w, "held", { kind: "pc", ref: "c1", name: "Probe PC" });
  win.applyEvent(w, { type: "item_changed", source: "declared",
    payload: { removeIds: ["inst-hl"], takenBy: { kind: "faction", name: "The Ironwood Circle" } } });
  const recA = win.codexGet(w, "item:probe-heirloom");
  const faction = (recA.legacy || {}).lossState === "claimed-faction";
  // re-add then remove without takenBy → dropped
  sh.inventory.push({ id: "inst-hl2", name: "Longsword", ench: { bonus: 1 }, codexId: "item:probe-heirloom" });
  win.applyEvent(w, { type: "item_changed", source: "declared", payload: { removeIds: ["inst-hl2"] } });
  const recB = win.codexGet(w, "item:probe-heirloom");
  const dropped = (recB.legacy || {}).lossState === "dropped";
  check("21", faction && dropped, `withTakenBy→${(recA.legacy||{}).lossState}, withoutTakenBy→${(recB.legacy||{}).lossState}`);
}

// ---- 22: overlay restore on item_changed add from snapshot -------------------
{
  const win = boot(); const w = seedWorld(win);
  seedRecord(win, w, "claimed-npc", { kind: "npc", ref: "npc:thief", name: "Thief" });
  const res = win.applyEvent(w, { type: "item_changed", source: "declared",
    payload: { add: [{ name: "Longsword", codexId: "item:probe-heirloom" }] } });
  const added = res && res.added && res.added.find((it) => it.codexId === "item:probe-heirloom");
  const rec = win.codexGet(w, "item:probe-heirloom");
  const L22 = rec.legacy || {};
  check("22", !!added && added.ench && added.ench.bonus === 1 && L22.lossState === "held",
    `added=${JSON.stringify(added)}, lossState=${L22.lossState}`);
}

// ---- 23: digest itemLegacy null when all held; length 1 after a claim --------
{
  const win = boot(); const w = seedWorld(win);
  seedRecord(win, w, "held", { kind: "pc", ref: "c1", name: "Probe PC" });
  const dgHeld = win.dmDigest();
  const nullWhenHeld = dgHeld && dgHeld.itemLegacy == null;
  win.applyEvent(w, { type: "item_claimed", source: "declared",
    payload: { codexId: "item:probe-heirloom", by: { kind: "npc", ref: null, name: "Thief" }, lossState: "claimed-npc" } });
  const dg = win.dmDigest();
  const slice = dg && dg.itemLegacy;
  const one = Array.isArray(slice) && slice.length === 1 &&
    slice[0].codexId === "item:probe-heirloom" && slice[0].lossState === "claimed-npc";
  check("23", nullWhenHeld && one, `nullWhenHeld=${nullWhenHeld}, slice=${JSON.stringify(slice)}`);
}

// ---- 24: registry — item_claimed type + FIELDS accept list -------------------
{
  const win = boot();
  const inType = win.DM_EVENT_TYPES.indexOf("item_claimed") >= 0;
  const spec = win.DM_EVENT_FIELDS.item_claimed;
  const wanted = ["codexId", "by", "lossState", "at", "note", "factionInterest"];
  const accepts = spec && wanted.every((k) => spec.accept.indexOf(k) >= 0);
  const changedWiden = win.DM_EVENT_FIELDS.item_changed.accept.indexOf("takenBy") >= 0;
  check("24", inType && accepts && changedWiden,
    `inType=${inType}, accept=${spec && JSON.stringify(spec.accept)}, takenBy=${changedWiden}`);
}

// ---- 25: HQ2-9 9a — legacyStamp maintains codexOf(w)._legacyAway in lockstep -
{
  const win = boot(); const w = seedWorld(win);
  seedRecord(win, w, "held", { kind: "pc", ref: "c1", name: "Probe PC" });
  win.applyEvent(w, { type: "item_claimed", source: "declared",
    payload: { codexId: "item:probe-heirloom", by: { kind: "npc", ref: null, name: "A Thief" }, lossState: "claimed-npc" } });
  const C = win.codexOf(w);
  const awayAfterClaim = C._legacyAway && typeof C._legacyAway.has === "function" && C._legacyAway.has("item:probe-heirloom");
  const digestAfterClaim = win.legacyDigest(w);
  const inDigest = Array.isArray(digestAfterClaim) && digestAfterClaim.some((r) => r.codexId === "item:probe-heirloom");
  // back to held → the index entry AND the digest row must both drop.
  win.applyEvent(w, { type: "item_claimed", source: "declared",
    payload: { codexId: "item:probe-heirloom", by: { kind: "pc", ref: "c1", name: "Probe PC" }, lossState: "held" } });
  const awayAfterHeld = !!(C._legacyAway && typeof C._legacyAway.has === "function" && C._legacyAway.has("item:probe-heirloom"));
  const digestAfterHeld = win.legacyDigest(w);
  check("25", awayAfterClaim && inDigest && !awayAfterHeld && digestAfterHeld == null,
    `awayAfterClaim=${awayAfterClaim}, inDigest=${inDigest}, awayAfterHeld=${awayAfterHeld}, digestAfterHeld=${JSON.stringify(digestAfterHeld)}`);
}

// ---- 26: HQ2-9 9a — old-save fallback (_legacyAway absent) self-heals -------
{
  const win = boot(); const w = seedWorld(win);
  seedRecord(win, w, "claimed-npc", { kind: "npc", ref: "npc:thief", name: "Thief" });
  const C = win.codexOf(w);
  delete C._legacyAway;   // simulate an old save with no index yet
  const dg = win.legacyDigest(w);
  const foundViaFallback = Array.isArray(dg) && dg.some((r) => r.codexId === "item:probe-heirloom");
  const repopulated = C._legacyAway && typeof C._legacyAway.has === "function" && C._legacyAway.has("item:probe-heirloom");
  check("26", foundViaFallback && repopulated,
    `foundViaFallback=${foundViaFallback}, repopulated=${repopulated}`);
}

// ---- 27: HQ2-9 9b — bastion._vaultNames cache tracks deposit/withdraw -------
{
  const win = boot(); const w = seedWorld(win);
  w.bastion = { name: "Probe Bastion", nodeId: w.currentNodeId, foundedDay: 1, vault: [] };
  seedRecord(win, w, "held", { kind: "pc", ref: "c1", name: "Probe PC" });
  const depRes = win.applyEvent(w, { type: "item_claimed", source: "declared",
    payload: { codexId: "item:probe-heirloom", by: { kind: "none" }, lossState: "cached" } });
  const dgAfterDeposit = win.dmDigest();
  const namesAfterDeposit = dgAfterDeposit.bastion && dgAfterDeposit.bastion.vault;
  const depositOK = depRes && depRes.ok === true && Array.isArray(namesAfterDeposit) &&
    namesAfterDeposit.indexOf("Longsword") >= 0 &&
    JSON.stringify(w.bastion._vaultNames) === JSON.stringify(namesAfterDeposit);
  // withdraw: item_changed add[] pulls it back out of the vault (dm.js:2333-2336).
  win.applyEvent(w, { type: "item_changed", source: "declared",
    payload: { add: [{ name: "Longsword", codexId: "item:probe-heirloom" }] } });
  const dgAfterWithdraw = win.dmDigest();
  const namesAfterWithdraw = dgAfterWithdraw.bastion && dgAfterWithdraw.bastion.vault;
  const withdrawOK = Array.isArray(namesAfterWithdraw) && namesAfterWithdraw.indexOf("Longsword") < 0 &&
    JSON.stringify(w.bastion._vaultNames) === JSON.stringify(namesAfterWithdraw);
  check("27", depositOK && withdrawOK,
    `namesAfterDeposit=${JSON.stringify(namesAfterDeposit)}, namesAfterWithdraw=${JSON.stringify(namesAfterWithdraw)}`);
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
const passed = checks.filter((c) => c.pass).length;
const failed = checks.length - passed;
console.log("\n  VERIFY: ITEM-LEGACY (docs/ITEM-LEGACY.md)\n");
for (const c of checks) {
  console.log(`  [${c.pass ? "✓" : "✗"}] ${String(c.id).padEnd(4)} ${c.detail}`);
}
const mark = failed === 0 ? "✓" : "✗";
console.log(`\n${mark} item-legacy: ${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
