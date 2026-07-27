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
const climbSuccess = receipt.climbSuccess.structure.climb;
const wallClimbSuccess = receipt.wallClimbSuccess.structure.climb;
const climbFall = receipt.climbFall.structure.climb;
const checks = {
  fixture: snap.fixtureId === "cl-f01-structure-bench" && snap.mounted,
  cells: snap.shell.meta.floorCellCount === 32,
  elevations: JSON.stringify(snap.shell.tiers) === JSON.stringify([-1, 0, 1]),
  construction: snap.shell.wallSegments >= 8 && snap.shell.riserSegments >= 2
    && snap.shell.apertures === 1 && snap.shell.exposedSlabSides
    && snap.shell.polygonKernel === "oss"
    && snap.connectiveTissue.foundationRuns > 0
    && snap.connectiveTissue.foundationCorners > 0
    && snap.connectiveTissue.wallJunctions > 0
    && snap.connectiveTissue.cutawayReturns > 0,
  adaptiveStairs: [2, 3, 5].every((feet) => snap.stairAdapter.examples.some((row) => row.riseFeet === feet))
    && snap.stairAdapter.examples.every((row) => row.footprintCells === 1)
    && snap.stairAdapter.cornerFamilies.length === 2
    && snap.stairAdapter.cornerTopologies.some((row) => row.topology === "inverse-expanding-l-bands-smallest-low")
    && snap.stairAdapter.cornerTopologies.some((row) => row.topology === "open-quadrant-l-wrap-smallest-high")
    && snap.stairAdapter.fullStoreyProof.connected
    && snap.stairAdapter.fullStoreyProof.stairUnits === 2
    && snap.stairAdapter.fullStoreyProof.footprintCells === 2
    && snap.stairAdapter.fullStoreyProof.riseFeet === 10
    && snap.stairAdapter.lStoreyProof.connected
    && snap.stairAdapter.lStoreyProof.footprintCells === 3
    && snap.stairAdapter.lStoreyProof.turnDeg === 90
    && snap.stairAdapter.lStoreyProof.riseFeet === 10,
  balancedStairParking: receipt.stairParking
    && receipt.stairParking.centered
    && receipt.stairParking.balanced
    && receipt.stairParking.baseBottomOnSurface
    && !receipt.stairParking.clipsTreadEdge,
  standableSupports: snap.specimens
    .filter((row) => row.kind === "support-square" || row.kind === "support-round")
    .every((row) => row.access.top === "walk" && row.access.shaft === "climb-dc"),
  slope: snap.slope.walkable && snap.slope.degrees <= 30,
  joinFailure: !snap.negativeControl.accepted
    && snap.negativeControl.reason === "socket-axis-mismatch"
    && snap.negativeControl.visibleGap,
  shadows: snap.shadowCasters >= 20 && snap.shadowReceivers >= 20,
  shadowContact: snap.shadowContact
    && snap.shadowContact.rendererFilter === "pcf"
    && snap.shadowContact.frontFaceShadowCasters === snap.shadowCasters
    && snap.shadowContact.automaticShadowCasters === 0
    && snap.shadowContact.directionalLights.some((row) => row.bias === -0.001
      && row.normalBias === 0
      && row.mapSize[0] === 2048
      && row.mapSize[1] === 2048),
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
  climbMechanics: snap.climbMechanicsImplemented
    && climbSuccess.phase === "perched"
    && climbSuccess.last.passed
    && climbSuccess.perchAudit.baseBottomOnSurface
    && /^compiled-/.test(wallClimbSuccess.target.id)
    && wallClimbSuccess.last.passed
    && wallClimbSuccess.perchAudit.baseBottomOnSurface
    && climbFall.phase === "fell"
    && climbFall.last.damage === "1d6"
    && climbFall.last.prone,
  traversabilityGrid: snap.traversabilityGrid
    && snap.traversabilityGrid.contract === "every-flat-or-traversable-surface"
    && snap.traversabilityGrid.hostFloorCells === 225
    && snap.traversabilityGrid.shellFloorCells === 32
    && snap.traversabilityGrid.stairTreads > 0
    && snap.traversabilityGrid.walkableTops > 0
    && receipt.roundTopGrid.grid.roundTops === 1
    && receipt.rampGrid.grid.rampSurfaces === 1
    && receipt.roomTruthGrid.grid.crateTops === 1,
  sourcePlusMood: receipt.moodExamples.length === 4
    && receipt.moodExamples.every((row) => (
      row.probe.mood.sourceRetained
      && row.probe.mood.underEnergyCap
      && !row.probe.mood.moodCastsShadow
    ))
    && receipt.moodExamples.find((row) => row.recipeId === "torchlit")
      .probe.lighting.snapshot.lights.some((row) => row.emitterBloomSuppressed),
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
    polygonKernel: snap.shell.polygonKernel,
    foundationRuns: snap.connectiveTissue.foundationRuns,
    foundationCorners: snap.connectiveTissue.foundationCorners,
    wallJunctions: snap.connectiveTissue.wallJunctions,
    cutawayReturns: snap.connectiveTissue.cutawayReturns,
    adaptiveStairRisesFeet: snap.stairAdapter.examples.map((row) => row.riseFeet),
    straightStoreyFootprintCells: snap.stairAdapter.fullStoreyProof.footprintCells,
    lStoreyFootprintCells: snap.stairAdapter.lStoreyProof.footprintCells,
    lStoreyTurnDeg: snap.stairAdapter.lStoreyProof.turnDeg,
    stairParking: receipt.stairParking,
    apertures: snap.shell.apertures,
    omittedUpperSegments: snap.shell.omittedUpperSegments,
    strategicBuiltUpperSegments: strategic.shell.builtUpperSegments,
    rampDegrees: snap.slope.degrees,
    mountedMeshes: snap.mountedMeshes,
    shadowCasters: snap.shadowCasters,
    shadowReceivers: snap.shadowReceivers,
    shadowContact: snap.shadowContact,
    traversabilityGrid: snap.traversabilityGrid,
    moodPairs: receipt.moodExamples.map((row) => ({
      pairId: row.probe.mood.pairId,
      combinedMoodIntensity: row.probe.mood.combinedMoodIntensity,
      sourceRetained: row.probe.mood.sourceRetained,
      moodCastsShadow: row.probe.mood.moodCastsShadow
    })),
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
