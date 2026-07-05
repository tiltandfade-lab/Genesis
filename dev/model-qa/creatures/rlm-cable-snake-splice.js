/* dev/model-qa/creatures/rlm-cable-snake-splice.js — the CABLE-SNAKE SPLICE (chrome realm, Large).
   REPAIR PASS (p3-chrome): judge said the first build read as a flat scattered smear with no
   coherent snaking/conduit-wrapped body — the silhouette didn't register as a Large serpentine
   construct. Root cause: the cable "wrap" was built as ~30 loose small tube segments floating
   near the spine with sine-offset centers, which fragmented the read into scattered debris instead
   of a continuous body. Rebuilt so the SPINE TUBE ITSELF is the dominant, unmistakable silhouette
   first (a long continuous serpentine loft, thick and unbroken, laid out in a wide, low, legible
   S-curve that stays close to the ground plane so its full length reads in one silhouette) — then
   the cable wrap is added as tight annular bands stitched directly onto that surface (rings that
   hug the body radius, not floating offset tubes), so it reads as "wrapped around" rather than
   "scattered near". Blunt splice-node head with exposed spliced wire ends instead of a mouth; NO
   eye quads — a blunt sensor node only. VS-desaturated: dull rubberized cable-black, oxidized
   copper-green splice ends, grimy conduit-grey hide showing through the wrap. Whole-object
   grammar: one function, one frame, no anchors. Large size: base disc r=0.55. */
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

  /* ---------- LANDMARKS — a long, LOW, wide S-curve spine, all points close to the ground plane
     (y stays within ~0.06 of a flat baseline) so the FULL body length silhouettes at a glance —
     no lifted loops, no scattered offshoots. Tapers thick-mid to thin at both ends. ---------- */
  const spY = 0.16;
  const S = {
    tailTip: V( 0.50, spY-0.03, -1.10),
    tailMid: V( 0.32, spY-0.01, -0.86),
    rear:    V( 0.08, spY+0.01, -0.58),
    curve1:  V(-0.22, spY+0.02, -0.30),
    mid:     V(-0.14, spY+0.03,  0.00),
    curve2:  V( 0.16, spY+0.02,  0.28),
    fore:    V( 0.30, spY+0.00,  0.54),
    neck:    V( 0.22, spY-0.02,  0.76),
    headB:   V( 0.10, spY-0.03,  0.92),
  };

  /* ---------- BODY — ONE continuous serpentine loft along the S-curve. This is authored FIRST
     and is the dominant silhouette element: every segment uses the SAME hide tone family (subtle
     alternation only) so the eye reads one unbroken snake, not alternating chunks. ---------- */
  const spine=[S.tailTip,S.tailMid,S.rear,S.curve1,S.mid,S.curve2,S.fore,S.neck,S.headB];
  const radii=[0.045,0.100,0.175,0.215,0.225,0.220,0.185,0.135,0.095];
  for(let i=0;i<spine.length-1;i++){
    tube(spine[i], spine[i+1], radii[i], radii[i+1], 10, P.hide, {phase:Math.PI/10,
      capA: i===0 ? {hex:P.hideDk, lift:0.01} : undefined});
  }
  // a thin dark dorsal seam line the length of the body (reads as conduit ribbing, ties it together)
  for(let i=0;i<spine.length-1;i++){
    const a=spine[i], b=spine[i+1], ra=radii[i]*0.15+0.01, rb=radii[i+1]*0.15+0.01;
    tube(V(a.x,a.y+radii[i]*0.9,a.z), V(b.x,b.y+radii[i+1]*0.9,b.z), ra, rb, 4, P.hideDk);
  }

  /* ---------- CABLE WRAP — tight annular coil bands stitched DIRECTLY onto the body surface
     (rings sized to the local body radius, spaced along the spine) so they read as "wrapped
     around a snake" rather than loose debris scattered nearby. Each band is a short thick torus-
     like ring hugging the hide, not an offset floating tube. ---------- */
  {
    const wrapBand=(centerIdx, t, count, rr)=>{
      // centerIdx..centerIdx+1 segment of the spine; t in [0,1] along that segment
      const a=spine[centerIdx], b=spine[centerIdx+1];
      const cx=a.x+(b.x-a.x)*t, cy=a.y+(b.y-a.y)*t, cz=a.z+(b.z-a.z)*t;
      const localR = radii[centerIdx]+(radii[centerIdx+1]-radii[centerIdx])*t;
      const axis = new THREE.Vector3(b.x-a.x, b.y-a.y, b.z-a.z).normalize();
      // a short ring-hugging coil: two close rings around the body, tilted along the spine axis
      const bandW = 0.05;
      const c0 = V(cx-axis.x*bandW, cy-axis.y*bandW, cz-axis.z*bandW);
      const c1 = V(cx+axis.x*bandW, cy+axis.y*bandW, cz+axis.z*bandW);
      const rWrap = localR + rr;
      const r1 = ring(c0, axis, rWrap, rWrap, 8, 0);
      const r2 = ring(c1, axis, rWrap, rWrap, 8, Math.PI/4);
      stitch([r1,r2], (b2,i)=> (i%2)?P.cable:P.cableDk);
    };
    // several coil bands riding the thickest/mid sections of the body — dense enough to read
    // as continuous wrap, all directly on-surface (no offset floating segments)
    wrapBand(2, 0.15, 1, 0.024); wrapBand(2, 0.55, 1, 0.024); wrapBand(2, 0.90, 1, 0.024);
    wrapBand(3, 0.20, 1, 0.026); wrapBand(3, 0.60, 1, 0.026);
    wrapBand(4, 0.15, 1, 0.026); wrapBand(4, 0.55, 1, 0.026); wrapBand(4, 0.90, 1, 0.026);
    wrapBand(5, 0.20, 1, 0.022); wrapBand(5, 0.60, 1, 0.022);
    wrapBand(6, 0.20, 1, 0.018); wrapBand(6, 0.65, 1, 0.018);
    // loose trailing cable end dangling off the tail — the one deliberate "unwound" flourish
    tube(S.tailMid, V(0.58,spY-0.16,-1.22), 0.024,0.012,4, P.cableLt, {capB:{hex:P.cableDk, lift:0.006}});
  }

  /* ---------- HEAD — a blunt splice-node with exposed spliced wire ends where a mouth would be. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:spY-0.05, cz:0.90, rx:0.088, rz:0.092, hex:P.node},
      {y:spY-0.01, cz:0.93, rx:0.098, rz:0.100, hex:P.hideDk},
      {y:spY+0.03, cz:0.88, rx:0.080, rz:0.084, hex:P.node},
    ];
    const rings=bands.map(b=>ring(V(0.06,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0.06, spY+0.05, 0.96), P.node);
    // blunt sensor node (no eye quad — a dark recessed disc-node on the "brow")
    quad(V(0.02,spY+0.02,0.98), V(0.06,spY+0.02,0.98), V(0.055,spY-0.01,0.985), V(0.025,spY-0.01,0.985), P.cableDk, 0.0);
    // exposed spliced copper wire-ends fanning from the blunt face like a torn cable end
    const faceC = V(0.06, spY-0.04, 0.98);
    for(const [dx,dy] of [[-0.03,0.02],[0,0.03],[0.03,0.015],[-0.015,-0.01],[0.02,-0.015]]){
      const tip = V(faceC.x+dx*2.4, faceC.y+dy*2.2, faceC.z+0.10);
      tube(faceC, tip, 0.012, 0.004, 4, P.copper, {capB:{hex:P.copperOx, lift:0.003}});
    }
    // small live-spark accent at one wire tip
    quad(V(0.10,spY-0.01,1.12), V(0.115,spY-0.01,1.12), V(0.11,spY+0.005,1.125), V(0.095,spY+0.005,1.125), P.spark, 0.15);
  }

  /* ---------- TAIL — tapering bare conduit-pipe end, cable wrap thinning out. ---------- */
  quad(V(0.48,spY-0.02,-1.11), V(0.52,spY-0.02,-1.11), V(0.50,spY-0.04,-1.15), V(0.46,spY-0.04,-1.15), P.hideDk, 0.05);

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.052,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.055,0), P.discTop);
  }
}
