/* dev/model-qa/creatures/rlm-wrapped-gladiator-of-the-sun-pit.js — WRAPPED GLADIATOR OF THE SUN PIT
   (lost-world, Medium Undead, CR 5). Read: a mummified gladiator, hide-taut and bandage-wrapped
   head to foot, still braced in a duelist's stance before an empty arena — one arm raised with a
   notched practice blade, the other bearing a cracked round shield, sun-bleached wraps trailing.
   VS-desaturated antiquity register: sun-bleached bone-linen bandages, sand-scoured bronze,
   sun-baked ochre skin glimpsed through the wraps. NO eye quads — dark wrapped sockets only.
   Whole-object grammar: one function, one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildWrappedGladiatorOfTheSunPit(){
  const P = {
    wrap:0x9c8f6c, wrapDk:0x776c50, wrapLt:0xb3a680,      // sun-bleached linen bandages
    wrapShad:0x574e39,                                     // deep wrap shadow lines
    skin:0x8a6b48, skinDk:0x5f4830,                        // sun-baked ochre skin (glimpsed)
    socket:0x201a12,
    bronze:0x8a7548, bronzeDk:0x5c4c2e, bronzeLt:0xab9560, // sand-scoured bronze armor bits
    blade:0x7a7a70, bladeDk:0x4e4e46, bladeGlint:0x9a9a8e,
    grip:0x3a2f20, shieldFace:0x7a5f3a, shieldRim:0x54432a,
    disc:0x4a4038, discTop:0x585047,
  };

  /* SPINE — braced duelist stance, weight forward, chest turned slightly */
  const S = {
    hip:    V(0, 0.60, 0),
    waist:  V(0.01, 0.80, 0.01),
    ribs:   V(0.02, 1.00, 0.02),
    chest:  V(0.02, 1.12, 0.01),
    shldr:  V(0.01, 1.20, -0.01),
    neck:   V(0, 1.28, -0.02),
    headB:  V(0, 1.34, -0.02),
  };

  /* TORSO — wrapped bandage column, corded muscle read through the taut linen */
  tube(S.hip,   S.waist, 0.155, 0.140, 8, P.wrap,   {phase:Math.PI/8, capA:{hex:P.wrapDk, lift:0.02}});
  tube(S.waist, S.ribs,  0.140, 0.155, 8, P.wrapDk, {phase:Math.PI/8});
  tube(S.ribs,  S.chest, 0.155, 0.150, 8, P.wrap,   {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.150, 0.135, 8, P.wrapLt, {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.070, 0.052, 6, P.skinDk, {phase:Math.PI/6});
  /* diagonal bandage wrap-lines crossing the chest */
  for(let i=0;i<4;i++){
    const y0=0.66+i*0.14, y1=y0+0.10;
    quad(V(-0.155,y0,0.02), V(0.02,y0+0.02,0.13), V(0.03,y1+0.02,0.12), V(-0.145,y1,0.02), P.wrapShad, 0.05);
  }
  /* loincloth wrap at the hip */
  {
    const hipTop=ring(V(0,0.66,0), V(0,1,0), 0.175, 0.16, 10, Math.PI/10);
    const hipBot=ring(V(0,0.46,0), V(0,1,0), 0.155, 0.14, 10, Math.PI/10);
    stitch([hipTop,hipBot], ()=>P.wrapDk);
    capFan(hipBot, V(0,0.44,0), P.wrapDk, true);
  }

  /* HEAD — fully wrapped, dark sunken sockets, jaw wraps loose */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.24, cz:0.0,  rx:0.075, rz:0.075, hex:P.wrap},
      {y:1.31, cz:0.01, rx:0.082, rz:0.080, hex:P.wrapLt},
      {y:1.37, cz:0.0,  rx:0.068, rz:0.066, hex:P.wrapDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.41,0.0), P.wrapDk);
    /* wrapped sockets — dark carved recesses, no eye quads */
    for(const s of [-1,1]) quad(V(s*0.030,1.315,0.062), V(s*0.048,1.315,0.062),
                                 V(s*0.044,1.29,0.058), V(s*0.034,1.29,0.058), P.socket, 0.02);
    /* loose wrap tail hanging from the jaw */
    tube(V(0.03,1.235,0.05), V(0.06,1.06,0.09), 0.024,0.014, 4, P.wrap, {capB:{hex:P.wrapDk, lift:0.006}});
  }

  /* ARMS — one raised with a notched practice blade, one bearing the shield */
  {
    /* sword arm — raised, en garde */
    const shS=V(-0.155,1.15,0.0), elS=V(-0.24,1.06,0.16), wrS=V(-0.19,1.24,0.34);
    tube(shS, elS, 0.055, 0.042, 6, P.wrap);
    tube(elS, wrS, 0.040, 0.030, 6, P.wrapLt, {capB:{hex:P.wrapDk, lift:0.006}});
    /* fist + blade */
    const grip0=V(-0.19,1.20,0.34), grip1=V(-0.16,1.05,0.38);
    tube(grip0, grip1, 0.024,0.020,5,P.grip);
    const bladeTip=V(-0.08,0.66,0.46);
    tube(grip1, V(-0.14,0.98,0.40), 0.030,0.028,5,P.bronze,{capB:{hex:P.bronzeLt,lift:0.01}});
    tube(V(-0.14,0.98,0.40), bladeTip, 0.042,0.006, 4, P.blade, {raz:0.010, rbz:0.004, capB:{hex:P.bladeDk, lift:0.004}});
    quad(V(-0.155,0.97,0.395), V(-0.125,0.97,0.405), V(-0.10,0.70,0.45), V(-0.13,0.70,0.44), P.bladeGlint, 0.03);

    /* shield arm — bearing a cracked round shield across the body */
    const shH=V(0.155,1.13,0.0), elH=V(0.22,0.94,0.12), wrH=V(0.16,0.82,0.24);
    tube(shH, elH, 0.055, 0.040, 6, P.wrap);
    tube(elH, wrH, 0.038, 0.028, 6, P.wrapLt, {capB:{hex:P.skinDk, lift:0.006}});
    /* round shield */
    const shC=V(0.30,0.80,0.20);
    const rimR=ring(shC, V(0.4,0.1,0.9).normalize(), 0.235, 0.235, 12, Math.PI/12);
    const faceR=ring(V(shC.x+0.02,shC.y,shC.z+0.045), V(0.4,0.1,0.9).normalize(), 0.20, 0.20, 12, Math.PI/12);
    stitch([rimR, faceR], ()=>P.shieldRim);
    capFan(faceR, V(shC.x+0.03,shC.y,shC.z+0.06), P.shieldFace, true);
    /* crack across the shield face */
    quad(V(shC.x-0.10,shC.y+0.12,shC.z+0.05), V(shC.x-0.06,shC.y+0.10,shC.z+0.06),
         V(shC.x+0.08,shC.y-0.14,shC.z+0.06), V(shC.x+0.05,shC.y-0.15,shC.z+0.05), P.bronzeDk, 0.04);
  }

  /* LEGS — braced stance, one forward, one back, sand-scoured bronze greaves over wraps */
  {
    const leg=(hipX, footZ, hex)=>{
      const hip=V(hipX, 0.60, 0.0);
      const knee=V(hipX*1.05, 0.32, footZ*0.55);
      const ankle=V(hipX*0.95, 0.08, footZ);
      tube(hip, knee, 0.078, 0.058, 7, hex);
      tube(knee, ankle, 0.056, 0.040, 7, P.bronze, {capB:{hex:P.bronzeDk, lift:0.006}});
      const toe=V(ankle.x, 0.02, ankle.z+0.14);
      tube(ankle, toe, 0.044, 0.030, 5, P.wrapDk, {capB:{hex:P.wrapDk, lift:0.004}});
    };
    leg(-0.10, 0.20, P.wrap);
    leg( 0.10, -0.16, P.wrap);
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
