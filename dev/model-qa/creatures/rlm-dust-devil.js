/* dev/model-qa/creatures/rlm-dust-devil.js — Dust Devil (frontier, Medium, CR 1).
   A churning funnel of sand and static, its base a wide swirling skirt narrowing up into a
   striking-snake silhouette that hooks forward at the top — a coiled, poised strike frozen mid-
   lunge. Whole-object grammar: one merged frame, no anchors. VS-desaturated dust palette (ochre/
   tan/rust grit, pale static-white sparks). NO eye quads — no face, just a dark maw-void where a
   snake head would gape. Medium size: base disc r=0.42.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildDustDevil(){
  const P = {
    dust:0x8a744c, dustDk:0x5e4e32, dustLt:0xa8916a,
    rust:0x7a5230, rustDk:0x4e341f,
    spark:0xd8cfa8, sparkDk:0xb0a482,
    void_:0x241f16,
    disc:0x4a3f2c, discTop:0x584b36,
  };

  /* ---------- LANDMARKS — a swirling funnel from a wide low skirt up to a hooked striking
     "head" at the top, curved forward like a snake mid-lunge. ---------- */
  const S = {
    skirt:  V(0, 0.06, 0),
    low:    V(0.02, 0.30, -0.02),
    mid:    V(0.05, 0.56, -0.03),
    neck:   V(0.10, 0.80, -0.02),
    hook:   V(0.20, 0.94, 0.06),
    headB:  V(0.30, 0.90, 0.20),
    snout:  V(0.38, 0.84, 0.34),
  };

  /* ---------- FUNNEL BODY — a tall twisting loft, wide at the base, narrowing then hooking
     forward — the striking-snake silhouette. ---------- */
  {
    const n=9;
    const bands=[
      {p:S.skirt, rx:0.42, rz:0.42, hex:P.dustDk, ph:0},
      {p:S.low,   rx:0.30, rz:0.30, hex:P.dust,   ph:Math.PI/6},
      {p:S.mid,   rx:0.20, rz:0.20, hex:P.dustLt, ph:Math.PI/3},
      {p:S.neck,  rx:0.135,rz:0.135,hex:P.dust,   ph:Math.PI/2},
      {p:S.hook,  rx:0.105,rz:0.105,hex:P.rust,   ph:2*Math.PI/3},
    ];
    const rings=bands.map(b=>ring(b.p, V(0,1,0), b.rx, b.rz, n, b.ph));
    stitch(rings, b=>bands[b].hex);
  }

  /* ---------- HOOKED HEAD — the funnel curls forward and down into a blunt snake-strike
     head, jaw gaping into a dark dust-void (no eyes, no face — just void and grit). ---------- */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:S.headB.y+0.03, cz:S.headB.z, cx:S.headB.x, rx:0.105, rz:0.11, hex:P.rust},
      {y:S.headB.y-0.03, cz:S.headB.z+0.10, cx:S.headB.x+0.05, rx:0.095,rz:0.10, hex:P.rustDk},
    ];
    const rings=bands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* blunt open-jaw void at the snout tip */
    const jT = V(S.snout.x, S.snout.y+0.03, S.snout.z);
    const jB = V(S.snout.x+0.02, S.snout.y-0.09, S.snout.z+0.03);
    quad(V(jT.x-0.06,jT.y,jT.z), V(jT.x+0.06,jT.y,jT.z), V(jB.x+0.05,jB.y,jB.z), V(jB.x-0.05,jB.y,jB.z), P.void_, 0.04);
    capFan(rings.at(-1), V(S.snout.x, S.snout.y-0.02, S.snout.z), P.rustDk);
    /* grit streaks trailing off the jaw like blown sand */
    for(const [dx,dy,dz] of [[0.10,0.02,0.14],[0.14,-0.04,0.10],[0.08,-0.08,0.16]]){
      tube(V(S.snout.x,S.snout.y-0.02,S.snout.z), V(S.snout.x+dx,S.snout.y+dy,S.snout.z+dz), 0.02,0.004, 4, P.dustLt);
    }
  }

  /* ---------- SWIRLING SKIRT-BASE — ragged trailing dust streamers spiraling out from the
     wide base, the "funnel touching ground" read. ---------- */
  {
    const arms=6;
    for(let i=0;i<arms;i++){
      const a = (i/arms)*Math.PI*2;
      const r0 = 0.40, r1 = 0.58;
      const p0 = V(Math.cos(a)*r0, 0.08, Math.sin(a)*r0);
      const p1 = V(Math.cos(a+0.6)*r1, 0.18, Math.sin(a+0.6)*r1);
      tube(p0, p1, 0.05, 0.012, 4, (i%2)?P.dust:P.dustDk, {capB:{hex:P.dustLt, lift:0.01}});
    }
  }

  /* ---------- STATIC SPARKS — small pale quad flecks scattered up the funnel (the "static"
     of the name), never paired like eyes. ---------- */
  {
    const flecks=[[0.06,0.42,0.02],[-0.08,0.60,0.06],[0.12,0.72,-0.02],[-0.04,0.28,-0.10],[0.16,0.86,0.10]];
    for(const [fx,fy,fz] of flecks){
      quad(V(fx-0.014,fy-0.010,fz), V(fx+0.014,fy-0.010,fz), V(fx+0.010,fy+0.012,fz), V(fx-0.010,fy+0.012,fz), P.spark, 0.08);
    }
  }

  /* ---------- twisting dorsal ridge of rust-dark grit climbing the funnel spine (adds
     silhouette read beyond a plain cone) ---------- */
  {
    const seg=[[0,0.10,0.40],[0.03,0.34,0.28],[0.06,0.58,0.16],[0.10,0.80,0.02]];
    for(let i=0;i<seg.length-1;i++){
      const [x0,y0,z0]=seg[i], [x1,y1,z1]=seg[i+1];
      quad(V(x0-0.02,y0,z0-0.02), V(x0+0.02,y0,z0+0.02), V(x1+0.016,y1,z1+0.016), V(x1-0.016,y1,z1-0.016), P.rustDk, 0.05);
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
