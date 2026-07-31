/* verify-walk-fact-wiring.mjs — headless test for UNIT W1 (2026-07-27, fix/wiring-teeth-0727):
   "stop discarding rolled walk facts." Consumption wiring ONLY — no rendering changes. Three facts
   that were rolled (or authored-but-unrolled) and then thrown away before reaching the walk/segment
   object; this harness proves all three are now REACHABLE + receipted on fresh walks.

     (a) urban-area-type (Engine/03. _Tables/.../Urban Area Type.md, d200) — authored, compiled
         ("WIRED" in data/table-atlas.js/table-usage.js means "table-atlas.js can see it," NOT "an
         engine roller consumes it"), flagged as an explicit known gap in
         docs/SITE-6-PRISON-CUSTODY-SPEC.md ("`urban-area-type` is authored but not consumed by
         `rollUrbanWalk`"). Wired the same way dungeon-walk.js's dwalkArea carries area onto EVERY
         room INCLUDING the finale (dwalkArea is called before dungeon-walk.js's finale branch) —
         mirrored in src/engine/walk.js's rollUrbanWalk: every segment (finale incl.) now carries
         `areaType`/`dims`/`side` + a `rollRefs.area` receipt.
     (b) wilderness-footing (Engine/.../Wilderness Footing.md, d200: Surface Flavor | Coverage Area |
         Mechanical Impact & Tracking) — src/engine/wild-walk.js's per-leg roll read ONLY column 1
         (`walkPick("wilderness-footing",1)`), discarding columns 2-3 (coverage/impact — see
         docs/TERRAIN-PROGRAM.md §1.2D in the sibling worktree Genesis-clayspec, read-only evidence).
         Upgraded to `walkPickStamped(...,1,2,3)`: the pre-existing `footing` string field is BYTE-
         UNCHANGED (still column 1 — skin-grants.js string-concats it, theater-data.js/walk-scene.js
         read it as a string; changing its TYPE would be a rendering change, which this unit forbids),
         and the previously-discarded columns now land as new sibling fields `footingCoverage` +
         `footingImpact`, plus a `rollRefs.footing` receipt.
     (c) urban-footing (Engine/.../Urban Footing.md, d100: Footing Type | Coverage Area | 2024
         Mechanical Impact) — confirmed via source grep: rolled by NO builder anywhere (dungeon has
         no footing table at all; only wild-walk.js touched "wilderness-footing"). Rolled fresh in
         rollUrbanWalk, "where wilderness-footing rolls, same shape" — i.e. the per-LEG-equivalent
         slot (every non-finale urban segment), NEVER on the finale (mirrors wilderness: footing is
         never rolled for the arrival segment either) — same 3-field shape as (b)'s upgrade.

   Never asserts a fixed RNG position — every check rolls N fresh walks (real dice, unseeded) and
   asserts PRESENCE/SHAPE, not a specific value.

   Run:  node dev/verify-walk-fact-wiring.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md)
   RED-FIRST: run this file against the unmodified base BEFORE any src/ edit land — every "present"
   check fails cleanly (field undefined / rollRefs key absent); see the paper-trail entry in
   docs/DESIGN.md for the captured red transcript. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const srcPaths = man.loadOrder.filter((p) => p.endsWith(".js"));

function boot(){
  const src = srcPaths.map(read).join("\n;\n");
  const dom = new JSDOM(
    `<!doctype html><html><body>
       <div id="worldView"></div><div id="toast"></div>
     </body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);
  win.saveU = () => {};
  win.renderWorld = () => {};
  win.showTab = () => {};
  win.toast = () => {};
  win.fetch = () => Promise.resolve({ ok:false });
  return win;
}

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

/* ── 0. compiled tables exist (sanity — if these are missing, everything below is a false negative) ── */
console.log("0. the three authored tables are actually compiled (GENESIS_TABLES)");
{
  const win = boot();
  const T = win.GENESIS_TABLES || {};
  for (const id of ["urban-area-type", "urban-footing", "wilderness-footing"])
    check(`0. compiled key present + populated: ${id}`, T[id] && Array.isArray(T[id].rows) && T[id].rows.length > 0,
      `T[${id}] = ${JSON.stringify(T[id] && { rows: T[id].rows && T[id].rows.length })}`);
}

