/* dev/model-qa/creatures/rlm-hollow-coffer-gelatinous-vault.js — the HOLLOW-COFFER GELATINOUS
   VAULT (lost-world, Large ooze, CR 2). A CUBE-shaped ooze that has swallowed a tomb corridor's
   grave goods and carries them suspended in its translucent-suggesting mass: read it as a squared
   block first (the "cube" silhouette law), then the horror detail — coins, a jeweled torc, a
   broken urn shard — half-sunk and visible inside. Whole-object grammar: one function, one frame,
   no anchors, NO eyes/face. Palette: dusty amber-grey gelatin body, darker interior core, pale
   grave-gold suspended goods. Lost-world register: tomb-dust rather than dungeon-slime green.
   Large size: ~0.9u cube, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildHollowCofferGelatinousVault(){
  /* ---------- PALETTE (dusty amber-grey gelatin; VS desaturated, tomb-dust not slime-green) ---------- */
  const P = {
    gel:0x6b6552, gelDk:0x484431, gelLt:0x8b8468,        /* the cube mass, mid/dark/light faces */
    core:0x353024,                                        /* the darker suspended interior read */
    edge:0x9a9270,                                         /* pale glisten along the cube's edges */
    gold:0xb89a52, goldDk:0x8a7038,                        /* suspended grave-goods: coins/torc */
    urn:0xa8977a, urnDk:0x7a6b52,                          /* a broken urn shard, half-sunk */
    disc:0x453d2e, discTop:0x554c37,
  };

  /* ---------- THE CUBE — a squared gelatinous block, softened at the corners (rounded-cube read,
     not a rigid box: 2 stacked octagon-ish rings per face-band so it still reads "ooze"). ---------- */
  const half = 0.34;   // half-width of the cube body
  const yBot = 0.02, yTop = yBot + half*2;
  {
    // an 8-point ring where every OTHER vertex is pulled onto a flat face-midpoint — a
    // rounded-square profile in plan (4 flat sides + 4 soft corners), reads CUBE not cylinder.
    const n=8;
    // build the rounded-square ring directly from 8 explicit points (4 face-mids + 4 corners)
    const rsq = (y, r) => {
      const c=r*0.72, f=r*1.0;
      return [
        V( f, y,  0), V( c, y,  c), V( 0, y,  f), V(-c, y,  c),
        V(-f, y,  0), V(-c, y, -c), V( 0, y, -f), V( c, y, -c),
      ];
    };
    const bands = [
      {y:yBot,          r:half*0.92, hex:P.gelDk},
      {y:yBot+half*0.5, r:half*1.02, hex:P.gel},
      {y:yBot+half*1.5, r:half*1.02, hex:P.gel},
      {y:yTop,          r:half*0.90, hex:P.gelLt},
    ];
    const rings = bands.map(b => rsq(b.y, b.r));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, yTop+0.03, 0), P.edge);
    capFan(rings[0], V(0, yBot-0.015, 0), P.gelDk, true);
    // bright glisten strip along the top edge
    for(let i=0;i<n;i++){
      const i2=(i+1)%n;
      quad(rings.at(-1)[i], rings.at(-1)[i2], rings.at(-1)[i2].clone().add(V(0,0.02,0)), rings.at(-1)[i].clone().add(V(0,0.02,0)), P.edge, 0.05);
    }
  }

  /* ---------- SUSPENDED GRAVE-GOODS — half-sunk inside the block faces: coins, a torc, an urn
     shard, visible through the translucent-suggesting gelatin (painted proud on the near face). ---------- */
  {
    const faceZ = half*0.98;
    // scattered coin disks
    const coin=(x,y,r)=>{
      const rg=ring(V(x,y,faceZ), V(0,0,1), r, r, 6, 0);
      capFan(rg, V(x,y,faceZ+0.01), P.gold);
    };
    coin(-0.10, yBot+0.20, 0.045);
    coin(0.06, yBot+0.32, 0.038);
    coin(0.14, yBot+0.14, 0.032);
    coin(-0.16, yBot+0.42, 0.03);
    /* a jeweled torc — a bent tube half-sunk, catching light */
    {
      const t0=V(-0.02, yBot+0.50, faceZ*0.9), t1=V(0.16, yBot+0.56, faceZ*0.85), t2=V(0.10, yBot+0.44, faceZ*0.88);
      tube(t0,t1,0.018,0.014,5,P.gold,{capA:{hex:P.goldDk}});
      tube(t1,t2,0.014,0.012,5,P.goldDk,{capB:{hex:P.gold}});
    }
    /* a broken urn shard jutting from the core, pale terracotta-bone */
    {
      const u0=V(0.06, yBot+0.06, faceZ*0.7), u1=V(0.18, yBot+0.30, faceZ*0.75);
      tube(u0,u1,0.05,0.03,6,P.urn,{capA:{hex:P.urnDk},capB:{hex:P.urnDk,lift:0.01}});
    }
  }

  /* ---------- CORE HINT — a darker inner column glimpsed through the top, selling depth/mass. ---------- */
  {
    const cr=ring(V(0,yTop-0.05,0), V(0,1,0), half*0.5, half*0.5, 6, 0);
    capFan(cr, V(0,yTop-0.02,0), P.core, true);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
