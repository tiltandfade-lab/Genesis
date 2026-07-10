/* Verify DUNGEON-GRAPH U1 — the spatializer (docs/DUNGEON-GRAPH.md "Build units" U1).
   src/engine/place-spatialize.js is pure data code (no DOM/w/U touches, owns only
   `spatializePlan` + `SPATIAL_CELL`) — this harness loads that SINGLE file via node's `vm`
   module rather than the full jsdom genesis.html bootstrap the DOM-touching verify-*.mjs
   scripts use (dev/verify-dm-events.mjs etc.): simpler, and correct for a module with zero
   cross-module callTimeDeps.

   This harness does NOT trust spatializePlan's own internal BFS verifier — every check below
   re-derives reachability independently from the returned `cells` buffer. That's what makes
   the mutation test (see bottom of file, `--mutate-verifier`) meaningful: if the module's
   internal check were disabled, THIS harness must still catch a bad plan.

   Checks (docs/DUNGEON-GRAPH.md U1 acceptance):
     1. all 12 DUNGEON_TOPOLOGIES × segment counts 3/6/12 × 100 seeds each produce verified
        plans, zero unreachable FLOOR cells (independently re-verified here).
     2. determinism — same walk id twice ⇒ byte-identical cells buffer.
     3. Hub layout is radial (spoke-room centroid angles spread > 60° apart).
     4. Web crossing edges emit bridge:true corridors; no non-bridge corridor's cells overlap
        another non-bridge corridor's cells.
     5. corridors exist ONLY where the graph has edges (corridor count == unique edge count).

   Run:  node dev/verify-dungeon-spatialize.mjs
   Mutation-test mode (see bottom): node dev/verify-dungeon-spatialize.mjs --mutate-verifier */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODULE_PATH = join(ROOT, "src/engine/place-spatialize.js");
const read = (p) => readFileSync(p, "utf-8");

// the same 12 topology names src/engine/dungeon-walk.js:16 DUNGEON_TOPOLOGIES declares —
// duplicated here (not required) so this harness has zero load-order dependency on that file.
const DUNGEON_TOPOLOGIES = [
  "The Spine", "The Branch", "The Cascade", "The Ruin", "The Loop", "The Hub",
  "The Stronghold", "The Figure-8", "The Convergence", "The Onion", "The Web", "The Labyrinth Fragment",
];
const TOPOLOGY_GROUP = {
  "The Hub": "hub", "The Stronghold": "hub",
  "The Onion": "onion",
  "The Spine": "linear", "The Cascade": "linear", "The Ruin": "linear",
  "The Convergence": "linear", "The Figure-8": "linear",
  "The Loop": "loop",
  "The Branch": "tree",
  "The Web": "web", "The Labyrinth Fragment": "web",
};

// ─── load src/engine/place-spatialize.js in an isolated vm context ──────────────────────────
function loadModule(sourceText) {
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(sourceText + "\n;this.__spatializePlan=spatializePlan;this.__SPATIAL_CELL=SPATIAL_CELL;", sandbox, { filename: "place-spatialize.js" });
  return { spatializePlan: sandbox.__spatializePlan, SPATIAL_CELL: sandbox.__SPATIAL_CELL };
}

