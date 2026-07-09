/* dev/model-qa/creatures/rlm-suburb-chasme.js — the CHASME landmark table (ARTHROPOD-HUMANOID
   hybrid family, Medium, CR 6, realm suburb), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000
   tri band (2026-07-08 foundry pilot, suburb-w1 cell 6). Core identity: the "PTA Vice President"
   — a droning fly-demon lieutenant gathering names for an unseen master list. Bespoke to the
   render key "chasme" — realm reskins ride this chassis narratively.

   FEATURE CHECKLIST (the budget buys):
     1. ARTHROPOD-HUMANOID chassis — humanoid torso/pelvis/legs (ANATOMY-CANON's PC-kit grammar)
        carrying an insect head + four insect wings grafted at the shoulders (the family hybrid
        this creature is built for — never a plain humanoid with wings stapled flat behind it).
     2. SIGNATURE — a HUGE fly head dominating the figure: two swollen compound-eye domes (each
        its own faceted-hex-tinted blob, not a smooth sphere) flanking a downward proboscis,
        the single loudest feature law 4 wants.
     3. FOUR insect wings (two pairs, WINGED family grammar — strut-built, membrane hung between
        struts, never a flat fabric panel) held bright and spread mid-beat, the second signature
        payload (translucent panes catching light against the dark thorax).
     4. Hooked forelimb claws — both arms bent at the elbow, forearms terminating in a single
        curved insect hook (the "proboscis melee reach" read) instead of humanoid hands.
     5. Pinched arthropod thorax/abdomen riding the humanoid torso's back (ANATOMY-CANON
        ARTHROPOD's "constriction IS the read") — a segmented abdomen trailing behind the pelvis,
        giving the hybrid its bug-body tell even though the stance is bipedal.
     6. Suburban PTA garnish — a small notebook-and-pencil bundle slung at the hip (cheap
        countable prop that sells "she takes minutes at every meeting" without a body-budget
        spend).

   POSE SENTENCE: the drone-hover lean — hovering low over its shadow pool, thorax pitched
   forward off a torqued spine, both hooked forelimbs reaching out ahead at the joint-break, four
   wings thrown up and out at full spread-beat, head-mass (the compound eyes) leading the reach —
   never a level idle hover.

   SPINE-GESTURE SENTENCE: pelvis banks back and low, ribcage/thorax counter-rotates forward and
   up into the reach, neck continues the same forward lean into the huge head — one C-curve from
   hip to eye-domes, arms and forward-swept wings hung off that curve rather than bolted onto a
   plumb column.

   HOVER: body center floats ~0.20u above a ground-shadow pool disc at y≈0 (harness rule: no
   floating bbox) — the same "hover over a visible base, no strut" convention as the flying
   roster (mon-bat.js, mon-icemephit.js).

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['suburb-w1'], cell 6, fn buildChasme). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

export function buildChasme(){
  /* ---------- PALETTE (suburban-drab fly-demon: dull grey-green chitin body, HOT signature
     zones on the eye-domes + wing panes so law 3's >=140-RGB requirement lands on the loudest
     features, not buried in the dark thorax). ---------- */
  const P = {
    chitin: 0x4a5240, chitinDk: 0x323828, chitinLt: 0x5e6850,   // thorax/abdomen/limb chitin
    torso: 0x565e4a, torsoLt: 0x6a7458,                          // humanoid torso panels
    skin: 0x7a8264, skinDk: 0x5c6248,                            // exposed limb flesh-chitin
    eye: 0xd8305c, eyeLt: 0xf05888, eyeFacet: 0x8a1836,          // compound-eye domes — the hot signature
    wing: 0xd8dcc8, wingLt: 0xf2f4e8, wingDk: 0x909878,          // wing pane — bright, near-white lit face
    wingVein: 0x484e3c,
    proboscis: 0x241c18, proboscisLt: 0x362a22,
    hook: 0x1c1814,
    notebook: 0xc8b888, pencil: 0x8a5a30,
    disc: 0x2c2a22, discTop: 0x38352a,
  };

  /* ===== GROUND SHADOW POOL — hovering body needs a base so bbox min.y stays in [-0.01,0.08]. */
  {
    const r1 = ring(V(0, 0.002, 0), V(0,1,0), 0.34, 0.34, 16);
    const r2 = ring(V(0, 0.05, 0), V(0,1,0), 0.30, 0.30, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.052, 0), P.discTop);
    /* faint dark hover-shadow smudge riding the disc top (sells the hover, not just a base) */
    const s1 = ring(V(0.02, 0.054, 0.02), V(0,1,0), 0.17, 0.14, 12);
    capFan(s1, V(0.02, 0.056, 0.02), P.discTop, true);
  }

  const HOVER = 0.20;

  /* ===== SPINE C-CURVE landmarks — pelvis back-and-low, ribcage forward-and-up, neck continuing
     into the huge head. Everything else hangs off these points. ===== */
  const spine = {
    pelvis: V(-0.03, HOVER + 0.30, -0.06),
    waist:  V(-0.01, HOVER + 0.40, -0.02),
    rib:    V(0.02,  HOVER + 0.50,  0.05),
    chest:  V(0.04,  HOVER + 0.60,  0.11),
    shld:   V(0.05,  HOVER + 0.68,  0.15),
    neck:   V(0.06,  HOVER + 0.74,  0.20),
  };

  /* ===== PELVIS + LEGS — humanoid, tucked/trailing under the hover (not standing, not dangling
     limp — knees drawn up-and-back as if just lifted off the ground). ===== */
  {
    const pelvisRing = ring(V(spine.pelvis.x, spine.pelvis.y, spine.pelvis.z), V(0,1,0), 0.115, 0.10, 8, Math.PI/8);
    capFan(pelvisRing, V(spine.pelvis.x, spine.pelvis.y - 0.05, spine.pelvis.z), P.torsoLt, true);
    const legDefs = [
      { hip: V(0.07, spine.pelvis.y - 0.02, spine.pelvis.z - 0.03), knee: V(0.11, HOVER + 0.10, -0.14), foot: V(0.09, HOVER - 0.02, -0.22) },
      { hip: V(-0.07, spine.pelvis.y - 0.02, spine.pelvis.z - 0.03), knee: V(-0.10, HOVER + 0.14, -0.10), foot: V(-0.08, HOVER + 0.02, -0.18) },
    ];
    for(const L of legDefs){
      tube(L.hip, L.knee, 0.052, 0.040, 6, P.chitin);
      tube(L.knee, L.foot, 0.038, 0.022, 6, P.chitinDk, { capB: { hex: P.hook } });
    }
  }

  /* ===== HUMANOID TORSO — stacked bands along the spine C-curve, cx/cz following the landmarks
     so the whole column visibly banks-then-counters instead of running plumb. ===== */
  const torso = stack([
    { y: spine.pelvis.y, rx: 0.115, rz: 0.100, cx: spine.pelvis.x, cz: spine.pelvis.z, hex: P.torso },
    { y: spine.waist.y,  rx: 0.128, rz: 0.108, cx: spine.waist.x,  cz: spine.waist.z,  hex: P.torsoLt },
    { y: spine.rib.y,    rx: 0.142, rz: 0.118, cx: spine.rib.x,    cz: spine.rib.z,    hex: P.torso },
    { y: spine.chest.y,  rx: 0.150, rz: 0.122, cx: spine.chest.x,  cz: spine.chest.z,  hex: P.torsoLt },
    { y: spine.shld.y,   rx: 0.158, rz: 0.112, cx: spine.shld.x,   cz: spine.shld.z,   hex: P.torso },
    { y: spine.neck.y,   rx: 0.052, rz: 0.048, cx: spine.neck.x,   cz: spine.neck.z,   hex: P.skinDk },
  ], 9, {});

  /* ===== PINCHED ARTHROPOD ABDOMEN — trailing behind/below the pelvis off the torso's back,
     the segmented-constriction tell (ANATOMY-CANON ARTHROPOD). Reads even though the stance is
     bipedal, since it hangs off the humanoid pelvis like a slung tail-mass. ===== */
  {
    const pedicel = V(spine.pelvis.x - 0.02, spine.pelvis.y - 0.02, spine.pelvis.z - 0.10);
    tube(V(spine.pelvis.x, spine.pelvis.y + 0.01, spine.pelvis.z - 0.04), pedicel, 0.058, 0.028, 7, P.chitinDk);
    blob(pedicel.x - 0.06, pedicel.y - 0.02, pedicel.z - 0.10, 0.13, 0.095, 0.16, P.chitin, 8, 5);
    /* segmentation bands — thin dark rings riding the abdomen surface */
    const abdC = V(pedicel.x - 0.06, pedicel.y - 0.02, pedicel.z - 0.10);
    for(const dz of [-0.03, -0.09, -0.15]){
      const rr = ring(V(abdC.x, abdC.y, abdC.z + dz), V(0,0,1), 0.095, 0.075, 8, Math.PI/8);
      capFan(rr, V(abdC.x, abdC.y, abdC.z + dz), P.chitinDk);
    }
  }

  /* ===== HEAD — the huge fly head, the loudest signature. Compound-eye domes flank a downward
     proboscis. Head continues the spine's forward lean (never level). ===== */
  const headC = V(spine.neck.x + 0.03, spine.neck.y + 0.11, spine.neck.z + 0.05);
  {
    /* skull core */
    blob(headC.x, headC.y, headC.z, 0.085, 0.078, 0.088, P.chitin, 8, 5);
    /* two compound-eye domes — big, faceted-tinted blobs, the hot signature zone */
    const eyeOffsets = [ [0.075, 0.01, 0.03], [-0.075, 0.01, 0.03] ];
    for(const [ex, ey, ez] of eyeOffsets){
      const ec = V(headC.x + ex, headC.y + ey, headC.z + ez);
      blob(ec.x, ec.y, ec.z, 0.062, 0.058, 0.062, P.eye, 8, 5);
      /* facet speckle — small darker/brighter patches riding the dome surface so it doesn't
         read as one flat smooth sphere */
      for(const [fx, fy, fz, fh] of [
        [0.03, 0.02, 0.04, P.eyeLt], [-0.02, 0.03, 0.045, P.eyeFacet],
        [0.0, -0.02, 0.05, P.eyeLt], [0.035, -0.025, 0.035, P.eyeFacet],
      ]){
        blob(ec.x + fx, ec.y + fy, ec.z + fz, 0.018, 0.016, 0.012, fh, 5, 3);
      }
    }
    /* proboscis — thick tapered tube dropping down-and-forward off the skull's underside */
    const pRoot = V(headC.x, headC.y - 0.05, headC.z + 0.06);
    const pMid  = V(headC.x, headC.y - 0.13, headC.z + 0.11);
    const pTip  = V(headC.x, headC.y - 0.20, headC.z + 0.155);
    tube(pRoot, pMid, 0.026, 0.018, 6, P.proboscis);
    tube(pMid, pTip, 0.018, 0.007, 6, P.proboscisLt, { capB: { hex: P.proboscisLt } });
  }

  /* ===== ARMS — bent at the elbow (POSE-ANATOMY law 2, ~110-130deg), shoulders riding the
     reach (law 3), forearms terminating in a single curved insect hook instead of a hand. Both
     reach forward-and-out ahead of the hover lean. ===== */
  function hookedArm(sh, el, wr, hookHex){
    tube(sh, el, 0.052, 0.040, 6, P.skin);
    tube(el, wr, 0.038, 0.026, 6, P.skinDk);
    /* hook — a curved tapered tube bending down-and-in from the wrist */
    const hookMid = wr.clone().add(V(0.015, -0.03, 0.05));
    const hookTip = wr.clone().add(V(0.03, -0.075, 0.06));
    tube(wr, hookMid, 0.022, 0.016, 5, hookHex);
    tube(hookMid, hookTip, 0.016, 0.005, 5, hookHex, { capB: { hex: hookHex } });
  }
  const shR = V(spine.shld.x + 0.16, spine.shld.y - 0.01, spine.shld.z + 0.02);
  const elR = V(spine.shld.x + 0.29, spine.shld.y - 0.06, spine.shld.z + 0.20);
  const wrR = V(spine.shld.x + 0.30, spine.shld.y - 0.11, spine.shld.z + 0.36);
  hookedArm(shR, elR, wrR, P.hook);

  const shL = V(spine.shld.x - 0.16, spine.shld.y - 0.01, spine.shld.z + 0.02);
  const elL = V(spine.shld.x - 0.28, spine.shld.y - 0.05, spine.shld.z + 0.22);
  const wrL = V(spine.shld.x - 0.28, spine.shld.y - 0.10, spine.shld.z + 0.37);
  hookedArm(shL, elL, wrL, P.hook);

  /* ===== FOUR WINGS — two pairs, WINGED-family strut grammar (leading-edge spar + finger struts
     + membrane hung between/behind, never a flat sheet), thrown up-and-out at full spread-beat.
     Upper pair bigger/higher (primary signature read), lower pair smaller and swept lower. ===== */
  /* R1 SELF-CORRECTION (post r1 engine render): r1's wings were near-edge-on slivers — the
     `back` fan direction ran mostly parallel to the camera's sightline so the membrane panes
     presented almost no face area and vanished into thin grey lines (law 3 failure on the
     second signature). Rebuilt: struts now fan strongly toward +z (broadside to the dimetric
     camera) and the pane span (wid) roughly doubled, so each pane is a wide near-white sail
     facing the lens instead of a knife-edge. */
  function wing(root, spanDir, liftDir, len, wid, hexPane, hexPaneLt){
    const s = norm(spanDir), l = norm(liftDir);
    const tip = root.clone().addScaledVector(s, len).addScaledVector(l, len * 0.35);
    /* leading-edge spar (thickened) */
    tube(root, tip, 0.030, 0.012, 5, P.chitinDk);
    /* 3 finger struts fanning toward the camera (+z) from a mid-spar point, membrane panes
       stitched between — broad face area, never edge-on. */
    const spar2 = root.clone().addScaledVector(s, len * 0.55).addScaledVector(l, len * 0.55 * 0.35);
    const back = norm([s.x * -0.15, 0.12, 0.92]);
    const struts = [0.35, 0.62, 0.95].map((t) => {
      const base = root.clone().lerp(tip, t);
      return base.clone().addScaledVector(back, wid * (0.55 + t * 0.55));
    });
    tube(root, struts[0], 0.016, 0.007, 4, P.chitinDk);
    tube(spar2, struts[1], 0.014, 0.006, 4, P.chitinDk);
    tube(tip, struts[2], 0.012, 0.005, 4, P.chitinDk);
    /* membrane panes — bright, near-white lit faces, the loud secondary signature */
    const panes = [
      [root, spar2, struts[1], struts[0]],
      [spar2, tip, struts[2], struts[1]],
    ];
    for(const [a, b, c, d] of panes){
      quad(a, b, c, d, hexPane, 0.05);
      quad(a, d, c, b, hexPaneLt, 0.05); // faint backing pane so it reads from both sides
    }
    /* wing vein spar tint along the leading edge */
    quad(root, tip, tip.clone().add(V(0, 0.008, 0)), root.clone().add(V(0, 0.008, 0)), P.wingVein, 0.03);
  }
  const wingRootHi = V(spine.shld.x, spine.shld.y + 0.04, spine.shld.z - 0.01);
  wing(V(wingRootHi.x + 0.06, wingRootHi.y, wingRootHi.z), [1, 0.35, -0.05], [0, 1, 0.05], 0.32, 0.30, P.wing, P.wingLt);
  wing(V(wingRootHi.x - 0.06, wingRootHi.y, wingRootHi.z), [-1, 0.35, -0.05], [0, 1, 0.05], 0.32, 0.30, P.wing, P.wingLt);
  const wingRootLo = V(spine.chest.x, spine.chest.y - 0.02, spine.chest.z - 0.03);
  wing(V(wingRootLo.x + 0.06, wingRootLo.y, wingRootLo.z), [1, 0.05, -0.15], [0, 0.7, 0.1], 0.24, 0.22, P.wingDk, P.wing);
  wing(V(wingRootLo.x - 0.06, wingRootLo.y, wingRootLo.z), [-1, 0.05, -0.15], [0, 0.7, 0.1], 0.24, 0.22, P.wingDk, P.wing);

  /* ===== PTA GARNISH — small notebook + pencil bundle slung at the hip. Cheap countable prop. */
  {
    const nb = V(spine.pelvis.x + 0.10, spine.pelvis.y - 0.04, spine.pelvis.z + 0.06);
    quad(V(nb.x - 0.028, nb.y - 0.02, nb.z), V(nb.x + 0.028, nb.y - 0.02, nb.z),
         V(nb.x + 0.028, nb.y + 0.032, nb.z), V(nb.x - 0.028, nb.y + 0.032, nb.z), P.notebook, 0.04);
    tube(V(nb.x + 0.02, nb.y - 0.02, nb.z + 0.006), V(nb.x + 0.045, nb.y + 0.05, nb.z + 0.006), 0.006, 0.002, 4, P.pencil, { capB: { hex: P.pencil } });
  }

  return {};
}
