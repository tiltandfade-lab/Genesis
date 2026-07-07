/* dev/battle-gate/assert-metrics.mjs — THEATER-NEXT §2.1: the machine gate over capture-stage.mjs's
   round0/metrics.json. capture-stage.mjs already produces honest pixels+metrics from a REAL headless
   Chrome run; this script is the missing piece — it turns those metrics into a hard pass/fail a CI
   command can trip on, instead of relying on an eyeball.

   House style matches every other dev/verify-*.mjs harness in this repo: one ✓/✗ line per assert,
   ending in "N passed, M failed", exit 1 on any failure.

   A MISSING or RENAMED key is a FAILURE, never a skip — metrics.json's shape is authoritative (it's
   capture-stage.mjs's own writer); if that writer's shape ever drifts, this gate must scream, not
   shrug silently past a key it can no longer find.

   Run:  node dev/battle-gate/assert-metrics.mjs   (reads dev/battle-gate/round0/metrics.json —
         run node dev/battle-gate/capture-stage.mjs first to produce a fresh one) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const METRICS_PATH = join(ROOT, "dev", "battle-gate", "round0", "metrics.json");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// --- pre-flight: read + parse (a missing/unreadable file is itself the first failure) ---
let raw = null;
try {
  raw = readFileSync(METRICS_PATH, "utf-8");
} catch (e) {
  console.log("  ✗ pre-flight: metrics.json unreadable —", e.message);
  console.log(`\n0 passed, 1 failed`);
  process.exit(1);
}

let metrics = null;
try {
  metrics = JSON.parse(raw);
} catch (e) {
  console.log("  ✗ pre-flight: metrics.json is not valid JSON —", e.message);
  console.log(`\n0 passed, 1 failed`);
  process.exit(1);
}

// --- B-E3: staleness guard — a metrics.json from a stale prior run (generatedAt older than 30
// minutes) short-circuits to 0 passed, 1 failed BEFORE M-1 runs. This is a pre-flight guard, not
// itself one of the 10 M-counted asserts. ---
{
  const generatedAt = metrics && metrics.generatedAt;
  const parsed = generatedAt ? Date.parse(generatedAt) : NaN;
  const ageMs = isNaN(parsed) ? Infinity : (Date.now() - parsed);
  const STALE_MS = 30 * 60 * 1000;
  if (isNaN(parsed) || ageMs > STALE_MS) {
    console.log(`  ✗ stale-metrics — generatedAt=${generatedAt || "(missing)"} ageMs=${isNaN(parsed) ? "n/a (unparseable)" : ageMs}`);
    console.log(`\n0 passed, 1 failed`);
    process.exit(1);
  }
}

// helper: safe nested-path read; returns undefined without throwing on any missing hop.
const at = (obj, path) => path.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), obj);

// M-1
check("M-1. theaterMounted === true", metrics.theaterMounted === true, JSON.stringify(metrics.theaterMounted));

// M-2 — never loosen this by sampling the live canvas (README's preserveDrawingBuffer gotcha).
check("M-2. canvasConfirmedNonBlank === true", metrics.canvasConfirmedNonBlank === true, JSON.stringify(metrics.canvasConfirmedNonBlank));

// M-3 — letterbox/stretch (backing vs client aspect)
{
  const delta = at(metrics, "stage1440.theaterStageCanvas.aspectDelta");
  check("M-3. stage1440.theaterStageCanvas.aspectDelta <= 0.02", typeof delta === "number" && delta <= 0.02, JSON.stringify(delta));
}

// M-4..M-7 — the IN-SESSION-UI no-scroll law at both sizes + both modes
check("M-4. stage1440.pageScroll.equal === true", at(metrics, "stage1440.pageScroll.equal") === true, JSON.stringify(at(metrics, "stage1440.pageScroll")));
check("M-5. stage1280.pageScroll.equal === true", at(metrics, "stage1280.pageScroll.equal") === true, JSON.stringify(at(metrics, "stage1280.pageScroll")));
check("M-6. explore.pageScroll.equal === true", at(metrics, "explore.pageScroll.equal") === true, JSON.stringify(at(metrics, "explore.pageScroll")));
check("M-7. classic.pageScroll.equal === true", at(metrics, "classic.pageScroll.equal") === true, JSON.stringify(at(metrics, "classic.pageScroll")));

// M-8 — right-rail horizontal overflow / clipped text
{
  const od = at(metrics, "stage1440.overflowingDescendants");
  check("M-8. stage1440.overflowingDescendants.length === 0", Array.isArray(od) && od.length === 0, JSON.stringify(od));
}

// M-9 — any runtime error either mode. capture-stage.mjs's own writer shapes consoleErrors as
// {stage:[],classic:[],explore:[]} (three named buckets, not a flat array) — flatten to a total
// count so "any runtime error either mode" is asserted honestly against the real shape, per this
// gate's own "a missing/renamed key is a failure" law: a consoleErrors that ISN'T the expected
// {stage,classic,explore} array-bucket shape fails outright rather than silently reading as 0.
{
  const ce = metrics.consoleErrors;
  const bucketsOk = ce && typeof ce === "object"
    && Array.isArray(ce.stage) && Array.isArray(ce.classic) && Array.isArray(ce.explore);
  const total = bucketsOk ? (ce.stage.length + ce.classic.length + ce.explore.length) : NaN;
  check("M-9. consoleErrors — zero runtime errors across stage/classic/explore", bucketsOk && total === 0,
    bucketsOk ? `total=${total} ${JSON.stringify(ce)}` : `unexpected shape: ${JSON.stringify(ce)}`);
}

// M-10 — classic-fallback arena art 404. The committed metrics.json writes arenaHttpStatus as an
// OBJECT {status, ok}, not a bare integer — assert the nested .status; a non-object/missing .status
// is itself a FAILURE (never treated as a skip).
{
  const ahs = at(metrics, "classic.arenaHttpStatus");
  const statusOk = ahs && typeof ahs === "object" && ahs.status === 200;
  check("M-10. classic.arenaHttpStatus.status === 200", statusOk, JSON.stringify(ahs));
}

// NOTE: TN-C (THEATER-NEXT §3.3) appends M-11..M-14 (rebuildStats dirty-key proof) to this same
// file's asserts, growing the total from 10 to 14 — that edit lands with TN-C, not here (Unit B's
// own acceptance is exactly 10 passed, 0 failed per §2.1).

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
