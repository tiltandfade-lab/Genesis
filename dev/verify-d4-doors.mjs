#!/usr/bin/env node
/* dev/verify-d4-doors.mjs — docs/STAGE-D-WAVE-SPECS.md D4 (DOORS-FIRST render keystone, BEAUTY-
   WAVE-5.md IA-4). Two independent harness techniques, matching the two halves of this unit:

   PART A (Jobs 1+2 — the pure engine/data chain): src/engine/theater-data.js's trayFrom is classic-
   global DATA code (no THREE/DOM — interiorBuildBoard, src/ui/theater-interior.js, is the same "pure"
   file dev/verify-dungeon-interior.mjs already proves). This harness vm-loads the real
   spatializePlan/semanticizePlan/bindWalkInteractables/applyRoomGrammar/interiorBuildBoard/trayFrom
   chain (mirrors dev/verify-room-grammar.mjs's own vm-load convention) and drives a REAL fixture walk
   through trayFrom's {kind:"interior"} branch — the exact production seam theaterStageSync
   (src/world/render.js) calls every render.

   PART B (Job 3 — the THREE-coupled door render): src/ui/theater-boot.js is the sealed ES-module
   boundary file (real THREE/WebGL at runtime) — this harness reuses the SAME source-extraction
   sandbox technique dev/verify-e0-1-fixture-fade.mjs/dev/verify-visible-practicals.mjs already
   established (extract real function text verbatim, eval against a minimal stub THREE, assert)
   rather than jsdom+WebGL (mount() needs a real GL context this environment can't cheaply fake).

   RED-FIRST (checked live against master 074cf05d, the merge commit this branch forked from — the
   full D0-D3 spine landed, D4 not yet started):
     `git show 074cf05d:src/engine/theater-data.js | grep -c "board.interactables"` -> 0 (trayFrom's
     interior branch never stamped an interactables field — D2/D3 verified green but had NO
     production caller, exactly the WIRING LAW gap this unit closes).
     `git show 074cf05d:src/ui/theater-boot.js | grep -c interiorBuildInteractables` -> 0 (no door
     render at all).
     `git show 074cf05d:src/ui/theater-boot.js | grep -c itrDoorShape` -> 0 (no aperture-silhouette
     shaping — the pre-D4 wall aperture, where one existed at all, was a plain rectangular cut).
   Re-checked live below (section 0), not just asserted as prose.

   Sections:
     0. RED-FIRST proof (symbol/behavior absence at master, re-checked live).
     1. PART A — trayFrom's {kind:"interior"} branch stamps board.interactables for a fixture walk
        with rolled door candidates (JOB 1).
     2. PART A — a walk/plan with NO rolled interactable candidates yields board.interactables:[] —
        the board is otherwise BYTE-IDENTICAL to the same board built with the D2/D3 chain absent
        (the wiring is invisible when there is nothing to place).
     3. PART A — JOB 2: a state_transition-shaped mutation on the persisted prep-node store survives
        a full re-derivation of trayFrom's plan (persisted state wins over the freshly rolled
        starting state).
     4. PART A — JOB 2: the FIRST projection of a sourceRef stamps a minimal {sourceRef,archetype,
        state} record into prepNode.interactables — never a second content record (no name/flavor/x/y
        leak into the persisted store).
     5. PART A — absent prepNode (no active walk / a stand-alone harness call) degrades cleanly: the
        fresh projection's rolled starting states pass through untouched, never a throw.
     6. PART B — itrDoorShape: an "arch"-keyword door produces a shape with a real curved segment
        (never a flat 4-point quad); a plain door produces a rectangular outline.
     7. PART B — interiorBuildInteractableDoorMesh: reserve entries produce no mesh; state reads as a
        visibly distinct pose (shut/ajar/open swing angles strictly increasing; broken tips on a
        different axis entirely); the arched silhouette rides the geometry (aperture-matches-roll).
     8. PART B — interiorBuildInteractables: a state_transition between two builds of the SAME
        sourceRef fires exactly one tween on the BW4 channel (S.tweens), fake-clock-drivable to its
        final pose; an unchanged state (or a brand-new sourceRef) mounts directly, no tween; non-door
        archetypes are skipped entirely (D4 scope).
     9. check-manifest.py OK (run live, not just cited).

   Run: node dev/verify-d4-doors.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const BASE_COMMIT = "074cf05d";

let pass = 0, fail = 0;
function ok(cond, msg, detail) { if (cond) { pass++; console.log("  ✓", msg); } else { fail++; console.error("  ✗ FAIL:", msg, detail !== undefined ? "— " + JSON.stringify(detail) : ""); } }
function group(name) { console.log("\n[" + name + "]"); }

function grepAtBase(path, needle) {
  try {
    return execSync(`git show ${BASE_COMMIT}:${path} | grep -c '${needle}' || true`, { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] }).toString().trim();
  } catch (e) { return "ERR:" + String(e.stderr || e.message).split("\n")[0]; }
}

// ============================================================================
// PART A — the pure engine/data chain (Jobs 1+2)
// ============================================================================
function loadEngineChain(opts) {
  opts = opts || {};
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const files = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("data/interactables.js"),
    read("src/engine/place-dressing.js"),
  ];
  // check 2's byte-identical control: a load WITHOUT the D2/D3 chain at all (the typeof-guards in
  // trayFrom must degrade to the exact same board as a load WITH the chain but no candidates).
  if (!opts.omitInteractableChain) {
    files.push(read("src/engine/walk-interactables.js"));
    files.push(read("src/engine/room-grammar.js"));
  }
  files.push(read("src/ui/theater-interior.js"));
  files.push(read("src/engine/theater-data.js"));
  const combined = files.concat([
    "this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__trayFrom=typeof trayFrom!=='undefined'?trayFrom:undefined;",
  ]).join("\n");
  vm.runInContext(combined, sandbox, { filename: "stage-d-d4-doors-engine.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    trayFrom: sandbox.__trayFrom,
  };
}

// same fixture shape dev/verify-walk-binding.mjs's own buildInteractableFixture uses — a 4-room
// dungeon walk with a rolled door candidate on every segment ("Archway" @ s3/s4 matches the "arch"
// keyword; "Iron Door"/"Portcullis" do not).
function buildInteractableFixture() {
  return [
    {
      id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
      exits: [{ targetId: "s2", door: { type: { name: "Iron Door", desc: "riveted plates" }, state: { name: "Closed, Unlocked", desc: "opens freely" } } }],
      light: "normal",
      object: { name: "Wooden chest latch", flavor: "Latch spring is weak; opens too easily." },
      feature: { name: "Loose stone", flavor: "Wobbles under pressure." },
    },
    {
      id: "s2", num: 2, label: "s2", isFinale: false, depth: 1,
      exits: [
        { targetId: "s1", door: { type: { name: "Iron Door", desc: "riveted plates" }, state: { name: "Locked — No Key", desc: "never had a key" } } },
        { targetId: "s3", door: { type: { name: "Portcullis", desc: "rusted teeth" }, state: { name: "Mechanism Jammed", desc: "stuck fast" } } },
      ],
      light: "normal",
      object: { name: "Lever bar", flavor: "Half-hidden behind rubble." },
      feature: { name: "Stone Altar", flavor: "A low slab stained by unknown rituals." },
    },
    {
      id: "s3", num: 3, label: "s3", isFinale: false, depth: 2,
      exits: [
        { targetId: "s4", door: { type: { name: "Archway", desc: "no frame" }, state: { name: "Open / Standing Ajar", desc: "no obstruction" } } },
        { targetId: "s2", door: { type: { name: "Portcullis", desc: "rusted teeth" }, state: { name: "Mechanism Jammed", desc: "stuck fast" } } },
      ],
      light: "normal",
      object: { name: "Crate lid", flavor: "Nailed shut with mismatched nails." },
      feature: { name: "Cold Hearth", flavor: "A great fireplace, ash long dead in the grate." },
    },
    {
      id: "s4", num: 4, label: "s4", isFinale: true, depth: 3,
      exits: [{ targetId: "s3", door: { type: { name: "Archway", desc: "no frame" }, state: { name: "Open / Standing Ajar", desc: "no obstruction" } } }],
      light: "normal",
      object: { name: "Pressure plate", flavor: "Slightly lower than surrounding stone." },
      feature: { name: "Iron Portcullis", flavor: "Rusted teeth half-sunk into the stone floor." },
    },
  ];
}
function noInteractableFixture() {
  // no rolled object/feature/door text matches any archetype keyword, and no exits[].door at all —
  // bindWalkInteractables' own candidate extraction yields nothing for every room.
  return [
    { id: "s1", num: 1, label: "s1", isFinale: true, depth: 0, exits: [], light: "normal",
      object: { name: "Faded mural", flavor: "Colors long since bled to grey." },
      feature: { name: "Cracked flagstone", flavor: "An old repair, badly done." } },
  ];
}

console.log("=== 0. RED-FIRST proof (re-checked live against base commit " + BASE_COMMIT + ") ===");
{
  const wiring = grepAtBase("src/engine/theater-data.js", "board\\.interactables");
  ok(wiring === "0", "0a. master's trayFrom never stamped board.interactables (no production caller before this unit)", wiring);
  const doorRender = grepAtBase("src/ui/theater-boot.js", "interiorBuildInteractables");
  ok(doorRender === "0", "0b. master's theater-boot.js has no interiorBuildInteractables at all", doorRender);
  const shapeFn = grepAtBase("src/ui/theater-boot.js", "itrDoorShape");
  ok(shapeFn === "0", "0c. master's theater-boot.js has no aperture-silhouette shaping (itrDoorShape) at all", shapeFn);
}

const M = loadEngineChain();

group("1 — JOB 1: trayFrom's interior branch stamps board.interactables for a fixture walk with rolled door candidates");
{
  const fixture = buildInteractableFixture();
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "d4-job1" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const walk = { segments: fixture, environment: "dungeon" };
  const board = M.trayFrom({ kind: "interior", plan: semPlan, walk, segment: fixture[0], focusSegNum: 1, radius: 1, realmId: "fantasy", walkId: "d4-job1" }, null, {});
  ok(!!board, "trayFrom returns a board for the interior+plan branch");
  ok(Array.isArray(board.interactables), "board.interactables is an array");
  ok(board.interactables.length > 0, "board.interactables is non-empty for a walk with rolled door/object/feature candidates", board.interactables.length);
  const door = board.interactables.find((e) => e.archetype === "door");
  ok(!!door, "at least one door archetype entry is present", board.interactables.map((e) => e.archetype));
  ok(door && typeof door.sourceRef === "string" && door.sourceRef.length > 0, "the door entry carries a real sourceRef", door && door.sourceRef);
  ok(door && typeof door.extrudeDepth === "number" && door.extrudeDepth > 0, "the door entry carries D1's authored extrudeDepth", door && door.extrudeDepth);
}

group("2 — no rolled candidates: board.interactables is [] AND the board is byte-identical to a chain-absent load");
{
  const fixture = noInteractableFixture();
  const walkId = "d4-job1-empty";
  const plan = M.spatializePlan(fixture, "The Spine", { walkId });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const walk = { segments: fixture, environment: "dungeon" };
  const src = { kind: "interior", plan: semPlan, walk, segment: fixture[0], focusSegNum: 1, radius: 1, realmId: "fantasy", walkId };
  const board = M.trayFrom(src, null, {});
  ok(Array.isArray(board.interactables) && board.interactables.length === 0, "board.interactables is an empty array (never undefined, never a fabricated entry)", board.interactables);

  // byte-identical control: the SAME walk through a trayFrom load with NO D2/D3 chain present at all
  // (master-equivalent render path — its typeof-guards skip the whole block). Strip the one new
  // field (interactables) and the two boards must be byte-identical.
  const M0 = loadEngineChain({ omitInteractableChain: true });
  const plan0 = M0.spatializePlan(fixture, "The Spine", { walkId });
  const semPlan0 = M0.semanticizePlan(plan0, fixture, []);
  const board0 = M0.trayFrom({ kind: "interior", plan: semPlan0, walk, segment: fixture[0], focusSegNum: 1, radius: 1, realmId: "fantasy", walkId }, null, {});
  const stripped = Object.assign({}, board, { interactables: undefined });
  const stripped0 = Object.assign({}, board0, { interactables: undefined });
  ok(JSON.stringify(stripped) === JSON.stringify(stripped0),
    "a no-candidates walk renders BYTE-IDENTICAL (modulo the empty interactables field) to a load with the whole D2/D3 chain absent — the wiring is invisible when there is nothing to place");
}

group("3 — JOB 2: a state_transition survives a full re-derivation of the plan (persisted state wins)");
{
  const fixture = buildInteractableFixture();
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "d4-job2" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const walk = { segments: fixture, environment: "dungeon" };
  const prepNode = {}; // the SAME shape D0's dmFindInteractable reads (w.prep.nodes[id])

  const board1 = M.trayFrom({ kind: "interior", plan: semPlan, walk, segment: fixture[0], focusSegNum: 1, radius: 1, realmId: "fantasy", walkId: "d4-job2", prepNode }, null, {});
  const doorEntry1 = board1.interactables.find((e) => e.sourceRef === "S1.door");
  ok(!!doorEntry1, "S1.door projects on the first render");
  ok(doorEntry1 && doorEntry1.state === "shut", `S1.door's rolled state is "shut" before any transition (got "${doorEntry1 && doorEntry1.state}")`);
  ok(Array.isArray(prepNode.interactables) && prepNode.interactables.some((r) => r.sourceRef === "S1.door"), "the FIRST projection stamped a persisted record for S1.door into prepNode.interactables");

  // simulate D0's own state_transition write (dmFindInteractable finds this exact record by
  // sourceRef and applyEvent's state_transition case sets ent.state=p.to — mirrored here directly
  // so this harness proves D4's OWN contract without re-testing D0's applyEvent, already covered by
  // dev/verify-dm-events.mjs / dev/verify-state-primitive.mjs).
  const persisted = prepNode.interactables.find((r) => r.sourceRef === "S1.door");
  persisted.state = "open";

  const board2 = M.trayFrom({ kind: "interior", plan: semPlan, walk, segment: fixture[0], focusSegNum: 1, radius: 1, realmId: "fantasy", walkId: "d4-job2", prepNode }, null, {});
  const doorEntry2 = board2.interactables.find((e) => e.sourceRef === "S1.door");
  ok(!!doorEntry2, "S1.door still projects on the re-derived plan");
  ok(doorEntry2 && doorEntry2.state === "open", `S1.door reads the PERSISTED state "open" on re-derivation, not the rolled "shut" default (got "${doorEntry2 && doorEntry2.state}")`);
}

group("4 — JOB 2: the persisted record is minimal — identity+state only, never a second content record");
{
  const fixture = buildInteractableFixture();
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "d4-job2-minimal" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const walk = { segments: fixture, environment: "dungeon" };
  const prepNode = {};
  M.trayFrom({ kind: "interior", plan: semPlan, walk, segment: fixture[0], focusSegNum: 1, radius: 1, realmId: "fantasy", walkId: "d4-job2-minimal", prepNode }, null, {});
  const rec = prepNode.interactables.find((r) => r.sourceRef === "S1.door");
  ok(!!rec, "a persisted record exists for S1.door");
  const keys = rec ? Object.keys(rec).sort() : [];
  ok(JSON.stringify(keys) === JSON.stringify(["archetype", "sourceRef", "state"]), `persisted record carries ONLY {sourceRef,archetype,state} (got keys ${JSON.stringify(keys)})`);
}

group("5 — absent prepNode: clean no-op, rolled starting states pass through untouched");
{
  const fixture = buildInteractableFixture();
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "d4-job2-noprep" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const walk = { segments: fixture, environment: "dungeon" };
  let threw = null, board = null;
  try {
    board = M.trayFrom({ kind: "interior", plan: semPlan, walk, segment: fixture[0], focusSegNum: 1, radius: 1, realmId: "fantasy", walkId: "d4-job2-noprep" }, null, {});
  } catch (e) { threw = e; }
  ok(!threw, "trayFrom never throws with no prepNode at all", threw && threw.message);
  const doorEntry = board && board.interactables.find((e) => e.sourceRef === "S1.door");
  ok(doorEntry && doorEntry.state === "shut", "the rolled starting state passes through untouched with no persisted store to reconcile against");
}

// ============================================================================
// PART B — the THREE-coupled door render (Job 3), extractFn sandbox technique
// (verbatim convention: dev/verify-e0-1-fixture-fade.mjs / dev/verify-visible-practicals.mjs)
// ============================================================================
function extractFn(src, name) {
  const sig = "function " + name + "(";
  const start = src.indexOf(sig);
  if (start < 0) return null;
  let i = src.indexOf("{", start), depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}
function extractConstLine(src, name) {
  const re = new RegExp("const " + name + "\\s*=\\s*[^;]+;");
  const m = src.match(re);
  return m ? m[0] : null;
}
function extractFrozenObjLine(src, name) {
  const re = new RegExp("const " + name + " = Object\\.freeze\\(\\{[\\s\\S]*?\\}\\);");
  const m = src.match(re);
  return m ? m[0] : null;
}
function extractFrozenArrLine(src, name) {
  const re = new RegExp("const " + name + " = Object\\.freeze\\(\\[[\\s\\S]*?\\]\\);");
  const m = src.match(re);
  return m ? m[0] : null;
}

function makeVec3(x, y, z) {
  return {
    x: x || 0, y: y || 0, z: z || 0,
    set(nx, ny, nz) { this.x = nx; this.y = ny; this.z = nz; return this; },
  };
}
function makeStubTHREE() {
  function Mesh(geo, mat) {
    return { geometry: geo, material: mat, userData: {}, position: makeVec3(0, 0, 0), rotation: { x: 0, y: 0, z: 0 }, castShadow: false, receiveShadow: false };
  }
  function Group() {
    const g = { children: [], userData: {}, position: makeVec3(0, 0, 0), rotation: { x: 0, y: 0, z: 0 }, add(o) { o.parent = g; this.children.push(o); return this; } };
    return g;
  }
  function Shape() {
    const pts = [];
    return {
      pts,
      moveTo(x, y) { pts.push({ op: "move", x, y }); return this; },
      lineTo(x, y) { pts.push({ op: "line", x, y }); return this; },
      absarc(cx, cy, r, a0, a1, cw) { pts.push({ op: "arc", cx, cy, r, a0, a1, cw }); return this; },
    };
  }
  function ExtrudeGeometry(shape, opts) {
    return { isExtrude: true, shape, opts, translate(x, y, z) { this._translated = { x, y, z }; return this; } };
  }
  function MeshLambertMaterial(opts) { return Object.assign({ userData: {}, opacity: 1, transparent: false }, opts); }
  return { Group, Mesh, Shape, ExtrudeGeometry, MeshLambertMaterial };
}

const bootSrc = read("src/ui/theater-boot.js");

console.log("\n=== extracting Job 3 functions from src/ui/theater-boot.js ===");
const itrDoorIsArchedSrc = extractFn(bootSrc, "itrDoorIsArched");
const itrDoorShapeSrc = extractFn(bootSrc, "itrDoorShape");
const itrDoorStateColorSrc = extractFn(bootSrc, "itrDoorStateColor");
const interiorBuildInteractableDoorMeshSrc = extractFn(bootSrc, "interiorBuildInteractableDoorMesh");
const itrDoorRestPoseSrc = extractFn(bootSrc, "itrDoorRestPose");
const interiorBuildInteractablesSrc = extractFn(bootSrc, "interiorBuildInteractables");
const interiorFloorTopAtSrc = extractFn(bootSrc, "interiorFloorTopAt");
const kilterForSrc = extractFn(bootSrc, "kilterFor");
const archKeywordsLine = extractFrozenArrLine(bootSrc, "ITR_DOOR_ARCH_KEYWORDS");
const swingDegLine = extractFrozenObjLine(bootSrc, "ITR_DOOR_SWING_DEG");
const widthLine = extractConstLine(bootSrc, "ITR_DOOR_WIDTH");
const heightLine = extractConstLine(bootSrc, "ITR_DOOR_HEIGHT");
const fallbackDepthLine = extractConstLine(bootSrc, "ITR_DOOR_FALLBACK_DEPTH");
const tweenMsLine = extractConstLine(bootSrc, "ITR_DOOR_SWING_TWEEN_MS");
const kilterYawLine = extractConstLine(bootSrc, "KILTER_YAW_DEG");
const kilterPosLine = extractConstLine(bootSrc, "KILTER_POS_FRAC");
const floorBaseYLine = extractConstLine(bootSrc, "ITR_FLOOR_BASE_Y");
const floorHeightFallbackLine = extractConstLine(bootSrc, "ITR_FLOOR_HEIGHT_FALLBACK");

[["itrDoorIsArched", itrDoorIsArchedSrc], ["itrDoorShape", itrDoorShapeSrc], ["itrDoorStateColor", itrDoorStateColorSrc],
 ["interiorBuildInteractableDoorMesh", interiorBuildInteractableDoorMeshSrc], ["itrDoorRestPose", itrDoorRestPoseSrc],
 ["interiorBuildInteractables", interiorBuildInteractablesSrc], ["interiorFloorTopAt", interiorFloorTopAtSrc],
 ["kilterFor", kilterForSrc], ["ITR_DOOR_ARCH_KEYWORDS", archKeywordsLine], ["ITR_DOOR_SWING_DEG", swingDegLine]]
  .forEach(([name, src]) => ok(!!src, `extracted ${name} from theater-boot.js`));

function buildSandbox() {
  const THREE = makeStubTHREE();
  const S = { tweens: [] };
  const sandbox = {
    THREE, S, console,
    mf1EaseOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  };
  vm.createContext(sandbox);
  const body = [
    archKeywordsLine, widthLine, heightLine, fallbackDepthLine, swingDegLine, tweenMsLine,
    kilterYawLine, kilterPosLine, floorBaseYLine, floorHeightFallbackLine,
    itrDoorIsArchedSrc, itrDoorShapeSrc, itrDoorStateColorSrc, kilterForSrc,
    interiorFloorTopAtSrc, itrDoorRestPoseSrc, interiorBuildInteractableDoorMeshSrc,
    interiorBuildInteractablesSrc,
    "this.itrDoorShape=itrDoorShape; this.itrDoorIsArched=itrDoorIsArched;",
    "this.interiorBuildInteractableDoorMesh=interiorBuildInteractableDoorMesh;",
    "this.interiorBuildInteractables=interiorBuildInteractables;",
  ].join("\n\n");
  vm.runInContext(body, sandbox, { filename: "stage-d-d4-doors-render.js" });
  return sandbox;
}

group("6 — PART B: itrDoorShape — arched door gets a real curved segment; plain door stays rectangular");
{
  const sandbox = buildSandbox();
  const plain = sandbox.itrDoorShape(false);
  const arched = sandbox.itrDoorShape(true);
  ok(plain.pts.every((p) => p.op !== "arc"), "a plain door's shape has NO arc segment (rectangular outline)");
  ok(arched.pts.some((p) => p.op === "arc"), "an arched door's shape carries a real arc segment (absarc) — never a flat quad");
  ok(sandbox.itrDoorIsArched({ name: "Archway", flavor: "no frame" }), '"Archway" (this fixture\'s own rolled door type) resolves arched:true');
  ok(!sandbox.itrDoorIsArched({ name: "Iron Door", flavor: "riveted plates" }), '"Iron Door" resolves arched:false');
}

group("7 — PART B: reserve entries skip; states visibly distinct; arched silhouette rides the geometry");
{
  const sandbox = buildSandbox();
  const floorTopMap = new Map([["0,0", -0.3], ["-1,0", -0.3], ["1,0", -0.3]]);
  const reserveEntry = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: null, y: null, reserve: true, state: "shut", sourceRef: "r1" }, 0, 0, floorTopMap);
  ok(reserveEntry === null, "a reserve:true (unplaced) entry produces NO mesh (Law 5: narration-only, never a phantom)");

  const mk = (state, name) => sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state, sourceRef: "d1", extrudeDepth: 0.32, name: name || "Iron Door" }, 0, 0, floorTopMap);
  const shut = mk("shut"), ajar = mk("ajar"), open = mk("open"), broken = mk("broken");
  const swingOf = (h) => Math.abs(h.userData.leaf.rotation.y);
  ok(swingOf(shut) === 0, "shut: zero swing (flush in the frame)");
  ok(swingOf(ajar) > swingOf(shut), `ajar swings further than shut (${swingOf(ajar).toFixed(3)} > ${swingOf(shut).toFixed(3)})`);
  ok(swingOf(open) > swingOf(ajar), `open swings further than ajar (${swingOf(open).toFixed(3)} > ${swingOf(ajar).toFixed(3)})`);
  ok(broken.userData.leaf.rotation.y === 0 && Math.abs(broken.userData.leaf.rotation.x) > 0, "broken tips on the X axis (a fall), not a Y swing — visibly distinct from every swing pose");
  ok(shut.userData.state === "shut" && ajar.userData.state === "ajar" && open.userData.state === "open" && broken.userData.state === "broken", "every hinge carries its own state on userData (readable for a study-card capture)");

  const archedHinge = mk("shut", "Stone Archway Door");
  ok(archedHinge.userData.arched === true && archedHinge.userData.leaf.geometry.shape.pts.some((p) => p.op === "arc"),
    "an arch-keyword rolled door's LEAF GEOMETRY carries the arc silhouette (aperture matches the roll — the pre-D4 rectangular cut is the red baseline, check 0c)");
  const plainHinge = mk("shut", "Iron Door");
  ok(plainHinge.userData.arched === false && plainHinge.userData.leaf.geometry.shape.pts.every((p) => p.op !== "arc"),
    "a plain rolled door's leaf geometry stays rectangular");
  ok(plainHinge.userData.leaf.geometry.opts.depth === 0.32, "the extrusion runs at D1's authored extrudeDepth (0.32)", plainHinge.userData.leaf.geometry.opts.depth);

  // deterministic broken-tilt: two builds of the same sourceRef tilt identically; a different
  // sourceRef tilts differently (KILTER-style seeded, never Math.random).
  const b1 = mk("broken"), b2 = mk("broken");
  const b3 = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "dOTHER", extrudeDepth: 0.32, name: "Iron Door" }, 0, 0, floorTopMap);
  ok(b1.userData.leaf.rotation.x === b2.userData.leaf.rotation.x, "broken tilt is deterministic per sourceRef (two builds identical)");
  ok(b1.userData.leaf.rotation.x !== b3.userData.leaf.rotation.x, "a different sourceRef gets a different broken tilt (seeded, not constant)");
}

group("8 — PART B: a state_transition between two builds fires exactly one tween on the BW4 channel");
{
  const sandbox = buildSandbox();
  const floorTopMap = new Map([["0,0", -0.3]]);
  const entryShut = [{ archetype: "door", x: 0, y: 0, state: "shut", sourceRef: "d1", extrudeDepth: 0.32 }];
  const g1 = sandbox.interiorBuildInteractables(entryShut, 0, 0, floorTopMap);
  ok(sandbox.S.tweens.length === 0, "first-ever build of a sourceRef mounts directly — no tween (matches MF-2's own 'only a genuine transition earns a grace')");
  const doorHinge1 = g1.children[0];
  ok(doorHinge1.userData.leaf.rotation.y === 0, "first build sits at the shut rest pose");

  const entryOpen = [{ archetype: "door", x: 0, y: 0, state: "open", sourceRef: "d1", extrudeDepth: 0.32 }];
  const g2 = sandbox.interiorBuildInteractables(entryOpen, 0, 0, floorTopMap);
  ok(sandbox.S.tweens.length === 1, `a real state change (shut->open) for the SAME sourceRef fires exactly one tween (got ${sandbox.S.tweens.length})`);
  const tw = sandbox.S.tweens[0];
  ok(tw.isDoorStateTween === true && tw.doorSourceRef === "d1", "the tween is tagged isDoorStateTween for sourceRef d1");
  const doorHinge2 = g2.children[0];
  ok(doorHinge2.userData.leaf.rotation.y === 0, "the tween starts the leaf AT the previous (shut) pose — never a teleport to the new pose");
  tw.update(0.5);
  const midSwing = doorHinge2.userData.leaf.rotation.y;
  ok(midSwing > 0 && midSwing < (85 * Math.PI / 180), `mid-tween (t=0.5, fake clock) sits strictly between shut and open (got ${midSwing.toFixed(3)} rad)`);
  tw.update(1);
  tw.onDone();
  ok(Math.abs(doorHinge2.userData.leaf.rotation.y - (85 * Math.PI / 180)) < 1e-9, "onDone snaps exactly to the open rest pose");

  // an UNCHANGED state across two builds of the same sourceRef fires no new tween.
  sandbox.S.tweens = [];
  sandbox.interiorBuildInteractables(entryOpen, 0, 0, floorTopMap);
  ok(sandbox.S.tweens.length === 0, "re-building the SAME state twice in a row fires no tween (no spurious retrigger)");

  // D4 scope: a non-door archetype is skipped entirely (renders in D5, after the taste gate).
  const gChest = sandbox.interiorBuildInteractables([{ archetype: "chest", x: 0, y: 0, state: "closed", sourceRef: "c1", extrudeDepth: 0.28 }], 0, 0, floorTopMap);
  ok(gChest.children.length === 0, "a chest entry mounts NOTHING (D4 scope: doors ship first; other archetypes ride D5)");
}

group("8b — E0-1 fade compliance: the door leaf joins its owning wall segment's fadeEntry (call-site block)");
{
  // the block lives inline in setInteriorBoard (the ONE scope holding both the mounted doors and
  // wallUpperFadeEntries — the same reasoning E0-1's own fixture block documents), so this section
  // asserts the extracted block's load-bearing invariants against the real source text, the same
  // technique verify-e0-1-fixture-fade.mjs's check 0 uses for symbol-level claims.
  const blockStart = bootSrc.indexOf("D4 — E0-1 FADE COMPLIANCE");
  ok(blockStart > 0, "the D4 E0-1 fade-compliance block exists in setInteriorBoard");
  const block = blockStart > 0 ? bootSrc.slice(blockStart, blockStart + 2200) : "";
  ok(/owner\.fadeEntry\.materials\.push\(leaf\.material\)/.test(block), "the door leaf material is APPENDED (never overwrites) into the segment's fadeEntry.materials");
  ok(/leaf\.material\.opacity = owner\.fadeEntry\.opacity/.test(block), "the leaf opacity syncs to the entry's CURRENT opacity immediately (a door built mid-fade never floats opaque)");
  ok(/if\(!owner\.fadeEntry\.materials\) owner\.fadeEntry\.materials = \[\]/.test(block), "a fadeEntry with no materials list yet gets one created, not clobbered");
  ok(/wallUpperFadeEntries\.length/.test(block), "a room-shell-less board (no wallUpperFadeEntries) registers nothing — E0-1's defensive case");
  ok(/transparent: true/.test(interiorBuildInteractableDoorMeshSrc), "the door leaf material is transparent:true from construction (fade-capable the instant a tween starts — C4.1b's own law)");
}

console.log("\n=== 9. check-manifest.py ===");
{
  let out = "", code = 0;
  try { out = execSync("python3 build/check-manifest.py", { cwd: ROOT }).toString(); }
  catch (e) { code = 1; out = String(e.stdout || e.message); }
  ok(code === 0 && /RESULT: OK/.test(out), "check-manifest.py RESULT: OK", out.split("\n").slice(-3).join(" | "));
}

console.log(`\n=== TOTAL: ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
