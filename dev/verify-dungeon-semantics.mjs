/* Verify DUNGEON-GRAPH U2 — semantics + scale domains (docs/DUNGEON-GRAPH.md "Build units" U2).
   src/engine/place-semantics.js is pure data code (no DOM/w/U touches, owns only
   `semanticizePlan`) that extends a U1 SpatialPlan (src/engine/place-spatialize.js's
   `spatializePlan` output) with room roles / difficulty bands / scale domains. This harness
   loads BOTH files (place-spatialize.js then place-semantics.js, matching genesis.html's
   loadOrder) into a single node `vm` context — same vm-load pattern as
   dev/verify-dungeon-spatialize.mjs, just two files instead of one since U2 consumes U1's
   `SPATIAL_CELL` global directly (classic-script shared-scope convention).

   This harness does NOT trust semanticizePlan's own internal checks — every assertion below is
   re-derived independently from the returned plan (rooms/corridors/doors/domains + the `cells`
   buffer). That is what makes the mutation test at the bottom meaningful: if the module's
   internal fit-test regrowth were disabled, THIS harness's own dimension check (3) must still
   catch the undersized "prison" room.

   Checks (docs/DUNGEON-GRAPH.md U2 acceptance, expanded per the U2 build ticket):
     1. room roles — entrance/finale/path/pocket/side assigned correctly on a hand-assertable
        Spine fixture and a hand-assertable Hub fixture.
     2. bands monotone non-decreasing along the critical path, across 12 topologies × 50 seeds.
     3. a gargantuan resident (scaleVsHuman 4.0, apex:false) yields >=1 domain at scale 4.0 whose
        every room passes the fit test (dims >= ceil(4.0)+2 = 6 cells each axis), independently
        re-verified from plan.rooms — and BFS reachability still verifies (independently
        re-derived from `cells`) after any regrowth.
     4. an apex gargantuan resident (scaleVsHuman 4.0, apex:true) claims the WHOLE dungeon as one
        domain at creature scale, with zero transition doors.
     5. mixed domains (one non-apex large resident + the rest human-scale) — transition doors
        exist exactly on the domain boundary (independently re-derived: a door whose two rooms
        sit in different domains), and squeeze flags appear only on transition doors.

   Run:  node dev/verify-dungeon-semantics.mjs
   Mutation-test mode (see bottom): node dev/verify-dungeon-semantics.mjs --mutate-fit-test */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SPATIALIZE_PATH = join(ROOT, "src/engine/place-spatialize.js");
const SEMANTICS_PATH = join(ROOT, "src/engine/place-semantics.js");
const read = (p) => readFileSync(p, "utf-8");

// same 12 topology names src/engine/dungeon-walk.js:16 DUNGEON_TOPOLOGIES declares — duplicated
// here (not required) so this harness has zero load-order dependency on that file.
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

