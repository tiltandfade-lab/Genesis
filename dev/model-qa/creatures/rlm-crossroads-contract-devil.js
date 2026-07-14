/* dev/model-qa/creatures/rlm-crossroads-contract-devil.js — "Crossroads Contract Devil"
   (frontier realm, Medium fiend, CR 12, disc r=0.42). A duster-clad fiend standing casually,
   a fiddle-case held low in one hand, small backswept horns, a thin devil's tail curling from
   under the coat hem. VS-desaturated dusty black-duster + dull crimson-hide palette. No eye
   quads — brow-shadow sockets. Whole-object grammar, one merged frame. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildCrossroadsContractDevil(){
  const P = {
    duster:0x2e2420, dusterDk:0x1a1512, dusterLt:0x40332c,
    hide:0x6e3230, hideDk:0x461f1e, hideLt:0x854240,          // dull crimson fiend hide
    horn:0x2a221c, hornTip:0x161210,
    caseWood:0x4a3423, caseDk:0x2e2013, caseTrim:0x8a7042,
    socket:0x140f0d, boot:0x1c1512,
    disc:0x4a4038, discTop:0x584a3a,
  };

  const S = {
    pelvis:V(0,0.52,0), waist:V(0,0.72,0.01), chest:V(0,0.98,0.00), shldr:V(0,1.16,-0.01),
    neck:V(0,1.24,0.01), headB:V(0,1.32,0.02),
  };

  /* torso — long duster over a lean crimson-hide frame */
  tube(S.pelvis, S.waist, 0.170, 0.185, 9, P.duster, {phase:Math.PI/9});
  tube(S.waist, S.chest, 0.185, 0.200, 9, P.dusterLt, {phase:Math.PI/9});
  tube(S.chest, S.shldr, 0.200, 0.175, 9, P.duster, {phase:Math.PI/9});
  tube(S.shldr, S.neck, 0.175, 0.080, 9, P.dusterDk, {phase:Math.PI/9});
  /* lapel showing a sliver of crimson hide beneath */
  quad(V(-0.05,1.13,0.155), V(0.05,1.13,0.155), V(0.075,0.76,0.16), V(-0.075,0.76,0.16), P.hide, 0.05);
  quad(V(-0.11,1.14,0.14), V(-0.055,1.13,0.155), V(-0.08,0.78,0.16), V(-0.14,0.78,0.145), P.dusterDk, 0.04);
  quad(V(0.11,1.14,0.14), V(0.055,1.13,0.155), V(0.08,0.78,0.16), V(0.14,0.78,0.145), P.dusterDk, 0.04);
  /* duster hem flare */
  {
    const hemPts=[[-0.24,0.44,0.10],[-0.13,0.34,0.15],[0,0.30,0.17],[0.13,0.36,0.13],[0.24,0.46,0.08]];
    for(let i=0;i<hemPts.length-1;i++){
      const a=hemPts[i], b=hemPts[i+1];
      quad(V(a[0],0.68,a[2]-0.04), V(b[0],0.68,b[2]-0.04), V(b[0],b[1],b[2]), V(a[0],a[1],a[2]), P.duster, 0.06);
    }
  }

  /* head — narrow crimson-hide, backswept small horns, brow-shadow sockets */
  {
    const n=8, ph=Math.PI/n;
    const bands=[{y:1.28,rx:0.088,rz:0.090,hex:P.hide},{y:1.36,rx:0.096,rz:0.092,hex:P.hideLt},{y:1.43,rx:0.078,rz:0.074,hex:P.hideDk}];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.47,0.01), P.hideDk);
    for(const s of [-1,1]) quad(V(s*0.055,1.375,0.085), V(s*0.02,1.375,0.09), V(s*0.02,1.33,0.09), V(s*0.055,1.33,0.085), P.socket, 0.02);
    /* small backswept horns */
    for(const s of [-1,1]){
      const b0=V(s*0.07,1.43,-0.02), t=V(s*0.13,1.52,-0.16);
      tube(b0,t,0.028,0.006,5,P.horn,{capB:{hex:P.hornTip}});
    }
    /* thin dry-lipped mouth line */
    quad(V(-0.05,1.30,0.085), V(0.05,1.30,0.085), V(0.04,1.285,0.088), V(-0.04,1.285,0.088), P.hideDk, 0.03);
  }
  /* low hat brim, tilted, casual */
  {
    const r1=ring(V(0,1.45,0.00),V(0,1,0),0.135,0.135,10);
    const r2=ring(V(0,1.47,0.00),V(0,1,0),0.075,0.075,10);
    const r3=ring(V(0,1.56,0.00),V(0,1,0),0.07,0.07,10);
    stitch([r1,r2],()=>P.dusterDk); stitch([r2,r3],()=>P.duster); capFan(r3, V(0,1.60,0.00), P.duster);
  }

  /* one arm hangs relaxed, one holds the fiddle-case low at the side */
  {
    const shR=V(-0.20,1.11,0.00), elR=V(-0.26,0.88,0.06), haR=V(-0.24,0.68,0.10);
    tube(shR,elR,0.06,0.045,6,P.duster); tube(elR,haR,0.045,0.032,6,P.hide,{capB:{hex:P.hideDk,lift:0.012}});

    const shL=V(0.20,1.11,0.00), elL=V(0.26,0.86,0.08), haL=V(0.22,0.62,0.14);
    tube(shL,elL,0.06,0.045,6,P.duster); tube(elL,haL,0.045,0.032,6,P.hide,{capB:{hex:P.hideDk,lift:0.012}});
    /* FIDDLE-CASE — a slim tapered rectangular case held low, wood-grain + brass trim */
    const cTop=V(haL.x+0.02,haL.y+0.02,haL.z+0.02), cBot=V(haL.x+0.03,haL.y-0.40,haL.z+0.05);
    quad(V(cTop.x-0.055,cTop.y,cTop.z), V(cTop.x+0.055,cTop.y,cTop.z), V(cBot.x+0.045,cBot.y,cBot.z), V(cBot.x-0.045,cBot.y,cBot.z), P.caseWood, 0.05);
    quad(V(cTop.x-0.055,cTop.y,cTop.z+0.03), V(cTop.x+0.055,cTop.y,cTop.z+0.03), V(cBot.x+0.045,cBot.y,cBot.z+0.03), V(cBot.x-0.045,cBot.y,cBot.z+0.03), P.caseDk, 0.05);
    /* brass trim + handle */
    quad(V(cTop.x-0.05,cTop.y-0.02,cTop.z), V(cTop.x+0.05,cTop.y-0.02,cTop.z), V(cTop.x+0.05,cTop.y-0.04,cTop.z), V(cTop.x-0.05,cTop.y-0.04,cTop.z), P.caseTrim, 0.03);
    tube(V(cTop.x-0.03,cTop.y+0.03,cTop.z), V(cTop.x+0.03,cTop.y+0.03,cTop.z), 0.008,0.008,4,P.caseTrim);
  }

  /* legs, booted */
  for(const s of [-1,1]){
    const hip=V(s*0.10,0.50,0.00), knee=V(s*0.11,0.28,0.03), foot=V(s*0.11,0.05,0.08);
    tube(hip,knee,0.105,0.080,7,P.duster);
    tube(knee,foot,0.075,0.058,6,P.boot,{capB:{hex:P.boot,lift:0.012}});
  }

  /* thin devil's tail curling from under the coat hem */
  {
    const t0=V(0,0.42,-0.14), t1=V(0.10,0.34,-0.28), t2=V(0.20,0.30,-0.38), tip=V(0.30,0.36,-0.42);
    tube(t0,t1,0.035,0.024,5,P.hide);
    tube(t1,t2,0.024,0.014,5,P.hideDk);
    tube(t2,tip,0.014,0.005,4,P.hideDk,{capB:{hex:P.hideDk}});
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
