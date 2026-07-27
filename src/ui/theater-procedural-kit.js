/* GENESIS MODULE — src/ui/theater-procedural-kit.js
   Engine-owned reusable geometry for parts that are cheaper, clearer, and more adaptable when
   generated locally than when purchased as one-off donor models.

   World convention: +Y is up and one world unit is one 5-foot tactical cell. Every returned group
   carries semantic material channels, sockets, deterministic provenance, and optional tick hooks.
   Imported donors may consume these parts, but never own their mechanics or state.
*/
import * as THREE from "three";
import {
  donorMaterialContextFromText,
  donorMaterialForFamily,
} from "./theater-donor.js";

export const PROCEDURAL_PART_KINDS = Object.freeze([
  "wheel", "axle", "handle", "crank", "hinge", "latch", "hook", "bracket", "spike", "foot",
  "pulley", "bearing-block", "clamp", "collar", "coupler", "eyelet", "cleat", "pin", "rung", "cap",
  "gear", "sprocket", "ratchet", "pawl", "winch-drum", "spool", "roller", "chain-guide", "fairlead", "shackle",
  "swivel", "tensioner", "buckle", "strap-loop", "corner-plate", "gusset", "anchor-plate", "wedge", "runner", "socket-cup",
]);
export const PROCEDURAL_PATH_KINDS = Object.freeze(["rope", "chain"]);
export const PROCEDURAL_FX_KINDS = Object.freeze(["flame", "ember", "magic", "smoke"]);
export const PROCEDURAL_SURFACE_KINDS = Object.freeze(["sign", "paper", "banner", "decal"]);
export const PROCEDURAL_CONTAINER_KINDS = Object.freeze(["crate", "barrel", "sack", "jar", "basket"]);
export const PROCEDURAL_STATES = Object.freeze([
  "intact", "repaired", "damaged", "breached", "open", "closed", "occupied", "abandoned",
]);
export const PROCEDURAL_CONDITIONS = Object.freeze(["intact", "repaired", "damaged", "breached", "abandoned"]);
export const PROCEDURAL_ACCESS_STATES = Object.freeze(["neutral", "open", "closed"]);
export const PROCEDURAL_OCCUPANCY_STATES = Object.freeze(["vacant", "occupied"]);
export const PROCEDURAL_CHANNELS = Object.freeze([
  "structurePrimary", "structureSecondary", "masonry", "metal", "cloth", "paper", "cargo", "repair", "growth", "emission",
]);
export const PROCEDURAL_PART_CATALOG = Object.freeze({
  wheel: { uses: ["mobility", "cart", "mill", "power-transfer"] },
  axle: { uses: ["mobility", "cart", "shaft", "power-transfer"] },
  handle: { uses: ["hand-control", "door", "container"] },
  crank: { uses: ["hand-control", "hoist", "winch", "power-transfer"] },
  hinge: { uses: ["pivot", "door", "gate", "container"] },
  latch: { uses: ["closure", "door", "gate", "container"] },
  hook: { uses: ["suspension", "cargo", "hoist", "rope-routing"] },
  bracket: { uses: ["support", "wall-mount", "repair", "reinforcement"] },
  spike: { uses: ["defense", "ground-anchor", "hazard"] },
  foot: { uses: ["ground-contact", "support", "stabilization"] },
  pulley: { uses: ["hoist", "rope-routing", "power-transfer"] },
  "bearing-block": { uses: ["shaft", "support", "power-transfer"] },
  clamp: { uses: ["temporary-fastener", "repair", "workbench"] },
  collar: { uses: ["shaft", "retainer", "power-transfer"] },
  coupler: { uses: ["shaft", "join", "power-transfer"] },
  eyelet: { uses: ["rope-routing", "anchor", "suspension"] },
  cleat: { uses: ["rope-routing", "tension", "anchor"] },
  pin: { uses: ["retainer", "pivot", "quick-release"] },
  rung: { uses: ["ladder", "climb", "handhold"] },
  cap: { uses: ["post", "weatherproofing", "finish"] },
  gear: { uses: ["power-transfer", "machine", "clockwork"] },
  sprocket: { uses: ["power-transfer", "chain-routing", "machine"] },
  ratchet: { uses: ["one-way-motion", "hoist", "winch", "power-transfer"] },
  pawl: { uses: ["one-way-motion", "hoist", "winch", "brake"] },
  "winch-drum": { uses: ["hoist", "winch", "rope-routing", "cargo"] },
  spool: { uses: ["rope-storage", "wire-storage", "workbench"] },
  roller: { uses: ["guide", "cargo", "gate", "power-transfer"] },
  "chain-guide": { uses: ["chain-routing", "guide", "power-transfer"] },
  fairlead: { uses: ["rope-routing", "guide", "winch"] },
  shackle: { uses: ["join", "cargo", "chain-routing", "suspension"] },
  swivel: { uses: ["join", "rotation", "suspension", "chain-routing"] },
  tensioner: { uses: ["tension", "reinforcement", "rope-routing", "chain-routing"] },
  buckle: { uses: ["strap", "closure", "cargo"] },
  "strap-loop": { uses: ["strap", "anchor", "cargo"] },
  "corner-plate": { uses: ["reinforcement", "repair", "corner"] },
  gusset: { uses: ["reinforcement", "support", "repair"] },
  "anchor-plate": { uses: ["anchor", "wall-mount", "suspension"] },
  wedge: { uses: ["temporary-fastener", "leveling", "split", "door"] },
  runner: { uses: ["ground-contact", "sled", "cargo", "mobility"] },
  "socket-cup": { uses: ["post", "ground-contact", "support", "modular-mount"] },
});

const CHANNEL_FAMILY = Object.freeze({
  structurePrimary: "wood",
  structureSecondary: "wood",
  masonry: "stone",
  metal: "iron",
  cloth: "cloth",
  paper: "cloth",
  cargo: "wood",
  repair: "iron",
  growth: "cloth",
});
const EPS = 1e-5;

function hashString(value) {
  let hash = 2166136261 >>> 0;
  const text = String(value || "");
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function seededUnit(seed, index) {
  let value = (hashString(seed) + Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x21f0aaad);
  value ^= value >>> 15;
  value = Math.imul(value, 0x735a2d97);
  value ^= value >>> 15;
  return (value >>> 0) / 4294967296;
}
function vector(value, fallback) {
  if (value && value.isVector3) return value.clone();
  if (Array.isArray(value)) return new THREE.Vector3(value[0] || 0, value[1] || 0, value[2] || 0);
  if (value && typeof value === "object") return new THREE.Vector3(value.x || 0, value.y || 0, value.z || 0);
  return fallback ? fallback.clone() : new THREE.Vector3();
}
function optsFor(options) {
  const opts = Object.assign({
    seedKey: "procedural-kit",
    realmId: "fantasy",
    realmProfile: null,
    contextText: "",
    materialContext: null,
    materialProof: false,
  }, options || {});
  opts.materialContextResolved = donorMaterialContextFromText(opts.contextText, opts.materialContext);
  return opts;
}
function materialFor(channel, options, suffix) {
  const opts = options.materialContextResolved ? options : optsFor(options);
  if (channel === "emission") {
    const color = opts.emissionColor == null ? 0xff8a32 : opts.emissionColor;
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: opts.emissionIntensity == null ? 2.4 : opts.emissionIntensity,
      roughness: 0.42,
      metalness: 0,
      transparent: !!opts.transparent,
      opacity: opts.opacity == null ? 1 : opts.opacity,
      depthWrite: opts.depthWrite !== false,
      side: THREE.DoubleSide,
    });
  }
  if (channel === "growth") {
    return new THREE.MeshStandardMaterial({
      color: opts.growthColor == null ? 0x65704a : opts.growthColor,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    });
  }
  const family = CHANNEL_FAMILY[channel] || "wood";
  return donorMaterialForFamily(
    family,
    `${opts.seedKey}:${channel}:${suffix || "part"}`,
    opts.realmProfile,
    opts.materialContextResolved,
    `${opts.seedKey}:${family}:${suffix || "part"}`,
    !!opts.materialProof,
  );
}
function rememberBase(node) {
  node.userData.proceduralBase = {
    position: node.position.toArray(),
    rotation: [node.rotation.x, node.rotation.y, node.rotation.z],
    scale: node.scale.toArray(),
    visible: node.visible,
  };
}
function taggedMesh(group, geometry, channel, options, name, stateRole) {
  const mesh = new THREE.Mesh(geometry, materialFor(channel, options, name));
  mesh.name = name;
  mesh.castShadow = channel !== "emission";
  mesh.receiveShadow = channel !== "emission";
  mesh.userData.genesisProcedural = { channel, stateRole: stateRole || null };
  rememberBase(mesh);
  group.add(mesh);
  return mesh;
}
function box(group, size, position, channel, options, name, rotation, stateRole) {
  const mesh = taggedMesh(
    group,
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    channel,
    options,
    name,
    stateRole,
  );
  mesh.position.copy(vector(position));
  if (rotation) mesh.rotation.set(rotation[0] || 0, rotation[1] || 0, rotation[2] || 0);
  rememberBase(mesh);
  return mesh;
}
function cylinder(group, radius, length, position, channel, options, name, axis, sides, stateRole) {
  const mesh = taggedMesh(
    group,
    new THREE.CylinderGeometry(radius, radius, length, sides || 10, 1, false),
    channel,
    options,
    name,
    stateRole,
  );
  mesh.position.copy(vector(position));
  if (axis === "x") mesh.rotation.z = Math.PI / 2;
  else if (axis === "z") mesh.rotation.x = Math.PI / 2;
  rememberBase(mesh);
  return mesh;
}
function torus(group, radius, tube, position, channel, options, name, rotation, stateRole, radialSegments, tubularSegments, arc) {
  const mesh = taggedMesh(
    group,
    new THREE.TorusGeometry(radius, tube, radialSegments || 5, tubularSegments || 12, arc || Math.PI * 2),
    channel,
    options,
    name,
    stateRole,
  );
  mesh.position.copy(vector(position));
  if (rotation) mesh.rotation.set(rotation[0] || 0, rotation[1] || 0, rotation[2] || 0);
  rememberBase(mesh);
  return mesh;
}
function rivet(group, position, options, name, axis) {
  return cylinder(group, 0.025, 0.025, position, "metal", options, name, axis || "z", 6);
}
function orientBetween(mesh, fromValue, toValue) {
  const from = vector(fromValue);
  const to = vector(toValue);
  const direction = to.clone().sub(from);
  const length = direction.length();
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  if (length > EPS) mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.scale.y = length;
  rememberBase(mesh);
  return mesh;
}
function segment(group, from, to, radius, channel, options, name, sides) {
  const mesh = taggedMesh(
    group,
    new THREE.CylinderGeometry(radius, radius, 1, sides || 8, 1, false),
    channel,
    options,
    name,
  );
  return orientBetween(mesh, from, to);
}
function socket(group, type, position, rotation, extra) {
  group.userData.sockets ||= [];
  const entry = Object.assign({
    type,
    position: vector(position).toArray(),
    rotation: rotation || [0, 0, 0],
  }, extra || {});
  group.userData.sockets.push(entry);
  return entry;
}
function begin(kind, options, category) {
  const opts = optsFor(options);
  const group = new THREE.Group();
  group.name = `procedural-${kind}`;
  group.userData.genesisProceduralKit = {
    kind,
    category,
    seedKey: opts.seedKey,
    materialContext: opts.materialContextResolved,
    state: "intact",
    engineOwned: true,
  };
  group.userData.sockets = [];
  return { group, opts };
}
function finish(group) {
  group.traverse((node) => {
    if (node.isMesh && !node.userData.proceduralBase) rememberBase(node);
  });
  return group;
}

