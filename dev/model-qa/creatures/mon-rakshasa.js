/* dev/model-qa/creatures/mon-rakshasa.js — THE RAKSHASA, a regal tiger-fiend (whole-object grammar).
   Same one-function / one-geometry-frame / no-anchors law as mon-lizard.js. A humanoid frame of
   Medium size (discR 0.42) wearing FINE ROBES, topped with a striped TIGER HEAD (fanged, orange-
   black), and finished with the fiend's signature wrongness: hands turned BACKWARD (palms facing
   forward/out at the wrist, a subtle unsettling reversal instead of a normal grip). VS-desaturated
   orange-black tiger fur, a rich (but dirtied) robe over it. NO eye quads — dark brow-shadowed
   sockets only. Base disc r=0.42. Imported by the p2mon proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildRakshasa(){
  /* ---------- PALETTE (VS desaturated; dirty orange-black tiger stripes, deep rich robe) ---------- */
  const P = {
    fur:0xa2652f, furDk:0x5c3117, furLt:0xb9803f,           // dirty burnt-orange tiger coat
    stripe:0x241c14, stripeDk:0x140f0a,                      // black stripes
    muzzle:0xc99a5c, muzzleDk:0x8f6a3a,                       // pale muzzle patch
    fang:0xd8cfa8, mouth:0x2a1712,
    robe:0x5a2e3a, robeDk:0x381c24, robeLt:0x74404e,          // rich dirtied maroon robe
    trim:0x8a7238, trimDk:0x5e4a22,                           // tarnished gold trim
    sash:0x2e2620,
    claw:0x1c1712, palm:0x8f6a3a, palmDk:0x5c4326,            // BACKWARD hand — palm faces out
    ear:0xa2652f, earIn:0x3a2416,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — an upright regal frame (~1.55u to the crown), NOT hunched (a rakshasa
     carries itself with cold dignity). Torso stands tall inside the robe. ---------- */
  const L = {
    hipY:0.72, waistY:0.86, ribY:1.00, chestY:1.14, shldY:1.26, neckY:1.30,
    hipHalf:0.150, shoulderX:0.300,
    jawY:1.36, cheekY:1.42, browY:1.475, crownY:1.535,
  };

  /* ---------- TORSO — one loft, hips->neck, wrapped by the robe (robe hex on the outer bands, a
     sliver of fur at the collar). Upright, dignified taper. ---------- */
  stack([
    {y:L.hipY,   rx:0.205, rz:0.175, hex:P.robeDk},
    {y:L.waistY, rx:0.190, rz:0.165, hex:P.robe},
    {y:L.ribY,   rx:0.230, rz:0.190, hex:P.robeLt},
    {y:L.chestY, rx:0.265, rz:0.205, hex:P.robe},
    {y:L.shldY,  rx:0.280, rz:0.200, hex:P.robeDk},
    {y:L.neckY,  rx:0.150, rz:0.140, hex:P.furDk},           // furred neck stump peeking above the collar
  ], 8, {capTop:{hex:P.furDk, lift:0.006}});

  /* gold trim banding at the collar + waist sash (the fine-robes read) */
  {
    const rings=[ ring(V(0,L.neckY-0.03,0.02), V(0,1,0), 0.170, 0.155, 8, Math.PI/8),
                  ring(V(0,L.neckY-0.06,0.02), V(0,1,0), 0.165, 0.150, 8, Math.PI/8) ];
    stitch(rings, ()=>P.trim);
    const sashR=[ ring(V(0,L.waistY+0.02,0), V(0,1,0), 0.198, 0.172, 8, Math.PI/8),
                  ring(V(0,L.waistY-0.05,0), V(0,1,0), 0.205, 0.178, 8, Math.PI/8) ];
    stitch(sashR, ()=>P.sash);
    capFan(sashR[0], V(0,L.waistY+0.03,0), P.trimDk, true);
  }

  /* draped robe fold flaps hanging at the front/sides — breaks the smooth loft with fabric-like
     overlapping quads */
  for(const [ang,len,hex] of [[-2.6,0.30,P.robeDk],[-1.6,0.22,P.robe],[-0.3,0.34,P.robeLt],
                               [0.3,0.28,P.robeDk],[1.6,0.24,P.robe],[2.6,0.32,P.robeDk]]){
    const r=0.200;
    const bx=Math.cos(ang)*r, bz=Math.sin(ang)*r*0.9;
    const top = V(bx, L.hipY-0.06, bz);
    const midL= V(bx*1.05-0.03, L.hipY-0.06-len*0.6, bz*1.05);
    const midR= V(bx*1.05+0.03, L.hipY-0.06-len*0.6, bz*1.05);
    const tip = V(bx*1.08, L.hipY-0.06-len, bz*1.08);
    quad(top.clone().add(V(-0.04,0,0)), top.clone().add(V(0.04,0,0)), midR, midL, hex, 0.05);
    quad(midL, midR, tip, tip, hex, 0.06);
  }

  /* ---------- HEAD — TIGER: striped fanged head, pale muzzle patch, tufted ears. NO eye quads —
     dark brow-shadowed socket recesses only (house ruling). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.128, rz:0.140, hex:P.muzzle},         // jaw/muzzle juts forward
      {y:L.cheekY, rx:0.152, rz:0.148, hex:P.fur},            // broad cheeks
      {y:L.browY,  rx:0.146, rz:0.128, hex:P.stripe},         // heavy dark brow band — casts the socket shadow
      {y:L.crownY, rx:0.110, rz:0.100, hex:P.fur},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.crownY+0.07, -0.01), P.furDk);

    /* dark socket recesses (shape, not painted eyes) — sunk quads under the brow ridge */
    for(const s of [-1,1]){
      const c = V(s*0.075, L.browY-0.015, 0.135);
      quad(c.clone().add(V(-0.026,0.012,0)), c.clone().add(V(0.026,0.012,0)),
           c.clone().add(V(0.020,-0.014,-0.012)), c.clone().add(V(-0.020,-0.014,-0.012)), P.stripeDk, 0.02);
    }

    /* muzzle/snout wedge projecting forward, pale patch, dark nose tip */
    const snB=V(0,L.jawY-0.01,0.145), snM=V(0,L.jawY-0.03,0.225), snT=V(0,L.jawY-0.045,0.27);
    tube(snB, snM, 0.098, 0.070, n, P.muzzle, {raz:0.088, rbz:0.056, phase:ph});
    tube(snM, snT, 0.070, 0.040, n, P.muzzleDk, {raz:0.056, rbz:0.032, phase:ph, capB:{hex:P.mouth, lift:0.008}});

    /* dark mouth line + a pair of visible fangs jutting from the upper jaw */
    quad(V(-0.062,L.jawY-0.055,0.185), V(0.062,L.jawY-0.055,0.185),
         V(0.040,L.jawY-0.062,0.255), V(-0.040,L.jawY-0.062,0.255), P.mouth, 0.03);
    for(const s of [-1,1]){
      const fb=V(s*0.038, L.jawY-0.055, 0.20), ft=V(s*0.034, L.jawY-0.120, 0.205);
      tube(fb, ft, 0.014, 0.004, 4, P.fang, {capB:{hex:P.fang, lift:0.004}});
    }

    /* TIGER STRIPES — a set of dark angled quads laid over the cheeks/crown for the coat pattern */
    for(const [y,z,rot,hex] of [[L.cheekY+0.02,0.10,0.3,P.stripe],[L.cheekY-0.03,0.08,-0.3,P.stripe],
                                 [L.browY+0.01,0.06,0.2,P.stripeDk],[L.crownY-0.01,0.02,0,P.stripe]]){
      for(const s of [-1,1]){
        const c=V(s*0.11, y, z);
        const d=V(s*0.03*Math.cos(rot), 0.05, s*0.02*Math.sin(rot));
        quad(c.clone().add(V(-0.018,0,0.01)), c.clone().add(V(0.018,0,0.01)),
             c.clone().add(d).add(V(0.012,0,0)), c.clone().add(d).add(V(-0.012,0,0)), hex, 0.05);
      }
    }

    /* TUFTED EARS — small rounded ears set on the crown sides, tufted tips */
    for(const s of [-1,1]){
      const eb=V(s*0.115, L.browY+0.03, -0.02);
      const et=V(s*0.145, L.crownY+0.09, -0.05);
      tube(eb, et, 0.052, 0.016, 5, P.ear, {raz:0.034, rbz:0.012, capA:{hex:P.earIn}, capB:{hex:P.furDk, lift:0.006}});
    }
  }

  /* ---------- ARMS — robed upper arm, bared furred forearm, and the WRONG-HANDS tell: the hand is
     turned BACKWARD at the wrist so the palm faces forward/outward instead of inward (a subtle,
     unsettling reversal read at a glance — not a grotesque twist, just wrong). ---------- */
  const backwardHand = (wrist, outDir, hex)=>{
    const d = outDir.clone().normalize();                     // palm-facing direction (turned OUT)
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    const palmC = wrist.clone().addScaledVector(d, 0.045);
    tube(wrist, palmC, 0.052, 0.050, 6, hex, {capA:{hex:hex}});
    // palm slab facing outward (the reversed read — flat plane visible from the front)
    quad(palmC.clone().add(V(-0.036,0.032,0)).addScaledVector(d,0.01),
         palmC.clone().add(V(0.036,0.032,0)).addScaledVector(d,0.01),
         palmC.clone().add(V(0.030,-0.040,0)).addScaledVector(d,0.01),
         palmC.clone().add(V(-0.030,-0.040,0)).addScaledVector(d,0.01), P.palmDk, 0.04);
    // four fingers projecting further OUT along d (away from the body — the wrong angle)
    for(const off of [-1.5,-0.5,0.5,1.5]){
      const fb = palmC.clone().addScaledVector(d,0.02).addScaledVector(side, off*0.024);
      const ft = fb.clone().addScaledVector(d,0.075).addScaledVector(side, off*0.006);
      tube(fb, ft, 0.014, 0.005, 4, hex, {capB:{hex:P.claw, lift:0.006}});
    }
  };
  {
    for(const s of [-1,1]){
      const S = V(s*L.shoulderX, L.shldY-0.02, 0.02);
      const E = V(s*0.360, 0.98, 0.12);
      const W = V(s*0.340, 0.72, 0.16);
      tube(S, E, 0.098, 0.078, 6, P.robe);                    // robed upper arm (sleeve)
      quad(V(s*0.10+s*0.02,0.99,0.0), V(s*0.14+s*0.02,0.99,0.0), V(s*0.16+s*0.02,0.90,0.10), V(s*0.10+s*0.02,0.90,0.10), P.trim, 0.05);
      tube(E, W, 0.072, 0.056, 6, P.fur);                     // bared furred forearm
      backwardHand(W, V(s*0.55, -0.25, 0.65), P.palm);        // hand turned OUT/backward — the tell
    }
  }

  /* ---------- LEGS — robed, mostly hidden by the hem; short bared furred ankles + digitigrade-ish
     tiger feet planted on the disc. ---------- */
  {
    const leg=(hipX)=>{
      const hip = V(hipX, L.hipY-0.04, 0.0);
      const knee= V(hipX*1.05, 0.42, 0.08);
      const ank = V(hipX*1.05, 0.13, 0.05);
      tube(hip, knee, 0.115, 0.088, 6, P.robeDk);              // robe hem covers the thigh
      tube(knee, ank, 0.078, 0.058, 6, P.fur);                 // bared furred shin
      const paw = V(ank.x, 0.045, ank.z+0.05);
      tube(ank, paw, 0.056, 0.050, 6, P.muzzle, {capB:{hex:P.muzzle, lift:0.006}});
      for(const cx of [-0.026,0,0.026]){
        quad(V(paw.x+cx-0.008,0.03,paw.z+0.03), V(paw.x+cx+0.008,0.03,paw.z+0.03),
             V(paw.x+cx+0.005,0.006,paw.z+0.06), V(paw.x+cx-0.005,0.006,paw.z+0.06), P.claw, 0.0);
      }
    };
    leg(-L.hipHalf);
    leg( L.hipHalf);
  }

  /* ---------- TAIL — a low striped tiger tail, held just clear of the robe hem, small nod to the
     bestial nature without sprawling past the disc. ---------- */
  {
    const t0=V(0.03, L.hipY-0.02, -0.19), t1=V(0.08,0.46,-0.30), t2=V(0.12,0.28,-0.36), tip=V(0.14,0.14,-0.38);
    tube(t0,t1,0.058,0.044,6,P.fur,{capA:{hex:P.furDk}});
    tube(t1,t2,0.044,0.030,6,P.stripe);
    tube(t2,tip,0.030,0.012,6,P.furDk,{capB:{hex:P.stripeDk, lift:0.006}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
