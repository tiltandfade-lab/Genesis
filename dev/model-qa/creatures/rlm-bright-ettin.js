/* dev/model-qa/creatures/rlm-bright-ettin.js — the ETTIN, Large, CR 4, realm bright-kingdom
   (foundry pilot, bright-w1 cell 7, port 5357). Bright skin: two-headed circus strongman.
   CORE IDENTITY: the ettin — the TWO-HEADED giant, heads arguing, one broad shoulder girdle
   feeding two necks that go their own way. HUMANOID-giant family per ANATOMY-CANON (tiny-ish
   heads sunk low relative to hulking shoulders is the giant read; here doubled and put at odds).

   FEATURE CHECKLIST (the ~1,000-2,000 budget buys):
     1. ANATOMY (chief criterion) — one broad shoulder girdle, gut-led giant mass (pot belly the
        widest band, narrower slab chest above it per the ogre precedent), TWO necks rooted at
        different points on that girdle, each carrying its own head AT A DIFFERENT ANGLE doing a
        DIFFERENT thing — the whole point of the creature.
     2. SIGNATURE — the two disagreeing heads: head A (stage-left, "the roarer") thrown forward
        and down, jaw wide open mid-roar, driving into the charge; head B (stage-right, "the
        heckler") twisted hard sideways and back toward head A, jaw also open, yelling AT the
        other head rather than forward. Different angle, different job — never a symmetric pair.
     3. Club in each hand: one club dragging low and back (trailing off the charge, still in
        motion), one club raised high overhead (about to come down) — asymmetric weapon-hands to
        match the asymmetric heads, so the whole figure reads as two competing gestures riding one
        committed lean.
     4. Circus-strongman garnish (bright-kingdom skin over the core identity): striped tights/
        sash on the pot belly, a wide gaudy strongman belt, garish red/gold/cream palette — but
        the identity leads: the two-headed argument and gut-led giant mass are never subordinated
        to the costume.
     5. Bracing charge stance: front leg planted hard forward, back leg trailing/braced, hips and
        shoulders torqued in the charge direction — one spine gesture underneath the two necks
        (law: the spine still carries ONE gesture even though the heads split off it).

   POSE SENTENCE: the ettin mid-charge, front leg driving forward and back leg trailing braced,
   torso torqued into the lunge — head A thrown low and forward roaring straight ahead with its
   trailing club dragging back at its side, head B twisted hard back over the shared shoulders
   yelling AT head A with its club raised high overhead about to swing — one committed forward-
   leaning charge underneath, two heads splitting off it into opposite, disagreeing acts.

   SPINE-GESTURE SENTENCE (per ANATOMY-CANON POSE-ANATOMY, law 1 adapted for two necks): the
   spine still runs ONE readable curve, pelvis to shoulder girdle — hips torqued into the charge,
   torso leaned forward off that same twist — and BOTH necks are hung off the TOP of that single
   curve rather than each pulling its own torso-twist; the argument lives in the neck/head/arm
   angles above the girdle, not in a second spine. Elbows bend ~110-130deg on both arms (trailing
   drag-club elbow bent back, raised overhead club elbow cocked up), never dead-straight; the
   raised-club shoulder rides up with the arm per law 3; the two heads' opposed twist reads as the
   counterpose (law 4) instead of a leg/hip counter.

   Whole-object grammar: one function, one geometry frame, no anchors, spine +z front, up +y,
   ground y=0. Torso-torque pattern + bigMitt/foot helpers adapted from dev/model-qa/creatures/
   mon-ogre.js (the proven HUMANOID-giant precedent). Imported by ps1-sheet.html
   SETS['bright-w1'] cell 7, fn buildEttin. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildEttin(){
  /* ---------- PALETTE — circus-strongman bright-kingdom garnish (saturated red/gold/cream)
     over a core giant-hide base, so the costume reads bold but the anatomy underneath still
     carries real value contrast per law 3. ---------- */
  const P = {
    hide:0xc08858, hideDk:0x8a5e38, hideLt:0xd9a774, hideMot:0xa8734a,   // warm tan giant hide
    belly:0xd6a878, bellyDk:0xa87850,                                    // paler stretched belly under the sash
    tights:0xb2312e, tightsDk:0x7a1f1e, tightsLt:0xd94e46,               // red-striped strongman tights on the belly/hips
    cream:0xe8dcc2, creamDk:0xc4b494,                                    // cream stripe alternating with red
    belt:0xc9a227, beltDk:0x8f6f16, buckle:0xf0d878,                     // gaudy gold strongman belt + buckle
    tuskA:0xe8dcc0, tuskADk:0xbfae86,                                    // head A tusk (pale)
    tuskB:0xecd8a8, tuskBDk:0xc4ab72,                                    // head B tusk (slightly warmer, marks it as the "other" head)
    hairA:0x3a2416, hairADk:0x241608,                                    // head A dark greasy scalp
    hairB:0x5a3a20, hairBDk:0x3a2410,                                    // head B lighter/reddish scalp — visual difference between the two heads
    eyeA:0xf0d040, eyeADk:0x1a1206,                                      // head A ember-gold eye
    eyeB:0xf06030, eyeBDk:0x1a0e06,                                      // head B ember-red eye — different color reinforces "different heads"
    wood:0x8a6640, woodDk:0x5e4428, bark:0x6c4c2c, barkLt:0xa8895c,      // club shafts/heads, lightened past the value floor
    nail:0x241c14,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS (LARGE giant, gut-led per HUMANOID-giant precedent) ---------- */
  const L = {
    hipY:0.90, gutY:1.02, waistY:1.10, ribY:1.28, chestY:1.44, shldY:1.56, neckRootY:1.60,
    hipHalf:0.205, shoulderX:0.460,
  };

  /* ---------- SPINE TORQUE — ONE gesture line for the whole lower body + shoulder girdle: hips
     twist into the charge, torso leans forward off the same twist. Both necks/heads/arms hang
     off the TOP of this single curve (law 1 adapted for a two-head chassis). ---------- */
  const torque = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(0,1,0), -0.20);   // twist into the charge direction
    q.applyAxisAngle(V(1,0,0), 0.16);    // forward lean, driving weight into the charge
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — pot-belly widest band, slab chest narrower above it, hulking shoulder
     girdle at the top (the single wide platform both necks root into). ---------- */
  stack([
    {y:L.hipY,   rx:0.335, rz:0.305, hex:P.hideDk},
    {y:L.gutY,   rx:0.435, rz:0.430, hex:P.belly},
    {y:L.waistY, rx:0.460, rz:0.455, hex:P.belly},          // WIDEST BAND — the pot belly
    {y:L.ribY,   rx:0.365, rz:0.300, hex:P.bellyDk},
    {y:L.chestY, rx:0.355, rz:0.270, hex:P.hide},
    {y:L.shldY,  rx:0.470, rz:0.300, hex:P.hideLt},         // broad shoulder girdle — feeds BOTH necks
  ], 8, {xform:torque, capTop:{hex:P.hideDk, lift:0.006}});

  /* ---------- STRIPED SASH/TIGHTS on the belly (circus-strongman garnish riding the gut band) ---------- */
  for(let i=0;i<5;i++){
    const y = L.gutY - 0.03 + i*0.032;
    const hex = (i%2===0) ? P.tights : P.cream;
    const rx = 0.428 + (i*0.006), rz = 0.424 + (i*0.006);
    const r1 = ring(V(0,y-0.014,0), V(0,1,0), rx*0.99, rz*0.99, 10).map(torque);
    const r2 = ring(V(0,y+0.014,0), V(0,1,0), rx, rz, 10).map(torque);
    stitch([r1,r2], ()=>hex);
  }
  /* wide gold strongman belt at the waist, over the tights, plus a bright buckle facing the charge */
  {
    const r1 = ring(V(0,L.waistY-0.06,0), V(0,1,0), 0.462, 0.457, 10).map(torque);
    const r2 = ring(V(0,L.waistY+0.02,0), V(0,1,0), 0.465, 0.460, 10).map(torque);
    stitch([r1,r2], ()=>P.belt);
    const bA = torque(V(-0.06,L.waistY-0.04,0.44)), bB = torque(V(0.06,L.waistY-0.04,0.44));
    const bC = torque(V(0.06,L.waistY+0.04,0.44)), bD = torque(V(-0.06,L.waistY+0.04,0.44));
    quad(bA,bB,bC,bD,P.buckle,0.02);
  }

  /* ---------- TWO NECKS — rooted at DIFFERENT points on the shared shoulder girdle, each
     going its own direction. Both are hung off the top of the single torque curve, so the
     split happens above the girdle, not in a second spine. ---------- */
  const neckA_root = torque(V(-0.28, L.neckRootY, 0.12));   // head A (roarer) — root toward stage-left/forward
  const neckB_root = torque(V( 0.30, L.neckRootY, 0.00));   // head B (heckler) — root toward stage-right

  /* ===================== HEAD A — THE ROARER: thrown low and forward, jaw wide open,
     driving into the charge. Small-skulled giant read, sloped brow. ===================== */
  let headA_crown;
  {
    const necTop = neckA_root.clone().add(V(-0.22, 0.22, 0.26));   // thrown forward+down, tilted low
    tube(neckA_root, necTop, 0.185, 0.170, 7, P.hideDk);

    const forward = new THREE.Vector3().subVectors(necTop, neckA_root).normalize();
    const up = V(0,1,0);
    const right = new THREE.Vector3().crossVectors(up, forward).normalize();
    const faceUp = new THREE.Vector3().crossVectors(forward, right).normalize();

    const jaw    = necTop.clone().addScaledVector(faceUp, 0.06).addScaledVector(forward, 0.02);
    const cheek  = necTop.clone().addScaledVector(faceUp, 0.16).addScaledVector(forward, 0.05);
    const brow   = necTop.clone().addScaledVector(faceUp, 0.25).addScaledVector(forward, 0.02);
    const crown  = necTop.clone().addScaledVector(faceUp, 0.33).addScaledVector(forward,-0.06);
    headA_crown = crown;

    const bands = [
      {p:jaw,   rx:0.185, rz:0.180, hex:P.hideLt},
      {p:cheek, rx:0.172, rz:0.160, hex:P.hide},
      {p:brow,  rx:0.148, rz:0.128, hex:P.hide},
      {p:crown, rx:0.088, rz:0.078, hex:P.hideDk},
    ];
    const rings = bands.map(b=>ring(b.p, faceUp, b.rx, b.rz, 8, 0));
    // sloped brow pushes forward+down over the eyes (dumb giant read)
    for(const i of [1,2]){ rings[2][i].addScaledVector(forward,0.05); rings[2][i].addScaledVector(faceUp,-0.02); }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<8;i++){ const i2=(i+1)%8;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.06);
      }
    }
    capFan(rings[3], crown.clone().addScaledVector(faceUp,0.06), P.hideDk);

    /* WIDE-OPEN ROARING JAW — the loud open-mouth beat, mid-charge yell */
    const jawFront = jaw.clone().addScaledVector(forward, 0.20);
    const jawLow = jawFront.clone().addScaledVector(faceUp, -0.11);
    tube(jaw.clone().addScaledVector(faceUp,-0.02), jawLow, 0.170, 0.100, 6, P.hideLt, {capB:{hex:P.hideDk}});
    // dark open-mouth throat well
    const mouthBack = jaw.clone().addScaledVector(forward,0.05).addScaledVector(faceUp,-0.03);
    const r1 = ring(mouthBack, forward, 0.09, 0.06, 6);
    const r2 = ring(jawFront.clone().addScaledVector(faceUp,-0.02), forward, 0.10, 0.07, 6);
    stitch([r1,r2], ()=>0x160c08);

    /* one big up-curling tusk (pale, high-value against dark hide — law 3) */
    {
      const base = jaw.clone().addScaledVector(right,-0.09).addScaledVector(forward,0.16).addScaledVector(faceUp,-0.06);
      const tip  = base.clone().addScaledVector(faceUp,0.14).addScaledVector(forward,0.03);
      tube(base, tip, 0.032, 0.009, 5, P.tuskA, {capB:{hex:P.tuskADk, lift:0.005}});
    }
    /* eyes — glaring wide, ember-gold, deep-set under the sloped brow */
    for(const s of [-1,1]){
      const e = brow.clone().addScaledVector(right, s*0.09).addScaledVector(forward,0.10).addScaledVector(faceUp,-0.03);
      const et = e.clone().addScaledVector(forward,0.03);
      tube(e, et, 0.026, 0.020, 5, P.eyeA, {capB:{hex:P.eyeADk}});
    }
    /* small dumb ears */
    for(const s of [-1,1]){
      const eb = cheek.clone().addScaledVector(right, s*0.16);
      const et = eb.clone().addScaledVector(right, s*0.05).addScaledVector(faceUp,0.06);
      tube(eb, et, 0.045, 0.026, 5, P.hide, {capB:{hex:P.hideDk, lift:0.004}});
    }
    /* dark greasy scalp scrag on the crown */
    for(const [ax,az] of [[-0.04,0.02],[0.03,0.00],[0.0,-0.03]]){
      const base = crown.clone().addScaledVector(right,ax).addScaledVector(forward,az);
      const tip = base.clone().addScaledVector(faceUp,0.09).addScaledVector(forward,-0.03);
      tube(base, tip, 0.020, 0.006, 4, P.hairA, {capB:{hex:P.hairADk}});
    }
  }

  /* ===================== HEAD B — THE HECKLER: twisted hard sideways+back toward head A,
     jaw also open, yelling AT the other head rather than forward. Different angle, different
     job — never a mirror of head A. ===================== */
  {
    const necTop = neckB_root.clone().add(V(0.20, 0.32, -0.04));   // more upright, twisted
    tube(neckB_root, necTop, 0.175, 0.160, 7, P.hideDk);

    /* face direction TWISTED to point back-and-across toward head A (stage-left), not forward */
    const faceDir = new THREE.Vector3().subVectors(headA_crown, necTop).normalize();
    const up = V(0,1,0);
    const right = new THREE.Vector3().crossVectors(up, faceDir).normalize();
    const faceUp = new THREE.Vector3().crossVectors(faceDir, right).normalize();

    const jaw    = necTop.clone().addScaledVector(faceUp, 0.07);
    const cheek  = necTop.clone().addScaledVector(faceUp, 0.17);
    const brow   = necTop.clone().addScaledVector(faceUp, 0.26);
    const crown  = necTop.clone().addScaledVector(faceUp, 0.34).addScaledVector(faceDir,-0.05);

    const bands = [
      {p:jaw,   rx:0.180, rz:0.175, hex:P.hideLt},
      {p:cheek, rx:0.168, rz:0.156, hex:P.hide},
      {p:brow,  rx:0.144, rz:0.124, hex:P.hide},
      {p:crown, rx:0.084, rz:0.075, hex:P.hideDk},
    ];
    const rings = bands.map(b=>ring(b.p, faceUp, b.rx, b.rz, 8, 0));
    for(const i of [1,2]){ rings[2][i].addScaledVector(faceDir,0.045); rings[2][i].addScaledVector(faceUp,-0.018); }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<8;i++){ const i2=(i+1)%8;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.06);
      }
    }
    capFan(rings[3], crown.clone().addScaledVector(faceUp,0.06), P.hideDk);

    /* open yelling jaw, aimed AT head A */
    const jawFront = jaw.clone().addScaledVector(faceDir, 0.19);
    const jawLow = jawFront.clone().addScaledVector(faceUp,-0.10);
    tube(jaw.clone().addScaledVector(faceUp,-0.02), jawLow, 0.164, 0.095, 6, P.hideLt, {capB:{hex:P.hideDk}});
    const mouthBack = jaw.clone().addScaledVector(faceDir,0.05).addScaledVector(faceUp,-0.03);
    const r1 = ring(mouthBack, faceDir, 0.085, 0.058, 6);
    const r2 = ring(jawFront.clone().addScaledVector(faceUp,-0.02), faceDir, 0.095, 0.066, 6);
    stitch([r1,r2], ()=>0x1a0e08);

    /* asymmetric small tusk nub — head B is smaller-fanged than head A (different, not a mirror) */
    {
      const base = jaw.clone().addScaledVector(right,0.08).addScaledVector(faceDir,0.15).addScaledVector(faceUp,-0.05);
      const tip  = base.clone().addScaledVector(faceUp,0.10).addScaledVector(faceDir,0.02);
      tube(base, tip, 0.024, 0.008, 4, P.tuskB, {capB:{hex:P.tuskBDk, lift:0.004}});
    }
    /* eyes — ember-RED (distinct from head A's gold), glaring toward head A */
    for(const s of [-1,1]){
      const e = brow.clone().addScaledVector(right, s*0.085).addScaledVector(faceDir,0.09).addScaledVector(faceUp,-0.03);
      const et = e.clone().addScaledVector(faceDir,0.03);
      tube(e, et, 0.024, 0.018, 5, P.eyeB, {capB:{hex:P.eyeBDk}});
    }
    for(const s of [-1,1]){
      const eb = cheek.clone().addScaledVector(right, s*0.15);
      const et = eb.clone().addScaledVector(right, s*0.05).addScaledVector(faceUp,0.05);
      tube(eb, et, 0.042, 0.024, 5, P.hide, {capB:{hex:P.hideDk, lift:0.004}});
    }
    /* lighter/reddish scalp scrag — visual difference between the two heads */
    for(const [ax,az] of [[-0.03,0.02],[0.03,-0.01],[0.0,0.03]]){
      const base = crown.clone().addScaledVector(right,ax).addScaledVector(faceDir,az);
      const tip = base.clone().addScaledVector(faceUp,0.08).addScaledVector(faceDir,-0.02);
      tube(base, tip, 0.018, 0.005, 4, P.hairB, {capB:{hex:P.hairBDk}});
    }
  }

  /* ---------- CLUBS — one dragging low+back (trailing off the charge, elbow bent ~120deg), one
     raised overhead about to come down (elbow cocked up ~110deg). Built first per whole-object
     grip-is-ground-truth discipline, then the arm rigs derive to the grips. ---------- */
  function clubGeo(grip, top, hex, hexLt, hexDk){
    const haft = new THREE.Vector3().subVectors(top, grip).normalize();
    const butt = grip.clone().addScaledVector(haft, -0.32);
    tube(butt, grip.clone().addScaledVector(haft,-0.06), 0.058, 0.074, 7, hexDk, {capA:{hex:hexDk, lift:0.015}});
    tube(grip.clone().addScaledVector(haft,-0.06), grip.clone().addScaledVector(haft,0.10), 0.080, 0.086, 7, hex);
    tube(grip.clone().addScaledVector(haft,0.10), top, 0.086, 0.132, 7, hexLt, {capB:{hex:hexDk, lift:0.02}});
    for(const along of [0.35,0.65]){
      const c = grip.clone().addScaledVector(haft, 0.10 + along*0.55);
      const r = 0.088 + along*0.04;
      const rA = ring(c.clone().addScaledVector(haft,-0.02), haft, r,r,7).map(p=>p);
      const rB = ring(c.clone().addScaledVector(haft, 0.02), haft, r,r,7).map(p=>p);
      stitch([rA,rB], ()=>hexDk);
    }
  }

  /* left arm (right side of the figure toward head A) -> TRAILING DRAG CLUB, elbow bent back,
     low and behind, still in motion off the charge. */
  const dragGrip = torque(V(-0.92, 0.56, -0.20));
  const dragTop  = torque(V(-1.20, 0.22, -0.56));
  clubGeo(dragGrip, dragTop, P.wood, P.barkLt, P.woodDk);
  {
    const S = torque(V(-L.shoulderX, L.shldY-0.02, 0.02));
    const E = torque(V(-0.82, 1.00, -0.10));
    tube(S,E,0.155,0.122,6,P.hide);
    tube(E, dragGrip, 0.122,0.100,6,P.hideDk);
  }

  /* right arm -> RAISED OVERHEAD CLUB, elbow cocked up, top of a downswing wind-up. */
  const raiseGrip = torque(V(0.62, 2.02, -0.06));
  const raiseTop  = torque(V(0.96, 2.40, -0.44));
  clubGeo(raiseGrip, raiseTop, P.wood, P.barkLt, P.woodDk);
  {
    const S = torque(V(L.shoulderX, L.shldY-0.02, 0.02));   // shoulder rides UP with the raised arm (law 3)
    const E = torque(V(0.76, 1.66, -0.16));
    tube(S,E,0.158,0.126,6,P.hide);
    tube(E, raiseGrip, 0.126,0.104,6,P.hideDk);
  }

  /* fists gripping the club handles */
  function fist(ctr, dir, hex){
    const d = dir.clone().normalize();
    tube(ctr.clone().addScaledVector(d,-0.07), ctr.clone().addScaledVector(d,0.07), 0.115, 0.100, 6, hex,
         {capA:{hex}, capB:{hex}});
  }
  fist(dragGrip, new THREE.Vector3().subVectors(dragTop,dragGrip), P.hideLt);
  fist(raiseGrip, new THREE.Vector3().subVectors(raiseTop,raiseGrip), P.hideLt);

  /* ---------- LEGS — bracing charge lunge: front leg (left) planted forward, back leg (right)
     trailing/braced. Bare feet, thick toes. ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.03, 0.02), kneeL=V(-0.330,0.52,0.40), ankL=V(-0.340,0.09,0.52);
    const hipR=V( L.hipHalf, L.hipY-0.03,-0.02), kneeR=V( 0.400,0.56,-0.34), ankR=V( 0.440,0.10,-0.48);
    tube(hipL,kneeL,0.195,0.145,6,P.hide);
    tube(kneeL,ankL,0.134,0.098,6,P.hideDk);
    tube(hipR,kneeR,0.195,0.145,6,P.hide);
    tube(kneeR,ankR,0.134,0.098,6,P.hideDk);
    for(const [ank,toeDir] of [[ankL,V(-0.05,0,1)], [ankR,V(0.10,0,-1)]]){
      const d=toeDir.clone().normalize();
      const heel=V(ank.x,0.090,ank.z);   // gate fix: 0.075 put the foot-tube underside at -0.0116, past the -0.01 floor
      tube(heel.clone().addScaledVector(d,-0.03), heel.clone().addScaledVector(d,0.215), 0.114,0.082,6,P.hide,
           {raz:0.100, rbz:0.068, capA:{hex:P.hideDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.198).addScaledVector(side, off*0.070);
        const tt=tb.clone().addScaledVector(d,0.058).addScaledVector(side, off*0.010);
        tube(tb, tt, 0.030,0.012,4,P.hideDk,{capB:{hex:P.nail, lift:0.006}});
      }
    }
  }

  /* ---------- base disc (LARGE, r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 16);
    const r2=ring(V(0,0.058,0), V(0,1,0), 0.53, 0.53, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.061,0), P.discTop);
  }
}
