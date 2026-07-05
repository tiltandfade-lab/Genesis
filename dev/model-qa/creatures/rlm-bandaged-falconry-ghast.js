/* dev/model-qa/creatures/rlm-bandaged-falconry-ghast.js — the BANDAGED FALCONRY GHAST
   (lost-world, Medium undead, CR 2). A ghast wrapped in mummification bandages, once the tomb's
   falconer — a shrivelled MUMMIFIED HUNTING BIRD still perches on its bandaged forearm, talons
   sunk in, wings half-mantled. Whole-object grammar: one function, one frame, no anchors. Crouched
   ghast posture (per rlm-chain-bound-barrow-ghast, but this one's arms are wrapped not clawed-bare),
   NO eye quads (sockets under the wrapped brow only). Palette: aged linen-grey bandages, grey-green
   rot beneath, a shrivelled dun-feathered mummified bird. Lost-world register: tomb-dust, dry not
   wet. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildBandagedFalconryGhast(){
  /* ---------- PALETTE (aged linen bandages over grey-green rot; a shrivelled dun bird) ---------- */
  const P = {
    linen:0x8a8368, linenDk:0x655f47, linenLt:0xa39c7c,
    skin:0x747c5e, skinDk:0x4f5540,
    claw:0x211d16, mouth:0x140f0a, socket:0x110d08,
    feather:0x8a7448, featherDk:0x5f4f2e, featherLt:0xa8905c,
    beak:0x3a2f1e, talon:0x231d13,
    disc:0x453d2e, discTop:0x554c37,
  };

  const L = {
    hipY:0.52, waistY:0.60, chestY:0.72, shldY:0.80, neckY:0.835,
    hipHalf:0.10, shoulderX:0.20,
    jawY:0.865, cheekY:0.925, browY:0.985, crownY:1.05, topY:1.09,
  };
  const crouch = (p) => { const t=Math.max(0,p.y-L.hipY); return V(p.x, p.y-t*0.02, p.z+t*0.14); };

  /* ===== TORSO — bandage-wrapped loft, alternating linen bands with dark wear ===== */
  stack([
    {y:L.hipY,   rx:0.148, rz:0.118, hex:P.linenDk},
    {y:L.waistY, rx:0.126, rz:0.098, hex:P.linen},
    {y:L.chestY, rx:0.152, rz:0.116, hex:P.linenDk},
    {y:L.shldY,  rx:0.158, rz:0.108, hex:P.linen},
    {y:L.neckY,  rx:0.058, rz:0.054, hex:P.skinDk},
  ], 8, {xform:crouch, capTop:{hex:P.skinDk, lift:0.004}});
  /* diagonal bandage wraps — a few dark strip-quads crossing the torso */
  {
    const wrap=(y0,y1,side)=>{
      const a=crouch(V(side*0.10,y0,0.10)), b=crouch(V(-side*0.06,y1,0.09));
      tube(a,b,0.022,0.018,4,P.linenLt);
    };
    wrap(L.hipY+0.02, L.chestY-0.02, 1);
    wrap(L.chestY, L.shldY-0.01, -1);
  }

  /* ===== HEAD — wrapped in bandages, sockets showing through torn gaps (NO eye quads) ===== */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.070, rz:0.076, hex:P.linen},
      {y:L.cheekY, rx:0.092, rz:0.090, hex:P.linenDk},
      {y:L.browY,  rx:0.096, rz:0.086, hex:P.linen},
      {y:L.crownY, rx:0.078, rz:0.070, hex:P.linenDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.topY,0.006), P.linenDk);
    /* torn gap over the sockets, showing dark hollows beneath the wrap */
    for(const s of [-1,1]){
      const ex=s*0.036, ey=L.browY-0.01, ez=0.074;
      quad(V(ex-0.022,ey+0.016,ez), V(ex+0.022,ey+0.016,ez), V(ex+0.018,ey-0.018,ez-0.01), V(ex-0.018,ey-0.018,ez-0.01), P.socket, 0.0);
    }
    /* slack wrapped jaw, a thin dark mouth-gap where the linen has rotted through */
    quad(V(-0.040,L.jawY-0.010,0.060), V(0.040,L.jawY-0.010,0.060), V(0.032,L.jawY-0.046,0.066), V(-0.032,L.jawY-0.046,0.066), P.mouth, 0.0);
  }

  /* ===== ARMS — RIGHT bent, forearm raised, wrapped in thick linen — the falconer's perch-arm.
     LEFT hangs, thinner wrap. ===== */
  let perchWrist;
  {
    const Ss=(x)=>crouch(V(x,L.shldY-0.01,0.02));
    const S=Ss(L.shoulderX*0.9), E=crouch(V(0.24,0.70,0.18)), W=crouch(V(0.28,0.78,0.34));
    tube(S,E,0.056,0.044,6,P.linenDk); tube(E,W,0.046,0.038,6,P.linen,{capB:{hex:P.linenLt}});
    perchWrist = W;
    /* wrapped fingers, stiff and bandage-thick, gripping nothing (bird's talons do the gripping) */
    for(const d of [V(-0.2,-0.1,1),V(0.1,0.1,1),V(0.3,-0.1,1)]){
      const dn=d.clone().normalize(); const tip=W.clone().addScaledVector(dn,0.07);
      tube(W,tip,0.014,0.009,4,P.linen,{capB:{hex:P.linenDk}});
    }
    const S2=Ss(-L.shoulderX*0.9), E2=crouch(V(-0.22,0.60,0.10)), W2=crouch(V(-0.20,0.42,0.12));
    tube(S2,E2,0.050,0.040,6,P.linenDk); tube(E2,W2,0.040,0.032,6,P.linen);
    for(const dx of [-0.02,0,0.02]) tube(W2, W2.clone().add(V(dx,-0.07,0.04)), 0.013,0.008,4,P.linen,{capB:{hex:P.linenDk}});
  }

  /* ===== LEGS — bent haunches, wrapped, clawed toes showing through torn linen at the feet ===== */
  {
    const hipL=crouch(V(-L.hipHalf,L.hipY-0.01,0.0)), kneeL=V(-0.15,0.30,0.09), ankL=V(-0.14,0.09,0.02);
    tube(hipL,kneeL,0.060,0.045,6,P.linenDk); tube(kneeL,ankL,0.042,0.030,6,P.linen);
    const hipR=crouch(V(L.hipHalf,L.hipY-0.01,0.0)), kneeR=V(0.16,0.32,0.11), ankR=V(0.15,0.09,0.0);
    tube(hipR,kneeR,0.060,0.045,6,P.linenDk); tube(kneeR,ankR,0.042,0.030,6,P.linen);
    for(const [ank,d] of [[ankL,V(0.05,0,1)],[ankR,V(-0.05,0,1)]]){
      const dn=d.clone().normalize();
      tube(V(ank.x,0.05,ank.z), V(ank.x,0.05,ank.z).clone().addScaledVector(dn,0.10), 0.034,0.020,5,P.linen,{raz:0.028,rbz:0.015});
      const toe=V(ank.x,0.05,ank.z).addScaledVector(dn,0.10);
      for(const off of [-0.02,0.02]) tube(toe.clone().add(V(off,0,0)), toe.clone().add(V(off,0,0.03)), 0.009,0.005,4,P.claw);
    }
  }

  /* ===== THE MUMMIFIED HUNTING BIRD — perched on the raised bandaged forearm, wings half-mantled,
     talons sunk into the wrap, a hooked beak and a shrivelled dun-feathered body. THE tell detail. ===== */
  {
    const perch = perchWrist.clone().add(V(0.02,0.05,0.02));
    /* body — a small hunched blob, feathers dry and dull */
    const body = blob(perch.x, perch.y+0.06, perch.z, 0.055,0.065,0.05, P.feather, 7, 4);
    capFan(body.at(-1), V(perch.x,perch.y+0.13,perch.z-0.01), P.featherLt);
    /* head — small, hooked beak forward */
    const hd=V(perch.x, perch.y+0.13, perch.z+0.05);
    blob(hd.x,hd.y,hd.z, 0.030,0.028,0.032, P.featherDk, 6,3);
    tube(V(hd.x,hd.y-0.01,hd.z+0.03), V(hd.x,hd.y-0.03,hd.z+0.06), 0.014,0.004,4,P.beak,{capB:{hex:P.beak}});
    /* half-mantled wings — angular flat quads swept back+down, dry/shrivelled feather edges */
    for(const s of [-1,1]){
      const wa=V(perch.x+s*0.03, perch.y+0.10, perch.z-0.01);
      const wb=V(perch.x+s*0.13, perch.y+0.02, perch.z-0.08);
      const wc=V(perch.x+s*0.09, perch.y-0.05, perch.z-0.10);
      quad(wa, V(wa.x,wa.y-0.02,wa.z), wc, wb, s>0?P.feather:P.featherDk, 0.06);
    }
    /* talons sunk into the wrapped forearm */
    for(const dx of [-0.025,0,0.025]) tube(V(perch.x+dx,perch.y-0.02,perch.z), V(perch.x+dx,perch.y-0.055,perch.z+0.02), 0.010,0.005,4,P.talon,{capB:{hex:P.talon}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
