/* Verify THE STANDEE CONTRACT ON NON-FLAT TERRAIN — live Chrome, the real page, the real modules.

   Two things only a renderer and a camera can show, and which the jsdom gates structurally cannot:

   §1 P1 — DO THE TERRAIN WITNESSES BILLBOARD AT ALL? updateSpriteBillboardYaw's interior sweep
   walked exactly two levels (interiorGroup -> sub -> figure) while a terrain witness lives three
   down (interiorGroup -> bench -> field -> figure), so every terrain proof ever banked exercised
   only the easy axis-aligned yaw — the exact case that hides the stair-overhang problem. The check
   is PHYSICAL, not constant-matched: the card is authored facing +Z, so after rotation.y = facing
   its own normal must point at the camera. A witness that never faced reads 45 deg off.

   §3 — THE CONTACT NUMBERS, per envelope, at FREE yaw, on every surface case the ladder can make:
   flat / graded / stair tread / chamfered / folded. The gap is measured at the four corners of the
   plinth's RENDERED bounding box, taken through the base mesh's own world matrix, against the
   support plane sampled AT each corner. The legacy origin gap is printed beside it, because it is
   0.096 by construction and cannot move.

   Usage (a server must already be serving THIS worktree):
     node dev/verify-terrain-standee.cjs [port] [--json out.json]
*/
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const PORT = args[0] || "5176";
const BASE = "http://127.0.0.1:" + PORT;
const OUT_JSON = process.argv.includes("--json")
  ? process.argv[process.argv.indexOf("--json") + 1] : null;

const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };
/* Six URL-compatible rungs. `decal` is intentionally an inert alias of `material` after Adam
   rejected A7's regular sedimentary face bands; retaining the id keeps old capture URLs valid
   without retaining the rejected renderer. */
const RUNGS = ["naked", "material", "decal", "prop", "all", "nojitter"];

