/* dev/model-qa/creatures/rlm-splintered-marionette.js — the SPLINTERED MARIONETTE (gloom,
   Small, CR 0.5). A puppet with its own cut strings, still bowing. Read: a small jointed wooden
   figure, cracked painted-face, stiff articulated limbs on visible peg-joints, and a scatter of
   slack broken strings still trailing from its crossbar overhead down to its wrists/head — cut,
   dangling, useless. Frozen mid-bow (torso pitched forward, one arm swept out). No eye quads
   (painted socket hollows). Whole-object grammar, one merged frame, no anchors. Small disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSplinteredMarionette(){
  const P = {
    wood:0x8a6f4a, woodDk:0x5e4a30, woodLt:0xa88656,
    paint:0xb23a3a, paintDk:0x7c2828,          // chipped red paint (cheeks/coat)
    face:0xd8c7a0, faceCrack:0x3a3126,
    peg:0x2c2318, string:0x9c9080, stringDk:0x6b6357,
    disc:0x3a3226, discTop:0x453c2e,
  };

  const spY = 0.30;
  /* ---------- TORSO — small jointed wooden body, pitched forward in a frozen bow. ---------- */
  const bands=[
    {y:0.02,  cz:0.00, rx:0.115, hex:P.woodDk},
    {y:0.16,  cz:0.01, rx:0.105, hex:P.wood},
    {y:0.30,  cz:0.03, rx:0.100, hex:P.paint},   // painted coat chest
    {y:0.42,  cz:0.07, rx:0.078, hex:P.paintDk},
    {y:0.50,  cz:0.11, rx:0.058, hex:P.wood},    // hinges forward — the bow
  ];
  {
    const n=8, ph=Math.PI/n;
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.82, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,0.01,0), P.woodDk, true);
  }
  // a visible peg-joint knob at the waist hinge
  {
    const r0=ring(V(0,0.30,0.02), V(0,1,0), 0.03, 0.03, 6);
    capFan(r0, V(0,0.315,0.02), P.peg);
  }

  /* ---------- HEAD — small painted wooden ball-head, cracked, tilted down in the bow. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const hb=[
      {y:0.54, cz:0.13, rx:0.070, hex:P.face},
      {y:0.63, cz:0.15, rx:0.078, hex:P.face},
      {y:0.71, cz:0.13, rx:0.062, hex:P.woodDk},
    ];
    const rings = hb.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.9, n, ph));
    stitch(rings, b=>hb[b].hex);
    capFan(rings.at(-1), V(0,0.735,0.12), P.woodDk);
    // painted socket hollows (no eye quads)
    for(const s of [-1,1]){
      const sx=s*0.028, sy=0.645, sz=0.205;
      quad(V(sx-0.014,sy+0.010,sz), V(sx+0.014,sy+0.010,sz), V(sx+0.011,sy-0.010,sz+0.004), V(sx-0.011,sy-0.010,sz+0.004), P.faceCrack, 0.04);
    }
    // painted smile crack + rosy cheek chips
    quad(V(-0.024,0.605,0.215), V(0.024,0.605,0.215), V(0.018,0.598,0.218), V(-0.018,0.598,0.218), P.faceCrack, 0.03);
    for(const s of [-1,1]) quad(V(s*0.05-0.012,0.625,0.20), V(s*0.05+0.012,0.625,0.20), V(s*0.05+0.010,0.615,0.203), V(s*0.05-0.010,0.615,0.203), P.paint, 0.05);
    // a hairline crack down the brow
    quad(V(-0.006,0.70,0.16), V(0.006,0.70,0.16), V(0.004,0.66,0.19), V(-0.004,0.66,0.19), P.faceCrack, 0.02);
  }

  /* ---------- ARMS — stiff peg-jointed limbs; one swept out mid-bow, one hanging slack. ---------- */
  {
    const armSweep=(sh, el, hd, hex)=>{
      tube(sh, el, 0.032, 0.026, 6, hex);
      const rp=ring(el, V(0,1,0), 0.030, 0.030, 6); capFan(rp, V(el.x,el.y+0.015,el.z), P.peg);
      tube(el, hd, 0.024, 0.016, 6, P.wood, {capB:{hex:P.woodDk, lift:0.008}});
    };
    armSweep(V(0.10,0.46,0.08), V(0.22,0.40,0.20), V(0.34,0.36,0.30), P.paint);   // swept-out bow arm
    armSweep(V(-0.10,0.44,0.06), V(-0.14,0.28,0.08), V(-0.16,0.14,0.10), P.paintDk); // slack hanging arm
  }

  /* ---------- LEGS — stiff jointed peg-legs, small stance. ---------- */
  {
    const leg=(hip, knee, foot, hex)=>{
      tube(hip, knee, 0.040, 0.032, 6, hex);
      const rp=ring(knee, V(0,1,0), 0.034, 0.034, 6); capFan(rp, V(knee.x,knee.y+0.015,knee.z), P.peg);
      tube(knee, foot, 0.030, 0.026, 6, P.woodDk, {capB:{hex:P.woodDk, lift:0.006}});
    };
    leg(V(-0.05,0.02,0.02), V(-0.05,0.10,0.10), V(-0.05,0.03,0.16), P.wood);
    leg(V( 0.05,0.02,0.03), V( 0.06,0.11,0.14), V( 0.07,0.03,0.22), P.wood);
  }

  /* ---------- CROSSBAR + CUT STRINGS — the puppet's own strings, dangling slack from a hinted
     crossbar overhead down to head/wrists, cut and useless (no controller visible/held). ---------- */
  {
    const bar0 = V(-0.14, 0.98, 0.02), bar1 = V(0.14, 0.98, 0.02);
    tube(bar0, bar1, 0.012, 0.012, 5, P.woodDk, {capA:{hex:P.woodDk}, capB:{hex:P.woodDk}});
    const anchors = [ V(-0.09,0.98,0.02), V(0.02,0.98,0.02), V(0.10,0.98,0.02) ];
    const targets = [ V(-0.16,0.14,0.10), V(0,0.735,0.12), V(0.34,0.36,0.30) ];
    for(let i=0;i<anchors.length;i++){
      const a=anchors[i], b=targets[i];
      const mid = V((a.x+b.x)/2 + 0.03, (a.y+b.y)/2, (a.z+b.z)/2);
      tube(a, mid, 0.006, 0.004, 3, P.string);
      tube(mid, b, 0.004, 0.002, 3, P.stringDk, {capB:{hex:P.stringDk, lift:0.002}});
    }
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.30, 0.30, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
