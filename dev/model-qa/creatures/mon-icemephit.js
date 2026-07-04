/* dev/model-qa/creatures/mon-icemephit.js — the ICE MEPHIT (bespoke Small flyer, imp silhouette).
   Adam's QA-review ruling 2026-07-04: build a bespoke Small flyer — imp silhouette, ice-blue palette,
   small wings. The bestiary ice-mephit is a Small Elemental (a spiteful winged imp of living ice/frost).
   The read: a small hunched IMP biped — pot-bellied little body, a lean grinning head with two swept
   HORNS + a wide fanged mouth, spindly clawed arms + legs, a thin barbed tail, and a pair of small
   membranous BAT-WINGS raised behind the shoulders. Everything in ICE tones: pale glacial blue-white
   with darker teal recesses + a few bright frost-rime highlight edges (tagged "glow" so the rime reads
   bright through the shader). Held low, hovering just off the disc (feet dangling / toes brushing).
   NO eye quads (house eye ruling reversed 2026-07-04). Whole-object grammar: one function, one
   geometry frame, no anchors. Small: ~0.95u tall, base disc r=0.32. Imported by the probe + sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildIceMephit(){
  /* ---------- PALETTE (glacial blue-white ice; teal recesses; bright frost-rime edges) ---------- */
  const P = {
    ice:0x9fc4d6, iceDk:0x5c8298, iceLt:0xc8e4ef,             // pale glacial blue body
    teal:0x3f6474, tealDk:0x2b4653,                            // deep recess / belly shadow
    rime:0xe6f6ff,                                             // bright frost-rime highlight ("glow" channel)
    horn:0x6e8fa0, hornTip:0xd8ecf4, claw:0x37525f,
    wing:0x6f97ab, wingDk:0x466879, wingMemb:0x84b0c2,        // membranous ice wings
    mouth:0x22333c, fang:0xeaf7ff,
    disc:0x4a4038, discTop:0x585047,
  };
  // Tag the bright frost-rime + fang + horn-tip hexes on the "glow" channel so the shader renders
  // them bright (the frost-rime read). The body ice tones stay untagged (classifier decides).
  setChannels({ [P.rime]:"glow", [P.hornTip]:"glow", [P.fang]:"glow" });

  /* ---------- LANDMARKS — small hunched imp, hovering. Pot belly, lean head. ~0.95u top. ---------- */
  const L = {
    hipY:0.360, waistY:0.400, bellyY:0.440, chestY:0.500, shldY:0.545, neckY:0.575,
    hipHalf:0.078, shoulderX:0.130,
    jawY:0.600, cheekY:0.660, browY:0.720, crownY:0.795, headTopY:0.850,
  };

  /* ---------- TORSO — a small POT-BELLIED loft; belly bulges (imp read), tapers to a thin neck. --- */
  stack([
    {y:L.hipY,    rx:0.098, rz:0.086, hex:P.iceDk},
    {y:L.waistY,  rx:0.110, rz:0.096, hex:P.ice},
    {y:L.bellyY,  rx:0.128, rz:0.112, hex:P.ice},    // belly bulge
    {y:L.chestY,  rx:0.110, rz:0.092, hex:P.ice},
    {y:L.shldY,   rx:0.100, rz:0.082, hex:P.iceDk},
    {y:L.neckY,   rx:0.048, rz:0.046, hex:P.iceDk},
  ], 9, {capBot:{hex:P.tealDk, lift:0.006}, capTop:{hex:P.iceDk, lift:0.004}});
  /* teal belly-shadow patch on the underside + a couple of bright rime cracks down the chest */
  quad(V(-0.070,L.hipY+0.02,0.088), V(0.070,L.hipY+0.02,0.088), V(0.090,L.bellyY,0.110), V(-0.090,L.bellyY,0.110), P.teal, 0.05);
  for(const s of [-1,1]) quad(V(s*0.02-0.006,L.chestY,0.100), V(s*0.02+0.006,L.chestY,0.100),
                              V(s*0.03+0.004,L.bellyY,0.116), V(s*0.03-0.004,L.bellyY,0.116), P.rime, 0.02);

  /* ---------- HEAD — lean grinning imp skull with a wide fanged mouth + two swept horns. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.066, rz:0.074, hex:P.ice},
      {y:L.cheekY, rx:0.098, rz:0.098, hex:P.ice},
      {y:L.browY,  rx:0.104, rz:0.094, hex:P.iceLt},
      {y:L.crownY, rx:0.078, rz:0.068, hex:P.iceDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[2][i].z += 0.010;          // brow ridge push
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(0, L.headTopY, 0.004), P.iceDk);

    /* WIDE FANGED MOUTH — a dark grin band across the lower face + a row of pale ice fangs. */
    const my=L.jawY+0.018;
    quad(V(-0.058,my+0.012,0.092), V(0.058,my+0.012,0.092),
         V(0.050,my-0.020,0.086), V(-0.050,my-0.020,0.086), P.mouth, 0.02);
    for(let k=-2;k<=2;k++){
      const fx=k*0.024;
      quad(V(fx-0.008,my+0.008,0.098), V(fx+0.008,my+0.008,0.098),
           V(fx+0.004,my-0.020,0.096), V(fx-0.004,my-0.020,0.096), P.fang, 0.0);   // upper fangs (glow)
    }

    /* TWO SWEPT HORNS — back-swept curved horns off the crown (the imp signature), rime-tipped. */
    for(const s of [-1,1]){
      const hb = V(s*0.058, L.crownY-0.008, -0.010);
      const hm = V(s*0.098, L.crownY+0.070, -0.070);
      const ht = V(s*0.120, L.crownY+0.120, -0.150);
      tube(hb, hm, 0.024, 0.015, 5, P.horn);
      tube(hm, ht, 0.015, 0.005, 5, P.horn, {capB:{hex:P.hornTip, lift:0.006}});   // rime-tipped (glow)
    }
    /* a couple of frost-rime spikes off the cheeks (frosty read) */
    for(const s of [-1,1]){
      const rb=V(s*0.098,L.cheekY,0.030), rt=V(s*0.150,L.cheekY+0.010,-0.010);
      tube(rb, rt, 0.014, 0.003, 4, P.iceLt, {capB:{hex:P.rime, lift:0.004}});
    }
  }

  /* ---------- WINGS — a pair of small membranous BAT-WINGS raised behind the shoulders. Each is a
     leading-edge spar (shoulder→elbow→wrist) with 2 finger spars + a translucent-ish ice membrane. --- */
  function wing(s){
    const SH = V(s*0.075, L.shldY+0.02, -0.05);
    const EL = V(s*0.24, L.shldY+0.16, -0.14);
    const WR = V(s*0.34, L.shldY+0.30, -0.16);
    tube(SH, EL, 0.026, 0.018, 5, P.wing, {capA:{hex:P.wingDk}});
    tube(EL, WR, 0.017, 0.010, 5, P.wing);
    // two finger spars fanning down/back from the wrist + a small elbow spar
    const F1 = V(s*0.30, L.shldY+0.06, -0.10);       // lower finger (toward the elbow)
    const F2 = V(s*0.42, L.shldY+0.20, -0.20);       // outer wingtip
    const F3 = V(s*0.24, L.shldY+0.34, -0.18);       // topmost
    for(const [a,b] of [[WR,F1],[WR,F2],[WR,F3]]) tube(a, b, 0.011, 0.004, 4, P.wingDk, {capB:{hex:P.wingDk}});
    // membrane panels (staggered quads between the spars) — pale ice membrane
    quad(EL, WR, F1, EL.clone().lerp(F1,0.5), P.wingMemb, 0.05);
    quad(WR, F2, F1, WR, P.wingMemb, 0.05);
    quad(WR, F3, F2, WR, P.wingMemb, 0.05);
    // a bright rime edge along the leading spar
    quad(SH, EL, EL.clone().add(V(0,0.012,0)), SH.clone().add(V(0,0.012,0)), P.rime, 0.02);
  }
  wing(-1); wing(1);

  /* ---------- ARMS — spindly, clawed, reaching forward/down (spiteful little grasp). ---------- */
  const clawHand=(ctr, hex)=>{
    tube(ctr.clone().add(V(0,0.02,-0.02)), ctr.clone().add(V(0,-0.02,0.02)), 0.028, 0.024, 6, hex, {capA:{hex},capB:{hex}});
    for(const off of [-0.6,0,0.6]){
      const kb=ctr.clone().add(V(off*0.020,-0.010,0.020));
      const kt=kb.clone().add(V(off*0.014,-0.030,0.036));
      tube(kb, kt, 0.008, 0.003, 4, hex, {capB:{hex:P.claw, lift:0.003}});
    }
  };
  {
    const armL = (s)=>{
      const S=V(s*L.shoulderX, L.shldY-0.005, 0.02);
      const E=V(s*0.170, L.chestY-0.06, 0.10);
      const H=V(s*0.130, L.bellyY-0.05, 0.20);       // hands reach forward + down
      tube(S,E,0.026,0.020,6,P.ice);
      tube(E,H,0.020,0.016,6,P.ice);
      clawHand(H, P.iceLt);
    };
    armL(-1); armL(1);
  }

  /* ---------- LEGS — spindly clawed legs dangling (hovering); toes just brush the disc. ---------- */
  {
    const legL=(s)=>{
      const hip=V(s*L.hipHalf, L.hipY-0.01, 0.0);
      const knee=V(s*0.110, 0.220, 0.060);
      const ankle=V(s*0.100, 0.090, 0.020);
      const toe=V(s*0.100, 0.035, 0.075);
      tube(hip, knee, 0.034, 0.026, 6, P.ice);
      tube(knee, ankle, 0.024, 0.018, 6, P.iceDk);
      tube(ankle, toe, 0.020, 0.014, 5, P.iceDk, {capA:{hex:P.iceDk}});
      // 3 clawed toes
      const d=V(s*0.10,0,1).normalize();
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=V(toe.x,0.030,toe.z).addScaledVector(side, off*0.018);
        const tt=tb.clone().addScaledVector(d,0.050).addScaledVector(side, off*0.004);
        tube(tb, tt, 0.010, 0.003, 4, P.claw, {capB:{hex:P.claw, lift:0.003}});
      }
    };
    legL(-1); legL(1);
  }

  /* ---------- TAIL — a thin barbed ice tail curling down + back behind. ---------- */
  {
    const t0=V(0.0, L.hipY-0.04, -0.10);
    const t1=V(0.04, 0.230, -0.20);
    const t2=V(0.09, 0.150, -0.28);
    const t3=V(0.12, 0.090, -0.30);
    tube(t0, t1, 0.030, 0.022, 6, P.ice, {capA:{hex:P.iceDk}});
    tube(t1, t2, 0.022, 0.014, 6, P.iceDk);
    tube(t2, t3, 0.014, 0.007, 5, P.iceDk, {capB:{hex:P.teal}});
    // a small ice barb at the tip (two little rime spikes)
    for(const s of [-1,1]) tube(t3, t3.clone().add(V(s*0.030, -0.010, -0.030)), 0.008, 0.002, 3, P.iceLt, {capB:{hex:P.rime, lift:0.003}});
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.305, 0.305, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
