/* HQ3-D4 harness self-check — proves `advance --toClock`/`--toBand` (absolute clock set, harness
   only) end to end via the REAL CLI (dev/playtest-bridgeless.mjs), exactly like the orchestrator
   would invoke it. Precedent: dev/verify-harness-d3.mjs (same shell-out-per-subcommand style).

   Scripted flow (per docs/HQ3-D-STATE-CODEX-HARNESS.md HQ3-D4 verify plan):
     init
       → advance --toClock "5:22:00"  [assert dmstate clock == {day:5,min:1320}]
       → advance --toBand dawn        [assert min 360, day UNCHANGED]
       → advance --toClock backward (earlier day/time than current) [assert it moves back]
       → advance --toClock "3:99:00" / "garbage"  [assert ok:false AND saved clock unchanged]
       → advance --minutes N (no toClock/toBand)  [assert still advances forward exactly as before]

   Run:  node dev/verify-harness-d4.mjs
   (No jsdom import here — this file only shells out to the harness CLI + reads its state.json,
   matching the D3 precedent.) */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(ROOT, "dev", "playtest-bridgeless.mjs");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function run(cmd, extraArgs) {
  const out = execFileSync("node", [CLI, cmd, ...extraArgs], { encoding: "utf-8" });
  return JSON.parse(out);
}
function readState(dir) {
  return JSON.parse(readFileSync(join(dir, "state.json"), "utf-8"));
}
function clockOnDisk(dir) {
  const state = readState(dir);
  const worldId = state.U.activeWorldId;
  return state.U.worlds[worldId].clock;
}

