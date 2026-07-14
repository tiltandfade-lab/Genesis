/* dev/model-qa/creatures/rlm-cyclops-oracle-of-the-buried-eye.js — CYCLOPS ORACLE OF THE BURIED
   EYE (lost-world, Huge Giant, CR 10). Read: a blinded one-eyed giant, hunched, reading omens
   in a spill of collapsing stone rubble at its feet — massive humanoid frame (bigger than the
   ogre, Huge scale like the hill giant), a single scarred SOCKET (no eye quad, per the ruling)
   sunk deep in a heavy brow, a long unkempt beard, robes of tattered oracle-cloth, hands
   cupped over a pile of cracked omen-stones. VS-desaturated grey-stone skin, dust-pale cloth.
   Whole-object grammar: one function, one frame, no anchors. Huge size, base disc r=0.68. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildCyclopsOracleOfTheBuriedEye(){
  const P = {
    skin:0x8c8270, skinDk:0x655d4e, skinLt:0xa39a86,
    scar:0x4a423490, socket:0x201d18, brow:0x6e6656,
    beard:0xb8ae94, beardDk:0x8a8168,
    cloth:0x726048, clothDk:0x4c3f2c, clothLt:0x8a765a,
    stone:0x5a5448, stoneDk:0x3c3830, stoneLt:0x726a5a,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:1.10, waistY:1.28, ribY:1.50, chestY:1.68, shldY:1.84, neckY:1.92,
    hipHalf:0.260, shoulderX:0.520,
    jawY:2.02, cheekY:2.14, browY:2.26, crownY:2.36, headTopY:2.44,
  };

  /* hunched-forward posture — reading rubble at its own feet */
  const hunch=(p)=>{
    const q=p.clone().sub(V(0,L.hipY,0));
    q.applyAxisAngle(V(1,0,0), 0.32);
    return q.add(V(0,L.hipY,0));
  };

  /* ---------- TORSO — heavy, hunched, robed. ---------- */
  stack([
    {y:L.hipY,   rx:0.360, rz:0.320, hex:P.skinDk},
    {y:L.waistY, rx:0.400, rz:0.360, hex:P.skin},
    {y:L.ribY,   rx:0.420, rz:0.360, hex:P.skinDk},
    {y:L.chestY, rx:0.440, rz:0.320, hex:P.skin},
    {y:L.shldY,  rx:0.500, rz:0.330, hex:P.skinLt},
    {y:L.neckY,  rx:0.200, rz:0.190, hex:P.skinDk},
  ], 8, {xform:hunch, capTop:{hex:P.skinDk, lift:0.008}});

  /* ---------- ORACLE ROBE — tattered cloth draped over the shoulders + torso, patched + frayed. ---------- */
  {
    const rings=stack([
      {y:L.shldY+0.01, rx:0.480, rz:0.340, hex:P.cloth},
      {y:L.chestY,     rx:0.470, rz:0.360, hex:P.clothDk},
      {y:L.ribY,       rx:0.470, rz:0.400, hex:P.cloth},
      {y:L.waistY-0.02,rx:0.480, rz:0.420, hex:P.clothLt},
      {y:L.hipY-0.20,  rx:0.500, rz:0.450, hex:P.clothDk},
    ], 8, {xform:hunch});
    // ragged hem strips
    for(const sx of [-0.34,-0.08,0.18,0.40]){
      const top=hunch(V(sx,L.hipY-0.18,0.34)), bot=hunch(V(sx,L.hipY-0.44,0.36));
      tube(top,bot,0.06,0.02,4,P.clothDk,{capB:{hex:P.clothDk,lift:0.01}});
    }
  }

  /* ---------- HEAD — single deep-set SOCKET (scarred, no eye quad), heavy brow, long beard. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.220, rz:0.210, hex:P.skinLt},
      {y:L.cheekY, rx:0.235, rz:0.220, hex:P.skin},
      {y:L.browY,  rx:0.215, rz:0.185, hex:P.brow},
      {y:L.crownY, rx:0.175, rz:0.165, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    for(const i of [1,2]) rings[1][i].z += 0.03;
    for(const i of [1,2]){ rings[2][i].z += 0.03; rings[2][i].y -= 0.02; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), hunch(V(0,L.headTopY,0.0)), P.skinDk);
    /* the single buried socket — a deep dark scarred hollow, centered, no eye quad */
    {
      const c=hunch(V(0,L.browY-0.02,0.20));
      blob(c.x,c.y,c.z,0.075,0.06,0.03,P.socket,6,3);
      // scar lines radiating out from the socket
      for(const ang of [0.3,1.4,2.6,4.0,5.2]){
        const b=c.clone().add(V(Math.cos(ang)*0.06,Math.sin(ang)*0.05,0.01));
        const t=c.clone().add(V(Math.cos(ang)*0.14,Math.sin(ang)*0.11,0.005));
        tube(b,t,0.012,0.004,3,P.scar);
      }
    }
    /* heavy jaw */
    tube(hunch(V(0,L.jawY+0.01,0.05)), hunch(V(0,L.jawY-0.15,0.22)), 0.220,0.150,6,P.skinLt,{raz:0.19,rbz:0.11,capB:{hex:P.skinDk}});
    /* LONG UNKEMPT BEARD — hangs from the jaw down over the chest */
    {
      const bb=hunch(V(0,L.jawY-0.16,0.20)), bm=hunch(V(0.02,L.chestY-0.05,0.30)), bt=hunch(V(-0.02,L.ribY-0.05,0.32));
      tube(bb,bm,0.16,0.13,6,P.beard);
      tube(bm,bt,0.13,0.06,6,P.beardDk,{capB:{hex:P.beardDk,lift:0.01}});
      for(const s of [-1,1]){
        const wb=hunch(V(s*0.06,L.chestY-0.10,0.28)), wt=hunch(V(s*0.10,L.ribY,0.30));
        tube(wb,wt,0.05,0.015,4,P.beardDk,{capB:{hex:P.beardDk,lift:0.006}});
      }
    }
    /* small dumb ears */
    for(const s of [-1,1]){
      const eb=hunch(V(s*0.225,L.cheekY,0.0)), et=hunch(V(s*0.26,L.cheekY+0.07,-0.06));
      tube(eb,et,0.06,0.038,5,P.skin,{capA:{hex:P.skinDk},capB:{hex:P.skinDk,lift:0.004}});
    }
  }

  /* ---------- ARMS — both reaching down + forward, hands cupped over the rubble at its feet. ---------- */
  {
    const S=hunch(V(L.shoulderX-0.04,L.shldY-0.02,0.03)), E=V(0.62,1.30,0.44), W=V(0.42,0.86,0.62);
    tube(S,E,0.170,0.130,6,P.skin);
    tube(E,W,0.130,0.100,6,P.skinDk);
    blob(W.x+0.05,W.y-0.06,W.z+0.06,0.11,0.08,0.09,P.skinLt,6,3);
    const S2=hunch(V(-L.shoulderX+0.04,L.shldY-0.02,0.03)), E2=V(-0.60,1.28,0.46), W2=V(-0.40,0.84,0.64);
    tube(S2,E2,0.170,0.130,6,P.skin);
    tube(E2,W2,0.130,0.100,6,P.skinDk);
    blob(W2.x-0.05,W2.y-0.06,W2.z+0.06,0.11,0.08,0.09,P.skinLt,6,3);
  }

  /* ---------- LEGS — thick, planted, kneeling-adjacent stance (hunched over the rubble). ---------- */
  {
    const hipL=V(-0.22,L.hipY-0.05,0.05), kneeL=V(-0.32,0.62,0.36), ankL=V(-0.30,0.14,0.30);
    const hipR=V(0.22,L.hipY-0.05,0.02), kneeR=V(0.34,0.60,0.22), ankR=V(0.36,0.14,0.10);
    tube(hipL,kneeL,0.220,0.160,6,P.skin);
    tube(kneeL,ankL,0.155,0.115,6,P.skinDk);
    tube(hipR,kneeR,0.220,0.160,6,P.skin);
    tube(kneeR,ankR,0.155,0.115,6,P.skinDk);
    for(const [ank,dir] of [[ankL,V(-0.05,0,1)],[ankR,V(0.08,0,1)]]){
      const heel=V(ank.x,0.06,ank.z), d=dir.clone().normalize();
      tube(heel.clone().addScaledVector(d,-0.03), heel.clone().addScaledVector(d,0.24), 0.130,0.095,6,P.skin,
           {raz:0.11,rbz:0.075,capA:{hex:P.skinDk}});
    }
  }

  /* ---------- RUBBLE PILE — cracked omen-stones spilling at its feet, the "reading" tell. ---------- */
  {
    const stones=[
      [0.02,0.06,0.66,0.16,0.12,0.14],[0.20,0.04,0.60,0.11,0.08,0.10],
      [-0.16,0.045,0.62,0.13,0.09,0.11],[0.08,0.04,0.78,0.09,0.07,0.08],
    ];
    for(const [x,y,z,rx,ry,rz] of stones) blob(x,y,z,rx,ry,rz,P.stone,6,3);
    for(const [x,y,z] of [[0.04,0.10,0.66],[-0.10,0.06,0.64]]) blob(x,y,z,0.05,0.03,0.04,P.stoneLt,4,3);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 18);
    const r2=ring(V(0,0.062,0), V(0,1,0), 0.66, 0.66, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.065,0), P.discTop);
  }
}
