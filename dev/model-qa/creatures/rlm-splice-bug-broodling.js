/* dev/model-qa/creatures/rlm-splice-bug-broodling.js — the SPLICE-BUG BROODLING (chrome realm,
   Medium). A chitin-armored larval broodling scuttling in tight formation. Read: ONE bespoke
   bug-form (per the board-piece ruling — the "formation" reads through pose/stance, not multiple
   figures) — a low compact chitin-plated insectoid body on many short scuttling legs, a hard
   armored carapace shell, and small mandible jaws. NO eye quads — compound-eye read via a faceted
   dark chitin dome, not literal eye geometry. VS-desaturated: dull black-green chitin, oily
   carapace sheen, dark oxidized joints. Whole-object grammar: one function, one frame, no anchors.
   Medium size: base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSpliceBugBroodling(){
  /* ---------- PALETTE ---------- */
  const P = {
    chitin:0x373c2e, chitinDk:0x22261c, chitinLt:0x4a5140,    // black-green chitin plating
    shell:0x2c3024, shellSheen:0x515a3c,                        // oily carapace sheen
    joint:0x1a1c15,                                              // dark oxidized leg joints
    mandible:0x605a3e, mandibleDk:0x3e3a28,
    facet:0x14170f,                                              // faceted compound-eye dome (dark, no quads)
    disc:0x282a22, discTop:0x33362b,
  };

  /* ---------- LANDMARKS — low compact body, carapace domed over, head forward-low, legs splay out. ---------- */
  const bY = 0.20;
  const S = {
    rear:   V(0, bY-0.01, -0.20),
    abd:    V(0, bY+0.03, -0.06),
    thorax: V(0, bY+0.05,  0.10),
    headB:  V(0, bY+0.00,  0.24),
  };

  /* ---------- BODY — compact segmented barrel, domed carapace riding over. ---------- */
  tube(S.rear,   S.abd,    0.130, 0.175, 8, P.chitinDk, {phase:Math.PI/8, capA:{hex:P.chitinDk, lift:0.012}});
  tube(S.abd,    S.thorax, 0.175, 0.185, 8, P.chitin,   {phase:Math.PI/8});
  tube(S.thorax, S.headB,  0.185, 0.110, 8, P.chitinLt, {phase:Math.PI/8});

  /* ---------- CARAPACE — hard domed shell plates over the back, oily sheen highlights. ---------- */
  {
    const seg=[[-0.18,bY+0.16],[ -0.02,bY+0.20],[0.14,bY+0.19],[0.26,bY+0.13]];
    for(let i=0;i<seg.length-1;i++){
      const [z0,y0]=seg[i], [z1,y1]=seg[i+1];
      quad(V(-0.11,y0,z0), V(0.11,y0,z0), V(0.10,y1,z1), V(-0.10,y1,z1), i%2?P.shell:P.shellSheen, 0.05);
    }
    // plate ridge seams
    for(const [z] of [[-0.10],[0.04],[0.18]]){
      quad(V(-0.10,bY+0.185,z), V(0.10,bY+0.185,z), V(0.09,bY+0.17,z-0.02), V(-0.09,bY+0.17,z-0.02), P.chitinDk, 0.04);
    }
  }

  /* ---------- HEAD — low forward, faceted compound-eye dome (no eye quads) + small mandibles. ---------- */
  {
    const n=7, ph=Math.PI/n;
    const bands=[
      {y:bY-0.03, cz:0.24, rx:0.088, rz:0.095, hex:P.chitin},
      {y:bY+0.03, cz:0.27, rx:0.100, rz:0.100, hex:P.chitinLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,bY+0.06,0.27), P.facet);
    capFan(rings[0], V(0,bY-0.06,0.24), P.chitinDk, true);
    // faceted dome patches flanking the head (compound-eye read, all flat dark facets not spheres)
    for(const s of [-1,1]){
      const c=V(s*0.07, bY+0.01, 0.30);
      quad(V(c.x-0.02,c.y+0.02,c.z), V(c.x+0.02,c.y+0.02,c.z), V(c.x+0.018,c.y-0.02,c.z-0.01), V(c.x-0.018,c.y-0.02,c.z-0.01), P.facet, 0.05);
    }
    // small mandible jaws
    for(const s of [-1,1]){
      const base=V(s*0.03, bY-0.05, 0.32);
      const tip =V(s*0.07, bY-0.09, 0.40);
      tube(base, tip, 0.020, 0.006, 4, P.mandible, {capB:{hex:P.mandibleDk, lift:0.004}});
    }
  }

  /* ---------- LEGS — many short scuttling legs, splayed both sides, tight low stance (formation read). ---------- */
  {
    const scLeg=(bx, bz, footX, footZ, hex)=>{
      const shoulder=V(bx, bY+0.02, bz);
      const knee=V(bx*1.6, bY-0.06, bz+ (footZ>bz?0.02:-0.02));
      const foot=V(footX, 0.03, footZ);
      tube(shoulder, knee, 0.030, 0.022, 5, hex, {phase:Math.PI/5});
      tube(knee, foot, 0.020, 0.008, 5, P.joint, {phase:Math.PI/5, capB:{hex:P.joint, lift:0.005}});
    };
    const rows=[
      [-0.13, 0.16, -0.30, 0.22, P.chitin],
      [ 0.13, 0.16,  0.30, 0.22, P.chitinLt],
      [-0.16, 0.02, -0.34, 0.06, P.chitinDk],
      [ 0.16, 0.02,  0.34, 0.06, P.chitin],
      [-0.15,-0.12, -0.32,-0.16, P.chitin],
      [ 0.15,-0.12,  0.32,-0.16, P.chitinDk],
    ];
    for(const [bx,bz,fx,fz,hex] of rows) scLeg(bx,bz,fx,fz,hex);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.040,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.043,0), P.discTop);
  }
}
