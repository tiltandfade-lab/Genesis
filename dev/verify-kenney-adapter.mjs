#!/usr/bin/env node
/* dev/verify-kenney-adapter.mjs — KS-1 (docs/KENNEY-SOCKET-WAVE.md) gate for the Kenney donor
   adapter: build/normalize-donors.py (the build-time normalizer) + src/ui/theater-donor.js (the
   runtime loader) + manifest registration.

   Most checks need neither jsdom nor THREE.js: "sockets present+typed on every admitted
   piece", "scale within ±2% of the measured grid mapping", "determinism (byte-identical second
   normalizer run)", "zero mottle-fallback material families", and "manifest registration" are
   properties of the OUTPUT ARTIFACTS (the normalized .glb files' own glTF JSON, the provenance
   report, manifest.json/genesis.html) or of build/normalize-donors.py's own re-run behavior. None
   of them require actually executing src/ui/theater-donor.js's THREE.js runtime path end-to-end.
   This harness therefore implements its own minimal glTF-binary reader (a direct JS port of
   build/normalize-donors.py's read_glb/scene_aabb — same algorithm, independently re-implemented
   rather than shared, so a bug in one language's port doesn't silently launder into the other's
   "verification") and reads files directly. KGR-3's primitive-material amendment additionally
   parses two normalized real donors with the committed GLTFLoader and executes the production
   family resolver, because primitive extras and ancestor inheritance are loader behavior rather
   than a JSON-only claim. The bridge-card capture remains the complementary browser proof.

   RED-FIRST (⊗, CLAUDE.md convention): section 1 below runs the EXACT SAME "sockets present+typed"
   check function against a RAW, un-normalized source .glb (assets/models/kenney-modular-dungeon-
   kit/room-small.glb) BEFORE running it against the normalized output — proving the check
   genuinely reds on unnormalized input rather than trivially passing on anything handed to it.

   Run:  node dev/verify-kenney-adapter.mjs
         (re-runs build/normalize-donors.py itself for the determinism check — needs python3 on
         PATH, no other deps) */
import { readFileSync, existsSync, readdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p));
const readText = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// minimal glTF-binary reader — independent JS port of build/normalize-donors.py's read_glb +
// scene_aabb (12-byte header + JSON/BIN chunks; AABB via node-transform composition + accessor
// min/max corners). No external deps.
// ============================================================================
function readGlb(absPath) {
  const buf = readFileSync(absPath);
  const magic = buf.toString("ascii", 0, 4);
  if (magic !== "glTF") throw new Error(`not a glb: ${absPath}`);
  const length = buf.readUInt32LE(8);
  let offset = 12;
  let gltf = null, bin = null;
  while (offset < length) {
    const chunkLen = buf.readUInt32LE(offset);
    const chunkType = buf.readUInt32LE(offset + 4);
    const data = buf.subarray(offset + 8, offset + 8 + chunkLen);
    offset += 8 + chunkLen;
    if (chunkType === 0x4e4f534a) gltf = JSON.parse(data.toString("utf-8"));
    else if (chunkType === 0x004e4942) bin = data;
  }
  if (!gltf) throw new Error(`no JSON chunk: ${absPath}`);
  return { gltf, bin };
}

function quatToMat3(q) {
  const [x, y, z, w] = q;
  const xx = x * x, yy = y * y, zz = z * z, xy = x * y, xz = x * z, yz = y * z, wx = w * x, wy = w * y, wz = w * z;
  return [
    [1 - 2 * (yy + zz), 2 * (xy - wz), 2 * (xz + wy)],
    [2 * (xy + wz), 1 - 2 * (xx + zz), 2 * (yz - wx)],
    [2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (xx + yy)],
  ];
}
function mat4FromTrs(t, r, s) {
  t = t || [0, 0, 0]; r = r || [0, 0, 0, 1]; s = s || [1, 1, 1];
  const m3 = quatToMat3(r);
  const M = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 1]];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M[i][j] = m3[i][j] * s[j];
  M[0][3] = t[0]; M[1][3] = t[1]; M[2][3] = t[2];
  return M;
}
function mat4FromMatrix(mat) {
  const M = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  for (let col = 0; col < 4; col++) for (let row = 0; row < 4; row++) M[row][col] = mat[col * 4 + row];
  return M;
}
function matMul(A, B) {
  const C = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    let s = 0; for (let k = 0; k < 4; k++) s += A[i][k] * B[k][j];
    C[i][j] = s;
  }
  return C;
}
function matIdentity() { return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]; }
function transformPoint(M, p) {
  const v = [p[0], p[1], p[2], 1];
  const out = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) { let s = 0; for (let k = 0; k < 4; k++) s += M[i][k] * v[k]; out[i] = s; }
  return [out[0], out[1], out[2]];
}
function nodeLocalMatrix(node) {
  if (node.matrix) return mat4FromMatrix(node.matrix);
  return mat4FromTrs(node.translation, node.rotation, node.scale);
}
function walkAabb(gltf, nodeIdx, parentM, aabb) {
  const node = gltf.nodes[nodeIdx];
  const world = matMul(parentM, nodeLocalMatrix(node));
  if (node.mesh != null) {
    for (const prim of gltf.meshes[node.mesh].primitives || []) {
      const posIdx = prim.attributes && prim.attributes.POSITION;
      if (posIdx == null) continue;
      const acc = gltf.accessors[posIdx];
      if (!acc.min || !acc.max) continue;
      const [mnx, mny, mnz] = acc.min, [mxx, mxy, mxz] = acc.max;
      for (const corner of [[mnx, mny, mnz], [mnx, mny, mxz], [mnx, mxy, mnz], [mnx, mxy, mxz],
                             [mxx, mny, mnz], [mxx, mny, mxz], [mxx, mxy, mnz], [mxx, mxy, mxz]]) {
        const wp = transformPoint(world, corner);
        for (let i = 0; i < 3; i++) { aabb[0][i] = Math.min(aabb[0][i], wp[i]); aabb[1][i] = Math.max(aabb[1][i], wp[i]); }
      }
    }
  }
  for (const c of node.children || []) walkAabb(gltf, c, world, aabb);
}
function sceneAabb(gltf) {
  const sceneIdx = gltf.scene || 0;
  const aabb = [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]];
  for (const root of gltf.scenes[sceneIdx].nodes || []) walkAabb(gltf, root, matIdentity(), aabb);
  return aabb;
}
function allNodeExtras(gltf) {
  return (gltf.nodes || []).filter((n) => n.extras && n.extras.genesisDonor).map((n) => ({ name: n.name, donor: n.extras.genesisDonor }));
}
function sha256Buf(buf) { return createHash("sha256").update(buf).digest("hex"); }

