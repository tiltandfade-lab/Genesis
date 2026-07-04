/* dev/model-qa/creatures/mon-yochlol.js — the YOCHLOL (bespoke, Medium demon in melting form).
   The bestiary yochlol is a shapeshifting handmaiden of the Spider Queen; this model captures its
   default "true" melting-ooze form: a slumped PILLAR of drooping ochre-yellow flesh/wax, several
   limp TENTACLES trailing off the mass, scattered dark EYE RECESSES (sockets, not painted quads)
   pocking the surface, and a hint of a downturned maw low on the front. Whole-object grammar: one
   function, one merged geometry frame, no anchors, no part-object transforms — authored directly
   in world space via probe-lib primitives (same pattern as mon-lizard.js's landmark spine, this
   creature's stacked-blob torso borrows mon-snake.js's ring/stitch loft habits). NO eye quads —
   eyes are dark socket recesses (small inset rings), per house ruling. VS-desaturated ochre/wax
   palette, mottled and drippy. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildYochlol(){
  /* ---------- PALETTE (VS desaturated — dirty ochre/wax, dark sockets, dusky drip) ---------- */
  const P = {
    ooze:0x8a7638, oozeDk:0x655324, oozeLt:0x9c8848,      // ochre-yellow melting flesh
    mottleA:0x76642e, mottleB:0x8f7c3e,                    // mottled surface patches
    wax:0x6e5c2a, waxDk:0x4c3f1c,                          // waxy slumped folds (darker, glossier read)
    socket:0x241d10, socketDk:0x110d08,                    // dark eye-socket recesses
    maw:0x1c150b, tongueDk:0x4a2418,                       // hint of a downturned maw
    drip:0x9c8848, dripDk:0x584a20,                        // drippy tendrils off the mass
    tentacle:0x736024, tentacleDk:0x4e4119,                // drooping tentacles
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARK SPINE — a slumped vertical pillar, base wide, rising then hunching
     forward at the crown (the "melting" lean). Stays within the r=0.42 disc: rise is mostly +y,
     only a modest forward/side sprawl for the tentacles/folds. ---------- */
  const S = {
    base:   V(0, 0.045, 0.00),
    lower:  V(0.015, 0.20,  0.02),
    waist:  V(0.030, 0.42,  0.04),
    upper:  V(0.010, 0.66, -0.01),
    shoulder:V(-0.015, 0.86, -0.05),
    crown:  V(-0.045, 1.02, -0.10),   // leans slightly back+up, melted/hunched crown
  };

  /* ---------- MAIN MASS — one continuous loft, wide slumped base narrowing then bulging again
     near the shoulder before the hunched crown (an uneven, melting silhouette, not a clean cone). */
  tube(S.base,   S.lower, 0.300, 0.280, 10, P.ooze,    {phase:Math.PI/10, capA:{hex:P.oozeDk, lift:0.015}});
  tube(S.lower,  S.waist, 0.280, 0.230, 10, P.mottleA, {phase:Math.PI/10});
  tube(S.waist,  S.upper, 0.230, 0.260, 10, P.ooze,    {phase:Math.PI/10});      // slumped bulge
  tube(S.upper,  S.shoulder, 0.260, 0.195, 9, P.mottleB, {phase:Math.PI/9});
  tube(S.shoulder, S.crown, 0.195, 0.110, 8, P.oozeDk, {phase:Math.PI/8, capB:{hex:P.waxDk, lift:0.02}});

  /* ---------- WAXY SLUMPED FOLDS — a few drooping wax-fold quads down the front/side, the
     "melting" surface detail (thick drips clinging to the pillar, not separate geometry). ---------- */
  {
    const folds = [
      [V(-0.18,0.62,0.16), V(-0.10,0.60,0.20), V(-0.12,0.30,0.16), V(-0.20,0.32,0.13)],
      [V( 0.14,0.74,0.14), V( 0.22,0.70,0.10), V( 0.20,0.42,0.08), V( 0.12,0.46,0.11)],
      [V(-0.04,0.90,-0.16), V( 0.06,0.88,-0.18), V( 0.05,0.62,-0.14), V(-0.05,0.64,-0.13)],
    ];
    for(const f of folds) quad(f[0], f[1], f[2], f[3], P.wax, 0.06);
  }

  /* ---------- EYE RECESSES — scattered dark socket dimples pocking the mass (inset rings, NOT
     painted quads — small dark rings sunk slightly into the surface, per house ruling). ---------- */
  {
    const sockets = [
      {c:V(0.20, 0.56, 0.20), n:V(0.75,0.05,0.66)},
      {c:V(-0.19,0.50, 0.17), n:V(-0.70,0.0,0.71)},
      {c:V(0.08, 0.80, 0.16), n:V(0.35,0.25,0.90)},
      {c:V(-0.12,0.34, 0.24), n:V(-0.35,-0.1,0.93)},
      {c:V(0.02, 0.95,-0.06), n:V(0.10,0.55,-0.83)},
    ];
    for(const s of sockets){
      const axis = s.n.clone().normalize();
      const rim = ring(s.c, axis, 0.034, 0.034, 6, 0.3);
      const pit = s.c.clone().addScaledVector(axis, -0.02);   // sunk INTO the mass
      capFan(rim, pit, P.socketDk);
      // a thin dark rim ring so the socket reads as a recess, not a flat dot
      const rim2 = ring(s.c.clone().addScaledVector(axis,0.004), axis, 0.040, 0.040, 6, 0.3);
      stitch([rim2, rim], ()=>P.socket);
    }
  }

  /* ---------- MAW HINT — a small downturned dark crease low on the front of the mass. ---------- */
  {
    const m0 = V(-0.10, 0.30, 0.255);
    const m1 = V( 0.10, 0.30, 0.255);
    const m2 = V( 0.06, 0.24, 0.245);
    const m3 = V(-0.06, 0.24, 0.245);
    quad(m0, m1, m2, m3, P.maw, 0.05);
    quad(m3, m2, V(0.03,0.205,0.24), V(-0.03,0.205,0.24), P.tongueDk, 0.05);
  }

  /* ---------- DROOPING TENTACLES — several limp tendrils trailing off the mass at different
     heights/angles, sagging down toward the base (gravity-melt read). Each a short tapering tube
     path with a slack downward droop, kept inside the disc footprint. ---------- */
  {
    const droop=(root, dir, len, r0, hex)=>{
      const d = dir.clone().normalize();
      const mid = root.clone().addScaledVector(d, len*0.5).add(V(0, -len*0.35, 0));
      const tip = root.clone().addScaledVector(d, len*0.85).add(V(0, -len*0.85, 0));
      tube(root, mid, r0, r0*0.6, 6, hex, {phase:Math.PI/6});
      tube(mid, tip, r0*0.6, r0*0.18, 6, hex===P.tentacle?P.tentacleDk:P.dripDk,
           {phase:Math.PI/6, capB:{hex:hex===P.tentacle?P.tentacleDk:P.dripDk, lift:0.006}});
    };
    droop(V( 0.24,0.58,0.10), V( 0.6, -0.2, 0.5), 0.34, 0.045, P.tentacle);
    droop(V(-0.26,0.50,0.08), V(-0.55,-0.2, 0.55), 0.32, 0.042, P.tentacle);
    droop(V( 0.16,0.86,-0.10), V( 0.4, -0.3,-0.55), 0.30, 0.036, P.tentacle);
    droop(V(-0.10,0.92,-0.14), V(-0.25,-0.35,-0.7), 0.28, 0.030, P.drip);
    droop(V( 0.02,0.36, 0.26), V( 0.15,-0.6, 0.55), 0.15, 0.028, P.drip);   // shortened + raised so the drip tip stays on the disc (bbox min.y gate)
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
