/* dev/model-qa/creatures/rlm-the-sermon-bearer.js — THE SERMON-BEARER (ash realm, Medium biped,
   CR 6). No bespoke model needed (uses the priest stat frame only) — this module dresses that
   silhouette as a robed zealot: a heavy hooded ash-grey cassock cinched with a rope-cord belt, a
   warhead-fragment icon (a jagged scorched fin-shard) held reverently on a chain at the chest and
   also carried raised in one hand like a holy relic, ash-smeared bare feet, a censer swinging a
   thread of grey smoke. Whole-object grammar, one merged frame, no anchors. NO eye quads — a deep
   hood shadow instead. VS-desaturated ash palette, dead ordnance-yellow icon accent. Base disc
   r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTheSermonBearer(){
  /* ---------- PALETTE (ash-grey cassock, rope-cord, scorched-fin icon accent) ---------- */
  const P = {
    skin:0x8a7458, skinDk:0x584a38,
    robe:0x565248, robeDk:0x38352c, robeLt:0x6c675a,          // ash-grey cassock
    hood:0x2c2a24,                                              // deep hood shadow
    rope:0x6e5c3e, ropeDk:0x483c28,                             // rope-cord belt
    icon:0x8a7a2e, iconDk:0x5c501f, iconEdge:0x3a3122,          // warhead-fragment relic (dead ordnance-yellow)
    smoke:0x8a887e,
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — tall, gaunt, hooded figure ~1.72u tall (priest frame proportions). ---------- */
  const S = {
    hip:    V(0, 0.88, 0),
    waist:  V(0, 1.06, 0.01),
    chest:  V(0, 1.32, 0.02),
    shldr:  V(0, 1.49, 0.00),
    neck:   V(0, 1.57, 0.00),
    headB:  V(0, 1.63, -0.01),
    headT:  V(0, 1.82, -0.02),
  };

  /* ---------- ROBE — a single heavy loft from hem to hood, no separate torso read (cassock silhouette). ---------- */
  {
    const rHem = ring(V(0,0.30,0), V(0,1,0), 0.29, 0.27, 10, Math.PI/10);
    const rHip = ring(V(0,S.hip.y,0), V(0,1,0), 0.215, 0.20, 10, Math.PI/10);
    const rWst = ring(V(0,S.waist.y,0.01), V(0,1,0), 0.185, 0.175, 10, Math.PI/10);
    const rChs = ring(V(0,S.chest.y,0.02), V(0,1,0), 0.225, 0.205, 10, Math.PI/10);
    const rShd = ring(V(0,S.shldr.y,0.00), V(0,1,0), 0.205, 0.19, 10, Math.PI/10);
    const rNck = ring(V(0,S.neck.y,0.00), V(0,1,0), 0.095, 0.09, 10, Math.PI/10);
    const rings=[rHem,rHip,rWst,rChs,rShd,rNck];
    const cols=[P.robeDk,P.robe,P.robe,P.robeLt,P.robe,P.robeDk];
    stitch(rings, i=>cols[i]);
    capFan(rHem, V(0,0.28,0), P.robeDk, true);
    /* a ragged tattered hem edge — small triangular tears */
    for(const a of [0,2,4,6,8]){
      const p=rHem[a];
      quad(p, rHem[(a+1)%10], V(p.x*1.02,0.22,p.z*1.02), V(p.x*1.02,0.22,p.z*1.02), P.robeDk, 0.1);
    }
  }

  /* ROPE-CORD BELT cinched at the waist */
  {
    const r1=ring(V(0,1.09,0.01), V(0,1,0), 0.192, 0.182, 10, Math.PI/10);
    const r2=ring(V(0,1.13,0.01), V(0,1,0), 0.195, 0.185, 10, Math.PI/10);
    stitch([r1,r2], ()=>P.rope);
    /* hanging cord-tail with a frayed knot */
    tube(V(0.05,1.08,0.18), V(0.03,0.78,0.20), 0.016, 0.012, 5, P.ropeDk, {capB:{hex:P.ropeDk, lift:0.01}});
  }

  /* ---------- WARHEAD-FRAGMENT ICON on a chain at the chest — a jagged scorched fin-shard relic ---------- */
  {
    const cy=1.30, cz=0.24;
    tube(V(-0.10,1.48,0.10), V(0,cy+0.10,cz), 0.010, 0.008, 4, P.icon);
    tube(V(0.10,1.48,0.10), V(0,cy+0.10,cz), 0.010, 0.008, 4, P.icon);
    /* jagged fin-shard shape: two sharp tris fused edge to edge */
    quad(V(-0.07,cy+0.11,cz), V(0.02,cy+0.13,cz), V(0.03,cy-0.10,cz), V(-0.05,cy-0.04,cz), P.iconEdge, 0.05);
    quad(V(0.02,cy+0.13,cz), V(0.08,cy+0.06,cz), V(0.05,cy-0.11,cz), V(0.03,cy-0.10,cz), P.icon, 0.06);
    /* scorch mark on the relic face */
    quad(V(-0.02,cy+0.02,cz+0.002), V(0.02,cy+0.02,cz+0.002), V(0.01,cy-0.06,cz+0.002), V(-0.01,cy-0.06,cz+0.002), P.iconDk, 0.05);
  }

  /* ---------- HEAD — deep hood shadow, no visible eyes ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y+0.01, cz:0.00, rx:0.096, rz:0.098, hex:P.skinDk},
      {y:S.headB.y+0.08, cz:0.00, rx:0.100, rz:0.10, hex:P.skin},
      {y:S.headT.y-0.05, cz:-0.01,rx:0.088, rz:0.088, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headT.y, -0.01), P.skinDk);

    /* deep hood shell wrapping over the crown and down past the brow, casting shadow */
    const hR1 = ring(V(0,S.headB.y-0.02,0.00), V(0,1,0), 0.135, 0.135, n, ph);
    const hR2 = ring(V(0,S.headT.y+0.03,-0.02), V(0,1,0), 0.11, 0.10, n, ph);
    stitch([hR1,hR2], ()=>P.hood);
    capFan(hR2, V(0,S.headT.y+0.10,-0.03), P.hood);
    /* the hood's dark shadow-face plane, mouth suggestion only */
    quad(V(-0.075,S.headB.y+0.10,0.085), V(0.075,S.headB.y+0.10,0.085),
         V(0.06,S.headB.y-0.03,0.09), V(-0.06,S.headB.y-0.03,0.09), P.hood, 0.06);
    quad(V(-0.045,S.headB.y+0.01,0.088), V(0.045,S.headB.y+0.01,0.088),
         V(0.038,S.headB.y-0.02,0.086), V(-0.038,S.headB.y-0.02,0.086), P.skinDk, 0.05);
  }

  /* ---------- ARMS — one raised bearing the relic aloft, one swinging a censer ---------- */
  {
    const shL = V(-0.20, 1.46, 0.02), shR = V(0.20, 1.46, 0.02);
    const elL = V(-0.24, 1.58, 0.14);           // raised arm, elbow up
    const wrL = V(-0.14, 1.72, 0.20);
    const elR = V(0.25, 1.14, 0.10);
    const wrR = V(0.16, 0.90, 0.16);
    tube(shL, elL, 0.062, 0.050, 6, P.robe);
    tube(elL, wrL, 0.050, 0.040, 6, P.robeDk, {capB:{hex:P.skinDk, lift:0.02}});
    tube(shR, elR, 0.062, 0.050, 6, P.robe);
    tube(elR, wrR, 0.050, 0.040, 6, P.robeDk, {capB:{hex:P.skinDk, lift:0.02}});

    /* small fragment-shard held raised in the left hand (a second, smaller relic piece) */
    quad(V(wrL.x-0.03,wrL.y+0.10,wrL.z), V(wrL.x+0.03,wrL.y+0.11,wrL.z),
         V(wrL.x+0.02,wrL.y-0.04,wrL.z), V(wrL.x-0.02,wrL.y-0.02,wrL.z), P.icon, 0.06);

    /* CENSER on a chain from the right hand, swinging a thread of grey smoke */
    const censC = V(wrR.x+0.02, wrR.y-0.14, wrR.z+0.02);
    tube(wrR, censC, 0.008, 0.006, 4, P.ropeDk);
    blob(censC.x, censC.y, censC.z, 0.045, 0.04, 0.04, P.icon, 6, 3);
    tube(censC, V(censC.x+0.03,censC.y+0.20,censC.z), 0.015, 0.005, 5, P.smoke, {capB:{hex:P.smoke, lift:0.01}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