function createWheel(options) {
  const { group, opts } = begin("wheel", options, "mechanical");
  const radius = opts.radius || 0.36;
  const thickness = opts.thickness || 0.11;
  const spokes = Math.max(4, Math.min(10, opts.spokes || 8));
  const rim = taggedMesh(
    group,
    new THREE.TorusGeometry(radius, thickness * 0.34, 5, Math.max(12, spokes * 2)),
    opts.rimChannel || "structurePrimary",
    opts,
    "wheel-rim",
  );
  const hub = cylinder(group, thickness * 0.52, thickness * 1.45, [0, 0, 0], opts.hubChannel || "metal", opts, "wheel-hub", "z", 8);
  const spokeBars = Math.max(2, Math.ceil(spokes / 2));
  for (let index = 0; index < spokeBars; index++) {
    const angle = index * Math.PI / spokeBars;
    const spoke = box(
      group,
      [radius * 1.55, thickness * 0.20, thickness * 0.34],
      [0, 0, 0],
      opts.spokeChannel || "structurePrimary",
      opts,
      `wheel-spoke-${index + 1}`,
      [0, 0, angle],
    );
    spoke.renderOrder = -1;
  }
  if (opts.ironTire !== false) {
    torus(group, radius + thickness * 0.025, thickness * 0.12, [0, 0, 0], "metal", opts, "wheel-iron-tire", null, null, 4, Math.max(12, spokes * 2));
  }
  rim.rotation.set(0, 0, 0);
  socket(group, "axle", [0, 0, 0], [0, 0, 0], { radius: thickness * 0.48 });
  socket(group, "outer-face", [0, 0, thickness * 0.7], [0, 0, 0]);
  return finish(group);
}
function createAxle(options) {
  const { group, opts } = begin("axle", options, "mechanical");
  const length = opts.length || 0.95;
  const radius = opts.radius || 0.055;
  cylinder(group, radius, length, [0, 0, 0], opts.channel || "metal", opts, "axle-shaft", "x", 8);
  cylinder(group, radius * 1.45, radius * 0.55, [-length * 0.48, 0, 0], "metal", opts, "axle-cap-left", "x", 8);
  cylinder(group, radius * 1.45, radius * 0.55, [length * 0.48, 0, 0], "metal", opts, "axle-cap-right", "x", 8);
  cylinder(group, radius * 1.7, radius * 0.32, [-length * 0.4, 0, 0], "metal", opts, "axle-collar-left", "x", 8);
  cylinder(group, radius * 1.7, radius * 0.32, [length * 0.4, 0, 0], "metal", opts, "axle-collar-right", "x", 8);
  socket(group, "wheel-left", [-length * 0.5, 0, 0], [0, Math.PI / 2, 0]);
  socket(group, "wheel-right", [length * 0.5, 0, 0], [0, -Math.PI / 2, 0]);
  socket(group, "chassis", [0, radius * 1.5, 0], [0, 0, 0]);
  return finish(group);
}
function createHandle(options) {
  const { group, opts } = begin("handle", options, "mechanical");
  const width = opts.width || 0.42;
  segment(group, [-width / 2, 0, 0], [width / 2, 0, 0], opts.radius || 0.045, opts.gripChannel || "structureSecondary", opts, "handle-grip", 8);
  segment(group, [-width / 2, 0, 0], [-width / 2, -0.2, 0], 0.025, "metal", opts, "handle-mount-left", 8);
  segment(group, [width / 2, 0, 0], [width / 2, -0.2, 0], 0.025, "metal", opts, "handle-mount-right", 8);
  rivet(group, [-width / 2, -0.2, 0.02], opts, "handle-rivet-left");
  rivet(group, [width / 2, -0.2, 0.02], opts, "handle-rivet-right");
  socket(group, "mount-left", [-width / 2, -0.2, 0], [0, 0, 0]);
  socket(group, "mount-right", [width / 2, -0.2, 0], [0, 0, 0]);
  return finish(group);
}
function createCrank(options) {
  const { group, opts } = begin("crank", options, "mechanical");
  const arm = opts.arm || 0.32;
  cylinder(group, 0.06, 0.16, [0, 0, 0], "metal", opts, "crank-hub", "z", 8);
  box(group, [arm, 0.055, 0.06], [arm / 2, 0, 0], "metal", opts, "crank-arm");
  cylinder(group, 0.045, 0.22, [arm, 0, 0.08], opts.gripChannel || "structureSecondary", opts, "crank-grip", "z", 8, "movable");
  cylinder(group, 0.057, 0.026, [arm, 0, 0.205], "metal", opts, "crank-grip-cap", "z", 8);
  socket(group, "shaft", [0, 0, -0.08], [0, 0, 0]);
  socket(group, "hand", [arm, 0, 0.2], [0, 0, 0]);
  return finish(group);
}
function createHinge(options) {
  const { group, opts } = begin("hinge", options, "mechanical");
  const height = opts.height || 0.34;
  box(group, [0.2, height, 0.028], [-0.12, 0, 0], "metal", opts, "hinge-leaf-fixed");
  box(group, [0.2, height, 0.028], [0.12, 0, 0], "metal", opts, "hinge-leaf-moving", null, "movable");
  cylinder(group, 0.034, height * 1.18, [0, 0, 0.025], "metal", opts, "hinge-pin", "y", 8);
  [-0.27, 0.27].forEach((y, index) => {
    const scaledY = y * (height / 0.54);
    rivet(group, [-0.13, scaledY, 0.025], opts, `hinge-fixed-rivet-${index + 1}`);
    rivet(group, [0.13, scaledY, 0.025], opts, `hinge-moving-rivet-${index + 1}`);
  });
  [-0.3, 0, 0.3].forEach((fraction, index) => {
    cylinder(group, 0.048, height * 0.23, [0, height * fraction, 0.025], "metal", opts, `hinge-knuckle-${index + 1}`, "y", 8);
  });
  socket(group, "fixed-leaf", [-0.105, 0, 0], [0, 0, 0]);
  socket(group, "moving-leaf", [0.105, 0, 0], [0, 0, 0]);
  socket(group, "hinge-axis", [0, -height / 2, 0], [0, 0, 0]);
  return finish(group);
}
function createLatch(options) {
  const { group, opts } = begin("latch", options, "mechanical");
  box(group, [0.18, 0.24, 0.028], [-0.22, 0, 0], "metal", opts, "latch-plate");
  box(group, [0.48, 0.06, 0.055], [0.04, 0.03, 0.04], "metal", opts, "latch-bar", null, "movable");
  box(group, [0.12, 0.18, 0.05], [0.3, 0, 0.02], "metal", opts, "latch-catch");
  torus(group, 0.055, 0.015, [0.03, 0.095, 0.075], "metal", opts, "latch-finger-ring", [Math.PI / 2, 0, 0], "movable", 4, 10);
  rivet(group, [-0.22, 0.075, 0.025], opts, "latch-rivet-upper");
  rivet(group, [-0.22, -0.075, 0.025], opts, "latch-rivet-lower");
  socket(group, "fixed", [-0.22, 0, 0], [0, 0, 0]);
  socket(group, "catch", [0.3, 0, 0], [0, 0, 0]);
  socket(group, "hand", [0.03, 0.06, 0.08], [0, 0, 0]);
  return finish(group);
}
function createHook(options) {
  const { group, opts } = begin("hook", options, "mechanical");
  const scale = opts.scale || 1;
  const points = [
    new THREE.Vector3(0, 0.3, 0),
    new THREE.Vector3(0, 0.08, 0),
    new THREE.Vector3(0.02, -0.18, 0),
    new THREE.Vector3(0.2, -0.24, 0),
    new THREE.Vector3(0.27, -0.08, 0),
  ].map((point) => point.multiplyScalar(scale));
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  taggedMesh(group, new THREE.TubeGeometry(curve, 12, 0.035 * scale, 6, false), "metal", opts, "hook-body");
  torus(group, 0.07 * scale, 0.022 * scale, [0, 0.33 * scale, 0], "metal", opts, "hook-eye", null, null, 5, 10);
  socket(group, "suspension", [0, 0.38 * scale, 0], [0, 0, 0]);
  socket(group, "load", [0.23 * scale, -0.05 * scale, 0], [0, 0, 0]);
  return finish(group);
}
function createBracket(options) {
  const { group, opts } = begin("bracket", options, "mechanical");
  const size = opts.size || 0.32;
  box(group, [0.07, size, 0.08], [0, size / 2, 0], opts.channel || "metal", opts, "bracket-vertical");
  box(group, [size, 0.07, 0.08], [size / 2, 0.035, 0], opts.channel || "metal", opts, "bracket-horizontal");
  segment(group, [0.035, size * 0.12, 0], [size * 0.82, size * 0.82, 0], 0.025, opts.channel || "metal", opts, "bracket-brace", 6);
  rivet(group, [0, size * 0.22, 0.055], opts, "bracket-wall-rivet");
  rivet(group, [size * 0.7, 0.07, 0.055], opts, "bracket-shelf-rivet");
  socket(group, "wall", [0, size / 2, 0], [0, 0, 0]);
  socket(group, "bearing", [size, 0.07, 0], [0, 0, 0]);
  return finish(group);
}
function createSpike(options) {
  const { group, opts } = begin("spike", options, "mechanical");
  const length = opts.length || 0.52;
  const spike = taggedMesh(group, new THREE.ConeGeometry(opts.radius || 0.095, length, 6), opts.channel || "metal", opts, "spike-body");
  spike.position.y = length / 2;
  rememberBase(spike);
  cylinder(group, (opts.radius || 0.095) * 1.25, 0.055, [0, 0.0275, 0], "metal", opts, "spike-base-collar", "y", 6);
  socket(group, "base", [0, 0, 0], [0, 0, 0]);
  socket(group, "tip", [0, length, 0], [0, 0, 0]);
  return finish(group);
}
function createFoot(options) {
  const { group, opts } = begin("foot", options, "mechanical");
  const width = opts.width || 0.34;
  box(group, [width, 0.08, width * 0.78], [0, 0.04, 0], opts.padChannel || "masonry", opts, "foot-pad");
  box(group, [width * 0.46, 0.18, width * 0.46], [0, 0.15, 0], opts.channel || "metal", opts, "foot-neck");
  [-1, 1].forEach((side) => {
    rivet(group, [side * width * 0.34, 0.09, 0], opts, `foot-anchor-${side < 0 ? "left" : "right"}`, "y");
  });
  socket(group, "floor-mount", [0, 0, 0], [0, 0, 0]);
  socket(group, "load", [0, 0.24, 0], [0, 0, 0]);
  return finish(group);
}
function createPulley(options) {
  const { group, opts } = begin("pulley", options, "mechanical");
  const radius = opts.radius || 0.27;
  const thickness = opts.thickness || 0.09;
  cylinder(group, radius, thickness, [0, 0, 0], opts.wheelChannel || "structurePrimary", opts, "pulley-sheave", "z", 12, "movable");
  torus(group, radius * 0.78, thickness * 0.18, [0, 0, thickness * 0.52], "metal", opts, "pulley-groove-front", null, "movable", 4, 12);
  torus(group, radius * 0.78, thickness * 0.18, [0, 0, -thickness * 0.52], "metal", opts, "pulley-groove-back", null, "movable", 4, 12);
  cylinder(group, thickness * 0.45, thickness * 1.75, [0, 0, 0], "metal", opts, "pulley-pin", "z", 8);
  socket(group, "axle", [0, 0, 0], [0, 0, 0]);
  socket(group, "rope-entry", [-radius, 0, 0], [0, 0, 0]);
  socket(group, "rope-exit", [radius, 0, 0], [0, 0, 0]);
  return finish(group);
}
function createBearingBlock(options) {
  const { group, opts } = begin("bearing-block", options, "mechanical");
  const width = opts.width || 0.42;
  box(group, [width, 0.11, 0.28], [0, 0.055, 0], "metal", opts, "bearing-block-base");
  box(group, [width * 0.58, 0.28, 0.22], [0, 0.22, 0], opts.bodyChannel || "metal", opts, "bearing-block-housing");
  torus(group, 0.085, 0.035, [0, 0.24, 0.125], "metal", opts, "bearing-block-race", null, null, 5, 12);
  [-1, 1].forEach((side) => rivet(group, [side * width * 0.36, 0.12, 0], opts, `bearing-block-bolt-${side < 0 ? "left" : "right"}`, "y"));
  socket(group, "shaft", [0, 0.24, 0], [0, 0, 0], { radius: 0.055 });
  socket(group, "floor-mount", [0, 0, 0], [0, 0, 0]);
  return finish(group);
}
function createClamp(options) {
  const { group, opts } = begin("clamp", options, "mechanical");
  const span = opts.span || 0.3;
  box(group, [0.065, span, 0.09], [-span * 0.48, 0, 0], "metal", opts, "clamp-spine");
  box(group, [span, 0.065, 0.09], [0, span * 0.48, 0], "metal", opts, "clamp-jaw-fixed");
  box(group, [span * 0.72, 0.065, 0.09], [-span * 0.06, -span * 0.48, 0], "metal", opts, "clamp-jaw-moving", null, "movable");
  cylinder(group, 0.025, span * 0.72, [span * 0.26, -span * 0.48, 0], "metal", opts, "clamp-screw", "y", 8, "movable");
  segment(group, [span * 0.1, -span * 0.84, 0], [span * 0.42, -span * 0.84, 0], 0.022, "metal", opts, "clamp-tommy-bar", 8);
  socket(group, "jaw", [0, 0, 0], [0, 0, 0], { span });
  socket(group, "hand", [span * 0.26, -span * 0.84, 0], [0, 0, 0]);
  return finish(group);
}
function createCollar(options) {
  const { group, opts } = begin("collar", options, "mechanical");
  const radius = opts.radius || 0.12;
  torus(group, radius, 0.045, [0, 0, 0], "metal", opts, "collar-ring", null, null, 5, 12);
  box(group, [0.09, 0.07, 0.08], [radius * 0.9, 0, 0], "metal", opts, "collar-lug");
  cylinder(group, 0.02, 0.12, [radius * 0.9, 0.055, 0], "metal", opts, "collar-set-screw", "y", 7, "movable");
  socket(group, "shaft", [0, 0, 0], [0, 0, 0], { radius: radius * 0.62 });
  socket(group, "set-screw", [radius * 0.9, 0.11, 0], [0, 0, 0]);
  return finish(group);
}
function createCoupler(options) {
  const { group, opts } = begin("coupler", options, "mechanical");
  const length = opts.length || 0.34;
  const radius = opts.radius || 0.105;
  cylinder(group, radius, length, [0, 0, 0], "metal", opts, "coupler-body", "x", 10);
  cylinder(group, radius * 1.12, 0.055, [-length * 0.38, 0, 0], "metal", opts, "coupler-band-left", "x", 10);
  cylinder(group, radius * 1.12, 0.055, [length * 0.38, 0, 0], "metal", opts, "coupler-band-right", "x", 10);
  rivet(group, [0, radius * 0.92, 0], opts, "coupler-key", "y");
  socket(group, "shaft-left", [-length / 2, 0, 0], [0, Math.PI / 2, 0], { radius: radius * 0.54 });
  socket(group, "shaft-right", [length / 2, 0, 0], [0, -Math.PI / 2, 0], { radius: radius * 0.54 });
  return finish(group);
}
function createEyelet(options) {
  const { group, opts } = begin("eyelet", options, "mechanical");
  const radius = opts.radius || 0.105;
  torus(group, radius, 0.026, [0, 0.22, 0], "metal", opts, "eyelet-ring", null, null, 5, 12);
  cylinder(group, 0.035, 0.24, [0, 0.05, 0], "metal", opts, "eyelet-shank", "y", 8);
  cylinder(group, 0.065, 0.035, [0, -0.065, 0], "metal", opts, "eyelet-washer", "y", 8);
  socket(group, "mount", [0, -0.085, 0], [0, 0, 0]);
  socket(group, "rope", [0, 0.22, 0], [0, 0, 0]);
  return finish(group);
}
function createCleat(options) {
  const { group, opts } = begin("cleat", options, "mechanical");
  const width = opts.width || 0.48;
  box(group, [width * 0.42, 0.09, 0.12], [0, 0.045, 0], "metal", opts, "cleat-base");
  segment(group, [-width * 0.08, 0.11, 0], [-width * 0.5, 0.23, 0], 0.045, "metal", opts, "cleat-horn-left", 8);
  segment(group, [width * 0.08, 0.11, 0], [width * 0.5, 0.23, 0], 0.045, "metal", opts, "cleat-horn-right", 8);
  rivet(group, [-width * 0.12, 0.1, 0.04], opts, "cleat-bolt-left", "y");
  rivet(group, [width * 0.12, 0.1, 0.04], opts, "cleat-bolt-right", "y");
  socket(group, "mount", [0, 0, 0], [0, 0, 0]);
  socket(group, "rope-left", [-width * 0.5, 0.23, 0], [0, 0, 0]);
  socket(group, "rope-right", [width * 0.5, 0.23, 0], [0, 0, 0]);
  return finish(group);
}
function createPin(options) {
  const { group, opts } = begin("pin", options, "mechanical");
  const length = opts.length || 0.38;
  const radius = opts.radius || 0.045;
  cylinder(group, radius, length, [0, 0, 0], "metal", opts, "pin-shaft", "y", 8, "movable");
  cylinder(group, radius * 1.75, 0.06, [0, length * 0.52, 0], "metal", opts, "pin-head", "y", 8, "movable");
  torus(group, radius * 1.15, radius * 0.28, [0, -length * 0.52, 0], "metal", opts, "pin-retaining-ring", [Math.PI / 2, 0, 0], "movable", 4, 9);
  socket(group, "head", [0, length * 0.55, 0], [0, 0, 0]);
  socket(group, "tip", [0, -length * 0.55, 0], [0, 0, 0]);
  return finish(group);
}
function createRung(options) {
  const { group, opts } = begin("rung", options, "mechanical");
  const width = opts.width || 0.62;
  segment(group, [-width / 2, 0, 0], [width / 2, 0, 0], opts.radius || 0.045, opts.channel || "metal", opts, "rung-step", 8);
  box(group, [0.08, 0.16, 0.08], [-width / 2, -0.08, 0], "metal", opts, "rung-mount-left");
  box(group, [0.08, 0.16, 0.08], [width / 2, -0.08, 0], "metal", opts, "rung-mount-right");
  socket(group, "mount-left", [-width / 2, -0.16, 0], [0, 0, 0]);
  socket(group, "mount-right", [width / 2, -0.16, 0], [0, 0, 0]);
  return finish(group);
}
function createCap(options) {
  const { group, opts } = begin("cap", options, "mechanical");
  const width = opts.width || 0.24;
  box(group, [width, 0.07, width], [0, 0.035, 0], opts.channel || "metal", opts, "cap-plate");
  const crown = taggedMesh(group, new THREE.ConeGeometry(width * 0.68, width * 0.34, 4), opts.crownChannel || "metal", opts, "cap-crown");
  crown.position.y = 0.07 + width * 0.17;
  crown.rotation.y = Math.PI / 4;
  rememberBase(crown);
  socket(group, "post", [0, 0, 0], [0, 0, 0], { width });
  socket(group, "top", [0, 0.07 + width * 0.34, 0], [0, 0, 0]);
  return finish(group);
}
function toothedWheel(kind, options, config) {
  const { group, opts } = begin(kind, options, "mechanical");
  const radius = opts.radius || config.radius;
  const thickness = opts.thickness || config.thickness;
  const teeth = Math.max(config.minTeeth, Math.min(config.maxTeeth, opts.teeth || config.teeth));
  cylinder(group, radius * config.coreScale, thickness, [0, 0, 0], opts.channel || "metal", opts, `${kind}-core`, "z", teeth * 2, "movable");
  torus(group, radius * config.ringScale, thickness * 0.16, [0, 0, thickness * 0.51], "metal", opts, `${kind}-face-ring`, null, "movable", 4, teeth * 2);
  for (let index = 0; index < teeth; index++) {
    const angle = index * Math.PI * 2 / teeth;
    // The tooth intentionally penetrates the core by a small amount. A visually tiny air gap here
    // becomes an actual disconnected mesh island in exports and is especially obvious on rotation.
    const radial = radius * (config.coreScale + config.toothLength * 0.5 - 0.035);
    const tooth = box(
      group,
      [radius * config.toothLength, radius * config.toothWidth, thickness * 0.9],
      [Math.cos(angle) * radial, Math.sin(angle) * radial, 0],
      "metal",
      opts,
      `${kind}-tooth-${index + 1}`,
      [0, 0, angle + (config.skew || 0)],
      "movable",
    );
    tooth.userData.genesisProcedural.toothIndex = index;
  }
  cylinder(group, radius * 0.22, thickness * 1.35, [0, 0, 0], "metal", opts, `${kind}-hub`, "z", 8, "movable");
  socket(group, "shaft", [0, 0, 0], [0, 0, 0], { radius: radius * 0.2 });
  socket(group, "mesh", [radius * 1.08, 0, 0], [0, 0, 0], { pitchRadius: radius });
  return finish(group);
}
function createGear(options) {
  return toothedWheel("gear", options, {
    radius: 0.26, thickness: 0.09, teeth: 12, minTeeth: 8, maxTeeth: 18,
    coreScale: 0.72, ringScale: 0.52, toothLength: 0.3, toothWidth: 0.13, skew: 0,
  });
}
function createSprocket(options) {
  return toothedWheel("sprocket", options, {
    radius: 0.27, thickness: 0.07, teeth: 10, minTeeth: 6, maxTeeth: 16,
    coreScale: 0.58, ringScale: 0.44, toothLength: 0.45, toothWidth: 0.1, skew: 0,
  });
}
function createRatchet(options) {
  return toothedWheel("ratchet", options, {
    radius: 0.25, thickness: 0.075, teeth: 10, minTeeth: 7, maxTeeth: 16,
    coreScale: 0.7, ringScale: 0.5, toothLength: 0.34, toothWidth: 0.12, skew: 0.18,
  });
}
function createPawl(options) {
  const { group, opts } = begin("pawl", options, "mechanical");
  const length = opts.length || 0.42;
  box(group, [length, 0.07, 0.08], [length * 0.12, 0, 0], "metal", opts, "pawl-lever", [0, 0, -0.08], "movable");
  torus(group, 0.07, 0.022, [-length * 0.42, 0.03, 0], "metal", opts, "pawl-pivot-eye", null, "movable", 5, 10);
  const tooth = taggedMesh(group, new THREE.ConeGeometry(0.085, 0.18, 3), "metal", opts, "pawl-tooth", "movable");
  tooth.position.set(length * 0.58, -0.07, 0);
  tooth.rotation.z = Math.PI * 0.48;
  rememberBase(tooth);
  socket(group, "pivot", [-length * 0.42, 0.03, 0], [0, 0, 0]);
  socket(group, "ratchet-contact", [length * 0.65, -0.08, 0], [0, 0, 0]);
  return finish(group);
}
function createWinchDrum(options) {
  const { group, opts } = begin("winch-drum", options, "mechanical");
  const length = opts.length || 0.48;
  const radius = opts.radius || 0.17;
  cylinder(group, radius, length, [0, 0, 0], opts.drumChannel || "structurePrimary", opts, "winch-drum-core", "x", 12, "movable");
  cylinder(group, radius * 1.35, 0.055, [-length * 0.48, 0, 0], "metal", opts, "winch-drum-flange-left", "x", 12, "movable");
  cylinder(group, radius * 1.35, 0.055, [length * 0.48, 0, 0], "metal", opts, "winch-drum-flange-right", "x", 12, "movable");
  cylinder(group, radius * 0.28, length * 1.35, [0, 0, 0], "metal", opts, "winch-drum-shaft", "x", 8, "movable");
  socket(group, "shaft-left", [-length * 0.68, 0, 0], [0, Math.PI / 2, 0]);
  socket(group, "shaft-right", [length * 0.68, 0, 0], [0, -Math.PI / 2, 0]);
  socket(group, "rope-anchor", [0, radius, 0], [0, 0, 0]);
  return finish(group);
}
function createSpool(options) {
  const { group, opts } = begin("spool", options, "mechanical");
  const height = opts.height || 0.4;
  const radius = opts.radius || 0.14;
  cylinder(group, radius * 0.62, height, [0, 0, 0], opts.coreChannel || "structureSecondary", opts, "spool-core", "y", 10, "movable");
  cylinder(group, radius * 1.42, 0.055, [0, -height * 0.48, 0], opts.flangeChannel || "structurePrimary", opts, "spool-flange-bottom", "y", 10, "movable");
  cylinder(group, radius * 1.42, 0.055, [0, height * 0.48, 0], opts.flangeChannel || "structurePrimary", opts, "spool-flange-top", "y", 10, "movable");
  socket(group, "axle", [0, 0, 0], [0, 0, 0]);
  socket(group, "line-start", [radius * 0.7, 0, 0], [0, 0, 0]);
  socket(group, "floor-mount", [0, -height * 0.52, 0], [0, 0, 0]);
  return finish(group);
}
function createRoller(options) {
  const { group, opts } = begin("roller", options, "mechanical");
  const length = opts.length || 0.58;
  const radius = opts.radius || 0.1;
  cylinder(group, radius, length, [0, 0, 0], opts.channel || "metal", opts, "roller-body", "x", 10, "movable");
  cylinder(group, radius * 0.38, length * 1.28, [0, 0, 0], "metal", opts, "roller-axle", "x", 8, "movable");
  cylinder(group, radius * 1.08, 0.04, [-length * 0.49, 0, 0], "metal", opts, "roller-rim-left", "x", 10, "movable");
  cylinder(group, radius * 1.08, 0.04, [length * 0.49, 0, 0], "metal", opts, "roller-rim-right", "x", 10, "movable");
  socket(group, "mount-left", [-length * 0.65, 0, 0], [0, Math.PI / 2, 0]);
  socket(group, "mount-right", [length * 0.65, 0, 0], [0, -Math.PI / 2, 0]);
  return finish(group);
}
function createChainGuide(options) {
  const { group, opts } = begin("chain-guide", options, "mechanical");
  const spacing = opts.spacing || 0.34;
  box(group, [spacing + 0.34, 0.08, 0.18], [0, 0.04, 0], "metal", opts, "chain-guide-base");
  [-1, 1].forEach((side, index) => {
    torus(group, 0.105, 0.025, [side * spacing / 2, 0.19, 0], "metal", opts, `chain-guide-ring-${index + 1}`, null, "movable", 5, 10);
    cylinder(group, 0.032, 0.26, [side * spacing / 2, 0.13, -0.06], "metal", opts, `chain-guide-post-${index + 1}`, "y", 8);
    cylinder(group, 0.022, 0.18, [side * spacing / 2, 0.19, 0], "metal", opts, `chain-guide-axle-${index + 1}`, "z", 8, "movable");
  });
  socket(group, "chain-entry", [-spacing * 0.65, 0.19, 0], [0, 0, 0]);
  socket(group, "chain-exit", [spacing * 0.65, 0.19, 0], [0, 0, 0]);
  socket(group, "mount", [0, 0, 0], [0, 0, 0]);
  return finish(group);
}
function createFairlead(options) {
  const { group, opts } = begin("fairlead", options, "mechanical");
  const width = opts.width || 0.48;
  const height = opts.height || 0.32;
  box(group, [width, 0.07, 0.1], [0, height / 2, 0], "metal", opts, "fairlead-top");
  box(group, [width, 0.07, 0.1], [0, -height / 2, 0], "metal", opts, "fairlead-bottom");
  box(group, [0.07, height, 0.1], [-width / 2, 0, 0], "metal", opts, "fairlead-left");
  box(group, [0.07, height, 0.1], [width / 2, 0, 0], "metal", opts, "fairlead-right");
  [1, -1].forEach((side, index) => {
    const y = side * height * 0.28;
    cylinder(group, 0.042, width * 0.72, [0, y, 0.065], "metal", opts, `fairlead-roller-${index ? "bottom" : "top"}`, "x", 8, "movable");
    cylinder(group, 0.017, width * 1.08, [0, y, 0.065], "metal", opts, `fairlead-axle-${index ? "bottom" : "top"}`, "x", 8);
  });
  [1, -1].forEach((side, index) => {
    const x = side * width * 0.31;
    cylinder(group, 0.035, height * 0.55, [x, 0, 0.065], "metal", opts, `fairlead-side-roller-${index ? "left" : "right"}`, "y", 8, "movable");
    cylinder(group, 0.014, height * 1.06, [x, 0, 0.065], "metal", opts, `fairlead-side-axle-${index ? "left" : "right"}`, "y", 8);
  });
  socket(group, "line-entry", [0, 0, -0.08], [0, 0, 0]);
  socket(group, "line-exit", [0, 0, 0.12], [0, 0, 0]);
  socket(group, "mount", [0, -height / 2, 0], [0, 0, 0]);
  return finish(group);
}
function createShackle(options) {
  const { group, opts } = begin("shackle", options, "mechanical");
  const radius = opts.radius || 0.16;
  const pinY = -radius * 0.35;
  const bowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-radius * 0.76, pinY, 0),
    new THREE.Vector3(-radius, radius * 0.22, 0),
    new THREE.Vector3(-radius * 0.64, radius * 0.86, 0),
    new THREE.Vector3(0, radius * 1.16, 0),
    new THREE.Vector3(radius * 0.64, radius * 0.86, 0),
    new THREE.Vector3(radius, radius * 0.22, 0),
    new THREE.Vector3(radius * 0.76, pinY, 0),
  ], false, "centripetal");
  taggedMesh(group, new THREE.TubeGeometry(bowCurve, 18, 0.035, 6, false), "metal", opts, "shackle-bow");
  cylinder(group, 0.035, radius * 1.72, [0, pinY, 0], "metal", opts, "shackle-pin", "x", 8, "movable");
  cylinder(group, 0.055, 0.055, [-radius * 0.88, pinY, 0], "metal", opts, "shackle-pin-head", "x", 8, "movable");
  socket(group, "bow", [0, radius * 1.2, 0], [0, 0, 0]);
  socket(group, "pin", [0, pinY, 0], [0, 0, 0]);
  return finish(group);
}
function createSwivel(options) {
  const { group, opts } = begin("swivel", options, "mechanical");
  const length = opts.length || 0.48;
  cylinder(group, 0.075, length * 0.38, [0, 0, 0], "metal", opts, "swivel-body", "y", 8, "movable");
  torus(group, 0.09, 0.025, [0, length * 0.39, 0], "metal", opts, "swivel-eye-top", null, "movable", 5, 10);
  torus(group, 0.09, 0.025, [0, -length * 0.39, 0], "metal", opts, "swivel-eye-bottom", [Math.PI / 2, 0, 0], "movable", 5, 10);
  cylinder(group, 0.095, 0.045, [0, length * 0.16, 0], "metal", opts, "swivel-race-top", "y", 8, "movable");
  cylinder(group, 0.095, 0.045, [0, -length * 0.16, 0], "metal", opts, "swivel-race-bottom", "y", 8, "movable");
  socket(group, "end-a", [0, length * 0.58, 0], [0, 0, 0]);
  socket(group, "end-b", [0, -length * 0.58, 0], [0, 0, 0]);
  return finish(group);
}
function createTensioner(options) {
  const { group, opts } = begin("tensioner", options, "mechanical");
  const length = opts.length || 0.62;
  box(group, [length * 0.48, 0.12, 0.12], [0, 0, 0], "metal", opts, "tensioner-body", null, "movable");
  cylinder(group, 0.03, length * 0.7, [0, 0, 0], "metal", opts, "tensioner-thread", "x", 8, "movable");
  cylinder(group, 0.026, length * 0.36, [-length * 0.36, 0, 0], "metal", opts, "tensioner-rod-left", "x", 8, "movable");
  cylinder(group, 0.026, length * 0.36, [length * 0.36, 0, 0], "metal", opts, "tensioner-rod-right", "x", 8, "movable");
  torus(group, 0.085, 0.024, [-length * 0.52, 0, 0], "metal", opts, "tensioner-eye-left", [0, Math.PI / 2, 0], "movable", 5, 10);
  torus(group, 0.085, 0.024, [length * 0.52, 0, 0], "metal", opts, "tensioner-eye-right", [0, Math.PI / 2, 0], "movable", 5, 10);
  socket(group, "end-a", [-length * 0.65, 0, 0], [0, 0, 0]);
  socket(group, "end-b", [length * 0.65, 0, 0], [0, 0, 0]);
  socket(group, "hand", [0, 0.12, 0], [0, 0, 0]);
  return finish(group);
}
function createBuckle(options) {
  const { group, opts } = begin("buckle", options, "mechanical");
  const width = opts.width || 0.38;
  const height = opts.height || 0.3;
  box(group, [width, 0.045, 0.055], [0, height / 2, 0], "metal", opts, "buckle-top");
  box(group, [width, 0.045, 0.055], [0, -height / 2, 0], "metal", opts, "buckle-bottom");
  box(group, [0.045, height, 0.055], [-width / 2, 0, 0], "metal", opts, "buckle-left");
  box(group, [0.045, height, 0.055], [width / 2, 0, 0], "metal", opts, "buckle-right");
  cylinder(group, 0.024, width * 0.88, [0, 0, 0], "metal", opts, "buckle-center-bar", "x", 8);
  segment(group, [0, 0, 0.04], [0, height * 0.36, 0.04], 0.018, "metal", opts, "buckle-prong", 6);
  socket(group, "strap-fixed", [0, -height / 2, 0], [0, 0, 0]);
  socket(group, "strap-adjustable", [0, height / 2, 0], [0, 0, 0]);
  return finish(group);
}
function createStrapLoop(options) {
  const { group, opts } = begin("strap-loop", options, "mechanical");
  const width = opts.width || 0.34;
  torus(group, width * 0.42, 0.03, [0, 0.1, 0], "metal", opts, "strap-loop-ring", null, null, 5, 12, Math.PI);
  cylinder(group, 0.035, width, [0, 0.1, 0], "metal", opts, "strap-loop-bar", "x", 8);
  box(group, [width * 0.48, 0.08, 0.075], [0, -0.02, 0], "metal", opts, "strap-loop-mount");
  socket(group, "mount", [0, -0.06, 0], [0, 0, 0]);
  socket(group, "strap", [0, width * 0.48, 0], [0, 0, 0]);
  return finish(group);
}
function createCornerPlate(options) {
  const { group, opts } = begin("corner-plate", options, "mechanical");
  const size = opts.size || 0.34;
  box(group, [size, size, 0.035], [size / 2, size / 2, 0], "repair", opts, "corner-plate-face-a");
  box(group, [0.035, size, size], [0, size / 2, size / 2], "repair", opts, "corner-plate-face-b");
  [[size * 0.28, size * 0.28, 0.025], [size * 0.72, size * 0.72, 0.025]].forEach((position, index) => {
    rivet(group, position, opts, `corner-plate-rivet-${index + 1}`);
  });
  socket(group, "face-a", [size / 2, size / 2, 0], [0, 0, 0]);
  socket(group, "face-b", [0, size / 2, size / 2], [0, Math.PI / 2, 0]);
  socket(group, "corner", [0, 0, 0], [0, 0, 0]);
  return finish(group);
}
function createGusset(options) {
  const { group, opts } = begin("gusset", options, "mechanical");
  const size = opts.size || 0.4;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(size, 0);
  shape.lineTo(0, size);
  shape.closePath();
  const plate = taggedMesh(group, new THREE.ExtrudeGeometry(shape, {
    depth: opts.thickness || 0.045,
    bevelEnabled: false,
    steps: 1,
  }), "repair", opts, "gusset-plate");
  plate.position.set(-size * 0.33, 0, -0.022);
  rememberBase(plate);
  rivet(group, [-size * 0.2, size * 0.12, 0.035], opts, "gusset-rivet-lower");
  rivet(group, [-size * 0.2, size * 0.58, 0.035], opts, "gusset-rivet-upper");
  socket(group, "edge-horizontal", [size * 0.17, 0, 0], [0, 0, 0]);
  socket(group, "edge-vertical", [-size * 0.33, size / 2, 0], [0, 0, 0]);
  return finish(group);
}
function createAnchorPlate(options) {
  const { group, opts } = begin("anchor-plate", options, "mechanical");
  const size = opts.size || 0.38;
  box(group, [size, size * 0.72, 0.045], [0, 0, 0], "repair", opts, "anchor-plate-body");
  torus(group, size * 0.18, 0.035, [0, 0.03, 0.075], "metal", opts, "anchor-plate-eye", [Math.PI / 2, 0, 0], null, 5, 12);
  [-1, 1].forEach((side) => {
    rivet(group, [side * size * 0.34, -size * 0.22, 0.035], opts, `anchor-plate-bolt-${side < 0 ? "left" : "right"}`);
  });
  socket(group, "mount", [0, 0, 0], [0, 0, 0]);
  socket(group, "load", [0, 0.03, 0.18], [0, 0, 0]);
  return finish(group);
}
function createWedge(options) {
  const { group, opts } = begin("wedge", options, "mechanical");
  const length = opts.length || 0.46;
  const height = opts.height || 0.25;
  const width = opts.width || 0.22;
  const profile = new THREE.Shape();
  profile.moveTo(-length / 2, 0);
  profile.lineTo(length / 2, 0);
  profile.lineTo(-length / 2, height);
  profile.closePath();
  const wedge = taggedMesh(group, new THREE.ExtrudeGeometry(profile, {
    depth: width,
    bevelEnabled: false,
    steps: 1,
  }), opts.channel || "structureSecondary", opts, "wedge-body", "movable");
  wedge.position.z = -width / 2;
  rememberBase(wedge);
  box(group, [0.065, height * 0.92, width * 1.05], [-length * 0.49, height * 0.48, 0], "metal", opts, "wedge-strike-cap");
  socket(group, "strike", [-length * 0.52, height * 0.5, 0], [0, 0, 0]);
  socket(group, "tip", [length * 0.52, 0.02, 0], [0, 0, 0]);
  return finish(group);
}
function createRunner(options) {
  const { group, opts } = begin("runner", options, "mechanical");
  const length = opts.length || 0.82;
  box(group, [length * 0.78, 0.09, 0.16], [0, 0.045, 0], opts.channel || "structurePrimary", opts, "runner-main");
  box(group, [length * 0.24, 0.09, 0.16], [length * 0.45, 0.12, 0], opts.channel || "structurePrimary", opts, "runner-upturn-front", [0, 0, 0.58]);
  box(group, [length * 0.18, 0.09, 0.16], [-length * 0.43, 0.09, 0], opts.channel || "structurePrimary", opts, "runner-upturn-rear", [0, 0, -0.28]);
  box(group, [length * 0.46, 0.045, 0.18], [0, 0.105, 0], "metal", opts, "runner-wear-strip");
  socket(group, "load-front", [length * 0.24, 0.14, 0], [0, 0, 0]);
  socket(group, "load-rear", [-length * 0.24, 0.14, 0], [0, 0, 0]);
  socket(group, "ground-contact", [0, 0, 0], [0, 0, 0]);
  return finish(group);
}
function createSocketCup(options) {
  const { group, opts } = begin("socket-cup", options, "mechanical");
  const radius = opts.radius || 0.14;
  const height = opts.height || 0.28;
  cylinder(group, radius, height, [0, height / 2, 0], opts.channel || "metal", opts, "socket-cup-sleeve", "y", 10);
  torus(group, radius * 0.88, 0.035, [0, height, 0], "metal", opts, "socket-cup-lip", [Math.PI / 2, 0, 0], null, 5, 12);
  box(group, [radius * 2.7, 0.065, radius * 2.7], [0, 0.032, 0], "metal", opts, "socket-cup-base");
  [-1, 1].forEach((side) => rivet(group, [side * radius * 0.92, 0.075, 0], opts, `socket-cup-anchor-${side < 0 ? "left" : "right"}`, "y"));
  socket(group, "floor-mount", [0, 0, 0], [0, 0, 0]);
  socket(group, "post", [0, height, 0], [0, 0, 0], { radius: radius * 0.7 });
  return finish(group);
}

