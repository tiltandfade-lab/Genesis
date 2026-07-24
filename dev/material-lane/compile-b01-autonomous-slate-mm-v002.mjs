#!/usr/bin/env node
/** Compile the approved slate MM v002 graph twice and prove determinism. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const graph = path.join(here, "graphs/b01-autonomous-slate-mm-v002/b01-autonomous-roof-slate-v002.ptex");
const exportDir = path.join(here, "exports/b01-autonomous-slate-mm-v002");
const receipt = path.join(here, "receipts/b01-autonomous-slate-mm-v002-export-receipt.json");
const mm = process.env.GENESIS_MATERIAL_MAKER ?? "/Applications/Material Maker 1.3.app/Contents/MacOS/material_maker";
const suffixes = ["_albedo.png", "_heightmap.png", "_normal.png", "_orm.png"];
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
if (![mm, graph].every(fs.existsSync)) throw new Error("Material Maker binary or slate graph is missing.");
if (fs.existsSync(exportDir) || fs.existsSync(receipt)) throw new Error("Refusing to overwrite versioned slate MM v002 output.");
function compile(run) {
  const out = path.join(exportDir, run); fs.mkdirSync(out, { recursive: true });
  const result = spawnSync(mm, ["--no-window", "--export-material", "--target", "Godot/Godot 4 ORM", "-o", out, graph], { encoding: "utf8", timeout: 180000, killSignal: "SIGTERM" });
  const log = path.join(exportDir, `${run}-material-maker.log`); fs.writeFileSync(log, `${result.stdout}${result.stderr}`);
  const complete = suffixes.every((suffix) => fs.existsSync(path.join(out, `b01-autonomous-roof-slate-v002${suffix}`)));
  const timeoutRecovered = result.error?.code === "ETIMEDOUT" && complete;
  if (result.status !== 0 && !timeoutRecovered) throw new Error(`Material Maker ${run} failed. See ${log}`);
  if (!complete) throw new Error(`Material Maker ${run} omitted required maps.`);
  return { out, log: path.basename(log), timeoutRecovered };
}
const a = compile("run-a"), b = compile("run-b"), hashes = {};
for (const suffix of suffixes) { const file = `b01-autonomous-roof-slate-v002${suffix}`; const ah = sha256(path.join(a.out, file)), bh = sha256(path.join(b.out, file)); if (ah !== bh) throw new Error(`Nondeterministic export: ${file}`); hashes[file] = ah; }
fs.mkdirSync(path.dirname(receipt), { recursive: true });
fs.writeFileSync(receipt, `${JSON.stringify({ schemaVersion: 1, assetId: "B01-ROOF-SLATE-MM-V002", generatedAt: new Date().toISOString(), materialMaker: { version: "1.3", binary: mm, binarySha256: sha256(mm), target: "Godot/Godot 4 ORM", resolution: 512 }, graph: { path: path.relative(root, graph), sha256: sha256(graph) }, outputHashes: hashes, determinism: { runs: ["run-a", "run-b"], byteIdentical: true, comparedFileCount: 4, timeoutRecoveries: { runA: a.timeoutRecovered, runB: b.timeoutRecovered } }, reviewOutputRoot: path.relative(root, a.out), comparisonOutputRoot: path.relative(root, b.out), logs: [a.log, b.log] }, null, 2)}\n`);
console.log("PASS: slate MM v002 compiled twice; 4 maps are byte-identical.");