// ─── tiny local seeded RNG for FIXTURE generation (independent of the module under test) ────
function fixtureHash(s) {
  let h = 5381;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return h >>> 0;
}
function fixtureRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── build a synthetic walk.segments[] fixture (id/num/label/isFinale/depth/exits/light shape,
//     src/engine/walk.js:593-625) for a given topology + segment count + seed index ──────────
function buildFixture(topology, n, seedIndex) {
  const rng = fixtureRng(fixtureHash(topology + "|" + n + "|" + seedIndex));
  const group = TOPOLOGY_GROUP[topology] || "linear";
  const ids = Array.from({ length: n }, (_, i) => `s${i + 1}`);
  const edges = []; // [a,b] pairs, undirected
  if (group === "hub") {
    const spokeCount = Math.min(n - 1, 4); // keep spoke count small so >60° spread is achievable
    for (let i = 1; i < n; i++) {
      if (i <= spokeCount) edges.push([ids[0], ids[i]]);
      else edges.push([ids[((i - 1) % spokeCount) + 1], ids[i]]); // attach overflow to a spoke
    }
  } else if (group === "tree") {
    for (let i = 1; i < n; i++) edges.push([ids[Math.max(0, Math.floor((i - 1) / 2))], ids[i]]);
  } else if (group === "onion") {
    // three rough concentric rings; each ring internally chained, one bridge edge to the ring inward.
    const ringCount = Math.min(3, n);
    const rings = Array.from({ length: ringCount }, () => []);
    ids.forEach((id, i) => rings[i % ringCount].push(id));
    rings.forEach((ring, ri) => {
      for (let i = 1; i < ring.length; i++) edges.push([ring[i - 1], ring[i]]);
      if (ri > 0 && rings[ri - 1].length) edges.push([rings[ri - 1][0], ring[0]]);
    });
  } else if (group === "loop") {
    for (let i = 0; i < n; i++) edges.push([ids[i], ids[(i + 1) % n]]);
    if (n < 3) edges.length = 0, edges.push(...ids.slice(1).map((id, i) => [ids[i], id])); // fallback chain
  } else if (group === "web") {
    for (let i = 0; i < n; i++) edges.push([ids[i], ids[(i + 1) % n]]); // ring base
    const chordCount = Math.max(1, Math.floor(n / 3));
    for (let c = 0; c < chordCount; c++) {
      const a = Math.floor(rng() * n), b = (a + Math.floor(n / 2) + (c % 2)) % n;
      if (a !== b) edges.push([ids[a], ids[b]]);
    }
  } else { // linear: Spine/Cascade/Ruin/Convergence/Figure-8
    for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
    if ((group === "linear") && n >= 5 && rng() < 0.5) edges.push([ids[0], ids[n - 1]]); // occasional loop-back
  }
  // dedupe
  const seen = new Set(); const uniqueEdges = [];
  edges.forEach(([a, b]) => {
    const k = a < b ? a + "|" + b : b + "|" + a;
    if (!seen.has(k)) { seen.add(k); uniqueEdges.push([a, b]); }
  });
  // adjacency + BFS depth from s1 (entry)
  const adj = {}; ids.forEach((id) => { adj[id] = []; });
  uniqueEdges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const depth = {}; const order = [];
  const q = [{ id: ids[0], d: 0 }]; const seenBfs = new Set();
  while (q.length) {
    const { id, d } = q.shift();
    if (seenBfs.has(id)) continue;
    seenBfs.add(id); order.push(id); depth[id] = d;
    (adj[id] || []).forEach((nb) => { if (!seenBfs.has(nb)) q.push({ id: nb, d: d + 1 }); });
  }
  // any node BFS didn't reach (shouldn't happen for these generators, but stay honest) gets Infinity depth
  ids.forEach((id) => { if (!(id in depth)) depth[id] = 99; });
  const numOf = {}; ids.forEach((id, i) => { numOf[id] = i + 1; });
  const finaleId = ids[ids.length - 1];
  const segments = ids.map((id) => ({
    id, num: numOf[id], label: id, isFinale: id === finaleId, depth: depth[id],
    exits: (adj[id] || []).map((t) => ({ targetId: t, num: numOf[t], label: t, isFinale: t === finaleId })),
    light: "normal",
  }));
  return { segments, uniqueEdgeCount: uniqueEdges.length, entryId: ids[0] };
}

// ─── independent reachability re-check (does NOT trust the module's own verifier) ───────────
function passableCodes(SPATIAL_CELL) { return new Set([SPATIAL_CELL.FLOOR, SPATIAL_CELL.DOOR, SPATIAL_CELL.WATER]); }
function independentReachabilityCheck(plan, entryId, SPATIAL_CELL) {
  const passable = passableCodes(SPATIAL_CELL);
  const entryRoom = plan.rooms.find((r) => r.segId === entryId);
  if (!entryRoom) return { ok: false, unreachable: -1, reason: "no entry room in plan" };
  const idx = (x, y) => y * plan.cellW + x;
  const sx = Math.min(plan.cellW - 1, Math.max(0, entryRoom.x + Math.floor(entryRoom.w / 2)));
  const sy = Math.min(plan.cellD - 1, Math.max(0, entryRoom.y + Math.floor(entryRoom.d / 2)));
  const cells = plan.cells;
  if (!passable.has(cells[idx(sx, sy)])) return { ok: false, unreachable: -1, reason: "entry cell not passable" };
  const seen = new Uint8Array(plan.cellW * plan.cellD);
  const q = [[sx, sy]]; seen[idx(sx, sy)] = 1; let head = 0;
  while (head < q.length) {
    const [cx, cy] = q[head++];
    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) continue;
      const ii = idx(nx, ny);
      if (seen[ii] || !passable.has(cells[ii])) continue;
      seen[ii] = 1; q.push([nx, ny]);
    }
  }
  let unreachable = 0;
  for (let i = 0; i < cells.length; i++) if (cells[i] === SPATIAL_CELL.FLOOR && !seen[i]) unreachable++;
  return { ok: unreachable === 0, unreachable };
}

