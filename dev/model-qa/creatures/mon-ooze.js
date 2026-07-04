/* dev/model-qa/creatures/mon-ooze.js — the ooze landmark table (AMORPHOUS family debut).
   Whole-object grammar: one function, one geometry frame, no anchors. The read is a low
   glistening MOUND (blob()) with pseudopod lobes flowing outward onto the disc edge, and an
   engulfed pale BONE half-sunk in the mass — the horror detail that sells "it dissolves things".
   No eyes, no face. Wet grey, darker translucent-suggesting core bands, lighter rim. Reads as
   liquid-alive, not a rock: spread wide (~0.9u), low (~0.45u), lobes overlapping the base.
   Imported by both mon-ooze-probe.html (render) and export-obj.mjs (Blender export). */
import { THREE, V, quad, tube, blob, ring, stitch, capFan } from '../probe-lib.js';

export function buildOoze(){
  /* ---------- PALETTE (VS desaturated; wet GREY. F1 backlog: the old palette read slate-BLUE at
     board light because every mass hex sat blue-green (g,b > r); nudged toward NEUTRAL grey — the
     red channel brought up to meet green/blue at the same values, so it reads wet slate-grey, not
     blue. Same brightness ladder, just de-blued. The engulfed skull STAYS (Adam likes it). ---------- */
  const P = {
    core:0x353738,      /* darkest — the deep translucent center (was 0x2c3436, de-blued) */
    body:0x565859,      /* mid mass (was 0x47585a) */
    rim:0x83817d,       /* lighter spreading rim — catches light like wet film (was 0x6f8280) */
    sheenLt:0xa7a6a1,   /* glisten highlights (was 0x93a6a0) */
    lobe:0x4a4a49, lobeDk:0x343433,
    bone:0xcabfa2, boneDk:0x9a8f76, boneWet:0x6a6e5f,   /* engulfed skeleton — paler, tinted where sunk */
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- CORE MOUND — a low wide blob. Manually banded so the CORE reads dark and the
     RIM reads light (blob() is single-hex, so we author the rings by hand here). ---------- */
  {
    const n=10;
    /* wide low dome: rings from a broad wet base up to a rounded low crown */
    const bands = [
      {y:0.02, r:0.44, rz:0.42, hex:P.core},   /* wettest footprint, darkest — sitting in its own puddle */
      {y:0.12, r:0.46, rz:0.44, hex:P.body},   /* bulge — mass sags outward at mid-height */
      {y:0.24, r:0.40, rz:0.38, hex:P.body},
      {y:0.34, r:0.30, rz:0.29, hex:P.rim},
      {y:0.42, r:0.17, rz:0.16, hex:P.rim},    /* low crown */
    ];
    const rings = bands.map(b => ring(V(0,b.y,0), V(0,1,0), b.r, b.rz, n, Math.PI/n));
    /* asymmetric slump — nudge each ring a little so it isn't a perfect dome (liquid, not rock) */
    rings[1].forEach((p,i)=>{ p.x += Math.sin(i*1.7)*0.03; p.z += Math.cos(i*2.3)*0.03; });
    rings[2].forEach((p,i)=>{ p.x += Math.sin(i*2.1)*0.025; p.z += Math.cos(i*1.4)*0.02; });
    rings[3].forEach((p,i)=>{ p.x += Math.sin(i*1.1)*0.02; });
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0.03,0.46,-0.02), P.sheenLt);   /* glistening off-center crown */
  }

  /* ---------- PSEUDOPOD LOBES — smaller blobs flowing outward, overlapping the disc edge.
     Each is a squat off-center blob that starts inside the mound and bulges out low + wide. ---------- */
  const lobes = [
    {cx: 0.42, cz: 0.12, rx:0.24, ry:0.16, rz:0.20, hex:P.lobe},    /* reaching front-right */
    {cx:-0.34, cz: 0.30, rx:0.22, ry:0.14, rz:0.22, hex:P.lobe},    /* front-left, lower */
    {cx:-0.10, cz:-0.42, rx:0.20, ry:0.13, rz:0.18, hex:P.lobeDk},  /* trailing back — darker */
  ];
  for(const L of lobes){
    const rings = blob(L.cx, 0.02 + L.ry, L.cz, L.rx, L.ry, L.rz, L.hex, 8, 4);
    /* flatten the bottom into the ground + let the rim brighten (wet film spreading) */
    rings.forEach((rg,k)=>{ if(k<=1) rg.forEach(p=>{ if(p.y<0.03) p.y=0.008; }); });
    /* a bright wet lip where the lobe meets the ground */
    const lip = ring(V(L.cx,0.02,L.cz), V(0,1,0), L.rx*0.9, L.rz*0.9, 8, Math.PI/8);
    const lipTop = ring(V(L.cx,0.06,L.cz), V(0,1,0), L.rx*0.8, L.rz*0.8, 8, Math.PI/8);
    stitch([lip, lipTop], ()=>P.rim);
  }

  /* ---------- ENGULFED BONE — a pale skull-hint + rib bones HALF-SUNK in the mass.
     Partially inside the surface: the lower portion is tinted wet (dissolving), the crown pale. ---------- */
  {
    /* SKULL — a LARGE pale cranium breaking the surface on the mound's front-right shoulder,
       socketed face turned toward the camera (+z/+x). Bigger + higher so it clearly reads as a
       half-dissolved head, not a chip. Domed cranium (blob) + a front face-plate carrying the
       eye sockets + nasal hollow. Lower half tinted wet where it sinks into the goo. */
    const sk = V(0.20, 0.30, 0.22);          /* skull center, riding proud on the front flank */
    /* domed cranium — an ellipsoid, top pale, so it reads as a rounded skull cap */
    const dome = blob(sk.x, sk.y, sk.z, 0.115, 0.10, 0.115, P.bone, 8, 4);
    /* tint the bottom band wet (submerged) */
    dome[0]?.forEach(p=>p.y = Math.max(p.y, sk.y-0.06));
    /* FACE PLATE — a flat-ish front panel facing +z, carrying sockets + nose. Slightly proud. */
    const fz = sk.z + 0.10;                    /* front face plane */
    const fpl = (x,y)=>V(sk.x + x, sk.y + y, fz + (Math.abs(x)+Math.abs(y))*-0.15);
    quad(fpl(-0.085,-0.09), fpl(0.085,-0.09), fpl(0.09,0.06), fpl(-0.09,0.06), P.boneDk, 0.04); /* face */
    /* two large dark eye sockets */
    for(const s of [-1,1]){
      const ex=sk.x+s*0.040, ey=sk.y+0.020, ez=fz+0.015;
      quad(V(ex-0.028,ey-0.020,ez), V(ex+0.028,ey-0.020,ez),
           V(ex+0.024,ey+0.026,ez-0.01), V(ex-0.024,ey+0.026,ez-0.01), P.core, 0.0);   /* hollow */
    }
    /* triangular nasal hollow */
    quad(V(sk.x-0.016,sk.y-0.030,fz+0.012), V(sk.x+0.016,sk.y-0.030,fz+0.012),
         V(sk.x, sk.y-0.002, fz+0.012), V(sk.x, sk.y-0.002, fz+0.012), P.core, 0.0);
    /* a hint of upper teeth — a pale bar under the nose */
    quad(V(sk.x-0.045,sk.y-0.070,fz+0.008), V(sk.x+0.045,sk.y-0.070,fz+0.008),
         V(sk.x+0.040,sk.y-0.045,fz+0.010), V(sk.x-0.040,sk.y-0.045,fz+0.010), P.boneWet, 0.04);

    /* a rib bone arcing out of the mass on the left flank — half-submerged, tips pale, root wet */
    const rib0=V(-0.24,0.08,0.08), rib1=V(-0.34,0.26,0.10), rib2=V(-0.26,0.34,-0.02);
    tube(rib0, rib1, 0.024, 0.020, 5, P.boneWet, {capA:{hex:P.boneWet}});        /* sunk root */
    tube(rib1, rib2, 0.020, 0.014, 5, P.bone, {capB:{hex:P.boneDk, lift:0.01}}); /* pale exposed tip */
    /* a second rib shard beside it (paired rib read) */
    const rr0=V(-0.20,0.06,-0.02), rr1=V(-0.30,0.22,-0.06);
    tube(rr0, rr1, 0.018, 0.012, 5, P.bone, {capA:{hex:P.boneWet}, capB:{hex:P.boneDk, lift:0.01}});
  }

  /* ---------- SHEEN DABS — a few small bright quads on the crown/flanks to sell WET (glisten) --- */
  const dab=(x,y,z,r)=>quad(V(x-r,y,z-r), V(x+r,y,z-r), V(x+r,y+r*0.4,z+r), V(x-r,y+r*0.4,z+r), P.sheenLt, 0.03);
  dab(-0.06, 0.44, 0.06, 0.05);
  dab( 0.30, 0.20, 0.20, 0.06);
  dab(-0.22, 0.16, 0.30, 0.05);

  /* ---------- BASE DISC (spreads wide — r≈0.42, the mass overflows its edges) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
