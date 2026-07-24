/* GENESIS MODULE — src/engine/tactical-query.js
   C1B MOVEMENT TRUTH (docs/procedural-dungeon-direction/CLAY-PROOF-LADDER.md).

   One pure deterministic owner for exact-cell movement queries, range bands, route previews,
   body-aware connection assessment, and immutable preview/commit receipts. Consumers provide a
   committed SpatialPlan plus explicit actor/connection state; this module never reads mutable
   application state, never
   rolls, never renders, and never mutates its inputs. The renderer may project these answers but
   may not recompute them.

   Supported in C1B: land movement through orthogonal 5-ft cells and simple horizontal passages.
   Unsupported movement modes fail honestly. A caller must supply a d20 when a committed traversal
   invokes a CheckContract; the engine never rolls on the player's behalf.
*/

var TQ_VERSION = 1;
var TQ_SIZE_RANK = Object.freeze({
  Tiny: 0, Small: 1, Medium: 2, Large: 3, Huge: 4, Gargantuan: 5
});

function tqDeepFreeze(value){
  if(!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.keys(value).forEach(function(key){ tqDeepFreeze(value[key]); });
  return Object.freeze(value);
}

function tqHashString(value){
  var h = 2166136261 >>> 0;
  var s = String(value);
  for(var i = 0; i < s.length; i++){
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return ("00000000" + h.toString(16)).slice(-8);
}

function tqCellId(x, y){
  return "p-" + Number(x) + "-" + Number(y);
}

function tqCellCoord(cellId){
  var match = String(cellId || "").match(/^p-(-?\d+)-(-?\d+)$/);
  return match ? { x: Number(match[1]), y: Number(match[2]) } : null;
}

function tqSpatialCellName(code){
  if(typeof SPATIAL_CELL === "undefined") return "unknown";
  if(code === SPATIAL_CELL.FLOOR) return "floor";
  if(code === SPATIAL_CELL.DOOR) return "door";
  if(code === SPATIAL_CELL.WATER) return "water";
  if(code === SPATIAL_CELL.WALL) return "wall";
  return "void";
}

function tqSceneForCell(plan, x, y, sceneIdBySegNum){
  var answer = null;
  (plan.rooms || []).forEach(function(room){
    if(answer || !room) return;
    var owns = Array.isArray(room.cells)
      ? room.cells.some(function(c){ return c.x === x && c.y === y; })
      : x >= room.x && x < room.x + room.w && y >= room.y && y < room.y + room.d;
    if(owns){
      answer = (sceneIdBySegNum && sceneIdBySegNum[room.segNum]) || ("segment-" + room.segNum);
    }
  });
  return answer;
}

function tqNormalizeConnection(raw){
  var endpoints = (raw.endpoints || []).map(function(endpoint){
    return {
      sceneId: String(endpoint.sceneId),
      cellId: String(endpoint.cellId),
      outwardCellId: endpoint.outwardCellId == null ? null : String(endpoint.outwardCellId)
    };
  });
  var contracts = (raw.checkContracts || []).map(function(contract){
    return {
      id: String(contract.id),
      method: String(contract.method),
      skill: String(contract.skill || "athletics"),
      ability: String(contract.ability || "str"),
      dc: Number(contract.dc),
      difficulty: String(contract.difficulty || "ordinary consequential uncertainty"),
      objective: String(contract.objective || "use the passage"),
      stakes: String(contract.stakes || "the passage remains unused"),
      licenses: (contract.licenses || []).map(String)
    };
  });
  return {
    id: String(raw.id),
    version: Number(raw.version || 1),
    kind: String(raw.kind || "passage"),
    state: String(raw.state || "shut"),
    clearanceSize: String(raw.clearanceSize || "Medium"),
    endpoints: endpoints,
    passageCellIds: (raw.passageCellIds || []).map(String),
    checkContracts: contracts,
    alternatives: (raw.alternatives || [
      "choose a smaller body form",
      "use another route",
      "change the passage state lawfully"
    ]).map(String)
  };
}

/* tqSpaceFromSpatialPlan(plan, opts) -> immutable query space.
   Every traversable cell is read from the real SpatialPlan. opts may annotate production facts
   (occupied blockers, difficult terrain, canonical connections) but may not invent geometry. */
function tqSpaceFromSpatialPlan(plan, opts){
  opts = opts || {};
  if(!plan || !plan.cells || !Number.isInteger(plan.cellW) || !Number.isInteger(plan.cellD)){
    throw new Error("tqSpaceFromSpatialPlan: committed SpatialPlan required");
  }
  var blocked = {};
  (opts.blockedCells || []).forEach(function(id){ blocked[String(id)] = true; });
  var difficult = {};
  (opts.difficultCells || []).forEach(function(id){ difficult[String(id)] = true; });
  var cells = [];
  for(var y = 0; y < plan.cellD; y++){
    for(var x = 0; x < plan.cellW; x++){
      var code = plan.cells[y * plan.cellW + x];
      var kind = tqSpatialCellName(code);
      if(kind === "void" || kind === "wall" || kind === "unknown") continue;
      var id = tqCellId(x, y);
      var isDifficult = kind === "water" || !!difficult[id];
      cells.push({
        id: id,
        x: x,
        y: y,
        kind: kind,
        sceneId: tqSceneForCell(plan, x, y, opts.sceneIdBySegNum || null),
        tier: plan.tiers ? Number(plan.tiers[y * plan.cellW + x] || 0) : 0,
        blocked: !!blocked[id],
        difficult: isDifficult,
        enterCostFt: isDifficult ? 10 : 5
      });
    }
  }
  var space = {
    id: String(opts.id || ("tactical-space-" + (plan.seed == null ? "unseeded" : plan.seed))),
    version: TQ_VERSION,
    tier: String(opts.tier || "test"),
    planSeed: plan.seed == null ? null : plan.seed,
    cellW: plan.cellW,
    cellD: plan.cellD,
    cells: cells,
    connections: (opts.connections || []).map(tqNormalizeConnection)
  };
  return tqDeepFreeze(space);
}

function tqStateFrom(space, spec){
  spec = spec || {};
  if(!space || !Array.isArray(space.cells)) throw new Error("tqStateFrom: query space required");
  var cellIds = {};
  space.cells.forEach(function(cell){ cellIds[cell.id] = true; });
  var actors = (spec.actors || []).map(function(actor){
    if(!cellIds[actor.cellId]) throw new Error("tqStateFrom: actor '" + actor.id + "' has unknown cell " + actor.cellId);
    var body = actor.bodyForm || {};
    if(TQ_SIZE_RANK[body.sizeCategory] == null){
      throw new Error("tqStateFrom: actor '" + actor.id + "' has unsupported BodyForm size " + body.sizeCategory);
    }
    if(Number(body.occupiedCells || 1) !== 1){
      throw new Error("tqStateFrom: C1B supports occupiedCells === 1 only");
    }
    return {
      id: String(actor.id),
      sceneId: String(actor.sceneId),
      cellId: String(actor.cellId),
      speedFt: Number(actor.speedFt || 30),
      bodyForm: {
        version: Number(body.version || 1),
        sizeCategory: String(body.sizeCategory),
        occupiedCells: 1,
        worldHeight: Number(body.worldHeight),
        heightSource: String(body.heightSource || "unknown")
      },
      checkModifiers: Object.assign({}, actor.checkModifiers || {})
    };
  });
  var stateById = {};
  (spec.connections || []).forEach(function(connection){ stateById[String(connection.id)] = String(connection.state); });
  var connections = space.connections.map(function(connection){
    return {
      id: connection.id,
      version: connection.version,
      state: stateById[connection.id] || connection.state
    };
  });
  return tqDeepFreeze({
    id: String(spec.id || (space.id + "-state")),
    version: TQ_VERSION,
    tier: String(spec.tier || space.tier || "test"),
    revision: Number(spec.revision || 0),
    actors: actors,
    connections: connections,
    history: (spec.history || []).map(String)
  });
}

function tqFindActor(state, actorId){
  return (state.actors || []).find(function(actor){ return actor.id === String(actorId); }) || null;
}

function tqFindConnection(space, connectionId){
  return (space.connections || []).find(function(connection){ return connection.id === String(connectionId); }) || null;
}

function tqConnectionState(state, connection){
  var row = (state.connections || []).find(function(candidate){ return candidate.id === connection.id; });
  return row ? row.state : connection.state;
}

function tqCellMaps(space){
  var byId = {}, byCoord = {};
  space.cells.forEach(function(cell){
    byId[cell.id] = cell;
    byCoord[cell.x + "," + cell.y] = cell;
  });
  return { byId: byId, byCoord: byCoord };
}

function tqBlockedThreshold(space, state, fromId, toId, allowConnectionId){
  return space.connections.some(function(connection){
    if(connection.id === allowConnectionId || tqConnectionState(state, connection) === "open") return false;
    return connection.endpoints.some(function(endpoint){
      if(!endpoint.outwardCellId) return false;
      return (fromId === endpoint.cellId && toId === endpoint.outwardCellId)
        || (toId === endpoint.cellId && fromId === endpoint.outwardCellId);
    });
  });
}

function tqNeighborRows(space, state, cell, maps, allowConnectionId, bodyAssessment){
  var rows = [];
  [[0,-1],[-1,0],[1,0],[0,1]].forEach(function(delta){
    var next = maps.byCoord[(cell.x + delta[0]) + "," + (cell.y + delta[1])];
    if(!next || next.blocked || tqBlockedThreshold(space, state, cell.id, next.id, allowConnectionId)) return;
    var cost = next.enterCostFt;
    if(bodyAssessment && bodyAssessment.kind === "difficult"
      && bodyAssessment.connection
      && bodyAssessment.connection.passageCellIds.indexOf(next.id) >= 0){
      cost *= 2;
    }
    rows.push({ cell: next, costFt: cost });
  });
  rows.sort(function(a, b){ return a.cell.id.localeCompare(b.cell.id); });
  return rows;
}

function tqRoute(space, state, startId, targetId, opts){
  opts = opts || {};
  var maps = tqCellMaps(space);
  if(!maps.byId[startId] || !maps.byId[targetId]){
    return { ok: false, reason: "unknown-cell" };
  }
  if(maps.byId[targetId].blocked) return { ok: false, reason: "occupied-destination" };
  var dist = {}, previous = {}, open = [{ id: startId, cost: 0 }];
  dist[startId] = 0;
  while(open.length){
    open.sort(function(a, b){ return a.cost - b.cost || a.id.localeCompare(b.id); });
    var current = open.shift();
    if(current.cost !== dist[current.id]) continue;
    if(current.id === targetId) break;
    tqNeighborRows(space, state, maps.byId[current.id], maps, opts.allowConnectionId || null, opts.bodyAssessment || null)
      .forEach(function(row){
        var nextCost = current.cost + row.costFt;
        var oldCost = dist[row.cell.id];
        var shouldReplace = oldCost == null || nextCost < oldCost
          || (nextCost === oldCost && current.id < String(previous[row.cell.id] || "\uffff"));
        if(!shouldReplace) return;
        dist[row.cell.id] = nextCost;
        previous[row.cell.id] = current.id;
        open.push({ id: row.cell.id, cost: nextCost });
      });
  }
  if(dist[targetId] == null) return { ok: false, reason: "no-route" };
  var cells = [targetId], cursor = targetId;
  while(cursor !== startId){
    cursor = previous[cursor];
    if(cursor == null) return { ok: false, reason: "route-reconstruction-failed" };
    cells.push(cursor);
  }
  cells.reverse();
  return { ok: true, cells: cells, costFt: dist[targetId], steps: Math.max(0, cells.length - 1) };
}

function tqViaRoute(space, state, startId, targetId, viaCellId, opts){
  if(!viaCellId) return tqRoute(space, state, startId, targetId, opts);
  var first = tqRoute(space, state, startId, viaCellId, opts);
  if(!first.ok) return first;
  var second = tqRoute(space, state, viaCellId, targetId, opts);
  if(!second.ok) return second;
  return {
    ok: true,
    cells: first.cells.concat(second.cells.slice(1)),
    costFt: first.costFt + second.costFt,
    steps: first.steps + second.steps
  };
}

function tqConnectionAssessment(connection, bodyForm, method){
  if(!connection) return tqDeepFreeze({ kind: "blocked", reason: "unknown-connection", alternatives: [] });
  var connectionView = {
    id: connection.id,
    version: connection.version,
    kind: connection.kind,
    clearanceSize: connection.clearanceSize,
    passageCellIds: connection.passageCellIds
  };
  var contract = (connection.checkContracts || []).find(function(row){ return row.method === String(method || ""); });
  if(contract){
    return tqDeepFreeze({
      kind: "uncertain",
      reason: "consequential-uncertainty",
      connection: connectionView,
      checkContract: {
        id: contract.id,
        method: contract.method,
        skill: contract.skill,
        ability: contract.ability,
        difficulty: contract.difficulty,
        objective: contract.objective,
        stakes: contract.stakes,
        licenses: contract.licenses,
        dcRevealed: false
      }
    });
  }
  var bodyRank = TQ_SIZE_RANK[bodyForm && bodyForm.sizeCategory];
  var clearanceRank = TQ_SIZE_RANK[connection.clearanceSize];
  if(bodyRank == null || clearanceRank == null){
    return tqDeepFreeze({ kind: "blocked", reason: "unsupported-body-or-clearance", alternatives: connection.alternatives });
  }
  if(bodyRank > clearanceRank + 1){
    return tqDeepFreeze({ kind: "blocked", reason: "body-does-not-fit", alternatives: connection.alternatives });
  }
  if(bodyRank === clearanceRank + 1){
    return tqDeepFreeze({
      kind: "difficult",
      reason: "space-one-size-smaller",
      rule: "SRD difficult terrain through a space one size smaller",
      connection: connectionView
    });
  }
  return tqDeepFreeze({ kind: "ordinary", reason: "body-fits", connection: connectionView });
}

function tqMovementRanges(space, state, actorId){
  var actor = tqFindActor(state, actorId);
  if(!actor) throw new Error("tqMovementRanges: unknown actor " + actorId);
  var maps = tqCellMaps(space);
  var dist = {}, open = [{ id: actor.cellId, cost: 0 }];
  dist[actor.cellId] = 0;
  while(open.length){
    open.sort(function(a, b){ return a.cost - b.cost || a.id.localeCompare(b.id); });
    var current = open.shift();
    if(current.cost !== dist[current.id] || current.cost >= actor.speedFt * 2) continue;
    tqNeighborRows(space, state, maps.byId[current.id], maps, null, null).forEach(function(row){
      var nextCost = current.cost + row.costFt;
      if(nextCost > actor.speedFt * 2) return;
      if(dist[row.cell.id] == null || nextCost < dist[row.cell.id]){
        dist[row.cell.id] = nextCost;
        open.push({ id: row.cell.id, cost: nextCost });
      }
    });
  }
  var costs = Object.keys(dist).map(function(cellId){ return { cellId: cellId, costFt: dist[cellId] }; });
  costs.sort(function(a, b){ return a.costFt - b.costFt || a.cellId.localeCompare(b.cellId); });
  return tqDeepFreeze({
    version: TQ_VERSION,
    stateRevision: state.revision,
    actorId: actor.id,
    originCellId: actor.cellId,
    speedFt: actor.speedFt,
    moveCellIds: costs.filter(function(row){ return row.costFt > 0 && row.costFt <= actor.speedFt; }).map(function(row){ return row.cellId; }),
    dashCellIds: costs.filter(function(row){ return row.costFt > actor.speedFt && row.costFt <= actor.speedFt * 2; }).map(function(row){ return row.cellId; }),
    costs: costs
  });
}

function tqPreviewRefusal(state, request, reason, alternatives, detail){
  return tqDeepFreeze({
    id: "move-preview-" + tqHashString(state.id + ":" + state.revision + ":" + JSON.stringify(request) + ":" + reason),
    version: TQ_VERSION,
    kind: "movement-preview",
    ok: false,
    stateRevision: state.revision,
    request: Object.assign({}, request),
    reason: reason,
    detail: detail || null,
    alternatives: (alternatives || []).map(String)
  });
}

function tqMovementPreview(space, state, request){
  request = Object.assign({}, request || {});
  var actor = tqFindActor(state, request.actorId);
  if(!actor) return tqPreviewRefusal(state, request, "unknown-actor", [], null);
  if(request.movementMode && request.movementMode !== "land"){
    return tqPreviewRefusal(state, request, "unsupported-movement-mode", ["use land movement"], request.movementMode);
  }
  var pace = request.pace === "dash" ? "dash" : "move";
  var budgetFt = actor.speedFt * (pace === "dash" ? 2 : 1);
  var targetId = request.destinationCellId;
  var connection = null, assessment = null, destinationSceneId = null;
  var routeOpts = {};
  if(request.connectionId){
    connection = tqFindConnection(space, request.connectionId);
    if(!connection) return tqPreviewRefusal(state, request, "unknown-connection", [], request.connectionId);
    assessment = tqConnectionAssessment(connection, request.bodyForm || actor.bodyForm, request.method || null);
    if(assessment.kind === "blocked"){
      return tqPreviewRefusal(state, request, assessment.reason, assessment.alternatives, {
        connectionId: connection.id,
        bodySize: (request.bodyForm || actor.bodyForm).sizeCategory,
        clearanceSize: connection.clearanceSize
      });
    }
    var near = connection.endpoints.find(function(endpoint){ return endpoint.sceneId === actor.sceneId; });
    if(!near) near = connection.endpoints.find(function(endpoint){ return endpoint.cellId === actor.cellId; });
    var far = connection.endpoints.find(function(endpoint){ return endpoint !== near; });
    if(!near || !far) return tqPreviewRefusal(state, request, "connection-endpoint-unavailable", connection.alternatives, connection.id);
    targetId = far.cellId;
    destinationSceneId = far.sceneId;
    routeOpts.allowConnectionId = connection.id;
    routeOpts.bodyAssessment = assessment;
  }
  if(!targetId) return tqPreviewRefusal(state, request, "destination-required", [], null);
  var route = tqViaRoute(space, state, actor.cellId, targetId, request.viaCellId || null, routeOpts);
  if(!route.ok) return tqPreviewRefusal(state, request, route.reason, ["choose another reachable cell", "change the route"], targetId);
  if(route.costFt > budgetFt){
    var alts = ["choose a nearer destination", "change the route"];
    if(pace === "move" && route.costFt <= actor.speedFt * 2) alts.unshift("use Dash");
    return tqPreviewRefusal(state, request, "out-of-range", alts, { costFt: route.costFt, budgetFt: budgetFt });
  }
  var difficultCells = route.cells.filter(function(cellId){
    var row = space.cells.find(function(cell){ return cell.id === cellId; });
    return row && row.difficult;
  });
  var preview = {
    id: "move-preview-" + tqHashString(state.id + ":" + state.revision + ":" + JSON.stringify(request) + ":" + route.cells.join(">")),
    version: TQ_VERSION,
    kind: "movement-preview",
    ok: true,
    stateRevision: state.revision,
    request: request,
    actorId: actor.id,
    from: { sceneId: actor.sceneId, cellId: actor.cellId },
    to: {
      sceneId: destinationSceneId || ((space.cells.find(function(cell){ return cell.id === targetId; }) || {}).sceneId || actor.sceneId),
      cellId: targetId
    },
    route: {
      cells: route.cells,
      steps: route.steps,
      costFt: route.costFt,
      budgetFt: budgetFt,
      pace: pace,
      label: String(request.routeLabel || (request.viaCellId ? "alternate route" : "shortest lawful route")),
      viaCellId: request.viaCellId || null,
      difficultCellIds: difficultCells
    },
    connection: connection ? {
      id: connection.id,
      version: connection.version,
      stateBefore: tqConnectionState(state, connection),
      stateAfter: "open",
      assessment: assessment.kind,
      clearanceSize: connection.clearanceSize
    } : null,
    checkContract: assessment && assessment.checkContract ? assessment.checkContract : null,
    warnings: assessment && assessment.kind === "difficult"
      ? [assessment.rule]
      : (assessment && assessment.kind === "uncertain" ? [assessment.checkContract.stakes] : [])
  };
  return tqDeepFreeze(preview);
}

function tqCheckContractFor(connection, method){
  return (connection && connection.checkContracts || []).find(function(contract){
    return contract.method === String(method || "");
  }) || null;
}

function tqMovementCommit(space, state, preview, input){
  input = input || {};
  if(!preview || preview.kind !== "movement-preview" || !preview.ok){
    return tqDeepFreeze({ ok: false, reason: "committable-preview-required" });
  }
  if(preview.stateRevision !== state.revision){
    return tqDeepFreeze({ ok: false, reason: "stale-preview", expectedRevision: state.revision, previewRevision: preview.stateRevision });
  }
  var replay = tqMovementPreview(space, state, preview.request);
  if(!replay.ok || replay.id !== preview.id){
    return tqDeepFreeze({ ok: false, reason: "preview-revalidation-failed" });
  }
  var actor = tqFindActor(state, preview.actorId);
  var connection = preview.connection ? tqFindConnection(space, preview.connection.id) : null;
  var contract = preview.checkContract ? tqCheckContractFor(connection, preview.request.method) : null;
  var check = null, passed = true;
  if(contract){
    if(!Number.isInteger(input.d20) || input.d20 < 1 || input.d20 > 20){
      return tqDeepFreeze({
        ok: false,
        reason: "player-d20-required",
        checkContract: preview.checkContract,
        dc: contract.dc
      });
    }
    var modifier = Number((actor.checkModifiers || {})[contract.skill] || 0);
    check = {
      contractId: contract.id,
      skill: contract.skill,
      d20: input.d20,
      modifier: modifier,
      total: input.d20 + modifier,
      dc: contract.dc,
      dcRevealed: true
    };
    passed = check.total >= contract.dc;
    check.passed = passed;
  }
  var destination = passed ? preview.to : preview.from;
  if(!passed && connection){
    var near = connection.endpoints.find(function(endpoint){ return endpoint.sceneId === actor.sceneId; });
    if(near) destination = { sceneId: near.sceneId, cellId: near.cellId };
  }
  var nextActors = state.actors.map(function(row){
    return row.id === actor.id ? Object.assign({}, row, {
      sceneId: destination.sceneId,
      cellId: destination.cellId
    }) : row;
  });
  var nextConnections = state.connections.map(function(row){
    if(!connection || row.id !== connection.id || !passed) return Object.assign({}, row);
    return Object.assign({}, row, { state: "open" });
  });
  var receiptCore = {
    version: TQ_VERSION,
    kind: "movement-receipt",
    outcome: passed ? "committed" : "check-failed",
    stateBeforeRevision: state.revision,
    stateAfterRevision: state.revision + 1,
    actorId: actor.id,
    from: preview.from,
    to: destination,
    route: passed ? preview.route : {
      cells: preview.route.cells.slice(0, Math.max(1, preview.route.cells.indexOf(destination.cellId) + 1)),
      steps: Math.max(0, preview.route.cells.indexOf(destination.cellId)),
      costFt: Math.max(0, preview.route.cells.indexOf(destination.cellId)) * 5,
      budgetFt: preview.route.budgetFt,
      pace: preview.route.pace,
      label: preview.route.label,
      viaCellId: preview.route.viaCellId,
      difficultCellIds: []
    },
    connection: preview.connection ? Object.assign({}, preview.connection, {
      stateAfter: passed ? "open" : preview.connection.stateBefore
    }) : null,
    check: check,
    consequences: passed ? [] : [{
      family: "position-change",
      license: contract && contract.licenses.indexOf("position-change") >= 0,
      text: "The actor reaches the near threshold but does not cross."
    }]
  };
  receiptCore.id = "move-receipt-" + tqHashString(JSON.stringify(receiptCore));
  var nextState = tqDeepFreeze({
    id: state.id,
    version: state.version,
    tier: state.tier,
    revision: state.revision + 1,
    actors: nextActors,
    connections: nextConnections,
    history: state.history.concat([receiptCore.id])
  });
  return tqDeepFreeze({ ok: true, state: nextState, receipt: receiptCore });
}

function tqConnectionStateCommit(space, state, request){
  request = request || {};
  var connection = tqFindConnection(space, request.connectionId);
  if(!connection) return tqDeepFreeze({ ok: false, reason: "unknown-connection" });
  if(["shut", "ajar", "open"].indexOf(request.state) < 0){
    return tqDeepFreeze({ ok: false, reason: "unsupported-connection-state", alternatives: ["shut", "ajar", "open"] });
  }
  var before = tqConnectionState(state, connection);
  var receipt = {
    version: TQ_VERSION,
    kind: "connection-receipt",
    outcome: "committed",
    stateBeforeRevision: state.revision,
    stateAfterRevision: state.revision + 1,
    connection: {
      id: connection.id,
      version: connection.version,
      stateBefore: before,
      stateAfter: request.state
    }
  };
  receipt.id = "connection-receipt-" + tqHashString(JSON.stringify(receipt));
  var nextState = tqDeepFreeze({
    id: state.id,
    version: state.version,
    tier: state.tier,
    revision: state.revision + 1,
    actors: state.actors.map(function(actor){ return Object.assign({}, actor); }),
    connections: state.connections.map(function(row){
      return row.id === connection.id ? Object.assign({}, row, { state: request.state }) : Object.assign({}, row);
    }),
    history: state.history.concat([receipt.id])
  });
  return tqDeepFreeze({ ok: true, state: nextState, receipt: receipt });
}

function tqReceiptProse(value){
  if(!value) return "";
  if(value.kind === "movement-preview" && !value.ok){
    return "Movement preview refused: " + value.reason + ". Alternatives: " + value.alternatives.join("; ") + ".";
  }
  if(value.kind === "movement-preview"){
    var previewLines = [
      "Preview " + value.id + " at state revision " + value.stateRevision + ".",
      value.route.label + ": " + value.route.cells.join(" → ") + ".",
      value.route.costFt + " ft of " + value.route.budgetFt + " ft (" + value.route.pace + ")."
    ];
    if(value.checkContract){
      previewLines.push("Check before commit: " + value.checkContract.difficulty + "; stakes: " + value.checkContract.stakes + ". Exact DC is hidden until commit.");
    }
    return previewLines.join("\n");
  }
  if(value.kind === "movement-receipt"){
    var receiptLines = [
      "Receipt " + value.id + ": " + value.outcome + ".",
      value.actorId + " moved from " + value.from.cellId + " to " + value.to.cellId + ".",
      "Route: " + value.route.cells.join(" → ") + " (" + value.route.costFt + " ft)."
    ];
    if(value.connection) receiptLines.push("Connection " + value.connection.id + " is " + value.connection.stateAfter + ".");
    if(value.check) receiptLines.push("Check " + value.check.total + " vs DC " + value.check.dc + ": " + (value.check.passed ? "success" : "failure") + ".");
    return receiptLines.join("\n");
  }
  if(value.kind === "connection-receipt"){
    return "Receipt " + value.id + ": connection " + value.connection.id + " changed from " +
      value.connection.stateBefore + " to " + value.connection.stateAfter + ".";
  }
  return "";
}
