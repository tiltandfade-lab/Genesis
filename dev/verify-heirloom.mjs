/* ============================================================================
   VERIFY: HEIRLOOM — the New Game+ heirloom echo (docs/CROWNING-BASTION.md §7.B2).
   ----------------------------------------------------------------------------
   The seam where the ending (§3, the Crowning) and the vault (§4, the Bastion)
   are one system (§5.1): when a NEW world is rolled and a CROWNED world with a
   non-empty bastion vault exists on the plane, character creation gains one
   low-probability origin echo drawing ONE item from a crowned bastion's vault
   into the new PC's opening inventory, with its full r.legacy trail. The item
   MOVES (removed from the source vault, item_claimed both sides) — the plane
   holds one of each thing. No new module — a small additive step at the
   creation-bind seam (src/creator/sheet.js: heirloomEcho/heirloomSourceWorlds/
   heirloomPickWorld + the cgBind hook).

   REQUIRES C2 + B1 BUILT (crownWorld/w.crowned + bastion_claim/item_claimed
   {cached}) — this harness seeds a crowned world + bastion vault directly
   (state, not the full ritual UI) and asserts the build-order guard up front.

   Boot copied from dev/verify-bastion.mjs:29-82 (itself copied from
   dev/verify-item-legacy.mjs, itself copied from dev/playtest-bug-probes.mjs:
   20-90) — manifest loadOrder eval, same STUBS list, a #bardoModal/#bardoBody
   DOM. EXPOSE adds HEIRLOOM_ECHO_CHANCE (a top-level const does not auto-attach
   to window under jsdom — same lesson as ITEM-LEGACY §8).

   RED-FIRST (before B2's cgBind edit + heirloomEcho, on a C2+B1-built tree):
       ✗ heirloom: 2 passed, 6 failed
   GREEN (after the build):
       ✓ heirloom: 8 passed, 0 failed

   Run:  node dev/verify-heirloom.mjs
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
const EXPOSE = ["STAGES", "SPECIES", "CLASSES", "BACKGROUNDS", "DM_EVENT_TYPES", "DM_EVENT_FIELDS",
  "LEGACY_LOSS_STATES", "HEIRLOOM_ECHO_CHANCE"];
const expose = ";" + EXPOSE.map((n) => `try{window.${n}=${n};}catch(e){}`).join("");
const STUBS = ["renderWorld", "wakeReveal", "postState", "saveU", "toast", "showTab", "dieRoll",
  "streamDMText", "diceOverlay", "dmBridgeDown", "renderBardoPassage", "spawnSuccessorOnPlane",
  "wakeIntoWorld", "rollCharacter", "logEvent"];

function boot() {
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div>` +
    `<div id="bardoModal"><div id="bardoBody"></div></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText + "\n" + expose);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  win.prompt = () => null; // headless: no UI-less pick — defaults to sources[0] (§B2.3)
  for (const n of STUBS) { try { win.eval(`typeof ${n}==="function"&&(${n}=function(){});`); } catch (_) {} }
  win.GS.dm = { turnId: null, pending: false, rollReq: null, ask: null, telemetry: [] };
  return win;
}

// a minimal living world (dev/verify-bastion.mjs:63-82)
function seedWorld(win, id) {
  const w = {
    id: id || "w-probe", name: (id || "Probe Hold"),
    seed: { master: { name: "Probe Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
      taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" }, faction: { name: "The Probe Circle" } },
    characters: [{ id: "c1", status: "living", name: "Probe PC", headline: "a test", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Soldier", level: 1, xp: 0,
        hp: 9, hpCur: 9, ac: 14, tempHp: 0, gold: 1000, profBonus: 2, scores: { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
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

// seed a codex item record + inventory instance via legacyEnsureRecord (dev/verify-bastion.mjs:96-102)
// so r.legacy.instSnapshot correctly captures the enchantment.
function seedLegacyItem(win, w, name, codexId) {
  const inst = { id: "inst-" + codexId, name, ench: { bonus: 1 }, codexId };
  w.characters[0].sheet.inventory.push(inst);
  win.legacyEnsureRecord(w, inst, { at: w.currentNodeId, pcId: w.characters[0].id, pcName: w.characters[0].name });
  return inst;
}

// give a world a claimed bastion + a cached vault item in one shot (state, not the full ritual UI —
// B2 depends on the SHAPE of w.crowned/w.bastion, not on driving crownWorld()/openCrowning() here).
function seedCrownedBastionWorld(win, id, itemName, codexId) {
  const w = seedWorld(win, id);
  w.pressures = [{ kind: "internal", closed: false, clock: { size: 6, filled: 0 } },
                 { kind: "external", closed: true, clock: { size: 6, filled: 6 }, isDoom: true }];
  win.applyEvent(w, { type: "bastion_claim", source: "declared", payload: { nodeId: w.currentNodeId, name: id + " Hall" } });
  seedLegacyItem(win, w, itemName, codexId);
  w.characters[0].sheet.inventory = w.characters[0].sheet.inventory.filter(it => it.codexId !== codexId);
  win.applyEvent(w, { type: "item_claimed", source: "detected",
    payload: { codexId, by: { kind: "none" }, lossState: "cached" } });
  w.crowned = { day: 30, by: { pcId: w.characters[0].id, name: w.characters[0].name, epithet: "the Ended" },
    legend: { band: "grounded", text: "a golden age" }, testament: [], succession: null, how: "defeated" };
  return w;
}

function newPC(win, w) {
  const c = { id: "c-new", status: "living", name: "New PC", headline: "a fresh start", pronouns: "they",
    sheet: { inventory: [] } };
  w.characters.push(c);
  return c;
}

const checks = [];
function check(id, pass, detail) { checks.push({ id, pass: !!pass, detail: detail || "" }); }

// guarded call — pre-build, heirloomEcho is undefined; checks 4-8 must FAIL loudly, not crash.
function callEcho(win, w, c) {
  return (typeof win.heirloomEcho === "function") ? win.heirloomEcho(w, c) : undefined;
}

// ---- B1: baseline — C2+B1 present (crownWorld/w.crowned shape + bastion_claim/item_claimed{cached}) ----
{
  const win = boot();
  const hasDeps = typeof win.crownWorld === "function" && typeof win.applyEvent === "function"
    && win.DM_EVENT_TYPES && win.DM_EVENT_TYPES.indexOf("bastion_claim") >= 0
    && win.LEGACY_LOSS_STATES && win.LEGACY_LOSS_STATES.indexOf("cached") >= 0;
  check("B1", hasDeps, "C2/B1 not present on this tree — B2 requires both built first (build-order guard)");
  if (!hasDeps) console.log("FATAL: C2/B1 not found on this tree. B2 depends on both — build them first.");
}

// ---- B2: baseline — no crowned world on the plane → heirloomEcho absent/no-op, ordinary inventory ----
{
  const win = boot();
  const w = seedWorld(win, "w-fresh");
  const c = newPC(win, w);
  const before = (c.sheet.inventory || []).length;
  if (typeof win.heirloomEcho === "function") win.heirloomEcho(w, c);
  const after = (c.sheet.inventory || []).length;
  check("B2", after === before, "before=" + before + " after=" + after);
}

// ---- 3: HEIRLOOM_ECHO_CHANCE defined; heirloomSourceWorlds returns only crowned+vault worlds --------
{
  const win = boot();
  seedCrownedBastionWorld(win, "w-crowned", "Longsword", "item:heirloom-sword");
  // an un-crowned world with a full vault (bastion claimed, item cached) — must NOT be a source
  const wUncrowned = seedWorld(win, "w-uncrowned");
  wUncrowned.pressures = [{ kind: "internal", closed: false, clock: { size: 6, filled: 0 } },
                          { kind: "external", closed: true, clock: { size: 6, filled: 6 }, isDoom: true }];
  win.applyEvent(wUncrowned, { type: "bastion_claim", source: "declared", payload: { nodeId: wUncrowned.currentNodeId, name: "Uncrowned Hall" } });
  seedLegacyItem(win, wUncrowned, "Dagger", "item:uncrowned-dagger");
  wUncrowned.characters[0].sheet.inventory = [];
  win.applyEvent(wUncrowned, { type: "item_claimed", source: "detected",
    payload: { codexId: "item:uncrowned-dagger", by: { kind: "none" }, lossState: "cached" } });
  const chanceOk = typeof win.HEIRLOOM_ECHO_CHANCE === "number" && win.HEIRLOOM_ECHO_CHANCE > 0;
  const sources = (typeof win.heirloomSourceWorlds === "function") ? win.heirloomSourceWorlds("w-new") : null;
  const ids = (sources || []).map(s => s.id);
  check("3", chanceOk && Array.isArray(sources) && ids.indexOf("w-crowned") >= 0 && ids.indexOf("w-uncrowned") < 0,
    "chance=" + win.HEIRLOOM_ECHO_CHANCE + " ids=" + JSON.stringify(ids));
}

// ---- 4: echo fires (rollDie stubbed → always 1): new PC gains ONE item, ench from source snapshot --
{
  const win = boot();
  const wSrc = seedCrownedBastionWorld(win, "w-crowned-4", "Flametongue", "item:heirloom-4");
  const wNew = seedWorld(win, "w-new-4");
  const c = newPC(win, wNew);
  win.eval("rollDie=function(n){return 1;}"); // both the gate roll and the item-index roll hit 1
  const before = (c.sheet.inventory || []).length;
  callEcho(win, wNew, c);
  const after = c.sheet.inventory || [];
  const added = after[after.length - 1];
  check("4", after.length === before + 1 && added && added.codexId === "item:heirloom-4"
    && added.ench && added.ench.bonus === 1,
    "before=" + before + " after=" + JSON.stringify(after));
}

// ---- 5: the item MOVED — source vault length −1, that codexId no longer present ----------------------
{
  const win = boot();
  const wSrc = seedCrownedBastionWorld(win, "w-crowned-5", "Moonblade", "item:heirloom-5");
  const wNew = seedWorld(win, "w-new-5");
  const c = newPC(win, wNew);
  const vaultBefore = wSrc.bastion.vault.slice();
  win.eval("rollDie=function(n){return 1;}");
  callEcho(win, wNew, c);
  const vaultAfter = wSrc.bastion.vault;
  check("5", vaultBefore.indexOf("item:heirloom-5") >= 0 && vaultAfter.indexOf("item:heirloom-5") < 0
    && vaultAfter.length === vaultBefore.length - 1,
    "vaultBefore=" + JSON.stringify(vaultBefore) + " vaultAfter=" + JSON.stringify(vaultAfter));
}

// ---- 6: heirloom thread minted in the NEW world (kind:"thread", fromWorldId===src.id) ----------------
{
  const win = boot();
  const wSrc = seedCrownedBastionWorld(win, "w-crowned-6", "Sunspear", "item:heirloom-6");
  const wNew = seedWorld(win, "w-new-6");
  const c = newPC(win, wNew);
  win.eval("rollDie=function(n){return 1;}");
  callEcho(win, wNew, c);
  const recs = Object.values(win.codexOf(wNew).records || {});
  const thread = recs.find(r => r.kind === "thread" && r.fields && r.fields.fromWorldId === wSrc.id);
  check("6", !!thread, "recs=" + JSON.stringify(recs.map(r => ({ id: r.id, kind: r.kind, fields: r.fields }))));
}

// ---- 7: cross-world item_claimed fired on the source (lossState moved off "cached") -------------------
{
  const win = boot();
  const wSrc = seedCrownedBastionWorld(win, "w-crowned-7", "Ashblade", "item:heirloom-7");
  const wNew = seedWorld(win, "w-new-7");
  const c = newPC(win, wNew);
  const before = win.codexGet(wSrc, "item:heirloom-7").legacy.lossState;
  win.eval("rollDie=function(n){return 1;}");
  callEcho(win, wNew, c);
  const rec = win.codexGet(wSrc, "item:heirloom-7");
  check("7", before === "cached" && rec.legacy.lossState === "held" && rec.legacy.claimant.kind === "pc",
    "before=" + before + " after=" + JSON.stringify(rec.legacy));
}

// ---- 8: echo does NOT fire when rollDie misses the gate (→2): inventory unchanged, vault intact -------
{
  const win = boot();
  const wSrc = seedCrownedBastionWorld(win, "w-crowned-8", "Frostbrand", "item:heirloom-8");
  const wNew = seedWorld(win, "w-new-8");
  const c = newPC(win, wNew);
  const vaultBefore = wSrc.bastion.vault.slice();
  const invBefore = (c.sheet.inventory || []).length;
  win.eval("rollDie=function(n){return 2;}"); // misses the 1-in-N gate
  const res = callEcho(win, wNew, c);
  check("8", res === null && (c.sheet.inventory || []).length === invBefore
    && wSrc.bastion.vault.length === vaultBefore.length,
    "res=" + JSON.stringify(res) + " inv=" + invBefore + "->" + (c.sheet.inventory || []).length);
}

// ---- 9: HQ2-7 — the destination-side twin: codexGet(w,codexId) resolves in the NEW world, kind
// "item", legacy.origin.how==="heirloom" (pre-fix: null until death — the two-sided bug) -------------
{
  const win = boot();
  const wSrc = seedCrownedBastionWorld(win, "w-crowned-9", "Wolfsbane", "item:heirloom-9");
  const wNew = seedWorld(win, "w-new-9");
  const c = newPC(win, wNew);
  win.eval("rollDie=function(n){return 1;}");
  const res = callEcho(win, wNew, c);
  const codexId = res && res.codexId;
  const destRec = codexId ? win.codexGet(wNew, codexId) : null;
  check("9", !!destRec && destRec.kind === "item" && !!destRec.legacy && !!destRec.legacy.origin
    && destRec.legacy.origin.how === "heirloom",
    "destRec=" + JSON.stringify(destRec));
}

// ---- 10: death-provenance guard — killing the new-world PC must NOT lazily re-mint the destination
// record's origin as "start" (corpseLegacyStamp -> legacyEnsureRecord only defaults when r.legacy is
// absent; the HQ2-7 fix pre-empts that by minting r.legacy at echo time) ------------------------------
{
  const win = boot();
  const wSrc = seedCrownedBastionWorld(win, "w-crowned-10", "Ember Rod", "item:heirloom-10");
  const wNew = seedWorld(win, "w-new-10");
  const c = newPC(win, wNew);
  win.eval("rollDie=function(n){return 1;}");
  const res = callEcho(win, wNew, c);
  const codexId = res && res.codexId;
  win.killCharacter(c.id); // U.activeWorldId is wNew (the last-seeded world) — killCharacter reads activeWorld()
  const destRec = codexId ? win.codexGet(wNew, codexId) : null;
  check("10", !!destRec && !!destRec.legacy && !!destRec.legacy.origin && destRec.legacy.origin.how === "heirloom",
    "post-death destRec.legacy.origin=" + JSON.stringify(destRec && destRec.legacy && destRec.legacy.origin));
}

// ---- 11: the source-side item_claimed call's `by` self-documents the destination world (worldId) —
// a spy on applyEvent captures the payload the call site sends (dm.js's item_claimed handler is
// explicitly out of scope for HQ2-7 — it whitelists claimant to kind/ref/name and would drop an extra
// key, so this checks the CALL SITE's contribution, not persisted state) -------------------------------
{
  const win = boot();
  const wSrc = seedCrownedBastionWorld(win, "w-crowned-11", "Owlbear Cloak", "item:heirloom-11");
  const wNew = seedWorld(win, "w-new-11");
  const c = newPC(win, wNew);
  const calls = [];
  const origApplyEvent = win.applyEvent;
  win.applyEvent = function (w, ev) { calls.push({ w: w, ev: ev }); return origApplyEvent(w, ev); };
  win.eval("rollDie=function(n){return 1;}");
  callEcho(win, wNew, c);
  const claimCall = calls.find(x => x.w === wSrc && x.ev.type === "item_claimed"
    && x.ev.payload && x.ev.payload.codexId === "item:heirloom-11");
  check("11", !!claimCall && !!claimCall.ev.payload.by && claimCall.ev.payload.by.worldId === wNew.id,
    "claimCall=" + JSON.stringify(claimCall && claimCall.ev));
}

// ---- report -----------------------------------------------------------------------------------------
const passed = checks.filter(c => c.pass).length;
const failed = checks.length - passed;
console.log((failed === 0 ? "✓" : "✗") + " heirloom: " + passed + " passed, " + failed + " failed");
for (const c of checks) if (!c.pass) console.log("  FAIL " + c.id + ": " + c.detail);
process.exit(failed === 0 ? 0 : 1);
