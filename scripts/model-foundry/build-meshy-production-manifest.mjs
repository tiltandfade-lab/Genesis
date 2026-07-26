#!/usr/bin/env node
/**
 * Expand the definitive 75-family Meshy slate into a deterministic 300-job CSV.
 *
 * The slate remains the source of family names, purposes, and A/B/C/D subjects.
 * This builder adds operational targets, wave order, ownership, filenames, and
 * exact short Meshy prompts without duplicating the art-canon prompt blocks.
 *
 * Usage:
 *   node scripts/model-foundry/build-meshy-production-manifest.mjs
 *   node scripts/model-foundry/build-meshy-production-manifest.mjs --check
 *   node scripts/model-foundry/build-meshy-production-manifest.mjs --job M005-A
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const slatePath = path.join(root, "docs", "MESHY-PREMIUM-MONTH-1-MODEL-SLATE.md");
const outputPath = path.join(
  root,
  "Reference",
  "Meshy-Premium-Month-1",
  "batch-production-manifest.csv",
);

const targets = {
  M001: 400, M002: 700, M003: 700, M004: 800, M005: 1200, M006: 900,
  M007: 1000, M008: 800, M009: 800, M010: 700, M011: 900, M012: 900,
  M013: 800, M014: 800, M015: 700, M016: 700, M017: 800, M018: 800,
  M019: 1800, M020: 1200, M021: 1100, M022: 900, M023: 900, M024: 1000,
  M025: 1200, M026: 1500, M027: 1000, M028: 1400, M029: 900, M030: 1400,
  M031: 1500, M032: 1100, M033: 1000, M034: 1200,
  M035: 800, M036: 700, M037: 900, M038: 900, M039: 900, M040: 800,
  M041: 1200, M042: 700, M043: 900,
  M044: 1400, M045: 900, M046: 1200, M047: 1000, M048: 900, M049: 700,
  M050: 900, M051: 700, M052: 900, M053: 800,
  M054: 800, M055: 800, M056: 800, M057: 900, M058: 1200, M059: 1200,
  M060: 1200, M061: 900, M062: 700, M063: 900, M064: 1000, M065: 900,
  M066: 900, M067: 900,
  M068: 600, M069: 600, M070: 600, M071: 500, M072: 500, M073: 600,
  M074: 700, M075: 900,
};

const accepted = {
  "M001-A": {
    reference: "reference-images/M001-A-low-cover-boulder-cluster-v1.png",
    incoming: "incoming/M001-A-low-cover-boulder-cluster-remesh-400.glb",
    processed: "processed/M001-A-low-cover-boulder-cluster-clean-v1.glb",
  },
  "M019-A": {
    reference: "reference-images/M019-A-universal-four-wheel-wagon-chassis-v2.png",
    incoming: "incoming/M019-A-universal-four-wheel-wagon-chassis-original.glb",
    processed: "processed/M019-A-wagon-chassis-clean-v1.glb",
  },
  "M035-A": {
    reference: "reference-images/M035-A-short-household-ridge-tent-v1.png",
    incoming: "incoming/M035-A-short-household-ridge-tent-smart-800.glb",
    processed: "processed/M035-A-short-household-ridge-tent-clean-v1.glb",
  },
  "M059-A": {
    reference: "reference-images/M059-A-compact-field-forge-v1.png",
    incoming: "incoming/M059-A-compact-field-forge-smart-1200.glb",
    processed: "processed/M059-A-compact-field-forge-clean-v1.glb",
  },
  "M068-A": {
    reference: "reference-images/M068-A-wall-flame-sconce-v1.png",
    incoming: "incoming/M068-A-wall-flame-sconce-smart-600.glb",
    processed: "processed/M068-A-wall-flame-sconce-clean-v1.glb",
  },
};

const aWaves = {
  A1: new Set(["M005", "M025", "M047", "M069", "M070", "M071", "M072", "M073", "M074", "M075"]),
  A2: new Set(["M020", "M021", "M022", "M023", "M024", "M026", "M027", "M028", "M029", "M030", "M031", "M032", "M033", "M034"]),
  A3: new Set(["M002", "M003", "M004", "M006", "M007", "M008", "M009", "M010", "M011", "M012", "M013", "M014", "M015", "M016", "M017", "M018"]),
  A4: new Set(["M036", "M037", "M038", "M039", "M040", "M041", "M042", "M043"]),
  A5: new Set(["M044", "M045", "M046", "M048", "M049", "M050", "M051", "M052", "M053"]),
  A6: new Set(["M054", "M055", "M056", "M057", "M058", "M060", "M061", "M062", "M063", "M064", "M065", "M066", "M067"]),
};

const categories = [
  {
    min: 1,
    max: 18,
    key: "natural",
    variantWave: "V3",
    donor: "the authored natural silhouette, its few major masses, real openings, ledges, and construction-scale fracture or growth planes",
    engine: "exact terrain hole, elevation authority, walkability, collision, cover, materials, mineral color, moisture, decals, contents, light, and procedural embedding",
    replacements: "tiny stones, gravel, roots, crystals, supports, water, decals, and any exact terrain interface that is cheaper or safer procedurally",
    acceptance: "the silhouette must beat routine procedural placement; real openings remain open; no accidental stairs or noisy micro-fracture",
  },
  {
    min: 19,
    max: 34,
    key: "mechanism",
    variantWave: "V1",
    donor: "the main chassis, load-bearing frame, major moving volumes, readable mechanism, and separable large construction parts",
    engine: "animation, pivots, sockets, standardized wheels or drums, rope and chain, collision, materials, cargo, state, damage logic, and gameplay authority",
    replacements: "dirty repeated wheels, hair-thin rope or chain, fasteners, handles, sockets, and standardized bars or axles",
    acceptance: "major parts remain legible in orbit and can be grouped deterministically; no fused moving state, dense fastener noise, or warped repeated parts",
  },
  {
    min: 35,
    max: 43,
    key: "shelter",
    variantWave: "V4",
    donor: "the primary shelter silhouette, broad cloth or service masses, large supports, threshold, and genuinely useful removable treatment",
    engine: "exact tactical footprint, collision, stakes, guy lines, sockets, materials, cultural markings, furniture, contents, light, and state",
    replacements: "simple poles, stakes, ropes, fasteners, floor panels, and other standardized supports",
    acceptance: "broad planes survive without dense wrinkles; thresholds remain real; no floor or platform appears unless the row explicitly requires one",
  },
  {
    min: 44,
    max: 53,
    key: "civic",
    variantWave: "V5",
    donor: "the civic or ritual landmark silhouette, major support volumes, real openings, and replaceable center or working components",
    engine: "water, posters, text, offerings, contents, sockets, collision, materials, authority marks, animation, and cultural state",
    replacements: "liquid, paper, text, tiny offerings, fasteners, handles, cords, and standardized sockets",
    acceptance: "the object reads as an institution or working surface without modeled clutter; empty sockets and openings remain usable",
  },
  {
    min: 54,
    max: 59,
    key: "defensive",
    variantWave: "V6",
    donor: "the main defensive or industrial silhouette, thick frame, major barrier or working volumes, and large separable fittings",
    engine: "exact collision and cover, hinges, force state, fuel, light, materials, tools, damage, sockets, and interaction authority",
    replacements: "rope, chain, spikes, bars, wheels, flame, tools, fuel, and standardized repeated fittings when generated poorly",
    acceptance: "the tactical blocker or working machine remains physically honest; open frames remain open; no thin or decorative clutter",
  },
  {
    min: 60,
    max: 67,
    key: "trace",
    variantWave: "V6",
    donor: "one curated cluster silhouette composed from a few large recognizable causal parts",
    engine: "individual item identity, exact custody, decals, stains, small debris, collision, material state, procedural scatter, and history authority",
    replacements: "micro-clutter, repeated loose items, gore, rope, small tools, labels, stains, and any part already owned by a reusable kit",
    acceptance: "the cluster reads as one causal trace rather than random clutter; a few large parts remain separable and no micro-noise buys the silhouette",
  },
  {
    min: 68,
    max: 75,
    key: "light",
    variantWave: "V2",
    donor: "the lore-native fixture body, open fuel or emission socket, mount, hood, shield, and thick readable supports",
    engine: "flame or cool emitter, emission, flicker, illumination, smoke, fuel, wall or ceiling registration, materials, collision, culture, and damage",
    replacements: "flame, glow volume, light object, smoke, chain, glass panes, fuel, fasteners, and standardized mount hardware",
    acceptance: "the empty emitter socket and frame openings remain real; no baked flame, glow, smoke, or hair-thin metal survives as required geometry",
  },
];

function csv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function slug(text) {
  return text
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseFamilies(markdown) {
  const rows = [];
  const pattern = /^\| (M\d{3}) \| \*\*(.+?)\.\*\* (.+?) \| (.+?) \|$/gm;
  for (const match of markdown.matchAll(pattern)) {
    const [, id, family, purpose, variantsCell] = match;
    const variants = {};
    for (const fragment of variantsCell.split(" · ")) {
      const variantMatch = fragment.match(/^([ABCD]) (.+)$/);
      if (!variantMatch) throw new Error(`Cannot parse ${id} variant: ${fragment}`);
      variants[variantMatch[1]] = variantMatch[2];
    }
    if (Object.keys(variants).length !== 4) throw new Error(`${id} does not define A/B/C/D.`);
    rows.push({ id, family, purpose, variants });
  }
  if (rows.length !== 75) throw new Error(`Expected 75 family rows; found ${rows.length}.`);
  return rows;
}

function categoryFor(id) {
  const number = Number(id.slice(1));
  const category = categories.find((entry) => number >= entry.min && number <= entry.max);
  if (!category) throw new Error(`No category contract for ${id}.`);
  return category;
}

function waveFor(id, variant, status, category) {
  if (status === "accepted") return "C0";
  if (variant === "A") {
    const match = Object.entries(aWaves).find(([, ids]) => ids.has(id));
    if (!match) throw new Error(`No canonical-A wave for ${id}.`);
    return match[0];
  }
  return `${category.variantWave}-${variant}`;
}

function priorityFor(wave) {
  const fixed = { C0: 0, A1: 10, A2: 20, A3: 30, A4: 40, A5: 50, A6: 60 };
  if (wave in fixed) return fixed[wave];
  const match = wave.match(/^V(\d)-([BCD])$/);
  if (!match) throw new Error(`Unknown wave ${wave}.`);
  return 100 + Number(match[1]) * 10 + { B: 1, C: 2, D: 3 }[match[2]];
}

function buildJobs(families) {
  const jobs = [];
  for (const family of families) {
    const category = categoryFor(family.id);
    const familySlug = slug(family.family);
    for (const variant of ["A", "B", "C", "D"]) {
      const jobId = `${family.id}-${variant}`;
      const acceptedRecord = accepted[jobId];
      const status = acceptedRecord ? "accepted" : "queued";
      const target = targets[family.id];
      const reference =
        acceptedRecord?.reference ??
        `reference-images/${jobId}-${familySlug}-v1.png`;
      const incoming =
        acceptedRecord?.incoming ??
        `incoming/${jobId}-${familySlug}-smart-${target}.glb`;
      const processed =
        acceptedRecord?.processed ??
        `processed/${jobId}-${familySlug}-clean-v1.glb`;
      const wave = waveFor(family.id, variant, status, category);
      const variantSubject = family.variants[variant];
      const donorOwns = `${category.donor}; for this row, specifically the ${variantSubject}`;
      const meshyPrompt = [
        `Create exactly one low-poly medieval-fantasy ${family.family.toLowerCase()} donor for Genesis.`,
        `Variant: ${variantSubject}.`,
        `Functional purpose: ${family.purpose}`,
        `Match the supplied reference image exactly and preserve ${donorOwns}.`,
        "Use a few large deliberate construction-aligned planes, strong silhouette, thick mechanically legible parts, broad material regions, and honest open space.",
        `Do not add scenery, a floor base, characters, unrelated props, micro-clutter, text, labels, baked directional light, or any engine-owned feature: ${category.engine}.`,
        "Exactly one coherent object or intentionally fused cluster.",
      ].join(" ");
      jobs.push({
        priority: priorityFor(wave),
        wave,
        status,
        jobId,
        modelId: family.id,
        variant,
        category: category.key,
        family: family.family,
        variantSubject,
        purpose: family.purpose,
        targetPolygons: target,
        referenceImage: reference,
        canonicalIncoming: incoming,
        canonicalProcessed: processed,
        donorOwns,
        engineOwns: category.engine,
        expectedProceduralReplacements: category.replacements,
        acceptanceFocus: category.acceptance,
        meshyPrompt,
      });
    }
  }
  jobs.sort((left, right) =>
    left.priority - right.priority ||
    left.modelId.localeCompare(right.modelId) ||
    left.variant.localeCompare(right.variant),
  );
  if (jobs.length !== 300) throw new Error(`Expected 300 jobs; found ${jobs.length}.`);
  return jobs;
}

const columns = [
  "priority",
  "wave",
  "status",
  "jobId",
  "modelId",
  "variant",
  "category",
  "family",
  "variantSubject",
  "purpose",
  "targetPolygons",
  "referenceImage",
  "canonicalIncoming",
  "canonicalProcessed",
  "donorOwns",
  "engineOwns",
  "expectedProceduralReplacements",
  "acceptanceFocus",
  "meshyPrompt",
];

function renderCsv(jobs) {
  return [
    columns.join(","),
    ...jobs.map((job) => columns.map((column) => csv(job[column])).join(",")),
    "",
  ].join("\n");
}

const source = fs.readFileSync(slatePath, "utf8");
const jobs = buildJobs(parseFamilies(source));
const requestedJob = process.argv.includes("--job")
  ? process.argv[process.argv.indexOf("--job") + 1]
  : null;

if (requestedJob) {
  const job = jobs.find((candidate) => candidate.jobId === requestedJob.toUpperCase());
  if (!job) throw new Error(`Unknown job ${requestedJob}.`);
  process.stdout.write(`${JSON.stringify(job, null, 2)}\n`);
  process.exit(0);
}

const rendered = renderCsv(jobs);
if (process.argv.includes("--check")) {
  if (!fs.existsSync(outputPath)) throw new Error(`Missing ${outputPath}.`);
  const current = fs.readFileSync(outputPath, "utf8");
  if (current !== rendered) throw new Error("Batch production manifest is stale.");
  process.stdout.write("MESHY_BATCH_MANIFEST: OK (300 jobs, 5 accepted, 295 queued)\n");
  process.exit(0);
}

fs.writeFileSync(outputPath, rendered);
process.stdout.write(`Wrote ${outputPath}\n`);
process.stdout.write("MESHY_BATCH_MANIFEST: 300 jobs, 5 accepted, 295 queued\n");