function normalizerPythonProbe(expression) {
  const code = [
    "import importlib.util, json",
    "spec = importlib.util.spec_from_file_location('normalize_donors', 'build/normalize-donors.py')",
    "module = importlib.util.module_from_spec(spec)",
    "spec.loader.exec_module(module)",
    expression,
  ].join("\n");
  return JSON.parse(execFileSync("python3", ["-c", code], { cwd: ROOT, encoding: "utf-8" }));
}

function furnitureFixtureCalibration() {
  const pack="kenney-furniture-kit";
  const asset=(slug,rootMaterialFamily)=>({
    sourceSha256:sha256Buf(read(join("assets/models",pack,`${slug}.glb`))),
    admissionClass:"PART_DONOR", category:"furniture", rootMaterialFamily,
    preTransform:{translation:[0,0,0],rotation:[0,0,0,1],scale:[1,1,1]},
    scaleReason:null, groundOffset:0, semanticParts:{}, sockets:[],
    footprintOverride:null, qaStatus:"needs-review", notes:[],
  });
  return {
    schema:"genesis.kenney-calibration.v1", algorithmVersion:1,
    packs:{[pack]:{sourceUp:"+Y",sourceForward:"+Z",canonicalScale:1,structuralGrid:null}},
    assets:{
      [`${pack}/benchCushionLow`]:asset("benchCushionLow","wood"),
      [`${pack}/lampWall`]:asset("lampWall","iron"),
    },
  };
}
function normalizeFurnitureFixtures() {
  const scratch=mkdtempSync(join(tmpdir(),"genesis-kgr3-materials-"));
  const calibrationPath=join(scratch,"calibration.json"), outputRoot=join(scratch,"normalized");
  writeFileSync(calibrationPath,JSON.stringify(furnitureFixtureCalibration(),null,2)+"\n");
  execFileSync("python3",["build/normalize-donors.py","--calibration",calibrationPath,
    "--output-root",outputRoot,"--provenance",join(scratch,"provenance.json")],
    {cwd:ROOT,stdio:"pipe"});
  return {scratch,outputRoot};
}
async function runtimeGltfLoaderClass() {
  const threeUrl=pathToFileURL(join(ROOT,"vendor/three/three.module.js")).href;
  const utilsSource=readText("vendor/three/addons/utils/BufferGeometryUtils.js")
    .replace("from 'three';",`from ${JSON.stringify(threeUrl)};`);
  const utilsUrl=`data:text/javascript;base64,${Buffer.from(utilsSource).toString("base64")}`;
  const loaderSource=readText("vendor/three/addons/loaders/GLTFLoader.js")
    .replace("from 'three';",`from ${JSON.stringify(threeUrl)};`)
    .replace("from '../utils/BufferGeometryUtils.js';",`from ${JSON.stringify(utilsUrl)};`);
  return (await import(`data:text/javascript;base64,${Buffer.from(loaderSource).toString("base64")}`)).GLTFLoader;
}
function parseGlbWithLoader(path, LoaderClass) {
  const bytes=readFileSync(path);
  const arrayBuffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
  return new Promise((resolve,reject)=>new LoaderClass().parse(arrayBuffer,"",resolve,reject));
}
function sameFamilyBag(actual,expected) {
  return [...actual].sort().join("|")===[...expected].sort().join("|");
}

const VALID_SOCKET_TYPES = new Set(["floor-mount", "wall-mount", "top-surface", "hinge"]);
const VALID_FAMILIES = new Set(["stone", "wood", "iron", "roof", "glass", "cloth"]);

function socketsPresentAndTyped(glbPath) {
  const { gltf } = readGlb(glbPath);
  const extras = allNodeExtras(gltf);
  const allSockets = [];
  for (const e of extras) if (Array.isArray(e.donor.sockets)) allSockets.push(...e.donor.sockets);
  const hasAny = allSockets.length > 0;
  const allTyped = allSockets.every((s) => VALID_SOCKET_TYPES.has(s.type) && Array.isArray(s.position) && s.position.length === 3);
  return { hasAny, allTyped, count: allSockets.length, extrasNodeCount: extras.length };
}

// ============================================================================
// 1. RED-FIRST — the exact same check against a RAW, un-normalized source .glb
// ============================================================================
console.log("=== 1. RED-FIRST: sockets-present-and-typed check against a RAW un-normalized source .glb ===");
const RAW_SAMPLE = join(ROOT, "assets", "models", "kenney-modular-dungeon-kit", "room-small.glb");
if (!existsSync(RAW_SAMPLE)) {
  fail++; console.log("  ✗ raw sample missing:", RAW_SAMPLE);
} else {
  const red = socketsPresentAndTyped(RAW_SAMPLE);
  console.log(`  RED run result (expected to be WRONG — raw source, never normalized): sockets found=${red.count}, extras-carrying nodes=${red.extrasNodeCount}`);
  check("RED: a raw un-normalized source .glb has ZERO genesisDonor sockets (proves the check actually reds on real input, not a stub)",
    red.count === 0 && red.extrasNodeCount === 0,
    `expected 0/0, got count=${red.count} extrasNodeCount=${red.extrasNodeCount}`);
}

