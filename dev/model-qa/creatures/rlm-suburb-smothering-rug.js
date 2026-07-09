/* dev/model-qa/creatures/rlm-suburb-smothering-rug.js — the SMOTHERING RUG (suburb, Medium,
   CR 1/2), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot,
   suburb-w1 cell 8, 2026-07-08). Core identity: a shag basement carpet that smothers bare feet —
   the animated rug of smothering, caught mid-pounce. ANATOMY-CANON family: AMORPHOUS-SHEET (no
   locked family section yet — treated as a rectangular sheet caught mid-flight, corners as
   grasping points, body rippled in a wave; POSE-ANATOMY's spine-gesture law still applies with
   the CENTERLINE CURVE standing in for a spine).

   FEATURE CHECKLIST (came in light at ~314 tris — a flat-sheet whole-object has far less
   countable-feature surface than a limbed figure; kept honest rather than padded per
   MODEL-FOUNDRY's "an untagged/exempt/red state that tells the truth beats a green that lies"):
     1. Rectangular rug body lofted along a C-curl centerline — trailing back edge held HIGH
        (fringe flying), arcing up over a crest, curling forward-and-down toward the front.
     2. TWO forward corners pulled out into grasping points (claw-tipped tabs) with a receded
        scoop between them — the "hands reaching for the ankle" read, not a straight front hem.
     3. SIGNATURE — a pale geometric border-pattern band (checker motif) riding the top face near
        the crest, the loudest value in frame (law 3's >=140 RGB zone).
     4. Flying fringe — a row of thin tapered tassels off the trailing back edge and both side
        edges, jittered outward/backward to sell "airborne," not hanging limp.
     5. Shag texture — heavy quad jitter on every body panel + a scatter of small tuft blobs
        along the corners/fringe line, cheap countable shag without a body-budget blowout.
     6. Ground-shadow pool underneath (hover-unit grounding convention) — the rug is airborne at
        its lowest point (~0.14u), so the shadow pool anchors bbox min.y into the harness band.

   POSE SENTENCE: the rug caught mid-pounce in a C-curl, trailing edge flung up and back with
   fringe flying, body cresting overhead, then curling forward and down so both front corners
   reach out ahead of the crest like two grasping hands about to close over a bare foot — never
   a flat resting mat.
   SPINE-GESTURE SENTENCE: the centerline curve stands in for a spine — it rises from the low
   front corners, arcs up and back through the crest, and continues into the flung-high trailing
   edge, one continuous C sweep from grasp-point to fringe-tip that the squint still reads as a
   single line of action.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Hover flag: lowest body point sits at ~0.14u; a ground-shadow blob (the
   rlm-cosmic-stirge.js convention) keeps bbox min.y inside the harness's [-0.01,0.08] band.
   Imported by ps1-sheet.html (SETS['suburb-w1'], cell 8, fn buildSmotheringRug). */
import { V, quad, tube, blob } from '../probe-lib.js';

