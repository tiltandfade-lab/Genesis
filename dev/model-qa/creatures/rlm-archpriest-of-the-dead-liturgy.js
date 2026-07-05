/* dev/model-qa/creatures/rlm-archpriest-of-the-dead-liturgy.js — ARCHPRIEST OF THE DEAD LITURGY
   (lost-world, Medium Humanoid, CR 12). Read: an aged, stooped archpriest, last living speaker
   of a dead tongue — layered ceremonial vestments heavy with age, a tall stiff miter-crown, a
   liturgy scroll case slung across the back, gnarled hands clutching a censer that trails thin
   smoke. Medium size, bipedal, deeply stooped with age. VS-desaturated: faded burgundy-and-bone
   vestments, tarnished not gilt. Whole-object grammar: one function, one frame, no anchors.
   Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildArchpriestOfTheDeadLiturgy(){
  const P = {
    skin:0x8a7458, skinDk:0x5e4c38, skinLt:0xa38c68,
    robe:0x5e3c3a, robeDk:0x3c2422, robeLt:0x76524e,
    trim:0x8a7c5c, trimDk:0x5c5138,
    miter:0x4a3230, miterDk:0x2e1c1a,
    scroll:0x9a8a68, scrollDk:0x6c5f46,
    censer:0x4c463c, censerDk:0x2e2a24, smoke:0x8a8578,
    hair:0xb8ae98,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.58, waistY:0.70, ribY:0.86, chestY:0.98, shldY:1.08, neckY:1.14,
    jawY:1.20, cheekY:1.28, browY:1.35, crownY:1.41,
    shoulderX:0.200,
  };

  /* deep age-stoop, forward and down */
  const stoop=(p)=>{
    const q=p.clone().sub(V(0,L.hipY,0));
    q.applyAxisAngle(V(1,0,0), 0.30);
    return q.add(V(0,L.hipY,0));
  };

  /* ---------- LEGS — modest, mostly hidden by robe. ---------- */
  {
    const hipL=V(-0.08,L.hipY-0.02,0), hipR=V(0.08,L.hipY-0.02,0);
    const ankL=V(-0.09,0.09,-0.10), ankR=V(0.09,0.09,-0.06);
    tube(hipL,ankL,0.075,0.055,6,P.skinDk);
    tube(hipR,ankR,0.075,0.055,6,P.skinDk);
  }

  /* ---------- TORSO — stooped, aged frame. ---------- */
  stack([
    {y:L.hipY,   rx:0.130, rz:0.110, hex:P.skinDk},
    {y:L.waistY, rx:0.140, rz:0.120, hex:P.skin},
    {y:L.ribY,   rx:0.145, rz:0.120, hex:P.skinLt},
    {y:L.chestY, rx:0.148, rz:0.110, hex:P.skin},
    {y:L.shldY,  rx:0.150, rz:0.115, hex:P.skinLt},
    {y:L.neckY,  rx:0.062, rz:0.058, hex:P.skinDk},
  ], 8, {xform:stoop, capTop:{hex:P.skinDk, lift:0.006}});

  /* ---------- VESTMENTS — layered ceremonial robes, heavy with age, faded burgundy + bone trim. ---------- */
  {
    stack([
      {y:L.shldY+0.03, rx:0.190, rz:0.140, hex:P.robe},
      {y:L.chestY,     rx:0.200, rz:0.160, hex:P.robeDk},
      {y:L.ribY,       rx:0.210, rz:0.180, hex:P.robe},
      {y:L.waistY-0.01,rx:0.225, rz:0.200, hex:P.robeLt},
      {y:L.hipY-0.18,  rx:0.245, rz:0.230, hex:P.robeDk},
      {y:0.14,         rx:0.280, rz:0.270, hex:P.robe},
    ], 8, {xform:stoop});
    // bone-trim edging bands
    for(const y of [L.chestY, L.waistY-0.01]){
      const r1=ring(stoop(V(0,y,0)),V(0,1,0),0.21,0.17,8), r2=ring(stoop(V(0,y-0.02,0)),V(0,1,0),0.215,0.175,8);
      stitch([r1,r2],()=>P.trim);
    }
    // ragged hem
    for(const sx of [-0.14,0.0,0.16]){
      const top=stoop(V(sx,0.18,0.24)), bot=stoop(V(sx,0.03,0.26));
      tube(top,bot,0.04,0.012,4,P.robeDk,{capB:{hex:P.robeDk,lift:0.006}});
    }
  }

  /* ---------- SCROLL CASE — slung across the back, the dead-tongue liturgy. ---------- */
  {
    const b=stoop(V(0.08,L.shldY+0.02,-0.16)), t=stoop(V(-0.06,L.hipY-0.02,-0.10));
    tube(b,t,0.05,0.045,6,P.scroll,{capA:{hex:P.scrollDk},capB:{hex:P.scrollDk,lift:0.006}});
    // strap across the chest
    quad(stoop(V(-0.16,L.shldY,0.10)), stoop(V(-0.10,L.shldY+0.02,-0.10)),
         stoop(V(-0.06,L.hipY-0.05,-0.06)), stoop(V(-0.12,L.hipY-0.03,0.12)), P.trimDk, 0.05);
  }

  /* ---------- HEAD — aged gaunt face, wisps of white hair, then the tall stiff MITER-CROWN. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.078, rz:0.074, hex:P.skinLt},
      {y:L.cheekY, rx:0.084, rz:0.080, hex:P.skin},
      {y:L.browY,  rx:0.076, rz:0.066, hex:P.skinDk},
      {y:L.crownY, rx:0.064, rz:0.058, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(stoop));
    stitch(rings, b=>bands[b].hex);
    tube(stoop(V(0,L.jawY+0.004,0.02)), stoop(V(0,L.jawY-0.05,0.08)), 0.078,0.05,6,P.skinLt,{capB:{hex:P.skinDk}});
    // wisps of white hair over the ears
    for(const s of [-1,1]){
      const b2=stoop(V(s*0.07,L.crownY-0.01,-0.02)), t2=stoop(V(s*0.09,L.crownY+0.03,-0.06));
      tube(b2,t2,0.03,0.012,4,P.hair,{capB:{hex:P.hair,lift:0.004}});
    }
    /* MITER-CROWN — a tall stiff peaked headdress, faded burgundy w/ bone-trim band. */
    const mb=stoop(V(0,L.crownY+0.01,0.0));
    const m1=ring(mb,V(0,1,0),0.075,0.068,8,ph), m2=ring(mb.clone().add(V(0,0.12,0)),V(0,1,0),0.062,0.055,8,ph);
    const m3=ring(mb.clone().add(V(0,0.24,0)),V(0,1,0),0.040,0.035,8,ph);
    stitch([m1,m2],()=>P.miter); stitch([m2,m3],()=>P.miterDk);
    capFan(m3, mb.clone().add(V(0,0.32,0)), P.miterDk);
    // bone-trim band at the base of the miter
    const tb1=ring(mb.clone().add(V(0,0.01,0)),V(0,1,0),0.078,0.070,8), tb2=ring(mb.clone().add(V(0,0.04,0)),V(0,1,0),0.077,0.069,8);
    stitch([tb1,tb2],()=>P.trim);
  }

  /* ---------- ARMS — gnarled hands, one clutching a smoking censer forward. ---------- */
  {
    const S=stoop(V(L.shoulderX,L.shldY-0.02,0.0)), E=V(0.24,0.86,0.20), W=V(0.18,0.66,0.34);
    tube(S,E,0.070,0.050,6,P.skin);
    tube(E,W,0.050,0.038,6,P.skinDk,{capB:{hex:P.skinDk,lift:0.005}});
    // censer hanging from the hand
    const cb=V(0.18,0.58,0.36), ct=V(0.18,0.50,0.36);
    tube(cb,ct,0.06,0.05,6,P.censer,{capB:{hex:P.censerDk}});
    tube(ct,V(0.18,0.66,0.36),0.008,0.008,4,P.censerDk);
    // thin smoke trail
    tube(V(0.18,0.60,0.36), V(0.14,0.90,0.30), 0.02,0.008,5,P.smoke);
    tube(V(0.14,0.90,0.30), V(0.20,1.10,0.26), 0.008,0.003,5,P.smoke);

    const S2=stoop(V(-L.shoulderX,L.shldY-0.02,0.0)), E2=V(-0.22,0.80,0.16), W2=V(-0.20,0.60,0.10);
    tube(S2,E2,0.070,0.050,6,P.skin);
    tube(E2,W2,0.050,0.038,6,P.skinDk,{capB:{hex:P.skinDk,lift:0.005}});
  }

  /* ---------- base disc (Medium r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
