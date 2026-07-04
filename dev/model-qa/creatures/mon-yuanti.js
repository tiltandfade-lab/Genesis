/* dev/model-qa/creatures/mon-yuanti.js — the YUAN-TI ABOMINATION (bespoke SERPENT-HUMANOID, Large).
   The bestiary yuan-ti-abomination: a human torso with arms, a serpent HEAD, and a long thick
   SNAKE TAIL coiled onto the disc in place of legs. The read: a upright naga-like abomination —
   torso rising off a heavy coiled tail-base, front of the coil rising to carry the torso, arms
   ending in clawed hands, a wedge serpent head with a flicking forked tongue. Green-and-bronze
   mottled scales, pale belly scales on the coil underside/throat. NO eye quads (dark socket
   recesses only). Whole-object grammar: one function, one merged geometry frame, no anchors.
   Large size: base disc r=0.55. Lifts the tube/ring/stitch/capFan patterns from mon-lizard.js
   (torso/head) and mon-snake.js (the coiled tail spiral). */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildYuanTiAbomination(){
  /* ---------- PALETTE (VS desaturated — mottled green-bronze scale, pale belly) ---------- */
  const P = {
    scale:0x5a6440, scaleDk:0x3d4530, scaleLt:0x707a4c,     // green scale, dark/light variants
    bronze:0x8a7648, bronzeDk:0x64542f,                      // bronze mottle patches
    belly:0x9e9670, bellyDk:0x7a7254,                        // pale belly/throat scales
    skin:0x6b6244, skinDk:0x4a4530,                          // humanoid torso/arm skin (scaled)
    head:0x565f3c, headDk:0x3a4128, socket:0x181410,
    mouth:0x231b16, tongue:0x8a3630,
    claw:0x201a14,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({ [P.scale]:'scale', [P.scaleDk]:'scale', [P.scaleLt]:'scale',
    [P.bronze]:'scale', [P.bronzeDk]:'scale', [P.belly]:'skin', [P.bellyDk]:'skin',
    [P.skin]:'skin', [P.skinDk]:'skin', [P.head]:'scale', [P.headDk]:'scale' });

  /* ---------- TAIL — a heavy coiled base (lifted from mon-snake.js's spiral), the front loop
     rising to become the torso base. Stays inside the r=0.55 disc footprint. ---------- */
  const path = [];
  const TAIL_R=0.020, MID_R=0.135, TOP_R=0.145;
  const SAMP=48, turns=1.6, rOuter=0.44, rInner=0.10;
  for(let i=0;i<=SAMP;i++){
    const f=i/SAMP;
    const ang = Math.PI*0.2 + f*turns*Math.PI*2;
    const rad = rOuter + (rInner-rOuter)*f;
    const thick = TAIL_R + (MID_R-TAIL_R)*Math.min(1, f*1.1);
    const climb = 0.06 + f*turns*0.05;
    path.push({p:V(Math.cos(ang)*rad, climb, Math.sin(ang)*rad), r:thick, t:f});
  }
  const rings=[];
  for(let i=0;i<path.length;i++){
    const cur=path[i], nxt=path[Math.min(i+1,path.length-1)].p, prv=path[Math.max(i-1,0)].p;
    const axis=new THREE.Vector3().subVectors(nxt,prv).normalize();
    rings.push(ring(cur.p, axis, cur.r*1.05, cur.r*0.92, 8, Math.PI/8));
  }
  stitch(rings, (b,i)=>{
    const band = Math.floor(path[b].t*14)%2===0;
    const rng=rings[b]; const ys=rng.map(v=>v.y); const minY=Math.min(...ys), maxY=Math.max(...ys);
    const isBelly = (rng[i].y-minY) < (maxY-minY)*0.3;
    if(isBelly) return band? P.bellyDk : P.belly;
    return band? P.bronze : P.scale;
  });
  capFan(rings[0], path[0].p.clone(), P.scaleDk, true);
  const coilTop = path[path.length-1].p;

  /* ---------- TORSO — rises off the coil top; human-shaped, tapering waist to broader chest. ---- */
  const waist  = V(coilTop.x*0.4, coilTop.y+0.06, coilTop.z*0.4 - 0.02);
  const belly2 = V(waist.x*0.5, waist.y+0.20, waist.z*0.5);
  const chest  = V(0, waist.y+0.42, -0.03);
  const shldrY = V(0, waist.y+0.58, -0.02);
  const neckB  = V(0, waist.y+0.66, 0.00);
  const headB  = V(0, waist.y+0.76, 0.03);
  tube(coilTop, waist, MID_R, 0.150, 8, P.scale,   {phase:Math.PI/8});
  tube(waist,  belly2, 0.150, 0.175, 8, P.bronze,  {phase:Math.PI/8});
  tube(belly2, chest,  0.175, 0.195, 8, P.skin,    {phase:Math.PI/8});
  tube(chest,  shldrY, 0.195, 0.205, 8, P.skinDk,  {phase:Math.PI/8});
  tube(shldrY, neckB,  0.205, 0.095, 8, P.scale,   {phase:Math.PI/8});
  tube(neckB,  headB,  0.095, 0.085, 8, P.scaleDk, {phase:Math.PI/8});
  /* pale belly-scale strip up the front of the torso (human chest, snake-belly texture) */
  {
    const bx=0.09;
    quad(V(-bx,belly2.y-0.05,belly2.z+0.14), V(bx,belly2.y-0.05,belly2.z+0.14),
         V(bx*0.8,chest.y+0.08,chest.z+0.16), V(-bx*0.8,chest.y+0.08,chest.z+0.16), P.belly, 0.05);
  }
  /* mottled bronze patches on the chest/shoulders */
  quad(V(-0.14,chest.y-0.02,chest.z-0.14), V(0.02,chest.y+0.06,chest.z-0.16),
       V(0.04,chest.y+0.22,chest.z-0.10), V(-0.12,chest.y+0.16,chest.z-0.08), P.bronzeDk, 0.06);

  /* ---------- HEAD — serpent wedge head, dark socket recesses, forked tongue. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:headB.y-0.02, cz:headB.z+0.02, rx:0.095, rz:0.100, hex:P.head},
      {y:headB.y+0.05, cz:headB.z+0.05, rx:0.108, rz:0.115, hex:P.head},
      {y:headB.y+0.10, cz:headB.z+0.03, rx:0.085, rz:0.088, hex:P.headDk},
    ];
    const hr=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(hr, b=>bands[b].hex);
    capFan(hr.at(-1), V(0,headB.y+0.13,headB.z+0.02), P.headDk);

    /* snout projecting forward+down */
    const snB=V(0,headB.y-0.02,headB.z+0.10), snM=V(0,headB.y-0.05,headB.z+0.22), snT=V(0,headB.y-0.07,headB.z+0.32);
    tube(snB, snM, 0.088, 0.062, n, P.head, {raz:0.075, rbz:0.048, phase:ph});
    tube(snM, snT, 0.062, 0.030, n, P.headDk, {raz:0.048, rbz:0.022, phase:ph, capB:{hex:P.mouth, lift:0.006}});

    /* dark socket recesses (NO eye quads — carved-in shape only) */
    for(const s of [-1,1]){
      const sc=V(s*0.062, headB.y+0.065, headB.z+0.06);
      quad(V(sc.x-0.018,sc.y+0.014,sc.z), V(sc.x+0.018,sc.y+0.014,sc.z),
           V(sc.x+0.014,sc.y-0.014,sc.z-0.012), V(sc.x-0.014,sc.y-0.014,sc.z-0.012), P.socket, 0.02);
    }
    /* mouth line + forked tongue */
    quad(V(-0.05,headB.y-0.075,headB.z+0.12), V(0.05,headB.y-0.075,headB.z+0.12),
         V(0.03,headB.y-0.085,headB.z+0.30), V(-0.03,headB.y-0.085,headB.z+0.30), P.mouth, 0.03);
    const tRoot=V(0,headB.y-0.085,headB.z+0.31), tMid=V(0,headB.y-0.09,headB.z+0.40);
    tube(tRoot, tMid, 0.012, 0.008, 4, P.tongue, {capA:{hex:P.mouth}});
    for(const s of [-1,1]) tube(tMid, V(s*0.024,headB.y-0.095,headB.z+0.47), 0.008, 0.003, 4, P.tongue, {capB:{hex:P.tongue}});
  }

  /* ---------- ARMS — human-ish, ending in clawed hands. ---------- */
  {
    const armSide=(sx)=>{
      const sh = V(sx*0.20, shldrY.y-0.02, shldrY.z-0.01);
      const el  = V(sx*0.30, shldrY.y-0.20, shldrY.z+0.08);
      const wr  = V(sx*0.30, shldrY.y-0.38, shldrY.z+0.14);
      tube(sh, el, 0.062, 0.050, 7, P.skin,   {capA:{hex:P.skinDk, lift:0.01}});
      tube(el, wr, 0.050, 0.038, 7, P.skinDk);
      /* clawed hand — a small pad + 3 splayed claws */
      const pad = V(wr.x, wr.y-0.02, wr.z+0.02);
      for(const d of [[-0.03,0.04],[0,0.05],[0.03,0.04]]){
        const cb=V(pad.x+d[0]*0.3, pad.y, pad.z);
        const ct=V(pad.x+d[0], pad.y-0.05, pad.z+d[1]);
        tube(cb, ct, 0.014, 0.004, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    armSide(-1); armSide(1);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
