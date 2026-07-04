/* dev/model-qa/creatures/mon-needleblight.js — the NEEDLE BLIGHT (bespoke Medium Plant).
   Adam's QA-review ruling 2026-07-04: "ugly, not sure what that is" — rebuild so it READS as a plant
   creature. The bestiary needle-blight is a Medium Plant (a shambling humanoid-shaped mass of woody
   vines and pine-needle bristles — Claw + a Needles ranged burst). Built as a TWISTED PLANT-HUMANOID:
   a gnarled bark-skinned trunk-body with a knot-hole "face" hollow (NO eyes — house eye ruling
   reversed 2026-07-04), stubby root-clawed legs, two twisted branch-arms ending in claw-twig hands,
   and — the signature — BRISTLING NEEDLE CLUSTERS erupting all over (shoulders, back, forearms, crown):
   dense fans of thin dark-green pine needles. Bark texture is carried by vertical channel grooves in
   the "wood" material channel. Whole-object grammar: one function, one geometry frame, no anchors.
   Medium: ~1.4u tall, base disc r=0.42. Imported by mon-needleblight-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildNeedleBlight(){
  /* ---------- PALETTE (blighted bark browns + dark evergreen needles) ---------- */
  const P = {
    bark:0x5a4a34, barkDk:0x3c3020, barkLt:0x6f5c40,          // gnarled woody bark
    barkGrey:0x4a4436,                                         // weathered grey bark patches
    knot:0x241c12, hollow:0x140f09,                            // dark knot-hole "face" cavity
    needle:0x394a2c, needleDk:0x26331d, needleLt:0x4e6338,    // dark evergreen pine needles
    root:0x463928, rootDk:0x2e2418,                            // root-claw feet
    sap:0x7a5a2a,                                              // amber sap ooze at breaks
    disc:0x3f362d, discTop:0x4c4238,
  };
  // Bark on the "wood" channel; needle clusters left untagged (classifier reads them as foliage).
  setChannels({ [P.bark]:"wood", [P.barkDk]:"wood", [P.barkLt]:"wood", [P.barkGrey]:"wood", [P.root]:"wood", [P.rootDk]:"wood" });

  /* ---------- LANDMARKS — a hunched, twisted trunk. Slightly canted (leaning, off-kilter growth). --- */
  const L = {
    hipY:0.58, waistY:0.72, chestY:0.92, shldY:1.06, crownY:1.24, topY:1.34,
    hipHalf:0.11, shoulderX:0.205,
  };
  /* a slight lean + twist to the whole body (crooked growth) */
  const cant = (p)=>{ const q=p.clone().sub(V(0,L.hipY,0)); q.applyAxisAngle(V(0,0,1), -0.06); q.applyAxisAngle(V(0,1,0), 0.10); return q.add(V(0,L.hipY,0)); };

  /* a NEEDLE CLUSTER: a fan of thin dark-green needle quads erupting from `base` along `dir`,
     splaying in a cone. `n` needles, length `len`, spread `spread`. Layered dark→light. */
  function needleCluster(base, dir, n, len, spread, jitterSeedX){
    const d=dir.clone().normalize();
    const up=Math.abs(d.y)>0.9?V(1,0,0):V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,d).normalize();
    const w=new THREE.Vector3().crossVectors(d,u).normalize();
    for(let k=0;k<n;k++){
      const a=(k/n)*Math.PI*2 + jitterSeedX;
      const r=spread*(0.4+0.6*((k*7)%n)/n);
      const off=u.clone().multiplyScalar(Math.cos(a)*r).addScaledVector(w, Math.sin(a)*r);
      const tip=base.clone().addScaledVector(d, len*(0.8+0.4*((k*5)%n)/n)).add(off);
      const hex = (k%3===0)?P.needleLt : (k%3===1)?P.needle : P.needleDk;
      // a thin needle = a very slim quad from base to tip
      const perp=off.clone().normalize().multiplyScalar(0.008).add(V(0,0.006,0));
      quad(base.clone().sub(perp), base.clone().add(perp),
           tip.clone().add(perp.clone().multiplyScalar(0.3)), tip.clone().sub(perp.clone().multiplyScalar(0.3)), hex, 0.06);
    }
  }

  /* ---------- BODY — a gnarled bark TRUNK loft (narrow root base, swelling chest, knotty shoulders).
     Slightly irregular radii per band = a lumpy organic trunk, not a smooth cylinder. ---------- */
  stack([
    {y:L.hipY,   rx:0.130, rz:0.118, hex:P.barkDk},
    {y:L.waistY, rx:0.118, rz:0.100, hex:P.bark},
    {y:L.chestY, rx:0.150, rz:0.126, hex:P.bark},     // swelling trunk chest
    {y:L.shldY,  rx:0.162, rz:0.130, hex:P.barkLt},   // knotty shoulders
    {y:L.crownY, rx:0.108, rz:0.096, hex:P.barkGrey}, // the head is the top of the trunk (no separate skull)
  ], 9, {xform:cant, capBot:{hex:P.rootDk, lift:0.006}, capTop:{hex:P.barkGrey, lift:0.01}});

  /* bark CHANNEL GROOVES — a few dark vertical strips up the trunk (bark texture read) */
  for(const ang of [-0.9, -0.2, 0.5, 1.3, 2.4]){
    const r=0.13;
    const bx=Math.sin(ang)*r, bz=Math.cos(ang)*r;
    const a=cant(V(bx, L.hipY+0.02, bz)), b=cant(V(bx*1.1, L.chestY, bz*1.1));
    quad(a.clone().add(V(-0.012,0,0)), a.clone().add(V(0.012,0,0)),
         b.clone().add(V(0.010,0,0)), b.clone().add(V(-0.010,0,0)), P.barkDk, 0.05);
  }

  /* ---------- "FACE" — a dark KNOT-HOLE hollow high on the trunk-head (no eyes; a plant knot cavity).
     A recessed dark oval + a ragged bark rim. Reads as a hollow in the wood, not a face. ---------- */
  {
    const fy=L.crownY-0.02, fz=0.104;
    const rim=(x,y,z)=>cant(V(x,y,z));
    // dark recessed cavity
    quad(rim(-0.050,fy+0.045,fz), rim(0.050,fy+0.045,fz),
         rim(0.038,fy-0.055,fz), rim(-0.038,fy-0.055,fz), P.hollow, 0.02);
    // knot rim (raised bark lip around it)
    for(const [x0,y0,x1,y1] of [[-0.058,fy+0.055,0.058,fy+0.055],[-0.058,fy+0.055,-0.046,fy-0.065],[0.058,fy+0.055,0.046,fy-0.065],[-0.046,fy-0.065,0.046,fy-0.065]]){
      quad(rim(x0,y0,fz-0.006), rim(x1,y1,fz-0.006), rim(x1*0.9,y1,fz-0.02), rim(x0*0.9,y0,fz-0.02), P.knot, 0.04);
    }
    // a jagged gash-mouth below the knot (a splintered crack, amber sap in it)
    quad(rim(-0.030,fy-0.075,fz-0.004), rim(0.030,fy-0.075,fz-0.004),
         rim(0.020,fy-0.110,fz-0.010), rim(-0.020,fy-0.110,fz-0.010), P.sap, 0.03);
  }

  /* ---------- NEEDLE CLUSTERS — the signature. Bristling fans erupting from crown, shoulders, back. --- */
  needleCluster(cant(V(0, L.topY-0.02, 0.02)),        V(0.1, 1, 0.1),   14, 0.30, 0.16, 0.0);   // crown crest
  needleCluster(cant(V(-0.14, L.shldY+0.03, 0.02)),   V(-0.5, 0.9, 0.2),12, 0.24, 0.14, 1.1);   // left shoulder
  needleCluster(cant(V( 0.14, L.shldY+0.03, 0.02)),   V(0.5, 0.9, 0.2), 12, 0.24, 0.14, 2.2);   // right shoulder
  needleCluster(cant(V(-0.06, L.chestY, -0.13)),      V(-0.3, 0.6, -1), 10, 0.22, 0.13, 0.7);   // upper back
  needleCluster(cant(V( 0.08, L.waistY, -0.12)),      V(0.3, 0.4, -1),  9,  0.20, 0.12, 1.7);   // lower back

  /* ---------- ARMS — two twisted BRANCH-arms; gnarled, ending in claw-twig hands. Left raised
     (claw threat), right lower. Needle tufts on the forearms. ---------- */
  const twigHand=(ctr, faceDir, hex)=>{
    const d=faceDir.clone().normalize();
    const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
    for(const off of [-1,-0.3,0.4,1]){
      const kb=ctr.clone().addScaledVector(side, off*0.030);
      const km=kb.clone().addScaledVector(d,0.055).addScaledVector(side, off*0.014);
      const kt=km.clone().addScaledVector(d,0.045).addScaledVector(side, off*0.006).add(V(0,-0.02,0));
      tube(kb, km, 0.012, 0.008, 4, hex);
      tube(km, kt, 0.008, 0.003, 4, P.barkDk, {capB:{hex:P.barkDk, lift:0.004}});   // sharp claw-twig tips
    }
  };
  {
    /* LEFT branch-arm — raised, clawing forward/up */
    const S=cant(V(-L.shoulderX, L.shldY-0.02, 0.0));
    const E=V(-0.34, 0.98, 0.16);
    const H=V(-0.30, 1.06, 0.34);
    tube(S,E,0.048,0.034,6,P.bark, {capA:{hex:P.barkDk}});
    tube(E,H,0.034,0.024,6,P.barkLt);
    needleCluster(E, V(-0.6,0.3,0.6), 8, 0.18, 0.11, 0.3);   // forearm needle tuft
    twigHand(H, V(-0.2,0.2,1), P.barkLt);

    /* RIGHT branch-arm — lower, reaching down/forward */
    const S2=cant(V(L.shoulderX, L.shldY-0.02, 0.0));
    const E2=V(0.32, 0.80, 0.14);
    const H2=V(0.34, 0.64, 0.30);
    tube(S2,E2,0.048,0.034,6,P.bark, {capA:{hex:P.barkDk}});
    tube(E2,H2,0.034,0.024,6,P.barkLt);
    needleCluster(E2, V(0.6,0.1,0.6), 8, 0.18, 0.11, 1.4);   // forearm needle tuft
    twigHand(H2, V(0.2,-0.3,1), P.barkLt);
  }

  /* ---------- LEGS — stubby gnarled ROOT-legs splaying to root-claw feet gripping the ground. ---- */
  {
    const legL=(sx)=>{
      const hip=cant(V(sx*L.hipHalf, L.hipY-0.02, 0.0));
      const knee=V(sx*0.135, 0.34, 0.06);
      const ankle=V(sx*0.135, 0.12, 0.02);
      tube(hip, knee, 0.062, 0.048, 6, P.bark);
      tube(knee, ankle, 0.046, 0.034, 6, P.barkDk);
      // root-claw foot: 3-4 spreading roots gripping the disc
      for(const [dx,dz] of [[sx*0.06,0.06],[sx*0.02,0.09],[-sx*0.03,0.06],[sx*0.03,-0.05]]){
        const rb=V(ankle.x,0.10,ankle.z);
        const rt=V(ankle.x+dx, 0.02, ankle.z+dz);
        tube(rb, rt, 0.024, 0.008, 5, P.root, {capB:{hex:P.rootDk, lift:0.004}});
      }
    };
    legL(-1); legL(1);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
