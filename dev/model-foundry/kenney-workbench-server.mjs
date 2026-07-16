#!/usr/bin/env node
/* KGR-4A loopback-only server for the Kenney donor/socket workbench.

   API ownership is intentionally narrow: GET the complete calibration document, validate one
   census-backed asset record without writing, or atomically replace exactly that one record. Static
   GET/HEAD requests serve this checkout so the workbench can load the pinned renderer and source
   GLBs; no non-API method can mutate the filesystem. */
import http from "node:http";
import { createHash } from "node:crypto";
import {
  closeSync, createReadStream, existsSync, fsyncSync, openSync, readFileSync, renameSync,
  statSync, unlinkSync, writeFileSync,
} from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, "../..");
const DEFAULT_CALIBRATION = join(HERE, "kenney-calibration.json");
const DEFAULT_CENSUS = join(HERE, "kenney-census.json");
const HOST = "127.0.0.1";
const DEFAULT_PORT = 5187;
const MAX_BODY_BYTES = 1024 * 1024;
const MATERIALS = new Set(["stone", "wood", "iron", "roof", "glass", "cloth"]);
const ADMISSION = new Set(["DIRECT_MODULATED", "PART_DONOR", "CHASSIS"]);
const QA = new Set(["needs-review", "approved-dev", "approved-runtime", "quarantined"]);
const SOCKET_TYPES = new Set(["floor-mount", "wall-mount", "top-surface", "hinge"]);
const MATE_RULES = new Set(["coincident", "opposed-z"]);
const ASSET_KEYS = new Set([
  "sourceSha256", "admissionClass", "category", "rootMaterialFamily", "preTransform",
  "scaleReason", "groundOffset", "semanticParts", "sockets", "footprintOverride", "qaStatus",
  "notes", "companionLeaf",
]);
const PART_KEYS = new Set(["nodePath", "detachable", "materialFamily"]);
const SOCKET_KEYS = new Set(["id", "type", "position", "rotation", "mateRule", "mateFamily", "size", "clearance"]);
const CLEARANCE_KEYS = new Set(["shape", "size"]);
const TRS_KEYS = new Set(["translation", "rotation", "scale"]);
const FOOTPRINT_KEYS = new Set(["center", "halfExtents", "yawRadians"]);
const PACK_KEYS = new Set(["sourceUp", "sourceForward", "canonicalScale", "structuralGrid"]);
const GRID_KEYS = new Set(["sourceModuleUnits", "targetWorldUnits", "orientationSteps", "joinMode"]);

function object(value) { return !!value && typeof value === "object" && !Array.isArray(value); }
function finite(value) { return typeof value === "number" && Number.isFinite(value); }
function vec(value, length, positive = false) {
  return Array.isArray(value) && value.length === length && value.every((v) => finite(v) && (!positive || v > 0));
}
function unknownKeys(value, allowed, path, errors) {
  if (!object(value)) return;
  for (const key of Object.keys(value)) if (!allowed.has(key)) errors.push(`${path}: unknown field ${key}`);
}
function normalizedQuat(value, path, errors) {
  if (!vec(value, 4)) { errors.push(`${path}: expected four finite numbers`); return; }
  const norm = Math.hypot(...value);
  if (Math.abs(norm - 1) >= 1e-5) errors.push(`${path}: quaternion norm ${norm} is not normalized`);
}

