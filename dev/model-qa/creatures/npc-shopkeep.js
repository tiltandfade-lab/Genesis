/* dev/model-qa/creatures/npc-shopkeep.js — the friendly town shopkeep (whole-object NPC).
   Same whole-object grammar: one function, one geometry frame, no anchors. No held weapon-style
   prop — the read comes from COSTUME: a waist apron with a contrast panel (chest-to-knee), rolled
   sleeves baring the forearms, a raised open palm (mid-gesture greeting, authored as a bare hand —
   nothing gripped), a folded cloth draped over the other forearm, a slight paunch, and an upright
   friendly posture (the opposite lean of the commoner's stoop). Warm earth cloth tones. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildHead, buildBase } from '../parts.js';

export function buildShopkeep(){
  /* ---------- PALETTE (warm earth — friendly, mercantile, no armor/steel at all) ---------- */
  const P = Object.assign({}, BASE_P, {
    shirt:0xb5754a, shirtDk:0x8a5936, apron:0xc9b98c, apronDk:0x9c8f68,
    sash:0x7a4a30, sashDk:0x5a3623,
    cloth:0xcbb98f, clothDk:0x9c8c68,
    trouser:0x6e5638, boot:0x4a3a26, skin:0xc49a72, skinDk:0x8a6a4e,
  });

  /* ---------- RIG — same landmarks as humanoid.js, upright (no stoop) ---------- */
  const L = humanoidRig();

  /* torso — shirt loft with a slight paunch bulge at the belly (wider ribY/waistY than a fighter) */
  stack([
    {y:L.hipY,   rx:0.205, rz:0.160, hex:P.shirtDk},
    {y:L.waistY, rx:0.220, rz:0.180, hex:P.shirt},   // paunch: waist wider than hip/rib
    {y:L.ribY,   rx:0.212, rz:0.168, hex:P.shirt},
    {y:L.chestY, rx:0.220, rz:0.160, hex:P.shirt},
    {y:L.shldY,  rx:0.218, rz:0.148, hex:P.shirt},
    {y:L.neckY,  rx:0.082, rz:0.078, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* shirt skirt hem (untucked, plain, hangs past the apron waist a touch) */
  stack([
    {y:0.60, rx:0.230, rz:0.185, hex:P.shirtDk},
    {y:L.hipY-0.005, rx:0.212, rz:0.168, hex:P.shirt},
  ], 8, {});

  /* APRON — waist-to-knee, with a contrast center panel from chest-height down to the knee.
     A thin flat panel hugging the front torso surface (z tracks the body's own rz so it never
     flares off the belly), narrowing with the legs below the hip so it never bells outward. */
  {
    /* apron body: bib (chest) to knee, front-hugging (z ~= body surface + a hair of cloth thickness) */
    const bands=[
      {y:0.955, hw:0.100, cz:0.168, hex:P.apronDk},   // bib top (chest, just below the collar)
      {y:L.waistY, hw:0.145, cz:0.190, hex:P.apron},  // waist (body's widest point here)
      {y:0.60,  hw:0.130, cz:0.175, hex:P.apron},     // hip — narrows, tracks the leg taper
      {y:0.36,  hw:0.105, cz:0.155, hex:P.apronDk},   // knee hem — narrower still
    ];
    for(let i=0;i<bands.length-1;i++){
      const a=bands[i], b=bands[i+1];
      const aL=V(-a.hw,a.y,a.cz), aR=V(a.hw,a.y,a.cz), bL=V(-b.hw,b.y,b.cz), bR=V(b.hw,b.y,b.cz);
      quad(aL,aR,bR,bL, i%2? P.apron : P.apronDk, 0.05);            // front face
      quad(aR,aL,bL,bR, i%2? P.apronDk : P.apron, 0.05);            // back face (thin panel, both sides shaded)
    }
    /* contrast center panel: chest to knee, narrower, laid just proud (+0.006z) of the apron body */
    const cbands=[
      {y:0.955, hw:0.032, cz:0.174},
      {y:L.waistY, hw:0.040, cz:0.196},
      {y:0.60,  hw:0.036, cz:0.181},
      {y:0.36,  hw:0.030, cz:0.161},
    ];
    for(let i=0;i<cbands.length-1;i++){
      const a=cbands[i], b=cbands[i+1];
      const aL=V(-a.hw,a.y,a.cz), aR=V(a.hw,a.y,a.cz), bL=V(-b.hw,b.y,b.cz), bR=V(b.hw,b.y,b.cz);
      quad(aL,aR,bR,bL, P.sash, 0.04);
    }
    /* neck strap (two thin tubes from the bib top over each shoulder to the back of the neck) */
    tube(V(-0.045,0.955,0.170), V(-0.05,L.shldY+0.015,0.06), 0.009,0.009,5,P.sashDk);
    tube(V( 0.045,0.955,0.170), V( 0.05,L.shldY+0.015,0.06), 0.009,0.009,5,P.sashDk);
    /* waist tie band hugging the body (not flared) + a small knot at the side */
    stack([
      {y:L.waistY-0.015, rx:0.182, rz:0.148, hex:P.sashDk},
      {y:L.waistY+0.015, rx:0.180, rz:0.146, hex:P.sash},
    ], 8, {});
    tube(V(-0.06,L.waistY,-0.145), V(0.03,L.waistY-0.03,-0.165), 0.013,0.011,5,P.sash,{capB:{hex:P.sashDk}});
  }

  /* head — shared module */
  buildHead(L, P);

  /* simple soft cap / bare head with tidy hair band (kept minimal — the apron does the talking) */
  {
    const b1=ring(V(0,L.crownY-0.02,0), V(0,1,0), 0.092, 0.084, 8, Math.PI/8);
    const b2=ring(V(0,L.crownY+0.03,0), V(0,1,0), 0.086, 0.078, 8, Math.PI/8);
    stitch([b1,b2], ()=>P.skinDk);   // close-cropped hair cap, reads as hair not headwear
  }

  /* CLOTH FIRST (draped over the LEFT forearm) — authored before the arm so the forearm fits under it */
  const CLOTH_ELBOW = V(-0.30, 0.86, 0.05);
  const CLOTH_WRIST  = V(-0.255, 0.665, 0.145);
  {
    /* A folded cloth draped OVER the forearm: the fold-ridge runs along the forearm (elbow->wrist)
       and rests on top of it, with the fabric hanging DOWN off the front and outer side. The ridge
       reaches all the way to the fist so the fist visibly grips the fold — no floating gap. */
    /* fold ridge endpoints: just past the elbow, down to just over the fist (a hair proud of the arm top) */
    const ridgeE = CLOTH_ELBOW.clone().add(V(0.0, 0.030, 0.010));           // over the arm near the elbow
    const ridgeW = CLOTH_WRIST.clone().add(V(0.0, 0.030, 0.010));           // over the fist at the wrist
    /* the fabric hangs down-and-outward (toward -x, forward +z) from the ridge */
    const dropOut = V(-0.075, 0.0, 0.055);   // outer hem offset from the ridge
    const dropDn  = V(-0.010,-0.185, 0.010);  // how far the hem falls
    const heE = ridgeE.clone().add(dropOut).add(dropDn);
    const heW = ridgeW.clone().add(dropOut).add(dropDn).add(V(0.010,0.020,0.0)); // wrist hem a touch higher/tucked
    /* front/outer face of the drape (ridge line -> hanging hem) */
    quad(ridgeE, ridgeW, heW, heE, P.cloth, 0.05);
    /* inner face (the fold's other side, tucked against the arm, darker) */
    const inE = ridgeE.clone().add(V(0.045,0.0,-0.045)), inW = ridgeW.clone().add(V(0.045,0.0,-0.045));
    quad(ridgeW, ridgeE, inE, inW, P.clothDk, 0.05);
    /* hem cap connecting the two faces along the bottom (gives the drape thickness, closes the fold) */
    quad(heE, heW, inW.clone().add(V(0,-0.05,0)), inE.clone().add(V(0,-0.05,0)), P.clothDk, 0.04);
    /* a short apron of fabric that falls straight down past the fist (reads as the held cloth's tail) */
    const tTop = ridgeW.clone().add(V(-0.03,0.0,0.03));
    quad(tTop.clone().add(V(-0.05,0,0)), tTop.clone().add(V(0.05,0,0)),
         tTop.clone().add(V(0.045,-0.16,0.005)), tTop.clone().add(V(-0.055,-0.16,0.005)), P.cloth, 0.05);
  }

  /* arms — RIGHT raised mid-gesture (open palm, no item); LEFT bears the cloth on the forearm.
     Rolled sleeves on both: sleeve fabric stops above the elbow, bare skin forearm below. */
  {
    /* right: shoulder -> elbow (sleeve) -> raised wrist (skin) -> open palm */
    const S=V(L.shoulderX, L.shldY-0.01, 0.015), E=V(0.30,1.02,0.10), W=V(0.255,1.24,0.20);
    tube(S,E,0.078,0.062,6,P.shirt,{capB:{hex:P.shirtDk}});          // rolled sleeve, ends above elbow
    tube(E,W,0.052,0.044,6,P.skin);                                  // bare forearm, skin
    /* open palm: a flattened hand block, fingers spread slightly (a small fan of quads) */
    const palmC=W.clone().add(V(-0.01,0.055,0.03));
    const up=V(0,1,0), pu=V(1,0,0), pv=new THREE.Vector3().crossVectors(up,pu).normalize();
    quad(palmC.clone().add(V(-0.04,0,-0.012)), palmC.clone().add(V(0.04,0,-0.012)),
         palmC.clone().add(V(0.035,0.075,0.01)), palmC.clone().add(V(-0.035,0.075,0.01)), P.skin, 0.03);   // palm face
    for(const fx of [-0.03,-0.01,0.01,0.03]){
      tube(palmC.clone().add(V(fx,0.07,0.0)), palmC.clone().add(V(fx*1.15,0.115,0.006)), 0.010,0.008,4,P.skin,{capB:{hex:P.skin}});
    }
    tube(palmC.clone().add(V(-0.045,-0.005,0.0)), palmC.clone().add(V(-0.06,0.03,0.01)), 0.012,0.009,4,P.skin,{capB:{hex:P.skin}}); // thumb

    /* left: shoulder -> elbow (sleeve, at CLOTH_ELBOW) -> wrist (skin, at CLOTH_WRIST, under the cloth) */
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.015);
    tube(S2,CLOTH_ELBOW,0.078,0.062,6,P.shirt,{capB:{hex:P.shirtDk}});
    tube(CLOTH_ELBOW,CLOTH_WRIST,0.052,0.044,6,P.skin,{capB:{hex:P.skin}});
    /* a loose fist supporting the cloth's weight */
    tube(CLOTH_WRIST.clone().add(V(-0.03,-0.01,-0.02)), CLOTH_WRIST.clone().add(V(0.03,0.02,0.025)), 0.036,0.034,5,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* legs — plain trouser + simple shoes, upright friendly stance */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.11,0.40,0.01), ankL=V(-0.10,0.08,0.00);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.115,0.40,-0.005), ankR=V( 0.105,0.08,-0.01);
    tube(hipL,kneeL,0.082,0.058,6,P.trouser);
    tube(kneeL,ankL,0.054,0.040,6,P.trouser);
    tube(hipR,kneeR,0.082,0.058,6,P.trouser);
    tube(kneeR,ankR,0.054,0.040,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.05,0,1)], [ankR,V(-0.05,0,1)]]){
      stack([
        {y:0.010, rx:0.060, rz:0.068, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.055, rx:0.054, rz:0.058, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.004}});
      const toeA=V(ank.x,0.045,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.118), 0.050,0.038,6,P.boot, {capB:{hex:P.boot, lift:0.012}, raz:0.042, rbz:0.030});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
