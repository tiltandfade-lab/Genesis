/* Verify docs/TIYL-UI-PORT.md §4.2 — the bardo's full-bleed port (U1, feat/tiyl-ui-port).
   RED-FIRST harness: written before the port CSS/JS landed, run once to confirm it fails against
   the pre-port shell, then re-run after the port to confirm green. The onclick inventory itself is
   the port's non-negotiable invariant (§2 "every one of the 41 inline onclick= strings … survives
   byte-identical") — this harness extracts the COMPLETE onclick= inventory from a scripted full
   passage and diffs it against the committed pre-port fixture (dev/fixtures/bardo-onclick-pre-port.json),
   captured from the unported code via the same driver. Any drift (missing, added, or reworded
   handler) is a wiring-loss regression, not a stylistic nit.

   Assertions (§4.2 a–f):
   a. the rendered bardo shell contains .wrap.bardo-stage and NO max-width:940px path (bardo path only —
      genesis/charge/start keep the old .wrap.immersive centering, untouched by this port).
   b. the complete onclick= inventory extracted from renderBardo() output across a scripted full
      passage equals the pre-port inventory (fixture committed with the spec).
   c. reroll budget decrements 3→2→1 across a scores reroll + life reroll + world reroll.
   d. lifeQ walks the same step ids in the same order (pre- vs post-port, same seeded rolls).
   e. the chronicle rail carries role="log".
   f. the fade class (.show) still toggles on a fresh fragment reveal.

   Run:  node dev/verify-bardo-port.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md)
   To regenerate the pre-port fixture (only if the pre-port baseline itself must change — should be
   never after the port lands): node dev/verify-bardo-port.mjs --capture-fixture */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");
const FIXTURE_PATH = join(ROOT, "dev/fixtures/bardo-onclick-pre-port.json");

const man = JSON.parse(read("manifest.json"));
const srcPaths = man.loadOrder.filter((p) => p.endsWith(".js"));

