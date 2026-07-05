/* dev/model-qa/creatures/rlm-bunker-bred-nightmare-steed.js — BUNKER-BRED NIGHTMARE STEED (ash
   realm, Large, CR 8). Read: a cult general's scorching mount — a scarred, radiation-mutated
   warhorse silhouette (long barrel, arched neck, four haunched legs, streaming tail) but hide
   scorched black-and-ember, a smoke-wisp mane, cracked hooves that smolder, ribs of ash-caked
   scar tissue showing through patchy hide. Whole-object grammar: one function, one merged frame,
   no anchors. NO eye quads — dark ember-glow socket pits only. Large: base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildBunkerBredNightmareSteed(){
  /* ---------- PALETTE (VS-desaturated ash-scorched hide, ember glow, smoke mane) ---------- */
  const P = {
    hide:0x2a2420, hideDk:0x1a1613, hideLt:0x3c332c,
    scar:0x4a3428, scarDk:0x2e2018,               // ash-caked scar tissue patches
    ember:0x8a3620, emberDk:0x5c2214, emberGlow:0xb3491f,  // smoldering cracks/glow
    smoke:0x3a3630, smokeDk:0x24211c,             // smoke-wisp mane/tail
    hoof:0x1c1712, hoofCrack:0x6c2c16,
    socket:0x0d0a07,
    disc:0x3a332a, discTop:0x473e33,
  };

  /* ---------- LANDMARKS — spine along +z; withers ~1.15u, high arched neck; ~1.55u barrel. ---------- */
  const wY = 1.15;
  const S = {
    croup:  V(0, wY-0.02, -0.60),
    back:   V(0, wY-0.01, -0.30),
    withers:V(0, wY+0.07, -0.02),
    chest:  V(0, wY+0.01,  0.22),
    neckB:  V(0, wY+0.07,  0.40),
    neckM:  V(0, wY+0.24,  0.56),
    poll:   V(0, wY+0.33,  0.70),
    headB:  V(0, wY+0.27,  0.80),
  };

  /* ---------- BODY BARREL — scorched hide loft, ash-scar patches breaking up the surface. ---------- */
  tube(S.croup,  S.back,    0.240, 0.260, 9, P.hide,   {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.back,   S.withers, 0.260, 0.278, 9, P.scar,   {phase:Math.PI/9});
  tube(S.withers,S.chest,   0.278, 0.245, 9, P.hide,   {phase:Math.PI/9});
  tube(S.chest,  S.neckB,   0.245, 0.155, 9, P.hideDk, {phase:Math.PI/9});
  tube(S.neckB,  S.neckM,   0.155, 0.130, 9, P.hide,   {phase:Math.PI/9});
  tube(S.neckM,  S.poll,    0.130, 0.100, 9, P.hideDk, {phase:Math.PI/9});
  /* ash-scar patches + smoldering ember cracks along the flank */
  for(const [z,y] of [[-0.44,wY-0.10],[-0.18,wY-0.14],[0.08,wY-0.10]]){
    quad(V(-0.14,y,z-0.08), V(0.14,y,z-0.08), V(0.11,y+0.10,z+0.10), V(-0.11,y+0.10,z+0.10), P.scarDk, 0.06);
  }
  for(const [z,y] of [[-0.36,wY-0.02],[0.0,wY+0.02]]){
    quad(V(-0.03,y,z-0.03), V(0.03,y,z-0.03), V(0.022,y+0.05,z+0.05), V(-0.022,y+0.05,z+0.05), P.ember, 0.1);
    quad(V(-0.014,y+0.01,z-0.01), V(0.014,y+0.01,z-0.01), V(0.010,y+0.04,z+0.03), V(-0.010,y+0.04,z+0.03), P.emberGlow, 0.05);
  }
  /* smoke-wisp mane crest down the neck */
  {
    const mane=[[S.neckB,0.16],[S.neckM,0.20],[S.poll,0.15]];
    for(let i=0;i<mane.length-1;i++){
      const [a,ha]=mane[i], [b,hb]=mane[i+1];
      const az=a.clone().add(V(0,ha,-0.02)), bz=b.clone().add(V(0,hb,-0.02));
      quad(a.clone().add(V(-0.02,0,-0.05)), a.clone().add(V(0.02,0,-0.05)), bz.clone().add(V(0.02,0,0)), bz.clone().add(V(-0.02,0,0)), P.smoke, 0.08);
      quad(a.clone().add(V(0,0,-0.05)), az, bz, b.clone().add(V(0,0,-0.05)), P.smokeDk, 0.08);
    }
  }

  /* ---------- HEAD — long scorched horse skull, ember-glow socket pits, no eye quads. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:wY+0.21, cz:0.86, rx:0.090, rz:0.102, hex:P.hideDk},
      {y:wY+0.29, cz:0.84, rx:0.102, rz:0.118, hex:P.hide},
      {y:wY+0.35, cz:0.80, rx:0.094, rz:0.106, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, wY+0.39, 0.78), P.hideDk);
    /* long muzzle, scorched, nostril cracks glowing faintly */
    const mB=V(0, wY+0.18, 0.90), mM=V(0, wY+0.10, 1.02), mT=V(0, wY+0.04, 1.11);
    tube(mB, mM, 0.088, 0.072, n, P.hide, {raz:0.078, rbz:0.060, phase:ph});
    tube(mM, mT, 0.072, 0.050, n, P.hideDk, {raz:0.060, rbz:0.042, phase:ph, capB:{hex:P.socket, lift:0.008}});
    for(const s of [-1,1]){
      quad(V(s*0.026-0.008,wY+0.06,1.09), V(s*0.026+0.008,wY+0.06,1.09),
           V(s*0.026+0.006,wY+0.08,1.07), V(s*0.026-0.006,wY+0.08,1.07), P.emberGlow, 0.0);
    }
    /* ears */
    for(const s of [-1,1]){
      const eb=V(s*0.062, wY+0.38, 0.74), et=V(s*0.080, wY+0.53, 0.70);
      tube(eb, et, 0.030, 0.006, 5, P.hide, {raz:0.020, rbz:0.004, capB:{hex:P.hideDk, lift:0.006}});
    }
    /* ember-glow socket pits (no eye quads — recessed dark w/ glow rim) */
    const ey=wY+0.30, ez=0.104;
    for(const s of [-1,1]){
      const ex=s*0.080;
      quad(V(ex-0.036,ey+0.028,0.80), V(ex+0.036,ey+0.028,0.80),
           V(ex+0.028,ey-0.032,0.80), V(ex-0.028,ey-0.032,0.80), P.socket, 0.02);
      quad(V(ex-0.022,ey+0.016,0.77), V(ex+0.022,ey+0.016,0.77),
           V(ex+0.016,ey-0.018,0.77), V(ex-0.016,ey-0.018,0.77), P.emberGlow, 0.0);
    }
  }

  /* ---------- LEGS — 4 haunched legs, scorched hide, hooves cracked and smoldering. ---------- */
  {
    const leg=(hipX, hipZ, footX, footZ, rear)=>{
      const hip=V(hipX, wY-0.10, hipZ);
      const knee=V(hipX*1.02, 0.58, hipZ + (rear?0.05:-0.02));
      const fet=V(footX, 0.20, footZ);
      const hoof=V(footX, 0.05, footZ+0.02);
      const upR=rear?0.135:0.112;
      tube(hip,knee,upR,0.072,7,P.hide);
      tube(knee,fet,0.054,0.041,6,P.hideDk);
      tube(fet,hoof,0.047,0.053,6,P.hoof,{capB:{hex:P.hoofCrack, lift:0.006}});
      /* ember crack on the cannon */
      quad(V(fet.x-0.012,fet.y-0.06,fet.z-0.01), V(fet.x+0.012,fet.y-0.06,fet.z-0.01),
           V(fet.x+0.008,fet.y-0.02,fet.z+0.01), V(fet.x-0.008,fet.y-0.02,fet.z+0.01), P.ember, 0.08);
    };
    leg(-0.170, 0.20, -0.180, 0.24, false);
    leg( 0.170, 0.20,  0.180, 0.20, false);
    leg(-0.185, -0.54, -0.200, -0.48, true);
    leg( 0.185, -0.54,  0.200, -0.52, true);
  }

  /* ---------- TAIL — a streaming smoke-wisp sweep tapering to embered wisps. ---------- */
  {
    const t0=V(0.02, wY-0.06, -0.64);
    const t1=V(0.05, wY-0.30, -0.78);
    const t2=V(0.08, 0.55,    -0.90);
    const t3=V(0.10, 0.28,    -0.94);
    const tip=V(0.11, 0.10,   -0.92);
    tube(t0,t1,0.078,0.090,8,P.smoke,{phase:Math.PI/8, capA:{hex:P.smokeDk}});
    tube(t1,t2,0.090,0.080,8,P.smoke,{phase:Math.PI/8});
    tube(t2,t3,0.080,0.054,8,P.smokeDk,{phase:Math.PI/8});
    tube(t3,tip,0.054,0.018,8,P.emberDk,{phase:Math.PI/8, capB:{hex:P.emberGlow, lift:0.008}});
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