export function validateAssetRecord(assetId, record, censusEntry = null, packRecord = null) {
  const errors = [];
  if (typeof assetId !== "string" || !assetId || assetId.includes("..") || assetId.includes("\\") ||
      assetId.startsWith("/") || assetId.endsWith("/") || assetId.split("/").length !== 2) {
    errors.push("assetId: expected one pack/slug census id without traversal");
  }
  if (!object(record)) return ["record: expected object"];
  unknownKeys(record, ASSET_KEYS, "record", errors);
  for (const key of ["sourceSha256", "admissionClass", "category", "rootMaterialFamily", "preTransform", "scaleReason", "groundOffset", "semanticParts", "sockets", "footprintOverride", "qaStatus", "notes"]) {
    if (!(key in record)) errors.push(`record: missing ${key}`);
  }
  if (!/^[0-9a-f]{64}$/.test(record.sourceSha256 || "")) errors.push("record.sourceSha256: expected 64 lowercase hex");
  if (censusEntry && record.sourceSha256 !== censusEntry.sha256) errors.push("record.sourceSha256: mismatch with census");
  if (!ADMISSION.has(record.admissionClass)) errors.push("record.admissionClass: invalid value");
  if (typeof record.category !== "string" || !record.category.trim()) errors.push("record.category: expected nonempty string");
  if (!MATERIALS.has(record.rootMaterialFamily)) errors.push("record.rootMaterialFamily: invalid value");
  if (!object(record.preTransform)) errors.push("record.preTransform: expected object");
  else {
    unknownKeys(record.preTransform, TRS_KEYS, "record.preTransform", errors);
    if (!vec(record.preTransform.translation, 3)) errors.push("record.preTransform.translation: expected vec3");
    normalizedQuat(record.preTransform.rotation, "record.preTransform.rotation", errors);
    if (!vec(record.preTransform.scale, 3, true)) errors.push("record.preTransform.scale: expected positive vec3");
    else {
      const [x, y, z] = record.preTransform.scale;
      if (Math.max(x, y, z) - Math.min(x, y, z) > 1e-9) errors.push("record.preTransform.scale: nonuniform scale is forbidden");
      const nonidentity = Math.abs(x - 1) > 1e-9;
      if (record.admissionClass === "DIRECT_MODULATED" && nonidentity) errors.push("record.preTransform.scale: DIRECT_MODULATED requires identity scale");
      if (record.admissionClass !== "DIRECT_MODULATED" && nonidentity && !(typeof record.scaleReason === "string" && record.scaleReason.trim())) errors.push("record.scaleReason: required for nonidentity scale");
    }
  }
  if (!(record.scaleReason === null || typeof record.scaleReason === "string")) errors.push("record.scaleReason: expected string or null");
  if (!finite(record.groundOffset)) errors.push("record.groundOffset: expected finite number");
  if (!object(record.semanticParts)) errors.push("record.semanticParts: expected object");
  else for (const [name, part] of Object.entries(record.semanticParts)) {
    if (!name) errors.push("record.semanticParts: empty part id");
    if (!object(part)) { errors.push(`record.semanticParts.${name}: expected object`); continue; }
    unknownKeys(part, PART_KEYS, `record.semanticParts.${name}`, errors);
    if (typeof part.nodePath !== "string" || !part.nodePath) errors.push(`record.semanticParts.${name}.nodePath: expected nonempty string`);
    if (typeof part.detachable !== "boolean") errors.push(`record.semanticParts.${name}.detachable: expected boolean`);
    if (!MATERIALS.has(part.materialFamily)) errors.push(`record.semanticParts.${name}.materialFamily: invalid value`);
  }
  if (!Array.isArray(record.sockets)) errors.push("record.sockets: expected array");
  else {
    const ids = new Set();
    record.sockets.forEach((socket, index) => {
      const path = `record.sockets[${index}]`;
      if (!object(socket)) { errors.push(`${path}: expected object`); return; }
      unknownKeys(socket, SOCKET_KEYS, path, errors);
      for (const key of SOCKET_KEYS) if (!(key in socket)) errors.push(`${path}: missing ${key}`);
      if (typeof socket.id !== "string" || !socket.id.trim()) errors.push(`${path}.id: expected nonempty string`);
      else if (ids.has(socket.id)) errors.push(`${path}.id: duplicate socket id`); else ids.add(socket.id);
      if (!SOCKET_TYPES.has(socket.type)) errors.push(`${path}.type: invalid value`);
      if (!vec(socket.position, 3)) errors.push(`${path}.position: expected vec3`);
      normalizedQuat(socket.rotation, `${path}.rotation`, errors);
      if (!MATE_RULES.has(socket.mateRule)) errors.push(`${path}.mateRule: invalid value`);
      if (typeof socket.mateFamily !== "string" || !socket.mateFamily.trim()) errors.push(`${path}.mateFamily: expected nonempty string`);
      if (!vec(socket.size, 3, true)) errors.push(`${path}.size: expected positive vec3`);
      if (!object(socket.clearance)) errors.push(`${path}.clearance: expected object`);
      else {
        unknownKeys(socket.clearance, CLEARANCE_KEYS, `${path}.clearance`, errors);
        if (socket.clearance.shape !== "box") errors.push(`${path}.clearance.shape: expected box`);
        if (!vec(socket.clearance.size, 3, true)) errors.push(`${path}.clearance.size: expected positive vec3`);
      }
    });
  }
  if (record.footprintOverride !== null) {
    if (!object(record.footprintOverride)) errors.push("record.footprintOverride: expected object or null");
    else {
      unknownKeys(record.footprintOverride, FOOTPRINT_KEYS, "record.footprintOverride", errors);
      if (!vec(record.footprintOverride.center, 2)) errors.push("record.footprintOverride.center: expected vec2");
      if (!vec(record.footprintOverride.halfExtents, 2, true)) errors.push("record.footprintOverride.halfExtents: expected positive vec2");
      if (!finite(record.footprintOverride.yawRadians)) errors.push("record.footprintOverride.yawRadians: expected finite number");
    }
  }
  if (!QA.has(record.qaStatus)) errors.push("record.qaStatus: invalid value");
  if (!Array.isArray(record.notes) || !record.notes.every((v) => typeof v === "string")) errors.push("record.notes: expected string array");
  if (!(record.companionLeaf === undefined || record.companionLeaf === null || typeof record.companionLeaf === "string")) errors.push("record.companionLeaf: expected string or null");
  if (packRecord === null) errors.push("assetId: pack has no calibration record");
  return errors;
}

