/* dev/model-qa/creatures/rlm-trench-butcher-golem.js — Trench Butcher Golem
   (theater/trench era-lens, Large, CR 9). A grim close-quarters clearing machine built for the wire
   — a hulking humanoid construct, hunched forward, riveted plate body, one arm ending in a heavy
   entrenching-blade/cleaver mass, the other a barbed-wire-wrapped bludgeon fist, a gas-mask-like
   featureless snout-grille for a face. Whole-object grammar: one merged frame, no anchors.
   VS-desaturated palette: rust-drab iron plate, dull khaki-grey canvas wrap, dark oiled leather,
   dull blade steel. NO eye quads — a grille slit instead. Large size: base disc r=0.55.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTrenchButcherGolem(){
  const P = {
    plate:0x4c463c, plateDk:0x322e26, plateLt:0x605a4c,
    canvas:0x5a5642, canvasDk:0x3c3a2c,
    leather:0x3a2c1e, leatherDk:0x241a10,
    steel:0x565650, steelDk:0x363630, steelLt:0x6e6e66,
    wire:0x2a2622,
    grille:0x1c1a16,
    disc:0x3a3630, discTop:0x453f36,
  };

  /* ---------- LANDMARKS — hunched forward stance, ~1.5u tall at the head, low bent knees. ---------- */
  const L = {
    hipY:0.46, waistY:0.62, chestY:0.86, shldY:1.04,
    neckY:1.06, headY:1.16, headTopY:1.32,
  };

  /* ===== HIPS / LEGS — bent, hunched stance, thick riveted plate legs. ===== */
  {
    const leg=(sign)=>{
      const hip=V(sign*0.13,L.hipY-0.06,0.0);
      const knee=V(sign*0.16,0.30,0.14);
      const ank=V(sign*0.15,0.10,-0.02);
      tube(hip,knee,0.135,0.115,6,P.plate,{phase:Math.PI/6,capA:{hex:P.plateDk}});
      tube(knee,ank,0.115,0.105,6,P.plateDk,{phase:Math.PI/6});
      // heavy boot
      quad(V(ank.x-0.10,0.05,ank.z-0.08),V(ank.x+0.10,0.05,ank.z-0.08),
           V(ank.x+0.09,0.02,ank.z+0.16),V(ank.x-0.09,0.02,ank.z+0.16), P.leatherDk, 0.03);
    };
    leg(-1); leg(1);
  }

  /* ===== TORSO — hunched forward (chest tilts +z as it rises), riveted plate, canvas wrap patches. */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:L.hipY,   cz:0.0,  rx:0.235,rz:0.20, hex:P.plateDk},
      {y:L.waistY, cz:0.04, rx:0.255,rz:0.22, hex:P.plate},
      {y:L.chestY, cz:0.10, rx:0.275,rz:0.235, hex:P.plateLt},
      {y:L.shldY,  cz:0.14, rx:0.245,rz:0.20, hex:P.plate},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.shldY+0.06,0.16), P.plateLt);
    // canvas wrap patch across the chest (khaki cloth over the plate)
    quad(V(-0.20,L.chestY+0.02,0.32),V(0.20,L.chestY+0.02,0.32),
         V(0.18,L.waistY,0.34),V(-0.18,L.waistY,0.34), P.canvas, 0.05);
    // rivet dots down the flank
    for(const y of [L.hipY+0.04,L.waistY,L.chestY-0.02]) quad(V(0.24,y,0.05),V(0.25,y,0.05),V(0.25,y+0.015,0.05),V(0.24,y+0.015,0.05), P.steelLt, 0.05);
  }

  /* ===== HEAD — small, hunched forward, a featureless riveted GRILLE mask, no face. ===== */
  {
    const n=8, ph=Math.PI/8, cz=0.20;
    const bands=[
      {y:L.headY-0.08, rx:0.115, rz:0.100, hex:P.plate},
      {y:L.headY+0.04, rx:0.125, rz:0.105, hex:P.plateDk},
      {y:L.headTopY-0.04, rx:0.100, rz:0.085, hex:P.plate},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.headTopY,cz-0.01), P.plateDk);
    // the grille slit (a dark recessed band, no eyes) + a few vertical grille bars
    quad(V(-0.09,L.headY-0.02,cz+0.095), V(0.09,L.headY-0.02,cz+0.095),
         V(0.08,L.headY+0.05,cz+0.09), V(-0.08,L.headY+0.05,cz+0.09), P.grille, 0.03);
    for(const x of [-0.06,-0.02,0.02,0.06]) quad(V(x-0.006,L.headY-0.02,cz+0.10),V(x+0.006,L.headY-0.02,cz+0.10),
      V(x+0.005,L.headY+0.05,cz+0.095),V(x-0.005,L.headY+0.05,cz+0.095), P.steelDk, 0.03);
  }

  /* ===== BLADE ARM — one arm ending in a heavy entrenching-blade/cleaver mass, held low+forward. */
  {
    const sh=V(-0.28,L.shldY-0.10,0.16), el=V(-0.42,L.waistY+0.02,0.34), wr=V(-0.40,L.hipY-0.06,0.52);
    tube(sh,el,0.11,0.09,6,P.plate,{phase:Math.PI/6,capA:{hex:P.plateDk}});
    tube(el,wr,0.09,0.075,6,P.plateDk,{phase:Math.PI/6});
    // wrapped leather grip
    { const r=ring(wr,V(0,1,0),0.08,0.08,6,Math.PI/6); const r2=ring(V(wr.x,wr.y-0.10,wr.z),V(0,1,0),0.07,0.07,6,Math.PI/6);
      stitch([r,r2],()=>P.leather); }
    // the cleaver blade — a broad flat wedge blade jutting forward-down from the fist
    const bladeBase=V(wr.x,wr.y-0.10,wr.z);
    const bTip=V(wr.x-0.06,wr.y-0.44,wr.z+0.30);
    quad(V(bladeBase.x-0.14,bladeBase.y+0.02,bladeBase.z-0.02), V(bladeBase.x+0.14,bladeBase.y+0.02,bladeBase.z-0.02),
         V(bTip.x+0.02,bTip.y,bTip.z), V(bTip.x-0.10,bTip.y,bTip.z), P.steel, 0.05);
    quad(V(bladeBase.x-0.14,bladeBase.y-0.03,bladeBase.z-0.02), V(bladeBase.x+0.14,bladeBase.y-0.03,bladeBase.z-0.02),
         V(bTip.x+0.02,bTip.y-0.02,bTip.z), V(bTip.x-0.10,bTip.y-0.02,bTip.z), P.steelDk, 0.05);
    // dull nicked edge highlight
    quad(V(bladeBase.x+0.10,bladeBase.y+0.0,bladeBase.z-0.01),V(bladeBase.x+0.13,bladeBase.y+0.0,bladeBase.z-0.01),
         V(bTip.x+0.01,bTip.y-0.01,bTip.z),V(bTip.x-0.02,bTip.y-0.01,bTip.z), P.steelLt, 0.06);
  }

  /* ===== BARBED-WIRE BLUDGEON ARM — the other arm ends in a heavy wire-wrapped fist mass. ===== */
  {
    const sh=V(0.28,L.shldY-0.08,0.14), el=V(0.40,L.waistY+0.04,0.30), wr=V(0.38,L.hipY-0.02,0.40);
    tube(sh,el,0.11,0.09,6,P.plate,{phase:Math.PI/6,capA:{hex:P.plateDk}});
    tube(el,wr,0.09,0.10,6,P.plateDk,{phase:Math.PI/6});
    // heavy fist mass
    const bands=[{y:wr.y-0.06,rx:0.115,rz:0.115,hex:P.plateDk},{y:wr.y+0.05,rx:0.13,rz:0.13,hex:P.plate}];
    const rings=bands.map(b=>ring(V(wr.x,b.y,wr.z),V(0,1,0),b.rx,b.rz,6,Math.PI/6));
    stitch(rings,b=>bands[b].hex);
    capFan(rings.at(-1),V(wr.x,wr.y+0.09,wr.z),P.plateLt);
    capFan(rings[0],V(wr.x,wr.y-0.10,wr.z),P.plateDk,true);
    // wrapped barbed wire coils around the fist
    for(let i=0;i<3;i++){
      const yy=wr.y-0.03+i*0.05;
      const r1=ring(V(wr.x,yy,wr.z),V(0,1,0),0.135,0.135,6,Math.PI/6*i);
      const r2=ring(V(wr.x,yy+0.015,wr.z),V(0,1,0),0.135,0.135,6,Math.PI/6*i);
      stitch([r1,r2],()=>P.wire);
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
