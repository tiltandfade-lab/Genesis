/* dev/model-qa/creatures/rlm-gloom-flying-sword.js — the ANIMATED FLYING SWORD (shared render key
   "animated-flying-sword", Tiny Construct, CR 1/4). No ANATOMY-CANON family — an OBJECT, not a
   body: blade + guard + grip, hovering point-down. This bespoke chassis serves every realm's
   animate-blade reskin; the gloom entries riding it (data/realm-bestiary.js: "Grinning Poppet" —
   the haunted doll whose porcelain smile never changes, and "Splintered Marionette" — the
   self-cut puppet still bowing to an empty house) donate the GRIP-WRAPPING/PENNANT garnish (aged
   linen tatters, a bone-pale pommel knob nodding at the poppet's porcelain head) without turning
   the model into a literal doll — the core identity stays the object itself (MODEL-FOUNDRY law 4:
   correctness never sands character off, but here the "correctness" IS the object read).

   FEATURE CHECKLIST (the tri budget buys):
     1. BLADE — a long tapering four-sided prism from the crossguard down to the point, five
        stepped cross-sections (not a smooth cone) so the taper reads as forged steel with real
        stopping points, not a rubber wedge.
     2. SIGNATURE A — a BRIGHT edge-bevel running the full length of one blade face, distinctly
        lit against the dark steel body (law 3's high-value zone the whole read hangs on) —
        the gleam of a blade caught turning in dim light.
     3. Two asymmetric blade notches (the mid-sections bite in from alternating sides) — countable
        battle-damage, tris spent on expression not smoothing (law 1).
     4. CROSSGUARD — a squat tarnished-brass bar perpendicular to the blade, with two rivet studs
        at its ends (the "hilt has hardware" tell).
     5. GRIP — a wrapped haft (alternating light/dark wrap coils, spiraling slightly per the
        corkscrew pose) ending in a bone-pale knobbed pommel (the poppet-porcelain nod).
     6. SIGNATURE B — 7 tattered grip-wrapping streamers trailing off the pommel like a torn
        pennant, corkscrewed in alternating twist directions, graded lengths, pale-tipped so the
        signature carries its own value pop clear of the void (the specter-streamer lesson: never
        let the loud feature taper into near-black at the tip).

   POSE SENTENCE: wrenched mid-strike by an unseen hand, the blade cants ~35° off vertical with a
   slight corkscrew torque through the grip, point tracking down-and-forward as if driving into a
   lunge, hovering ~0.3u clear of its shadow-pool disc — never sheathed, never at rest.

   Whole-object grammar: one exported build fn, probe-lib primitives only, spine +z, ground y=0,
   no anchors. Tiny size, base disc r=0.28 (the will-o-wisp "thumbnail" convention, not the
   Small-creature r=0.32 body convention — there's no body here, just the object + its shadow). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildFlyingSword(){
  const P = {
    steel:0x8a8f94, steelDk:0x585d62,               // blade body — cool tarnished steel
    edge:0xeef1ee, edgeMid:0xc7ccc8,                 // SIGNATURE A — the bright bevel gleam
    brass:0x8a7a4a, brassDk:0x5c4f2e,                // crossguard — tarnished hardware
    rivet:0xb4a468,                                  // crossguard rivet studs
    wrapA:0x6b5a48, wrapB:0x4a3d30,                  // grip wrap coils — aged leather/linen
    pommel:0xd8d2ba, pommelDk:0xa89c78,              // bone-pale pommel knob — the poppet nod
    tatterA:0xb9b2a0, tatterA2:0x968f7c,             // SIGNATURE B — grave-linen pennant tatters
    tatterTip:0xe4ded0,                              // pale streamer tips — the second value pop
    shadow:0x140f1a, shadowTop:0x1d1626,             // base disc — the shadow-pool it hovers over
  };

  /* ---------- POSE FRAME — the blade axis IS the pose (law 5: pose is authored, not left neutral).
     g0 = crossguard center (blade base); TIP = the point, driving down-and-forward. The ~35deg
     cant off vertical + the dx offset (the corkscrew wrench) both live in these two points. ---------- */
  const g0  = V(0.02, 0.55, -0.03);
  const TIP = V(-0.07, 0.30, 0.14);
  const BLADE = new THREE.Vector3().subVectors(TIP, g0).normalize();
  const L = new THREE.Vector3().subVectors(TIP, g0).length();
  const up = V(0, 1, 0);
  const gu = new THREE.Vector3().crossVectors(up, BLADE).normalize();   // blade "width" axis
  const gv = new THREE.Vector3().crossVectors(BLADE, gu).normalize();   // blade "thickness" axis
  const along = (t) => g0.clone().addScaledVector(BLADE, t);
  const bl = (t, wA, wB, th) => {
    const c = along(t);
    return [
      c.clone().addScaledVector(gu, wA),
      c.clone().addScaledVector(gv, th),
      c.clone().addScaledVector(gu, -wB),
      c.clone().addScaledVector(gv, -th),
    ];
  };

  /* ---------- 1+2+3. BLADE — 5 stepped cross-sections, alternating-side notches, one bright
     bevel face carried the full length (SIGNATURE A). ---------- */
  const sections = [
    bl(0.00,      0.075, 0.075, 0.024),
    bl(0.22 * L,  0.066, 0.050, 0.020),   // notch bites the -gu side
    bl(0.42 * L,  0.050, 0.062, 0.017),   // notch bites the +gu side (asymmetric, law 1)
    bl(0.62 * L,  0.040, 0.034, 0.013),
    bl(0.82 * L,  0.022, 0.020, 0.008),
  ];
  for(let i = 0; i < sections.length - 1; i++){
    const a = sections[i], c = sections[i + 1];
    quad(a[0], a[1], c[1], c[0], P.edge, 0.05);       // the bevel face — always bright (SIGNATURE A)
    quad(a[1], a[2], c[2], c[1], P.steel, 0.06);       // near-side dark steel
    quad(a[2], a[3], c[3], c[2], P.steelDk, 0.06);     // far-side dark steel
    quad(a[3], a[0], c[0], c[3], P.steel, 0.06);       // near-side dark steel
  }
  capFan(sections.at(-1), TIP, P.edgeMid);             // the point itself catches the gleam too

  /* ---------- 4. CROSSGUARD — a squat tarnished-brass bar, perpendicular to the blade, seated
     just proud of the base so it doesn't fuse into the first blade section. ---------- */
  {
    const gc = g0.clone().addScaledVector(BLADE, -0.018);
    const gx = 0.105, gy = 0.020, gz = 0.030;
    const cnr = (a, b, c) => gc.clone().addScaledVector(gu, a * gx).addScaledVector(gv, b * gy).addScaledVector(BLADE, c * gz);
    quad(cnr(-1, -1, -1), cnr(1, -1, -1), cnr(1, 1, -1), cnr(-1, 1, -1), P.brassDk, 0.04);
    quad(cnr(1, -1, 1), cnr(-1, -1, 1), cnr(-1, 1, 1), cnr(1, 1, 1), P.brassDk, 0.04);
    quad(cnr(-1, -1, -1), cnr(-1, -1, 1), cnr(1, -1, 1), cnr(1, -1, -1), P.brass, 0.04);
    quad(cnr(-1, 1, -1), cnr(1, 1, -1), cnr(1, 1, 1), cnr(-1, 1, 1), P.brass, 0.04);
    quad(cnr(-1, -1, -1), cnr(-1, 1, -1), cnr(-1, 1, 1), cnr(-1, -1, 1), P.brass, 0.04);
    quad(cnr(1, -1, -1), cnr(1, -1, 1), cnr(1, 1, 1), cnr(1, 1, -1), P.brass, 0.04);
    // rivet studs at each end — cheap countable "hardware" detail
    blob(cnr(1, 0, 0).x, cnr(1, 0, 0).y, cnr(1, 0, 0).z, 0.014, 0.014, 0.014, P.rivet, 5, 3);
    blob(cnr(-1, 0, 0).x, cnr(-1, 0, 0).y, cnr(-1, 0, 0).z, 0.014, 0.014, 0.014, P.rivet, 5, 3);
  }

  /* ---------- 5. GRIP — a wrapped haft trailing back from the guard (opposite BLADE), 5
     alternating-color coils spiraling slightly per the corkscrew wrench, ending at POMMEL. ---------- */
  const gripBase = g0.clone().addScaledVector(BLADE, -0.02);
  const gripLen = 0.12;
  const POMMEL = gripBase.clone().addScaledVector(BLADE, -gripLen);
  {
    const coils = 5;
    let prev = gripBase;
    for(let i = 1; i <= coils; i++){
      const t = i / coils;
      const twistAng = t * 2.4;   // the corkscrew: each coil nudges around the grip axis
      const jitU = Math.cos(twistAng) * 0.006, jitV = Math.sin(twistAng) * 0.006;
      const next = gripBase.clone()
        .addScaledVector(BLADE, -gripLen * t)
        .addScaledVector(gu, jitU)
        .addScaledVector(gv, jitV);
      tube(prev, next, 0.040, 0.038, 6, (i % 2) ? P.wrapA : P.wrapB, { phase: twistAng });
      prev = next;
    }
  }
  // pommel knob — bone-pale, the poppet-porcelain-head nod, biggest single sphere on the model
  blob(POMMEL.x, POMMEL.y, POMMEL.z, 0.052, 0.048, 0.052, P.pommel, 8, 5);
  blob(POMMEL.x, POMMEL.y - 0.01, POMMEL.z, 0.030, 0.026, 0.030, P.pommelDk, 6, 3);

  /* ---------- 6. SIGNATURE B — 6 tattered grip-wrapping streamers trailing off the pommel like a
     torn pennant, corkscrewed in alternating directions, graded lengths, pale-tipped.
     R2 SELF-CORRECTION: R1's fix (widening the taper to clear the law-3 0.04u floor) pushed the
     streamers into a tight overlapping cluster that read as one fluffy blob, not distinct ribbons
     — a NEW silhouette failure (law 2) traded in for the old value failure. Fixed by (a) a much
     wider fan angle so the 6 ribbons visibly separate instead of bunching around one axis,
     (b) flattened elliptical cross-sections (opts.raz) so each ribbon stays a true FLAT cloth
     strip — wide enough to clear the floor, thin enough not to read as a solid mass — and
     (c) staggered root points around the pommel so the bases themselves don't merge into a knot. */
  {
    const trail = BLADE.clone().negate();   // streamers drag opposite the point's direction of travel
    const N = 6;
    for(let i = 0; i < N; i++){
      const ang = (i / N) * Math.PI * 2 + 0.35;
      const spread = 1.05 + 0.35 * ((i * 3) % 4) / 4;   // wide fan — separates the ribbons in silhouette
      const dir = trail.clone()
        .addScaledVector(gu, Math.cos(ang) * spread)
        .addScaledVector(gv, Math.sin(ang) * spread)
        .normalize();
      const len = 0.22 + 0.12 * ((i * 5) % 5) / 5;
      const twist = (i % 2) ? 0.05 : -0.042;
      const root = POMMEL.clone().addScaledVector(gu, Math.cos(ang) * 0.05).addScaledVector(gv, Math.sin(ang) * 0.05);
      const p0 = root;
      const p1 = root.clone().addScaledVector(dir, len * 0.35).addScaledVector(gu, twist * 0.4);
      const p2 = root.clone().addScaledVector(dir, len * 0.70).addScaledVector(gu, twist).addScaledVector(gv, -twist * 0.5);
      const p3 = root.clone().addScaledVector(dir, len).addScaledVector(gu, twist * 1.6).addScaledVector(gv, -twist * 0.8);
      const hexA = (i % 2) ? P.tatterA : P.tatterA2;
      // ribbon cross-section: wide face (>=0.04 floor) x a THIN raz — a flat strip, not a round cord.
      tube(p0, p1, 0.048, 0.038, 4, hexA, { raz: 0.016, rbz: 0.014 });
      tube(p1, p2, 0.038, 0.030, 4, hexA, { raz: 0.014, rbz: 0.012 });
      tube(p2, p3, 0.030, 0.026, 4, P.tatterTip, { raz: 0.012, rbz: 0.011, capB: { hex: P.tatterTip } });
    }
  }

  /* ---------- base disc — the shadow-pool it hovers ~0.3u clear of (Tiny thumbnail convention,
     will-o-wisp precedent: r=0.28, not the Small-body r=0.32). ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.28, 0.28, 12);
    const r2 = ring(V(0, 0.036, 0), V(0, 1, 0), 0.26, 0.26, 12);
    stitch([r1, r2], () => P.shadow);
    capFan(r2, V(0, 0.039, 0), P.shadowTop);
  }
}
