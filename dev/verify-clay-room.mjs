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
    10. Spec addendum D1a boot self-mount hook: the theater-boot.js clay-room additions region
        defines clayRoomBootSelfMount() (calling both clayRoomShouldEnable() and mountClayRoom()) AND
        invokes it as a bare, column-0 (module-top-level) statement — proving the self-mount fires at
        BOOT, not only from inside clayRoomMaybeAutoMount's per-frame poll (which only ever runs once
        a theater is already mounted and drawing frames — never on a cold title-screen boot, the
        defect this addendum exists to fix). Source-text/convention check only (this harness never
        executes theater-boot.js — see the note above); the live cold-load proof is the browser gate.

   D12 addendum (Adam's founder redlines on capture packet #1, 2026-07-23 — verbatim: "i need a
   semi-transparent grid overlaying the seams of the tiles" / "i can't tell if that door is supposed
   to be open or closed or if it's just janky and completely broken"), plus the coordinator's re-gate
   correction on D12b (render the door through the EXISTING production door/interactable builder,
   never hand-built geometry):
    11. ⊗ record.portal.state === "closed" (D12b instruction 1 — the record carries the fact, not
        just the render).
    12. ⊗ clayRoomProse(record) contains "the door is closed." verbatim (the prose twin reflects the
        same fact the render projects — GEN-LAW-3/TEXT-FIRST, D9).
    13. ⊗ D12a seam-grid grep-gate (source-text only, this harness never executes GL): the additions
        region defines a grid builder whose line-count math reads record.dims.w/record.dims.d (never
        a hardcoded cell count), uses THREE.LineSegments, and authors a material opacity in
        [0.25, 0.35].
    14. ⊗ D12b-corrected wiring grep-gate (the coordinator's addendum — "a stubbed door can never
        pass this harness again"): the additions region registers the portal as a real door
        interactable (archetype:"door", feeding interiorBuildInteractables/
        interiorBuildInteractableDoorMesh, theater-boot.js ~4335/4209) AND supplies the production
        kitDoors minimal-plan field (widthAxisIsZ, feeding interiorBuildKitDoorMesh via
        itrKitDoorMap, theater-boot.js ~4136/4340) — AND that no bespoke door-leaf geometry
        (THREE.ExtrudeGeometry/THREE.Shape — the exact primitives the real leaf builder itself uses)
        was hand-authored in this file's own additions region, and the single-box doorframe literal
        (the production doorframe instanced-mesh channel's own input) was never expanded into a
        hand-rolled multi-piece frame assembly.

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

// ============================================================================
// 10. ⊗ D1a boot self-mount hook (orchestrator re-gate addendum) — source-text/convention check;
//     this harness never executes theater-boot.js's module body (see this file's own header), so
//     this proves the SHAPE of the fix (a top-level, not-poll-gated invocation), not runtime behavior
//     — the live cold-load (genesis.html?clayroom=1, no game session) is the actual browser gate.
// ============================================================================
{
  const bootSrc = read("src/ui/theater-boot.js");
  const beginMark = "/* CLAY-ROOM ADDITIONS BEGIN";
  const endMark = "CLAY-ROOM ADDITIONS END */";
  const bi = bootSrc.indexOf(beginMark), ei = bootSrc.indexOf(endMark);
  if(bi === -1 || ei === -1 || ei < bi){
    check("10. theater-boot.js clay-room additions region found for the boot-mount scan", false,
      "not found yet — expected once the U2 wire-in lands");
  } else {
    const region = bootSrc.slice(bi, ei + endMark.length);

    check("10a. clayRoomBootSelfMount() is defined in the additions region",
      /function\s+clayRoomBootSelfMount\s*\(\s*\)\s*\{/.test(region));

    const fnMatch = region.match(/function\s+clayRoomBootSelfMount\s*\(\)\s*\{([\s\S]*?)\n\}/);
    const fnBody = fnMatch ? fnMatch[1] : "";
    check("10b. clayRoomBootSelfMount() calls both clayRoomShouldEnable() and mountClayRoom()",
      /clayRoomShouldEnable\s*\(\s*\)/.test(fnBody) && /mountClayRoom\s*\(\s*\)/.test(fnBody),
      fnBody);

    // Convention check (this file's own indentation style — every top-level function/const sits at
    // column 0; every statement inside a function body is indented): a bare, UNINDENTED call proves
    // the self-mount fires at MODULE TOP-LEVEL (boot time), not merely defined-but-uncalled, and not
    // buried back inside some other function (e.g. clayRoomMaybeAutoMount, which only ever runs from
    // renderTheaterFrame's per-frame poll and would silently reproduce the cold-boot defect this
    // addendum exists to fix).
    check("10c. clayRoomBootSelfMount() is invoked as a bare column-0 statement (module top-level, not only from renderTheaterFrame's poll)",
      /^clayRoomBootSelfMount\(\);\s*$/m.test(region));
  }
}

// ============================================================================
// 11. ⊗ D12b instruction 1 — record.portal.state
// ============================================================================
{
  try {
    const win = freshWin();
    const record = win.clayRoomRecordFrom(0x6c0ffee);
    check("11. record.portal.state === \"closed\"", record.portal.state === "closed", record.portal.state);
  } catch(e) { check("11. record.portal.state (module present, no throw)", false, e.stack || String(e)); }
}

// ============================================================================
// 12. ⊗ D12b instruction 1 — prose contains "the door is closed."
// ============================================================================
{
  try {
    const win = freshWin();
    const record = win.clayRoomRecordFrom(0x6c0ffee);
    const prose = win.clayRoomProse(record);
    check("12. clayRoomProse(record) contains \"the door is closed.\" verbatim",
      prose.indexOf("the door is closed.") >= 0, prose);
  } catch(e) { check("12. prose \"door is closed\" (module present, no throw)", false, e.stack || String(e)); }
}

// ============================================================================
// 13. ⊗ D12a seam-grid grep-gate (theater-boot.js additions region) — source-text only
// ============================================================================
{
  const bootSrc = read("src/ui/theater-boot.js");
  const beginMark = "/* CLAY-ROOM ADDITIONS BEGIN";
  const endMark = "CLAY-ROOM ADDITIONS END */";
  const bi = bootSrc.indexOf(beginMark), ei = bootSrc.indexOf(endMark);
  if(bi === -1 || ei === -1 || ei < bi){
    check("13. theater-boot.js clay-room additions region found for the seam-grid scan", false,
      "not found yet — expected once the D12a grid lands");
  } else {
    const region = bootSrc.slice(bi, ei + endMark.length);

    check("13a. a seam-grid builder function is defined in the additions region",
      /function\s+clayRoomBuildSeamGrid\s*\(record\)\s*\{/.test(region));

    const fnMatch = region.match(/function\s+clayRoomBuildSeamGrid\s*\(record\)\s*\{([\s\S]*?)\n\}/);
    const fnBody = fnMatch ? fnMatch[1] : "";

    // line count derived FROM record.dims — never a hardcoded cell count (the spec's own "(w+1)+(d+1)
    // lines, derived FROM record.dims"). Checks the actual loop-bound comparisons, not just any mention
    // of the string "record.dims" (a comment alone would falsely pass a looser test).
    check("13b. grid line count loops read <= record.dims.w (never a hardcoded literal)",
      /<=\s*record\.dims\.w/.test(fnBody), fnBody);
    check("13c. grid line count loops read <= record.dims.d (never a hardcoded literal)",
      /<=\s*record\.dims\.d/.test(fnBody), fnBody);

    check("13d. THREE.LineSegments is used to render the grid",
      /new\s+THREE\.LineSegments\s*\(/.test(fnBody));

    // opacity in [0.25, 0.35] — parse the authored const rather than pattern-match a bare number in
    // the material call, so this stays correct if the material construction line wraps/reformats.
    const opacityMatch = region.match(/CLAY_GRID_OPACITY\s*=\s*(0?\.\d+|\d+(?:\.\d+)?)/);
    const opacityVal = opacityMatch ? parseFloat(opacityMatch[1]) : NaN;
    check("13e. an authored grid opacity value exists and falls in [0.25, 0.35]",
      Number.isFinite(opacityVal) && opacityVal >= 0.25 && opacityVal <= 0.35, String(opacityVal));
    check("13f. that authored opacity constant is actually wired into the LineBasicMaterial",
      /LineBasicMaterial\(\{[^}]*opacity:\s*CLAY_GRID_OPACITY/.test(fnBody), fnBody);

    // "sit under the figures/objects visually (render order)" — a renderOrder below the scene
    // default (0) on the grid object.
    check("13g. the grid mesh is given a renderOrder below the scene default (renders under other transparent draws)",
      /grid\.renderOrder\s*=\s*-\d/.test(fnBody), fnBody);
  }
}

// ============================================================================
// 14. ⊗ D12b-corrected wiring grep-gate (coordinator addendum) — proves the door renders through the
//     EXISTING production door/interactable builder chain, never a bespoke re-modeled leaf/frame.
// ============================================================================
{
  const bootSrc = read("src/ui/theater-boot.js");
  const beginMark = "/* CLAY-ROOM ADDITIONS BEGIN";
  const endMark = "CLAY-ROOM ADDITIONS END */";
  const bi = bootSrc.indexOf(beginMark), ei = bootSrc.indexOf(endMark);
  if(bi === -1 || ei === -1 || ei < bi){
    check("14. theater-boot.js clay-room additions region found for the door-wiring scan", false,
      "not found yet — expected once the D12b-corrected wiring lands");
  } else {
    const region = bootSrc.slice(bi, ei + endMark.length);

    check("14a. the portal is registered as a real door interactable (archetype:\"door\") — feeds interiorBuildInteractables",
      /archetype:\s*"door"/.test(region));

    check("14b. the door interactable's state reads record.portal.state (never a hardcoded literal)",
      /state:\s*record\.portal\.state/.test(region));

    check("14c. the production kitDoors minimal-plan field is supplied — feeds interiorBuildKitDoorMesh via itrKitDoorMap",
      /kitDoors:\s*kitDoors\b/.test(region));

    check("14d. the kitDoors entry carries widthAxisIsZ (the real per-entry orientation override)",
      /widthAxisIsZ:\s*CLAY_PORTAL_WIDTH_AXIS_IS_Z\[record\.portal\.edge\]/.test(region));

    // NEGATIVE checks — a stubbed/re-modeled door leaf never passes this harness again: the real
    // leaf builder (interiorBuildInteractableDoorMesh, theater-boot.js) is the ONLY place
    // ExtrudeGeometry/THREE.Shape legitimately build a door leaf; their absence here proves this
    // file's own additions region never duplicated that geometry locally.
    check("14e. no bespoke ExtrudeGeometry leaf construction in the additions region",
      !/ExtrudeGeometry\s*\(/.test(region), "matched ExtrudeGeometry(");
    check("14f. no bespoke THREE.Shape leaf construction in the additions region",
      !/THREE\.Shape\s*\(/.test(region), "matched THREE.Shape(");

    // the doorframe box stays the ORIGINAL single-object-literal shape (the production doorframe
    // instanced-mesh channel's own input) — guards against a future session re-expanding it into a
    // hand-rolled multi-piece jamb/lintel/leaf assembly (the exact class of fix this addendum forbids).
    check("14g. the doorframe instances array stays the single-box literal (never expanded into a hand-rolled multi-piece frame)",
      /const doorframe = portalCell \? \[\{/.test(region));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
