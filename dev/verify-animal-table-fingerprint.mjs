/* Verify HQ-6 (docs/ANIMAL-SOCIAL-HQ.md) — row-coupling fingerprint for animal-kind /
   wild-animal-kind.

   ANIMAL_ENV_WEIGHTS (src/engine/codex-roll.js) is a positional 12-vector and
   ANIMAL_KNOWLEDGE_SCOPE (data/animal-knowledge-scope.js) is a row-number-keyed map — BOTH assume
   the CURRENT row order/count of animal-kind + wild-animal-kind, tables whose header says Adam's
   craft pass WILL rewrite them. This harness pins a distinguishing token (the tags cell, the
   stablest field on these rows today) per row of the COMPILED tables and fails loud — by name and
   row — the moment row count or row identity drifts.

   *** THIS HARNESS IS SUPPOSED TO GO RED UNDER A CRAFT PASS. *** That is its entire job: convert
   silent drift (weightedTableRow's mismatch fallback quietly reverting to flat rolls, or
   animalKnowledgeScopeFor silently mis-scoping a reordered row) into a NAMED re-sync task for
   whoever lands the craft pass. NEVER "fix" a red run here by loosening/removing tokens to match
   the new table — that defeats the point. A red run means: go re-sync ANIMAL_ENV_WEIGHTS and
   ANIMAL_KNOWLEDGE_SCOPE by hand against the new rows, then update the pinned tokens below to
   match the new (now-intentional) shape.

   Full-app jsdom load (same bootstrap convention as dev/verify-animal-social-u1.mjs) — loads the
   real genesis.html modules in document order plus the compiled tables.js, so the console.warn
   check below drives the REAL weightedTableRow, not a re-implementation of it.

   Run:  node dev/verify-animal-table-fingerprint.mjs
   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

function boot() {
  const man = JSON.parse(read("manifest.json"));
  const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);
  return win;
}

/* Pinned fingerprints — read 2026-07-09 off the compiled rows (row[5][1] = the Tags cell, the
   stablest distinguishing field on these rows; a text stem would also work per the spec but the
   tags are shorter and already unique within each table). Order matters: index i is expected to be
   row (i+1)'s tag. Consumers keyed by these fingerprints:
     - ANIMAL_ENV_WEIGHTS (src/engine/codex-roll.js) — positional 12-vectors over BOTH tables.
     - ANIMAL_KNOWLEDGE_SCOPE (data/animal-knowledge-scope.js) — row-number keys, wild-animal-kind only. */
const FINGERPRINTS = {
  "animal-kind": [
    "dog, bonded", "beast, labor", "cat, independent", "stray, alarm",
    "fowl, alarm", "herd, instinct", "bird, messenger", "small, hunter",
    "old, sentinel", "wild, wary", "realm-skin", "landmark, bonded",
  ],
  "wild-animal-kind": [
    "pack, territory", "herd, instinct", "bird, watcher", "water, instinct",
    "burrow, solitary", "predator, solitary", "scavenger, pack", "flock, transient",
    "solitary, sentinel", "wild, wary", "realm-skin", "landmark, bonded",
  ],
};

const CONSUMERS = {
  "animal-kind": ["ANIMAL_ENV_WEIGHTS (src/engine/codex-roll.js)"],
  "wild-animal-kind": [
    "ANIMAL_ENV_WEIGHTS (src/engine/codex-roll.js)",
    "ANIMAL_KNOWLEDGE_SCOPE (data/animal-knowledge-scope.js)",
  ],
};

/* fingerprintCheck(table, expected) -> { ok, mismatches:[{row, expected, actual}] }.
   table: a compiled table object ({ rows: [...] }) or null/missing.
   expected: the pinned token array for that table id.
   Pure comparator — no I/O, no console — so the D8 self-test (below) can drive it directly against
   a mutated STRUCTURAL COPY without touching the real loader or emitting noise in the standing
   gate's output. */
