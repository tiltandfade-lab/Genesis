#!/usr/bin/env node
/* KGR-4B gate for the real six-degree attachment API. The harness imports the production module
   after resolving the browser import-map's bare "three" specifier to the committed vendor build.
   It exercises hierarchy ownership, requested-parent conversion, opposed-z, every fail-closed
   class, and the normalized real Kenney gate-door vertex/hinge invariant. */
import * as THREE from "../vendor/three/three.module.js";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let pass = 0, fail = 0;
function ok(condition, message) {
  if (condition) { pass++; console.log("  ✓", message); }
  else { fail++; console.error("  ✗", message); }
}
function section(name) { console.log("\n[" + name + "]"); }

const scratch = mkdtempSync(join(tmpdir(), "genesis-attachment-"));
const attachmentSource = readFileSync(join(ROOT, "src/ui/theater-attachment.js"), "utf8")
  .replace('from "three"', `from ${JSON.stringify(pathToFileURL(join(ROOT, "vendor/three/three.module.js")).href)}`);
const attachmentPath = join(scratch, "theater-attachment.mjs");
writeFileSync(attachmentPath, attachmentSource);
const { socketFrameOf, mateMatrix, applyMate } = await import(pathToFileURL(attachmentPath).href);

const finiteMatrix = (m) => !!m && m.elements.every(Number.isFinite);
const near = (a, b, eps = 1e-8) => Math.abs(a - b) <= eps;
const vecNear = (a, b, eps = 1e-8) => a.distanceTo(b) <= eps;
const snapshot = (o) => ({
  parent: o.parent,
  position: o.position.toArray(),
  quaternion: o.quaternion.toArray(),
  scale: o.scale.toArray(),
  matrix: o.matrix.elements.slice(),
  matrixWorld: o.matrixWorld.elements.slice(),
});
const unchanged = (o, s) => o.parent === s.parent &&
  JSON.stringify(o.position.toArray()) === JSON.stringify(s.position) &&
  JSON.stringify(o.quaternion.toArray()) === JSON.stringify(s.quaternion) &&
  JSON.stringify(o.scale.toArray()) === JSON.stringify(s.scale) &&
  JSON.stringify(o.matrix.elements) === JSON.stringify(s.matrix) &&
  JSON.stringify(o.matrixWorld.elements) === JSON.stringify(s.matrixWorld);

function donorPiece(category) {
  const root = new THREE.Group();
  root.userData.genesisDonorPiece = { category };
  return root;
}
function addOwnedSocket(piece, id, { type = "hinge", mateRule = "coincident", mateFamily,
  position = [0, 0, 0], rotation = [0, 0, 0, 1], ownerPosition = [0, 0, 0],
  ownerRotationY = 0, ownerScale = 1 } = {}) {
  const a = new THREE.Group();
  a.position.set(0.37, -0.18, 0.42);
  a.rotation.set(0.21, -0.33, 0.14);
  a.scale.setScalar(1.35);
  const owner = new THREE.Group();
  owner.position.fromArray(ownerPosition);
  owner.rotation.y = ownerRotationY;
  owner.scale.setScalar(ownerScale);
  owner.userData.genesisDonor = { sockets: [{ id, type, mateRule, mateFamily, position, rotation }] };
  piece.add(a); a.add(owner);
  return owner;
}

