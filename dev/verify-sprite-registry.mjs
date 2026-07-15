/* Verify docs/SPRITE-TRANSITION.md T3 — the SPRITE_REGISTRY generator (build/gen-sprite-registry.py).

   Full-app jsdom load + manifest.json loadOrder (same convention as dev/verify-animal-social-u1.mjs
   / dev/verify-role-realms.mjs). data/sprite-registry.js declares SPRITE_REGISTRY as a top-level
   `const` — a lexical binding, not a `window` property even under jsdom's runScripts:"dangerously"
   — so boot() appends a same-scope accessor function (__spriteRegistry) that DOES attach to window.

   Run: node dev/verify-sprite-registry.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md)

   Accept criteria (spec T3.4):
     1. SPRITE_REGISTRY parses off the real generated data/sprite-registry.js and is non-empty.
     2. Every slug matches ^spr-.
     3. Join coverage for kind:"monster" cells is >=90%.
     4. The overlay's `tags` wins over the generator's auto-tags when present for a slug.

   RED-FIRST (this file's own slug-regex assertion function is proven to bite): before trusting
   check #2 against real data, the same assertion function is run against a deliberately corrupted
   clone of the registry (one slug's "spr-" prefix stripped) and MUST fail. That corrupted-clone
   run is printed first, under a "RED-FIRST" banner, and is expected/required to show a failure —
   only the run against the real registry afterward is expected to pass.

   VQ2-RESPEC.md S3 / PHASE-3-WAVE-2-SPECS.md B1 extends this harness with:
     5. Every entry carries the standee-contract + faceted-admission fields (footX/footY/
        worldHeight/heightSource/contentBounds/alphaCutoff/shadowProfile/legacyAsset/
        candidateAsset/artStyleVersion/qaStatus/runtimeAdmitted), correctly typed. RED-FIRST
        against the pre-S3 baseline registry (git merge-base HEAD master:data/sprite-registry.js,
        which has none of these fields) — the assertion function MUST fail there before trusting
        it green against the real regenerated registry.
     6. runtimeAdmitted present (a string) on every entry.
     7. Every candidateAsset path that IS set resolves to a real file on disk.
     8. worldHeight/heightSource never silently guess: a fixture entry with neither a measured
        `feet` nor a resolvable `size` (spr-gloom-attic-moth-swarm, the fixture's deliberately-
        unjoined cell) yields worldHeight:null + heightSource:"missing". RED-FIRST: the same
        assertion function is proven to bite on a mutated clone that injects a fake band-default
        guess before trusting it against the real fixture-generated entry. */
import { readFileSync, writeFileSync, unlinkSync, mkdtempSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

function boot(overridePath, overrideSrc) {
  const man = JSON.parse(read("manifest.json"));
  const src = man.loadOrder
    .filter((p) => p.endsWith(".js"))
    .map((p) => (overridePath && p === overridePath ? overrideSrc : read(p)))
    .join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src
    + "\nfunction __spriteRegistry(){return SPRITE_REGISTRY;}");
  return win;
}

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ---- the assertion function under test (also what the "real" checks below call) ----
function slugsValid(registry) {
  const bad = Object.keys(registry).filter((slug) => !/^spr-/.test(slug));
  return { ok: bad.length === 0, bad };
}

console.log("=== RED-FIRST: slug-regex assertion must bite on a broken slug ===");
{
  const win = boot();
  const real = win.__spriteRegistry();
  // corrupted clone: strip "spr-" off exactly one real slug, proving the checker fires
  const clone = { ...real };
  const someSlug = Object.keys(clone)[0];
  const brokenSlug = someSlug.replace(/^spr-/, "");
  clone[brokenSlug] = clone[someSlug];
  delete clone[someSlug];

  const result = slugsValid(clone);
  const bites = result.ok === false && result.bad.includes(brokenSlug);
  console.log(bites
    ? `  ✓ RED-FIRST proven: checker correctly FAILED on corrupted slug '${brokenSlug}' (was '${someSlug}')`
    : `  ✗ RED-FIRST FAILED TO PROVE ANYTHING: checker did not catch the corrupted slug`);
  if (!bites) { fail++; } else { pass++; }
}

