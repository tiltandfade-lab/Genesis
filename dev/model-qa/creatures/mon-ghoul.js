/* dev/model-qa/creatures/mon-ghoul.js — the GHOUL landmark table (feral undead, Medium).
   Whole-object grammar: one function, one geometry frame, no anchors. NO held item — the CLAWS
   are the weapons. The read is FERAL UNDEAD ABOUT TO POUNCE, told by POSTURE: a low CROUCH
   (~1.0u tall despite being man-sized), all coiled angles — knees HIGH and WIDE, the weight thrown
   FORWARD onto long-clawed HANDS that nearly touch the ground, the head THRUST forward on a low
   neck with a lipless mouth of small teeth and sunken black eye pits. Hairless grey-white corpse
   skin stretched over visible rib hints; a torn loincloth of rags at the waist. It must read
   HUNGRIER and FASTER than the shambling upright zombie — this thing is a spring under tension.
   Imported by mon-ghoul-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGhoul(){
  /* ---------- PALETTE (corpse grey-white; the palest, most drained skin in the cast) ---------- */
  const P = {
    skin:0xb9bcae, skinDk:0x8f9384, skinDkr:0x6f7364,     // hairless grey-white corpse hide
    hollow:0x5a5c50,                                        // recessed shadow flesh (rib gaps, sockets)
    claw:0xdcd8c6, clawTip:0x2a251d,                        // pale bone claws, dark tips
    mouth:0x120e0a, tooth:0xd8cfba, gum:0x6a4a44,
    eye:0x0d0b09,                                           // black sunken eye pits
    rag:0x655d4c, ragDk:0x4b4536, ragTorn:0x746b57,        // filthy loincloth rags
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ---------- LANDMARKS — a CROUCH. The hips sit low (~0.55) and the torso pitches FORWARD and
     DOWN so the shoulders/head lead out ahead of the hips, near knee height. Knees ride HIGH (near
     hip height) and splayed WIDE. Long arms drop from the low-slung shoulders to hands on the
     ground out front. Everything coiled. ---------- */
  const L = {
    hipY:0.56, hipHalf:0.135,
    // the torso pitch: back rises from the low hips up-and-FORWARD to the shoulders
    lowbackY:0.60, lowbackZ:0.02,
    midbackY:0.66, midbackZ:0.16,
    ribY:0.72, ribZ:0.30,
    shldY:0.76, shldZ:0.42,          // shoulders thrust forward + low
    shoulderX:0.235,
    // neck+head thrust forward + UP a touch so the lipless grin & eye pits read front-on (the
    // head lifts off the chest into a hungry stare rather than tucking under the shoulders).
    neckY:0.80, neckZ:0.52,
    headY:0.82, headZ:0.64,
  };

  /* ===== TORSO — a hunched spine loft from the low hips up-and-FORWARD to the shoulders, built as
     chained tubes (not a vertical stack) so the whole trunk pitches forward over the crouch. Gaunt
     and narrow; a paler drawn skin. ===== */
  {
    const hip = V(0, L.hipY, -0.02);
    const lb  = V(0, L.lowbackY, L.lowbackZ);
    const mb  = V(0, L.midbackY, L.midbackZ);
    const rb  = V(0, L.ribY, L.ribZ);
    const sh  = V(0, L.shldY, L.shldZ);
    tube(hip, lb, 0.150, 0.140, 8, P.skinDk, {phase:Math.PI/8, capA:{hex:P.skinDkr, lift:0.02}});
    tube(lb, mb, 0.140, 0.130, 8, P.skinDk, {phase:Math.PI/8});
    tube(mb, rb, 0.130, 0.150, 8, P.skin,   {phase:Math.PI/8});   // ribcage swells
    tube(rb, sh, 0.150, 0.165, 8, P.skin,   {phase:Math.PI/8});   // broad gaunt shoulders
    // cap the shoulder ring toward the neck
    const shr = ring(sh, new THREE.Vector3().subVectors(sh,rb).normalize(), 0.165, 0.165, 8, Math.PI/8);
    capFan(shr, sh.clone().add(V(0,0.02,0.06)), P.skinDk);

    /* visible RIB hints — pale ridges + dark hollows on the pitched chest/belly underside. The
       chest faces down-and-forward, so the ribs sit on the lower-front of the ribcage tube. */
    for(let k=0;k<4;k++){
      const t = k/3;
      const cy = L.midbackY + t*0.06 - 0.06;
      const cz = L.midbackZ + t*0.14;
      // a rib ridge (pale) with a hollow shadow below it
      quad(V(-0.11,cy,cz+0.11), V(0.11,cy,cz+0.11),
           V(0.10,cy-0.018,cz+0.115), V(-0.10,cy-0.018,cz+0.115), P.skin, 0.03);
      quad(V(-0.10,cy-0.018,cz+0.115), V(0.10,cy-0.018,cz+0.115),
           V(0.09,cy-0.040,cz+0.112), V(-0.09,cy-0.040,cz+0.112), P.hollow, 0.03);
    }
  }

  /* ===== HEAD — thrust FORWARD on the low neck, a lipless snarl. A gaunt skull loft (short muzzle
     jut) with a wide lipless mouth of small teeth and sunken BLACK eye pits under a heavy brow. == */
  {
    // neck: short tube from shoulders out to the head base (forward + slightly down)
    const nb = V(0, L.shldY-0.01, L.shldZ+0.02);
    const nh = V(0, L.headY-0.07, L.headZ-0.06);   // reach up INTO the lifted head base
    tube(nb, nh, 0.090, 0.078, 8, P.skinDk, {phase:Math.PI/8});

    const n=8, ph=Math.PI/n;
    const cx=0, cz=L.headZ, cy=L.headY;
    /* skull loft: jaw -> cheek -> brow -> crown, tipped slightly forward/down (the lunge) */
    const bands=[
      {y:cy-0.05, rx:0.088, rz:0.096, hex:P.skin},    // jaw
      {y:cy+0.00, rx:0.104, rz:0.104, hex:P.skin},    // cheek
      {y:cy+0.05, rx:0.100, rz:0.092, hex:P.skinDk},  // brow (heavy)
      {y:cy+0.10, rx:0.078, rz:0.072, hex:P.skinDk},  // crown (bald)
    ];
    const rings=bands.map(b=>ring(V(cx,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph));
    // heavy brow: push the brow front verts forward + down, casting the eyes into shadow
    for(const i of [1,2]){ rings[2][i].z += 0.018; rings[2][i].y -= 0.012; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(cx, cy+0.145, cz-0.006), P.skinDkr);   // bald pate

    /* short MUZZLE jut — a stubby forward wedge carrying the lipless mouth (ghoul face is more
       skull than snout, so this is small — just enough to push the teeth forward). */
    const jawY = cy-0.055;
    const uB=V(0, jawY+0.03, cz+0.06), uT=V(0, jawY+0.015, cz+0.155);
    tube(uB, uT, 0.078, 0.050, n, P.skin, {raz:0.056, rbz:0.036, phase:ph, capB:{hex:P.skinDk, lift:0.008}});
    const lB=V(0, jawY-0.02, cz+0.06), lT=V(0, jawY-0.045, cz+0.14);
    tube(lB, lT, 0.066, 0.042, n, P.skin, {raz:0.048, rbz:0.030, phase:ph, capB:{hex:P.skinDk, lift:0.008}});

    /* LIPLESS MOUTH — a wide dark gash between the jaws, ringed by small pale teeth (the hungry
       grin). Dark cavity, then a top row and bottom row of little tooth quads. */
    const my = jawY-0.005, mz = cz+0.125;
    // wider, deeper gash so the lipless grin reads front-on
    quad(V(-0.070,my+0.034,mz), V(0.070,my+0.034,mz),
         V(0.062,my-0.038,mz-0.008), V(-0.062,my-0.038,mz-0.008), P.mouth, 0.0);
    // small teeth — a row of little downward + upward nubs along the lipless gum lines
    const tooth=(x,y,z,w,h,down)=>{
      const ty = down ? y-h : y+h;
      quad(V(x-w,y,z+0.006), V(x+w,y,z+0.006), V(x,ty,z+0.004), V(x,ty,z+0.004), P.tooth, 0.02);
    };
    for(const x of [-0.056,-0.034,-0.011,0.011,0.034,0.056]){
      tooth(x, my+0.032, mz+0.002, 0.009, 0.026, true);    // upper row
      tooth(x, my-0.036, mz+0.002, 0.008, 0.022, false);   // lower row
    }

    /* EYES REMOVED 2026-07-04 (Adam: "across the board the eyes are in the wrong place so just
       get rid of them"). See dev/model-qa/REFERENCE-DIRECTION.md's dated reversal block. */
  }

  /* ===== ARMS — long and gaunt, dropping from the low shoulders down-and-FORWARD so the clawed
     HANDS nearly touch the ground out in front (the pounce brace). Long CLAW finger tubes fan
     forward, pale with dark tips — the weapons. ===== */
  {
    const arm=(sign)=>{
      const S=V(sign*L.shoulderX, L.shldY-0.02, L.shldZ-0.02);
      const E=V(sign*0.34, 0.42, L.shldZ+0.18);          // elbow out + forward, dropping
      const W=V(sign*0.30, 0.14, L.shldZ+0.34);          // wrist low, near the ground out front
      tube(S,E,0.070,0.056,6,P.skinDk);                   // upper arm (gaunt)
      tube(E,W,0.056,0.044,6,P.skin);                     // forearm
      // palm nub braced on the ground
      const palm=W.clone().add(V(0,-0.02,0.05));
      blob(palm.x,palm.y,palm.z, 0.055,0.040,0.058, P.skin, 6, 4);
      /* LONG CLAW fingers — five bony tubes fanning FORWARD + splayed, tips down to the floor.
         Prominent and pale, the tips dark: the ghoul's weapons. */
      const fanDirs=[
        V(-0.40,-0.5,1), V(-0.16,-0.55,1), V(0.05,-0.6,1), V(0.26,-0.55,1), V(0.42,-0.4,0.9),
      ];
      for(const d of fanDirs){
        const dn=d.clone().normalize();
        const tip=palm.clone().addScaledVector(dn,0.15);   // LONG claws
        tube(palm, tip, 0.018,0.009,4,P.claw,{capB:{hex:P.clawTip, lift:0.01}});
      }
    };
    arm(-1);
    arm( 1);
  }

  /* ===== LEGS — deep crouch: knees HIGH (near hip height) and splayed WIDE, shanks folding back
     down to feet planted under/behind the hips. Coiled like a sprinter in the blocks. Long clawed
     toes grip the ground. ===== */
  {
    const leg=(sign)=>{
      const hip=V(sign*L.hipHalf, L.hipY-0.02, -0.03);
      const knee=V(sign*0.31, 0.52, 0.20);               // knee HIGH + WIDE + forward (the coil)
      const ankle=V(sign*0.22, 0.10, 0.06);              // shank folds back down under the body
      const foot=V(sign*0.20, 0.045, 0.20);              // foot planted, toes forward
      tube(hip, knee, 0.096, 0.062, 6, P.skinDk);        // thigh (up to the high knee)
      tube(knee, ankle, 0.058, 0.042, 6, P.skin);        // shank folding back down
      blob(knee.x,knee.y,knee.z, 0.052,0.048,0.052, P.skinDk, 6, 4);  // bony knee cap
      // gnarled foot + long clawed toes
      tube(ankle, foot, 0.046, 0.038, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.006}});
      for(const tx of [-0.030,0,0.030]){
        const toeA=V(foot.x+tx*0.5, 0.045, foot.z);
        const toeB=V(foot.x+tx, 0.02, foot.z+0.11);      // long forward toe
        tube(toeA, toeB, 0.018,0.010,4,P.skin,{capB:{hex:P.clawTip, lift:0.008}});  // dark toe-claw
      }
    };
    leg(-1);
    leg( 1);
  }

  /* ===== LOINCLOTH RAGS — a torn wrap around the low hips, ragged uneven hem hanging in strips.
     Sits on the crouched pelvis. ===== */
  {
    const n=8, ph=Math.PI/n;
    const top=ring(V(0,L.hipY+0.02,-0.02), V(0,1,0), 0.160, 0.150, n, ph);
    const hemY=[0.34,0.28,0.24,0.36,0.40,0.26,0.22,0.32];   // jagged torn hem
    const hem=[];
    for(let i=0;i<n;i++){
      const t=ph + (i/n)*Math.PI*2;
      hem.push(V(Math.cos(t)*0.180, hemY[i], -0.02 + Math.sin(t)*0.170));
    }
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(top[i], top[i2], hem[i2], hem[i], i&1?P.rag:P.ragTorn, 0.06);
    }
    // a couple of loose hanging strips
    for(const i of [1,5]){
      const t=ph + (i/n)*Math.PI*2;
      const a=V(Math.cos(t)*0.170, hemY[i], -0.02 + Math.sin(t)*0.160);
      tube(a, a.clone().add(V(0,-0.10,0.01)), 0.024,0.012,4,P.ragDk,{capB:{hex:P.ragDk}});
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
