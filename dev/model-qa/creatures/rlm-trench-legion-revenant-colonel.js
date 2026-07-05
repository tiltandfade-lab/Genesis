/* dev/model-qa/creatures/rlm-trench-legion-revenant-colonel.js — Trench Legion Revenant Colonel
   (theater/legion era-lens fused w/ trench dead-officer read, Medium, CR 11). A revenant colonel
   rallying every corpse in earshot — a gaunt undead officer in a tattered greatcoat, one arm raised
   holding a signal-whistle/baton aloft as if calling the advance, a ghostly command-aura suggested by
   faint tattered cape-tatters trailing off him like smoke. Whole-object grammar: one merged frame, no
   anchors. VS-desaturated palette: rotted grey-drab coat, pale corpse-flesh, tarnished brass rank
   insignia, dull bone. NO eye quads (deep hollow eye-sockets instead — permitted per exemplar
   convention: sockets/skull shapes only, no quad "eyes"). Medium size: base disc r=0.42.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTrenchLegionRevenantColonel(){
  const P = {
    coat:0x4c4a40, coatDk:0x2e2c26, coatLt:0x605e50,
    flesh:0x8a8478, fleshDk:0x5c584c,
    bone:0x9a9082, boneDk:0x635e50,
    brass:0x8c7c40, brassDk:0x5c5028,
    cape:0x3a3830, capeDk:0x201e18,
    disc:0x3a3630, discTop:0x453f36,
  };

  /* ---------- LANDMARKS — gaunt officer standing tall, chest lifted, one arm raised aloft. ---------- */
  const S = {
    hip:V(0,0.44,0), waist:V(0,0.56,0.01), chest:V(0,0.72,0.02), shldr:V(0,0.85,0.0),
    neck:V(0,0.90,-0.01), headB:V(0,0.95,-0.02), headT:V(0,1.09,-0.03),
  };

  /* ---------- LEGS — thin, gaunt, standing tall in tattered boots. ---------- */
  {
    const leg=(sign)=>{
      const hip=V(sign*0.09,S.hip.y-0.06,0.0), knee=V(sign*0.10,0.22,0.02), foot=V(sign*0.10,0.03,0.06);
      tube(hip,knee,0.075,0.062,6,P.coatDk,{phase:Math.PI/6});
      tube(knee,foot,0.062,0.070,6,P.coatDk,{phase:Math.PI/6,capB:{hex:P.boneDk,lift:0.02}});
      quad(V(foot.x-0.07,0.02,foot.z-0.05),V(foot.x+0.07,0.02,foot.z-0.05),
           V(foot.x+0.06,0.01,foot.z+0.10),V(foot.x-0.06,0.01,foot.z+0.10), P.boneDk, 0.03);
    };
    leg(-1); leg(1);
  }

  /* ---------- TORSO — tattered greatcoat, chest lifted proud, tarnished brass buttons/insignia. --*/
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:S.hip.y,   rx:0.135, hex:P.coatDk},
      {y:S.waist.y, rx:0.120, hex:P.coat},
      {y:S.chest.y, rx:0.150, hex:P.coatLt},
      {y:S.shldr.y, rx:0.130, hex:P.coat},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx*0.86, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.neck.y-0.01,0), P.coatLt);
    capFan(rings[0], V(0,S.hip.y-0.08,0), P.coatDk, true);
    // brass buttons
    for(const y of [0.50,0.60,0.70,0.79]) quad(V(-0.012,y,0.135),V(0.012,y,0.135),V(0.010,y+0.018,0.132),V(-0.010,y+0.018,0.132), P.brass, 0.04);
    // rank insignia epaulette (raised arm side)
    quad(V(0.10,S.shldr.y-0.02,0.04),V(0.19,S.shldr.y-0.02,0.02),V(0.17,S.shldr.y+0.04,0.02),V(0.09,S.shldr.y+0.04,0.04), P.brass, 0.04);
    // tattered coat-tail hem shreds at the hip
    for(const [x0,x1] of [[-0.13,-0.08],[-0.02,0.03],[0.08,0.13]]){
      quad(V(x0,S.hip.y-0.04,-0.08), V(x1,S.hip.y-0.04,-0.08), V(x1-0.01,S.hip.y-0.24,-0.10), V(x0+0.01,S.hip.y-0.24,-0.10), P.coatDk, 0.05);
    }
  }

  /* ---------- HEAD — gaunt corpse-flesh, hollow eye sockets (NO eye quads), skull-like cheekbones,
     an officer's peaked cap silhouette. ---------- */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:S.headB.y,      r:0.075, hex:P.fleshDk},
      {y:S.headB.y+0.06, r:0.080, hex:P.flesh},
      {y:S.headT.y-0.04, r:0.068, hex:P.fleshDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.r, b.r*0.92, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.coatDk);
    // peaked cap brim over the brow
    quad(V(-0.09,S.headT.y-0.05,0.05), V(0.09,S.headT.y-0.05,0.05), V(0.07,S.headT.y-0.03,0.12), V(-0.07,S.headT.y-0.03,0.12), P.coatDk, 0.03);
    // hollow eye SOCKETS — recessed dark quads (socket shapes, not eye quads) under the brow
    for(const s of [-1,1]) quad(V(s*0.045-0.018,S.headB.y+0.05,0.062), V(s*0.045+0.018,S.headB.y+0.05,0.062),
      V(s*0.045+0.014,S.headB.y+0.015,0.058), V(s*0.045-0.014,S.headB.y+0.015,0.058), P.fleshDk, 0.02);
    // gaunt cheekbone hollows
    quad(V(-0.06,S.headB.y-0.01,0.04),V(-0.02,S.headB.y-0.01,0.05),V(-0.03,S.headB.y-0.05,0.05),V(-0.07,S.headB.y-0.05,0.04), P.fleshDk, 0.04);
    quad(V(0.06,S.headB.y-0.01,0.04),V(0.02,S.headB.y-0.01,0.05),V(0.03,S.headB.y-0.05,0.05),V(0.07,S.headB.y-0.05,0.04), P.fleshDk, 0.04);
  }

  /* ---------- ARMS — one hanging (bone-thin hand at the coat pocket), one RAISED ALOFT gripping a
     signal whistle/baton, rallying the advance. ---------- */
  {
    // hanging arm
    const sh0=V(-0.15,S.shldr.y-0.04,0.0), el0=V(-0.20,S.waist.y+0.02,0.06), wr0=V(-0.17,S.hip.y+0.02,0.05);
    tube(sh0,el0,0.055,0.045,5,P.coat,{capA:{hex:P.coatDk}});
    tube(el0,wr0,0.045,0.032,5,P.coatDk,{capB:{hex:P.bone,lift:0.01}});
    // raised arm — bent up, hand aloft holding baton/whistle
    const sh1=V(0.15,S.shldr.y-0.02,0.0), el1=V(0.24,S.shldr.y+0.14,0.02), wr1=V(0.16,S.headT.y+0.06,0.06);
    tube(sh1,el1,0.055,0.045,5,P.coat,{capA:{hex:P.coatDk}});
    tube(el1,wr1,0.045,0.032,5,P.coatDk,{capB:{hex:P.bone,lift:0.01}});
    // baton held aloft
    tube(wr1, V(wr1.x+0.02,wr1.y+0.14,wr1.z-0.02), 0.014,0.008,4,P.boneDk,{capB:{hex:P.brass,lift:0.01}});
  }

  /* ---------- TRAILING CAPE-TATTERS — faint ragged cape-shreds trailing behind, the "command aura"
     suggested by drifting cloth, not a literal effect. ---------- */
  {
    for(const [dx,dz] of [[-0.06,-0.02],[0.0,-0.04],[0.07,-0.01]]){
      quad(V(dx-0.04,S.shldr.y+0.02,-0.06), V(dx+0.04,S.shldr.y+0.02,-0.06),
           V(dx+0.02,S.hip.y-0.12,-0.20+dz), V(dx-0.02,S.hip.y-0.12,-0.20+dz), P.cape, 0.06);
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
