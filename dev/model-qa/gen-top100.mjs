#!/usr/bin/env node
/* dev/model-qa/gen-top100.mjs — derive the "top-100 most encounterable" creature set for the
   MODEL-QA blind-recognition rig (docs/MODEL-GRAMMAR.md §7b: "the top-100 most-encountered
   creatures (CR-weighted walk frequency) must PASS").

   There is NO explicit encounter-weight/walk-frequency field on a bestiary entry (verified —
   every entry carries name/id/cr/size/role/habitat/activity/tags but no `weight`), so this
   script DERIVES a principled, DETERMINISTIC encounter-weight from the fields that DO exist and
   that plausibly track how often a player actually meets a creature in a Tier-2 (levels 1-10)
   game:

     • CR band (dominant term). THIS VERSION CAPS AT TIER 2 (docs/TIER-SCOPE.md, LEVEL_CEILING) —
       a level-1-10 party meets CR 1/8 .. ~CR 8 creatures constantly and CR 15+ essentially never.
       So the CR weight is a curve that peaks across the low band (CR 1/4 .. 4) and falls off hard
       above CR 6, with a long thin tail so a few marquee big monsters (a dragon, a giant) still
       make the sheet as the things a campaign builds toward.
     • role. The bestiary tags a combat role; roles that appear in NUMBERS (minion/skirmisher/
       brute) are seen more often than the rare ones (leader/artillery/controller/lurker).
     • habitat breadth. A creature tagged for many habitats (or "any") turns up across more rooms
       than a single-biome specialist.

   Deterministic tie-break by id so the same bestiary always yields the same 100 in the same order
   (the §7b "same URL -> same figures in same cells" guarantee starts here). Writes
   dev/model-qa/top100.json.

   Run:  node dev/model-qa/gen-top100.mjs           (from the repo root)
*/

import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

// bestiary.js is a classic <script> (declares `const BESTIARY` in global scope) — load it in a vm
// sandbox and lift the binding out, the same jsdom-const-via-eval trick the repo's own harnesses use.
function loadGlobalConst(relPath, name) {
  const src = fs.readFileSync(path.join(repoRoot, relPath), "utf8");
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(src + `;this.__out = (typeof ${name} !== "undefined") ? ${name} : null;`, ctx);
  return ctx.__out;
}

const BESTIARY = loadGlobalConst("data/bestiary.js", "BESTIARY");
if (!BESTIARY) {
  console.error("could not load BESTIARY from data/bestiary.js");
  process.exit(1);
}

/* CR -> encounter weight. Piecewise curve, peak in the low tier-2 band, hard falloff above CR 6,
   thin tail above so a handful of high-CR marquee monsters still qualify. Values are relative,
   not absolute — only their ordering/ratio matters. */
/* Deliberately FLATTER than raw encounter-frequency would be: the QA sheet's job is broad model
   coverage across the tier-2 combat band, not a statistically faithful spawn table. A pure
   frequency curve buries the sheet in near-identical CR<=1 minions and never shows the mid-tier
   iconic monsters (ogre, dire wolf, giant spider, owlbear, the low bosses) a party fights on the
   way to level 10 — exactly the creatures whose SILHOUETTES most need to read. So the low band
   stays the plurality but the CR 1-6 mid band is kept well-populated, with a thin marquee tail. */
function crWeight(cr) {
  const c = Number(cr);
  if (!isFinite(c)) return 1;
  if (c <= 0) return 5.0;     // CR 0 (rats, commoners) — common walk-ons
  if (c <= 0.125) return 6.5; // CR 1/8
  if (c <= 0.25) return 7.5;  // CR 1/4 — the modal early-game foe (goblin/wolf/skeleton/kobold)
  if (c <= 0.5) return 7.5;   // CR 1/2
  if (c <= 1) return 7.5;     // CR 1
  if (c <= 2) return 7.2;     // CR 2 — ogre/giant-spider band; kept near-parity with the low band
  if (c <= 3) return 7.0;     //   so mid-tier silhouettes (the shapes Adam hasn't seen enough of)
  if (c <= 4) return 6.8;     //   populate the sheet instead of being crowded out by the sheer
  if (c <= 5) return 6.5;     //   count of CR<=1 rows — a coverage bias, documented, on purpose.
  if (c <= 6) return 6.0;     // CR 6 — top of the routine tier-2 band
  if (c <= 8) return 4.0;     // CR 7-8 — set-piece boss for a capped party
  if (c <= 10) return 3.0;    // CR 9-10 — the ceiling of this version's scope
  if (c <= 13) return 1.5;    // beyond scope but iconic
  if (c <= 17) return 0.8;
  return 0.4;                 // CR 18+ — the long, thin marquee tail (ancient dragons etc.)
}

