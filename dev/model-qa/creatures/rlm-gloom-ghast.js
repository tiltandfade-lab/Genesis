/* dev/model-qa/creatures/rlm-gloom-ghast.js — the GHAST landmark table (HUMANOID family, Medium,
   CR 4, realm gloom), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08
   foundry pilot). Defrocked cleric who joined the feast of his own flock: the stolen corpse of a
   saint gone hungry in vestments — greater ghoul in torn holy vestments. Garnish pulled from
   data/realm-bestiary.js "Hollow-Throated Ghast Priest" (gloom, CR4, model:"ghast"): a collar gone
   stiff with old blood, a clergy stoop, the sermon that never stopped.

   R3 CRITIC PASS (fresh-context, this session): r2 render's rising-claw arm dipped its elbow
   below the shoulder-to-wrist line (curl-then-rise), which combined with a bald 0.01u claw tip
   (dissolved past the law-3 floor) read as a trunk, not a striking claw — a real law-2 silhouette
   misread. Fixed: elbow now cocks OUT to the side at shoulder height (breaks silhouette outward),
   hand rises past head height, claw tubes thickened to a 0.04u-floor-clearing tip on both hands.

   FEATURE CHECKLIST (the ~1.3-1.7k budget buys):
     1. HUMANOID anatomy per ANATOMY-CANON — a hunched, coiled crouch-rise (ghoul-family posture,
        greater-ghoul scale): hips low, spine pitched forward, knees high, long clawed hands.
        Bigger and stronger-framed than the base ghoul (greater ghoul reads heavier, less feral-
        skinny) — thicker torso tubes, a wider shoulder/chest.
     2. SIGNATURE #1 — the torn pale STOLE/COLLAR: a stiff clerical band around the throat plus a
        long ragged strip of vestment cloth draped front-to-back over one shoulder, torn hem,
        stained dark near the bottom (the collar "gone stiff with old blood"). Pale against the
        grey-green corpse hide = the loud high-value silhouette break.
     3. SIGNATURE #2 — the distended jaw: unhinged, wider and longer than a human jaw, snapped open
        mid-bite, hung low off the skull (not a tight ghoul grin — a jaw that has been STRETCHED by
        the feast).
     4. Sunken black eye pits under a heavy clerical brow (no eyes, per the established gloom-undead
        convention — mon-ghoul.js).
     5. Rotted vestment remnants at the waist (torn cassock hem) instead of a plain loincloth —
        keeps the "corpse in ecclesiastical dress" read even where the body shows through.
     6. Long bony claws on both hands — the greater ghoul's paralytic weapons, pale with dark tips.

   POSE SENTENCE: caught mid-feed, rising off a kill with its head snapping toward the viewer — the
   torso still pitched low and forward from the crouch but the shoulders driving UP and the jaw
   thrown wide, one clawed hand still braced low (still feeding) while the other rises to strike —
   never at attention, always the half-second before it lunges again.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w1'], cell 3). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGhast(){
  /* ---------- PALETTE (greater-ghoul corpse hide — a sicklier grey-green than the base ghoul's
     grey-white, since this one has been "feasting" rather than starving; the pale vestment stole
     is the loud value-contrast signature against it) ---------- */
  const P = {
    skin:0x9ba384, skinDk:0x767c60, skinDkr:0x585c44,     // sickly grey-green corpse hide
    hollow:0x454a36,                                        // recessed shadow flesh
    claw:0xdcd8c6, clawTip:0x2a251d,
    mouth:0x140f0c, tooth:0xd8cfba, gum:0x5c3c38,
    eye:0x0d0b09,
    stole:0xe4dcbe, stoleDk:0xb8ae8c, stoleStain:0x5c2c24,  // pale torn stole/collar, blood-stiff hem
                                                              // R2 CRITIC FIX: lifted stole/stoleDk
                                                              // further above skin/skinDk in value —
                                                              // r1 render showed it muddying into the
                                                              // shoulder mass instead of popping (law 3)
    cassock:0x4a4030, cassockDk:0x342c20, cassockTorn:0x5c5240, // rotted vestment remnants at waist
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ---------- LANDMARKS — greater-ghoul crouch-RISE: hips low, spine pitched forward and UP
     (mid-rise off the kill, not fully sunk like the base ghoul), shoulders driving upward, head
     snapping forward-and-up toward the viewer. Heavier frame than mon-ghoul (wider torso). ---- */
  const L = {
    hipY:0.60, hipHalf:0.145,
    lowbackY:0.66, lowbackZ:0.02,
    midbackY:0.76, midbackZ:0.14,
    ribY:0.86, ribZ:0.26,
    shldY:0.94, shldZ:0.36,          // shoulders rising, still forward
    shoulderX:0.255,
    neckY:0.99, neckZ:0.46,
    headY:1.09, headZ:0.60,          // R2 CRITIC FIX: pushed further up+forward (was 1.03/0.56 —
                                      // r1 render read as tucked into the shoulder hunch rather than
                                      // snapped up toward the viewer; law 2/5).
  };

  /* ===== TORSO — heavier greater-ghoul spine loft, low hips rising forward-and-up to broad
     shoulders. Thicker tubes than the base ghoul (this thing is stronger, not skinnier). ===== */
  {
    const hip = V(0, L.hipY, -0.02);
    const lb  = V(0, L.lowbackY, L.lowbackZ);
    const mb  = V(0, L.midbackY, L.midbackZ);
    const rb  = V(0, L.ribY, L.ribZ);
    const sh  = V(0, L.shldY, L.shldZ);
    tube(hip, lb, 0.170, 0.160, 8, P.skinDk, {phase:Math.PI/8, capA:{hex:P.skinDkr, lift:0.02}});
    tube(lb, mb, 0.160, 0.155, 8, P.skinDk, {phase:Math.PI/8});
    tube(mb, rb, 0.155, 0.180, 8, P.skin,   {phase:Math.PI/8});   // broad ribcage
    tube(rb, sh, 0.180, 0.195, 8, P.skin,   {phase:Math.PI/8});   // wide shoulders
    const shr = ring(sh, new THREE.Vector3().subVectors(sh,rb).normalize(), 0.195, 0.195, 8, Math.PI/8);
    capFan(shr, sh.clone().add(V(0,0.02,0.06)), P.skinDk);

    /* visible rib hints on the underside where the vestment has torn away */
    for(let k=0;k<3;k++){
      const t = k/2;
      const cy = L.midbackY + t*0.06 - 0.04;
      const cz = L.midbackZ + t*0.16;
      quad(V(-0.10,cy,cz+0.13), V(0.10,cy,cz+0.13),
           V(0.09,cy-0.018,cz+0.135), V(-0.09,cy-0.018,cz+0.135), P.skin, 0.03);
      quad(V(-0.09,cy-0.018,cz+0.135), V(0.09,cy-0.018,cz+0.135),
           V(0.08,cy-0.040,cz+0.132), V(-0.08,cy-0.040,cz+0.132), P.hollow, 0.03);
    }
  }

  /* ===== SIGNATURE #1 — the torn clerical STOLE/COLLAR: a stiff pale band around the throat,
     plus a long ragged strip running front-to-back over the left shoulder, torn hem, stained dark
     near the bottom hem (the "collar gone stiff with old blood"). ===== */
  {
    // stiff collar band around the base of the neck
    const cb = V(0, L.shldY+0.02, L.shldZ+0.02);
    const ct = V(0, L.neckY-0.01, L.neckZ-0.02);
    tube(cb, ct, 0.115, 0.098, 8, P.stole, {phase:Math.PI/8, capB:{hex:P.stoleDk, lift:0.01}});

    // the stole strip: drapes over the LEFT shoulder (sign -1), front panel hanging down the chest,
    // back panel down the spine — 3 tapering segments each, ending in a torn, blood-stiffened hem.
    // R2 CRITIC FIX: front/back Z pushed further OFF the torso surface (was riding flush against
    // it, painted-on rather than proud) so the strip stands clear in silhouette (law 2); radii
    // widened so it reads as its own shape, not a stripe (law 3).
    const shoulderPt = V(-L.shoulderX*0.55, L.shldY+0.03, L.shldZ+0.07);
    const frontA = V(-0.09, L.shldY-0.10, L.shldZ+0.30);
    const frontB = V(-0.05, L.midbackY-0.02, L.midbackZ+0.30);
    const frontC = V(-0.01, L.lowbackY-0.06, L.lowbackZ+0.22);
    tube(shoulderPt, frontA, 0.088, 0.080, 6, P.stole);
    tube(frontA, frontB, 0.080, 0.072, 6, P.stole);
    tube(frontB, frontC, 0.072, 0.066, 6, P.stoleStain, {capB:{hex:P.stoleStain, lift:0.014}});

    const backA = V(-0.13, L.shldY-0.06, L.shldZ-0.24);
    const backB = V(-0.11, L.midbackY-0.02, L.midbackZ-0.22);
    const backC = V(-0.07, L.lowbackY-0.04, L.lowbackZ-0.14);
    tube(shoulderPt, backA, 0.084, 0.076, 6, P.stole);
    tube(backA, backB, 0.076, 0.068, 6, P.stole);
    tube(backB, backC, 0.068, 0.062, 6, P.stoleStain, {capB:{hex:P.stoleStain, lift:0.014}});
  }

  /* ===== HEAD — snapped forward-and-UP toward the viewer, greater-ghoul skull loft, heavy
     clerical brow, sunken black eye pits (no eyes — gloom-undead convention). ===== */
  {
    const nb = V(0, L.shldY+0.01, L.shldZ+0.04);
    const nh = V(0, L.headY-0.08, L.headZ-0.05);
    tube(nb, nh, 0.100, 0.088, 8, P.skinDk, {phase:Math.PI/8});

    const n=8, ph=Math.PI/n;
    const cx=0, cz=L.headZ, cy=L.headY;
    const bands=[
      {y:cy-0.05, rx:0.098, rz:0.108, hex:P.skin},    // jaw hinge base
      {y:cy+0.00, rx:0.116, rz:0.116, hex:P.skin},    // cheek
      {y:cy+0.055,rx:0.110, rz:0.100, hex:P.skinDk},  // heavy clerical brow
      {y:cy+0.11, rx:0.084, rz:0.078, hex:P.skinDk},  // crown (bald)
    ];
    const rings=bands.map(b=>ring(V(cx,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]){ rings[2][i].z += 0.020; rings[2][i].y -= 0.014; }   // brow casts shadow
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(cx, cy+0.16, cz-0.006), P.skinDkr);

    /* sunken black eye pits under the brow — no eyes, just deep shadow blobs */
    blob(-0.048, cy+0.015, cz+0.075, 0.030, 0.026, 0.024, P.eye, 5, 3);
    blob( 0.048, cy+0.015, cz+0.075, 0.030, 0.026, 0.024, P.eye, 5, 3);

    /* ===== SIGNATURE #2 — the DISTENDED JAW: unhinged, snapped wide open, hung low off the
       skull — wider and longer than a human/ghoul jaw, the feast having stretched it. ===== */
    const jawY = cy-0.10;   // hangs much lower than a normal jaw hinge (unhinged drop)
    const uB=V(0, cy-0.02, cz+0.07), uT=V(0, cy-0.045, cz+0.185);
    tube(uB, uT, 0.096, 0.062, n, P.skin, {raz:0.068, rbz:0.044, phase:ph, capB:{hex:P.skinDk, lift:0.008}});
    const lB=V(0, jawY+0.03, cz+0.05), lT=V(0, jawY-0.06, cz+0.165);
    tube(lB, lT, 0.088, 0.052, n, P.skinDk, {raz:0.060, rbz:0.036, phase:ph, capB:{hex:P.skinDkr, lift:0.010}});

    /* gaping dark maw between the stretched jaws — much taller gap than the base ghoul's gash */
    const my = jawY-0.01, mz = cz+0.135;
    quad(V(-0.082,cy+0.010,mz-0.01), V(0.082,cy+0.010,mz-0.01),
         V(0.066,my-0.010,mz-0.02), V(-0.066,my-0.010,mz-0.02), P.mouth, 0.0);
    // R3 CRITIC FIX: 6 hair-thin teeth (0.020u full width) fell under the law-3 0.04u floor and
    // dissolved at 1/3-res, leaving the "gaping maw" signature unreadable. Fewer, bigger stretched
    // fangs (0.044-0.048u) both clear the floor and read as MORE distended/monstrous.
    const tooth=(x,y,z,w,h,down)=>{
      const ty = down ? y-h : y+h;
      quad(V(x-w,y,z+0.006), V(x+w,y,z+0.006), V(x,ty,z+0.004), V(x,ty,z+0.004), P.tooth, 0.02);
    };
    for(const x of [-0.045,0,0.045]){
      tooth(x, cy+0.005, mz-0.006, 0.024, 0.044, true);     // upper row, from the stretched upper jaw
      tooth(x, my-0.006, mz-0.006, 0.022, 0.036, false);    // lower row, from the dropped lower jaw
    }
  }

  /* ===== ARMS — long and heavy-clawed. One (right) still braced low, mid-feed; the other (left)
     rising to strike — the mid-lunge asymmetry law 5 wants. ===== */
  {
    // LEFT — rising to strike (elbow cocked OUT to the side at shoulder height, hand rising past
    // head height to strike — R3 CRITIC FIX: r2 dipped the elbow below both shoulder and wrist,
    // an S-curl silhouette that read as a trunk, not a cocked claw (law 2). Elbow now breaks the
    // silhouette outward instead of curling under it; claws thickened past the 0.04u floor so
    // they don't dissolve into a bald palm blob (law 3).)
    {
      const S=V(-L.shoulderX, L.shldY-0.01, L.shldZ-0.02);
      const E=V(-0.48, 0.90, L.shldZ+0.04);
      const W=V(-0.30, 1.11, L.shldZ+0.20);
      tube(S,E,0.084,0.066,6,P.skinDk);
      tube(E,W,0.066,0.052,6,P.skin);
      const palm=W.clone().add(V(-0.02,0.03,0.04));
      blob(palm.x,palm.y,palm.z, 0.062,0.046,0.062, P.skin, 6, 4);
      const fanDirs=[V(-0.35,0.55,0.85), V(-0.12,0.62,0.9), V(0.10,0.65,0.85), V(0.32,0.58,0.75), V(0.46,0.40,0.65)];
      for(const d of fanDirs){
        const dn=d.clone().normalize();
        const tip=palm.clone().addScaledVector(dn,0.17);
        tube(palm, tip, 0.030,0.020,4,P.claw,{capB:{hex:P.clawTip, lift:0.01}});
      }
    }
    // RIGHT — still braced low, mid-feed
    {
      const S=V(L.shoulderX, L.shldY-0.02, L.shldZ-0.02);
      const E=V(0.36, 0.44, L.shldZ+0.20);
      const W=V(0.32, 0.16, L.shldZ+0.36);
      tube(S,E,0.078,0.062,6,P.skinDk);
      tube(E,W,0.062,0.048,6,P.skin);
      const palm=W.clone().add(V(0,-0.02,0.05));
      blob(palm.x,palm.y,palm.z, 0.060,0.044,0.062, P.skin, 6, 4);
      const fanDirs=[V(-0.40,-0.5,1), V(-0.16,-0.55,1), V(0.05,-0.6,1), V(0.26,-0.55,1), V(0.42,-0.4,0.9)];
      for(const d of fanDirs){
        const dn=d.clone().normalize();
        const tip=palm.clone().addScaledVector(dn,0.17);
        // R3 CRITIC FIX: thickened to match the left hand — 0.010 tips fell under the 0.04u
        // feature floor and dissolved at 1/3-res (law 3).
        tube(palm, tip, 0.030,0.020,4,P.claw,{capB:{hex:P.clawTip, lift:0.01}});
      }
    }
  }

  /* ===== LEGS — coiled crouch-rise: knees high and splayed, shanks folding down to feet planted
     under the body (still tensed from the crouch, weight pushing UP into the rise). ===== */
  {
    const leg=(sign)=>{
      const hip=V(sign*L.hipHalf, L.hipY-0.02, -0.03);
      const knee=V(sign*0.33, 0.50, 0.19);
      const ankle=V(sign*0.24, 0.11, 0.05);
      const foot=V(sign*0.22, 0.045, 0.19);
      tube(hip, knee, 0.106, 0.070, 6, P.skinDk);
      tube(knee, ankle, 0.064, 0.048, 6, P.skin);
      blob(knee.x,knee.y,knee.z, 0.058,0.054,0.058, P.skinDk, 6, 4);
      tube(ankle, foot, 0.052, 0.042, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.006}});
      for(const tx of [-0.032,0,0.032]){
        const toeA=V(foot.x+tx*0.5, 0.045, foot.z);
        const toeB=V(foot.x+tx, 0.02, foot.z+0.12);
        tube(toeA, toeB, 0.020,0.011,4,P.skin,{capB:{hex:P.clawTip, lift:0.008}});
      }
    };
    leg(-1);
    leg( 1);
  }

  /* ===== ROTTED VESTMENT REMNANTS — a torn cassock wrap around the low hips, ragged uneven hem,
     darker and more structured than the base ghoul's loincloth (this was once a full robe). ===== */
  {
    const n=8, ph=Math.PI/n;
    const top=ring(V(0,L.hipY+0.02,-0.02), V(0,1,0), 0.175, 0.165, n, ph);
    const hemY=[0.36,0.30,0.26,0.38,0.42,0.28,0.24,0.34];
    const hem=[];
    for(let i=0;i<n;i++){
      const t=ph + (i/n)*Math.PI*2;
      hem.push(V(Math.cos(t)*0.195, hemY[i], -0.02 + Math.sin(t)*0.185));
    }
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(top[i], top[i2], hem[i2], hem[i], i&1?P.cassock:P.cassockTorn, 0.06);
    }
    for(const i of [1,5]){
      const t=ph + (i/n)*Math.PI*2;
      const a=V(Math.cos(t)*0.185, hemY[i], -0.02 + Math.sin(t)*0.175);
      tube(a, a.clone().add(V(0,-0.11,0.01)), 0.026,0.013,4,P.cassockDk,{capB:{hex:P.cassockDk}});
    }
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
