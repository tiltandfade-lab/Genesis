/* Verify C1A-CLAY-ROOM (docs/C1A-CLAY-ROOM.md) — jsdom, full manifest classic-script load order (same
   bootstrap convention as dev/verify-theater-lighting.mjs), no GL, no window.Theater: this harness only
   exercises the PURE data layer (src/engine/clay-room.js). The theater-boot.js GL mount (mountClayRoom
   etc.) is the browser-check gate (serve + ?clayroom=1), not covered here — checks 7/8 below only grep
   the SOURCE TEXT of that file's marked additions region for forbidden tokens, never execute it.

   Red-first checks (⊗ in docs/C1A-CLAY-ROOM.md's own Verification list):
     1. ⊗ Determinism: two fresh windows, same seed -> JSON.stringify byte-identical; different seed -> differs.
     2. ⊗ Truth shape: 25 cells stable ids; full perimeter walls; portal on the north edge at a wall cell;
        crate cell != portal cell != citizen cell; record.tier === "test"; Object.isFrozen(record); version===1.
     3. ⊗ BodyForm provenance: bodyForm.worldHeight/heightSource strictly equal the goblin's SPRITE_REGISTRY
        values; MUTATION CHECK — stub spr-fantasy-goblin-warrior's worldHeight to null and confirm
        clayRoomRecordFrom throws (loud failure, never a silent default).
     4. ⊗ Prose twin completeness: clayRoomProse(record) contains every id, the dims, the seed, the tier,
        the citizen height + heightSource (string-containment, one check per fact).
     5. Light profile shape: two points; points[0].color !== points[1].color; positions on opposing x sides;
        ambient intensity <= 0.25 as authored.
     6. Refusal: clayRoomEditRefusal("worldHeight") deep-equals the D11 shape.
     7. Renderer-owns-zero-mechanics grep-gate: the theater-boot.js clay-room ADDITIONS region (delimited by
        the CLAY-ROOM ADDITIONS BEGIN/END markers) contains no d20|roll|applyEvent|attack tokens.
     8. Telemetry leak grep-gate: src/engine/clay-room.js + the theater-boot.js additions region contain no
        fetch(|XMLHttpRequest|WebSocket.
     9. python3 build/check-manifest.py -> RESULT: OK.

   Run:  node dev/verify-clay-room.mjs   (jsdom in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleTypedPaths = new Set(man.modules.filter(m => m.type === "module").map(m => m.path));
const classicPaths = man.loadOrder.filter((p) => p.endsWith(".js") && !moduleTypedPaths.has(p));

// buildModuleSrc(overrides): overrides is an optional Map(path -> replacement source text), used by
// the check-3 mutation test to swap in a doctored data/sprite-registry.js without touching the real
// file on disk. Every other path reads straight off the filesystem, same as the plain path.
function buildModuleSrc(overrides){
  return classicPaths.map((p) => (overrides && overrides.has(p)) ? overrides.get(p) : read(p)).join("\n;\n");
}

const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null; var GS={};`;
// SPRITE_BY_BESTIARY_ID/SPRITE_REGISTRY are top-level `const` in data/sprite-registry.js — they never
// attach to jsdom's `window` under win.eval (only var/function do), the exact gotcha
// dev/verify-theater-data.mjs and dev/verify-theater-lighting.mjs both already document. Small
// function-declaration accessors (functions DO attach) evaluated inside the SAME window read them
// out for assertions made from outside the eval'd scope.
const accessors = "function __clayBestiaryIndex(){return SPRITE_BY_BESTIARY_ID;} function __claySpriteRegistry(){return SPRITE_REGISTRY;}";

function freshWin(overrides){
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + read("tables.js") + "\n;\n" + buildModuleSrc(overrides) + "\n;\n" + accessors);
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 1. ⊗ determinism
// ============================================================================
{
  let threw = null;
  try {
    const winA = freshWin();
    const winB = freshWin();
    const recA = winA.clayRoomRecordFrom(0x6c0ffee);
    const recB = winB.clayRoomRecordFrom(0x6c0ffee);
    check("1a. same seed across two fresh windows -> byte-identical JSON",
      JSON.stringify(recA) === JSON.stringify(recB));

    const recC = winA.clayRoomRecordFrom(0xdeadbeef);
    check("1b. a different seed -> the JSON differs",
      JSON.stringify(recA) !== JSON.stringify(recC));
  } catch(e) { threw = e; }
  if(threw) check("1. determinism (module present, no throw)", false, threw.stack || String(threw));
}

// ============================================================================
// 2. ⊗ truth shape
// ============================================================================
{
  try {
    const win = freshWin();
    const record = win.clayRoomRecordFrom(0x6c0ffee);

    check("2a. 25 cells with stable ids", Array.isArray(record.cells) && record.cells.length === 25 &&
      new Set(record.cells.map(c => c.id)).size === 25, "cells=" + (record.cells && record.cells.length));

    const edges = { n: 0, s: 0, e: 0, w: 0 };
    (record.walls || []).forEach(w => { if(edges[w.edge] != null) edges[w.edge]++; });
    check("2b. full perimeter walls (all four edges populated)",
      edges.n === 5 && edges.s === 5 && edges.e === 5 && edges.w === 5, JSON.stringify(edges));

    const northWallCells = new Set();
    (record.walls || []).filter(w => w.edge === "n").forEach(w => (w.cells || []).forEach(id => northWallCells.add(id)));
    check("2c. portal sits on the north edge at a wall cell",
      record.portal.edge === "n" && northWallCells.has(record.portal.cell),
      "portal.cell=" + record.portal.cell + " northWallCells=" + JSON.stringify([...northWallCells]));

    check("2d. crate cell != portal cell != citizen cell",
      record.object.cell !== record.portal.cell && record.citizen.cell !== record.portal.cell &&
      record.object.cell !== record.citizen.cell,
      `object=${record.object.cell} portal=${record.portal.cell} citizen=${record.citizen.cell}`);

    check("2e. record.tier === \"test\"", record.tier === "test", record.tier);
    check("2f. Object.isFrozen(record)", Object.isFrozen(record));
    check("2g. version === 1", record.version === 1, record.version);
  } catch(e) { check("2. truth shape (module present, no throw)", false, e.stack || String(e)); }
}

// ============================================================================
// 3. ⊗ BodyForm provenance + mutation check
// ============================================================================
{
  try {
    const win = freshWin();
    const record = win.clayRoomRecordFrom(0x6c0ffee);
    const slug = win.__clayBestiaryIndex()[record.citizen.bestiaryId];
    const regEntry = win.__claySpriteRegistry()[slug];
    check("3a. bodyForm.worldHeight strictly equals the registry value",
      record.citizen.bodyForm.worldHeight === regEntry.worldHeight,
      `bodyForm=${record.citizen.bodyForm.worldHeight} registry=${regEntry.worldHeight}`);
    check("3b. bodyForm.heightSource strictly equals the registry value",
      record.citizen.bodyForm.heightSource === regEntry.heightSource,
      `bodyForm=${record.citizen.bodyForm.heightSource} registry=${regEntry.heightSource}`);
  } catch(e) { check("3ab. BodyForm provenance (module present, no throw)", false, e.stack || String(e)); }

  // MUTATION: null out spr-fantasy-goblin-warrior's own worldHeight in a cloned copy of
  // data/sprite-registry.js's source text, feed that ONE substitution into a fresh window, and
  // confirm clayRoomRecordFrom throws rather than silently defaulting.
  const registrySrcPath = "data/sprite-registry.js";
  const registrySrc = read(registrySrcPath);
  const mutated = registrySrc.replace(
    /("spr-fantasy-goblin-warrior":\s*\{[^}]*?worldHeight:)3\.5/,
    "$1null"
  );
  check("3c. MUTATION applies cleanly (block replaced)", mutated !== registrySrc);
  let threwOnMutation = false, mutationErr = null;
  try {
    const winMut = freshWin(new Map([[registrySrcPath, mutated]]));
    winMut.clayRoomRecordFrom(0x6c0ffee);
  } catch(e) { threwOnMutation = true; mutationErr = e; }
  check("3d. a null worldHeight in the registry makes clayRoomRecordFrom throw (loud, never silent)",
    threwOnMutation, threwOnMutation ? String(mutationErr && mutationErr.message) : "did not throw");
}

// ============================================================================
// 4. ⊗ prose twin completeness
// ============================================================================
{
  try {
    const win = freshWin();
    const record = win.clayRoomRecordFrom(0x6c0ffee);
    const prose = win.clayRoomProse(record);
    const facts = {
      "record.id": record.id,
      "record.seed": record.seed,
      "record.tier": record.tier,
      "dims.w": record.dims.w,
      "dims.d": record.dims.d,
      "cells.length": record.cells.length,
      "portal.id": record.portal.id,
      "portal.edge": record.portal.edge,
      "portal.cell": record.portal.cell,
      "object.id": record.object.id,
      "object.cell": record.object.cell,
      "citizen.id": record.citizen.id,
      "citizen.cell": record.citizen.cell,
      "citizen.bodyForm.worldHeight": record.citizen.bodyForm.worldHeight,
      "citizen.bodyForm.heightSource": record.citizen.bodyForm.heightSource,
    };
    Object.keys(facts).forEach((k) => {
      check("4. prose contains " + k + " (" + facts[k] + ")", prose.indexOf(String(facts[k])) >= 0, prose);
    });
  } catch(e) { check("4. prose twin completeness (module present, no throw)", false, e.stack || String(e)); }
}

// ============================================================================
// 5. light profile shape
// ============================================================================
{
  try {
    const win = freshWin();
    const profile = win.CLAY_C1A_LIGHT_PROFILE;
    check("5a. two points", Array.isArray(profile.points) && profile.points.length === 2);
    check("5b. points[0].color !== points[1].color", profile.points[0].color !== profile.points[1].color);
    check("5c. positions on opposing x sides (sign differs)",
      Math.sign(profile.points[0].pos.x) !== Math.sign(profile.points[1].pos.x),
      `${profile.points[0].pos.x} vs ${profile.points[1].pos.x}`);
    check("5d. ambient intensity <= 0.25 as authored", profile.ambient.intensity <= 0.25, profile.ambient.intensity);
  } catch(e) { check("5. light profile shape (module present, no throw)", false, e.stack || String(e)); }
}

// ============================================================================
// 6. refusal
// ============================================================================
{
  try {
    const win = freshWin();
    const refusal = win.clayRoomEditRefusal("worldHeight");
    const expected = { refused: true, reason: "generated-artifact", source: "data/sprite-registry.js" };
    check("6. clayRoomEditRefusal(\"worldHeight\") deep-equals the D11 shape",
      JSON.stringify(refusal) === JSON.stringify(expected) &&
      Object.keys(refusal).sort().join(",") === Object.keys(expected).sort().join(","),
      JSON.stringify(refusal));
  } catch(e) { check("6. refusal (module present, no throw)", false, e.stack || String(e)); }
}

// ============================================================================
// 7. renderer-owns-zero-mechanics grep-gate (theater-boot.js additions region)
// ============================================================================
{
  const bootSrc = read("src/ui/theater-boot.js");
  const beginMark = "/* CLAY-ROOM ADDITIONS BEGIN";
  const endMark = "CLAY-ROOM ADDITIONS END */";
  const bi = bootSrc.indexOf(beginMark), ei = bootSrc.indexOf(endMark);
  if(bi === -1 || ei === -1 || ei < bi){
    check("7. theater-boot.js clay-room additions region found (CLAY-ROOM ADDITIONS BEGIN/END markers)", false,
      "not found yet — expected once the U2 wire-in lands");
  } else {
    const region = bootSrc.slice(bi, ei + endMark.length);
    const hit = region.match(/d20|roll|applyEvent|attack/);
    check("7. theater-boot.js clay-room additions contain no d20|roll|applyEvent|attack tokens",
      !hit, hit ? ("matched \"" + hit[0] + "\" near index " + hit.index) : "");
  }
}

