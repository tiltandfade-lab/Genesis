/* Verify BEAUTY-WAVE-2 BW2-0 (docs/BEAUTY-WAVE-2.md, "THE CRISP CHANNEL") — the mode-7 crust root
   cause: applyPsxCanvasSize (src/ui/theater-boot.js) squeezed the renderer's DRAWING BUFFER to
   PSX_RES_SCALE (1/3) of the CSS box by default, then CSS-stretched it back up — a double resample
   (nearest-minify into a third-res buffer, then chunk-upscale) that reads as mode-7 shimmer/warp.
   Adam's mid-flight ruling (2026-07-10 night, docs commit 82bc5936 "PS1 RETIRED GAME-WIDE"): drop the
   channel-gating this unit's own spec originally called for (interior full-res / tabletop kept-PSX)
   in favor of ONE clean look everywhere — S.psxEnabled defaults false game-wide (tabletop included),
   the buffer defaults to CSS x min(devicePixelRatio,2), and the dither/vertex-snap shader stretch
   items (PSX_DITHER_ENABLED/PSX_VERTEX_SNAP_ENABLED) default off too. The opts.psx escape hatch stays
   functional both directions (a dev/nostalgia toggle, never the shipped default) so the ORIGINAL 1/3
   squeeze is still reachable on request — this harness proves that path too.

   theater-boot.js is the ONE ES-module boundary file in Genesis (bare `import * as THREE`) — its
   pure numeric helpers (applyPsxCanvasSize, the mount()-opts one-liner, spriteTextureFor's filter
   assignment) don't touch THREE or the DOM at all, so this harness extracts just those function
   bodies via regex and evaluates them in a bare `vm` sandbox with fake S/THREE/window/renderer/canvas
   stand-ins — no jsdom, no WebGL, matching dev/verify-dungeon-semantics.mjs's "THREE-free vm sandbox"
   precedent for pure logic, rather than dev/verify-theater-sprites.mjs's heavier jsdom+vendored-three
   subprocess (unneeded here since nothing in this unit touches scene-graph construction).

   RED-FIRST (pinned pre-fix ref, NEVER a derived merge-base — dev/verify-dungeon-interior.mjs check
   22's own comment explains why a derived ref self-invalidates the moment this unit merges into
   master): PREFIX_REF = 864261b5, the master tip this branch forked from (git log proves it — the
   commit right before this unit's own edits). At that ref: `psxEnabled: true` (PSX-by-default),
   `applyPsxCanvasSize` scale = S.psxEnabled ? PSX_RES_SCALE : 1 (no dpr cap at all), sprite texture
   minFilter = NearestFilter, PSX_DITHER_ENABLED/PSX_VERTEX_SNAP_ENABLED = true.

   Checks:
     1. sanity — the pinned pre-fix source predates this unit's own additions (canvasBufferInfo/
        measureRenderFps/spriteFilterAudit absent), proving this is really the pre-fix source.
     2. RED-FIRST — pre-fix applyPsxCanvasSize, called with its OWN default S.psxEnabled=true, squeezes
        the drawing buffer to exactly cssW/cssH x (1/3) — provably LESS than the CSS box.
     3. FIXED — applyPsxCanvasSize, default S.psxEnabled=false: buffer === CSS x min(dpr,2), both at
        dpr=1 (buffer===CSS) and dpr=3 (capped at x2, not x3); image-rendering "auto".
     4. FIXED — the SAME function with S.psxEnabled explicitly true (the dev escape hatch) still
        reproduces the ORIGINAL 1/3 squeeze on request; image-rendering "pixelated".
     5. channel-agnostic — applyPsxCanvasSize's fixed source never references board-kind/lastBoard;
        the identical function/scale serves the tabletop and the interior channel alike (no per-
        channel gating exists to drift, per Adam's "no legacy-look maintenance" ruling).
     6. defaults — createTheaterState's psxEnabled literal is false (RED: pre-fix literal is true);
        PSX_DITHER_ENABLED/PSX_VERTEX_SNAP_ENABLED are both false (RED: both true pre-fix).
     7. escape hatch — mount()'s opts.psx one-liner is symmetric: {psx:true} flips S.psxEnabled true,
        {psx:false} is a no-op against the new false default, opts undefined leaves it untouched.
     8. sprite filter law — spriteTextureFor's texture-load callback sets magFilter=Nearest (unchanged)
        and minFilter=Linear (RED: pre-fix sets minFilter=Nearest); generateMipmaps stays false.
        MUTATION: reverting minFilter to NearestFilter in the extracted snippet flips this check red —
        proving it's load-bearing, not a check that would pass regardless.
     9. world/kit untouched — the shared nearestify(tex) helper (every world/kit/grain/pixel-skin/
        dressing/effect texture entry point) is BYTE-IDENTICAL between the pre-fix and fixed source —
        this unit touched creature-sprite filtering ONLY, never the shared world-texture helper.

   Run:  node dev/verify-bw2-0-crisp-channel.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const PREFIX_REF = "864261b5"; // pinned: the master tip this feat/bw2-0-crisp-channel branch forked from
const NEW_SOURCE = read("src/ui/theater-boot.js");
const OLD_SOURCE = execFileSync("git", ["show", `${PREFIX_REF}:src/ui/theater-boot.js`], { cwd: ROOT, encoding: "utf-8" });

console.log("\n[1 — sanity: pinned pre-fix ref really predates this unit]");
check("pre-fix source has no canvasBufferInfo (this unit's own diagnostic)", !OLD_SOURCE.includes("canvasBufferInfo"));
check("pre-fix source has no measureRenderFps (this unit's own diagnostic)", !OLD_SOURCE.includes("measureRenderFps"));
check("pre-fix source has no spriteFilterAudit (this unit's own diagnostic)", !OLD_SOURCE.includes("spriteFilterAudit"));
check("fixed source DOES carry all three (proves we're reading the real edited file)",
  NEW_SOURCE.includes("canvasBufferInfo") && NEW_SOURCE.includes("measureRenderFps") && NEW_SOURCE.includes("spriteFilterAudit"));

// ============================================================================
// helper: extract a top-level `function NAME(...){ ... }` body verbatim via brace counting (regex
// alone can't balance nested braces reliably; this is the same technique a linter's own bracket-
// matcher would use, applied once, statically, at verify time — not a runtime dependency).
// ============================================================================
function extractFunction(src, name){
  const sig = `function ${name}(`;
  const start = src.indexOf(sig);
  if(start < 0) throw new Error(`function ${name} not found`);
  const braceStart = src.indexOf("{", start);
  let depth = 0, i = braceStart;
  for(; i < src.length; i++){
    if(src[i] === "{") depth++;
    else if(src[i] === "}"){ depth--; if(depth === 0) break; }
  }
  return src.slice(start, i + 1);
}

function runApplyPsxCanvasSize(fnSrc, { psxEnabled, dpr }){
  const setSizeCalls = [];
  const sandbox = {
    S: { psxEnabled },
    window: (typeof dpr === "number") ? { devicePixelRatio: dpr } : undefined,
    PSX_RES_SCALE: 1 / 3,
    result: null,
  };
  vm.createContext(sandbox);
  const fakeRenderer = { setSize(w, h, updateStyle){ setSizeCalls.push({ w, h, updateStyle }); } };
  const fakeCanvas = { style: {} };
  sandbox.__renderer = fakeRenderer;
  sandbox.__canvas = fakeCanvas;
  vm.runInContext(`${fnSrc}\napplyPsxCanvasSize(__renderer, __canvas, 1920, 1080);`, sandbox);
  return { call: setSizeCalls[0], canvas: fakeCanvas };
}

console.log("\n[2 — RED-FIRST: pre-fix applyPsxCanvasSize squeezes the drawing buffer to 1/3 by default]");
{
  const oldFnSrc = extractFunction(OLD_SOURCE, "applyPsxCanvasSize");
  check("pre-fix source has NO devicePixelRatio reference at all (no dpr cap existed)", !oldFnSrc.includes("devicePixelRatio"));
  const red = runApplyPsxCanvasSize(oldFnSrc, { psxEnabled: true }); // true = pre-fix's OWN default
  const expected = Math.round(1920 * (1 / 3));
  check(`RED-FIRST PROVEN: pre-fix buffer width (${red.call.w}) < CSS width (1920) — the 1/3 squeeze`, red.call.w < 1920);
  check(`pre-fix buffer width is exactly cssW x PSX_RES_SCALE = ${expected}`, red.call.w === expected);
  check("pre-fix canvas.style.imageRendering is 'pixelated' (PSX-by-default)", red.canvas.style.imageRendering === "pixelated");
}

console.log("\n[3 — FIXED: applyPsxCanvasSize, default S.psxEnabled=false — buffer = CSS x min(dpr,2)]");
{
  const newFnSrc = extractFunction(NEW_SOURCE, "applyPsxCanvasSize");
  const dpr1 = runApplyPsxCanvasSize(newFnSrc, { psxEnabled: false, dpr: 1 });
  check("dpr=1: buffer width === CSS width (1920)", dpr1.call.w === 1920, `got ${dpr1.call.w}`);
  check("dpr=1: buffer height === CSS height (1080)", dpr1.call.h === 1080, `got ${dpr1.call.h}`);
  check("dpr=1: canvas.style.imageRendering is 'auto' (clean default)", dpr1.canvas.style.imageRendering === "auto");

  const dpr3 = runApplyPsxCanvasSize(newFnSrc, { psxEnabled: false, dpr: 3 });
  check("dpr=3: buffer width capped at CSS x 2, NOT x3 (3840, not 5760)", dpr3.call.w === 3840, `got ${dpr3.call.w}`);

  const dpr175 = runApplyPsxCanvasSize(newFnSrc, { psxEnabled: false, dpr: 1.75 });
  check("dpr=1.75 (below cap): buffer honors the real ratio (3360)", dpr175.call.w === Math.round(1920 * 1.75), `got ${dpr175.call.w}`);
}

console.log("\n[4 — FIXED: the dev escape hatch (S.psxEnabled explicitly true) still reproduces the ORIGINAL squeeze]");
{
  const newFnSrc = extractFunction(NEW_SOURCE, "applyPsxCanvasSize");
  const retro = runApplyPsxCanvasSize(newFnSrc, { psxEnabled: true, dpr: 2 }); // dpr must be IGNORED on this path
  const expected = Math.round(1920 * (1 / 3));
  check(`retro (psxEnabled:true): buffer width still exactly cssW x 1/3 = ${expected} regardless of dpr`, retro.call.w === expected, `got ${retro.call.w}`);
  check("retro: canvas.style.imageRendering is 'pixelated'", retro.canvas.style.imageRendering === "pixelated");
}

console.log("\n[5 — channel-agnostic: the fixed function carries NO board-kind/lastBoard gating]");
{
  const newFnSrc = extractFunction(NEW_SOURCE, "applyPsxCanvasSize");
  check("fixed applyPsxCanvasSize never references S.lastBoard", !newFnSrc.includes("lastBoard"));
  check("fixed applyPsxCanvasSize never references .kind (no per-channel branch)", !/\.kind\b/.test(newFnSrc));
  check("only ONE scale expression exists in the function (single code path for every caller/channel)",
    (newFnSrc.match(/const scale = /g) || []).length === 1);
}

console.log("\n[6 — defaults: psxEnabled / PSX_DITHER_ENABLED / PSX_VERTEX_SNAP_ENABLED all default OFF]");
{
  check("RED: pre-fix createTheaterState literal is `psxEnabled: true,`", /psxEnabled:\s*true,/.test(OLD_SOURCE));
  check("FIXED: createTheaterState literal is `psxEnabled: false,`", /psxEnabled:\s*false,/.test(NEW_SOURCE));
  check("RED: pre-fix PSX_DITHER_ENABLED = true", /const PSX_DITHER_ENABLED = true;/.test(OLD_SOURCE));
  check("RED: pre-fix PSX_VERTEX_SNAP_ENABLED = true", /const PSX_VERTEX_SNAP_ENABLED = true;/.test(OLD_SOURCE));
  check("FIXED: PSX_DITHER_ENABLED = false", /const PSX_DITHER_ENABLED = false;/.test(NEW_SOURCE));
  check("FIXED: PSX_VERTEX_SNAP_ENABLED = false", /const PSX_VERTEX_SNAP_ENABLED = false;/.test(NEW_SOURCE));
  // WORLD_PSX_ENABLED was already ruled off at VP0, before this unit — confirm it's STILL false (untouched).
  check("WORLD_PSX_ENABLED stays false (VP0's own ruling, untouched by this unit)", /const WORLD_PSX_ENABLED = false;/.test(NEW_SOURCE));
}

console.log("\n[7 — escape hatch: mount()'s opts.psx one-liner is symmetric]");
{
  const m = NEW_SOURCE.match(/if\(opts && typeof opts\.psx === "boolean"\) S\.psxEnabled = opts\.psx;/);
  check("mount() carries the symmetric opts.psx line verbatim", !!m);
  const line = m && m[0];
  function runOptsLine(optsVal){
    const sandbox = { S: { psxEnabled: false }, opts: optsVal };
    vm.createContext(sandbox);
    vm.runInContext(line, sandbox);
    return sandbox.S.psxEnabled;
  }
  check("opts={psx:true} flips S.psxEnabled to true", runOptsLine({ psx: true }) === true);
  check("opts={psx:false} is a no-op against the false default (stays false)", runOptsLine({ psx: false }) === false);
  check("opts=undefined leaves S.psxEnabled untouched (stays false, never throws)", runOptsLine(undefined) === false);
}

console.log("\n[8 — sprite filter law: mag Nearest (unchanged), min Linear (was Nearest)]");
{
  function extractSpriteFilterSnippet(src){
    const anchor = 'function spriteTextureFor(slug){';
    const start = src.indexOf(anchor);
    if(start < 0) throw new Error("spriteTextureFor not found");
    const loadCbStart = src.indexOf("function(tex){", start);
    const magIdx = src.indexOf("tex.magFilter", loadCbStart);
    const mipsIdx = src.indexOf("tex.generateMipmaps", magIdx);
    const lineEnd = src.indexOf(";", mipsIdx) + 1;
    return src.slice(magIdx, lineEnd);
  }
  function runSpriteFilterSnippet(snippet){
    const sandbox = { tex: {}, THREE: { NearestFilter: "NEAREST", LinearFilter: "LINEAR" } };
    vm.createContext(sandbox);
    vm.runInContext(snippet, sandbox);
    return sandbox.tex;
  }

  const oldSnippet = extractSpriteFilterSnippet(OLD_SOURCE);
  const oldTex = runSpriteFilterSnippet(oldSnippet);
  check("RED: pre-fix sprite texture minFilter is Nearest (the bug)", oldTex.minFilter === "NEAREST", `got ${oldTex.minFilter}`);

  const newSnippet = extractSpriteFilterSnippet(NEW_SOURCE);
  const newTex = runSpriteFilterSnippet(newSnippet);
  check("FIXED: sprite texture magFilter stays Nearest", newTex.magFilter === "NEAREST", `got ${newTex.magFilter}`);
  check("FIXED: sprite texture minFilter is now Linear", newTex.minFilter === "LINEAR", `got ${newTex.minFilter}`);
  check("FIXED: generateMipmaps stays false (NPOT-safe, no mipmap requirement)", newTex.generateMipmaps === false);

  // MUTATION: prove the minFilter check is load-bearing — reverting Linear->Nearest in the extracted
  // snippet must flip check (b) red, or this whole group is checking nothing.
  const mutated = newSnippet.replace("THREE.LinearFilter", "THREE.NearestFilter");
  check("sanity: the mutation actually changed the snippet text", mutated !== newSnippet);
  const mutTex = runSpriteFilterSnippet(mutated);
  check("MUTATION: with minFilter reverted to Nearest, the 'now Linear' assertion correctly REDS",
    mutTex.minFilter !== "LINEAR", `mutant minFilter=${mutTex.minFilter} (should not equal LINEAR)`);
}

console.log("\n[9 — world/kit untouched: nearestify(tex) is byte-identical pre-fix vs fixed]");
{
  const oldNearestify = extractFunction(OLD_SOURCE, "nearestify");
  const newNearestify = extractFunction(NEW_SOURCE, "nearestify");
  check("nearestify() function body is BYTE-IDENTICAL between pre-fix and fixed source (world/kit path never touched)",
    oldNearestify === newNearestify);
  check("nearestify() still sets BOTH magFilter and minFilter to NearestFilter",
    /magFilter = THREE\.NearestFilter/.test(newNearestify) && /minFilter = THREE\.NearestFilter/.test(newNearestify));
}

console.log(`\n${pass} passed, ${fail} failed`);
if(fail > 0) process.exit(1);
