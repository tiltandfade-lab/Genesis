/* C1B movement regression gate.
   Runs the production SpatialPlan compiler into the production TacticalQueryKernel with the same
   15x15 geometry, blocker, difficult shoulder, body cases, and canonical connection used by the
   Clayroom. No renderer and no demonstration geometry. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(ROOT, path), "utf8");
const context = { console };
vm.createContext(context);
vm.runInContext(
  read("src/engine/place-spatialize.js") + "\n;\n" +
  read("src/engine/tactical-query.js") + "\n;\n" +
  `this.__tq = {
    spatializePlan, tqCellId, tqSpaceFromSpatialPlan, tqStateFrom,
    tqConnectionAssessment, tqMovementRanges, tqMovementPreview,
    tqMovementCommit, tqConnectionStateCommit, tqReceiptProse
  };`,
  context
);
const api = context.__tq;

let pass = 0;
let fail = 0;
function check(name, condition, detail = ""){
  if(condition){
    pass++;
    console.log("  ✓", name);
  } else {
    fail++;
    console.log("  ✗", name, "—", detail);
  }
}

function fixture(){
  const seed = 0x6c0ffee;
  const plan = api.spatializePlan([
    {
      id: "clay-room", num: 1, depth: 0, exits: [{ targetId: "clay-beyond" }],
      dims: "75' x 75'", areaType: "Square Chamber"
    },
    {
      id: "clay-beyond", num: 2, depth: 1, exits: [{ targetId: "clay-room" }],
      dims: "75' x 75'", areaType: "Square Chamber"
    }
  ], "The Hub", { walkId: `clay-room:clay-c1a:${seed}:48` });
  const room = plan.rooms.find((row) => row.segNum === 1);
  const beyond = plan.rooms.find((row) => row.segNum === 2);
  const roomDoor = plan.doors.find((door) =>
    door.x >= room.x && door.x < room.x + room.w &&
    door.y >= room.y && door.y < room.y + room.d);
  const beyondDoor = plan.doors.find((door) =>
    door.x >= beyond.x && door.x < beyond.x + beyond.w &&
    door.y >= beyond.y && door.y < beyond.y + beyond.d);
  const local = (x, y) => api.tqCellId(room.x + x, room.y + y);
  const connection = {
    id: "connection-clay-north",
    version: 1,
    kind: "hinged-door",
    state: "shut",
    clearanceSize: "Medium",
    endpoints: [
      {
        sceneId: "clay-room",
        cellId: api.tqCellId(roomDoor.x, roomDoor.y),
        outwardCellId: api.tqCellId(roomDoor.x, roomDoor.y - 1)
      },
      {
        sceneId: "clay-beyond",
        cellId: api.tqCellId(beyondDoor.x, beyondDoor.y),
        outwardCellId: api.tqCellId(beyondDoor.x, beyondDoor.y + 1)
      }
    ],
    passageCellIds: [
      api.tqCellId(roomDoor.x, roomDoor.y),
      api.tqCellId(roomDoor.x, roomDoor.y - 1),
      api.tqCellId(roomDoor.x, roomDoor.y - 2),
      api.tqCellId(beyondDoor.x, beyondDoor.y)
    ],
    checkContracts: [{
      id: "check-clay-warped-frame",
      method: "force-warped-frame",
      skill: "athletics",
      ability: "str",
      dc: 15,
      difficulty: "ordinary consequential uncertainty",
      objective: "force the warped door and cross",
      stakes: "failure leaves the actor at the near threshold and costs time",
      licenses: ["position-change", "time-cost"]
    }],
    alternatives: ["use the ordinary working hinge", "choose a smaller body form", "use another route"]
  };
  const sceneIdBySegNum = { 1: "clay-room", 2: "clay-beyond" };
  const space = api.tqSpaceFromSpatialPlan(plan, {
    id: "space-clay-c1b",
    tier: "test",
    sceneIdBySegNum,
    blockedCells: [local(6, 7)],
    difficultCells: [local(5, 7)],
    connections: [connection]
  });
  const bodyForm = {
    version: 1, sizeCategory: "Small", occupiedCells: 1,
    worldHeight: 3.5, heightSource: "measured"
  };
  const state = api.tqStateFrom(space, {
    id: "state-clay-c1b",
    actors: [{
      id: "cit-goblin-c1a",
      sceneId: "clay-room",
      cellId: local(6, 10),
      speedFt: 30,
      bodyForm,
      checkModifiers: { athletics: 2 }
    }],
    connections: [{ id: connection.id, state: "shut" }]
  });
  return {
    plan, room, beyond, roomDoor, beyondDoor, connection, space, state, bodyForm, local,
    actorId: "cit-goblin-c1a",
    portalId: local(6, 0),
    eastId: local(7, 7),
    westId: local(5, 7)
  };
}

{
  const a = fixture();
  const b = fixture();
  check("1a. same production fixture yields byte-identical query space",
    JSON.stringify(a.space) === JSON.stringify(b.space));
  check("1b. query space and committed state are immutable",
    Object.isFrozen(a.space) && Object.isFrozen(a.space.cells) &&
    Object.isFrozen(a.state) && Object.isFrozen(a.state.actors));
  check("1c. real spatializer produced the founder-expanded 15x15 focus room",
    a.room.w === 15 && a.room.d === 15, JSON.stringify(a.room));
  check("1d. one canonical connection owns two real carved door endpoints",
    a.space.connections.length === 1 &&
    a.space.connections[0].endpoints[0].cellId === api.tqCellId(a.roomDoor.x, a.roomDoor.y) &&
    a.space.connections[0].endpoints[1].cellId === api.tqCellId(a.beyondDoor.x, a.beyondDoor.y),
    JSON.stringify(a.space.connections));
}

{
  const f = fixture();
  const ranges = api.tqMovementRanges(f.space, f.state, f.actorId);
  const move = new Set(ranges.moveCellIds);
  const dash = new Set(ranges.dashCellIds);
  check("2a. standard move and Dash extension both contain real cells",
    move.size > 0 && dash.size > 0, `${move.size}/${dash.size}`);
  check("2b. standard and Dash bands are disjoint",
    [...move].every((id) => !dash.has(id)));
  check("2c. north threshold is in the Dash extension, not the standard move band",
    dash.has(f.portalId) && !move.has(f.portalId), JSON.stringify(ranges));
  check("2d. a shut connection prevents range flood into the beyond room",
    !move.has(api.tqCellId(f.beyondDoor.x, f.beyondDoor.y)) &&
    !dash.has(api.tqCellId(f.beyondDoor.x, f.beyondDoor.y)));
  check("2e. every range answer names the exact state revision and origin cell",
    ranges.stateRevision === 0 && ranges.originCellId === f.state.actors[0].cellId);
}

{
  const f = fixture();
  const moveOnly = api.tqMovementPreview(f.space, f.state, {
    actorId: f.actorId,
    destinationCellId: f.portalId,
    pace: "move",
    viaCellId: f.eastId,
    routeLabel: "east of the crate"
  });
  check("3a. 30-ft preview refuses the 60-ft threshold and offers Dash",
    !moveOnly.ok && moveOnly.reason === "out-of-range" && moveOnly.alternatives.includes("use Dash"),
    JSON.stringify(moveOnly));

  const east = api.tqMovementPreview(f.space, f.state, {
    actorId: f.actorId,
    destinationCellId: f.portalId,
    pace: "dash",
    viaCellId: f.eastId,
    routeLabel: "east of the crate"
  });
  const west = api.tqMovementPreview(f.space, f.state, {
    actorId: f.actorId,
    destinationCellId: f.portalId,
    pace: "dash",
    viaCellId: f.westId,
    routeLabel: "west difficult shoulder"
  });
  check("3b. east route reaches the threshold at exactly the 60-ft Dash budget",
    east.ok && east.route.costFt === 60 && east.route.budgetFt === 60, JSON.stringify(east));
  check("3c. west route is materially different and difficult terrain pushes it out of range",
    !west.ok && west.reason === "out-of-range" && west.detail.costFt > 60, JSON.stringify(west));
  check("3d. preview is immutable and does not mutate state",
    Object.isFrozen(east) && f.state.revision === 0 && f.state.actors[0].cellId === f.local(6, 10));

  const committed = api.tqMovementCommit(f.space, f.state, east);
  check("3e. commit returns immutable exact receipt + revisioned next state",
    committed.ok && Object.isFrozen(committed.receipt) && Object.isFrozen(committed.state) &&
    committed.receipt.route.cells.join(">") === east.route.cells.join(">") &&
    committed.state.revision === 1 && committed.state.actors[0].cellId === f.portalId,
    JSON.stringify(committed));
  check("3f. ordinary movement does not change the canonical connection state",
    committed.state.connections[0].state === "shut");
  const stale = api.tqMovementCommit(f.space, committed.state, east);
  check("3g. the same preview cannot commit against a later revision",
    !stale.ok && stale.reason === "stale-preview", JSON.stringify(stale));
  check("3h. text twin carries the exact preview path and budget",
    api.tqReceiptProse(east).includes(east.route.cells.join(" → ")) &&
    api.tqReceiptProse(east).includes("60 ft of 60 ft"));
}

{
  const f = fixture();
  const connection = f.space.connections[0];
  const ordinary = api.tqConnectionAssessment(connection, f.bodyForm);
  const difficult = api.tqConnectionAssessment(connection, { ...f.bodyForm, sizeCategory: "Large" });
  const blocked = api.tqConnectionAssessment(connection, { ...f.bodyForm, sizeCategory: "Huge" });
  const uncertain = api.tqConnectionAssessment(connection, f.bodyForm, "force-warped-frame");
  check("4a. Small body through Medium clearance is ordinary", ordinary.kind === "ordinary");
  check("4b. one-size-too-large body uses explicit SRD difficult terrain",
    difficult.kind === "difficult" && difficult.rule.includes("SRD difficult terrain"), JSON.stringify(difficult));
  check("4c. a truly oversized body is blocked with lawful alternatives",
    blocked.kind === "blocked" && blocked.alternatives.length >= 2, JSON.stringify(blocked));
  check("4d. optional consequential method produces a CheckContract without revealing DC",
    uncertain.kind === "uncertain" && uncertain.checkContract.dcRevealed === false &&
    !JSON.stringify(uncertain).includes("\"dc\":"), JSON.stringify(uncertain));
}

{
  const f = fixture();
  const staged = api.tqMovementCommit(f.space, f.state, api.tqMovementPreview(f.space, f.state, {
    actorId: f.actorId,
    destinationCellId: f.portalId,
    pace: "dash",
    viaCellId: f.eastId
  }));
  const ordinaryCross = api.tqMovementPreview(f.space, staged.state, {
    actorId: f.actorId,
    connectionId: f.connection.id,
    pace: "move"
  });
  check("5a. portal preview crosses the one canonical connection through exact plan cells",
    ordinaryCross.ok && ordinaryCross.connection.id === f.connection.id &&
    ordinaryCross.to.cellId === api.tqCellId(f.beyondDoor.x, f.beyondDoor.y),
    JSON.stringify(ordinaryCross));
  const crossed = api.tqMovementCommit(f.space, staged.state, ordinaryCross);
  check("5b. portal commit moves to the shared far endpoint and opens canonical state",
    crossed.ok && crossed.receipt.connection.stateBefore === "shut" &&
    crossed.receipt.connection.stateAfter === "open" &&
    crossed.state.connections[0].state === "open" &&
    crossed.state.actors[0].sceneId === "clay-beyond",
    JSON.stringify(crossed));

  const checkPreview = api.tqMovementPreview(f.space, staged.state, {
    actorId: f.actorId,
    connectionId: f.connection.id,
    pace: "move",
    method: "force-warped-frame"
  });
  check("5c. uncertain preview states stakes but withholds exact DC",
    checkPreview.ok && checkPreview.checkContract &&
    checkPreview.checkContract.stakes.includes("costs time") &&
    !JSON.stringify(checkPreview).includes("\"dc\":"),
    JSON.stringify(checkPreview));
  const noPlayerDie = api.tqMovementCommit(f.space, staged.state, checkPreview);
  check("5d. commit refuses to roll for the player and reveals the DC at commit",
    !noPlayerDie.ok && noPlayerDie.reason === "player-d20-required" && noPlayerDie.dc === 15,
    JSON.stringify(noPlayerDie));
  const failed = api.tqMovementCommit(f.space, staged.state, checkPreview, { d20: 8 });
  check("5e. failed checked traversal uses only a licensed position-change consequence",
    failed.ok && failed.receipt.outcome === "check-failed" &&
    failed.receipt.check.dc === 15 && failed.receipt.check.total === 10 &&
    failed.receipt.consequences.length === 1 &&
    failed.receipt.consequences[0].family === "position-change" &&
    failed.receipt.consequences[0].license === true &&
    failed.state.actors[0].cellId === f.portalId &&
    failed.state.connections[0].state === "shut",
    JSON.stringify(failed));
  const passed = api.tqMovementCommit(f.space, staged.state, checkPreview, { d20: 20 });
  check("5f. successful checked traversal uses the same preview path and canonical connection",
    passed.ok && passed.receipt.outcome === "committed" &&
    passed.receipt.route.cells.join(">") === checkPreview.route.cells.join(">") &&
    passed.state.connections[0].state === "open",
    JSON.stringify(passed));
}

{
  const source = read("src/engine/tactical-query.js");
  check("6a. kernel contains no Math.random or Date.now",
    !/Math\.random|Date\.now/.test(source));
  check("6b. kernel contains no GS/U/DOM/THREE/network ownership",
    !/\bGS\b|\bU\b|document\.|window\.|THREE|fetch\s*\(|XMLHttpRequest|WebSocket/.test(source));
}

{
  const f = fixture();
  const opened = api.tqConnectionStateCommit(f.space, f.state, {
    connectionId: f.connection.id,
    state: "ajar"
  });
  check("7a. direct door controls commit through canonical connection state",
    opened.ok && opened.state.revision === 1 &&
    opened.state.connections[0].state === "ajar" &&
    opened.receipt.connection.stateBefore === "shut" &&
    opened.receipt.connection.stateAfter === "ajar",
    JSON.stringify(opened));
  check("7b. direct state receipt has a plain-text twin",
    api.tqReceiptProse(opened.receipt).includes("changed from shut to ajar"));
}

console.log(`\n${pass} passed, ${fail} failed`);
if(fail) process.exit(1);
