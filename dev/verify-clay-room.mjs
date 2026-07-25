/* Verify C1A-CLAY-ROOM (docs/C1A-CLAY-ROOM.md) — jsdom, full manifest classic-script load order (same
   bootstrap convention as dev/verify-theater-lighting.mjs), no GL, no window.Theater: this harness only
   exercises the PURE data layer (src/engine/clay-room.js). The theater-boot.js GL mount (mountClayRoom
   etc.) is the browser-check gate (serve + ?clayroom=1), not covered here — checks 7/8 below only grep
   the SOURCE TEXT of that file's marked additions region for forbidden tokens, never execute it.

   Red-first checks (⊗ in docs/C1A-CLAY-ROOM.md's own Verification list):
     1. ⊗ Determinism: two fresh windows, same seed -> JSON.stringify byte-identical; different seed -> differs.
     2. ⊗ Truth shape: 225 cells stable ids; full perimeter walls; portal on the north edge at a wall cell;
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
        interiorBuildBoard headlessly via win.clayRoomBoardFrom(record); asserts the retained 15x15 room's
        floor cell count (225), >=1 door cell on record.portal.edge's own side (independently recomputed off
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
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

// THEATER SPLIT B1 (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md): the CLAY-ROOM ADDITIONS
// region moved VERBATIM — markers included — from src/ui/theater-boot.js into
// src/ui/theater-clay-room.js (root wiring stays in theater-boot.js: the renderTheaterFrame poll,
// the setInteriorBoard tail hook, the end-of-body boot call, the facade seams). Source-shape checks
// below read this COMPOSITE so region-scoped checks (anchored on the travelling markers) and
// root-wiring checks (anchored on root-only functions) both keep their exact jobs across the split;
// the boundary comment keeps the two files' contents distinguishable in any sliced output.
function readTheaterSources(){
  return read("src/ui/theater-boot.js")
    + "\n/* [verify-clay-room composite boundary — src/ui/theater-clay-room.js follows] */\n"
    + read("src/ui/theater-clay-room.js");
}

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

    check("2a. 225 cells with stable ids (15x15 C1B movement lab)",
      Array.isArray(record.cells) && record.cells.length === 225 &&
      new Set(record.cells.map(c => c.id)).size === 225, "cells=" + (record.cells && record.cells.length));

    const edges = { n: 0, s: 0, e: 0, w: 0 };
    (record.walls || []).forEach(w => { if(edges[w.edge] != null) edges[w.edge]++; });
    check("2b. full perimeter walls (all four edges populated)",
      edges.n === 15 && edges.s === 15 && edges.e === 15 && edges.w === 15, JSON.stringify(edges));

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
    check("5e. every authored bulb has explicit local default state steady",
      profile.points.every((p) => p.state === "steady"), JSON.stringify(profile.points));
    check("5f. each bulb owns a distinct deterministic flicker seed",
      profile.points.every((p) => p.flicker && p.flicker.seed && p.flicker.amplitude > 0) &&
      new Set(profile.points.map((p) => p.flicker.seed)).size === profile.points.length,
      JSON.stringify(profile.points.map((p) => p.flicker)));
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
  const bootSrc = readTheaterSources();
  const beginMark = "/* CLAY-ROOM ADDITIONS BEGIN";
  const endMark = "CLAY-ROOM ADDITIONS END */";
  const bi = bootSrc.indexOf(beginMark), ei = bootSrc.indexOf(endMark);
  if(bi === -1 || ei === -1 || ei < bi){
    check("7. theater-boot.js clay-room additions region found (CLAY-ROOM ADDITIONS BEGIN/END markers)", false,
      "not found yet — expected once the U2 wire-in lands");
  } else {
    const region = bootSrc.slice(bi, ei + endMark.length);
    // "FUTURE ROLLS" is workbench provenance language, not a gameplay mechanic invocation.
    const mechanicsRegion = region.replace(/future rolls/gi, "");
    const hit = mechanicsRegion.match(/d20|roll|applyEvent|attack/);
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

  const bootSrc = readTheaterSources();
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
  const bootSrc = readTheaterSources();
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
    // THEATER SPLIT B1: the CALL moved to theater-boot.js's own end-of-body — the clay module
    // evaluates BEFORE the root wires ctx/S (a top-level call in the module would null-deref), and
    // the root's end-of-body is the same "after everything is declared" timing the region's old
    // end-of-file position provided. The invariant is unchanged: a bare column-0 boot-time call,
    // not a call buried in renderTheaterFrame's poll — now asserted against the ROOT source.
    check("10c. clayRoomBootSelfMount() is invoked as a bare column-0 statement (root end-of-body, not only from renderTheaterFrame's poll)",
      /^clayRoomBootSelfMount\(\);\s*$/m.test(read("src/ui/theater-boot.js")));
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
  const bootSrc = readTheaterSources();
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
  const bootSrc = readTheaterSources();
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
    const bootSrc = readTheaterSources();
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

    check("15c. the 15x15 movement lab compiles to exactly 225 floor instances",
      compiled.board.instances.floor.length === 225, "floor=" + compiled.board.instances.floor.length);

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
    check("15f. board.instances.doorframe carries >=1 instance for that door (since 2026-07-23: the lintel — see check 27)",
      compiled.board.instances.doorframe.length >= 1, compiled.board.instances.doorframe.length);

    const objectLocal = record.cells.find((cell) => cell.id === record.object.cell);
    const citizenLocal = record.cells.find((cell) => cell.id === record.citizen.cell);
    check("15g. board.furniture[0] is positioned from the record (local cell + the real room rect origin)",
      compiled.board.furniture.length === 1 && objectLocal &&
      compiled.board.furniture[0].x === room.x + objectLocal.x &&
      compiled.board.furniture[0].y === room.y + objectLocal.z,
      JSON.stringify(compiled.board.furniture));
    check("15h. board.pieces[0] is positioned from the record (local cell + the real room rect origin)",
      compiled.board.pieces.length === 1 && citizenLocal &&
      compiled.board.pieces[0].cellX === room.x + citizenLocal.x &&
      compiled.board.pieces[0].cellY === room.y + citizenLocal.z &&
      compiled.board.pieces[0].fid === record.citizen.id,
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
    check("15m. CL-R1 compiles exactly two named steady lights through real production fixture records",
      compiled.board.lights.length === 2
      && compiled.board.lights.every((l) => l.id && l.fixtureId && l.emitterLocal && l.state === "steady"),
      JSON.stringify(compiled.board.lights));
    check("15n. the opposing pair carries authored absolute renderer intensities 16/9 and unique seeds",
      compiled.board.lights[0].renderIntensity === 16
      && compiled.board.lights[1].renderIntensity === 9
      && compiled.board.lights[0].flicker.seed !== compiled.board.lights[1].flicker.seed,
      JSON.stringify(compiled.board.lights));
    const torchCompiled = win.clayRoomBoardFrom(record, { lightRecipeId: "torchlit" });
    const torchLight = torchCompiled.board.lights[0];
    check("15o. accepted torch brightness keeps shadows while reviewed reach extends to 24 and falloff broadens",
      torchCompiled.board.lights.length === 1
      && torchLight.distance === 24
      && torchLight.authoredRange === true
      && torchLight.decay === 1.5
      && torchLight.castShadow === true
      && torchLight.state === "flickering"
      && torchLight.flicker.amplitude === 0.1
      && torchLight.flicker.cadenceMs === 420
      && torchLight.flicker.intervalJitter === 0.55
      && torchLight.flicker.directionAmplitude === 0.025,
      JSON.stringify(torchCompiled.board.lights));
  } catch(e) { check("15. jsdom compile check (module present, no throw)", false, e.stack || String(e)); }
}

