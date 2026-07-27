/* STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)
 *
 * Site-12 substrate-transform demand measurement.
 *
 * Loads the REAL carved data (`data/starting-state.js` — SS / SS_CONC) and replays the exact
 * tag logic of `src/engine/world-gen.js` rollPressure() lines 16–21, which is what actually
 * runs at world genesis via rollStartingState(). Rolls N worlds (two pressures each) and
 * reports how often a world commits a Site-12-class substrate transform.
 *
 * This measures the CURRENT LIVE PATH. It does not roll walks and it does not touch
 * tables.js / tables.json.
 *
 * Run:  node Reference/Anomalous-Living-Mobile-Study-0727/substrate-demand-measure.mjs
 * (from the repo root, or from anywhere — REPO below is resolved from this file's location)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");

const src = fs.readFileSync(path.join(REPO, "data", "starting-state.js"), "utf8");
const box = {};
new Function("g", src + "\n g.SS = SS; g.SS_CONC = SS_CONC;")(box);
const { SS, SS_CONC } = box;

const rollDie = n => 1 + Math.floor(Math.random() * n);
function rollTbl(t) {
  const v = rollDie(t.die);
  let i = t.rows.findIndex(r => v >= r[0] && v <= r[1]);
  if (i < 0) i = t.rows.length - 1;
  const r = t.rows[i];
  return { text: r[2], tag: (typeof r[3] === "string" ? r[3] : ""), idx: i };
}

/* exact tag path of world-gen.js rollPressure() */
function pressureTag(kind) {
  const s = rollTbl(SS.pSource);
  const p = rollTbl(kind === "internal" ? SS.pInternal : SS.pExternal);
  let concTag = p.tag;
  if (s.tag === "impersonal") {
    const im = rollTbl(SS.pImpersonal);
    if (im.tag) concTag = im.tag;
  }
  if (!concTag) return { tag: null, row: null };
  if (concTag === "beast") return { tag: "beast", row: null };
  const key = SS_CONC[concTag];
  if (!key) return { tag: concTag, row: null };
  const r = rollTbl(SS[key]);
  return { tag: concTag, row: r.idx + 1, text: r.text };
}

/* Which concretized rows rewrite what the GROUND is.
   becoming: all 8 rewrite what the place is.
   intrusion: all 6 impose foreign law on the ground.
   buried: 1 (sleeper beneath), 2 (structure surfacing), 8 (land reverting to an older shape).
   curse:  5 (the land itself collecting), 7 (a place that should not have been entered).
   These row selections are a DISCLOSED classification, not a founder ruling. */
const SUBSTRATE_ROWS = {
  becoming: [1, 2, 3, 4, 5, 6, 7, 8],
  intrusion: [1, 2, 3, 4, 5, 6],
  buried: [1, 2, 8],
  curse: [5, 7],
};

const N = Number(process.argv[2] || 200000);
let narrow = 0, wide = 0;
const tagTally = {};
const becomingRows = {};

for (let i = 0; i < N; i++) {
  const a = pressureTag("internal"), b = pressureTag("external");
  for (const x of [a, b]) {
    if (x.tag) tagTally[x.tag] = (tagTally[x.tag] || 0) + 1;
    if (x.tag === "becoming") becomingRows[x.row] = (becomingRows[x.row] || 0) + 1;
  }
  if ([a, b].some(x => x.tag === "becoming" || x.tag === "intrusion")) narrow++;
  if ([a, b].some(x => x.tag && SUBSTRATE_ROWS[x.tag] && SUBSTRATE_ROWS[x.tag].includes(x.row))) wide++;
}

const pct = n => (100 * n / N).toFixed(2) + "%";
console.log("worlds rolled:", N, "(2 pressures each)");
console.log("concretize-tag counts over", 2 * N, "pressures:", tagTally);
console.log("cBecoming row spread:", becomingRows);
console.log("P(world commits >=1 becoming/intrusion pressure)      =", pct(narrow));
console.log("P(world commits >=1 substrate-relevant concrete row)  =", pct(wide));
