/* dev/model-qa/creatures/rlm-suburb-lich.js — the LICH landmark table (HUMANOID family, skeletal
   archmage variant, Medium, CR 21, realm suburb), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (2026-07-08 foundry pilot, suburb-w1 cell 10). Core identity: the undying
   will of a bankrupt developer, still building empty houses forever — a skeletal archmage in
   tattered ornate finery, crowned, hovering just off the ground mid-incantation.

   FEATURE CHECKLIST (the ~1,400-1,800 budget buys):
     1. HUMANOID skeletal frame per ANATOMY-CANON — ribcage/spine/skull built as a true skeleton
        (visible rib bars, socketed joints), NOT a fleshed body — vs. the plain skeleton and the
        wight, this one is buried under ornate ROBES so only hands/skull/upper spine show bone.
     2. Ornate tattered robes — a developer's ruined finery: a heavy shoulder-mantle, a long
        robe-skirt that streams DOWN past where feet would be (never touching ground — the hover
        tell), ragged hem edges (countable tatter-strips, cheap silhouette noise).
     3. SIGNATURE (dual glow, the two high-value zones law 3 needs): (a) one hand raised
        palm-out with a bright SPELL-GLOW mote hovering just above the palm; (b) the other hand
        clutched to the chest holding a glowing PHYLACTERY (a small crystal/reliquary) — both
        glows pitched near-white/hot against the dark robe so they read first at a squint.
     4. Crowned skull — a jagged circlet/crown riding the skull, eye sockets lit with a cold
        ember glow (the third, dimmer light, tying the head into the same value family as the
        two hand-glows without competing with them).
     5. Hover-shadow pool — a dark ground ellipse directly under the streaming hem, satisfying
        the harness's hover bbox rule (min.y in [-0.01,0.08]) while selling "floating," not
        "standing."
     6. Blueprint/ledger tatters — a few pale scrap-parchment strips caught in the robe hem
        (deed pages, blueprints the developer still can't let go of), a cheap flavor tell.

   POSE SENTENCE: mid-incantation rise — hovering just clear of its own shadow pool, robes and
   ledger-scraps streaming down past where feet should be, spine torqued back and up into the
   cast, one arm flung high with the palm-out spell-glow leading the gesture, the other elbow
   pulled tight to the chest cradling the phylactery's glow, skull tipped back into the crown's
   light — never a resting float or a level idle stare.

   SPINE-GESTURE SENTENCE: pelvis→ribcage→skull runs one continuous backward-leaning C-curve
   (pelvis pitched back and up off the disc, ribcage arching further back, skull tipping back
   into the crown-light), with the raised-arm shoulder riding UP and the torso twisting toward
   the cast so the whole figure reads as one diagonal line from the trailing hem to the raised
   spell-hand, not a plumb column with limbs bolted on.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['suburb-w1'], cell 10, fn buildLich). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* one bone-hand: wrist -> spread bony fingers (thin tapered tubes, not fists — a spellcaster's
   open hand). spreadDirs are local-frame direction arrays off the wrist. */
function boneHand(wr, spreadDirs, boneHex, boneDkHex){
  blob(wr.x, wr.y, wr.z, 0.026, 0.022, 0.024, boneHex, 6, 4);
  for(const d of spreadDirs){
    const dn = norm(d);
    const mid = wr.clone().addScaledVector(dn, 0.045);
    const tip = wr.clone().addScaledVector(dn, 0.085);
    tube(wr, mid, 0.016, 0.011, 4, boneHex);
    tube(mid, tip, 0.011, 0.005, 4, boneDkHex, { capB: { hex: boneDkHex } });
  }
}

