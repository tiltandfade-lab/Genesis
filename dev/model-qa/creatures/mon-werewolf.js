/* dev/model-qa/creatures/mon-werewolf.js — THE WEREWOLF, the hybrid horror (whole-object grammar).
   Same one-function / one-geometry-frame / no-anchors law as humanoid.js + mon-wolf.js. The lupine
   biped: ~1.8u HUNCHED — a WOLF'S HEAD (reusing the OPEN-MAW-WITH-TEETH lesson from mon-wolf.js) on
   a powerful fur-ridged HUMANOID frame. Shoulders hunched forward with a SPINAL FUR RIDGE running
   the back, LONG clawed hands (finger tubes ending in dark claws) held ready at mid-height,
   DIGITIGRADE legs (reverse-jointed, on the toes), a wolf TAIL swung clear of the legs, and torn
   TROUSER SCRAPS at the waist — the one hint it was a man. Charcoal-grey fur, paler chest.
   Mid-transformation menace: must read as NEITHER the quadruped wolf NOR any humanoid — the horror
   between. Base disc r=0.48 (big Medium). Imported by mon-werewolf-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildWerewolf(){
  /* ---------- PALETTE (VS desaturated; charcoal-grey fur, paler chest/throat) ---------- */
  const P = {
    fur:0x545049, furDk:0x2e2b27, furLt:0x736b60, furGrey:0x453f38,       // charcoal-grey coat, wide value spread
    chest:0x8c8478, chestDk:0x6a6358, belly:0x9a9184,                     // paler grizzled chest/throat
    ridge:0x3a352f,                                                        // dark dorsal fur ridge
    muzzle:0x4a453d, muzzleLt:0x6e675b, nose:0x18140f,                    // grey muzzle, black nose
    maw:0x2a1c1a, tongue:0x8a4a46, tooth:0xe4dcc6,                        // dark mouth, pale fangs
    ear:0x453f38, earIn:0x2a2620,
    eye:0x141009, eyeGlow:0xd8b83a,                                       // baleful yellow eye
    claw:0x1a1612, palm:0x413a30,                                        // long dark claws, dark palm
    trouser:0x4a4436, trouserDk:0x332f24, trouserRip:0x5c5545,           // torn trouser scraps
    disc0:0x4a4038, discTop:0x585047,                                    // BASE disc
  };

  /* ---------- LANDMARKS — TALL hunched biped (~1.8u to the crown). The trunk pitches forward hard
     (coiled predator), shoulders roll over, the wolf head juts LOW and forward on a thick neck.
     Digitigrade legs mean the "knee" is high and the ankle/hock sits well up off the disc. ---------- */
  const L = {
    hipY:0.80, waistY:0.92, ribY:1.08, chestY:1.24, shldY:1.40, neckY:1.46,
    hipHalf:0.155, shoulderX:0.360,
    headBackY:1.52, headMidY:1.50,                                        // head sits forward, slightly below shoulder-top
  };

  /* heavy forward hunch about the hips — shoulders roll over, head drops in front (coiled) */
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.26);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — a powerful humanoid frame under fur. One loft, hips→neck. Deep chest, broad
     hunched shoulders, narrower waist (V-taper — man's frame, wolf's mass). ---------- */
  stack([
    {y:L.hipY,   rx:0.215, rz:0.185, hex:P.furDk},
    {y:L.waistY, rx:0.230, rz:0.185, hex:P.fur},                         // waist (not a barrel — humanoid V)
    {y:L.ribY,   rx:0.280, rz:0.210, hex:P.furLt},
    {y:L.chestY, rx:0.320, rz:0.225, hex:P.fur},                         // deep chest
    {y:L.shldY,  rx:0.350, rz:0.220, hex:P.furLt},                       // broad hunched shoulders
    {y:L.neckY,  rx:0.185, rz:0.175, hex:P.furGrey},                     // thick furred neck stump
  ], 8, {xform:hunch, capTop:{hex:P.furGrey, lift:0.006}});

  /* ---------- SPINAL FUR RIDGE — a row of raised dark fur tufts running the back (−z), from the
     nape down to the tail root, standing up along the hunched spine (raised-hackles menace). ---------- */
  {
    const ridge=[
      {y:L.neckY-0.02, z:-0.16, h:0.10},
      {y:L.shldY-0.02, z:-0.20, h:0.13},
      {y:L.chestY-0.02,z:-0.21, h:0.12},
      {y:L.ribY-0.02,  z:-0.20, h:0.11},
      {y:L.waistY-0.02,z:-0.18, h:0.09},
      {y:L.hipY+0.02,  z:-0.16, h:0.08},
    ];
    for(const r of ridge){
      const base = hunch(V(0, r.y, r.z));
      const tip  = hunch(V(0, r.y+r.h, r.z-0.06));                        // tufts angle up + back
      // a triangular fin tuft, plus a couple of side flicks for shag
      quad(base.clone().add(V(-0.045,0,0.02)), base.clone().add(V(0.045,0,0.02)), tip, tip, P.ridge, 0.06);
      quad(base.clone().add(V(-0.045,0,0.02)), tip, tip, base.clone().add(V(-0.070,r.h*0.5,-0.02)), P.furDk, 0.07);
      quad(base.clone().add(V(0.045,0,0.02)), base.clone().add(V(0.070,r.h*0.5,-0.02)), tip, tip, P.furDk, 0.07);
    }
  }

  /* ---------- GRIZZLED CHEST BIB — paler fur down the front, the classic werewolf pale chest ---------- */
  {
    for(const [y,half,drop,hex] of [
      [L.chestY+0.02, 0.150, 0.12, P.chest],
      [L.chestY-0.10, 0.175, 0.13, P.belly],
      [L.ribY-0.04,  0.160, 0.12, P.chestDk],
    ]){
      for(let k=-1;k<=1;k++){
        const cx=k*half*0.55, zf=0.225 - Math.abs(k)*0.02;
        const tl=hunch(V(cx-half*0.30, y, zf)), tr=hunch(V(cx+half*0.30, y, zf));
        const tip=hunch(V(cx, y-drop, zf-0.01));
        quad(tl, tr, tip, tip, (k%2?hex:P.chestDk), 0.05);
      }
    }
  }

  /* ---------- WOLF HEAD — reuses the OPEN-MAW technique from mon-wolf.js: a lowered wedge cranium
     with an UPPER jaw projecting forward + a LOWER jaw dropped and angled down, parted to reveal a
     dark mouth with pale geometric fangs. Baleful yellow eyes high on the skull, pricked ears. Sits
     LOW and jutting forward on the hunched neck. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const HY = L.headMidY;                                                // head center height
    const HZ = 0.20;                                                       // head juts forward (+z)

    /* cranium: skull -> brow -> crown, ahead of and below the shoulders */
    const bands=[
      {y:HY-0.02, cz:HZ+0.02, rx:0.130, rz:0.135, hex:P.fur},
      {y:HY+0.03, cz:HZ+0.00, rx:0.150, rz:0.145, hex:P.furLt},
      {y:HY+0.08, cz:HZ-0.03, rx:0.128, rz:0.118, hex:P.furDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), hunch(V(0, HY+0.13, HZ-0.05)), P.furDk);

    /* ===== OPEN MAW — the wolf signature. Two muzzle wedges parted around a dark mouth cavity with
       pale fangs. The head is jutting forward so the maw faces the viewer, not the floor. ===== */
    const jawY = HY-0.075;                                                // where the jaws hinge
    // dark mouth interior wedge (behind the teeth)
    {
      const mb=hunch(V(0, jawY+0.02, HZ+0.10)), mm=hunch(V(0, jawY-0.02, HZ+0.24));
      tube(mb, mm, 0.066, 0.048, n, P.maw, {raz:0.052, rbz:0.038, phase:ph, capB:{hex:P.maw, lift:0.006}});
      // tongue slab on the lower jaw floor
      quad(hunch(V(-0.028,jawY-0.05,HZ+0.14)), hunch(V(0.028,jawY-0.05,HZ+0.14)),
           hunch(V(0.022,jawY-0.055,HZ+0.26)), hunch(V(-0.022,jawY-0.055,HZ+0.26)), P.tongue, 0.04);
    }
    // UPPER jaw wedge (projects forward, level; black nose at the tip)
    const uB=hunch(V(0, jawY+0.050, HZ+0.095)), uM=hunch(V(0, jawY+0.040, HZ+0.25)), uT=hunch(V(0, jawY+0.025, HZ+0.35));
    tube(uB, uM, 0.096, 0.070, n, P.muzzle, {raz:0.066, rbz:0.048, phase:ph});
    tube(uM, uT, 0.070, 0.038, n, P.muzzleLt, {raz:0.048, rbz:0.026, phase:ph, capB:{hex:P.nose, lift:0.010}});
    // LOWER jaw wedge (dropped FURTHER + angled down — wide snarling gape so the fangs read)
    const lB=hunch(V(0, jawY-0.085, HZ+0.095)), lM=hunch(V(0, jawY-0.150, HZ+0.22)), lT=hunch(V(0, jawY-0.185, HZ+0.30));
    tube(lB, lM, 0.074, 0.050, n, P.muzzle, {raz:0.054, rbz:0.036, phase:ph});
    tube(lM, lT, 0.050, 0.026, n, P.muzzleLt, {raz:0.036, rbz:0.018, phase:ph, capB:{hex:P.muzzleLt, lift:0.008}});

    /* geometric FANGS — pale triangle teeth on both jaw lines (mon-wolf.js technique). All authored
       in hunched-head space via a helper that hunches the quad corners. */
    const fang=(x,y,z,w,h,down)=>{
      const ty = down ? y-h : y+h;
      quad(hunch(V(x-w,y,z+0.006)), hunch(V(x+w,y,z+0.006)), hunch(V(x,ty,z+0.004)), hunch(V(x,ty,z+0.004)), P.tooth, 0.02);
    };
    for(const s of [-1,1]){                                               // upper canines + incisors (point DOWN)
      fang(s*0.052, jawY+0.010, HZ+0.14, 0.020, 0.078, true);            // big canine
      fang(s*0.026, jawY+0.008, HZ+0.18, 0.013, 0.038, true);
      fang(s*0.048, jawY+0.006, HZ+0.04, 0.014, 0.036, true);
    }
    for(const s of [-1,1]){                                               // lower canines (point UP from the dropped jaw)
      fang(s*0.044, jawY-0.088, HZ+0.14, 0.017, 0.066, false);
      fang(s*0.022, jawY-0.092, HZ+0.175, 0.011, 0.034, false);
    }

    /* BALEFUL EYES — small dark almond dots with a yellow glow fleck, high on the skull flanking
       the brow (mon-wolf.js eye technique, hunched into head space) */
    for(const s of [-1,1]){
      const ex=s*0.098, ey=HY+0.028, ez=HZ+0.12;
      quad(hunch(V(ex-0.022,ey-0.014,ez)), hunch(V(ex+0.022,ey-0.014,ez)),
           hunch(V(ex+0.020,ey+0.014,ez-0.010)), hunch(V(ex-0.020,ey+0.014,ez-0.010)), P.eye, 0.0);
      quad(hunch(V(ex-0.009,ey-0.004,ez+0.004)), hunch(V(ex+0.009,ey-0.004,ez+0.004)),
           hunch(V(ex+0.008,ey+0.007,ez-0.002)), hunch(V(ex-0.008,ey+0.007,ez-0.002)), P.eyeGlow, 0.0);
    }

    /* PRICKED EARS — two upright triangular wedges on the crown, tips up + slightly back */
    for(const s of [-1,1]){
      const base=hunch(V(s*0.100, HY+0.10, HZ-0.02));
      const tip =hunch(V(s*0.140, HY+0.28, HZ-0.06));
      tube(base, tip, 0.058, 0.010, 6, P.ear, {raz:0.030, rbz:0.006, capB:{hex:P.ear, lift:0.006}});
      quad(hunch(V(s*0.088,HY+0.115,HZ-0.008)), hunch(V(s*0.116,HY+0.115,HZ-0.016)),
           hunch(V(s*0.126,HY+0.255,HZ-0.052)), hunch(V(s*0.104,HY+0.255,HZ-0.044)), P.earIn, 0.03);
    }
  }

  /* ---------- ARMS — LONG, held READY at mid-height (elbows out, forearms forward), ending in
     LONG clawed hands: a fur forearm, a dark palm block, and long finger tubes tipped with claws.
     The menace-ready pose (not a swing, a poised grab). Thick furred. ---------- */
  const clawHand = (wrist, reach, hex)=>{
    const d = reach.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    // palm block
    const palmC = wrist.clone().addScaledVector(d, 0.055);
    tube(wrist, palmC, 0.062, 0.058, 6, P.palm, {capA:{hex:P.palm}});
    // FOUR long fingers, each a two-seg tube ending in a dark claw, splayed + slightly curled down
    for(const off of [-1.5,-0.5,0.5,1.5]){
      const kb = palmC.clone().addScaledVector(d,0.020).addScaledVector(side, off*0.032);
      const km = kb.clone().addScaledVector(d,0.070).addScaledVector(side, off*0.008).add(V(0,-0.010,0));
      const kt = km.clone().addScaledVector(d,0.060).add(V(0,-0.030,0));                 // finger curls down
      tube(kb, km, 0.019, 0.013, 4, hex);
      tube(km, kt, 0.013, 0.004, 4, hex, {capB:{hex:P.claw, lift:0.010}});               // claw
    }
    // a thumb claw off to the inner side
    const tb = palmC.clone().addScaledVector(side, -0.048).add(V(0,-0.010,0));
    const tt = tb.clone().addScaledVector(d,0.055).addScaledVector(side,-0.010).add(V(0,-0.020,0));
    tube(tb, tt, 0.016, 0.004, 4, hex, {capB:{hex:P.claw, lift:0.008}});
  };
  {
    for(const s of [-1,1]){
      const S  = hunch(V(s*L.shoulderX, L.shldY-0.02, 0.02));
      const E  = V(s*0.490, 1.06, 0.14);                                  // elbow out + low (long upper arm)
      const W  = V(s*0.485, 0.86, 0.28);                                  // wrist further OUT + slightly back (clears thigh)
      tube(S, E, 0.115, 0.092, 6, P.fur);                                 // thick furred upper arm
      tube(E, W, 0.088, 0.066, 6, P.furDk);                              // forearm
      clawHand(W, V(s*0.24, -0.30, 1), P.palm);                          // hand reaches down + forward + OUT, claws splayed clear of the thigh
      // shaggy forearm tuft
      const base=E.clone().add(V(s*0.02,-0.02,-0.04));
      quad(base, base.clone().add(V(s*0.05,0.08,-0.03)), base.clone().add(V(s*0.09,0.05,-0.05)), base, P.furDk, 0.08);
    }
  }

  /* ---------- TORN TROUSER SCRAPS — the one hint it was a man. Ragged cloth bands clinging at the
     waist/hips, torn into hanging flaps down the upper thighs. Authored around the hip loft. ---------- */
  {
    // a clinging waistband (two bands)
    stack([
      {y:L.hipY-0.02, rx:0.225, rz:0.195, hex:P.trouserDk},
      {y:L.hipY-0.14, rx:0.235, rz:0.200, hex:P.trouser},
    ], 8, {xform:hunch});
    // ragged torn flaps hanging off the waistband at uneven lengths (the shredded read)
    for(const [ang,len,hex] of [
      [-2.4,0.22,P.trouser],[-1.4,0.30,P.trouserDk],[-0.5,0.18,P.trouserRip],
      [0.5,0.28,P.trouser],[1.4,0.20,P.trouserDk],[2.4,0.32,P.trouserRip],[3.0,0.16,P.trouser],
    ]){
      const r=0.215;
      const bx=Math.cos(ang)*r, bz=Math.sin(ang)*r*0.85;
      const top=hunch(V(bx, L.hipY-0.10, bz));
      const midL=hunch(V(bx*1.02-0.03, L.hipY-0.10-len*0.6, bz*1.02));
      const midR=hunch(V(bx*1.02+0.03, L.hipY-0.10-len*0.6, bz*1.02));
      const tip=hunch(V(bx*1.04, L.hipY-0.10-len, bz*1.04));            // jagged point
      quad(top.clone().add(V(-0.035,0,0)), top.clone().add(V(0.035,0,0)), midR, midL, hex, 0.05);
      quad(midL, midR, tip, tip, hex, 0.06);
    }
  }

  /* ---------- DIGITIGRADE LEGS — reverse-jointed lupine legs: a fur thigh angling forward to a HIGH
     hock (the backward "knee"), a shank angling back down to the toes, standing up on a paw. This is
     the wolf-leg tell that separates it from a plain biped. ---------- */
  {
    const leg=(hipX, s)=>{
      const hip  = hunch(V(hipX, L.hipY-0.04, 0.02));
      const knee = V(hipX + s*0.020, 0.60, 0.20);                        // stifle forward + high
      const hock = V(hipX + s*0.010, 0.34, -0.06);                       // HOCK swings BACK (reverse joint)
      const toe  = V(hipX + s*0.010, 0.09, 0.14);                        // paw plants forward on the disc
      tube(hip, knee, 0.135, 0.100, 6, P.fur);                           // furred thigh
      tube(knee, hock, 0.090, 0.062, 6, P.furDk);                        // shank down-and-back
      tube(hock, toe, 0.058, 0.048, 6, P.fur);                           // metatarsal down-and-forward (digitigrade)
      // wolf paw + claws
      const paw=V(toe.x, 0.05, toe.z+0.03);
      tube(toe, paw, 0.048, 0.044, 6, P.muzzle, {capB:{hex:P.muzzle, lift:0.006}});
      for(const cx of [-0.024,0,0.024]){
        quad(V(paw.x+cx-0.007,0.03,paw.z+0.03), V(paw.x+cx+0.007,0.03,paw.z+0.03),
             V(paw.x+cx+0.004,0.008,paw.z+0.06), V(paw.x+cx-0.004,0.008,paw.z+0.06), P.claw, 0.0);
      }
    };
    leg(-L.hipHalf, -1);
    leg( L.hipHalf,  1);
  }

  /* ---------- WOLF TAIL — bushy, dropped and swung to ONE side so it clears the digitigrade legs in
     the back view. Roots at the tailbone (−z), sweeps down and out, tapering to a dark tip. ---------- */
  {
    const root = hunch(V(0.05, L.hipY+0.02, -0.20));
    const b1   = V(0.14, 0.68, -0.42);                                    // sweeps UP-and-back off the tailbone
    const b2   = V(0.20, 0.50, -0.56);                                    // then droops down, swung to +x side, well BEHIND the legs
    const b3   = V(0.24, 0.30, -0.62);
    const tip  = V(0.26, 0.15, -0.64);
    tube(root, b1, 0.095, 0.108, 8, P.fur,    {phase:Math.PI/8, capA:{hex:P.furDk}});   // bushy base flare
    tube(b1,   b2, 0.108, 0.088, 8, P.fur,    {phase:Math.PI/8});
    tube(b2,   b3, 0.088, 0.060, 8, P.furDk,  {phase:Math.PI/8});
    tube(b3,   tip,0.060, 0.024, 8, P.furDk,  {phase:Math.PI/8, capB:{hex:0x1e1a16, lift:0.008}});  // dark tip
  }

  /* ---------- base disc (big Medium: r=0.48) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.48, 0.48, 18);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.46, 0.46, 18);
    stitch([r1,r2], ()=>P.disc0);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
