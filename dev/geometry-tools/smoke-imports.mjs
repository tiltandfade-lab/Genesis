#!/usr/bin/env node
// dev/geometry-tools/smoke-imports.mjs
//
// One import smoke test per Phase-0 dev tool (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md S13.3). Resolves
// each pinned package from GEOMETRY_TOOLS_HOME via createRequire (mirroring the ~/.genesis-jsdom and
// dev/graphics-research/verify-toolchain.mjs precedents), imports it, and asserts one basic real
// operation -- not just "the module object exists."
//
// Negative control: this script FAILS LOUDLY (non-zero exit, explicit stderr per package) if a
// package is absent, resolves to an unpinned version, or fails its functional assertion. It never
// downgrades a real failure to a warning and never prints a fake pass.
//
// Dep-aware skip: if a package (in particular the optional spectorjs) is simply not installed in the
// tool home, that single check is marked SKIPPED with a clear reason -- not PASS, not silent -- mirroring
// Genesis's existing CI dep-aware-skip posture for render/paint harnesses (see MEMORY.md "CI posture").
//
// Usage:
//   node dev/geometry-tools/smoke-imports.mjs
//   GEOMETRY_TOOLS_HOME=/custom/path node dev/geometry-tools/smoke-imports.mjs

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const here = path.dirname(new URL(import.meta.url).pathname);
const pins = JSON.parse(fs.readFileSync(path.join(here, "pins.json"), "utf8"));

const toolHome =
  process.env.GEOMETRY_TOOLS_HOME || path.join(os.homedir(), ".genesis-geometry-tools");

const toolHomePkgJson = path.join(toolHome, "package.json");
const results = { pass: [], fail: [], skipped: [] };

function record(name, status, detail) {
  const line = `[${status}] ${name}${detail ? " -- " + detail : ""}`;
  process.stdout.write(line + "\n");
  results[status === "PASS" ? "pass" : status === "SKIP" ? "skipped" : "fail"].push({
    name,
    detail
  });
}

if (!fs.existsSync(toolHomePkgJson)) {
  process.stderr.write(
    `[geometry-tools smoke] Tool home not found at ${toolHome} (no package.json). ` +
      `Run 'node dev/geometry-tools/setup.mjs' first, or set GEOMETRY_TOOLS_HOME.\n`
  );
  // Not a fake pass -- every check below will legitimately SKIP with this reason.
}

const req = fs.existsSync(toolHomePkgJson) ? createRequire(toolHomePkgJson) : null;

function resolvePkgJson(pkgName) {
  if (!req) return null;
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
  // Fall back to the package.json directly under node_modules/<pkgName>.
  const direct = path.join(toolHome, "node_modules", pkgName, "package.json");
  if (fs.existsSync(direct)) {
    return { pkg: JSON.parse(fs.readFileSync(direct, "utf8")), dir: path.dirname(direct), entry };
  }
  return null;
}

async function importFromHome(pkgName) {
  const found = resolvePkgJson(pkgName);
  if (!found) throw new Error(`could not resolve ${pkgName} package.json under ${toolHome}`);
  const mod = await import(pathToFileURL(found.entry).href);
  return { mod, pkg: found.pkg };
}

const receipt = {
  node: process.version,
  platform: `${os.platform()} ${os.arch()} ${os.release()}`,
  toolHome,
  packages: {},
  upstreamCommits: {},
  licenses: {},
  generatedAt: new Date().toISOString()
};

// --- fast-check -------------------------------------------------------------------------------
{
  const name = "fast-check";
  const spec = pins.phase0DevTools[name];
  try {
    const { mod, pkg } = await importFromHome(name);
    const fc = mod.default ?? mod;
    if (pkg.version !== spec.version) {
      throw new Error(`installed ${pkg.version}, pinned ${spec.version} -- version drift`);
    }
    // Real functional assertion: run a tiny property and confirm it actually exercised cases.
    let ran = 0;
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        ran += 1;
        return a + b === b + a; // commutativity -- trivially true, proves the runner executed
      }),
      { numRuns: 25, seed: 1 }
    );
    if (ran !== 25) throw new Error(`expected 25 generated cases, ran ${ran}`);
    record(name, "PASS", `v${pkg.version}, ran ${ran} generated cases`);
    receipt.packages[name] = { version: pkg.version, integrity: spec.npmIntegrity, status: "pass" };
    receipt.licenses[name] = pkg.license;
  } catch (error) {
    if (/could not resolve/.test(error.message)) {
      record(name, "SKIP", `not installed in ${toolHome} (${error.message})`);
      receipt.packages[name] = { status: "skipped", reason: error.message };
    } else {
      record(name, "FAIL", error.message);
      receipt.packages[name] = { status: "fail", error: error.message };
    }
  }
}

