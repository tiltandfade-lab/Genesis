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
        final pose (now ITR_DOOR_SWING_OPEN_DEG, D4b ruling 3's 100-110deg band); an unchanged state
        (or a brand-new sourceRef) mounts directly, no tween; non-door archetypes are skipped
        entirely (D4 scope); the tween's hinge-anchor position is proved UNCHANGED throughout
        (D4b: same axis, never a teleport).
     8b. E0-1 fade compliance (unchanged from D4).

   ─── D4b (docs/STAGE-D-WAVE-SPECS.md D4b, Adam's taste-gate FAIL + 3 rulings) ───────────────────
     9. RED-FIRST: the pre-fix build (master tip fe9da32d — D4 landed, D4b not yet) has no
        itrDoorHingeSign at all, and its leaf geometry's local origin sits at the shape's own
        CENTERLINE (strictly inside its x-extent, never at a real edge) — proving the retired
        centerline pivot live, not just asserted.
    10. GREEN: the fixed code's leaf origin sits at a REAL shape edge for every state, and that
        hinge-anchor position is INVARIANT across shut/ajar/open for the same sourceRef while
        rotation.y genuinely sweeps — the hinge-edge axis, proved both ways.
    11. Hinge side (itrDoorHingeSign) is deterministic per sourceRef (same ref -> same side twice)
        and spreads across both sides over a sample of different sourceRefs (a hash-pick, never a
        constant); the mounted mesh's own hingeSign matches.
    12. Ruling 2: broken is DETACHED+GROUNDED — tip angle in the documented 78-90deg band (never the
        retired ~48-62deg), far-edge height near-zero (reads as fallen, not a diagonal slab still
        standing), and min-Y sits exactly at the documented ground-clearance hair above the floor
        (the computed lift formula proved exact, not approximate).
    13. check-manifest.py OK (run live, not just cited).

   Ruling 1(b) (dressing/apron finding + fix) lives in src/engine/place-dressing.js
   (dpDoorApronCells + the shuffledPlaceable apron-exclusion) — covered by the EXISTING
   dev/verify-dungeon-dressing.mjs / dev/verify-place-dressing.mjs suites (both re-run green,
   unchanged pass counts) rather than duplicated here; this file stays scoped to the door RENDER.

   ─── D4c (docs/STAGE-D-WAVE-SPECS.md D4c, Adam's design ruling 2026-07-14 — "a broken door would
   have a few states: flopped onto the ground; broken into bits; broken partially on the hinge") ──
   LOCKED ARCHITECTURE: three visual VARIANTS ("flopped"|"hanging"|"shattered") within the single
   `broken` CONTRACT state — D0's event contract / D1's registry state lists / dm-contract stay
   byte-untouched. The variant is picked once per sourceRef via a deterministic FNV-1a hash
   (itrDoorBrokenVariantFor, the SAME convention itrDoorHingeSign already established).
     14. RED-FIRST: master tip 62cf1c77 (this branch's fork point — D4b landed, D4c not yet) has no
         itrDoorBrokenVariantFor/ITR_DOOR_BROKEN_VARIANTS at all — every broken door was the single
         flopped tip-forward pose regardless of sourceRef (re-checked live, not just asserted).
         GREEN: three fixture doors with hash-DISTINCT sourceRefs (found by direct search against
         the real hash, no test-seam override) resolve three DIFFERENT variants; a sample of many
         sourceRefs spreads roughly evenly across all three (uniform thirds, never a constant).
     15. flopped: byte-identical to D4b's landed pose for a fixed sourceRef (pinned via the
         _setBrokenDoorVariantForTest-equivalent internal force seam, since D4c's 3-way hash may no
         longer naturally pick "flopped" for every sourceRef the D4b-era tests used).
     16. hanging: hinge-edge invariant still holds (D4b's own hingeIsAtARealEdge helper, reused
         unchanged) — jamb contact proven, never flat (rotation.x stays 0; rotation.y/z both
         non-zero and within their documented 15-30deg / 18-28deg bands).
     17. shattered: the leaf is hidden (never removed — fade/tween code still finds userData.leaf)
         and 3-5 seeded shards mount instead — all grounded (exact ground-clearance height), all
         within the door cell union its 1-cell apron, none inside the aperture's clear lane, count
         in band, and the WHOLE scatter deterministic across two independent builds of the same
         sourceRef (and different for a different sourceRef).
     18. tween: a live state_transition into "broken" tweens the SAME variant itrDoorRestPose's
         hash resolves for that sourceRef (rest pose and tween share the one function) — hanging's
         two simultaneous rotation components interpolate correctly mid-tween; a transition landing
         on "shattered" un-does the fresh-build's terminal shard mount, animates the fall, then
         re-mounts the IDENTICAL final shard scatter onDone (a live break reads the same as a
         freshly-rendered one).
     19. Contract untouched: INTERACTABLE_ARCHETYPE_STATES.door is unchanged (still
         shut/ajar/open/broken, no new entries) and `python3 build/gen-dm-contract.py` is a no-op
         (dm-contract.json byte-identical) — D4c never touched D1's registry or D0's contract.
     20. check-manifest.py OK, re-checked after the D4c edit (superset of section 13 above).

   Run: node dev/verify-d4-doors.mjs */
import { readFileSync, existsSync } from "node:fs";
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
// D4c: ITR_DOOR_BROKEN_VARIANT_FORCE_FOR_TEST is a `let` (mutable test-seam override), not a
// `const` — extractConstLine's regex never matches it.
function extractLetLine(src, name) {
  const re = new RegExp("let " + name + "\\s*=\\s*[^;]+;");
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
    const g = {
      children: [], userData: {}, position: makeVec3(0, 0, 0), rotation: { x: 0, y: 0, z: 0 },
      add(o) { o.parent = g; this.children.push(o); return this; },
      // D4c: real THREE.Object3D.remove() — needed by interiorBuildInteractables' shattered-variant
      // tween path (undo the fresh-build's terminal shard mount before animating the fall).
      remove(o) { const idx = this.children.indexOf(o); if (idx !== -1) { this.children.splice(idx, 1); o.parent = null; } return this; },
    };
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
    return {
      isExtrude: true, shape, opts,
      translate(x, y, z) {
        // D4b: ACCUMULATE (never overwrite) — interiorBuildInteractableDoorMesh makes exactly one
        // translate() call post-fix, but accumulating keeps this stub correct even if a future edit
        // splits it into more than one call.
        const prev = this._translated || { x: 0, y: 0, z: 0 };
        this._translated = { x: prev.x + x, y: prev.y + y, z: prev.z + z };
        return this;
      },
    };
  }
  function MeshLambertMaterial(opts) { return Object.assign({ userData: {}, opacity: 1, transparent: false }, opts); }
  return { Group, Mesh, Shape, ExtrudeGeometry, MeshLambertMaterial };
}

const bootSrc = read("src/ui/theater-boot.js");

console.log("\n=== extracting Job 3 functions from src/ui/theater-boot.js ===");
const itrDoorIsArchedSrc = extractFn(bootSrc, "itrDoorIsArched");
const itrDoorShapeSrc = extractFn(bootSrc, "itrDoorShape");
const itrDoorStateColorSrc = extractFn(bootSrc, "itrDoorStateColor");
const itrDoorHingeSignSrc = extractFn(bootSrc, "itrDoorHingeSign");
const itrDoorBrokenTipRadSrc = extractFn(bootSrc, "itrDoorBrokenTipRad");
const interiorBuildInteractableDoorMeshSrc = extractFn(bootSrc, "interiorBuildInteractableDoorMesh");
const itrDoorRestPoseSrc = extractFn(bootSrc, "itrDoorRestPose");
const interiorBuildInteractablesSrc = extractFn(bootSrc, "interiorBuildInteractables");
const interiorFloorTopAtSrc = extractFn(bootSrc, "interiorFloorTopAt");
const kilterForSrc = extractFn(bootSrc, "kilterFor");
const archKeywordsLine = extractFrozenArrLine(bootSrc, "ITR_DOOR_ARCH_KEYWORDS");
const swingAjarDegLine = extractConstLine(bootSrc, "ITR_DOOR_SWING_AJAR_DEG");
const swingOpenDegLine = extractConstLine(bootSrc, "ITR_DOOR_SWING_OPEN_DEG");
const swingDegLine = extractFrozenObjLine(bootSrc, "ITR_DOOR_SWING_DEG");
const brokenTipBaseDegLine = extractConstLine(bootSrc, "ITR_DOOR_BROKEN_TIP_BASE_DEG");
const brokenTipJitterMultLine = extractConstLine(bootSrc, "ITR_DOOR_BROKEN_TIP_JITTER_MULT");
const brokenGroundClearanceLine = extractConstLine(bootSrc, "ITR_DOOR_BROKEN_GROUND_CLEARANCE");
const widthLine = extractConstLine(bootSrc, "ITR_DOOR_WIDTH");
const heightLine = extractConstLine(bootSrc, "ITR_DOOR_HEIGHT");
const fallbackDepthLine = extractConstLine(bootSrc, "ITR_DOOR_FALLBACK_DEPTH");
const tweenMsLine = extractConstLine(bootSrc, "ITR_DOOR_SWING_TWEEN_MS");
const kilterYawLine = extractConstLine(bootSrc, "KILTER_YAW_DEG");
const kilterPosLine = extractConstLine(bootSrc, "KILTER_POS_FRAC");
const floorBaseYLine = extractConstLine(bootSrc, "ITR_FLOOR_BASE_Y");
const floorHeightFallbackLine = extractConstLine(bootSrc, "ITR_FLOOR_HEIGHT_FALLBACK");

// D4c symbols
const itrDoorSeedUnitSrc = extractFn(bootSrc, "itrDoorSeedUnit");
const brokenVariantsLine = extractFrozenArrLine(bootSrc, "ITR_DOOR_BROKEN_VARIANTS");
const brokenVariantForceLine = extractLetLine(bootSrc, "ITR_DOOR_BROKEN_VARIANT_FORCE_FOR_TEST");
const itrDoorBrokenVariantForSrc = extractFn(bootSrc, "itrDoorBrokenVariantFor");
const hangingSwingMinLine = extractConstLine(bootSrc, "ITR_DOOR_HANGING_SWING_MIN_DEG");
const hangingSwingMaxLine = extractConstLine(bootSrc, "ITR_DOOR_HANGING_SWING_MAX_DEG");
const hangingDroopMinLine = extractConstLine(bootSrc, "ITR_DOOR_HANGING_DROOP_MIN_DEG");
const hangingDroopMaxLine = extractConstLine(bootSrc, "ITR_DOOR_HANGING_DROOP_MAX_DEG");
const itrDoorHangingSwingRadSrc = extractFn(bootSrc, "itrDoorHangingSwingRad");
const itrDoorHangingDroopRadSrc = extractFn(bootSrc, "itrDoorHangingDroopRad");
const shatterMinCountLine = extractConstLine(bootSrc, "ITR_DOOR_SHATTER_MIN_COUNT");
const shatterMaxCountLine = extractConstLine(bootSrc, "ITR_DOOR_SHATTER_MAX_COUNT");
const shatterCellLine = extractConstLine(bootSrc, "ITR_DOOR_SHATTER_CELL");
const shatterApronCellsLine = extractConstLine(bootSrc, "ITR_DOOR_SHATTER_APRON_CELLS");
const shatterClearLaneLine = extractConstLine(bootSrc, "ITR_DOOR_SHATTER_CLEAR_LANE");
const shatterSizeMinLine = extractConstLine(bootSrc, "ITR_DOOR_SHATTER_SIZE_MIN");
const shatterSizeMaxLine = extractConstLine(bootSrc, "ITR_DOOR_SHATTER_SIZE_MAX");
const shatterThicknessLine = extractConstLine(bootSrc, "ITR_DOOR_SHATTER_THICKNESS");
const shatterJitterFracLine = extractConstLine(bootSrc, "ITR_DOOR_SHATTER_JITTER_FRAC");
const itrDoorShatterCountSrc = extractFn(bootSrc, "itrDoorShatterCount");
const itrDoorShatterShardsSrc = extractFn(bootSrc, "itrDoorShatterShards");
const itrDoorShatterShapeForSrc = extractFn(bootSrc, "itrDoorShatterShapeFor");
const itrDoorBuildShatterShardMeshSrc = extractFn(bootSrc, "itrDoorBuildShatterShardMesh");

[["itrDoorIsArched", itrDoorIsArchedSrc], ["itrDoorShape", itrDoorShapeSrc], ["itrDoorStateColor", itrDoorStateColorSrc],
 ["itrDoorHingeSign", itrDoorHingeSignSrc], ["itrDoorBrokenTipRad", itrDoorBrokenTipRadSrc],
 ["interiorBuildInteractableDoorMesh", interiorBuildInteractableDoorMeshSrc], ["itrDoorRestPose", itrDoorRestPoseSrc],
 ["interiorBuildInteractables", interiorBuildInteractablesSrc], ["interiorFloorTopAt", interiorFloorTopAtSrc],
 ["kilterFor", kilterForSrc], ["ITR_DOOR_ARCH_KEYWORDS", archKeywordsLine], ["ITR_DOOR_SWING_DEG", swingDegLine],
 ["ITR_DOOR_SWING_AJAR_DEG", swingAjarDegLine], ["ITR_DOOR_SWING_OPEN_DEG", swingOpenDegLine],
 ["ITR_DOOR_BROKEN_TIP_BASE_DEG", brokenTipBaseDegLine], ["ITR_DOOR_BROKEN_TIP_JITTER_MULT", brokenTipJitterMultLine],
 ["ITR_DOOR_BROKEN_GROUND_CLEARANCE", brokenGroundClearanceLine],
 ["itrDoorSeedUnit", itrDoorSeedUnitSrc], ["ITR_DOOR_BROKEN_VARIANTS", brokenVariantsLine],
 ["ITR_DOOR_BROKEN_VARIANT_FORCE_FOR_TEST", brokenVariantForceLine], ["itrDoorBrokenVariantFor", itrDoorBrokenVariantForSrc],
 ["ITR_DOOR_HANGING_SWING_MIN_DEG", hangingSwingMinLine], ["ITR_DOOR_HANGING_SWING_MAX_DEG", hangingSwingMaxLine],
 ["ITR_DOOR_HANGING_DROOP_MIN_DEG", hangingDroopMinLine], ["ITR_DOOR_HANGING_DROOP_MAX_DEG", hangingDroopMaxLine],
 ["itrDoorHangingSwingRad", itrDoorHangingSwingRadSrc], ["itrDoorHangingDroopRad", itrDoorHangingDroopRadSrc],
 ["ITR_DOOR_SHATTER_MIN_COUNT", shatterMinCountLine], ["ITR_DOOR_SHATTER_MAX_COUNT", shatterMaxCountLine],
 ["ITR_DOOR_SHATTER_CELL", shatterCellLine], ["ITR_DOOR_SHATTER_APRON_CELLS", shatterApronCellsLine],
 ["ITR_DOOR_SHATTER_CLEAR_LANE", shatterClearLaneLine], ["ITR_DOOR_SHATTER_SIZE_MIN", shatterSizeMinLine],
 ["ITR_DOOR_SHATTER_SIZE_MAX", shatterSizeMaxLine], ["ITR_DOOR_SHATTER_THICKNESS", shatterThicknessLine],
 ["ITR_DOOR_SHATTER_JITTER_FRAC", shatterJitterFracLine], ["itrDoorShatterCount", itrDoorShatterCountSrc],
 ["itrDoorShatterShards", itrDoorShatterShardsSrc], ["itrDoorShatterShapeFor", itrDoorShatterShapeForSrc],
 ["itrDoorBuildShatterShardMesh", itrDoorBuildShatterShardMeshSrc]]
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
    archKeywordsLine, widthLine, heightLine, fallbackDepthLine,
    swingAjarDegLine, swingOpenDegLine, swingDegLine, tweenMsLine,
    brokenTipBaseDegLine, brokenTipJitterMultLine, brokenGroundClearanceLine,
    kilterYawLine, kilterPosLine, floorBaseYLine, floorHeightFallbackLine,
    itrDoorIsArchedSrc, itrDoorShapeSrc, itrDoorStateColorSrc, kilterForSrc,
    itrDoorHingeSignSrc, itrDoorBrokenTipRadSrc,
    // D4c symbols (order matters only for the `let` force-override, which must exist before
    // itrDoorBrokenVariantFor's body references it — function declarations are hoisted, but this
    // keeps the source block reading top-to-bottom same as the real file).
    brokenVariantsLine, brokenVariantForceLine, itrDoorSeedUnitSrc, itrDoorBrokenVariantForSrc,
    hangingSwingMinLine, hangingSwingMaxLine, hangingDroopMinLine, hangingDroopMaxLine,
    itrDoorHangingSwingRadSrc, itrDoorHangingDroopRadSrc,
    shatterMinCountLine, shatterMaxCountLine, shatterCellLine, shatterApronCellsLine,
    shatterClearLaneLine, shatterSizeMinLine, shatterSizeMaxLine, shatterThicknessLine, shatterJitterFracLine,
    itrDoorShatterCountSrc, itrDoorShatterShardsSrc, itrDoorShatterShapeForSrc, itrDoorBuildShatterShardMeshSrc,
    interiorFloorTopAtSrc, itrDoorRestPoseSrc, interiorBuildInteractableDoorMeshSrc,
    interiorBuildInteractablesSrc,
    "this.itrDoorShape=itrDoorShape; this.itrDoorIsArched=itrDoorIsArched;",
    "this.itrDoorHingeSign=itrDoorHingeSign; this.itrDoorBrokenTipRad=itrDoorBrokenTipRad;",
    "this.ITR_DOOR_SWING_AJAR_DEG=ITR_DOOR_SWING_AJAR_DEG; this.ITR_DOOR_SWING_OPEN_DEG=ITR_DOOR_SWING_OPEN_DEG;",
    "this.ITR_DOOR_WIDTH=ITR_DOOR_WIDTH; this.ITR_DOOR_HEIGHT=ITR_DOOR_HEIGHT;",
    "this.ITR_DOOR_BROKEN_GROUND_CLEARANCE=ITR_DOOR_BROKEN_GROUND_CLEARANCE;",
    "this.interiorBuildInteractableDoorMesh=interiorBuildInteractableDoorMesh;",
    "this.interiorBuildInteractables=interiorBuildInteractables;",
    "this.itrDoorRestPose=itrDoorRestPose;",
    "this.itrDoorBrokenVariantFor=itrDoorBrokenVariantFor;",
    "this.itrDoorHangingSwingRad=itrDoorHangingSwingRad; this.itrDoorHangingDroopRad=itrDoorHangingDroopRad;",
    "this.itrDoorShatterShards=itrDoorShatterShards; this.itrDoorShatterCount=itrDoorShatterCount;",
    "this.ITR_DOOR_SHATTER_MIN_COUNT=ITR_DOOR_SHATTER_MIN_COUNT; this.ITR_DOOR_SHATTER_MAX_COUNT=ITR_DOOR_SHATTER_MAX_COUNT;",
    "this.ITR_DOOR_SHATTER_CELL=ITR_DOOR_SHATTER_CELL; this.ITR_DOOR_SHATTER_APRON_CELLS=ITR_DOOR_SHATTER_APRON_CELLS;",
    "this.ITR_DOOR_SHATTER_CLEAR_LANE=ITR_DOOR_SHATTER_CLEAR_LANE;",
    "this.ITR_DOOR_SHATTER_THICKNESS=ITR_DOOR_SHATTER_THICKNESS; this.ITR_DOOR_SHATTER_SIZE_MIN=ITR_DOOR_SHATTER_SIZE_MIN;",
    "this.ITR_DOOR_SHATTER_SIZE_MAX=ITR_DOOR_SHATTER_SIZE_MAX; this.ITR_DOOR_SHATTER_JITTER_FRAC=ITR_DOOR_SHATTER_JITTER_FRAC;",
    "this.ITR_DOOR_HANGING_SWING_MIN_DEG=ITR_DOOR_HANGING_SWING_MIN_DEG; this.ITR_DOOR_HANGING_SWING_MAX_DEG=ITR_DOOR_HANGING_SWING_MAX_DEG;",
    "this.ITR_DOOR_HANGING_DROOP_MIN_DEG=ITR_DOOR_HANGING_DROOP_MIN_DEG; this.ITR_DOOR_HANGING_DROOP_MAX_DEG=ITR_DOOR_HANGING_DROOP_MAX_DEG;",
    // test-only poke: sets the SAME `let` production's window.Theater._setBrokenDoorVariantForTest
    // writes to — this sandbox has no window.Theater registration block at all (Part B only extracts
    // bare functions), so this tiny local helper is the sandbox-side equivalent of that seam.
    "function __forceBrokenVariantForTest(v){ ITR_DOOR_BROKEN_VARIANT_FORCE_FOR_TEST = (v===\"flopped\"||v===\"hanging\"||v===\"shattered\") ? v : null; }",
    "this.__forceBrokenVariantForTest = __forceBrokenVariantForTest;",
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
  // D4c: this group's own contract is specifically about the FLOPPED pose (tip-forward, D4b's
  // landed formula) — D4c's 3-way hash may no longer naturally pick "flopped" for sourceRefs "d1"/
  // "dOTHER" (it's now one of three), so pin the variant here to keep testing exactly what this
  // group always tested, independent of whatever the hash happens to resolve for these particular
  // strings. The NEW D4c-specific variant coverage lives in groups 14-18 below, using real
  // hash-distinct sourceRefs (no force) to prove the pick itself.
  sandbox.__forceBrokenVariantForTest("flopped");
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
  // D4b ruling 3: the tween must rotate about the SAME hinge axis throughout — never a teleport,
  // never a re-parent. leaf.position (the hinge-edge anchor, set once at mesh-build time) must stay
  // IDENTICAL before/mid/after the tween; only rotation.y may move.
  const posBefore = { x: doorHinge2.userData.leaf.position.x, z: doorHinge2.userData.leaf.position.z };
  tw.update(0.5);
  const midSwing = doorHinge2.userData.leaf.rotation.y;
  ok(midSwing > 0 && midSwing < (sandbox.ITR_DOOR_SWING_OPEN_DEG * Math.PI / 180), `mid-tween (t=0.5, fake clock) sits strictly between shut and open (got ${midSwing.toFixed(3)} rad)`);
  ok(doorHinge2.userData.leaf.position.x === posBefore.x && doorHinge2.userData.leaf.position.z === posBefore.z,
    "mid-tween: the leaf's hinge-anchor position is UNCHANGED (same axis throughout — only rotation moves, never a teleport/re-anchor)");
  tw.update(1);
  tw.onDone();
  ok(Math.abs(doorHinge2.userData.leaf.rotation.y - (sandbox.ITR_DOOR_SWING_OPEN_DEG * Math.PI / 180)) < 1e-9, "onDone snaps exactly to the open rest pose");
  ok(doorHinge2.userData.leaf.position.x === posBefore.x && doorHinge2.userData.leaf.position.z === posBefore.z,
    "post-tween: the leaf's hinge-anchor position is STILL unchanged");

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

// ============================================================================
// D4b — docs/STAGE-D-WAVE-SPECS.md D4b (door presentation fix, Adam's 3 taste-gate rulings).
// shapeXExtent(pts) reads a stub Shape's own recorded points (moveTo/lineTo/absarc) to find its
// x-extent BEFORE any geo.translate — the same technique this file already uses to inspect shapes
// (check 6, `pts.some(...)`), extended to find min/max rather than just arc-presence.
// ============================================================================
function shapeXExtent(pts) {
  let minX = Infinity, maxX = -Infinity;
  (pts || []).forEach((p) => {
    if (p.op === "arc") { minX = Math.min(minX, p.cx - p.r); maxX = Math.max(maxX, p.cx + p.r); }
    else { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); }
  });
  return { minX, maxX };
}
// the HINGE-EDGE INVARIANT itself (D4b ruling 3): after interiorBuildInteractableDoorMesh's own
// geo.translate(-edgeX, ...), the shape's local origin (0) must land EXACTLY on one of its own x
// extents (min or max) — i.e. the translate amount recorded on the stub geometry (`_translated.x`)
// must equal -minX or -maxX. When that holds, the leaf's local origin (which `leaf.rotation.y`
// always rotates about, by definition — an object's own origin is invariant under its own rotation)
// IS a real physical edge of the door, not empty space at its centerline: rotating the leaf then
// genuinely swings the FAR edge while the hinge edge never moves, in WORLD space, because
// `leaf.position` (the world anchor of that local origin) is never touched by `leaf.rotation`.
function hingeIsAtARealEdge(hinge) {
  const leaf = hinge.userData.leaf;
  const { minX, maxX } = shapeXExtent(leaf.geometry.shape.pts);
  const tx = (leaf.geometry._translated && leaf.geometry._translated.x) || 0;
  const atMin = Math.abs(tx - -minX) < 1e-9;
  const atMax = Math.abs(tx - -maxX) < 1e-9;
  return { atRealEdge: atMin || atMax, minX, maxX, tx };
}

group("9 — D4b RED-FIRST: the pre-fix (master tip fe9da32d) centerline pivot fails the hinge-edge invariant");
{
  const D4B_BASE_COMMIT = "fe9da32d"; // master tip this branch forked from — D4 landed, D4b NOT yet
  const oldBootSrc = execSync(`git show ${D4B_BASE_COMMIT}:src/ui/theater-boot.js`, { cwd: ROOT }).toString();
  ok(!/function itrDoorHingeSign\(/.test(oldBootSrc), `0d. ${D4B_BASE_COMMIT}'s theater-boot.js has no itrDoorHingeSign at all (the retired centerline pivot has no hinge-side concept)`);

  const oldFns = {
    itrDoorIsArched: extractFn(oldBootSrc, "itrDoorIsArched"),
    itrDoorShape: extractFn(oldBootSrc, "itrDoorShape"),
    itrDoorStateColor: extractFn(oldBootSrc, "itrDoorStateColor"),
    kilterFor: extractFn(oldBootSrc, "kilterFor"),
    interiorFloorTopAt: extractFn(oldBootSrc, "interiorFloorTopAt"),
    interiorBuildInteractableDoorMesh: extractFn(oldBootSrc, "interiorBuildInteractableDoorMesh"),
  };
  const oldConsts = {
    archKeywords: extractFrozenArrLine(oldBootSrc, "ITR_DOOR_ARCH_KEYWORDS"),
    swingDeg: extractFrozenObjLine(oldBootSrc, "ITR_DOOR_SWING_DEG"),
    width: extractConstLine(oldBootSrc, "ITR_DOOR_WIDTH"),
    height: extractConstLine(oldBootSrc, "ITR_DOOR_HEIGHT"),
    fallbackDepth: extractConstLine(oldBootSrc, "ITR_DOOR_FALLBACK_DEPTH"),
    kilterYaw: extractConstLine(oldBootSrc, "KILTER_YAW_DEG"),
    kilterPos: extractConstLine(oldBootSrc, "KILTER_POS_FRAC"),
    floorBaseY: extractConstLine(oldBootSrc, "ITR_FLOOR_BASE_Y"),
    floorHeightFallback: extractConstLine(oldBootSrc, "ITR_FLOOR_HEIGHT_FALLBACK"),
  };
  Object.entries(oldFns).concat(Object.entries(oldConsts)).forEach(([name, src]) =>
    ok(!!src, `extracted pre-fix ${name} from ${D4B_BASE_COMMIT}`));

  const THREE = makeStubTHREE();
  const oldSandbox = { THREE, console };
  vm.createContext(oldSandbox);
  vm.runInContext([
    oldConsts.archKeywords, oldConsts.width, oldConsts.height, oldConsts.fallbackDepth, oldConsts.swingDeg,
    oldConsts.kilterYaw, oldConsts.kilterPos, oldConsts.floorBaseY, oldConsts.floorHeightFallback,
    oldFns.itrDoorIsArched, oldFns.itrDoorShape, oldFns.itrDoorStateColor, oldFns.kilterFor,
    oldFns.interiorFloorTopAt, oldFns.interiorBuildInteractableDoorMesh,
    "this.interiorBuildInteractableDoorMesh=interiorBuildInteractableDoorMesh;",
  ].join("\n\n"), oldSandbox, { filename: "d4b-red-first-old-boot.js" });

  const floorTopMap = new Map([["0,0", -0.3]]);
  const oldShut = oldSandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "shut", sourceRef: "red1", extrudeDepth: 0.32 }, 0, 0, floorTopMap);
  const oldOpen = oldSandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "open", sourceRef: "red1", extrudeDepth: 0.32 }, 0, 0, floorTopMap);
  const oldEdge = hingeIsAtARealEdge(oldShut);
  ok(!oldEdge.atRealEdge, `RED: pre-fix geometry's local origin sits at the shape's CENTERLINE (x=0), strictly inside its own extent [${oldEdge.minX}, ${oldEdge.maxX}] — never a real edge (this IS the retired centerline-pivot bug)`, oldEdge);
  ok(oldShut.userData.leaf.position.x === 0 && oldOpen.userData.leaf.position.x === 0,
    "RED: pre-fix leaf.position.x is 0 regardless of state — no hinge-edge anchor exists at all, confirming the centerline-spin diagnosis");
}

