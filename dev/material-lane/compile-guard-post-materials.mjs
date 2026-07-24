#!/usr/bin/env node
/**
 * Compile the Guard Post candidate batch twice with Material Maker 1.3 and
 * prove byte identity for all review channels.
 *
 * Material Maker accepts multiple source files per CLI invocation. Both
 * evaluations are therefore staged with unique filenames and sent through one
 * invisible process. This avoids repeatedly opening/focusing the Godot window.
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

function compileBatch(graphs) {
  const runNames = ["run-a", "run-b"];
  const stagedSourceDir = path.join(exportDir, "_staged-sources");
  const stagedOutputDir = path.join(exportDir, "_staged-outputs");
  fs.rmSync(exportDir, { recursive: true, force: true });
  fs.mkdirSync(stagedSourceDir, { recursive: true });
  fs.mkdirSync(stagedOutputDir, { recursive: true });

  const stagedGraphs = [];
  for (const runName of runNames) {
    for (const graph of graphs) {
      const stem = path.basename(graph, ".ptex");
      const stagedName = `${runName}__${stem}.ptex`;
      const stagedPath = path.join(stagedSourceDir, stagedName);
      fs.copyFileSync(path.join(graphDir, graph), stagedPath);
      stagedGraphs.push(stagedPath);
    }
  }

  const result = spawnSync(
    materialMaker,
    [
      "--no-window",
      "--export-material",
      "--target",
      "Godot/Godot 4 ORM",
      "-o",
      stagedOutputDir,
      ...stagedGraphs
    ],
    { encoding: "utf8", timeout: 180000, killSignal: "SIGTERM" }
  );
  const logName = "material-maker-batch.log";
  fs.writeFileSync(path.join(exportDir, logName), `${result.stdout}${result.stderr}`);

  const stagedRequiredPresent = stagedGraphs.every((graph) => {
    const stem = path.basename(graph, ".ptex");
    return requiredSuffixes.every((suffix) =>
      fs.existsSync(path.join(stagedOutputDir, `${stem}${suffix}`))
    );
  });
  const timedOutAfterWriting =
    result.error?.code === "ETIMEDOUT" && stagedRequiredPresent;
  if (result.status !== 0 && !timedOutAfterWriting) {
    throw new Error(`Material Maker batch failed: ${result.status}\n${result.stderr}`);
  }

  const runs = {};
  for (const runName of runNames) {
    const out = path.join(exportDir, runName);
    fs.mkdirSync(out, { recursive: true });
    for (const graph of graphs) {
      const stem = path.basename(graph, ".ptex");
      for (const suffix of requiredSuffixes) {
        const stagedFile = path.join(stagedOutputDir, `${runName}__${stem}${suffix}`);
        const finalFile = path.join(out, `${stem}${suffix}`);
        if (!fs.existsSync(stagedFile)) {
          throw new Error(`Missing required staged export ${path.basename(stagedFile)}`);
        }
        fs.renameSync(stagedFile, finalFile);
      }
    }
    runs[runName] = {
      logs: [logName],
      out,
      timeoutRecoveries: timedOutAfterWriting ? ["batch"] : []
    };
  }
  fs.rmSync(stagedSourceDir, { recursive: true, force: true });
  fs.rmSync(stagedOutputDir, { recursive: true, force: true });
  return runs;
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

const runs = compileBatch(graphs);
const runA = runs["run-a"];
const runB = runs["run-b"];
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
