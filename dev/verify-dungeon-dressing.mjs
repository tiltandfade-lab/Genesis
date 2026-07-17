/* Verify GRAPHICS-ENGINE.md GR2 — the DRESSING CARD CHANNEL (docs/GRAPHICS-ENGINE.md Part I law 4
   CARD LAW + Part II §C/§D). src/engine/place-dressing.js is pure data code (no THREE/DOM — see its
   own header) that turns a spatializePlan()/semanticizePlan() output into plan.dressing=[{slug,x,y,
   primary,cardKind,roomSegNum,lightAffine?}]. This harness loads place-spatialize.js + place-
   semantics.js + place-dressing.js into one node `vm` context — same vm-load pattern as dev/verify-
   dungeon-interior.mjs/dev/verify-dungeon-semantics.mjs use for U1/U2/U3 — for checks 1-3+5 (pure
   DATA layer, no GL). Check 4 (render mount) drives the REAL app in real headless Chrome — the SAME
   GL-layer boundary dev/verify-dungeon-interior.mjs's own header note draws ("GL-layer checks... are
   NOT re-implemented [in the vm harness]... they live in dev/battle-gate/capture-interior-study.mjs,
   which boots a real Chrome + THREE.WebGLRenderer") — reusing that script's proven server/Chrome/
   session-boot conventions rather than re-deriving them, trimmed to just what mounting an interior
   board + reading back the dressing group needs.

   RED-FIRST (checked 2026-07-10 against origin/claude/genesis-sprite-corpus-tags-edeaac tip cd84f76,
   before this unit's files existed): `git show cd84f76:src/engine/place-dressing.js` ->
   "fatal: path 'src/engine/place-dressing.js' exists on disk, but not in
   'origin/claude/genesis-sprite-corpus-tags-edeaac'" — dressPlan did not exist anywhere on that tip;
   check 1 below is the harness-side proof of the same fact (typeof dressPlan/REALM_DRESSING).

   Checks (this unit's own task brief):
     1. dressPlan/REALM_DRESSING exist; REALM_DRESSING carries the 3 supported interior realms
        (chrome/gloom/fantasy, matching INTERIOR_TILE_KITS) with real dressing-gen manifest slugs.
     2. determinism: same (plan,opts) [same walkId] -> byte-identical plan.dressing array; two
        DIFFERENT walkIds are not universally identical (not a constant-function false positive).
     3. placement laws: every dressing entry sits on a FLOOR cell (never door/wall), never inside its
        room's own center 2x2 (combat space), every blocker-primary entry is within 1 cell of a WALL
        cell, and every room's own FOCAL-ish entry count stays <= 3 (Wildermyth rule).
     4. render mount: a real Chrome+THREE boot mounts an interior board carrying plan.dressing;
        window.Theater.interiorDressingCount() matches the entries actually mounted (none silently
        skipped), and window.Theater.interiorDressingWorldPositions() proves origin-shift — a known
        card's world {x,z} === {cell.x,cell.y} - boardOrigin{cx,cz} (read straight off the THREE group
        the render actually placed, never a parallel formula).
     5. art-readiness join: every REALM_DRESSING slug resolves to a real cell in the dressing-gen
        manifests at dev/model-qa/dressing-gen/manifests/*.json (the corpus the codex's DRESSING-GEN
        wave will actually generate against) — the promise that "art drops in with zero code change".

   MUTATION (check 3's own guard): src/engine/place-dressing.js's DP_CENTER_EXCLUDE_ENABLED is a
   single named boolean guarding the center-2x2 exclusion (dpCenter2x2) — flipping it to `false` via
   a source string-replace (same mutation-test convention dev/verify-dressing.mjs already uses:
   rewrite the loaded source text, re-run, assert the specific check regresses) must make check 3's
   center-2x2 assertion go red, proving the exclusion is load-bearing, not vacuously true.

   Run:  node dev/verify-dungeon-dressing.mjs               (checks 1,2,3,5 + mutation; no Chrome)
         node dev/verify-dungeon-dressing.mjs --with-render  (adds check 4, real headless Chrome) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

function loadModules(dressingSrcOverride) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    dressingSrcOverride || read("src/engine/place-dressing.js"),
    "this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__dressPlan=typeof dressPlan!=='undefined'?dressPlan:undefined;",
    "this.__REALM_DRESSING=typeof REALM_DRESSING!=='undefined'?REALM_DRESSING:undefined;",
    "this.__SPATIAL_CELL=typeof SPATIAL_CELL!=='undefined'?SPATIAL_CELL:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "dungeon-graph-gr2.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    dressPlan: sandbox.__dressPlan,
    REALM_DRESSING: sandbox.__REALM_DRESSING,
    SPATIAL_CELL: sandbox.__SPATIAL_CELL,
  };
}

// same fixture builder dev/verify-dungeon-interior.mjs uses (linear chain topology).
function buildChainFixture(n) {
  const ids = Array.from({ length: n }, (_, i) => `s${i + 1}`);
  return ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: i === n - 1, depth: i,
    exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < n - 1 ? { targetId: ids[i + 1] } : null].filter(Boolean),
    light: "normal",
  }));
}
// a Hub fixture (matches verify-dungeon-semantics.mjs's own Hub group) so rooms carry a MIX of
// roles (entrance/finale/pocket/side) — dressing density varies by role, so this exercises more of
// dpPlaceRoom's branches than a bare chain would.
function buildHubFixture() {
  const ids = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const exitsFor = {
    h1: ["h2", "h5"], h2: ["h1", "h3", "h4", "h6"], h3: ["h2"], h4: ["h2"], h5: ["h1"], h6: ["h2"],
  };
  return ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: id === "h5", depth: id === "h1" ? 0 : 1,
    exits: exitsFor[id].map((t) => ({ targetId: t })),
    light: "normal",
  }));
}

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function group(name) { console.log("\n[" + name + "]"); }

const M = loadModules();

group("1 — dressPlan/REALM_DRESSING exist; REALM_DRESSING carries chrome/gloom/fantasy, real slugs");
ok(typeof M.dressPlan === "function", "dressPlan is a function");
ok(typeof M.REALM_DRESSING === "object" && M.REALM_DRESSING, "REALM_DRESSING is an object");
["chrome", "gloom", "fantasy"].forEach((realm) => {
  const roster = M.REALM_DRESSING[realm];
  ok(Array.isArray(roster) && roster.length >= 6, `REALM_DRESSING.${realm} has >=6 entries (got ${roster && roster.length})`);
  ok(roster && roster.every((e) => typeof e.slug === "string" && e.slug.startsWith(realm + "-")),
    `every ${realm} entry's slug is a real "${realm}-..." dressing-gen slug`);
  ok(roster && roster.some((e) => e.lightAffine), `${realm} roster carries at least one lightAffine (light-primary co-location) entry`);
  ok(roster && roster.every((e) => ["billboard", "extruded-card", "full-3d-prop"].includes(e.renderStrategy)),
    `${realm} roster entries carry a known renderStrategy`);
});
console.log(`  ✓ ${pass} passed so far`);

group("2 — determinism: same (plan, walkId) -> byte-identical plan.dressing; different walkIds diverge");
{
  const fixture = buildChainFixture(10);
  const plan = M.spatializePlan(fixture, "The Spine", { walkId: "gr2-determinism" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  const d1 = M.dressPlan(semPlan, { realmId: "gloom", walkId: "gr2-determinism" });
  const d2 = M.dressPlan(semPlan, { realmId: "gloom", walkId: "gr2-determinism" });
  ok(Array.isArray(d1.dressing) && d1.dressing.length > 0, "plan.dressing is a non-empty array");
  ok(JSON.stringify(d1.dressing) === JSON.stringify(d2.dressing), "dressing array byte-identical across two calls with the same (plan,walkId)");

  const d3 = M.dressPlan(semPlan, { realmId: "gloom", walkId: "gr2-determinism-DIFFERENT" });
  ok(JSON.stringify(d1.dressing) !== JSON.stringify(d3.dressing), "a different walkId yields a DIFFERENT dressing array (not a constant-function false positive)");
}

group("3 — placement laws: FLOOR-only, never center 2x2, blockers wall-adjacent, focal count <=3");
{
  const fixture = buildHubFixture();
  const plan = M.spatializePlan(fixture, "The Hub", { walkId: "gr2-placement" });
  const semPlan = M.semanticizePlan(plan, fixture, []);
  ["chrome", "gloom", "fantasy"].forEach((realm) => {
    const dressed = M.dressPlan(semPlan, { realmId: realm, walkId: "gr2-placement-" + realm });
    ok(dressed.dressing.length > 0, `${realm}: at least one dressing entry rolled`);

    const roomBySeg = {};
    dressed.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });

    dressed.dressing.forEach((d) => {
      const cellCode = dressed.cells[d.y * dressed.cellW + d.x];
      ok(cellCode === M.SPATIAL_CELL.FLOOR, `${realm}: "${d.slug}" @ (${d.x},${d.y}) sits on a FLOOR cell (code ${cellCode})`);
      const rosterEntry = M.REALM_DRESSING[realm].find((e) => e.slug === d.slug);
      const expected = rosterEntry ? rosterEntry.renderStrategy : (d.primary === "wall-hang" ? "extruded-card" : d.primary === "blocker" ? "full-3d-prop" : "billboard");
      ok(d.renderStrategy === expected, `${realm}: "${d.slug}" uses ${expected} strategy (got ${d.renderStrategy})`);
    });

    // never-center-2x2, re-derived independently (never trusting dressPlan's own dpCenter2x2 math).
    dressed.dressing.forEach((d) => {
      const r = roomBySeg[d.roomSegNum];
      if (!r) return;
      const cx0 = r.x + Math.max(0, Math.floor((r.w - 2) / 2));
      const cy0 = r.y + Math.max(0, Math.floor((r.d - 2) / 2));
      const inCenter = d.x >= cx0 && d.x < cx0 + 2 && d.y >= cy0 && d.y < cy0 + 2;
      ok(!inCenter, `${realm}: "${d.slug}" @ (${d.x},${d.y}) is NOT inside room ${r.segNum}'s center 2x2 (${cx0},${cy0})`);
    });

    // blockers within 1 cell of a WALL cell, re-derived independently.
    const blockers = dressed.dressing.filter((d) => d.primary === "blocker");
    blockers.forEach((d) => {
      const nearWall = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const nx = d.x + dx, ny = d.y + dy;
        if (nx < 0 || ny < 0 || nx >= dressed.cellW || ny >= dressed.cellD) return false;
        return dressed.cells[ny * dressed.cellW + nx] === M.SPATIAL_CELL.WALL;
      });
      ok(nearWall, `${realm}: blocker "${d.slug}" @ (${d.x},${d.y}) is within 1 cell of a WALL`);
    });

    // focal count per room <= 3 (Wildermyth rule) — count focal|setPiece entries per roomSegNum.
    const focalByRoom = {};
    dressed.dressing.forEach((d) => {
      if (d.primary === "focal" || d.primary === "setPiece") {
        focalByRoom[d.roomSegNum] = (focalByRoom[d.roomSegNum] || 0) + 1;
      }
    });
    const overCap = Object.entries(focalByRoom).filter(([, n]) => n > 3);
    ok(overCap.length === 0, `${realm}: no room exceeds 3 focal/setPiece pieces (violations: ${JSON.stringify(overCap)})`);
  });
  console.log(`  ✓ ${pass} passed so far`);
}

group("5 — art-readiness join: every REALM_DRESSING slug resolves to a real dressing-gen manifest cell");
{
  const fs = await import("node:fs");
  const path = await import("node:path");
  const manifestDir = join(ROOT, "dev/model-qa/dressing-gen/manifests");
  const manifestFiles = fs.readdirSync(manifestDir).filter((f) => f.endsWith(".json"));
  const knownSlugs = new Set();
  manifestFiles.forEach((f) => {
    const m = JSON.parse(fs.readFileSync(path.join(manifestDir, f), "utf-8"));
    (m.cells || []).forEach((c) => { if (c && c.slug) knownSlugs.add(c.slug); });
  });
  ok(knownSlugs.size > 0, `sanity: manifest slug pool is non-empty (${knownSlugs.size} slugs across ${manifestFiles.length} files)`);
  let joined = 0, total = 0;
  ["chrome", "gloom", "fantasy"].forEach((realm) => {
    (M.REALM_DRESSING[realm] || []).forEach((e) => {
      total++;
      if (knownSlugs.has(e.slug)) joined++;
      else console.error(`  FAIL: REALM_DRESSING.${realm} slug "${e.slug}" not found in any dressing-gen manifest`);
    });
  });
  ok(joined === total, `every REALM_DRESSING slug (${total}) resolves to a real manifest cell (${joined} joined)`);
}

console.log("\n[6 — PRODUCTION WIRING: trayFrom's {kind:\"interior\"} branch actually calls dressPlan and threads plan.dressing onto the returned board]");
// FINDING (dev/battle-gate/capture-dungeon-loop.mjs, 2026-07-10): dressPlan (this file's own subject)
// was fully verified by checks 1-5 above but had ZERO production callers — grep confirmed the only
// call sites anywhere in src/ or dev/ before this fix were THIS harness and the study rig
// (dev/battle-gate/capture-interior-study.mjs). src/engine/theater-data.js's trayFrom(source,scene,opts)
// is the ONE seam theaterHereSourceFor's {kind:"interior",plan} source (src/world/render.js, the real
// walk-consumption render path) flows through — it called interiorBuildBoard directly on the bare plan,
// never dressPlan, so a live dungeon walk's rendered room NEVER carried dressing cards in production,
// even though the whole dressing layer (roster, placement laws, art-readiness join, GL mount) was
// green. RED-FIRST (re-checked live against HEAD, not just cited): the committed theater-data.js (this
// fix lands as uncommitted working-tree state until this unit's own commit) had 0 dressPlan( calls.
{
  let parentCount = "?";
  try {
    // pinned to the last PRE-fix commit (51b6d85, the GR-wave tip the loop-gate branched from):
    // a HEAD-relative proof self-invalidates the moment the fix commit lands (caught at re-gate).
    parentCount = execSync('git show 51b6d85:src/engine/theater-data.js | grep -c "dressPlan(" || true', { cwd: ROOT }).toString().trim();
  } catch (e) { parentCount = "git-unavailable: " + e.message.split("\n")[0]; }
  ok(parentCount === "0" || parentCount.startsWith("git-unavailable"),
    `RED-FIRST: pre-fix theater-data.js (51b6d85) had 0 dressPlan( call sites — got "${parentCount}"`);

  // load place-spatialize + place-semantics + place-dressing + theater-interior + theater-data into
  // ONE sandbox (theater-interior.js/theater-data.js are both documented THREE/DOM-free pure data code
  // — see their own header comments) and drive the REAL trayFrom({kind:"interior",plan,...}) exactly
  // the shape theaterHereSourceFor emits, proving the PRODUCTION seam itself now carries dressing —
  // not a re-description of dressPlan's own already-proven correctness (checks 1-3 above).
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("src/engine/place-dressing.js"),
    read("data/kenney-runtime-registry.js"),
    read("src/engine/kenney-realization.js"),
    read("src/engine/place-distribution.js"),
    read("src/ui/theater-interior.js"),
    read("src/engine/theater-data.js"),
    "this.__trayFrom=typeof trayFrom!=='undefined'?trayFrom:undefined;",
    "this.__interiorBuildBoard=typeof interiorBuildBoard!=='undefined'?interiorBuildBoard:undefined;",
    "this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__dressPlan=typeof dressPlan!=='undefined'?dressPlan:undefined;",
    "this.__kenneyRealizePlan=typeof kenneyRealizePlan!=='undefined'?kenneyRealizePlan:undefined;",
    "this.__placeDistribute=typeof placeDistribute!=='undefined'?placeDistribute:undefined;",
    // CR-1 item 5a — exposed so check 6c can ask theater-interior.js's OWN keepSet formula what
    // it kept, rather than re-deriving a second, possibly-diverging "which room is this" rule
    // (the exact discipline QF-A3's own header comment in theater-data.js insists on).
    "this.__itrActiveRoomKeepSet=typeof itrActiveRoomKeepSet!=='undefined'?itrActiveRoomKeepSet:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "dungeon-graph-gr2-wiring.js" });
  const { __trayFrom: trayFrom, __spatializePlan: spatializePlan, __semanticizePlan: semanticizePlan,
    __dressPlan: dressPlan, __kenneyRealizePlan: kenneyRealizePlan, __placeDistribute: placeDistribute,
    __itrActiveRoomKeepSet: itrActiveRoomKeepSet } = sandbox;
  ok(typeof trayFrom === "function", "6a-setup. theater-data.js's real trayFrom is loadable alongside theater-interior.js/place-dressing.js");

  if (typeof trayFrom === "function") {
    const fixture = buildHubFixture();
    const plan = spatializePlan(fixture, "The Hub", { walkId: "gr2-wiring-check" });
    const semPlan = semanticizePlan(plan, fixture, []);
    const focusSegNum = semPlan.rooms[0].segNum;
    // the EXACT source shape theaterHereSourceFor (src/world/render.js) builds for a dungeon walk
    // carrying pn.spatial: {kind:"interior", plan, focusSegNum, radius, env, realms}.
    const board = trayFrom({ kind: "interior", plan: semPlan, focusSegNum: focusSegNum, radius: 1, env: "dungeon", realms: ["fantasy"] }, null, {});
    ok(!!board, "6a. trayFrom({kind:\"interior\",plan}) returns a board");
    ok(Array.isArray(board && board.dressing), "6b. the returned board carries a `dressing` array field", JSON.stringify(board && board.dressing));
    const directDressed = dressPlan(semPlan, { realmId: "fantasy" });
    const directRealized = kenneyRealizePlan(directDressed, { realmId: "fantasy" });
    const directDistributed = placeDistribute(directRealized, { walkId:null, focusSegNum });
    // CR-1 item 5a (2026-07-15 adversarial review): 6c used to assert board.dressing was
    // BYTE-IDENTICAL to the unfiltered dressPlan() output — true before QF-A3 (theater-data.js
    // ~line 1740), false and WRONG to assert after it: QF-A3 deliberately narrows board.dressing
    // to the active room's keepSet (a door/prop belonging to an off-screen room has nothing to
    // anchor to — see that block's own header comment), so once QF-A3 landed this fixture's
    // multi-room Hub made 6c permanently red by design, not by regression. Re-tuned to assert
    // THE FILTERED CONTRACT instead: every kept-room (or roomSegNum-less) prop from the direct,
    // unfiltered dressPlan() output survives into board.dressing UNCHANGED, and every OTHER
    // room's prop is absent — computed against itrActiveRoomKeepSet's own real keepSet formula
    // (imported above), never a second hand-rolled "which room is this" rule.
    ok(typeof itrActiveRoomKeepSet === "function", "6c-setup. theater-interior.js's itrActiveRoomKeepSet is loadable alongside trayFrom");
    const keepSet = typeof itrActiveRoomKeepSet === "function" ? itrActiveRoomKeepSet(semPlan, focusSegNum) : null;
    const expectedKept = (directDistributed.dressing || []).filter((e) => e && (e.roomSegNum == null || (keepSet && keepSet.has(e.roomSegNum))));
    const otherRoomProps = (directDistributed.dressing || []).filter((e) => e && e.roomSegNum != null && !(keepSet && keepSet.has(e.roomSegNum)));
    ok(otherRoomProps.length > 0,
      "6c-setup. discriminating: the Hub fixture's direct (unfiltered) dressing actually spans MULTIPLE rooms (otherwise 6c below would pass vacuously)",
      `directDressed.dressing roomSegNums: ${JSON.stringify((directDressed.dressing || []).map((e) => e.roomSegNum))}`);
    ok(!!board && JSON.stringify(board.dressing) === JSON.stringify(expectedKept),
      "6c. trayFrom's board.dressing IS THE FILTERED CONTRACT — every kept-room (or roomSegNum-less) prop from the direct dressPlan() call survives unchanged, in the same order",
      JSON.stringify({ trayFrom: board && board.dressing, expectedKept: expectedKept }));
    const leakedOtherRoomProps = otherRoomProps.filter((e) => (board && board.dressing || []).some((b) => b === e || JSON.stringify(b) === JSON.stringify(e)));
    ok(leakedOtherRoomProps.length === 0,
      "6c-b. every OTHER room's prop (present in the direct unfiltered call) is ABSENT from board.dressing — no off-screen-room prop leaks onto stage",
      JSON.stringify(leakedOtherRoomProps));
    ok((board && board.dressing || []).length > 0, "6d. discriminating: the dressing array is actually non-empty for this fixture (a Hub with real rooms), not a vacuous pass");
    const realizedAssets = (board && board.dressing || []).filter((e) => e && e.visualAsset);
    ok(realizedAssets.length > 0, "6d2. production dressing carries at least one KGR-5 visualAsset from an already-present noun");
    ok(realizedAssets.every((e) => e.visualAsset.registryHash && e.visualAsset.placementStatus),
      "6d3. every realized donor carries registry provenance and a placement result");

    // MUTATION: prove 6b/6c are load-bearing, not vacuous — reload with the PRE-FIX trayFrom body
    // (interior branch calling interiorBuildBoard directly, no dressPlan) and confirm board.dressing
    // goes back to undefined.
    const preFixTheaterData = read("src/engine/theater-data.js").replace(
      /if\(source\.kind === "interior" && source\.plan[\s\S]*?return board;\n  \}/,
      `if(source.kind === "interior" && source.plan && typeof interiorBuildBoard === "function"){
    const env = source.env || opts.env;
    const realms = source.realms || opts.realms;
    const realmId = source.realmId || (Array.isArray(realms) && realms.length ? realms[0] : undefined);
    return interiorBuildBoard(source.plan, { env: env, realmId: realmId, focusSegNum: source.focusSegNum, radius: source.radius });
  }`
    );
    ok(preFixTheaterData !== read("src/engine/theater-data.js"), "6e-setup. mutation source-rewrite actually changed the text (regex matched the real function body)");
    const sandbox2 = { console };
    sandbox2.window = sandbox2;
    vm.createContext(sandbox2);
    vm.runInContext([
      read("src/engine/place-spatialize.js"), read("src/engine/place-semantics.js"), read("src/engine/place-dressing.js"),
      read("data/kenney-runtime-registry.js"), read("src/engine/kenney-realization.js"), read("src/engine/place-distribution.js"),
      read("src/ui/theater-interior.js"), preFixTheaterData,
      "this.__trayFrom=typeof trayFrom!=='undefined'?trayFrom:undefined;",
    ].join("\n"), sandbox2, { filename: "dungeon-graph-gr2-wiring-prefix.js" });
    const preFixBoard = sandbox2.__trayFrom({ kind: "interior", plan: semPlan, focusSegNum: semPlan.rooms[0].segNum, radius: 1, env: "dungeon", realms: ["fantasy"] }, null, {});
    ok(preFixBoard && preFixBoard.dressing === undefined,
      "6f. ⊗ MUTATION: the pre-fix trayFrom body returns a board with NO dressing field (proves 6b/6c aren't vacuous)",
      JSON.stringify(preFixBoard && preFixBoard.dressing));
  }
}

console.log("\n=== MUTATION: disable the center-2x2 exclusion -> check 3's center-2x2 assertion goes red ===");
{
  const originalSrc = read("src/engine/place-dressing.js");
  const mutatedSrc = originalSrc.replace(
    "const DP_CENTER_EXCLUDE_ENABLED = true;",
    "const DP_CENTER_EXCLUDE_ENABLED = false;"
  );
  if (mutatedSrc === originalSrc) {
    fail++; console.error("  FAIL: mutation did not rewrite the source (DP_CENTER_EXCLUDE_ENABLED literal not found as expected)");
  } else {
    const MM = loadModules(mutatedSrc);
    const fixture = buildHubFixture();
    const plan = MM.spatializePlan(fixture, "The Hub", { walkId: "gr2-mutation" });
    const semPlan = MM.semanticizePlan(plan, fixture, []);
    const dressed = MM.dressPlan(semPlan, { realmId: "fantasy", walkId: "gr2-mutation" });
    const roomBySeg = {};
    dressed.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });
    let anyInCenter = false;
    dressed.dressing.forEach((d) => {
      const r = roomBySeg[d.roomSegNum];
      if (!r) return;
      const cx0 = r.x + Math.max(0, Math.floor((r.w - 2) / 2));
      const cy0 = r.y + Math.max(0, Math.floor((r.d - 2) / 2));
      if (d.x >= cx0 && d.x < cx0 + 2 && d.y >= cy0 && d.y < cy0 + 2) anyInCenter = true;
    });
    // this is a MUTATION PROOF, not a product assertion: with the guard disabled, at least one
    // room's dense enough roll (pocket=3 focal+3 filler, finale=3+5) should land in its own center
    // 2x2 across a 6-room Hub fixture with 3 realms' worth of rolls already exercised above — if this
    // ever goes vacuously green (guard "disabled" but nothing happens to land there), that itself is
    // the signal the mutation needs a denser fixture, not that the exclusion still holds.
    if (anyInCenter) {
      pass++;
      console.log("  ✓ with the exclusion disabled, at least one dressing entry lands in its room's center 2x2 (guard is load-bearing)");
    } else {
      fail++;
      console.error("  FAIL: mutation did not surface any center-2x2 placement — guard-disabled fixture may need to be denser");
    }
  }
}

async function runRenderCheck() {
  group("4 — render mount: real Chrome+THREE boot, dressing cards mount + origin-shift correctly");
  const { createRequire } = await import("node:module");
  const { spawn } = await import("node:child_process");
  const net = await import("node:net");
  const require = createRequire(import.meta.url);
  let puppeteer;
  try {
    puppeteer = require(join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));
  } catch (e) {
    fail++;
    console.error("  FAIL: puppeteer-core not available at ~/.genesis-jsdom (see dev/battle-gate/capture-interior-study.mjs's own setup) — cannot run the render-mount check");
    return;
  }
  const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5206, 5207, 5208, 5209, 5210];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function portInUse(port) {
    return new Promise((resolve) => {
      const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
      sock.on("error", () => resolve(false));
      sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
    });
  }
  async function probeRoot(port) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/genesis.html`, { cache: "no-store" });
      if (!r.ok) return false;
      const body = await r.text();
      return body.includes("var U=loadU();") || body.includes("Genesis");
    } catch (e) { return false; }
  }
  async function startServer() {
    for (const port of PORT_CANDIDATES) {
      if (await portInUse(port)) {
        if (await probeRoot(port)) return { proc: null, port };
        continue;
      }
      const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: ROOT, stdio: ["ignore", "ignore", "ignore"] });
      for (let i = 0; i < 40; i++) {
        if (await portInUse(port)) { if (await probeRoot(port)) return { proc, port }; break; }
        await sleep(150);
      }
      try { proc.kill("SIGTERM"); } catch (e) {}
    }
    throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
  }

  let server = null, browser = null;
  try {
    server = await startServer();
    const BASE = `http://127.0.0.1:${server.port}`;
    const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=800,600"];
    browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 800, height: 600, deviceScaleFactor: 1 } });
    const page = await browser.newPage();
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "load", timeout: 30000 });

    // minimal boot: real character creation is NOT needed to exercise setInteriorBoard — the theater
    // module attaches window.Theater unconditionally at script-eval time (this file's own module-level
    // `window.Theater.setInteriorBoard = ...` assignment), and mount() only needs a real DOM element
    // (never a live session) per its own signature `mount(el, opts)`. This sidesteps capture-interior-
    // study.mjs's full bootToInSession dance (character creation through to a live world) entirely.
    for (let i = 0; i < 40; i++) {
      const ready = await page.evaluate(() => !!(window.Theater && typeof window.Theater.setInteriorBoard === "function" && typeof window.spatializePlan === "function" && typeof window.dressPlan === "function"));
      if (ready) break;
      await sleep(150);
    }

    const cold = await page.evaluate(() => {
      const el = document.createElement("div");
      el.style.width = "800px"; el.style.height = "600px";
      document.body.appendChild(el);
      const mounted = window.Theater.mount(el);
      if (!mounted) return { ok: false, stage: "mount-failed" };

      const ids = ["s1", "s2", "s3"];
      const fixture = ids.map((id, i) => ({
        id, num: i + 1, label: id, isFinale: i === ids.length - 1, depth: i,
        exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < ids.length - 1 ? { targetId: ids[i + 1] } : null].filter(Boolean),
        light: "normal",
      }));
      const plan = spatializePlan(fixture, "The Spine", { walkId: "gr2-render-check" });
      const semPlan = semanticizePlan(plan, fixture, []);
      const board = trayFrom({ kind:"interior", plan:semPlan, focusSegNum:semPlan.rooms[0].segNum,
        radius:1, env:"dungeon", realms:["fantasy"], walkId:"gr2-render-check" }, null, {});

      window.Theater.setInteriorBoard(board);
      const count = window.Theater.interiorDressingCount();
      const positions = window.Theater.interiorDressingWorldPositions();
      const contactLayerCount = window.Theater.interiorDressingContactLayerCount();
      const origin = window.Theater.interiorBoardOrigin();
      return { ok: true, requested: board.dressing.length,
        directRequested:board.dressing.filter((d)=>d.primary!=="blocker"&&d.primary!=="wall-hang").length,
        count, positions, contactLayerCount, origin, sourceEntries: board.dressing };
    });

    if(cold.ok && cold.sourceEntries.some((e)=>e.visualAsset && e.visualAsset.placementStatus!=="fallback-overlap")){
      await page.waitForFunction(() => window.Theater.interiorDressingWorldPositions().some((p)=>p.kenneyAsset),
        { timeout:10000 });
    }
    const warmPositions = cold.ok ? await page.evaluate(() => window.Theater.interiorDressingWorldPositions()) : [];
    const result = Object.assign({}, cold, { positions:warmPositions });

    ok(result.ok, "boot + mount + setInteriorBoard succeeded: " + JSON.stringify(result.stage || result));
    if (result.ok) {
      ok(result.requested > 0, `dressPlan produced dressing entries for the render-check fixture (${result.requested})`);
      ok(result.count === result.requested, `interiorDressingCount (${result.count}) === plan.dressing entries requested (${result.requested}) — none silently skipped`);
      ok(Array.isArray(result.positions) && result.positions.length === result.directRequested,
        `interiorDressingWorldPositions returned one entry per direct dressing mount (${result.positions.length}; blocker/wall-hang use sibling channels)`);
      ok(result.contactLayerCount === 1,
        `interior dressing retains exactly one identity-tagged legacy contact layer (${result.contactLayerCount})`);
      if(result.positions.length !== result.directRequested) console.error("  mount diagnostic: " + JSON.stringify({
        direct:result.sourceEntries.filter((d)=>d.primary!=="blocker"&&d.primary!=="wall-hang").map((d)=>({slug:d.slug,primary:d.primary,visualAsset:d.visualAsset&&d.visualAsset.assetId,status:d.visualAsset&&d.visualAsset.placementStatus})),
        mounted:result.positions
      }));
      ok(result.sourceEntries.some((e)=>e.visualAsset), "production fixture carries at least one realized Kenney visualAsset");
      ok(result.positions.some((p)=>p.kenneyAsset), "successful async donor arrival replays the board and replaces a legacy card");
      ok(result.origin && typeof result.origin.cx === "number" && typeof result.origin.cz === "number", "interiorBoardOrigin exposed {cx,cz}");
      if (result.origin && result.positions.length && result.sourceEntries.length) {
        const pos = result.positions[0];
        const cell = result.sourceEntries.find((e)=>e.slug===pos.slug);
        const expectedX = cell.x - result.origin.cx;
        const expectedZ = cell.y - result.origin.cz;
        ok(Math.abs(pos.x - expectedX) < 1e-9, `first card world.x (${pos.x}) === cell.x - boardOrigin.cx (${expectedX})`);
        ok(Math.abs(pos.z - expectedZ) < 1e-9, `first card world.z (${pos.z}) === cell.y - boardOrigin.cz (${expectedZ})`);
        ok(pos.slug === cell.slug, `world position entry's slug ("${pos.slug}") matches the source dressing entry's slug ("${cell.slug}")`);
      }
      console.log(`  ✓ mounted ${result.count} dressing cards, origin-shift verified against boardOrigin`);
    }
  } catch (e) {
    fail++;
    console.error("  FAIL: render-mount check threw: " + (e && e.message));
  } finally {
    if (browser) { try { await browser.close(); } catch (e) {} }
    if (server && server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

const withRender = process.argv.includes("--with-render");
if (withRender) {
  await runRenderCheck();
} else {
  console.log("\n(skipping check 4 — render mount: pass --with-render to boot real headless Chrome + THREE and exercise it)");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
