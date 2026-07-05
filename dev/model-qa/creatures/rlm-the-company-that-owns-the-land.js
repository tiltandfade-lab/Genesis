/* dev/model-qa/creatures/rlm-the-company-that-owns-the-land.js — THE COMPANY THAT OWNS
   THE LAND (frontier, bloated boardroom horror, Huge, CR 16). Read: a bloated, seated-hunch
   corporate colossus — a swollen barrel torso wearing overlapping DEEDS/PAPER SKIN (layered
   flat paper-sheet plates shingled over the body like scales, each a land-deed), stubby
   overgrown limbs propping it up, a small pinched head atop rolls of fat, hands that end in
   ink-stained ledger-fingers. Frontier register: dust and debt made monstrous flesh — dry
   sun-bleached paper going brittle, ink-black seals. NO eye quads — a pinched, jowl-buried
   face, no face detail beyond a slit mouth. Whole-object grammar: one function, one frame,
   no anchors. Huge size, base disc r=0.68. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheCompanyThatOwnsTheLand(){
  /* ---------- PALETTE (VS desaturated; dry paper/parchment over sallow bloated flesh) ---------- */
  const P = {
    flesh:0x8f8168, fleshDk:0x655a45, fleshLt:0xa89a7c,
    paper:0xc7bb96, paperDk:0x9a8f6e, paperLt:0xd9cda8,
    seal:0x5c1f1a, sealDk:0x3c1512,
    ink:0x24201a, inkDk:0x141210,
    vest:0x2e2a20, vestDk:0x1c1912,
    disc:0x4a4038, discTop:0x585047,
  };

  const baseY = 0.10;

  /* ---------- BLOATED SEATED-HUNCH TORSO — swollen barrel body, wide at the gut ---------- */
  const bands=[
    {y:baseY+0.05, rx:0.62, rz:0.58, hex:P.fleshDk},
    {y:baseY+0.35, rx:0.72, rz:0.66, hex:P.flesh},
    {y:baseY+0.70, rx:0.80, rz:0.72, hex:P.flesh},   /* widest — the swollen gut */
    {y:baseY+1.05, rx:0.72, rz:0.64, hex:P.fleshLt},
    {y:baseY+1.35, rx:0.56, rz:0.50, hex:P.flesh},
    {y:baseY+1.58, rx:0.36, rz:0.34, hex:P.fleshDk}, /* rolls of fat gathering toward the neck */
    {y:baseY+1.72, rx:0.22, rz:0.21, hex:P.fleshDk},
  ];
  {
    const n=14, ph=Math.PI/n;
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,baseY,0), P.fleshDk, true);
  }

  /* ---------- OVERLAPPING DEEDS — flat paper-sheet plates shingled over the body like scales --- */
  {
    const ringsOf=(y,rx,rz,count)=>{
      const pts=[];
      for(let i=0;i<count;i++){
        const t=(i/count)*Math.PI*2;
        pts.push({x:Math.cos(t)*rx, z:Math.sin(t)*rz, ang:t});
      }
      return pts;
    };
    const bandsToShingle=[
      {y:baseY+0.30, rx:0.70, rz:0.64, count:11},
      {y:baseY+0.55, rx:0.78, rz:0.70, count:12},
      {y:baseY+0.85, rx:0.79, rz:0.71, count:12},
      {y:baseY+1.12, rx:0.68, rz:0.60, count:10},
      {y:baseY+1.35, rx:0.52, rz:0.46, count:8},
    ];
    let sealToggle=0;
    for(const b of bandsToShingle){
      const pts=ringsOf(b.y,b.rx,b.rz,b.count);
      for(const p of pts){
        const nx=Math.cos(p.ang), nz=Math.sin(p.ang);
        const cx=nx*(b.rx+0.01), cz=nz*(b.rz+0.01);
        const upv=V(0,0.11,0), sidev=V(-nz*0.09, 0, nx*0.09);
        const c=V(cx, b.y, cz);
        const hex = (sealToggle++%4===0) ? P.paperDk : P.paper;
        quad(c.clone().sub(sidev).sub(upv), c.clone().add(sidev).sub(upv),
             c.clone().add(sidev).add(upv), c.clone().sub(sidev).add(upv), hex, 0.06);
        /* a wax seal blot on some plates — the deed's mark */
        if(sealToggle%3===0){
          const sc=c.clone().add(V(nx*0.01,0,nz*0.01));
          quad(sc.clone().add(V(-0.02,-0.02,0)), sc.clone().add(V(0.02,-0.02,0)),
               sc.clone().add(V(0.016,0.02,0)), sc.clone().add(V(-0.016,0.02,0)), P.seal, 0.04);
        }
      }
    }
  }

  /* ---------- small pinched head, buried in jowls/rolls atop the bloated body ---------- */
  {
    const hy = baseY+1.72;
    const n=8, ph=Math.PI/n;
    const hbands=[
      {y:hy,       rx:0.20, rz:0.19, hex:P.fleshDk},
      {y:hy+0.09,  rx:0.24, rz:0.22, hex:P.flesh},   /* jowls, widest */
      {y:hy+0.18,  rx:0.17, rz:0.16, hex:P.flesh},
      {y:hy+0.26,  rx:0.10, rz:0.10, hex:P.fleshDk},
    ];
    const rings=hbands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>hbands[b].hex);
    capFan(rings.at(-1), V(0,hy+0.29,0), P.fleshDk);
    /* pinched slit mouth, no eyes */
    quad(V(-0.055,hy+0.06,0.20), V(0.055,hy+0.06,0.20), V(0.040,hy+0.045,0.205), V(-0.040,hy+0.045,0.205), P.inkDk, 0.03);
  }

  /* ---------- stubby overgrown limbs propping the bulk up, planted wide ---------- */
  {
    const propLimb=(sx,sz,fx,fz)=>{
      const shoulder=V(sx, baseY+0.55, sz);
      const knee=V(sx*1.25, baseY+0.22, sz*1.15);
      const foot=V(fx, baseY-0.03, fz);
      tube(shoulder, knee, 0.185, 0.150, 8, P.flesh);
      tube(knee, foot, 0.150, 0.135, 8, P.fleshDk, {capB:{hex:P.fleshDk, lift:0.02}});
    };
    propLimb(-0.66,0.30, -0.82,0.42);
    propLimb( 0.66,0.30,  0.82,0.42);
    propLimb(-0.62,-0.40, -0.78,-0.52);
    propLimb( 0.62,-0.40,  0.78,-0.52);
  }

  /* ---------- vest lapels — a dark waistcoat visible over the paper-shingled gut ---------- */
  quad(V(-0.34,baseY+1.55,0.60), V(0.34,baseY+1.55,0.60), V(0.30,baseY+0.70,0.72), V(-0.30,baseY+0.70,0.72), P.vestDk, 0.03);
  quad(V(-0.32,baseY+1.50,0.62), V(-0.10,baseY+1.50,0.66), V(-0.08,baseY+0.75,0.74), V(-0.28,baseY+0.75,0.70), P.vest, 0.03);
  quad(V(0.10,baseY+1.50,0.66), V(0.32,baseY+1.50,0.62), V(0.28,baseY+0.75,0.70), V(0.08,baseY+0.75,0.74), P.vest, 0.03);

  /* ---------- arms ending in ink-stained LEDGER-FINGERS — long thin stacking digits ---------- */
  {
    const ledgerHand=(shoulder, dir, side)=>{
      const elbow=shoulder.clone().addScaledVector(dir,0.55).add(V(0,-0.15,0));
      const wrist=shoulder.clone().addScaledVector(dir,1.0).add(V(0,-0.45,0));
      tube(shoulder, elbow, 0.145, 0.110, 7, P.flesh);
      tube(elbow, wrist, 0.108, 0.085, 7, P.fleshDk);
      const palm=wrist.clone();
      tube(palm, palm.clone().add(V(0,-0.06,0.06*side)), 0.082, 0.070, 6, P.flesh, {capB:{hex:P.ink,lift:0.01}});
      for(const [ox,oz] of [[-0.05,0.03],[0,0.05],[0.05,0.03],[0.03,-0.03]]){
        const fb=palm.clone().add(V(ox,-0.06,oz*side));
        const ft=fb.clone().add(V(ox*0.6,-0.14,oz*0.6*side));
        tube(fb, ft, 0.020, 0.010, 4, P.fleshDk, {capB:{hex:P.ink, lift:0.006}});
      }
    };
    ledgerHand(V(-0.78, baseY+1.30, 0.10), V(-0.35,-0.15,0.55).normalize(), -1);
    ledgerHand(V( 0.78, baseY+1.30, 0.10), V( 0.35,-0.15,0.55).normalize(),  1);
  }

  /* base disc (Huge: r=0.68) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.058,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.061,0), P.discTop);
  }
}
