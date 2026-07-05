/* dev/model-qa/creatures/rlm-fume-choked-ettin.js — FUME-CHOKED ETTIN (ash, Large mutant
   Giant, CR 4). Read: a two-headed scrapyard giant mutated by chemical smog — a hulking
   broad-shouldered torso wrapped in scavenged rust-plate armor, TWO HEADS (one bloated with
   fume-blisters wheezing through a crude rebreather mask, one bare and snarling), thick legs
   planted wide in ash-grey grime, one fist gripping a rebar-and-scrap club, the other
   dragging a length of chain. VS-desaturated: ash-grey mutant hide, rust-plate armor scraps,
   sickly fume-yellow blister tint. NO eye quads — deep brow shadow + mask lens instead.
   Whole-object grammar: one function, one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildFumeChokedEttin(){
  const P = {
    skin:0x6a6456, skinDk:0x4a4638, skinLt:0x827c6a,
    blister:0x8a8446, blisterDk:0x585430,
    brow:0x322e24,
    scrap:0x594e3c, scrapDk:0x362f24, scrapLt:0x6f6248,
    rust:0x7a4a30,
    mask:0x3a3a34, maskDk:0x222220, lens:0x6a7a3a,
    wood:0x453321, woodDk:0x2a1f14, iron:0x5c584c,
    tooth:0xc8bc94, mouth:0x241f18,
    disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.70, 0),
    waist: V(0, 1.04, 0.0),
    chest: V(0, 1.42, -0.02),
    neckL: V(-0.16, 1.64, -0.02),
    neckR: V(0.16, 1.64, -0.02),
  };
  tube(S.hip,   S.waist, 0.340, 0.300, 9, P.skin,   {phase:Math.PI/9, capA:{hex:P.skinDk, lift:0.02}});
  tube(S.waist, S.chest, 0.300, 0.380, 9, P.skinDk, {phase:Math.PI/9});
  /* scavenged scrap-plate chest armor bolted over the torso */
  quad(V(-0.30,1.36,0.14), V(0.30,1.36,0.14), V(0.26,0.98,0.20), V(-0.26,0.98,0.20), P.scrap, 0.05);
  quad(V(-0.24,1.20,0.15), V(0.24,1.20,0.15), V(0.20,1.02,0.20), V(-0.20,1.02,0.20), P.scrapLt, 0.04);
  for(const [x,y] of [[-0.20,1.30],[0.20,1.30],[-0.16,1.06],[0.16,1.06]])
    quad(V(x-0.012,y,0.20), V(x+0.012,y,0.20), V(x+0.010,y-0.02,0.205), V(x-0.010,y-0.02,0.205), P.rust, 0.02);
  /* hide/scrap loincloth wrap */
  quad(V(-0.30,0.94,0.16), V(0.30,0.94,0.16), V(0.24,0.62,0.22), V(-0.24,0.62,0.22), P.scrapDk, 0.05);

  /* LEGS — thick, planted wide, ash-grimed */
  {
    const bigLeg=(hipX)=>{
      const hip=V(hipX,0.68,0), knee=V(hipX*1.08,0.36,0.04), foot=V(hipX*0.96,0.05,0.12);
      tube(hip,knee,0.200,0.158,8,P.skin);
      tube(knee,foot,0.158,0.136,8,P.skinDk,{capB:{hex:P.skinDk, lift:0.01}});
    };
    bigLeg(-0.19); bigLeg(0.19);
  }

  /* TWO HEADS — one masked/blistered (fume-choked), one bare/snarling */
  {
    const buildHeadBare=(neckBase, cxOff)=>{
      const n=8, ph=Math.PI/n;
      const necT=V(neckBase.x, neckBase.y+0.06, neckBase.z);
      tube(neckBase, necT, 0.120, 0.135, n, P.skinDk, {phase:ph});
      const bands=[
        {y:necT.y, cz:0, rx:0.145, rz:0.145, hex:P.skin},
        {y:necT.y+0.16, cz:0.01, rx:0.165, rz:0.160, hex:P.skinLt},
        {y:necT.y+0.28, cz:0, rx:0.130, rz:0.122, hex:P.skinDk},
      ];
      const rings=bands.map(b=>ring(V(cxOff,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
      stitch(rings, b=>bands[b].hex);
      capFan(rings.at(-1), V(cxOff,necT.y+0.34,0.0), P.skinDk);
      const browY = necT.y+0.15;
      quad(V(cxOff-0.09,browY,0.14), V(cxOff+0.09,browY,0.14), V(cxOff+0.07,browY-0.03,0.145), V(cxOff-0.07,browY-0.03,0.145), P.brow, 0.03);
      /* snarling open mouth, bared teeth */
      quad(V(cxOff-0.06,necT.y+0.02,0.145), V(cxOff+0.06,necT.y+0.02,0.145), V(cxOff+0.045,necT.y-0.06,0.15), V(cxOff-0.045,necT.y-0.06,0.15), P.mouth, 0.03);
      for(let i=-1;i<=1;i++) quad(V(cxOff+i*0.03-0.01,necT.y-0.005,0.15), V(cxOff+i*0.03+0.01,necT.y-0.005,0.15),
                                   V(cxOff+i*0.03+0.008,necT.y-0.03,0.15), V(cxOff+i*0.03-0.008,necT.y-0.03,0.15), P.tooth, 0.03);
    };
    const buildHeadMasked=(neckBase, cxOff)=>{
      const n=8, ph=Math.PI/n;
      const necT=V(neckBase.x, neckBase.y+0.06, neckBase.z);
      tube(neckBase, necT, 0.120, 0.140, n, P.blisterDk, {phase:ph});
      const bands=[
        {y:necT.y, cz:0, rx:0.150, rz:0.150, hex:P.blister},
        {y:necT.y+0.16, cz:0.01, rx:0.170, rz:0.165, hex:P.blister},
        {y:necT.y+0.28, cz:0, rx:0.132, rz:0.126, hex:P.blisterDk},
      ];
      const rings=bands.map(b=>ring(V(cxOff,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
      stitch(rings, b=>bands[b].hex);
      capFan(rings.at(-1), V(cxOff,necT.y+0.34,0.0), P.blisterDk);
      /* fume blisters dotting the skull */
      for(const [dx,dy] of [[-0.06,0.10],[0.05,0.14],[0.02,0.22]])
        quad(V(cxOff+dx-0.014,necT.y+dy,0.13), V(cxOff+dx+0.014,necT.y+dy,0.13), V(cxOff+dx+0.010,necT.y+dy-0.02,0.135), V(cxOff+dx-0.010,necT.y+dy-0.02,0.135), P.blisterDk, 0.03);
      /* crude rebreather mask over the lower face */
      quad(V(cxOff-0.10,necT.y+0.14,0.135), V(cxOff+0.10,necT.y+0.14,0.135), V(cxOff+0.085,necT.y-0.04,0.15), V(cxOff-0.085,necT.y-0.04,0.15), P.mask, 0.04);
      quad(V(cxOff-0.03,necT.y+0.07,0.15), V(cxOff+0.03,necT.y+0.07,0.15), V(cxOff+0.024,necT.y+0.02,0.155), V(cxOff-0.024,necT.y+0.02,0.155), P.lens, 0.03);
      /* mask hose down to the shoulder */
      tube(V(cxOff,necT.y-0.02,0.14), V(cxOff+0.05, necT.y-0.30, 0.10), 0.018, 0.022, 4, P.maskDk);
    };
    buildHeadMasked(S.neckL, -0.16);
    buildHeadBare(S.neckR,  0.16);
  }

  /* ARMS — one dragging a length of chain, one gripping a rebar-scrap club */
  {
    const lsh=V(-0.34,1.36,0), lel=V(-0.44,1.02,0.10), lhd=V(-0.38,0.68,0.16);
    tube(lsh,lel,0.148,0.115,7,P.skin);
    tube(lel,lhd,0.115,0.092,7,P.skinDk,{capB:{hex:P.skinDk, lift:0.015}});
    /* dragging chain */
    const links=5;
    for(let i=0;i<links;i++){
      const t=i/(links-1);
      const x=-0.38+t*0.10, z=0.16+t*0.28;
      const y=0.10 - t*0.06;
      quad(V(x-0.018,y+0.01,z), V(x+0.018,y+0.01,z), V(x+0.012,y-0.018,z+0.01), V(x-0.012,y-0.018,z+0.01), (i%2? P.iron : P.rust), 0.06);
    }

    const rsh=V(0.34,1.36,0), rel=V(0.44,1.02,0.10), rhd=V(0.38,0.66,0.18);
    tube(rsh,rel,0.148,0.115,7,P.skin);
    tube(rel,rhd,0.115,0.092,7,P.skinDk,{capB:{hex:P.skinDk, lift:0.015}});
    /* rebar-wrapped scrap club */
    const clB=V(0.38,0.66,0.18), clT=V(0.32,0.20,0.24);
    tube(clB,clT,0.058,0.10,6,P.wood,{capB:{hex:P.woodDk, lift:0.02}});
    for(const t of [0.3,0.6,0.9]){
      const y = clB.y + (clT.y-clB.y)*t;
      const z = clB.z + (clT.z-clB.z)*t;
      const x = clB.x + (clT.x-clB.x)*t;
      quad(V(x-0.03,y+0.05,z), V(x+0.03,y+0.05,z), V(x+0.026,y-0.05,z+0.01), V(x-0.026,y-0.05,z+0.01), P.iron, 0.05);
    }
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