console.log("\n=== Real generated registry (data/sprite-registry.js) ===");
const win = boot();
const registry = win.__spriteRegistry();

check("1. SPRITE_REGISTRY parses and is non-empty",
  registry && typeof registry === "object" && Object.keys(registry).length > 0,
  `got ${registry ? Object.keys(registry).length : "undefined"} entries`);

const slugCheck = slugsValid(registry);
check("2. every slug matches ^spr-", slugCheck.ok, `bad: ${JSON.stringify(slugCheck.bad)}`);

const monsterEntries = Object.values(registry).filter((e) => e.kind === "monster");
const monsterJoined = monsterEntries.filter((e) => e.frame !== null && e.frame !== undefined);
const coveragePct = monsterEntries.length ? (monsterJoined.length / monsterEntries.length) * 100 : 100;
check("3. monster-kind join coverage >= 90%", coveragePct >= 90,
  `${monsterJoined.length}/${monsterEntries.length} = ${coveragePct.toFixed(1)}%`);
console.log(`     (monster-kind join coverage: ${monsterJoined.length}/${monsterEntries.length} = ${coveragePct.toFixed(1)}%)`);

console.log("\n=== Overlay merge wins over auto-tags ===");
{
  // Round-trip the real generator (build/gen-sprite-registry.py) with a scratch overlay + scratch
  // output path (--overlay/--out) so this never touches the committed data/sprite-registry.js or
  // dev/model-qa/sprite-tags-overlay.json.
  const scratch = mkdtempSync(join(tmpdir(), "genesis-sprite-overlay-"));
  const overlayPath = join(scratch, "overlay.json");
  const outPath = join(scratch, "sprite-registry.out.js");

  // spr-gloom-attic-moth-swarm is the fixture's deliberately-unjoined gloom monster cell
  // (dev/fixtures/v2-manifest.json) — its auto tags are just [realm,kind] since role/type/size
  // are null pre-overlay. Give it a distinctive overlay tag set and confirm it wins wholesale.
  const targetSlug = "spr-gloom-attic-moth-swarm";
  const overlayTags = ["overlay-proof-a", "overlay-proof-b"];
  writeFileSync(overlayPath, JSON.stringify({
    _comment: "scratch test overlay — dev/verify-sprite-registry.mjs, not committed",
    [targetSlug]: { tags: overlayTags, reusable: "unique", redlined: true },
  }, null, 2));

  execFileSync("python3", [
    join(ROOT, "build", "gen-sprite-registry.py"),
    "--manifest", join(ROOT, "dev", "fixtures", "v2-manifest.json"),
    "--overlay", overlayPath,
    "--out", outPath,
  ], { cwd: ROOT });

  const outSrc = readFileSync(outPath, "utf-8");
  const entryMatch = outSrc.match(new RegExp(`"${targetSlug}":\\s*\\{[^}]*\\}`));
  const entryText = entryMatch ? entryMatch[0] : "";
  const tagsMatch = entryText.match(/tags:\s*(\[[^\]]*\])/);
  const parsedTags = tagsMatch ? JSON.parse(tagsMatch[1]) : null;

  check("4. overlay tags replace auto-tags for the targeted slug",
    parsedTags && JSON.stringify(parsedTags) === JSON.stringify(overlayTags),
    `got tags=${JSON.stringify(parsedTags)}, expected ${JSON.stringify(overlayTags)}`);
  check("4b. overlay reusable/redlined carried onto the entry",
    /reusable:\s*"unique"/.test(entryText) && /redlined:\s*true/.test(entryText),
    entryText);

  try { unlinkSync(overlayPath); } catch {}
  try { unlinkSync(outPath); } catch {}
}

