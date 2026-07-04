/* dev/model-qa/creatures/mon-fishfolk-whip.js — FISH-FOLK WHIP-WIELDER (bespoke aberration-adjacent
   biped, Medium). Shares the mon-fishfolk.js base silhouette (hunched piscine humanoid: fish head,
   gills, scaled body, webbed clawed off-hand) but the right hand grips a coiled BARBED WHIP instead
   of bare claws — a long tapering lash coiled in loops near the fist, with small dark barb tubes
   studding it. Grey-green scales, pale belly. Whole-object grammar: one function, one geometry
   frame, no anchors. NO eye quads (dark socket recesses only). Base disc r=0.42 (Medium).
   Weapon-swap variant of the fish-folk base (docs/CREATURE-MODELS-P2.md §5, Wave 3). */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildFishFolkWhip(){
  /* ---------- PALETTE (VS desaturated; grey-green mottled scale, pale belly, dull iron whip) ---------- */
  const P = {
    scale:0x5a6a5c, scaleDk:0x3d4a3f, scaleLt:0x74846f,        // grey-green scale body
    mottleA:0x4c5c50, mottleB:0x687862,                         // dorsal mottle
    belly:0x9ba892, bellyDk:0x7a8877,                           // pale belly
    fin:0x455448, finDk:0x2e3a30,                               // dorsal/back fin
    head:0x566658, headDk:0x394536,
    gill:0x6e4a48, gillDk:0x3f2a29,                             // dull red-brown gill slits
    mouth:0x241d1c, tooth:0xcfc8b0,
    socket:0x171512,                                            // dark eye-socket recess
    web:0x516152, webDk:0x35422f,                                // webbed off-hand membrane
    claw:0x221e19,
    lash:0x40382c, lashDk:0x241f18, lashLt:0x584c3a,            // dull hide-wrapped whip cord
    barb:0x28241c,                                              // dark iron barbs studding the lash
    disc:0x453f38, discTop:0x534c44,
  };

  /* ---------- LANDMARKS — stooped biped, spine along +z-lean/+y, hunched forward slightly. ---------- */
  const L = {
    hipY:0.62, waistY:0.72, chestY:0.86, shldY:0.96, neckY:1.00,
    jawY:1.03, snoutY:1.055, browY:1.12, crownY:1.20,
    hipHalf:0.135, shoulderX:0.235,
  };
  const stoop = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.16);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — scaled loft, hips to shoulders, mottled banding. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.150, rz:0.130, hex:P.scaleDk},
      {y:L.waistY, rx:0.175, rz:0.150, hex:P.scale},
      {y:L.chestY, rx:0.205, rz:0.170, hex:P.mottleA},
      {y:L.shldY,  rx:0.225, rz:0.175, hex:P.mottleB},
      {y:L.neckY,  rx:0.115, rz:0.110, hex:P.scaleDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph).map(stoop));
    stitch(rings, b=>bands[b].hex);
    quad(stoop(V(-0.09,L.hipY,0.12)), stoop(V(0.09,L.hipY,0.12)),
         stoop(V(0.10,L.chestY,0.16)), stoop(V(-0.10,L.chestY,0.16)), P.belly, 0.05);
    for(const [y0,y1] of [[L.hipY+0.02,L.waistY+0.03],[L.waistY+0.03,L.chestY+0.04],[L.chestY+0.04,L.shldY+0.02]]){
      const b0 = stoop(V(0,y0,-0.14)), b1 = stoop(V(0,y1,-0.16));
      const t0 = stoop(V(0,y0+0.09,-0.13)), t1 = stoop(V(0,y1+0.10,-0.15));
      quad(b0,b1,t1,t0,P.fin,0.06);
    }
  }

  /* ---------- HEAD — fish head: wide toothy mouth, gill slits, dark socket recesses, no lids. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.135, rz:0.155, hex:P.head},
      {y:L.snoutY, rx:0.150, rz:0.170, hex:P.headDk},
      {y:L.browY,  rx:0.125, rz:0.120, hex:P.head},
      {y:L.crownY, rx:0.078, rz:0.072, hex:P.headDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(stoop));
    for(const i of [1,2]){ rings[1][i].z += 0.020; }
    for(const i of [0,3]){ rings[2][i].y -= 0.012; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.08);
      }
    }
    capFan(rings.at(-1), stoop(V(0,L.crownY+0.07,0.0)), P.headDk);

    for(const s of [-1,1]){
      const c = stoop(V(s*0.075, L.browY-0.01, 0.115));
      quad(c.clone().add(V(-0.020,-0.014,0)), c.clone().add(V(0.020,-0.014,0)),
           c.clone().add(V(0.016,0.014,-0.010)), c.clone().add(V(-0.016,0.014,-0.010)), P.socket, 0.0);
    }

    {
      const ml = stoop(V(-0.115,L.jawY-0.02,0.155));
      const mr = stoop(V( 0.115,L.jawY-0.02,0.155));
      const mlB = stoop(V(-0.100,L.jawY-0.055,0.165));
      const mrB = stoop(V( 0.100,L.jawY-0.055,0.165));
      quad(ml,mr,mrB,mlB,P.mouth,0.04);
      for(let i=0;i<6;i++){
        const t = -0.10 + i*0.20/5;
        const tb = stoop(V(t,L.jawY-0.025,0.158));
        const tt = tb.clone().add(V(0,-0.020,0.004));
        quad(tb.clone().add(V(-0.010,0,0)), tb.clone().add(V(0.010,0,0)), tt.clone().add(V(0.006,0,0)), tt.clone().add(V(-0.006,0,0)), P.tooth, 0.05);
      }
    }

    for(const s of [-1,1]){
      for(let k=0;k<3;k++){
        const cy = L.snoutY+0.03 - k*0.045;
        const cx = s*0.145;
        const b0 = stoop(V(cx, cy, 0.06));
        const b1 = stoop(V(cx, cy-0.026, 0.075));
        const off = stoop(V(cx+s*0.018, cy-0.010, 0.06)).sub(stoop(V(cx,cy-0.010,0.06)));
        quad(b0, b0.clone().add(off), b1.clone().add(off), b1, k%2?P.gill:P.gillDk, 0.06);
      }
    }
  }

  /* ---------- COILED BARBED WHIP FIRST — gripped in the RIGHT fist, held low/out; the tapering
     lash coils in tightening loops near the fist with small dark barb tubes studding it. Grip is
     ground truth (the right arm/fist derives from it), like the bugbear's club. ---------- */
  const GRIP = V(0.335, 0.66, 0.10);
  {
    /* coiled loops — 3 shrinking rings hanging in front of/below the grip, tilted slightly */
    const coilN = 10;
    let prevRing = null;
    const coilCenters = [
      {c:V(0.36,0.58,0.20), rx:0.115, rz:0.100},
      {c:V(0.37,0.50,0.24), rx:0.088, rz:0.078},
      {c:V(0.375,0.435,0.27), rx:0.062, rz:0.056},
    ];
    for(const {c,rx,rz} of coilCenters){
      const rg = ring(c, V(0.15,0,1), rx, rz, coilN, Math.PI/coilN);
      if(prevRing) stitch([prevRing, rg], ()=>P.lash);
      prevRing = rg;
      /* a few barb tubes studding this loop */
      for(let k=0;k<3;k++){
        const idx = Math.floor(k*coilN/3);
        const base = rg[idx];
        const outward = base.clone().sub(c).normalize();
        const tip = base.clone().addScaledVector(outward, 0.045);
        tube(base, tip, 0.010, 0.003, 4, P.barb, {capB:{hex:P.barb, lift:0.003}});
      }
    }
    /* lash trailing tip past the last coil, tapering thin */
    const tailA = coilCenters.at(-1).c.clone().add(V(0.01,-0.06,0.03));
    const tailB = tailA.clone().add(V(0.03,-0.09,0.05));
    const tailC = tailB.clone().add(V(0.02,-0.06,0.04));
    tube(tailA, tailB, 0.030, 0.016, 6, P.lashDk);
    tube(tailB, tailC, 0.016, 0.005, 5, P.lashDk, {capB:{hex:P.lashDk, lift:0.003}});

    /* haft/grip section from GRIP up into the fist — a short wrapped hide handle */
    const HTOP = coilCenters[0].c.clone().add(V(-0.01,0.07,-0.06));
    tube(GRIP.clone().add(V(0,-0.05,0)), GRIP.clone().add(V(0,0.05,0)), 0.030, 0.028, 6, P.lashLt,
      {capA:{hex:P.lashDk}});
    tube(GRIP.clone().add(V(0,0.05,0)), HTOP, 0.028, 0.034, 6, P.lash);
  }

  /* ---------- ARMS — right derives to the whip grip (holds cocked, low/out); left keeps the
     webbed clawed hand from the base fish-folk, held slightly forward. ---------- */
  {
    /* right arm -> whip fist */
    const S = stoop(V(L.shoulderX, L.shldY-0.01, 0.01));
    const E = V(0.300, L.hipY+0.10, 0.16);
    tube(S,E,0.062,0.050,6,P.scale);
    tube(E, GRIP.clone().add(V(0,0.06,-0.03)), 0.048,0.038,6,P.mottleA);
    /* gripping webbed hand around the haft */
    tube(GRIP.clone().add(V(0,0.07,-0.02)), GRIP.clone().add(V(0,-0.04,0.02)), 0.042,0.036,5,P.web,
      {capA:{hex:P.webDk}, capB:{hex:P.webDk}});

    /* left arm -> webbed clawed hand, held forward/out */
    const S2 = stoop(V(-L.shoulderX, L.shldY-0.01, 0.01));
    const E2 = V(-0.315, L.hipY+0.06, 0.14);
    const W2 = V(-0.330, L.hipY-0.14, 0.20);
    tube(S2,E2,0.062,0.048,6,P.scale);
    tube(E2,W2,0.046,0.036,6,P.mottleA);
    const palm = W2.clone().add(V(0,-0.02,0.03));
    tube(palm.clone().add(V(0,0.02,-0.02)), palm.clone().add(V(0,-0.02,0.02)), 0.040,0.036,5,P.web,
      {capA:{hex:P.webDk}, capB:{hex:P.webDk}});
    const tips = [];
    for(const [dx,dz] of [[-0.045,0.05],[-0.020,0.075],[0.010,0.075],[0.035,0.055]]){
      const cb = palm.clone().add(V(0,-0.01,0.02));
      const ct = cb.clone().add(V(dx,-0.015,dz));
      tube(cb, ct, 0.014,0.005,4,P.web,{capB:{hex:P.claw, lift:0.004}});
      tips.push(ct);
    }
    for(let i=0;i<tips.length-1;i++){
      const base = palm.clone().add(V(0,-0.01,0.02));
      quad(base, tips[i], tips[i+1], base, P.web, 0.05);
    }
  }

  /* ---------- LEGS — thick, digitigrade-ish, scaled, planted stooped/wide. ---------- */
  {
    const leg=(side)=>{
      const hip = V(side*L.hipHalf, L.hipY-0.02, 0.0);
      const knee = V(side*0.150, 0.32, 0.05);
      const ank = V(side*0.135, 0.10, -0.01);
      const foot = V(side*0.135, 0.045, 0.09);
      tube(hip, knee, 0.088, 0.066, 6, P.scale);
      tube(knee, ank, 0.062, 0.044, 6, P.mottleA);
      tube(ank, foot, 0.044, 0.040, 5, P.mottleB, {capB:{hex:P.webDk, lift:0.006}});
      for(const [dx,dz] of [[side*0.03,0.06],[0,0.075],[-side*0.03,0.06]]){
        const tb = foot.clone().add(V(0,-0.01,0.01));
        const tt = tb.clone().add(V(dx,-0.012,dz));
        tube(tb,tt,0.014,0.005,4,P.web,{capB:{hex:P.claw, lift:0.004}});
      }
    };
    leg(-1); leg(1);
  }

  setChannels({ [P.scale]:'scale', [P.scaleDk]:'scale', [P.scaleLt]:'scale',
    [P.mottleA]:'scale', [P.mottleB]:'scale', [P.head]:'scale', [P.headDk]:'scale',
    [P.web]:'skin', [P.webDk]:'skin', [P.belly]:'skin', [P.bellyDk]:'skin',
    [P.lash]:'leather', [P.lashDk]:'leather', [P.lashLt]:'leather', [P.barb]:'metal' });

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