console.log("\n=== 1b. KGR-1 RED-FIRST: primitive-union bounds + transformed-scene bounds ===");
{
  const union = normalizerPythonProbe([
    "gltf = {'nodes':[{'mesh':0}], 'meshes':[{'primitives':[",
    "  {'attributes':{'POSITION':0}}, {'attributes':{'POSITION':1}}",
    "]}], 'accessors':[",
    "  {'min':[-4,-3,-2], 'max':[5,6,7]},",
    "  {'min':[-1,-1,-1], 'max':[1,1,1]}",
    "]}",
    "print(json.dumps(module.node_local_mesh_aabb(gltf, 0)))",
  ].join("\n"));
  check("KGR-1 ⊗ primitive union: a smaller second primitive cannot overwrite the first primitive's extrema",
    JSON.stringify(union) === JSON.stringify([[-4, -3, -2], [5, 6, 7]]),
    `got ${JSON.stringify(union)}; old last-primitive implementation returns [[-1,-1,-1],[1,1,1]]`);

  const transformedProbe = normalizerPythonProbe([
    "gltf = {'scene':0, 'scenes':[{'nodes':[0]}], 'nodes':[{'mesh':0, 'translation':[10,20,30], 'scale':[2,3,4]}],",
    " 'meshes':[{'primitives':[{'attributes':{'POSITION':0}}]}],",
    " 'accessors':[{'min':[-1,-1,-1], 'max':[1,1,1]}]}",
    "print(json.dumps({'sceneWalk':module.scene_aabb(gltf), 'accessorOnly':[gltf['accessors'][0]['min'], gltf['accessors'][0]['max']]}))",
  ].join("\n"));
  check("KGR-1 ⊗ transformed scene walk: node translation/scale affect measured scene bounds",
    JSON.stringify(transformedProbe.sceneWalk) === JSON.stringify([[8, 17, 26], [12, 23, 34]]),
    `got ${JSON.stringify(transformedProbe.sceneWalk)}`);
  check("KGR-1 ⊗ mutation control: replacing the scene walk with accessor-only union reports the wrong scaled-node bounds",
    JSON.stringify(transformedProbe.accessorOnly) !== JSON.stringify([[8, 17, 26], [12, 23, 34]]) &&
      JSON.stringify(transformedProbe.accessorOnly) === JSON.stringify([[-1, -1, -1], [1, 1, 1]]),
    `accessor-only control unexpectedly matched: ${JSON.stringify(transformedProbe.accessorOnly)}`);

  for (const slug of ["wall", "floor"]) {
    const { gltf } = readGlb(join(ROOT, "assets", "models", "kenney-mini-dungeon", `${slug}.glb`));
    const bounds = sceneAabb(gltf);
    const footprint = [bounds[1][0] - bounds[0][0], bounds[1][2] - bounds[0][2]];
    check(`KGR-1 transformed real mini-dungeon ${slug} footprint is 1.0 x 1.0 source units`,
      footprint.every((v) => Math.abs(v - 1.0) <= 1e-9), `got ${JSON.stringify(footprint)}`);
  }
}

// ============================================================================
// 2. Run the normalizer fresh, then GREEN re-proof: every admitted piece's NORMALIZED output has
//    sockets present + typed.
// ============================================================================
console.log("\n=== 2. Run build/normalize-donors.py, then GREEN re-proof over every admitted piece ===");
const adapterCalibration = JSON.parse(readText("dev/model-foundry/kenney-calibration.json"));
const expectedCalibrationIds = Object.keys(adapterCalibration.assets || {}).sort();
const exactIds = (expected,actual) => expected.length === actual.length && expected.every((id,index)=>id===actual[index]);
const socketsMatchQa = (record,sockets) => record?.qaStatus === "quarantined"
  ? !sockets.hasAny && sockets.count === 0
  : sockets.hasAny && sockets.allTyped;
let provenance = null;
try {
  execFileSync("python3", ["build/normalize-donors.py"], { cwd: ROOT, stdio: "pipe" });
  provenance = JSON.parse(readText("dev/model-foundry/KS1-PROVENANCE.json"));
  check("normalizer ran and wrote dev/model-foundry/KS1-PROVENANCE.json", !!provenance, "no provenance produced");
} catch (e) {
  fail++;
  console.log("  ✗ normalizer run threw:", e.message);
}