group("10 — D4b GREEN: the fixed code's leaf origin sits at a real jamb edge, invariant across states");
{
  const sandbox = buildSandbox();
  const floorTopMap = new Map([["0,0", -0.3]]);
  const mk = (state) => sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state, sourceRef: "hinge1", extrudeDepth: 0.32 }, 0, 0, floorTopMap);
  const shut = mk("shut"), ajar = mk("ajar"), open = mk("open");
  [["shut", shut], ["ajar", ajar], ["open", open]].forEach(([label, hinge]) => {
    const edge = hingeIsAtARealEdge(hinge);
    ok(edge.atRealEdge, `${label}: the leaf geometry's local origin sits at a REAL shape edge (${JSON.stringify(edge)}), not the centerline`);
  });
  // the WORLD-relative hinge anchor (leaf.position, in the hinge group's own frame) is IDENTICAL
  // across shut/ajar/open for the SAME sourceRef — the far edge sweeps (rotation.y differs) but the
  // hinge-edge vertex column (this anchor) never moves, satisfying the RED-FIRST check's converse.
  ok(shut.userData.leaf.position.x === ajar.userData.leaf.position.x && ajar.userData.leaf.position.x === open.userData.leaf.position.x,
    `the hinge anchor x is INVARIANT across shut/ajar/open (${shut.userData.leaf.position.x}) while rotation.y sweeps (${shut.userData.leaf.rotation.y}, ${ajar.userData.leaf.rotation.y}, ${open.userData.leaf.rotation.y})`);
  ok(ajar.userData.leaf.rotation.y !== shut.userData.leaf.rotation.y && open.userData.leaf.rotation.y !== ajar.userData.leaf.rotation.y,
    "the far edge genuinely sweeps — rotation.y strictly differs state to state (never a static pose masquerading as a hinge)");
}

