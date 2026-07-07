/* Verify data/table-usage.js (TABLE_USAGE) — docs/TABLE-ATLAS.md unit U0.
   RED-FIRST: before U0, data/table-usage.js does not exist at all, so readFileSync below throws
   ENOENT — that IS the red. This harness only turns green once build/gen-table-usage-audit.py has
   actually emitted the file with real (not stubbed) classification values.

   Run:  node dev/verify-table-usage-data.mjs
   (Regenerate the artifact first if stale: python3 build/gen-table-usage-audit.py) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// load — RED-FIRST: this throws pre-U0 (file absent)
const src = read("data/table-usage.js");
const sandbox = {};
// eslint-disable-next-line no-eval
eval(src + "\n;sandbox.TABLE_USAGE = TABLE_USAGE;");

const TABLE_USAGE = sandbox.TABLE_USAGE;
check("TABLE_USAGE is a real object", TABLE_USAGE && typeof TABLE_USAGE === "object");

// 1. Mutation assert — a known-WIRED table, real classification value + real consumer basename.
// (npc-role is classified PROCEDURE in the current corpus — the audit matches on the FILE
// basename "NPC Role", not the table id, and codex-roll.js only calls rollTable("npc-role"),
// never the string "NPC Role"; it is wired via the Quick NPC Generator 2.0 procedure instead.
// place-secret is the verified WIRED example: codex-roll.js:108-ish calls rollTable("place-secret")
// and its source file basename "Place-Secret" is matched directly in codex-roll.js's own text.)
const wiredId = "place-secret";
const wiredEntry = TABLE_USAGE[wiredId];
check(`${wiredId} entry exists`, !!wiredEntry);
check(`${wiredId}.cls === "WIRED"`, wiredEntry && wiredEntry.cls === "WIRED",
  wiredEntry && wiredEntry.cls);
check(`${wiredId}.consumers.code contains codex-roll.js`,
  wiredEntry && Array.isArray(wiredEntry.consumers.code) && wiredEntry.consumers.code.includes("codex-roll.js"),
  wiredEntry && JSON.stringify(wiredEntry.consumers));

// 2. Every TABLE_USAGE key is a real tables.json key (join integrity).
const tablesJson = JSON.parse(read("tables.json"));
const compiledKeys = new Set(Object.keys(tablesJson).filter((k) => tablesJson[k] && typeof tablesJson[k] === "object" && Array.isArray(tablesJson[k].rows)));
const badKeys = Object.keys(TABLE_USAGE).filter((k) => !compiledKeys.has(k));
check("every TABLE_USAGE key is a real tables.json key", badKeys.length === 0, badKeys.slice(0, 8).join(", "));

// count matches compiled table count (not hardcoded — read from tables.json itself)
check("TABLE_USAGE size === compiled table count",
  Object.keys(TABLE_USAGE).length === compiledKeys.size,
  `${Object.keys(TABLE_USAGE).length} vs ${compiledKeys.size}`);

// 3. cls enum.
const ENUM = new Set(["WIRED", "PROCEDURE", "CHAINED", "ORACLE-ONLY", "UNMAPPED"]);
const badCls = Object.entries(TABLE_USAGE).filter(([, v]) => !ENUM.has(v.cls)).map(([k]) => k);
check("every entry's cls is in the 5-value enum", badCls.length === 0, badCls.slice(0, 8).join(", "));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
