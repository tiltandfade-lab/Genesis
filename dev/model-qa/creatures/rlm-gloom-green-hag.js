/* dev/model-qa/creatures/rlm-gloom-green-hag.js — the GREEN HAG (bespoke bipedal Medium fey, coven's
   youngest sister), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry
   pilot, gloom-w1). Realm-bestiary entry "Coven Hexweaver" (CR5, gloom): "still human enough to
   bargain, cruel enough to relish it... her hands never quite stop moving, weaving something out of
   the air between sentences."

   FEATURE CHECKLIST (the ~1.1-1.6k budget buys):
     1. Wiry STANDING humanoid torso, upright and TALLER than the night-hag chassis (crown ~1.48u vs
        the night hag's hunched 1.32u) — a backward spinal ARCH (chest thrust forward/up), the
        opposite curvature from the night hag's forward hunch, so the two never read as the same body
        even sharing the HUMANOID family construction.
     2. LANK HAIR CURTAIN — a dense sheet of long, straight, near-parallel strands sweeping back off
        the crown and down past the shoulders as the head snaps back — the signature silhouette read,
        distinct from the night hag's wild windswept multi-directional strands (law 2).
     3. HOOKED-CLAW hands, asymmetric — right arm HIGH-BENT hooking down (elbow driven up past crown,
        wrist hooking forward-down at ~75-90°), left arm LOW and WIDE (elbow swung out at ~118°) — the
        "weaving between her hands" flavor beat made physical, now a genuinely crooked curse-cast
        instead of a mirrored candlestick; pale bone-colored claws are the first high-value zone
        (law 3) against the dark moss-green skin.
     4. Head thrown BACK, wide cackling mouth baring pale jagged teeth — the second high-value zone,
        echoing the claws (law 3: light where the feature is).
     5. Ragged swamp-witch dress with a torn hem and a few hanging tatter strips — cheap silhouette
        texture, distinguishes the garb read from the night hag's robe.
     6. Moss-mottled dark green skin base (desaturated VS palette) so claws/teeth/hair-tips read as
        the only bright zones — law 3's value ladder.

   POSE SENTENCE (POSEFIX 2026-07-08, ANATOMY-CANON POSE-ANATOMY): mid-curse, the pelvis-to-skull
   spine authored FIRST as a crooked S-twist — hip cocked left (weight on the straighter left leg,
   the right leg loose and kicked back), the ribcage/chest/shoulders counter-twisting right as the
   spine arches backward, the head continuing the twist as it snaps back into a wide cackle. The
   right claw hand rides HIGH off the lifted right shoulder, elbow driven up past the crown and the
   wrist hooking sharply forward-and-down; the left claw hand hangs LOW and WIDE off the relaxed left
   shoulder, elbow swung out. Never a mirrored candlestick, never at attention.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y, ground
   y=0. Imported by ps1-sheet.html (SETS['gloom-w1'], cell 9). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob, setChannels } from '../probe-lib.js';

/* one hooked claw finger: TWO segments with a sharp inward curl at the tip (the "hooking" read) —
   pale base darkening toward the tip, tip capped in the nail tone (the value payload). */
function hookClaw(base, outDir, curlDir, len, pale, nail){
  const o = new THREE.Vector3(outDir[0], outDir[1], outDir[2]).normalize();
  const c = new THREE.Vector3(curlDir[0], curlDir[1], curlDir[2]).normalize();
  const mid = base.clone().addScaledVector(o, len * 0.6);
  const tip = mid.clone().addScaledVector(o, len * 0.28).addScaledVector(c, len * 0.34);
  tube(base, mid, 0.017, 0.012, 4, pale);
  tube(mid, tip, 0.012, 0.003, 4, nail, { capB: { hex: nail } });
}