const PART_BUILDERS = Object.freeze({
  wheel: createWheel,
  axle: createAxle,
  handle: createHandle,
  crank: createCrank,
  hinge: createHinge,
  latch: createLatch,
  hook: createHook,
  bracket: createBracket,
  spike: createSpike,
  foot: createFoot,
  pulley: createPulley,
  "bearing-block": createBearingBlock,
  clamp: createClamp,
  collar: createCollar,
  coupler: createCoupler,
  eyelet: createEyelet,
  cleat: createCleat,
  pin: createPin,
  rung: createRung,
  cap: createCap,
  gear: createGear,
  sprocket: createSprocket,
  ratchet: createRatchet,
  pawl: createPawl,
  "winch-drum": createWinchDrum,
  spool: createSpool,
  roller: createRoller,
  "chain-guide": createChainGuide,
  fairlead: createFairlead,
  shackle: createShackle,
  swivel: createSwivel,
  tensioner: createTensioner,
  buckle: createBuckle,
  "strap-loop": createStrapLoop,
  "corner-plate": createCornerPlate,
  gusset: createGusset,
  "anchor-plate": createAnchorPlate,
  wedge: createWedge,
  runner: createRunner,
  "socket-cup": createSocketCup,
});
export function createProceduralPart(kind, options) {
  const builder = PART_BUILDERS[kind];
  if (!builder) throw new Error(`Unknown procedural part: ${kind}`);
  return builder(options);
}
export function proceduralPartKindsForUse(use) {
  const requested = String(use || "").trim();
  if (!requested) return PROCEDURAL_PART_KINDS.slice();
  return PROCEDURAL_PART_KINDS.filter((kind) => PROCEDURAL_PART_CATALOG[kind]?.uses?.includes(requested));
}
export function createProceduralPartForUse(use, options) {
  const opts = Object.assign({}, options || {});
  const candidates = proceduralPartKindsForUse(use);
  if (!candidates.length) throw new Error(`No procedural part supports use: ${use}`);
  const preferred = opts.preferredKind;
  const kind = preferred && candidates.includes(preferred)
    ? preferred
    : candidates[Math.min(candidates.length - 1, Math.floor(seededUnit(`${opts.seedKey || "procedural-kit"}:use:${use}`, 0) * candidates.length))];
  const part = createProceduralPart(kind, opts);
  part.userData.genesisProceduralKit.requestedUse = use;
  part.userData.genesisProceduralKit.catalogUses = PROCEDURAL_PART_CATALOG[kind].uses.slice();
  return part;
}

