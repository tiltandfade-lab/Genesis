/* dev/model-qa/creatures/rlm-chem-slick-viper.js — CHEM-SLICK VIPER (ash realm, Medium, CR 1).
   Read: a runoff-swollen venomous viper — a long serpentine body bloated from chemical runoff,
   slick wet-sheen scales, a wide venom-swollen head with hinged fangs, raised coiled forebody
   striking-pose, tapering tail. Whole-object grammar, no legs (true serpent), one merged frame.
   NO eye quads — dark heat-pit sockets only. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildChemSlickViper(){
  /* ---------- PALETTE (VS-desaturated sick olive-grey scale, wet chem-sheen highlight, venom sacs) ---------- */
  const P = {
    scale:0x565c3e, scaleDk:0x393e28, scaleLt:0x6c7250,
    sheen:0x7d8560, belly:0x8a8560, bellyDk:0x6a6548,
    venom:0x7a9450, venomDk:0x546b34,
    fang:0xc8c4a8, mouth:0x201c16, tongue:0x8a3a3a,
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — long serpentine spine, raised coiled forebody (striking pose) ---------- */
  const S = {
    tailTip: V(0.10, 0.10, -0.98),
    tail1:   V(0.06, 0.09, -0.72),
    coilLo:  V(0.02, 0.14, -0.42),   // body rests on the ground in a loose coil
    coilMid: V(-0.10, 0.20, -0.18),
    coilHi:  V(0.06, 0.34, 0.02),    // body begins rising
    rise1:   V(-0.04, 0.56, 0.18),
    rise2:   V(0.02, 0.78, 0.28),    // raised striking S-curve
    neckB:   V(-0.02, 0.92, 0.34),
    headB:   V(0.02, 1.00, 0.40),
  };

  /* ---------- BODY — long tapering serpent tube, thick venom-swollen midsection ---------- */
  tube(S.tailTip, S.tail1, 0.020, 0.055, 7, P.scaleDk, {phase:Math.PI/7, capA:{hex:P.scaleDk, lift:0.005}});
  tube(S.tail1,   S.coilLo,0.055, 0.105, 8, P.scale,   {phase:Math.PI/8});
  tube(S.coilLo,  S.coilMid,0.105,0.145, 8, P.scaleLt, {phase:Math.PI/8});
  tube(S.coilMid, S.coilHi,0.145, 0.150, 8, P.scale,   {phase:Math.PI/8});
  tube(S.coilHi,  S.rise1, 0.150, 0.130, 8, P.venom,   {phase:Math.PI/8});
  tube(S.rise1,   S.rise2, 0.130, 0.105, 8, P.scale,   {phase:Math.PI/8});
  tube(S.rise2,   S.neckB, 0.105, 0.078, 8, P.scaleDk, {phase:Math.PI/8});
  tube(S.neckB,   S.headB, 0.078, 0.085, 8, P.scale,   {phase:Math.PI/8});

  /* pale wet belly-scale strip along the underside of the whole serpent */
  {
    const pts = [S.tail1, S.coilLo, S.coilMid, S.coilHi, S.rise1, S.rise2, S.neckB];
    for(let i=0;i<pts.length-1;i++){
      const a=pts[i], b=pts[i+1];
      quad(V(a.x-0.03,a.y-0.06,a.z), V(a.x+0.03,a.y-0.06,a.z), V(b.x+0.025,b.y-0.06,b.z), V(b.x-0.025,b.y-0.06,b.z), P.belly, 0.05);
    }
  }
  /* wet chem-sheen highlight streaks (slick runoff look) along the raised forebody */
  quad(V(-0.03,0.60,0.14), V(0.02,0.66,0.20), V(0.015,0.80,0.26), V(-0.035,0.74,0.20), P.sheen, 0.1);
  quad(V(0.04,0.36,0.00), V(0.09,0.40,0.06), V(0.085,0.50,0.10), V(0.035,0.46,0.04), P.sheen, 0.1);
  /* darker dorsal blotch pattern (viper diamond markings, subdued/mutated) */
  for(const [x,y,z] of [[0.0,0.44,0.10],[0.02,0.66,0.24],[-0.06,0.24,-0.14],[0.05,0.12,-0.60]]){
    quad(V(x-0.035,y+0.02,z-0.03), V(x+0.035,y+0.02,z+0.03), V(x+0.028,y-0.03,z+0.03), V(x-0.028,y-0.03,z-0.03), P.venomDk, 0.08);
  }

  /* ---------- HEAD — wide venom-swollen triangular viper head, hinged fangs, heat-pit sockets ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:0.98, cz:0.42, rx:0.075, rz:0.09, hex:P.scale},
      {y:1.03, cz:0.46, rx:0.100, rz:0.11, hex:P.venom},  // wide venom-gland swell
      {y:1.06, cz:0.42, rx:0.072, rz:0.08, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, 1.09, 0.42), P.scaleDk);

    /* blunt snout tip */
    const snB = V(0, 1.00, 0.50);
    const snT = V(0, 0.985, 0.58);
    tube(snB, snT, 0.070, 0.030, n, P.scale, {raz:0.085, rbz:0.030, phase:ph, capB:{hex:P.mouth, lift:0.006}});

    /* wide dark mouth gash + hinged jaw open */
    quad(V(-0.075,0.965,0.44), V(0.075,0.965,0.44), V(0.055,0.94,0.55), V(-0.055,0.94,0.55), P.mouth, 0.03);

    /* HINGED FANGS — two long curved fangs swinging down from the upper jaw */
    for(const s of [-1,1]){
      const fb = V(s*0.032, 0.955, 0.48);
      const fm = V(s*0.038, 0.905, 0.50);
      const ft = V(s*0.030, 0.865, 0.505);
      tube(fb, fm, 0.010, 0.006, 4, P.fang);
      tube(fm, ft, 0.006, 0.002, 4, P.fang, {capB:{hex:P.fang, lift:0.003}});
    }
    /* flicking forked tongue */
    const tR = V(0, 0.945, 0.55);
    const tM = V(0, 0.935, 0.66);
    tube(tR, tM, 0.012, 0.008, 4, P.tongue, {capA:{hex:P.mouth}});
    for(const s of [-1,1]) tube(tM, V(s*0.022,0.930,0.74), 0.007, 0.003, 4, P.tongue, {capB:{hex:P.tongue, lift:0.003}});

    /* heat-pit dark sockets (no eye quads) */
    for(const s of [-1,1]) quad(V(s*0.05,1.045,0.415), V(s*0.07,1.045,0.405), V(s*0.065,1.01,0.41), V(s*0.048,1.01,0.418), P.mouth, 0.04);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
