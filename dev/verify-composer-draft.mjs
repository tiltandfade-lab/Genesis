/* Verify the composer-draft-preservation fix (docs/PLAYTEST-FINDINGS-0704.md finding #1) —
   full-app jsdom load, presentation only.

   Bug: renderWorld() rebuilds the ENTIRE #dmAction textarea markup on every call (the DOM node is
   swapped via host.innerHTML=...), and is invoked from ~55 call sites incl. async DM-response paths
   that can land while the player is mid-type — silently wiping an unsent draft. Confirmed 3x across
   playtests (SD-011 + rot1-attempt2 turns 11/12).

   Fix (src/world/render.js, top of renderWorld()): snapshot the live #dmAction's
   {value, selectionStart, selectionEnd, hadFocus} BEFORE the DOM is torn down; after the rebuilt DOM
   lands, if the new #dmAction exists AND the snapshot value was non-empty, restore value + selection
   and re-focus only if it had focus. dmSend() legitimately clears the textarea BEFORE its render
   lands (see dmSend() in src/world/dm.js) — an empty snapshot there is the correct, intentional
   state, NOT a bug this fix should paper over; check 3 below asserts exactly that stays true.

   Checks:
     1. RED-FIRST: typing into #dmAction then calling renderWorld() must NOT wipe the value.
     2. Selection + focus restore: cursor position and focus state survive the re-render too.
     3. Empty-snapshot case: a textarea that was already empty (dmSend()'s own clear-before-render
        constraint) stays empty after render — the guard must not manufacture text from nothing.
     4. Absence guards: renderWorld() must not throw when #dmAction doesn't exist on either side of
        the render (no world open case covers the "doesn't exist post-render" side structurally;
        this harness additionally drives the pre-render-absent case directly).

   Run:  node dev/verify-composer-draft.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.)

   MUTATION-TEST NOTE (recorded, not automated by this file): with the restore block in renderWorld()
   commented out, check 1 must go RED again. This was verified manually during authoring — see the
   report for the captured red/green transcript. Re-run manually to reconfirm:
     sed -n '/COMPOSER DRAFT PRESERVATION, restore half/,/^  }/p' src/world/render.js
   comment out the `if(dmActionSnapshot...) { ... }` body, re-run this harness (check 1 fails),
   restore the file, re-run (check 1 passes). */
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
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`, { runScripts: "dangerously", pretendToBeVisual: true });
  const win = dom.window;
  win.eval(harness + "\n" + src);
  return win;
}

function makeWorld(win) {
  const world = {
    id: "w-composertest", name: "The Composer Test World",
    seed: { master: { name: "Test Shrine", desc: "a place for asserting DOM" } },
    characters: [{ id: "c1", status: "living", name: "Ilyra Stonesong", headline: "a test soul", spark: "a test soul", pronouns: "she",
      sheet: {
        species: "Elf", class: "Wizard", background: "Sage", level: 3, xp: 400,
        hp: 20, hpCur: 14, ac: 13, tempHp: 0,
        profBonus: 2, scores: { int: 16 }, mods: { int: 3 }, saveProfs: ["int","wis"], skillProfs: ["Arcana"],
        passivePerception: 11, hitDie: "d6", gold: 10,
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: ["Fire Bolt"], spells: ["Magic Missile"],
        inventory: [], equipped: {},
      } }],
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
// 1. RED-FIRST: a re-render mid-type must not wipe the draft
// ============================================================================
{
  const win = freshWin();
  makeWorld(win);
  win.renderWorld();
  const ta = win.document.getElementById("dmAction");
  check("textarea exists after first render", !!ta);
  ta.value = "half-typed action";
  // simulate an async DM-response re-render landing mid-type (applyResponse/pollResponse call renderWorld()
  // with no relation to what the player is currently typing)
  win.renderWorld();
  const taAfter = win.document.getElementById("dmAction");
  check("CHECK 1 (red-first): draft survives a renderWorld() call mid-type",
    !!taAfter && taAfter.value === "half-typed action",
    `value="${taAfter && taAfter.value}"`);
}

// ============================================================================
// 2. Selection + focus restore
// ============================================================================
{
  const win = freshWin();
  makeWorld(win);
  win.renderWorld();
  const ta = win.document.getElementById("dmAction");
  ta.value = "attack the goblin";
  ta.focus();
  ta.setSelectionRange(3, 9);   // selects "tack t"
  check("focus + selection set before render", win.document.activeElement === ta && ta.selectionStart === 3 && ta.selectionEnd === 9);
  win.renderWorld();
  const taAfter = win.document.getElementById("dmAction");
  check("CHECK 2a: value restored", !!taAfter && taAfter.value === "attack the goblin");
  check("CHECK 2b: selection restored (start/end = 3/9)",
    !!taAfter && taAfter.selectionStart === 3 && taAfter.selectionEnd === 9,
    `start=${taAfter && taAfter.selectionStart} end=${taAfter && taAfter.selectionEnd}`);
  check("CHECK 2c: focus restored to the new node (re-focus only because it had focus)",
    win.document.activeElement === taAfter, `activeElement tag=${win.document.activeElement && win.document.activeElement.tagName}`);
}

// ============================================================================
// 3. Empty-snapshot case: dmSend()'s deliberate clear-before-render must stay cleared
// ============================================================================
{
  const win = freshWin();
  makeWorld(win);
  win.renderWorld();
  const ta = win.document.getElementById("dmAction");
  ta.value = "";   // dmSend() does exactly this (ta.value="") before its render lands
  check("textarea empty before render (simulating dmSend()'s clear)", ta.value === "");
  win.renderWorld();
  const taAfter = win.document.getElementById("dmAction");
  check("CHECK 3: empty snapshot stays empty after render (no phantom restore)",
    !!taAfter && taAfter.value === "", `value="${taAfter && taAfter.value}"`);
}

// ============================================================================
// 4. Absence guards: no #dmAction on the page at all must not throw
// ============================================================================
{
  const win = freshWin();
  // no world set up at all — activeWorld() is null, so renderWorld()'s early-return path fires with
  // no #dmAction ever having existed pre- or post-render.
  let threw = null;
  try { win.renderWorld(); } catch (e) { threw = e; }
  check("CHECK 4a: renderWorld() with no #dmAction anywhere (no active world) does not throw", threw === null, threw && threw.message);
  const html = win.document.getElementById("worldView").innerHTML;
  check("CHECK 4b: the no-world empty state still renders", /No world is open/.test(html));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
