/* dev/model-qa/creatures/dragonborn-wizard.js — RACE×CLASS bespoke starter (POLISH-WAVE-1 §F4, wave B).
   The FIXED dragonborn race (broad powerful frame, reptilian MUZZLE head + heavy brow + back-swept
   HORN STUBS, thick tapering TAIL, bronze/rust scale hide) wearing the WIZARD kit (mage.js signature:
   a floor-length ROBE, a POINTED drooping HAT sized to clear the horns, an ORB-STAFF canted forward
   in an INCANTATION, a RAISED open casting hand). A draconic loremaster; the muzzle emerges from the
   hood of the robe, the horns below the hat. EYELESS. One whole-object function, no anchors; figure
   faces +z front. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDragonbornWizard(){
  const P = {
    robe:0x3b3f63, robeDk:0x2c2f4c, robeLt:0x4a4f78, trim:0xb08d46, trimDk:0x7d6432,
    scale:0xa8563a, scaleDk:0x6e3624, scaleLt:0xc98a5e, scaleBelly:0xd1a879,
    horn:0x3a3128, hornTip:0x241f1a,
    wood:0x5a4326, woodDk:0x3f2f1a, orb:0x9fd8e6, orbCore:0xe8f6fb,
    hat:0x33375a, hatDk:0x242742,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hemY:0.05, kneeY:0.42, waistY:0.83, chestY:1.06, shldY:1.15, neckY:1.19,
    hipHalf:0.128, shoulderX:0.270,
    jawY:1.215, muzzleY:1.245, browY:1.365, crownY:1.455, headTopY:1.505,
  };

  const HUNCH = 0.16, HPIVOT = V(0, L.neckY - 0.02, 0.0);
  const hunch = (p)=>{
    if(p.y <= HPIVOT.y) return p;
    const q = p.clone().sub(HPIVOT); q.applyAxisAngle(V(1,0,0), HUNCH); return q.add(HPIVOT);
  };

  /* ROBE — floor hem to the neck (broad dragonborn) */
  stack([
    {y:L.hemY,   rx:0.360, rz:0.290, hex:P.robeDk},
    {y:L.kneeY,  rx:0.310, rz:0.250, hex:P.robe},
    {y:0.62,     rx:0.275, rz:0.220, hex:P.robe},
    {y:L.waistY, rx:0.230, rz:0.185, hex:P.robe},
    {y:L.chestY, rx:0.270, rz:0.198, hex:P.robeLt},
    {y:L.shldY,  rx:0.290, rz:0.185, hex:P.robeLt},
    {y:L.neckY,  rx:0.100, rz:0.095, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.005}});
  stack([
    {y:L.hemY-0.005, rx:0.390, rz:0.315, hex:P.robeDk},
    {y:0.16,         rx:0.345, rz:0.280, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.0}});
  {
    const zs=[[L.chestY,0.196],[0.94,0.210],[L.waistY,0.185],[0.66,0.220],[0.50,0.250],[L.kneeY,0.258]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.038,y1,z1), V(0.038,y1,z1), V(0.038,y2,z2), V(-0.038,y2,z2), i%2?P.trim:P.trimDk, 0.04);
    }
  }
  stack([
    {y:L.waistY-0.01, rx:0.238, rz:0.192, hex:P.trimDk},
    {y:L.waistY+0.03, rx:0.236, rz:0.190, hex:P.trim},
  ], 8, {});

  /* HEAD — inherited dragonborn skull, incantation lean. EYELESS. */
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
    rings.forEach(r=>r.forEach(p=>{ const q=hunch(p); p.x=q.x; p.y=q.y; p.z=q.z; }));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    }
    capFan(rings[3], hunch(V(0, L.headTopY, 0.004)), P.scaleDk);
    const muzBase = hunch(V(0, L.muzzleY-0.01, 0.118));
    const muzMid  = hunch(V(0, L.muzzleY-0.030, 0.186));
    const muzTip  = hunch(V(0, L.muzzleY-0.050, 0.238));
    tube(muzBase, muzMid, 0.112, 0.094, n, P.scale, {raz:0.100, rbz:0.086, phase:ph});
    tube(muzMid, muzTip, 0.094, 0.066, n, P.scaleLt, {raz:0.086, rbz:0.060, phase:ph, capB:{hex:P.scaleDk, lift:0.014}});
    quad(hunch(V(-0.058,L.muzzleY-0.070,0.128)), hunch(V(0.058,L.muzzleY-0.070,0.128)),
         hunch(V(0.036,L.muzzleY-0.086,0.224)), hunch(V(-0.036,L.muzzleY-0.086,0.224)), P.scaleBelly, 0.05);
    for(const s of [-1,1]){
      const hb = hunch(V(s*0.072, L.crownY-0.015, -0.020));
      const ht = hunch(V(s*0.098, L.crownY+0.075, -0.115));
      tube(hb, ht, 0.032, 0.012, 6, P.horn, {capB:{hex:P.hornTip, lift:0.008}});
    }
  }

  /* POINTED HAT — brim + tall drooping cone, tipped forward. Brim sits above the brow ring clear of
     the horn bases (horns exit behind/below the brim rear). */
  {
    const n=10, ph=Math.PI/n;
    const H = (r)=>{ r.forEach(p=>{ const q=hunch(p); p.x=q.x; p.y=q.y; p.z=q.z; }); return r; };
    const brimLo=H(ring(V(0,L.browY+0.06,0.02), V(0,1,0), 0.205, 0.192, n, ph));
    const brimHi=H(ring(V(0,L.browY+0.10,0.02), V(0,1,0), 0.172, 0.162, n, ph));
    stitch([brimLo,brimHi], ()=>P.hatDk);
    capFan(brimLo, hunch(V(0,L.browY+0.04,0.02)), P.hatDk, true);
    const cone=[
      {y:L.crownY+0.04, rx:0.166, rz:0.156, cz:0.010},
      {y:1.70,          rx:0.122, rz:0.114, cz:-0.02},
      {y:1.90,          rx:0.080, rz:0.074, cz:-0.06},
      {y:2.08,          rx:0.044, rz:0.042, cz:-0.11},
    ].map(b=>H(ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph)));
    stitch(cone, ()=>P.hat);
    stitch([brimHi,cone[0]], ()=>P.hat);
    capFan(cone.at(-1), hunch(V(0.02,2.19,-0.19)), P.hatDk);
    const bandLo=H(ring(V(0,L.crownY+0.05,0.010), V(0,1,0), 0.168,0.158,n,ph));
    const bandHi=H(ring(V(0,L.crownY+0.11,0.010),V(0,1,0), 0.154,0.144,n,ph));
    stitch([bandLo,bandHi], ()=>P.trim);
  }

  /* STAFF FIRST — canted forward, orb leading */
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

  /* ARMS — right to the staff grip; left raised in an open casting gesture (broad dragonborn) */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=S.clone().lerp(GRIP, 0.5).add(V(0.01,-0.02,0.06));
    const W=GRIP.clone().add(V(0.0,-0.02,-0.01));
    tube(S,E,0.108,0.086,6,P.robeLt);
    tube(E,W,0.100,0.062,6,P.robe,{capB:{hex:P.robeDk}});
    tube(GRIP.clone().add(V(-0.01,-0.05,0.0)), GRIP.clone().add(V(0.01,0.05,0.0)), 0.058,0.054,6,P.scale,{capA:{hex:P.scale},capB:{hex:P.scale}});

    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const CAST=V(-0.410, 1.320, 0.360);
    const E2=S2.clone().lerp(CAST, 0.5).add(V(-0.07,-0.03,0.02));
    tube(S2,E2,0.108,0.086,6,P.robeLt);
    tube(E2,CAST,0.100,0.058,6,P.robe,{capB:{hex:P.robeDk}});
    tube(CAST.clone().add(V(0.0,-0.02,-0.01)), CAST.clone().add(V(0.0,0.03,0.02)), 0.056,0.050,6,P.scale,{capA:{hex:P.scale}});
    for(const fx of [-0.028,0.0,0.028]){
      const base=CAST.clone().add(V(fx,0.03,0.02));
      tube(base, base.clone().add(V(fx*0.6,0.062,0.03)), 0.014,0.007,4,P.scale,{capB:{hex:P.scaleDk}});
    }
  }

  /* TAIL — thick tapering dragonborn tail (inherited) */
  {
    const root = V(0.04, L.waistY-0.22, -0.245);
    const t1   = V(0.230,0.545, -0.320);
    const t2   = V(0.360,0.400, -0.360);
    const t3   = V(0.445,0.270, -0.360);
    const t4   = V(0.470,0.165, -0.320);
    const tip  = V(0.470,0.115, -0.255);
    tube(root, t1, 0.112, 0.092, 8, P.robeDk,  {phase:Math.PI/8});
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
