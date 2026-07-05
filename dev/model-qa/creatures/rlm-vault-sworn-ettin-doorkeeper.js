/* dev/model-qa/creatures/rlm-vault-sworn-ettin-doorkeeper.js — VAULT-SWORN ETTIN
   DOORKEEPER (lost-world, Large Giant, CR 4). Read: a two-headed brute chained to guard a
   single vault door — a hulking broad-shouldered TWO-HEADED humanoid torso on stout thick
   legs, a heavy iron shackle-chain looped from an ankle to an anchor stub (it never leaves
   its post), one head snarling/alert, the other slack/half-dozing (classic ettin asymmetry),
   each carrying a crude weapon (club + axe). VS-desaturated grimy hide/leather + rust-iron
   chain. No eye quads — deep-set brow shadow only. Whole-object grammar: one function, one
   frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildVaultSwornEttinDoorkeeper(){
  const P = {
    skin:0x7a6a52, skinDk:0x564a38, skinLt:0x93826a,
    brow:0x3a3226,
    hide:0x4c4534, hideDk:0x342f22,
    iron:0x5c584c, ironDk:0x3a372e, rust:0x7a5432,
    wood:0x4a3626, woodDk:0x2e2117,
    tooth:0xd8cca0, mouth:0x241f18,
    disc:0x4a4038, discTop:0x585047,
  };

  /* LOWER BODY — stout thick legs, broad hips, planted wide stance (it never leaves its post) */
  const S = {
    hip:    V(0, 0.66, 0),
    waist:  V(0, 0.98, 0.0),
    chest:  V(0, 1.34, -0.02),
    neckL:  V(-0.14, 1.56, -0.02),
    neckR:  V(0.14, 1.56, -0.02),
  };
  tube(S.hip,   S.waist, 0.320, 0.280, 9, P.skin,   {phase:Math.PI/9, capA:{hex:P.skinDk, lift:0.02}});
  tube(S.waist, S.chest, 0.280, 0.360, 9, P.skinDk, {phase:Math.PI/9});
  /* hide loincloth wrap at the waist */
  quad(V(-0.28,0.90,0.16), V(0.28,0.90,0.16), V(0.22,0.60,0.22), V(-0.22,0.60,0.22), P.hide, 0.05);

  /* LEGS — thick planted stumps */
  {
    const bigLeg=(hipX)=>{
      const hip=V(hipX,0.64,0), knee=V(hipX*1.05,0.34,0.03), foot=V(hipX*0.95,0.05,0.10);
      tube(hip,knee,0.190,0.150,8,P.skin);
      tube(knee,foot,0.150,0.130,8,P.skinDk,{capB:{hex:P.skinDk, lift:0.01}});
    };
    bigLeg(-0.18); bigLeg(0.18);
  }

  /* TWO HEADS — set on separate short necks off the broad shoulders; asymmetric expression */
  {
    const buildHead=(neckBase, cxOff, alert)=>{
      const n=8, ph=Math.PI/n;
      const necT=V(neckBase.x, neckBase.y+0.06, neckBase.z);
      tube(neckBase, necT, 0.115, 0.130, n, P.skinDk, {phase:ph});
      const bands=[
        {y:necT.y, cz:0, rx:0.140, rz:0.140, hex:P.skin},
        {y:necT.y+0.16, cz:0.01, rx:0.160, rz:0.155, hex:P.skinLt},
        {y:necT.y+0.28, cz:0, rx:0.128, rz:0.120, hex:P.skinDk},
      ];
      const rings=bands.map(b=>ring(V(cxOff,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
      stitch(rings, b=>bands[b].hex);
      capFan(rings.at(-1), V(cxOff,necT.y+0.34,0.0), P.skinDk);
      /* brow shadow — deep-set, no eye quads */
      const browY = necT.y+0.15;
      quad(V(cxOff-0.09,browY,0.135), V(cxOff+0.09,browY,0.135), V(cxOff+0.07,browY-0.03,0.14), V(cxOff-0.07,browY-0.03,0.14), P.brow, 0.03);
      if(alert){
        /* snarling mouth — open, teeth bared */
        quad(V(cxOff-0.06,necT.y+0.02,0.14), V(cxOff+0.06,necT.y+0.02,0.14), V(cxOff+0.045,necT.y-0.06,0.145), V(cxOff-0.045,necT.y-0.06,0.145), P.mouth, 0.03);
        for(let i=-1;i<=1;i++) quad(V(cxOff+i*0.03-0.01,necT.y-0.005,0.145), V(cxOff+i*0.03+0.01,necT.y-0.005,0.145),
                                     V(cxOff+i*0.03+0.008,necT.y-0.03,0.145), V(cxOff+i*0.03-0.008,necT.y-0.03,0.145), P.tooth, 0.03);
      } else {
        /* slack half-dozing jaw, mouth closed and drooping */
        quad(V(cxOff-0.05,necT.y-0.02,0.135), V(cxOff+0.05,necT.y-0.02,0.135), V(cxOff+0.04,necT.y-0.04,0.138), V(cxOff-0.04,necT.y-0.04,0.138), P.brow, 0.03);
      }
    };
    buildHead(S.neckL, -0.14, false); // slack/dozing head
    buildHead(S.neckR,  0.14, true);  // alert/snarling head
  }

  /* ARMS — broad, one gripping a crude club, one a crude axe */
  {
    const lsh=V(-0.32,1.30,0), lel=V(-0.42,0.98,0.10), lhd=V(-0.36,0.66,0.16);
    tube(lsh,lel,0.140,0.110,7,P.skin);
    tube(lel,lhd,0.110,0.088,7,P.skinDk,{capB:{hex:P.skinDk, lift:0.015}});
    /* crude wooden club */
    const clB=V(-0.36,0.66,0.16), clT=V(-0.30,0.20,0.22);
    tube(clB,clT,0.055,0.095,6,P.wood,{capB:{hex:P.woodDk, lift:0.02}});

    const rsh=V(0.32,1.30,0), rel=V(0.42,0.98,0.10), rhd=V(0.38,0.64,0.18);
    tube(rsh,rel,0.140,0.110,7,P.skin);
    tube(rel,rhd,0.110,0.088,7,P.skinDk,{capB:{hex:P.skinDk, lift:0.015}});
    /* crude notched axe head */
    const axB=V(0.38,0.64,0.18), axT=V(0.34,0.24,0.24);
    tube(axB,axT,0.040,0.020,5,P.wood);
    quad(V(0.20,0.30,0.24), V(0.34,0.36,0.24), V(0.40,0.20,0.28), V(0.26,0.16,0.28), P.iron, 0.05);
  }

  /* VAULT-SWORN CHAIN — heavy shackle from one ankle to a stone anchor stub at the edge of the disc */
  {
    const ankle=V(-0.20,0.08,0.14);
    const anchor=V(-0.44,0.06,0.30);
    /* anchor stub */
    tube(V(anchor.x,0.0,anchor.z), V(anchor.x,0.10,anchor.z), 0.06, 0.05, 6, P.ironDk, {capB:{hex:P.ironDk, lift:0.01}});
    /* ankle shackle band */
    quad(V(ankle.x-0.05,0.05,ankle.z-0.03), V(ankle.x+0.05,0.05,ankle.z-0.03), V(ankle.x+0.045,0.14,ankle.z+0.03), V(ankle.x-0.045,0.14,ankle.z+0.03), P.iron, 0.04);
    /* drooping chain links between ankle and anchor */
    const links=6;
    for(let i=0;i<links;i++){
      const t=i/(links-1);
      const x=ankle.x+(anchor.x-ankle.x)*t, z=ankle.z+(anchor.z-ankle.z)*t;
      const y=0.06 + Math.sin(t*Math.PI)*0.05;
      quad(V(x-0.018,y+0.01,z), V(x+0.018,y+0.01,z), V(x+0.012,y-0.018,z+0.008), V(x-0.012,y-0.018,z+0.008), (i%2? P.iron : P.rust), 0.06);
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
