/* dev/model-qa/creatures/rlm-cable-snake-splice.js — the CABLE-SNAKE SPLICE (chrome realm, Large).
   A bio-construct snaking through conduit, wrapped in power cable. Read: a long low sinuous
   serpentine body (snaking S-curve, conduit-tube proportions) whose hide is wound with thick
   power cable in a wrapped-coil pattern, a blunt splice-node head with exposed spliced wire ends
   instead of a mouth, and a tapering conduit-pipe tail. NO eye quads — a blunt sensor node only.
   VS-desaturated: dull rubberized cable-black, oxidized copper-green splice ends, grimy conduit
   grey hide showing through the wrap. Whole-object grammar: one function, one frame, no anchors.
   Large size: base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildCableSnakeSplice(){
  /* ---------- PALETTE ---------- */
  const P = {
    hide:0x4a4d48, hideDk:0x34362f, hideLt:0x5f6259,        // conduit-grey construct hide
    cable:0x201f1d, cableDk:0x141312, cableLt:0x2e2c29,      // wrapped power cable coil
    copper:0x7a6a3a, copperDk:0x554a28, copperOx:0x5c7a5a,   // exposed spliced copper, oxidized green
    node:0x3a3c38,                                             // splice-node head shell
    spark:0xb8863c,                                            // small live-spark accent
    disc:0x2c2b26, discTop:0x373630,
  };

  /* ---------- LANDMARKS — a long S-curve spine, low along conduit, tapering both ends. ---------- */
  const spY = 0.30;
  const S = {
    tailTip: V( 0.55, spY-0.05, -1.05),
    tailMid: V( 0.34, spY-0.02, -0.78),
    rear:    V( 0.10, spY+0.02, -0.48),
    curve1:  V(-0.20, spY+0.04, -0.18),
    mid:     V(-0.10, spY+0.05,  0.10),
    curve2:  V( 0.18, spY+0.03,  0.34),
    fore:    V( 0.30, spY+0.00,  0.58),
    neck:    V( 0.22, spY-0.02,  0.78),
    headB:   V( 0.08, spY-0.04,  0.92),
  };

  /* ---------- BODY — serpentine loft along the S-curve, cable-wrap texture riding the surface. ---------- */
  const spine=[S.tailTip,S.tailMid,S.rear,S.curve1,S.mid,S.curve2,S.fore,S.neck,S.headB];
  const radii=[0.030,0.075,0.150,0.195,0.210,0.205,0.175,0.130,0.090];
  for(let i=0;i<spine.length-1;i++){
    const hex = (i%2===0)?P.hide:P.hideDk;
    tube(spine[i], spine[i+1], radii[i], radii[i+1], 9, hex, {phase:Math.PI/9,
      capA: i===0 ? {hex:P.hideDk, lift:0.01} : undefined});
  }

  /* ---------- CABLE WRAP — thick power cable coiled around the body in a wrapped-spiral pattern. ---------- */
  {
    const wrapAt=(c0,c1,turns,rr)=>{
      const steps=10;
      for(let i=0;i<steps;i++){
        const t0=i/steps, t1=(i+1)/steps;
        const p0=V(c0.x+(c1.x-c0.x)*t0, c0.y+(c1.y-c0.y)*t0, c0.z+(c1.z-c0.z)*t0);
        const p1=V(c0.x+(c1.x-c0.x)*t1, c0.y+(c1.y-c0.y)*t1, c0.z+(c1.z-c0.z)*t1);
        const a0=t0*turns*Math.PI*2, a1=t1*turns*Math.PI*2;
        const o0=V(p0.x, p0.y+Math.sin(a0)*rr, p0.z+Math.cos(a0)*rr*0.6);
        const o1=V(p1.x, p1.y+Math.sin(a1)*rr, p1.z+Math.cos(a1)*rr*0.6);
        tube(o0,o1, 0.028,0.028,4, (i%2)?P.cable:P.cableDk);
      }
    };
    wrapAt(S.rear, S.curve1, 2.4, 0.20);
    wrapAt(S.mid, S.curve2, 2.2, 0.215);
    wrapAt(S.fore, S.neck, 1.8, 0.14);
    // loose trailing cable end dangling off the tail
    tube(S.tailMid, V(0.62,spY-0.20,-1.20), 0.024,0.012,4, P.cableLt, {capB:{hex:P.cableDk, lift:0.006}});
  }

  /* ---------- HEAD — a blunt splice-node with exposed spliced wire ends where a mouth would be. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:spY-0.06, cz:0.92, rx:0.085, rz:0.090, hex:P.node},
      {y:spY-0.02, cz:0.95, rx:0.095, rz:0.098, hex:P.hideDk},
      {y:spY+0.02, cz:0.90, rx:0.078, rz:0.082, hex:P.node},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0.02, spY+0.04, 0.98), P.node);
    // blunt sensor node (no eye quad — a dark recessed disc-node on the "brow")
    quad(V(0.02,spY+0.01,1.00), V(0.06,spY+0.01,1.00), V(0.055,spY-0.02,1.005), V(0.025,spY-0.02,1.005), P.cableDk, 0.0);
    // exposed spliced copper wire-ends fanning from the blunt face like a torn cable end
    const faceC = V(0.02, spY-0.05, 1.00);
    for(const [dx,dy] of [[-0.03,0.02],[0,0.03],[0.03,0.015],[-0.015,-0.01],[0.02,-0.015]]){
      const tip = V(faceC.x+dx*2.4, faceC.y+dy*2.2, faceC.z+0.10);
      tube(faceC, tip, 0.012, 0.004, 4, (Math.random? P.copper:P.copper), {capB:{hex:P.copperOx, lift:0.003}});
    }
    // small live-spark accent at one wire tip
    quad(V(0.06,spY-0.02,1.14), V(0.075,spY-0.02,1.14), V(0.07,spY-0.005,1.145), V(0.055,spY-0.005,1.145), P.spark, 0.15);
  }

  /* ---------- TAIL — tapering bare conduit-pipe end, cable wrap thinning out. ---------- */
  quad(V(0.53,spY-0.04,-1.06), V(0.57,spY-0.04,-1.06), V(0.55,spY-0.06,-1.10), V(0.51,spY-0.06,-1.10), P.hideDk, 0.05);

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.052,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.055,0), P.discTop);
  }
}
