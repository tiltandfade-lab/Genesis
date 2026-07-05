/* dev/model-qa/creatures/rlm-musket-skirmisher.js — Musket Skirmisher (theater, Medium, CR 0.25).
   A loose-order rifleman crouched and reloading in drifting smoke. Whole-object bipedal grammar:
   one merged frame, crouched low stance (bent knees, forward lean), tricorn/forage cap, long musket
   held diagonally across the body with a ramrod gesture, powder-smoke wisp at the muzzle. VS-desaturated
   faded-wool/leather palette (dull field drab, tarnished brass button, gun-black barrel). NO eye quads
   (skull/socket shading only). Medium size disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildMusketSkirmisher(){
  const P = {
    coat:0x565644, coatDk:0x393a2c, coatLt:0x6c6c54,
    skin:0x8a715c, skinDk:0x5f4c3d,
    cap:0x3c3a30, capDk:0x24231c,
    strap:0x4a3a2a, brass:0x8a7a3e,
    wood:0x4a3624, barrel:0x201f1c, barrelLt:0x38362f,
    smoke:0xaba89c,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — crouched stance: hips low, torso hinged forward, head down toward the gun. ---------- */
  const S = {
    hip:    V(0, 0.30, 0),
    waist:  V(0, 0.42, 0.04),
    chest:  V(0.01, 0.52, 0.10),
    shldr:  V(0, 0.58, 0.12),
    neck:   V(0, 0.62, 0.14),
    headB:  V(0, 0.66, 0.15),
    headT:  V(0, 0.78, 0.14),
  };

  /* ---------- TORSO — hinged forward, crouched, coat over frame. ---------- */
  {
    const bands=[
      {y:S.hip.y,   cz:S.hip.z,   rx:0.150, hex:P.coatDk},
      {y:S.waist.y, cz:S.waist.z, rx:0.140, hex:P.coat},
      {y:S.chest.y, cz:S.chest.z, rx:0.155, hex:P.coat},
      {y:S.shldr.y, cz:S.shldr.z, rx:0.130, hex:P.coatLt},
    ];
    const n=9, ph=Math.PI/n;
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.neck.y-0.02,S.neck.z), P.coatLt);
    capFan(rings[0], V(0,S.hip.y-0.06,S.hip.z), P.coatDk, true);
    // crossed leather strap
    quad(V(-0.10,0.60,0.10), V(0.02,0.58,0.13), V(-0.02,0.36,0.02), V(-0.14,0.38,0.0), P.strap, 0.05);
  }

  /* ---------- HEAD — forage cap, jaw down looking at the breech. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, cz:S.headB.z, r:0.085, hex:P.skinDk},
      {y:S.headB.y+0.06, cz:S.headB.z+0.01, r:0.090, hex:P.skin},
      {y:S.headT.y-0.03, cz:S.headB.z, r:0.082, hex:P.cap},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.r, b.r*0.92, n, ph));
    stitch(rings, b=>bands[b].hex);
    // cap crown + brim
    capFan(rings.at(-1), V(0, S.headT.y+0.02, S.headB.z-0.02), P.capDk);
    quad(V(-0.10,S.headT.y-0.05,S.headB.z+0.10), V(0.10,S.headT.y-0.05,S.headB.z+0.10),
         V(0.07,S.headT.y-0.03,S.headB.z-0.05), V(-0.07,S.headT.y-0.03,S.headB.z-0.05), P.capDk, 0.04);
    // jaw shadow (no eye quads — socket shading only)
    quad(V(-0.05,S.headB.y+0.01,S.headB.z+0.07), V(0.05,S.headB.y+0.01,S.headB.z+0.07),
         V(0.045,S.headB.y+0.045,S.headB.z+0.075), V(-0.045,S.headB.y+0.045,S.headB.z+0.075), P.skinDk, 0.04);
  }

  /* ---------- ARMS — one steadying the barrel forward-low, one working a ramrod at the muzzle. ---------- */
  {
    const shR = V(-0.13,0.57,0.13), elR = V(-0.20,0.44,0.30), hR = V(-0.10,0.36,0.52);
    tube(shR, elR, 0.052, 0.040, 6, P.coat);
    tube(elR, hR, 0.040, 0.030, 6, P.coatDk, {capB:{hex:P.skin, lift:0.02}});
    const shL = V(0.12,0.58,0.12), elL = V(0.16,0.50,0.34), hL = V(0.08,0.44,0.58);
    tube(shL, elL, 0.050, 0.038, 6, P.coat);
    tube(elL, hL, 0.038, 0.028, 6, P.coatDk, {capB:{hex:P.skin, lift:0.02}});
    // ramrod poking from the hand toward the muzzle
    tube(hL, V(0.02,0.40,0.72), 0.010, 0.006, 4, P.wood);
  }

  /* ---------- MUSKET — long diagonal stock+barrel from hip to forward muzzle, brass fittings. ---------- */
  {
    const stockB = V(-0.06,0.34,0.20), stockM = V(0.0,0.42,0.42), lockA = V(0.03,0.44,0.50);
    const barrelA = V(0.03,0.44,0.50), muzzle = V(0.02,0.42,0.86);
    tube(stockB, stockM, 0.030, 0.024, 6, P.wood);
    tube(stockM, lockA, 0.024, 0.020, 6, P.wood);
    tube(barrelA, muzzle, 0.018, 0.013, 7, P.barrel, {capB:{hex:P.barrelLt, lift:0.004}});
    // brass trigger-guard/band accents
    quad(V(-0.02,0.42,0.44), V(0.04,0.42,0.44), V(0.03,0.46,0.46), V(-0.01,0.46,0.46), P.brass, 0.04);
    quad(V(-0.015,0.435,0.66), V(0.025,0.435,0.66), V(0.02,0.455,0.67), V(-0.01,0.455,0.67), P.brass, 0.04);
  }

  /* ---------- POWDER SMOKE — a soft drifting wisp at the muzzle, thin translucent-read quads. ---------- */
  {
    const wisps = [
      [0.02,0.46,0.90,0.10],[0.06,0.52,1.00,0.14],[-0.04,0.50,0.98,0.09],
      [0.00,0.58,1.08,0.16],[0.10,0.60,1.02,0.10],
    ];
    for(const [x,y,z,r] of wisps){
      quad(V(x-r,y,z), V(x+r,y,z), V(x+r*0.6,y+r*0.7,z+r*0.3), V(x-r*0.6,y+r*0.7,z+r*0.3), P.smoke, 0.10);
    }
  }

  /* ---------- LEGS — crouched, bent knees, back leg braced. ---------- */
  {
    const hipL = V(-0.08,0.30,0.0), kneeL = V(-0.10,0.16,0.16), footL = V(-0.10,0.02,0.30);
    tube(hipL, kneeL, 0.070, 0.056, 6, P.coatDk);
    tube(kneeL, footL, 0.056, 0.040, 6, P.coat, {capB:{hex:P.capDk, lift:0.02}});
    const hipR = V(0.08,0.30,0.0), kneeR = V(0.16,0.10,-0.14), footR = V(0.22,0.02,-0.30);
    tube(hipR, kneeR, 0.070, 0.054, 6, P.coatDk);
    tube(kneeR, footR, 0.054, 0.038, 6, P.coat, {capB:{hex:P.capDk, lift:0.02}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
