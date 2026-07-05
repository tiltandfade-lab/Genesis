/* dev/model-qa/creatures/rlm-skinwalker-cavalry-scout.js — "Skinwalker Cavalry Scout"
   (frontier realm, Medium monstrosity, CR 8, disc r=0.42). A lean, coyote-shouldered scout
   caught mid-stride between man and animal: cavalry-cut leather half-jacket on a torso that
   twists into a lupine haunch below, a coyote-muzzled head, one forward hand still human-gripped,
   the other a clawed forepaw. VS-desaturated dusty tan/grey coyote palette. No eye quads. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSkinwalkerCavalryScout(){
  const P = {
    hide:0x6e6248, hideDk:0x494030, hideLt:0x847858,       // coyote hide tan-grey
    leather:0x4a3a28, leatherDk:0x2e2318,                   // cavalry-cut half-jacket
    fur:0x7a715a, furDk:0x53493a,
    claw:0x201b16, socket:0x171310, snout:0x5c5138,
    disc:0x4a4038, discTop:0x584a3a,
  };

  /* twisted-stride spine: hips angled low/back (animal), chest turned up/forward (human) */
  const S = {
    haunch: V(0,0.36,-0.14), hip: V(0.02,0.46,0.00), waist: V(0,0.62,0.06),
    chest: V(-0.01,0.82,0.04), shldr: V(0,0.96,0.02), neck: V(0.01,1.02,0.06), headB: V(0.02,1.08,0.12),
  };

  /* lower body — lupine haunch, low & back-angled (mid-transform crouch) */
  tube(S.haunch, S.hip, 0.155, 0.145, 8, P.fur, {phase:Math.PI/8});
  tube(S.hip, S.waist, 0.145, 0.135, 8, P.hide, {phase:Math.PI/8});
  /* upper body — narrows into a human-cut leather half-jacket torso */
  tube(S.waist, S.chest, 0.135, 0.145, 8, P.leather, {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.145, 0.130, 8, P.leatherDk, {phase:Math.PI/8});
  tube(S.shldr, S.neck, 0.130, 0.075, 8, P.hide, {phase:Math.PI/8});
  /* jacket seam / half-cut hem showing bare fur flank beneath */
  quad(V(-0.10,0.86,0.10), V(0.10,0.86,0.10), V(0.13,0.60,0.12), V(-0.13,0.60,0.12), P.leatherDk, 0.04);
  quad(V(0.08,0.60,0.10), V(0.15,0.55,0.06), V(0.16,0.40,0.02), V(0.09,0.44,0.04), P.fur, 0.05);

  /* head — coyote muzzle grafted onto a still-humanoid cranium */
  {
    const n=8, ph=Math.PI/n;
    const bands=[{y:1.05,cz:0.10,rx:0.085,rz:0.090,hex:P.hide},{y:1.13,cz:0.11,rx:0.095,rz:0.088,hex:P.hideLt},{y:1.20,cz:0.09,rx:0.075,rz:0.070,hex:P.hideDk}];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.23,0.09), P.hideDk);
    /* deep socket shadows */
    for(const s of [-1,1]) quad(V(s*0.05,1.145,0.165), V(s*0.02,1.145,0.17), V(s*0.02,1.10,0.17), V(s*0.05,1.10,0.165), P.socket, 0.02);
    /* pointed coyote ears */
    for(const s of [-1,1]){
      const b=V(s*0.06,1.19,0.05), t=V(s*0.10,1.32,0.02);
      tube(b,t,0.035,0.006,5,P.fur,{capB:{hex:P.furDk}});
    }
    /* muzzle — projecting snout, narrow, tapering */
    const mB=V(0,1.055,0.16), mM=V(0,1.04,0.28), mT=V(0,1.03,0.38);
    tube(mB,mM,0.062,0.042,7,P.snout,{raz:0.05,rbz:0.034,phase:ph});
    tube(mM,mT,0.042,0.020,7,P.snout,{raz:0.034,rbz:0.014,phase:ph,capB:{hex:P.claw,lift:0.006}});
  }

  /* ARMS — one still human-gripped (holding reins/rope), one already a clawed forepaw */
  {
    const shH=V(-0.17,0.92,0.06), elH=V(-0.24,0.72,0.16), haH=V(-0.20,0.56,0.24);
    tube(shH,elH,0.06,0.045,6,P.leather); tube(elH,haH,0.045,0.032,6,P.hide,{capB:{hex:P.hideDk,lift:0.012}});
    /* clenched human grip suggestion */
    quad(V(haH.x-0.03,haH.y+0.02,haH.z), V(haH.x+0.03,haH.y+0.02,haH.z), V(haH.x+0.025,haH.y-0.03,haH.z+0.02), V(haH.x-0.025,haH.y-0.03,haH.z+0.02), P.hideDk, 0.03);

    const shP=V(0.17,0.90,0.08), elP=V(0.26,0.66,0.20), foP=V(0.24,0.42,0.32);
    tube(shP,elP,0.062,0.046,6,P.leather); tube(elP,foP,0.046,0.036,6,P.fur,{capB:{hex:P.furDk,lift:0.012}});
    /* clawed forepaw — 3 splayed claws */
    for(const dx of [-0.03,0,0.03]) tube(V(foP.x+dx,foP.y-0.01,foP.z+0.01), V(foP.x+dx*1.6,foP.y-0.06,foP.z+0.09), 0.014,0.004,4,P.claw,{capB:{hex:P.claw}});
  }

  /* HIND LEGS — one digitigrade animal leg, one still human stride (the mid-transform read) */
  {
    /* animal hind leg — sharp hock bend */
    const hip=V(-0.10,0.40,-0.14), hock=V(-0.14,0.20,-0.06), paw=V(-0.10,0.05,0.06);
    tube(hip,hock,0.115,0.075,7,P.fur); tube(hock,paw,0.06,0.038,6,P.furDk,{capB:{hex:P.claw,lift:0.01}});
    for(const dx of [-0.02,0.02]) tube(V(paw.x+dx,paw.y+0.01,paw.z), V(paw.x+dx*1.6,paw.y-0.03,paw.z+0.05), 0.012,0.004,4,P.claw);
    /* human leg — booted, straight stride, still in cavalry trousers */
    const hip2=V(0.11,0.44,-0.02), knee=V(0.13,0.24,0.04), foot=V(0.12,0.05,0.10);
    tube(hip2,knee,0.10,0.075,7,P.leather); tube(knee,foot,0.070,0.055,6,P.leatherDk,{capB:{hex:P.leatherDk,lift:0.012}});
  }

  /* bushy tail low behind the haunch */
  {
    const t0=V(0,0.42,-0.20), t1=V(-0.06,0.36,-0.34), tip=V(-0.10,0.30,-0.44);
    tube(t0,t1,0.06,0.045,6,P.fur); tube(t1,tip,0.045,0.02,6,P.furDk,{capB:{hex:P.furDk}});
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
