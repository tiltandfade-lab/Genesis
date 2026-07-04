/* dev/model-qa/creatures/dwarf-bard.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave A2).
   The FIXED dwarf race (squat-broad race-dwarf proportions + massive beard + eyeless head) wearing the
   BARD kit (bard.js signature: a LUTE authored first — pear body, angled neck, peg-box — cradled across
   the torso so BOTH hands derive from it, a jaunty FEATHERED CAP, a fitted doublet). The dwarf's beard
   flows out beneath the feathered cap — a boisterous tavern-minstrel read. One whole-object function. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDwarfBard(){
  const P = {
    doublet:0x7a3b3f, doubletDk:0x5c2c2f, doubletLt:0x8f4a4d,
    linen:0xcfc4a6, linenDk:0x8d846c,
    skin:0xb98a63, skinDk:0x7f5f42,
    beard:0x9a9086, beardDk:0x6d655c, eye:0x1a1512,
    leather:0x4e3d2a, leatherDk:0x3a2d1f,
    boot:0x3c3226, trouser:0x53433a,
    wood:0xa3703f, woodDk:0x7a4e2a, string:0xd8cfa8,
    cap:0x384d63, capDk:0x293a4c, feather:0xb54a3a, featherDk:0x7d3226,
    brass:0xb08d46, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.42, waistY:0.475, ribY:0.555, chestY:0.635, shldY:0.70, neckY:0.735,
    hipHalf:0.135, shoulderX:0.235,
    jawY:0.765, cheekY:0.825, browY:0.885, crownY:0.975, headTopY:1.04,
  };

  /* LUTE FIRST — cradled low-left across the torso, neck up-right past the shoulder (scaled dwarf) */
  const LU_BODY = V(-0.100, 0.44, 0.32);
  const LU_NECKBASE = V(0.020, 0.66, 0.25);
  const LU_PEGBOX = V(0.245, 1.02, 0.15);
  const NDIR = new THREE.Vector3().subVectors(LU_PEGBOX, LU_NECKBASE).normalize();
  const STRUM = LU_BODY.clone().add(V(0.066, 0.072, 0.135));
  const FRET  = LU_NECKBASE.clone().addScaledVector(NDIR, 0.54);
  {
    blob(LU_BODY.x, LU_BODY.y - 0.070, LU_BODY.z, 0.150, 0.150, 0.074, P.woodDk, 8, 5);
    blob(LU_BODY.x, LU_BODY.y + 0.090, LU_BODY.z + 0.010, 0.108, 0.114, 0.064, P.wood, 8, 4);
    {
      const oc = LU_BODY.clone().add(V(0.010, 0.010, 0.080));
      const n=8, rO=ring(oc, V(0,0,1), 0.038, 0.038, n), rI=ring(oc.clone().add(V(0,0,-0.005)), V(0,0,1), 0.026,0.026,n);
      stitch([rI, rO], ()=>P.woodDk);
      capFan(rI, oc.clone().add(V(0,0,-0.010)), 0x1e1712);
    }
    tube(LU_NECKBASE, LU_PEGBOX.clone().addScaledVector(NDIR,-0.02), 0.020, 0.015, 6, P.wood);
    {
      const c = LU_PEGBOX;
      const up=V(0,1,0), nu=new THREE.Vector3().crossVectors(up,NDIR).normalize(), nv=new THREE.Vector3().crossVectors(NDIR,nu).normalize();
      const bx=0.019, by=0.010, bz=0.036;
      const cnr=(a,b,cc)=>c.clone().addScaledVector(nu,a*bx).addScaledVector(nv,b*by).addScaledVector(NDIR,cc*bz);
      quad(cnr(-1,1,-1),cnr(1,1,-1),cnr(1,1,1),cnr(-1,1,1), P.woodDk, 0.03);
      quad(cnr(-1,-1,-1),cnr(-1,-1,1),cnr(1,-1,1),cnr(1,-1,-1), P.woodDk, 0.03);
      quad(cnr(-1,-1,-1),cnr(-1,1,-1),cnr(-1,1,1),cnr(-1,-1,1), P.wood, 0.03);
      quad(cnr(1,-1,-1),cnr(1,-1,1),cnr(1,1,1),cnr(1,1,-1), P.wood, 0.03);
    }
    {
      const up=V(0,1,0), nu=new THREE.Vector3().crossVectors(up,NDIR).normalize();
      for(const off of [-0.046,-0.016,0.016,0.046]){
        const a = LU_BODY.clone().add(V(0.010,0.086,0.078)).addScaledVector(nu, off*0.62);
        const b = LU_PEGBOX.clone().addScaledVector(nu, off*0.42).addScaledVector(NDIR,-0.02);
        tube(a,b, 0.004,0.004,4, P.string);
      }
    }
  }

  /* TORSO — fitted doublet (dwarf broad) */
  stack([
    {y:L.hipY,   rx:0.222, rz:0.172, hex:P.doubletDk},
    {y:L.waistY, rx:0.232, rz:0.180, hex:P.doublet},
    {y:L.ribY,   rx:0.246, rz:0.190, hex:P.doublet},
    {y:L.chestY, rx:0.254, rz:0.196, hex:P.doubletLt},
    {y:L.shldY,  rx:0.256, rz:0.188, hex:P.doublet},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.linenDk},
  ], 8, {capTop:{hex:P.linenDk, lift:0.005}});
  /* short doublet hem flare */
  stack([
    {y:0.30, rx:0.250, rz:0.196, hex:P.doubletDk},
    {y:0.40, rx:0.236, rz:0.184, hex:P.doublet},
  ], 8, {});
  /* belt + buckle */
  stack([
    {y:L.waistY-0.02, rx:0.244, rz:0.190, hex:P.leather},
    {y:L.waistY+0.02, rx:0.242, rz:0.188, hex:P.leather},
  ], 8, {});
  quad(V(-0.028,L.waistY-0.014,0.194), V(0.028,L.waistY-0.014,0.194), V(0.028,L.waistY+0.020,0.190), V(-0.028,L.waistY+0.020,0.190), P.brass, 0.02);

  /* HEAD — inherited dwarf (eyeless) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.098, rz:0.104, hex:P.skin},
      {y:L.cheekY, rx:0.128, rz:0.122, hex:P.skin},
      {y:L.browY,  rx:0.132, rz:0.118, hex:P.skin},
      {y:L.crownY, rx:0.100, rz:0.090, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.026;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
  }

  /* MASSIVE BEARD (inherited) */
  {
    const bands=[
      {y:L.jawY+0.005, rx:0.125, rz:0.095, cz:0.135, hex:P.beard},
      {y:L.cheekY-0.05, rx:0.120, rz:0.088, cz:0.185, hex:P.beard},
      {y:0.735,         rx:0.112, rz:0.080, cz:0.225, hex:P.beard},
      {y:0.665,         rx:0.100, rz:0.070, cz:0.250, hex:P.beard},
      {y:0.59,          rx:0.086, rz:0.060, cz:0.260, hex:P.beardDk},
      {y:0.515,         rx:0.066, rz:0.048, cz:0.250, hex:P.beardDk},
      {y:L.waistY+0.01, rx:0.044, rz:0.034, cz:0.215, hex:P.beardDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.waistY-0.03,0.185), P.beardDk);
  }

  /* JAUNTY FEATHERED CAP — soft cap crown + upturned brim + one big feather */
  {
    const n=9, ph=Math.PI/n;
    const capBands=[
      {y:L.browY+0.028, rx:0.152, rz:0.144, cx:0.0,   cz:0.0},
      {y:L.browY+0.075, rx:0.144, rz:0.136, cx:0.008, cz:-0.006},
      {y:L.crownY+0.03, rx:0.118, rz:0.108, cx:0.020, cz:-0.016},
      {y:L.crownY+0.11, rx:0.072, rz:0.064, cx:0.032, cz:-0.028},
    ];
    const rings = capBands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, ()=>P.cap);
    capFan(rings.at(-1), V(0.040,L.crownY+0.15,-0.03), P.capDk);
    const brimOut = ring(V(0,L.browY+0.022,0.0), V(0,1,0), 0.186, 0.174, n, ph).map((p,i)=>{
      if(i===1||i===2) p.y += 0.030;
      return p;
    });
    const brimIn = ring(V(0,L.browY+0.030,0.0), V(0,1,0), 0.122, 0.114, n, ph);
    stitch([brimIn, brimOut], ()=>P.capDk);
    capFan(brimOut, V(0,L.browY+0.016,0.0), P.capDk, true);
    {
      const root = V(-0.150, L.browY+0.06, -0.05);
      const tip  = root.clone().add(V(-0.06, 0.36, -0.10));
      const mid  = root.clone().lerp(tip,0.5).add(V(-0.025,0.01,-0.01));
      const w = 0.050;
      const side = new THREE.Vector3().crossVectors(V(0,1,0), tip.clone().sub(root)).normalize();
      quad(root.clone().addScaledVector(side,w*0.5), mid.clone().addScaledVector(side,w*0.32),
           tip.clone(), mid.clone().addScaledVector(side,-w*0.32), P.feather, 0.05);
      quad(root.clone().addScaledVector(side,-w*0.5), mid.clone().addScaledVector(side,-w*0.32),
           tip.clone(), mid.clone().addScaledVector(side,w*0.32), P.featherDk, 0.05);
      tube(root, tip, 0.008,0.003,4, P.featherDk);
    }
  }

  /* ARMS — RIGHT strums (to STRUM, low over the lute body), LEFT frets (to FRET). Both derive
     from the lute. The strum elbow rides just above the sound-hole so the forearm rakes DOWN onto
     the strings (not a raised fist). */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const E=V(0.215, 0.560, 0.28);
    tube(S,E,0.090,0.072,6,P.doublet);
    tube(E,STRUM.clone().add(V(0.0,0.02,0.0)),0.066,0.050,6,P.doubletDk,{capB:{hex:P.linenDk}});
    tube(STRUM.clone().add(V(-0.03,-0.01,0.01)), STRUM.clone().add(V(0.03,0.03,0.03)), 0.052,0.046,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const E2=V(-0.200, 0.700, 0.12);
    tube(S2,E2,0.090,0.072,6,P.doublet);
    tube(E2,FRET.clone().add(V(0.0,0.0,-0.02)),0.066,0.050,6,P.doubletDk,{capB:{hex:P.linenDk}});
    tube(FRET.clone().addScaledVector(NDIR,-0.05), FRET.clone().addScaledVector(NDIR,0.05), 0.050,0.044,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — short thick, one knee relaxed, tall boots */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), ankL=V(-0.155,0.085,0.03);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), ankR=V( 0.185,0.085,0.09);
    tube(hipL,ankL,0.096,0.072,6,P.trouser);
    tube(hipR,ankR,0.096,0.072,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(-0.06,0,1)], [ankR,V(0.45,0,0.88).normalize()]]){
      stack([
        {y:0.012, rx:0.078, rz:0.086, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.11,  rx:0.070, rz:0.072, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.165, rx:0.076, rz:0.076, cx:ank.x, cz:ank.z, hex:P.leatherDk},
      ], 6, {capTop:{hex:P.leatherDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.140), 0.064,0.048,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.054, rbz:0.038});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
