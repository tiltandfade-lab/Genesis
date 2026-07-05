/* dev/model-qa/creatures/rlm-loose-jointed-tomb-archer.js — LOOSE-JOINTED TOMB ARCHER
   (lost-world, Medium Undead, CR 0.5). Read: an animated bone-guard skeleton, gaunt ribcage
   + loose rattling limb joints, skull head (no eye quads — dark sockets), still holding a
   bow at full draw. Bone-pale desaturated (VS grimy ivory/grey, dust-caked). Whole-object
   grammar: one function, one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildLooseJointedTombArcher(){
  const P = {
    bone:0xc4b89a, boneDk:0x968a6c, boneLt:0xdcd0b2,
    joint:0x7d7256, socket:0x241f16, tooth:0xe8dcc0,
    wood:0x4a3626, string:0xc8bfa4, wrap:0x5c4632,
    disc:0x4a4038, discTop:0x585047,
  };

  /* spine held upright but slightly hunched/loose — undead posture */
  const S = {
    pelvis: V(0, 0.62, 0.0),
    spine1: V(0, 0.80, 0.01),
    spine2: V(0.01, 0.98, 0.0),
    chest:  V(-0.01, 1.14, -0.01),
    neck:   V(0, 1.24, -0.02),
    headB:  V(0, 1.32, -0.02),
  };

  /* SPINE — thin gaunt column */
  tube(S.pelvis, S.spine1, 0.075, 0.065, 6, P.bone, {capA:{hex:P.boneDk, lift:0.02}});
  tube(S.spine1, S.spine2, 0.065, 0.070, 6, P.boneDk);
  tube(S.spine2, S.chest,  0.070, 0.080, 6, P.bone);
  tube(S.chest,  S.neck,   0.055, 0.038, 5, P.boneDk);

  /* RIBCAGE — a gaunt open cage of thin bone bands around the chest */
  {
    for(let i=0;i<5;i++){
      const t=i/4, y=0.86+t*0.24, rw=0.135-t*0.02;
      const zc=-0.01;
      quad(V(-rw,y,zc-0.05), V(-rw*0.6,y-0.03,zc+0.10), V(-rw*0.6,y+0.02,zc+0.10), V(-rw,y+0.05,zc-0.05), P.bone, 0.06);
      quad(V(rw,y,zc-0.05), V(rw*0.6,y-0.03,zc+0.10), V(rw*0.6,y+0.02,zc+0.10), V(rw,y+0.05,zc-0.05), P.boneLt, 0.06);
    }
    /* sternum strip */
    quad(V(-0.02,0.88,0.08), V(0.02,0.88,0.08), V(0.015,1.10,0.06), V(-0.015,1.10,0.06), P.boneDk, 0.03);
  }

  /* PELVIS — a hip bowl at the base of the spine */
  {
    const r1=ring(V(0,0.58,0), V(0,1,0), 0.13, 0.11, 8, Math.PI/8);
    const r2=ring(V(0,0.66,0), V(0,1,0), 0.115,0.095, 8, Math.PI/8);
    stitch([r1,r2], ()=>P.bone);
    capFan(r1, V(0,0.55,0), P.boneDk, true);
  }

  /* HEAD — skull: broad cranium narrowing to a jaw, dark sockets, exposed teeth line */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.26, cz:0, rx:0.075, rz:0.075, hex:P.bone},
      {y:1.34, cz:0, rx:0.090, rz:0.090, hex:P.boneLt},
      {y:1.42, cz:0.005, rx:0.078, rz:0.078, hex:P.bone},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.47,0.0), P.boneLt);
    /* jaw dropping below cranium */
    const jawT=V(0,1.24,0.04), jawB=V(0,1.16,0.05);
    tube(jawT, jawB, 0.055, 0.045, n, P.bone, {raz:0.065, rbz:0.05, phase:ph, capB:{hex:P.boneDk, lift:0.01}});
    /* eye sockets — dark carved pits, NOT eye quads */
    for(const s of [-1,1]) quad(V(s*0.032,1.335,0.062), V(s*0.052,1.335,0.062),
                                 V(s*0.048,1.30,0.066), V(s*0.036,1.30,0.066), P.socket, 0.02);
    /* nasal cavity */
    quad(V(-0.014,1.29,0.068), V(0.014,1.29,0.068), V(0.010,1.255,0.07), V(-0.010,1.255,0.07), P.socket, 0.02);
    /* teeth row (small pale ticks along jaw edge) */
    for(let i=-2;i<=2;i++) quad(V(i*0.014-0.005,1.185,0.075), V(i*0.014+0.005,1.185,0.075),
                                 V(i*0.014+0.004,1.165,0.075), V(i*0.014-0.004,1.165,0.075), P.tooth, 0.03);
  }

  /* LEGS — loose rattling bone limbs (thin tube segments w/ visible joint balls), planted stance */
  {
    const boneLeg=(hipX)=>{
      const hip=V(hipX,0.60,0);
      const knee=V(hipX*1.05,0.32,0.02);
      const ankle=V(hipX*0.95,0.08,0.0);
      const foot=V(hipX*0.9,0.03,0.09);
      tube(hip, knee, 0.052, 0.040, 6, P.bone);
      /* knee joint ball */
      { const r=ring(knee, V(0,1,0), 0.048, 0.048, 6, Math.PI/6);
        capFan(r, V(knee.x,knee.y+0.03,knee.z), P.joint); capFan(r, V(knee.x,knee.y-0.03,knee.z), P.joint, true); }
      tube(knee, ankle, 0.036, 0.026, 6, P.boneDk);
      tube(ankle, foot, 0.026, 0.020, 5, P.bone, {capB:{hex:P.boneDk, lift:0.005}});
    };
    boneLeg(-0.09); boneLeg(0.09);
  }

  /* ARMS — one drawing the bowstring back, one extended forward gripping the bow */
  {
    /* right arm (draw arm) — bent back at the shoulder, elbow cocked behind the head */
    const rsh=V(0.10,1.10,-0.02);
    const rel=V(0.20,1.02,-0.20);
    const rhd=V(0.10,1.12,-0.34);
    tube(rsh, rel, 0.036, 0.028, 5, P.bone);
    { const r=ring(rel, V(0,1,0), 0.032, 0.032, 5, Math.PI/5); capFan(r, V(rel.x,rel.y+0.02,rel.z), P.joint); }
    tube(rel, rhd, 0.026, 0.018, 5, P.boneDk, {capB:{hex:P.boneDk, lift:0.005}});

    /* left arm (bow-holding arm) — extended forward, straight */
    const lsh=V(-0.10,1.10,-0.02);
    const lel=V(-0.14,1.00,0.22);
    const lhd=V(-0.10,0.98,0.42);
    tube(lsh, lel, 0.036, 0.026, 5, P.boneLt);
    { const r=ring(lel, V(0,1,0), 0.030, 0.030, 5, Math.PI/5); capFan(r, V(lel.x,lel.y+0.02,lel.z), P.joint); }
    tube(lel, lhd, 0.024, 0.016, 5, P.bone, {capB:{hex:P.boneDk, lift:0.005}});

    /* BOW — a curved stave gripped by the left hand, string running to the draw hand */
    const bowTop=V(-0.09,1.30,0.46), bowMid=V(-0.10,0.98,0.44), bowBot=V(-0.09,0.66,0.42);
    tube(bowTop, bowMid, 0.014, 0.020, 5, P.wood);
    tube(bowMid, bowBot, 0.020, 0.014, 5, P.wood);
    quad(V(-0.10,0.95,0.44), V(-0.10,0.95,0.44), V(-0.10,1.05,0.45), V(-0.10,1.05,0.45), P.wrap, 0.02);
    /* taut bowstring from tip to the draw hand */
    tube(bowTop, rhd, 0.006, 0.006, 3, P.string);
    tube(bowBot, rhd, 0.006, 0.006, 3, P.string);
    /* nocked arrow along the draw line */
    const arrowTip=V(-0.06,1.00,0.50);
    tube(rhd, arrowTip, 0.008, 0.005, 4, P.wood, {capB:{hex:P.boneDk, lift:0.003}});
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