function isValidRef(ref, expectedTableId, dieMax){
  if (!ref) return { ok:false, why:"ref is falsy" };
  if (typeof ref.tableId !== "string" || ref.tableId !== expectedTableId) return { ok:false, why:`tableId=${JSON.stringify(ref.tableId)}, want ${expectedTableId}` };
  if (!Number.isInteger(ref.total) || ref.total < 1 || ref.total > dieMax) return { ok:false, why:`total=${JSON.stringify(ref.total)} not an integer in [1,${dieMax}]` };
  if (ref.band !== null) return { ok:false, why:`band=${JSON.stringify(ref.band)}, want null (this table is 100% unbanded)` };
  return { ok:true };
}

/* ── (a) urban-area-type: every urban segment (finale incl.) carries areaType/dims/side + rollRefs.area ── */
console.log("\n(a) rollUrbanWalk consumes urban-area-type — every segment, finale included");
{
  const win = boot();
  let ok = true, detail = "";
  const SEG_COUNTS = [2, 4, 6, 9, 14];
  for (const segCount of SEG_COUNTS) {
    for (let i = 0; i < 4; i++) {
      const w = win.rollUrbanWalk({ segCount });
      for (const seg of w.segments) {
        if (typeof seg.areaType !== "string" || !seg.areaType) { ok = false; detail = `segCount=${segCount} seg ${seg.num} (isFinale=${seg.isFinale}) .areaType = ${JSON.stringify(seg.areaType)}`; break; }
        if (typeof seg.dims !== "string" || !seg.dims) { ok = false; detail = `segCount=${segCount} seg ${seg.num} (isFinale=${seg.isFinale}) .dims = ${JSON.stringify(seg.dims)}`; break; }
        if (typeof seg.side !== "string" || !seg.side) { ok = false; detail = `segCount=${segCount} seg ${seg.num} (isFinale=${seg.isFinale}) .side = ${JSON.stringify(seg.side)}`; break; }
        const rr = seg.rollRefs || {};
        const v = isValidRef(rr.area, "urban-area-type", 200);
        if (!v.ok) { ok = false; detail = `segCount=${segCount} seg ${seg.num} (isFinale=${seg.isFinale}) rollRefs.area invalid: ${v.why} (rr.area=${JSON.stringify(rr.area)})`; break; }
      }
      if (!ok) break;
    }
    if (!ok) break;
  }
  check("a1. every urban segment (every segCount x4 rolls, finale incl.) carries non-empty areaType/dims/side", ok, detail);
}
{
  const win = boot();
  let finaleOk = true, detail = "";
  for (let i = 0; i < 12; i++) {
    const w = win.rollUrbanWalk({ segCount: 6 });
    const finale = w.segments.find((s) => s.isFinale);
    if (!finale) { finaleOk = false; detail = "no finale segment found on this walk"; break; }
    if (typeof finale.areaType !== "string" || !finale.areaType) { finaleOk = false; detail = `finale seg ${finale.num} .areaType = ${JSON.stringify(finale.areaType)}`; break; }
    const v = isValidRef((finale.rollRefs || {}).area, "urban-area-type", 200);
    if (!v.ok) { finaleOk = false; detail = `finale seg ${finale.num} rollRefs.area invalid: ${v.why}`; break; }
  }
  check("a2. the FINALE segment specifically carries areaType + a valid rollRefs.area receipt (x12 rolls) — matches dungeon's own finale-inclusive precedent", finaleOk, detail);
}

/* ── (b) wilderness-footing: full row (surface+coverage+impact) carried on every leg + a receipt;
   the pre-existing `footing` string stays byte-shaped (a string), and arrival stays footing-less
   (unchanged — this unit does not invent a NEW roll site) ── */
