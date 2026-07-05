/* dev/model-qa/creatures/rlm-ration-raider.js — RATION RAIDER (ash realm, Medium biped, CR 0.5).
   Read: a scavenged-gear ration raider — a desperate looter bundled in mismatched scrap armor,
   a bulging sack of scavenged tins/rations slung on the back, a crude cleaver/machete in hand,
   patched boots, a rag scarf over the lower face. Whole-object grammar. NO eye quads — dark
   scarf-shadowed socket band only. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildRationRaider(){
  /* ---------- PALETTE (VS-desaturated dust-tan skin, scrap-armor rust/grey, sack burlap) ---------- */
  const P = {
    skin:0x8f7a5c, skinDk:0x6c5c44,
    cloth:0x746b57, clothDk:0x544c3d, clothLt:0x847a63,
    armor:0x5a564c, armorDk:0x38352f, armorLt:0x726d61,
    sack:0x8a7a4e, sackDk:0x685c38,
    blade:0x8a8880, bladeDk:0x54524a,
    scarf:0x736452, scarfDk:0x4f4335,
    hair:0x2e2a22, disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — upright biped, hunched scavenger stance ~1.62u tall ---------- */
  const S = {
    hip:    V(0, 0.84, 0),
    waist:  V(0, 1.00, 0.02),
    chest:  V(0.01, 1.22, 0.03),
    shldr:  V(0.01, 1.38, 0.00),
    neck:   V(0, 1.46, -0.01),
    headB:  V(0, 1.52, -0.02),
    headT:  V(0, 1.70, -0.04),
  };

  /* ---------- TORSO — mismatched scrap-armor plates over cloth ---------- */
  tube(S.hip,   S.waist, 0.150, 0.135, 8, P.cloth,    {phase:Math.PI/8, capA:{hex:P.clothDk, lift:0.02}});
  tube(S.waist, S.chest, 0.135, 0.170, 8, P.armor,    {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.170, 0.155, 8, P.cloth,    {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.155, 0.072, 8, P.clothDk,  {phase:Math.PI/8});
  /* patchwork armor plates strapped over the chest */
  quad(V(-0.13,1.30,0.12), V(-0.02,1.32,0.15), V(-0.01,1.14,0.15), V(-0.12,1.13,0.12), P.armorLt, 0.07);
  quad(V(0.03,1.31,0.15), V(0.15,1.29,0.13), V(0.14,1.12,0.13), V(0.03,1.13,0.15), P.armor, 0.07);
  /* leather straps crossing */
  quad(V(-0.14,1.34,0.08), V(0.14,1.20,0.10), V(0.13,1.16,0.10), V(-0.13,1.30,0.08), P.scarfDk, 0.04);

  /* ---------- SACK — a bulging burlap ration sack slung over one shoulder ---------- */
  {
    blob(-0.02, 1.14, -0.22, 0.175, 0.20, 0.155, P.sack, 8, 6);
    /* strap over the shoulder */
    quad(V(-0.14,1.40,0.02), V(-0.06,1.38,-0.10), V(-0.03,1.30,-0.14), V(-0.11,1.32,-0.02), P.sackDk, 0.05);
    /* tin/can shapes poking from the sack mouth */
    for(const [dx,dz] of [[-0.05,-0.30],[0.03,-0.32],[-0.01,-0.26]]){
      const cb=V(dx,1.28,dz), ct=V(dx,1.35,dz);
      tube(cb, ct, 0.028, 0.026, 5, P.armorLt, {capB:{hex:P.armorLt, lift:0.005}});
    }
  }

  /* ---------- HEAD — gaunt scavenger face, scarf mask, ragged hood ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.53, cz:0.00, rx:0.093, rz:0.098, hex:P.skin},
      {y:1.60, cz:0.00, rx:0.098, rz:0.098, hex:P.skin},
      {y:1.67, cz:-0.01,rx:0.086, rz:0.088, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, 1.715, -0.01), P.clothDk);

    /* ragged hood over the crown */
    quad(V(-0.095,1.69,-0.07), V(0.095,1.69,-0.07), V(0.06,1.48,-0.11), V(-0.06,1.48,-0.11), P.clothDk, 0.05);

    /* scarf mask across the lower face + dark shadow band where eyes would be (no eye quads) */
    quad(V(-0.10,1.58,0.075), V(0.10,1.58,0.075), V(0.09,1.50,0.08), V(-0.09,1.50,0.08), P.scarf, 0.05);
    quad(V(-0.085,1.615,0.085), V(0.085,1.615,0.085), V(0.078,1.585,0.088), V(-0.078,1.585,0.088), P.scarfDk, 0.04);
  }

  /* ---------- ARMS — one raised gripping a crude cleaver, one steadying the sack strap ---------- */
  {
    const shL = V(-0.185, 1.365, 0.00), shR = V(0.185, 1.365, 0.00);
    const elL = V(-0.21, 1.14, 0.16);
    const wrL = V(-0.15, 1.00, 0.30);
    const elR = V(0.235, 1.20, -0.02);
    const wrR = V(0.28, 1.36, -0.05);
    tube(shL, elL, 0.060, 0.048, 6, P.cloth);
    tube(elL, wrL, 0.048, 0.036, 6, P.clothLt, {capB:{hex:P.skinDk, lift:0.02}});
    tube(shR, elR, 0.060, 0.048, 6, P.cloth);
    tube(elR, wrR, 0.048, 0.036, 6, P.clothLt, {capB:{hex:P.skinDk, lift:0.02}});

    /* crude cleaver/machete raised in the right hand */
    const hilt = V(0.30, 1.40, -0.06);
    const hiltT= V(0.32, 1.45, -0.08);
    const tip  = V(0.44, 1.68, -0.14);
    tube(hilt, hiltT, 0.022, 0.020, 5, P.armorDk);
    tube(hiltT, tip, 0.020, 0.004, 5, P.bladeDk, {raz:0.070, rbz:0.006, capB:{hex:P.blade, lift:0.01}});
  }

  /* ---------- LEGS — patched wraps + scavenged boots ---------- */
  {
    const leg=(hipX, hex)=>{
      const hip  = V(hipX, 0.78, 0.00);
      const knee = V(hipX*1.05, 0.42, 0.02);
      const ankle= V(hipX*1.02, 0.13, 0.00);
      const foot = V(hipX*1.0, 0.03, 0.11);
      tube(hip, knee, 0.073, 0.056, 7, hex);
      tube(knee, ankle, 0.056, 0.042, 6, P.clothDk);
      tube(ankle, foot, 0.048, 0.050, 5, P.armorDk, {capB:{hex:P.armorDk, lift:0.01}});
    };
    leg(-0.095, P.cloth);
    leg( 0.095, P.cloth);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
