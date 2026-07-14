/* dev/model-qa/creatures/rlm-vault-sealed-naga-of-the-bone-archive.js — VAULT-SEALED NAGA OF THE
   BONE ARCHIVE (lost-world, Large Monstrosity, CR 8). Read: a serpent-sage naga, a long coiled
   scaled body nesting low, a raised humanlike-browed forebody with a wise, ancient face reading
   over a scatter of bone tablets (the archive it guards). No limbs — coiled serpent grammar
   (per the fang-serpent exemplar), scaled up to Large with a heavier, more ornate dorsal frill
   and longer raised forebody. VS-desaturated deep bone-grey/verdigris scale, pale ivory belly.
   Whole-object grammar: one function, one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildVaultSealedNagaOfTheBoneArchive(){
  const P = {
    scale:0x5c645c, scaleDk:0x3e453e, scaleLt:0x767e74,
    verdigris:0x4a6058, verdigrisDk:0x30443c,
    belly:0xc0b89a, bellyDk:0x968c6e,
    frill:0x8a7a54, frillDk:0x5c5034,
    fang:0xd8ceac, mouth:0x241f18, tongue:0x7a3436,
    bone:0xc4b896, boneDk:0x8a8064,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- COILED BODY — a wider ring of loft segments, low and heavy, Large scale. ---------- */
  const coilY = 0.16;
  const coilPts = [
    V(0.30, coilY, 0.14), V(0.36, coilY+0.02, -0.14), V(0.20, coilY+0.03, -0.32),
    V(-0.10, coilY+0.03, -0.32), V(-0.30, coilY+0.02, -0.10), V(-0.28, coilY, 0.18),
    V(-0.02, coilY-0.01, 0.32),
  ];
  const rad = [0.110,0.125,0.120,0.110,0.098,0.088,0.078];
  for(let i=0;i<coilPts.length-1;i++){
    const hex = (i%2===0)? P.scale : P.scaleDk;
    tube(coilPts[i], coilPts[i+1], rad[i], rad[i+1], 9, hex, {phase:Math.PI/9});
  }
  /* verdigris-mottled dorsal markings along the coil */
  for(let i=0;i<coilPts.length-1;i+=2){
    const a=coilPts[i], b=coilPts[i+1];
    const mx=(a.x+b.x)/2, mz=(a.z+b.z)/2, my=(a.y+b.y)/2+0.09;
    quad(V(mx-0.045,my,mz-0.045), V(mx+0.045,my,mz-0.03), V(mx+0.015,my+0.015,mz+0.045), V(mx-0.045,my+0.015,mz+0.03), P.verdigris, 0.05);
  }

  /* ---------- RAISED FOREBODY — rises higher + longer than a common serpent, an ancient sage's poise. ---------- */
  const S = {
    root:  coilPts[0],
    rise1: V(0.36, coilY+0.26, 0.28),
    rise2: V(0.30, coilY+0.56, 0.38),
    rise3: V(0.22, coilY+0.82, 0.40),
    neck:  V(0.16, coilY+1.00, 0.38),
    headB: V(0.12, coilY+1.10, 0.42),
  };
  tube(S.root,  S.rise1, 0.100, 0.082, 8, P.scale,   {phase:Math.PI/8});
  tube(S.rise1, S.rise2, 0.082, 0.064, 8, P.scaleDk, {phase:Math.PI/8});
  tube(S.rise2, S.rise3, 0.064, 0.050, 8, P.scale,   {phase:Math.PI/8});
  tube(S.rise3, S.neck,  0.050, 0.042, 8, P.scaleDk, {phase:Math.PI/8});
  /* pale belly strip up the raised forebody */
  quad(V(0.10,coilY+0.16,0.24), V(0.22,coilY+0.16,0.20), V(0.16,coilY+0.90,0.34), V(0.06,coilY+0.90,0.36), P.belly, 0.05);
  /* ORNATE DORSAL FRILL — a ridged verdigris frill running the raised spine (the "sage" tell) */
  {
    const seg=[[S.rise1,0.09],[S.rise2,0.11],[S.rise3,0.09],[S.neck,0.06]];
    for(let i=0;i<seg.length-1;i++){
      const [pa,ha]=seg[i], [pb,hb]=seg[i+1];
      quad(V(pa.x-0.02,pa.y,pa.z), V(pa.x+0.02,pa.y,pa.z), V(pb.x+0.015,pb.y,pb.z), V(pb.x-0.015,pb.y,pb.z), P.frillDk, 0.04);
      quad(V(pa.x-0.012,pa.y,pa.z-0.01), V(pa.x+0.012,pa.y,pa.z-0.01), V(pa.x,pa.y+ha,pa.z-0.02), V(pa.x,pa.y+ha,pa.z-0.02), P.frill, 0.05);
    }
  }

  /* ---------- HEAD — an ancient, wise, broad-browed serpent-sage face (no eye quads — brow shape only). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:coilY+1.02, cz:0.42, rx:0.068, rz:0.080, hex:P.scale},
      {y:coilY+1.12, cz:0.46, rx:0.082, rz:0.098, hex:P.scaleLt},
      {y:coilY+1.20, cz:0.42, rx:0.066, rz:0.072, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0.14,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    // heavy sage brow — pushes the brow-band front verts forward/down slightly (wise, hooded)
    for(const i of [1,2]){ rings[2][i].z += 0.012; rings[2][i].y -= 0.010; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0.14,coilY+1.26,0.40), P.scaleDk);
    /* snout */
    const snB=V(0.14,coilY+0.98,0.48), snT=V(0.13,coilY+0.95,0.60);
    tube(snB, snT, 0.052, 0.020, n, P.scale, {raz:0.062, rbz:0.022, phase:ph, capB:{hex:P.mouth, lift:0.006}});
    /* jaw line + mouth shadow */
    quad(V(0.05,coilY+0.90,0.44), V(0.24,coilY+0.90,0.44), V(0.19,coilY+0.86,0.58), V(0.09,coilY+0.86,0.58), P.mouth, 0.03);
    /* fangs */
    for(const s of [-1,1]){
      const fb=V(0.14+s*0.04,coilY+0.895,0.54); const ft=V(0.14+s*0.05,coilY+0.76,0.56);
      tube(fb, ft, 0.013, 0.004, 4, P.fang, {capB:{hex:P.fang, lift:0.004}});
    }
    /* tongue */
    const tR=V(0.13,coilY+0.86,0.60), tM=V(0.13,coilY+0.83,0.74);
    tube(tR, tM, 0.010, 0.006, 4, P.tongue, {capA:{hex:P.mouth}});
    for(const s of [-1,1]) tube(tM, V(0.13+s*0.022,coilY+0.82,0.82), 0.006, 0.002, 3, P.tongue);
  }

  /* ---------- BONE TABLETS — a scatter of archive tablets the naga coils around/guards. ---------- */
  {
    const tablets=[[0.02,0.0,-0.02,0.16,0.02,0.11],[0.16,0.0,-0.10,0.12,0.02,0.09],[-0.14,0.0,0.06,0.13,0.02,0.10]];
    for(const [x,y,z,rx,ry,rz] of tablets){
      quad(V(x-rx,y+0.01,z-rz),V(x+rx,y+0.01,z-rz),V(x+rx,y+0.01,z+rz),V(x-rx,y+0.01,z+rz),P.bone,0.05);
      // incised lines (dead-tongue script)
      for(const dz of [-rz*0.4,0,rz*0.4]) quad(V(x-rx*0.7,y+0.014,z+dz),V(x+rx*0.7,y+0.014,z+dz),V(x+rx*0.7,y+0.014,z+dz+0.01),V(x-rx*0.7,y+0.014,z+dz+0.01),P.boneDk,0.0);
    }
  }

  /* tail tip — thin taper poking from the innermost coil loop */
  {
    const tt0=coilPts.at(-1);
    const tt1=V(0.08, coilY-0.03, 0.42);
    const tip=V(0.18, coilY-0.04, 0.48);
    tube(tt0, tt1, 0.07, 0.04, 6, P.scaleDk);
    tube(tt1, tip, 0.04, 0.010, 6, P.scaleDk, {capB:{hex:P.scaleDk, lift:0.005}});
  }

  /* ---------- base disc (Large r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
