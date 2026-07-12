/* GENESIS MODULE — src/ui/theater-shot.js — GRAPHICS-NORTH-STAR STAGE A, UNIT A2 (docs/STAGE-A.md,
   the Codex directive ui-sketches/mock-frames/vq-battle-scenes/CLAUDE-IMPLEMENTATION-HANDOFF.md §3/
   §4.2). THE SHOT PLANNER: a PURE, DETERMINISTIC module — no THREE, no DOM, no `window` reads. A
   FIFTH ES-module boundary file, parallel to theater-verbs.js/spawn-grace.js/theater-figures.js/
   theater-parts.js — same reason those exist as their own file: plain-Node `import`-able + unit-
   testable in isolation (this file's own header claim, matching theater-verbs.js's
   standeeVerbForHurt/recoilDirFromPositions pure-helper pattern), with ZERO coupling to a live GL
   mount. Registered in manifest.json as `ui.theater-shot` (type:"module"); loaded via its own
   `<script type="module">` tag in genesis.html, ahead of theater-boot.js's tag (which will `import`
   this module directly once A3 wires the real camera in — that wiring is NOT this unit's job).

   Public surface:
     shotPlanFrom(tray, combat, viewState) -> ShotPlan (directive §3 shape, verbatim top-level keys).
     composeShot(shotPlan, cameraCandidates, project) -> { camera, metrics }.
     defaultCameraCandidates(shotPlan, viewState) -> the FINITE candidate pool (4 diagonal yaws + the
       current orbit) composeShot expects when the caller doesn't supply its own (a harness proving a
       hard-constraint rejection, e.g., DOES supply its own list so it can hand it one deliberately bad
       candidate).
     scoreCandidate(shotPlan, candidate, project) -> the per-candidate score/constraint breakdown
       composeShot's metrics.candidates entries are built from — exported directly so a harness/future
       capture tool can score one candidate without running the whole search.
     A battery of small named term/constraint functions (scoreSubjectSeparation, penaltySubjectOverlap,
     constraintSafeFrame, etc.) — each the directive §4.2 score/constraint formula's own line, kept
     separate and exported so dev/verify-theater-shot.mjs (and any later capture/debug tool) can assert
     one term in isolation instead of only the composite total.

   ============================================================================================
   THE PROJECTION CONTRACT (A2's one real design decision — read this before wiring A3)
   ============================================================================================
   The directive says composeShot takes an INJECTED `project(worldPt) -> {ndcX,ndcY}` "the caller
   passes the live camera projection... the harness passes a deterministic stub." But composeShot scores
   MULTIPLE CANDIDATE camera poses (4 diagonal yaws + the current orbit), each a DIFFERENT hypothetical
   camera — a single fixed projection (today's `window.Theater.projectWorldPoint(x,y,z)`, which projects
   through whatever camera is ALREADY mounted, src/ui/theater-boot.js:9334) cannot answer "where would
   this point land under candidate B's pose" without actually moving the live camera there first (an
   expensive, side-effecting operation this pure module must never trigger).

   The contract this file actually implements — and the one A3 must satisfy — is therefore:
     project(worldPt, cameraPose) -> {ndcX, ndcY} | null
   `worldPt` is a plain {x,y,z} (y defaults to 0 upstream when a caller only has ground-plane {x,z}).
   `cameraPose` is a NORMALIZED candidate object (the exact shape normalizeCandidate() below produces:
   {id,mode,yaw,pitch,fov,target,distance,sharpSubjects}). A3's real implementation can satisfy this
   however it likes internally (e.g., a scratch THREE.Camera positioned from yaw/pitch/fov/target/
   distance and never attached to the live scene, or closed-form perspective math) — this module only
   ever calls `project(pt, cameraPose)` and defensively no-ops (treats the point as unresolved) on a
   throw or a non-finite/malformed return, so a not-yet-implemented or partial projector never crashes
   scoring. The deterministic stub the harness below supplies is the reference implementation of this
   exact 2-arg contract.

   ============================================================================================
   THE "combat" CONTRACT
   ============================================================================================
   `combat` may be EITHER:
     (a) the raw GS.combat shape theater-data.js's theaterUnitsFrom already documents at its own header
         (grid, pc:{band,lane,down,obliterated}, allies:[{band,lane,down,fled,obliterated,...}],
         foes:[{fid,band,lane,down,fled,obliterated,cr,hp,maxHp,name,...}]) — this module resolves
         band/lane into a world {x,z} itself via a SIMPLIFIED local zone-center convention
         (zoneWorldPos, mirroring theaterZoneOrigin's `laneIdx*patch, bandIdx*patch` shape at
         src/engine/theater-data.js:202-204, cited so the two never drift on the INTENT even though
         this file can't import that classic-script global) — good enough for anchor clustering and
         camera composition; it is NOT required to land on the exact fanned within-zone offsets the
         live combat renderer uses (theaterWithinZoneOffset) — a cosmetic difference only.
     (b) a caller-enriched shape carrying `combat.units` already resolved to {id,kind,x,z,down,fled,
         obliterated,cr,hp,maxHp} — e.g., A3 handing through the SAME theaterUnitsFrom(GS.combat).units
         array, augmented with each foe's `cr` (theaterUnitsFrom doesn't carry cr today — a trivial
         additive merge A3 performs, not a gap in this module). When present, `combat.units` wins
         outright and the raw pc/allies/foes fields are ignored.
   Absent/null combat -> every anchor resolves null except actionCenter (falls back to the stage
   origin) — a pure environment tray with no encounter is a valid, total input.

   DETERMINISM: no Math.random, no Date.now, anywhere in this file. Same (tray,combat,viewState) SNAPSHOT
   always yields a byte-identical ShotPlan; same (shotPlan,candidates,project) always yields the same
   chosen camera + metrics (given a deterministic `project`). */

// ── small math/utility helpers (no THREE, no DOM) ──────────────────────────────────────────────
function numOr(v, d) { return (typeof v === "number" && isFinite(v)) ? v : d; }
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, numOr(v, lo))); }
function deg2rad(d) { return (numOr(d, 0) * Math.PI) / 180; }
function centroid(points) {
  const pts = (points || []).filter(Boolean);
  if (!pts.length) return null;
  let sx = 0, sz = 0;
  pts.forEach((p) => { sx += numOr(p.x, 0); sz += numOr(p.z, 0); });
  return { x: sx / pts.length, z: sz / pts.length };
}
function rectPolygon(minX, minZ, maxX, maxZ) {
  return [{ x: minX, z: minZ }, { x: maxX, z: minZ }, { x: maxX, z: maxZ }, { x: minX, z: maxZ }];
}

