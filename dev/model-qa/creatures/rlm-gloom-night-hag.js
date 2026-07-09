/* dev/model-qa/creatures/rlm-gloom-night-hag.js — the NIGHT HAG (realm gloom, Fiend, CR 5, Medium),
   authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry pilot). Coven
   matriarch who trades in stolen sleep and souls — the hunched crone under the bargain, a heart-
   stone pendant her captured-soul ledger. Core identity = iron-skinned hunched crone, HUMANOID
   family (bespoke bipedal per ANATOMY-CANON — mon-nighthag.js is the ancestor read this rebuild
   pulls proportions from: strong forward hunch, hooked nose, wild hair, clawed hands). Whole-object
   grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y, ground y=0, base
   disc r=0.42 (Medium).

   FEATURE CHECKLIST (the ~1.4-1.8k budget buys):
     1. Hunched HUMANOID torso/spine — a strong forward pitch about the hips (the "bent crone" read,
        not an upright mannequin), robed in a tattered dark garment with a raised hump riding the
        upper back.
     2. Warty hooked-nose crone face — dark carved eye sockets under a heavy brow shelf, a sharp
        down-curving beak nose, sunken jagged-tooth mouth, a few raised wart nubs.
     3. SIGNATURE A — grasping over-long fingers: BOTH hands built from elongated 3-segment claws
        (longer + more segmented than a standard hand), the leading right hand extended forward
        palm-up mid-offer, the left hand hooked down clutching a soul-sack against the hip.
     4. SIGNATURE B — the heartstone pendant: a small bright glowing gem hanging off a chain at the
        sternum, the model's dedicated high-value zone (law 3) — the one warm/lit spot on an
        otherwise iron-dark desaturated crone.
     5. Soul-sack — a small drawstring bag clutched in the trailing hand, cinched neck, slack cloth
        body, a second countable prop that sells "trading in stolen souls" without any text.
     6. Wild stringy hair + tattered hem streamers off the robe waist — cheap silhouette-breaking
        secondary reads (ANATOMY-CANON hunched-crone grammar).

   POSE SENTENCE: mid-bargain, leaning forward over the clutched soul-sack with her spine driven
   into the offer, one long-fingered hand extended palm-up toward the mark while the heartstone
   pendant swings loose and glowing at her sternum — a coven matriarch closing a deal, never at
   attention.

   Whole-object grammar per rlm-gloom-mummy.js / mon-skeleton.js conventions. Imported by
   ps1-sheet.html (SETS['gloom-w1'], cell 8). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob, setChannels } from '../probe-lib.js';

export function buildNightHag(){
  /* ---------- PALETTE (VS desaturated; iron-grey mottled crone skin, dark tattered robe, ONE
     warm lit accent at the heartstone — law 3's high-value zone). ---------- */
  const P = {
    // R1 SELF-CORRECTION: the r1 capture came back reading as ~0.5% bright-pixel silhouette (vs.
    // ~5-10% for the mummy/ghast wave-mates) — the robe (majority of the mass) sat near the void
    // clear color, so the figure nearly dissolved (law 2/3 failure). Every body/robe tone lifted
    // well clear of the 0x0a0908 void; iron-grey mood kept via desaturation, not near-black value.
    // R2 SELF-CORRECTION: still reading ~1.2% bright-pixel silhouette after the first lift — well
    // under the ghast/mummy wave-mates (~5-10%). Pushed a second pass, this time matching the
    // ghast's value tier (skin ~0.55-0.65, robe mass ~0.45+) rather than a smaller nudge — an iron
    // -grey crone can still be desaturated/cool without sitting near the 0x0a0908 void clear color.
    skin:0x9098a2, skinDk:0x686f7a, skinLt:0xa8afb8,        // iron-grey mottled hide
    mottleA:0x7d8590,
    wart:0x5c5d56, socket:0x1c1a12,                          // warts, dark carved eye sockets
    nail:0x4a4536, nailLt:0x625a46,                          // yellow-black over-long claws
    hair:0x565049, hairDk:0x342f2a, hairLt:0x726a5c,         // wild stringy grey-black hair
    robe:0x746870, robeDk:0x4e454b, robeLt:0x8c7e86,         // tattered dark robe, lifted off the void
    hem:0x3a3334, teeth:0xaba284,
    sack:0x3a3226, sackDk:0x241f18, tie:0x574a34,            // soul-sack cloth + drawstring
    chain:0x2c2a24,                                          // pendant chain, dark (contrast fodder)
    heart:0xd8385c, heartLt:0xff7fa0,                        // SIGNATURE B — glowing heartstone (warm/bright)
    disc:0x3a3020, discTop:0x483c26,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin', [P.mottleA]:'skin',
    [P.wart]:'skin', [P.socket]:'skin',
    [P.nail]:'bone', [P.nailLt]:'bone', [P.teeth]:'bone',
    [P.hair]:'fur', [P.hairDk]:'fur', [P.hairLt]:'fur',
    [P.robe]:'cloth', [P.robeDk]:'cloth', [P.robeLt]:'cloth', [P.hem]:'cloth',
    [P.sack]:'cloth', [P.sackDk]:'cloth', [P.tie]:'cloth',
    [P.chain]:'metal',
    [P.heart]:'glow', [P.heartLt]:'glow',
  });

  /* ---------- LANDMARKS — hunched crone frame, short (~1.32u to crown), pitched hard forward
     driving into the bargain (a touch more forward lean than the mon-nighthag.js ancestor — this
     is a caught-in-the-offer moment, not a resting hunch). ---------- */
  const L = {
    hipY:0.62, waistY:0.74, ribY:0.88, chestY:1.00, shldY:1.06, neckY:1.10,
    hipHalf:0.115, shoulderX:0.190,
    jawY:1.12, cheekY:1.185, browY:1.245, crownY:1.32,
  };
  /* POSEFIX (2026-07-08): the C-SPINE — a genuine pelvis->skull curve, not one rigid tilt. Pitch
     ramps UP from the pelvis to a deep peak at the humped upper back, then curls back DOWN through
     the neck/head (the crone straightening her neck to fix her mark with the offer) — the classic
     hunchback C/S read (ANATOMY-CANON POSE-ANATOMY law 1: author the gesture curve, don't rotate a
     plumb column). Angle is a function of the point's OWN pre-transform y, so every per-point call
     site (torso rings, hump, hem, pendant, head bands, face features, hair) picks up the local
     curve automatically. */
  const smooth01 = (t)=>{ t = Math.max(0, Math.min(1, t)); return t*t*(3-2*t); };
  const HUNCH_BASE = 0.34, HUNCH_PEAK = 0.76, HUNCH_HEAD = 0.50;   // rad: pelvis / upper-back hump / skull
  const hunchAngle = (y)=>{
    if(y <= L.hipY) return HUNCH_BASE;
    if(y <= L.shldY) return HUNCH_BASE + (HUNCH_PEAK - HUNCH_BASE) * smooth01((y - L.hipY) / (L.shldY - L.hipY));
    return HUNCH_PEAK + (HUNCH_HEAD - HUNCH_PEAK) * smooth01((y - L.shldY) / (L.crownY - L.shldY));
  };
  const hunch = (p)=>{
    const theta = hunchAngle(p.y);
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), theta);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — bent, robed, a hump riding high on the back. ---------- */
  const torsoRings = stack([
    {y:L.hipY,   rx:0.150, rz:0.135, hex:P.robeDk},
    {y:L.waistY, rx:0.175, rz:0.155, hex:P.robe},
    {y:L.ribY,   rx:0.190, rz:0.165, hex:P.robeLt},
    {y:L.chestY, rx:0.172, rz:0.152, hex:P.robe},
    {y:L.shldY,  rx:0.148, rz:0.138, hex:P.robeDk},           // shoulders pull IN (bent crone, not broad)
    {y:L.neckY,  rx:0.075, rz:0.070, hex:P.skinDk},           // scrawny neck stump
  ], 8, {xform:hunch, capTop:{hex:P.skinDk, lift:0.006}});

  /* the HUMP — a bulged mass riding proud of the upper back (the "humped back" silhouette read) */
  {
    const rings=[
      ring(V(0.0, L.ribY-0.02, -0.10), V(0,1,0), 0.140, 0.115, 7, Math.PI/7).map(hunch),
      ring(V(0.0, L.ribY+0.09, -0.13), V(0,1,0), 0.155, 0.130, 7, Math.PI/7).map(hunch),
      ring(V(0.0, L.chestY+0.02, -0.10), V(0,1,0), 0.095, 0.085, 7, Math.PI/7).map(hunch),
    ];
    stitch(rings, ()=>P.robeDk);
    capFan(rings.at(-1), hunch(V(0, L.chestY+0.10, -0.10)), P.robeDk);
  }

  /* tattered hem tatters hanging off the robe waist — ragged strip quads, cheap secondary read */
  for(const [ang,len] of [[0.2,0.16],[0.9,0.20],[1.7,0.14],[2.4,0.19],[3.1,0.15],[4.0,0.21],[5.0,0.16]]){
    const cx = Math.cos(ang)*0.16, cz = Math.sin(ang)*0.14;
    const base = hunch(V(cx, L.hipY-0.02, cz));
    const tip  = hunch(V(cx*1.3, L.hipY-0.02-len, cz*1.3));
    quad(base.clone().add(V(0.02,0,0)), base.clone().add(V(-0.02,0,0)), tip.clone().add(V(-0.01,0,0)), tip.clone().add(V(0.01,0,0)), (ang%2<1)?P.robeDk:P.hem, 0.08);
  }

  /* ---------- SIGNATURE B — the heartstone pendant: a dark chain looping off the neck to a small
     bright glowing gem resting at the sternum, swinging loose with the forward lean. Law 3's
     dedicated high-value zone — the one warm/lit spot on an iron-dark crone. ---------- */
  {
    const neckL = hunch(V(-0.030, L.neckY-0.01, 0.058));
    const neckR = hunch(V( 0.030, L.neckY-0.01, 0.058));
    const rest  = hunch(V(0.006, L.chestY-0.06, 0.145));       // swings forward/out with the lean
    tube(neckL, rest, 0.008, 0.010, 4, P.chain);
    tube(neckR, rest, 0.008, 0.010, 4, P.chain);
    blob(rest.x, rest.y, rest.z, 0.034, 0.040, 0.026, P.heart, 6, 4);
    blob(rest.x, rest.y+0.006, rest.z+0.012, 0.014, 0.017, 0.011, P.heartLt, 5, 3);  // inner glow core
  }

  /* ---------- HEAD — warty hooked-nose face, dark eye sockets under a heavy brow, wild hair. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.088, rz:0.090, hex:P.skin},
      {y:L.cheekY, rx:0.100, rz:0.092, hex:P.skinLt},
      {y:L.browY,  rx:0.098, rz:0.082, hex:P.mottleA},
      {y:L.crownY, rx:0.068, rz:0.060, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* sunken cheeks — pull cheek band verts slightly in at the sides */
    for(const i of [0,3,4,7]) rings[1][i].y -= 0.006;
    /* heavy brow shelf pushed forward, casting the dark sockets below it */
    for(const i of [1,2]){ rings[2][i].z += 0.018; rings[2][i].y -= 0.004; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.08);
      }
    }
    capFan(rings.at(-1), hunch(V(0, L.crownY+0.05, -0.01)), P.skinDk);

    /* DARK EYE SOCKETS — recessed dark quads under the brow, no eye geometry, just carved shadow */
    for(const s of [-1,1]){
      const c = hunch(V(s*0.040, L.browY-0.020, 0.080));
      quad(c.clone().add(V(-0.018,0.010,0)), c.clone().add(V(0.018,0.010,0)),
           c.clone().add(V(0.014,-0.014,-0.006)), c.clone().add(V(-0.014,-0.014,-0.006)), P.socket, 0.02);
    }

    /* HOOKED NOSE — a sharp downward-curving beak of a nose, the ancestor crone tell */
    {
      const nb = hunch(V(0, L.cheekY+0.010, 0.088));
      const nm = hunch(V(0, L.cheekY-0.028, 0.128));
      const nt = hunch(V(0, L.cheekY-0.072, 0.118));            // curls DOWN past the mouth line
      tube(nb, nm, 0.026, 0.020, 5, P.skinLt, {raz:0.030, rbz:0.020});
      tube(nm, nt, 0.020, 0.009, 5, P.skin,   {raz:0.020, rbz:0.010, capB:{hex:P.skinDk, lift:0.004}});
    }

    /* sunken mouth line + a couple of jagged teeth */
    {
      const mc = hunch(V(0, L.jawY-0.010, 0.086));
      quad(mc.clone().add(V(-0.032,0,0)), mc.clone().add(V(0.032,0,0)),
           mc.clone().add(V(0.020,-0.014,-0.010)), mc.clone().add(V(-0.020,-0.014,-0.010)), P.socket, 0.03);
      for(const s of [-1,1]){
        const tb = mc.clone().add(V(s*0.018,-0.002,0.004));
        const tt = tb.clone().add(V(s*0.004,-0.020,0.006));
        tube(tb, tt, 0.008, 0.002, 3, P.teeth);
      }
    }

    /* WARTS — a few small raised bumps on nose/cheek/chin */
    for(const [wx,wy,wz] of [[0.052,-0.010,0.070],[-0.038,0.028,0.078],[0.018,-0.058,0.098],[-0.048,-0.030,0.060]]){
      const c = hunch(V(wx, L.cheekY+wy, wz));
      const tip = c.clone().add(V(0,0.014,0.010));
      tube(c, tip, 0.012, 0.003, 4, P.wart);
    }

    /* WILD STRINGY HAIR — long ragged strands sweeping back off the crown + down the sides */
    for(const [ang,len,drop] of [[-1.3,0.30,0.10],[-0.9,0.38,0.16],[-0.4,0.34,0.08],[0.2,0.40,0.18],
                                   [0.7,0.32,0.06],[1.2,0.36,0.14],[1.9,0.28,0.20],[2.6,0.34,0.10]]){
      const root = hunch(V(Math.sin(ang)*0.06, L.crownY-0.01, Math.cos(ang)*0.05 - 0.02));
      const mid  = root.clone().add(V(Math.sin(ang)*0.10, -len*0.55, Math.cos(ang)*0.08 - drop*0.4));
      const tip  = mid.clone().add(V(Math.sin(ang)*0.07, -len*0.55 - drop, Math.cos(ang)*0.05 - drop*0.6));
      tube(root, mid, 0.018, 0.010, 3, (ang%1<0.5)?P.hair:P.hairDk);
      tube(mid, tip, 0.010, 0.003, 3, P.hairLt, {capB:{hex:P.hairDk, lift:0.004}});
    }
  }

  /* ---------- SIGNATURE A — grasping over-long fingers. A 3-segment elongated claw (vs. the
     shorter 2-segment ancestor claw) so the "over-long fingers" checklist item is countable and
     unmistakable in silhouette, not just a texture read. ---------- */
  const longFinger = (base, dir, len, hex)=>{
    const d = dir.clone().normalize();
    const p1 = base.clone().addScaledVector(d, len*0.38);
    const p2 = base.clone().addScaledVector(d, len*0.72);
    const p3 = base.clone().addScaledVector(d, len);
    tube(base, p1, 0.013, 0.010, 4, hex);
    tube(p1, p2, 0.010, 0.007, 4, hex);
    tube(p2, p3, 0.007, 0.002, 4, P.nail, {capB:{hex:P.nailLt, lift:0.003}});
  };
  const clawHand = (wrist, dir, hex)=>{
    const d = dir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(wrist.clone().addScaledVector(d,-0.02), wrist.clone().addScaledVector(d,0.024),
         0.034, 0.028, 5, hex, {capA:{hex}, capB:{hex}});
    for(const off of [-1,-0.35,0.35,1]){
      const knuckle = wrist.clone().addScaledVector(d,0.022).addScaledVector(side, off*0.022);
      const fdir = d.clone().addScaledVector(side, off*0.14).add(V(0,-0.10,0));
      longFinger(knuckle, fdir, 0.115, hex);
    }
  };

  /* ---------- ARMS — POSEFIX (2026-07-08): both arms now carry a real elbow ARC (ANATOMY-CANON
     POSE-ANATOMY law 2), not a near-straight rod. Shoulders ride the C-spine (law 3, hunch() at
     the shoulder anchor). R1 SELF-CORRECTION: the first pass bent the elbows in 3D (~50-100°) but
     the bend lived mostly in DEPTH (z) relative to this sheet's fixed ~45°/30° dimetric camera, so
     it foreshortened to a near-straight silhouette (law 5 failure even though law 2's angle math
     passed) — projected the landmarks through the actual ps1-sheet camera to confirm, then re-aimed
     the elbows to break sideways/vertically in SCREEN space, not just in the raw 3D angle.
     RIGHT — the bargain arm: elbow flares out to the side above the wrist line, forearm breaks
     ~87° off the upper arm sweeping back down-forward to the presenting palm-up hand — a clear
     screen-space kink, not a straight fall from shoulder to hand.
     LEFT — the soul-sack arm: elbow rides HIGH, above the shoulder line, a sharp ~40° point, then
     the forearm drops back down to clutch the sack tight against the body near the ribs. ---------- */
  {
    const S1 = hunch(V(L.shoulderX, L.shldY-0.01, 0.02));
    const E1 = V(0.290, 0.87, 0.24);                           // elbow flares out to the side — the kink
    const W1 = V(0.430, 0.80, 0.52);                           // forearm sweeps back down-forward to the offer
    tube(S1, E1, 0.052, 0.040, 5, P.skin);
    tube(E1, W1, 0.040, 0.028, 5, P.skinDk);
    clawHand(W1, V(0.44,-0.22,0.87), P.skin);                  // palm-up, continuing the forearm break

    const S2 = hunch(V(-L.shoulderX, L.shldY-0.01, 0.02));
    const E2 = V(-0.240, 0.95, 0.22);                          // elbow rides ABOVE the shoulder — sharp point
    const W2 = V(-0.130, 0.82, 0.28);                          // forearm drops back in tight, high, to the sack
    tube(S2, E2, 0.052, 0.038, 5, P.skin);
    tube(E2, W2, 0.038, 0.026, 5, P.skinDk);
    clawHand(W2, V(0.61,-0.72,0.33), P.skin);                  // clutching in tight against the body

    /* ---------- SOUL-SACK — a small drawstring bag clutched in the trailing left hand. ---------- */
    {
      const sackTop = W2.clone().add(V(-0.01,-0.02,0.03));
      const bands = [
        {y:sackTop.y-0.01, rx:0.028, rz:0.024, cx:sackTop.x, cz:sackTop.z, hex:P.sackDk},
        {y:sackTop.y-0.06, rx:0.050, rz:0.044, cx:sackTop.x-0.006, cz:sackTop.z+0.01, hex:P.sack},
        {y:sackTop.y-0.11, rx:0.040, rz:0.036, cx:sackTop.x-0.004, cz:sackTop.z+0.006, hex:P.sackDk},
      ];
      stack(bands, 6, {capBot:{hex:P.sackDk, lift:0.006}});
      /* drawstring tie — a thin loop cinching the neck */
      const tieC = V(sackTop.x, sackTop.y-0.01, sackTop.z);
      tube(tieC.clone().add(V(-0.03,0,0)), tieC.clone().add(V(0.03,0,0.01)), 0.007, 0.007, 4, P.tie);
      tube(tieC.clone().add(V(0,0.006,-0.02)), tieC.clone().add(V(0.01,-0.02,0.03)), 0.006, 0.003, 3, P.tie);
    }
  }

  /* ---------- LEGS — thin, mostly hidden by the robe hem; small bare bony feet peeking out.
     A weight-shifted stance: forward-planted leg driving into the lean, trailing leg rolled onto
     its toe (pose law 5 — caught mid-step into the bargain, not standing at attention). ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.150,0.34,0.02), ankL=V(-0.145,0.028,-0.05);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.145,0.36,0.10), ankR=V( 0.135,0.075,0.16);
    tube(hipL,kneeL,0.075,0.052,6,P.robeDk);
    tube(kneeL,ankL,0.040,0.026,6,P.skinDk);
    tube(hipR,kneeR,0.075,0.052,6,P.robeDk);
    tube(kneeR,ankR,0.040,0.028,6,P.skinDk);
    for(const [ank, toeZ] of [[ankL,-0.02],[ankR,0.075]]){
      const heel=V(ank.x,0.032,ank.z);
      const toe=V(ank.x, 0.026, ank.z+toeZ);
      tube(heel, toe, 0.030,0.020,5,P.skin,{capA:{hex:P.skinDk}});
      for(const off of [-1,0,1]){
        const tb=toe.clone().add(V(off*0.018,0,0));
        const tt=tb.clone().add(V(off*0.006,-0.006,0.026));
        tube(tb, tt, 0.008,0.002,3,P.skin,{capB:{hex:P.nail, lift:0.003}});
      }
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