function normalizedPath(points) {
  const source = points && points.length >= 2 ? points : [[-0.5, 0, 0], [0, 0.12, 0], [0.5, 0, 0]];
  return source.map((point) => vector(point));
}
export function createProceduralPath(kind, points, options) {
  const { group, opts } = begin(kind, options, "path");
  const path = normalizedPath(points);
  const curve = new THREE.CatmullRomCurve3(path, false, "centripetal");
  if (kind === "rope") {
    const radius = opts.radius || 0.025;
    const segments = Math.max(6, opts.segments || Math.ceil(curve.getLength() / 0.08));
    const rope = taggedMesh(group, new THREE.TubeGeometry(curve, segments, radius, 5, false), opts.channel || "structureSecondary", opts, "rope-run");
    rope.userData.genesisProcedural.pathPoints = path.map((point) => point.toArray());
  } else if (kind === "chain") {
    const linkRadius = opts.linkRadius || 0.055;
    const tube = opts.tube || 0.012;
    const count = Math.max(3, opts.links || Math.ceil(curve.getLength() / (linkRadius * 1.4)));
    const geometry = new THREE.TorusGeometry(linkRadius, tube, 4, 8);
    for (let index = 0; index < count; index++) {
      const t = count === 1 ? 0 : index / (count - 1);
      const link = taggedMesh(group, geometry, opts.channel || "metal", opts, `chain-link-${index + 1}`);
      link.position.copy(curve.getPointAt(t));
      const tangent = curve.getTangentAt(t).normalize();
      link.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      if (index % 2) link.rotateOnAxis(tangent, Math.PI / 2);
      rememberBase(link);
    }
  } else {
    throw new Error(`Unknown procedural path: ${kind}`);
  }
  socket(group, "start", path[0], [0, 0, 0]);
  socket(group, "end", path[path.length - 1], [0, 0, 0]);
  return finish(group);
}