group("11 — D4b hinge side: deterministic per sourceRef, may differ across sourceRefs");
{
  const sandbox = buildSandbox();
  const a1 = sandbox.itrDoorHingeSign("S1.door");
  const a2 = sandbox.itrDoorHingeSign("S1.door");
  ok(a1 === a2, `the SAME sourceRef resolves the SAME hinge side twice (${a1} === ${a2})`);
  ok(a1 === 1 || a1 === -1, "itrDoorHingeSign resolves to exactly +1 or -1, never anything else");
  const samples = ["S1.door", "S2.door", "S3.door", "S4.door", "S5.door", "S6.door", "S7.door", "S8.door", "d1", "d2", "d3", "d4", "d5", "d6"]
    .map((ref) => sandbox.itrDoorHingeSign(ref));
  ok(samples.some((v) => v === 1) && samples.some((v) => v === -1),
    `across ${samples.length} different sourceRefs, BOTH hinge sides appear at least once (a hash-pick, never a constant) — got ${JSON.stringify(samples)}`);

  // the hinge side actually reaches the built mesh's own edge choice (edgeX sign matches hingeSign).
  const floorTopMap = new Map([["0,0", -0.3]]);
  const left = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "shut", sourceRef: "S1.door", extrudeDepth: 0.32 }, 0, 0, floorTopMap);
  ok(left.userData.hingeSign === a1, "the mounted hinge's own userData.hingeSign matches itrDoorHingeSign's own resolution for the same sourceRef");
}

