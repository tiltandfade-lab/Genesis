/* dev/model-qa/creatures/rlm-tanker-ganger.js — TANKER GANGER (ash realm, Medium biped, CR 1).
   Read: a fuel-convoy shotgun enforcer — a bulky armored raider in patched flak gear + a fuel-can
   chestplate, a sawn-off shotgun braced across the chest, spiked pauldron, jerry-can fuel pack on
   the back, heavy scavenged boots, a welder's-mask-style face guard. Whole-object grammar, one
   merged frame. NO eye quads — dark mask-slit band only. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTankerGanger(){
  /* ---------- PALETTE (VS-desaturated rust-red flak armor, fuel-can steel, dust-tan skin) ---------- */
  const P = {
    skin:0x8a7458, skinDk:0x695a44,
    armor:0x6a4a38, armorDk:0x462f22, armorLt:0x815a44,
    metal:0x615d54, metalDk:0x3c3931, metalLt:0x7a766c,
    fuel:0x5a6b48, fuelDk:0x3e4a30, rust:0x6e4a2c,
    mask:0x2a2622, strap:0x38332a,
    spike:0x4a4740, disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — bulky broad-shouldered biped, ~1.68u tall ---------- */
  const S = {
    hip:    V(0, 0.88, 0),
    waist:  V(0, 1.05, 0.01),
    chest:  V(0, 1.30, 0.02),
    shldr:  V(0, 1.46, 0.00),
    neck:   V(0, 1.54, 0.00),
    headB:  V(0, 1.60, -0.01),
    headT:  V(0, 1.78, -0.02),
  };

  /* ---------- TORSO — broad, bulky flak-armor build ---------- */
  tube(S.hip,   S.waist, 0.185, 0.160, 8, P.armor,    {phase:Math.PI/8, capA:{hex:P.armorDk, lift:0.02}});
  tube(S.waist, S.chest, 0.160, 0.220, 8, P.armorLt,  {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.220, 0.205, 8, P.armor,    {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.205, 0.085, 8, P.armorDk,  {phase:Math.PI/8});

  /* FUEL-CAN CHESTPLATE — a flattened jerry-can shape strapped over the chest as armor */
  {
    blob(0, 1.28, 0.16, 0.155, 0.135, 0.09, P.fuel, 8, 5);
    quad(V(-0.10,1.38,0.24), V(0.10,1.38,0.24), V(0.09,1.16,0.24), V(-0.09,1.16,0.24), P.fuelDk, 0.05);
    /* fuel spout nub */
    tube(V(0.06,1.40,0.22), V(0.06,1.46,0.24), 0.025, 0.018, 5, P.metal, {capB:{hex:P.metalDk, lift:0.006}});
    /* rust streaks */
    quad(V(-0.02,1.34,0.25), V(0.02,1.30,0.25), V(0.015,1.18,0.25), V(-0.015,1.20,0.25), P.rust, 0.1);
  }
  /* strap crossing the shoulder holding the chestplate + fuel pack */
  quad(V(-0.20,1.48,0.02), V(0.02,1.42,0.20), V(0.00,1.36,0.19), V(-0.18,1.42,0.01), P.strap, 0.04);

  /* SPIKED PAULDRON — one shoulder plate with jutting scrap spikes */
  {
    const base = V(-0.21, 1.42, 0.00);
    quad(V(-0.30,1.48,0.06), V(-0.13,1.50,0.06), V(-0.14,1.32,0.04), V(-0.29,1.31,0.04), P.metal, 0.06);
    for(let i=0;i<3;i++){
      const t=i/2, bx=-0.29+t*0.13, by=1.46;
      tube(V(bx,by,0.05), V(bx-0.02,by+0.12,0.03), 0.020, 0.004, 4, P.spike, {capB:{hex:P.spike, lift:0.003}});
    }
  }

  /* JERRY-CAN FUEL PACK on the back */
  {
    quad(V(-0.11,1.44,-0.16), V(0.11,1.44,-0.16), V(0.10,1.06,-0.14), V(-0.10,1.06,-0.14), P.fuel, 0.06);
    quad(V(-0.09,1.40,-0.19), V(0.09,1.40,-0.19), V(0.08,1.10,-0.17), V(-0.08,1.10,-0.17), P.fuelDk, 0.06);
  }

  /* ---------- HEAD — welder's-mask-style face guard, dark slit band (no eye quads) ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.61, cz:0.00, rx:0.098, rz:0.10, hex:P.skin},
      {y:1.68, cz:0.00, rx:0.103, rz:0.10, hex:P.skin},
      {y:1.75, cz:-0.01,rx:0.090, rz:0.09, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, 1.795, -0.01), P.metalDk);

    /* mask plate covering the upper face, dark slit band across the eyes */
    quad(V(-0.105,1.685,0.08), V(0.105,1.685,0.08), V(0.10,1.62,0.085), V(-0.10,1.62,0.085), P.mask, 0.04);
    quad(V(-0.09,1.655,0.088), V(0.09,1.655,0.088), V(0.08,1.635,0.09), V(-0.08,1.635,0.09), P.metalLt, 0.05);
    /* mask straps around the head */
    quad(V(-0.105,1.66,0.02), V(-0.115,1.66,-0.06), V(-0.10,1.64,-0.06), V(-0.095,1.64,0.02), P.strap, 0.04);
    quad(V(0.105,1.66,0.02), V(0.115,1.66,-0.06), V(0.10,1.64,-0.06), V(0.095,1.64,0.02), P.strap, 0.04);

    /* jaw/mouth guard grille lower face */
    quad(V(-0.075,1.615,0.078), V(0.075,1.615,0.078), V(0.065,1.565,0.08), V(-0.065,1.565,0.08), P.metal, 0.05);
  }

  /* ---------- ARMS — one bracing a sawn-off shotgun across the chest, one at the pump-grip ---------- */
  {
    const shL = V(-0.21, 1.44, 0.02), shR = V(0.21, 1.44, 0.02);
    const elL = V(-0.27, 1.20, 0.16);
    const wrL = V(-0.10, 1.10, 0.34);
    const elR = V(0.24, 1.18, 0.14);
    const wrR = V(0.06, 1.20, 0.38);
    tube(shL, elL, 0.070, 0.056, 6, P.armor);
    tube(elL, wrL, 0.056, 0.042, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.02}});
    tube(shR, elR, 0.070, 0.056, 6, P.armor);
    tube(elR, wrR, 0.056, 0.042, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.02}});

    /* SAWN-OFF SHOTGUN — short double-barrel, braced across the chest */
    const stock = V(-0.10, 1.14, 0.32);
    const grip  = V(0.02, 1.18, 0.36);
    const barB  = V(0.06, 1.20, 0.38);
    const barT  = V(0.24, 1.24, 0.62);
    tube(stock, grip, 0.032, 0.028, 5, P.armorDk);
    tube(grip, barB, 0.028, 0.034, 6, P.metalDk);
    tube(barB, barT, 0.034, 0.026, 7, P.metal, {capB:{hex:P.metalLt, lift:0.008}});
    /* second sawn barrel alongside */
    tube(V(0.05,1.185,0.37), V(0.225,1.215,0.60), 0.028, 0.022, 6, P.metalDk, {capB:{hex:P.metal, lift:0.006}});
  }

  /* ---------- LEGS — heavy scavenged boots, wide stance ---------- */
  {
    const leg=(hipX, hex)=>{
      const hip  = V(hipX, 0.82, 0.00);
      const knee = V(hipX*1.05, 0.46, 0.02);
      const ankle= V(hipX*1.02, 0.16, 0.00);
      const foot = V(hipX*1.0, 0.03, 0.12);
      tube(hip, knee, 0.088, 0.066, 7, hex);
      tube(knee, ankle, 0.066, 0.050, 6, P.armorDk);
      tube(ankle, foot, 0.058, 0.062, 5, P.metalDk, {capB:{hex:P.metalDk, lift:0.012}});
    };
    leg(-0.11, P.armor);
    leg( 0.11, P.armor);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