// ---- S3 / B1 — the standee-contract + faceted-admission field assertion ----
function standeeFieldsValid(registry) {
  const entries = Object.entries(registry);
  const bad = [];
  for (const [slug, e] of entries) {
    const ok =
      typeof e.footX === "number" &&
      typeof e.footY === "number" &&
      (e.worldHeight === null || typeof e.worldHeight === "number") &&
      typeof e.heightSource === "string" &&
      ["overlay", "measured", "band-default", "missing"].includes(e.heightSource) &&
      (e.contentBounds === null || Array.isArray(e.contentBounds)) &&
      typeof e.alphaCutoff === "number" &&
      typeof e.shadowProfile === "string" &&
      (e.legacyAsset === null || typeof e.legacyAsset === "string") &&
      (e.candidateAsset === null || typeof e.candidateAsset === "string") &&
      typeof e.artStyleVersion === "string" &&
      (e.qaStatus === null || typeof e.qaStatus === "string") &&
      typeof e.runtimeAdmitted === "string";
    if (!ok) bad.push(slug);
  }
  return { ok: bad.length === 0, bad, total: entries.length };
}

console.log("\n=== RED-FIRST: standee-contract field assertion must bite on a stripped clone ===");
{
  // Synthetic pre-S3-shape clone: strip every S3/B1 field from a copy of the REAL registry.
  // (Was a `git merge-base HEAD master` lookup — that stopped proving anything the moment S3
  // permanently landed on master: merge-base(HEAD, master) from any fresh branch off current
  // master now just IS master, whose data/sprite-registry.js already carries every S3 field, so
  // the "pre-S3 baseline" it fetched was never actually pre-S3. Stripping in-memory is also more
  // robust going forward — it doesn't depend on git history shape at all. VQ2-RESPEC.md S6 fix,
  // orthogonal to this unit's own feature work but required to keep this harness honestly green.)
  const STANDEE_FIELDS = ["footX", "footY", "worldHeight", "heightSource", "contentBounds",
    "alphaCutoff", "shadowProfile", "legacyAsset", "candidateAsset", "artStyleVersion",
    "qaStatus", "runtimeAdmitted"];
  const strippedRegistry = {};
  for (const [slug, e] of Object.entries(registry)) {
    const clone = { ...e };
    for (const f of STANDEE_FIELDS) delete clone[f];
    strippedRegistry[slug] = clone;
  }
  const result = standeeFieldsValid(strippedRegistry);
  const bites = result.ok === false && result.bad.length === result.total;
  console.log(bites
    ? `  ✓ RED-FIRST proven: checker correctly FAILED on a stripped pre-S3-shape clone (${result.bad.length}/${result.total} entries missing the new fields)`
    : `  ✗ RED-FIRST FAILED TO PROVE ANYTHING: checker did not catch the stripped clone (bad=${result.bad.length}/${result.total})`);
  if (!bites) { fail++; } else { pass++; }
}

console.log("\n=== S3/B1 standee contract + faceted admission (real generated registry) ===");
{
  const fieldsResult = standeeFieldsValid(registry);
  check("5. standee-contract + art-admission fields present + typed on every entry",
    fieldsResult.ok, `${fieldsResult.total - fieldsResult.bad.length}/${fieldsResult.total} valid; bad sample: ${JSON.stringify(fieldsResult.bad.slice(0, 5))}`);

  const missingRuntimeAdmitted = Object.entries(registry).filter(([, e]) => typeof e.runtimeAdmitted !== "string");
  check("6. runtimeAdmitted present (string) on every entry", missingRuntimeAdmitted.length === 0,
    `${missingRuntimeAdmitted.length} entries missing it, e.g. ${JSON.stringify(missingRuntimeAdmitted.slice(0, 3).map(([s]) => s))}`);

  const candidates = Object.entries(registry).filter(([, e]) => e.candidateAsset);
  const missingFiles = candidates.filter(([, e]) => !existsSync(join(ROOT, e.candidateAsset)));
  check("7. every candidateAsset path exists on disk", missingFiles.length === 0,
    `${missingFiles.length}/${candidates.length} candidateAsset entries point at a missing file: ${JSON.stringify(missingFiles.slice(0, 3).map(([s]) => s))}`);
  console.log(`     (${candidates.length} entries carry a candidateAsset, all file-verified)`);
}

