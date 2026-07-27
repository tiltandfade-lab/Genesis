/* ============================================================================
   OPENING REGISTER — 12-START ACCEPTANCE BATCH (V6, OPENING-REGISTER-BUILD.md §4).

   Re-runs the 2026-07-26 `docs/intel/tiyl-starts.md` 12-start batch protocol (one PC per
   class, the full roster) against the BUILT register, to show the monoculture the original
   batch found (12/12 settlement opens, 11/12 calm arrivals) is now visibly broken.

   Drives, per start: the full "This Is Your Life" chain (cgRollLife) + the bardo hometown/
   Master-Setting beats (rollTable place-master-setting/-history/-mythology) + the
   world-genesis STAGES loop (lookup master/smell/sound/arch/taboo/nearby/myth/faction/
   pressure) + bindWorld() + cgBind() (which itself calls rollEntry(w,c) — now rolling the
   Opening Register FIRST, upstream of the why/foot/standing triplet).

   Loading pattern copied from the proven scratchpad `tiyl-runner.mjs` (jsdom + manifest.json
   loadOrder + tables.js technique, itself copied from dev/playtest-bridgeless.mjs and
   dev/verify-place-tiyl.mjs). No seeded RNG — real Math.random per run (never assert fixed
   positions; seeded streams diverge across node versions anyway, per CLAUDE.md).

   Run:  node dev/acceptance-opening-register.mjs
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
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{},souls:[]}; var SEED=null;`;

const DOM_HTML = `<!doctype html><html><body>
  <div id="worldView"></div><div id="toast"></div><div id="stages"></div>
  <div id="bindbar"></div><input id="worldName"><input id="cgName"><input id="charName">
  <div class="modal-bg" id="bardoModal"><div class="modal"><div id="bardoBody"></div></div></div>
</body></html>`;

const STUBS = ["renderWorld","wakeReveal","postState","saveU","toast","showTab","dieRoll",
  "animateDie","streamDMText","diceOverlay","renderCharge","renderBardo","renderShelf",
  "dmBridgeDown","renderCodexPanel","renderMap","paintCard","renderShelfSouls"];

function boot() {
  const dom = new JSDOM(DOM_HTML, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  const EXPOSE = ["STAGES","SPECIES","CLASSES","BACKGROUNDS","CLASS_SKILLS","CLASS_KIT",
    "CLASS_CASTING","ABIL","ALL_SKILLS","SPELLS_SLIM","SS","EB"];
  const expose = ";" + EXPOSE.map(n => `try{window.${n}=${n};}catch(e){}`).join("");
  win.eval(harness + "\n" + srcText + "\n" + expose);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  for (const n of STUBS) { try { win.eval(`typeof ${n}==="function" && (${n}=function(){});`); } catch (_) {} }
  win.eval(`sendTurn=function(action,rolls){ return Promise.resolve("t-stub"); };`);
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false, telemetry: [] };
  win.GS.combat = null; win.GS.chase = null; win.GS.gamePanel = null; win.GS.prevPanel = undefined;
  win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  return win;
}

// the 12 starts — one per class (the full roster), species/background varied for spread.
// IDENTICAL roster to the 2026-07-26 tiyl-runner.mjs batch, so this is an honest re-run.
const BRIEFS = [
  { species: "Human",     class: "Fighter",  background: "Soldier" },
  { species: "Elf",       class: "Wizard",   background: "Sage" },
  { species: "Dwarf",     class: "Cleric",   background: "Acolyte" },
  { species: "Halfling",  class: "Rogue",    background: "Criminal" },
  { species: "Tiefling",  class: "Warlock",  background: "Hermit" },
  { species: "Orc",       class: "Barbarian",background: "Outlander" },
  { species: "Gnome",     class: "Bard",     background: "Entertainer" },
  { species: "Goliath",   class: "Paladin",  background: "Noble" },
  { species: "Dragonborn",class: "Sorcerer", background: "Charlatan" },
  { species: "Human",     class: "Druid",    background: "Folk Hero" },
  { species: "Elf",       class: "Ranger",   background: "Sailor" },
  { species: "Halfling",  class: "Monk",     background: "Urchin" },
];

function runOne(brief, idx) {
  const win = boot();
  const { GS } = win;

  // ---- 1) character picks (species/class/background), scores, skills, kit, spells ----
  GS.CGEN = {
    species: brief.species, class: brief.class, background: brief.background,
    pronouns: "they", name: win.randomCharName(brief.species),
    skills: [], languages: [], cantrips: [], spells: [],
    featPick: { skills: [], cantrips: [], spells: [] }, toolPicks: {}, lifeGold: 0, life: null,
  };
  win.cgRollScores();
  const cs = win.CLASS_SKILLS[brief.class];
  if (cs) GS.CGEN.skills = cs.from === "all" ? win.ALL_SKILLS.slice(0, cs.n) : cs.from.slice(0, cs.n);
  const kits = win.CLASS_KIT[brief.class];
  if (kits && kits.length) GS.CGEN.kit = kits[0].id;
  if (win.CLASS_CASTING && win.CLASS_CASTING[brief.class]) win.cgSpellsAuto();

  // ---- 2) the TIYL life chain, in full ----
  win.cgRollLife();

  // ---- 3) the bardo hometown beats ----
  const htSetting = win.rollTable("place-master-setting");
  const htHistory = win.rollTable("place-history");
  const htMyth = win.rollTable("place-mythology");

  // ---- 4) the world-genesis STAGES loop ----
  GS.SEED = {};
  for (const s of win.STAGES) {
    if (s.triad) {
      const draw = (avoid) => { let r, t = 0; do { r = win.lookup(s.t); t++; } while (avoid.some(x => x && x.name === r.name) && t < 8); return r; };
      const aa = draw([]); const bb = draw([aa]); GS.SEED[s.key] = [aa, bb];
      GS.SEED.nearby = [aa, bb];
    } else {
      GS.SEED[s.key] = win.lookup(s.t);
    }
  }
  GS.SEED.ht_setting = htSetting; GS.SEED.ht_history = htHistory; GS.SEED.ht_myth = htMyth;

  // ---- 5) bind the world, then the character (cgBind runs rollEntry(w,c) internally,
  //         which now rolls the Opening Register FIRST). ----
  win.document.getElementById("worldName").value = "";
  win.bindWorld();
  const w = win.activeWorld();
  win.cgBind();
  const c = w.characters[w.characters.length - 1];

  return {
    idx, class: brief.class, species: brief.species, background: brief.background,
    charName: c.name,
    bornWhere: c.bornWhere,
    entry: c.entry && {
      why: c.entry.why, foot: c.entry.foot, standing: c.entry.standing,
      standingFaction: c.entry.standingFaction,
      register: c.entry.register,
    },
  };
}

const results = [];
for (let i = 0; i < BRIEFS.length; i++) {
  try {
    results.push(runOne(BRIEFS[i], i));
  } catch (e) {
    results.push({ idx: i, brief: BRIEFS[i], error: String((e && e.stack) || e) });
  }
}

// ---- tally + the deliverable table ----
const bandCounts = { settled: 0, edge: 0, medias: 0, wrong: 0, mythic: 0 };
const rows = results.map(r => {
  if (r.error) return `| ${r.idx} | ${r.class} | (error) | — | — | — |`;
  const reg = r.entry.register;
  if (reg && Object.prototype.hasOwnProperty.call(bandCounts, reg.band)) bandCounts[reg.band]++;
  const bandLabel = reg ? reg.band : "(absent)";
  const situation = reg && reg.situation ? reg.situation.text : "—";
  const triplet = `${r.entry.why}; ${r.entry.foot}; to ${r.entry.standingFaction} ${r.entry.standing}`;
  return `| ${r.idx} | ${r.class} | ${r.bornWhere} | ${bandLabel} | ${situation} | ${triplet} |`;
}).join("\n");

const table =
`| # | class | bornWhere | band | situation | why / foot / standing |\n` +
`|---|---|---|---|---|---|\n` +
rows;

console.log("OPENING REGISTER — 12-start acceptance batch (re-run of the 2026-07-26 protocol)\n");
console.log(table);
console.log("\nBand tally (n=12):", JSON.stringify(bandCounts));
const bandsPresent = Object.keys(bandCounts).filter(k => bandCounts[k] > 0);
console.log("Distinct bands present:", bandsPresent.length, "of 5 —", bandsPresent.join(", "));
console.log(bandsPresent.length > 1
  ? "MONOCULTURE BROKEN — more than one opening register band appears across the 12 starts."
  : "STILL A MONOCULTURE — only one band appeared; investigate before claiming acceptance.");

process.stdout.write("\n__RESULTS_JSON__\n" + JSON.stringify(results, null, 2) + "\n");
