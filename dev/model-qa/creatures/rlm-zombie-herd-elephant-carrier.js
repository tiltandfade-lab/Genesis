/* dev/model-qa/creatures/rlm-zombie-herd-elephant-carrier.js — the ZOMBIE-HERD ELEPHANT CARRIER
   (lost-world, Large undead, CR 2). A shambling zombie elephant, hide gone necrotic grey-green,
   still hauling the grave-cart CHAINS looped around its neck and tusks — the tell that this beast
   once dragged the tomb's burial carts. Whole-object grammar: one function, one frame, no anchors.
   A bespoke QUADRUPED (like mon-lizard) but heavy/upright-legged (mammal, not sprawling): a broad
   barrel body low-slung on 4 thick legs, a drooping trunk, small necrotic ears, short broken tusks,
   NO eyes (rot-sunk sockets only). Palette: necrotic grey-green hide (matches mon-zombie's family
   register), dull rusted grave-cart chain. Lost-world register: tomb-dust decay. Large size:
   ~2.0u long body, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildZombieHerdElephantCarrier(){
  /* ---------- PALETTE (necrotic grey-green hide; dull rusted chain; same rot family as mon-zombie) ---------- */
  const P = {
    hide:0x767c62, hideDk:0x565c44, hideLt:0x8f9576,
    rot:0x4a5138, rotDk:0x363c28,
    tusk:0xb8ac8e, tuskDk:0x8a7e64, tuskBreak:0x5a5040,
    chain:0x625c50, chainDk:0x3f3a30,
    socket:0x120f0a, mouth:0x140f0a,
    disc:0x453d2e, discTop:0x554c37,
  };

  /* ---------- SPINE — held at mammal-normal height (not sprawling), a heavy barrel body. ---------- */
  const spY = 0.62;
  const S = {
    rump:  V(0, spY+0.05, -0.62),
    loin:  V(0, spY+0.10, -0.30),
    mid:   V(0, spY+0.12,  0.02),
    shldr: V(0, spY+0.10,  0.32),
    neck:  V(0, spY+0.02,  0.54),
    headB: V(0, spY-0.05,  0.66),
  };

  /* ---------- BODY — a broad barrel loft, dorsally rounded, sagging with decay. ---------- */
  tube(S.rump,  S.loin,  0.340, 0.360, 10, P.hide,   {phase:Math.PI/10, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.360, 0.370, 10, P.hideDk, {phase:Math.PI/10});
  tube(S.mid,   S.shldr, 0.370, 0.340, 10, P.hide,   {phase:Math.PI/10});
  tube(S.shldr, S.neck,  0.340, 0.220, 10, P.hideDk, {phase:Math.PI/10});
  tube(S.neck,  S.headB, 0.220, 0.180, 10, P.hide,   {phase:Math.PI/10});
  /* rot patches — dark necrotic blotches on the flank */
  blob(0.30, spY+0.10, -0.10, 0.10,0.08,0.09, P.rotDk, 6, 4);
  blob(-0.24, spY+0.06, -0.34, 0.08,0.06,0.07, P.rot, 6, 4);
  blob(0.08, spY+0.02, 0.20, 0.07,0.05,0.06, P.rotDk, 6, 4);

  /* ---------- HEAD — broad, low, necrotic; small torn ears, rot-sunk sockets, short broken tusks. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.10, cz:0.66, rx:0.185, rz:0.175, hex:P.hide},
      {y:spY-0.02, cz:0.70, rx:0.205, rz:0.190, hex:P.hideDk},
      {y:spY+0.10, cz:0.66, rx:0.170, rz:0.150, hex:P.hide},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+0.20,0.64), P.hideDk);

    /* small torn/rotted ears, flat and drooping */
    for(const s of [-1,1]){
      const ea=V(s*0.18, spY+0.10, 0.56), eb=V(s*0.34, spY-0.02, 0.58), ec=V(s*0.30, spY-0.16, 0.60);
      quad(ea, eb, ec, V(s*0.20,spY-0.10,0.56), P.hideDk, 0.06);
    }
    /* rot-sunk eye sockets (no eyes — hollow dark pits) */
    for(const s of [-1,1]){
      const ex=s*0.10, ey=spY+0.02, ez=0.72;
      quad(V(ex-0.024,ey+0.020,ez), V(ex+0.024,ey+0.020,ez), V(ex+0.020,ey-0.020,ez-0.01), V(ex-0.020,ey-0.020,ez-0.01), P.socket, 0.0);
    }
    /* short BROKEN tusks — snapped stubs, pale ivory going grey */
    for(const s of [-1,1]){
      const t0=V(s*0.09, spY-0.14, 0.72), t1=V(s*0.13, spY-0.20, 0.86);
      tube(t0,t1,0.036,0.020,6,P.tusk,{capB:{hex:P.tuskBreak, lift:0.006}});
    }
    /* mouth line, dark and slack */
    quad(V(-0.06,spY-0.18,0.76), V(0.06,spY-0.18,0.76), V(0.04,spY-0.22,0.80), V(-0.04,spY-0.22,0.80), P.mouth, 0.03);
  }

  /* ---------- DROOPING TRUNK — hangs slack and heavy, sagging (dead weight, not lifted/curled). ---------- */
  {
    const tr0=V(0,spY-0.16,0.78), tr1=V(0.02,spY-0.38,0.84), tr2=V(0.03,spY-0.58,0.80), tr3=V(0.01,spY-0.72,0.72), tip=V(0,spY-0.80,0.68);
    tube(tr0,tr1,0.075,0.062,7,P.hideDk);
    tube(tr1,tr2,0.062,0.048,7,P.hide);
    tube(tr2,tr3,0.048,0.034,7,P.hideDk);
    tube(tr3,tip,0.034,0.020,7,P.hide,{capB:{hex:P.hideDk,lift:0.006}});
  }

  /* ---------- LEGS — 4 thick upright mammal legs (not sprawling), heavy, sagging with decay. ---------- */
  {
    const leg=(hip, footX, footZ)=>{
      const knee=V(hip.x, 0.30, hip.z + (footZ>hip.z?0.02:-0.02));
      const foot=V(footX, 0.05, footZ);
      tube(hip, knee, 0.155, 0.130, 8, P.hide);
      tube(knee, foot, 0.128, 0.140, 8, P.hideDk, {capB:{hex:P.hideDk, lift:0.01}});
      /* a broad flat foot pad */
      const pd=ring(V(foot.x,0.03,foot.z), V(0,1,0), 0.13, 0.12, 7, 0);
      capFan(pd, V(foot.x,0.01,foot.z), P.hideDk, true);
    };
    leg(V(-0.24, spY-0.02, 0.30),  -0.34, 0.34);
    leg(V( 0.24, spY-0.02, 0.30),   0.34, 0.30);
    leg(V(-0.26, spY-0.02, -0.44), -0.36, -0.38);
    leg(V( 0.26, spY-0.02, -0.44),  0.36, -0.42);
  }

  /* ---------- TAIL — short, thin, tufted, hanging limp ---------- */
  {
    const t0=S.rump, t1=V(0.02, spY-0.10, -0.86), tip=V(0.03, spY-0.24, -1.00);
    tube(t0,t1,0.05,0.03,6,P.hideDk);
    tube(t1,tip,0.03,0.012,6,P.hide,{capB:{hex:P.hideDk}});
  }

  /* ---------- GRAVE-CART CHAINS — looped around the neck and one tusk stub, trailing back over
     the shoulder and down the flank, dragging on the ground behind — the "still hauling" tell. ---------- */
  {
    const pts=[V(0.10,spY+0.05,0.62), V(0.20,spY-0.02,0.48), V(0.16,spY-0.14,0.20), V(0.06,spY-0.30,-0.20), V(-0.02,0.04,-0.55)];
    for(let i=0;i<pts.length-1;i++){
      const a=pts[i], b=pts[i+1];
      tube(a,b,0.026,0.024,5, i%2?P.chain:P.chainDk);
      blob(b.x,b.y,b.z,0.030,0.026,0.030, i%2?P.chainDk:P.chain, 5,3);
    }
    /* second strand looped the other side */
    const pts2=[V(-0.10,spY+0.05,0.62), V(-0.18,spY-0.04,0.44), V(-0.12,spY-0.16,0.10), V(-0.04,0.05,-0.30)];
    for(let i=0;i<pts2.length-1;i++){
      const a=pts2[i], b=pts2[i+1];
      tube(a,b,0.024,0.022,5, i%2?P.chainDk:P.chain);
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
