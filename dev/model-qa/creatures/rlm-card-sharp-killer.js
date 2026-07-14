/* dev/model-qa/creatures/rlm-card-sharp-killer.js — Card-Sharp Killer (frontier, Medium,
   CR 3). A well-dressed gambler: fitted dark coat, brocade waistcoat, low-brim hat tipped
   forward, one arm cocked with a sleeve-derringer rig, the other holding a fanned hand of
   cards — a dealer's dead-still poise. Whole-object grammar: one merged frame, no anchors.
   VS-desaturated palette: dark charcoal coat, faded burgundy waistcoat, pale card-white, dull
   brass derringer. NO eye quads — the hat brim shadows a blank dark face-plane. Medium size:
   base disc r=0.42.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildCardSharpKiller(){
  const P = {
    coat:0x2c2824, coatDk:0x1c1916, coatLt:0x3e372f,
    vest:0x5c2c30, vestDk:0x3c1c1f,
    shirt:0xc4bba0,
    skin:0x9a7658, skinDk:0x6e5138,
    hat:0x201d19, hatBand:0x4a3428,
    brass:0x8c7c40, brassDk:0x5c4f28,
    card:0xd8d0b8, cardDk:0xa89d80, cardRed:0x7a3a3a,
    disc:0x3a352c, discTop:0x453f33,
  };

  const L = { hipY:0.36, waistY:0.56, chestY:0.80, shldY:0.96, neckY:1.04, headY:1.20 };

  /* ---------- LONG COAT BODY — a fitted dark coat torso, narrow waist, straight-standing
     stillness (a dealer's poise, not a fighter's crouch). ---------- */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:L.hipY-0.10, rx:0.16, rz:0.14, hex:P.coatDk},
      {y:L.hipY,      rx:0.185,rz:0.16, hex:P.coat},
      {y:L.waistY,    rx:0.165,rz:0.145,hex:P.coat},
      {y:L.chestY,    rx:0.20, rz:0.175,hex:P.coatLt},
      {y:L.shldY,     rx:0.195,rz:0.17, hex:P.coat},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* long coat skirts flaring below the hip, straight to mid-shin */
    quad(V(-0.19,L.hipY-0.10,0.10), V(0.19,L.hipY-0.10,0.10), V(0.24,0.06,0.06), V(-0.24,0.06,0.06), P.coatDk, 0.05);
    quad(V(-0.19,L.hipY-0.10,-0.10), V(0.19,L.hipY-0.10,-0.10), V(0.24,0.06,-0.06), V(-0.24,0.06,-0.06), P.coatDk, 0.05);
    /* burgundy waistcoat visible in the open coat-front, brass buttons */
    quad(V(-0.09,L.chestY+0.06,0.155), V(0.09,L.chestY+0.06,0.155), V(0.10,L.hipY,0.15), V(-0.10,L.hipY,0.15), P.vest, 0.04);
    for(const y of [L.hipY+0.06, L.waistY+0.02, L.chestY-0.02]){
      quad(V(-0.014,y-0.012,0.165), V(0.014,y-0.012,0.165), V(0.012,y+0.012,0.165), V(-0.012,y+0.012,0.165), P.brass, 0.04);
    }
    /* pale shirt collar at the neck */
    quad(V(-0.06,L.shldY+0.02,0.14), V(0.06,L.shldY+0.02,0.14), V(0.05,L.neckY-0.02,0.13), V(-0.05,L.neckY-0.02,0.13), P.shirt, 0.04);
  }

  /* ---------- HEAD — a blank shadow-plane under a low hat brim; no eyes, just implied
     shadow across the upper face. ---------- */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:L.neckY,      rx:0.115, rz:0.105, hex:P.skinDk},
      {y:L.headY-0.03, rx:0.125, rz:0.115, hex:P.skin},
      {y:L.headY+0.06, rx:0.105, rz:0.10,  hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* shadow band across the upper face (brim shade, no eyes) */
    quad(V(-0.11,L.headY-0.01,0.115), V(0.11,L.headY-0.01,0.115), V(0.09,L.headY+0.05,0.10), V(-0.09,L.headY+0.05,0.10), P.skinDk, 0.03);
    /* thin unreadable mouth-line */
    quad(V(-0.045,L.headY-0.075,0.115), V(0.045,L.headY-0.075,0.115), V(0.035,L.headY-0.085,0.12), V(-0.035,L.headY-0.085,0.12), P.coatDk, 0.04);

    /* low-brim hat, tipped forward over the shadow-band */
    const hb0 = ring(V(0,L.headY+0.10,0.0), V(0,1,0), 0.14,0.13, n, ph);
    const hb1 = ring(V(0,L.headY+0.16,0.0), V(0,1,0), 0.10,0.095,n, ph);
    stitch([hb0,hb1], ()=>P.hat);
    capFan(hb1, V(0,L.headY+0.24,0.0), P.hat);
    /* brim disc — a wide flat quad ring, tipped forward */
    const brimN=10;
    for(let i=0;i<brimN;i++){
      const a=(i/brimN)*Math.PI*2, a2=((i+1)/brimN)*Math.PI*2;
      const rIn=0.145, rOut=0.24;
      const y0=L.headY+0.11 + Math.max(0,Math.cos(a))*0.03;
      const y1=L.headY+0.11 + Math.max(0,Math.cos(a2))*0.03;
      quad(V(Math.cos(a)*rIn, y0, Math.sin(a)*rIn-0.02), V(Math.cos(a)*rOut, y0-0.01, Math.sin(a)*rOut-0.02),
           V(Math.cos(a2)*rOut, y1-0.01, Math.sin(a2)*rOut-0.02), V(Math.cos(a2)*rIn, y1, Math.sin(a2)*rIn-0.02), P.hatBand, 0.05);
    }
  }

  /* ---------- ARMS — one cocked with a sleeve-derringer rig at the wrist, the other
     holding a fanned hand of cards low at the hip. ---------- */
  {
    /* derringer arm — bent, wrist toward viewer, small brass derringer peeking from the cuff */
    const shR = V(0.20, L.shldY-0.02, 0.02);
    const elR = V(0.28, L.chestY-0.08, 0.14);
    const wrR = V(0.20, L.chestY+0.02, 0.24);
    tube(shR, elR, 0.06, 0.05, 6, P.coat, {capA:{hex:P.coatDk}});
    tube(elR, wrR, 0.05, 0.038, 6, P.coat, {capB:{hex:P.shirt, lift:0.01}});
    tube(wrR, V(wrR.x+0.04,wrR.y+0.01,wrR.z+0.09), 0.020,0.012, 4, P.brass, {capB:{hex:P.brassDk}});

    /* card-hand arm — hangs low, holding a fanned spread of pale cards */
    const shL = V(-0.19, L.shldY-0.02, 0.0);
    const elL = V(-0.24, L.waistY, 0.10);
    const wrL = V(-0.20, L.hipY-0.04, 0.16);
    tube(shL, elL, 0.06, 0.05, 6, P.coat, {capA:{hex:P.coatDk}});
    tube(elL, wrL, 0.05, 0.038, 6, P.coat, {capB:{hex:P.skin, lift:0.01}});
    for(let i=0;i<4;i++){
      const a = -0.5 + i*0.32;
      const tip = V(wrL.x + Math.sin(a)*0.14, wrL.y + Math.cos(a)*0.02 - 0.02, wrL.z + 0.10 + i*0.012);
      quad(V(wrL.x-0.01,wrL.y,wrL.z), V(wrL.x+0.01,wrL.y,wrL.z), V(tip.x+0.03,tip.y+0.05,tip.z), V(tip.x-0.03,tip.y+0.05,tip.z),
           (i===1)?P.cardRed:P.card, 0.04);
    }
  }

  /* ---------- LEGS — narrow trousered legs beneath the coat skirts, boots planted still. --- */
  {
    const legAt=(sign)=>{
      const hip=V(sign*0.08, 0.10, 0.0);
      const foot=V(sign*0.09, 0.02, 0.05);
      tube(hip, foot, 0.075, 0.07, 6, P.coatDk, {capB:{hex:P.hat, lift:0.015}});
    };
    legAt(-1); legAt(1);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