console.log("\n(b) rollWildernessWalk carries the FULL wilderness-footing row on every leg");
{
  const win = boot();
  let legOk = true, legDetail = "";
  const LEG_COUNTS = [1, 3, 5, 8, 20];
  for (const legCount of LEG_COUNTS) {
    for (let i = 0; i < 4; i++) {
      const w = win.rollWildernessWalk({ legCount });
      const legs = w.segments.filter((s) => !s.isFinale);
      if (legs.length !== legCount) { legOk = false; legDetail = `legCount=${legCount} produced ${legs.length} non-finale segments`; break; }
      for (const seg of legs) {
        if (typeof seg.footing !== "string" || !seg.footing) { legOk = false; legDetail = `legCount=${legCount} leg ${seg.num} .footing = ${JSON.stringify(seg.footing)} (want non-empty string)`; break; }
        if (typeof seg.footingCoverage !== "string" || !seg.footingCoverage) { legOk = false; legDetail = `legCount=${legCount} leg ${seg.num} .footingCoverage = ${JSON.stringify(seg.footingCoverage)}`; break; }
        if (typeof seg.footingImpact !== "string" || !seg.footingImpact) { legOk = false; legDetail = `legCount=${legCount} leg ${seg.num} .footingImpact = ${JSON.stringify(seg.footingImpact)}`; break; }
        const rr = seg.rollRefs || {};
        const v = isValidRef(rr.footing, "wilderness-footing", 200);
        if (!v.ok) { legOk = false; legDetail = `legCount=${legCount} leg ${seg.num} rollRefs.footing invalid: ${v.why}`; break; }
      }
      if (!legOk) break;
    }
    if (!legOk) break;
  }
  check("b1. every wilderness leg (every legCount x4 rolls) carries footing(string)+footingCoverage+footingImpact + a valid rollRefs.footing receipt", legOk, legDetail);
}
{
  const win = boot();
  let shapeOk = true, detail = "";
  for (let i = 0; i < 6; i++) {
    const w = win.rollWildernessWalk({ legCount: 4 });
    for (const seg of w.segments.filter((s) => !s.isFinale)) {
      if (Object.prototype.toString.call(seg.footing) !== "[object String]") { shapeOk = false; detail = `leg ${seg.num} .footing is a ${typeof seg.footing}, not a string (would break skin-grants.js's "seg.footing + ' — ' + prefix" concat and theater-data.js/walk-scene.js's string readers)`; break; }
    }
    if (!shapeOk) break;
  }
  check("b2. .footing stays a plain STRING (not restructured into an object) — the no-rendering-change guard: skin-grants.js/theater-data.js/walk-scene.js all read it as a string today", shapeOk, detail);
}
{
  const win = boot();
  let arrOk = true, detail = "";
  for (let i = 0; i < 8; i++) {
    const w = win.rollWildernessWalk({ legCount: 4 });
    const arrival = w.segments.find((s) => s.isFinale);
    if (!arrival) { arrOk = false; detail = "no arrival segment found"; break; }
    if ("footing" in arrival) { arrOk = false; detail = `arrival unexpectedly carries .footing = ${JSON.stringify(arrival.footing)} (this unit does not add a new roll site — arrival never rolled footing before, and still shouldn't)`; break; }
    if ("footingCoverage" in arrival || "footingImpact" in arrival) { arrOk = false; detail = "arrival unexpectedly carries footingCoverage/footingImpact"; break; }
    if (arrival.rollRefs && "footing" in arrival.rollRefs) { arrOk = false; detail = "arrival unexpectedly carries rollRefs.footing"; break; }
  }
  check("b3. regression guard: the ARRIVAL segment still never rolls footing (x8 rolls) — this unit upgrades the existing per-leg roll, it does not add a new roll site", arrOk, detail);
}

/* ── (c) urban-footing: never rolled by any builder before this unit — now rolled in the same
   per-segment slot wilderness-footing rolls per-leg (every NON-finale urban segment), same shape,
   never on the finale (mirrors wilderness's own arrival exemption) ── */
