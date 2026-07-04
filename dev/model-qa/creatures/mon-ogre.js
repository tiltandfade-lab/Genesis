/* dev/model-qa/creatures/mon-ogre.js — the LARGE-size DEBUT: a mountain of dumb muscle
   (whole-object grammar). Same one-function / one-geometry-frame / no-anchors law as humanoid.js,
   but SCALED UP HARD so the piece visibly owns a bigger board footprint than any brute before it
   (base disc r=0.55, ~2.1u tall — it dwarfs the orc's 1.55u / r=0.42). The read: dumb, huge,
   hungry. An enormous pot belly (the widest band of the whole figure), a sloped tiny-skulled head
   sitting nearly neckless down in the shoulders with a heavy underbit jaw and a snaggle tooth or
   two, log-sized arms, a ragged hide skirt, bare splayed feet — and a whole TREE-TRUNK CLUB
   (authored FIRST: thick, bark-banded, crude) dragged/rested over one shoulder. Mottled ochre-tan
   hide. Imported by mon-ogre-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildOgre(){
  /* ---------- PALETTE (VS desaturated; mottled ochre-tan hide) ---------- */
  const P = {
    hide:0xa08850, hideDk:0x6e5c34, hideLt:0xb89e64, hideMot:0x877044,   // ochre-tan hide, wide value spread + a mottle tone
    belly:0xb8a06a, bellyDk:0x8a744a,                                     // paler over-stretched belly
    tusk:0xd8cca4, tuskDk:0xb0a37c,                                       // pale snaggle teeth
    skirt:0x5c4a30, skirtDk:0x3e3120, skirtLt:0x6e5a3c, strap:0x463522,   // ragged hide skirt
    bark:0x5a4a30, barkDk:0x3c3020, barkLt:0x6e5c3c, wood:0x8a744c,       // tree-trunk club: bark + raw split-wood butt
    nail:0x2b2620, eye:0x9a8a3a, eyeDk:0x141009,                          // dull yellow pig-eye deep in the socket
    hair:0x2e2a1f, hairDk:0x201d16,                                       // greasy dark scalp scrag
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — LARGE. Everything scaled well past the orc: shoulderX 0.46 (orc 0.33),
     belly the widest band anywhere (rx 0.42). Head sits LOW and small, sunk between hulking
     shoulders (nearly neckless). A slight forward slump — dumb, heavy, gut-led. ~2.1u head-top. --- */
  const L = {
    hipY:0.90, gutY:1.02, waistY:1.10, ribY:1.28, chestY:1.44, shldY:1.56, neckY:1.62,
    hipHalf:0.205, shoulderX:0.460,
    jawY:1.68, cheekY:1.78, browY:1.88, crownY:1.98, headTopY:2.05,
  };

  /* dumb gut-led slump — a gentle forward tip of the upper body about the hips (less than the
     orc's aggressive lean; this is heavy and slack, not coiled) */
  const slump = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.10);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TREE-TRUNK CLUB FIRST — a whole crude log rested over the RIGHT shoulder, the fist
     wrapped low on the trunk near its split-wood butt. Grip is ground truth. The trunk rises up +
     back over the shoulder; a couple of stub knots and bark bands sell it as a torn-up tree, not a
     shaped haft. ---------- */
  const GRIP = V(0.545, 1.30, 0.30);                          // fist low, out to the right + forward
  const CTOP = V(0.150, 2.30, -0.55);                         // trunk head slung up + back over the shoulder
  const HAFT = new THREE.Vector3().subVectors(CTOP, GRIP).normalize();
  const BUTT = GRIP.clone().addScaledVector(HAFT, -0.42);     // raw split butt hangs below the fist
  {
    /* raw split-wood butt (paler heartwood), then a long bark-banded trunk swelling toward the head */
    tube(BUTT, GRIP.clone().addScaledVector(HAFT,-0.10), 0.072, 0.086, 8, P.wood, {capA:{hex:P.woodDk??P.wood, lift:0.02}});
    tube(GRIP.clone().addScaledVector(HAFT,-0.10), GRIP.clone().addScaledVector(HAFT,0.12), 0.092, 0.098, 8, P.barkDk); // gripped stretch (fist wraps here)
    tube(GRIP.clone().addScaledVector(HAFT,0.12), CTOP.clone().addScaledVector(HAFT,-0.55), 0.100, 0.150, 8, P.bark);   // trunk swells
    tube(CTOP.clone().addScaledVector(HAFT,-0.55), CTOP, 0.150, 0.168, 8, P.barkLt, {capB:{hex:P.barkDk, lift:0.03}});  // heavy blunt head
    /* bark bands — a few darker rings girdling the trunk (the crude woody read) */
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

  /* ---------- TORSO — the ENORMOUS POT BELLY is the widest band of the whole figure (rx 0.42),
     bulging forward (rz swells too). Chest broad, shoulders hulking; neck almost nonexistent so the
     small head sits sunk down between the shoulders. ---------- */
  stack([
    {y:L.hipY,   rx:0.330, rz:0.300, hex:P.hideDk},           // heavy low gut root
    {y:L.gutY,   rx:0.430, rz:0.430, hex:P.belly},            // gut balloons out AND forward
    {y:L.waistY, rx:0.455, rz:0.455, hex:P.belly},            // WIDEST BAND ANYWHERE — the pot belly, near-round
    {y:L.ribY,   rx:0.360, rz:0.300, hex:P.bellyDk},          // pulls back in HARD above the gut (waist tuck)
    {y:L.chestY, rx:0.350, rz:0.265, hex:P.hide},             // chest NARROWER than the belly (slab, not barrel)
    {y:L.shldY,  rx:0.430, rz:0.290, hex:P.hideLt},           // hulking shoulders flare back out
    {y:L.neckY,  rx:0.200, rz:0.190, hex:P.hideDk},           // stump neck, barely there
  ], 8, {xform:slump, capTop:{hex:P.hideDk, lift:0.008}});

  /* a couple of mottle patches on the belly/flank (uneven hide, over-stretched skin) */
  for(const [y,rx,rz,cx,hex] of [
    [L.gutY+0.02, 0.180, 0.150, -0.18, P.hideMot],
    [L.waistY-0.02, 0.170, 0.150,  0.20, P.bellyDk],
    [L.ribY+0.02, 0.150, 0.130,  0.16, P.hideMot],
  ]){
    const rings=[
      ring(V(cx,y-0.06,0.05), V(0,1,0), rx*0.85, rz*0.85, 7, Math.PI/7).map(slump),
      ring(V(cx,y+0.06,0.05), V(0,1,0), rx, rz, 7, Math.PI/7).map(slump),
    ];
    stitch(rings, ()=>hex);
    capFan(rings[1], slump(V(cx,y+0.13,0.05)), hex);
  }

  /* ---------- RAGGED HIDE SKIRT — a torn wrap slung low on the hips (below the gut), uneven hem. --- */
  stack([
    {y:0.58, rx:0.360, rz:0.300, hex:P.skirtDk},
    {y:0.74, rx:0.345, rz:0.285, hex:P.skirt},
    {y:L.hipY-0.02, rx:0.330, rz:0.275, hex:P.skirtLt},
  ], 8, {xform:slump});
  /* a wide rope/hide strap over one shoulder holding the skirt (crude) */
  {
    const a=slump(V(-0.10, L.chestY+0.06, 0.28)), b=slump(V(0.14, L.hipY+0.02, 0.30));
    tube(a, b, 0.038, 0.032, 5, P.strap);
  }
  /* a few torn skirt flaps at the hem (ragged read) */
  for(const [sx,sz,w] of [[-0.24,0.24,0.10],[0.06,0.30,0.12],[0.28,0.20,0.09]]){
    const top=slump(V(sx,0.62,sz)), botL=slump(V(sx-w*0.4,0.46,sz)), botR=slump(V(sx+w*0.4,0.44,sz));
    quad(top, botL, botR, top, P.skirtDk, 0.06);
  }

  /* ---------- HEAD — SLOPED and TINY-SKULLED (crown pulls in hard so the head tapers to almost
     nothing above the brow), sunk nearly neckless between the shoulders. Heavy underbit jaw juts
     forward with a snaggle tooth or two. Sloped low brow. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.190, rz:0.185, hex:P.hideLt},         // heavy wide jaw
      {y:L.cheekY, rx:0.175, rz:0.165, hex:P.hide},
      {y:L.browY,  rx:0.150, rz:0.130, hex:P.hide},           // brow narrower than jaw → shelf
      {y:L.crownY, rx:0.090, rz:0.080, hex:P.hideDk},         // tiny sloped skull, pulled in HARD
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(slump));
    /* broad flat brute nose: modest forward push on the cheek front verts */
    for(const i of [1,2]) rings[1][i].z += 0.024;
    /* SLOPED LOW BROW — push the brow front verts forward + DOWN so the forehead slopes back to the
       tiny skull, casting a dumb heavy shadow over the pig-eyes */
    for(const i of [1,2]){ rings[2][i].z += 0.058; rings[2][i].y -= 0.028; }
    for(const i of [0,3]){ rings[2][i].z += 0.028; }
    /* slope the crown BACK (the tiny skull recedes) — pull all crown verts back in -z */
    rings[3].forEach(p=>{ p.z -= 0.045; p.y -= 0.010; });
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], slump(V(0, L.headTopY, -0.06)), P.hideDk);

    /* HEAVY UNDERBIT JAW — a big forward-jutting lower-jaw wedge below the jaw band, wide + blunt.
       The dumb-brute underbite. */
    const jawFrontBot = slump(V(0, L.jawY-0.130, 0.220));
    tube(slump(V(0,L.jawY+0.02,0.03)), jawFrontBot, 0.185, 0.115, 6, P.hideLt, {raz:0.150, rbz:0.090, capB:{hex:P.hideDk}});

    /* SNAGGLE TEETH — one big up-jutting tusk on one side, a smaller nub on the other (asymmetry =
       dumb, broken read). From the underbite lip. */
    {
      const base = slump(V(-0.075, L.jawY-0.070, 0.230));
      const tip  = slump(V(-0.082, L.jawY+0.070, 0.215));     // big one curls up
      tube(base, tip, 0.036, 0.010, 5, P.tusk, {capA:{hex:P.tuskDk}, capB:{hex:P.tuskDk, lift:0.006}});
    }
    {
      const base = slump(V(0.070, L.jawY-0.055, 0.228));
      const tip  = slump(V(0.074, L.jawY+0.028, 0.220));      // small nub
      tube(base, tip, 0.024, 0.008, 4, P.tusk, {capA:{hex:P.tuskDk}, capB:{hex:P.tuskDk, lift:0.004}});
    }
    /* a couple of dumb lower teeth between the tusks */
    for(const tx of [-0.028, 0.024]){
      const b=slump(V(tx, L.jawY-0.030, 0.238)), t=slump(V(tx, L.jawY+0.024, 0.230));
      tube(b, t, 0.016, 0.007, 4, P.tuskDk, {capB:{hex:P.tusk, lift:0.003}});
    }
    /* small dumb ears — round nubs low on the sides */
    for(const s of [-1,1]){
      const eb = slump(V(s*0.170, L.cheekY, 0.00));
      const et = slump(V(s*0.205, L.cheekY+0.055, -0.06));
      tube(eb, et, 0.050, 0.030, 5, P.hide, {raz:0.036, rbz:0.020, capA:{hex:P.hideDk}, capB:{hex:P.hideDk, lift:0.004}});
    }

    /* greasy dark scalp scrag — a low sparse hair cap slicked back on the tiny skull (not full hair) */
    {
      const c = slump(V(0, L.crownY+0.01, -0.09));
      for(const [dx,dz,len] of [[-0.05,0.02,0.10],[0.04,0.00,0.11],[0.0,-0.03,0.09]]){
        const base=slump(V(dx, L.crownY+0.02, dz-0.05)), tip=base.clone().add(V(dx*0.3,-0.02,-len));
        tube(base, tip, 0.024, 0.006, 4, P.hair, {capA:{hex:P.hairDk}, capB:{hex:P.hairDk, lift:0.004}});
      }
    }
  }

  /* ---------- ARMS — LOG-SIZED. Right derives to the club grip (raised to shoulder the trunk);
     left hangs enormous and heavy with a great splayed hand. ---------- */
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
    /* right arm -> club fist (raised, shouldering the trunk) */
    const S=slump(V(L.shoulderX, L.shldY-0.02, 0.03));
    const FIST=GRIP.clone();
    const E=V(0.600, 1.42, 0.18);                             // elbow out + forward, arm bent up
    tube(S,E,0.160,0.128,6,P.hide);
    tube(E, FIST.clone().addScaledVector(HAFT,-0.05), 0.122,0.100,6,P.hide);
    tube(FIST.clone().addScaledVector(HAFT,-0.10), FIST.clone().addScaledVector(HAFT,0.10), 0.108,0.100,6,P.hideLt,
         {capA:{hex:P.hideLt}, capB:{hex:P.hideLt}});

    /* left arm -> hangs enormous + low, big splayed mitt forward (dumb dangling menace) */
    const S2=slump(V(-L.shoulderX, L.shldY-0.02, 0.03));
    const E2=V(-0.560, 1.16, 0.14);
    const W2=V(-0.520, 0.78, 0.24);
    tube(S2,E2,0.160,0.128,6,P.hide);
    tube(E2,W2,0.122,0.098,6,P.hideDk);
    bigMitt(W2, V(-0.08,-0.50,1), P.hideLt);
  }

  /* ---------- LEGS — thick tree-trunk legs, planted wide (heavy stance). BARE SPLAYED FEET. --- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.03, 0.02), kneeL=V(-0.340,0.50,0.12), ankL=V(-0.360,0.10,0.07);
    const hipR=V( L.hipHalf, L.hipY-0.03, 0.00), kneeR=V( 0.360,0.50,-0.05), ankR=V( 0.380,0.10,-0.10);
    tube(hipL,kneeL,0.190,0.140,6,P.hide);
    tube(kneeL,ankL,0.130,0.095,6,P.hideDk);
    tube(hipR,kneeR,0.190,0.140,6,P.hide);
    tube(kneeR,ankR,0.130,0.095,6,P.hideDk);
    /* BARE SPLAYED FEET — broad low foot slabs, no wraps, thick toes with dark nails */
    for(const [ank,toeDir] of [[ankL,V(-0.08,0,1)], [ankR,V(0.10,0,1)]]){
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
