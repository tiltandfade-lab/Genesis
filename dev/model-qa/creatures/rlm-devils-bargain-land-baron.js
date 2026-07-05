/* dev/model-qa/creatures/rlm-devils-bargain-land-baron.js — "Devil's Bargain Land Baron"
   (frontier realm, Large fiend, CR 9, disc r=0.55). A horned, dust-coated dealmaker standing
   upright in a long duster, FOUR arms — the extra pair sprouting low at the ribs — each hand
   holding a signed deed (a small folded paper rectangle). VS-desaturated dusty palette per the
   frontier register (bright/dusty surface, gritted underneath); goat-curl horns, no eye quads
   (deep brow-shadow sockets only). Whole-object grammar: one function, one merged frame. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildDevilsBargainLandBaron(){
  const P = {
    hide:0x5a4436, hideDk:0x3a2c22, hideLt:0x6e5644,      // dusty tan-brown fiend hide
    duster:0x463527, dusterDk:0x2c211a, dusterLt:0x5a4838, // long dust coat
    horn:0x3f342a, hornTip:0x241d17,
    socket:0x1c1712, deed:0x9c8a63, deedDk:0x6e5f42, seal:0x7a1f1f,
    boot:0x2a2019, disc:0x4a4038, discTop:0x584a3a,
  };

  /* landmark spine (upright biped, torso a touch broad — Large baron) */
  const S = {
    pelvis:  V(0, 0.62, 0),
    waist:   V(0, 0.86, 0.01),
    ribsLo:  V(0, 1.02, 0.02),
    chest:   V(0, 1.30, 0.00),
    shldr:   V(0, 1.50, -0.01),
    neck:    V(0, 1.58, 0.00),
    headB:   V(0, 1.66, 0.00),
    crown:   V(0, 1.88, -0.02),
  };

  /* torso — duster-wrapped barrel, widening slightly at the chest (deal-broker girth) */
  tube(S.pelvis, S.waist, 0.30, 0.335, 10, P.duster, {phase:Math.PI/10});
  tube(S.waist, S.ribsLo, 0.335, 0.355, 10, P.dusterLt, {phase:Math.PI/10});
  tube(S.ribsLo, S.chest, 0.355, 0.330, 10, P.duster, {phase:Math.PI/10});
  tube(S.chest, S.shldr, 0.330, 0.300, 10, P.dusterDk, {phase:Math.PI/10});
  tube(S.shldr, S.neck, 0.300, 0.150, 10, P.duster, {phase:Math.PI/10});

  /* duster lapels + hem flare */
  quad(V(-0.10,1.55,0.28), V(0.10,1.55,0.28), V(0.16,0.90,0.30), V(-0.16,0.90,0.30), P.dusterDk, 0.05);
  {
    const hemPts = [[-0.34,0.60,0.10],[-0.20,0.44,0.16],[0,0.40,0.20],[0.20,0.46,0.15],[0.34,0.60,0.08]];
    for(let i=0;i<hemPts.length-1;i++){
      const a=hemPts[i], b=hemPts[i+1];
      quad(V(a[0],0.66,a[2]-0.05), V(b[0],0.66,b[2]-0.05), V(b[0],b[1],b[2]), V(a[0],a[1],a[2]), P.duster, 0.06);
    }
  }

  /* HEAD — broad fiend skull, deep brow-shadow sockets (no eye quads), goat-curl horns */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:1.62, cz:0.00, rx:0.150, rz:0.150, hex:P.hide},
      {y:1.72, cz:0.01, rx:0.165, rz:0.160, hex:P.hideLt},
      {y:1.82, cz:0.00, rx:0.140, rz:0.135, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.90,0), P.hideDk);
    /* brow-shadow sockets (dark recessed quads, no eyeballs) */
    for(const s of [-1,1]) quad(V(s*0.10,1.75,0.115), V(s*0.05,1.75,0.135), V(s*0.05,1.68,0.135), V(s*0.10,1.68,0.115), P.socket, 0.02);
    /* jaw + dust-cracked mouth line */
    quad(V(-0.08,1.60,0.14), V(0.08,1.60,0.14), V(0.06,1.555,0.145), V(-0.06,1.555,0.145), P.hideDk, 0.04);
    /* GOAT-CURL HORNS — sweep back and curl */
    for(const s of [-1,1]){
      const b0=V(s*0.11,1.80,-0.02), b1=V(s*0.19,1.90,-0.10), b2=V(s*0.24,1.97,-0.22), tip=V(s*0.20,1.99,-0.32);
      tube(b0,b1,0.045,0.032,6,P.horn);
      tube(b1,b2,0.032,0.020,6,P.horn);
      tube(b2,tip,0.020,0.006,6,P.hornTip,{capB:{hex:P.hornTip}});
    }
  }

  /* FOUR ARMS — upper pair at shoulders, lower pair sprouting low at the ribs, each holding a deed */
  const armDeed = (shoulder, elbowOff, handOff, side, hex)=>{
    const elbow = V(shoulder.x+elbowOff.x, shoulder.y+elbowOff.y, shoulder.z+elbowOff.z);
    const hand = V(elbow.x+handOff.x, elbow.y+handOff.y, elbow.z+handOff.z);
    tube(shoulder, elbow, 0.075, 0.058, 7, hex, {phase:Math.PI/7});
    tube(elbow, hand, 0.058, 0.042, 7, P.hideDk, {phase:Math.PI/7, capB:{hex:P.hideDk, lift:0.02}});
    /* signed deed — a small folded paper rectangle with a wax seal dot */
    const dn = V(side*0.03,0,0.05);
    quad(V(hand.x-0.07+dn.x,hand.y+0.05,hand.z+dn.z), V(hand.x+0.07+dn.x,hand.y+0.05,hand.z+dn.z),
         V(hand.x+0.06+dn.x,hand.y-0.07,hand.z+dn.z), V(hand.x-0.06+dn.x,hand.y-0.07,hand.z+dn.z), P.deed, 0.05);
    quad(V(hand.x-0.02+dn.x,hand.y+0.005,hand.z+dn.z+0.01), V(hand.x+0.02+dn.x,hand.y+0.005,hand.z+dn.z+0.01),
         V(hand.x+0.016+dn.x,hand.y-0.02,hand.z+dn.z+0.01), V(hand.x-0.016+dn.x,hand.y-0.02,hand.z+dn.z+0.01), P.seal, 0.03);
  };
  armDeed(V(-0.32,1.46,0.02), V(-0.18,-0.24,0.10), V(-0.06,-0.20,0.14), -1, P.duster);
  armDeed(V( 0.32,1.46,0.02), V( 0.18,-0.24,0.10), V( 0.06,-0.20,0.14),  1, P.duster);
  armDeed(V(-0.30,1.06,0.06), V(-0.24,-0.20,0.16), V(-0.08,-0.16,0.12), -1, P.hide);
  armDeed(V( 0.30,1.06,0.06), V( 0.24,-0.20,0.16), V( 0.08,-0.16,0.12),  1, P.hide);

  /* LEGS — booted, planted in duster hem */
  for(const s of [-1,1]){
    const hip = V(s*0.14, 0.60, 0.00);
    const knee = V(s*0.15, 0.34, 0.04);
    const foot = V(s*0.16, 0.06, 0.10);
    tube(hip, knee, 0.135, 0.105, 8, P.duster);
    tube(knee, foot, 0.105, 0.085, 8, P.boot, {capB:{hex:P.boot, lift:0.015}});
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
