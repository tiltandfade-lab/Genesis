/* ============================================================================
   PLAYTEST BUG PROBES — the running regression suite for bugs caught in play.
   ----------------------------------------------------------------------------
   The bridgeless playtest (dev/playtest-bridgeless.mjs) surfaced a cluster of
   engine bugs on 2026-07-05 (session "The Shimmering Maw"). This file makes the
   harness AWARE of them: one deterministic probe per bug that reports whether it
   still REPRODUCES against the current engine. Run it before/after any fix — a
   probe that flips from PRESENT to RESOLVED is your regression guard; a RESOLVED
   probe that goes PRESENT again is a re-introduced bug.

   Companion doc (the running list, with root cause + intended fix):
     docs/PLAYTEST-BUGS.md   (bug ids below match that file: BUG-01 … )

   Run:  node dev/playtest-bug-probes.mjs
   (jsdom resolved per CLAUDE.md "headless test"; override JSDOM_HOME if needed.)
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
const EXPOSE = ["STAGES", "SPECIES", "CLASSES", "BACKGROUNDS"];
const expose = ";" + EXPOSE.map((n) => `try{window.${n}=${n};}catch(e){}`).join("");
const STUBS = ["renderWorld", "wakeReveal", "postState", "saveU", "toast", "showTab", "dieRoll", "streamDMText", "diceOverlay", "dmBridgeDown"];

function boot() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText + "\n" + expose);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  for (const n of STUBS) { try { win.eval(`typeof ${n}==="function"&&(${n}=function(){});`); } catch (_) {} }
  win.GS.dm = { turnId: null, pending: false, rollReq: null, ask: null, telemetry: [] };
  return win;
}

// a minimal living world for the applyEvent-based probes
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

const results = [];
const probe = (id, title, present, detail) => results.push({ id, title, present, detail });

// ---------------------------------------------------------------------------
// VARIETY CHARACTERIZATION — the world-seed roll should give a fresh setting
// name almost every game (bardo reincarnation is the only intended repeat path).
// Not a bug per se; a distribution flag. PRESENT = suspiciously low variety.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const N = 60, names = {};
  for (let i = 0; i < N; i++) { const r = win.lookup("master"); names[r.name] = (names[r.name] || 0) + 1; }
  const distinct = Object.keys(names).length;
  const maxHit = Math.max(...Object.values(names));
  const top = Object.entries(names).sort((a, b) => b[1] - a[1])[0];
  // flag if fewer than ~40% distinct over 60 rolls, or any single setting hits >4x (skew)
  const lowVariety = distinct < N * 0.4 || maxHit > 4;
  probe("VARIETY", `world-seed variety: ${distinct} distinct settings in ${N} rolls (top: "${top[0]}" ×${top[1]})`,
    lowVariety, `distinct=${distinct}/${N}, maxHit=${maxHit}. Bardo-reincarnation repeat path is a separate FUTURE feature (see PLAYTEST-BUGS.md FIX-A).`);
}

// ---------------------------------------------------------------------------
// BUG-01 (CRITICAL) — branch events rejected: resolveBranch stamps source:"branch",
// validateEvent only accepts detected|declared, so every branch event no-ops.
// Probe the seam directly: does applyEvent DROP a well-formed source:"branch" event?
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const before = w.factions[0].clock.filled;
  const res = win.applyEvent(w, { type: "clock_advanced", source: "branch", payload: { clockId: "The Ironwood Circle", delta: 1 } });
  const dropped = !(res && res.ok) && w.factions[0].clock.filled === before;
  probe("BUG-01", "branch-sourced events rejected by validateEvent (roll-branch consequences vanish)",
    dropped, `applyEvent(source:"branch") -> ${JSON.stringify(res)}; clock ${before}->${w.factions[0].clock.filled}`);
}

// ---------------------------------------------------------------------------
// BUG-02 (HIGH) — no event advances the WORLD CLOCK: walk_advance moves a walk
// cursor, not the clock. Probe: does clock.min move after a walk_advance?
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const before = w.clock.min;
  win.applyEvent(w, { type: "walk_advance", source: "detected", payload: { hours: 1, from: "a", to: "b" } });
  const stuck = w.clock.min === before;
  probe("BUG-02", "world clock does not advance on travel/combat (no DM event ticks the clock)",
    stuck, `walk_advance hours:1 -> clock.min ${before} -> ${w.clock.min}. (Design: combat should tick >=6s/round; distance should advance.)`);
}

// ---------------------------------------------------------------------------
// BUG-03 (HIGH) — digest ships MAX hp, not current: DM can't see how hurt the PC is.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.characters[0].sheet.hpCur = 1;   // badly hurt
  const dg = win.dmDigest();
  const hidesCurrent = dg && dg.pc && dg.pc.hp === 9 && dg.pc.hp !== 1;
  probe("BUG-03", "digest reports MAX hp, never hpCur (DM narrates combat blind to PC wounds)",
    hidesCurrent, `hpCur=1 but digest.pc.hp=${dg && dg.pc && dg.pc.hp}`);
}

// ---------------------------------------------------------------------------
// BUG-04 (HIGH) — no non-lethal KO: hp_changed to 0 triggers death saves even for
// a declared capture. Probe: dropping to exactly 0 starts the dying/death-save track.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.characters[0].sheet.hpCur = 3;
  const res = win.applyEvent(w, { type: "hp_changed", source: "declared", payload: { delta: -3 } });
  const sh = w.characters[0].sheet;
  const dying = !!(res && (res.deathSavesStarted || res.dropped)) || !!(sh.deathSaves);
  probe("BUG-04", "no non-lethal knockout path (0 HP always starts death saves, even on declared capture)",
    dying, `hp 3 - 3 -> ${sh.hpCur}; deathSaves=${JSON.stringify(sh.deathSaves || null)}, res=${JSON.stringify(res)}`);
}

// ---------------------------------------------------------------------------
// BUG-05 (MED) — discovery makeNode creates a node but never moves the PC.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const before = w.currentNodeId, nBefore = Object.keys(w.map.nodes).length;
  win.applyEvent(w, { type: "discovery", source: "detected", payload: { what: "A New Place", makeNode: true } });
  const madeNode = Object.keys(w.map.nodes).length > nBefore;
  const didNotMove = w.currentNodeId === before;
  probe("BUG-05", "discovery makeNode creates a node but does not relocate the PC (no travel event)",
    madeNode && didNotMove, `nodes ${nBefore}->${Object.keys(w.map.nodes).length}, currentNode unchanged=${didNotMove}`);
}

// ---------------------------------------------------------------------------
// BUG-06a (MED) — clock_advanced field mismatch: digest calls it `faction`, the
// event wants `clockId`. Probe with the digest's field name -> untracked.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const before = w.factions[0].clock.filled;
  const res = win.applyEvent(w, { type: "clock_advanced", source: "declared", payload: { faction: "The Ironwood Circle", delta: 1 } });
  const missed = w.factions[0].clock.filled === before;
  probe("BUG-06a", "clock_advanced ignores payload.faction (wants payload.clockId; digest uses `faction`)",
    missed, `payload.faction -> ${JSON.stringify(res)}; clock ${before}->${w.factions[0].clock.filled}`);
}

// ---------------------------------------------------------------------------
// BUG-06b (MED) — epithet_grant field mismatch: wants payload.text, DM reaches for
// payload.epithet.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const res = win.applyEvent(w, { type: "epithet_grant", source: "declared", payload: { epithet: "the Tested" } });
  const failed = !(res && res.ok);
  probe("BUG-06b", "epithet_grant ignores payload.epithet (wants payload.text)",
    failed, `payload.epithet -> ${JSON.stringify(res)}`);
}

// ---------------------------------------------------------------------------
// BUG-07 (MED) — distant_word ignores the DM-supplied text and rolls its own rumor.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const marker = "ZZ_UNIQUE_DM_TEXT_MARKER_ZZ";
  win.applyEvent(w, { type: "distant_word", source: "detected", payload: { text: marker } });
  const ledgerText = win.ledgerOf(w).map((e) => e.text).join(" | ");
  const ignored = !ledgerText.includes(marker);
  probe("BUG-07", "distant_word ignores DM-supplied payload.text (rolls its own ambient rumor)",
    ignored, `marker present in ledger=${!ignored}`);
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
const bugs = results.filter((r) => r.id.startsWith("BUG"));
const present = bugs.filter((r) => r.present).length;
console.log("\n  GENESIS PLAYTEST BUG PROBES — caught in 'The Shimmering Maw', 2026-07-05\n");
for (const r of results) {
  const flag = r.id === "VARIETY" ? (r.present ? "⚠ LOW " : "✓ OK  ") : (r.present ? "● PRESENT " : "○ resolved");
  console.log(`  [${flag.padEnd(9)}] ${r.id.padEnd(8)} ${r.title}`);
  console.log(`             ${r.detail}\n`);
}
console.log(`  ${present}/${bugs.length} caught bugs still reproduce. When a fix lands, its probe should flip to "resolved".`);
console.log(`  Details + intended fixes: docs/PLAYTEST-BUGS.md\n`);