// ---- S3 / B1 (+ S6) — worldHeight never a silent guess ----
// Mirrors build/gen-sprite-registry.py's world_height_for() priority exactly: overlay feet ->
// measured feet -> SRD size-band default -> loud null. Checks the SOURCE data (overlay/feet/
// size), not just internal self-consistency, so a fabricated worldHeight on an entry with none
// of those actually gets caught. overlayFeet is undefined for every call in this file except
// the dedicated S6 section below (registry entries don't carry the raw overlay value, only the
// derived worldHeight/heightSource — the overlay file itself is the source of truth for that).
const SIZE_BAND_DEFAULT_FEET = { tiny: 1.5, small: 3, medium: 5.5, large: 9, huge: 15, gargantuan: 25 };
function worldHeightHonest(overlayFeet, feet, size, worldHeight, heightSource) {
  if (typeof overlayFeet === "number") {
    return heightSource === "overlay" && worldHeight === overlayFeet;
  }
  if (typeof feet === "number") {
    return heightSource === "measured" && worldHeight === feet;
  }
  const band = SIZE_BAND_DEFAULT_FEET[String(size ?? "").trim().toLowerCase()];
  if (band !== undefined) {
    return heightSource === "band-default" && worldHeight === band;
  }
  return heightSource === "missing" && worldHeight === null;
}

console.log("\n=== RED-FIRST: worldHeight-honesty assertion must bite on a silently-guessed clone ===");
{
  // No overlay, no feet, no resolvable size (the exact fixture-slug shape below) — but a
  // fabricated worldHeight, the silent guess this law forbids.
  const bites = worldHeightHonest(undefined, undefined, null, 5.5, "band-default") === false;
  console.log(bites
    ? "  ✓ RED-FIRST proven: checker correctly FAILED on a silently-guessed worldHeight"
    : "  ✗ RED-FIRST FAILED TO PROVE ANYTHING: checker did not catch the silent guess");
  if (!bites) { fail++; } else { pass++; }
}

console.log("\n=== worldHeight/heightSource honest on the no-feet/no-size fixture slug ===");
{
  // Round-trip the real generator against the fixture manifest (same convention as the overlay
  // test above) — spr-gloom-attic-moth-swarm is deliberately unjoined (size:null) and never cut
  // (no `feet` fold), so it has no measured height and no resolvable size band.
  const scratch = mkdtempSync(join(tmpdir(), "genesis-sprite-worldheight-"));
  const outPath = join(scratch, "sprite-registry.out.js");
  execFileSync("python3", [
    join(ROOT, "build", "gen-sprite-registry.py"),
    "--manifest", join(ROOT, "dev", "fixtures", "v2-manifest.json"),
    "--out", outPath,
  ], { cwd: ROOT });

  const outSrc = readFileSync(outPath, "utf-8");
  const fixtureRegistry = new Function(outSrc + "\nreturn SPRITE_REGISTRY;")();
  const targetSlug = "spr-gloom-attic-moth-swarm";
  const entry = fixtureRegistry[targetSlug];

  check("8. no-feet/no-size fixture slug yields worldHeight:null",
    entry && entry.worldHeight === null, `got worldHeight=${JSON.stringify(entry && entry.worldHeight)}`);
  check("8b. no-feet/no-size fixture slug yields heightSource:\"missing\"",
    entry && entry.heightSource === "missing", `got heightSource=${JSON.stringify(entry && entry.heightSource)}`);
  check("8c. worldHeightHonest() holds for the real fixture entry",
    entry && worldHeightHonest(undefined, entry.feet, entry.size, entry.worldHeight, entry.heightSource),
    `entry=${JSON.stringify(entry)}`);

  try { unlinkSync(outPath); } catch {}
}

