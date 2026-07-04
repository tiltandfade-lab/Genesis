/* dev/model-qa/creatures/mon-minotaur.js — a BULL'S HEAD on a massive humanoid frame (whole-object
   grammar). Same one-function / one-geometry-frame / no-anchors law as humanoid.js. A BIG Medium
   (~1.9u, base disc r=0.48 — taller and more massive than the orc/bugbear, but a hair shy of the
   LARGE ogre): a broad muzzled bull head with flared-nostril hints, two sweeping HORNS (thick at
   the base, curving up-and-out to sharp tips), a short mane ridge down the neck, hoofed
   digitigrade legs (solid wedge hooves, no toes), leather harness straps over a bare barrel chest,
   a short tufted tail. A huge double-bladed GREATAXE held two-handed across the body (authored
   FIRST — both fists derived from the haft). Deep brown-black hide, paler muzzle. A braced,
   charge-ready stance. Imported by mon-minotaur-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildMinotaur(){
  /* ---------- PALETTE (VS desaturated; deep brown-black bull hide, PALER muzzle) ---------- */
  const P = {
    hide:0x4a3a2a, hideDk:0x2e241a, hideLt:0x5e4a34, hideMot:0x403424,   // deep brown-black hide, wide value spread
    muzzle:0x9a8158, muzzleDk:0x6e5b3c, muzzleLt:0xb09666,                            // PALE muzzle — the bright read
    nostril:0x201814, mane:0x1f1a12, maneDk:0x14100b,                                 // dark nostrils + coarse black mane
    horn:0xcabc98, hornDk:0xa08f6c, hornTip:0x2b2318,                                 // pale bone horns, dark tips
    harness:0x4e3d2a, harnessDk:0x352a1c, buckle:0x8a7038, strap:0x463522,           // leather harness straps
    steel:0x767b7e, steelDk:0x4a4e51, steelLt:0x969b9e, hafte:0x5a4326, haftDk:0x3f2f1a, // greataxe steel (VS-dulled) + wood haft
    hoof:0x241d15, hoofLt:0x3a2e20, tuft:0x1f1a12,                                     // near-black wedge hooves + tail tuft
    eye:0x8a1e14, eyeDk:0x14100a,                                                      // blood-red bull eye deep in the socket
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — BIG Medium (~1.9u), massive humanoid frame: barrel chest, huge
     shoulders, thick neck flowing into the bull head. Digitigrade legs (hips high, a reversed knee
     joint, hooves at ground). Braced charge-ready stance (weight forward, shoulders squared). --- */
  const L = {
    hipY:0.98, waistY:1.06, ribY:1.20, chestY:1.34, shldY:1.46, neckY:1.52,
    hipHalf:0.170, shoulderX:0.400,
    jawY:1.60, muzzleY:1.62, cheekY:1.72, browY:1.80, crownY:1.86, headTopY:1.90,
  };

  /* slight braced forward set — square the shoulders over the planted feet (charge-ready, not a
     slump or an aggressive lunge; a coiled bull about to drive forward) */
  const brace = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.08);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- GREATAXE FIRST — held TWO-HANDED across the body, haft roughly horizontal-diagonal
     in front of the chest, a big double-bit head out to the (character's) right. Both fists derive
     from the haft. The haft is ground truth. ---------- */
  const GRIP_R = V(0.38, 1.30, 0.44);                         // lower/right fist (dominant, forward)
  const GRIP_L = V(-0.16, 1.50, 0.38);                        // upper/left fist, higher + inboard
  const HAFT = new THREE.Vector3().subVectors(GRIP_R, GRIP_L).normalize();  // points down-right-fwd
  const HEAD_C = GRIP_R.clone().addScaledVector(HAFT, 0.30);  // axe head beyond the lower fist (kept up near the chest)
  const BUTT   = GRIP_L.clone().addScaledVector(HAFT, -0.22); // haft butt above the upper fist
  {
    /* wooden haft butt -> wrapped grips -> steel throat at the head */
    tube(BUTT, GRIP_L.clone().addScaledVector(HAFT,-0.05), 0.030, 0.030, 6, P.haftDk, {capA:{hex:P.steelDk, lift:0.02}});
    tube(GRIP_L.clone().addScaledVector(HAFT,-0.05), GRIP_L.clone().addScaledVector(HAFT,0.06), 0.034, 0.034, 6, P.strap); // upper grip wrap
    tube(GRIP_L.clone().addScaledVector(HAFT,0.06), GRIP_R.clone().addScaledVector(HAFT,-0.06), 0.031, 0.033, 6, P.hafte);
    tube(GRIP_R.clone().addScaledVector(HAFT,-0.06), GRIP_R.clone().addScaledVector(HAFT,0.06), 0.036, 0.036, 6, P.strap); // lower grip wrap
    tube(GRIP_R.clone().addScaledVector(HAFT,0.06), HEAD_C.clone().addScaledVector(HAFT,-0.06), 0.032, 0.040, 6, P.hafte);
    tube(HEAD_C.clone().addScaledVector(HAFT,-0.06), HEAD_C.clone().addScaledVector(HAFT,0.02), 0.044, 0.058, 6, P.steelDk); // steel throat/socket drum

    /* DOUBLE-BIT AXE HEAD — two mirrored crescent blades off the socket, perpendicular to the haft,
       each a fan of quads (both faces) from the socket out to a curved cutting edge. */
    const up=V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, HAFT).normalize();   // blade-spread axis
    const w = new THREE.Vector3().crossVectors(HAFT, u).normalize();    // face-normal axis
    for(const s of [-1, 1]){                                            // two bits, mirrored across the haft
      const root = HEAD_C.clone().addScaledVector(u, s*0.045);
      const bandN = 7, innerPts=[], outerPts=[];
      for(let k=0;k<=bandN;k++){
        const t=k/bandN;
        const along = -0.15 + t*0.30;                                   // sweep along the haft (tighter)
        const reach = 0.08 + Math.sin(t*Math.PI)*0.30;                  // crescent depth (trimmed so it doesn't sweep to the knees)
        innerPts.push(root.clone().addScaledVector(HAFT, along*0.32).addScaledVector(u, s*reach*0.15));
        outerPts.push(root.clone().addScaledVector(HAFT, along).addScaledVector(u, s*reach));
      }
      for(let k=0;k<bandN;k++){
        const a=innerPts[k], b=innerPts[k+1], c=outerPts[k+1], d=outerPts[k];
        const off=w.clone().multiplyScalar(0.013);
        quad(a.clone().add(off), b.clone().add(off), c.clone().add(off), d.clone().add(off), P.steel, 0.05);
        quad(d.clone().sub(off), c.clone().sub(off), b.clone().sub(off), a.clone().sub(off), P.steel, 0.05);
        quad(d.clone().add(off), c.clone().add(off), c.clone().sub(off), d.clone().sub(off), P.steelLt, 0.03); // bright edge rim
      }
    }
  }

  /* ---------- TORSO — massive humanoid: bare barrel chest, huge shoulders, thick neck. Braced. --- */
  stack([
    {y:L.hipY,   rx:0.280, rz:0.220, hex:P.hideDk},
    {y:L.waistY, rx:0.260, rz:0.200, hex:P.hide},
    {y:L.ribY,   rx:0.310, rz:0.235, hex:P.hide},
    {y:L.chestY, rx:0.360, rz:0.255, hex:P.hideLt},           // barrel chest (pecs)
    {y:L.shldY,  rx:0.400, rz:0.250, hex:P.hide},             // huge squared shoulders
    {y:L.neckY,  rx:0.185, rz:0.180, hex:P.hideDk},           // thick bull neck
  ], 8, {xform:brace, capTop:{hex:P.hideDk, lift:0.006}});

  /* a hint of pectoral/ab separation — a couple of darker accent bands on the front of the chest */
  {
    const bands=[{y:L.chestY-0.02, rx:0.360, rz:0.256},{y:L.ribY+0.02, rx:0.312, rz:0.238}];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, 8, Math.PI/8)).map(r=>r.map(brace));
    for(let b=0;b<rings.length-1;b++) for(const i of [1,2]){
      const i2=(i+1)%8, o=V(0,0,0.006);
      quad(rings[b][i].clone().add(o), rings[b][i2].clone().add(o), rings[b+1][i2].clone().add(o), rings[b+1][i].clone().add(o), P.hideDk, 0.05);
    }
  }

  /* ---------- LEATHER HARNESS STRAPS — two crossing straps over the bare chest (a warrior's rig),
     with a small buckle where they cross. ---------- */
  for(const s of [-1,1]){
    const a=brace(V(s*0.24, L.shldY-0.02, 0.20)), b=brace(V(-s*0.12, L.waistY+0.02, 0.24));
    tube(a, b, 0.030, 0.026, 4, P.harness);
  }
  {
    const c=brace(V(0.02, L.ribY, 0.255));
    quad(c.clone().add(V(-0.035,-0.035,0)), c.clone().add(V(0.035,-0.035,0)),
         c.clone().add(V(0.035,0.035,0.005)), c.clone().add(V(-0.035,0.035,0.005)), P.buckle, 0.02);
  }
  /* a plain hide loin-wrap low on the hips */
  stack([
    {y:0.70, rx:0.300, rz:0.240, hex:P.harnessDk},
    {y:0.84, rx:0.285, rz:0.225, hex:P.harness},
    {y:L.hipY-0.02, rx:0.270, rz:0.210, hex:P.harnessDk},
  ], 8, {xform:brace});

  /* ---------- BULL HEAD — a broad muzzle projecting forward (rz>rx), flared-nostril hints, two
     sweeping horns, a short mane ridge. Deep-hide skull, PALER muzzle. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.130, rz:0.150, hex:P.muzzle},         // broad muzzle base
      {y:L.cheekY, rx:0.165, rz:0.155, hex:P.hideLt},         // cheek/face — hide takes over above the muzzle
      {y:L.browY,  rx:0.170, rz:0.145, hex:P.hide},           // wide bull brow
      {y:L.crownY, rx:0.130, rz:0.112, hex:P.hideDk},         // between-the-horns crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.012), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(brace));
    /* heavy bull brow — modest forward push on the brow front verts */
    for(const i of [1,2]){ rings[2][i].z += 0.026; rings[2][i].y -= 0.010; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], brace(V(0, L.headTopY, 0.004)), P.hideDk);

    /* BROAD MUZZLE — a forward-projecting wedge off the face via chained tubes (dragonborn muzzle
       technique), wide + blunt, paler hide, angled slightly down. */
    const muzBase = brace(V(0, L.muzzleY-0.01, 0.130));
    const muzMid  = brace(V(0, L.muzzleY-0.030, 0.245));
    const muzTip  = brace(V(0, L.muzzleY-0.052, 0.330));
    tube(muzBase, muzMid, 0.128, 0.112, n, P.muzzle,   {raz:0.108, rbz:0.098, phase:ph});
    tube(muzMid, muzTip, 0.112, 0.086, n, P.muzzleLt, {raz:0.098, rbz:0.072, phase:ph, capB:{hex:P.muzzleDk, lift:0.010}});

    /* FLARED NOSTRIL HINTS — two dark quads on the muzzle front, angled outward (flared) */
    for(const s of [-1,1]){
      const c = brace(V(s*0.048, L.muzzleY-0.052, 0.322));
      quad(c.clone().add(V(-s*0.006,-0.018,0)), c.clone().add(V(s*0.026,-0.014,-0.004)),
           c.clone().add(V(s*0.024,0.016,-0.008)), c.clone().add(V(-s*0.008,0.018,-0.004)), P.nostril, 0.03);
    }
    /* pale jaw/chin strip under the muzzle */
    quad(brace(V(-0.055,L.muzzleY-0.078,0.150)), brace(V(0.055,L.muzzleY-0.078,0.150)),
         brace(V(0.032,L.muzzleY-0.090,0.305)), brace(V(-0.032,L.muzzleY-0.090,0.305)), P.muzzleDk, 0.05);

    /* TWO SWEEPING HORNS — thick at the base, curving up-and-OUT to sharp tips. Three chained tube
       segments each so the curve reads. Root from the sides of the crown, above the brow. */
    for(const s of [-1,1]){
      const hb  = brace(V(s*0.140, L.browY+0.02, 0.02));      // thick base on the side of the skull
      const hm1 = brace(V(s*0.235, L.crownY+0.04, -0.02));    // sweeps out + up
      const hm2 = brace(V(s*0.295, L.headTopY+0.10, -0.06));  // curves further up-and-out
      const ht  = brace(V(s*0.300, L.headTopY+0.22, 0.02));   // sharp tip curls up + slightly fwd
      tube(hb,  hm1, 0.052, 0.038, 6, P.horn,   {capA:{hex:P.hornDk}});
      tube(hm1, hm2, 0.038, 0.024, 6, P.horn);
      tube(hm2, ht,  0.024, 0.006, 6, P.hornDk, {capB:{hex:P.hornTip, lift:0.008}});
    }

    /* BULL EYES — blood-red pips set wide on the sides of the brow (prey-animal placement), deep in
       dark sockets, proud of the face plane (house eye standard: small + deliberate). */
    for(const s of [-1,1]){
      const ex=s*0.130, ey=L.browY-0.010, ez=0.088;
      const e=(x,y,z)=>brace(V(x,y,z));
      quad(e(ex-0.022,ey-0.014,ez-0.006), e(ex+0.022,ey-0.014,ez-0.006),
           e(ex+0.022,ey+0.016,ez-0.012), e(ex-0.022,ey+0.016,ez-0.012), P.eyeDk, 0.0);
      quad(e(ex-0.011,ey-0.005,ez), e(ex+0.011,ey-0.005,ez),
           e(ex+0.011,ey+0.009,ez-0.005), e(ex-0.011,ey+0.009,ez-0.005), P.eye, 0.0);
    }

    /* BULL EARS — flat leaf-shaped ears sticking out sideways below the horns */
    for(const s of [-1,1]){
      const eb = brace(V(s*0.150, L.cheekY+0.02, -0.02));
      const et = brace(V(s*0.260, L.cheekY+0.03, -0.09));     // splay out + slightly back, near-horizontal
      tube(eb, et, 0.050, 0.010, 5, P.hideLt, {raz:0.034, rbz:0.006, capA:{hex:P.hideDk}, capB:{hex:P.hideDk, lift:0.005}});
    }
  }

  /* ---------- SHORT MANE RIDGE — coarse black tuft quads running down the back of the neck from the
     crown to the shoulders (the bull's mane). ---------- */
  for(const [y,len,zk] of [[L.crownY-0.02,0.10,-0.02],[L.neckY+0.06,0.11,-0.04],[L.neckY-0.04,0.12,-0.03],[L.shldY+0.02,0.10,-0.02]]){
    const base = brace(V(0, y, -0.14+zk));
    quad(base.clone().add(V(-0.045,0,0)), base.clone().add(V(-0.02,len,-0.05)),
         base.clone().add(V(0.02,len,-0.05)), base.clone().add(V(0.045,0,0)), P.mane, 0.08);
  }

  /* ---------- ARMS — massive, both fists DERIVED from the greataxe haft (two-handed hold). --- */
  {
    /* right arm -> lower fist (GRIP_R) */
    const S=brace(V(L.shoulderX, L.shldY-0.02, 0.03));
    const E=V(0.400, 1.22, 0.24);                             // elbow out + forward
    tube(S,E,0.135,0.108,6,P.hide);
    tube(E, GRIP_R.clone().addScaledVector(HAFT,-0.05), 0.100,0.082,6,P.hideLt);
    tube(GRIP_R.clone().addScaledVector(HAFT,-0.08), GRIP_R.clone().addScaledVector(HAFT,0.08), 0.086,0.078,6,P.hideLt,
         {capA:{hex:P.hideLt}, capB:{hex:P.hideLt}});

    /* left arm -> upper fist (GRIP_L), crosses higher over the chest */
    const S2=brace(V(-L.shoulderX, L.shldY-0.02, 0.03));
    const E2=V(-0.300, 1.30, 0.20);
    tube(S2,E2,0.135,0.108,6,P.hide);
    tube(E2, GRIP_L.clone().addScaledVector(HAFT,0.05), 0.100,0.082,6,P.hideLt);
    tube(GRIP_L.clone().addScaledVector(HAFT,-0.08), GRIP_L.clone().addScaledVector(HAFT,0.08), 0.086,0.078,6,P.hideLt,
         {capA:{hex:P.hideLt}, capB:{hex:P.hideLt}});
  }

  /* ---------- LEGS — DIGITIGRADE (reversed knee): hip -> forward knee -> back-angled hock ->
     forward pastern -> solid WEDGE HOOF at the ground. Thick, braced wide. ---------- */
  {
    for(const [s, spread] of [[-1, -0.30], [1, 0.30]]){
      const hip   = brace(V(s*L.hipHalf, L.hipY-0.03, 0.02));
      const knee  = V(spread*1.05, 0.62, 0.20);               // knee juts FORWARD (digitigrade)
      const hock  = V(spread*1.10, 0.34, -0.02);              // hock kicks BACK
      const past  = V(spread*1.02, 0.14, 0.06);               // pastern forward again to the hoof
      tube(hip,  knee, 0.155, 0.110, 6, P.hide);              // thigh
      tube(knee, hock, 0.100, 0.078, 6, P.hideDk);            // shin (angled back)
      tube(hock, past, 0.076, 0.056, 6, P.hideDk);            // pastern (angled forward)
      /* SOLID WEDGE HOOF — a short forward-splayed hoof block, no toes, near-black */
      const hoofC = V(spread*1.02, 0.02, 0.10);
      const fwd = V(0,0,1);
      tube(hoofC.clone().addScaledVector(fwd,-0.05), hoofC.clone().addScaledVector(fwd,0.11), 0.072, 0.060, 6, P.hoof,
           {raz:0.062, rbz:0.050, capA:{hex:P.hoofLt}, capB:{hex:P.hoof, lift:0.010}});
      /* a pale split hint down the front of the hoof (cloven) */
      quad(V(spread*1.02-0.004,0.02,0.19), V(spread*1.02+0.004,0.02,0.19),
           V(spread*1.02+0.004,0.10,0.16), V(spread*1.02-0.004,0.10,0.16), P.hoofLt, 0.05);
    }
  }

  /* ---------- SHORT TUFTED TAIL — a thin tail dropping from the lower spine/hip behind the body,
     ending in a dark tuft (chained tubes, house convention: root well behind at -z). ---------- */
  {
    const root = brace(V(0.05, L.hipY-0.10, -0.230));
    const t1   = V(0.140, 0.72, -0.320);
    const t2   = V(0.185, 0.48, -0.340);
    const tip  = V(0.200, 0.32, -0.320);
    tube(root, t1, 0.040, 0.030, 6, P.hide,   {phase:Math.PI/6});
    tube(t1,   t2, 0.030, 0.020, 6, P.hideDk, {phase:Math.PI/6});
    tube(t2,   tip,0.020, 0.012, 6, P.hideDk, {phase:Math.PI/6});
    /* tail tuft — a small cluster of dark tuft quads at the tip */
    for(const a of [0, 2.1, 4.2]){
      const base=tip.clone();
      const d=V(Math.cos(a),-0.6,Math.sin(a)).normalize();
      quad(base, base.clone().addScaledVector(d,0.09).add(V(0,-0.02,0)),
           base.clone().addScaledVector(d,0.06).add(V(0.02,-0.05,0)), base, P.tuft, 0.08);
    }
  }

  /* ---------- base disc (BIG Medium: r=0.48 — bigger than the r=0.42 Medium brutes, shy of the
     LARGE ogre's r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.48, 0.48, 16);
    const r2=ring(V(0,0.056,0), V(0,1,0), 0.46, 0.46, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.059,0), P.discTop);
  }
}
