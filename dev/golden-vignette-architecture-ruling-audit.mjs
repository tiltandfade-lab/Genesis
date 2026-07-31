#!/usr/bin/env node
/* Golden Site architecture-ruling audit.

   Reads the retained Wave-1 request corpus as an immutable before-state, applies the
   2026-07-29/30 battle-space, institutional-scale, body-relation, and assembly rulings
   as a read-only overlay, and emits a compact report plus a gzip JSONL overlay.

   This script does not call or alter production rollers. It never changes a request
   disposition, promotes a local feature into a site, infers a lair from a cavern, or
   infers GIANT_LEGACY from size alone.

   Usage:
     node dev/golden-vignette-architecture-ruling-audit.mjs
     node dev/golden-vignette-architecture-ruling-audit.mjs --emit
     node dev/golden-vignette-architecture-ruling-audit.mjs --check
*/

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INTEL = join(ROOT, "docs", "intel");
const SOURCE = join(INTEL, "golden-vignette-wave1-corpus.jsonl.gz");
const REPORT_JSON = join(INTEL, "golden-vignette-architecture-ruling-audit.json");
const REPORT_MD = join(INTEL, "golden-vignette-architecture-ruling-audit.md");
const OVERLAY_GZ = join(INTEL, "golden-vignette-architecture-ruling-overlay.jsonl.gz");
const AUDIT_VERSION = "golden-vignette-architecture-ruling-audit/1";

const ARCHITECTURE_OWNERS = new Set([
  "DefenseRouteControlHost",
  "DefenseFortificationHost",
  "TransientServiceHost",
  "CommunalInstitutionHost",
  "ExtractionWorkHost",
  "WorkshopProductionHost",
  "InfrastructureWorksHost",
  "CustodyHost",
  "UrbanInstitutionHost",
  "HospitalityEntertainmentVenue",
  "HospitalityVenue",
  "ServiceInfrastructureHost",
  "FuneraryMortuaryHost",
  "ReligiousSanctuaryHost",
  "ResidentialEstateHost",
  "LivingSubstrateHost",
  "MegastructureHost",
  "CivicAdministrationHost",
  "MarketExchangeHost",
  "UrbanFabric"
]);

