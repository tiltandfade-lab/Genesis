/* Verify TABLETOP-UNITS U2 — the 3-column shell + ARIA contract (docs/TABLETOP-UNITS.md §U2,
   docs/TABLETOP-VISION.md §1/§9.7/§9.11). jsdom over the real genesis.html modules, same convention
   as dev/verify-battle-stage.mjs (this repo's established stage-mode fixture: stub window.Theater,
   which simulates a successful mount so stageMode flips true without a real WebGL context).

   INTEGRATION NOTE (U1+U2 tree, Wave 1 gate): U1 severed the old combat->stageMode trigger —
   post-U1, stageMode = !!(GS.theaterMounted && !GS.stageCollapsed) (render.js:309), combat no
   longer gates the stage. On U2's isolated branch this fixture entered stage mode via combatStart
   (correct THERE, where U1 was absent); on the integrated tree that path leaves theaterMounted
   false and the stage never paints. Fix: stubTheater() now sets GS.theaterMounted to match
   mountReturns — a stubbed, mountable Theater IS a mounted stage. RED-FIRST proof (Opus gate,
   integration tree): before this change, checks 1/2/2b/3/6b/8a/8h/10b failed + the harness crashed
   at 11b (prose null); the integrated PRODUCT was verified correct first (forcing theaterMounted=
   true rendered .game.battle-stage + .stage-col + exactly one .stage-prose). startFight() is kept
   only because the stage-prose twin needs combat content to render — not to gate the stage.

   U2 scope only: the mainHtml default-stage branch, the rail stage-toggle (GS.stageCollapsed), the
   760px forced-collapse rule, and the locked ARIA list (.dm-feed role=log, composer aria-label,
   the feed section's aria-label="The DM", .status-side aria-label, .stage-prose living OUTSIDE the
   aria-hidden stage subtree, and the dice-overlay alignment retarget to the feed column).

   Checks:
     1. .chat-col.stage-col carries aria-hidden="true" in stage mode.
     2. .stage-prose is NOT inside .chat-col.stage-col (moved out to the feed column, per §9.11).
     3. .stage-prose DOES render, once, somewhere in the feed section (never silently dropped).
     4. .dm-feed carries role="log" aria-live="polite" (both stage mode and classic mode).
     5. #dmAction carries aria-label="Your action".
     6. The feed's containing section carries aria-label="The DM" (stage mode + classic mode).
     7. .status-side carries aria-label="Character and party".
     8. The rail gains a stage-toggle button bound to GS.stageCollapsed (GS-only); clicking it
        flips the flag and re-renders; the mainHtml branch responds (classic layout when collapsed).
     9. 760px breakpoint: the CSS forces the stage column hidden (checked as CSS text, jsdom has no
        real layout — same convention as verify-in-session-ui.mjs's no-scroll-invariant check).
     10. Dice overlay alignment retargets to the feed column (.panel-col.stage-feed-col) in stage
         mode, not the stage-col board; falls back to .chat-col in classic mode (no regression).
     11. §9.11 MUTATION CHECK (shown catching the break, not just passing clean): build a fixture
         where .stage-prose is (re-)nested inside an aria-hidden ancestor and prove the very same
         "no aria-hidden ancestor" assertion used in check 2 FAILS against it — this is the harness
         biting, per the spec's explicit mutation instruction ("wrap .stage-prose back inside the
         hidden subtree -> your harness FAILS").

   RED-FIRST: every check below was run against the pre-U2 tree first (checks 1,2,4-8,10 failed;
   check 9 failed for lack of the CSS rule; check 11's clean-tree half also failed since stage-prose
   was, at that point, genuinely still nested inside the hidden wrap) — see the session report for
   the observed red output.

   Run:  node dev/verify-tabletop-u2.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshWin() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

function makeWorld(win, sheetOverrides = {}) {
  const world = {
    id: "w-u2test", name: "The U2 Shell Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting DOM" } },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: Object.assign({
        species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 18, con: 16 }, mods: { str: 4, con: 3 }, saveProfs: ["str","con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [], equipped: {}, pools: {},
      }, sheetOverrides) }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Redoubt", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.theaterMounted = false;
  win.GS.stageCollapsed = false;
  return world;
}

function startFight(win, world, opts = {}) {
  const combat = win.combatStart(Object.assign({
    pc: { init: 2 },
    foes: [{ name: "Bat" }, { name: "Basilisk" }],
    pcRoll: 15, foeRoll: 3,
  }, opts));
  win.GS.combat = combat;
  return combat;
}

function stubTheater(win, { mountReturns = true } = {}) {
  const calls = { mount: 0, setBoard: 0, setUnits: 0, retire: 0 };
  win.Theater = {
    mount(el) { calls.mount++; return mountReturns && !!el; },
    setBoard() { calls.setBoard++; },
    setUnits() { calls.setUnits++; },
    rotate() {},
    zoom() { return 1; },
    retire() { calls.retire++; },
  };
  // Post-U1 (integration tree): stageMode is gated on GS.theaterMounted, not combat. A stubbed,
  // mountable Theater represents a stage that mounted successfully, so reflect that in GS state —
  // this is what a real mount() leaves behind. mountReturns:false (the degrade fixture) leaves it
  // false, exactly as a failed mount would. See the INTEGRATION NOTE in the header.
  win.GS.theaterMounted = mountReturns;
  return calls;
}

// walk up parentElement, jsdom-safe (no getBoundingClientRect/layout needed) — an aria-hidden
// ancestor silently suppresses descendant aria-live announcements (TABLETOP-VISION §9.11).
function hasAriaHiddenAncestor(el) {
  let n = el && el.parentElement;
  while (n) {
    if (n.getAttribute && n.getAttribute("aria-hidden") === "true") return true;
    n = n.parentElement;
  }
  return false;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 1-3, 6-7. STAGE MODE — aria-hidden wrap, .stage-prose moved out, feed section labeled
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  startFight(win, world);
  stubTheater(win);
  win.renderWorld();
  const host = win.document.getElementById("worldView");

  const stageCol = host.querySelector(".chat-col.stage-col");
  check("1. .chat-col.stage-col carries aria-hidden=\"true\"", !!stageCol && stageCol.getAttribute("aria-hidden") === "true",
    stageCol && stageCol.getAttribute("aria-hidden"));

  const allProse = Array.from(host.querySelectorAll(".stage-prose"));
  check("2. exactly one .stage-prose renders", allProse.length === 1, allProse.length);
  check("2b. .stage-prose is NOT inside the aria-hidden stage-col (no aria-hidden ancestor)",
    allProse.length === 1 && !hasAriaHiddenAncestor(allProse[0]));
  check("3. .stage-prose still carries role=status aria-live=polite (BLIND-PLAYABLE untouched)",
    allProse.length === 1 && allProse[0].getAttribute("role") === "status" && allProse[0].getAttribute("aria-live") === "polite");

  const feedSection = host.querySelector('[aria-label="The DM"]');
  check("6. the feed's container carries aria-label=\"The DM\" in stage mode", !!feedSection);
  check("6b. .stage-prose renders inside that section (the feed column's live sibling)",
    !!feedSection && allProse.length === 1 && feedSection.contains(allProse[0]));
  check("6c. the feed (.dm-feed) also lives inside that same section",
    !!feedSection && !!feedSection.querySelector(".dm-feed"));

  check("7. .status-side carries aria-label=\"Character and party\"",
    host.querySelector('.status-side[aria-label="Character and party"]') != null);
}

// ============================================================================
// 4-5. .dm-feed role=log; composer aria-label — stage mode AND classic mode
// ============================================================================
{
  // stage mode
  const win = freshWin();
  const world = makeWorld(win);
  startFight(win, world);
  stubTheater(win);
  win.renderWorld();
  let host = win.document.getElementById("worldView");
  let feed = host.querySelector(".dm-feed");
  check("4a. .dm-feed carries role=log aria-live=polite (stage mode)",
    !!feed && feed.getAttribute("role") === "log" && feed.getAttribute("aria-live") === "polite");
  let action = host.querySelector("#dmAction");
  check("5a. #dmAction carries aria-label=\"Your action\" (stage mode)",
    !!action && action.getAttribute("aria-label") === "Your action");

  // classic mode (no fight)
  const win2 = freshWin();
  makeWorld(win2);
  win2.renderWorld();
  host = win2.document.getElementById("worldView");
  feed = host.querySelector(".dm-feed");
  check("4b. .dm-feed carries role=log aria-live=polite (classic mode)",
    !!feed && feed.getAttribute("role") === "log" && feed.getAttribute("aria-live") === "polite");
  action = host.querySelector("#dmAction");
  check("5b. #dmAction carries aria-label=\"Your action\" (classic mode)",
    !!action && action.getAttribute("aria-label") === "Your action");
  check("6d. the classic chat-col also carries aria-label=\"The DM\"",
    host.querySelector('.chat-col[aria-label="The DM"]') != null);
}

// ============================================================================
// 8. STAGE-TOGGLE — GS.stageCollapsed, GS-only, rail button, collapses the layout
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  startFight(win, world);
  stubTheater(win);
  win.renderWorld();
  let host = win.document.getElementById("worldView");
  check("8a. battle-stage mode is live pre-toggle (fixture sanity)", !!host.querySelector(".game.battle-stage"));
  const rail = host.querySelector(".game-rail");
  const toggleBtn = rail && Array.from(rail.querySelectorAll("button.rl")).find(b => /toggleStage\(\)/.test(b.getAttribute("onclick") || ""));
  check("8b. the rail carries a stage-toggle button wired to toggleStage()", !!toggleBtn);
  check("8c. GS.stageCollapsed starts false", win.GS.stageCollapsed === false);

  win.toggleStage();
  check("8d. toggleStage() flips GS.stageCollapsed to true (GS-only state)", win.GS.stageCollapsed === true);
  host = win.document.getElementById("worldView");
  check("8e. collapsing the stage falls back to the classic feed-hero branch (no .stage-col rendered)",
    !host.querySelector(".chat-col.stage-col"));
  check("8f. the feed is still fully present + reachable when collapsed", !!host.querySelector(".dm-feed") && !!host.querySelector("#dmAction"));

  win.toggleStage();
  check("8g. toggling back re-expands the stage (GS.stageCollapsed false again)", win.GS.stageCollapsed === false);
  host = win.document.getElementById("worldView");
  check("8h. the stage column is back", !!host.querySelector(".chat-col.stage-col"));
}

// ============================================================================
// 9. 760px BREAKPOINT — CSS forces the stage column hidden (stack forcing collapsed)
// ============================================================================
{
  const css = read("genesis.html");
  check("9. the 760px media query forces the stage column hidden",
    /@media\s*\(max-width:\s*760px\)\s*\{[^]*?\.stage-col\{[^}]*display:none/.test(css) ||
    /@media\(max-width:760px\)\{[^]*?\.stage-col\{[^}]*display:none/.test(css));
}

// ============================================================================
// 10. DICE OVERLAY ALIGNMENT — retargets to the feed column, not the board
// ============================================================================
{
  const diceSrc = read("src/ui/dice.js");
  check("10a. dice.js no longer hardcodes .chat-col alone as the alignment target",
    /panel-col\.stage-feed-col/.test(diceSrc), "dice.js should reference the stage-feed-col");

  // structural correctness (jsdom has no real layout, so we prove the SELECTOR resolves right,
  // not the pixel geometry): in stage mode, .panel-col.stage-feed-col is the true feed container;
  // .chat-col.stage-col holds the board and must NOT contain .dm-feed.
  const win = freshWin();
  const world = makeWorld(win);
  startFight(win, world);
  stubTheater(win);
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  const feedCol = host.querySelector(".panel-col.stage-feed-col");
  const stageCol = host.querySelector(".chat-col.stage-col");
  check("10b. the feed column (.panel-col.stage-feed-col) contains .dm-feed", !!(feedCol && feedCol.querySelector(".dm-feed")));
  check("10c. the stage column (.chat-col.stage-col) does NOT contain .dm-feed", !(stageCol && stageCol.querySelector(".dm-feed")));

  // classic mode: .chat-col IS the feed column (no regression — dice.js's fallback must still work)
  const win2 = freshWin();
  makeWorld(win2);
  win2.renderWorld();
  const host2 = win2.document.getElementById("worldView");
  const chatCol = host2.querySelector(".chat-col");
  check("10d. classic mode: .chat-col contains .dm-feed (the fallback target is correct)", !!(chatCol && chatCol.querySelector(".dm-feed")));
}

// ============================================================================
// 11. §9.11 MUTATION CHECK — prove the "no aria-hidden ancestor" assertion actually bites
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  startFight(win, world);
  stubTheater(win);
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  const stageCol = host.querySelector(".chat-col.stage-col");
  const prose = host.querySelector(".stage-prose");
  check("11a. (fixture) the clean tree's own prose is NOT caught (sanity: the check isn't vacuous)",
    !hasAriaHiddenAncestor(prose));

  // MUTATION: literally re-wrap .stage-prose back inside the hidden subtree, per the spec's own
  // instruction ("wrap .stage-prose back inside the hidden subtree -> your harness FAILS").
  const clone = prose.cloneNode(true);
  stageCol.appendChild(clone);
  check("11b. MUTATION: a .stage-prose re-nested inside the aria-hidden stage-col IS caught (fails the same assertion used in check 2b)",
    hasAriaHiddenAncestor(clone) === true);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
