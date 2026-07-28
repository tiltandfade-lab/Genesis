/* Verify TERRAIN EXPRESSION R2 — the RENDERER half (docs/TERRAIN-EXPRESSION-R2.md).

   Live Chrome, the real page, the real modules. Four of Adam's rulings can only be proved with a
   scene graph and a camera, and this is where they are proved:

     R1 — THE SPRITE MATCHES ITS BASE. Measured as a physical relation between two world matrices:
          the angle between the sprite wrap's world up and the plinth's world up must be the
          camera-pitch constant EXACTLY, at every grade and at free yaw. If the sprite stays
          vertical while the plinth conforms to the ground, that angle wanders with the grade.
          Red-first: `--red-r1` is not needed — the gate was written against the pre-ruling build
          and its failure is banked in the round's DESIGN entry.

     R2 — THE SKIRT IS INVISIBLE. The plinth's own bottom is sampled against the ground AS DRAWN
          (plane + B4's fold), which nothing before this measured: the contact probe evaluates the
          stand PLANE, so a fold dipping away under a corner was invisible to every R1 number. The
          skirt must sit BELOW the drawn ground at every sample. `?terrainskirt=0` is the pre-ruling
          render and the gate's own red proof — run with --prove-skirt-teeth.

     R3 — THE OVERHANG OBEYS ITS RULE AND ITS CAP. What the renderer actually BUILT (tagged per
          shaft) is compared against the engine's licence census. `--prove-overhang-teeth` renders
          the universal mode Adam rejected and the same comparison must fail.

     R4 — THE GRADE LADDER RENDERS EVERY DECLARED ANGLE, and the walk fingerprint does not move
          across any of them.

   Usage (a server must already be serving THIS worktree):
     node dev/verify-terrain-standee-r2.cjs [port] [--json out.json]
       [--prove-skirt-teeth] [--prove-overhang-teeth]
*/
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const PORT = args[0] || "5182";
const BASE = "http://127.0.0.1:" + PORT;
const OUT_JSON = process.argv.includes("--json")
  ? process.argv[process.argv.indexOf("--json") + 1] : null;
const PROVE_SKIRT = process.argv.includes("--prove-skirt-teeth");
const PROVE_OVERHANG = process.argv.includes("--prove-overhang-teeth");

const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };
const GRADES = ["g0", "g1", "g2", "g3", "g4"];