export function validatePackRecord(record) {
  const errors = [];
  if (!object(record)) return ["packRecord: expected object"];
  unknownKeys(record, PACK_KEYS, "packRecord", errors);
  for (const key of PACK_KEYS) if (!(key in record)) errors.push(`packRecord: missing ${key}`);
  if (record.sourceUp !== "+Y") errors.push("packRecord.sourceUp: expected +Y");
  if (record.sourceForward !== "+Z") errors.push("packRecord.sourceForward: expected +Z");
  if (!finite(record.canonicalScale) || record.canonicalScale <= 0) errors.push("packRecord.canonicalScale: expected positive finite number");
  if (record.structuralGrid !== null) {
    if (!object(record.structuralGrid)) errors.push("packRecord.structuralGrid: expected object or null");
    else {
      unknownKeys(record.structuralGrid, GRID_KEYS, "packRecord.structuralGrid", errors);
      for (const key of GRID_KEYS) if (!(key in record.structuralGrid)) errors.push(`packRecord.structuralGrid: missing ${key}`);
      if (!finite(record.structuralGrid.sourceModuleUnits) || record.structuralGrid.sourceModuleUnits <= 0) errors.push("packRecord.structuralGrid.sourceModuleUnits: expected positive finite number");
      if (!finite(record.structuralGrid.targetWorldUnits) || record.structuralGrid.targetWorldUnits <= 0) errors.push("packRecord.structuralGrid.targetWorldUnits: expected positive finite number");
      if (record.structuralGrid.orientationSteps !== 4) errors.push("packRecord.structuralGrid.orientationSteps: expected 4");
      if (record.structuralGrid.joinMode !== "cell-orientation") errors.push("packRecord.structuralGrid.joinMode: expected cell-orientation");
      if (finite(record.canonicalScale) && finite(record.structuralGrid.sourceModuleUnits) && finite(record.structuralGrid.targetWorldUnits) &&
          Math.abs(record.canonicalScale * record.structuralGrid.sourceModuleUnits - record.structuralGrid.targetWorldUnits) > 1e-6) {
        errors.push("packRecord.structuralGrid: canonicalScale * sourceModuleUnits must equal targetWorldUnits");
      }
    }
  }
  return errors;
}

