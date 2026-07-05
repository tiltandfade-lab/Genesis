/* dev/model-qa/creatures/rlm-the-unfinished-cathedral-made-flesh.js — THE UNFINISHED
   CATHEDRAL-MADE-FLESH (cosmic, Gargantuan, CR 16). Read: a cathedral's worth of drowned masonry —
   flying buttresses, broken arches, a rose-window socket, gargoyle stubs — animated into one
   lurching hunched shape, stone fused with wet flesh-sinew at the joints. VS-desaturated wet grey
   stone / drowned-green moss / dark wet sinew. NO eye quads — the rose-window socket reads as a
   dark hollow, not an eye. Whole-object grammar, one merged frame. Gargantuan disc r=0.72. */
import { THREE, V, quad, tube, ring, stitch, capFan, spotHash } from '../probe-lib.js';

export function buildTheUnfinishedCathedralMadeFlesh(){
  const P = {
    stone:0x5a5d55, stoneDk:0x393b34, stoneLt:0x74786c,
    moss:0x4a5640, mossDk:0x2e3628,
    sinew:0x4a3530, sinewDk:0x2c1f1c,                          // wet dark flesh-sinew at joints
    wet:0x353a38,                                              // waterlogged dark stains
    hollow:0x18181a,                                           // rose-window socket, dark hollow
    glass:0x5c6a68,                                            // grimed stained-glass shards remaining
    disc:0x2e2f2a, discTop:0x3e4038,
  };

  /* ---------- HUNCHED SPINE — a lurching stooped stone torso, spine bent forward like a beast. -- */
  const S = {
    base:  V(0, 0.30, -0.10),
    hip:   V(0.02, 0.75, -0.08),
    spine: V(-0.04, 1.25, 0.05),
    chest: V(0.03, 1.65, 0.22),          // stooped forward (+z lean)
    neck:  V(-0.02, 1.95, 0.36),
    head:  V(0.0,  2.20, 0.44),
  };
  {
    const n=12, ph=Math.PI/n;
    tube(S.base, S.hip,   0.42, 0.50, n, P.stone,   {phase:ph});
    tube(S.hip, S.spine,  0.50, 0.56, n, P.stoneDk, {phase:ph});
    tube(S.spine, S.chest,0.56, 0.48, n, P.stone,   {phase:ph});
    tube(S.chest, S.neck, 0.48, 0.30, n, P.stoneLt, {phase:ph});
    tube(S.neck, S.head,  0.30, 0.22, n, P.stoneDk, {phase:ph});
  }

  /* ---------- ROSE-WINDOW SOCKET — a dark stone-ringed hollow set in the chest, tattered grimed
     glass shards still in its frame, reading as a wound/hollow, never an eye. ---------- */
  {
    const cz = S.chest.z + 0.02, cy = S.chest.y - 0.02;
    const n=12, ph=Math.PI/n;
    const rim1 = ring(V(0.03,cy,cz), V(0,0,1), 0.30, 0.30, n, ph);
    const rim2 = ring(V(0.03,cy,cz+0.08), V(0,0,1), 0.24, 0.24, n, ph);
    stitch([rim1,rim2], ()=>P.stoneDk);
    capFan(rim2, V(0.03,cy,cz+0.10), P.hollow);
    // a few grimed glass shard fragments still caught in the tracery
    for(let i=0;i<5;i++){
      const a=(i/5)*Math.PI*2;
      const rx=Math.cos(a)*0.16, ry=Math.sin(a)*0.16;
      quad(V(0.03+rx-0.03,cy+ry,cz+0.06), V(0.03+rx+0.03,cy+ry,cz+0.06),
           V(0.03+rx*0.5,cy+ry*0.5,cz+0.09), V(0.03+rx*0.5,cy+ry*0.5,cz+0.09), P.glass, 0.10);
    }
  }

  /* ---------- HEAD — a broken gable-arch skull shape, mossy, water-stained, no eyes. ---------- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:S.head.y-0.14, cz:S.head.z-0.02, rx:0.22, rz:0.20, hex:P.stone},
      {y:S.head.y+0.05, cz:S.head.z+0.02, rx:0.20, rz:0.18, hex:P.stoneLt},
      {y:S.head.y+0.22, cz:S.head.z-0.01, rx:0.12, rz:0.11, hex:P.stoneDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, i=>bands[i].hex);
    capFan(rings.at(-1), V(0, S.head.y+0.34, S.head.z-0.02), P.stoneDk);
    // gable-peak (gothic arch point) atop the head
    const peakB = V(0, S.head.y+0.30, S.head.z);
    const peakT = V(0, S.head.y+0.52, S.head.z-0.02);
    tube(peakB, peakT, 0.10, 0.01, 6, P.stoneDk, {capB:{hex:P.stoneDk, lift:0.01}});
    // moss streaks
    quad(V(-0.18,S.head.y-0.10,S.head.z-0.14), V(-0.10,S.head.y-0.10,S.head.z-0.14),
         V(-0.08,S.head.y+0.14,S.head.z-0.10), V(-0.16,S.head.y+0.14,S.head.z-0.10), P.moss, 0.08);
  }

  /* ---------- FLYING BUTTRESS ARMS — two great stone buttress-arches serving as arms, arcing out
     and down to plant "flying" supports on the ground, sinew-fused at the shoulder joints. ------ */
  for(const s of [-1,1]){
    const shB = V(s*0.42, S.chest.y+0.05, S.chest.z-0.05);
    const arcM = V(s*0.85, S.chest.y-0.30, S.chest.z-0.20);
    const arcT = V(s*1.05, S.chest.y-0.75, S.chest.z-0.10);
    const foot = V(s*0.95, 0.06, S.chest.z-0.35);
    // sinew joint at shoulder (dark wet flesh binding stone to torso)
    tube(V(s*0.30,S.chest.y+0.08,S.chest.z-0.02), shB, 0.12, 0.16, 7, P.sinewDk, {phase:Math.PI/7});
    tube(shB, arcM, 0.18, 0.14, 9, P.stone,   {phase:Math.PI/9});
    tube(arcM, arcT, 0.14, 0.10, 9, P.stoneDk,{phase:Math.PI/9});
    tube(arcT, foot, 0.10, 0.16, 9, P.stone,  {phase:Math.PI/9, capB:{hex:P.stoneDk, lift:0.02}});
    // gargoyle stub at the arc's peak
    const gTip = V(arcM.x+s*0.10, arcM.y+0.14, arcM.z+0.10);
    tube(arcM, gTip, 0.06, 0.02, 5, P.stoneDk, {capB:{hex:P.wet, lift:0.01}});
  }

  /* ---------- LEGS — squat buttressed stone stumps, hunched, sinew-wet at the knee joints. ------ */
  for(const s of [-1,1]){
    const hip = V(s*0.22, S.base.y+0.05, S.base.z);
    const knee = V(s*0.28, 0.16, S.base.z+0.10);
    const foot = V(s*0.30, 0.02, S.base.z+0.06);
    tube(hip, knee, 0.24, 0.20, 8, P.stone, {phase:Math.PI/8});
    tube(knee, foot, 0.20, 0.24, 8, P.sinewDk, {phase:Math.PI/8, capB:{hex:P.stoneDk, lift:0.02}});
  }

  /* ---------- moss + wet-stain patchwork across the whole body ---------- */
  {
    const spots=[[S.hip,-0.20],[S.spine,0.18],[S.base,0.10]];
    spots.forEach(([pt,dx],si)=>{
      // deterministic per-spot moss/wet pick (fixed forever per spot, not re-rolled per build)
      quad(V(pt.x+dx-0.06,pt.y-0.10,pt.z-0.06), V(pt.x+dx+0.06,pt.y-0.10,pt.z-0.06),
           V(pt.x+dx+0.05,pt.y+0.10,pt.z-0.04), V(pt.x+dx-0.05,pt.y+0.10,pt.z-0.04), (spotHash("moss:"+si) % 2 === 0?P.moss:P.wet), 0.10);
    });
  }

  /* ---------- base disc (Gargantuan: r=0.72) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.71, 0.71, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.021,0), P.discTop, true);
  }
}
