/* dev/model-qa/creatures/rlm-cosmic-piercer.js — the PIERCER landmark table (GEOMETRIC family,
   Medium), CR 1/4, realm cosmic, authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (foundry pilot, cosmic-w1 cell 4, port 5374).
   Core identity: the living stalactite — a non-Euclidean ambush lurker, wrong from every angle,
   that drops from a ceiling and impales. LAW-3 WARNING: the cosmic Creeper failed TWICE on
   dark-on-dark prisms (docs/MODEL-FOUNDRY.md evidence base) — this model keeps the stone body
   PALE with striated bands so it never repeats that failure; the eye and the striation both sit
   well over the 140 RGB high-value floor.

   FEATURE CHECKLIST (the ~1,300-1,600 budget buys):
     1. GEOMETRIC body — a tall asymmetric stone spike (inverted cone/icicle silhouette), faceted
        not smooth, built from stacked irregular rings that narrow hard toward the buried tip.
     2. SIGNATURE A — pale stone striations: alternating light/dark horizontal bands running the
        spike's length, the light bands pushed to a genuinely bright limestone value so the body
        clears the void floor on its own (no reliance on the eye alone for law 3).
     3. SIGNATURE B — the single lidless eye set near the tip-that-was-the-head end (now the
        UPPER end, since the spike has just landed point-down): oversized for the body, pale
        sclera + a slit pupil, the brightest single point in the piece.
     4. Fleshy foot: a soft pale-pink puckered ring at the base of the spike (the snail-foot),
        from which three flanges splay.
     5. Three snail-foot flanges gripping air — short curled fleshy tongues jutting from the foot
        ring at uneven angles/lengths, mid-flex (not neatly symmetric), continuing the "just
        landed, still settling" read.
     6. The buried point: the spike's actual tip is sunk into the disc at a slight off-vertical
        angle (not dead plumb) — the impact is the pose.

   POSE SENTENCE: the just-landed quiver — the spike's point is driven into the disc at a slight
   angle off true vertical, the whole body caught in the half-second after impact, base-up with
   the fleshy foot and its three flanges still splayed and gripping at open air as it settles, the
   single eye snapped wide.

   SPINE-GESTURE SENTENCE (per ANATOMY-CANON POSE-ANATOMY, applied to a non-humanoid frame): the
   long axis of the spike IS the gesture line — it runs from the buried tip up through a shallow
   lean, so the axis is a single tilted line rather than a dead-plumb column; this is the
   GEOMETRIC-family analog of the spine curve (there is no pelvis/skull, so the "lean" carries the
   law instead of a limb-joint chain). No articulated limbs exist on this frame (a stone spike has
   none) so POSE-ANATOMY's elbow/shoulder rules don't apply; the three foot-flanges take their
   place as the only mobile "limb" analogs and are deliberately uneven/mid-flex, never symmetric,
   to avoid the at-attention failure. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildPiercer(){
  const P = {
    stoneLt:  0xc9c2ae,   // pale striation band — the law-3 high-value body zone
    stoneMd:  0x9a9280,
    stoneDk:  0x655e4f,   // darkest band, still well clear of the (10,9,8) void
    tip:      0x4a4438,
    foot:     0xc98a92,   // fleshy pink foot ring
    footDk:   0x9c5e66,
    flange:   0xd6a0a6,
    eyeWhite: 0xece4d4,
    eyePupil: 0x120f0c,
    glow:     0xe8dcb8,
  };

  // Tilt: the whole spike leans off true-vertical — the gesture line for a limbless frame.
  const lean = 0.16;              // x-offset per unit y (slight off-vertical angle, per pose sentence)
  const twist = Math.PI / 11;     // per-band rotation so facets read as faceted, not lathed

  // ---- SIGNATURE A: the faceted, striated spike body — stacked irregular rings narrowing to
  // the buried tip. y=0 band is the buried point (slight negative reach handled by capFan only,
  // ring stays >=0 so bbox floor holds); y climbs to the foot ring at the top/base end.
  const bands = [
    { y: 0.00, rx: 0.015, rz: 0.015, hex: P.tip   },   // buried point, driven into the disc
    { y: 0.09, rx: 0.045, rz: 0.038, hex: P.stoneDk },
    { y: 0.20, rx: 0.085, rz: 0.070, hex: P.stoneLt },  // bright striation band 1
    { y: 0.32, rx: 0.075, rz: 0.095, hex: P.stoneDk },
    { y: 0.46, rx: 0.125, rz: 0.100, hex: P.stoneLt },  // bright striation band 2
    { y: 0.60, rx: 0.105, rz: 0.135, hex: P.stoneMd },
    { y: 0.76, rx: 0.155, rz: 0.125, hex: P.stoneLt },  // bright striation band 3 (widest, near eye)
    { y: 0.90, rx: 0.135, rz: 0.150, hex: P.stoneMd },
    { y: 1.02, rx: 0.110, rz: 0.115, hex: P.stoneDk },  // shoulders in toward the foot neck
  ];
  const bandsLean = bands.map(b => ({ y: b.y, rx: b.rx, rz: b.rz, hex: b.hex, cx: lean * (b.y - 0.55) * 0.55 }));
  stack(bandsLean, 9, { phase: twist });

  // SIGNATURE facet spikes: real 3D pointed facets (ring+capFan, like the crystal-shard technique)
  // jutting OFF the surface at contradictory angles so the silhouette itself is jagged and
  // non-Euclidean, not a lathed cone with a painted-on line (law 1+2: the outline must change).
  const F = 8;
  for(let i=0;i<F;i++){
    const ang = i/F*Math.PI*2 + 0.3;
    const by = 0.68 + 0.10*((i*3)%3)/3;                 // scattered heights up the widest zone
    const bxc = lean*(by-0.55)*0.55;
    const c = Math.cos(ang), s = Math.sin(ang);
    const outLen = 0.13 + 0.05*(i%2);                    // how far the facet juts off the body
    const base = V(bxc + c*0.135, by, s*0.11);
    const tip  = V(bxc + c*(0.135+outLen), by + 0.05*(i%2?1:-1), s*(0.11+outLen*0.85));
    const axis = new THREE.Vector3(tip.x-base.x, tip.y-base.y, tip.z-base.z).normalize();
    const baseRing = ring(base, axis, 0.055, 0.03, 4, i*0.7);
    const hex = (i%2) ? P.stoneLt : P.stoneMd;
    capFan(baseRing, tip, hex);
    capFan(baseRing, V(bxc + c*0.09, by, s*0.07), P.stoneDk, true);   // seat the facet into the body
  }
  // a lower ring of smaller facet spikes so the jaggedness reads down the whole length, not just
  // the widest band (still countable features, per law 1 — never smoothing filler).
  const F2 = 6;
  for(let i=0;i<F2;i++){
    const ang = i/F2*Math.PI*2 + 0.9;
    const by = 0.38 + 0.06*(i%2);
    const bxc = lean*(by-0.55)*0.55;
    const c = Math.cos(ang), s = Math.sin(ang);
    const outLen = 0.08;
    const base = V(bxc + c*0.085, by, s*0.075);
    const tip  = V(bxc + c*(0.085+outLen), by + 0.03*(i%2?-1:1), s*(0.075+outLen*0.85));
    const axis = new THREE.Vector3(tip.x-base.x, tip.y-base.y, tip.z-base.z).normalize();
    const baseRing = ring(base, axis, 0.035, 0.02, 4, i*0.5);
    const hex = (i%2) ? P.stoneMd : P.stoneDk;
    capFan(baseRing, tip, hex);
  }

  // ---- SIGNATURE B: the single lidless eye, set on the FRONT face near the top (the
  // tip-that-was-the-head), oversized, pale sclera + dark slit pupil, wide open — the brightest,
  // most forward-facing point in the piece so it reads clean against the pale stone, not buried
  // under the foot ring above it.
  const eyeY = 0.87, eyeX = lean*(eyeY-0.55)*0.55, eyeZ = 0.155;
  blob(eyeX, eyeY, eyeZ, 0.125, 0.105, 0.05, P.eyeWhite, 8, 5);
  quad(V(eyeX-0.014, eyeY+0.065, eyeZ+0.045), V(eyeX+0.014, eyeY+0.065, eyeZ+0.045),
       V(eyeX+0.011, eyeY-0.06, eyeZ+0.04), V(eyeX-0.011, eyeY-0.06, eyeZ+0.04), P.eyePupil, 0.02);
  blob(eyeX-0.035, eyeY+0.05, eyeZ+0.055, 0.024, 0.024, 0.018, P.glow, 4, 3);   // catch-light glint

  // ---- Fleshy foot ring at the base/top end (the snail-foot the spike stands on when upright;
  // here it's the trailing end still gripping open air mid-settle). Kept LOW and flat so it
  // doesn't read as a cap/hood sitting on top of the eye.
  const footY = 1.05, footX = lean*(footY-0.55)*0.55;
  const fr = ring(V(footX, footY, 0), new THREE.Vector3(0,1,0), 0.125, 0.125, 8, 0.2);
  const fr2 = ring(V(footX, footY+0.035, 0), new THREE.Vector3(0,1,0), 0.09, 0.09, 8, 0.2);
  stitch([fr, fr2], () => P.foot);
  capFan(fr2, V(footX, footY+0.055, 0), P.footDk);

  // ---- Three snail-foot flanges, uneven lengths, spread wide and mostly HORIZONTAL/outward
  // (gripping open air, not curling up into ears) — deliberately uneven per the pose sentence so
  // it never reads as a symmetric tripod or a pair of ears.
  const flangeSpecs = [
    { ang: 0.3,  len: 0.19, out: 1.0,  droop: 0.02 },
    { ang: 2.35, len: 0.14, out: 0.85, droop: -0.10 },
    { ang: 4.5,  len: 0.22, out: 0.95, droop: 0.06 },
  ];
  for(const fsg of flangeSpecs){
    const c = Math.cos(fsg.ang), s = Math.sin(fsg.ang);
    const b0 = V(footX + c*0.12, footY+0.01, s*0.12);
    const b1 = V(footX + c*(0.12+fsg.len*0.6)*fsg.out, footY+0.01+fsg.droop*0.5, s*(0.12+fsg.len*0.6)*fsg.out);
    const b2 = V(footX + c*(0.12+fsg.len)*fsg.out, footY+0.01+fsg.droop, s*(0.12+fsg.len)*fsg.out);
    tube(b0, b1, 0.05, 0.034, 6, P.flange, { phase: fsg.ang });
    tube(b1, b2, 0.034, 0.014, 6, P.flange, { phase: fsg.ang, capB: { hex: P.footDk } });
  }
}