// ── tunable constants (directive §4.2's own literal bands — never re-derived elsewhere) ────────
const DIAGONAL_YAWS_DEG = [45, 135, 225, 315];       // "4 diagonal yaws"
const PITCH_MIN_DEG = 28, PITCH_MAX_DEG = 38;        // "pitch clamped 28-38°"
const FOV_MIN_DEG = 18, FOV_MAX_DEG = 24;            // "FOV 18-24°"
const SAFE_FRAME_MARGIN = 0.07;                      // "7% safe frame" — fraction of frame per edge
const FRAME_SAFE_BOUND = 1 - 2 * SAFE_FRAME_MARGIN;  // NDC |x|/|y| bound a living figure must stay inside
const MEDIUM_FIGURE_MIN_FRAC = 0.18, MEDIUM_FIGURE_MAX_FRAC = 0.25; // "18-25% of frame height"
const MEDIUM_FIGURE_TARGET_FRAC = (MEDIUM_FIGURE_MIN_FRAC + MEDIUM_FIGURE_MAX_FRAC) / 2;
const MEDIUM_FIGURE_WORLD_HEIGHT = 1.5;              // theater-interior.js's own cited human-figure
                                                      // height convention ("1.5, a human figure")
const FIGURE_WORLD_RADIUS = 0.4;                     // approximate standee footprint radius, world units
const PRIMARY_OVERLAP_MAX = 0.15;                    // "≤15% of the smaller projected bounds"
const SUBJECT_SEPARATION_TARGET = 0.6;               // NDC distance considered "well separated"
const SHOT_ZONE_PATCH = 3;                           // mirrors theater-data.js's THEATER_PATCH (a
                                                      // zone is a 3x3 world-unit patch) — used ONLY
                                                      // by this file's own zoneWorldPos() fallback,
                                                      // never read from/written to theater-data.js.
const THIRDS_POINTS = [
  { x: -1 / 3, y: -1 / 3 }, { x: 1 / 3, y: -1 / 3 }, { x: -1 / 3, y: 1 / 3 }, { x: 1 / 3, y: 1 / 3 }
];

// ── zone/world resolution (the "combat" contract's raw-shape fallback, see header) ─────────────
function zoneWorldPos(band, lane, grid) {
  const bands = (grid && grid.bands) || ["melee", "near", "far", "out"];
  const lanes = (grid && grid.lanes) || ["L", "C", "R"];
  const bi = Math.max(0, bands.indexOf(band));
  const li = Math.max(0, lanes.indexOf(lane));
  return { x: li * SHOT_ZONE_PATCH, z: bi * SHOT_ZONE_PATCH };
}
// worldPosFromEntry — a small entry (unit/prop) resolves to {x,z} either directly (already-numeric
// x/z, the pre-resolved-units / interior-instance convention every tray already uses) or via a zone
// key ("band:lane" string, or explicit band/lane fields — the raw combat.pc/allies/foes convention).
// Returns null only when NEITHER shape is present (never guesses a position from nothing).
function worldPosFromEntry(entry, grid) {
  if (!entry) return null;
  if (typeof entry.x === "number" && typeof entry.z === "number") return { x: entry.x, z: entry.z };
  if (typeof entry.zone === "string") {
    const parts = entry.zone.split(":");
    return zoneWorldPos(parts[0], parts[1], grid);
  }
  if (entry.band || entry.lane) return zoneWorldPos(entry.band, entry.lane, grid);
  return null;
}

// ── combat unit resolution ──────────────────────────────────────────────────────────────────────
function normalizeUnit(u) {
  const pos = worldPosFromEntry(u, u.__grid) || { x: 0, z: 0 };
  return {
    id: u.id, kind: u.kind, x: pos.x, z: pos.z,
    down: !!u.down, fled: !!u.fled, obliterated: !!u.obliterated,
    cr: (u.cr != null ? u.cr : null), hp: (u.hp != null ? u.hp : null),
    maxHp: (u.maxHp != null ? u.maxHp : null), name: u.name || null
  };
}
function resolveCombatUnits(combat) {
  if (!combat) return [];
  if (Array.isArray(combat.units)) {
    return combat.units.map((u) => normalizeUnit(Object.assign({ __grid: combat.grid }, u)));
  }
  const grid = combat.grid || null;
  const units = [];
  if (combat.pc) {
    units.push(normalizeUnit(Object.assign({ id: "pc", kind: "pc", __grid: grid }, combat.pc)));
  }
  (combat.allies || []).forEach((a, i) => {
    units.push(normalizeUnit(Object.assign({
      id: a.id || ("ally" + (i + 1)), kind: "ally",
      band: a.band || (combat.pc && combat.pc.band), lane: a.lane || (combat.pc && combat.pc.lane),
      __grid: grid
    }, a)));
  });
  (combat.foes || []).forEach((f, i) => {
    units.push(normalizeUnit(Object.assign({ id: f.fid || ("f" + (i + 1)), kind: "foe", __grid: grid }, f)));
  });
  return units;
}
function livingUnits(units) { return (units || []).filter((u) => !u.down && !u.fled && !u.obliterated); }
function threatScore(u) {
  if (u.cr != null) return Number(u.cr) || 0;
  if (u.maxHp != null) return Number(u.maxHp) / 5;
  if (u.hp != null) return Number(u.hp) / 5;
  return 0;
}
// pickPrimaryThreat — the highest-threat foe by threatScore; a strict `>` compare keeps the FIRST
// max on a tie (stable / deterministic regardless of foe array order re-shuffling equal scores).
function pickPrimaryThreat(foes) {
  if (!foes.length) return null;
  let best = foes[0], bestScore = threatScore(foes[0]);
  for (let i = 1; i < foes.length; i++) {
    const s = threatScore(foes[i]);
    if (s > bestScore) { best = foes[i]; bestScore = s; }
  }
  return best;
}

