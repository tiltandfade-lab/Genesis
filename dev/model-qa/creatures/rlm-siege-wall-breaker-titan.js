/* dev/model-qa/creatures/rlm-siege-wall-breaker-titan.js — Siege Wall-Breaker Titan
   (theater/siege era-lens, Huge, CR 10). A hulking titan swinging a huge tree-trunk ram at a gate —
   massive humanoid construct/giant hybrid, hunched into a heaving swing pose, both arms gripping an
   enormous log-ram cocked back over one shoulder mid-swing. Whole-object grammar: one merged frame,
   no anchors. VS-desaturated palette: grey-brown weathered giant-hide/stone-hybrid skin, dull bark-
   brown ram log, dull iron ram-cap, rope lashings. NO eye quads (deep brow shadow instead). Huge
   size: base disc r=0.68.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSiegeWallBreakerTitan(){
  const P = {
    hide:0x5e564a, hideDk:0x3e382e, hideLt:0x746a5a,
    stone:0x59544a, stoneDk:0x38342c,
    bark:0x4a3524, barkDk:0x2e2013, barkLt:0x5e4632,
    iron:0x353128, ironDk:0x201d17,
    rope:0x746040, ropeDk:0x50401f,
    disc:0x453f34, discTop:0x524b3c,
  };

  /* ---------- LANDMARKS — huge hunched heaving stance, torso twisted for the swing (ram cocked
     back over the right shoulder). Body ~2.2u tall. ---------- */
  const L = {
    hipY:0.66, waistY:0.92, chestY:1.28, shldY:1.58,
    neckY:1.62, headY:1.78, headTopY:2.02,
  };

  /* ===== LEGS — massive, wide-planted, braced for the swing (one leg forward). ===== */
  {
    const leg=(sign, fwd)=>{
      const hip=V(sign*0.22,L.hipY-0.10,0.0);
      const knee=V(sign*0.26,0.55,fwd*0.14);
      const ank=V(sign*0.24,0.16,fwd*0.22);
      tube(hip,knee,0.22,0.18,8,P.hide,{phase:Math.PI/8,capA:{hex:P.hideDk}});
      tube(knee,ank,0.18,0.155,8,P.hideDk,{phase:Math.PI/8});
      quad(V(ank.x-0.16,0.05,ank.z-0.14),V(ank.x+0.16,0.05,ank.z-0.14),
           V(ank.x+0.14,0.02,ank.z+0.20),V(ank.x-0.14,0.02,ank.z+0.20), P.stoneDk, 0.03);
    };
    leg(-1, 1); leg(1, -0.3);
  }

  /* ===== TORSO — twisted heaving mass, broad chest, cinched waist. ===== */
  {
    const n=9, ph=Math.PI/9;
    const bands=[
      {y:L.hipY,   cx:0.02, rx:0.34, rz:0.30, hex:P.hideDk},
      {y:L.waistY, cx:0.0,  rx:0.32, rz:0.28, hex:P.hide},
      {y:L.chestY, cx:-0.03,rx:0.42, rz:0.34, hex:P.hideLt},
      {y:L.shldY,  cx:-0.02,rx:0.36, rz:0.30, hex:P.hide},
    ];
    const rings=bands.map(b=>ring(V(b.cx,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(-0.02,L.shldY+0.08,0), P.hideLt);
    // stone-hybrid weathered patches on the flank (giant/golem hybrid read)
    quad(V(0.20,L.chestY-0.10,0.18),V(0.34,L.chestY-0.06,0.10),V(0.30,L.waistY+0.02,0.14),V(0.18,L.waistY-0.02,0.20), P.stone, 0.04);
  }

  /* ===== HEAD — small relative to the body, hunched down/forward, deep brow shadow, grim jaw. === */
  {
    const n=8, ph=Math.PI/8, cz=0.10, cx=-0.02;
    const bands=[
      {y:L.headY-0.10, rx:0.155, rz:0.150, hex:P.hide},
      {y:L.headY+0.02, rx:0.170, rz:0.160, hex:P.hideDk},   // heavy brow
      {y:L.headTopY-0.06, rx:0.130, rz:0.120, hex:P.hide},
    ];
    const rings=bands.map(b=>ring(V(cx,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(cx,L.headTopY,cz-0.02), P.hideDk);
    // deep brow shadow recess (no eye quads — pure shadow)
    quad(V(cx-0.10,L.headY+0.0,cz+0.145), V(cx+0.10,L.headY+0.0,cz+0.145),
         V(cx+0.09,L.headY-0.05,cz+0.14), V(cx-0.09,L.headY-0.05,cz+0.14), P.hideDk, 0.02);
    // grim jaw line
    quad(V(cx-0.08,L.headY-0.13,cz+0.14),V(cx+0.08,L.headY-0.13,cz+0.14),
         V(cx+0.06,L.headY-0.16,cz+0.13),V(cx-0.06,L.headY-0.16,cz+0.13), P.hideDk, 0.03);
  }

  /* ===== ARMS + THE RAM — both arms grip an ENORMOUS log cocked back over the right shoulder,
     mid-swing: the dominant silhouette element. ===== */
  {
    // right arm (raised, cocked back over shoulder)
    const rSh=V(0.32,L.shldY,0.02), rEl=V(0.48,L.shldY+0.22,-0.20), rWr=V(0.40,L.shldY+0.10,-0.42);
    tube(rSh,rEl,0.15,0.125,7,P.hide,{phase:Math.PI/7,capA:{hex:P.hideDk}});
    tube(rEl,rWr,0.125,0.105,7,P.hideDk,{phase:Math.PI/7});
    // left arm (lower, bracing the log's forward end)
    const lSh=V(-0.30,L.shldY-0.06,0.10), lEl=V(-0.38,L.chestY-0.10,0.36), lWr=V(-0.30,L.waistY+0.04,0.54);
    tube(lSh,lEl,0.15,0.125,7,P.hide,{phase:Math.PI/7,capA:{hex:P.hideDk}});
    tube(lEl,lWr,0.125,0.105,7,P.hideDk,{phase:Math.PI/7});

    // THE RAM — a huge tapering log, gripped at both wrists, cocked back-high at the rWr end and
    // reaching forward-low toward the lWr end (mid-swing toward an unseen gate).
    const ramBack = V(rWr.x+0.10, rWr.y+0.06, rWr.z-0.20);
    const ramMid  = V(0.05, L.chestY-0.05, 0.10);
    const ramFwd  = V(lWr.x-0.08, lWr.y-0.10, lWr.z+0.36);
    tube(ramBack, ramMid, 0.145, 0.185, 8, P.bark, {phase:Math.PI/8, capA:{hex:P.barkDk}});
    tube(ramMid, ramFwd, 0.185, 0.135, 8, P.barkLt, {phase:Math.PI/8});
    // iron ram-cap at the forward striking end
    tube(ramFwd, V(ramFwd.x-0.04,ramFwd.y-0.04,ramFwd.z+0.14), 0.135, 0.145, 8, P.iron, {phase:Math.PI/8, capB:{hex:P.ironDk, lift:0.02}});
    // rope lashings at both grip points
    for(const p of [rWr, lWr, ramMid]){
      const r1=ring(p, V(0,0,1), 0.155,0.155,8,Math.PI/8);
      const r2=ring(V(p.x,p.y,p.z+0.04), V(0,0,1), 0.155,0.155,8,Math.PI/8);
      stitch([r1,r2], ()=>P.rope);
    }
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
