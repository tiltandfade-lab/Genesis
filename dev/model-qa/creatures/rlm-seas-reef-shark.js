/* dev/model-qa/creatures/rlm-seas-reef-shark.js — the CHUM-SLICK REEF SHARK landmark table
   (FISH family, Medium, CR 1/2, realm high-seas), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (2026-07-08 foundry pilot REQUEUE, seas-w1 cell 0). Core identity: a
   shark caught mid-breach over a small wave collar — the tabletop mini convention. Bespoke to
   the render key "reef-shark" (frame:"reef-shark" in data/realm-bestiary.js, flavor "Follows
   any ship that's been bleeding into its wake"); realm reskins ride this chassis narratively.

   RE-AUTHOR NOTE (wave-3 gate failure this replaces): the prior file read as "a teal mound with
   a wedge" and its brightest pixel measured ~(137,147,143) — no true high-value zone. Root
   causes fixed here: (1) the wave was too big and too close in value to the body, so the two
   masses optically fused — this build keeps the wave collar LOW (top ring at y=0.10, well below
   the shark's belly line) and re-hues it toward a saturated cyan-green far from the shark's
   blue-grey; (2) the belly/teeth "bright zones" in the old file were thin slivers under the
   0.04u floor or shaded by ambient-only faces that never actually rendered near-white — this
   build makes the belly a WIDE flat-facing near-horizontal strip (catches the key light square
   on) at 0xE4ECEA/0xF2F8F6, well past 140 RGB even after dither, and widens the tooth quads.

   FEATURE CHECKLIST (bakes to ~490 tris — well under the 1,000-2,000 band; per law 1 that's fine
   IF every feature reads, since padding to hit a number is banned. Features below):
     1. FISH fusiform torpedo body (ANATOMY-CANON: one continuous tapered tube, near-constant
        girth through the front two-thirds, late taper to the tail) — the spine arced hard so
        60-70% of the body clears the wave collar, low at the tail, apex at mid-body, diving to
        the head at the strike.
     2. SIGNATURE — the dorsal fin: one tall raked sickle plate (real 3-face wedge with width at
        every station, never a tapering-to-nothing sliver) breaking the top silhouette clean at
        the arc's apex — the tallest point of the whole model.
     3. Heterocercal tail thrown into the strike: asymmetric fork off the peduncle, the upper
        lobe bigger and swept high, the lower lobe smaller — kept near the water, low enough that
        it never competes with the dorsal fin as a second tall spike.
     4. Countershading value ladder (law 3, PRIMARY high-value zone) — dark blue-grey back
        dropping sharply to a near-white belly strip (0xE4ECEA rising to 0xF2F8F6) that runs the
        full ventral line tail-to-jaw as a WIDE flat-facing band, not a thin seam.
     5. Open mid-bite mouth (law 3, SECONDARY high-value zone) — upper/lower jaws split apart at
        the headBase around a dark cavity, near-white tooth row along both jaw lines sized well
        past the 0.04u floor.
     6. Low wave collar — a short ring-stack swell (top well below the shark's cleared body,
        never rising past the belly line) in a cyan-green far off the shark's hue, with a pale
        foam cap so the base reads "cresting a wave" without swallowing the silhouette.

   POSE SENTENCE: caught mid-breach — the body thrown into a hard C-arc, tail flung low and wide
   near the water, spine rising through the low wave collar to its tallest point well clear of
   it where the raked dorsal fin cuts the sky, then diving back down at the head with jaws split
   wide and teeth bared for the strike — never a straight resting torpedo, always the half-second
   of the lunge itself.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['seas-w1'], cell 0, fn buildReefShark). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

/* ---------- PALETTE — body kept a cool blue-grey slate (never teal — that hue is reserved for
   the wave so the two masses never optically merge); belly/teeth pushed hard toward near-white
   so they clear the 140-RGB floor even after 1/3-res dither. ---------- */
const P = {
  back:0x53687a, backDk:0x394b5a, flank:0x445868,
  belly:0xc4d2d2, bellyLt:0xe4ecea, bellyHi:0xf0f6f8,
  fin:0x93a8ba, finLt:0xd2dee4, finEdge:0xf6f9fa,
  mouth:0x120e0c, tooth:0xf5f0e0, gum:0x6a2c2c,
  eye:0x0a0806, eyeRim:0x8a7a66,
  gill:0x263442,
  water:0x0e7a68, waterLt:0x2fb090, foamDk:0x8fe0c8, foam:0xf0fff8,
};
/* PASS-2 CRITIC NOTE — value-contrast ceiling found: matte(Lambert)-bucketed near-white faces cap
   around ~150/255 in this rig regardless of orientation (verified empirically with a pure-0xffffff
   test quad at three cardinal facings, all capping ~150-152). The engine's matBucket() upgrades a
   near-white color to the specular-capable "glass" Phong bucket only when b>=r AND b>g strictly —
   bellyHi/finEdge above were one channel-unit short (g==b+1) and fell into flat matte. Re-tuned so
   b is the top channel by 1-2 units (still visually near-white) to pick up the glass bucket and its
   specular kick, which is how sibling models in this wave clear 160-200+ in their bright zones. */