group("12 — D4b ruling 2: broken leaf is DETACHED+GROUNDED — near-flat tip, min-Y at true floor contact");
{
  const sandbox = buildSandbox();
  // D4c: same reasoning as group 7's own pin — this group tests the FLOPPED tip/grounding formula
  // specifically, so force it regardless of what "brk1"/"brkOTHER" naturally hash to.
  sandbox.__forceBrokenVariantForTest("flopped");
  const floorTopMap = new Map([["0,0", -0.3]]);
  const extrudeDepth = 0.32;
  const broken = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "brk1", extrudeDepth }, 0, 0, floorTopMap);
  const leaf = broken.userData.leaf;
  const tipRad = leaf.rotation.x;
  const tipDeg = tipRad * 180 / Math.PI;
  ok(tipDeg >= 77 && tipDeg <= 91, `broken tip is near-flat (78-90deg documented range, got ${tipDeg.toFixed(1)}deg) — never the retired ~48-62deg mid-air diagonal`);
  // the leaf's own TOP (far) edge height above the base, post-tip — this is the metric that reads as
  // "still standing at an angle" (Adam's "diagonal frame" complaint) when large, vs "collapsed flat"
  // when small. H = the shape's own max-Y extent (ITR_DOOR_HEIGHT for a plain door).
  const topEdgeHeight = sandbox.ITR_DOOR_HEIGHT * Math.cos(tipRad);
  ok(topEdgeHeight < 0.5, `the leaf's far edge sits within 0.5u of the floor once fully tipped (got ${topEdgeHeight.toFixed(3)}u) — reads as FALLEN, not a diagonal slab still standing`);
  // min-Y in true floor contact: the computed grounding-lift (leaf.position.y) must exactly cancel the
  // rotation-induced dip (extrudeDepth/2 * sin(tip)), leaving only the documented ground-clearance hair.
  const dip = (extrudeDepth / 2) * Math.sin(tipRad);
  const minY = -dip + leaf.position.y;
  ok(Math.abs(minY - sandbox.ITR_DOOR_BROKEN_GROUND_CLEARANCE) < 1e-9,
    `min-Y sits exactly at the documented ground-clearance hair above the floor (got ${minY.toFixed(4)}, expected ${sandbox.ITR_DOOR_BROKEN_GROUND_CLEARANCE}) — GROUNDED, never floating`);

  // determinism + sourceRef spread (unchanged contract, re-proved against the new formula).
  const b1 = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "brk1", extrudeDepth }, 0, 0, floorTopMap);
  const b2 = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "brkOTHER", extrudeDepth }, 0, 0, floorTopMap);
  ok(b1.userData.leaf.rotation.x === broken.userData.leaf.rotation.x, "broken tilt is still deterministic per sourceRef (re-derived identically)");
  ok(b2.userData.leaf.rotation.x !== broken.userData.leaf.rotation.x, "a different sourceRef still gets a different (seeded, not constant) broken tilt");
}

