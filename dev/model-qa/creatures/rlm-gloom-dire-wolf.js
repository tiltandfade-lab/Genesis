/* dev/model-qa/creatures/rlm-gloom-dire-wolf.js — the DIRE WOLF landmark table (QUADRUPED-
   DIGITIGRADE family, Medium, CR 1, realm gloom), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (2026-07-08 foundry pilot, gloom-w2). NOT a var-direwolf-style scaled
   clone of mon-wolf.js — a bespoke chassis per the brief: a half-turned wolf-thing running with
   the pack, losing more of itself every full moon. Must read distinct from mon-wolf.js in
   silhouette alone: mon-wolf is a level-backed braced snarl; this creature has a wrong, uneven
   topline (an oversized shoulder hump breaking hard above the withers) and reads GAUNT (rib
   grooves cutting the flank) instead of coated-and-healthy, caught mid-gallop instead of braced.

   FEATURE CHECKLIST (the ~1.0-1.4k budget buys):
     1. QUADRUPED-DIGITIGRADE full gallop extension (anatomy chief criterion + pose law): front
        legs reaching far forward under a low-carried head, hind legs driving/trailing far back,
        true 4-segment Z-zigzag hind (thigh fwd-down to stifle, tibia back-and-up to a HIGH hock)
        against a near-straight front column — but every segment stretched past mon-wolf's
        proportions (too-long legs), so the creature looks like it's eating ground.
     2. SIGNATURE — an oversized shoulder hump: the topline breaks WRONG right at the withers,
        rising far above the level back-line the wolf family expects, then drops hard into the
        neck. The one loud exaggerated feature (law 4) — reads in silhouette alone as a hunched,
        wrong-shaped wolf even before the head registers.
     3. Gaunt ribs — dark groove lines raking down the flank between pale rib ridges, the
        half-starved half-turned read; the value-contrast payload (law 3) sitting right where the
        torso would otherwise be one flat coat-color mass.
     4. A ragged spine-ridge crest running loin-to-hump — patchy, uneven tuft heights (not a
        clean hackle row like mon-wolf's) with a few bald gaps, tying to "losing more of itself
        every full moon."
     5. Bared-teeth open maw, wider and more asymmetric than mon-wolf's snarl (one side dropped
        further, a wrongness tell), pale fangs the second high-value zone.
     6. Mangy bald patches on the hip/shoulder (dark low-value blotches breaking the coat) — cheap
        silhouette-and-surface tell for "losing itself," costs almost no budget.

   POSE SENTENCE: a half-turned wolf-thing at full gallop stretch, front legs reaching out flat
   ahead of a low snapped-forward head, hind legs driving hard behind with the hocks kicked high,
   spine stretched long and low between an oversized hunched shoulder-hump and a streaming tail —
   the pack-runner at its most alive moment, never braced, never at attention.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w2'], cell 1). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDireWolf(){
  /* ---------- PALETTE (gloom-desaturated, sickly — greyed coat, low-value mange/groove blotches,
     a pale gaunt-rib ridge for value contrast, sick yellow-green eye-glow) ---------- */
  const P = {
    // R1 SELF-CORRECTION: v1's coat/hump tones sat within a few steps of each other (0x726b5a vs
    // 0x5f5949) so the shoulder-hump signature didn't carry the light per law 3 — it read as more
    // torso mass, not a loud silhouette-breaking bump. Darkened the base coat and pushed the hump
    // to a genuinely pale sandy highlight so the eye lands on the wrongness first.
    // R2 CRITIC FIX (fresh-context pass-2, dire-wolf-r2 render): measured in-engine pixel values at
    // native brightness showed the torso/leg coat rendering at ~(30,27,20) against a void of
    // ~(10,9,8) — a ~20-unit differential that the dither pattern swallows whole (law-3 failure,
    // the same class vampire-spawn's R2 fix caught: "torso/legs dissolved into dither noise"). The
    // hump signature carried the light fine but the anatomy underneath it — the whole point of this
    // creature's gallop-extension pose — vanished into the void. Lifted every leg/head/torso tone
    // ~50-60% brighter (kept the same hue relationships and light/dark alternation pairs — rib
    // ridge/groove, hump/humpDk — untouched in RATIO, just raised off the floor) so the running
    // anatomy clears the void at native render brightness, not just when gamma-boosted for review.
    coat:0x8f8468, coatDk:0x5f5845, hump:0xa89c7c, humpDk:0x746a52,
    rib:0x9d947c, ribGroove:0x2c2820,          // pale rib ridge vs dark groove — the gaunt read
    mange:0x211d18,                              // bald low-value patches (reads as a hole in the now-brighter coat)
    belly:0x94886e, ruff:0x8a8068,
    crest:0x746b54, crestPale:0xcabe9a,          // ragged spine crest, patchy pale tufts
    muzzle:0x8c8268, muzzleLt:0xa89c7a, nose:0x181410,
    maw:0x1e1712, tongue:0x6a3e38, tooth:0xe6ddc6,
    ear:0x6b624c, earIn:0x211c16,
    eye:0x100d0a, eyeGlow:0xb6ce3c,               // sickly yellow-green glow
    claw:0x181410, disc:0x453c30, discTop:0x534a3c,
  };

  const H = 0.98;                                 // shoulder-height reference (bigger than mon-wolf's 0.80)
  const N = 10;                                    // torso/head ring density

  /* ---------- TORSO — asymmetric belly/back ellipse per station, gallop-stretched (rump low and
     driving, mid-back extended, a WRONG hump breaking hard above the withers before the neck
     drops). backTopAt/bellyAt/hwAt = piecewise lookups for placing the crest + rib grooves + patches
     on the actual surface, never the spine center. ---------- */
  const T = [
    {z:-0.70, hw:0.175, backTop:H*0.78, belly:H*0.38, hex:P.coat},     // rump — driving haunch, low
    {z:-0.40, hw:0.190, backTop:H*0.88, belly:H*0.46, hex:P.coatDk},   // loin — rising off the drive
    {z:-0.08, hw:0.200, backTop:H*0.97, belly:H*0.42, hex:P.coat},     // mid-back — stretched, deep chest starting
    {z: 0.16, hw:0.205, backTop:H*1.04, belly:H*0.36, hex:P.coat},     // pre-hump — deepest chest
    {z: 0.30, hw:0.195, backTop:H*1.38, belly:H*0.40, hex:P.hump},     // HUMP PEAK — the wrongness signature
    {z: 0.44, hw:0.165, backTop:H*1.02, belly:H*0.42, hex:P.humpDk},   // hump falls hard into the neck base
  ];
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
    quad(V(-0.10,H*0.34,0.12), V(0.10,H*0.34,0.12), V(0.07,H*0.28,0.36), V(-0.07,H*0.28,0.36), P.ruff, 0.05);
    quad(V(-0.12,H*0.42,-0.36), V(0.12,H*0.42,-0.36), V(0.10,H*0.36,0.10), V(-0.10,H*0.36,0.10), P.belly, 0.05);
  }

  /* ---------- GAUNT RIBS — dark groove/pale-ridge alternation raking diagonally down the flank
     over the loin-to-prehump run (SIGNATURE #3, law 3 payload). Seated from the surface (backTopAt/
     bellyAt), each rib a short dark quad with a paler ridge quad beside it so the alternation
     itself carries the read, not a single flat groove line. ---------- */
  {
    const ribZ = [-0.34,-0.24,-0.14,-0.04,0.06,0.16];
    for(const s of [-1,1]){
      for(const z of ribZ){
        const hw = hwAt(z)*0.99, topY=backTopAt(z), botY=bellyAt(z);
        const midY = topY - (topY-botY)*0.30, lowY = topY - (topY-botY)*0.62;
        // dark groove
        quad(V(s*hw, midY, z-0.05), V(s*hw, midY, z+0.02),
             V(s*hw*0.97, lowY, z+0.00), V(s*hw*0.97, lowY, z-0.06), P.ribGroove, 0.02);
        // pale ridge just forward of the groove
        quad(V(s*hw, midY, z+0.03), V(s*hw, midY, z+0.075),
             V(s*hw*0.98, lowY, z+0.05), V(s*hw*0.98, lowY, z+0.01), P.rib, 0.03);
      }
    }
  }

  /* ---------- MANGY BALD PATCHES — low-value blotches on hip/shoulder, "losing itself" tell
     (SIGNATURE #6, cheap). ---------- */
  {
    const patches = [
      {z:-0.56, s:1,  y:H*0.62, w:0.075, h:0.06},
      {z:-0.50, s:-1, y:H*0.50, w:0.06,  h:0.05},
      {z: 0.10, s:1,  y:H*0.70, w:0.055, h:0.05},
    ];
    for(const pch of patches){
      const hw = hwAt(pch.z);
      const cx = pch.s*hw*0.98, cy = pch.y, cz = pch.z;
      quad(V(cx,cy-pch.h,cz-pch.w), V(cx,cy-pch.h,cz+pch.w),
           V(cx,cy+pch.h,cz+pch.w), V(cx,cy+pch.h,cz-pch.w), P.mange, 0.04);
    }
  }

  /* ---------- RAGGED SPINE CREST — patchy, uneven tuft row from loin through the hump peak
     (SIGNATURE #4). Unlike mon-wolf's clean even hackle, heights + presence are irregular (a gap
     or two) and tips are a dull pale, not a bright highlight — sickly, not proud. ---------- */
  {
    const stations = [
      {t:0.02,w:0.024,h:0.030,skip:false},{t:0.14,w:0.030,h:0.045,skip:false},
      {t:0.24,w:0.028,h:0.020,skip:true }, // bald gap
      {t:0.34,w:0.034,h:0.060,skip:false},{t:0.45,w:0.036,h:0.075,skip:false},
      {t:0.55,w:0.030,h:0.040,skip:true }, // bald gap
      {t:0.66,w:0.038,h:0.090,skip:false},{t:0.78,w:0.030,h:0.055,skip:false},
      {t:0.90,w:0.024,h:0.035,skip:false},{t:0.98,w:0.020,h:0.024,skip:false},
    ];
    const z0=T[1].z, z1=T[4].z;                    // loin -> hump-peak run
    for(const st of stations){
      if(st.skip) continue;
      const cz = z0 + (z1-z0)*st.t, hw=st.w;
      const surf = backTopAt(cz) + 0.012;
      const a=V(-hw,surf,cz-hw*0.7), b=V(hw,surf,cz-hw*0.7), c=V(0,surf,cz+hw*0.9);
      const apex=V(0, surf+st.h, cz);
      quad(a,b,apex,apex,P.crest,0.05);
      quad(b,c,apex,apex,P.crestPale,0.05);
      quad(c,a,apex,apex,P.crest,0.05);
    }
  }

  /* ---------- NECK — drops hard off the hump peak (not the back-top like a normal wolf), runs
     forward-and-down to a low snapped-forward head (running low, not braced-level). ---------- */
  const neckR = 0.135, humpFallTop = T.at(-1).backTop;
  const headBase = V(0, H*0.680, 0.66);
  tube(V(0, humpFallTop-neckR, T.at(-1).z), headBase, neckR, neckR*0.72, N, P.ruff, {phase:Math.PI/N});

  /* ---------- HEAD — low, snapped forward with a wider, ASYMMETRIC bared-teeth open maw
     (wrongness tell: one side of the jaw drops further than the other). ---------- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {z:0.66, y:H*0.680, rx:0.128, rz:0.122, hex:P.coat},
      {z:0.74, y:H*0.640, rx:0.110, rz:0.100, hex:P.coat},
      {z:0.815,y:H*0.598, rx:0.076, rz:0.064, hex:P.coatDk},
      {z:0.885,y:H*0.562, rx:0.050, rz:0.044, hex:P.coatDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.z), V(0,0,1), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);

    const jawY = H*0.562;
    const uB=V(0, jawY+0.052, 0.86), uM=V(0, jawY+0.040, 1.04), uT=V(0, jawY+0.022, 1.18);
    tube(uB, uM, 0.076, 0.059, n, P.muzzle, {raz:0.065, rbz:0.048, phase:ph});
    tube(uM, uT, 0.059, 0.033, n, P.muzzle, {raz:0.048, rbz:0.027, phase:ph, capB:{hex:P.nose, lift:0.010}});
    // ASYMMETRIC mouth void — the right side (s=1) drops lower than the left, a subtle wrong-hinge tell
    quad(V(-0.050,jawY-0.006,0.89), V(0.050,jawY-0.006,0.89),
         V(0.040,jawY-0.055,1.11), V(-0.032,jawY-0.014,1.11), P.maw, 0.02);
    const lB=V(0, jawY-0.056, 0.86), lM=V(0.010, jawY-0.078, 1.03), lT=V(0.014, jawY-0.090, 1.13);
    tube(lB, lM, 0.061, 0.042, n, P.muzzle,   {raz:0.046, rbz:0.033, phase:ph});
    tube(lM, lT, 0.042, 0.025, n, P.muzzleLt, {raz:0.033, rbz:0.018, phase:ph, capB:{hex:P.muzzleLt, lift:0.008}});
    quad(V(-0.023,jawY-0.030,0.94), V(0.023,jawY-0.030,0.94),
         V(0.019,jawY-0.038,1.08), V(-0.019,jawY-0.038,1.08), P.tongue, 0.04);

    /* geometric TEETH — a wide bared-fang row, the value payload (law 3) ---------- */
    const fang=(x,y,z,w,h,down)=>{
      const ty = down ? y-h : y+h;
      const p1 = down ? V(x+w,y,z+0.016) : V(x-w,y,z+0.016);
      const p2 = down ? V(x-w,y,z+0.016) : V(x+w,y,z+0.016);
      quad(p1, p2, V(x,ty,z+0.006), V(x,ty,z+0.006), P.tooth, 0.02);
    };
    for(const s of [-1,1]){
      fang(s*0.044, jawY+0.004, 0.955, 0.032, 0.074, true);
      fang(s*0.020, jawY-0.002, 1.005, 0.021, 0.042, true);
      fang(s*0.064, jawY+0.008, 0.905, 0.024, 0.048, true);
    }
    for(const s of [-1,1]){
      fang(s*0.038, jawY-0.048, 0.955, 0.024, 0.045, false);
    }

    /* PINNED-BACK EARS — swept flat against the skull, running-flat rather than pricked */
    const crownY = bands[0].y + bands[0].rz - 0.006, ez = bands[0].z - 0.01;
    for(const s of [-1,1]){
      const base=V(s*0.100, crownY, ez);
      const tip =V(s*0.155, crownY+0.060, ez-0.125);
      tube(base, tip, 0.056, 0.010, 8, P.ear, {raz:0.026, rbz:0.006, capB:{hex:P.ear, lift:0.006}});
      quad(V(s*0.088,crownY+0.008,ez-0.006), V(s*0.116,crownY+0.008,ez-0.014),
           V(s*0.140,crownY+0.050,ez-0.110), V(s*0.110,crownY+0.050,ez-0.100), P.earIn, 0.03);
    }

    /* sunken sick-glow eyes */
    for(const s of [-1,1]){
      const ex=s*0.058, ey=bands[0].y+0.010, ez2=bands[0].z+0.02;
      quad(V(ex-0.018,ey-0.010,ez2), V(ex+0.018,ey-0.010,ez2),
           V(ex+0.014,ey+0.010,ez2+0.010), V(ex-0.014,ey+0.010,ez2+0.010), P.eye, 0.02);
      quad(V(ex-0.008,ey-0.004,ez2+0.006), V(ex+0.008,ey-0.004,ez2+0.006),
           V(ex+0.006,ey+0.004,ez2+0.012), V(ex-0.006,ey+0.004,ez2+0.012), P.eyeGlow, 0.0);
    }
  }

  /* ---------- LEGS — full gallop extension. Hind legs true digitigrade 4-segment Z-zigzag,
     driving hard behind with hocks kicked HIGH. Front legs a near-straight column reaching FAR
     forward. Every segment stretched past mon-wolf's ratios (too-long legs, law-4 wrongness) —
     paws lift clear of the ground in the suspension phase (bbox stays >=0 via the base disc/torso
     still spanning the floor). ---------- */
  {
    const seg=8;
    // R1 SELF-CORRECTION: v1's hind paws trailed to z=-1.00..-1.36, the SAME depth range as the
    // tail — at this camera's oblique projection (far -z reads screen-up-right, per the mon-wolf
    // tail lesson) the two limbs stacked into one unreadable tangle of sticks. Shortened the hind
    // reach and splayed the stance wider (bigger sx multipliers) so the driving hind legs break
    // outward from the centerline instead of running parallel to the tail's up-right streak.
    const hindLeg=(sx, driveZ)=>{
      const hip    = V(sx*0.150, H*0.86, -0.58);
      const stifle = V(sx*0.175, H*0.42, -0.30);          // forward & down off the hip
      const hock   = V(sx*0.220, H*0.36, -0.62);          // HIGH & kicked back-and-up (behind the stifle)
      const paw    = V(sx*0.235, H*0.10, -0.82+driveZ);   // near-vertical cannon, trailing (short of the tail's reach)
      tube(hip, stifle, 0.100, 0.062, seg, P.coat);
      tube(stifle, hock, 0.058, 0.040, seg, P.coatDk);
      tube(hock, paw, 0.040, 0.026, seg, P.muzzle, {capB:{hex:P.muzzle, lift:0.006}});
      footToes(paw, sx);
    };
    const frontLeg=(sx, reachZ)=>{
      const sh     = V(sx*0.145, H*0.92, 0.28);
      const elbow  = V(sx*0.150, H*0.52, 0.52);
      const carpus = V(sx*0.150, H*0.24, 0.78);
      const paw    = V(sx*0.150, H*0.06, 1.02+reachZ);
      tube(sh, elbow, 0.082, 0.056, seg, P.coat);
      tube(elbow, carpus, 0.056, 0.040, seg, P.coatDk);
      tube(carpus, paw, 0.040, 0.026, seg, P.muzzle, {capB:{hex:P.muzzle, lift:0.006}});
      footToes(paw, sx);
    };
    function footToes(paw, sx){
      for(const cx of [-0.018,-0.006,0.006,0.018]){
        quad(V(paw.x+cx-0.005,paw.y-0.02,paw.z+0.024), V(paw.x+cx+0.005,paw.y-0.02,paw.z+0.024),
             V(paw.x+cx+0.004,paw.y-0.05,paw.z+0.046), V(paw.x+cx-0.004,paw.y-0.05,paw.z+0.046), P.claw, 0.0);
      }
    }
    // HIND: driving stagger — one leg fully extended back, one mid-recovery (never a mirrored pair)
    hindLeg(-1, 0.10); hindLeg(1, -0.22);
    // FRONT: reaching stagger — one leg fully extended forward, one gathering under the chest
    frontLeg(-1, -0.16); frontLeg(1, 0.06);
  }

  /* ---------- TAIL — streaming out level-and-back behind the drive (gallop carriage, never
     tucked, never raised into a whip-limb read). ---------- */
  {
    const rumpBackTop = T[0].backTop;
    const root = V(0.01, rumpBackTop-0.02, -0.66);
    const b1   = V(0.02, rumpBackTop-0.06, -0.92);
    const b2   = V(0.03, rumpBackTop-0.12, -1.16);
    const tip  = V(0.04, rumpBackTop-0.20, -1.36);
    tube(root, b1, 0.084, 0.066, N, P.coat,   {phase:Math.PI/N, capA:{hex:P.coatDk}});
    tube(b1,   b2, 0.066, 0.044, N, P.coatDk, {phase:Math.PI/N});
    tube(b2,   tip,0.044, 0.016, N, P.humpDk, {phase:Math.PI/N, capB:{hex:P.humpDk, lift:0.008}});
  }

  /* ---------- base disc (Medium: r=0.42, mon-wolf pattern) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