/* role -> multiplier: roles that appear in numbers score higher (you meet a pack of minions far
   more often than a lone leader). */
const ROLE_WEIGHT = {
  minion: 1.35,
  skirmisher: 1.25,
  brute: 1.2,
  lurker: 1.0,
  controller: 0.95,
  artillery: 0.9,
  leader: 0.85
};
function roleWeight(role) {
  return ROLE_WEIGHT[String(role || "").toLowerCase()] ?? 1.0;
}

/* habitat breadth -> a mild multiplier. "any" or many habitats = seen across more rooms. Capped so
   breadth nudges rather than dominates (CR is the real driver). */
function habitatWeight(habitat) {
  if (!Array.isArray(habitat) || !habitat.length) return 1.0;
  if (habitat.some(h => String(h).toLowerCase() === "any")) return 1.15;
  // 1 habitat -> 0.95, 5+ -> ~1.12
  return Math.min(1.12, 0.9 + habitat.length * 0.045);
}

const scored = Object.keys(BESTIARY).map(id => {
  const e = BESTIARY[id];
  const w = crWeight(e.cr) * roleWeight(e.role) * habitatWeight(e.habitat);
  return {
    slug: id,
    name: e.name,
    cr: e.cr,
    size: e.size,
    type: (e.tags && e.tags.type) || null,
    role: e.role || null,
    weight: Math.round(w * 1000) / 1000
  };
});

// sort by weight desc, then CR asc (prefer the lower-CR, more-encounterable of a tie), then slug
// asc (fully deterministic).
scored.sort((a, b) => {
  if (b.weight !== a.weight) return b.weight - a.weight;
  if (a.cr !== b.cr) return a.cr - b.cr;
  return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
});

const top100 = scored.slice(0, 100);

const out = {
  _comment: "The top-100 most-encounterable creatures for the MODEL-QA blind-recognition rig "
    + "(docs/MODEL-GRAMMAR.md §7b). GENERATED by dev/model-qa/gen-top100.mjs — DO NOT hand-edit; "
    + "re-run the generator after a bestiary change. Encounter-weight is DERIVED (there is no "
    + "explicit walk-frequency field on a bestiary entry) from CR band (tier-2 curve, "
    + "docs/TIER-SCOPE.md) x combat role x habitat breadth; sorted weight desc, CR asc, slug asc "
    + "(deterministic). The order here IS the A1..E5 cell order the lineup fixture uses.",
  generatedFrom: "data/bestiary.js",
  count: top100.length,
  slugs: top100.map(x => x.slug),
  detail: top100
};

const outPath = path.join(__dirname, "top100.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");

// brief console summary
const byType = {};
top100.forEach(x => { byType[x.type] = (byType[x.type] || 0) + 1; });
const crSpread = {};
top100.forEach(x => { const b = x.cr <= 1 ? "<=1" : x.cr <= 4 ? "2-4" : x.cr <= 6 ? "5-6" : x.cr <= 10 ? "7-10" : "11+"; crSpread[b] = (crSpread[b] || 0) + 1; });
console.log(`wrote ${outPath}`);
console.log(`top-100 by type:`, JSON.stringify(byType));
console.log(`top-100 by CR band:`, JSON.stringify(crSpread));
console.log(`first 10:`, top100.slice(0, 10).map(x => `${x.slug}(cr${x.cr})`).join(", "));
console.log(`last 5 (rank 96-100):`, top100.slice(95).map(x => `${x.slug}(cr${x.cr})`).join(", "));