// ============================================================================
// D4c — docs/STAGE-D-WAVE-SPECS.md D4c (broken-door variant family, Adam's design ruling
// 2026-07-14). LOCKED ARCHITECTURE: three visual VARIANTS within the single `broken` CONTRACT
// state — never new states.
// ============================================================================
const D4C_BASE_COMMIT = "62cf1c77"; // this branch's own fork point — D4b landed, D4c NOT yet

group("14 — D4c RED-FIRST: the pre-D4c build has no variant family at all; GREEN: hash-distinct sourceRefs resolve distinct variants");
{
  const oldBootSrc = execSync(`git show ${D4C_BASE_COMMIT}:src/ui/theater-boot.js`, { cwd: ROOT }).toString();
  ok(!/function itrDoorBrokenVariantFor\(/.test(oldBootSrc), `RED: ${D4C_BASE_COMMIT}'s theater-boot.js has no itrDoorBrokenVariantFor at all (every broken door was the single flopped tip-forward pose)`);
  ok(!/ITR_DOOR_BROKEN_VARIANTS/.test(oldBootSrc), `RED: ${D4C_BASE_COMMIT}'s theater-boot.js has no ITR_DOOR_BROKEN_VARIANTS constant at all`);
  const oldFn = extractFn(oldBootSrc, "interiorBuildInteractableDoorMesh");
  ok(!!oldFn && /itrDoorBrokenTipRad\(entry\.sourceRef\)/.test(oldFn) && !/hanging|shattered/.test(oldFn),
    `RED: ${D4C_BASE_COMMIT}'s interiorBuildInteractableDoorMesh's broken branch is UNCONDITIONALLY the tip-forward formula — no variant branch exists to fail on`);

  // GREEN: real hash-distinct sourceRefs (found by direct search against the live hash, NO force
  // override) resolve three DIFFERENT variants — these three strings were chosen by brute-force
  // search over the fixture-style "S<n>.door" naming this file's own buildInteractableFixture
  // already uses (S1.door->shattered, S3.door->flopped, S6.door->hanging against THIS branch's
  // hash — re-verified live below, never just asserted).
  const sandbox = buildSandbox();
  const distinctRefs = ["S1.door", "S3.door", "S6.door"];
  const resolved = distinctRefs.map((r) => sandbox.itrDoorBrokenVariantFor(r));
  ok(new Set(resolved).size === 3, `GREEN: three hash-distinct sourceRefs (${JSON.stringify(distinctRefs)}) resolve THREE DIFFERENT variants (got ${JSON.stringify(resolved)})`, resolved);
  ok(resolved.every((v) => v === "flopped" || v === "hanging" || v === "shattered"), "every resolved variant is one of the three named variants, never anything else");

  // determinism: the SAME sourceRef resolves the SAME variant twice.
  ok(sandbox.itrDoorBrokenVariantFor("S1.door") === sandbox.itrDoorBrokenVariantFor("S1.door"), "the same sourceRef resolves the same variant on a second call");

  // uniform thirds: a large sample of sourceRefs spreads roughly evenly across all three (never a
  // constant, never a 2-way split). FNV-1a's diffusion is imperfect for very short, sequential-
  // suffix strings at small N (a measured property, not a bug — kilterFor/itrDoorHingeSign accept
  // the same "hash-pick, never a constant" bar rather than a strict per-sample uniformity guarantee)
  // — 3000 draws is where the distribution actually converges (measured directly: 300 draws can
  // skew to a 30/20/50 split, 3000 lands within a few percent of even thirds every run), so the
  // sample size itself is the fix, not a loosened bound.
  const sample = Array.from({ length: 3000 }, (_, i) => sandbox.itrDoorBrokenVariantFor("d4c-sample-" + i));
  const counts = { flopped: 0, hanging: 0, shattered: 0 };
  sample.forEach((v) => counts[v]++);
  const lo = sample.length * 0.25, hi = sample.length * 0.45;
  ok(counts.flopped > lo && counts.flopped < hi && counts.hanging > lo && counts.hanging < hi && counts.shattered > lo && counts.shattered < hi,
    `uniform thirds: over ${sample.length} sourceRefs, every variant lands within [25%,45%] of the sample (got ${JSON.stringify(counts)}) — never a skewed or constant pick`, counts);
}

group("15 — D4c flopped: byte-identical to D4b's landed pose for a fixed sourceRef (variant pinned)");
{
  const sandbox = buildSandbox();
  sandbox.__forceBrokenVariantForTest("flopped");
  const floorTopMap = new Map([["0,0", -0.3]]);
  const extrudeDepth = 0.32;
  const hinge = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "d4c-flopped-fixed", extrudeDepth }, 0, 0, floorTopMap);
  const leaf = hinge.userData.leaf;
  ok(hinge.userData.brokenVariant === "flopped", "hinge.userData.brokenVariant reads 'flopped' when pinned");
  ok(leaf.rotation.y === 0 && leaf.rotation.z === 0 && Math.abs(leaf.rotation.x) > 0, "flopped: rotation is X-only (D4b's landed tip-forward), Y and Z both zero");
  const expectedTip = (84 + 0) * Math.PI / 180; // sanity band re-check, not the exact formula (that's D4b's own group 12 contract)
  ok(leaf.rotation.x > 77 * Math.PI / 180 && leaf.rotation.x < 91 * Math.PI / 180, "flopped tip sits in D4b's documented 78-90deg band");
  const expectedY = (extrudeDepth / 2) * Math.sin(leaf.rotation.x) + sandbox.ITR_DOOR_BROKEN_GROUND_CLEARANCE;
  ok(Math.abs(leaf.position.y - expectedY) < 1e-9, "flopped's grounding-lift formula is UNCHANGED from D4b (exact, not approximate)");
  ok(leaf.visible !== false, "flopped: the leaf stays visible (never hidden — only shattered hides it)");
  ok(hinge.userData.shards == null, "flopped: no shards array at all (that's shattered-only)");

  // byte-identical re-derivation: building the SAME fixed sourceRef twice (fresh sandbox each time,
  // still forced to flopped) gives IDENTICAL rotation/position — the pose function is pure.
  const sandbox2 = buildSandbox();
  sandbox2.__forceBrokenVariantForTest("flopped");
  const hinge2 = sandbox2.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "d4c-flopped-fixed", extrudeDepth }, 0, 0, floorTopMap);
  ok(hinge2.userData.leaf.rotation.x === leaf.rotation.x && hinge2.userData.leaf.position.y === leaf.position.y,
    "flopped is byte-identical across two independent builds of the same fixed sourceRef");
}

