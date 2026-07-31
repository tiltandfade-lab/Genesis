#!/usr/bin/env node
/* Independent gate for the generated Golden Vignette architecture-ruling overlay.

   Run after:
     node dev/golden-vignette-architecture-ruling-audit.mjs --emit
*/

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), "utf8"));
const readJsonlGz = (path) => gunzipSync(readFileSync(join(ROOT, path))).toString("utf8")
  .trimEnd().split("\n").map((line) => JSON.parse(line));

let passed = 0;
let failed = 0;
function check(name, condition, detail = null) {
  if (condition) {
    passed++;
    console.log("  ✓", name);
  } else {
    failed++;
    console.log("  ✗", name, detail == null ? "" : `— ${JSON.stringify(detail)}`);
  }
}

const drift = spawnSync(
  process.execPath,
  [join(ROOT, "dev", "golden-vignette-architecture-ruling-audit.mjs"), "--check"],
  { encoding: "utf8" }
);
const source = readJsonlGz("docs/intel/golden-vignette-wave1-corpus.jsonl.gz");
const overlay = readJsonlGz("docs/intel/golden-vignette-architecture-ruling-overlay.jsonl.gz");
const report = readJson("docs/intel/golden-vignette-architecture-ruling-audit.json");
const sourceById = new Map(source.map((row) => [row.caseId, row]));

console.log("\nGolden Vignette architecture ruling audit");
check("generated report and overlay reproduce byte-for-byte", drift.status === 0, drift.stderr || drift.stdout);
check("overlay is one-to-one with the retained corpus",
  overlay.length === source.length && new Set(overlay.map((row) => row.caseId)).size === source.length,
  { source: source.length, overlay: overlay.length });
check("every overlay row preserves its request disposition",
  overlay.every((row) => {
    const before = sourceById.get(row.caseId);
    return before
      && row.sourceDisposition === before.disposition
      && row.dispositionAfterOverlay === before.disposition;
  }));
check("scale-coded local features remain DECORATE_LOCAL",
  overlay.filter((row) =>
    row.scaleRelation.required && sourceById.get(row.caseId)?.disposition === "DECORATE_LOCAL")
    .every((row) => row.dispositionAfterOverlay === "DECORATE_LOCAL"));
check("pure caverns never imply architecture or a lair",
  overlay.filter((row) => {
    const before = sourceById.get(row.caseId);
    return before?.owners?.host?.includes("NaturalCavernHost")
      && !before?.owners?.host?.includes("EcologyClaimHost");
  }).every((row) =>
    !row.architectureBearing
      && row.proofDemands.includes("PURE_CAVERN_WITHOUT_LAIR_IMPLICATION")));
check("ruin alone never licenses a hybrid",
  overlay.every((row) =>
    row.battleSpace.mode !== "CAUSALLY_JUSTIFIED_HYBRID"
      || !!row.battleSpace.exposingCause));
check("no GIANT_LEGACY regime is inferred from size alone",
  overlay.every((row) =>
    row.institutionalScaleClass !== "GIANT_LEGACY"
      && row.scaleRelation.giantLegacyInferred === false));
check("new architecture candidates owe the complete assembly gate",
  overlay.filter((row) => row.architectureBearing).every((row) =>
    row.assemblyClearance?.requiredForNewCandidates
      && row.assemblyClearance.checks.includes("ROOF_WALL_JUNCTION_CLOSURE")
      && row.assemblyClearance.checks.includes("SUPPORT_AND_FOUNDATION_DATUM")
      && row.assemblyClearance.checks.includes("DIRECT_STAIR_SEAM")
      && row.assemblyClearance.checks.includes("ROUTE_AND_HEADROOM_CLEARANCE")
      && row.assemblyClearance.checks.includes("FIXED_CAMERA_OCCLUSION")));
check("report exposes the unresolved Prison / Asylum pattern",
  report.census.prisonAsylum > 0
    && overlay.filter((row) =>
      row.unresolved.includes("PRISON_OR_ASYLUM_PROGRAM_REQUIRED"))
      .every((row) => row.sourceDisposition === "UNRESOLVED"));
check("report fingerprint and row counts agree with artifacts",
  report.source.rowCount === source.length && report.overlay.rowCount === overlay.length);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
