/* dev/model-qa/creatures/mon-wolf.js — the WOLF landmark table (QUADRUPED-DIGITIGRADE family,
   Medium, CR 1/4), REBUILT under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry
   pilot). Supersedes the 500-tri-era build (53 loose shells, 414 verts, sketchy topology) that the
   docs/ANATOMY-CANON.md digitigrade deep-dive was ABOUT.

   R1 SELF-CORRECTION NOTE: the first bake used a SYMMETRIC-radius torso tube, whose ring top sits at
   center+radius — with the ring centered near the spine that put the "top" of the body FAR above the
   actual back line, rendering as a round dark blob with no wolf silhouette. Rebuilt the torso as an
   ANATOMY-CANON asymmetric belly/back ellipse per station (cy=(backTop+belly)/2, ry=(backTop-belly)/2,
   so the ring top is EXACTLY backTop — the same fix `rigs/quadruped.js`'s proven build already made).
   Also reverted an over-ambitious floating-paw mid-lunge draft (read as a shapeless blob) to the
   braced-snarl alternate pose, and a raised "balance whip" tail (read as a stray limb) back to the
   proven level carriage.

   FEATURE CHECKLIST (the ~1.1-1.3k budget buys):
     1. DIGITIGRADE hind leg — true 4-segment Z-zigzag (thigh angles fwd-down to the stifle; tibia
        angles back-and-UP to a HIGH hock set behind the stifle; near-vertical cannon to the paw) —
        distinct in silhouette from the near-straight front column. docs/ANATOMY-CANON.md § quadruped-
        digitigrade, the single most-failed structure.
     2. Deep-chest / belly-tuck torso line (the "wolf-not-sheep" read): an asymmetric belly/back
        ellipse per station, back near-level, belly drops to the chest and tucks up behind the ribs.
     3. Raised HACKLE ridge — a low row of pyramid fur-spikes riding the back line over the loin/
        withers, PALE tips for value contrast (a signature aggression accent, new this pass).
     4. The OPEN-MAW signature — KEPT in spirit from the pre-rebuild file (law 4 evidence: correct-
        but-bland lost to this in the 2026-07-04 QA): parted upper/lower jaw, bared geometric fangs,
        a tongue hint, a throat/ruff fringe.
     5. Braced-SNARL pose — weight settled low over a wide, coiled stance (all four paws planted,
        haunches bent hard, ready to spring), a mild fore/aft footfall stagger so it never reads as a
        static stand.
     6. Pinned-back aggressive ears, lowered/forward-reaching snarl head carriage.

   POSE SENTENCE: a wolf braced low in a wide coiled stance, hackles up, jaws snapped open in a snarl,
   weight settled back on bent haunches ready to spring — the pack predator at its most alive moment,
   never at attention.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by mon-wolf-probe.html + ps1-sheet.html (SETS['foundry-pilot'], cell 3). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildWolf(){
  /* ---------- PALETTE (VS desaturated; brightened for value contrast after the r1 dark-blob miss —
     coat lifted a notch, hackle tip a true PALE highlight, cannon "socks" lightened) ---------- */
  const P = {
    coat:0x9c9184, coatDk:0x796f60, saddle:0x554e42, saddleDk:0x39342c,
    belly:0xc4b9a2, ruff:0xaea290,            // paler throat/belly ruff
    hackle:0x6b6252, hackleTip:0xe4d9b8,      // raised hackle ridge — PALE tip = the value-contrast zone
    sock:0xcabf9e,                            // lighter lower-leg "sock" (digitigrade cannon readability)
    muzzle:0x7c7360, muzzleLt:0xaea192, nose:0x201b18,
    maw:0x3a2622, tongue:0x9a5a54, tooth:0xf0e8d4,
    ear:0x685c4c, earIn:0x362c22,
    claw:0x2c2620, disc:0x4a4038, discTop:0x585047,
  };

  const H = 0.80;                               // shoulder-height reference (topline ≈ H)
  const N = 10;                                  // torso/head ring density

  /* ---------- TORSO — asymmetric belly/back ellipse per station (the anatomy fix): back near-level
     (backTop), belly drops to the chest and tucks up behind the ribs. cy/ry keep the ring TOP exactly
     at backTop — no ballooning above the spine line. ---------- */
  const T = [
    {z:-0.46, hw:0.195, backTop:H*1.02, belly:H*0.55, hex:P.coat},     // rump — haunch raised, coiled
    {z:-0.24, hw:0.180, backTop:H*1.00, belly:H*0.68, hex:P.saddle},   // loin TUCK + darker saddle
    {z:-0.02, hw:0.205, backTop:H*1.03, belly:H*0.56, hex:P.saddle},   // mild arch — hackle crest
    {z: 0.18, hw:0.215, backTop:H*1.00, belly:H*0.46, hex:P.coat},     // deep chest
    {z: 0.30, hw:0.180, backTop:H*1.00, belly:H*0.52, hex:P.coat},     // shoulder
  ];
  const trings = T.map(s=>{
    const cy=(s.backTop+s.belly)/2, ry=(s.backTop-s.belly)/2;
    return ring(V(0,cy,s.z), V(0,0,1), s.hw, ry, N, Math.PI/N);
  });
  stitch(trings, b=>T[b].hex);
  capFan(trings[0], V(0, (T[0].backTop+T[0].belly)/2, T[0].z-0.04), T[0].hex, true);   // rump cap
  const backTopAt=(z)=>{                          // piecewise-linear backTop lookup (hackle placement)
    for(let i=0;i<T.length-1;i++) if(z<=T[i+1].z) { const t=(z-T[i].z)/(T[i+1].z-T[i].z); return T[i].backTop+(T[i+1].backTop-T[i].backTop)*t; }
    return T.at(-1).backTop;
  };
  /* deep chest keel + pale belly under the barrel (decorative accents, riding the belly line) */
  {
    quad(V(-0.11,H*0.40,0.06), V(0.11,H*0.40,0.06), V(0.08,H*0.34,0.32), V(-0.08,H*0.34,0.32), P.ruff, 0.05);
    quad(V(-0.13,H*0.46,-0.32), V(0.13,H*0.46,-0.32), V(0.11,H*0.42,0.08), V(-0.11,H*0.42,0.08), P.belly, 0.05);
  }

  /* ---------- HACKLE RIDGE — low-profile fur-spike pyramids riding the loin/withers back line
     (SIGNATURE #3, new). Seated from the torso SURFACE (backTopAt), never the spine center, per the
     "seat appendages from the surface" rule. Each spike = 3 quads to an apex (the ear-pyramid
     technique) so it has real volume from every angle; PALE tips carry the value-contrast read. ---------- */
  {
    const stations = [
      {t:0.06,w:0.028},{t:0.18,w:0.034},{t:0.30,w:0.038},{t:0.42,w:0.040},{t:0.54,w:0.040},
      {t:0.65,w:0.038},{t:0.75,w:0.034},{t:0.84,w:0.030},{t:0.92,w:0.025},{t:0.98,w:0.020},
    ];
    const z0=T[1].z, z1=T[4].z;                    // loin -> shoulder run
    for(const st of stations){
      const cz = z0 + (z1-z0)*st.t, hw=st.w;
      const surf = backTopAt(cz) + 0.015;           // just above the torso surface
      const a=V(-hw,surf,cz-hw*0.7), b=V(hw,surf,cz-hw*0.7), c=V(0,surf,cz+hw*0.9);
      const apex=V(0, surf+0.055, cz);
      quad(a,b,apex,apex,P.hackle,0.04);
      quad(b,c,apex,apex,P.hackleTip,0.04);
      quad(c,a,apex,apex,P.hackle,0.04);
    }
  }

  /* ---------- NECK — top edge rides the back line (center = backTop - neckR), runs forward-and-down
     from the withers to a LOW-carried head base (topline-continuity rule). ---------- */
  const neckR = 0.135, shoulderBackTop = T.at(-1).backTop;
  const headBase = V(0, H*0.820, 0.50);
  tube(V(0, shoulderBackTop-neckR, T.at(-1).z), headBase, neckR, neckR*0.74, N, P.ruff, {phase:Math.PI/N});

  /* ---------- HEAD — low-carried cranium wedge with the SIGNATURE OPEN MAW ---------- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {z:0.50, y:H*0.820, rx:0.120, rz:0.115, hex:P.coat},
      {z:0.57, y:H*0.790, rx:0.105, rz:0.098, hex:P.coat},
      {z:0.635,y:H*0.755, rx:0.072, rz:0.062, hex:P.coatDk},
      {z:0.70, y:H*0.725, rx:0.048, rz:0.042, hex:P.coatDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.z), V(0,0,1), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);

    /* MOUTH — parted upper/lower jaw projecting off the last cranium band, bared fang row, thin dark
       line, tongue hint. Pattern = the proven 2026-07-04 mouth pass (mostly-closed muzzle, subtle
       bared-teeth snarl — never the old dislocated wide gape). */
    /* r1 self-correction #3: the mouth read too small/thin at this camera distance — beefed up the
       muzzle radii (chunkier snout, easier to read as a head not a stick) and enlarged/brightened the
       fang row + widened the dark maw gap so the open-maw signature actually carries. */
    const jawY = H*0.700;
    const uB=V(0, jawY+0.048, 0.68), uM=V(0, jawY+0.036, 0.85), uT=V(0, jawY+0.020, 0.97);
    tube(uB, uM, 0.072, 0.056, n, P.muzzle, {raz:0.062, rbz:0.046, phase:ph});
    tube(uM, uT, 0.056, 0.032, n, P.muzzle, {raz:0.046, rbz:0.026, phase:ph, capB:{hex:P.nose, lift:0.010}});
    quad(V(-0.048,jawY-0.006,0.71), V(0.048,jawY-0.006,0.71),
         V(0.030,jawY-0.012,0.92), V(-0.030,jawY-0.012,0.92), P.maw, 0.02);
    const lB=V(0, jawY-0.052, 0.68), lM=V(0, jawY-0.068, 0.84), lT=V(0, jawY-0.078, 0.92);
    tube(lB, lM, 0.058, 0.040, n, P.muzzle,   {raz:0.044, rbz:0.032, phase:ph});
    tube(lM, lT, 0.040, 0.024, n, P.muzzleLt, {raz:0.032, rbz:0.018, phase:ph, capB:{hex:P.muzzleLt, lift:0.008}});
    quad(V(-0.022,jawY-0.026,0.76), V(0.022,jawY-0.026,0.76),
         V(0.018,jawY-0.032,0.88), V(-0.018,jawY-0.032,0.88), P.tongue, 0.04);

    /* geometric TEETH — a LARGER, brighter bared-fang row (upper canines+incisors+carnassial hint,
       lower canines) — the signature's high-value zone (law 3).
       CRITIC R2 FIX: the original fang() kept vertex order (a,b) fixed while flipping the apex
       (ty=y-h vs y+h) between up/down fangs — that flips the triangle's winding, so the upper-row
       fangs' face normal pointed BACKWARD (-z, into the skull) instead of toward the camera/light,
       and MeshLambertMaterial's default FrontSide culled them: the entire upper fang row was
       invisible in-engine (only the 2 lower canines, already correctly wound, ever rendered) — the
       "essence" gate failure (open-maw signature not loud). Fix: swap (a,b) for the down case so
       both orientations wind the same way and face +z. Also bumped w/h ~45% and pushed the fangs
       further off the muzzle surface (z+0.014 not +0.008) so they clear the 0.04u feature floor and
       don't get swallowed by the jaw-tube silhouette. */
    const fang=(x,y,z,w,h,down)=>{
      const ty = down ? y-h : y+h;
      const p1 = down ? V(x+w,y,z+0.014) : V(x-w,y,z+0.014);
      const p2 = down ? V(x-w,y,z+0.014) : V(x+w,y,z+0.014);
      quad(p1, p2, V(x,ty,z+0.006), V(x,ty,z+0.006), P.tooth, 0.02);
    };
    for(const s of [-1,1]){
      fang(s*0.040, jawY+0.002, 0.775, 0.029, 0.067, true);
      fang(s*0.018, jawY-0.002, 0.815, 0.019, 0.038, true);
      fang(s*0.058, jawY+0.006, 0.735, 0.022, 0.044, true);
    }
    for(const s of [-1,1]){
      fang(s*0.034, jawY-0.044, 0.775, 0.022, 0.041, false);
    }

    /* throat/ruff FRINGE — small raised tufts under the jaw (bristled aggression, value accent) */
    {
      const tufts=[-0.05,-0.017,0.017,0.05];
      for(const tx of tufts){
        const base=V(tx, H*0.665, 0.42), a=V(tx-0.016,base.y,base.z-0.02), b=V(tx+0.016,base.y,base.z-0.02);
        const c=V(tx,base.y,base.z+0.03), apex=V(tx,base.y-0.05,base.z);
        quad(a,b,apex,apex,P.ruff,0.04); quad(b,c,apex,apex,P.coatDk,0.04); quad(c,a,apex,apex,P.ruff,0.04);
      }
    }

    /* PINNED-BACK EARS — flattened, swept back-and-down against the skull (aggressive, not pricked),
       seated from the CROWN SURFACE (band0 center + rz), not the skull center. */
    const crownY = bands[0].y + bands[0].rz - 0.006, ez = bands[0].z - 0.01;
    for(const s of [-1,1]){
      const base=V(s*0.095, crownY, ez);
      const tip =V(s*0.145, crownY+0.070, ez-0.11);   // swept BACK and slightly up — pinned, not erect
      tube(base, tip, 0.054, 0.010, 8, P.ear, {raz:0.026, rbz:0.006, capB:{hex:P.ear, lift:0.006}});
      quad(V(s*0.084,crownY+0.010,ez-0.008), V(s*0.110,crownY+0.010,ez-0.016),
           V(s*0.132,crownY+0.058,ez-0.100), V(s*0.104,crownY+0.058,ez-0.092), P.earIn, 0.03);
    }
  }

  /* ---------- LEGS — braced-snarl: ALL FOUR PAWS GROUNDED, a wide coiled stance. Hind = true
     digitigrade 4-segment Z-zigzag (thigh fwd-down to the stifle / tibia back-and-UP to a HIGH hock
     BEHIND the stifle / near-vertical cannon) — the ANATOMY-CANON fix the old file lacked. Front =
     near-straight column. A mild fore/aft footfall stagger (not a mirrored stand) keeps it alive. ---------- */
  {
    const seg=8, hipX=0.135, footXh=0.155, shX=0.145, hindZ=-0.42, frontZ=0.20;
    const hindLeg=(sx, stagger)=>{
      const hip    = V(sx*hipX, H*0.90, hindZ+0.04);
      const stifle = V(sx*hipX, H*0.52, hindZ+0.12);           // forward & down
      const hock   = V(sx*footXh, H*0.34, hindZ-0.05);         // HIGH & back (behind the stifle)
      const paw    = V(sx*footXh, 0.05, hindZ+0.02+stagger);   // near-vertical cannon
      tube(hip, stifle, 0.115, 0.074, seg, P.coat);            // thick coiled haunch
      tube(stifle, hock, 0.068, 0.048, seg, P.coatDk);
      tube(hock, paw, 0.048, 0.032, seg, P.sock, {capB:{hex:P.sock, lift:0.006}});
      footToes(paw);
    };
    const frontLeg=(sx, stagger)=>{
      const sh     = V(sx*shX, H*0.88, frontZ);
      const elbow  = V(sx*shX, H*0.50, frontZ-0.02);
      const carpus = V(sx*shX, H*0.20, frontZ+0.01);
      const paw    = V(sx*shX, 0.05, frontZ+0.12+stagger);
      tube(sh, elbow, 0.092, 0.062, seg, P.coat);
      tube(elbow, carpus, 0.062, 0.046, seg, P.coatDk);
      tube(carpus, paw, 0.046, 0.032, seg, P.sock, {capB:{hex:P.sock, lift:0.006}});
      footToes(paw);
    };
    function footToes(paw){
      for(const cx of [-0.020,-0.007,0.007,0.020]){
        quad(V(paw.x+cx-0.005,paw.y-0.02,paw.z+0.026), V(paw.x+cx+0.005,paw.y-0.02,paw.z+0.026),
             V(paw.x+cx+0.004,paw.y-0.04,paw.z+0.050), V(paw.x+cx-0.004,paw.y-0.04,paw.z+0.050), P.claw, 0.0);
      }
    }
    // FRONT: wide-planted brace, a mild stagger (right foot a touch further forward) — the "alive" read
    frontLeg(-1, -0.04); frontLeg(1, 0.04);
    // HIND: coiled wide under the raised rump, haunches deep-bent, hocks set well back and high
    hindLeg(-1, 0.03); hindLeg(1, -0.03);
  }

  /* ---------- TAIL — SHORT and TUCKED, drooping fast off the rump (r1 self-correction #2: a long
     -z tail reads as an upward-arcing second limb/snake in this camera's oblique projection — far -z
     depth reads as screen-up-right here regardless of world Y. Shortened + steepened so it stays
     visually anchored to the haunch instead of sailing off into its own silhouette). ---------- */
  {
    const rumpBackTop = T[0].backTop;
    const root = V(0.02, rumpBackTop-0.03, -0.52);
    const b1   = V(0.05, rumpBackTop-0.16, -0.62);
    const b2   = V(0.08, rumpBackTop-0.32, -0.70);       // tucked in close, steep droop
    const tip  = V(0.10, rumpBackTop-0.46, -0.76);
    tube(root, b1, 0.098, 0.078, N, P.coat,   {phase:Math.PI/N, capA:{hex:P.coatDk}});
    tube(b1,   b2, 0.078, 0.052, N, P.coatDk, {phase:Math.PI/N});
    tube(b2,   tip,0.052, 0.020, N, P.saddleDk,{phase:Math.PI/N, capB:{hex:P.saddleDk, lift:0.008}});
  }

  /* ---------- base disc (Medium: r=0.42, humanoid pattern) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