function fxMaterial(color, intensity, opacity) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.35,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 0.85,
    side: THREE.DoubleSide,
    blending: opacity < 0.8 ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}
function createFlame(options) {
  const { group, opts } = begin("flame", options, "fx");
  const scale = opts.scale || 1;
  const layers = [
    [0xff5a20, 0.16, 0.45, 0],
    [0xffb22e, 0.11, 0.34, 0.015],
    [0xffed9b, 0.065, 0.22, 0.03],
  ];
  layers.forEach(([color, radius, height, y], index) => {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius * scale, height * scale, 7), fxMaterial(color, 2.6 + index, 0.9));
    mesh.position.y = (height / 2 + y) * scale;
    mesh.name = `flame-layer-${index + 1}`;
    mesh.userData.genesisProcedural = { channel: "emission", stateRole: "fx" };
    group.add(mesh);
  });
  if (opts.light !== false) {
    const light = new THREE.PointLight(opts.lightColor || 0xff8c42, opts.lightIntensity || 0.75, opts.lightRange || 2.2, 2);
    light.position.y = 0.2 * scale;
    light.castShadow = !!opts.castShadow;
    group.add(light);
  }
  group.userData.tick = (time) => {
    group.children.forEach((child, index) => {
      if (!child.isMesh) return;
      const pulse = 1 + Math.sin(time * (7.2 + index * 1.1) + index * 2.3) * (0.035 + index * 0.008);
      child.scale.set(pulse, 1 + Math.sin(time * 8.6 + index) * 0.07, pulse);
      child.rotation.z = Math.sin(time * 3.9 + index * 1.7) * 0.045;
    });
  };
  socket(group, "effect-origin", [0, 0, 0], [0, 0, 0]);
  return finish(group);
}
function createEmber(options) {
  const { group, opts } = begin("ember", options, "fx");
  const count = Math.max(6, opts.count || 18);
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index++) {
    positions[index * 3] = (seededUnit(opts.seedKey, index * 3) - 0.5) * 0.32;
    positions[index * 3 + 1] = seededUnit(opts.seedKey, index * 3 + 1) * 0.65;
    positions[index * 3 + 2] = (seededUnit(opts.seedKey, index * 3 + 2) - 0.5) * 0.32;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({
    color: opts.color || 0xffa33b,
    size: opts.size || 0.035,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  points.name = "ember-particles";
  points.userData.genesisProcedural = { channel: "emission", stateRole: "fx" };
  group.add(points);
  group.userData.tick = (time, delta) => {
    const attr = geometry.attributes.position;
    for (let index = 0; index < count; index++) {
      attr.array[index * 3 + 1] += (delta || 1 / 60) * (0.08 + seededUnit(opts.seedKey, index + 99) * 0.12);
      if (attr.array[index * 3 + 1] > 0.72) attr.array[index * 3 + 1] = 0;
      attr.array[index * 3] += Math.sin(time * 2.2 + index) * 0.0007;
    }
    attr.needsUpdate = true;
  };
  return finish(group);
}
function createMagic(options) {
  const { group, opts } = begin("magic", options, "fx");
  const color = opts.emissionColor || 0x38bfe8;
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), fxMaterial(color, 2.1, 0.86));
  core.name = "magic-core";
  core.userData.genesisProcedural = { channel: "emission", stateRole: "fx" };
  core.position.y = 0.24;
  group.add(core);
  for (let index = 0; index < 2; index++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.25 + index * 0.08, 0.014, 5, 18), fxMaterial(color, 1.55, 0.72));
    ring.name = `magic-ring-${index + 1}`;
    ring.userData.genesisProcedural = { channel: "emission", stateRole: "fx" };
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.08 + index * 0.2;
    group.add(ring);
  }
  if (opts.light !== false) {
    const light = new THREE.PointLight(color, opts.lightIntensity || 0.38, opts.lightRange || 1.8, 2);
    light.position.y = 0.25;
    group.add(light);
  }
  group.userData.tick = (time) => {
    core.rotation.y = time * 0.8;
    core.rotation.z = time * 0.35;
    core.scale.setScalar(1 + Math.sin(time * 2.6) * 0.08);
    group.children.filter((child) => child.name.startsWith("magic-ring")).forEach((ring, index) => {
      ring.rotation.z = time * (index ? -0.55 : 0.7);
    });
  };
  socket(group, "effect-origin", [0, 0, 0], [0, 0, 0]);
  return finish(group);
}
function createSmoke(options) {
  const { group, opts } = begin("smoke", options, "fx");
  const count = Math.max(3, opts.count || 5);
  const color = opts.color || 0x666a6b;
  for (let index = 0; index < count; index++) {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 1,
      transparent: true,
      opacity: 0.16 + index * 0.025,
      depthWrite: false,
    });
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11 + index * 0.025, 0), material);
    puff.name = `smoke-puff-${index + 1}`;
    puff.userData.genesisProcedural = { channel: "effect", stateRole: "fx" };
    puff.position.set(
      (seededUnit(opts.seedKey, index) - 0.5) * 0.14,
      index * 0.16,
      (seededUnit(opts.seedKey, index + 40) - 0.5) * 0.12,
    );
    puff.userData.phase = seededUnit(opts.seedKey, index + 80) * Math.PI * 2;
    group.add(puff);
  }
  group.userData.tick = (time) => {
    group.children.forEach((puff, index) => {
      if (!puff.isMesh) return;
      const cycle = (time * (0.09 + index * 0.006) + index / count) % 1;
      puff.position.y = cycle * 0.85;
      puff.position.x = Math.sin(time * 0.55 + puff.userData.phase) * (0.04 + cycle * 0.08);
      puff.scale.setScalar(0.72 + cycle * 0.9);
      puff.material.opacity = (1 - cycle) * 0.22;
    });
  };
  socket(group, "effect-origin", [0, 0, 0], [0, 0, 0]);
  return finish(group);
}
const FX_BUILDERS = Object.freeze({ flame: createFlame, ember: createEmber, magic: createMagic, smoke: createSmoke });
export function createProceduralFx(kind, options) {
  const builder = FX_BUILDERS[kind];
  if (!builder) throw new Error(`Unknown procedural FX module: ${kind}`);
  return builder(options);
}

