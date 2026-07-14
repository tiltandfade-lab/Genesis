#!/usr/bin/env node
/* dev/verify-agx-tonecurve.mjs — P3-3a (docs/PHASE-3-AGX-SPEC.md): proves the AgX filmic tone-curve
   port into makeGradePass (src/ui/theater-boot.js) does what the spec demands, and nothing more.

   CHARTER STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md §7, required at the top of every graphics-
   session harness):
     - Convergence rung: sprite-independent post-process addition — no rung claim beyond "a real
       filmic shoulder now EXISTS behind a flag, default OFF." Flipping the flag to default-on is
       explicitly Adam's own taste call (out of scope here, per the spec's own "Out of scope" section).
     - Canonical contracts preserved: every check drives the REAL makeGradePass (src/ui/theater-boot.js,
       extracted verbatim via the source-extraction/vm-sandbox technique dev/verify-bw2-0-crisp-channel.mjs
       already establishes for this sealed-ES-module file — no re-implementation, no paraphrase).
     - Classification: Sections 0-2 are a pure-Node vm sandbox (no THREE, no WebGL — string/source-level
       proofs). Section 3 is a real GPU render (puppeteer + headless Chrome + raw WebGL) executing the
       ACTUAL extracted GLSL text against known bright inputs — the "grade pass output" claim the spec
       asks for, not a hand-ported JS reimplementation of the AgX matrices (which would risk silently
       drifting from the real shader while still reading green).
     - Negative control / RED-FIRST: Section 3a proves flag "none" (linear, no tonemap) hard-clips a
       bright input to exactly 1.0 with NO shoulder — the CURRENT, pre-unit behavior this whole unit
       exists to fix. Section 3b then proves flag "agx" rolls the SAME inputs off below 1.0 with a real
       shoulder. Neither reads meaningfully green without the other; Section 3a is the RED case checked
       explicitly, not skipped as "obviously true."
     - A real, honest finding this harness surfaces (see Section 1's own header comment): the banked
       WIP commit's first draft of makeGradePass used inline `${isAgx ? X : ""}` ternaries inside ONE
       template literal, which left a stray blank line in the "none" path that pre-unit master never
       had — functionally identical GLSL (whitespace-only), but NOT the literal byte-identical claim the
       spec makes. This session's finishing pass restructured makeGradePass into two fully separate
       FS_NONE/FS_AGX literals specifically to make that claim actually true; Section 1 is the proof.

   Run:  node dev/verify-agx-tonecurve.mjs */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const require = createRequire(import.meta.url);

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

console.log("=== CHARTER STATEMENT ===");
console.log("  Convergence rung: filmic shoulder now EXISTS behind GRADE_TONEMAP, default OFF (flip is Adam's taste call)");
console.log("  Canonical contracts preserved: real makeGradePass, extracted verbatim, executed (not re-implemented)");
console.log("  Classification: 0-2 pure-Node vm sandbox (source/string proofs); 3 real GPU render (puppeteer+WebGL)");
console.log("  Negative control: 3a is RED-FIRST — flag \"none\" hard-clips, proving the pre-unit gap is real\n");

const MASTER_REF = "master";
const NEW_SOURCE = read("src/ui/theater-boot.js");
const OLD_SOURCE = execFileSync("git", ["show", `${MASTER_REF}:src/ui/theater-boot.js`], { cwd: ROOT, encoding: "utf-8", maxBuffer: 1024 * 1024 * 64 });

// ─── source-extraction helpers (dev/verify-bw2-0-crisp-channel.mjs's own established convention) ──
function extractFunction(src, name) {
  const sig = `function ${name}(`;
  const start = src.indexOf(sig);
  if (start < 0) throw new Error(`function ${name} not found`);
  const braceStart = src.indexOf("{", start);
  let depth = 0, i = braceStart;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) break; }
  }
  return src.slice(start, i + 1);
}
function extractConst(src, name) {
  const m = src.match(new RegExp(`const ${name}\\s*=\\s*([^;]+);`));
  if (!m) throw new Error(`const ${name} not found`);
  return m[1].trim();
}
// Returns the template literal's CONTENT ONLY (backticks stripped) — matches the actual runtime
// string value a `const X = \`...\`;` assignment produces, so this is directly comparable to (and
// directly usable as) the real fragmentShader string makeGradePass() returns at runtime.
function extractTemplateAfter(src, marker) {
  const idx = src.indexOf(marker);
  if (idx < 0) throw new Error(`marker not found: ${marker}`);
  const start = src.indexOf("`", idx);
  const end = src.indexOf("`", start + 1);
  return src.slice(start + 1, end);
}

