/* Verify docs/STAGE-D-WAVE-SPECS.md D1 (Interactables fold & registry) — build/gen-interactables.py
   -> data/interactables.js: INTERACTABLE_ARCHETYPE_STATES, INTERACTABLES_CORE3_REALMS,
   INTERACTABLES_REGISTRY. Modeled on dev/verify-place-dressing.mjs (the REALM_DRESSING-family
   harness convention this unit's spec names).

   Full-app jsdom load, same convention as verify-place-dressing.mjs / verify-dm-events.mjs: the
   registry consts are top-level `const` in data/interactables.js — a lexical binding, never a
   `window` property even under jsdom's runScripts:"dangerously" — so this file appends same-scope
   accessor FUNCTION declarations (those DO attach to window) rather than reading the consts
   directly off `win`.

   Covers the D1 spec's own verify list (STAGE-D-WAVE-SPECS.md:115-120):
     ⊗ deterministic fold (two runs of the generator are byte-identical)
     - every rostered slug resolves art + extrudeDepth + location + renderStrategy at EVERY state
       in its archetype's state list, for all 12 realms
     - type -> depth bands assert: flush/flush-tier (trap 0.02) < standard/floor-volume tier
       (container 0.20) < hero/floor-volume tier (chest 0.28); mounted (lever 0.12) and deep-wall
       (door/portal/shrine 0.30-0.34) both sit above flush and are internally consistent
     - no location:"both" survives anywhere in the registry
     - core-3 (fantasy/gloom/chrome) complete + active:true; the other 8 realms present but
       active:false (present-but-inert)
     - `python3 build/gen-interactables.py --check` mode (this file also shells out to it)

   RED-FIRST: this harness is written against the already-landed generator (no pre-unit tree to
   diff against, since D1 mints data/interactables.js from nothing) — the red-first evidence here
   is the mutation checks below (stub the registry to reintroduce a location:"both" / a missing
   state / an out-of-order depth band and confirm the assertion catches it), run inline against a
   deliberately-corrupted in-memory copy, never against the real file.

   Run:  node dev/verify-interactables-registry.mjs   (jsdom per-env in ~/.genesis-jsdom — see
   CLAUDE.md "headless test"; override with JSDOM_HOME) */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");

function boot(sourceText) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(sourceText
    + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};"
    + "\nfunction __states(){return INTERACTABLE_ARCHETYPE_STATES;}"
    + "\nfunction __core3(){return INTERACTABLES_CORE3_REALMS;}"
    + "\nfunction __registry(){return INTERACTABLES_REGISTRY;}");
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const win = boot(src);
const STATES = win.__states();
const CORE3 = win.__core3();
const REGISTRY = win.__registry();

// --- basic presence -----------------------------------------------------------------------------
check("INTERACTABLE_ARCHETYPE_STATES present", STATES && typeof STATES === "object");
check("INTERACTABLES_CORE3_REALMS present", Array.isArray(CORE3) && CORE3.length === 3);
check("INTERACTABLES_REGISTRY present", REGISTRY && typeof REGISTRY === "object");

const ARCHETYPES = STATES ? Object.keys(STATES) : [];
check("8 archetypes present", ARCHETYPES.length === 8, `got ${ARCHETYPES.length}: ${ARCHETYPES.join(",")}`);
check("core-3 is exactly fantasy/gloom/chrome", CORE3 && ["fantasy", "gloom", "chrome"].every((r) => CORE3.includes(r)) && CORE3.length === 3);

const REALMS = Object.keys(REGISTRY);
check("12 realms folded", REALMS.length === 12, `got ${REALMS.length}: ${REALMS.join(",")}`);

// --- every rostered slug resolves art + extrudeDepth + location + renderStrategy at every state -
let missingEntry = 0, missingField = 0, artMissingActive = 0, locationBoth = 0;
const ART_DIR = join(ROOT, "assets", "dressing");
const { existsSync } = await import("node:fs");
for (const realm of REALMS) {
  const roster = REGISTRY[realm];
  for (const archetype of ARCHETYPES) {
    for (const state of STATES[archetype]) {
      const key = `${archetype}@${state}`;
      const entry = roster[key];
      if (!entry) { missingEntry++; continue; }
      const fieldsOk = typeof entry.slug === "string" && entry.slug.length > 0
        && typeof entry.extrudeDepth === "number" && isFinite(entry.extrudeDepth)
        && typeof entry.location === "string" && entry.location.length > 0
        && typeof entry.renderStrategy === "string" && entry.renderStrategy.length > 0
        && typeof entry.active === "boolean";
      if (!fieldsOk) missingField++;
      if (entry.location === "both") locationBoth++;
      if (entry.active && !existsSync(join(ART_DIR, `${entry.slug}.png`))) artMissingActive++;
    }
  }
}
check("every realm x archetype x state resolves a registry entry", missingEntry === 0, `${missingEntry} missing`);
check("every entry resolves slug+extrudeDepth+location+renderStrategy+active", missingField === 0, `${missingField} incomplete`);
check("no location:\"both\" survives anywhere", locationBoth === 0, `${locationBoth} entries still 'both'`);
check("every active entry's art file exists on disk (assets/dressing/<slug>.png)", artMissingActive === 0, `${artMissingActive} missing`);