export function buildSmotheringRug(){
  /* ---------- PALETTE (suburb garnish: dated 1970s harvest-gold/rust basement shag; pale
     geometric border pattern is the signature high-value zone). ---------- */
  const P = {
    shag: 0x9a6a2e, shagDk: 0x6e4a1e, shagLt: 0xb8823e,     // harvest-gold/rust shag, mid body
    under: 0x5a3a1c, underDk: 0x3e2712,                      // dusty underside, kept dark vs void
    pattern: 0xe8dcb8, patternDk: 0xc9b888,                  // SIGNATURE pale geometric border, >=140 RGB
    fringe: 0xc9a458, fringeDk: 0x9a7838,                     // flying fringe tassels
    tuft: 0x7c5226,                                           // shag tuft accents
    shadow: 0x1c1410,
  };

  /* ---------- ground-shadow pool (hover-unit grounding convention) — a faint dark pool under
     the pounce so bbox min.y lands inside [-0.01,0.08] even though the rug itself floats.
     R2 SELF-CORRECTION (post r1 render): r1's pool (rx 0.30, rz 0.24) read as a big flat dark
     slab that fused into the rug's own silhouette instead of a small ground pool — shrunk well
     under the body's footprint and pulled forward under the leading corners (where the "weight"
     of the pounce reads) so it stays legibly a shadow, not a second body mass. */
  blob(0.02, 0.030, 0.24, 0.16, 0.014, 0.12, P.shadow, 8, 3);

  /* ---------- CENTERLINE — the C-curl "spine": low front, arcing up through a crest, into a
     flung-high trailing back edge. Each rib carries a half-width for the sheet loft. ---------- */
  const ribs = [
    { y: 0.60, z: -0.30, hw: 0.15 },   // s0 — trailing back edge, flung high, narrow (fringe root)
    { y: 0.58, z: -0.10, hw: 0.24 },   // s1
    { y: 0.50, z:  0.06, hw: 0.31 },   // s2 — crest, widest point (the signature band rides here)
    { y: 0.36, z:  0.18, hw: 0.28 },   // s3 — pre-front, narrowing toward the reaching corners
  ];
  const edgeL = ribs.map(r => V(-r.hw, r.y, r.z));
  const edgeR = ribs.map(r => V(r.hw, r.y, r.z));

  /* front grasping corners — two forward-reaching points with a receded scoop between them */
  const cornerL = V(-0.30, 0.14, 0.40);
  const cornerR = V(0.30, 0.14, 0.40);
  const frontMid = V(0.0, 0.22, 0.26);   // receded scoop center — the "palm" gap between the hands

  /* ---------- TOP SURFACE — main body panels, alternating shag hexes, heavy jitter for a
     scruffy shag read (law: shag texture via jitter, no per-strand geometry cost). ---------- */
  for(let i = 0; i < ribs.length - 1; i++){
    const hexA = (i % 2 === 0) ? P.shag : P.shagLt;
    const hexB = (i % 2 === 0) ? P.shagDk : P.shag;
    quad(edgeL[i], edgeR[i], edgeR[i + 1], edgeL[i + 1], hexA, 0.16);
    /* thin centerline crease so the panel doesn't read as one dead-flat plate */
    if(i === 1){
      quad(V(0, ribs[i].y, ribs[i].z), edgeR[i], edgeR[i + 1], V(0, ribs[i + 1].y, ribs[i + 1].z), hexB, 0.12);
    }
  }

  /* ---------- SIGNATURE — pale geometric border-pattern band (checker motif), riding the top
     face at the crest (widest, most-forward-facing panel) — the loudest value in the frame. ---------- */
  {
    const bandIn = 0.055;
    const y0 = ribs[2].y, z0 = ribs[2].z, hw0 = ribs[2].hw;
    const y1 = ribs[1].y, z1 = ribs[1].z, hw1 = ribs[1].hw;
    const cellCount = 6;
    for(let i = 0; i < cellCount; i++){
      const t0 = i / cellCount, t1 = (i + 1) / cellCount;
      const xa0 = -hw0 + bandIn + t0 * (2 * (hw0 - bandIn));
      const xa1 = -hw0 + bandIn + t1 * (2 * (hw0 - bandIn));
      const xb0 = -hw1 + bandIn + t0 * (2 * (hw1 - bandIn));
      const xb1 = -hw1 + bandIn + t1 * (2 * (hw1 - bandIn));
      const hex = (i % 2 === 0) ? P.pattern : P.patternDk;
      quad(V(xa0, y0 - 0.01, z0 + 0.008), V(xa1, y0 - 0.01, z0 + 0.008),
           V(xb1, y1 - 0.01, z1 + 0.006), V(xb0, y1 - 0.01, z1 + 0.006), hex, 0.03);
    }
  }

  /* ---------- FRONT GRASPING CORNERS — claw-tipped tabs reaching forward-down, with a receded
     scoop between them (the "two hands, gap between the palms" read). ---------- */
  {
    // left corner: rib3 edge -> tip, plus scoop tri to the receded front-mid
    quad(edgeL[3], cornerL, frontMid, edgeL[3], P.shag, 0.10);
    quad(frontMid, cornerR, edgeR[3], frontMid, P.shag, 0.10);
    // claw-tipped thickness at each grasping point — a short tapered tube so the tip reads with
    // real volume, not a knife-edge vanish (law 3's >=0.04u floor)
    tube(edgeL[3].clone().lerp(cornerL, 0.35), cornerL, 0.055, 0.018, 5, P.shagDk, { capB: { hex: P.fringeDk } });
    tube(edgeR[3].clone().lerp(cornerR, 0.35), cornerR, 0.055, 0.018, 5, P.shagDk, { capB: { hex: P.fringeDk } });
  }

  /* ---------- UNDERSIDE — a dark mirrored panel so the sheet reads solid from below/behind,
     opposite winding, kept dark but still lifted off the (10,9,8) void per law 3. ---------- */
  {
    const backEdgeL = ribs.map(r => V(-r.hw * 0.94, r.y - 0.02, r.z - 0.02));
    const backEdgeR = ribs.map(r => V(r.hw * 0.94, r.y - 0.02, r.z - 0.02));
    for(let i = 0; i < ribs.length - 1; i++){
      const hex = (i % 2 === 0) ? P.under : P.underDk;
      quad(backEdgeR[i], backEdgeL[i], backEdgeL[i + 1], backEdgeR[i + 1], hex, 0.10);
    }
    quad(backEdgeR[3], backEdgeL[3], frontMid, frontMid, P.underDk, 0.08);
  }

  /* ---------- FLYING FRINGE — thin tapered tassels off the trailing back edge and both side
     edges, jittered outward/backward so it reads as airborne, not hanging limp. ---------- */
  {
    /* R2 SELF-CORRECTION (post r1 render): r1's tassels ran 0.34-0.40u long and half of them
       (a random pale pick) rendered near-white — they read as a porcupine-quill burst that
       overpowered the rug silhouette instead of trailing fringe. Halved the reach, dropped the
       pale-random pick for a consistent dull-fringe hex, and angled them to trail BACK along the
       curl (closer to the body line) rather than radiating straight off it. */
    const fringeSpots = [];
    // trailing back edge (s0) — the highest, most-flung tassels
    for(let i = 0; i < 5; i++){
      const t = i / 4;
      fringeSpots.push({ root: V(-ribs[0].hw + t * 2 * ribs[0].hw, ribs[0].y, ribs[0].z), dir: V((t - 0.5) * 0.16, 0.09, -0.16) });
    }
    // left + right side edges (between s0 and s1) — trailing outward
    for(let i = 0; i < 2; i++){
      const t = 0.3 + i * 0.4;
      const ry = ribs[0].y + (ribs[1].y - ribs[0].y) * t, rz = ribs[0].z + (ribs[1].z - ribs[0].z) * t;
      fringeSpots.push({ root: V(-ribs[0].hw - (ribs[1].hw - ribs[0].hw) * t, ry, rz), dir: V(-0.15, 0.02, -0.07) });
      fringeSpots.push({ root: V(ribs[0].hw + (ribs[1].hw - ribs[0].hw) * t, ry, rz), dir: V(0.15, 0.02, -0.07) });
    }
    for(const f of fringeSpots){
      const tip = f.root.clone().add(f.dir);
      tube(f.root, tip, 0.018, 0.005, 4, P.fringe, { capB: { hex: P.fringeDk } });
    }
  }

  /* ---------- SHAG TUFT ACCENTS — a small scatter of tuft blobs along the corners/crest line,
     cheap countable shag detail without covering the whole body in geometry. ---------- */
  {
    const tuftSpots = [
      V(-0.18, 0.52, 0.02), V(0.16, 0.51, 0.04), V(-0.30, 0.36, 0.18), V(0.28, 0.35, 0.19),
      V(-0.10, 0.59, -0.16), V(0.12, 0.585, -0.14),
    ];
    for(const c of tuftSpots){
      blob(c.x, c.y + 0.02, c.z, 0.028, 0.018, 0.024, P.tuft, 4, 2);
    }
  }
}
