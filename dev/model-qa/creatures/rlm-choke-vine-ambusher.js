/* dev/model-qa/creatures/rlm-choke-vine-ambusher.js — CHOKE-VINE AMBUSHER
   (lost-world, Medium Plant, CR 0.5). Read: a creeping vine blight rooted in cracked temple
   flagstone — a knotted root-mass base, a coiling central vine-trunk rising and looping like
   a snake, several thinner tendrils splayed to grab, and a toothed "maw" of woody thorns at
   the head-end that snaps. VS-desaturated sickly jungle green over stone-grey rooting.
   Whole-object grammar: one function, one frame, no anchors. Medium, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildChokeVineAmbusher(){
  const P = {
    vine:0x4a5a34, vineDk:0x333f22, vineLt:0x64753f,
    leaf:0x556b2f, leafDk:0x3c4d1f,
    root:0x5c5648, rootDk:0x413d32,
    stone:0x6b665a, crack:0x2e2b24,
    thorn:0xcfc79a, thornDk:0x8f8860, maw:0x241f18,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ROOT MASS — knotted roots bursting up through cracked flagstone at the base */
  {
    const r1=ring(V(0,0.03,0), V(0,1,0), 0.30, 0.30, 10, Math.PI/10);
    const r2=ring(V(0,0.09,0), V(0,1,0), 0.24, 0.24, 10, Math.PI/10);
    stitch([r1,r2], ()=>P.stone);
    /* cracked flagstone quads splitting outward */
    for(const [dx,dz] of [[0.24,0.05],[-0.20,0.10],[0.06,-0.24],[-0.10,-0.20]]){
      quad(V(0.02,0.032,0.02), V(dx*0.9,0.028,dz*0.9), V(dx,0.030,dz), V(0.03,0.034,0.03), P.crack, 0.05);
    }
    /* gnarled root knuckles poking from the stone ring */
    for(const [x,z] of [[0.20,0.10],[-0.18,0.12],[0.10,-0.20],[-0.14,-0.16],[0.02,0.24]]){
      const b=V(x,0.07,z), t=V(x*1.15,0.16,z*1.15);
      tube(b,t,0.045,0.026,6,P.root,{capB:{hex:P.rootDk,lift:0.01}});
    }
  }

  /* CENTRAL VINE-TRUNK — coils up out of the root mass like a rearing snake, an S-curve */
  const S = {
    base: V(0.02, 0.10, 0.02),
    r1:   V(0.10, 0.30, -0.06),
    r2:   V(0.02, 0.52, -0.10),
    r3:   V(-0.08, 0.72, 0.02),
    r4:   V(-0.04, 0.90, 0.14),
    head: V(0.02, 1.00, 0.20),
  };
  tube(S.base, S.r1, 0.115, 0.100, 8, P.vine,   {phase:Math.PI/8, capA:{hex:P.vineDk,lift:0.02}});
  tube(S.r1,   S.r2, 0.100, 0.086, 8, P.vineDk, {phase:Math.PI/8});
  tube(S.r2,   S.r3, 0.086, 0.072, 8, P.vine,   {phase:Math.PI/8});
  tube(S.r3,   S.r4, 0.072, 0.058, 8, P.vineLt, {phase:Math.PI/8});
  tube(S.r4,   S.head,0.058,0.048, 8, P.vine,   {phase:Math.PI/8});

  /* woody knots/bark ridges scattered along the trunk */
  for(const p of [S.r1,S.r2,S.r3]){
    quad(V(p.x-0.03,p.y+0.05,p.z-0.02), V(p.x+0.03,p.y+0.05,p.z-0.02), V(p.x+0.02,p.y-0.03,p.z+0.02), V(p.x-0.02,p.y-0.03,p.z+0.02), P.vineDk, 0.05);
  }

  /* HEAD — a toothed woody maw at the vine tip, thorns ringing an open bite */
  {
    const n=7, ph=Math.PI/n;
    const bands=[
      {y:0.94, cz:0.20, rx:0.062, rz:0.070, hex:P.vine},
      {y:1.02, cz:0.24, rx:0.072, rz:0.078, hex:P.vineLt},
      {y:1.08, cz:0.20, rx:0.058, rz:0.062, hex:P.vineDk},
    ];
    const rings=bands.map(b=>ring(V(0.02,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0.02,1.13,0.19), P.vineDk);
    /* dark maw shadow between upper and lower thorn rings */
    quad(V(-0.05,1.00,0.26), V(0.09,1.00,0.26), V(0.05,0.94,0.32), V(-0.02,0.94,0.32), P.maw, 0.03);
    /* ring of thorns around the maw opening */
    const thornPts = [[-0.05,1.02],[0.02,1.06],[0.09,1.02],[0.06,0.95],[-0.02,0.93]];
    for(const [tx,ty] of thornPts){
      const b=V(tx,ty,0.27), t=V(tx*1.3,ty+0.05,0.34);
      tube(b,t,0.018,0.003,4,P.thorn,{capB:{hex:P.thorn,lift:0.003}});
    }
  }

  /* TENDRILS — 3 thinner splayed vines reaching out from mid-trunk, leaf-tipped, to grab */
  {
    const tendril=(from, dx,dy,dz, hex)=>{
      const m = V(from.x+dx*0.5, from.y+dy*0.5, from.z+dz*0.5);
      const t = V(from.x+dx, from.y+dy, from.z+dz);
      tube(from, m, 0.034, 0.022, 5, hex);
      tube(m, t, 0.022, 0.008, 5, P.vineDk, {capB:{hex:P.vineDk, lift:0.004}});
      /* small leaf at the tip */
      quad(V(t.x-0.05,t.y,t.z), V(t.x+0.05,t.y,t.z), V(t.x+0.02,t.y+0.09,t.z+0.02), V(t.x-0.02,t.y+0.09,t.z+0.02), P.leaf, 0.06);
    };
    tendril(S.r2, 0.34,0.10,-0.10, P.vine);
    tendril(S.r2, -0.30,0.06,0.14, P.vineLt);
    tendril(S.r3, 0.24,-0.06,0.28, P.vine);
  }

  /* scattered dark broad leaves along the lower trunk for plant-read */
  for(const [p,s] of [[S.base,-1],[S.r1,1],[S.r2,-1]]){
    const bx=p.x+s*0.10, by=p.y+0.02, bz=p.z-0.02;
    quad(V(bx-0.06,by,bz), V(bx+0.06,by,bz), V(bx+0.03,by+0.14,bz+0.04), V(bx-0.03,by+0.14,bz+0.04), P.leafDk, 0.06);
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
