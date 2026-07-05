/* dev/model-qa/creatures/rlm-cinderfall-vampire-warlord.js — CINDERFALL VAMPIRE WARLORD (ash
   realm, Medium Undead, CR 8). Read: a settlement-razing undead warlord — a tall gaunt
   noble-turned-monster in a scorched ash-caked long coat that trails like a tattered cape,
   ember-cracked pale-grey skin, a clawed gauntlet raised in command, a curved cinder-blackened
   saber at the hip, a commanding upright predatory stance. VS-desaturated ash palette with a
   single ember-glow accent (cracked skin veins + eye-glow). NO eye quads — sunken sockets with
   an ember-glow fill only. Whole-object grammar: one function, one merged frame, no anchors.
   Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildCinderfallVampireWarlord(){
  const P = {
    skin:0x5c554a, skinDk:0x38352c, skinLt:0x726a5a,
    ember:0x9c4020, emberDk:0x5c2412, emberGlow:0xc85a2c,
    coat:0x2c2822, coatDk:0x181510, coatLt:0x3e372c,
    ash:0x4a463c,
    claw:0x201d17, saber:0x585248, saberDk:0x322f28, hilt:0x453c2c,
    hair:0x100e0b,
    disc:0x443f36, discTop:0x524b3e,
  };

  const L = {
    hipY:0.62, waistY:0.76, ribY:0.94, chestY:1.08, shldY:1.20, neckY:1.27,
    jawY:1.33, browY:1.44, crownY:1.52,
    shoulderX:0.215,
  };

  /* ---------- LEGS — tall, upright, predatory-commanding stance. ---------- */
  {
    const hipL=V(-0.12,L.hipY-0.02,0), kneeL=V(-0.13,0.36,0.03), ankL=V(-0.125,0.10,0);
    const hipR=V(0.12,L.hipY-0.02,0), kneeR=V(0.13,0.36,-0.03), ankR=V(0.125,0.10,0);
    tube(hipL,kneeL,0.098,0.070,6,P.coat);
    tube(kneeL,ankL,0.066,0.050,6,P.coatDk);
    tube(hipR,kneeR,0.098,0.070,6,P.coat);
    tube(kneeR,ankR,0.066,0.050,6,P.coatDk);
    for(const ank of [ankL,ankR]){
      const heel=V(ank.x,0.05,ank.z);
      tube(heel.clone().add(V(0,0,-0.02)), heel.clone().add(V(0,0,0.17)), 0.070,0.056,6,P.coatDk,{capA:{hex:P.coat}});
    }
  }

  /* ---------- TORSO — gaunt frame in a scorched long coat, ember-cracked skin at the collar. ---------- */
  stack([
    {y:L.hipY,   rx:0.140, rz:0.118, hex:P.coatDk},
    {y:L.waistY, rx:0.148, rz:0.126, hex:P.coat},
    {y:L.ribY,   rx:0.158, rz:0.130, hex:P.coatLt},
    {y:L.chestY, rx:0.165, rz:0.122, hex:P.coat},
    {y:L.shldY,  rx:0.190, rz:0.130, hex:P.coatLt},
    {y:L.neckY,  rx:0.065, rz:0.060, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});
  // ember-crack veins across the exposed collar/chest
  for(const [x0,y0,x1,y1] of [[-0.03,L.neckY-0.01,0.02,L.chestY+0.02],[0.02,L.neckY-0.02,-0.03,L.chestY]]){
    quad(V(x0,y0,0.11),V(x0+0.008,y0,0.11),V(x1+0.006,y1,0.108),V(x1,y1,0.108), P.emberGlow, 0.10);
  }
  for(const s of [-1,1]) blob(s*L.shoulderX,L.shldY+0.01,0.0, 0.088,0.062,0.080,P.coatLt,6,3);

  /* ---------- LONG SCORCHED COAT — trails behind like a tattered cape, ash-caked hem. ---------- */
  {
    const rings=stack([
      {y:L.shldY+0.01, rx:0.20, rz:0.05, hex:P.coat, cz:-0.12},
      {y:L.chestY-0.06,rx:0.22, rz:0.05, hex:P.coatDk, cz:-0.15},
      {y:L.ribY-0.18,  rx:0.25, rz:0.05, hex:P.coat, cz:-0.18},
      {y:L.hipY-0.16,  rx:0.28, rz:0.05, hex:P.coatLt, cz:-0.22},
      {y:0.06,         rx:0.30, rz:0.05, hex:P.ash, cz:-0.26},
    ], 6, {});
    // tattered ragged tears at the hem
    for(const sx of [-0.18,0.02,0.20]){
      const top=V(sx,0.14,-0.28), bot=V(sx,-0.05,-0.30);
      tube(top,bot,0.028,0.008,4,P.coatDk,{capB:{hex:P.ash,lift:0.005}});
    }
  }

  /* ---------- HEAD — gaunt noble features, ember-crack cheekbones, sunken ember-glow sockets. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.066, rz:0.062, hex:P.skin},
      {y:L.jawY+0.08, rx:0.072, rz:0.068, hex:P.skinLt},
      {y:L.browY,  rx:0.064, rz:0.056, hex:P.skinDk},
      {y:L.crownY, rx:0.050, rz:0.046, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.crownY+0.015,0.0), P.hair);
    // sunken sockets with ember-glow fill (no eye quads)
    for(const s of [-1,1]) blob(s*0.028,L.browY-0.006,0.056,0.016,0.012,0.008,P.emberGlow,4,3);
    // ember-crack cheekbones
    for(const s of [-1,1]) quad(V(s*0.04,L.jawY+0.02,0.058),V(s*0.052,L.jawY+0.02,0.056),V(s*0.048,L.jawY-0.03,0.055),V(s*0.036,L.jawY-0.03,0.057), P.ember, 0.08);
    // gaunt jaw + slight fanged sneer
    quad(V(-0.032,L.jawY,0.058),V(0.032,L.jawY,0.058),V(0.028,L.jawY-0.05,0.054),V(-0.028,L.jawY-0.05,0.054),P.skinDk,0.04);
    for(const s of [-1,1]) tube(V(s*0.014,L.jawY-0.015,0.058), V(s*0.016,L.jawY-0.045,0.06), 0.006,0.002,4,P.skinLt,{capB:{hex:P.skinLt,lift:0.002}});
  }

  /* ---------- ARMS — one clawed gauntlet raised in command, the other resting near the saber hilt. --- */
  {
    // raised commanding arm (right)
    const S=V(L.shoulderX,L.shldY-0.02,0.0), E=V(0.26,1.05,0.10), W=V(0.30,1.32,0.02);
    tube(S,E,0.058,0.044,6,P.coat);
    tube(E,W,0.044,0.032,6,P.skinDk);
    for(const [dx,dy,dz] of [[0.03,0.06,0.01],[0.0,0.07,0.01],[-0.03,0.06,0.01],[0.05,0.03,-0.01]]){
      tube(W, V(W.x+dx,W.y+dy,W.z+dz), 0.014,0.004,4,P.claw,{capB:{hex:P.claw,lift:0.003}});
    }
    // resting arm near the hip (left)
    const S2=V(-L.shoulderX,L.shldY-0.02,0.0), E2=V(-0.20,0.86,0.06), W2=V(-0.16,0.60,0.10);
    tube(S2,E2,0.058,0.044,6,P.coat);
    tube(E2,W2,0.044,0.032,6,P.skinDk);

    // curved cinder-blackened saber at the hip, sheathed
    const sB=V(-0.14,0.62,0.06), sT=V(-0.10,0.24,0.14);
    tube(sB,sT,0.026,0.016,5,P.saberDk);
    quad(V(-0.15,0.66,0.05),V(-0.10,0.65,0.06),V(-0.11,0.58,0.07),V(-0.16,0.59,0.06), P.hilt, 0.05); // hilt guard
  }

  /* ---------- base disc (Medium r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
