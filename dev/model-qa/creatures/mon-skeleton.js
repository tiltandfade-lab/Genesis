/* dev/model-qa/creatures/mon-skeleton.js — the UNDEAD skeleton warrior (whole-object monster).
   Same whole-object grammar as humanoid.js: one function, one geometry frame, no anchors, held
   item authored first. The read is ALL BONE: a pale oversized skull with two big DARK hollow eye
   voids (the ONE figure where large dark eye holes are correct) and a narrow jaw; a visible
   RIBCAGE — pale horizontal band-tubes wrapping a black hollow torso core; a pelvis block; limbs
   as thin ivory tubes with knobbed spheres at every joint; a notched rusty sword held loose
   (authored first); rotted belt fragments. Bone-white against near-black hollows. The stance is
   slightly WRONG — one leg dead-straight, the other bent — so it reads as a thing reassembled. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob, setChannels } from '../probe-lib.js';
import { buildBase } from '../parts.js';

/* buildSkeleton(opts): the base undead skeleton warrior. opts.flaming (2026-07-04 QA-review variant)
   recolours the bone to a fire-scorched ember palette and adds glow-tagged FLAME accents (ember tufts
   licking off the skull/ribs/shoulders, tagged on the "glow" channel via setChannels so the shader
   renders them bright). Called with NO args for the base skeleton -> byte-identical to the pre-variant
   output (opts.flaming falsy, setChannels(null) leaves every CHAN byte 0). */
