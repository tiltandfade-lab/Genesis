/* dev/model-qa/creatures/rlm-toxin-blood-oni-raider.js — TOXIN-BLOOD ONI RAIDER (ash realm,
   Large Giant/Fiend-hybrid, CR 7). Read: a chem-warped oni brute — massive muscled torso with
   visible toxic-green veins pulsing beneath cracked grey-ash hide, a single curved horn (broken
   stub of a second), tusked lower jaw, a rusted cleaver-axe held two-handed, chem-drum canisters
   strapped to its back that weep toxic ooze. VS-desaturated ash palette with sickly acid-green
   vein glow as the one saturated accent. NO eye quads — sunken glowing sockets only. Whole-object
   grammar: one function, one merged frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildToxinBloodOniRaider(){
  const P = {
    hide:0x5c5648, hideDk:0x393528, hideLt:0x726a54,
    crack:0x231f18,
    vein:0x6a9430, veinDk:0x3c5418, veinGlow:0x8ab838,
    horn:0x847a5e, hornDk:0x544c38,
    tusk:0xb0a888, tuskDk:0x74684c,
    mouth:0x201b16,
    drum:0x4a5442, drumDk:0x2c3324, ooze:0x6a8a2c,
    strap:0x2c281f,
    axe:0x585248, axeDk:0x342f28, haft:0x453c2c,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:0.72, waistY:0.90, ribY:1.10, chestY:1.30, shldY:1.48, neckY:1.56,
    jawY:1.63, browY:1.78, crownY:1.90,
    shoulderX:0.290,
  };

  /* ---------- LEGS — massive braced brute stance, cracked hide plating. ---------- */
  {
    const hipL=V(-0.18,L.hipY-0.03,0.02), kneeL=V(-0.21,0.40,0.09), ankL=V(-0.19,0.11,0.03);
    const hipR=V(0.18,L.hipY-0.03,-0.02), kneeR=V(0.21,0.40,-0.09), ankR=V(0.19,0.11,-0.03);
    tube(hipL,kneeL,0.170,0.125,7,P.hide);
    tube(kneeL,ankL,0.120,0.088,7,P.hideDk);
    tube(hipR,kneeR,0.170,0.125,7,P.hide);
    tube(kneeR,ankR,0.120,0.088,7,P.hideDk);
    // vein pulses down the thighs
    for(const [x,y] of [[-0.20,0.55],[0.20,0.50]]) quad(V(x-0.02,y,0.10),V(x+0.02,y,0.10),V(x+0.016,y-0.16,0.09),V(x-0.016,y-0.16,0.09),P.vein,0.10);
    // clawed splayed feet
    for(const ank of [ankL,ankR]){
      const heel=V(ank.x,0.045,ank.z);
      tube(heel.clone().add(V(0,0,-0.05)), heel.clone().add(V(0,0,0.20)), 0.105,0.085,6,P.hideDk,{capA:{hex:P.hide}});
      for(const dx of [-0.05,0,0.05]) tube(V(heel.x+dx,0.03,heel.z+0.18), V(heel.x+dx,0.005,heel.z+0.27), 0.020,0.006,4,P.tuskDk,{capB:{hex:P.tuskDk,lift:0.004}});
    }
  }

  /* ---------- TORSO — a cracked-hide barrel with pulsing toxic veins. ---------- */
  stack([
    {y:L.hipY,   rx:0.195, rz:0.170, hex:P.hideDk},
    {y:L.waistY, rx:0.215, rz:0.185, hex:P.hide},
    {y:L.ribY,   rx:0.240, rz:0.195, hex:P.hideLt},
    {y:L.chestY, rx:0.260, rz:0.190, hex:P.hide},
    {y:L.shldY,  rx:0.290, rz:0.200, hex:P.hideLt},
    {y:L.neckY,  rx:0.110, rz:0.100, hex:P.hideDk},
  ], 9, {capTop:{hex:P.hideDk, lift:0.007}});
  // hide cracking (dark fissure lines)
  for(const [x0,y0,x1,y1] of [[-0.10,L.chestY+0.04,-0.02,L.ribY-0.02],[0.12,L.shldY,0.04,L.chestY-0.02],[0.0,L.waistY+0.02,-0.06,L.hipY]]){
    quad(V(x0,y0,0.19),V(x0+0.012,y0,0.19),V(x1+0.010,y1,0.185),V(x1,y1,0.185), P.crack, 0.05);
  }
  // TOXIC VEINS — glowing acid-green branching lines across the chest (the one saturated accent)
  for(const [x0,y0,x1,y1] of [[-0.06,L.shldY-0.03,0.10,L.chestY],[0.14,L.chestY-0.02,-0.02,L.ribY+0.02],[-0.16,L.ribY,0.02,L.waistY+0.03]]){
    quad(V(x0,y0,0.205),V(x0+0.016,y0,0.205),V(x1+0.012,y1,0.20),V(x1,y1,0.20), P.veinGlow, 0.10);
  }
  for(const s of [-1,1]) blob(s*L.shoulderX,L.shldY+0.02,0.0, 0.11,0.08,0.10,P.hideLt,6,3);

  /* ---------- CHEM-DRUM CANISTERS — strapped to the back, weeping toxic ooze. ---------- */
  {
    const bY=L.ribY-0.02, bZ=-0.20;
    for(const s of [-1,1]){
      tube(V(s*0.14,bY-0.16,bZ),V(s*0.14,bY+0.18,bZ-0.02),0.075,0.075,7,P.drum,{capA:{hex:P.drumDk},capB:{hex:P.drumDk,lift:0.01}});
      quad(V(s*0.14-0.05,bY-0.02,bZ+0.06),V(s*0.14+0.05,bY-0.02,bZ+0.06),V(s*0.14+0.035,bY-0.16,bZ+0.10),V(s*0.14-0.035,bY-0.16,bZ+0.10), P.ooze, 0.10); // weeping ooze streak
    }
    // strap harness across the back/shoulders
    quad(V(-0.20,L.shldY-0.02,-0.10),V(0.20,L.shldY-0.02,-0.10),V(0.16,L.hipY+0.05,-0.15),V(-0.16,L.hipY+0.05,-0.15), P.strap, 0.05);
  }

  /* ---------- HEAD — broad brutish skull, tusked jaw, one curved horn + a broken stub. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.115, rz:0.108, hex:P.hide},
      {y:L.jawY+0.09, rx:0.125, rz:0.118, hex:P.hideLt},
      {y:L.browY,  rx:0.112, rz:0.098, hex:P.hideDk},
      {y:L.crownY, rx:0.088, rz:0.080, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.crownY+0.02,0.0), P.hideDk);
    // sunken glowing sockets (no eye quads)
    for(const s of [-1,1]) blob(s*0.04,L.browY-0.01,0.095,0.020,0.014,0.010,P.veinGlow,4,3);
    // tusked jaw
    quad(V(-0.06,L.jawY+0.01,0.10),V(0.06,L.jawY+0.01,0.10),V(0.055,L.jawY-0.06,0.095),V(-0.055,L.jawY-0.06,0.095),P.mouth,0.04);
    for(const s of [-1,1]) tube(V(s*0.045,L.jawY-0.03,0.10), V(s*0.06,L.jawY-0.09,0.115), 0.018,0.006,4,P.tusk,{capB:{hex:P.tusk,lift:0.004}});
    // ONE curved horn + broken stub of the second
    tube(V(0.04,L.crownY+0.02,0.02), V(0.13,L.crownY+0.20,-0.04), 0.030,0.010,5,P.horn,{capB:{hex:P.hornDk,lift:0.004}});
    tube(V(-0.05,L.crownY+0.01,0.02), V(-0.07,L.crownY+0.05,-0.01), 0.026,0.018,4,P.hornDk,{capB:{hex:P.hornDk,lift:0.003}}); // stub
  }

  /* ---------- ARMS — a rusted cleaver-axe gripped two-handed, held low and ready. ---------- */
  {
    const S=V(L.shoulderX,L.shldY-0.04,0.0), E=V(0.30,0.98,0.16), W=V(0.20,0.52,0.28);
    tube(S,E,0.100,0.078,7,P.hide);
    tube(E,W,0.078,0.062,6,P.hideDk,{capB:{hex:P.hideDk,lift:0.006}});
    const S2=V(-L.shoulderX,L.shldY-0.04,0.0), E2=V(-0.26,0.90,0.22), W2=V(-0.10,0.48,0.34);
    tube(S2,E2,0.100,0.078,7,P.hide);
    tube(E2,W2,0.078,0.062,6,P.hideDk,{capB:{hex:P.hideDk,lift:0.006}});

    // cleaver-axe haft between the hands, broad rusted blade
    const hB=V(0.02,0.50,0.31), hT=V(0.10,0.16,0.42);
    tube(hB,hT,0.030,0.022,5,P.haft);
    quad(V(0.06,0.20,0.42),V(0.30,0.10,0.46),V(0.28,-0.06,0.50),V(0.08,0.02,0.46), P.axe, 0.06); // broad cleaver blade
    quad(V(0.08,0.16,0.44),V(0.22,0.10,0.46),V(0.20,0.02,0.47),V(0.10,0.06,0.45), P.axeDk, 0.06); // rust/pitting
  }

  /* ---------- base disc (Large r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
