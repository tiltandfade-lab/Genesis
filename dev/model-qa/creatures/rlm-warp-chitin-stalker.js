/* dev/model-qa/creatures/rlm-warp-chitin-stalker.js — WARP-CHITIN STALKER (ash realm, Medium,
   CR 4). Read: a runoff-fused insect hybrid — a low-slung quadruped stalker body plated in warped
   overlapping chitin plates that don't quite match (the "fused/mutated" tell), a narrow wedge head
   with twin curved sickle-claws up front, a whip-thin tail, faint radioactive seam-glow at the
   plate joints. Whole-object grammar: one function, one merged frame, no anchors. NO eye quads —
   dark socket ridge only. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildWarpChitinStalker(){
  /* ---------- PALETTE (VS-desaturated warped chitin, sick seam-glow, ash register) ---------- */
  const P = {
    chitin:0x565038, chitinDk:0x3a3624, chitinLt:0x6e6748,
    plateA:0x4a4a30, plateB:0x635c3e,          /* mismatched fused plate tones */
    seam:0x8ea34a, seamDk:0x5c6a30,
    claw:0x201d16, mouth:0x241f19,
    socket:0x141210,
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — low-slung quadruped spine, belly close to ground, narrow head fwd --- */
  const spY = 0.36;
  const S = {
    tailBase: V(0, spY-0.02, -0.52),
    rump:     V(0, spY+0.02, -0.34),
    mid:      V(0, spY+0.03, -0.04),
    shldr:    V(0, spY+0.01,  0.24),
    neck:     V(0, spY-0.02,  0.40),
    headB:    V(0, spY-0.05,  0.52),
  };

  /* ---------- BODY — warped overlapping plate barrel, mismatched tones (fused-mutation tell) --- */
  tube(S.rump,  S.mid,   0.185, 0.205, 8, P.plateA, {phase:Math.PI/8, capA:{hex:P.chitinDk, lift:0.02}});
  tube(S.mid,   S.shldr, 0.205, 0.170, 8, P.plateB, {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.170, 0.115, 8, P.chitin, {phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.115, 0.085, 8, P.chitinDk,{phase:Math.PI/8});
  /* overlapping plate ridges scoring the back — irregular, not uniform */
  for(const [z0,z1,off] of [[-0.30,-0.14,0.02],[-0.10,0.06,-0.015],[0.10,0.22,0.02]])
    quad(V(-0.10,spY+0.14+off,z0), V(0.10,spY+0.14+off,z0), V(0.08,spY+0.17+off,z1), V(-0.08,spY+0.17+off,z1), P.chitinDk, 0.06);
  /* seam-glow lines at two plate joints (radiation-fused tell) */
  for(const z of [-0.20, 0.00]) quad(V(-0.09,spY-0.02,z), V(0.09,spY-0.02,z), V(0.085,spY+0.20,z+0.02), V(-0.085,spY+0.20,z+0.02), P.seam, 0.05);

  /* ---------- HEAD — narrow wedge, dark socket ridge (no eye quads), small mandible mouth ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:spY-0.06, cz:0.54, rx:0.075, rz:0.085, hex:P.chitin},
      {y:spY-0.02, cz:0.56, rx:0.088, rz:0.088, hex:P.chitinLt},
      {y:spY+0.03, cz:0.52, rx:0.062, rz:0.060, hex:P.chitinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.06, 0.53), P.chitinDk);
    /* narrowing snout */
    tube(V(0,spY-0.07,0.58), V(0,spY-0.09,0.70), 0.06, 0.028, n, P.chitin, {phase:ph, capB:{hex:P.mouth, lift:0.006}});
    /* dark socket ridge across the brow (no eye quads) */
    quad(V(-0.05,spY+0.015,0.60), V(0.05,spY+0.015,0.60), V(0.045,spY-0.005,0.62), V(-0.045,spY-0.005,0.62), P.socket, 0.02);
  }

  /* ---------- SICKLE-CLAWS — twin curved claws projecting forward from the shoulders ---------- */
  {
    for(const s of [-1,1]){
      const b0 = V(s*0.10, spY+0.02, 0.30);
      const b1 = V(s*0.16, spY+0.10, 0.44);
      const b2 = V(s*0.14, spY+0.06, 0.58);
      tube(b0,b1,0.032,0.022,5,P.chitinDk);
      tube(b1,b2,0.022,0.006,5,P.claw,{capB:{hex:P.claw}});
    }
  }

  /* ---------- LEGS — low sprawling quadruped stance, splayed clawed feet ---------- */
  {
    const sprawlLeg=(shoulder, footX, footZ)=>{
      const elbowX = shoulder.x + Math.sign(shoulder.x)*0.18;
      const elbow = V(elbowX, spY-0.09, shoulder.z + (footZ>shoulder.z?0.03:-0.03));
      const foot  = V(footX, 0.045, footZ);
      tube(shoulder, elbow, 0.068, 0.050, 6, P.plateA);
      tube(elbow, foot, 0.050, 0.030, 6, P.chitinDk, {capB:{hex:P.chitinDk, lift:0.005}});
      const side = Math.sign(foot.x||1);
      for(const [dx,dz] of [[side*0.05,0.02],[side*0.02,0.05],[-side*0.02,0.05]]){
        tube(V(foot.x,0.03,foot.z), V(foot.x+dx,0.008,foot.z+dz), 0.012, 0.004, 4, P.claw, {capB:{hex:P.claw}});
      }
    };
    sprawlLeg(V(-0.155, spY-0.03, 0.24), -0.36, 0.30);
    sprawlLeg(V( 0.155, spY-0.03, 0.24),  0.36, 0.26);
    sprawlLeg(V(-0.165, spY-0.01, -0.34), -0.38, -0.28);
    sprawlLeg(V( 0.165, spY-0.01, -0.34),  0.38, -0.32);
  }

  /* ---------- TAIL — whip-thin, tapering, curling slightly to one side ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0.04, spY-0.05, -0.74);
    const t2 = V(0.10, spY-0.02, -0.94);
    const t3 = V(0.18, spY+0.06, -1.10);
    tube(t0, t1, 0.075, 0.050, 6, P.chitin, {phase:Math.PI/6, capA:{hex:P.chitinDk}});
    tube(t1, t2, 0.050, 0.026, 6, P.chitinDk, {phase:Math.PI/6});
    tube(t2, t3, 0.026, 0.006, 6, P.chitin, {phase:Math.PI/6, capB:{hex:P.chitinDk, lift:0.004}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
