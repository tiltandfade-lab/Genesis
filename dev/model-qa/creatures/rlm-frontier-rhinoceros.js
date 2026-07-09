/* dev/model-qa/creatures/rlm-frontier-rhinoceros.js — the RHINOCEROS landmark table (QUADRUPED-
   UNGULIGRADE family, Huge, CR 6, realm frontier — "Stampede-Cursed Longhorn" per
   data/realm-bestiary.js), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 band (foundry
   pilot, frontier-w2 cell 3, port 5333). Core identity: the RHINO — a massive, low-slung,
   plumb-legged bull committed to a full-gallop charge that never lets up, eyes gone flat black,
   the stampede behind it never thinning.

   FEATURE CHECKLIST (the ~1,700-2,000 budget buys; Huge size + the paired horn stack justify
   sitting at the top of the band per the header note):
     1. QUADRUPED-UNGULIGRADE anatomy per ANATOMY-CANON, BOAR-style torso dial (front-heavy,
        L>H, a shoulder/withers HUMP as the tallest point, back sloping down to a lower rump) but
        scaled to a massive low-slung barrel — deep, wide, and heavy, not lean. Front legs run
        as a straight plumb column carrying the charging weight; hind legs run the gentle
        Z-zigzag (stifle high & tucked, hock the prominent backward bend) — but BOTH pairs are
        thrown into the mid-gallop extension below (see pose), so the contrast law reads as
        "reaching straight front vs. driving angular rear," not a standing square.
     2. SIGNATURE — the committed charge: body pitched forward and down, head dropped LOW
        (per ANATOMY-CANON's uniglade head note, but driven horn-first below shoulder height —
        the whole point of a charging rhino), one rear leg extended full and straight out
        behind, off the ground, the other three driving/reaching through the gallop.
     3. The TWO-HORN NOSE STACK — a short blunt browhorn riding low over a longer curved
        nasal horn, both pale (the law-3 high-value zone), stacked one behind the other right
        at the head-low charge point so the signature sits exactly where the eye lands first.
     4. The SHOULDER HUMP — a heavy muscled ridge rising off the withers, the tallest point of
        the animal per the boar dial, riding directly above the driving front legs.
     5. Dust-brown hide over a huge low-slung barrel, thick plumb-column front legs, small
        folded ears pinned back (charge, not grazing), a short stiff tail flagged out behind.
     6. Base disc under the three grounded hooves only (the fourth, the extended rear, floats
        clear) — nothing under the trailing leg sells "mid-gallop," matching the warhorse rig's
        convention for an airborne limb.

   POSE SENTENCE: the committed charge — body pitched forward and down, the shoulder hump
   driving over straight-plumb front legs, head dropped low and horn-first below the withers,
   the two-horn nose stack leading the whole animal, one rear leg extended full and straight
   out behind clear of the ground while the other three drive through the gallop stride — never
   a squared grazing stand.

   SPINE-GESTURE SENTENCE: the trace from rump to skull is NOT a plumb line — it dives from a
   raised, driving rump/haunch down through a level-to-dropping back, crests at the shoulder
   hump, then plunges hard through a short thick neck to a head pitched down and forward past
   horizontal, horn-tips leading the whole gesture below shoulder height; the extended rear leg
   is the stride's counterweight, trailing straight back off the ground.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Huge: ~1.55u long/1.05u tall at the hump. Imported by ps1-sheet.html
   (SETS['frontier-w2'], cell 3, fn buildRhinoceros). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildRhinoceros(){
  /* ---------- PALETTE — dust-brown hide, pale two-horn stack (the law-3 high-value zone),
     dark hooves/eyes, a slightly paler belly/underside for barrel value contrast. ---------- */
  const P = {
    hide: 0x6e5a42, hideDk: 0x4c3e2c, belly: 0x8c795a, humpDk: 0x40331f,
    horn: 0xd8cdae, hornDk: 0xa89876,
    hoof: 0x241c14, hoofDk: 0x160f0a,
    ear: 0x584634, eye: 0x0d0a07,
    disc: 0x3c332a, discTop: 0x483d32,
  };

  /* ---------- SPINE LANDMARKS — the dive-crest-plunge trace: rump raised/driving, back level-
     to-dropping, shoulder hump the tallest point, neck short and thick, head pitched down past
     horizontal, horns leading below withers height. ---------- */
  const S = {
    rump:    V(0, 0.70, -0.62),   // raised, driving haunch
    back:    V(0, 0.80, -0.30),
    withers: V(0, 0.92, -0.02),
    hump:    V(0, 1.02,  0.10),   // shoulder hump — tallest point
    chest:   V(0, 0.86,  0.30),
    neckB:   V(0, 0.78,  0.44),
    neckT:   V(0, 0.58,  0.62),   // neck plunges down harder
    headB:   V(0, 0.46,  0.74),
    headT:   V(0, 0.34,  0.94),   // skull pitched down-forward, pushed well clear of the barrel
    nose:    V(0, 0.22,  1.14),   // nose tip, well below withers — the charge's leading point,
                                   // pushed forward of the torso silhouette so it reads unoccluded
  };

  /* ---------- BARREL — one loft rump->back->withers->hump->chest->neckB, deep and wide
     (Huge, boar-dial front-heavy: widest near the hump/chest, tapering to the rump). ---------- */
  tube(S.rump,    S.back,    0.34, 0.40, 14, P.hide,   {phase:Math.PI/14, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.back,    S.withers, 0.40, 0.46, 14, P.hide,   {phase:Math.PI/14});
  tube(S.withers, S.hump,    0.46, 0.44, 14, P.hide,   {phase:Math.PI/14});
  tube(S.hump,    S.chest,   0.44, 0.40, 14, P.hideDk, {phase:Math.PI/14});
  tube(S.chest,   S.neckB,   0.40, 0.26, 14, P.hide,   {phase:Math.PI/14});
  /* shoulder hump crest — a heavy muscled ridge riding directly over the withers/hump, the
     tallest point per the boar-dial front-heavy anatomy. */
  blob(0, S.hump.y+0.10, S.hump.z-0.06, 0.20, 0.12, 0.22, P.humpDk, 10, 5);

  /* SKIN-PLATE FOLDS — the rhino's signature armor-plate creases: two countable dark fold
     rings crossing the barrel behind the shoulder and ahead of the haunch (a real anatomical
     feature of the family, not padding — this is the "huge tank-hide" read at a squint). */
  for(const [cz,r] of [[S.withers.z-0.10, 0.46], [S.back.z+0.02, 0.42]]){
    const fr1=ring(V(0,S.withers.y-0.02,cz), V(0,0,1), r, r*0.92, 12, Math.PI/12);
    const fr2=ring(V(0,S.withers.y-0.02,cz-0.04), V(0,0,1), r*0.97, r*0.90, 12, Math.PI/12);
    stitch([fr1,fr2], ()=>P.hideDk);
  }

  /* pale-ish belly panel — barrel value contrast on the huge low-slung underside */
  quad(V(-0.22,S.rump.y-0.34,S.rump.z+0.06), V(0.22,S.rump.y-0.34,S.rump.z+0.06),
       V(0.20,S.chest.y-0.30,S.chest.z-0.02), V(-0.20,S.chest.y-0.30,S.chest.z-0.02), P.belly, 0.05);

  /* ---------- NECK -> HEAD — short, thick, plunging down past horizontal (the charge's dive). */
  tube(S.neckB, S.neckT, 0.26, 0.22, 11, P.hide, {phase:Math.PI/11});
  {
    const n=11, ph=Math.PI/11;
    const bands=[
      {y:S.headB.y+0.02, cz:S.headB.z-0.02, rx:0.190, rz:0.220, hex:P.hideDk}, // jowl/cheek
      {y:S.headB.y-0.06, cz:S.headB.z+0.10, rx:0.170, rz:0.190, hex:P.hide},   // muzzle base, wide flat rhino head
      {y:S.headT.y-0.04, cz:S.headT.z+0.06, rx:0.130, rz:0.150, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* flat wide muzzle cap, then the short blunt nose leading the whole charge */
    capFan(rings.at(-1), V(0, S.nose.y+0.02, S.nose.z-0.06), P.hide);

    /* two folded ears, small and pinned BACK (charge alertness, not grazing) */
    for(const s of [-1,1]){
      const eb=V(s*0.15, S.headB.y+0.16, S.headB.z-0.06), et=V(s*0.22, S.headB.y+0.24, S.headB.z-0.20);
      tube(eb, et, 0.055, 0.010, 5, P.ear, {raz:0.032, rbz:0.006, capB:{hex:P.hideDk, lift:0.004}});
    }
    /* two small dark eyes, flat-black — "stopped being an animal" per flavor */
    for(const s of [-1,1]) blob(s*0.155, S.headB.y+0.04, S.headB.z-0.02, 0.020,0.016,0.016, P.eye, 5, 3);
  }

  /* ---------- THE TWO-HORN NOSE STACK — the signature. A short blunt browhorn riding low,
     stacked directly behind a longer curved nasal horn out front — both pale (law-3 high-value
     zone), sitting right at the charge's leading point below shoulder height. ---------- */
  {
    /* browhorn — shorter, blunter, set back near the brow */
    const bhB = V(0, S.headT.y+0.08, S.headT.z-0.02), bhT = V(0, S.headT.y+0.28, S.headT.z+0.08);
    tube(bhB, bhT, 0.095, 0.038, 8, P.horn, {phase:Math.PI/8, capB:{hex:P.hornDk, lift:0.01}});
    /* nasal horn — the long curved leader, rooted forward of the browhorn and sweeping up-
       forward past the nose tip, the animal's foremost point; enlarged + pushed further out in
       front of the barrel silhouette so the signature reads unoccluded from the render camera. */
    const nhB = V(0, S.nose.y+0.08, S.nose.z-0.14);
    const nhM = V(0, S.nose.y+0.34, S.nose.z+0.08);
    const nhT = V(0, S.nose.y+0.62, S.nose.z+0.28);
    tube(nhB, nhM, 0.120, 0.068, 8, P.horn, {phase:Math.PI/8, capA:{hex:P.hornDk, lift:0.01}});
    tube(nhM, nhT, 0.068, 0.016, 8, P.horn, {phase:Math.PI/8, capB:{hex:P.hornDk, lift:0.006}});
  }

  /* ---------- LEGS — 4 thick plumb-column legs. Mid-gallop: front pair reaches/drives under
     the charging weight (near-vertical column per the ungulate front-leg rule), rear pair
     splits — one driving/planted (angular Z-zigzag), one extended full and straight out behind,
     clear of the ground (the "committed charge" signature). ---------- */
  {
    const legCol=(hipX, hipZ, footX, footZ, thickTop, thickBot, driveDown)=>{
      const H = V(hipX, S.chest.y-0.18, hipZ);
      const knee = V(hipX*1.02, 0.42-driveDown, hipZ+0.02);
      const fet  = V(footX, 0.16-driveDown, footZ);
      const hoof = V(footX, 0.04-driveDown, footZ+0.01);
      tube(H, knee, thickTop, thickTop*0.72, 11, P.hide);
      tube(knee, fet, thickTop*0.72, thickBot, 11, P.hideDk);
      tube(fet, hoof, thickBot, thickBot*1.15, 8, P.hide, {capB:{hex:P.hoofDk, lift:0.01}});
      return hoof;
    };
    /* rhino toenail — three small blunt nubs fanned across the front of a hoof (the real
       three-toed rhino foot, a genuine anatomical countable feature, not padding). */
    const toenails=(hoof, faceZ)=>{
      for(const sx of [-1,0,1]) blob(hoof.x+sx*0.045, hoof.y+0.01, hoof.z+faceZ*0.05, 0.024,0.018,0.020, P.hoofDk, 5, 3);
    };
    /* front pair — near-plumb columns under the chest/hump, driving weight forward */
    toenails(legCol(-0.24, 0.24, -0.26, 0.34, 0.185, 0.115, 0.0), 1);
    toenails(legCol( 0.24, 0.20,  0.26, 0.30, 0.185, 0.115, 0.02), 1);

    /* rear DRIVING leg — planted, angular stifle/hock zigzag, high tucked stifle */
    {
      const H = V(-0.22, S.rump.y-0.10, -0.56);
      const stifle = V(-0.22*1.02, S.rump.y-0.30, -0.44);   // stifle forward, high
      const hock   = V(-0.24, 0.20, -0.52);
      const hoof   = V(-0.24, 0.04, -0.48);
      tube(H, stifle, 0.20, 0.115, 11, P.hide);
      tube(stifle, hock, 0.115, 0.075, 10, P.hideDk);
      tube(hock, hoof, 0.075, 0.088, 8, P.hide, {capB:{hex:P.hoofDk, lift:0.01}});
      toenails(hoof, 1);
    }
    /* rear EXTENDED leg — full and straight out behind, off the ground: the gallop signature.
       Splayed well out to the near +x side (not colinear with the spine) so its silhouette
       clears the torso mass from the render camera instead of hiding directly behind the rump
       — the same clearance trick the warhorse rig uses for its striking front legs. */
    {
      const H = V(0.30, S.rump.y-0.04, -0.58);
      const mid  = V(0.44, S.rump.y-0.16, -0.90);
      const foot = V(0.54, S.rump.y-0.26, -1.20);
      tube(H, mid, 0.195, 0.110, 11, P.hide);
      tube(mid, foot, 0.110, 0.060, 8, P.hideDk, {capB:{hex:P.hoofDk, lift:0.01}});
      toenails(foot, -1);
    }
  }

  /* ---------- TAIL — short, stiff, flagged out behind (motion cue, matches gallop). ---------- */
  {
    const t0 = V(0.0, S.rump.y+0.06, S.rump.z-0.14);
    const t1 = V(0.02, S.rump.y+0.00, S.rump.z-0.30);
    const tip= V(0.04, S.rump.y-0.10, S.rump.z-0.42);
    tube(t0, t1, 0.055, 0.036, 6, P.hideDk);
    tube(t1, tip, 0.036, 0.010, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
  }

  /* ---------- base disc — under the three grounded hooves only (front pair + the driving rear),
     the extended trailing rear leg floats clear, selling "mid-gallop." Huge: r=0.62, offset
     toward the driving/front footprint since the trailing leg reaches well past the rump. ---------- */
  {
    const cz = -0.05;
    const r1=ring(V(0,0.002,cz), V(0,1,0), 0.62, 0.62, 18);
    const r2=ring(V(0,0.050,cz), V(0,1,0), 0.60, 0.60, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,cz), P.discTop);
  }
}
