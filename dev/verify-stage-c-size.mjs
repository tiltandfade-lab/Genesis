/* Verify STAGE-C C1 — SIZE FIDELITY (docs/STAGE-C.md C1).
   src/engine/place-spatialize.js's dspBuildPlanOnce now sizes a room's footprint from the walk
   segment's rolled `dims` string (dspDimsToCells: feet/5 rounded, clamped to
   [SPATIAL_MIN_CELL, SPATIAL_MAX_CELL]) instead of always drawing a blind rng() 4-7 rect — behind
   the reversible SPATIAL_SHAPES flag (default ON). This harness loads the SINGLE module file via
   node's `vm` module (same pattern dev/verify-dungeon-spatialize.mjs uses — no cross-module
   callTimeDeps here), and toggles the sandbox's `SPATIAL_SHAPES` global directly (a real property
   of the vm context object, since it's declared `var` at module top level) to A/B the flag.

   Checks (docs/STAGE-C.md C1 "Verify" list):
     1. ⊗ RED-FIRST — a "60' x 60'" (Grand Octagon, real d200 row 101) segment gets a 12x12
        footprint with SPATIAL_SHAPES ON; OFF renders the pre-C1 random 4-7 rect (proving the
        field really was discarded before this unit).
     2. fallback safety — missing/garbage dims -> the exact rng() 4-7 room, byte-identical to
        SPATIAL_SHAPES OFF for that room (and for the whole plan, since every segment falls back).
     3. determinism — same walkId seed run twice (dims-driven room in the mix) -> byte-identical
        plan (cells buffer + rooms[]).
     4. clamp — an absurd "500' x 500'" dims clamps to SPATIAL_MAX_CELL, no runaway grid.
     5. dims parser W/D ordering — dspDimsToCells unit-tested directly against 6 REAL strings off
        Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Area Type.md (incl. a diameter
        row + two arm-width-parenthetical rows), asserting the exact {wCells,dCells} each yields.

   Run: node dev/verify-stage-c-size.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODULE_PATH = join(ROOT, "src/engine/place-spatialize.js");
const read = (p) => readFileSync(p, "utf-8");

// ─── load src/engine/place-spatialize.js in an isolated vm context ──────────────────────────
function loadModule() {
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(
    read(MODULE_PATH) +
      "\n;this.__spatializePlan=spatializePlan;this.__SPATIAL_CELL=SPATIAL_CELL;" +
      "this.__dspDimsToCells=dspDimsToCells;this.__SPATIAL_MIN_CELL=SPATIAL_MIN_CELL;" +
      "this.__SPATIAL_MAX_CELL=SPATIAL_MAX_CELL;",
    sandbox,
    { filename: "place-spatialize.js" }
  );
  return sandbox; // spatializePlan/SPATIAL_SHAPES/etc. are real properties of this context object
}

// ─── a minimal linear-chain segments[] fixture (walk.js:593-625 shape), one dims string per
//     segment (undefined -> no dims field at all, mirroring a segment that never rolled one) ────
function chainFixture(dimsList) {
  const n = dimsList.length;
  const ids = Array.from({ length: n }, (_, i) => `s${i + 1}`);
  const segments = ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: i === n - 1, depth: i,
    exits: [
      ...(i > 0 ? [{ targetId: ids[i - 1], num: i, label: ids[i - 1], isFinale: i - 1 === n - 1 }] : []),
      ...(i < n - 1 ? [{ targetId: ids[i + 1], num: i + 2, label: ids[i + 1], isFinale: i + 1 === n - 1 }] : []),
    ],
    light: "normal",
    ...(dimsList[i] !== undefined ? { dims: dimsList[i] } : {}),
  }));
  return segments;
}

function roomsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ra = a[i], rb = b[i];
    if (ra.segId !== rb.segId || ra.x !== rb.x || ra.y !== rb.y || ra.w !== rb.w || ra.d !== rb.d) return false;
  }
  return true;
}
function cellsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function main() {
  let pass = 0, fail = 0;
  const check = (name, cond, detail = "") =>
    cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

  console.log("Loading src/engine/place-spatialize.js (vm sandbox) ...");
  const sb = loadModule();
  check("spatializePlan is a function", typeof sb.spatializePlan === "function", typeof sb.spatializePlan);
  check("SPATIAL_SHAPES defaults ON", sb.SPATIAL_SHAPES === true, String(sb.SPATIAL_SHAPES));
  check("SPATIAL_MIN_CELL/SPATIAL_MAX_CELL are numbers", Number.isFinite(sb.__SPATIAL_MIN_CELL) && Number.isFinite(sb.__SPATIAL_MAX_CELL),
    `${sb.__SPATIAL_MIN_CELL} / ${sb.__SPATIAL_MAX_CELL}`);
  console.log(`  SPATIAL_MIN_CELL=${sb.__SPATIAL_MIN_CELL} SPATIAL_MAX_CELL=${sb.__SPATIAL_MAX_CELL}`);

  if (typeof sb.spatializePlan !== "function") {
    console.log(`\n${pass} passed, ${fail} failed — spatializePlan symbol not found, cannot run further checks.`);
    process.exit(1);
  }

  // ── check 1: RED-FIRST — 60'x60' Grand Octagon -> 12x12 footprint (ON), random 4-7 rect (OFF) ─
  console.log("\n[1] RED-FIRST: \"60' x 60'\" (Grand Octagon, d200 row 101) -> 12x12 footprint ON; OFF discards the field");
  {
    const segs = chainFixture([undefined, "60' x 60'"]);
    const walkId = "stage-c1-check1";
    sb.SPATIAL_SHAPES = true;
    const planOn = sb.spatializePlan(segs, "The Spine", { walkId });
    const roomOn = planOn.rooms.find((r) => r.segId === "s2");
    check("ON: Grand Octagon room is 12x12", !!roomOn && roomOn.w === 12 && roomOn.d === 12,
      roomOn ? `w=${roomOn.w} d=${roomOn.d}` : "room not found");
    check("ON: rooms[].dimsRef threads the rolled dims (STAGE-C C1 step 3)",
      !!roomOn && roomOn.dimsRef === "60' x 60'", roomOn ? String(roomOn.dimsRef) : "n/a");

    sb.SPATIAL_SHAPES = false;
    const planOff = sb.spatializePlan(segs, "The Spine", { walkId });
    const roomOff = planOff.rooms.find((r) => r.segId === "s2");
    check("OFF (red-first proof): the SAME 60'x60' segment does NOT get 12x12 — the field is discarded",
      !!roomOff && !(roomOff.w === 12 && roomOff.d === 12),
      roomOff ? `w=${roomOff.w} d=${roomOff.d}` : "room not found");
    check("OFF: falls into the documented rng() 4-7 band",
      !!roomOff && roomOff.w >= 4 && roomOff.w <= 7 && roomOff.d >= 4 && roomOff.d <= 7,
      roomOff ? `w=${roomOff.w} d=${roomOff.d}` : "room not found");
    check("OFF: dimsRef is null (no parse attempted while the flag is off)",
      !!roomOff && roomOff.dimsRef === null, roomOff ? String(roomOff.dimsRef) : "n/a");
    sb.SPATIAL_SHAPES = true; // restore default for later checks
  }

  // ── check 2: fallback safety — missing/garbage dims -> exact rng() 4-7, byte-identical to OFF ─
  console.log("\n[2] fallback safety: missing/garbage dims -> byte-identical to SPATIAL_SHAPES OFF");
  {
    const segs = chainFixture(["", "not a dims string", undefined, "   "]);
    const walkId = "stage-c1-check2";
    sb.SPATIAL_SHAPES = true;
    const planOn = sb.spatializePlan(segs, "The Spine", { walkId });
    sb.SPATIAL_SHAPES = false;
    const planOff = sb.spatializePlan(segs, "The Spine", { walkId });
    sb.SPATIAL_SHAPES = true;
    check("cellW/cellD identical", planOn.cellW === planOff.cellW && planOn.cellD === planOff.cellD,
      `on=${planOn.cellW}x${planOn.cellD} off=${planOff.cellW}x${planOff.cellD}`);
    check("cells buffer byte-identical", cellsEqual(planOn.cells, planOff.cells), "cells buffers differ");
    check("rooms[] (x/y/w/d) byte-identical", roomsEqual(planOn.rooms, planOff.rooms), "room geometry differs");
    check("every room's w/d is in the rng() 4-7 band (no dims parsed anywhere)",
      planOn.rooms.every((r) => r.w >= 4 && r.w <= 7 && r.d >= 4 && r.d <= 7),
      JSON.stringify(planOn.rooms.map((r) => `${r.w}x${r.d}`)));
    check("dspDimsToCells itself returns null for each garbage string",
      ["", "not a dims string", undefined, "   ", null].every((s) => sb.__dspDimsToCells(s) === null),
      "a garbage/absent string parsed to a non-null result");
  }

  // ── check 3: determinism — same walkId twice (a dims-driven room in the mix) -> byte-identical
  console.log("\n[3] determinism: same walkId seed twice (dims-driven room included) -> byte-identical plan");
  {
    const segs = chainFixture(["40' x 40' (10' arms)", undefined, "30' diameter"]);
    const walkId = "stage-c1-check3";
    const p1 = sb.spatializePlan(segs, "The Spine", { walkId });
    const p2 = sb.spatializePlan(segs, "The Spine", { walkId });
    check("cells buffer identical across 2 calls", cellsEqual(p1.cells, p2.cells) && p1.cellW === p2.cellW && p1.cellD === p2.cellD,
      "cells/dims mismatched");
    check("rooms[] identical across 2 calls", roomsEqual(p1.rooms, p2.rooms), "room geometry mismatched");
    check("seed identical across 2 calls", p1.seed === p2.seed, `${p1.seed} vs ${p2.seed}`);
  }

  // ── check 4: clamp — an absurd dims clamps to SPATIAL_MAX_CELL, no runaway grid ──────────────
  console.log("\n[4] clamp: \"500' x 500'\" clamps to SPATIAL_MAX_CELL, no runaway grid");
  {
    const parsed = sb.__dspDimsToCells("500' x 500'");
    check(`dspDimsToCells(\"500' x 500'\") clamps to ${sb.__SPATIAL_MAX_CELL}x${sb.__SPATIAL_MAX_CELL}`,
      !!parsed && parsed.wCells === sb.__SPATIAL_MAX_CELL && parsed.dCells === sb.__SPATIAL_MAX_CELL,
      JSON.stringify(parsed));

    const segs = chainFixture([undefined, "500' x 500'"]);
    const plan = sb.spatializePlan(segs, "The Spine", { walkId: "stage-c1-check4" });
    const room = plan.rooms.find((r) => r.segId === "s2");
    check("the absurd room clamps to SPATIAL_MAX_CELL in a real plan (no runaway grid)",
      !!room && room.w === sb.__SPATIAL_MAX_CELL && room.d === sb.__SPATIAL_MAX_CELL,
      room ? `w=${room.w} d=${room.d}` : "room not found");
    check("overall plan grid stays sane (< 200 cells per axis)", plan.cellW < 200 && plan.cellD < 200,
      `${plan.cellW}x${plan.cellD}`);
  }

  // ── check 5: dims parser W/D ordering — 6 REAL "Dungeon Area Type" table strings ─────────────
  console.log("\n[5] dspDimsToCells W/D ordering — 6 real Dungeon Area Type table strings");
  // Source: Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Area Type.md. Ordering
  // convention lifted verbatim from combat.js's cmDimsToGrid (:26-27): first feet value -> dCells
  // (depth/y-axis), second -> wCells (width/x-axis) — "L x W" convention.
  const tableCases = [
    // [label, dims string, expected {wCells,dCells}]
    ["row 101 Grand Octagon",            "60' x 60'",                   { wCells: 12, dCells: 12 } ],
    ["row 089 Mid-Size Rotunda (diam.)", "30' diameter",                { wCells: 6,  dCells: 6  } ],
    ["row 107 Cross-Shaped Hall (arms)", "40' x 40' (10' arms)",        { wCells: 8,  dCells: 8  } ],
    ["row 057 Standard Chamber",         "20' x 25' rectangle",         { wCells: 5,  dCells: 4  } ],
    ["row 145 Massive Cavern",           "50' x 120' irregular",        { wCells: 24, dCells: 10 } ],
    ["row 102 L-Shaped Chamber (arms)",  "30' x 30' (10' wide arms)",   { wCells: 6,  dCells: 6  } ],
  ];
  for (const [label, dims, expect] of tableCases) {
    const got = sb.__dspDimsToCells(dims);
    check(`${label}: "${dims}" -> wCells=${expect.wCells} dCells=${expect.dCells}`,
      !!got && got.wCells === expect.wCells && got.dCells === expect.dCells,
      `got ${JSON.stringify(got)}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main();
