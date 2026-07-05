/* dev/model-qa/creatures/rlm-rig-mounted-turret-hound.js — RIG-MOUNTED TURRET HOUND (ash,
   Medium construct/beast-chassis, CR 4). Read: a scrap-hound chassis — a low quadruped
   scavenged-metal dog frame on four piston legs, hunched shoulders carrying a swiveling
   autogun turret bolted onto its back where a head might sit, plus a smaller sensor-snout
   head up front sniffing low. VS-desaturated grime: rust-brown scrap plating, gunmetal
   turret, dull brass fittings — ash register (post-apocalyptic, hoarded-fuel dirty), not
   clean sci-fi chrome. NO eye quads — a single dim sensor-lens slit instead. Whole-object
   grammar: one function, one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildRigMountedTurretHound(){
  const P = {
    scrap:0x5a4c3e, scrapDk:0x3c332a, scrapLt:0x6e5d48,
    rust:0x7a4a30, rustDk:0x4e2f1e,
    gun:0x3e4044, gunDk:0x24262a, gunLt:0x565a5e,
    brass:0x7a6a3a, brassDk:0x4e4324,
    lens:0x8a2020, lensDk:0x300c0c,
    rivet:0x201d18, hose:0x2a2622,
    disc:0x4a4038, discTop:0x585047,
  };

  /* LOW quadruped chassis spine, hunched forward under the turret mass */
  const spY = 0.30;
  const S = {
    rearHip: V(0, spY-0.02, -0.28),
    mid:     V(0, spY+0.06, -0.02),
    shldr:   V(0, spY+0.10, 0.20),
    snoutB:  V(0, spY-0.06, 0.36),
  };
  tube(S.rearHip, S.mid,   0.170, 0.190, 8, P.scrap,   {phase:Math.PI/8, capA:{hex:P.scrapDk, lift:0.02}});
  tube(S.mid,     S.shldr, 0.190, 0.210, 8, P.scrapDk, {phase:Math.PI/8});
  tube(S.shldr,   S.snoutB,0.150, 0.090, 7, P.rust,    {phase:Math.PI/7});

  /* plated hull seams — riveted scrap panels along the flank */
  for(const z of [-0.20,-0.02,0.14]){
    quad(V(-0.20,spY+0.02,z-0.03), V(0.20,spY+0.02,z-0.03), V(0.18,spY-0.14,z+0.02), V(-0.18,spY-0.14,z+0.02), P.scrapLt, 0.05);
    for(const s of [-1,1]) quad(V(s*0.19,spY-0.02,z), V(s*0.19+0.014,spY-0.02,z), V(s*0.19+0.012,spY-0.05,z+0.01), V(s*0.19-0.002,spY-0.05,z+0.01), P.rivet, 0.02);
  }

  /* SENSOR-SNOUT HEAD — small, low, forward, sniffing */
  {
    const snT = V(0, spY-0.10, 0.50);
    tube(S.snoutB, snT, 0.090, 0.055, 7, P.rustDk, {capB:{hex:P.gunDk, lift:0.01}});
    /* single dim sensor-lens slit — no eye quads */
    quad(V(-0.028,spY-0.02,0.44), V(0.028,spY-0.02,0.44), V(0.024,spY-0.045,0.445), V(-0.024,spY-0.045,0.445), P.lens, 0.04);
    quad(V(-0.018,spY-0.026,0.442), V(0.018,spY-0.026,0.442), V(0.015,spY-0.038,0.446), V(-0.015,spY-0.038,0.446), P.lensDk, 0.04);
    /* jaw vents, slatted */
    for(let i=0;i<3;i++){ const zz=0.40+i*0.03;
      quad(V(-0.05,spY-0.09,zz), V(0.05,spY-0.09,zz), V(0.04,spY-0.10,zz+0.012), V(-0.04,spY-0.10,zz+0.012), P.gunDk, 0.03); }
  }

  /* SWIVEL TURRET — bolted onto the back where a head would sit, elevated on a stub ring mount */
  {
    const baseC = V(0, spY+0.24, 0.02);
    const r1 = ring(V(baseC.x,baseC.y,baseC.z), V(0,1,0), 0.150, 0.150, 10, Math.PI/10);
    const r2 = ring(V(baseC.x,baseC.y+0.06,baseC.z), V(0,1,0), 0.155, 0.155, 10, Math.PI/10);
    stitch([r1,r2], ()=>P.gun);
    /* ring-mount rivets */
    for(let i=0;i<10;i++){ const t=(i/10)*Math.PI*2;
      quad(V(baseC.x+Math.cos(t)*0.155,baseC.y+0.03,baseC.z+Math.sin(t)*0.155),
           V(baseC.x+Math.cos(t)*0.155+0.01,baseC.y+0.03,baseC.z+Math.sin(t)*0.155+0.01),
           V(baseC.x+Math.cos(t)*0.145+0.01,baseC.y+0.05,baseC.z+Math.sin(t)*0.145+0.01),
           V(baseC.x+Math.cos(t)*0.145,baseC.y+0.05,baseC.z+Math.sin(t)*0.145), P.brass, 0.02);
    }
    /* turret body — squat drum on the ring */
    const drumB = ring(V(baseC.x, baseC.y+0.08, baseC.z), V(0,1,0), 0.130, 0.130, 8, Math.PI/8);
    const drumT = ring(V(baseC.x, baseC.y+0.20, baseC.z), V(0,1,0), 0.100, 0.100, 8, Math.PI/8);
    stitch([drumB, drumT], ()=>P.gunLt);
    capFan(drumT, V(baseC.x, baseC.y+0.23, baseC.z), P.gunDk);
    /* SWIVEL AUTOGUN — twin barrels projecting forward off the drum, pointed slightly up */
    const gunBase = V(baseC.x, baseC.y+0.16, baseC.z+0.10);
    for(const s of [-1,1]){
      const bB = V(gunBase.x+s*0.045, gunBase.y, gunBase.z);
      const bT = V(gunBase.x+s*0.045, gunBase.y+0.03, gunBase.z+0.42);
      tube(bB, bT, 0.026, 0.020, 5, P.gunDk, {capB:{hex:P.gunDk, lift:0.006}});
    }
    /* ammo feed hose looping down to the hull */
    const feedA = V(baseC.x-0.10, baseC.y+0.10, baseC.z-0.05);
    const feedB = V(-0.16, spY+0.06, -0.05);
    tube(feedA, feedB, 0.020, 0.024, 5, P.hose);
  }

  /* LEGS — four thin piston-strut legs, splayed, ending in flat scrap-plate feet */
  {
    const pistonLeg=(sx, sz, fx, fz)=>{
      const shoulder = V(sx, spY-0.06, sz);
      const knee = V(sx*1.15, spY-0.30, sz + (fz>sz?0.03:-0.03));
      const foot = V(fx, 0.045, fz);
      tube(shoulder, knee, 0.052, 0.036, 6, P.scrapDk);
      tube(knee, foot, 0.036, 0.044, 6, P.gun, {capB:{hex:P.gunDk, lift:0.01}});
      /* flat plate foot */
      quad(V(foot.x-0.05,0.03,foot.z-0.05), V(foot.x+0.05,0.03,foot.z-0.05), V(foot.x+0.045,0.02,foot.z+0.05), V(foot.x-0.045,0.02,foot.z+0.05), P.gunDk, 0.03);
    };
    pistonLeg(-0.16, 0.16, -0.22, 0.22);
    pistonLeg( 0.16, 0.16,  0.22, 0.22);
    pistonLeg(-0.16,-0.24, -0.24,-0.34);
    pistonLeg( 0.16,-0.24,  0.24,-0.34);
  }

  /* stub tail antenna — a whip aerial, ash-scrap signature */
  {
    const t0 = V(0, spY+0.06, -0.30);
    const t1 = V(0.02, spY+0.30, -0.36);
    const t2 = V(0.03, spY+0.48, -0.38);
    tube(t0, t1, 0.020, 0.012, 5, P.rustDk);
    tube(t1, t2, 0.012, 0.004, 5, P.brass, {capB:{hex:P.brass, lift:0.004}});
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
