/* dev/model-qa/creatures/rlm-longship-storm-caller-reaver.js — Longship Storm-Caller Reaver
   (theater/longship era-lens, Large, CR 12). A reaver standing at the helm, storm crackling around
   him — a huge broad-shouldered raider figure gripping a longship steering-oar/tiller planted before
   him like a staff, wind-whipped cloak, small jagged lightning-arc motifs crackling off his raised
   free hand. Whole-object grammar: one merged frame, no anchors. VS-desaturated palette: weathered
   sea-leather brown, dull iron-grey mail, storm-cloud slate cloak, cold pale-blue storm-crackle glow.
   NO eye quads (deep brow shadow instead). Large size: base disc r=0.55.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildLongshipStormCallerReaver(){
  const P = {
    leather:0x4a3a28, leatherDk:0x2e2318, leatherLt:0x5e4c36,
    mail:0x4c4e50, mailDk:0x303234, mailLt:0x64676a,
    cloak:0x3c4046, cloakDk:0x24272c,
    skin:0x8a7460, skinDk:0x5c4c3e,
    wood:0x4a3826, woodDk:0x2c2013,
    storm:0x7ea0b0, stormLt:0xb8d4e0,
    disc:0x3c4044, discTop:0x484d51,
  };

  /* ---------- LANDMARKS — broad, tall, planted wide stance, ~1.45u tall, oar planted before him. --*/
  const S = {
    hip:V(0,0.42,0), waist:V(0,0.58,0.01), chest:V(0,0.80,0.02), shldr:V(0,0.98,0.0),
    neck:V(0,1.02,-0.01), headB:V(0,1.08,-0.02), headT:V(0,1.26,-0.03),
  };

  /* ---------- LEGS — thick, planted wide (a helmsman's brace against the swell). ---------- */
  {
    const leg=(sign)=>{
      const hip=V(sign*0.15,S.hip.y-0.06,0.0), knee=V(sign*0.18,0.24,0.06), foot=V(sign*0.18,0.03,0.10);
      tube(hip,knee,0.115,0.095,6,P.leather,{phase:Math.PI/6,capA:{hex:P.leatherDk}});
      tube(knee,foot,0.095,0.10,6,P.leatherDk,{phase:Math.PI/6});
      quad(V(foot.x-0.10,0.02,foot.z-0.06),V(foot.x+0.10,0.02,foot.z-0.06),
           V(foot.x+0.09,0.01,foot.z+0.14),V(foot.x-0.09,0.01,foot.z+0.14), P.leatherDk, 0.03);
    };
    leg(-1); leg(1);
  }

  /* ---------- TORSO — broad-shouldered, mail-shirt over leather, sea-worn. ---------- */
  {
    const n=9, ph=Math.PI/9;
    const bands=[
      {y:S.hip.y,   rx:0.185, hex:P.leatherDk},
      {y:S.waist.y, rx:0.170, hex:P.leather},
      {y:S.chest.y, rx:0.225, hex:P.mail},
      {y:S.shldr.y, rx:0.245, hex:P.mailLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx*0.84, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.neck.y-0.01,0), P.mailLt);
    capFan(rings[0], V(0,S.hip.y-0.09,0), P.leatherDk, true);
    // mail texture hint — faint horizontal ring bands on the chest
    for(const y of [S.chest.y-0.06, S.chest.y+0.06]){
      const r=ring(V(0,y,0),V(0,1,0),0.23,0.19,n,ph); const r2=ring(V(0,y+0.012,0),V(0,1,0),0.23,0.19,n,ph);
      stitch([r,r2],()=>P.mailDk);
    }
  }

  /* ---------- HEAD — weathered, deep brow shadow (no eye quads), windswept beard/hair suggested
     by ragged low-poly tufts. ---------- */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:S.headB.y,      r:0.095, hex:P.skinDk},
      {y:S.headB.y+0.07, r:0.100, hex:P.skin},
      {y:S.headT.y-0.05, r:0.088, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.r, b.r*0.92, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.leatherDk);
    // brow shadow (no eyes — pure recess)
    quad(V(-0.07,S.headB.y+0.06,0.085), V(0.07,S.headB.y+0.06,0.085),
         V(0.06,S.headB.y+0.01,0.08), V(-0.06,S.headB.y+0.01,0.08), P.skinDk, 0.02);
    // ragged wind-tugged beard tufts
    for(const dx of [-0.05,0,0.05]) quad(V(dx-0.02,S.headB.y-0.02,0.06), V(dx+0.02,S.headB.y-0.02,0.06),
      V(dx+0.015,S.headB.y-0.16,0.02), V(dx-0.015,S.headB.y-0.16,0.02), P.leatherDk, 0.05);
  }

  /* ---------- STORM-CALLER FREE ARM — raised, palm out, small jagged lightning-arc motifs
     crackling off the raised hand (the storm-caller signature). ---------- */
  {
    const sh=V(-0.24,S.shldr.y-0.02,0.0), el=V(-0.34,S.shldr.y+0.16,0.06), wr=V(-0.24,S.headT.y+0.02,0.08);
    tube(sh,el,0.075,0.062,6,P.leather,{phase:Math.PI/6,capA:{hex:P.leatherDk}});
    tube(el,wr,0.062,0.048,6,P.mail,{phase:Math.PI/6,capB:{hex:P.skin,lift:0.01}});
    // jagged lightning arcs — thin zig-zag quads radiating from the raised palm
    const arcs=[[-0.10,0.10,-0.02],[0.06,0.14,0.04],[-0.04,-0.06,0.10]];
    for(const [dx,dy,dz] of arcs){
      const p0=wr, p1=V(wr.x+dx*0.5,wr.y+dy*0.5,wr.z+dz*0.5), p2=V(wr.x+dx,wr.y+dy,wr.z+dz);
      tube(p0,p1,0.012,0.008,3,P.storm,{capA:{hex:P.stormLt}});
      tube(p1,p2,0.008,0.002,3,P.stormLt,{capB:{hex:P.stormLt}});
    }
  }

  /* ---------- HELM ARM + STEERING-OAR/TILLER — the other arm gripping a long steering-oar planted
     before him like a staff, the dominant "at the helm" silhouette read. ---------- */
  {
    const sh=V(0.22,S.shldr.y-0.04,0.02), el=V(0.28,S.waist.y+0.02,0.14), wr=V(0.20,S.hip.y-0.04,0.20);
    tube(sh,el,0.075,0.062,6,P.leather,{phase:Math.PI/6,capA:{hex:P.leatherDk}});
    tube(el,wr,0.062,0.048,6,P.leatherDk,{phase:Math.PI/6,capB:{hex:P.skin,lift:0.01}});
    // the tiller/oar shaft — long, planted from grip down to the "deck" (base disc), flaring to a
    // broad steering-blade at the top above the grip.
    const gripLow=V(wr.x,wr.y-0.02,wr.z+0.02), gripHigh=V(wr.x+0.02,wr.y+0.30,wr.z-0.02);
    const shaftBot=V(gripHigh.x+0.02,gripHigh.y+0.10,gripHigh.z-0.02);
    const bladeTop=V(shaftBot.x+0.02,shaftBot.y+0.30,shaftBot.z-0.04);
    tube(V(wr.x,0.03,wr.z), gripLow, 0.045,0.040,6,P.wood,{phase:Math.PI/6,capA:{hex:P.woodDk}});
    tube(gripLow, gripHigh, 0.040,0.035,6,P.woodDk,{phase:Math.PI/6});
    tube(gripHigh, shaftBot, 0.035,0.05,6,P.wood,{phase:Math.PI/6});
    // steering-blade flare at the top
    quad(V(shaftBot.x-0.13,shaftBot.y+0.02,shaftBot.z), V(shaftBot.x+0.13,shaftBot.y+0.02,shaftBot.z),
         V(bladeTop.x+0.05,bladeTop.y,bladeTop.z), V(bladeTop.x-0.05,bladeTop.y,bladeTop.z), P.woodDk, 0.05);
  }

  /* ---------- WIND-WHIPPED CLOAK — a broad slate cloak trailing back off the shoulders, blown
     to one side (storm-caught). ---------- */
  {
    quad(V(-0.20,S.shldr.y+0.04,-0.10), V(0.20,S.shldr.y+0.04,-0.10),
         V(0.34,S.hip.y-0.30,-0.34), V(-0.30,S.hip.y-0.34,-0.30), P.cloak, 0.05);
    quad(V(-0.20,S.shldr.y+0.02,-0.10), V(0.20,S.shldr.y+0.02,-0.10),
         V(0.30,S.hip.y-0.20,-0.24), V(-0.26,S.hip.y-0.22,-0.22), P.cloakDk, 0.04);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
