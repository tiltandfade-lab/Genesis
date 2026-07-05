/* dev/model-qa/creatures/rlm-bomb-cult-high-priest.js — BOMB-CULT HIGH PRIEST (ash, Medium
   humanoid cultist, CR 6). Read: a second-blast bomb-cult priest — a gaunt robed zealot in
   tattered ash-grey vestments stitched with mushroom-cloud iconography, a bandolier of
   scavenged ordnance/detonator charges strapped diagonally across the chest, a cracked
   blast-goggle mask pushed up on the brow, holding a rusted detonator-plunger box in one
   hand raised like a holy relic and a curved priest-blade in the other. VS-desaturated
   ash-grey vestment cloth, rust-iron ordnance, faint radiation-green glow accents on the
   detonator. NO eye quads — the goggle mask covers the socket line. Whole-object grammar:
   one function, one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildBombCultHighPriest(){
  const P = {
    skin:0x7a684e, skinDk:0x544636,
    robe:0x565042, robeDk:0x363228, robeLt:0x6e6650,
    icon:0x8a7a3e, iconDk:0x5e5228,           // mushroom-cloud stitched iconography (faded gold-drab)
    band:0x4a3626, bandDk:0x2e2117,
    ord:0x5c584c, ordDk:0x342f24, rust:0x7a4a30,
    goggle:0x3a4a3a, goggleDk:0x1e2818, glow:0x6a9a5a,
    blade:0x8a8a82, bladeDk:0x565650, hilt:0x2e2117,
    disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.60, 0),
    waist: V(0, 0.90, -0.01),
    chest: V(0, 1.22, -0.02),
    neck:  V(0, 1.40, -0.02),
    headB: V(0, 1.46, -0.02),
  };
  tube(S.hip,   S.waist, 0.155, 0.145, 8, P.robe,   {phase:Math.PI/8, capA:{hex:P.robeDk, lift:0.02}});
  tube(S.waist, S.chest, 0.145, 0.185, 8, P.robeDk, {phase:Math.PI/8});
  tube(S.chest, S.neck,  0.185, 0.080, 8, P.robe,   {phase:Math.PI/8});
  /* tattered robe hem flaring below the hip */
  quad(V(-0.20,0.62,0.10), V(0.20,0.62,0.10), V(0.28,0.16,0.18), V(-0.28,0.16,0.18), P.robeDk, 0.06);
  quad(V(-0.14,0.60,-0.10), V(0.06,0.60,-0.10), V(0.10,0.10,-0.16), V(-0.20,0.20,-0.16), P.robe, 0.06);

  /* mushroom-cloud stitched iconography on the chest */
  {
    const cx=0, cy=1.10;
    quad(V(cx-0.05,cy,0.185), V(cx+0.05,cy,0.185), V(cx+0.04,cy-0.05,0.19), V(cx-0.04,cy-0.05,0.19), P.icon, 0.04); // stem
    for(const [dx,dy,r] of [[-0.03,0.06,0.05],[0.03,0.065,0.045],[0,0.09,0.06]]) // cap lobes
      quad(V(cx+dx-r,cy+dy,0.19), V(cx+dx+r,cy+dy,0.19), V(cx+dx+r*0.7,cy+dy-0.03,0.192), V(cx+dx-r*0.7,cy+dy-0.03,0.192), P.iconDk, 0.04);
  }

  /* bandolier of ordnance/detonator charges strapped diagonally across the chest */
  {
    quad(V(-0.20,1.34,0.13), V(-0.10,1.34,0.13), V(0.14,0.86,0.18), V(0.04,0.86,0.18), P.band, 0.05);
    for(let i=0;i<4;i++){
      const t=i/3; const x=-0.18+t*0.30, y=1.28-t*0.42;
      const cb = V(x,y,0.185), ct = V(x,y+0.09,0.185);
      tube(cb, ct, 0.024, 0.020, 5, P.ord, {capB:{hex:P.rust, lift:0.006}});
    }
  }

  /* HEAD — cracked blast-goggle mask pushed up on the brow, gaunt jaw below */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,      cz:0, rx:0.098, rz:0.100, hex:P.skinDk},
      {y:S.headB.y+0.13, cz:0.005, rx:0.108, rz:0.104, hex:P.skin},
      {y:S.headB.y+0.24, cz:0, rx:0.084, rz:0.080, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headB.y+0.30,0), P.skinDk);
    /* goggle mask band across the brow, pushed up, covers socket line — no eye quads */
    quad(V(-0.11,S.headB.y+0.20,0.09), V(0.11,S.headB.y+0.20,0.09), V(0.095,S.headB.y+0.13,0.10), V(-0.095,S.headB.y+0.13,0.10), P.goggle, 0.04);
    for(const s of [-1,1]){
      const lensC = V(s*0.05, S.headB.y+0.165, 0.10);
      const lr1 = ring(lensC, V(0,0,1), 0.032, 0.032, 6, Math.PI/6);
      const lr2 = ring(V(lensC.x,lensC.y,lensC.z+0.006), V(0,0,1), 0.028, 0.028, 6, Math.PI/6);
      stitch([lr1,lr2], ()=>P.goggleDk);
      capFan(lr2, V(lensC.x,lensC.y,lensC.z+0.01), P.glow);
    }
    /* gaunt hollow cheeks + grim mouth line */
    quad(V(-0.045,S.headB.y+0.03,0.095), V(0.045,S.headB.y+0.03,0.095), V(0.035,S.headB.y+0.01,0.098), V(-0.035,S.headB.y+0.01,0.098), P.goggleDk, 0.03);
  }

  /* LEGS — gaunt, robed */
  {
    const leg=(hipX)=>{
      const hip=V(hipX,0.58,0.02), knee=V(hipX*1.05,0.32,0.06), foot=V(hipX*0.95,0.04,0.12);
      tube(hip,knee,0.075,0.060,7,P.robeDk);
      tube(knee,foot,0.060,0.046,7,P.skinDk,{capB:{hex:P.skinDk, lift:0.008}});
    };
    leg(-0.09); leg(0.09);
  }

  /* ARMS — one raising a rusted detonator-plunger box like a holy relic, one holding a
     curved priest-blade */
  {
    const rsh=V(0.18,1.32,0), rel=V(0.28,1.42,0.10), rhd=V(0.24,1.58,0.16);
    tube(rsh,rel,0.075,0.060,6,P.robe);
    tube(rel,rhd,0.060,0.046,6,P.skinDk,{capB:{hex:P.skinDk, lift:0.01}});
    /* detonator-plunger relic box raised aloft */
    const boxC = V(0.24,1.66,0.18);
    quad(V(boxC.x-0.07,boxC.y+0.05,boxC.z-0.05), V(boxC.x+0.07,boxC.y+0.05,boxC.z-0.05), V(boxC.x+0.06,boxC.y-0.05,boxC.z+0.05), V(boxC.x-0.06,boxC.y-0.05,boxC.z+0.05), P.ordDk, 0.04);
    /* plunger handle poking up */
    tube(V(boxC.x,boxC.y+0.05,boxC.z), V(boxC.x,boxC.y+0.14,boxC.z), 0.018, 0.012, 5, P.rust, {capB:{hex:P.glow, lift:0.006}});

    const lsh=V(-0.18,1.32,0), lel=V(-0.26,1.02,0.10), lhd=V(-0.22,0.72,0.14);
    tube(lsh,lel,0.075,0.060,6,P.robe);
    tube(lel,lhd,0.060,0.046,6,P.skinDk,{capB:{hex:P.skinDk, lift:0.01}});
    /* curved priest-blade */
    const bB=V(-0.22,0.72,0.14), bM=V(-0.16,0.44,0.26), bT=V(-0.06,0.20,0.34);
    tube(bB,bM,0.028,0.020,5,P.bladeDk,{capA:{hex:P.hilt, lift:0.01}});
    tube(bM,bT,0.020,0.006,5,P.blade,{capB:{hex:P.blade, lift:0.006}});
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