if (provenance) {
  const provenanceIds=provenance.pieces.map(piece=>`${piece.pack}/${piece.slug}`).sort();
  const outputIds=Object.keys(adapterCalibration.packs).flatMap(pack=>
    readdirSync(join(ROOT,"assets/models-normalized",pack))
      .filter(file=>file.endsWith(".glb"))
      .map(file=>`${pack}/${file.replace(/\.glb$/i,"")}`)).sort();
  const indexIds=Object.keys(adapterCalibration.packs).flatMap(pack=>{
    const index=JSON.parse(readText(`assets/models-normalized/${pack}/index.json`));
    return Object.keys(index.assets||{}).map(slug=>`${pack}/${slug}`);
  }).sort();
  check("provenance total is derived from exact validated calibration ownership",
    provenance.totalPiecesAdmitted===expectedCalibrationIds.length&&exactIds(expectedCalibrationIds,provenanceIds),
    `calibration=${expectedCalibrationIds.length} provenance=${provenance.totalPiecesAdmitted}`);
  check("normalized GLB file ids match calibration ownership bidirectionally",exactIds(expectedCalibrationIds,outputIds));
  check("normalized index ids match calibration ownership bidirectionally",exactIds(expectedCalibrationIds,indexIds));
  check("⊗ missing id fails exact adapter ownership",!exactIds(expectedCalibrationIds,provenanceIds.slice(1)));
  check("⊗ extra id fails exact adapter ownership",!exactIds(expectedCalibrationIds,[...provenanceIds,"kenney-unexpected/escape"].sort()));

  let allSocketsOk = true, allScaleOk = true, allFamiliesOk = true, allUvsOk = true, allAuthoredMaterialsGone = true;
  const scaleFailures = [], socketFailures = [], familyFailures = [], uvFailures = [], materialStripFailures = [];

  for (const piece of provenance.pieces) {
    const outAbs = join(ROOT, piece.outputFile);
    if (!existsSync(outAbs)) { allSocketsOk = false; socketFailures.push(`${piece.pack}/${piece.slug}: output file missing`); continue; }

    // (a) sockets present + typed, direct from the FILE (not just the provenance JSON's own copy
    // — re-derives independently from the glb bytes so this check can't just be validating
    // the report validating itself).
    const s = socketsPresentAndTyped(outAbs);
    const assetId=`${piece.pack}/${piece.slug}`, record=adapterCalibration.assets[assetId];
    const socketsMatchStatus=socketsMatchQa(record,s);
    if (!socketsMatchStatus) {
      allSocketsOk = false;
      socketFailures.push(`${assetId}: qa=${record?.qaStatus} hasAny=${s.hasAny} allTyped=${s.allTyped} count=${s.count}`);
    }

    // (b) scale within ±2% of the measured grid mapping — re-measure the OUTPUT file's own
    // AABB (independent of the provenance report's cached scaledDims) and cross-check against the
    // module-target ratio for modular architectural pieces (shell/wall/frame pieces whose
    // footprint should land on an exact multiple of MODULE_TARGET_WORLD_UNITS=2.0 per the scale
    // derivation in build/normalize-donors.py's own header).
    const { gltf: outGltf } = readGlb(outAbs);
    for (const key of ["materials", "textures", "images", "samplers"]) {
      if (key in outGltf) { allAuthoredMaterialsGone = false; materialStripFailures.push(`${piece.pack}/${piece.slug}: retained top-level ${key}`); }
    }
    for (let mi = 0; mi < (outGltf.meshes || []).length; mi++) {
      for (let pi = 0; pi < (outGltf.meshes[mi].primitives || []).length; pi++) {
        if ("material" in outGltf.meshes[mi].primitives[pi]) {
          allAuthoredMaterialsGone = false;
          materialStripFailures.push(`${piece.pack}/${piece.slug}: mesh ${mi} primitive ${pi} retained material binding`);
        }
      }
    }
    const aabb = sceneAabb(outGltf);
    const dims = [aabb[1][0] - aabb[0][0], aabb[1][1] - aabb[0][1], aabb[1][2] - aabb[0][2]];
    const expected = piece.scaledDims;
    const dimsMatchProvenance = dims.every((d, i) => Math.abs(d - expected[i]) <= Math.max(0.02 * Math.abs(expected[i]), 1e-6));
    if (!dimsMatchProvenance) {
      allScaleOk = false;
      scaleFailures.push(`${piece.pack}/${piece.slug}: re-measured dims ${JSON.stringify(dims)} vs provenance ${JSON.stringify(expected)}`);
    }
    // grid-multiple check: for modules whose footprint should be an exact multiple of 2.0 world
    // units, the wider of X/Z should land within 2% of the nearest 2.0-multiple. Exempted:
    // door-leaf (sub-module parts, never a full module footprint), doorway-frame/arch (Kenney's
    // own gate-door.glb/gate.glb/gate-metal-bars.glb author the FRAME ~0.4 authored units — ~1ft
    // pre-scale — WIDER than the corridor module it plugs into, a deliberate wall-junction trim
    // overhang verified during measurement, not a scale-derivation error), and stairs (the run
    // legitimately spans more than one module's depth). These are real, measured, documented
    // characteristics of THOSE piece types — see build/normalize-donors.py's PILOT MANIFEST
    // comments — not a signal the canonicalScale derivation itself is off; shell/wall/floor
    // pieces (the ones that DO define the module grid) stay under the full check below and all
    // pass exactly, which is the actual "scale matches the measured grid mapping" signal.
    // This secondary heuristic only applies to the categories that ARE, by the kit's own design,
    // full architectural grid modules — corridor-shell/room-shell/floor (the exact pieces
    // build/normalize-donors.py's own header measured to DERIVE canonicalScale in the first
    // place). wall/wall-corner carries genuine sub-module trim/corner/detail/half pieces
    // (template-wall-half.glb, template-wall-corner.glb, template-detail.glb) that were never
    // claimed to fill a whole cell — forcing them through a "must be a clean module multiple"
    // assumption would be testing a claim this unit never made. door-leaf/doorway-frame/arch/
    // stairs are exempted for the documented overhang reasons above.
    const gridMultipleCategories = new Set(["corridor-shell", "room-shell", "floor"]);
    if (gridMultipleCategories.has(piece.category)) {
      // GRID LAW itself is 1.0 world unit = 5 ft (src/ui/theater-interior.js:25) — the real
      // assertable invariant is "lands within 2% of the nearest 1.0-world-unit cell boundary".
      const footprint = Math.max(dims[0], dims[2]);
      const nearestCell = Math.round(footprint / 1.0) * 1.0;
      if (nearestCell > 0) {
        const pct = Math.abs(footprint - nearestCell) / nearestCell;
        if (pct > 0.02) {
          allScaleOk = false;
          scaleFailures.push(`${piece.pack}/${piece.slug}: footprint ${footprint.toFixed(4)} is ${(pct * 100).toFixed(2)}% off the nearest 1.0-world-unit (5ft) GRID LAW cell boundary (${nearestCell})`);
        }
      }
    }

    // (c) material families — every family used is one of the 6 valid families, AND (the
    // "zero mottle-fallback" gate) it maps to a KNOWN theater-materials.js MATERIAL_FAMILY key via
    // theater-donor.js's own DONOR_PAINT_KEY table (checked in section 3 against the real source
    // text) — here we just confirm every stamped family name is in the valid vocabulary.
    for (const fam of piece.materialFamilies) {
      if (!VALID_FAMILIES.has(fam)) { allFamiliesOk = false; familyFailures.push(`${piece.pack}/${piece.slug}: invalid family "${fam}"`); }
    }

    // (d) KGR-1 material-coordinate law: removing authored material records must not remove any
    // source TEXCOORD_* attribute or its accessor/bufferView dependency. The normalizer leaves the
    // BIN and accessor tables intact by design, so exact index + JSON equality is the strongest gate.
    const { gltf: rawGltf } = readGlb(join(ROOT, "assets", "models", piece.pack, `${piece.slug}.glb`));
    for (let mi = 0; mi < (rawGltf.meshes || []).length; mi++) {
      const rawPrims = rawGltf.meshes[mi].primitives || [];
      const outPrims = ((outGltf.meshes || [])[mi] || {}).primitives || [];
      for (let pi = 0; pi < rawPrims.length; pi++) {
        const rawAttrs = rawPrims[pi].attributes || {};
        const outAttrs = (outPrims[pi] || {}).attributes || {};
        for (const name of Object.keys(rawAttrs).filter((k) => k.startsWith("TEXCOORD_"))) {
          const rawAccessorIndex = rawAttrs[name], outAccessorIndex = outAttrs[name];
          const sameIndex = outAccessorIndex === rawAccessorIndex;
          const rawAccessor = rawGltf.accessors[rawAccessorIndex];
          const outAccessor = outGltf.accessors[outAccessorIndex];
          const sameAccessor = sameIndex && isDeepStrictEqual(outAccessor, rawAccessor);
          const rawView = rawAccessor && rawGltf.bufferViews[rawAccessor.bufferView];
          const outView = outAccessor && outGltf.bufferViews[outAccessor.bufferView];
          const sameView = sameAccessor && isDeepStrictEqual(outView, rawView);
          if (!sameView) {
            allUvsOk = false;
            uvFailures.push(`${piece.pack}/${piece.slug} mesh ${mi} primitive ${pi} ${name}: raw accessor ${rawAccessorIndex}, output ${String(outAccessorIndex)}`);
          }
        }
      }
    }
  }

  check("GREEN: quarantined outputs are socket-empty; every non-quarantined output has valid typed sockets", allSocketsOk, socketFailures.slice(0, 5).join(" | "));
  check("⊗ non-quarantined mount-free record fails the adapter socket rule",
    !socketsMatchQa({qaStatus:"approved-dev"},{hasAny:false,allTyped:true,count:0}));
  check("GREEN: every admitted piece's measured scale is within ±2% of its provenance record AND (for shell/floor module pieces) the nearest 1.0-world-unit GRID LAW cell boundary", allScaleOk, scaleFailures.slice(0, 5).join(" | "));
  check("GREEN: every stamped material family is in the valid vocabulary {stone,wood,iron,roof,glass,cloth}", allFamiliesOk, familyFailures.slice(0, 5).join(" | "));
  check("KGR-1 ⊗ GREEN: every normalized primitive retains every raw TEXCOORD_* accessor and referenced bufferView exactly", allUvsOk, uvFailures.slice(0, 5).join(" | "));
  check("KGR-1 material strip: authored material/image/texture/sampler records and primitive bindings remain absent", allAuthoredMaterialsGone, materialStripFailures.slice(0, 5).join(" | "));
}

