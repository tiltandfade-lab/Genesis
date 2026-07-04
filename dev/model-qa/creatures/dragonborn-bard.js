/* dev/model-qa/creatures/dragonborn-bard.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED dragonborn race (broad powerful frame, reptilian MUZZLE head + heavy brow + back-swept
   HORN STUBS, thick tapering TAIL, bronze/rust scale hide) wearing the BARD kit (bard.js signature:
   a LUTE authored first so both hands derive — strumming hand over the soundhole, fret hand up the
   neck — a jaunty FEATHERED CAP sized to clear the horns, a short HALF-CAPE off one shoulder, a
   fitted DOUBLET + tall boots, one knee bent). A flamboyant draconic troubadour. EYELESS. One
   whole-object function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDragonbornBard(){
  const P = {
    doublet:0x7a3b3f, doubletDk:0x5c2c2f, doubletLt:0x8f4a4d,
    linen:0xcfc4a6, linenDk:0x8d846c,
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a,
    leather:0x4e3d2a, leatherDk:0x3a2d1f,
    cape:0x3f5b63, capeDk:0x2c4147,
    boot:0x3c3226, trouser:0x53433a,
    wood:0xa3703f, woodDk:0x7a4e2a, string:0xd8cfa8,
    cap:0x384d63, capDk:0x293a4c, feather:0xb54a3a, featherDk:0x7d3226,
    brass:0xb08d46, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.75, waistY:0.83, ribY:0.945, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.128, shoulderX:0.270,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  /* LUTE FIRST — body low-left, neck up-right */
  const LU_BODY = V(-0.13, 0.68, 0.34);
  const LU_NECKBASE = V(0.03, 1.00, 0.27);
  const LU_PEGBOX = V(0.290, 1.38, 0.170);
  const NDIR = new THREE.Vector3().subVectors(LU_PEGBOX, LU_NECKBASE).normalize();
  const STRUM = LU_BODY.clone().add(V(0.075, 0.085, 0.160));
  const FRET  = LU_NECKBASE.clone().addScaledVector(NDIR, 0.64);
  {
    blob(LU_BODY.x, LU_BODY.y - 0.080, LU_BODY.z, 0.165, 0.165, 0.085, P.woodDk, 8, 5);
    blob(LU_BODY.x, LU_BODY.y + 0.100, LU_BODY.z + 0.01, 0.120, 0.125, 0.072, P.wood, 8, 4);
    {
      const oc = LU_BODY.clone().add(V(0.01, 0.01, 0.088));
      const n=8, rO=ring(oc, V(0,0,1), 0.044, 0.044, n), rI=ring(oc.clone().add(V(0,0,-0.006)), V(0,0,1), 0.028,0.028,n);
      stitch([rI, rO], ()=>P.woodDk);
      capFan(rI, oc.clone().add(V(0,0,-0.012)), 0x1e1712);
    }
    tube(LU_NECKBASE, LU_PEGBOX.clone().addScaledVector(NDIR,-0.03), 0.022, 0.016, 6, P.wood);
    {
      const up = V(0,1,0), nu = new THREE.Vector3().crossVectors(up,NDIR).normalize(),
            nv = new THREE.Vector3().crossVectors(NDIR,nu).normalize();
      const a=LU_NECKBASE.clone().addScaledVector(nv,0.020), b=LU_PEGBOX.clone().addScaledVector(NDIR,-0.03).addScaledVector(nv,0.014);
      quad(a.clone().addScaledVector(nu,0.011), a.clone().addScaledVector(nu,-0.011),
           b.clone().addScaledVector(nu,-0.008), b.clone().addScaledVector(nu,0.008), P.woodDk, 0.02);
    }
    {
      const c = LU_PEGBOX;
      const up=V(0,1,0), nu=new THREE.Vector3().crossVectors(up,NDIR).normalize(), nv=new THREE.Vector3().crossVectors(NDIR,nu).normalize();
      const bx=0.020, by=0.011, bz=0.040;
      const cnr=(a,b,cc)=>c.clone().addScaledVector(nu,a*bx).addScaledVector(nv,b*by).addScaledVector(NDIR,cc*bz);
      quad(cnr(-1,1,-1),cnr(1,1,-1),cnr(1,1,1),cnr(-1,1,1), P.woodDk, 0.03);
      quad(cnr(-1,-1,-1),cnr(-1,-1,1),cnr(1,-1,1),cnr(1,-1,-1), P.woodDk, 0.03);
      quad(cnr(-1,-1,-1),cnr(-1,1,-1),cnr(-1,1,1),cnr(-1,-1,1), P.wood, 0.03);
      quad(cnr(1,-1,-1),cnr(1,-1,1),cnr(1,1,1),cnr(1,1,-1), P.wood, 0.03);
      for(const s of [-1,1]) for(const t of [-1,1]){
        const pc = c.clone().addScaledVector(nu, s*0.020).addScaledVector(NDIR, t*0.014);
        tube(pc, pc.clone().addScaledVector(nu, s*0.014), 0.005,0.006,5, P.brass, {capB:{hex:P.brass}});
      }
    }
    {
      const up=V(0,1,0), nu=new THREE.Vector3().crossVectors(up,NDIR).normalize();
      for(const off of [-0.050,-0.017,0.017,0.050]){
        const a = LU_BODY.clone().add(V(0.01,0.10,0.085)).addScaledVector(nu, off*0.62);
        const b = LU_PEGBOX.clone().addScaledVector(nu, off*0.42).addScaledVector(NDIR,-0.02);
        tube(a,b, 0.004,0.004,4, P.string);
      }
    }
  }

  /* TORSO — fitted doublet (broad dragonborn) */
  stack([
    {y:L.hipY,   rx:0.225, rz:0.170, hex:P.doubletDk},
    {y:L.waistY, rx:0.190, rz:0.148, hex:P.doublet},
    {y:L.ribY,   rx:0.230, rz:0.172, hex:P.doublet},
    {y:L.chestY, rx:0.268, rz:0.188, hex:P.doubletLt},
    {y:L.shldY,  rx:0.278, rz:0.180, hex:P.doublet},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.006}});
  stack([
    {y:0.60, rx:0.262, rz:0.202, hex:P.doubletDk},
    {y:0.72, rx:0.238, rz:0.178, hex:P.doublet},
  ], 8, {});
  stack([
    {y:0.805, rx:0.210, rz:0.162, hex:P.leather},
    {y:0.845, rx:0.207, rz:0.159, hex:P.leather},
  ], 8, {});
  quad(V(-0.032,0.812,0.166), V(0.032,0.812,0.166), V(0.032,0.844,0.162), V(-0.032,0.844,0.162), P.brass, 0.02);

  /* HALF-CAPE — off the left shoulder (broad dragonborn) */
  {
    const capeBands = [
      {y:L.shldY+0.045, cx:-0.13,  cz:-0.03, rx:0.220, rz:0.165},
      {y:0.94,          cx:-0.32,  cz:-0.09, rx:0.19, rz:0.14},
      {y:0.68,          cx:-0.34,  cz:-0.14, rx:0.24, rz:0.15},
      {y:0.44,          cx:-0.33,  cz:-0.17, rx:0.26, rz:0.15},
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

  /* HEAD — inherited dragonborn skull. EYELESS. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.100, rz:0.098, hex:P.scale},
      {y:L.muzzleY, rx:0.118, rz:0.116, hex:P.scale},
      {y:L.browY,   rx:0.122, rz:0.108, hex:P.scale},
      {y:L.crownY,  rx:0.098, rz:0.086, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]){ rings[2][i].z += 0.020; rings[2][i].y -= 0.010; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.004), P.scaleDk);
    const muzBase = V(0, L.muzzleY-0.01, 0.118);
    const muzMid  = V(0, L.muzzleY-0.030, 0.186);
    const muzTip  = V(0, L.muzzleY-0.050, 0.238);
    tube(muzBase, muzMid, 0.112, 0.094, n, P.scale, {raz:0.100, rbz:0.086, phase:ph});
    tube(muzMid, muzTip, 0.094, 0.066, n, P.scaleLt, {raz:0.086, rbz:0.060, phase:ph, capB:{hex:P.scaleDk, lift:0.014}});
    quad(V(-0.058,L.muzzleY-0.070,0.128), V(0.058,L.muzzleY-0.070,0.128),
         V(0.036,L.muzzleY-0.086,0.224), V(-0.036,L.muzzleY-0.086,0.224), P.scaleBelly, 0.05);
    for(const s of [-1,1]){
      const hb = V(s*0.072, L.crownY-0.015, -0.020);
      const ht = V(s*0.098, L.crownY+0.075, -0.115);
      tube(hb, ht, 0.032, 0.012, 6, P.horn, {capB:{hex:P.hornTip, lift:0.008}});
    }
  }

  /* JAUNTY FEATHERED CAP — small crown between the horns + one big feather */
  {
    const n=9, ph=Math.PI/n;
    const capBands=[
      {y:L.crownY+0.03, rx:0.114, rz:0.106, cx:0.0,   cz:0.0},
      {y:L.crownY+0.08, rx:0.104, rz:0.096, cx:0.006, cz:-0.006},
      {y:L.crownY+0.13, rx:0.074, rz:0.066, cx:0.016, cz:-0.014},
      {y:L.crownY+0.19, rx:0.038, rz:0.032, cx:0.026, cz:-0.024},
    ];
    const rings = capBands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, ()=>P.cap);
    capFan(rings.at(-1), V(0.032,L.crownY+0.225,-0.03), P.capDk);
    const brimOut = ring(V(0,L.crownY+0.025,0.0), V(0,1,0), 0.132, 0.124, n, ph).map((p,i)=>{
      if(i===1||i===2) p.y += 0.022; return p;
    });
    const brimIn = ring(V(0,L.crownY+0.032,0.0), V(0,1,0), 0.088, 0.082, n, ph);
    stitch([brimIn, brimOut], ()=>P.capDk);
    capFan(brimOut, V(0,L.crownY+0.020,0.0), P.capDk, true);
    {
      const root = V(-0.110, L.crownY+0.07, -0.05);
      const tip  = root.clone().add(V(-0.06, 0.32, -0.10));
      const mid  = root.clone().lerp(tip,0.5).add(V(-0.025,0.01,-0.01));
      const w = 0.048;
      const side = new THREE.Vector3().crossVectors(V(0,1,0), tip.clone().sub(root)).normalize();
      quad(root.clone().addScaledVector(side,w*0.5), mid.clone().addScaledVector(side,w*0.32),
           tip.clone(), mid.clone().addScaledVector(side,-w*0.32), P.feather, 0.05);
      quad(root.clone().addScaledVector(side,-w*0.5), mid.clone().addScaledVector(side,-w*0.32),
           tip.clone(), mid.clone().addScaledVector(side,w*0.32), P.featherDk, 0.05);
      tube(root, tip, 0.008,0.003,4, P.featherDk);
    }
  }

  /* ARMS — RIGHT strums, LEFT frets. Both derive from the lute (broad dragonborn). */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(0.290, 0.900, 0.21);
    tube(S,E,0.098,0.074,6,P.doublet);
    tube(E,STRUM.clone().add(V(-0.01,0.02,-0.02)),0.070,0.056,6,P.doubletDk,{capB:{hex:P.linenDk}});
    tube(STRUM.clone().add(V(-0.03,-0.01,0.01)), STRUM.clone().add(V(0.03,0.03,0.03)), 0.062,0.056,6,P.scale,
         {capA:{hex:P.scale}, capB:{hex:P.scale}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(-0.20, 0.98, 0.14);
    tube(S2,E2,0.098,0.074,6,P.doublet);
    tube(E2,FRET.clone().add(V(0.0,0.0,-0.02)),0.070,0.056,6,P.doubletDk,{capB:{hex:P.linenDk}});
    tube(FRET.clone().addScaledVector(NDIR,-0.05), FRET.clone().addScaledVector(NDIR,0.05), 0.058,0.052,6,P.scale,
         {capA:{hex:P.scale}, capB:{hex:P.scale}});
  }

  /* LEGS — one knee bent, tall boots (broad dragonborn) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.160,0.40,0.03), ankL=V(-0.170,0.085,0.015);
    tube(hipL,kneeL,0.100,0.072,6,P.trouser);
    tube(kneeL,ankL,0.070,0.052,6,P.trouser);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.235,0.44,0.155), ankR=V( 0.190,0.085,0.080);
    tube(hipR,kneeR,0.100,0.072,6,P.trouser);
    tube(kneeR,ankR,0.070,0.052,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.05,0,1)], [ankR,V(0.55,0,0.85).normalize()]]){
      stack([
        {y:0.012, rx:0.078, rz:0.086, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.070, rz:0.072, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.24,  rx:0.076, rz:0.074, cx:ank.x, cz:ank.z, hex:P.leatherDk},
        {y:0.34,  rx:0.080, rz:0.076, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.006}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.140), 0.062,0.046,6,P.boot, {capB:{hex:P.boot, lift:0.014}, raz:0.054, rbz:0.038});
    }
  }

  /* TAIL — thick tapering dragonborn tail (inherited) */
  {
    const root = V(0.04, L.hipY-0.14, -0.245);
    const t1   = V(0.230,0.545, -0.320);
    const t2   = V(0.360,0.400, -0.360);
    const t3   = V(0.445,0.270, -0.360);
    const t4   = V(0.470,0.165, -0.320);
    const tip  = V(0.470,0.115, -0.255);
    tube(root, t1, 0.112, 0.092, 8, P.scale,   {phase:Math.PI/8});
    tube(t1,   t2, 0.092, 0.070, 8, P.scale,   {phase:Math.PI/8});
    tube(t2,   t3, 0.070, 0.046, 8, P.scaleLt, {phase:Math.PI/8});
    tube(t3,   t4, 0.046, 0.025, 8, P.scaleLt, {phase:Math.PI/8});
    tube(t4,   tip,0.025, 0.012, 8, P.scaleDk, {phase:Math.PI/8, capB:{hex:P.scaleDk, lift:0.006}});
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
