/* dev/model-qa/creatures/rlm-furnace-bound-salamander.js — FURNACE-BOUND SALAMANDER (ash,
   Large elemental/reptile-hybrid, CR 6). Read: a scrapyard blast-furnace elemental — a
   long low-slung salamander body (kin to the giant-lizard sprawl grammar) fused with
   scavenged furnace ironwork: riveted iron plates bolted into the hide along the spine, a
   furnace-grate ribcage window glowing molten-orange through the flank, a heavy iron-shod
   tail, jaw wreathed in heat-shimmer/ember glow, smoke-vent nostrils. VS-desaturated
   ash-grey/iron-black hide with hot ember-orange glow bleeding from the furnace-grate
   window and cracks. NO eye quads. Whole-object grammar: one function, one frame, no
   anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildFurnaceBoundSalamander(){
  const P = {
    hide:0x3e3a30, hideDk:0x24211a, hideLt:0x524c3c,
    iron:0x545048, ironDk:0x322e26, rust:0x7a4a30,
    grate:0x201d18,
    ember:0x9a4a1e, emberHot:0xc87830, emberDk:0x5e2a0e,
    smoke:0x605a50,
    mouth:0x201a16, tooth:0xb0a488,
    claw:0x1c1916,
    disc:0x4a4038, discTop:0x585047,
  };

  const spY = 0.40;
  const S = {
    tailBase: V(0, spY-0.02, -0.68),
    rump:     V(0, spY+0.02, -0.48),
    loin:     V(0, spY+0.03, -0.22),
    mid:      V(0, spY+0.03,  0.02),
    shldr:    V(0, spY+0.01,  0.28),
    neck:     V(0, spY-0.02,  0.48),
    headB:    V(0, spY-0.04,  0.62),
  };
  tube(S.rump,  S.loin,  0.235, 0.260, 9, P.hide,   {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.260, 0.265, 9, P.hideDk, {phase:Math.PI/9});
  tube(S.mid,   S.shldr, 0.265, 0.238, 9, P.hide,   {phase:Math.PI/9});
  tube(S.shldr, S.neck,  0.238, 0.158, 9, P.hideDk, {phase:Math.PI/9});
  tube(S.neck,  S.headB, 0.158, 0.128, 9, P.hide,   {phase:Math.PI/9});

  /* riveted iron plates bolted into the hide along the spine (furnace ironwork fused on) */
  {
    const seg = [[-0.42,spY+0.22],[-0.16,spY+0.24],[0.08,spY+0.24],[0.30,spY+0.20]];
    for(const [z,y] of seg){
      quad(V(-0.08,y,z-0.04), V(0.08,y,z-0.04), V(0.07,y-0.05,z+0.03), V(-0.07,y-0.05,z+0.03), P.iron, 0.05);
      for(const s of [-1,1]) quad(V(s*0.06,y-0.01,z), V(s*0.06+0.012,y-0.01,z), V(s*0.06+0.010,y-0.03,z+0.01), V(s*0.06-0.002,y-0.03,z+0.01), P.rust, 0.02);
    }
  }

  /* FURNACE-GRATE RIBCAGE WINDOW — a riveted grate set into the flank, glowing molten-orange */
  {
    const gx=0.20, gy=spY+0.02, gz=-0.02;
    quad(V(gx-0.10,gy+0.09,gz-0.10), V(gx+0.02,gy+0.10,gz+0.10), V(gx+0.01,gy-0.09,gz+0.11), V(gx-0.11,gy-0.10,gz-0.09), P.grate, 0.03);
    /* grate bars */
    for(let i=-2;i<=2;i++){
      const t=i*0.045;
      quad(V(gx-0.09+t,gy+0.08,gz-0.09+t*0.2), V(gx-0.085+t,gy+0.08,gz-0.09+t*0.2), V(gx-0.09+t,gy-0.09,gz+0.10+t*0.2), V(gx-0.095+t,gy-0.09,gz+0.10+t*0.2), P.ironDk, 0.02);
    }
    /* glow bleeding behind the bars */
    quad(V(gx-0.08,gy+0.06,gz-0.06), V(gx-0.01,gy+0.07,gz+0.08), V(gx-0.02,gy-0.07,gz+0.09), V(gx-0.09,gy-0.08,gz-0.06), P.ember, 0.10);
    quad(V(gx-0.05,gy+0.02,gz-0.02), V(gx-0.02,gy+0.02,gz+0.04), V(gx-0.025,gy-0.03,gz+0.045), V(gx-0.055,gy-0.03,gz-0.01), P.emberHot, 0.14);
  }

  /* HEAD — jaw wreathed in heat-shimmer, smoke-vent nostrils, no eye quads */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.075, cz:0.66, rx:0.128, rz:0.132, hex:P.hide},
      {y:spY-0.035, cz:0.69, rx:0.146, rz:0.136, hex:P.hideDk},
      {y:spY+0.005, cz:0.66, rx:0.116, rz:0.104, hex:P.hide},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+0.02,0.66), P.hideDk);

    const snB = V(0, spY-0.085, 0.66);
    const snM = V(0, spY-0.105, 0.78);
    const snT = V(0, spY-0.118, 0.87);
    tube(snB, snM, 0.116, 0.086, n, P.hideDk, {raz:0.094, rbz:0.064, phase:ph});
    tube(snM, snT, 0.086, 0.050, n, P.iron,   {raz:0.064, rbz:0.034, phase:ph, capB:{hex:P.mouth, lift:0.008}});
    /* smoke-vent nostrils — dark pits venting faint smoke wisps */
    for(const s of [-1,1]){
      quad(V(s*0.022-0.010,spY-0.108,0.855), V(s*0.022+0.010,spY-0.108,0.855), V(s*0.022+0.008,spY-0.092,0.845), V(s*0.022-0.008,spY-0.092,0.845), P.grate, 0.0);
      quad(V(s*0.022-0.006,spY-0.09,0.85), V(s*0.022+0.006,spY-0.09,0.85), V(s*0.022+0.010,spY-0.06,0.86), V(s*0.022-0.010,spY-0.06,0.86), P.smoke, 0.10);
    }
    /* ember-glow mouth line, heat-shimmer read */
    quad(V(-0.084,spY-0.13,0.70), V(0.084,spY-0.13,0.70), V(0.050,spY-0.135,0.85), V(-0.050,spY-0.135,0.85), P.mouth, 0.03);
    quad(V(-0.05,spY-0.135,0.76), V(0.05,spY-0.135,0.76), V(0.03,spY-0.14,0.83), V(-0.03,spY-0.14,0.83), P.ember, 0.10);
    for(let i=-1;i<=1;i++) quad(V(i*0.035-0.012,spY-0.128,0.72), V(i*0.035+0.012,spY-0.128,0.72), V(i*0.035+0.009,spY-0.15,0.72), V(i*0.035-0.009,spY-0.15,0.72), P.tooth, 0.03);
  }

  /* LEGS — sprawling reptile stance, iron-shod feet */
  {
    const sprawlLeg=(shoulder, footX, footZ)=>{
      const elbowX = shoulder.x + Math.sign(shoulder.x)*0.20;
      const elbow = V(elbowX, spY-0.10, shoulder.z + (footZ>shoulder.z?0.04:-0.04));
      const foot  = V(footX, 0.055, footZ);
      tube(shoulder, elbow, 0.076, 0.056, 7, P.hide);
      tube(elbow, foot, 0.054, 0.040, 6, P.hideDk, {capB:{hex:P.iron, lift:0.006}});
      /* iron-shod foot plate + claws */
      const pad = V(foot.x, 0.03, foot.z+0.03);
      const side = Math.sign(foot.x||1);
      quad(V(pad.x-0.05,0.03,pad.z-0.03), V(pad.x+0.05,0.03,pad.z-0.03), V(pad.x+0.04,0.02,pad.z+0.06), V(pad.x-0.04,0.02,pad.z+0.06), P.iron, 0.04);
      for(const [dx,dz] of [[side*0.05,0.02],[side*0.02,0.06],[-side*0.03,0.05]]){
        const cb = V(pad.x, 0.03, pad.z);
        const ct = V(pad.x+dx, 0.008, pad.z+dz+0.03);
        tube(cb, ct, 0.013, 0.005, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    sprawlLeg(V(-0.182, spY-0.03, 0.26), -0.41, 0.34);
    sprawlLeg(V( 0.182, spY-0.03, 0.26),  0.41, 0.30);
    sprawlLeg(V(-0.196, spY-0.01, -0.42), -0.43,-0.36);
    sprawlLeg(V( 0.196, spY-0.01, -0.42),  0.43,-0.40);
  }

  /* TAIL — heavy, iron-shod plates riveted down its length, tapering */
  {
    const t0 = S.tailBase;
    const t1 = V(0.05, spY-0.06, -0.94);
    const t2 = V(0.12, spY-0.12, -1.20);
    const t3 = V(0.22, 0.20,     -1.44);
    const t4 = V(0.34, 0.12,     -1.62);
    const tip= V(0.44, 0.07,     -1.74);
    tube(t0, t1, 0.148, 0.122, 8, P.hide,   {phase:Math.PI/8, capA:{hex:P.hideDk}});
    tube(t1, t2, 0.122, 0.094, 8, P.hideDk, {phase:Math.PI/8});
    tube(t2, t3, 0.094, 0.064, 8, P.iron,   {phase:Math.PI/8});
    tube(t3, t4, 0.064, 0.038, 8, P.ironDk, {phase:Math.PI/8});
    tube(t4, tip,0.038, 0.010, 8, P.iron,   {phase:Math.PI/8, capB:{hex:P.emberDk, lift:0.006}});
    /* riveted plate seams down the iron-shod tail */
    for(const t of [0.35,0.55,0.75]){
      const y = t3.y + (t4.y-t3.y)*(t-0.35)/0.4;
      quad(V(-0.02,y+0.02,-1.30-t*0.1), V(0.02,y+0.02,-1.30-t*0.1), V(0.016,y-0.02,-1.32-t*0.1), V(-0.016,y-0.02,-1.32-t*0.1), P.rust, 0.03);
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
