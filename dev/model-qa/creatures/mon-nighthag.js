/* dev/model-qa/creatures/mon-nighthag.js — the NIGHT HAG (bespoke bipedal Medium fiend, hunched crone).
   Whole-object grammar: one function, one merged geometry frame, no anchors. The read: a grotesque
   bent old-woman, spine curled forward over a humped back, warty hooked-nose face, wild stringy
   hair, clawed bony hands, a tattered ragged robe. Blue-grey mottled desaturated skin (VS palette).
   NO eye quads — the sockets are dark recesses carved into the brow. Base disc r=0.42 (Medium).
   Imported by mon-nighthag-probe.html + the proof sheet (p2mon set). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildNightHag(){
  /* ---------- PALETTE (VS desaturated blue-grey mottled crone skin; dirty tattered robe) ---------- */
  const P = {
    skin:0x5c6068, skinDk:0x3a3d43, skinLt:0x757a82,           // blue-grey mottled hide
    mottleA:0x4c5258, mottleB:0x686e70,
    wart:0x33352f, socket:0x14130f,                             // warts, dark eye sockets
    nail:0x24211c, nailLt:0x3a352c,                             // yellow-black claws
    hair:0x2b2925, hairDk:0x181613, hairLt:0x413c34,            // wild stringy grey-black hair
    robe:0x413a3c, robeDk:0x282324, robeLt:0x584e4f,            // tattered dark robe
    hem:0x201c1d, teeth:0x8a8270,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin', [P.mottleA]:'skin', [P.mottleB]:'skin',
    [P.wart]:'skin', [P.socket]:'skin',
    [P.nail]:'bone', [P.nailLt]:'bone', [P.teeth]:'bone',
    [P.hair]:'fur', [P.hairDk]:'fur', [P.hairLt]:'fur',
    [P.robe]:'cloth', [P.robeDk]:'cloth', [P.robeLt]:'cloth', [P.hem]:'cloth',
  });

  /* ---------- LANDMARKS — hunched crone frame, short (~1.35u to crown), pitched hard forward. --- */
  const L = {
    hipY:0.62, waistY:0.74, ribY:0.88, chestY:1.00, shldY:1.06, neckY:1.10,
    hipHalf:0.115, shoulderX:0.190,
    jawY:1.12, cheekY:1.185, browY:1.245, crownY:1.32,
  };
  /* strong forward hunch about the hips — the humped-back read */
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.42);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — bent, robed, a hump riding high on the back. ---------- */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.135, hex:P.robeDk},
    {y:L.waistY, rx:0.175, rz:0.155, hex:P.robe},
    {y:L.ribY,   rx:0.190, rz:0.165, hex:P.robeLt},
    {y:L.chestY, rx:0.175, rz:0.155, hex:P.robe},
    {y:L.shldY,  rx:0.150, rz:0.140, hex:P.robeDk},              // shoulders pull IN (bent crone, not broad)
    {y:L.neckY,  rx:0.075, rz:0.070, hex:P.skinDk},              // scrawny neck stump
  ], 8, {xform:hunch, capTop:{hex:P.skinDk, lift:0.006}});

  /* the HUMP — a bulged mass riding proud of the upper back (the "humped back" silhouette read) */
  {
    const rings=[
      ring(V(0.0, L.ribY-0.02, -0.10), V(0,1,0), 0.140, 0.115, 7, Math.PI/7).map(hunch),
      ring(V(0.0, L.ribY+0.09, -0.13), V(0,1,0), 0.155, 0.130, 7, Math.PI/7).map(hunch),
      ring(V(0.0, L.chestY+0.02, -0.10), V(0,1,0), 0.095, 0.085, 7, Math.PI/7).map(hunch),
    ];
    stitch(rings, ()=>P.robeDk);
    capFan(rings.at(-1), hunch(V(0, L.chestY+0.10, -0.10)), P.robeDk);
  }

  /* tattered hem tatters hanging off the robe waist — ragged strip quads */
  for(const [ang,len] of [[0.2,0.16],[0.9,0.20],[1.7,0.14],[2.4,0.19],[3.1,0.15],[4.0,0.21],[5.0,0.16]]){
    const cx = Math.cos(ang)*0.16, cz = Math.sin(ang)*0.14;
    const base = hunch(V(cx, L.hipY-0.02, cz));
    const tip  = hunch(V(cx*1.3, L.hipY-0.02-len, cz*1.3));
    quad(base.clone().add(V(0.02,0,0)), base.clone().add(V(-0.02,0,0)), tip.clone().add(V(-0.01,0,0)), tip.clone().add(V(0.01,0,0)), (ang%2<1)?P.robeDk:P.hem, 0.08);
  }

  /* ---------- HEAD — warty hooked-nose face, dark eye sockets under a heavy brow, wild hair. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.088, rz:0.090, hex:P.skin},
      {y:L.cheekY, rx:0.100, rz:0.092, hex:P.skinLt},
      {y:L.browY,  rx:0.098, rz:0.082, hex:P.mottleA},
      {y:L.crownY, rx:0.068, rz:0.060, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* sunken cheeks — pull cheek band verts slightly in at the sides */
    for(const i of [0,3,4,7]) rings[1][i].y -= 0.006;
    /* heavy brow shelf pushed forward, casting the dark sockets below it */
    for(const i of [1,2]){ rings[2][i].z += 0.018; rings[2][i].y -= 0.004; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.08);
      }
    }
    capFan(rings.at(-1), hunch(V(0, L.crownY+0.05, -0.01)), P.skinDk);

    /* DARK EYE SOCKETS — recessed dark quads under the brow, no eye geometry, just carved shadow */
    for(const s of [-1,1]){
      const c = hunch(V(s*0.040, L.browY-0.020, 0.080));
      quad(c.clone().add(V(-0.018,0.010,0)), c.clone().add(V(0.018,0.010,0)),
           c.clone().add(V(0.014,-0.014,-0.006)), c.clone().add(V(-0.014,-0.014,-0.006)), P.socket, 0.02);
    }

    /* HOOKED NOSE — a sharp downward-curving beak of a nose, the signature crone feature */
    {
      const nb = hunch(V(0, L.cheekY+0.010, 0.088));
      const nm = hunch(V(0, L.cheekY-0.028, 0.128));
      const nt = hunch(V(0, L.cheekY-0.072, 0.118));            // curls DOWN past the mouth line
      tube(nb, nm, 0.026, 0.020, 5, P.skinLt, {raz:0.030, rbz:0.020});
      tube(nm, nt, 0.020, 0.009, 5, P.skin,   {raz:0.020, rbz:0.010, capB:{hex:P.skinDk, lift:0.004}});
    }

    /* sunken mouth line + a couple of jagged teeth */
    {
      const mc = hunch(V(0, L.jawY-0.010, 0.086));
      quad(mc.clone().add(V(-0.032,0,0)), mc.clone().add(V(0.032,0,0)),
           mc.clone().add(V(0.020,-0.014,-0.010)), mc.clone().add(V(-0.020,-0.014,-0.010)), P.socket, 0.03);
      for(const s of [-1,1]){
        const tb = mc.clone().add(V(s*0.018,-0.002,0.004));
        const tt = tb.clone().add(V(s*0.004,-0.020,0.006));
        tube(tb, tt, 0.008, 0.002, 3, P.teeth);
      }
    }

    /* WARTS — a few small raised bumps on nose/cheek/chin */
    for(const [wx,wy,wz] of [[0.052,-0.010,0.070],[-0.038,0.028,0.078],[0.018,-0.058,0.098],[-0.048,-0.030,0.060]]){
      const c = hunch(V(wx, L.cheekY+wy, wz));
      const tip = c.clone().add(V(0,0.014,0.010));
      tube(c, tip, 0.012, 0.003, 4, P.wart);
    }

    /* WILD STRINGY HAIR — long ragged strands sweeping back off the crown + down the sides */
    for(const [ang,len,drop] of [[-1.3,0.30,0.10],[-0.9,0.38,0.16],[-0.4,0.34,0.08],[0.2,0.40,0.18],
                                   [0.7,0.32,0.06],[1.2,0.36,0.14],[1.9,0.28,0.20],[2.6,0.34,0.10]]){
      const root = hunch(V(Math.sin(ang)*0.06, L.crownY-0.01, Math.cos(ang)*0.05 - 0.02));
      const mid  = root.clone().add(V(Math.sin(ang)*0.10, -len*0.55, Math.cos(ang)*0.08 - drop*0.4));
      const tip  = mid.clone().add(V(Math.sin(ang)*0.07, -len*0.55 - drop, Math.cos(ang)*0.05 - drop*0.6));
      tube(root, mid, 0.018, 0.010, 3, (ang%1<0.5)?P.hair:P.hairDk);
      tube(mid, tip, 0.010, 0.003, 3, P.hairLt, {capB:{hex:P.hairDk, lift:0.004}});
    }
  }

  /* ---------- ARMS — thin, bony, clawed hands. Long enough to hang near the knees, bent crone-wise. --- */
  const clawHand = (wrist, dir, hex)=>{
    const d = dir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(wrist.clone().addScaledVector(d,-0.02), wrist.clone().addScaledVector(d,0.024),
         0.032, 0.026, 5, hex, {capA:{hex}, capB:{hex}});
    for(const off of [-1,-0.3,0.3,1]){
      const kb = wrist.clone().addScaledVector(d,0.020).addScaledVector(side, off*0.020);
      const kt = kb.clone().addScaledVector(d,0.052).addScaledVector(side, off*0.010);
      tube(kb, kt, 0.009, 0.002, 3, P.skinDk, {capB:{hex:P.nail, lift:0.004}});
    }
  };
  {
    const S1 = hunch(V(L.shoulderX, L.shldY-0.01, 0.02));
    const E1 = V(0.235, 0.83, 0.12);
    const W1 = V(0.205, 0.58, 0.18);
    tube(S1, E1, 0.052, 0.038, 5, P.skin);
    tube(E1, W1, 0.038, 0.026, 5, P.skinDk);
    clawHand(W1, V(0.15,-0.75,0.6), P.skin);

    const S2 = hunch(V(-L.shoulderX, L.shldY-0.01, 0.02));
    const E2 = V(-0.245, 0.80, 0.10);
    const W2 = V(-0.220, 0.53, 0.20);
    tube(S2, E2, 0.052, 0.038, 5, P.skin);
    tube(E2, W2, 0.038, 0.026, 5, P.skinDk);
    clawHand(W2, V(-0.15,-0.75,0.6), P.skin);
  }

  /* ---------- LEGS — thin, mostly hidden by the robe hem; small bare bony feet peeking out. ------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.135,0.34,0.05), ankL=V(-0.120,0.075,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.140,0.34,0.04), ankR=V( 0.125,0.075,0.01);
    tube(hipL,kneeL,0.075,0.052,6,P.robeDk);
    tube(kneeL,ankL,0.040,0.028,6,P.skinDk);
    tube(hipR,kneeR,0.075,0.052,6,P.robeDk);
    tube(kneeR,ankR,0.040,0.028,6,P.skinDk);
    for(const ank of [ankL,ankR]){
      const heel=V(ank.x,0.032,ank.z);
      const toe=V(ank.x, 0.026, ank.z+0.075);
      tube(heel, toe, 0.030,0.020,5,P.skin,{capA:{hex:P.skinDk}});
      for(const off of [-1,0,1]){
        const tb=toe.clone().add(V(off*0.018,0,0));
        const tt=tb.clone().add(V(off*0.006,-0.006,0.026));
        tube(tb, tt, 0.008,0.002,3,P.skin,{capB:{hex:P.nail, lift:0.003}});
      }
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
