/* dev/model-qa/creatures/rlm-dead-tongue-initiate.js — DEAD-TONGUE INITIATE
   (lost-world, Medium Humanoid, CR 0.5). Read: a gaunt cultist/initiate humanoid — thin
   robed silhouette, hood shadowing a starved face, hands raised in a muttered invocation.
   VS-desaturated bone-linen robe over withered flesh (lost-world dust register — dirt-caked
   hem, ash-grey). Whole-object grammar: one function, one frame, no anchors. Medium size,
   base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildDeadTongueInitiate(){
  const P = {
    robe:0x8a8268, robeDk:0x615a44, robeLt:0xa39a7c,
    hem:0x453f2e, hood:0x504a38,
    skin:0x8c7a68, skinDk:0x64553f, socket:0x241f16,
    mouth:0x2a2015, tongueless:0x3a2a26,
    rope:0x3f3728, disc:0x4a4038, discTop:0x585047,
  };

  /* SPINE — gaunt, slightly hunched, upright humanoid */
  const S = {
    pelvis: V(0, 0.58, 0),
    waist:  V(0, 0.78, 0.01),
    chest:  V(-0.01, 1.02, 0.0),
    shldr:  V(-0.01, 1.16, -0.01),
    neck:   V(0, 1.26, -0.02),
    headB:  V(0, 1.34, -0.02),
  };

  /* ROBE BODY — a loose tapering column, wide hem at the bottom, narrowing to the shoulders */
  tube(S.pelvis, S.waist, 0.20, 0.165, 8, P.robe,   {phase:Math.PI/8, capA:{hex:P.hem, lift:0.02}});
  tube(S.waist,  S.chest, 0.165,0.150, 8, P.robeDk, {phase:Math.PI/8});
  tube(S.chest,  S.shldr, 0.150,0.135, 8, P.robe,   {phase:Math.PI/8});
  tube(S.shldr,  S.neck,  0.075,0.055, 6, P.skinDk, {phase:Math.PI/6});
  /* robe hem — flared wide skirt to the ground */
  {
    const hemTop=ring(V(0,0.44,0), V(0,1,0), 0.235, 0.20, 10, Math.PI/10);
    const hemBot=ring(V(0,0.06,0), V(0,1,0), 0.30, 0.25, 10, Math.PI/10);
    stitch([hemTop,hemBot], ()=>P.hem);
    capFan(hemBot, V(0,0.05,0), P.hem, true);
  }
  { const r=ring(S.pelvis, V(0,1,0), 0.205,0.17,8,Math.PI/8); capFan(r, V(0,0.50,0), P.hem, true); }
  /* frayed dirt-caked ragged edge quads along the hem */
  for(let i=0;i<6;i++){
    const ang=(i/6)*Math.PI*2;
    const x=Math.cos(ang)*0.28, z=Math.sin(ang)*0.24;
    quad(V(x-0.02,0.10,z-0.02), V(x+0.02,0.10,z+0.02), V(x+0.015,0.03,z+0.015), V(x-0.015,0.03,z-0.015), P.hem, 0.08);
  }
  /* rope cinch at the waist */
  quad(V(-0.17,0.76,-0.02), V(0.17,0.76,-0.02), V(0.16,0.72,0.14), V(-0.16,0.72,0.14), P.rope, 0.04);

  /* HOOD — draped over the head, shadowing the face; the head sits recessed within */
  {
    const n=8, ph=Math.PI/n;
    /* skull/face bands, recessed */
    const bands=[
      {y:1.24, cz:-0.01, rx:0.062, rz:0.062, hex:P.skinDk},
      {y:1.32, cz:0.0,   rx:0.068, rz:0.068, hex:P.skin},
      {y:1.38, cz:0.0,   rx:0.058, rz:0.058, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.42,-0.01), P.skinDk);
    /* gaunt jaw */
    const jawT=V(0,1.24,0.01), jawB=V(0,1.18,0.005);
    tube(jawT, jawB, 0.05, 0.038, n, P.skin, {raz:0.055, rbz:0.04, phase:ph, capB:{hex:P.skinDk, lift:0.008}});
    /* sunken eye sockets — dark carved, no eye quads */
    for(const s of [-1,1]) quad(V(s*0.028,1.335,0.052), V(s*0.046,1.335,0.052),
                                 V(s*0.042,1.31,0.05), V(s*0.032,1.31,0.05), P.socket, 0.02);
    /* muttering open mouth — the DEAD TONGUE detail: a dark hollow where a tongue should be */
    quad(V(-0.024,1.20,0.05), V(0.024,1.20,0.05), V(0.018,1.185,0.052), V(-0.018,1.185,0.052), P.mouth, 0.03);
    quad(V(-0.012,1.195,0.05), V(0.012,1.195,0.05), V(0.009,1.19,0.048), V(-0.009,1.19,0.048), P.tongueless, 0.02);

    /* HOOD shell — an outer draped cone shadowing the whole head, open at the front */
    const hoodTop=ring(V(0,1.44,-0.03), V(0,1,0), 0.03, 0.03, n, ph);
    const hoodMid=ring(V(0,1.36,-0.06), V(0,1,0), 0.095,0.10, n, ph);
    const hoodLow=ring(V(0,1.14,-0.02), V(0,1,0), 0.115,0.115, n, ph);
    stitch([hoodTop,hoodMid], ()=>P.hood);
    stitch([hoodMid,hoodLow], ()=>P.robeDk);
    /* hood peak cap */
    capFan(hoodTop, V(0,1.46,-0.03), P.hood);
  }

  /* ARMS — thin withered, both raised forward/up in a muttered invocation gesture */
  {
    const invokeArm=(x, sign)=>{
      const sh=V(x, 1.10, 0.0);
      const el=V(x*1.4, 1.02, 0.18);
      const wr=V(x*1.1, 1.18, 0.32);
      const hd=V(x*0.9, 1.28, 0.36);
      tube(sh, el, 0.052, 0.038, 6, P.robe);
      tube(el, wr, 0.034, 0.026, 6, P.skinDk);
      tube(wr, hd, 0.026, 0.016, 5, P.skin, {capB:{hex:P.skin, lift:0.008}});
      /* splayed gaunt fingers */
      for(const [dx,dy] of [[-0.02,0.05],[0,0.06],[0.02,0.05]]){
        tube(hd, V(hd.x+dx, hd.y+dy, hd.z+0.03), 0.007, 0.003, 3, P.skinDk, {capB:{hex:P.skinDk, lift:0.003}});
      }
      /* draped sleeve cuff */
      quad(V(x*1.25-0.06,1.05,0.12), V(x*1.25+0.06,1.05,0.12), V(x*1.05+0.04,0.96,0.06), V(x*1.05-0.04,0.96,0.06), P.robeDk, 0.05);
    };
    invokeArm(-0.16, -1); invokeArm(0.16, 1);
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
