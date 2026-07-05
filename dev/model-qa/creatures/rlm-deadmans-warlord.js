/* dev/model-qa/creatures/rlm-deadmans-warlord.js — DEADMAN'S WARLORD (ash realm, Medium biped,
   CR 11). Bespoke dressing on a humanoid biped frame: a convoy-king in WELDED PLATE ARMOR built
   from cut truck door/hood/fender panels — each panel still bearing a scrap of faded paint and a
   rivet seam, a hood-ornament pauldron, a chain-link shoulder mantle, a heavy tire-tread belt, and
   a signal-mast spike jutting off the back hauling a tattered convoy banner. One hand grips a
   fire-axe-length tow-hook mace. Whole-object grammar, one merged frame, no anchors. NO eye quads
   — a dark visor-slit instead. VS-desaturated ash palette (rust steel, faded convoy paint chips).
   Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDeadmansWarlord(){
  /* ---------- PALETTE (welded truck-panel plate, rust, faded convoy paint chips) ---------- */
  const P = {
    skin:0x8a7458, skinDk:0x584a38,
    plate:0x5e5b52, plateDk:0x3c3a33, plateLt:0x757166,       // welded panel steel
    paint:0x6e4630, paintDk:0x472c1e,                          // faded convoy-red paint chip
    rust:0x6b4a2e, weld:0x2a2824,                               // rust bloom + weld-seam dark
    chain:0x35322b, tread:0x2c2a24,                             // chain mantle + tire-tread belt
    banner:0x5a5040, bannerDk:0x3c352a,                         // tattered convoy banner
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — heavy-set warlord stance, ~1.72u tall ---------- */
  const S = {
    hip:    V(0, 0.88, 0),
    waist:  V(0, 1.06, 0.01),
    chest:  V(0, 1.32, 0.02),
    shldr:  V(0, 1.50, 0.00),
    neck:   V(0, 1.58, 0.00),
    headB:  V(0, 1.64, -0.01),
    headT:  V(0, 1.82, -0.02),
  };

  /* ---------- TORSO — panel-plate cuirass, welded seams visible ---------- */
  tube(S.hip,   S.waist, 0.205, 0.180, 8, P.plate,   {phase:Math.PI/8, capA:{hex:P.plateDk, lift:0.02}});
  tube(S.waist, S.chest, 0.180, 0.235, 8, P.plateLt,  {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.235, 0.215, 8, P.plate,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.215, 0.088, 8, P.plateDk, {phase:Math.PI/8});

  /* CUT TRUCK-PANEL plates riveted over the chest, each with a faded paint chip + rivet seam */
  {
    const panelAt=(cx,cy,w,h,hex)=>{
      quad(V(cx-w,cy+h,0.22), V(cx+w,cy+h,0.22), V(cx+w*0.9,cy-h,0.22), V(cx-w*0.9,cy-h,0.22), hex, 0.06);
      // rivets at the corners
      for(const [rx,ry] of [[-w*0.7,h*0.7],[w*0.7,h*0.7],[-w*0.6,-h*0.6],[w*0.6,-h*0.6]])
        blob(cx+rx, cy+ry, 0.235, 0.012,0.012,0.008, P.weld, 4, 2);
    };
    panelAt(0, 1.34, 0.13, 0.12, P.paint);
    panelAt(-0.14, 1.20, 0.08, 0.09, P.plateLt);
    panelAt(0.14, 1.22, 0.08, 0.09, P.paintDk);
    /* weld-seam lines between panels */
    quad(V(-0.02,1.44,0.225), V(0.02,1.44,0.225), V(0.015,1.10,0.225), V(-0.015,1.10,0.225), P.weld, 0.04);
  }

  /* CHAIN-LINK SHOULDER MANTLE draped across both shoulders */
  {
    const r1=ring(V(0,1.47,0.00), V(0,1,0), 0.24, 0.23, 10, Math.PI/10);
    const r2=ring(V(0,1.35,0.00), V(0,1,0), 0.27, 0.25, 10, Math.PI/10);
    stitch([r1,r2], ()=>P.chain);
  }

  /* HOOD-ORNAMENT PAULDRON — one shoulder plate topped with a scavenged chrome hood-ornament */
  {
    const base = V(-0.22, 1.44, 0.00);
    quad(V(-0.31,1.50,0.06), V(-0.14,1.52,0.06), V(-0.15,1.34,0.04), V(-0.30,1.33,0.04), P.plate, 0.06);
    blob(-0.225, 1.55, 0.03, 0.045, 0.06, 0.03, P.plateLt, 6, 4);
    tube(V(-0.225,1.58,0.03), V(-0.20,1.66,0.01), 0.018, 0.006, 4, P.plateLt, {capB:{hex:P.plateLt, lift:0.004}});
  }

  /* HEAVY TIRE-TREAD BELT at the waist */
  {
    const r1=ring(V(0,1.02,0.01), V(0,1,0), 0.185, 0.175, 10, Math.PI/10);
    const r2=ring(V(0,1.10,0.01), V(0,1,0), 0.190, 0.180, 10, Math.PI/10);
    stitch([r1,r2], ()=>P.tread);
    /* a hanging tread strip */
    quad(V(0.05,1.02,0.18), V(0.11,1.02,0.17), V(0.10,0.86,0.16), V(0.045,0.86,0.17), P.tread, 0.06);
  }

  /* SIGNAL-MAST + tattered convoy banner off the back */
  {
    const mB = V(0, 1.46, -0.18);
    const mT = V(0.05, 1.98, -0.22);
    tube(mB, mT, 0.020, 0.012, 5, P.plateDk, {capB:{hex:P.rust, lift:0.006}});
    quad(V(mT.x,mT.y-0.02,mT.z), V(mT.x+0.16,mT.y-0.10,mT.z-0.02),
         V(mT.x+0.14,mT.y-0.30,mT.z-0.02), V(mT.x-0.01,mT.y-0.22,mT.z), P.banner, 0.08);
    quad(V(mT.x+0.02,mT.y-0.14,mT.z-0.01), V(mT.x+0.10,mT.y-0.18,mT.z-0.02),
         V(mT.x+0.09,mT.y-0.28,mT.z-0.02), V(mT.x+0.01,mT.y-0.24,mT.z-0.01), P.bannerDk, 0.06);
  }

  /* ---------- HEAD — dark visor-slit, no eye quads ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.65, cz:0.00, rx:0.100, rz:0.102, hex:P.skin},
      {y:1.72, cz:0.00, rx:0.105, rz:0.102, hex:P.skin},
      {y:1.79, cz:-0.01,rx:0.092, rz:0.09, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, 1.805, -0.01), P.skinDk);

    /* scavenged half-visor plate across the eyes, dark slit */
    quad(V(-0.10,1.73,0.085), V(0.10,1.73,0.085), V(0.095,1.68,0.088), V(-0.095,1.68,0.088), P.plateDk, 0.05);
    quad(V(-0.08,1.705,0.09), V(0.08,1.705,0.09), V(0.07,1.69,0.092), V(-0.07,1.69,0.092), P.weld, 0.03);
    /* grim jaw shading */
    quad(V(-0.06,1.655,0.09), V(0.06,1.655,0.09), V(0.05,1.625,0.092), V(-0.05,1.625,0.092), P.skinDk, 0.05);
  }

  /* ---------- ARMS — one bracing a tow-hook mace, one free with a scrap gauntlet ---------- */
  {
    const shL = V(-0.23, 1.47, 0.02), shR = V(0.23, 1.47, 0.02);
    const elL = V(-0.29, 1.20, 0.14);
    const wrL = V(-0.14, 0.98, 0.28);
    const elR = V(0.27, 1.22, 0.10);
    const wrR = V(0.20, 0.98, 0.14);
    tube(shL, elL, 0.075, 0.060, 6, P.plate);
    tube(elL, wrL, 0.060, 0.046, 6, P.plateDk, {capB:{hex:P.skinDk, lift:0.02}});
    tube(shR, elR, 0.075, 0.060, 6, P.plate);
    tube(elR, wrR, 0.060, 0.046, 6, P.plateDk, {capB:{hex:P.plateDk, lift:0.02}});

    /* TOW-HOOK MACE — a heavy shaft ending in a welded tow-hook head */
    const haftB = V(-0.14, 0.98, 0.28);
    const haftT = V(-0.10, 0.56, 0.44);
    tube(haftB, haftT, 0.036, 0.028, 6, P.plateDk);
    blob(haftT.x, haftT.y-0.06, haftT.z+0.02, 0.075, 0.065, 0.06, P.plate, 7, 4);
    tube(V(haftT.x+0.05,haftT.y-0.10,haftT.z+0.06), V(haftT.x+0.14,haftT.y-0.02,haftT.z+0.10), 0.030,0.010, 5, P.rust,
      {capB:{hex:P.rust, lift:0.006}});
    /* scrap gauntlet knuckle plate on the free hand */
    blob(wrR.x, wrR.y-0.02, wrR.z, 0.035,0.03,0.03, P.plate, 5, 3);
  }

  /* ---------- LEGS — plated greaves over dusty boots ---------- */
  {
    const leg=(hipX)=>{
      const hip  = V(hipX, 0.82, 0.00);
      const knee = V(hipX*1.05, 0.46, 0.02);
      const ankle= V(hipX*1.02, 0.16, 0.00);
      const foot = V(hipX*1.0, 0.03, 0.12);
      tube(hip, knee, 0.092, 0.070, 7, P.plate);
      tube(knee, ankle, 0.070, 0.052, 6, P.plateDk);
      tube(ankle, foot, 0.06, 0.064, 5, P.weld, {capB:{hex:P.weld, lift:0.012}});
    };
    leg(-0.115);
    leg(0.115);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
