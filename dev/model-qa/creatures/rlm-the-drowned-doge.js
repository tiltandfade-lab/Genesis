/* dev/model-qa/creatures/rlm-the-drowned-doge.js — THE DROWNED DOGE (high-seas, Medium Undead,
   CR 14). Read: a bloated, crown-wearing merchant-lord CORPSE, enthroned on a barnacled chair of
   fused coin. Corpse read: swollen waterlogged flesh, sodden fine robes gone to rot, a corno-ducale
   crown askew. VS-desaturated: bloated grey-green corpse skin, rotted burgundy-black robe, dull
   tarnished-gold coin (never shiny — verdigris and barnacle over it). Whole-object grammar: one
   function, one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTheDrownedDoge(){
  const P = {
    skin:0x5c665c, skinDk:0x3e463e, skinLt:0x76806e, bloat:0x6a7864,
    robe:0x3a1e20, robeDk:0x241214, robeLt:0x4e2a2c,
    crown:0x5c5236, crownDk:0x3e3822, crownLt:0x746848,       // tarnished gold
    coin:0x4a4230, coinDk:0x322c1e, coinLt:0x605840, verdigris:0x4a6858,
    barn:0x8c8676, disc:0x2e3436, discTop:0x3a4244,
  };

  const L = { seatY:0.34, hipY:0.60, waistY:0.86, chestY:1.10, shldY:1.28, neckY:1.36, jawY:1.46, crownY:1.66 };

  /* ---------- THRONE — a barnacled chair fused from coin-stacks, the doge enthroned upon it. ---------- */
  {
    // coin-fused base + backrest
    stack([
      {y:0.04, rx:0.34, rz:0.32, hex:P.coinDk},
      {y:0.20, rx:0.32, rz:0.30, hex:P.coin},
      {y:L.seatY, rx:0.30, rz:0.28, hex:P.coinLt},
    ], 8, {phase:Math.PI/8});
    // backrest rising behind
    stack([
      {y:L.seatY, rx:0.26, rz:0.10, cz:-0.24, hex:P.coin},
      {y:1.30, rx:0.28, rz:0.10, cz:-0.26, hex:P.coinDk},
    ], 6, {phase:Math.PI/6, capTop:{hex:P.verdigris}});
    // scattered coin-disc texture + barnacle crust on the throne
    for(const [x,y,z] of [[0.20,0.10,0.18],[-0.18,0.16,0.20],[0.10,0.26,0.22],[-0.22,0.30,0.14]]) blob(x,y,z,0.05,0.02,0.05,P.coinLt,4,3);
    for(const [x,y,z] of [[0.24,0.06,0.20],[-0.10,0.04,0.24],[0.02,0.30,0.02]]) blob(x,y,z,0.04,0.03,0.025,P.barn,4,3);
  }

  /* ---------- LOWER BODY — bloated legs seated, robe pooling over the throne seat. ---------- */
  quad(V(-0.24,L.seatY+0.02,0.18),V(0.24,L.seatY+0.02,0.18),V(0.30,L.hipY-0.10,-0.06),V(-0.30,L.hipY-0.10,-0.06),P.robe,0.05);
  quad(V(-0.30,L.hipY-0.10,-0.06),V(0.30,L.hipY-0.10,-0.06),V(0.20,L.hipY+0.02,-0.20),V(-0.20,L.hipY+0.02,-0.20),P.robeDk,0.05);

  /* ---------- TORSO — grossly bloated, waterlogged, robe straining over the swollen gut. ---------- */
  stack([
    {y:L.hipY,   rx:0.320, rz:0.290, hex:P.robeDk},
    {y:L.waistY, rx:0.380, rz:0.340, hex:P.robe},       // widest — the bloat
    {y:L.chestY, rx:0.340, rz:0.300, hex:P.robeLt},
    {y:L.shldY,  rx:0.300, rz:0.250, hex:P.robe},
    {y:L.neckY,  rx:0.140, rz:0.135, hex:P.skinDk},
  ], 8, {phase:Math.PI/8});
  // swollen grey-green skin showing at a torn robe gap on the belly
  quad(V(-0.14,L.waistY+0.06,0.28),V(0.14,L.waistY+0.06,0.28),V(0.10,L.hipY+0.04,0.24),V(-0.10,L.hipY+0.04,0.24),P.bloat,0.06);
  // verdigris-stained fine robe trim + a ceremonial sash
  quad(V(-0.28,L.shldY-0.04,0.10),V(-0.10,L.chestY,0.16),V(0.02,L.hipY+0.10,0.10),V(-0.18,L.hipY+0.14,0.02),P.verdigris,0.05);

  /* ---------- HEAD — a bloated waterlogged face, jaw slack, corno-ducale crown askew. ---------- */
  {
    const bands=[
      {y:L.jawY,   rx:0.140, rz:0.145, hex:P.skin},
      {y:L.jawY+0.10, rx:0.155, rz:0.150, hex:P.bloat},   // bloated cheeks, widest
      {y:L.crownY-0.14, rx:0.125, rz:0.115, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01),V(0,1,0),b.rx,b.rz,8,Math.PI/8));
    stitch(rings,b=>bands[b].hex);
    capFan(rings.at(-1),V(0,L.crownY-0.06,0),P.skinDk);
    // slack drowned jaw, mouth agape
    quad(V(-0.05,L.jawY-0.06,0.13),V(0.05,L.jawY-0.06,0.13),V(0.035,L.jawY-0.14,0.115),V(-0.035,L.jawY-0.14,0.115),P.robeDk,0.04);
    // sunken eye sockets, no eye quads
    for(const s of [-1,1]) quad(V(s*0.055,L.jawY+0.12,0.13),V(s*0.08,L.jawY+0.12,0.13),V(s*0.07,L.jawY+0.05,0.12),V(s*0.055,L.jawY+0.05,0.12),P.skinDk,0.0);
    // corno-ducale crown, tilted askew
    const cB=ring(V(0.02,L.crownY-0.10,0),V(0.06,1,0.02).normalize?V(0.06,1,0.02):V(0,1,0),0.13,0.12,8,Math.PI/8);
    const cT=ring(V(0.03,L.crownY+0.02,0),V(0,1,0),0.09,0.085,8,Math.PI/8);
    stitch([cB,cT],()=>P.crown);
    capFan(cT,V(0.02,L.crownY+0.14,0),P.crownDk);
    // little peak-horn of the corno at the back
    tube(V(-0.02,L.crownY+0.02,-0.06),V(-0.04,L.crownY+0.20,-0.08),0.05,0.015,5,P.crownLt,{capB:{hex:P.crownDk}});
  }

  /* ---------- ARMS — bloated, one draped over the throne arm, one resting on the coin-pile. ---------- */
  {
    const S=V(0.32,L.shldY-0.02,0), E=V(0.42,L.chestY-0.04,0.08), W=V(0.38,L.waistY,0.16);
    tube(S,E,0.115,0.10,6,P.robe); tube(E,W,0.10,0.09,6,P.skin,{capB:{hex:P.bloat,lift:0.01}});
    const S2=V(-0.32,L.shldY-0.02,0), E2=V(-0.40,L.waistY+0.04,0.10), W2=V(-0.34,L.hipY-0.02,0.20);
    tube(S2,E2,0.115,0.10,6,P.robe); tube(E2,W2,0.10,0.09,6,P.skin,{capB:{hex:P.bloat,lift:0.01}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0),V(0,1,0),0.42,0.42,16);
    const r2=ring(V(0,0.045,0),V(0,1,0),0.40,0.40,16);
    stitch([r1,r2],()=>P.disc);
    capFan(r2,V(0,0.048,0),P.discTop);
  }
}
