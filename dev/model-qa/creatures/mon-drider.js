/* dev/model-qa/creatures/mon-drider.js — the DRIDER (bespoke HUMANOID-SPIDER HYBRID, Large Monstrosity).
   CREATURE-MODELS-P2 Wave 2: a dark elf fused to a giant spider. The read: a humanoid torso/arms/
   head rising from where a spider's head would be, atop a bulbous 8-LEGGED spider abdomen slung
   low and wide. Charcoal-purple chitin (VS desaturated), dark elf skin a cold ashen-purple, dark
   chitin legs radiating from the abdomen. NO eye quads — dark socket recesses only. Whole-object
   grammar: one function, one merged geometry frame, no anchors, no part transforms. Large size:
   base disc r=0.55; the abdomen + legs stay within the disc footprint, humanoid torso rises in +y.
   Imported by ps1-sheet.html (set=p2mon) + WHOLE_OBJECT_REGISTRY["drider"]. */
import { V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildDrider(){
  /* ---------- PALETTE (VS desaturated; charcoal-purple chitin, ashen dark-elf skin) ---------- */
  const P = {
    chitin:0x3a2f42, chitinDk:0x241d2c, chitinLt:0x4f4058,     // charcoal-purple abdomen chitin
    leg:0x2b2432, legDk:0x181420, legLt:0x3e3548,               // dark chitin legs
    skin:0x6b5d6e, skinDk:0x4e4451, skinLt:0x83748a,            // ashen dark-elf skin
    hair:0x201a26, socket:0x120e18,                             // black hair, dark socket recess
    cloth:0x352a3a, clothDk:0x231c28,                           // dark leather/cloth wrap
    claw:0x151018, fang:0x14101a,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.chitin]:'scale', [P.chitinDk]:'scale', [P.chitinLt]:'scale',
    [P.leg]:'scale', [P.legDk]:'scale', [P.legLt]:'scale',
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin',
    [P.cloth]:'leather', [P.clothDk]:'leather',
  });

  /* ---------- LANDMARKS ---------- */
  const abdY = 0.34;                  // abdomen center height (bulbous mass low + wide)
  const ABD = V(0, abdY, -0.06);
  const waistY = 0.62, chestY = 0.92, shldY = 1.10, neckY = 1.16;
  const jawY = 1.20, browY = 1.34, crownY = 1.44;

  /* ---------- ABDOMEN — bulbous spider mass, low + wide, sitting within the disc footprint. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:abdY-0.20, rx:0.14, rz:0.16, hex:P.chitinDk},
      {y:abdY-0.05, rx:0.30, rz:0.34, hex:P.chitin},
      {y:abdY+0.10, rx:0.34, rz:0.38, hex:P.chitin},
      {y:abdY+0.22, rx:0.26, rz:0.30, hex:P.chitinLt},
      {y:abdY+0.32, rx:0.14, rz:0.17, hex:P.chitinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,ABD.z), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, abdY+0.36, ABD.z), P.chitinDk);
    capFan(rings[0], V(0, abdY-0.24, ABD.z), P.chitinDk, true);
    /* dorsal mottle patch */
    quad(V(-0.10,abdY+0.20,ABD.z-0.20), V(0.10,abdY+0.20,ABD.z-0.20),
         V(0.14,abdY+0.10,ABD.z-0.32), V(-0.14,abdY+0.10,ABD.z-0.32), P.chitinLt, 0.05);
  }

  /* ---------- WAIST — the chitin fuse-line rising from the abdomen up into the humanoid torso. -- */
  const waistBase = V(0, abdY+0.30, 0.10);
  const torso0 = V(0, waistY, 0.14);
  tube(waistBase, torso0, 0.150, 0.175, 8, P.chitinDk, {phase:Math.PI/8});

  /* ---------- TORSO — humanoid: waist -> chest -> shoulders, dark-elf skin over a cloth wrap. --- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:waistY, cz:0.14, rx:0.175, rz:0.155, hex:P.cloth},
      {y:0.78,   cz:0.15, rx:0.205, rz:0.170, hex:P.skin},
      {y:chestY, cz:0.15, rx:0.230, rz:0.175, hex:P.skin},
      {y:shldY,  cz:0.13, rx:0.250, rz:0.165, hex:P.skinLt},
      {y:neckY,  cz:0.10, rx:0.100, rz:0.090, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, neckY+0.02, 0.10), P.skinDk);
    /* dark cloth wrap band at the waist seam */
    quad(V(-0.16,waistY+0.03,0.28), V(0.16,waistY+0.03,0.28),
         V(0.18,waistY-0.05,0.05), V(-0.18,waistY-0.05,0.05), P.clothDk, 0.04);
  }

  /* ---------- HEAD — gaunt dark-elf skull: jaw -> brow -> crown, dark socket recesses, no eyes. -- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:jawY,   cz:0.10, rx:0.095, rz:0.105, hex:P.skin},
      {y:browY,  cz:0.11, rx:0.110, rz:0.110, hex:P.skinLt},
      {y:crownY, cz:0.08, rx:0.090, rz:0.095, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, crownY+0.10, 0.06), P.hair);
    /* dark eye-socket recesses (shape, not painted eyes) */
    for(const s of [-1,1]){
      const cx=s*0.045, cy=browY+0.01, cz=0.205;
      quad(V(cx-0.028,cy-0.018,cz), V(cx+0.028,cy-0.018,cz),
           V(cx+0.022,cy+0.020,cz-0.01), V(cx-0.022,cy+0.020,cz-0.01), P.socket, 0.0);
    }
    /* jaw/chin shadow */
    quad(V(-0.05,jawY-0.09,0.16), V(0.05,jawY-0.09,0.16), V(0.03,jawY-0.10,0.20), V(-0.03,jawY-0.10,0.20), P.skinDk, 0.05);
    /* swept-back hair mass */
    quad(V(-0.09,crownY+0.02,-0.02), V(0.09,crownY+0.02,-0.02),
         V(0.06,waistY+0.55,-0.18), V(-0.06,waistY+0.55,-0.18), P.hair, 0.05);
  }

  /* ---------- ARMS — two humanoid arms, elbows bent forward, clawed dark-elf hands. ---------- */
  {
    const buildArm = (side)=>{
      const S = V(side*0.255, shldY-0.03, 0.12);
      const E = V(side*0.335, 0.80, 0.30);
      const W = V(side*0.300, 0.60, 0.42);
      tube(S, E, 0.075, 0.058, 6, P.skin, {capA:{hex:P.skinDk}});
      tube(E, W, 0.056, 0.040, 6, P.skinLt);
      const hand = V(side*0.275, 0.50, 0.47);
      tube(W, hand, 0.040, 0.030, 5, P.skinDk, {capB:{hex:P.skinDk, lift:0.01}});
      /* three clawed fingers */
      for(const [dx,dz] of [[side*0.03,0.05],[0,0.06],[-side*0.03,0.05]]){
        const ct = V(hand.x+dx, hand.y-0.05, hand.z+dz);
        tube(hand, ct, 0.016, 0.006, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    buildArm(-1);
    buildArm(1);
  }

  /* ---------- LEGS — 8 spider legs radiating from the abdomen, hip ON the abdomen surface. ---------- */
  {
    const bodyRx=0.32, bodyRz=0.36, hipY=abdY+0.06;
    const AZ = [35, 70, 110, 150];
    for(const s of [-1,1]){
      for(let k=0;k<4;k++){
        const a=AZ[k]*Math.PI/180, d=V(s*Math.sin(a),0,Math.cos(a));
        const H=V(d.x*bodyRx, hipY, ABD.z + d.z*bodyRz);
        const K=V(H.x + d.x*0.34, hipY+0.36, H.z + d.z*0.34);
        const F=V(H.x + d.x*0.62, 0.03, H.z + d.z*0.62);
        tube(H,K,0.052,0.040,6,P.leg, {capA:{hex:P.legDk}});
        tube(K,F,0.040,0.014,6,P.legLt, {capB:{hex:P.legDk, lift:0.008}});
        /* knee joint knob */
        quad(V(K.x-0.04,K.y-0.02,K.z), V(K.x+0.04,K.y-0.02,K.z), V(K.x+0.04,K.y+0.04,K.z), V(K.x-0.04,K.y+0.04,K.z), P.legDk, 0.05);
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
