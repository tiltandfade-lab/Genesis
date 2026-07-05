/* dev/model-qa/creatures/rlm-overmind-legion-core.js — OVERMIND LEGION CORE (chrome, Huge
   construct, CR 16). Read: a towering iron chassis — the biggest humanoid-silhouette machine in
   the roster, a hulking armored giant-frame housing a distributed drone hive-mind visible through
   a bank of small window-ports across its chest (each a tiny lit cell, not one big face), a crown
   of relay-antennae, twin oversized crushing gauntlets, planted heavy tri-toed feet. Chrome
   register: dull hive-iron over cold blue-white networked glow, more monumental/industrial than
   the Rebel Chassis (a legion COMMANDS, this IS the legion, fused into one towering body). NO eye
   quads — the window-port bank is the "face," a grid of small lit cells not a pair of eyes.
   Whole-object grammar: one function, one frame, no anchors. Huge size, base disc r=0.68. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildOvermindLegionCore(){
  const P = {
    iron:0x4a5054, ironDk:0x2c3134, ironLt:0x6c7276,
    plate:0x363b3e, plateDk:0x1e2224,
    sig:0x6fd8f0, sigDk:0x1c5a68, sigGlow:0x9ceaf8,
    cell:0x0e1416, cellLit:0x8fe8f4,
    joint:0x232527,
    disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 1.05, 0),
    waist: V(0, 1.45, 0.01),
    chest: V(0, 2.05, -0.03),
    neck:  V(0, 2.42, 0),
    headB: V(0, 2.48, 0),
    headT: V(0, 2.86, 0),
  };

  /* torso — a towering armored hive-iron column, the biggest single-body silhouette in the roster */
  tube(S.hip, S.waist, 0.42, 0.40, 10, P.ironDk, {phase:Math.PI/10});
  tube(S.waist, S.chest, 0.40, 0.52, 10, P.iron, {phase:Math.PI/10});
  tube(S.chest, S.neck, 0.52, 0.24, 10, P.ironDk, {phase:Math.PI/10, capB:{hex:P.ironDk, lift:0.02}});

  /* the window-port bank — the "face" of the hive-mind, a grid of small lit cells on the chest,
     not a pair of eyes — this IS the silhouette-defining feature */
  {
    const rows=3, cols=5, cy0=1.75, cx0=-0.30, dx=0.15, dy=0.13;
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const x = cx0+c*dx, y = cy0+r*dy;
      quad(V(x-0.045,y-0.045,0.46), V(x+0.045,y-0.045,0.47), V(x+0.04,y+0.045,0.465), V(x-0.04,y+0.045,0.455), P.cell, 0.05);
      const lit = (r+c)%2===0;
      quad(V(x-0.03,y-0.03,0.462), V(x+0.03,y-0.03,0.472), V(x+0.026,y+0.03,0.467), V(x-0.026,y+0.03,0.457), lit? P.cellLit : P.plateDk, 0.15);
    }
    /* framing plate around the window-bank */
    quad(V(-0.42,1.65,0.44), V(0.42,1.65,0.44), V(0.40,2.10,0.42), V(-0.40,2.10,0.42), P.plate, 0.05);
  }

  /* massive shoulder pauldrons, riveted, asymmetric wear */
  quad(V(-0.40,2.10,-0.05), V(-0.62,2.02,-0.02), V(-0.58,1.68,0.10), V(-0.36,1.78,0.10), P.iron, 0.06);
  quad(V(0.40,2.10,-0.05), V(0.62,2.02,-0.02), V(0.58,1.68,0.10), V(0.36,1.78,0.10), P.iron, 0.06);

  /* head — squat helm-block, small relative to the body (the chest is the real "face"),
     with a thin band of sig-glow instead of eyes */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,       rx:0.20, rz:0.19, hex:P.ironDk},
      {y:S.headB.y+0.16,  rx:0.22, rz:0.20, hex:P.iron},
      {y:S.headT.y-0.05,  rx:0.18, rz:0.16, hex:P.ironDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.ironDk);
    quad(V(-0.13,S.headB.y+0.18,0.15), V(0.13,S.headB.y+0.18,0.15), V(0.12,S.headB.y+0.24,0.14), V(-0.12,S.headB.y+0.24,0.14), P.sig, 0.06);
    quad(V(-0.10,S.headB.y+0.20,0.16), V(0.10,S.headB.y+0.20,0.16), V(0.09,S.headB.y+0.225,0.15), V(-0.09,S.headB.y+0.225,0.15), P.sigGlow, 0.12);
  }

  /* crown of relay-antennae spiking from the shoulders/back */
  {
    for(const [dx,dz,h] of [[-0.30,-0.20,0.55],[-0.10,-0.30,0.70],[0.10,-0.30,0.65],[0.30,-0.20,0.55],[0,-0.35,0.80]]){
      const ab = V(dx, 2.20, dz);
      const at = V(dx*1.3, 2.20+h, dz*1.3);
      tube(ab, at, 0.028, 0.008, 5, P.ironLt, {capB:{hex:P.sigGlow, lift:0.015}});
    }
  }

  /* arms — heavy jointed limbs ending in oversized crushing gauntlets */
  {
    const armPair=(sx)=>{
      const sh = V(sx*0.62, 2.00, 0);
      const el = V(sx*0.72, 1.55, 0.10);
      const wr = V(sx*0.66, 1.05, 0.20);
      tube(sh, el, 0.24, 0.20, 8, P.iron, {phase:Math.PI/8});
      tube(el, wr, 0.20, 0.19, 8, P.ironDk, {phase:Math.PI/8});
      /* elbow joint plate */
      quad(V(el.x-0.10,el.y+0.08,el.z-0.06), V(el.x+0.10,el.y+0.08,el.z-0.06), V(el.x+0.09,el.y-0.08,el.z+0.02), V(el.x-0.09,el.y-0.08,el.z+0.02), P.joint, 0.05);
      /* oversized crushing gauntlet fist */
      quad(V(wr.x-0.19,wr.y+0.14,wr.z-0.14), V(wr.x+0.19,wr.y+0.14,wr.z-0.14), V(wr.x+0.17,wr.y-0.20,wr.z+0.14), V(wr.x-0.17,wr.y-0.20,wr.z+0.14), P.iron, 0.06);
      for(let i=0;i<4;i++){
        const kx = wr.x-0.13+i*0.087;
        quad(V(kx-0.03,wr.y+0.16,wr.z-0.16), V(kx+0.03,wr.y+0.16,wr.z-0.16), V(kx+0.025,wr.y-0.02,wr.z-0.05), V(kx-0.025,wr.y-0.02,wr.z-0.05), P.ironLt, 0.05);
      }
    };
    armPair(-1); armPair(1);
  }

  /* legs — heavy planted tri-toed feet, wide industrial stance */
  {
    const legPair=(sx)=>{
      const hipJ = V(sx*0.24, 1.00, 0);
      const knee = V(sx*0.28, 0.55, 0.04);
      const ankle= V(sx*0.26, 0.20, 0.08);
      tube(hipJ, knee, 0.26, 0.20, 8, P.ironDk, {phase:Math.PI/8});
      tube(knee, ankle, 0.20, 0.16, 8, P.iron, {phase:Math.PI/8});
      /* tri-toed foot — three splayed clawed toes forward, one small heel spur back */
      for(const [dx,dz] of [[-0.09,0.16],[0,0.20],[0.09,0.16]]){
        const tb = V(ankle.x, 0.06, ankle.z);
        const tt = V(ankle.x+dx, 0.02, ankle.z+dz);
        tube(tb, tt, 0.075, 0.045, 5, P.ironDk, {capB:{hex:P.plateDk, lift:0.01}});
      }
      const heel = V(ankle.x, 0.03, ankle.z-0.10);
      tube(V(ankle.x,0.06,ankle.z), heel, 0.06, 0.03, 5, P.ironDk);
    };
    legPair(-1); legPair(1);
  }

  /* base disc (Huge: r=0.68) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.65, 0.65, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
