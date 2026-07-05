/* dev/model-qa/creatures/rlm-recycler-wraith.js — the RECYCLER WRAITH (chrome realm, Medium).
   A compactor's grinding maw wrapped in loose conveyor-belt plastic. Read: a hovering ragged
   shroud of torn black conveyor plastic sheeting draped over a compact industrial compactor-jaw
   core, the jaw itself a toothed hydraulic ram mouth that grinds. NO eye quads — the "face" is
   just the grinding jaw, no head/eyes at all (a wraith, faceless). VS-desaturated: matte black
   worn plastic sheeting, dull steel jaw plates, grimy hydraulic grease. Whole-object grammar: one
   function, one frame, no anchors. Medium size: base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildRecyclerWraith(){
  /* ---------- PALETTE ---------- */
  const P = {
    plastic:0x232426, plasticDk:0x151617, plasticLt:0x35373a,   // torn conveyor plastic shroud
    jaw:0x585a5c, jawDk:0x3a3c3d, jawLt:0x6f7274,                // compactor jaw plates
    tooth:0x8c8d8a,                                               // grinding teeth
    grease:0x2e2a20,                                              // hydraulic grease grime
    ram:0x46484a,                                                 // hydraulic ram shafts
    disc:0x201f1c, discTop:0x2c2b27,
  };

  /* ---------- LANDMARKS — a hovering core; the jaw sits mid-body, shroud drapes down/around. ---------- */
  const cY = 0.62;                              // hovering core height
  const S = {
    crown:   V(0, cY+0.20, -0.02),
    jawTop:  V(0, cY+0.06,  0.02),
    jawBase: V(0, cY-0.10,  0.02),
    ramL:    V(-0.16, cY-0.02, -0.06),
    ramR:    V( 0.16, cY-0.02, -0.06),
    hem:     V(0, 0.10, 0.0),                    // shroud hem, dangling low near ground
  };

  /* ---------- CORE — a compact industrial mass the jaw is mounted to, mostly hidden by shroud. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:cY+0.22, cz:0.00, rx:0.10, rz:0.10, hex:P.jawDk},
      {y:cY+0.10, cz:0.00, rx:0.17, rz:0.17, hex:P.jaw},
      {y:cY-0.06, cz:0.02, rx:0.19, rz:0.19, hex:P.jaw},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0, cY+0.25, 0.00), P.jawDk);
  }

  /* ---------- GRINDING JAW — a toothed hydraulic ram mouth, upper/lower plate biting together. ---------- */
  {
    // upper jaw plate
    quad(V(-0.16,S.jawTop.y,0.10), V(0.16,S.jawTop.y,0.10), V(0.14,S.jawTop.y-0.02,0.24), V(-0.14,S.jawTop.y-0.02,0.24), P.jawLt, 0.05);
    // lower jaw plate
    quad(V(-0.15,S.jawBase.y+0.02,0.09), V(0.15,S.jawBase.y+0.02,0.09), V(0.13,S.jawBase.y+0.06,0.22), V(-0.13,S.jawBase.y+0.06,0.22), P.jaw, 0.05);
    // grinding teeth along both plates, interlocking
    for(let i=0;i<5;i++){
      const t = i/4, x = -0.13 + t*0.26;
      const zTop = 0.12 + t*0.10;
      tube(V(x, S.jawTop.y-0.02, zTop), V(x, S.jawTop.y-0.09, zTop+0.03), 0.018, 0.006, 4, P.tooth, {capB:{hex:P.tooth,lift:0.004}});
      const zBot = 0.11 + t*0.09;
      tube(V(x*0.94, S.jawBase.y+0.04, zBot), V(x*0.94, S.jawBase.y+0.11, zBot+0.02), 0.018, 0.006, 4, P.tooth, {capB:{hex:P.tooth,lift:0.004}});
    }
    // grease grime streaks under the jaw hinge
    quad(V(-0.10,S.jawBase.y+0.02,0.04), V(0.02,S.jawBase.y+0.02,0.05), V(0.0,S.jawBase.y-0.03,0.10), V(-0.11,S.jawBase.y-0.03,0.09), P.grease, 0.04);
  }

  /* ---------- HYDRAULIC RAMS — twin shafts flanking the jaw, driving the bite. ---------- */
  tube(V(S.ramL.x,cY+0.14,-0.10), S.ramL, 0.032, 0.026, 6, P.ram, {phase:Math.PI/6});
  tube(S.ramL, V(-0.13,cY-0.16,0.08), 0.026, 0.020, 6, P.ram, {phase:Math.PI/6, capB:{hex:P.jawDk,lift:0.01}});
  tube(V(S.ramR.x,cY+0.14,-0.10), S.ramR, 0.032, 0.026, 6, P.ram, {phase:Math.PI/6});
  tube(S.ramR, V(0.13,cY-0.16,0.08), 0.026, 0.020, 6, P.ram, {phase:Math.PI/6, capB:{hex:P.jawDk,lift:0.01}});

  /* ---------- SHROUD — loose torn conveyor-belt plastic sheeting hanging over/around the core. ---------- */
  {
    const wrapTop = [[-0.24,cY+0.18,-0.10],[0.02,cY+0.24,-0.14],[0.26,cY+0.16,-0.08],[0.20,cY-0.02,0.14],[-0.02,cY-0.10,0.20],[-0.24,cY-0.02,0.12]];
    for(let i=0;i<wrapTop.length;i++){
      const a=wrapTop[i], b=wrapTop[(i+1)%wrapTop.length];
      const aDown=[a[0]*1.35, a[1]-0.55-0.15*Math.sin(i), a[2]*1.30];
      const bDown=[b[0]*1.35, b[1]-0.55-0.15*Math.sin(i+1), b[2]*1.30];
      quad(V(a[0],a[1],a[2]), V(b[0],b[1],b[2]), V(bDown[0],bDown[1],bDown[2]), V(aDown[0],aDown[1],aDown[2]), (i%2)?P.plastic:P.plasticDk, 0.09);
    }
    // ragged torn hem strips dangling near the ground, uneven lengths
    const hemPts = [[-0.20,-0.10],[-0.08,0.05],[0.06,-0.06],[0.20,0.02],[0.28,-0.12]];
    for(const [x,zoff] of hemPts){
      const top = V(x*1.30, cY-0.40, 0.20+zoff*0.4);
      const bot = V(x*1.36, 0.06+0.10*Math.abs(zoff), 0.24+zoff*0.4);
      tube(top, bot, 0.05, 0.010, 4, P.plasticLt, {phase:Math.PI/4, capB:{hex:P.plasticDk, lift:0.004}});
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.040,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.043,0), P.discTop);
  }
}
