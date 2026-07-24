#!/usr/bin/env node
/** Build the approved B01 P1 sprite-first Material Maker graphs. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const graphDir = path.join(here, "graphs", "b01-autonomous-p1-v001");
const manifestPath = path.join(here, "manifests", "b01-autonomous-p1-mm-v001.source.json");

const candidates = [
  {
    id: "roof-plank-batten",
    label: "Roof plank-and-batten",
    source: "b01-autonomous-v001-plank.png",
    sourceId: "plank",
    roughness: 0.68,
    normalStrength: 0.28,
    aoStrength: 0.20,
    blur: 4,
    depthScale: 0.020
  },
  {
    id: "roof-slate",
    label: "Roof slate",
    source: "b01-autonomous-v001-slate.png",
    sourceId: "slate",
    roughness: 0.78,
    normalStrength: 0.32,
    aoStrength: 0.24,
    blur: 3,
    depthScale: 0.020
  }
];

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function graphFor(candidate) {
  const imagePath = `%PROJECT_PATH%/../../proofs/b01-autonomous-v001/${candidate.source}`;
  return {
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
    label: `B01 autonomous P1 / ${candidate.label} / MM v001`,
    name: `b01_autonomous_${candidate.id.replaceAll("-", "_")}_v001`,
    node_position: { x: 0, y: 0 },
    nodes: [
      { name: "source_sprite", node_position: { x: -560, y: -90 }, parameters: { image: imagePath }, type: "image" },
      { name: "height_luma", node_position: { x: -300, y: 150 }, parameters: { brightness: 0, contrast: 0.85, mode: 2, steps: 16 }, type: "greyscale" },
      { name: "broad_height", node_position: { x: -80, y: 150 }, parameters: { param0: 9, param1: candidate.blur, param2: 1 }, type: "fast_blur" },
      { name: "normal_from_structure", node_position: { x: 150, y: 80 }, parameters: { param0: 9, param1: candidate.normalStrength, param2: 0, param4: 1 }, type: "normal_map" },
      { name: "ao_from_structure", node_position: { x: 150, y: 250 }, parameters: { param0: 9, param1: 16, param2: candidate.aoStrength, param3: 1 }, type: "occlusion2" },
      { name: "metallic_zero", node_position: { x: 90, y: -220 }, parameters: { color: 0 }, type: "uniform_greyscale" },
      { name: "subject_roughness", node_position: { x: 90, y: -110 }, parameters: { color: candidate.roughness }, type: "uniform_greyscale" },
      { export_paths: {}, name: "Material", node_position: { x: 430, y: 20 }, parameters: { albedo_color: { a: 1, b: 1, g: 1, r: 1, type: "Color" }, ao: 1, depth_scale: candidate.depthScale, emission_energy: 1, metallic: 1, normal: 1, roughness: 1, size: 9, sss: 0 }, type: "material" }
    ]
  };
}

fs.mkdirSync(graphDir, { recursive: true });
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
const materials = [];
for (const candidate of candidates) {
  const sourcePath = path.join(here, "proofs", "b01-autonomous-v001", candidate.source);
  if (!fs.existsSync(sourcePath)) throw new Error(`Missing approved source sprite: ${sourcePath}`);
  const graphPath = path.join(graphDir, `b01-autonomous-${candidate.id}-v001.ptex`);
  fs.writeFileSync(graphPath, `${JSON.stringify(graphFor(candidate), null, 2)}\n`);
  materials.push({
    ...candidate,
    source: path.relative(repoRoot, sourcePath),
    sourceSha256: sha256(sourcePath),
    graph: path.relative(repoRoot, graphPath),
    graphSha256: sha256(graphPath),
    materialTreatment: {
      albedo: "approved source sprite connected directly to Material albedo; no MM recolor or synthesis",
      height: `source luminance at 0.85 contrast, quantized to 16 steps, then broad blurred (radius ${candidate.blur})`,
      normalStrength: candidate.normalStrength,
      ambientOcclusionStrength: candidate.aoStrength,
      roughness: candidate.roughness,
      metallic: 0,
      depthScale: candidate.depthScale,
      intent: "Broad construction relief only; painted grain, dither, and edge accents must not become micro-embossing."
    }
  });
}

fs.writeFileSync(manifestPath, `${JSON.stringify({
  schemaVersion: 1,
  checkpoint: "B01-P1-approved-source-to-MM-v001",
  workflow: "approved source sprite -> conservative MM depth/PBR derivation",
  controlledRule: "Albedo is the approved autonomous source sprite unchanged. MM may only derive broad height, normal, AO, and subject roughness.",
  sourceGateReceipt: "dev/material-lane/proofs/b01-autonomous-v001/b01-autonomous-v001-receipt.json",
  materials
}, null, 2)}\n`);
console.log(`Built ${materials.length} conservative sprite-first MM graphs.`);
