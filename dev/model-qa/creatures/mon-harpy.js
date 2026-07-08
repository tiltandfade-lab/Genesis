/* dev/model-qa/creatures/mon-harpy.js — the HARPY landmark table (WINGED+HUMANOID family,
   Medium, CR 1, realm core — 40 live instances, the whole bird-family alias root), authored
   under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry rebuild wave 1, cell 5).

   FEATURE CHECKLIST (the ~1.3-1.6k budget buys):
     1. Gaunt humanoid torso + head — narrow female frame, ragged wrap, matted wild hair — the
        HUMANOID half of the anatomy read (ANATOMY-CANON HUMANOID chief-criterion baseline).
     2. WINGS as arm-analogs, ANATOMY-CANON WINGED §bird: a thick leading-edge spar (shoulder→
        elbow→wrist strut chain, real 3D volume, never a flat quad) carrying overlapping RIGID
        feather blades (primaries off the wrist, secondaries along the forearm) — a stack of
        blades laid over the arm, not a spanned membrane fan. Thrown UP and BACK (landing flare).
     3. SIGNATURE — the flared strut-built wing pair at the top of a hard back-sweep, each
        feather blade a distinct countable quad with a scalloped/staggered trailing edge — the
        loud exaggerated feature, the first thing the silhouette names.
     4. Digitigrade BIRD legs (thin scaled shin, backward-bent look, per ANATOMY-CANON AVIAN
        stub) ending in taloned feet — both legs driving down-and-forward, talons splayed to
        grab, NOT planted flat under the hips (the landing-flare reach).
     5. Head thrust forward and UP, mouth open in a full shriek — the face is the second
        high-value zone (pale skin against the dark open maw + red eyes).
     6. Ragged hem tatters + wild hair streamers trailing off the back — cheap silhouette noise
        that reads "harpy," not "human," at a squint.

   POSE SENTENCE: a harpy hitting the ground mid-shriek — wings thrown up and swept hard back at
   the peak of a braking flare, spine driving forward, head thrust out screaming, both taloned
   feet reaching down-and-forward to grab the earth — never a folded resting perch, never at
   attention.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['rebuild-w1'], cell 5) and export-obj.mjs. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHarpy(){
  /* ---------- PALETTE (preserved from the prior pass — VS desaturated: dusty-brown feathers,
     pale gaunt skin, filthy wrap rags) ---------- */
  const P = {
    skin:0xb8a488, skinDk:0x8f7c62, skinLt:0xcabaa0,          /* pale, sallow */
    rag:0x5a4e3c, ragDk:0x413828, ragLt:0x6c5f48,             /* filthy wrap rags */
    hair:0x312a22, hairLt:0x463c30,                            /* matted dark hair */
    featherDk:0x4e4130, feather:0x7a674f, featherLt:0xaa9576,  /* dusty brown feathers, layered tones — brightened for value contrast */
    spar:0xc4b494, wingArm:0x9a8768,                           /* wing-arm limb / spar bones — spar LIT bright: the leading-edge highlight law 3 needs */
    talon:0x3c3122, talonDk:0x241c14, shin:0x7a6b52,           /* scaly bird legs + dark claws — lifted off near-black so the grab-reach doesn't dissolve into the disc's shadow (critic pass-2) */
    eye:0xb8341f, mouth:0x2a1512, tongue:0x8a3a34,             /* wild red eyes, open shriek maw */
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — gaunt female frame (~1.4u). Torso driven FORWARD (lean into the
     flare-stop), head thrown forward+up mid-shriek. ---------- */
  const LEAN = 0.028;   /* forward lean per band, applied via cz offsets below */
  const L = {
    hipY:0.66, waistY:0.74, ribY:0.85, chestY:0.95, shldY:1.03, neckY:1.075,
    hipHalf:0.085, shoulderX:0.190,
    jawY:1.135, cheekY:1.200, browY:1.262, crownY:1.330, headTopY:1.372,
  };

  /* trunk (one loft, hips→neck) — gaunt, wrapped in rags, driving forward into the lean */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.112, cz:0.00,        hex:P.ragDk},
    {y:L.waistY, rx:0.120, rz:0.092, cz:LEAN*0.4,    hex:P.rag},
    {y:L.ribY,   rx:0.148, rz:0.110, cz:LEAN*0.9,    hex:P.rag},
    {y:L.chestY, rx:0.158, rz:0.116, cz:LEAN*1.4,    hex:P.ragLt},
    {y:L.shldY,  rx:0.160, rz:0.108, cz:LEAN*1.7,    hex:P.rag},
    {y:L.neckY,  rx:0.058, rz:0.056, cz:LEAN*2.0,    hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* ragged wrap hem below the waist (torn cloth skirt, short + uneven) */
  stack([
    {y:0.50, rx:0.165, rz:0.130, hex:P.ragDk},
    {y:0.58, rx:0.158, rz:0.122, hex:P.rag},
    {y:L.hipY, rx:0.150, rz:0.114, hex:P.rag},
  ], 8, {});
  /* torn hanging rag strips (ragged silhouette on the skirt) */
  for(const a of [0.2, 1.4, 2.7, 3.9, 5.1]){
    const x=Math.cos(a)*0.150, z=Math.sin(a)*0.116;
    quad(V(x*0.9,0.50,z*0.9), V(x*1.05,0.50,z*1.05),
         V(x*0.95,0.30+ (a%1)*0.06,z*0.95), V(x*0.95,0.30+(a%1)*0.06,z*0.95), P.ragDk, 0.06);
  }

  /* --- HEAD (skin loft; thrust FORWARD and UP mid-shriek, chin driving out, mouth agape). --- */
  const HEADZ = LEAN*2.0 + 0.06;
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.068, rz:0.074, cz:HEADZ+0.028, hex:P.skin},   /* jaw thrust hard forward (chin out) */
      {y:L.cheekY, rx:0.094, rz:0.090, cz:HEADZ+0.010, hex:P.skin},
      {y:L.browY,  rx:0.098, rz:0.088, cz:HEADZ+0.000, hex:P.skin},
      {y:L.crownY, rx:0.076, rz:0.068, cz:HEADZ-0.018, hex:P.skinDk},/* crown tips back relative to jaw */
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.020;                     /* nose ridge */
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(0, L.headTopY, HEADZ-0.016), P.skinDk);
    /* OPEN SHRIEKING MOUTH — wide dark quad, jaw fully agape, driven forward with the chin */
    {
      const my=L.jawY+0.030, mz=HEADZ+0.096;
      quad(V(-0.032,my-0.034,mz), V(0.032,my-0.034,mz-0.004),
           V(0.024,my+0.032,mz+0.004), V(-0.024,my+0.032,mz+0.004), P.mouth, 0.02);
      quad(V(-0.013,my-0.026,mz+0.006), V(0.013,my-0.026,mz+0.006),
           V(0.009,my-0.002,mz+0.010), V(-0.009,my-0.002,mz+0.010), P.tongue, 0.02);
    }
    /* wild red eyes — small high-value points either side of the nose ridge */
    for(const s of [-1,1]){
      const ex=s*0.052, ey=L.browY-0.006, ez=HEADZ+0.078;
      quad(V(ex-0.014,ey-0.010,ez), V(ex+0.014,ey-0.010,ez),
           V(ex+0.012,ey+0.012,ez+0.004), V(ex-0.012,ey+0.012,ez+0.004), P.eye, 0.05);
    }

    /* WILD RAGGED HAIR — matted clumps radiating up/back/out from the crown, streaming BACK with
       the forward lunge (a wind-in-motion read matching the flare). */
    const crown = V(0, L.crownY+0.02, HEADZ-0.016);
    const clumps = [
      V( 0.13, L.headTopY+0.09, HEADZ-0.24),  V(-0.15, L.headTopY+0.06, HEADZ-0.22),
      V( 0.05, L.headTopY+0.15, HEADZ-0.30),  V(-0.06, L.headTopY+0.12, HEADZ-0.32),
      V( 0.20, L.headTopY-0.03, HEADZ-0.30),  V(-0.21, L.headTopY+0.00, HEADZ-0.28),
      V( 0.17, L.browY-0.02,    HEADZ-0.34),  V(-0.18, L.browY-0.05,    HEADZ-0.32),
    ];
    for(const tip of clumps){
      const mid = crown.clone().lerp(tip, 0.55).add(V(0,0.01,-0.02));
      tube(crown, mid, 0.026, 0.018, 4, P.hair);
      tube(mid, tip, 0.017, 0.004, 4, P.hairLt, {capB:{hex:P.hair}});
    }
  }

  /* ---------- WINGS = THE ARMS. ANATOMY-CANON WINGED §bird: leading-edge spar chain
     (shoulder→elbow→wrist, real 3D tubes) carrying overlapping RIGID feather blades — a stack
     of blades along the arm, never a spanned membrane sheet. Thrown UP and swept hard BACK at
     the peak of a landing flare (both wings SYMMETRIC by construction — only x flips with s). ---------- */
  const SHz = LEAN*1.7;
  function wing(s){
    const SH = V(s*L.shoulderX, L.shldY+0.01, SHz);            /* shoulder root */
    /* elbow driven UP and back, wrist further up and swept BACK — the flare-brake silhouette:
       wings peak ABOVE the head, swept behind the spine, not spread flat to the sides. */
    const EL = V(s*0.34, L.shldY+0.30, SHz-0.10);
    const WR = V(s*0.50, L.shldY+0.52, SHz-0.30);
    /* the wing-arm limb (leading-edge bone): shoulder→elbow→wrist, real tube volume */
    tube(SH, EL, 0.052, 0.040, 6, P.wingArm, {capA:{hex:P.skinDk}});
    tube(EL, WR, 0.038, 0.026, 6, P.wingArm);

    /* two long primary spars extend the leading edge past the wrist toward the wingtips — the
       highest point of the flare, angled up-and-back over the shoulder. */
    const TIP  = V(WR.x + s*0.30, WR.y + 0.30, WR.z - 0.10);   /* outer primary tip */
    const TIP2 = V(WR.x + s*0.10, WR.y + 0.42, WR.z + 0.02);   /* inner primary, sweeps highest */
    tube(WR, TIP,  0.020, 0.007, 5, P.spar, {capB:{hex:P.spar}});
    tube(WR, TIP2, 0.017, 0.006, 5, P.spar, {capB:{hex:P.spar}});

    /* leading-edge point sequence, root→tip, feathers root off each — overlapping RIGID blades
       (bird canon), each a distinct countable quad, staggered trailing edges for a torn/scalloped
       silhouette. Feather fall direction sweeps DOWN-and-FORWARD off the raised spar (the wing is
       braking against forward motion — feathers rake toward the spine, not straight down). */
    const lead = [ SH, EL.clone().lerp(SH,0.25), EL, EL.clone().lerp(WR,0.5), WR,
                   TIP.clone().lerp(WR,0.45), TIP, TIP2.clone().lerp(TIP,0.5), TIP2 ];
    const NF = lead.length;
    const cols = [P.featherDk, P.feather, P.featherLt];
    /* deep alternating notch: even-index feathers run FULL length, odd-index feathers are cut
       ~40% short — this is what actually reads as a scalloped/concave trailing edge (a smooth
       stagger reads as one solid sail at 1/3-res, the "fin" failure) — a real length gap between
       neighbors is what breaks the silhouette into countable blades. */
    const feathFall = (i)=>{ const f=i/(NF-1), len=(0.20+f*0.40) * ((i%2)?0.58:1.0);
      return V(s*-0.04, -len*0.55, len*0.85); };            /* rakes down+forward, toward the spine */

    for(let i=0; i<NF-1; i++){
      const r0=lead[i], r1=lead[i+1];
      const fall0=feathFall(i), fall1=feathFall(i+1);
      const t0=r0.clone().add(fall0), t1=r1.clone().add(fall1);
      const col=cols[i%cols.length];
      /* primary blade — top face */
      quad(r0, r1, t1, t0, col, 0.07);
      /* underside pass, dipped, for two-sided solidity + depth */
      quad(r0.clone().add(V(0,-0.006,0)), t0.clone().add(V(0,-0.006,0)),
           t1.clone().add(V(0,-0.006,0)), r1.clone().add(V(0,-0.006,0)), P.featherDk, 0.07);
      /* overlapping covert (secondary) row nearer the spar — the "stack of blades" read */
      if(i < NF-2){
        const s0=r0.clone().add(fall0.clone().multiplyScalar(0.5));
        const s1=r1.clone().add(fall1.clone().multiplyScalar(0.5));
        quad(r0, r1, s1, s0, P.feather, 0.06);
      }
    }
    /* shoulder coverts — a dark feather patch bridging the shoulder to the wing root */
    quad(SH, EL, EL.clone().add(V(0,0.10,-0.08)), SH.clone().add(V(0,0.10,-0.05)), P.featherDk, 0.05);
  }
  wing(+1);
  wing(-1);

  /* ---------- LOWER BODY — feathered thighs into scaly TALONED BIRD LEGS, BOTH driving
     down-and-forward to grab the ground (the flare-landing reach), not planted flat under the
     hips. Legs kept mirror-symmetric except for the forward drive. ---------- */
  for(const s of [-1,1]){
    const hip = V(s*L.hipHalf, L.hipY-0.02, LEAN*0.1);
    /* critic pass-2: widened x-spread + extra forward reach — r1/r2 render showed both legs
       collapsing into one dark central mass (talons dissolving against the disc); splaying the
       stance wider and pushing the foot closer to the disc rim reads as two distinct reaching
       legs instead of a skirt-blob. */
    const knee= V(s*0.20, 0.44, 0.16);
    const ankle=V(s*0.18, 0.21, 0.27);
    const footBase=V(s*0.16, 0.10, 0.40);                     /* reaching well forward of the hips, out near the disc rim */

    /* feathered thigh — a short ring stack of feather tones over the upper leg, following the
       forward drive down to the knee */
    stack([
      {y:L.hipY-0.02, rx:0.070, rz:0.062, cx:hip.x, cz:hip.z, hex:P.feather},
      {y:0.54,        rx:0.062, rz:0.054, cx:(hip.x+knee.x)/2, cz:(hip.z+knee.z)/2, hex:P.featherDk},
      {y:0.44,        rx:0.046, rz:0.040, cx:knee.x, cz:knee.z-0.02, hex:P.featherDk},
    ], 7, {capBot:{hex:P.shin, lift:0.0}});
    /* shaggy feather flaps at the thigh base */
    for(const d of [-1,1]){
      quad(V(knee.x+d*0.03,0.46,knee.z+0.02), V(knee.x+d*0.06,0.46,knee.z+0.04),
           V(knee.x+d*0.04,0.34,knee.z+0.03), V(knee.x+d*0.04,0.34,knee.z+0.03), P.featherLt, 0.06);
    }

    /* scaly shin — thin tube, knee→ankle→(down to foot base), the "backward-bent" digitigrade
       bird-leg look: knee forward-high, ankle drops back-and-down before the foot reaches out. */
    tube(knee, ankle, 0.042, 0.030, 6, P.shin);
    tube(ankle, footBase, 0.030, 0.023, 6, P.shin, {capB:{hex:P.shin}});

    /* TALONS — 3 forward-splayed claws + 1 rear (hallux), thickened tubes ending in dark hooked
       tips, reaching OUT and DOWN as if grabbing at the ground mid-landing (kept clear of the
       disc so the reach reads instead of vanishing behind it). */
    const toeDirs = [ V(s*0.15,0,0.90), V(s*0.55,0,0.55), V(s*0.75,0,-0.15) ];
    for(const d of toeDirs){
      const dir = d.clone().normalize();
      const mid = footBase.clone().addScaledVector(dir, 0.095).add(V(0,-0.036,0));
      const tip = footBase.clone().addScaledVector(dir, 0.155).add(V(0,-0.070,0));
      tube(footBase, mid, 0.024, 0.018, 4, P.shin);
      /* critic pass-2: tip radius was 0.004 — well under the 0.04u min-feature floor, so the
         claws dissolved to nothing at 1/3-res. Kept a taper but floored it above the law-3 limit. */
      tube(mid, tip, 0.018, 0.015, 4, P.talon, {capB:{hex:P.talonDk}});
    }
    {
      const dir = V(-s*0.2,0,-0.95).normalize();
      const mid = footBase.clone().addScaledVector(dir, 0.068).add(V(0,-0.036,0));
      const tip = footBase.clone().addScaledVector(dir, 0.106).add(V(0,-0.064,0));
      tube(footBase, mid, 0.020, 0.015, 4, P.shin);
      tube(mid, tip, 0.015, 0.013, 4, P.talon, {capB:{hex:P.talonDk}});
    }
  }

  /* ---------- ragged tail-tatters trailing off the back hem (cheap silhouette noise, "harpy"
     not "human" at a squint) ---------- */
  for(const a of [-0.35, -0.10, 0.15, 0.38]){
    const x=a*0.30, base=V(x, 0.52, -0.10);
    const tip=V(x*1.3, 0.30+ (a<0?0.04:0.0), -0.30 - Math.abs(a)*0.12);
    tube(base, tip, 0.020, 0.004, 4, P.ragDk, {capB:{hex:P.ragDk}});
  }

  /* ---------- BASE DISC (Medium — r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
