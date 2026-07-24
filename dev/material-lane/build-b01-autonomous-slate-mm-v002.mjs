#!/usr/bin/env node
/** Build the approved B01 slate v006 conservative MM replacement graph. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const source = path.join(here, "proofs/b01-autonomous-v006/b01-autonomous-v006-slate.png");
const graphDir = path.join(here, "graphs/b01-autonomous-slate-mm-v002");
const graphPath = path.join(graphDir, "b01-autonomous-roof-slate-v002.ptex");
const manifestPath = path.join(here, "manifests/b01-autonomous-slate-mm-v002.source.json");
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
if (!fs.existsSync(source)) throw new Error(`Missing approved slate source: ${source}`);

const graph = {
  connections: [
    { from: "source_sprite", from_port: 0, to: "height_luma", to_port: 0 },
    { from: "height_luma", from_port: 0, to: "broad_height", to_port: 0 },
    { from: "broad_height", from_port: 0, to: "normal_from_structure", to_port: 0 },
    { from: "broad_height", from_port: 0, to: "ao_from_structure", to_port: 0 },
    { from: "source_sprite", from_port: 0, to: "Material", to_port: 0 },
    { from: "metallic_zero", from_port: 0, to: "Material", to_port: 1 },
    { from: "subject_roughness", from_port: 0, to: "Material", to_port: 2 },
    { from: "normal_from_structure", from_port: 0, to: "Material", to_port: 4 },
    { from: "ao_from_structure", from_port: 0, to: "Material", to_port: 5 },
    { from: "broad_height", from_port: 0, to: "Material", to_port: 6 }
  ],
  label: "B01 autonomous / Roof slate v006 source / MM v002",
  name: "b01_autonomous_roof_slate_v002",
  node_position: { x: 0, y: 0 },
  nodes: [
    { name: "source_sprite", node_position: { x: -560, y: -90 }, parameters: { image: "%PROJECT_PATH%/../../proofs/b01-autonomous-v006/b01-autonomous-v006-slate.png" }, type: "image" },
    { name: "height_luma", node_position: { x: -300, y: 150 }, parameters: { brightness: 0, contrast: 0.85, mode: 2, steps: 16 }, type: "greyscale" },
    { name: "broad_height", node_position: { x: -80, y: 150 }, parameters: { param0: 9, param1: 3, param2: 1 }, type: "fast_blur" },
    { name: "normal_from_structure", node_position: { x: 150, y: 80 }, parameters: { param0: 9, param1: 0.32, param2: 0, param4: 1 }, type: "normal_map" },
    { name: "ao_from_structure", node_position: { x: 150, y: 250 }, parameters: { param0: 9, param1: 16, param2: 0.24, param3: 1 }, type: "occlusion2" },
    { name: "metallic_zero", node_position: { x: 90, y: -220 }, parameters: { color: 0 }, type: "uniform_greyscale" },
    { name: "subject_roughness", node_position: { x: 90, y: -110 }, parameters: { color: 0.78 }, type: "uniform_greyscale" },
    { export_paths: {}, name: "Material", node_position: { x: 430, y: 20 }, parameters: { albedo_color: { a: 1, b: 1, g: 1, r: 1, type: "Color" }, ao: 1, depth_scale: 0.02, emission_energy: 1, metallic: 1, normal: 1, roughness: 1, size: 9, sss: 0 }, type: "material" }
  ]
};
fs.mkdirSync(graphDir, { recursive: true });
fs.writeFileSync(graphPath, `${JSON.stringify(graph, null, 2)}\n`);
fs.writeFileSync(manifestPath, `${JSON.stringify({ schemaVersion: 1, assetId: "B01-ROOF-SLATE-MM-V002", workflow: "approved slate v006 source -> conservative MM depth/PBR derivation", sourceGateManifest: "dev/material-lane/manifests/b01-autonomous-slate-v006.source.json", source: path.relative(repoRoot, source), sourceSha256: sha256(source), graph: path.relative(repoRoot, graphPath), graphSha256: sha256(graphPath), materialTreatment: { albedo: "approved slate v006 source connected directly to Material albedo", height: "luminance at 0.85 contrast, 16 steps, broad blur radius 3", normalStrength: 0.32, ambientOcclusionStrength: 0.24, roughness: 0.78, metallic: 0, depthScale: 0.02, intent: "Broad course and slate separation only; do not emboss painted mineral texture or dither." } }, null, 2)}\n`);
console.log("Built approved slate MM v002 graph.");
