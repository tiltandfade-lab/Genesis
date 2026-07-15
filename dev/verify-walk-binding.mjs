/* Verify docs/STAGE-D-WAVE-SPECS.md D2 (Walk→coordinate binding) = BEAUTY-WAVE-5.md IA-2 verbatim.
   src/engine/walk-interactables.js is pure data code (no THREE/DOM/RNG-outside-its-own-seeded-
   streams — see its own header) that turns dungeon-walk.js's per-room object/feature/door rolls
   into plan.interactables=[{archetype,slug,state,extrudeDepth,name,flavor,x,y,roomSegNum,sourceRef,
   reserve?}], a NEW field sibling to place-dressing.js's plan.dressing[]. This harness loads
   place-spatialize.js + place-semantics.js + data/interactables.js + place-dressing.js +
   walk-interactables.js into ONE node `vm` context — same vm-load pattern dev/verify-dungeon-
   dressing.mjs already uses for GR2.

   RED-FIRST (this unit's own task brief): master tip a7946432 (pre-D2) has no
   src/engine/walk-interactables.js at all — `git show a7946432:src/engine/walk-interactables.js`
   must fail. Check 1 below is the harness-side proof of the same fact (typeof bindWalkInteractables
   would be undefined on that tip; re-checked against the actual pre-branch commit, not asserted from
   memory).

   Checks (this unit's own task brief):
     1. bindWalkInteractables exists; a fixture walk (object/feature/door rolls on every room) yields
        a source-referenced coordinate entry in plan.interactables[].
     2. the raw segment is byte-unchanged by the projection (deep JSON compare before/after).
     3. a reduced visual budget (opts.budgetPerRoom) changes ONLY the projection + reserve entries,
        never the segment or a same-input dressPlan-style digest.
     4. determinism: same (plan,walk,seed) rebuilds byte-identical; reserve entries carry sourceRefs.
     5. starting state: honors a rolled field (door state) when present, else the archetype resting
        default (object/feature entries, which roll no state of their own).
     6. door entries land on this room's own DOOR cell(s); wall-location archetypes (lever/shrine/
        portal) land wall-adjacent; floor-location archetypes never land in the room's own center 2x2.
     7. check-manifest clean (run separately by the caller; not re-invoked here to keep this harness
        pure-node/no-subprocess-dependent, matching verify-dungeon-dressing.mjs's own check-1..3/5
        no-Chrome-needed posture).

   Run: node dev/verify-walk-binding.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

function loadModules(walkInteractablesSrcOverride) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("data/interactables.js"),
    read("src/engine/place-dressing.js"),
    walkInteractablesSrcOverride || read("src/engine/walk-interactables.js"),
    "this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__bindWalkInteractables=typeof bindWalkInteractables!=='undefined'?bindWalkInteractables:undefined;",
    "this.__SPATIAL_CELL=typeof SPATIAL_CELL!=='undefined'?SPATIAL_CELL:undefined;",
    "this.__INTERACTABLE_ARCHETYPE_STATES=typeof INTERACTABLE_ARCHETYPE_STATES!=='undefined'?INTERACTABLE_ARCHETYPE_STATES:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "stage-d-d2-walk-binding.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    bindWalkInteractables: sandbox.__bindWalkInteractables,
    SPATIAL_CELL: sandbox.__SPATIAL_CELL,
    INTERACTABLE_ARCHETYPE_STATES: sandbox.__INTERACTABLE_ARCHETYPE_STATES,
  };
}

// a 4-room chain fixture carrying REAL dungeon-walk.js per-room shapes: exits[].door =
// {type:{name,desc},state:{name,desc}} (dwalkDoorRoll's own shape), object/feature =
// {name,flavor} (dungeon-walk.js's own segment shape). Deliberately covers: a chest (object-
// resolved), a lever+shrine (object+feature both resolved on the same room), a container+campfire,
// a trap+portal, and door states spanning shut/shut/open so check 5/6 have real variety to assert
// against — never invented archetypes, every name/flavor/door text is verbatim table-flavored prose
// (see Engine/03. _Tables/03. Session Mechanics/Dungeons/*.md for the real rolled vocabulary this
// mirrors).
function buildInteractableFixture() {
  return [
    {
      id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
      exits: [{ targetId: "s2", door: { type: { name: "Iron Door", desc: "riveted plates" }, state: { name: "Closed, Unlocked", desc: "opens freely" } } }],
      light: "normal",
      object: { name: "Wooden chest latch", flavor: "Latch spring is weak; opens too easily." },
      feature: { name: "Loose stone", flavor: "Wobbles under pressure." }, // no archetype match by design
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

let pass = 0, fail = 0;
function ok(cond, msg, detail) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg + (detail !== undefined ? " — " + detail : "")); } }
function group(name) { console.log("\n[" + name + "]"); }

console.log("=== RED-FIRST: pre-D2 master (a7946432) has no src/engine/walk-interactables.js ===");
{
  let redOut = null;
  try {
    redOut = execSync("git show a7946432:src/engine/walk-interactables.js", { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] }).toString();
  } catch (e) {
    redOut = "MISSING: " + e.message.split("\n")[0];
  }
  ok(/MISSING|fatal|does not exist|exists on disk, but not in/.test(redOut) || redOut === null,
    "RED-FIRST: a7946432 has no walk-interactables.js (git show fails)", redOut && redOut.slice(0, 160));
}

const M = loadModules();

group("1 — bindWalkInteractables exists; fixture walk yields a source-referenced coordinate");
{
  ok(typeof M.bindWalkInteractables === "function", "bindWalkInteractables is a function");
  const fixture = buildInteractableFixture();
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "d2-basic" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const walk = { segments: fixture };
  const bound = M.bindWalkInteractables(semPlan, walk, { realmId: "fantasy", walkId: "d2-basic" });
  ok(Array.isArray(bound.interactables) && bound.interactables.length > 0, "plan.interactables is a non-empty array");
  const placed = bound.interactables.filter((e) => !e.reserve);
  ok(placed.length > 0, "at least one entry is actually PLACED (not just reserved)");
  placed.forEach((e) => {
    ok(typeof e.sourceRef === "string" && e.sourceRef.length > 0, `entry ${e.archetype} carries a non-empty sourceRef`);
    ok(Number.isFinite(e.x) && Number.isFinite(e.y), `entry ${e.archetype} (${e.sourceRef}) carries a real (x,y) coordinate`, JSON.stringify(e));
  });
  // the archetype variety the fixture was built to exercise: chest/lever/shrine/container/campfire/trap/portal/door.
  const archetypesSeen = new Set(bound.interactables.map((e) => e.archetype));
  ["chest", "lever", "shrine", "container", "campfire", "trap", "portal", "door"].forEach((a) => {
    ok(archetypesSeen.has(a), `fixture resolves at least one "${a}" archetype entry`, JSON.stringify([...archetypesSeen]));
  });
  console.log(`  ✓ ${pass} passed so far`);
}

group("2 — the raw segment is byte-unchanged by the projection");
{
  const fixture = buildInteractableFixture();
  const before = JSON.stringify(fixture);
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "d2-immutable" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const walk = { segments: fixture };
  M.bindWalkInteractables(semPlan, walk, { realmId: "gloom", walkId: "d2-immutable" });
  const after = JSON.stringify(fixture);
  ok(before === after, "fixture segments array is byte-identical before/after bindWalkInteractables");
  // the plan itself is never mutated in place either (dressPlan/placeDistribute's own "shallow
  // clone, never mutate the input" law) — the SAME semPlan object's own .interactables must still
  // be undefined after the call (bindWalkInteractables returns a NEW object, doesn't stamp the input).
  ok(semPlan.interactables === undefined, "the input plan (semPlan) itself is never mutated — .interactables stays absent on it");
}

group("3 — a reduced visual budget changes ONLY the projection + reserve, never the segment");
{
  const fixture = buildInteractableFixture();
  const beforeFixture = JSON.stringify(fixture);
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "d2-budget" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const walk = { segments: fixture };
  const full = M.bindWalkInteractables(semPlan, walk, { realmId: "fantasy", walkId: "d2-budget" });
  const capped = M.bindWalkInteractables(semPlan, walk, { realmId: "fantasy", walkId: "d2-budget", budgetPerRoom: 1 });
  ok(JSON.stringify(fixture) === beforeFixture, "segment unchanged after a budget-capped run too");

  const fullPlaced = full.interactables.filter((e) => !e.reserve).length;
  const cappedPlaced = capped.interactables.filter((e) => !e.reserve).length;
  const cappedReserved = capped.interactables.filter((e) => e.reserve).length;
  ok(cappedPlaced < fullPlaced, `capped run places FEWER entries (${cappedPlaced}) than the default-budget run (${fullPlaced})`);
  ok(cappedReserved > 0, "capped run pushes the overflow into reserve:true entries");
  ok(full.interactables.every((e) => !e.reserve), "the DEFAULT (uncapped) run reserves nothing — 'default-empty screen budget'");

  // same sourceRef set either way — budget changes WHERE/whether an entry is placed, never WHICH
  // entries exist or their archetype/slug/state/name/flavor (the "digest" of resolved facts).
  const digestOf = (list) => list.map((e) => ({ sourceRef: e.sourceRef, archetype: e.archetype, slug: e.slug, state: e.state, name: e.name, flavor: e.flavor, roomSegNum: e.roomSegNum })).sort((a, b) => a.sourceRef.localeCompare(b.sourceRef));
  ok(JSON.stringify(digestOf(full.interactables)) === JSON.stringify(digestOf(capped.interactables)),
    "the resolved-fact digest (sourceRef/archetype/slug/state/name/flavor) is IDENTICAL regardless of budget — only x/y/reserve differ");
}

group("4 — determinism: same (plan,walk,seed) rebuilds byte-identical; reserve entries carry sourceRefs");
{
  const fixture = buildInteractableFixture();
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "d2-determinism" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const walk = { segments: fixture };
  const a = M.bindWalkInteractables(semPlan, walk, { realmId: "chrome", walkId: "d2-determinism", budgetPerRoom: 1 });
  const b = M.bindWalkInteractables(semPlan, walk, { realmId: "chrome", walkId: "d2-determinism", budgetPerRoom: 1 });
  ok(JSON.stringify(a.interactables) === JSON.stringify(b.interactables), "two calls with the identical (plan,walk,opts) yield a byte-identical interactables array");

  const c = M.bindWalkInteractables(semPlan, walk, { realmId: "chrome", walkId: "d2-determinism-DIFFERENT", budgetPerRoom: 1 });
  ok(JSON.stringify(a.interactables) !== JSON.stringify(c.interactables), "a different walkId yields a DIFFERENT array (not a constant-function false positive)");

  const reserved = a.interactables.filter((e) => e.reserve);
  ok(reserved.length > 0, "budgetPerRoom:1 produces at least one reserve entry across a 4-room, multi-candidate fixture");
  reserved.forEach((e) => {
    ok(typeof e.sourceRef === "string" && e.sourceRef.length > 0, `reserve entry ${e.archetype} carries a non-empty sourceRef`);
    ok(e.x === null && e.y === null, `reserve entry ${e.archetype} (${e.sourceRef}) carries no fabricated coordinate (x:null,y:null)`);
  });
}

group("5 — starting state: rolled field (door) honored; object/feature default to the resting state");
{
  const fixture = buildInteractableFixture();
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "d2-state" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const walk = { segments: fixture };
  const bound = M.bindWalkInteractables(semPlan, walk, { realmId: "fantasy", walkId: "d2-state" });

  const doorS1 = bound.interactables.find((e) => e.sourceRef === "S1.door");
  ok(!!doorS1, "S1.door entry exists");
  ok(doorS1 && doorS1.state === "shut", `S1's "Closed, Unlocked" door roll resolves state "shut" (got "${doorS1 && doorS1.state}")`);

  const doorS3 = bound.interactables.find((e) => e.sourceRef === "S3.door");
  ok(!!doorS3, "S3.door entry exists");
  ok(doorS3 && doorS3.state === "open", `S3's "Open / Standing Ajar" door roll resolves state "open" (got "${doorS3 && doorS3.state}")`);

  const chest = bound.interactables.find((e) => e.sourceRef === "S1.object");
  ok(!!chest && chest.archetype === "chest", "S1.object resolves the chest archetype");
  const chestStates = M.INTERACTABLE_ARCHETYPE_STATES.chest;
  ok(chest && chest.state === chestStates[0], `chest (no rolled state) resolves the archetype's resting default "${chestStates[0]}" (got "${chest && chest.state}")`);

  const shrine = bound.interactables.find((e) => e.sourceRef === "S2.feature");
  ok(!!shrine && shrine.archetype === "shrine", "S2.feature resolves the shrine archetype");
  const shrineStates = M.INTERACTABLE_ARCHETYPE_STATES.shrine;
  ok(shrine && shrine.state === shrineStates[0], `shrine (no rolled state) resolves the archetype's resting default "${shrineStates[0]}" (got "${shrine && shrine.state}")`);
}

group("6 — placement grammar: doors on DOOR cells; wall archetypes wall-adjacent; floor archetypes off center 2x2");
{
  const fixture = buildInteractableFixture();
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "d2-placement" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const walk = { segments: fixture };
  const bound = M.bindWalkInteractables(semPlan, walk, { realmId: "gloom", walkId: "d2-placement" });
  const roomBySeg = {};
  bound.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });

  const placed = bound.interactables.filter((e) => !e.reserve);
  ok(placed.length > 0, "sanity: at least one placed entry to check");

  placed.forEach((e) => {
    const cellCode = bound.cells[e.y * bound.cellW + e.x];
    if (e.archetype === "door") {
      ok(cellCode === M.SPATIAL_CELL.DOOR, `door "${e.sourceRef}" @ (${e.x},${e.y}) sits on a DOOR cell (code ${cellCode})`);
      const belongsToRoom = bound.doors.some((d) => d.x === e.x && d.y === e.y && Array.isArray(d.betweenSegs) && d.betweenSegs.indexOf(e.roomSegNum) >= 0);
      ok(belongsToRoom, `door "${e.sourceRef}" lands on one of room ${e.roomSegNum}'s OWN door cells (plan.doors betweenSegs match)`);
    } else if (["lever", "shrine", "portal"].indexOf(e.archetype) >= 0) {
      const nearWall = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const nx = e.x + dx, ny = e.y + dy;
        if (nx < 0 || ny < 0 || nx >= bound.cellW || ny >= bound.cellD) return false;
        return bound.cells[ny * bound.cellW + nx] === M.SPATIAL_CELL.WALL;
      });
      ok(nearWall, `${e.archetype} "${e.sourceRef}" @ (${e.x},${e.y}) is within 1 cell of a WALL (wall-location archetype)`);
    } else {
      ok(cellCode === M.SPATIAL_CELL.FLOOR, `${e.archetype} "${e.sourceRef}" @ (${e.x},${e.y}) sits on a FLOOR cell (code ${cellCode})`);
      const r = roomBySeg[e.roomSegNum];
      if (r) {
        const cx0 = r.x + Math.max(0, Math.floor((r.w - 2) / 2));
        const cy0 = r.y + Math.max(0, Math.floor((r.d - 2) / 2));
        const inCenter = e.x >= cx0 && e.x < cx0 + 2 && e.y >= cy0 && e.y < cy0 + 2;
        ok(!inCenter, `${e.archetype} "${e.sourceRef}" @ (${e.x},${e.y}) is NOT inside room ${r.segNum}'s center 2x2 (${cx0},${cy0})`);
      }
    }
  });
}

group("7 — no registry / absent-global degrade: never throws, empty projection instead of invented art");
{
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  // deliberately OMIT data/interactables.js — the typeof-guard must degrade cleanly (no crash, no
  // invented slug/extrudeDepth), same discipline dm.js's dmArchetypeStates (D0) already keeps.
  vm.runInContext([
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("src/engine/place-dressing.js"),
    read("src/engine/walk-interactables.js"),
    "this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__bindWalkInteractables=typeof bindWalkInteractables!=='undefined'?bindWalkInteractables:undefined;",
  ].join("\n"), sandbox, { filename: "stage-d-d2-no-registry.js" });
  const fixture = buildInteractableFixture();
  const plan = sandbox.__spatializePlan(fixture, "The Spine", { walkId: "d2-no-registry" });
  const semPlan = sandbox.__semanticizePlan(plan, fixture, []);
  let threw = null, bound = null;
  try {
    bound = sandbox.__bindWalkInteractables(semPlan, { segments: fixture }, { realmId: "fantasy", walkId: "d2-no-registry" });
  } catch (e) { threw = e; }
  ok(!threw, "bindWalkInteractables never throws when INTERACTABLES_REGISTRY/INTERACTABLE_ARCHETYPE_STATES are absent", threw && threw.message);
  ok(bound && Array.isArray(bound.interactables) && bound.interactables.length > 0, "still produces entries (degraded, not empty) with the registry absent");
  const anyPlaced = bound && bound.interactables.find((e) => !e.reserve);
  ok(anyPlaced && anyPlaced.slug === null && anyPlaced.extrudeDepth === null, "a placed entry degrades to slug:null/extrudeDepth:null rather than inventing art", JSON.stringify(anyPlaced));
}

group("8 — QF-A3 BACKFILL (docs/ENV-EXTERIOR-WAVE.md ENV-2 rider): a multi-room interior board's own");
console.log("    interactables/dressing are filtered to the active-room keepSet (fix landed 749e8dd1,");
console.log("    trayFrom's own qfA3FilterToKeptRooms — src/engine/theater-data.js). This harness never");
console.log("    exercised trayFrom's {kind:\"interior\"} branch at all before this backfill — checks 1-7");
console.log("    above stop at bindWalkInteractables' own plan.interactables[], one layer short of the");
console.log("    render seam QF-A3 actually fixed (PLAY-LENS ledger P0 #3, pl-011/pl-016 — a door/prop");
console.log("    belonging to an off-screen room rendering scattered/unanchored in the room actually on");
console.log("    stage). RED-FIRST proof (below): stub qfA3FilterToKeptRooms's TWO call sites back to");
console.log("    the pre-fix unfiltered assignment in a COPY of the real source text, confirm an entry");
console.log("    from a room NOT in view leaks onto the board, then confirm the real (unmutated) source");
console.log("    keeps it out.");
{
  // the SAME minimal module set dev/verify-place-distribution.mjs's own check 8 already proved
  // sufficient to drive a real trayFrom({kind:"interior"}) call, plus walk-interactables.js + data/
  // interactables.js (this file's own group-1..7 dependency) so plan.interactables is real, not empty.
  function loadInteriorModules(theaterDataSrcOverride) {
    const sandbox = { console };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    const combined = [
      read("src/engine/place-spatialize.js"),
      read("src/engine/place-semantics.js"),
      read("data/interactables.js"),
      read("src/engine/place-dressing.js"),
      read("src/engine/walk-interactables.js"),
      read("src/ui/theater-interior.js"),
      theaterDataSrcOverride || read("src/engine/theater-data.js"),
      "this.__trayFrom=typeof trayFrom!=='undefined'?trayFrom:undefined;",
      "this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
      "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
      "this.__dressPlan=typeof dressPlan!=='undefined'?dressPlan:undefined;",
    ].join("\n");
    vm.runInContext(combined, sandbox, { filename: "qf-a3-backfill.js" });
    return { trayFrom: sandbox.__trayFrom, spatializePlan: sandbox.__spatializePlan, semanticizePlan: sandbox.__semanticizePlan, dressPlan: sandbox.__dressPlan };
  }

  // buildInteractableFixture()'s own 4-room chain (s1-s2-s3-s4, each carrying a real object+feature
  // roll — see its own header above) is exactly the "multi-room interior board" QF-A3's own comment
  // names; reused verbatim rather than a new fixture.
  const fixture = buildInteractableFixture();
  const M8 = loadInteriorModules();
  ok(typeof M8.trayFrom === "function", "8a-setup. trayFrom is loadable alongside the interior chain");
  const plan = M8.spatializePlan(fixture, "The Backfill Spine", { walkId: "qf-a3-backfill" });
  const semPlan = M8.semanticizePlan(plan, fixture, []);
  ok(Array.isArray(semPlan.rooms) && semPlan.rooms.length >= 3, "8b-setup. the fixture plan actually has 3+ rooms (a real multi-room board, not vacuous)", semPlan.rooms && semPlan.rooms.length);
  // focus on room s2 (the middle room, connected on both sides — most likely to catch a leak from
  // either neighbor): whole-plan-if-absent, so pick its own segNum explicitly.
  const s2 = semPlan.rooms.find((r) => r.segNum === 2) || semPlan.rooms[1];
  const focusSegNum = s2.segNum;

  const boardReal = M8.trayFrom({ kind: "interior", plan: semPlan, walk: { segments: fixture }, focusSegNum, radius: 1, env: "dungeon", realms: [] }, null, {});
  ok(!!boardReal && Array.isArray(boardReal.dressing), "8c-setup. the real board carries a dressing array");
  ok(!!boardReal && Array.isArray(boardReal.interactables), "8d-setup. the real board carries an interactables array");

  const dressingRoomsSeen = new Set((boardReal.dressing || []).map((d) => d.roomSegNum).filter((n) => n != null));
  const interactableRoomsSeen = new Set((boardReal.interactables || []).map((e) => e.roomSegNum).filter((n) => n != null));
  ok(dressingRoomsSeen.size <= 1 && (dressingRoomsSeen.size === 0 || dressingRoomsSeen.has(focusSegNum)),
    "8e. the REAL (unmutated) board's dressing carries ONLY the focus room's own entries — no off-screen-room leak",
    JSON.stringify([...dressingRoomsSeen]));
  ok(interactableRoomsSeen.size <= 1 && (interactableRoomsSeen.size === 0 || interactableRoomsSeen.has(focusSegNum)),
    "8f. the REAL (unmutated) board's interactables carry ONLY the focus room's own entries — no off-screen-room leak",
    JSON.stringify([...interactableRoomsSeen]));

  // sanity: the UNFILTERED plan actually spans multiple rooms (else 8e/8f above would be vacuously
  // true just because the fixture never had more than one room's worth of entries to begin with).
  const directDressed = M8.dressPlan(semPlan, { realmId: "fantasy", walkId: "qf-a3-backfill" });
  const unfilteredDressingRooms = new Set((directDressed.dressing || []).map((d) => d.roomSegNum).filter((n) => n != null));
  ok(unfilteredDressingRooms.size >= 2, "8g-setup. sanity: the fixture's OWN unfiltered dressing spans 2+ rooms (the check isn't vacuous)", JSON.stringify([...unfilteredDressingRooms]));

  // ⊗ RED-FIRST: stub BOTH qfA3FilterToKeptRooms call sites (a source-text rewrite of a COPY, never
  // the committed file) back to the pre-QF-A3 unfiltered assignment, and prove the leak reappears.
  const realSrc = read("src/engine/theater-data.js");
  const mutatedSrc = realSrc
    .replace("board.dressing = qfA3FilterToKeptRooms(dressedPlan.dressing || []);", "board.dressing = dressedPlan.dressing || [];")
    .replace("board.interactables = qfA3FilterToKeptRooms(dressedPlan.interactables || []);", "board.interactables = dressedPlan.interactables || [];");
  ok(mutatedSrc !== realSrc, "8h-setup. the stub rewrite actually matched + changed the real source text (regex/string hit real code, not vacuous)");
  const M8red = loadInteriorModules(mutatedSrc);
  const boardMutated = M8red.trayFrom({ kind: "interior", plan: semPlan, walk: { segments: fixture }, focusSegNum, radius: 1, env: "dungeon", realms: [] }, null, {});
  const mutatedDressingRooms = new Set((boardMutated.dressing || []).map((d) => d.roomSegNum).filter((n) => n != null));
  const mutatedInteractableRooms = new Set((boardMutated.interactables || []).map((e) => e.roomSegNum).filter((n) => n != null));
  ok(mutatedDressingRooms.size >= 2, "8i. RED-CONFIRMED: with the room filter stubbed out, board.dressing leaks OTHER rooms' entries (the gate is load-bearing)", JSON.stringify([...mutatedDressingRooms]));
  ok(mutatedInteractableRooms.size >= 2, "8j. RED-CONFIRMED: with the room filter stubbed out, board.interactables leaks OTHER rooms' entries (the gate is load-bearing)", JSON.stringify([...mutatedInteractableRooms]));

  // restore proof: re-loading the REAL (unmutated) source one more time from disk (not the earlier
  // in-memory M8) still filters correctly — the fix lives in the committed file, not a fluke of this
  // harness's own first sandbox instance.
  const M8restored = loadInteriorModules(read("src/engine/theater-data.js"));
  const boardRestored = M8restored.trayFrom({ kind: "interior", plan: semPlan, walk: { segments: fixture }, focusSegNum, radius: 1, env: "dungeon", realms: [] }, null, {});
  const restoredDressingRooms = new Set((boardRestored.dressing || []).map((d) => d.roomSegNum).filter((n) => n != null));
  ok(restoredDressingRooms.size <= 1, "8k. RESTORE-GREEN: reloading the real committed source from disk filters correctly again", JSON.stringify([...restoredDressingRooms]));
}

console.log(`\n=== TOTAL: ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
