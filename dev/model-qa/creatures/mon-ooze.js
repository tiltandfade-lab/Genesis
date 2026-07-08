/* dev/model-qa/creatures/mon-ooze.js — the ooze landmark table (AMORPHOUS family, MODEL-FOUNDRY rebuild).
   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Registry keeps the 0.78-opacity translucent read (src/ui/theater-figures.js) — this
   file only authors geometry/color, never opacity.

   FEATURE CHECKLIST (the budget buys):
     1. Low spreading main mass — a wide wet mound, footprint overflowing the disc, several
        overlapping lobes so the base silhouette reads liquid, not a dome.
     2. SIGNATURE — ONE tall pseudopod reared up and arced forward, cresting like a wave about
        to break: thick wet root at the mass, tapering column curling up+forward, a rounded
        lip tip that leans back over the leading edge (the "about to break" beat).
     3. Half-engulfed pale BONE (skull + rib pair) breaking the mass surface on the front-right
        flank — the high-value zone inside a translucent body (Adam's named signature, kept).
     4. Trailing/reaching pseudopod lobes at the base overlapping the disc edge (the mass mid-
        flow, not static).
     5. Wet sheen highlights on the crest tip + crown + flanks (value contrast — the reared
        pseudopod carries the brightest read so the eye goes there first).

   POSE SENTENCE: mid-flow attack — the main body stays low and spread across the ground, while
   one thick lobe has reared up off the mass and arced forward overhead, curling at the top like
   a wave cresting the instant before it breaks over whatever is in front of it.
*/
import { THREE, V, quad, tube, blob, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildOoze(){
  /* ---------- PALETTE (kept from the prior pass — VS desaturated wet GREY, de-blued so it
     doesn't read slate-blue at board light; the engulfed bone stays, Adam likes it). ---------- */
  const P = {
    core:0x353738,      /* darkest — deep translucent center / undersides */
    body:0x565859,      /* mid mass */
    rim:0x83817d,       /* lighter spreading rim — wet film catching light */
    sheenLt:0xa7a6a1,   /* glisten highlights */
    lobe:0x6c6a65, lobeDk:0x3e3e3c,   /* r2 critic bump: lobe was reading disc-tone-on-disc-tone (law 3), pushed lighter */
    crest:0x9c9a92, crestLt:0xd2d0c6,  /* the reared pseudopod — pushed lighter still (round-1 self-correct: tip read too close in value to the mass), it's the signature */
    bone:0xcabfa2, boneDk:0x9a8f76, boneWet:0x6a6e5f,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- MAIN MASS — low wide mound, kept LOW (crown ~0.34) so the reared pseudopod owns
     the tall silhouette. Manually banded core→rim like before, but flatter/wider. ---------- */
  {
    const n=10;
    const bands = [
      {y:0.02, r:0.44, rz:0.42, hex:P.core},
      {y:0.11, r:0.47, rz:0.45, hex:P.body},
      {y:0.20, r:0.42, rz:0.39, hex:P.body},
      {y:0.28, r:0.32, rz:0.30, hex:P.rim},
      {y:0.34, r:0.18, rz:0.17, hex:P.rim},
    ];
    const rings = bands.map(b => ring(V(0,b.y,0), V(0,1,0), b.r, b.rz, n, Math.PI/n));
    rings[1].forEach((p,i)=>{ p.x += Math.sin(i*1.7)*0.03; p.z += Math.cos(i*2.3)*0.03; });
    rings[2].forEach((p,i)=>{ p.x += Math.sin(i*2.1)*0.025; p.z += Math.cos(i*1.4)*0.02; });
    rings[3].forEach((p,i)=>{ p.x += Math.sin(i*1.1)*0.02; });
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(-0.05,0.30,-0.10), P.rim);   /* low crown cap, off toward the pseudopod's ROOT (kept dark — value goes up top) */
  }

  /* ---------- SIGNATURE — the reared, cresting pseudopod. Rooted in the mass toward the front-
     left, rises and arcs forward (+z), tapering, then curls the last band back over the top
     (the "wave about to break" beat) before a small pale-lipped tip. Value ladder rises with
     height so the crest reads brightest against the void. ---------- */
  {
    const n=8;
    const bands = [
      {y:0.06, cx:-0.14, cz:-0.16, rx:0.20, rz:0.20, hex:P.body},   /* thick wet root, blends into mass */
      {y:0.30, cx:-0.10, cz:-0.06, rx:0.175,rz:0.175,hex:P.body},
      {y:0.56, cx:-0.05, cz: 0.08, rx:0.150,rz:0.150,hex:P.rim},
      {y:0.80, cx: 0.02, cz: 0.26, rx:0.125,rz:0.125,hex:P.crest}, /* value ladder starts climbing a band earlier */
      {y:1.00, cx: 0.06, cz: 0.44, rx:0.100,rz:0.105,hex:P.crest}, /* leaning forward, arc steepening */
      {y:1.12, cx: 0.02, cz: 0.60, rx:0.080,rz:0.088,hex:P.crest}, /* curling OVER at the top — cz still climbing, y flattening */
      {y:1.14, cx:-0.08, cz: 0.72, rx:0.058,rz:0.066,hex:P.crestLt}, /* the tip, arced past vertical — "about to break" */
    ];
    const rings = stack(bands, n, { capTop:{ hex:P.sheenLt, lift:0.03 } });
    /* asymmetric slump on the mid bands so the column isn't a lathe-perfect cylinder */
    rings[2].forEach((p,i)=>{ p.x += Math.sin(i*1.9)*0.012; });
    rings[4].forEach((p,i)=>{ p.z += Math.cos(i*1.3)*0.010; });
  }

  /* ---------- PSEUDOPOD LOBES — reaching/trailing at the base, overlapping the disc edge, the
     mass mid-flow rather than static. ---------- */
  const lobes = [
    {cx: 0.40, cz: 0.16, rx:0.22, ry:0.15, rz:0.19, hex:P.lobe},    /* reaching front-right */
    {cx:-0.32, cz: 0.34, rx:0.20, ry:0.13, rz:0.20, hex:P.lobe},    /* front-left, lower */
    {cx:-0.08, cz:-0.42, rx:0.20, ry:0.13, rz:0.18, hex:P.lobeDk},  /* trailing back — darker, drags behind the lunge */
  ];
  for(const L of lobes){
    const rings = blob(L.cx, 0.02 + L.ry, L.cz, L.rx, L.ry, L.rz, L.hex, 8, 4);
    rings.forEach((rg,k)=>{ if(k<=1) rg.forEach(p=>{ if(p.y<0.03) p.y=0.008; }); });
    const lip = ring(V(L.cx,0.02,L.cz), V(0,1,0), L.rx*0.9, L.rz*0.9, 8, Math.PI/8);
    const lipTop = ring(V(L.cx,0.06,L.cz), V(0,1,0), L.rx*0.8, L.rz*0.8, 8, Math.PI/8);
    stitch([lip, lipTop], ()=>P.rim);
  }

  /* ---------- ENGULFED BONE — pale skull + rib pair half-sunk in the mass, front-right flank
     (kept from the prior pass — the named signature). ---------- */
  {
    const sk = V(0.20, 0.24, 0.24);
    const dome = blob(sk.x, sk.y, sk.z, 0.115, 0.10, 0.115, P.bone, 8, 4);
    dome[0]?.forEach(p=>p.y = Math.max(p.y, sk.y-0.06));
    const fz = sk.z + 0.10;
    const fpl = (x,y)=>V(sk.x + x, sk.y + y, fz + (Math.abs(x)+Math.abs(y))*-0.15);
    quad(fpl(-0.085,-0.09), fpl(0.085,-0.09), fpl(0.09,0.06), fpl(-0.09,0.06), P.boneDk, 0.04);
    for(const s of [-1,1]){
      const ex=sk.x+s*0.040, ey=sk.y+0.020, ez=fz+0.015;
      quad(V(ex-0.028,ey-0.020,ez), V(ex+0.028,ey-0.020,ez),
           V(ex+0.024,ey+0.026,ez-0.01), V(ex-0.024,ey+0.026,ez-0.01), P.core, 0.0);
    }
    quad(V(sk.x-0.016,sk.y-0.030,fz+0.012), V(sk.x+0.016,sk.y-0.030,fz+0.012),
         V(sk.x, sk.y-0.002, fz+0.012), V(sk.x, sk.y-0.002, fz+0.012), P.core, 0.0);
    quad(V(sk.x-0.045,sk.y-0.070,fz+0.008), V(sk.x+0.045,sk.y-0.070,fz+0.008),
         V(sk.x+0.040,sk.y-0.045,fz+0.010), V(sk.x-0.040,sk.y-0.045,fz+0.010), P.boneWet, 0.04);

    const rib0=V(-0.24,0.06,0.06), rib1=V(-0.34,0.22,0.08), rib2=V(-0.26,0.30,-0.04);
    tube(rib0, rib1, 0.024, 0.020, 5, P.boneWet, {capA:{hex:P.boneWet}});
    tube(rib1, rib2, 0.020, 0.014, 5, P.bone, {capB:{hex:P.boneDk, lift:0.01}});
    const rr0=V(-0.20,0.04,-0.04), rr1=V(-0.30,0.18,-0.08);
    tube(rr0, rr1, 0.018, 0.012, 5, P.bone, {capA:{hex:P.boneWet}, capB:{hex:P.boneDk, lift:0.01}});
  }

  /* ---------- SHEEN DABS — wet glisten; the crest tip's own capTop already carries the brightest
     value, these are secondary catch-lights on the low mass so it doesn't read flat/dead. ---------- */
  const dab=(x,y,z,r)=>quad(V(x-r,y,z-r), V(x+r,y,z-r), V(x+r,y+r*0.4,z+r), V(x-r,y+r*0.4,z+r), P.sheenLt, 0.03);
  dab( 0.30, 0.16, 0.22, 0.055);
  dab(-0.20, 0.12, 0.30, 0.05);
  dab( 0.00, 0.90, 0.36, 0.045);   /* mid-crest catch-light, ties the pseudopod's value ladder together */

  /* ---------- BASE DISC (spreads wide — r≈0.42, the mass overflows its edges) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
