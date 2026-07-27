/* Verify the Opening Register (feat/opening-register, docs/OPENING-REGISTER-BUILD.md +
   docs/TIYL-START-DIVERSITY.md — Adam's 2026-07-27 ruling: weights 25/25/30/15/5 locked, no
   player lean, WRONG realm-honest, MYTHIC permanence allowed).

   rollEntry(w,c) (src/engine/world-gen.js) gains a FIRST-LINE d100 register roll
   (SS.eRegister) that decides how hot/strange minute zero is, upstream of the existing
   why/foot/standing triplet. Hot bands (edge/medias/wrong/mythic) additionally roll a small
   situation table (SS.eNowMedias/eNowWrong/eNowMythic) and promote the opening tension to
   present-tense (`live:true`); settled stays latent, exactly as today.

   RED-FIRST (Teeth Law): this harness was run against the unmodified base commit
   (fa7a6fdb, fix/tiyl-entry-wiring) BEFORE any of SS.eRegister / the rollEntry wiring /
   the consumer surfacing existed — it failed cleanly on "register absent" (see the build
   report for the captured red output). Only after that red run did the tables + wiring +
   consumer edits land, and this file went green.

   Assertions:
     V1 (a) all five register bands (settled/edge/medias/wrong/mythic) appear across a
            300-entry census of fresh rollEntry() calls.
        (b) each band's observed share sits within ±6 points of the authored weights
            25/25/30/15/5 — NEVER a fixed RNG position (real Math.random(), no seed; streams
            diverge across node versions per CLAUDE.md — shape only, per-band tolerance band).
     V2      medias/wrong/mythic entries always carry `situation` with the correct juice tag
             (Textured, or Strange for medias rows 11-12; Strange for wrong; Mythic for
             mythic) and `live:true`; `edge` carries `live:true` + `situation:null`; `settled`
             carries `live:false` + `situation:null`.
     V3      the entry ledger line for a hot-band character names the band and the situation
             text; a settled character's ledger line is byte-identical in shape to the
             pre-unit output (no register suffix appended).
     V4      legacy guard — a `c.entry` WITHOUT a `register` key (the pre-unit save shape)
             renders through both known consumers (renderOpening, charHandoff) without
             throwing.

   Run:  node dev/verify-opening-register.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const srcPaths = man.loadOrder.filter((p) => p.endsWith(".js"));

function boot(){
  const src = srcPaths.map(read).join("\n;\n");
  const dom = new JSDOM(
    `<!doctype html><html><body>
       <div id="bindbar" style="display:none"></div>
       <input id="worldName" value="">
       <div id="stages"></div>
       <div id="worldView"></div>
       <div id="bardoView"></div>
     </body></html>`,
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

// A fresh, minimal (w,c) pair sufficient to drive rollEntry() honestly — same lean-fixture
// shape verify-tiyl-entry.mjs uses (factions:[]/pressures:[] just means pickTension/dominant-
// faction logic no-ops; the register roll is upstream of and independent from that machinery).
function freshWC(win, i){
  const w = { id:`wc${i}`, name:`Census${i}`, clock:{day:1,min:360}, session:0, ledger:[], log:[],
    gazetteer: [], factions: [], pressures: [] };
  const c = { id:`cc${i}`, name:`Soul${i}`, bornWhere:`Place${i}`, sheet:{ class:"Fighter" } };
  win.rollEntry(w, c);
  return { w, c };
}

const win = boot();

/* ── V1 + V2: 300-entry census — band distribution + per-band situation/live shape ── */
console.log("V1+V2: 300-entry census over fresh rollEntry() calls");
const N = 300;
const EXPECTED = { settled:25, edge:25, medias:30, wrong:15, mythic:5 };
const TOL = 6; // ± percentage points, per OPENING-REGISTER-BUILD.md §4 V1(b)
const tally = { settled:0, edge:0, medias:0, wrong:0, mythic:0, MISSING:0 };
const shapeFails = [];
for (let i = 0; i < N; i++){
  const { c } = freshWC(win, i);
  const reg = c.entry && c.entry.register;
  const knownBand = reg && typeof reg.band === "string" && Object.prototype.hasOwnProperty.call(EXPECTED, reg.band);
  if (!knownBand){ tally.MISSING++; continue; }
  tally[reg.band]++;
  if (reg.band === "settled"){
    if (reg.live !== false || reg.situation !== null)
      shapeFails.push(`settled#${i}: live=${reg.live} situation=${JSON.stringify(reg.situation)}`);
  } else if (reg.band === "edge"){
    if (reg.live !== true || reg.situation !== null)
      shapeFails.push(`edge#${i}: live=${reg.live} situation=${JSON.stringify(reg.situation)}`);
  } else if (reg.band === "medias"){
    if (reg.live !== true || !reg.situation || typeof reg.situation.text !== "string" || !reg.situation.text ||
        (reg.situation.juice !== "Textured" && reg.situation.juice !== "Strange"))
      shapeFails.push(`medias#${i}: ${JSON.stringify(reg)}`);
  } else if (reg.band === "wrong"){
    if (reg.live !== true || !reg.situation || typeof reg.situation.text !== "string" || !reg.situation.text ||
        reg.situation.juice !== "Strange")
      shapeFails.push(`wrong#${i}: ${JSON.stringify(reg)}`);
  } else if (reg.band === "mythic"){
    if (reg.live !== true || !reg.situation || typeof reg.situation.text !== "string" || !reg.situation.text ||
        reg.situation.juice !== "Mythic")
      shapeFails.push(`mythic#${i}: ${JSON.stringify(reg)}`);
  }
}

