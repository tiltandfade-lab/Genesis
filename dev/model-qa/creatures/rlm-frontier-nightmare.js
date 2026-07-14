/* dev/model-qa/creatures/rlm-frontier-nightmare.js — the NIGHTMARE landmark table (QUADRUPED —
   UNGULIGRADE family, Large, CR 7, realm frontier), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, frontier-w2 cell 9). Core identity: the NIGHTMARE — a
   flaming spectral steed eating the old coach road at a dead gallop. The headless-rider legend
   (Old Ruin-Rider, data/realm-bestiary.js) rides this chassis narratively; the bestiary key we
   model to is the HORSE, not the rider.

   FEATURE CHECKLIST (the ~1,300-1,800 budget buys):
     1. UNGULIGRADE horse anatomy per ANATOMY-CANON: square barrel, deep-narrow chest, long
        arched neck, blunt single hooves, hind Z-zigzag (stifle high/tucked, hock high/back)
        contrasted against straight front legs — but ALL FOUR legs driven into a full-extension
        gallop reach (front pair thrown forward, hind pair thrown back), not the static standing
        rig.
     2. SIGNATURE — the FLAME MANE + FLAME TAIL: a near-white-to-orange value ladder (law 3's
        high-value zone) streaming backward off the neck and croup, horizontal in the wind of
        the gallop — not hanging down like a resting mane.
     3. Coal-black spectral body (near-void base color, kept just above the 10,9,8 floor per
        law 3) so the flame reads as the ONLY light in the render — the silhouette read is a
        dark horse-shape wearing fire.
     4. EMBER EYES — two small glowing orange sockets on an otherwise coal-black skull, the
        second high-value accent, small enough to stay a "gaze" not a floodlight.
     5. Head thrown low-and-forward at full stretch (the racing-gallop head carriage, not the
        upright standing-horse neck), nostrils flared wide — a dark flared-nostril patch breaks
        the muzzle silhouette.
     6. Flame fetlocks: small flame licks at all four hoof/pastern joints, so the fire signature
        touches the ground contact points too, not just the mane/tail.

   POSE SENTENCE: the road-eating dead gallop — full-extension stride, front legs flung forward
   reaching, hind legs flung back driving off the hock, spine stretched low and flat pelvis-to-
   skull with the head thrown forward-and-down into the reach, flame mane and tail streaming back
   dead horizontal in the wind of the charge — the horse at its most alive (or unalive) moment,
   never a standing/at-attention four-square stance.

   SPINE-GESTURE SENTENCE: the trace from croup to skull is one long, low, near-horizontal line —
   haunch driving low, back flattening out through the withers (not arched/level-standing), neck
   reaching forward-and-down rather than up, so the whole spine gesture continues straight into
   the horizontal flame mane streaming off it: one unbroken line of action from tail-flame to
   mane-flame, the gallop-stretch law extended all the way through the signature.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w2'], cell 9, fn buildNightmare). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildNightmare(){
  /* ---------- PALETTE: coal body barely above the (10,9,8) void floor per law 3, flame mane/
     tail/fetlocks as the near-white->orange high-value ladder, ember-orange eyes. ---------- */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's "coal-black" body (0x1c1a20 / 0x121014,
     ~28,26,32 / ~18,16,20) sat only ~10-20 RGB over the (10,9,8) void — the entire torso/neck/
     leg mass vanished at 1/3-res+dither, leaving only the flame mane/tail/embers floating with
     no horse silhouette under them (a textbook law-3 failure, the Creeper's exact mistake).
     Body palette lifted a full ~60-90 RGB over the void (still read as dark slate-coal, never
     bright) so the animal shape survives; legs/hooves thickened slightly for the same reason. */
  const P = {
    coal: 0x625a70, coalDk: 0x453f52, coalHi: 0x796f88,   // body: dark slate-coal, darker (underline/legs), a lifted highlight band
    hoof: 0x28222e,
    flameHot: 0xfff2c8, flameMid: 0xffb347, flameLow: 0xd8571c, flameTip: 0x6a1f0a, // white -> orange -> ember-dark tip
    ember: 0xff7a1a, emberGlow: 0xffd28a,
  };

  const H = 0.95;           // shoulder height (Large steed)

  /* ===== TORSO: rings perpendicular to spine(+z). Gallop stretch flattens the back — top line
     runs a shallow low arc instead of level-standing, underline tucks hard behind the ribs. ===== */
  // stations: {z, hw, topY(x*H), botY(x*H), hex}
  const T = [
    { z:-0.62, hw:0.235, top:0.94, bot:0.42, hex:P.coal   },  // rump/croup (driving off)
    { z:-0.30, hw:0.225, top:0.965,bot:0.52, hex:P.coalDk },  // loin — tucked belly
    { z: 0.00, hw:0.250, top:0.97, bot:0.40, hex:P.coalDk },  // ribcage — deep chest
    { z: 0.28, hw:0.240, top:0.955,bot:0.46, hex:P.coal   },  // chest/shoulder
    { z: 0.46, hw:0.170, top:0.90, bot:0.56, hex:P.coal   },  // brisket taper into neck base
  ];
  const trings = T.map(s=>{
    const cy=(s.top*H + s.bot*H)/2, ry=(s.top*H - s.bot*H)/2;
    return ring(V(0, cy, s.z), V(0,0,1), s.hw, ry, 8, Math.PI/8);
  });
  stitch(trings, (b)=> T[b].hex);
  capFan(trings[0], V(0, (T[0].top*H+T[0].bot*H)/2, T[0].z-0.05), P.coal, true);   // cap rump

  /* ===== NECK + HEAD: long, reaching FORWARD-AND-DOWN into the gallop stretch (racing carriage,
     not the upright standing-horse arch) — continues the spine's low, flat gesture line. ===== */
  const neckBase = V(0, 0.90*H, T[T.length-1].z);
  const neckMid  = V(0, 0.86*H, T[T.length-1].z + 0.34);
  const headBase = V(0, 0.70*H, T[T.length-1].z + 0.60);   // thrown low
  tube(neckBase, neckMid, 0.135, 0.115, 8, P.coal, {phase:Math.PI/8});
  tube(neckMid, headBase, 0.115, 0.088, 8, P.coalDk, {phase:Math.PI/8});

  {
    // head bands along the reaching neck-to-muzzle axis (low, forward, tapering wedge)
    const hb = [
      { z: headBase.z,        y: 0.70*H, rx:0.088, rz:0.082, hex:P.coal },
      { z: headBase.z + 0.14, y: 0.665*H,rx:0.074, rz:0.066, hex:P.coal },
      { z: headBase.z + 0.28, y: 0.615*H,rx:0.050, rz:0.044, hex:P.coalDk },
      { z: headBase.z + 0.40, y: 0.575*H,rx:0.032, rz:0.028, hex:P.coalDk },
    ];
    const hr = hb.map(b=> ring(V(0, b.y, b.z), V(0,0,1), b.rx, b.rz, 8, Math.PI/8));
    stitch(hr, (b)=> hb[b].hex);
    capFan(hr[hr.length-1], V(0, hb[hb.length-1].y-0.006, hb[hb.length-1].z+0.035), P.coalDk); // nose tip

    // flared-nostril dark patch breaking the muzzle silhouette
    const mz = headBase.z + 0.37;
    quad(V(-0.024,0.588*H,mz-0.01), V(0.024,0.588*H,mz-0.01), V(0.020,0.572*H,mz+0.02), V(-0.020,0.572*H,mz+0.02), P.coalDk, 0.02);

    // EMBER EYES — small glowing sockets on the skull band
    const ez = headBase.z + 0.10, ey = 0.68*H;
    for(const sx of [-1,1]){
      const cx = sx*0.058;
      quad(V(cx-0.018,ey+0.012,ez), V(cx+0.018,ey+0.012,ez), V(cx+0.016,ey-0.014,ez+0.006), V(cx-0.016,ey-0.014,ez+0.006), P.ember, 0.02);
      quad(V(cx-0.010,ey+0.005,ez+0.004), V(cx+0.010,ey+0.005,ez+0.004), V(cx+0.008,ey-0.006,ez+0.008), V(cx-0.008,ey-0.006,ez+0.008), P.emberGlow, 0.02);
    }

    // small upright ears, pinned back in the wind of the gallop
    const crownY = hb[0].y + hb[0].rz - 0.006, ecz = hb[0].z - 0.02;
    for(const sx of [-1,1]){
      const cx = sx*0.05;
      const a = V(cx-0.020, crownY, ecz-0.04);
      const b = V(cx+0.018, crownY, ecz+0.01);
      const apex = V(cx+sx*0.01, crownY+0.075, ecz-0.06);   // swept back-and-up
      quad(a, b, apex, apex, P.coalDk, 0.03);
      quad(b, a, apex, apex, P.coal, 0.03);
    }
  }

  /* ===== FLAME MANE — the signature. Rides the neck topline, streaming BACK dead-horizontal
     (gallop wind), a value ladder near-white at the neck root fading to ember-dark at the
     trailing tip. Built as 5 tapered flame-tongue tubes staggered along the neck, each kicked
     backward and slightly up so the whole ribbon reads as one horizontal streak in silhouette. ===== */
  {
    const mane = [
      { t:0.00, len:0.34, r0:0.052, hex0:P.flameHot,  hex1:P.flameMid },
      { t:0.22, len:0.40, r0:0.058, hex0:P.flameMid,  hex1:P.flameLow },
      { t:0.44, len:0.44, r0:0.062, hex0:P.flameHot,  hex1:P.flameLow },
      { t:0.66, len:0.40, r0:0.054, hex0:P.flameMid,  hex1:P.flameTip },
      { t:0.86, len:0.30, r0:0.044, hex0:P.flameLow,  hex1:P.flameTip },
    ];
    function alongNeck(t){
      // lerp neckBase->neckMid->headBase along the topline, t in [0,1]
      if(t < 0.5){ const u=t/0.5; return V(0, neckBase.y+(neckMid.y-neckBase.y)*u+0.02, neckBase.z+(neckMid.z-neckBase.z)*u); }
      const u=(t-0.5)/0.5; return V(0, neckMid.y+(headBase.y-neckMid.y)*u+0.015, neckMid.z+(headBase.z-neckMid.z)*u);
    }
    for(const m of mane){
      const root = alongNeck(m.t);
      root.x = 0.008; // ride just off-center so it reads as draped, not a dorsal fin
      const rootIn = V(root.x*0.4, root.y+0.01, root.z);
      const tip = V(root.x*2.2, root.y + m.len*0.22, root.z - m.len);   // streams BACK, slight lift (wind)
      tube(rootIn, tip, m.r0, m.r0*0.18, 5, m.hex0, {phase:0});
      // second tongue, offset, carries the tip color for the ladder
      const tip2 = V(-root.x*1.6, root.y + m.len*0.14 - 0.03, root.z - m.len*0.82);
      tube(rootIn, tip2, m.r0*0.75, m.r0*0.14, 5, m.hex1, {phase:Math.PI/5});
    }
  }

  /* ===== LEGS — GALLOP EXTENSION. Hind pair thrown BACK driving off a high hock; front pair
     thrown FORWARD reaching. Unguligrade Z-zigzag preserved (stifle high/tucked ~0.55-0.65H,
     hock high/back ~0.30-0.35H) but the whole chain is rotated into the stride reach instead of
     the static plumb-line stand. Fetlocks carry small flame licks (signature touches the ground). */
  const hipX = 0.135, shX = 0.115;
  function legHind(sx, reach){
    // reach: +1 = trailing leg thrown back hard, -1 = leading hind leg still gathering under the body
    const hip    = V(sx*hipX, 0.88*H, T[0].z + 0.02);
    const stifle = V(sx*hipX, 0.60*H, T[0].z + 0.10 + 0.06*reach);         // tucked high, kicked with reach
    const hock   = V(sx*(hipX+0.02), 0.33*H, T[0].z - 0.30 - 0.22*reach);  // high, thrown back
    const fetlock= V(sx*(hipX+0.02), 0.10*H, T[0].z - 0.42 - 0.30*reach);
    const hoofP  = V(sx*(hipX+0.02), 0.02,   T[0].z - 0.44 - 0.32*reach);
    tube(hip, stifle, 0.115, 0.084, 7, P.coal, {phase:Math.PI/7});
    tube(stifle, hock, 0.074, 0.056, 7, P.coalDk, {phase:Math.PI/7});
    tube(hock, fetlock, 0.056, 0.040, 7, P.coalDk, {phase:Math.PI/7});
    tube(fetlock, hoofP, 0.032, 0.026, 6, P.hoof, {phase:0});
    footHoof(hoofP, sx, P.hoof);
    flameLick(fetlock, sx, reach);
  }
  function legFront(sx, reach){
    // reach: +1 = leading leg flung forward reaching, -1 = trailing front leg folded back under
    const sh    = V(sx*shX, 0.92*H, T[T.length-1].z + 0.14);
    const elbow = V(sx*shX, 0.58*H, T[T.length-1].z + 0.14 + 0.10*reach);
    const carpus= V(sx*shX, 0.30*H, T[T.length-1].z + 0.20 + 0.34*reach);
    const fetlock=V(sx*shX, 0.10*H, T[T.length-1].z + 0.24 + 0.48*reach);
    const hoofP = V(sx*shX, 0.02,   T[T.length-1].z + 0.25 + 0.52*reach);
    tube(sh, elbow, 0.102, 0.076, 7, P.coal, {phase:Math.PI/7});
    tube(elbow, carpus, 0.070, 0.052, 7, P.coalDk, {phase:Math.PI/7});
    tube(carpus, fetlock, 0.052, 0.038, 7, P.coalDk, {phase:Math.PI/7});
    tube(fetlock, hoofP, 0.030, 0.024, 6, P.hoof, {phase:0});
    footHoof(hoofP, sx, P.hoof);
    flameLick(fetlock, sx, reach);
  }
  function footHoof(hoofP, sx, hex){
    const y=hoofP.y, z=hoofP.z, x=hoofP.x, w=0.038;
    quad(V(x-w,y,z-w),V(x+w,y,z-w),V(x+w,y,z+w*1.3),V(x-w,y,z+w*1.3), hex, 0.02);
    quad(V(x-w,0.0,z+w*1.3),V(x+w,0.0,z+w*1.3),V(x+w,y,z+w*1.3),V(x-w,y,z+w*1.3), hex, 0.02);
  }
  function flameLick(fetlock, sx, reach){
    const base = V(fetlock.x, fetlock.y+0.01, fetlock.z);
    const tip = V(fetlock.x + sx*0.02, fetlock.y + 0.07, fetlock.z - 0.08*Math.sign(reach||1));
    tube(base, tip, 0.026, 0.006, 5, P.flameMid, {phase:0});
  }
  // hind: near leg (-1, sx left) driving back hard; far leg (+1) gathering under
  legHind(-1, 1.0);
  legHind( 1, -0.55);
  // front: near leg (-1) folded back under trailing; far leg (+1) flung forward reaching
  legFront(-1, -0.5);
  legFront( 1, 1.0);

  /* ===== TAIL — flame tail, base off the croup, streaming straight back horizontal in the wind
     (mirrors the mane's value ladder, closes the "unbroken flame line" spine-gesture sentence). */
  {
    const base = V(0, 0.72*H, T[0].z - 0.06);
    const mid  = V(0, 0.66*H, T[0].z - 0.38);
    const tip1 = V(0.03, 0.60*H, T[0].z - 0.68);
    const tip2 = V(-0.03, 0.56*H, T[0].z - 0.62);
    tube(base, mid, 0.05, 0.044, 6, P.flameHot, {phase:0});
    tube(mid, tip1, 0.044, 0.010, 5, P.flameMid, {phase:0});
    tube(mid, tip2, 0.038, 0.008, 5, P.flameLow, {phase:Math.PI/5});
  }
}
