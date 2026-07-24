/**
 * Deterministic semantic ground profiles for the uneven-ground proof.
 *
 * This is deliberately not "noise makes a landscape." Broad seeded fields supply
 * bounded variation, then semantic features reserve a traversable route and a
 * stable staging pad. The proof reports both the resulting relief and those
 * affordance constraints.
 */

export const GROUND_PROOF_ID = "GENESIS-UNEVEN-GROUND-PROOF-V001";
export const GRID = Object.freeze({
  columns: 65,
  rows: 49,
  widthMeters: 12,
  depthMeters: 9
});
export const MAX_WALKABLE_SLOPE_DEG = 30;

export const GROUND_PROFILES = Object.freeze([
  {
    id: "meadow-road",
    title: "Meadow Road",
    subtitle: "broad swells · shallow swale · preserved travel lane",
    seed: 1731,
    materialFamily: "grass / worn earth",
    maxReliefMeters: 0.9
  },
  {
    id: "upland-ruin",
    title: "Upland Ruin",
    subtitle: "raised knoll · eroded gully · level encounter pad",
    seed: 9427,
    materialFamily: "thin grass / exposed earth / rock",
    maxReliefMeters: 1.6
  },
  {
    id: "shore-margin",
    title: "Shore Margin",
    subtitle: "submerged shelf · wet band · dry bank and camp pad",
    seed: 6319,
    materialFamily: "grass / sand / wet shore",
    maxReliefMeters: 1.25
  }
]);

const profileById = new Map(GROUND_PROFILES.map((profile) => [profile.id, profile]));

function clamp(value, low = 0, high = 1) {
  return Math.max(low, Math.min(high, value));
}

function mix(a, b, amount) {
  return a + (b - a) * amount;
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function hash2(x, z, seed) {
  let value = Math.imul(x | 0, 0x1f123bb5) ^ Math.imul(z | 0, 0x5f356495) ^ (seed | 0);
  value = Math.imul(value ^ (value >>> 15), 0x2c1b3c6d);
  value = Math.imul(value ^ (value >>> 12), 0x297a2d39);
  return ((value ^ (value >>> 15)) >>> 0) / 4294967295;
}

function valueNoise(x, z, seed) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const tx = x - x0;
  const tz = z - z0;
  const sx = tx * tx * (3 - 2 * tx);
  const sz = tz * tz * (3 - 2 * tz);
  const a = mix(hash2(x0, z0, seed), hash2(x0 + 1, z0, seed), sx);
  const b = mix(hash2(x0, z0 + 1, seed), hash2(x0 + 1, z0 + 1, seed), sx);
  return mix(a, b, sz) * 2 - 1;
}

function broadField(x, z, seed) {
  return (
    valueNoise(x * 0.18, z * 0.18, seed) * 0.72
    + valueNoise(x * 0.34 + 7.3, z * 0.34 - 4.1, seed + 97) * 0.28
  );
}

function gaussian(x, z, centerX, centerZ, radiusX, radiusZ) {
  const dx = (x - centerX) / radiusX;
  const dz = (z - centerZ) / radiusZ;
  return Math.exp(-(dx * dx + dz * dz));
}

function meadowSample(x, z, seed) {
  const roadCenter = -0.42 + Math.sin(x * 0.34 + 0.4) * 0.38;
  const roadDistance = Math.abs(z - roadCenter);
  const path = 1 - smoothstep(0.48, 1.12, roadDistance);
  const padDistance = Math.hypot(x - 2.55, z - 1.72);
  const pad = 1 - smoothstep(0.78, 1.42, padDistance);
  const swale = gaussian(x, z, -3.35, 2.05, 2.25, 0.92);
  const macro = (
    broadField(x, z, seed) * 0.2
    + Math.sin(x * 0.42 - z * 0.2) * 0.08
    + Math.cos(z * 0.51 + 0.7) * 0.055
    - swale * 0.16
  );
  const roadTarget = -0.035 + Math.sin(x * 0.16) * 0.055;
  let height = mix(macro, roadTarget, smoothstep(0.08, 0.72, path) * 0.94);
  height = mix(height, 0.105, smoothstep(0.12, 0.8, pad) * 0.985);
  return {
    height,
    path,
    pad,
    wet: clamp(swale * 0.56 - 0.08),
    water: 0,
    transition: clamp(1 - Math.abs(roadDistance - 0.78) / 0.22)
  };
}

