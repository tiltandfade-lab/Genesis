/* dev/model-qa/creatures/rlm-gloom-vampire-spawn.js — the VAMPIRE SPAWN landmark table (HUMANOID
   family, predatory crouch, Medium, CR 5, realm gloom), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (2026-07-08 foundry pilot, gloom-w1). Bestiary frame "vampire-spawn" is
   shared across realm reskins (gloom's Marrow Revenant, frontier's Vampire Rancher, etc.) — this
   bespoke chassis is authored to the CORE IDENTITY: a feral fresh-made vampire, still wearing the
   torn finery of whoever it choirmastered in life, stitched-smile scarring at the mouth corners
   from a life spent performing a warmth it never felt. Realm reskins ride this chassis narratively.

   FEATURE CHECKLIST (the ~1.3-1.6k budget buys):
     1. HUMANOID predatory crouch — deeply bent haunches, weight low and forward, torso hunched over
        the hips instead of stacked above them (anatomy chief criterion: this reads as a coiled
        predator on two legs, never an upright person).
     2. Fang-bared open mouth, jaw dropped wide — two long visible fangs breaking past the lower lip,
        the pale value-contrast payload sitting right on the signature (law 3).
     3. SIGNATURE — stitched smile: two thin pale scar lines running from the mouth corners back
        toward the jaw hinge, like a permanent choirmaster's grin sewn into gaunt cheeks. The one
        loud exaggerated feature (law 4) — reads even in silhouette as a too-wide grin-scar.
     4. Clawed reaching hands, both spread wide — elongated pale fingers into dark claw tips, the
        second high-value zone, asymmetric (one arm reaching low-forward for the grab, one cocked
        back for the strike) so the pounce has a beginning and an end.
     5. Pallid gaunt face and claws vs a dark tattered choir coat — value contrast law 3: the whole
        body reads dark-on-void EXCEPT the face/hands, which carry the light.
     6. Torn coat-tails and a ragged stand collar — the choirmaster's formal dress gone to rot,
        streaming out behind the crouch (cheap silhouette break, ties the "used to be someone" read
        without spending budget on a full costume).

   POSE SENTENCE: a fresh-made thing caught at the bottom of its coil, haunches driven low and wide,
   torso torn forward over the hips with the head snapping down and the jaw dropped open on its
   fangs, one clawed hand already grabbing low while the other is cocked back for the follow-through
   strike, torn coat-tails whipping out behind the lunge — never at rest, never at attention.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w1'], cell 2). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { buildBase, BASE_P } from '../parts.js';

/* one clawed finger: pale base tapering into a dark claw tip — kept >=0.012 at the tip so it clears
   the 0.04u-ish feature floor at the joint and only the very claw point thins down (law 3 caution
   learned from the specter's R2 fix: don't taper the WHOLE finger to a vanishing point). */
function finger(base, dir, len, pale, claw){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0]/n, dy = dir[1]/n, dz = dir[2]/n;
  const mid = V(base.x + dx*len*0.55, base.y + dy*len*0.55, base.z + dz*len*0.55);
  const tip = V(base.x + dx*len,      base.y + dy*len,      base.z + dz*len);
  tube(base, mid, 0.021, 0.015, 4, pale);
  tube(mid, tip, 0.015, 0.007, 4, claw, { capB:{ hex:claw } });
}

/* one coat-tail streamer off the back hem — 2 tapering segments, a slight outward flare so it reads
   as torn cloth caught mid-whip, not a stiff icicle. */
function coatTail(root, dir, len, flare, hexA, hexB){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0]/n, dy = dir[1]/n, dz = dir[2]/n;
  const p0 = V(root.x, root.y, root.z);
  const p1 = V(p0.x + dx*len*0.5 + flare*0.4, p0.y + dy*len*0.5, p0.z + dz*len*0.5);
  const p2 = V(p0.x + dx*len + flare,          p0.y + dy*len,     p0.z + dz*len);
  tube(p0, p1, 0.070, 0.052, 5, hexA);
  tube(p1, p2, 0.052, 0.030, 5, hexB, { capB:{ hex:hexB } });
}

