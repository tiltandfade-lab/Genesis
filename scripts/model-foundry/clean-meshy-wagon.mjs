#!/usr/bin/env node
/*
  Replace Meshy's fused wagon-wheel geometry with one clean, reusable low-poly wheel mesh.

  Usage:
    node scripts/model-foundry/clean-meshy-wagon.mjs input.glb output.glb

  The source GLB is never modified. The output contains:
    - one filtered chassis mesh;
    - one clean wheel mesh instanced by four named wheel nodes.
*/
import fs from "node:fs";
import path from "node:path";

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error("Usage: node clean-meshy-wagon.mjs input.glb output.glb");
  process.exit(1);
}

function parseGlb(filePath) {
  const file = fs.readFileSync(filePath);
  if (file.readUInt32LE(0) !== 0x46546c67 || file.readUInt32LE(4) !== 2) {
    throw new Error("Expected a GLB 2.0 file.");
  }
  let offset = 12, gltf = null, bin = null;
  while (offset < file.length) {
    const length = file.readUInt32LE(offset), type = file.readUInt32LE(offset + 4);
    const chunk = file.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4e4f534a) gltf = JSON.parse(chunk.toString("utf8").replace(/\0+$/, ""));
    if (type === 0x004e4942) bin = chunk;
    offset += 8 + length;
  }
  if (!gltf || !bin) throw new Error("GLB is missing its JSON or binary chunk.");
  return {gltf, bin};
}

