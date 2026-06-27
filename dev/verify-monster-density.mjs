/* Verify the MONSTER roster has enough CR variety for a solid Tier-1/2 (CR 0–10) experience
   (docs/TIER-SCOPE.md). Pure file scan — no jsdom. Parses the "**Challenge:** <CR>" line from every
   stat block in Asset Library/Monsters & Enemies/, bins by CR, asserts a buildable floor per integer
   CR 1–10, and PRINTS the distribution so thin bands (the audit flagged CR 9–10) stay visible.

   Run:  node dev/verify-monster-density.mjs */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "Asset Library", "Monsters & Enemies");

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

const parseCR = (s) => { s = (s || "").trim();
  if (s === "1/8") return 0.125; if (s === "1/4") return 0.25; if (s === "1/2") return 0.5;
  const n = parseFloat(s); return isNaN(n) ? null : n; };

const files = readdirSync(DIR).filter((f) => f.endsWith(".md"));
const crs = [];
let noCR = 0;
for (const f of files) {
  // SRD blocks use "**Challenge:**"; Adam's custom blocks use "**CR:**" — accept both
  const m = readFileSync(join(DIR, f), "utf-8").match(/\*\*(?:Challenge|CR):\*\*\s*([0-9/]+)/);
  const cr = m ? parseCR(m[1]) : null;
  if (cr == null) { noCR++; continue; }
  crs.push(cr);
}

check(`every stat block has a parseable CR (${files.length} files, ${noCR} without)`, noCR === 0, `${noCR} missing`);

// bin by integer CR (fractions → the "<1" T1 band)
const band = (cr) => cr < 1 ? "<1" : String(Math.floor(cr));
const counts = {};
for (const cr of crs) counts[band(cr)] = (counts[band(cr)] || 0) + 1;

const t1 = crs.filter((c) => c <= 3).length, t2 = crs.filter((c) => c >= 4 && c <= 10).length;
console.log(`\n  Tier-1 (CR 0–3): ${t1}   ·   Tier-2 (CR 4–10): ${t2}   ·   total: ${crs.length}`);
const ladder = ["<1","1","2","3","4","5","6","7","8","9","10"].map((b) => `CR${b}:${counts[b]||0}`).join("  ");
console.log("  " + ladder + "\n");

// buildable floor: each integer CR 1–10 should field at least a couple of options for encounter variety
for (let cr = 1; cr <= 10; cr++) {
  const n = counts[String(cr)] || 0;
  check(`CR ${cr} has ≥2 stat blocks (got ${n})${n < 5 ? " [thin]" : ""}`, n >= 2, `only ${n}`);
}

// the T1/T2 roster as a whole must be deep enough to build varied encounters
check(`Tier-1 roster is deep (≥60 at CR 0–3, got ${t1})`, t1 >= 60);
check(`Tier-2 roster is usable (≥40 at CR 4–10, got ${t2})`, t2 >= 40);

// surface (don't fail on) the audit's known thin capstone band — visibility for the content backlog
const cap = (counts["9"] || 0) + (counts["10"] || 0);
console.log(`\n  NOTE: CR 9–10 capstone band = ${cap} stat blocks${cap < 12 ? " — thin; authoring more is a content-backlog item (docs/TIER-SCOPE.md)" : ""}.`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
