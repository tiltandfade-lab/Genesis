/* dev/model-qa/creatures/rlm-gloom-scarecrow.js — the SCARECROW (gloom, Construct, CR ~0.5-1,
   Medium). Straw effigy that only moves when unwatched — propped on a cross-frame post over a
   dead man's field, burlap face gone dark with weather, a hand-sewn smile unraveling at one
   corner. Currently stands in as a HARPY. Whole-object grammar: one function, one frame, no
   anchors. Spine +z, ground y=0, base disc r=0.42 (Medium).

   FEATURE CHECKLIST (what the budget buys):
     1. Burlap sack head — the pale HIGH-VALUE ZONE — lolling off-tilt, stitched grin + sewn button eyes.
     2. Cross-frame post + crossbeam — the signature SILHOUETTE read (a cross behind/through the body).
     3. Straw bursts at neck/wrists/ankles — torn seams spilling straw, secondary pale value pops.
     4. Twisted, straining torso — torque against the binding (the body reads as MID-ACTION, not built).
     5. One arm still roped to the crossbeam, the other torn free and clawing forward.
     6. One leg planted/braced, one driving a step against the post — the tearing-free lunge.

   POSE SENTENCE: twisting hard away from the post, right wrist still roped to the crossbeam, left
   arm torn free and clawing forward, one leg driving a step against the wood as straw bursts from
   every failing seam — the moment it tears itself loose, not a scarecrow standing at attention. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

/* a thin straw wisp burst — n tubes radiating mostly up/out from one point. torn-seam signature. */
function strawBurst(cx, cy, cz, n, len, hex, hexDk){
  for(let i = 0; i < n; i++){
    const ang = i * 2.4 + cx * 3.0 + cz * 1.7;
    const up = 0.35 + 0.55 * ((i * 3) % 5) / 5;
    const dx = Math.cos(ang) * (1 - up * 0.3), dz = Math.sin(ang) * (1 - up * 0.3), dy = up;
    const dn = Math.hypot(dx, dy, dz) || 1;
    const l = len * (0.7 + 0.3 * ((i * 7) % 3) / 3);
    const tip = V(cx + dx / dn * l, cy + dy / dn * l, cz + dz / dn * l);
    /* r2: base radius was 0.013 (0.026u diameter) — under the 0.04u feature floor, dissolved
       at 1/3-res. Thickened so the straw pops actually read as pale value hits. */
    tube(V(cx, cy, cz), tip, 0.022, 0.008, 4, (i % 2) ? hex : hexDk);
  }
}

