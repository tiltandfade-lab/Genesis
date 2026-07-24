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
    14. [SUPERSEDED by D15, 2026-07-23 — see below] used to grep for the OLD hand-assembled
        board-data shim's own door-wiring literals (archetype:"door", kitDoors:kitDoors,
        CLAY_PORTAL_WIDTH_AXIS_IS_Z, the single-box doorframe literal). D15 deletes that shim
        entirely (docs/C1A-CLAY-ROOM.md spec addendum D15 — "grey paint on real geometry is clay";
        two prior door attempts failed feeding production builders outside their input assumptions).
        RED-FIRST proof this check died for real, not by accident: run against tip 1b5111d1 (this
        file's own pre-D15 state) 14a/14b/14c/14d/14g passed; run again straight after D15's source
        edits landed (shim deleted, real chain wired) they went RED — the exact literals they grepped
        for no longer exist anywhere in the file (51 passed, 5 failed at that point; recorded in this
        unit's own build report). Check 14 below is REWRITTEN to test the NEW truth (D15's own
        checklist items a/b/d); check 15 is NEW (item c, the jsdom compile check); check 16 is NEW
        (D13 provenance-audit structural check).

   D15 (docs/C1A-CLAY-ROOM.md re-wire addendum, 2026-07-23) — replace the hand-assembled board-data
   shim with the REAL production compile chain (a pinned synthetic walk fixture -> spatializePlan ->
   interiorBuildBoard -> setInteriorBoard), never a hand-built instances/doorframe/kitDoors/
   interactables array:
    14. wiring + negative grep-gate (D15 checklist items a/b, extended per the unit's own stronger
        "no hand-built interactables either" reading): the additions region calls
        clayRoomBoardFrom(record) (src/engine/clay-room.js's real spatializer+interiorBuildBoard
        chain) and feeds its output straight to setInteriorBoard — AND contains NONE of
        `instances:{floor` / `doorframe:[` / `kitDoors:[` (the task's own 3 banned literals) / a hand-
        built door `archetype:` literal (the stronger interactables ban) anywhere in the region.
    15. ⊗ jsdom compile check (D15 checklist item c, cloned from dev/verify-dungeon-interior.mjs's own
        bootstrap idea but reusing THIS file's existing freshWin() full-manifest loader, which already
        carries place-spatialize.js/theater-interior.js/clay-room.js in classicPaths — no second vm
        sandbox needed): runs the adapter's synthetic fixture through the REAL spatializePlan +
        interiorBuildBoard headlessly via win.clayRoomBoardFrom(record); asserts the 5x5 room's floor
        cell count (25), >=1 door cell on record.portal.edge's own side (independently recomputed off
        the returned room+plan.doors, never trusting clayRoomBoardFrom's own internal assertion
        alone), byte-identical board JSON across two independent calls (determinism through the real
        chain), crate/citizen positions derived from the record's own cells offset by the real room
        rect, and that KIT_SHELL_ENABLED/KIT_DOORS_ENABLED land back at their prior values afterward
        (the save/restore discipline around theater-interior.js's own dev/harness escape hatch).
    16. D13 provenance-audit structural check (D15 checklist item d — grep-level, since this harness
        never mounts real GL/a real THREE.Scene): clayRoomProvenanceAudit/clayRoomTagAllProvenance/
        clayRoomTagProvenance are defined in the additions region, the tag literal
        (userData.clayProvenance = {builder,recordRef:"clay-c1a"}) is present, clayRoomTagAllProvenance
        is actually called from mountClayRoom (wiring, not just defined-but-unused), and the Explain
        tab's overlay code carries the live "Provenance audit: ... groups tagged, ... orphans" line.

   CL-R0 (docs/CLAYROOM-RESET-LADDER.md, 2026-07-23) — the durability invariant. The fixture was
   79/79 green here while the settled browser frame showed the realm's own textured dungeon floor
   (Adam: "It seems to have basic dungeon floor glued to it"); that gap IS finding CR-5, "the fixture
   gate proved truth, not beauty". The repair replaces two hand-written material sweeps + a hardcoded
   four-kind whitelist with a versioned engine-owned recipe (CLAY_DIAGNOSTIC_SURFACE_RECIPE) executed
   from ONE lifecycle hook at setInteriorBoard's tail:
    13. EXTENDED: 13e now evaluates the recipe's authored grid opacity live (was a source regex over a
        theater-boot literal, which moved into the recipe); 13e2 asserts theater-boot consumes the
        recipe rather than re-authoring a number; 13g/13h assert the CL-R0 coordinate fix (the grid is
        built in the SPATIALIZED room's frame — before the fix it mounted (3,13) cells away and
        rendered off-camera while auditing perfectly "owned").
    14. 14g/14h REWRITTEN: they used to assert clayRoomFlattenStructure existed and that
        CLAY_STRUCTURE_KINDS was exactly {floor,wall,doorframe,pillar}. That whitelist WAS the defect.
        They now assert both are GONE. Red-first proof they died for real: they pass at the branch
        base (3a789d0b) and went red the moment the sweeps were deleted.
    17. 17b REWRITTEN + 17b2 ADDED: the literal `ITR_ROOM_SHELL = false` became a flag read so the
        production-room-shell A/B is a ?clayshell=1 capture, not a source edit; the invariant is now
        asserted in two parts (applied before setInteriorBoard, AND default still OFF).
    18. NEW — the CL-R0 invariant proper. 18a-18g run LIVE against the real engine recipe: an unknown
        or unresolvable role must resolve to the loud "unclaimed" route and NEVER to clay; every
        structural role routes to clay; sprite/emitter stay passthrough so CL-R1/CL-R2 measure the real
        surface; role-id mode gives every clay role a distinct colour; every live interiorKind
        (including room-shell/kit-shell/-ghost, which the old whitelist could not reach) normalizes to
        a recipe role. 18h-18m are source-text wiring over the additions region, because this harness
        is deliberately THREE/DOM-free: the hook exists, re-applies surfaces + lights + provenance,
        and — the mutation check — is actually CALLED from inside setInteriorBoard (delete that one
        line and CR-1 returns); the per-frame light-reassert patch it replaced is gone; the census is
        defined and exposed. The live GL proof is the capture receipt's texturedClayCount/unclaimed
        pair in dev/clay-captures/cl-r0/after-receipt.json, banked at gameplay scale.

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

    // Signature widened by CL-R0's coordinate fix (record, roomRect) — see 13g.
    check("13a. a seam-grid builder function is defined in the additions region",
      /function\s+clayRoomBuildSeamGrid\s*\(\s*record,\s*roomRect\s*\)\s*\{/.test(region));

    const fnMatch = region.match(/function\s+clayRoomBuildSeamGrid\s*\(\s*record,\s*roomRect\s*\)\s*\{([\s\S]*?)\n\}/);
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

    // opacity in [0.25, 0.35]. REWRITTEN for CL-R0: the authored value moved out of a literal in
    // theater-boot.js and into CLAY_DIAGNOSTIC_SURFACE_RECIPE (src/engine/clay-room.js), because the
    // grid's readability depends on what the recipe paints the floor — the original white-on-black
    // choice stopped reading the instant CL-R0 restored legible clay. The check still enforces D12a's
    // own 0.25-0.35 law; it now reads the value from the LIVE recipe (a real evaluation, stronger
    // than the source-regex it replaces) and additionally asserts theater-boot consumes the recipe
    // rather than re-authoring a number.
    const gridWin = freshWin();
    const opacityVal = gridWin.CLAY_DIAGNOSTIC_SURFACE_RECIPE.gridOpacity;
    check("13e. the recipe's authored grid opacity falls in D12a's [0.25, 0.35]",
      Number.isFinite(opacityVal) && opacityVal >= 0.25 && opacityVal <= 0.35, String(opacityVal));
    check("13e2. theater-boot reads grid colour+opacity FROM the recipe (never a re-authored literal)",
      /function\s+clayRoomGridColor\(\)\{\s*return\s+CLAY_DIAGNOSTIC_SURFACE_RECIPE\.gridColor;/.test(region) &&
      /function\s+clayRoomGridOpacity\(\)\{\s*return\s+CLAY_DIAGNOSTIC_SURFACE_RECIPE\.gridOpacity;/.test(region), region.slice(0, 0));
    // ...and reads them at CALL time, never at module-eval time: theater-boot.js is loaded ALONE by
    // several harnesses, and a top-level read of the engine module (a declared callTimeDep) throws
    // ReferenceError before any test runs. Caught for real by the full verify sweep.
    check("13e3. no module-eval-time read of the engine recipe outside a function body",
      !/^const\s+\w+\s*=\s*CLAY_DIAGNOSTIC_SURFACE_RECIPE\./m.test(region),
      "a module-scope const reads CLAY_DIAGNOSTIC_SURFACE_RECIPE at load time");
    // CL-R0 coordinate fix: the grid must be built in the SPATIALIZED room's frame, not the record's
    // local 0..4 frame. Before this fix it mounted (room.x, room.y) = (3, 13) cells away from the room
    // and rendered off-camera while auditing perfectly "owned" — the exact class of defect the
    // provenance audit's bbox field now exposes.
    check("13g. the seam grid is offset by the spatialized room rect (never the record's local frame)",
      /function\s+clayRoomBuildSeamGrid\s*\(\s*record,\s*roomRect\s*\)/.test(region) &&
      /const\s+ox\s*=\s*roomRect/.test(fnBody) && /const\s+oz\s*=\s*roomRect/.test(fnBody), fnBody);
    check("13h. mountClayRoom passes the real spatialized room rect into the grid builder",
      /clayRoomBuildSeamGrid\s*\(\s*record\s*,\s*compiled\.room\s*\)/.test(region), region.slice(0, 0));
    check("13f. the recipe-backed opacity reader is actually wired into the LineBasicMaterial",
      /LineBasicMaterial\(\{[^}]*opacity:\s*clayRoomGridOpacity\(\)/.test(fnBody), fnBody);

    // "sit under the figures/objects visually (render order)" — a renderOrder below the scene
    // default (0) on the grid object.
    check("13i. the grid mesh is given a renderOrder below the scene default (renders under other transparent draws)",
      /grid\.renderOrder\s*=\s*-\d/.test(fnBody), fnBody);
  }
}

// ============================================================================
// 14. D15 wiring + negative grep-gate — REWRITTEN (the old check 14a-g grepped for the hand-assembled
//     shim's own door-wiring literals; D15 deletes that shim outright — see this file's own header
//     note for the red-first proof this rewrite is grounded in, not just asserted).
// ============================================================================
{
  const bootSrc = read("src/ui/theater-boot.js");
  const beginMark = "/* CLAY-ROOM ADDITIONS BEGIN";
  const endMark = "CLAY-ROOM ADDITIONS END */";
  const bi = bootSrc.indexOf(beginMark), ei = bootSrc.indexOf(endMark);
  if(bi === -1 || ei === -1 || ei < bi){
    check("14. theater-boot.js clay-room additions region found for the D15 wiring scan", false,
      "not found yet — expected once the D15 re-wire lands");
  } else {
    const region = bootSrc.slice(bi, ei + endMark.length);

    check("14a. mountClayRoom calls clayRoomBoardFrom(record) — the real spatializer+interiorBuildBoard chain (src/engine/clay-room.js)",
      /clayRoomBoardFrom\s*\(\s*record\s*\)/.test(region));

    check("14b. mountClayRoom feeds that output straight to setInteriorBoard (no intermediate hand-assembly)",
      /setInteriorBoard\s*\(\s*compiled\.board\s*\)/.test(region));

    // NEGATIVE — the task's own 3 named banned literals (the OLD hand-assembled shim class) plus a
    // hand-built door interactable literal (this unit's own stronger "no hand-built interactables
    // either" reading of D15 point 1) must appear NOWHERE in the additions region.
    check("14c. NO `instances:{floor` hand-assembled literal anywhere in the additions region",
      !/instances:\{floor/.test(region), "matched instances:{floor");
    check("14d. NO `doorframe:[` hand-assembled literal anywhere in the additions region",
      !/doorframe:\[/.test(region), "matched doorframe:[");
    check("14e. NO `kitDoors:[` hand-assembled literal anywhere in the additions region",
      !/kitDoors:\[/.test(region), "matched kitDoors:[");
    check("14f. NO hand-built door interactable literal (archetype:\"door\") anywhere in the additions region",
      !/archetype:\s*"door"/.test(region), "matched archetype:\"door\"");

    // 14g/14h REWRITTEN for CL-R0 (docs/CLAYROOM-RESET-LADDER.md). They used to assert the existence
    // of clayRoomFlattenStructure and that its hardcoded whitelist was EXACTLY
    // {floor,wall,doorframe,pillar}. That whitelist was the defect: it was a renderer-side literal
    // that could not cover skirt/portal/room-shell/kit-shell or anything added later, and the sweep
    // ran once from mountClayRoom so every async rebuild undid it. RED-FIRST PROOF that these two
    // died for real rather than by accident: run against the branch base (3a789d0b) they PASS; run
    // straight after this unit's source edits they went RED, because both functions are deleted and
    // CLAY_STRUCTURE_KINDS no longer exists anywhere in the file. They are replaced below by checks
    // over the mechanism that took the job — a versioned engine-owned recipe plus one lifecycle hook.
    check("14g. the deleted hand-written sweeps are GONE (no clayRoomFlattenStructure/Furniture)",
      !/function\s+clayRoomFlatten(Structure|Furniture)\s*\(/.test(region), "a flatten sweep survives");
    check("14h. the hardcoded kind whitelist is GONE (routes come from the recipe, not a literal)",
      !/CLAY_STRUCTURE_KINDS/.test(region), "CLAY_STRUCTURE_KINDS survives");
  }
}

// ============================================================================
// CL-R0 (docs/CLAYROOM-RESET-LADDER.md) — THE DURABILITY INVARIANT.
//
// The one thing this pass exists to make impossible: a diagnostic Clayroom surface silently routing
// through a dungeon/site material. Before CL-R0 the fixture was 79/79 green while the settled frame
// showed the realm's own textured floor (measured: floor-region meanSaturation 175.4, neutralPct
// 0.00%, dev/clay-captures/cl-r0/before-measure.json) — CR-5, "the fixture gate proved truth, not
// beauty". These checks are the teeth for the repair.
//
// Split by what each can honestly prove:
//   18a-18f  LIVE, in jsdom, against the real engine recipe — behaviour, not text.
//   18g-18k  source-text wiring over the theater-boot additions region, because this harness is
//            deliberately THREE/DOM-free (see the file header) and cannot mount GL. The live GL
//            proof is the capture receipt's own texturedClayCount/unclaimed pair
//            (dev/clay-captures/cl-r0/after-receipt.json), banked at gameplay scale.
// ============================================================================
{
  const win = freshWin();
  const recipe = win.CLAY_DIAGNOSTIC_SURFACE_RECIPE;

  check("18a. CLAY_DIAGNOSTIC_SURFACE_RECIPE exists, is frozen, and carries id + version",
    !!recipe && Object.isFrozen(recipe) && typeof recipe.id === "string" && typeof recipe.version === "number",
    JSON.stringify(recipe && { id: recipe.id, version: recipe.version, frozen: recipe && Object.isFrozen(recipe) }));

  // THE INVARIANT ITSELF: an unknown role must never resolve to clay. If it did, a new interior kind
  // could quietly inherit the clay route's blessing while actually still carrying site material — the
  // silent path CL-R0 forbids. The loud "unclaimed" route is what makes it visible instead.
  const unknown = win.clayDiagnosticRouteFor("some-kind-invented-next-year", "clay");
  check("18b. an UNKNOWN surface role resolves to the loud 'unclaimed' route, never to diagnostic-clay",
    unknown.route === "unclaimed" && unknown.color === recipe.unclaimedColor, JSON.stringify(unknown));
  const nullRole = win.clayDiagnosticRouteFor(null, "clay");
  check("18c. a surface with NO resolvable role also resolves to 'unclaimed'",
    nullRole.route === "unclaimed", JSON.stringify(nullRole));

  // Every structural role the CL-R0 spec names must be claimed by the recipe, and claimed as clay.
  const mustBeClay = ["floor", "wall", "riser", "trim", "portal", "furniture"];
  const notClay = mustBeClay.filter((r) => win.clayDiagnosticRouteFor(r, "clay").route !== "diagnostic-clay");
  check("18d. every structural role CL-R0 names routes to diagnostic-clay",
    notClay.length === 0, "not routed to clay: " + JSON.stringify(notClay));

  // ...and the roles whose whole point is to be seen honestly must NOT be painted over.
  const mustPass = ["sprite", "emitter"];
  const wrongly = mustPass.filter((r) => win.clayDiagnosticRouteFor(r, "clay").route !== "passthrough");
  check("18e. sprite + emitter stay passthrough (CL-R1/CL-R2 must measure the REAL surface)",
    wrongly.length === 0, "not passthrough: " + JSON.stringify(wrongly));

  // role-id mode must give every clay-routed role a DISTINCT colour, or the diagnostic cannot tell a
  // mis-routed surface from a correctly-routed one.
  const clayRoles = Object.keys(recipe.roles).filter((r) => recipe.roles[r].route === "diagnostic-clay");
  const roleColors = clayRoles.map((r) => win.clayDiagnosticRouteFor(r, "role-id").color);
  check("18f. role-id mode assigns a DISTINCT colour to every clay-routed role",
    new Set(roleColors).size === clayRoles.length,
    clayRoles.length + " roles -> " + new Set(roleColors).size + " colours");

  // The renderer's own interiorKind vocabulary must normalize onto recipe roles — including the
  // room-shell/kit-shell kinds the old four-kind whitelist could never reach, and the -ghost cutaway
  // copies. A kind that fell through here is exactly how "basic dungeon floor" survived.
  const kindMap = {
    floor: "floor", wall: "wall", doorframe: "doorframe", pillar: "pillar", skirt: "skirt",
    portal: "portal", "wall-ghost": "wall", "room-shell-floor": "floor",
    "room-shell-wall-stem": "wall", "room-shell-wall-upper": "wall", "room-shell-wall-trim": "trim",
    "room-shell-riser": "riser", "kit-shell-wall": "wall", "kit-shell-floor": "floor",
  };
  const badKinds = Object.keys(kindMap).filter((k) => win.clayDiagnosticRoleForKind(k) !== kindMap[k]);
  check("18g. every live interiorKind (incl. room-shell/kit-shell/-ghost) normalizes to its recipe role",
    badKinds.length === 0, "unmapped: " + JSON.stringify(badKinds.map((k) => [k, win.clayDiagnosticRoleForKind(k)])));

  {
    const bootSrc = read("src/ui/theater-boot.js");
    const beginMark = "/* CLAY-ROOM ADDITIONS BEGIN";
    const endMark = "CLAY-ROOM ADDITIONS END */";
    const bi = bootSrc.indexOf(beginMark), ei = bootSrc.indexOf(endMark);
    const region = (bi >= 0 && ei > bi) ? bootSrc.slice(bi, ei + endMark.length) : "";

    // THE LIFECYCLE HOOK. This is the whole repair: the route must be re-applied from
    // setInteriorBoard's own tail, which is the single funnel all five async replay sites pass
    // through. A hook called only from mountClayRoom reproduces the original defect exactly.
    check("18h. clayRoomAfterInteriorBoardRebuild() is defined in the additions region",
      /function\s+clayRoomAfterInteriorBoardRebuild\s*\(\)\s*\{/.test(region));
    const hookBody = (region.match(/function\s+clayRoomAfterInteriorBoardRebuild\s*\(\)\s*\{([\s\S]*?)\n\}/) || [])[1] || "";
    check("18i. the hook re-applies the surface route AND the light profile AND provenance tagging",
      /clayRoomApplyDiagnosticSurfaces\s*\(\s*\)/.test(hookBody) &&
      /clayRoomApplyLightProfile\s*\(/.test(hookBody) &&
      /clayRoomTagAllProvenance\s*\(\s*\)/.test(hookBody), hookBody);

    // MUTATION CHECK (the "one known-bad replay mutation must fail" requirement, expressed at the
    // level this harness can reach): the hook must actually be CALLED from inside setInteriorBoard.
    // Delete that one call — the mutation that reintroduces CR-1 — and this goes RED. Searched
    // OUTSIDE the additions region on purpose: a call that only exists inside the clay region is a
    // call the production rebuild path never makes.
    const outsideRegion = bootSrc.slice(0, bi) + bootSrc.slice(ei);
    const setInteriorBoardBody = (outsideRegion.match(/function\s+setInteriorBoard\s*\([\s\S]*?\n\}/) || [""])[0];
    check("18j. setInteriorBoard() itself calls the hook (the mutation: remove this line -> CR-1 returns)",
      /clayRoomAfterInteriorBoardRebuild\s*\(\s*\)/.test(setInteriorBoardBody),
      "hook not called from setInteriorBoard — every async rebuild would silently restore site materials");

    // ...and the per-frame patch it replaced must be gone: clayRoomMaybeAutoMount must no longer
    // reassert lights every frame, or the fixture still carries the asymmetry that hid CR-1.
    const pollBody = (region.match(/function\s+clayRoomMaybeAutoMount\s*\(\)\s*\{([\s\S]*?)\n\}/) || [])[1] || "";
    check("18k. the per-frame light-reassert patch is gone from clayRoomMaybeAutoMount",
      !/clayRoomApplyLightProfile\s*\(/.test(pollBody), pollBody);

    // The census is the provenance answer CL-R0 requires ("tell which system owns every visible
    // surface") and the shape the live capture receipt asserts over.
    check("18l. clayRoomSurfaceCensus() reports texturedClayCount and unclaimed",
      /function\s+clayRoomSurfaceCensus\s*\(\)\s*\{/.test(region) &&
      /texturedClayCount/.test(region) && /unclaimed/.test(region));
    check("18m. the census is exposed as a read-only window.Theater diagnostic",
      /window\.Theater\._claySurfaceCensusForTest\s*=/.test(bootSrc));
  }
}

// ============================================================================
// 15. ⊗ jsdom compile check (D15 checklist item c) — runs the adapter's synthetic fixture through the
//     REAL spatializePlan + interiorBuildBoard headlessly via win.clayRoomBoardFrom(record), reusing
//     THIS file's own freshWin() full-manifest loader (place-spatialize.js/theater-interior.js/
//     clay-room.js are all already in classicPaths — no second vm sandbox needed).
// ============================================================================
{
  try {
    const win = freshWin();
    const record = win.clayRoomRecordFrom(0x6c0ffee);
    check("15a. record.provenance.derivation === \"spatialize-plan\" (D15 point 2)",
      record.provenance.derivation === "spatialize-plan", record.provenance.derivation);

    check("15b. win.clayRoomBoardFrom is a function", typeof win.clayRoomBoardFrom === "function");
    const compiled = win.clayRoomBoardFrom(record);

    check("15c. the 5x5 room compiles to exactly 25 floor instances",
      compiled.board.instances.floor.length === 25, "floor=" + compiled.board.instances.floor.length);

    // independently recompute the door edge off the returned room+plan.doors — never trusting
    // clayRoomBoardFrom's own internal assertion alone (belt-and-suspenders).
    const room = compiled.room;
    const roomDoors = (compiled.plan.doors || []).filter((d) =>
      d.betweenSegs.includes(compiled.fixture.focusSegNum) &&
      d.x >= room.x && d.x < room.x + room.w && d.y >= room.y && d.y < room.y + room.d);
    check("15d. >=1 door cell on the clay room's own exit", roomDoors.length >= 1, JSON.stringify(roomDoors));
    const edgeOf = (d) => d.y === room.y ? "n" : d.y === room.y + room.d - 1 ? "s" : d.x === room.x ? "w" : d.x === room.x + room.w - 1 ? "e" : null;
    check("15e. that door cell sits on record.portal.edge's own side (\"" + record.portal.edge + "\")",
      roomDoors.some((d) => edgeOf(d) === record.portal.edge), JSON.stringify(roomDoors.map(edgeOf)));
    check("15f. board.instances.doorframe carries >=1 real jamb/header instance for that door",
      compiled.board.instances.doorframe.length >= 1, compiled.board.instances.doorframe.length);

    check("15g. board.furniture[0] is positioned from the record (local cell + the real room rect origin)",
      compiled.board.furniture.length === 1 &&
      compiled.board.furniture[0].x === room.x + 3 && compiled.board.furniture[0].y === room.y + 2,
      JSON.stringify(compiled.board.furniture));
    check("15h. board.pieces[0] is positioned from the record (local cell + the real room rect origin)",
      compiled.board.pieces.length === 1 &&
      compiled.board.pieces[0].cellX === room.x + 1 && compiled.board.pieces[0].cellY === room.y + 3,
      JSON.stringify(compiled.board.pieces));

    // 15i REWRITTEN by the door tranche (2026-07-23; red-first — the old "interactables must be
    // empty" assertion went red the moment the record-derived door entry landed, which is the
    // supersession working as intended). D15's ban was on HAND-BUILT render-layer literals; the
    // adapter deriving canonical board DATA from the record (the same way it stages the crate and
    // the citizen) is the production shape, and RL-1 is discharged by it. Dressing stays empty.
    check("15i. board.interactables carries the record-derived door only; board.dressing stays empty",
      Array.isArray(compiled.board.interactables) && compiled.board.interactables.length === 1 &&
      compiled.board.interactables[0].archetype === "door" &&
      Array.isArray(compiled.board.dressing) && compiled.board.dressing.length === 0,
      JSON.stringify({ interactables: compiled.board.interactables, dressing: compiled.board.dressing }));

    // determinism through the REAL chain — two independent calls, byte-identical board.
    const compiled2 = win.clayRoomBoardFrom(record);
    check("15j. determinism — two independent clayRoomBoardFrom(record) calls produce a byte-identical board",
      JSON.stringify(compiled.board) === JSON.stringify(compiled2.board));

    // KIT_SHELL_ENABLED/KIT_DOORS_ENABLED save/restore discipline (theater-interior.js's own dev/
    // harness escape hatch, flipped off only for the synchronous interiorBuildBoard call).
    check("15k. KIT_SHELL_ENABLED is restored to its prior value (true) after clayRoomBoardFrom returns",
      win.KIT_SHELL_ENABLED === true, win.KIT_SHELL_ENABLED);
    check("15l. KIT_DOORS_ENABLED is restored to its prior value (true) after clayRoomBoardFrom returns",
      win.KIT_DOORS_ENABLED === true, win.KIT_DOORS_ENABLED);
  } catch(e) { check("15. jsdom compile check (module present, no throw)", false, e.stack || String(e)); }
}

// ============================================================================
// 16. D13 provenance-audit structural check (D15 checklist item d) — grep-level: this harness never
//     mounts real GL/a real THREE.Scene, so the LIVE "0 orphans" claim is the browser cold-load gate,
//     not this harness (this file's own header note, checks 7/8/13's own precedent for that split).
// ============================================================================
{
  const bootSrc = read("src/ui/theater-boot.js");
  const beginMark = "/* CLAY-ROOM ADDITIONS BEGIN";
  const endMark = "CLAY-ROOM ADDITIONS END */";
  const bi = bootSrc.indexOf(beginMark), ei = bootSrc.indexOf(endMark);
  if(bi === -1 || ei === -1 || ei < bi){
    check("16. theater-boot.js clay-room additions region found for the provenance-audit scan", false,
      "not found yet — expected once D13 lands");
  } else {
    const region = bootSrc.slice(bi, ei + endMark.length);

    check("16a. clayRoomProvenanceAudit() is defined in the additions region",
      /function\s+clayRoomProvenanceAudit\s*\(\)\s*\{/.test(region));
    check("16b. clayRoomTagAllProvenance() is defined in the additions region",
      /function\s+clayRoomTagAllProvenance\s*\(\)\s*\{/.test(region));
    check("16c. clayRoomTagProvenance(node,builder) is defined in the additions region",
      /function\s+clayRoomTagProvenance\s*\(\s*node,\s*builder\s*\)\s*\{/.test(region));
    check("16d. the tag literal stamps userData.clayProvenance = {builder,recordRef:\"clay-c1a\"}",
      /node\.userData\.clayProvenance\s*=\s*\{\s*builder:\s*builder,\s*recordRef:\s*"clay-c1a"\s*\}/.test(region));

    // wiring — clayRoomTagAllProvenance is actually CALLED from mountClayRoom, not just defined.
    const fnMatch = region.match(/function\s+mountClayRoom\s*\(\)\s*\{([\s\S]*?)\n\}/);
    const fnBody = fnMatch ? fnMatch[1] : "";
    check("16e. mountClayRoom() actually calls clayRoomTagAllProvenance() (wiring, not dead code)",
      /clayRoomTagAllProvenance\s*\(\s*\)/.test(fnBody), fnBody);

    check("16f. the Explain-tab overlay carries a LIVE \"Provenance audit: ... groups tagged, ... orphans\" line",
      /"\\nProvenance audit: "\s*\+\s*provenanceAudit\.tagged\.length\s*\+\s*" groups tagged, "\s*\+\s*provenanceAudit\.orphans\.length\s*\+\s*" orphans\."/.test(region));
  }
}

// ============================================================================
// 17. ⊗ ITR_ROOM_SHELL regression guard — a LIVE-BROWSER finding (this harness's own THREE/DOM-free
//     discipline can't render GL to catch it directly; the red-first proof here is the orchestrator's
//     own cold-load screenshot: with the fix ABSENT, theater-boot.js's own room-shell compiler
//     (ITR_ROOM_SHELL, default true, its own "flips ITR_ROOM_SHELL live" comment at the definition)
//     silently replaces the flat, InstancedMesh floor/wall/doorframe geometry clayRoomFlattenStructure
//     flattens with a SEPARATE, non-instanced, REAL-kit-textured mesh trio
//     (room-shell-floor/wall-stem/wall-upper/wall-trim) that sweep never touches (it isn't an
//     InstancedMesh) — dark enough under D4's own low-ambient profile to read as "the floor/walls
//     never rendered at all". Fixed by disabling ITR_ROOM_SHELL for the duration of the mount (the
//     SAME "flip an existing dev/harness escape hatch" law KIT_SHELL_ENABLED/KIT_DOORS_ENABLED
//     already use), restored in clayRoomUnmount (not immediately after setInteriorBoard) because the
//     async texture-settle replay this file's own header documents re-invokes setInteriorBoard
//     OUTSIDE mountClayRoom and reads ITR_ROOM_SHELL fresh each time.
// ============================================================================
{
  const bootSrc = read("src/ui/theater-boot.js");
  const beginMark = "/* CLAY-ROOM ADDITIONS BEGIN";
  const endMark = "CLAY-ROOM ADDITIONS END */";
  const bi = bootSrc.indexOf(beginMark), ei = bootSrc.indexOf(endMark);
  if(bi === -1 || ei === -1 || ei < bi){
    check("17. theater-boot.js clay-room additions region found for the room-shell regression scan", false,
      "not found yet — expected once the D15 re-wire lands");
  } else {
    const region = bootSrc.slice(bi, ei + endMark.length);

    const mountMatch = region.match(/function\s+mountClayRoom\s*\(\)\s*\{([\s\S]*?)\n\}/);
    const mountBody = mountMatch ? mountMatch[1] : "";
    check("17a. mountClayRoom() saves the prior ITR_ROOM_SHELL value before overriding it",
      /CLAY_ROOM_PRIOR_ROOM_SHELL\s*=\s*ITR_ROOM_SHELL/.test(mountBody), mountBody);
    // REWRITTEN for CL-R0: the literal `ITR_ROOM_SHELL = false` became a flag read
    // (clayRoomShellOverrideOn()) so the "does the fixture still read as clay through the PRODUCTION
    // room-shell construction path?" A/B is a reproducible ?clayshell=1 capture instead of a source
    // edit. The invariant this check protects is unchanged and is now asserted in TWO parts: the
    // override is still applied before setInteriorBoard, AND its default is still OFF. A flag whose
    // default drifted to true would silently restore the exact regression check 17 exists to catch.
    check("17b. mountClayRoom() sets ITR_ROOM_SHELL from the flag reader before setInteriorBoard runs",
      /ITR_ROOM_SHELL\s*=\s*clayRoomShellOverrideOn\(\);[\s\S]*setInteriorBoard\s*\(\s*compiled\.board\s*\)/.test(mountBody), mountBody);
    const shellFnBody = (region.match(/function\s+clayRoomShellOverrideOn\s*\(\)\s*\{([\s\S]*?)\n\}/) || [])[1] || "";
    // 17b2 REWRITTEN for CL-R3a (red-first: the default flip turned the old assertion red before this
    // check changed). Under the 2026-07-23 wall-omission ruling the clay fixture adopts the PRODUCTION
    // room-shell wall construction by default — the original force-off was an accommodation for the
    // deleted flatten sweep, and its dark-walls symptom was fixed by the fade-aware swap (check 20).
    // The invariant this protects flips accordingly: default ON, ?clayshell=0 restores the plain
    // InstancedMesh channel for the A/B.
    check("17b2. clayRoomShellOverrideOn() defaults ON (production construction; ?clayshell=0 opts out)",
      /let\s+on\s*=\s*true/.test(shellFnBody) &&
      /clayshell"\)\s*===\s*"0"/.test(shellFnBody), shellFnBody);

    const unmountMatch = region.match(/function\s+clayRoomUnmount\s*\(\)\s*\{([\s\S]*?)\n\}/);
    const unmountBody = unmountMatch ? unmountMatch[1] : "";
    check("17c. clayRoomUnmount() restores ITR_ROOM_SHELL from the saved prior value (never immediately after setInteriorBoard)",
      /ITR_ROOM_SHELL\s*=\s*CLAY_ROOM_PRIOR_ROOM_SHELL/.test(unmountBody), unmountBody);
    check("17d. the restore is NOT present inside mountClayRoom itself (would race the async texture-settle replay)",
      !/ITR_ROOM_SHELL\s*=\s*CLAY_ROOM_PRIOR_ROOM_SHELL/.test(mountBody), mountBody);
  }
}

// ============================================================================
// 19. CL-R1 (docs/CLAYROOM-RESET-LADDER.md) — SPRITE COLOUR-SPACE INVARIANT.
//
// Adam, 2026-07-23: "the sprite is back to an overexposed undersaturated crappy looking piece of
// paper". Cause, proven by A/B capture with lighting held constant: spriteTextureFor() never tagged
// the loaded PNG's colour space, while every other authored colour texture in theater-boot.js does.
// three r166 defaults WebGLRenderer.outputColorSpace to SRGBColorSpace and this codebase never
// overrides it, so an untagged texture is sampled as if its sRGB bytes were linear and then encoded
// to sRGB again on output — midtones lifted, chroma collapsed. Measured on non-neutral pixels:
// untagged meanSat 42.2 / meanSpread 19.8; tagged 60.2 / 25.1; source art 145.7 / 44.7.
//
// This is a source-text check because the harness is THREE/DOM-free; the visual proof is
// dev/clay-captures/cl-r1-sprite-ab/. Teeth: delete the tagging line and 19a goes red.
// ============================================================================
{
  const bootSrc = read("src/ui/theater-boot.js");
  const fn = (bootSrc.match(/function\s+spriteTextureFor\s*\(entry\)\s*\{[\s\S]*?\n\}/) || [""])[0];
  check("19a. spriteTextureFor() tags the loaded PNG with THREE.SRGBColorSpace",
    /tex\.colorSpace\s*=\s*THREE\.SRGBColorSpace/.test(fn),
    "untagged sprite textures are double-gamma-encoded on output — pale, low-chroma standees");
  const flagFn = (bootSrc.match(/function\s+spriteSrgbTaggingOn\s*\(\)\s*\{([\s\S]*?)\n\}/) || [])[1] || "";
  check("19b. the colour-space A/B flag defaults ON (correctness, not a taste dial)",
    /let\s+on\s*=\s*true/.test(flagFn), flagFn);
  // The renderer must not silently change outputColorSpace out from under this reasoning: if it ever
  // sets LinearSRGBColorSpace, the tagging above becomes wrong and this check should be revisited
  // rather than the tag quietly removed.
  check("19c. the renderer does not override outputColorSpace (three r166 default sRGB is assumed)",
    !/outputColorSpace\s*=/.test(bootSrc),
    "an outputColorSpace override exists — re-derive the sprite colour-space reasoning");
}

// ============================================================================
// 20. CL-R0 (docs/CLAYROOM-RESET-LADDER.md) — FADE-AWARE MATERIAL SWAP.
//
// Found live by the ?clayshell=1 A/B (2026-07-23): the room-shell wall-upper meshes carry
// per-segment cloned materials whose opacity the cutaway tween mutates between rebuilds
// (fadeEntry.materials). A naive shared-material swap severed that linkage — the probe showed the
// camera-side suppression classifying both near walls as blocking and tweening THEIR OLD materials
// to 0.08 while the meshes rendered the shared clay material at 1.0: opaque dark slabs, the cutaway
// "visibly broken" while its state machine ran perfectly. The route must re-point the fade entry at
// a per-mesh clay clone carrying the entry's current opacity. Source-text teeth (this harness is
// THREE/DOM-free); the visual proof is dev/clay-captures/cl-r0/shell-ab-04-clean-no-overlay.png.
// ============================================================================
{
  const bootSrc = read("src/ui/theater-boot.js");
  const fn = (bootSrc.match(/function\s+clayRoomApplyDiagnosticSurfaces\s*\(\)\s*\{[\s\S]*?\n\}/) || [""])[0];
  check("20a. the diagnostic route checks S.occlusionFadeState for a fade entry referencing the old material",
    /S\.occlusionFadeState/.test(fn) && /e\.materials\.indexOf\(priorMat\)/.test(fn), fn.slice(0,0));
  check("20b. a fade-linked mesh gets a per-mesh CLONE carrying the entry's current opacity (never the shared material)",
    /clayDiagnosticMaterialFor\(decision\.color\)\.clone\(\)/.test(fn) &&
    /clayMat\.opacity\s*=\s*\(typeof\s+fadeEntry\.opacity/.test(fn), fn.slice(0,0));
  check("20c. the fade entry's materials array is re-pointed at the clone (the tween drives what the mesh renders)",
    /fadeEntry\.materials\s*=\s*fadeEntry\.materials\.map/.test(fn), fn.slice(0,0));
}

// ============================================================================
// 21. CL-R3a (docs/CLAYROOM-RESET-LADDER.md §CL-R3a) — CAMERA-SIDE WALL OMISSION.
//
// Adam's 2026-07-23 ruling (ART-DIRECTION-CANON "Camera-side wall omission", RULED FOR TEST): under
// the fixed camera, a wall segment that is camera-facing AND occludes staged floor builds NO upper
// volume — compile-time omission with the stem retained — replacing the render-time camera-side
// fade for the fixed camera. Source-text teeth (THREE/DOM-free harness); the live proof is the
// capture receipt's own wallOmission block (dev/clay-captures/cl-r3a/).
// ============================================================================
{
  const bootSrc = read("src/ui/theater-boot.js");

  // The decision derives from the SAME static geometry test the fade used (no second authority).
  check("21a. the omission decision reads wallUpperCameraSideBlockingSet's output (one geometry authority)",
    /wallOmissionActive\s*&&\s*wallUpperCameraSideBlocking\.has\(entry\.ownerSegIndex\)/.test(bootSrc),
    "omission must key on the existing camera-side set, never a re-derived geometry test");

  // Omission SKIPS the build (return before any mesh/material work) — not a hidden or faded mesh.
  // capture through the guard's own `return;` (a `[\s\S]*?}` would stop at the report-row object
  // literal's closing brace and miss the return)
  const loopMatch = bootSrc.match(/wallOmissionActive\s*&&\s*wallUpperCameraSideBlocking\.has\(entry\.ownerSegIndex\)\)\{([\s\S]*?return;)/);
  check("21b. an omitted segment builds nothing (records + returns; no mesh, no material, no fade entry)",
    !!loopMatch && /omitted\.push/.test(loopMatch[1]) &&
    !/new\s+THREE\.Mesh/.test(loopMatch[1]), loopMatch ? loopMatch[1] : "guard not found");

  // The decision set is recorded as deterministic, versioned board data.
  check("21c. S.wallOmissionReport carries ruleId + version + active + omitted + built",
    /S\.wallOmissionReport\s*=\s*\{\s*\n?\s*ruleId:\s*"camera-side-wall-omission",\s*version:\s*1/.test(bootSrc) &&
    /omitted:\s*\[\],\s*built:\s*\[\]/.test(bootSrc));
  check("21d. the report is exposed read-only (window.Theater._wallOmissionForTest)",
    /window\.Theater\._wallOmissionForTest\s*=\s*function\(\)\{\s*return\s+S\.wallOmissionReport/.test(bootSrc));

  // Gate: ON in the clay fixture (the ruled test bed), OFF in normal play, ?wallomit both ways.
  const flagFn = (bootSrc.match(/function\s+clayWallOmissionOn\s*\(\)\s*\{([\s\S]*?)\n\}/) || [])[1] || "";
  check("21e. clayWallOmissionOn() defaults to the clay fixture's own enablement (test bed ON, production OFF)",
    /CLAY_WALL_OMISSION_FLAG\s*=\s*\(on\s*===\s*null\)\s*\?\s*clayRoomShouldEnable\(\)\s*:\s*on/.test(flagFn), flagFn);
  check("21f. ?wallomit=1 and ?wallomit=0 both override (the A/B stays reproducible)",
    /raw\s*===\s*"1"/.test(flagFn) && /raw\s*===\s*"0"/.test(flagFn), flagFn);
}

// ============================================================================
// 22. CL-R3a — THE OMISSION DECISION, EXECUTED (not grepped).
//
// Adam, 2026-07-23: "please make sure you prove everything you do." Check 21 proves the WIRING by
// source text; this check runs the actual decision function headless. wallUpperCameraSideBlockingSet
// (src/ui/theater-shot.js, pure) is the single geometry authority the omission keys on; the live
// boot calls it with yawDeg = S.rotationStep*90 + CAM_YAW_OFFSET_DEG, and CAM_YAW_OFFSET_DEG = 45
// with rotationStep 0 under the fixed camera — so yaw 45 below is the REAL production yaw, not a
// convenient synthetic. Segments mirror the clay room's own plan rect (3,13)-(7,17). Expected, and
// confirmed live by the banked receipt (omit-receipt.json: omitted segs at mids 7.5/15.5 + 5/17.5):
// the +x (east) and +z (south) edges are camera-side; north/west are not; out-of-band never is.
// ============================================================================
{
  // theater-shot.js is an ES-module boundary file (manifest type:"module", NOT in the classic
  // loadOrder), so freshWin() never loads it — but its own manifest contract says "plain-Node
  // importable + unit-testable", which is exactly what this check exercises: a REAL import of the
  // production file, same pattern as dev/verify-theater-shot.mjs.
  const shotMod = await import(new URL("../src/ui/theater-shot.js", import.meta.url));
  const fn = shotMod.wallUpperCameraSideBlockingSet;
  check("22a. wallUpperCameraSideBlockingSet is executable in the harness (pure, no GL needed)",
    typeof fn === "function");
  if(typeof fn === "function"){
    const fr = { minX: 3, maxX: 7, minZ: 13, maxZ: 17 };   // the clay room's own spatialized rect
    const segs = [
      { a: { x: 3, z: 13 }, b: { x: 7, z: 13 } },   // 0 north edge — far side under a +x/+z camera
      { a: { x: 7, z: 13 }, b: { x: 7, z: 17 } },   // 1 east edge — camera side
      { a: { x: 3, z: 17 }, b: { x: 7, z: 17 } },   // 2 south edge — camera side
      { a: { x: 3, z: 13 }, b: { x: 3, z: 17 } },   // 3 west edge — far side
      { a: { x: 30, z: 30 }, b: { x: 34, z: 30 } }, // 4 out of the focus band entirely
    ];
    const got = fn({ focusRect: fr, wallSegments: segs, cx: 5, cz: 15, yawDeg: 45 });
    check("22b. the east + south edges (camera side at the real yaw 45°) are selected",
      got.has(1) && got.has(2), JSON.stringify([...got]));
    check("22c. the north + west edges (far side) are NOT selected",
      !got.has(0) && !got.has(3), JSON.stringify([...got]));
    check("22d. an out-of-band segment is NOT selected (the occludes-staged-floor condition)",
      !got.has(4), JSON.stringify([...got]));
    check("22e. the harness result matches the banked live receipt (2 camera-side of 4 room edges)",
      got.size === 2, "got.size=" + got.size);
  }
}

// ============================================================================
// 23. THE DOOR (Adam, 2026-07-23: "now let's fix the door once and for all") — all EXECUTED through
// the real compile chain (win.clayRoomBoardFrom -> spatializePlan -> interiorBuildBoard), red-first:
//   23a exposed the CELL LIE — the record says portal c-2-0 (plan 5,13) but the pinned fixture carved
//       the door at (7,13); the old assert checked only the EDGE, so prose and render disagreed on
//       WHERE the door is for the fixture's whole life.
//   23b/23c prove the leaf: board.interactables carries the record-derived door entry in the
//       production shape (state "shut" — wiResolveDoorState's own word list maps prose "closed" to
//       state "shut"), so interiorBuildInteractables mounts a CLOSED leaf; RL-1 discharged.
//   23d exposed the ARCH OVERSHOOT: doorframe arch step 2 topped out at h+0.52 = 2.56 against a 2.4
//       wall — Adam's "taller than the wall". Every doorframe prism must fit inside the wall height.
// ============================================================================
{
  const win = freshWin();
  try {
    const record = win.clayRoomRecordFrom(0x6c0ffee);
    const out = win.clayRoomBoardFrom(record);
    // the portal's own local cell -> plan coords through the REAL spatialized room rect
    const cellMatch = String(record.portal.cell).match(/^c-(\d+)-(\d+)$/);
    const wantX = out.room.x + Number(cellMatch[1]);
    const wantY = out.room.y + Number(cellMatch[2]);
    const door = (out.plan.doors || []).find((d) => d && d.betweenSegs && d.betweenSegs.indexOf(1) >= 0);
    check("23a. the carved door cell EQUALS record.portal.cell (the prose twin's cell is the rendered cell)",
      !!door && door.x === wantX && door.y === wantY,
      `record says (${wantX},${wantY}); spatializer carved (${door && door.x},${door && door.y})`);

    const ia = out.board.interactables || [];
    check("23b. board.interactables carries exactly one record-derived door entry",
      ia.length === 1 && ia[0].archetype === "door" && ia[0].sourceRef === record.portal.id,
      JSON.stringify(ia));
    check("23c. the entry's state is production-vocabulary \"shut\" (prose \"closed\" mapped, not passed raw)",
      ia.length === 1 && ia[0].state === "shut" && ia[0].x === (door && door.x) && ia[0].y === (door && door.y),
      JSON.stringify(ia[0] || null));

    // 24 (red-first): the leaf mounted PERPENDICULAR to the north wall — a monolith jutting into the
    // room (probe: hinge rotY π/2, leaf spanning Z at world (0,·,−1.55)). Cause: the consumer's own
    // east-west-neighbor heuristic misfires for a door on the room's edge row (both lateral
    // neighbors are room floor). The authority for the pierced wall's axis is theater-interior's
    // itrDoorWidthAxisIsZ (the multi-cell wall-run scan that already orients the FRAME); the board
    // must carry that answer to the leaf, never let the leaf re-derive it worse.
    const axes = out.board.doorAxes || [];
    check("24a. board.doorAxes carries the frame's own axis answer for the door cell",
      axes.length === 1 && axes[0].x === (door && door.x) && axes[0].z === (door && door.y) &&
      axes[0].widthAxisIsZ === false,
      JSON.stringify(axes));

    const frames = (out.board.instances && out.board.instances.doorframe) || [];
    const wallH = out.board.wallHeightBase || 2.4;
    const over = frames.filter((f) => ((f.yBase || 0) + (f.sy || 0)) > wallH + 1e-6);
    check("23d. every doorframe prism (jamb/header/arch) fits INSIDE the wall height",
      frames.length > 0 && over.length === 0,
      "over-height prisms: " + JSON.stringify(over.map((f) => ({ yBase: f.yBase, sy: f.sy, top: (f.yBase || 0) + (f.sy || 0), wallH }))));
  } catch(e) {
    check("23. door checks (chain executed without throw)", false, e.stack || String(e));
  }
}

// ============================================================================
// 25. DOOR MOUNT (Adam, 2026-07-23: "it is not socketed into the wall, it is floating out in front
// of the wall" + "i need the dev tool to just do it myself, make sure there is some kind of
// snapping and individual axis control").
//
// Measured cause: door assembly authored at the CELL centre (leaf z −2.0) while the shell wall
// stands at the room boundary (body centre z −2.61) — 0.61 world units of daylight. The fix is the
// anchor-derivation seam DEV-PORTAL.md §6.1's consumer contract names: theater-interior emits pure
// outward edge signs on doorAxes; the renderer computes the mount (shell-aware default + the
// workbench tune) and applies it to frame rows, portal rows, and the leaf hinge as ONE offset.
// The tuner is §6.1's door-mount slice, landed early per the spec's implementation-status note —
// NOT a reinvented tool.
// ============================================================================
{
  const win = freshWin();
  try {
    const record = win.clayRoomRecordFrom(0x6c0ffee);
    const out = win.clayRoomBoardFrom(record);
    const a = (out.board.doorAxes || [])[0] || null;
    check("25a. doorAxes carries the OUTWARD edge signs (north door: edgeSignZ −1, edgeSignX 0)",
      !!a && a.edgeSignZ === -1 && a.edgeSignX === 0, JSON.stringify(a));
  } catch(e) {
    check("25a. doorAxes edge signs (chain executed)", false, e.stack || String(e));
  }

  const bootSrc = read("src/ui/theater-boot.js");
  check("25b. itrDoorMountFor computes the offset from edge signs + shell mode + GS.doorMountTune",
    /function\s+itrDoorMountFor\s*\(axisInfo\)/.test(bootSrc) &&
    /ITR_DOOR_MOUNT_ALONG_SHELL/.test(bootSrc) &&
    /GS\.doorMountTune/.test(bootSrc));
  check("25c. frame rows, portal rows, and the leaf hinge all consume the SAME mount (one offset, one assembly)",
    /doorList\s*=\s*itrApplyDoorMounts\(doorList,\s*doorMountMap\)/.test(bootSrc) &&
    /itrApplyDoorMounts\(data\.portals,\s*doorMountMap\)/.test(bootSrc) &&
    /hinge\.position\.set\([\s\S]{0,140}?doorMount\.dx[\s\S]{0,140}?doorMount\.dz\)/.test(bootSrc));
  check("25d. the row patch is a CLONE (a replayed S.lastBoard can never compound offsets)",
    /return\s+Object\.assign\(\{\},\s*row,\s*\{\s*\n?\s*ox:/.test(bootSrc));
  check("25e. the applied mounts are reported + exposed (S.doorMountReport / _doorMountForTest)",
    /S\.doorMountReport\s*=\s*report/.test(bootSrc) &&
    /window\.Theater\._doorMountForTest/.test(bootSrc));
  // tuner conformance to DEV-PORTAL §6.1 (source-text — the GL exercise is the browser probe):
  check("25f. the tuner uses §6.1's nudge ladder verbatim (0.01 / shift 0.001 / alt 0.10)",
    /ev\.shiftKey\s*\?\s*0\.001\s*:\s*\(ev\s*&&\s*ev\.altKey\s*\?\s*0\.10\s*:\s*0\.01\)/.test(bootSrc));
  check("25g. the tuner offers the three named snap candidates (cell-centre / boundary / wall-centre)",
    /"cell-centre",\s*"boundary",\s*"wall-centre"/.test(bootSrc));
  check("25h. the tuner exports the lock SHAPE (kind:object-mount) — never rewrites a JS constant",
    /kind:\s*"object-mount"/.test(bootSrc));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
