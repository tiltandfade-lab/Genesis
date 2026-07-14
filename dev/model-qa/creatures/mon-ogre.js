/* dev/model-qa/creatures/mon-ogre.js — the LARGE-size ogre (whole-object grammar). MODEL-FOUNDRY
   REBUILD pass-1 (2026-07-08 foundry pilot, set rebuild-w1 cell 7). REALM: core, 32 live
   instances. TRIAGE verdict on the old ogre: the club signature reads, keep it — but the old pose
   was a passive shoulder-carry (T-stance-adjacent) and the mass/anatomy needed an upgrade to match
   ANATOMY-CANON's HUMANOID-giant read (small head sunk on huge shoulders, gut, knuckle-heavy arms).
   This pass keeps the palette intent + the tree-trunk-club signature, replaces the geometry: the
   torso is torqued into a mid-swing, the club is raised into an overhead smash arc, and the stance
   is a bracing lunge instead of a flat plant.

   FEATURE CHECKLIST (the tri budget buys these):
     1. ANATOMY (chief criterion, HUMANOID-giant): tiny sloped skull sunk nearly neckless between
        hulking shoulders, a heavy underbit jaw, an enormous pot-belly (the widest band on the whole
        figure) over a narrower chest slab — dumb, heavy, gut-led mass.
     2. SIGNATURE — the tree-trunk club (authored FIRST, grip = ground truth): a whole crude bark-
        banded log with broken branch stubs and a raw split-wood butt, now swept up-and-back over
        the shoulder into an OVERHEAD WINDUP — the top of a smash arc, not a resting carry.
     3. Knuckle-heavy log arms: oversized fists with individual knuckle-nub tris (the "knuckle-
        heavy" flavor note), one gripping the club overhead, the off-arm thrown back-and-wide for
        counterbalance.
     4. Underbite tusks — one big up-curling snaggle tusk + a small nub, asymmetric (the dumb/broken
        read), pale against the dark hide (value contrast law 3).
     5. Bracing lunge stance: torso twisted + leaned into the swing about the hip pivot, front leg
        planted forward, back leg trailing/braced — the high-expression "about to connect" instant.

   POSE SENTENCE: an ogre torqued mid-windup, front leg planted and driving forward while the trailing
   leg braces behind it, torso twisted and leaning into the swing as the tree-trunk club sweeps up and
   back over its shoulder at the top of an overhead smash, the off-hand thrown wide behind it for
   counterbalance — the instant before the club comes crashing down, never a static carry.

   Whole-object grammar: one function, one geometry frame, no anchors, held item authored first.
   Spine +z (front), up +y, ground y=0. Imported by ps1-sheet.html SETS['rebuild-w1'] cell 7. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildOgre(){
  /* ---------- PALETTE (VS desaturated; mottled ochre-tan hide) — kept from the pass-1 file ------- */
  const P = {
    hide:0xa08850, hideDk:0x6e5c34, hideLt:0xb89e64, hideMot:0x877044,   // ochre-tan hide, wide value spread + a mottle tone
    belly:0xb8a06a, bellyDk:0x8a744a,                                     // paler over-stretched belly
    tusk:0xd8cca4, tuskDk:0xb0a37c,                                       // pale snaggle teeth
    skirt:0x5c4a30, skirtDk:0x3e3120, skirtLt:0x6e5a3c, strap:0x463522,   // ragged hide skirt
    bark:0x5a4a30, barkDk:0x3c3020, barkLt:0x6e5c3c, wood:0x8a744c, woodDk:0x6a5638, // tree-trunk club
    nail:0x2b2620, eye:0x9a8a3a, eyeDk:0x141009,                          // dull yellow pig-eye deep in the socket
    hair:0x2e2a1f, hairDk:0x201d16,                                       // greasy dark scalp scrag
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — LARGE, unchanged from the pass-1 anatomy (already reads giant-humanoid
     correctly: shoulderX 0.46, belly the widest band anywhere). Head sits LOW and small, sunk
     between hulking shoulders (nearly neckless). ---------- */
  const L = {
    hipY:0.90, gutY:1.02, waistY:1.10, ribY:1.28, chestY:1.44, shldY:1.56, neckY:1.62,
    hipHalf:0.205, shoulderX:0.460,
    jawY:1.68, cheekY:1.78, browY:1.88, crownY:1.98, headTopY:2.05,
  };

  /* torso TORQUE about the hip pivot — twist (winding the swing through the spine) + forward lean
     (driving weight into the strike). Replaces the old passive "slump" — this is the pose-law fix:
     an ogre mid-overhead-smash carries its whole upper body into the arc, not a neutral gut-slack
     lean. Applied to torso/skirt/head so the whole upper mass reads as ONE torqued unit. */
  const torque = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(0,1,0), -0.24);   // twist: right shoulder winds back, left comes forward
    q.applyAxisAngle(V(1,0,0), 0.17);    // lean forward into the strike
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TREE-TRUNK CLUB FIRST, ground truth for the arm rig — now an OVERHEAD WINDUP: the
     fist is raised above the head, the trunk sweeps up-and-back over the right shoulder at the top
     of a smash arc (not resting flat along the shoulder). Same bark-banded / branch-stub / split-
     butt construction as pass-1, repositioned. ---------- */
  const GRIP = V(0.640, 2.24, -0.02);                          // fist raised high, swept WELL out to the side (clears the face)
  const CTOP = V(1.120, 2.62, -0.62);                          // trunk head swept up + back — top of the arc
  const HAFT = new THREE.Vector3().subVectors(CTOP, GRIP).normalize();
  const BUTT = GRIP.clone().addScaledVector(HAFT, -0.40);      // raw split butt trails below/behind the fist
  {
    tube(BUTT, GRIP.clone().addScaledVector(HAFT,-0.10), 0.072, 0.086, 8, P.wood, {capA:{hex:P.woodDk, lift:0.02}});
    tube(GRIP.clone().addScaledVector(HAFT,-0.10), GRIP.clone().addScaledVector(HAFT,0.12), 0.092, 0.098, 8, P.barkDk); // gripped stretch (fist wraps here)
    tube(GRIP.clone().addScaledVector(HAFT,0.12), CTOP.clone().addScaledVector(HAFT,-0.55), 0.100, 0.150, 8, P.bark);   // trunk swells
    tube(CTOP.clone().addScaledVector(HAFT,-0.55), CTOP, 0.150, 0.168, 8, P.barkLt, {capB:{hex:P.barkDk, lift:0.03}});  // heavy blunt head (high-value zone)
    /* bark bands — darker rings girdling the trunk (the crude woody read) */
    for(const along of [0.35, 0.62, 0.85]){
      const c = CTOP.clone().addScaledVector(HAFT, -0.90*(1-along) - 0.10);
      const r = 0.100 + along*0.055;
      const r1=ring(c.clone().addScaledVector(HAFT,-0.03), HAFT, r, r, 8);
      const r2=ring(c.clone().addScaledVector(HAFT, 0.03), HAFT, r, r, 8);
      stitch([r1,r2], ()=>P.barkDk);
    }
    /* two broken-off branch stubs jutting from the trunk (torn tree, not a carved club) */
    const up=V(0,1,0), u=new THREE.Vector3().crossVectors(up,HAFT).normalize(), w=new THREE.Vector3().crossVectors(HAFT,u).normalize();
    for(const [along,ang,len] of [[0.50,0.6,0.16],[0.72,3.6,0.13]]){
      const c = CTOP.clone().addScaledVector(HAFT, -0.90*(1-along) - 0.10);
      const dir = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(w, Math.sin(ang)).normalize();
      const base=c.clone().addScaledVector(dir,0.10), tip=c.clone().addScaledVector(dir,0.10+len).addScaledVector(HAFT,0.03);
      tube(base, tip, 0.036, 0.014, 5, P.bark, {capB:{hex:P.wood, lift:0.008}});
    }
  }

  /* ---------- TORSO — ENORMOUS POT BELLY is the widest band of the whole figure (rx 0.42-0.46),
     chest broad but narrower than the belly (slab, not barrel), shoulders hulking, near-nonexistent
     neck so the small head sits sunk between the shoulders. Torqued into the swing. ---------- */
  stack([
    {y:L.hipY,   rx:0.330, rz:0.300, hex:P.hideDk},           // heavy low gut root
    {y:L.gutY,   rx:0.430, rz:0.430, hex:P.belly},            // gut balloons out AND forward
    {y:L.waistY, rx:0.455, rz:0.455, hex:P.belly},            // WIDEST BAND ANYWHERE — the pot belly, near-round
    {y:L.ribY,   rx:0.360, rz:0.300, hex:P.bellyDk},          // pulls back in HARD above the gut (waist tuck)
    {y:L.chestY, rx:0.350, rz:0.265, hex:P.hide},             // chest NARROWER than the belly (slab, not barrel)
    {y:L.shldY,  rx:0.430, rz:0.290, hex:P.hideLt},           // hulking shoulders flare back out
    {y:L.neckY,  rx:0.200, rz:0.190, hex:P.hideDk},           // stump neck, barely there
  ], 8, {xform:torque, capTop:{hex:P.hideDk, lift:0.008}});

  /* a couple of mottle patches on the belly/flank (uneven hide, over-stretched skin) */
  for(const [y,rx,rz,cx,hex] of [
    [L.gutY+0.02, 0.180, 0.150, -0.18, P.hideMot],
    [L.waistY-0.02, 0.170, 0.150,  0.20, P.bellyDk],
    [L.ribY+0.02, 0.150, 0.130,  0.16, P.hideMot],
  ]){
    const rings=[
      ring(V(cx,y-0.06,0.05), V(0,1,0), rx*0.85, rz*0.85, 7, Math.PI/7).map(torque),
      ring(V(cx,y+0.06,0.05), V(0,1,0), rx, rz, 7, Math.PI/7).map(torque),
    ];
    stitch(rings, ()=>hex);
    capFan(rings[1], torque(V(cx,y+0.13,0.05)), hex);
  }

  /* ---------- RAGGED HIDE SKIRT — torn wrap slung low on the hips (below the gut), torqued with
     the torso. ---------- */
  stack([
    {y:0.58, rx:0.360, rz:0.300, hex:P.skirtDk},
    {y:0.74, rx:0.345, rz:0.285, hex:P.skirt},
    {y:L.hipY-0.02, rx:0.330, rz:0.275, hex:P.skirtLt},
  ], 8, {xform:torque});
  /* a wide rope/hide strap over one shoulder holding the skirt (crude) */
  {
    const a=torque(V(-0.10, L.chestY+0.06, 0.28)), b=torque(V(0.14, L.hipY+0.02, 0.30));
    tube(a, b, 0.038, 0.032, 5, P.strap);
  }
  /* a few torn skirt flaps at the hem (ragged read) */
  for(const [sx,sz,w] of [[-0.24,0.24,0.10],[0.06,0.30,0.12],[0.28,0.20,0.09]]){
    const top=torque(V(sx,0.62,sz)), botL=torque(V(sx-w*0.4,0.46,sz)), botR=torque(V(sx+w*0.4,0.44,sz));
    quad(top, botL, botR, top, P.skirtDk, 0.06);
  }

  /* ---------- HEAD — SLOPED and TINY-SKULLED, sunk nearly neckless between the shoulders. Heavy
     underbit jaw juts forward with a snaggle tooth or two. Sloped low brow. Torqued + thrown back
     slightly with the wind-up (chin lifts into the swing). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.190, rz:0.185, hex:P.hideLt},         // heavy wide jaw
      {y:L.cheekY, rx:0.175, rz:0.165, hex:P.hide},
      {y:L.browY,  rx:0.150, rz:0.130, hex:P.hide},           // brow narrower than jaw → shelf
      {y:L.crownY, rx:0.090, rz:0.080, hex:P.hideDk},         // tiny sloped skull, pulled in HARD
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(torque));
    /* broad flat brute nose: modest forward push on the cheek front verts */
    for(const i of [1,2]) rings[1][i].z += 0.024;
    /* SLOPED LOW BROW — push the brow front verts forward + DOWN so the forehead slopes back to the
       tiny skull, casting a dumb heavy shadow over the pig-eyes */
    for(const i of [1,2]){ rings[2][i].z += 0.058; rings[2][i].y -= 0.028; }
    for(const i of [0,3]){ rings[2][i].z += 0.028; }
    /* slope the crown BACK (the tiny skull recedes) — pull all crown verts back */
    rings[3].forEach(p=>{ p.z -= 0.045; p.y -= 0.010; });
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], torque(V(0, L.headTopY, -0.06)), P.hideDk);

    /* HEAVY UNDERBIT JAW — a big forward-jutting lower-jaw wedge, wide + blunt. Dumb-brute underbite. */
    const jawFrontBot = torque(V(0, L.jawY-0.130, 0.220));
    tube(torque(V(0,L.jawY+0.02,0.03)), jawFrontBot, 0.185, 0.115, 6, P.hideLt, {raz:0.150, rbz:0.090, capB:{hex:P.hideDk}});

    /* SNAGGLE TEETH — one big up-jutting tusk (pale, high-value against the dark hide), a smaller
       nub on the other side (asymmetry = dumb, broken read). */
    {
      const base = torque(V(-0.075, L.jawY-0.070, 0.230));
      const tip  = torque(V(-0.082, L.jawY+0.070, 0.215));     // big one curls up
      tube(base, tip, 0.036, 0.010, 5, P.tusk, {capA:{hex:P.tuskDk}, capB:{hex:P.tuskDk, lift:0.006}});
    }
    {
      const base = torque(V(0.070, L.jawY-0.055, 0.228));
      const tip  = torque(V(0.074, L.jawY+0.028, 0.220));      // small nub
      tube(base, tip, 0.024, 0.008, 4, P.tusk, {capA:{hex:P.tuskDk}, capB:{hex:P.tuskDk, lift:0.004}});
    }
    /* a couple of dumb lower teeth between the tusks */
    for(const tx of [-0.028, 0.024]){
      const b=torque(V(tx, L.jawY-0.030, 0.238)), t=torque(V(tx, L.jawY+0.024, 0.230));
      tube(b, t, 0.016, 0.007, 4, P.tuskDk, {capB:{hex:P.tusk, lift:0.003}});
    }
    /* small dumb ears — round nubs low on the sides */
    for(const s of [-1,1]){
      const eb = torque(V(s*0.170, L.cheekY, 0.00));
      const et = torque(V(s*0.205, L.cheekY+0.055, -0.06));
      tube(eb, et, 0.050, 0.030, 5, P.hide, {raz:0.036, rbz:0.020, capA:{hex:P.hideDk}, capB:{hex:P.hideDk, lift:0.004}});
    }

    /* greasy dark scalp scrag — a low sparse hair cap slicked back on the tiny skull */
    {
      for(const [dx,dz,len] of [[-0.05,0.02,0.10],[0.04,0.00,0.11],[0.0,-0.03,0.09]]){
        const base=torque(V(dx, L.crownY+0.02, dz-0.05)), tip=base.clone().add(V(dx*0.3,-0.02,-len));
        tube(base, tip, 0.024, 0.006, 4, P.hair, {capA:{hex:P.hairDk}, capB:{hex:P.hairDk, lift:0.004}});
      }
    }
  }

  /* ---------- ARMS — LOG-SIZED, KNUCKLE-HEAVY. Right derives to the club grip, swept up overhead
     into the windup (elbow cocked back-and-up); left thrown wide-and-back for counterbalance
     against the torque, big splayed knuckle-heavy mitt trailing. ---------- */
  const bigMitt = (ctr, faceDir, hex)=>{
    const d = faceDir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.075), ctr.clone().addScaledVector(d,0.075),
         0.135, 0.118, 6, hex, {raz:0.092, rbz:0.092, capA:{hex}, capB:{hex}});   // bigger knuckle-block
    for(const off of [-1.1,0,1.1]){
      const kb = ctr.clone().addScaledVector(d,0.068).addScaledVector(side, off*0.078);
      const kt = kb.clone().addScaledVector(d,0.100).addScaledVector(side, off*0.020);
      tube(kb, kt, 0.034, 0.012, 4, hex, {capB:{hex:P.nail, lift:0.006}});
    }
  };
  {
    /* right arm -> club fist, swept overhead: shoulder (on the torqued torso surface) -> elbow
       cocked back-and-up -> fist at the raised grip. */
    const S=torque(V(L.shoulderX, L.shldY-0.02, 0.03));
    const E=V(0.820, 1.86, -0.14);                            // elbow driven up + OUT to the side — the windup, clear of the face
    const FIST=GRIP.clone();
    tube(S,E,0.160,0.128,6,P.hide);
    tube(E, FIST.clone().addScaledVector(HAFT,-0.05), 0.128,0.104,6,P.hide);
    tube(FIST.clone().addScaledVector(HAFT,-0.10), FIST.clone().addScaledVector(HAFT,0.10), 0.108,0.100,6,P.hideLt,
         {capA:{hex:P.hideLt}, capB:{hex:P.hideLt}});
    /* knuckle nubs on the club fist — the knuckle-heavy read even mid-grip */
    {
      const side=new THREE.Vector3().crossVectors(V(0,1,0), HAFT).normalize();
      for(const off of [-1,0,1]){
        const kb=FIST.clone().addScaledVector(HAFT,0.03).addScaledVector(side, off*0.070);
        const kt=kb.clone().addScaledVector(HAFT,0.02).add(V(0,0.055,0));
        tube(kb, kt, 0.028, 0.010, 4, P.hideLt, {capB:{hex:P.nail, lift:0.005}});
      }
    }

    /* left arm -> thrown wide-and-back, counterbalancing the swing, big splayed knuckle-heavy mitt */
    const S2=torque(V(-L.shoulderX, L.shldY-0.02, 0.03));
    const E2=V(-0.640, 1.28, -0.32);
    const W2=V(-0.680, 1.00, -0.66);
    tube(S2,E2,0.160,0.128,6,P.hide);
    tube(E2,W2,0.122,0.098,6,P.hideDk);
    bigMitt(W2, V(-0.10,-0.20,-1), P.hideLt);
  }

  /* ---------- LEGS — thick tree-trunk legs in a BRACING LUNGE: front leg (left) planted forward
     and driving weight into the strike, back leg (right) trailing/braced behind. Bare splayed feet. --- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.03, 0.02), kneeL=V(-0.320,0.52,0.34), ankL=V(-0.330,0.09,0.44);
    const hipR=V( L.hipHalf, L.hipY-0.03, 0.00), kneeR=V( 0.400,0.56,-0.30), ankR=V( 0.440,0.10,-0.42);
    tube(hipL,kneeL,0.190,0.140,6,P.hide);
    tube(kneeL,ankL,0.130,0.095,6,P.hideDk);
    tube(hipR,kneeR,0.190,0.140,6,P.hide);
    tube(kneeR,ankR,0.130,0.095,6,P.hideDk);
    /* BARE SPLAYED FEET — broad low foot slabs, no wraps, thick toes with dark nails */
    for(const [ank,toeDir] of [[ankL,V(-0.06,0,1)], [ankR,V(0.12,0,-1)]]){
      const d=toeDir.clone().normalize();
      const heel=V(ank.x,0.060,ank.z);
      tube(heel.clone().addScaledVector(d,-0.03), heel.clone().addScaledVector(d,0.210), 0.110,0.080,6,P.hide,
           {raz:0.098, rbz:0.066, capA:{hex:P.hideDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.195).addScaledVector(side, off*0.068);
        const tt=tb.clone().addScaledVector(d,0.060).addScaledVector(side, off*0.010);
        tube(tb, tt, 0.030,0.012,4,P.hideDk,{capB:{hex:P.nail, lift:0.006}});
      }
    }
  }

  /* ---------- base disc (LARGE: r=0.55 — visibly bigger board footprint than the Medium brutes) --- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 16);
    const r2=ring(V(0,0.058,0), V(0,1,0), 0.53, 0.53, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.061,0), P.discTop);
  }
}
