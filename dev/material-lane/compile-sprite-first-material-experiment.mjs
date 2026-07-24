#!/usr/bin/env node
/**
 * Compile each sprite-first graph twice with Material Maker 1.3 and retain
 * run A as the review set only after proving byte identity with run B.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const graphDir = path.join(here, "graphs", "experiments", "sprite-first-v001");
const exportDir = path.join(here, "exports", "sprite-first-material-v001");
const receiptPath = path.join(
  here,
  "receipts",
  "sprite-first-material-v001-export-receipt.json"
);
const materialMaker =
  process.env.GENESIS_MATERIAL_MAKER ??
  "/Applications/Material Maker 1.3.app/Contents/MacOS/material_maker";
const requiredSuffixes = ["_albedo.png", "_heightmap.png", "_normal.png", "_orm.png"];

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function compileRun(runName, graphs) {
  const output = path.join(exportDir, runName);
  fs.mkdirSync(output, { recursive: true });
  const result = spawnSync(
    materialMaker,
    [
      "--no-window",
      "--export-material",
      "--target",
      "Godot/Godot 4 ORM",
      "-o",
      output,
      ...graphs.map((name) => path.join(graphDir, name))
    ],
    { encoding: "utf8", timeout: 180000, killSignal: "SIGTERM" }
  );
  const log = `${runName}-material-maker.log`;
  fs.writeFileSync(path.join(exportDir, log), `${result.stdout}${result.stderr}`);
  const allPresent = graphs.every((graph) => {
    const stem = path.basename(graph, ".ptex");
    return requiredSuffixes.every((suffix) =>
      fs.existsSync(path.join(output, `${stem}${suffix}`))
    );
  });
  const timedOutAfterWriting = result.error?.code === "ETIMEDOUT" && allPresent;
  if (result.status !== 0 && !timedOutAfterWriting) {
    throw new Error(
      `Material Maker ${runName} failed (${result.status}):\n${result.stdout}\n${result.stderr}`
    );
  }
  if (!allPresent) throw new Error(`Material Maker ${runName} omitted required outputs.`);
  return { output, log, timedOutAfterWriting };
}

if (!fs.existsSync(materialMaker)) throw new Error(`Material Maker binary missing: ${materialMaker}`);
const graphs = fs.readdirSync(graphDir).filter((name) => name.endsWith(".ptex")).sort();
if (graphs.length !== 3) throw new Error(`Expected 3 experiment graphs, found ${graphs.length}`);

fs.rmSync(exportDir, { recursive: true, force: true });
fs.mkdirSync(exportDir, { recursive: true });
const runA = compileRun("run-a", graphs);
const runB = compileRun("run-b", graphs);

const outputHashes = {};
for (const graph of graphs) {
  const stem = path.basename(graph, ".ptex");
  for (const suffix of requiredSuffixes) {
    const file = `${stem}${suffix}`;
    const a = sha256(path.join(runA.output, file));
    const b = sha256(path.join(runB.output, file));
    if (a !== b) throw new Error(`Nondeterministic Material Maker export: ${file}`);
    outputHashes[file] = a;
  }
}

const receipt = {
  schemaVersion: 1,
  experimentId: "SPRITE-FIRST-MATERIAL-V001",
  generatedAt: new Date().toISOString(),
  materialMaker: {
    version: "1.3",
    binary: materialMaker,
    binarySha256: sha256(materialMaker),
    target: "Godot/Godot 4 ORM",
    resolution: 512
  },
  sourceGraphs: Object.fromEntries(
    graphs.map((graph) => [
      path.relative(repoRoot, path.join(graphDir, graph)),
      sha256(path.join(graphDir, graph))
    ])
  ),
  outputHashes,
  determinism: {
    runs: ["run-a", "run-b"],
    byteIdentical: true,
    comparedFileCount: Object.keys(outputHashes).length,
    requiredChannels: ["albedo", "height", "normal", "orm"],
    timeoutRecoveries: {
      runA: runA.timedOutAfterWriting,
      runB: runB.timedOutAfterWriting
    }
  },
  reviewOutputRoot: path.relative(repoRoot, runA.output),
  comparisonOutputRoot: path.relative(repoRoot, runB.output),
  logs: [runA.log, runB.log]
};
fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

console.log(
  `PASS: ${graphs.length} sprite-first materials compiled twice; ${Object.keys(outputHashes).length} maps are byte-identical.`
);
console.log(path.relative(process.cwd(), receiptPath));
