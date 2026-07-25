/* Independent receipt measurement for CL-R3 / CL-F01.
   Usage: node dev/measure-clay-structure-bench.cjs <captureDir> */
const fs = require("fs");
const path = require("path");

const dir = process.argv[2];
if (!dir) {
  console.error("usage: node dev/measure-clay-structure-bench.cjs <captureDir>");
  process.exit(2);
}
const receiptPath = path.join(dir, "cl-r3-structure-bench-receipt.json");
const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
const snap = receipt.timeline.settled.structure;
const strategic = receipt.views.find((row) => row.view === "strategic").probe.structure;
const stagedDoorShut = receipt.stagingSequence.stagedDoorShut.structure;
const sealedDoorOpen = receipt.stagingSequence.sealedDoorOpen.structure;
const stagedAgain = receipt.stagingSequence.stagedAgain.structure;
const checks = {
  fixture: snap.fixtureId === "cl-f01-structure-bench" && snap.mounted,
  cells: snap.shell.meta.floorCellCount === 32,
  elevations: JSON.stringify(snap.shell.tiers) === JSON.stringify([-1, 0, 1]),
  construction: snap.shell.wallSegments >= 8 && snap.shell.riserSegments >= 2
    && snap.shell.apertures === 1 && snap.shell.exposedSlabSides,
  slope: snap.slope.walkable && snap.slope.degrees <= 30,
  joinFailure: !snap.negativeControl.accepted
    && snap.negativeControl.reason === "socket-axis-mismatch"
    && snap.negativeControl.visibleGap,
  shadows: snap.shadowCasters >= 20 && snap.shadowReceivers >= 20,
  ownership: receipt.timeline.settled.surfaceCensus.unclaimed.length === 0
    && receipt.timeline.settled.surfaceCensus.texturedClayCount === 0,
  provenance: snap.specimens.every((row) => row.provenance
    && row.provenance.source === "docs/STRUCTURE-KIT-CATALOG.md"),
  dynamicCutaway: snap.dynamicCutaway.blocking > 0
    && snap.dynamicCutaway.faded > 0
    && receipt.timeline.settled.productionOcclusion.pillarGhosts.length > 0,
  stagedLatch: snap.wallOmission.staged && snap.wallOmission.latched
    && snap.wallOmission.active && snap.shell.omittedUpperSegments > 0
    && stagedDoorShut.wallOmission.doorState === "shut"
    && stagedDoorShut.wallOmission.active,
  rawDoorDoesNotStage: sealedDoorOpen.wallOmission.doorState === "open"
    && !sealedDoorOpen.wallOmission.staged
    && !sealedDoorOpen.wallOmission.active
    && sealedDoorOpen.shell.omittedUpperSegments === 0,
  explicitRestaging: stagedAgain.wallOmission.staged
    && stagedAgain.wallOmission.latched
    && stagedAgain.wallOmission.active
    && stagedAgain.shell.omittedUpperSegments > 0,
  strategicAllWalls: strategic.wallOmission.cameraMode === "top-down-strategic"
    && !strategic.wallOmission.active
    && strategic.shell.omittedUpperSegments === 0
    && strategic.shell.builtUpperSegments === strategic.shell.totalUpperSegments,
  omissionCarveouts: snap.wallOmission.apertureUpperBuilt
    && snap.wallOmission.structuralMassBuilt
    && snap.wallOmission.carveouts.aperture
    && snap.wallOmission.carveouts.structuralMass
    && snap.wallOmission.carveouts.strategicView,
  noClimbMechanicsClaim: snap.climbMechanicsImplemented === false,
  console: receipt.consoleErrors.length === 0
};
const failed = Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name);
const measurement = {
  gate: "CL-R3",
  fixture: "CL-F01",
  sourceReceipt: path.basename(receiptPath),
  measuredAt: new Date().toISOString(),
  values: {
    floorCells: snap.shell.meta.floorCellCount,
    tiers: snap.shell.tiers,
    wallSegments: snap.shell.wallSegments,
    riserSegments: snap.shell.riserSegments,
    apertures: snap.shell.apertures,
    omittedUpperSegments: snap.shell.omittedUpperSegments,
    strategicBuiltUpperSegments: strategic.shell.builtUpperSegments,
    rampDegrees: snap.slope.degrees,
    mountedMeshes: snap.mountedMeshes,
    shadowCasters: snap.shadowCasters,
    shadowReceivers: snap.shadowReceivers,
    dynamicCutawayCandidates: snap.dynamicCutaway.candidates
  },
  checks,
  failed
};
fs.writeFileSync(path.join(dir, "cl-r3-structure-bench-measurement.json"), JSON.stringify(measurement, null, 2));
if (failed.length) {
  console.error("MEASUREMENT_FAILED", failed.join(", "));
  process.exit(1);
}
console.log("MEASUREMENT_OK", Object.keys(checks).length + "/" + Object.keys(checks).length);