// ── WALK-NATIVE-A.md A3 / contract §10 — WalkScene consumption ─────────────────────────────────
// walkSceneLane(tray, lane) -> the named WalkScene lane array (citizens/interactables/structure/
// dressing/connections/conditions/...), or [] when tray.walkScene is absent (idle/node/segment
// trays never carry one — WDV-1 stamps board.walkScene only off the "interior" trayFrom branch).
// Every entry that reaches these lanes already carries the richer WalkScene sourceRef shape
// ({walkId,segmentNum,fieldPath,tableId,roll,overlayRef}, walk-scene.js's own wsSourceRef) instead
// of place-projection's flatter card.sourceRef — preferring these lanes is what "provenance where
// present" (contract §10) means in practice: the SAME anchor/piece/prop, a strictly better-resolved
// sourceRef, no shape change.
function walkSceneLane(tray, lane) {
  const ws = tray && tray.walkScene;
  return (ws && Array.isArray(ws[lane])) ? ws[lane] : [];
}
// ── anchor resolution (directive §3's weighted encounter cluster) ──────────────────────────────
function objectiveFrom(tray) {
  if (!tray) return null;
  const cs0 = numOr(tray.cellSize, 1);
  // contract §10: prefer tray.walkScene.structure (centerpiece/feature/objective cards fold here when
  // card.centerpiece is true — walk-scene.js's own wsCardLaneKey) over the flatter tray.projection
  // fallback below. Same shape/positions as the projection branch (position is inherited verbatim from
  // the dealt card either way) — only the sourceRef richness and the lane it's read from differ.
  const walkCenterpiece = walkSceneLane(tray, "structure").find((e) => e && e.centerpiece && e.position);
  if (walkCenterpiece) {
    return { x: numOr(walkCenterpiece.position.x, 0) * cs0, z: numOr(walkCenterpiece.position.y, 0) * cs0,
      roomSegNum: tray.activeRoomId, sourceRef: walkCenterpiece.sourceRef || null };
  }
  const projected = tray.projection && Array.isArray(tray.projection.stageNow) ? tray.projection.stageNow : [];
  const projectedCenterpiece = projected.find((c) => c && c.centerpiece && c.position);
  if (projectedCenterpiece) {
    const cs = numOr(tray.cellSize, 1);
    return { x:numOr(projectedCenterpiece.position.x,0)*cs, z:numOr(projectedCenterpiece.position.y,0)*cs,
      roomSegNum:tray.activeRoomId, sourceRef:projectedCenterpiece.sourceRef||null };
  }
  // interior3d finale rooms carry a canonical dais anchor (theater-interior.js's daisTop) — the
  // closest thing the current tree has to a "centerpiece/objective cell" (BW5's construction-class
  // taxonomy formalizes a real objective/centerpiece flag in a later stage; this reads what exists
  // today rather than inventing a field no producer stamps yet).
  if (Array.isArray(tray.daisTop) && tray.daisTop.length) {
    const d = tray.daisTop[0];
    const cs = numOr(tray.cellSize, 1);
    return { x: numOr(d.x, 0) * cs, z: numOr(d.y != null ? d.y : d.z, 0) * cs, roomSegNum: (d.roomSegNum != null ? d.roomSegNum : null) };
  }
  // a grid-board prop explicitly flagged as the room's centerpiece (no current producer stamps this
  // either — kept as a real, checked branch so the day a curation pass (Stage D §4.11) starts
  // flagging one, this resolves it with zero changes here).
  const props = Array.isArray(tray.props) ? tray.props : [];
  const centerpiece = props.find((p) => p && (p.centerpiece === true || p.role === "centerpiece"));
  if (centerpiece) {
    const pos = worldPosFromEntry(centerpiece, tray.grid);
    if (pos) return { x: pos.x, z: pos.z, roomSegNum: null };
  }
  return null;
}
function focalLightFrom(tray) {
  if (tray && tray.kind === "interior3d" && Array.isArray(tray.lights) && tray.lights.length) {
    // itrRoomLights' own convention (theater-interior.js:535 "the room's BRIGHTEST light (list[0]...)
    // relocates... steps up to the role's focalLight value") — index 0 IS the dominant practical.
    const l = tray.lights[0];
    return { x: numOr(l.x, 0), z: numOr(l.z, 0) };
  }
  // a plain grid board only carries a light PROFILE string (theaterBoardBuild's `light` field), no
  // position — no positional focal-light anchor to report (never guesses a fake location).
  return null;
}
function anchorsFrom(units, tray) {
  const partyUnits = units.filter((u) => u.kind === "pc" || u.kind === "ally");
  const livingParty = livingUnits(partyUnits);
  const player = centroid((livingParty.length ? livingParty : partyUnits).map((u) => ({ x: u.x, z: u.z })));

  const foes = units.filter((u) => u.kind === "foe");
  const livingFoes = livingUnits(foes);
  const threatPool = livingFoes.length ? livingFoes : foes;
  const primaryThreatUnit = pickPrimaryThreat(threatPool);
  const primaryThreat = primaryThreatUnit ? { x: primaryThreatUnit.x, z: primaryThreatUnit.z, id: primaryThreatUnit.id } : null;

  const objective = objectiveFrom(tray);
  const focalLight = focalLightFrom(tray);

  const clusterPts = [player, primaryThreat, objective].filter(Boolean);
  const actionCenter = clusterPts.length ? centroid(clusterPts) : { x: 0, z: 0 };

  return { player, primaryThreat, objective, focalLight, actionCenter };
}

