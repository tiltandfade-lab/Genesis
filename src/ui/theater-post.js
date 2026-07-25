/* THEATER POST — the BEAUTY-WAVE-3 POST SUITE (BW3-2 tilt-shift DoF · BW3-3 emissive-masked bloom ·
   BW3-6 filmic grade + the P3-3a AgX shoulder) and the CLAYROOM-CHECKPOINT-1 ENVIRONMENT AO pass,
   extracted VERBATIM from src/ui/theater-boot.js in split step B4 (2026-07-25;
   docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   OWNERSHIP: everything between the beauty render and the screen. The four effect-pass factories
   (makeDofPass, makeGradePass, MaskedBloomPass, EnvironmentAOPass/makeEnvironmentAOPass), the AO
   prepass exclusion predicate (envAOPrepassExcludes) and its bounded authored settings (ENV_AO_*),
   and the suite's whole lifecycle: buildPostSuite (lazy construction onto S.postSuite),
   syncPostSuiteResolution (device-pixel resize), updateDofFocus (focal-band tracking),
   updatePostSuiteGrade (per-realm grade + the LIGHT_TUNABLES push), mountPostSuite /
   teardownPostSuite (the composer addPass/removePass chain, interior boards only). This module owns
   NO scheduler, NO DOM and NO end-of-life authority: the ROOT still disposes S.postSuite in retire()
   exactly as before, so there is still ONE true dispose point.

   THIS MODULE IS THE `three/addons/postprocessing` HOME for its own passes: RenderPass / ShaderPass /
   UnrealBloomPass / OutputPass / GTAOPass are imported here directly, with the IDENTICAL specifier
   spellings the root used (same vendored, pinned three@0.166.0 addons tree, same module instances —
   an ES import resolves by URL, so `GTAOPass` here IS the class the root's own
   _setEnvironmentAOOutputForTest reads OUTPUT off). The root keeps the imports it still has readers
   for (EffectComposer — it constructs the composer; RenderPass — the BW3-0 empty-chain cost probe;
   GTAOPass — the OUTPUT enum map behind _setEnvironmentAOOutputForTest) and DROPPED the three whose
   only readers moved here (ShaderPass, UnrealBloomPass, OutputPass).

   CTX LAW (recon §7.3 — acyclic imports; same shape as theater-clay-room.js / theater-light-lab.js /
   theater-skins.js / theater-whole-object.js): this module NEVER imports theater-boot.js.
   Capabilities arrive ONCE via postInit(ctx) into the module-local mirrors below, so every moved body
   keeps its bare identifiers. Unlike the B3 leaves, this module DOES read and write the live theater
   state record (S.postSuite / S.postSuiteMounted / S.dofFocusDist / S.dofFocusNdcY / S.renderer /
   S.composer / S.camera / S.scene / S.boardCenter / S.mounted / S.lightProfileKey), so the root also
   calls postSyncState(S) at BOTH `S = createTheaterState()` reassignment sites, beside the existing
   clayRoomSyncState/lightLabSyncState calls.

   ROOT-OWNED, DELIBERATELY NOT MOVED (they arrive through ctx instead):
     GRADE_TONEMAP + BLOOM_MASK_DISABLED_FOR_TEST — mutable root `let`s that window.Theater's
       _setGradeTonemapForTest / _setBloomMaskDisabledForTest seams reassign at runtime. An import
       binding is read-only and a copied mirror would go stale the moment a harness flips one, so both
       are read LIVE through accessors (postCtxGetGradeTonemap / postCtxBloomMaskDisabled) — B2/B3's
       flag law. These are the ONLY two non-verbatim production lines in this file (both marked with an
       inline `split B4` note at the exact line).
     BLOOM_LAYER — shared with non-post root code (interiorBuildFixtureGroup stamps it on every true
       emitter) and with the clay room's ctx; the root stays its single owner.
     LIGHT_TUNABLES / LIGHT_DEFAULT_PROFILE / GRADE_EXPOSURE_FLOOR / hexStrToNum — the LIGHT_TUNABLES
       live seam plus its authored seed and the generic hex helper. The LIGHT_TUNABLES SEED consts
       (STAGE_AMBIENT_FLOOR, GRADE_EXPOSURE_FLOOR, BLOOM_THRESHOLD, BLOOM_STRENGTH, GRADE_TINT_SCALE,
       GRADE_TINT_MAX, the ITR_ and sprite ones) stay in the root as ONE coherent set — B2's own law
       ("the lab is the UI over LIGHT_TUNABLES, not the owner of render-path values") and
       verify-light-lab / verify-visible-practicals / verify-e0-1-fixture-fade's scrape set. What moved
       here is only what a post BODY reads exclusively: the DOF dials, BLOOM_RADIUS /
       BLOOM_RESOLUTION_SCALE, the non-tunable GRADE_* uniform seeds, and AGX_TONEMAP_GLSL.

   SHADER-KEY LAW: not one byte inside a shader SOURCE string changed — AGX_TONEMAP_GLSL, the DoF
   fragment shader, and makeGradePass's FS_NONE / FS_AGX literals are the same characters they were in
   the monolith (dev/verify-agx-tonecurve.mjs diffs FS_NONE against pre-AgX master character for
   character, and three keys compiled programs on that source text). The one grade-pass line that DID
   change is the `isAgx` selector OUTSIDE both literals. Nothing here carries onBeforeCompile or
   customProgramCacheKey — applyPsxShaderTweaks, the file's one onBeforeCompile funnel, is read by
   fifteen NON-post root material sites (tiles, props, walls, floors, risers, world surfaces) and by
   theater-skins/theater-whole-object through their own ctx, so it STAYED in the root, untouched.
   PROVEN LIVE, not argued: hooking WebGL(2)RenderingContext.prototype.shaderSource on the clay-room
   lights fixture and exercising every gated variant (AO off/on, tonemap none/agx, bloom mask on/off)
   records 88 compile calls / 59 unique GLSL sources, and the sorted-set SHA-256 is IDENTICAL before
   and after this split — 0a3a363373a6e5128fcfd20815e63a583a07e77d6c17cf27c6656f895eee1250 — with a
   same-code A/A control confirming that census is deterministic. (The clay-room AO A/B PNG capture
   cannot answer this question: its canvas width varies run to run, so a same-code A/A control differs
   in up to 66% of pixels. The shader-source census is the deterministic instrument for this law.)

   NON-VERBATIM EDITS (the complete list): this header, the import/mirror/init prologue below, the
   four `split B4` chunk-boundary notes marking where a root-owned const was left behind, the two
   accessor lines named above, and the trailing `export {...}` block. Not one other byte inside a
   moved declaration changed. */
