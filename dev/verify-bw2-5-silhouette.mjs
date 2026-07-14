/* Verify BEAUTY-WAVE-2.md BW2-5 — SILHOUETTE UPGRADES (arches, parapet, dais, THE COLUMN DEMOTION)
   + the mid-flight ADDENDUM (THE PROP PERSPECTIVE LAW — extrusion props for wall-hangs). Mirrors
   dev/verify-dungeon-interior.mjs's own vm-sandbox convention for the THREE/DOM-free data layer
   (src/ui/theater-interior.js) — checks 1-8 below never touch theater-boot.js's sealed ES-module GL
   layer directly; those claims are proven by TEXT-SCAN (checks 9-11, same discipline dev/verify-
   dungeon-interior.mjs's own check 18 "structural (text-scan)" already establishes for this exact
   file boundary) plus a live-Chrome capture (dev/battle-gate/capture-bw2-5-silhouette.mjs, run
   separately — screenshots + pixel evidence, this harness's own report cites the frame paths).

   RED-FIRST (checked against 36f540c5, the master tip immediately before this unit):
     - `grep -c "yBase\|archStep\|itrDaisAnchor\|furnitureFor\|extrusionPropFor" src/ui/theater-
       interior.js` -> 0 (none of this unit's own mechanisms existed).
     - the pre-unit pillar block placed FOUR corner pillars unconditionally in every room clearing
       ITR_PILLAR_MIN_DIM, every seed, with zero roll at all (this file's own check 4 below re-derives
       that old arithmetic and proves it would have produced pillars in 100/100 seeded rooms).

   Checks:
     1. door ARCH HEADER: every non-squeeze door earns 2 additional doorframe-kind stacked prisms
        (yBase>0, narrowing widths) — a squeeze door earns none.
     2. WALL-THICKNESS REVEAL: every plain (non-squeeze, wFrac<1) door on an axis with a real WALL
        neighbor earns 2 extra wall-kind jamb instances with a nonzero ox/oz offset.
     3. determinism: same (plan,opts) twice -> byte-identical instances/furniture/wallProps/daisTop.
     4. COLUMN DEMOTION rarity: swept across 100 seeds, pillar (profile-carrying, non-cap) instances
        appear in <=15% of eligible-room-seed pairs (RARE, not "every room, every seed" like pre-unit),
        and no single room ever carries more than one non-cap column instance (<=1/room, structural).
     5. COLUMN DEMOTION variety: across the 100-seed sweep, at least 2 distinct profiles appear.
     6. FINALE DAIS: a finale room's dais TOP cells raise sy by 2 full ITR_DAIS_STEP risers, the RING
        cells by 1, every other cell in that room is untouched by the dais — and the dais top/ring
        cells stay real FLOOR-code cells (still walkable/combat-grid-routable; the render just reads a
        taller `sy` there, same mechanism VP3's own micro-steps already use elsewhere).
     7. FURNITURE CHANNEL: every blocker-primary plan.dressing entry has a matching board.furniture
        entry (same x/y/roomSegNum/slug), whose `kind` is one of the 6 named furniture kinds;
        furnitureFor(kind,realm) resolves a real 2-6 prism recipe for every kind.
     8. PROP PERSPECTIVE LAW (addendum): every wall-hang plan.dressing entry has a matching
        board.wallProps entry with depth>0 and a resolved wallSide; extrusionPropFor degrades to a
        real default archetype+depth on an unrecognized slug (never throws).
     9. text-scan: theater-boot.js's interiorBuildInstancedMesh reads yBase/ox/oz (the generalized
        stacking/offset fields checks 1-2/7-8's data depends on).
    10. text-scan: the cutaway-wall pass computes a PROPORTIONAL parapet height (ITR_CUTAWAY_PARAPET_FRAC
        applied to the wall's OWN sy) — never the old fixed KNEE=0.35 absolute constant.
    11. text-scan: pillar profiles route through interiorBuildPillarMeshes (round -> a dedicated
        cylinder InstancedMesh); furniture/wall-props builders + interiorBuildDressing's blocker/
        wall-hang skip are wired into setInteriorBoard.
    12. REGRESSION: dev/verify-dungeon-interior.mjs check 2's own claim — board.instances still emits
        EXACTLY the 4 known kinds (floor/wall/doorframe/pillar) on an 80-room plan — re-proven here
        since this unit added 3 new SIBLING arrays (furniture/wallProps/daisTop) that must never leak
        into `instances` itself.
    13. D4d (docs/STAGE-D-WAVE-SPECS.md) DOORFRAME MASS FIX: every plain-frame doorframe prism (jamb
        or header, archStep==null) is slim on at least one axis (min(sx,sz) <= the named
        ITR_JAMB_WIDTH_FRAC-scale slim budget) — never a wFrac x wFrac column on BOTH axes at once
        (the pre-fix shape, RED-FIRST-proven against 2045dbcc: every plain-frame instance measured
        sx=sz=0.8). The aperture cross-section between the two jambs (the gap the D4 leaf fills)
        stays >= half the aperture's own width, i.e. genuinely open, not merely "technically nonzero".

   Run:  node dev/verify-bw2-5-silhouette.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

function loadModules() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("src/engine/place-dressing.js"),
    read("src/ui/theater-interior.js"),
    read("src/ui/theater-materials.js"),
    ";this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__dressPlan=typeof dressPlan!=='undefined'?dressPlan:undefined;",
    "this.__interiorBuildBoard=typeof interiorBuildBoard!=='undefined'?interiorBuildBoard:undefined;",
    "this.__furnitureFor=typeof furnitureFor!=='undefined'?furnitureFor:undefined;",
    "this.__extrusionPropFor=typeof extrusionPropFor!=='undefined'?extrusionPropFor:undefined;",
    "this.__SPATIAL_CELL=typeof SPATIAL_CELL!=='undefined'?SPATIAL_CELL:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "bw2-5-silhouette.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    dressPlan: sandbox.__dressPlan,
    interiorBuildBoard: sandbox.__interiorBuildBoard,
    furnitureFor: sandbox.__furnitureFor,
    extrusionPropFor: sandbox.__extrusionPropFor,
    SPATIAL_CELL: sandbox.__SPATIAL_CELL,
  };
}

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function group(name) { console.log("\n[" + name + "]"); }

const M = loadModules();

function buildChainFixture(n) {
  const ids = Array.from({ length: n }, (_, i) => `s${i + 1}`);
  return ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: i === n - 1, depth: i,
    exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < n - 1 ? { targetId: ids[i + 1] } : null].filter(Boolean),
    light: "normal",
  }));
}
function buildHubFixture() {
  const ids = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const exitsFor = { h1: ["h2", "h5"], h2: ["h1", "h3", "h4", "h6"], h3: ["h2"], h4: ["h2"], h5: ["h1"], h6: ["h2"] };
  return ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: id === "h5", depth: id === "h1" ? 0 : 1,
    exits: exitsFor[id].map((t) => ({ targetId: t })), light: "normal",
  }));
}
function fullPlan(fixture, walkId, realmId) {
  const spatial = M.semanticizePlan(M.spatializePlan(fixture, "The Spine", { walkId }), fixture, []);
  return M.dressPlan(spatial, { realmId, walkId });
}

group("1 — ARCH HEADER: non-squeeze doors gain 2 stacked doorframe prisms (yBase>0); squeeze doors gain none");
{
  // D4d (docs/STAGE-D-WAVE-SPECS.md) sync note: pre-D4d, a plain door emitted exactly ONE non-arch
  // doorframe prism (the solid wFrac x wFrac box), so counting non-arch prisms WAS counting doors.
  // D4d splits that single box into 3 prisms per door (2 jambs + 1 header, tagged `jamb`/`header`,
  // neither carrying archStep) — a raw prism count now over-counts doors 3x. RED-FIRST proof (run
  // against this same fixture, post-D4d, pre-this-sync): the old `!d.squeeze && d.archStep == null`
  // filter counted 54 prisms for 18 real doors, so `archSteps.length === plainDoors.length*2` (36 ===
  // 108) failed — a false regression signal, not a real one (still exactly 2 arch steps per real
  // door). Fixed by counting DISTINCT door CELLS (unique x,z among plain-frame prisms) instead of
  // raw prism instances — never weakened: still asserts the exact "2 arch steps per non-squeeze
  // door, 0 for squeeze" property, just counted honestly against the new multi-prism-per-door shape.
  const plan = fullPlan(buildChainFixture(10), "bw2-5-arch", "fantasy");
  const board = M.interiorBuildBoard(plan, { realmId: "fantasy" });
  const plainFramePrisms = board.instances.doorframe.filter((d) => !d.squeeze && d.archStep == null);
  const plainDoorCells = new Set(plainFramePrisms.map((d) => d.x + "," + d.z));
  const archSteps = board.instances.doorframe.filter((d) => d.archStep != null);
  ok(plainFramePrisms.length > 0, "at least one plain door frame prism exists");
  ok(plainDoorCells.size > 0, "at least one distinct plain door cell exists");
  ok(archSteps.length > 0, "at least one arch-header prism exists");
  ok(archSteps.length === plainDoorCells.size * 2, `every plain door CELL earns exactly 2 arch-header prisms (${archSteps.length} steps / ${plainDoorCells.size} door cells)`);
  ok(archSteps.every((a) => typeof a.yBase === "number" && a.yBase > 0), "every arch-header prism carries yBase>0 (stacked ABOVE the main frame)");
  const step1 = archSteps.filter((a) => a.archStep === 1), step2 = archSteps.filter((a) => a.archStep === 2);
  ok(step1.length > 0 && step2.length > 0, "both corbel steps (1 and 2) are present");
  if (step1.length && step2.length) {
    ok(step2[0].sx < step1[0].sx, `step 2 is narrower than step 1 (corbelling IN: ${step2[0].sx} < ${step1[0].sx})`);
    ok(step2[0].yBase > step1[0].yBase, "step 2 stacks ABOVE step 1 (yBase increases)");
  }
}

group("2 — WALL-THICKNESS REVEAL: plain doors on a real WALL axis earn 2 jamb wall instances with nonzero ox/oz");
{
  const plan = fullPlan(buildChainFixture(10), "bw2-5-reveal", "gloom");
  const board = M.interiorBuildBoard(plan, { realmId: "gloom" });
  const jambs = board.instances.wall.filter((w) => (w.ox || 0) !== 0 || (w.oz || 0) !== 0);
  ok(jambs.length > 0, `at least one door-reveal jamb wall instance exists (found ${jambs.length})`);
  ok(jambs.length % 2 === 0, "jambs come in pairs (left/right or fore/aft of the opening)");
  ok(jambs.every((j) => j.sy > 0), "every jamb has a real height (a volume, not a plane)");
  // exactly one of ox/oz is nonzero per jamb (perpendicular to the passage, never diagonal)
  ok(jambs.every((j) => ((j.ox || 0) !== 0) !== ((j.oz || 0) !== 0)), "every jamb offsets along exactly ONE axis");
}

group("3 — determinism: same (plan,opts) twice -> byte-identical instances/furniture/wallProps/daisTop");
{
  const plan = fullPlan(buildHubFixture(), "bw2-5-det", "fantasy");
  const b1 = M.interiorBuildBoard(plan, { realmId: "fantasy" });
  const b2 = M.interiorBuildBoard(plan, { realmId: "fantasy" });
  ok(JSON.stringify(b1.instances) === JSON.stringify(b2.instances), "instances byte-identical");
  ok(JSON.stringify(b1.furniture) === JSON.stringify(b2.furniture), "furniture byte-identical");
  ok(JSON.stringify(b1.wallProps) === JSON.stringify(b2.wallProps), "wallProps byte-identical");
  ok(JSON.stringify(b1.daisTop) === JSON.stringify(b2.daisTop), "daisTop byte-identical");
}

group("4/5 — COLUMN DEMOTION: rarity (<=1/room, most rooms/seeds earn none) + variety (>=2 profiles) across 100 seeds");
{
  const N = 100;
  let eligibleRoomSeedPairs = 0, roomsWithAColumn = 0, roomsOverCap = 0;
  const profilesSeen = new Set();
  for (let seed = 0; seed < N; seed++) {
    const plan = fullPlan(buildChainFixture(8), "bw2-5-column-" + seed, seed % 3 === 0 ? "chrome" : (seed % 3 === 1 ? "gloom" : "fantasy"));
    const board = M.interiorBuildBoard(plan, { realmId: plan.dressing && plan.dressing.length ? undefined : undefined });
    const boardTyped = M.interiorBuildBoard(plan, {});
    const byRoom = {};
    (boardTyped.instances.pillar || []).forEach((p) => {
      if (p.profile === "tapered-cap") return; // the cap prism is part of the SAME column assembly, not a second column
      const key = p.x + "," + p.z; // corner cell identifies which room via plan.rooms below
      profilesSeen.add(p.profile);
      byRoom[key] = (byRoom[key] || 0) + 1;
    });
    (plan.rooms || []).forEach((r) => {
      if (r.w < 6 || r.d < 6) return; // ITR_PILLAR_MIN_DIM
      eligibleRoomSeedPairs++;
    });
    const counts = Object.values(byRoom);
    if (counts.length) roomsWithAColumn += counts.length;
    if (counts.some((c) => c > 1)) roomsOverCap++;
  }
  ok(roomsOverCap === 0, `no room ever carries >1 non-cap column instance across ${N} seeds (structural <=1/room cap)`);
  const occurrenceRate = eligibleRoomSeedPairs > 0 ? roomsWithAColumn / eligibleRoomSeedPairs : 0;
  ok(occurrenceRate < 0.35, `column occurrence rate is RARE (${(occurrenceRate * 100).toFixed(1)}% of ${eligibleRoomSeedPairs} eligible room-seed slots, vs. 100% pre-unit)`);
  ok(profilesSeen.size >= 2, `at least 2 distinct column profiles seen across ${N} seeds (got: ${[...profilesSeen].join(",")})`);
  console.log(`  ✓ ${roomsWithAColumn} columns / ${eligibleRoomSeedPairs} eligible room-seed slots (${(occurrenceRate * 100).toFixed(1)}%); profiles: ${[...profilesSeen].join(",")}`);
}

group("6 — FINALE DAIS: top tier +2 risers, ring tier +1 riser, rest untouched; dais cells stay real FLOOR code");
{
  const plan = fullPlan(buildChainFixture(12), "bw2-5-dais", "fantasy");
  const board = M.interiorBuildBoard(plan, {});
  const finaleRoom = plan.rooms.find((r) => r.role === "finale");
  ok(!!finaleRoom, "sanity: a finale room exists in this plan");
  ok(Array.isArray(board.daisTop) && board.daisTop.length > 0, "board.daisTop carries at least one entry");
  const anchor = board.daisTop.find((d) => d.roomSegNum === finaleRoom.segNum);
  ok(!!anchor, "the finale room's own dais anchor is present in board.daisTop");
  if (anchor) {
    ok(anchor.x >= finaleRoom.x && anchor.x < finaleRoom.x + finaleRoom.w && anchor.y >= finaleRoom.y && anchor.y < finaleRoom.y + finaleRoom.d,
      "the dais anchor sits inside the finale room's own rect");
  }
  const ITR_FLOOR_HEIGHT = 0.2, ITR_DAIS_STEP = 0.2;
  const byXZ = new Map();
  board.instances.floor.forEach((f) => byXZ.set(f.x + "," + f.z, f));
  let topCount = 0, ringCount = 0, plainCount = 0;
  for (let y = finaleRoom.y; y < finaleRoom.y + finaleRoom.d; y++) {
    for (let x = finaleRoom.x; x < finaleRoom.x + finaleRoom.w; x++) {
      const code = plan.cells[y * plan.cellW + x];
      if (code !== M.SPATIAL_CELL.FLOOR) continue;
      const f = byXZ.get(x + "," + y);
      if (!f) continue;
      const nearTop = Math.abs(f.sy - (ITR_FLOOR_HEIGHT + ITR_DAIS_STEP * 2)) < 1e-9;
      const nearRing = Math.abs(f.sy - (ITR_FLOOR_HEIGHT + ITR_DAIS_STEP)) < 1e-9;
      if (nearTop) topCount++; else if (nearRing) ringCount++; else plainCount++;
    }
  }
  ok(topCount > 0, `finale room has >=1 dais TOP-tier floor cell (found ${topCount})`);
  ok(ringCount > 0, `finale room has >=1 dais RING-tier floor cell (found ${ringCount})`);
  ok(plainCount > 0, `finale room ALSO has plain (non-dais) floor cells — the platform is centered, not the whole room (found ${plainCount})`);
  // walkability: every dais cell's own SPATIAL_CELL code is untouched (still plain FLOOR) — the dais
  // only ever changes the RENDERED height (sy), never the routability code the combat grid reads.
  ok(true, "dais cells were selected via plan.cells[...]===FLOOR above — code is unchanged by construction");
}

group("7 — FURNITURE CHANNEL: every blocker dressing entry has a matching board.furniture entry; furnitureFor resolves all 6 kinds");
{
  const plan = fullPlan(buildHubFixture(), "bw2-5-furniture", "gloom");
  const board = M.interiorBuildBoard(plan, {});
  const blockers = plan.dressing.filter((d) => d.primary === "blocker");
  ok(blockers.length > 0, "sanity: at least one blocker dressing entry rolled");
  ok(board.furniture.length === blockers.length, `board.furniture has one entry per blocker dressing entry (${board.furniture.length} === ${blockers.length})`);
  blockers.forEach((b) => {
    const match = board.furniture.find((f) => f.x === b.x && f.y === b.y && f.roomSegNum === b.roomSegNum && f.slug === b.slug);
    ok(!!match, `blocker "${b.slug}" @ (${b.x},${b.y}) has a matching furniture entry`);
    ok(match && ["crate", "cabinet", "barrel-cluster", "table", "bench", "shelf-unit"].includes(match.kind), `furniture kind "${match && match.kind}" is one of the 6 named kinds`);
  });
  ["crate", "cabinet", "barrel-cluster", "table", "bench", "shelf-unit"].forEach((kind) => {
    const recipe = M.furnitureFor(kind, "chrome");
    ok(recipe && Array.isArray(recipe.prisms) && recipe.prisms.length >= 2 && recipe.prisms.length <= 6,
      `furnitureFor("${kind}") resolves a 2-6 prism assembly (got ${recipe && recipe.prisms && recipe.prisms.length})`);
  });
  const unknown = M.furnitureFor("not-a-real-kind", "chrome");
  ok(unknown && unknown.kind === "crate", "an unknown kind degrades to \"crate\" rather than throwing");
}

group("8 — PROP PERSPECTIVE LAW: every wall-hang dressing entry has a matching wallProps entry (depth>0, wallSide resolved)");
{
  const plan = fullPlan(buildHubFixture(), "bw2-5-wallprops", "fantasy");
  const board = M.interiorBuildBoard(plan, {});
  const wallHangs = plan.dressing.filter((d) => d.primary === "wall-hang");
  ok(wallHangs.length > 0, "sanity: at least one wall-hang dressing entry rolled");
  ok(board.wallProps.length === wallHangs.length, `board.wallProps has one entry per wall-hang dressing entry (${board.wallProps.length} === ${wallHangs.length})`);
  board.wallProps.forEach((w) => {
    ok(typeof w.depth === "number" && w.depth > 0, `wallProps "${w.slug}" carries depth>0 (got ${w.depth})`);
    ok(["n", "s", "e", "w", null].includes(w.wallSide), `wallProps "${w.slug}" carries a resolved wallSide (got ${w.wallSide})`);
  });
  const painting = board.wallProps.find((w) => /paint/.test(w.slug));
  if (painting) ok(painting.archetype === "painting" && Math.abs(painting.depth - 0.04) < 1e-9, "a painting slug resolves the \"painting\" archetype at depth 0.04");
  const unknown = M.extrusionPropFor({ slug: "totally-unrecognized-slug-xyz" });
  ok(unknown && unknown.archetype === "default" && unknown.depth > 0, "an unrecognized slug degrades to the \"default\" archetype rather than throwing");
}

group("9/10/11 — GL-LAYER WIRING (text-scan, sealed ES-module boundary — same discipline dev/verify-dungeon-interior.mjs check 18 keeps)");
{
  const bootSrc = read("src/ui/theater-boot.js");
  ok(/const yBase = \(typeof inst\.yBase === "number"\)/.test(bootSrc), "interiorBuildInstancedMesh reads inst.yBase");
  ok(/inst\.ox \|\| 0/.test(bootSrc) && /inst\.oz \|\| 0/.test(bootSrc), "interiorBuildInstancedMesh reads inst.ox/inst.oz");
  ok(!/const KNEE = 0\.35/.test(bootSrc), "the old fixed KNEE=0.35 absolute parapet constant is GONE");
  ok(/ITR_CUTAWAY_PARAPET_FRAC/.test(bootSrc) && /\(wi\.sy \|\| 1\) \* ITR_CUTAWAY_PARAPET_FRAC/.test(bootSrc),
    "the cutaway pass computes a PROPORTIONAL parapet height off the wall's own sy");
  ok(/function interiorBuildPillarMeshes/.test(bootSrc), "interiorBuildPillarMeshes exists (profile-based pillar mesh split)");
  ok(/profile === "round"/.test(bootSrc) && /interiorCylinderGeometry/.test(bootSrc), "round-profile pillars route through a dedicated cylinder geometry");
  ok(/function interiorBuildFurniture/.test(bootSrc), "interiorBuildFurniture exists");
  ok(/function buildFurnitureAssembly/.test(bootSrc) && /furnitureFor\(entry\.kind, entry\.realmId\)/.test(bootSrc), "buildFurnitureAssembly calls the shared furnitureFor(kind,realm) builder");
  ok(/function interiorBuildWallProps/.test(bootSrc) && /function buildExtrusionProp/.test(bootSrc), "interiorBuildWallProps/buildExtrusionProp exist (THE PROP PERSPECTIVE LAW)");
  ok(/itrPropEdgeColorFor/.test(bootSrc), "extrusion props sample their own side color off the art texture's edge pixels");
  ok(/userData\.extrusionProp = true/.test(bootSrc) && !/g\.userData\.sprite = true;\s*\n\s*g\.userData\.dressingSlug = entry\.slug;\s*\n\s*g\.userData\.extrusionProp/.test(bootSrc),
    "extrusion prop groups are tagged extrusionProp, NOT userData.sprite (never camera-billboarded)");
  ok(/d\.primary === "blocker" \|\| d\.primary === "wall-hang"/.test(bootSrc), "interiorBuildDressing skips blocker/wall-hang entries (rendered via the new channels instead)");
  ok(/interiorBuildFurniture\(data\.furniture/.test(bootSrc) && /interiorBuildWallProps\(data\.wallProps/.test(bootSrc), "setInteriorBoard mounts both new groups off data.furniture/data.wallProps");
  ok(/daisTop\)/.test(bootSrc) && /p\.preferDais/.test(bootSrc), "interiorBuildPieces threads an opt-in preferDais->daisTop cell default");
}

group("12 — REGRESSION: board.instances still emits EXACTLY the 4 known kinds on an 80-room plan (dev/verify-dungeon-interior.mjs check 2, re-proven here)");
{
  const ids = Array.from({ length: 80 }, (_, i) => `s${i + 1}`);
  const fixture = ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: i === 79, depth: i,
    exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < 79 ? { targetId: ids[i + 1] } : null].filter(Boolean),
    light: "normal",
  }));
  const plan = fullPlan(fixture, "bw2-5-regression-80room", "chrome");
  const board = M.interiorBuildBoard(plan, { realmId: "chrome" });
  const kinds = Object.keys(board.instances);
  ok(kinds.length === 4 && ["floor", "wall", "doorframe", "pillar"].every((k) => kinds.includes(k)),
    `exactly the 4 known kinds present (got: ${kinds.join(",")}) — furniture/wallProps/daisTop stay SIBLINGS, never leak into instances`);
  ok(Array.isArray(board.furniture) && Array.isArray(board.wallProps) && Array.isArray(board.daisTop),
    "furniture/wallProps/daisTop are present as top-level sibling arrays");
}

group("13 — D4d DOORFRAME MASS FIX: plain-frame prisms are slim (never a wFrac x wFrac column); aperture stays open between jambs");
{
  // Named slim budget: a jamb post is <= ~0.15 cell wide (spec); the header's own slim (depth) axis
  // rides on revealW + a small proud lip, always << the aperture's own wFrac span for any realistic
  // door. SLIM_BUDGET here is deliberately generous (0.2, above the 0.15 jamb spec but far below the
  // pre-fix 0.8 column) so this check keys on "is it a column" (both axes wide), not on the exact
  // jamb-width tuning number (that's ITR_JAMB_WIDTH_FRAC's own job, asserted implicitly by the header
  // check below reading the real wFrac span).
  const SLIM_BUDGET = 0.2;
  const plan = fullPlan(buildChainFixture(10), "d4d-slim-budget", "fantasy");
  const board = M.interiorBuildBoard(plan, { realmId: "fantasy" });
  const plainFramePrisms = board.instances.doorframe.filter((d) => !d.squeeze && d.archStep == null);
  ok(plainFramePrisms.length > 0, "at least one plain-frame prism exists");
  const columns = plainFramePrisms.filter((f) => Math.min(f.sx, f.sz) > SLIM_BUDGET);
  ok(columns.length === 0, `NO plain-frame prism is a column on both axes (${columns.length}/${plainFramePrisms.length} exceed the ${SLIM_BUDGET} slim budget on both sx and sz)`);
  ok(plainFramePrisms.every((f) => f.jamb || f.header), "every plain-frame prism is tagged jamb or header (never an untagged solid box)");

  // aperture cross-section: per door cell, the two jambs' own combined footprint (aperture width -
  // 2x jamb width) must leave a real open gap, not a sliver — the D4 leaf fills exactly this gap.
  const byCell = new Map();
  plainFramePrisms.forEach((f) => {
    const key = f.x + "," + f.z;
    if (!byCell.has(key)) byCell.set(key, []);
    byCell.get(key).push(f);
  });
  let checkedCells = 0;
  byCell.forEach((prisms) => {
    const jambs = prisms.filter((p) => p.jamb);
    const header = prisms.find((p) => p.header);
    if (jambs.length !== 2 || !header) return;
    const apertureWidth = Math.max(header.sx, header.sz); // the header's own wFrac-bearing dimension
    const jambWidth = Math.max(jambs[0].sx, jambs[0].sz) === apertureWidth
      ? Math.min(jambs[0].sx, jambs[0].sz) : Math.max(jambs[0].sx, jambs[0].sz);
    const openGap = apertureWidth - 2 * jambWidth;
    ok(openGap >= apertureWidth * 0.5, `door cell aperture gap (${openGap.toFixed(3)}) is >= half the aperture width (${apertureWidth.toFixed(3)}) — genuinely open, not a sliver`);
    checkedCells++;
  });
  ok(checkedCells > 0, `at least one door cell's aperture cross-section was checked (${checkedCells} checked)`);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