check("register present on every sample (none MISSING)", tally.MISSING === 0,
  `MISSING=${tally.MISSING} of ${N} — register absent`);
check("all five bands appear across the census", ["settled","edge","medias","wrong","mythic"].every(k => tally[k] > 0),
  JSON.stringify(tally));
Object.keys(EXPECTED).forEach(band => {
  const pct = (tally[band] / N) * 100;
  const lo = EXPECTED[band] - TOL, hi = EXPECTED[band] + TOL;
  check(`band "${band}" share within ±${TOL}pts of ${EXPECTED[band]}% (observed ${pct.toFixed(1)}%, n=${tally[band]})`,
    pct >= lo && pct <= hi, `count=${tally[band]}/${N}`);
});
check("V2 shape: situation/juice/live correct for every sample of every band", shapeFails.length === 0,
  shapeFails.slice(0, 8).join(" | "));
console.log("  census tally:", JSON.stringify(tally));

/* ── V3: ledger line — hot band names band+situation; settled stays byte-identical in shape ── */
console.log("V3: ledger line carries the band/situation for a hot band; a settled line matches pre-unit shape");
{
  let hotSample = null, settledSample = null, tries = 0;
  while ((!hotSample || !settledSample) && tries < 2000){
    const { w, c } = freshWC(win, 100000 + tries);
    const reg = c.entry && c.entry.register;
    const line = (w.ledger || []).slice().reverse().find(e => e.type === "canon" && e.data && e.data.kind === "entry");
    if (reg && reg.band !== "settled" && reg.situation && !hotSample) hotSample = { w, c, line, reg };
    if (reg && reg.band === "settled" && !settledSample) settledSample = { w, c, line, reg };
    tries++;
  }
  check("found a hot-band sample within the retry budget (sanity)", !!hotSample, `tries=${tries}`);
  check("found a settled-band sample within the retry budget (sanity)", !!settledSample, `tries=${tries}`);
  if (hotSample){
    const { line, reg } = hotSample;
    check("hot-band ledger line names the band", !!line && line.text.indexOf(reg.band) >= 0, JSON.stringify(line));
    check("hot-band ledger line names the situation text", !!line && line.text.indexOf(reg.situation.text) >= 0,
      JSON.stringify(line));
  }
  if (settledSample){
    const { c, line } = settledSample;
    const expected = `${c.name} arrives ${c.entry.why}; to ${c.entry.standingFaction}, ${c.entry.standing}.` +
      `${c.entry.tension ? " Opening tension: " + c.entry.tension.danger + "." : ""}`;
    check("settled-band ledger line is byte-identical in shape to pre-unit output (no register suffix)",
      !!line && line.text === expected, JSON.stringify({ got: line && line.text, expected }));
  }
}

/* ── V4: legacy guard — c.entry with NO `register` key renders through every known consumer ── */
console.log("V4: legacy c.entry (pre-unit shape, no register key) renders through renderOpening + charHandoff");
{
  const w = { id: "wleg", name: "LegacyRegisterWorld", ledger: [], log: [], gazetteer: [], factions: [], pressures: [] };
  const c = {
    id: "cleg", name: "Elden", pronouns: "they", headline: "a stranger passing through", bornWhere: "Old Testholm",
    sheet: {
      species: "Human", class: "Fighter", background: "Soldier",
      scores: { str:14,dex:12,con:14,int:10,wis:10,cha:8 }, mods: { str:2,dex:1,con:2,int:0,wis:0,cha:-1 },
      hp: 11, ac: 15, profBonus: 2, passivePerception: 10, hitDie: "d10",
      saveProfs: ["str","con"], skillProfs: ["Athletics"], tool: null, languages: [], feat: "—",
    },
    entry: {
      why: "for work and coin", foot: "nothing but what you carry", standing: "a stranger, unknown and unproven",
      standingFaction: "the local power", proximity: { relationship: "none" },
      bundle: { enemies: [], friends: [], complications: [], things: [], places: [] }, tension: null,
      // deliberately NO `register` key — the pre-unit save shape
    },
  };
  let threw = null;
  try { win.renderOpening(w, c); } catch (e) { threw = "renderOpening: " + (e && e.message); }
  check("renderOpening() does not throw on legacy c.entry (no register)", !threw, threw || "");

  let threw2 = null;
  try { win.charHandoff(c); } catch (e) { threw2 = "charHandoff: " + (e && e.message); }
  check("charHandoff() does not throw on legacy c.entry (no register)", !threw2, threw2 || "");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