export function validateCalibrationDocument(document, inventory) {
  const errors = [];
  if (!object(document)) return ["calibration: expected object"];
  unknownKeys(document, new Set(["schema", "algorithmVersion", "packs", "assets"]), "calibration", errors);
  for (const key of ["schema", "algorithmVersion", "packs", "assets"]) if (!(key in document)) errors.push(`calibration: missing ${key}`);
  if (document.schema !== "genesis.kenney-calibration.v1") errors.push("calibration.schema: invalid value");
  if (!Number.isInteger(document.algorithmVersion) || document.algorithmVersion < 1) errors.push("calibration.algorithmVersion: expected integer >= 1");
  if (!object(document.packs) || !Object.keys(document.packs).length) errors.push("calibration.packs: expected nonempty object");
  else for (const [packId, pack] of Object.entries(document.packs)) {
    if (!packId || packId.includes("..") || packId.includes("/") || packId.includes("\\")) errors.push(`calibration.packs.${packId}: invalid pack id`);
    errors.push(...validatePackRecord(pack).map((error) => `calibration.packs.${packId}: ${error.replace(/^packRecord:\s*/, "")}`));
  }
  if (!object(document.assets) || !Object.keys(document.assets).length) errors.push("calibration.assets: expected nonempty object");
  else for (const [assetId, record] of Object.entries(document.assets)) {
    const entry = inventory.get(assetId), packId = assetId.split("/")[0], pack = document.packs?.[packId] || null;
    if (!entry) { errors.push(`calibration.assets.${assetId}: unknown source inventory id`); continue; }
    errors.push(...validateAssetRecord(assetId, record, entry, pack).map((error) => `calibration.assets.${assetId}: ${error.replace(/^record\.?/, "")}`));
  }
  return errors;
}

function censusMap(census) {
  const map = new Map();
  for (const entry of census.assets || []) {
    const slug = String(entry.name || "").replace(/\.glb$/i, "");
    map.set(`${entry.pack}/${slug}`, entry);
  }
  return map;
}
function sourceInventory(census, calibration, root) {
  const map = censusMap(census);
  for (const [assetId, record] of Object.entries(calibration.assets || {})) {
    if (map.has(assetId)) continue;
    const [pack, slug] = assetId.split("/");
    const path = join(root, "assets/models", pack, `${slug}.glb`);
    if (!existsSync(path)) continue;
    const actual = createHash("sha256").update(readFileSync(path)).digest("hex");
    if (actual === record.sourceSha256) map.set(assetId, { pack, name:`${slug}.glb`, path:relative(root,path), sha256:actual, role:record.category, normalizedOnly:true });
  }
  return map;
}
function sendJson(res, status, value) {
  const body = JSON.stringify(value) + "\n";
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body), "Cache-Control": "no-store" });
  res.end(body);
}
async function bodyJson(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error("request body too large"), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw Object.assign(new Error("invalid JSON"), { status: 400 }); }
}
function atomicWriteJson(path, value) {
  const dir = dirname(path);
  const temp = join(dir, `.${relative(dir, path)}.${process.pid}.${Date.now()}.tmp`);
  let fd = null;
  try {
    fd = openSync(temp, "wx", 0o600);
    writeFileSync(fd, JSON.stringify(value, null, 2) + "\n", "utf8");
    fsyncSync(fd); closeSync(fd); fd = null;
    renameSync(temp, path);
    const dirFd = openSync(dir, "r");
    try { fsyncSync(dirFd); } finally { closeSync(dirFd); }
  } catch (error) {
    if (fd !== null) closeSync(fd);
    if (existsSync(temp)) unlinkSync(temp);
    throw error;
  }
}
function safeStaticPath(root, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  if (decoded.includes("\0") || decoded.includes("\\")) return null;
  const candidate = resolve(root, "." + decoded);
  return candidate === root || candidate.startsWith(root + sep) ? candidate : null;
}
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".glb": "model/gltf-binary", ".png": "image/png", ".css": "text/css; charset=utf-8",
};

