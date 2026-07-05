/* dev/model-qa/creatures/rlm-the-goblin-toymaker.js — THE GOBLIN TOYMAKER (bright-kingdom, Small,
   CR 2). A hunched goblin tinker hung with keys, spare parts, and a whistle. Read: a small
   hunched goblin humanoid, long ears, a leather tinker's apron cluttered with hung brass keys /
   gears / spare wooden limb-parts, a whistle on a cord at the neck, and a wrench/screwdriver
   tool held in one clawed hand. No eye quads (dark socket recesses). Whole-object grammar, one
   merged frame, no anchors. Small disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheGoblinToymaker(){
  const P = {
    skin:0x6e7d4a, skinDk:0x4a5632, skinLt:0x8a9863,
    apron:0x6b4a30, apronDk:0x462f1e,
    brass:0x9c7d3a, brassDk:0x6e5626, gear:0x71675a,
    wood:0x8a6f4a, woodDk:0x5e4a30,
    cord:0x4a3f2e, whistle:0xa89060,
    claw:0x241f19,
    disc:0x3a3226, discTop:0x453c2e,
  };

  const spY = 0.24;
  /* ---------- TORSO — small hunched goblin body, forward-curved spine (tinker's hunch). -------- */
  const bands=[
    {y:0.02, cz:0.00, rx:0.100, hex:P.skinDk},
    {y:0.14, cz:0.01, rx:0.108, hex:P.apronDk},
    {y:0.28, cz:0.03, rx:0.115, hex:P.apron},   // apron chest, cluttered
    {y:0.40, cz:0.06, rx:0.088, hex:P.apronDk},
    {y:0.48, cz:0.09, rx:0.062, hex:P.skin},    // hunched neck, leaning forward
  ];
  {
    const n=8, ph=Math.PI/n;
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,0.01,0), P.skinDk, true);
  }
  // apron pocket flap
  quad(V(-0.06,0.16,0.11), V(0.06,0.16,0.11), V(0.05,0.06,0.115), V(-0.05,0.06,0.115), P.apronDk, 0.05);

  /* ---------- HEAD — narrow goblin skull, long pointed ears, dark socket recesses. -------------- */
  {
    const n=8, ph=Math.PI/n;
    const hb=[
      {y:0.52, cz:0.10, rx:0.068, rz:0.072, hex:P.skin},
      {y:0.61, cz:0.12, rx:0.072, rz:0.068, hex:P.skinLt},
      {y:0.70, cz:0.09, rx:0.055, rz:0.058, hex:P.skinDk},
    ];
    const rings = hb.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>hb[b].hex);
    capFan(rings.at(-1), V(0,0.72,0.09), P.skinDk);

    // pointed goblin nose/snout
    const snB=V(0,0.575,0.165), snT=V(0,0.565,0.235);
    tube(snB, snT, 0.030, 0.010, n, P.skin, {phase:ph, capB:{hex:P.skinDk, lift:0.004}});
    // dark socket recesses (no eye quads)
    for(const s of [-1,1]){
      const sx=s*0.036, sy=0.625, sz=0.155;
      quad(V(sx-0.013,sy+0.010,sz), V(sx+0.013,sy+0.010,sz), V(sx+0.010,sy-0.010,sz+0.004), V(sx-0.010,sy-0.010,sz+0.004), P.skinDk, 0.04);
    }
    // long pointed ears sweeping back
    for(const s of [-1,1]){
      const eb=V(s*0.06,0.63,0.06), et=V(s*0.16,0.60,-0.10);
      tube(eb, et, 0.026, 0.006, 5, P.skin, {capB:{hex:P.skinDk, lift:0.004}});
    }
  }

  /* ---------- WHISTLE — on a cord at the neck, hanging over the apron. ---------------------------- */
  {
    const cb=V(0,0.485,0.10), ct=V(0,0.38,0.14);
    tube(cb, ct, 0.006, 0.006, 4, P.cord);
    const wb=V(0,0.36,0.145), wt=V(0,0.335,0.15);
    tube(wb, wt, 0.018, 0.010, 5, P.whistle, {capB:{hex:P.brassDk, lift:0.004}});
  }

  /* ---------- HUNG CLUTTER — brass keys / gears / spare wooden limb-parts hanging off the apron. */
  {
    const dangle=(ax,ay,az, hex, kind)=>{
      const cb=V(ax,ay,az), ct=V(ax,ay-0.10,az+0.01);
      tube(cb, ct, 0.004, 0.004, 3, P.cord);
      if(kind==='key'){
        const kb=ct, kt=V(ax,ay-0.16,az+0.01);
        tube(kb, kt, 0.010, 0.006, 4, hex, {capB:{hex, lift:0.003}});
        // key bow ring
        const r0=ring(V(ax,ay-0.095,az+0.01), V(0,0,1), 0.014, 0.014, 5);
        capFan(r0, V(ax,ay-0.095,az+0.005), hex);
      } else if(kind==='gear'){
        const r0=ring(ct, V(0,0,1), 0.020, 0.020, 6);
        const r1=ring(V(ct.x,ct.y-0.008,ct.z), V(0,0,1), 0.020, 0.020, 6, Math.PI/6);
        stitch([r0,r1], ()=>hex);
        capFan(r1, V(ct.x,ct.y-0.010,ct.z), hex, true);
      } else {
        const pt=V(ax,ay-0.16,az+0.005);
        tube(ct, pt, 0.010, 0.006, 4, hex, {capB:{hex, lift:0.003}});
      }
    };
    dangle(-0.095, 0.30, 0.12, P.brass, 'key');
    dangle(-0.05, 0.24, 0.135, P.gear, 'gear');
    dangle(0.06, 0.28, 0.13, P.wood, 'part');
    dangle(0.10, 0.20, 0.12, P.brassDk, 'key');
  }

  /* ---------- ARMS — one holding a wrench/screwdriver tool, one hanging with a clawed hand. ---- */
  {
    const sh1 = V(0.10, 0.46, 0.04);
    const el1 = V(0.16, 0.32, 0.14);
    const hd1 = V(0.20, 0.22, 0.22);
    tube(sh1, el1, 0.034, 0.026, 6, P.skin);
    tube(el1, hd1, 0.026, 0.018, 6, P.skinDk, {capB:{hex:P.claw, lift:0.008}});
    // tool: a small wrench-like haft with a forked head
    const tB=hd1, tT=V(0.24,0.32,0.26);
    tube(tB, tT, 0.014, 0.010, 5, P.woodDk);
    for(const s of [-1,1]){
      const fk=V(0.24+s*0.02, 0.36, 0.27);
      tube(tT, fk, 0.010, 0.004, 4, P.brass);
    }

    const sh2 = V(-0.10, 0.44, 0.04);
    const el2 = V(-0.14, 0.28, 0.08);
    const hd2 = V(-0.16, 0.16, 0.10);
    tube(sh2, el2, 0.034, 0.026, 6, P.skin);
    tube(el2, hd2, 0.026, 0.018, 6, P.skinDk, {capB:{hex:P.claw, lift:0.008}});
    // clawed fingertips
    for(const dx of [-0.012,0,0.012]){
      const cb=V(hd2.x+dx, hd2.y-0.01, hd2.z+0.01), ct=V(hd2.x+dx*1.4, hd2.y-0.03, hd2.z+0.03);
      tube(cb, ct, 0.006, 0.002, 3, P.claw, {capB:{hex:P.claw, lift:0.002}});
    }
  }

  /* ---------- LEGS — short bowed goblin legs, small stance. ---------- */
  {
    const leg=(hip,knee,foot,hex)=>{
      tube(hip, knee, 0.044, 0.036, 6, hex);
      tube(knee, foot, 0.036, 0.028, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.006}});
    };
    leg(V(-0.05,0.03,0.02), V(-0.07,0.13,0.09), V(-0.06,0.03,0.10), P.apronDk);
    leg(V( 0.05,0.03,0.02), V( 0.07,0.13,0.09), V( 0.06,0.03,0.10), P.apronDk);
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.30, 0.30, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
