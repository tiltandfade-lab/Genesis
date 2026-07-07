/* verify-spell-lists.mjs — headless test for HQ2-8a (docs/HOTFIX-QUEUE-2026-07-07.md): the one
   spellListsOf(sh) helper (src/engine/resources.js) replaces 4 independent base+feat spell-list
   merge sites (spellDigest, render.js's caster-check x2, render.js's renderSpellPanel) — deduped
   EVERYWHERE now (the digest already deduped; the live Spells tab did not, before this unit).

   RED-FIRST proof (spec's regression check 1): a sheet with an origin-feat cantrip that OVERLAPS a
   class cantrip by name — reachable in play (bardo.js's feat picker doesn't filter known cantrips,
   unlike levelup.js's) — used to render TWICE in the live Spells tab card grid while spellDigest(sh)
   still deduped it to ONCE. Post-fix both agree: exactly once.

   Loads EVERY module in manifest load order (+ tables.js) into one jsdom global scope — same
   "const-via-eval" pattern as dev/verify-walk-refresh.mjs (jsdom resolved per CLAUDE.md
   "headless test"; override JSDOM_HOME if not at ~/.genesis-jsdom).
   Run: node dev/verify-spell-lists.mjs   (from repo root) */
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

function freshDom(){
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`, { runScripts: "dangerously" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", String(detail)));

// a caster sheet whose origin feat grants a cantrip ALSO already known from class (the overlap
// bardo.js's feat picker permits — the reachable real-world case the finding flagged).
const sh = {
  species: "Human", class: "Wizard", background: "Sage", level: 3, hp: "16/16", ac: 12,
  profBonus: 2, scores: {}, mods: { int: 3 }, saveProfs: ["int", "wis"], skillProfs: ["Arcana"],
  cantrips: ["Fire Bolt", "Mage Hand"], featCantrips: ["Fire Bolt"],
  spells: ["Magic Missile"], featSpells: [],
  slotsMax: [2], slots: [2],
};
const cur = { name: "Tester", sheet: sh };

{ const win = freshDom();
  // 1. spellListsOf(sh) itself dedupes (the source of truth both digest and UI now share).
  const lists = win.spellListsOf(sh);
  check("1. spellListsOf(sh).cantrips dedupes the overlapping 'Fire Bolt' to exactly one entry",
    lists.cantrips.filter(n => n === "Fire Bolt").length === 1 && lists.cantrips.length === 2,
    JSON.stringify(lists.cantrips));

  // 2. spellDigest(sh) — unchanged contract, still deduped (was already the case pre-unit).
  const digest = win.spellDigest(sh);
  check("2. spellDigest(sh).cantrips still contains 'Fire Bolt' exactly once (unchanged)",
    digest && digest.cantrips.filter(n => n === "Fire Bolt").length === 1,
    JSON.stringify(digest));

  // 3 (RED-FIRST). renderSpellPanel(w,cur) — the live Spells tab — now renders 'Fire Bolt' exactly
  // once too (pre-fix: rendered twice via the un-deduped [].concat(cantrips,featCantrips)).
  const html = win.renderSpellPanel({}, cur);
  const occurrences = (html.match(/Fire Bolt/g) || []).length;
  check("3. renderSpellPanel's HTML shows 'Fire Bolt' exactly once (pre-fix: twice)",
    occurrences === 1, `occurrences=${occurrences}`);

  // 4. the caster-presence checks (renderPowers/renderActionsPanel) agree via the same helper —
  // a caster sheet is still recognized as a caster (truthiness unaffected by dedup).
  const listsAgain = win.spellListsOf(sh);
  const casterTrue = !!(listsAgain.cantrips.length || listsAgain.spells.length);
  check("4. a caster sheet is still recognized as a caster via spellListsOf (truthiness unaffected by dedup)",
    casterTrue === true, `casterTrue=${casterTrue}`);

  // 5. a martial (no spells at all) — spellListsOf returns empty arrays, spellDigest still null.
  const martial = { cantrips: [], featCantrips: [], spells: [], featSpells: [] };
  const martialLists = win.spellListsOf(martial);
  const martialDigest = win.spellDigest(martial);
  check("5. a martial sheet: spellListsOf returns {cantrips:[],spells:[]}, spellDigest(sh) is null",
    martialLists.cantrips.length === 0 && martialLists.spells.length === 0 && martialDigest === null,
    JSON.stringify({ martialLists, martialDigest }));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
