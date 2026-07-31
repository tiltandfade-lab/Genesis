import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const pack = path.join(root, "assets/models-normalized/meshy-genesis");
const index = JSON.parse(fs.readFileSync(path.join(pack, "index.json"), "utf8"));
const errors = [];
if (Object.keys(index).length !== 18) errors.push(`expected 18 assets, got ${Object.keys(index).length}`);
for (const [slug, entry] of Object.entries(index)) {
  for (const field of ["file","recipeHash","category","semanticParts","materialFamilies","sockets","footprint","collision","scaleAxes","lods"]) {
    if (entry[field] == null) errors.push(`${slug}: missing ${field}`);
  }
  if (entry.lods?.length !== 3) errors.push(`${slug}: expected three LODs`);
  for (const lod of entry.lods || []) {
    const file = path.join(pack, lod.file);
    if (!fs.existsSync(file) || fs.statSync(file).size < 100) errors.push(`${slug}: missing/empty ${lod.file}`);
  }
  if (!entry.sockets?.some(socket => socket.type === "floor-mount" || socket.type === "wall-mount")) {
    errors.push(`${slug}: no mounting socket`);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`PASS: ${Object.keys(index).length} Meshy runtime assets, 54 GLBs, complete citizenship metadata.`);
