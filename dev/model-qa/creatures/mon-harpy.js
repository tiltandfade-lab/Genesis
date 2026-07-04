/* dev/model-qa/creatures/mon-harpy.js — the harpy landmark table (winged-hybrid debut).
   Whole-object grammar: one function, one geometry frame, no anchors. A board-piece SHRIEK pose —
   a gaunt female humanoid torso + head with wild ragged hair, but the ARMS ARE WINGS: each arm
   builds shoulder → elbow spar with 2-3 finger spars fanning from the wrist and FEATHERED membrane
   between (staggered overlapping quads for a ragged feather trailing edge — feathers, not bat skin),
   spread WIDE mid-shriek. Lower body: feathered thighs into taloned BIRD legs gripping the disc.
   Head thrown slightly back, mouth open — the shriek read.
   Imported by both mon-harpy-probe.html (render) and export-obj.mjs (Blender export). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildHarpy(){
  /* ---------- PALETTE (VS desaturated — dusty-brown wings, pale gaunt skin, filthy rags) ---------- */
  const P = {
    skin:0xb8a488, skinDk:0x8f7c62, skinLt:0xcabaa0,          /* pale, sallow */
    rag:0x5a4e3c, ragDk:0x413828, ragLt:0x6c5f48,             /* filthy wrap rags */
    hair:0x312a22, hairLt:0x463c30,                            /* matted dark hair */
    featherDk:0x4e4130, feather:0x6a5942, featherLt:0x86735a,  /* dusty brown feathers, layered tones */
    spar:0x3a3126, wingArm:0x5c4d3a,                           /* wing-arm limb / finger bones */
    talon:0x2a231b, talonDk:0x1a140f, shin:0x7a6b52,           /* scaly bird legs + dark claws */
    eye:0xb8341f, mouth:0x2a1512, tongue:0x8a3a34,             /* wild red eyes, open shriek maw */
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — a gaunt, slightly hunched female frame (~1.4u), shorter/thinner than
     the fighter. Torso wrapped in rags; head thrown slightly back (crown pulled -z, chin up +z). ---------- */
  const L = {
    hipY:0.66, waistY:0.74, ribY:0.85, chestY:0.95, shldY:1.03, neckY:1.075,
    hipHalf:0.085, shoulderX:0.190,
    jawY:1.125, cheekY:1.190, browY:1.255, crownY:1.330, headTopY:1.375,
  };

  /* trunk (one loft, hips→neck) — gaunt: narrow waist, shallow chest, wrapped in rags */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.112, hex:P.ragDk},
    {y:L.waistY, rx:0.120, rz:0.092, hex:P.rag},
    {y:L.ribY,   rx:0.148, rz:0.110, hex:P.rag},
    {y:L.chestY, rx:0.158, rz:0.116, hex:P.ragLt},
    {y:L.shldY,  rx:0.160, rz:0.108, hex:P.rag},
    {y:L.neckY,  rx:0.058, rz:0.056, hex:P.skinDk},
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

  /* --- HEAD (skin loft; thrown slightly back; mouth open in a shriek). The whole head is offset
     -z at the crown and the jaw dropped, chin lifted +z, so the face tilts up. --- */
  const HEADZ = 0.010;
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.066, rz:0.072, cz:HEADZ+0.010, hex:P.skin},   /* jaw pushed forward (chin up) */
      {y:L.cheekY, rx:0.092, rz:0.088, cz:HEADZ,        hex:P.skin},
      {y:L.browY,  rx:0.096, rz:0.086, cz:HEADZ-0.006,  hex:P.skin},
      {y:L.crownY, rx:0.074, rz:0.066, cz:HEADZ-0.028,  hex:P.skinDk},/* crown tipped back */
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;                     /* nose ridge */
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(0, L.headTopY, HEADZ-0.026), P.skinDk);

    /* EYES — wild red dots, wide, high on the face, proud of the surface */
    for(const s of [-1,1]){
      const ex=s*0.044, ey=(L.cheekY+L.browY)/2+0.004, ez=HEADZ+0.100;
      quad(V(ex-0.013,ey-0.009,ez), V(ex+0.013,ey-0.009,ez),
           V(ex+0.013,ey+0.012,ez-0.006), V(ex-0.013,ey+0.012,ez-0.006), P.eye, 0.0);
    }

    /* OPEN SHRIEKING MOUTH — a dark quad recessed into the lower face, jaw agape.
       Sits just below the nose, a tall dark oval-ish maw. */
    {
      const my=L.jawY+0.028, mz=HEADZ+0.070;
      quad(V(-0.028,my-0.030,mz), V(0.028,my-0.030,mz-0.004),
           V(0.022,my+0.028,mz+0.004), V(-0.022,my+0.028,mz+0.004), P.mouth, 0.02);
      /* a small red tongue inside the maw */
      quad(V(-0.012,my-0.024,mz+0.006), V(0.012,my-0.024,mz+0.006),
           V(0.008,my-0.002,mz+0.010), V(-0.008,my-0.002,mz+0.010), P.tongue, 0.02);
    }

    /* WILD RAGGED HAIR — matted clumps radiating up/back/out from the crown, uneven lengths.
       Each clump is a thin tapering tube shooting off the crown in a splayed direction. */
    const crown = V(0, L.crownY+0.02, HEADZ-0.028);
    const clumps = [
      V( 0.12, L.headTopY+0.13, HEADZ-0.14),  V(-0.14, L.headTopY+0.10, HEADZ-0.12),
      V( 0.05, L.headTopY+0.20, HEADZ-0.18),  V(-0.06, L.headTopY+0.17, HEADZ-0.20),
      V( 0.19, L.headTopY+0.02, HEADZ-0.20),  V(-0.20, L.headTopY+0.05, HEADZ-0.18),
      V( 0.16, L.browY+0.02,    HEADZ-0.24),  V(-0.17, L.browY-0.01,    HEADZ-0.22),
    ];
    for(const tip of clumps){
      const mid = crown.clone().lerp(tip, 0.55).add(V(0,0.02,-0.02));
      tube(crown, mid, 0.026, 0.018, 4, P.hair);
      tube(mid, tip, 0.017, 0.004, 4, P.hairLt, {capB:{hex:P.hair}});
    }
  }

  /* ---------- WINGS = THE ARMS. Spread WIDE mid-shriek, both raised & swept back. Each wing:
     shoulder → elbow spar (the "forearm"), then 2-3 finger spars fanning from the wrist, with
     FEATHERED membrane between them built as STAGGERED OVERLAPPING quads (ragged trailing edge =
     feathers, not a smooth bat sheet). Layered dark→light passes for depth. ---------- */
  const SHz = 0.0;
  function wing(s){
    const SH = V(s*L.shoulderX, L.shldY+0.01, SHz);            /* shoulder root */
    /* elbow high & out, wrist further out & up — wings SPREAD and RAISED (shriek display).
       Kept SYMMETRIC by construction (only x flips with s; y/z identical L/R). */
    const EL = V(s*0.40, L.shldY+0.18, -0.04);
    const WR = V(s*0.66, L.shldY+0.34, -0.08);
    /* the wing-arm limb (the LEADING EDGE bone): shoulder→elbow→wrist */
    tube(SH, EL, 0.050, 0.038, 6, P.wingArm, {capA:{hex:P.skinDk}});
    tube(EL, WR, 0.036, 0.024, 6, P.wingArm);

    /* Two long spars extend the leading edge past the wrist to the WINGTIP; the wing surface is a
       broad feathered sail spanning the whole LEADING edge (shoulder→elbow→wrist→wingtip) down to a
       ragged TRAILING edge. This fills the full span (iter-1's mistake was feathers only at the tips). */
    const TIP  = V(WR.x + s*0.28, WR.y + 0.20, WR.z + 0.02);   /* the wingtip — up & out past the wrist */
    const TIP2 = V(WR.x + s*0.12, WR.y + 0.30, WR.z + 0.05);   /* the topmost primary — sweeps up */
    /* spars kept SHORT so they don't overshoot the feathers as bare sticks (iter-2 rake read):
       the feather sail now covers all the way to these tips. */
    tube(WR, TIP,  0.015, 0.005, 5, P.spar, {capB:{hex:P.spar}});
    tube(WR, TIP2, 0.013, 0.004, 5, P.spar, {capB:{hex:P.spar}});

    /* LEADING-EDGE line = the sequence of points the feathers root from, running root→tip, and now
       carrying ON up the two primary spars so the whole leading edge is feathered (no bare sticks).
       Feathers sweep DOWN & BACK (-y, -z); each successive feather (toward the tip) is LONGER. */
    const lead = [ SH, EL.clone().lerp(SH,0.25), EL, EL.clone().lerp(WR,0.5), WR,
                   TIP.clone().lerp(WR,0.45), TIP, TIP2.clone().lerp(TIP,0.5), TIP2 ];
    /* direction each feather falls: mostly down & swept back, opening out toward the tip */
    const NF = lead.length;
    const cols = [P.featherDk, P.feather, P.featherLt];
    /* feather length grows toward the tip; the trailing edge droops back and down */
    for(let i=0; i<NF-1; i++){
      const r0 = lead[i], r1 = lead[i+1];
      const f = i/(NF-1);                                       /* 0=root .. 1=tip */
      const len = 0.16 + f*0.34;                                /* longer toward the tip */
      /* feather fall direction: down, swept back (-z), and out along the span a touch */
      const fall0 = V(s*0.04, -len, -len*0.55 - 0.04);
      const fall1 = V(s*0.05, -len*1.06, -len*0.60 - 0.04);
      /* stagger the two trailing tips for a torn/ragged edge */
      const jag = (i%2)? 1.0 : 0.86;
      const t0 = r0.clone().add(fall0.clone().multiplyScalar(jag));
      const t1 = r1.clone().add(fall1);
      const col = cols[i % cols.length];
      /* the feather-row quad (leading pair of roots → their two trailing tips) */
      quad(r0, r1, t1, t0, col, 0.07);
      /* darker underside pass, dipped, for depth + a solid read from below */
      quad(r0.clone().add(V(0,-0.007,0)), t0.clone().add(V(0,-0.007,0)),
           t1.clone().add(V(0,-0.007,0)), r1.clone().add(V(0,-0.007,0)), P.featherDk, 0.07);
      /* an overlapping secondary row nearer the body fills any inner gap (covert layer) */
      if(i < NF-2){
        const s0 = r0.clone().add(fall0.clone().multiplyScalar(0.5));
        const s1 = r1.clone().add(fall1.clone().multiplyScalar(0.5));
        quad(r0, r1, s1, s0, P.feather, 0.06);
      }
    }
    /* shoulder coverts — a dark feather patch bridging the shoulder/upper-back to the wing root */
    quad(SH, EL, EL.clone().add(V(0,-0.14,-0.10)), SH.clone().add(V(0,-0.14,-0.06)), P.featherDk, 0.05);
  }
  wing(+1);
  wing(-1);

  /* ---------- LOWER BODY — feathered thighs into scaly TALONED BIRD LEGS gripping the disc. ---------- */
  for(const s of [-1,1]){
    const hip = V(s*L.hipHalf, L.hipY-0.02, 0.0);
    const knee= V(s*0.10, 0.44, 0.02);
    const ankle=V(s*0.085, 0.19, 0.03);                        /* the "heel" — bird ankle joint */
    const footBase=V(s*0.075, 0.075, 0.06);                   /* toes splay from here, gripping disc */

    /* feathered thigh — a short ring stack of feather tones over the upper leg */
    stack([
      {y:L.hipY-0.02, rx:0.070, rz:0.062, cx:hip.x, cz:hip.z, hex:P.feather},
      {y:0.56,        rx:0.062, rz:0.054, cx:(hip.x+knee.x)/2, cz:0.01, hex:P.featherDk},
      {y:0.46,        rx:0.046, rz:0.040, cx:knee.x, cz:knee.z, hex:P.featherDk},
    ], 7, {capBot:{hex:P.shin, lift:0.0}});
    /* a couple of shaggy feather flaps at the thigh base (ragged, over the shin top) */
    for(const d of [-1,1]){
      quad(V(knee.x+d*0.03,0.48,0.03), V(knee.x+d*0.06,0.48,0.05),
           V(knee.x+d*0.04,0.36,0.06), V(knee.x+d*0.04,0.36,0.06), P.featherLt, 0.06);
    }

    /* scaly shin — thin tube, knee→ankle→(down to foot base) */
    tube(knee, ankle, 0.034, 0.024, 6, P.shin);
    tube(ankle, footBase, 0.024, 0.018, 6, P.shin, {capB:{hex:P.shin}});

    /* TALONS — 3 forward-splayed claws + 1 rear, thin tubes ending in dark hooked tips, planted
       ON the disc top (y≈0.058) so the foot visibly GRIPS. */
    const toeDirs = [ V(s*0.15,0,0.90), V(s*0.55,0,0.55), V(s*0.75,0,-0.15) ];  /* 3 front toes */
    for(const d of toeDirs){
      const dir = d.clone().normalize();
      const mid = footBase.clone().addScaledVector(dir, 0.075).add(V(0,-0.030,0));
      const tip = footBase.clone().addScaledVector(dir, 0.120).add(V(0,-0.058,0)); /* down onto disc */
      tube(footBase, mid, 0.016, 0.011, 4, P.shin);
      tube(mid, tip, 0.010, 0.003, 4, P.talon, {capB:{hex:P.talonDk}});          /* dark hooked claw */
    }
    /* rear talon (hallux) — points back, grips behind */
    {
      const dir = V(-s*0.2,0,-0.95).normalize();
      const mid = footBase.clone().addScaledVector(dir, 0.055).add(V(0,-0.030,0));
      const tip = footBase.clone().addScaledVector(dir, 0.085).add(V(0,-0.052,0));
      tube(footBase, mid, 0.014, 0.010, 4, P.shin);
      tube(mid, tip, 0.009, 0.003, 4, P.talon, {capB:{hex:P.talonDk}});
    }
  }

  /* ---------- BASE DISC (Medium — r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
