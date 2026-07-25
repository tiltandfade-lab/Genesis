#!/usr/bin/env node
/** Compile the four B01 fast-lane MM graphs twice and prove byte determinism. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const graphDir = path.join(here, "graphs", "b01-fast-lane-mm-v001");
const exportDir = path.join(here, "exports", "b01-fast-lane-mm-v001");
const receiptPath = path.join(here, "receipts", "b01-fast-lane-mm-v001-export-receipt.json");
const materialMaker =
  process.env.GENESIS_MATERIAL_MAKER ??
  "/Applications/Material Maker 1.3.app/Contents/MacOS/material_maker";
const suffixes = ["_albedo.png", "_heightmap.png", "_normal.png", "_orm.png"];
const sha256 = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

if (!fs.existsSync(materialMaker)) {
  throw new Error(`Material Maker binary missing: ${materialMaker}`);
}
if (fs.existsSync(exportDir) || fs.existsSync(receiptPath)) {
  throw new Error("Refusing to overwrite existing versioned fast-lane MM output.");
}
const graphs = fs.readdirSync(graphDir).filter((file) => file.endsWith(".ptex")).sort();
if (graphs.length !== 4) throw new Error(`Expected 4 fast-lane graphs, found ${graphs.length}`);

function compile(run) {
  const output = path.join(exportDir, run);
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
      ...graphs.map((file) => path.join(graphDir, file)),
    ],
    { encoding: "utf8", timeout: 240000, killSignal: "SIGTERM" },
  );
  const log = path.join(exportDir, `${run}-material-maker.log`);
  fs.writeFileSync(log, `${result.stdout}${result.stderr}`);
  const complete = graphs.every((graph) =>
    suffixes.every((suffix) =>
      fs.existsSync(path.join(output, `${path.basename(graph, ".ptex")}${suffix}`)),
    ),
  );
  const timeoutRecovered = result.error?.code === "ETIMEDOUT" && complete;
  if (result.status !== 0 && !timeoutRecovered) {
    throw new Error(`Material Maker ${run} failed (${result.status}). See ${log}`);
  }
  if (!complete) throw new Error(`Material Maker ${run} omitted required maps.`);
  return { output, timeoutRecovered, log: path.basename(log) };
}

const runA = compile("run-a");
const runB = compile("run-b");
const outputHashes = {};
for (const graph of graphs) {
  for (const suffix of suffixes) {
    const file = `${path.basename(graph, ".ptex")}${suffix}`;
    const a = sha256(path.join(runA.output, file));
    const b = sha256(path.join(runB.output, file));
    if (a !== b) throw new Error(`Nondeterministic Material Maker export: ${file}`);
    outputHashes[file] = a;
  }
}

fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
fs.writeFileSync(
  receiptPath,
  `${JSON.stringify(
    {
      schemaVersion: 1,
      checkpoint: "B01-fast-lane-sprite-first-MM-v001",
      generatedAt: new Date().toISOString(),
      materialMaker: {
        version: "1.3",
        binary: materialMaker,
        binarySha256: sha256(materialMaker),
        target: "Godot/Godot 4 ORM",
        resolution: 512,
      },
      sourceGraphs: Object.fromEntries(
        graphs.map((graph) => [
          path.relative(repoRoot, path.join(graphDir, graph)),
          sha256(path.join(graphDir, graph)),
        ]),
      ),
      outputHashes,
      determinism: {
        runs: ["run-a", "run-b"],
        byteIdentical: true,
        comparedFileCount: Object.keys(outputHashes).length,
        requiredChannels: ["albedo", "height", "normal", "orm"],
        timeoutRecoveries: {
          runA: runA.timeoutRecovered,
          runB: runB.timeoutRecovered,
        },
      },
      reviewOutputRoot: path.relative(repoRoot, runA.output),
      comparisonOutputRoot: path.relative(repoRoot, runB.output),
      logs: [runA.log, runB.log],
    },
    null,
    2,
  )}\n`,
);
console.log(
  `PASS: ${graphs.length} materials compiled twice; ${Object.keys(outputHashes).length} maps are byte-identical.`,
);
