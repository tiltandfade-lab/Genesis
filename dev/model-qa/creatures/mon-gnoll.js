/* dev/model-qa/creatures/mon-gnoll.js — the GNOLL landmark table (hyena-man biped, Medium).
   REBUILD (rebuild-w4, cell 4) — pose replaced under MODEL-FOUNDRY law 5; palette + named
   signature (spotted mane crest) carried over from the prior pass; geometry rebuilt around the
   loping-snap moment and a low-carried spear.

   FEATURE CHECKLIST (the tri budget buys):
   1. Sloped hyena BACK LINE — shoulders driven high, hips driven low (steeper than a human
      slouch): the family tell, ANATOMY-CANON HUMANOID-HYENA.
   2. Spotted dark MANE CREST down the nape — the loud signature, high enough value to read
      against the void.
   3. Muzzle + open jaw with pale fangs, turned SIDEWAYS off the spine axis — the bite-at-nothing.
   4. Tall rounded ears, one leading one trailing (falls out of the head yaw for free).
   5. Asymmetric loping legs — one planted forward, one trailing high behind — the mid-stride catch.
   6. A crude flint-headed spear carried LOW in the trailing-side fist, point leveled forward.

   POSE SENTENCE: caught mid-lope — weight driving off the trailing (right) leg, the left leg
   reaching forward to plant, spear held low and forward in the right fist, head snapped hard to
   the left off the spine to snarl-bite at something beside it that isn't there.

   Whole-object grammar: one function, one geometry frame, no anchors. Spear authored FIRST so the
   gripping fist derives from the haft, same as the axe was before. Imported by mon-gnoll-probe.html
   + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGnoll(){
  /* ---------- PALETTE (VS desaturated; matted tan-yellow hyena hide + dark mane/spots) —
     carried over from the prior pass, unchanged. bone/stone slots now dress the spear instead
     of the axe. ---------- */
  const P = {
    hide:0xa7935e, hideDk:0x83714a, hideLt:0xc0ad78,       // matted tan-yellow coat
    belly:0x9c8f6e, throat:0xb2a37a,                        // paler chest/throat
    mane:0x4a3f2c, maneDk:0x352d1f, maneHi:0xe9dcac,        // dark spotted mane ridge + a near-white lit crest tip (the value-contrast zone, calibrated off the bugbear spikeLt precedent)
    spot:0x59492f, spotDk:0x40341f,                         // dark hide spots
    muzzle:0x8f7d52, muzzleLt:0xa89468, nose:0x241d18,
    maw:0x38231f, tongue:0x8f524c, tooth:0xe2d9c4,
    ear:0x83714a, earIn:0x40341f,
    eye:0x171210, eyeGlow:0xc59a3e,                          // yellow predator eye
    wood:0xcabf9e, woodDk:0x9a8f70, sinew:0x6e5a3c,          // spear haft + lashing
    flint:0x71685c, flintDk:0x4c453c,                        // crude flaked-stone spearhead
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — TALL lanky biped, ~1.65u. Steeper stoop than the prior pass: the
     shoulder-to-hip drop is exaggerated (0.58u vs the old 0.46u) to sell the sloped hyena back as
     the family tell even from silhouette alone. Head base is lifted/forward for the snap turn. */
  const L = {
    hipY:0.72, waistY:0.84, ribY:0.98, chestY:1.14, shldY:1.30,
    hipHalf:0.115, shoulderX:0.250,
    neckBz:0.06, neckz:0.22, neckY:1.38,
    headz:0.30, headBaseY:1.44,
  };

  /* head-yaw frame — the whole head assembly (cranium/muzzle/ears/teeth) is authored in a LOCAL
     forward-facing frame (dx sideways, dy vertical off headBaseY, dz forward off headz) and then
     rotated about the pivot by HEAD_YAW so the skull snaps to the left off the spine axis (the
     bite-at-nothing). Everything else (mane, neck) stays on-axis so the crest still reads as a
     straight dorsal line into the turned head. */
  const HEAD_YAW = -0.58;
  const hc = Math.cos(HEAD_YAW), hs = Math.sin(HEAD_YAW);
  const hp = (dx,dy,dz) => V(dx*hc - dz*hs, L.headBaseY + dy, L.headz + (dx*hs + dz*hc));

  /* ===== HELD WEAPON FIRST — a crude flint-headed spear, gripped one-handed in the RIGHT fist and
     carried LOW, leveled forward across the trailing hip (the loping-snap carry). The fist point is
     derived from the haft below. ===== */
  const SPEAR_BUTT = V(0.30, 0.66, -0.16);     // butt end, back near the trailing hip
  const SPEAR_TIP  = V(0.11, 0.42, 0.66);      // point, forward and low, leveled
  const SHAFT = new THREE.Vector3().subVectors(SPEAR_TIP, SPEAR_BUTT).normalize();
  const GRIP = SPEAR_BUTT.clone().lerp(SPEAR_TIP, 0.30);   // where the fist closes, back third
  {
    const headBase = SPEAR_BUTT.clone().lerp(SPEAR_TIP, 0.82);   // where the flint head is lashed on
    // haft — two segments, a faint taper toward the head
    tube(SPEAR_BUTT, GRIP, 0.024, 0.026, 6, P.wood, {capA:{hex:P.woodDk, lift:0.02}});
    tube(GRIP, headBase, 0.026, 0.020, 6, P.woodDk);
    tube(headBase, SPEAR_TIP.clone().addScaledVector(SHAFT,-0.10), 0.020, 0.014, 6, P.wood);
    // sinew lashing rings binding the flint head on
    for(const t of [0.80, 0.86]){
      const c = SPEAR_BUTT.clone().lerp(SPEAR_TIP, t);
      const r = ring(c, SHAFT, 0.030, 0.030, 6);
      const r2 = ring(c.clone().addScaledVector(SHAFT,0.018), SHAFT, 0.030, 0.030, 6);
      stitch([r,r2], ()=>P.sinew);
    }
    // crude flaked-stone spearhead — a flat leaf-shaped diamond blade, front+back slab faces so it
    // reads solid, not a flake. Point continues the shaft axis; the widest flare sits mid-blade.
    const bAxis = SHAFT.clone();
    const side = new THREE.Vector3().crossVectors(bAxis, V(0,1,0)).normalize();
    const up = new THREE.Vector3().crossVectors(side, bAxis).normalize();
    const flareC = SPEAR_TIP.clone().addScaledVector(bAxis,-0.09);
    const flareA = flareC.clone().addScaledVector(side, 0.055);
    const flareB = flareC.clone().addScaledVector(side,-0.055);
    const tipPt  = SPEAR_TIP.clone();
    const heelPt = SPEAR_TIP.clone().addScaledVector(bAxis,-0.155);
    const slab   = up.clone().multiplyScalar(0.020);   // slab thickness offset (gives the blade volume)
    // FRONT face (two tris: heel-flareA-tip, heel-tip-flareB)
    quad(heelPt, flareA, tipPt, tipPt, P.flint, 0.04);
    quad(heelPt, tipPt, flareB, flareB, P.flint, 0.04);
    // BACK face offset along the slab normal
    quad(heelPt.clone().add(slab), tipPt.clone().add(slab), flareA.clone().add(slab), flareA.clone().add(slab), P.flintDk, 0.04);
    quad(heelPt.clone().add(slab), flareB.clone().add(slab), tipPt.clone().add(slab), tipPt.clone().add(slab), P.flintDk, 0.04);
    // thin edge rim tying front to back along both cutting edges
    quad(heelPt, heelPt.clone().add(slab), flareA.clone().add(slab), flareA, P.flintDk, 0.02);
    quad(flareA, flareA.clone().add(slab), tipPt.clone().add(slab), tipPt, P.flintDk, 0.02);
    quad(tipPt, tipPt.clone().add(slab), flareB.clone().add(slab), flareB, P.flintDk, 0.02);
    quad(flareB, flareB.clone().add(slab), heelPt.clone().add(slab), heelPt, P.flintDk, 0.02);
  }

  /* ===== TRUNK — one lean loft, hips -> shoulders, with a forward-drive twist: the ribcage/chest
     bands are pushed forward (+z) relative to the hips so the whole trunk reads as leaning INTO
     the stride, not just stooped in place. ===== */
  stack([
    {y:L.hipY,   rx:0.164, rz:0.130, hex:P.hideDk},
    {y:L.waistY, rx:0.146, rz:0.116, hex:P.hide},
    {y:L.ribY,   rx:0.182, rz:0.148, hex:P.hide},
    {y:L.chestY, rx:0.214, rz:0.170, hex:P.hide},
    {y:L.shldY,  rx:0.228, rz:0.166, hex:P.hideDk},   // broad high shoulders
  ], 8, {});

  /* pale throat/belly strip down the front */
  quad(V(-0.09,L.hipY+0.02,0.128), V(0.09,L.hipY+0.02,0.128),
       V(0.10,L.chestY-0.02,0.166), V(-0.10,L.chestY-0.02,0.166), P.belly, 0.05);

  /* a scatter of dark hide SPOTS across the shoulders/haunches (the hyena dapple) */
  {
    const spot=(x,y,z,r,hex)=>{
      const rr=ring(V(x,y,z), V(0,0,1), r, r*0.8, 6);
      capFan(rr, V(x,y,z+0.004), hex);
    };
    spot(-0.16,1.24,0.09,0.030,P.spot);  spot(0.15,1.20,0.12,0.026,P.spotDk);
    spot(0.19,1.28,0.02,0.024,P.spot);   spot(-0.19,1.15,-0.02,0.028,P.spotDk);
    spot(-0.11,0.92,0.10,0.026,P.spot);  spot(0.13,0.86,0.09,0.022,P.spotDk);
    spot(0.05,1.05,0.15,0.020,P.spot);   spot(-0.06,1.11,0.14,0.018,P.spotDk);
  }

  /* ===== NECK — thrusts FORWARD out of the high shoulders, then hands off to the yawed head. */
  {
    const nBase = V(0, L.shldY-0.02, L.neckBz+0.05);
    const nOut  = V(0, L.headBaseY-0.06, L.headz-0.10);   // reach up toward the head pivot
    tube(nBase, nOut, 0.098, 0.080, 8, P.hideDk, {phase:Math.PI/8});
    quad(V(-0.06,L.shldY-0.10,0.12), V(0.06,L.shldY-0.10,0.12),
         V(0.05,L.neckY-0.08,L.neckz+0.02), V(-0.05,L.neckY-0.08,L.neckz+0.02), P.throat, 0.05);
  }

  /* ===== HEAD — hyena skull with a forward muzzle parted on teeth, tall rounded ears, sloped low
     brow. Authored in the LOCAL forward-facing frame (dx,dy,dz) and placed via hp(), which yaws
     the whole assembly LEFT off the spine (the bite-at-nothing). ===== */
  {
    const n=8, ph=Math.PI/n;
    /* cranium loft: jaw -> cheek -> brow -> crown, small and sloped (hyena head is compact) */
    const bands=[
      {dy:-0.02, rx:0.088, rz:0.100, hex:P.hide},
      {dy: 0.03, rx:0.108, rz:0.112, hex:P.hide},
      {dy: 0.08, rx:0.106, rz:0.100, hex:P.hideDk},   // brow
      {dy: 0.13, rx:0.082, rz:0.078, hex:P.hideDk},   // crown
    ];
    /* ring axis is the loft direction (vertical, +y) — unaffected by the head yaw, which only
       rotates each ring's CENTER via hp(). */
    const rings=bands.map(b=>ring(hp(0,b.dy,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* crown cap is the top-facing surface (catches the overhead light even with the head yawed) —
       lit bright as the mane's value-contrast zone, since the nape tufts behind it sit in shadow. */
    capFan(rings[3], hp(0, 0.165, -0.006), P.maneHi);

    /* MUZZLE — a wedge projecting forward in the local frame, parted at the tip on a dark open
       mouth with tooth hints. Angled slightly down (nose leads low). */
    const jawDy = -0.03;
    // dark open mouth cavity first (behind the teeth)
    {
      const mb=hp(0, jawDy+0.01, 0.075), mm=hp(0, jawDy-0.015, 0.185);
      tube(mb, mm, 0.058, 0.044, n, P.maw, {raz:0.046, rbz:0.034, phase:ph, capB:{hex:P.maw, lift:0.006}});
      quad(hp(-0.024,jawDy-0.04,0.10), hp(0.024,jawDy-0.04,0.10),
           hp(0.020,jawDy-0.045,0.20), hp(-0.020,jawDy-0.045,0.20), P.tongue, 0.04);
    }
    // UPPER jaw wedge
    const uB=hp(0, jawDy+0.045, 0.06), uM=hp(0, jawDy+0.030, 0.205), uT=hp(0, jawDy+0.010, 0.30);
    tube(uB, uM, 0.086, 0.064, n, P.muzzle, {raz:0.062, rbz:0.046, phase:ph});
    tube(uM, uT, 0.064, 0.034, n, P.muzzle, {raz:0.046, rbz:0.024, phase:ph, capB:{hex:P.nose, lift:0.010}});
    // LOWER jaw wedge (dropped + angled down — the gape, snapping wide for the bite-at-nothing)
    const lB=hp(0, jawDy-0.065, 0.06), lM=hp(0, jawDy-0.120, 0.19), lT=hp(0, jawDy-0.150, 0.26);
    tube(lB, lM, 0.066, 0.046, n, P.muzzle, {raz:0.048, rbz:0.034, phase:ph});
    tube(lM, lT, 0.046, 0.024, n, P.muzzleLt, {raz:0.034, rbz:0.018, phase:ph, capB:{hex:P.muzzleLt, lift:0.008}});

    /* geometric TEETH — pale fangs on both jaw lines, wide-set for the snap */
    const fang=(dx,dy,dz,w,h,down)=>{
      const base=hp(dx,dy,dz);
      const tipPt=hp(dx, down?dy-h:dy+h, dz-0.002);
      quad(hp(dx-w,dy,dz+0.006), hp(dx+w,dy,dz+0.006), tipPt, tipPt, P.tooth, 0.02);
    };
    for(const s of [-1,1]){
      fang(s*0.044, jawDy+0.008, 0.11, 0.017, 0.058, true);   // upper canine
      fang(s*0.022, jawDy+0.006, 0.15, 0.011, 0.030, true);   // upper incisor
      fang(s*0.040, jawDy-0.055, 0.11, 0.014, 0.046, false);  // lower canine
    }
    /* TALL ROUNDED EARS — two upright wedges on the crown, rounded tips, set back a touch. The
       head yaw naturally staggers them (leading/trailing) — no extra asymmetry needed. */
    for(const s of [-1,1]){
      const base=hp(s*0.072, 0.14, -0.02);
      const tip =hp(s*0.100, 0.30, -0.05);
      tube(base, tip, 0.058, 0.030, 6, P.ear, {raz:0.040, rbz:0.024, capB:{hex:P.ear, lift:0.010}});
      quad(hp(s*0.056,0.155,-0.005), hp(s*0.088,0.155,-0.012),
           hp(s*0.096,0.285,-0.045), hp(s*0.070,0.285,-0.038), P.earIn, 0.03);
    }
  }

  /* ===== MANE — the dark spotted ridge of tufts running from behind the crown down the back of
     the neck to the shoulders. Stays ON the spine axis (not yawed) so it reads as a straight
     dorsal crest feeding INTO the twisted head — this is the loud signature + the value-contrast
     zone (mane/spot palette sits well above the void floor).
     CRITIC FIX (pass-2, r5->r6): the nape tuft (old pts[1]) sat almost exactly at the neck tube's
     tip (same y/z as nOut) and leaned -z (backward, away from BOTH the key light at (5,9,7) and
     the camera) with a tip radius (0.020) right at the 0.04u floor — sampled render pixels there
     came back AT OR BELOW the void (10,9,8), i.e. the loud signature didn't exist on screen
     (law 3). Pulled every tuft root clear of the neck/shoulder trunk radii, dropped the backward
     lean to near-zero so the bright caps face up into the key light instead of into shadow, and
     grew the signature tuft's radii well past the feature floor. ===== */
  {
    const pts = [
      V(0, L.headBaseY+0.15, L.headz-0.16),   // picks up just behind the (now-turned) crown
      V(0, L.neckY-0.06,     L.neckz-0.17),   // clear of the neck tube's back surface, not coincident with its tip
      V(0, L.shldY+0.10,     -0.20),          // clear of the shoulder trunk's rz=0.166 back radius
      V(0, L.shldY+0.02,     -0.24),
    ];
    const tuftH = [0.12, 0.20, 0.13, 0.09];
    for(let i=0;i<pts.length;i++){
      const b=pts[i];
      const top=b.clone().add(V(0, tuftH[i], -0.005));   // near-vertical lean so the cap faces up into the key light
      const baseR = i===1?0.066:0.048, tipR = i===1?0.032:0.020;
      /* the tallest crest tuft (i===1, at the nape) catches the light — colored bright along its
         WHOLE shaft (not just the tip cap, which is too small on its own to survive 1/3-res per
         law 3) so the signature actually carries the model's high-value zone, not just a dark
         silhouette bump. */
      tube(b, top, baseR, tipR, 5, i===1?P.maneHi:(i%2?P.maneDk:P.mane), {capB:{hex:i===1?P.maneHi:P.maneDk, lift:0.008}});
      for(const s of [-1,1]){
        const sb=b.clone().add(V(s*0.034,0,0.005));
        const st=sb.clone().add(V(s*0.024, tuftH[i]*0.72, -0.01));
        tube(sb, st, i===1?0.038:0.030, i===1?0.018:0.014, 4, i===1?P.maneHi:P.maneDk, {capB:{hex:i===1?P.maneHi:P.maneDk, lift:0.006}});
      }
    }
    for(let i=0;i<pts.length-1;i++){
      const a=pts[i], b=pts[i+1];
      tube(a, b, 0.038, 0.038, 6, P.maneDk);
    }
  }

  /* ===== ARMS — long and lanky. RIGHT hand grips the spear low and forward (derived from GRIP);
     LEFT swings back and up, echoing the running counter-motion (opposite the forward left leg). */
  {
    // RIGHT arm to the spear grip
    const S=V(L.shoulderX, L.shldY-0.03, 0.02);
    const E=V(0.30, 0.92, 0.20);                   // elbow driven forward-down toward the low carry
    const W=GRIP.clone().add(V(0.0,0.05,-0.02));
    tube(S,E,0.078,0.060,6,P.hide);
    tube(E,W,0.058,0.046,6,P.hideDk);
    tube(GRIP.clone().addScaledVector(SHAFT,-0.055), GRIP.clone().addScaledVector(SHAFT,0.055),
         0.050,0.046,6,P.hideLt, {capA:{hex:P.hideLt}, capB:{hex:P.hideLt}});

    // LEFT arm swinging back and up (counter to the forward left leg — the running catch)
    const S2=V(-L.shoulderX, L.shldY-0.03, 0.02);
    const E2=V(-0.32, 1.02, -0.14);
    const W2=V(-0.27, 0.88, -0.30);
    tube(S2,E2,0.078,0.060,6,P.hide);
    tube(E2,W2,0.058,0.046,6,P.hideDk);
    tube(W2, W2.clone().add(V(-0.02,-0.05,-0.05)), 0.048,0.040,6,P.hideLt, {capB:{hex:P.hideLt}});
    const HW=W2.clone().add(V(-0.02,-0.06,-0.06));
    for(const dx of [-0.03,-0.01,0.015,0.035]){
      tube(HW, HW.clone().add(V(dx,-0.05,-0.04)), 0.014,0.008,4,P.hideLt,{capB:{hex:P.nose}});
    }
  }

  /* ===== LEGS — DIGITIGRADE, ASYMMETRIC mid-lope: the LEFT leg drives forward to plant, the
     RIGHT leg trails high behind, hock lifted and toe barely clearing the ground — the caught-
     mid-stride read. Both keep the 3-segment hip->stifle->hock->toe hyena zigzag. ===== */
  {
    // LEFT leg — forward-planted (opposite the trailing right spear arm's counter-swing)
    {
      const hip=V(-L.hipHalf, L.hipY-0.02, 0.02);
      const knee=V(-L.hipHalf-0.02, 0.48, 0.22);      // stifle driven forward
      const hock=V(-0.145, 0.20, 0.30);               // hock still raised, but pushed forward under the reach
      const toe=V(-0.145, 0.045, 0.44);               // long toe planted well forward
      tube(hip, knee, 0.086, 0.058, 6, P.hide);
      tube(knee, hock, 0.052, 0.038, 6, P.hideDk);
      tube(hock, toe, 0.040, 0.034, 6, P.hideDk, {capB:{hex:P.muzzle, lift:0.006}});
      for(const cx of [-0.020,0,0.020]){
        quad(V(toe.x+cx-0.006,0.032,toe.z+0.03), V(toe.x+cx+0.006,0.032,toe.z+0.03),
             V(toe.x+cx+0.004,0.010,toe.z+0.055), V(toe.x+cx-0.004,0.010,toe.z+0.055), P.nose, 0.0);
      }
    }
    // RIGHT leg — trailing high behind, driving the push-off; toe lifted clear of the disc
    {
      const hip=V(L.hipHalf, L.hipY-0.02, 0.00);
      const knee=V(L.hipHalf+0.02, 0.44, -0.10);      // stifle pulled back and up
      const hock=V(0.175, 0.30, -0.34);               // hock swung high and far back
      const toe=V(0.175, 0.115, -0.44);               // toe trailing, clear of the ground
      tube(hip, knee, 0.086, 0.058, 6, P.hide);
      tube(knee, hock, 0.052, 0.038, 6, P.hideDk);
      tube(hock, toe, 0.040, 0.034, 6, P.hideDk, {capB:{hex:P.muzzle, lift:0.006}});
      for(const cx of [-0.020,0,0.020]){
        quad(V(toe.x+cx-0.006,toe.y-0.02,toe.z-0.03), V(toe.x+cx+0.006,toe.y-0.02,toe.z-0.03),
             V(toe.x+cx+0.004,toe.y-0.043,toe.z-0.055), V(toe.x+cx-0.004,toe.y-0.043,toe.z-0.055), P.nose, 0.0);
      }
    }
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
