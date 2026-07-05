/* Verify W2-B — CREATURE BUILDER DETERMINISM (docs/REVIEW-FIXES-0705-VISUAL.md, unit W2-B).
   Math.random() in whole-object creature builders made the SAME creature render differently
   across sessions/reloads (geometry is cached per page-load only) — against the engine-owns-
   rolled-facts doctrine and the builders' own "deterministic, no Math.random" contract.

   Scope matches the spec's own checklist exactly:
     1. [RED-FIRST] build each FORMERLY-OFFENDING creature's geometry TWICE in fresh contexts ->
        identical vertex counts AND an identical hash of the color/position attributes.
     2. grep-gate: Math.random has ZERO hits anywhere under dev/model-qa/creatures/ (the sweep is
        the law, not the three known offenders — this re-checks the WHOLE directory, so any future
        creature module regresses this gate too).
     3. structural presence check on the 3 fixed creatures (decoration survived the fix, nothing
        went bald) — the capture-sheet spot render is the orchestrator's own visual eyeball.

   PURE LAYER: probe-lib.js + every creature module are plain-object generators (POS/COL/CHAN
   arrays) with no bare "three" GL context touch during build() — Node-importable directly, same
   discipline as dev/verify-theater-figures.mjs's own builder-contract check. No jsdom needed.

   "Fresh contexts" per the spec = a genuinely separate Node CHILD PROCESS per build. A creature
   module does a static `import '../probe-lib.js'` with no cache-busting query of its own, so an
   in-process cache-busted re-import of probe-lib.js is invisible to it — the creature module
   would keep resolving to the ORIGINAL probe-lib instance while the harness reads back an empty,
   never-written-to buffer from the busted one. Spawning a child process per build (via a tiny
   inline worker script) is the only way to get a truly fresh probe-lib module-scope state
   without editing every creature module's import line. Each child: resetGeom() -> build() ->
   getBuffers() -> prints the buffers as JSON, then exits.

   RED-FIRST: check 1 was run against pre-fix code (git stash) and captured failing — the ooze's
   bubble-pop quad (rlm-corrosive-splice-ooze.js:49, Math.random()<0.6) and the cathedral's
   moss/wet quad (:107, Math.random()>0.5) flipped attribute hashes between the two builds. See
   the orchestrator report for the full red-output transcript.

   Run:  node dev/verify-creature-determinism.mjs */
import { readFileSync, readdirSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fork } from "node:child_process";
import crypto from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CREATURES_DIR = join(ROOT, "dev/model-qa/creatures");
const PROBE_LIB = join(ROOT, "dev/model-qa/probe-lib.js");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// worker plumbing: one child process per build, talking back over stdout as JSON.
// ============================================================================
const workerPath = join(ROOT, "dev/.verify-creature-determinism-worker.mjs");
writeFileSync(workerPath, `
import { pathToFileURL } from "node:url";
const [,, absFile, fnName, absProbeLib] = process.argv;
const probeLib = await import(pathToFileURL(absProbeLib).href);
const mod = await import(pathToFileURL(absFile).href);
probeLib.resetGeom();
mod[fnName]();
const { POS, COL, CHAN } = probeLib.getBuffers();
process.stdout.write(JSON.stringify({ POS: Array.from(POS), COL: Array.from(COL), CHAN: Array.from(CHAN) }));
`);

function runWorker(absFile, fnName){
  return new Promise((resolve, reject) => {
    const child = fork(workerPath, [absFile, fnName, PROBE_LIB], { stdio: ["ignore", "pipe", "pipe", "ipc"] });
    let out = "", err = "";
    child.stdout.on("data", d => out += d);
    child.stderr.on("data", d => err += d);
    child.on("exit", code => {
      if(code !== 0 || !out) return reject(new Error(err || `worker exited ${code}`));
      try { resolve(JSON.parse(out)); } catch(e){ reject(new Error("bad worker output: " + out.slice(0, 200))); }
    });
  });
}

function hashBuffers(POS, COL, CHAN){
  const h = crypto.createHash("sha256");
  h.update(Buffer.from(Float64Array.from(POS).buffer));
  h.update(Buffer.from(Uint8Array.from(COL.map(x => Math.round(x * 255)))));
  h.update(Buffer.from(Uint8Array.from(CHAN)));
  return h.digest("hex");
}

// the three formerly-offending creatures named in the spec
const OFFENDERS = [
  { file: "rlm-corrosive-splice-ooze.js", fn: "buildCorrosiveSpliceOoze", label: "corrosive-splice-ooze" },
  { file: "rlm-the-unfinished-cathedral-made-flesh.js", fn: "buildTheUnfinishedCathedralMadeFlesh", label: "the-unfinished-cathedral-made-flesh" },
  { file: "prop-sin-eaters-bowl-stand.js", fn: "buildPropSinEatersBowlStand", label: "sin-eaters-bowl-stand" },
];

