/* dev/model-qa/creatures/rlm-petrifying-serpent-crowned-guardian.js — PETRIFYING
   SERPENT-CROWNED GUARDIAN (lost-world, Medium Construct, CR 3). Read: a stone-eyed guardian
   statue — a humanoid stone torso planted on a broken plinth-like lower body, a crown of small
   carved serpent heads ringing its brow, and two hollow glowing-pale STONE EYES (a carved
   petrifying-gaze feature — sculpted sockets with a pale glow disc, not a living eye quad).
   Fissures of spreading grey petrification crackle down one arm. VS-desaturated weathered
   grey-green stone. Whole-object grammar: one function, one frame, no anchors. Medium,
   base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildPetrifyingSerpentCrownedGuardian(){
  const P = {
    stone:0x6e7264, stoneDk:0x4c5040, stoneLt:0x898d78,
    moss:0x556b3e, crack:0x2c2e26,
    gaze:0xc9c3a0, gazeDk:0x8f8a6e,
    serp:0x525c44, serpDk:0x363d2a,
    petrify:0x9aa294,
    disc:0x4a4038, discTop:0x585047,
  };

  /* LOWER BODY — a broken plinth-like base the statue stands rooted on, then a stone torso */
  const S = {
    plinth:  V(0, 0.06, 0),
    hip:     V(0, 0.36, 0),
    waist:   V(0, 0.58, 0.01),
    chest:   V(0, 0.84, 0.0),
    neck:    V(0, 1.02, -0.01),
    headB:   V(0, 1.10, -0.01),
  };
  /* the plinth — a stubby weathered stone stump the "legs" fuse into, cracked at the top */
  tube(S.plinth, S.hip, 0.220, 0.180, 8, P.stoneDk, {phase:Math.PI/8});
  quad(V(-0.20,0.20,0.05), V(0.20,0.20,0.05), V(0.16,0.10,0.16), V(-0.16,0.10,0.16), P.crack, 0.04);
  tube(S.hip, S.waist, 0.180, 0.155, 8, P.stone,   {phase:Math.PI/8});
  tube(S.waist, S.chest,0.155, 0.185, 8, P.stoneLt,{phase:Math.PI/8});
  tube(S.chest, S.neck, 0.145, 0.085, 8, P.stone,  {phase:Math.PI/8});
  tube(S.neck, S.headB, 0.085, 0.078, 8, P.stoneDk,{phase:Math.PI/8});
  /* moss growth patch on the shoulder/chest */
  quad(V(0.08,0.90,0.10), V(0.15,0.94,0.09), V(0.14,1.00,0.08), V(0.07,0.96,0.09), P.moss, 0.06);

  /* HEAD — a carved stone face, blunt weathered features */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.08, cz:0, rx:0.085, rz:0.085, hex:P.stone},
      {y:1.18, cz:0.005, rx:0.095, rz:0.095, hex:P.stoneLt},
      {y:1.26, cz:0, rx:0.078, rz:0.078, hex:P.stoneDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.31,0.0), P.stoneDk);
    /* carved brow ridge */
    quad(V(-0.07,1.155,0.075), V(0.07,1.155,0.075), V(0.055,1.13,0.08), V(-0.055,1.13,0.08), P.stoneDk, 0.03);
    /* mouth groove */
    quad(V(-0.035,1.075,0.078), V(0.035,1.075,0.078), V(0.025,1.06,0.08), V(-0.025,1.06,0.08), P.crack, 0.03);

    /* STONE EYES — the petrifying-gaze feature: carved hollow sockets with a pale glow disc */
    for(const s of [-1,1]){
      const cx=s*0.038, cy=1.185, cz=0.078;
      quad(V(cx-0.020,cy+0.014,cz), V(cx+0.020,cy+0.014,cz), V(cx+0.018,cy-0.014,cz+0.004), V(cx-0.018,cy-0.014,cz+0.004), P.stoneDk, 0.02);
      quad(V(cx-0.012,cy+0.008,cz+0.006), V(cx+0.012,cy+0.008,cz+0.006), V(cx+0.010,cy-0.008,cz+0.008), V(cx-0.010,cy-0.008,cz+0.008), P.gaze, 0.02);
    }
  }

  /* SERPENT CROWN — a ring of small carved serpent heads circling the brow, rearing outward */
  {
    const n=6;
    for(let i=0;i<n;i++){
      const ang = (i/n)*Math.PI*2;
      const cx=Math.sin(ang)*0.10, cz=Math.cos(ang)*0.10*0.9;
      const base = V(cx*0.7, 1.25, cz*0.7+0.02);
      const rise = V(cx*1.3, 1.34, cz*1.3+0.02);
      const head = V(cx*1.5, 1.37, cz*1.5+0.05);
      tube(base, rise, 0.020, 0.014, 5, P.serp);
      tube(rise, head, 0.014, 0.016, 5, P.serpDk, {capB:{hex:P.serpDk, lift:0.004}});
      /* tiny hood-flare quad reading as a rearing serpent hood */
      quad(V(head.x-0.014,head.y,head.z), V(head.x+0.014,head.y,head.z), V(head.x+0.010,head.y+0.014,head.z-0.006), V(head.x-0.010,head.y+0.014,head.z-0.006), P.serp, 0.05);
    }
  }

  /* ARMS — one arm bearing a spreading fissure of grey petrification cracks */
  {
    /* right arm — normal stone */
    const rsh=V(0.155,0.90,0), rel=V(0.20,0.62,0.02), rhd=V(0.17,0.38,0.03);
    tube(rsh,rel,0.058,0.046,6,P.stone);
    tube(rel,rhd,0.046,0.036,6,P.stoneDk,{capB:{hex:P.stoneDk, lift:0.008}});

    /* left arm — the petrification-marked arm, held out with cracked spreading grey veins */
    const lsh=V(-0.155,0.90,0), lel=V(-0.20,0.64,0.06), lhd=V(-0.24,0.44,0.16);
    tube(lsh,lel,0.058,0.046,6,P.petrify);
    tube(lel,lhd,0.046,0.032,6,P.petrify,{capB:{hex:P.stoneDk, lift:0.008}});
    /* fissure crack lines running down the marked arm */
    for(const t of [0.2,0.5,0.8]){
      const x=lsh.x+(lel.x-lsh.x)*t, y=lsh.y+(lel.y-lsh.y)*t, z=lsh.z+(lel.z-lsh.z)*t;
      quad(V(x-0.03,y+0.02,z), V(x+0.005,y-0.01,z+0.01), V(x+0.01,y-0.03,z+0.01), V(x-0.025,y-0.005,z), P.crack, 0.05);
    }
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