const dir = mkdtempSync(join(tmpdir(), "genesis-hq3-d4-"));
try {
  // 1) init — roll a world + L1 PC.
  const initRes = run("init", ["--dir", dir, "--brief", "{}"]);
  check("init produced a world", !!(initRes && initRes.ok), JSON.stringify(initRes));

  // 2) --toClock sets the clock ABSOLUTELY — Day 5, 22:00 (1320 min).
  const toClockRes = run("advance", ["--dir", dir, "--toClock", "5:22:00"]);
  check("advance --toClock ok:true", toClockRes.ok === true, JSON.stringify(toClockRes));
  check("advance --toClock reports after.day/min == 5/1320",
    toClockRes.after && toClockRes.after.day === 5 && toClockRes.after.min === 1320,
    JSON.stringify(toClockRes));
  let onDisk = clockOnDisk(dir);
  check("dmstate-equivalent (state.json) clock == {day:5,min:1320} after --toClock",
    onDisk.day === 5 && onDisk.min === 1320, JSON.stringify(onDisk));

  // also prove it through the real `dmstate` subcommand (spec's named check point).
  const dmstate1 = run("dmstate", ["--dir", dir]);
  check("dmstate clock == {day:5,min:1320}",
    dmstate1.clock && dmstate1.clock.day === 5 && dmstate1.clock.min === 1320, JSON.stringify(dmstate1.clock));

  // 3) --toBand keeps the current day, sets the canonical minute (dusk was already used up by
  // --toClock's dawn-equivalent hour; use dawn here since we're already past midnight-day-5-22:00 —
  // the point is day stays 5, min becomes 360 regardless of the prior 1320).
  const toBandRes = run("advance", ["--dir", dir, "--toBand", "dawn"]);
  check("advance --toBand ok:true", toBandRes.ok === true, JSON.stringify(toBandRes));
  check("advance --toBand dawn -> min 360, day unchanged (still 5)",
    toBandRes.after && toBandRes.after.min === 360 && toBandRes.after.day === 5, JSON.stringify(toBandRes));
  onDisk = clockOnDisk(dir);
  check("state.json clock day unchanged (5) after --toBand", onDisk.day === 5, JSON.stringify(onDisk));
  check("state.json clock min == 360 after --toBand dawn", onDisk.min === 360, JSON.stringify(onDisk));

  // also prove the other three bands map correctly (L15 canon table).
  const bandExpect = { noon: 720, dusk: 1080, night: 1320 };
  for (const [band, expectMin] of Object.entries(bandExpect)) {
    const r = run("advance", ["--dir", dir, "--toBand", band]);
    check(`advance --toBand ${band} -> min ${expectMin}`, r.after && r.after.min === expectMin, JSON.stringify(r));
  }

  // 4) a BACKWARD --toClock (current is Day 5 / 22:00 from the loop above) must succeed and actually
  // move backward — the core ask (SET-03-F2 overshoot repair without hand-editing state.json).
  const beforeBackward = clockOnDisk(dir);
  const backwardRes = run("advance", ["--dir", dir, "--toClock", "3:06:00"]);
  check("a backward --toClock (Day 5 -> Day 3) succeeds", backwardRes.ok === true, JSON.stringify(backwardRes));
  check("backward --toClock actually moved back (new day < prior day)",
    backwardRes.after.day < beforeBackward.day, `before=${JSON.stringify(beforeBackward)} after=${JSON.stringify(backwardRes.after)}`);
  onDisk = clockOnDisk(dir);
  check("state.json reflects the backward set (day:3, min:360)",
    onDisk.day === 3 && onDisk.min === 360, JSON.stringify(onDisk));

  // 5) malformed --toClock: bad HH -> {ok:false,reason}, and — critically — state on disk is
  // UNTOUCHED (load it fresh after the call and compare against the pre-call snapshot).
  const beforeMalformed1 = clockOnDisk(dir);
  const badHH = run("advance", ["--dir", dir, "--toClock", "3:99:00"]);
  check("advance --toClock \"3:99:00\" -> ok:false", badHH.ok === false, JSON.stringify(badHH));
  check("advance --toClock \"3:99:00\" -> reason present", typeof badHH.reason === "string", JSON.stringify(badHH));
  let afterMalformed1 = clockOnDisk(dir);
  check("malformed --toClock (bad HH) leaves state.json clock unchanged",
    afterMalformed1.day === beforeMalformed1.day && afterMalformed1.min === beforeMalformed1.min,
    `before=${JSON.stringify(beforeMalformed1)} after=${JSON.stringify(afterMalformed1)}`);

  // 6) malformed --toClock: unparseable string -> {ok:false,reason}, state untouched.
  const beforeMalformed2 = clockOnDisk(dir);
  const garbage = run("advance", ["--dir", dir, "--toClock", "garbage"]);
  check("advance --toClock \"garbage\" -> ok:false", garbage.ok === false, JSON.stringify(garbage));
  const afterMalformed2 = clockOnDisk(dir);
  check("malformed --toClock (garbage) leaves state.json clock unchanged",
    afterMalformed2.day === beforeMalformed2.day && afterMalformed2.min === beforeMalformed2.min,
    `before=${JSON.stringify(beforeMalformed2)} after=${JSON.stringify(afterMalformed2)}`);

  // 7) malformed --toBand -> {ok:false,reason}, state untouched.
  const beforeMalformed3 = clockOnDisk(dir);
  const badBand = run("advance", ["--dir", dir, "--toBand", "midnight-snack"]);
  check("advance --toBand \"midnight-snack\" -> ok:false", badBand.ok === false, JSON.stringify(badBand));
  const afterMalformed3 = clockOnDisk(dir);
  check("malformed --toBand leaves state.json clock unchanged",
    afterMalformed3.day === beforeMalformed3.day && afterMalformed3.min === beforeMalformed3.min,
    `before=${JSON.stringify(beforeMalformed3)} after=${JSON.stringify(afterMalformed3)}`);

  // 8) regression — --minutes alone (no toClock/toBand) still advances forward exactly as before.
  const beforeMinutes = clockOnDisk(dir);
  const minutesRes = run("advance", ["--dir", dir, "--minutes", "30"]);
  check("advance --minutes 30 (no toClock/toBand) -> ok:true", minutesRes.ok === true, JSON.stringify(minutesRes));
  const afterMinutes = clockOnDisk(dir);
  const totalBefore = beforeMinutes.day * 1440 + beforeMinutes.min;
  const totalAfter = afterMinutes.day * 1440 + afterMinutes.min;
  check("advance --minutes 30 moved the clock forward by exactly 30 minutes",
    totalAfter === totalBefore + 30,
    `before=${JSON.stringify(beforeMinutes)} after=${JSON.stringify(afterMinutes)}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
