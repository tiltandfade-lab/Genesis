/* dev/model-qa/creatures/tiefling-wizard.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED tiefling race (slim ~1.45u frame, dusky red-mauve skin, backswept HORNS, sharp GOATEE,
   thin spade-tipped TAIL) wearing the WIZARD kit (mage.js signature: a floor-length ROBE, a POINTED
   drooping HAT sized to clear the horns, an ORB-STAFF canted forward in an INCANTATION, a RAISED open
   casting hand). An infernal scholar-mage; the horns emerge below the hat, the goatee + tail carry the
   race. EYELESS. One whole-object function, no anchors; figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTieflingWizard(){
  const P = {
    robe:0x3b3f63, robeDk:0x2c2f4c, robeLt:0x4a4f78, trim:0xb08d46, trimDk:0x7d6432,
    skin:0x8a5560, skinDk:0x5c3540, skinLt:0x9c6570,
    horn:0x2f2a2a, hornDk:0x1e1a1a, hornLt:0x413a3a, hair:0x2a2320,
    wood:0x5a4326, woodDk:0x3f2f1a, orb:0x9fd8e6, orbCore:0xe8f6fb,
    hat:0x33375a, hatDk:0x242742,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hemY:0.05, kneeY:0.42, waistY:0.79, chestY:0.975, shldY:1.055, neckY:1.090,
    hipHalf:0.100, shoulderX:0.215,
    jawY:1.120, cheekY:1.192, browY:1.262, crownY:1.345, headTopY:1.400,
  };

  const HUNCH = 0.18, HPIVOT = V(0, L.neckY - 0.02, 0.0);
  const hunch = (p)=>{
    if(p.y <= HPIVOT.y) return p;
    const q = p.clone().sub(HPIVOT); q.applyAxisAngle(V(1,0,0), HUNCH); return q.add(HPIVOT);
  };

  /* ROBE — floor hem to the neck (slim tiefling) */
  stack([
    {y:L.hemY,   rx:0.300, rz:0.242, hex:P.robeDk},
    {y:L.kneeY,  rx:0.256, rz:0.208, hex:P.robe},
    {y:0.60,     rx:0.222, rz:0.180, hex:P.robe},
    {y:L.waistY, rx:0.180, rz:0.146, hex:P.robe},
    {y:L.chestY, rx:0.200, rz:0.152, hex:P.robeLt},
    {y:L.shldY,  rx:0.204, rz:0.140, hex:P.robeLt},
    {y:L.neckY,  rx:0.072, rz:0.068, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  stack([
    {y:L.hemY-0.005, rx:0.328, rz:0.266, hex:P.robeDk},
    {y:0.16,         rx:0.286, rz:0.232, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.0}});
  {
    const zs=[[L.chestY,0.150],[0.90,0.162],[L.waistY,0.142],[0.64,0.172],[0.48,0.200],[L.kneeY,0.210]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.032,y1,z1), V(0.032,y1,z1), V(0.032,y2,z2), V(-0.032,y2,z2), i%2?P.trim:P.trimDk, 0.04);
    }
  }
  stack([
    {y:L.waistY-0.01, rx:0.188, rz:0.154, hex:P.trimDk},
    {y:L.waistY+0.03, rx:0.186, rz:0.152, hex:P.trim},
  ], 8, {});

  /* HEAD — inherited tiefling skull, incantation lean. EYELESS. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.076, rz:0.082, hex:P.skin},
      {y:L.cheekY, rx:0.104, rz:0.100, hex:P.skin},
      {y:L.browY,  rx:0.108, rz:0.098, hex:P.skin},
      {y:L.crownY, rx:0.084, rz:0.076, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.020;
    rings.forEach(r=>r.forEach(p=>{ const q=hunch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], hunch(V(0, L.headTopY, 0.006)), P.skinDk);
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
    rings.forEach(r=>r.forEach(p=>{ const q=hunch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), hunch(V(0,L.jawY-0.122,0.062)), P.hair);
  }
  /* HORNS — backswept, hunched with the head */
  for(const s of [-1,1]){
    const baseX = s*0.100, baseZ = -0.010;
    const base   = hunch(V(baseX, L.browY-0.010, baseZ));
    const p1 = hunch(V(baseX + s*0.026, L.browY+0.118, baseZ - 0.028));
    const p2 = hunch(V(baseX + s*0.044, L.browY+0.210, baseZ - 0.090));
    const p3 = hunch(V(baseX + s*0.052, L.browY+0.262, baseZ - 0.150));
    tube(base, p1, 0.030, 0.023, 6, P.horn,   {capA:{hex:P.hornDk}});
    tube(p1,   p2, 0.023, 0.015, 6, P.hornLt);
    tube(p2,   p3, 0.015, 0.003, 6, P.hornLt, {capB:{hex:P.hornDk}});
  }

  /* POINTED HAT — brim + tall drooping cone, tipped forward with the head. Brim sits high enough to
     clear the horn bases (horns exit below/behind the brim). */
  {
    const n=10, ph=Math.PI/n;
    const H = (r)=>{ r.forEach(p=>{ const q=hunch(p); p.x=q.x; p.y=q.y; p.z=q.z; }); return r; };
    const brimLo=H(ring(V(0,L.browY+0.03,0.015), V(0,1,0), 0.180, 0.170, n, ph));
    const brimHi=H(ring(V(0,L.browY+0.07,0.015), V(0,1,0), 0.150, 0.142, n, ph));
    stitch([brimLo,brimHi], ()=>P.hatDk);
    capFan(brimLo, hunch(V(0,L.browY+0.01,0.015)), P.hatDk, true);
    const cone=[
      {y:L.crownY+0.01, rx:0.144, rz:0.136, cz:0.010},
      {y:1.55,          rx:0.106, rz:0.100, cz:-0.02},
      {y:1.73,          rx:0.070, rz:0.066, cz:-0.06},
      {y:1.90,          rx:0.038, rz:0.036, cz:-0.11},
    ].map(b=>H(ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph)));
    stitch(cone, ()=>P.hat);
    stitch([brimHi,cone[0]], ()=>P.hat);
    capFan(cone.at(-1), hunch(V(0.02,2.00,-0.18)), P.hatDk);
    const bandLo=H(ring(V(0,L.crownY+0.02,0.010), V(0,1,0), 0.146,0.138,n,ph));
    const bandHi=H(ring(V(0,L.crownY+0.08,0.010),V(0,1,0), 0.134,0.126,n,ph));
    stitch([bandLo,bandHi], ()=>P.trim);
  }

  /* STAFF FIRST — canted forward, orb leading */
  const SHAFT_B=V(0.34,0.02,0.20), SHAFT_T=V(0.285,1.52,0.44);
  const GRIP=SHAFT_B.clone().lerp(SHAFT_T, 0.60);
  {
    tube(SHAFT_B, SHAFT_T, 0.028, 0.024, 6, P.wood, {capA:{hex:P.woodDk}});
    for(let k=0;k<3;k++){
      const a=(k/3)*Math.PI*2, pr=0.055;
      const claw=V(SHAFT_T.x+Math.cos(a)*pr, SHAFT_T.y+0.06, SHAFT_T.z+Math.sin(a)*pr);
      tube(SHAFT_T, claw, 0.014,0.008,5,P.woodDk,{capB:{hex:P.woodDk}});
    }
    const oc=V(SHAFT_T.x, SHAFT_T.y+0.11, SHAFT_T.z);
    const orb=[];
    const ob=[0.0,0.35,0.62,0.82,0.96,1.0];
    for(const t of ob){ const yy=oc.y-0.058+t*0.116; const rr=Math.sqrt(Math.max(0,1-Math.pow((t-0.5)*2,2)))*0.062;
      orb.push(ring(V(oc.x,yy,oc.z), V(0,1,0), rr+0.001, rr+0.001, 8, Math.PI/8)); }
    stitch(orb, (b)=> b<2?P.orb:P.orbCore);
  }

  /* ARMS — right to the staff grip; left raised in an open casting gesture (slim tiefling) */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=S.clone().lerp(GRIP, 0.5).add(V(0.01,-0.02,0.06));
    const W=GRIP.clone().add(V(0.0,-0.02,-0.01));
    tube(S,E,0.090,0.072,6,P.robeLt);
    tube(E,W,0.086,0.052,6,P.robe,{capB:{hex:P.robeDk}});
    tube(GRIP.clone().add(V(-0.01,-0.05,0.0)), GRIP.clone().add(V(0.01,0.05,0.0)), 0.042,0.040,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const CAST=V(-0.345, 1.205, 0.335);
    const E2=S2.clone().lerp(CAST, 0.5).add(V(-0.07,-0.03,0.02));
    tube(S2,E2,0.090,0.072,6,P.robeLt);
    tube(E2,CAST,0.086,0.050,6,P.robe,{capB:{hex:P.robeDk}});
    tube(CAST.clone().add(V(0.0,-0.02,-0.01)), CAST.clone().add(V(0.0,0.03,0.02)), 0.040,0.036,6,P.skin,{capA:{hex:P.skin}});
    for(const fx of [-0.024,0.0,0.024]){
      const base=CAST.clone().add(V(fx,0.03,0.02));
      tube(base, base.clone().add(V(fx*0.6,0.055,0.03)), 0.011,0.006,4,P.skin,{capB:{hex:P.skinDk}});
    }
  }

  /* TAIL — thin spade-tipped tail (inherited) */
  {
    const root = V(0.030, L.waistY-0.055, -0.120);
    const t1 = V(0.085, 0.505, -0.250);
    const t2 = V(0.118, 0.345, -0.280);
    const t3 = V(0.128, 0.235, -0.245);
    const tip = V(0.132, 0.155, -0.180);
    tube(root, t1, 0.038, 0.031, 6, P.robeDk);
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