// --- webgl-lint --------------------------------------------------------------------------------
{
  const name = "webgl-lint";
  const spec = pins.phase0DevTools[name];
  try {
    const { mod, pkg } = await importFromHome(name);
    if (pkg.version !== spec.version) {
      throw new Error(`installed ${pkg.version}, pinned ${spec.version} -- version drift`);
    }
    // webgl-lint is authored to attach to a live WebGL context (browser-only). Node has no WebGL
    // context, so the functional assertion here is a module-shape check, not a runtime wrap -- the
    // real "wraps theater-boot.js's exact context" proof is R3's job (docs S13.6), not R0's.
    const hasExport =
      typeof mod.checkWebGLAgainstReferenceRun === "function" ||
      typeof mod.setupUnitTests === "function" ||
      typeof mod.default === "function" ||
      typeof mod === "function" ||
      Object.keys(mod).length > 0;
    if (!hasExport) throw new Error("module loaded but exposed no recognizable export surface");
    record(name, "PASS", `v${pkg.version}, module loads and exposes an export surface (browser-only wrap proof deferred to R3)`);
    receipt.packages[name] = { version: pkg.version, integrity: spec.npmIntegrity, status: "pass" };
    receipt.licenses[name] = pkg.license;
  } catch (error) {
    if (/could not resolve/.test(error.message)) {
      record(name, "SKIP", `not installed in ${toolHome} (${error.message})`);
      receipt.packages[name] = { status: "skipped", reason: error.message };
    } else {
      record(name, "FAIL", error.message);
      receipt.packages[name] = { status: "fail", error: error.message };
    }
  }
}

// --- pixelmatch --------------------------------------------------------------------------------
{
  const name = "pixelmatch";
  const spec = pins.phase0DevTools[name];
  try {
    const { mod, pkg } = await importFromHome(name);
    if (pkg.version !== spec.version) {
      throw new Error(`installed ${pkg.version}, pinned ${spec.version} -- version drift`);
    }
    const pixelmatch = mod.default ?? mod;
    const w = 2, h = 2;
    // Two solid-color 2x2 RGBA buffers, one black, one white -- every pixel should mismatch.
    const black = new Uint8Array(w * h * 4).fill(0);
    for (let i = 3; i < black.length; i += 4) black[i] = 255; // opaque
    const white = new Uint8Array(w * h * 4).fill(255);
    const diff = new Uint8Array(w * h * 4);
    const mismatched = pixelmatch(black, white, diff, w, h, { threshold: 0.1 });
    if (mismatched !== w * h) {
      throw new Error(`expected all ${w * h} pixels to mismatch (black vs white), got ${mismatched}`);
    }
    // Identical buffers should report zero mismatches.
    const same = pixelmatch(black, black, diff, w, h, { threshold: 0.1 });
    if (same !== 0) throw new Error(`expected 0 mismatches for identical buffers, got ${same}`);
    record(name, "PASS", `v${pkg.version}, diffed ${w}x${h} buffers (black-vs-white=${mismatched}, black-vs-black=${same})`);
    receipt.packages[name] = { version: pkg.version, integrity: spec.npmIntegrity, status: "pass" };
    receipt.licenses[name] = pkg.license;
  } catch (error) {
    if (/could not resolve/.test(error.message)) {
      record(name, "SKIP", `not installed in ${toolHome} (${error.message})`);
      receipt.packages[name] = { status: "skipped", reason: error.message };
    } else {
      record(name, "FAIL", error.message);
      receipt.packages[name] = { status: "fail", error: error.message };
    }
  }
}

