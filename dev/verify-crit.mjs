/* Verify the Critical-Magnitude engine (docs/CRIT-MAGNITUDE.md) — full-app jsdom load + compiled tables.js.
   Asserts: the band table (§1) maps natural+magnitude → tier/lensCount for both success and the INVERTED
   failure ladder; only nat 20/1 trigger; lenses are drawn DISTINCT from the right table; the row-1 place
   lens routes into the Myth suite (myth-seeds); Mythic flags canon; and the crit_outcome event writes the
   right Ledger line (canon for Mythic, outcome otherwise) through the real applyEvent runtime.

   Run:  node dev/verify-crit.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// globals present
check("tables.js has the lens + myth tables",
  win.GENESIS_TABLES && win.GENESIS_TABLES["mythic-success-lenses"] && win.GENESIS_TABLES["mythic-failure-lenses"] && win.GENESIS_TABLES["myth-seeds"]);
for (const f of ["rollCritMagnitude","critBand","critDrawLenses"]) check(`global ${f}`, typeof win[f] === "function");

// ── only nat 20/1 trigger ────────────────────────────────────────────────────
check("non-crit naturals return null", win.rollCritMagnitude(15) === null && win.rollCritMagnitude(2) === null);

// ── band table (§1) — success ladder. critBand is PURE (a range; the roller realizes the count). ──
const sB = (mag) => win.critBand(20, mag);
check("critBand is pure (no roll): same inputs → identical band", JSON.stringify(sB(17)) === JSON.stringify(sB(17)));
check("20 + 1–10 → standard, 0 lenses", sB(1).tier === "standard" && sB(10).lensMax === 0);
check("20 + 11–14 → amplified-minor, 1 lens", sB(11).tier === "amplified-minor" && sB(14).lensMin === 1 && sB(14).lensMax === 1);
check("20 + 15–19 → amplified-major, 2–3 lenses", sB(17).tier === "amplified-major" && sB(17).lensMin === 2 && sB(17).lensMax === 3);
check("20/20 → mythic cascade (3), planar, canon-tier", sB(20).tier === "mythic" && sB(20).lensMin === 3 && sB(20).lensMax === 3 && sB(20).scope === "planar" && sB(20).cascade === true);

// ── band table — failure ladder runs INVERTED (lower is worse) ───────────────
const fB = (mag) => win.critBand(1, mag);
check("1 + 11–20 → standard, 0 lenses", fB(20).tier === "standard" && fB(11).lensMax === 0);
check("1 + 7–10 → amplified-minor, 1 lens", fB(7).tier === "amplified-minor" && fB(10).lensMin === 1 && fB(10).lensMax === 1);
check("1 + 2–6 → amplified-major, 2–3 lenses", fB(3).tier === "amplified-major" && fB(3).lensMin === 2 && fB(3).lensMax === 3);
check("1/1 → mythic cascade (3), canon-tier", fB(1).tier === "mythic" && fB(1).lensMin === 3 && fB(1).lensMax === 3 && fB(1).cascade === true);

// the roller realizes the count within the band range (amplified-major → 2 or 3 across samples)
{ const counts = new Set();
  for (let i = 0; i < 60; i++) counts.add(win.rollCritMagnitude(20, { magnitude: 17 }).lensCount);
  check("amplified-major resolves to 2 OR 3 lenses across samples", [...counts].every(n => n === 2 || n === 3) && counts.size === 2); }

// ── full roll: standard crit draws no lenses ─────────────────────────────────
{ const r = win.rollCritMagnitude(20, { magnitude: 5 });
  check("standard success: 0 lenses, not canon", r.tier === "standard" && r.lenses.length === 0 && r.canon === false); }

// ── lenses are drawn DISTINCT, from the right table, mythic = canon ───────────
{ let allDistinct = true, fromSuccess = true;
  for (let i = 0; i < 40; i++) {
    const r = win.rollCritMagnitude(20, { magnitude: 20 });   // mythic success → 3 lenses
    const rows = r.lenses.map(l => l.row);
    if (new Set(rows).size !== rows.length) allDistinct = false;
    if (r.lenses.some(l => !l.lens)) fromSuccess = false;
    if (!r.canon) fromSuccess = false;
  }
  check("mythic success: 3 distinct lenses every time (no dupes)", allDistinct);
  check("mythic success: lenses populated + canon flagged", fromSuccess); }

// ── failure lenses come from the failure table (disjoint wording from success) ─
{ const succ = new Set(), fail_ = new Set();
  for (let i = 0; i < 40; i++) {
    win.rollCritMagnitude(20, { magnitude: 20 }).lenses.forEach(l => succ.add(l.lens));
    win.rollCritMagnitude(1,  { magnitude: 1  }).lenses.forEach(l => fail_.add(l.lens));
  }
  // the success table's row-2 "A person is permanently changed" must never appear among failure draws
  check("failure draws come from the failure table (not success)", ![...fail_].some(t => /permanently changed/.test(t || "")) && fail_.size > 0); }

// ── the place lens (row 1) routes into the Myth suite ────────────────────────
{ let sawHandoff = false, seededOnHandoff = true;
  for (let i = 0; i < 120 && !sawHandoff; i++) {
    const r = win.rollCritMagnitude(20, { magnitude: 20 });
    if (r.placeHandoff) { sawHandoff = true; if (!(r.mythSeed && r.mythSeed.text)) seededOnHandoff = false; }
  }
  check("a place-lens cascade eventually fires (row 1 reachable)", sawHandoff);
  check("place handoff rolls a myth-seed", seededOnHandoff); }

// ── crit_outcome event → Ledger (canon for Mythic, outcome otherwise) ────────
const w = { id: "wc", name: "Crit", ledger: [], clock: { day: 1, min: 360 }, gazetteer: [], factions: [], revealed: {} };
const myth = win.rollCritMagnitude(20, { magnitude: 20 });
const re1 = win.applyEvent(w, { type: "crit_outcome", payload: myth, source: "play" });
check("crit_outcome (mythic) returns canon:true", re1.ok && re1.canon === true);
check("crit_outcome (mythic) wrote a CANON ledger line", w.ledger.some(e => e.type === "canon" && e.data && e.data.kind === "crit" && /woven into the world/.test(e.text)));
const amp = win.rollCritMagnitude(1, { magnitude: 4 });   // amplified-major failure
const re2 = win.applyEvent(w, { type: "crit_outcome", payload: amp, source: "play" });
check("crit_outcome (amplified) returns canon:false", re2.ok && re2.canon === false);
check("crit_outcome (amplified) wrote an OUTCOME ledger line (not canon)", w.ledger.some(e => e.type === "outcome" && e.data && e.data.kind === "crit"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
