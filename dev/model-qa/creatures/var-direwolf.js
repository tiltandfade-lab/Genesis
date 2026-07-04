/* dev/model-qa/creatures/var-direwolf.js — DIRE WOLF kin-variant (sub-nearest doctrine).
   COPIES mon-wolf.js: all coordinates+radii scaled x1.35 (body AND base disc — becomes a
   Large-ish r≈0.55 piece), darkened coat palette (near-black saddle, dark grey body), slightly
   longer fangs. Everything else identical. Imported by var-direwolf-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

const k = 1.35;                                 // scale factor (body + base disc)
const KV = (x,y,z)=>V(x*k, y*k, z*k);           // scaled landmark helper

export function buildDireWolf(){
  /* ---------- PALETTE (darkened: near-black saddle, dark grey body) ---------- */
  const P = {
    coat:0x54504a, coatDk:0x38352f, saddle:0x211f1b, saddleDk:0x100e0c,
    belly:0x6a655c, ruff:0x605c54,
    muzzle:0x413c33, muzzleLt:0x5a554a, nose:0x141110,
    maw:0x241715, tongue:0x7a4640, tooth:0xe0d7c2,
    ear:0x38352f, earIn:0x211d18,
    eye:0x0f0c0a, eyeGlow:0xc7a94e,             // amber hunter's eye (kept)
    claw:0x1c1814, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — spine along +z, scaled x1.35. Head lowered. ---------- */
  const shY = 0.78*k;
  const S = {
    rump:   KV(0, 0.80, -0.50),
    loin:   KV(0, 0.81, -0.28),
    saddle: KV(0, 0.83, -0.04),
    shldr:  KV(0, 0.80,  0.20),
    neckB:  KV(0, 0.78,  0.36),
    neck:   KV(0, 0.75,  0.48),
    headB:  KV(0, 0.72,  0.58),
  };

  /* ---------- BODY — one horizontal loft; deep chest, tucked loin, high rump ---------- */
  tube(S.rump,   S.loin,   0.215*k, 0.245*k, 8, P.coat,   {phase:Math.PI/8, capA:{hex:P.coatDk, lift:0.02*k}});
  tube(S.loin,   S.saddle, 0.245*k, 0.270*k, 8, P.saddle, {phase:Math.PI/8});
  tube(S.saddle, S.shldr,  0.270*k, 0.255*k, 8, P.coat,   {phase:Math.PI/8});
  tube(S.shldr,  S.neckB,  0.255*k, 0.180*k, 8, P.coat,   {phase:Math.PI/8});
  tube(S.neckB,  S.neck,   0.180*k, 0.150*k, 8, P.ruff,   {phase:Math.PI/8});
  tube(S.neck,   S.headB,  0.150*k, 0.120*k, 8, P.coatDk, {phase:Math.PI/8});
  {
    quad(KV(-0.14,0.48,0.05), KV(0.14,0.48,0.05), KV(0.10,0.44,0.34), KV(-0.10,0.44,0.34), P.ruff, 0.05);
    quad(KV(-0.15,0.50,-0.34), KV(0.15,0.50,-0.34), KV(0.13,0.52,0.06), KV(-0.13,0.52,0.06), P.belly, 0.05);
  }

  /* ---------- HEAD — lowered wedge with the SIGNATURE OPEN MAW ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:(0.78-0.085)*k, cz:0.63*k, rx:0.128*k, rz:0.130*k, hex:P.coat},
      {y:(0.78-0.045)*k, cz:0.66*k, rx:0.140*k, rz:0.138*k, hex:P.coat},
      {y:(0.78-0.005)*k, cz:0.64*k, rx:0.122*k, rz:0.112*k, hex:P.coatDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), KV(0, 0.805, 0.62), P.coatDk);

    const jawY = (0.78-0.155)*k;
    {
      const mb=V(0, jawY+0.02*k, 0.66*k), mm=V(0, jawY-0.02*k, 0.78*k);
      tube(mb, mm, 0.070*k, 0.050*k, n, P.maw, {raz:0.055*k, rbz:0.040*k, phase:ph, capB:{hex:P.maw, lift:0.006*k}});
      quad(V(-0.030*k,jawY-0.05*k,0.70*k), V(0.030*k,jawY-0.05*k,0.70*k),
           V(0.024*k,jawY-0.055*k,0.82*k), V(-0.024*k,jawY-0.055*k,0.82*k), P.tongue, 0.04);
    }
    const uB=V(0, jawY+0.055*k, 0.655*k), uM=V(0, jawY+0.045*k, 0.80*k), uT=V(0, jawY+0.030*k, 0.90*k);
    tube(uB, uM, 0.100*k, 0.074*k, n, P.muzzle, {raz:0.070*k, rbz:0.052*k, phase:ph});
    tube(uM, uT, 0.074*k, 0.040*k, n, P.muzzle, {raz:0.052*k, rbz:0.028*k, phase:ph, capB:{hex:P.nose, lift:0.010*k}});
    const lB=V(0, jawY-0.065*k, 0.655*k), lM=V(0, jawY-0.115*k, 0.78*k), lT=V(0, jawY-0.145*k, 0.86*k);
    tube(lB, lM, 0.078*k, 0.052*k, n, P.muzzle, {raz:0.056*k, rbz:0.038*k, phase:ph});
    tube(lM, lT, 0.052*k, 0.028*k, n, P.muzzleLt, {raz:0.038*k, rbz:0.020*k, phase:ph, capB:{hex:P.muzzleLt, lift:0.008*k}});

    /* geometric TEETH — LONGER fangs (dire): h multiplier bumped ~1.4x over the wolf's tooth heights */
    const fang=(x,y,z,w,h,down)=>{
      const ty = down ? y-h : y+h;
      quad(V(x-w,y,z+0.006*k), V(x+w,y,z+0.006*k), V(x,ty,z+0.004*k), V(x,ty,z+0.004*k), P.tooth, 0.02);
    };
    for(const s of [-1,1]){
      fang(s*0.054*k, jawY+0.012*k, 0.70*k, 0.020*k, 0.100*k, true);   // canine — longer
      fang(s*0.028*k, jawY+0.010*k, 0.74*k, 0.013*k, 0.048*k, true);
      fang(s*0.050*k, jawY+0.008*k, 0.60*k, 0.014*k, 0.044*k, true);
    }
    for(const s of [-1,1]){
      fang(s*0.048*k, jawY-0.065*k, 0.70*k, 0.017*k, 0.080*k, false);  // longer
      fang(s*0.026*k, jawY-0.068*k, 0.735*k, 0.011*k, 0.040*k, false);
    }
    for(const s of [-1,1]){
      const base=KV(s*0.100, 0.81, 0.585);
      const tip =KV(s*0.135, 0.97, 0.560);
      tube(base, tip, 0.058*k, 0.010*k, 6, P.ear, {raz:0.030*k, rbz:0.006*k, capB:{hex:P.ear, lift:0.006*k}});
      quad(KV(s*0.088,0.825,0.598), KV(s*0.116,0.825,0.590),
           KV(s*0.126,0.945,0.568), KV(s*0.104,0.945,0.575), P.earIn, 0.03);
    }
  }

  /* ---------- LEGS — 4, each with a VISIBLE HAUNCH ---------- */
  {
    const leg=(hip, footX, footZ, hex, rearThick)=>{
      const upR  = (rearThick ? 0.150 : 0.120)*k;
      const midR = (rearThick ? 0.090 : 0.075)*k;
      const knee=V(hip.x + Math.sign(hip.x)*0.010*k, (0.78-0.30)*k, hip.z + (rearThick?0.03*k:0.0));
      const ankle=V(footX, 0.16*k, footZ);
      const paw=V(footX, 0.05*k, footZ+0.04*k);
      tube(hip, knee, upR, midR, 6, hex);
      tube(knee, ankle, 0.062*k, 0.042*k, 6, P.coatDk);
      tube(ankle, paw, 0.044*k, 0.038*k, 6, P.muzzle, {capB:{hex:P.muzzle, lift:0.006*k}});
      for(const cx of [-0.022*k,0,0.022*k]){
        quad(V(paw.x+cx-0.006*k,0.03*k,paw.z+0.03*k), V(paw.x+cx+0.006*k,0.03*k,paw.z+0.03*k),
             V(paw.x+cx+0.004*k,0.01*k,paw.z+0.055*k), V(paw.x+cx-0.004*k,0.01*k,paw.z+0.055*k), P.claw, 0.0);
      }
    };
    leg(KV(-0.150, 0.72, 0.185), -0.165*k, 0.25*k, P.coat, false);
    leg(KV( 0.150, 0.72, 0.185),  0.165*k, 0.21*k, P.coat, false);
    leg(KV(-0.165, 0.70, -0.44), -0.185*k, -0.36*k, P.coat, true);
    leg(KV( 0.165, 0.70, -0.44),  0.185*k, -0.40*k, P.coat, true);
  }

  /* ---------- TAIL — bushy, carried LEVEL ---------- */
  {
    const root = KV(0.02, 0.78, -0.56);
    const b1   = KV(0.05, 0.76, -0.74);
    const b2   = KV(0.10, 0.72, -0.92);
    const b3   = KV(0.15, 0.65, -1.06);
    const tip  = KV(0.19, 0.56, -1.16);
    tube(root, b1, 0.100*k, 0.115*k, 8, P.coat,   {phase:Math.PI/8, capA:{hex:P.coatDk}});
    tube(b1,   b2, 0.115*k, 0.098*k, 8, P.coat,   {phase:Math.PI/8});
    tube(b2,   b3, 0.098*k, 0.070*k, 8, P.coatDk, {phase:Math.PI/8});
    tube(b3,   tip,0.070*k, 0.028*k, 8, P.saddleDk,{phase:Math.PI/8, capB:{hex:P.saddleDk, lift:0.008*k}});
  }

  /* ---------- base disc (scaled: r≈0.55, Large-ish) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42*k, 0.42*k, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40*k, 0.40*k, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
