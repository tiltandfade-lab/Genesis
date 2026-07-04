/* dev/model-qa/creatures/mon-giant.js — the HILL GIANT landmark table: the HUGE size-class DEBUT.
   Whole-object grammar: one function, one geometry frame, no anchors. The biggest humanoid piece on
   any board (disc r=0.68, ~2.7u tall — the disc pattern scaled up from the ogre's r=0.55). A slab of
   crude humanity: a heavy gut but TALLER-PROPORTIONED than the ogre (a giant, not a blob), thick log
   limbs, a bald heavy-browed head with a dull vacant expression, a rough hide poncho-tunic stitched
   from whole animal skins (patch quads), sandal-wrapped feet, sun-browned tan skin. A massive
   uprooted TREE CLUB (authored FIRST — bigger than the ogre's, root ball + branch stubs at the
   business end) held in one fist, its butt resting on the ground beside the giant. The read: the
   biggest humanoid on any board, unhurried, catastrophic. Imported by mon-giant-probe.html + sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildHillGiant(){
  /* ---------- PALETTE (VS desaturated; sun-browned tan skin, wide value spread) ---------- */
  const P = {
    skin:0xb08a5e, skinDk:0x83653f, skinLt:0xc49e6e, skinMot:0x9a7a4e,     // sun-browned tan hide
    belly:0xbb976a, bellyDk:0x8c6f48,                                       // heavy gut
    tunic:0x6e5a3c, tunicDk:0x4c3d28, tunicLt:0x84704c, patch:0x5a4a30,     // stitched-skin poncho tunic
    patch2:0x7a6440, stitch:0x2e2418, fur:0x8a7048,                         // varied skin patches + stitch lines + a fur patch
    bark:0x574727, barkDk:0x392e19, barkLt:0x6c5a34, wood:0x9a7e50,         // tree club: bark + raw split-wood
    root:0x4a3c22, rootLt:0x64502e,                                         // dirt-clotted root ball
    sandal:0x4e3d28, sandalDk:0x362a1b, nail:0x2b2620,                      // sandal wraps
    eye:0x141009, brow:0x6e5638,                                            // dull deep-set eye
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — HUGE. Everything scaled well past the ogre, but TALLER-PROPORTIONED: the
     gut is heavy but the frame is stretched up so it reads as a towering giant, not a squat blob.
     ~2.7u head-top. Standing upright + heavy (a slight settled slump, not a lean). ---------- */
  const L = {
    hipY:1.20, gutY:1.36, waistY:1.50, ribY:1.74, chestY:1.94, shldY:2.10, neckY:2.18,
    hipHalf:0.280, shoulderX:0.580,
    jawY:2.28, cheekY:2.40, browY:2.52, crownY:2.62, headTopY:2.70,
  };

  /* settled heavy slump — a gentle forward tip about the hips (weight forward, unhurried) */
  const slump = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.07);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- MASSIVE TREE CLUB FIRST — a whole uprooted tree gripped in the RIGHT fist, its BUTT
     (the ROOT BALL, dirt-clotted) resting on the GROUND beside the giant; the trunk rises up past the
     shoulder. Bigger than the ogre's. Grip is ground truth. ---------- */
  const GRIP = V(0.740, 1.55, 0.34);                          // fist out to the right + forward
  const ROOT = V(0.980, 0.22, 0.30);                          // root-ball center sits ABOVE the ground (rests ON the tile)
  const CTOP = V(0.560, 2.85, 0.10);                          // trunk head slung up past the shoulder
  const HAFT = new THREE.Vector3().subVectors(CTOP, ROOT).normalize();
  {
    // ROOT BALL resting on the ground (dirt-clotted knot) — a big rounded lumpy blob, its base near y=0
    blob(ROOT.x, ROOT.y, ROOT.z, 0.220, 0.210, 0.215, P.root, 9, 5);
    // extra knots clustered on the root ball (gnarled, not spiked)
    for(const [dx,dy,dz,r] of [[0.14,0.02,0.06,0.090],[-0.10,0.06,-0.08,0.080],[0.04,-0.08,0.12,0.075],[-0.12,-0.04,0.08,0.070]]){
      blob(ROOT.x+dx, ROOT.y+dy, ROOT.z+dz, r, r*0.9, r*0.85, P.rootLt, 6, 4);
    }
    // a few short roots splaying OUTWARD + down onto the tile (clinging, not dangling spikes)
    for(const [ang,len] of [[0.4,0.20],[2.0,0.18],[3.5,0.22],[5.0,0.17]]){
      const dir = V(Math.cos(ang), -0.35, Math.sin(ang)).normalize();
      const base = ROOT.clone().addScaledVector(dir,0.16);
      const tip  = V(ROOT.x+dir.x*(0.16+len), 0.03, ROOT.z+dir.z*(0.16+len));
      tube(base, tip, 0.042, 0.014, 5, P.rootLt, {capB:{hex:P.root, lift:0.006}});
    }
    // the trunk: root ball -> gripped stretch -> long swelling shaft -> heavy head, bark-banded
    tube(ROOT.clone().add(V(0,0.14,0)), GRIP.clone().addScaledVector(HAFT,-0.14), 0.120, 0.140, 8, P.bark);
    tube(GRIP.clone().addScaledVector(HAFT,-0.14), GRIP.clone().addScaledVector(HAFT,0.16), 0.150, 0.156, 8, P.barkDk);  // gripped stretch (fist wraps)
    tube(GRIP.clone().addScaledVector(HAFT,0.16), CTOP.clone().addScaledVector(HAFT,-0.60), 0.156, 0.185, 8, P.bark);    // trunk swells up
    tube(CTOP.clone().addScaledVector(HAFT,-0.60), CTOP, 0.185, 0.205, 8, P.barkLt, {capB:{hex:P.barkDk, lift:0.03}});   // heavy blunt head
    // bark bands girdling the trunk (crude woody read)
    for(const along of [0.30, 0.55, 0.78]){
      const c = ROOT.clone().addScaledVector(HAFT, (CTOP.clone().sub(ROOT).length())*along);
      const r = 0.130 + along*0.060;
      const r1=ring(c.clone().addScaledVector(HAFT,-0.04), HAFT, r, r, 8);
      const r2=ring(c.clone().addScaledVector(HAFT, 0.04), HAFT, r, r, 8);
      stitch([r1,r2], ()=>P.barkDk);
    }
    // broken branch stubs jutting from the club HEAD (the business end — torn tree, not a shaped club)
    const up=V(0,1,0), u=new THREE.Vector3().crossVectors(up,HAFT).normalize(), w=new THREE.Vector3().crossVectors(HAFT,u).normalize();
    for(const [along,ang,len,thick] of [[0.86,0.7,0.24,0.055],[0.92,3.4,0.20,0.048],[0.80,5.2,0.17,0.042]]){
      const c = ROOT.clone().addScaledVector(HAFT, (CTOP.clone().sub(ROOT).length())*along);
      const dir = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(w, Math.sin(ang)).normalize();
      const base=c.clone().addScaledVector(dir,0.14), tip=c.clone().addScaledVector(dir,0.14+len).addScaledVector(HAFT,0.05);
      tube(base, tip, thick, thick*0.35, 5, P.bark, {capB:{hex:P.wood, lift:0.01}});
    }
  }

  /* ---------- TORSO — a heavy gut but TALLER-PROPORTIONED than the ogre (the belly is wide but the
     ribcage rides high above it, so the figure reads as a towering slab, not a barrel). Broad chest,
     massive shoulders. A short thick neck (present, unlike the ogre's stump). ---------- */
  stack([
    {y:L.hipY,   rx:0.430, rz:0.380, hex:P.skinDk},          // heavy hips
    {y:L.gutY,   rx:0.520, rz:0.500, hex:P.belly},           // gut balloons out + forward
    {y:L.waistY, rx:0.510, rz:0.480, hex:P.belly},           // wide heavy gut (but NOT the widest read — the shoulders match)
    {y:L.ribY,   rx:0.470, rz:0.380, hex:P.bellyDk},         // ribcage stays broad (giant, not a tucked waist)
    {y:L.chestY, rx:0.500, rz:0.360, hex:P.skin},            // broad slab chest
    {y:L.shldY,  rx:0.570, rz:0.390, hex:P.skinLt},          // MASSIVE shoulders (match the gut width)
    {y:L.neckY,  rx:0.230, rz:0.220, hex:P.skinDk},          // short thick neck (present)
  ], 8, {xform:slump, capTop:{hex:P.skinDk, lift:0.008}});

  /* ---------- ROUGH HIDE PONCHO-TUNIC — stitched from whole animal skins. A poncho slung over the
     shoulders + chest as VARIED PATCH QUADS (different skin tones), crude stitch lines between them,
     hanging to a ragged hem over the gut/hips. This is the giant's crude clothing. ---------- */
  {
    // poncho body as a stack (a rough sheet draped over the shoulders + torso), skipped at the sides
    const rings = stack([
      {y:L.shldY+0.02, rx:0.560, rz:0.400, hex:P.tunic},
      {y:L.chestY,     rx:0.560, rz:0.420, hex:P.tunicDk},
      {y:L.ribY,       rx:0.560, rz:0.460, hex:P.tunic},
      {y:L.waistY-0.02,rx:0.560, rz:0.470, hex:P.tunicLt},
    ], 8, {xform:slump});
    /* PATCH QUADS — varied skin panels stitched onto the poncho front + back, each a different tone,
       so it reads as many whole hides sewn together (not one cloth). Painted onto the front/back arc. */
    // distinct alternating skin tones so the poncho reads as SEWN HIDES, not horizontal bands
    const patchTones=[P.patch, P.fur, P.patch2, P.tunicLt, P.patch, P.fur];
    let pi=0;
    for(const [y0,y1] of [[L.chestY,L.ribY],[L.ribY,L.waistY]]){
      for(const [x0,x1] of [[-0.42,-0.10],[-0.06,0.20],[0.24,0.46]]){
        const z=0.36 + (y1-y0)*0.1;
        const a=slump(V(x0,y0,z)), b=slump(V(x1,y0,z)), c=slump(V(x1+0.02,y1,z-0.02)), d=slump(V(x0-0.02,y1,z-0.02));
        quad(a,b,c,d, patchTones[pi%patchTones.length], 0.05); pi++;
        // stitch line along the patch top edge (thin dark quad)
        quad(slump(V(x0,y1-0.01,z-0.02)), slump(V(x1,y1-0.01,z-0.02)),
             slump(V(x1,y1+0.005,z-0.025)), slump(V(x0,y1+0.005,z-0.025)), P.stitch, 0.0);
      }
    }
    // ragged poncho hem — a few torn flaps hanging over the gut
    for(const [sx,w] of [[-0.34,0.14],[-0.06,0.16],[0.24,0.13]]){
      const z=0.44;
      const top=slump(V(sx,L.waistY-0.02,z)), botL=slump(V(sx-w*0.4,L.gutY+0.02,z)), botR=slump(V(sx+w*0.4,L.gutY,z));
      quad(top, botL, botR, top, P.tunicDk, 0.06);
    }
  }

  /* ---------- HEAD — a big bald skull with a HEAVY BROW and a DULL vacant expression. Broad flat face,
     small deep-set eyes lost under the brow shelf, a heavy blunt jaw, a wide flat nose. Bald (sun-
     browned pate). Sits on the thick neck. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.260, rz:0.250, hex:P.skinLt},         // heavy blunt jaw
      {y:L.cheekY, rx:0.270, rz:0.255, hex:P.skin},           // broad cheeks
      {y:L.browY,  rx:0.250, rz:0.215, hex:P.skin},           // brow
      {y:L.crownY, rx:0.210, rz:0.195, hex:P.skinDk},         // bald crown (broad, not tapered — dumb dome)
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(slump));
    /* wide flat NOSE — modest forward push on the cheek front verts */
    for(const i of [1,2]) rings[1][i].z += 0.032;
    /* HEAVY BROW SHELF — push brow front verts forward + DOWN, burying the eyes in shadow (the dull,
       vacant read). Pulled back from the first pass so the face reads as a flat dull slab, not an
       ape muzzle: the brow overhangs the eyes but the whole face doesn't jut forward. */
    for(const i of [1,2]){ rings[2][i].z += 0.038; rings[2][i].y -= 0.028; }
    for(const i of [0,3]){ rings[2][i].z += 0.016; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], slump(V(0, L.headTopY, 0.00)), P.skinDk);   // bald dome

    /* heavy blunt lower jaw — a big forward wedge (the crude slab jaw, no underbite/tusks: dull, not fierce) */
    const jawFrontBot = slump(V(0, L.jawY-0.180, 0.260));
    tube(slump(V(0,L.jawY+0.02,0.03)), jawFrontBot, 0.255, 0.170, 6, P.skinLt, {raz:0.220, rbz:0.130, capB:{hex:P.skinDk}});

    /* EYES REMOVED 2026-07-04 (Adam: "across the board the eyes are in the wrong place so just
       get rid of them"). See dev/model-qa/REFERENCE-DIRECTION.md's dated reversal block. */

    /* small dumb ears — round nubs low on the sides */
    for(const s of [-1,1]){
      const eb = slump(V(s*0.245, L.cheekY, 0.00));
      const et = slump(V(s*0.285, L.cheekY+0.075, -0.08));
      tube(eb, et, 0.068, 0.042, 5, P.skin, {raz:0.048, rbz:0.028, capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.004}});
    }
    /* a couple of mottle patches on the bald pate + cheek (weathered sunburned hide) */
    for(const [dx,dy,dz,r] of [[-0.10,L.crownY-0.02,0.08,0.070],[0.14,L.cheekY+0.02,0.14,0.055]]){
      const c=slump(V(dx,dy,dz)); blob(c.x,c.y,c.z, r, r*0.7, r*0.6, P.skinMot, 5, 3);
    }
  }

  /* ---------- ARMS — THICK LOG LIMBS. Right derives to the club grip (down + out, resting the club
     butt on the ground); left hangs enormous + heavy with a great slab hand. ---------- */
  const bigMitt = (ctr, faceDir, hex)=>{
    const d = faceDir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.100), ctr.clone().addScaledVector(d,0.100),
         0.185, 0.160, 6, hex, {raz:0.125, rbz:0.125, capA:{hex}, capB:{hex}});   // big knuckle-block
    for(const off of [-1.1,0,1.1]){
      const kb = ctr.clone().addScaledVector(d,0.090).addScaledVector(side, off*0.100);
      const kt = kb.clone().addScaledVector(d,0.130).addScaledVector(side, off*0.026);
      tube(kb, kt, 0.048, 0.020, 4, hex, {capB:{hex:P.nail, lift:0.008}});
    }
  };
  {
    /* right arm -> club fist (down + out, the club butt planted on the ground). Overlaps the shoulder. */
    const S=slump(V(L.shoulderX-0.06, L.shldY-0.02, 0.03));
    { const dl=slump(V(L.shoulderX-0.02, L.shldY, 0.03)); blob(dl.x,dl.y,dl.z, 0.210,0.190,0.180, P.skinLt, 7, 4); }  // deltoid
    const E=V(0.760, 1.80, 0.24);                            // elbow out, arm dropping to the grip
    tube(S,E,0.215,0.170,6,P.skin);
    tube(E, GRIP.clone().addScaledVector(HAFT,-0.02), 0.165,0.140,6,P.skinDk);
    // fist wrapping the grip
    tube(GRIP.clone().addScaledVector(HAFT,-0.14), GRIP.clone().addScaledVector(HAFT,0.14), 0.155,0.145,6,P.skinLt,
         {capA:{hex:P.skinLt}, capB:{hex:P.skinLt}});

    /* left arm -> hangs enormous + low, big slab mitt forward (dumb dangling weight) */
    const S2=slump(V(-L.shoulderX+0.06, L.shldY-0.02, 0.03));
    { const dl=slump(V(-L.shoulderX+0.02, L.shldY, 0.03)); blob(dl.x,dl.y,dl.z, 0.210,0.190,0.180, P.skinLt, 7, 4); }  // deltoid
    const E2=V(-0.720, 1.50, 0.16);
    const W2=V(-0.680, 0.98, 0.28);
    tube(S2,E2,0.215,0.170,6,P.skin);
    tube(E2,W2,0.165,0.135,6,P.skinDk);
    bigMitt(W2, V(-0.08,-0.50,1), P.skinLt);
  }

  /* ---------- LEGS — THICK TREE-TRUNK legs, planted wide + heavy. SANDAL-WRAPPED FEET (crude leather
     straps criss-crossing the foot + ankle). ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.03, 0.02), kneeL=V(-0.440,0.66,0.14), ankL=V(-0.460,0.14,0.08);
    const hipR=V( L.hipHalf, L.hipY-0.03, 0.00), kneeR=V( 0.460,0.66,-0.06), ankR=V( 0.480,0.14,-0.12);
    tube(hipL,kneeL,0.260,0.185,6,P.skin);
    tube(kneeL,ankL,0.175,0.125,6,P.skinDk);
    tube(hipR,kneeR,0.260,0.185,6,P.skin);
    tube(kneeR,ankR,0.175,0.125,6,P.skinDk);
    /* SANDAL-WRAPPED FEET — a broad foot slab, then crude leather straps wrapping over the foot + up
       the ankle. Thick toes with nails poke out the front. */
    for(const [ank,toeDir] of [[ankL,V(-0.06,0,1)], [ankR,V(0.10,0,1)]]){
      const d=toeDir.clone().normalize();
      const heel=V(ank.x,0.080,ank.z);
      // the bare foot slab
      tube(heel.clone().addScaledVector(d,-0.04), heel.clone().addScaledVector(d,0.270), 0.150,0.110,6,P.skin,
           {raz:0.130, rbz:0.088, capA:{hex:P.skinDk}});
      // thick toes with nails
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.245).addScaledVector(side, off*0.088);
        const tt=tb.clone().addScaledVector(d,0.080).addScaledVector(side, off*0.010);
        tube(tb, tt, 0.038,0.016,4,P.skinDk,{capB:{hex:P.nail, lift:0.008}});
      }
      // SANDAL STRAPS — crude leather bands over the instep + around the ankle
      const strapAcross=(y0,frac)=>{
        const c=heel.clone().addScaledVector(d, frac*0.24).add(V(0,y0,0));
        const a=c.clone().addScaledVector(side,-0.135), b=c.clone().addScaledVector(side,0.135);
        tube(a, b, 0.030, 0.030, 5, P.sandal, {capA:{hex:P.sandalDk}, capB:{hex:P.sandalDk}});
      };
      strapAcross(0.020, 0.35);
      strapAcross(0.020, 0.62);
      // ankle wrap (a ring around the lower shin)
      const ar1=ring(V(ank.x,0.20,ank.z), V(0,1,0), 0.150, 0.115, 8), ar2=ring(V(ank.x,0.28,ank.z), V(0,1,0), 0.145, 0.110, 8);
      stitch([ar1,ar2], ()=>P.sandalDk);
    }
  }

  /* ---------- base disc (HUGE: r=0.68 — the biggest board footprint in the cast, the piece dominates) --- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 18);
    const r2=ring(V(0,0.062,0), V(0,1,0), 0.66, 0.66, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.065,0), P.discTop);
  }
}
