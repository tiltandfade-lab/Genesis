/* dev/model-qa/creatures/mon-wolf.js — the WOLF landmark table (QUADRUPED family, Medium).
   Whole-object grammar: one function, one geometry frame, no anchors. A horizontal spine loft along
   +z, shoulder height ~0.80u, body length ~1.2u. Four legs with VISIBLE HAUNCHES (thick upper
   segments tapering to slim shanks). The SIGNATURE feature (REFERENCE-DIRECTION.md's "PSX wolf"
   lesson — one exaggerated feature makes the species) is the OPEN MAW: a lowered wedge head that
   parts into upper/lower jaw halves showing pale geometric teeth. Pricked ears, a bushy level tail.
   Grey-agouti coat with a darker saddle. Hunting stance, head slightly lowered. Imported by
   mon-wolf-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildWolf(){
  /* ---------- PALETTE (VS desaturated; grey-agouti coat, darker saddle) ---------- */
  const P = {
    coat:0x8a8175, coatDk:0x6a6157, saddle:0x4b453c, saddleDk:0x39342c,
    belly:0xb0a693, ruff:0x9a9084,            // paler throat/belly ruff
    muzzle:0x726858, muzzleLt:0x9c9284, nose:0x201b18,
    maw:0x3a2622, tongue:0x9a5a54, tooth:0xe0d7c2,
    ear:0x6a6157, earIn:0x453d33,
    eye:0x161210, eyeGlow:0xc7a94e,           // amber hunter's eye
    claw:0x2c2620, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — spine along +z, shoulder height ~0.80u, ~1.2u long. Head lowered. ---------- */
  const shY = 0.78;                            // shoulder-line spine height
  const S = {
    rump:   V(0, shY+0.02, -0.50),             // high haunch behind
    loin:   V(0, shY+0.03, -0.28),
    saddle: V(0, shY+0.05, -0.04),             // top of the back (saddle)
    shldr:  V(0, shY+0.02,  0.20),             // shoulder / withers
    neckB:  V(0, shY+0.00,  0.36),
    neck:   V(0, shY-0.03,  0.48),             // neck angles forward, head only SLIGHTLY lowered
    headB:  V(0, shY-0.06,  0.58),
  };

  /* ---------- BODY — one horizontal loft; deep chest, tucked loin, high rump ---------- */
  tube(S.rump,   S.loin,   0.215, 0.245, 8, P.coat,   {phase:Math.PI/8, capA:{hex:P.coatDk, lift:0.02}});
  tube(S.loin,   S.saddle, 0.245, 0.270, 8, P.saddle, {phase:Math.PI/8});   // darker saddle over the back
  tube(S.saddle, S.shldr,  0.270, 0.255, 8, P.coat,   {phase:Math.PI/8});
  tube(S.shldr,  S.neckB,  0.255, 0.180, 8, P.coat,   {phase:Math.PI/8});
  tube(S.neckB,  S.neck,   0.180, 0.150, 8, P.ruff,   {phase:Math.PI/8});   // paler neck ruff
  tube(S.neck,   S.headB,  0.150, 0.120, 8, P.coatDk, {phase:Math.PI/8});
  /* deep chest keel + pale belly under the barrel */
  {
    quad(V(-0.14,shY-0.30,0.05), V(0.14,shY-0.30,0.05), V(0.10,shY-0.34,0.34), V(-0.10,shY-0.34,0.34), P.ruff, 0.05);
    quad(V(-0.15,shY-0.28,-0.34), V(0.15,shY-0.28,-0.34), V(0.13,shY-0.26,0.06), V(-0.13,shY-0.26,0.06), P.belly, 0.05);
  }

  /* ---------- HEAD — lowered wedge with the SIGNATURE OPEN MAW ---------- */
  {
    const n=8, ph=Math.PI/n;
    /* cranium: skull -> brow -> crown, sitting ahead of headB, head held only slightly lowered */
    const bands=[
      {y:shY-0.085, cz:0.63, rx:0.128, rz:0.130, hex:P.coat},
      {y:shY-0.045, cz:0.66, rx:0.140, rz:0.138, hex:P.coat},
      {y:shY-0.005, cz:0.64, rx:0.122, rz:0.112, hex:P.coatDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, shY+0.025, 0.62), P.coatDk);

    /* ===== OPEN MAW — the exaggerated signature. Two muzzle wedges: an UPPER jaw projecting
       forward (roughly level) and a LOWER jaw dropped and angled down, parted to reveal a dark
       mouth interior with pale geometric teeth. The head is level enough that the maw faces
       FORWARD at the viewer, not the floor. ===== */
    const jawY = shY-0.155;                      // where the jaws meet at the hinge
    // dark mouth interior wedge (drawn first, behind the teeth) — a shallow open cavity
    {
      const mb=V(0, jawY+0.02, 0.66), mm=V(0, jawY-0.02, 0.78);
      tube(mb, mm, 0.070, 0.050, n, P.maw, {raz:0.055, rbz:0.040, phase:ph, capB:{hex:P.maw, lift:0.006}});
      // a small tongue slab on the lower jaw floor
      quad(V(-0.030,jawY-0.05,0.70), V(0.030,jawY-0.05,0.70),
           V(0.024,jawY-0.055,0.82), V(-0.024,jawY-0.055,0.82), P.tongue, 0.04);
    }
    // UPPER jaw wedge (projects forward, level; nose at the tip)
    const uB=V(0, jawY+0.055, 0.655), uM=V(0, jawY+0.045, 0.80), uT=V(0, jawY+0.030, 0.90);
    tube(uB, uM, 0.100, 0.074, n, P.muzzle, {raz:0.070, rbz:0.052, phase:ph});
    tube(uM, uT, 0.074, 0.040, n, P.muzzle, {raz:0.052, rbz:0.028, phase:ph, capB:{hex:P.nose, lift:0.010}});
    // LOWER jaw wedge (dropped + angled down — wide gape for the snarl)
    const lB=V(0, jawY-0.065, 0.655), lM=V(0, jawY-0.115, 0.78), lT=V(0, jawY-0.145, 0.86);
    tube(lB, lM, 0.078, 0.052, n, P.muzzle, {raz:0.056, rbz:0.038, phase:ph});
    tube(lM, lT, 0.052, 0.028, n, P.muzzleLt, {raz:0.038, rbz:0.020, phase:ph, capB:{hex:P.muzzleLt, lift:0.008}});

    /* geometric TEETH — pale triangle/quad fangs on both jaw lines, at the gum edges */
    const fang=(x,y,z,w,h,down)=>{                // a little downward (or up) pointed tooth quad
      const ty = down ? y-h : y+h;
      quad(V(x-w,y,z+0.006), V(x+w,y,z+0.006), V(x,ty,z+0.004), V(x,ty,z+0.004), P.tooth, 0.02);
    };
    // upper canines + incisors (point DOWN from the upper gum) — enlarged canines
    for(const s of [-1,1]){
      fang(s*0.054, jawY+0.012, 0.70, 0.020, 0.072, true);   // canine (bigger)
      fang(s*0.028, jawY+0.010, 0.74, 0.013, 0.036, true);   // incisor
      fang(s*0.050, jawY+0.008, 0.60, 0.014, 0.034, true);   // rear molar hint
    }
    // lower canines (point UP from the lower gum) — enlarged
    for(const s of [-1,1]){
      fang(s*0.048, jawY-0.065, 0.70, 0.017, 0.058, false);
      fang(s*0.026, jawY-0.068, 0.735, 0.011, 0.030, false);
    }

    /* EYES — small dark almond dots with an amber fleck, high on the skull flanking the brow */
    for(const s of [-1,1]){
      const ex=s*0.100, ey=shY-0.020, ez=0.640;
      quad(V(ex-0.022,ey-0.014,ez), V(ex+0.022,ey-0.014,ez),
           V(ex+0.020,ey+0.014,ez-0.010), V(ex-0.020,ey+0.014,ez-0.010), P.eye, 0.0);
      quad(V(ex-0.008,ey-0.004,ez+0.004), V(ex+0.008,ey-0.004,ez+0.004),
           V(ex+0.007,ey+0.006,ez-0.002), V(ex-0.007,ey+0.006,ez-0.002), P.eyeGlow, 0.0);
    }

    /* PRICKED EARS — two upright triangular wedges on the crown, tips up and slightly forward */
    for(const s of [-1,1]){
      const base=V(s*0.100, shY+0.030, 0.585);
      const tip =V(s*0.135, shY+0.190, 0.560);   // erect, tips up
      tube(base, tip, 0.058, 0.010, 6, P.ear, {raz:0.030, rbz:0.006, capB:{hex:P.ear, lift:0.006}});
      // dark inner-ear fleck on the front face
      quad(V(s*0.088,shY+0.045,0.598), V(s*0.116,shY+0.045,0.590),
           V(s*0.126,shY+0.165,0.568), V(s*0.104,shY+0.165,0.575), P.earIn, 0.03);
    }
  }

  /* ---------- LEGS — 4, each with a VISIBLE HAUNCH: thick upper seg -> slim shank -> paw. ---------- */
  {
    const leg=(hip, footX, footZ, hex, rearThick)=>{
      // upper (haunch/shoulder): FAT. Rear legs get a much bigger muscled haunch bulge.
      const upR  = rearThick ? 0.150 : 0.120;
      const midR = rearThick ? 0.090 : 0.075;
      const knee=V(hip.x + Math.sign(hip.x)*0.010, shY-0.30, hip.z + (rearThick?0.03:0.0));
      const ankle=V(footX, 0.16, footZ);
      const paw=V(footX, 0.05, footZ+0.04);
      tube(hip, knee, upR, midR, 6, hex);                                    // thick haunch/upper
      tube(knee, ankle, 0.062, 0.042, 6, P.coatDk);                          // slim shank
      tube(ankle, paw, 0.044, 0.038, 6, P.muzzle, {capB:{hex:P.muzzle, lift:0.006}});  // paw
      // three little claw flecks at the toe front
      for(const cx of [-0.022,0,0.022]){
        quad(V(paw.x+cx-0.006,0.03,paw.z+0.03), V(paw.x+cx+0.006,0.03,paw.z+0.03),
             V(paw.x+cx+0.004,0.01,paw.z+0.055), V(paw.x+cx-0.004,0.01,paw.z+0.055), P.claw, 0.0);
      }
    };
    // front legs (under the shoulder, z~0.18) — straighter, weight-bearing
    leg(V(-0.150, shY-0.06, 0.185), -0.165, 0.25, P.coat, false);
    leg(V( 0.150, shY-0.06, 0.185),  0.165, 0.21, P.coat, false);
    // rear legs (under the rump, z~-0.44) — big haunch, hocks set back
    leg(V(-0.165, shY-0.08, -0.44), -0.185, -0.36, P.coat, true);
    leg(V( 0.165, shY-0.08, -0.44),  0.185, -0.40, P.coat, true);
  }

  /* ---------- TAIL — bushy, carried LEVEL (straight back, slight droop), thick with fur. ----------
     Roots at the rump, extends back (-z) roughly level with the spine, tapering. Kept swung slightly
     to one side so it clears the rear legs in the back view. */
  {
    const root = V(0.02, shY+0.00, -0.56);
    const b1   = V(0.05, shY-0.02, -0.74);
    const b2   = V(0.10, shY-0.06, -0.92);       // level, gentle droop
    const b3   = V(0.15, shY-0.13, -1.06);
    const tip  = V(0.19, shY-0.22, -1.16);
    tube(root, b1, 0.100, 0.115, 8, P.coat,   {phase:Math.PI/8, capA:{hex:P.coatDk}});  // bushy base flare
    tube(b1,   b2, 0.115, 0.098, 8, P.coat,   {phase:Math.PI/8});
    tube(b2,   b3, 0.098, 0.070, 8, P.coatDk, {phase:Math.PI/8});
    tube(b3,   tip,0.070, 0.028, 8, P.saddleDk,{phase:Math.PI/8, capB:{hex:P.saddleDk, lift:0.008}});  // dark tip
  }

  /* ---------- base disc (Medium: r=0.42, humanoid pattern) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
