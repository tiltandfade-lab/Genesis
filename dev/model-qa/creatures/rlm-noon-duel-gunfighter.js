/* dev/model-qa/creatures/rlm-noon-duel-gunfighter.js — Noon-Duel Gunfighter (frontier,
   Medium, CR 8). A duster-coated gunfighter standing dead-center, coat flared wide by a
   wind that isn't there, both hands hovering just above a low-slung double gunbelt, hat
   brim pulled low. The stillness before the draw. Whole-object grammar: one merged frame,
   no anchors. VS-desaturated dust-tan duster, faded denim, dull gunmetal. NO eye quads —
   hat-brim shadow across a blank face. Medium size: base disc r=0.42.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildNoonDuelGunfighter(){
  const P = {
    duster:0x8a7248, dusterDk:0x5e4c2e, dusterLt:0xa4895a,
    denim:0x3c4650, denimDk:0x262d34,
    skin:0x9a7656, skinDk:0x6e5138,
    hat:0x3a3024, hatBand:0x1f1a14,
    gun:0x2e2c28, gunLt:0x45423c,
    belt:0x4a3524, buckle:0x8c7c40,
    disc:0x453b2c, discTop:0x524636,
  };

  const L = { hipY:0.36, waistY:0.56, chestY:0.82, shldY:0.98, neckY:1.06, headY:1.22 };

  /* ---------- DUSTER-COAT TORSO — a broad-shouldered body wrapped in a heavy coat, flared
     wide at the base (the wind-caught duster silhouette), standing dead straight. ---------- */
  {
    const n=9, ph=Math.PI/9;
    const bands=[
      {y:L.hipY-0.06, rx:0.24, rz:0.20, hex:P.dusterDk},
      {y:L.hipY,      rx:0.20, rz:0.175,hex:P.duster},
      {y:L.waistY,    rx:0.185,rz:0.16, hex:P.duster},
      {y:L.chestY,    rx:0.225,rz:0.19, hex:P.dusterLt},
      {y:L.shldY,     rx:0.235,rz:0.195,hex:P.duster},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* wide flaring coat-skirts, asymmetric (wind-blown) */
    quad(V(-0.24,L.hipY-0.06,0.06), V(0.24,L.hipY-0.06,0.06), V(0.38,0.05,0.16), V(-0.30,0.05,-0.02), P.dusterDk, 0.06);
    quad(V(-0.24,L.hipY-0.06,-0.10), V(0.24,L.hipY-0.06,-0.10), V(0.32,0.05,-0.22), V(-0.36,0.05,-0.10), P.dusterDk, 0.06);
    /* denim visible under the open coat-front */
    quad(V(-0.08,L.chestY,0.19), V(0.08,L.chestY,0.19), V(0.09,L.hipY,0.18), V(-0.09,L.hipY,0.18), P.denim, 0.04);
    /* low-slung double gunbelt at the hip */
    { const r1=ring(V(0,L.hipY+0.02,0), V(0,1,0), 0.235,0.205, n, ph);
      const r2=ring(V(0,L.hipY-0.05,0), V(0,1,0), 0.245,0.215, n, ph);
      stitch([r1,r2], ()=>P.belt); }
    quad(V(-0.02,L.hipY-0.01,0.215), V(0.02,L.hipY-0.01,0.215), V(0.018,L.hipY-0.05,0.225), V(-0.018,L.hipY-0.05,0.225), P.buckle, 0.04);
  }

  /* ---------- HEAD — blank shadowed face under a low hat brim, no eyes. ---------- */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:L.neckY,      rx:0.115, rz:0.105, hex:P.skinDk},
      {y:L.headY-0.03, rx:0.125, rz:0.115, hex:P.skin},
      {y:L.headY+0.06, rx:0.105, rz:0.10,  hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    quad(V(-0.11,L.headY-0.01,0.115), V(0.11,L.headY-0.01,0.115), V(0.09,L.headY+0.055,0.10), V(-0.09,L.headY+0.055,0.10), P.skinDk, 0.03);
    quad(V(-0.045,L.headY-0.08,0.115), V(0.045,L.headY-0.08,0.115), V(0.035,L.headY-0.09,0.12), V(-0.035,L.headY-0.09,0.12), P.dusterDk, 0.04);
    const hb0 = ring(V(0,L.headY+0.10,0.0), V(0,1,0), 0.14,0.13, n, ph);
    const hb1 = ring(V(0,L.headY+0.17,0.0), V(0,1,0), 0.095,0.09,n, ph);
    stitch([hb0,hb1], ()=>P.hat);
    capFan(hb1, V(0,L.headY+0.25,0.0), P.hat);
    const brimN=10;
    for(let i=0;i<brimN;i++){
      const a=(i/brimN)*Math.PI*2, a2=((i+1)/brimN)*Math.PI*2;
      const rIn=0.145, rOut=0.26;
      const y0=L.headY+0.11 + Math.max(0,Math.cos(a))*0.035;
      const y1=L.headY+0.11 + Math.max(0,Math.cos(a2))*0.035;
      quad(V(Math.cos(a)*rIn, y0, Math.sin(a)*rIn-0.02), V(Math.cos(a)*rOut, y0-0.012, Math.sin(a)*rOut-0.02),
           V(Math.cos(a2)*rOut, y1-0.012, Math.sin(a2)*rOut-0.02), V(Math.cos(a2)*rIn, y1, Math.sin(a2)*rIn-0.02), P.hatBand, 0.05);
    }
  }

  /* ---------- ARMS — both hovering just above the low-slung guns, elbows slightly bent,
     stone-still (the pre-draw pose). ---------- */
  {
    const armAt=(sign)=>{
      const sh = V(sign*0.22, L.shldY-0.02, 0.0);
      const el = V(sign*0.27, L.waistY, 0.10);
      const wr = V(sign*0.24, L.hipY+0.03, 0.16);
      tube(sh, el, 0.065, 0.052, 6, P.duster, {capA:{hex:P.dusterDk}});
      tube(el, wr, 0.052, 0.040, 6, P.duster, {capB:{hex:P.skin, lift:0.012}});
      /* holstered pistol at the hip, grip toward the hand */
      const hgrip = V(sign*0.26, L.hipY-0.04, 0.14);
      const hbarrel = V(sign*0.26, L.hipY-0.18, 0.20);
      tube(hgrip, hbarrel, 0.028, 0.022, 5, P.gun, {capB:{hex:P.gunLt}});
    };
    armAt(-1); armAt(1);
  }

  /* ---------- LEGS — sturdy trousered legs, boots planted wide and dead-still. ---------- */
  {
    const legAt=(sign)=>{
      const hip=V(sign*0.11, 0.14, 0.0);
      const knee=V(sign*0.12, 0.06, 0.02);
      const foot=V(sign*0.12, 0.02, 0.06);
      tube(hip, knee, 0.09, 0.08, 6, P.denimDk);
      tube(knee, foot, 0.08, 0.075, 6, P.dusterDk, {capB:{hex:P.hat, lift:0.015}});
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