// ============================================================================
// 1. [RED-FIRST] determinism: build each formerly-offending creature TWICE in genuinely fresh
//    processes, compare vertex count + a hash of the color/position/channel attribute buffers.
// ============================================================================
console.log("=== 1. [RED-FIRST] formerly-offending creatures: two fresh builds, identical output ===");
let redProven = false;
try {
  for(const { file, fn, label } of OFFENDERS){
    const absFile = join(CREATURES_DIR, file);
    let a, b, err = null;
    try {
      a = await runWorker(absFile, fn);
      b = await runWorker(absFile, fn);
    } catch(e){ err = e; }
    if(err){
      check(`${label} builds without throwing`, false, String(err.message || err));
      continue;
    }
    const sameCount = a.POS.length === b.POS.length && a.COL.length === b.COL.length && a.CHAN.length === b.CHAN.length;
    const hashA = sameCount ? hashBuffers(a.POS, a.COL, a.CHAN) : null;
    const hashB = sameCount ? hashBuffers(b.POS, b.COL, b.CHAN) : null;
    const identical = sameCount && hashA === hashB;
    if(!identical) redProven = true;
    check(`${label} — identical vertex count + attribute hash across two fresh builds`,
      identical, sameCount ? `hash mismatch (${hashA} vs ${hashB})` : `vertex count drift (${a.POS.length} vs ${b.POS.length})`);
  }
} finally {
  try { unlinkSync(workerPath); } catch(e){}
}
console.log(`  (i) ${redProven ? "at least one offender diverged (this is the pre-fix red)" : "all three offenders identical across fresh builds"}`);

// ============================================================================
// 2. grep-gate: Math.random has ZERO hits under dev/model-qa/creatures/ — the WHOLE directory,
//    not just the three known offenders (the sweep is the law, not the list).
// ============================================================================
console.log("\n=== 2. grep-gate: Math.random sweep (whole directory) ===");
const creatureFiles = readdirSync(CREATURES_DIR).filter(f => f.endsWith(".js"));
const grepOffenders = creatureFiles.filter(f => /Math\.random/.test(readFileSync(join(CREATURES_DIR, f), "utf-8")));
check("zero Math.random hits under dev/model-qa/creatures/", grepOffenders.length === 0, grepOffenders.join(", "));
check("swept >= 3 files (sanity: the directory is non-trivially sized)", creatureFiles.length >= 3, creatureFiles.length);

// ============================================================================
// 3. spot check: the three formerly-offending creatures still carry their decoration (no bald
//    regression from the determinism fix) — structural presence check, not a pixel compare; the
//    capture-sheet spot render is the orchestrator's own visual eyeball per the spec.
// ============================================================================
console.log("\n=== 3. formerly-offending creatures still decorate (no bald regression) ===");
{
  const workerPath2 = join(ROOT, "dev/.verify-creature-determinism-worker2.mjs");
  writeFileSync(workerPath2, `
import { pathToFileURL } from "node:url";
const [,, absFile, fnName, absProbeLib] = process.argv;
const probeLib = await import(pathToFileURL(absProbeLib).href);
const mod = await import(pathToFileURL(absFile).href);
probeLib.resetGeom();
mod[fnName]();
const { POS, COL, CHAN } = probeLib.getBuffers();
process.stdout.write(JSON.stringify({ POS: Array.from(POS), COL: Array.from(COL), CHAN: Array.from(CHAN) }));
`);
  const runWorker2 = (absFile, fnName) => new Promise((resolve, reject) => {
    const child = fork(workerPath2, [absFile, fnName, PROBE_LIB], { stdio: ["ignore", "pipe", "pipe", "ipc"] });
    let out = "", err = "";
    child.stdout.on("data", d => out += d);
    child.stderr.on("data", d => err += d);
    child.on("exit", code => {
      if(code !== 0 || !out) return reject(new Error(err || `worker exited ${code}`));
      try { resolve(JSON.parse(out)); } catch(e){ reject(new Error("bad worker output: " + out.slice(0, 200))); }
    });
  });
  try {
    for(const { file, fn, label } of OFFENDERS){
      const r = await runWorker2(join(CREATURES_DIR, file), fn);
      check(`${label} still emits >0 tris (decoration intact)`, r.POS.length > 0, r.POS.length);
    }
  } finally {
    try { unlinkSync(workerPath2); } catch(e){}
  }
}

// ============================================================================
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
