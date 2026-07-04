/* dev/model-qa/creatures/dragonborn-rogue.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED dragonborn race (broad powerful frame, reptilian MUZZLE head + heavy brow + back-swept
   HORN STUBS, thick tapering TAIL, bronze/rust scale hide) wearing the ROGUE kit (rogue.js signature:
   a low SNEAKY CROUCH with a forward lean, TWIN DAGGERS held CLOSE — lead hand forward-stab, off hand
   reverse/ice-pick grip tucked to the ribs — leather + crossed baldric). The hood is OFF (the muzzle
   is the read); a draconic cutthroat coiled low. EYELESS. Daggers authored inline first (grips =
   ground truth). One whole-object function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDragonbornRogue(){
  const P = {
    leather:0x4a3a28, leatherDk:0x33281b, leatherLt:0x5c4832,
    strap:0x2a2119, trouser:0x342c22, boot:0x241d15,
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a,
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xbcc2c6, brass:0x9c7d3e,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.75, waistY:0.83, ribY:0.945, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.128, shoulderX:0.270,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  /* THE CROUCH TRANSFORM */
  const DROP = 0.22, PITCH = 0.32;
  const PIVOT = V(0.0, L.hipY - DROP, 0.02);
  const crouch = (p)=>{
    const q = p.clone().add(V(0, -DROP, 0)).sub(PIVOT);
    q.applyAxisAngle(V(1,0,0), PITCH);
    return q.add(PIVOT);
  };

  /* inline DAGGER */
  function dagger(grip, dir){
    const d = dir.clone().normalize();
    const up = Math.abs(d.y)>0.9?V(0,0,1):V(0,1,0);
    const gu = new THREE.Vector3().crossVectors(up,d).normalize();
    const gv = new THREE.Vector3().crossVectors(d,gu).normalize();
    const pommel = grip.clone().addScaledVector(d,-0.075);
    tube(pommel, grip.clone().addScaledVector(d,-0.02), 0.020,0.017,6,P.leatherDk,{capA:{hex:P.brass,lift:0.012}});
    const guardC = grip.clone().addScaledVector(d,0.02);
    tube(guardC.clone().addScaledVector(gu,-0.052), guardC.clone().addScaledVector(gu,0.052), 0.013,0.013,5,P.steelDk,{capA:{hex:P.steelDk},capB:{hex:P.steelDk}});
    const bl=(t,w,th)=>{ const c=grip.clone().addScaledVector(d,0.04+t);
      return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.0,0.028,0.008), s2=bl(0.14,0.020,0.006), s3=bl(0.24,0.010,0.004);
    stitch([s1,s2,s3], ()=>P.steel);
    capFan(s3, grip.clone().addScaledVector(d,0.34), P.steelLt);
    return grip.clone();
  }

  /* TWIN DAGGERS FIRST — in the crouched space, held CLOSE */
  const gripR = crouch(V(0.30, 0.92, 0.36));
  const dirR  = V(0.22,-0.20,1).normalize();
  const gripL = crouch(V(-0.19, 1.04, 0.22));
  const dirL  = V(-0.10,-0.94,0.28).normalize();
  const fistR = dagger(gripR, dirR);
  const fistL = dagger(gripL, dirL);

  /* TORSO — leather over scale, crouched (broad dragonborn) */
  stack([
    {y:L.hipY,   rx:0.222, rz:0.168, hex:P.leatherDk},
    {y:L.waistY, rx:0.188, rz:0.146, hex:P.leather},
    {y:L.ribY,   rx:0.228, rz:0.170, hex:P.leather},
    {y:L.chestY, rx:0.266, rz:0.186, hex:P.leatherLt},
    {y:L.shldY,  rx:0.276, rz:0.178, hex:P.leatherLt},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.006}, xform:crouch});
  stack([
    {y:0.50, rx:0.235, rz:0.185, hex:P.leatherDk},
    {y:0.64, rx:0.212, rz:0.162, hex:P.leather},
  ], 8, {xform:crouch});
  tube(crouch(V(-0.22,0.78,0.16)), crouch(V(0.20,1.14,0.15)), 0.024,0.020,5,P.strap);
  tube(crouch(V(0.22,0.78,0.15)),  crouch(V(-0.20,1.14,0.16)),0.024,0.020,5,P.strap);

  /* HEAD — inherited dragonborn skull, crouched. EYELESS. */
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
    rings.forEach(r=>r.forEach(p=>{ const q=crouch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], crouch(V(0, L.headTopY, 0.004)), P.scaleDk);
    const muzBase = crouch(V(0, L.muzzleY-0.01, 0.118));
    const muzMid  = crouch(V(0, L.muzzleY-0.030, 0.186));
    const muzTip  = crouch(V(0, L.muzzleY-0.050, 0.238));
    tube(muzBase, muzMid, 0.112, 0.094, n, P.scale, {raz:0.100, rbz:0.086, phase:ph});
    tube(muzMid, muzTip, 0.094, 0.066, n, P.scaleLt, {raz:0.086, rbz:0.060, phase:ph, capB:{hex:P.scaleDk, lift:0.014}});
    quad(crouch(V(-0.058,L.muzzleY-0.070,0.128)), crouch(V(0.058,L.muzzleY-0.070,0.128)),
         crouch(V(0.036,L.muzzleY-0.086,0.224)), crouch(V(-0.036,L.muzzleY-0.086,0.224)), P.scaleBelly, 0.05);
    for(const s of [-1,1]){
      const hb = crouch(V(s*0.072, L.crownY-0.015, -0.020));
      const ht = crouch(V(s*0.098, L.crownY+0.075, -0.115));
      tube(hb, ht, 0.032, 0.012, 6, P.horn, {capB:{hex:P.hornTip, lift:0.008}});
    }
  }

  /* ARMS — each derived to its dagger fist, shoulders from the crouched rig */
  {
    const shR = crouch(V(L.shoulderX, L.shldY-0.01, 0.015));
    const shL = crouch(V(-L.shoulderX, L.shldY-0.01, 0.015));
    const ER = shR.clone().lerp(fistR, 0.5).add(V(0.05,-0.02,0.08));
    tube(shR, ER, 0.098,0.072,6,P.leather);
    tube(ER, fistR.clone().add(V(0,0.02,-0.02)), 0.066,0.056,6,P.leatherDk,{capB:{hex:P.scale}});
    const EL = shL.clone().lerp(fistL, 0.5).add(V(-0.10,0.0,0.06));
    tube(shL, EL, 0.098,0.072,6,P.leather);
    tube(EL, fistL.clone().add(V(0,0.02,-0.02)), 0.066,0.056,6,P.leatherDk,{capB:{hex:P.scale}});
  }

  /* LEGS — deep crouch, lead (right) forward, trailing (left) braced back (broad dragonborn) */
  {
    const hipL = crouch(V(-L.hipHalf, L.hipY-0.01, 0.01));
    const hipR = crouch(V( L.hipHalf, L.hipY-0.01, 0.00));
    const kneeL=V(-0.265, 0.35, 0.13), ankL=V(-0.245, 0.085, -0.02);
    const kneeR=V( 0.275, 0.33, 0.28), ankR=V( 0.255, 0.085,  0.18);
    tube(hipL,kneeL,0.108,0.076,6,P.trouser); tube(kneeL,ankL,0.072,0.052,6,P.trouser);
    tube(hipR,kneeR,0.108,0.076,6,P.trouser); tube(kneeR,ankR,0.072,0.052,6,P.trouser);
    for(const [ank,toe] of [[ankL,V(0.08,0,1)], [ankR,V(0.55,0,0.85)]]){
      const d=toe.clone().normalize(), toeA=V(ank.x,0.05,ank.z);
      tube(V(ank.x,0.19,ank.z), toeA, 0.076,0.064,6,P.boot);
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.064,0.048,6,P.boot,{capB:{hex:P.boot,lift:0.012},raz:0.056,rbz:0.038});
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
