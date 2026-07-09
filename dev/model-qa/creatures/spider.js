/* dev/model-qa/creatures/spider.js — the GIANT SPIDER landmark table (Large, CR 1, realm core),
   REBUILT under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry pilot,
   rebuild-w3 cell 8). Family root for the spider line — 11 flavor instances hang off this chassis
   (crawling-claw no longer aliases here, it has its own file). Core identity: the web hunter.

   FEATURE CHECKLIST (the ~1,100-1,700 budget buys):
     1. ARTHROPOD anatomy per ANATOMY-CANON — TWO pinched masses (small cephalothorax, narrow
        pedicel waist, bulbous abdomen ~1.6x the front volume), never fused into one blob.
     2. SIGNATURE POSE — the raised-forelegs threat rear: the front leg pair lifted HIGH off the
        ground and splayed wide/forward (knees above the eye line, feet clear of the disc), while
        the remaining 3 pairs plant in the canon "spider knee" tent-pole (femur up-and-out, knee
        peaking above the body line, tibia down to a planted foot) — the raised/grounded contrast
        IS the threat read.
     3. Fangs presented — pedipalps splayed open + chelicerae spread wide and angled forward-down,
        pale-tipped (never painted the darkest tier — law 3) so the fang pair reads as the loud
        beat under the raised legs.
     4. Pale leg-joint bands at every knee (all 8 legs, raised pair included) — a bright ivory ring
        at the sharpest bend, the second high-value zone carrying the signature.
     5. Abdomen cocked up and back off the pedicel (tilted stack, not a flat rear blob) — violet-
        topped, eye cluster on the carapace front.

   POSE SENTENCE: reared back on its hind and mid legs, front pair thrown up and spread wide,
   abdomen cocked skyward off the pinched waist, fangs splayed open toward the camera — the half-
   second before it lunges, never a flat resting crouch.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by both ps1-sheet.html (SETS['rebuild-w3'], cell 8, fn buildSpider) and
   export-obj.mjs (Blender export). */
