/* dev/model-qa/creatures/rlm-toppled-minotaur-skeleton-guard.js — the TOPPLED MINOTAUR SKELETON
   GUARD (lost-world, Large undead, CR 2). A skeletal minotaur that still paces its ruined maze:
   BULL SKULL with heavy curved horns (the silhouette-defining read — must clock as minotaur before
   any bone detail), a broad ribcage, a hollow dark torso core, and a stance one degree off-true
   ("toppled" guard rebuilt slightly wrong — a listing lean). Whole-object grammar: one function,
   one frame, no anchors, held over-large war-axe authored first. NO eye quads — big dark sockets
   under the horn-brow (bone-undead convention per mon-skeleton.js). Palette: pale bone against
   near-black hollows, a notched dark-iron axe. Lost-world register: tomb-dust ivory. Large size:
   ~2.0u tall to horn-tip, base disc r=0.55. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildToppledMinotaurSkeletonGuard(){
  /* ---------- PALETTE (pale bone / near-black hollows / dark notched iron axe) ---------- */
  const P = {
    bone:0xc7bc9c, boneDk:0x998e70, boneLt:0xd9cfae,
    hollow:0x15110c, socket:0x0d0906,
    horn:0x4a4030, hornDk:0x2f281c, hornLt:0x5f5440,
    iron:0x585044, ironDk:0x3a3428, wood:0x4a3a26,
    disc:0x453d2e, discTop:0x554c37,
  };

  const L = {
    hipY:1.00, waistY:1.12, rib0Y:1.24, rib1Y:1.36, rib2Y:1.48, shldY:1.58, neckY:1.62,
    hipHalf:0.16, shoulderX:0.34,
    jawY:1.66, muzzleY:1.68, browY:1.78, crownY:1.85, topY:1.90,
  };
  /* the LISTING LEAN — one degree off-true, a guard rebuilt slightly wrong */
  const lean = (p) => V(p.x + Math.max(0,p.y-L.hipY)*0.05, p.y, p.z - Math.max(0,p.y-L.hipY)*0.03);

  /* ===== WAR-AXE FIRST — an over-large notched iron head on a long haft, held low ===== */
  const GRIP=V(0.44,0.98,0.20), HEAD=V(0.56,1.30,0.10);
  {
    const haft0=V(0.40,0.55,0.26), haft1=GRIP;
    tube(haft0,haft1,0.028,0.024,6,P.wood);
    tube(haft1, HEAD.clone().add(V(0,0.12,0)), 0.024,0.020,6,P.wood);
    /* axe head: two flared blades off a central socket */
    const ax=HEAD;
    for(const s of [-1,1]){
      const tip=ax.clone().add(V(s*0.22, 0.02, s*0.05));
      const mid=ax.clone().add(V(s*0.10,0.10,0));
      quad(ax.clone().add(V(0,-0.10,0)), mid, tip, tip.clone().add(V(0,-0.06,0)), P.iron, 0.05);
    }
    blob(ax.x,ax.y,ax.z,0.05,0.06,0.05,P.ironDk,6,4);
  }

  /* ===== PELVIS BLOCK ===== */
  stack([
    {y:L.hipY-0.02, rx:0.190, rz:0.140, hex:P.boneDk},
    {y:L.hipY+0.06, rx:0.170, rz:0.128, hex:P.bone},
    {y:L.waistY-0.02, rx:0.090, rz:0.074, hex:P.bone},
  ], 8, {xform:lean, capBot:{hex:P.boneDk, lift:0.012}});

  /* ===== TORSO CORE — dark hollow ===== */
  stack([
    {y:L.waistY, rx:0.066, rz:0.058, hex:P.hollow},
    {y:L.rib1Y,  rx:0.074, rz:0.064, hex:P.hollow},
    {y:L.shldY,  rx:0.082, rz:0.070, hex:P.hollow},
  ], 8, {xform:lean, capTop:{hex:P.hollow, lift:0.008}});

  /* ===== BROAD RIBCAGE — 3 pale band-loops, bigger than a human's, wrapping the core ===== */
  {
    const ribs=[{y:L.rib0Y,rx:0.190,rz:0.150},{y:L.rib1Y,rx:0.215,rz:0.168},{y:L.rib2Y,rx:0.195,rz:0.150}];
    for(const rb of ribs){
      const outer=ring(V(0,rb.y,0.008), V(0,1,0), rb.rx, rb.rz, 8, Math.PI/8).map(lean);
      const outer2=ring(V(0,rb.y+0.055,0.008), V(0,1,0), rb.rx*0.94, rb.rz*0.94, 8, Math.PI/8).map(lean);
      for(const arr of [outer,outer2]) for(const i of [0,5,6,7]){ arr[i].z=(arr[i].z-lean(V(0,rb.y,0)).z)*0.35+lean(V(0,rb.y,0)).z; }
      stitch([outer,outer2], ()=>P.bone);
      const inA=ring(V(0,rb.y+0.014,0.008), V(0,1,0), rb.rx-0.032, rb.rz-0.032, 8, Math.PI/8).map(lean);
      const inB=ring(V(0,rb.y+0.040,0.008), V(0,1,0), (rb.rx-0.032)*0.94, (rb.rz-0.032)*0.94, 8, Math.PI/8).map(lean);
      for(let i=1;i<5;i++){ const i2=(i+1)%8;
        quad(outer2[i], outer2[i2], inB[i2], inB[i], P.boneDk, 0.05);
        quad(inA[i], inA[i2], outer[i2], outer[i], P.boneDk, 0.05);
      }
    }
    tube(lean(V(0,L.rib0Y-0.03,0.170)), lean(V(0,L.rib2Y,0.190)), 0.034,0.028,5,P.boneLt);
  }

  /* ===== BULL SKULL — the silhouette-defining read: a broad muzzle + heavy curved horns ===== */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.100, rz:0.130, hex:P.boneDk},
      {y:L.muzzleY, rx:0.120, rz:0.150, hex:P.bone},
      {y:L.browY,   rx:0.150, rz:0.140, hex:P.boneLt},
      {y:L.crownY,  rx:0.120, rz:0.110, hex:P.bone},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph).map(lean));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), lean(V(0,L.topY,0.01)), P.bone);
    /* broad muzzle projecting forward, blunt */
    const mz0=lean(V(0,L.jawY-0.02,0.19)), mz1=lean(V(0,L.jawY-0.03,0.27));
    tube(mz0,mz1,0.100,0.070,n,P.boneDk,{raz:0.11,rbz:0.075, capB:{hex:P.hollow,lift:0.006}});
    /* two big dark sockets under the brow */
    for(const s of [-1,1]){
      const ex=s*0.075, ey=L.browY-0.01, ez=lean(V(0,0,0.16)).z;
      const base=lean(V(ex,ey,0.15));
      quad(V(base.x-0.026,base.y+0.020,base.z), V(base.x+0.026,base.y+0.020,base.z),
           V(base.x+0.022,base.y-0.022,base.z-0.01), V(base.x-0.022,base.y-0.022,base.z-0.01), P.socket, 0.0);
    }
    /* nasal gap on the muzzle */
    quad(lean(V(-0.030,L.jawY-0.01,0.245)), lean(V(0.030,L.jawY-0.01,0.245)), lean(V(0.024,L.jawY-0.05,0.25)), lean(V(-0.024,L.jawY-0.05,0.25)), P.hollow, 0.0);

    /* HEAVY CURVED HORNS — sweeping out and up from the brow, the defining silhouette element */
    for(const s of [-1,1]){
      const h0=lean(V(s*0.13, L.browY+0.01, 0.10));
      const h1=lean(V(s*0.28, L.browY+0.16, 0.02));
      const h2=lean(V(s*0.40, L.browY+0.30, -0.08));
      const h3=lean(V(s*0.46, L.browY+0.38, -0.20));
      tube(h0,h1,0.052,0.040,6,P.horn);
      tube(h1,h2,0.040,0.026,6,P.hornDk);
      tube(h2,h3,0.026,0.010,6,P.hornLt,{capB:{hex:P.hornLt,lift:0.01}});
    }
  }

  /* ===== ARMS — RIGHT to the axe grip, LEFT hangs with splayed bone-finger stubs ===== */
  {
    const knob=(p,r)=>blob(p.x,p.y,p.z,r,r*0.85,r,P.boneLt,6,4);
    const S=lean(V(L.shoulderX,L.shldY-0.02,0.02)), E=V(0.42,1.22,0.10), W=GRIP.clone();
    knob(S,0.062); tube(S,E,0.050,0.042,6,P.bone); knob(E,0.054); tube(E,W,0.042,0.036,6,P.bone); knob(W,0.048);

    const S2=lean(V(-L.shoulderX,L.shldY-0.02,0.02)), E2=V(-0.40,1.16,0.06), W2=V(-0.36,0.94,0.10);
    knob(S2,0.062); tube(S2,E2,0.050,0.042,6,P.bone); knob(E2,0.054); tube(E2,W2,0.042,0.036,6,P.bone); knob(W2,0.048);
    for(const dx of [-0.03,0,0.03]) tube(W2, W2.clone().add(V(dx,-0.10,0.06)), 0.018,0.010,4,P.boneLt,{capB:{hex:P.boneDk}});
  }

  /* ===== LEGS — heavy, one dead-straight, one bent (the "one degree off-true" guard rebuild) ===== */
  {
    const knob=(p,r)=>blob(p.x,p.y,p.z,r,r*0.85,r,P.boneLt,6,4);
    const hipL=lean(V(-L.hipHalf,L.hipY-0.02,0.0)), kneeL=V(-0.19,0.55,0.02), ankL=V(-0.19,0.11,0.0);
    knob(hipL,0.070); tube(hipL,kneeL,0.062,0.048,6,P.bone); knob(kneeL,0.058); tube(kneeL,ankL,0.046,0.036,6,P.bone); knob(ankL,0.046);
    const hipR=lean(V(L.hipHalf,L.hipY-0.02,0.0)), kneeR=V(0.22,0.58,0.10), ankR=V(0.18,0.11,-0.05);
    knob(hipR,0.070); tube(hipR,kneeR,0.062,0.048,6,P.bone); knob(kneeR,0.058); tube(kneeR,ankR,0.046,0.036,6,P.bone); knob(ankR,0.046);
    for(const [ank,toeDir] of [[ankL,V(0.04,0,1)],[ankR,V(-0.12,0,1)]]){
      const d=toeDir.clone().normalize();
      tube(V(ank.x,0.06,ank.z), V(ank.x,0.06,ank.z).clone().addScaledVector(d,0.16), 0.050,0.030,5,P.boneDk,{raz:0.04,rbz:0.022,capB:{hex:P.boneDk}});
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
