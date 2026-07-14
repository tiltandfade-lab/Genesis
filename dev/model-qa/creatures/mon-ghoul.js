/* dev/model-qa/creatures/mon-ghoul.js — the GHOUL landmark table (feral undead HUMANOID, Medium,
   CR 1, realm core), REBUILT under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08
   foundry pilot, rebuild-w3 cell 0). 21 instances ride this chassis + it is the ghast family
   root — garnish stays generic grave-eater so reskins land cleanly. Preserves the prior pass's
   palette intent (palest, most drained corpse-grey skin in the cast) and signature (long pale
   claws vs grave-grey skin); geometry rebuilt for a louder scuttle-pounce read + a new
   signature beat (the too-long tongue) called for in the flavor line.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. HUMANOID anatomy per ANATOMY-CANON, in a deep four-point CROUCH — hips low, spine pitched
        forward-and-down so shoulders/head lead out ahead of the hips, knees HIGH and WIDE, weight
        thrown onto long clawed hands braced near the ground: the spring-under-tension silhouette.
     2. SIGNATURE #1 — long pale bone CLAWS (hands: 5 raking fingers each, feet: 3 gripping toes
        each), lifted to the brightest value in the cast (near-white) with dark tips, so all 16
        claws read as countable spikes against the grey-drained skin and the void.
     3. SIGNATURE #2 — the too-long TONGUE: a single pale ribbon-tube lolling out of the wide-open
        jaw, arcing down past the chin, distinct in silhouette from the head.
     4. Head thrust forward + UP on a low neck, jaw wedged wide open (not lipless-closed as the
        prior pass had it) baring small teeth — the "about to spring" hunger read, not a slack
        snarl.
     5. Rib/hollow value ladder on the pitched chest underside (kept from the prior pass) — the
        gaunt-grave-eater tell, mid-value ridges over dark hollow shadow.
     6. Torn loincloth rags at the hips (kept) — the single garment scrap, jagged torn hem.

   POSE SENTENCE: caught at the instant before the spring — crouched low on all fours with hips
   sunk and knees splayed wide, spine coiled and pitched forward so the head is thrust up and
   ahead of the shoulders with jaw wedged open and tongue lolling, weight rocked onto raking
   clawed hands braced just off the ground, a hair's breadth from launching at the viewer.

   Whole-object grammar: one function, one geometry frame, no anchors. NO held item — the CLAWS
   are the weapons. Spine +z (front), up +y, ground y=0. Imported by ps1-sheet.html
   (SETS['rebuild-w3'], cell 0, fn buildGhoul). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGhoul(){
  /* ---------- PALETTE (corpse grey-white; the palest, most drained skin in the cast; claws lifted
     to near-white so the signature carries the model's one loud value spike — law 3) ---------- */
  const P = {
    skin:0xb9bcae, skinDk:0x8f9384, skinDkr:0x6f7364,     // hairless grey-white corpse hide
    hollow:0x4a4c40,                                        // recessed shadow flesh (rib gaps, sockets)
    claw:0xf5f0dc, clawTip:0x2e2822,                        // BRIGHT pale bone claws, dark tips
    mouth:0x241d18, tooth:0xdcd3be, gum:0x6a4a44,           // r2->r3: mouth lifted off void-black
                                                             // (0x100d0a was ~6RGB from VOID_BG
                                                             // 0x0a0908 -- the "wedged open jaw" was
                                                             // reading as a hole into nothing, law 3)
    tongue:0xc9a99c, tongueDk:0x9c7a6e,                     // pale lolling tongue
    eye:0x0d0b09,                                           // black sunken eye pits
    rag:0x655d4c, ragDk:0x4b4536, ragTorn:0x746b57,        // filthy loincloth rags
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ---------- LANDMARKS — a deep CROUCH. Hips sit low (~0.54) and the torso pitches FORWARD and
     DOWN so shoulders/head lead out ahead of the hips, near knee height. Knees ride HIGH (near
     hip height) and splayed WIDE. Long arms drop from the low-slung shoulders to hands braced just
     off the ground out front. Everything coiled — a sprinter half a beat from the gun. ---------- */
  const L = {
    hipY:0.54, hipHalf:0.140,
    lowbackY:0.58, lowbackZ:0.03,
    midbackY:0.65, midbackZ:0.18,
    ribY:0.72, ribZ:0.33,
    shldY:0.78, shldZ:0.46,          // shoulders thrust forward + low
    shoulderX:0.240,
    // neck+head thrust UP and clear of the shoulder mass (self-correction r1->r2: the prior pass
    // tucked the head into the crouch and hid the jaw/tongue in shadow — "head up, jaw wide" per
    // direction) so the open jaw & tongue silhouette against open void, not against the torso.
    neckY:0.92, neckZ:0.62,
    headY:1.00, headZ:0.78,
  };

  /* ===== TORSO — a hunched spine loft from the low hips up-and-FORWARD to the shoulders, chained
     tubes (not a vertical stack) so the whole trunk pitches forward over the crouch. Gaunt and
     narrow; a paler drawn skin. ===== */
  {
    const hip = V(0, L.hipY, -0.02);
    const lb  = V(0, L.lowbackY, L.lowbackZ);
    const mb  = V(0, L.midbackY, L.midbackZ);
    const rb  = V(0, L.ribY, L.ribZ);
    const sh  = V(0, L.shldY, L.shldZ);
    tube(hip, lb, 0.148, 0.138, 8, P.skinDk, {phase:Math.PI/8, capA:{hex:P.skinDkr, lift:0.02}});
    tube(lb, mb, 0.138, 0.128, 8, P.skinDk, {phase:Math.PI/8});
    tube(mb, rb, 0.128, 0.148, 8, P.skin,   {phase:Math.PI/8});   // ribcage swells
    tube(rb, sh, 0.148, 0.162, 8, P.skin,   {phase:Math.PI/8});   // broad gaunt shoulders
    // cap the shoulder ring toward the neck
    const shr = ring(sh, new THREE.Vector3().subVectors(sh,rb).normalize(), 0.162, 0.162, 8, Math.PI/8);
    capFan(shr, sh.clone().add(V(0,0.02,0.07)), P.skinDk);

    /* visible RIB hints — pale ridges + dark hollows on the pitched chest/belly underside. */
    for(let k=0;k<4;k++){
      const t = k/3;
      const cy = L.midbackY + t*0.06 - 0.06;
      const cz = L.midbackZ + t*0.15;
      quad(V(-0.11,cy,cz+0.11), V(0.11,cy,cz+0.11),
           V(0.10,cy-0.018,cz+0.115), V(-0.10,cy-0.018,cz+0.115), P.skin, 0.03);
      quad(V(-0.10,cy-0.018,cz+0.115), V(0.10,cy-0.018,cz+0.115),
           V(0.09,cy-0.040,cz+0.112), V(-0.09,cy-0.040,cz+0.112), P.hollow, 0.03);
    }
  }

  /* ===== HEAD — thrust FORWARD and UP on the low neck, jaw wedged WIDE open baring small teeth,
     the too-long tongue lolling out and down: the pounce-hunger read. A gaunt skull loft (short
     muzzle jut) under a heavy brow, sunken black eye pits. ===== */
  {
    const nb = V(0, L.shldY-0.01, L.shldZ+0.03);
    const nh = V(0, L.headY-0.08, L.headZ-0.08);   // reach up INTO the lifted head base
    tube(nb, nh, 0.088, 0.076, 8, P.skinDk, {phase:Math.PI/8});

    const n=8, ph=Math.PI/n;
    const cx=0, cz=L.headZ, cy=L.headY;
    const bands=[
      {y:cy-0.06, rx:0.086, rz:0.094, hex:P.skin},    // jaw
      {y:cy+0.00, rx:0.102, rz:0.104, hex:P.skin},    // cheek
      {y:cy+0.05, rx:0.098, rz:0.090, hex:P.skinDk},  // brow (heavy)
      {y:cy+0.10, rx:0.076, rz:0.070, hex:P.skinDk},  // crown (bald)
    ];
    const rings=bands.map(b=>ring(V(cx,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph));
    // heavy brow: push the brow front verts forward + down, casting the sockets into shadow
    for(const i of [1,2]){ rings[2][i].z += 0.020; rings[2][i].y -= 0.014; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(cx, cy+0.145, cz-0.006), P.skinDkr);   // bald pate

    // sunken black eye sockets — small dark hollow discs under the brow
    for(const sx of [-1,1]){
      quad(V(sx*0.052, cy+0.018, cz+0.086), V(sx*0.052+sx*0.028, cy+0.018, cz+0.080),
           V(sx*0.052+sx*0.026, cy-0.006, cz+0.080), V(sx*0.052, cy-0.006, cz+0.086), P.eye, 0.02);
    }

    /* JAW WEDGED OPEN — upper jaw fixed to the skull, lower jaw dropped + pushed forward, opening
       a wide dark gap between them for the tongue and teeth to sit in. */
    const uJawY = cy-0.058, uJawZ = cz+0.075;
    const uB=V(0, uJawY+0.02, uJawZ-0.02), uT=V(0, uJawY+0.01, uJawZ+0.10);
    tube(uB, uT, 0.076, 0.048, n, P.skin, {raz:0.056, rbz:0.034, phase:ph, capB:{hex:P.skinDk, lift:0.008}});

    const lJawY = cy-0.170, lJawZ = cz+0.050;                 // dropped WELL below the upper jaw
    const lB=V(0, lJawY+0.02, lJawZ), lT=V(0, lJawY-0.02, lJawZ+0.135);
    tube(lB, lT, 0.070, 0.044, n, P.skinDk, {raz:0.050, rbz:0.030, phase:ph, capB:{hex:P.skinDk, lift:0.008}});

    /* MOUTH CAVITY — a tall dark gash spanning from the upper jaw down to the dropped lower jaw. */
    quad(V(-0.062, uJawY+0.018, uJawZ+0.075), V(0.062, uJawY+0.018, uJawZ+0.075),
         V(0.052, lJawY+0.010, lJawZ+0.100), V(-0.052, lJawY+0.010, lJawZ+0.100), P.mouth, 0.0);

    /* r2->r3 round 1: widened teeth past the 0.04u floor but anchored them at uJawY+0.018/
       lJawY+0.008 -- inside the ring() cross-section of the jaw tubes themselves (raz/rbz=0.056/
       0.034 and 0.050/0.030 are the tubes' OWN vertical half-thickness around those exact
       centerlines), so every tooth tri was built entirely inside solid jaw flesh and fully
       occluded — zero teeth ever reached the render at r2 OR the first r3 attempt. round 2:
       re-anchored outside each tube's own surface (below the upper tube's underside, above the
       lower tube's topside) and pushed forward of both tubes' front caps (uJawZ+0.10 /
       lJawZ+0.135) so they poke into the open gap instead of the tube's own mass. */
    const tooth=(x,y,z,w,h,down)=>{
      const ty = down ? y-h : y+h;
      quad(V(x-w,y,z+0.006), V(x+w,y,z+0.006), V(x,ty,z+0.004), V(x,ty,z+0.004), P.tooth, 0.02);
    };
    for(const x of [-0.040,-0.014,0.014,0.040]){
      tooth(x, uJawY-0.050, uJawZ+0.175, 0.022, 0.048, true);     // upper row (hangs down) — bright fangs
      tooth(x, lJawY+0.055, lJawZ+0.195, 0.020, 0.038, false);    // lower row (juts up)
    }

    /* TONGUE — too-long pale ribbon, lolling out from the front of the open mouth and arcing DOWN
       and FORWARD, clear of the chin/jaw mass into open void (self-correction r1->r2: r1's tongue
       sat tucked inside the jaw geometry and vanished — pulled it out past the frontmost tooth so
       it silhouettes on its own, per law 2/3). Built with tube() (round, bright, unmissable) not a
       thin flat quad. The single loudest bright feature after the claws. */
    {
      /* r2->r3: root->tip only leaned 0.022u in x -- nearly a pure -y/+z path, which under the
         45deg-yaw dimetric camera foreshortens hard onto the SAME screen diagonal the near arm
         occupies, so the tongue visually fused into the arm's silhouette (a thin same-toned line
         riding the limb, not a separate readable shape). Swung the whole tongue out to -x (away
         from the reaching-forward near arm) and widened the arc so it silhouettes on open void. */
      const root = V(0, lJawY+0.028, lJawZ+0.118);   // right at the open mouth's front edge
      const mid  = V(-0.075, lJawY-0.065, lJawZ+0.195);
      const tip  = V(-0.135, lJawY-0.175, lJawZ+0.225);
      tube(root, mid, 0.036, 0.030, 5, P.tongue);
      tube(mid, tip, 0.030, 0.016, 5, P.tongueDk, {capB:{hex:P.tongueDk, lift:0.012}});
    }
  }

  /* ===== ARMS — long and gaunt, dropping from the low shoulders down-and-FORWARD so the clawed
     hands hover just off the ground out front (weight braced, not planted flat — mid-spring).
     LONG CLAW finger tubes fan forward, the brightest value in the cast, dark-tipped. ===== */
  {
    const arm=(sign)=>{
      const S=V(sign*L.shoulderX, L.shldY-0.02, L.shldZ-0.02);
      const E=V(sign*0.36, 0.44, L.shldZ+0.20);          // elbow out + forward, dropping
      const W=V(sign*0.31, 0.18, L.shldZ+0.38);          // wrist braced low, near the ground out front
      tube(S,E,0.068,0.054,6,P.skinDk);                   // upper arm (gaunt)
      tube(E,W,0.054,0.042,6,P.skin);                     // forearm
      const palm=W.clone().add(V(0,-0.02,0.05));
      blob(palm.x,palm.y,palm.z, 0.054,0.038,0.056, P.skin, 6, 4);
      /* LONG CLAW fingers — five bony tubes fanning FORWARD + splayed, pale-bright, dark tips.
         r1->r2 thickened past the 0.04u floor but r2's fan was z-dominant (x in [-0.42,0.44], z
         pinned to ~1) -- under the 45deg-yaw dimetric capture camera that direction rides almost
         straight down the foreshortened view diagonal, so a 0.21u claw projected to a couple px
         and the whole signature vanished into a fist-blob (confirmed on the ghoul-r2 render: no
         bright claws visible on either hand). r2->r3: NOT mirrored by `sign` either (both hands
         fanned the identical absolute direction) -- fixed. Widened the fan's lateral spread,
         thickened again, and lengthened so enough of each claw survives foreshortening from any
         hand-facing camera angle. */
      const fanDirs=[
        V(-0.62,-0.34,0.62), V(-0.30,-0.46,0.78), V(0.02,-0.56,0.82),
        V(0.34,-0.46,0.78), V(0.64,-0.30,0.58),
      ];
      for(const d of fanDirs){
        const dn=V(d.x*sign,d.y,d.z).normalize();
        const tip=palm.clone().addScaledVector(dn,0.27);   // LONG claws
        tube(palm, tip, 0.036,0.020,4,P.claw,{capB:{hex:P.clawTip, lift:0.012}});
      }
    };
    arm(-1);
    arm( 1);
  }

  /* ===== LEGS — deep crouch: knees HIGH (near hip height) and splayed WIDE, shanks folding back
     down to feet planted under/behind the hips. Coiled like a sprinter in the blocks. Long clawed
     toes grip the ground — bright value to match the hand claws. ===== */
  {
    const leg=(sign)=>{
      const hip=V(sign*L.hipHalf, L.hipY-0.02, -0.03);
      const knee=V(sign*0.32, 0.50, 0.22);               // knee HIGH + WIDE + forward (the coil)
      const ankle=V(sign*0.23, 0.10, 0.07);              // shank folds back down under the body
      const foot=V(sign*0.21, 0.045, 0.21);              // foot planted, toes forward
      tube(hip, knee, 0.094, 0.060, 6, P.skinDk);        // thigh (up to the high knee)
      tube(knee, ankle, 0.056, 0.040, 6, P.skin);        // shank folding back down
      blob(knee.x,knee.y,knee.z, 0.050,0.046,0.050, P.skinDk, 6, 4);  // bony knee cap
      tube(ankle, foot, 0.044, 0.036, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.006}});
      /* r2->r3: 0.026/0.014 radius (0.028-0.052u diameter) read as illegible single-pixel flecks
         on the render, not countable gripping claws — thickened + lengthened past the floor. */
      for(const tx of [-0.036,0,0.036]){
        const toeA=V(foot.x+tx*0.6, 0.048, foot.z);
        const toeB=V(foot.x+tx, 0.015, foot.z+0.165);     // long forward toe, gripping
        tube(toeA, toeB, 0.034,0.020,4,P.claw,{capB:{hex:P.clawTip, lift:0.010}});  // BRIGHT toe-claw
      }
    };
    leg(-1);
    leg( 1);
  }

  /* ===== LOINCLOTH RAGS — a torn wrap around the low hips, ragged uneven hem hanging in strips.
     Sits on the crouched pelvis. ===== */
  {
    const n=8, ph=Math.PI/n;
    const top=ring(V(0,L.hipY+0.02,-0.02), V(0,1,0), 0.158, 0.148, n, ph);
    const hemY=[0.32,0.26,0.22,0.34,0.38,0.24,0.20,0.30];   // jagged torn hem
    const hem=[];
    for(let i=0;i<n;i++){
      const t=ph + (i/n)*Math.PI*2;
      hem.push(V(Math.cos(t)*0.178, hemY[i], -0.02 + Math.sin(t)*0.168));
    }
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(top[i], top[i2], hem[i2], hem[i], i&1?P.rag:P.ragTorn, 0.06);
    }
    for(const i of [1,5]){
      const t=ph + (i/n)*Math.PI*2;
      const a=V(Math.cos(t)*0.168, hemY[i], -0.02 + Math.sin(t)*0.158);
      tube(a, a.clone().add(V(0,-0.10,0.01)), 0.023,0.011,4,P.ragDk,{capB:{hex:P.ragDk}});
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