function readAccessor(gltf, bin, index) {
  const accessor = gltf.accessors[index], view = gltf.bufferViews[accessor.bufferView];
  const components = {SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[accessor.type];
  const byteSize = {5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}[accessor.componentType];
  const readers = {
    5120:"readInt8", 5121:"readUInt8", 5122:"readInt16LE",
    5123:"readUInt16LE", 5125:"readUInt32LE", 5126:"readFloatLE"
  };
  const start = (view.byteOffset || 0) + (accessor.byteOffset || 0);
  const stride = view.byteStride || components * byteSize;
  const output = [];
  for (let row = 0; row < accessor.count; row++) {
    const values = [];
    for (let column = 0; column < components; column++) {
      values.push(bin[readers[accessor.componentType]](start + row * stride + column * byteSize));
    }
    output.push(components === 1 ? values[0] : values);
  }
  return output;
}

function connectedComponents(vertexCount, indices) {
  const parent = Array.from({length:vertexCount}, (_, index) => index);
  const rank = new Uint8Array(vertexCount);
  const find = value => {
    while (parent[value] !== value) {
      parent[value] = parent[parent[value]];
      value = parent[value];
    }
    return value;
  };
  const union = (a, b) => {
    a = find(a); b = find(b);
    if (a === b) return;
    if (rank[a] < rank[b]) [a, b] = [b, a];
    parent[b] = a;
    if (rank[a] === rank[b]) rank[a]++;
  };
  for (let index = 0; index < indices.length; index += 3) {
    union(indices[index], indices[index + 1]);
    union(indices[index + 1], indices[index + 2]);
  }
  const components = new Map();
  for (let vertex = 0; vertex < vertexCount; vertex++) {
    const root = find(vertex);
    if (!components.has(root)) components.set(root, {vertices:[], faces:[]});
    components.get(root).vertices.push(vertex);
  }
  for (let face = 0; face < indices.length / 3; face++) {
    components.get(find(indices[face * 3])).faces.push(face);
  }
  return [...components.values()];
}

function boundsFor(vertices, positions) {
  const min = [Infinity,Infinity,Infinity], max = [-Infinity,-Infinity,-Infinity];
  for (const vertex of vertices) for (let axis = 0; axis < 3; axis++) {
    min[axis] = Math.min(min[axis], positions[vertex][axis]);
    max[axis] = Math.max(max[axis], positions[vertex][axis]);
  }
  return {
    min, max,
    center:min.map((value, axis) => (value + max[axis]) / 2),
    size:min.map((value, axis) => max[axis] - value)
  };
}

function filteredChassis(positions, indices, removedComponents) {
  const removedFaces = new Set(removedComponents.flatMap(component => component.faces));
  const keptIndices = [];
  for (let face = 0; face < indices.length / 3; face++) {
    if (!removedFaces.has(face)) keptIndices.push(...indices.slice(face * 3, face * 3 + 3));
  }
  const used = [...new Set(keptIndices)].sort((a,b) => a-b);
  const remap = new Map(used.map((oldIndex, newIndex) => [oldIndex, newIndex]));
  return {
    positions:used.map(index => positions[index]),
    indices:keptIndices.map(index => remap.get(index))
  };
}

function cleanWheel(radius, halfDepth) {
  const positions = [], indices = [];
  const addVertex = point => (positions.push(point), positions.length - 1);
  const quad = (a,b,c,d) => indices.push(a,b,c, a,c,d);
  const box = (centerRadius, length, width, depth, angle) => {
    const radial = [Math.cos(angle), Math.sin(angle)], tangent = [-radial[1], radial[0]];
    const base = positions.length;
    for (const z of [-depth/2, depth/2]) for (const along of [-length/2, length/2]) for (const across of [-width/2, width/2]) {
      positions.push([
        radial[0] * (centerRadius + along) + tangent[0] * across,
        radial[1] * (centerRadius + along) + tangent[1] * across,
        z
      ]);
    }
    const v = n => base + n;
    quad(v(0),v(2),v(3),v(1)); quad(v(4),v(5),v(7),v(6));
    quad(v(0),v(1),v(5),v(4)); quad(v(2),v(6),v(7),v(3));
    quad(v(0),v(4),v(6),v(2)); quad(v(1),v(3),v(7),v(5));
  };
  const ringSegments = 16, innerRadius = radius * .77;
  const ring = [];
  for (let segment = 0; segment < ringSegments; segment++) {
    const angle = segment / ringSegments * Math.PI * 2, c = Math.cos(angle), s = Math.sin(angle);
    ring.push({
      outerBack:addVertex([c*radius,s*radius,-halfDepth]),
      outerFront:addVertex([c*radius,s*radius,halfDepth]),
      innerBack:addVertex([c*innerRadius,s*innerRadius,-halfDepth]),
      innerFront:addVertex([c*innerRadius,s*innerRadius,halfDepth])
    });
  }
  for (let segment = 0; segment < ringSegments; segment++) {
    const a = ring[segment], b = ring[(segment + 1) % ringSegments];
    quad(a.outerBack,b.outerBack,b.outerFront,a.outerFront);
    quad(a.innerFront,b.innerFront,b.innerBack,a.innerBack);
    quad(a.outerFront,b.outerFront,b.innerFront,a.innerFront);
    quad(a.innerBack,b.innerBack,b.outerBack,a.outerBack);
  }
  const hubRadius = radius * .20, hubHalfDepth = halfDepth * 1.35, hubSegments = 12;
  const hubBackCenter = addVertex([0,0,-hubHalfDepth]), hubFrontCenter = addVertex([0,0,hubHalfDepth]);
  const hub = [];
  for (let segment = 0; segment < hubSegments; segment++) {
    const angle = segment / hubSegments * Math.PI * 2;
    hub.push({
      back:addVertex([Math.cos(angle)*hubRadius,Math.sin(angle)*hubRadius,-hubHalfDepth]),
      front:addVertex([Math.cos(angle)*hubRadius,Math.sin(angle)*hubRadius,hubHalfDepth])
    });
  }
  for (let segment = 0; segment < hubSegments; segment++) {
    const a = hub[segment], b = hub[(segment + 1) % hubSegments];
    quad(a.back,b.back,b.front,a.front);
    indices.push(hubBackCenter,b.back,a.back, hubFrontCenter,a.front,b.front);
  }
  const spokeStart = hubRadius * .82, spokeEnd = innerRadius * 1.03;
  for (let spoke = 0; spoke < 8; spoke++) {
    box((spokeStart + spokeEnd) / 2, spokeEnd - spokeStart, radius * .105, halfDepth * 1.15, spoke / 8 * Math.PI * 2);
  }
  return {positions, indices};
}

function minMax(positions) {
  const min = [Infinity,Infinity,Infinity], max = [-Infinity,-Infinity,-Infinity];
  for (const point of positions) for (let axis = 0; axis < 3; axis++) {
    min[axis] = Math.min(min[axis], point[axis]); max[axis] = Math.max(max[axis], point[axis]);
  }
  return {min,max};
}

function encodeGlb(chassis, wheel, wheelCenters, report) {
  const chunks = [], bufferViews = [], accessors = [];
  let byteOffset = 0;
  const append = (buffer, target) => {
    const padding = (4 - byteOffset % 4) % 4;
    if (padding) { chunks.push(Buffer.alloc(padding)); byteOffset += padding; }
    const index = bufferViews.length;
    bufferViews.push({buffer:0,byteOffset,byteLength:buffer.length,target});
    chunks.push(buffer); byteOffset += buffer.length;
    return index;
  };
  const positionAccessor = positions => {
    const flat = new Float32Array(positions.flat());
    const buffer = Buffer.from(flat.buffer, flat.byteOffset, flat.byteLength);
    const {min,max} = minMax(positions), bufferView = append(buffer, 34962);
    return accessors.push({bufferView,componentType:5126,count:positions.length,type:"VEC3",min,max}) - 1;
  };
  const indexAccessor = indices => {
    const flat = new Uint16Array(indices);
    const buffer = Buffer.from(flat.buffer, flat.byteOffset, flat.byteLength);
    const bufferView = append(buffer, 34963);
    return accessors.push({bufferView,componentType:5123,count:indices.length,type:"SCALAR",min:[Math.min(...indices)],max:[Math.max(...indices)]}) - 1;
  };
  const chassisPosition = positionAccessor(chassis.positions), chassisIndex = indexAccessor(chassis.indices);
  const wheelPosition = positionAccessor(wheel.positions), wheelIndex = indexAccessor(wheel.indices);
  const names = ["front_left","front_right","rear_left","rear_right"];
  const nodes = [
    {name:"wagon_chassis",mesh:0},
    ...wheelCenters.map((center,index) => ({name:`wheel_${names[index]}`,mesh:1,translation:center}))
  ];
  const gltf = {
    asset:{version:"2.0",generator:"Genesis Meshy wagon cleanup"},
    scene:0,
    scenes:[{name:"M019-A clean modular wagon",nodes:nodes.map((_,index)=>index)}],
    nodes,
    meshes:[
      {name:"wagon_chassis",primitives:[{attributes:{POSITION:chassisPosition},indices:chassisIndex}]},
      {name:"clean_low_poly_wheel",primitives:[{attributes:{POSITION:wheelPosition},indices:wheelIndex}]}
    ],
    accessors, bufferViews, buffers:[{byteLength:byteOffset}],
    extras:{genesisCleanup:report}
  };
  let json = Buffer.from(JSON.stringify(gltf));
  json = Buffer.concat([json, Buffer.alloc((4-json.length%4)%4, 0x20)]);
  let binary = Buffer.concat(chunks);
  binary = Buffer.concat([binary, Buffer.alloc((4-binary.length%4)%4)]);
  gltf.buffers[0].byteLength = binary.length;
  json = Buffer.from(JSON.stringify(gltf));
  json = Buffer.concat([json, Buffer.alloc((4-json.length%4)%4, 0x20)]);
  const header = Buffer.alloc(12), jsonHeader = Buffer.alloc(8), binHeader = Buffer.alloc(8);
  header.writeUInt32LE(0x46546c67,0); header.writeUInt32LE(2,4);
  header.writeUInt32LE(12+8+json.length+8+binary.length,8);
  jsonHeader.writeUInt32LE(json.length,0); jsonHeader.writeUInt32LE(0x4e4f534a,4);
  binHeader.writeUInt32LE(binary.length,0); binHeader.writeUInt32LE(0x004e4942,4);
  return Buffer.concat([header,jsonHeader,json,binHeader,binary]);
}

const {gltf, bin} = parseGlb(inputPath);
const sourcePrimitive = gltf.meshes[gltf.nodes[gltf.scenes[gltf.scene || 0].nodes[0]].mesh].primitives[0];
const positions = readAccessor(gltf, bin, sourcePrimitive.attributes.POSITION);
const indices = readAccessor(gltf, bin, sourcePrimitive.indices);
const components = connectedComponents(positions.length, indices);
const measured = components.map(component => ({...component, bounds:boundsFor(component.vertices, positions)}));
const wheelBodies = measured
  .filter(component => component.faces.length >= 150 && component.bounds.size[0] > .16 && component.bounds.size[1] > .16 && component.bounds.size[2] < .06)
  .sort((a,b) => a.bounds.center[0]-b.bounds.center[0] || b.bounds.center[2]-a.bounds.center[2]);
if (wheelBodies.length !== 4) throw new Error(`Expected four primary wheel islands; found ${wheelBodies.length}.`);
const wheelCenters = wheelBodies.map(component => component.bounds.center);
const removed = measured.filter(component => wheelCenters.some(center => component.vertices.every(vertex => {
  const point = positions[vertex];
  return Math.abs(point[0]-center[0]) < .115 && Math.abs(point[1]-center[1]) < .115 && Math.abs(point[2]-center[2]) < .052;
})));
const chassis = filteredChassis(positions, indices, removed);
const averageRadius = wheelBodies.reduce((sum, component) => sum + Math.max(component.bounds.size[0],component.bounds.size[1])/2,0)/4;
const averageHalfDepth = wheelBodies.reduce((sum, component) => sum + component.bounds.size[2]/2,0)/4;
const wheel = cleanWheel(averageRadius, averageHalfDepth);
const report = {
  source:path.basename(inputPath),
  sourceTriangles:indices.length/3,
  disconnectedSourceIslands:components.length,
  removedWheelIslands:removed.length,
  removedWheelTriangles:removed.reduce((sum, component)=>sum+component.faces.length,0),
  outputChassisTriangles:chassis.indices.length/3,
  reusableWheelTriangles:wheel.indices.length/3,
  outputSceneTriangles:chassis.indices.length/3 + wheel.indices.length/3 * 4
};
fs.mkdirSync(path.dirname(outputPath), {recursive:true});
fs.writeFileSync(outputPath, encodeGlb(chassis,wheel,wheelCenters,report));
console.log(JSON.stringify({...report,output:outputPath,wheelCenters},null,2));
