/* dev/geometry-research/bakeoff/require-lib-tools.mjs — UNIT R1 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md
   §13.4, the four-path geometry bakeoff).

   Resolves the four geometry-candidate libraries (polygon-clipping, earcut, clipper2-ts,
   robust-predicates) from the R0 scratch tool home (GEOMETRY_TOOLS_HOME, default
   ~/.genesis-geometry-tools) via createRequire, mirroring dev/geometry-research/fuzz/require-tools.mjs's
   own resolvePkgJson()/loadFastCheck() pattern exactly. This module does not vendor or npm-install
   anything — R0's setup.mjs only materializes the Phase-0 DEV tools (fast-check/webgl-lint/pixelmatch);
   the geometry candidates are R1's own job to install into the SAME tool home (pins.json's
   `geometryCandidates` block is provenance-only until R1 spikes them — see pins.json's own
   `_role` comment). If a pin is missing, every caller gets a loud, actionable error — never a silent
   fallback to some other resolution, never a fabricated pass.

   Exact pinned versions (dev/geometry-tools/pins.json `geometryCandidates`), installed into
   GEOMETRY_TOOLS_HOME by this unit's own setup step (see README.md):
     polygon-clipping@0.15.7, earcut@3.2.3, clipper2-ts@2.0.1-18 (gitHead bf6e0303217bdffcbe2f03ab7f6218194df8e7e4,
     no tagged GitHub release — pin the commit per pins.json), robust-predicates@3.0.3 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const toolHome =
  process.env.GEOMETRY_TOOLS_HOME || path.join(os.homedir(), ".genesis-geometry-tools");

const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO_ROOT = path.join(HERE, "..", "..", "..");
const PINS = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, "dev/geometry-tools/pins.json"), "utf8")
).geometryCandidates;

function resolvePkgJson(pkgName) {
  const toolHomePkgJson = path.join(toolHome, "package.json");
  if (!fs.existsSync(toolHomePkgJson)) return null;
  const req = createRequire(toolHomePkgJson);
  let entry = null;
  try {
    entry = req.resolve(pkgName);
  } catch {
    // ESM-only packages (exports field with no "require" condition, e.g. clipper2-ts) fail CJS
    // resolution entirely — fall through to the direct node_modules/<pkg>/package.json read below
    // rather than giving up (the walk-up loop needs `entry` as a starting point it never gets here).
  }
  if (entry) {
    let cursor = path.dirname(entry);
    while (cursor !== path.dirname(cursor)) {
      const candidate = path.join(cursor, "package.json");
      if (fs.existsSync(candidate)) {
        const pkg = JSON.parse(fs.readFileSync(candidate, "utf8"));
        if (pkg.name === pkgName) return { pkg, dir: cursor, entry };
      }
      cursor = path.dirname(cursor);
    }
  }
  const directDir = path.join(toolHome, "node_modules", pkgName);
  const direct = path.join(directDir, "package.json");
  if (fs.existsSync(direct)) {
    return { pkg: JSON.parse(fs.readFileSync(direct, "utf8")), dir: directDir, entry };
  }
  return null;
}

function requirePin(pkgName) {
  const pin = PINS[pkgName];
  if (!pin) throw new Error(`no pins.json geometryCandidates entry for "${pkgName}"`);
  return pin;
}

function loudMissing(pkgName) {
  const pin = requirePin(pkgName);
  throw new Error(
    `${pkgName} not resolvable under GEOMETRY_TOOLS_HOME (${toolHome}). ` +
      `Run: cd "${toolHome}" && npm install --save-exact --ignore-scripts ${pin.package}@${pin.version}. ` +
      `R1 never falls back to an ambient/global resolution.`
  );
}

function checkVersion(pkgName, found) {
  const pin = requirePin(pkgName);
  if (found.pkg.version !== pin.version) {
    throw new Error(
      `${pkgName}: GEOMETRY_TOOLS_HOME has ${found.pkg.version} but pins.json pins ${pin.version}. ` +
        `Reinstall the exact pin before running the bakeoff — a resolver substitution is a drift bug.`
    );
  }
}

/** loadPolygonClipping() -> the polygon-clipping CJS module (union/intersection/xor/difference). */
export async function loadPolygonClipping() {
  const found = resolvePkgJson("polygon-clipping");
  if (!found) loudMissing("polygon-clipping");
  checkVersion("polygon-clipping", found);
  const mod = await import(pathToFileURL(found.entry).href);
  const pc = mod.default ?? mod;
  if (typeof pc.union !== "function") throw new Error(`resolved polygon-clipping at ${found.entry} but no .union export`);
  return { pc, version: found.pkg.version };
}

/** loadEarcut() -> { earcut(vertices,holes,dim), flatten(polygonRings), deviation(...) }. */
export async function loadEarcut() {
  const found = resolvePkgJson("earcut");
  if (!found) loudMissing("earcut");
  checkVersion("earcut", found);
  const mod = await import(pathToFileURL(found.entry).href);
  const earcut = mod.default;
  if (typeof earcut !== "function" || typeof mod.flatten !== "function") {
    throw new Error(`resolved earcut at ${found.entry} but missing default export or .flatten`);
  }
  return { earcut, flatten: mod.flatten, deviation: mod.deviation, version: found.pkg.version };
}

/** loadClipper2() -> the full clipper2-ts ESM namespace (booleans, ClipperOffset/inflatePaths, triangulate/Delaunay). */
export async function loadClipper2() {
  const found = resolvePkgJson("clipper2-ts");
  if (!found) loudMissing("clipper2-ts");
  checkVersion("clipper2-ts", found);
  // clipper2-ts is ESM-only ("type":"module", exports["."]["import"] only) — resolve its real entry
  // file directly rather than through createRequire.resolve (which targets CJS resolution rules).
  const entryFile = path.join(found.dir, "dist", "index.js");
  if (!fs.existsSync(entryFile)) throw new Error(`clipper2-ts resolved at ${found.dir} but dist/index.js is missing`);
  const C = await import(pathToFileURL(entryFile).href);
  if (typeof C.union !== "function" || typeof C.inflatePaths !== "function" || typeof C.triangulate !== "function") {
    throw new Error(`resolved clipper2-ts at ${entryFile} but missing union/inflatePaths/triangulate`);
  }
  return { C, version: found.pkg.version };
}

/** loadRobustPredicates() -> { orient2d(ax,ay,bx,by,cx,cy) -> signed double-area (>0 CCW, <0 CW, 0 collinear) }. */
export async function loadRobustPredicates() {
  const found = resolvePkgJson("robust-predicates");
  if (!found) loudMissing("robust-predicates");
  checkVersion("robust-predicates", found);
  const mod = await import(pathToFileURL(found.entry).href);
  const rp = mod.default ?? mod;
  if (typeof rp.orient2d !== "function") throw new Error(`resolved robust-predicates at ${found.entry} but no .orient2d export`);
  return { rp, version: found.pkg.version };
}

export { toolHome };
