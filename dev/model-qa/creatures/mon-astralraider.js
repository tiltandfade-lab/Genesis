/* dev/model-qa/creatures/mon-astralraider.js — ASTRAL-RAIDER-DRACOMANCER (bespoke draconic-humanoid
   caster, CREATURE-MODELS-P2 §5 Wave 3 aberration list). The read: a scaled biped with a short
   draconic snout/head, wrapped in a muted travel robe, gripping a tall STAFF with a faint astral
   glow at its head. Astral blue-violet scale, VS-desaturated (dirty/mottled, never candy) — the
   glow channel is the one deliberate bright note. NO eye quads (dark socket recesses only).
   Whole-object grammar: one function, one merged geometry frame, no anchors. Medium: discR=0.42.
   Modeled after dragonborn-wizard.js's caster-kit grammar + mon-lizard.js's landmark/tube/ring
   discipline. Imported by the ps1-sheet proof harness + verify-theater-figures.mjs. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildAstralRaiderDracomancer(){
  /* ---------- PALETTE (VS-desaturated astral blue-violet scale, muted robe, faint glow) ---------- */
  const P = {
    scale:0x515a6e, scaleDk:0x373d4d, scaleLt:0x666f86, scaleBelly:0x7c7f8e,
    horn:0x2e2a2c, hornTip:0x1c1a1b,
    robe:0x433f4a, robeDk:0x322f38, robeLt:0x524d5b,
    trim:0x6a5f52, trimDk:0x483f37,
    wood:0x4a4038, woodDk:0x342c26,
    glow:0x8fb0d8, glowCore:0xd8e8f5,
    disc:0x3f3a42, discTop:0x4c4650,
  };
  setChannels({
    [P.scale]:'scale', [P.scaleDk]:'scale', [P.scaleLt]:'scale', [P.scaleBelly]:'scale',
    [P.horn]:'bone', [P.hornTip]:'bone',
    [P.robe]:'cloth', [P.robeDk]:'cloth', [P.robeLt]:'cloth',
    [P.trim]:'leather', [P.trimDk]:'leather',
    [P.wood]:'wood', [P.woodDk]:'wood',
    [P.glow]:'glow', [P.glowCore]:'glow',
  });

  /* ---------- LANDMARKS — Medium biped, upright, held within the 0.42 disc footprint. ---------- */
  const L = {
    hemY:0.05, kneeY:0.30, waistY:0.58, chestY:0.76, shldY:0.83, neckY:0.86,
    hipHalf:0.100, shoulderX:0.195,
    jawY:0.885, muzzleY:0.905, browY:0.975, crownY:1.030, headTopY:1.065,
  };

  /* ---------- ROBE — floor-hem cloth column, narrower waist, broadening at chest/shoulders. ---------- */
  stack([
    {y:L.hemY,   rx:0.230, rz:0.190, hex:P.robeDk},
    {y:L.kneeY,  rx:0.198, rz:0.162, hex:P.robe},
    {y:0.44,     rx:0.176, rz:0.142, hex:P.robe},
    {y:L.waistY, rx:0.150, rz:0.122, hex:P.robe},
    {y:L.chestY, rx:0.172, rz:0.128, hex:P.robeLt},
    {y:L.shldY,  rx:0.186, rz:0.120, hex:P.robeLt},
    {y:L.neckY,  rx:0.068, rz:0.062, hex:P.scaleDk},
  ], 8, {capTop:{hex:P.scaleDk, lift:0.004}});
  stack([
    {y:L.hemY-0.004, rx:0.248, rz:0.205, hex:P.robeDk},
    {y:0.12,         rx:0.222, rz:0.182, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.0}});
  /* trim seam running down the front */
  {
    const zs=[[L.chestY,0.126],[0.68,0.136],[L.waistY,0.120],[0.50,0.140],[0.38,0.158],[L.kneeY,0.164]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.024,y1,z1), V(0.024,y1,z1), V(0.024,y2,z2), V(-0.024,y2,z2), i%2?P.trim:P.trimDk, 0.04);
    }
  }
  /* waist cinch band */
  stack([
    {y:L.waistY-0.008, rx:0.154, rz:0.126, hex:P.trimDk},
    {y:L.waistY+0.020, rx:0.152, rz:0.124, hex:P.trim},
  ], 8, {});

  /* ---------- HEAD — short draconic snout, low brow, back-swept horn stubs. EYELESS. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.066, rz:0.064, hex:P.scale},
      {y:L.muzzleY, rx:0.078, rz:0.076, hex:P.scale},
      {y:L.browY,   rx:0.080, rz:0.070, hex:P.scale},
      {y:L.crownY,  rx:0.064, rz:0.056, hex:P.scaleDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]){ rings[2][i].z += 0.014; rings[2][i].y -= 0.006; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY, 0.002), P.scaleDk);

    /* short snout — draconic but stubby, not a long lizard muzzle */
    const snB = V(0, L.muzzleY-0.006, 0.078);
    const snM = V(0, L.muzzleY-0.020, 0.122);
    const snT = V(0, L.muzzleY-0.034, 0.152);
    tube(snB, snM, 0.074, 0.058, n, P.scale, {raz:0.066, rbz:0.052, phase:ph});
    tube(snM, snT, 0.058, 0.036, n, P.scaleLt, {raz:0.052, rbz:0.032, phase:ph, capB:{hex:P.scaleDk, lift:0.008}});
    /* pale belly-scale strip under the jaw (dragonborn-style throat read) */
    quad(V(-0.036,L.muzzleY-0.044,0.082), V(0.036,L.muzzleY-0.044,0.082),
         V(0.022,L.muzzleY-0.054,0.142), V(-0.022,L.muzzleY-0.054,0.142), P.scaleBelly, 0.05);
    /* two dark socket recesses (shape only, no eye quads) carved as inset darker scale rings */
    for(const s of [-1,1]){
      const c=V(s*0.046, L.browY-0.006, 0.052);
      quad(V(c.x-0.014,c.y+0.012,c.z), V(c.x+0.014,c.y+0.012,c.z),
           V(c.x+0.012,c.y-0.012,c.z-0.010), V(c.x-0.012,c.y-0.012,c.z-0.010), P.scaleDk, 0.02);
    }
    /* back-swept horn stubs */
    for(const s of [-1,1]){
      const hb=V(s*0.046, L.crownY-0.010, -0.014);
      const ht=V(s*0.064, L.crownY+0.052, -0.078);
      tube(hb, ht, 0.020, 0.008, 6, P.horn, {capB:{hex:P.hornTip, lift:0.006}});
    }
  }

  /* ---------- STAFF — tall, canted forward, a faint astral glow orb at the head. ---------- */
  const SHAFT_B = V(0.28, 0.02, 0.16), SHAFT_T = V(0.230, 1.20, 0.34);
  const GRIP = SHAFT_B.clone().lerp(SHAFT_T, 0.58);
  {
    tube(SHAFT_B, SHAFT_T, 0.022, 0.018, 6, P.wood, {capA:{hex:P.woodDk}});
    /* small crossbar / binding just under the glow head */
    tube(V(SHAFT_T.x-0.05,SHAFT_T.y-0.02,SHAFT_T.z), V(SHAFT_T.x+0.05,SHAFT_T.y-0.02,SHAFT_T.z), 0.010,0.010,4,P.woodDk);
    /* faint glow orb — the one deliberate bright channel */
    const oc = V(SHAFT_T.x, SHAFT_T.y+0.075, SHAFT_T.z);
    const orbRings=[];
    const ob=[0.0,0.35,0.62,0.82,0.96,1.0];
    for(const t of ob){
      const yy = oc.y-0.048+t*0.096;
      const rr = Math.sqrt(Math.max(0,1-Math.pow((t-0.5)*2,2)))*0.050;
      orbRings.push(ring(V(oc.x,yy,oc.z), V(0,1,0), rr+0.001, rr+0.001, 8, Math.PI/8));
    }
    stitch(orbRings, (b)=> b<2?P.glow:P.glowCore);
  }

  /* ---------- ARMS — right gripping the staff, left tucked into the robe fold. ---------- */
  {
    const S = V(L.shoulderX, L.shldY-0.008, 0.014);
    const E = S.clone().lerp(GRIP, 0.5).add(V(0.008,-0.014,0.04));
    const W = GRIP.clone().add(V(0.0,-0.012,-0.006));
    tube(S, E, 0.076, 0.060, 6, P.robeLt);
    tube(E, W, 0.070, 0.044, 6, P.robe, {capB:{hex:P.robeDk}});
    tube(GRIP.clone().add(V(-0.008,-0.036,0.0)), GRIP.clone().add(V(0.008,0.036,0.0)), 0.040,0.038,6,P.scale,{capA:{hex:P.scale},capB:{hex:P.scale}});

    const S2 = V(-L.shoulderX, L.shldY-0.008, 0.014);
    const FOLD = V(-0.14, 0.62, 0.13);
    const E2 = S2.clone().lerp(FOLD, 0.5).add(V(-0.03,-0.02,0.01));
    tube(S2, E2, 0.076, 0.060, 6, P.robeLt);
    tube(E2, FOLD, 0.070, 0.048, 6, P.robe, {capB:{hex:P.robeDk}});
    /* hand tucked, just a scaled knuckle nub peeking from the sleeve */
    tube(FOLD.clone().add(V(0.0,-0.01,-0.01)), FOLD.clone().add(V(0.0,0.024,0.014)), 0.040,0.030,5,P.scale,{capB:{hex:P.scaleDk}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