// ============================================================================
// 3. zero mottle-fallback — cross-check theater-donor.js's DONOR_PAINT_KEY against
//    theater-materials.js's REAL MATERIAL_FAMILY table (regex-extracted from the actual source,
//    not hand-duplicated blindly) so a family used by any ADMITTED piece can never silently hit
//    materialFamilyFor's mottle-fallback census path.
// ============================================================================
console.log("\n=== 3. zero mottle-fallback — DONOR_PAINT_KEY vs theater-materials.js's real MATERIAL_FAMILY keys ===");
{
  const materialsSrc = readText("src/ui/theater-materials.js");
  const donorSrc = readText("src/ui/theater-donor.js");
  const familyBlockMatch = materialsSrc.match(/const MATERIAL_FAMILY = Object\.freeze\(\{([\s\S]*?)\}\);/);
  check("theater-materials.js's MATERIAL_FAMILY table is readable (regex matched)", !!familyBlockMatch, "regex did not match — has the file's shape changed?");
  const knownMaterialKeys = new Set();
  if (familyBlockMatch) {
    const keyRe = /"([a-z-]+)"\s*:/g;
    let m;
    while ((m = keyRe.exec(familyBlockMatch[1]))) knownMaterialKeys.add(m[1]);
  }

  const paintKeyBlockMatch = donorSrc.match(/const DONOR_PAINT_KEY = Object\.freeze\(\{([\s\S]*?)\}\);/);
  check("theater-donor.js's DONOR_PAINT_KEY table is readable (regex matched)", !!paintKeyBlockMatch, "regex did not match");
  const donorPaintKeys = {};
  if (paintKeyBlockMatch) {
    const pairRe = /(\w+):\s*"([a-z-]+)"/g;
    let m;
    while ((m = pairRe.exec(paintKeyBlockMatch[1]))) donorPaintKeys[m[1]] = m[2];
  }

  if (provenance) {
    const usedFamilies = new Set(provenance.materialFamiliesObserved);
    const badMappings = [];
    for (const fam of usedFamilies) {
      const paintKey = donorPaintKeys[fam];
      if (!paintKey) { badMappings.push(`${fam}: no DONOR_PAINT_KEY entry at all (would fall through to no texture, not a mottle-fallback, but still a gap)`); continue; }
      if (!knownMaterialKeys.has(paintKey)) { badMappings.push(`${fam} -> "${paintKey}" is NOT a real theater-materials.js MATERIAL_FAMILY key — would trigger materialFamilyFor's mottle-fallback census`); }
    }
    check(`zero mottle-fallback: every family actually used by an admitted piece (${[...usedFamilies].join(",")}) maps to a real, known MATERIAL_FAMILY key`,
      badMappings.length === 0, badMappings.join(" | "));
  }
}

// ============================================================================
// 4. determinism — re-run the normalizer a SECOND time; every output .glb must be byte-
//    identical, and the provenance report must be identical modulo nothing (no timestamps are
//    embedded in this report by design — confirmed by re-hashing the whole JSON text too).
// ============================================================================
console.log("\n=== 4. determinism — byte-identical second normalizer run ===");
function hashAllOutputs() {
  const hashes = {};
  for (const pack of ["kenney-modular-dungeon-kit", "kenney-mini-dungeon"]) {
    const dir = join(ROOT, "assets", "models-normalized", pack);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".glb")) continue;
      hashes[`${pack}/${f}`] = sha256Buf(read(join("assets", "models-normalized", pack, f)));
    }
  }
  return hashes;
}
const hashesBefore = hashAllOutputs();
const reportTextBefore = existsSync(join(ROOT, "dev/model-foundry/KS1-PROVENANCE.json")) ? readText("dev/model-foundry/KS1-PROVENANCE.json") : null;
const indexTextBefore = Object.fromEntries(["kenney-modular-dungeon-kit", "kenney-mini-dungeon"].map((pack) =>
  [pack, readText(join("assets", "models-normalized", pack, "index.json"))]));