import * as THREE from "three";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
// BEAUTY-WAVE-3 BW3-3 (docs/BEAUTY-WAVE-3.md, SELECTIVE BLOOM): UnrealBloomPass, threshold-gated so
// only the brightest EMISSIVE pixels bloom (flame apexes, the BW3-4 fake-volumetric cone apex, chrome
// glow seams, spell FX) — a lit-but-albedo white sprite stays under threshold (the negative control).
// Vendored the SAME way as EffectComposer/RenderPass/ShaderPass above (pinned three@0.166.0, the
// `three/addons/` importmap); its own internal deps (Pass.js FullScreenQuad, CopyShader,
// LuminosityHighPassShader) are vendored alongside it under the same addons tree.
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
// BEAUTY-WAVE-3 THE POST SUITE — the composer's effect passes render into LINEAR intermediate targets
// (RenderPass writes un-encoded linear; only a direct-to-screen renderer.render applies the sRGB OETF).
// A custom ShaderPass drawn to screen does NOT re-encode, so without this the graded/blurred frame
// showed up crushed-dark (round-1/2 failure). OutputPass is three's canonical final pass: it applies
// the renderer's tone mapping (NoToneMapping here) + the sRGB transfer, so the chain ends correct and
// matches the direct-render baseline. ALWAYS the last pass in the interior chain.
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";

// ---- root-capability mirrors (wired once by postInit; S re-synced by postSyncState) ----
let S;
let postCtxGetGradeTonemap, postCtxBloomMaskDisabled;
let hexStrToNum, BLOOM_LAYER, GRADE_EXPOSURE_FLOOR, LIGHT_DEFAULT_PROFILE, LIGHT_TUNABLES;