function markTexture(kind, options) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = kind === "banner" ? 384 : 192;
  const context = canvas.getContext("2d");
  const background = options.background || (kind === "paper" ? "#d8c8a7" : kind === "decal" ? "transparent" : "#6e4b2f");
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (background !== "transparent") {
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.strokeStyle = options.ink || (kind === "banner" ? "#dec998" : "#3a2b20");
  context.fillStyle = context.strokeStyle;
  context.lineWidth = 10;
  if (kind === "paper") {
    for (let index = 0; index < 7; index++) {
      const width = 120 + seededUnit(options.seedKey, index) * 80;
      context.fillRect(24, 28 + index * 20, width, 5);
    }
  } else {
    context.beginPath();
    context.moveTo(128, 34);
    context.lineTo(190, canvas.height * 0.55);
    context.lineTo(128, canvas.height - 40);
    context.lineTo(66, canvas.height * 0.55);
    context.closePath();
    context.stroke();
    context.beginPath();
    context.arc(128, canvas.height * 0.52, 38, 0, Math.PI * 2);
    context.stroke();
  }
  if (options.label) {
    context.font = "bold 24px Georgia";
    context.textAlign = "center";
    context.fillText(String(options.label).slice(0, 20), 128, canvas.height - 18);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}
export function createProceduralSurface(kind, options) {
  if (!PROCEDURAL_SURFACE_KINDS.includes(kind)) throw new Error(`Unknown procedural surface: ${kind}`);
  const { group, opts } = begin(kind, options, "surface");
  const width = opts.width || (kind === "paper" ? 0.3 : 0.55);
  const height = opts.height || (kind === "banner" ? 0.82 : kind === "paper" ? 0.38 : 0.5);
  const geometry = kind === "sign"
    ? new THREE.BoxGeometry(width, height, 0.035)
    : new THREE.PlaneGeometry(width, height, kind === "banner" ? 4 : 1, kind === "banner" ? 5 : 1);
  if (kind === "banner") {
    const attr = geometry.attributes.position;
    for (let index = 0; index < attr.count; index++) {
      const y = attr.getY(index);
      attr.setZ(index, Math.sin(attr.getX(index) * 8 + y * 3) * 0.018 * (1 - y / height));
    }
    attr.needsUpdate = true;
    geometry.computeVertexNormals();
  }
  const map = markTexture(kind, opts);
  const material = new THREE.MeshStandardMaterial({
    color: map ? 0xffffff : (kind === "paper" ? 0xd8c8a7 : 0x755033),
    map,
    roughness: 0.92,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: kind === "decal",
    alphaTest: kind === "decal" ? 0.05 : 0,
  });
  const surface = new THREE.Mesh(geometry, material);
  surface.name = `${kind}-surface`;
  surface.castShadow = kind !== "decal";
  surface.receiveShadow = true;
  surface.userData.genesisProcedural = { channel: kind === "paper" ? "paper" : "cloth", stateRole: "surface" };
  group.add(surface);
  if (kind === "sign") {
    box(group, [0.07, height * 1.45, 0.07], [0, -height * 0.8, -0.01], "structurePrimary", opts, "sign-post");
    socket(group, "floor-mount", [0, -height * 1.52, 0], [0, 0, 0]);
  } else {
    socket(group, kind === "decal" ? "surface-mount" : "top-edge", [0, height / 2, 0], [0, 0, 0]);
  }
  return finish(group);
}

export function createProceduralContainer(kind, options) {
  if (!PROCEDURAL_CONTAINER_KINDS.includes(kind)) throw new Error(`Unknown procedural container: ${kind}`);
  const { group, opts } = begin(kind, options, "container");
  const scale = opts.scale || 1;
  if (kind === "crate") {
    box(group, [0.42, 0.34, 0.38].map((v) => v * scale), [0, 0.17 * scale, 0], "cargo", opts, "crate-body", null, "movable");
    [-1, 1].forEach((side) => box(group, [0.045, 0.38, 0.42].map((v) => v * scale), [side * 0.17 * scale, 0.17 * scale, 0], "structureSecondary", opts, `crate-strap-${side}`));
  } else if (kind === "barrel") {
    const body = taggedMesh(group, new THREE.CylinderGeometry(0.2 * scale, 0.18 * scale, 0.44 * scale, 10), "cargo", opts, "barrel-body", "movable");
    body.position.y = 0.22 * scale;
    [0.05, 0.22, 0.39].forEach((y, index) => cylinder(group, 0.205 * scale, 0.025 * scale, [0, y * scale, 0], "metal", opts, `barrel-hoop-${index + 1}`, "y", 10));
  } else if (kind === "sack") {
    const sack = taggedMesh(group, new THREE.IcosahedronGeometry(0.24 * scale, 1), "cloth", opts, "sack-body", "movable");
    sack.scale.set(0.8, 1.1, 0.72);
    sack.position.y = 0.24 * scale;
    cylinder(group, 0.075 * scale, 0.05 * scale, [0, 0.48 * scale, 0], "structureSecondary", opts, "sack-tie", "y", 6);
  } else if (kind === "jar") {
    const body = taggedMesh(group, new THREE.CylinderGeometry(0.13 * scale, 0.18 * scale, 0.32 * scale, 9), "masonry", opts, "jar-body", "movable");
    body.position.y = 0.16 * scale;
    cylinder(group, 0.09 * scale, 0.1 * scale, [0, 0.37 * scale, 0], "masonry", opts, "jar-neck", "y", 9);
  } else if (kind === "basket") {
    const body = taggedMesh(group, new THREE.CylinderGeometry(0.2 * scale, 0.16 * scale, 0.28 * scale, 8, 1, true), "structureSecondary", opts, "basket-body", "movable");
    body.position.y = 0.14 * scale;
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.19 * scale, 0.018 * scale, 4, 10, Math.PI), materialFor("structureSecondary", opts, "basket-handle"));
    handle.name = "basket-handle";
    handle.userData.genesisProcedural = { channel: "structureSecondary", stateRole: "movable" };
    handle.position.y = 0.27 * scale;
    group.add(handle);
  }
  socket(group, "floor-mount", [0, 0, 0], [0, 0, 0]);
  socket(group, "contents", [0, 0.34 * scale, 0], [0, 0, 0]);
  return finish(group);
}

