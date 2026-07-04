/* dev/model-qa/creatures/warlock.js — the occult-pact landmark table (whole-object probe).
   Same whole-object grammar as humanoid.js / mage.js / cleric_fable.js: the ENTIRE creature is one
   function of shared primitives, every vertex in one model frame, no anchors. The GRIMOIRE is
   authored FIRST — two angled slab-quad pages open on a thick cover, cradled on the off forearm —
   so that forearm is derived to sit exactly under the book's spine. The other hand is a raised
   claw/invoking gesture (no held item there). A short-horned COWL (two stub horns on a hood, NOT
   the druid's tall antler rack) plus long dark layered robes and a chest medallion/eye amulet
   complete the occult read. Hunched, conspiratorial posture — the opposite of the sorcerer's proud
   lunge. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildWarlock(){
  /* ---------- PALETTE (VS desaturated; a small sickly glow accent on the amulet eye only) ---------- */
  const P = {
    robe:0x2c2a34, robeDk:0x201e27, robeLt:0x3a3742,          /* near-black plum-grey layered robe */
    under:0x463a2e, underDk:0x332a21,                          /* dark umber underlayer */
    trim:0x6e6558, trimDk:0x4c453b,                            /* dull pewter piping */
    skin:0xac8564, skinDk:0x77593e, eye:0x1a1512,
    cowl:0x24222b, cowlDk:0x18161d, horn:0x3c342a, hornDk:0x272119,
    page:0xcbbf9e, pageDk:0x9c9077, cover:0x3a2420, coverDk:0x281812,
    gold:0x8d7238, goldDk:0x5f4c25,
    glow:0x8fd6a0, glowDk:0x4f8f66, glowCore:0xd8f2df,          /* sickly witch-light amulet eye */
    boot:0x1c1712, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS (hunched, ~4.5 heads; the hunch pulls chest/shoulders forward+down) ---------- */
  const L = {
    hipY:0.70, waistY:0.79, ribY:0.895, chestY:0.985, shldY:1.05, neckY:1.10,
    shoulderX:0.235, hipHalf:0.115,
    jawY:1.135, cheekY:1.205, browY:1.275, crownY:1.36, headTopY:1.415,
  };

  /* ================= THE GRIMOIRE — authored FIRST, cradled on the raised LEFT forearm =================
     A book, not a blade. The spine lies roughly HORIZONTAL along the forearm (like a book cradled
     face-up in the crook of the arm); the two pages are wide trapezoids that tilt UP and OUT from the
     spine toward the camera, so their broad top faces are what read, not thin edge-on wing-strips.
     A thick cover slab sits underneath the spine (visibly a book block, not a hilt). */
  const SPINE_A = V(-0.395, 0.815, 0.315), SPINE_B = V(-0.155, 0.845, 0.400);   // spine hinge line — wide, held out in front, clear of the body
  const SPINE_DIR = new THREE.Vector3().subVectors(SPINE_B, SPINE_A).normalize();
  const SPINE_LEN = SPINE_A.distanceTo(SPINE_B);
  const BOOK_FWD = V(0.20, 0.30, 0.60).normalize();                             // the direction the open book faces (up+out, toward camera)
  const BOOK_UP = new THREE.Vector3().crossVectors(BOOK_FWD, SPINE_DIR).normalize(); // "thickness" axis of the closed book
  const SPINE_MID = SPINE_A.clone().lerp(SPINE_B, 0.5);
  const FOREARM_GRIP = SPINE_MID.clone().addScaledVector(BOOK_UP, -0.05).addScaledVector(BOOK_FWD, -0.03); // forearm meets the spine underside
  {
    // thick cover block — a flat box under the spine (book BLOCK, not a hilt): four side quads +
    // bottom. F1: thickened (0.040→0.058) and deepened forward (0.045→0.072) so the closed-book mass
    // under the fanned pages reads as a bound tome, reinforcing "book, not blade" at the hero angle.
    const coverT=0.058; // thickness
    const cTop = (t)=> SPINE_A.clone().lerp(SPINE_B,t).addScaledVector(BOOK_UP, 0.006);
    const cBot = (t)=> SPINE_A.clone().lerp(SPINE_B,t).addScaledVector(BOOK_UP, -coverT);
    quad(cTop(0), cTop(1), cBot(1), cBot(0), P.coverDk, 0.03);                 // spine-facing edge (visible end grain along the length)
    const cFwdTop=(t)=>cTop(t).addScaledVector(BOOK_FWD,0.072), cFwdBot=(t)=>cBot(t).addScaledVector(BOOK_FWD,0.072);
    quad(cFwdBot(0), cFwdBot(1), cFwdTop(1), cFwdTop(0), P.cover, 0.04);       // front face of the closed cover strip
    quad(cBot(0), cFwdBot(0), cFwdBot(1), cBot(1), P.coverDk, 0.03);           // underside
    // two page-slabs: WIDE trapezoids tilting up+out from the spine — broad face toward the camera.
    // Made much larger relative to the cover/hand so the book silhouette dominates, and the page
    // color (warm parchment) contrasts hard against the near-black robe/cover.
    // F1 backlog: the page slabs read as a KNIFE edge-on at the hero angle — they were narrow, tall
    // slabs tilting hard UP (0.065+depth*0.55 along BOOK_UP), so from the game camera you saw a thin
    // blade-like edge. Fix: pages are now WIDER along the spine (half*1.28), fan further apart (open-
    // book V, spread 0.50), and lie FLATTER (the BOOK_UP climb is roughly halved) so each page shows
    // its broad readable FACE to the dimetric camera — an unmistakable open book, not a dagger.
    // F1 (2nd pass): the pages STILL read as a sliver edge-on. Made substantially BIGGER (half*1.55,
    // pageDepth*0.95) and laid NEARLY FLAT (BOOK_UP climb dropped to ~0.10*depth) so a large parchment
    // area faces up toward the dimetric camera — a broad open spread that can't read as a blade.
    const inset=0.012, half=(SPINE_LEN/2-inset)*1.55, pageDepth=SPINE_LEN*0.95;
    const pageQuad=(sign)=>{
      const n0=SPINE_MID.clone().addScaledVector(SPINE_DIR,-half).addScaledVector(BOOK_UP,0.012);
      const n1=SPINE_MID.clone().addScaledVector(SPINE_DIR, half).addScaledVector(BOOK_UP,0.012);
      // pages open like a V: sign flips which side leans further along SPINE_DIR (the open-book fan),
      // both lie NEARLY FLAT (broad face up toward the camera) with only a slight climb along BOOK_FWD.
      const outVec=BOOK_FWD.clone().multiplyScalar(pageDepth).addScaledVector(SPINE_DIR, sign*pageDepth*0.44).addScaledVector(BOOK_UP,0.028+pageDepth*0.12);
      const far0=n0.clone().add(outVec), far1=n1.clone().add(outVec);
      quad(n0, n1, far1, far0, P.page, 0.05);            // top (readable) face
      const d=BOOK_UP.clone().multiplyScalar(0.010);
      quad(n0.clone().sub(d), far0.clone().sub(d), far1.clone().sub(d), n1.clone().sub(d), P.pageDk, 0.04); // underside
      quad(far0, far1, far1.clone().sub(d), far0.clone().sub(d), P.pageDk, 0.03);                           // far edge (page thickness)
    };
    pageQuad(-1);    // left page (fans toward SPINE_A)
    pageQuad(1);     // right page (fans toward SPINE_B)
    // faint ruled lines on both pages (small authored detail, reads as text at a glance)
    for(const sign of [-1,1]){
      for(let k=1;k<=3;k++){
        const t=0.20*k;
        const along=BOOK_FWD.clone().multiplyScalar(t*pageDepth).addScaledVector(SPINE_DIR, sign*t*pageDepth*0.50).addScaledVector(BOOK_UP,0.010);
        const a=SPINE_MID.clone().addScaledVector(SPINE_DIR,-half*0.72).add(along);
        const b=SPINE_MID.clone().addScaledVector(SPINE_DIR, half*0.72).add(along);
        quad(a,b,b.clone().addScaledVector(BOOK_UP,0.004),a.clone().addScaledVector(BOOK_UP,0.004),P.pageDk,0.02);
      }
    }
    // a gold clasp/bookmark ribbon draped off the spine (small occult-flavor trim)
    tube(SPINE_MID.clone().addScaledVector(BOOK_UP,0.008), SPINE_MID.clone().addScaledVector(BOOK_UP,-0.09), 0.008,0.006,4,P.gold,{capB:{hex:P.goldDk}});
  }

  /* TRUNK — hunched: the loft leans forward (verts pushed +z as y rises) and pulls in at the shoulders */
  {
    const bands=[
      {y:L.hipY,   rx:0.180, rz:0.145, cz:0.0,   hex:P.underDk},
      {y:L.waistY, rx:0.158, rz:0.128, cz:0.010, hex:P.under},
      {y:L.ribY,   rx:0.182, rz:0.145, cz:0.024, hex:P.under},
      {y:L.chestY, rx:0.200, rz:0.155, cz:0.042, hex:P.robeDk},
      {y:L.shldY,  rx:0.198, rz:0.145, cz:0.058, hex:P.robeDk},
      {y:L.neckY,  rx:0.076, rz:0.072, cz:0.062, hex:P.skinDk},
    ];
    stack(bands, 8, {capTop:{hex:P.skinDk, lift:0.004}});
  }

  /* LONG LAYERED ROBE — floor-length outer shell hanging past the hunch, heavier at the hem */
  stack([
    {y:0.03,  rx:0.290, rz:0.245, cz:0.045, hex:P.robeDk},
    {y:0.20,  rx:0.270, rz:0.225, cz:0.040, hex:P.robe},
    {y:0.40,  rx:0.245, rz:0.200, cz:0.032, hex:P.robe},
    {y:0.60,  rx:0.220, rz:0.175, cz:0.022, hex:P.robeLt},
    {y:L.hipY,rx:0.195, rz:0.155, cz:0.012, hex:P.robeLt},
  ], 8, {});
  // a second, shorter over-layer (the "layered" read) draped from the shoulders to mid-thigh
  stack([
    {y:L.shldY-0.03, rx:0.215, rz:0.165, cz:0.050, hex:P.robeLt},
    {y:0.86,         rx:0.235, rz:0.185, cz:0.038, hex:P.robe},
    {y:0.62,         rx:0.250, rz:0.200, cz:0.024, hex:P.robeDk},
  ], 8, {});

  /* CHEST MEDALLION — the eye amulet, proud of the robe front, small witch-light glow at its center */
  {
    const cy=0.92, cz=0.205;
    const ringOuter=ring(V(0,cy,cz), V(0,0,1), 0.058, 0.058, 10);
    const ringInner=ring(V(0,cy,cz+0.014), V(0,0,1), 0.040, 0.040, 10);
    stitch([ringOuter,ringInner], ()=>P.gold);
    capFan(ringOuter, V(0,cy,cz-0.012), P.goldDk, true);
    // the eye — a small flat lozenge of glow color set in the medallion's center
    const eLid=ring(V(0,cy,cz+0.016), V(0,0,1), 0.026, 0.026, 8);
    capFan(eLid, V(0,cy,cz+0.026), P.glow);
    const eCore=ring(V(0,cy,cz+0.027), V(0,0,1), 0.010, 0.010, 6);
    capFan(eCore, V(0,cy,cz+0.033), P.glowCore);
    // chain looping up to the collar
    tube(V(-0.045,cy+0.05,cz-0.01), V(-0.075,L.neckY+0.02,0.062), 0.007,0.007,4,P.gold);
    tube(V( 0.045,cy+0.05,cz-0.01), V( 0.075,L.neckY+0.02,0.062), 0.007,0.007,4,P.gold);
  }

  /* head (skin loft; nose pushed; eyes painted). FRONT (+z) verts are 1 & 2.
     Shifted +z slightly and tipped down to sit on the hunched neck. */
  const HEAD_Z=0.058;
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.074, rz:0.080, hex:P.skin},
      {y:L.cheekY, rx:0.098, rz:0.096, hex:P.skin},
      {y:L.browY,  rx:0.102, rz:0.094, hex:P.skin},
      {y:L.crownY, rx:0.080, rz:0.072, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,HEAD_Z+0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, HEAD_Z+0.006), P.skinDk);
    /* eyes — two SMALL intentional quads flanking the nose ridge, proud of the (nose-pushed)
       front face plane (Adam 2026-07-03: "smaller and more intentional, not shaded eye polys").
       The cheekY ring's front verts got pushed +z by 0.018 above; the front face plane at eye
       height sits at roughly HEAD_Z+0.010+cheekY.rz+0.018, so we go a hair proud of THAT, not
       the un-pushed ellipse (which would bury the eyes inside the face). */
    for(const s of [-1,1]){
      const ex=s*0.052, ey=(L.cheekY+L.browY)/2-0.004, ez=HEAD_Z+0.010+0.096+0.018+0.004;
      quad(V(ex-0.013,ey-0.0105,ez), V(ex+0.013,ey-0.0105,ez),
           V(ex+0.013,ey+0.0105,ez-0.006), V(ex-0.013,ey+0.0105,ez-0.006), P.eye, 0.0);
    }
  }

  /* HOODED COWL with two short stub HORNS — clearly a hood ornament, not a tall antler rack.
     Same construction family as humanoid.js's hood (shell + open face window + dark lining) but
     deeper/darker, and with two short curved horn-tubes rising off the hood's crown. */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];
    const bands=[
      {y:L.neckY-0.01,  rx:0.100, rz:0.096, hex:P.cowlDk},
      {y:L.jawY+0.02,   rx:0.132, rz:0.122, hex:P.cowl},
      {y:L.browY+0.015, rx:0.140, rz:0.126, hex:P.cowl},
      {y:L.crownY+0.03, rx:0.108, rz:0.100, hex:P.cowl},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(0,b.y,HEAD_Z+0.004), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.018);
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0, L.headTopY+0.05, HEAD_Z-0.03), P.cowl);
    const inner=bands.map(b=>ring(V(0,b.y,HEAD_Z+0.004), V(0,1,0), b.rx-0.018, b.rz-0.018, n, ph));
    inner[3].forEach(p=>p.z-=0.018);
    for(let b=1;b<3;b++) for(const edge of [0,3])
      quad(rings[b][edge], inner[b][edge], inner[b+1][edge], rings[b+1][edge], P.cowlDk, 0.03);

    // TWO SHORT STUB HORNS — short curved tubes rising off the crown, flanking center, tips forward-curled
    for(const s of [-1,1]){
      const base=V(s*0.058, L.crownY+0.055, HEAD_Z-0.01);
      const mid =V(s*0.078, L.crownY+0.135, HEAD_Z-0.03);
      const tip =V(s*0.072, L.crownY+0.185, HEAD_Z+0.02);   // curls slightly forward at the tip
      tube(base, mid, 0.020, 0.014, 6, P.horn, {capA:{hex:P.hornDk}});
      tube(mid, tip, 0.014, 0.005, 6, P.hornDk, {capB:{hex:P.hornDk}});
    }
  }

  /* LEFT ARM — raised, forearm DERIVED to sit exactly under the grimoire's spine */
  {
    const S=V(-L.shoulderX, L.shldY-0.02, 0.05);
    const E=V(-0.365, 0.760, 0.225);
    tube(S,E,0.068,0.056,6,P.robe);                                    // upper sleeve
    tube(E, FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,-0.03), 0.052,0.044,6,P.robeLt,{capB:{hex:P.skinDk}}); // forearm sleeve up to the wrist
    // the hand/wrist cradling the spine from underneath
    tube(FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,-0.03), FOREARM_GRIP.clone().addScaledVector(SPINE_DIR,0.03),
         0.040,0.036,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* RIGHT ARM — raised in a claw/invoking gesture up beside the head, fingers splayed and curled */
  const CLAW = V(0.395, 1.235, 0.205);
  const CDIR = V(0.35, 0.30, 0.55).normalize();
  {
    const S2=V(L.shoulderX, L.shldY-0.02, 0.05);
    const E2=V(0.365, 1.03, 0.155);
    const W2=CLAW.clone().addScaledVector(CDIR,-0.05);
    tube(S2,E2,0.066,0.054,6,P.robe);
    tube(E2,W2,0.048,0.036,6,P.robeLt,{capB:{hex:P.skinDk}});
    tube(W2, CLAW, 0.036,0.028,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
    // four splayed, curled claw-fingers around the invoking hand — wider fan for clarity
    const up=V(0,1,0);
    const fu=new THREE.Vector3().crossVectors(up,CDIR).normalize();
    const fv=new THREE.Vector3().crossVectors(CDIR,fu).normalize();
    for(const k of [-2.2,-0.9,0.9,2.2]){
      const base=CLAW.clone().addScaledVector(fu,k*0.017).addScaledVector(CDIR,0.01);
      const knuckle=base.clone().addScaledVector(CDIR,0.034).addScaledVector(fv,0.022).addScaledVector(fu,k*0.008);
      const tip=knuckle.clone().addScaledVector(CDIR,0.006).addScaledVector(fv,0.040).addScaledVector(fu,k*0.013);
      tube(base,knuckle,0.011,0.009,4,P.skin);
      tube(knuckle,tip,0.009,0.005,4,P.skinDk,{capB:{hex:P.skinDk}});
    }
  }

  /* LEGS — hunched/conspiratorial narrow stance, mostly hidden by the long robe hem (only boots show) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.02), ankL=V(-0.10, 0.085, 0.05);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.02), ankR=V( 0.115, 0.085, 0.02);
    tube(hipL,ankL,0.060,0.044,6,P.underDk);
    tube(hipR,ankR,0.060,0.044,6,P.underDk);
    for(const [ank,toeDir] of [[ankL,V(-0.1,0,1).normalize()], [ankR,V(0.15,0,1).normalize()]]){
      stack([
        {y:0.012, rx:0.062, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.056, rz:0.058, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.115), 0.050,0.038,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.042, rbz:0.030});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