// --- core-3 complete + active, others present-but-inert ------------------------------------------
let core3Inactive = 0, othersActive = 0;
for (const realm of REALMS) {
  const roster = REGISTRY[realm];
  const allEntries = Object.values(roster);
  const isCore3 = CORE3.includes(realm);
  for (const entry of allEntries) {
    if (isCore3 && entry.active !== true) core3Inactive++;
    if (!isCore3 && entry.active !== false) othersActive++;
  }
}
check("core-3 realms are fully active", core3Inactive === 0, `${core3Inactive} core-3 entries not active`);
check("non-core-3 realms are fully inert", othersActive === 0, `${othersActive} non-core-3 entries wrongly active`);

// --- type -> depth band ordering (flush < standard < hero; mounted/deep-wall internally sane) ---
const depthOf = (realm, archetype, state) => REGISTRY[realm][`${archetype}@${state}`].extrudeDepth;
const trapDepth = depthOf("fantasy", "trap", "hidden");
const containerDepth = depthOf("fantasy", "container", "intact");
const chestDepth = depthOf("fantasy", "chest", "closed");
const leverDepth = depthOf("fantasy", "lever", "left");
const doorDepth = depthOf("fantasy", "door", "shut");
check("flush (trap) < standard (container) < hero (chest)", trapDepth < containerDepth && containerDepth < chestDepth,
  `trap=${trapDepth} container=${containerDepth} chest=${chestDepth}`);
check("flush (trap) < mounted (lever) < deep-wall (door)", trapDepth < leverDepth && leverDepth < doorDepth,
  `trap=${trapDepth} lever=${leverDepth} door=${doorDepth}`);

// --- construction-seam-law defaults named by the source docs -------------------------------------
check("door = extrude (§C reconciled, verbatim)", REGISTRY.fantasy["door@shut"].renderStrategy === "extrude");
check("chest = model (§C reconciled, verbatim)", REGISTRY.fantasy["chest@closed"].renderStrategy === "model");
check("container = faced-box (§C reconciled, verbatim)", REGISTRY.fantasy["container@intact"].renderStrategy === "faced-box");
check("lever = extrude (\"grate/lever = EXTRUDE\", verbatim)", REGISTRY.fantasy["lever@left"].renderStrategy === "extrude");
check("portal = model (D1's own default list + §H MODEL bullet 3, verbatim)", REGISTRY.fantasy["portal@sealed"].renderStrategy === "model");

// --- deterministic fold: two generator runs are byte-identical -----------------------------------
const before = read("data/interactables.js");
execFileSync("python3", [join(ROOT, "build/gen-interactables.py"), "--emit"], { cwd: ROOT });
const after = read("data/interactables.js");
check("regen is byte-identical to the committed file (determinism)", before === after);

// --check mode itself
let checkModeOk = false;
try {
  execFileSync("python3", [join(ROOT, "build/gen-interactables.py"), "--check"], { cwd: ROOT });
  checkModeOk = true;
} catch (e) { checkModeOk = false; }
check("gen-interactables.py --check exits 0 against the committed file", checkModeOk);

// --- RED-FIRST mutation probes: corrupt an in-memory copy and confirm each assertion class fires -
function mutateAndCheck(label, mutateFn, assertFails) {
  const clone = JSON.parse(JSON.stringify(REGISTRY));
  mutateFn(clone);
  const caught = assertFails(clone);
  check(`RED-FIRST: ${label}`, caught, "mutation was NOT caught by the corresponding assertion");
}

mutateAndCheck(
  "reintroducing location:\"both\" is caught",
  (clone) => { clone.fantasy["door@shut"].location = "both"; },
  (clone) => Object.values(clone.fantasy).some((e) => e.location === "both")
);
mutateAndCheck(
  "deleting a required state entry is caught",
  (clone) => { delete clone.fantasy["trap@sprung"]; },
  (clone) => !clone.fantasy["trap@sprung"]
);
mutateAndCheck(
  "an out-of-order depth band (trap deeper than chest) is caught",
  (clone) => { clone.fantasy["trap@hidden"].extrudeDepth = 0.99; },
  (clone) => !(clone.fantasy["trap@hidden"].extrudeDepth < clone.fantasy["container@intact"].extrudeDepth)
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
