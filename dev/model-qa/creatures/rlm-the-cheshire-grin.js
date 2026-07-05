/* dev/model-qa/creatures/rlm-the-cheshire-grin.js — THE CHESHIRE GRIN (bright-kingdom, Medium,
   CR 2). A striped cat dissolving into mist, grin the last visible feature. Read: a low
   quadruped cat silhouette built from broken, dissolving mist-wisp bands instead of solid form —
   striped patches float apart with visible gaps toward the tail/hindquarters, the head stays
   most solid, and a single oversized wide GRIN (a curved toothy band) is the last, brightest,
   most solid feature — floating slightly independent even where the jaw has begun to fade.
   No eye quads (the grin reads without eyes; faint dissolving socket wisps only). Whole-object
   grammar, one merged frame, no anchors. Medium disc r=0.42 (mist-thin, barely-there disc). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheCheshireGrin(){
  const P = {
    stripe:0x8a7f9c, stripeDk:0x5e5470, stripeLt:0xaba0bf,   // desaturated lilac-grey mist-cat stripes
    mist:0x9992a8, mistPale:0xc4bdd4, mistDeep:0x453d54,
    grin:0xe7ded0, grinDk:0xb0a68f, tooth:0xf2ead9,
    disc:0x453f52, discTop:0x534c66,
  };

  const spY = 0.34;
  /* ---------- BODY — low quadruped cat spine, but authored as broken dissolving bands: solid
     near the head, patchy/gapped toward the tail (leaving visible gaps = dissolving into mist). */
  const S = {
    rump:  V(0, spY+0.02, -0.30),
    loin:  V(0, spY+0.04, -0.10),
    mid:   V(0, spY+0.05,  0.10),
    shldr: V(0, spY+0.03,  0.28),
    neck:  V(0, spY+0.00,  0.42),
    headB: V(0, spY-0.02,  0.52),
  };
  tube(S.rump,  S.loin,  0.130, 0.150, 8, P.stripeDk, {phase:Math.PI/8});
  // gap here — hindquarters partly dissolved (no tube loin->mid on one side; author a thinner ghost pass)
  tube(S.loin,  S.mid,   0.150, 0.160, 8, P.mist,     {phase:Math.PI/8, capA:{hex:P.mistDeep}});
  tube(S.mid,   S.shldr, 0.160, 0.140, 8, P.stripe,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.140, 0.100, 8, P.stripeLt, {phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.100, 0.085, 8, P.stripe,   {phase:Math.PI/8});
  // floating stripe patches breaking off the flank (dissolving read — detached quads, small gaps)
  {
    const patches=[[-0.20,spY+0.10,-0.22],[0.19,spY+0.14,-0.06],[-0.16,spY+0.18,0.06],[0.22,spY+0.06,-0.34]];
    for(const [x,y,z] of patches){
      quad(V(x-0.05,y,z), V(x+0.05,y,z), V(x+0.04,y-0.09,z+0.03), V(x-0.04,y-0.09,z+0.03), P.stripeDk, 0.08);
    }
  }
  // wispy wide-set mist tendrils standing in for hind legs (barely-there, not solid limbs)
  {
    const wisp=(bx,bz)=>{
      const b=V(bx, spY-0.05, bz), m=V(bx*1.3, spY-0.16, bz+0.02), t=V(bx*1.6, 0.02, bz+0.05);
      tube(b, m, 0.05, 0.03, 5, P.mist);
      tube(m, t, 0.03, 0.006, 5, P.mistPale, {capB:{hex:P.mistPale, lift:0.004}});
    };
    wisp(-0.13,-0.28); wisp(0.13,-0.30);
    // front legs a bit more solid (closer to the still-forming head end)
    const frontLeg=(bx,bz)=>{
      const b=V(bx, spY-0.02, bz), m=V(bx*1.1, spY-0.14, bz+0.03), t=V(bx*1.15, 0.03, bz+0.04);
      tube(b, m, 0.055, 0.036, 6, P.stripe);
      tube(m, t, 0.036, 0.018, 6, P.stripeDk, {capB:{hex:P.stripeDk, lift:0.006}});
    };
    frontLeg(-0.11,0.24); frontLeg(0.11,0.22);
  }
  // dissolving tail — a thin trailing wisp fading to nothing, mist tip with no solid cap
  {
    const t0=V(0,spY+0.06,-0.30), t1=V(0.10,spY+0.16,-0.52), t2=V(0.18,spY+0.24,-0.70), tip=V(0.24,spY+0.30,-0.84);
    tube(t0,t1,0.05,0.03,6,P.stripeDk);
    tube(t1,t2,0.03,0.014,6,P.mist);
    tube(t2,tip,0.014,0.002,6,P.mistPale);
  }

  /* ---------- HEAD — most solid part of the cat (last to dissolve besides the grin). ------------ */
  {
    const n=9, ph=Math.PI/n;
    const hb=[
      {y:spY-0.02, cz:0.52, rx:0.115, rz:0.120, hex:P.stripe},
      {y:spY+0.10, cz:0.55, rx:0.125, rz:0.118, hex:P.stripeLt},
      {y:spY+0.20, cz:0.50, rx:0.095, rz:0.098, hex:P.stripe},
    ];
    const rings = hb.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>hb[b].hex);
    capFan(rings.at(-1), V(0, spY+0.22, 0.50), P.stripe);

    // faint dissolving socket wisps (no eye quads) — barely-there, mist-toned
    for(const s of [-1,1]){
      const sx=s*0.055, sy=spY+0.13, sz=0.60;
      quad(V(sx-0.016,sy+0.012,sz), V(sx+0.016,sy+0.012,sz), V(sx+0.013,sy-0.012,sz+0.004), V(sx-0.013,sy-0.012,sz+0.004), P.mistDeep, 0.05);
    }

    // pointed cat ears, tips already thinning to mist
    for(const s of [-1,1]){
      const eb=V(s*0.06, spY+0.22, 0.44), et=V(s*0.11, spY+0.42, 0.40);
      tube(eb, et, 0.045, 0.006, 6, P.stripe, {capB:{hex:P.mistPale, lift:0.006}});
    }

    /* THE GRIN — an oversized, wide, curved toothy band: the last, brightest, most solid feature,
       floating slightly forward/independent of the fading jawline beneath it. */
    const gc = V(0, spY-0.01, 0.62);
    const gArc=[];
    const half=0.115, n2=7;
    for(let i=0;i<=n2;i++){
      const t=i/n2, ang=(t-0.5)*Math.PI*0.92;
      gArc.push(V(Math.sin(ang)*half, gc.y - Math.cos(ang)*0.05, gc.z + Math.cos(ang)*0.02));
    }
    for(let i=0;i<gArc.length-1;i++){
      const p0=gArc[i], p1=gArc[i+1];
      quad(V(p0.x,p0.y+0.028,p0.z), V(p1.x,p1.y+0.028,p1.z), V(p1.x,p1.y-0.024,p1.z-0.01), V(p0.x,p0.y-0.024,p0.z-0.01), P.grin, 0.04);
      // teeth serration along the lower edge
      const mx=(p0.x+p1.x)/2, mz=(p0.z+p1.z)/2, my=(p0.y+p1.y)/2;
      quad(V(mx-0.012,my-0.024,mz-0.01), V(mx+0.012,my-0.024,mz-0.01), V(mx,my-0.044,mz-0.005), V(mx,my-0.044,mz-0.005), P.tooth, 0.03);
    }
    // grin floats a hair forward of the (fading) jaw — a thin dark line behind it for depth
    quad(V(-0.10,gc.y-0.01,gc.z-0.03), V(0.10,gc.y-0.01,gc.z-0.03), V(0.08,gc.y-0.03,gc.z-0.03), V(-0.08,gc.y-0.03,gc.z-0.03), P.grinDk, 0.05);
  }

  /* ---------- base disc (Medium: r=0.42 — thin, mist-toned, barely-there) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.014,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.016,0), P.discTop, true);
  }
}