// ---- S6 — dev/sprite-review.py's editable `feet` overlay key (VQ2-RESPEC.md S6) ----
console.log("\n=== RED-FIRST: pre-S6 baseline sprite-review.py must reject overlay key \"feet\" ===");
{
  // The pre-S6 baseline is the branch point against master (git merge-base) — its ALLOWED_KEYS
  // has no "feet" entry. If apply_patch() there doesn't reject it, the RED-FIRST proof (and the
  // GREEN check below) aren't actually proving anything.
  const baseSha = execFileSync("git", ["merge-base", "HEAD", "master"], { cwd: ROOT }).toString().trim();
  const baselineSrc = execFileSync("git", ["show", `${baseSha}:dev/sprite-review.py`],
    { cwd: ROOT, maxBuffer: 1024 * 1024 * 8 }).toString();
  const scratch = mkdtempSync(join(tmpdir(), "genesis-sprite-feet-"));
  const baselinePath = join(scratch, "sprite-review-baseline.py");
  writeFileSync(baselinePath, baselineSrc);

  const redScript = [
    "import importlib.util",
    `spec = importlib.util.spec_from_file_location("baseline_sr", ${JSON.stringify(baselinePath)})`,
    "mod = importlib.util.module_from_spec(spec)",
    "spec.loader.exec_module(mod)",
    "try:",
    '    mod.apply_patch("spr-ash-rustfall-ghoul", {"feet": 6.0}, None)',
    '    print("ACCEPTED")',
    "except ValueError as e:",
    '    print("REJECTED:" + str(e))',
  ].join("\n");
  const redOut = execFileSync("python3", ["-c", redScript], { cwd: ROOT }).toString().trim();
  const redBites = redOut.startsWith("REJECTED") && redOut.toLowerCase().includes("feet");
  console.log(redBites
    ? `  ✓ RED-FIRST proven: baseline sprite-review.py rejects overlay key "feet" (${redOut})`
    : `  ✗ RED-FIRST FAILED TO PROVE ANYTHING: baseline did not reject "feet" (${redOut})`);
  if (!redBites) { fail++; } else { pass++; }

  console.log("\n=== overlay `feet` round-trip -> regen -> worldHeight/heightSource:\"overlay\" ===");
  const overlayPath = join(scratch, "overlay.json");
  const targetSlug = "spr-ash-rustfall-ghoul"; // real (non-fixture) registry slug, band-default pre-overlay

  const greenScript = [
    "import importlib.util, json",
    `spec = importlib.util.spec_from_file_location("sr", ${JSON.stringify(join(ROOT, "dev", "sprite-review.py"))})`,
    "mod = importlib.util.module_from_spec(spec)",
    "spec.loader.exec_module(mod)",
    `mod.OVERLAY = ${JSON.stringify(overlayPath)}`,
    `entry = mod.apply_patch(${JSON.stringify(targetSlug)}, {"feet": 6.25}, None)`,
    'assert entry["feet"] == 6.25, entry',
    "range_rejected = False",
    "try:",
    `    mod.apply_patch(${JSON.stringify(targetSlug)}, {"feet": 150}, None)`,
    "except ValueError:",
    "    range_rejected = True",
    `with open(${JSON.stringify(overlayPath)}) as f:`,
    "    data = json.load(f)",
    `assert data[${JSON.stringify(targetSlug)}]["feet"] == 6.25, data  # unchanged by the rejected patch`,
    'print("RANGE_REJECTED:" + ("true" if range_rejected else "false"))',
    'print("OK")',
  ].join("\n");
  const greenOut = execFileSync("python3", ["-c", greenScript], { cwd: ROOT }).toString().trim();
  check("9. overlay accepts in-range feet, round-trips to the overlay file, rejects out-of-range without mutating it",
    greenOut.includes("RANGE_REJECTED:true") && greenOut.includes("OK"), greenOut);

  const outPath = join(scratch, "sprite-registry.out.js");
  execFileSync("python3", [
    join(ROOT, "build", "gen-sprite-registry.py"),
    "--overlay", overlayPath,
    "--out", outPath,
  ], { cwd: ROOT });
  const outSrc = readFileSync(outPath, "utf-8");
  const foldedRegistry = new Function(outSrc + "\nreturn SPRITE_REGISTRY;")();
  const targetEntry = foldedRegistry[targetSlug];
  check("10. overlay feet folds through regen to worldHeight == the overlay value",
    targetEntry && targetEntry.worldHeight === 6.25, `got worldHeight=${JSON.stringify(targetEntry && targetEntry.worldHeight)}`);
  check("10b. overlay feet folds through regen to heightSource:\"overlay\"",
    targetEntry && targetEntry.heightSource === "overlay", `got heightSource=${JSON.stringify(targetEntry && targetEntry.heightSource)}`);

  try { unlinkSync(overlayPath); } catch {}
  try { unlinkSync(outPath); } catch {}
  try { unlinkSync(baselinePath); } catch {}
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
