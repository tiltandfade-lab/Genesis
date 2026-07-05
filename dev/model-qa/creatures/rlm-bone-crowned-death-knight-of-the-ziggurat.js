/* dev/model-qa/creatures/rlm-bone-crowned-death-knight-of-the-ziggurat.js — BONE-CROWNED DEATH
   KNIGHT OF THE ZIGGURAT (lost-world, Medium Undead, CR 11). Read: an armored death knight,
   a jagged bone crown fused to a corroded burial-helm, plates pitted and dark, a greatsword
   held low and ready, standing as if still commanding a legion long gone. Medium size, bipedal,
   heavy stance, cape of rotted funeral-cloth. VS-desaturated: black-iron armor, bone-white
   crown accents, no eye quads (socket-glow only, dim ember not bright). Whole-object grammar:
   one function, one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildBoneCrownedDeathKnightOfTheZiggurat(){
  const P = {
    armor:0x3a3630, armorDk:0x211e1a, armorLt:0x524c42,
    rust:0x5c4030, rustDk:0x3c281c,
    bone:0xc4b896, boneDk:0x8a8064,
    cape:0x2c2420, capeDk:0x181410, capeLt:0x3e332c,
    blade:0x5c5850, bladeDk:0x38352e, hilt:0x4a3c28,
    glow:0x6a3020, glowDk:0x3c1a12,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.60, waistY:0.72, ribY:0.90, chestY:1.04, shldY:1.16, neckY:1.22,
    jawY:1.28, cheekY:1.36, browY:1.44, crownY:1.50,
    shoulderX:0.230,
  };

  /* rigid, wide-braced commanding stance */
  const stand=(p)=>p;

  /* ---------- LEGS — armored greaves, planted wide. ---------- */
  {
    const hipL=V(-0.14,L.hipY-0.02,0), kneeL=V(-0.16,0.34,0.06), ankL=V(-0.16,0.09,0.02);
    const hipR=V(0.14,L.hipY-0.02,0), kneeR=V(0.16,0.34,-0.04), ankR=V(0.16,0.09,-0.02);
    tube(hipL,kneeL,0.130,0.095,6,P.armor);
    tube(kneeL,ankL,0.090,0.070,6,P.armorDk);
    tube(hipR,kneeR,0.130,0.095,6,P.armor);
    tube(kneeR,ankR,0.090,0.070,6,P.armorDk);
    // rust streaks on the greaves
    for(const [x,y] of [[-0.16,0.24],[0.16,0.20]]) quad(V(x-0.02,y,0.06),V(x+0.02,y,0.06),V(x+0.015,y-0.10,0.05),V(x-0.015,y-0.10,0.05),P.rust,0.06);
    // armored boots
    for(const ank of [ankL,ankR]){
      const heel=V(ank.x,0.05,ank.z);
      tube(heel.clone().add(V(0,0,-0.03)), heel.clone().add(V(0,0,0.18)), 0.095,0.075,6,P.armorDk,{capA:{hex:P.armor}});
    }
  }

  /* ---------- TORSO — a pitted breastplate, dark iron. ---------- */
  stack([
    {y:L.hipY,   rx:0.165, rz:0.140, hex:P.armorDk},
    {y:L.waistY, rx:0.175, rz:0.150, hex:P.armor},
    {y:L.ribY,   rx:0.185, rz:0.150, hex:P.armorLt},
    {y:L.chestY, rx:0.195, rz:0.140, hex:P.armor},
    {y:L.shldY,  rx:0.230, rz:0.150, hex:P.armorLt},
    {y:L.neckY,  rx:0.085, rz:0.080, hex:P.armorDk},
  ], 8, {xform:stand, capTop:{hex:P.armorDk, lift:0.006}});
  /* rust/pitting streaks across the breastplate */
  for(const [x0,y0,x1,y1] of [[-0.08,L.chestY-0.02,-0.03,L.ribY+0.02],[0.10,L.shldY-0.02,0.05,L.chestY]]){
    quad(V(x0,y0,0.14),V(x0+0.015,y0,0.14),V(x1+0.012,y1,0.13),V(x1,y1,0.13), P.rust, 0.06);
  }
  // pauldrons
  for(const s of [-1,1]) blob(s*L.shoulderX,L.shldY+0.02,0.0, 0.10,0.07,0.09,P.armorLt,6,3);

  /* ---------- ROTTED FUNERAL-CAPE — hangs from the shoulders down the back, tattered. ---------- */
  {
    const rings=stack([
      {y:L.shldY+0.02, rx:0.24, rz:0.06, hex:P.cape, cz:-0.14},
      {y:L.chestY-0.05,rx:0.26, rz:0.06, hex:P.capeDk, cz:-0.16},
      {y:L.ribY-0.15,  rx:0.28, rz:0.06, hex:P.cape, cz:-0.18},
      {y:L.hipY-0.15,  rx:0.30, rz:0.06, hex:P.capeLt, cz:-0.20},
      {y:0.05,         rx:0.32, rz:0.06, hex:P.capeDk, cz:-0.22},
    ], 6, {xform:stand});
    // ragged tears
    for(const sx of [-0.20,0.0,0.18]){
      const top=V(sx,0.10,-0.24), bot=V(sx,-0.08,-0.26);
      tube(top,bot,0.03,0.01,4,P.capeDk,{capB:{hex:P.capeDk,lift:0.005}});
    }
  }

  /* ---------- HEAD — corroded burial-helm fused with the bone crown, socket-glow only. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.088, rz:0.084, hex:P.armor},
      {y:L.cheekY, rx:0.094, rz:0.090, hex:P.armorLt},
      {y:L.browY,  rx:0.086, rz:0.076, hex:P.armorDk},
      {y:L.crownY, rx:0.072, rz:0.066, hex:P.armorDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.crownY+0.02,0.0), P.armorDk);
    // dim ember-glow eye sockets (no eye quad — a sunken glow shape)
    for(const s of [-1,1]){
      const c=V(s*0.03,L.browY-0.01,0.075);
      blob(c.x,c.y,c.z,0.018,0.012,0.008,P.glow,4,3);
    }
    // visor slit / jaw plate
    quad(V(-0.05,L.jawY+0.01,0.075),V(0.05,L.jawY+0.01,0.075),V(0.045,L.jawY-0.05,0.07),V(-0.045,L.jawY-0.05,0.07),P.armorDk,0.04);
    /* BONE CROWN — jagged bone shards fused around the crown of the helm */
    for(let i=0;i<6;i++){
      const ang=ph + i/6*Math.PI*2;
      const b=V(Math.cos(ang)*0.065,L.crownY+0.01,Math.sin(ang)*0.06);
      const t=V(Math.cos(ang)*0.10,L.crownY+0.05+((i%2)*0.03),Math.sin(ang)*0.09);
      tube(b,t,0.020,0.006,4,P.bone,{capB:{hex:P.boneDk,lift:0.004}});
    }
  }

  /* ---------- ARMS — greatsword held low + ready in both hands. ---------- */
  {
    const S=V(L.shoulderX,L.shldY-0.03,0.0), E=V(0.24,0.78,0.20), W=V(0.14,0.42,0.30);
    tube(S,E,0.075,0.058,6,P.armor);
    tube(E,W,0.058,0.045,6,P.armorDk,{capB:{hex:P.armorDk,lift:0.005}});
    const S2=V(-L.shoulderX,L.shldY-0.03,0.0), E2=V(-0.20,0.68,0.24), W2=V(-0.08,0.40,0.32);
    tube(S2,E2,0.075,0.058,6,P.armor);
    tube(E2,W2,0.058,0.045,6,P.armorDk,{capB:{hex:P.armorDk,lift:0.005}});

    // greatsword — hilt between the hands, blade running down-forward
    const hiltB=V(0.03,0.40,0.31), hiltT=V(0.03,0.30,0.36);
    tube(hiltB,hiltT,0.025,0.022,5,P.hilt);
    quad(V(-0.06,0.42,0.31),V(0.12,0.42,0.31),V(0.10,0.38,0.33),V(-0.04,0.38,0.33),P.bladeDk,0.04); // crossguard
    tube(hiltT, V(0.03,0.03,0.44), 0.020,0.012,5,P.blade,{capB:{hex:P.blade,lift:0.005}});
    tube(V(0.03,0.03,0.44), V(0.02,-0.18,0.52), 0.012,0.004,5,P.blade,{capB:{hex:P.blade,lift:0.004}});
  }

  /* ---------- base disc (Medium r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