export function buildGreenHag(){
  /* ---------- PALETTE (VS desaturated; moss-dark skin, pale claws/teeth as the value zones) ---------- */
  /* R3 CRITIC FIX: the r3 render showed the whole lower body (dress+legs, from ribs down) AND the
     hair curtain AND the dark half of the hooked-claw base dissolving into the VOID_BG (#0a0908,
     ps1-sheet.html) — the rag/hem/hairDk/skinDk tones sat only ~15-25 RGB levels above void, which
     the 1/3-res+dither pass erases entirely (law 2/3). Sibling rlm-gloom-night-hag.js's palette
     comment states the rule directly: keep every tone "well clear of the 0x0a0908 void" even for a
     deliberately dark garment. Lifted every dark tone here 2-3x while keeping the same hue family
     (moss-olive skin, dark-olive rag, near-black-but-not-black hair) so the mood stays but nothing
     is void-level anymore. */
  const P = {
    skin:0x5c7048, skinLt:0x64784f, skinDk:0x475c34, mottle:0x3d4a30,   // mossy green hide (skinDk/skin lifted off void — the shins/feet were still reading level with the floor-grid checker)
    nail:0xd9d3ba, nailDk:0xa89f80, teeth:0xe0d9bc,                     // pale claws + teeth — the light zones
    eye:0xc9b752, socket:0x2a3320,                                     // sly yellow-green eye glint
    hair:0x3d4c30, hairDk:0x374530, hairLt:0x6c7c50,                   // lank dark curtain, lifted well off void so the curtain itself reads
    rag:0x5c5038, ragLt:0x74684a, ragDk:0x4a4030, hem:0x342c1e,
    disc:0x3a3327, discTop:0x453d2f,
  };
  setChannels({
    [P.skin]:'skin', [P.skinLt]:'skin', [P.skinDk]:'skin', [P.mottle]:'skin', [P.eye]:'skin', [P.socket]:'skin',
    [P.nail]:'bone', [P.nailDk]:'bone', [P.teeth]:'bone',
    [P.hair]:'fur', [P.hairDk]:'fur', [P.hairLt]:'fur',
    [P.rag]:'cloth', [P.ragLt]:'cloth', [P.ragDk]:'cloth', [P.hem]:'cloth',
  });

  /* ---------- LANDMARKS — upright standing frame, taller than the night hag (crown ~1.48u). -------- */
  const L = {
    hipY:0.60, waistY:0.74, ribY:0.90, chestY:1.04, shldY:1.14, neckY:1.19,
    jawY:1.22, cheekY:1.29, browY:1.36, crownY:1.44,
    hipHalf:0.105, shoulderX:0.170,
  };

  /* ---------- TORSO — POSEFIX 2026-07-08 (ANATOMY-CANON POSE-ANATOMY): the spine IS the pose, authored
     as one crooked S-twist from pelvis to neck, not a plumb column with a pure sagittal arch. Hip cx
     cocks LEFT (-x, weight settling on the straighter left leg below); the curve sweeps back through
     center at the waist/rib and twists RIGHT (+x) through chest/shoulder — true counterpose (rule 4) —
     while cz keeps climbing for the backward arch (chest thrust up) the whole way, the signature
     curvature that keeps this body reading opposite the night hag's forward hunch. */
  const torsoRings = stack([
    { y:L.hipY,   rx:0.118, rz:0.100, cx:-0.055, cz:0.000, hex:P.ragDk },
    { y:L.waistY, rx:0.128, rz:0.108, cx:-0.020, cz:0.025, hex:P.rag },
    { y:L.ribY,   rx:0.138, rz:0.112, cx:0.025,  cz:0.058, hex:P.ragLt },
    { y:L.chestY, rx:0.128, rz:0.106, cx:0.065,  cz:0.082, hex:P.rag },
    { y:L.shldY,  rx:0.118, rz:0.098, cx:0.090,  cz:0.095, hex:P.ragDk },
    { y:L.neckY,  rx:0.052, rz:0.048, cx:0.072,  cz:0.070, hex:P.skinDk },
  ], 8, { capTop:{ hex:P.skinDk, lift:0.006 } });

  /* torn hem tatters hanging off the dress waist — ragged strip quads, distinct garb texture from
     the night hag's robe. POSEFIX: follows the hip ring's new -0.055 cx so they hang off the actual
     cocked pelvis instead of a phantom centerline. */
  for(const [ang,len] of [[0.3,0.15],[1.1,0.19],[1.9,0.13],[2.8,0.20],[3.9,0.16],[5.1,0.18]]){
    const cx = Math.cos(ang)*0.14 - 0.055, cz = Math.sin(ang)*0.11 + 0.01;
    const base = V(cx, L.hipY-0.01, cz);
    const tip  = V(cx*1.3, L.hipY-0.01-len, cz*1.25);
    quad(base.clone().add(V(0.018,0,0)), base.clone().add(V(-0.018,0,0)),
         tip.clone().add(V(-0.010,0,0)), tip.clone().add(V(0.010,0,0)), (ang%2<1)?P.ragDk:P.hem, 0.08);
  }

  /* ---------- HEAD — thrown BACK (cz falls with height past the neck), wide cackling mouth. ------- */
  /* R1 CRITIC FIX: the original head bands receded to cz:-0.098 at the crown — full-away-from-camera
     AND out of the key-light throw (5,9,7 is +z-ish), so the whole face vanished into shadow/void in
     the r1 render (law 3 failure — no high-value zone survived on the signature). Softened to a
     tilt-back read (chin/brow still face mostly forward) instead of a full recession. */
  /* POSEFIX 2026-07-08: head continues the torso's twist (neck cx:0.046) curling back through center
     as the crown recedes — the head "counters" the twist as it snaps back (rule 3), reading as one
     spiral gesture line from hip to crown, not a plumb neck bolted onto a twisted body. */
  const headRings = stack([
    { y:L.jawY,   rx:0.066, rz:0.072, cx:0.064, cz:0.045, hex:P.skin },
    { y:L.cheekY, rx:0.078, rz:0.076, cx:0.044, cz:0.025, hex:P.skinLt },
    { y:L.browY,  rx:0.070, rz:0.064, cx:0.016, cz:0.000, hex:P.mottle },
    { y:L.crownY, rx:0.054, rz:0.048, cx:-0.018, cz:-0.024, hex:P.skinDk },
  ], 8, { capTop:{ hex:P.skinDk, lift:0.018 } });

  /* sly narrow eyes — small yellow-green glints (a "little too pretty" flick of value, not empty
     sockets — she's still human enough per the flavor line). R1 FIX: enlarged toward the 0.04u
     feature floor (was 0.012/0.006 — dissolving at 1/3-res) and moved onto the now-forward-facing
     brow band so they actually catch the key light. */
  for(const s of [-1,1]){
    const c = V(s*0.034 + 0.016, L.browY-0.006, 0.048);
    blob(c.x, c.y, c.z, 0.020, 0.014, 0.016, P.socket, 5, 2);
    blob(c.x + s*0.006, c.y, c.z+0.010, 0.010, 0.007, 0.008, P.eye, 4, 2);
  }

  /* hooked, slightly upturned nose (leaner than the night hag's downward beak — younger read).
     POSEFIX: nx follows the twisted head's cheek/brow cx blend so it stays seated on the face. */
  {
    const nx = 0.032;
    const nb = V(nx, L.cheekY+0.008, 0.036);
    const nm = V(nx, L.cheekY-0.020, 0.078);
    const nt = V(nx, L.cheekY-0.006, 0.098);
    tube(nb, nm, 0.022, 0.016, 5, P.skinLt, { raz:0.026, rbz:0.016 });
    tube(nm, nt, 0.016, 0.008, 5, P.skin,   { raz:0.016, rbz:0.008, capB:{ hex:P.skinDk, lift:0.003 } });
  }

  /* wide cackling mouth baring jagged pale teeth — the second high-value zone. R2 CRITIC FIX: r1's
     teeth (0.007->0.002 radius) sat under the 0.04u feature floor and dissolved at 1/3-res, and the
     mouth sat too close to the shoulder mass to separate in silhouette. Pulled further forward/down
     off the jaw and thickened well past the floor so it reads as a bright horizontal band.
     R3 CRITIC FIX: even at 0.011 base radius (0.022u diameter) the teeth were STILL under the 0.04u
     floor and invisible in the render — the whole mouth read as flat head-green with no second
     value zone at all. Thickened teeth further (0.020->0.010, clears the floor).
     R4 CRITIC FIX (fresh-context pass-2, this render): found the ACTUAL bug — mc.y was L.jawY-0.024
     (=1.196), which sits BELOW the jaw ring (the bottom of the head, y=1.22) and almost exactly on
     top of the torso's neckY ring (1.19). The mouth was built under the chin, co-located with the
     neck stub, not on the face at all — that's why thickening it never helped. Moved it UP onto the
     face (between jawY and cheekY) and pushed forward past the head-band front extent so it actually
     breaks the silhouette instead of hiding behind the jaw/neck geometry. */
  {
    const mc = V(0.064, L.jawY+0.028, 0.100);
    quad(mc.clone().add(V(-0.046,0.014,0)), mc.clone().add(V(0.046,0.014,0)),
         mc.clone().add(V(0.032,-0.030,-0.016)), mc.clone().add(V(-0.032,-0.030,-0.016)), P.socket, 0.03);
    for(const s of [-1.5,-0.5,0.5,1.5]){
      const tb = mc.clone().add(V(s*0.018,0.012,0.008));
      const tt = tb.clone().add(V(s*0.005,-0.026,0.010));
      tube(tb, tt, 0.020, 0.010, 3, P.teeth, { capB:{ hex:P.teeth } });
    }
  }

  /* ---------- LANK HAIR CURTAIN — dense, straight, near-parallel strands sweeping back off the crown
     as the head snaps back — the LOUD signature (law 2/4), reads as a curtain not a wild mane. ---- */
  {
    /* R2 CRITIC FIX: r1's strands hugged x in [-0.067,0.067] and fell mostly straight back (-z) —
       against the dark void + dark torso they merged into the head silhouette instead of reading as
       a curtain. Widened the root spread and the outward fall so the strands clear the shoulders and
       show sky (void) between them and the torso, and lifted the tip color further above skin/robe
       value so the curtain itself becomes a third readable value band. */
    const roots = [];
    for(let i=0;i<9;i++){
      const t = i/8;                       // 0=left .. 1=right, spans crown+brow width
      roots.push({ x:(t-0.5)*0.190 + 0.005, y:L.browY-0.005 + Math.abs(t-0.5)*0.02, z:-0.030 + Math.abs(t-0.5)*0.01 });
    }
    roots.forEach((r,i)=>{
      const root = V(r.x, r.y, r.z);
      const mid  = root.clone().add(V(r.x*0.9, -0.26, -0.10));
      const tip  = mid.clone().add(V(r.x*0.7, -0.24, -0.05));
      tube(root, mid, 0.017, 0.011, 3, (i%2)?P.hair:P.hairDk);
      tube(mid, tip, 0.011, 0.004, 3, P.hairLt, { capB:{ hex:P.hairLt } });
    });
  }

  /* ---------- ARMS — POSEFIX 2026-07-08 (ANATOMY-CANON POSE-ANATOMY): the symmetric both-arms-overhead
     candlestick was a gate failure (mannequin torso, plumb mirrored limbs). Re-authored asymmetric:
     RIGHT arm rides HIGH off the lifted right shoulder (rule 3 — the shoulder follows the torso's
     twisted-up cx/cz), elbow driven up past the crown and the wrist hooking sharply forward-and-down
     (~80° elbow — a genuine hook-strike, not a straight reach); LEFT arm hangs LOW and WIDE off the
     relaxed, un-lifted left shoulder, elbow swung out at ~118°. Still both hooking claws, still the
     "weaving between her hands" beat — just crooked instead of a mirrored tuning-fork. */
  {
    // right arm — HIGH-BENT, hooking down: shoulder rides with the torso's raised-right twist,
    // elbow swept well OUT past the torso/hair silhouette, apex above both neighbors (a clean V),
    // wrist continuing the outward sweep with a downward hook — cz kept flat/negative through
    // elbow+wrist (rather than swinging back to +z) so the arm keeps reading FURTHER outward in
    // camera space at every joint instead of folding back toward center behind the hair curtain.
    const S1 = V(0.260, 1.175, 0.115);
    const E1 = V(0.432, 1.380, -0.020);  // elbow apex, kicked wide clear of the head/hair
    const W1 = V(0.552, 1.220, -0.060);  // wrist hooks down off the elbow (~84° bend)
    tube(S1, E1, 0.048, 0.036, 5, P.skin);
    tube(E1, W1, 0.036, 0.024, 5, P.skinDk);
    blob(W1.x, W1.y, W1.z, 0.034, 0.028, 0.030, P.skinLt, 5, 3);
    const fanHi = [[0.30,-0.70,0.10],[0.55,-0.60,-0.10],[0.75,-0.45,-0.25],[0.85,-0.25,-0.35]];
    for(const d of fanHi) hookClaw(W1, d, [0.40,-0.85,-0.10], 0.10, P.nail, P.nailDk);

    // left arm — LOW and WIDE: shoulder stays down, relaxed, off the torso's un-lifted left side.
    const S2 = V(-0.080, 1.125, 0.125);
    const E2 = V(-0.258, 1.050, 0.060);  // elbow swung wide, ~120° bend
    const W2 = V(-0.398, 0.870, 0.220);
    tube(S2, E2, 0.048, 0.036, 5, P.skin);
    tube(E2, W2, 0.036, 0.024, 5, P.skinDk);
    blob(W2.x, W2.y, W2.z, 0.034, 0.028, 0.030, P.skinLt, 5, 3);
    const fanLo = [[-0.70,-0.45,0.30],[-0.55,-0.65,0.45],[-0.30,-0.75,0.55],[-0.05,-0.65,0.65]];
    for(const d of fanLo) hookClaw(W2, d, [0,-0.6,-0.8], 0.10, P.nail, P.nailDk);
  }

  /* ---------- LEGS — POSEFIX 2026-07-08: hip cocked LEFT (torso hip ring cx:-0.035) — the LEFT leg
     is the weight-bearing one (near-straight, planted under the cocked pelvis), the RIGHT leg is loose
     and kicked out-and-back, foot barely touching, echoing the crooked curse in the stance. */
  {
    const hipL=V(-0.160, L.hipY-0.02, 0.02), kneeL=V(-0.170,0.34,0.06), ankL=V(-0.150,0.075,0.03);
    const hipR=V( 0.050, L.hipY-0.02,-0.02), kneeR=V( 0.165,0.37,-0.07), ankR=V( 0.130,0.085,-0.14);
    tube(hipL,kneeL,0.046,0.036,6,P.skinDk);
    tube(kneeL,ankL,0.032,0.024,6,P.skin);
    tube(hipR,kneeR,0.046,0.036,6,P.skinDk);
    tube(kneeR,ankR,0.032,0.024,6,P.skin);
    for(const ank of [ankL,ankR]){
      const heel=V(ank.x,0.032,ank.z);
      const toe=V(ank.x, 0.026, ank.z+0.075);
      tube(heel, toe, 0.028,0.018,5,P.skin,{capA:{hex:P.skinDk}});
      for(const off of [-1,0,1]){
        const tb=toe.clone().add(V(off*0.016,0,0));
        const tt=tb.clone().add(V(off*0.005,-0.005,0.024));
        tube(tb, tt, 0.007,0.002,3,P.skin,{capB:{hex:P.nail, lift:0.003}});
      }
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
