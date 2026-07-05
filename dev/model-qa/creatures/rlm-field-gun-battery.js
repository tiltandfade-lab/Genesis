/* dev/model-qa/creatures/rlm-field-gun-battery.js — Field Gun Battery (theater, trench/musket
   lens, Large, CR 4). A cannon crew fighting on grimly at their fallen posts: the wheeled field
   gun barrel + carriage as the dominant mass, one crewman still braced at the breech, another
   slumped dead across the wheel — the "fighting on grimly" tell. Whole-object grammar: one merged
   frame combining the gun-carriage hardware with two crew figures, no anchors. VS-desaturated
   gun-metal + weathered wood + drab uniform palette. NO eye quads on the crew. Large disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildFieldGunBattery(){
  const P = {
    iron:0x3e4042, ironDk:0x262828, ironLt:0x5c5e60,
    wood:0x5a4632, woodDk:0x3a2c1e,
    wheel:0x4a3c2a, wheelDk:0x2e2418,
    tunic:0x54563e, tunicDk:0x363826,
    skin:0x8f7a63, skinDk:0x655241,
    slump:0x6a5a44,
    disc:0x453d2e, discTop:0x554c37,
  };

  /* ---------- FIELD GUN — barrel + breech + carriage + two large wheels, dominant Large mass. ---------- */
  const barrelB=V(0,0.44,-0.34), barrelM=V(0,0.46,0.10), barrelT=V(0,0.47,0.62);
  tube(barrelB,barrelM,0.115,0.100,10,P.iron,{phase:Math.PI/10, capA:{hex:P.ironDk,lift:0.02}});
  tube(barrelM,barrelT,0.100,0.072,10,P.ironDk,{phase:Math.PI/10, capB:{hex:P.ironLt,lift:0.01}});
  // breech block, wide iron collar
  ring(V(0,0.44,-0.30), V(0,1,0), 0.14, 0.14, 10).forEach((p,i,arr)=>{
    const p2=arr[(i+1)%arr.length];
    quad(p,p2,V(p2.x,p2.y+0.10,p2.z),V(p.x,p.y+0.10,p.z), P.ironDk, 0.05);
  });
  // wooden carriage bed under the barrel
  quad(V(-0.16,0.30,-0.36), V(0.16,0.30,-0.36), V(0.14,0.28,0.30), V(-0.14,0.28,0.30), P.wood, 0.06);
  quad(V(-0.16,0.30,-0.36), V(-0.14,0.28,0.30), V(-0.14,0.18,0.30), V(-0.16,0.18,-0.36), P.woodDk, 0.06);
  quad(V(0.16,0.30,-0.36), V(0.14,0.28,0.30), V(0.14,0.18,0.30), V(0.16,0.18,-0.36), P.woodDk, 0.06);
  // trail (spike) dragging back
  tube(V(0,0.20,-0.36), V(0.04,0.05,-0.66), 0.045,0.020,6,P.wood,{capB:{hex:P.woodDk,lift:0.01}});

  /* ---------- WHEELS — two large spoked wheels flanking the carriage. ---------- */
  {
    const wheel=(cx)=>{
      const rim=ring(V(cx,0.24,-0.06), V(1,0,0), 0.24, 0.24, 12);
      const rim2=ring(V(cx+(cx>0?0.05:-0.05),0.24,-0.06), V(1,0,0), 0.24, 0.24, 12);
      stitch([rim,rim2], ()=>P.wheelDk);
      capFan(rim, V(cx,0.24,-0.06), P.wheel, cx>0);
      // spokes
      for(let i=0;i<6;i++){
        const t=(i/6)*Math.PI*2;
        const ex=cx, ey=0.24+Math.sin(t)*0.20, ez=-0.06+Math.cos(t)*0.20;
        tube(V(cx,0.24,-0.06), V(ex,ey,ez), 0.020,0.014,4,P.wheelDk);
      }
    };
    wheel(-0.30); wheel(0.30);
  }

  /* ---------- CREW A — braced at the breech, hunched over the gun, gripping the lanyard. ---------- */
  {
    const hip=V(-0.02,0.30,-0.46), waist=V(-0.02,0.40,-0.42), chest=V(-0.01,0.50,-0.38),
          shldr=V(-0.02,0.56,-0.36), headB=V(-0.02,0.60,-0.34), headT=V(-0.03,0.72,-0.35);
    const n=8, ph=Math.PI/n;
    const bands=[{y:hip.y,cz:hip.z,rx:0.10,hex:P.tunicDk},{y:waist.y,cz:waist.z,rx:0.098,hex:P.tunic},
                 {y:chest.y,cz:chest.z,rx:0.108,hex:P.tunic},{y:shldr.y,cz:shldr.z,rx:0.115,hex:P.tunicDk}];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz),V(0,1,0),b.rx,b.rx*0.85,n,ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,hip.y-0.04,hip.z), P.tunicDk, true);
    // head, socket shading, no eyes
    const hb=ring(V(0,headB.y,headB.z),V(0,1,0),0.058,0.055,n,ph);
    const ht=ring(V(0,headT.y-0.02,headB.z),V(0,1,0),0.048,0.045,n,ph);
    stitch([hb,ht], ()=>P.skin);
    capFan(ht, V(0,headT.y,headB.z), P.skinDk);
    quad(V(-0.04,headB.y+0.03,headB.z+0.045), V(-0.01,headB.y+0.03,headB.z+0.05),
         V(-0.015,headB.y+0.055,headB.z+0.045), V(-0.038,headB.y+0.055,headB.z+0.04), P.skinDk, 0.05);
    // arms braced on the breech, gripping the lanyard cord
    const shR=V(-0.10,0.55,-0.36), hR=V(-0.05,0.44,-0.20);
    tube(shR,hR,0.032,0.024,5,P.tunic,{capB:{hex:P.skin,lift:0.015}});
    tube(hR, V(0.02,0.44,-0.14), 0.010,0.006,4,P.woodDk);
  }

  /* ---------- CREW B — slumped dead across the wheel, the grim toll of the battery. ---------- */
  {
    const p0=V(0.24,0.42,-0.10), p1=V(0.34,0.30,-0.18), p2=V(0.40,0.20,-0.28);
    tube(p0,p1,0.088,0.078,7,P.tunicDk,{capA:{hex:P.tunicDk,lift:0.02}});
    tube(p1,p2,0.078,0.050,7,P.slump,{capB:{hex:P.skinDk,lift:0.02}});
    // slumped head hanging off the wheel rim
    ring(V(0.42,0.16,-0.32), V(0,1,0), 0.05, 0.05, 7).forEach((p,i,arr)=>{
      const p2b=arr[(i+1)%arr.length];
      quad(p,p2b,V(p2b.x,p2b.y+0.04,p2b.z),V(p.x,p.y+0.04,p.z), P.skinDk, 0.05);
    });
    // trailing limp arm
    tube(V(0.30,0.36,-0.14), V(0.22,0.14,-0.06), 0.026,0.018,5,P.tunicDk,{capB:{hex:P.skin,lift:0.01}});
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