function uplandSample(x, z, seed) {
  const approachCenter = 1.38 + Math.sin((z + 3.6) * 0.43) * 0.34;
  const pathDistance = Math.abs(x - approachCenter);
  const path = (1 - smoothstep(0.46, 1.02, pathDistance)) * smoothstep(-1.28, -0.38, z);
  const padDistance = Math.hypot(x - 1.42, z + 0.58);
  const pad = 1 - smoothstep(0.9, 1.58, padDistance);
  const knoll = gaussian(x, z, 0.45, -0.5, 3.9, 3.0);
  const shoulder = gaussian(x, z, -3.45, -1.5, 2.1, 2.9);
  const gullyCenter = 2.12 + Math.sin(x * 0.52 - 0.7) * 0.52;
  const gullyDistance = Math.abs(z - gullyCenter);
  const gully = 1 - smoothstep(0.2, 0.92, gullyDistance);
  let height = (
    broadField(x, z, seed) * 0.27
    + knoll * 0.73
    + shoulder * 0.24
    - gully * 0.34
    - 0.12
  );
  const pathTarget = mix(-0.02, 0.52, 1 - smoothstep(-0.58, 4.2, z));
  height = mix(height, pathTarget, smoothstep(0.08, 0.72, path) * 0.97);
  height = mix(height, 0.53, smoothstep(0.12, 0.8, pad) * 0.99);
  return {
    height,
    path,
    pad,
    wet: clamp(gully * 0.32),
    water: 0,
    transition: clamp(gully)
  };
}

function shoreLineAt(x) {
  return 0.72 + Math.sin(x * 0.48 + 0.2) * 0.5 + Math.sin(x * 0.15 - 1.1) * 0.22;
}

function shoreSample(x, z, seed) {
  const shoreLine = shoreLineAt(x);
  const landDistance = shoreLine - z;
  const water = smoothstep(0.1, -0.62, landDistance);
  const wet = 1 - smoothstep(0.04, 0.58, Math.abs(landDistance));
  const bankRise = smoothstep(-0.42, 2.45, landDistance);
  const inlandRise = smoothstep(1.8, 4.7, landDistance);
  const cove = gaussian(x, z, 2.9, 0.25, 2.15, 1.5);
  let height = (
    -0.31
    + bankRise * 0.59
    + inlandRise * 0.27
    + broadField(x, z, seed) * 0.12 * clamp(bankRise)
    - cove * 0.08
  );

  const pathCenter = -2.45 + Math.sin((z + 1.8) * 0.34) * 0.28;
  const pathDistance = Math.abs(x - pathCenter);
  const path = (1 - smoothstep(0.42, 0.98, pathDistance)) * smoothstep(-0.2, -4.2, z);
  const padDistance = Math.hypot(x + 2.42, z + 2.38);
  const pad = 1 - smoothstep(0.8, 1.42, padDistance);
  const pathTarget = 0.44 + Math.sin(z * 0.13) * 0.035;
  height = mix(height, pathTarget, smoothstep(0.08, 0.72, path) * 0.96);
  height = mix(height, 0.49, smoothstep(0.12, 0.8, pad) * 0.985);

  return {
    height,
    path,
    pad,
    wet,
    water,
    transition: 1 - smoothstep(0.0, 0.72, Math.abs(landDistance))
  };
}

function sampleProfile(profileId, x, z, seed) {
  if (profileId === "meadow-road") return meadowSample(x, z, seed);
  if (profileId === "upland-ruin") return uplandSample(x, z, seed);
  if (profileId === "shore-margin") return shoreSample(x, z, seed);
  throw new Error(`Unknown ground profile: ${profileId}`);
}