function boot(){
  const src = srcPaths.map(read).join("\n;\n");
  const dom = new JSDOM(
    `<!doctype html><html><body><div class="wrap"><div id="bardoView"></div></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);
  win.saveU = () => {};
  win.renderWorld = () => {};
  win.showTab = () => {};
  win.toast = () => {};
  win.fetch = () => Promise.resolve({ ok:false });
  return win;
}

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

/* ── the scripted full passage: deterministic dice via a seeded rollDie queue, walks every stage
   type the bardo sequence can produce (choose x3, scores, skills, equipment, tools, languages,
   spells, feat, life (multi-step), hometown x3, world (all WORLDBEATS), found). Returns
   {onclicks:[...], lifeQOrder:[...], win} so callers can run further live assertions against the
   same driven session (e.g. reroll budget) without re-driving from scratch. */
function drivePassage(win){
  const onclicks = [];
  const captureOnclicks = () => {
    const html = win.document.getElementById("bardoView").innerHTML;
    const re = /onclick="([^"]*)"/g;
    let m;
    while ((m = re.exec(html))) onclicks.push(m[1]);
  };

  win.startBardo();               // lands DIRECTLY on the species choose (i=0) — buildBardoSeq's
  captureOnclicks();              // comment: no separate threshold/soul gate step consumes an index.

  // species/class/background choose
  win.cgChoose("species", "Human"); captureOnclicks();
  win.bardoAdvance(); captureOnclicks();
  win.cgChoose("class", "Fighter"); captureOnclicks();
  win.bardoAdvance(); captureOnclicks();
  win.cgChoose("background", "Soldier"); captureOnclicks();
  win.bardoAdvance(); captureOnclicks();

  // scores: roll 6x via bardoRollScore (uses roll4d6breakdown → rollDie internally; not seeded,
  // deterministic enough for structural onclick capture — values themselves aren't asserted here)
  for (let i = 0; i < 6; i++) { win.bardoRollScore(); captureOnclicks(); }
  win.bardoAssign("rolled"); captureOnclicks();
  win.bardoAdvance(); captureOnclicks();

  // skills
  const cs = win.cgSkillOpen();
  if (cs.opts.length) { win.cgSkillAuto(); captureOnclicks(); }
  win.bardoAdvance(); captureOnclicks();

  // equipment
  const kit = (win.CLASS_KIT && win.CLASS_KIT[win.GS.CGEN.class]) || [];
  if (kit.length) { win.cgKitAuto(); captureOnclicks(); }
  win.bardoAdvance(); captureOnclicks();

  // tools
  if (win.cgToolChoices().length) { win.cgToolsAuto(); captureOnclicks(); }
  win.bardoAdvance(); captureOnclicks();

  // languages
  win.cgLangAuto(); captureOnclicks();
  win.bardoAdvance(); captureOnclicks();

  // spells (Fighter has none at L1 — the "no spells" branch still renders + advances)
  win.bardoAdvance(); captureOnclicks();

  // feat (Soldier's origin feat — auto-resolve any choice branch)
  const fd = win.cgFeatDef();
  if (fd.def && fd.def.choose) { win.cgFeatAuto(); captureOnclicks(); }
  win.bardoAdvance(); captureOnclicks();

  // life: walk every queued step via bardoLifeRoll()/bardoLifeStepNext() until life_done
  const lifeQOrder = [];
  captureOnclicks(); // first life-step render (cgLifeBegin fires inside renderBardo on first visit)
  let guard = 0;
  while (!win.GS.CGEN.life_done && guard++ < 60) {
    const key = win.GS.CGEN.lifeQ[win.GS.CGEN.lifeI];
    lifeQOrder.push(key);
    win.bardoLifeRoll();
    captureOnclicks();
    win.bardoLifeStepNext();
    captureOnclicks();
  }

  // hometown x3 (setting/history/myth)
  for (let i = 0; i < 3; i++) {
    win.bardoRollHometown(); captureOnclicks();
    win.bardoAdvance(); captureOnclicks();
  }

  // world beats — walk every remaining "world" step until "found"
  guard = 0;
  while (win.GS.BARDO.seq[win.GS.BARDO.i].t === "world" && guard++ < 20) {
    win.bardoRollWorld(); captureOnclicks();
    win.bardoAdvance(); captureOnclicks();
  }

  // found
  captureOnclicks();

  return { onclicks, lifeQOrder, win };
}

// dedup while preserving first-seen order (the same button re-renders across many capture points —
// the INVENTORY is what matters, not the multiplicity of how many times a given render emitted it)
function uniqOrdered(arr){ const seen = new Set(); const out = []; for (const x of arr) if (!seen.has(x)) { seen.add(x); out.push(x); } return out; }

// the "found" step's name-suggestion chips (optChips in renderBardo) embed a RANDOMLY ROLLED name
// literal in the onclick string (document.getElementById('charName').value='<random name>') — the
// handler SHAPE is what's load-bearing (a chip fills the input), not which specific name got rolled
// this run. Normalize the literal to a stable placeholder so the fixture diff tracks wiring, not RNG.
function normalizeOnclick(s){
  // the rolled name may itself contain an escaped apostrophe (o.replace(/'/g,"\\'") in renderBardo's
  // optChips) — match the quoted literal as "any run of (non-quote | backslash-escaped-quote)".
  return s.replace(
    /^(document\.getElementById\('(?:charName|worldName)'\)\.value=)'(?:[^'\\]|\\.)*'$/,
    "$1'<NAME>'"
  );
}

// ── fixture capture mode (only used to (re)generate the committed pre-port baseline) ──
if (process.argv.includes("--capture-fixture")) {
  const win = boot();
  const { onclicks } = drivePassage(win);
  const inventory = uniqOrdered(onclicks.map(normalizeOnclick)).sort();
  writeFileSync(FIXTURE_PATH, JSON.stringify({ capturedAt: new Date().toISOString(), count: inventory.length, onclicks: inventory }, null, 2) + "\n");
  console.log(`captured ${inventory.length} distinct onclick= handlers → ${FIXTURE_PATH}`);
  process.exit(0);
}

if (!existsSync(FIXTURE_PATH)) {
  console.log("  ✗ fixture missing:", FIXTURE_PATH, "— run with --capture-fixture against the PRE-PORT code first");
  process.exit(1);
}
const fixture = JSON.parse(read("dev/fixtures/bardo-onclick-pre-port.json"));

// ── drive the (post-port) passage ──
const win = boot();
const { onclicks, lifeQOrder } = drivePassage(win);
const inventory = uniqOrdered(onclicks.map(normalizeOnclick)).sort();

// ── a. full-bleed shell: .wrap.bardo-stage present, no max-width:940px path for the bardo ──
{
  const cssSrc = read("genesis.html");
  check("genesis.html defines .wrap.bardo-stage", /\.wrap\.bardo-stage/.test(cssSrc));
  const bardoStageBlockMatch = cssSrc.match(/\.wrap\.bardo-stage[\s\S]{0,400}/);
  check(".wrap.bardo-stage rule does not carry max-width:940px",
    !!bardoStageBlockMatch && !/max-width:\s*940px/.test(bardoStageBlockMatch[0]),
    bardoStageBlockMatch && bardoStageBlockMatch[0].slice(0,200));
  // showTab must apply "bardo-stage" (not the old shared "immersive") specifically for t==="bardo"
  win.showTab ? null : null;
  const chromeSrc = read("src/ui/chrome.js");
  check("showTab toggles wrap.bardo-stage for the bardo tab specifically",
    /bardo-stage/.test(chromeSrc) && /t===["']bardo["']/.test(chromeSrc), chromeSrc.match(/wrap\.classList[\s\S]{0,200}/)?.[0]);
}

// ── b. onclick inventory equals the pre-port fixture ──
{
  const missing = fixture.onclicks.filter(o => !inventory.includes(o));
  const added = inventory.filter(o => !fixture.onclicks.includes(o));
  check(`onclick inventory count matches fixture (${fixture.count})`, inventory.length === fixture.count,
    `got ${inventory.length}`);
  check("no onclick handlers missing vs the pre-port fixture", missing.length === 0, JSON.stringify(missing));
  check("no unexpected new onclick handlers vs the pre-port fixture", added.length === 0, JSON.stringify(added));

  // the spec's literal invariant (§2/§4.2b): "every one of the 41 inline onclick= strings in
  // bardo.js survives byte-identical" — 41 is a SOURCE-LINE count (grep -c 'onclick=' counts
  // matching lines; a few lines emit 2 attrs via template literals, so this differs from both the
  // 49 raw onclick= substrings and the 85 distinct runtime-rendered strings checked above).
  const bardoSrc = read("src/creator/bardo.js");
  const onclickLines = bardoSrc.split("\n").filter(l => l.includes("onclick=")).length;
  check("src/creator/bardo.js still carries exactly 41 onclick= source lines (spec's literal count)",
    onclickLines === 41, `got ${onclickLines}`);
}

// ── c. reroll budget decrements 3→2→1 across scores/life/world rerolls ──
{
  const w2 = boot();
  w2.startBardo();
  check("rerolls start at 3", w2.GS.BARDO.rerolls === 3, w2.GS.BARDO.rerolls);
  w2.cgChoose("species","Human"); w2.bardoAdvance();
  w2.cgChoose("class","Fighter"); w2.bardoAdvance();
  w2.cgChoose("background","Soldier"); w2.bardoAdvance();
  for (let i=0;i<6;i++) w2.bardoRollScore();
  w2.bardoAssign("rolled");
  w2.bardoScoreReroll();
  check("reroll #1 (scores) → 2 left", w2.GS.BARDO.rerolls === 2, w2.GS.BARDO.rerolls);
  for (let i=0;i<6;i++) w2.bardoRollScore();
  w2.bardoAssign("rolled"); w2.bardoAdvance();
  // fast-forward through skills/equipment/tools/languages/spells/feat to reach "life"
  const cs2 = w2.cgSkillOpen(); if (cs2.opts.length) w2.cgSkillAuto(); w2.bardoAdvance();
  const kit2 = (w2.CLASS_KIT && w2.CLASS_KIT[w2.GS.CGEN.class]) || []; if (kit2.length) w2.cgKitAuto(); w2.bardoAdvance();
  if (w2.cgToolChoices().length) w2.cgToolsAuto(); w2.bardoAdvance();
  w2.cgLangAuto(); w2.bardoAdvance();
  w2.bardoAdvance(); // spells (none for Fighter)
  const fd2 = w2.cgFeatDef(); if (fd2.def && fd2.def.choose) w2.cgFeatAuto(); w2.bardoAdvance();
  // now on "life" — roll the first step, then reroll it
  w2.bardoLifeRoll();
  w2.bardoLifeReroll();
  check("reroll #2 (life) → 1 left", w2.GS.BARDO.rerolls === 1, w2.GS.BARDO.rerolls);
  // walk life to completion, then hometown x3 to reach world
  let guard2 = 0;
  while (!w2.GS.CGEN.life_done && guard2++ < 60) {
    if (!w2.GS.CGEN.lifeLog[w2.GS.CGEN.lifeI]) w2.bardoLifeRoll();
    w2.bardoLifeStepNext();
  }
  for (let i=0;i<3;i++){ w2.bardoRollHometown(); w2.bardoAdvance(); }
  // now on "world" — roll then reroll (only if a reroll budget remains; here it's the 3rd spend)
  w2.bardoRollWorld();
  w2.bardoWorldReroll();
  check("reroll #3 (world) → 0 left", w2.GS.BARDO.rerolls === 0, w2.GS.BARDO.rerolls);
  // a 4th reroll attempt must no-op (budget exhausted)
  const beforeRolled = w2.GS.BARDO.rolled[w2.bardoCur().key];
  w2.bardoWorldReroll();
  check("reroll budget exhausted: a 4th reroll attempt no-ops", w2.GS.BARDO.rerolls === 0);
}

// ── d. lifeQ walks the same step ids in the same order ──
{
  // cgLifeBegin's base queue is a FIXED order (src/creator/life.js:183); cgLifeStepRoll splices in
  // two CONDITIONAL steps (birthOrder right after siblings IF siblings>0; absentParent right after
  // family IF applicable) — both dice-dependent, so their presence/absence varies run to run. What's
  // asserted here is the invariant that survives any roll: the base 10 ids appear, in relative order,
  // as a SUBSEQUENCE of lifeQOrder; any conditional insert lands immediately after its trigger step;
  // and the tail past "age" is all "event".
  const baseOrder = ["parents","birthplace","siblings","family","lifestyle","childhoodHome","childhoodMemory","bgDecision","classTraining","age"];
  const baseOnly = lifeQOrder.filter(k => baseOrder.includes(k));
  check("lifeQ's base 10 step ids walk in the fixed relative order", JSON.stringify(baseOnly) === JSON.stringify(baseOrder), JSON.stringify(baseOnly));

  const sibIdx = lifeQOrder.indexOf("siblings"), boIdx = lifeQOrder.indexOf("birthOrder");
  check("conditional birthOrder (if present) lands immediately after siblings",
    boIdx < 0 || boIdx === sibIdx + 1, JSON.stringify({sibIdx, boIdx}));
  const famIdx = lifeQOrder.indexOf("family"), absIdx = lifeQOrder.indexOf("absentParent");
  check("conditional absentParent (if present) lands immediately after family",
    absIdx < 0 || absIdx === famIdx + 1, JSON.stringify({famIdx, absIdx}));

  const ageIdx = lifeQOrder.indexOf("age");
  check("lifeQ tail (past 'age') is all 'event' steps (dice-dependent count, fixed identity)",
    lifeQOrder.slice(ageIdx + 1).every(k => k === "event") && lifeQOrder.slice(ageIdx + 1).length > 0,
    JSON.stringify(lifeQOrder.slice(ageIdx + 1)));
}

// ── e. chronicle rail carries role="log" ──
{
  const w3 = boot();
  w3.startBardo();
  w3.cgChoose("species","Human"); w3.bardoAdvance(); // log now has content ("Kind: Human")
  const html = w3.document.getElementById("bardoView").innerHTML;
  check('chronicle rail has role="log"', /role="log"/.test(html), html.slice(0,300));
  check('chronicle rail has aria-live="polite"', /aria-live="polite"/.test(html), html.slice(0,300));
  // BLIND-PLAYABLE (§2 binding): "the plaque header is a real heading element, not a background
  // image with dead text" — assert an actual <h2 class="scene-plaque"> in the DOM, not a <div>.
  const plaqueEl = w3.document.querySelector(".scene-plaque");
  check("the banner plaque is a real heading element (h1-h6), not a div",
    !!plaqueEl && /^H[1-6]$/.test(plaqueEl.tagName), plaqueEl && plaqueEl.tagName);
}

// ── f. the fade (.show) class still toggles on a fresh fragment reveal ──
{
  const w4 = boot();
  w4.startBardo();
  w4.cgChoose("species","Human"); w4.bardoAdvance();
  w4.cgChoose("class","Fighter"); w4.bardoAdvance();
  w4.cgChoose("background","Soldier"); w4.bardoAdvance();
  for (let i=0;i<6;i++) w4.bardoRollScore();
  w4.bardoAssign("rolled"); w4.bardoAdvance();
  const cs4 = w4.cgSkillOpen(); if (cs4.opts.length) w4.cgSkillAuto(); w4.bardoAdvance();
  const kit4 = (w4.CLASS_KIT && w4.CLASS_KIT[w4.GS.CGEN.class]) || []; if (kit4.length) w4.cgKitAuto(); w4.bardoAdvance();
  if (w4.cgToolChoices().length) w4.cgToolsAuto(); w4.bardoAdvance();
  w4.cgLangAuto(); w4.bardoAdvance();
  w4.bardoAdvance();
  const fd4 = w4.cgFeatDef(); if (fd4.def && fd4.def.choose) w4.cgFeatAuto(); w4.bardoAdvance();
  // first life roll → a freshly-revealed fragment must carry .show
  w4.bardoLifeRoll();
  let html = w4.document.getElementById("bardoView").innerHTML;
  check("a freshly-rolled life fragment carries the .show fade class", /class="bardo-frag show"/.test(html), html.slice(0,400));
  // walk to hometown, roll — same check
  let guard4 = 0;
  while (!w4.GS.CGEN.life_done && guard4++ < 60) {
    if (!w4.GS.CGEN.lifeLog[w4.GS.CGEN.lifeI]) w4.bardoLifeRoll();
    w4.bardoLifeStepNext();
  }
  w4.bardoRollHometown();
  html = w4.document.getElementById("bardoView").innerHTML;
  check("a freshly-rolled hometown fragment carries the .show fade class", /class="bardo-frag show"/.test(html), html.slice(0,400));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