// ============================================================================
// 8. telemetry leak grep-gate
// ============================================================================
{
  const clayRoomSrc = read("src/engine/clay-room.js");
  const telemetryRe = /fetch\(|XMLHttpRequest|WebSocket/;
  check("8a. src/engine/clay-room.js contains no fetch(/XMLHttpRequest/WebSocket",
    !telemetryRe.test(clayRoomSrc));

  const bootSrc = read("src/ui/theater-boot.js");
  const beginMark = "/* CLAY-ROOM ADDITIONS BEGIN";
  const endMark = "CLAY-ROOM ADDITIONS END */";
  const bi = bootSrc.indexOf(beginMark), ei = bootSrc.indexOf(endMark);
  if(bi === -1 || ei === -1 || ei < bi){
    check("8b. theater-boot.js clay-room additions region found for the telemetry scan", false,
      "not found yet — expected once the U2 wire-in lands");
  } else {
    const region = bootSrc.slice(bi, ei + endMark.length);
    check("8b. theater-boot.js clay-room additions contain no fetch(/XMLHttpRequest/WebSocket",
      !telemetryRe.test(region));
  }
}

// ============================================================================
// 9. check-manifest.py -> RESULT: OK
// ============================================================================
{
  const res = spawnSync("python3", ["build/check-manifest.py"], { cwd: ROOT, encoding: "utf-8" });
  const out = (res.stdout || "") + (res.stderr || "");
  check("9. python3 build/check-manifest.py -> RESULT: OK", res.status === 0 && /RESULT:\s*OK/.test(out),
    out.trim().split("\n").slice(-3).join(" | "));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
