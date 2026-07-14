/* dev/model-qa/creatures/mon-giant.js — HILL GIANT (REBUILD, MODEL-FOUNDRY rebuild-w3, cell 6).
   Whole-object grammar: one function, one geometry frame, no anchors. HUMANOID family (ANATOMY-CANON
   §HUMANOID: PC-kit-grammar baseline) scaled to HUGE — the biggest board piece in the cast, ~2.63u.
   REBUILD (2026-07-08): geometry replaced under MODEL-FOUNDRY's six laws; palette intent (sun-browned
   tan hide, dark crude wrap, dumb heavy-browed head) and the giant's named signature idiom (a huge
   gripped mass overhead) are PRESERVED from the prior pass, but the signature object swaps from the
   tree club to a jagged BOULDER and the pose swaps from a settled standing slump to the boulder-heave
   wind-up (law 5 — never at-attention). Imported by mon-giant-probe.html + the foundry sheet.

   FEATURE CHECKLIST (the ~1.1k-tri budget, spent on):
     1. The gripped BOULDER, hoisted overhead-behind in both fists — jagged rock mass with one bright
        highlight facet (the signature + the law-3 high-value zone).
     2. The POT-BELLY gut — widest point of the torso, wider than the shoulders (the "giant, not a
        blob" read, now made the loudest silhouette bulge since the arms no longer carry a club mass).
     3. The torqued/arched SPINE — hip-to-neck cx/cz drift bends the torso backward-and-around into the
        wind-up (law 5), culminating at the head thrown back toward the boulder.
     4. SLOPED SHOULDERS — narrower, rounder shoulder band than the gut (no square deltoid block),
        sloping down off the thick neck — the family trait named in the brief.
     5. Bare, thick-toed FEET planted in a wide lunge stride (one foot forward toward the throw line,
        one trailing back bearing the wind-up weight) — no sandals this pass.
     6. Bare chest/face SKIN (bright) against a dark crude hip-WRAP (near-black-brown) — the other
        law-3 value pair named in the brief, replacing the full poncho with a waist-only hide wrap so
        the bright torso skin actually shows.

   POSE SENTENCE: the giant winds up to throw — weight loaded back onto the trailing leg, the front
   foot planted forward toward the throw line, spine arched and torqued backward so the whole torso
   and head lean up-and-back, both fists locked under a huge jagged boulder held high behind the skull
   an instant before release. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildHillGiant(){
  /* ---------- PALETTE (VS desaturated; sun-browned tan skin, wide value spread; kept from the prior
     pass where the idiom carries over — boulder + wrap tones are new) ---------- */
  const P = {
    skin:0xb08a5e, skinDk:0x83653f, skinLt:0xc49e6e, skinMot:0x9a7a4e,     // sun-browned tan hide
    belly:0xbb976a, bellyDk:0x8c6f48,                                       // heavy pot-belly gut
    wrap:0x4c3d28, wrapDk:0x342a1a, wrapLt:0x63513c, patch:0x5a4a30,        // dark crude hip-wrap (hide strips)
    patch2:0x6e5a3c, stitchCol:0x241d12,                                    // patch variation + stitch lines
    stone:0x8a8272, stoneDk:0x5c574a, stoneLt:0xaba290, stoneHi:0xd8cfae,   // BOULDER: rock + the bright signature facet
    nail:0x2b2620,                                                          // toenails
    brow:0x6e5638,                                                          // brow shadow tone (no eyes — Adam 2026-07-04 ruling, kept)
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — HUGE, ~2.63u head-top. Crouched into the wind-up (hips lower than the
     prior standing pass) rather than upright. ---------- */
  const L = {
    hipY:1.05, gutY:1.24, waistY:1.40, ribY:1.60, chestY:1.82, shldY:2.00, neckY:2.10,
    hipHalf:0.270,
    jawY:2.20, cheekY:2.32, browY:2.44, crownY:2.55, headTopY:2.63,
  };

  /* per-band torque offsets (medusa-style: baked into the stack, not a rigid whole-body rotation) —
     cz goes progressively NEGATIVE (backward) and cx progressively positive (a slight counter-twist
     toward the trailing/back-foot side) climbing the spine, so the torso reads as arching up-and-back
     into the throw rather than a flat lean. Head bands continue the same arc. */
  const O = {
    hip:{cx:0.000, cz: 0.000}, gut:{cx:0.000, cz:-0.014}, waist:{cx:0.010, cz:-0.034},
    rib:{cx:0.022, cz:-0.062}, chest:{cx:0.034, cz:-0.100}, shld:{cx:0.050, cz:-0.148},
    neck:{cx:0.062, cz:-0.182},
    jaw:{cx:0.068, cz:-0.204}, cheek:{cx:0.072, cz:-0.222}, brow:{cx:0.076, cz:-0.240},
    crown:{cx:0.080, cz:-0.258}, top:{cx:0.083, cz:-0.272},
  };

  /* ---------- BOULDER FIRST — a huge jagged rock, hoisted overhead-BEHIND in both fists (the
     signature). Built from overlapping lumpy blobs (irregular, not a sphere) with a few sharp chip
     facets and ONE bright highlight facet — the law-3 high-value zone the signature carries. ---- */
  const BC = V(0.03, 2.97, -0.56);
  {
    blob(BC.x, BC.y, BC.z, 0.300, 0.270, 0.290, P.stone, 8, 5);
    blob(BC.x-0.17, BC.y+0.05, BC.z+0.10, 0.190, 0.175, 0.185, P.stoneDk, 7, 4);
    blob(BC.x+0.19, BC.y-0.06, BC.z-0.08, 0.185, 0.165, 0.175, P.stone, 7, 4);
    blob(BC.x+0.02, BC.y+0.19, BC.z-0.06, 0.150, 0.130, 0.140, P.stoneLt, 6, 4);
    // sharp chip facets jutting off the mass (jagged, not rounded — the rock read)
    for(const [dx,dy,dz,r] of [[-0.22,-0.10,0.16,0.100],[0.24,0.10,0.14,0.090],[0.02,-0.18,-0.14,0.085],[-0.06,0.24,0.10,0.075]]){
      blob(BC.x+dx, BC.y+dy, BC.z+dz, r, r*0.75, r*0.65, P.stoneDk, 5, 3);
    }
    // the ONE bright highlight facet (law 3 — the signature carries the high-value zone)
    blob(BC.x-0.02, BC.y+0.24, BC.z-0.14, 0.095, 0.075, 0.080, P.stoneHi, 5, 3);
  }

  /* ---------- TORSO — pot-belly WIDEST (wider than the sloped shoulders), arching back per O. ---- */
  stack([
    {y:L.hipY,   rx:0.400, rz:0.360, cx:O.hip.cx,   cz:O.hip.cz,   hex:P.skinDk},
    {y:L.gutY,   rx:0.540, rz:0.500, cx:O.gut.cx,   cz:O.gut.cz,   hex:P.belly},      // pot-belly — widest
    {y:L.waistY, rx:0.520, rz:0.480, cx:O.waist.cx, cz:O.waist.cz, hex:P.belly},
    {y:L.ribY,   rx:0.450, rz:0.370, cx:O.rib.cx,   cz:O.rib.cz,   hex:P.bellyDk},
    {y:L.chestY, rx:0.460, rz:0.340, cx:O.chest.cx, cz:O.chest.cz, hex:P.skinLt},     // bare bright chest (law 3)
    {y:L.shldY,  rx:0.480, rz:0.340, cx:O.shld.cx,  cz:O.shld.cz,  hex:P.skin},       // SLOPED shoulders — narrower than the gut
    {y:L.neckY,  rx:0.220, rz:0.210, cx:O.neck.cx,  cz:O.neck.cz,  hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.008}});

  /* ---------- CRUDE HIDE WRAP — a hip-only wrap (not a full poncho), leaving the chest bare so the
     skin/wrap value pair reads. Patch-quilted hide strips + a couple of ragged hanging flaps. ------- */
  {
    stack([
      {y:L.hipY-0.03,  rx:0.430, rz:0.400, cx:O.hip.cx,   cz:O.hip.cz,   hex:P.wrapDk},
      {y:L.gutY+0.05,  rx:0.570, rz:0.530, cx:O.gut.cx,   cz:O.gut.cz,   hex:P.wrap},
      {y:L.waistY+0.02,rx:0.550, rz:0.510, cx:O.waist.cx, cz:O.waist.cz, hex:P.wrapLt},
    ], 8, {});
    const patchTones=[P.patch, P.patch2, P.wrapLt];
    let pi=0;
    for(const [x0,x1] of [[-0.34,-0.08],[-0.02,0.22],[0.28,0.46]]){
      const z=0.40 + O.gut.cx*0.4;
      const a=V(x0+O.gut.cx,L.gutY,z), b=V(x1+O.gut.cx,L.gutY,z), c=V(x1+O.waist.cx+0.02,L.waistY,z-0.02), d=V(x0+O.waist.cx-0.02,L.waistY,z-0.02);
      quad(a,b,c,d, patchTones[pi%patchTones.length], 0.06); pi++;
      quad(V(x0+O.waist.cx,L.waistY-0.01,z-0.02), V(x1+O.waist.cx,L.waistY-0.01,z-0.02),
           V(x1+O.waist.cx,L.waistY+0.006,z-0.026), V(x0+O.waist.cx,L.waistY+0.006,z-0.026), P.stitchCol, 0.0);
    }
    // ragged hem flaps hanging over the hips
    for(const [sx,w] of [[-0.30+O.gut.cx,0.13],[0.06+O.gut.cx,0.15]]){
      const z=0.42+O.gut.cx*0.4;
      const top=V(sx,L.waistY+0.02,z), botL=V(sx-w*0.4,L.gutY-0.06,z), botR=V(sx+w*0.4,L.gutY-0.10,z);
      quad(top, botL, botR, top, P.wrapDk, 0.06);
    }
  }

  /* ---------- HEAD — heavy-browed, bald, dull-vacant (kept from the prior pass), now thrown back atop
     the arched neck per O.jaw..O.top. No eyes — Adam's 2026-07-04 ruling, unchanged. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.255, rz:0.245, cx:O.jaw.cx,   cz:O.jaw.cz,   hex:P.skinLt},
      {y:L.cheekY, rx:0.265, rz:0.250, cx:O.cheek.cx, cz:O.cheek.cz, hex:P.skin},
      {y:L.browY,  rx:0.245, rz:0.212, cx:O.brow.cx,  cz:O.brow.cz,  hex:P.skin},
      {y:L.crownY, rx:0.205, rz:0.192, cx:O.crown.cx, cz:O.crown.cz, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(b.cx,b.y,b.cz+0.02), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.032;                                  // flat nose push
    for(const i of [1,2]){ rings[2][i].z += 0.038; rings[2][i].y -= 0.028; }        // heavy brow shelf
    for(const i of [0,3]){ rings[2][i].z += 0.016; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(O.top.cx, L.headTopY, O.top.cz+0.00), P.skinDk);            // bald dome

    const jawFrontBot = V(O.jaw.cx, L.jawY-0.180, O.jaw.cz+0.260);
    tube(V(O.jaw.cx,L.jawY+0.02,O.jaw.cz+0.03), jawFrontBot, 0.255, 0.170, 6, P.skinLt, {raz:0.220, rbz:0.130, capB:{hex:P.skinDk}});

    for(const s of [-1,1]){
      const eb = V(s*0.245+O.cheek.cx, L.cheekY, O.cheek.cz+0.00);
      const et = V(s*0.285+O.cheek.cx, L.cheekY+0.075, O.cheek.cz-0.08);
      tube(eb, et, 0.068, 0.042, 5, P.skin, {raz:0.048, rbz:0.028, capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.004}});
    }
    for(const [dx,dy,dz,r] of [[-0.10,L.crownY-0.02,0.08,0.070],[0.14,L.cheekY+0.02,0.14,0.055]]){
      const c=V(dx+O.crown.cx,dy,dz+O.crown.cz); blob(c.x,c.y,c.z, r, r*0.7, r*0.6, P.skinMot, 5, 3);
    }
  }

  /* ---------- ARMS — both raised, curving up-and-back over the head to grip the boulder from
     beneath. Deltoids seat on the sloped shoulder band; upper-arm/forearm are freeform world waypoints
     (the same convention the prior pass used for its club-grip curve). ---------- */
  const bigFist = (ctr, towardCtr, hex)=>{
    const d = towardCtr.clone().sub(ctr).normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.090), ctr.clone().addScaledVector(d,0.090),
         0.150, 0.135, 6, hex, {raz:0.115, rbz:0.115, capA:{hex}, capB:{hex}});
    for(const off of [-1.0,0,1.0]){
      const kb = ctr.clone().addScaledVector(d,0.075).addScaledVector(side, off*0.085);
      const kt = kb.clone().addScaledVector(d,0.110).addScaledVector(side, off*0.020);
      tube(kb, kt, 0.040, 0.018, 4, hex, {capB:{hex:P.skinDk, lift:0.006}});
    }
  };
  {
    const shX=0.500;
    // right arm -> right grip
    const SR=V(shX+O.shld.cx-0.02, L.shldY-0.02, O.shld.cz+0.03);
    { const dl=V(shX*0.92+O.shld.cx, L.shldY, O.shld.cz+0.02); blob(dl.x,dl.y,dl.z, 0.185,0.165,0.170, P.skinLt, 7, 4); }
    const ER=V(0.62, 2.55, -0.38);
    const GRIPR=V(0.20, 2.86, -0.46);
    tube(SR,ER,0.195,0.155,6,P.skin);
    tube(ER,GRIPR,0.150,0.125,6,P.skinDk);
    bigFist(GRIPR, BC, P.skinLt);

    // left arm -> left grip
    const SL=V(-shX+O.shld.cx+0.02, L.shldY-0.02, O.shld.cz+0.03);
    { const dl=V(-shX*0.92+O.shld.cx, L.shldY, O.shld.cz+0.02); blob(dl.x,dl.y,dl.z, 0.185,0.165,0.170, P.skinLt, 7, 4); }
    const EL=V(-0.58, 2.53, -0.34);
    const GRIPL=V(-0.16, 2.86, -0.50);
    tube(SL,EL,0.195,0.155,6,P.skin);
    tube(EL,GRIPL,0.150,0.125,6,P.skinDk);
    bigFist(GRIPL, BC, P.skinLt);
  }

  /* ---------- LEGS — wide LUNGE stride: front foot forward toward the throw line, trailing leg
     bearing the wind-up weight. Bare feet, thick-nailed toes — no sandals this pass. ------------- */
  {
    /* NOTE — knee/ankle deltas are kept near-VERTICAL (horizontal offset small relative to the drop):
       ring()'s cross-section plane follows the tube axis, so a shin tube angled too far off-vertical
       tips its ring partly into the horizontal plane and can dip its radius below y=0 at the ankle end.
       The forward stride reach lives in the FOOT length instead, not in the ankle's horizontal offset. */
    /* CRITIC PASS-2 (2026-07-08): widened X spread + pushed the Z stagger further apart so the
       wide lunge stride (front foot toward the throw line vs. the trailing weight-bearing leg)
       actually separates into two readable columns in the engine's dithered iso capture — round 1
       had both legs compress into one narrow low-contrast mass. Trailing leg's shin lightened
       (skinDk -> skin) so it doesn't fall near-value with the dark ground dither (law 3). */
    const hipL=V(-L.hipHalf, L.hipY-0.02, -0.02), kneeL=V(-0.560,0.62,-0.28), ankL=V(-0.640,0.02,-0.40);
    const hipR=V( L.hipHalf, L.hipY-0.02,  0.04), kneeR=V( 0.560,0.66, 0.20), ankR=V( 0.620,0.02, 0.30);
    tube(hipL,kneeL,0.250,0.180,6,P.skin);
    tube(kneeL,ankL,0.170,0.120,6,P.skin);
    tube(hipR,kneeR,0.250,0.180,6,P.skin);
    tube(kneeR,ankR,0.170,0.120,6,P.skinDk);
    for(const [ank,toeDir,footLen] of [[ankL,V(-0.10,0,-0.55),0.30], [ankR,V(0.08,0,1),0.44]]){
      const d=toeDir.clone().normalize();
      // heel lifted so the horizontal foot-slab tube's vertical cross-section radius (raz) doesn't
      // dip its bottom edge below y=0 (a horizontal-axis tube's ring extends vertically by raz/rbz).
      const heel=V(ank.x,0.135,ank.z);
      tube(heel.clone().addScaledVector(d,-0.03), heel.clone().addScaledVector(d,footLen), 0.148,0.108,6,P.skin,
           {raz:0.128, rbz:0.086, capA:{hex:P.skinDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,footLen*0.90).addScaledVector(side, off*0.086);
        const tt=tb.clone().addScaledVector(d,footLen*0.30).addScaledVector(side, off*0.010);
        tube(tb, tt, 0.037,0.015,4,P.skinDk,{capB:{hex:P.nail, lift:0.008}});
      }
    }
  }

  /* ---------- base disc (HUGE — the biggest board footprint in the cast) ------------------------ */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.66, 0.66, 18);
    const r2=ring(V(0,0.062,0), V(0,1,0), 0.64, 0.64, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.065,0), P.discTop);
  }
}