section("nested owning-node frame + requested-parent conversion");
{
  const hostParent = new THREE.Group();
  hostParent.position.set(-3, 1.5, 2); hostParent.rotation.set(0.1, 0.7, -0.08); hostParent.scale.setScalar(1.2);
  const host = donorPiece("doorway-frame");
  host.position.set(1.1, -0.3, 0.8); host.rotation.set(-0.2, 0.4, 0.1); host.scale.setScalar(0.75);
  hostParent.add(host);
  const hostOwner = addOwnedSocket(host, "hinge", {
    mateFamily: "door-leaf", position: [0.24, 0.9, -0.12],
    rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0.48, -0.2)).toArray(),
    ownerPosition: [0.6, 0.4, -0.7], ownerRotationY: 0.63, ownerScale: 1.7,
  });
  const child = donorPiece("door-leaf");
  addOwnedSocket(child, "hinge", {
    mateFamily: "doorway-frame", position: [-0.15, 0.2, 0.31],
    rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.1, 0.2, 0.3)).toArray(),
    ownerPosition: [-0.5, 0.2, 0.9], ownerRotationY: -0.42, ownerScale: 0.65,
  });
  const targetParent = new THREE.Group();
  targetParent.position.set(4, -2, 1); targetParent.rotation.set(-0.15, -0.9, 0.2); targetParent.scale.setScalar(1.4);

  const frame = socketFrameOf(host, "hinge");
  ok(frame && finiteMatrix(frame.localMatrix), "socketFrameOf returns a finite full root-frame matrix");
  const localOnly = new THREE.Matrix4().compose(hostOwner.position, hostOwner.quaternion, hostOwner.scale)
    .multiply(new THREE.Matrix4().compose(
      new THREE.Vector3(0.24, 0.9, -0.12),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0.48, -0.2)),
      new THREE.Vector3(1, 1, 1),
    ));
  ok(frame && !frame.localMatrix.equals(localOnly), "RED control: owner-local-only math misses the translated/rotated/scaled ancestor");

  const result = mateMatrix(host, "hinge", child, "hinge");
  ok(result && result.positionError <= 1e-10 && result.angleError <= 1e-10,
    "exact mate formula reports negligible position and angle error");
  ok(applyMate(child, result, targetParent), "applyMate accepts the valid result");
  targetParent.updateMatrixWorld(true); child.updateMatrixWorld(true);
  const hostSocketWorld = new THREE.Matrix4().multiplyMatrices(
    (() => { hostParent.updateMatrixWorld(true); return host.matrixWorld; })(), socketFrameOf(host, "hinge").localMatrix,
  );
  const childSocketWorld = new THREE.Matrix4().multiplyMatrices(child.matrixWorld, socketFrameOf(child, "hinge").localMatrix);
  ok(vecNear(new THREE.Vector3().setFromMatrixPosition(hostSocketWorld), new THREE.Vector3().setFromMatrixPosition(childSocketWorld), 1e-7),
    "requested-parent local conversion lands the child socket at the host socket in world space");
}

section("opposed-z local-Y flip");
{
  const host = donorPiece("wall-detail");
  const child = donorPiece("wall-detail");
  addOwnedSocket(host, "mount", { type: "wall-mount", mateRule: "opposed-z", mateFamily: "wall-detail" });
  addOwnedSocket(child, "mount", { type: "wall-mount", mateRule: "opposed-z", mateFamily: "wall-detail" });
  const result = mateMatrix(host, "mount", child, "mount");
  ok(!!result && applyMate(child, result, null), "opposed-z mate computes and applies");
  const hz = new THREE.Vector3(0, 0, 1).transformDirection(socketFrameOf(host, "mount").localMatrix);
  const childWorldSocket = result.matrixWorld.clone().multiply(socketFrameOf(child, "mount").localMatrix);
  const cz = new THREE.Vector3(0, 0, 1).transformDirection(childWorldSocket);
  ok(hz.dot(cz) < -0.999999, "opposed-z inserts the required local-Y half turn (normals face each other)");
}

section("fail-closed + no-mutation controls");
{
  const host = donorPiece("doorway-frame");
  addOwnedSocket(host, "hinge", { mateFamily: "door-leaf" });
  const child = donorPiece("door-leaf");
  addOwnedSocket(child, "other", { type: "floor-mount", mateFamily: "doorway-frame" });
  const hs = snapshot(host), cs = snapshot(child);
  ok(mateMatrix(host, "missing", child, "other") === null, "missing socket returns null");
  ok(unchanged(host, hs) && unchanged(child, cs), "missing-socket rejection mutates neither object nor cached matrices");
  ok(mateMatrix(host, "hinge", child, "other") === null, "incompatible socket type returns null");
  ok(unchanged(host, hs) && unchanged(child, cs), "incompatible rejection mutates neither object");

  const duplicate = donorPiece("door-leaf");
  addOwnedSocket(duplicate, "dup", { mateFamily: "doorway-frame" });
  addOwnedSocket(duplicate, "dup", { mateFamily: "doorway-frame" });
  ok(socketFrameOf(duplicate, "dup") === null, "duplicate socket id is rejected");

  const singular = donorPiece("door-leaf");
  const singularOwner = addOwnedSocket(singular, "hinge", { mateFamily: "doorway-frame" });
  singularOwner.scale.set(0, 1, 1);
  ok(socketFrameOf(singular, "hinge") === null, "singular owning-node frame is rejected");

  const nonfinite = donorPiece("door-leaf");
  nonfinite.userData.sockets = [{ id: "hinge", type: "hinge", mateRule: "coincident",
    mateFamily: "doorway-frame", position: [Infinity, 0, 0], rotation: [0, 0, 0, 1] }];
  ok(socketFrameOf(nonfinite, "hinge") === null, "non-finite socket frame is rejected");

  const applyTarget = new THREE.Group();
  applyTarget.position.set(7, 8, 9);
  const before = snapshot(applyTarget);
  const badResult = { matrixWorld: new THREE.Matrix4() };
  badResult.matrixWorld.elements[5] = NaN;
  ok(applyMate(applyTarget, badResult, host) === false, "applyMate rejects a non-finite result");
  ok(unchanged(applyTarget, before), "failed applyMate performs no mutation");
}

