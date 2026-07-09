/* dev/model-qa/creatures/rlm-shared-swarm-of-larvae.js — SWARM OF LARVAE (cross-realm shared body,
   Large, CR 3). THE BOIL: a low wide mound of fat parasitic hive-nymph grubs boiling over one
   another, ground-hugging counterpart to the bat vortex (sky) and rat knot (fused ring).

   FEATURE CHECKLIST (what the tri budget buys):
     1. 9 individual pale grub bodies, each a countable curled sausage-loft (law 1: tris spent on
        countable grubs, not smoothing).
     2. A dark head-capsule dot per grub — small blind cone/nub, chitin-dark against the pale hide
        (the signature high-value contrast, law 3: pale body >=140 RGB reads over the dark void).
     3. Varied curl angles per grub (tight C-curl, loose S-curl, near-straight) so the mass reads
        as many bodies boiling, not one blob (law 1/2).
     4. Low wide mound silhouette (Large footprint, squat stacked layers) with THREE grubs cresting
        the top of the pile and ONE reared near-vertical — the boil-over toward the viewer (law 5).
     5. Segment ridges (banding) on each grub body via alternating pale/pale-shadow tube bands —
        cheap tris that read as larval segmentation without adding true geometry cost.
     6. Slick chrome-sick sheen implied by a pale-cream base + pale-highlight top stripe per grub
        (value ladder puts light on the grub mass itself, per law 3/4).

   POSE SENTENCE: the mound mid-surges toward the viewer — a low boiling pile of grubs crawling
   over and under each other, three cresting the near-top edge and pitching forward, one throwing
   its blind head straight up in a rearing arc, the rest churning low and wide beneath them.

   ANATOMY (SWARM family — no single spine; each grub is its own short segmented tube-loft, curled
   via a bent 3-point path rather than a straight line, blind head-capsule at the leading end, no
   limbs — parasitic hive-nymph, legless). Cross-realm shared body: neutral pale-cream/chrome-sick
   hide, no single realm's palette gimmick.

   Whole-object grammar: one exported build fn, probe-lib primitives only, ground y=0, no anchors,
   no cross-imports besides probe-lib. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildSwarmOfLarvae(){
  const P = {
    hide:    0xd9cfa8,   // pale sickly cream — the high-value body mass (law 3, >=140 RGB)
    hide2:   0xcbcbb0,   // coat variant — cooler pale (grub individuality, law 1/2)
    hide3:   0xe0c9a0,   // coat variant — warmer pale
    hideHi:  0xece3bf,   // pale highlight stripe (top of each grub, chrome-sick sheen)
    hideSh:  0xb3a884,   // segment-ridge shadow band
    hideDk:  0x8f8567,   // deep gap/underside where grubs overlap
    cap:     0x2b241c,   // dark blind head-capsule (the countable "dot" signature)
    capRim:  0x453a2c,   // faint rim so the capsule reads as a form, not a hole
    disc:    0x453f2f,
    discTop: 0x554d38,
  };

  /* one grub: a short curled 4-segment tube-loft from tail to blind head, banded pale/shadow for
     segmentation, capped with a dark head-capsule nub. cx/cz = ground-ish placement, yaw = facing,
     curl = how tightly it bends (0 = near-straight, 1 = tight C), rise = how high it crests/rears,
     sc = scale (grubs vary ~0.85..1.15 so the pile isn't uniform). */
  function grub(cx, cz, yaw, curl, rise, sc, coat){
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const L = (lx, ly, lz) => {                       // local->world: lz runs tail->head, ly is local up
      const x = lx*cy - lz*sy, z = lx*sy + lz*cy;
      return V(cx + x*sc, ly*sc, cz + z*sc);
    };

    // 5-point curled path, tail buried low in the pile -> head lifted by `rise`
    const bend = 0.10 * curl;
    const p0 = L(0,        0.105,             0.00);
    const p1 = L(bend*0.4, 0.115 + rise*0.20, 0.11);
    const p2 = L(bend*0.9, 0.125 + rise*0.45, 0.21);
    const p3 = L(bend*0.6, 0.135 + rise*0.75, 0.30);
    const p4 = L(bend*0.1, 0.140 + rise*1.00, 0.37);   // head base
    const p5 = L(-bend*0.1,0.145 + rise*1.12, 0.42);   // head tip (before capsule)

    tube(p0, p1, 0.075, 0.088, 6, coat,     {phase:0.3});
    tube(p1, p2, 0.088, 0.084, 6, P.hideSh, {phase:0.9});
    tube(p2, p3, 0.084, 0.070, 6, P.hideHi, {phase:0.5});
    tube(p3, p4, 0.070, 0.054, 6, coat,     {phase:0.1});

    // blind head-capsule: an oversized dark nub proud of the head tip (the countable signature
    // dot, law 3) — sized well past the 0.04u floor and pushed clear of the pale hide so it
    // silhouettes as a distinct dark bead rather than dissolving into the tube taper.
    const capA = L(-bend*0.05, 0.150 + rise*1.10, 0.44);
    const capB = L(-bend*0.15, 0.156 + rise*1.16, 0.52);
    tube(p4, capA, 0.054, 0.062, 6, P.cap, {phase:0.7});
    tube(capA, capB, 0.062, 0.020, 6, P.cap, {capB:{hex:P.capRim, lift:0.006}});
  }

  /* ---------- 9 grubs boiling in a low wide mound. Large footprint ~0.9u across.
     Low ring (6 grubs, wide/low, minimal rise) forms the base of the pile; a crest trio (3 grubs)
     lies higher and pitched forward toward the viewer (+z), one of them reared near-vertical. ---------- */
  //     cx      cz      yaw    curl  rise  sc
  const low = [
    { cx:-0.34, cz:-0.22, yaw: 0.4,  curl:0.8, rise:0.05, sc:1.05 },
    { cx: 0.07, cz:-0.38, yaw: 1.9,  curl:0.5, rise:0.06, sc:0.95 },
    { cx: 0.40, cz:-0.16, yaw: 3.0,  curl:0.9, rise:0.04, sc:1.10 },
    { cx: 0.38, cz: 0.12, yaw: 4.4,  curl:0.4, rise:0.08, sc:0.90 },
    { cx:-0.40, cz: 0.10, yaw: 5.6,  curl:0.7, rise:0.05, sc:1.00 },
    { cx:-0.06, cz:-0.06, yaw: 2.6,  curl:0.3, rise:0.09, sc:0.88 },
  ];
  const crest = [
    { cx:-0.20, cz: 0.30, yaw: 0.15, curl:0.5, rise:0.24, sc:1.02 },  // cresting, pitching forward
    { cx: 0.24, cz: 0.33, yaw:-0.20, curl:0.6, rise:0.28, sc:0.96 },  // cresting, pitching forward
    { cx: 0.02, cz: 0.14, yaw: 0.0,  curl:0.15,rise:0.46, sc:0.94 },  // the reared-vertical grub
  ];
  const coats = [P.hide, P.hide2, P.hide3];
  low.forEach((g,i) => grub(g.cx, g.cz, g.yaw, g.curl, g.rise, g.sc, coats[i % 3]));
  crest.forEach((g,i) => grub(g.cx, g.cz, g.yaw, g.curl, g.rise, g.sc, coats[i % 3]));

  /* ---------- base disc (Large: r=0.55, house pattern) ---------- */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2 = ring(V(0,0.045,0), V(0,1,0), 0.52, 0.52, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
