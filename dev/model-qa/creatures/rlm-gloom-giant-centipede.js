/* dev/model-qa/creatures/rlm-gloom-giant-centipede.js — the GIANT CENTIPEDE landmark table (ARTHROPOD
   family, Small, CR 1/2, realm gloom), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (2026-07-08 foundry pilot, gloom-w2 cell 6). Core identity: the render key "giant-centipede"
   (frame:"giant-centipede" in data/realm-bestiary.js — the vent-splice bugs and static-touched
   vermin all ride this chassis narratively). Bespoke to: a pale root-cellar centipede fattened on
   offerings left for something worse.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. ARTHROPOD segmented+pinched anatomy (per ANATOMY-CANON) taken to its centipede extreme —
        9 countable body segments, each a plate loft PINCHED at a narrow waist ring before the next
        plate begins (the constriction IS the read, repeated 9 times instead of the family's usual
        2-3 masses — that repetition is the species tell).
     2. SIGNATURE — the questing lifted front: the front third (last 3 segments) peels up off the
        ground in a rising S-curve while the rear 6 stay in a low ground-hugging travel-curve — the
        one loud exaggerated pose beat that reads even in silhouette as "something reared up to
        look at you," not a flat crawling line.
     3. Paired legs, knees peaking ABOVE the body line per the family's insect-leg tell (femur
        angles up-and-out past the body, tibia/tarsus bends back down to the ground) — 7 pairs (14
        legs) along the mid-body, enough to read "many-legged" without eating the whole budget.
     4. Antennae spread wide off the head, forcipules (venom claws) open and hooking down from
        under the jaw — the two mouth-end features DIRECTION calls out by name.
     5. Value contrast (law 3) — a continuous pale belly-band ribbon running the ventral length
        against dark segmented back plates; the venom-claw tips carry a small toxin-glint accent.
     6. Small wedge head continuing the neck's rising curve, narrowing to a blunt snout past the
        antennae roots.

   POSE SENTENCE: the questing rear — front third lifted clean off the ground in a rising S, head
   snapped up and forward, antennae fanned wide and forcipules cracked open to taste the air, while
   the rear six segments stay low in a gentle side-to-side travel-curve, legs mid-scuttle — never a
   flat resting crawl, always the moment it catches a scent and rears to follow it.

   Whole-object grammar: one function, one geometry frame, no anchors, ONE consistent world coordinate
   frame throughout (no local pt()-offset helper mixed with raw V() points — the wave-1 coordinate-
   frame incident). Spine +z (front), up +y, ground y=0. Imported by ps1-sheet.html
   (SETS['gloom-w2'], cell 6, fn buildGiantCentipede). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGiantCentipede(){
  /* ---------- PALETTE (pale root-cellar register: dark segmented back plates carry the countable-
     segment read, a pale flank band + pale antennae/leg tips carry law 3's value contrast). ---- */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's whole body (segLt 0x565034 down to segDk
     0x2e2b1c) sat within a few dozen RGB steps of the ~0x0a0908 void clear color — at 1/3-res +
     dither the entire torso dissolved into background noise (only one antenna and two glint dots
     survived; law-3 failure, the exact Creeper/vampire-spawn-r1 trap). Every body/leg/head tone
     lifted substantially. The belly ribbon ALSO never appeared: at the sheet's actual 30°-elevation
     top-down camera, a strictly ventral (straight-under) strip is entirely occluded by the body
     mass above it. Replaced with a pair of lateral FLANK bands (both sides, riding low on the
     silhouette edge) — visible from the 30°-elev/45°-yaw camera the way a true belly strip isn't. */
  const P = {
    segLt: 0x8c8256, segMid: 0x6b6440, segDk: 0x4a4530,        // dorsal plate bands, lifted well clear of the void
    belly: 0xf0e2b8, bellySh: 0xd8c398,                         // pale flank band — the signature high-value zone (now camera-visible)
    leg: 0x6b6440, legDk: 0x4a4530, footPale: 0xf0e2b8,         // legs match the lifted plates, pale tarsus tips carry a second small contrast beat
    head: 0x8c8256, headDk: 0x6b6440,
    antenna: 0xb0a473, antennaTip: 0xf0e2b8,
    claw: 0x453d28, clawGlint: 0xe0aa48,                        // forcipules — dark chitin (still lifted clear of void), toxin-glint tip
    eye: 0x1c140c, eyeGlint: 0xf0e2b8,
    disc: 0x1c1712, discTop: 0x241f18,
  };

  /* ---------- SPINE PATH — 9 explicit segment centers, one consistent world frame (no local
     pt() helper). Rear 6 (i=0..5) stay low in a gentle side-to-side travel-curve; front 3
     (i=6..8) peel up in a rising S (law 5 — the questing pose). rx/rz taper fat mid-body, thin
     at both the tail tip and the neck root. ---------- */
  /* R2-CRITIC: r1's segments (rx 0.040-0.074) filled too little of the frame at this camera's
     fixed zoom — the whole body read as a thin indistinct string next to the antenna. "Fattened
     on offerings" (flavor line) licenses a bulkier read, so all segment radii are scaled ~1.5x —
     the pinch/plate geometry is unchanged, only the body's girth grows, which is exactly what
     makes the countable-segment silhouette (law 1/2) legible at a squint. */
  const SEG = [
    { x: 0.000,  y: 0.032, z: -0.300, rx: 0.063, rz: 0.057, hex: P.segDk },  // 0 tail tip
    { x: 0.020,  y: 0.034, z: -0.230, rx: 0.090, rz: 0.080, hex: P.segLt },  // 1
    { x: 0.012,  y: 0.036, z: -0.158, rx: 0.105, rz: 0.092, hex: P.segMid }, // 2
    { x: -0.014, y: 0.038, z: -0.083, rx: 0.111, rz: 0.096, hex: P.segLt },  // 3 fattest
    { x: -0.022, y: 0.041, z: -0.006, rx: 0.107, rz: 0.093, hex: P.segMid }, // 4
    { x: -0.009, y: 0.046, z: 0.068,  rx: 0.098, rz: 0.084, hex: P.segLt },  // 5 — last rear segment
    { x: 0.012,  y: 0.078, z: 0.132,  rx: 0.087, rz: 0.075, hex: P.segMid }, // 6 — lift begins
    { x: 0.030,  y: 0.150, z: 0.180,  rx: 0.075, rz: 0.065, hex: P.segLt },  // 7 — rising fast
    { x: 0.032,  y: 0.228, z: 0.212,  rx: 0.060, rz: 0.053, hex: P.segMid }, // 8 — neck root
  ];

  /* build 9 plate rings + 8 pinch rings between them (17 rings total, 16 stitched transitions —
     the repeated constriction IS the arthropod family tell, taken to its centipede extreme). */
  const N8 = 8, PH = Math.PI / N8;
  const allRings = [];
  const colorByBand = [];
  for(let i = 0; i < SEG.length; i++){
    const s = SEG[i];
    allRings.push(ring(V(s.x, s.y, s.z), V(0,1,0), s.rx, s.rz, N8, PH));
    if(i < SEG.length - 1){
      const s2 = SEG[i+1];
      colorByBand.push(s.hex); // plate[i] -> pinch[i]
      const mx = (s.x + s2.x) * 0.5, my = (s.y + s2.y) * 0.5, mz = (s.z + s2.z) * 0.5;
      const mrx = (s.rx + s2.rx) * 0.5 * 0.52, mrz = (s.rz + s2.rz) * 0.5 * 0.48;
      allRings.push(ring(V(mx, my, mz), V(0,1,0), mrx, mrz, N8, PH));
      colorByBand.push(P.segDk); // pinch[i] -> plate[i+1]
    }
  }
  stitch(allRings, (b) => colorByBand[b]);
  // tail cap (small, tucked point) + neck-root cap (feeds into the head loft below)
  capFan(allRings[0], V(SEG[0].x, SEG[0].y - 0.006, SEG[0].z - 0.024), P.segDk, true);

  /* ---------- FLANK BANDS — a pale band running low along BOTH sides of the body (R2 self-
     correction: a strictly ventral strip sits entirely under the body mass and is occluded from
     the sheet's actual 30°-elev/45°-yaw camera; riding the flank instead puts it on the visible
     silhouette edge). Chain of flat quads per side, ~0.045u tall to clear the 0.04u feature
     floor — the law-3 high-value zone against the dark dorsal plates (DIRECTION: "pale belly-band
     segments vs darker back plates"). ---------- */
  {
    const flankPt = (s, side) => V(s.x + side * s.rx * 0.88, s.y - s.rz * 0.30, s.z);
    const h = 0.034; // band half-height (0.068u tall — widened with the r2 body fattening, still clears the feature floor)
    // R2-CRITIC fix: clamp the band's lower edge so the fattened SEG.rz no longer drags it below
    // the bbox min.y>=-0.01 gate on the low tail segments (r2's first pass dipped to -0.0256).
    const loY = (y) => Math.max(y - h, 0.004);
    for(const side of [-1, 1]) for(let i = 0; i < SEG.length - 1; i++){
      const a = flankPt(SEG[i], side), b = flankPt(SEG[i+1], side);
      const hex = (i % 2) ? P.belly : P.bellySh;
      quad(V(a.x, loY(a.y), a.z), V(a.x, a.y + h, a.z), V(b.x, b.y + h, b.z), V(b.x, loY(b.y), b.z), hex, 0.05);
    }
  }

  /* ---------- HEAD — continues the neck's rising curve past segment 8, narrowing to a blunt
     wedge snout. Small 3-band loft, same single world frame. ---------- */
  const headBands = [
    { y: 0.255, cx: 0.034, cz: 0.238, rx: 0.047, rz: 0.043, hex: P.headDk },
    { y: 0.278, cx: 0.036, cz: 0.270, rx: 0.055, rz: 0.049, hex: P.head },   // widest — the skull mass
    { y: 0.288, cx: 0.036, cz: 0.308, rx: 0.034, rz: 0.034, hex: P.headDk }, // blunt snout
  ];
  {
    const hn = 8, hph = Math.PI / hn;
    const hRings = headBands.map(b => ring(V(b.cx, b.y, b.cz), V(0,1,0), b.rx, b.rz, hn, hph));
    stitch(hRings, (b) => headBands[b].hex);
    capFan(hRings[hRings.length - 1], V(0.036, 0.286, 0.330), P.headDk);
  }

  /* tiny paired eyes on the head sides — cheap legibility beat, not a budget spend */
  for(const s of [-1, 1]){
    const ex = 0.036 + s * 0.040, ey = 0.280, ez = 0.278;
    blob(ex, ey, ez, 0.010, 0.010, 0.008, P.eye, 5, 3);
    blob(ex + s * 0.004, ey + 0.003, ez + 0.006, 0.004, 0.004, 0.004, P.eyeGlint, 4, 2);
  }

  /* ---------- ANTENNAE — spread wide off the head, forward-and-out, two tapering segments per
     side, pale tips (DIRECTION: "antennae spread"). ---------- */
  /* R2-CRITIC: r1's tips (s*0.220, z=0.400) sailed ~0.08u past the disc's own edge (r=0.34) —
     at the sheet camera it read as a single stark white blade/sword flying off-canvas, not a
     paired feeler on a fattened body. Pulled the whole antenna in to land near the disc boundary
     (proportionate overhang, the way a real antenna clears the head) instead of past it. */
  /* R2b (round 2 of the critic pass): r2a's single straight taper still read as one bright blade
     rather than a paired feeler — shortened further, value pulled down to the same tone as the
     flank band (not brighter than the body's own signature), and the mid joint bent UP more than
     OUT so the line breaks visibly rather than reading as one dead-straight edge. */
  for(const s of [-1, 1]){
    const root = V(0.036 + s * 0.026, 0.284, 0.298);
    const mid  = V(0.036 + s * 0.052, 0.322, 0.330);
    const tip  = V(0.036 + s * 0.098, 0.336, 0.352);
    tube(root, mid, 0.015, 0.009, 4, P.antenna);
    tube(mid, tip, 0.009, 0.005, 4, P.bellySh, { capB: { hex: P.bellySh } });
  }

  /* ---------- FORCIPULES — venom claws hooking down and OPEN (outward) from under the jaw
     (DIRECTION: "forcipules open"). Dark chitin, small toxin-glint accent at the tip. ---------- */
  for(const s of [-1, 1]){
    const root = V(0.034 + s * 0.030, 0.250, 0.270);
    const mid  = V(0.034 + s * 0.062, 0.208, 0.302);
    const tip  = V(0.034 + s * 0.092, 0.188, 0.322);   // hooks outward — "open"
    tube(root, mid, 0.019, 0.013, 4, P.claw);
    tube(mid, tip, 0.013, 0.005, 4, P.claw, { capB: { hex: P.clawGlint } });
  }

  /* ---------- LEGS — 7 pairs (14 legs), attached at segments 1..7, insect-family knee-above-
     body tell: femur angles UP-and-OUT past the segment's own radius, tibia/tarsus bends sharply
     back DOWN to the ground. Alternating dark/mid tones + a pale tarsus tip for a second small
     value beat, per law 3. ---------- */
  const legSegIdx = [1, 2, 3, 4, 5, 6, 7];
  legSegIdx.forEach((idx, k) => {
    const seg = SEG[idx];
    for(const s of [-1, 1]){
      const hip   = V(seg.x + s * seg.rx * 0.92, seg.y, seg.z);
      const knee  = V(seg.x + s * (seg.rx + 0.115), seg.y + 0.095, seg.z + (k % 2 ? 0.012 : -0.012));
      // ankle y=0.026 (not 0.008) — bake-check found the tarsus ring itself (not just its cap)
      // dips below its own center when the knee->ankle axis tilts steep-but-not-perfectly-vertical
      // (n=4 ring points land off-axis); this clearance keeps that dip clear of the bbox
      // min.y>=-0.01 gate while still reading as a planted foot.
      const ankle = V(seg.x + s * (seg.rx + 0.060), 0.026, seg.z + (k % 2 ? -0.018 : 0.018));
      tube(hip, knee, 0.022, 0.016, 4, k % 2 ? P.leg : P.legDk);
      tube(knee, ankle, 0.016, 0.007, 4, k % 2 ? P.legDk : P.leg, { capB: { hex: P.footPale, lift: 0 } });
    }
  });

  /* ---------- base disc (Small footprint — sized for the elongated body, ~0.63u tail-to-snout,
     wider than the Tiny cat/raven discs but well under the Medium 0.42-radius humanoid pattern
     given the length; radius picked so the lifted front + tail both sit inside the tile). ------- */
  {
    const r1 = ring(V(0.01, 0.002, -0.02), V(0, 1, 0), 0.340, 0.340, 16);
    const r2 = ring(V(0.01, 0.045, -0.02), V(0, 1, 0), 0.320, 0.320, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0.01, 0.048, -0.02), P.discTop);
  }
}