export function createWorkbenchServer(options = {}) {
  const root = resolve(options.root || DEFAULT_ROOT);
  const calibrationPath = resolve(options.calibrationPath || DEFAULT_CALIBRATION);
  const censusPath = resolve(options.censusPath || DEFAULT_CENSUS);
  const readCalibration = () => JSON.parse(readFileSync(calibrationPath, "utf8"));
  const census = JSON.parse(readFileSync(censusPath, "utf8"));
  const censusById = sourceInventory(census, readCalibration(), root);
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${HOST}`);
      if (url.pathname === "/api/calibration") {
        if (req.method !== "GET") return sendJson(res, 405, { ok: false, error: "method not allowed" });
        return sendJson(res, 200, readCalibration());
      }
      if (url.pathname === "/api/validate") {
        if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method not allowed" });
        const body = await bodyJson(req), calibration = readCalibration();
        if (!object(body) || typeof body.assetId !== "string" || !object(body.record)) return sendJson(res, 400, { ok: false, errors: ["body: expected {assetId, record}"] });
        const censusEntry = censusById.get(body.assetId);
        if (!censusEntry) return sendJson(res, 404, { ok: false, errors: ["assetId: unknown census id"] });
        const packId = body.assetId.split("/")[0], existingPack = calibration.packs?.[packId] || null;
        let packRecord = existingPack;
        const errors = [];
        unknownKeys(body, new Set(["assetId", "record", "packRecord"]), "body", errors);
        if (existingPack && body.packRecord !== undefined) errors.push("packRecord: forbidden for existing pack");
        if (!existingPack && body.packRecord === undefined) errors.push("packRecord: required for new pack");
        if (!existingPack && body.packRecord !== undefined) { packRecord = body.packRecord; errors.push(...validatePackRecord(packRecord)); }
        errors.push(...validateAssetRecord(body.assetId, body.record, censusEntry, packRecord));
        if (!errors.length) {
          const next = { ...calibration, packs:existingPack?calibration.packs:{...calibration.packs,[packId]:packRecord}, assets:{...calibration.assets,[body.assetId]:body.record} };
          errors.push(...validateCalibrationDocument(next, censusById));
        }
        return sendJson(res, errors.length ? 422 : 200, { ok: !errors.length, errors });
      }
      if (url.pathname.startsWith("/api/calibration/")) {
        if (req.method !== "PUT") return sendJson(res, 405, { ok: false, error: "method not allowed" });
        const encoded = url.pathname.slice("/api/calibration/".length);
        let assetId;
        try { assetId = decodeURIComponent(encoded); } catch { return sendJson(res, 400, { ok: false, error: "invalid asset id encoding" }); }
        if (!assetId || assetId.includes("..") || assetId.includes("\\") || assetId.includes("\0") || assetId.startsWith("/") || assetId.endsWith("/") || assetId.split("/").length !== 2) {
          return sendJson(res, 400, { ok: false, error: "invalid or traversing asset id" });
        }
        const censusEntry = censusById.get(assetId);
        if (!censusEntry) return sendJson(res, 404, { ok: false, error: "unknown census asset id" });
        const body = await bodyJson(req);
        if (!object(body) || !object(body.record) || typeof body.expectedSourceSha256 !== "string") return sendJson(res, 400, { ok: false, error: "expected {expectedSourceSha256, record}" });
        if (body.expectedSourceSha256 !== censusEntry.sha256 || body.record.sourceSha256 !== censusEntry.sha256) return sendJson(res, 409, { ok: false, error: "source hash mismatch" });
        const calibration = readCalibration();
        const packId = assetId.split("/")[0], existingPack = calibration.packs?.[packId] || null;
        let packRecord = existingPack;
        const errors = [];
        unknownKeys(body, new Set(["expectedSourceSha256", "record", "packRecord"]), "body", errors);
        if (existingPack && body.packRecord !== undefined) errors.push("packRecord: forbidden for existing pack");
        if (!existingPack && body.packRecord === undefined) errors.push("packRecord: required for new pack");
        if (!existingPack && body.packRecord !== undefined) { packRecord = body.packRecord; errors.push(...validatePackRecord(packRecord)); }
        errors.push(...validateAssetRecord(assetId, body.record, censusEntry, packRecord));
        if (errors.length) return sendJson(res, 422, { ok: false, errors });
        const beforeAssets = calibration.assets || {};
        const beforePacks = calibration.packs || {};
        const next = {
          ...calibration,
          packs: existingPack ? beforePacks : { ...beforePacks, [packId]: packRecord },
          assets: { ...beforeAssets, [assetId]: body.record },
        };
        for (const key of Object.keys(beforeAssets)) if (key !== assetId && JSON.stringify(next.assets[key]) !== JSON.stringify(beforeAssets[key])) throw new Error(`write contract violated at ${key}`);
        for (const key of Object.keys(beforePacks)) if (JSON.stringify(next.packs[key]) !== JSON.stringify(beforePacks[key])) throw new Error(`write contract violated at pack ${key}`);
        const addedAssets = Object.keys(next.assets).filter((key) => !(key in beforeAssets));
        const addedPacks = Object.keys(next.packs).filter((key) => !(key in beforePacks));
        if (addedAssets.length > (assetId in beforeAssets ? 0 : 1) || addedPacks.length > (existingPack ? 0 : 1)) throw new Error("write contract violated: transaction escaped one pack + one asset");
        const documentErrors = validateCalibrationDocument(next, censusById);
        if (documentErrors.length) return sendJson(res, 422, { ok:false, errors:documentErrors });
        atomicWriteJson(calibrationPath, next);
        return sendJson(res, 200, { ok: true, assetId, record: body.record, packAdded: !existingPack });
      }
      if (url.pathname.startsWith("/api/")) return sendJson(res, 404, { ok: false, error: "unknown API" });
      if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 405, { ok: false, error: "static files are read-only" });
      const file = safeStaticPath(root, url.pathname === "/" ? "/dev/model-foundry/kenney-workbench.html" : url.pathname);
      if (!file) return sendJson(res, 403, { ok: false, error: "traversal rejected" });
      let stat;
      try { stat = statSync(file); } catch { return sendJson(res, 404, { ok: false, error: "not found" }); }
      if (!stat.isFile()) return sendJson(res, 404, { ok: false, error: "not found" });
      res.writeHead(200, { "Content-Type": MIME[extname(file).toLowerCase()] || "application/octet-stream", "Content-Length": stat.size, "Cache-Control": "no-store" });
      if (req.method === "HEAD") return res.end();
      createReadStream(file).pipe(res);
    } catch (error) {
      sendJson(res, error.status || 500, { ok: false, error: error.message || String(error) });
    }
  });
  return server;
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--port") options.port = Number(argv[++i]);
    else if (argv[i] === "--root") options.root = argv[++i];
    else if (argv[i] === "--calibration") options.calibrationPath = argv[++i];
    else if (argv[i] === "--census") options.censusPath = argv[++i];
    else throw new Error(`unknown argument ${argv[i]}`);
  }
  return options;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const port = Number.isInteger(options.port) && options.port >= 0 && options.port <= 65535 ? options.port : DEFAULT_PORT;
  const server = createWorkbenchServer(options);
  server.listen(port, HOST, () => {
    const address = server.address();
    process.stdout.write(`Kenney workbench: http://${HOST}:${address.port}/dev/model-foundry/kenney-workbench.html\n`);
  });
}