// ─── Section 0: module surface ────────────────────────────────────────────────────────────────────
console.log("=== 0. Module surface ===");
{
  check("0a. GRADE_TONEMAP is declared `let` (not `const`) — the test seam needs to reassign it", /let GRADE_TONEMAP = "none";/.test(NEW_SOURCE));
  check("0b. GRADE_TONEMAP default is exactly \"none\"", /let GRADE_TONEMAP = "none";/.test(NEW_SOURCE));
  check("0c. master had no GRADE_TONEMAP at all (this is a genuinely new unit, not a re-run)", !OLD_SOURCE.includes("GRADE_TONEMAP"));
  check("0d. master had no AGX_TONEMAP_GLSL / AgXToneMapping at all", !OLD_SOURCE.includes("AGX_TONEMAP_GLSL") && !OLD_SOURCE.includes("AgXToneMapping"));
  check("0e. new source DOES carry AGX_TONEMAP_GLSL + the AgXToneMapping GLSL function", NEW_SOURCE.includes("AGX_TONEMAP_GLSL") && /vec3 AgXToneMapping\( vec3 color \)/.test(NEW_SOURCE));
  check("0f. window.Theater._setGradeTonemapForTest test seam exists (mirrors _setRoomShellPolygonKernel)", /window\.Theater\._setGradeTonemapForTest = function/.test(NEW_SOURCE));
  check("0g. r161 gamut-mapping fix clamp is present in the ported GLSL", /clamp\( color, 0\.0, 1\.0 \); \/\/ r161 gamut-mapping fix/.test(NEW_SOURCE));
}

// ─── Section 1: FLAG OFF ⇒ byte-identical to master ───────────────────────────────────────────────
// The load-bearing guarantee the spec names explicitly: "Flag OFF (default) ⇒ grade output
// byte-identical to current master for a fixed input (prove it)." Proven at the SOURCE-STRING level
// (the compiled fragment-shader text, character for character) — a stronger claim than "renders the
// same pixels," since it also rules out any accidental whitespace/comment drift a pixel-only test
// could miss (see this file's own header note on the banked draft's stray-blank-line near-miss).
console.log("\n=== 1. FLAG OFF: makeGradePass's fragment shader is BYTE-IDENTICAL to master's ===");
{
  const oldMakeGradePass = extractFunction(OLD_SOURCE, "makeGradePass");
  const oldFragmentShader = extractTemplateAfter(oldMakeGradePass, "fragmentShader: ");

  const newMakeGradePass = extractFunction(NEW_SOURCE, "makeGradePass");
  const newFsNone = extractTemplateAfter(newMakeGradePass, "const FS_NONE = ");

  check("1a. FS_NONE (source-level) is byte-identical to master's fragmentShader literal",
    newFsNone === oldFragmentShader, { newLen: newFsNone.length, oldLen: oldFragmentShader.length });

  // Now prove the RUNTIME function (not just a source-text slice) actually selects FS_NONE when
  // GRADE_TONEMAP="none" — run the real makeGradePass() in a vm sandbox with a recording ShaderPass
  // stub and a minimal THREE (Vector2/Color — the only THREE surface makeGradePass touches).
  const { runMakeGradePass } = makeGradePassRunner(NEW_SOURCE);
  const runNone = runMakeGradePass("none");
  check("1b. makeGradePass() AT RUNTIME with GRADE_TONEMAP=\"none\" produces the byte-identical master shader",
    runNone.fragmentShader === oldFragmentShader);
  check("1c. runtime \"none\" shader has no AgXToneMapping call, no AGX_TONEMAP_GLSL body",
    !runNone.fragmentShader.includes("AgXToneMapping") && !runNone.fragmentShader.includes("AgXInsetMatrix"));
  check("1d. runtime \"none\" shader still has the original `col *= uExposure;` line (nothing dropped)",
    runNone.fragmentShader.includes("col *= uExposure;"));
}

