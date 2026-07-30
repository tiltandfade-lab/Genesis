#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const rubricPath = path.join(root, "docs/intel/golden-vignette-visual-rubric-v1.json");
const assetforgeLedgerPath = path.join(
  root,
  "docs/intel/golden-vignette-assetforge-applications-v1.json"
);
const guidePath = path.join(root, "docs/GOLDEN-VIGNETTE-VISUAL-GUIDE.md");

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const rubric = JSON.parse(fs.readFileSync(rubricPath, "utf8"));
const assetforgeLedger = JSON.parse(fs.readFileSync(assetforgeLedgerPath, "utf8"));
const guide = fs.readFileSync(guidePath, "utf8");

check(rubric.schemaVersion === 1, "rubric schemaVersion must be 1");
check(rubric.rubricId === "golden-vignette-visual-rubric-v1", "unexpected rubricId");
check(assetforgeLedger.schemaVersion === 1, "Assetforge ledger schemaVersion must be 1");
check(
  assetforgeLedger.ledgerId === "golden-vignette-assetforge-applications-v1",
  "unexpected Assetforge ledgerId"
);

for (const relativePath of [
  ...Object.values(rubric.authority),
  ...rubric.evidence,
  ...Object.values(assetforgeLedger.authority)
]) {
  check(fs.existsSync(path.join(root, relativePath)), `missing routed source: ${relativePath}`);
}

const unique = (items) => new Set(items).size === items.length;
const rejectionCodes = rubric.hardRejections.map((entry) => entry.code);
check(unique(rejectionCodes), "hard-rejection codes must be unique");

for (const required of [
  "RANDOM_TILE_TERRAIN",
  "DIAGONAL_ZIPPER",
  "SEDIMENTARY_RIDGE_REPEAT",
  "GLOBAL_HEIGHT_CAP",
  "MATERIAL_INVENTS_AFFORDANCE",
  "CAMERA_MUTATES_TRUTH",
  "UNCAUSED_WEAR",
  "PHYSICAL_STATE_INVENTS_OPERATION",
  "SHARED_PARENT_MUTATION",
  "ACTIVE_FLOOR_OBSCURED",
  "IDENTITY_OBLIGATION_DROPPED"
]) {
  check(rejectionCodes.includes(required), `missing hard rejection: ${required}`);
}

const stages = rubric.materialPipeline.stages.map((entry) => entry.id);
check(
  JSON.stringify(stages) === JSON.stringify([
    "SEMANTIC_IDENTITY_RESERVATION",
    "FACE_TOPOLOGY",
    "SURFACE_MATERIAL_DEMAND",
    "ASSET_RESOLUTION"
  ]),
  "material stages must preserve semantic -> face -> material -> resolver order"
);

const surfaceRoles = rubric.materialPipeline.surfaceRoles;
check(unique(surfaceRoles), "surface roles must be unique");
for (const required of [
  "WALKABLE_TOP",
  "NATURAL_SLOPE",
  "CUT_FACE",
  "RETAINING_FACE",
  "WALL_FIELD",
  "CROWN_COPING",
  "JAMB_REVEAL",
  "ROOF_DECK",
  "WATERLINE_EDGE",
  "UNDERSIDE_SUPPORT",
  "MOUNT_FACE",
  "SCENERY_FACE"
]) {
  check(surfaceRoles.includes(required), `missing surface role: ${required}`);
}

check(
  rubric.softTargets.every((entry) => entry.binding === "SOFT"),
  "every soft target must be explicitly marked SOFT"
);
check(
  rubric.provisionalCalibrations.every((entry) => entry.binding === "PROVISIONAL_AB"),
  "every numerical calibration must remain explicitly provisional"
);

check(
  JSON.stringify(rubric.camera.bearingsDegrees) === JSON.stringify([0, 90, 180, 270]),
  "camera bearings must be the four governed quarter turns"
);
check(rubric.camera.freeOrbit === false, "free orbit must remain disabled");
check(
  rubric.camera.worldTruthImmutableAcrossBearings === true,
  "world truth must remain immutable across bearings"
);

const assetforgeIds = assetforgeLedger.applications.map((entry) => entry.id);
const assetforgeSlugs = assetforgeLedger.applications.map((entry) => entry.slug);
check(assetforgeLedger.applications.length === 8, "expected eight Golden Assetforge applications");
check(unique(assetforgeIds), "Golden Assetforge application ids must be unique");
check(unique(assetforgeSlugs), "Golden Assetforge application slugs must be unique");
check(
  assetforgeLedger.applications.every((entry) => entry.status === "SPECCED_UNBUILT"),
  "Golden Assetforge applications must remain explicitly SPECCED_UNBUILT"
);
check(
  JSON.stringify(assetforgeLedger.deliveryOrder) === JSON.stringify([
    "AF-GV-1",
    "AF-GV-2",
    "AF-GV-3",
    "AF-GV-4",
    "AF-GV-8",
    "AF-GV-6",
    "AF-GV-5",
    "AF-GV-7"
  ]),
  "Golden Assetforge delivery order drifted"
);
check(
  assetforgeLedger.policy.duplicateCanonicalAlgorithmsForbidden === true,
  "Assetforge applications must forbid duplicate canonical algorithms"
);

for (const phrase of [
  "FFT's composition economy + Triangle Strategy's material and presentation",
  "The two-stage demand",
  "SEMANTIC_IDENTITY_RESERVATION",
  "SURFACE_MATERIAL_DEMAND",
  "There is no one-quantum, five-foot, or two-storey global terrain limit",
  "A pure cavern does not imply a lair",
  "`RUIN` is a physical state, not an operating model",
  "four canonical bearings separated by exactly 90 degrees",
  "Three to six broad material families",
  "provisional A/B calibration"
]) {
  check(guide.includes(phrase), `visual guide is missing required phrase: ${phrase}`);
}

if (failures.length) {
  console.error(`Golden Vignette visual guide verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  [
    "Golden Vignette visual guide verification passed",
    `hard rejections: ${rejectionCodes.length}`,
    `soft targets: ${rubric.softTargets.length}`,
    `surface roles: ${surfaceRoles.length}`,
    `material stages: ${stages.join(" -> ")}`,
    `camera bearings: ${rubric.camera.bearingsDegrees.join(", ")}`,
    `Golden Assetforge applications: ${assetforgeIds.join(", ")}`
  ].join("\n")
);
