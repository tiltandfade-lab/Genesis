/* dev/model-qa/creatures/mon-voidmonk-monk.js — VOID-MONK (bespoke biped, Medium aberration).
   A githzerai ascetic in a wrapped robe + hood, gaunt sharp face, martial FISTS-raised stance.
   Ashen grey-yellow desaturated skin, muted robe. Whole-object grammar: one function, one merged
   geometry frame, no anchors, no part-object transforms. NO eye quads (dark socket recesses only).
   Base disc r=0.42 (Medium). Read mon-lizard.js for the primitive grammar + mon-monk.js for the
   martial-biped silhouette this leans on. */
import { V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildVoidMonkMonk(){
  /* ---------- PALETTE (VS desaturated; ashen grey-yellow skin, muted robe) ---------- */
  const P = {
    skin:0x8c8368, skinDk:0x655e46, skinLt:0xa39a7c,        // ashen grey-yellow flesh
    socket:0x1c1a14,                                          // dark eye-socket recess
    robeA:0x4d4a3e, robeB:0x3a3830, robeDk:0x2a2822,          // muted wrapped-robe cloth
    wrapA:0x5a5648, wrapB:0x413f34,                            // hand/forearm wraps + hood band
    sash:0x6b5a3e,                                             // dull ochre sash accent
    disc:0x413c33, discTop:0x4c463b,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin',
    [P.robeA]:'cloth', [P.robeB]:'cloth', [P.robeDk]:'cloth',
    [P.wrapA]:'cloth', [P.wrapB]:'cloth', [P.sash]:'cloth',
    [P.disc]:'stone', [P.discTop]:'stone',
  });

  /* ---------- LANDMARKS — spine along +y, lean forward slightly into the fists-raised stance. --- */
  const S = {
    pelvis: V(0, 0.235, 0.00),
    waist:  V(0, 0.335, 0.01),
    chest:  V(0, 0.475, 0.03),
    shldr:  V(0, 0.560, 0.03),
    neck:   V(0, 0.610, 0.02),
    headB:  V(0, 0.660, 0.01),
    headT:  V(0, 0.790, -0.01),
  };

  /* ---------- LEGS — narrow bladed martial stance, weight low, wraps at shin/ankle. ---------- */
  {
    const hipL = V(-0.10, S.pelvis.y-0.02, 0.00);
    const hipR = V( 0.10, S.pelvis.y-0.02, 0.00);
    const kneeL = V(-0.135, 0.135, 0.075);   // forward bent knee (lead leg)
    const kneeR = V( 0.095, 0.130, -0.06);   // rear leg, slightly back
    const footL = V(-0.155, 0.028, 0.155);
    const footR = V( 0.075, 0.028, -0.145);
    tube(hipL, kneeL, 0.075, 0.058, 7, P.robeDk, {phase:Math.PI/7});
    tube(hipR, kneeR, 0.075, 0.058, 7, P.robeDk, {phase:Math.PI/7});
    tube(kneeL, footL, 0.056, 0.040, 6, P.wrapA, {phase:Math.PI/6, capB:{hex:P.skinDk, lift:0.006}});
    tube(kneeR, footR, 0.056, 0.040, 6, P.wrapA, {phase:Math.PI/6, capB:{hex:P.skinDk, lift:0.006}});
    // flat bare feet, low wide pads
    for(const f of [footL, footR]){
      const toe = V(f.x, 0.016, f.z + (f.z>=0?0.09:-0.09));
      quad(V(f.x-0.045,0.018,f.z-0.03), V(f.x+0.045,0.018,f.z-0.03), V(toe.x+0.03,0.014,toe.z), V(toe.x-0.03,0.014,toe.z), P.skinDk, 0.04);
    }
    // hem of the robe skirts over the upper thighs
    const hemRing = ring(V(0, 0.235, 0.00), V(0,1,0), 0.150, 0.135, 8, Math.PI/8);
    const hemRing2 = ring(V(0, 0.170, 0.01), V(0,1,0), 0.175, 0.150, 8, Math.PI/8);
    stitch([hemRing, hemRing2], ()=>P.robeB);
  }

  /* ---------- TORSO — lean angular wrapped-robe barrel; narrower at waist, broad-ish shoulders. --- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.pelvis.y, cx:0, cz:0.00, rx:0.150, rz:0.130, hex:P.robeDk},
      {y:S.waist.y,  cx:0, cz:0.01, rx:0.128, rz:0.110, hex:P.robeA},
      {y:S.chest.y,  cx:0, cz:0.03, rx:0.158, rz:0.125, hex:P.robeB},
      {y:S.shldr.y,  cx:0, cz:0.03, rx:0.172, rz:0.120, hex:P.robeA},
    ];
    const rings=bands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    // wrapped sash diagonal across the chest
    quad(V(-0.13,S.chest.y+0.05,0.10), V(0.02,S.chest.y-0.06,0.11), V(0.10,S.waist.y-0.04,0.09), V(-0.05,S.waist.y+0.05,0.08), P.sash, 0.05);
  }

  /* ---------- HOOD + HEAD — gaunt sharp face, dark socket recesses, hood drawn back off the crown. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y-0.03, cz:0.02, rx:0.098, rz:0.100, hex:P.wrapB},   // hood collar (cloth)
      {y:S.headB.y+0.02, cz:0.03, rx:0.088, rz:0.092, hex:P.skin},    // jaw
      {y:S.neck.y+0.09,  cz:0.04, rx:0.083, rz:0.088, hex:P.skinLt},  // gaunt cheeks
      {y:S.headT.y-0.05, cz:0.01, rx:0.070, rz:0.075, hex:P.skinDk},  // brow, narrowing (sharp)
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headT.y+0.02, -0.01), P.wrapB);   // hood peak over crown

    // sunken dark eye sockets (recess, NOT painted quads on the surface — carved-in facets)
    for(const s of [-1,1]){
      const cx = s*0.036, cz = 0.115;
      quad(V(cx-0.022,S.neck.y+0.075,cz), V(cx+0.018,S.neck.y+0.078,cz),
           V(cx+0.014,S.neck.y+0.045,cz-0.012), V(cx-0.018,S.neck.y+0.048,cz-0.012), P.socket, 0.02);
    }
    // gaunt sharp cheekbone hollows
    for(const s of [-1,1]){
      quad(V(s*0.055,S.neck.y+0.03,0.08), V(s*0.075,S.neck.y+0.01,0.06),
           V(s*0.070,S.neck.y-0.03,0.05), V(s*0.048,S.neck.y-0.01,0.07), P.skinDk, 0.05);
    }
    // narrow nose ridge + thin-lipped mouth line, no eye quads
    quad(V(-0.012,S.neck.y+0.07,0.135), V(0.012,S.neck.y+0.07,0.135), V(0.008,S.neck.y+0.02,0.155), V(-0.008,S.neck.y+0.02,0.155), P.skinLt, 0.04);
    quad(V(-0.028,S.neck.y-0.015,0.145), V(0.028,S.neck.y-0.015,0.145), V(0.020,S.neck.y-0.03,0.140), V(-0.020,S.neck.y-0.03,0.140), P.skinDk, 0.03);
    // hood band circling the brow
    quad(V(-0.075,S.headT.y-0.09,0.02), V(0.075,S.headT.y-0.09,0.02), V(0.065,S.headT.y-0.10,-0.06), V(-0.065,S.headT.y-0.10,-0.06), P.wrapB, 0.04);
  }

  /* ---------- ARMS — raised into a martial FISTS-up guard, forearms wrapped, no floating hands. --- */
  {
    const armSide=(sign)=>{
      const shoulder = V(sign*0.185, S.shldr.y-0.01, 0.02);
      const elbow    = V(sign*0.205, S.chest.y+0.06, 0.155);   // elbow tucked, forward+out
      const wrist    = V(sign*0.145, S.headB.y+0.03, 0.185);   // forearm raised guard-high
      const fist     = V(sign*0.110, S.headB.y+0.075, 0.170);
      tube(shoulder, elbow, 0.062, 0.050, 6, P.robeA, {phase:Math.PI/6});
      tube(elbow, wrist, 0.048, 0.040, 6, P.wrapA, {phase:Math.PI/6});
      // clenched fist mass — small blocky knuckle cluster
      const fr = ring(fist, V(0,1,0), 0.040, 0.036, 6, Math.PI/6);
      const fr2 = ring(V(fist.x, fist.y+0.045, fist.z+0.01), V(0,1,0), 0.034, 0.032, 6, Math.PI/6);
      stitch([fr, fr2], ()=>P.skinDk);
      capFan(fr2, V(fist.x, fist.y+0.065, fist.z+0.01), P.skin);
      capFan(fr, V(fist.x, fist.y-0.02, fist.z), P.skinDk, true);
    };
    armSide(-1);
    armSide(1);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2 = ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
