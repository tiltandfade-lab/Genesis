/* dev/model-qa/creatures/mon-mindthief.js — MIND-THIEF (bespoke MIND-FLAYER-adjacent, robed biped).
   A gaunt robed humanoid whose HEAD is an octopoid mass with FOUR face-tentacles hanging over the
   mouth (the signature), and long-fingered hands. Mauve-violet skin (VS desaturated), dark robe.
   Whole-object grammar: one function, one merged geometry frame, no anchors. NO eye quads — the
   octopoid head reads by shape (domed cranium, no face) not paint. Medium size, base disc r=0.42.
   Seeds the void-monk / mind-thief base (Wave 3 aberration). Imported by the ps1-sheet p2mon set. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildMindThief(){
  /* ---------- PALETTE (VS desaturated; mauve-violet skin, dark robe) ---------- */
  const P = {
    skin:0x6f5a72, skinDk:0x4a3c50, skinLt:0x8a7290,        // mauve-violet mottled skin
    tentacle:0x5c4a66, tentacleDk:0x3a2e42, tentacleLt:0x746080,
    sucker:0x2a2030,
    robe:0x2b262f, robeDk:0x18151b, robeLt:0x3c3641,        // dark desaturated robe
    trim:0x463a4a,
    hand:0x63506a, claw:0x211b26,
    socket:0x120e16,                                         // dark eye-socket recess (shape only)
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — gaunt upright frame, robed. ---------- */
  const L = {
    hipY:0.72, waistY:0.88, chestY:1.06, shldY:1.20, neckY:1.28,
    jawY:1.34, browY:1.44, domeY:1.56, crownY:1.64,
    hipHalf:0.150, shoulderX:0.220,
  };

  /* ---------- ROBE — a tall tapered tube flaring at the hem, gaunt torso within. ---------- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:0.02,      rx:0.360, rz:0.300, hex:P.robeDk},        // hem flare, wide at ground
      {y:L.hipY-0.14, rx:0.250, rz:0.200, hex:P.robe},
      {y:L.hipY,    rx:0.220, rz:0.180, hex:P.robe},
      {y:L.waistY,  rx:0.200, rz:0.160, hex:P.robeLt},
      {y:L.chestY,  rx:0.215, rz:0.170, hex:P.robe},          // slight chest bulge
      {y:L.shldY,   rx:0.240, rz:0.175, hex:P.robeDk},        // shoulder drape
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* trim line at the hem */
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(rings[0][i], rings[0][i2], rings[0][i2].clone().add(V(0,0.03,0)), rings[0][i].clone().add(V(0,0.03,0)), P.trim, 0.05);
    }
    /* neck stump rising out of the robe collar */
    tube(V(0,L.shldY,0), V(0,L.neckY,0), 0.115, 0.100, 8, P.skinDk, {phase:Math.PI/8});
  }

  /* ---------- TATTERED ROBE HEM QUADS — a few ragged points at the bottom for silhouette break --- */
  for(const ang of [0.3, 1.4, 2.6, 3.9, 5.1]){
    const cx=Math.sin(ang)*0.34, cz=Math.cos(ang)*0.28;
    const base=V(cx, 0.03, cz);
    quad(base, base.clone().add(V(cx*0.15,0,cz*0.15)), base.clone().add(V(cx*0.10,-0.09,cz*0.10)), base, P.robeDk, 0.06);
  }

  /* ---------- HEAD — octopoid mass: broad domed cranium, no face plane, dark eye-socket recesses,
     FOUR face-tentacles hanging down over the mouth area. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.150, rz:0.140, hex:P.skin},          // lower cranium/jaw mass
      {y:L.browY,  rx:0.185, rz:0.175, hex:P.skinLt},        // widest — brow bulge
      {y:L.domeY,  rx:0.170, rz:0.160, hex:P.skin},          // dome narrows
      {y:L.crownY, rx:0.110, rz:0.104, hex:P.skinDk},        // crown pulled in
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.crownY+0.09, 0), P.skinDk);

    /* dark eye-socket recesses — shape only, pushed IN, no paint quads */
    for(const s of [-1,1]){
      const i = s<0 ? 2 : n-2;
      rings[1][i].x *= 0.72; rings[1][i].z += 0.02;
      const c = rings[1][i].clone();
      quad(c.clone().add(V(0,0.02,0.01)), c.clone().add(V(s*-0.02,0.02,-0.02)),
           c.clone().add(V(s*-0.02,-0.02,-0.02)), c.clone().add(V(0,-0.02,0.01)), P.socket, 0.0);
    }

    /* head ridge bumps — mottled cranial texture, small overlaid tuft-like quads */
    for(const [ang,dy] of [[0.6,0.03],[2.1,0.04],[3.7,0.03],[5.2,0.035]]){
      const cx=Math.sin(ang)*0.15, cz=Math.cos(ang)*0.14;
      const base=V(cx, L.domeY-0.02, cz);
      quad(base, base.clone().add(V(cx*0.3,dy,cz*0.3)), base.clone().add(V(-cz*0.1,dy*0.6,cx*0.1)), base, P.skinDk, 0.06);
    }
  }

  /* ---------- FACE-TENTACLES — FOUR, hanging from the lower head mass down over the mouth area,
     each a tapered drooping tube with a small sucker-studded underside read. ---------- */
  {
    const root = V(0, L.jawY-0.02, 0.135);
    const spread=[-0.075,-0.026,0.026,0.075];
    for(const dx of spread){
      const t0 = V(dx*0.9, L.jawY-0.03, 0.132);
      const t1 = V(dx*1.3, L.jawY-0.18, 0.145);
      const t2 = V(dx*1.5, L.jawY-0.34, 0.130);
      const tip= V(dx*1.6, L.jawY-0.46, 0.100);
      tube(t0, t1, 0.026, 0.020, 5, P.tentacle, {capA:{hex:P.tentacleDk}});
      tube(t1, t2, 0.020, 0.013, 5, P.tentacleLt);
      tube(t2, tip,0.013, 0.005, 5, P.tentacleDk, {capB:{hex:P.tentacleDk, lift:0.004}});
      /* tiny sucker nub on the mid segment underside */
      const suckC = t1.clone().add(V(0,-0.01,0.008));
      quad(suckC.clone().add(V(-0.006,0,0)), suckC.clone().add(V(0.006,0,0)),
           suckC.clone().add(V(0.004,-0.008,0.004)), suckC.clone().add(V(-0.004,-0.008,0.004)), P.sucker, 0.0);
    }
  }

  /* ---------- ARMS — thin under the robe sleeves, ending in long-fingered hands. ---------- */
  {
    const longHand = (wrist, dir, hex)=>{
      const d=dir.clone().normalize();
      const side=new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
      tube(wrist, wrist.clone().addScaledVector(d,0.05), 0.045, 0.040, 5, hex, {capA:{hex}});
      for(const off of [-1.3,-0.4,0.4,1.3]){
        const fb = wrist.clone().addScaledVector(d,0.04).addScaledVector(side, off*0.020);
        const ft = fb.clone().addScaledVector(d,0.115).addScaledVector(side, off*0.010);
        tube(fb, ft, 0.013, 0.004, 4, hex, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    for(const s of [-1,1]){
      const shldr = V(s*L.shoulderX, L.shldY-0.02, 0.0);
      const elbow = V(s*0.290, L.waistY-0.02, 0.06);
      const wrist = V(s*0.270, L.hipY-0.18, 0.08);
      tube(shldr, elbow, 0.062, 0.050, 6, P.robe);
      tube(elbow, wrist, 0.048, 0.036, 6, P.skinDk);
      longHand(wrist, V(0,-1,0.3), P.hand);
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