export function buildVampireSpawn(){
  /* ---------- PALETTE (VS desaturated; near-black rotted-formal coat, pallid grudge-fresh face
     and claws carrying the value load) ---------- */
  const P = {
    // R2 CRITIC FIX: v1 coat tones (0x211b22/0x161219) were within a few RGB steps of the void
    // clear color (0x0a0908) — the whole torso/legs dissolved into dither noise (law-3 failure,
    // confirmed by a threshold silhouette test: torso vanished, only the pale face/hand survived).
    // Lifted to the specter's proven slate-value band so the black choir coat still reads BLACK
    // relative to the pale face/claws, but clears the void by a wide margin.
    coat:0x3c3348, coatLt:0x4c4159, coatDk:0x2a2436,        // torn choir coat — dark but clearly lifted off void
    collar:0x231e2d,                                         // ragged stand collar, darkest of the coat tones (still > void)
    tailA:0x584a66, tailB:0x726481,                          // coat-tails — lifted a step above the coat so they read as a distinct silhouette break
    skin:0xcfc0b4, skinDk:0x9c8d82,                          // pallid gaunt face/neck — the fresh-kill pale
    // R3 CRITIC FIX (fresh-context pass-2): r2's scar (0xe8ddd0) shared skin's value neighborhood
    // (only ~25 RGB steps above skin 0xcfc0b4) and the tubes sat mostly INSIDE the head ring's own
    // silhouette radius, so at 1/3-res + dither it read as a formless gray smear across the jaw
    // rather than a distinct grin-scar. Pushed to near-white for max separation from skin.
    scar:0xf7f0e6,                                           // the stitched-smile scar lines — near-white, the loudest value in the face
    eye:0x2a1014, eyeGlow:0xc23838,                          // sunken eyes with a hungry red glow pinprick
    fang:0xf0e8dc, mouth:0x120a0c,                            // fangs pale, mouth-void dark
    claw:0x5a4a52,                                            // dark claw tips
    ...BASE_P,
  };

  /* ---------- LANDMARKS — a predatory crouch: hips dropped LOW (haunches bent), torso hunched
     forward and DOWN over the hips (chestY sits barely above hipY, cz driving forward), head
     snapped further down/forward past the chest. Nothing stacks vertically like a standing figure. */
  const L = {
    hipY:0.42, waistY:0.52, ribY:0.62, chestY:0.70, shldY:0.76, neckY:0.80,
    jawY:0.815, cheekY:0.865, browY:0.915, crownY:0.965,
    hipHalf:0.135, shoulderX:0.205,
  };

  /* ===== TORSO — hunched loft, hips wide/low to chest narrow/forward. cz grows fast (the forward
     lean) so the whole trunk drives out over the hips rather than stacking above them. ===== */
  const torsoRings = stack([
    { y:L.hipY,   rx:0.175, rz:0.140, cz:0.010, hex:P.coatDk },
    { y:L.waistY, rx:0.155, rz:0.125, cz:0.060, hex:P.coat },
    { y:L.ribY,   rx:0.150, rz:0.122, cz:0.120, hex:P.coat },
    { y:L.chestY, rx:0.158, rz:0.128, cz:0.175, hex:P.coatLt },
    { y:L.shldY,  rx:0.168, rz:0.118, cz:0.210, hex:P.coat },
    { y:L.neckY,  rx:0.060, rz:0.058, cz:0.235, hex:P.skinDk },
  ], 10, {});

  /* ragged stand collar — a short dark flared band right at the shoulders/neck, torn on one side */
  {
    const c0 = ring(V(0, L.shldY+0.02, 0.225), V(0,1,0), 0.10, 0.09, 8, Math.PI/8);
    const c1 = ring(V(0, L.shldY+0.11, 0.245), V(0,1,0), 0.115, 0.10, 8, Math.PI/8);
    stitch([c0, c1], () => P.collar, { 0:[3,4] }); // torn gap at the back
  }

  /* ===== HAUNCHES — the crouch. Thighs bent hip->knee driving FORWARD and down, shins knee->ankle
     driving BACK under the body (a deep coiled squat, not a standing pair of legs). Knees splayed
     wide for a low predatory base. ===== */
  {
    const knob = (p,r) => blob(p.x,p.y,p.z, r,r*0.88,r, P.coatDk, 6, 4);
    for(const s of [-1, 1]){
      const hip   = V(s*L.hipHalf, L.hipY-0.02, 0.02);
      const knee  = V(s*0.270,      0.185,       0.250);
      const ankle = V(s*0.190,      0.050,       0.075);
      const toe   = V(s*0.195,      0.010,       0.245);
      // R2 CRITIC FIX: knees/shins were painted in coat/coatDk (near-identical value to the base
      // disc directly under them), so the whole crouch silhouette vanished into the ground at
      // 1/3-res (threshold test showed only a thin vertical stripe surviving). Knees widened
      // further out from the hip (0.230->0.270) so the bent-haunch shape actually breaks the
      // torso's silhouette instead of hiding straight under it.
      tube(hip, knee, 0.072, 0.058, 7, P.coatLt);
      knob(knee, 0.060);
      tube(knee, ankle, 0.054, 0.038, 7, P.coat);
      knob(ankle, 0.042);
      // bare pale clawed foot — a short flat wedge + two toe-claws
      tube(ankle, toe, 0.038, 0.026, 5, P.skinDk, { capB:{ hex:P.skinDk } });
      for(const off of [-0.02, 0.02])
        tube(toe.clone().add(V(off,0,0)), toe.clone().add(V(off*1.3, -0.01, 0.045)), 0.012, 0.005, 3, P.claw, { capB:{ hex:P.claw } });
    }
  }

  /* ===== HEAD — snapped down and forward off the hunch, jaw dropped open. Gaunt bands: cheeks
     pinched narrower than jaw/brow either side (the specter's gaunt-face trick, reused for the
     fresh-corpse pallor). ===== */
  const headRings = stack([
    { y:L.jawY,   rx:0.082, rz:0.088, cz:0.255, hex:P.skin },
    { y:L.cheekY, rx:0.064, rz:0.070, cz:0.230, hex:P.skinDk },
    { y:L.browY,  rx:0.086, rz:0.082, cz:0.195, hex:P.skin },
    { y:L.crownY, rx:0.068, rz:0.062, cz:0.150, hex:P.skinDk },
  ], 8, { capTop:{ hex:P.skinDk, lift:0.018 } });

  /* sunken eyes — small dark sockets with a hungry red glow pinprick, angled down-and-forward
     (tracking whatever's directly in front of the crouch) */
  for(const s of [-1, 1]){
    const ex = s*0.036, ey = L.browY-0.015, ez = 0.255;
    blob(ex, ey, ez, 0.020, 0.020, 0.016, P.eye, 6, 4);
    blob(ex + s*0.006, ey - 0.004, ez + 0.010, 0.007, 0.007, 0.007, P.eyeGlow, 4, 2);
  }

  /* gaping open mouth — a tall dark void between the jaw and the upper lip, jaw dropped low */
  quad(V(-0.032, L.cheekY+0.010, 0.298), V(0.032, L.cheekY+0.010, 0.298),
       V(0.026,  L.jawY-0.045,   0.278), V(-0.026, L.jawY-0.045,   0.278), P.mouth, 0.02);

  /* two long fangs breaking past the lower lip — the pale value payload sitting on the mouth */
  tube(V(-0.016, L.cheekY-0.004, 0.292), V(-0.020, L.jawY-0.050, 0.282), 0.010, 0.003, 4, P.fang, { capB:{ hex:P.fang } });
  tube(V( 0.016, L.cheekY-0.004, 0.292), V( 0.020, L.jawY-0.050, 0.282), 0.010, 0.003, 4, P.fang, { capB:{ hex:P.fang } });

  /* SIGNATURE — the stitched-smile scar: two thin pale scar lines running from the mouth corners
     back toward the jaw hinge, curving up slightly (a too-wide sewn grin). Built as thin flat quads
     riding the cheek surface, kept >=0.012 wide so they don't dissolve at 1/3-res. */
  for(const s of [-1, 1]){
    const a = V(s*0.034, L.cheekY+0.008, 0.292);          // mouth corner
    const b = V(s*0.098, L.cheekY+0.036, 0.234);           // mid scar, curving up+back — pushed past the cheek ring's own radius (rx 0.064) so it pokes into the void, a hard silhouette break instead of a blend
    const c = V(s*0.088, L.jawY-0.004,   0.196);           // scar tail toward the jaw hinge, likewise past jawY's rx (0.082)
    // R3 CRITIC FIX (fresh-context pass-2): r2's scar (radius 0.017/0.014, near-skin value) still
    // sat INSIDE the head ring's own silhouette at those heights (cheek rx 0.064, brow rx 0.086) —
    // a same-color line drawn on top of a same-value surface, which is exactly what law 3 warns
    // against. Widened + pushed past the ring radius so the scar's own geometry breaks the head's
    // outline (a jagged too-wide grin poking past the cheek). Also stopped tapering the tail below
    // the ~0.04u floor (r2's 0.008 tip radius = 0.016u diameter, well under floor, dissolved on
    // inspection) — kept the whole run near-uniform-thick so it survives 1/3-res as a swollen
    // keloid grin-scar rather than thinning to nothing, plus the near-white P.scar value now
    // clears skin by a wide margin.
    tube(a, b, 0.024, 0.022, 4, P.scar);
    tube(b, c, 0.022, 0.017, 4, P.scar, { capB:{ hex:P.scar } });
  }

  /* ===== ARMS — the pounce. LEADING (right, s=1): low and far forward, already grabbing.
     TRAILING (left, s=-1): cocked back high, the follow-through strike not yet thrown. Both root
     off the hunched shoulder band, well forward of the hips (cz matches shldY's forward lean). ===== */
  {
    const shR = V(L.shoulderX, L.shldY-0.01, 0.205);
    const elR = V(0.335, 0.520, 0.360);
    const wrR = V(0.400, 0.330, 0.470);
    tube(shR, elR, 0.058, 0.046, 6, P.coat);
    tube(elR, wrR, 0.044, 0.028, 6, P.coatDk);
    blob(wrR.x, wrR.y, wrR.z, 0.036, 0.030, 0.032, P.skin, 6, 4);
    const fingersR = [[0.55,-0.35,0.75],[0.20,-0.45,0.90],[-0.15,-0.40,0.95],[-0.45,-0.25,0.80]];
    for(const d of fingersR) finger(wrR, d, 0.150, P.skin, P.claw);

    const shL = V(-L.shoulderX, L.shldY-0.01, 0.205);
    const elL = V(-0.360, 0.760, 0.070);
    const wrL = V(-0.415, 0.940, -0.075);
    tube(shL, elL, 0.058, 0.046, 6, P.coat);
    tube(elL, wrL, 0.044, 0.028, 6, P.coatDk);
    blob(wrL.x, wrL.y, wrL.z, 0.034, 0.028, 0.030, P.skin, 6, 4);
    const fingersL = [[-0.30,0.55,-0.55],[0.05,0.60,-0.50],[0.35,0.50,-0.45],[0.55,0.30,-0.35]];
    for(const d of fingersL) finger(wrL, d, 0.135, P.skin, P.claw);
  }

  /* ===== SIGNATURE-ADJACENT — torn coat-tails whipping out behind the crouch, off the torso's
     lowest ring (hipY) so they seat at the hem by construction. Graded so the trailing-arm side
     (the cocked-back strike) drags the longer tails. ===== */
  {
    const hem = torsoRings[0];
    const order = hem.map((p,i) => i).sort((a,b) => hem[a].z - hem[b].z); // back(-z) -> front(+z)
    const chosen = [order[0], order[1], order[3], order[6]];
    chosen.forEach((idx, k) => {
      const root = hem[idx];
      const t = k / (chosen.length - 1);
      const len = 0.46 - 0.22*t;
      const outX = root.x * 1.5;
      coatTail(root, [outX, -0.55 - 0.05*(idx%3), -0.85 - 0.15*t], len, 0.04*(idx%2 ? 1 : -1),
        (k % 2) ? P.tailA : P.tailB, P.tailA);
    });
  }

  /* base disc — shared module, seats the crouch's low ankles on the tile */
  buildBase(P);
}