group("16 — D4c hanging: hinge-jamb contact holds, never flat, angle bands honored");
{
  const sandbox = buildSandbox();
  sandbox.__forceBrokenVariantForTest("hanging");
  const floorTopMap = new Map([["0,0", -0.3]]);
  const hinge = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "d4c-hanging-1", extrudeDepth: 0.32 }, 0, 0, floorTopMap);
  const leaf = hinge.userData.leaf;
  ok(hinge.userData.brokenVariant === "hanging", "hinge.userData.brokenVariant reads 'hanging' when pinned");

  // D4b's own hinge-edge invariant (hingeIsAtARealEdge, group 10's helper) re-proved for hanging —
  // the geometry's local origin still sits at a real jamb edge (unchanged translate), so the
  // surviving hinge point stays in true jamb contact regardless of the extra rotation.
  const edge = hingeIsAtARealEdge(hinge);
  ok(edge.atRealEdge, `hanging: the leaf geometry's local origin STILL sits at a real jamb edge (${JSON.stringify(edge)}) — jamb contact holds`);
  ok(leaf.position.x !== 0 || sandbox.ITR_DOOR_WIDTH === 0, "hanging: leaf.position.x is the same nonzero jamb offset every swing state already uses (never re-anchored)");
  ok(leaf.position.y === 0, "hanging: no grounding-lift is applied — the surviving hinge point sits at the SAME floor-level y every swing state already uses (never lifted, never embedded)");

  ok(leaf.rotation.x === 0, "hanging: rotation.x stays 0 — never the flopped tip-forward axis");
  ok(leaf.rotation.y !== 0, "hanging: rotation.y (the partial swing) is non-zero");
  ok(leaf.rotation.z !== 0, "hanging: rotation.z (the droop) is non-zero — simultaneously with the swing, never flat");
  const swingDeg = leaf.rotation.y * 180 / Math.PI, droopDeg = leaf.rotation.z * 180 / Math.PI;
  ok(swingDeg >= sandbox.ITR_DOOR_HANGING_SWING_MIN_DEG - 1e-6 && swingDeg <= sandbox.ITR_DOOR_HANGING_SWING_MAX_DEG + 1e-6,
    `hanging swing sits in the documented ${sandbox.ITR_DOOR_HANGING_SWING_MIN_DEG}-${sandbox.ITR_DOOR_HANGING_SWING_MAX_DEG}deg band (got ${swingDeg.toFixed(2)}deg)`);
  ok(droopDeg >= sandbox.ITR_DOOR_HANGING_DROOP_MIN_DEG - 1e-6 && droopDeg <= sandbox.ITR_DOOR_HANGING_DROOP_MAX_DEG + 1e-6,
    `hanging droop sits in the documented ${sandbox.ITR_DOOR_HANGING_DROOP_MIN_DEG}-${sandbox.ITR_DOOR_HANGING_DROOP_MAX_DEG}deg band (got ${droopDeg.toFixed(2)}deg)`);
  ok(leaf.visible !== false, "hanging: the leaf stays visible (still the real geometry, just re-posed)");

  // NOT fully grounded flat: a flat-on-the-ground pose would need rotation near +/-90deg on an axis
  // that lays the whole leaf down — hanging's bands (15-30 / 18-28) stay far short of that, so the
  // leaf reads as still mostly upright, distinct from flopped.
  ok(swingDeg < 45 && droopDeg < 45, "hanging stays far short of a flat-on-the-ground rotation — visibly upright, distinct from flopped");

  // determinism + sourceRef spread, same law every other broken pick already follows.
  const hinge2 = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "d4c-hanging-1", extrudeDepth: 0.32 }, 0, 0, floorTopMap);
  ok(hinge2.userData.leaf.rotation.y === leaf.rotation.y && hinge2.userData.leaf.rotation.z === leaf.rotation.z, "hanging pose is deterministic per sourceRef (re-derived identically)");
  const hinge3 = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "d4c-hanging-OTHER", extrudeDepth: 0.32 }, 0, 0, floorTopMap);
  ok(hinge3.userData.leaf.rotation.y !== leaf.rotation.y || hinge3.userData.leaf.rotation.z !== leaf.rotation.z, "a different sourceRef gets different (seeded) hanging angles");
}

