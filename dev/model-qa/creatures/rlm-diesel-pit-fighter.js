/* dev/model-qa/creatures/rlm-diesel-pit-fighter.js — DIESEL PIT FIGHTER (ash realm, Medium
   Humanoid, CR 6). Read: an undefeated fighting-pit champion — thick-muscled, scarred bare torso
   under a scavenged breastplate half-strapped on, oil-stained wraps on the forearms/knuckles,
   a heavy chain-wrapped knuckle-club held low and ready, wide brawler's stance. VS-desaturated
   ash palette: grease-black leather, rust-scarred iron, sun-scorched skin, oil-stained bandage
   wraps. NO eye quads — deep-set brow shadow only. Whole-object grammar: one function, one
   merged frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDieselPitFighter(){
  const P = {
    skin:0x8a6048, skinDk:0x5e4030, skinSh:0xa87858,
    scar:0xb08868,
    wrap:0x453f34, wrapDk:0x2c2822, wrapLt:0x59503f,
    armor:0x4a4438, armorDk:0x2e2a22, armorLt:0x625a48,
    strap:0x352e22,
    rust:0x6a4530, rustDk:0x40291b,
    club:0x332c22, chain:0x5c5648, chainDk:0x38352c,
    hair:0x201d18,
    disc:0x443f36, discTop:0x524b3e,
  };

  const L = {
    hipY:0.58, waistY:0.70, ribY:0.86, chestY:1.00, shldY:1.12, neckY:1.18,
    jawY:1.24, cheekY:1.32, browY:1.40, crownY:1.46,
    shoulderX:0.240,
  };

  /* ---------- LEGS — thick, wide-braced pit stance. ---------- */
  {
    const hipL=V(-0.15,L.hipY-0.02,0.01), kneeL=V(-0.17,0.33,0.07), ankL=V(-0.16,0.09,0.02);
    const hipR=V(0.15,L.hipY-0.02,-0.01), kneeR=V(0.17,0.33,-0.03), ankR=V(0.16,0.09,-0.02);
    tube(hipL,kneeL,0.135,0.100,7,P.skin);
    tube(kneeL,ankL,0.095,0.072,6,P.skinDk);
    tube(hipR,kneeR,0.135,0.100,7,P.skin);
    tube(kneeR,ankR,0.095,0.072,6,P.skinDk);
    // ash-scuffed wrap bands at the shins
    for(const [x,y] of [[-0.16,0.22],[0.16,0.18]]) quad(V(x-0.03,y,0.05),V(x+0.03,y,0.05),V(x+0.024,y-0.10,0.045),V(x-0.024,y-0.10,0.045),P.wrap,0.06);
    // bare scarred feet, wrapped ankles
    for(const ank of [ankL,ankR]){
      const heel=V(ank.x,0.045,ank.z);
      tube(heel.clone().add(V(0,0,-0.03)), heel.clone().add(V(0,0,0.16)), 0.075,0.062,6,P.skinDk,{capA:{hex:P.wrap}});
    }
  }

  /* ---------- TORSO — bare scarred barrel, half-strapped breastplate over one shoulder only. ---------- */
  stack([
    {y:L.hipY,   rx:0.170, rz:0.145, hex:P.skinDk},
    {y:L.waistY, rx:0.185, rz:0.160, hex:P.skin},
    {y:L.ribY,   rx:0.205, rz:0.165, hex:P.skinSh},
    {y:L.chestY, rx:0.230, rz:0.160, hex:P.skin},
    {y:L.shldY,  rx:0.250, rz:0.170, hex:P.skinSh},
    {y:L.neckY,  rx:0.090, rz:0.085, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.006}});
  // scars raked across the chest
  for(const [x0,y0,x1,y1] of [[-0.10,L.chestY+0.02,0.06,L.ribY-0.02],[0.12,L.shldY-0.01,-0.02,L.chestY-0.03]]){
    quad(V(x0,y0,0.16),V(x0+0.01,y0,0.16),V(x1+0.008,y1,0.15),V(x1,y1,0.15), P.scar, 0.05);
  }
  // scavenged half-breastplate — one pauldron + a diagonal chest plate, strapped on
  quad(V(-0.02,L.shldY+0.03,0.17), V(0.20,L.shldY+0.01,0.14), V(0.18,L.chestY-0.08,0.14), V(-0.04,L.chestY-0.04,0.17), P.armor, 0.05);
  quad(V(0.16,L.shldY-0.02,0.10), V(0.24,L.shldY-0.03,0.02), V(0.20,L.shldY-0.14,0.02), V(0.13,L.shldY-0.12,0.09), P.armorLt, 0.06); // pauldron
  for(const [x0,y0,x1,y1] of [[-0.02,L.shldY,0.02,L.hipY+0.02],[0.06,L.shldY-0.05,0.10,L.waistY]]) // straps across bare chest
    quad(V(x0,y0,0.175),V(x0+0.02,y0,0.175),V(x1+0.018,y1,0.165),V(x1,y1,0.165), P.strap, 0.04);
  quad(V(0.02,L.shldY+0.02,0.15),V(0.08,L.shldY,0.13),V(0.06,L.chestY-0.10,0.13),V(0.0,L.chestY-0.08,0.15), P.rust, 0.06); // rust bleed on the plate
  for(const s of [-1,1]) if(s>0) blob(s*L.shoulderX,L.shldY+0.02,0.0, 0.10,0.07,0.09,P.armorLt,6,3); // one armored pauldron

  /* ---------- HEAD — shaved/scarred skull, deep brow shadow, jaw set hard. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.088, rz:0.084, hex:P.skin},
      {y:L.cheekY, rx:0.096, rz:0.092, hex:P.skinSh},
      {y:L.browY,  rx:0.088, rz:0.078, hex:P.skinDk},
      {y:L.crownY, rx:0.072, rz:0.066, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.crownY+0.02,0.0), P.hair);
    // deep brow shadow, no eye quads
    for(const s of [-1,1]) quad(V(s*0.03,L.browY-0.01,0.075),V(s*0.05,L.browY-0.015,0.07),V(s*0.045,L.browY-0.045,0.068),V(s*0.026,L.browY-0.04,0.072), P.skinDk, 0.05);
    // jaw + broken-nose bridge scar
    quad(V(-0.05,L.jawY+0.01,0.075),V(0.05,L.jawY+0.01,0.075),V(0.045,L.jawY-0.05,0.07),V(-0.045,L.jawY-0.05,0.07),P.skinDk,0.04);
    quad(V(-0.006,L.browY-0.02,0.085),V(0.006,L.browY-0.02,0.085),V(0.010,L.jawY+0.03,0.082),V(-0.010,L.jawY+0.03,0.082),P.scar,0.05);
  }

  /* ---------- ARMS — thick oil-wrapped forearms, one holding a heavy chain-wrapped knuckle-club low. ---------- */
  {
    const S=V(L.shoulderX,L.shldY-0.03,0.0), E=V(0.26,0.76,0.14), W=V(0.20,0.38,0.24);
    tube(S,E,0.088,0.066,7,P.skin);
    tube(E,W,0.066,0.052,6,P.wrap,{capB:{hex:P.wrapDk,lift:0.005}});
    const S2=V(-L.shoulderX,L.shldY-0.03,0.0), E2=V(-0.22,0.70,0.20), W2=V(-0.14,0.36,0.30);
    tube(S2,E2,0.088,0.066,7,P.skin);
    tube(E2,W2,0.066,0.052,6,P.wrap,{capB:{hex:P.wrapDk,lift:0.005}});

    // the CLUB — a heavy wood-and-chain knuckle-club, held low in the right hand
    const cB=V(0.20,0.36,0.26), cT=V(0.24,0.10,0.38);
    tube(cB,cT,0.030,0.048,6,P.club,{capB:{hex:P.club,lift:0.008}});
    // chain wraps around the club head
    for(let i=0;i<3;i++){
      const t=i/2, cy=0.14+t*0.18, cz=0.30+t*0.06;
      quad(V(0.19,cy,cz),V(0.29,cy,cz),V(0.285,cy-0.02,cz+0.01),V(0.195,cy-0.02,cz+0.01), i%2? P.chain:P.chainDk, 0.08);
    }
  }

  /* ---------- base disc (Medium r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