// Minimal GLB reader for the committed normalized real gate. It preserves the authored node TRS and
// reads the actual POSITION accessor for the detachable leaf.
function readGlb(path) {
  const file = readFileSync(path);
  let offset = 12, gltf = null, bin = null;
  while (offset < file.length) {
    const length = file.readUInt32LE(offset), type = file.readUInt32LE(offset + 4);
    const chunk = file.subarray(offset + 8, offset + 8 + length); offset += 8 + length;
    if (type === 0x4e4f534a) gltf = JSON.parse(chunk.toString("utf8"));
    if (type === 0x004e4942) bin = chunk;
  }
  return { gltf, bin };
}
function nodeLocal(node, object) {
  if (node.matrix) { object.matrix.fromArray(node.matrix); object.matrixAutoUpdate = false; }
  else {
    if (node.translation) object.position.fromArray(node.translation);
    if (node.rotation) object.quaternion.fromArray(node.rotation);
    if (node.scale) object.scale.fromArray(node.scale);
  }
}
function positionGeometry(gltf, bin, meshIndex) {
  const primitive = gltf.meshes[meshIndex].primitives[0];
  const accessor = gltf.accessors[primitive.attributes.POSITION];
  const view = gltf.bufferViews[accessor.bufferView];
  const componentBytes = 4;
  const stride = view.byteStride || componentBytes * 3;
  const base = (view.byteOffset || 0) + (accessor.byteOffset || 0);
  const values = new Float32Array(accessor.count * 3);
  for (let i = 0; i < accessor.count; i++) for (let c = 0; c < 3; c++) {
    values[i * 3 + c] = bin.readFloatLE(base + i * stride + c * componentBytes);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(values, 3));
  return geometry;
}
function realGatePiece() {
  const index = JSON.parse(readFileSync(join(ROOT, "assets/models-normalized/kenney-modular-dungeon-kit/index.json"), "utf8"));
  const path = join(ROOT, "assets/models-normalized/kenney-modular-dungeon-kit", index.assets["gate-door"].file);
  const { gltf, bin } = readGlb(path);
  const objects = gltf.nodes.map((node) => {
    const isLeaf = node.extras?.genesisDonor?.semanticPart === "door-leaf";
    const object = isLeaf && node.mesh != null
      ? new THREE.Mesh(positionGeometry(gltf, bin, node.mesh), new THREE.MeshBasicMaterial())
      : new THREE.Group();
    object.name = node.name || ""; object.userData = node.extras || {}; nodeLocal(node, object);
    return object;
  });
  gltf.nodes.forEach((node, i) => (node.children || []).forEach((child) => objects[i].add(objects[child])));
  const piece = donorPiece("doorway-frame");
  (gltf.scenes[gltf.scene || 0].nodes || []).forEach((i) => piece.add(objects[i]));
  const leaf = objects.find((object) => object.userData?.genesisDonor?.semanticPart === "door-leaf");
  return { piece, leaf };
}
function worldVertices(mesh) {
  mesh.updateWorldMatrix(true, false);
  const position = mesh.geometry.getAttribute("position"), out = [];
  for (let i = 0; i < position.count; i++) out.push(new THREE.Vector3().fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld));
  return out;
}

