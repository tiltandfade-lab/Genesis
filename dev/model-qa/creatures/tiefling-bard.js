/* dev/model-qa/creatures/tiefling-bard.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED tiefling race (slim ~1.45u frame, dusky red-mauve skin, backswept HORNS, sharp GOATEE,
   thin spade-tipped TAIL) wearing the BARD kit (bard.js signature: a LUTE authored first so both
   hands derive — strumming hand over the soundhole, fret hand up the neck — a jaunty FEATHERED CAP
   sized to clear the horns, a short HALF-CAPE off one shoulder, a fitted DOUBLET + tall boots, one
   knee bent). A charismatic infernal troubadour. EYELESS. One whole-object function, no anchors;
   figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTieflingBard(){
  const P = {
    doublet:0x7a3b3f, doubletDk:0x5c2c2f, doubletLt:0x8f4a4d,
    linen:0xcfc4a6, linenDk:0x8d846c,
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a, hair:0x2a2320,
    leather:0x4e3d2a, leatherDk:0x3a2d1f,
    cape:0x3f5b63, capeDk:0x2c4147,
    boot:0x3c3226, trouser:0x53433a,
    wood:0xa3703f, woodDk:0x7a4e2a, string:0xd8cfa8,
    cap:0x384d63, capDk:0x293a4c, feather:0xb54a3a, featherDk:0x7d3226,
    brass:0xb08d46, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.685, waistY:0.765, ribY:0.870, chestY:0.975, shldY:1.055, neckY:1.090,
    hipHalf:0.100, shoulderX:0.230,
    jawY:1.120, cheekY:1.192, browY:1.262, crownY:1.345, headTopY:1.400,
  };

  /* LUTE FIRST — body low-left, neck up-right */
  const LU_BODY = V(-0.10, 0.60, 0.30);
  const LU_NECKBASE = V(0.02, 0.90, 0.24);
  const LU_PEGBOX = V(0.235, 1.24, 0.155);
  const NDIR = new THREE.Vector3().subVectors(LU_PEGBOX, LU_NECKBASE).normalize();
  const STRUM = LU_BODY.clone().add(V(0.065, 0.075, 0.145));
  const FRET  = LU_NECKBASE.clone().addScaledVector(NDIR, 0.62);
  {
    blob(LU_BODY.x, LU_BODY.y - 0.075, LU_BODY.z, 0.145, 0.145, 0.075, P.woodDk, 8, 5);
    blob(LU_BODY.x, LU_BODY.y + 0.095, LU_BODY.z + 0.01, 0.105, 0.110, 0.065, P.wood, 8, 4);
    {
      const oc = LU_BODY.clone().add(V(0.01, 0.01, 0.078));
      const n=8, rO=ring(oc, V(0,0,1), 0.040, 0.040, n), rI=ring(oc.clone().add(V(0,0,-0.006)), V(0,0,1), 0.026,0.026,n);
      stitch([rI, rO], ()=>P.woodDk);
      capFan(rI, oc.clone().add(V(0,0,-0.012)), 0x1e1712);
    }
    tube(LU_NECKBASE, LU_PEGBOX.clone().addScaledVector(NDIR,-0.03), 0.020, 0.015, 6, P.wood);
    {
      const up = V(0,1,0), nu = new THREE.Vector3().crossVectors(up,NDIR).normalize(),
            nv = new THREE.Vector3().crossVectors(NDIR,nu).normalize();
      const a=LU_NECKBASE.clone().addScaledVector(nv,0.018), b=LU_PEGBOX.clone().addScaledVector(NDIR,-0.03).addScaledVector(nv,0.013);
      quad(a.clone().addScaledVector(nu,0.010), a.clone().addScaledVector(nu,-0.010),
           b.clone().addScaledVector(nu,-0.007), b.clone().addScaledVector(nu,0.007), P.woodDk, 0.02);
    }
    {
      const c = LU_PEGBOX;
      const up=V(0,1,0), nu=new THREE.Vector3().crossVectors(up,NDIR).normalize(), nv=new THREE.Vector3().crossVectors(NDIR,nu).normalize();
      const bx=0.018, by=0.010, bz=0.036;
      const cnr=(a,b,cc)=>c.clone().addScaledVector(nu,a*bx).addScaledVector(nv,b*by).addScaledVector(NDIR,cc*bz);
      quad(cnr(-1,1,-1),cnr(1,1,-1),cnr(1,1,1),cnr(-1,1,1), P.woodDk, 0.03);
      quad(cnr(-1,-1,-1),cnr(-1,-1,1),cnr(1,-1,1),cnr(1,-1,-1), P.woodDk, 0.03);
      quad(cnr(-1,-1,-1),cnr(-1,1,-1),cnr(-1,1,1),cnr(-1,-1,1), P.wood, 0.03);
      quad(cnr(1,-1,-1),cnr(1,-1,1),cnr(1,1,1),cnr(1,1,-1), P.wood, 0.03);
      for(const s of [-1,1]) for(const t of [-1,1]){
        const pc = c.clone().addScaledVector(nu, s*0.019).addScaledVector(NDIR, t*0.013);
        tube(pc, pc.clone().addScaledVector(nu, s*0.013), 0.005,0.006,5, P.brass, {capB:{hex:P.brass}});
      }
    }
    {
      const up=V(0,1,0), nu=new THREE.Vector3().crossVectors(up,NDIR).normalize();
      for(const off of [-0.045,-0.015,0.015,0.045]){
        const a = LU_BODY.clone().add(V(0.01,0.09,0.075)).addScaledVector(nu, off*0.62);
        const b = LU_PEGBOX.clone().addScaledVector(nu, off*0.42).addScaledVector(NDIR,-0.02);
        tube(a,b, 0.004,0.004,4, P.string);
      }
    }
  }

  /* TORSO — fitted doublet (slim tiefling) */
  stack([
    {y:L.hipY,   rx:0.170, rz:0.128, hex:P.doubletDk},
    {y:L.waistY, rx:0.148, rz:0.112, hex:P.doublet},
    {y:L.ribY,   rx:0.172, rz:0.130, hex:P.doublet},
    {y:L.chestY, rx:0.195, rz:0.142, hex:P.doubletLt},
    {y:L.shldY,  rx:0.198, rz:0.130, hex:P.doublet},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.linenDk},
  ], 8, {capTop:{hex:P.linenDk, lift:0.004}});
  stack([
    {y:0.58, rx:0.205, rz:0.165, hex:P.doubletDk},
    {y:0.70, rx:0.182, rz:0.140, hex:P.doublet},
  ], 8, {});
  stack([
    {y:0.735, rx:0.160, rz:0.122, hex:P.leather},
    {y:0.775, rx:0.157, rz:0.119, hex:P.leather},
  ], 8, {});
  quad(V(-0.028,0.740,0.128), V(0.028,0.740,0.128), V(0.028,0.772,0.124), V(-0.028,0.772,0.124), P.brass, 0.02);

  /* HALF-CAPE — off the left shoulder */
  {
    const capeBands = [
      {y:L.shldY+0.045, cx:-0.10,  cz:-0.03, rx:0.185, rz:0.140},
      {y:0.86,          cx:-0.26,  cz:-0.09, rx:0.16, rz:0.12},
      {y:0.60,          cx:-0.28,  cz:-0.14, rx:0.20, rz:0.13},
      {y:0.38,          cx:-0.27,  cz:-0.17, rx:0.22, rz:0.13},
    ];
    const arc = [0,1,2,3,4,5,6].map(i=>{ const t=i/6; return Math.PI*0.55 + t*Math.PI*0.65; });
    const rowsFront = capeBands.map(b=> arc.map(a=> V(b.cx + Math.cos(a)*b.rx, b.y, b.cz + Math.sin(a)*b.rz) ));
    for(let r=0;r<rowsFront.length-1;r++){
      for(let i=0;i<arc.length-1;i++){
        const a=rowsFront[r][i], b2=rowsFront[r][i+1], c=rowsFront[r+1][i+1], d=rowsFront[r+1][i];
        quad(a,b2,c,d, r%2?P.cape:P.capeDk, 0.05);
        quad(d,c,b2,a, r%2?P.capeDk:P.cape, 0.05);
      }
    }
    {
      const capeEdge = rowsFront[0][0];
      const tunicPt  = V(-L.shoulderX+0.01, L.shldY+0.01, -0.01);
      quad(tunicPt, capeEdge, capeEdge.clone().add(V(0,-0.05,0)), tunicPt.clone().add(V(0,-0.04,0.02)), P.capeDk, 0.03);
    }
    quad(V(-L.shoulderX-0.01,L.shldY+0.05,0.02), V(-L.shoulderX+0.05,L.shldY+0.05,0.00),
         V(-L.shoulderX+0.05,L.shldY+0.01,0.00), V(-L.shoulderX-0.01,L.shldY+0.01,0.02), P.brass, 0.02);
  }

  /* HEAD — inherited tiefling skull. EYELESS. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.076, rz:0.082, hex:P.skin},
      {y:L.cheekY, rx:0.104, rz:0.100, hex:P.skin},
      {y:L.browY,  rx:0.108, rz:0.098, hex:P.skin},
      {y:L.crownY, rx:0.084, rz:0.076, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.011), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.021;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.007), P.skinDk);
    stack([
      {y:L.crownY-0.01, rx:0.086, rz:0.078, cz:-0.006, hex:P.hair},
      {y:L.crownY+0.02, rx:0.070, rz:0.062, cz:-0.010, hex:P.hair},
    ], 8, {capTop:{hex:P.hair, lift:0.010}});
  }
  /* GOATEE */
  {
    const bands=[
      {y:L.jawY+0.010, rx:0.058, rz:0.046, cz:0.058, hex:P.hair},
      {y:L.jawY-0.034, rx:0.044, rz:0.036, cz:0.075, hex:P.hair},
      {y:L.jawY-0.072, rx:0.028, rz:0.024, cz:0.078, hex:P.hair},
      {y:L.jawY-0.100, rx:0.012, rz:0.011, cz:0.068, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.jawY-0.122,0.062), P.hair);
  }
  /* HORNS */
  for(const s of [-1,1]){
    const baseX = s*0.100, baseZ = -0.010;
    const base   = V(baseX, L.browY-0.010, baseZ);
    const p1 = V(baseX + s*0.026, L.browY+0.118, baseZ - 0.028);
    const p2 = V(baseX + s*0.044, L.browY+0.210, baseZ - 0.090);
    const p3 = V(baseX + s*0.052, L.browY+0.262, baseZ - 0.150);
    tube(base, p1, 0.030, 0.023, 6, P.horn,   {capA:{hex:P.hornDk}});
    tube(p1,   p2, 0.023, 0.015, 6, P.hornLt);
    tube(p2,   p3, 0.015, 0.003, 6, P.hornLt, {capB:{hex:P.hornDk}});
  }

  /* JAUNTY FEATHERED CAP — small crown sitting between the horns + one big feather */
  {
    const n=9, ph=Math.PI/n;
    const capBands=[
      {y:L.crownY+0.02, rx:0.100, rz:0.094, cx:0.0,   cz:0.0},
      {y:L.crownY+0.07, rx:0.090, rz:0.084, cx:0.006, cz:-0.006},
      {y:L.crownY+0.12, rx:0.064, rz:0.058, cx:0.016, cz:-0.014},
      {y:L.crownY+0.18, rx:0.032, rz:0.028, cx:0.026, cz:-0.024},
    ];
    const rings = capBands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, ()=>P.cap);
    capFan(rings.at(-1), V(0.032,L.crownY+0.215,-0.03), P.capDk);
    /* small brim ring hugging the crown, tucked between the horns */
    const brimOut = ring(V(0,L.crownY+0.015,0.0), V(0,1,0), 0.116, 0.108, n, ph).map((p,i)=>{
      if(i===1||i===2) p.y += 0.020; return p;
    });
    const brimIn = ring(V(0,L.crownY+0.022,0.0), V(0,1,0), 0.076, 0.070, n, ph);
    stitch([brimIn, brimOut], ()=>P.capDk);
    capFan(brimOut, V(0,L.crownY+0.010,0.0), P.capDk, true);
    {
      const root = V(-0.095, L.crownY+0.06, -0.05);
      const tip  = root.clone().add(V(-0.06, 0.30, -0.10));
      const mid  = root.clone().lerp(tip,0.5).add(V(-0.025,0.01,-0.01));
      const w = 0.045;
      const side = new THREE.Vector3().crossVectors(V(0,1,0), tip.clone().sub(root)).normalize();
      quad(root.clone().addScaledVector(side,w*0.5), mid.clone().addScaledVector(side,w*0.32),
           tip.clone(), mid.clone().addScaledVector(side,-w*0.32), P.feather, 0.05);
      quad(root.clone().addScaledVector(side,-w*0.5), mid.clone().addScaledVector(side,-w*0.32),
           tip.clone(), mid.clone().addScaledVector(side,w*0.32), P.featherDk, 0.05);
      tube(root, tip, 0.008,0.003,4, P.featherDk);
    }
  }

  /* ARMS — RIGHT strums, LEFT frets. Both derive from the lute (slim tiefling). */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(0.235, 0.845, 0.19);
    tube(S,E,0.058,0.044,6,P.doublet);
    tube(E,STRUM.clone().add(V(-0.01,0.02,-0.02)),0.040,0.032,6,P.doubletDk,{capB:{hex:P.linenDk}});
    tube(STRUM.clone().add(V(-0.03,-0.01,0.01)), STRUM.clone().add(V(0.03,0.03,0.03)), 0.036,0.032,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(-0.16, 0.92, 0.12);
    tube(S2,E2,0.058,0.044,6,P.doublet);
    tube(E2,FRET.clone().add(V(0.0,0.0,-0.02)),0.040,0.032,6,P.doubletDk,{capB:{hex:P.linenDk}});
    tube(FRET.clone().addScaledVector(NDIR,-0.05), FRET.clone().addScaledVector(NDIR,0.05), 0.034,0.030,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});
  }

  /* LEGS — one knee bent, tall boots (slim tiefling) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.135,0.40,0.03), ankL=V(-0.14,0.085,0.015);
    tube(hipL,kneeL,0.072,0.052,6,P.trouser);
    tube(kneeL,ankL,0.050,0.038,6,P.trouser);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.205,0.44,0.145), ankR=V( 0.165,0.085,0.075);
    tube(hipR,kneeR,0.072,0.052,6,P.trouser);
    tube(kneeR,ankR,0.050,0.038,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.05,0,1)], [ankR,V(0.55,0,0.85).normalize()]]){
      stack([
        {y:0.012, rx:0.062, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.056, rz:0.058, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.24,  rx:0.062, rz:0.060, cx:ank.x, cz:ank.z, hex:P.leatherDk},
        {y:0.34,  rx:0.066, rz:0.062, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.006}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.128), 0.052,0.040,6,P.boot, {capB:{hex:P.boot, lift:0.014}, raz:0.046, rbz:0.032});
    }
  }

  /* TAIL — thin spade-tipped tail (inherited) */
  {
    const root = V(0.030, L.hipY-0.045, -0.120);
    const t1 = V(0.085, 0.505, -0.250);
    const t2 = V(0.118, 0.345, -0.280);
    const t3 = V(0.128, 0.235, -0.245);
    const tip = V(0.132, 0.155, -0.180);
    tube(root, t1, 0.038, 0.031, 6, P.doubletDk);
    tube(t1,   t2, 0.031, 0.022, 6, P.skinDk);
    tube(t2,   t3, 0.022, 0.013, 6, P.skinDk);
    tube(t3,   tip,0.013, 0.006, 6, P.skinDk);
    const axis = new THREE.Vector3().subVectors(tip,t3).normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), axis).normalize();
    const fwd  = tip.clone().addScaledVector(axis, 0.052);
    const back = tip.clone().addScaledVector(axis, -0.014);
    const wingL= tip.clone().addScaledVector(side, 0.040).addScaledVector(axis, 0.006);
    const wingR= tip.clone().addScaledVector(side,-0.040).addScaledVector(axis, 0.006);
    quad(back, wingR, fwd, wingL, P.skinDk, 0.03);
    quad(back, wingL, fwd, wingR, P.skinDk, 0.03);
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
