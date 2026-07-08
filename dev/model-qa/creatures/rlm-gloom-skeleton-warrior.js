/* dev/model-qa/creatures/rlm-gloom-skeleton-warrior.js — the SKELETON WARRIOR (HUMANOID/skeletal
   family, Medium, CR 1-2, realm gloom). MODEL-FOUNDRY pass-1 (2026-07-08 foundry pilot). Whole-object
   grammar: one function, one geometry frame, no anchors, held items authored first. Distinct chassis
   from the bare mon-skeleton.js: this is a TRAINED SOLDIER — kit and stance, not a loose bag of bones.
   Realm flavor pulled from data/realm-bestiary.js gloom entries "Bog-Sunk Revenant" (peat-bog hanged
   man risen with the noose) + "Ossified Bell-Ringer" (skeleton still ringing an unheard dusk bell) —
   both frame:skeleton-warrior. Garnish: the noose still knotted at the throat, battered dark-iron kit.

   FEATURE CHECKLIST (the ~1.7-1.9k budget buys):
     1. Skeletal HUMANOID core (ANATOMY-CANON: family covered by the PC kit grammar, correctness rides
        on the mon-skeleton bone reading) — pale bone skull w/ two big dark eye voids, a knobbed spine,
        an open ribcage, knobbed limb joints. Correctness first, THEN the signature.
     2. Partial dark-iron kit — a battered breastplate patch over the front ribs only (sides/back stay
        bare bone), a single asymmetric pauldron on the shield shoulder, one shin greave on the lead
        leg. Distinct from the bare skeleton: this one was ARMED for war.
     3. Kite shield raised in guard, held forward in the left hand — the biggest flat silhouette shape,
        carries the model's primary high-value zone (a pale worn-iron rim/boss against the dark face).
     4. Blade drawn back over the right shoulder, cocked to strike — NOT mid-swing (that's the bare
        skeleton's signature), a held wind-up: a trained soldier's stance the bare skeleton never has.
     5. SIGNATURE — the hanging noose: a pale frayed rope loop still knotted around the neck vertebrae,
        one long frayed tail trailing down the spine. Lightest, warmest color in the model (law 3 —
        the loud feature carries the value contrast, reads against both the dark hollow torso and the
        dark iron kit).
     6. Battered brow-band — a single broken skullcap arc riding low over the brow (the helm mostly
        gone), so the "kit" read survives even at a squint without hiding the skull.

   POSE SENTENCE: a trained soldier's guard — shield raised and forward in the lead hand, blade drawn
   back and cocked over the far shoulder ready to strike, front (shield-side) leg planted and bent
   taking the weight, trailing leg braced back for the launch — coiled and ready, never at attention.

   Whole-object grammar: spine +z (front), up +y, ground y=0. Imported by ps1-sheet.html
   (SETS['gloom-w1'], cell 4). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob, setChannels } from '../probe-lib.js';
import { buildBase } from '../parts.js';

export function buildSkeletonWarrior(){
  /* ---------- PALETTE (bone against near-black hollows; dark tarnished iron kit; the noose is the
     lightest warmest note in the model — the law-3 payload). ---------- */
  const P = {
    bone:0xccc2a6, boneDk:0xa89d80, boneLt:0xd8cfb4,      // ivory / weathered ivory / bright edge
    hollow:0x14100c, socket:0x0d0a07,                      // dark torso core + eye voids
    iron:0x585a62, ironDk:0x3a3c42, ironLt:0x9096a0,       // battered dark-iron kit (R2: lifted off
                                                             // near-black — law 3, was vanishing into
                                                             // the void at 1/3-res)
    rust:0x6e5238, rustDk:0x453422,                        // rust streaks on the kit
    steel:0x83786a, steelDk:0x584f45,                      // the notched blade
    rope:0xd6bc84, ropeDk:0xaa8f5c, ropeLt:0xecd9a4,       // the noose — the pale high-value signature
    disc:0x3f362d, discTop:0x4c4238,
  };
  setChannels(null);

  /* ---------- LANDMARKS (same bone-family scale as mon-skeleton for chassis consistency) ---------- */
  const L = {
    hipY:0.72, pelvisY:0.70, waistY:0.82, rib0Y:0.90, rib1Y:0.98, rib2Y:1.06, rib3Y:1.14,
    shldY:1.20, neckY:1.235, spineTopY:1.20,
    jawBotY:1.27, jawY:1.30, cheekY:1.375, browY:1.45, crownY:1.53, headTopY:1.585,
    hipHalf:0.10, shoulderX:0.225,
  };

  /* ===== BLADE FIRST — drawn back and cocked over the RIGHT shoulder, point up-and-back, a held
     wind-up (not a swing in flight). The grip is ground truth; the right hand derives from it. ===== */
  const GRIP=V(0.30,1.24,-0.20), TIP=V(0.58,1.70,-0.52);
  const BLADE=new THREE.Vector3().subVectors(TIP,GRIP).normalize();
  const BUTT=GRIP.clone().addScaledVector(BLADE,-0.10);
  {
    tube(BUTT, GRIP.clone().addScaledVector(BLADE,0.04), 0.019,0.019,6, P.rustDk, {capA:{hex:P.rust, lift:0.025}});
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE,0.045);
    const gx=0.070, gy=0.011, gz=0.017;
    const cnr=(a,b,c)=>g0.clone().addScaledVector(gu,a*gx).addScaledVector(gv,b*gy).addScaledVector(BLADE,c*gz);
    quad(cnr(-1,-1,-1), cnr(1,-1,-1), cnr(1,1,-1), cnr(-1,1,-1), P.rustDk,0.04);
    quad(cnr(1,-1,1), cnr(-1,-1,1), cnr(-1,1,1), cnr(1,1,1), P.rustDk,0.04);
    quad(cnr(-1,-1,-1), cnr(-1,-1,1), cnr(1,-1,1), cnr(1,-1,-1), P.iron,0.04);
    quad(cnr(-1,1,-1), cnr(1,1,-1), cnr(1,1,1), cnr(-1,1,1), P.iron,0.04);
    quad(cnr(-1,-1,-1), cnr(-1,1,-1), cnr(-1,1,1), cnr(-1,-1,1), P.iron,0.04);
    quad(cnr(1,-1,-1), cnr(1,-1,1), cnr(1,1,1), cnr(1,1,-1), P.iron,0.04);
    const bl=(t,wA,wB,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,wA), c.clone().addScaledVector(gv,th),
              c.clone().addScaledVector(gu,-wB), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.02,0.038,0.038,0.010), s2=bl(0.24,0.028,0.036,0.009),
          s3=bl(0.42,0.032,0.022,0.008), s4=bl(0.58,0.018,0.024,0.006);
    stitch([s1,s2,s3,s4], (b)=> b===1 ? P.steelDk : P.steel);
    capFan(s4, g0.clone().addScaledVector(BLADE,0.68), P.steel);
  }

  /* ===== SHIELD — a kite shape held forward in the LEFT hand, the guard-up read. Held roughly
     facing +z (the camera) with a slight outward tilt so it reads in 3/4 as well as front. ===== */
  const shieldCenter = V(-0.20, 0.94, 0.30);
  {
    const nrm = V(0.18, 0, 0.98).normalize();               // slight outward tilt
    const up2 = V(0,1,0), side = new THREE.Vector3().crossVectors(up2, nrm).normalize();
    const pt = (dx,dy,dz)=> V(
      shieldCenter.x + side.x*dx + up2.x*dy + nrm.x*dz,
      shieldCenter.y + side.y*dx + up2.y*dy + nrm.y*dz,
      shieldCenter.z + side.z*dx + up2.z*dy + nrm.z*dz);
    /* kite silhouette: wide flat top, tapering to a point at the bottom — 3 bands stitched */
    const top   = [pt(-0.155,0.28,0.0), pt(0.155,0.28,0.0), pt(0.170,0.16,0.0), pt(-0.170,0.16,0.0)];
    const mid   = [pt(-0.170,0.16,0.0), pt(0.170,0.16,0.0), pt(0.110,-0.10,0.0), pt(-0.110,-0.10,0.0)];
    /* kite tip in the SHIELD's local frame (pt), not world space — the world-space version
       drove the tip through the floor to y=-0.36 (caught by verify-theater-figures bbox gate) */
    const point = pt(0, -0.36, 0.0);
    /* face — pale worn-iron rim reads as the value-contrast zone, dark iron field behind it */
    quad(top[0], top[1], top[2], top[3], P.ironLt, 0.03);
    quad(mid[0], mid[1], mid[2], mid[3], P.iron, 0.03);
    quad(mid[3], mid[2], point, point, P.ironDk, 0.03);
    /* back face (thin — reads from the rear turnaround) */
    const backOff = nrm.clone().multiplyScalar(-0.028);
    const bpt = arr => arr.map(p=>p.clone().add(backOff));
    const topB=bpt(top), midB=bpt(mid), pointB=point.clone().add(backOff);
    quad(topB[3], topB[2], topB[1], topB[0], P.ironDk, 0.03);
    quad(midB[3], midB[2], midB[1], midB[0], P.ironDk, 0.03);
    quad(pointB, pointB, midB[2], midB[3], P.ironDk, 0.03);
    /* thin edge rim so the shield has real 0.04u+ volume, not a paper card */
    for(const [a,b] of [[top[0],topB[0]],[top[1],topB[1]],[point,pointB]])
      quad(a,b,b,a,P.ironDk,0.02);
    /* boss — a small raised dome at the shield's center, the loud circular high-value note (R2:
       ironLt lifted well off the field so this reads as a bright glint, not a same-value bump) */
    blob(shieldCenter.x+nrm.x*0.02, shieldCenter.y+0.05, shieldCenter.z+nrm.z*0.02, 0.052,0.052,0.030, P.ironLt, 6, 3);
  }

  /* ===== PELVIS BLOCK ===== */
  stack([
    {y:L.pelvisY-0.02, rx:0.150, rz:0.110, hex:P.boneDk},
    {y:L.pelvisY+0.05, rx:0.135, rz:0.100, hex:P.bone},
    {y:L.waistY-0.02,  rx:0.070, rz:0.058, hex:P.bone},
  ], 7, {capBot:{hex:P.boneDk, lift:0.01}});

  /* ===== TORSO CORE — dark hollow the ribs/breastplate wrap ===== */
  stack([
    {y:L.waistY, rx:0.052, rz:0.046, hex:P.hollow},
    {y:L.rib1Y,  rx:0.058, rz:0.050, hex:P.hollow},
    {y:L.rib3Y,  rx:0.060, rz:0.052, hex:P.hollow},
    {y:L.shldY,  rx:0.066, rz:0.056, hex:P.hollow},
  ], 7, {capTop:{hex:P.hollow, lift:0.005}});

  /* the spine — a knobbed dark-bone column up the back of the core */
  {
    const seg=[[L.waistY,-0.030],[L.rib0Y,-0.034],[L.rib1Y,-0.036],[L.rib2Y,-0.038],[L.rib3Y,-0.040],[L.shldY,-0.040]];
    for(let i=0;i<seg.length-1;i++)
      tube(V(0,seg[i][0],seg[i][1]), V(0,seg[i+1][0],seg[i+1][1]), 0.026,0.024,5,P.boneDk);
    for(const [y,z] of seg) blob(0,y,z, 0.028,0.020,0.026, P.bone, 6, 4);
  }

  /* ===== RIBCAGE — 3 pale band-loops, open at the back. The front-center third rib is largely hidden
     behind the breastplate patch (built after), leaving the SIDES exposed — bone still reads even
     under the kit (law 4: anatomy first, kit rides on top). ===== */
  {
    const ribs=[
      {y:L.rib0Y, rx:0.150, rz:0.120},
      {y:L.rib2Y, rx:0.164, rz:0.128},
      {y:L.rib3Y, rx:0.140, rz:0.112},
    ];
    for(const rb of ribs){
      const outer=ring(V(0,rb.y,0.006), V(0,1,0), rb.rx, rb.rz, 8, Math.PI/8);
      const outer2=ring(V(0,rb.y+0.040,0.006), V(0,1,0), rb.rx*0.94, rb.rz*0.94, 8, Math.PI/8);
      for(const arr of [outer,outer2]) for(const i of [0,5,6,7]){ arr[i].z *= 0.35; arr[i].x *= 0.78; }
      stitch([outer,outer2], ()=>P.bone);
    }
  }

  /* ===== BREASTPLATE PATCH — a battered dark-iron plate over the front-center chest only, hip-
     level to shoulder, NOT wrapping the sides/back (ribs stay exposed there). Cracked lower corner. */
  {
    const bpY0=L.waistY+0.01, bpY1=L.shldY-0.03, bhw0=0.075, bhw1=0.098, z0=0.150, z1=0.168;
    const bl=V(-bhw0,bpY0,z0), br=V(bhw0,bpY0,z0), tl=V(-bhw1,bpY1,z1), tr=V(bhw1,bpY1,z1);
    /* a chipped lower-right corner — a notch cut into the plate, dark-iron edge showing thickness */
    const notch=V(bhw0*0.35, bpY0+0.055, z0+0.006);
    quad(bl, notch, notch, tl, P.iron, 0.05);
    quad(notch, br, tr, notch, P.iron, 0.05);
    /* rust streak + rivets across the plate */
    tube(V(-0.02,bpY0+0.03,z0+0.01), V(0.015,bpY1-0.02,z1+0.005), 0.010,0.008,4,P.rust);
    for(const rx of [-0.05,0.05]) blob(rx, (bpY0+bpY1)/2, (z0+z1)/2+0.01, 0.012,0.012,0.010, P.ironDk, 4, 2);
    /* plate edge thickness (a thin dark strip along the top) */
    quad(tl, tr, V(bhw1,bpY1+0.012,z1-0.01), V(-bhw1,bpY1+0.012,z1-0.01), P.ironDk, 0.03);
  }

  /* ===== PAULDRON — a single asymmetric iron dome on the LEFT (shield) shoulder only. ===== */
  blob(-L.shoulderX*0.96, L.shldY+0.015, 0.01, 0.078,0.052,0.070, P.iron, 6, 3);
  blob(-L.shoulderX*0.96, L.shldY+0.045, 0.01, 0.040,0.022,0.036, P.ironLt, 5, 2);   /* rivet cap highlight */

  /* ===== SKULL — pale, oversized, two BIG DARK eye voids + a narrow jaw (same correctness read as
     the bare skeleton — armor is garnish, not a substitute for the anatomy). ===== */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawBotY, rx:0.058, rz:0.070, hex:P.boneDk},
      {y:L.jawY,    rx:0.078, rz:0.090, hex:P.bone},
      {y:L.cheekY,  rx:0.108, rz:0.112, hex:P.bone},
      {y:L.browY,   rx:0.118, rz:0.114, hex:P.boneLt},
      {y:L.crownY,  rx:0.100, rz:0.098, hex:P.bone},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph));
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){
      const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.06);
    }
    capFan(rings[4], V(0, L.headTopY, 0.004), P.bone);

    const ey=L.cheekY+0.028, ezOut=0.128, ezIn=0.040;
    for(const s of [-1,1]){
      const exI=s*0.030, exO=s*0.088, htop=0.050, hbot=0.048;
      const xa=Math.min(exI,exO), xb=Math.max(exI,exO);
      const rimTL=V(xa, ey+htop, ezOut), rimTR=V(xb, ey+htop, ezOut),
            rimBR=V(xb, ey-hbot, ezOut), rimBL=V(xa, ey-hbot, ezOut);
      const inx=0.014;
      const flrTL=V(xa+inx, ey+htop*0.6, ezIn), flrTR=V(xb-inx, ey+htop*0.6, ezIn),
            flrBR=V(xb-inx, ey-hbot*0.6, ezIn), flrBL=V(xa+inx, ey-hbot*0.6, ezIn);
      quad(rimTL, rimTR, flrTR, flrTL, P.socket, 0.02);
      quad(rimBR, rimBL, flrBL, flrBR, P.socket, 0.02);
      quad(rimTR, rimBR, flrBR, flrTR, P.socket, 0.02);
      quad(rimBL, rimTL, flrTL, flrBL, P.socket, 0.02);
      quad(flrTL, flrTR, flrBR, flrBL, P.hollow, 0.0);
    }
    const ny=L.cheekY;
    quad(V(-0.016,ny+0.01,0.122), V(0.016,ny+0.01,0.122), V(0.010,ny-0.05,0.078), V(-0.010,ny-0.05,0.078), P.socket, 0.02);

    const jawDrop=0.05;
    const jl=V(-0.050,L.jawBotY-jawDrop,0.05), jr=V(0.050,L.jawBotY-jawDrop,0.05),
          jf=V(0,L.jawBotY-jawDrop-0.026,0.115);
    tube(jl, jf, 0.021,0.019,5,P.boneDk);
    tube(jf, jr, 0.019,0.021,5,P.boneDk);
    tube(V(-0.058,L.jawY-0.008,0.075), V(0.058,L.jawY-0.008,0.075), 0.013,0.012,4,P.boneLt);
    quad(V(-0.052,L.jawY-0.024,0.100), V(0.052,L.jawY-0.024,0.100),
         V(0.046,L.jawBotY-jawDrop+0.012,0.090), V(-0.046,L.jawBotY-jawDrop+0.012,0.090), P.socket, 0.02);

    /* battered brow-band — a broken skullcap arc riding low across the brow, the last of the helm.
       Two short arcs (a gap at the front where it's shattered) so the skull-read stays clear. */
    const bandY=L.browY+0.005;
    for(const [a,b] of [[-0.62,-0.12],[0.14,0.60]]){
      const seg=[]; const steps=3;
      for(let i=0;i<=steps;i++){
        const t=a+(b-a)*(i/steps);
        seg.push(V(Math.sin(t)*0.122, bandY, Math.cos(t)*0.118+0.006));
      }
      for(let i=0;i<steps;i++)
        tube(seg[i], seg[i+1], 0.014,0.014,4,P.ironDk,{capA:{hex:P.ironDk},capB:{hex:P.ironDk}});
    }
  }

  /* ===== THE NOOSE — SIGNATURE. A pale frayed rope loop knotted around the neck vertebrae (between
     the ribcage and skull), one long frayed tail trailing down the spine. Rope color is the lightest
     warmest note in the model — law 3's payload. ===== */
  {
    const ny=L.neckY+0.012, nz=0.0, rx=0.074, rz=0.070;
    const loop=ring(V(0,ny,nz+0.006), V(0,1,0), rx, rz, 8, Math.PI/8);
    for(let i=0;i<8;i++){
      const a=loop[i], b=loop[(i+1)%8];
      tube(a, b, 0.026,0.024,4, i%2 ? P.rope : P.ropeDk);
    }
    /* the knot — a small rough knob at the front where the noose cinches. R2 CRITIC FIX: loop
       radius + tube thickness both bumped (was reading as a thin sliver tucked under the jaw at
       1/3-res) so the pale/warm signature actually breaks the silhouette against the jaw/collar. */
    blob(0, ny-0.01, nz+rz+0.02, 0.036,0.028,0.028, P.ropeDk, 5, 3);
    /* frayed tail — trails down the spine on the SWORD side (away from the shield, which would
       otherwise occlude it from most turnaround angles), splitting into 2 loose fiber ends near
       the bottom. R2 CRITIC FIX: widened radii + moved off-center (+x) so it reads as a distinct
       pale streak, not a thin sliver buried against the spine/shield silhouette. */
    const tail0=V(0.03, ny-0.02, nz-rz-0.01), tail1=V(0.075, 0.96, -0.06), tail2=V(0.095, 0.80, -0.10);
    tube(tail0, tail1, 0.021,0.017,4, P.rope);
    tube(tail1, tail2, 0.017,0.010,4, P.ropeLt);
    for(const dx of [-0.02,0.025])
      tube(tail2, tail2.clone().add(V(dx,-0.10,-0.02)), 0.008,0.004,3, P.ropeLt, {capB:{hex:P.ropeLt}});
  }

  /* ===== ARMS ===== */
  {
    const knob=(p,r)=>blob(p.x,p.y,p.z, r,r*0.85,r, P.boneLt, 6, 4);

    /* RIGHT arm — drawn back and cocked over the shoulder into the sword grip. */
    const S=V(L.shoulderX, L.shldY-0.02, 0.01);
    const FIST=GRIP.clone().addScaledVector(BLADE,-0.01);
    const E=V(0.36,1.44,-0.28);
    const W=FIST.clone().add(V(-0.02,0.03,-0.03));
    knob(S,0.052);
    tube(S,E,0.036,0.030,6,P.bone);
    knob(E,0.044);
    tube(E,W,0.030,0.026,6,P.bone);
    knob(W,0.036);
    tube(FIST.clone().addScaledVector(BLADE,-0.05), FIST.clone().addScaledVector(BLADE,0.05), 0.036,0.032,6,P.boneLt,{capA:{hex:P.boneLt},capB:{hex:P.boneLt}});

    /* LEFT arm — bent forward, forearm horizontal, gripping the shield strap. Pauldron already
       covers the shoulder knob so this starts from the upper arm. */
    const S2=V(-L.shoulderX, L.shldY-0.03, 0.01), E2=V(-0.26,1.02,0.14), W2=shieldCenter.clone().add(V(0.02,-0.06,-0.10));
    knob(S2,0.050);
    tube(S2,E2,0.034,0.030,6,P.bone);
    knob(E2,0.042);
    tube(E2,W2,0.028,0.024,6,P.bone);
    knob(W2,0.034);
  }

  /* ===== BELT FRAGMENTS ===== */
  {
    for(const s of [-1,1]){
      const a=V(s*0.05,0.735,0.115), b=V(s*0.145,0.720,0.02);
      tube(a,b,0.016,0.013,4,P.rustDk,{capA:{hex:P.rustDk},capB:{hex:P.rustDk}});
    }
  }

  /* ===== LEGS — a GUARD stance: the left (shield-side) leg planted forward and bent, taking the
     weight; the right leg braced back, ready to launch the strike. Not a lunge already in motion —
     coiled, held. ===== */
  {
    const knob=(p,r)=>blob(p.x,p.y,p.z, r,r*0.85,r, P.boneLt, 6, 4);
    /* LEFT — forward, planted, bent (weight-bearing) */
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.0), kneeL=V(-0.155,0.40,0.175), ankL=V(-0.135,0.045,0.320);
    knob(hipL,0.046); tube(hipL,kneeL,0.040,0.032,6,P.bone); knob(kneeL,0.040); tube(kneeL,ankL,0.032,0.026,6,P.bone); knob(ankL,0.032);
    /* RIGHT — braced back, straighter, heel lifted */
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.0), kneeR=V( 0.125,0.42,-0.190), ankR=V( 0.100,0.090,-0.335);
    knob(hipR,0.046); tube(hipR,kneeR,0.040,0.032,6,P.bone); knob(kneeR,0.040); tube(kneeR,ankR,0.032,0.026,6,P.bone); knob(ankR,0.032);
    /* bare bone feet — left flat/forward (planted), right toe-down (heel raised, braced) */
    for(const [ank,toeDir,footY] of [[ankL,V(0.06,0,1),0.045], [ankR,V(-0.10,0,1),0.090]]){
      const d=toeDir.clone().normalize();
      tube(V(ank.x,footY,ank.z), V(ank.x,footY,ank.z).clone().addScaledVector(d,0.11), 0.034,0.020,5,P.boneDk,{capB:{hex:P.boneDk},raz:0.026,rbz:0.016});
      const toe=V(ank.x,footY,ank.z).addScaledVector(d,0.11);
      for(const off of [-0.02,0.02]) tube(toe.clone().add(V(off,0,0)), toe.clone().add(V(off,0,0.03)), 0.009,0.007,4,P.boneLt);
    }
    /* SHIN GREAVE — one battered iron half-shell on the forward (left) shin only, asymmetric kit. */
    {
      const g0=kneeL.clone().add(V(0,-0.02,0.01)), g1=ankL.clone().add(V(0,0.03,0.01));
      const axis=new THREE.Vector3().subVectors(g1,g0).normalize();
      const gu=new THREE.Vector3().crossVectors(V(0,1,0),axis).normalize();
      const front=new THREE.Vector3().crossVectors(axis,gu).normalize();
      const band=(t,w)=>{ const c=g0.clone().lerp(g1,t);
        return [c.clone().addScaledVector(gu,-w).addScaledVector(front,0.02),
                c.clone().addScaledVector(front,w+0.02),
                c.clone().addScaledVector(gu,w).addScaledVector(front,0.02)]; };
      const b0=band(0.05,0.045), b1=band(0.55,0.040), b2=band(0.95,0.032);
      for(const bnd of [[b0,b1],[b1,b2]]){
        const [ra,rb]=bnd;
        for(let i=0;i<2;i++) quad(ra[i],ra[i+1],rb[i+1],rb[i],P.iron,0.04);
      }
      quad(b0[0],b0[1],b0[2],b0[2],P.ironDk,0.03);
    }
  }

  /* base disc */
  buildBase(P);
}
