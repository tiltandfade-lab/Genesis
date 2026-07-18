#!/usr/bin/env node
/* dev/door-workbench/serve.mjs — the KGR-8 door workbench server.
   Adam's one command:   node dev/door-workbench/serve.mjs
   → prints the workbench URL (loopback only, fixed port 5333).

   Pattern: dev/model-foundry/kenney-workbench-server.mjs (the Donor/Socket Workbench server) —
   loopback-only node http, safe static GET/HEAD of this checkout (the engine page, vendored
   three, calibrated GLBs), one narrow write API, atomic rename-into-place JSON writes. Zero
   npm deps.

   API:
     GET  /api/door-mount-lock   → the current lock file (or { exists:false })
     POST /api/door-mount-lock   → { values:{zOffset,depthFrac,overlapW,headDrop,sillHeight,
                                     revealLining}, measured? } → validates, writes
                                     dev/battle-gate/kgr8-clay-room/door-mount-lock.json
                                     (schema genesis.kgr8-door-mount-lock.v1, comment stamped
                                     "Adam's hand placement"). The capture rig consumes the
                                     file on its next run; delete it to fall back to v4. */
import http from "node:http";
import {
  closeSync, createReadStream, existsSync, fsyncSync, openSync, readFileSync, renameSync,
  statSync, unlinkSync, writeFileSync,
} from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const LOCK_PATH = join(ROOT, "dev/battle-gate/kgr8-clay-room/door-mount-lock.json");
const HOST = "127.0.0.1";
const PORT = 5333; // fixed workbench port (clear of the rig's 5241-5245 and the donor workbench's 5187)
const MAX_BODY_BYTES = 256 * 1024;

/* the six named constants Adam's hand sets, with sane hard bounds (the UI stays narrower) */
const VALUE_SPEC = {
  zOffset: { min: -2, max: 2 },        // leaf-center depth offset from slab mid (+ toward room)
  depthFrac: { min: 0.01, max: 1.5 },  // leaf thickness as fraction of slab depth
  overlapW: { min: 0, max: 1 },        // per-side jamb lap
  headDrop: { min: 0, max: 2 },        // leaf top below wall top (head infill above)
  sillHeight: { min: 0, max: 1 },      // sill top above floor top
  revealLining: { boolean: true },     // jamb linings on/off
};

function validateValues(values) {
  const errors = [];
  if (!values || typeof values !== "object" || Array.isArray(values)) return ["values: expected object"];
  for (const key of Object.keys(values)) if (!VALUE_SPEC[key]) errors.push(`values.${key}: unknown field`);
  for (const [key, spec] of Object.entries(VALUE_SPEC)) {
    if (!(key in values)) { errors.push(`values.${key}: missing`); continue; }
    const v = values[key];
    if (spec.boolean) { if (typeof v !== "boolean") errors.push(`values.${key}: expected boolean`); continue; }
    if (typeof v !== "number" || !Number.isFinite(v)) { errors.push(`values.${key}: expected finite number`); continue; }
    if (v < spec.min || v > spec.max) errors.push(`values.${key}: ${v} outside [${spec.min}, ${spec.max}]`);
  }
  return errors;
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value, null, 2) + "\n";
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
/* atomic rename-into-place write — verbatim discipline from the donor workbench server */
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
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${HOST}`);
    if (url.pathname === "/api/door-mount-lock") {
      if (req.method === "GET") {
        if (!existsSync(LOCK_PATH)) return sendJson(res, 200, { exists: false });
        return sendJson(res, 200, { exists: true, lock: JSON.parse(readFileSync(LOCK_PATH, "utf8")) });
      }
      if (req.method === "POST") {
        const body = await bodyJson(req);
        const errors = validateValues(body && body.values);
        if (errors.length) return sendJson(res, 422, { ok: false, errors });
        const now = new Date();
        const lock = {
          schema: "genesis.kgr8-door-mount-lock.v1",
          comment: `${now.toLocaleDateString("en-CA")} — Adam's hand placement (KGR-8 door workbench). ` +
            "Consumed by dev/battle-gate/capture-kgr8-clay-room.mjs: when this file exists its values " +
            "override the kgr8FitLeafToAperture v4 defaults; delete it to fall back to v4.",
          savedAt: now.toISOString(),
          values: {
            zOffset: body.values.zOffset,
            depthFrac: body.values.depthFrac,
            overlapW: body.values.overlapW,
            headDrop: body.values.headDrop,
            sillHeight: body.values.sillHeight,
            revealLining: body.values.revealLining,
          },
          measuredAtSave: body.measured && typeof body.measured === "object" && !Array.isArray(body.measured) ? body.measured : null,
        };
        atomicWriteJson(LOCK_PATH, lock);
        const relPath = relative(ROOT, LOCK_PATH);
        console.log(`[door-workbench] LOCKED ${relPath}: ${JSON.stringify(lock.values)}`);
        return sendJson(res, 200, { ok: true, path: relPath, lock });
      }
      return sendJson(res, 405, { ok: false, error: "method not allowed" });
    }
    if (url.pathname.startsWith("/api/")) return sendJson(res, 404, { ok: false, error: "unknown API" });
    if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 405, { ok: false, error: "static files are read-only" });
    const file = safeStaticPath(ROOT, url.pathname === "/" ? "/dev/door-workbench/workbench.html" : url.pathname);
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

server.listen(PORT, HOST, () => {
  console.log(`KGR-8 door workbench: http://${HOST}:${PORT}/dev/door-workbench/workbench.html`);
  console.log(`lock file target:     ${LOCK_PATH}`);
});
