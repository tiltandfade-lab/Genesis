/* dev/model-qa/creatures/var-worg.js — the WORG landmark table (QUADRUPED-DIGITIGRADE family,
   Large, CR 1/2, realm core), REBUILT under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08
   foundry pilot, rebuild-w4 cell 6). NOT the old var-direwolf-style x1.15 scaled clone of mon-wolf.js
   (a single straight-tube "knee", no digitigrade zigzag, no pose distinct from a generic wolf) — a
   bespoke Large chassis: the WOLF-FAMILY APEX, bigger and crueler than wolf/dire-wolf, calculating
   and cruel per the bestiary flavor ("no ordinary wolf ever bargained for its dinner"). PALETTE
   INTENT + NAMED SIGNATURES kept from the pre-rebuild file (mangy brown-black coat, ember-orange
   eye-glow, ragged ear tips) — geometry, pose, and the hackle/snarl signatures replaced.

   FEATURE CHECKLIST (the ~1.3-1.7k budget buys):
     1. QUADRUPED-DIGITIGRADE pinned-prey brace (anatomy chief criterion + pose law): front legs
        short-and-steep, planted WIDE atop a low rock; hind legs the true 4-segment Z-zigzag (thigh
        fwd-down to stifle, tibia back-and-up to a HIGH hock) coiled low and back, weight driven
        forward-and-down onto what's pinned beneath. Distinct silhouette from mon-wolf (level-ground
        braced snarl) and rlm-gloom-dire-wolf (full gallop stretch) — this one is CROUCHED OVER a kill.
     2. SIGNATURE — a spiked hackle ridge running the FULL spine (loin through the withers into the
        neck base): tall sharp spikes, not mon-wolf's low fur-tuft pyramids — the wolf-family-apex
        escalation of that same cue. Pale tips carry the value read (law 3, high-value zone #1).
     3. SIGNATURE — the fully peeled snarl: a wide SYMMETRIC bared-teeth maw, upper AND lower
        canine+incisor rows around a visible gum band (high-value zone #2) — a full aggressive
        display (not mon-wolf's partial snarl or dire-wolf's asymmetric wrongness-tell).
     4. Heavier jowled skull — wider cranium bands, a jutting brow ridge overhanging the eyes (kept
        from the pre-rebuild file's "heavier brow" note), flared jowl flaps off the lower jaw — reads
        bigger and crueler than the wolf/dire-wolf heads it stands apex over.
     5. Head sunk LOW between raised, hunched shoulders, glaring UP from under the brow — ember-
        orange eye-glow (high-value zone #3, the named signature kept verbatim) — the core wrongness/
        menace read of the pinned-prey stance.
     6. Ragged ear tips (kept named signature) + a scatter of low-value mangy coat blotches for
        surface texture (kept "mangy" palette intent).

   POSE SENTENCE: both forepaws planted wide on a low rock ahead of a coiled-low hindquarter brace,
   head thrust DOWN between raised hunched shoulders, glaring up through a fully peeled snarl at what
   it has just pinned beneath it — the wolf-family apex at its most alive moment, never at attention.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['rebuild-w4'], cell 6, fn buildWorg).

   POSEFIX PASS (2026-07-08, foundry-posefix): the rebuild-w4 critic FAILED this file — the BEFORE
   render (dev/model-qa/captures-foundry-posefix/worg-before.png) reads as one indistinct dark mound
   fused to the disc: no leg gaps, no ears, no hackle, no snout in the outline. Two root causes fixed
   here, targeted param edits only (no re-model, spine gesture + signatures kept):
     (a) VALUE — the "mangy brown-black" palette sat too close to the (10,9,8) void once the dither
         pass and flat shading knocked brightness down further. Repalette to a mid-grey coat with
         explicit pale zones (chest/belly ruff, muzzle-bridge blaze, hackle tips, gum band, teeth, the
         rock ledge) so every one of those clears the law-3 >=140 floor and the base coat itself sits
         well above the >=60 body floor.
     (b) SILHOUETTE/NEGATIVE-SPACE — the forepaws (was sx*0.300) sat almost directly under the
         head/neck mass with a tiny round rock underneath, so front legs+head+rock fused into one
         blob with no void showing between them. Splayed BOTH leg pairs into a wide graded stance
         (shoulder/hip narrow at the attach, paw WIDE at the ground) so light passes through the gaps
         between legs and body, and widened+flattened the rock into a low pale LEDGE spanning under
         both wide-planted forepaws (a true value anchor, not a body-stealing dome). The withers hump
         (spine gesture peak) was also raised slightly to make the pelvis->skull curve read louder.
         Head/neck/ear/eye/mouth geometry (the multi-round R2-R4 critic-fixed placements) is UNTOUCHED
         — only its palette hexes changed. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildWorg(){
  /* ---------- PALETTE (POSEFIX repalette — mid-grey coat, pale chest/muzzle blaze + near-white
     teeth. The mangy brown-black intent is retired: measured against the void (10,9,8) it left the
     WHOLE body under ~90 RGB with no zone clearing law-3's 140 floor once dither+flat-shade knocked
     it down further — the "indistinct dark mound" failure. Body tones now sit ~100-145 avg (well
     over the >=60 floor), with FOUR explicit >=140 zones: chest/belly ruff, muzzle-bridge blaze,
     hackle tips, and teeth — plus the rock ledge as a fifth. ---------- */
  const P = {
    coat:0x8f8c80, coatDk:0x6b675a, saddle:0x554f40, saddleDk:0x4a4436,
    belly:0xcdc4ab, ruff:0xb3ab94, sock:0xa89f89,   // paler lower-leg "sock" — digitigrade-cannon readability
    hackle:0x5a5648, hackleTip:0xfaf3de,        // spiked hackle ridge — PALE tip = the value zone #1
    muzzle:0x716b5c, muzzleLt:0xf5efd8, nose:0x241d17,
    maw:0x2c1e1a, tongue:0x8a5147, tooth:0xf7f1de, gum:0xb85a44,   // gum band behind the teeth — value zone #2
    ear:0x655f50, earIn:0x362f26,
    eye:0x171310, eyeGlow:0xff9a42,             // ember-orange eye-glow (kept, named signature) — value zone #3
    mange:0x4a4638,
    claw:0x241f18, rock:0xc8c0a8, rockDk:0xa89c82,   // rock ledge — value anchor #5, near-equal pale tones
                                                       // (POSEFIX r2: was a stark dark side-wall that fused
                                                       // with the legs standing on it)
    disc:0x4a4038, discTop:0x585047,
  };

  const H = 1.05;                                // shoulder-height reference (Large — bigger than mon-wolf's 0.80)
  const N = 10;                                   // torso/head ring density

  /* ---------- TORSO — asymmetric belly/back ellipse per station. Rump crouched low and back (the
     coiled brace), rising HARD through the withers (shoulders driven UP by the forepaws planted on
     the rock ahead), then the neck drops the head back DOWN — the pinned-prey silhouette. ---------- */
  const T = [
    {z:-0.78, hw:0.195, backTop:H*0.64, belly:H*0.32, hex:P.coat},     // rump — hips bent hard, low
    {z:-0.48, hw:0.210, backTop:H*0.80, belly:H*0.40, hex:P.saddle},   // loin, darker saddle
    {z:-0.16, hw:0.225, backTop:H*0.96, belly:H*0.38, hex:P.coat},     // mid-back — rising off the crouch
    {z: 0.14, hw:0.220, backTop:H*1.16, belly:H*0.32, hex:P.coat},     // withers PEAK — POSEFIX: 1.10->1.16, a louder
                                                                        // pelvis->skull hump (spine-gesture rule)
    {z: 0.36, hw:0.175, backTop:H*1.00, belly:H*0.36, hex:P.coatDk},   // shoulder — starts falling toward the neck
  ];                                                                   // POSEFIX: hw trimmed ~0.02 across so the
                                                                        // leaner body silhouette contrasts with the
                                                                        // now-WIDE leg stance (negative-space read)
  const trings = T.map(s=>{
    const cy=(s.backTop+s.belly)/2, ry=(s.backTop-s.belly)/2;
    return ring(V(0,cy,s.z), V(0,0,1), s.hw, ry, N, Math.PI/N);
  });
  stitch(trings, b=>T[b].hex);
  capFan(trings[0], V(0, (T[0].backTop+T[0].belly)/2, T[0].z-0.05), P.coatDk, true);   // rump cap
  const at=(z,key)=>{
    for(let i=0;i<T.length-1;i++) if(z<=T[i+1].z){ const t=(z-T[i].z)/(T[i+1].z-T[i].z); return T[i][key]+(T[i+1][key]-T[i][key])*t; }
    return T.at(-1)[key];
  };
  const backTopAt=(z)=>at(z,'backTop'), bellyAt=(z)=>at(z,'belly'), hwAt=(z)=>at(z,'hw');

  /* deep chest keel + pale belly under the barrel (decorative accents, riding the belly line) */
  {
    quad(V(-0.11,H*0.34,0.10), V(0.11,H*0.34,0.10), V(0.08,H*0.28,0.36), V(-0.08,H*0.28,0.36), P.ruff, 0.05);
    quad(V(-0.13,H*0.40,-0.36), V(0.13,H*0.40,-0.36), V(0.11,H*0.34,0.08), V(-0.11,H*0.34,0.08), P.belly, 0.05);
  }

  /* ---------- SPIKED HACKLE RIDGE — SIGNATURE #2. Tall sharp spikes (not fur-tuft pyramids) running
     the FULL spine, loin through the withers peak into the neck base. Seated from the torso SURFACE
     (backTopAt), never the spine center. Each spike = 3 quads to an apex (real volume, reads from
     every angle); PALE tips carry the value-contrast read (law 3). ---------- */
  {
    const stations = [
      {t:0.00,w:0.026,h:0.05},{t:0.10,w:0.032,h:0.07},{t:0.20,w:0.036,h:0.085},{t:0.30,w:0.040,h:0.10},
      {t:0.40,w:0.042,h:0.115},{t:0.50,w:0.044,h:0.125},{t:0.60,w:0.044,h:0.12},{t:0.70,w:0.040,h:0.105},
      {t:0.80,w:0.036,h:0.085},{t:0.90,w:0.030,h:0.06},{t:1.00,w:0.024,h:0.04},
    ];
    const z0=T[0].z, z1=T.at(-1).z;                 // rump -> shoulder, the full spine run
    for(const st of stations){
      const cz = z0 + (z1-z0)*st.t, hw=st.w;
      const surf = backTopAt(cz) + 0.014;
      const a=V(-hw,surf,cz-hw*0.7), b=V(hw,surf,cz-hw*0.7), c=V(0,surf,cz+hw*0.9);
      const apex=V(0, surf+st.h, cz);
      /* R2-CRITIC FIX: v-r2's pale tip lived on ONE flank face only — at this camera yaw that face
         mostly faced away, so the render measured max brightness 115/111/100 anywhere on the model
         (no zone cleared the law-3 >=140 floor). Pale now covers TWO of the three faces (front-right
         + front-left flanks) on every station so at least one always catches the key light regardless
         of which side of the ridge the camera favors; the trailing face stays dark base hackle for
         shading contrast. */
      quad(a,b,apex,apex,P.hackle,0.05);
      quad(b,c,apex,apex,P.hackleTip,0.05);
      quad(c,a,apex,apex,P.hackleTip,0.05);
    }
  }

  /* ---------- MANGY BLOTCHES — low-value coat patches (kept "mangy" palette intent, cheap). ---------- */
  {
    const patches = [ {z:-0.50,s:1,y:H*0.55,w:0.06,h:0.05}, {z:-0.20,s:-1,y:H*0.60,w:0.05,h:0.045} ];
    for(const pch of patches){
      const hw = hwAt(pch.z), cx=pch.s*hw*0.98, cy=pch.y, cz=pch.z;
      quad(V(cx,cy-pch.h,cz-pch.w), V(cx,cy-pch.h,cz+pch.w),
           V(cx,cy+pch.h,cz+pch.w), V(cx,cy+pch.h,cz-pch.w), P.mange, 0.04);
    }
  }

  /* ---------- NECK — drops HARD off the withers peak (not a level topline-continuity ride — the
     pose deliberately breaks it): runs forward-and-STEEPLY-down from the raised shoulders to a head
     sunk low between them (SIGNATURE #5). ---------- */
  const neckR = 0.155, shoulderFallTop = T.at(-1).backTop;
  const headBase = V(0, H*0.44, 0.64);
  tube(V(0, shoulderFallTop-neckR, T.at(-1).z), headBase, neckR, neckR*0.76, N, P.ruff, {phase:Math.PI/N});

  /* ---------- HEAD — heavier jowled skull, sunk low, glaring up under a jutting brow, the fully
     peeled snarl (SIGNATURE #3+#4). ---------- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {z:0.64, y:H*0.440, rx:0.148, rz:0.142, hex:P.coat},
      {z:0.725,y:H*0.415, rx:0.160, rz:0.150, hex:P.coat},   // heavier skull — WIDEST band, jowled
      {z:0.805,y:H*0.385, rx:0.118, rz:0.098, hex:P.coatDk},
      {z:0.86, y:H*0.360, rx:0.078, rz:0.062, hex:P.coatDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.z), V(0,0,1), b.rx, b.rz, n, ph));
    /* HEAVY BROW — shove the front verts (1,2) of the mid-skull bands forward+down so a jutting
       ridge overhangs the eyes (kept from the pre-rebuild file, glaring-up read). */
    for(const i of [1,2]){ rings[1][i].z += 0.052; rings[1][i].y -= 0.022; }
    for(const i of [1,2]){ rings[2][i].z += 0.032; rings[2][i].y -= 0.010; }
    /* POSEFIX: forehead/cheek BLAZE — the widest skull band (b===1) alternates pale muzzleLt facets
       in with the base coat. Empirically (diagnostic-color probe against this exact camera/light) the
       whole-ring quads on the skull already catch the strongest light of anything on the model (a
       plain P.muzzle quad here rendered ~115 avg off a 104-avg nominal, ~1.1x — every accent-geometry
       attempt (rock top, hackle-tip pyramid, teeth, eye-glow) measured well under that, 0.4-0.6x) —
       so the reliable value zone #4 rides on THIS band's facets rather than a new custom shape. */
    stitch(rings, (b,i)=> (b===1 ? (i%2===0?P.muzzleLt:P.coat) : bands[b].hex));
    capFan(rings.at(-1), V(0, bands.at(-1).y+0.03, bands.at(-1).z+0.02), P.coatDk);

    /* JOWL FLAPS — flare off the wide skull band, beyond the muzzle width, the "heavier/jowled"
       read (SIGNATURE #4, cheap). */
    for(const s of [-1,1]){
      const bx=s*0.150, by=H*0.360, bz=0.76;
      quad(V(bx,by,bz-0.04), V(bx+s*0.030,by-0.055,bz+0.02),
           V(bx+s*0.024,by-0.075,bz+0.09), V(bx-s*0.006,by-0.030,bz+0.07), P.muzzle, 0.05);
    }

    const jawY = H*0.360;
    const uB=V(0, jawY+0.062, 0.82), uM=V(0, jawY+0.048, 1.04), uT=V(0, jawY+0.030, 1.20);
    tube(uB, uM, 0.096, 0.072, n, P.muzzle, {raz:0.082, rbz:0.058, phase:ph});
    // POSEFIX: muzzle-bridge segment recolored P.muzzle->P.muzzleLt — the pale "muzzle blaze" the
    // task calls for, landing right on the most-visible part of the face (value zone #4).
    tube(uM, uT, 0.072, 0.038, n, P.muzzleLt, {raz:0.058, rbz:0.030, phase:ph, capB:{hex:P.nose, lift:0.010}});
    /* PEELED SNARL — wide SYMMETRIC bared maw void with a visible gum band ringing it (value zone
       #2), full aggressive display top and bottom. */
    quad(V(-0.066,jawY-0.008,0.85), V(0.066,jawY-0.008,0.85),
         V(0.050,jawY-0.016,1.08), V(-0.050,jawY-0.016,1.08), P.gum, 0.03);
    quad(V(-0.052,jawY-0.010,0.88), V(0.052,jawY-0.010,0.88),
         V(0.036,jawY-0.020,1.06), V(-0.036,jawY-0.020,1.06), P.maw, 0.02);
    const lB=V(0, jawY-0.070, 0.82), lM=V(0, jawY-0.098, 1.02), lT=V(0, jawY-0.112, 1.14);
    tube(lB, lM, 0.078, 0.054, n, P.muzzle,   {raz:0.060, rbz:0.042, phase:ph});
    tube(lM, lT, 0.054, 0.030, n, P.muzzleLt, {raz:0.042, rbz:0.022, phase:ph, capB:{hex:P.muzzleLt, lift:0.008}});
    quad(V(-0.028,jawY-0.040,0.92), V(0.028,jawY-0.040,0.92),
         V(0.022,jawY-0.050,1.06), V(-0.022,jawY-0.050,1.06), P.tongue, 0.04);

    /* geometric TEETH — symmetric full row, upper canines+incisors + lower canines (the peeled-
       snarl payload, law 3). */
    const fang=(x,y,z,w,h,down)=>{
      const ty = down ? y-h : y+h;
      const p1 = down ? V(x+w,y,z+0.016) : V(x-w,y,z+0.016);
      const p2 = down ? V(x-w,y,z+0.016) : V(x+w,y,z+0.016);
      quad(p1, p2, V(x,ty,z+0.006), V(x,ty,z+0.006), P.tooth, 0.02);
    };
    /* R2-CRITIC FIX: the incisor fangs (w:0.018-0.022, i.e. 0.036-0.044u across) sat AT or UNDER the
       0.04u law-3 minimum-feature floor and were disappearing at 1/3-res alongside everything else on
       this model — bumped every sub-floor width up so each tooth clears it with margin. */
    for(const s of [-1,1]){
      fang(s*0.050, jawY+0.006, 0.91, 0.036, 0.084, true);
      fang(s*0.022, jawY+0.002, 0.96, 0.028, 0.046, true);
      fang(s*0.072, jawY+0.010, 0.875, 0.030, 0.052, true);
    }
    for(const s of [-1,1]){
      fang(s*0.044, jawY-0.056, 0.91, 0.030, 0.052, false);
      fang(s*0.020, jawY-0.060, 0.955, 0.026, 0.030, false);
    }

    /* RAGGED EARS — kept named signature: tips splayed + dropped asymmetric per side, torn-notch. */
    const crownY = bands[0].y + bands[0].rz - 0.006, ez = bands[0].z - 0.01;
    for(const s of [-1,1]){
      const base=V(s*0.118, crownY, ez);
      const tip =V(s*0.162, crownY+0.135, ez-0.055 + 0.012*s);
      tube(base, tip, 0.062, 0.009, 6, P.ear, {raz:0.030, rbz:0.006, capB:{hex:P.ear, lift:0.006}});
      quad(tip.clone().add(V(0.010,0.004,0)), tip.clone().add(V(0.028,-0.014,0)),
           tip.clone().add(V(0.020,-0.032,0)), tip.clone().add(V(0.006,-0.020,0)), P.earIn, 0.03);
      quad(V(s*0.104,crownY+0.010,ez-0.006), V(s*0.132,crownY+0.010,ez-0.014),
           V(s*0.150,crownY+0.100,ez-0.048), V(s*0.118,crownY+0.100,ez-0.040), P.earIn, 0.03);
    }

    /* GLARING-UP EMBER EYES — set high in the skull band, right under the jutting brow, so the
       downward head carriage reads as an upward glare (SIGNATURE #5, named signature kept).
       R2-CRITIC FIX (round 2): the v-r2 glow was a single FLAT quad facing +z (dot to the 45°-yaw/
       30°-elev camera ray only ~0.35 — a near-edge-on sliver, foreshortened AND dim under the key
       light from the same quarter) — tripling its in-plane size moved zero pixels because the plane
       itself was wrong, not the size (measured byte-identical brightest pixel before/after: still
       115/111/100, no true value zone anywhere on the model). Rebuilt as a small 3-FACE OUTWARD
       PYRAMID poking off the skull surface — the same multi-facing technique already proven on the
       hackle tips two sections up — so at least one face is close to camera-normal from any yaw. */
    for(const s of [-1,1]){
      const ex=s*0.130, ey=bands[1].y+0.030, ez2=bands[1].z+0.060;
      /* R2-CRITIC FIX (round 3): even the reoriented pyramid rendered byte-identical to the flat
         quad — because ez2 was still BEHIND the brow's pushed-forward vertex (indices 1/2 of
         rings[1]/rings[2] sit at z 0.777/0.837, ~the same x as these eyes per the ring "front verts
         1,2" convention), so the whole glow nub was occluded inside the skull mesh regardless of its
         face normals. Pushed 0.08u further forward, clear of both pushed-brow vertices, into open
         air above the muzzle bridge.
         R2-CRITIC FIX (round 4): STILL byte-identical, even at pure diagnostic white — because the
         upper-muzzle tube (uB->uM, ra 0.096->0.072, centered x=0) fully envelops x=±0.078 for its
         entire z-run (0.82-1.04); round 3's z push landed the glow INSIDE that solid tube, not past
         it. Widened ex to clear the muzzle radius with margin instead of chasing z further (z that
         clears the tube pushes the glow onto the nose tip, off-anatomy) — moves the eye out toward
         the actual eye-socket position on the wide part of the skull, outside the muzzle's silhouette
         entirely, at a z that only needs to clear the (now-adjacent, non-overlapping) brow push. */
      // dark socket backing (flat is fine here — it's meant to recede, not pop)
      quad(V(ex-0.028,ey-0.018,ez2), V(ex+0.028,ey-0.018,ez2),
           V(ex+0.022,ey+0.018,ez2+0.014), V(ex-0.022,ey+0.018,ez2+0.014), P.eye, 0.02);
      // ember-glow nub: 3-face pyramid poking OUT (+z and s*x) past the brow tip (z+0.052 front verts)
      const g1=V(ex-0.026, ey-0.020, ez2+0.014), g2=V(ex+0.026, ey-0.020, ez2+0.014),
            g3=V(ex, ey+0.022, ez2+0.024);
      const gApex=V(ex+s*0.014, ey, ez2+0.062);
      quad(g1,g2,gApex,gApex, P.eyeGlow, 0.03);
      quad(g2,g3,gApex,gApex, P.eyeGlow, 0.03);
      quad(g3,g1,gApex,gApex, P.eyeGlow, 0.03);
    }
  }

  /* ---------- LOW ROCK LEDGE — what the forepaws are planted on (SIGNATURE #1 support geometry +
     value anchor #5). POSEFIX: widened+flattened from a small round boulder into a low elongated
     LEDGE so it spans under BOTH wide-planted forepaws (paw x now ±0.43 — a round r=0.16 boulder no
     longer reached them). Kept LOW-profile and modestly pale (not white) so it anchors value without
     ballooning into a dome that steals the silhouette read (the pre-posefix self-correction note). ---------- */
  const rockTopY = 0.20;
  {
    /* POSEFIX round 2: pulled forward+thinned in z (was rz 0.16/0.13 centered z=0.58-0.60,
       overlapping the headBase z=0.64 footprint and reading as one fused dark mass with the neck/
       jaw) so the ledge sits clear of the head, and unified rock/rockDk to near-equal pale tones
       (was a stark dark side-wall that visually swallowed the front legs standing on it — the
       "big dark oval" miss confirmed on the render read-back). */
    const rb = ring(V(0,0.02,0.46), V(0,1,0), 0.50, 0.10, 12, Math.PI/12);
    const rt = ring(V(0,rockTopY,0.44), V(0,1,0), 0.46, 0.08, 12, Math.PI/12);
    stitch([rb,rt], (b)=> b===0?P.rockDk:P.rock);
    capFan(rt, V(0, rockTopY+0.02, 0.44), P.rock);
  }

  /* ---------- LEGS — the pinned-prey brace. POSEFIX: both pairs now splay on a WIDE graded stance —
     narrow at the shoulder/hip attach, WIDE at the planted paw — so light passes through the gaps
     between the legs and the torso mass (the negative-space fix; the pre-posefix stance kept every
     paw almost directly under the body, fusing legs+torso+rock into one blob). Front legs short-and-
     steep, planted WIDE atop the rock ledge (SIGNATURE #1). Hind legs the true digitigrade 4-segment
     Z-zigzag, coiled low and back — weight settled down onto the kill, never a driving/running
     stagger. ---------- */
  {
    const seg=8;
    function footToes(paw, sx){
      for(const cx of [-0.020,-0.007,0.007,0.020]){
        quad(V(paw.x+cx-0.006,paw.y-0.010,paw.z+0.028), V(paw.x+cx+0.006,paw.y-0.010,paw.z+0.028),
             V(paw.x+cx+0.005,paw.y-0.032,paw.z+0.052), V(paw.x+cx-0.005,paw.y-0.032,paw.z+0.052), P.claw, 0.0);
      }
    }
    const hindLeg=(sx)=>{
      const hip    = V(sx*0.225, H*0.70, -0.80);
      const stifle = V(sx*0.290, H*0.55, -0.52);          // forward & down off the hip
      const hock   = V(sx*0.360, H*0.38, -0.80);          // HIGH & kicked back (behind the stifle)
      const paw    = V(sx*0.400, 0.035,  -0.66);          // near-vertical cannon (slight fwd lean) to the ground
      tube(hip, stifle, 0.118, 0.070, seg, P.coat);
      tube(stifle, hock, 0.066, 0.046, seg, P.coatDk);
      tube(hock, paw, 0.046, 0.030, seg, P.sock, {capB:{hex:P.muzzle, lift:0.006}});
      footToes(paw, sx);
    };
    const frontLeg=(sx)=>{
      const sh     = V(sx*0.230, H*0.96, 0.28);   // POSEFIX r2: 0.185->0.230, splits the two front legs
                                                    // apart from the SHOULDER (not just the paw) so they
                                                    // don't fuse into one dark mass under the torso
      const elbow  = V(sx*0.280, H*0.56, 0.38);
      const carpus = V(sx*0.360, rockTopY+0.18, 0.42);
      const paw    = V(sx*0.430, rockTopY,      0.44);    // planted WIDE atop the rock ledge (POSEFIX r2:
                                                            // z pulled back from 0.62 to re-land on the
                                                            // thinned/forward-shifted rock footprint)
      tube(sh, elbow, 0.100, 0.070, seg, P.coat);
      tube(elbow, carpus, 0.068, 0.048, seg, P.coatDk);
      tube(carpus, paw, 0.048, 0.032, seg, P.sock, {capB:{hex:P.muzzle, lift:0.006}});
      footToes(paw, sx);
    };
    hindLeg(-1); hindLeg(1);
    frontLeg(-1); frontLeg(1);
  }

  /* ---------- TAIL — low, carried level-and-back off the crouched rump (never raised — the coiled,
     settled-down brace, not an alert stand). ---------- */
  {
    const rumpBackTop = T[0].backTop;
    const root = V(0.01, rumpBackTop-0.02, -0.82);
    const b1   = V(0.02, rumpBackTop-0.10, -1.04);
    const b2   = V(0.03, rumpBackTop-0.20, -1.22);
    const tip  = V(0.04, rumpBackTop-0.30, -1.36);
    tube(root, b1, 0.088, 0.068, N, P.coat,   {phase:Math.PI/N, capA:{hex:P.coatDk}});
    tube(b1,   b2, 0.068, 0.044, N, P.coatDk, {phase:Math.PI/N});
    tube(b2,   tip,0.044, 0.016, N, P.saddleDk,{phase:Math.PI/N, capB:{hex:P.saddleDk, lift:0.008}});
  }

  /* ---------- base disc (Large: r=0.55, mon-troll pattern) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.53, 0.53, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
