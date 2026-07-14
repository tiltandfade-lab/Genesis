/* dev/model-qa/creatures/halfling-bard.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED halfling race (slim ~1.0u, curly hair-cap, BARE oversized feet) wearing the BARD kit
   (bard.js signature: a LUTE authored first — pear body + angled neck + peg-box — cradled across the
   torso so BOTH hands derive from it, a fitted doublet). The halfling keeps its curly hair + bare
   feet (no feathered cap needed — the curls are the crown read, and the bare feet + lute say
   "wandering hobbit minstrel"). One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildHalflingBard(){
  const P = {
    doublet:0x4a6b52, doubletDk:0x354f3c, doubletLt:0x5c8064,   /* forest-green doublet */
    linen:0xcfc4a6, linenDk:0x8d846c,
    skin:0xc99b70, skinDk:0x8e6c4c, footpad:0xc99b70, footpadDk:0x8e6c4c,
    hair:0x5a3c26, hairDk:0x412a1a, eye:0x1a1512,
    leather:0x4e3d2a, leatherDk:0x3a2d1f,
    trouser:0xb8ad8a, trouserDk:0x8f8468,
    wood:0xa3703f, woodDk:0x7a4e2a, string:0xd8cfa8,
    brass:0xb08d46, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.375, waistY:0.425, ribY:0.475, chestY:0.525, shldY:0.565, neckY:0.595,
    hipHalf:0.088, shoulderX:0.135,
    jawY:0.625, cheekY:0.695, browY:0.765, crownY:0.87, headTopY:0.955,
  };

  /* LUTE FIRST — cradled low-left, neck up-right past the shoulder (scaled slim halfling) */
  const LU_BODY = V(-0.08, 0.36, 0.24);
  const LU_NECKBASE = V(0.015, 0.55, 0.19);
  const LU_PEGBOX = V(0.190, 0.86, 0.115);
  const NDIR = new THREE.Vector3().subVectors(LU_PEGBOX, LU_NECKBASE).normalize();
  const STRUM = LU_BODY.clone().add(V(0.052, 0.058, 0.115));
  const FRET  = LU_NECKBASE.clone().addScaledVector(NDIR, 0.44);
  {
    blob(LU_BODY.x, LU_BODY.y - 0.058, LU_BODY.z, 0.116, 0.116, 0.058, P.woodDk, 8, 5);
    blob(LU_BODY.x, LU_BODY.y + 0.074, LU_BODY.z + 0.008, 0.084, 0.088, 0.050, P.wood, 8, 4);
    {
      const oc = LU_BODY.clone().add(V(0.008, 0.008, 0.062));
      const n=8, rO=ring(oc, V(0,0,1), 0.030, 0.030, n), rI=ring(oc.clone().add(V(0,0,-0.005)), V(0,0,1), 0.020,0.020,n);
      stitch([rI, rO], ()=>P.woodDk);
      capFan(rI, oc.clone().add(V(0,0,-0.010)), 0x1e1712);
    }
    tube(LU_NECKBASE, LU_PEGBOX.clone().addScaledVector(NDIR,-0.02), 0.016, 0.012, 6, P.wood);
    {
      const c = LU_PEGBOX;
      const up=V(0,1,0), nu=new THREE.Vector3().crossVectors(up,NDIR).normalize(), nv=new THREE.Vector3().crossVectors(NDIR,nu).normalize();
      const bx=0.015, by=0.008, bz=0.028;
      const cnr=(a,b,cc)=>c.clone().addScaledVector(nu,a*bx).addScaledVector(nv,b*by).addScaledVector(NDIR,cc*bz);
      quad(cnr(-1,1,-1),cnr(1,1,-1),cnr(1,1,1),cnr(-1,1,1), P.woodDk, 0.03);
      quad(cnr(-1,-1,-1),cnr(-1,-1,1),cnr(1,-1,1),cnr(1,-1,-1), P.woodDk, 0.03);
      quad(cnr(-1,-1,-1),cnr(-1,1,-1),cnr(-1,1,1),cnr(-1,-1,1), P.wood, 0.03);
      quad(cnr(1,-1,-1),cnr(1,-1,1),cnr(1,1,1),cnr(1,1,-1), P.wood, 0.03);
    }
    {
      const up=V(0,1,0), nu=new THREE.Vector3().crossVectors(up,NDIR).normalize();
      for(const off of [-0.035,-0.012,0.012,0.035]){
        const a = LU_BODY.clone().add(V(0.008,0.068,0.060)).addScaledVector(nu, off*0.62);
        const b = LU_PEGBOX.clone().addScaledVector(nu, off*0.42).addScaledVector(NDIR,-0.02);
        tube(a,b, 0.003,0.003,4, P.string);
      }
    }
  }

  /* TORSO — fitted doublet */
  stack([
    {y:L.hipY,   rx:0.120, rz:0.098, hex:P.doubletDk},
    {y:L.waistY, rx:0.110, rz:0.088, hex:P.doublet},
    {y:L.ribY,   rx:0.120, rz:0.094, hex:P.doublet},
    {y:L.chestY, rx:0.130, rz:0.098, hex:P.doubletLt},
    {y:L.shldY,  rx:0.132, rz:0.094, hex:P.doublet},
    {y:L.neckY,  rx:0.058, rz:0.054, hex:P.linenDk},
  ], 8, {capTop:{hex:P.linenDk, lift:0.004}});
  /* short doublet hem */
  stack([
    {y:0.30, rx:0.152, rz:0.124, hex:P.doubletDk},
    {y:0.37, rx:0.132, rz:0.104, hex:P.doublet},
  ], 8, {});
  /* belt + buckle */
  stack([
    {y:L.waistY-0.015, rx:0.114, rz:0.092, hex:P.leather},
    {y:L.waistY+0.012, rx:0.112, rz:0.090, hex:P.leather},
  ], 8, {});
  quad(V(-0.014,L.waistY-0.010,0.096), V(0.014,L.waistY-0.010,0.096), V(0.014,L.waistY+0.014,0.093), V(-0.014,L.waistY+0.014,0.093), P.brass, 0.02);

  /* HEAD — inherited halfling */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.072, rz:0.078, hex:P.skin},
      {y:L.cheekY, rx:0.098, rz:0.096, hex:P.skin},
      {y:L.browY,  rx:0.102, rz:0.094, hex:P.skin},
      {y:L.crownY, rx:0.080, rz:0.072, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.006), P.skinDk);
  }

  /* CURLY HAIR CAP — the halfling icon (inherited) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.045, rx:0.104, rz:0.096, hex:P.hairDk},
      {y:L.crownY-0.005,rx:0.114, rz:0.104, hex:P.hair},
      {y:L.crownY+0.045,rx:0.098, rz:0.088, hex:P.hair},
      {y:L.headTopY+0.010, rx:0.060, rz:0.053, hex:P.hairDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,-0.004), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY+0.045, -0.004), P.hairDk);
    for(const a of [0.3,1.1,2.0,2.9,3.7,4.6,5.4]){
      const cx=Math.cos(a)*0.100, cz=Math.sin(a)*0.094-0.004, cy=L.crownY+Math.sin(a*3)*0.018;
      const base=V(cx,cy,cz), out=base.clone().addScaledVector(V(cx,0.01,cz).normalize(),0.014);
      tube(base, out, 0.016, 0.014, 4, P.hair, {capB:{hex:P.hair, lift:0.003}});
    }
  }

  /* ARMS — RIGHT strums, LEFT frets (both derive from the lute) */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const E=V(0.145, 0.55, 0.15);
    tube(S,E,0.036,0.030,6,P.doublet);
    tube(E,STRUM.clone().add(V(-0.01,0.015,-0.015)),0.028,0.024,6,P.doubletDk,{capB:{hex:P.linenDk}});
    tube(STRUM.clone().add(V(-0.02,-0.01,0.01)), STRUM.clone().add(V(0.02,0.025,0.025)), 0.026,0.022,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const E2=V(-0.125, 0.57, 0.09);
    tube(S2,E2,0.036,0.030,6,P.doublet);
    tube(E2,FRET.clone().add(V(0.0,0.0,-0.015)),0.028,0.024,6,P.doubletDk,{capB:{hex:P.linenDk}});
    tube(FRET.clone().addScaledVector(NDIR,-0.04), FRET.clone().addScaledVector(NDIR,0.04), 0.026,0.022,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — one knee bent (relaxed), rolled trousers + BARE oversized feet */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.008, 0.008), shinL=V(-0.098,0.185,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.008, 0.006), shinR=V( 0.135,0.20,0.11);
    tube(hipL,shinL,0.058,0.042,6,P.trouser);
    tube(hipR,shinR,0.058,0.042,6,P.trouser);
    for(const shin of [shinL,shinR]){
      stack([{y:0.16, rx:0.046, rz:0.038, cx:shin.x, cz:shin.z, hex:P.trouserDk},{y:0.20, rx:0.050, rz:0.041, cx:shin.x, cz:shin.z, hex:P.trouserDk}],6,{capTop:{hex:P.trouserDk,lift:0.003}});
    }
    for(const [shin,toeDir] of [[shinL,V(-0.06,0,1)], [shinR,V(0.40,0,0.92).normalize()]]){
      const ankBot=V(shin.x, 0.075, shin.z);
      tube(shin, ankBot, 0.040, 0.062, 6, P.skin);
      stack([
        {y:0.016, rx:0.078, rz:0.096, cx:shin.x, cz:shin.z, hex:P.footpadDk},
        {y:0.065, rx:0.072, rz:0.084, cx:shin.x, cz:shin.z, hex:P.footpad},
      ], 6, {capTop:{hex:P.footpad, lift:0.003}, capBot:{hex:P.footpadDk, lift:0.0}});
      const toeA=V(shin.x,0.040,shin.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.155), 0.072,0.054,6,P.footpad, {capB:{hex:P.footpad, lift:0.017}, raz:0.062, rbz:0.044});
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
