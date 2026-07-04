/* dev/model-qa/creatures/halforc-rogue.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED half-orc race (heavy/broad frame, gray-green skin, heavy jaw + tusk nubs + jutting brow)
   wearing the ROGUE kit (rogue.js signature: a low SNEAKY CROUCH with a forward lean, TWIN DAGGERS
   held CLOSE — lead hand forward-stab, off hand reverse/ice-pick grip tucked to the ribs — a hood +
   leather + crossed baldric). A hulking half-orc cutthroat coiled low; the tusks + brow read under
   the hood. EYELESS. Daggers authored inline first (grips = ground truth). One whole-object function,
   no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalfOrcRogue(){
  const P = {
    hood:0x3a3d40, hoodDk:0x282a2c,
    leather:0x4a3a28, leatherDk:0x33281b, leatherLt:0x5c4832,
    strap:0x2a2119, trouser:0x342c22, boot:0x241d15,
    skin:0x7a8a6e, skinDk:0x525e48, skinLt:0x8fa080,
    tusk:0xd8cdae, tuskDk:0xb9ac86, hair:0x2a2420, hairDk:0x1c1815,
    steel:0x9aa1a6, steelDk:0x6b7176, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.735, waistY:0.815, ribY:0.930, chestY:1.045, shldY:1.130, neckY:1.180,
    hipHalf:0.128, shoulderX:0.278,
    jawY:1.205, cheekY:1.288, browY:1.372, crownY:1.462, headTopY:1.520,
  };

  /* THE CROUCH TRANSFORM — drop the upper body + pitch forward about a low hip pivot */
  const DROP = 0.22, PITCH = 0.34;
  const PIVOT = V(0.0, L.hipY - DROP, 0.02);
  const crouch = (p)=>{
    const q = p.clone().add(V(0, -DROP, 0)).sub(PIVOT);
    q.applyAxisAngle(V(1,0,0), PITCH);
    return q.add(PIVOT);
  };

  /* inline DAGGER — a short cross-guard + tapered blade along `dir` from `grip`; returns the fist pt */
  function dagger(grip, dir){
    const d = dir.clone().normalize();
    const up = Math.abs(d.y)>0.9?V(0,0,1):V(0,1,0);
    const gu = new THREE.Vector3().crossVectors(up,d).normalize();
    const gv = new THREE.Vector3().crossVectors(d,gu).normalize();
    /* pommel + grip (behind the fist) */
    const pommel = grip.clone().addScaledVector(d,-0.075);
    tube(pommel, grip.clone().addScaledVector(d,-0.02), 0.020,0.017,6,P.leatherDk,{capA:{hex:P.brass,lift:0.012}});
    /* cross-guard bar */
    const guardC = grip.clone().addScaledVector(d,0.02);
    tube(guardC.clone().addScaledVector(gu,-0.052), guardC.clone().addScaledVector(gu,0.052), 0.013,0.013,5,P.steelDk,{capA:{hex:P.steelDk},capB:{hex:P.steelDk}});
    /* blade — a flat tapering lozenge */
    const bl=(t,w,th)=>{ const c=grip.clone().addScaledVector(d,0.04+t);
      return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.0,0.028,0.008), s2=bl(0.14,0.020,0.006), s3=bl(0.24,0.010,0.004);
    stitch([s1,s2,s3], ()=>P.steel);
    capFan(s3, grip.clone().addScaledVector(d,0.34), P.steelLt);
    return grip.clone();
  }

  /* TWIN DAGGERS FIRST — placed in the crouched, leaned space, held CLOSE */
  const gripR = crouch(V(0.30, 0.90, 0.36));            // lead hand: forward + low, close to body
  const dirR  = V(0.22,-0.20,1).normalize();
  const gripL = crouch(V(-0.19, 1.02, 0.22));           // off hand: HIGH + IN near the chest (tucked)
  const dirL  = V(-0.10,-0.94,0.28).normalize();        // reverse grip: blade DOWN, tight to the forearm
  const fistR = dagger(gripR, dirR);
  const fistL = dagger(gripL, dirL);

  /* TORSO — slim-for-half-orc leather loft, crouched */
  stack([
    {y:L.hipY,   rx:0.230, rz:0.176, hex:P.leatherDk},
    {y:L.waistY, rx:0.200, rz:0.156, hex:P.leather},
    {y:L.ribY,   rx:0.244, rz:0.182, hex:P.leather},
    {y:L.chestY, rx:0.282, rz:0.196, hex:P.leatherLt},
    {y:L.shldY,  rx:0.298, rz:0.188, hex:P.leatherLt},
    {y:L.neckY,  rx:0.150, rz:0.142, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.006}, xform:crouch});
  /* hip skirt + crossed baldric */
  stack([
    {y:0.550, rx:0.262, rz:0.204, hex:P.leatherDk},
    {y:0.700, rx:0.235, rz:0.176, hex:P.leather},
  ], 8, {xform:crouch});
  tube(crouch(V(-0.24,0.75,0.16)), crouch(V(0.22,1.11,0.15)), 0.024,0.020,5,P.strap);
  tube(crouch(V(0.24,0.75,0.15)),  crouch(V(-0.22,1.11,0.16)),0.024,0.020,5,P.strap);

  /* HEAD — inherited half-orc skull, crouched. EYELESS. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.148, rz:0.126, hex:P.skin},
      {y:L.cheekY, rx:0.140, rz:0.130, hex:P.skin},
      {y:L.browY,  rx:0.132, rz:0.118, hex:P.skin},
      {y:L.crownY, rx:0.108, rz:0.096, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;
    for(const i of [1,2]) rings[2][i].z += 0.058;
    for(const i of [0,3]) rings[2][i].z += 0.030;
    rings.forEach(r=>r.forEach(p=>{ const q=crouch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], crouch(V(0, L.headTopY, 0.010)), P.skinDk);
    for(const s of [-1,1]){
      const bx=s*0.044, by=L.jawY-0.006, bz=0.140;
      const tx=s*0.038, ty=by+0.040, tz=bz+0.032;
      const w=0.020;
      quad(crouch(V(bx-w,by-0.008,bz)), crouch(V(bx+w,by-0.008,bz)), crouch(V(tx+w*0.3,ty,tz)), crouch(V(tx-w*0.3,ty,tz)), P.tusk, 0.0);
    }
  }

  /* HOOD — low over the crown, face window open (brow clear), crouched */
  {
    const n=8, ph=Math.PI/n, faceCols=[1,2];
    const bands=[
      {y:L.neckY-0.004, rx:0.150, rz:0.142, hex:P.hoodDk},
      {y:L.jawY+0.010,  rx:0.176, rz:0.162, hex:P.hood},
      {y:L.browY-0.005, rx:0.180, rz:0.164, hex:P.hood},
      {y:L.crownY+0.02, rx:0.144, rz:0.132, hex:P.hood},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.018);
    rings.forEach(r=>r.forEach(p=>{ const q=crouch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], crouch(V(0.0, L.headTopY+0.03, -0.03)), P.hoodDk);
  }

  /* ARMS — each derived to its dagger fist, shoulders from the crouched rig */
  {
    const shR = crouch(V(L.shoulderX, L.shldY-0.01, 0.015));
    const shL = crouch(V(-L.shoulderX, L.shldY-0.01, 0.015));
    /* right arm to lead fist */
    const ER = shR.clone().lerp(fistR, 0.5).add(V(0.05,-0.02,0.08));
    tube(shR, ER, 0.098,0.072,6,P.leather);
    tube(ER, fistR.clone().add(V(0,0.02,-0.02)), 0.066,0.056,6,P.leatherDk,{capB:{hex:P.skin}});
    /* left arm to tucked fist */
    const EL = shL.clone().lerp(fistL, 0.5).add(V(-0.10,0.0,0.06));
    tube(shL, EL, 0.098,0.072,6,P.leather);
    tube(EL, fistL.clone().add(V(0,0.02,-0.02)), 0.066,0.056,6,P.leatherDk,{capB:{hex:P.skin}});
  }

  /* LEGS — deep crouch, lead (right) leg forward, trailing (left) leg braced back (broad half-orc) */
  {
    const hipL = crouch(V(-L.hipHalf, L.hipY-0.01, 0.01));
    const hipR = crouch(V( L.hipHalf, L.hipY-0.01, 0.00));
    const kneeL=V(-0.255, 0.34, 0.13), ankL=V(-0.235, 0.085, -0.02);
    const kneeR=V( 0.265, 0.32, 0.28), ankR=V( 0.245, 0.085,  0.18);
    tube(hipL,kneeL,0.108,0.076,6,P.trouser); tube(kneeL,ankL,0.072,0.052,6,P.trouser);
    tube(hipR,kneeR,0.108,0.076,6,P.trouser); tube(kneeR,ankR,0.072,0.052,6,P.trouser);
    for(const [ank,toe] of [[ankL,V(0.08,0,1)], [ankR,V(0.55,0,0.85)]]){
      const d=toe.clone().normalize(), toeA=V(ank.x,0.05,ank.z);
      tube(V(ank.x,0.19,ank.z), toeA, 0.076,0.064,6,P.boot);
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.064,0.048,6,P.boot,{capB:{hex:P.boot,lift:0.012},raz:0.056,rbz:0.038});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