// ============================================================================
// 16. D13 provenance-audit structural check (D15 checklist item d) — grep-level: this harness never
//     mounts real GL/a real THREE.Scene, so the LIVE "0 orphans" claim is the browser cold-load gate,
//     not this harness (this file's own header note, checks 7/8/13's own precedent for that split).
// ============================================================================
{
  const bootSrc = readTheaterSources();
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
  const bootSrc = readTheaterSources();
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
    // THEATER SPLIT B1: ITR_ROOM_SHELL stays a ROOT-owned live flag; the clay module reads/writes
    // it through the clayCtxGet/SetRoomShell accessors (an ES import binding would be read-only and
    // a mirror would go stale under the facade's setRoomShell). Save/override/restore discipline
    // unchanged — the pins below follow the accessor spelling.
    check("17a. mountClayRoom() saves the prior ITR_ROOM_SHELL value before overriding it",
      /CLAY_ROOM_PRIOR_ROOM_SHELL\s*=\s*clayCtxGetRoomShell\(\)/.test(mountBody), mountBody);
    // REWRITTEN for CL-R0: the literal `ITR_ROOM_SHELL = false` became a flag read
    // (clayRoomShellOverrideOn()) so the "does the fixture still read as clay through the PRODUCTION
    // room-shell construction path?" A/B is a reproducible ?clayshell=1 capture instead of a source
    // edit. The invariant this check protects is unchanged and is now asserted in TWO parts: the
    // override is still applied before the first setInteriorBoard projection.
    check("17b. mountClayRoom() sets ITR_ROOM_SHELL from the flag reader before setInteriorBoard runs",
      /clayCtxSetRoomShell\(clayRoomShellOverrideOn\(\)\);[\s\S]*setInteriorBoard\s*\(\s*clayRoomMovementBoardFromState/.test(mountBody), mountBody);
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
      /clayCtxSetRoomShell\(CLAY_ROOM_PRIOR_ROOM_SHELL\)/.test(unmountBody), unmountBody);
    check("17d. the restore is NOT present inside mountClayRoom itself (would race the async texture-settle replay)",
      !/clayCtxSetRoomShell\(CLAY_ROOM_PRIOR_ROOM_SHELL\)/.test(mountBody), mountBody);
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
  const bootSrc = readTheaterSources();
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
  const bootSrc = readTheaterSources();
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
  const bootSrc = readTheaterSources();

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

  const bootSrc = readTheaterSources();
  check("25b. itrDoorMountFor computes the offset from edge signs + shell mode + GS.doorMountTune",
    /function\s+itrDoorMountFor\s*\(axisInfo\)/.test(bootSrc) &&
    /ITR_DOOR_MOUNT_ALONG_SHELL/.test(bootSrc) &&
    /GS\.doorMountTune/.test(bootSrc));
  check("25b2. shell default sinks the centred leaf by half-depth minus 0.02 so its front face is nearly flush",
    /ITR_DOOR_FRONT_FACE_PROJECTION\s*=\s*0\.02/.test(bootSrc) &&
    /ITR_DOOR_DEPTH_IN_WALL_DEFAULT\s*=\s*ITR_DOOR_FALLBACK_DEPTH\s*\/\s*2\s*-\s*ITR_DOOR_FRONT_FACE_PROJECTION/.test(bootSrc) &&
    /along:\s*ITR_DOOR_DEPTH_IN_WALL_DEFAULT/.test(bootSrc));
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

// ============================================================================
// 26. CLAY CAMERA PAN/ZOOM (Adam, 2026-07-23: "i need to be able to pan around the room because the
// control panel is blocking the door") — the GOVERNED verbs only, W3 §12.13. Source-text teeth;
// the live proof is the pose probe (fit → pan → zoom → nudge-rebuild → reset, bearing −135.000 and
// pitch −35.000 held throughout, pan surviving the rebuild, reset exact).
// ============================================================================
{
  const bootSrc = readTheaterSources();
  const applyFn = (bootSrc.match(/function\s+clayRoomApplyCamPose\s*\(\)\s*\{([\s\S]*?)\n\}/) || [])[1] || "";
  // bearing/pitch preservation BY CONSTRUCTION: position and target take the SAME ground offset, and
  // zoom is a scalar along the existing ray — no rotation verb exists anywhere in the pose math.
  check("26a. pan applies the SAME offset to position and target; zoom dollies along the existing ray",
    /target\.x\s*\+=\s*off\.x/.test(applyFn) && /pos\.x\s*\+=\s*off\.x/.test(applyFn) &&
    /pos\.sub\(target\)\.multiplyScalar\(zoom\)\.add\(target\)/.test(applyFn), applyFn);
  check("26b. no rotation/orbit verb in the pose math (fixed bearing + pitch, the governed-camera law)",
    !/rotation|rotateY|spherical|azimuth/i.test(applyFn), applyFn);
  // the tween race (probe-caught): the rebuild hook must settle the camera glide BEFORE capturing
  // the fit, or the stored fit is contaminated and the pan dies at the tween's landing.
  const hookFn = (bootSrc.match(/function\s+clayRoomAfterInteriorBoardRebuild\s*\(\)\s*\{([\s\S]*?)\n\}/) || [])[1] || "";
  check("26c. the rebuild hook settles ONLY the camera tween before capturing fit (door animation survives)",
    /clayRoomSettleCameraPoseTween\(\);[\s\S]*clayRoomCaptureCamFit\(\)/.test(hookFn) &&
    !/^\s*drainTweens\(S\);/m.test(hookFn), hookFn);
  check("26d. listeners live on the clay host only (created at mount, removed at unmount — dormant law)",
    /clayRoomWirePanZoom\(host\)/.test(bootSrc) &&
    /host\.addEventListener\("wheel"/.test(bootSrc));
  check("26e. grab-pan uses browser-verified same-sign camera offsets so the rendered room follows the pointer",
    /right\.x\s*\*\s*dxPx\s*\+\s*fwd\.x\s*\*\s*dyPx/.test(bootSrc) &&
    /right\.z\s*\*\s*dxPx\s*\+\s*fwd\.z\s*\*\s*dyPx/.test(bootSrc));
  check("26f. art inspection can dolly at least 8x closer while preserving the governed pose",
    /CLAY_CAM_ZOOM_MIN\s*=\s*0\.12/.test(bootSrc)
    && /up to 8× closer/.test(bootSrc));
}

// ============================================================================
// 27. THE KINDERGARTEN DOOR (Adam, 2026-07-23, verbatim: "THE DOOR IS JUST AN EXTRUDED RECTANGLE...
// it's an extruded rectangle that sits in a doorway" · "lets just focus on the bare minimum
// kindergarten version of door. rectangle hole with rectangle door. also average door dimensions
// are 36\" wide by 80\" tall"). GRID LAW: 1 u = 60 in, so door = 0.6 × 1.3333 u in a 0.61 × 1.35
// opening. Executed through the real compile chain. (This block REWRITES the same-day full-cell
// version red-first: those checks went red at the exact commit the ruling superseded them.)
// ============================================================================
{
  const win = freshWin();
  try {
    const record = win.clayRoomRecordFrom(0x6c0ffee);
    const out = win.clayRoomBoardFrom(record);
    const frames = (out.board.instances && out.board.instances.doorframe) || [];
    const sides = frames.filter((f) => f.doorwaySide);
    const lintels = frames.filter((f) => f.lintel);
    check("27a. the non-shell fallback is EXACTLY three plain prisms: two sides + one band over the opening",
      frames.length === 3 && sides.length === 2 && lintels.length === 1 &&
      !frames.some((f) => f.jamb || f.header || f.archStep),
      JSON.stringify(frames));
    const wallH = out.board.wallHeightBase || 2.4;
    check("27b. fallback sides run full wall height and flank a 0.61 u opening",
      sides.every((f) => Math.abs(f.sy - wallH) < 1e-6) &&
      Math.abs(Math.abs(sides[0].ox || sides[0].oz || 0) - (0.61 / 2 + 0.195 / 2)) < 1e-3,
      JSON.stringify(sides));
    check("27c. the fallback band spans opening-top (1.35) to the wall top, opening-wide",
      lintels.length === 1 && Math.abs((lintels[0].yBase || 0) - 1.35) < 1e-6 &&
      Math.abs((lintels[0].yBase || 0) + (lintels[0].sy || 0) - wallH) < 1e-6 &&
      Math.abs((lintels[0].sx === 0.61 ? lintels[0].sx : lintels[0].sz) - 0.61) < 1e-6,
      JSON.stringify(lintels));
    const wallAtDoor = ((out.board.instances && out.board.instances.wall) || [])
      .filter((wI) => wI.x === 5 && wI.z === 13);
    check("27d. no reveal slabs (no wall-kind instance at the door cell)",
      wallAtDoor.length === 0, JSON.stringify(wallAtDoor));
    const card = ((out.board.portals) || [])[0];
    check("27e. the darkness card covers the OPENING (0.65 × 1.39) and sits beyond the cell edge",
      !!card && Math.abs(card.sx - 0.65) < 1e-3 && Math.abs(card.sy - 1.39) < 1e-3 &&
      Math.abs(card.oz) > 0.5,
      JSON.stringify(card));
  } catch(e) {
    check("27. kindergarten-door checks (chain executed)", false, e.stack || String(e));
  }
  const bootSrc = readTheaterSources();
  check("27f. the leaf is the 36\"×80\" prototype rectangle (0.6 u × 4/3 u)",
    /ITR_DOOR_WIDTH\s*=\s*0\.6;/.test(bootSrc) && /ITR_DOOR_HEIGHT\s*=\s*4\s*\/\s*3;/.test(bootSrc));
  check("27g. production shell suppresses fallback prisms and derives the socket from authoritative doorAxes",
    /doorframeFallbackSource\s*=\s*useCompiledRoomShell\s*\?\s*\[\]\s*:\s*\(inst\.doorframe\s*\|\|\s*\[\]\)/.test(bootSrc) &&
    /shellDoorSources\s*=\s*\(data\.doorAxes\s*&&\s*data\.doorAxes\.length\)\s*\?\s*data\.doorAxes/.test(bootSrc) &&
    /new Set\(shellDoorSources\.map/.test(bootSrc));
}

// ============================================================================
// 28. EXECUTABLE DOOR PROOF (Adam, 2026-07-24: "can you prove that the door works?") — the
// Clayroom State tab must drive the real board.interactables projection and leave the door tween
// alive after the camera fit is stabilized. Browser proof supplies the visual/angle evidence.
// ============================================================================
{
  const bootSrc = readTheaterSources();
  const settleFn = (bootSrc.match(/function\s+clayRoomSettleCameraPoseTween\s*\(\)\s*\{([\s\S]*?)\n\}/) || [])[1] || "";
  check("28a. camera settling filters by isCameraPoseTween and retains every non-camera tween",
    /isCameraPoseTween/.test(settleFn) && /else\s+keep\.push\(tw\)/.test(settleFn) &&
    /S\.tweens\s*=\s*keep/.test(settleFn), settleFn);
  check("28b. door state transitions kick their own tween render loop",
    /if\(queuedDoorStateTween\)\s+startTweenLoop\(\)/.test(bootSrc));
  check("28c. State tab offers shut / ajar / open controls through one board replay helper",
    /stateTabBtn\.textContent\s*=\s*"State"/.test(bootSrc) &&
    /\["shut",\s*"Set door shut"\][\s\S]*\["ajar",\s*"Set door ajar"\][\s\S]*\["open",\s*"Set door open"\]/.test(bootSrc) &&
    /function\s+clayDoorStateApply\s*\(nextState\)[\s\S]*clayRoomApplyMovementBoard\(session\.state,\s*"clayroom-door-state"\)/.test(bootSrc));
  check("28d. State proof commits canonical Connection state before projecting board interactables",
    /tqConnectionStateCommit\(session\.fixture\.space,\s*session\.state/.test(bootSrc) &&
    /session\.state\s*=\s*committed\.state/.test(bootSrc) &&
    /clayRoomApplyMovementBoard\(session\.state,\s*"clayroom-door-state"\)/.test(bootSrc));
  check("28e. browser-readable proof reports authored/mounted state, live hinge angle, tween, and mount",
    /window\.Theater\._clayDoorProofForTest/.test(bootSrc) &&
    /hingeAngleDeg/.test(bootSrc) && /tweenActive/.test(bootSrc) && /doorMountReport/.test(bootSrc));
}

// ============================================================================
// 29. CL-R1 PANEL + LIGHTING LIFECYCLE REGRESSIONS (2026-07-24).
// ============================================================================
{
  const bootSrc = readTheaterSources();
  check("29a. panel header is an explicit drag handle and button targets are excluded from drag start",
    /clay-room-panel-drag-handle/.test(bootSrc)
    && /pointerdown/.test(bootSrc)
    && /closest\("button"\)/.test(bootSrc));
  check("29b. panel placement clamps against both viewport axes and exposes an obvious reset",
    /window\.innerWidth\s*-\s*panel\.offsetWidth/.test(bootSrc)
    && /window\.innerHeight\s*-\s*panel\.offsetHeight/.test(bootSrc)
    && /Reset Clayroom panel position/.test(bootSrc));
  check("29c. panel position lives outside the board state and is reused after overlay construction",
    /let\s+CLAY_ROOM_PANEL_POSITION\s*=\s*null/.test(bootSrc)
    && /if\(CLAY_ROOM_PANEL_POSITION\)/.test(bootSrc));
  check("29d. unchanged Clayroom lighting identity detaches and reuses the real fixture group",
    /function\s+interiorLightingIdentityFor/.test(bootSrc)
    && /preserveInteriorLighting/.test(bootSrc)
    && /S\.interiorGroup\.remove\(preservedLightsBuilt\.group\)/.test(bootSrc)
    && /preserveInteriorLighting\s*\?\s*preservedLightsBuilt/.test(bootSrc));
  check("29e. a preserved rebuild skips profile and rig reinitialization (no per-frame reset)",
    /if\(!preserveInteriorLighting\)\s*\{\s*applyLightProfile/.test(bootSrc)
    && /if\(rigOn\s*&&\s*!preserveInteriorLighting\)/.test(bootSrc)
    && !/renderTheaterFrame[\s\S]{0,400}clayRoomApplyLightProfile/.test(bootSrc));
  check("29f. live proof snapshots actual point/emitter/material identities and normalized parity",
    /pointUuid/.test(bootSrc) && /emitterUuid/.test(bootSrc) && /materialUuid/.test(bootSrc)
    && /emittedNormalized/.test(bootSrc) && /meshNormalized/.test(bootSrc)
    && /_clayLightingProofForTest/.test(bootSrc));
  check("29g. probe records before/during/after animation snapshots and requires preservation",
    /clayRoomRecordLightingProbe/.test(bootSrc)
    && /before-rebuild/.test(bootSrc) && /during-animation/.test(bootSrc) && /after-animation/.test(bootSrc)
    && /duringPass:\s*!!preserved/.test(bootSrc));
  check("29h. authored-baseline control restores each recipe's authored local state and sample 1",
    /Restore authored lighting baseline/.test(bootSrc)
    && /function\s+clayRoomRestoreAuthoredLightBaseline/.test(bootSrc)
    && /authoredLight\s*&&\s*authoredLight\.state\s*===\s*"flickering"/.test(bootSrc)
    && /lightFlickerApplySample\(t,\s*1\)/.test(bootSrc));
}

// ============================================================================
// 30. CL-R2 CONCEPT 1 + HUMAN-SCALE REGRESSIONS (2026-07-24).
// Adam selected concept 1: a persistent catalog rail, room-dominant viewport, and dedicated
// inspector rail. Door-state replays are local state edits, not travel, so they must never fire the
// full-screen room transition. The authored room defaults to ten-foot walls (2 world units) and the
// crate is one human-scale six-sided box with explicit side/top face mapping.
// ============================================================================
{
  const bootSrc = readTheaterSources();
  const interiorSrc = read("src/ui/theater-interior.js");
  const shellSrc = read("src/ui/theater-room-mesh.js");
  check("30a. authored/default wall height is 10 ft (2 world units) across compiler + shell + renderer fallbacks",
    /ITR_WALL_HEIGHT_BASE\s*=\s*2;/.test(interiorSrc)
    && /DEFAULT_WALL_HEIGHT\s*=\s*2;/.test(shellSrc)
    && /KIT_WALL_FALLBACK_HEIGHT_BASE\s*=\s*2;/.test(bootSrc)
    && /ITR_WALLHANG_FALLBACK_WALL_HEIGHT\s*=\s*2;/.test(bootSrc));
  const crateRecipe = (interiorSrc.match(/crate:\s*Object\.freeze\(\[([\s\S]*?)\]\),/) || [])[1] || "";
  check("30b. crate recipe is exactly one human-scale box with explicit side/top face labels",
    (crateRecipe.match(/\{\s*dx:/g) || []).length === 1
    && /sx:\s*0\.6,\s*sy:\s*0\.6,\s*sz:\s*0\.6/.test(crateRecipe)
    && /face:\s*"crate-body"/.test(crateRecipe)
    && /topFace:\s*"crate-top"/.test(crateRecipe), crateRecipe);
  check("30c. furniture builder maps the BoxGeometry top group separately without adding geometry",
    /const\s+topMat\s*=\s*p\.topFace/.test(bootSrc)
    && /\[mat,\s*mat,\s*topMat,\s*mat,\s*mat,\s*mat\]/.test(bootSrc));
  check("30d. state/rebuild helpers explicitly suppress travel-only room transitions",
    /function\s+setInteriorBoard\s*\(data,\s*renderOpts\)/.test(bootSrc)
    && /renderOpts\.roomTransition\s*!==\s*false/.test(bootSrc)
    && /setInteriorBoard\(board,\s*\{\s*roomTransition:\s*false/.test(bootSrc)
    && /setInteriorBoard\(S\.lastBoard,\s*\{\s*roomTransition:\s*false/.test(bootSrc));
  check("30e. Concept 1 shell exposes persistent Catalog, Scene, Viewport, and Inspector regions",
    /clay-room-workbench-catalog/.test(bootSrc)
    && /clay-room-workbench-scene/.test(bootSrc)
    && /clay-room-workbench-viewport/.test(bootSrc)
    && /clay-room-workbench-inspector/.test(bootSrc));
  check("30f. inspector makes edit scope explicit and keeps socket/default protected",
    /SESSION ONLY/.test(bootSrc)
    && /INSTANCE/.test(bootSrc) && /STATE/.test(bootSrc)
    && /SOCKET/.test(bootSrc) && /DEFAULT/.test(bootSrc)
    && /FUTURE ROLLS/.test(bootSrc));
  check("30g. real scene objects carry selection identities and the viewport uses production raycasting",
    /sceneObjectId/.test(bootSrc)
    && /function\s+clayRoomPickAt/.test(bootSrc)
    && /new\s+THREE\.Raycaster/.test(bootSrc));
  check("30h. narrow workbench can collapse Catalog and resizes the real renderer; floating title stays below the top bar",
    /Collapse or expand Clayroom catalog/.test(bootSrc)
    && /S\.clayRoomCatalogCollapsed/.test(bootSrc)
    && /if\(S\.resizeHandler\)\s*S\.resizeHandler\(\)/.test(bootSrc)
    && /minTop\s*=\s*52/.test(bootSrc)
    && /panel docked right · viewport clamp PASS/.test(bootSrc));
}

// ============================================================================
// 31. C1B FULL MOVEMENT LAB (founder expansion, 2026-07-24).
// The 5x5 starting fixture could not distinguish an ordinary 30-ft range from its Dash extension.
// This gate executes the actual 15x15 SpatialPlan adapter and TacticalQueryKernel, then checks that
// the dev renderer only projects its range/preview/receipt answers through the real standee verb.
// ============================================================================
{
  const win = freshWin();
  try {
    const record = win.clayRoomRecordFrom(0x6c0ffee);
    const compiled = win.clayRoomBoardFrom(record);
    const fixture = win.clayRoomMovementFixtureFrom(record, compiled);
    const ranges = win.tqMovementRanges(fixture.space, fixture.state, fixture.actorId);
    check("31a. C1B record explicitly carries 30-ft movement, route waypoints, and one Connection owner",
      record.dims.w === 15 && record.dims.d === 15
      && record.movement.speedFt === 30
      && record.movement.routeWaypoints.east && record.movement.routeWaypoints.west
      && record.portal.connectionId === record.connection.id
      && record.portal.connectionVersion === record.connection.version,
      JSON.stringify(record));
    check("31b. movement fixture consumes the same SpatialPlan and maps the real crate to one blocker",
      fixture.space.planSeed === compiled.plan.seed
      && fixture.space.cells.find((cell) => cell.id === fixture.localCells.crate).blocked === true,
      JSON.stringify(fixture.localCells));
    check("31c. ordinary and Dash highlights are non-empty, disjoint, and the door is Dash-only",
      ranges.moveCellIds.length > 0 && ranges.dashCellIds.length > 0
      && ranges.moveCellIds.every((id) => !ranges.dashCellIds.includes(id))
      && !ranges.moveCellIds.includes(fixture.localCells.portal)
      && ranges.dashCellIds.includes(fixture.localCells.portal),
      JSON.stringify(ranges));
    const east = win.tqMovementPreview(fixture.space, fixture.state, {
      actorId: fixture.actorId,
      destinationCellId: fixture.localCells.portal,
      pace: "dash",
      viaCellId: fixture.localCells.east,
      routeLabel: "east of the crate"
    });
    const west = win.tqMovementPreview(fixture.space, fixture.state, {
      actorId: fixture.actorId,
      destinationCellId: fixture.localCells.portal,
      pace: "dash",
      viaCellId: fixture.localCells.west,
      routeLabel: "west difficult shoulder"
    });
    check("31d. east route reaches the door at exactly 60 ft; west difficult route is lawfully refused",
      east.ok && east.route.costFt === 60 && !west.ok && west.reason === "out-of-range"
      && west.detail.costFt > east.route.costFt,
      JSON.stringify({ east, west }));
    const staged = win.tqMovementCommit(fixture.space, fixture.state, east);
    const cross = win.tqMovementPreview(fixture.space, staged.state, {
      actorId: fixture.actorId,
      connectionId: fixture.connectionId,
      pace: "move"
    });
    const crossed = win.tqMovementCommit(fixture.space, staged.state, cross);
    check("31e. preview/commit route is exact and portal use opens one shared Connection endpoint",
      staged.ok && staged.receipt.route.cells.join(">") === east.route.cells.join(">")
      && cross.ok && crossed.ok
      && crossed.state.connections[0].state === "open"
      && crossed.state.actors[0].sceneId === "clay-beyond",
      JSON.stringify(crossed));
    const conn = fixture.space.connections[0];
    const ordinary = win.tqConnectionAssessment(conn, record.citizen.bodyForm);
    const difficult = win.tqConnectionAssessment(conn, Object.assign({}, record.citizen.bodyForm, { sizeCategory: "Large" }));
    const blocked = win.tqConnectionAssessment(conn, Object.assign({}, record.citizen.bodyForm, { sizeCategory: "Huge" }));
    const uncertain = win.tqConnectionAssessment(conn, record.citizen.bodyForm, "force-warped-frame");
    check("31f. same real connection proves ordinary, SRD difficult, checked uncertainty, and true blockage",
      ordinary.kind === "ordinary"
      && difficult.kind === "difficult"
      && blocked.kind === "blocked" && blocked.alternatives.length >= 2
      && uncertain.kind === "uncertain" && uncertain.checkContract.dcRevealed === false
      && !JSON.stringify(uncertain).includes("\"dc\":"),
      JSON.stringify({ ordinary, difficult, blocked, uncertain }));
  } catch(e) {
    check("31a-f. C1B production movement chain executes without throw", false, e.stack || String(e));
  }

  const bootSrc = readTheaterSources();
  check("31g. renderer projects kernel range bands with distinct fill and hollow-diamond shapes",
    /ranges\.moveCellIds/.test(bootSrc)
    && /new\s+THREE\.BoxGeometry\(0\.86/.test(bootSrc)
    && /ranges\.dashCellIds/.test(bootSrc)
    && /new\s+THREE\.RingGeometry\(0\.26,\s*0\.40,\s*4\)/.test(bootSrc)
    && /rangeBand\s*=\s*"move"/.test(bootSrc)
    && /rangeBand\s*=\s*"dash"/.test(bootSrc));
  check("31h. committed receipt cells drive the existing production move-step verb one cell at a time",
    /function\s+clayRoomAnimateMovementReceipt/.test(bootSrc)
    && /receipt\.route/.test(bootSrc)
    && /playStandeeVerb\(actor,\s*"move-step"/.test(bootSrc)
    && /setTimeout\(playNext,\s*0\)/.test(bootSrc)
    && /actorFound/.test(bootSrc)
    && /completedSteps/.test(bootSrc)
    && /if\(onProgress\)\s*onProgress\(\)/.test(bootSrc));
  check("31i. session movement truth lives in GS and every movement rebuild suppresses travel fade",
    /GS\.clayRoomMovementSession/.test(bootSrc)
    && /session\.state\s*=\s*committed\.state/.test(bootSrc)
    && /setInteriorBoard\(board,\s*\{\s*roomTransition:\s*false/.test(bootSrc));
  check("31j. live proof exposes revision, actor, Connection, exact ranges, preview, receipt, and overlay",
    /window\.Theater\._clayMovementProofForTest/.test(bootSrc)
    && /stateRevision/.test(bootSrc) && /lastReceipt/.test(bootSrc)
    && /clayRoomMovementOverlaySummary/.test(bootSrc));
}

// ============================================================================
// 32. CL-F02 LIGHTING BENCH (CL-R1 checkpoint).
// A deterministic neutral staircase/sphere/cube input must run inside the existing production
// Theater, keep one approved sprite, suppress measurement noise, and expose honest light overlays.
// ============================================================================
{
  const win = freshWin();
  try {
    const record = win.clayRoomRecordFrom(0x6c0ffee);
    const fixture = win.clayRoomLightingBenchFixtureFrom(record);
    check("32a. CL-F02 is frozen deterministic fixture data with a versioned identity and five primitives",
      fixture.id === "cl-f02-lighting-bench"
      && fixture.version === 1
      && Object.isFrozen(fixture)
      && Object.isFrozen(fixture.primitives)
      && fixture.primitives.length === 5,
      JSON.stringify(fixture));
    const steps = fixture.primitives.filter((row) => row.id.indexOf("bench-step-") === 0);
    check("32b. the bench carries three rising matte steps whose tread depth is exactly one third of a cell",
      steps.length === 3
      && steps.every((row) => row.primitive === "box" && row.role === "riser" && row.size.z === 1 / 3)
      && steps[0].size.y < steps[1].size.y && steps[1].size.y < steps[2].size.y,
      JSON.stringify(steps));
    check("32c. matched neutral comparison forms include one cube, one sphere, and an approved-sprite cell",
      fixture.primitives.some((row) => row.id === "bench-matte-cube" && row.primitive === "box")
      && fixture.primitives.some((row) => row.id === "bench-matte-sphere" && row.primitive === "sphere")
      && Number.isInteger(fixture.spriteCell.x) && Number.isInteger(fixture.spriteCell.z),
      JSON.stringify(fixture));
    let undersizedRefused = false;
    try { win.clayRoomLightingBenchFixtureFrom({ dims: { w: 5, d: 5 } }); }
    catch(e) { undersizedRefused = /requires at least a 9x9 room/.test(String(e)); }
    check("32d. an undersized room is refused loudly instead of clipping the diagnostic",
      undersizedRefused);
  } catch(e) {
    check("32a-d. CL-F02 pure fixture checks execute without throw", false, e.stack || String(e));
  }
  const bootSrc = readTheaterSources();
  check("32e. the bench mounts shadow-receiving primitives into the existing production interiorGroup",
    /function\s+clayRoomMountLightingBench/.test(bootSrc)
    && /S\.interiorGroup\.add\(group\)/.test(bootSrc)
    && /mesh\.castShadow\s*=\s*true/.test(bootSrc)
    && /mesh\.receiveShadow\s*=\s*true/.test(bootSrc));
  check("32f. CL-F02 keeps the production sprite path while removing room-truth crate/door clutter",
    /clayRoomLightingBenchFixtureFrom\(S\.clayRoomRecord\)/.test(bootSrc)
    && /cellX:\s*room\.x\s*\+\s*fixture\.spriteCell\.x/.test(bootSrc)
    && /furniture:\s*\[\]/.test(bootSrc)
    && /interactables:\s*\[\]/.test(bootSrc));
  check("32g. position/range/shadow overlays read the live THREE light and preserve exact physical range",
    /light\.getWorldPosition\(p\)/.test(bootSrc)
    && /\[0\.25,\s*0\.5,\s*1\]/.test(bootSrc)
    && /const\s+radius\s*=\s*light\.distance\s*\*\s*frac/.test(bootSrc)
    && /new\s+THREE\.WireframeGeometry/.test(bootSrc));
  check("32h. the live proof reports fixture, forms, overlays, shadow flags, and mote suppression",
    /window\.Theater\._clayLightingBenchForTest/.test(bootSrc)
    && /benchMounted/.test(bootSrc)
    && /overlayModes/.test(bootSrc)
    && /motesSuppressed/.test(bootSrc));
  check("32i. the workbench never labels room-only crate/door objects mounted on the lighting bench",
    /data-clay-room-truth-only/.test(bootSrc)
    && /status\.textContent\s*=\s*roomTruth\s*\?\s*"MOUNTED"\s*:\s*"ROOM ONLY"/.test(bootSrc)
    && /button\.disabled\s*=\s*!roomTruth/.test(bootSrc));
  check("32j. live luma/chroma/clipping diagnostics measure final pixels and compare the sprite with its local surround",
    /function\s+clayRoomLightingPixelMetrics/.test(bootSrc)
    && /gl\.readPixels\(0,\s*0,\s*width,\s*height,\s*gl\.RGBA,\s*gl\.UNSIGNED_BYTE,\s*pixels\)/.test(bootSrc)
    && /clippedHighlightPct/.test(bootSrc)
    && /meanChromaSpread/.test(bootSrc)
    && /excludeRect:\s*spriteRect/.test(bootSrc)
    && /if\(!force\s*&&\s*cached\s*&&\s*cached\.cacheKey\s*===\s*cacheKey\)\s*return cached\.value/.test(bootSrc)
    && /refreshPixelsBtn/.test(bootSrc)
    && /window\.Theater\._clayLightingPixelMetricsForTest/.test(bootSrc));
  check("32k. source-vs-render cards use the admitted authored sprite path and a crop of the live framebuffer",
    /function\s+clayRoomMountSourceSpriteCard/.test(bootSrc)
    && /spriteAssetPathFor\(entry\)/.test(bootSrc)
    && /AUTHORED PNG/.test(bootSrc)
    && /FINAL PIXELS/.test(bootSrc)
    && /clayRoomCanvasFromReadback\(readback,\s*spriteRect/.test(bootSrc));
  check("32l. lore previews reuse the five authored sun/moon/magic/fire/lava recipes and seed only disposable recipe clones",
    /CLAY_ROOM_LORE_LIGHT_PREVIEWS/.test(bootSrc)
    && /id:\s*"daylit"/.test(bootSrc)
    && /id:\s*"moonlit"/.test(bootSrc)
    && /id:\s*"magic-glow"/.test(bootSrc)
    && /id:\s*"torchlit"/.test(bootSrc)
    && /id:\s*"lavalit"/.test(bootSrc)
    && /const\s+recipe\s*=\s*lightRecipeDeepClone\(LIGHT_TUNABLES\.profiles\[recipeId\]\)/.test(bootSrc)
    && /light\.flicker\.seed\s*=\s*authoredSeed\s*\+\s*":clay-preview-"/.test(bootSrc));
  check("32m. one action builds the seven-recipe sheet, pins animated stills to seeded sample 2, and exports PNG plus receipt",
    /CLAY_ROOM_LIGHTING_MATRIX_RECIPES/.test(bootSrc)
    && /"clay-neutral-truth"[\s\S]*"clay-opposing-pair"[\s\S]*"daylit"[\s\S]*"moonlit"[\s\S]*"magic-glow"[\s\S]*"torchlit"[\s\S]*"lavalit"/.test(bootSrc)
    && /async function\s+clayRoomCaptureLightingMatrix/.test(bootSrc)
    && /lightFlickerStep\(\[\],\s*\[\],\s*S\.interiorLightTargets\s*\|\|\s*\[\],\s*0,\s*2\)/.test(bootSrc)
    && /DOWNLOAD PNG/.test(bootSrc)
    && /DOWNLOAD RECEIPT/.test(bootSrc)
    && /window\.Theater\._clayCaptureLightingMatrixForTest/.test(bootSrc));
}

// ============================================================================
// 33. CL-F03 SPRITE CITIZENSHIP (CL-R2 checkpoint).
// The live production path must compare the real scale spectrum, preserve tactical ownership while
// using tread-fit natural supports, expose face/edge + light-response controls, and keep anchors/bounds
// editable in the existing Sprite Editor.
// ============================================================================
{
  const win = freshWin();
  try {
    const record = win.clayRoomRecordFrom(0x6c0ffee);
    const fixture = win.clayRoomSpriteCitizenshipFixtureFrom(record);
    check("33a. CL-F03 is frozen, versioned, and carries the seven-role live stress cast",
      fixture.id === "cl-f03-sprite-citizenship"
      && fixture.version === 1
      && Object.isFrozen(fixture)
      && Object.isFrozen(fixture.cast)
      && fixture.cast.length === 7
      && new Set(fixture.cast.map((row) => row.slug)).size === 7,
      JSON.stringify(fixture));
    check("33b. the spectrum includes smallest, Small, human, bright, dark, Huge, and largest/width cases",
      fixture.cast.some((row) => /smallest/.test(row.stress))
      && fixture.cast.some((row) => row.label === "Winged kobold")
      && fixture.cast.some((row) => /human reference/.test(row.stress))
      && fixture.cast.some((row) => /highlight/.test(row.stress))
      && fixture.cast.some((row) => /dark\/irregular/.test(row.stress))
      && fixture.cast.some((row) => row.label === "Treant" && row.tacticalSpanCells === 3)
      && fixture.cast.some((row) => row.label === "Kraken" && row.tacticalSpanCells === 4));
    check("33c. visible support depth is authored from exactly one third-cell stair tread",
      fixture.stair.steps === 3 && fixture.stair.treadDepth === 1 / 3);
    check("33d. the preferred 1–30 ft presentation scale preserves canonical height and tactical truth",
      fixture.candidatePresentationCap.minFeet === 1
      && fixture.candidatePresentationCap.maxFeet === 30
      && /preferred presentation scale/.test(fixture.candidatePresentationCap.label));
    check("33e. every CL-F03 cast entry has compiled normalized content bounds",
      fixture.cast.every((row) => {
        const entry = win.__claySpriteRegistry()[row.slug];
        return entry && Array.isArray(entry.contentBounds) && entry.contentBounds.length === 4
          && entry.contentBounds.every((value) => typeof value === "number" && value >= 0 && value <= 1);
      }));
    let undersizedRefused = false;
    try { win.clayRoomSpriteCitizenshipFixtureFrom({ dims: { w: 9, d: 9 } }); }
    catch(e) { undersizedRefused = /requires the 15x15 scale room/.test(String(e)); }
    check("33f. an undersized room is refused loudly instead of clipping the true scale spectrum",
      undersizedRefused);
  } catch(e) {
    check("33a-f. CL-F03 pure fixture checks execute without throw", false, e.stack || String(e));
  }
  const bootSrc = readTheaterSources();
  const editorSrc = read("dev/sprite-review.html");
  const editorServerSrc = read("dev/sprite-review.py");
  check("33g. CL-F03 projects all cast members through data.pieces -> the production interior sprite builder",
    /fixture\.cast\.map\(function\(spec\)/.test(bootSrc)
    && /allowOverheight:\s*true/.test(bootSrc)
    && /const\s+built\s*=\s*interiorSpriteBillboard\(entry,\s*p\.allowOverheight\s*\?\s*null\s*:\s*wallCap\)/.test(bootSrc));
  check("33h. tactical footprint and visible support are separate, with a shallow rounded tread-fit strip",
    /function\s+interiorStandeeSupportMetrics/.test(bootSrc)
    && /const\s+INTERIOR_BASE_TREAD_DEPTH\s*=\s*1\s*\/\s*3/.test(bootSrc)
    && /new\s+THREE\.ExtrudeGeometry/.test(bootSrc)
    && /supportForm\s*=\s*"shallow-rounded-strip"/.test(bootSrc)
    && /clayTacticalFootprint/.test(bootSrc));
  check("33i. the live bench proves face / three-quarter / edge views on a real three-tread stair",
    /claySpriteViewYawOffset/.test(bootSrc)
    && /\[0,\s*Math\.PI\s*\/\s*4,\s*Math\.PI\s*\/\s*2\]/.test(bootSrc)
    && /claySpriteStairSample/.test(bootSrc)
    && /stairFit/.test(bootSrc));
  check("33j. the inspector exposes preferred presentation/true-scale check, seven cast selectors, edge view, and all light responses",
    /TRUE SCALE CHECK/.test(bootSrc)
    && /PRESENTATION · 1–30 FT/.test(bootSrc)
    && /LIVE CAST/.test(bootSrc)
    && /"edge",\s*"EDGE"/.test(bootSrc)
    && /"clay-neutral-truth",\s*"NEUTRAL"/.test(bootSrc)
    && /"moonlit",\s*"DARK"/.test(bootSrc)
    && /"torchlit",\s*"WARM"/.test(bootSrc)
    && /"magic-glow",\s*"COOL"/.test(bootSrc)
    && /"daylit",\s*"DAY"/.test(bootSrc));
  check("33k. the existing Sprite Editor now owns draggable footX/footY crosshairs, 1px arrow nudges, alpha reset, and compiled reset",
    /origin-line-x/.test(editorSrc)
    && /origin-line-y/.test(editorSrc)
    && /origin-cross/.test(editorSrc)
    && /function\s+nudgeAnchor/.test(editorSrc)
    && /const\s+step\s*=\s*ev\.shiftKey\s*\?\s*5\s*:\s*1/.test(editorSrc)
    && /resetAlphaContact/.test(editorSrc)
    && /resetCompiledAnchor/.test(editorSrc));
  check("33l. editor bounds/anchors round-trip through the overlay and generated registry contract",
    /contentBounds/.test(editorSrc)
    && /"contentBounds"/.test(editorServerSrc)
    && /"footX"/.test(editorServerSrc)
    && /"footY"/.test(editorServerSrc)
    && /clear\.push\("floor"\)/.test(editorSrc)
    && /URLSearchParams\(location\.search\)\.get\("sprite"\)/.test(editorSrc)
    && /127\.0\.0\.1:5179\/\?sprite=/.test(bootSrc));
  check("33m. live receipt exposes support/scale/shell/stair/regen data and true scale reads exact worldHeight before rounded scaleTrue",
    /window\.Theater\._claySpriteCitizenshipForTest/.test(bootSrc)
    && /renderedWorldHeight/.test(bootSrc)
    && /supportWidth/.test(bootSrc)
    && /supportDepth/.test(bootSrc)
    && /regenRecommended/.test(bootSrc)
    && /typeof\s+entry\.worldHeight[\s\S]{0,120}entry\.worldHeight\s*\/\s*5\.5[\s\S]{0,160}typeof\s+entry\.scaleTrue/.test(bootSrc));
  check("33n. standee supports use deterministic OBB separation and linked, yaw-following contact shadows",
    /function\s+standeeSupportPenetration/.test(bootSrc)
    && /function\s+resolveMountedStandeeSupportCollisions/.test(bootSrc)
    && /remainingOverlaps/.test(bootSrc)
    && /contactBlobMesh/.test(bootSrc)
    && /function\s+syncStandeeContactBlob/.test(bootSrc));
  check("33o. sprite-only camera fill and selected vertical base-ring glow are masked, shadowless, and live-inspectable",
    /const\s+SPRITE_CAMERA_FILL_LAYER\s*=\s*2/.test(bootSrc)
    && /new\s+THREE\.SpotLight/.test(bootSrc)
    && /fill\.castShadow\s*=\s*false/.test(bootSrc)
    && /claySelectionBaseRingGlow/.test(bootSrc)
    && /const\s+side\s*=\s*mats\[1\]\s*\|\|\s*mats\[0\]/.test(bootSrc)
    && /if\(clayRoomStandeeForSelectionNode\(node\)\)[\s\S]{0,180}return;[\s\S]{0,100}new\s+THREE\.BoxHelper/.test(bootSrc));
  check("33p. a low shadowless hemisphere floor preserves stair/riser form in diagnostic darkness",
    /const\s+ITR_SHADOW_FORM_HEMI_FLOOR\s*=\s*0\.06/.test(bootSrc)
    && /S\.hemiLight\.intensity\s*=\s*ITR_SHADOW_FORM_HEMI_FLOOR/.test(bootSrc)
    && /environmentFormFill/.test(bootSrc)
    && /tread\/riser value floor/.test(bootSrc));
  check("33q. contact pools multiply the floor while selected bases emit support-shaped neon spill with no center bulb",
    /blending:\s*THREE\.MultiplyBlending/.test(bootSrc)
    && /toneMapped:\s*false/.test(bootSrc)
    && /contactMultiplyIdentityRim/.test(bootSrc)
    && /const\s+CLAY_SELECTION_BASE_NEON_DEPTH_SCALE\s*=\s*1\.72/.test(bootSrc)
    && /claySelectionBaseNeonTexture/.test(bootSrc)
    && /blending:\s*THREE\.AdditiveBlending/.test(bootSrc)
    && /emissionSource\s*=\s*"emissive-sidewall"/.test(bootSrc)
    && /footprintShape\s*=\s*"support-rounded-strip"/.test(bootSrc)
    && /centerPointLight:\s*false/.test(bootSrc)
    && /selectionBaseNeon/.test(bootSrc));
  check("33r. sprite art is the sole alpha-silhouette caster for depth and distance shadow lights",
    /mesh\.customDepthMaterial\s*=\s*new\s+THREE\.MeshDepthMaterial/.test(bootSrc)
    && /mesh\.customDistanceMaterial\s*=\s*new\s+THREE\.MeshDistanceMaterial/.test(bootSrc)
    && /map:\s*tex,\s*alphaTest:\s*alphaCutoff,\s*side:\s*THREE\.DoubleSide/.test(bootSrc)
    && /shell\.castShadow\s*=\s*false/.test(bootSrc)
    && /shadowSilhouette/.test(bootSrc)
    && /cast shadow alpha silhouette · edge shell non-casting/.test(bootSrc)
    && /S\.clayRoomSpriteScaleMode\s*=\s*"diagnostic-cap"/.test(bootSrc));
}

// ============================================================================
// 34. CL-F01 STRUCTURE BENCH (CL-R3 checkpoint).
// Generic catalog data must drive the production shell + reusable construction atoms, expose the
// complete socket/access grammar, and visibly reject an incompatible join.
// ============================================================================
{
  const win = freshWin();
  try {
    const record = win.clayRoomRecordFrom(0x6c0ffee);
    const fixture = win.clayRoomStructureBenchFixtureFrom(record);
    const catalog = win.CLAY_STRUCTURE_KIT_CATALOG;
    check("34a. CL-F01 and its structure catalog are frozen, versioned fixture data",
      fixture.id === "cl-f01-structure-bench"
      && fixture.version === 1
      && fixture.catalogId === catalog.id
      && Object.isFrozen(fixture)
      && Object.isFrozen(catalog)
      && Object.isFrozen(fixture.pieces),
      JSON.stringify({ fixture: fixture.id, catalog: catalog.id }));
    check("34b. grid law is 5-ft cells, 2.5-ft h, 10-ft storey, and a 30-degree walkable ceiling",
      catalog.gridLaw.cellFeet === 5
      && catalog.gridLaw.cellWorldUnits === 1
      && catalog.gridLaw.verticalQuantumFeet === 2.5
      && catalog.gridLaw.verticalQuantumWorldUnits === 0.5
      && catalog.gridLaw.storeyQuanta === 4
      && catalog.gridLaw.storeyWorldUnits === 2
      && catalog.gridLaw.maxWalkableSlopeDeg === 30);
    const kinds = new Set(fixture.pieces.map((row) => row.kind));
    check("34c. generic atoms cover straight/T walls, one/wide stairs, ramp, blocker, and both supports",
      ["wall-run", "t-junction", "stair", "ramp", "blocker", "support-square", "support-round"]
        .every((kind) => kinds.has(kind))
      && fixture.pieces.filter((row) => row.kind === "stair" && !row.assembly).map((row) => row.width).sort().join(",") === "1,2"
      && fixture.pieces.filter((row) => row.assembly).length >= 4 // Checkpoint 4: the composed terrace example exists
      && fixture.cutawayWitness.pieceSlug === "spr-pc-human-fighter-female"
      && fixture.cutawayWitness.occluder.profile === "square");
    const tiers = new Set(fixture.shellCells.map((row) => row.tier));
    check("34d. compiled-shell input includes concavity, an aperture cell, and broad raised/sunken tiers",
      fixture.shellCells.length === 32
      && tiers.has(-1) && tiers.has(0) && tiers.has(1)
      && fixture.shellCells.some((row) => row.isDoor)
      && !fixture.shellCells.some((row) => row.x === 5 && row.z === 1)
      && fixture.shellCells.filter((row) => row.tier === 1).length >= 6
      && fixture.shellCells.filter((row) => row.tier === -1).length >= 6);
    const requiredSockets = [
      "floor-mount", "wall-mount", "top-surface", "hinge",
      "butt-join-n", "butt-join-e", "butt-join-s", "butt-join-w",
      "walk-surface", "catch", "terrain-join", "roof-pitch-join", "open"
    ];
    check("34e. catalog declares every base and extension socket family",
      requiredSockets.every((id) => catalog.socketTypes.includes(id))
      && new Set(catalog.socketTypes).size === catalog.socketTypes.length);
    check("34f. every specimen carries sockets, typed face access, and catalog provenance",
      fixture.pieces.every((row) => row.sockets.length >= 2
        && Object.keys(row.access).length >= 2
        && Object.values(row.access).every((kind) => catalog.accessKinds.includes(kind)))
      && catalog.provenance.source === "docs/STRUCTURE-KIT-CATALOG.md");
    const bad = fixture.negativeControl;
    const rejection = win.clayStructureSocketJoinAssessment(bad.source, bad.candidate);
    check("34g. the wrong-axis negative control rejects by a typed reason",
      !rejection.accepted
      && rejection.reason === "socket-axis-mismatch"
      && rejection.reason === bad.expectedReason);
    check("34h. climb access is labelled without claiming climb mechanics",
      catalog.accessKinds.includes("climb-cost")
      && catalog.accessKinds.includes("climb-dc")
      && catalog.climbMechanicsImplemented === false);
    const ramp = fixture.pieces.find((row) => row.kind === "ramp");
    check("34i. the authored ramp stays within the catalog slope law",
      Math.atan2(ramp.rise, ramp.run) * 180 / Math.PI <= catalog.gridLaw.maxWalkableSlopeDeg);
    let undersizedRefused = false;
    try { win.clayRoomStructureBenchFixtureFrom({ dims: { w: 9, d: 9 } }); }
    catch(e) { undersizedRefused = /requires the 15x15 construction room/.test(String(e)); }
    check("34j. an undersized room is loudly refused",
      undersizedRefused);
  } catch(e) {
    check("34a-j. CL-F01 pure fixture checks execute without throw", false, e.stack || String(e));
  }
  const bootSrc = readTheaterSources();
  check("34k. the bench consumes compileRoomShell in the production Theater scene",
    /function\s+clayRoomMountStructureBench/.test(bootSrc)
    && /const\s+shell\s*=\s*compileRoomShell\(cells/.test(bootSrc)
    && /S\.interiorGroup\.add\(group\)/.test(bootSrc));
  check("34l. shell output mounts floor, stem, independent uppers, trim, risers, and a hinged shadow-casting leaf",
    /shell\.floorGeometry/.test(bootSrc)
    && /shell\.wallStemGeometry/.test(bootSrc)
    && /shell\.wallUpperMeshes/.test(bootSrc)
    && /shell\.wallTrimGeometry/.test(bootSrc)
    && /shell\.riserGeometry/.test(bootSrc)
    && /clayStructureBuildOpening/.test(bootSrc)
    && /leaf\.userData\.isDoorLeaf\s*=\s*true/.test(bootSrc));
  check("34m. generic assemblers build volume walls, flush T ownership, stairs/landings, ramp, blocker, and supports",
    /function\s+clayStructureBuildPart/.test(bootSrc)
    && /Branch ends flush on the main run's outer face/.test(bootSrc)
    && /spec\.kind\s*===\s*"stair"/.test(bootSrc)
    && /clayStructureRampGeometry/.test(bootSrc)
    && /spec\.kind\s*===\s*"blocker"/.test(bootSrc)
    && /spec\.kind\s*===\s*"support-square"/.test(bootSrc)
    && /spec\.kind\s*===\s*"support-round"/.test(bootSrc));
  check("34n. socket/access/negative overlays are explicit selectable views and the bad join keeps a physical gap",
    /CLAY_STRUCTURE_BENCH_FIXTURE\.views/.test(bootSrc)
    && /"assembled",\s*"ASSEMBLED"/.test(bootSrc)
    && /"sockets",\s*"SOCKETS"/.test(bootSrc)
    && /"access",\s*"ACCESS"/.test(bootSrc)
    && /"negative",\s*"BAD JOIN"/.test(bootSrc)
    && /"strategic",\s*"ALL WALLS"/.test(bootSrc)
    && /clayStructureStripBetween/.test(bootSrc)
    && /visibleGap:\s*true/.test(bootSrc));
  check("34o. the live receipt exposes geometry, slope, sockets, access, omission, dynamic cutaway, shadows, and provenance",
    /window\.Theater\._clayStructureBenchForTest/.test(bootSrc)
    && /mountedMeshes/.test(bootSrc)
    && /shadowCasters/.test(bootSrc)
    && /cameraSideOmission/.test(bootSrc)
    && /dynamicCutaway/.test(bootSrc)
    && /itrPillarCutawayMask/.test(bootSrc)
    && /negativeControl/.test(bootSrc)
    && /provenance/.test(bootSrc));
  check("34p. CL-F01 opens as the active ladder fixture under the daylight hero and suppresses only host upper clutter",
    /return\s+CLAY_ROOM_STRUCTURE_BENCH_ID/.test(bootSrc)
    && /initialFixtureId\s*===\s*CLAY_ROOM_STRUCTURE_BENCH_ID[\s\S]{0,80}\?\s*"daylit"/.test(bootSrc)
    && /kind\s*===\s*"room-shell-wall-upper"\s*\|\|\s*kind\s*===\s*"room-shell-wall-trim"/.test(bootSrc)
    && /clayStructureHostSuppressed/.test(bootSrc));
  check("34q. fixture lifecycle, workbench selection, and diagnostic surface ownership all include structure",
    /clayRoomMountStructureBench\(\);/.test(bootSrc)
    && /clayRoomShowTab\("structure"\)/.test(bootSrc)
    && /structureSpecId/.test(bootSrc)
    && /"clay-diagnostic-overlay"/.test(bootSrc)
    && /diagnostic-overlay/.test(read("src/engine/clay-room.js")));
  try {
    const fixture = win.CLAY_STRUCTURE_BENCH_FIXTURE;
    let latch = win.clayStructureStagingLatchTransition(null, { type: "door-state", state: "open" });
    const openDidNotStage = !latch.staged && !latch.latched && latch.doorState === "open";
    latch = win.clayStructureStagingLatchTransition(latch, { type: fixture.wallOmission.stagedEvent });
    latch = win.clayStructureStagingLatchTransition(latch, { type: "door-state", state: "shut" });
    const shutDidNotReconceil = latch.staged && latch.latched && latch.doorState === "shut";
    latch = win.clayStructureStagingLatchTransition(latch, { type: fixture.wallOmission.releaseEvent });
    check("34r. the staging latch ignores raw door motion, survives a shut door, and releases only when play leaves",
      openDidNotStage && shutDidNotReconceil && !latch.staged && !latch.latched);
  } catch(e) {
    check("34r. the staging latch sequence executes without throw", false, e.stack || String(e));
  }
  check("34s. CL-F01's actual compiler predicate requires staged+latched and carves out apertures, risers, and strategic view",
    /const\s+omissionActive\s*=\s*staging\.staged\s*&&\s*staging\.latched\s*&&\s*!strategicView/.test(bootSrc)
    && /if\(seg\.kind\s*===\s*"door"\)\s*return\s+true/.test(bootSrc)
    && /structuralMassBuilt:\s*shell\.riserSegments\.length\s*>\s*0/.test(bootSrc)
    && /cameraMode:\s*strategicView\s*\?\s*"top-down-strategic"/.test(bootSrc)
    && /wallUpperMeshes\.length\s*\+\s*omittedKeys\.size/.test(bootSrc));
  check("34t. staging and door proof controls rebuild through the production board and use C1B's canonical connection commit",
    /function\s+clayRoomSetStructureStaged/.test(bootSrc)
    && /function\s+clayRoomSetStructureDoorState/.test(bootSrc)
    && /tqConnectionStateCommit\(session\.fixture\.space,\s*session\.state/.test(bootSrc)
    && /clayRoomRebuildStructureBench/.test(bootSrc)
    && /setInteriorBoard\(board,\s*\{\s*roomTransition:\s*false/.test(bootSrc)
    && /_claySetStructureStagedForTest/.test(bootSrc)
    && /_claySetStructureDoorStateForTest/.test(bootSrc));
}

// 35. ENVIRONMENT AO (visual-correction Checkpoint 1 — docs/FABLE-CLAYROOM-VISUAL-CORRECTION-
// ASSIGNMENT.md). Restrained GTAO through the production composer: bounded authored settings, an
// A/B diagnostic (never a taste slider), and a prepass exclusion rule that keeps sprite cards and
// screen-space helper quads from writing occluder rectangles into the AO G-buffer.
{
  const bootSrc = readTheaterSources();
  check("35a. GTAOPass is vendored from the pinned three release and imported through the addons importmap",
    /import \{ GTAOPass \} from "three\/addons\/postprocessing\/GTAOPass\.js"/.test(bootSrc)
    && existsSync(join(ROOT, "vendor/three/addons/postprocessing/GTAOPass.js"))
    && existsSync(join(ROOT, "vendor/three/addons/shaders/GTAOShader.js"))
    && existsSync(join(ROOT, "vendor/three/addons/shaders/PoissonDenoiseShader.js"))
    && existsSync(join(ROOT, "vendor/three/addons/math/SimplexNoise.js")));
  try {
    const { createHash } = await import("node:crypto");
    const sha = (p) => createHash("sha256").update(readFileSync(join(ROOT, p))).digest("hex");
    check("35b. the vendored AO files are byte-identical to the recorded pinned-release hashes",
      sha("vendor/three/addons/postprocessing/GTAOPass.js").startsWith("980b0367")
      && sha("vendor/three/addons/shaders/GTAOShader.js").startsWith("94edb104")
      && sha("vendor/three/addons/shaders/PoissonDenoiseShader.js").startsWith("3dab419b")
      && sha("vendor/three/addons/math/SimplexNoise.js").startsWith("9b8d541b"));
  } catch(e) {
    check("35b. the vendored AO files are byte-identical to the recorded pinned-release hashes", false, String(e));
  }
  const paramsMatch = bootSrc.match(/const ENV_AO_PARAMS = Object\.freeze\((\{[\s\S]*?\})\);/);
  let params = null;
  try { params = paramsMatch ? new Function("return (" + paramsMatch[1] + ");")() : null; } catch(e) { params = null; }
  check("35c. the AO settings are frozen authored constants inside the restrained bounds (short radius, bounded strength, no slider)",
    !!params
    && params.radius > 0 && params.radius <= 0.6
    && params.scale > 0 && params.scale <= 2
    && params.samples >= 4 && params.samples <= 16
    && /const ENV_AO_BLEND_INTENSITY = 1(\.0)?;/.test(bootSrc));
  const fnMatch = bootSrc.match(/function envAOPrepassExcludes\(mesh\)\{[\s\S]*?\n\}/);
  let predicate = null;
  try { predicate = fnMatch ? new Function(fnMatch[0] + "; return envAOPrepassExcludes;")() : null; } catch(e) { predicate = null; }
  if (predicate) {
    const mesh = (mats) => ({ isMesh: true, material: mats });
    check("35d. EXECUTED: the prepass exclusion rule hides transparent/non-depth-writing helper quads and keeps opaque geometry",
      predicate(mesh({ transparent: true, depthWrite: true })) === true            // sprite billboard card
      && predicate(mesh({ transparent: false, depthWrite: false })) === true       // overlay strip / contact pool
      && predicate(mesh({ transparent: false, depthWrite: true })) === false       // wall/floor/stair/support
      && predicate(mesh([{ transparent: true }, { transparent: false, depthWrite: true }])) === false // mixed: one opaque face keeps it
      && predicate({ isMesh: false }) === false                                    // groups/lights untouched
      && predicate(mesh(null)) === false);                                         // defensive: no material
  } else {
    check("35d. EXECUTED: the prepass exclusion rule hides transparent/non-depth-writing helper quads and keeps opaque geometry",
      false, "could not extract envAOPrepassExcludes from source");
  }
  check("35e. the AO pass subclasses the vendored pass (file untouched) and counts its exclusions for the receipt",
    /class EnvironmentAOPass extends GTAOPass\s*\{/.test(bootSrc)
    && /super\.overrideVisibility\(\)/.test(bootSrc)
    && /lastPrepassExcludedCount/.test(bootSrc));
  check("35f. the pass mounts between render and dof, tears down with the suite, resizes with the canvas, and resyncs camera + projection define per mount",
    /S\.composer\.addPass\(S\.postSuite\.renderPass\);[\s\S]{0,400}addPass\(S\.postSuite\.ao\);[\s\S]{0,200}addPass\(S\.postSuite\.dof\)/.test(bootSrc)
    && /S\.composer\.removePass\(S\.postSuite\.ao\)/.test(bootSrc)
    && /S\.postSuite\.ao\.setSize\(Math\.round\(size\.x \* aoPixelRatio\), Math\.round\(size\.y \* aoPixelRatio\)\)/.test(bootSrc)
    && /const ENV_AO_RESOLUTION_SCALE = 0\.5;/.test(bootSrc)
    && /getPixelRatio\(\) : 1\) \* ENV_AO_RESOLUTION_SCALE/.test(bootSrc)
    && /S\.postSuite\.ao\.camera = S\.camera/.test(bootSrc)
    && /defines\.PERSPECTIVE_CAMERA/.test(bootSrc));
  check("35g. AO state survives recipe switches by construction (recipe application never touches the suite) and the A/B is bounded",
    !/clayRoomApplyLightProfile[\s\S]{0,2000}postSuite\.ao/.test(bootSrc)
    && /window\.Theater\._environmentAOForTest/.test(bootSrc)
    && /_envAOPrepassExcludesForTest/.test(bootSrc)
    && /ENV AO /.test(bootSrc)
    && /clayRoomEnvAOSyncButton/.test(bootSrc)
    && /get\("envao"\)/.test(bootSrc));
}

// 36. CHECKPOINT 2 — warm/cool overlap + readout truth (visual-correction assignment).
{
  const bootSrc = readTheaterSources();
  const engineSrc = read("src/engine/clay-room.js");
  const recipesSrc = read("src/engine/light-recipes.js");
  const compilerSrc = read("build/compile-light-locks.py");
  const lock = JSON.parse(read("data/light-profile-locks.json"));
  check("36a. every recipe light carries its authored reach (the generated-light cap no longer bites reviewed lock data)",
    /authoredRange: true,/.test(engineSrc)
    && !/authoredRange: lightRecipe\.id === "torchlit"/.test(engineSrc));
  const pair = lock.profiles["clay-opposing-pair"].lights;
  check("36b. EXECUTED: the diagnostic pair floats at symmetric authored studio positions over the subjects",
    pair.length === 2
    && pair[0].mount === "none" && pair[1].mount === "none"
    && pair[0].pos.x === -pair[1].pos.x
    && pair[0].pos.y === pair[1].pos.y && pair[0].pos.z === pair[1].pos.z
    && Math.abs(pair[0].pos.x) > 0.3 && Math.abs(pair[0].pos.x) < 0.8
    && pair[0].falloff > 0 && pair[1].falloff > 0);
  check("36c. the diagnostic-studio float exception is scoped identically in BOTH validators (never a silent bypass)",
    /diagnostic-studio/.test(compilerSrc)
    && /visible-emitter sources require a physical mount/.test(compilerSrc)
    && /profile\.mode !== "diagnostic-studio"/.test(recipesSrc)
    && /must be socket-relative/.test(recipesSrc)
    && /if\(light\.mount === "none"\)/.test(bootSrc));
  check("36d. position/range/shadow overlays default OFF for ordinary review",
    !/\{ position: true, range: true, shadow: false \}/.test(bootSrc)
    && /\{ position: false, range: false, shadow: false \}/.test(bootSrc));
  check("36e. environmental lights register in the live registry and the readout prints mounted truth (markerless-safe)",
    /environmental sources register in the SAME/i.test(bootSrc)
    && /pl: environmentalLight, marker: null/.test(bootSrc)
    && /directional \(no falloff\)/.test(bootSrc)
    && /mounted pos /.test(bootSrc)
    && /celestial: t\.pl && t\.pl\.userData && t\.pl\.userData\.celestial/.test(bootSrc));
  check("36f. the solo A/B seam exists and is visibility-only (nothing moves, nothing rebuilds)",
    /_claySetLightSoloForTest/.test(bootSrc)
    && /r\.pl\.visible = on/.test(bootSrc));
}

// 37. CHECKPOINT 4 — the honest construction workbench (visual-correction assignment).
{
  const bootSrc = readTheaterSources();
  const engineSrc = read("src/engine/clay-room.js");
  check("37a. the ramp renders hard per-face normals (non-indexed), never averaged pillow shading",
    /const hardFaced = geometry\.toNonIndexed\(\);/.test(bootSrc)
    && /hardFaced\.computeVertexNormals\(\);/.test(bootSrc));
  check("37b. access overlays are PER-FACE with the fixed class-colour vocabulary",
    /CLAY_ACCESS_CLASS_COLORS = \{ walk: 0x66dfa0, "climb-cost": 0xf3bd55, "climb-dc": 0xff6d68, none: 0x8a9099 \}/.test(bootSrc)
    && /const topClass = access\.top \|\| access\.treads/.test(bootSrc)
    && /const sideClass = access\.sides \|\| access\.shaft \|\| access\.faces/.test(bootSrc));
  check("37c. socket marks are TYPE-coloured directional arrows (shaft + head along the authored axis)",
    /CLAY_SOCKET_TYPE_COLORS/.test(bootSrc)
    && /"walk-surface": 0x66dfa0, "top-surface": 0x6f8fff/.test(bootSrc)
    && /const headL = /.test(bootSrc) && /const headR = /.test(bootSrc));
  check("37d. the composed assembly stands on the shell's own tier via spec.lift, consumed by the builder",
    /assembly-approach-stair/.test(engineSrc)
    && /assembly-parapet/.test(engineSrc)
    && /lift: 0\.5/.test(engineSrc)
    && /y \+ \(spec\.lift \|\| 0\)/.test(bootSrc));
  check("37e. omission reporting has ONE authority: the bench build's own projection, served over the generic shell report",
    /cameraSideOmission: \{\s*\n\s*ruleId: fixture\.wallOmission\.ruleId/.test(bootSrc)
    && /S\.clayRoomStructureReport && S\.clayRoomStructureReport\.cameraSideOmission/.test(bootSrc));
  check("37f. the strategic camera fits from ROOM BOUNDS + live fov/aspect, and workbench chrome yields the viewport majority when narrow",
    /halfDiag \/ Math\.tan\(Math\.min\(vFov, hFov\)\)/.test(bootSrc)
    && /catalogAutoCollapsed = w < 1000 && S\.clayRoomCatalogCollapsed !== false/.test(bootSrc));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
