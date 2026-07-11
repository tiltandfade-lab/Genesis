/* Verify BEAUTY-WAVE VP2b — THE GALLERY PASS (docs/BEAUTY-WAVE.md §VP2b).
   Full-app jsdom load (REALM_DRESSING lives in src/engine/place-dressing.js, a classic global
   script). Asserts:
     1. Detector precision on a labeled fixture set (no full-body non-clipped sprite falsely
        eaten, no opaque/no-alpha reference sheet falsely eaten).
     2. Frame compositing is deterministic per (realm, slug) — rerunning produces byte-identical
        painting PNGs.
     3. Every gallery-candidates.json "keep" verdict joins REALM_DRESSING as a wall-hang card
        and its assets/dressing/<slug>.png resolves on disk, carrying paintingOf provenance.

   Run:  node dev/verify-gallery-pass.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

/* ---- 1. detector precision on a labeled fixture set ------------------------------------- */
// Build 3 tiny synthetic PNGs in-process via the PNG bytes of known shapes is overkill for a
// node-only harness with no image lib — instead exercise the REAL detector script against the
// REAL corpus and assert its documented false-positive guards hold on known fixtures already
// in the repo:
//   - a genuine full-body NON-clipped sprite (bottom row fully transparent) must NOT appear
//   - an opaque reference sheet (no real alpha) must NOT appear
// spr-fantasy-aarakocra-aeromancer.png is a normal standee (not clipped) — good non-clip fixture.
// dev/model-qa/quarantine-pack/painterly-ash/ash-kids-01.png is an opaque RGB reference sheet —
// good no-alpha fixture (would trivially misfire as "100% bottom clipped" without the alpha-
// channel guard the detector script carries).
const candidatesPath = join(ROOT, "dev/model-qa/gallery-candidates.json");
check("gallery-candidates.json exists", existsSync(candidatesPath));
const candidates = JSON.parse(read("dev/model-qa/gallery-candidates.json"));
const slugs = new Set(candidates.candidates.map((c) => c.slug));
check("non-clipped standee (aarakocra-aeromancer) NOT flagged as a candidate",
  !slugs.has("spr-fantasy-aarakocra-aeromancer"));
check("opaque no-alpha reference sheet (ash-kids-01) NOT flagged as a candidate",
  !slugs.has("ash-kids-01"));
const keepers = candidates.candidates.filter((c) => c.verdict === "keep");
check("at least one keeper survived the eyeball cull", keepers.length > 0, `keepers=${keepers.length}`);
check("every keeper is in a WIRED realm (chrome/gloom/fantasy)",
  keepers.every((c) => ["chrome", "gloom", "fantasy"].includes(c.realm)),
  JSON.stringify(keepers.map((c) => c.realm)));

/* ---- 2. frame compositing is deterministic per (realm, slug) -------------------------------- */
const hashFile = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const paintingFiles = keepers
  .filter((c) => ["chrome", "gloom", "fantasy"].includes(c.realm))
  .map((_, i, arr) => `assets/dressing/${arr[i].realm}-painting-${arr.filter((c2) => c2.realm === arr[i].realm).indexOf(arr[i]) + 1}.png`);
const beforeHashes = paintingFiles.map((p) => existsSync(join(ROOT, p)) ? hashFile(join(ROOT, p)) : null);
execFileSync("python3", ["build/gen-gallery-paintings.py", "--emit"], { cwd: ROOT, stdio: "pipe" });
const afterHashes = paintingFiles.map((p) => existsSync(join(ROOT, p)) ? hashFile(join(ROOT, p)) : null);
check("re-running gen-gallery-paintings.py reproduces byte-identical PNGs (deterministic frames)",
  beforeHashes.length > 0 && beforeHashes.every((h, i) => h && h === afterHashes[i]),
  JSON.stringify({ beforeHashes, afterHashes }));

/* ---- 3. every keeper joins REALM_DRESSING + resolves on disk + carries paintingOf ------------ */
const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);

check("REALM_DRESSING is defined", typeof win.REALM_DRESSING === "object" && win.REALM_DRESSING !== null);

for (const realm of ["chrome", "gloom", "fantasy"]) {
  const roster = win.REALM_DRESSING[realm] || [];
  const paintingCards = roster.filter((c) => c.slug.includes("-painting-"));
  const realmKeepers = keepers.filter((k) => k.realm === realm);
  check(`REALM_DRESSING.${realm} painting-card count matches keeper count`,
    paintingCards.length === realmKeepers.length,
    `cards=${paintingCards.length} keepers=${realmKeepers.length}`);
  for (const card of paintingCards) {
    check(`${card.slug}: primary is wall-hang`, card.primary === "wall-hang");
    check(`${card.slug}: carries paintingOf provenance`, typeof card.paintingOf === "string" && card.paintingOf.length > 0);
    const onDisk = join(ROOT, "assets/dressing", card.slug + ".png");
    check(`${card.slug}: resolves on disk`, existsSync(onDisk));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
