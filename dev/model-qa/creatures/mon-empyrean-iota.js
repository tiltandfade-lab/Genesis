/* dev/model-qa/creatures/mon-empyrean-iota.js — EMPYREAN-IOTA (bespoke BIPED, lesser demigod).
   A human-sized powerful humanoid: crowned, wielding a weapon, bronzed radiant skin (VS-desaturated,
   luminous-but-dirty — NOT candy), regal garb (a draped robe/kilt + shoulder mantle). NO eye quads
   (sockets are dark recesses). Whole-object grammar: one function, one geometry frame, no anchors,
   authored directly in world space per docs/CREATURE-MODELS-P2.md §1. Medium footprint, base disc
   r=0.42 (size-law Medium). Silhouette debt to mon-paladin-style armored bipeds + mon-lizard's
   landmark-spine / stitch-ring authoring method. */
import { V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildEmpyreanIota(){
  /* ---------- PALETTE (VS desaturated bronze-gold demigod; dirty radiance, mottled, no candy) --- */
  const P = {
    skin:0x9c7a52, skinDk:0x7a5c3e, skinLt:0xb08d63,      // bronzed radiant skin, desaturated
    socket:0x241b12,                                        // dark eye-socket recess
    robeA:0x5c4a5e, robeB:0x473a4c,                          // regal garb, dusty violet-grey
    robeTrim:0x8a7248,                                       // worn gold trim
    mantle:0x3d3440, mantleDk:0x2c2530,                      // shoulder mantle
    crown:0x8a7240, crownDk:0x635028,                        // dulled gold crown
    gem:0x6d5a3a,                                            // crown gem, muted (no glow-candy)
    glow:0xb89860,                                           // faint radiant channel (still dirty gold)
    weaponShaft:0x3a3128, weaponHead:0x767268,               // stone-grey weapon head, worn wood shaft
    sandal:0x54432c,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin',
    [P.robeA]:'cloth', [P.robeB]:'cloth', [P.mantle]:'cloth', [P.mantleDk]:'cloth',
    [P.crown]:'metal', [P.crownDk]:'metal', [P.robeTrim]:'metal', [P.weaponHead]:'metal',
    [P.glow]:'glow',
  });

  /* ---------- LANDMARK SPINE — upright biped, standing tall inside the r0.42 disc ---------- */
  const S = {
    hip:    V(0, 0.44, 0.00),
    waist:  V(0, 0.58, 0.01),
    chest:  V(0, 0.76, 0.00),
    shldr:  V(0, 0.90, -0.01),
    neck:   V(0, 0.97, -0.01),
    headB:  V(0, 1.03, 0.00),
    crownT: V(0, 1.22, 0.00),
  };

  /* ---------- TORSO — one merged loft, hip -> waist -> chest -> shoulders -> neck. ---------- */
  const nT = 9, phT = Math.PI/nT;
  const torsoBands = [
    {y:S.hip.y,    rx:0.155, rz:0.135, hex:P.robeA},
    {y:S.waist.y,  rx:0.140, rz:0.120, hex:P.robeB},
    {y:S.chest.y,  rx:0.175, rz:0.145, hex:P.skin},
    {y:S.shldr.y,  rx:0.195, rz:0.150, hex:P.skinDk},
    {y:S.neck.y,   rx:0.095, rz:0.088, hex:P.skin},
  ];
  const torsoRings = torsoBands.map(b => ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, nT, phT));
  stitch(torsoRings, b => torsoBands[b].hex);
  capFan(torsoRings[0], V(0, S.hip.y-0.10, 0), P.robeB, true);

  /* HEAD — a compact ring-stack ending in a brow, dark socket recesses (no eye quads). */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,        rx:0.100, rz:0.100, hex:P.skin},
      {y:S.headB.y+0.075,  rx:0.100, rz:0.098, hex:P.skinLt},   // brow band
      {y:S.headB.y+0.135,  rx:0.078, rz:0.078, hex:P.skin},     // crown of skull
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headB.y+0.165, 0), P.skinLt);
    /* dark socket recesses — two shallow inset quads, not painted eyes */
    for(const s of [-1,1]){
      const cx=s*0.040, cy=S.headB.y+0.078, cz=0.088;
      quad(V(cx-0.020,cy+0.012,cz), V(cx+0.020,cy+0.012,cz), V(cx+0.016,cy-0.012,cz+0.006), V(cx-0.016,cy-0.012,cz+0.006), P.socket, 0.02);
    }
    /* jaw + chin, subtle */
    quad(V(-0.045,S.headB.y-0.055,0.075), V(0.045,S.headB.y-0.055,0.075), V(0.030,S.headB.y-0.085,0.055), V(-0.030,S.headB.y-0.085,0.055), P.skinDk, 0.03);
  }

  /* ---------- CROWN — a jagged gold band + points, dulled bronze not candy-shiny. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const cy = S.headB.y+0.148;
    const band = ring(V(0,cy,0), V(0,1,0), 0.088, 0.086, n, ph);
    const bandTop = ring(V(0,cy+0.035,0), V(0,1,0), 0.086, 0.084, n, ph);
    stitch([band, bandTop], ()=>P.crown);
    /* points jutting up off the band, alternating tall/short */
    for(let i=0;i<n;i++){
      const p0=bandTop[i], p1=bandTop[(i+1)%n];
      const mid = V((p0.x+p1.x)/2, p0.y, (p0.z+p1.z)/2);
      const tall = (i%2===0);
      const tip = V(mid.x*1.05, cy+(tall?0.115:0.06), mid.z*1.05);
      quad(p0, p1, tip, tip, P.crownDk, 0.04);
    }
    /* central gem, muted */
    quad(V(-0.018,cy+0.01,0.086), V(0.018,cy+0.01,0.086), V(0.014,cy-0.02,0.090), V(-0.014,cy-0.02,0.090), P.gem, 0.03);
  }

  /* ---------- SHOULDER MANTLE — draped regal cape-collar over both shoulders, hangs to mid-back. */
  {
    const n=8, ph=Math.PI/n;
    const top = ring(V(0,S.shldr.y+0.03,0), V(0,1,0), 0.215, 0.175, n, ph);
    const mid = ring(V(0,S.shldr.y-0.10,-0.02), V(0,1,0), 0.235, 0.195, n, ph);
    const low = ring(V(0,S.chest.y-0.16,-0.04), V(0,1,0), 0.185, 0.150, n, ph);
    stitch([top,mid,low], b=> b===0?P.mantle:P.mantleDk);
    capFan(low, V(0,S.chest.y-0.20,-0.02), P.mantleDk, true);
  }

  /* ---------- ROBE/KILT SKIRT — draped fabric below the hip, gold trim hem. ---------- */
  {
    const n=10, ph=Math.PI/n;
    const b0 = ring(V(0,S.hip.y-0.02,0), V(0,1,0), 0.165, 0.145, n, ph);
    const b1 = ring(V(0,S.hip.y-0.20,0), V(0,1,0), 0.205, 0.180, n, ph);
    const hem= ring(V(0,S.hip.y-0.34,0), V(0,1,0), 0.190, 0.168, n, ph);
    stitch([b0,b1,hem], b=> b===1?P.robeTrim:P.robeA);
    capFan(hem, V(0,S.hip.y-0.37,0), P.robeTrim, true);
  }

  /* ---------- ARMS — one bare radiant arm raised gripping the weapon, one relaxed at the side. --- */
  {
    // right arm (weapon-bearing): shoulder -> elbow raised -> hand gripping haft
    const rSh = V(0.205, S.shldr.y-0.03, 0.02);
    const rEl = V(0.285, S.shldr.y-0.18, 0.10);
    const rHd = V(0.235, S.shldr.y+0.02, 0.20);
    tube(rSh, rEl, 0.062, 0.050, 7, P.skin, {capA:{hex:P.skinDk}});
    tube(rEl, rHd, 0.048, 0.040, 7, P.skinLt, {capB:{hex:P.skinDk, lift:0.02}});
    // left arm: shoulder -> elbow -> hand resting near hip
    const lSh = V(-0.205, S.shldr.y-0.03, 0.02);
    const lEl = V(-0.245, S.shldr.y-0.26, 0.05);
    const lHd = V(-0.205, S.hip.y-0.06, 0.06);
    tube(lSh, lEl, 0.060, 0.048, 7, P.skin, {capA:{hex:P.skinDk}});
    tube(lEl, lHd, 0.046, 0.036, 7, P.skinLt, {capB:{hex:P.skinDk, lift:0.02}});
  }

  /* ---------- WEAPON — a heavy ceremonial mace/scepter, gripped in the raised right hand. ---------- */
  {
    const grip = V(0.235, S.shldr.y+0.02, 0.20);
    const shaftTop = V(0.255, S.shldr.y+0.34, 0.15);
    tube(grip, shaftTop, 0.026, 0.020, 6, P.weaponShaft);
    const headBot = V(0.257, S.shldr.y+0.33, 0.15);
    const headTop = V(0.260, S.shldr.y+0.46, 0.14);
    tube(headBot, headTop, 0.060, 0.038, 7, P.weaponHead, {capB:{hex:P.weaponHead, lift:0.02}});
    // faint radiant glow band at the weapon's head, dirty gold not neon
    const glowR = ring(V(0.258,S.shldr.y+0.40,0.145), V(0,1,0), 0.066, 0.066, 6, 0);
    capFan(glowR, V(0.258,S.shldr.y+0.40,0.145), P.glow);
  }

  /* ---------- LEGS — sturdy stance, sandaled feet just above/on the disc. ---------- */
  {
    const leg=(hipX)=>{
      const hipP = V(hipX, S.hip.y-0.20, 0.0);
      const knee = V(hipX*1.05, 0.24, 0.04);
      const ankle= V(hipX*1.02, 0.075, 0.02);
      tube(hipP, knee, 0.075, 0.058, 7, P.skinDk, {capA:{hex:P.skinDk}});
      tube(knee, ankle, 0.056, 0.040, 7, P.skin, {capB:{hex:P.sandal, lift:0.015}});
      // sandal foot pad, planted forward
      const toe = V(ankle.x, 0.028, ankle.z+0.10);
      quad(V(ankle.x-0.045,0.030,ankle.z-0.02), V(ankle.x+0.045,0.030,ankle.z-0.02), V(toe.x+0.030,0.026,toe.z), V(toe.x-0.030,0.026,toe.z), P.sandal, 0.04);
    };
    leg(-0.085);
    leg( 0.085);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