function uniqueEdgeCountFromSegments(segments) {
  const seen = new Set();
  segments.forEach((s) => {
    (s.exits || []).forEach((e) => {
      const k = s.id < e.targetId ? s.id + "|" + e.targetId : e.targetId + "|" + s.id;
      seen.add(k);
    });
  });
  return seen.size;
}

// ─── mutation-test mode: load a copy of the source with the internal BFS-fail throw disabled,
//     feed it a guaranteed-disconnected fixture, confirm THIS harness's independent check still
//     catches the unreachable plan. Separate CLI mode — not part of the gating acceptance run. ─
function runMutationDemo() {
  console.log("=== MUTATION TEST: internal BFS verifier disabled ===");
  const src = read(MODULE_PATH);
  const marker = "if (unreachable > 0) throw new Error(`unreachable FLOOR cells:";
  if (!src.includes(marker)) {
    console.log("  ✗ could not find the verifier throw line to mutate — source drifted, update the marker");
    process.exit(1);
  }
  const mutatedSrc = src.replace(
    /if \(unreachable > 0\) throw new Error\(`unreachable FLOOR cells:[^`]*`\);/,
    "/* MUTATED: verifier disabled for this demo */"
  );
  if (mutatedSrc === src) {
    console.log("  ✗ mutation regex did not match — nothing was disabled");
    process.exit(1);
  }
  const { spatializePlan, SPATIAL_CELL } = loadModule(mutatedSrc);

  // guaranteed-disconnected fixture: s1-s2-s3 chain (entry s1) + a totally isolated s4 (no edges
  // at all) — with the internal verifier disabled, spatializePlan must return a plan where s4's
  // room is a FLOOR island no corridor reaches.
  const segments = [
    { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0, exits: [{ targetId: "s2", num: 2, label: "s2", isFinale: false }], light: "normal" },
    { id: "s2", num: 2, label: "s2", isFinale: false, depth: 1, exits: [{ targetId: "s1", num: 1, label: "s1", isFinale: false }, { targetId: "s3", num: 3, label: "s3", isFinale: false }], light: "normal" },
    { id: "s3", num: 3, label: "s3", isFinale: false, depth: 2, exits: [{ targetId: "s2", num: 2, label: "s2", isFinale: false }], light: "normal" },
    { id: "s4", num: 4, label: "s4", isFinale: true, depth: 99, exits: [], light: "normal" }, // isolated island
  ];
  const plan = spatializePlan(segments, "The Spine", { walkId: "mutation-demo" });
  const result = independentReachabilityCheck(plan, "s1", SPATIAL_CELL);
  console.log(`  plan returned without throwing (verifier disabled, as expected). rooms=${plan.rooms.length} cells=${plan.cellW}x${plan.cellD}`);
  if (!result.ok) {
    console.log(`  ✓ independent reachability check CAUGHT the bad plan — unreachable FLOOR cells: ${result.unreachable}`);
    console.log("  → this proves check(1)'s reachability assertion is real (re-derived from `cells`, not trusting the module's self-report), not rubber-stamped.");
    process.exit(0);
  } else {
    console.log("  ✗ independent reachability check did NOT catch the bad plan — the mutation test FAILED to prove the verifier is meaningful.");
    process.exit(1);
  }
}

if (process.argv.includes("--mutate-verifier")) {
  runMutationDemo();
} else {
  main();
}

function main() {
  let pass = 0, fail = 0;
  const check = (name, cond, detail = "") =>
    cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

  console.log("Loading src/engine/place-spatialize.js ...");
  let mod;
  try {
    mod = loadModule(read(MODULE_PATH));
  } catch (e) {
    check("module loads without throwing", false, e.message);
    mod = { spatializePlan: undefined, SPATIAL_CELL: undefined };
  }
  const { spatializePlan, SPATIAL_CELL } = mod;
  check("spatializePlan is a function", typeof spatializePlan === "function", typeof spatializePlan);
  check("SPATIAL_CELL has VOID/FLOOR/WALL/DOOR/WATER codes",
    !!SPATIAL_CELL && ["VOID", "FLOOR", "WALL", "DOOR", "WATER"].every((k) => typeof SPATIAL_CELL[k] === "number"),
    JSON.stringify(SPATIAL_CELL));

  if (typeof spatializePlan !== "function") {
    console.log(`\n${pass} passed, ${fail} failed — spatializePlan symbol not found, cannot run further checks.`);
    process.exit(1);
  }

  // ── check 1: all 12 topologies × 3/6/12 segments × 100 seeds ⇒ verified, zero unreachable ──
  console.log("\n[1] all 12 topologies × segCounts 3/6/12 × 100 seeds ⇒ verified plans, zero unreachable FLOOR cells");
  let totalRuns = 0, totalThrows = 0, totalUnreachable = 0;
  const throwSamples = [], unreachableSamples = [];
  for (const topo of DUNGEON_TOPOLOGIES) {
    for (const n of [3, 6, 12]) {
      for (let seedIdx = 0; seedIdx < 100; seedIdx++) {
        totalRuns++;
        const fx = buildFixture(topo, n, seedIdx);
        let plan;
        try {
          plan = spatializePlan(fx.segments, topo, { walkId: `${topo}|${n}|${seedIdx}` });
        } catch (e) {
          totalThrows++;
          if (throwSamples.length < 5) throwSamples.push(`${topo} n=${n} seed=${seedIdx}: ${e.message}`);
          continue;
        }
        const r = independentReachabilityCheck(plan, fx.entryId, SPATIAL_CELL);
        if (!r.ok) {
          totalUnreachable++;
          if (unreachableSamples.length < 5) unreachableSamples.push(`${topo} n=${n} seed=${seedIdx}: unreachable=${r.unreachable} reason=${r.reason || ""}`);
        }
      }
    }
  }
  check(`${totalRuns} plans generated, 0 thrown honest-fails`, totalThrows === 0,
    `${totalThrows} threw — samples: ${throwSamples.join(" | ")}`);
  check(`${totalRuns} plans, 0 with unreachable FLOOR cells`, totalUnreachable === 0,
    `${totalUnreachable} had unreachable cells — samples: ${unreachableSamples.join(" | ")}`);

  // ── check 2: determinism — same walk id twice ⇒ byte-identical cells buffer ──────────────
  console.log("\n[2] determinism — same walk id twice ⇒ byte-identical cells buffer");
  let detFail = 0;
  const detSamples = [];
  for (const topo of ["The Hub", "The Web", "The Spine", "The Branch", "The Loop"]) {
    for (const n of [3, 6, 12]) {
      const fx = buildFixture(topo, n, 7);
      const walkId = `det-check|${topo}|${n}`;
      const p1 = spatializePlan(fx.segments, topo, { walkId });
      const p2 = spatializePlan(fx.segments, topo, { walkId });
      const same = p1.cellW === p2.cellW && p1.cellD === p2.cellD && p1.cells.length === p2.cells.length
        && p1.cells.every((v, i) => v === p2.cells[i]) && p1.seed === p2.seed;
      if (!same) { detFail++; detSamples.push(`${topo} n=${n}`); }
    }
  }
  check("15 (topology,n) combos, cells buffer identical across 2 calls with same walkId", detFail === 0,
    `${detFail} mismatched — ${detSamples.join(", ")}`);

  // ── check 3: Hub layout is radial (spoke centroid angle spread > 60°) ────────────────────
  console.log("\n[3] Hub layout is radial — spoke-room centroid angles spread > 60° apart");
  const hubFx = buildFixture("The Hub", 6, 3); // hub s1 + 4 direct spokes + 1 attached to a spoke
  const hubPlan = spatializePlan(hubFx.segments, "The Hub", { walkId: "hub-spread-check" });
  const hubRoom = hubPlan.rooms.find((r) => r.segId === hubFx.entryId);
  const hubCx = hubRoom.x + hubRoom.w / 2, hubCy = hubRoom.y + hubRoom.d / 2;
  // direct spokes = segments at depth 1 in the fixture
  const spokeIds = hubFx.segments.filter((s) => s.depth === 1).map((s) => s.id);
  const spokeAngles = spokeIds.map((id) => {
    const r = hubPlan.rooms.find((rr) => rr.segId === id);
    const cx = r.x + r.w / 2, cy = r.y + r.d / 2;
    return Math.atan2(cy - hubCy, cx - hubCx) * (180 / Math.PI);
  }).sort((a, b) => a - b);
  let minGap = Infinity;
  for (let i = 0; i < spokeAngles.length; i++) {
    const a = spokeAngles[i], b = spokeAngles[(i + 1) % spokeAngles.length];
    let gap = b - a; if (gap < 0) gap += 360;
    if (spokeAngles.length === 1) gap = 360; // single spoke — no adjacent gap to measure
    minGap = Math.min(minGap, gap);
  }
  check(`${spokeIds.length} direct spokes, min angular gap between neighbors > 60° (got ${minGap.toFixed(1)}°)`,
    spokeIds.length >= 2 ? minGap > 60 : true, `angles=${spokeAngles.map((a) => a.toFixed(1)).join(",")}`);

  // ── check 4: Web crossings ⇒ bridge:true, non-bridge corridors never share cells ─────────
  console.log("\n[4] Web crossing edges emit bridge:true corridors; no non-bridge corridor overlaps another");
  let webBridgeSeen = 0, webOverlapViolation = 0;
  const webSamples = [];
  for (let seedIdx = 0; seedIdx < 40; seedIdx++) {
    const fx = buildFixture("The Web", 8, seedIdx);
    const plan = spatializePlan(fx.segments, "The Web", { walkId: `web-bridge|${seedIdx}` });
    const bridges = plan.corridors.filter((c) => c.bridge);
    if (bridges.length) webBridgeSeen++;
    const nonBridge = plan.corridors.filter((c) => !c.bridge);
    for (let i = 0; i < nonBridge.length; i++) {
      const setI = new Set(nonBridge[i].cells.map((c) => c.x + "," + c.y));
      for (let j = i + 1; j < nonBridge.length; j++) {
        const overlap = nonBridge[j].cells.some((c) => setI.has(c.x + "," + c.y));
        if (overlap) { webOverlapViolation++; webSamples.push(`seed=${seedIdx} corridors[${i}]∩corridors[${j}]`); }
      }
    }
  }
  check(`at least one of 40 Web seeds produced a bridge:true corridor (got ${webBridgeSeen}/40)`, webBridgeSeen > 0);
  check("no two non-bridge corridors share a cell, across all 40 Web seeds", webOverlapViolation === 0,
    `${webOverlapViolation} violations — ${webSamples.slice(0, 5).join(" | ")}`);

  // ── check 5: corridors exist ONLY where the graph has edges (count == edge count) ────────
  console.log("\n[5] corridor count == unique graph edge count (never an invented edge)");
  let edgeMismatch = 0;
  const edgeSamples = [];
  for (const topo of DUNGEON_TOPOLOGIES) {
    for (const n of [3, 6, 12]) {
      const fx = buildFixture(topo, n, 11);
      const plan = spatializePlan(fx.segments, topo, { walkId: `edge-count|${topo}|${n}` });
      const expected = uniqueEdgeCountFromSegments(fx.segments);
      if (plan.corridors.length !== expected) {
        edgeMismatch++;
        edgeSamples.push(`${topo} n=${n}: corridors=${plan.corridors.length} edges=${expected}`);
      }
    }
  }
  check(`36 (topology,n) combos, corridors.length === unique edge count`, edgeMismatch === 0,
    `${edgeMismatch} mismatched — ${edgeSamples.slice(0, 5).join(" | ")}`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}
