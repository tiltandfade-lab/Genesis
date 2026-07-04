/* dev/model-qa/creatures/mon-cambion.js — the CAMBION (bespoke WINGED HUMANOID, Medium Fiend).
   docs/CREATURE-MODELS-P2.md Wave 4: a muscular half-fiend warrior — humanoid frame, leathery bat
   wings off the shoulders, curved horns sweeping back off the brow, a barbed tail lashing behind,
   holding a spear couched forward-ready. Red-brown desaturated skin (VS palette, mottled), dark
   wing membrane, dark horn/barb. Seeds the winged-humanoid base (erinyes/succubus/incubus lift
   from it later). NO eye quads (house ruling). Whole-object grammar: one function, one geometry
   frame, no anchors. Medium size: base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildCambion(){
  /* ---------- PALETTE (VS desaturated; red-brown mottled skin, dark wing/horn/barb) ---------- */
  const P = {
    skin:0x7a4438, skinDk:0x5a2f28, skinLt:0x8f5648,           // red-brown fiend hide
    mottleA:0x6c3c33, mottleB:0x854c3e,                        // dorsal mottle bands
    horn:0x2b211c, hornLt:0x413129,                            // dark curved horns
    wing:0x2c2320, wingDk:0x1c1613, wingBone:0x3f322a,         // dark leathery membrane + bone struts
    barb:0x241b17,                                             // tail barb
    wood:0x4a3a28, woodDk:0x332619, metal:0x6a6a68, metalDk:0x3c3c3a, // spear haft/head
    claw:0x1c1512,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin', [P.mottleA]:'skin', [P.mottleB]:'skin',
    [P.horn]:'bone', [P.hornLt]:'bone', [P.barb]:'bone', [P.claw]:'bone',
    [P.wing]:'leather', [P.wingDk]:'leather', [P.wingBone]:'bone',
    [P.wood]:'wood', [P.woodDk]:'wood', [P.metal]:'metal', [P.metalDk]:'metal',
  });

  /* ---------- LANDMARKS — upright humanoid spine, chest thrust forward (warrior stance). ---------- */
  const L = {
    hipY:0.44, waistY:0.54, chestY:0.66, shldY:0.76, neckY:0.80,
    jawY:0.83, browY:0.90, crownY:0.965,
  };

  /* ---------- TORSO — muscular humanoid barrel, one vertical loft. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.150, rz:0.115, hex:P.skinDk},
      {y:L.waistY, rx:0.155, rz:0.118, hex:P.mottleA},
      {y:L.chestY, rx:0.195, rz:0.135, hex:P.skin},      // broad warrior chest
      {y:L.shldY,  rx:0.205, rz:0.130, hex:P.mottleB},
      {y:L.neckY,  rx:0.088, rz:0.078, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
  }

  /* ---------- HEAD — angular fiendish face, brow ridge, no eye quads (socket recess only). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   cz:0.01, rx:0.088, rz:0.092, hex:P.skin},
      {y:L.browY,  cz:0.02, rx:0.100, rz:0.098, hex:P.skinLt},
      {y:L.crownY, cz:0.00, rx:0.078, rz:0.076, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.crownY+0.055, 0.00), P.skinDk);
    /* dark socket recesses (shape, not painted eyes) */
    for(const s of [-1,1]){
      quad(V(s*0.055,L.browY+0.01,0.085), V(s*0.075,L.browY+0.01,0.078),
           V(s*0.072,L.browY-0.025,0.082), V(s*0.052,L.browY-0.025,0.088), P.skinDk, 0.02);
    }
    /* dark grim mouth line */
    quad(V(-0.035,L.jawY-0.045,0.088), V(0.035,L.jawY-0.045,0.088),
         V(0.028,L.jawY-0.055,0.086), V(-0.028,L.jawY-0.055,0.086), P.skinDk, 0.03);

    /* CURVED HORNS — sweep back off the brow, tapering, arcing up and behind the skull. */
    for(const s of [-1,1]){
      const b0 = V(s*0.055, L.browY+0.03, 0.02);
      const b1 = V(s*0.095, L.browY+0.14, -0.03);
      const b2 = V(s*0.100, L.crownY+0.20, -0.10);
      const tip= V(s*0.075, L.crownY+0.24, -0.16);
      tube(b0, b1, 0.030, 0.022, 5, P.horn, {capA:{hex:P.hornLt}});
      tube(b1, b2, 0.022, 0.013, 5, P.hornLt);
      tube(b2, tip,0.013, 0.004, 5, P.horn, {capB:{hex:P.horn, lift:0.004}});
    }
  }

  /* ---------- ARMS — right arm couches a spear forward, left arm braced back/down. ---------- */
  {
    /* right arm: shoulder -> elbow -> gripping hand, spear held forward-ready */
    const rS = V(0.185, L.shldY-0.02, 0.00);
    const rE = V(0.245, L.chestY-0.14, 0.14);
    const rH = V(0.220, L.hipY+0.10, 0.30);
    tube(rS, rE, 0.058, 0.046, 6, P.skin);
    tube(rE, rH, 0.046, 0.036, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.006}});

    /* left arm: braced down/back, gripping the haft's rear */
    const lS = V(-0.185, L.shldY-0.02, 0.00);
    const lE = V(-0.220, L.chestY-0.20, -0.10);
    const lH = V(-0.170, L.hipY-0.02, -0.28);
    tube(lS, lE, 0.058, 0.046, 6, P.skin);
    tube(lE, lH, 0.046, 0.034, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.006}});

    /* SPEAR — long haft through both grips, metal leaf-blade head projecting forward. */
    const shaftBack = V(-0.230, L.hipY-0.04, -0.42);
    const shaftFront= V(0.260, L.hipY+0.16, 0.62);
    tube(shaftBack, shaftFront, 0.024, 0.020, 6, P.wood, {capA:{hex:P.woodDk}});
    const bladeMid = V(0.290, L.hipY+0.20, 0.78);
    const bladeTip = V(0.320, L.hipY+0.24, 1.00);
    tube(shaftFront, bladeMid, 0.020, 0.036, 5, P.metalDk);
    tube(bladeMid, bladeTip, 0.036, 0.004, 5, P.metal, {capB:{hex:P.metal, lift:0.004}});
  }

  /* ---------- LEGS — braced warrior stance, clawed feet. ---------- */
  {
    const leg=(hipX)=>{
      const hip  = V(hipX, L.hipY-0.02, 0.00);
      const knee = V(hipX*1.08, 0.24, 0.05);
      const foot = V(hipX*1.05, 0.045, 0.10);
      tube(hip, knee, 0.086, 0.062, 6, P.skin);
      tube(knee, foot, 0.060, 0.044, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.006}});
      /* clawed toes */
      const pad = V(foot.x, 0.03, foot.z+0.03);
      for(const dx of [-0.03,0,0.03]){
        const cb = V(pad.x+dx, 0.035, pad.z);
        const ct = V(pad.x+dx, 0.008, pad.z+0.05);
        tube(cb, ct, 0.014, 0.004, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    leg(-0.105);
    leg( 0.105);
  }

  /* ---------- WINGS — leathery bat wings off the shoulders, half-spread, rising above the head. --- */
  {
    const wing=(side)=>{
      const root = V(side*0.12, L.shldY+0.03, -0.03);
      const shoulder = V(side*0.24, L.shldY+0.16, -0.06);
      const f1 = V(side*0.44, L.crownY+0.34, -0.14);   // top spar — arcs above the head
      const f2 = V(side*0.62, L.shldY+0.20, -0.28);
      const f3 = V(side*0.60, L.waistY-0.04, -0.36);   // bottom spar — trails to waist height

      tube(root, shoulder, 0.036, 0.028, 5, P.wingBone);
      tube(shoulder, f1, 0.028, 0.010, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});
      tube(shoulder, f2, 0.026, 0.009, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});
      tube(shoulder, f3, 0.022, 0.008, 4, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});

      quad(shoulder, f1, f2, shoulder, P.wing, 0.10);
      quad(shoulder, f2, f3, shoulder, P.wingDk, 0.10);
      /* trailing membrane skirt back down toward the body */
      const trail = V(side*0.30, L.waistY-0.10, -0.22);
      quad(shoulder, f3, trail, root, P.wingDk, 0.10);
    };
    wing(-1); wing(1);
  }

  /* ---------- TAIL — barbed fiend tail, roots at the hip, lashes back and up. ---------- */
  {
    const t0 = V(0, L.hipY-0.10, -0.14);
    const t1 = V(0, L.hipY-0.14, -0.34);
    const t2 = V(0.05, L.hipY-0.06, -0.52);
    const t3 = V(0.12, L.hipY+0.14, -0.60);
    const tip= V(0.16, L.hipY+0.30, -0.56);
    tube(t0, t1, 0.045, 0.036, 6, P.skinDk, {capA:{hex:P.skinDk}});
    tube(t1, t2, 0.036, 0.026, 6, P.mottleA);
    tube(t2, t3, 0.026, 0.015, 6, P.skinDk);
    tube(t3, tip,0.015, 0.005, 5, P.barb, {capB:{hex:P.barb, lift:0.004}});
    /* small barb spur near the tip */
    const spurBase = V(0.10, L.hipY+0.22, -0.60);
    const spurTip  = V(0.16, L.hipY+0.30, -0.68);
    tube(spurBase, spurTip, 0.010, 0.003, 4, P.barb, {capB:{hex:P.barb, lift:0.003}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
