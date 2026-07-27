/* Verify the roll-count telemetry seam — docs/TABLE-ATLAS.md unit U1.
   RED-FIRST: before the tally hook, GS.tableRolls is undefined for any harness that rolls a
   table, so `GS.tableRolls[id] === N` throws (reading a property of undefined) — that IS the red.
   The mutation assertion is the COUNT VALUE MOVING (a specific integer that changed across N
   calls), never merely "the field exists".

   Run:  node dev/verify-roll-telemetry.mjs
   (jsdom installed per-environment; JSDOM_HOME override supported — see CLAUDE.md.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const stubTables = {
  t: { dice: "d6", die: 6, rows: [[1, 6, "", "stub row", null, ["stub row"]]] },
};

// -------------------------------------------------------------------------------------------
// 1. Tally increments — state.js + compiled.js loaded together, with GS present.
// -------------------------------------------------------------------------------------------
{
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`, { runScripts: "dangerously" });
  const win = dom.window;
  win.GENESIS_TABLES = stubTables;
  win.eval(read("src/state.js") + "\n;" + read("src/engine/compiled.js"));

  const before = win.rollTable("t"); // returns the row object even on the first call
  win.rollTable("t");
  win.rollTable("t");

  check("rollTable returns the expected row shape", before && before.id === "t" && before.text === "stub row");
  check("GS.tableRolls.t === 3 (three calls tallied)", win.GS.tableRolls.t === 3, String(win.GS.tableRolls.t));

  // byte-identical return shape proof — the tally is a side-channel, not a behavior change.
  // `footprint` added (UNIT W2, docs/DESIGN.md, fix/wiring-teeth-0727, 2026-07-27): TERRAIN-
  // PROGRAM.md M8 / BATTLEMAP.md §3b's Map Footprint column now compiles as a named row field
  // (compile-tables.py, the Legs/Pool precedent) and rollTable() exposes it the same way it already
  // exposes legs/pool/grants/motif — a real, intentional shape growth this list must track, not the
  // side-channel corruption this check actually guards against (that invariant is unchanged: the
  // KEY SET must still be identical call-to-call, whatever it currently is).
  const again = win.rollTable("t");
  const expectedKeys = ["id", "dice", "total", "band", "text", "fragment", "cells", "legs", "pool", "grants", "motif", "footprint"];
  const sameKeys = expectedKeys.every((k) => k in again) && Object.keys(again).length === expectedKeys.length;
  check("return object keys unchanged (tally is a side-channel)", sameKeys, Object.keys(again).join(","));
  check("GS.tableRolls.t === 4 after a 4th call", win.GS.tableRolls.t === 4, String(win.GS.tableRolls.t));
}

// -------------------------------------------------------------------------------------------
// 2. No-op without GS — compiled.js loaded ALONE (no state.js), must not throw.
// -------------------------------------------------------------------------------------------
{
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`, { runScripts: "dangerously" });
  const win = dom.window;
  win.GENESIS_TABLES = stubTables;
  let threw = null;
  let row = null;
  try {
    win.eval(read("src/engine/compiled.js"));
    row = win.rollTable("t");
  } catch (e) {
    threw = e;
  }
  check("rollTable(id) does not throw when GS is absent", threw === null, threw && threw.message);
  check("rollTable(id) still returns the row object when GS is absent", row && row.id === "t");
}

// -------------------------------------------------------------------------------------------
// 3. Aggregation — build/gen-roll-counts.py sums .dm/roll-counts.jsonl lines correctly.
//    (Exercised directly here as a spawned check so this single harness covers all of U1 in
//    one run; the python acceptance command is documented in TABLE-ATLAS.md and re-runnable
//    standalone too.)
// -------------------------------------------------------------------------------------------
{
  const { execFileSync } = await import("node:child_process");
  const fs = await import("node:fs");
  const dmDir = join(ROOT, ".dm");
  const jsonlPath = join(dmDir, "roll-counts.jsonl");
  const rollCountsPath = join(ROOT, "data", "roll-counts.js");
  const hadJsonl = fs.existsSync(jsonlPath);
  const priorJsonl = hadJsonl ? fs.readFileSync(jsonlPath, "utf-8") : null;
  const priorRollCounts = fs.readFileSync(rollCountsPath, "utf-8");

  try {
    fs.mkdirSync(dmDir, { recursive: true });
    fs.writeFileSync(jsonlPath, '{"t":2}\n{"t":5}\n');
    execFileSync("python3", [join(ROOT, "build", "gen-roll-counts.py")], { cwd: ROOT });
    const sandbox = {};
    // eslint-disable-next-line no-eval
    eval(fs.readFileSync(rollCountsPath, "utf-8") + "\n;sandbox.ROLL_COUNTS = ROLL_COUNTS;");
    check("ROLL_COUNTS.t === 7 after aggregating two lines (2+5)", sandbox.ROLL_COUNTS.t === 7, String(sandbox.ROLL_COUNTS.t));
  } finally {
    // restore whatever was there before this check ran (never leave test fixtures committed)
    if (hadJsonl) fs.writeFileSync(jsonlPath, priorJsonl);
    else fs.rmSync(jsonlPath, { force: true });
    fs.writeFileSync(rollCountsPath, priorRollCounts);
  }
}

// -------------------------------------------------------------------------------------------
// 4. rollTableAtBand tallies GS.tableRolls on its success path (HOTFIX-QUEUE-2026-07-07 HQ2-6).
//    Every rollTableSpiced(...) call funnels through rollTableAtBand's in-band success branch,
//    which built its own row object and returned WITHOUT ever calling rollTable's tally.
// -------------------------------------------------------------------------------------------
{
  const bandedTables = {
    banded: {
      dice: "d20", die: 20,
      rows: [
        [1, 10, "Grounded", "grounded row", null, ["grounded row"]],
        [11, 20, "Strange", "strange row", null, ["strange row"]],
      ],
    },
    unladdered: {
      // no row's band matches any ladder rung -> rollTableAtBand's scan never finds rows at any
      // bi -> falls through to `return rollTable(id)` (the degrade path).
      dice: "d6", die: 6,
      rows: [[1, 6, "Homebrew", "unladdered row", null, ["unladdered row"]]],
    },
  };

  const dom = new JSDOM(`<!doctype html><html><body></body></html>`, { runScripts: "dangerously" });
  const win = dom.window;
  win.GENESIS_TABLES = bandedTables;
  win.eval(read("src/state.js") + "\n;" + read("src/engine/compiled.js"));
  win.spiceBandPick = () => "Grounded";

  // 4a. in-band success path
  win.GS.tableRolls = {};
  const r1 = win.rollTableAtBand("banded", "Strange");
  check(
    "rollTableAtBand in-band success tallies GS.tableRolls.banded === 1",
    win.GS.tableRolls.banded === 1,
    String(win.GS.tableRolls.banded)
  );
  check("rollTableAtBand still returns the requested-band row", r1 && r1.band === "Strange", r1 && r1.band);

  // 4b. rollTableSpiced funnels through the same success path exactly once
  win.GS.tableRolls = {};
  win.rollTableSpiced("banded", "baseline");
  check(
    "rollTableSpiced(id,tier) once tallies GS.tableRolls.banded === 1 (not 0, not 2)",
    win.GS.tableRolls.banded === 1,
    String(win.GS.tableRolls.banded)
  );

  // 4c. degrade path (no band down the ladder matches) still tallies exactly once, via rollTable
  win.GS.tableRolls = {};
  win.rollTableAtBand("unladdered", "Mythic");
  check(
    "rollTableAtBand degrade path tallies GS.tableRolls.unladdered === 1 (no double-count)",
    win.GS.tableRolls.unladdered === 1,
    String(win.GS.tableRolls.unladdered)
  );
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
