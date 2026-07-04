/* dev/model-qa/creatures/gnome-bard.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4).
   The FIXED gnome race (post-F1 big head + wedge ears + wide eyes, stubby pot-belly frame) wearing
   the BARD kit (bard.js signature: a LUTE authored first — pear body, angled neck, peg-box — cradled
   across the torso so BOTH hands derive from it, a jaunty FEATHERED CAP replacing the plain gnome cap,
   a fitted doublet). Scaled to the small gnome. Must read as ITS RACE: big head + ears at board
   distance, not a short human. One whole-object function, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGnomeBard(){
  const P = {
    doublet:0x7a3b3f, doubletDk:0x5c2c2f, doubletLt:0x8f4a4d,
    linen:0xcfc4a6, linenDk:0x8d846c,
    skin:0xcf9f78, skinDk:0x93714f, ear:0xc08a5e, eye:0x1a1512,
    leather:0x4e3d2a, leatherDk:0x3a2d1f,
    boot:0x3c3226, trouser:0x53433a,
    wood:0xa3703f, woodDk:0x7a4e2a, string:0xd8cfa8,
    cap:0x384d63, capDk:0x293a4c, feather:0xb54a3a, featherDk:0x7d3226,
    brass:0xb08d46, disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.335, waistY:0.375, ribY:0.420, chestY:0.455, shldY:0.485, neckY:0.515,
    shoulderX:0.145,
    jawY:0.545, cheekY:0.610, browY:0.680, crownY:0.760, headTopY:0.815,
  };

  /* LUTE FIRST — cradled low-left across the torso, neck up-right past the shoulder (scaled small) */
  const LU_BODY = V(-0.075, 0.32, 0.24);
  const LU_NECKBASE = V(0.015, 0.50, 0.19);
  const LU_PEGBOX = V(0.185, 0.80, 0.115);
  const NDIR = new THREE.Vector3().subVectors(LU_PEGBOX, LU_NECKBASE).normalize();
  const STRUM = LU_BODY.clone().add(V(0.050, 0.055, 0.115));
  const FRET  = LU_NECKBASE.clone().addScaledVector(NDIR, 0.42);
  {
    blob(LU_BODY.x, LU_BODY.y - 0.055, LU_BODY.z, 0.115, 0.115, 0.058, P.woodDk, 8, 5);
    blob(LU_BODY.x, LU_BODY.y + 0.070, LU_BODY.z + 0.008, 0.082, 0.086, 0.050, P.wood, 8, 4);
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
        const a = LU_BODY.clone().add(V(0.008,0.065,0.060)).addScaledVector(nu, off*0.62);
        const b = LU_PEGBOX.clone().addScaledVector(nu, off*0.42).addScaledVector(NDIR,-0.02);
        tube(a,b, 0.003,0.003,4, P.string);
      }
    }
  }

  /* TORSO — fitted doublet, gnome pot-belly kept modest */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.128, hex:P.doubletDk},
    {y:L.waistY, rx:0.175, rz:0.150, hex:P.doublet},
    {y:L.chestY, rx:0.158, rz:0.132, hex:P.doubletLt},
    {y:L.shldY,  rx:0.148, rz:0.124, hex:P.doublet},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.linenDk},
  ], 8, {capTop:{hex:P.linenDk, lift:0.004}});
  /* short doublet hem flare */
  stack([
    {y:0.26, rx:0.192, rz:0.160, hex:P.doubletDk},
    {y:0.33, rx:0.172, rz:0.140, hex:P.doublet},
  ], 8, {});
  /* belt + buckle */
  stack([
    {y:L.waistY-0.015, rx:0.178, rz:0.152, hex:P.leather},
    {y:L.waistY+0.012, rx:0.176, rz:0.150, hex:P.leather},
  ], 8, {});
  quad(V(-0.020,L.waistY-0.012,0.156), V(0.020,L.waistY-0.012,0.156), V(0.020,L.waistY+0.016,0.152), V(-0.020,L.waistY+0.016,0.152), P.brass, 0.02);

  /* HEAD — inherited gnome */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.098, rz:0.106, hex:P.skin},
      {y:L.cheekY, rx:0.134, rz:0.128, hex:P.skin},
      {y:L.browY,  rx:0.138, rz:0.126, hex:P.skin},
      {y:L.crownY, rx:0.106, rz:0.097, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.026;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], V(0, L.headTopY, 0.010), P.skinDk);
    for(const s of [-1,1]){
      const ex=s*0.072, ey=(L.cheekY+L.browY)/2-0.004, ez=0.150;
      quad(V(ex-0.016,ey-0.012,ez), V(ex+0.016,ey-0.012,ez),
           V(ex+0.016,ey+0.014,ez-0.007), V(ex-0.016,ey+0.014,ez-0.007), P.eye, 0.0);
    }
    for(const s of [-1,1]){
      const eb=V(s*0.128, L.cheekY+0.008, 0.016);
      const et=eb.clone().add(V(s*0.078, 0.032, -0.010));
      tube(eb, et, 0.024, 0.009, 5, P.ear, {capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.004}});
    }
  }

  /* JAUNTY FEATHERED CAP — a soft cap crown + upturned brim + one big feather (replaces the gnome cap) */
  {
    const n=9, ph=Math.PI/n;
    const capBands=[
      {y:L.browY+0.028, rx:0.150, rz:0.142, cx:0.0,   cz:0.0},
      {y:L.browY+0.070, rx:0.142, rz:0.134, cx:0.008, cz:-0.006},
      {y:L.crownY+0.03, rx:0.116, rz:0.106, cx:0.020, cz:-0.016},
      {y:L.crownY+0.10, rx:0.070, rz:0.062, cx:0.032, cz:-0.028},
    ];
    const rings = capBands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, ()=>P.cap);
    capFan(rings.at(-1), V(0.040,L.crownY+0.14,-0.03), P.capDk);
    const brimOut = ring(V(0,L.browY+0.022,0.0), V(0,1,0), 0.184, 0.172, n, ph).map((p,i)=>{
      if(i===1||i===2) p.y += 0.030;
      return p;
    });
    const brimIn = ring(V(0,L.browY+0.030,0.0), V(0,1,0), 0.120, 0.112, n, ph);
    stitch([brimIn, brimOut], ()=>P.capDk);
    capFan(brimOut, V(0,L.browY+0.016,0.0), P.capDk, true);
    {
      const root = V(-0.140, L.browY+0.05, -0.05);
      const tip  = root.clone().add(V(-0.06, 0.32, -0.10));
      const mid  = root.clone().lerp(tip,0.5).add(V(-0.025,0.01,-0.01));
      const w = 0.045;
      const side = new THREE.Vector3().crossVectors(V(0,1,0), tip.clone().sub(root)).normalize();
      quad(root.clone().addScaledVector(side,w*0.5), mid.clone().addScaledVector(side,w*0.32),
           tip.clone(), mid.clone().addScaledVector(side,-w*0.32), P.feather, 0.05);
      quad(root.clone().addScaledVector(side,-w*0.5), mid.clone().addScaledVector(side,-w*0.32),
           tip.clone(), mid.clone().addScaledVector(side,w*0.32), P.featherDk, 0.05);
      tube(root, tip, 0.007,0.003,4, P.featherDk);
    }
  }

  /* ARMS — RIGHT strums (to STRUM), LEFT frets (to FRET). Both derive from the lute. */
  {
    const S=V(L.shoulderX, L.shldY-0.005, 0.02);
    const E=V(0.155, 0.475, 0.15);
    tube(S,E,0.050,0.040,6,P.doublet);
    tube(E,STRUM.clone().add(V(-0.01,0.015,-0.015)),0.036,0.028,6,P.doubletDk,{capB:{hex:P.linenDk}});
    tube(STRUM.clone().add(V(-0.02,-0.01,0.01)), STRUM.clone().add(V(0.02,0.025,0.025)), 0.030,0.026,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.005, 0.02);
    const E2=V(-0.115, 0.50, 0.09);
    tube(S2,E2,0.050,0.040,6,P.doublet);
    tube(E2,FRET.clone().add(V(0.0,0.0,-0.015)),0.036,0.028,6,P.doubletDk,{capB:{hex:P.linenDk}});
    tube(FRET.clone().addScaledVector(NDIR,-0.04), FRET.clone().addScaledVector(NDIR,0.04), 0.028,0.024,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEGS — one knee bent (relaxed performer), stubby gnome legs, tall boots */
  {
    const hipL=V(-0.095, L.hipY-0.01, 0.01), kneeL=V(-0.110,0.20,0.02), ankL=V(-0.115,0.075,0.01);
    tube(hipL,kneeL,0.062,0.046,6,P.trouser); tube(kneeL,ankL,0.044,0.034,6,P.trouser);
    const hipR=V( 0.095, L.hipY-0.01, 0.00), kneeR=V( 0.150,0.22,0.09), ankR=V( 0.120,0.075,0.05);
    tube(hipR,kneeR,0.062,0.046,6,P.trouser); tube(kneeR,ankR,0.044,0.034,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.05,0,1)], [ankR,V(0.55,0,0.85).normalize()]]){
      stack([
        {y:0.010, rx:0.056, rz:0.064, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.085, rx:0.050, rz:0.052, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.16,  rx:0.056, rz:0.054, cx:ank.x, cz:ank.z, hex:P.leatherDk},
      ], 6, {capTop:{hex:P.boot, lift:0.006}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.108), 0.046,0.034,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.040, rbz:0.028});
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
