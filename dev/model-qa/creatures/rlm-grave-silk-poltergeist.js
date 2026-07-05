/* dev/model-qa/creatures/rlm-grave-silk-poltergeist.js — the GRAVE-SILK POLTERGEIST (lost-world,
   Medium undead, CR 2). A shrouded, tattered funeral-silk form hovering just off the ground,
   hurling funerary urns at intruders. Whole-object grammar: one function, one frame, no anchors.
   NO body beneath the shroud — the read is a floating tattered silk cocoon with a hollow dark
   void where a face should be, tapering to trailing ragged silk streamers below (no legs — it
   hovers). Two urns are mid-throw, orbiting/gripped in silk-wrapped limb-hints. Palette: pale
   grave-silk (bone-white gone grey with age), darker interior void, pale terracotta urns.
   Lost-world register: tomb-dust rather than gothic-horror black. Medium size, base disc r=0.42
   (the disc reads as the shadow it casts, since the figure hovers above it). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGraveSilkPoltergeist(){
  /* ---------- PALETTE (pale aged grave-silk; dark hollow void; pale terracotta urns) ---------- */
  const P = {
    silk:0x9a927a, silkDk:0x6f6851, silkLt:0xb6ad8e,
    voidC:0x18140f, voidDk:0x0e0b08,
    urn:0xa8886a, urnDk:0x7a6048, urnLt:0xc0a284,
    disc:0x453d2e, discTop:0x554c37,
  };

  const hoverY = 0.42;   // the whole figure floats — everything is offset up from the ground

  /* ===== THE SHROUD BODY — a tapered silk cocoon, wide at the "shoulders", narrowing down.
     Built as a hand-banded loft (not stack()) so we can flare + billow individual bands. ===== */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:hoverY+0.02, rx:0.14, rz:0.13, hex:P.silkDk},   // lower cocoon, tapering
      {y:hoverY+0.16, rx:0.20, rz:0.19, hex:P.silk},
      {y:hoverY+0.32, rx:0.24, rz:0.22, hex:P.silkLt},   // widest at "shoulders"
      {y:hoverY+0.46, rx:0.18, rz:0.17, hex:P.silk},      // draws in toward the hood
    ];
    const rings=bands.map((b,bi)=>{
      const rg=ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph);
      // billow: nudge alternating verts out for a wind-caught, non-uniform silk read
      rg.forEach((p,i)=>{ const w=Math.sin(i*1.9+bi)*0.02; p.x+=w; p.z+=Math.cos(i*1.3+bi)*0.018; });
      return rg;
    });
    stitch(rings, b=>bands[b].hex);
    /* hood cap — dips down over the void so the "face" reads sunken under silk */
    capFan(rings.at(-1), V(0,hoverY+0.56,0.0), P.silkLt);
  }

  /* ===== THE HOLLOW VOID — a dark hollow visible where a face should be, deep in the hood gap === */
  {
    const hy=hoverY+0.36, hz=0.12;
    quad(V(-0.08,hy+0.06,hz), V(0.08,hy+0.06,hz), V(0.06,hy-0.10,hz-0.02), V(-0.06,hy-0.10,hz-0.02), P.voidC, 0.0);
    /* deeper darker core within */
    quad(V(-0.045,hy+0.02,hz-0.01), V(0.045,hy+0.02,hz-0.01), V(0.035,hy-0.06,hz-0.02), V(-0.035,hy-0.06,hz-0.02), P.voidDk, 0.0);
  }

  /* ===== TRAILING RAGGED SILK STREAMERS — no legs; instead uneven torn strips hang and taper
     below the cocoon, some longer, catching an unseen wind, never quite touching the ground. ===== */
  {
    const n=8, ph=Math.PI/n;
    const hemY=[0.18,0.10,0.22,0.06,0.16,0.02,0.20,0.08].map(v=>v+0.0);
    const top=ring(V(0,hoverY+0.02,0), V(0,1,0), 0.135, 0.125, n, ph);
    for(let i=0;i<n;i++){
      const i2=(i+1)%n, t=ph+(i/n)*Math.PI*2, t2=ph+(i2/n)*Math.PI*2;
      const rx=0.10, rz=0.09;
      const hem0=V(Math.cos(t)*rx*0.6, hemY[i], Math.sin(t)*rz*0.6);
      const hem1=V(Math.cos(t2)*rx*0.6, hemY[i2], Math.sin(t2)*rz*0.6);
      quad(top[i], top[i2], hem1, hem0, i&1?P.silk:P.silkDk, 0.07);
    }
    /* a couple of longer trailing streamer strips, clearly not touching down */
    for(const i of [1,5]){
      const t=ph+(i/n)*Math.PI*2;
      const a=V(Math.cos(t)*0.06, hemY[i], Math.sin(t)*0.05);
      tube(a, a.clone().add(V(Math.cos(t)*0.03,-0.055,Math.sin(t)*0.03)), 0.022,0.008,4,P.silkDk,{capB:{hex:P.silkDk}});
    }
  }

  /* ===== SILK-WRAPPED LIMB-HINTS — two bare wrapped "arm" tendrils reaching from within the
     shroud, each gripping a funerary urn mid-throw (the tell detail). ===== */
  {
    const arm=(sx, tipOff)=>{
      const S=V(sx*0.18, hoverY+0.30, 0.02);
      const E=V(sx*0.30, hoverY+0.22, 0.16);
      const W=E.clone().add(tipOff);
      tube(S,E,0.036,0.028,5,P.silk); tube(E,W,0.028,0.020,5,P.silkDk,{capB:{hex:P.silkDk}});
      return W;
    };
    const w1 = arm(1, V(0.10,0.02,0.10));
    const w2 = arm(-1, V(-0.06,-0.06,0.14));

    const urn=(c, r, h, hex)=>{
      const b=ring(V(c.x,c.y-h*0.4,c.z), V(0,1,0), r*0.7, r*0.7, 6, 0);
      const mid=ring(V(c.x,c.y,c.z), V(0,1,0), r, r, 6, 0);
      const top=ring(V(c.x,c.y+h*0.4,c.z), V(0,1,0), r*0.55, r*0.55, 6, 0);
      stitch([b,mid,top], (i)=> i===0?P.urnDk:P.urn);
      capFan(top, V(c.x,c.y+h*0.5,c.z), P.urnLt);
      capFan(b, V(c.x,c.y-h*0.5,c.z), P.urnDk, true);
    };
    urn(w1.clone().add(V(0.02,0.04,0.02)), 0.06, 0.11, P.urn);
    urn(w2.clone().add(V(-0.02,0.03,0.02)), 0.05, 0.09, P.urnDk);
  }

  /* ---------- base disc (Medium: r=0.42 — reads as the shadow beneath the hovering figure) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
