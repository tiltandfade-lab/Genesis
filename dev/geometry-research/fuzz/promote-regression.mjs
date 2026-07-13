/* dev/geometry-research/fuzz/promote-regression.mjs — UNIT R2 promoted-regression workflow
   (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md §3.5, §5.4, §13.5).

   Writes a minimal failing fast-check case to dev/geometry-research/fuzz/regressions/ in the exact
   JSON shape §3.5 specifies. This is called ONLY after §5.4's step 3 ("confirm it fails outside
   fast-check in a deterministic one-case harness") has been done by the caller -- promoteRegression()
   itself does not re-run fast-check; it just persists what the caller already confirmed. */

import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REGRESSIONS_DIR = join(HERE, "regressions");

function currentCommit() {
  try {
    return execSync("git rev-parse HEAD", { cwd: HERE, encoding: "utf-8" }).trim();
  } catch {
    return null;
  }
}

/** contentHash(obj) -> short deterministic hex hash of a JSON-stable-stringified object, used as the
    `geo-regression-<hash>` id suffix (stable across re-promotion of the SAME minimal case; a genuinely
    different minimal case gets a genuinely different id). */
export function contentHash(obj) {
  const stable = JSON.stringify(obj, Object.keys(obj).sort());
  return createHash("sha256").update(stable).digest("hex").slice(0, 12);
}

/** promoteRegression({property, seed, path, cells, tiers, apertures, profile, expected, foundBy}) ->
    writes dev/geometry-research/fuzz/regressions/geo-regression-<hash>.json and returns the record.
    Never overwrites a DIFFERENT record at the same computed id (that would mean a hash collision on
    genuinely different content, which should never happen with sha256) -- re-promoting the identical
    minimal case is idempotent (same id, same content, harmless rewrite). */
export function promoteRegression(fields) {
  if (!existsSync(REGRESSIONS_DIR)) mkdirSync(REGRESSIONS_DIR, { recursive: true });
  const idBasis = {
    property: fields.property,
    cells: fields.cells,
    tiers: fields.tiers || {},
    apertures: fields.apertures || [],
    profile: fields.profile || {},
  };
  const hash = contentHash(idBasis);
  const id = `geo-regression-${hash}`;
  const record = {
    id,
    foundBy: fields.foundBy || "fast-check",
    seed: fields.seed,
    path: fields.path || "",
    property: fields.property,
    cells: fields.cells,
    tiers: fields.tiers || {},
    apertures: fields.apertures || [],
    profile: fields.profile || {},
    expected: fields.expected || {},
    firstSeenCommit: fields.firstSeenCommit || currentCommit(),
    // extra provenance beyond the §3.5 minimum shape -- never required by a consumer, always ignorable.
    notes: fields.notes || "",
    scenario: fields.scenario || null,
  };
  const filePath = join(REGRESSIONS_DIR, `${id}.json`);
  const existing = existsSync(filePath) ? JSON.parse(readFileSync(filePath, "utf8")) : null;
  writeFileSync(filePath, JSON.stringify(record, null, 2) + "\n");
  return { record, filePath, wasNew: !existing };
}

/** listPromotedRegressions() -> every regression currently promoted, for the ordinary-deterministic-
    test consumer (§3.5: "Promoted fixtures become ordinary deterministic tests"). */
export function listPromotedRegressions() {
  if (!existsSync(REGRESSIONS_DIR)) return [];
  return readdirSync(REGRESSIONS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(REGRESSIONS_DIR, f), "utf8")));
}
