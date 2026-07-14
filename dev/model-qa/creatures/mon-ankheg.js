/* dev/model-qa/creatures/mon-ankheg.js — the ANKHEG (bespoke insectoid BURROWER, Large monstrosity).
   The read: a long segmented chitinous body held LOW to the ground on six splayed legs, a plated
   armored back running the spine, and big curved MANDIBLES/pincers up front. Amber-brown chitin
   (VS desaturated), darker seams between plates. NO eye quads (dark socket recesses only).
   Whole-object grammar: one function, one merged geometry frame, no anchors, no part transforms.
   Large size: base disc r=0.55, body kept low + within the disc footprint (rise is +y not +z/+x sprawl). */
import { V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildAnkheg(){
  /* ---------- PALETTE (VS desaturated; dirty amber-brown chitin, dark seams) ---------- */
  const P = {
    chit:0x6b5a34, chitDk:0x453a22, chitLt:0x83714a,      // amber-brown chitin, dark/light variants
    seam:0x2c2415,                                         // dark seam between plates
    plate:0x584a2c, plateDk:0x362c19,                      // armored back plates
    belly:0x8a7a52, bellyDk:0x655530,                      // paler underside
    mand:0x2e2716, mandTip:0x191408,                       // dark mandible horn
    sock:0x161009,                                         // eye socket recess (no eye quad)
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — spine along +z, held LOW; segmented body ~1.15u long. ---------- */
  const spY = 0.30;
  const S = {
    tail:   V(0, spY-0.03, -0.56),
    seg4:   V(0, spY+0.01, -0.36),
    seg3:   V(0, spY+0.03, -0.14),
    seg2:   V(0, spY+0.04,  0.10),
    seg1:   V(0, spY+0.02,  0.32),
    neck:   V(0, spY-0.02,  0.50),
    headB:  V(0, spY-0.05,  0.62),
  };

  /* ---------- BODY — one horizontal loft, segmented chitin barrel, alternating shades per segment. */
  tube(S.tail, S.seg4, 0.130, 0.185, 8, P.chitDk, {phase:Math.PI/8, capA:{hex:P.chitDk, lift:0.02}});
  tube(S.seg4, S.seg3, 0.185, 0.225, 8, P.chit,   {phase:Math.PI/8});
  tube(S.seg3, S.seg2, 0.225, 0.230, 8, P.chitDk, {phase:Math.PI/8});
  tube(S.seg2, S.seg1, 0.230, 0.205, 8, P.chit,   {phase:Math.PI/8});
  tube(S.seg1, S.neck, 0.205, 0.150, 8, P.chitDk, {phase:Math.PI/8});
  tube(S.neck, S.headB,0.150, 0.130, 8, P.chit,   {phase:Math.PI/8});

  /* pale belly strip low on the flanks */
  {
    const by = spY-0.20;
    quad(V(-0.15,by,-0.46), V(0.15,by,-0.46), V(0.13,by+0.02,0.24), V(-0.13,by+0.02,0.24), P.belly, 0.05);
  }

  /* ARMORED BACK PLATES — a row of raised segmented plate quads running the spine, dark seams between. */
  {
    const seg = [[-0.50,spY+0.19],[-0.30,spY+0.24],[-0.08,spY+0.27],[0.14,spY+0.26],[0.34,spY+0.20]];
    for(let i=0;i<seg.length;i++){
      const [z,y]=seg[i];
      const w = 0.15 - Math.abs(i-2)*0.012;
      quad(V(-w,y-0.03,z-0.09), V(w,y-0.03,z-0.09), V(w*0.9,y+0.04,z+0.07), V(-w*0.9,y+0.04,z+0.07), i%2?P.plate:P.plateDk, 0.05);
      // dark seam groove behind each plate
      if(i<seg.length-1){
        const [z2,y2]=seg[i+1];
        quad(V(-0.02,y-0.02,z+0.08), V(0.02,y-0.02,z+0.08), V(0.02,y2-0.02,z2-0.09), V(-0.02,y2-0.02,z2-0.09), P.seam, 0.03);
      }
    }
  }

  /* ---------- HEAD — a blunt armored wedge with socket recesses + big curved mandibles. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:spY-0.06, cz:0.64, rx:0.135, rz:0.130, hex:P.chit},
      {y:spY-0.01, cz:0.67, rx:0.150, rz:0.140, hex:P.chitDk},
      {y:spY+0.05, cz:0.63, rx:0.110, rz:0.100, hex:P.plateDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.07, 0.62), P.plateDk);

    /* dark eye-socket recesses (no eye quads — pure dark pits) */
    for(const s of [-1,1]) quad(V(s*0.075,spY+0.005,0.735), V(s*0.095,spY+0.005,0.735),
                                 V(s*0.090,spY-0.030,0.745), V(s*0.070,spY-0.030,0.745), P.sock, 0.0);

    /* blunt lower jaw/muzzle stub */
    const jb = V(0, spY-0.09, 0.66);
    const jt = V(0, spY-0.10, 0.76);
    tube(jb, jt, 0.095, 0.070, n, P.chitDk, {raz:0.085, rbz:0.058, phase:ph});
    quad(V(-0.06,spY-0.14,0.68), V(0.06,spY-0.14,0.68), V(0.045,spY-0.145,0.78), V(-0.045,spY-0.145,0.78), P.seam, 0.03);
  }

  /* ---------- MANDIBLES — big curved pincers sweeping forward + in from the head sides. ---------- */
  {
    const mandible=(s)=>{
      const root = V(s*0.085, spY-0.02, 0.70);
      const mid  = V(s*0.16,  spY-0.01, 0.86);
      const curve= V(s*0.14,  spY+0.02, 1.00);
      const tip  = V(s*0.04,  spY+0.03, 1.08);
      tube(root, mid,  0.058, 0.044, 6, P.mand, {phase:Math.PI/6});
      tube(mid, curve,  0.044, 0.028, 6, P.mand, {phase:Math.PI/6});
      tube(curve, tip,  0.028, 0.010, 6, P.mandTip, {phase:Math.PI/6, capB:{hex:P.mandTip, lift:0.006}});
    };
    mandible(-1); mandible(1);
  }

  /* ---------- LEGS — six splayed insectoid legs (2 per pair × 3 pairs), low sprawling stance. ---------- */
  {
    const insectLeg=(hip, footX, footZ)=>{
      const side = Math.sign(footX);
      const knee = V(hip.x + side*0.16, spY+0.06, hip.z + (footZ>hip.z?0.05:-0.05));
      const ankle= V(footX*0.92, 0.10, footZ*0.92);
      const foot = V(footX, 0.03, footZ);
      tube(hip, knee, 0.052, 0.040, 6, P.chit, {capA:{hex:P.chitDk}});
      tube(knee, ankle, 0.038, 0.024, 6, P.chitDk);
      tube(ankle, foot, 0.022, 0.008, 5, P.mand, {capB:{hex:P.mandTip, lift:0.004}});
    };
    // front pair (near neck/seg1)
    insectLeg(V(-0.135, spY-0.02, 0.32), -0.38, 0.40);
    insectLeg(V( 0.135, spY-0.02, 0.32),  0.38, 0.40);
    // mid pair (seg2)
    insectLeg(V(-0.185, spY-0.01, 0.06), -0.46, 0.06);
    insectLeg(V( 0.185, spY-0.01, 0.06),  0.46, 0.06);
    // rear pair (seg3)
    insectLeg(V(-0.175, spY-0.02,-0.20), -0.42, -0.28);
    insectLeg(V( 0.175, spY-0.02,-0.20),  0.42, -0.28);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
