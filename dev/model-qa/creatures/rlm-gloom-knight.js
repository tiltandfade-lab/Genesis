/* dev/model-qa/creatures/rlm-gloom-knight.js — the KNIGHT landmark table (HUMANOID + FULL-PLATE
   family, Medium, CR 4, realm gloom), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (2026-07-08 foundry pilot, gloom-w2 cell 9). Core identity: a knight sworn to the service of a
   vampire centuries past — still armored, still loyal, still starving. Full-plate must read
   HEAVIER than the veteran's mail+tabard (var-veteran.js) and PROUDER than the wight's crowned
   undead (rlm-wight-lord-of-the-processional-guard.js) — a complete, once-noble plate harness worn
   by a thing that stopped being a person a long time ago.

   FEATURE CHECKLIST (the ~1,400-1,900 budget buys):
     1. HUMANOID full-plate torso per ANATOMY-CANON (chief criterion) — a complete breastplate loft
        (waist->chest->shoulders) reading heavier/bulkier than mail: wide flared pauldrons, a
        fauld skirt of overlapping plate lames at the waist, no visible cloth gaps. Never a thin
        tabard-over-mail silhouette — full coverage plate.
     2. CLOSED GREAT-HELM — a complete ovoid helm (no visible face), a single dark horizontal
        breathing/vision SLIT across the front as the only "eyes" tell, a faint cold ember-glow
        seated deep in the slit (starving-but-still-serving read, kept dim per undead-adjacent
        convention). Helm bowed forward/down onto the pommel — the vigil read.
     3. SIGNATURE — huge POINT-DOWN GREATSWORD, blade planted tip-first in the ground between the
        knight's braced feet, both hands stacked on the pommel above the crossguard. The single
        loudest silhouette break (law 4): a blade taller than the knight's own hip-to-crown span,
        the high-value zone of the whole model (steel-lit vs blackened plate, law 3).
     4. Blackened, centuries-pitted plate — near-black steel with old bronze/verdigris trim at the
        pauldron rims and helm brow (the "once someone's household colors" tell, faded not gone).
        Value contrast law 3: the whole harness reads dark-on-void EXCEPT the blade and the trim.
     5. GUARD-VIGIL POSE — both hands stacked on the pommel, torso leaning weight forward INTO the
        blade, helm bowed down toward the grip, one foot planted forward of the other — a stance a
        heartbeat from drawing the blade back up, never an at-rest parade stand (law 5).
     6. A short tattered surcoat remnant (a single heraldic scrap, its device long since bled to a
        dull rust-red smear) hanging off one hip — cheap "sworn to a house" silhouette break without
        spending budget on a full cloth layer.

   POSE SENTENCE: the vigil-turned-threat — both hands stacked on the pommel of a point-down
   greatsword planted between his feet, helm bowed low over the grip, weight rolled forward and
   down INTO the blade, one foot braced ahead of the other — not at rest, not fully drawn, the
   held half-second before a centuries-loyal guardian rises to meet whatever just disturbed the
   vigil.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w2'], cell 9, fn buildKnight). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { buildBase, BASE_P } from '../parts.js';

export function buildKnight(){
  /* ---------- PALETTE (VS desaturated gloom register; near-black pitted plate vs a lit steel
     blade and faded bronze/verdigris trim — the value ladder law 3 needs). ---------- */
  /* R2 CRITIC FIX (post r1 engine render): v1 plate tones (0x2a2825/0x181614/0x3c3934) sat within
     a few RGB steps of the void clear color — the whole harness dissolved into dither noise except
     the trim lines and blade (law-3 failure, confirmed by the actual capture: torso/legs/arms
     unreadable, only the surcoat + blade tip survived). Lifted the whole plate ladder well clear of
     void while keeping it read as "blackened steel" relative to the brighter blade/trim (still the
     darkest material family in the model, just no longer indistinguishable from the background). */
  const P = {
    plate: 0x4c463e, plateDk: 0x332e27, plateLt: 0x615a4d,        // blackened pitted full plate — lifted clear of void (R2)
    trim: 0x9c8548, trimDk: 0x6e5c30,                              // faded bronze/verdigris trim — lifted to separate from the lifted plate (R2)
    blade: 0xacb3b8, bladeLt: 0xe4e8ee, bladeDk: 0x6c7276,        // lit greatsword steel — the signature's high-value zone
    hilt: 0x4a3c28, wrap: 0x342a1c,                                // dark leather-wrapped grip
    surcoat: 0x743e34, surcoatDk: 0x4e2b23,                        // faded rust-red heraldic scrap
    glow: 0x7a2c20, glowDk: 0x3c140e,                              // dim cold ember behind the helm slit
    slit: 0x100c0a,
    ...BASE_P,
  };

  /* ---------- LANDMARKS — the vigil-lean: torso hunches forward and DOWN toward the planted
     blade (cz grows through the stack), helm bowed further forward than the shoulders, front foot
     planted ahead of the back. Full-plate coverage: fauld skirt down to mid-thigh before the
     greaves take over (no bare cloth gap like the veteran's tunic legs). ---------- */
  const L = {
    hipY: 0.60, waistY: 0.70, ribY: 0.84, chestY: 0.97, shldY: 1.08, neckY: 1.13,
    jawY: 1.155, cheekY: 1.215, browY: 1.275, crownY: 1.325,
    hipHalf: 0.150, shoulderX: 0.255,
  };
  /* forward-and-down lean path — cz grows band to band, the torso rolling weight over the blade */
  const cz = { hip: 0.02, waist: 0.05, rib: 0.095, chest: 0.145, shld: 0.185, neck: 0.205 };

  /* ===== GREATSWORD FIRST — point planted in the ground between the feet, blade rising to well
     above hip height; both hands will stack on the pommel above the crossguard. ===== */
  const TIP = V(0.010, 0.010, 0.400);
  const CROSS_Y = 0.760;
  const CROSS = V(0.010, CROSS_Y, 0.360);
  const POMMEL = V(0.010, CROSS_Y + 0.145, 0.350);
  const BLADE_DIR = new THREE.Vector3().subVectors(CROSS, TIP).normalize();
  {
    /* blade — four cross-sections widening from the tip up to the crossguard, lit steel, the
       high-value payload the whole dark harness is built to set off (law 3). */
    const up = V(0, 1, 0);
    const gu = new THREE.Vector3().crossVectors(up, BLADE_DIR).normalize();
    const gv = new THREE.Vector3().crossVectors(BLADE_DIR, gu).normalize();
    const bl = (t, w, th) => {
      const c = TIP.clone().addScaledVector(BLADE_DIR, t);
      return [c.clone().addScaledVector(gu, w), c.clone().addScaledVector(gv, th),
              c.clone().addScaledVector(gu, -w), c.clone().addScaledVector(gv, -th)];
    };
    const s0 = bl(0.00, 0.006, 0.005);
    const s1 = bl(0.14, 0.052, 0.020);
    const s2 = bl(0.28, 0.062, 0.024);
    const s3 = bl(0.40, 0.070, 0.028);   // near the crossguard — the widest, brightest span
    stitch([s0, s1, s2, s3], (b) => b === 0 ? bladeDkFor() : P.blade);
    function bladeDkFor(){ return P.bladeDk; }
    /* a fuller groove — a thin darker line down the flat, cheap "real forged blade" tell */
    quad(bl(0.14, 0.010, 0.021)[1], bl(0.40, 0.010, 0.029)[1],
         bl(0.40, -0.010, 0.029)[1], bl(0.14, -0.010, 0.021)[1], P.bladeDk, 0.04);
    capFan(s3, CROSS.clone().addScaledVector(BLADE_DIR, 0.02), P.bladeLt);
  }
  {
    /* crossguard — a squared bronze-trim bar. R2 CRITIC FIX: r1's half-width (0.115, full 0.23)
       sat well inside the torso's own chest half-width (0.225) — at the game-panel camera angle
       it read as buried inside the body mass instead of a real silhouette break past the guard.
       Widened past the torso's own footprint (law 2) so the crossguard pokes out to both sides. */
    const up = V(0, 1, 0);
    const gu = new THREE.Vector3().crossVectors(up, BLADE_DIR).normalize();
    quad(CROSS.clone().addScaledVector(gu, 0.230), CROSS.clone().addScaledVector(gu, -0.230),
         CROSS.clone().addScaledVector(gu, -0.230).addScaledVector(BLADE_DIR, -0.032),
         CROSS.clone().addScaledVector(gu, 0.230).addScaledVector(BLADE_DIR, -0.032), P.trim, 0.03);
    /* grip — dark leather-wrapped, running from the crossguard up to the pommel; thickened for
       visibility so the "hands stacked here" zone reads as its own shape */
    tube(CROSS.clone().addScaledVector(BLADE_DIR, -0.032), POMMEL.clone().addScaledVector(BLADE_DIR, 0.018),
         0.032, 0.030, 8, P.wrap);
    /* pommel cap — a small bronze-trim disc both fists stack on top of */
    tube(POMMEL.clone().addScaledVector(BLADE_DIR, 0.018), POMMEL.clone().addScaledVector(BLADE_DIR, 0.044),
         0.030, 0.014, 8, P.trim, { capB: { hex: P.trimDk } });
  }

  /* ===== TORSO — full-plate breastplate loft, hunched forward/down into the lean. Wider at the
     chest/shoulders than the veteran's mail to read heavier; no neck-to-hip cloth gap. ===== */
  stack([
    { y: L.hipY,   rx: 0.190, rz: 0.155, cz: cz.hip,   hex: P.plateDk },
    { y: L.waistY, rx: 0.175, rz: 0.145, cz: cz.waist, hex: P.plate },
    { y: L.ribY,   rx: 0.198, rz: 0.155, cz: cz.rib,   hex: P.plate },
    { y: L.chestY, rx: 0.225, rz: 0.165, cz: cz.chest, hex: P.plateLt },
    { y: L.shldY,  rx: 0.250, rz: 0.160, cz: cz.shld,  hex: P.plate },
    { y: L.neckY,  rx: 0.090, rz: 0.085, cz: cz.neck,  hex: P.plateDk },
  ], 8, {});

  /* fauld — overlapping plate-lame skirt, hip down to mid-thigh, full coverage (never a bare
     cloth gap between breastplate and greaves). */
  {
    const bands = [
      { y: L.hipY - 0.02, rx: 0.205, rz: 0.170, cz: cz.hip * 0.9, hex: P.plateDk },
      { y: 0.46, rx: 0.220, rz: 0.180, cz: cz.hip * 0.6, hex: P.plate },
      { y: 0.34, rx: 0.230, rz: 0.185, cz: cz.hip * 0.4, hex: P.plateDk },
    ];
    stack(bands, 8, {});
    /* individual lame overlap lines — thin dark seams so the "stacked plates" read even though
       it's one loft, a cheap detail tell without extra tris beyond a few flat quads */
    for(const yy of [0.40, 0.52]){
      const rr = ring(V(0, yy, cz.hip * 0.5), V(0, 1, 0), 0.225, 0.183, 8, Math.PI / 8);
      for(let i = 0; i < 8; i += 2){
        const i2 = (i + 1) % 8;
        quad(rr[i], rr[i2], rr[i2].clone().add(V(0, -0.012, 0)), rr[i].clone().add(V(0, -0.012, 0)), P.plateDk, 0.03);
      }
    }
  }

  /* trim rim — a thin bronze/verdigris band at the shoulder line (once-noble household colors,
     faded not gone) */
  {
    const r1 = ring(V(0, L.shldY - 0.015, cz.shld), V(0, 1, 0), 0.252, 0.162, 8, Math.PI / 8);
    const r2 = ring(V(0, L.shldY + 0.005, cz.shld), V(0, 1, 0), 0.248, 0.158, 8, Math.PI / 8);
    stitch([r1, r2], () => P.trim);
  }

  /* pauldrons — wide flared plate domes, tilted out, bulkier than the veteran's dented pair (the
     "heavier than mail" read). */
  for(const s of [-1, 1]){
    const pivot = V(s * L.shoulderX, L.shldY + 0.03, 0.02 + cz.shld);
    const tilt = (p) => { const q = p.clone().sub(pivot); q.applyAxisAngle(V(0, 0, 1), -s * 0.30); return q.add(pivot); };
    stack([
      { y: L.shldY - 0.03, rx: 0.130, rz: 0.135, cx: pivot.x, cz: pivot.z, hex: P.plateDk },
      { y: L.shldY + 0.06, rx: 0.100, rz: 0.108, cx: pivot.x, cz: pivot.z, hex: P.plate },
    ], 8, { xform: tilt, capTop: { hex: P.plateLt, lift: 0.035 } });
    /* pitted dent — the centuries-old wear tell */
    const dc = tilt(V(pivot.x - s * 0.02, L.shldY + 0.07, pivot.z + 0.03));
    quad(dc.clone().add(V(-0.024, -0.010, 0)), dc.clone().add(V(0.008, -0.018, 0)),
         dc.clone().add(V(0.018, 0.014, 0.004)), dc.clone().add(V(-0.014, 0.020, 0.004)), P.plateDk, 0.04);
  }

  /* ===== HEAD — CLOSED GREAT-HELM, complete ovoid, no face gap, bowed forward/down further than
     the shoulders (the vigil-lean completes at the helm). One dark horizontal slit, a faint cold
     ember seated deep behind it.
     R2 CRITIC FIX: r1's head only translated forward (cz offset) — that reads as "pushed out",
     not "bowed down". Added a real forward PITCH rotation around the neck pivot (matches the
     pauldron tilt() idiom) so the crown drops and the brow/slit lead the silhouette down toward
     the pommel — the vigil read law 5 asks for. */
  const headCz = cz.neck + 0.045;
  const neckPivot = V(0, L.neckY + 0.01, cz.neck);
  const bow = (p) => { const q = p.clone().sub(neckPivot); q.applyAxisAngle(V(1, 0, 0), 0.42); return q.add(neckPivot); };
  const head = stack([
    { y: L.jawY,   rx: 0.088, rz: 0.086, cz: headCz - 0.005, hex: P.plate },
    { y: L.cheekY, rx: 0.098, rz: 0.096, cz: headCz,         hex: P.plateLt },
    { y: L.browY,  rx: 0.092, rz: 0.088, cz: headCz + 0.008, hex: P.plate },
    { y: L.crownY, rx: 0.072, rz: 0.068, cz: headCz - 0.005, hex: P.plateDk },
  ], 8, { xform: bow, capTop: { hex: P.plateDk, lift: 0.020 } });

  /* the vision slit — a single dark horizontal band across the front of the helm, the only
     "eyes" tell (law 4's one loud signature-adjacent read paired with the blade). Welded to the
     bowed helm via the same bow() xform so it doesn't float off the rotated head. */
  {
    const ez = headCz + 0.086;
    quad(bow(V(-0.062, L.browY - 0.010, ez)), bow(V(0.062, L.browY - 0.010, ez)),
         bow(V(0.058, L.browY - 0.028, ez - 0.002)), bow(V(-0.058, L.browY - 0.028, ez - 0.002)), P.slit, 0.02);
    /* dim ember-glow seated deep behind the slit — starving-but-still-serving, kept dim per the
       gloom undead-adjacent convention (no bright glaring eyes). */
    for(const s of [-1, 1]){
      const g = bow(V(s * 0.028, L.browY - 0.018, ez - 0.010));
      blob(g.x, g.y, g.z, 0.010, 0.007, 0.006, P.glow, 4, 3);
    }
  }

  /* helm brow trim — a thin bronze/verdigris band at the brow, matching the shoulder rim. Welded
     to the bowed helm (ring center + points run through bow()). */
  {
    const c = bow(V(0, L.browY + 0.010, headCz + 0.008));
    const c2 = bow(V(0, L.browY + 0.022, headCz + 0.008));
    const r1 = ring(c, V(0, 1, 0), 0.094, 0.090, 8, Math.PI / 8).map(bow);
    const r2 = ring(c2, V(0, 1, 0), 0.090, 0.086, 8, Math.PI / 8).map(bow);
    stitch([r1, r2], () => P.trim);
  }

  /* helm ridge — a low center crest running crown-to-brow, cheap silhouette tell of a "great helm"
     rather than a bare dome. Welded to the bowed helm. */
  {
    const a = bow(V(0, L.crownY + 0.018, headCz - 0.010));
    const b = bow(V(0, L.browY + 0.030, headCz + 0.075));
    tube(a, b, 0.014, 0.010, 4, P.trimDk, { raz: 0.010, rbz: 0.007 });
  }

  /* ===== ARMS — both stacked on the pommel, forearms crossing slightly, the classic two-hand
     grip-and-lean. Right (leading) fist sits just above the left on the pommel cap. Gauntlet
     fingers wrap the grip below each fist — a real anatomical grip read, not just a blob, so the
     "hands stacked on the pommel" pose sentence reads on sight. ===== */
  {
    const shR = V(L.shoulderX + 0.02, L.shldY - 0.02, 0.05 + cz.shld);
    const elR = V(0.180, 0.900, 0.230 + cz.shld * 0.4);
    const wrR = POMMEL.clone().addScaledVector(BLADE_DIR, 0.030);
    tube(shR, elR, 0.078, 0.062, 6, P.plate);
    tube(elR, wrR, 0.060, 0.048, 6, P.plateDk);
    blob(wrR.x, wrR.y, wrR.z, 0.038, 0.032, 0.036, P.plateDk, 6, 4);
    for(const d of [[-0.55, -0.30, 0.65], [-0.15, -0.45, 0.80], [0.25, -0.42, 0.78], [0.55, -0.20, 0.60]]){
      const n = Math.hypot(d[0], d[1], d[2]);
      const tip = V(wrR.x + d[0] / n * 0.055, wrR.y + d[1] / n * 0.055, wrR.z + d[2] / n * 0.055);
      tube(wrR, tip, 0.017, 0.010, 3, P.plateDk, { capB: { hex: P.plateDk } });
    }

    const shL = V(-L.shoulderX - 0.02, L.shldY - 0.02, 0.05 + cz.shld);
    const elL = V(-0.170, 0.840, 0.220 + cz.shld * 0.4);
    const wrL = POMMEL.clone().addScaledVector(BLADE_DIR, 0.004);
    tube(shL, elL, 0.078, 0.062, 6, P.plate);
    tube(elL, wrL, 0.060, 0.048, 6, P.plateDk);
    blob(wrL.x, wrL.y, wrL.z, 0.038, 0.032, 0.036, P.plateDk, 6, 4);
    for(const d of [[-0.55, -0.35, 0.60], [-0.15, -0.48, 0.76], [0.25, -0.45, 0.74], [0.55, -0.25, 0.55]]){
      const n = Math.hypot(d[0], d[1], d[2]);
      const tip = V(wrL.x + d[0] / n * 0.052, wrL.y + d[1] / n * 0.052, wrL.z + d[2] / n * 0.052);
      tube(wrL, tip, 0.016, 0.009, 3, P.plateDk, { capB: { hex: P.plateDk } });
    }
  }

  /* ===== LEGS — greaves, one foot planted forward of the other (the guard-vigil brace, never a
     square neutral stand). Full plate coverage down to sabatons. ===== */
  {
    const hipF = V(0.075, L.hipY - 0.03, cz.hip + 0.06);   // front (forward-planted) leg
    const kneeF = V(0.100, 0.320, cz.hip + 0.20);
    const ankF = V(0.095, 0.075, cz.hip + 0.24);
    const hipB = V(-0.075, L.hipY - 0.02, cz.hip - 0.04);  // back (braced) leg
    const kneeB = V(-0.110, 0.300, cz.hip - 0.18);
    const ankB = V(-0.105, 0.070, cz.hip - 0.22);
    for(const [hip, knee, ank] of [[hipF, kneeF, ankF], [hipB, kneeB, ankB]]){
      tube(hip, knee, 0.098, 0.072, 6, P.plate);
      blob(knee.x, knee.y, knee.z, 0.062, 0.055, 0.060, P.plateDk, 6, 4);
      tube(knee, ank, 0.068, 0.050, 6, P.plateDk);
    }
    /* sabatons — armored boots, one foot's toe pushed further forward (the front leg). Toe ring
       radius kept small + raz/rbz flattened so the tilted ring never dips the bbox below y=0
       (the wave-1 min.y gate). */
    for(const [ank, toeLen] of [[ankF, 0.150], [ankB, 0.115]]){
      const heel = V(ank.x, 0.052, ank.z - 0.03);
      const toe = V(ank.x, 0.030, ank.z + toeLen);
      tube(heel, toe, 0.062, 0.026, 6, P.plateDk, { raz: 0.052, rbz: 0.018, capB: { hex: P.plateDk, lift: 0.008 } });
    }
  }

  /* ===== SURCOAT REMNANT — a short tattered heraldic scrap hanging off one hip, its device long
     bled to a dull rust-red smear (cheap "sworn to a house" silhouette break). ===== */
  {
    const root = V(0.145, L.hipY + 0.01, cz.hip + 0.10);
    const p1 = V(0.170, 0.360, cz.hip + 0.14);
    const p2 = V(0.155, 0.190, cz.hip + 0.10);
    tube(root, p1, 0.075, 0.062, 5, P.surcoat, { raz: 0.028, rbz: 0.024 });
    tube(p1, p2, 0.062, 0.030, 5, P.surcoatDk, { raz: 0.024, rbz: 0.010, capB: { hex: P.surcoatDk } });
  }

  /* base disc (Medium: r=0.42) */
  buildBase(P);
}
