/* dev/model-qa/creatures/rlm-shared-mastiff.js — the MASTIFF landmark table (QUADRUPED-
   DIGITIGRADE family, Medium, CR 1/8, CROSS-REALM shared body), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-09 foundry pilot, catchall-w1 cell 2).
   Neutral core identity — no single realm's palette gimmicks (brindle brown, the guard-dog's
   own coat). Completes the canine ladder: jackal (lean) < wolf < MASTIFF (bulky domestic) <
   dire-wolf < worg. Must read distinct from every wolf-family file in silhouette alone: this is
   a short, thick, low-slung BULK read (barrel chest, heavy jowled head, cropped tail) versus the
   leggy stretched-out wolf/dire-wolf read — a guard dog planted at its post, not a hunter mid-run.

   FEATURE CHECKLIST (the ~1.1-1.6k budget buys):
     1. QUADRUPED-DIGITIGRADE BULKY anatomy (anatomy chief criterion): heavy jowled head on a
        thick blended neck, barrel chest (deep + wide, not the wolf's narrow deep-chest/belly-
        tuck read — mastiff belly tuck is much shallower, reads solid front-to-back), true
        4-segment digitigrade hind Z-zigzag but shortened/thickened (stubby, planted legs, not
        long stretched wolf legs), near-straight thick front columns.
     2. SIGNATURE — the studded COLLAR (the high-value band, law 3 payload): a thick banded
        collar ringing the base of the neck, pale metal studs at even intervals catching the
        light against the dark leather band and the darker coat around it. The one loud
        exaggerated feature (law 4) — reads as a bright horizontal ring breaking the silhouette
        even before the head registers.
     3. JOWLS — heavy pendulous lower-lip flaps hanging past the jawline, wider than any wolf-
        family muzzle, sagging low and loose (the "big guard dog" read named in the brief).
     4. Cropped tail — a short stub, NOT a streaming wolf tail; a deliberate silhouette-breaker
        (where the wolf ladder reads a long tail, the mastiff reads a stump).
     5. Half-risen hackle ridge along the shoulders/withers only (not spine-length like the
        dire-wolf's ragged full crest) — a tell of alertness, not a full display.
     6. One forepaw raised off the ground, weight driven forward onto the planted opposite leg —
        the alarm-point pose payload, cheap in tris (just an asymmetric leg pair), huge in read.

   POSE SENTENCE: the alarm point — a bulky guard mastiff frozen mid-alert, weight thrown
   forward onto a braced front leg, the opposite forepaw lifted and cocked, jowled head locked
   forward and slightly low (reading the threat), hackles half-risen at the shoulder, cropped
   tail stiff and level — never at attention, always the instant BEFORE the bark.

   SPINE-GESTURE SENTENCE: the topline runs a shallow forward-leaning C-curve from a low-driving
   rump, up over a raised, slightly humped withers (weight-forward shift), through a short thick
   neck that dips the head DOWN and forward past level — the whole spine leans into the alert,
   never a flat plumb-line back.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['catchall-w1'], cell 2). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildMastiff(){
  /* ---------- PALETTE (neutral cross-realm core — brindle brown coat, dark banded stripes,
     a pale studded collar for the value-contrast signature) ---------- */
  const P = {
    coat:0x8a6142, coatDk:0x5f4028, coatLt:0xa47b52,
    brindle:0x3f2a18,                              // dark brindle stripe stipple
    belly:0x9b7752, ruff:0x8a6142,
    hackle:0x704a2c, hacklePale:0xb08e5e,           // half-risen shoulder hackle
    muzzle:0x7a5638, muzzleLt:0x96714a, nose:0x140f0a,
    jowl:0x86603f, jowlDk:0x543a22,
    maw:0x1c130c, tongue:0x8a4038, tooth:0xe8ddc4,
    ear:0x5a3c24, earIn:0x241811,
    eye:0x120c08, eyeGlint:0xc9a86a,
    collar:0x2a1c12, collarDk:0x180f09,
    stud:0xf2e8ae, studDk:0xb8a468,                 // the SIGNATURE — bright metal studs, >=140 RGB on all channels
    claw:0x140f0a, disc:0x453c30, discTop:0x534a3c,
  };

  const H = 0.82;                                   // shoulder-height reference — lower/bulkier than mon-wolf
  const N = 10;                                      // torso/head ring density

  /* ---------- TORSO — barrel-chested bulk, forward-leaning C-curve topline (spine gesture),
     shallow belly tuck (bulky domestic, not lean wolf), driving rump low, withers raised into a
     slight forward hump before the neck dips. backTopAt/bellyAt/hwAt piecewise lookups place the
     collar/hackle/brindle stipple on the actual surface. ---------- */
  const T = [
    {z:-0.62, hw:0.220, backTop:H*0.76, belly:H*0.32, hex:P.coat},     // rump — low, driving
    {z:-0.32, hw:0.250, backTop:H*0.86, belly:H*0.30, hex:P.coatDk},   // loin — widest barrel
    {z:-0.02, hw:0.255, backTop:H*0.94, belly:H*0.28, hex:P.coat},     // mid-back — deep barrel chest
    {z: 0.22, hw:0.235, backTop:H*1.06, belly:H*0.34, hex:P.coat},     // withers — the forward hump, weight-forward
    {z: 0.40, hw:0.190, backTop:H*0.96, belly:H*0.40, hex:P.coatDk},   // hump falls toward the neck base
  ];
  const trings = T.map(s=>{
    const cy=(s.backTop+s.belly)/2, ry=(s.backTop-s.belly)/2;
    return ring(V(0,cy,s.z), V(0,0,1), s.hw, ry, N, Math.PI/N);
  });
  stitch(trings, b=>T[b].hex);
  capFan(trings[0], V(0, (T[0].backTop+T[0].belly)/2, T[0].z-0.06), P.coatDk, true);   // rump cap
  const at=(z,key)=>{
    for(let i=0;i<T.length-1;i++) if(z<=T[i+1].z){ const t=(z-T[i].z)/(T[i+1].z-T[i].z); return T[i][key]+(T[i+1][key]-T[i][key])*t; }
    return T.at(-1)[key];
  };
  const backTopAt=(z)=>at(z,'backTop'), bellyAt=(z)=>at(z,'belly'), hwAt=(z)=>at(z,'hw');

  /* deep barrel chest keel + pale belly under the torso (decorative accents, riding the belly line) */
  {
    quad(V(-0.14,H*0.30,0.14), V(0.14,H*0.30,0.14), V(0.11,H*0.24,0.34), V(-0.11,H*0.24,0.34), P.ruff, 0.05);
    quad(V(-0.17,H*0.36,-0.30), V(0.17,H*0.36,-0.30), V(0.14,H*0.30,0.10), V(-0.14,H*0.30,0.10), P.belly, 0.05);
  }

  /* ---------- BRINDLE STIPPLE — dark stripe blotches over the barrel, the brindle-brown read
     named in the brief. Cheap: alternating dark quads riding the coat surface. ---------- */
  {
    const stripes = [
      {z:-0.44,s:-1,y:0.62},{z:-0.30,s:1,y:0.70},{z:-0.14,s:-1,y:0.66},
      {z:0.02,s:1,y:0.72},{z:0.16,s:-1,y:0.68},
    ];
    for(const st of stripes){
      const hw=hwAt(st.z)*0.99, topY=backTopAt(st.z), botY=bellyAt(st.z);
      const cy = topY - (topY-botY)*(1-st.y);
      quad(V(st.s*hw, cy+0.05, st.z-0.05), V(st.s*hw, cy+0.05, st.z+0.05),
           V(st.s*hw*0.97, cy-0.09, st.z+0.02), V(st.s*hw*0.97, cy-0.09, st.z-0.08), P.brindle, 0.04);
    }
  }

  /* ---------- HALF-RISEN HACKLE — shoulder/withers only, not full spine-length (dire-wolf owns
     the full ragged crest); an alertness tell, short even row of tufts. ---------- */
  {
    const stations = [
      {t:0.10,w:0.026,h:0.028},{t:0.34,w:0.030,h:0.038},{t:0.58,w:0.032,h:0.044},
      {t:0.80,w:0.026,h:0.030},{t:1.00,w:0.020,h:0.020},
    ];
    const z0=T[2].z, z1=T[4].z;                      // mid-back -> hump-fall run (shoulders/withers)
    for(const st of stations){
      const cz = z0 + (z1-z0)*st.t, hw=st.w;
      const surf = backTopAt(cz) + 0.010;
      const a=V(-hw,surf,cz-hw*0.7), b=V(hw,surf,cz-hw*0.7), c=V(0,surf,cz+hw*0.9);
      const apex=V(0, surf+st.h, cz);
      quad(a,b,apex,apex,P.hackle,0.05);
      quad(b,c,apex,apex,P.hacklePale,0.05);
      quad(c,a,apex,apex,P.hackle,0.05);
    }
  }

  /* ---------- NECK — thick, blended, short — drops off the withers hump and dips FORWARD and
     DOWN past level into the jowled head (spine gesture continues the lean into the alert). ---------- */
  const neckR = 0.155, humpFallTop = T.at(-1).backTop;
  const headBase = V(0, H*0.720, 0.58);
  tube(V(0, humpFallTop-neckR*0.6, T.at(-1).z), headBase, neckR, neckR*0.80, N, P.ruff, {phase:Math.PI/N});

  /* ---------- STUDDED COLLAR — the SIGNATURE, sat at the neck base, ringing the thickest part
     of the neck between the withers and the head. Dark leather band + bright pale studs at even
     intervals (law 3: >=1 zone >=140 RGB on the signature). ---------- */
  {
    const collarZ = T.at(-1).z + 0.16, collarY = H*0.820;
    const cRingA = ring(V(0,collarY,collarZ-0.055), V(0,0,1), neckR*1.34, neckR*1.10, N, Math.PI/N);
    const cRingB = ring(V(0,collarY,collarZ+0.055), V(0,0,1), neckR*1.38, neckR*1.14, N, Math.PI/N);
    stitch([cRingA,cRingB], ()=>P.collar);
    // pale metal studs at even intervals around the band — sized to clear the 0.04u feature floor
    const studCount = 8;
    for(let i=0;i<studCount;i++){
      const a = (i/studCount)*Math.PI*2;
      const sx = Math.sin(a)*neckR*1.36, sy = collarY + Math.cos(a)*neckR*1.12*0.55;
      if(Math.cos(a) < -0.15) continue;              // skip the underside — never seen, saves tris
      const sz = collarZ;
      quad(V(sx-0.026,sy-0.026,sz-0.03), V(sx+0.026,sy-0.026,sz-0.03),
           V(sx+0.026,sy+0.026,sz+0.03), V(sx-0.026,sy+0.026,sz+0.03), P.stud, 0.02);
    }
  }

  /* ---------- HEAD — heavy jowled skull, wider/blunter than any wolf-family muzzle, head
     carried DOWN and forward past level (reading the threat, per pose sentence). ---------- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {z:0.58, y:H*0.720, rx:0.165, rz:0.155, hex:P.coatLt},
      {z:0.68, y:H*0.680, rx:0.150, rz:0.138, hex:P.coat},
      {z:0.775,y:H*0.632, rx:0.104, rz:0.090, hex:P.coatDk},
      {z:0.845,y:H*0.600, rx:0.072, rz:0.062, hex:P.coatDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.z), V(0,0,1), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0, bands[0].y+0.02, bands[0].z-0.10), P.coatDk, true);   // skull cap

    const jawY = H*0.600;
    const uB=V(0, jawY+0.062, 0.80), uM=V(0, jawY+0.048, 0.95), uT=V(0, jawY+0.030, 1.05);
    tube(uB, uM, 0.096, 0.078, n, P.muzzle, {raz:0.086, rbz:0.066, phase:ph});
    tube(uM, uT, 0.078, 0.050, n, P.muzzle, {raz:0.066, rbz:0.042, phase:ph, capB:{hex:P.nose, lift:0.012}});

    /* JOWLS — heavy pendulous flaps hanging past the jawline, wider than the muzzle band
       itself, sagging loose. SIGNATURE #3. */
    for(const s of [-1,1]){
      const jb = V(s*0.078, jawY+0.010, 0.86);
      const jm = V(s*0.098, jawY-0.070, 0.94);
      const jt = V(s*0.070, jawY-0.130, 1.00);
      tube(jb, jm, 0.036, 0.044, 8, P.jowl,   {phase:ph});
      tube(jm, jt, 0.044, 0.018, 8, P.jowlDk, {phase:ph, capB:{hex:P.jowlDk, lift:0.006}});
    }

    const lB=V(0, jawY-0.020, 0.80), lM=V(0, jawY-0.052, 0.96), lT=V(0, jawY-0.060, 1.04);
    tube(lB, lM, 0.088, 0.058, n, P.jowl, {raz:0.078, rbz:0.048, phase:ph});
    tube(lM, lT, 0.058, 0.034, n, P.jowlDk, {raz:0.048, rbz:0.026, phase:ph});

    // open maw void + tongue + teeth (guard-dog alert bark, mouth just cracking open)
    quad(V(-0.052,jawY-0.006,0.85), V(0.052,jawY-0.006,0.85),
         V(0.044,jawY-0.050,1.00), V(-0.044,jawY-0.050,1.00), P.maw, 0.02);
    quad(V(-0.026,jawY-0.026,0.90), V(0.026,jawY-0.026,0.90),
         V(0.022,jawY-0.036,0.98), V(-0.022,jawY-0.036,0.98), P.tongue, 0.04);

    const fang=(x,y,z,w,h,down)=>{
      const ty = down ? y-h : y+h;
      const p1 = down ? V(x+w,y,z+0.016) : V(x-w,y,z+0.016);
      const p2 = down ? V(x-w,y,z+0.016) : V(x+w,y,z+0.016);
      quad(p1, p2, V(x,ty,z+0.006), V(x,ty,z+0.006), P.tooth, 0.02);
    };
    for(const s of [-1,1]){
      fang(s*0.048, jawY+0.006, 0.87, 0.028, 0.052, true);
      fang(s*0.030, jawY-0.020, 0.905, 0.020, 0.036, false);
    }

    /* SEMI-DROOPED EARS — heavier and lower-set than a wolf's erect triangles, the domestic
       guard-breed read. */
    const crownY = bands[0].y + bands[0].rz - 0.010, ez = bands[0].z - 0.02;
    for(const s of [-1,1]){
      const base=V(s*0.130, crownY, ez);
      const tip =V(s*0.170, crownY-0.070, ez-0.070);
      tube(base, tip, 0.058, 0.020, 8, P.ear, {raz:0.030, rbz:0.010, capB:{hex:P.ear, lift:0.006}});
      quad(V(s*0.118,crownY-0.008,ez-0.006), V(s*0.148,crownY-0.010,ez-0.014),
           V(s*0.158,crownY-0.052,ez-0.060), V(s*0.128,crownY-0.048,ez-0.052), P.earIn, 0.03);
    }

    /* alert-forward eyes with a small pale glint (not a glow — mundane creature) */
    for(const s of [-1,1]){
      const ex=s*0.072, ey=bands[0].y+0.012, ez2=bands[0].z+0.03;
      quad(V(ex-0.020,ey-0.011,ez2), V(ex+0.020,ey-0.011,ez2),
           V(ex+0.016,ey+0.011,ez2+0.010), V(ex-0.016,ey+0.011,ez2+0.010), P.eye, 0.02);
      quad(V(ex-0.007,ey-0.003,ez2+0.006), V(ex+0.007,ey-0.003,ez2+0.006),
           V(ex+0.005,ey+0.003,ez2+0.012), V(ex-0.005,ey+0.003,ez2+0.012), P.eyeGlint, 0.0);
    }
  }

  /* ---------- LEGS — thick, stubby, planted digitigrade legs (bulky domestic, not the wolf-
     family stretched columns). ALARM POSE: one forepaw raised/cocked, weight thrown onto the
     opposite braced leg — the pose signature (#6), asymmetric front pair, hind pair squarely
     planted driving the forward lean. True hind Z-zigzag (hip fwd-down to stifle, tibia back-
     and-up to a high hock) kept correct per anatomy-chief law even though shortened. ---------- */
  {
    const seg=8;
    const hindLeg=(sx)=>{
      const hip    = V(sx*0.185, H*0.72, -0.50);
      const stifle = V(sx*0.205, H*0.36, -0.34);        // forward & down off the hip
      const hock   = V(sx*0.245, H*0.30, -0.52);        // HIGH & kicked back-and-up (behind the stifle)
      const paw    = V(sx*0.255, H*0.02, -0.44);        // near-vertical cannon, planted
      tube(hip, stifle, 0.110, 0.074, seg, P.coat);
      tube(stifle, hock, 0.070, 0.052, seg, P.coatDk);
      tube(hock, paw, 0.052, 0.036, seg, P.muzzle, {capB:{hex:P.muzzle, lift:0.006}});
      footToes(paw, sx);
    };
    // FRONT: braced leg planted vertical (weight thrown forward), raised leg cocked back off the ground
    const frontBraced=(sx)=>{
      const sh     = V(sx*0.170, H*0.86, 0.24);
      const elbow  = V(sx*0.180, H*0.46, 0.34);
      const carpus = V(sx*0.180, H*0.16, 0.40);
      const paw    = V(sx*0.180, H*0.02, 0.44);
      tube(sh, elbow, 0.098, 0.068, seg, P.coat);
      tube(elbow, carpus, 0.068, 0.048, seg, P.coatDk);
      tube(carpus, paw, 0.048, 0.032, seg, P.muzzle, {capB:{hex:P.muzzle, lift:0.006}});
      footToes(paw, sx);
    };
    const frontRaised=(sx)=>{
      const sh     = V(sx*0.170, H*0.86, 0.24);
      const elbow  = V(sx*0.185, H*0.50, 0.40);
      const carpus = V(sx*0.190, H*0.28, 0.52);
      const paw    = V(sx*0.185, H*0.18, 0.62);          // lifted clear of the ground — cocked
      tube(sh, elbow, 0.098, 0.068, seg, P.coat);
      tube(elbow, carpus, 0.068, 0.048, seg, P.coatDk);
      tube(carpus, paw, 0.048, 0.032, seg, P.muzzle, {capB:{hex:P.muzzle, lift:0.006}});
      footToes(paw, sx);
    };
    function footToes(paw, sx){
      const y0 = Math.max(paw.y, 0.018);
      for(const cx of [-0.022,-0.007,0.007,0.022]){
        quad(V(paw.x+cx-0.006,y0,paw.z+0.028), V(paw.x+cx+0.006,y0,paw.z+0.028),
             V(paw.x+cx+0.005,Math.max(y0-0.018,0.0),paw.z+0.052), V(paw.x+cx-0.005,Math.max(y0-0.018,0.0),paw.z+0.052), P.claw, 0.0);
      }
    }
    hindLeg(-1); hindLeg(1);
    frontBraced(-1);       // left front — planted, weight-bearing
    frontRaised(1);        // right front — raised, cocked — the alarm-point signature
  }

  /* ---------- TAIL — cropped stub, NOT a streaming wolf tail (silhouette-breaker vs the ladder's
     other canines). Held level and stiff, alert. ---------- */
  {
    const rumpBackTop = T[0].backTop;
    const root = V(0.01, rumpBackTop-0.01, -0.60);
    const tip  = V(0.02, rumpBackTop+0.01, -0.76);
    tube(root, tip, 0.070, 0.040, N, P.coatDk, {phase:Math.PI/N, capA:{hex:P.coatDk}, capB:{hex:P.coatDk, lift:0.010}});
  }

  /* ---------- base disc (Medium: r=0.42, canon pattern) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