export function postInit(ctx){
  ({ hexStrToNum,
    BLOOM_LAYER,
    GRADE_EXPOSURE_FLOOR,
    LIGHT_DEFAULT_PROFILE,
    LIGHT_TUNABLES } = ctx);
  S = ctx.S;
  postCtxGetGradeTonemap = ctx.postCtxGetGradeTonemap;
  postCtxBloomMaskDisabled = ctx.postCtxBloomMaskDisabled;
}
export function postSyncState(nextS){ S = nextS; }

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   BEAUTY-WAVE-3 — THE POST SUITE (BW3-2 TILT-SHIFT DoF · BW3-3 SELECTIVE BLOOM · BW3-6 FILMIC GRADE)
   docs/BEAUTY-WAVE-3.md. Three effect passes that mount ONTO BW3-0's EffectComposer seam, INTERIOR
   BOARDS ONLY (the flat tabletop stays pass-free — it dies at UW3). Chain order, each frame:
       RenderPass  ->  DoF  ->  Bloom  ->  Grade(->screen)
   Grade LAST so it is judged over the bloomed frame (the spec's own ordering: "grade is judged after
   bloom"). SUBTLE is the law — every dial below is tuned so the effect is FELT (the photographed-
   miniature cue, the emissive halo, the realm's mood) but never NAMED as an effect. The dials are the
   TASTE-iterate surface (Opus loop): change the numbers here, re-shoot, re-read vs the mocks.
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

// ── TILT-SHIFT DoF dials (BW3-2). Screen-space vertical tilt-shift: a sharp horizontal focal BAND
// centred on the projected board-centre (the action cluster for a "beat" fit, the room centre for a
// "room" fit — it TRACKS because S.boardCenter itself moves per fitMode), blur ramping toward the
// near-foreground (screen bottom, nearer under the elevated camera) and far-background (screen top,
// farther). This is the classic tilt-shift lens the miniature-photography cue is built on — near/far
// map DIRECTLY to screen-vertical under a fixed elevation, so a vertical CoC gradient IS a depth
// gradient here, and it needs no depth buffer (cheaper, robust across ortho AND persp interior cams).
// UV space: v in [0,1]. FOCUS_HALF = half-height of the fully-sharp band; RAMP = UV distance over
// which CoC climbs 0->1 past the band; MAX_BLUR = peak sample radius (capped CoC — the whisper cap).
const DOF_FOCUS_HALF = 0.16;   // fully-sharp band spans ~32% of screen height around the focal row
const DOF_RAMP = 0.42;         // gentle climb to full blur — no hard focus edge
const DOF_MAX_BLUR = 0.0055;   // peak CoC radius in UV (~9px at 1600px tall) — a whisper, capped here
const DOF_STRENGTH = 0.85;     // global master (0 = off); per-realm nudge folds in at mount

// split B4: BLOOM_THRESHOLD / BLOOM_STRENGTH (the two SELECTIVE BLOOM dials LIGHT_TUNABLES seeds
// itself from, with their own header prose) stayed in theater-boot.js beside the rest of the
// LIGHT_TUNABLES seed set; buildPostSuite reads them through LIGHT_TUNABLES.bloomThreshold/
// bloomStrength exactly as before. These two are read ONLY by the bodies in this file.
const BLOOM_RADIUS = 0.5;      // spread of the halo (tighter = the wash stays ON the emissive)
const BLOOM_RESOLUTION_SCALE = 0.5; // half-res bloom chain (fps)

// split B4: BLOOM_LAYER (shared with interiorBuildFixtureGroup) and BLOOM_MASK_DISABLED_FOR_TEST (a
// mutable root `let`) stayed in theater-boot.js and arrive through ctx — see this file's header.

// ── FILMIC GRADE dials (BW3-6). One per-realm post grade: exposure -> ACES filmic tone curve ->
// contrast (both MONOTONIC, so the VALUE LAW ordering floor<wall<light survives in pixels, not just
// in the material data verify-scene-direction asserts) -> saturation shape -> per-realm tint wash ->
// vignette. The per-realm TINT + its strength come from the interior tile kit's OWN authored
// gradeTint/gradeStrength (theater-interior.js — the SAME data the material grade and the BW2-4b
// sprite-emissive tint already read), so flagships carry their tuned hue (chrome cool, fantasy warm,
// gloom cold-violet) and the 9 non-flagship realms inherit whatever their kit authored (or neutral).
// The existing whisper-fog + vignette-in-render stay UNDER this (they're in the scene; this grades the
// composited frame on top). GRADE_TINT_SCALE maps kit.gradeStrength (a material-grade strength, ~0.1-
// 0.3) down to a gentle post wash so the grade doesn't double-hit the already-graded materials.
// NOTE (round 2): the frame the composer reads is ALREADY the renderer's tone-mapped, sRGB-encoded
// LDR output — so a full ACES tone curve here (round 1) DOUBLE-tonemapped and crushed the already-dark
// torch-lit scenes toward black, leaving only the red lantern light (the "everything went red/dark"
// failure). The grade is now a gentle LDR colour grade: lift-preserving soft contrast + saturation +
// a capped realm tint wash + a soft vignette. No tone curve. Every luminance stage stays monotonic so
// the VALUE LAW ordering survives in pixels.
const GRADE_EXPOSURE = 1.02;   // barely-there lift
const GRADE_CONTRAST = 1.05;   // very gentle S around mid — a touch of mood, never crushing
const GRADE_SATURATION = 1.07; // a touch richer, never garish

// split B4: GRADE_TINT_SCALE / GRADE_TINT_MAX sat here in the monolith; they are LIGHT_TUNABLES seeds
// (read at runtime as LIGHT_TUNABLES.gradeTintScale / .gradeTintMax by updatePostSuiteGrade below),
// so they stayed in theater-boot.js with the rest of that seed set.
const GRADE_VIGNETTE = 0.20;   // edge darkening depth (the mocks all carry a soft vignette)
const GRADE_VIGNETTE_INNER = 0.34; // radius (from centre, UV) where the vignette starts
const GRADE_VIGNETTE_OUTER = 0.92; // radius where it reaches full depth (corners ~0.71 in a wide frame)

// split B4: GRADE_EXPOSURE_FLOOR (another LIGHT_TUNABLES seed, with its own long TUNING header) and
// GRADE_TONEMAP (a mutable root `let`) stayed in theater-boot.js; both arrive through ctx above.

// AgX tone-mapping GLSL — VERBATIM port from three.js r166 (three@0.166.1,
// node_modules/three/src/renderers/shaders/ShaderChunk/tonemapping_pars_fragment.glsl.js's
// `AgXToneMapping` + `agxDefaultContrastApprox` + the rec2020<->linear-sRGB matrices), including the
// r161 gamut-mapping fix (the final `clamp(color, 0.0, 1.0)` — pre-r161 AgX could leave saturated
// primaries out of range post-outset-matrix; r161 added this clamp as the gamut fix). Do NOT hand-
// approximate this curve — every constant below is copied byte-for-byte from that three.js source
// file. `uExposure` is the same uniform already declared in makeGradePass's shader (three's own chunk
// reads a same-purpose global `toneMappingExposure` uniform, not a function parameter — mirrored here
// for the same reason: the exposure multiply is the curve's own entry point, not the caller's).
const AGX_TONEMAP_GLSL = `
  const mat3 AGX_LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
    vec3( 0.6274, 0.0691, 0.0164 ),
    vec3( 0.3293, 0.9195, 0.0880 ),
    vec3( 0.0433, 0.0113, 0.8956 )
  );
  const mat3 AGX_LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
    vec3( 1.6605, - 0.1246, - 0.0182 ),
    vec3( - 0.5876, 1.1329, - 0.1006 ),
    vec3( - 0.0728, - 0.0083, 1.1187 )
  );
  vec3 agxDefaultContrastApprox( vec3 x ) {
    vec3 x2 = x * x;
    vec3 x4 = x2 * x2;
    return + 15.5 * x4 * x2
      - 40.14 * x4 * x
      + 31.96 * x4
      - 6.868 * x2 * x
      + 0.4298 * x2
      + 0.1191 * x
      - 0.00232;
  }
  vec3 AgXToneMapping( vec3 color ) {
    const mat3 AgXInsetMatrix = mat3(
      vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
      vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
      vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
    );
    const mat3 AgXOutsetMatrix = mat3(
      vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
      vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
      vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
    );
    const float AgxMinEv = - 12.47393;  // log2( pow( 2, LOG2_MIN=-10.0 ) * MIDDLE_GRAY=0.18 )
    const float AgxMaxEv = 4.026069;    // log2( pow( 2, LOG2_MAX=+6.5 ) * MIDDLE_GRAY=0.18 )
    color *= uExposure;
    color = AGX_LINEAR_SRGB_TO_LINEAR_REC2020 * color;
    color = AgXInsetMatrix * color;
    color = max( color, 1e-10 ); // avoid 0 or negative numbers for log2
    color = log2( color );
    color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
    color = clamp( color, 0.0, 1.0 );
    color = agxDefaultContrastApprox( color ); // sigmoid
    color = AgXOutsetMatrix * color;
    color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) ); // linearize
    color = AGX_LINEAR_REC2020_TO_LINEAR_SRGB * color;
    color = clamp( color, 0.0, 1.0 ); // r161 gamut-mapping fix — simple clamp
    return color;
  }
`;

// DoF tilt-shift: a Poisson-ish 12-tap disc scaled by a vertical-gradient CoC. Aspect-corrected so the
// blur disc stays circular on a wide canvas. Sharp inside the focal band, ramping to MAX_BLUR at the
// screen's near/far edges.
function makeDofPass(){
  const shader = {
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uFocusV: { value: 0.5 },
      uFocusHalf: { value: DOF_FOCUS_HALF },
      uRamp: { value: DOF_RAMP },
      uMaxBlur: { value: DOF_MAX_BLUR },
      uStrength: { value: DOF_STRENGTH }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform vec2 uResolution;
      uniform float uFocusV, uFocusHalf, uRamp, uMaxBlur, uStrength;
      void main(){
        vec4 base = texture2D(tDiffuse, vUv);
        // CoC from vertical distance to the focal band (near/far == screen bottom/top under the
        // elevated camera). Capped at 1.0 -> the whisper cap on max blur.
        float d = abs(vUv.y - uFocusV);
        float coc = clamp((d - uFocusHalf) / max(uRamp, 1e-4), 0.0, 1.0) * uStrength;
        if(coc <= 0.001){ gl_FragColor = base; return; }
        float r = coc * uMaxBlur;
        float ar = uResolution.x / max(uResolution.y, 1.0); // aspect correct: circular disc
        // 12-tap disc (unit-circle offsets) + centre.
        vec2 o[12];
        o[0]=vec2(0.94,0.0); o[1]=vec2(0.47,0.82); o[2]=vec2(-0.47,0.82); o[3]=vec2(-0.94,0.0);
        o[4]=vec2(-0.47,-0.82); o[5]=vec2(0.47,-0.82); o[6]=vec2(0.35,0.20); o[7]=vec2(-0.35,0.20);
        o[8]=vec2(0.0,-0.42); o[9]=vec2(0.0,0.42); o[10]=vec2(0.62,-0.36); o[11]=vec2(-0.62,-0.36);
        vec4 sum = base;
        for(int i=0;i<12;i++){
          vec2 off = vec2(o[i].x / ar, o[i].y) * r;
          sum += texture2D(tDiffuse, vUv + off);
        }
        gl_FragColor = sum / 13.0;
      }
    `
  };
  const pass = new ShaderPass(shader);
  pass.__bwName = "dof";
  return pass;
}

// Filmic grade: exposure, ACES tone (Narkowicz approx), contrast, saturation, per-realm tint wash,
// vignette. Every luminance-affecting stage is monotonic so value ordering survives.
// P3-3a: GRADE_TONEMAP gates AGX_TONEMAP_GLSL into the fragment shader AT COMPILE TIME (a JS-string
// branch, not a runtime `if` — mirrors the ROOM_SHELL_POLYGON_KERNEL/ROOM_PLACE_DISTRIBUTE staging
// discipline). When GRADE_TONEMAP is "none" every one of the isAgx-gated template slots below expands
// to the empty string, so the compiled shader source is the SAME program that shipped before this
// unit — "none" is not "agx with a flag check that happens to no-op," it is the original shader with
// nothing inserted, which is what makes the byte-identical claim safe to make.
function makeGradePass(){
  const isAgx = postCtxGetGradeTonemap() === "agx"; // split B4: GRADE_TONEMAP is a root `let` the facade setter writes — read live through the accessor (the shader SOURCE strings below are byte-identical)
  // TWO FULLY SEPARATE literals (not one template with inline ${isAgx?...:""} ternaries) — a ternary
  // that resolves to "" still leaves behind the literal's own surrounding newline/indentation at that
  // slot, so the "none" string would carry a stray blank line the pre-P3-3a source never had: close,
  // but not the byte-identical claim this unit's spec (docs/PHASE-3-AGX-SPEC.md) and flag actually
  // promise. FS_NONE below is a verbatim, uneditable copy of the fragment shader as it existed before
  // this unit (verify-agx-tonecurve.mjs diffs it character-for-character against
  // `git show <master>:src/ui/theater-boot.js`) — do not "clean up" or reformat it.
  const FS_NONE = `
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform vec2 uResolution;
      uniform float uExposure, uContrast, uSat, uTintAmt, uVignette, uVigInner, uVigOuter;
      uniform vec3 uTint;
      void main(){
        // The composer buffer is LINEAR. Grade in a PERCEPTUAL (sRGB-ish) space so the dials read
        // intuitively (a 0.5 pivot really is mid-grey), then hand a linear result back to OutputPass,
        // which applies the real sRGB OETF at the end of the chain. gamma 2.2 approximation is plenty
        // for a grade (the display encode is OutputPass's exact job, not this one's).
        vec3 lin = texture2D(tDiffuse, vUv).rgb;
        vec3 col = pow(max(lin, 0.0), vec3(1.0 / 2.2)); // linear -> perceptual
        col *= uExposure;
        col = clamp((col - 0.5) * uContrast + 0.5, 0.0, 1.0); // gentle S around mid (monotonic)
        float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = mix(vec3(luma), col, uSat);
        col *= mix(vec3(1.0), uTint, uTintAmt); // per-realm wash (multiplicative — chrome cool, etc.)
        // soft radial vignette (edge0<edge1 so it's well-defined: 0 at centre -> uVignette at corners)
        float dist = length(vUv - 0.5);
        float vig = smoothstep(uVigInner, uVigOuter, dist);
        col *= (1.0 - uVignette * vig);
        col = pow(clamp(col, 0.0, 1.0), vec3(2.2)); // perceptual -> linear (OutputPass encodes to sRGB)
        gl_FragColor = vec4(col, 1.0);
      }
    `;
  // FS_AGX: the SAME shader body, with AGX_TONEMAP_GLSL declared once above main() and one extra line
  // (AgXToneMapping(lin), right after the texture read) inserted before the perceptual grade math —
  // "tonemap before grade." The old `col *= uExposure;` line is dropped here (not just commented) since
  // AgXToneMapping already applies uExposure itself, three's own convention (see AGX_TONEMAP_GLSL's
  // header comment) — applying it twice would double-expose.
  const FS_AGX = `
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform vec2 uResolution;
      uniform float uExposure, uContrast, uSat, uTintAmt, uVignette, uVigInner, uVigOuter;
      uniform float uExposureFloor, uTonemapStrength;
      uniform vec3 uTint;
      ${AGX_TONEMAP_GLSL}
      void main(){
        // The composer buffer is LINEAR. Grade in a PERCEPTUAL (sRGB-ish) space so the dials read
        // intuitively (a 0.5 pivot really is mid-grey), then hand a linear result back to OutputPass,
        // which applies the real sRGB OETF at the end of the chain. gamma 2.2 approximation is plenty
        // for a grade (the display encode is OutputPass's exact job, not this one's).
        vec3 lin = texture2D(tDiffuse, vUv).rgb;
        // LL-1 EXPOSURE FLOOR (GRADE_EXPOSURE_FLOOR/LIGHT_TUNABLES.gradeExposureFloor, above) — a LIFT
        // (max, never a cap) applied BEFORE AgXToneMapping so near-black shadow detail survives the
        // curve's own log2 domain instead of crushing to 0 (ledger #12/13). The curve itself
        // (AgXToneMapping/AGX_TONEMAP_GLSL, verbatim three.js port) is untouched.
        lin = max(lin, vec3(uExposureFloor));
        vec3 untonemapped = lin;
        lin = AgXToneMapping(lin); // P3-3a: filmic shoulder — tonemap BEFORE the perceptual grade math
        // Keep the authored 1.0 default on the byte-stable pre-Lab shader path. Only an intentional
        // partial-strength preview pays for the blend.
        if(uTonemapStrength < 0.9999) lin = mix(untonemapped, lin, uTonemapStrength);
        vec3 col = pow(max(lin, 0.0), vec3(1.0 / 2.2)); // linear -> perceptual
        // exposure already applied inside AgXToneMapping (its own uExposure multiply, three's own convention)
        col = clamp((col - 0.5) * uContrast + 0.5, 0.0, 1.0); // gentle S around mid (monotonic)
        float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = mix(vec3(luma), col, uSat);
        col *= mix(vec3(1.0), uTint, uTintAmt); // per-realm wash (multiplicative — chrome cool, etc.)
        // soft radial vignette (edge0<edge1 so it's well-defined: 0 at centre -> uVignette at corners)
        float dist = length(vUv - 0.5);
        float vig = smoothstep(uVigInner, uVigOuter, dist);
        col *= (1.0 - uVignette * vig);
        col = pow(clamp(col, 0.0, 1.0), vec3(2.2)); // perceptual -> linear (OutputPass encodes to sRGB)
        gl_FragColor = vec4(col, 1.0);
      }
    `;
  const shader = {
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uExposure: { value: GRADE_EXPOSURE },
      uContrast: { value: GRADE_CONTRAST },
      uSat: { value: GRADE_SATURATION },
      uTint: { value: new THREE.Color(1, 1, 1) },
      uTintAmt: { value: 0.0 },
      uVignette: { value: GRADE_VIGNETTE },
      uVigInner: { value: GRADE_VIGNETTE_INNER },
      uVigOuter: { value: GRADE_VIGNETTE_OUTER },
      // LL-1: unused by FS_NONE (harmless — an unread uniform), read by FS_AGX only. Seeded from the
      // bare const here (matching uExposure/uContrast/uSat/uVignette*'s own siblings just above —
      // makeGradePass() must stay independently constructible without a live LIGHT_TUNABLES in scope,
      // the same isolation dev/verify-agx-tonecurve.mjs's vm-sandbox extraction already depends on for
      // every OTHER uniform here); updatePostSuiteGrade (below) pushes the LIVE LIGHT_TUNABLES.
      // gradeExposureFloor value onto this uniform on every mount/tunable-change, same as every other
      // grade dial — this seed is only ever the very first frame's value pre-first-push.
      uExposureFloor: { value: GRADE_EXPOSURE_FLOOR },
      uTonemapStrength: { value: 1.0 }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: isAgx ? FS_AGX : FS_NONE
  };
  const pass = new ShaderPass(shader);
  pass.__bwName = "grade";
  return pass;
}

// LL-1 — MaskedBloomPass: a thin subclass of UnrealBloomPass (vendor/three/addons/postprocessing/
// UnrealBloomPass.js — verbatim, unmodified there) that substitutes an EMISSIVE-ISOLATED texture for
// the bright-pass extraction's source, while leaving every other stage (blur mip chain, composite,
// final additive blend onto the real readBuffer) byte-identical to the parent's own render(). See
// BLOOM_LAYER's own header comment (above) for the "why"; this class is the "how".
class MaskedBloomPass extends UnrealBloomPass {
  constructor(resolution, strength, radius, threshold){
    super(resolution, strength, radius, threshold);
    // Feeds ONLY the bright-pass extraction (itself already downsampled to half of `resolution` —
    // renderTargetBright's own size, parent constructor above) — matching that same size is enough
    // resolution for a threshold+blur read; no reason to isolate at full drawing-buffer res.
    const resx = Math.max(1, Math.round(resolution.x / 2)), resy = Math.max(1, Math.round(resolution.y / 2));
    this.emissiveIsolateTarget = new THREE.WebGLRenderTarget(resx, resy, { type: THREE.HalfFloatType });
    this.emissiveIsolateTarget.texture.name = "MaskedBloomPass.emissiveIsolate";
    this.emissiveIsolateTarget.texture.generateMipmaps = false;
    this._isolateLayers = new THREE.Layers();
    this._isolateLayers.disableAll();
    this._isolateLayers.enable(BLOOM_LAYER);
  }
  // Called ONCE per frame, BEFORE composer.render() (renderTheaterFrame's own new call site, below) —
  // Pass.render() only ever receives already-rendered buffer textures, never a live scene/camera to
  // re-render from, so the isolate render can't happen inside render() itself. Cheap: everything NOT
  // on BLOOM_LAYER is SKIPPED by three's own camera-layers test before draw, not drawn-then-discarded —
  // a room with 1-2 lit fixtures draws 1-2 meshes here, not the whole scene graph.
  updateEmissiveIsolate(renderer, scene, camera){
    const priorMask = camera.layers.mask;
    const priorTarget = renderer.getRenderTarget();
    const priorClear = new THREE.Color();
    renderer.getClearColor(priorClear);
    const priorAlpha = renderer.getClearAlpha();
    camera.layers.mask = this._isolateLayers.mask;
    renderer.setRenderTarget(this.emissiveIsolateTarget);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
    renderer.render(scene, camera);
    camera.layers.mask = priorMask;
    renderer.setRenderTarget(priorTarget);
    renderer.setClearColor(priorClear, priorAlpha);
  }
  setSize(width, height){
    super.setSize(width, height);
    const resx = Math.max(1, Math.round(width / 2)), resy = Math.max(1, Math.round(height / 2));
    this.emissiveIsolateTarget.setSize(resx, resy);
  }
  dispose(){
    super.dispose();
    this.emissiveIsolateTarget.dispose();
  }
  // Verbatim mirror of UnrealBloomPass.render() (vendor/three/addons/postprocessing/UnrealBloomPass.js)
  // with exactly ONE substitution, called out inline below: the bright-pass extraction reads
  // `this.emissiveIsolateTarget.texture` instead of `readBuffer.texture`. Every later stage (blur mips,
  // composite, final additive blend) still targets the REAL readBuffer exactly as the parent does, so
  // the full base frame is always preserved underneath — only the bloom halo's SOURCE is masked.
  render(renderer, writeBuffer, readBuffer, deltaTime, maskActive){
    renderer.getClearColor(this._oldClearColor);
    this.oldClearAlpha = renderer.getClearAlpha();
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setClearColor(this.clearColor, 0);
    if(maskActive) renderer.state.buffers.stencil.setTest(false);
    if(this.renderToScreen){
      this.fsQuad.material = this.basic;
      this.basic.map = readBuffer.texture;
      renderer.setRenderTarget(null);
      renderer.clear();
      this.fsQuad.render(renderer);
    }
    // 1. Extract Bright Areas — FROM THE EMISSIVE-ISOLATED TEXTURE (the one substitution vs. parent,
    // which reads readBuffer.texture here instead). BLOOM_MASK_DISABLED_FOR_TEST (test-only seam, above)
    // reverts to readBuffer.texture on demand — the exact pre-LL-1 behavior — for a live RED/GREEN A/B.
    this.highPassUniforms["tDiffuse"].value = postCtxBloomMaskDisabled() ? readBuffer.texture : this.emissiveIsolateTarget.texture; // split B4: root `let` behind its ctx accessor (see header)
    this.highPassUniforms["luminosityThreshold"].value = this.threshold;
    this.fsQuad.material = this.materialHighPassFilter;
    renderer.setRenderTarget(this.renderTargetBright);
    renderer.clear();
    this.fsQuad.render(renderer);
    // 2. Blur all the mips progressively (verbatim parent logic).
    let inputRenderTarget = this.renderTargetBright;
    for(let i = 0; i < this.nMips; i++){
      this.fsQuad.material = this.separableBlurMaterials[i];
      this.separableBlurMaterials[i].uniforms["colorTexture"].value = inputRenderTarget.texture;
      this.separableBlurMaterials[i].uniforms["direction"].value = UnrealBloomPass.BlurDirectionX;
      renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.separableBlurMaterials[i].uniforms["colorTexture"].value = this.renderTargetsHorizontal[i].texture;
      this.separableBlurMaterials[i].uniforms["direction"].value = UnrealBloomPass.BlurDirectionY;
      renderer.setRenderTarget(this.renderTargetsVertical[i]);
      renderer.clear();
      this.fsQuad.render(renderer);
      inputRenderTarget = this.renderTargetsVertical[i];
    }
    // Composite all the mips (verbatim parent logic).
    this.fsQuad.material = this.compositeMaterial;
    this.compositeMaterial.uniforms["bloomStrength"].value = this.strength;
    this.compositeMaterial.uniforms["bloomRadius"].value = this.radius;
    this.compositeMaterial.uniforms["bloomTintColors"].value = this.bloomTintColors;
    renderer.setRenderTarget(this.renderTargetsHorizontal[0]);
    renderer.clear();
    this.fsQuad.render(renderer);
    // Blend it additively over the REAL input texture (readBuffer — the full, unmasked scene).
    this.fsQuad.material = this.blendMaterial;
    this.copyUniforms["tDiffuse"].value = this.renderTargetsHorizontal[0].texture;
    if(maskActive) renderer.state.buffers.stencil.setTest(true);
    if(this.renderToScreen){
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(readBuffer);
      this.fsQuad.render(renderer);
    }
    renderer.setClearColor(this._oldClearColor, this.oldClearAlpha);
    renderer.autoClear = oldAutoClear;
  }
}

// CLAYROOM VISUAL CORRECTION Checkpoint 1 — ENVIRONMENT AO (restrained, production path).
// Adam's rulings this discharges: "i think it is also clear that we need some level of ambient
// occlusion, i can't make out any of the edges that aren't in shadow" and "is there any way we can
// get the contact shadows to actually be darker than the shadow value in the shadows? with a
// multiply effect?" — GTAO blends MULTIPLICATIVELY onto the linear beauty buffer BEFORE bloom/
// grade/tonemap, so creases and contacts darken inside already-shadowed regions too.
//
// Bounded AUTHORED settings — a diagnostic ON/OFF A/B exists (the suite's own per-pass seam +
// the Clayroom Lights tab + ?envao=0), but there is deliberately NO free taste slider
// (CLAYROOM-RESET-LADDER: "a saturation slider that compensates…"-class controls must not exist).
// radius is WORLD units (1 u = 5 ft): 0.42 u ≈ a 2-ft crease reach — seams/corners/contacts, not
// room-scale darkening. scale is the AO strength inside the shader; blendIntensity is the final
// multiply weight. samples/rings sized for the no-cash Mac target (Iris Plus 645) — measured in
// the checkpoint receipt, not assumed.
const ENV_AO_ENABLED_DEFAULT = true;
// AO G-buffer resolution as a fraction of DEVICE pixels. Full-res AO at dpr 2 costs ~17 ms/frame
// on the no-cash Mac target (measured 33 FPS at the review viewport, 2026-07-25) — over budget.
// An EXACT half scale with the composer's linear upsample is the standard mitigation and keeps
// registration uniform (the crescent bug was a MISMATCHED size flip-flopping between CSS and
// device pixels, not clean half-res). Re-measured after this change; see the checkpoint receipt.
const ENV_AO_RESOLUTION_SCALE = 0.5;
// Halo control (Adam, 2026-07-25: "the sphere has some kind of weird halo around it"): thickness
// well under 1 so the thin-object heuristic cannot smear occlusion past a silhouette, and a
// tighter denoise with much stricter depth/normal edge-stopping (higher phi = harder edge stop)
// so blur can never bleed a contact ring across the depth discontinuity onto the floor beyond.
const ENV_AO_PARAMS = Object.freeze({
  radius: 0.42, distanceExponent: 1, thickness: 0.6, distanceFallOff: 1,
  scale: 1.4, samples: 12, screenSpaceRadius: false,
});
// Contact-registration re-weight (Adam 2026-07-25: "at every point of planar contact you can see
// a gap of light shining through on every shape" — measured in dev/clay-captures/ao-contact-diag/):
// the crease's darkest AO is a 1-2-texel line, and the previous weights couldn't protect it from
// the Poisson spatial average — lumaPhi 10 over a 0..1 AO term never gated, depthPhi 8 is a view-
// space plane distance wider than the room, and normalPhi alone fails at creases because the
// half-res normal buffer is averaged exactly there. The luma gate is what saves a thin dark line
// against a bright surround: 0.25 zeroes the weight across the crease's own contrast while dither-
// scale variance still passes (flats keep smoothing), radius 2 halves how far any residual average
// reaches. Sweep receipts: sweep-scores.json (authored creaseLift 5.38 luma -> 1.40, 74% recovered
// toward the raw reference; flat-region high-frequency noise stays below raw).
const ENV_AO_DENOISE = Object.freeze({ lumaPhi: 0.25, depthPhi: 0.5, normalPhi: 16, radius: 2, radiusExponent: 1, rings: 2, samples: 8 });
const ENV_AO_BLEND_INTENSITY = 1.0;
// The one exclusion rule for the AO G-buffer prepass, as a PURE predicate so the harness can
// execute it against mesh-shaped fixtures without a GL context. The AO depth/normal prepass
// renders the scene under ONE opaque override material, which would turn every transparent or
// non-depth-writing helper quad (sprite billboard cards + their thin side shells, contact-shadow
// multiply pools, selection spills, socket/access overlay strips, door darkness cards, glow discs)
// into a solid occluder RECTANGLE — exactly the floating-card lie the sprite-silhouette contract
// forbids. Rule: a mesh participates in AO only if at least one of its materials is opaque AND
// depth-writing — the same rule the renderer's own depth buffer already applies to these meshes.
function envAOPrepassExcludes(mesh){
  if(!mesh || !mesh.isMesh) return false;
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  if(!mats.length || !mats[0]) return false;
  for(let i = 0; i < mats.length; i++){
    const m = mats[i];
    if(m && m.transparent !== true && m.depthWrite !== false) return false; // one opaque depth-writer -> participates
  }
  return true; // every material is transparent or non-depth-writing -> hide from the AO prepass
}
class EnvironmentAOPass extends GTAOPass {
  overrideVisibility(){
    super.overrideVisibility(); // caches every object's visible flag + hides points/lines
    let excluded = 0;
    this.scene.traverse((o) => {
      if(o.visible && envAOPrepassExcludes(o)){ o.visible = false; excluded++; }
    });
    this.lastPrepassExcludedCount = excluded; // diagnostic read for the receipt/harness, no product reads
  }
}
function envAOEnabled(){
  try {
    if(typeof window !== "undefined" && window.location && window.location.search){
      const raw = new URLSearchParams(window.location.search).get("envao");
      if(raw === "0") return false;
      if(raw === "1") return true;
    }
  } catch(e){}
  return ENV_AO_ENABLED_DEFAULT;
}
function makeEnvironmentAOPass(size){
  // Construct at DEVICE pixels for the same registration reason syncPostSuiteResolution documents.
  const pr = (S.renderer && S.renderer.getPixelRatio ? S.renderer.getPixelRatio() : 1) * ENV_AO_RESOLUTION_SCALE;
  const ao = new EnvironmentAOPass(S.scene, S.camera, Math.round(size.x * pr), Math.round(size.y * pr));
  ao.__bwName = "ao";
  ao.blendIntensity = ENV_AO_BLEND_INTENSITY;
  ao.updateGtaoMaterial(ENV_AO_PARAMS);
  ao.updatePdMaterial(ENV_AO_DENOISE);
  ao.output = GTAOPass.OUTPUT.Default;
  ao.enabled = envAOEnabled();
  return ao;
}

// Build the three passes once (lazy — needs a live renderer + a sized canvas). Stored on S.postSuite.
function buildPostSuite(){
  if(S.postSuite || !S.renderer || !S.composer) return S.postSuite;
  const size = new THREE.Vector2();
  S.renderer.getSize(size);
  const dof = makeDofPass();
  const bloom = new MaskedBloomPass(
    new THREE.Vector2(Math.max(1, Math.round(size.x * BLOOM_RESOLUTION_SCALE)),
                      Math.max(1, Math.round(size.y * BLOOM_RESOLUTION_SCALE))),
    LIGHT_TUNABLES.bloomStrength, BLOOM_RADIUS, LIGHT_TUNABLES.bloomThreshold
  );
  bloom.__bwName = "bloom";
  const grade = makeGradePass();
  const renderPass = new RenderPass(S.scene, S.camera);
  renderPass.__bwName = "render";
  const outputPass = new OutputPass();
  outputPass.__bwName = "output";
  const ao = makeEnvironmentAOPass(size);
  S.postSuite = { renderPass, ao, dof, bloom, grade, outputPass };
  return S.postSuite;
}

// Recompute the DoF focal band from the CURRENT camera fit: project S.boardCenter to NDC and centre
// the sharp band on its screen-Y. This is what makes focus TRACK fitMode — S.boardCenter is the
// action-cluster centre in a "beat" fit and the room centre in a "room" fit, so the sharp band lands
// on whatever the camera framed. Also records the world focus distance (camera->boardCenter) for the
// determinism/assert surface (window.Theater.dofFocus). Called after placeCamera at mount time.
function updateDofFocus(){
  if(!S.postSuite || !S.camera) return;
  const center = S.boardCenter || new THREE.Vector3(0, 0, 0);
  S.dofFocusDist = S.camera.position.distanceTo(center);
  S.camera.updateMatrixWorld();
  const ndc = center.clone().project(S.camera); // ndc.y in [-1,1]
  const focusV = THREE.MathUtils.clamp(ndc.y * 0.5 + 0.5, 0.08, 0.92);
  S.dofFocusNdcY = ndc.y;
  S.postSuite.dof.uniforms.uFocusV.value = focusV;
}

// Push the per-realm FILMIC GRADE params from the interior tile kit's authored grade onto the grade
// pass. Flagships carry their tuned gradeTint/gradeStrength; kits with no grade -> neutral (tint amt
// 0, still filmic+vignette). rigOn=false (study-rig honest baseline) -> neutral too.
function updatePostSuiteGrade(kit, rigOn){
  if(!S.postSuite) return;
  const g = S.postSuite.grade.uniforms;
  const hasGrade = rigOn && kit && kit.gradeTint && typeof kit.gradeStrength === "number";
  if(hasGrade){
    const tintNum = hexStrToNum(kit.gradeTint);
    g.uTint.value.setHex(tintNum);
    g.uTintAmt.value = Math.min(LIGHT_TUNABLES.gradeTintMax, kit.gradeStrength * LIGHT_TUNABLES.gradeTintScale);
  } else {
    g.uTint.value.setRGB(1, 1, 1);
    g.uTintAmt.value = 0.0;
  }
  // LL-1: every mount is a sync point for the grade/bloom LIVE tunables (this is what "drag -> re-
  // render" reaches for these — no separate push path to keep in sync with mountPostSuite's own call
  // site below). Untouched LIGHT_TUNABLES == the authored consts, so this is a no-op read in production.
  g.uExposureFloor.value = LIGHT_TUNABLES.gradeExposureFloor;
  const activeRecipe = LIGHT_TUNABLES.profiles[S.lightProfileKey || LIGHT_DEFAULT_PROFILE];
  if(g.uTonemapStrength){
    g.uTonemapStrength.value = activeRecipe && activeRecipe.toneMap
      ? activeRecipe.toneMap.strength : 1;
  }
  if(S.postSuite.bloom){
    S.postSuite.bloom.threshold = LIGHT_TUNABLES.bloomThreshold;
    S.postSuite.bloom.strength = LIGHT_TUNABLES.bloomStrength;
  }
}

// Push resolution-dependent uniforms (DoF aspect, grade resolution) after any canvas resize.
function syncPostSuiteResolution(){
  if(!S.postSuite || !S.renderer) return;
  const size = new THREE.Vector2();
  S.renderer.getSize(size);
  S.postSuite.dof.uniforms.uResolution.value.set(size.x, size.y);
  S.postSuite.grade.uniforms.uResolution.value.set(size.x, size.y);
  if(S.postSuite.bloom && S.postSuite.bloom.setSize){
    S.postSuite.bloom.setSize(size.x * BLOOM_RESOLUTION_SCALE, size.y * BLOOM_RESOLUTION_SCALE);
  }
  if(S.postSuite.ao && S.postSuite.ao.setSize){
    // DEVICE pixels, not CSS pixels (Adam, 2026-07-25: "two crescent shapes that aren't quite
    // aligned with the form of the sphere"): EffectComposer sizes every pass's buffers at
    // size × pixelRatio, so an AO pass sized in CSS units computes occlusion on a half-resolution
    // depth/normal buffer and upsamples it half a texel off the beauty — misregistered crescents
    // on every curved silhouette. The AO G-buffer must match the composer's device-pixel targets.
    const aoPixelRatio = (S.renderer.getPixelRatio ? S.renderer.getPixelRatio() : 1) * ENV_AO_RESOLUTION_SCALE;
    S.postSuite.ao.setSize(Math.round(size.x * aoPixelRatio), Math.round(size.y * aoPixelRatio));
  }
}

// Mount the post suite onto the composer (interior boards). Idempotent — re-mounting on an interior->
// interior board swap just refreshes uniforms/focus (the passes stay attached). Adds in chain order
// [render, dof, bloom, grade] via the addPass seam. renderPass MUST be first so the effects have the
// scene to read; grade last so EffectComposer flags it renderToScreen.
function mountPostSuite(kit, rigOn){
  if(!S.mounted || !S.composer) return;
  buildPostSuite();
  if(!S.postSuite) return;
  // keep the renderPass camera in sync (setInteriorBoard may have swapped ortho<->persp cameras)
  S.postSuite.renderPass.camera = S.camera;
  if(S.postSuite.ao){
    // Same camera-swap law as renderPass, plus GTAO's construction-time projection define — the
    // shader baked PERSPECTIVE_CAMERA at build; refresh it if a mount ever swaps projections so
    // the AO math can never silently run against the wrong projection model.
    S.postSuite.ao.camera = S.camera;
    const isPersp = S.camera && S.camera.isPerspectiveCamera ? 1 : 0;
    if(S.postSuite.ao.gtaoMaterial.defines.PERSPECTIVE_CAMERA !== isPersp){
      S.postSuite.ao.gtaoMaterial.defines.PERSPECTIVE_CAMERA = isPersp;
      S.postSuite.ao.gtaoMaterial.needsUpdate = true;
    }
  }
  syncPostSuiteResolution();
  updatePostSuiteGrade(kit, rigOn);
  updateDofFocus();
  if(!S.postSuiteMounted){
    S.composer.addPass(S.postSuite.renderPass);
    // AO immediately after the beauty render: it multiplies the LINEAR scene color, so DoF blurs,
    // bloom thresholds, and the grade/tonemap all see the already-grounded frame.
    S.composer.addPass(S.postSuite.ao);
    S.composer.addPass(S.postSuite.dof);
    S.composer.addPass(S.postSuite.bloom);
    S.composer.addPass(S.postSuite.grade);
    S.composer.addPass(S.postSuite.outputPass); // ALWAYS last — applies sRGB OETF (see OutputPass import)
    S.postSuiteMounted = true;
  }
}

// Tear the post suite OFF the composer (flat tabletop — the tabletop stays pass-free). Removes via the
// removePass seam; mirrors THREE's own contract (removePass never disposes a pass — the passes persist
// on S.postSuite for the next interior board, disposed only at retire()).
function teardownPostSuite(){
  if(!S.composer || !S.postSuite || !S.postSuiteMounted) return;
  S.composer.removePass(S.postSuite.outputPass);
  S.composer.removePass(S.postSuite.grade);
  S.composer.removePass(S.postSuite.bloom);
  S.composer.removePass(S.postSuite.dof);
  S.composer.removePass(S.postSuite.ao);
  S.composer.removePass(S.postSuite.renderPass);
  S.postSuiteMounted = false;
}

/* ---- split B4: the module surface theater-boot.js imports (everything else here is module-private:
   makeDofPass / MaskedBloomPass / EnvironmentAOPass / makeEnvironmentAOPass / buildPostSuite and the
   authored dials all had exactly one caller, and that caller lives in this file now). makeGradePass is
   exported because the root's window.Theater._setGradeTonemapForTest rebuilds the grade pass in place;
   the ENV_AO_* consts and envAOEnabled/envAOPrepassExcludes because the root's _environmentAOForTest /
   _aoContactDiagForTest / _envAOPrepassExcludesForTest seams read them. ---- */
export {
  makeGradePass,
  mountPostSuite,
  teardownPostSuite,
  syncPostSuiteResolution,
  updateDofFocus,
  updatePostSuiteGrade,
  envAOEnabled,
  envAOPrepassExcludes,
  ENV_AO_BLEND_INTENSITY,
  ENV_AO_DENOISE,
  ENV_AO_ENABLED_DEFAULT,
  ENV_AO_PARAMS,
  ENV_AO_RESOLUTION_SCALE,
};