export function buildLich(){
  /* ---------- PALETTE (suburb VS register: bone-pale skeleton lifted off the void, dark ruined
     robe, the two glows near-white/hot — the law-3 high-value zones — plus a dim cold-ember eye
     glow tying the crown into the same light family). ---------- */
  const P = {
    bone: 0xd8cdb0, boneDk: 0xaa9c82, boneLt: 0xece4c4,           // pale bone, lifted clear of void
    rib: 0xc4b896, ribDk: 0x8f8266,                                 // ribcage bars (slightly cooler than skull)
    robe: 0x453a4c, robeDk: 0x2c2432, robeLt: 0x5c4c62,             // dark ruined mantle/robe cloth, lifted off void (R1 fix)
    mantle: 0x5c3c54, mantleLt: 0x76506c,                            // shoulder-mantle, plum-wine, lifted for silhouette pop
    hem: 0x241c28,                                                    // deepest hem shadow
    scrap: 0xc8ba8e, scrapDk: 0x9a8c64,                              // pale deed/blueprint scrap tatters
    crown: 0x6a5a2a, crownLt: 0x9a8442,                              // tarnished gold-brass circlet
    eye: 0x0e0c10, eyeGlow: 0xe07830, eyeGlowHot: 0xffb060,          // cold ember eye-sockets
    spellCore: 0xfff2c8, spellHot: 0xffffff, spellMid: 0xffd888,     // spell-glow mote — near-white
    phyCore: 0xd0ffe8, phyHot: 0xffffff, phyMid: 0x8fffc0,           // phylactery glow — cool near-white/green
    phyCase: 0x4a4438, phyCaseLt: 0x6a6250,                          // small reliquary casing
    shadow: 0x0f0d0b, disc: 0x2a2620, discTop: 0x342f27,
  };

  /* ===== SPINE FRAME — pelvis -> ribcage -> skull, one continuous backward C-curve. Pelvis
     lifted off the disc (hover) and pitched back; ribcage arches further back and up; skull tips
     back into the crown-light. All later bands (arms, robe, mantle) hang off this curve. ===== */
  const L = {
    pelvisY: 0.42, waistY: 0.58, ribY: 0.76, chestY: 0.92, shldY: 1.04, neckY: 1.12,
    jawY: 1.17, cheekY: 1.215, browY: 1.255, crownY: 1.30,
  };
  const cz = { pelvis: -0.02, waist: -0.06, rib: -0.13, chest: -0.18, shld: -0.20, neck: -0.16, jaw: -0.10 };

  /* pelvis/hip ring (small — this is a skeleton, not a fleshed torso) */
  {
    const r1 = ring(V(0, L.pelvisY, cz.pelvis), V(0, 1, 0), 0.085, 0.070, 8);
    const r2 = ring(V(0, L.pelvisY - 0.05, cz.pelvis + 0.01), V(0, 1, 0), 0.060, 0.050, 8);
    stitch([r2, r1], () => P.bone);
    capFan(r2, V(0, L.pelvisY - 0.07, cz.pelvis + 0.02), P.boneDk);
  }
  /* spine bar, pelvis -> ribcage base */
  tube(V(0, L.pelvisY + 0.03, cz.pelvis), V(0.01, L.ribY - 0.04, cz.rib + 0.02), 0.020, 0.018, 5, P.boneDk);

  /* ribcage — a small stack of ribcage bands, torqued back along cz, with a few visible rib bars
     poking out either side (the "this is a skeleton" tell) between the robe panels. */
  const ribcage = stack([
    { y: L.waistY, rx: 0.100, rz: 0.075, cx: 0.00, cz: cz.waist, hex: P.rib },
    { y: L.ribY,   rx: 0.135, rz: 0.095, cx: 0.00, cz: cz.rib,   hex: P.ribDk },
    { y: L.chestY, rx: 0.148, rz: 0.100, cx: -0.01, cz: cz.chest, hex: P.rib },
    { y: L.shldY,  rx: 0.155, rz: 0.088, cx: -0.01, cz: cz.shld, hex: P.ribDk },
    { y: L.neckY,  rx: 0.045, rz: 0.042, cx: -0.01, cz: cz.neck, hex: P.bone },
  ], 9, {});

  /* visible rib bars either side of the ribcage band, poking through the open robe front */
  for(const s of [-1, 1]){
    for(let i = 0; i < 3; i++){
      const y = L.ribY - 0.02 + i * 0.055;
      const cxr = s * (0.075 + i * 0.006);
      const czr = cz.rib + 0.03 + i * 0.01;
      tube(V(s * 0.03, y, czr - 0.03), V(cxr, y - 0.01, czr + 0.05), 0.012, 0.008, 4, i % 2 === 0 ? P.bone : P.ribDk);
    }
  }

  /* ===== SKULL — thrown back into the crown-light, jaw set (not dropped — a caster's focus, not
     the yuan-ti's agony). Crown riding the crown band. ===== */
  const head = stack([
    { y: L.jawY,   rx: 0.060, rz: 0.068, cx: -0.01, cz: cz.jaw,        hex: P.bone },
    { y: L.cheekY, rx: 0.070, rz: 0.076, cx: -0.02, cz: cz.jaw + 0.02, hex: P.boneLt },
    { y: L.browY,  rx: 0.066, rz: 0.070, cx: -0.03, cz: cz.jaw - 0.02, hex: P.bone },
    { y: L.crownY, rx: 0.050, rz: 0.052, cx: -0.04, cz: cz.jaw - 0.08, hex: P.boneDk },
  ], 8, { capTop: { hex: P.boneDk, lift: 0.010 } });

  /* jaw seam — dark line under the cheek band, and a few bared teeth */
  {
    const jz = cz.jaw + 0.01;
    quad(V(-0.026, L.jawY - 0.006, jz + 0.058), V(0.026, L.jawY - 0.006, jz + 0.058),
         V(0.020, L.jawY - 0.028, jz + 0.045), V(-0.020, L.jawY - 0.028, jz + 0.045), P.eye, 0.02);
    for(const s of [-1, -0.35, 0.35, 1]){
      tube(V(s * 0.017, L.jawY - 0.004, jz + 0.058), V(s * 0.017, L.jawY - 0.020, jz + 0.052), 0.005, 0.002, 3, P.boneLt);
    }
  }

  /* eye sockets — cold ember glow, dim relative to the two signature glows */
  for(const s of [-1, 1]){
    const ex = -0.03 + s * 0.030, ey = L.browY + 0.004, ez = cz.jaw - 0.01 + 0.052;
    blob(ex, ey, ez, 0.014, 0.012, 0.010, P.eye, 5, 3);
    blob(ex, ey + 0.002, ez + 0.006, 0.007, 0.006, 0.006, P.eyeGlow, 4, 2);
    blob(ex, ey + 0.002, ez + 0.009, 0.003, 0.003, 0.003, P.eyeGlowHot, 4, 2);
  }

  /* crown/circlet — jagged tarnished-gold band riding the crown ring, spiking up */
  {
    const cY = L.crownY, ccz = cz.jaw - 0.08;
    const r1 = ring(V(-0.04, cY + 0.008, ccz), V(0, 1, 0), 0.052, 0.054, 8);
    const r2 = ring(V(-0.04, cY + 0.028, ccz), V(0, 1, 0), 0.046, 0.048, 8);
    stitch([r1, r2], (i) => (i % 2 === 0 ? P.crown : P.crownLt));
    const spikeAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2, Math.PI / 4, -Math.PI / 4];
    for(const a of spikeAngles){
      const bx = -0.04 + Math.cos(a) * 0.049, bz = ccz + Math.sin(a) * 0.049;
      tube(V(bx, cY + 0.024, bz), V(bx * 1.06, cY + 0.062, bz * 1.06), 0.010, 0.002, 3, P.crownLt, { capB: { hex: P.crownLt } });
    }
  }

  /* ===== SHOULDER-MANTLE + ROBE-SKIRT — the ornate ruined finery burying the skeleton below the
     ribcage. Mantle rides the shoulders, robe streams DOWN and back off the pelvis past where
     feet would be — the hover tell — never touching the ground plane itself. ===== */
  {
    /* shoulder mantle — a broad collar band draped over the shoulder ribcage, torn hem */
    const m1 = ring(V(-0.01, L.shldY + 0.02, cz.shld), V(0, 1, 0), 0.185, 0.115, 10);
    const m2 = ring(V(-0.01, L.shldY - 0.08, cz.shld + 0.04), V(0, 1, 0), 0.215, 0.135, 10);
    stitch([m1, m2], (i) => (i % 2 === 0 ? P.mantle : P.mantleLt));
    capFan(m1, V(-0.01, L.shldY + 0.05, cz.shld), P.mantleLt);

    /* robe body — a widening tube from waist down through where hips/legs would be, streaming
       down and slightly back (following the pelvis's backward pitch), tapering to ragged tatters
       well ABOVE the ground plane. */
    const robePts = [
      V(0.00, L.pelvisY + 0.02, cz.pelvis), V(0.01, 0.28, cz.pelvis - 0.02),
      V(0.015, 0.17, cz.pelvis - 0.04), V(0.02, 0.12, cz.pelvis - 0.05),
    ];
    const robeRad = [0.135, 0.175, 0.200, 0.210];
    for(let i = 0; i < robePts.length - 1; i++){
      tube(robePts[i], robePts[i + 1], robeRad[i], robeRad[i + 1], 10, i % 2 === 0 ? P.robe : P.robeDk, { phase: Math.PI / 10 });
    }
    /* ragged tatter-strips off the robe's lower rim, uneven lengths, hanging just clear of the
       shadow pool — the countable silhouette-noise tell */
    const rimC = robePts.at(-1), rimR = robeRad.at(-1);
    const tatterN = 9;
    for(let i = 0; i < tatterN; i++){
      const a = (i / tatterN) * Math.PI * 2;
      const bx = rimC.x + Math.cos(a) * rimR * 0.92, bz = rimC.z + Math.sin(a) * rimR * 0.92;
      const drop = 0.03 + ((i * 37) % 5) * 0.012;
      const tipY = Math.max(0.055, rimC.y - drop);
      tube(V(bx, rimC.y, bz), V(bx * 1.03, tipY, bz * 1.03), 0.024, 0.004, 4, i % 3 === 0 ? P.hem : P.robeDk, { capB: { hex: P.hem } });
    }
    /* pale scrap-parchment strips caught in a few tatters — deed pages the developer can't let go of */
    for(const i of [1, 4, 7]){
      const a = (i / tatterN) * Math.PI * 2;
      const bx = rimC.x + Math.cos(a) * rimR * 0.75, bz = rimC.z + Math.sin(a) * rimR * 0.75;
      const scrapTip = Math.max(0.055, rimC.y - 0.07);
      quad(V(bx - 0.014, rimC.y - 0.02, bz), V(bx + 0.014, rimC.y - 0.02, bz),
           V(bx + 0.010, scrapTip, bz + 0.01), V(bx - 0.010, scrapTip, bz + 0.01), P.scrap, 0.03);
    }
  }

  /* ===== HOVER-SHADOW POOL — dark ground ellipse directly under the streaming hem, so the
     harness bbox (min.y) still lands in range while the figure itself floats clear. ===== */
  {
    const pool = ring(V(0.02, 0.006, cz.pelvis - 0.10), V(0, 1, 0), 0.20, 0.17, 14);
    capFan(pool, V(0.02, 0.006, cz.pelvis - 0.10), P.shadow);
  }

  /* ===== ARMS — SIGNATURE. Shoulders ride with the raised arm (POSE-ANATOMY rule 3): the
     spell-hand shoulder lifts and the torso twists toward it; the phylactery-arm elbow tucks
     tight to the ribcage (counterpose per rule 4). Both arms bend 100-150deg at the elbow. ===== */
  {
    /* raised spell-arm (viewer's right / model +x): shoulder -> elbow -> wrist, palm out and up,
       spell-glow mote hovering just above the open palm. ~120 deg elbow bend. */
    const shR = V(0.155, L.shldY + 0.01, cz.shld + 0.04);
    const elR = V(0.235, L.shldY + 0.20, cz.shld - 0.05);
    const wrR = V(0.205, L.shldY + 0.42, cz.shld - 0.16);
    tube(shR, elR, 0.026, 0.021, 6, P.bone);
    tube(elR, wrR, 0.020, 0.014, 6, P.boneDk);
    boneHand(wrR, [[0.35, 0.55, -0.25], [0.10, 0.75, -0.15], [-0.15, 0.75, -0.02], [-0.35, 0.55, 0.18]], P.bone, P.boneDk);
    /* the spell-glow mote, hovering just above the open palm — brightest single point on the model */
    {
      const mc = wrR.clone().add(V(0.02, 0.075, -0.08));
      blob(mc.x, mc.y, mc.z, 0.030, 0.030, 0.030, P.spellMid, 6, 4);
      blob(mc.x, mc.y, mc.z, 0.018, 0.018, 0.018, P.spellCore, 6, 4);
      blob(mc.x, mc.y, mc.z, 0.009, 0.009, 0.009, P.spellHot, 5, 3);
    }

    /* phylactery-arm (viewer's left / model -x): elbow tucked tight to the ribcage, forearm
       crossing up to clutch the glowing reliquary at the chest. ~105 deg elbow bend. */
    const shL = V(-0.150, L.shldY + 0.00, cz.shld + 0.04);
    const elL = V(-0.185, L.chestY + 0.02, cz.shld + 0.16);
    /* R1 SELF-CORRECTION (post r1 engine render): r1's wrist z (cz.chest+0.10 = -0.08) landed
       exactly AT the ribcage's own front surface (chest band front z = cz.chest+rz = -0.08), so
       the phylactery glow was built INSIDE the torso mesh and never reached the render at all —
       the second signature zone (law 3's dual-glow requirement) was invisible. Pushed the wrist
       and the phylactery well clear of the torso's front surface (+0.14 more) so both the hand
       and its glow sit proud in front of the chest instead of buried in it. */
    const wrL = V(-0.045, L.chestY + 0.14, cz.chest + 0.24);
    tube(shL, elL, 0.026, 0.020, 6, P.boneDk);
    tube(elL, wrL, 0.019, 0.014, 6, P.bone);
    boneHand(wrL, [[0.45, 0.35, -0.35], [0.15, 0.55, -0.35], [-0.20, 0.55, -0.30], [-0.45, 0.30, -0.25]], P.boneDk, P.bone);
    /* the phylactery — a small reliquary casing clutched to the chest with its own glow, the
       second signature high-value zone, near-white/cool-green so it reads distinct from the
       warm spell-glow */
    {
      const pc = wrL.clone().add(V(0.03, -0.02, 0.02));
      blob(pc.x, pc.y, pc.z, 0.030, 0.034, 0.024, P.phyCase, 6, 4);
      blob(pc.x, pc.y, pc.z, 0.020, 0.024, 0.016, P.phyCaseLt, 6, 4);
      blob(pc.x, pc.y + 0.002, pc.z + 0.018, 0.017, 0.017, 0.017, P.phyMid, 5, 3);
      blob(pc.x, pc.y + 0.002, pc.z + 0.024, 0.009, 0.009, 0.009, P.phyHot, 4, 2);
    }
  }

  /* base disc (Medium: r=0.42) — the figure hovers above it; the shadow pool above is the
     ground-contact tell, this disc is the standard stage marker. */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.040, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.043, 0), P.discTop);
  }
}
