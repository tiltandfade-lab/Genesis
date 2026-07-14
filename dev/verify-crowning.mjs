/* ============================================================================
   VERIFY-CROWNING — CROWNING §7.C1 + §7.C2 acceptance: the Doom-front flag + crown eligibility,
   extended by C2's ritual + legend state (docs/CROWNING-BASTION.md §7.C1.6, §7.C2.9). RED-first,
   mutation-asserting (applyMutates guard, the same ROOT-A discipline as dev/playtest-bug-probes.mjs).

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
// engine.crowning's / crowning-ritual's top-level consts (CROWN_HOW_VERBS, CROWN_LEGEND,
// U_LEGENDS_CAP, SAGA_MAX) do not auto-attach to window under jsdom — same lesson as ITEM-LEGACY
// §8. function-declared doomFront/crownEligible/rollStartingState/applyEvent/charHistoryBody/
// crownWorld/crownRetireToSoul/markSundered/legendRecord/distantWordPick ARE reachable as
// win.<name> without EXPOSE. HQ2-8e: STAGES/SPECIES/CLASSES/BACKGROUNDS/DM_EVENT_TYPES/
// DM_EVENT_FIELDS/dmFoldPayload retired — this file's seedWorld hardcodes species/class/background
// literals and never reads any of the seven off window; zero other references in this file.
const EXPOSE = ["CROWN_HOW_VERBS", "CROWN_LEGEND", "U_LEGENDS_CAP", "SAGA_MAX"];
const expose = ";" + EXPOSE.map((n) => `try{window.${n}=${n};}catch(e){}`).join("");
// spawnSuccessorOnPlane calls rollCharacter/UI — stubbed so crownWorld runs headless without
// opening character creation (§C2.9).
const STUBS = ["renderWorld", "wakeReveal", "postState", "saveU", "toast", "showTab", "dieRoll", "streamDMText", "diceOverlay", "dmBridgeDown", "spawnSuccessorOnPlane"];

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
// 12 — CROWN_LEGEND length 8, every row has band+text
// ---------------------------------------------------------------------------
{
  const win = boot();
  const rows = win.CROWN_LEGEND;
  const ok = Array.isArray(rows) && rows.length === 8 && rows.every(r => r && typeof r.band === "string" && typeof r.text === "string");
  check("12", "CROWN_LEGEND length 8, every row has band+text", ok, `rows=${rows && rows.length}`);
}

// ---------------------------------------------------------------------------
// 13 — crownWorld on an eligible world writes w.crowned (mutation-asserted: undefined -> set)
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 10 });
  win.rollStartingState(w);
  win.doomFront(w).closed = true;
  const c = w.characters[0];
  const before = w.crowned;
  win.GS.CROWN = { step: 0, legend: null, epithet: null, testament: null, succession: null };
  win.crownWorld();
  const ok = before === undefined && !!w.crowned && w.crowned.by.pcId === c.id
    && typeof w.crowned.legend.text === "string" && w.crowned.testament.length <= 7;
  check("13", "crownWorld on an eligible world writes w.crowned (by.pcId, legend.text, testament<=7)", ok,
    `before=${before} crowned=${JSON.stringify(w.crowned)}`);
}

// ---------------------------------------------------------------------------
// 14 — crowned PC banked: U.souls +1, last soul .crowned.world===w.name, deep-copy isolation
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 10 });
  win.rollStartingState(w);
  win.doomFront(w).closed = true;
  const c = w.characters[0];
  const before = win.U.souls.length;
  win.GS.CROWN = { step: 0, legend: null, epithet: null, testament: null, succession: null };
  win.crownWorld();
  const after = win.U.souls.length;
  const soul = win.U.souls[win.U.souls.length - 1];
  soul.sheet.hp = 999999; // mutate the roster copy — must not bleed back into the world character's sheet
  const isolated = w.characters[0].sheet.hp !== 999999;
  const ok = after === before + 1 && soul.crowned && soul.crowned.world === w.name && isolated;
  check("14", "crowned PC banked to U.souls (+1), .crowned.world set, sheet deep-copied (no alias)", ok,
    `before=${before} after=${after} crownedWorld=${soul.crowned && soul.crowned.world} isolated=${isolated}`);
}

// ---------------------------------------------------------------------------
// 15 — crowned char retired in place: still in w.characters, status "crowned", livingSheet null
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 10 });
  win.rollStartingState(w);
  win.doomFront(w).closed = true;
  const c = w.characters[0];
  win.GS.CROWN = { step: 0, legend: null, epithet: null, testament: null, succession: null };
  win.crownWorld();
  const stillPresent = w.characters.some(x => x.id === c.id);
  const statusMoved = c.status === "crowned";
  const noLivingSheet = win.livingSheet(w) === null;
  const ok = stillPresent && statusMoved && noLivingSheet;
  check("15", 'crowned char retired in place (still in w.characters, status "crowned", livingSheet null)', ok,
    `stillPresent=${stillPresent} status=${c.status} livingSheet=${win.livingSheet(w)}`);
}

// ---------------------------------------------------------------------------
// 16 — crownEligible false after crown (blocked==="crowned") — eligible moves true->false
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 10 });
  win.rollStartingState(w);
  win.doomFront(w).closed = true;
  const before = win.crownEligible(w).eligible;
  win.GS.CROWN = { step: 0, legend: null, epithet: null, testament: null, succession: null };
  win.crownWorld();
  const v = win.crownEligible(w);
  const ok = before === true && v.eligible === false && v.blocked === "crowned";
  check("16", "crownEligible false after crown (blocked===crowned; eligible moves true->false)", ok,
    `before=${before} after=${v.eligible} blocked=${v.blocked}`);
}

// ---------------------------------------------------------------------------
// 17 — legendRecord: U.legends +1, entry kind:"crowned", testament present; cap holds at 40
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 10 });
  win.rollStartingState(w);
  win.doomFront(w).closed = true;
  const before = (win.U.legends || []).length;
  win.GS.CROWN = { step: 0, legend: null, epithet: null, testament: null, succession: null };
  win.crownWorld();
  const after = win.U.legends.length;
  const entry = win.U.legends[win.U.legends.length - 1];
  // push 40 MORE crowned worlds through legendRecord (the real cap-enforcing path) to prove the
  // cap holds at U_LEGENDS_CAP (oldest evicted) — 41 total pushes onto a pool that started at 1.
  const cappedAt = win.U_LEGENDS_CAP;
  for (let i = 0; i < cappedAt; i++) {
    const fw = { id: "filler-" + i, name: "Filler " + i, crowned: { day: 1, by: {}, legend: { text: "x" }, testament: [], succession: null } };
    win.legendRecord(fw);
  }
  const ok = after === before + 1 && entry.kind === "crowned" && Array.isArray(entry.testament) && win.U.legends.length === cappedAt;
  check("17", 'legendRecord: U.legends +1, kind:"crowned", testament present; cap enforced at U_LEGENDS_CAP', ok,
    `before=${before} after=${after} entryKind=${entry.kind} finalLen=${win.U.legends.length} cap=${cappedAt}`);
}

// ---------------------------------------------------------------------------
// 18 — markSundered: w.sundered.legend set, U.legends +1 kind:"sundered"; idempotent (2nd no-op)
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 10 });
  win.rollStartingState(w);
  w.sundered = { day: 3, frontId: "x" };
  const before = (win.U.legends || []).length;
  win.markSundered(w);
  const afterFirst = win.U.legends.length;
  const legendSet = w.sundered.legend && w.sundered.legend.text === "the world where the Doom won";
  win.markSundered(w); // idempotent — 2nd call must no-op
  const afterSecond = win.U.legends.length;
  const ok = legendSet && afterFirst === before + 1 && afterSecond === afterFirst;
  check("18", 'markSundered: w.sundered.legend set, U.legends +1 kind:"sundered"; idempotent 2nd call', ok,
    `legendSet=${legendSet} before=${before} afterFirst=${afterFirst} afterSecond=${afterSecond}`);
}

// ---------------------------------------------------------------------------
// 19 — distantWordPick surfaces a foreign legend; a legend from THIS world is excluded
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { level: 10 });
  win.rollStartingState(w);
  win.U.legends = [
    { worldId: "other-world", worldName: "Farhaven", kind: "crowned", day: 9, legend: "a golden age", hook: "the Ironwood Circle", testament: [] },
    { worldId: w.id, worldName: w.name, kind: "crowned", day: 1, legend: "excluded (this world)", hook: null, testament: [] },
  ];
  const picked = win.distantWordPick(w);
  const ok = !!picked && picked.data && picked.data.legend === true && picked.id === "legend:other-world";
  check("19", 'distantWordPick surfaces a foreign legend (data.legend===true); same-world legend excluded', ok,
    `picked=${JSON.stringify(picked)}`);
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
const passed = results.filter(r => r.pass).length;
const failed = results.length - passed;
console.log("\n  GENESIS CROWNING C1+C2 VERIFY — docs/CROWNING-BASTION.md §7.C1.6, §7.C2.9\n");
for (const r of results) {
  const flag = r.pass ? "✓" : "✗";
  console.log(`  [${flag}] ${r.id.padEnd(4)} ${r.title}`);
  console.log(`        ${r.detail}\n`);
}
console.log(`${failed === 0 ? "✓" : "✗"} crowning: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
