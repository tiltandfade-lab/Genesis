/* dev/model-qa/creatures/mon-ultroloth.js — the ULTROLOTH (fiend-lord yugoloth, robed humanoid).
   Whole-object grammar: one function, one merged geometry frame, no anchors. The read: a TALL,
   unnaturally SMOOTH-skinned humanoid draped in a heavy dark robe, dominated by a featureless grey
   mauve face with two large almond-shaped dark eye RECESSES (no eye quads — sockets are shape, not
   paint) and long willowy limbs. VS-desaturated, mottled, never candy. Medium size, base disc r=0.42.
   Imported by the p2mon proof sheet set. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildUltroloth(){
  /* ---------- PALETTE (VS desaturated; grey-mauve skin, dark dirty robe) ---------- */
  const P = {
    skin:0x8a7f8c, skinDk:0x5c5460, skinLt:0xa79bab,      // grey-mauve fiend skin
    skinSock:0x2c2630,                                      // deep socket recess (no eye quads)
    robeA:0x332c38, robeB:0x241f29, robeLt:0x453b4d,        // dark mottled robe body
    robeTrim:0x1a1620, robeHem:0x14111a,                    // darker trim/hem
    hand:0x746a7a, handDk:0x4a4350,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — a tall willowy frame, upright (not hunched), rear kept close to +y
     so the whole figure stays inside the r0.42 disc footprint. ---------- */
  const L = {
    hipY:0.62, waistY:0.80, chestY:1.02, shldY:1.16, neckY:1.24,
    jawY:1.28, cheekY:1.36, browY:1.44, crownY:1.54,
    shoulderX:0.185, hipHalf:0.115,
  };

  /* ---------- ROBE BODY — a single tapering loft, wider at the hem and narrowing to the shoulders,
     mottled dark mauve-black, reads as heavy hanging cloth. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:0.02,     rx:0.300, rz:0.260, hex:P.robeHem},
      {y:L.hipY-0.08, rx:0.270, rz:0.235, hex:P.robeA},
      {y:L.hipY,   rx:0.240, rz:0.205, hex:P.robeB},
      {y:L.waistY, rx:0.205, rz:0.175, hex:P.robeA},
      {y:L.chestY, rx:0.185, rz:0.155, hex:P.robeLt},
      {y:L.shldY,  rx:0.170, rz:0.135, hex:P.robeA},
      {y:L.neckY,  rx:0.095, rz:0.085, hex:P.skinDk},        // bare throat emerging from the collar
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* dark trim line at the collar */
    for(const i of [0,1,2,3,4,5,6,7,8]){
      const a = rings[5][i], b = rings[5][(i+1)%n];
      quad(a, b, b.clone().add(V(0,0.015,0)), a.clone().add(V(0,0.015,0)), P.robeTrim, 0.05);
    }
  }

  /* ragged hem tatters near the ground — a handful of drooping cloth points for the robe's tattered
     bottom edge (still inside the r0.42 footprint) */
  for(let i=0;i<7;i++){
    const ang = (i/7)*Math.PI*2;
    const rx=0.30, rz=0.26;
    const bx=Math.cos(ang)*rx, bz=Math.sin(ang)*rz;
    const base = V(bx, 0.03, bz);
    const tip  = V(bx*1.02, -0.04, bz*1.02);
    quad(base.clone().add(V(-0.03,0,0)), base.clone().add(V(0.03,0,0)), tip.clone().add(V(0.015,0,0)), tip.clone().add(V(-0.015,0,0)), P.robeHem, 0.06);
  }

  /* ---------- HEAD — smooth featureless grey-mauve, dominated by two large almond dark eye
     RECESSES pushed into the brow band (shape, not painted quads). No mouth/nose detail — smooth. */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.098, rz:0.100, hex:P.skin},
      {y:L.cheekY, rx:0.112, rz:0.108, hex:P.skinLt},
      {y:L.browY,  rx:0.108, rz:0.098, hex:P.skin},
      {y:L.crownY, rx:0.078, rz:0.070, hex:P.skinDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    /* push two eye-recess indentations into the brow band front verts (indices 1,2 face +z at
       phase pi/n per probe-lib's ring convention) — pull them inward+down to carve dark sockets */
    rings[2][1].add(V(-0.028,-0.012,-0.030));
    rings[2][2].add(V( 0.028,-0.012,-0.030));
    /* darken the cheek band verts flanking the sockets so the recess reads as a shadowed hollow */
    rings[1][1].add(V(-0.010,0,-0.006));
    rings[1][2].add(V( 0.010,0,-0.006));
    stitch(rings, b=>bands[b].hex);
    /* deep socket-floor quads set back inside the recess (dark, no separate "eye" shape — just the
       shadowed hollow itself) */
    {
      const c1 = V(-0.030, L.browY-0.020, 0.048), c2 = V(0.030, L.browY-0.020, 0.048);
      for(const c of [c1,c2]){
        quad(c.clone().add(V(-0.024,0.016,0)), c.clone().add(V(0.024,0.016,0)),
             c.clone().add(V(0.020,-0.020,-0.006)), c.clone().add(V(-0.020,-0.020,-0.006)), P.skinSock, 0.02);
      }
    }
    capFan(rings.at(-1), V(0, L.crownY+0.055, -0.01), P.skinDk);
    /* smooth jaw underside cap */
    capFan(rings[0], V(0, L.jawY-0.055, 0.01), P.skinDk, true);
  }

  /* ---------- ARMS — long willowy limbs, robe sleeves down to slender bare grey-mauve hands
     folded low in front (calm, lord-like posture). ---------- */
  {
    const sleeve = (shoulder, elbow, cuff, hex)=>{
      tube(shoulder, elbow, 0.088, 0.062, 6, hex);
      tube(elbow, cuff, 0.060, 0.044, 6, P.robeB, {capB:{hex:P.robeTrim, lift:0.006}});
    };
    const handAt = (cuff, dir)=>{
      const d = dir.clone().normalize();
      const palmC = cuff.clone().addScaledVector(d, 0.05);
      tube(cuff, palmC, 0.040, 0.034, 5, P.hand, {capA:{hex:P.handDk}});
      const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
      for(const off of [-1,-0.33,0.33,1]){
        const fb = palmC.clone().addScaledVector(side, off*0.026);
        const ft = fb.clone().addScaledVector(d, 0.075).addScaledVector(side, off*0.010);
        tube(fb, ft, 0.011, 0.005, 4, P.hand, {capB:{hex:P.handDk, lift:0.004}});
      }
    };
    /* left arm — hangs then curls inward to fold across the waist */
    const Sl = V(-L.shoulderX, L.shldY-0.02, 0.0);
    const El = V(-0.235, 0.86, 0.06);
    const Cl = V(-0.075, 0.735, 0.185);
    sleeve(Sl, El, Cl, P.robeA);
    handAt(Cl, V(1,-0.2,0.7));
    /* right arm — mirrored fold, slightly lower, hands meet in front */
    const Sr = V(L.shoulderX, L.shldY-0.02, 0.0);
    const Er = V(0.240, 0.82, 0.07);
    const Cr = V(0.070, 0.700, 0.195);
    sleeve(Sr, Er, Cr, P.robeA);
    handAt(Cr, V(-1,-0.2,0.7));
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