group("17 — D4c shattered: leaf hidden (never removed), 3-5 grounded seeded shards, in-bounds, deterministic");
{
  const sandbox = buildSandbox();
  sandbox.__forceBrokenVariantForTest("shattered");
  const floorTopMap = new Map([["0,0", -0.3]]);
  const hinge = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "d4c-shatter-1", extrudeDepth: 0.32 }, 0, 0, floorTopMap);
  ok(hinge.userData.brokenVariant === "shattered", "hinge.userData.brokenVariant reads 'shattered' when pinned");
  ok(hinge.userData.leaf != null && hinge.userData.leaf.material != null, "the leaf mesh STILL exists on userData.leaf (never removed) — the E0-1 fade-compliance pass and the tween channel both key off it existing");
  ok(hinge.userData.leaf.visible === false, "the leaf is HIDDEN (visible:false) — replaced by shards, not merely re-posed");

  const shards = hinge.userData.shards;
  ok(Array.isArray(shards) && shards.length >= 3 && shards.length <= 5, `shard count is in the documented 3-5 band (got ${shards && shards.length})`, shards && shards.length);

  const cellHalf = sandbox.ITR_DOOR_SHATTER_CELL / 2;
  const zMax = sandbox.ITR_DOOR_SHATTER_CELL * (1 + sandbox.ITR_DOOR_SHATTER_APRON_CELLS) - cellHalf;
  shards.forEach((m, i) => {
    ok(Math.abs(m.position.y - sandbox.ITR_DOOR_BROKEN_GROUND_CLEARANCE) < 1e-9, `shard ${i} is GROUNDED at the exact documented ground-clearance height (got ${m.position.y})`);
    ok(m.position.x >= -cellHalf - 1e-6 && m.position.x <= cellHalf + 1e-6, `shard ${i}'s x is within the door cell's own width (got ${m.position.x.toFixed(3)}, bound +/-${cellHalf})`);
    ok(m.position.z >= -cellHalf - 1e-6 && m.position.z <= zMax + 1e-6, `shard ${i}'s z is within the door cell UNION its 1-cell apron (got ${m.position.z.toFixed(3)}, bound [${(-cellHalf).toFixed(2)}, ${zMax.toFixed(2)}])`);
    ok(Math.abs(m.position.x) >= sandbox.ITR_DOOR_SHATTER_CLEAR_LANE - 1e-6, `shard ${i} stays OUT of the aperture's clear lane (got x=${m.position.x.toFixed(3)}, lane +/-${sandbox.ITR_DOOR_SHATTER_CLEAR_LANE}) — the aperture reads fully open, never cluttered`);
    ok(m.rotation.x === -Math.PI / 2, `shard ${i} is flattened (rotation.x=-PI/2) — lies flat, never standing`);
    ok(m.geometry && m.geometry.opts && m.geometry.opts.depth === sandbox.ITR_DOOR_SHATTER_THICKNESS, `shard ${i} extrudes at the documented thin thickness (never a slab)`);
  });

  // determinism across two independent builds of the SAME sourceRef — the WHOLE scatter (count,
  // every shard's x/z/yaw/size) is byte-identical; a different sourceRef differs.
  const hinge2 = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "d4c-shatter-1", extrudeDepth: 0.32 }, 0, 0, floorTopMap);
  const describeShards = (h) => h.userData.shards.map((m) => ({ x: m.position.x, z: m.position.z, yaw: m.rotation.z, geo: m.geometry.shape.pts }));
  ok(JSON.stringify(describeShards(hinge)) === JSON.stringify(describeShards(hinge2)), "the shard scatter is byte-identical across two independent builds of the same sourceRef");
  const hinge3 = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "d4c-shatter-OTHER", extrudeDepth: 0.32 }, 0, 0, floorTopMap);
  ok(JSON.stringify(describeShards(hinge)) !== JSON.stringify(describeShards(hinge3)), "a different sourceRef gets a different (seeded, not constant) shard scatter");
}

