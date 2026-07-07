/* ============================================================================
   VERIFY-CROWNING — CROWNING §7.C1 acceptance: the Doom-front flag + crown eligibility.
   docs/CROWNING-BASTION.md §7.C1.6. RED-first, mutation-asserting (applyMutates guard, the same
   ROOT-A discipline as dev/playtest-bug-probes.mjs).

   Run:  node dev/verify-crowning.mjs
   (jsdom resolved per CLAUDE.md "headless test"; JSDOM_HOME env override supported.)
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
// engine.crowning's top-level consts (CROWN_HOW_VERBS) do not auto-attach to window under jsdom —
// same lesson as ITEM-LEGACY §8. function-declared doomFront/crownEligible/rollStartingState/
// applyEvent/charHistoryBody ARE reachable as win.<name> without EXPOSE.
const EXPOSE = ["STAGES", "SPECIES", "CLASSES", "BACKGROUNDS", "DM_EVENT_TYPES", "DM_EVENT_FIELDS", "dmFoldPayload", "CROWN_HOW_VERBS"];
const expose = ";" + EXPOSE.map((n) => `try{window.${n}=${n};}catch(e){}`).join("");
const STUBS = ["renderWorld", "wakeReveal", "postState", "saveU", "toast", "showTab", "dieRoll", "streamDMText", "diceOverlay", "dmBridgeDown"];

function boot() {
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div>
     <div id="bardoModal"><div id="bardoBody"></div></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  const win = dom.window;
  win.eval(harness + "\n" + srcText + "\n" + expose);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  for (const n of STUBS) { try { win.eval(`typeof ${n}==="function"&&(${n}=function(){});`); } catch (_) {} }
  win.GS.dm = { turnId: null, pending: false, rollReq: null, ask: null, telemetry: [] };
  return win;
}

// a minimal living world for the applyEvent-based probes (copied shape from playtest-bug-probes.mjs)
function seedWorld(win, opts) {
  opts = opts || {};
  const level = opts.level || 1;
  const w = {
    id: "w-crown", name: "Crown Test Hold",
    seed: { master: { name: "Crown Test Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
      taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" }, faction: { name: "The Crown Circle" } },
    characters: [{ id: "c1", status: "living", name: "Crown PC", headline: "a test", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Soldier", level: level, xp: 0,
        hp: 90, hpCur: 90, ac: 14, tempHp: 0, profBonus: 4, scores: { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
        mods: { str: 1, dex: 1, con: 1, int: 0, wis: 0, cha: 0 }, saveProfs: [], skillProfs: [], conditions: [], inventory: [] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name: "The Ironwood Circle", dominant: true, agenda: "spread", method: "force", tags: [], clock: { size: 6, filled: 0 } }],
    pressures: [], revealed: {}, dmlog: [],
  };
  const origin = win.addNode(w, "Crown Test Hold", "Setting");
  w.currentNodeId = origin; win.seeNode(w, origin);
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  if (typeof win.ensureResources === "function") win.ensureResources(w.characters[0].sheet);
  return w;
}

// ROOT-A mutation guard (dev/playtest-bug-probes.mjs pattern): ok-flag AND a real before/after
// state change in the slice the event claims to mutate. A silent no-op fails here.
function applyMutates(win, w, e, snap) {
  const before = JSON.stringify(snap());
  const res = win.applyEvent(w, e);
  const after = JSON.stringify(snap());
  const okFlag = !!(res && res.ok === true && !res.untracked);
  const changed = before !== after;
  return { res, okFlag, changed, pass: okFlag && changed, before, after };
}

const results = [];
const check = (id, title, pass, detail) => results.push({ id, title, pass, detail });

// ---------------------------------------------------------------------------
// B1 — baseline: rollStartingState still produces w.pressures.length===2, one internal + one external
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win);
  win.rollStartingState(w);
  const kinds = w.pressures.map(p => p.kind).sort();
  const ok = w.pressures.length === 2 && kinds[0] === "external" && kinds[1] === "internal";
  check("B1", "baseline: rollStartingState produces one internal + one external front", ok,
    `pressures=${JSON.stringify(kinds)}`);
}

// ---------------------------------------------------------------------------
// B2 — baseline: crownEligible never throws on a bare {} world
// ---------------------------------------------------------------------------
{
  const win = boot();
  let threw = false, v = null;
  try { v = win.crownEligible({}); } catch (e) { threw = true; }
  const ok = !threw && v && v.eligible === false;
  check("B2", "baseline: crownEligible never throws on a bare {} world -> eligible:false", ok,
    `threw=${threw} eligible=${v && v.eligible}`);
}

// ---------------------------------------------------------------------------
// 3 — after rollStartingState, exactly one front has isDoom===true AND it is the external front
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win);
  win.rollStartingState(w);
  const doomFronts = w.pressures.filter(p => p.isDoom === true);
  const ok = doomFronts.length === 1 && doomFronts[0].kind === "external";
  check("3", "exactly one front has isDoom===true, and it is the external front", ok,
    `doomFronts=${doomFronts.length} kind=${doomFronts[0] && doomFronts[0].kind}`);
}

// ---------------------------------------------------------------------------
// 4 — CROWN_HOW_VERBS length 3, includes "defeated"
// ---------------------------------------------------------------------------
{
  const win = boot();
  const verbs = win.CROWN_HOW_VERBS;
  const ok = Array.isArray(verbs) && verbs.length === 3 && verbs.indexOf("defeated") >= 0;
  check("4", 'CROWN_HOW_VERBS length 3, includes "defeated"', ok, `verbs=${JSON.stringify(verbs)}`);
}

// ---------------------------------------------------------------------------
// 5 — doomFront(w) returns the external front; null on a world with no external
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win);
  win.rollStartingState(w);
  const externalFront = w.pressures.find(p => p.kind === "external");
  const df = win.doomFront(w);
  const identityOk = df === externalFront;
  const wNoExternal = seedWorld(win, {});
  wNoExternal.pressures = [{ kind: "internal", clock: { size: 6, filled: 0 } }];
  const dfNull = win.doomFront(wNoExternal);
  const ok = identityOk && dfNull === null;
  check("5", "doomFront(w) returns the external front (identity); null with no external front", ok,
    `identityMatch=${identityOk} nullCase=${dfNull === null}`);
}

// ---------------------------------------------------------------------------
// 6 — not eligible when Doom open (seed L10 PC, Doom NOT closed)
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 10 });
  win.rollStartingState(w);
  const v = win.crownEligible(w);
  const ok = v.eligible === false && v.reasons.doomClosed === false;
  check("6", "not eligible when Doom front is open (L10 PC, Doom not closed)", ok,
    `eligible=${v.eligible} doomClosed=${v.reasons.doomClosed}`);
}

// ---------------------------------------------------------------------------
// 7 — eligible when Doom closed AND L10 AND alive -> eligible moves false->true
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 10 });
  win.rollStartingState(w);
  const before = win.crownEligible(w).eligible;
  const doom = win.doomFront(w);
  doom.closed = true;
  const after = win.crownEligible(w).eligible;
  const ok = before === false && after === true;
  check("7", "eligible when Doom closed AND at ceiling AND alive (eligible moves false->true)", ok,
    `before=${before} after=${after}`);
}

// ---------------------------------------------------------------------------
// 8 — not eligible when Doom closed but PC below ceiling
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 3 });
  win.rollStartingState(w);
  win.doomFront(w).closed = true;
  const v = win.crownEligible(w);
  const ok = v.eligible === false && v.reasons.atCeiling === false;
  check("8", "not eligible when Doom closed but PC below LEVEL_CEILING", ok,
    `eligible=${v.eligible} atCeiling=${v.reasons.atCeiling}`);
}

// ---------------------------------------------------------------------------
// 9 — applyMutates: clock_fired on the Doom front's clockId sets w.sundered (mutation-asserted)
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 10 });
  win.rollStartingState(w);
  const doom = win.doomFront(w);
  const clockId = doom.danger || doom.kind; // findClockTarget resolves via slug(p.danger||p.kind)
  const m = applyMutates(win, w, { type: "clock_fired", source: "declared", payload: { clockId } },
    () => w.sundered);
  const ok = m.pass && !!w.sundered && typeof w.sundered.day !== "undefined";
  check("9", "clock_fired on the Doom front sets w.sundered (mutation-asserted: undefined -> set)", ok,
    `applyOk=${m.okFlag} changed=${m.changed} before=${m.before} after=${m.after}`);
}

// ---------------------------------------------------------------------------
// 10 — sundered world -> crownEligible.blocked==="sundered", eligible:false even with Doom closed + L10
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 10 });
  win.rollStartingState(w);
  const doom = win.doomFront(w);
  doom.closed = true; // Doom closed AND at ceiling — would be eligible but for the sundering
  const clockId = doom.danger || doom.kind;
  win.applyEvent(w, { type: "clock_fired", source: "declared", payload: { clockId } });
  const v = win.crownEligible(w);
  const ok = !!w.sundered && v.blocked === "sundered" && v.eligible === false;
  check("10", "sundered world stays uncrownable even with Doom closed + at ceiling (blocked===sundered)", ok,
    `sundered=${!!w.sundered} blocked=${v.blocked} eligible=${v.eligible}`);
}

// ---------------------------------------------------------------------------
// 11 — crowned-stub world -> crownEligible.blocked==="crowned"; banner string present in charHistoryBody
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 10 });
  win.rollStartingState(w);
  win.doomFront(w).closed = true;
  w.crowned = { day: 5 };
  const v = win.crownEligible(w);
  win.GS.ledgerDM = false;
  const html = win.charHistoryBody(w, w.characters[0]);
  const ok = v.blocked === "crowned" && v.eligible === false && html.indexOf("⟡ Crowned") >= 0;
  check("11", 'crowned world -> blocked==="crowned"; "⟡ Crowned" substring present in charHistoryBody render', ok,
    `blocked=${v.blocked} eligible=${v.eligible} bannerPresent=${html.indexOf("⟡ Crowned") >= 0}`);
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
const passed = results.filter(r => r.pass).length;
const failed = results.length - passed;
console.log("\n  GENESIS CROWNING C1 VERIFY — docs/CROWNING-BASTION.md §7.C1.6\n");
for (const r of results) {
  const flag = r.pass ? "✓" : "✗";
  console.log(`  [${flag}] ${r.id.padEnd(4)} ${r.title}`);
  console.log(`        ${r.detail}\n`);
}
console.log(`${failed === 0 ? "✓" : "✗"} crowning: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
