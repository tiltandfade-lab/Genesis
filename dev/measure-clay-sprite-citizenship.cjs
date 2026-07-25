/* CL-R2 measurement step.

   Reads the live CL-F03 capture receipt and emits the compact geometry/scale verdict that can be
   diffed without opening the screenshots. Visual taste still belongs to Adam.

   Usage:
     node dev/measure-clay-sprite-citizenship.cjs <receipt.json> <measurements.json>
*/
const fs = require("fs");
const path = require("path");

const receiptPath = process.argv[2];
const outputPath = process.argv[3];
if (!receiptPath || !outputPath) {
  console.error("usage: node dev/measure-clay-sprite-citizenship.cjs <receipt.json> <measurements.json>");
  process.exit(2);
}

const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
const canonical = receipt.canonical;
const capped = receipt.diagnosticCap;
if (!canonical || !capped) throw new Error("receipt is missing canonical/capped snapshots");

const cappedBySlug = Object.fromEntries(capped.lineup.map((row) => [row.slug, row]));
const rows = canonical.lineup.map((row) => {
  const cap = cappedBySlug[row.slug];
  if (!cap) throw new Error("capped snapshot is missing " + row.slug);
  const round = (value) => Number.isFinite(value) ? +value.toFixed(6) : null;
  return {
    slug: row.slug,
    canonicalFeet: row.canonicalFeet,
    trueScaleShownFeet: round(row.renderedWorldHeight * 5),
    capShownFeet: round(cap.renderedWorldHeight * 5),
    canonicalDataPreservedInCap: cap.canonicalFeet === row.canonicalFeet,
    tacticalSpanCells: row.tacticalSpanCells,
    supportWidthCells: round(row.supportWidth),
    supportDepthCells: round(row.supportDepth),
    stairTreadDepthCells: round(row.treadDepth),
    supportToTreadRatio: round(row.supportDepth / row.treadDepth),
    supportFitsTread: row.stairFit,
    renderedWidthToTacticalSpan: round(row.renderedWorldWidth / row.tacticalSpanCells),
    sideShell: row.shell,
    contentBounds: row.contentBounds,
    regenRecommended: row.regenRecommended,
  };
});

const measurements = {
  gate: receipt.gate,
  fixture: receipt.fixture,
  sourceReceipt: path.basename(receiptPath),
  castCount: rows.length,
  scaleModes: {
    canonical: canonical.scaleMode,
    comparison: capped.scaleMode,
    canonicalFeetRange: [
      Math.min(...rows.map((row) => row.canonicalFeet)),
      Math.max(...rows.map((row) => row.canonicalFeet)),
    ],
    capShownFeetRange: [
      Math.min(...rows.map((row) => row.capShownFeet)),
      Math.max(...rows.map((row) => row.capShownFeet)),
    ],
    capPreservesCanonicalData: rows.every((row) => row.canonicalDataPreservedInCap),
  },
  support: {
    form: canonical.supportForm,
    tacticalFootprintSeparate: canonical.tacticalFootprintSeparate,
    everySupportFitsTread: rows.every((row) => row.supportFitsTread),
    mediumSupportEqualsOneTread: rows
      .filter((row) => row.tacticalSpanCells === 1 && row.canonicalFeet >= 5)
      .every((row) => Math.abs(row.supportToTreadRatio - 1) < 0.000001),
    stairViews: canonical.stairSamples.map((row) => ({
      view: row.view,
      supportToTreadRatio: +(row.supportDepth / row.treadDepth).toFixed(6),
      pass: row.stairFit,
    })),
  },
  citizenship: {
    everySpriteHasContentBounds: rows.every((row) => Array.isArray(row.contentBounds)),
    everySpriteHasSideShell: rows.every((row) => row.sideShell),
    widthRegenerationFlags: rows.filter((row) => row.regenRecommended).map((row) => row.slug),
  },
  lightingContextIds: receipt.lightingContexts.map((row) => row.recipeId),
  rows,
};

if (measurements.castCount !== 7
  || !measurements.scaleModes.capPreservesCanonicalData
  || !measurements.support.everySupportFitsTread
  || !measurements.support.mediumSupportEqualsOneTread
  || !measurements.citizenship.everySpriteHasContentBounds
  || !measurements.citizenship.everySpriteHasSideShell) {
  throw new Error("CL-R2 measurement gate failed");
}

fs.writeFileSync(outputPath, JSON.stringify(measurements, null, 2) + "\n");
console.log(
  "MEASURE_DONE",
  "cast=" + measurements.castCount,
  "range=" + measurements.scaleModes.canonicalFeetRange.join("-") + "ft",
  "cap=" + measurements.scaleModes.capShownFeetRange.join("-") + "ft",
  "flags=" + measurements.citizenship.widthRegenerationFlags.length
);