section("real normalized Kenney gate closed bounds + fixed hinge");
{
  const { piece, leaf: authoredLeaf } = realGatePiece();
  const canonicalParent = new THREE.Group();
  canonicalParent.position.set(2.5, 0.75, -1.5); canonicalParent.rotation.y = Math.PI / 2;
  canonicalParent.add(piece); canonicalParent.updateMatrixWorld(true);
  const authoredVertices = worldVertices(authoredLeaf);
  const hingeFrame = socketFrameOf(piece, "hinge-left");
  piece.updateMatrixWorld(true); authoredLeaf.updateWorldMatrix(true, false);
  const leafToPiece = piece.matrixWorld.clone().invert().multiply(authoredLeaf.matrixWorld);
  const geometry = authoredLeaf.geometry.clone();
  geometry.applyMatrix4(leafToPiece).applyMatrix4(hingeFrame.localMatrix.clone().invert());
  authoredLeaf.parent.remove(authoredLeaf);

  const leafPiece = donorPiece("door-leaf");
  leafPiece.userData.sockets = [{ id: "hinge-left", type: "hinge", mateRule: "coincident",
    mateFamily: "doorway-frame", position: [0, 0, 0], rotation: [0, 0, 0, 1] }];
  const swingLeaf = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial()); leafPiece.add(swingLeaf);
  const result = mateMatrix(piece, "hinge-left", leafPiece, "hinge-left");
  ok(result && applyMate(leafPiece, result, canonicalParent), "real gate leaf mates through the production solver");
  const closedVertices = worldVertices(swingLeaf);
  let maxDelta = 0;
  for (let i = 0; i < authoredVertices.length; i++) maxDelta = Math.max(maxDelta, authoredVertices[i].distanceTo(closedVertices[i]));
  ok(maxDelta <= 1e-5, `real gate closed pre/post vertex positions agree within 1e-5 (max ${maxDelta})`);
  const hingeClosed = new THREE.Vector3(); leafPiece.getWorldPosition(hingeClosed);
  swingLeaf.rotation.y = 22 * Math.PI / 180; canonicalParent.updateMatrixWorld(true);
  const hingeAjar = new THREE.Vector3(); leafPiece.getWorldPosition(hingeAjar);
  swingLeaf.rotation.y = 105 * Math.PI / 180; canonicalParent.updateMatrixWorld(true);
  const hingeOpen = new THREE.Vector3(); leafPiece.getWorldPosition(hingeOpen);
  ok(vecNear(hingeClosed, hingeAjar, 1e-10) && vecNear(hingeClosed, hingeOpen, 1e-10),
    "ajar/open add only leaf-local swing; the mated real hinge stays fixed");
}

section("import-only manifest mutation gates");
{
  const manifestPath = join(ROOT, "manifest.json");
  const bootPath = join(ROOT, "src/ui/theater-boot.js");
  const htmlPath = join(ROOT, "genesis.html");
  const originals = {
    manifest: readFileSync(manifestPath, "utf8"),
    boot: readFileSync(bootPath, "utf8"),
    html: readFileSync(htmlPath, "utf8"),
  };
  function manifestRunFails(fragment) {
    try {
      execFileSync("python3", ["build/check-manifest.py"], { cwd: ROOT, encoding: "utf8", stdio: "pipe" });
      return false;
    } catch (error) {
      const output = String(error.stdout || "") + String(error.stderr || "");
      return output.includes(fragment);
    }
  }
  try {
    const parsed = JSON.parse(originals.manifest);
    const attachment = parsed.modules.find((module) => module.id === "ui.theater-attachment");
    delete attachment.importedBy;
    writeFileSync(manifestPath, JSON.stringify(parsed, null, 2) + "\n");
    ok(manifestRunFails("has NO <script type=\"module\"> tag"),
      "RED mutation: removing importedBy makes the import-only module fail manifest validation");

    writeFileSync(manifestPath, originals.manifest);
    writeFileSync(bootPath, originals.boot.replace(
      'import { socketFrameOf, mateMatrix, applyMate } from "./theater-attachment.js";\n', "",
    ));
    ok(manifestRunFails("lacks static import ./theater-attachment.js"),
      "RED mutation: removing the static theater-boot import fails manifest validation");

    writeFileSync(bootPath, originals.boot);
    writeFileSync(htmlPath, originals.html.replace(
      '<script type="module" src="src/ui/theater-boot.js"></script>',
      '<script type="module" src="src/ui/theater-attachment.js"></script>\n<script type="module" src="src/ui/theater-boot.js"></script>',
    ));
    ok(manifestRunFails("imported-only module also has a direct"),
      "RED mutation: adding a direct attachment script tag fails the import-only contract");
  } finally {
    writeFileSync(manifestPath, originals.manifest);
    writeFileSync(bootPath, originals.boot);
    writeFileSync(htmlPath, originals.html);
  }
}

rmSync(scratch, { recursive: true, force: true });
console.log(`\nKGR-4B attachment: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