try {
  execFileSync("python3", ["build/normalize-donors.py"], { cwd: ROOT, stdio: "pipe" });
  const hashesAfter = hashAllOutputs();
  const reportTextAfter = readText("dev/model-foundry/KS1-PROVENANCE.json");
  const indexTextAfter = Object.fromEntries(["kenney-modular-dungeon-kit", "kenney-mini-dungeon"].map((pack) =>
    [pack, readText(join("assets", "models-normalized", pack, "index.json"))]));
  const keysBefore = Object.keys(hashesBefore), keysAfter = Object.keys(hashesAfter);
  const sameKeys = keysBefore.length === keysAfter.length && keysBefore.every((k) => k in hashesAfter);
  const sameHashes = sameKeys && keysBefore.every((k) => hashesBefore[k] === hashesAfter[k]);
  check("determinism: identical set of output files across two runs", sameKeys, `before=${keysBefore.length} after=${keysAfter.length}`);
  check("determinism: every output .glb is BYTE-IDENTICAL across two runs (re-hashed from disk)", sameHashes,
    sameKeys ? keysBefore.filter((k) => hashesBefore[k] !== hashesAfter[k]).slice(0, 5).join(", ") : "key set differs");
  check("determinism: the provenance report JSON is byte-identical across two runs (no embedded timestamps/randomness)",
    reportTextBefore !== null && reportTextBefore === reportTextAfter, "report text differs between runs");
  check("determinism: both pack index.json files are byte-identical across two runs",
    JSON.stringify(indexTextBefore) === JSON.stringify(indexTextAfter), "one or both pack indexes changed across identical runs");
} catch (e) {
  fail++;
  console.log("  ✗ second normalizer run threw:", e.message);
}

