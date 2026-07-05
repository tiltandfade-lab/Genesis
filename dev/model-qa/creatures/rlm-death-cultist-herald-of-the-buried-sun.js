/* dev/model-qa/creatures/rlm-death-cultist-herald-of-the-buried-sun.js — DEATH-CULTIST HERALD OF
   THE BURIED SUN (lost-world, Medium Humanoid, CR 8). Read: a robed cultist preacher, hood
   thrown back, arms raised overhead in mid-sermon, a heavy sun-medallion on a chain across the
   chest (the buried-sun icon), a ragged ash-grey robe cinched with a bone-tally cord. Medium
   size, bipedal — one raised staff-hand, one open exhorting hand. VS-desaturated: sun-bleached
   grey-tan cloth, dull bone accents, no bright gold. Whole-object grammar: one function, one
   frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDeathCultistHeraldOfTheBuriedSun(){
  const P = {
    skin:0x9a8264, skinDk:0x6f5c44, skinLt:0xb39a78,
    robe:0x8c8270, robeDk:0x5e5648, robeLt:0xa49a80,
    hood:0x6a6252, cord:0x3c342a, bone:0xc4b896, boneDk:0x8a8064,
    medal:0x7a6a44, medalDk:0x4c4028,
    staff:0x4a3e2c, staffDk:0x2e2618,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.62, waistY:0.74, ribY:0.92, chestY:1.06, shldY:1.18, neckY:1.24,
    jawY:1.32, cheekY:1.40, browY:1.48, crownY:1.54,
    shoulderX:0.220,
  };

  /* slight backward lean — the mid-sermon pose, chest thrown open */
  const lean=(p)=>{
    const q=p.clone().sub(V(0,L.hipY,0));
    q.applyAxisAngle(V(1,0,0), -0.10);
    return q.add(V(0,L.hipY,0));
  };

  /* ---------- LEGS (robed — modest stubs, robe covers most). ---------- */
  {
    const hipL=V(-0.09,L.hipY-0.02,0), hipR=V(0.09,L.hipY-0.02,0);
    const ankL=V(-0.10,0.10,0.02), ankR=V(0.10,0.10,-0.02);
    tube(hipL,ankL,0.085,0.060,6,P.skinDk);
    tube(hipR,ankR,0.085,0.060,6,P.skinDk);
  }

  /* ---------- TORSO — lean humanoid frame, then robed heavily over it. ---------- */
  stack([
    {y:L.hipY,   rx:0.145, rz:0.120, hex:P.skinDk},
    {y:L.waistY, rx:0.155, rz:0.130, hex:P.skin},
    {y:L.ribY,   rx:0.165, rz:0.130, hex:P.skinLt},
    {y:L.chestY, rx:0.175, rz:0.120, hex:P.skin},
    {y:L.shldY,  rx:0.190, rz:0.125, hex:P.skinLt},
    {y:L.neckY,  rx:0.075, rz:0.070, hex:P.skinDk},
  ], 8, {xform:lean, capTop:{hex:P.skinDk, lift:0.006}});

  /* ---------- ROBE — ragged ash-grey, hangs open at the chest to show the medallion. ---------- */
  {
    stack([
      {y:L.shldY+0.02, rx:0.220, rz:0.150, hex:P.robe},
      {y:L.chestY,     rx:0.225, rz:0.170, hex:P.robeDk},
      {y:L.ribY,       rx:0.230, rz:0.190, hex:P.robe},
      {y:L.waistY-0.02,rx:0.235, rz:0.210, hex:P.robeLt},
      {y:L.hipY-0.20,  rx:0.245, rz:0.230, hex:P.robeDk},
      {y:0.14,         rx:0.270, rz:0.260, hex:P.robe},
    ], 8, {xform:lean});
    // ragged hem strips
    for(const sx of [-0.16,-0.02,0.14]){
      const top=lean(V(sx,0.16,0.20)), bot=lean(V(sx,0.03,0.22));
      tube(top,bot,0.04,0.012,4,P.robeDk,{capB:{hex:P.robeDk,lift:0.006}});
    }
    // bone-tally cord cinch at the waist
    const c1=ring(lean(V(0,L.waistY,0)),V(0,1,0),0.23,0.20,8), c2=ring(lean(V(0,L.waistY-0.03,0)),V(0,1,0),0.235,0.205,8);
    stitch([c1,c2],()=>P.cord);
    for(const s of [-1,0,1]){
      const bt=lean(V(s*0.03,L.waistY-0.05,0.20));
      blob(bt.x,bt.y,bt.z,0.02,0.02,0.02,P.bone,4,3);
    }
  }

  /* ---------- SUN-MEDALLION — a heavy disc on a chain, over the open chest. ---------- */
  {
    const c=lean(V(0,L.chestY-0.02,0.15));
    const r1=ring(c,V(0,0,1),0.075,0.075,10), r2=ring(c.clone().add(V(0,0,0.02)),V(0,0,1),0.075,0.075,10);
    stitch([r1,r2],()=>P.medal);
    capFan(r2,c.clone().add(V(0,0,0.03)),P.medalDk);
    // sun-ray notches around the rim
    for(let i=0;i<8;i++){
      const ang=i/8*Math.PI*2;
      const b=c.clone().add(V(Math.cos(ang)*0.075,Math.sin(ang)*0.075,0.01));
      const t=c.clone().add(V(Math.cos(ang)*0.10,Math.sin(ang)*0.10,0.01));
      tube(b,t,0.012,0.004,3,P.medalDk);
    }
    // chain up to the neck
    tube(c.clone().add(V(-0.05,0.06,0)), lean(V(-0.04,L.neckY-0.02,0.06)),0.01,0.008,4,P.cord);
    tube(c.clone().add(V(0.05,0.06,0)), lean(V(0.04,L.neckY-0.02,0.06)),0.01,0.008,4,P.cord);
  }

  /* ---------- HEAD — hood thrown back, gaunt sun-worn face. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.085, rz:0.080, hex:P.skinLt},
      {y:L.cheekY, rx:0.090, rz:0.085, hex:P.skin},
      {y:L.browY,  rx:0.082, rz:0.072, hex:P.skinDk},
      {y:L.crownY, rx:0.068, rz:0.062, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(lean));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), lean(V(0,L.crownY+0.02,0.0)), P.skinDk);
    tube(lean(V(0,L.jawY+0.005,0.02)), lean(V(0,L.jawY-0.06,0.09)), 0.085,0.055,6,P.skinLt,{capB:{hex:P.skinDk}});
    /* hood thrown back — bunched cloth behind the neck/shoulders */
    const hb=lean(V(0,L.shldY+0.06,-0.10)), ht=lean(V(0,L.crownY-0.02,-0.14));
    tube(hb,ht,0.14,0.10,7,P.hood,{capB:{hex:P.hood,lift:0.01}});
  }

  /* ---------- ARMS — right raised high gripping a bone-topped staff; left open, exhorting. ---------- */
  {
    const S=lean(V(L.shoulderX,L.shldY-0.02,0.0)), E=V(0.28,1.42,0.10), W=V(0.20,1.66,0.06);
    tube(S,E,0.080,0.060,6,P.skin);
    tube(E,W,0.060,0.045,6,P.skinDk,{capB:{hex:P.skinDk,lift:0.006}});
    // staff continuing up from the grip
    tube(W, V(0.17,0.05,0.0), 0.035,0.030,6,P.staffDk);
    tube(W, V(0.24,1.98,0.14), 0.035,0.025,6,P.staff,{capB:{hex:P.staffDk,lift:0.008}});
    blob(0.25,2.02,0.15,0.05,0.05,0.05,P.bone,5,3);

    const S2=lean(V(-L.shoulderX,L.shldY-0.02,0.0)), E2=V(-0.30,1.36,0.08), W2=V(-0.28,1.52,-0.06);
    tube(S2,E2,0.080,0.060,6,P.skin);
    tube(E2,W2,0.060,0.045,6,P.skinDk,{capB:{hex:P.skinDk,lift:0.006}});
  }

  /* ---------- base disc (Medium r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
