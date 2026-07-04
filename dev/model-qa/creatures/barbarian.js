/* dev/model-qa/creatures/barbarian.js — the hulking berserker landmark table (whole-object probe).
   Same whole-object grammar as humanoid.js: the ENTIRE creature is one function of shared
   primitives, every vertex in one model frame, no anchors. The GREAT-AXE is authored first so
   BOTH fists derive from the haft — a two-handed grip fitted to the weapon, not the other way
   round. Silhouette-first: broader shoulders/chest than the fighter, bare chest, a fur pelt slung
   over one shoulder, fur-cuffed boots, a wild hair/beard mass, and a wide aggressive stance —
   the read that says "barbarian" even under a flat PS1 tint. Runs slightly taller (~1.55 head-top)
   than the base humanoid (~1.48) per the brief. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildBarbarian(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    skin:0xb8875c, skinDk:0x7d5b3c, skinLt:0xc99a70,
    fur:0x9b8468, furDk:0x655336, furLt:0xc2b28e,
    trouser:0x5b4230, trouserDk:0x40301f,
    leather:0x4e3d2a, leatherDk:0x362a1c,
    boot:0x3c3226, bootDk:0x2a2118,
    hair:0x4a3527, hairDk:0x33241a,
    wood:0x5a4326, woodDk:0x3f2f1a,
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xb9bfc4,
    bronze:0x9c7d3e, eye:0x1a1512,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS (hulking build, taller + broader than the base humanoid) ---------- */
  const L = {
    hipY:0.74, waistY:0.83, ribY:0.96, chestY:1.08, shldY:1.175, neckY:1.215,
    hipHalf:0.135, shoulderX:0.300,
    jawY:1.245, cheekY:1.325, browY:1.400, crownY:1.490, headTopY:1.550,
  };

  /* GREAT-AXE FIRST — massive two-handed haft; both fists derive from it below.
     Head sits well ABOVE the head-top (~1.55) and reaches wide so it reads clearly beside/over
     the skull in every panel, not buried against the hair mass. */
  const AXE_BUTT = V(-0.045, 0.58, -0.10), AXE_TOP = V(0.235, 1.86, 0.30);
  const AXIS = new THREE.Vector3().subVectors(AXE_TOP, AXE_BUTT).normalize();
  const GRIP_LO = AXE_BUTT.clone().addScaledVector(AXIS, 0.30);   /* rear (left) hand */
  const GRIP_HI = AXE_BUTT.clone().addScaledVector(AXIS, 0.62);   /* forward (right) hand */
  {
    /* haft: leather-wrapped butt cap -> long wood shaft -> steel throat into the head */
    tube(AXE_BUTT, AXE_BUTT.clone().addScaledVector(AXIS, 0.10), 0.026, 0.024, 6, P.leatherDk, {capA:{hex:P.bronze, lift:0.02}});
    tube(AXE_BUTT.clone().addScaledVector(AXIS, 0.10), GRIP_LO.clone().addScaledVector(AXIS, -0.09), 0.024, 0.024, 6, P.wood);
    tube(GRIP_LO.clone().addScaledVector(AXIS, -0.09), GRIP_LO.clone().addScaledVector(AXIS, 0.09), 0.026, 0.026, 6, P.leather);
    tube(GRIP_LO.clone().addScaledVector(AXIS, 0.09), GRIP_HI.clone().addScaledVector(AXIS, -0.09), 0.023, 0.022, 6, P.wood);
    tube(GRIP_HI.clone().addScaledVector(AXIS, -0.09), GRIP_HI.clone().addScaledVector(AXIS, 0.09), 0.025, 0.025, 6, P.leather);
    tube(GRIP_HI.clone().addScaledVector(AXIS, 0.09), AXE_TOP.clone().addScaledVector(AXIS, -0.22), 0.022, 0.030, 6, P.wood);
    tube(AXE_TOP.clone().addScaledVector(AXIS, -0.22), AXE_TOP.clone().addScaledVector(AXIS, -0.05), 0.030, 0.052, 6, P.steelDk);

    /* the double-bit axe head: two BIG crescent blades flanking the haft, perpendicular to AXIS */
    const up = V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, AXIS).normalize();   /* the blade-spread axis */
    const w = new THREE.Vector3().crossVectors(AXIS, u).normalize();
    const HEAD_C = AXE_TOP.clone().addScaledVector(AXIS, -0.02);
    /* central steel eye/socket (drum) the blades root into */
    tube(HEAD_C.clone().addScaledVector(w,-0.038), HEAD_C.clone().addScaledVector(w,0.038), 0.075, 0.075, 8, P.steelDk);
    for(const s of [-1,1]){
      /* one crescent blade: a fan of quads from the haft out to a curved edge, both faces */
      const root = HEAD_C.clone().addScaledVector(u, s*0.06);
      const bandN = 6;
      const innerPts = [], outerPts = [];
      for(let k=0;k<=bandN;k++){
        const t = k/bandN;
        const along = -0.14 + t*0.30;                          /* sweep along AXIS (bigger reach) */
        const reach = 0.06 + Math.sin(t*Math.PI)*0.30;          /* crescent bulge, pinched at both ends */
        innerPts.push(root.clone().addScaledVector(AXIS, along*0.35).addScaledVector(u, s*reach*0.15));
        outerPts.push(root.clone().addScaledVector(AXIS, along).addScaledVector(u, s*reach));
      }
      for(let k=0;k<bandN;k++){
        const a=innerPts[k], b=innerPts[k+1], c=outerPts[k+1], d=outerPts[k];
        const off = w.clone().multiplyScalar(0.016);
        quad(a.clone().add(off), b.clone().add(off), c.clone().add(off), d.clone().add(off), P.steel, 0.04);
        quad(d.clone().sub(off), c.clone().sub(off), b.clone().sub(off), a.clone().sub(off), P.steel, 0.04);
        /* thin edge rim */
        quad(d.clone().add(off), c.clone().add(off), c.clone().sub(off), d.clone().sub(off), P.steelLt, 0.02);
      }
    }
  }

  /* trunk — broad bare chest, hulking taper hips->shoulders (skin, no shirt). F1 backlog: the chest
     band was P.skinLt (a bright ring) whose front vert caught the key light as a lone PALE CHIP on
     one pec; the band is now the mid P.skin tone so the chest reads as one even mass, and the pec
     highlight is authored SYMMETRICALLY below as two soft raised patches (both pecs, not one chip). */
  stack([
    {y:L.hipY,   rx:0.235, rz:0.175, hex:P.skinDk},
    {y:L.waistY, rx:0.205, rz:0.155, hex:P.skin},
    {y:L.ribY,   rx:0.250, rz:0.180, hex:P.skin},
    {y:L.chestY, rx:0.295, rz:0.200, hex:P.skin},
    {y:L.shldY,  rx:0.310, rz:0.190, hex:P.skin},
    {y:L.neckY,  rx:0.100, rz:0.092, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});

  /* ab/chest muscle definition — a dark centerline score (sternum + abs) down the front */
  {
    const rows=[[L.ribY,0.175],[0.985,0.195],[L.chestY,0.200]];
    for(const [y,z] of rows){
      quad(V(-0.035,y-0.008,z), V(0.035,y-0.008,z), V(0.035,y+0.008,z+0.01), V(-0.035,y+0.008,z+0.01), P.skinDk, 0.05);
    }
    /* pec definition — two SYMMETRIC pec-underline shadows (both sides equally), a DARKER crease
       under each pec, so the chest reads muscled by shadow rather than by a bright patch (the old
       fix's pale chip came from a LIT patch catching the key light on one pec only). No bright hex
       on the chest anymore — the bare-skin band is even, the muscle read is all dark scoring. */
    for(const s of [-1,1]){
      const cx=s*0.105, cy=L.chestY-0.028, cz=0.198;
      quad(V(cx-0.062,cy-0.014,cz), V(cx+0.062,cy-0.014,cz),
           V(cx+0.054,cy+0.012,cz+0.008), V(cx-0.054,cy+0.012,cz+0.008), P.skinDk, 0.045);
    }
  }

  /* wide leather belt + bronze buckle */
  stack([
    {y:0.775, rx:0.215, rz:0.165, hex:P.leather},
    {y:0.840, rx:0.212, rz:0.162, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.045,0.782,0.170), V(0.045,0.782,0.170), V(0.045,0.833,0.166), V(-0.045,0.833,0.166), P.bronze, 0.02);

  /* trouser/loincloth skirt (hips down to mid-thigh, ragged) */
  stack([
    {y:0.44, rx:0.240, rz:0.190, hex:P.trouserDk},
    {y:0.58, rx:0.230, rz:0.180, hex:P.trouser},
    {y:L.hipY, rx:0.225, rz:0.172, hex:P.trouser},
  ], 8, {});

  /* head (skin loft; nose pushed; eyes painted). FRONT (+z) verts of this ring are 1 & 2. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.092, rz:0.098, hex:P.skin},
      {y:L.cheekY, rx:0.124, rz:0.118, hex:P.skin},
      {y:L.browY,  rx:0.128, rz:0.116, hex:P.skin},
      {y:L.crownY, rx:0.098, rz:0.090, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.013), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.024;           /* nose ridge on the front verts */
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY-0.03, 0.010), P.hairDk);   /* hair mass takes over the crown */

    /* eyes REMOVED 2026-07-04 (Adam: "across the board the eyes are in the wrong place so just
       get rid of them"). See dev/model-qa/REFERENCE-DIRECTION.md's dated reversal block. */
  }

  /* WILD HAIR + BEARD MASS — a shaggy, jagged crown mane + a heavy jaw-forward beard wedge.
     Beard sits ENTIRELY above shldY (1.175) so it never dips inside the torso mesh — it must
     clear the collarbone to stay visible from outside. Both pushed further +z to clear the skull. */
  {
    const n=8, ph=Math.PI/n;
    /* crown hair: starts AT the crown (not the brow) so the face stays clear; bulges past the
       skull radius only modestly, offset back (-z) so it reads as hair riding the back/top. */
    const bands=[
      {y:L.crownY-0.06, rx:0.108, rz:0.095, hex:P.hair},
      {y:L.crownY+0.01, rx:0.125, rz:0.100, hex:P.hair},
      {y:L.crownY+0.09, rx:0.105, rz:0.085, hex:P.hairDk},
      {y:L.headTopY+0.09, rx:0.055, rz:0.045, hex:P.hairDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,-0.020), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.headTopY+0.20,-0.035), P.hairDk);
    /* jagged spike quads off the mid rim — windswept, asymmetric read (several, varied) */
    const spikeDirs=[[2,0.11,-0.04],[3,0.09,0.04],[5,0.13,-0.02],[7,0.07,0.03]];
    for(const [i,len,zk] of spikeDirs){
      const base=rings[1][i];
      quad(base, base.clone().add(V(0.025,len*0.5,zk)), base.clone().add(V(0.012,len,zk*1.4)), base, P.hairDk, 0.08);
    }
    /* BEARD — a heavy wedge hanging from the jaw down over the chest, riding PROUD of the chest
       surface (larger radius, pushed +z) the whole way so it never dips inside the torso mesh.
       Chest rx at chestY is 0.295 (skinLt) — the beard's cz must clear that at every band. */
    const bBands=[
      {y:L.jawY,        rx:0.100, rz:0.058, cz:0.100, hex:P.hair},
      {y:L.jawY-0.06,   rx:0.096, rz:0.058, cz:0.155, hex:P.hair},
      {y:L.shldY,       rx:0.082, rz:0.050, cz:0.205, hex:P.hair},
      {y:L.chestY+0.03, rx:0.058, rz:0.040, cz:0.235, hex:P.hairDk},
      {y:L.ribY,        rx:0.030, rz:0.026, cz:0.215, hex:P.hairDk},
    ];
    const bRings=bBands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(bRings, b=>bBands[b].hex);
    capFan(bRings.at(-1), V(0,L.ribY-0.05,0.205), P.hairDk);
  }

  /* FUR PELT — draped over the LEFT shoulder (character's left = -x), a big shaggy mass riding
     proud of the shoulder then hanging down front+back as wide ragged flaps. Sized clearly bigger
     than the pauldron on the other side so it reads as a pelt, not a badge. */
  {
    const n=8, ph=Math.PI/n;
    /* the shoulder mass: a thick fur dome riding up and OUT past the shoulder silhouette */
    const wrap=[
      {y:L.shldY-0.05, rx:0.175, rz:0.165, cx:-0.145, hex:P.furDk},
      {y:L.shldY+0.06, rx:0.165, rz:0.155, cx:-0.155, hex:P.fur},
      {y:L.shldY+0.145,rx:0.115, rz:0.108, cx:-0.150, hex:P.furLt},
    ].map(b=>ring(V(b.cx,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(wrap, ()=>P.fur);
    capFan(wrap.at(-1), V(-0.150,L.shldY+0.22,0.02), P.furLt);
    /* ragged tuft quads off the dome rim for a shaggy (not smooth) silhouette */
    for(const [i,len] of [[1,0.09],[3,0.07],[5,0.10],[6,0.06]]){
      const base=wrap[1][i];
      quad(base, base.clone().add(V(-0.03,len,0.01)), base.clone().add(V(-0.015,len*0.6,0.03)), base, P.furDk, 0.08);
    }
    /* hanging front flap (over the pec, wide and ragged-edged) */
    const fp=[[L.shldY,-0.145,0.155],[0.98,-0.175,0.185],[0.80,-0.195,0.175],[0.60,-0.205,0.150],[0.44,-0.20,0.115]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,x1,z1]=fp[i], [y2,x2,z2]=fp[i+1];
      quad(V(x1-0.075,y1,z1), V(x1+0.06,y1,z1), V(x2+0.055,y2,z2), V(x2-0.08,y2,z2), i%2?P.fur:P.furDk, 0.06);
    }
    /* hanging back flap (over the shoulder blade, -z, equally wide) */
    const bp=[[L.shldY+0.02,-0.16,-0.13],[0.95,-0.19,-0.17],[0.74,-0.205,-0.16],[0.54,-0.195,-0.135]];
    for(let i=0;i<bp.length-1;i++){
      const [y1,x1,z1]=bp[i], [y2,x2,z2]=bp[i+1];
      quad(V(x1+0.075,y1,z1), V(x1-0.06,y1,z1), V(x2-0.055,y2,z2), V(x2+0.08,y2,z2), i%2?P.fur:P.furDk, 0.06);
    }
  }

  /* RIGHT PAULDRON (bare shoulder is the LEFT/fur one — the right gets a small bronze cop) */
  {
    const pivot=V(L.shoulderX, L.shldY+0.01, 0.01);
    stack([
      {y:L.shldY-0.02, rx:0.085, rz:0.090, cx:pivot.x, cz:pivot.z, hex:P.leatherDk},
      {y:L.shldY+0.03, rx:0.068, rz:0.072, cx:pivot.x, cz:pivot.z, hex:P.bronze},
    ], 8, {capTop:{hex:P.bronze, lift:0.02}});
  }

  /* ARMS — both fists derive from the axe grips. Right (forward) hand at GRIP_HI, left (rear) at GRIP_LO.
     Elbows placed on the straight line shoulder->grip (lerp + slight outward bend) so the forearm
     tube tracks the grip axis instead of cutting a sharp "paddle" angle into it. */
  {
    /* right arm: shoulder -> elbow (on the S->GRIP_HI line) -> forward grip */
    const S=V(L.shoulderX, L.shldY-0.02, 0.02);
    const FIST_HI=GRIP_HI.clone();
    const E=S.clone().lerp(FIST_HI, 0.5).add(V(0.05, 0.0, 0.03));
    tube(S,E,0.105,0.082,6,P.skin);
    tube(E,FIST_HI.clone().addScaledVector(AXIS,-0.03),0.078,0.062,6,P.skin);
    tube(FIST_HI.clone().addScaledVector(AXIS,-0.06), FIST_HI.clone().addScaledVector(AXIS,0.06), 0.066,0.060,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    /* left arm: shoulder -> elbow (on the S2->GRIP_LO line) -> rear grip */
    const S2=V(-L.shoulderX, L.shldY-0.02, 0.015);
    const FIST_LO=GRIP_LO.clone();
    const E2=S2.clone().lerp(FIST_LO, 0.5).add(V(0.02, 0.02, 0.02));
    tube(S2,E2,0.100,0.080,6,P.skin);
    tube(E2,FIST_LO.clone().addScaledVector(AXIS,-0.06),0.076,0.062,6,P.skin);
    tube(FIST_LO.clone().addScaledVector(AXIS,-0.06), FIST_LO.clone().addScaledVector(AXIS,0.06), 0.066,0.060,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    /* KNUCKLES + THUMB — F1 backlog: both fists were plain tubes that read SOFT at the hero angle
       (the rear/left grip especially). Author a row of knuckle nubs across the outer face of each
       fist + a short thumb wrap over the haft, so each hand reads as a CLOSED GRIP on the axe, not a
       smooth sleeve. Frame at each grip: gu across the haft (knuckle spread), gv out from the haft. */
    const fistDetail = (FIST)=>{
      const gu = new THREE.Vector3().crossVectors(V(0,1,0), AXIS).normalize();  // across the haft
      const gv = new THREE.Vector3().crossVectors(AXIS, gu).normalize();        // out from the haft (knuckle face)
      // 3 knuckle nubs across the OUTER (gv+) face of the fist
      for(const k of [-1,0,1]){
        const c = FIST.clone().addScaledVector(AXIS, k*0.028).addScaledVector(gv, 0.052);
        tube(c.clone().addScaledVector(gv,-0.010), c.clone().addScaledVector(gv,0.014), 0.018, 0.014, 4, P.skin, {capB:{hex:P.skinDk, lift:0.005}});
      }
      // thumb — a short nub wrapping OVER the haft from the near side (reads as the thumb clamping)
      const tb = FIST.clone().addScaledVector(AXIS, 0.050).addScaledVector(gv, 0.030);
      const tt = tb.clone().addScaledVector(AXIS, -0.040).addScaledVector(gu, -0.030).addScaledVector(gv, 0.006);
      tube(tb, tt, 0.020, 0.015, 4, P.skin, {capB:{hex:P.skinDk, lift:0.004}});
    };
    fistDetail(FIST_HI);
    fistDetail(FIST_LO);
  }

  /* legs — wide, braced aggressive stance (wider stride than the base humanoid) */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.290,0.40,0.13), ankL=V(-0.300,0.085,0.09);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.310,0.40,-0.07), ankR=V( 0.325,0.085,-0.14);
    tube(hipL,kneeL,0.115,0.082,6,P.trouser);
    tube(kneeL,ankL,0.076,0.055,6,P.skin);
    tube(hipR,kneeR,0.115,0.082,6,P.trouser);
    tube(kneeR,ankR,0.076,0.055,6,P.skin);
    /* fur boot cuffs + leather boots */
    for(const [ank,toeDir] of [[ankL,V(0.08,0,1)], [ankR,V(0.85,0,0.32).normalize()]]){
      stack([
        {y:0.03,  rx:0.075, rz:0.082, cx:ank.x, cz:ank.z, hex:P.fur},
        {y:0.095, rx:0.068, rz:0.072, cx:ank.x, cz:ank.z, hex:P.furDk},
      ], 6, {capTop:{hex:P.furLt, lift:0.015}});
      stack([
        {y:0.012, rx:0.072, rz:0.078, cx:ank.x, cz:ank.z, hex:P.bootDk},
        {y:0.075, rx:0.066, rz:0.068, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capBot:{hex:P.bootDk, lift:0.0}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.062,0.046,6,P.boot, {capB:{hex:P.boot, lift:0.015}, raz:0.052, rbz:0.036});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
