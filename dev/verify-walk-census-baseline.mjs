#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const intelRoot = join(repoRoot, "docs", "intel");

function readJson(name) {
  return JSON.parse(readFileSync(join(intelRoot, name), "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const tally = readJson("walk-census-tally.json");
const mapping = readJson("walk-census-mapping.json");

const frontier = [
  tally.frontier.urban.n,
  tally.frontier.dungeon.n,
  tally.frontier.wilderness.n
];
const job = [
  tally.job.urban.n,
  tally.job.dungeon.n,
  tally.job.wilderness.n
];
const travel = tally.travel.wilderness.n;

assert(tally.meta.plan.N_FRONTIER_PER_ENV === 150, "frontier sample plan changed");
assert(tally.meta.plan.N_TRAVEL === 300, "travel sample plan changed");
assert(tally.meta.plan.N_JOB === 300, "job sample plan changed");
assert(frontier.every((n) => n === 150), "frontier results are not 150 per environment");
assert(travel === 300, "travel results are not 300");
assert(job.reduce((sum, n) => sum + n, 0) === 300, "job environment results do not sum to 300");
assert(tally.errors.length === 0, "retained census contains runner errors");

const partitions = [
  ["urban", mapping.goldenSiteMapping.urbanMapped, 258, 171, 87],
  ["dungeon", mapping.goldenSiteMapping.dungeonMapped, 253, 218, 35],
  ["wilderness", mapping.goldenSiteMapping.wildMapped, 539, 177, 362]
];

for (const [name, part, total, mapped, unmapped] of partitions) {
  assert(part.total === total, `${name} total changed`);
  assert(part.mappedCount === mapped, `${name} mapped count changed`);
  assert(part.unmappedCount === unmapped, `${name} unmapped count changed`);
  assert(part.mappedCount + part.unmappedCount === part.total, `${name} partition does not close`);
  assert(part.rows.reduce((sum, row) => sum + row.count, 0) === part.total, `${name} rows do not sum to total`);
}

const totalWalks = frontier.reduce((sum, n) => sum + n, 0) + travel +
  job.reduce((sum, n) => sum + n, 0);
assert(totalWalks === 1050, "retained census is not the 1,050-roll baseline");

console.log("PASS walk census before-state");
console.log(`  total walks: ${totalWalks} (frontier 450, travel 300, job 300)`);
console.log("  mapped partitions: urban 171/258, dungeon 218/253, wilderness 177/539");
console.log("  successor: docs/GOLDEN-SITE-WAVE-1-OBSERVATORY-BRIEF.md");