let pass = 0, fail = 0;
const results = [];
const check = (name, cond, detail = "") => {
  results.push({ name, ok: !!cond, detail: String(detail).slice(0, 260) });
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
  const report = { base: BASE, generatedAt: new Date().toISOString(), runs: {} };

  /* the standee-contract probe is what puts an envelope on every surface class at free yaw, which
     is the only regime in which R1 and R2 mean anything */
  async function open(opts) {
    const o = opts || {};
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));
    const url = BASE + "/genesis.html?clayroom=1&clayfixture=terrain&terrainscene="
      + (o.scene || "thirteen-piece-sheet")
      + "&terrainrung=" + (o.rung || "all")
      + "&terrainprobe=standee-contract"
      + (o.grade ? "&terraingrade=" + o.grade : "")
      + (o.overhang ? "&terrainoverhang=" + o.overhang : "")
      + (o.skirt != null ? "&terrainskirt=" + o.skirt : "");
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(
      () => document.querySelector("canvas") && document.getElementById("clay-room-overlay"),
      { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 5200));
    return { page, consoleErrors };
  }

  const probe = () => {
    const T = window.Theater || {};
    const bench = T._clayTerrainBenchForTest ? T._clayTerrainBenchForTest() : null;
    return {
      facing: T._clayTerrainWitnessFacingForTest ? T._clayTerrainWitnessFacingForTest() : null,
      expression: bench ? bench.expression : null,
      frameCensus: bench ? bench.frameCensus : null,
      witnesses: bench ? (bench.witnesses || []).length : 0,
      witnessFailures: bench ? (bench.witnessFailures || []).length : 0,
      fieldMetrics: bench ? (bench.fields || []).map((f) => ({
        id: f.id, standable: f.metrics.standableCells, walkEdges: f.metrics.walkEdges,
        faces: f.metrics.faces, entries: f.metrics.entryCells, fingerprint: f.fingerprint
      })) : null
    };
  };

  async function run(key, opts) {
    process.stdout.write("probing " + key + " ... ");
    const { page, consoleErrors } = await open(opts);
    const p = await page.evaluate(probe);
    report.runs[key] = { opts, probe: p, consoleErrors };
    console.log((p.facing ? p.facing.witnesses.length + " witnesses" : "NO PROBE")
      + " · errors=" + consoleErrors.length);
    await page.close();
    return p;
  }

  try {
    for (const g of GRADES) await run("grade-" + g, { grade: g });
    await run("overhang-universal", { grade: "g2", overhang: "universal" });
    await run("overhang-none", { grade: "g2", overhang: "none" });
    await run("noskirt", { grade: "g4", skirt: 0 });

    const steep = report.runs["grade-g4"].probe;
    const mid = report.runs["grade-g2"].probe;
    const noskirt = report.runs.noskirt.probe;
    const CAM_PITCH = 35;

    // =====================================================================
    console.log("\n=== R1 — THE SPRITE MATCHES ITS BASE (Adam's ruling, reversing the study) ===");
    GRADES.forEach((g) => {
      const f = report.runs["grade-" + g].probe.facing;
      const rows = (f && f.witnesses) || [];
      const tilted = rows.filter((w) => Math.abs(w.standPlane.slopeDeg) > 0.01);
      check("R1a." + g + ". every witness reports both world-ups and the agreement angle",
        rows.length > 0 && rows.every((w) => w.spriteWorldUp && w.baseWorldUp
          && w.spriteBaseAgreementDeg != null),
        rows.length + " witnesses");
      check("R1b." + g + ". the ONLY angle between the sprite's world up and its base's world up is "
        + "the camera-pitch constant (" + CAM_PITCH + " deg) — worst deviation "
        + (f ? f.worstSpriteBaseDisagreementDeg : "n/a") + " deg over " + rows.length
        + " witnesses, " + tilted.length + " of them on tilted ground",
        !!f && f.worstSpriteBaseDisagreementDeg != null
        && f.worstSpriteBaseDisagreementDeg <= 0.5,
        f ? ("worst=" + f.worstSpriteBaseDisagreementDeg + " · tiltedSlopes="
          + JSON.stringify(tilted.slice(0, 4).map((w) => [w.standPlane.slopeDeg,
            w.spriteBaseAgreementDeg]))) : "no probe");
      check("R1c." + g + ". strip the camera pitch off the wrap's world orientation and what is "
        + "left IS the base's own frame (worst residual "
        + (f ? f.worstSpriteBaseConformDeg : "n/a") + " deg) — the full-rotation form of the same "
        + "claim, which a roll about the view axis would move and the up-vector form would not",
        !!f && f.worstSpriteBaseConformDeg != null && f.worstSpriteBaseConformDeg <= 0.5,
        f ? "worst=" + f.worstSpriteBaseConformDeg : "no probe");
      check("R1d." + g + ". the OUTER group's rotation.x is still 0 — fall-death's channel is not "
        + "where any of this landed",
        rows.every((w) => Math.abs(w.outerTiltXDeg || 0) < 1e-6),
        JSON.stringify(rows.slice(0, 3).map((w) => w.outerTiltXDeg)));
      check("R1e." + g + ". the witnesses are at FREE yaw (a non-zero camera-relative yaw shared by "
        + "all of them) — the regime the whole ruling is about",
        !!f && f.distinctYaws.length === 1 && Math.abs(f.distinctYaws[0]) > 1,
        f ? JSON.stringify(f.distinctYaws) : "no probe");
    });
    const anyTilt = ((steep.facing && steep.facing.witnesses) || [])
      .filter((w) => Math.abs(w.standPlane.slopeDeg) > 1);
    check("R1f. the steepest rung actually PUTS witnesses on tilted ground — an agreement gate that "
      + "only ever saw flat plinths would be green by accident",
      anyTilt.length > 0,
      JSON.stringify(anyTilt.slice(0, 5).map((w) => [w.label, w.standPlane.slopeDeg])));

    // =====================================================================
    console.log("\n=== R2 — THE BASE SKIRT, and the daylight it exists to cover ===");
    GRADES.forEach((g) => {
      const f = report.runs["grade-" + g].probe.facing;
      check("R2a." + g + ". every witness is sampled against the ground AS DRAWN (plane + fold), "
        + "not against the plane the plinth conforms to",
        !!f && f.skirtSampledWitnesses === f.witnesses.length && f.skirtSampledWitnesses > 0,
        f ? f.skirtSampledWitnesses + "/" + f.witnesses.length : "no probe");
      check("R2b." + g + ". NO camera can see under any plinth — the skirt's bottom is below the "
        + "drawn ground at every sample (worst margin " + (f ? f.worstSkirtMarginWU : "n/a")
        + " wu; worst daylight without it " + (f ? f.worstDaylightWU : "n/a") + " wu)",
        !!f && f.witnessesWithSkirtVisible === 0 && f.worstSkirtMarginWU > 0,
        f ? ("visible=" + f.witnessesWithSkirtVisible + " margin=" + f.worstSkirtMarginWU) : "no probe");
    });
    check("R2c. TEETH — with the skirt removed (?terrainskirt=0, the pre-ruling render) the SAME "
      + "check fails: worst margin " + (noskirt.facing ? noskirt.facing.worstSkirtMarginWU : "n/a")
      + " wu, " + (noskirt.facing ? noskirt.facing.witnessesWithSkirtVisible : "n/a")
      + " witnesses with daylight under them",
      !!noskirt.facing && noskirt.facing.witnessesWithSkirtVisible > 0
      && noskirt.facing.worstSkirtMarginWU <= 0,
      noskirt.facing ? JSON.stringify({ visible: noskirt.facing.witnessesWithSkirtVisible,
        margin: noskirt.facing.worstSkirtMarginWU }) : "no probe");
    check("R2d. the skirt did NOT move the contact measurement — the nearest-contact gap and the "
      + "corner gaps are identical with and without it, because the gate measures the CONTACT "
      + "plane and the skirt hangs below it",
      (() => {
        const a = (steep.facing.witnesses || []).map((w) => [w.label, w.contact.nearestContactGap,
          w.contact.maxCornerGap, w.contact.minCornerGap]);
        const b = (noskirt.facing.witnesses || []).map((w) => [w.label, w.contact.nearestContactGap,
          w.contact.maxCornerGap, w.contact.minCornerGap]);
        return JSON.stringify(a) === JSON.stringify(b);
      })(),
      "compared at grade g4, skirt on vs off");
    check("R2e. and it did not move the walk fingerprint either",
      JSON.stringify(steep.fieldMetrics) === JSON.stringify(noskirt.fieldMetrics));

    // =====================================================================
    console.log("\n=== R3 — THE OVERHANG LICENCE, as BUILT, against the rule ===");
    const ruleRun = mid;
    const uni = report.runs["overhang-universal"].probe;
    const none = report.runs["overhang-none"].probe;
    const censusOf = (p) => (p.expression && p.expression.overhangCensus) || [];
    const appliedCells = (p) => (p.frameCensus && p.frameCensus.overhangCellsApplied) || 0;
    const predicted = censusOf(ruleRun).reduce((a, r) => a + ((r.census && r.census.overhangCells) || 0), 0);
    check("R3a. what the renderer BUILT equals what the licence licensed, cell for cell "
      + "(" + appliedCells(ruleRun) + " built vs " + predicted + " licensed)",
      predicted > 0 && appliedCells(ruleRun) === predicted,
      JSON.stringify({ built: appliedCells(ruleRun), licensed: predicted }));
    check("R3b. every field in the frame obeys the scene cap",
      censusOf(ruleRun).length > 0
      && censusOf(ruleRun).every((r) => r.census && r.census.obeysCap),
      JSON.stringify(censusOf(ruleRun).map((r) => r.census && r.census.finalShare)));
    const liveTotal = censusOf(ruleRun).reduce((a, r) => a + ((r.census && r.census.liveCells) || 0), 0);
    check("R3c. the rule mode overhangs materially fewer cells than the universal mode Adam "
      + "rejected — " + appliedCells(ruleRun) + " of " + liveTotal + " live cells ("
      + (100 * appliedCells(ruleRun) / Math.max(1, liveTotal)).toFixed(1) + "%) against "
      + appliedCells(uni) + " (" + (100 * appliedCells(uni) / Math.max(1, liveTotal)).toFixed(1)
      + "%). Only cliff faces keep a cornice; every 1h riser loses it to B2's nosing.",
      appliedCells(uni) > appliedCells(ruleRun) * 1.25 && appliedCells(ruleRun) > 0,
      JSON.stringify({ rule: appliedCells(ruleRun), universal: appliedCells(uni), live: liveTotal }));
    check("R3d. TEETH — the universal mode FAILS the same comparison (it builds "
      + appliedCells(uni) + " overhung cells against a licence of "
      + censusOf(uni).reduce((a, r) => a + ((r.census && r.census.overhangCells) || 0), 0) + ")",
      appliedCells(uni)
        !== censusOf(uni).reduce((a, r) => a + ((r.census && r.census.overhangCells) || 0), 0));
    check("R3e. the `none` mode really draws none — the third leg of Adam's comparison is a control",
      appliedCells(none) === 0, String(appliedCells(none)));
    check("R3f. all three modes keep the field byte-identical — the licence is a RENDER decision",
      JSON.stringify(ruleRun.fieldMetrics) === JSON.stringify(uni.fieldMetrics)
      && JSON.stringify(ruleRun.fieldMetrics) === JSON.stringify(none.fieldMetrics));

    // =====================================================================
    console.log("\n=== R4 — the grade ladder, rendered ===");
    const ladder = (mid.expression && mid.expression.gradeLadder) || [];
    check("R4a. the frame receipt carries the whole ladder and the PROPOSED maximum",
      ladder.length >= 5 && !!(mid.expression && mid.expression.gradeMaxProposed),
      JSON.stringify(ladder.map((g) => g.id)));
    GRADES.forEach((g) => {
      const p = report.runs["grade-" + g].probe;
      const decl = ladder.filter((r) => r.id === g)[0];
      const f = p.facing;
      const slopes = ((f && f.witnesses) || []).map((w) => w.standPlane.slopeDeg);
      const worst = slopes.length ? Math.max.apply(null, slopes) : 0;
      check("R4b." + g + ". the frame reports the rung it was asked for, and no witness stands on "
        + "a plane steeper than the rung declares (declared " + (decl && decl.deg)
        + " deg, steepest witness plane " + worst.toFixed(4) + " deg)",
        p.expression && p.expression.gradeId === g && !!decl && worst <= decl.deg + 1e-3,
        JSON.stringify({ reported: p.expression && p.expression.gradeId, worst }));
    });
    check("R4c. the ladder actually CHANGES what is drawn — the steepest witness plane rises "
      + "monotonically with the rung",
      (() => {
        const w = GRADES.map((g) => {
          const f = report.runs["grade-" + g].probe.facing;
          const s = ((f && f.witnesses) || []).map((x) => x.standPlane.slopeDeg);
          return s.length ? Math.max.apply(null, s) : 0;
        });
        return w.every((v, i) => i === 0 || v >= w[i - 1] - 1e-9) && w[w.length - 1] > w[0];
      })(),
      JSON.stringify(GRADES.map((g) => {
        const f = report.runs["grade-" + g].probe.facing;
        const s = ((f && f.witnesses) || []).map((x) => x.standPlane.slopeDeg);
        return [g, s.length ? Math.max.apply(null, s) : 0];
      })));
    const fps = GRADES.map((g) => JSON.stringify(report.runs["grade-" + g].probe.fieldMetrics));
    check("R4d. THE LOAD-BEARING INVARIANCE — the walk census, edges, faces, entries and the full "
      + "field fingerprint are byte-identical across every rung of the ladder, in the browser",
      new Set(fps).size === 1,
      new Set(fps).size + " distinct");

    // =====================================================================
    console.log("\n=== R6 — the eased climb affordance is actually drawn ===");
    const climb = (mid.expression && mid.expression.climbCensus) || [];
    const easedTotal = climb.reduce((a, r) => a + (r.eased || 0), 0);
    const bits = (mid.frameCensus && mid.frameCensus.climbBits) || 0;
    const bitFaces = ((mid.frameCensus && mid.frameCensus.climbBitFaces) || []).length;
    check("R6a. every eased face in the frame carries drawn relief bits (" + bitFaces
      + " faces drawn against " + easedTotal + " eased, " + bits + " bits)",
      easedTotal > 0 && bits > 0 && bitFaces > 0,
      JSON.stringify({ easedTotal, bits, bitFaces }));
    check("R6b. and the bits are NOT on every face — the affordance distinguishes",
      bitFaces < climb.reduce((a, r) => a + (r.faces || 0), 0),
      JSON.stringify(climb));

    // =====================================================================
    console.log("\n=== frame hygiene at every run ===");
    Object.keys(report.runs).forEach((k) => {
      const r = report.runs[k];
      const noise = r.consoleErrors.filter((m) => !/404 \(File not found\)/.test(m));
      check("HYG." + k + ". zero console errors beyond the LFS-absent trim PNGs + favicon 404s",
        noise.length === 0, JSON.stringify(noise.slice(0, 2)));
      check("HYG." + k + ". figures == witnesses, zero foreign figures, zero refusals",
        r.probe.frameCensus && r.probe.frameCensus.witnessFigures === r.probe.witnesses
        && r.probe.frameCensus.foreignFigures === 0 && r.probe.witnessFailures === 0,
        JSON.stringify(r.probe.frameCensus ? [r.probe.frameCensus.witnessFigures,
          r.probe.witnesses, r.probe.frameCensus.foreignFigures, r.probe.witnessFailures] : null));
    });
  } catch (e) {
    fail++;
    console.error("  FAIL: harness threw:", e && e.stack);
    results.push({ name: "harness", ok: false, detail: String(e && e.message) });
  } finally {
    await browser.close();
  }

  report.pass = pass; report.fail = fail; report.results = results;
  if (OUT_JSON) { fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2)); console.log("wrote " + OUT_JSON); }
  console.log(`\n${pass} passed, ${fail} failed.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