export function buildScarecrow(){
  /* ---------- PALETTE ---------- */
  const P = {
    sack:0xc7ad78, sackDk:0x9c8557, sackSh:0x7c6a45,          // burlap sack head — the pale value zone
    rag:0x5c5138, ragDk:0x3f3826, ragSh:0x2b2618,             // patchwork body sacking
    skin:0x8a7248, skinDk:0x6a5636,                            // straw-stuffed limb burlap
    straw:0xc9a34e, strawDk:0x8f6d2e,                          // straw bursts
    wood:0xb0946a, woodDk:0x84693f,                            // cross-frame post/beam — bleached, brighter than the rag torso so it pops (r2: was dark-on-dark, near-invisible)
    rope:0x8a7a52, ropeDk:0x5f5236,
    thread:0xe3d6ac, mouth:0x1c1712, eye:0x181410,
    disc:0x3b3423, discTop:0x4a4229,
  };

  /* ---------- LANDMARKS ---------- */
  const L = {
    hipY:0.40, waistY:0.53, chestY:0.68, shldY:0.79, neckY:0.845,
    hipHalf:0.105, shoulderX:0.15,
  };

  /* ===== CROSS-FRAME POST — the signature silhouette, behind/through the body =====
     r2: widened + brightened (was reading as two dark nubs near the head, swallowed by the
     torso value) — now clears the shoulders on both sides and carries its own light value. */
  const postBase = V(-0.02, 0.02, -0.12), postTop = V(0.01, 1.22, -0.09);
  tube(postBase, postTop, 0.05, 0.038, 6, P.wood, {capB:{hex:P.woodDk}});
  const beamL = V(-0.40, 0.795, -0.11), beamR = V(0.38, 0.805, -0.10);
  tube(beamL, beamR, 0.04, 0.04, 6, P.wood, {capA:{hex:P.woodDk}, capB:{hex:P.woodDk}});
  /* splintered tear at the beam's right end, where the rope is still lashed */
  tube(beamR, V(beamR.x + 0.06, beamR.y + 0.035, beamR.z - 0.035), 0.024, 0.007, 4, P.woodDk);

  /* ===== TORSO — twisted, straining away from the post ===== */
  stack([
    {y:L.hipY,   rx:0.148, rz:0.118, cx:0.00, cz:0.00, hex:P.ragDk},
    {y:L.waistY, rx:0.130, rz:0.100, cx:0.015, cz:0.02, hex:P.rag},
    {y:L.chestY, rx:0.158, rz:0.118, cx:0.05, cz:0.08, hex:P.rag},
    {y:L.shldY,  rx:0.150, rz:0.100, cx:0.07, cz:0.11, hex:P.ragDk},
    {y:L.neckY,  rx:0.052, rz:0.048, cx:0.075, cz:0.12, hex:P.sackDk},
  ], 8, {capTop:{hex:P.sackDk, lift:0.004}});
  /* a torn patch panel on the chest — a lighter sack square, the "field-worn" read */
  quad(V(-0.06,L.chestY+0.06,0.155), V(0.05,L.chestY+0.05,0.16), V(0.04,L.chestY-0.06,0.165), V(-0.05,L.chestY-0.05,0.16), P.ragSh, 0.05);
  /* neck seam — torn where the sack head is lashed on, straw bursting through the gap */
  strawBurst(0.075, L.neckY + 0.01, 0.12, 6, 0.075, P.straw, P.strawDk);

  /* ===== HEAD — burlap sack, lolling off-tilt (the high-value zone) ===== */
  const hC = {x:0.085, y:0.955, z:0.12};   // head center, offset from the tilt/loll
  {
    const n = 8, ph = Math.PI / n;
    const bands = [
      {y:L.neckY + 0.02, rx:0.062, rz:0.058, cx:0.08,  cz:0.12,  hex:P.sackDk},
      {y:0.905,          rx:0.088, rz:0.082, cx:0.085, cz:0.115, hex:P.sack},
      {y:0.965,          rx:0.098, rz:0.088, cx:0.09,  cz:0.09,  hex:P.sack},
      {y:1.015,          rx:0.075, rz:0.068, cx:0.075, cz:0.05,  hex:P.sackDk},
    ];
    const rings = bands.map(b => ring(V(b.cx, b.y, b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b => bands[b].hex);
    capFan(rings.at(-1), V(0.055, 1.05, 0.01), P.sackSh);
    /* a tied-off knot at the crown, the sack's drawstring top */
    blob(0.055, 1.055, 0.02, 0.022, 0.018, 0.022, P.ropeDk, 5, 3);
  }
  /* sewn button eyes — small dark patches, one slightly askew (the unraveling read) */
  blob(hC.x - 0.038, hC.y + 0.02, hC.z + 0.075, 0.017, 0.017, 0.012, P.eye, 5, 3);
  blob(hC.x + 0.040, hC.y + 0.012, hC.z + 0.078, 0.017, 0.014, 0.012, P.eye, 5, 3);
  /* stitched grin — dark mouth slit + thread-cross marks unraveling at one corner */
  quad(V(hC.x-0.052,hC.y-0.035,hC.z+0.082), V(hC.x+0.045,hC.y-0.028,hC.z+0.084),
       V(hC.x+0.040,hC.y-0.058,hC.z+0.078), V(hC.x-0.048,hC.y-0.060,hC.z+0.076), P.mouth, 0.0);
  for(let i = 0; i < 5; i++){
    const t = i / 4, mx = hC.x - 0.048 + t * 0.095, my = hC.y - 0.033 - t * 0.010;
    const frayed = i === 4;   // the last stitch has come loose — "unraveling at one corner"
    const a = V(mx - 0.010, my + (frayed?0.016:0.014), hC.z + 0.086);
    const b = V(mx + 0.010, my - (frayed?0.010:0.014), hC.z + 0.086);
    tube(a, b, 0.005, 0.005, 4, frayed ? P.sackSh : P.thread);
  }

  /* ===== ARMS — one lashed to the beam (tucked, tense), one torn free (flung forward) ===== */
  const ShR = V(0.06 + L.shoulderX * 0.85, L.shldY - 0.01, 0.10 - 0.03);
  const ShL = V(0.06 - L.shoulderX * 1.05, L.shldY - 0.04, 0.10 + 0.02);

  /* RIGHT — yanked UP tight against the beam, elbow tucked near the head, not out to the side */
  {
    const elbow = V(ShR.x + 0.035, ShR.y + 0.115, ShR.z - 0.06);
    const wrist = V(beamR.x - 0.04, beamR.y - 0.02, beamR.z + 0.04);
    tube(ShR, elbow, 0.048, 0.038, 6, P.ragDk);
    tube(elbow, wrist, 0.034, 0.026, 6, P.skin);
    /* torn wrist cuff bursting straw */
    strawBurst(wrist.x, wrist.y, wrist.z, 5, 0.055, P.straw, P.strawDk);
    blob(wrist.x, wrist.y - 0.01, wrist.z, 0.026, 0.020, 0.026, P.skinDk, 5, 3);
    /* the rope — taut, wrapped once, straight to the beam's tip (visibly binds it) */
    const rMid = V((wrist.x + beamR.x) / 2, (wrist.y + beamR.y) / 2 + 0.015, (wrist.z + beamR.z) / 2);
    tube(wrist, rMid, 0.016, 0.014, 5, P.rope);
    tube(rMid, beamR, 0.014, 0.016, 5, P.ropeDk);
    blob(rMid.x, rMid.y, rMid.z, 0.018, 0.015, 0.018, P.ropeDk, 5, 3);
  }
  /* LEFT — torn free, flung forward-down hard, clawing at the ground it's lunging toward */
  {
    const elbow = V(ShL.x - 0.07, ShL.y - 0.22, ShL.z + 0.28);
    const wrist = V(ShL.x - 0.12, ShL.y - 0.48, ShL.z + 0.50);
    tube(ShL, elbow, 0.050, 0.036, 6, P.ragDk);
    tube(elbow, wrist, 0.032, 0.022, 6, P.skin);
    strawBurst(wrist.x, wrist.y + 0.02, wrist.z, 5, 0.05, P.straw, P.strawDk);
    /* clawed straw fingers fanning from the torn wrist */
    const fan = [V(-0.3,-0.3,1), V(-0.05,0.05,1), V(0.2,-0.1,1), V(0.4,-0.35,1)];
    for(const d of fan){
      const dn = d.clone().normalize();
      const tip = wrist.clone().addScaledVector(dn, 0.075);
      tube(wrist, tip, 0.012, 0.005, 4, P.strawDk);
    }
  }

  /* ===== LEGS — brace leg pulled back, stride leg driving forward hard (the lunge away) ===== */
  const hipL = V(-L.hipHalf, L.hipY - 0.01, 0.0), kneeL = V(-0.17, 0.20, -0.05), ankL = V(-0.16, 0.05, -0.09);
  tube(hipL, kneeL, 0.058, 0.044, 6, P.ragDk); tube(kneeL, ankL, 0.040, 0.030, 6, P.skin);
  /* r2: was (0.24,0.25,0.24)->(0.31,0.05,0.33) — driving mostly in +z (toward camera), so it
     foreshortened into the base-disc shadow and read as a dark blob, not a stride. Pulled the
     drive laterally (+x) and lifted the ankle off the ground plane (mid-stride foot, not flat)
     so the lunge clears the disc's dark value and reads in silhouette. */
  const hipR = V(L.hipHalf, L.hipY - 0.01, 0.0), kneeR = V(0.33, 0.29, 0.14), ankR = V(0.43, 0.13, 0.11);
  tube(hipR, kneeR, 0.058, 0.044, 6, P.ragDk); tube(kneeR, ankR, 0.040, 0.030, 6, P.skin);
  for(const [ank, toeDir] of [[ankL, V(0.03,0,1)], [ankR, V(0.55,0,0.6)]]){
    strawBurst(ank.x, ank.y + 0.015, ank.z, 4, 0.045, P.straw, P.strawDk);
    const dn = toeDir.clone().normalize();
    const toe = V(ank.x, 0.045, ank.z).addScaledVector(dn, 0.10);
    tube(V(ank.x,0.045,ank.z), toe, 0.032, 0.016, 5, P.skinDk, {raz:0.026, rbz:0.012});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2 = ring(V(0,0.05,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], () => P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
