#!/usr/bin/env node
/**
 * Structural, hash, image-channel, and seam checks for GP-MM-STONE-V001.
 * Uses only Node built-ins so the foundry proof works without repo-local deps.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const manifestPath = path.join(here, "manifests", "guard-post-stone-v001.json");
const receiptPath = path.join(here, "receipts", "guard-post-mm13-export-receipt.json");
const cardReceiptPath = path.join(repoRoot, "dev/material-cards/guard-post-card-receipt.json");
const exactNote =
  "Base construction parents only. Maintained overgrowth is a separate condition-response layer and is intentionally absent from this review.";
let passed = 0;

function check(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  passed += 1;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function repoFile(relative) {
  return path.join(repoRoot, relative);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function decodePng(file) {
  const data = fs.readFileSync(file);
  check(data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${file} PNG signature`);
  let offset = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  let interlace;
  const idat = [];
  while (offset < data.length) {
    const length = data.readUInt32BE(offset);
    const type = data.toString("ascii", offset + 4, offset + 8);
    const chunk = data.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      bitDepth = chunk[8];
      colorType = chunk[9];
      interlace = chunk[12];
    } else if (type === "IDAT") {
      idat.push(chunk);
    } else if (type === "IEND") {
      break;
    }
    offset += length + 12;
  }
  check(bitDepth === 8, `${file} is 8-bit`);
  check(colorType === 2 || colorType === 6, `${file} is RGB/RGBA`);
  check(interlace === 0, `${file} is non-interlaced`);
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(width * height * channels);
  for (let y = 0; y < height; y += 1) {
    const rawOffset = y * (stride + 1);
    const filter = raw[rawOffset];
    for (let x = 0; x < stride; x += 1) {
      const encoded = raw[rawOffset + 1 + x];
      const left = x >= channels ? pixels[y * stride + x - channels] : 0;
      const above = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upperLeft = y > 0 && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0;
      let decoded;
      if (filter === 0) decoded = encoded;
      else if (filter === 1) decoded = encoded + left;
      else if (filter === 2) decoded = encoded + above;
      else if (filter === 3) decoded = encoded + Math.floor((left + above) / 2);
      else if (filter === 4) decoded = encoded + paeth(left, above, upperLeft);
      else throw new Error(`Unsupported PNG filter ${filter}`);
      pixels[y * stride + x] = decoded & 255;
    }
  }
  return { channels, height, pixels, width };
}

function channelMean(image, channel) {
  let sum = 0;
  for (let index = channel; index < image.pixels.length; index += image.channels) sum += image.pixels[index];
  return sum / (image.width * image.height);
}

function channelMax(image, channel) {
  let max = 0;
  for (let index = channel; index < image.pixels.length; index += image.channels) {
    max = Math.max(max, image.pixels[index]);
  }
  return max;
}

function seamRms(image, vertical) {
  let sum = 0;
  let count = 0;
  const channelCount = Math.min(3, image.channels);
  const samples = vertical ? image.height : image.width;
  for (let sample = 0; sample < samples; sample += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const aPixel = vertical ? sample * image.width : sample;
      const bPixel = vertical
        ? sample * image.width + image.width - 1
        : (image.height - 1) * image.width + sample;
      const delta =
        image.pixels[aPixel * image.channels + channel] -
        image.pixels[bPixel * image.channels + channel];
      sum += delta * delta;
      count += 1;
    }
  }
  return Math.sqrt(sum / count);
}

const manifest = readJson(manifestPath);
const receipt = readJson(receiptPath);
const cardReceipt = readJson(cardReceiptPath);
check(manifest.batchId === "GP-MM-STONE-V001", "batch id");
check(manifest.reviewNote === exactNote, "exact overview note");
check(manifest.candidates.length === 4, "exactly four candidates");
check(
  manifest.candidates.filter((candidate) => candidate.family === "GP-MM-M01").length === 2,
  "two M01 candidates"
);
check(
  manifest.candidates.filter((candidate) => candidate.family === "GP-MM-M02").length === 2,
  "two M02 candidates"
);
check(receipt.determinism.byteIdentical === true, "twice-exported bytes are identical");
check(receipt.determinism.comparedFileCount === 12, "12 required export files compared");
check(cardReceipt.captureCount === 6 && cardReceipt.pageErrors.length === 0, "six error-free real-browser cards");
check(cardReceipt.renderContract.threeRevision === "166", "three.js r166 render");
check(cardReceipt.renderContract.material === "MeshStandardMaterial", "production PBR material interpretation");

const libraryFile = repoFile(manifest.customNodeLibrary.path);
check(sha256(libraryFile) === manifest.customNodeLibrary.sha256, "custom-node library hash");
const library = readJson(libraryFile);
check(library.lib.length === 2, "only two required reusable custom nodes");
check(library.lib.every((entry) => entry.label.endsWith("v001")), "custom-node versions stable");

for (const candidate of manifest.candidates) {
  check(candidate.seed === (candidate.family === "GP-MM-M01" ? 180041 : 180042), `${candidate.id} fixed seed`);
  check(candidate.declaredScaleMeters.width === 5 && candidate.declaredScaleMeters.height === 5, `${candidate.id} scale`);
  check(!Object.hasOwn(candidate, "conditionTags"), `${candidate.id} has no baked condition tags`);
  const graphFile = repoFile(candidate.source.ptex);
  check(sha256(graphFile) === candidate.source.sha256, `${candidate.id} source hash`);
  const graph = readJson(graphFile);
  const configNode = graph.nodes.find((entry) => entry.name === "candidate_configurations");
  check(Boolean(configNode), `${candidate.id} named configuration node`);
  check(Object.keys(configNode.widgets[0].configurations).length === 2, `${candidate.id} carries two bounded configs`);
  const materialHeight = graph.connections.some(
    (connection) => connection.to === "Material" && connection.to_port === 6
  );
  check(materialHeight, `${candidate.id} preserves height in graph`);

  for (const [channel, output] of Object.entries(candidate.outputs)) {
    const outputFile = repoFile(output.path);
    check(fs.existsSync(outputFile), `${candidate.id} ${channel} exists`);
    check(sha256(outputFile) === output.sha256, `${candidate.id} ${channel} hash`);
    check(receipt.outputHashes[path.basename(outputFile)] === output.sha256, `${candidate.id} ${channel} receipt lineage`);
    const image = decodePng(outputFile);
    check(image.width === 512 && image.height === 512, `${candidate.id} ${channel} 512x512`);
    if (channel === "albedo") {
      check(seamRms(image, true) < 15, `${candidate.id} horizontal seam RMS`);
      check(seamRms(image, false) < 15, `${candidate.id} vertical seam RMS`);
    } else if (channel === "normal") {
      check(channelMean(image, 2) > 230, `${candidate.id} normal blue-axis mean`);
    } else if (channel === "orm") {
      check(channelMean(image, 0) > 230, `${candidate.id} AO mean`);
      check(channelMean(image, 1) > 190 && channelMean(image, 1) < 245, `${candidate.id} roughness band`);
      check(channelMax(image, 2) === 0, `${candidate.id} stone metalness zero`);
    }
  }
}

console.log(`PASS: ${passed} Guard Post material checks.`);