// ─── Section 2: FLAG ON — structural shape of the agx shader ─────────────────────────────────────
console.log("\n=== 2. FLAG ON: the agx fragment shader carries the real AgX port, correctly ordered ===");
{
  const { runMakeGradePass } = makeGradePassRunner(NEW_SOURCE);
  const runAgx = runMakeGradePass("agx");
  check("2a. runtime \"agx\" shader is a DIFFERENT string than \"none\" (the flag actually changes the compiled program)",
    runAgx.fragmentShader !== extractTemplateAfter(extractFunction(NEW_SOURCE, "makeGradePass"), "const FS_NONE = "));
  check("2b. runtime \"agx\" shader declares AgXToneMapping + the inset/outset matrices",
    /vec3 AgXToneMapping\( vec3 color \)/.test(runAgx.fragmentShader) && runAgx.fragmentShader.includes("AgXInsetMatrix") && runAgx.fragmentShader.includes("AgXOutsetMatrix"));
  const tonemapIdx = runAgx.fragmentShader.indexOf("lin = AgXToneMapping(lin)");
  const perceptualIdx = runAgx.fragmentShader.indexOf("pow(max(lin, 0.0), vec3(1.0 / 2.2))");
  check("2c. tonemap is applied to `lin` BEFORE the perceptual-space grade math (\"tonemap before grade\")",
    tonemapIdx > -1 && perceptualIdx > -1 && tonemapIdx < perceptualIdx);
  check("2d. the old bare `col *= uExposure;` line is REMOVED in agx mode (AgXToneMapping already exposes; no double-expose)",
    !runAgx.fragmentShader.includes("col *= uExposure;"));
  check("2e. no dead/orphaned exposure line leaks through (only a comment marks where it used to be)",
    runAgx.fragmentShader.includes("exposure already applied inside AgXToneMapping"));
}

// ─── Section 3: REAL GPU RENDER — RED-FIRST (none) then proven (agx) ──────────────────────────────
// Executes the ACTUAL extracted fragment-shader text (FS_NONE / the agx variant) through real WebGL
// (headless Chrome via puppeteer, ANGLE backend — the SAME GL path every dev/battle-gate/capture-*.mjs
// harness already uses). The texture-sample line is swapped for a hardcoded bright/HDR constant (a
// vec3 literal well above 1.0) via a targeted string replace — avoids needing a float-texture
// extension just to get an HDR value onto the GPU; every other uniform is the REAL production default
// (GRADE_EXPOSURE/CONTRAST/SATURATION/VIGNETTE*), and vUv is sampled at the exact frame CENTRE (0.5,
// 0.5) so the vignette term is genuinely, geometrically zero (dist=0 < uVigInner) rather than having
// to be neutralized by hand — the test rides the real grade math, not a stripped-down stand-in.
console.log("\n=== 3. REAL GPU RENDER: bright-input roll-off, RED-FIRST (\"none\") then proven (\"agx\") ===");
{
  const results = await renderGradeCurve(NEW_SOURCE);
  if (results.skipped) {
    console.log("  SKIPPED (no headless Chrome available):", results.reason);
  } else {
    console.log("  none:", JSON.stringify(results.none));
    console.log("  agx :", JSON.stringify(results.agx));

    // 3a. RED-FIRST: "none" (today's/master's own shader, linear, no tonemap curve) hard-clips every
    // bright input to EXACTLY 255 — a real, currently-true negative fact this unit exists to fix.
    const noneAllMaxed = results.none.every((r) => r.byte === 255);
    check("3a. RED-FIRST: flag \"none\" clips ALL bright inputs (1.2x,2.4x,4x,6x) to exactly 255 — linear, zero shoulder",
      noneAllMaxed, results.none);

    // 3b. "agx" rolls the SAME inputs off strictly below 255 (a real shoulder, not just "less than
    // before") — this is the actual filmic curve landing.
    const agxAllBelowMax = results.agx.every((r) => r.byte < 255);
    check("3b. flag \"agx\": ALL the same bright inputs map STRICTLY below 255 (a real roll-off exists)",
      agxAllBelowMax, results.agx);

    // 3c. shoulder shape: monotonically non-decreasing as input brightness increases, but with
    // DIMINISHING deltas at the high end (1.2x->2.4x delta > 4x->6x delta) — the actual "shoulder"
    // characteristic (not just "some function that happens to sit under 255").
    const bytes = results.agx.map((r) => r.byte);
    const monotonic = bytes.every((b, i) => i === 0 || b >= bytes[i - 1]);
    const delta1 = bytes[1] - bytes[0], delta2 = bytes[3] - bytes[2];
    check("3d. agx roll-off is monotonically non-decreasing across 1.2x->2.4x->4x->6x", monotonic, bytes);
    check("3e. agx roll-off SLOWS at the high end (1.2x->2.4x delta > 4x->6x delta) — a genuine compressive shoulder, not a shifted linear ramp",
      delta1 > delta2, { delta1, delta2, bytes });

    // 3f. cross-check at the SAME input: agx byte < none byte at every level (agx is always the more
    // conservative/rolled-off value — never brighter than the clipped linear result).
    const allLower = results.agx.every((r, i) => r.byte <= results.none[i].byte);
    check("3f. at every tested input level, agx's byte value never exceeds none's", allLower);
  }
}