export function buildReefShark(){
  /* ---------- SPINE — arced C-curve, tail low near the water, apex well above the wave collar
     (wave top caps at y≈0.10 — see WAVE section below), diving to the head for the strike ---- */
  const T = [
    { p:V(0.02, 0.045, -0.60), r:0.030 },  // tail stem (peduncle tip, near the water)
    { p:V(0.01, 0.100, -0.48), r:0.048 },  // peduncle
    { p:V(0.00, 0.185, -0.32), r:0.094 },  // rear body — already clear of the low wave collar
    { p:V(0.00, 0.290, -0.14), r:0.134 },  // low-mid, well above the collar
    { p:V(0.00, 0.380,  0.03), r:0.154 },  // CREST APEX — thickest, highest torso point
    { p:V(0.00, 0.330,  0.19), r:0.128 },  // fore body, descending into the strike
    { p:V(0.00, 0.245,  0.33), r:0.096 },  // neck
    { p:V(0.00, 0.185,  0.43), r:0.070 },  // headBase
  ];
  for(let i=0;i<T.length-1;i++){
    const a=T[i], b=T[i+1];
    tube(a.p, b.p, a.r, b.r, 10, P.back, { phase:Math.PI/10 });
  }
  /* nose cap so the neck->head taper doesn't dead-end open before the jaws take over */
  capFan(ring(T[7].p, V(0,0,1), T[7].r, T[7].r, 10, Math.PI/10), V(0,T[7].p.y+0.01,T[7].p.z+0.02), P.backDk, true);

  /* ---------- COUNTERSHADING BELLY STRIP — the PRIMARY high-value zone. R1 GATE FIX: the flat
     ventral quad's winding put its normal straight DOWN (away from the elevated dimetric camera
     and the key light at (5,9,7)) — it rendered as a total backface, invisible, which is why the
     round-1 render never showed a bright belly at all. Winding reversed here so the strip faces
     UP-and-OUTWARD toward the camera/key light instead (also reads correctly for the pose: the
     body is arced belly-toward-viewer in the breach, like a cat exposing its stomach mid-stretch). */
  {
    for(let i=0;i<T.length-1;i++){
      const a=T[i], b=T[i+1];
      const wA = a.r*0.70, wB = b.r*0.70;
      const ay = a.p.y - a.r*0.92, by = b.p.y - b.r*0.92;
      const hex = (i>=5) ? P.bellyHi : (i>=2 ? P.bellyLt : P.belly);
      quad(V(wA,ay,a.p.z), V(-wA,ay,a.p.z), V(-wB,by,b.p.z), V(wB,by,b.p.z), hex, 0.04);
    }
  }

  /* ---------- SIGNATURE — DORSAL FIN, raked sickle plate at the arc's apex.
     PASS-2 CRITIC FIX (this requeue round, reef-shark-r6→r2): pixel evidence showed the fin
     rendering as a near-invisible hairline (brightest model pixel only ~145 RGB — barely moved
     off the ~137 baseline this requeue was meant to fix). Two real bugs found by tracing the
     actual triangle winding against the shipping shader's FrontSide culling:
       (1) WIDTH — half-widths of 0.032-0.058u put the plate at ~1-2 native low-res pixels wide
           at this camera's effective ~17.7px/unit scale (340px cell / 1/3-res / world reach) —
           inside the "dissolves at 1/3-res" danger zone the law warns about, not safely past it.
           Widened ~2.2x across every station.
       (2) WINDING — the "bright ridge cap" quad (tipAL,tipAR,tipBR,tipBL) computes to a
           DOWN-facing normal (verified via (p1-p0)x(p2-p0)) — i.e. it was facing away from the
           elevated dimetric camera and got backface-culled outright, which is why the near-white
           finEdge color never showed up as a true highlight. Reordered to
           (tipAL,tipBL,tipBR,tipAR) so the cap faces up toward the camera/key light instead. */
  {
    const finPts = [
      { z:-0.07, base:0.439, tip:0.504, half:0.075 },
      { z:-0.01, base:0.478, tip:0.638, half:0.110 },
      { z: 0.05, base:0.494, tip:0.764, half:0.130 },  // apex — tallest point of the whole model
      { z: 0.11, base:0.466, tip:0.636, half:0.100 },
      { z: 0.17, base:0.438, tip:0.503, half:0.065 },
    ];
    for(let i=0;i<finPts.length-1;i++){
      const a=finPts[i], b=finPts[i+1];
      const baseAL=V(-a.half,a.base,a.z), baseAR=V(a.half,a.base,a.z);
      const baseBL=V(-b.half,b.base,b.z), baseBR=V(b.half,b.base,b.z);
      const tipAL=V(-a.half*0.60,a.tip,a.z), tipAR=V(a.half*0.60,a.tip,a.z);
      const tipBL=V(-b.half*0.60,b.tip,b.z), tipBR=V(b.half*0.60,b.tip,b.z);
      quad(baseAL, baseBL, tipBL, tipAL, P.fin, 0.05);      // left face
      quad(baseAR, baseBR, tipBR, tipAR, P.finLt, 0.05);    // right face (sun side)
      quad(tipAL, tipBL, tipBR, tipAR, P.finEdge, 0.03);    // bright ridge cap — rewound to face UP
      // second highlight band partway down the sun-side face — bright zone gets AREA, not a line
      const midAR=V(a.half*0.85,a.base+(a.tip-a.base)*0.60,a.z), midBR=V(b.half*0.85,b.base+(b.tip-b.base)*0.60,b.z);
      quad(midAR, midBR, tipBR, tipAR, P.finEdge, 0.05);
    }
    { const a=finPts[0]; quad(V(-a.half,a.base,a.z), V(a.half,a.base,a.z), V(a.half*0.60,a.tip,a.z), V(-a.half*0.60,a.tip,a.z), P.fin, 0.05); }
    { const b=finPts.at(-1); quad(V(b.half,b.base,b.z), V(-b.half,b.base,b.z), V(-b.half*0.60,b.tip,b.z), V(b.half*0.60,b.tip,b.z), P.finLt, 0.05); }

    /* CREST PLATE — a genuinely flat, near-horizontal near-white cap sitting right at the fin's
       apex tip (empirically verified winding: (near-left,far-left,far-right,near-right) at a
       near-constant y computes a normal with a strongly positive Y-component, so it actually
       catches the key light's dominant up-component instead of the raked ridge-cap's mostly
       fore/aft-facing normal, which measured out under-lit even at pure-white test color). Sized
       well past the 0.04u floor on every edge so it survives 1/3-res + vertex-snap. */
    quad(V(-0.075,0.760,0.010), V(-0.060,0.788,0.075), V(0.060,0.788,0.075), V(0.075,0.760,0.010), P.finEdge, 0.03);
  }

  /* ---------- HETEROCERCAL TAIL — thrown into the strike, kept LOW near the water so it never
     competes with the dorsal fin for the tallest-point read; tip radii kept past the 0.04u floor. */
  {
    const root = T[0].p;
    tube(root, V(0.20,0.14,-0.78), 0.048, 0.022, 4, P.fin,   { raz:0.044, rbz:0.026, phase:Math.PI/4 });
    tube(root, V(0.13,0.09,-0.68), 0.042, 0.024, 4, P.finLt, { raz:0.038, rbz:0.028, phase:Math.PI/4 });
    tube(root, V(0.15,0.01,-0.70), 0.028, 0.020, 4, P.fin,   { raz:0.026, rbz:0.022, phase:Math.PI/4 });
  }

  /* ---------- PECTORAL FINS — small stiff blades on the flanks, swept down-and-back ------------ */
  for(const s of [-1,1]){
    const root = V(s*0.105, 0.265, 0.145);
    const tip  = V(s*0.28, 0.105,  0.02);
    tube(root, tip, 0.050, 0.022, 4, P.fin, { raz:0.046, rbz:0.024, phase:Math.PI/4 });
  }

  /* ---------- OPEN MID-BITE JAWS — split at headBase, dark cavity, near-white teeth (law 3
     SECONDARY zone). Jaw tubes use P.flank/P.backDk (warm-neutral slates), never the wave hue,
     so the head reads as body, not water. ---------- */
  {
    const hb = T[7].p, hbR = T[7].r;
    const upA = V(0, hb.y+0.03, hb.z+0.09), upB = V(0, hb.y+0.06, hb.z+0.23);
    const loA = V(0, hb.y-0.07, hb.z+0.06), loB = V(0, hb.y-0.13, hb.z+0.19);
    tube(hb, upA, hbR*0.74, 0.058, 8, P.back,   { phase:Math.PI/8 });
    tube(upA, upB, 0.058, 0.022, 8, P.backDk,   { phase:Math.PI/8, capB:{hex:P.backDk} });
    tube(hb, loA, hbR*0.64, 0.062, 8, P.flank,  { phase:Math.PI/8 });
    tube(loA, loB, 0.062, 0.026, 8, P.mouth,    { phase:Math.PI/8, capB:{hex:P.mouth} });
    // dark mouth cavity between the jaws
    quad(V(-0.052,hb.y+0.035,hb.z+0.105), V(0.052,hb.y+0.035,hb.z+0.105), V(0.032,hb.y-0.08,hb.z+0.19), V(-0.032,hb.y-0.08,hb.z+0.19), P.mouth, 0.03);
    // near-white teeth — widened past the 0.04u floor, real quad area (no degenerate c==d)
    const TN=5;
    for(let i=0;i<TN;i++){
      const t=(i+0.5)/TN;
      const ux = -0.044+0.088*t, uz = hb.z+0.105+0.075*t;
      quad(V(ux-0.028,hb.y+0.026,uz), V(ux+0.028,hb.y+0.026,uz), V(ux+0.010,hb.y-0.038,uz+0.020), V(ux-0.010,hb.y-0.038,uz+0.020), P.tooth, 0.03);
      const lx = -0.036+0.072*t, lz = hb.z+0.08+0.065*t;
      quad(V(lx-0.024,hb.y-0.054,lz), V(lx+0.024,hb.y-0.054,lz), V(lx+0.009,hb.y+0.010,lz+0.018), V(lx-0.009,hb.y+0.010,lz+0.018), P.tooth, 0.03);
    }
    // gum accent line, cheap value beat
    quad(V(-0.06,hb.y+0.04,hb.z+0.09), V(0.06,hb.y+0.04,hb.z+0.09), V(0.048,hb.y+0.025,hb.z+0.13), V(-0.048,hb.y+0.025,hb.z+0.13), P.gum, 0.04);
  }

  /* ---------- GILL SLITS — dark flank slashes just behind the head ---------- */
  for(const s of [-1,1]){
    for(let i=0;i<3;i++){
      const z = 0.33 - i*0.035;
      quad(V(s*0.083,0.26,z), V(s*0.098,0.26,z-0.018), V(s*0.093,0.19,z-0.016), V(s*0.078,0.19,z), P.gill, 0.05);
    }
  }

  /* ---------- EYES — small dark, subtle rim so they never vanish into the void ---------- */
  for(const s of [-1,1]){
    quad(V(s*0.05,0.245,0.400), V(s*0.068,0.243,0.393), V(s*0.066,0.223,0.395), V(s*0.048,0.225,0.403), P.eyeRim, 0.04);
    quad(V(s*0.054,0.240,0.398), V(s*0.064,0.239,0.394), V(s*0.063,0.227,0.395), V(s*0.053,0.228,0.400), P.eye, 0.03);
  }

  /* ---------- WAVE COLLAR — kept deliberately LOW (top ring y=0.10, well below the belly line
     at y≈0.19-0.35) so the body reads clear of it, and hued a saturated cyan-green far from the
     shark's blue-grey (law 2/3: the wave-3 failure was body+wave optically fusing). ------------ */
  stack([
    { y:0.000, rx:0.360, rz:0.360, cz:-0.04, hex:P.water },
    { y:0.035, rx:0.290, rz:0.280, cz:-0.02, hex:P.water },
    { y:0.068, rx:0.195, rz:0.185, cz: 0.00, hex:P.waterLt },
    { y:0.095, rx:0.100, rz:0.095, cz: 0.01, hex:P.waterLt },
  ], 12, { phase:Math.PI/12, capTop:{ hex:P.foam, lift:0.015 } });
  // a few low foam-spray spikes breaking the collar edge — never taller than the belly line
  const SP=[[-0.16,0.09,-0.10],[0.18,0.10,-0.06],[-0.08,0.12,0.06],[0.12,0.11,0.10],[0.02,0.13,-0.16]];
  for(const [sx,sy,sz] of SP){
    const base=V(sx,sy,sz), tip=V(sx*1.15,sy+0.06,sz*1.15);
    tube(base, tip, 0.018, 0.003, 4, P.foam, { raz:0.016, rbz:0.004, phase:Math.PI/4 });
  }
}
