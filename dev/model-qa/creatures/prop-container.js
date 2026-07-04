/* dev/model-qa/creatures/prop-container.js — the COVER CLUSTER: the most-placed combat prop, a
   huddle of dockside clutter a figure crouches behind. Whole-object grammar: one function, one
   geometry frame, no anchors. Three things arranged as one mass on a shared base disc:
     • a banded wooden CRATE (~0.55u cube) — the back-left bulk
     • a ring-hooped BARREL (~0.7u tall, standing) tucked beside it at back-right
     • a lumpy tied SACK (~0.35u blob, pinched neck) leaning at the FRONT, lowest — the near cover
   VS-desaturated wood + burlap. Reads at board distance as "stuff to hide behind," not one object.
   Imported by prop-container-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildContainers(){
  /* ---------- PALETTE (VS desaturated wood + hoop iron + burlap) ---------- */
  const P = {
    crate:0x6a4a2c, crateDk:0x4e371f, crateDkr:0x372615, crateLt:0x835f39, plank:0x5c4126,
    barrel:0x74532f, barrelDk:0x543a20, barrelLt:0x8a6740, stave:0x5a3f22,
    hoop:0x4a453e, hoopDk:0x2f2c27, hoopLt:0x5f5a50,
    sack:0x9a8a63, sackDk:0x6f6247, sackLt:0xb5a67e, tie:0x554832,
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ---------- LANDMARKS — three footprints on the disc, huddled toward back so the sack at front
     is the low near-cover. Crate back-left, barrel back-right, sack front-center-low. ---------- */
  const L = {
    crateCx:-0.21, crateCz:0.04, crateHalf:0.16, crateY0:0.055, crateY1:0.62,      // ~0.55u cube, front-LEFT so its corner reads
    barCx:0.21, barCz:-0.11, barR:0.155, barY0:0.05, barY1:0.72,                    // ~0.7u standing barrel, back-RIGHT
    sackCx:-0.02, sackCz:0.22,                                                       // sack leans forward, front-center-low
  };

  /* ===== CRATE — a banded wooden box. 8 corners → 5 outer faces (top capped, it's closed). Plank
     groove lines + two brass-less iron-dark corner straps per face so it reads as a nailed crate. == */
  {
    const bx=L.crateHalf, cx=L.crateCx, cz=L.crateCz, y0=L.crateY0, y1=L.crateY1;
    const bc=(sx,y,sz)=>V(cx+sx*bx, y, cz+(sz>0?bx:-bx));
    // FRONT (+z)
    quad(bc(-1,y0,1), bc(1,y0,1), bc(1,y1,1), bc(-1,y1,1), P.crate, 0.05);
    // BACK (−z)
    quad(bc(1,y0,-1), bc(-1,y0,-1), bc(-1,y1,-1), bc(1,y1,-1), P.crateDk, 0.05);
    // LEFT + RIGHT
    quad(bc(-1,y0,-1), bc(-1,y0,1), bc(-1,y1,1), bc(-1,y1,-1), P.crateDk, 0.05);
    quad(bc(1,y0,1), bc(1,y0,-1), bc(1,y1,-1), bc(1,y1,1), P.crateDk, 0.05);
    // TOP (closed lid) + BOTTOM
    quad(bc(-1,y1,-1), bc(1,y1,-1), bc(1,y1,1), bc(-1,y1,1), P.crateLt, 0.04);
    quad(bc(-1,y0,-1), bc(1,y0,-1), bc(1,y0,1), bc(-1,y0,1), P.crateDkr, 0.03);

    /* plank grooves — a vertical center seam on front + a horizontal mid-band (crate slat read) */
    quad(V(cx-0.012,y0,cz+bx+0.002), V(cx+0.012,y0,cz+bx+0.002), V(cx+0.012,y1,cz+bx+0.002), V(cx-0.012,y1,cz+bx+0.002), P.plank, 0.02);
    const mgy=(y0+y1)/2;
    quad(V(cx-bx,mgy-0.012,cz+bx+0.002), V(cx+bx,mgy-0.012,cz+bx+0.002), V(cx+bx,mgy+0.012,cz+bx+0.002), V(cx-bx,mgy+0.012,cz+bx+0.002), P.plank, 0.02);

    /* corner straps — thin dark iron quads hugging the two front vertical edges + top/bottom frame
       on the front face (nailed-crate tell). */
    for(const sx of [-1,1]){
      quad(V(cx+sx*bx-sx*0.028,y0,cz+bx+0.004), V(cx+sx*bx,y0,cz+bx+0.004),
           V(cx+sx*bx,y1,cz+bx+0.004), V(cx+sx*bx-sx*0.028,y1,cz+bx+0.004), P.crateDkr, 0.03);
    }
    // top + bottom horizontal straps on front
    for(const [sy] of [[y0+0.02],[y1-0.02]]){
      quad(V(cx-bx,sy-0.02,cz+bx+0.004), V(cx+bx,sy-0.02,cz+bx+0.004),
           V(cx+bx,sy+0.02,cz+bx+0.004), V(cx-bx,sy+0.02,cz+bx+0.004), P.crateDkr, 0.03);
    }
  }

  /* ===== BARREL — a standing bulged barrel: a loft of rings (narrow top/bottom, fat belly), with
     iron hoops (thin dark ring-bands) at top, belly, and bottom. Vertical stave grooves. ===== */
  {
    const cx=L.barCx, cz=L.barCz, R=L.barR, y0=L.barY0, y1=L.barY1;
    const belly=(y0+y1)/2;
    stack([
      {y:y0,        rx:R*0.80, cx, cz, hex:P.barrelDk},
      {y:y0+0.12,   rx:R*0.95, cx, cz, hex:P.barrel},
      {y:belly,     rx:R*1.02, cx, cz, hex:P.barrel},
      {y:y1-0.12,   rx:R*0.95, cx, cz, hex:P.barrel},
      {y:y1,        rx:R*0.80, cx, cz, hex:P.barrelLt},
    ], 10, {capTop:{hex:P.barrelLt, lift:0.01}, capBot:{hex:P.barrelDk, lift:0.0}});

    /* iron hoops — a thin proud ring-band at 3 heights. Build each as its own 2-ring stitch just
       outside the barrel surface. */
    const hoop=(hy, hr, hex)=>{
      const a=ring(V(cx,hy-0.022,cz), V(0,1,0), hr, hr, 10, Math.PI/10);
      const b=ring(V(cx,hy+0.022,cz), V(0,1,0), hr, hr, 10, Math.PI/10);
      stitch([a,b], ()=>hex);
    };
    hoop(y0+0.10, R*0.99, P.hoopDk);
    hoop(belly,   R*1.06, P.hoop);
    hoop(y1-0.09, R*0.99, P.hoopDk);

    /* vertical stave grooves — a few thin dark lines down the belly (barrel-stave read) */
    for(let k=0;k<10;k+=2){
      const t=Math.PI/10 + (k/10)*Math.PI*2;
      const gx=cx+Math.cos(t)*(R*1.02+0.004), gz=cz+Math.sin(t)*(R*1.02+0.004);
      quad(V(gx-0.008,y0+0.14,gz), V(gx+0.008,y0+0.14,gz), V(gx+0.008,y1-0.14,gz), V(gx-0.008,y1-0.14,gz), P.stave, 0.02);
    }
  }

  /* ===== SACK — a lumpy tied burlap sack leaning at the FRONT, lowest of the three so it is the
     near cover. A fat blob body, pinched into a narrow neck near the top, cinched with a dark tie,
     then a small gathered tuft above the tie. Tilted forward a touch toward the disc front. ===== */
  {
    const cx=L.sackCx, cz=L.sackCz;
    const bodyY=0.20, neckY=0.44, tuftY=0.50;
    // fat body blob (wider than tall, sits low)
    const body=blob(cx, bodyY, cz, 0.175, 0.19, 0.165, P.sack, 8, 5);
    // lump the body: nudge a couple of side rings out for an irregular sack read
    body.forEach((rg,k)=>{ if(k===2) rg.forEach((p,i)=>{ if(i%2===0){ const d=1.10; p.x=cx+(p.x-cx)*d; p.z=cz+(p.z-cz)*d; } }); });
    // lean the whole sack slightly forward (+z) and toward front — shift upper rings forward
    body.forEach((rg,k)=>{ const lean=(k/5)*0.05; rg.forEach(p=>{ p.z+=lean; }); });

    // pinched NECK — a couple of narrow rings above the body, cinched
    const neckLo=ring(V(cx,neckY-0.03,cz+0.05), V(0,1,0), 0.075, 0.07, 8, Math.PI/8);
    const neckHi=ring(V(cx,neckY+0.03,cz+0.06), V(0,1,0), 0.055, 0.05, 8, Math.PI/8);
    // stitch body top ring → neckLo → neckHi
    stitch([body.at(-1), neckLo, neckHi], (b)=> b===0?P.sackDk:P.sack);

    // the TIE — a dark cinch band at the pinch
    { const a=ring(V(cx,neckY-0.005,cz+0.055), V(0,1,0), 0.07, 0.065, 8, Math.PI/8);
      const b=ring(V(cx,neckY+0.025,cz+0.06), V(0,1,0), 0.05, 0.046, 8, Math.PI/8);
      stitch([a,b], ()=>P.tie); }

    // gathered TUFT above the tie (the twisted-off top of the sack)
    const tuft=blob(cx, tuftY+0.02, cz+0.07, 0.055, 0.05, 0.05, P.sackLt, 6, 3);
    tuft.forEach((rg,k)=>{ if(k>=2){ rg.forEach((p,i)=>{ if(i%2===0) p.y+=0.02; }); } });

    // a lit fold highlight down the front of the body
    quad(V(cx-0.03,bodyY-0.10,cz+0.17), V(cx+0.03,bodyY-0.10,cz+0.17),
         V(cx+0.025,bodyY+0.10,cz+0.18), V(cx-0.025,bodyY+0.10,cz+0.18), P.sackLt, 0.03);
  }

  /* base disc — Large piece (r=0.42). All three sit on it; the cluster huddles toward back-center. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
