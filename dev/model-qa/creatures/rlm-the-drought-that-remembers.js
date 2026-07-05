/* dev/model-qa/creatures/rlm-the-drought-that-remembers.js — THE DROUGHT THAT REMEMBERS
   (frontier, elemental colossus, Gargantuan, CR 15). Read: a towering heat-mirage colossus
   shaped like a dead cattle drive — a tall shimmering humanoid-ish silhouette built from
   sun-cracked earth and heat-haze, its bulk suggesting a bowed herd of skeletal cattle fused
   into one standing mass (ribbed flank-like ridges, a lowered skull-horned head, thin
   spindle "leg" columns). Frontier register: bone-dry cracked hardpan earth, dust rising
   off it, a shimmering heat-glow core. NO eye quads — hollow horned skull-face, no other
   face detail. Whole-object grammar: one function, one frame, no anchors. Gargantuan size,
   base disc r=0.72. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheDroughtThatRemembers(){
  /* ---------- PALETTE (VS desaturated; cracked hardpan earth + dusty heat-shimmer) ---------- */
  const P = {
    earth:0x8a744f, earthDk:0x5f4d34, earthLt:0xa8916a,
    crack:0x2c2318,
    bone:0xc2b48f, boneDk:0x8d8064,
    dust:0xb8a37e,
    heat:0xd9a24a, heatDk:0x8a5a24, heatCore:0xf2c878,
    horn:0x6b5a3c,
    disc:0x4a4038, discTop:0x585047,
  };

  const baseY = 0.20;
  const topY  = 2.9;

  /* ---------- MAIN COLUMN — a towering bowed-herd mass, tapering upward like fused cattle ---- */
  {
    const bands=[
      {y:baseY,       rx:0.62, rz:0.56, hex:P.earthDk},
      {y:baseY+0.4,   rx:0.68, rz:0.60, hex:P.earth},
      {y:baseY+0.9,   rx:0.62, rz:0.56, hex:P.earthLt},   /* ribbed bulge — fused shoulders */
      {y:baseY+1.4,   rx:0.50, rz:0.46, hex:P.earth},
      {y:baseY+1.9,   rx:0.38, rz:0.35, hex:P.earthDk},
      {y:baseY+2.3,   rx:0.26, rz:0.24, hex:P.earth},
      {y:topY-0.3,     rx:0.16, rz:0.15, hex:P.boneDk},
    ];
    const n=13, ph=Math.PI/n;
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,baseY-0.05,0), P.earthDk, true);
  }

  /* ---------- RIBBED FLANK RIDGES — dry cracked ridges suggesting fused cattle ribs ---------- */
  {
    const ridgeArc=(z0,z1,y0,y1,side)=>{
      const steps=5;
      for(let i=0;i<steps;i++){
        const t0=i/steps, t1=(i+1)/steps;
        const y_0=y0+(y1-y0)*t0, y_1=y0+(y1-y0)*t1;
        const bow=Math.sin(t0*Math.PI)*0.10, bow1=Math.sin(t1*Math.PI)*0.10;
        const x0=side*(0.60+bow), x1=side*(0.55+bow1);
        quad(V(x0-0.02,y_0,z0), V(x0+0.02,y_0,z0), V(x1+0.018,y_1,z1), V(x1-0.018,y_1,z1), P.earthDk, 0.05);
      }
    };
    for(const side of [-1,1]){
      ridgeArc(0.30,0.10, baseY+0.15, baseY+1.55, side);
      ridgeArc(-0.10,-0.30, baseY+0.15, baseY+1.55, side);
    }
    /* deep cracks running the surface, hardpan-earth read */
    const crackLine=(x0,z0,y0,y1,jit)=>{
      const steps=6; const pts=[];
      for(let i=0;i<=steps;i++){
        const t=i/steps, y=y0+(y1-y0)*t, j=(i%2?0.04:-0.04)*jit;
        pts.push(V(x0+j, y, z0+j*0.5));
      }
      for(let i=0;i<pts.length-1;i++){
        const a=pts[i], b=pts[i+1];
        quad(V(a.x-0.022,a.y,a.z-0.012), V(a.x+0.022,a.y,a.z+0.012), V(b.x+0.02,b.y,b.z+0.01), V(b.x-0.02,b.y,b.z-0.01), P.crack, 0.03);
      }
    };
    crackLine(0.30,0.40, baseY+0.2, topY-0.9, 1.0);
    crackLine(-0.42,0.20, baseY+0.5, topY-0.6, 1.2);
    crackLine(0.10,-0.50, baseY+0.3, baseY+1.7, 0.9);
  }

  /* ---------- HEAT-GLOW CORE — visible through a crack low on the mass, shimmer read ---------- */
  {
    const y0=baseY+0.30, y1=baseY+0.85;
    quad(V(0.30,y0,0.42), V(0.40,y0,0.36), V(0.26,y1,0.48), V(0.18,y1,0.54), P.heat, 0.05);
    quad(V(0.29,y0+0.05,0.41), V(0.36,y0+0.05,0.37), V(0.24,y1-0.05,0.46), V(0.20,y1-0.05,0.50), P.heatCore, 0.08);
  }

  /* ---------- HEAD — a lowered SKULL-HORNED head bowed forward, dead-drive read ---------- */
  {
    const hy = topY-0.28;
    const n=8, ph=Math.PI/n;
    const hbands=[
      {y:hy,        cz:0.02, rx:0.20, rz:0.24, hex:P.boneDk},
      {y:hy+0.10,   cz:0.06, rx:0.24, rz:0.26, hex:P.bone},
      {y:hy+0.20,   cz:0.02, rx:0.16, rz:0.18, hex:P.boneDk},
    ];
    const rings=hbands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>hbands[b].hex);
    capFan(rings.at(-1), V(0,hy+0.24,0.02), P.boneDk);
    /* muzzle/snout, bowed forward and down — the "dead cattle" head read */
    const snB=V(0,hy-0.02,0.20), snT=V(0,hy-0.10,0.36);
    tube(snB, snT, 0.14, 0.08, 7, P.bone, {capB:{hex:P.boneDk, lift:0.01}});
    /* hollow eye sockets — skull pits, no eye quads */
    for(const s of [-1,1]) quad(V(s*0.09,hy+0.08,0.18), V(s*0.09+s*0.03,hy+0.08,0.12),
                                 V(s*0.09+s*0.02,hy+0.02,0.10), V(s*0.09-s*0.01,hy+0.02,0.16), 0x0e0c08, 0.02);
    /* long curving horns, sweeping out and back — dead-drive longhorn read */
    for(const side of [-1,1]){
      const root=V(side*0.16, hy+0.16, 0.04);
      const mid =V(side*0.55, hy+0.28, -0.10);
      const tip =V(side*0.85, hy+0.20, -0.30);
      tube(root, mid, 0.055, 0.032, 6, P.horn);
      tube(mid, tip, 0.032, 0.010, 6, P.horn, {capB:{hex:P.horn, lift:0.006}});
    }
  }

  /* ---------- SPINDLE LEG-COLUMNS — thin bowed columns, herd-leg read, planted wide ---------- */
  {
    const legCol=(sx,sz,fx,fz)=>{
      const shoulder=V(sx, baseY+0.55, sz);
      const knee=V(sx*1.3, baseY+0.20, sz*1.2);
      const foot=V(fx, baseY-0.10, fz);
      tube(shoulder, knee, 0.18, 0.13, 7, P.earth);
      tube(knee, foot, 0.13, 0.10, 7, P.earthDk, {capB:{hex:P.earthDk, lift:0.02}});
    };
    legCol(-0.55,0.32, -0.78,0.46);
    legCol( 0.55,0.32,  0.78,0.46);
    legCol(-0.52,-0.36, -0.72,-0.50);
    legCol( 0.52,-0.36,  0.72,-0.50);
  }

  /* ---------- rising dust wisps off the base — remembered heat/haze detail ---------- */
  {
    const wisp=(ang,len,y0)=>{
      const dx=Math.cos(ang), dz=Math.sin(ang);
      const p0=V(dx*0.55, y0, dz*0.55);
      const p1=V(dx*(0.55+len*0.5), y0+len*0.6, dz*(0.55+len*0.5));
      const tip=V(dx*(0.55+len), y0+len*1.1, dz*(0.55+len));
      tube(p0,p1,0.05,0.03,5,P.dust);
      tube(p1,tip,0.03,0.006,5,P.dust,{capB:{hex:P.dust,lift:0.004}});
    };
    wisp(0.6,0.35,baseY+0.05); wisp(2.3,0.30,baseY+0.05); wisp(4.1,0.40,baseY+0.02); wisp(5.2,0.28,baseY+0.05);
  }

  /* base disc (Gargantuan: r=0.72) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.060,0), V(0,1,0), 0.70, 0.70, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.063,0), P.discTop);
  }
}