export function createCargoSocketRack(options) {
  const { group, opts } = begin("cargo-rack", options, "socket-frame");
  const slots = Math.max(1, Math.min(6, opts.slots || 3));
  const spacing = opts.spacing || 0.48;
  const width = (slots - 1) * spacing + 0.48;
  box(group, [width, 0.09, 0.52], [0, 0.045, 0], "structurePrimary", opts, "cargo-rack-bed");
  for (let index = 0; index < slots; index++) {
    const x = (index - (slots - 1) / 2) * spacing;
    box(group, [0.04, 0.13, 0.48], [x, 0.11, 0], "metal", opts, `cargo-divider-${index + 1}`);
    socket(group, "cargo", [x, 0.1, 0], [0, 0, 0], { slot: index });
  }
  socket(group, "chassis", [0, 0, 0], [0, 0, 0]);
  return finish(group);
}

export function createProceduralBarrier(options) {
  const { group, opts } = begin("barrier", options, "stateful-assembly");
  const width = opts.width || 1.45;
  const height = opts.height || 1.05;
  const depth = opts.depth || 0.14;
  const postX = width * 0.43;
  box(group, [width * 0.12, height, depth], [-postX, height / 2, 0], "structurePrimary", opts, "barrier-post-left");
  box(group, [width * 0.12, height, depth], [postX, height / 2, 0], "structurePrimary", opts, "barrier-post-right");
  box(group, [width, height * 0.12, depth], [0, height * 0.94, 0], "structurePrimary", opts, "barrier-header");
  box(group, [width * 0.2, 0.08, depth * 1.4], [-postX, 0.04, 0], "masonry", opts, "barrier-foot-left");
  box(group, [width * 0.2, 0.08, depth * 1.4], [postX, 0.04, 0], "masonry", opts, "barrier-foot-right");

  const leaf = new THREE.Group();
  leaf.name = "barrier-movable-leaf";
  leaf.position.set(-width * 0.34, height * 0.13, 0);
  leaf.userData.genesisProcedural = { channel: "structurePrimary", stateRole: "movable", closure: true };
  rememberBase(leaf);
  const leafWidth = width * 0.68;
  const leafHeight = height * 0.69;
  for (let index = 0; index < 4; index++) {
    box(
      leaf,
      [leafWidth * 0.19, leafHeight, depth * 0.56],
      [leafWidth * (0.13 + index * 0.245), leafHeight / 2, 0],
      "structureSecondary",
      opts,
      `barrier-slat-${index + 1}`,
      null,
      "breachable",
    );
  }
  [0.22, 0.72].forEach((fraction, index) => {
    box(
      leaf,
      [leafWidth, height * 0.105, depth * 0.86],
      [leafWidth / 2, leafHeight * fraction, depth * 0.12],
      "structurePrimary",
      opts,
      `barrier-rail-${index + 1}`,
      null,
      "breachable",
    );
  });
  const latch = createLatch(Object.assign({}, opts, { seedKey: `${opts.seedKey}:barrier-latch` }));
  latch.name = "barrier-latch";
  latch.scale.setScalar(0.68);
  latch.position.set(leafWidth * 0.74, leafHeight * 0.52, depth * 0.52);
  leaf.add(latch);
  group.add(leaf);

  const hingeTop = createHinge(Object.assign({}, opts, { seedKey: `${opts.seedKey}:hinge-top`, height: height * 0.22 }));
  hingeTop.scale.setScalar(0.62);
  hingeTop.position.set(-postX + width * 0.055, height * 0.7, depth * 0.52);
  group.add(hingeTop);
  const hingeBottom = createHinge(Object.assign({}, opts, { seedKey: `${opts.seedKey}:hinge-bottom`, height: height * 0.22 }));
  hingeBottom.scale.setScalar(0.62);
  hingeBottom.position.set(-postX + width * 0.055, height * 0.31, depth * 0.52);
  group.add(hingeBottom);

  socket(group, "passage", [0, 0, 0], [0, 0, 0], { width: leafWidth, height: leafHeight });
  socket(group, "occupant", [-width * 0.2, 0, depth * 1.2], [0, 0, 0], { slot: 0 });
  socket(group, "occupant", [width * 0.2, 0, depth * 1.2], [0, 0, 0], { slot: 1 });
  socket(group, "repair", [0, height * 0.5, depth * 0.7], [0, 0, 0]);
  return finish(group);
}

export function socketsOfProcedural(group, type) {
  const sockets = group?.userData?.sockets || [];
  return type ? sockets.filter((entry) => entry.type === type) : sockets.slice();
}
export function attachProceduralAtSocket(parent, child, type, index) {
  const matches = socketsOfProcedural(parent, type);
  const target = matches[index || 0];
  if (!target) throw new Error(`No ${type} socket ${index || 0} on ${parent?.name || "group"}`);
  child.position.fromArray(target.position);
  child.rotation.set(...target.rotation);
  parent.add(child);
  child.userData.attachedSocket = { type, index: index || 0 };
  return child;
}