export function buildSkeleton(opts = {}){
  const flaming = !!opts.flaming;
  /* ---------- PALETTE (bone against near-black hollows; VS desaturated). Flaming variant: the bone
     is scorched to warm ember-lit tones + bright flame accents on the "glow" channel. ---------- */
  const P = flaming ? {
    bone:0xc9a27a, boneDk:0x9a6c46, boneLt:0xe4c088,   /* fire-lit / scorched ivory */
    hollow:0x140b06, socket:0x0d0603,                   /* the dark torso core + eye voids (ember-black) */
    rust:0x7a4a30, rustDk:0x53331f, steel:0x8f7a5a, steelDk:0x5f4a37,  /* the sword, warmed */
    belt:0x4a3020, beltDk:0x33200f,
    ember:0xff7a1c, emberLt:0xffd24a, emberDk:0xd23c10, /* the flame accents (glow channel) */
    disc:0x3f2a1d, discTop:0x4c3524,
  } : {
    bone:0xccc2a6, boneDk:0xa89d80, boneLt:0xd8cfb4,   /* ivory / weathered ivory / bright edge */
    hollow:0x14100c, socket:0x0d0a07,                   /* the dark torso core + eye voids */
    rust:0x7a4a30, rustDk:0x53331f, steel:0x8f8574, steelDk:0x5f5647,  /* the notched rusty sword */
    belt:0x4a3a28, beltDk:0x33271a,                     /* rotted belt scraps */
    disc:0x3f362d, discTop:0x4c4238,
  };
  /* Flaming: tag the ember accents on the "glow" channel so they render bright. Base skeleton passes
     null (no channel map) -> every CHAN byte stays 0, byte-identical to the pre-variant skeleton. */
  setChannels(flaming ? { [P.ember]:"glow", [P.emberLt]:"glow", [P.emberDk]:"glow" } : null);

  /* ---------- LANDMARKS (gaunt, a touch taller than a living figure: 4.7 heads) ---------- */
  const L = {
    hipY:0.72, pelvisY:0.70, waistY:0.82, rib0Y:0.90, rib1Y:0.98, rib2Y:1.06, rib3Y:1.14,
    shldY:1.20, neckY:1.235, spineTopY:1.20,
    jawBotY:1.27, jawY:1.30, cheekY:1.375, browY:1.45, crownY:1.53, headTopY:1.585,
    hipHalf:0.10, shoulderX:0.225,
  };

  /* ===== SWORD FIRST — a notched rusty blade held loose, low and angled out to the right.
     The grip is ground truth; the right hand derives from it. ===== */
  const GRIP=V(0.30,0.66,0.26), TIP=V(0.44,0.28,0.78);
  const BLADE=new THREE.Vector3().subVectors(TIP,GRIP).normalize();
  const BUTT=GRIP.clone().addScaledVector(BLADE,-0.10);
  {
    /* grip + pommel */
    tube(BUTT, GRIP.clone().addScaledVector(BLADE,0.04), 0.019,0.019,6, P.rustDk, {capA:{hex:P.rust, lift:0.025}});
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE,0.045);
    /* crossguard bar */
    const gx=0.075, gy=0.012, gz=0.018;
    const cnr=(a,b,c)=>g0.clone().addScaledVector(gu,a*gx).addScaledVector(gv,b*gy).addScaledVector(BLADE,c*gz);
    quad(cnr(-1,-1,-1), cnr(1,-1,-1), cnr(1,1,-1), cnr(-1,1,-1), P.rustDk,0.04);
    quad(cnr(1,-1,1), cnr(-1,-1,1), cnr(-1,1,1), cnr(1,1,1), P.rustDk,0.04);
    quad(cnr(-1,-1,-1), cnr(-1,-1,1), cnr(1,-1,1), cnr(1,-1,-1), P.rust,0.04);
    quad(cnr(-1,1,-1), cnr(1,1,-1), cnr(1,1,1), cnr(-1,1,1), P.rust,0.04);
    quad(cnr(-1,-1,-1), cnr(-1,1,-1), cnr(-1,1,1), cnr(-1,-1,1), P.rust,0.04);
    quad(cnr(1,-1,-1), cnr(1,-1,1), cnr(1,1,1), cnr(1,1,-1), P.rust,0.04);
    /* the blade — a spine of cross-sections; asymmetric widths give a NOTCHED, chewed edge */
    const bl=(t,wA,wB,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,wA), c.clone().addScaledVector(gv,th),
              c.clone().addScaledVector(gu,-wB), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.02,0.040,0.040,0.010), s2=bl(0.22,0.030,0.038,0.009),  /* notch: one side eaten in */
          s3=bl(0.40,0.034,0.024,0.008), s4=bl(0.58,0.020,0.026,0.006);  /* notch the other side */
    stitch([s1,s2,s3,s4], (b)=> b===1 ? P.steelDk : P.steel);
    capFan(s4, g0.clone().addScaledVector(BLADE,0.70), P.steel);
  }

  /* ===== PELVIS BLOCK — a squat bone loft under the spine ===== */
  stack([
    {y:L.pelvisY-0.02, rx:0.150, rz:0.110, hex:P.boneDk},
    {y:L.pelvisY+0.05, rx:0.135, rz:0.100, hex:P.bone},
    {y:L.waistY-0.02,  rx:0.070, rz:0.058, hex:P.bone},
  ], 7, {capBot:{hex:P.boneDk, lift:0.01}});

  /* ===== TORSO CORE — a DARK hollow the ribs wrap. A thin near-black spine loft. ===== */
  stack([
    {y:L.waistY, rx:0.052, rz:0.046, hex:P.hollow},
    {y:L.rib1Y,  rx:0.058, rz:0.050, hex:P.hollow},
    {y:L.rib3Y,  rx:0.060, rz:0.052, hex:P.hollow},
    {y:L.shldY,  rx:0.066, rz:0.056, hex:P.hollow},
  ], 7, {capTop:{hex:P.hollow, lift:0.005}});

  /* the spine itself — a knobbed dark-bone column up the back of the core */
  {
    const seg=[[L.waistY,-0.030],[L.rib0Y,-0.034],[L.rib1Y,-0.036],[L.rib2Y,-0.038],[L.rib3Y,-0.040],[L.shldY,-0.040]];
    for(let i=0;i<seg.length-1;i++)
      tube(V(0,seg[i][0],seg[i][1]), V(0,seg[i+1][0],seg[i+1][1]), 0.026,0.024,5,P.boneDk);
    for(const [y,z] of seg) blob(0,y,z, 0.028,0.020,0.026, P.bone, 6, 4);   /* vertebra knobs */
  }

  /* ===== RIBCAGE — 4 pale horizontal band-tubes, each a flat ring hugging the dark core,
     wider at the chest and tucking in toward the spine at the back. ===== */
  {
    const ribs=[
      {y:L.rib0Y, rx:0.150, rz:0.120},
      {y:L.rib1Y, rx:0.170, rz:0.135},
      {y:L.rib2Y, rx:0.166, rz:0.130},
      {y:L.rib3Y, rx:0.140, rz:0.112},
    ];
    for(const rb of ribs){
      /* a torus-ish loop: two stacked rings, tucked in at the back (−z verts pulled toward spine) */
      const outer=ring(V(0,rb.y,0.006), V(0,1,0), rb.rx, rb.rz, 8, Math.PI/8);
      const outer2=ring(V(0,rb.y+0.045,0.006), V(0,1,0), rb.rx*0.94, rb.rz*0.94, 8, Math.PI/8);
      /* pull the rear verts (indices 5,6 — the −z arc) in toward the spine so ribs are open at back */
      for(const arr of [outer,outer2]) for(const i of [0,5,6,7]){ arr[i].z *= 0.35; arr[i].x *= 0.78; }
      stitch([outer,outer2], ()=>P.bone);
      /* a thin inner wall so the rib reads as a band, not a shell */
      const inA=ring(V(0,rb.y+0.012,0.006), V(0,1,0), rb.rx-0.026, rb.rz-0.026, 8, Math.PI/8);
      const inB=ring(V(0,rb.y+0.033,0.006), V(0,1,0), (rb.rx-0.026)*0.94, (rb.rz-0.026)*0.94, 8, Math.PI/8);
      for(const arr of [inA,inB]) for(const i of [0,5,6,7]){ arr[i].z *= 0.35; arr[i].x *= 0.78; }
      for(const i of [1,2,3,4]){ const i2=(i+1)%8;
        quad(outer2[i], outer2[i2], inB[i2], inB[i], P.boneDk, 0.05);   /* top lip */
        quad(inA[i], inA[i2], outer[i2], outer[i], P.boneDk, 0.05);     /* bottom lip */
      }
    }
    /* sternum — a short pale plate down the chest front */
    tube(V(0,L.rib0Y-0.02,0.135), V(0,L.rib3Y,0.150), 0.026,0.022,5,P.boneLt);
  }

  /* ===== SKULL — pale, oversized, with two BIG DARK eye voids + a narrow jaw ===== */
  {
    const n=8, ph=Math.PI/n;
    /* cranium loft (bulges at cheek/brow, tapers to a narrow jaw below) */
    const bands=[
      {y:L.jawBotY, rx:0.058, rz:0.070, hex:P.boneDk},   /* narrow chin */
      {y:L.jawY,    rx:0.078, rz:0.090, hex:P.bone},     /* jaw */
      {y:L.cheekY,  rx:0.108, rz:0.112, hex:P.bone},     /* cheekbones */
      {y:L.browY,   rx:0.118, rz:0.114, hex:P.boneLt},   /* brow ridge */
      {y:L.crownY,  rx:0.100, rz:0.098, hex:P.bone},     /* crown */
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph));
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){
      const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.06);
    }
    capFan(rings[4], V(0, L.headTopY, 0.004), P.bone);

    /* the two BIG DARK EYE VOIDS — deep sunk sockets, clearly SEPARATED by a bone nose bridge.
       (the one figure where big dark eye holes are correct.) Each socket is a deep recessed box:
       rim proud of the face, floor pushed WAY back so the interior reads pure black. */
    const ey=L.cheekY+0.028, ezOut=0.128, ezIn=0.040;   /* eye level ~ upper cheek, rim proud, deep floor */
    for(const s of [-1,1]){
      const exI=s*0.030, exO=s*0.088, htop=0.050, hbot=0.048;   /* inner/outer edges: bridge gap ~0.06 between them */
      const xa=Math.min(exI,exO), xb=Math.max(exI,exO);
      /* rim rectangle on the face plane */
      const rimTL=V(xa, ey+htop, ezOut), rimTR=V(xb, ey+htop, ezOut),
            rimBR=V(xb, ey-hbot, ezOut), rimBL=V(xa, ey-hbot, ezOut);
      /* floor rectangle pushed back + shrunk */
      const inx=0.014;
      const flrTL=V(xa+inx, ey+htop*0.6, ezIn), flrTR=V(xb-inx, ey+htop*0.6, ezIn),
            flrBR=V(xb-inx, ey-hbot*0.6, ezIn), flrBL=V(xa+inx, ey-hbot*0.6, ezIn);
      /* recessed side walls (dark) */
      quad(rimTL, rimTR, flrTR, flrTL, P.socket, 0.02);
      quad(rimBR, rimBL, flrBL, flrBR, P.socket, 0.02);
      quad(rimTR, rimBR, flrBR, flrTR, P.socket, 0.02);
      quad(rimBL, rimTL, flrTL, flrBL, P.socket, 0.02);
      /* the void floor — the darkest quad */
      quad(flrTL, flrTR, flrBR, flrBL, P.hollow, 0.0);
    }
    /* nasal cavity — a small dark inverted-triangle void below the bridge, between the sockets */
    const ny=L.cheekY;
    quad(V(-0.016,ny+0.01,0.122), V(0.016,ny+0.01,0.122), V(0.010,ny-0.05,0.078), V(-0.010,ny-0.05,0.078), P.socket, 0.02);

    /* the JAW — a narrow separate bone bar, slightly dropped/agape, with a visible teeth band */
    const jl=V(-0.050,L.jawBotY,0.03), jr=V(0.050,L.jawBotY,0.03),
          jf=V(0,L.jawBotY-0.035,0.104);
    tube(jl, jf, 0.021,0.019,5,P.boneDk);
    tube(jf, jr, 0.019,0.021,5,P.boneDk);
    /* teeth — a pale band across the mouth line (upper) + a dark gap so the grin reads */
    tube(V(-0.058,L.jawY-0.008,0.075), V(0.058,L.jawY-0.008,0.075), 0.013,0.012,4,P.boneLt);
    quad(V(-0.052,L.jawY-0.028,0.098), V(0.052,L.jawY-0.028,0.098),
         V(0.048,L.jawBotY+0.008,0.086), V(-0.048,L.jawBotY+0.008,0.086), P.socket, 0.02);  /* mouth gap */
  }

  /* ===== ARMS — thin ivory tubes, knobbed at shoulder / elbow / wrist. Right derives from GRIP. ===== */
  {
    /* joint-knob helper */
    const knob=(p,r)=>blob(p.x,p.y,p.z, r,r*0.85,r, P.boneLt, 6, 4);

    /* RIGHT arm → the sword grip */
    const S=V(L.shoulderX, L.shldY-0.02, 0.01);
    const FIST=GRIP.clone().addScaledVector(BLADE,-0.01);
    const E=V(0.305,0.94,0.11);                       /* elbow */
    const W=FIST.clone().add(V(-0.02,0.05,-0.04));     /* wrist */
    knob(S,0.052);
    tube(S,E,0.036,0.030,6,P.bone);                    /* humerus */
    knob(E,0.044);
    tube(E,W,0.030,0.026,6,P.bone);                    /* forearm */
    knob(W,0.036);
    /* hand: a short bone tube wrapping the grip */
    tube(FIST.clone().addScaledVector(BLADE,-0.05), FIST.clone().addScaledVector(BLADE,0.05), 0.036,0.032,6,P.boneLt,{capA:{hex:P.boneLt},capB:{hex:P.boneLt}});

    /* LEFT arm — hangs, reaching slightly, fingers as splayed bone stubs */
    const S2=V(-L.shoulderX, L.shldY-0.02, 0.01), E2=V(-0.31,0.93,0.06), W2=V(-0.285,0.70,0.13);
    knob(S2,0.052);
    tube(S2,E2,0.036,0.030,6,P.bone);
    knob(E2,0.044);
    tube(E2,W2,0.030,0.026,6,P.bone);
    knob(W2,0.036);
    /* three finger-bone stubs */
    for(const dx of [-0.03,0,0.03]){
      const d=V(dx,-0.30,0.9).normalize();
      tube(W2, W2.clone().addScaledVector(d,0.075), 0.014,0.009,4,P.boneLt,{capB:{hex:P.boneDk}});
    }
  }

  /* ===== BELT FRAGMENTS — a couple of rotted leather scraps clinging at the pelvis ===== */
  {
    /* a broken belt: two short arcs at the front-sides, not a full loop (rotted away at back) */
    for(const s of [-1,1]){
      const a=V(s*0.05,0.735,0.115), b=V(s*0.145,0.720,0.02);
      tube(a,b,0.016,0.013,4,P.belt,{capA:{hex:P.beltDk},capB:{hex:P.beltDk}});
    }
    /* one hanging strap remnant */
    tube(V(-0.05,0.72,0.115), V(-0.07,0.60,0.10), 0.012,0.008,4,P.beltDk,{capB:{hex:P.beltDk}});
  }

  /* ===== LEGS — thin ivory tubes, knobbed joints. THE WRONG STANCE: left leg dead-straight,
     right leg bent at the knee (a thing reassembled slightly off). ===== */
  {
    const knob=(p,r)=>blob(p.x,p.y,p.z, r,r*0.85,r, P.boneLt, 6, 4);
    /* LEFT — dead straight, vertical */
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.0), kneeL=V(-0.115,0.38,0.005), ankL=V(-0.115,0.075,0.005);
    knob(hipL,0.046); tube(hipL,kneeL,0.040,0.032,6,P.bone); knob(kneeL,0.040); tube(kneeL,ankL,0.032,0.026,6,P.bone); knob(ankL,0.032);
    /* RIGHT — bent, knee pushed forward + out */
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.0), kneeR=V( 0.155,0.40,0.075), ankR=V( 0.135,0.075,-0.03);
    knob(hipR,0.046); tube(hipR,kneeR,0.040,0.032,6,P.bone); knob(kneeR,0.040); tube(kneeR,ankR,0.032,0.026,6,P.bone); knob(ankR,0.032);
    /* bare bone feet — a flat pale plate + a couple of toe stubs each */
    for(const [ank,toeDir] of [[ankL,V(0.03,0,1)], [ankR,V(-0.10,0,1)]]){
      const d=toeDir.clone().normalize();
      tube(V(ank.x,0.045,ank.z), V(ank.x,0.045,ank.z).clone().addScaledVector(d,0.11), 0.034,0.020,5,P.boneDk,{capB:{hex:P.boneDk},raz:0.026,rbz:0.016});
      const toe=V(ank.x,0.045,ank.z).addScaledVector(d,0.11);
      for(const off of [-0.02,0.02]) tube(toe.clone().add(V(off,0,0)), toe.clone().add(V(off,0,0.03)), 0.009,0.007,4,P.boneLt);
    }
  }

  /* ===== FLAME ACCENTS (flaming variant only) — ember tufts licking UP off the skull, shoulders and
     ribcage. Each tuft is a small fan of tapering flame quads (dark ember base -> bright ember tip),
     on the "glow" channel so they render bright. Placed so the silhouette reads as a burning skeleton. */
  if(flaming){
    const flameTuft=(base, up, h, w, seed)=>{
      const u=up.clone().normalize();
      const side=Math.abs(u.y)>0.9?V(1,0,0):new THREE.Vector3().crossVectors(u,V(0,0,1)).normalize();
      const fwd=new THREE.Vector3().crossVectors(u,side).normalize();
      for(let k=0;k<3;k++){
        const a=(k/3)*Math.PI*2 + seed;
        const off=side.clone().multiplyScalar(Math.cos(a)*w).addScaledVector(fwd, Math.sin(a)*w);
        const b0=base.clone().add(off.clone().multiplyScalar(0.6));
        const mid=base.clone().addScaledVector(u, h*0.55).add(off.clone().multiplyScalar(0.35)).add(V(0,0,0));
        const tip=base.clone().addScaledVector(u, h).add(off.clone().multiplyScalar(0.1));
        const perp=off.clone().normalize().multiplyScalar(w*0.45).add(V(0,0,0.008));
        // base->mid (dark ember), mid->tip (bright)
        quad(b0.clone().sub(perp), b0.clone().add(perp), mid.clone().add(perp.clone().multiplyScalar(0.5)), mid.clone().sub(perp.clone().multiplyScalar(0.5)), P.emberDk, 0.10);
        quad(mid.clone().sub(perp.clone().multiplyScalar(0.5)), mid.clone().add(perp.clone().multiplyScalar(0.5)), tip.clone().add(perp.clone().multiplyScalar(0.15)), tip.clone().sub(perp.clone().multiplyScalar(0.15)), (k%2?P.emberLt:P.ember), 0.10);
      }
    };
    // crown of flame off the skull top
    flameTuft(V(0, L.headTopY-0.02, 0.0), V(0,1,0.05), 0.34, 0.075, 0.0);
    // shoulder ember tufts
    flameTuft(V(-L.shoulderX*0.9, L.shldY+0.02, 0.0), V(-0.2,1,0.1), 0.24, 0.060, 1.1);
    flameTuft(V( L.shoulderX*0.9, L.shldY+0.02, 0.0), V(0.2,1,0.1),  0.24, 0.060, 2.2);
    // ribcage flame licks (front + a couple sides)
    flameTuft(V(0, L.rib2Y, 0.16), V(0.05,1,0.4), 0.20, 0.055, 0.5);
    flameTuft(V(-0.14, L.rib1Y, 0.02), V(-0.4,1,0.2), 0.18, 0.050, 1.7);
    flameTuft(V( 0.14, L.rib1Y, 0.02), V(0.4,1,0.2),  0.18, 0.050, 2.7);
    // ember eyes-in-the-sockets glow (two small bright pips deep in the voids — the burning-eye read,
    // NOT painted face eyes: they sit inside the anatomical sockets on the glow channel)
    const ey=L.cheekY+0.028;
    for(const s of [-1,1]){
      const ex=s*0.058;
      quad(V(ex-0.014,ey+0.010,0.055), V(ex+0.014,ey+0.010,0.055),
           V(ex+0.012,ey-0.012,0.055), V(ex-0.012,ey-0.012,0.055), P.emberLt, 0.05);
    }
  }

  /* base disc — shared module */
  buildBase(P);
  setChannels(null);   // reset so the shared frame doesn't carry this module's channel map onward
}

/* buildFlamingSkeleton — the 2026-07-04 QA-review FLAMING SKELETON variant (bestiary flaming-skeleton):
   the same skeleton silhouette scorched ember + wreathed in glow-tagged flame accents. */
export function buildFlamingSkeleton(){ buildSkeleton({ flaming:true }); }