// ── stage / pieces / props / light rig / occlusion targets ─────────────────────────────────────
function stageFromTray(tray) {
  if (tray && tray.kind === "interior3d") {
    const b = tray.bounds || { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
    const cs = numOr(tray.cellSize, 1);
    const polygon = rectPolygon(b.minX * cs, b.minZ * cs, (b.maxX + 1) * cs, (b.maxZ + 1) * cs);
    const inst = tray.instances || {};
    const wallSegments = Array.isArray(inst.wall)
      ? inst.wall.map((w, i) => ({ id: "wall:" + i, x: numOr(w.x, 0) * cs, z: numOr(w.z, 0) * cs, sx: w.sx, sy: w.sy, sz: w.sz }))
      : [];
    const apertures = Array.isArray(inst.doorframe)
      ? inst.doorframe.map((d, i) => ({ id: "aperture:" + i, x: numOr(d.x, 0) * cs, z: numOr(d.z, 0) * cs, transition: !!d.transition }))
      : [];
    const skirt = Array.isArray(tray.skirt)
      ? tray.skirt.map((s, i) => ({ id: "skirt:" + i, x: numOr(s.x, 0) * cs, z: numOr(s.z, 0) * cs }))
      : [];
    // Stage C (room-shell compiler, theater-room-mesh.js) computes true polygon-derived exit slots;
    // A2 has only the rectangular keep-grid bounds today, so openEdges stays empty rather than a
    // guessed value — see this unit's report for the explicit "left empty for later stages" note.
    return { polygon, floorLevels: [{ level: 0, polygon }], wallSegments, apertures, skirt, openEdges: [] };
  }
  const grid = (tray && tray.grid) || null;
  const bandCount = (grid && (grid.bandCount || (grid.bands && grid.bands.length))) || 4;
  const laneCount = (grid && (grid.laneCount || (grid.lanes && grid.lanes.length))) || 3;
  const polygon = rectPolygon(0, 0, Math.max(1, laneCount - 1) * SHOT_ZONE_PATCH, Math.max(1, bandCount - 1) * SHOT_ZONE_PATCH);
  return { polygon, floorLevels: [{ level: 0, polygon }], wallSegments: [], apertures: [], skirt: [], openEdges: [] };
}
function piecesFromUnits(units) {
  return units.map((u) => ({
    id: u.id, kind: u.kind, x: u.x, z: u.z,
    down: u.down, fled: u.fled, obliterated: u.obliterated,
    living: !u.down && !u.fled && !u.obliterated
  }));
}
function piecesFromProjection(tray) {
  const cs = numOr(tray && tray.cellSize, 1);
  // contract §10: prefer tray.walkScene.citizens (cast/guise cards, plus non-centerpiece feature cards
  // that WDV-1's own wsCardLaneKey folds into this same lane — walk-scene.js's own header calls that
  // "a disguised creature keeps its identity" / centerpiece-flag rule) over tray.projection.stageNow.
  // `deferred:true` entries are WDV-1's reserve-lane fold (contract §8.3's staging reserve — a card
  // rolled but NOT yet placed on stage) and are excluded here exactly like piecesFromProjection's own
  // pre-existing stageNow-only read already excluded reserve (that array was never consulted at all).
  // Gate on tray.walkScene PRESENCE, not lane length — an empty citizens[] (a real, valid "no cast in
  // this room" WalkScene) must return [] here, never silently fall through to the projection fallback.
  if (tray && tray.walkScene) {
    return walkSceneLane(tray, "citizens").filter((c) => c && c.position && !c.deferred).map((c) => ({
      id:"card:"+(c.id!=null?c.id:"citizen"), kind:"cast", x:numOr(c.position.x,0)*cs, z:numOr(c.position.y,0)*cs,
      roomSegNum:tray.activeRoomId, sourceRef:c.sourceRef||null, living:true,
      count:c.count||1, representativeCount:c.representativeCount||1, groupFootprint:c.groupFootprint||null
    }));
  }
  const projected = tray && tray.projection && Array.isArray(tray.projection.stageNow) ? tray.projection.stageNow : [];
  return projected.filter((c) => c && c.role === "cast" && c.position).map((c) => ({
    id:"card:"+c.id, kind:"cast", x:numOr(c.position.x,0)*cs, z:numOr(c.position.y,0)*cs,
    roomSegNum:tray.activeRoomId, sourceRef:c.sourceRef||null, living:true,
    count:c.count||1, representativeCount:c.representativeCount||1, groupFootprint:c.groupFootprint||null
  }));
}
function propsFromTray(tray) {
  if (!tray) return [];
  if (tray.kind === "interior3d") {
    // The room's placed furniture is the closest current-tree analog to the directive's decorative
    // `props` vocabulary (Stage D's curation pass, §4.11, formalizes the real budgeted prop list —
    // this surfaces what interiorBuildBoard already computed rather than inventing a second one).
    const furniture = Array.isArray(tray.furniture) ? tray.furniture : [];
    const cs = numOr(tray.cellSize, 1);
    const out = furniture.map((f, i) => ({
      id: "furniture:" + i, kind: f.kind || "furniture",
      x: numOr(f.x, 0) * cs, z: numOr(f.z, 0) * cs,
      roomSegNum: (f.roomSegNum != null ? f.roomSegNum : null)
    }));
    // contract §10: prefer tray.walkScene.interactables (+ the sibling dealt-card lanes WDV-1 folds
    // non-cast content into — dressing/cover, connections, conditions, and non-centerpiece structure
    // cards; walk-scene.js's own wsCardLaneKey/WS_LANE_ROLE, mirrored here) over the flatter
    // tray.projection.stageNow "everything but cast" read below. Gate on tray.walkScene PRESENCE, not
    // combined-lane length, so a real "nothing dealt beyond furniture" WalkScene correctly yields no
    // extra dealt-card props instead of silently falling through to the projection fallback.
    if (tray.walkScene) {
      ["structure", "interactables", "dressing", "connections", "conditions"].forEach((lane) => {
        walkSceneLane(tray, lane).forEach((c) => {
          if (!c || !c.position || c.deferred || c.centerpiece) return; // centerpiece -> objectiveFrom already
          out.push({ id:"card:"+(c.id!=null?c.id:lane), kind:c.role||lane, x:numOr(c.position.x,0)*cs,
            z:numOr(c.position.y,0)*cs, roomSegNum:tray.activeRoomId, sourceRef:c.sourceRef||null,
            count:c.count||1, representativeCount:c.representativeCount||1 });
        });
      });
      return out;
    }
    const projected = tray.projection && Array.isArray(tray.projection.stageNow) ? tray.projection.stageNow : [];
    projected.forEach((c) => {
      if (!c || !c.position || c.role === "cast") return;
      out.push({ id:"card:"+c.id, kind:c.role||"card", x:numOr(c.position.x,0)*cs,
        z:numOr(c.position.y,0)*cs, roomSegNum:tray.activeRoomId, sourceRef:c.sourceRef||null,
        count:c.count||1, representativeCount:c.representativeCount||1 });
    });
    return out;
  }
  const raw = Array.isArray(tray.props) ? tray.props : [];
  return raw.map((p, i) => {
    const pos = worldPosFromEntry(p, tray.grid) || { x: 0, z: 0 };
    return { id: "prop:" + i, kind: p.kind || p.part || "prop", x: pos.x, z: pos.z, roomSegNum: null };
  });
}
function lightRigFromTray(tray, actionCenter) {
  if (tray && tray.kind === "interior3d" && Array.isArray(tray.lights) && tray.lights.length) {
    const cs = numOr(tray.cellSize, 1);
    const practicals = tray.lights.map((l, i) => ({
      id: "light:" + i, x: numOr(l.x, 0) * cs, z: numOr(l.z, 0) * cs,
      color: l.color || null, intensity: numOr(l.intensity, 0), kind: l.kind || "torch", dominant: i === 0
    }));
    return { practicals, sky: null, readabilityFloor: 0.12, exposure: 1.0 };
  }
  const profile = (tray && tray.light && tray.light.profile) || null;
  const ac = actionCenter || { x: 0, z: 0 };
  const practicals = profile ? [{ id: "light:profile", x: ac.x, z: ac.z, color: null, intensity: 1, kind: profile, dominant: true }] : [];
  return { practicals, sky: null, readabilityFloor: 0.12, exposure: 1.0 };
}
function occlusionTargetsFromTray(tray) {
  if (!tray || tray.kind !== "interior3d") return [];
  const inst = tray.instances || {};
  const cs = numOr(tray.cellSize, 1);
  const mk = (arr, kind) => (Array.isArray(arr) ? arr : []).map((e, i) => ({ id: kind + ":" + i, kind, x: numOr(e.x, 0) * cs, z: numOr(e.z, 0) * cs }));
  return [].concat(mk(inst.wall, "wall"), mk(inst.pillar, "pillar"), mk(tray.furniture, "furniture"));
}
function sharpSubjectsFrom(anchors) {
  const list = [];
  if (anchors.player) list.push("player");
  if (anchors.primaryThreat) list.push("primaryThreat");
  if (anchors.objective) list.push("objective");
  return list;
}
function distanceFor(stage, fovDeg, zoomLevel, mode) {
  const halfFov = deg2rad(fovDeg) / 2;
  const zoom = clamp(numOr(zoomLevel, 1), 0.1, 5);
  // Beat shots crop the room around the encounter. Room-diagonal distance made ordinary 6x6+ rooms
  // fail the 18-25% medium-figure hard constraint before yaw scoring could matter. Solve directly
  // for the middle of that authored band; safe-frame and stage-edge checks still reject a bad crop.
  if (mode === "beat") {
    const visibleHeight = MEDIUM_FIGURE_WORLD_HEIGHT / MEDIUM_FIGURE_TARGET_FRAC;
    const base = visibleHeight / (2 * Math.max(0.05, Math.tan(halfFov)));
    return Math.max(1, base * zoom);
  }
  const poly = (stage && stage.polygon) || [];
  let radius = 4; // sane default for an empty/degenerate stage — never a zero/NaN distance
  if (poly.length) {
    const xs = poly.map((p) => p.x), zs = poly.map((p) => p.z);
    const dx = Math.max.apply(null, xs) - Math.min.apply(null, xs);
    const dz = Math.max.apply(null, zs) - Math.min.apply(null, zs);
    radius = Math.max(1, Math.hypot(dx, dz) / 2);
  }
  const base = radius / Math.max(0.05, Math.tan(halfFov));
  return Math.max(1, base * zoom);
}
function shotPlanId(tray, combat) {
  const seed = (tray && tray.seed != null) ? tray.seed : ((combat && combat.seed != null) ? combat.seed : 0);
  const room = (tray && tray.activeRoomId != null) ? tray.activeRoomId : "none";
  const env = (tray && tray.env) || "none";
  return "shot:" + env + ":" + room + ":" + seed;
}

// ── ShotPlan construction (directive §3, verbatim top-level keys) ──────────────────────────────
function shotPlanFrom(tray, combat, viewState) {
  tray = tray || {};
  viewState = viewState || {};

  const units = resolveCombatUnits(combat);
  const provenance = [];
  const noteProvenance = (ref, source, detail) => provenance.push({ ref, source, detail: detail || null });
  units.forEach((u) => noteProvenance(u.id, "combat-unit", u.kind));

  const stage = stageFromTray(tray);
  noteProvenance("stage", "state", (tray.activeRoomId != null) ? ("room:" + tray.activeRoomId) : null);

  const anchors = anchorsFrom(units, tray);
  if (anchors.objective) noteProvenance("objective", "state", null);
  if (anchors.focalLight) noteProvenance("focalLight", "state", null);

  const pieces = piecesFromUnits(units).concat(piecesFromProjection(tray));
  pieces.filter((p)=>p.sourceRef).forEach((p)=>noteProvenance(p.id,"walk-card",p.sourceRef));
  const props = propsFromTray(tray);
  props.forEach((p) => noteProvenance(p.id, p.sourceRef?"walk-card":"state", p.sourceRef||null));

  const lightRig = lightRigFromTray(tray, anchors.actionCenter);
  const occlusionTargets = occlusionTargetsFromTray(tray);

  const pitch = clamp(numOr(viewState.pitchDeg, (PITCH_MIN_DEG + PITCH_MAX_DEG) / 2), PITCH_MIN_DEG, PITCH_MAX_DEG);
  const fov = clamp(numOr(viewState.fovDeg, (FOV_MIN_DEG + FOV_MAX_DEG) / 2), FOV_MIN_DEG, FOV_MAX_DEG);
  const defaultMode = tray.projection && tray.projection.explicitDeal && tray.projection.density === "overloaded" ? "room" : "beat";
  const camera = {
    mode: viewState.mode || defaultMode,
    yaw: numOr(viewState.yawDeg, 0),
    pitch, fov,
    target: anchors.actionCenter || { x: 0, z: 0 },
    distance: distanceFor(stage, fov, viewState.zoomLevel, viewState.mode || defaultMode),
    sharpSubjects: sharpSubjectsFrom(anchors)
  };

  // activeRoomId is a caller-stamped convenience field (A1/A3's job: interiorBuildBoard's own return
  // shape has no room-id field today — see this unit's report). Absent -> null, never guessed.
  const activeRoomId = (tray.activeRoomId != null) ? tray.activeRoomId : null;

  // WALK-NATIVE-A.md A3 / contract §10 "ShotPlan Amendment": walkRef/segmentRef/fieldRefs/register are
  // additive top-level keys carried straight through from tray.walkScene when WDV-1 stamped one (the
  // "interior" trayFrom branch always does; idle/node/segment trays never carry a walkScene, so these
  // stay null/[] there — the SAME absent/present split every other WalkScene read in this file already
  // gates on). fieldRefs also folds into `provenance` below (one more provenance entry per WalkScene
  // fact, tagged "walk-scene" so it's distinguishable from the "walk-card"/"combat-unit"/"state"
  // sources already noted above) — the flat index of every fact WDV-1 actually classified, not just
  // the subset this file happened to turn into an anchor/piece/prop.
  const ws = tray.walkScene || null;
  if (ws) {
    (ws.fieldRefs || []).forEach((ref, i) => { if (ref) noteProvenance("walkScene:" + i, "walk-scene", ref); });
  }

  return {
    id: shotPlanId(tray, combat),
    seed: (tray.seed != null ? tray.seed : ((combat && combat.seed != null) ? combat.seed : null)),
    realmId: tray.realmId || null,
    environment: tray.env || null,
    activeRoomId,
    walkRef: ws ? (ws.walkRef || null) : null,
    segmentRef: ws ? (ws.segmentRef || null) : null,
    fieldRefs: ws ? (ws.fieldRefs || []) : [],
    register: ws ? (ws.register || null) : null,
    stage,
    anchors,
    pieces,
    props,
    walkProjection: tray.projection || null,
    // Stage D (BEAUTY-WAVE-5's broad state primitive + the object-state registry) is the owner of
    // interactables/traces; Stage E owns condition-decal overlays. No producer in the current tree
    // stamps any of the three yet, so they stay real (never-undefined) empty arrays — the SHAPE is
    // complete today, the CONTENT arrives with those stages.
    interactables: [],
    overlays: [],
    traces: [],
    lightRig,
    camera,
    occlusionTargets,
    // Stage E (§4.9) replaces this with a real depth-aware/emissive-masked profile; A2 stamps the
    // renderer's OWN documented current post chain (theater-boot.js's header: "RenderPass -> screen-
    // vertical tilt-shift DoF -> threshold bloom -> realm grade -> OutputPass") so this is honest
    // today's-behavior, not an invented future value.
    postProfile: { dofMode: "screen-tilt-shift", bloomMode: "luminance-threshold", vignette: "weak" },
    provenance
  };
}

// ── camera candidate generation (directive §4.2: "4 diagonal yaws + the current orbit") ────────
function defaultCameraCandidates(shotPlan, viewState) {
  shotPlan = shotPlan || {};
  viewState = viewState || {};
  const anchors = shotPlan.anchors || {};
  const target = anchors.actionCenter || { x: 0, z: 0 };
  const pitch = clamp(numOr(viewState.pitchDeg, (PITCH_MIN_DEG + PITCH_MAX_DEG) / 2), PITCH_MIN_DEG, PITCH_MAX_DEG);
  const fov = clamp(numOr(viewState.fovDeg, (FOV_MIN_DEG + FOV_MAX_DEG) / 2), FOV_MIN_DEG, FOV_MAX_DEG);
  const mode = (shotPlan.camera && shotPlan.camera.mode) || viewState.mode || "beat";
  const distance = distanceFor(shotPlan.stage, fov, viewState.zoomLevel, mode);
  const sharpSubjects = sharpSubjectsFrom(anchors);
  const diagonals = DIAGONAL_YAWS_DEG.map((yaw) => ({ id: "diag-" + yaw, mode, yaw, pitch, fov, target, distance, sharpSubjects }));
  const currentOrbit = { id: "current-orbit", mode, yaw: numOr(viewState.yawDeg, 0), pitch, fov, target, distance, sharpSubjects };
  return diagonals.concat([currentOrbit]);
}
function normalizeCandidate(candidate) {
  candidate = candidate || {};
  return {
    id: candidate.id || null,
    mode: candidate.mode || "beat",
    yaw: numOr(candidate.yaw, 0),
    pitch: clamp(numOr(candidate.pitch, (PITCH_MIN_DEG + PITCH_MAX_DEG) / 2), PITCH_MIN_DEG, PITCH_MAX_DEG),
    fov: clamp(numOr(candidate.fov, (FOV_MIN_DEG + FOV_MAX_DEG) / 2), FOV_MIN_DEG, FOV_MAX_DEG),
    target: candidate.target || { x: 0, z: 0 },
    distance: Math.max(0.1, numOr(candidate.distance, 6)),
    sharpSubjects: Array.isArray(candidate.sharpSubjects) ? candidate.sharpSubjects : []
  };
}

// ── projection helpers (see the header's PROJECTION CONTRACT note) ─────────────────────────────
function projectSafe(project, pt, candidate) {
  if (typeof project !== "function" || !pt) return null;
  try {
    const out = project({ x: numOr(pt.x, 0), y: numOr(pt.y, 0), z: numOr(pt.z, 0) }, candidate);
    if (!out || typeof out.ndcX !== "number" || typeof out.ndcY !== "number") return null;
    if (!isFinite(out.ndcX) || !isFinite(out.ndcY)) return null;
    return out;
  } catch (e) { return null; }
}
// screenHeightFractionFor — closed-form perspective vertical-extent fraction for a world-space
// height at a given distance/FOV (no projector needed — a straight trig identity, so the medium-
// figure-height constraint is testable even when `project` itself is a no-op stub).
function screenHeightFractionFor(worldHeight, fovDeg, distance) {
  const halfFov = deg2rad(fovDeg) / 2;
  const visibleHeight = 2 * Math.max(0.001, numOr(distance, 1)) * Math.tan(halfFov);
  if (visibleHeight <= 0) return 0;
  return clamp(numOr(worldHeight, 0) / visibleHeight, 0, 10);
}
function circleRadiusNdcFor(worldRadius, fovDeg, distance) {
  const halfFov = deg2rad(fovDeg) / 2;
  const visibleHalf = Math.max(0.001, numOr(distance, 1)) * Math.tan(halfFov);
  return clamp(numOr(worldRadius, 0) / visibleHalf, 0, 2);
}
// circleOverlapFraction — exact circle-circle intersection (lens) area, normalized by the SMALLER
// circle's own area ("≤15% of the smaller projected bounds", directive §4.2) — standard closed-form,
// pure/deterministic, no iterative solve.
function circleOverlapFraction(d, r1, r2) {
  if (r1 <= 0 || r2 <= 0) return 0;
  const rMin = Math.min(r1, r2), rMax = Math.max(r1, r2);
  if (d >= r1 + r2) return 0;
  if (d <= rMax - rMin) return 1; // the smaller circle sits fully inside the larger
  const r1_2 = r1 * r1, r2_2 = r2 * r2, d2 = d * d;
  const alpha = Math.acos(clamp((d2 + r1_2 - r2_2) / (2 * d * r1), -1, 1));
  const beta = Math.acos(clamp((d2 + r2_2 - r1_2) / (2 * d * r2), -1, 1));
  const area = r1_2 * (alpha - Math.sin(2 * alpha) / 2) + r2_2 * (beta - Math.sin(2 * beta) / 2);
  const smallerArea = Math.PI * rMin * rMin;
  return clamp(area / smallerArea, 0, 1);
}
function clippedFraction(ndc, r) {
  const overX = Math.max(0, Math.abs(ndc.ndcX) + r - 1);
  const overY = Math.max(0, Math.abs(ndc.ndcY) + r - 1);
  const over = Math.max(overX, overY);
  return clamp(over / (2 * r || 1), 0, 1);
}
function scoreInFrame(ndc) {
  if (!ndc) return 0;
  const bound = FRAME_SAFE_BOUND;
  const dx = Math.max(0, Math.abs(ndc.ndcX) - bound);
  const dy = Math.max(0, Math.abs(ndc.ndcY) - bound);
  const overflow = Math.max(dx, dy);
  return clamp(1 - overflow / (1 - bound || 1), 0, 1);
}

// buildCandidateCtx — projects every anchor + living piece + stage boundary point exactly ONCE per
// candidate, so every term/constraint function below is a cheap pure read of already-projected data.
function buildCandidateCtx(shotPlan, candidate, project) {
  const anchors = shotPlan.anchors || {};
  const livingPieces = (shotPlan.pieces || []).filter((p) => p.living);
  const proj = (pt) => projectSafe(project, pt, candidate);
  const stagePts = ((shotPlan.stage && shotPlan.stage.polygon) || []).concat((shotPlan.stage && shotPlan.stage.skirt) || []);
  return {
    anchors,
    livingPieces,
    playerNdc: anchors.player ? proj(anchors.player) : null,
    threatNdc: anchors.primaryThreat ? proj(anchors.primaryThreat) : null,
    objectiveNdc: anchors.objective ? proj(anchors.objective) : null,
    focalLightNdc: anchors.focalLight ? proj(anchors.focalLight) : null,
    livingNdc: livingPieces.map((p) => ({ piece: p, ndc: proj({ x: p.x, z: p.z }) })),
    stageCornerNdc: stagePts.map((pt) => proj(pt))
  };
}

// ── score terms (directive §4.2's `score = +... -...` formula, one small function per line) ───
function scoreSubjectSeparation(ctx) {
  if (!ctx.playerNdc || !ctx.threatNdc) return 0;
  const d = Math.hypot(ctx.playerNdc.ndcX - ctx.threatNdc.ndcX, ctx.playerNdc.ndcY - ctx.threatNdc.ndcY);
  return clamp(d / SUBJECT_SEPARATION_TARGET, 0, 1);
}
function scorePrimaryThreatVisibility(ctx) { return scoreInFrame(ctx.threatNdc); }
function scoreObjectiveVisibility(ctx) { return ctx.objectiveNdc ? scoreInFrame(ctx.objectiveNdc) : 0; }
function scoreFocalLightNearRuleOfThirds(ctx) {
  if (!ctx.focalLightNdc) return 0;
  let best = Infinity;
  THIRDS_POINTS.forEach((t) => { const d = Math.hypot(ctx.focalLightNdc.ndcX - t.x, ctx.focalLightNdc.ndcY - t.y); if (d < best) best = d; });
  return clamp(1 - best / 1.2, 0, 1);
}
function scoreTrayEdgeVisibility(ctx) {
  if (!ctx.stageCornerNdc.length) return 0;
  const visible = ctx.stageCornerNdc.filter(Boolean).filter((n) => Math.abs(n.ndcX) <= 1 && Math.abs(n.ndcY) <= 1);
  return clamp(visible.length / ctx.stageCornerNdc.length, 0, 1);
}
function scoreForegroundDepthLayer(shotPlan, candidate) {
  const ideal = distanceFor(shotPlan.stage, candidate.fov, 1, candidate.mode);
  if (ideal <= 0) return 0;
  return clamp(1 - Math.abs(candidate.distance - ideal) / ideal, 0, 1);
}
// penaltyHardOcclusionArea — A4 (dynamic occlusion v2) is the owner of real blocker-vs-sightline
// geometry; this file's occlusionTargets carry positions only (no wall-thickness/ray-intersection
// test lives here). The TERM is wired into scoring now (never omitted from the formula) so A4 only
// has to supply the number, not invent the slot in the total/metrics shape.
function penaltyHardOcclusionArea(shotPlan, candidate, project) { return 0; }
function penaltySubjectOverlap(ctx, candidate) {
  if (!ctx.playerNdc || !ctx.threatNdc) return 0;
  const r = circleRadiusNdcFor(FIGURE_WORLD_RADIUS, candidate.fov, candidate.distance);
  const d = Math.hypot(ctx.playerNdc.ndcX - ctx.threatNdc.ndcX, ctx.playerNdc.ndcY - ctx.threatNdc.ndcY);
  return circleOverlapFraction(d, r, r);
}
function penaltyClippedSubjectArea(ctx, candidate) {
  if (!ctx.livingNdc.length) return 0;
  const r = circleRadiusNdcFor(FIGURE_WORLD_RADIUS, candidate.fov, candidate.distance);
  let total = 0;
  ctx.livingNdc.forEach((entry) => { total += entry.ndc ? clippedFraction(entry.ndc, r) : 1; });
  return total / ctx.livingNdc.length;
}
function penaltyEmptyFrameArea(ctx) {
  const pts = ctx.livingNdc.map((e) => e.ndc).filter(Boolean);
  if (!pts.length) return 1;
  const xs = pts.map((p) => p.ndcX), ys = pts.map((p) => p.ndcY);
  const w = clamp(Math.max.apply(null, xs) - Math.min.apply(null, xs), 0, 2);
  const h = clamp(Math.max.apply(null, ys) - Math.min.apply(null, ys), 0, 2);
  return clamp(1 - (w * h) / 4, 0, 1);
}
function penaltyCompetingBrightSourceCount(shotPlan, candidate, project) {
  const practicals = (shotPlan.lightRig && shotPlan.lightRig.practicals) || [];
  if (practicals.length <= 1) return 0;
  const dominant = practicals.find((p) => p.dominant) || practicals[0];
  let count = 0;
  practicals.forEach((p) => {
    if (p === dominant) return;
    const ndc = projectSafe(project, { x: p.x, z: p.z }, candidate);
    if (ndc && Math.abs(ndc.ndcX) <= 1 && Math.abs(ndc.ndcY) <= 1 && numOr(p.intensity, 0) >= numOr(dominant.intensity, 0) * 0.6) count++;
  });
  return count;
}

// ── hard constraints (directive §4.2 — reject a candidate outright) ────────────────────────────
function constraintSafeFrame(ctx, candidate) {
  const bound = FRAME_SAFE_BOUND;
  const cand = normalizeCandidate(candidate);
  const radiusX = circleRadiusNdcFor(FIGURE_WORLD_RADIUS, cand.fov, cand.distance);
  // screenHeightFractionFor returns full-screen fraction, which is also the half-extent in NDC
  // (a 20%-of-screen standee spans 0.4 NDC and extends 0.2 NDC from its center).
  const radiusY = screenHeightFractionFor(MEDIUM_FIGURE_WORLD_HEIGHT, cand.fov, cand.distance);
  // The guide applies to the visible standee, not merely its center point. A3 can replace these
  // medium defaults with each rendered sprite's measured screen rect once the live wiring lands.
  const offenders = ctx.livingNdc.filter((e) => !e.ndc
    || Math.abs(e.ndc.ndcX) + radiusX > bound
    || Math.abs(e.ndc.ndcY) + radiusY > bound);
  return { pass: offenders.length === 0, detail: offenders.map((o) => o.piece.id) };
}
function constraintMediumFigureHeight(candidate) {
  const frac = screenHeightFractionFor(MEDIUM_FIGURE_WORLD_HEIGHT, candidate.fov, candidate.distance);
  if (candidate.mode !== "beat") return { pass: true, detail: { frac, exempt: candidate.mode } };
  return { pass: frac >= MEDIUM_FIGURE_MIN_FRAC && frac <= MEDIUM_FIGURE_MAX_FRAC, detail: frac };
}
function constraintPrimaryOverlap(ctx, candidate) {
  if (!ctx.playerNdc || !ctx.threatNdc) return { pass: true, detail: "no player/threat pair" };
  const r = circleRadiusNdcFor(FIGURE_WORLD_RADIUS, candidate.fov, candidate.distance);
  const d = Math.hypot(ctx.playerNdc.ndcX - ctx.threatNdc.ndcX, ctx.playerNdc.ndcY - ctx.threatNdc.ndcY);
  const overlap = circleOverlapFraction(d, r, r);
  return { pass: overlap <= PRIMARY_OVERLAP_MAX, detail: overlap };
}
function constraintStageEdgeVisible(ctx, candidate) {
  if (candidate.mode === "boss") return { pass: true, detail: "boss mode exempt" };
  if (!ctx.stageCornerNdc.length) return { pass: true, detail: "no stage geometry to check" };
  const visible = ctx.stageCornerNdc.filter(Boolean).some((n) => Math.abs(n.ndcX) <= 1 && Math.abs(n.ndcY) <= 1);
  return { pass: visible, detail: visible };
}
function constraintNeighborRoomAbsent(shotPlan) {
  const activeRoomId = shotPlan.activeRoomId;
  if (activeRoomId == null) return { pass: true, detail: "no active room id to check against" };
  const offenders = (shotPlan.pieces || []).concat(shotPlan.props || [])
    .filter((e) => e.roomSegNum != null && e.roomSegNum !== activeRoomId);
  return { pass: offenders.length === 0, detail: offenders.map((o) => o.id) };
}

// ── per-candidate scoring (composeShot's own unit of work, exported for direct harness use) ────
function scoreCandidate(shotPlan, candidate, project) {
  shotPlan = shotPlan || {};
  const cand = normalizeCandidate(candidate);
  const ctx = buildCandidateCtx(shotPlan, cand, project);
  const terms = {
    subject_separation: scoreSubjectSeparation(ctx),
    primary_threat_visibility: scorePrimaryThreatVisibility(ctx),
    objective_visibility: scoreObjectiveVisibility(ctx),
    focal_light_near_rule_of_thirds: scoreFocalLightNearRuleOfThirds(ctx),
    tray_edge_visibility: scoreTrayEdgeVisibility(ctx),
    foreground_depth_layer: scoreForegroundDepthLayer(shotPlan, cand),
    hard_occlusion_area: penaltyHardOcclusionArea(shotPlan, cand, project),
    subject_overlap: penaltySubjectOverlap(ctx, cand),
    clipped_subject_area: penaltyClippedSubjectArea(ctx, cand),
    empty_frame_area: penaltyEmptyFrameArea(ctx),
    competing_bright_source_count: penaltyCompetingBrightSourceCount(shotPlan, cand, project)
  };
  const total = terms.subject_separation + terms.primary_threat_visibility + terms.objective_visibility
    + terms.focal_light_near_rule_of_thirds + terms.tray_edge_visibility + terms.foreground_depth_layer
    - terms.hard_occlusion_area - terms.subject_overlap - terms.clipped_subject_area
    - terms.empty_frame_area - terms.competing_bright_source_count;
  const constraints = {
    safe_frame: constraintSafeFrame(ctx, cand),
    medium_figure_height: constraintMediumFigureHeight(cand),
    primary_overlap: constraintPrimaryOverlap(ctx, cand),
    stage_edge_visible: constraintStageEdgeVisible(ctx, cand),
    neighbor_room_absent: constraintNeighborRoomAbsent(shotPlan)
  };
  const rejectReasons = Object.keys(constraints).filter((k) => !constraints[k].pass);
  return { id: cand.id, candidate: cand, terms, total, constraints, rejected: rejectReasons.length > 0, rejectReasons };
}

// ── composeShot — the finite candidate search (directive §4.2) ─────────────────────────────────
function composeShot(shotPlan, cameraCandidates, project) {
  shotPlan = shotPlan || {};
  const candidates = (Array.isArray(cameraCandidates) && cameraCandidates.length)
    ? cameraCandidates
    : defaultCameraCandidates(shotPlan, {});
  const scored = candidates.map((c) => scoreCandidate(shotPlan, c, project));
  const eligible = scored.filter((s) => !s.rejected);
  // never return nothing: an all-rejected fixture (every candidate violates a hard constraint) still
  // needs a best-effort camera — falls back to the highest-total REJECTED candidate, with every
  // constraint failure recorded in metrics so a capture/debug tool can see exactly why.
  const pool = eligible.length ? eligible : scored;
  let best = pool[0];
  for (let i = 1; i < pool.length; i++) { if (pool[i].total > best.total) best = pool[i]; }
  const metrics = {
    candidates: scored.map((s) => ({
      id: s.id, yaw: s.candidate.yaw, pitch: s.candidate.pitch, fov: s.candidate.fov, distance: s.candidate.distance,
      terms: s.terms, total: s.total, constraints: s.constraints, rejected: s.rejected, rejectReasons: s.rejectReasons
    })),
    chosenId: best.id,
    allRejected: eligible.length === 0
  };
  const camera = Object.assign({}, best.candidate);
  return { camera, metrics };
}

// ── ES-module bridge (no window/DOM writes here — this file has none of the classic-script global
//    republishing convention its interior/data siblings use; theater-boot.js `import`s this module
//    directly once A3 wires it in, per the module's own header note). ───────────────────────────
export {
  shotPlanFrom, composeShot, defaultCameraCandidates, scoreCandidate,
  scoreSubjectSeparation, scorePrimaryThreatVisibility, scoreObjectiveVisibility,
  scoreFocalLightNearRuleOfThirds, scoreTrayEdgeVisibility, scoreForegroundDepthLayer,
  penaltyHardOcclusionArea, penaltySubjectOverlap, penaltyClippedSubjectArea,
  penaltyEmptyFrameArea, penaltyCompetingBrightSourceCount,
  constraintSafeFrame, constraintMediumFigureHeight, constraintPrimaryOverlap,
  constraintStageEdgeVisible, constraintNeighborRoomAbsent,
  circleOverlapFraction, screenHeightFractionFor, circleRadiusNdcFor,
  DIAGONAL_YAWS_DEG, PITCH_MIN_DEG, PITCH_MAX_DEG, FOV_MIN_DEG, FOV_MAX_DEG,
  SAFE_FRAME_MARGIN, FRAME_SAFE_BOUND, MEDIUM_FIGURE_MIN_FRAC, MEDIUM_FIGURE_MAX_FRAC,
  MEDIUM_FIGURE_WORLD_HEIGHT, FIGURE_WORLD_RADIUS, PRIMARY_OVERLAP_MAX, SHOT_ZONE_PATCH
};
