#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const here = path.dirname(new URL(import.meta.url).pathname);
const config = JSON.parse(fs.readFileSync(path.join(here, "toolchain.json"), "utf8"));
const root = process.env.GRAPHICS_RESEARCH_HOME || config.installRootDefault;
const req = createRequire(path.join(root, "package.json"));
const result = { root, node: process.version, packages: {}, probes: {}, pass: true };

function packageJson(name) {
  let cursor = path.dirname(req.resolve(name));
  while (cursor !== path.dirname(cursor)) {
    const candidate = path.join(cursor, "package.json");
    if (fs.existsSync(candidate)) return JSON.parse(fs.readFileSync(candidate, "utf8"));
    cursor = path.dirname(cursor);
  }
  throw new Error(`package.json not found for ${name}`);
}

async function load(name) {
  return import(pathToFileURL(req.resolve(name)).href);
}

for (const [name, expected] of Object.entries(config.packages)) {
  try {
    const pkg = packageJson(name);
    await load(name);
    const exact = pkg.version === expected;
    result.packages[name] = { expected, actual: pkg.version, exact, imported: true };
    if (!exact) result.pass = false;
  } catch (error) {
    result.packages[name] = { expected, imported: false, error: error.message };
    result.pass = false;
  }
}

try {
  const THREE = await load("three");
  const { PathTracingSceneGenerator } = await load("three-gpu-pathtracer");
  const ordinaryScene = new THREE.Scene();
  ordinaryScene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()));
  const ordinary = new PathTracingSceneGenerator(ordinaryScene).generate();

  const instancedScene = new THREE.Scene();
  const instances = new THREE.InstancedMesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial(), 2);
  instances.setMatrixAt(0, new THREE.Matrix4());
  instances.setMatrixAt(1, new THREE.Matrix4().makeTranslation(2, 0, 0));
  instancedScene.add(instances);
  const instanced = new PathTracingSceneGenerator(instancedScene).generate();
  const ordinaryVertices = ordinary.geometry.attributes.position.count;
  const instancedVertices = instanced.geometry.attributes.position.count;
  result.probes.pathTracer = {
    threeRevision: THREE.REVISION,
    ordinaryVertices,
    twoInstanceVertices: instancedVertices,
    importsAtR166: true,
    instancingPreserved: instancedVertices >= ordinaryVertices * 2,
    ruling: instancedVertices >= ordinaryVertices * 2 ? "eligible" : "offline adapter must expand instances"
  };
} catch (error) {
  result.probes.pathTracer = { importsAtR166: false, error: error.stack || error.message };
  result.pass = false;
}

try {
  const atlas = await load("xatlas-three");
  result.probes.xatlas = {
    importableInNode: typeof atlas.UVUnwrapper === "function",
    ruling: "build-time browser/worker spike only; indexed geometry required"
  };
} catch (error) {
  result.probes.xatlas = { importableInNode: false, error: error.message };
}

console.log(JSON.stringify(result, null, 2));
process.exitCode = result.pass ? 0 : 1;
