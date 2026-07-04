/* dev/model-qa/creatures/mon-yeti.js — the YETI (bespoke BIPED, Large shaggy ape-man).
   Smaller/leaner cousin of the abominable-yeti: hunched, long clawed arms, fanged snarling face.
   Dirty grey-white fur (VS desaturated — mottled, never bright). NO eye quads (sockets are dark
   recesses only). Whole-object grammar: one function, one merged geometry frame, no anchors, no
   part-object transforms. Large size, kept within the r=0.55 disc footprint (rise in +y, not
   sprawl). Imported by the proof sheet + ps1-sheet.html p2mon set. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildYeti(){
  /* ---------- PALETTE (VS desaturated; dirty grey-white fur, mottled, dark cavities) ---------- */
  const P = {
    fur:0x9a9488, furDk:0x655f54, furLt:0xb8b2a4, furGrey:0x847e70,   // dirty grey-white, wide value range
    hide:0x6b6458, hideDk:0x433f36,                                    // exposed hide (face/palms/soles)
    mouth:0x2c2620, fang:0xd8d2c0, fangDk:0x9a9484, tongue:0x7a4038,
    claw:0x232019, nose:0x1e1b16,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({ [P.fur]:'fur', [P.furDk]:'fur', [P.furLt]:'fur', [P.furGrey]:'fur',
    [P.hide]:'skin', [P.hideDk]:'skin', [P.claw]:'bone', [P.fang]:'bone', [P.fangDk]:'bone' });

  /* ---------- LANDMARKS — hunched biped, ~1.55 crown height, pitched forward at the waist. ---------- */
  const L = {
    hipY:0.62, waistY:0.74, chestY:0.92, shldY:1.06, neckY:1.12,
    jawY:1.15, muzzleY:1.20, browY:1.30, crownY:1.42,
    hipHalf:0.165, shoulderX:0.30,
  };
  /* forward hunch about the hips — coiled ape-man posture, leaner than a bugbear's coil */
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.22);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — lumpy shaggy loft, lean but broad-shouldered. ---------- */
  stack([
    {y:L.hipY,   rx:0.195, rz:0.170, hex:P.furDk},
    {y:L.waistY, rx:0.215, rz:0.180, hex:P.fur},
    {y:L.chestY, rx:0.270, rz:0.205, hex:P.furGrey},
    {y:L.shldY,  rx:0.310, rz:0.210, hex:P.furLt},
    {y:L.neckY,  rx:0.150, rz:0.145, hex:P.furDk},
  ], 8, {xform:hunch, capTop:{hex:P.furDk, lift:0.006}});

  /* shaggy fur tufts riding the chest/shoulders for the mangy read */
  for(const s of [-1,1]){
    for(const [y,len,zk] of [[L.shldY-0.02,0.09,0.03],[L.chestY+0.03,0.07,-0.02],[L.waistY,0.06,0.04]]){
      const base = hunch(V(s*0.25, y, zk));
      quad(base, base.clone().add(V(s*0.05,len,zk)), base.clone().add(V(s*0.08,len*0.5,zk*1.4)), base,
           s>0?P.furDk:P.fur, 0.08);
    }
  }

  /* ---------- HEAD — fanged snarling face, dark socket recesses, low sloped brow. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.115, rz:0.120, hex:P.hide},     // jaw/muzzle (exposed hide)
      {y:L.muzzleY, rx:0.135, rz:0.128, hex:P.hideDk},
      {y:L.browY,   rx:0.140, rz:0.115, hex:P.fur},      // fur starts, brow ridge
      {y:L.crownY-0.02, rx:0.105, rz:0.095, hex:P.fur},
      {y:L.crownY+0.05, rx:0.062, rz:0.056, hex:P.furDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* push muzzle forward (snout read) */
    for(const i of [1,2]){ rings[0][i].z += 0.055; }
    for(const i of [1,2]){ rings[1][i].z += 0.036; rings[1][i].y -= 0.008; }
    /* heavy sloped brow shelving forward over dark socket recesses */
    for(const i of [1,2]){ rings[2][i].z += 0.040; rings[2][i].y -= 0.012; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.08);
      }
    }
    capFan(rings.at(-1), hunch(V(0, L.crownY+0.16, -0.01)), P.furDk);

    /* dark eye-socket recesses (NO eye quads — just shadowed pits under the brow) */
    for(const s of [-1,1]){
      const c = hunch(V(s*0.058, L.muzzleY+0.045, 0.115));
      quad(c.clone().add(V(-0.020,0.012,0)), c.clone().add(V(0.020,0.012,0)),
           c.clone().add(V(0.016,-0.014,-0.01)), c.clone().add(V(-0.016,-0.014,-0.01)), P.mouth, 0.02);
    }

    /* snout tip + nostril pits */
    const snoutTip = hunch(V(0, L.jawY-0.01, 0.185));
    quad(snoutTip.clone().add(V(-0.03,0.015,0)), snoutTip.clone().add(V(0.03,0.015,0)),
         snoutTip.clone().add(V(0.02,-0.015,-0.01)), snoutTip.clone().add(V(-0.02,-0.015,-0.01)), P.nose, 0.03);

    /* snarling open mouth with fangs */
    {
      const mTop = hunch(V(0, L.jawY-0.03, 0.155));
      const mBot = hunch(V(0, L.jawY-0.075, 0.145));
      quad(mTop.clone().add(V(-0.07,0,0)), mTop.clone().add(V(0.07,0,0)),
           mBot.clone().add(V(0.06,0,-0.01)), mBot.clone().add(V(-0.06,0,-0.01)), P.mouth, 0.03);
      quad(mBot.clone().add(V(-0.06,0,-0.01)), mBot.clone().add(V(0.06,0,-0.01)),
           mBot.clone().add(V(0.05,-0.02,-0.03)), mBot.clone().add(V(-0.05,-0.02,-0.03)), P.tongue, 0.04);
      /* fangs — upper pair projecting down */
      for(const s of [-1,1]){
        const fb = mTop.clone().add(V(s*0.05, -0.005, -0.005));
        const ft = fb.clone().add(V(s*0.006, -0.052, -0.008));
        tube(fb, ft, 0.016, 0.004, 4, P.fang, {capA:{hex:P.fangDk}, capB:{hex:P.fang, lift:0.004}});
      }
    }

    /* small rounded ears set back on the skull */
    for(const s of [-1,1]){
      const eb = hunch(V(s*0.135, L.browY+0.01, -0.02));
      const et = hunch(V(s*0.172, L.crownY+0.02, -0.06));
      tube(eb, et, 0.038, 0.014, 5, P.furDk, {raz:0.024, rbz:0.010, capB:{hex:P.furDk, lift:0.004}});
    }
  }

  /* ---------- ARMS — disproportionately long, clawed hands hanging near the knees. ---------- */
  const clawHand = (ctr, faceDir, hex)=>{
    const d = faceDir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.032), ctr.clone().addScaledVector(d,0.032),
         0.058, 0.050, 6, hex, {raz:0.038, rbz:0.038, capA:{hex}, capB:{hex}});
    for(const off of [-1,0,1]){
      const kb = ctr.clone().addScaledVector(d,0.030).addScaledVector(side, off*0.034);
      const kt = kb.clone().addScaledVector(d,0.058).addScaledVector(side, off*0.010);
      tube(kb, kt, 0.015, 0.005, 4, hex, {capB:{hex:P.claw, lift:0.005}});
    }
  };
  {
    const S1=hunch(V(L.shoulderX, L.shldY-0.02, 0.0));
    const E1=V(0.395, 0.80, 0.03);
    const W1=V(0.375, 0.50, 0.08);
    tube(S1,E1,0.088,0.070,6,P.fur);
    tube(E1,W1,0.068,0.052,6,P.furDk);
    clawHand(W1, V(0.10,-0.5,1), P.hide);

    const S2=hunch(V(-L.shoulderX, L.shldY-0.02, 0.0));
    const E2=V(-0.400, 0.79, 0.04);
    const W2=V(-0.385, 0.48, 0.10);
    tube(S2,E2,0.088,0.070,6,P.fur);
    tube(E2,W2,0.068,0.052,6,P.furDk);
    clawHand(W2, V(-0.10,-0.5,1), P.hide);

    /* forearm fur tufts */
    for(const [E,s] of [[E1,1],[E2,-1]]){
      const base=E.clone().add(V(s*0.02,-0.02,-0.03));
      quad(base, base.clone().add(V(s*0.04,0.06,-0.03)), base.clone().add(V(s*0.06,0.03,-0.05)), base, P.furDk, 0.08);
    }
  }

  /* ---------- LEGS — thick, bent, planted wide with clawed toes. Kept within the disc footprint. ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.0), kneeL=V(-0.195,0.34,0.10), ankL=V(-0.175,0.065,0.04);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.0), kneeR=V( 0.205,0.34,0.08), ankR=V( 0.185,0.065,0.02);
    tube(hipL,kneeL,0.110,0.080,6,P.fur);
    tube(kneeL,ankL,0.076,0.056,6,P.furDk);
    tube(hipR,kneeR,0.110,0.080,6,P.fur);
    tube(kneeR,ankR,0.076,0.056,6,P.furDk);
    for(const [ank,toeDir] of [[ankL,V(-0.08,0,1)], [ankR,V(0.08,0,1)]]){
      const d=toeDir.clone().normalize();
      const heel=V(ank.x,0.040,ank.z);
      tube(heel.clone().addScaledVector(d,-0.015), heel.clone().addScaledVector(d,0.115), 0.062,0.046,6,P.hide,
           {raz:0.054, rbz:0.038, capA:{hex:P.hideDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.108).addScaledVector(side, off*0.036);
        const tt=tb.clone().addScaledVector(d,0.036).addScaledVector(side, off*0.006);
        tube(tb, tt, 0.016,0.006,4,P.hide,{capB:{hex:P.claw, lift:0.004}});
      }
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
