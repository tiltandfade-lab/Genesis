/* dev/model-qa/creatures/rlm-ghast-of-the-underworld.js — GHAST OF THE UNDERWORLD (cosmic,
   Medium, CR 2). Read: a kangaroo-legged corpse-pale barking hunter — a lean hunched corpse-grey
   humanoid torso, but the LEGS are digitigrade/kangaroo-boned (long shins, hocked backward knee,
   springy stance), jaw wide and barking-open with dark gums, claws long and grasping. VS-
   desaturated corpse-pale grey-green skin, dark sunken sockets (no eye quads). Whole-object
   grammar, one merged frame. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGhastOfTheUnderworld(){
  const P = {
    corpse:0x848a78, corpseDk:0x565c4a, corpseLt:0x9ea294,      // corpse-pale grey-green skin
    sinew:0x4a4c3c,
    mouth:0x201c18, gum:0x4a2224, tooth:0xc8c2a8,
    claw:0x2c2820,
    hollow:0x18161a,
    disc:0x2e2c22, discTop:0x3a3828,
  };

  /* ---------- LANDMARKS — a lean hunched torso, low crouched stance (kangaroo-hunter posture). -- */
  const S = {
    hip:   V(0, 0.55, -0.06),
    waist: V(0.02, 0.80, -0.02),
    chest: V(-0.02, 1.02, 0.04),
    shldr: V(0.0,  1.20, 0.02),
    neck:  V(0.02, 1.34, 0.06),
    head:  V(0.0,  1.46, 0.10),           // head thrust forward, hunter posture
  };

  /* ---------- TORSO — lean, ribby, hunched forward. ---------- */
  {
    const n=9, ph=Math.PI/n;
    tube(S.hip, S.waist,  0.155, 0.135, n, P.corpseDk, {phase:ph});
    tube(S.waist, S.chest,0.135, 0.150, n, P.corpse,   {phase:ph});
    tube(S.chest, S.shldr,0.150, 0.110, n, P.corpseLt, {phase:ph});
    tube(S.shldr, S.neck, 0.110, 0.065, n, P.corpseDk, {phase:ph});
    tube(S.neck, S.head,  0.065, 0.075, n, P.corpse,   {phase:ph});
    // ribby sinew lines down the flank
    for(const dz of [-0.04,0.02,0.08]){
      quad(V(-0.10,S.waist.y-0.02+dz*0.3,S.waist.z-0.02), V(-0.08,S.waist.y-0.02+dz*0.3,S.waist.z-0.02),
           V(-0.09,S.chest.y+dz*0.3,S.chest.z+0.02), V(-0.11,S.chest.y+dz*0.3,S.chest.z+0.02), P.sinew, 0.06);
    }
  }

  /* ---------- HEAD — a wide barking-open jaw, dark sunken sockets, no eyes. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.head.y-0.06, cz:S.head.z+0.02, rx:0.085, rz:0.100, hex:P.corpse},
      {y:S.head.y+0.03, cz:S.head.z,      rx:0.095, rz:0.095, hex:P.corpseLt},
      {y:S.head.y+0.13, cz:S.head.z-0.02, rx:0.070, rz:0.075, hex:P.corpseDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, i=>bands[i].hex);
    capFan(rings.at(-1), V(0,S.head.y+0.20,S.head.z-0.02), P.corpseDk);
    // sunken sockets — dark hollows
    for(const s of [-1,1]) quad(V(s*0.045-0.025,S.head.y+0.06,S.head.z+0.09), V(s*0.045+0.025,S.head.y+0.06,S.head.z+0.09),
                                 V(s*0.045+0.020,S.head.y+0.01,S.head.z+0.10), V(s*0.045-0.020,S.head.y+0.01,S.head.z+0.10), P.hollow, 0.04);
    // wide barking-open jaw with dark gums + teeth
    quad(V(-0.075,S.head.y-0.10,S.head.z+0.07), V(0.075,S.head.y-0.10,S.head.z+0.07),
         V(0.060,S.head.y-0.20,S.head.z+0.10), V(-0.060,S.head.y-0.20,S.head.z+0.10), P.gum, 0.06);
    quad(V(-0.065,S.head.y-0.10,S.head.z+0.075), V(0.065,S.head.y-0.10,S.head.z+0.075),
         V(0.050,S.head.y-0.14,S.head.z+0.095), V(-0.050,S.head.y-0.14,S.head.z+0.095), P.mouth, 0.04);
    for(let i=0;i<4;i++){
      const t=i/3, tx=(t-0.5)*0.11;
      quad(V(tx-0.010,S.head.y-0.10,S.head.z+0.078), V(tx+0.010,S.head.y-0.10,S.head.z+0.078),
           V(tx+0.008,S.head.y-0.14,S.head.z+0.09), V(tx-0.008,S.head.y-0.14,S.head.z+0.09), P.tooth, 0.03);
    }
  }

  /* ---------- ARMS — lean, clawed grasping hands, held forward/low, hunter-ready. ---------- */
  for(const s of [-1,1]){
    const sh = V(s*0.13, S.shldr.y-0.02, 0.0);
    const elbow = V(s*0.18, S.chest.y-0.08, 0.14);
    const wrist = V(s*0.16, S.waist.y-0.02, 0.24);
    tube(sh, elbow, 0.050, 0.038, 6, P.corpse, {phase:Math.PI/6});
    tube(elbow, wrist, 0.038, 0.026, 6, P.corpseDk, {phase:Math.PI/6});
    for(const dx of [-0.02,0,0.02]){
      const ft = V(wrist.x+dx, wrist.y-0.05, wrist.z+0.06);
      tube(wrist, ft, 0.012, 0.004, 3, P.claw, {capB:{hex:P.claw, lift:0.005}});
    }
  }

  /* ---------- KANGAROO-BONED LEGS — long shins, hocked-backward knee, springy digitigrade stance,
     clawed hind-feet — the signature silhouette break from a normal humanoid stance. ---------- */
  for(const s of [-1,1]){
    const hip = V(s*0.12, S.hip.y-0.02, -0.04);
    const knee = V(s*0.16, 0.42, -0.10);              // knee held HIGH and forward
    const hock = V(s*0.14, 0.18, -0.28);              // hock bends backward (kangaroo joint)
    const foot = V(s*0.13, 0.03, -0.06);              // long foot reaches back under
    tube(hip, knee, 0.075, 0.055, 7, P.corpseDk, {phase:Math.PI/7});
    tube(knee, hock, 0.055, 0.030, 7, P.corpse,   {phase:Math.PI/7});
    tube(hock, foot, 0.030, 0.045, 7, P.corpseDk, {phase:Math.PI/7, capB:{hex:P.claw, lift:0.008}});
    // long clawed toes
    for(const dz of [-0.10,-0.02,0.06]){
      const ft = V(foot.x, 0.005, foot.z+dz);
      tube(V(foot.x,0.03,foot.z), ft, 0.020, 0.006, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.047,0), P.discTop);
  }
}