function terrainFingerprint(profileId, heights, masks) {
  let hash = 2166136261;
  const fold = (value) => {
    hash ^= value & 0xff;
    hash = Math.imul(hash, 16777619);
    hash ^= (value >>> 8) & 0xff;
    hash = Math.imul(hash, 16777619);
    hash ^= (value >>> 16) & 0xff;
    hash = Math.imul(hash, 16777619);
    hash ^= (value >>> 24) & 0xff;
    hash = Math.imul(hash, 16777619);
  };
  for (const char of profileId) fold(char.charCodeAt(0));
  for (let index = 0; index < heights.length; index += 1) {
    fold(Math.round((heights[index] + 4) * 100000));
    fold(Math.round(masks.path[index] * 10000));
    fold(Math.round(masks.pad[index] * 10000));
    fold(Math.round(masks.water[index] * 10000));
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function summarize(profile, heights, masks, slopes, cellArea) {
  const minimum = Math.min(...heights);
  const maximum = Math.max(...heights);
  const walkable = slopes.filter((slope) => slope <= MAX_WALKABLE_SLOPE_DEG).length;
  const pathSlopes = slopes.filter((_, index) => masks.path[index] >= 0.85);
  const padHeights = heights.filter((_, index) => masks.pad[index] >= 0.85);
  const transitionArea = masks.transition.reduce((sum, mask) => sum + mask * cellArea, 0);
  const waterArea = masks.water.reduce((sum, mask) => sum + mask * cellArea, 0);
  const meanSlope = slopes.reduce((sum, slope) => sum + slope, 0) / slopes.length;
  const meanPathSlope = pathSlopes.reduce((sum, slope) => sum + slope, 0) / pathSlopes.length;
  return {
    profileId: profile.id,
    seed: profile.seed,
    minHeightMeters: Number(minimum.toFixed(4)),
    maxHeightMeters: Number(maximum.toFixed(4)),
    reliefMeters: Number((maximum - minimum).toFixed(4)),
    meanSlopeDegrees: Number(meanSlope.toFixed(3)),
    maxSlopeDegrees: Number(Math.max(...slopes).toFixed(3)),
    walkablePercent: Number((walkable * 100 / slopes.length).toFixed(2)),
    reservedPathPercent: Number((pathSlopes.length * 100 / slopes.length).toFixed(2)),
    reservedPathMeanSlopeDegrees: Number(meanPathSlope.toFixed(3)),
    reservedPathMaxSlopeDegrees: Number(Math.max(...pathSlopes).toFixed(3)),
    encounterPadRangeMeters: Number((Math.max(...padHeights) - Math.min(...padHeights)).toFixed(5)),
    transitionAreaSquareMeters: Number(transitionArea.toFixed(3)),
    waterAreaSquareMeters: Number(waterArea.toFixed(3)),
    maximumAllowedReliefMeters: profile.maxReliefMeters
  };
}

export function generateGround(profileId) {
  const profile = profileById.get(profileId);
  if (!profile) throw new Error(`Unknown ground profile: ${profileId}`);
  const { columns, rows, widthMeters, depthMeters } = GRID;
  const stepX = widthMeters / (columns - 1);
  const stepZ = depthMeters / (rows - 1);
  const heights = [];
  const masks = { path: [], pad: [], wet: [], water: [], transition: [] };

  for (let row = 0; row < rows; row += 1) {
    const z = -depthMeters / 2 + row * stepZ;
    for (let column = 0; column < columns; column += 1) {
      const x = -widthMeters / 2 + column * stepX;
      const sample = sampleProfile(profileId, x, z, profile.seed);
      heights.push(sample.height);
      for (const key of Object.keys(masks)) masks[key].push(sample[key]);
    }
  }

  const slopes = new Array(heights.length).fill(0);
  const at = (column, row) => heights[
    Math.max(0, Math.min(rows - 1, row)) * columns
      + Math.max(0, Math.min(columns - 1, column))
  ];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const dhdx = (at(column + 1, row) - at(column - 1, row)) / (2 * stepX);
      const dhdz = (at(column, row + 1) - at(column, row - 1)) / (2 * stepZ);
      slopes[row * columns + column] = Math.atan(Math.hypot(dhdx, dhdz)) * 180 / Math.PI;
    }
  }

  const metrics = summarize(profile, heights, masks, slopes, stepX * stepZ);
  const fingerprint = terrainFingerprint(profileId, heights, masks);
  return {
    proofId: GROUND_PROOF_ID,
    profile,
    grid: { ...GRID, stepX, stepZ },
    heights,
    slopes,
    masks,
    metrics: { ...metrics, fingerprint }
  };
}

export function groundHeightAt(ground, x, z) {
  const { columns, rows, widthMeters, depthMeters, stepX, stepZ } = ground.grid;
  const gx = clamp((x + widthMeters / 2) / stepX, 0, columns - 1);
  const gz = clamp((z + depthMeters / 2) / stepZ, 0, rows - 1);
  const x0 = Math.floor(gx);
  const z0 = Math.floor(gz);
  const x1 = Math.min(columns - 1, x0 + 1);
  const z1 = Math.min(rows - 1, z0 + 1);
  const tx = gx - x0;
  const tz = gz - z0;
  const at = (column, row) => ground.heights[row * columns + column];
  return mix(
    mix(at(x0, z0), at(x1, z0), tx),
    mix(at(x0, z1), at(x1, z1), tx),
    tz
  );
}