function resetState(group) {
  const stale = [];
  group.traverse((node) => {
    if (node.userData?.proceduralStateDressing) stale.push(node);
    const base = node.userData?.proceduralBase;
    if (!base) return;
    node.position.fromArray(base.position);
    node.rotation.set(...base.rotation);
    node.scale.fromArray(base.scale);
    node.visible = base.visible;
    if (node.material && node.userData.proceduralOriginalMaterial) {
      if (node.material !== node.userData.proceduralOriginalMaterial) node.material.dispose?.();
      node.material = node.userData.proceduralOriginalMaterial;
    }
  });
  stale.forEach((node) => node.parent?.remove(node));
}
function stateDressing(group, child) {
  child.userData.proceduralStateDressing = true;
  group.add(child);
  return child;
}
function boundsOf(group) {
  const box3 = new THREE.Box3().setFromObject(group);
  if (box3.isEmpty()) box3.set(new THREE.Vector3(-0.25, 0, -0.25), new THREE.Vector3(0.25, 0.5, 0.25));
  return { box: box3, size: box3.getSize(new THREE.Vector3()), center: box3.getCenter(new THREE.Vector3()) };
}
function movableRootsOf(group) {
  const movable = [];
  group.traverse((node) => {
    if (node.userData?.genesisProcedural?.stateRole !== "movable") return;
    let parent = node.parent;
    while (parent && parent !== group) {
      if (parent.userData?.genesisProcedural?.stateRole === "movable") return;
      parent = parent.parent;
    }
    movable.push(node);
  });
  const closures = movable.filter((node) => node.userData?.genesisProcedural?.closure);
  return closures.length ? closures : movable;
}
function breachableOf(group) {
  const explicit = [];
  const fallback = [];
  group.traverse((node) => {
    if (!node.isMesh || node.userData?.genesisProcedural?.channel === "emission") return;
    fallback.push(node);
    if (node.userData?.genesisProcedural?.stateRole === "breachable") explicit.push(node);
  });
  return explicit.length ? explicit : fallback;
}
function dressingBox(group, size, position, channel, opts, name, rotation) {
  const wrapper = new THREE.Group();
  box(wrapper, size, [0, 0, 0], channel, opts, name, rotation);
  wrapper.position.copy(vector(position));
  return stateDressing(group, wrapper);
}
function dressingBeam(group, from, to, thickness, depth, channel, opts, name) {
  const wrapper = new THREE.Group();
  const mesh = taggedMesh(wrapper, new THREE.BoxGeometry(thickness, 1, depth), channel, opts, name);
  orientBetween(mesh, from, to);
  return stateDressing(group, wrapper);
}
function addRepairDressing(group, bounds, opts) {
  const front = bounds.box.max.z + Math.max(0.035, bounds.size.z * 0.06);
  const insetX = bounds.size.x * 0.18;
  const low = bounds.box.min.y + bounds.size.y * 0.18;
  const high = bounds.box.min.y + bounds.size.y * 0.82;
  const thickness = Math.max(0.055, Math.min(0.11, bounds.size.x * 0.065));
  dressingBeam(group, [bounds.box.min.x + insetX, low, front], [bounds.box.max.x - insetX, high, front], thickness, thickness * 0.5, "structureSecondary", opts, "repair-sister-plank-a");
  dressingBeam(group, [bounds.box.max.x - insetX, low, front + 0.008], [bounds.box.min.x + insetX, high, front + 0.008], thickness, thickness * 0.5, "structureSecondary", opts, "repair-sister-plank-b");
  [-1, 1].forEach((side, index) => {
    dressingBox(
      group,
      [Math.max(0.12, bounds.size.x * 0.16), Math.max(0.16, bounds.size.y * 0.28), 0.035],
      [bounds.center.x + side * bounds.size.x * 0.31, bounds.center.y, front + 0.02],
      "repair",
      opts,
      `repair-patch-plate-${index + 1}`,
      [0, 0, side * 0.08],
    );
  });
  const lash = createProceduralPath("rope", [
    [bounds.center.x - bounds.size.x * 0.22, bounds.center.y - bounds.size.y * 0.05, front + 0.04],
    [bounds.center.x, bounds.center.y + bounds.size.y * 0.13, front + 0.055],
    [bounds.center.x + bounds.size.x * 0.22, bounds.center.y - bounds.size.y * 0.05, front + 0.04],
  ], Object.assign({}, opts, { radius: Math.max(0.014, bounds.size.x * 0.012) }));
  stateDressing(group, lash);
}
function addDamageDressing(group, bounds, opts, movable) {
  movable.forEach((node, index) => {
    node.rotation.z += (index % 2 ? -1 : 1) * 0.16;
    node.rotation.y += (index % 2 ? -1 : 1) * 0.13;
    node.position.y -= Math.max(0.05, bounds.size.y * 0.11);
  });
  const candidates = breachableOf(group);
  if (candidates.length) candidates[Math.floor(candidates.length * 0.55)].visible = false;
  const fallenLength = Math.max(0.35, bounds.size.x * 0.55);
  dressingBox(
    group,
    [fallenLength, Math.max(0.055, bounds.size.y * 0.07), Math.max(0.06, bounds.size.z * 0.55)],
    [bounds.center.x + bounds.size.x * 0.12, bounds.box.min.y + 0.045, bounds.box.max.z + bounds.size.z * 0.5],
    "structureSecondary",
    opts,
    "damage-fallen-member",
    [0.08, 0.28, -0.18],
  );
  for (let index = 0; index < 3; index++) {
    const splinter = createProceduralPart("spike", Object.assign({}, opts, {
      seedKey: `${opts.seedKey}:damage-splinter:${index}`,
      length: 0.16 + index * 0.035,
      radius: 0.028,
      channel: "structureSecondary",
    }));
    splinter.position.set(
      bounds.center.x + (index - 1) * bounds.size.x * 0.12,
      bounds.box.min.y + 0.02,
      bounds.box.max.z + 0.08 + index * 0.035,
    );
    splinter.rotation.set(0.25, index * 0.8, (index - 1) * 0.35);
    stateDressing(group, splinter);
  }
}
function addBreachDressing(group, bounds, opts) {
  const candidates = breachableOf(group);
  group.updateWorldMatrix(true, true);
  const sorted = candidates.map((node) => ({
    node,
    distance: Math.abs(node.getWorldPosition(new THREE.Vector3()).x - bounds.center.x),
  })).sort((a, b) => a.distance - b.distance);
  const removeCount = Math.max(1, Math.ceil(sorted.length * 0.55));
  sorted.slice(0, removeCount).forEach(({ node }) => { node.visible = false; });
  for (let index = 0; index < 7; index++) {
    const width = 0.07 + seededUnit(opts.seedKey, index + 30) * 0.1;
    const wrapper = dressingBox(
      group,
      [width, 0.04 + (index % 2) * 0.025, 0.06 + (index % 3) * 0.025],
      [
        bounds.center.x + (seededUnit(opts.seedKey, index) - 0.5) * bounds.size.x * 1.25,
        bounds.box.min.y + 0.03,
        bounds.box.max.z + 0.1 + seededUnit(opts.seedKey, index + 10) * Math.max(0.2, bounds.size.z * 1.5),
      ],
      index % 3 === 0 ? "repair" : "structurePrimary",
      opts,
      `breach-rubble-${index + 1}`,
      [seededUnit(opts.seedKey, index + 40) * 0.35, seededUnit(opts.seedKey, index + 20) * Math.PI, seededUnit(opts.seedKey, index + 50) * 0.45],
    );
    wrapper.scale.setScalar(0.8 + seededUnit(opts.seedKey, index + 60) * 0.5);
  }
  [-1, 1].forEach((side, index) => {
    const broken = createProceduralPart("spike", Object.assign({}, opts, {
      seedKey: `${opts.seedKey}:breach-stub:${index}`,
      length: Math.max(0.18, bounds.size.y * 0.28),
      radius: Math.max(0.035, bounds.size.x * 0.035),
      channel: "structureSecondary",
    }));
    broken.position.set(bounds.center.x + side * bounds.size.x * 0.2, bounds.center.y, bounds.box.max.z + 0.035);
    broken.rotation.z = side * Math.PI * 0.42;
    stateDressing(group, broken);
  });
}
function addClosedDressing(group, bounds, opts) {
  const front = bounds.box.max.z + Math.max(0.045, bounds.size.z * 0.08);
  dressingBox(
    group,
    [bounds.size.x * 0.96, Math.max(0.09, bounds.size.y * 0.1), Math.max(0.08, bounds.size.z * 0.48)],
    [bounds.center.x, bounds.center.y, front],
    "structurePrimary",
    opts,
    "closed-crossbar",
    [0, 0, 0],
  );
  [-1, 1].forEach((side, index) => {
    dressingBox(
      group,
      [Math.max(0.07, bounds.size.x * 0.06), Math.max(0.18, bounds.size.y * 0.22), 0.04],
      [bounds.center.x + side * bounds.size.x * 0.31, bounds.center.y, front + 0.045],
      "repair",
      opts,
      `closed-crossbar-bracket-${index + 1}`,
    );
  });
  const lock = new THREE.Group();
  box(lock, [0.14, 0.15, 0.07], [0, -0.055, 0], "repair", opts, "closed-padlock-body");
  torus(lock, 0.075, 0.018, [0, 0.075, 0], "repair", opts, "closed-padlock-shackle", null, null, 5, 10, Math.PI);
  lock.position.set(bounds.center.x, bounds.center.y - bounds.size.y * 0.06, front + 0.1);
  stateDressing(group, lock);
}
function addOccupiedDressing(group, bounds, opts) {
  const sockets = [
    ...socketsOfProcedural(group, "occupant"),
    ...socketsOfProcedural(group, "cargo"),
    ...socketsOfProcedural(group, "contents"),
  ];
  const kinds = opts.containerKinds || [opts.containerKind || "crate", "barrel", "sack"];
  const desired = Math.max(2, Math.min(3, sockets.length || 2));
  for (let index = 0; index < desired; index++) {
    const kind = kinds[index % kinds.length];
    const cargo = createProceduralContainer(kind, Object.assign({}, opts, {
      seedKey: `${opts.seedKey}:occupied:${kind}:${index}`,
      scale: Math.max(0.48, Math.min(0.82, bounds.size.x / 1.8)),
    }));
    const target = sockets[index];
    if (target) cargo.position.fromArray(target.position);
    else cargo.position.set(
      bounds.center.x + (index ? 1 : -1) * bounds.size.x * 0.26,
      bounds.box.min.y,
      bounds.box.max.z + 0.18 + index * 0.08,
    );
    stateDressing(group, cargo);
  }
  if (opts.occupiedActivityLight !== false) {
    const activity = createProceduralFx("flame", Object.assign({}, opts, {
      seedKey: `${opts.seedKey}:occupied-light`,
      scale: 0.42,
      lightIntensity: 0.32,
      lightRange: 1.25,
    }));
    activity.position.set(bounds.box.max.x - bounds.size.x * 0.12, bounds.box.max.y + 0.04, bounds.box.max.z + 0.06);
    stateDressing(group, activity);
  }
}
function addAbandonedDressing(group, bounds, opts, movable) {
  group.traverse((node) => {
    if (!node.isMesh || !node.material) return;
    node.userData.proceduralOriginalMaterial ||= node.material;
    node.material = node.material.clone();
    if (node.material.color) {
      node.material.color.multiplyScalar(0.84);
      node.material.color.offsetHSL(0.018, -0.2, -0.015);
    }
    node.material.roughness = Math.min(1, (node.material.roughness || 0.8) + 0.08);
  });
  movable.forEach((node, index) => {
    node.rotation.z += (index % 2 ? 1 : -1) * 0.12;
    node.rotation.y += (index % 2 ? -1 : 1) * 0.2;
    node.position.y -= bounds.size.y * 0.08;
  });
  for (let index = 0; index < 5; index++) {
    const tuft = new THREE.Group();
    const x = bounds.center.x + (seededUnit(opts.seedKey, index) - 0.5) * bounds.size.x * 1.15;
    const z = bounds.center.z + (seededUnit(opts.seedKey, index + 10) - 0.5) * Math.max(0.45, bounds.size.z * 2.2);
    for (let blade = 0; blade < 3; blade++) {
      const stalk = taggedMesh(
        tuft,
        new THREE.ConeGeometry(0.026, 0.24 + blade * 0.05, 4),
        "growth",
        opts,
        `abandoned-growth-${index + 1}-${blade + 1}`,
      );
      stalk.position.set((blade - 1) * 0.035, 0.12 + blade * 0.025, 0);
      stalk.rotation.z = (blade - 1) * 0.28;
    }
    tuft.position.set(x, bounds.box.min.y, z);
    stateDressing(group, tuft);
  }
  const paper = createProceduralSurface("paper", Object.assign({}, opts, { width: 0.25, height: 0.3 }));
  paper.position.set(bounds.box.max.x + 0.06, bounds.box.min.y + 0.025, bounds.box.max.z + 0.18);
  paper.rotation.set(-Math.PI / 2, seededUnit(opts.seedKey, 3) * Math.PI, 0);
  stateDressing(group, paper);
  const slackRope = createProceduralPath("rope", [
    [bounds.box.min.x + bounds.size.x * 0.1, bounds.box.max.y * 0.78, bounds.box.max.z + 0.04],
    [bounds.center.x, bounds.center.y * 0.42, bounds.box.max.z + 0.12],
    [bounds.box.max.x - bounds.size.x * 0.1, bounds.box.min.y + 0.08, bounds.box.max.z + 0.18],
  ], Object.assign({}, opts, { seedKey: `${opts.seedKey}:abandoned-rope`, radius: 0.014 }));
  stateDressing(group, slackRope);
}
function normalizedStateRecipe(recipe) {
  const source = recipe || {};
  const normalized = {
    condition: source.condition || "intact",
    access: source.access || "neutral",
    occupancy: source.occupancy || "vacant",
  };
  if (!PROCEDURAL_CONDITIONS.includes(normalized.condition)) throw new Error(`Unknown procedural condition: ${normalized.condition}`);
  if (!PROCEDURAL_ACCESS_STATES.includes(normalized.access)) throw new Error(`Unknown procedural access state: ${normalized.access}`);
  if (!PROCEDURAL_OCCUPANCY_STATES.includes(normalized.occupancy)) throw new Error(`Unknown procedural occupancy state: ${normalized.occupancy}`);
  return normalized;
}
export function applyProceduralStateRecipe(group, recipe, options) {
  const opts = optsFor(Object.assign({}, group?.userData?.genesisProceduralKit || {}, options || {}));
  const normalized = normalizedStateRecipe(recipe);
  resetState(group);
  const bounds = boundsOf(group);
  const movable = movableRootsOf(group);

  if (normalized.condition === "repaired") addRepairDressing(group, bounds, opts);
  else if (normalized.condition === "damaged") addDamageDressing(group, bounds, opts, movable);
  else if (normalized.condition === "breached") addBreachDressing(group, bounds, opts);
  else if (normalized.condition === "abandoned") addAbandonedDressing(group, bounds, opts, movable);

  if (normalized.access === "open") {
    movable.forEach((node, index) => {
      node.rotation.y += (index % 2 ? 1 : -1) * (opts.openAngle || Math.PI * 0.48);
    });
  } else if (normalized.access === "closed") {
    addClosedDressing(group, bounds, opts);
  }

  if (normalized.occupancy === "occupied") addOccupiedDressing(group, bounds, opts);

  group.userData.genesisProceduralKit.recipe = normalized;
  group.userData.genesisProceduralKit.state = opts.legacyState || [
    normalized.condition,
    normalized.access !== "neutral" ? normalized.access : null,
    normalized.occupancy !== "vacant" ? normalized.occupancy : null,
  ].filter(Boolean).join("+");
  return group;
}
export function applyProceduralState(group, state, options) {
  if (!PROCEDURAL_STATES.includes(state)) throw new Error(`Unknown procedural state: ${state}`);
  const recipe = {
    condition: PROCEDURAL_CONDITIONS.includes(state) ? state : "intact",
    access: state === "open" || state === "closed" ? state : "neutral",
    occupancy: state === "occupied" ? "occupied" : "vacant",
  };
  return applyProceduralStateRecipe(group, recipe, Object.assign({}, options || {}, { legacyState: state }));
}

export function tickProcedural(root, timeSeconds, deltaSeconds) {
  root?.traverse((node) => {
    if (typeof node.userData?.tick === "function") node.userData.tick(timeSeconds, deltaSeconds);
  });
}

export const PROCEDURAL_KIT = Object.freeze({
  createPart: createProceduralPart,
  createPartForUse: createProceduralPartForUse,
  partKindsForUse: proceduralPartKindsForUse,
  createPath: createProceduralPath,
  createFx: createProceduralFx,
  createSurface: createProceduralSurface,
  createContainer: createProceduralContainer,
  createCargoSocketRack,
  createBarrier: createProceduralBarrier,
  applyState: applyProceduralState,
  applyStateRecipe: applyProceduralStateRecipe,
  attachAtSocket: attachProceduralAtSocket,
  socketsOf: socketsOfProcedural,
  tick: tickProcedural,
  partKinds: PROCEDURAL_PART_KINDS,
  partCatalog: PROCEDURAL_PART_CATALOG,
  pathKinds: PROCEDURAL_PATH_KINDS,
  fxKinds: PROCEDURAL_FX_KINDS,
  surfaceKinds: PROCEDURAL_SURFACE_KINDS,
  containerKinds: PROCEDURAL_CONTAINER_KINDS,
  states: PROCEDURAL_STATES,
  conditions: PROCEDURAL_CONDITIONS,
  accessStates: PROCEDURAL_ACCESS_STATES,
  occupancyStates: PROCEDURAL_OCCUPANCY_STATES,
  channels: PROCEDURAL_CHANNELS,
});

if (typeof window !== "undefined") window.TheaterProceduralKit = PROCEDURAL_KIT;
