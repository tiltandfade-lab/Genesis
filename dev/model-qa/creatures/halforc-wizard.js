/* dev/model-qa/creatures/halforc-wizard.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED half-orc race (heavy/broad frame, gray-green skin, heavy jaw + tusk nubs + jutting brow)
   wearing the WIZARD kit (mage.js signature: a floor-length ROBE, a POINTED drooping HAT, an ORB-STAFF
   canted forward in an INCANTATION with the orb leading, a RAISED open casting hand). A big scholarly
   orc mage; the tusks + brow read below the hat brim. EYELESS. One whole-object function, no anchors;
   figure faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHalfOrcWizard(){
  const P = {
    robe:0x3b3f63, robeDk:0x2c2f4c, robeLt:0x4a4f78, trim:0xb08d46, trimDk:0x7d6432,
    skin:0x7a8a6e, skinDk:0x525e48, skinLt:0x8fa080,
    tusk:0xd8cdae, tuskDk:0xb9ac86,
    wood:0x5a4326, woodDk:0x3f2f1a, orb:0x9fd8e6, orbCore:0xe8f6fb,
    hat:0x33375a, hatDk:0x242742,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hemY:0.05, kneeY:0.42, waistY:0.83, chestY:1.045, shldY:1.130, neckY:1.180,
    hipHalf:0.128, shoulderX:0.278,
    jawY:1.205, cheekY:1.288, browY:1.372, crownY:1.462, headTopY:1.520,
  };

  /* light incantation head-region lean */
  const HUNCH = 0.18, HPIVOT = V(0, L.neckY - 0.02, 0.0);
  const hunch = (p)=>{
    if(p.y <= HPIVOT.y) return p;
    const q = p.clone().sub(HPIVOT); q.applyAxisAngle(V(1,0,0), HUNCH); return q.add(HPIVOT);
  };

  /* ROBE — one long loft, floor hem to the neck (broad half-orc) */
  stack([
    {y:L.hemY,   rx:0.360, rz:0.290, hex:P.robeDk},
    {y:L.kneeY,  rx:0.310, rz:0.250, hex:P.robe},
    {y:0.62,     rx:0.275, rz:0.220, hex:P.robe},
    {y:L.waistY, rx:0.230, rz:0.185, hex:P.robe},
    {y:L.chestY, rx:0.270, rz:0.198, hex:P.robeLt},
    {y:L.shldY,  rx:0.290, rz:0.185, hex:P.robeLt},
    {y:L.neckY,  rx:0.150, rz:0.142, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});
  stack([
    {y:L.hemY-0.005, rx:0.390, rz:0.315, hex:P.robeDk},
    {y:0.16,         rx:0.345, rz:0.280, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.0}});

  /* front trim placket */
  {
    const zs=[[L.chestY,0.196],[0.92,0.210],[L.waistY,0.185],[0.66,0.220],[0.50,0.250],[L.kneeY,0.258]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.038,y1,z1), V(0.038,y1,z1), V(0.038,y2,z2), V(-0.038,y2,z2), i%2?P.trim:P.trimDk, 0.04);
    }
  }
  /* belt cord */
  stack([
    {y:L.waistY-0.01, rx:0.238, rz:0.192, hex:P.trimDk},
    {y:L.waistY+0.03, rx:0.236, rz:0.190, hex:P.trim},
  ], 8, {});

  /* HEAD — inherited half-orc skull, incantation lean. EYELESS. */
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
    rings.forEach(r=>r.forEach(p=>{ const q=hunch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], hunch(V(0, L.headTopY, 0.010)), P.skinDk);
    for(const s of [-1,1]){
      const bx=s*0.044, by=L.jawY-0.006, bz=0.140;
      const tx=s*0.038, ty=by+0.040, tz=bz+0.032;
      const w=0.020;
      quad(hunch(V(bx-w,by-0.008,bz)), hunch(V(bx+w,by-0.008,bz)), hunch(V(tx+w*0.3,ty,tz)), hunch(V(tx-w*0.3,ty,tz)), P.tusk, 0.0);
    }
  }

  /* POINTED HAT — brim + tall drooping cone, tipped forward with the head */
  {
    const n=10, ph=Math.PI/n;
    const H = (r)=>{ r.forEach(p=>{ const q=hunch(p); p.x=q.x; p.y=q.y; p.z=q.z; }); return r; };
    const brimLo=H(ring(V(0,L.browY+0.01,0.0), V(0,1,0), 0.215, 0.200, n, ph));
    const brimHi=H(ring(V(0,L.browY+0.05,0.0), V(0,1,0), 0.180, 0.170, n, ph));
    stitch([brimLo,brimHi], ()=>P.hatDk);
    capFan(brimLo, hunch(V(0,L.browY-0.01,0.0)), P.hatDk, true);
    const cone=[
      {y:L.crownY-0.02, rx:0.174, rz:0.164, cz:0.0},
      {y:1.66,          rx:0.128, rz:0.120, cz:-0.02},
      {y:1.86,          rx:0.084, rz:0.078, cz:-0.06},
      {y:2.04,          rx:0.046, rz:0.044, cz:-0.11},
    ].map(b=>H(ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph)));
    stitch(cone, ()=>P.hat);
    stitch([brimHi,cone[0]], ()=>P.hat);
    capFan(cone.at(-1), hunch(V(0.02,2.15,-0.19)), P.hatDk);
    const bandLo=H(ring(V(0,L.crownY-0.01,0.0), V(0,1,0), 0.176,0.166,n,ph));
    const bandHi=H(ring(V(0,L.crownY+0.05,0.0),V(0,1,0), 0.162,0.152,n,ph));
    stitch([bandLo,bandHi], ()=>P.trim);
  }

  /* STAFF FIRST — canted forward, orb leading (incantation) */
  const SHAFT_B=V(0.40,0.02,0.24), SHAFT_T=V(0.335,1.66,0.48);
  const GRIP=SHAFT_B.clone().lerp(SHAFT_T, 0.60);
  {
    tube(SHAFT_B, SHAFT_T, 0.030, 0.026, 6, P.wood, {capA:{hex:P.woodDk}});
    for(let k=0;k<3;k++){
      const a=(k/3)*Math.PI*2, pr=0.058;
      const claw=V(SHAFT_T.x+Math.cos(a)*pr, SHAFT_T.y+0.06, SHAFT_T.z+Math.sin(a)*pr);
      tube(SHAFT_T, claw, 0.015,0.008,5,P.woodDk,{capB:{hex:P.woodDk}});
    }
    const oc=V(SHAFT_T.x, SHAFT_T.y+0.11, SHAFT_T.z);
    const orb=[];
    const ob=[0.0,0.35,0.62,0.82,0.96,1.0];
    for(const t of ob){ const yy=oc.y-0.062+t*0.124; const rr=Math.sqrt(Math.max(0,1-Math.pow((t-0.5)*2,2)))*0.066;
      orb.push(ring(V(oc.x,yy,oc.z), V(0,1,0), rr+0.001, rr+0.001, 8, Math.PI/8)); }
    stitch(orb, (b)=> b<2?P.orb:P.orbCore);
  }

  /* ARMS — right to the staff grip; left raised in an open casting gesture (broad half-orc) */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=S.clone().lerp(GRIP, 0.5).add(V(0.01,-0.02,0.06));
    const W=GRIP.clone().add(V(0.0,-0.02,-0.01));
    tube(S,E,0.108,0.086,6,P.robeLt);
    tube(E,W,0.100,0.062,6,P.robe,{capB:{hex:P.robeDk}});
    tube(GRIP.clone().add(V(-0.01,-0.05,0.0)), GRIP.clone().add(V(0.01,0.05,0.0)), 0.058,0.054,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const CAST=V(-0.410, 1.320, 0.360);
    const E2=S2.clone().lerp(CAST, 0.5).add(V(-0.07,-0.03,0.02));
    tube(S2,E2,0.108,0.086,6,P.robeLt);
    tube(E2,CAST,0.100,0.058,6,P.robe,{capB:{hex:P.robeDk}});
    tube(CAST.clone().add(V(0.0,-0.02,-0.01)), CAST.clone().add(V(0.0,0.03,0.02)), 0.056,0.050,6,P.skin,{capA:{hex:P.skin}});
    for(const fx of [-0.028,0.0,0.028]){
      const base=CAST.clone().add(V(fx,0.03,0.02));
      tube(base, base.clone().add(V(fx*0.6,0.062,0.03)), 0.014,0.007,4,P.skin,{capB:{hex:P.skinDk}});
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
