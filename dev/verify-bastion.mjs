/* ============================================================================
   VERIFY: BASTION — the claim + vault (docs/CROWNING-BASTION.md §7.B1).
   ----------------------------------------------------------------------------
   Formalizes the emergent Bastion with exactly three things it lacks: a NAME,
   a CLAIM, and a VAULT that doesn't decay. One new event (bastion_claim); the
   ITEM-LEGACY "cached" lossState unpark (item_claimed{cached} flips from the
   refused "bastion-parked" stub into a real vault deposit); a vault-splice on
   withdraw (item_changed add); a prose panel + digest slice. No new module —
   this unit is small enough to live across existing sites (dm.js/render.js).
   Zero model calls anywhere (SPEED-DOCTRINE).

   REQUIRES ITEM-LEGACY BUILT (the vault emits item_claimed{cached}) — this
   harness asserts win.LEGACY_LOSS_STATES and the item_claimed case exist up
   front, failing loudly on a tree without ITEM-LEGACY (a build-order guard).

   Boot copied from dev/verify-item-legacy.mjs:37-50 (itself copied from
   dev/playtest-bug-probes.mjs:20-90) — manifest loadOrder eval, same STUBS
   list, a #bardoModal/#bardoBody DOM. EXPOSE adds nothing beyond ITEM-LEGACY's
   list (bastion symbols are function-declared or w-field, reachable without
   EXPOSE under jsdom).

   RED-FIRST (before any B1 engine edit, on an ITEM-LEGACY-built tree):
       ✗ bastion: 2 passed, 11 failed
   GREEN (after the build):
       ✓ bastion: 13 passed, 0 failed

   Run:  node dev/verify-bastion.mjs
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
const EXPOSE = ["STAGES", "SPECIES", "CLASSES", "BACKGROUNDS", "DM_EVENT_TYPES", "DM_EVENT_FIELDS", "LEGACY_LOSS_STATES"];
const expose = ";" + EXPOSE.map((n) => `try{window.${n}=${n};}catch(e){}`).join("");
const STUBS = ["renderWorld", "wakeReveal", "postState", "saveU", "toast", "showTab", "dieRoll",
  "streamDMText", "diceOverlay", "dmBridgeDown", "renderBardoPassage", "spawnSuccessorOnPlane"];

function boot() {
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
  return win;
}

// a minimal living world (dev/verify-item-legacy.mjs:53-72)
function seedWorld(win) {
  const w = {
    id: "w-probe", name: "Probe Hold",
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

// applyMutates (dev/verify-item-legacy.mjs:75-82) — flag AND a real before/after diff.
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

// seed a codex item record + inventory instance so the deposit path has a legacy-grade item to cache.
// Uses legacyEnsureRecord (the real ITEM-LEGACY entry point) so r.legacy.instSnapshot correctly
// captures the enchantment — a raw codexAdd would leave instSnapshot as a bare {name}.
function seedLegacyItem(win, w, name, codexId) {
  const inst = { id: "inst-" + codexId, name, ench: { bonus: 1 }, codexId };
  w.characters[0].sheet.inventory.push(inst);
  win.legacyEnsureRecord(w, inst, { at: w.currentNodeId, pcId: w.characters[0].id, pcName: w.characters[0].name });
  return inst;
}

// ---- B1: baseline — ITEM-LEGACY present ("cached" is a declared loss state) ------------------
{
  const win = boot(); const w = seedWorld(win);
  const L = win.LEGACY_LOSS_STATES;
  const hasLegacy = Array.isArray(L) && L.indexOf("cached") >= 0 && typeof win.applyEvent === "function";
  check("B1", hasLegacy, "ITEM-LEGACY not present on this tree — B1 requires it built first (build-order guard)");
  if (!hasLegacy) {
    console.log("FATAL: ITEM-LEGACY not found on this tree. B1 depends on it — build ITEM-LEGACY first.");
  }
}

// ---- B2: baseline — item_claimed{cached} WITHOUT a bastion --------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  seedLegacyItem(win, w, "Longsword", "item:probe-sword");
  const res = win.applyEvent(w, { type: "item_claimed", source: "detected",
    payload: { codexId: "item:probe-sword", by: { kind: "none" }, lossState: "cached" } });
  // Pre-unpark: {ok:false, reason:"bastion-parked"}. Post-unpark (no w.bastion): {ok:false, reason:"no-bastion"}.
  check("B2", res && res.ok === false && (res.reason === "no-bastion" || res.reason === "bastion-parked"),
    "res=" + JSON.stringify(res));
}

// ---- 3: DM_EVENT_TYPES has "bastion_claim"; FIELDS accept list matches §B1.1 --------------------
{
  const win = boot();
  const has = win.DM_EVENT_TYPES && win.DM_EVENT_TYPES.indexOf("bastion_claim") >= 0;
  const fields = win.DM_EVENT_FIELDS && win.DM_EVENT_FIELDS.bastion_claim;
  const acceptOk = fields && ["nodeId", "name", "note", "payGold"].every(k => fields.accept.indexOf(k) >= 0);
  check("3", has && acceptOk, "has=" + has + " fields=" + JSON.stringify(fields));
}

// ---- 4: applyMutates — bastion_claim by DEED (a closed front) -----------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.pressures = [{ kind: "internal", closed: false, clock: { size: 6, filled: 0 } },
                 { kind: "external", closed: true, clock: { size: 6, filled: 6 }, isDoom: true }];
  const goldBefore = w.characters[0].sheet.gold;
  const r = applyMutates(win, w, { type: "bastion_claim", source: "declared", payload: { nodeId: w.currentNodeId, name: "Probe Hall" } },
    () => ({ bastion: w.bastion, gold: w.characters[0].sheet.gold }));
  const goldAfter = w.characters[0].sheet.gold;
  check("4", r.pass && w.bastion && w.bastion.claimedBy === "deed" && goldAfter === goldBefore,
    "res=" + JSON.stringify(r.res) + " bastion=" + JSON.stringify(w.bastion) + " gold=" + goldBefore + "->" + goldAfter);
}

// ---- 5: claim by GOLD (no closed front, sh.gold>=price) -----------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.pressures = [{ kind: "internal", closed: false, clock: { size: 6, filled: 0 } },
                 { kind: "external", closed: false, clock: { size: 6, filled: 0 }, isDoom: true }];
  const goldBefore = w.characters[0].sheet.gold; // 1000, L1 price should be 250
  const price = (typeof win.bastionPrice === "function") ? win.bastionPrice(w) : null;
  const r = applyMutates(win, w, { type: "bastion_claim", source: "declared", payload: { nodeId: w.currentNodeId, name: "Probe Hall", payGold: true } },
    () => ({ bastion: w.bastion, gold: w.characters[0].sheet.gold }));
  const goldAfter = w.characters[0].sheet.gold;
  check("5", r.pass && w.bastion && w.bastion.claimedBy === "gold" && price != null && goldAfter === goldBefore - price,
    "price=" + price + " gold=" + goldBefore + "->" + goldAfter + " res=" + JSON.stringify(r.res));
}

// ---- 6: claim with neither deed nor enough gold -------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.pressures = [{ kind: "internal", closed: false, clock: { size: 6, filled: 0 } },
                 { kind: "external", closed: false, clock: { size: 6, filled: 0 }, isDoom: true }];
  w.characters[0].sheet.gold = 0;
  const res = win.applyEvent(w, { type: "bastion_claim", source: "declared", payload: { nodeId: w.currentNodeId, name: "Probe Hall" } });
  check("6", res && res.ok === false && /cannot-afford/.test(res.reason) && !w.bastion,
    "res=" + JSON.stringify(res));
}

// ---- 7: second claim refused (Q6 one per world) --------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.pressures = [{ kind: "internal", closed: false, clock: { size: 6, filled: 0 } },
                 { kind: "external", closed: true, clock: { size: 6, filled: 6 }, isDoom: true }];
  win.applyEvent(w, { type: "bastion_claim", source: "declared", payload: { nodeId: w.currentNodeId, name: "Probe Hall" } });
  const first = w.bastion;
  const res2 = win.applyEvent(w, { type: "bastion_claim", source: "declared", payload: { nodeId: w.currentNodeId, name: "Second Hall" } });
  check("7", res2 && res2.ok === false && res2.reason === "bastion-exists" && w.bastion === first,
    "res2=" + JSON.stringify(res2));
}

// ---- 8: claim during GS.combat refused ------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.pressures = [{ kind: "internal", closed: false, clock: { size: 6, filled: 0 } },
                 { kind: "external", closed: true, clock: { size: 6, filled: 6 }, isDoom: true }];
  win.GS.combat = { active: true };
  const res = win.applyEvent(w, { type: "bastion_claim", source: "declared", payload: { nodeId: w.currentNodeId, name: "Probe Hall" } });
  check("8", res && res.ok === false && res.reason === "unsafe-combat" && !w.bastion,
    "res=" + JSON.stringify(res));
}

// ---- 9: deposit — item_claimed{cached} with a bastion ---------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.pressures = [{ kind: "internal", closed: false, clock: { size: 6, filled: 0 } },
                 { kind: "external", closed: true, clock: { size: 6, filled: 6 }, isDoom: true }];
  win.applyEvent(w, { type: "bastion_claim", source: "declared", payload: { nodeId: w.currentNodeId, name: "Probe Hall" } });
  seedLegacyItem(win, w, "Longsword", "item:probe-sword");
  const r = applyMutates(win, w, { type: "item_claimed", source: "detected",
    payload: { codexId: "item:probe-sword", by: { kind: "none" }, lossState: "cached" } },
    () => ({ vault: (w.bastion && w.bastion.vault) || [], legacy: win.codexGet(w, "item:probe-sword").legacy }));
  const rec = win.codexGet(w, "item:probe-sword");
  const vault9 = (w.bastion && w.bastion.vault) || [];
  check("9", r.pass && rec.legacy.lossState === "cached" && rec.legacy.claimant.kind === "bastion"
    && vault9.indexOf("item:probe-sword") >= 0,
    "res=" + JSON.stringify(r.res) + " legacy=" + JSON.stringify(rec.legacy) + " vault=" + JSON.stringify(vault9));
}

// ---- 10: withdraw — item_changed add restores from the vault --------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.pressures = [{ kind: "internal", closed: false, clock: { size: 6, filled: 0 } },
                 { kind: "external", closed: true, clock: { size: 6, filled: 6 }, isDoom: true }];
  win.applyEvent(w, { type: "bastion_claim", source: "declared", payload: { nodeId: w.currentNodeId, name: "Probe Hall" } });
  const inst = seedLegacyItem(win, w, "Longsword", "item:probe-sword");
  // remove from inventory + cache it
  w.characters[0].sheet.inventory = w.characters[0].sheet.inventory.filter(it => it.id !== inst.id);
  win.applyEvent(w, { type: "item_claimed", source: "detected",
    payload: { codexId: "item:probe-sword", by: { kind: "none" }, lossState: "cached" } });
  const vaultBefore = ((w.bastion && w.bastion.vault) || []).slice();
  const res = win.applyEvent(w, { type: "item_changed", source: "declared",
    payload: { add: [{ name: "Longsword", codexId: "item:probe-sword" }] } });
  const added = res && res.added && res.added[0];
  const rec = win.codexGet(w, "item:probe-sword");
  const vaultAfter = (w.bastion && w.bastion.vault) || [];
  check("10", res && res.ok === true && added && added.ench && added.ench.bonus === 1
    && vaultBefore.indexOf("item:probe-sword") >= 0 && vaultAfter.indexOf("item:probe-sword") < 0
    && rec.legacy.lossState === "held",
    "vaultBefore=" + JSON.stringify(vaultBefore) + " vaultAfter=" + JSON.stringify(vaultAfter) + " added=" + JSON.stringify(added) + " legacy=" + JSON.stringify(rec.legacy));
}

// ---- 11: scavenge never touches a cached item ------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.pressures = [{ kind: "internal", closed: false, clock: { size: 6, filled: 0 } },
                 { kind: "external", closed: true, clock: { size: 6, filled: 6 }, isDoom: true }];
  win.applyEvent(w, { type: "bastion_claim", source: "declared", payload: { nodeId: w.currentNodeId, name: "Probe Hall" } });
  const swordInst = seedLegacyItem(win, w, "Longsword", "item:probe-sword");
  // depositing to the vault removes the instance from the PC's hand (bastionDepositPrompt's real
  // flow) — else it would still be sitting in inventory when killCharacter snapshots the corpse.
  w.characters[0].sheet.inventory = w.characters[0].sheet.inventory.filter(it => it.id !== swordInst.id);
  win.applyEvent(w, { type: "item_claimed", source: "detected",
    payload: { codexId: "item:probe-sword", by: { kind: "none" }, lossState: "cached" } });
  // seed a SEPARATE carried legacy item that dies with the PC, then scavenge.
  const carried = seedLegacyItem(win, w, "Dagger of Woe", "item:probe-dagger");
  win.eval("rollDie=function(n){return n===6?6:1;}"); // scavenge miss on d6(6), context roll picks index 0
  const dead = w.characters[0];
  win.killCharacter(dead.id);
  win.corpseScavengeResolve(w, dead);
  const cachedRec = win.codexGet(w, "item:probe-sword");
  const vault11 = (w.bastion && w.bastion.vault) || [];
  check("11", cachedRec.legacy.lossState === "cached" && vault11.indexOf("item:probe-sword") >= 0,
    "cachedRec.legacy=" + JSON.stringify(cachedRec.legacy) + " vault=" + JSON.stringify(vault11));
}

// ---- 12: codex location record minted ---------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.pressures = [{ kind: "internal", closed: false, clock: { size: 6, filled: 0 } },
                 { kind: "external", closed: true, clock: { size: 6, filled: 6 }, isDoom: true }];
  win.applyEvent(w, { type: "bastion_claim", source: "declared", payload: { nodeId: w.currentNodeId, name: "Probe Hall" } });
  const locId = "location:bastion-" + win.slug("Probe Hall");
  const rec = win.codexGet(w, locId);
  check("12", rec && rec.kind === "location" && rec.origin === "bastion", "rec=" + JSON.stringify(rec));
}

// ---- 13: digest slice — null before claim, populated after (2 checks folded into one id) --------------
{
  const win = boot(); const w = seedWorld(win);
  const before = win.dmDigest();
  const beforeOk = before && before.bastion === null;
  w.pressures = [{ kind: "internal", closed: false, clock: { size: 6, filled: 0 } },
                 { kind: "external", closed: true, clock: { size: 6, filled: 6 }, isDoom: true }];
  win.applyEvent(w, { type: "bastion_claim", source: "declared", payload: { nodeId: w.currentNodeId, name: "Probe Hall" } });
  const after = win.dmDigest();
  const afterOk = after && after.bastion && after.bastion.name === "Probe Hall" && Array.isArray(after.bastion.vault);
  check("13", beforeOk && afterOk,
    "before.bastion=" + JSON.stringify(before && before.bastion) + " after.bastion=" + JSON.stringify(after && after.bastion));
}

// ---- report -----------------------------------------------------------------------------------------
const passed = checks.filter(c => c.pass).length;
const failed = checks.length - passed;
console.log((failed === 0 ? "✓" : "✗") + " bastion: " + passed + " passed, " + failed + " failed");
for (const c of checks) if (!c.pass) console.log("  FAIL " + c.id + ": " + c.detail);
process.exit(failed === 0 ? 0 : 1);
