/* dev/model-qa/creatures/mon-incubus.js — the INCUBUS (bespoke WINGED HUMANOID, Medium Fiend).
   docs/CREATURE-MODELS-P2.md Wave 4: the male counterpart to the succubus — a lean humanoid torso
   standing upright, small curling HORNS on the brow, leathery bat WINGS folded/half-spread off the
   shoulder blades (lifted straight from the manticore's wing rig, scaled down + rooted to a biped
   back instead of a lion back), and a long whip-thin TAIL trailing behind ending in a barbed point.
   Dusky grey-violet skin (VS desaturated, mottled), dark membrane wings. Seeds the winged-humanoid
   base (erinyes/succubus/cambion lift from it later). NO eye quads (house ruling); dark socket
   recesses only. Whole-object grammar: one function, one merged geometry frame, no anchors.
   Medium size: base disc r=0.42. Imported by the p2mon proof-sheet set + WHOLE_OBJECT_REGISTRY. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildIncubus(){
  /* ---------- PALETTE (VS desaturated; dusky grey-violet skin, dark leathery wings, bone horns) --- */
  const P = {
    skin:0x685868, skinDk:0x4a3f4a, skinLt:0x7c6c7c,           // dusky grey-violet skin
    mottleA:0x5c4e5c, mottleB:0x746476,                         // torso mottle bands
    chestDk:0x413647,                                           // sternum/ab shadow
    face:0x6e5e6e, faceDk:0x4a3f4a,
    mouth:0x241d26, socket:0x1c1620,                            // dark socket recess, no eye quads
    horn:0xc9bfae, hornDk:0x9a8f7c,                              // pale curling horns
    wing:0x2c2430, wingDk:0x1c1720, wingBone:0x483d4a,          // dark leathery membrane + bone struts
    tail:0x5c4e5c, tailDk:0x413647, barb:0xc9bfae,
    claw:0x201a22,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin', [P.mottleA]:'skin', [P.mottleB]:'skin',
    [P.chestDk]:'skin', [P.face]:'skin', [P.faceDk]:'skin',
    [P.horn]:'bone', [P.hornDk]:'bone', [P.barb]:'bone', [P.claw]:'bone',
    [P.wing]:'leather', [P.wingDk]:'leather', [P.wingBone]:'bone',
  });

  /* ---------- LANDMARKS — spine along +y, upright biped stance. ---------- */
  const S = {
    hip:    V(0, 0.44, 0.00),
    waist:  V(0, 0.56, 0.01),
    chest:  V(0, 0.72, 0.00),
    shldr:  V(0, 0.84, -0.01),
    neck:   V(0, 0.90, -0.01),
    headB:  V(0, 0.97, -0.01),
  };

  /* ---------- TORSO — one vertical loft; lean, narrow-waisted, upright fiend frame. ---------- */
  tube(S.hip,   S.waist, 0.150, 0.115, 8, P.skinDk,  {phase:Math.PI/8, capA:{hex:P.skinDk, lift:0.02}});
  tube(S.waist, S.chest, 0.115, 0.155, 8, P.mottleA, {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.155, 0.170, 8, P.skin,    {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.170, 0.075, 8, P.mottleB, {phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.075, 0.095, 8, P.skinDk,  {phase:Math.PI/8});
  /* sternum shadow line down the chest */
  quad(V(-0.015,0.62,0.14), V(0.015,0.62,0.14), V(0.012,0.86,0.15), V(-0.012,0.86,0.15), P.chestDk, 0.04);

  /* ---------- HEAD — narrow, angular fiend face; small curling horns on the brow. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:0.94, cz:0.00, rx:0.088, rz:0.090, hex:P.face},    // jaw/cheek
      {y:1.02, cz:0.00, rx:0.098, rz:0.095, hex:P.face},    // cranium
      {y:1.08, cz:-0.005,rx:0.078, rz:0.072, hex:P.faceDk}, // brow
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, 1.14, -0.01), P.faceDk);

    /* narrow jaw taper to a pointed chin */
    const jB = V(0, 0.90, 0.06);
    const jT = V(0, 0.83, 0.03);
    tube(jB, jT, 0.070, 0.028, n, P.face, {raz:0.062, rbz:0.024, phase:ph, capB:{hex:P.faceDk, lift:0.006}});

    /* dark eye-socket recesses (NO eye quads — shape only) */
    for(const s of [-1,1]){
      const cb = V(s*0.045, 1.005, 0.075);
      const ct = V(s*0.045, 0.985, 0.062);
      tube(cb, ct, 0.020, 0.014, 5, P.socket);
    }
    /* mouth line */
    quad(V(-0.04,0.885,0.075), V(0.04,0.885,0.075), V(0.03,0.878,0.078), V(-0.03,0.878,0.078), P.mouth, 0.03);

    /* small curling horns, brow-set, sweeping back */
    for(const s of [-1,1]){
      const hb = V(s*0.055, 1.11, -0.03);
      const hm = V(s*0.095, 1.19, -0.10);
      const ht = V(s*0.085, 1.24, -0.20);
      tube(hb, hm, 0.026, 0.016, 5, P.horn, {capA:{hex:P.hornDk}});
      tube(hm, ht, 0.016, 0.005, 5, P.hornDk, {capB:{hex:P.hornDk, lift:0.004}});
    }
  }

  /* ---------- ARMS — lean, hanging at the sides, clawed hands. ---------- */
  {
    const arm=(side)=>{
      const shoulder = V(side*0.19, 0.83, 0.00);
      const elbow    = V(side*0.24, 0.62, 0.03);
      const wrist    = V(side*0.23, 0.42, 0.02);
      tube(shoulder, elbow, 0.058, 0.044, 6, P.skin);
      tube(elbow, wrist, 0.044, 0.032, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.006}});
      /* clawed hand — 3 short claws fanning from the wrist */
      for(const dx of [-0.02,0,0.02]){
        const cb = V(wrist.x+dx, wrist.y-0.02, wrist.z);
        const ct = V(wrist.x+dx*1.4, wrist.y-0.08, wrist.z+0.03);
        tube(cb, ct, 0.012, 0.004, 4, P.claw, {capB:{hex:P.claw, lift:0.003}});
      }
    };
    arm(-1); arm(1);
  }

  /* ---------- LEGS — digitigrade-lean fiend stance, clawed feet. ---------- */
  {
    const leg=(side)=>{
      const hip   = V(side*0.09, 0.44, 0.00);
      const knee  = V(side*0.10, 0.24, 0.02);
      const foot  = V(side*0.10, 0.03, 0.05);
      tube(hip, knee, 0.078, 0.056, 6, P.skinDk);
      tube(knee, foot, 0.056, 0.036, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.006}});
      /* clawed foot toes */
      for(const dz of [0.02,0.06,0.10]){
        const cb = V(foot.x, 0.03, foot.z);
        const ct = V(foot.x, 0.008, foot.z+dz);
        tube(cb, ct, 0.014, 0.005, 4, P.claw, {capB:{hex:P.claw, lift:0.003}});
      }
    };
    leg(-1); leg(1);
  }

  /* ---------- WINGS — small leathery bat wings off the shoulder blades, half-spread; lifted from
     the manticore wing rig, scaled down and rooted to a biped back. ---------- */
  {
    const wing=(side)=>{
      const root = V(side*0.14, 0.86, -0.06);
      const f1 = V(side*0.42, 1.20, -0.12);
      const f2 = V(side*0.56, 1.08, -0.28);
      const f3 = V(side*0.58, 0.90, -0.42);
      const shoulder = V(side*0.20, 0.90, -0.03);
      tube(root, shoulder, 0.032, 0.024, 5, P.wingBone);
      tube(shoulder, f1, 0.024, 0.008, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});
      tube(shoulder, f2, 0.022, 0.007, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});
      tube(shoulder, f3, 0.018, 0.006, 4, P.wingBone, {capB:{hex:P.wingBone, lift:0.003}});
      quad(shoulder, f1, f2, shoulder, P.wing, 0.10);
      quad(shoulder, f2, f3, shoulder, P.wingDk, 0.10);
      const trail = V(side*0.30, 0.72, -0.30);
      quad(shoulder, f3, trail, root, P.wingDk, 0.10);
    };
    wing(-1); wing(1);
  }

  /* ---------- TAIL — long whip-thin tail rooting at the base of the spine, trailing back and
     curling low, ending in a small barbed point. ---------- */
  {
    const t0 = V(0, 0.44, -0.05);
    const t1 = V(0, 0.30, -0.20);
    const t2 = V(0.05, 0.18, -0.36);
    const t3 = V(0.10, 0.10, -0.50);
    const tip= V(0.14, 0.08, -0.60);
    tube(t0, t1, 0.045, 0.030, 6, P.tail,   {capA:{hex:P.tailDk}});
    tube(t1, t2, 0.030, 0.018, 6, P.tailDk, {phase:Math.PI/6});
    tube(t2, t3, 0.018, 0.010, 6, P.tail,   {phase:Math.PI/6});
    tube(t3, tip,0.010, 0.004, 5, P.barb,   {capB:{hex:P.barb, lift:0.003}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