// ============================================================================
// 5. KGR-2 render-safety retreat — the per-realm outline table remains policy metadata, but the
//    inverted-hull geometry path is retired. The real-browser sweep over every loaded pilot lives
//    in capture-ks3-kit-shells.mjs; these source checks make the retirement mutation-sensitive.
// ============================================================================
console.log("\n=== 5. KGR-2: outline policy retained, inverted-hull geometry retired ===");
{
  const donorSrc = readText("src/ui/theater-donor.js");
  const outlineTable = donorSrc.match(/const OUTLINE_STYLE_BY_REALM = Object\.freeze\(\{([\s\S]*?)\}\);/);
  check("KGR-2: OUTLINE_STYLE_BY_REALM remains present as dormant policy metadata", !!outlineTable,
    "realm outline policy table missing");
  if (outlineTable) {
    for (const realm of ["fantasy", "gloom", "chrome"]) {
      check(`KGR-2: dormant outline policy still names ${realm}`, new RegExp(`\\b${realm}\\s*:`).test(outlineTable[1]),
        `${realm} policy missing`);
    }
  }
  check("KGR-2: source explicitly documents that inverted-hull geometry is retired",
    /inverted-hull geometry[^\n]*retired|geometry implementation[^\n]*retired/i.test(donorSrc),
    "missing explicit retired-geometry comment");
  check("KGR-2 ⊗: no buildDonorOutlineHull geometry constructor remains",
    !/function\s+buildDonorOutlineHull\s*\(/.test(donorSrc), "restored inverted-hull constructor found");
  check("KGR-2 ⊗: no donorOutlineHull runtime marker remains",
    !/donorOutlineHull/.test(donorSrc), "restored donorOutlineHull marker found");
  check("KGR-2 ⊗: load traversal never adds an outline hull child",
    !/obj\.add\(hull\)/.test(donorSrc), "restored obj.add(hull) mutation found");
}

// ============================================================================
// 6. KGR-3 calibrated v2 indexes + runtime compatibility boundary
// ============================================================================
console.log("\n=== 6. KGR-3 calibrated v2 indexes + runtime compatibility boundary ===");
{
  const calibration = JSON.parse(readText("dev/model-foundry/kenney-calibration.json"));
  check("KGR-3: calibration source owns the exact validated asset set",
    calibration.schema === "genesis.kenney-calibration.v1" && exactIds(expectedCalibrationIds,Object.keys(calibration.assets || {}).sort()),
    `schema=${calibration.schema} count=${Object.keys(calibration.assets || {}).length}`);
  let allV2 = true, allFrames = true, noButt = true, allHashes = true;
  const indexedIds=[];
  for (const pack of Object.keys(calibration.packs || {})) {
    const index = JSON.parse(readText(`assets/models-normalized/${pack}/index.json`));
    allV2 = allV2 && index.schema === "genesis.donor-index.v2" && !!index.assets;
    for (const [slug, entry] of Object.entries(index.assets || {})) {
      const assetId=`${pack}/${slug}`; indexedIds.push(assetId);
      allV2 = allV2 && entry.schema === "genesis.donor.v2" && entry.assetId === assetId;
      allHashes = allHashes && !!calibration.assets[assetId] && entry.sourceSha256 === calibration.assets[assetId].sourceSha256;
      for (const socket of entry.sockets || []) {
        allFrames = allFrames && socket.id && Array.isArray(socket.rotation) && socket.rotation.length === 4 &&
          socket.position.concat(socket.rotation).every(Number.isFinite);
        noButt = noButt && !String(socket.type).startsWith("butt-join-");
      }
    }
  }
  indexedIds.sort();
  check("KGR-3: all normalized indexes and every entry use donor v2", allV2);
  check("KGR-3: normalized indexes exactly equal calibration ownership",exactIds(expectedCalibrationIds,indexedIds));
  check("KGR-3 ⊗: missing/extra index ids both fail ownership",
    !exactIds(expectedCalibrationIds,indexedIds.slice(1))&&
    !exactIds(expectedCalibrationIds,[...indexedIds,"kenney-unexpected/escape"].sort()));
  check("KGR-3: every index entry retains its calibrated source hash", allHashes);
  check("KGR-3: every v2 socket carries id + finite position/quaternion frame", allFrames);
  check("KGR-3 ⊗: no v2 entry emits a butt-join structural socket", noButt);

  const donorSrc = readText("src/ui/theater-donor.js");
  check("KGR-3: runtime read helper explicitly unwraps v2 indexes",
    /function\s+donorEntriesForRead[\s\S]*?genesis\.donor-index\.v2[\s\S]*?index\.assets/.test(donorSrc),
    "donorEntriesForRead v2 branch missing");
  check("KGR-3: runtime read helper retains a flat-index v1 fallback",
    /function\s+donorEntriesForRead[\s\S]*?return\s+index\s*\|\|\s*\{\}/.test(donorSrc),
    "flat v1 fallback missing");
  check("KGR-3 ⊗: registry generation rejects anything except donor-index v2",
    /function\s+donorRegistryFromIndex[\s\S]*?schema\s*!==\s*"genesis\.donor-index\.v2"[\s\S]*?throw new Error/.test(donorSrc),
    "strict v2 registry guard missing");

  const socketDerivationProbe = normalizerPythonProbe([
    "bounds = {'footprint': {'center': [0, 0]}, 'groundY': 0, 'aabbMax': [1, 2, 1]}",
    "wall = {'sockets': [module.default_socket('wall-anchor', 'wall-mount', [0, 1, 0], 'wall')], 'category': 'wall', 'qaStatus': 'needs-review'}",
    "quarantined = {'sockets': [], 'category': 'floor', 'qaStatus': 'quarantined'}",
    "legacy = {'sockets': [], 'category': 'wall', 'qaStatus': 'needs-review'}",
    "print(json.dumps({'wall': module.derive_sockets(wall, bounds), 'quarantined': module.derive_sockets(quarantined, bounds), 'legacy': module.derive_sockets(legacy, bounds)}))",
  ].join("\n"));
  check("KGR-3 mount derivation: explicit wall-mount-only fixture stays wall-only",
    socketDerivationProbe.wall.length === 1 &&
    socketDerivationProbe.wall[0].id === "wall-anchor" &&
    socketDerivationProbe.wall[0].type === "wall-mount",
    JSON.stringify(socketDerivationProbe.wall));
  check("KGR-3 mount derivation: empty quarantined fixture remains socket-empty",
    socketDerivationProbe.quarantined.length === 0,
    JSON.stringify(socketDerivationProbe.quarantined));
  check("KGR-3 mount derivation: mountless reviewed legacy fixture still derives floor-mount",
    socketDerivationProbe.legacy.length === 1 && socketDerivationProbe.legacy[0].type === "floor-mount",
    JSON.stringify(socketDerivationProbe.legacy));

  // Execute the real exported helper with only its browser/THREE imports replaced by inert
  // declarations. donorRegistryFromIndex itself is otherwise byte-for-byte the production body.
  const executableDonorSrc = donorSrc
    .replace('import * as THREE from "three";', "const THREE = {};")
    .replace('import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";', "class GLTFLoader {}")
    .replace('import { socketFrameOf } from "./theater-attachment.js";', "const socketFrameOf = () => null;") +
    "\nexport { donorMaterialFamilyForMesh };\n";
  let registryHelper = null, materialFamilyHelper = null;
  try {
    ({ donorRegistryFromIndex: registryHelper, donorMaterialFamilyForMesh: materialFamilyHelper } = await import(
      `data:text/javascript;base64,${Buffer.from(executableDonorSrc).toString("base64")}`
    ));
  } catch (error) {
    check("KGR-3 D8: real registry helper imports in the harness", false, error.message);
  }
  if (registryHelper) {
    const indexes = Object.keys(calibration.packs).map((pack) =>
      JSON.parse(readText(`assets/models-normalized/${pack}/index.json`)));
    const expectedRuntimeIds = new Set([
      "kenney-retro-fantasy-kit/detail-barrel", "kenney-pirate-kit/crate", "kenney-pirate-kit/chest",
      "kenney-furniture-kit/tableRound", "kenney-furniture-kit/benchCushionLow", "kenney-furniture-kit/chair",
      "kenney-furniture-kit/lampWall", "kenney-furniture-kit/lampRoundFloor",
      "kenney-fantasy-town-kit/lantern", "kenney-factory-kit/lever-double",
    ]);
    const productionIds = indexes.flatMap((index) => Object.keys(registryHelper(index)));
    check("KGR-3 D8: production registry is exactly the ten named approved-runtime pilots",
      productionIds.length === expectedRuntimeIds.size &&
      productionIds.every((id) => expectedRuntimeIds.has(id)) &&
      [...expectedRuntimeIds].every((id) => productionIds.includes(id)),
      JSON.stringify(productionIds));

    const sampleIndex = indexes[0];
    const [sampleSlug, sampleEntry] = Object.entries(sampleIndex.assets)[0];
    const indexWithStatus = (qaStatus, omit = false) => {
      const entry = { ...sampleEntry };
      if (omit) delete entry.qaStatus;
      else entry.qaStatus = qaStatus;
      return { ...sampleIndex, assets: { [sampleSlug]: entry } };
    };
    check("KGR-3 D8: a provenance-valid approved-runtime entry enters production lookup",
      Object.keys(registryHelper(indexWithStatus("approved-runtime"))).length === 1);
    for (const qaStatus of ["needs-review", "approved-dev", "quarantined"]) {
      check(`KGR-3 D8 ⊗: ${qaStatus} is excluded from production lookup`,
        Object.keys(registryHelper(indexWithStatus(qaStatus))).length === 0);
    }
    let unknownFailed = false, missingFailed = false;
    try { registryHelper(indexWithStatus("future-status")); } catch { unknownFailed = true; }
    try { registryHelper(indexWithStatus(null, true)); } catch { missingFailed = true; }
    check("KGR-3 D8 ⊗: unknown qaStatus fails instead of silently skipping", unknownFailed);
    check("KGR-3 D8 ⊗: missing qaStatus fails instead of silently skipping", missingFailed);
  }

  const sourceMaterialMap = normalizerPythonProbe(
    "print(json.dumps([module.source_material_family(name) for name in ['WOOD', 'CaRpEt', 'METAL', 'LaMp', '_defaultMat', None]]))"
  );
  check("KGR-3 primitive materials: exact case-folded source map and unknown/absent rejection",
    JSON.stringify(sourceMaterialMap)===JSON.stringify(["wood","cloth","iron","glass",null,null]),
    JSON.stringify(sourceMaterialMap));
  if (materialFamilyHelper) {
    let fixtureRun = null;
    try {
      fixtureRun=normalizeFurnitureFixtures();
      const LoaderClass=await runtimeGltfLoaderClass();
      const bench=await parseGlbWithLoader(join(fixtureRun.outputRoot,"kenney-furniture-kit/benchCushionLow.glb"),LoaderClass);
      const lamp=await parseGlbWithLoader(join(fixtureRun.outputRoot,"kenney-furniture-kit/lampWall.glb"),LoaderClass);
      const meshList=(scene)=>{const out=[];scene.traverse((obj)=>{if(obj.isMesh)out.push(obj);});return out;};
      const benchMeshes=meshList(bench.scene), lampMeshes=meshList(lamp.scene);
      const families=(meshes)=>meshes.map((mesh)=>materialFamilyHelper(mesh));
      const benchFamilies=families(benchMeshes), lampFamilies=families(lampMeshes);
      check("KGR-3 primitive materials: GLTFLoader runtime bench family bag is wood,cloth,wood",
        sameFamilyBag(benchFamilies,["wood","cloth","wood"]),JSON.stringify(benchFamilies));
      check("KGR-3 primitive materials: GLTFLoader runtime lamp family bag is iron,glass",
        sameFamilyBag(lampFamilies,["iron","glass"]),JSON.stringify(lampFamilies));
      const unknownBenchMesh=benchMeshes.find((mesh)=>!mesh.geometry?.userData?.genesisDonor?.materialFamily);
      check("KGR-3 primitive materials: unknown _defaultMat inherits nearest calibrated root family",
        !!unknownBenchMesh&&materialFamilyHelper(unknownBenchMesh)==="wood");
      check("KGR-3 primitive materials: every real multi-primitive mesh resolves before white fallback",
        benchFamilies.concat(lampFamilies).every((family)=>typeof family==="string"&&family.length>0));

      const geometryData=benchMeshes.map((mesh)=>mesh.geometry.userData);
      benchMeshes.forEach((mesh)=>{mesh.geometry.userData={};});
      const withoutPrimitiveStamping=families(benchMeshes);
      geometryData.forEach((data,index)=>{benchMeshes[index].geometry.userData=data;});
      check("KGR-3 primitive materials ⊗: removing primitive stamping reds the real bench family bag",
        !sameFamilyBag(withoutPrimitiveStamping,["wood","cloth","wood"]),
        JSON.stringify(withoutPrimitiveStamping));

      const ancestorFamilies=[];
      bench.scene.traverse((obj)=>{
        const donor=obj.userData?.genesisDonor;
        if(donor&&Object.hasOwn(donor,"materialFamily")) {
          ancestorFamilies.push([donor,donor.materialFamily]); delete donor.materialFamily;
        }
      });
      const withoutAncestorInheritance=families(benchMeshes);
      ancestorFamilies.forEach(([donor,family])=>{donor.materialFamily=family;});
      check("KGR-3 primitive materials ⊗: removing ancestor family reds the unknown bench primitive",
        !sameFamilyBag(withoutAncestorInheritance,["wood","cloth","wood"])&&
        withoutAncestorInheritance.includes(null),JSON.stringify(withoutAncestorInheritance));
    } catch (error) {
      check("KGR-3 primitive materials: real normalized GLTFLoader fixture executes",false,error.stack||error.message);
    } finally {
      if(fixtureRun)rmSync(fixtureRun.scratch,{recursive:true,force:true});
    }
  }
  check("KGR-3: loaded piece metadata exposes frame/grid/bounds/source hash",
    ["sourceSha256", "normalizedFrame", "structuralGrid", "bounds", "qaStatus"].every((key) =>
      new RegExp(`${key}: entry\\.${key}`).test(donorSrc)), "one or more v2 metadata fields are not loaded");
  check("KGR-3 ⊗: runtime load hard-fails v2 source/recipe provenance mismatch",
    /loadedV2Metadata\.sourceSha256\s*!==\s*entry\.sourceSha256[\s\S]*?loadedV2Metadata\.recipeHash\s*!==\s*entry\.recipeHash[\s\S]*?throw new Error/.test(donorSrc),
    "v2 loaded-root/index provenance guard missing");
}

// ============================================================================
// 7. manifest registration
// ============================================================================
console.log("\n=== 7. manifest registration ===");
{
  const manifest = JSON.parse(readText("manifest.json"));
  const entry = manifest.modules.find((m) => m.id === "ui.theater-donor");
  check("manifest.json has a ui.theater-donor module entry", !!entry, "no entry found");
  if (entry) {
    check("ui.theater-donor is type:\"module\"", entry.type === "module", `type=${entry.type}`);
    check("ui.theater-donor path points at src/ui/theater-donor.js", entry.path === "src/ui/theater-donor.js", `path=${entry.path}`);
  }
  const html = readText("genesis.html");
  check("genesis.html has a <script type=\"module\" src=\"src/ui/theater-donor.js\"> tag",
    /<script\s+type="module"\s+src="src\/ui\/theater-donor\.js">/.test(html), "tag not found");

  try {
    const out = execFileSync("python3", ["build/check-manifest.py"], { cwd: ROOT, encoding: "utf-8" });
    check("python3 build/check-manifest.py exits clean with RESULT: OK", /RESULT:\s*OK/.test(out), out.slice(-400));
  } catch (e) {
    fail++;
    console.log("  ✗ check-manifest.py failed:", (e.stdout || e.message || "").toString().slice(-800));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
