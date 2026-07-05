/* dev/model-qa/creatures/rlm-warband-chieftain.js — WARBAND CHIEFTAIN (ash, Medium
   humanoid, CR 5). Read: a three-gang warband chieftain — a scarred wasteland raider
   bulked in scavenged spike-studded leather + scrap-plate pauldrons, trophy-skull totems
   strung across the chest (marks of three rival gangs beaten into one banner), a
   jagged rebar-and-chain hybrid weapon in one fist, the other raised holding a torn
   tri-color gang-rag banner on a rebar pole. VS-desaturated: sun-scorched hide, dull
   leather, rust trophies. NO eye quads — deep scar-brow shadow only. Whole-object
   grammar: one function, one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildWarbandChieftain(){
  const P = {
    skin:0x8a6a4a, skinDk:0x604832, skinLt:0xa08058,
    scar:0x3a2c1e,
    leather:0x4a3826, leatherDk:0x2e2216, leatherLt:0x5c4632,
    scrap:0x585448, scrapDk:0x363228,
    spike:0x28241e,
    rag1:0x7a3230, rag2:0x3a5a48, rag3:0x5a4a7a,  // three gang colors, torn banner + trophy cords
    bone:0xc4b896, boneDk:0x8a8064,
    iron:0x5c584c, rust:0x7a4a30,
    disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.58, 0),
    waist: V(0, 0.82, -0.01),
    chest: V(0, 1.12, -0.02),
    neck:  V(0, 1.28, -0.02),
    headB: V(0, 1.34, -0.02),
  };
  tube(S.hip,   S.waist, 0.150, 0.135, 8, P.skin,    {phase:Math.PI/8, capA:{hex:P.skinDk, lift:0.02}});
  tube(S.waist, S.chest, 0.135, 0.175, 8, P.skinDk,  {phase:Math.PI/8});
  tube(S.chest, S.neck,  0.175, 0.085, 8, P.skin,    {phase:Math.PI/8});

  /* spike-studded leather harness across the chest */
  quad(V(-0.17,1.20,0.10), V(0.17,1.20,0.10), V(0.14,0.84,0.16), V(-0.14,0.84,0.16), P.leather, 0.05);
  for(const [x,y] of [[-0.12,1.10],[0.10,1.02],[-0.08,0.92],[0.06,0.86]])
    quad(V(x-0.012,y,0.155), V(x+0.012,y,0.155), V(x,y+0.028,0.165), V(x,y+0.028,0.165), P.spike, 0.02);

  /* trophy-skull totems strung across the chest — three gangs beaten into one */
  for(const [x,y,hex] of [[-0.09,0.98,P.rag1],[0.0,0.90,P.rag2],[0.09,0.98,P.rag3]]){
    /* cord */
    quad(V(x-0.006,1.18,0.16), V(x+0.006,1.18,0.16), V(x+0.004,y+0.05,0.17), V(x-0.004,y+0.05,0.17), hex, 0.04);
    /* tiny trophy skull */
    const n=6, ph=Math.PI/n;
    const b1=ring(V(x,y,0.18), V(0,1,0), 0.032, 0.032, n, ph);
    const b2=ring(V(x,y+0.045,0.18), V(0,1,0), 0.030, 0.030, n, ph);
    stitch([b1,b2], ()=>P.bone);
    capFan(b2, V(x,y+0.06,0.18), P.boneDk);
  }

  /* HEAD — scarred, brow-shadowed, weathered */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,      cz:0, rx:0.105, rz:0.108, hex:P.skinDk},
      {y:S.headB.y+0.13, cz:0.005, rx:0.115, rz:0.112, hex:P.skin},
      {y:S.headB.y+0.24, cz:0, rx:0.088, rz:0.084, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headB.y+0.30,0), P.skinDk);
    /* deep scar-brow shadow, no eye quads */
    quad(V(-0.10,S.headB.y+0.15,0.10), V(0.10,S.headB.y+0.15,0.10), V(0.08,S.headB.y+0.11,0.105), V(-0.08,S.headB.y+0.11,0.105), P.scar, 0.03);
    /* diagonal scar slash across one eye */
    quad(V(-0.06,S.headB.y+0.20,0.10), V(-0.02,S.headB.y+0.20,0.10), V(0.02,S.headB.y+0.06,0.105), V(-0.02,S.headB.y+0.06,0.105), P.scar, 0.02);
    /* grim mouth line */
    quad(V(-0.045,S.headB.y+0.03,0.105), V(0.045,S.headB.y+0.03,0.105), V(0.035,S.headB.y+0.01,0.108), V(-0.035,S.headB.y+0.01,0.108), P.scar, 0.02);
  }

  /* LEGS — sun-scorched, wrapped shins */
  {
    const leg=(hipX)=>{
      const hip=V(hipX,0.56,0), knee=V(hipX*1.05,0.30,0.04), foot=V(hipX*0.95,0.04,0.10);
      tube(hip,knee,0.088,0.066,7,P.skin);
      tube(knee,foot,0.066,0.050,7,P.leatherDk,{capB:{hex:P.leatherDk, lift:0.01}});
    };
    leg(-0.10); leg(0.10);
  }

  /* ARMS — one gripping a jagged rebar-chain weapon, one raising a torn tri-gang banner */
  {
    const lsh=V(-0.22,1.16,0), lel=V(-0.30,0.90,0.08), lhd=V(-0.26,0.62,0.12);
    tube(lsh,lel,0.088,0.068,6,P.skin);
    tube(lel,lhd,0.068,0.052,6,P.skinDk,{capB:{hex:P.skinDk, lift:0.01}});
    /* rebar-chain weapon: rebar haft + trailing chain length */
    const hB=V(-0.26,0.62,0.12), hT=V(-0.20,0.16,0.18);
    tube(hB,hT,0.028,0.022,5,P.iron);
    for(let i=0;i<4;i++){ const t=i/3, x=-0.20+t*0.10, z=0.18+t*0.14, y=0.16-t*0.10;
      quad(V(x-0.016,y+0.01,z), V(x+0.016,y+0.01,z), V(x+0.011,y-0.016,z+0.01), V(x-0.011,y-0.016,z+0.01), (i%2?P.iron:P.rust), 0.05); }

    const rsh=V(0.22,1.16,0), rel=V(0.30,0.92,0.06), rhd=V(0.26,1.10,0.02);
    tube(rsh,rel,0.088,0.068,6,P.skin);
    tube(rel,rhd,0.068,0.055,6,P.skinDk);
    /* rebar banner pole raised up, tri-color torn rag banner */
    const poleB=V(0.26,1.10,0.0), poleT=V(0.30,1.72,-0.02);
    tube(poleB,poleT,0.020,0.014,5,P.iron,{capB:{hex:P.rust, lift:0.006}});
    quad(V(0.31,1.68,-0.02), V(0.52,1.60,-0.02), V(0.50,1.44,-0.02), V(0.31,1.46,-0.02), P.rag1, 0.05);
    quad(V(0.31,1.46,-0.02), V(0.50,1.44,-0.02), V(0.47,1.32,-0.02), V(0.31,1.30,-0.02), P.rag2, 0.05);
    quad(V(0.31,1.30,-0.02), V(0.47,1.32,-0.02), V(0.43,1.20,-0.02), V(0.31,1.18,-0.02), P.rag3, 0.05);
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