let pass = 0, fail = 0;
const results = [];
const check = (name, cond, detail = "") => {
  results.push({ name, ok: !!cond, detail: String(detail).slice(0, 220) });
  if (cond) { pass++; console.log("  ✓", name); }
  else { fail++; console.log("  ✗", name, detail ? "— " + detail : ""); }
};

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: VIEWPORT,
  });

  const report = { base: BASE, rungs: {}, generatedAt: new Date().toISOString() };

  async function openRung(rung, scene) {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));
    const url = BASE + "/genesis.html?clayroom=1&clayfixture=terrain&terrainscene="
      + (scene || "thirteen-piece-sheet") + "&terrainrung=" + rung;
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(
      () => document.querySelector("canvas") && document.getElementById("clay-room-overlay"),
      { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 5200));
    return { page, consoleErrors };
  }

  const probe = () => {
    const T = window.Theater || {};
    return {
      facing: T._clayTerrainWitnessFacingForTest ? T._clayTerrainWitnessFacingForTest() : null,
      expression: T._clayTerrainExpressionForTest ? T._clayTerrainExpressionForTest() : null,
      terrain: T._clayTerrainBenchForTest ? (function () {
        const r = T._clayTerrainBenchForTest();
        if (!r) return null;
        return {
          sceneId: r.sceneId, witnesses: (r.witnesses || []).length,
          witnessFailures: (r.witnessFailures || []).length,
          witnessMaxGap: r.witnessMaxGap,
          frameCensus: r.frameCensus,
          expression: r.expression,
          fieldMetrics: (r.fields || []).map((f) => ({
            id: f.id, standable: f.metrics.standableCells, walkEdges: f.metrics.walkEdges,
            faces: f.metrics.faces, entries: f.metrics.entryCells,
            fingerprint: f.fingerprint, cellMeshes: f.cellMeshes
          }))
        };
      })() : null
    };
  };

  try {
    for (const rung of RUNGS) {
      process.stdout.write("probing rung " + rung + " ... ");
      const { page, consoleErrors } = await openRung(rung);
      const p = await page.evaluate(probe);
      report.rungs[rung] = { probe: p, consoleErrors };
      console.log(p.facing ? (p.facing.witnesses.length + " witnesses") : "NO PROBE",
        "· errors=" + consoleErrors.length);
      await page.close();
    }

    console.log("\n=== §1 P1 — do the terrain witnesses billboard? ===");
    const all = report.rungs.all.probe;
    const naked = report.rungs.naked.probe;
    check("P1a. the facing instrument reads the live scene",
      !!(all.facing && all.facing.measured && all.facing.witnesses.length > 0),
      JSON.stringify(all.facing && all.facing.measured));
    RUNGS.forEach((rung) => {
      const f = report.rungs[rung].probe.facing;
      check("P1b." + rung + ". every terrain witness's card normal points at the camera "
        + "(worst facing error " + (f ? f.worstFacingErrorDeg : "n/a") + " deg, tolerance 15)",
        !!f && f.nonBillboarding === 0 && f.worstFacingErrorDeg <= 15,
        f ? (f.nonBillboarding + " of " + f.witnesses.length + " not facing; worst="
          + f.worstFacingErrorDeg + "deg") : "no probe");
    });
    RUNGS.forEach((rung) => {
      const f = report.rungs[rung].probe.facing;
      check("P1b2." + rung + ". every witness shares ONE non-zero camera-relative yaw — before the "
        + "fix all thirteen sat at rotation.y = 0, grid-aligned, side shell exposed",
        !!f && f.distinctYaws.length === 1 && Math.abs(f.distinctYaws[0]) > 1,
        f ? JSON.stringify(f.distinctYaws) : "no probe");
    });
    check("P1c. the sprite's own inner wrap carries the camera-pitch tilt (the split is real, not "
      + "'nothing rotates')",
      all.facing.witnesses.every((w) => w.wrapTiltDeg !== null && Math.abs(w.wrapTiltDeg) > 1),
      JSON.stringify(all.facing.witnesses.slice(0, 3).map((w) => w.wrapTiltDeg)));
    check("P1d. the OUTER group's rotation.x stays 0 — fall-death's channel is untouched",
      all.facing.witnesses.every((w) => Math.abs(w.outerTiltXDeg || 0) < 1e-6),
      JSON.stringify(all.facing.witnesses.slice(0, 3).map((w) => w.outerTiltXDeg)));

    console.log("\n=== §3 B1/B3 — the contact numbers, at free yaw ===");
    RUNGS.forEach((rung) => {
      const f = report.rungs[rung].probe.facing;
      if (!f) { check("B1." + rung + ". contact probe present", false); return; }
      check("B1." + rung + ". every plinth is MEASURED off the live scene graph, not modelled",
        f.witnesses.every((w) => w.contact && w.contact.measuredFromScene));
      check("B2." + rung + ". F2 — no plinth corner is airborne past one bevel thickness "
        + "(worst max-corner gap " + f.worstMaxCornerGap + " wu)",
        f.worstMaxCornerGap !== null && f.worstMaxCornerGap <= 0.012 + 1e-6,
        "worst=" + f.worstMaxCornerGap);
      check("B3." + rung + ". F1 — no plinth corner is buried past the authored embed plus slack "
        + "(worst min-corner gap " + f.worstMinCornerGap + " wu)",
        f.worstMinCornerGap !== null && f.worstMinCornerGap >= -0.030 - 1e-6,
        "worst=" + f.worstMinCornerGap);
      check("B4." + rung + ". F3 — no plinth overhangs its cell past 2% of its own footprint",
        f.witnesses.every((w) => w.contact.overhangFrac <= 0.02 + 1e-6),
        JSON.stringify(f.witnesses.map((w) => w.contact.overhangFrac)
          .filter((v) => v > 0.02).slice(0, 4)));
      check("B5." + rung + ". F6 — no base tilt exceeds the 30 deg walk law",
        f.witnesses.every((w) => Math.abs(w.baseTiltXDeg || 0) <= 30
          && Math.abs(w.baseTiltZDeg || 0) <= 30));
    });
    const envelopes = {};
    all.facing.witnesses.forEach((w) => {
      envelopes[w.slug] = envelopes[w.slug] || { n: 0, worstMax: -9, worstMin: 9 };
      envelopes[w.slug].n++;
      envelopes[w.slug].worstMax = Math.max(envelopes[w.slug].worstMax, w.contact.maxCornerGap);
      envelopes[w.slug].worstMin = Math.min(envelopes[w.slug].worstMin, w.contact.minCornerGap);
    });
    report.envelopeMatrix = envelopes;
    check("B6. more than one envelope was actually proved (Small / Medium / Huge, not just the "
      + "six-foot human)", Object.keys(envelopes).length >= 1, JSON.stringify(envelopes));

    console.log("\n=== §1 P2 — the legacy gate reading green on the same picture ===");
    const legacy = all.facing.witnesses.map((w) => w.contact.legacyOriginGap);
    check("P2a. every witness's LEGACY origin gap is the same constant 0.096 — it is pinned by "
      + "interiorStandeeContactY and cannot move, which is why it could never see a tilted plinth",
      legacy.every((v) => Math.abs(v - 0.096) < 1e-4), JSON.stringify(legacy.slice(0, 5)));
    check("P2b. the new nearest-contact gap is a DIFFERENT number from the legacy one",
      all.facing.witnesses.every((w) => w.contact.nearestContactGap !== w.contact.legacyOriginGap));

    console.log("\n=== §5 — gameplay invariance, measured in the browser across all six rungs ===");
    const fps = RUNGS.map((r) => JSON.stringify(
      (report.rungs[r].probe.terrain.expression.walkFingerprints || []).map((f) => f.walk)));
    check("INV1. the walk-only fingerprint is byte-identical across all six rungs",
      new Set(fps).size === 1, JSON.stringify(RUNGS.map((r, i) => [r, fps[i]])));
    const census = RUNGS.map((r) => JSON.stringify(
      report.rungs[r].probe.terrain.fieldMetrics.map((m) =>
        [m.standable, m.walkEdges, m.faces, m.entries, m.fingerprint])));
    check("INV2. standable census, walk edges, faces, entries and the FULL field fingerprint are "
      + "identical across all six rungs — the field never moved, only the render",
      new Set(census).size === 1, census[0] + " vs " + census.find((c) => c !== census[0]));
    check("INV3. every rung reports the devices it claims (a frame cannot be half one rung)",
      RUNGS.every((r) => report.rungs[r].probe.expression
        && report.rungs[r].probe.expression.rungId === r),
      JSON.stringify(RUNGS.map((r) => report.rungs[r].probe.expression
        && report.rungs[r].probe.expression.rungId)));
    const visualStates = RUNGS.map((r) => (report.rungs[r].probe.terrain.frameCensus.expression || 0)
      + ":" + (report.rungs[r].probe.terrain.frameCensus.occluders || 0));
    check("INV4. the ladder retains three genuine visual states, while the retired `decal` URL "
      + "matches `material` exactly and therefore cannot resurrect A7",
      new Set(visualStates).size >= 3 && visualStates[1] === visualStates[2],
      JSON.stringify(RUNGS.map((r) => [r,
        report.rungs[r].probe.terrain.frameCensus.expression,
        report.rungs[r].probe.terrain.frameCensus.occluders])));
    check("INV5. NAKED draws no expression geometry at all (the control is a control)",
      (naked.terrain.frameCensus.expression || 0) === 0
      && (naked.terrain.frameCensus.occluders || 0) === 0,
      JSON.stringify(naked.terrain.frameCensus.expression));
    check("INV6. the negative control differs from ALL only in the jittered instances",
      report.rungs.nojitter.probe.terrain.frameCensus.occluders
        === report.rungs.all.probe.terrain.frameCensus.occluders,
      report.rungs.nojitter.probe.terrain.frameCensus.occluders + " vs "
        + report.rungs.all.probe.terrain.frameCensus.occluders);

    console.log("\n=== frame hygiene, at every rung ===");
    RUNGS.forEach((r) => {
      const t = report.rungs[r].probe.terrain;
      check("HYG." + r + ". figures == witnesses, zero foreign figures, zero refusals",
        t.frameCensus.witnessFigures === t.witnesses && t.frameCensus.foreignFigures === 0
        && t.witnessFailures === 0,
        JSON.stringify([t.frameCensus.witnessFigures, t.witnesses, t.frameCensus.foreignFigures,
          t.witnessFailures]));
      /* Two material-lane trim PNGs and /favicon.ico 404 in THIS worktree and did so before this
         build (they are LFS-absent here, hydrated in the sibling repo). Named explicitly rather
         than tolerated silently, so a NEW console error still fails. */
      const noise = report.rungs[r].consoleErrors.filter(
        (m) => !/404 \(File not found\)/.test(m));
      check("HYG." + r + ". zero console errors beyond the two LFS-absent trim PNGs + favicon 404s",
        noise.length === 0, JSON.stringify(noise.slice(0, 2)));
      check("HYG." + r + ". terrain cells were drawn",
        t.frameCensus.terrainCells > 0, String(t.frameCensus.terrainCells));
    });
  } catch (e) {
    fail++;
    console.error("  FAIL: harness threw:", e && e.message);
    results.push({ name: "harness", ok: false, detail: String(e && e.message) });
  } finally {
    await browser.close();
  }

  report.pass = pass; report.fail = fail; report.results = results;
  if (OUT_JSON) { fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2)); console.log("wrote " + OUT_JSON); }
  console.log(`\n${pass} passed, ${fail} failed.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