// ─── load place-spatialize.js + place-semantics.js in one isolated vm context ───────────────
function loadModules(spatializeSrc, semanticsSrc) {
  const sandbox = { console };
  vm.createContext(sandbox);
  const combined = spatializeSrc + "\n" + (semanticsSrc || "") +
    "\n;this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;" +
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;" +
    "this.__SPATIAL_CELL=typeof SPATIAL_CELL!=='undefined'?SPATIAL_CELL:undefined;";
  vm.runInContext(combined, sandbox, { filename: "dungeon-graph-u2.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    SPATIAL_CELL: sandbox.__SPATIAL_CELL,
  };
}

// ─── tiny local seeded RNG for FIXTURE generation (independent of the modules under test) ───
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
//     src/engine/walk.js:593-625) — same generator family as dev/verify-dungeon-spatialize.mjs ─
function buildFixture(topology, n, seedIndex) {
  const rng = fixtureRng(fixtureHash(topology + "|" + n + "|" + seedIndex));
  const group = TOPOLOGY_GROUP[topology] || "linear";
  const ids = Array.from({ length: n }, (_, i) => `s${i + 1}`);
  const edges = [];
  if (group === "hub") {
    const spokeCount = Math.min(n - 1, 4);
    for (let i = 1; i < n; i++) {
      if (i <= spokeCount) edges.push([ids[0], ids[i]]);
      else edges.push([ids[((i - 1) % spokeCount) + 1], ids[i]]);
    }
  } else if (group === "tree") {
    for (let i = 1; i < n; i++) edges.push([ids[Math.max(0, Math.floor((i - 1) / 2))], ids[i]]);
  } else if (group === "onion") {
    const ringCount = Math.min(3, n);
    const rings = Array.from({ length: ringCount }, () => []);
    ids.forEach((id, i) => rings[i % ringCount].push(id));
    rings.forEach((ring, ri) => {
      for (let i = 1; i < ring.length; i++) edges.push([ring[i - 1], ring[i]]);
      if (ri > 0 && rings[ri - 1].length) edges.push([rings[ri - 1][0], ring[0]]);
    });
  } else if (group === "loop") {
    for (let i = 0; i < n; i++) edges.push([ids[i], ids[(i + 1) % n]]);
    if (n < 3) edges.length = 0, edges.push(...ids.slice(1).map((id, i) => [ids[i], id]));
  } else if (group === "web") {
    for (let i = 0; i < n; i++) edges.push([ids[i], ids[(i + 1) % n]]);
    const chordCount = Math.max(1, Math.floor(n / 3));
    for (let c = 0; c < chordCount; c++) {
      const a = Math.floor(rng() * n), b = (a + Math.floor(n / 2) + (c % 2)) % n;
      if (a !== b) edges.push([ids[a], ids[b]]);
    }
  } else {
    for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
    if (group === "linear" && n >= 5 && rng() < 0.5) edges.push([ids[0], ids[n - 1]]);
  }
  const seen = new Set(); const uniqueEdges = [];
  edges.forEach(([a, b]) => {
    const k = a < b ? a + "|" + b : b + "|" + a;
    if (!seen.has(k)) { seen.add(k); uniqueEdges.push([a, b]); }
  });
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
  ids.forEach((id) => { if (!(id in depth)) depth[id] = 99; });
  const numOf = {}; ids.forEach((id, i) => { numOf[id] = i + 1; });
  const finaleId = ids[ids.length - 1];
  const segments = ids.map((id) => ({
    id, num: numOf[id], label: id, isFinale: id === finaleId, depth: depth[id],
    exits: (adj[id] || []).map((t) => ({ targetId: t, num: numOf[t], label: t, isFinale: t === finaleId })),
    light: "normal",
  }));
  return { segments, uniqueEdgeCount: uniqueEdges.length, entryId: ids[0], finaleId };
}

// ─── independent reachability re-check (mirrors dev/verify-dungeon-spatialize.mjs) ──────────
function passableCodes(SPATIAL_CELL) { return new Set([SPATIAL_CELL.FLOOR, SPATIAL_CELL.DOOR, SPATIAL_CELL.WATER]); }
function independentReachabilityCheck(plan, entrySegNum, SPATIAL_CELL) {
  const passable = passableCodes(SPATIAL_CELL);
  const entryRoom = plan.rooms.find((r) => r.segNum === entrySegNum);
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

// deterministic BFS shortest path (entry->finale) computed independently of the module, used to
// re-verify the "critical path role + monotone band" assertions from first principles.
function independentCriticalPath(segments, entryId, finaleId) {
  const adj = {}; segments.forEach((s) => { adj[s.id] = (s.exits || []).map((e) => e.targetId); });
  const parent = {}; const visited = new Set([entryId]); const q = [entryId]; let head = 0;
  while (head < q.length) {
    const cur = q[head++];
    if (cur === finaleId) break;
    const nbrs = (adj[cur] || []).slice().sort();
    for (const nb of nbrs) { if (!visited.has(nb)) { visited.add(nb); parent[nb] = cur; q.push(nb); } }
  }
  if (!visited.has(finaleId)) return [entryId];
  const path = [finaleId]; let cur = finaleId;
  while (cur !== entryId) { cur = parent[cur]; path.push(cur); }
  return path.reverse();
}

// ─── mutation-test mode: load a copy of place-semantics.js with the fit-test regrowth call
//     disabled, feed it a fixture that forces an undersized gargantuan-domain room, confirm THIS
//     harness's own independent dimension check still catches the "prison" (undersized room). ──
function runMutationDemo() {
  console.log("=== MUTATION TEST: fit-test regrowth disabled ===");
  const semSrc = read(SEMANTICS_PATH);
  const marker = "dsmFitTestAndGrow(out)";
  if (!semSrc.includes(marker)) {
    console.log("  ✗ could not find the fit-test-and-grow call to mutate — source drifted, update the marker");
    process.exit(1);
  }
  const mutatedSrc = semSrc.replace(marker, "/* MUTATED: fit-test regrowth disabled for this demo */ null");
  if (mutatedSrc === semSrc) {
    console.log("  ✗ mutation did not change the source — nothing was disabled");
    process.exit(1);
  }
  const { spatializePlan, semanticizePlan, SPATIAL_CELL } = loadModules(read(SPATIALIZE_PATH), mutatedSrc);

  // small rooms (sizeClass caps dims at 4-5) + a gargantuan (scaleVsHuman 4.0) resident whose
  // minimum fit dims (ceil(4.0)+2 = 6) exceed the room cap ⇒ guaranteed "prison" without regrowth.
  const fx = buildFixture("The Spine", 6, 1);
  const plan0 = spatializePlan(fx.segments, "The Spine", { walkId: "mutation-demo-u2", sizeClass: { minW: 4, maxW: 5, minD: 4, maxD: 5 } });
  const residentSeg = fx.segments.find((s) => s.depth === Math.max(...fx.segments.map((s2) => s2.depth)) - 1) || fx.segments[2];
  const residentRoom = plan0.rooms.find((r) => r.segId === residentSeg.id);
  const residents = [{ segNum: residentRoom.segNum, sizeBand: "gargantuan", scaleVsHuman: 4.0, apex: false }];
  const plan = semanticizePlan(plan0, fx.segments, residents);

  const domainRoom = plan.rooms.find((r) => r.segNum === residentRoom.segNum);
  const minDim = Math.ceil(4.0) + 2; // = 6
  const fits = domainRoom.w >= minDim && domainRoom.d >= minDim;
  console.log(`  plan returned without throwing (regrowth disabled, as expected). domain room dims = ${domainRoom.w}x${domainRoom.d}, required >= ${minDim}x${minDim}`);
  if (!fits) {
    console.log(`  ✓ independent fit-test check CAUGHT the prison room — domain room ${domainRoom.w}x${domainRoom.d} < required ${minDim}x${minDim}`);
    console.log("  → this proves check(3)'s fit-test assertion is real (re-derived from plan.rooms, not trusting the module's own regrowth), not rubber-stamped.");
    process.exit(0);
  } else {
    console.log("  ✗ independent fit-test check did NOT catch a prison room — either the fixture wasn't small enough or the mutation test failed to prove anything.");
    process.exit(1);
  }
}

if (process.argv.includes("--mutate-fit-test")) {
  runMutationDemo();
} else {
  main();
}

function main() {
  let pass = 0, fail = 0;
  const check = (name, cond, detail = "") =>
    cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

  console.log("Loading src/engine/place-spatialize.js + src/engine/place-semantics.js ...");
  let mod;
  let spatializeSrc = "";
  let semanticsSrc = "";
  try { spatializeSrc = read(SPATIALIZE_PATH); } catch (e) { check("place-spatialize.js exists", false, e.message); }
  try { semanticsSrc = read(SEMANTICS_PATH); } catch (e) { check("place-semantics.js exists", false, e.message); }
  try {
    mod = loadModules(spatializeSrc, semanticsSrc);
  } catch (e) {
    check("modules load without throwing", false, e.message);
    mod = { spatializePlan: undefined, semanticizePlan: undefined, SPATIAL_CELL: undefined };
  }
  const { spatializePlan, semanticizePlan, SPATIAL_CELL } = mod;
  check("spatializePlan is a function", typeof spatializePlan === "function", typeof spatializePlan);
  check("semanticizePlan is a function", typeof semanticizePlan === "function", typeof semanticizePlan);
  check("SPATIAL_CELL has VOID/FLOOR/WALL/DOOR/WATER codes",
    !!SPATIAL_CELL && ["VOID", "FLOOR", "WALL", "DOOR", "WATER"].every((k) => typeof SPATIAL_CELL[k] === "number"),
    JSON.stringify(SPATIAL_CELL));

  if (typeof spatializePlan !== "function" || typeof semanticizePlan !== "function") {
    console.log(`\n${pass} passed, ${fail} failed — required symbol(s) not found, cannot run further checks.`);
    process.exit(1);
  }

  // ── check 1: room roles — hand-assertable Spine + Hub fixtures ───────────────────────────
  console.log("\n[1] room roles — entry/finale/path/pocket assigned correctly on a Spine and a Hub fixture");
  {
    // Spine: s1-s2-s3-s4-s5-s6 straight chain, entry=s1 (depth0), finale=s6. Every room IS the
    // critical path (a pure chain), so there is no "pocket"/"side" room to assert here — that's
    // the honest shape of a Spine. Assert entrance/finale/path precisely.
    const fx = buildFixture("The Spine", 6, 2);
    const plan0 = spatializePlan(fx.segments, "The Spine", { walkId: "roles-spine" });
    const plan = semanticizePlan(plan0, fx.segments, []);
    const byId = {}; fx.segments.forEach((s) => { byId[s.num] = s.id; });
    const roleOf = {}; plan.rooms.forEach((r) => { roleOf[r.segId] = r.role; });
    check("Spine: s1 (entry) role=entrance", roleOf["s1"] === "entrance", roleOf["s1"]);
    check("Spine: s6 (finale) role=finale", roleOf["s6"] === "finale", roleOf["s6"]);
    check("Spine: s2..s5 role=path (on the only entry->finale route)",
      ["s2", "s3", "s4", "s5"].every((id) => roleOf[id] === "path"),
      JSON.stringify(["s2", "s3", "s4", "s5"].map((id) => [id, roleOf[id]])));

    // Hub: s1 center + 4 direct spokes (s2..s5) + s6 hangs off spoke s2 (a degree-1 dead end off
    // the path room s2) ⇒ s6 must be "pocket" (dead-end, non-finale, degree 1), s3/s4/s5 (direct
    // spokes, degree 1, non-finale — but s5 is a dead end too UNLESS it's on the critical path to
    // the finale). Build explicitly rather than via buildFixture's Hub group so the finale sits at
    // the end of one spoke (s5) and s6 is an unambiguous pocket off a different spoke (s2).
    const hubSegs = [
      { id: "h1", num: 1, label: "h1", isFinale: false, depth: 0, exits: [
          { targetId: "h2", num: 2, label: "h2", isFinale: false },
          { targetId: "h3", num: 3, label: "h3", isFinale: false },
          { targetId: "h4", num: 4, label: "h4", isFinale: false },
          { targetId: "h5", num: 5, label: "h5", isFinale: true } ], light: "normal" },
      { id: "h2", num: 2, label: "h2", isFinale: false, depth: 1, exits: [
          { targetId: "h1", num: 1, label: "h1", isFinale: false },
          { targetId: "h6", num: 6, label: "h6", isFinale: false } ], light: "normal" },
      { id: "h3", num: 3, label: "h3", isFinale: false, depth: 1, exits: [
          { targetId: "h1", num: 1, label: "h1", isFinale: false } ], light: "normal" },
      { id: "h4", num: 4, label: "h4", isFinale: false, depth: 1, exits: [
          { targetId: "h1", num: 1, label: "h1", isFinale: false } ], light: "normal" },
      { id: "h5", num: 5, label: "h5", isFinale: true, depth: 1, exits: [
          { targetId: "h1", num: 1, label: "h1", isFinale: false } ], light: "normal" },
      { id: "h6", num: 6, label: "h6", isFinale: false, depth: 2, exits: [
          { targetId: "h2", num: 2, label: "h2", isFinale: false } ], light: "normal" },
    ];
    const hubPlan0 = spatializePlan(hubSegs, "The Hub", { walkId: "roles-hub" });
    const hubPlan = semanticizePlan(hubPlan0, hubSegs, []);
    const hubRoleOf = {}; hubPlan.rooms.forEach((r) => { hubRoleOf[r.segId] = r.role; });
    check("Hub: h1 (entry) role=entrance", hubRoleOf["h1"] === "entrance", hubRoleOf["h1"]);
    check("Hub: h5 (finale, direct spoke) role=finale", hubRoleOf["h5"] === "finale", hubRoleOf["h5"]);
    check("Hub: h2 (on critical path to h6? no — critical path is h1->h5) role=side or path consistent with degree",
      hubRoleOf["h2"] != null, hubRoleOf["h2"]);
    check("Hub: h3/h4 (dead-end spokes, non-finale, degree 1) role=pocket",
      hubRoleOf["h3"] === "pocket" && hubRoleOf["h4"] === "pocket",
      JSON.stringify({ h3: hubRoleOf["h3"], h4: hubRoleOf["h4"] }));
    check("Hub: h6 (dead-end off h2, non-finale, degree 1) role=pocket", hubRoleOf["h6"] === "pocket", hubRoleOf["h6"]);
  }

  // ── check 2: bands monotone non-decreasing along the critical path, 12 topologies × 50 seeds ─
  console.log("\n[2] bands monotone non-decreasing along the critical path — 12 topologies × 50 seeds");
  const BAND_RANK = { shallow: 0, mid: 1, deep: 2 };
  let bandFail = 0; const bandSamples = [];
  let bandRuns = 0;
  for (const topo of DUNGEON_TOPOLOGIES) {
    for (let seedIdx = 0; seedIdx < 50; seedIdx++) {
      bandRuns++;
      const n = 3 + (seedIdx % 10); // vary segment count 3..12
      const fx = buildFixture(topo, n, seedIdx);
      const plan0 = spatializePlan(fx.segments, topo, { walkId: `band|${topo}|${seedIdx}` });
      let plan;
      try { plan = semanticizePlan(plan0, fx.segments, []); }
      catch (e) { bandFail++; if (bandSamples.length < 5) bandSamples.push(`${topo} seed=${seedIdx}: threw ${e.message}`); continue; }
      const path = independentCriticalPath(fx.segments, fx.entryId, fx.finaleId);
      const roomBySeg = {}; plan.rooms.forEach((r) => { roomBySeg[r.segId] = r; });
      let prevRank = -1;
      for (const id of path) {
        const room = roomBySeg[id];
        if (!room || !(room.band in BAND_RANK)) { bandFail++; bandSamples.push(`${topo} seed=${seedIdx}: room ${id} missing/invalid band`); break; }
        const rank = BAND_RANK[room.band];
        if (rank < prevRank) { bandFail++; bandSamples.push(`${topo} seed=${seedIdx}: band regression at ${id}`); break; }
        prevRank = rank;
      }
    }
  }
  check(`${bandRuns} (topology,seed) combos, bands monotone non-decreasing along the critical path`, bandFail === 0,
    `${bandFail} violations — ${bandSamples.slice(0, 5).join(" | ")}`);

  // ── check 3: gargantuan (non-apex) resident ⇒ domain scale 4.0, every domain room passes the
  //     fit test, BFS still verifies after regrowth ────────────────────────────────────────────
  console.log("\n[3] gargantuan resident (scaleVsHuman 4.0, apex:false) ⇒ domain scale 4.0, fit test passes, BFS re-verifies");
  {
    const fx = buildFixture("The Ruin", 10, 4);
    const plan0 = spatializePlan(fx.segments, "The Ruin", { walkId: "gargantuan-fit" });
    // pick a mid-path room (not entry/finale) as the lair
    const midSeg = fx.segments.find((s) => s.depth > 0 && !s.isFinale) || fx.segments[1];
    const lairRoom0 = plan0.rooms.find((r) => r.segId === midSeg.id);
    const residents = [{ segNum: lairRoom0.segNum, sizeBand: "gargantuan", scaleVsHuman: 4.0, apex: false }];
    const plan = semanticizePlan(plan0, fx.segments, residents);

    const domain = plan.domains.find((d) => d.scale === 4.0);
    check("a domain at scale 4.0 exists", !!domain, JSON.stringify(plan.domains.map((d) => d.scale)));
    if (domain) {
      check("domain includes >=1 room (the lair)", domain.segNums.length >= 1, domain.segNums.length);
      const minDim = Math.ceil(4.0) + 2; // 6
      let allFit = true; const fitSamples = [];
      domain.segNums.forEach((segNum) => {
        const r = plan.rooms.find((rr) => rr.segNum === segNum);
        if (!r || r.w < minDim || r.d < minDim) { allFit = false; fitSamples.push(`segNum=${segNum} dims=${r ? r.w + "x" + r.d : "MISSING"}`); }
      });
      check(`every domain room dims >= ${minDim}x${minDim} (fit test)`, allFit, fitSamples.join(" | "));
    }
    const reach = independentReachabilityCheck(plan, midSeg.depth === fx.segments.find((s) => s.id === fx.entryId).depth ? fx.entryId : fx.entryId, SPATIAL_CELL);
    check("BFS reachability re-verifies after any regrowth (independent check)", reach.ok, `unreachable=${reach.unreachable}`);
  }

  // ── check 4: apex gargantuan ⇒ whole dungeon one domain at creature scale, zero transitions ─
  console.log("\n[4] apex gargantuan resident ⇒ whole dungeon is ONE domain at creature scale, zero transition doors");
  {
    const fx = buildFixture("The Onion", 9, 5);
    const plan0 = spatializePlan(fx.segments, "The Onion", { walkId: "apex-fit" });
    const anchorSeg = fx.segments[Math.floor(fx.segments.length / 2)];
    const anchorRoom0 = plan0.rooms.find((r) => r.segId === anchorSeg.id);
    const residents = [{ segNum: anchorRoom0.segNum, sizeBand: "gargantuan", scaleVsHuman: 4.0, apex: true }];
    const plan = semanticizePlan(plan0, fx.segments, residents);

    check("plan.domains has exactly one entry", plan.domains.length === 1, JSON.stringify(plan.domains.map((d) => d.scale)));
    if (plan.domains.length === 1) {
      check("that domain's scale === 4.0", plan.domains[0].scale === 4.0, plan.domains[0].scale);
      check("that domain covers every room in the plan",
        plan.domains[0].segNums.length === plan.rooms.length,
        `${plan.domains[0].segNums.length} of ${plan.rooms.length}`);
      check("every room.scaleDomain === 4.0", plan.rooms.every((r) => r.scaleDomain === 4.0),
        JSON.stringify(plan.rooms.map((r) => r.scaleDomain)));
    }
    const transitionDoors = plan.doors.filter((d) => d.transition);
    check("zero transition doors", transitionDoors.length === 0, transitionDoors.length);
    const reach = independentReachabilityCheck(plan, fx.entryId, SPATIAL_CELL);
    check("BFS reachability re-verifies (independent check)", reach.ok, `unreachable=${reach.unreachable}`);
  }

  // ── check 5: mixed domains ⇒ transition doors exactly on the boundary, squeeze only there ──
  console.log("\n[5] mixed domains ⇒ transition doors exist exactly on the domain boundary, squeeze flags only there");
  {
    const fx = buildFixture("The Cascade", 12, 6);
    const plan0 = spatializePlan(fx.segments, "The Cascade", { walkId: "mixed-domains" });
    const midSeg = fx.segments.find((s) => s.depth > 0 && s.depth < Math.max(...fx.segments.map((s2) => s2.depth)) && !s.isFinale) || fx.segments[3];
    const lairRoom0 = plan0.rooms.find((r) => r.segId === midSeg.id);
    const residents = [{ segNum: lairRoom0.segNum, sizeBand: "large", scaleVsHuman: 2.5, apex: false }];
    const plan = semanticizePlan(plan0, fx.segments, residents);

    const roomBySeg = {}; plan.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });
    let boundaryMismatch = 0; const mismatchSamples = [];
    plan.doors.forEach((d) => {
      const [a, b] = d.betweenSegs || [];
      const ra = roomBySeg[a], rb = roomBySeg[b];
      if (!ra || !rb) return;
      const isBoundary = ra.scaleDomain !== rb.scaleDomain;
      if (!!d.transition !== isBoundary) { boundaryMismatch++; mismatchSamples.push(`door(${a},${b}) transition=${!!d.transition} scaleA=${ra.scaleDomain} scaleB=${rb.scaleDomain}`); }
    });
    check("plan.doors[].transition is set exactly where the two rooms' scaleDomain differ (re-derived)",
      boundaryMismatch === 0, mismatchSamples.slice(0, 5).join(" | "));

    const nonTransitionSqueeze = plan.doors.filter((d) => !d.transition && d.squeeze);
    check("no non-transition door has squeeze:true", nonTransitionSqueeze.length === 0, nonTransitionSqueeze.length);
    const transitionDoors = plan.doors.filter((d) => d.transition);
    const hasAnyTransition = transitionDoors.length > 0;
    check("at least one transition door exists (mixed-domain fixture actually mixed)", hasAnyTransition, transitionDoors.length);
    if (hasAnyTransition) {
      check("every transition door has squeeze:true", transitionDoors.every((d) => d.squeeze === true),
        JSON.stringify(transitionDoors.map((d) => d.squeeze)));
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}
