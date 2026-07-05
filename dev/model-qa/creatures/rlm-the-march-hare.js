/* dev/model-qa/creatures/rlm-the-march-hare.js — THE MARCH HARE (bright-kingdom, Medium, CR 0.5).
   A lanky twitching hare in a waistcoat of fur, teacup always in one paw. Read: an upright
   bipedal hare — long tall ears, long thin legs and big hind feet, a fitted waistcoat over its
   own fur (VS-gritted, not candy — a mustard/dust waistcoat, dulled fur, worn buttons), one paw
   raised holding a small chipped teacup, the other twitchy at its side. No eye quads (dark
   socket recesses). Whole-object grammar, one merged frame, no anchors. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheMarchHare(){
  const P = {
    fur:0x9c8f74, furDk:0x746a54, furLt:0xb8ab8c,
    furPale:0xc9bda0,                                  // pale belly/muzzle fur
    vest:0x8a7838, vestDk:0x5e4f26, button:0x4a3f22,
    paw:0x82755c, pawDk:0x5c5140,
    china:0xc7bfa8, chinaDk:0x8f8770, tea:0x5a3a24,
    disc:0x463c2f, discTop:0x554839,
  };

  const spY = 0.64;
  /* ---------- TORSO — lanky upright hare body in a fitted waistcoat. ---------- */
  const bands=[
    {y:0.05,  rx:0.075, hex:P.furDk},
    {y:0.28,  rx:0.095, hex:P.vestDk},
    {y:0.52,  rx:0.115, hex:P.vest},     // waistcoat chest
    {y:0.74,  rx:0.095, hex:P.vestDk},
    {y:0.88,  rx:0.068, hex:P.fur},      // shoulders/neck (bare fur above vest)
  ];
  {
    const n=9, ph=Math.PI/n;
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx*0.78, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,0.02,0), P.furDk, true);
  }
  // pale belly-fur strip peeking under the waistcoat
  quad(V(-0.05,0.30,0.09), V(0.05,0.30,0.09), V(0.045,0.62,0.10), V(-0.045,0.62,0.10), P.furPale, 0.05);
  // waistcoat buttons
  for(const y of [0.36,0.50,0.64]) quad(V(-0.010,y,0.115), V(0.010,y,0.115), V(0.008,y-0.014,0.115), V(-0.008,y-0.014,0.115), P.button, 0.03);

  /* ---------- HEAD — narrow hare skull, long muzzle, dark socket recesses, no eye quads. ------ */
  {
    const n=9, ph=Math.PI/n;
    const hb=[
      {y:0.90, cz:0.00, rx:0.085, rz:0.090, hex:P.fur},
      {y:1.00, cz:0.01, rx:0.090, rz:0.088, hex:P.furLt},
      {y:1.10, cz:0.00, rx:0.068, rz:0.070, hex:P.fur},
    ];
    const rings = hb.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>hb[b].hex);
    capFan(rings.at(-1), V(0,1.12,0.00), P.fur);

    // long muzzle forward
    const snB = V(0, 0.955, 0.075);
    const snM = V(0, 0.940, 0.185);
    const snT = V(0, 0.930, 0.26);
    tube(snB, snM, 0.052, 0.036, n, P.furPale, {raz:0.056, rbz:0.034, phase:ph});
    tube(snM, snT, 0.036, 0.016, n, P.furPale, {raz:0.034, rbz:0.014, phase:ph, capB:{hex:P.pawDk, lift:0.004}});
    // dark socket recesses
    for(const s of [-1,1]){
      const sx=s*0.052, sy=1.005, sz=0.055;
      quad(V(sx-0.017,sy+0.012,sz), V(sx+0.017,sy+0.012,sz), V(sx+0.013,sy-0.012,sz+0.005), V(sx-0.013,sy-0.012,sz+0.005), P.furDk, 0.04);
    }
    // whisker-line nose crease + mouth
    quad(V(-0.018,0.935,0.24), V(0.018,0.935,0.24), V(0.012,0.928,0.255), V(-0.012,0.928,0.255), P.pawDk, 0.03);

    // tall twitching ears (one bent forward, one upright — the twitch)
    const earA=[V(0.032,1.12,-0.01),V(0.024,1.40,0.03),V(0.014,1.62,0.10)];
    const earB=[V(-0.032,1.12,-0.01),V(-0.040,1.36,-0.06),V(-0.048,1.50,-0.14)];
    tube(earA[0],earA[1],0.040,0.026,6,P.fur,{phase:ph});
    tube(earA[1],earA[2],0.026,0.010,6,P.furPale,{phase:ph,capB:{hex:P.furPale,lift:0.006}});
    tube(earB[0],earB[1],0.040,0.026,6,P.fur,{phase:ph});
    tube(earB[1],earB[2],0.026,0.010,6,P.furPale,{phase:ph,capB:{hex:P.furPale,lift:0.006}});
  }

  /* ---------- ARMS — one paw raised holding a chipped teacup, the other twitchy at its side. --- */
  {
    const sh1 = V(0.115, 0.86, 0.02);
    const el1 = V(0.19, 0.72, 0.10);
    const hd1 = V(0.20, 0.62, 0.20);
    tube(sh1, el1, 0.038, 0.030, 6, P.vestDk);
    tube(el1, hd1, 0.030, 0.024, 6, P.fur, {capB:{hex:P.paw, lift:0.01}});
    // teacup: a small chipped china cup + saucer held in the raised paw
    const cupC = V(0.205, 0.615, 0.225);
    const c0=ring(V(cupC.x,cupC.y-0.02,cupC.z), V(0,1,0), 0.032, 0.032, 8);
    const c1=ring(V(cupC.x,cupC.y+0.03,cupC.z), V(0,1,0), 0.038, 0.038, 8);
    stitch([c0,c1], ()=>P.china);
    capFan(c1, V(cupC.x,cupC.y+0.032,cupC.z), P.chinaDk, true);
    capFan(c0, V(cupC.x,cupC.y-0.021,cupC.z), P.china);
    // saucer
    const sc0=ring(V(cupC.x,cupC.y-0.028,cupC.z), V(0,1,0), 0.05, 0.05, 8);
    capFan(sc0, V(cupC.x,cupC.y-0.026,cupC.z), P.chinaDk, true);
    // a chip on the cup rim
    quad(V(cupC.x+0.03,cupC.y+0.028,cupC.z), V(cupC.x+0.038,cupC.y+0.028,cupC.z), V(cupC.x+0.034,cupC.y+0.018,cupC.z), V(cupC.x+0.026,cupC.y+0.018,cupC.z), P.fur, 0.02);

    const sh2 = V(-0.115, 0.84, 0.02);
    const el2 = V(-0.16, 0.62, 0.05);
    const hd2 = V(-0.17, 0.42, 0.07);
    tube(sh2, el2, 0.038, 0.030, 6, P.vestDk);
    tube(el2, hd2, 0.030, 0.022, 6, P.fur, {capB:{hex:P.paw, lift:0.01}});
  }

  /* ---------- LEGS — long thin legs, big hind feet (hare stance, digitigrade-ish). ------------- */
  {
    const leg=(hip,knee,foot,hex)=>{
      tube(hip, knee, 0.052, 0.036, 7, hex);
      tube(knee, foot, 0.036, 0.028, 7, P.furDk, {capB:{hex:P.pawDk, lift:0.008}});
      // big hind foot pad forward
      const padT = V(foot.x, foot.y-0.02, foot.z+0.10);
      tube(foot, padT, 0.030, 0.022, 6, P.pawDk, {capB:{hex:P.pawDk, lift:0.006}});
    };
    leg(V(-0.06,0.06,0.00), V(-0.075,0.30,0.06), V(-0.08,0.045,0.05), P.fur);
    leg(V( 0.06,0.06,0.01), V( 0.075,0.30,0.07), V( 0.08,0.045,0.06), P.fur);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
