/* dev/model-qa/creatures/mon-bat.js — the giant-bat landmark table (FLYER family debut).
   Whole-object grammar: one function, one geometry frame, no anchors. A board-piece FLYING
   pose — the small furry body hovers ~0.6u above its base disc (miniature convention: no
   visible support, the figure just floats). The READ is the two large wing membranes mid-flap,
   asymmetric (right wing higher). Each wing = finger-spar tubes radiating from a wrist point,
   with thin quad membranes stretched between consecutive spars.
   Imported by both mon-bat-probe.html (render) and export-obj.mjs (Blender export). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGiantBat(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    fur:0x5a4a3e, furDk:0x40342b, furLt:0x726052,        /* dark grey-brown body */
    membrane:0x4a3c34, membraneLt:0x8a7566,               /* wing skin; paler undersides */
    spar:0x2e2620, claw:0x1b1712,                         /* finger bones / claw tips */
    ear:0x4a3c33, eye:0xb0402c, nose:0x241c17, fang:0xd8cdb4,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — hover height + body center ---------- */
  const HOVER = 0.62;                                     /* body floats this high over the disc */
  const BODY = V(0, HOVER, 0);                            /* torso center */

  /* ---------- BODY (small furry loft, tucked flying posture) ---------- */
  stack([
    {y:HOVER-0.15, rx:0.075, rz:0.085, hex:P.furDk},      /* pelvis / tucked rump */
    {y:HOVER-0.05, rx:0.115, rz:0.135, hex:P.fur},
    {y:HOVER+0.05, rx:0.130, rz:0.150, hex:P.fur},        /* chest — widest, forward-leaning */
    {y:HOVER+0.14, rx:0.100, rz:0.115, hex:P.fur},
    {y:HOVER+0.20, rx:0.060, rz:0.065, hex:P.furDk},      /* neck */
  ], 8, {capBot:{hex:P.furDk, lift:0.02}});

  /* ---------- HEAD (fox-like snout + big ears), tilted forward ---------- */
  const HEAD = V(0, HOVER+0.29, 0.055);
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:HEAD.y-0.055, rx:0.075, rz:0.080, hex:P.furDk},  /* jaw */
      {y:HEAD.y,       rx:0.095, rz:0.098, hex:P.fur},    /* cheeks / cranium */
      {y:HEAD.y+0.045, rx:0.078, rz:0.080, hex:P.fur},    /* brow */
    ];
    const rings=bands.map(b=>ring(V(HEAD.x,b.y,HEAD.z), V(0,1,0), b.rx, b.rz, n, ph));
    /* fox snout — push the two FRONT verts (1,2) of the cheek ring forward + down into a muzzle */
    for(const i of [1,2]){ rings[1][i].z += 0.055; rings[1][i].y -= 0.018; }
    for(const i of [1,2]){ rings[0][i].z += 0.045; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings[2], V(HEAD.x, HEAD.y+0.075, HEAD.z-0.01), P.furDk);
    /* muzzle tip cap + nose */
    const snoutTip = V(HEAD.x, HEAD.y-0.045, HEAD.z+0.135);
    quad(V(snoutTip.x-0.022,snoutTip.y-0.006,snoutTip.z-0.01), V(snoutTip.x+0.022,snoutTip.y-0.006,snoutTip.z-0.01),
         V(snoutTip.x+0.018,snoutTip.y+0.020,snoutTip.z), V(snoutTip.x-0.018,snoutTip.y+0.020,snoutTip.z), P.nose, 0.02);
    /* two tiny fangs under the snout */
    for(const s of [-1,1]) quad(V(HEAD.x+s*0.014,HEAD.y-0.058,HEAD.z+0.110), V(HEAD.x+s*0.028,HEAD.y-0.058,HEAD.z+0.108),
         V(HEAD.x+s*0.021,HEAD.y-0.085,HEAD.z+0.105), V(HEAD.x+s*0.021,HEAD.y-0.085,HEAD.z+0.105), P.fang, 0.0);
    /* eyes — small intentional dark-red dots flanking the snout base, proud of the face */
    for(const s of [-1,1]){
      const ex=HEAD.x+s*0.048, ey=HEAD.y+0.010, ez=HEAD.z+0.085;
      quad(V(ex-0.012,ey-0.010,ez), V(ex+0.012,ey-0.010,ez),
           V(ex+0.012,ey+0.011,ez-0.005), V(ex-0.012,ey+0.011,ez-0.005), P.eye, 0.0);
    }
    /* BIG EARS — two tall triangular fans rising from the crown, splayed outward */
    for(const s of [-1,1]){
      const base=V(HEAD.x+s*0.055, HEAD.y+0.055, HEAD.z-0.02);
      const tip =V(HEAD.x+s*0.135, HEAD.y+0.235, HEAD.z-0.06);
      const back=V(HEAD.x+s*0.020, HEAD.y+0.070, HEAD.z-0.05);
      quad(base, V(base.x+s*0.045,base.y+0.010,base.z+0.03), tip, tip, P.ear, 0.05);
      quad(base, back, tip, tip, P.earDk||P.furDk, 0.05);
      /* inner-ear paler membrane */
      quad(V(base.x+s*0.012,base.y+0.02,base.z+0.01), V(base.x+s*0.040,base.y+0.02,base.z+0.02),
           V(tip.x-s*0.008,tip.y-0.03,tip.z), V(tip.x-s*0.008,tip.y-0.03,tip.z), P.membraneLt, 0.05);
    }
  }

  /* ---------- WINGS — the READ. Asymmetric mid-flap: right (s=+1) up, left (s=-1) down.
     Each wing: shoulder → elbow → WRIST, then 3 finger-spar tubes radiate from the wrist,
     with membrane quads (2-3 each) stretched between consecutive spar tips. ---------- */
  const SH = V(0, HOVER+0.06, 0.0);                       /* shoulder root (both wings share) */
  function wing(s, upDeg){
    const up = upDeg*Math.PI/180;                          /* flap elevation of this wing */
    /* elbow out+up, wrist further out. y-lift keyed off `up` (positive = raised wing) */
    const EL  = V(s*0.24, SH.y + Math.sin(up)*0.10, -0.02);
    const WR  = V(s*0.46, SH.y + Math.sin(up)*0.26, -0.05);
    const arm = P.furDk;
    tube(SH, EL, 0.045, 0.034, 6, arm, {capA:{hex:P.fur}});
    tube(EL, WR, 0.032, 0.022, 6, arm);
    /* thumb claw at the wrist (little hook up-front) */
    tube(WR, V(WR.x+s*0.03, WR.y+0.06, WR.z+0.05), 0.014, 0.004, 5, P.spar, {capB:{hex:P.claw, lift:0.01}});
    /* 3 finger spars from the wrist — a WIDE FAN so the membrane reads as an AREA, not a rake.
       Leading spar sweeps FORWARD (+z), mid reaches OUT, trailing sweeps BACK (−z). The big z
       spread between fingers is what gives the wing its broad triangular sail. */
    const flap = Math.sin(up);                              /* raised wings lift the finger tips */
    const F = [
      V(WR.x + s*0.30, WR.y + 0.16 + flap*0.10, WR.z + 0.34),   /* leading spar — swept FORWARD */
      V(WR.x + s*0.52, WR.y + 0.04 + flap*0.14, WR.z + 0.02),   /* mid spar — reaches OUT */
      V(WR.x + s*0.34, WR.y - 0.08 + flap*0.16, WR.z - 0.34),   /* trailing spar — swept BACK */
    ];
    for(const f of F) tube(WR, f, 0.020, 0.006, 5, P.spar, {capB:{hex:P.claw, lift:0.01}});
    /* the sail's inner edge runs from the leading tip down to the body (leading membrane) and the
       trailing tip down to the ankle root — so the whole panel spans wrist→fingertips→body. */
    const BODYFORE  = V(s*0.06, HOVER+0.02, 0.04);           /* membrane root at the shoulder */
    const BODYTRAIL = V(s*0.055, HOVER-0.10, -0.08);         /* membrane root at the flank */
    /* MEMBRANES: broad quads spanning consecutive spar TIPS (not just wrist→tip), so each panel
       is a real surface. Front pass (dark upper) + a paler dipped pass (lit underside). */
    const panels = [
      [WR, F[0], F[1], BODYFORE],   /* fore cell: wrist–lead–mid, hemmed to the body */
      [WR, F[1], F[2]],             /* main cell: wrist–mid–trail */
      [F[2], WR, BODYTRAIL],        /* aft sail: trailing tip down to the flank */
    ];
    const dip=(p)=>V(p.x,p.y-0.008,p.z);
    for(const pts of panels){
      /* fan-triangulate the polygon about its first vertex → filled membrane surface */
      for(let i=1;i<pts.length-1;i++){
        quad(pts[0], pts[i], pts[i+1], pts[i+1], P.membrane, 0.05);
        quad(dip(pts[0]), dip(pts[i+1]), dip(pts[i]), dip(pts[i]), P.membraneLt, 0.05);
      }
    }
  }
  wing(+1, 42);    /* right wing raised (upstroke) */
  wing(-1, -20);   /* left wing lowered (downstroke) — asymmetric flap */

  /* ---------- LEGS — tiny tucked hind limbs with clawed feet dangling ---------- */
  for(const s of [-1,1]){
    const hip=V(s*0.05, HOVER-0.14, -0.02), foot=V(s*0.07, HOVER-0.28, -0.05);
    tube(hip, foot, 0.024, 0.014, 5, P.furDk, {capB:{hex:P.claw, lift:0.01}});
    /* 2 toe claws */
    for(const t of [-0.02, 0.02]) tube(foot, V(foot.x+t, foot.y-0.03, foot.z+0.03), 0.008, 0.002, 4, P.claw, {capB:{hex:P.claw}});
  }

  /* ---------- BASE DISC (Small piece — the bat floats above it, nothing connects) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.30, 0.30, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
