/* dev/model-qa/creatures/rlm-static-touched-vermin.js — STATIC-TOUCHED VERMIN (ash realm, Small,
   CR 0.25). Read: an irradiated numbing-touch centipede — a long low segmented body on many
   short splayed legs, glowing sickly at the seams (radiation tell), a blunt mandible head low to
   the ground. Whole-object grammar: one function, one merged frame, no anchors. NO eye quads —
   dark socket dimples only. Base disc r=0.32 (Small). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildStaticTouchedVermin(){
  /* ---------- PALETTE (VS-desaturated sick chitin, glowing seep-green seam glow, ash register) --- */
  const P = {
    chitin:0x4a4536, chitinDk:0x322e22, chitinLt:0x615c46,
    seam:0x8ea34a, seamDk:0x5c6a30, glow:0xb8cf6a,
    leg:0x2c2a20, mandible:0x1e1c16, socket:0x151310,
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — long low segmented spine, close to the ground ---------- */
  const spY = 0.14;
  const segCount = 7;
  const segZ0 = -0.42, segZ1 = 0.30;
  const spine = [];
  for(let i=0;i<segCount;i++){
    const t = i/(segCount-1);
    spine.push(V(0, spY + 0.01*Math.sin(t*Math.PI), segZ0 + (segZ1-segZ0)*t));
  }

  /* ---------- BODY — segmented tube chain, alternating chitin/seam-glow bands ---------- */
  for(let i=0;i<spine.length-1;i++){
    const t=i/(spine.length-2);
    const rA = 0.075*(1-Math.abs(t-0.35)*0.5), rB = 0.070*(1-Math.abs((t+1/(spine.length-1))-0.35)*0.5);
    const glowSeg = (i%2===1);
    tube(spine[i], spine[i+1], Math.max(0.05,rA), Math.max(0.05,rB), 7, glowSeg?P.seam:P.chitin, {phase:Math.PI/7});
    /* seam-glow ring right at each joint (the radiation tell) */
    const jr = ring(spine[i+1], V(0,1,0), Math.max(0.052,rB*0.95), Math.max(0.052,rB*0.95), 7, Math.PI/7);
    capFan(jr, V(spine[i+1].x, spine[i+1].y+0.012, spine[i+1].z), i%2===0?P.glow:P.seamDk, true);
  }

  /* ---------- HEAD — blunt low mandible-head at the front (+z end) ---------- */
  {
    const headC = V(0, spY-0.01, segZ1+0.06);
    const r1 = ring(V(0,spY,segZ1), V(0,0,1), 0.078, 0.070, 8, Math.PI/8);
    const r2 = ring(headC, V(0,0,1), 0.055, 0.050, 8, Math.PI/8);
    stitch([r1,r2], ()=>P.chitinDk);
    capFan(r2, V(headC.x,headC.y,headC.z+0.03), P.mandible);
    /* mandibles — two short curved pincers projecting forward */
    for(const s of [-1,1]){
      const mb = V(s*0.035, spY-0.02, segZ1+0.09);
      const mt = V(s*0.075, spY-0.03, segZ1+0.17);
      tube(mb, mt, 0.020, 0.008, 4, P.mandible, {capB:{hex:P.mandible}});
    }
    /* dark socket dimples (no eye quads) either side of the head */
    for(const s of [-1,1]){
      const c = V(s*0.045, spY+0.02, segZ1+0.02);
      quad(V(c.x-0.014,c.y+0.012,c.z), V(c.x+0.014,c.y+0.012,c.z), V(c.x+0.012,c.y-0.012,c.z), V(c.x-0.012,c.y-0.012,c.z), P.socket, 0.02);
    }
  }

  /* ---------- LEGS — many short splayed legs along the body, low sprawl, one pair per segment --- */
  {
    for(let i=1;i<spine.length-1;i++){
      const seg = spine[i];
      for(const s of [-1,1]){
        const hip = V(s*0.055, seg.y-0.01, seg.z);
        const foot = V(s*0.155, 0.015, seg.z+0.015);
        tube(hip, foot, 0.022, 0.010, 4, P.leg, {capB:{hex:P.leg, lift:0.004}});
      }
    }
  }

  /* ---------- TAIL SEGMENT — a short tapered tail spike at the rear (-z end) ---------- */
  {
    const t0 = spine[0];
    const t1 = V(0, 0.06, segZ0-0.14);
    tube(t0, t1, 0.06, 0.018, 6, P.chitinDk, {phase:Math.PI/6, capB:{hex:P.chitinDk, lift:0.005}});
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.038,0), V(0,1,0), 0.30, 0.30, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.041,0), P.discTop);
  }
}
