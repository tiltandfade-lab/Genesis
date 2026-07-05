/* dev/model-qa/creatures/rlm-the-fallout-titan.js — THE FALLOUT TITAN (ash realm, Gargantuan,
   CR 16). Read: a mountain-scale mutation titan — the biggest humanoid silhouette on the board,
   a colossal hunched frame with a mutation-cracked hide split by glowing radiation fissures,
   asymmetric overgrown limbs (one arm massively oversized, warped by exposure), crude scrap-and-
   girder armor plates lashed on, a fused skull-crown of jutting bone growths. NO eye quads —
   glowing radiation-socket pits instead. Whole-object grammar: one function, one merged frame,
   no anchors. Gargantuan: base disc r=0.72, ~3.0u tall. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTheFalloutTitan(){
  /* ---------- PALETTE (VS-desaturated ash-cracked hide, glow-fissure orange, girder scrap-plate) --- */
  const P = {
    skin:0x716452, skinDk:0x4a4032, skinLt:0x87795f,
    crack:0x2c261c,                                    // dark mutation-crack lines
    glow:0xb3491f, glowDk:0x6c2c14, glowHot:0xd97a30,  // radiation fissure glow
    plate:0x565246, plateDk:0x38352b, plateLt:0x6c675a, // crude scrap/girder armor
    bone:0x8a8068, boneDk:0x5c5644,                    // fused skull-crown bone growths
    socket:0x0e0b08,
    disc:0x4a4438, discTop:0x585247,
  };

  /* ---------- LANDMARKS — GARGANTUAN, deeply hunched under its own mutated mass ---------- */
  const L = {
    hipY:1.30, gutY:1.50, waistY:1.68, ribY:1.94, chestY:2.16, shldY:2.36, neckY:2.44,
    jawY:2.54, cheekY:2.68, browY:2.82, crownY:2.94, headTopY:3.04,
  };
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.16);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — colossal hunched frame, mutation-cracked hide with glowing fissures ---------- */
  stack([
    {y:L.hipY,   rx:0.480, rz:0.430, hex:P.skinDk},
    {y:L.gutY,   rx:0.560, rz:0.540, hex:P.skin},
    {y:L.waistY, rx:0.550, rz:0.520, hex:P.skin},
    {y:L.ribY,   rx:0.500, rz:0.420, hex:P.skinDk},
    {y:L.chestY, rx:0.530, rz:0.390, hex:P.skinLt},
    {y:L.shldY,  rx:0.600, rz:0.420, hex:P.skin},
    {y:L.neckY,  rx:0.260, rz:0.250, hex:P.skinDk},
  ], 9, {xform:hunch, capTop:{hex:P.skinDk, lift:0.01}});

  /* mutation-cracked hide — dark crack lines spidering across the torso */
  for(const [ax,ay,az,bx,by,bz] of [
    [0.10,L.chestY+0.10,0.30, 0.24,L.gutY+0.02,0.40],
    [-0.16,L.ribY,0.24, -0.06,L.waistY-0.06,0.30],
    [0.02,L.shldY-0.06,0.20, 0.14,L.chestY-0.08,0.28],
  ]){
    quad(V(ax-0.012,ay,az), V(ax+0.012,ay,az), V(bx+0.010,by,bz), V(bx-0.010,by,bz), P.crack, 0.05);
  }
  /* glowing radiation fissures breaking through the cracked hide */
  for(const [x,y,z] of [[0.18,L.gutY+0.06,0.36],[-0.10,L.ribY-0.02,0.30],[0.04,L.waistY+0.04,0.34]]){
    quad(V(x-0.05,y,z), V(x+0.05,y,z), V(x+0.03,y+0.10,z+0.06), V(x-0.03,y+0.10,z+0.06), P.glowDk, 0.08);
    quad(V(x-0.024,y+0.01,z+0.01), V(x+0.024,y+0.01,z+0.01), V(x+0.014,y+0.06,z+0.05), V(x-0.014,y+0.06,z+0.05), P.glow, 0.05);
  }

  /* ---------- SCRAP/GIRDER ARMOR PLATES — crude, lashed on across the chest + shoulders ---------- */
  {
    quad(V(-0.34,L.chestY+0.14,0.28), V(0.10,L.chestY+0.10,0.30), V(0.04,L.waistY-0.02,0.36), V(-0.30,L.waistY+0.02,0.34), P.plate, 0.05);
    quad(V(-0.44,L.shldY,0.18), V(-0.20,L.shldY+0.02,0.24), V(-0.24,L.chestY-0.06,0.28), V(-0.46,L.chestY-0.08,0.22), P.plateDk, 0.05);
    /* a girder beam lashed diagonally across the back/shoulder */
    const g0=V(0.40,L.shldY+0.10,-0.10), g1=V(-0.10,L.ribY-0.10,-0.30);
    tube(g0,g1,0.05,0.045,6,P.plateLt);
  }

  /* ---------- HEAD — fused skull-crown of jutting bone growths, glowing radiation-socket pits ---- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   cz:0.03, rx:0.290, rz:0.280, hex:P.skinDk},
      {y:L.cheekY, cz:0.04, rx:0.310, rz:0.300, hex:P.skin},
      {y:L.browY,  cz:0.03, rx:0.270, rz:0.260, hex:P.skinLt},
      {y:L.crownY, cz:0.00, rx:0.220, rz:0.215, hex:P.boneDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY, 0.00), P.boneDk);
    /* fused skull-crown bone growths jutting from the crown */
    for(let i=0;i<5;i++){
      const ang=(i/5)*Math.PI*2;
      const cx=Math.cos(ang)*0.19, cz=Math.sin(ang)*0.18;
      const b=V(cx,L.crownY+0.02,cz), t=V(cx*1.3,L.crownY+0.24,cz*1.3);
      tube(b,t,0.04,0.010,5,P.bone,{capB:{hex:P.boneDk,lift:0.006}});
    }
    /* heavy jaw underslung */
    quad(V(-0.18,L.jawY-0.12,0.18), V(0.18,L.jawY-0.12,0.18), V(0.14,L.jawY-0.26,0.17), V(-0.14,L.jawY-0.26,0.17), P.skinDk, 0.05);
    /* glowing radiation-socket pits — recessed dark with a hot glow center (no eye quads) */
    for(const s of [-1,1]){
      quad(V(s*0.16-0.05,L.browY-0.02,0.24), V(s*0.16+0.05,L.browY-0.02,0.24),
           V(s*0.16+0.04,L.browY-0.11,0.23), V(s*0.16-0.04,L.browY-0.11,0.23), P.socket, 0.02);
      quad(V(s*0.16-0.025,L.browY-0.04,0.245), V(s*0.16+0.025,L.browY-0.04,0.245),
           V(s*0.16+0.018,L.browY-0.08,0.24), V(s*0.16-0.018,L.browY-0.08,0.24), P.glowHot, 0.0);
    }
  }

  /* ---------- ARMS — ASYMMETRIC: right massively oversized/warped, left roughly normal-giant ---- */
  {
    /* right arm — the mutated overgrowth, much bigger, jagged crack-glow along the forearm */
    {
      const sh = V(0.66, 2.28, 0.06);
      const el = V(0.86, 1.70, 0.20);
      const wr = V(0.78, 1.10, 0.36);
      tube(sh, el, 0.220, 0.250, 8, P.skin);
      tube(el, wr, 0.250, 0.290, 8, P.skinLt);
      blob(wr.x, wr.y-0.14, wr.z+0.05, 0.200, 0.170, 0.200, P.skinDk, 8, 5);
      /* crack-glow along the oversized forearm */
      quad(V(el.x-0.04,el.y-0.10,el.z+0.20), V(el.x+0.04,el.y-0.10,el.z+0.20), V(el.x+0.03,wr.y+0.10,wr.z+0.24), V(el.x-0.03,wr.y+0.10,wr.z+0.24), P.glow, 0.06);
    }
    /* left arm — smaller, roughly proportioned giant-arm */
    {
      const sh = V(-0.58, 2.24, 0.05);
      const el = V(-0.68, 1.78, 0.16);
      const wr = V(-0.62, 1.30, 0.28);
      tube(sh, el, 0.160, 0.175, 7, P.skinDk);
      tube(el, wr, 0.175, 0.150, 7, P.skin);
      blob(wr.x, wr.y-0.08, wr.z+0.03, 0.120, 0.105, 0.120, P.skinDk, 7, 4);
    }
  }

  /* ---------- LEGS — massive, planted wide, girder-scrap wrapped shins ---------- */
  {
    const legs=(hipX,scale)=>{
      const hip = V(hipX, L.hipY-0.08, 0.02);
      const knee = V(hipX*1.02, 0.72, 0.12);
      const foot = V(hipX*1.05, 0.06, 0.16);
      tube(hip, knee, 0.28*scale, 0.23*scale, 8, P.skinDk);
      tube(knee, foot, 0.23*scale, 0.20*scale, 8, P.skin, {capB:{hex:P.skinDk, lift:0.02}});
      quad(V(foot.x-0.16*scale,0.035,foot.z-0.10), V(foot.x+0.16*scale,0.035,foot.z-0.10), V(foot.x+0.13*scale,0.012,foot.z+0.20), V(foot.x-0.13*scale,0.012,foot.z+0.20), P.skinDk, 0.04);
      /* girder-scrap wrap band around the shin */
      const wb=ring(V(hipX*1.02,0.40,0.10), V(0,1,0), 0.22*scale, 0.21*scale, 7, Math.PI/7);
      const wb2=ring(V(hipX*1.02,0.35,0.10), V(0,1,0), 0.225*scale, 0.215*scale, 7, Math.PI/7);
      stitch([wb,wb2], ()=>P.plate);
    };
    legs(-0.33,1.0); legs(0.33,1.06);
  }

  /* ---------- base disc (Gargantuan: r=0.72) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.058,0), V(0,1,0), 0.70, 0.70, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.061,0), P.discTop);
  }
}
