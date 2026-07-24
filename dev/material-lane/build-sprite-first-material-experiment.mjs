#!/usr/bin/env node
/**
 * Build the controlled sprite-first material experiment.
 *
 * Each graph keeps the generated source sprite as albedo and derives only
 * height, normal, and ambient occlusion from that image. Roughness is a
 * subject-appropriate scalar. Material Maker is therefore adding depth to the
 * sprite instead of procedurally replacing its visual identity.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const sourceDir = path.join(here, "source-sprites", "experiment-v001");
const graphDir = path.join(here, "graphs", "experiments", "sprite-first-v001");
const manifestPath = path.join(
  here,
  "manifests",
  "sprite-first-material-experiment-v001.source.json"
);

const sharedPromptLaw = [
  "Style block: Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). traditional Monster Manual fantasy illustration turned pixel-sprite, warm parchment-adjacent palette, painterly dithered shading, medium value contrast, no genre-bending — this is Genesis's actual default/unreskinned fantasy world, the baseline every other realm departs from.",
  "CLEAN-SHAPES law: clean value shapes FIRST, grit as seasoning. Dither confined to shadow regions and edges — never mid-tones; large flat value planes carry the form; silhouette-first. Every sheet is JUDGED AT 50% ZOOM (play distance) — grit that reads as noise at half size fails.",
  "Generate a square, front-on, orthographic, seamless, edge-to-edge material source sprite. Neutral albedo only: no cast shadow, directional lighting, vignette, frame, labels, props, scene context, damage story, moss, dirt, soot, or weather narrative. Keep large value families readable and the surface construction unmistakable at half size."
].join("\n\n");

const candidates = [
  {
    id: "plank-siding",
    label: "Horizontal plank siding",
    source: "plank-siding-source-v001.png",
    roughness: 0.66,
    prompt: `${sharedPromptLaw}\n\nSubject: warm aged oak horizontal plank siding, broad boards with restrained handmade width variation, narrow dark joints, sparse wood grain, sturdy frontier-fantasy construction, no nails as focal points.`
  },
  {
    id: "timber-shingles",
    label: "Overlapped timber shingles",
    source: "timber-shingles-source-v001.png",
    roughness: 0.76,
    prompt: `${sharedPromptLaw}\n\nSubject: warm brown split-timber roof shingles in coherent overlapping horizontal courses, slight handmade width and edge variation, readable individual pieces, restrained grain, no broken or missing shingles.`
  },
  {
    id: "clay-tiles",
    label: "Fired clay roof tiles",
    source: "clay-tiles-source-v001.png",
    roughness: 0.7,
    prompt: `${sharedPromptLaw}\n\nSubject: warm terracotta fired-clay roof tiles in coherent overlapping courses, subtly irregular handmade profiles, readable curved tile rhythm, restrained color variation, no cracks, chips, lichen, or missing tiles.`
  }
];

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function graphFor(candidate) {
  const imagePath = `%PROJECT_PATH%/../../../source-sprites/experiment-v001/${candidate.source}`;
  return {
    connections: [
      { from: "source_sprite", from_port: 0, to: "height_luma", to_port: 0 },
      { from: "height_luma", from_port: 0, to: "height_from_sprite", to_port: 0 },
      { from: "height_from_sprite", from_port: 0, to: "normal_from_sprite", to_port: 0 },
      { from: "height_from_sprite", from_port: 0, to: "ao_from_sprite", to_port: 0 },
      { from: "source_sprite", from_port: 0, to: "Material", to_port: 0 },
      { from: "metallic_zero", from_port: 0, to: "Material", to_port: 1 },
      { from: "subject_roughness", from_port: 0, to: "Material", to_port: 2 },
      { from: "normal_from_sprite", from_port: 0, to: "Material", to_port: 4 },
      { from: "ao_from_sprite", from_port: 0, to: "Material", to_port: 5 },
      { from: "height_from_sprite", from_port: 0, to: "Material", to_port: 6 }
    ],
    label: `Sprite-first experiment / ${candidate.label} / v001`,
    name: `sprite_first_${candidate.id.replaceAll("-", "_")}_v001`,
    node_position: { x: 0, y: 0 },
    nodes: [
      {
        name: "source_sprite",
        node_position: { x: -540, y: -90 },
        parameters: { image: imagePath },
        type: "image"
      },
      {
        name: "height_luma",
        node_position: { x: -280, y: 150 },
        parameters: { brightness: 0, contrast: 1.05, mode: 2, steps: 32 },
        type: "greyscale"
      },
      {
        name: "height_from_sprite",
        node_position: { x: -70, y: 150 },
        parameters: { param0: 9, param1: 2, param2: 1 },
        type: "fast_blur"
      },
      {
        name: "normal_from_sprite",
        node_position: { x: 150, y: 80 },
        parameters: { param0: 9, param1: 0.45, param2: 0, param4: 1 },
        type: "normal_map"
      },
      {
        name: "ao_from_sprite",
        node_position: { x: 150, y: 250 },
        parameters: { param0: 9, param1: 16, param2: 0.35, param3: 1 },
        type: "occlusion2"
      },
      {
        name: "metallic_zero",
        node_position: { x: 90, y: -220 },
        parameters: { color: 0 },
        type: "uniform_greyscale"
      },
      {
        name: "subject_roughness",
        node_position: { x: 90, y: -110 },
        parameters: { color: candidate.roughness },
        type: "uniform_greyscale"
      },
      {
        export_paths: {},
        name: "Material",
        node_position: { x: 420, y: 20 },
        parameters: {
          albedo_color: { a: 1, b: 1, g: 1, r: 1, type: "Color" },
          ao: 1,
          depth_scale: 0.035,
          emission_energy: 1,
          metallic: 1,
          normal: 1,
          roughness: 1,
          size: 9,
          sss: 0
        },
        type: "material"
      }
    ]
  };
}

fs.mkdirSync(graphDir, { recursive: true });
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });

const sourceSprites = [];
for (const candidate of candidates) {
  const sourcePath = path.join(sourceDir, candidate.source);
  if (!fs.existsSync(sourcePath)) throw new Error(`Missing source sprite: ${sourcePath}`);
  const graphName = `sprite-first-${candidate.id}-v001.ptex`;
  const graphPath = path.join(graphDir, graphName);
  fs.writeFileSync(graphPath, `${JSON.stringify(graphFor(candidate), null, 2)}\n`);
  sourceSprites.push({
    id: candidate.id,
    label: candidate.label,
    generationMode: "built-in-imagegen",
    prompt: candidate.prompt,
    source: path.relative(repoRoot, sourcePath),
    sourceSha256: sha256(sourcePath),
    graph: path.relative(repoRoot, graphPath),
    graphSha256: sha256(graphPath),
    materialTreatment: {
      albedo: "source sprite unchanged by the graph",
      height: "greyscale(source sprite), contrast 1.05, 32 steps, fast blur sigma 2",
      normalStrength: 0.45,
      ambientOcclusionStrength: 0.35,
      roughness: candidate.roughness,
      metallic: 0
    }
  });
}

const manifest = {
  schemaVersion: 1,
  experimentId: "SPRITE-FIRST-MATERIAL-V001",
  purpose: "Compare generated surface sprites directly with Material Maker depth layered on top.",
  controlledRule:
    "The source sprite remains the albedo. Material Maker derives height, normal, and AO from it and supplies subject-appropriate roughness.",
  candidates: sourceSprites
};
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Built ${candidates.length} sprite-first Material Maker graphs.`);
console.log(path.relative(process.cwd(), manifestPath));