const BUILT_LOCAL_RE = /\b(?:aqueduct|arch|barricade|bridge|building|cauldron|chain|coffin|column|dagger|door|fort|gate|grate|helmet|obelisk|pillar|road|roof|shrine|spear|statue|sundial|sword|throne|tower|wall)\b/i;
const SCALE_WORD_RE = /\b(?:colossal|cyclopean|gargantuan|giant|titan(?:ic)?)\b/i;
const CREATURE_SCALE_RE = /\b(?:dragon|leviathan|tarrasque|behemoth)\b/i;
const EXPLICIT_SIZE_RE = /\b(?:size of (?:a |an )?(?:house|building|tower)|\d+\s*(?:feet|foot|ft)\b|\d+\s*')/i;
const CAUSAL_HYBRID_RE = /\b(?:breached (?:wall|roof)|collapsed roof|open-roofed|roofless|wall breach|exposed by collapse)\b/i;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
function counter() {
  return new Map();
}
function count(map, key, amount = 1) {
  const normalized = key == null || key === "" ? "NONE" : String(key);
  map.set(normalized, (map.get(normalized) || 0) + amount);
}
function tally(map, total) {
  return [...map.entries()]
    .map(([key, n]) => ({
      key,
      count: n,
      pct: Number((n * 100 / Math.max(1, total)).toFixed(3))
    }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}
function includesAny(values, options) {
  return (values || []).some((value) => options.has(value));
}
function rowText(row) {
  return [
    row.observations?.primaryType,
    row.observations?.primaryFeature,
    row.observations?.biome
  ].filter(Boolean).join(" ");
}
function featureText(row) {
  return String(row.observations?.primaryFeature || "");
}
function isPrisonAsylum(row) {
  return /prison\s*\/\s*asylum|prison.*asylum|asylum.*prison/i
    .test(String(row.observations?.primaryType || ""));
}
function isNaturalCavern(row) {
  return (row.owners?.host || []).includes("NaturalCavernHost")
    && !(row.owners?.host || []).includes("EcologyClaimHost");
}
function isArchitectureBearing(row) {
  if (isPrisonAsylum(row)) return true;
  return includesAny(row.owners?.host, ARCHITECTURE_OWNERS);
}
function isPersistedMode(row) {
  return !!row.priorPlanRef
    || (Array.isArray(row.frontierRefs) && row.frontierRefs.length > 0)
    || ["return", "persisted-site"].includes(row.entryPath);
}

function battleSpaceFor(row, architectureBearing) {
  if (!architectureBearing) {
    return {
      resolution: "NOT_ARCHITECTURE_BEARING",
      mode: null,
      confidence: "direct",
      exposingCause: null
    };
  }
  if (isPersistedMode(row)) {
    return {
      resolution: "INHERIT_COMMITTED_MODE",
      mode: null,
      confidence: "required-inheritance",
      exposingCause: null
    };
  }

  const text = rowText(row);
  if (CAUSAL_HYBRID_RE.test(text)) {
    return {
      resolution: "RESOLVED",
      mode: "CAUSALLY_JUSTIFIED_HYBRID",
      confidence: "explicit-cause",
      exposingCause: text.match(CAUSAL_HYBRID_RE)?.[0] || "explicit-source-cause"
    };
  }
  if (row.requestFamily === "dungeon"
      || /underworks/i.test(String(row.observations?.primaryType || ""))
      || (row.owners?.host || []).some((owner) =>
        ["LivingSubstrateHost", "MegastructureHost", "FuneraryMortuaryHost"].includes(owner))) {
    return {
      resolution: "RESOLVED",
      mode: "DEDICATED_INTERIOR",
      confidence: "walk-family-and-host",
      exposingCause: null
    };
  }
  if (row.requestFamily === "urban" || row.requestFamily === "wilderness"
      || (row.owners?.host || []).includes("UrbanFabric")) {
    return {
      resolution: "RESOLVED",
      mode: "EXTERIOR_ARCHITECTURAL_PRECINCT",
      confidence: "walk-family-and-host",
      exposingCause: null
    };
  }
  return {
    resolution: "UNRESOLVED_MODE",
    mode: null,
    confidence: "missing-active-window-relation",
    exposingCause: null
  };
}

function institutionalScaleFor(row, architectureBearing) {
  if (!architectureBearing) return null;
  const type = String(row.observations?.primaryType || "").toLowerCase();
  const owners = new Set(row.owners?.host || []);

  if (owners.has("MegastructureHost") || owners.has("LivingSubstrateHost")
      || /megastructure|living hive/.test(type)) return "MEGAINTERIOR";
  if (owners.has("DefenseFortificationHost") || owners.has("ReligiousSanctuaryHost")
      || owners.has("CommunalInstitutionHost")
      || /military fortification|religious sanctuary|temple ward/.test(type)) {
    return "MONUMENTAL";
  }
  if (owners.has("ResidentialEstateHost") || /sunken estate|noble quarter/.test(type)) {
    return "ELITE";
  }
  if (/slums?|low ward|ruined quarter/.test(type)) return "DOMESTIC";
  if (row.requestFamily === "wilderness") return "FRONTIER";
  if (owners.has("TransientServiceHost") || owners.has("DefenseRouteControlHost")
      || owners.has("ExtractionWorkHost")) return "FRONTIER";
  return "CIVIC";
}

function scaleRelationFor(row) {
  const owners = new Set(row.owners?.host || []);
  const feature = featureText(row);
  const primaryType = String(row.observations?.primaryType || "");
  const evidence = [];
  let relation = null;
  let discriminatorRequired = false;
  let explicitCivilizationEvidence = false;

  if (owners.has("MegastructureHost") || /the megastructure/i.test(primaryType)) {
    relation = "MEGASTRUCTURE_SCALE_RELATION";
    evidence.push("megastructure-host");
    discriminatorRequired = true;
  }
  if (owners.has("LivingSubstrateHost") || /living hive/i.test(primaryType)) {
    relation = relation || "ANOMALOUS_BODY_RELATION";
    evidence.push("living-substrate-host");
    discriminatorRequired = true;
  }
  if (owners.has("EcologyClaimHost")) {
    relation = relation || "CREATURE_BODY_RELATION";
    evidence.push("ecology-claim-host");
    discriminatorRequired = true;
  }
  if (SCALE_WORD_RE.test(feature)) {
    relation = relation || "OVERSIZED_FEATURE_RELATION";
    evidence.push("scale-word-in-feature");
    discriminatorRequired = true;
  }
  if (CREATURE_SCALE_RE.test(feature)) {
    relation = relation || "CREATURE_BODY_RELATION";
    evidence.push("large-creature-in-feature");
    discriminatorRequired = true;
  }
  if (EXPLICIT_SIZE_RE.test(feature)) {
    evidence.push("explicit-visual-size-reference");
  }
  if (/\b(?:built|made|meant|forged|carved)\s+(?:by|for)\s+(?:a |an )?(?:giant|titan)\b/i.test(feature)
      || /\bmeant for a titan\b/i.test(feature)) {
    explicitCivilizationEvidence = true;
    evidence.push("explicit-nonhuman-builder-or-occupant");
  }

  return {
    required: !!relation,
    relation,
    evidence: [...new Set(evidence)],
    discriminatorRequired,
    explicitCivilizationEvidence,
    civilizationScaleRegime: null,
    giantLegacyInferred: false
  };
}

function bodyProfilesFor(row, scaleRelation) {
  const owners = new Set(row.owners?.host || []);
  if (!scaleRelation.required && !owners.has("EcologyClaimHost")) {
    return {
      required: false,
      profiles: ["SIX_FOOT_HUMANOID_WITNESS"],
      unresolved: []
    };
  }
  return {
    required: true,
    profiles: ["SIX_FOOT_HUMANOID_WITNESS", "SOURCE_RELATIVE_BODY_UNRESOLVED"],
    unresolved: ["SOURCE_BODY_ENVELOPE_REQUIRED"]
  };
}

function proofDemandsFor(row, architectureBearing, battleSpace, institutionalScale, scaleRelation) {
  const demands = [];
  if (battleSpace.mode === "EXTERIOR_ARCHITECTURAL_PRECINCT") {
    demands.push("EXTERIOR_PRECINCT_COMPOSITION");
  }
  if (battleSpace.mode === "DEDICATED_INTERIOR") {
    demands.push("DEDICATED_INTERIOR_COMPOSITION");
  }
  if (battleSpace.mode === "CAUSALLY_JUSTIFIED_HYBRID") {
    demands.push("CAUSALLY_EXPOSED_HYBRID_COMPOSITION");
  }
  if (battleSpace.resolution === "INHERIT_COMMITTED_MODE") {
    demands.push("PERSISTED_MODE_INHERITANCE");
  }
  if (architectureBearing) demands.push("STRICT_MODULAR_ASSEMBLY_CLEARANCE");
  if (["ELITE", "MONUMENTAL"].includes(institutionalScale)) {
    demands.push("LUXURY_AND_WONDER_AT_SCALE");
  }
  if (institutionalScale === "MEGAINTERIOR") {
    demands.push("MEGAINTERIOR_WITHOUT_EXTERIOR_VISIBILITY");
  }
  if (scaleRelation.required) {
    demands.push("BODY_RELATIVE_SCALE_AND_CLEARANCE");
  }
  if (isPrisonAsylum(row)) {
    demands.push("PRISON_ASYLUM_PROGRAM_DISCRIMINATOR");
  }
  if (isNaturalCavern(row)) {
    demands.push("PURE_CAVERN_WITHOUT_LAIR_IMPLICATION");
  }
  if (!architectureBearing && BUILT_LOCAL_RE.test(featureText(row))) {
    demands.push("LOCAL_CONSTRUCTION_WITHOUT_SITE_PROMOTION");
  }
  return [...new Set(demands)];
}

function overlayFor(row) {
  const architectureBearing = isArchitectureBearing(row);
  const battleSpace = battleSpaceFor(row, architectureBearing);
  const institutionalScaleClass = institutionalScaleFor(row, architectureBearing);
  const scaleRelation = scaleRelationFor(row);
  const bodyPlanProfiles = bodyProfilesFor(row, scaleRelation);
  const proofDemands = proofDemandsFor(
    row,
    architectureBearing,
    battleSpace,
    institutionalScaleClass,
    scaleRelation
  );
  const localConstructionDemand = !architectureBearing
    && BUILT_LOCAL_RE.test(featureText(row));

  return {
    schemaVersion: 1,
    auditVersion: AUDIT_VERSION,
    caseId: row.caseId,
    sourceRequestFingerprint: row.requestFingerprint,
    sourceDisposition: row.disposition,
    dispositionAfterOverlay: row.disposition,
    architectureBearing,
    localConstructionDemand,
    battleSpace,
    institutionalScaleClass,
    scaleRelation,
    bodyPlanProfiles,
    assemblyClearance: architectureBearing ? {
      requiredForNewCandidates: true,
      checks: [
        "ROOF_WALL_JUNCTION_CLOSURE",
        "SUPPORT_AND_FOUNDATION_DATUM",
        "DIRECT_STAIR_SEAM",
        "ROUTE_AND_HEADROOM_CLEARANCE",
        "FIXED_CAMERA_OCCLUSION"
      ]
    } : null,
    proofDemands,
    unresolved: [
      ...(battleSpace.resolution === "UNRESOLVED_MODE" ? ["BATTLE_SPACE_MODE_REQUIRED"] : []),
      ...bodyPlanProfiles.unresolved,
      ...(scaleRelation.discriminatorRequired
        ? ["CIVILIZATION_OR_BODY_SCALE_DISCRIMINATOR_REQUIRED"] : []),
      ...(isPrisonAsylum(row) ? ["PRISON_OR_ASYLUM_PROGRAM_REQUIRED"] : [])
    ]
  };
}

function samplePush(samples, key, row, overlay, limit = 8) {
  if (!samples[key]) samples[key] = [];
  if (samples[key].length >= limit) return;
  samples[key].push({
    caseId: row.caseId,
    family: row.requestFamily,
    disposition: row.disposition,
    primaryType: row.observations?.primaryType || null,
    primaryFeature: row.observations?.primaryFeature || null,
    owners: row.owners?.host || [],
    mode: overlay.battleSpace.mode,
    scaleClass: overlay.institutionalScaleClass,
    scaleRelation: overlay.scaleRelation.relation
  });
}

function buildAudit() {
  const sourceBytes = readFileSync(SOURCE);
  const sourceText = gunzipSync(sourceBytes).toString("utf8");
  const lines = sourceText.trimEnd().split("\n");
  const rows = lines.map((line) => JSON.parse(line));
  const overlays = [];
  const byFamily = counter();
  const byDisposition = counter();
  const byMode = counter();
  const byScaleClass = counter();
  const byOwner = counter();
  const byProofDemand = counter();
  const scaleByDisposition = counter();
  const scaleByRelation = counter();
  const samples = {};
  let architectureBearing = 0;
  let localConstructionDemand = 0;
  let scaleDemand = 0;
  let scaleCodedLocal = 0;
  let prisonAsylum = 0;
  let naturalCavern = 0;
  let naturalCavernLairLeak = 0;
  let megastructureDiscriminator = 0;
  let causallyJustifiedHybrid = 0;
  let giantLegacyClaims = 0;
  let dispositionMutations = 0;

  for (const row of rows) {
    const overlay = overlayFor(row);
    overlays.push(overlay);
    count(byFamily, row.requestFamily);
    count(byDisposition, row.disposition);
    count(byMode, overlay.battleSpace.mode || overlay.battleSpace.resolution);
    count(byScaleClass, overlay.institutionalScaleClass);
    for (const owner of row.owners?.host || []) count(byOwner, owner);
    for (const demand of overlay.proofDemands) count(byProofDemand, demand);

    if (overlay.architectureBearing) architectureBearing++;
    if (overlay.localConstructionDemand) {
      localConstructionDemand++;
      samplePush(samples, "localConstruction", row, overlay);
    }
    if (overlay.scaleRelation.required) {
      scaleDemand++;
      count(scaleByDisposition, row.disposition);
      count(scaleByRelation, overlay.scaleRelation.relation);
      samplePush(samples, "scaleDemand", row, overlay);
    }
    if (overlay.scaleRelation.required && row.disposition === "DECORATE_LOCAL") {
      scaleCodedLocal++;
      samplePush(samples, "scaleCodedLocal", row, overlay);
    }
    if (isPrisonAsylum(row)) {
      prisonAsylum++;
      samplePush(samples, "prisonAsylum", row, overlay);
    }
    if (isNaturalCavern(row)) {
      naturalCavern++;
      if (overlay.architectureBearing || overlay.proofDemands.some((d) => /LAIR/.test(d)
          && d !== "PURE_CAVERN_WITHOUT_LAIR_IMPLICATION")) naturalCavernLairLeak++;
    }
    if (overlay.scaleRelation.relation === "MEGASTRUCTURE_SCALE_RELATION"
        && overlay.scaleRelation.discriminatorRequired) {
      megastructureDiscriminator++;
      samplePush(samples, "megastructure", row, overlay);
    }
    if (overlay.battleSpace.mode === "CAUSALLY_JUSTIFIED_HYBRID") {
      causallyJustifiedHybrid++;
      samplePush(samples, "causalHybrid", row, overlay);
    }
    if (overlay.institutionalScaleClass === "GIANT_LEGACY"
        || overlay.scaleRelation.giantLegacyInferred) giantLegacyClaims++;
    if (overlay.sourceDisposition !== overlay.dispositionAfterOverlay) dispositionMutations++;
  }

  const overlayText = overlays.map((row) => JSON.stringify(row)).join("\n") + "\n";
  const source = {
    path: "docs/intel/golden-vignette-wave1-corpus.jsonl.gz",
    compressedSha256: sha256(sourceBytes),
    uncompressedSha256: sha256(sourceText),
    rowCount: rows.length
  };
  const report = {
    schemaVersion: 1,
    auditVersion: AUDIT_VERSION,
    generated: "2026-07-30",
    status: "read-only-post-ruling-overlay",
    source,
    overlay: {
      path: "docs/intel/golden-vignette-architecture-ruling-overlay.jsonl.gz",
      rowCount: overlays.length,
      uncompressedSha256: sha256(overlayText)
    },
    invariants: {
      oneToOneCaseIds: new Set(overlays.map((row) => row.caseId)).size === rows.length,
      dispositionMutations,
      goldenSiteIdsInOverlay: /\b(?:goldenSiteId|site-[0-9]+|SITE_[0-9]+)\b/i.test(overlayText)
        ? 1 : 0,
      naturalCavernLairLeak,
      hybridWithoutExplicitCause: overlays.filter((row) =>
        row.battleSpace.mode === "CAUSALLY_JUSTIFIED_HYBRID"
          && !row.battleSpace.exposingCause).length,
      giantLegacyClaims
    },
    census: {
      totalRows: rows.length,
      architectureBearing,
      localConstructionDemand,
      scaleDemand,
      scaleCodedLocal,
      prisonAsylum,
      naturalCavern,
      megastructureDiscriminator,
      causallyJustifiedHybrid,
      byFamily: tally(byFamily, rows.length),
      byDisposition: tally(byDisposition, rows.length),
      byBattleSpace: tally(byMode, rows.length),
      byInstitutionalScale: tally(byScaleClass, rows.length),
      byHostOwner: tally(byOwner, rows.length),
      byProofDemand: tally(byProofDemand, rows.length),
      scaleByDisposition: tally(scaleByDisposition, scaleDemand),
      scaleByRelation: tally(scaleByRelation, scaleDemand)
    },
    decisions: [
      "Wave-1 corpus is immutable before-state; this audit changes no roller or request.",
      "Battle-space mode is selected before massing; ruin alone never licenses a hybrid.",
      "Pure NaturalCavernHost rows do not imply a lair, architecture, or EcologyClaimHost.",
      "Institutional scale is a proof demand, not a uniform geometry multiplier.",
      "Megastructure and oversized-feature evidence require a builder, occupant, or body discriminator; they do not imply GIANT_LEGACY.",
      "Scale-coded DECORATE_LOCAL rows remain local while demanding body-relative clearance and terrain response.",
      "Every new architecture candidate owes roof closure, support datum, direct stair seams, route/headroom clearance, and fixed-camera occlusion checks."
    ],
    samples
  };
  return { report, overlayText, sourceBytes };
}

function markdown(report) {
  const c = report.census;
  const top = (rows, n = 12) => rows.slice(0, n)
    .map((row) => `| ${row.key} | ${row.count.toLocaleString()} | ${row.pct}% |`)
    .join("\n");
  const sampleRows = (rows = []) => rows
    .map((row) => `| \`${row.caseId}\` | ${row.disposition} | ${row.primaryType || "—"} | ${row.primaryFeature || "—"} |`)
    .join("\n") || "| — | — | — | — |";

  return `# Golden Vignette architecture-ruling audit

type: implementation-evidence
status: READ-ONLY POST-RULING OVERLAY
generated: 2026-07-30
source: \`golden-vignette-wave1-corpus.jsonl.gz\`
audit: \`${report.auditVersion}\`

## Result

The retained ${c.totalRows.toLocaleString()}-request Wave-1 corpus remains byte-identical at
\`${report.source.compressedSha256}\`. This audit adds a one-to-one read-only overlay; it changes
zero request dispositions and contains zero Golden Site runtime ids.

The old adapter was strong at host/materialization classification but could not express the new
architecture rulings: the original corpus has no natural-frequency scale owners. The overlay finds
${c.architectureBearing.toLocaleString()} architecture-bearing requests,
${c.scaleDemand.toLocaleString()} body/scale-relative demands, and
${c.localConstructionDemand.toLocaleString()} local construction demands.

Most importantly, ${c.scaleCodedLocal.toLocaleString()} scale-coded requests remain
\`DECORATE_LOCAL\`. Scale demand therefore cannot be used as a hidden site-promotion rule.

## Battle-space demand

| Mode or resolution | Rows | Corpus |
|---|---:|---:|
${top(c.byBattleSpace)}

There are ${c.causallyJustifiedHybrid.toLocaleString()} safely inferred hybrids. This is deliberate:
the corpus has no retained causal exposure evidence strong enough to turn a ruin, collapsed object,
or open urban fabric into a hybrid interior/exterior battle space. Hybrid remains legal only when a
source names the breach, missing roof, collapse, or other exposing cause.

## Institutional-scale demand

| Scale class | Rows | Corpus |
|---|---:|---:|
${top(c.byInstitutionalScale)}

\`DOMESTIC\` does not mean poor styling, and \`FRONTIER\` does not mean crude styling. These classes
govern program breadth, proportion, construction, and continuation. Condition remains a separate
transform.

## Highest proof demands

| Proof demand | Rows | Corpus |
|---|---:|---:|
${top(c.byProofDemand)}

This census recommends the next proof sequence:

1. an urban exterior architectural precinct combining terrain and architecture;
2. a human monumental dedicated interior whose exterior is not visible;
3. a megainterior/body-relative window with explicit builder-versus-current-occupant evidence;
4. a linked fortress exterior and dedicated interior, retained as two windows rather than an
   unjustified hybrid; and
5. a local oversized feature that remains \`DECORATE_LOCAL\` while modifying terrain, clearance,
   camera composition, and interaction scale.

## Questionable patterns retained for resolution

- **Prison / Asylum:** ${c.prisonAsylum.toLocaleString()} rows remain \`UNRESOLVED\`. Both can license
  dedicated institutional interiors, but their operating models, care/custody circuits, responsible
  roles, access, and visual storytelling are not interchangeable. The upstream table needs an
  explicit program discriminator before either host can materialize.
- **Pure cavern:** ${c.naturalCavern.toLocaleString()} rows remain natural-cavern demands, not lairs.
  A lair needs explicit occupant shaping, claim, nest, body-scaled mouth, and bolt-hole evidence.
- **Megastructure:** ${c.megastructureDiscriminator.toLocaleString()} rows need original-builder,
  original-occupant, current-occupant, and body-envelope discrimination. None are labeled
  \`GIANT_LEGACY\` from size alone.
- **Hybrid:** zero rows are promoted because they are ruined. Ruin is physical condition, not
  operating state or battle-space posture.

## Scale-coded local examples

| Case | Disposition | Primary type | Feature |
|---|---|---|---|
${sampleRows(report.samples.scaleCodedLocal)}

## Invariants

- one overlay row per source case: **${report.invariants.oneToOneCaseIds ? "PASS" : "FAIL"}**
- disposition mutations: **${report.invariants.dispositionMutations}**
- Golden Site ids in runtime overlay: **${report.invariants.goldenSiteIdsInOverlay}**
- pure-cavern → lair leaks: **${report.invariants.naturalCavernLairLeak}**
- hybrids without explicit cause: **${report.invariants.hybridWithoutExplicitCause}**
- inferred giant-legacy claims: **${report.invariants.giantLegacyClaims}**

## Artifact use

The gzip JSONL overlay is diagnostic input for proof selection and future adapter design. It is not
a second roller, a production runtime registry, or permission to hard-code these inferred classes.
Production adoption requires the walk adapter to carry explicit program, battle-space, builder,
occupant, body-envelope, and causal-exposure facts at the request boundary.
`;
}

function assertReport(report) {
  const failures = [];
  const check = (condition, message) => { if (!condition) failures.push(message); };
  check(report.source.rowCount === report.overlay.rowCount, "overlay row count differs from source");
  check(report.invariants.oneToOneCaseIds, "overlay case ids are not one-to-one");
  check(report.invariants.dispositionMutations === 0, "overlay changed request dispositions");
  check(report.invariants.goldenSiteIdsInOverlay === 0, "overlay contains Golden Site ids");
  check(report.invariants.naturalCavernLairLeak === 0, "pure cavern leaked into lair semantics");
  check(report.invariants.hybridWithoutExplicitCause === 0, "hybrid lacks explicit cause");
  check(report.invariants.giantLegacyClaims === 0, "GIANT_LEGACY was inferred from insufficient evidence");
  check(report.census.scaleCodedLocal > 0, "no scale-coded local features were found");
  check(report.census.prisonAsylum > 0, "Prison / Asylum ambiguity disappeared");
  if (failures.length) throw new Error(failures.join("\n"));
}

function main() {
  const mode = process.argv.includes("--emit")
    ? "emit"
    : process.argv.includes("--check") ? "check" : "memory";
  const { report, overlayText } = buildAudit();
  assertReport(report);
  const jsonText = JSON.stringify(report, null, 2) + "\n";
  const mdText = markdown(report);
  const overlayBytes = gzipSync(Buffer.from(overlayText), { level: 9 });

  if (mode === "emit") {
    writeFileSync(REPORT_JSON, jsonText);
    writeFileSync(REPORT_MD, mdText);
    writeFileSync(OVERLAY_GZ, overlayBytes);
    console.log(`emitted ${report.census.totalRows} read-only architecture overlays`);
  } else if (mode === "check") {
    for (const path of [REPORT_JSON, REPORT_MD, OVERLAY_GZ]) {
      if (!existsSync(path)) throw new Error(`missing generated artifact: ${path}`);
    }
    if (!readFileSync(REPORT_JSON).equals(Buffer.from(jsonText))) {
      throw new Error("architecture ruling JSON report drift");
    }
    if (!readFileSync(REPORT_MD).equals(Buffer.from(mdText))) {
      throw new Error("architecture ruling Markdown report drift");
    }
    // Compare uncompressed content, not the .gz container: gzip bytes at the same level
    // differ across zlib versions (Node 20 vs 22 broke CI), while the drift claim is
    // about the overlay rows themselves.
    if (!gunzipSync(readFileSync(OVERLAY_GZ)).equals(Buffer.from(overlayText))) {
      throw new Error("architecture ruling overlay drift");
    }
    console.log(`PASS: ${report.census.totalRows} overlays reproduce byte-for-byte`);
  } else {
    console.log(JSON.stringify({
      sourceRows: report.source.rowCount,
      sourceSha256: report.source.compressedSha256,
      overlaySha256: report.overlay.uncompressedSha256,
      architectureBearing: report.census.architectureBearing,
      scaleDemand: report.census.scaleDemand,
      scaleCodedLocal: report.census.scaleCodedLocal,
      dispositionMutations: report.invariants.dispositionMutations
    }, null, 2));
  }
}

main();
