#!/usr/bin/env node
/**
 * Compile the Guard Post candidate batch twice with Material Maker 1.3 and
 * prove byte identity for all review channels.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const graphDir = path.join(here, "graphs", "guard-post");
const exportDir = path.join(here, "exports", "guard-post-mm13-v001");
const receiptPath = path.join(here, "receipts", "guard-post-mm13-export-receipt.json");
const materialMaker =
  process.env.GENESIS_MATERIAL_MAKER ??
  "/Applications/Material Maker 1.3.app/Contents/MacOS/material_maker";
const requiredSuffixes = ["_albedo.png", "_normal.png", "_orm.png"];

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function compile(runName, graphs) {
  const out = path.join(exportDir, runName);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const logs = [];
  const timeoutRecoveries = [];
  for (const graph of graphs) {
    const stem = path.basename(graph, ".ptex");
    const result = spawnSync(
      materialMaker,
      [
        "--export-material",
        "--target",
        "Godot/Godot 4 ORM",
        "-o",
        out,
        path.join(graphDir, graph)
      ],
      { encoding: "utf8", timeout: 15000, killSignal: "SIGTERM" }
    );
    const logName = `${stem}.log`;
    fs.writeFileSync(path.join(out, logName), `${result.stdout}${result.stderr}`);
    const requiredPresent = requiredSuffixes.every((suffix) =>
      fs.existsSync(path.join(out, `${stem}${suffix}`))
    );
    const timedOutAfterWriting =
      result.error?.code === "ETIMEDOUT" && requiredPresent;
    if (timedOutAfterWriting) timeoutRecoveries.push(graph);
    if (result.status !== 0 && !timedOutAfterWriting) {
      throw new Error(`Material Maker failed for ${graph} (${runName}): ${result.status}`);
    }
    logs.push(logName);
  }
  return { logs, out, timeoutRecoveries };
}

function requiredFiles(out, graphs) {
  const files = [];
  for (const graph of graphs) {
    const stem = path.basename(graph, ".ptex");
    for (const suffix of requiredSuffixes) {
      const file = `${stem}${suffix}`;
      if (!fs.existsSync(path.join(out, file))) {
        throw new Error(`Missing required export ${file}`);
      }
      files.push(file);
    }
  }
  return files.sort();
}

const graphs = fs
  .readdirSync(graphDir)
  .filter((name) => name.endsWith(".ptex"))
  .sort();
if (graphs.length !== 4) throw new Error(`Expected 4 candidate graphs, found ${graphs.length}`);
if (!fs.existsSync(materialMaker)) throw new Error(`Material Maker binary missing: ${materialMaker}`);

const runA = compile("run-a", graphs);
const runB = compile("run-b", graphs);
const filesA = requiredFiles(runA.out, graphs);
const filesB = requiredFiles(runB.out, graphs);
if (JSON.stringify(filesA) !== JSON.stringify(filesB)) throw new Error("Export file sets differ");

const outputHashes = {};
for (const file of filesA) {
  const a = sha256(path.join(runA.out, file));
  const b = sha256(path.join(runB.out, file));
  if (a !== b) throw new Error(`Nondeterministic export: ${file}\n${a}\n${b}`);
  outputHashes[file] = a;
}

const sourceHashes = Object.fromEntries(
  graphs.map((graph) => [path.relative(repoRoot, path.join(graphDir, graph)), sha256(path.join(graphDir, graph))])
);
const receipt = {
  schemaVersion: 1,
  batchId: "GP-MM-STONE-V001",
  generatedAt: new Date().toISOString(),
  materialMaker: {
    version: "1.3",
    binary: materialMaker,
    binarySha256: sha256(materialMaker),
    target: "Godot/Godot 4 ORM",
    resolution: 512
  },
  sourceHashes,
  outputHashes,
  determinism: {
    runs: ["run-a", "run-b"],
    byteIdentical: true,
    comparedFileCount: filesA.length,
    requiredChannels: ["albedo", "normal", "orm"],
    cliTimeoutRecoveries: {
      runA: runA.timeoutRecoveries,
      runB: runB.timeoutRecoveries
    }
  },
  outputRoots: {
    runA: path.relative(repoRoot, runA.out),
    runB: path.relative(repoRoot, runB.out)
  }
};
fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

console.log(
  `PASS: ${graphs.length} candidates compiled twice; ${filesA.length} required files are byte-identical.`
);
console.log(path.relative(process.cwd(), receiptPath));