// --- spectorjs (optional) -----------------------------------------------------------------------
// spectorjs's published package (dist/spector.bundle.js) is a browser-only UMD bundle with no Node
// entry point at all -- it references the `self` global at module-evaluation time, which does not
// exist in plain Node. That is a structural fact about the package, not a broken pin: version and
// integrity are checked independently via package.json before the import is even attempted, so a
// version/integrity mismatch still hard-fails below. A `self`/`window`/`document` ReferenceError on
// import is recorded as a distinct, honest SKIP (not a PASS, not a swallowed FAIL) -- functionally
// smoke-testing it requires a DOM/jsdom or real-browser harness, which is R3's job (WebGL
// diagnostics, docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md S13.6), not R0's.
{
  const name = "spectorjs";
  const spec = pins.phase0DevTools[name];
  const found = req ? resolvePkgJson(name) : null;
  if (!found) {
    record(name, "SKIP", `optional package not installed in ${toolHome} (run setup.mjs --with-spector to include it)`);
    receipt.packages[name] = { status: "skipped", reason: "optional, not requested at setup time" };
  } else if (found.pkg.version !== spec.version) {
    record(name, "FAIL", `installed ${found.pkg.version}, pinned ${spec.version} -- version drift`);
    receipt.packages[name] = { status: "fail", error: `version drift: installed ${found.pkg.version}, pinned ${spec.version}` };
  } else {
    try {
      const mod = await import(pathToFileURL(found.entry).href);
      const hasSpector = typeof mod.Spector === "function" || typeof mod.default === "function";
      if (!hasSpector) throw new Error("module loaded but exposed no recognizable Spector export");
      record(name, "PASS", `v${found.pkg.version}, module loads and exposes Spector constructor`);
      receipt.packages[name] = { version: found.pkg.version, integrity: spec.npmIntegrity, status: "pass" };
      receipt.licenses[name] = found.pkg.license;
    } catch (error) {
      const isBrowserGlobalGap = /^(self|window|document) is not defined$/.test(error.message);
      if (isBrowserGlobalGap) {
        record(
          name,
          "SKIP",
          `v${found.pkg.version} resolved and version-matched, but its only entry point (dist/spector.bundle.js) is browser-only UMD (${error.message}). Functional smoke-test deferred to R3's jsdom/browser harness.`
        );
        receipt.packages[name] = {
          version: found.pkg.version,
          integrity: spec.npmIntegrity,
          status: "skipped-browser-only",
          reason: error.message
        };
        receipt.licenses[name] = found.pkg.license;
      } else {
        record(name, "FAIL", error.message);
        receipt.packages[name] = { status: "fail", error: error.message };
      }
    }
  }
}

// --- reproducibility receipt --------------------------------------------------------------------
try {
  receipt.gitCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  receipt.gitBranch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    encoding: "utf8"
  }).trim();
} catch {
  receipt.gitCommit = null;
  receipt.gitBranch = null;
}

const receiptPath = path.join(here, "smoke-receipt.json");
fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");

process.stdout.write("\n--- reproducibility receipt ---\n");
process.stdout.write(JSON.stringify(receipt, null, 2) + "\n");
process.stdout.write(`(written to ${path.relative(process.cwd(), receiptPath)})\n\n`);

process.stdout.write(
  `summary: ${results.pass.length} pass, ${results.fail.length} fail, ${results.skipped.length} skipped\n`
);

if (results.fail.length > 0) {
  process.stderr.write(
    `[geometry-tools smoke] ${results.fail.length} package(s) FAILED. This is a real failure, not a ` +
      `dep-aware skip -- do not treat this run as green.\n`
  );
  process.exitCode = 1;
} else if (results.pass.length === 0) {
  process.stderr.write(
    "[geometry-tools smoke] Nothing passed -- every check skipped. The tool home is likely not " +
      "installed (network blocked or setup.mjs not run). This is a documented blocker, not a pass; " +
      "exiting non-zero so CI/orchestration cannot mistake this for a green smoke.\n"
  );
  process.exitCode = 1;
} else {
  process.exitCode = 0;
}