import { V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildSpider(){
  const P = {
    chitin:0x4a5a6b, chitinDk:0x333f4c, chitinLt:0x6f7d8b,
    violet:0x6a5578, violetDk:0x4a3c55,
    fangPale:0xdcd2b4, fangTip:0xf0e6cc,
    eyeSock:0x241030, eyeGlow:0xa565bd,
    band:0xd8cca0,
    disc:0x4a4038, discTop:0x585047,
  };
  const CEPH = V(0, 0.30, 0.15);              /* cephalothorax center (carries legs + face) */
  const bodyRx = 0.20, bodyRz = 0.22, hipY = 0.27;

  /* cephalothorax (carapace) */
  stack([
    {y:0.20, rx:0.14, rz:0.17, cz:CEPH.z, hex:P.chitinDk},
    {y:0.27, rx:0.21, rz:0.25, cz:CEPH.z, hex:P.chitin},
    {y:0.33, rx:0.20, rz:0.24, cz:CEPH.z, hex:P.chitin},
    {y:0.39, rx:0.12, rz:0.16, cz:CEPH.z, hex:P.chitinDk},
  ], 8, {capTop:{hex:P.chitinDk, lift:0.02}, capBot:{hex:P.chitinDk}});

  /* abdomen — cocked UP off the pedicel (rotated stack, not a flat rear blob). Rotate each ring's
     y/z about a hinge near the waist so the bulb climbs up-and-back instead of sitting level. */
  {
    const hinge = {y:0.30, z:-0.04}, theta = -0.62; /* rad, negative = tilt the tail skyward */
    const cos = Math.cos(theta), sin = Math.sin(theta);
    const tilt = (p) => {
      const dz = p.z - hinge.z, dy = p.y - hinge.y;
      return V(p.x, hinge.y + dz*sin + dy*cos, hinge.z + dz*cos - dy*sin);
    };
    stack([
      {y:0.30, rx:0.10, rz:0.13, cz:-0.06, hex:P.chitinDk},
      {y:0.42, rx:0.25, rz:0.31, cz:-0.16, hex:P.chitin},
      {y:0.56, rx:0.31, rz:0.40, cz:-0.24, hex:P.chitin},
      {y:0.70, rx:0.28, rz:0.36, cz:-0.28, hex:P.violet},
      {y:0.82, rx:0.18, rz:0.25, cz:-0.30, hex:P.violetDk},
    ], 8, {xform:tilt, capTop:{hex:P.violetDk, lift:0.03}, capBot:{hex:P.chitinDk}});
  }

  /* pedicel (waist connecting carapace→abdomen) */
  tube(V(0,0.29,-0.02), V(0,0.36,-0.15), 0.10, 0.10, 6, P.chitinDk);

  /* leg-joint pale band — the knee ring, always the same bright value regardless of leg pose */
  const kneeBand = (K, axisPt, r) => {
    const d = V(axisPt.x-K.x, axisPt.y-K.y, axisPt.z-K.z);
    const n = Math.hypot(d.x,d.y,d.z)||1;
    quad(V(K.x-d.z/n*r,K.y-0.024,K.z+d.x/n*r), V(K.x+d.z/n*r,K.y-0.024,K.z-d.x/n*r),
         V(K.x+d.z/n*r,K.y+0.05,K.z-d.x/n*r),  V(K.x-d.z/n*r,K.y+0.05,K.z+d.x/n*r), P.band, 0.05);
  };

  /* 3 grounded pairs (mid + rear): hip ON the carapace → SHARP high knee → foot planted —
     the canon "spider knee" tent-pole (femur up-and-out, tibia down past vertical). */
  const AZ_GROUND = [75, 110, 140];
  for(const s of [-1,1]){
    for(let k=0;k<3;k++){
      const a=AZ_GROUND[k]*Math.PI/180, d=V(s*Math.sin(a),0,Math.cos(a));
      const H=V(d.x*bodyRx, hipY, CEPH.z + d.z*bodyRz);
      const K=V(H.x + d.x*0.17, 0.64, H.z + d.z*0.17);
      const F=V(H.x + d.x*0.50, 0.02, H.z + d.z*0.50);
      tube(H,K,0.044,0.036,6,P.chitin);
      tube(K,F,0.038,0.012,6,P.chitinLt, {capA:{hex:P.chitinLt}, capB:{hex:P.chitinDk, lift:0.01}});
      kneeBand(K, F, 0.055);
    }
  }

  /* raised front pair — the threat signature: hip forward on the carapace, knee thrown HIGH
     above the eye line, foot spread wide and clear of the ground (never touches the disc). */
  for(const s of [-1,1]){
    const a=32*Math.PI/180, d=V(s*Math.sin(a),0,Math.cos(a));
    const H=V(d.x*bodyRx*0.9, hipY+0.02, CEPH.z + d.z*bodyRz*0.9 + 0.03);
    const K=V(H.x + d.x*0.42, 0.86, H.z + d.z*0.30 + 0.05);
    const F=V(K.x + d.x*0.30, 0.72, K.z + d.z*0.05 - 0.10);
    tube(H,K,0.048,0.038,6,P.chitin);
    tube(K,F,0.038,0.013,6,P.chitinLt, {capA:{hex:P.chitinLt}, capB:{hex:P.chitinDk, lift:0.01}});
    kneeBand(K, F, 0.058);
  }

  /* pedipalps + chelicerae (splayed open, fangs presented forward-down, pale-tipped). R2-CRITIC FIX
     round 3: r1's fang tube tapered 0.036->0.010 (under the 0.04u floor) and was only pale on its
     END CAP — pixel-checked and fangPale/fangTip literally did not appear on the model. Round-1 fix
     thickened it but sent it low+forward (y 0.09, z 0.61); pixel-located (temp debug color) showed
     it landing in the SAME screen region as the near-camera grounded feet — two pale nubs floating
     detached near the ground. Round-2 pulled z back but kept y low (0.17-0.24) and left a visible
     void GAP between the dark cephalothorax's silhouette and the pale blob below it — still read as
     detached. This pass keeps the fang's y inside the cephalothorax's OWN lower-ring band (0.23-0.29,
     matching the y:0.20-0.27 body rings) and shortens the z-reach so it nests directly against the
     front-bottom of the carapace instead of dangling in open air beneath it — while the pale segment
     stays a full ≥0.042u-radius tube (not just an end cap) so it still reads as the loud zone. */
  for(const s of [-1,1]){
    tube(V(s*0.06,0.29,0.30), V(s*0.12,0.27,0.38), 0.044, 0.036, 6, P.chitin);
    tube(V(s*0.12,0.27,0.38), V(s*0.16,0.23,0.44), 0.044, 0.044, 6, P.fangPale,
      {capA:{hex:P.fangPale}, capB:{hex:P.fangTip}});
  }

  /* eye cluster (front-top of carapace) */
  const dot=(x,y,z,r,hex)=>quad(V(x-r,y-r,z), V(x+r,y-r,z), V(x+r,y+r,z), V(x-r,y+r,z), hex, 0.0);
  dot(0, 0.35, 0.315, 0.075, P.eyeSock);
  for(const [x,y,r] of [[-0.045,0.375,0.018],[0.045,0.375,0.018],[-0.10,0.36,0.014],[0.10,0.36,0.014],
                        [-0.05,0.33,0.013],[0.05,0.33,0.013]]) dot(x, y, 0.322, r, P.eyeGlow);

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.74, 0.74, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.71, 0.71, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
