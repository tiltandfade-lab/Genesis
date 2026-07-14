/* dev/model-qa/creatures/rlm-the-mouse-kings-sentry.js — THE MOUSE KING'S SENTRY (bright-kingdom,
   Medium, CR 1). A scrawny multi-headed mouse-courtier in a torn paper crown. Read: an upright
   scrawny mouse-humanoid in tattered courtier rags, a MAIN head plus two smaller vestigial heads
   sprouting from the shoulders (the multi-headed tell), a crumpled paper crown, a long bare tail
   trailing behind, and a rusty little sentry-pike held upright. No eye quads (dark socket
   recesses on all three heads). Whole-object grammar, one merged frame, no anchors. Medium
   disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheMouseKingsSentry(){
  const P = {
    fur:0x6e6558, furDk:0x4a4438, furLt:0x8a8070,
    furPale:0xa89e88,
    rag:0x7a6a4a, ragDk:0x50442e,
    paper:0xc9bd94, paperDk:0x9a8f6c,
    ear:0x7f7566, tail:0x6a6154,
    metal:0x716a5e, metalDk:0x4a453c, wood:0x4a3a28,
    disc:0x463c2f, discTop:0x554839,
  };

  const spY = 0.56;
  /* ---------- TORSO — scrawny upright mouse body in torn courtier rags. ---------- */
  const bands=[
    {y:0.04,  rx:0.075, hex:P.furDk},
    {y:0.22,  rx:0.082, hex:P.ragDk},
    {y:0.40,  rx:0.088, hex:P.rag},      // ragged tunic chest
    {y:0.58,  rx:0.070, hex:P.ragDk},
    {y:0.70,  rx:0.052, hex:P.fur},      // scrawny neck
  ];
  {
    const n=8, ph=Math.PI/n;
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,0.02,0), P.furDk, true);
  }
  // torn rag hem flaps at the waist
  for(const s of [-1,1]) quad(V(s*0.05,0.24,0.06), V(s*0.08,0.10,0.09), V(s*0.10,0.06,0.06), V(s*0.06,0.20,0.04), P.ragDk, 0.06);

  /* ---------- helper: build one mouse head (main or small vestigial) at a given anchor/scale. --- */
  function mouseHead(base, scale, hex, hexLt, crowned){
    const n=8, ph=Math.PI/n;
    const hb=[
      {y:base.y+0.02*scale,  cz:base.z-0.01, rx:0.062*scale, rz:0.066*scale, hex},
      {y:base.y+0.10*scale,  cz:base.z+0.005,rx:0.068*scale, rz:0.064*scale, hex:hexLt},
      {y:base.y+0.18*scale,  cz:base.z-0.01, rx:0.050*scale, rz:0.052*scale, hex},
    ];
    const rings = hb.map(b=>ring(V(base.x,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>hb[b].hex);
    capFan(rings.at(-1), V(base.x, base.y+0.20*scale, base.z-0.01), hex);
    // pointed muzzle
    const snB = V(base.x, base.y+0.03*scale, base.z+0.055*scale);
    const snT = V(base.x, base.y+0.01*scale, base.z+0.12*scale);
    tube(snB, snT, 0.036*scale, 0.010*scale, 6, hex, {phase:ph, capB:{hex:P.metalDk, lift:0.004*scale}});
    // dark socket recesses, no eye quads
    for(const s of [-1,1]){
      const sx=base.x+s*0.036*scale, sy=base.y+0.13*scale, sz=base.z+0.03*scale;
      quad(V(sx-0.011*scale,sy+0.008*scale,sz), V(sx+0.011*scale,sy+0.008*scale,sz), V(sx+0.009*scale,sy-0.008*scale,sz+0.003), V(sx-0.009*scale,sy-0.008*scale,sz+0.003), P.furDk, 0.04);
    }
    // round mouse ears
    for(const s of [-1,1]){
      const eb=V(base.x+s*0.045*scale, base.y+0.19*scale, base.z-0.03);
      const r0=ring(eb, V(0,0,1), 0.026*scale, 0.026*scale, 6);
      capFan(r0, V(eb.x, eb.y, eb.z-0.015*scale), P.ear);
    }
    if(crowned){
      // crumpled paper crown — a jagged low ring of paper points
      const cb = ring(V(base.x, base.y+0.205*scale, base.z-0.01), V(0,1,0), 0.052*scale, 0.054*scale, 6, ph);
      for(let i=0;i<cb.length;i++){
        const p0=cb[i], p1=cb[(i+1)%cb.length];
        const mx=(p0.x+p1.x)/2, mz=(p0.z+p1.z)/2;
        quad(p0, p1, V(mx,p0.y+0.06*scale,mz), V(mx,p0.y+0.06*scale,mz), i%2? P.paper:P.paperDk, 0.06);
      }
      capFan(cb, V(base.x, base.y+0.20*scale, base.z-0.01), P.paperDk, true);
    }
  }

  // main head, crowned
  mouseHead(V(0, 0.72, 0.02), 1.0, P.fur, P.furLt, true);
  // two smaller vestigial heads sprouting from the shoulders — the multi-headed tell
  mouseHead(V(-0.13, 0.58, -0.02), 0.62, P.furDk, P.fur, false);
  mouseHead(V( 0.14, 0.56, -0.03), 0.58, P.furDk, P.fur, false);

  /* ---------- ARMS — one gripping a rusty sentry-pike, the other slack at its side. ------------- */
  {
    const sh1 = V(0.095, 0.52, 0.02);
    const el1 = V(0.15, 0.36, 0.08);
    const hd1 = V(0.16, 0.24, 0.12);
    tube(sh1, el1, 0.030, 0.024, 6, P.rag);
    tube(el1, hd1, 0.024, 0.018, 6, P.fur, {capB:{hex:P.furDk, lift:0.008}});
    // sentry pike: wooden haft rising past the head + a rough spearhead
    const phB = hd1, phT = V(0.18, 1.10, 0.16);
    tube(phB, phT, 0.018, 0.012, 6, P.wood);
    const spB = phT, spT = V(0.185, 1.28, 0.165);
    tube(spB, spT, 0.020, 0.003, 5, P.metal, {capB:{hex:P.metalDk, lift:0.004}});

    const sh2 = V(-0.095, 0.50, 0.02);
    const el2 = V(-0.13, 0.36, 0.06);
    const hd2 = V(-0.14, 0.24, 0.08);
    tube(sh2, el2, 0.030, 0.024, 6, P.rag);
    tube(el2, hd2, 0.024, 0.018, 6, P.fur, {capB:{hex:P.furDk, lift:0.008}});
  }

  /* ---------- LEGS — scrawny legs, small bare feet. ---------- */
  {
    const leg=(hip,knee,foot,hex)=>{
      tube(hip, knee, 0.036, 0.026, 6, hex);
      tube(knee, foot, 0.026, 0.020, 6, P.furDk, {capB:{hex:P.furDk, lift:0.006}});
    };
    leg(V(-0.04,0.05,0.00), V(-0.045,0.22,0.03), V(-0.045,0.03,0.04), P.rag);
    leg(V( 0.04,0.05,0.01), V( 0.045,0.22,0.04), V( 0.045,0.03,0.05), P.rag);
  }

  /* ---------- TAIL — long bare tail trailing back and slightly up. ---------- */
  {
    const t0 = V(0, 0.28, -0.09);
    const t1 = V(0.04, 0.24, -0.28);
    const t2 = V(0.10, 0.30, -0.44);
    const tip= V(0.16, 0.36, -0.56);
    tube(t0, t1, 0.024, 0.016, 6, P.tail, {capA:{hex:P.furDk}});
    tube(t1, t2, 0.016, 0.010, 6, P.tail);
    tube(t2, tip,0.010, 0.003, 6, P.tail, {capB:{hex:P.tail, lift:0.003}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