function fingerprintCheck(table, expected) {
  const mismatches = [];
  if (!table || !Array.isArray(table.rows)) {
    return { ok: false, mismatches: [{ row: "*", expected: `${expected.length} rows`, actual: "table missing" }] };
  }
  if (table.rows.length !== expected.length) {
    mismatches.push({ row: "*", expected: `${expected.length} rows`, actual: `${table.rows.length} rows` });
  }
  const n = Math.min(table.rows.length, expected.length);
  for (let i = 0; i < n; i++) {
    const row = table.rows[i];
    const tag = row && row[5] && row[5][1];
    if (tag !== expected[i]) {
      mismatches.push({ row: i + 1, expected: expected[i], actual: tag });
    }
  }
  return { ok: mismatches.length === 0, mismatches };
}

function reportMismatches(id, result) {
  const consumers = CONSUMERS[id].join(", ");
  for (const m of result.mismatches) {
    console.log(`      DRIFT in ${id} row ${m.row}: expected "${m.expected}", got "${m.actual}"`);
  }
  console.log(`      re-sync required in: ${consumers}`);
}

let pass = 0, fail = 0;
const check = (n, c, d = "") => (c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d)));

console.log("=== HQ-6: fingerprint green on the current compiled tables ===");
{
  const win = boot();
  for (const id of Object.keys(FINGERPRINTS)) {
    const table = win.eval(`(window.GENESIS_TABLES||{})[${JSON.stringify(id)}]`);
    const result = fingerprintCheck(table, FINGERPRINTS[id]);
    if (!result.ok) reportMismatches(id, result);
    check(`${id}: row count + row identity match the pinned fingerprint`, result.ok, "see DRIFT lines above");
  }
}

console.log("=== D8 self-test: the harness's own comparator must fail loud on a mutated COPY (never production data) ===");
{
  const mkRows = (tags) => tags.map((tag, i) => [i + 1, i + 1, "", "", null, ["", tag]]);

  // Dropped row — one row short of the pin.
  const dropped = { rows: mkRows(FINGERPRINTS["animal-kind"].slice(0, 11)) };
  const droppedResult = fingerprintCheck(dropped, FINGERPRINTS["animal-kind"]);
  check("self-test: a dropped row is reported red", !droppedResult.ok, "expected red, got green");
  check("self-test: dropped-row report names the row-count mismatch",
    droppedResult.mismatches.some((m) => m.row === "*"), JSON.stringify(droppedResult.mismatches));

  // Reordered rows (swap row 1 and row 2) — same length, different identity at two positions.
  const full = mkRows(FINGERPRINTS["wild-animal-kind"]);
  const reordered = { rows: full.slice() };
  reordered.rows[0] = full[1];
  reordered.rows[1] = full[0];
  const reorderedResult = fingerprintCheck(reordered, FINGERPRINTS["wild-animal-kind"]);
  check("self-test: reordered rows are reported red", !reorderedResult.ok, "expected red, got green");
  const namedRows = reorderedResult.mismatches.map((m) => m.row).sort();
  check("self-test: reordered report names exactly rows 1 and 2",
    namedRows.length === 2 && namedRows[0] === 1 && namedRows[1] === 2, JSON.stringify(reorderedResult.mismatches));

  // Untouched copy stays green (sanity: the comparator isn't just always-red).
  const untouched = { rows: full.slice() };
  check("self-test: an untouched copy stays green", fingerprintCheck(untouched, FINGERPRINTS["wild-animal-kind"]).ok);
}

console.log("=== HQ-6 Change 1: weightedTableRow warns loud + exactly once per table id on a mismatched vector ===");
{
  const win = boot();
  const warned = [];
  win.console.warn = (...args) => warned.push(args.join(" "));
  const stub13 = new Array(13).fill(1); // real animal-kind has 12 rows -> length mismatch
  win.eval(`weightedTableRow('animal-kind', ${JSON.stringify(stub13)});
    weightedTableRow('animal-kind', ${JSON.stringify(stub13)});
    weightedTableRow('animal-kind', ${JSON.stringify(stub13)});`);
  check("warn fires on the mismatched vector", warned.some((w) => /weight\/row count mismatch for animal-kind/.test(w)));
  check("warn fires exactly once for the same table id across repeated calls",
    warned.filter((w) => /animal-kind/.test(w)).length === 1, JSON.stringify(warned));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
