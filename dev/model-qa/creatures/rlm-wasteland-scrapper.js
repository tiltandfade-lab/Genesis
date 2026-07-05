/* dev/model-qa/creatures/rlm-wasteland-scrapper.js — WASTELAND SCRAPPER (ash realm, Medium biped, CR 0.5).
   Read: a pipe-rifle warband lookout — gaunt scavenger in scrap-patched wraps, goggles, a long
   improvised pipe-rifle slung/held, bandolier of scrounged shells, rag-bound limbs. Whole-object
   grammar, one merged frame, no anchors. NO eye quads — dark goggle lenses (flat dark quads over
   the socket, not iris/pupil detail) read as gear, not anatomy. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildWastelandScrapper(){
  /* ---------- PALETTE (VS-desaturated ash-tan skin, scrap-rust gear, dust-grey wraps) ---------- */
  const P = {
    skin:0x8a7458, skinDk:0x695a44,
    wrap:0x6b6459, wrapDk:0x4c463d, wrapLt:0x7d7568,
    leather:0x4a3c2e, leatherDk:0x342a20,
    metal:0x5c5850, metalDk:0x38352f, metalLt:0x76726a, rust:0x6e4a30,
    goggle:0x2a2622, strap:0x3a342b,
    hair:0x2c2822, disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — upright biped, gaunt scavenger ~1.6u tall ---------- */
  const S = {
    hip:    V(0, 0.86, 0),
    waist:  V(0, 1.02, 0.01),
    chest:  V(0, 1.24, 0.00),
    shldr:  V(0, 1.40, -0.01),
    neck:   V(0, 1.48, 0.00),
    headB:  V(0, 1.54, 0.00),
    headT:  V(0, 1.72, -0.01),
  };

  /* ---------- TORSO — gaunt, wrap-bound scavenger frame ---------- */
  tube(S.hip,   S.waist, 0.155, 0.130, 8, P.wrap,    {phase:Math.PI/8, capA:{hex:P.wrapDk, lift:0.02}});
  tube(S.waist, S.chest, 0.130, 0.175, 8, P.leather, {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.175, 0.160, 8, P.wrap,    {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.160, 0.075, 8, P.wrapDk,  {phase:Math.PI/8});
  /* bandolier of scrounged shells diagonal across the chest */
  for(let i=0;i<5;i++){
    const t=i/4, y=1.36-t*0.24, z0=0.13-t*0.02;
    quad(V(-0.10+t*0.02,y,z0), V(-0.06+t*0.02,y,z0+0.02), V(-0.055+t*0.02,y-0.055,z0+0.02), V(-0.095+t*0.02,y-0.055,z0), P.rust, 0.06);
  }
  /* scrap-patch on the torso */
  quad(V(0.08,1.18,0.16), V(0.16,1.20,0.14), V(0.155,1.06,0.14), V(0.075,1.05,0.16), P.metal, 0.08);

  /* ---------- HEAD — gaunt face, dark goggles, ragged wrap cowl ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.55, cz:0.00, rx:0.095, rz:0.10, hex:P.skin},
      {y:1.62, cz:0.00, rx:0.100, rz:0.10, hex:P.skin},
      {y:1.69, cz:-0.01,rx:0.088, rz:0.09, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, 1.735, -0.01), P.wrapDk);

    /* ragged cowl wrap over the crown + trailing down the back */
    quad(V(-0.10,1.71,-0.06), V(0.10,1.71,-0.06), V(0.07,1.50,-0.10), V(-0.07,1.50,-0.10), P.wrapDk, 0.05);

    /* dark goggle lenses banding the eyes (gear, not eye quads — flat opaque lens plates + a strap) */
    quad(V(-0.10,1.615,0.085), V(0.10,1.615,0.085), V(0.095,1.565,0.09), V(-0.095,1.565,0.09), P.goggle, 0.03);
    quad(V(-0.10,1.60,0.08), V(-0.115,1.63,0.02), V(-0.115,1.60,0.00), V(-0.10,1.58,0.06), P.strap, 0.04);
    quad(V(0.10,1.60,0.08), V(0.115,1.63,0.02), V(0.115,1.60,0.00), V(0.10,1.58,0.06), P.strap, 0.04);

    /* gaunt jaw + rag mask over the lower face */
    quad(V(-0.075,1.565,0.075), V(0.075,1.565,0.075), V(0.065,1.505,0.08), V(-0.065,1.505,0.08), P.wrap, 0.05);
  }

  /* ---------- ARMS — one gripping a long pipe-rifle forward, the other steadying it ---------- */
  {
    const shL = V(-0.185, 1.375, 0.00), shR = V(0.185, 1.375, 0.00);
    const elL = V(-0.225, 1.16, 0.10), elR = V(0.20, 1.15, 0.14);
    const wrL = V(-0.16, 1.02, 0.28), wrR = V(0.12, 1.00, 0.34);
    tube(shL, elL, 0.062, 0.050, 6, P.wrap);
    tube(elL, wrL, 0.050, 0.038, 6, P.wrapLt, {capB:{hex:P.skinDk, lift:0.02}});
    tube(shR, elR, 0.062, 0.050, 6, P.wrap);
    tube(elR, wrR, 0.050, 0.038, 6, P.wrapLt, {capB:{hex:P.skinDk, lift:0.02}});

    /* ---------- PIPE-RIFLE — improvised long gun held forward, barrel + stock + wrap-grip ---------- */
    const stockB = V(-0.05, 0.94, 0.30);
    const grip   = V(0.02, 1.00, 0.35);
    const barrelB= V(0.05, 1.02, 0.38);
    const barrelT= V(0.14, 1.10, 0.78);
    tube(stockB, grip, 0.035, 0.028, 5, P.leatherDk);
    tube(grip, barrelB, 0.028, 0.032, 6, P.wrapDk);
    tube(barrelB, barrelT, 0.032, 0.022, 7, P.metalDk, {capB:{hex:P.metal, lift:0.01}});
    /* pipe fittings + rust bands down the barrel */
    for(let i=0;i<3;i++){
      const t=i/2, cx=0.05+t*0.09, cy=1.02+t*0.08, cz=0.38+t*0.40;
      quad(V(cx-0.03,cy,cz), V(cx+0.03,cy,cz), V(cx+0.028,cy+0.03,cz), V(cx-0.028,cy+0.03,cz), P.rust, 0.08);
    }
  }

  /* ---------- LEGS — rag-bound, wide scrap-boot stance ---------- */
  {
    const leg=(hipX, hex)=>{
      const hip  = V(hipX, 0.80, 0.00);
      const knee = V(hipX*1.05, 0.44, 0.03);
      const ankle= V(hipX*1.02, 0.14, 0.01);
      const foot = V(hipX*1.0, 0.03, 0.10);
      tube(hip, knee, 0.075, 0.058, 7, hex);
      tube(knee, ankle, 0.058, 0.044, 6, P.wrapDk);
      tube(ankle, foot, 0.050, 0.052, 5, P.leatherDk, {capB:{hex:P.leatherDk, lift:0.01}});
    };
    leg(-0.095, P.wrap);
    leg( 0.095, P.wrap);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
