/* dev/geometry-research/fuzz/require-tools.mjs — UNIT R2 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md
   §3.5, §13.5).

   Resolves fast-check from the R0 scratch tool home (GEOMETRY_TOOLS_HOME, default
   ~/.genesis-geometry-tools) via createRequire, exactly mirroring dev/geometry-tools/smoke-imports.mjs's
   own resolvePkgJson()/importFromHome() pattern. This file does not vendor or npm-install anything
   itself — it only locates what R0's setup.mjs already installed. If the tool home is missing or
   fast-check isn't installed, every caller gets a loud, actionable error (never a silent fallback to
   some other fast-check resolution, never a fabricated pass). */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const toolHome =
  process.env.GEOMETRY_TOOLS_HOME || path.join(os.homedir(), ".genesis-geometry-tools");

function resolvePkgJson(pkgName) {
  const toolHomePkgJson = path.join(toolHome, "package.json");
  if (!fs.existsSync(toolHomePkgJson)) return null;
  const req = createRequire(toolHomePkgJson);
  let entry;
  try {
    entry = req.resolve(pkgName);
  } catch {
    return null;
  }
  let cursor = path.dirname(entry);
  while (cursor !== path.dirname(cursor)) {
    const candidate = path.join(cursor, "package.json");
    if (fs.existsSync(candidate)) {
      const pkg = JSON.parse(fs.readFileSync(candidate, "utf8"));
      if (pkg.name === pkgName) return { pkg, dir: cursor, entry };
    }
    cursor = path.dirname(cursor);
  }
  const direct = path.join(toolHome, "node_modules", pkgName, "package.json");
  if (fs.existsSync(direct)) {
    return { pkg: JSON.parse(fs.readFileSync(direct, "utf8")), dir: path.dirname(direct), entry };
  }
  return null;
}

/** loadFastCheck() -> the fast-check module namespace (fc), resolved from GEOMETRY_TOOLS_HOME.
    Throws loudly (with a "run R0 setup" pointer) if it isn't installed there. */
export async function loadFastCheck() {
  const found = resolvePkgJson("fast-check");
  if (!found) {
    throw new Error(
      `fast-check not resolvable under GEOMETRY_TOOLS_HOME (${toolHome}). ` +
        `Run 'node dev/geometry-tools/setup.mjs' first, or set GEOMETRY_TOOLS_HOME to point at an ` +
        `existing install. R2 never falls back to an ambient/global fast-check resolution.`
    );
  }
  const mod = await import(pathToFileURL(found.entry).href);
  const fc = mod.default ?? mod;
  if (typeof fc.assert !== "function" || typeof fc.property !== "function") {
    throw new Error(`resolved a module at ${found.entry} but it doesn't look like fast-check (no fc.assert/fc.property).`);
  }
  return { fc, version: found.pkg.version, toolHome };
}

export { toolHome };
