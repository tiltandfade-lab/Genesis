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
  check("status-side shows the clock (Day/Session)", /DAY 4/.test(html) && /Session 2/.test(html));
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
  check("exhaustion chip renders (Exhaustion 1)", /ss-badge exh">Exhaustion 1/.test(html));
  check("inspiration chip renders (◆ Inspiration)", /ss-badge insp/.test(html) && html.includes("Inspiration"));
  check("temp-HP indicator renders (+3 tmp)", /ss-hp-tmp/.test(html) && html.includes("+3 tmp"));
  // exactly 3 badge chips: poisoned (cond) + exhaustion (exh) + inspiration (insp) — the wrapping
  // .ss-badges div is not itself a chip; match the chip class exactly, not as a substring.
  const badgeCount = (html.match(/class="ss-badge (cond|exh|insp)"/g) || []).length;
  check("exactly 3 badge chips (poisoned, exhaustion, inspiration) + the separate temp-hp chip", badgeCount === 3, badgeCount);
}

// ============================================================================
// 2a. IVALICE PASS — engraved rail icons + squared-corner invariant (DESIGN-GUIDE.md §II)
// ============================================================================
{
  const win = freshWin();
  makeWorld(win);
  win.renderWorld();
  const html = win.document.getElementById("worldView").innerHTML;
  const rail = (html.match(/<nav class="game-rail">[\s\S]*?<\/nav>/) || [""])[0];
  check("rail uses engraved icons, not Unicode glyphs (helm/sword-shield/compass/key imgs)",
    /assets\/icons\/helm\.png/.test(rail) && /assets\/icons\/sword-shield\.png/.test(rail) &&
    /assets\/icons\/compass\.png/.test(rail) && /assets\/icons\/key\.png/.test(rail));
  check("no Unicode glyph spans left in the rail", !/<span class="ic">/.test(rail));
  check("location row uses the pin icon", /assets\/icons\/pin\.png/.test(html));
  check("HP label carries the heart icon", /assets\/icons\/heart\.png/.test(html));
  // squared-corner invariant: no px border-radius anywhere in the app CSS (50% circles allowed)
  const css = read("genesis.html");
  const pxRadii = (css.match(/border-radius:\s*[1-9][0-9]*px/g) || []).length;
  check("squared-corner invariant: zero px border-radii in genesis.html CSS", pxRadii === 0, `found ${pxRadii}`);
  check("no purple --strange in the palette (DESIGN-GUIDE.md §II.1)", !/--strange:\s*#8a5aa0/.test(css));
}

// ============================================================================
// 2c. DICE OVERLAY — the board theater receives the ENGINE's numbers, verbatim (docs/DICE-OVERLAY.md)
// ============================================================================
{
  const win = freshWin();
  makeWorld(win);
  // spy the overlay + stub the bridge send and the toast chrome so the roll handlers run headless
  let captured = null, sent = null;
  win.diceOverlay = (spec) => { captured = spec; };
  win.sendTurn = async (txt, rolls) => { sent = rolls; };
  win.toast = () => {};
  win.dmRollFor("Perception", "wis", "");
  check("dmRollFor hands the overlay exactly the d20 it sent to the DM",
    !!captured && !!sent && captured.dice.length >= 1 && captured.dice[0].sides === 20 &&
    captured.dice[0].result === sent[0].result,
    `overlay=${captured && captured.dice[0] && captured.dice[0].result} sent=${sent && sent[0] && sent[0].result}`);
  check("a crit chains the magnitude die as stage2 IFF a crit fired",
    (sent[0].result === 20 || sent[0].result === 1)
      ? (!!captured.stage2 && captured.stage2.dice[0].result === sent[1].result)
      : captured.stage2 == null);

  captured = null; sent = null;
  win.dmRollFor("Stealth", "dex", "advantage");
  const dropped = captured ? captured.dice.filter(d => d.dropped) : [];
  const kept = captured ? captured.dice.filter(d => !d.dropped) : [];
  check("advantage shows the pair with exactly one die dropped; the kept die is the sent result",
    !!captured && captured.dice.length === 2 && dropped.length === 1 && kept.length === 1 &&
    kept[0].result === sent[0].result);

  captured = null; sent = null;
  win.dmRollDice("2d6+3", "fire damage");
  const dieSum = captured ? captured.dice.reduce((a, d) => a + d.result, 0) : -1;
  check("dmRollDice shows one physical die per rolled die (2d6 → two d6s summing to total−3)",
    !!captured && captured.dice.length === 2 && captured.dice.every(d => d.sides === 6) &&
    dieSum + 3 === sent[0].total,
    `dice=${captured && JSON.stringify(captured.dice)} total=${sent && sent[0].total}`);
}

// ============================================================================
// 2b. SPELL SLOTS — sidebar readout under AC, IFF the sheet has slots (Adam 2026-07-01)
// ============================================================================
{
  // absent case: the default test sheet has no slotsMax/pact → no ss-slots block
  const win = freshWin();
  makeWorld(win);
  win.renderWorld();
  let html = win.document.getElementById("worldView").innerHTML;
  check("no spell-slot block when the sheet has no slots", !/ss-slots/.test(html));

  // leveled-slot case: L1 4 slots (3 left), L2 2 slots (0 left)
  const win2 = freshWin();
  makeWorld(win2, { slotsMax: [4, 2], slots: [3, 0] });
  win2.renderWorld();
  html = win2.document.getElementById("worldView").innerHTML;
  const side = (html.match(/<aside class="status-side">[\s\S]*?<\/aside>/) || [""])[0];
  check("spell-slot block renders in the sidebar", /ss-slots/.test(side));
  check("slot rows carry roman-numeral level labels (I, II)",
    /ss-slot-lvl">I</.test(side) && /ss-slot-lvl">II</.test(side));
  const on = (side.match(/class="ss-slot-dot on"/g) || []).length;
  const off = (side.match(/class="ss-slot-dot off"/g) || []).length;
  check("dot counts match cur/max (3 on, 3 off across both levels)", on === 3 && off === 3, `on=${on} off=${off}`);
  check("slot block sits between AC and the meta block", side.indexOf("ss-ac") < side.indexOf("ss-slots") && side.indexOf("ss-slots") < side.indexOf("ss-meta"));

  // pact-magic case: warlock pact slots render as a steel-tinted P row
  const win3 = freshWin();
  makeWorld(win3, { pact: { level: 2, cur: 1, max: 2 } });
  win3.renderWorld();
  html = win3.document.getElementById("worldView").innerHTML;
  const pactOn = (html.match(/class="ss-slot-dot pact on"/g) || []).length;
  const pactOff = (html.match(/class="ss-slot-dot pact off"/g) || []).length;
  check("pact row renders (P2, 1 on / 1 off)", /ss-slot-lvl">P2</.test(html) && pactOn === 1 && pactOff === 1, `on=${pactOn} off=${pactOff}`);
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
  // R3 framed-tab rail: items are .rl buttons (mockup); active one gets .rl.on
  const railBtnCount = (rail.match(/class="rl(\s|")/g) || []).length;
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
  check("Actions tab renders STANDARD_ACTIONS_REF reference cards (.refc)", /class="refc"/.test(html) && html.includes("Dash"));
  // inform-only: the reference cards themselves carry no onclick (the player types to act). Grab the
  // grid of .refc cards in the Actions body and assert none of them wires a click.
  const refcCards = (html.match(/<div class="refc"[^>]*>[\s\S]*?<\/div>\s*<\/div>/g) || []).join("");
  check("Actions reference cards carry no onclick (inform-only)",
    refcCards.length > 0 && !/onclick/.test(refcCards));
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
  check("the menu contains Powers (Powers panel is no longer orphaned)", /openPanel\('powers'\)/.test(html) && html.includes("Powers"));
  // HOTFIX-QUEUE-2026-07-06 H6 #6: `/Reveal all/.test(html) || true` can never fail — replace with a
  // state-forked pair so the button's actual presence/absence is asserted, not just tautologically true.
  world.revealed = { map: 0, powers: 0, ledger: 0, gaz: 0 };
  win.toggleMenu(); win.toggleMenu();   // close+reopen so the popover re-renders against the new state
  const htmlNotAllRevealed = win.document.getElementById("worldView").innerHTML;
  check("the menu contains Reveal all when NOT all panels are revealed", /Reveal all/.test(htmlNotAllRevealed));
  world.revealed = { map: 1, powers: 1, ledger: 1, gaz: 1 };
  win.toggleMenu(); win.toggleMenu();
  const htmlAllRevealed = win.document.getElementById("worldView").innerHTML;
  check("the menu's Reveal all button is GONE once every panel is revealed", !/Reveal all/.test(htmlAllRevealed));
  check("the menu is NOT a .panel-col", !html.includes('class="game has-panel"'));
  // code-review follow-up: the World & transitions items (Travel/New power/New whisper/+1h/Dawn/
  // +1 day/Prep handoff/Copy world) must dismiss the popover on click (closeMenu() first), matching
  // the universe/session/powers/destroy/oracle items that already did.
  check("World & transitions menu items call closeMenu() before their action",
    /onclick="closeMenu\(\);explore\('nearby','Place'\)"/.test(html) &&
    /onclick="closeMenu\(\);explore\('faction','Faction'\)"/.test(html) &&
    /onclick="closeMenu\(\);explore\('myth','Myth'\)"/.test(html) &&
    /onclick="closeMenu\(\);passTime\('short'\)"/.test(html) &&
    /onclick="closeMenu\(\);passTime\('dawn'\)"/.test(html) &&
    /onclick="closeMenu\(\);passTime\('montage'\)"/.test(html) &&
    /onclick="closeMenu\(\);handToDM\(\)"/.test(html));
}

// ============================================================================
// 6. NO-SCROLL INVARIANT — the CSS enforces overflow:hidden on .wrap.ingame; only .dm-feed scrolls
// ============================================================================
{
  const css = read("genesis.html");
  check(".wrap.ingame enforces height:100vh + overflow:hidden (full-bleed)", /\.wrap\.ingame\{max-width:none;height:100vh;padding:0;overflow:hidden/.test(css));
  check(".wrap.ingame is full-bleed (no max-width container, no in-session footer)",
    /\.wrap\.ingame\{max-width:none/.test(css) && /\.wrap\.ingame footer\{display:none\}/.test(css));
  check(".wrap.ingame .chat-col .dm-feed is the scrollable node", /\.wrap\.ingame \.chat-col \.dm-feed\{[^}]*overflow-y:auto/.test(css));
  check(".status-side does not scroll (overflow:visible on the outer, hidden on .ss-inner)",
    /\.status-side\{[^}]*overflow:visible/.test(css) && /\.ss-inner\{[^}]*overflow:hidden/.test(css));
}

// ============================================================================
// 7. MOCKUP FIDELITY — squared corners, R3 framed-tab rail, no standing dice tray (REV 2)
// ============================================================================
{
  const css = read("genesis.html");
  // R3: the active rail tab juts rightward toward the feed (margin-right negative, no right border)
  check("R3 rail: active tab juts toward the feed (.rl.on margin-right negative)",
    /\.rl\.on\{[^}]*margin-right:-24px/.test(css) && /\.rl\.on\{[^}]*border-right-color:transparent/.test(css));
  // squared corners: the sidebar, panels, badges, HP bar, composer all border-radius:0
  check("squared corners: .ss-badge / .ss-hp-bar / .abil / .refc all border-radius:0",
    /\.ss-badge\{[^}]*border-radius:0/.test(css) && /\.ss-hp-bar\{[^}]*border-radius:0/.test(css) &&
    /\.abil\{[^}]*border-radius:0/.test(css) && /\.refc\{[^}]*border-radius:0/.test(css));
  check("chat/panel zones are squared (border-radius:0)", /\.chat-col,\.panel-col\{[^}]*border-radius:0/.test(css));
  // the standing dice tray is GONE (contextual roll prompt only) — no CSS and no markup for it
  check("standing dice tray removed (no .dice-tray CSS)", !/\.dice-tray/.test(css));

  const win = freshWin();
  const world = makeWorld(win);
  win.renderWorld();
  const html = win.document.getElementById("worldView").innerHTML;
  check("standing dice tray removed (no '🎲 Roll dice' in the feed)", !html.includes("Roll dice") && !html.includes("dice-tray"));
  check("composer (dm-input) is still present + wired to dmSend", /class="dm-input"/.test(html) && /onclick="dmSend\(\)"/.test(html));
  check("full-bleed: no in-session footer tagline rendered", !html.includes("Arcana Engine branch"));
}

// ============================================================================
// 8. WIRING PRESERVED — the panel handlers survive the restructure
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win, {
    inventory: [{ id: "w1", name: "Pact Blade", base: "Longsword", conditions: [] },
                { id: "p1", name: "Potion of Healing", conditions: [], consumable: { effect: { kind: "heal", dice: { n: 2, die: 4, bonus: 2 } } } }],
    equipped: { mainHand: "w1" },
  });
  win.GS.charTab = "inventory";
  win.openPanel("character");
  const html = win.document.getElementById("worldView").innerHTML;
  check("inventory: equip/stow wiring preserved (equipItem/unequipSlot onclick)",
    /equipItem\('|unequipSlot\('/.test(html));
  check("inventory: use wiring preserved on a consumable (useItem onclick)", /useItem\('p1'\)/.test(html));
  check("inventory: equipped slots row renders (.slot with Pact Blade)", /class="slot"/.test(html) && html.includes("Pact Blade"));
  check("inventory: load bar renders", /class="load-bar/.test(html));
}

// ============================================================================
// 9. BATTLE-VISUALS A7 — combat feed chips (the ⚔ outcome ledger surfaces in the center feed)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  // a combat-start ledger entry, exactly as world/dm.js's "combat_start" case writes it.
  win.addLedger(world, "outcome", { kind: "combat-start", foes: [{ fid: "f1", name: "Goblin", cr: 0.25 }], first: "pc" },
    "⚔ Combat — 1 foe: Goblin (fresh). You won initiative.");
  // an attack ledger entry, exactly as world/dm.js's "attack" case writes it.
  win.addLedger(world, "outcome", { kind: "attack", pc: "Ilyra Stonesong", weapon: "Quarterstaff", hit: true, damage: 4 },
    "⚔ Ilyra Stonesong hits with Quarterstaff for 4 damage.");
  win.renderWorld();
  const html = win.document.getElementById("worldView").innerHTML;
  check("A7a. a combat-start ledger entry renders as a ⚔ feed chip", /cmb-feed-chip/.test(html) && html.includes("Combat — 1 foe"));
  check("A7b. an attack ledger entry (mid-fight) renders as a ⚔ feed chip", /cmb-feed-start|cmb-feed-turn/.test(html) && html.includes("hits with Quarterstaff"));
}
{
  // absence case: a fresh world with NO combat ledger entries never renders a combat feed chip —
  // proves A7 doesn't leak an empty/spurious chip when nothing has happened yet.
  const win = freshWin();
  const world = makeWorld(win);
  win.renderWorld();
  const html = win.document.getElementById("worldView").innerHTML;
  check("A7c. no combat ledger entries -> no ⚔ feed chip renders", !/cmb-feed-chip/.test(html));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
