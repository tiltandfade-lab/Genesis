/* dev/model-qa/creatures/rlm-the-noon-reckoning.js — The Noon Reckoning (frontier, Huge,
   CR 16). A towering gunslinger silhouette wreathed in heat-shimmer, duster whipped wide,
   twin oversized pistols held loose at the hips — a myth given a body, standing in for
   every noon duel ever lost. Whole-object grammar: one merged frame, no anchors. VS-
   desaturated dust-tan/heat-haze palette with faint orange shimmer-quads. NO eye quads —
   hat-brim shadow swallows the face entirely (no visible features). Huge size: base disc
   r=0.68.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheNoonReckoning(){
  const P = {
    duster:0x9a7f4e, dusterDk:0x6a5730, dusterLt:0xb69968,
    shimmer:0xc88c50, shimmerLt:0xdba468,
    hat:0x2e2820, hatBand:0x191510,
    void_:0x1a1611,
    gun:0x353128, gunLt:0x4d473c,
    disc:0x4a3f2c, discTop:0x584b36,
  };

  const L = { hipY:0.62, waistY:0.98, chestY:1.42, shldY:1.72, neckY:1.86, headY:2.14 };

  /* ---------- MASSIVE DUSTER TORSO — a towering, broad-shouldered body wrapped in a
     wind-whipped coat, flared dramatically wide at the base. ---------- */
  {
    const n=10, ph=Math.PI/10;
    const bands=[
      {y:L.hipY-0.14, rx:0.42, rz:0.34, hex:P.dusterDk},
      {y:L.hipY,      rx:0.34, rz:0.28, hex:P.duster},
      {y:L.waistY,    rx:0.30, rz:0.25, hex:P.duster},
      {y:L.chestY,    rx:0.37, rz:0.30, hex:P.dusterLt},
      {y:L.shldY,     rx:0.40, rz:0.32, hex:P.duster},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* dramatically wind-whipped coat skirts, asymmetric, flung to one side */
    quad(V(-0.42,L.hipY-0.14,0.10), V(0.42,L.hipY-0.14,0.10), V(0.70,0.10,0.34), V(-0.52,0.10,-0.10), P.dusterDk, 0.06);
    quad(V(-0.42,L.hipY-0.14,-0.14), V(0.42,L.hipY-0.14,-0.14), V(0.58,0.10,-0.42), V(-0.62,0.10,-0.18), P.dusterDk, 0.06);
  }

  /* ---------- HAT-SWALLOWED HEAD — the brim shadow is total; no face features at all,
     just a void beneath the hat-crown. ---------- */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:L.neckY,      rx:0.19, rz:0.17, hex:P.dusterDk},
      {y:L.headY-0.05, rx:0.21, rz:0.19, hex:P.void_},
      {y:L.headY+0.08, rx:0.18, rz:0.16, hex:P.void_},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* total dark void where the face should be */
    quad(V(-0.15,L.headY-0.04,0.16), V(0.15,L.headY-0.04,0.16), V(0.13,L.headY+0.10,0.15), V(-0.13,L.headY+0.10,0.15), P.void_, 0.02);

    const hb0 = ring(V(0,L.headY+0.16,0.0), V(0,1,0), 0.22,0.20, n, ph);
    const hb1 = ring(V(0,L.headY+0.30,0.0), V(0,1,0), 0.15,0.14,n, ph);
    stitch([hb0,hb1], ()=>P.hat);
    capFan(hb1, V(0,L.headY+0.44,0.0), P.hat);
    const brimN=12;
    for(let i=0;i<brimN;i++){
      const a=(i/brimN)*Math.PI*2, a2=((i+1)/brimN)*Math.PI*2;
      const rIn=0.225, rOut=0.42;
      const y0=L.headY+0.17 + Math.max(0,Math.cos(a))*0.05;
      const y1=L.headY+0.17 + Math.max(0,Math.cos(a2))*0.05;
      quad(V(Math.cos(a)*rIn, y0, Math.sin(a)*rIn-0.03), V(Math.cos(a)*rOut, y0-0.02, Math.sin(a)*rOut-0.03),
           V(Math.cos(a2)*rOut, y1-0.02, Math.sin(a2)*rOut-0.03), V(Math.cos(a2)*rIn, y1, Math.sin(a2)*rIn-0.03), P.hatBand, 0.05);
    }
  }

  /* ---------- HEAT-SHIMMER WREATH — faint orange shimmer quads rising off the shoulders
     and hat, wavering heat-haze around the towering silhouette. ---------- */
  {
    const wisps=[
      [-0.30,L.shldY+0.10,-0.10, -0.36,L.shldY+0.46,-0.16],
      [0.28,L.shldY+0.14,0.06,   0.34,L.shldY+0.50,0.10],
      [0.0,L.headY+0.40,-0.06,   0.06,L.headY+0.72,-0.10],
      [-0.10,L.chestY+0.30,0.14, -0.16,L.chestY+0.60,0.20],
    ];
    for(const [x0,y0,z0,x1,y1,z1] of wisps){
      tube(V(x0,y0,z0), V(x1,y1,z1), 0.06,0.015, 4, P.shimmer, {capB:{hex:P.shimmerLt}});
    }
  }

  /* ---------- ARMS — massive, holding twin oversized pistols loose at the hips,
     dead-still, waiting. ---------- */
  {
    const armAt=(sign)=>{
      const sh = V(sign*0.38, L.shldY-0.04, 0.0);
      const el = V(sign*0.48, L.waistY+0.10, 0.16);
      const wr = V(sign*0.42, L.hipY+0.06, 0.26);
      tube(sh, el, 0.115, 0.09, 7, P.duster, {capA:{hex:P.dusterDk}});
      tube(el, wr, 0.09, 0.068, 7, P.duster, {capB:{hex:P.dusterDk, lift:0.02}});
      /* oversized pistol, myth-scaled */
      const gGrip=V(sign*0.44, L.hipY, 0.24);
      const gBarrel=V(sign*0.44, L.hipY-0.30, 0.44);
      tube(gGrip, gBarrel, 0.06, 0.045, 6, P.gun, {capB:{hex:P.gunLt}});
    };
    armAt(-1); armAt(1);
  }

  /* ---------- LEGS — towering, planted wide and still, wrapped in coat-hem shadow. --- */
  {
    const legAt=(sign)=>{
      const hip=V(sign*0.20, 0.30, 0.0);
      const knee=V(sign*0.22, 0.14, 0.04);
      const foot=V(sign*0.22, 0.03, 0.10);
      tube(hip, knee, 0.155, 0.135, 7, P.dusterDk);
      tube(knee, foot, 0.135, 0.125, 7, P.hat, {capB:{hex:P.void_, lift:0.02}});
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
