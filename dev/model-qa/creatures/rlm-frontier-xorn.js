/* dev/model-qa/creatures/rlm-frontier-xorn.js — the XORN landmark table (ELEMENTAL-RADIAL
   family — no ANATOMY-CANON section exists for it yet, family stub list only covers AVIAN/
   HUMANOID, so this is authored from first principles off the DIRECTION brief), Medium, CR 5,
   realm frontier, authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot,
   frontier-w1 cell 10, port 5310). Core identity: the radially symmetric earth-glutton — three
   arms, three legs, one huge top mouth, tunneling through solid rock to eat the ore vein a
   mining claim is chasing. Bespoke to the render key "xorn" — realm reskins ride this chassis
   narratively; the ochre/rust ore-vein palette below is the frontier claim-jumper read.

   FEATURE CHECKLIST (the ~1,400-1,700 budget buys):
     1. ELEMENTAL-RADIAL barrel body — a squat, tilted rock-hide barrel (no spine, no front/
        back — RADIAL symmetry at 120deg is the construction law for this family), three eyes
        set between the three arm-roots at the body's equator, all facing outward/up so the
        creature reads as aware from every side, not a faced humanoid.
     2. SIGNATURE — the top mouth: one enormous toothed maw dominating the crown of the body,
        jaw hinged wide, a ring of long inward-canted fangs, a dark throat well below the rim —
        the single loudest feature per law 4, carried at the highest point of the silhouette so
        it reads first at a squint.
     3. THREE arms at 120deg around the barrel, each a short, thick rock-limb ending in a
        3-claw grasping hand — one arm mid-shovel (raised, twisted toward the mouth, claws
        closed around a fistful of ore), the other two braced low and wide against the ground,
        planting the tripod that keeps the tilted body from toppling as it feeds.
     4. THREE stumpy legs at 120deg (offset from the arms), thick conical stubs ending in blunt
        clawed feet — braced wide, weight-bearing, no knees (a burrower's stub-leg, not a
        biped's).
     5. Ore chunks — a scatter of pale angular crystal/ore fragments: one cluster mid-flight
        between the shoveling claw and the open mouth (the "mid-toss" beat), a few more studding
        the rock-hide shoulders and lodged at the barrel's base, so the feeding reads as an
        action in progress, not a still life.
     6. Rust/ochre rock-hide value ladder (the law-3 high-value zone) — dark basalt-brown barrel
        flanks against pale sandstone/quartz-vein striping climbing toward the mouth rim and
        onto the fang ring, so the signature carries the brightest tones in the piece.

   POSE SENTENCE: the claim-jumper feast — body tilted off-vertical, braced on two low-planted
   legs and two low-braced arms while the third arm winds up and flings a fistful of pale ore
   chunks toward the gaping top mouth mid-toss, three eyes tracking outward from the equator,
   fangs bared around the falling ore — never a symmetrical at-rest tripod, always the half-
   second the meal is airborne.

   POSE NOTE (per ANATOMY-CANON's POSE-ANATOMY, adapted for a RADIAL body with no spine): this
   family has no pelvis-to-skull spine to gesture — the equivalent gesture line is the body's
   TILT AXIS (barrel leaned off-vertical toward the shoveling arm) plus the shovel-arm's own
   shoulder->elbow->wrist arc, which bends at a visible ~110deg elbow (never a straight ram) the
   same as any other limb per law 2 of that section; the two bracing arms/legs read as the
   "counterpose" that keeps a leaning, one-arm-loaded body from reading as toppling.

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0 (no fixed
   front — radial). Imported by ps1-sheet.html (SETS['frontier-w1'], cell 10, fn buildXorn). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}
function lerp(a, b, t){ return a.clone().lerp(b, t); }
/* rotate a point around the Y axis by degrees — the 120deg radial placement workhorse */
function rotY(p, deg){
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  return V(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
}

export function buildXorn(){
  /* ---------- PALETTE (dark basalt-brown flanks vs. pale sandstone/quartz-vein striping
     climbing toward the mouth rim and fang ring — the law-3 high-value zone rides the
     signature; ore chunks near-white so the mid-toss beat survives 1/3-res). ---------- */
  const P = {
    /* R2-CRITIC PASS: r2's rock/limb browns (lum ~40-70) sat almost on top of the dithered
       black void — the render showed a legible mouth-crown and nothing else; the six limbs
       (the "three arms, three legs" identity per the brief, law 4's chief criterion) vanished
       entirely. Lightened the whole basalt/limb/claw ladder so the barrel+limbs clear a legible
       mid-tone against the void, and pushed claw hex over the law-3 140 floor so all SIX limb
       tips (3 clawed hands + 3 clawed feet) carry a bright terminal point — the radial structure
       now reads as a ring of bright nubs around a dark mound + bright crown, not crown-only. */
    rock: 0x7a5a3f, rockDk: 0x54402d, rockLt: 0x96734f,   // basalt-brown barrel flanks, lightened
    vein: 0xc9a468, veinLt: 0xe8cf9a,                       // quartz/ore-vein striping, climbs to the mouth
    limb: 0x6b4e37, limbDk: 0x4a3626,                       // arm/leg rock-hide, lightened for legibility
    claw: 0xa8896a, clawDk: 0x7a6248,                        // grasping-hand/foot claws — pushed past the 140 floor
    mouth: 0x140d09, throat: 0x6e2418,                       // dark maw interior, warm throat glow-well
    fang: 0xf0e6cc, fangDk: 0xcfc09a,                        // pale inward-canted fang ring — highest value
    ore: 0xe4ddc8, oreDk: 0xb8ae8e,                          // pale angular ore chunks, mid-toss + studded
    eye: 0x140f0c, eyeGlow: 0xd8a840,                        // three equatorial eyes, ember-amber gaze
    disc: 0x2c241a, discTop: 0x362c1e,
  };

  /* ===== RIG — the tilt axis is the gesture line (no spine on a radial body): the whole
     barrel leans off-vertical toward the shovel arm, braced by the two low limbs on the
     opposite side. tilt() carries every torso/head/eye/arm-root point through the same lean
     so the body reads as one committed lean, not features glued onto a vertical barrel. ===== */
  const TILT_DEG = 24;          // barrel lean toward +x (the shovel-arm side) — r2-critic: 14deg
                                 // read as vertical-column-with-nubs at a squint (POSE-ANATOMY law
                                 // 1's "plumb line" failure adapted to the tilt-axis substitute);
                                 // steepened so the lean is a committed, unmissable read.
  const TILT_AXIS = norm([0, 0, 1]);   // lean rotates around +z so the barrel tips toward +x
  const PIVOT_Y = 0.30;         // lean pivots from mid-barrel, not the ground (keeps feet planted)
  function tilt(p){
    const rel = V(p.x, p.y - PIVOT_Y, p.z);
    const r = -TILT_DEG * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    // rotate around Z axis (tips +y toward +x)
    const rx = rel.x * c - rel.y * s;
    const ry = rel.x * s + rel.y * c;
    return V(rx, ry + PIVOT_Y, rel.z);
  }

  /* ===== BODY — squat radial barrel, no front/back, tilted per above. ===== */
  const bodyBands = [
    { y: 0.075, rx: 0.245, rz: 0.245, hex: P.rockDk },
    { y: 0.17,  rx: 0.300, rz: 0.300, hex: P.rock },
    { y: 0.30,  rx: 0.340, rz: 0.340, hex: P.rockLt },   // equator — arms/legs/eyes root here
    { y: 0.44,  rx: 0.310, rz: 0.310, hex: P.rock },
    { y: 0.555, rx: 0.230, rz: 0.230, hex: P.vein },      // shoulder ring below the mouth rim — value climb begins
    { y: 0.62,  rx: 0.150, rz: 0.150, hex: P.veinLt },    // mouth rim base
  ];
  stack(bodyBands, 10, { xform: tilt, capBot: { hex: P.rockDk, lift: 0.03 } });

  /* ===== SIGNATURE — the top mouth: enormous maw dominating the crown, jaw hinged wide,
     dark throat well, ring of long inward-canted fangs (law 4's one loud feature, carried at
     the silhouette's highest point per its own note). ===== */
  {
    // rim ring built as an UNTILTED local ring, then each point carried through tilt()
    const rimLocal = ring(V(0, 0.62, 0), V(0, 1, 0), 0.150, 0.150, 10, 0);
    const rimPts = rimLocal.map(tilt);
    const throatLocal = ring(V(0, 0.50, 0), V(0, 1, 0), 0.075, 0.075, 10, 0);
    const throatPts = throatLocal.map(tilt);
    // jaw rim (dark maw wall) down to a dark throat well
    stitch([rimPts, throatPts], () => P.mouth);
    capFan(throatPts, tilt(V(0, 0.44, 0)), P.throat, true);
  }
  /* rim lip ring — a short bright band riding the very top edge, the law-3 high-value zone
     landing squarely on the signature. */
  {
    const lipLocal = ring(V(0, 0.615, 0), V(0, 1, 0), 0.158, 0.158, 10, 0);
    const lipTopLocal = ring(V(0, 0.635, 0), V(0, 1, 0), 0.145, 0.145, 10, 0);
    stitch([lipLocal.map(tilt), lipTopLocal.map(tilt)], () => P.veinLt);
  }
  /* fang ring — long inward-canted fangs around the mouth rim, pale, highest value in the
     piece. Built pointing up-and-inward from the rim so they read as a closing trap. */
  {
    const n = 10;
    for(let i = 0; i < n; i++){
      const t = (i / n) * Math.PI * 2;
      const rx = 0.152, rz = 0.152;
      const rootLocal = V(Math.cos(t) * rx, 0.622, Math.sin(t) * rz);
      const inward = norm([-Math.cos(t) * 0.55, 1.0, -Math.sin(t) * 0.55]);
      const tipLocal = rootLocal.clone().addScaledVector(inward, 0.085);
      const root = tilt(rootLocal), tip = tilt(tipLocal);
      const side = new THREE.Vector3().crossVectors(V(0, 1, 0), norm([Math.cos(t), 0, Math.sin(t)])).normalize().multiplyScalar(0.018);
      const hex = (i % 2 === 0) ? P.fang : P.fangDk;
      quad(root.clone().sub(side), root.clone().add(side), tip, tip, hex, 0.05);
    }
  }

  /* ===== THREE EYES — set between the arm-roots at the equator, ember-amber gaze, facing
     outward/up so the creature reads aware from every side (no front). ===== */
  for(let k = 0; k < 3; k++){
    const ang = 60 + k * 120; // offset 60deg from arm roots (which sit at 0/120/240)
    const localDir = norm([Math.cos(ang * Math.PI / 180), 0, Math.sin(ang * Math.PI / 180)]);
    const local = V(localDir.x * 0.335, 0.335, localDir.z * 0.335);
    const p = tilt(local);
    blob(p.x, p.y, p.z, 0.032, 0.030, 0.028, P.eye, 6, 4);
    const glowLocal = local.clone().addScaledVector(localDir, 0.020).add(V(0, 0.008, 0));
    const g = tilt(glowLocal);
    blob(g.x, g.y, g.z, 0.015, 0.014, 0.013, P.eyeGlow, 4, 2);
  }

  /* ===== THREE ARMS at 120deg around the barrel equator — one mid-shovel (raised, twisted
     toward the mouth, claws closed around ore), two braced low and wide (the counterpose
     tripod). Each arm bends at a visible elbow per POSE-ANATOMY law 2, no straight rams. ===== */
  function armSegment(sh, el, wr, hex, hexDk){
    tube(sh, el, 0.068, 0.052, 6, hex);
    tube(el, wr, 0.050, 0.036, 6, hexDk, { phase: Math.PI / 6 });
    return wr;
  }
  function clawHand(wr, spreadDirs, hex, clawHex){
    blob(wr.x, wr.y, wr.z, 0.040, 0.036, 0.038, hex, 6, 4);
    for(const d of spreadDirs){
      const dn = norm(d);
      const mid = wr.clone().addScaledVector(dn, 0.036);
      const tip = wr.clone().addScaledVector(dn, 0.072);
      tube(wr, mid, 0.020, 0.015, 4, hex);
      tube(mid, tip, 0.015, 0.006, 4, clawHex, { capB: { hex: clawHex } });
    }
  }

  /* arm 0 (0deg, +x side) — THE SHOVEL ARM: raised, elbow bent ~110deg, twisted up toward the
     mouth, claws closed around a fistful of ore mid-toss. This is the arm the body tilts
     toward (TILT lean is +x), so the whole pose reads as one committed lean-and-throw. */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's arms/legs never broke the barrel's own
     silhouette — all three arms' reach was too short and folded back TOWARD the body, so the
     radial three-arm signature (law 4) and the mid-toss pose (law 5) both vanished into one
     rounded mound-with-a-mouth read. Every limb below reaches noticeably further from the
     body center and the shovel arm is raised clear ABOVE the mouth rim instead of tucking
     beside it, so the throwing gesture reads as a separate silhouette shape at a squint. */
  let shovelWrist;
  {
    const shLocal = V(0.335, 0.335, 0);
    const sh = tilt(shLocal);
    const elLocal = V(0.62, 0.58, 0.05);
    const el = tilt(elLocal);
    const wrLocal = V(0.58, 0.86, 0.16);
    const wr = tilt(wrLocal);
    armSegment(sh, el, wr, P.limb, P.limbDk);
    shovelWrist = wr;
    // closed claws (fingers curled around the ore, not splayed)
    clawHand(wr, [[0.35, 0.55, 0.55], [0.15, 0.70, 0.35], [-0.10, 0.65, 0.50]], P.limb, P.claw);
  }
  /* arm 1 (120deg) — braced low and WIDE against the ground, flared clear of the torso outline
     (part of the counterpose tripod) */
  {
    const ang = 120, d = norm([Math.cos(ang * Math.PI / 180), 0, Math.sin(ang * Math.PI / 180)]);
    const shLocal = V(d.x * 0.335, 0.335, d.z * 0.335);
    const sh = tilt(shLocal);
    const elLocal = shLocal.clone().addScaledVector(d, 0.30).add(V(0, -0.10, 0));
    const el = tilt(elLocal);
    const wrLocal = elLocal.clone().addScaledVector(d, 0.28).add(V(0, -0.16, 0));
    const wr = tilt(wrLocal);
    armSegment(sh, el, wr, P.limb, P.limbDk);
    clawHand(wr, [[d.x * 0.8, -0.5, d.z * 0.8 + 0.3], [d.x * 0.6, -0.6, d.z * 0.6 - 0.3], [d.x * 0.3, -0.7, d.z * 0.3]], P.limb, P.claw);
  }
  /* arm 2 (240deg) — braced low and WIDE, mirrors arm 1 across the barrel */
  {
    const ang = 240, d = norm([Math.cos(ang * Math.PI / 180), 0, Math.sin(ang * Math.PI / 180)]);
    const shLocal = V(d.x * 0.335, 0.335, d.z * 0.335);
    const sh = tilt(shLocal);
    const elLocal = shLocal.clone().addScaledVector(d, 0.30).add(V(0, -0.10, 0));
    const el = tilt(elLocal);
    const wrLocal = elLocal.clone().addScaledVector(d, 0.28).add(V(0, -0.16, 0));
    const wr = tilt(wrLocal);
    armSegment(sh, el, wr, P.limbDk, P.limb);
    clawHand(wr, [[d.x * 0.8, -0.5, d.z * 0.8 - 0.3], [d.x * 0.6, -0.6, d.z * 0.6 + 0.3], [d.x * 0.3, -0.7, d.z * 0.3]], P.limbDk, P.claw);
  }

  /* ===== THREE STUMPY LEGS at 120deg, offset 60deg from the arms — thick conical stubs,
     blunt clawed feet, no knee (a burrower's stub-leg). Planted wide, weight low, the base of
     the tripod that keeps the tilted body from toppling. ===== */
  /* Feet are pinned to TRUE ground (world y ~= 0.01, not a tilt-carried local offset) — the
     radial tilt rotates each leg-root by a different effective amount, so a fixed local
     y-drop under-reaches on one side and drives the opposite leg's toes underground. Hip stays
     tilt-carried (rides the barrel); only the foot/toe placement is ground-anchored. */
  function stubLeg(hipLocal, dirLocal, hex, hexDk){
    const hip = tilt(hipLocal);
    /* the hip-foot axis is oblique (tilt puts hips at varying heights per leg), so the tube's
       own foot-end RING (radius 0.070) can dip below its center by up to ~r*sin(axis-tilt) —
       a flat y=0.012 target left one leg's ring bottom well underground. 0.08 + a shorter
       0.12 horizontal reach keeps every leg's ring comfortably clear of true ground. */
    const outward = dirLocal.clone().multiplyScalar(0.24);
    const foot = V(hip.x + outward.x, 0.10, hip.z + outward.z);
    tube(hip, foot, 0.095, 0.070, 7, hex);
    const side = new THREE.Vector3().crossVectors(V(0, 1, 0), dirLocal).normalize();
    for(const s of [-1, 0, 1]){
      const spread = dirLocal.clone().addScaledVector(side, s * 0.5).normalize();
      const mid = foot.clone().addScaledVector(spread, 0.045).add(V(0, 0.006, 0));
      const tip = foot.clone().addScaledVector(spread, 0.085).add(V(0, 0.010, 0));
      tube(foot, mid, 0.028, 0.022, 4, hexDk);
      tube(mid, tip, 0.022, 0.010, 4, P.claw, { capB: { hex: P.claw } });
    }
  }
  for(let k = 0; k < 3; k++){
    const ang = k * 120; // 0/120/240, same phase as arms but LOW on the barrel (offset by y, not angle)
    const legAng = ang + 60; // offset 60deg from arms so legs don't stack under arms
    const d = norm([Math.cos(legAng * Math.PI / 180), 0, Math.sin(legAng * Math.PI / 180)]);
    const hipLocal = V(d.x * 0.30, 0.14, d.z * 0.30);
    stubLeg(hipLocal, d, k === 0 ? P.rock : P.rockDk, k === 0 ? P.rockDk : P.rock);
  }

  /* ===== ORE CHUNKS — pale angular fragments: a cluster mid-flight between the shovel claw
     and the open mouth (the mid-toss beat, law 5), plus a few studding the shoulders/base. ===== */
  function oreChunk(c, r, hex){
    // small irregular tetra-ish chunk: 4 quads off a jittered core, cheap and angular
    const a = c.clone().add(V(-r, -r * 0.6, -r * 0.4));
    const b = c.clone().add(V(r, -r * 0.5, r * 0.5));
    const d2 = c.clone().add(V(-r * 0.3, r * 0.8, r * 0.6));
    const e = c.clone().add(V(r * 0.4, -r * 0.2, -r * 0.9));
    quad(a, b, d2, d2, hex, 0.08);
    quad(b, e, d2, d2, hex, 0.10);
    quad(e, a, d2, d2, hex, 0.06);
    quad(a, b, e, e, hex, 0.09);
  }
  {
    const mouthRimLocal = V(0, 0.66, 0);
    const mouthRim = tilt(mouthRimLocal);
    const toss = [0.15, 0.35, 0.55, 0.75];
    for(let i = 0; i < toss.length; i++){
      const t = toss[i];
      const p = lerp(shovelWrist, mouthRim, t).add(V(0, 0.07 - Math.pow(t - 0.5, 2) * 0.25, 0));
      oreChunk(p, 0.034 - i * 0.003, i % 2 === 0 ? P.ore : P.oreDk);
    }
  }
  /* a few ore chunks studding the shoulders and lodged at the barrel base */
  {
    const studLocal = [
      V(0.22, 0.42, 0.18), V(-0.20, 0.40, -0.10), V(0.05, 0.20, 0.28), V(-0.15, 0.12, -0.24),
    ];
    for(let i = 0; i < studLocal.length; i++){
      const p = tilt(studLocal[i]);
      oreChunk(p, 0.024, i % 2 === 0 ? P.oreDk : P.ore);
    }
  }

  /* base disc (Medium: r=0.48) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.48, 0.48, 18);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.46, 0.46, 18);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
