/* dev/model-qa/creatures/mon-gnoll.js — the GNOLL landmark table (hyena-man biped, Medium).
   Whole-object grammar: one function, one geometry frame, no anchors. Held weapon authored FIRST
   so the gripping fist derives from the haft. The read is CACKLING HUNTER, told by silhouette:
   a TALL lanky biped (~1.65u) hunched forward — shoulders carried HIGHER than the hips with the
   neck thrust out low ahead of the chest (the hyena stoop) — topped by a snouted hyena HEAD with
   a forward-projecting MUZZLE parted open on teeth, tall rounded EARS, and a spotted MANE of dark
   ridge-tufts running from the crown down the back of the neck to the shoulders. Digitigrade legs
   (a bent hock, weight on the toes). Matted tan-yellow hide dotted with dark spot quads on the
   shoulders and haunches. A crude bone-hafted axe hangs from one fist. Imported by
   mon-gnoll-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGnoll(){
  /* ---------- PALETTE (VS desaturated; matted tan-yellow hyena hide + dark mane/spots) ---------- */
  const P = {
    hide:0xa7935e, hideDk:0x83714a, hideLt:0xc0ad78,       // matted tan-yellow coat
    belly:0x9c8f6e, throat:0xb2a37a,                        // paler chest/throat
    mane:0x4a3f2c, maneDk:0x352d1f,                         // dark spotted mane ridge
    spot:0x59492f, spotDk:0x40341f,                         // dark hide spots
    muzzle:0x8f7d52, muzzleLt:0xa89468, nose:0x241d18,
    maw:0x38231f, tongue:0x8f524c, tooth:0xe2d9c4,
    ear:0x83714a, earIn:0x40341f,
    eye:0x171210, eyeGlow:0xc59a3e,                          // yellow predator eye
    bone:0xcabf9e, boneDk:0x9a8f70, sinew:0x6e5a3c,          // bone haft + lashing
    stone:0x71685c, stoneDk:0x4c453c,                        // crude stone axe-head
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — TALL lanky biped, ~1.65u. The stoop: the SHOULDER line sits high, and
     the neck angles FORWARD + DOWN out ahead of the chest so the head leads low. Hips carried a
     touch forward under the leaning torso. ---------- */
  const L = {
    hipY:0.80, waistY:0.90, ribY:1.02, chestY:1.16, shldY:1.26,
    hipHalf:0.120, shoulderX:0.255,
    /* neck+head thrust FORWARD (+z) and a little above the shoulder — the hunched hyena carry.
       Head lifted vs pass 1 so the muzzle reads clearly ABOVE the chest, forward reach shortened. */
    neckBz:0.05, neckB_Y:1.28,
    neckz:0.20, neckY:1.35,
    headz:0.29, headBaseY:1.40,
  };

  /* ===== HELD WEAPON FIRST — a crude bone-hafted stone axe, held one-handed at the right hip,
     haft roughly vertical (leaning slightly out). The fist point is derived from the haft below. == */
  const HAFT_TOP = V(0.36, 1.10, 0.30);      // upper haft (near the head end)
  const HAFT_BOT = V(0.31, 0.42, 0.24);      // lower haft (butt)
  const HAFT = new THREE.Vector3().subVectors(HAFT_TOP, HAFT_BOT).normalize();
  const GRIP = V(0.335, 0.80, 0.275);        // where the fist closes on the haft
  {
    // the bone haft — a slightly knobbly shaft (two segments, faint swell at the grip)
    const mid = HAFT_BOT.clone().lerp(HAFT_TOP, 0.5);
    tube(HAFT_BOT, mid, 0.026, 0.030, 6, P.bone, {capA:{hex:P.boneDk, lift:0.02}});
    tube(mid, HAFT_TOP, 0.030, 0.026, 6, P.boneDk);
    // sinew lashing rings just below the head
    for(const t of [0.86, 0.92]){
      const c = HAFT_BOT.clone().lerp(HAFT_TOP, t);
      const r = ring(c, HAFT, 0.034, 0.034, 6);
      const r2 = ring(c.clone().addScaledVector(HAFT,0.02), HAFT, 0.034, 0.034, 6);
      stitch([r,r2], ()=>P.sinew);
    }
    // crude chipped STONE axe-head lashed to the top: a CHUNKY solid wedge blade off one side of
    // the haft, built as a thick slab (front + back faces + a broad edge cap) so it reads as a
    // hefty stone axe, not a flake. Sweeps out to +x and slightly forward.
    const head = HAFT_TOP.clone().addScaledVector(HAFT,-0.02);
    const side = new THREE.Vector3().crossVectors(HAFT, V(0,0,1)).normalize(); // blade sweeps to +x/-z side
    const bladeOut = side.clone().multiplyScalar(0.21).add(V(0,0.01,0.05));    // longer reach
    const th = V(0.045,0,-0.055);                                              // slab thickness offset
    const bTop  = head.clone().add(V(0,0.105,0));
    const bBot  = head.clone().add(V(0,-0.105,0));
    const edgeT = head.clone().add(bladeOut).add(V(0,0.060,0));
    const edgeB = head.clone().add(bladeOut).add(V(0,-0.060,0));
    // FRONT face
    quad(bBot, bTop, edgeT, edgeB, P.stone, 0.05);
    // BACK face (offset by slab thickness)
    quad(bBot.clone().add(th), bTop.clone().add(th), edgeT.clone().add(th), edgeB.clone().add(th), P.stoneDk, 0.05);
    // top rim, bottom rim, and the broad cutting-edge cap
    quad(bTop, bTop.clone().add(th), edgeT.clone().add(th), edgeT, P.stoneDk, 0.03);
    quad(bBot, bBot.clone().add(th), edgeB.clone().add(th), edgeB, P.stone, 0.03);
    quad(edgeB, edgeT, edgeT.clone().add(th), edgeB.clone().add(th), P.stoneDk, 0.03);
    // back of the head where it meets the haft (butt of the blade)
    quad(bBot, bBot.clone().add(th), bTop.clone().add(th), bTop, P.stoneDk, 0.03);
  }

  /* ===== TRUNK — one lean loft, hips -> shoulders. Narrow waist, a deeper high chest and broad
     shoulders (the hyena's forequarter mass) so the top-heavy hunched read carries. ===== */
  stack([
    {y:L.hipY,   rx:0.170, rz:0.135, hex:P.hideDk},
    {y:L.waistY, rx:0.150, rz:0.120, hex:P.hide},
    {y:L.ribY,   rx:0.186, rz:0.150, hex:P.hide},
    {y:L.chestY, rx:0.216, rz:0.170, hex:P.hide},
    {y:L.shldY,  rx:0.232, rz:0.168, hex:P.hideDk},   // broad high shoulders
  ], 8, {});

  /* pale throat/belly strip down the front */
  quad(V(-0.09,L.hipY+0.02,0.132), V(0.09,L.hipY+0.02,0.132),
       V(0.10,L.chestY-0.02,0.168), V(-0.10,L.chestY-0.02,0.168), P.belly, 0.05);

  /* a scatter of dark hide SPOTS across the shoulders/haunches (the hyena dapple) */
  {
    const spot=(x,y,z,r,hex)=>{
      const rr=ring(V(x,y,z), V(0,0,1), r, r*0.8, 6);
      capFan(rr, V(x,y,z+0.004), hex);
    };
    spot(-0.16,1.20,0.10,0.030,P.spot);  spot(0.14,1.16,0.13,0.026,P.spotDk);
    spot(0.19,1.24,0.02,0.024,P.spot);   spot(-0.19,1.11,-0.02,0.028,P.spotDk);
    spot(-0.11,0.96,0.11,0.026,P.spot);  spot(0.13,0.90,0.10,0.022,P.spotDk);
    spot(0.05,1.08,0.16,0.020,P.spot);   spot(-0.06,1.14,0.15,0.018,P.spotDk);
  }

  /* ===== NECK — thrusts FORWARD and DOWN out of the high shoulders (the stoop). A tube leaning +z. */
  {
    const nBase = V(0, L.shldY-0.02, L.neckBz+0.05);
    const nOut  = V(0, L.headBaseY-0.06, L.headz-0.04);   // reach up INTO the lifted head base
    tube(nBase, nOut, 0.100, 0.082, 8, P.hideDk, {phase:Math.PI/8});
    // paler throat under the neck
    quad(V(-0.06,L.shldY-0.10,0.12), V(0.06,L.shldY-0.10,0.12),
         V(0.05,L.neckY-0.08,L.neckz+0.02), V(-0.05,L.neckY-0.08,L.neckz+0.02), P.throat, 0.05);
  }

  /* ===== HEAD — hyena skull thrust out low ahead of the neck, with a forward MUZZLE parted on
     teeth, tall rounded EARS, sloped low brow. Built around a forward face-center at (0, headBaseY,
     headz). ===== */
  {
    const n=8, ph=Math.PI/n;
    const cx=0, cz=L.headz;
    /* cranium loft: jaw -> cheek -> brow -> crown, small and sloped (hyena head is compact) */
    const bands=[
      {y:L.headBaseY-0.02, rx:0.088, rz:0.100, hex:P.hide},
      {y:L.headBaseY+0.03, rx:0.108, rz:0.112, hex:P.hide},
      {y:L.headBaseY+0.08, rx:0.106, rz:0.100, hex:P.hideDk},   // brow
      {y:L.headBaseY+0.13, rx:0.082, rz:0.078, hex:P.hideDk},   // crown
    ];
    const rings=bands.map(b=>ring(V(cx,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph));
    // slope the brow forward/down for the sloped-skull read
    for(const i of [1,2]){ rings[2][i].z += 0.014; rings[2][i].y -= 0.008; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(cx, L.headBaseY+0.165, cz-0.006), P.maneDk);   // dark crown into the mane

    /* MUZZLE — a wedge projecting forward (+z), two chained tapering tubes, parted at the tip on a
       dark open mouth with tooth hints. Angled slightly DOWN (nose leads low). */
    const jawY = L.headBaseY-0.03;
    // dark open mouth cavity first (behind the teeth)
    {
      const mb=V(0, jawY+0.01, cz+0.075), mm=V(0, jawY-0.015, cz+0.185);
      tube(mb, mm, 0.058, 0.044, n, P.maw, {raz:0.046, rbz:0.034, phase:ph, capB:{hex:P.maw, lift:0.006}});
      quad(V(-0.024,jawY-0.04,cz+0.10), V(0.024,jawY-0.04,cz+0.10),
           V(0.020,jawY-0.045,cz+0.20), V(-0.020,jawY-0.045,cz+0.20), P.tongue, 0.04);
    }
    // UPPER jaw wedge (projects forward, nose at the tip)
    const uB=V(0, jawY+0.045, cz+0.06), uM=V(0, jawY+0.030, cz+0.205), uT=V(0, jawY+0.010, cz+0.30);
    tube(uB, uM, 0.086, 0.064, n, P.muzzle, {raz:0.062, rbz:0.046, phase:ph});
    tube(uM, uT, 0.064, 0.034, n, P.muzzle, {raz:0.046, rbz:0.024, phase:ph, capB:{hex:P.nose, lift:0.010}});
    // LOWER jaw wedge (dropped + angled down — the gape)
    const lB=V(0, jawY-0.055, cz+0.06), lM=V(0, jawY-0.095, cz+0.19), lT=V(0, jawY-0.120, cz+0.27);
    tube(lB, lM, 0.066, 0.046, n, P.muzzle, {raz:0.048, rbz:0.034, phase:ph});
    tube(lM, lT, 0.046, 0.024, n, P.muzzleLt, {raz:0.034, rbz:0.018, phase:ph, capB:{hex:P.muzzleLt, lift:0.008}});

    /* geometric TEETH — pale fangs on both jaw lines */
    const fang=(x,y,z,w,h,down)=>{
      const ty = down ? y-h : y+h;
      quad(V(x-w,y,z+0.006), V(x+w,y,z+0.006), V(x,ty,z+0.004), V(x,ty,z+0.004), P.tooth, 0.02);
    };
    for(const s of [-1,1]){
      fang(s*0.044, jawY+0.008, cz+0.11, 0.017, 0.058, true);   // upper canine
      fang(s*0.022, jawY+0.006, cz+0.15, 0.011, 0.030, true);   // upper incisor
      fang(s*0.040, jawY-0.055, cz+0.11, 0.014, 0.046, false);  // lower canine
    }
    /* TALL ROUNDED EARS — two upright wedges on the crown, rounded tips, set back a touch */
    for(const s of [-1,1]){
      const base=V(s*0.072, L.headBaseY+0.14, cz-0.02);
      const tip =V(s*0.100, L.headBaseY+0.30, cz-0.05);   // tall, tips up + slightly back
      tube(base, tip, 0.058, 0.030, 6, P.ear, {raz:0.040, rbz:0.024, capB:{hex:P.ear, lift:0.010}});
      // dark inner-ear fleck
      quad(V(s*0.056,L.headBaseY+0.155,cz-0.005), V(s*0.088,L.headBaseY+0.155,cz-0.012),
           V(s*0.096,L.headBaseY+0.285,cz-0.045), V(s*0.070,L.headBaseY+0.285,cz-0.038), P.earIn, 0.03);
    }
  }

  /* ===== MANE — a dark spotted ridge of tufts running from the crown down the back of the neck to
     the shoulders. A chain of short back-swept tubes along the nape (-z of the neck), tallest at the
     crown, fading into the shoulders. This is the signature dorsal line. ===== */
  {
    const maneY0 = L.headBaseY+0.10;         // starts high behind the crown
    // spine of the mane from behind-crown down to the withers
    const pts = [
      V(0, L.headBaseY+0.11, L.headz-0.07),
      V(0, L.neckY+0.02,     L.neckz-0.02),
      V(0, L.shldY+0.03,     0.02),
      V(0, L.shldY-0.02,     -0.08),
    ];
    // tuft heights along the ridge (tallest near the crown)
    const tuftH = [0.11, 0.13, 0.10, 0.07];
    for(let i=0;i<pts.length;i++){
      const b=pts[i];
      const top=b.clone().add(V(0, tuftH[i], -0.02));   // tuft leans slightly back
      tube(b, top, 0.040, 0.014, 5, i%2?P.maneDk:P.mane, {capB:{hex:P.maneDk, lift:0.008}});
      // a couple of side tufts to broaden the ridge crest
      for(const s of [-1,1]){
        const sb=b.clone().add(V(s*0.028,0,0.005));
        const st=sb.clone().add(V(s*0.02, tuftH[i]*0.72, -0.02));
        tube(sb, st, 0.026, 0.010, 4, P.maneDk, {capB:{hex:P.maneDk, lift:0.006}});
      }
    }
    // a dark base ridge tying the tufts together down the nape
    for(let i=0;i<pts.length-1;i++){
      const a=pts[i], b=pts[i+1];
      tube(a, b, 0.038, 0.038, 6, P.maneDk);
    }
  }

  /* ===== ARMS — long and lanky. RIGHT hand grips the axe haft (derived from GRIP); LEFT hangs
     loose with clawed fingers. Shoulders sit high and wide. ===== */
  {
    // RIGHT arm to the grip
    const S=V(L.shoulderX, L.shldY-0.03, 0.02);
    const E=V(0.335, 0.98, 0.16);                 // elbow out + forward
    const W=GRIP.clone().add(V(0.0,0.06,-0.02));   // wrist just above/behind the grip
    tube(S,E,0.078,0.060,6,P.hide);
    tube(E,W,0.058,0.046,6,P.hideDk);
    // fist wrapped around the haft, aligned to the haft axis
    tube(GRIP.clone().addScaledVector(HAFT,-0.055), GRIP.clone().addScaledVector(HAFT,0.055),
         0.050,0.046,6,P.hideLt, {capA:{hex:P.hideLt}, capB:{hex:P.hideLt}});

    // LEFT arm hanging, clawed fingers spread down
    const S2=V(-L.shoulderX, L.shldY-0.03, 0.02);
    const E2=V(-0.315, 0.96, 0.06);
    const W2=V(-0.285, 0.66, 0.12);
    tube(S2,E2,0.078,0.060,6,P.hide);
    tube(E2,W2,0.058,0.046,6,P.hideDk);
    // palm nub + spread clawed fingers
    tube(W2, W2.clone().add(V(0,-0.06,0.02)), 0.048,0.040,6,P.hideLt, {capB:{hex:P.hideLt}});
    const HW=W2.clone().add(V(0,-0.07,0.02));
    for(const dx of [-0.03,-0.01,0.015,0.035]){
      tube(HW, HW.clone().add(V(dx,-0.075,0.02)), 0.014,0.008,4,P.hideLt,{capB:{hex:P.nose}});  // dark claw tips
    }
  }

  /* ===== LEGS — DIGITIGRADE: a bent hock, the heel raised, weight forward on the long toes. Long
     lean thighs from the hips, angled slightly back, then a forward-kicked shank to the toe. ===== */
  {
    const leg=(hipX, footX, footZ, sign)=>{
      const hip=V(hipX, L.hipY-0.02, 0.02);
      const knee=V(hipX + sign*0.010, 0.50, 0.11);       // knee forward (thigh angles down-forward)
      const hock=V(footX, 0.24, -0.06);                  // the raised digitigrade hock, pulled BACK
      const toe=V(footX, 0.055, footZ);                  // long toe planted forward
      tube(hip, knee, 0.086, 0.058, 6, P.hide);          // thigh
      tube(knee, hock, 0.052, 0.038, 6, P.hideDk);       // shank down to the hock
      tube(hock, toe, 0.040, 0.034, 6, P.hideDk, {capB:{hex:P.muzzle, lift:0.006}});  // long foot/toe
      // claw flecks at the toe front
      for(const cx of [-0.020,0,0.020]){
        quad(V(toe.x+cx-0.006,0.035,toe.z+0.03), V(toe.x+cx+0.006,0.035,toe.z+0.03),
             V(toe.x+cx+0.004,0.012,toe.z+0.055), V(toe.x+cx-0.004,0.012,toe.z+0.055), P.nose, 0.0);
      }
    };
    leg(-L.hipHalf, -0.150, 0.20, -1);
    leg( L.hipHalf,  0.150, 0.17,  1);
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
