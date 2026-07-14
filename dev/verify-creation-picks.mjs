/* Verify the "of your choice" creation picks — instruments / artisan tools / gaming set / languages.
   Loads EVERY module in manifest load order into one jsdom global scope (the const-via-eval gotcha:
   concat to one <script> so classic-script top-level consts share scope). Then drives the guided
   creator (bardo) for a Bard/Entertainer and asserts each generic grant is surfaced as a real pick,
   the 🎲 shortcut resolves them, and the picks persist onto the sheet + DM handoff digest.

   Run:  node dev/verify-creation-picks.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test". Override with JSDOM_HOME.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{},souls:[]}; var SEED=null;`;

const dom = new JSDOM(`<!doctype html><html><body><div id="bardoView"></div></body></html>`,
  { runScripts: "dangerously" });
const win = dom.window;
// top-level `const`s aren't global props and don't survive the eval scope; re-export the
// pick-lists onto a `var` (which DOES persist to the global object) within the same eval.
const exportTail = `\n;var __LISTS={INSTRUMENTS,ARTISAN_TOOLS,GAMING_SETS,STANDARD_LANGUAGES};`;
win.eval(harness + "\n" + src + exportTail);

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));
const { INSTRUMENTS, ARTISAN_TOOLS, GAMING_SETS, STANDARD_LANGUAGES } = win.__LISTS;

// Initialize creator state without startBardo() (which drives DOM panels absent here).
// Leave GS.BARDO null so the pick helpers' renderBardo() calls early-return.
const newCGEN = (over) => {
  win.GS.CGEN = { species:null, class:null, background:null, pronouns:"they", skills:[], kit:null,
    cantrips:[], spells:[], featPick:{skills:[],cantrips:[],spells:[]}, toolPicks:{}, languages:[], ...over };
  win.GS.BARDO = null;
  return win.GS;
};

// data lists loaded
check("pick-lists loaded",
  [INSTRUMENTS, ARTISAN_TOOLS, GAMING_SETS, STANDARD_LANGUAGES].every((a) => Array.isArray(a) && a.length));
check("Common excluded from language picks", STANDARD_LANGUAGES.indexOf("Common") < 0);

// ---- drive the bardo for a Bard + Entertainer (instrument from kit AND background) ----
const G = newCGEN({ species:"Human", class:"Bard", background:"Entertainer", kit:"A" }); // kit A grants "Musical Instrument (your choice)"

const picks = win.cgToolChoices();
const ids = picks.map((p) => p.id).sort();
check("Bard/Entertainer surfaces TWO instrument picks (kit + background)", picks.length === 2,
  JSON.stringify(ids));
check("  one is the background instrument", picks.some((p) => p.id === "bg-instrument"));
check("  one is the kit instrument", picks.some((p) => p.id.startsWith("kit-")));
check("not done before choosing", win.cgToolsDone() === false);

// 🎲 choose-for-me resolves every open pick
win.cgToolsAuto();
check("🎲 resolves all tool picks", win.cgToolsDone() === true, JSON.stringify(G.CGEN.toolPicks));
check("resolved values are real instruments",
  Object.values(G.CGEN.toolPicks).every((v) => INSTRUMENTS.indexOf(v) >= 0),
  JSON.stringify(G.CGEN.toolPicks));

// languages
check("no languages until chosen", G.CGEN.languages.length === 0);
win.cgLangToggle("Elvish"); win.cgLangToggle("Draconic"); win.cgLangToggle("Orc"); // 3rd ignored (cap 2)
check("language pick caps at 2", G.CGEN.languages.length === 2, G.CGEN.languages.join(","));
win.cgLangAuto();
check("🎲 fills exactly 2 distinct standard languages",
  G.CGEN.languages.length === 2 && new Set(G.CGEN.languages).size === 2 &&
  G.CGEN.languages.every((l) => STANDARD_LANGUAGES.indexOf(l) >= 0), G.CGEN.languages.join(","));

// ---- persistence onto the sheet (cgSheetExtras) ----
const ex = win.cgSheetExtras();
check("sheet.tool resolved to a real instrument (background generic gone)",
  INSTRUMENTS.indexOf(ex.tool) >= 0 && ex.tool.toLowerCase() !== "musical instrument", ex.tool);
check("sheet.languages persisted", Array.isArray(ex.languages) && ex.languages.length === 2);
// ex.inventory entries are now ITEMS instances ({id,name,conditions}) — read .name (docs/ITEMS.md)
check("kit inventory generic resolved (no 'your choice' left)",
  !ex.inventory.some((it) => /your choice/i.test(it.name)), JSON.stringify(ex.inventory));
check("kit inventory now contains a real instrument",
  ex.inventory.some((it) => INSTRUMENTS.indexOf(it.name) >= 0), JSON.stringify(ex.inventory));

// ---- Guild Artisan → artisan's tools; Noble → gaming set ----
const G2 = newCGEN({ class:"Fighter", background:"Guild Artisan", kit:"A" });
const ap = win.cgToolChoices();
check("Guild Artisan surfaces artisan's-tools pick", ap.some((p) => p.id === "bg-artisan"));
win.cgToolsAuto();
check("artisan pick resolves to a real artisan's tool",
  ARTISAN_TOOLS.indexOf(G2.CGEN.toolPicks["bg-artisan"]) >= 0, G2.CGEN.toolPicks["bg-artisan"]);

newCGEN({ class:"Fighter", background:"Noble", kit:"A" });
check("Noble surfaces gaming-set pick", win.cgToolChoices().some((p) => p.id === "bg-gaming"));

// ---- Monk kit "Artisan's Tools or Musical Instrument" union ----
newCGEN({ class:"Monk", background:"Soldier", kit:"A" }); // Soldier has no generic tool
const mp = win.cgToolChoices();
const kitPick = mp.find((p) => p.id.startsWith("kit-"));
check("Monk kit surfaces a tool-or-instrument pick", !!kitPick);
check("  its options are artisan tools + instruments",
  kitPick && kitPick.options.length === ARTISAN_TOOLS.length + INSTRUMENTS.length);

// ---- a background with a fully-specific tool surfaces NO generic pick ----
newCGEN({ class:"Rogue", background:"Criminal", kit:"A" }); // no generic tool, no generic kit item
check("Criminal/Rogue surfaces zero generic picks", win.cgToolChoices().length === 0);

// ---- render path: renderBardo() actually paints the new steps without throwing ----
const renderStep = (t) => {
  win.GS.BARDO = { seq:[{t:"tools"},{t:"languages"}], i: t==="tools"?0:1, rolled:{}, rerolls:3, passage:0 };
  win.renderBardo();
  return win.document.getElementById("bardoView").innerHTML;
};
newCGEN({ class:"Bard", background:"Entertainer", kit:"A" });
let html = "";
let threw = false;
try { html = renderStep("tools"); } catch (e) { threw = true; html = String(e); }
check("renderBardo paints the tools step", !threw && /choose for me/.test(html) && /instrument/i.test(html), html.slice(0,120));

try { html = renderStep("languages"); } catch (e) { threw = true; html = String(e); }
check("renderBardo paints the languages step", !threw && /Choose 2/.test(html) && /Common/.test(html), html.slice(0,120));

// a class+background with no generic tools shows the graceful "nothing more" note
newCGEN({ class:"Rogue", background:"Criminal", kit:"A" });
try { html = renderStep("tools"); threw=false; } catch (e) { threw = true; html = String(e); }
check("tools step degrades gracefully when nothing to pick", !threw && /nothing more to choose/i.test(html), html.slice(0,120));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