group("18 — D4c tween: rest+tween share one pose function; hanging's two-axis interpolation; shattered's fall-then-swap");
{
  // 18a — a live transition into HANGING interpolates BOTH rotation components simultaneously (the
  // {rotX,rotY,rotZ} triple this pose function now returns, vs D4b's single {axis,rad}).
  {
    const sandbox = buildSandbox();
    sandbox.__forceBrokenVariantForTest("hanging");
    const floorTopMap = new Map([["0,0", -0.3]]);
    const entryShut = [{ archetype: "door", x: 0, y: 0, state: "shut", sourceRef: "d4c-tw-hang", extrudeDepth: 0.32 }];
    sandbox.interiorBuildInteractables(entryShut, 0, 0, floorTopMap);
    const entryBroken = [{ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "d4c-tw-hang", extrudeDepth: 0.32 }];
    const g2 = sandbox.interiorBuildInteractables(entryBroken, 0, 0, floorTopMap);
    ok(sandbox.S.tweens.length === 1, `a real shut->broken transition fires exactly one tween (got ${sandbox.S.tweens.length})`);
    const tw = sandbox.S.tweens[0];
    const leaf = g2.children[0].userData.leaf;
    ok(leaf.rotation.x === 0 && leaf.rotation.y === 0 && leaf.rotation.z === 0, "tween start sits at the shut rest pose (all-zero) — never a teleport");
    tw.update(0.5);
    ok(leaf.rotation.y > 0 && leaf.rotation.z > 0, `mid-tween (t=0.5): BOTH hanging rotation components have moved off zero simultaneously (y=${leaf.rotation.y.toFixed(3)}, z=${leaf.rotation.z.toFixed(3)})`);
    ok(leaf.rotation.x === 0, "mid-tween: rotation.x stays untouched (hanging never uses the X axis)");
    tw.update(1); tw.onDone();
    const restPose = sandbox.itrDoorRestPose("broken", "d4c-tw-hang");
    ok(Math.abs(leaf.rotation.y - restPose.rotY) < 1e-9 && Math.abs(leaf.rotation.z - restPose.rotZ) < 1e-9, "onDone snaps exactly to the hanging rest pose itrDoorRestPose resolves for this sourceRef — rest and tween agree, the ONE shared pose function");
    ok(g2.children[0].userData.brokenVariant === "hanging", "onDone stamps the resolved variant onto userData");
  }

  // 18b — a live transition into SHATTERED: the fresh build (entry.state already "broken") mounts
  // the terminal shard scatter immediately, but interiorBuildInteractables must UNDO that so the
  // tween has a real leaf to animate falling, then REDO the identical scatter onDone.
  {
    const sandbox = buildSandbox();
    sandbox.__forceBrokenVariantForTest("shattered");
    const floorTopMap = new Map([["0,0", -0.3]]);
    const entryShut = [{ archetype: "door", x: 0, y: 0, state: "shut", sourceRef: "d4c-tw-shatter", extrudeDepth: 0.32 }];
    sandbox.interiorBuildInteractables(entryShut, 0, 0, floorTopMap);
    const entryBroken = [{ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "d4c-tw-shatter", extrudeDepth: 0.32 }];
    const g2 = sandbox.interiorBuildInteractables(entryBroken, 0, 0, floorTopMap);
    const hinge2 = g2.children[0];
    const leaf = hinge2.userData.leaf;
    ok(sandbox.S.tweens.length === 1, "a real shut->broken(shattered) transition fires exactly one tween");
    const tw = sandbox.S.tweens[0];
    ok(leaf.visible === true, "tween start: the fresh build's terminal shard-mount was UNDONE — the leaf is visible again, ready to animate the fall");
    ok(!hinge2.userData.shards, "tween start: the fresh build's terminal shards were removed from the hinge — none present mid-fall");
    tw.update(0.5);
    ok(Math.abs(leaf.rotation.x) > 0 && leaf.rotation.y === 0 && leaf.rotation.z === 0, `mid-tween: the leaf animates the SAME tip-forward fall flopped uses (rotation.x=${leaf.rotation.x.toFixed(3)}) while still visible`);
    ok(leaf.visible === true, "mid-tween: the leaf is still visible (falling), shards not yet swapped in");
    tw.update(1); tw.onDone();
    ok(leaf.visible === false, "onDone: the leaf is hidden again — the fall has completed and the shard swap fired");
    ok(Array.isArray(hinge2.userData.shards) && hinge2.userData.shards.length >= 3 && hinge2.userData.shards.length <= 5, "onDone: the shard scatter is (re-)mounted, count in the documented band");
    ok(hinge2.userData.brokenVariant === "shattered", "onDone stamps brokenVariant:'shattered'");

    // the ONDONE scatter is IDENTICAL to a freshly-rendered (non-tweened) shattered door of the
    // same sourceRef — a live break reads the same as a fresh render, per the spec's own tween note.
    const freshHinge = sandbox.interiorBuildInteractableDoorMesh({ archetype: "door", x: 0, y: 0, state: "broken", sourceRef: "d4c-tw-shatter", extrudeDepth: 0.32 }, 0, 0, floorTopMap);
    const describe = (shards) => shards.map((m) => ({ x: m.position.x, z: m.position.z, yaw: m.rotation.z }));
    ok(JSON.stringify(describe(hinge2.userData.shards)) === JSON.stringify(describe(freshHinge.userData.shards)),
      "the tween's onDone shard scatter is BYTE-IDENTICAL to a freshly-rendered shattered door of the same sourceRef (itrDoorShatterShards is a pure function of sourceRef)");
  }
}

group("19 — D4c contract untouched: registry state list unchanged, dm-contract regen is a no-op");
{
  const interactablesSrcNow = read("data/interactables.js");
  const statesMatch = interactablesSrcNow.match(/"door":\s*Object\.freeze\(\[[^\]]*\]\)/);
  ok(!!statesMatch, "INTERACTABLE_ARCHETYPE_STATES.door is present in data/interactables.js");
  ok(!!statesMatch && /shut/.test(statesMatch[0]) && /ajar/.test(statesMatch[0]) && /open/.test(statesMatch[0]) && /broken/.test(statesMatch[0]) && !/hanging|shattered|flopped/.test(statesMatch[0]),
    `door archetype states are STILL exactly shut/ajar/open/broken — no new state names leaked in (got ${statesMatch && statesMatch[0]})`);

  const beforeInteractables = read("data/interactables.js");
  const beforeContract = existsSync(join(ROOT, "dm-contract.json")) ? read("dm-contract.json") : null;
  let regenOk = true, regenOut = "";
  try { regenOut = execSync("python3 build/gen-dm-contract.py", { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] }).toString(); }
  catch (e) { regenOk = false; regenOut = String(e.stdout || e.message); }
  ok(regenOk, "python3 build/gen-dm-contract.py runs clean (exit 0)", regenOut.split("\n").slice(-5).join(" | "));
  const afterInteractables = read("data/interactables.js");
  const afterContract = existsSync(join(ROOT, "dm-contract.json")) ? read("dm-contract.json") : null;
  ok(beforeInteractables === afterInteractables, "data/interactables.js is BYTE-IDENTICAL before/after the regen (D4c never touched D1's registry)");
  ok(beforeContract === afterContract, "dm-contract.json is BYTE-IDENTICAL before/after the regen (a true no-op — D4c never touched D0's contract)");
}

console.log("\n=== 20. check-manifest.py ===");
{
  let out = "", code = 0;
  try { out = execSync("python3 build/check-manifest.py", { cwd: ROOT }).toString(); }
  catch (e) { code = 1; out = String(e.stdout || e.message); }
  ok(code === 0 && /RESULT: OK/.test(out), "check-manifest.py RESULT: OK", out.split("\n").slice(-3).join(" | "));
}

console.log(`\n=== TOTAL: ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
