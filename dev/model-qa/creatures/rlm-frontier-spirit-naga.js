/* dev/model-qa/creatures/rlm-frontier-spirit-naga.js — SPIRIT NAGA landmark table (SERPENTINE
   family per docs/ANATOMY-CANON.md), Large, CR 8, realm frontier, authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, frontier-w2 cell 8, port 5338).
   Core identity: the lakebed naga speaking with every voice the salt swallowed — the
   spellcasting serpent, a snake body under a humanoid-ish head crowned by a cobra hood.
   Bespoke to the render key "spirit-naga" — realm reskins ride this chassis; the salt-crusted
   frontier palette below is this realm's specific read.

   FEATURE CHECKLIST (the ~1,400-1,800 budget buys):
     1. SERPENTINE pre-coiled D-cross-section body (ANATOMY-CANON: near-constant "chest"
        diameter through the front two-thirds, string-of-beads neck, late tail taper, 2-3
        stacked coil loops with an inner loop tucked UNDER an outer one) — the body-of-the-
        family read, non-negotiable per law 4.
     2. SIGNATURE — the flared cobra HOOD: a wide flattened paddle behind the raised head,
        pale salt-crusted pattern on its interior face (the law-3 high-value zone), carried
        at the top of the silhouette so it reads first at a squint.
     3. The almost-human face: a browed, cheek-boned humanoid-ish visage set into the
        serpent head-wedge — not a snake snout, a face with a jaw, framed by the hood.
     4. Open mouth mid-word — jaw hinged wide, fangs bared, a dark throat well, as if
        mid-sermon (the "speaking with every voice the salt swallowed" beat).
     5. Two spellcaster arms spliced at the neck-beads where the tube widens to shoulders,
        one raised mid-gesture (fingers spread, conjuring), one low and open (the "voices"
        pose) — the humanoid-torso splice ANATOMY-CANON calls out for naga.
     6. Salt-crust value ladder — dark brackish-olive scale flanks against a pale bone-white/
        salt-crust bloom climbing the hood interior, jaw, and finger-tips, so the signature
        and the speaking mouth both carry the brightest tones in the piece.

   POSE SENTENCE: the sermon — the front third of the body risen fully vertical off a low,
   tightly stacked coil, hood flared to its widest, mouth open mid-word with fangs shown,
   one arm thrown up and spread mid-conjure while the other opens low and out, as if
   addressing the whole lakebed at once — never a resting coil with a closed mouth.

   POSE NOTE (per ANATOMY-CANON POSE-ANATOMY, adapted for a serpentine spine with a spliced
   humanoid torso): the gesture line IS the raised body itself — the rising S-curve from the
   coil root through the neck-beads to the skull is the pelvis-to-skull equivalent, authored
   first below (RISE points) before any hood/face/arm geometry hangs off it. The two spliced
   arms bend at visible ~110-130deg elbows (law 2) and ride asymmetric shoulders (law 3: the
   raised casting arm drags its shoulder/hood-root up and the upper rise leans away from it,
   countered by the low open arm on the opposite side — law 4's counterpose, substituting the
   coil's own asymmetric footprint for hip counterpose since there are no legs).

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}
function lerp(a, b, t){ return a.clone().lerp(b, t); }

export function buildSpiritNaga(){
  /* ---------- PALETTE (dark brackish-olive scale flanks vs. pale bone-white salt-crust
     bloom climbing the hood interior/jaw/fingertips — the law-3 high-value zone rides the
     signature hood and the speaking mouth). ---------- */
  /* R1-SELF-REVIEW PASS: r1 read as dark-on-dark (law 3 failure — the whole body sat too
     close to the void), the hood (the signature, law 4) was too small/thin to register as
     "flared," and the arms read as bare sticks with no visible elbow bend. Every base tone
     below is pushed up substantially, the hood is rebuilt much larger/wider, and the arms
     are thickened + the elbow bend made more pronounced. */
  const P = {
    scale: 0x6e7a4e, scaleDk: 0x4e5836, scaleLt: 0x8c9866,     // brackish-olive body, lightened well clear of the void
    belly: 0xcabf94, bellyDk: 0xa89c72,                         // pale underside strip
    hoodOut: 0x5a6640, hoodIn: 0xf0e6bc, hoodInDk: 0xd4c692,    // hood outer olive, inner salt-crust pale — pushed past 140
    salt: 0xf6eed4, saltDk: 0xdccca0,                            // salt-crust bloom accents (crown, jaw, fingertips)
    face: 0x8a9464, faceDk: 0x646c46,                            // almost-human cheek/brow
    mouth: 0x1c1410, throat: 0x8a3626,                           // dark open maw, warm throat well
    fang: 0xf8f0d8,                                              // pale fangs
    arm: 0x788252, armDk: 0x565e3c,                              // spellcaster arms, lightened
    disc: 0x3a3428, discTop: 0x463f30,
  };

  /* ===== COILED BASE — low, tightly stacked D-section coil, 2 loops, inner tucked UNDER
     outer, per ANATOMY-CANON. ===== */
  const coilY = 0.16;
  const outerCoil = [
    V(0.30, coilY, 0.16), V(0.34, coilY + 0.02, -0.14), V(0.16, coilY + 0.03, -0.32),
    V(-0.14, coilY + 0.03, -0.30), V(-0.32, coilY + 0.01, -0.06), V(-0.26, coilY, 0.20),
  ];
  const outerRad = [0.130, 0.145, 0.138, 0.126, 0.112, 0.096];
  for(let i = 0; i < outerCoil.length - 1; i++){
    const hex = (i % 2 === 0) ? P.scale : P.scaleDk;
    tube(outerCoil[i], outerCoil[i + 1], outerRad[i], outerRad[i + 1], 9, hex, { phase: Math.PI / 9 });
  }
  const innerY = coilY - 0.02; // tucked UNDER the outer ring
  const innerCoil = [
    V(-0.02, innerY, 0.10), V(0.10, innerY, -0.10), V(-0.06, innerY, -0.20), V(-0.18, innerY, -0.02),
  ];
  const innerRad = [0.090, 0.082, 0.072, 0.078];
  for(let i = 0; i < innerCoil.length - 1; i++){
    tube(innerCoil[i], innerCoil[i + 1], innerRad[i], innerRad[i + 1], 8, i % 2 === 0 ? P.scaleDk : P.scale, { phase: Math.PI / 8 });
  }
  /* belly strip along the outer coil's inner face */
  for(let i = 0; i < outerCoil.length - 1; i += 2){
    const a = outerCoil[i], b = outerCoil[i + 1];
    const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
    quad(V(mx - 0.05, coilY - 0.06, mz - 0.03), V(mx + 0.05, coilY - 0.06, mz + 0.02),
         V(mx + 0.03, coilY - 0.11, mz), V(mx - 0.03, coilY - 0.11, mz), P.belly, 0.05);
  }

  /* ===== THE RISE — gesture-line-first: pelvis(coil-root)-to-skull S-curve. Front third
     risen fully vertical off the coil, string-of-beads narrowing toward the neck. ===== */
  const S = {
    root:  outerCoil[0],
    rise1: V(0.24, coilY + 0.30, 0.24),
    rise2: V(0.10, coilY + 0.64, 0.30),
    rise3: V(0.02, coilY + 0.96, 0.26),   // slight lean back at the top — the sermon lean
    neck:  V(0.00, coilY + 1.16, 0.20),
    skull: V(0.00, coilY + 1.28, 0.16),
  };
  tube(S.root,  S.rise1, 0.116, 0.096, 9, P.scale,   { phase: Math.PI / 9 });
  tube(S.rise1, S.rise2, 0.096, 0.076, 9, P.scaleDk, { phase: Math.PI / 9 });
  tube(S.rise2, S.rise3, 0.076, 0.062, 9, P.scale,   { phase: Math.PI / 9 });
  tube(S.rise3, S.neck,  0.062, 0.052, 8, P.scaleDk, { phase: Math.PI / 8 });
  /* pale belly strip climbing the rise's front face */
  quad(V(-0.06, coilY + 0.20, 0.20), V(0.10, coilY + 0.20, 0.24), V(0.02, coilY + 1.08, 0.22), V(-0.08, coilY + 1.08, 0.18), P.belly, 0.05);

  /* ===== SHOULDER SPLICE — where the tube widens to shoulders, per ANATOMY-CANON naga
     note. Two arms root here, asymmetric per law 3 (raised arm drags its shoulder up). ===== */
  const shoulderY = coilY + 0.78;
  const shL = V(-0.14, shoulderY + 0.03, 0.20);   // raised-arm shoulder, lifted
  const shR = V(0.13, shoulderY - 0.02, 0.20);    // low-arm shoulder, level

  /* R1-SELF-REVIEW: r1's arms read as bare sticks with no visible elbow bend — both
     segments thickened noticeably and the elbow vertex pushed further off the shoulder-
     wrist chord so the ~115/125deg bend actually reads as an angle, not a straight line. */
  /* raised casting arm: shoulder -> elbow(~115deg bend) -> wrist, thrown up and out */
  {
    const el = V(-0.36, shoulderY + 0.24, 0.34);
    const wr = V(-0.20, shoulderY + 0.58, 0.44);
    tube(shL, el, 0.074, 0.058, 6, P.arm);
    tube(el, wr, 0.058, 0.044, 6, P.armDk, { phase: Math.PI / 6 });
    blob(wr.x, wr.y, wr.z, 0.044, 0.040, 0.040, P.arm, 6, 4);
    const spreads = [[-0.30, 0.55, 0.30], [-0.05, 0.65, 0.35], [0.20, 0.55, 0.30], [-0.15, 0.35, 0.55]];
    for(const s of spreads){
      const dn = norm(s);
      const tip = wr.clone().addScaledVector(dn, 0.095);
      tube(wr, tip, 0.020, 0.007, 3, P.salt, { capB: { hex: P.salt } });
    }
  }
  /* low open arm: shoulder -> elbow(~125deg bend) -> wrist, open low and out (the "voices" pose) */
  {
    const el = V(0.38, shoulderY - 0.12, 0.36);
    const wr = V(0.38, shoulderY - 0.40, 0.24);
    tube(shR, el, 0.070, 0.054, 6, P.armDk);
    tube(el, wr, 0.054, 0.040, 6, P.arm, { phase: Math.PI / 6 });
    blob(wr.x, wr.y, wr.z, 0.040, 0.038, 0.038, P.armDk, 6, 4);
    const spreads = [[0.35, -0.30, 0.35], [0.15, -0.45, 0.45], [-0.10, -0.35, 0.55], [0.45, -0.10, 0.30]];
    for(const s of spreads){
      const dn = norm(s);
      const tip = wr.clone().addScaledVector(dn, 0.090);
      tube(wr, tip, 0.019, 0.007, 3, P.saltDk, { capB: { hex: P.saltDk } });
    }
  }

  /* ===== HEAD + HOOD — the signature: flared paddle hood behind the skull, pale
     salt-crust pattern on its interior face, framing an almost-human browed visage. ===== */
  {
    const n = 9, ph = Math.PI / n;
    const bands = [
      { y: S.neck.y,      cz: S.neck.z,      rx: 0.058, rz: 0.066, hex: P.scale },
      { y: S.skull.y,     cz: S.skull.z + 0.02, rx: 0.072, rz: 0.084, hex: P.scaleLt }, // brow band, widest
      { y: S.skull.y + 0.10, cz: S.skull.z - 0.02, rx: 0.056, rz: 0.060, hex: P.scaleDk },
    ];
    const rings = bands.map(b => ring(V(S.skull.x, b.y, b.cz), V(0, 1, 0), b.rx, b.rz, n, ph));
    // heavy human-ish brow — push the front verts forward/down slightly
    for(const i of [1, 2]){ rings[1][i].z += 0.014; rings[1][i].y -= 0.006; }
    stitch(rings, b => bands[b].hex);
    capFan(rings.at(-1), V(S.skull.x, S.skull.y + 0.16, S.skull.z - 0.04), P.scaleDk);

    /* almost-human cheek/jaw plates flanking the mouth, giving a facial (not muzzle) read */
    for(const s of [-1, 1]){
      const cx = S.skull.x + s * 0.05;
      quad(V(cx, S.skull.y + 0.02, S.skull.z + 0.06), V(cx + s * 0.03, S.skull.y - 0.02, S.skull.z + 0.06),
           V(cx + s * 0.02, S.skull.y - 0.10, S.skull.z + 0.02), V(cx - s * 0.01, S.skull.y - 0.06, S.skull.z),
           P.face, 0.04);
    }

    /* THE HOOD — R1-SELF-REVIEW: r1's hood was a sliver that vanished at 1/3-res — this is
       the creature's SIGNATURE (law 4) and needs to be the loudest shape in the silhouette.
       Rebuilt near double the reach, with a much bigger, brighter pale-interior fan so the
       "flared wide" direction actually reads. */
    const hoodRoot = V(S.skull.x, S.skull.y + 0.05, S.skull.z - 0.03);
    for(const s of [-1, 1]){
      const tipOut = V(hoodRoot.x + s * 0.46, hoodRoot.y + 0.14, hoodRoot.z - 0.14);
      const tipFwd = V(hoodRoot.x + s * 0.26, hoodRoot.y + 0.30, hoodRoot.z + 0.18);
      const midOut = V(hoodRoot.x + s * 0.30, hoodRoot.y + 0.04, hoodRoot.z - 0.20);
      const midFwd = V(hoodRoot.x + s * 0.14, hoodRoot.y + 0.12, hoodRoot.z + 0.08);
      // outer face (olive) — two panels so the paddle has a broad, flat fan silhouette
      quad(hoodRoot, midOut, tipOut, midFwd, P.hoodOut, 0.03);
      quad(midFwd, tipOut, tipFwd, tipFwd, P.hoodOut, 0.03);
      // inner face (pale salt-crust bloom — faces forward, the law-3 payoff, big and bright)
      const rootIn = V(hoodRoot.x, hoodRoot.y - 0.02, hoodRoot.z + 0.03);
      const midFwdIn = V(midFwd.x, midFwd.y - 0.01, midFwd.z + 0.02);
      const tipFwdIn = V(tipFwd.x, tipFwd.y - 0.01, tipFwd.z + 0.02);
      quad(rootIn, midFwdIn, tipFwdIn, tipOut, P.hoodIn, 0.03);
      quad(rootIn, midOut, tipOut, tipFwdIn, P.hoodIn, 0.03);
      /* salt-crust pattern spots across the (now much bigger) hood interior */
      for(let k = 0; k < 3; k++){
        const t = 0.25 + k * 0.28;
        const p = lerp(rootIn, tipFwdIn, t).add(V(0, -0.01, 0.015));
        blob(p.x, p.y, p.z, 0.026, 0.022, 0.008, P.hoodInDk, 4, 2);
      }
    }

    /* ===== OPEN MOUTH mid-word — jaw hinged wide, dark throat well, fangs bared. ===== */
    const jawTop = V(S.skull.x, S.skull.y + 0.04, S.skull.z + 0.09);
    const jawBotFront = V(S.skull.x, S.skull.y - 0.09, S.skull.z + 0.12);
    const jawBotBack = V(S.skull.x, S.skull.y - 0.06, S.skull.z - 0.02);
    quad(V(S.skull.x - 0.04, jawTop.y, jawTop.z), V(S.skull.x + 0.04, jawTop.y, jawTop.z),
         V(S.skull.x + 0.045, jawBotFront.y, jawBotFront.z), V(S.skull.x - 0.045, jawBotFront.y, jawBotFront.z),
         P.mouth, 0.02);
    blob(S.skull.x, (jawTop.y + jawBotFront.y) / 2 - 0.02, S.skull.z + 0.02, 0.045, 0.035, 0.05, P.throat, 6, 3);
    for(const s of [-1, 1]){
      const fRoot = V(S.skull.x + s * 0.03, jawTop.y - 0.005, jawTop.z);
      const fTip = V(S.skull.x + s * 0.024, jawBotFront.y - 0.03, jawBotFront.z - 0.01);
      tube(fRoot, fTip, 0.010, 0.003, 4, P.fang, { capB: { hex: P.fang } });
    }

    /* salt-crust crown accent atop the brow */
    blob(S.skull.x, S.skull.y + 0.09, S.skull.z - 0.01, 0.030, 0.014, 0.026, P.salt, 5, 3);
  }

  /* base disc (Large: r=0.55) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.55, 0.55, 18);
    const r2 = ring(V(0, 0.048, 0), V(0, 1, 0), 0.53, 0.53, 18);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.051, 0), P.discTop);
  }
}
