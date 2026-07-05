/* dev/model-qa/creatures/rlm-iron-horse-runaway-engine.js — Iron Horse Runaway Engine
   (frontier, Huge, CR 6). A locomotive fused with a boiler-armored torso: a tall riveted
   boiler-chest with a cowcatcher-grille at the front, piston-driven arms, thick wheeled
   legs, a smokestack-crown venting hard, running wild with no rail beneath it. Whole-
   object grammar: one merged frame, no anchors. VS-desaturated black-iron + rust-red
   locomotive palette. NO eye quads — a plain riveted headlamp-lens up front, not eyes.
   Huge size: base disc r=0.68.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildIronHorseRunawayEngine(){
  const P = {
    iron:0x36332e, ironDk:0x201e1a, ironLt:0x4c4740,
    rail:0x6e3228, railDk:0x462017,
    brass:0x8c7c40, brassDk:0x5c4f28,
    lamp:0xcbb878, lampDk:0x8a7a48,
    smoke:0x726c60,
    wheel:0x2c2925,
    disc:0x322e28, discTop:0x3c3730,
  };

  const L = { hipY:0.42, waistY:0.70, chestY:1.02, shldY:1.28, headY:1.46 };

  /* ---------- BOILER-TORSO — a tall cylindrical riveted boiler for a chest/torso,
     narrowing slightly at the "waist" like a locomotive tapering into its cab. ---------- */
  {
    const n=10, ph=Math.PI/10;
    const bands=[
      {y:L.hipY-0.06, rx:0.30, rz:0.30, hex:P.ironDk},
      {y:L.waistY,    rx:0.34, rz:0.34, hex:P.rail},
      {y:L.chestY,    rx:0.36, rz:0.36, hex:P.railDk},
      {y:L.shldY,     rx:0.30, rz:0.30, hex:P.iron},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.shldY+0.08,0), P.ironLt);
    /* brass boiler-bands */
    for(const y of [L.waistY+0.06, L.chestY+0.06]){
      const r1=ring(V(0,y,0), V(0,1,0), 0.35,0.35, n, ph);
      const r2=ring(V(0,y+0.05,0), V(0,1,0), 0.35,0.35, n, ph);
      stitch([r1,r2], ()=>P.brass);
    }
    /* rivet rows */
    for(const y of [L.hipY+0.02, L.chestY-0.10]){
      for(let i=0;i<n;i++){
        const a=(i/n)*Math.PI*2;
        const rr = (y<L.waistY)?0.30:0.36;
        const px=Math.cos(a)*rr, pz=Math.sin(a)*rr;
        quad(V(px-0.014,y-0.01,pz-0.014), V(px+0.014,y-0.01,pz-0.014), V(px+0.012,y+0.01,pz+0.012), V(px-0.012,y+0.01,pz+0.012), P.ironLt, 0.05);
      }
    }
  }

  /* ---------- COWCATCHER-GRILLE FACE — a wide angled grille-wedge jutting forward at the
     chest/head boundary, the locomotive's cowcatcher fused into the figure as a face-plate,
     plus a single riveted headlamp-lens (not eyes). ---------- */
  {
    const cz=0.36, cy=L.chestY+0.08;
    /* angled wedge grille bars */
    for(let i=0;i<6;i++){
      const t=i/5, y0=cy+0.20-t*0.34;
      quad(V(-0.28+t*0.10,y0,cz), V(0.28-t*0.10,y0,cz), V(0.24-t*0.10,y0-0.05,cz+0.12), V(-0.24+t*0.10,y0-0.05,cz+0.12), (i%2)?P.iron:P.ironDk, 0.05);
    }
    /* single round headlamp-lens, centered — NOT a pair of eyes */
    const lgy=cy+0.02, lgz=cz+0.14;
    const r1=ring(V(0,lgy,lgz), V(0,0,1), 0.075,0.075, 8, Math.PI/8);
    const r2=ring(V(0,lgy,lgz+0.03), V(0,0,1), 0.06,0.06, 8, Math.PI/8);
    stitch([r1,r2], ()=>P.brassDk);
    capFan(r2, V(0,lgy,lgz+0.05), P.lamp);
  }

  /* ---------- SMOKESTACK-CROWN — a wide-flared stack rising off the shoulders where a
     head would be, venting hard, running wild. ---------- */
  {
    const base=V(0, L.shldY+0.06, -0.06);
    const neck=V(0, L.shldY+0.22, -0.08);
    const flare=V(0, L.shldY+0.34, -0.08);
    tube(base, neck, 0.16, 0.13, 9, P.ironDk, {capA:{hex:P.iron}});
    tube(neck, flare, 0.13, 0.19, 9, P.iron, {capB:{hex:P.ironLt, lift:0.02}});
    let prev=V(flare.x, flare.y+0.02, flare.z);
    const puffs=[[0.04,0.20,-0.04],[0.10,0.40,-0.10],[0.06,0.60,-0.04],[0.12,0.78,0.02]];
    for(const [dx,dy,dz] of puffs){
      const nxt=V(flare.x+dx, flare.y+dy, flare.z+dz);
      tube(prev, nxt, 0.09, 0.13, 6, P.smoke);
      prev=nxt;
    }
  }

  /* ---------- PISTON-DRIVEN ARMS — thick connecting-rod arms, angular and mechanical,
     driving forward like locomotive drive-rods. ---------- */
  {
    const armAt=(sign)=>{
      const sh = V(sign*0.34, L.shldY-0.10, 0.04);
      const el = V(sign*0.44, L.waistY+0.02, 0.20);
      const wr = V(sign*0.38, L.hipY-0.02, 0.34);
      tube(sh, el, 0.115, 0.09, 7, P.iron, {capA:{hex:P.ironDk}});
      tube(el, wr, 0.09, 0.065, 7, P.railDk, {capB:{hex:P.ironLt, lift:0.02}});
      /* piston rod detail alongside the forearm */
      tube(V(el.x,el.y+0.04,el.z), V(wr.x,wr.y+0.03,wr.z+0.06), 0.03, 0.024, 5, P.brass);
    };
    armAt(-1); armAt(1);
  }

  /* ---------- THICK WHEELED LEGS — heavy iron legs ending in stubby spoked drive-wheels,
     the "iron horse" running-wild read. ---------- */
  {
    const legAt=(sign)=>{
      const hip=V(sign*0.20, L.hipY-0.04, 0.0);
      const knee=V(sign*0.24, L.hipY-0.24, 0.06);
      tube(hip, knee, 0.16, 0.12, 7, P.iron);
      /* drive-wheel */
      const cx=sign*0.24, cy=0.20, cz=0.10;
      const r1=ring(V(cx,cy,cz), V(1,0,0), 0.22,0.22, 10, 0);
      const r2=ring(V(cx+sign*0.06,cy,cz), V(1,0,0), 0.22,0.22, 10, 0);
      stitch([r1,r2], ()=>P.wheel);
      capFan(r1, V(cx-sign*0.01,cy,cz), P.ironDk);
      capFan(r2, V(cx+sign*0.07,cy,cz), P.ironDk, true);
      for(let i=0;i<6;i++){
        const a=i/6*Math.PI*2;
        const rimY=cy+Math.cos(a)*0.20, rimZ=cz+Math.sin(a)*0.20;
        quad(V(cx-0.012,cy,cz), V(cx+0.012,cy,cz), V(cx+0.012,rimY,rimZ), V(cx-0.012,rimY,rimZ), P.ironLt, 0.05);
      }
    };
    legAt(-1); legAt(1);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
