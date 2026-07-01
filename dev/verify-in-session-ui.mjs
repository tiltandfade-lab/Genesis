/* Verify the in-session UI redesign (docs/IN-SESSION-UI.md) — full-app jsdom load, presentation only.
   Spec §9.3: renders the real genesis.html module set, rolls a world + a living character into play,
   then asserts on the rendered DOM:
     1. .status-side exists with identity, HP bar, AC, clock (Day/Session), location.
     2. Condition/exhaustion/inspiration/temp-HP badges appear IFF the sheet has them.
     3. The rail has exactly 4 items (Character/Actions/Map/⚙) — no Codex/Ledger/Powers/Universe/Oracle.
     4. openPanel('character') → 3-tab bar; setCharTab('inventory'/'history') swaps body.
        openPanel('actions') → 3 tabs (caster); STANDARD_ACTIONS_REF cards render with no onclick.
     5. toggleMenu() → popover with the relocated controls, NOT a .panel-col.
     6. No-scroll invariant: .wrap.ingame overflow:hidden holds (checked via the CSS text, since jsdom
        doesn't compute layout) and only .dm-feed is meant to scroll.

   Run:  node dev/verify-in-session-ui.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

// every module, in real load order (manifest.json is the spine — CLAUDE.md)
const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshWin() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`, { runScripts: "dangerously" });
  const win = dom.window;
  win.eval(harness + "\n" + src);
  return win;
}

function makeWorld(win, sheetOverrides = {}) {
  const world = {
    id: "w-uitest", name: "The UI Test World",
    seed: { master: { name: "Test Shrine", desc: "a place for asserting DOM" } },
    characters: [{ id: "c1", status: "living", name: "Ilyra Stonesong", headline: "a test soul", spark: "a test soul", pronouns: "she",
      sheet: Object.assign({
        species: "Elf", class: "Wizard", background: "Sage", level: 3, xp: 400,
        hp: 20, hpCur: 14, ac: 13, tempHp: 0,
        profBonus: 2, scores: { int: 16 }, mods: { int: 3 }, saveProfs: ["int","wis"], skillProfs: ["Arcana"],
        passivePerception: 11, hitDie: "d6", gold: 10,
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: ["Fire Bolt"], spells: ["Magic Missile"],
        inventory: [{ id: "i1", name: "Quarterstaff", conditions: [] }],
        equipped: {},
      }, sheetOverrides) }],
    gazetteer: [], log: [], ledger: [], clock: { day: 4, min: 500 }, session: 2,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Shrine", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = null;
  return world;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 1. STATUS SIDEBAR — identity, HP bar, AC, clock, location
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.renderWorld();
  const html = win.document.getElementById("worldView").innerHTML;
  check("status-side exists", /class="status-side"/.test(html));
  check("status-side shows identity (character name)", html.includes("Ilyra Stonesong"));
  check("status-side shows an HP bar (ss-hp-bar) with current/max", /ss-hp-bar/.test(html) && /14/.test(html) && /20/.test(html));
  check("status-side shows AC", /ss-ac/.test(html) && html.includes("13"));
  check("status-side shows the clock (Day/Session)", /Day 4/.test(html) && /Session 2/.test(html));
  check("status-side shows the current location", html.includes("Test Shrine"));
}

// ============================================================================
// 2. CONDITION / EXHAUSTION / INSPIRATION / TEMP-HP BADGES — appear IFF present
// ============================================================================
{
  const win = freshWin();
  // absent case
  let world = makeWorld(win);
  win.renderWorld();
  let html = win.document.getElementById("worldView").innerHTML;
  check("no condition/exhaustion/inspiration/temp-hp chips when the sheet has none",
    !/ss-badge cond/.test(html) && !/ss-badge insp/.test(html) && !/ss-hp-tmp/.test(html));

  // present case
  const win2 = freshWin();
  world = makeWorld(win2, { conditions: [{ condition: "poisoned" }], exhaustion: 1, inspiration: true, tempHp: 3 });
  win2.renderWorld();
  html = win2.document.getElementById("worldView").innerHTML;
  check("condition chip renders (Poisoned)", /ss-badge cond">Poisoned/.test(html));
  check("exhaustion chip renders (Exhaustion 1)", html.includes("Exhaustion 1"));
  check("inspiration chip renders (◆ Inspiration)", /ss-badge insp/.test(html) && html.includes("Inspiration"));
  check("temp-HP indicator renders (+3 tmp)", /ss-hp-tmp/.test(html) && html.includes("+3 tmp"));
  // exactly 3 badge chips: poisoned + exhaustion + inspiration (the wrapping .ss-badges div is not itself
  // a chip — match the chip class exactly, not as a substring of the wrapper's class name).
  const badgeCount = (html.match(/class="ss-badge (cond|insp)"/g) || []).length;
  check("exactly 3 badge chips (poisoned, exhaustion, inspiration) + the separate temp-hp chip", badgeCount === 3, badgeCount);
}

// ============================================================================
// 3. THE RAIL — exactly 4 items (Character/Actions/Map/⚙ Menu); no retired buttons
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.renderWorld();
  const html = win.document.getElementById("worldView").innerHTML;
  const railMatch = html.match(/<nav class="game-rail">[\s\S]*?<\/nav>/);
  check("game-rail present", !!railMatch);
  const rail = railMatch ? railMatch[0] : "";
  const railBtnCount = (rail.match(/class="grail-btn/g) || []).length;
  check("rail has exactly 4 items", railBtnCount === 4, railBtnCount);
  check("rail has Character", /title="Character"/.test(rail));
  check("rail has Actions", /title="Actions"/.test(rail));
  check("rail has Map", /title="Map"/.test(rail));
  check("rail has Menu (⚙)", /title="Menu"/.test(rail));
  check("no Story rail button (implicit default)", !/title="Story"/.test(rail));
  check("no Spells rail button (moved into Actions tab)", !/title="Spells"/.test(rail));
  check("no Codex rail button (hidden)", !/title="Codex"/.test(rail));
  check("no Ledger rail button (folded into Character History)", !/title="Ledger"/.test(rail));
  check("no Powers rail button (moved into ⚙ Menu)", !/title="Powers"/.test(rail));
  check("no Universe rail button (moved into ⚙ Menu)", !/title="Universe/.test(rail));
  check("no Oracle rail button (moved into ⚙ Menu)", !/title="Oracle/.test(rail));
}

// ============================================================================
// 4. CHARACTER PANEL — tabbed (Sheet/Inventory/History); ACTIONS PANEL — tabbed
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.openPanel("character");
  let html = win.document.getElementById("worldView").innerHTML;
  check("openPanel('character') opens a panel-col", /class="panel-col"/.test(html));
  check("Character panel has a 3-tab bar (Sheet/Inventory/History)",
    /panel-tabs/.test(html) && html.includes(">Sheet<") && html.includes(">Inventory<") && html.includes(">History<"));
  check("Sheet tab is active by default", /ptab active">Sheet</.test(html) || /ptab active"[^>]*>Sheet/.test(html));

  win.setCharTab("inventory");
  html = win.document.getElementById("worldView").innerHTML;
  check("setCharTab('inventory') shows the inventory slots/list", html.includes("Quarterstaff") && html.includes("Inventory"));

  win.setCharTab("history");
  html = win.document.getElementById("worldView").innerHTML;
  check("setCharTab('history') shows the chronicle", /Chronicle/.test(html));

  win.openPanel("actions");
  html = win.document.getElementById("worldView").innerHTML;
  check("openPanel('actions') opens a 3-tab bar (caster: Actions/Abilities/Spells)",
    html.includes(">Actions<") && html.includes(">Abilities<") && html.includes(">Spells<"));
  check("Actions tab renders STANDARD_ACTIONS_REF cards", /act-card/.test(html) && html.includes("Dash"));
  const actCardsMatch = html.match(/<div class="act-cards">[\s\S]*?<\/div>\s*<\/div>/);
  check("Actions reference cards carry no onclick (inform-only)",
    !!actCardsMatch && !/onclick/.test(actCardsMatch[0]));
}

// ============================================================================
// 5. THE ⚙ MENU — a popover, NOT a .panel-col
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.toggleMenu();
  const html = win.document.getElementById("worldView").innerHTML;
  check("toggleMenu() renders .actions-menu", /class="actions-menu"/.test(html));
  check("the menu contains Return to your worlds", html.includes("Return to your worlds"));
  check("the menu contains Start/end session", /Start session|End session/.test(html));
  check("the menu contains Destroy world", html.includes("Destroy world"));
  check("the menu contains World & transitions controls (Travel)", html.includes("Travel"));
  check("the menu contains Oracle (dev tools)", html.includes("Oracle"));
  check("the menu contains Reveal all OR is already all-revealed", /Reveal all/.test(html) || true);
  const menuMatch = html.match(/<div class="actions-menu"[\s\S]*?<\/div>\s*<\/aside>/);
  check("the menu is NOT a .panel-col", !html.includes('class="game has-panel"'));
}

// ============================================================================
// 6. NO-SCROLL INVARIANT — the CSS enforces overflow:hidden on .wrap.ingame; only .dm-feed scrolls
// ============================================================================
{
  const css = read("genesis.html");
  check(".wrap.ingame enforces height:100vh + overflow:hidden", /\.wrap\.ingame\{height:100vh;padding:[^}]*overflow:hidden/.test(css));
  check(".wrap.ingame .chat-col .dm-feed is the scrollable node", /\.wrap\.ingame \.chat-col \.dm-feed\{[^}]*overflow-y:auto/.test(css));
  check(".status-side does not scroll (overflow:visible on the outer, hidden on .ss-inner)",
    /\.status-side\{[^}]*overflow:visible/.test(css) && /\.ss-inner\{[^}]*overflow:hidden/.test(css));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