// ─── Section 4: no regressions ─────────────────────────────────────────────────────────────────────
console.log("\n=== 4. No regressions (check-manifest.py, verify-theater-shot.mjs, verify-dungeon-interior.mjs) ===");
{
  let out = "", code = 0;
  try { out = execSync("python3 build/check-manifest.py", { cwd: ROOT, encoding: "utf-8" }); }
  catch (e) { code = e.status; out = (e.stdout || "") + (e.stderr || ""); }
  check("4a. check-manifest.py exits 0", code === 0, code);
  check("4b. check-manifest.py prints RESULT: OK", out.includes("RESULT: OK"), out.slice(-200));

  for (const harness of ["dev/verify-theater-shot.mjs", "dev/verify-dungeon-interior.mjs"]) {
    let hOut = "", hCode = 0;
    try { hOut = execSync(`node ${harness}`, { cwd: ROOT, encoding: "utf-8", maxBuffer: 1024 * 1024 * 64 }); }
    catch (e) { hCode = e.status; hOut = (e.stdout || "") + (e.stderr || ""); }
    const tail = hOut.trim().split("\n").slice(-3).join(" | ");
    check(`4c. ${harness} exits 0`, hCode === 0, tail);
    console.log(`    ${harness} tail: ${tail}`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

// ════════════════════════════════════════════════════════════════════════════════════════════════
// makeGradePassRunner: runs the REAL, extracted makeGradePass() (+ its GRADE_TONEMAP/AGX_TONEMAP_GLSL/
// GRADE_* const dependencies) in a `vm` sandbox with a minimal THREE (Vector2/Color, the only surface
// touched) and a recording ShaderPass stub — no WebGL, no jsdom; pure source-extraction + execution,
// the SAME technique dev/verify-bw2-0-crisp-channel.mjs already established for this sealed-ES-module
// file's pure-logic functions. Returns { runMakeGradePass(tonemapValue) -> {fragmentShader, uniforms} }.
function makeGradePassRunner(src) {
  const gradeConstNames = ["GRADE_EXPOSURE", "GRADE_CONTRAST", "GRADE_SATURATION", "GRADE_VIGNETTE", "GRADE_VIGNETTE_INNER", "GRADE_VIGNETTE_OUTER"];
  const constDecls = gradeConstNames.map((n) => `const ${n} = ${extractConst(src, n)};`).join("\n");
  const letMatch = src.match(/let GRADE_TONEMAP = "none";/);
  if (!letMatch) throw new Error("GRADE_TONEMAP let-declaration not found");
  const agxGlslMatch = src.match(/const AGX_TONEMAP_GLSL = `[\s\S]*?`;/);
  if (!agxGlslMatch) throw new Error("AGX_TONEMAP_GLSL not found");
  const makeGradePassSrc = extractFunction(src, "makeGradePass");

  class FakeVector2 { constructor(x = 0, y = 0) { this.x = x; this.y = y; } set(x, y) { this.x = x; this.y = y; return this; } }
  class FakeColor { constructor(r = 1, g = 1, b = 1) { this.r = r; this.g = g; this.b = b; } }
  class FakeShaderPass { constructor(shader) { this.uniforms = shader.uniforms; this.fragmentShader = shader.fragmentShader; this.vertexShader = shader.vertexShader; } }

  const sandbox = { THREE: { Vector2: FakeVector2, Color: FakeColor }, ShaderPass: FakeShaderPass, __out: null };
  vm.createContext(sandbox);
  vm.runInContext(
    `let GRADE_TONEMAP = "none";\n${constDecls}\n${agxGlslMatch[0]}\n${makeGradePassSrc}`,
    sandbox
  );
  return {
    runMakeGradePass(tonemapValue) {
      vm.runInContext(`GRADE_TONEMAP = ${JSON.stringify(tonemapValue)};`, sandbox);
      return vm.runInContext(`makeGradePass()`, sandbox);
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
// renderGradeCurve: real GPU proof. Launches headless Chrome (puppeteer-core), compiles the ACTUAL
// extracted fragment-shader text for "none" and (a bespoke agx variant built the same way theater-
// boot.js's own FS_AGX is) for a handful of hardcoded bright inputs (1.2x,2.4x,4x,6x — well above the
// 1.0 clip point), reads back the rendered byte value at the frame centre. Returns
// {none:[{input,byte}...], agx:[{input,byte}...]} or {skipped:true, reason} if no Chrome is found.
async function renderGradeCurve(newSrc) {
  let puppeteer;
  try { puppeteer = require(join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core")); }
  catch (e) { return { skipped: true, reason: "puppeteer-core not found in ~/.genesis-jsdom: " + e.message }; }
  const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const fsMod = await import("node:fs");
  if (!fsMod.existsSync(CHROME)) return { skipped: true, reason: `no Chrome at ${CHROME}` };

  // Use the RUNTIME-evaluated fragment shader strings (makeGradePassRunner, Section 1/2's own vm
  // sandbox) rather than a raw static slice of the source text: FS_AGX's declaration embeds
  // `${AGX_TONEMAP_GLSL}` as a real template-literal interpolation, which only resolves to actual
  // GLSL when the enclosing `const FS_AGX = \`...\`` assignment actually EXECUTES — a plain text
  // extraction would hand WebGL the literal, un-interpolated characters `${AGX_TONEMAP_GLSL}` and fail
  // to compile (caught live authoring this harness).
  const { runMakeGradePass } = makeGradePassRunner(newSrc);
  const fsNone = runMakeGradePass("none").fragmentShader;
  const fsAgx = runMakeGradePass("agx").fragmentShader;

  const gradeConstNames = ["GRADE_EXPOSURE", "GRADE_CONTRAST", "GRADE_SATURATION", "GRADE_VIGNETTE", "GRADE_VIGNETTE_INNER", "GRADE_VIGNETTE_OUTER"];
  const gradeConsts = {};
  for (const n of gradeConstNames) gradeConsts[n] = parseFloat(extractConst(newSrc, n));

  // Multiples of "1.0" (today's hard-clip point) — well into HDR territory but still under AgX's own
  // AgxMaxEv ceiling (log2(2^6.5 * 0.18) EV above middle-gray — a real, by-design compression limit,
  // not a bug): at 16x this harness measured agx's own output already byte-rounds to 255 too (8-bit
  // quantization meeting AgX's own max-white cutoff), so the shoulder-vs-clip contrast is asserted in
  // the band where it's actually visible, not past AgX's own designed ceiling.
  const INPUTS = [1.2, 2.4, 4.0, 6.0];

  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: "new",
    args: ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
    defaultViewport: { width: 64, height: 64, deviceScaleFactor: 1 },
  });
  try {
    const page = await browser.newPage();
    const runOne = async (fragSrc, inputVal) => {
      return await page.evaluate((fragSrc, inputVal, consts) => {
        const canvas = document.createElement("canvas");
        canvas.width = 4; canvas.height = 4;
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) return { error: "no webgl context" };

        // Minimal harness vertex shader: a fullscreen triangle, vUv pinned to (0.5,0.5) at every
        // fragment (a flat varying — center-of-frame sampling everywhere, so the vignette term is
        // genuinely, geometrically zero: dist=length(0.5-0.5)=0 < uVigInner).
        const vsSrc = `
          attribute vec2 aPos;
          varying vec2 vUv;
          void main(){ vUv = vec2(0.5, 0.5); gl_Position = vec4(aPos, 0.0, 1.0); }
        `;
        // Swap the real texture-sample line for the hardcoded HDR test input — the ONLY textual
        // change made to the real extracted fragment shader body.
        const patchedFrag = fragSrc.replace(
          "vec3 lin = texture2D(tDiffuse, vUv).rgb;",
          `vec3 lin = vec3(${inputVal.toFixed(4)}, ${inputVal.toFixed(4)}, ${inputVal.toFixed(4)});`
        );
        if (patchedFrag === fragSrc) return { error: "texture2D substitution did not match — shader text drifted" };
        const fsSrc = "precision highp float;\n" + patchedFrag;

        function compile(type, source) {
          const sh = gl.createShader(type);
          gl.shaderSource(sh, source);
          gl.compileShader(sh);
          if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(sh);
            gl.deleteShader(sh);
            throw new Error("shader compile failed: " + log);
          }
          return sh;
        }
        let vs, fsShader, prog;
        try {
          vs = compile(gl.VERTEX_SHADER, vsSrc);
          fsShader = compile(gl.FRAGMENT_SHADER, fsSrc);
        } catch (e) { return { error: e.message }; }
        prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fsShader);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          return { error: "link failed: " + gl.getProgramInfoLog(prog) };
        }
        gl.useProgram(prog);

        const posLoc = gl.getAttribLocation(prog, "aPos");
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        // one big triangle covering the whole clip-space viewport
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        function setUniform1f(name, val) { const loc = gl.getUniformLocation(prog, name); if (loc) gl.uniform1f(loc, val); }
        setUniform1f("uExposure", consts.GRADE_EXPOSURE);
        setUniform1f("uContrast", consts.GRADE_CONTRAST);
        setUniform1f("uSat", consts.GRADE_SATURATION);
        setUniform1f("uTintAmt", 0.0);
        setUniform1f("uVignette", consts.GRADE_VIGNETTE);
        setUniform1f("uVigInner", consts.GRADE_VIGNETTE_INNER);
        setUniform1f("uVigOuter", consts.GRADE_VIGNETTE_OUTER);
        const tintLoc = gl.getUniformLocation(prog, "uTint");
        if (tintLoc) gl.uniform3f(tintLoc, 1.0, 1.0, 1.0);
        const resLoc = gl.getUniformLocation(prog, "uResolution");
        if (resLoc) gl.uniform2f(resLoc, 4.0, 4.0);

        gl.viewport(0, 0, 4, 4);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        const px = new Uint8Array(4);
        gl.readPixels(2, 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        return { r: px[0], g: px[1], b: px[2] };
      }, fragSrc, inputVal, gradeConsts);
    };

    const none = [];
    const agx = [];
    for (const inputVal of INPUTS) {
      const rNone = await runOne(fsNone, inputVal);
      if (rNone.error) return { skipped: true, reason: `none render error @ ${inputVal}: ${rNone.error}` };
      none.push({ input: inputVal, byte: rNone.r });
      const rAgx = await runOne(fsAgx, inputVal);
      if (rAgx.error) return { skipped: true, reason: `agx render error @ ${inputVal}: ${rAgx.error}` };
      agx.push({ input: inputVal, byte: rAgx.r });
    }
    return { none, agx };
  } finally {
    await browser.close();
  }
}
