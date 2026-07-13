#!/usr/bin/env node
// dev/geometry-tools/setup.mjs
//
// Materializes the R0 Phase-0 dev-tool set (fast-check, webgl-lint, pixelmatch, and optionally
// spectorjs) into a scratch tool home, entirely outside the Genesis repo tree. Mirrors the existing
// ~/.genesis-jsdom precedent (CLAUDE.md) and dev/graphics-research/'s GRAPHICS_RESEARCH_HOME pattern.
//
// This script does NOT touch the repo's root package.json (there isn't one), does NOT create a root
// node_modules, and installs nothing that ships in genesis.html. See docs/GEOMETRY-ACCELERATION-
// TOOLCHAIN.md S11 (dependency and tool isolation) and S13.3 (R0 deliverables).
//
// Usage:
//   node dev/geometry-tools/setup.mjs                 # install the 3 required Phase-0 tools
//   node dev/geometry-tools/setup.mjs --with-spector   # also install the optional spectorjs pin
//   GEOMETRY_TOOLS_INCLUDE_SPECTOR=1 node dev/geometry-tools/setup.mjs   # same, via env
//   GEOMETRY_TOOLS_HOME=/custom/path node dev/geometry-tools/setup.mjs  # override the tool home
//
// Exit code is non-zero if the install fails or network access is blocked. It never fakes success.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const here = path.dirname(new URL(import.meta.url).pathname);
const pins = JSON.parse(fs.readFileSync(path.join(here, "pins.json"), "utf8"));

const toolHome =
  process.env.GEOMETRY_TOOLS_HOME || path.join(os.homedir(), ".genesis-geometry-tools");

const includeSpector =
  process.argv.includes("--with-spector") || process.env.GEOMETRY_TOOLS_INCLUDE_SPECTOR === "1";

function log(msg) {
  process.stdout.write(`[geometry-tools setup] ${msg}\n`);
}

function fail(msg) {
  process.stderr.write(`[geometry-tools setup] FAILED: ${msg}\n`);
  process.exitCode = 1;
}

const phase0 = pins.phase0DevTools;
const wanted = Object.entries(phase0).filter(([name]) => !name.startsWith("_"));
const toInstall = wanted.filter(([, spec]) => spec.required || includeSpector);
const skipped = wanted.filter(([, spec]) => !spec.required && !includeSpector);

log(`tool home: ${toolHome}`);
log(`installing: ${toInstall.map(([n, s]) => `${n}@${s.version}`).join(", ")}`);
if (skipped.length) {
  log(
    `skipping optional: ${skipped.map(([n, s]) => `${n}@${s.version}`).join(", ")} ` +
      `(pass --with-spector or set GEOMETRY_TOOLS_INCLUDE_SPECTOR=1 to include)`
  );
}

fs.mkdirSync(toolHome, { recursive: true });

const pkgJsonPath = path.join(toolHome, "package.json");
if (!fs.existsSync(pkgJsonPath)) {
  fs.writeFileSync(
    pkgJsonPath,
    JSON.stringify(
      {
        name: "genesis-geometry-tools-scratch-home",
        private: true,
        description:
          "Scratch install home for Genesis geometry-research dev tools. Not part of the Genesis app. See dev/geometry-tools/README.md.",
        version: "0.0.0"
      },
      null,
      2
    ) + "\n"
  );
  log(`wrote fresh package.json at ${pkgJsonPath}`);
}

const specs = toInstall.map(([name, spec]) => `${spec.package}@${spec.version}`);

let npmOk = true;
try {
  log(`running: npm install --save-exact --ignore-scripts ${specs.join(" ")}`);
  const out = execFileSync(
    "npm",
    ["install", "--save-exact", "--ignore-scripts", "--no-audit", "--no-fund", ...specs],
    { cwd: toolHome, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
  );
  log(out.trim() || "(npm produced no stdout)");
} catch (error) {
  npmOk = false;
  const stderr = error.stderr ? error.stderr.toString() : error.message;
  fail(`npm install did not complete.\n${stderr}`);
}

if (npmOk) {
  // Confirm installed versions match the pin exactly -- a resolver substitution is a silent drift bug.
  let mismatch = false;
  for (const [name, spec] of toInstall) {
    const installedPkgJson = path.join(toolHome, "node_modules", spec.package, "package.json");
    if (!fs.existsSync(installedPkgJson)) {
      fail(`${name}: expected at ${installedPkgJson} after install, but it is missing.`);
      mismatch = true;
      continue;
    }
    const installed = JSON.parse(fs.readFileSync(installedPkgJson, "utf8"));
    if (installed.version !== spec.version) {
      fail(
        `${name}: pinned ${spec.version} but node_modules has ${installed.version}. ` +
          `Update pins.json deliberately -- do not let this drift silently.`
      );
      mismatch = true;
    } else {
      log(`verified ${name}@${installed.version} matches pin`);
    }
  }
  if (!mismatch) {
    log("all pinned versions verified. Lockfile + manifest live in the tool home only, not the repo.");
    log(`run: node ${path.relative(process.cwd(), path.join(here, "smoke-imports.mjs"))}`);
  }
}

if (!npmOk) {
  process.stderr.write(
    "[geometry-tools setup] Network install failed or was blocked. Do not report this as a green " +
      "install. See dev/geometry-tools/README.md for the documented-blocker path: the LEDGER and " +
      "smoke tests still stand on their own and smoke-imports.mjs will dep-aware-skip anything not " +
      "present in the tool home.\n"
  );
}
