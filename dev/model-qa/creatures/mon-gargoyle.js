/* dev/model-qa/creatures/mon-gargoyle.js — the GARGOYLE: LIVING STONE (whole-object monster).
   Whole-object grammar: one function, one geometry frame, no anchors. NO held item — the CLAWS
   are the weapons. The PLINTH is part of the figure (a chipped stone block on the base disc, the
   perch the gargoyle grips). The read: a horned, crouched statue you realize is WATCHING you.
   Tells: entirely grey stone (2–3 close greys, chipped pale weathering quads); a raised chipped
   PLINTH block; a digitigrade crouch with clawed feet GRIPPING the plinth edge; two BAT-STYLE wings
   half-spread behind (spar + membrane technique from mon-bat, but STONE-THICK membranes with
   chipped straight edges); two curved horns; a blunt fanged muzzle; long arms with claws resting
   between the feet. Stillness is the horror — it holds a pose, not a lunge.
   Imported by mon-gargoyle-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGargoyle(){
  /* ---------- PALETTE (ENTIRELY grey stone: 3 close greys + chipped pale weathering) ---------- */
  const P = {
    stone:0x6d6a64, stoneDk:0x504e49, stoneDkr:0x3b3935,   // body stone, mid + shadow
    stoneLt:0x86837a, chip:0xa7a397,                        // lit stone; chipped pale edges (weathering)
    plinth:0x605d57, plinthDk:0x47443f, plinthLt:0x7c7970,  // the perch block
    membrane:0x5a5852, membraneEdge:0x9a968b,               // stone-thick wing skin; chipped edge
    horn:0x57544e, hornLt:0x817d73,                          // the curved horns
    eye:0x2a2620, fang:0x9a968b, maw:0x201d19,
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ---------- PLINTH FIRST — a chipped rectangular stone block sitting ON the base disc. The
     gargoyle perches on top; its clawed feet grip the FRONT-TOP edge. ~0.35u tall. It is part of
     the figure (baked into the one mesh). Its top face is the ground the crouch is built on. ----- */
  const PLINTH = { x:0.30, z:0.24, y0:0.055, y1:0.40 };     // half-extents + bottom/top y
  {
    const {x,z,y0,y1}=PLINTH;
    const cor=(sx,sy,sz)=>V(sx*x, sy? y1 : y0, sz*z);
    // 6 faces of the block. Slight per-corner jitter via chipped chamfer quads at the top edges.
    const tNW=V(-x,y1,-z), tNE=V(x,y1,-z), tSE=V(x,y1,z), tSW=V(-x,y1,z);
    const bNW=V(-x,y0,-z), bNE=V(x,y0,-z), bSE=V(x,y0,z), bSW=V(-x,y0,z);
    quad(tSW,tSE,tNE,tNW, P.plinthLt, 0.05);                 // top (lit)
    quad(tSW,tNW,bNW,bSW, P.plinth, 0.05);                   // left
    quad(tNE,tSE,bSE,bNE, P.plinthDk, 0.05);                 // right (shadow)
    quad(tSE,tSW,bSW,bSE, P.plinth, 0.05);                   // front (+z)
    quad(tNW,tNE,bNE,bNW, P.plinthDk, 0.05);                 // back (−z)
    // CHIPPED corners — a couple of pale broken-off facets at the top-front edges (weathering)
    quad(V(-x,y1,z), V(-x+0.09,y1,z), V(-x,y1-0.09,z), V(-x,y1-0.09,z), P.plinthLt, 0.03);
    quad(V(x,y1,z), V(x,y1-0.10,z), V(x-0.10,y1,z), V(x-0.10,y1,z), P.chip, 0.03);
    quad(V(x-0.02,y1,-z+0.02), V(x-0.14,y1,-z+0.02), V(x-0.08,y1-0.08,-z+0.05), V(x-0.08,y1-0.08,-z+0.05), P.plinthLt, 0.03);
    // a chunk knocked out of the front face (a dark recessed notch)
    quad(V(-0.08,y1-0.05,z), V(0.06,y1-0.05,z), V(0.04,y1-0.16,z-0.03), V(-0.06,y1-0.16,z-0.03), P.plinthDk, 0.03);
  }

  /* ---------- LANDMARKS — a crouch built ON the plinth top (y1=0.40). Hips low over the block,
     torso pitched slightly forward, head thrust a touch. Everything coiled but STILL. ---------- */
  const TOP = PLINTH.y1;                                    // the perch surface
  const L = {
    hipY:TOP+0.28, hipHalf:0.16,
    backY:TOP+0.34, backZ:0.04,
    shldY:TOP+0.46, shldZ:0.10,
    shoulderX:0.24,
    neckY:TOP+0.50, neckZ:0.16,
    headY:TOP+0.55, headZ:0.24,
  };

  /* ===== TORSO — a hunched stone loft from the low hips up-and-forward to broad shoulders, built
     as chained tubes so the trunk pitches forward over the crouch. Blocky, heavy, gargoyle-thick. */
  {
    const hip = V(0, L.hipY-0.02, -0.04);
    const back= V(0, L.backY, L.backZ);
    const sh  = V(0, L.shldY, L.shldZ);
    tube(hip, back, 0.170, 0.180, 8, P.stoneDk, {phase:Math.PI/8, capA:{hex:P.stoneDkr, lift:0.02}});
    tube(back, sh, 0.180, 0.200, 8, P.stone, {phase:Math.PI/8});   // broad heavy shoulders
    // cap the shoulder ring toward the neck
    const shr = ring(sh, new THREE.Vector3().subVectors(sh,back).normalize(), 0.200, 0.200, 8, Math.PI/8);
    capFan(shr, sh.clone().add(V(0,0.03,0.05)), P.stoneDk);
    // a heavy CHEST plate — a lit stone slab across the front, with a couple of chipped facets
    quad(V(-0.15,L.backY+0.02,L.backZ+0.15), V(0.15,L.backY+0.02,L.backZ+0.15),
         V(0.13,L.shldY-0.02,L.shldZ+0.13), V(-0.13,L.shldY-0.02,L.shldZ+0.13), P.stoneLt, 0.04);
    quad(V(0.02,L.backY+0.04,L.backZ+0.16), V(0.13,L.backY+0.04,L.backZ+0.15),
         V(0.10,L.backY-0.05,L.backZ+0.14), V(0.02,L.backY-0.05,L.backZ+0.15), P.chip, 0.03);  // chip
  }

  /* ===== HEAD — a blunt fanged stone muzzle under two curved horns; heavy brow over dark eyes.
     Thrust forward + slightly down on a short thick neck. ===== */
  {
    const nb = V(0, L.shldY-0.02, L.shldZ+0.04);
    const nh = V(0, L.headY-0.06, L.headZ-0.06);
    tube(nb, nh, 0.110, 0.095, 8, P.stoneDk, {phase:Math.PI/8});

    const n=8, ph=Math.PI/n, cx=0, cz=L.headZ, cy=L.headY;
    const bands=[
      {y:cy-0.06, rx:0.100, rz:0.108, hex:P.stone},     // jaw
      {y:cy+0.00, rx:0.120, rz:0.118, hex:P.stone},     // cheek
      {y:cy+0.05, rx:0.116, rz:0.106, hex:P.stoneDk},   // heavy brow
      {y:cy+0.10, rx:0.090, rz:0.084, hex:P.stoneDk},   // crown
    ];
    const rings=bands.map(b=>ring(V(cx,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph));
    // heavy brow: push brow front verts forward + down, hooding the eyes
    for(const i of [1,2]){ rings[2][i].z += 0.020; rings[2][i].y -= 0.014; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(cx, cy+0.145, cz-0.01), P.stoneDkr);

    /* BLUNT MUZZLE — a short heavy forward wedge (a stubby snout, not a snout-point) */
    const jawY = cy-0.06;
    const uB=V(0, jawY+0.04, cz+0.07), uT=V(0, jawY+0.020, cz+0.165);
    tube(uB, uT, 0.096, 0.066, n, P.stone, {raz:0.070, rbz:0.048, phase:ph, capB:{hex:P.stoneDk, lift:0.01}});
    const lB=V(0, jawY-0.02, cz+0.07), lT=V(0, jawY-0.04, cz+0.15);
    tube(lB, lT, 0.082, 0.056, n, P.stoneDk, {raz:0.058, rbz:0.040, phase:ph, capB:{hex:P.stoneDkr, lift:0.01}});

    /* MAW — a dark gash between the jaws, with a row of stubby stone FANGS */
    const my=jawY-0.005, mz=cz+0.135;
    quad(V(-0.070,my+0.030,mz), V(0.070,my+0.030,mz),
         V(0.060,my-0.034,mz-0.008), V(-0.060,my-0.034,mz-0.008), P.maw, 0.0);
    const fang=(x,y,z,w,h,down)=>{ const ty=down?y-h:y+h;
      quad(V(x-w,y,z+0.006), V(x+w,y,z+0.006), V(x,ty,z+0.004), V(x,ty,z+0.004), P.fang, 0.02); };
    for(const x of [-0.050,-0.020,0.020,0.050]){
      fang(x, my+0.028, mz+0.002, 0.011, 0.028, true);    // upper fangs
      fang(x, my-0.030, mz+0.002, 0.010, 0.022, false);   // lower fangs
    }

    /* EYES — under the heavy brow, dark with a tiny lit stone glint (blank statue stare, but AWARE) */
    for(const s of [-1,1]){
      const ex=s*0.058, ey=cy+0.022, ez=cz+0.070;
      quad(V(ex-0.022,ey-0.016,ez-0.008), V(ex+0.022,ey-0.016,ez-0.008),
           V(ex+0.020,ey+0.018,ez-0.014), V(ex-0.020,ey+0.018,ez-0.014), P.stoneDkr, 0.03);  // socket
      quad(V(ex-0.013,ey-0.009,ez), V(ex+0.013,ey-0.009,ez),
           V(ex+0.013,ey+0.011,ez-0.005), V(ex-0.013,ey+0.011,ez-0.005), P.eye, 0.0);          // dark eye
      quad(V(ex-0.005,ey+0.001,ez+0.003), V(ex+0.002,ey+0.001,ez+0.003),
           V(ex+0.002,ey+0.007,ez+0.001), V(ex-0.005,ey+0.007,ez+0.001), P.stoneLt, 0.0);      // glint
    }

    /* TWO CURVED HORNS — rising from the crown, sweeping back + out (stone, banded light). Each a
       tapering chain of tubes curving backward. */
    for(const s of [-1,1]){
      const h0=V(s*0.055, cy+0.11, cz-0.03);
      const h1=V(s*0.100, cy+0.21, cz-0.11);
      const h2=V(s*0.118, cy+0.26, cz-0.23);
      const h3=V(s*0.104, cy+0.26, cz-0.34);   // tip curls further BACK + levels off (a real curve)
      tube(h0,h1,0.036,0.028,6,P.horn,{capA:{hex:P.stoneDk}});
      tube(h1,h2,0.028,0.020,6,P.hornLt);
      tube(h2,h3,0.020,0.010,6,P.horn,{capB:{hex:P.hornLt, lift:0.01}});
    }
    /* two blunt cheek-tusks / ear-nubs jutting sideways (gargoyle profile) */
    for(const s of [-1,1]){
      const a=V(s*0.115, cy+0.02, cz-0.02);
      tube(a, a.clone().add(V(s*0.06,0.03,-0.02)), 0.026,0.010,5,P.stoneDk,{capB:{hex:P.hornLt}});
    }
  }

  /* ===== WINGS — the READ, second only to the crouch. Two BAT-STYLE wings HALF-SPREAD behind the
     figure. Spar + membrane technique (from mon-bat), but the membranes are STONE-THICK with
     CHIPPED STRAIGHT edges (not the soft curved bat skin). Symmetric, held (not flapping). Rooted
     at the shoulders, sweeping UP + OUT + BACK so they frame the silhouette. ===== */
  const WSH = V(0, L.shldY+0.02, L.shldZ-0.10);             // wing root (behind the shoulders)
  function wing(s){
    const arm=P.stoneDk;
    // shoulder → elbow (up+out+back) → wrist (up+OUT+back): the arm frame of a half-spread wing.
    // wrist held OUT to the side + up, so the finger-spars fan into a broad webbed sail.
    const EL = V(s*0.30, WSH.y+0.14, WSH.z-0.06);
    const WR = V(s*0.52, WSH.y+0.26, WSH.z-0.14);
    tube(WSH, EL, 0.058, 0.046, 6, arm, {capA:{hex:P.stone}});
    tube(EL, WR, 0.046, 0.034, 6, arm);
    // a thumb-claw hook at the wrist (up-front)
    tube(WR, V(WR.x+s*0.04, WR.y+0.09, WR.z+0.05), 0.018, 0.006, 5, P.stoneDk, {capB:{hex:P.hornLt, lift:0.01}});
    /* 4 finger spars fanning WIDE from the wrist → a broad bat sail (not paddles). Leading sweeps
       UP, the rest fan progressively DOWN + BACK, tips spread far apart. Straight stone spars rib
       the webbing so it reads as fingered bat-wing, not a blade. */
    const F = [
      V(WR.x + s*0.14, WR.y+0.42, WR.z+0.02),   // #1 leading — sweeps UP tall
      V(WR.x + s*0.40, WR.y+0.24, WR.z-0.10),   // #2 — up-out
      V(WR.x + s*0.52, WR.y-0.02, WR.z-0.26),   // #3 — out-back
      V(WR.x + s*0.40, WR.y-0.26, WR.z-0.40),   // #4 trailing — down-back (the low sail corner)
    ];
    for(const f of F) tube(WR, f, 0.026, 0.007, 5, P.stoneDk, {capB:{hex:P.hornLt, lift:0.012}});
    // membrane roots down at the shoulder + flank so the sail hems back to the body
    const ROOTFORE = V(s*0.10, L.shldY+0.00, WSH.z-0.02);
    const ROOTAFT  = V(s*0.08, L.backY-0.08, WSH.z-0.08);
    /* STONE-THICK MEMBRANE CELLS — one triangular web panel between each consecutive spar pair,
       hemmed at the ends back to the body. Front (mid stone) + a back pass for slab thickness. */
    const cells = [
      [WR, F[0], F[1]],
      [WR, F[1], F[2]],
      [WR, F[2], F[3]],
      [WR, F[3], ROOTAFT],          // aft web down to the flank
      [WR, ROOTFORE, F[0]],         // fore web up from the shoulder to the leading tip
    ];
    for(const [a,b,c] of cells){
      quad(a, b, c, c, P.membrane, 0.05);                                   // outer stone web
      const dz=V(0,0,-0.014);
      quad(a.clone().add(dz), c.clone().add(dz), b.clone().add(dz), b.clone().add(dz), P.stoneDkr, 0.05);  // back face
    }
    /* CHIPPED PALE EDGES — thin bright straight quads along the leading + trailing spars (weathering) */
    quad(WR, F[0], F[0].clone().add(V(-s*0.015,-0.02,0)), WR.clone().add(V(-s*0.015,-0.02,0)), P.membraneEdge, 0.03);
    quad(F[2], F[3], F[3].clone().add(V(0,0.02,0.01)), F[2].clone().add(V(0,0.02,0.01)), P.membraneEdge, 0.03);
  }
  wing(+1);
  wing(-1);

  /* ===== ARMS — long, heavy stone arms dropping from the low shoulders down between the feet, the
     clawed hands RESTING on the plinth top (the still, braced perch pose). ===== */
  {
    const arm=(sign)=>{
      const S=V(sign*L.shoulderX, L.shldY-0.03, L.shldZ);
      const E=V(sign*0.30, TOP+0.20, L.shldZ+0.12);          // elbow out + dropping
      const W=V(sign*0.17, TOP+0.02, L.shldZ+0.16);          // wrist low, hands come inward between feet
      tube(S,E,0.078,0.062,6,P.stoneDk);                      // heavy upper arm
      tube(E,W,0.062,0.050,6,P.stone);                        // forearm
      blob(W.x,W.y,W.z, 0.058,0.044,0.060, P.stoneDk, 6, 4);  // knuckled fist resting on the block
      /* CLAW fingers — four short stone talons fanning forward onto the plinth top */
      const fanDirs=[V(-0.4,-0.2,1),V(-0.12,-0.25,1),V(0.14,-0.25,1),V(0.4,-0.2,1)];
      for(const d of fanDirs){
        const dn=d.clone().normalize();
        const tip=W.clone().addScaledVector(dn,0.11);
        tube(W, tip, 0.020,0.008,4,P.stone,{capB:{hex:P.hornLt, lift:0.01}});  // pale talon tip
      }
    };
    arm(-1);
    arm( 1);
  }

  /* ===== LEGS — DIGITIGRADE crouch: knees HIGH + splayed wide, shanks folding down to clawed feet
     that GRIP the FRONT edge of the plinth top (talons curling over the lip). ===== */
  {
    const leg=(sign)=>{
      const hip=V(sign*L.hipHalf, L.hipY-0.02, -0.04);
      const knee=V(sign*0.30, TOP+0.20, 0.10);                // knee HIGH + WIDE + forward
      const hock=V(sign*0.24, TOP+0.06, -0.02);               // digitigrade hock, folding back
      const foot=V(sign*0.22, TOP+0.005, PLINTH.z-0.03);      // foot AT the plinth front edge
      tube(hip, knee, 0.100, 0.066, 6, P.stoneDk);            // thigh up to the high knee
      tube(knee, hock, 0.062, 0.046, 6, P.stone);             // shank folding down
      blob(knee.x,knee.y,knee.z, 0.058,0.052,0.056, P.stoneDk, 6, 4);   // stone kneecap
      tube(hock, foot, 0.048, 0.040, 6, P.stoneDk);           // pastern down to the foot
      /* clawed toes — three talons curling forward OVER the plinth front lip (the GRIP tell) */
      for(const tx of [-0.035,0,0.035]){
        const toeA=V(foot.x+tx*0.5, foot.y, foot.z);
        const toeB=V(foot.x+tx, PLINTH.y1-0.06, foot.z+0.07);   // tip curls DOWN over the lip
        tube(toeA, toeB, 0.020,0.010,4,P.stone,{capB:{hex:P.hornLt, lift:0.008}});
      }
      // a back dew-claw gripping behind
      tube(foot, V(foot.x, PLINTH.y1-0.05, foot.z-0.06), 0.016,0.008,4,P.stoneDk,{capB:{hex:P.hornLt}});
    };
    leg(-1);
    leg( 1);
  }

  /* base disc — shared style (Medium: r=0.42). Authored inline (stone tones for the disc rim). */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