console.log("\n(c) rollUrbanWalk now rolls urban-footing — same shape, same slot as wilderness-footing (never the finale)");
{
  const win = boot();
  let segOk = true, detail = "";
  const SEG_COUNTS = [2, 4, 6, 9, 14];
  for (const segCount of SEG_COUNTS) {
    for (let i = 0; i < 4; i++) {
      const w = win.rollUrbanWalk({ segCount });
      const nonFinale = w.segments.filter((s) => !s.isFinale);
      if (!nonFinale.length) { segOk = false; detail = `segCount=${segCount} produced zero non-finale segments`; break; }
      for (const seg of nonFinale) {
        if (typeof seg.footing !== "string" || !seg.footing) { segOk = false; detail = `segCount=${segCount} seg ${seg.num} .footing = ${JSON.stringify(seg.footing)}`; break; }
        if (typeof seg.footingCoverage !== "string" || !seg.footingCoverage) { segOk = false; detail = `segCount=${segCount} seg ${seg.num} .footingCoverage = ${JSON.stringify(seg.footingCoverage)}`; break; }
        if (typeof seg.footingImpact !== "string" || !seg.footingImpact) { segOk = false; detail = `segCount=${segCount} seg ${seg.num} .footingImpact = ${JSON.stringify(seg.footingImpact)}`; break; }
        const rr = seg.rollRefs || {};
        const v = isValidRef(rr.footing, "urban-footing", 100);
        if (!v.ok) { segOk = false; detail = `segCount=${segCount} seg ${seg.num} rollRefs.footing invalid: ${v.why}`; break; }
      }
      if (!segOk) break;
    }
    if (!segOk) break;
  }
  check("c1. every non-finale urban segment (every segCount x4 rolls) carries footing+footingCoverage+footingImpact + a valid rollRefs.footing receipt", segOk, detail);
}
{
  const win = boot();
  let finaleOk = true, detail = "";
  for (let i = 0; i < 12; i++) {
    const w = win.rollUrbanWalk({ segCount: 6 });
    const finale = w.segments.find((s) => s.isFinale);
    if (!finale) { finaleOk = false; detail = "no finale segment found"; break; }
    if ("footing" in finale || "footingCoverage" in finale || "footingImpact" in finale) {
      finaleOk = false; detail = `finale seg ${finale.num} unexpectedly carries footing field(s): ${JSON.stringify({ footing: finale.footing, footingCoverage: finale.footingCoverage, footingImpact: finale.footingImpact })}`; break;
    }
    if (finale.rollRefs && "footing" in finale.rollRefs) { finaleOk = false; detail = "finale unexpectedly carries rollRefs.footing"; break; }
  }
  check("c2. the urban FINALE segment never rolls footing (x12 rolls) — matches 'roll it where wilderness-footing rolls' (legs only, never the arrival/finale)", finaleOk, detail);
}

/* ── cross-cutting: this unit is consumption wiring only — the pre-existing graphics-critical
   rollRefs keys (area/scene/light/object/feature/dressing for dungeon; sceneFrame/dressing/
   interactable for urban; feature/dressing/signOfPassage for wilderness) still roll, untouched. A
   coarse presence smoke test, not a full re-run of verify-walk-stamped-provenance.mjs's own suite. ── */
console.log("\n(cross-check) pre-existing rollRefs families are undisturbed");
{
  const win = boot();
  let ok = true, detail = "";
  const w = win.rollDungeonWalk({ segCount: 6 });
  for (const room of w.rooms || w.segments) {
    const rr = room.rollRefs || {};
    for (const key of ["scene", "light", "object", "feature", "dressing"]) {
      if (!rr[key] || typeof rr[key].tableId !== "string") { ok = false; detail = `dungeon room ${room.num} rollRefs.${key} = ${JSON.stringify(rr[key])}`; break; }
    }
    if (!ok) break;
  }
  check("cross1. dungeon rollRefs (scene/light/object/feature/dressing) still present — untouched by this unit", ok, detail);
}

console.log("\n=== check-manifest ===");
console.log("  (run separately: python3 build/check-manifest.py — no new module registered by W1, no new file under src/data)");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
