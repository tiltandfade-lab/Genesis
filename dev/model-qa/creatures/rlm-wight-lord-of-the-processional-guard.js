/* dev/model-qa/creatures/rlm-wight-lord-of-the-processional-guard.js — WIGHT-LORD OF THE
   PROCESSIONAL GUARD (lost-world, Medium Undead, CR 5). Read: an armored undead commander,
   upright and composed, still holding formation as if reviewing a marching honor-guard that
   crumbled to dust around him — corroded ceremonial plate over a faded funeral sash, one
   gauntlet raised in an old parade signal, the other resting on a standard-pole. VS-desaturated
   antiquity register: tarnished bronze-black plate, faded processional crimson sash, grey
   desiccated flesh at the joints. NO eye quads — the ONE undead-lord exception is a pair of
   cold pinprick glow quads (matches the mon-wight tell). Whole-object grammar: one function,
   one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildWightLordOfTheProcessionalGuard(){
  const P = {
    plate:0x5a544a, plateDk:0x3a3630, plateLt:0x726a5c,     // tarnished bronze-black plate
    trim:0x8a7548, trimDk:0x5c4c2e,                          // dulled bronze trim
    sash:0x6e3a3a, sashDk:0x4a2626,                          // faded processional crimson
    flesh:0x8f8a7a, fleshDk:0x625d50,
    eye:0x9fd8f0, eyeCore:0xe4f6ff,                          // cold pinprick glow (wight-lord tell)
    poleWood:0x4a3f2e, standard:0x6e3a3a, standardDk:0x4a2626,
    disc:0x4a4038, discTop:0x585047,
  };

  /* SPINE — upright, composed, still "at attention" */
  const S = {
    hip: V(0,0.62,0), waist:V(0,0.82,0.01), ribs:V(0.01,1.00,0.01),
    chest:V(0.01,1.10,0), shldr:V(0,1.18,-0.01), neck:V(0,1.26,-0.02), headB:V(0,1.32,-0.02),
  };

  /* TORSO — layered plate over a faded crimson sash */
  tube(S.hip,   S.waist, 0.155,0.140, 8, P.plate,   {phase:Math.PI/8, capA:{hex:P.plateDk,lift:0.02}});
  tube(S.waist, S.ribs,  0.140,0.155, 8, P.plateDk, {phase:Math.PI/8});
  tube(S.ribs,  S.chest, 0.155,0.148, 8, P.plate,   {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.148,0.135, 8, P.plateLt, {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.068,0.050, 6, P.fleshDk, {phase:Math.PI/6});
  /* diagonal sash across the chest */
  quad(V(-0.145,1.14,0.02), V(-0.06,1.16,0.13), V(-0.02,0.72,0.10), V(-0.11,0.70,0.01), P.sash, 0.05);
  quad(V(-0.10,1.15,0.10), V(-0.06,1.15,0.13), V(-0.02,0.71,0.10), V(-0.06,0.71,0.08), P.sashDk, 0.04);
  /* segmented pauldrons */
  for(const s of [-1,1]){
    const c=V(s*0.16,1.16,0.0);
    const rTop=ring(c, V(0,1,0), 0.075,0.075,8,Math.PI/8);
    const rBot=ring(V(c.x,c.y-0.05,c.z), V(0,1,0), 0.085,0.085,8,Math.PI/8);
    stitch([rTop,rBot], ()=>P.trim);
    capFan(rTop, V(c.x,c.y+0.025,c.z), P.trimDk);
  }
  /* waist belt/trim */
  quad(V(-0.16,0.80,0.01), V(0.16,0.80,0.01), V(0.155,0.77,0.11), V(-0.155,0.77,0.11), P.trim, 0.04);

  /* HEAD — helmed, desiccated flesh at the jaw, cold pinprick eyes glowing in the visor shadow */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.24, cz:-0.01, rx:0.070, rz:0.070, hex:P.fleshDk},
      {y:1.30, cz:0.0,   rx:0.076, rz:0.076, hex:P.plate},
      {y:1.36, cz:0.0,   rx:0.064, rz:0.062, hex:P.plateDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.40,-0.01), P.plateDk);
    /* helm crest ridge */
    quad(V(-0.014,1.36,-0.02), V(0.014,1.36,-0.02), V(0.010,1.44,0.0), V(-0.010,1.44,0.0), P.trim, 0.03);
    /* jaw */
    tube(V(0,1.24,0.02), V(0,1.185,0.01), 0.055,0.040, n, P.fleshDk, {raz:0.06, rbz:0.042, phase:ph, capB:{hex:P.fleshDk,lift:0.006}});
    /* cold pinprick glow eyes in the visor shadow */
    for(const s of [-1,1]){
      quad(V(s*0.030,1.295,0.070), V(s*0.044,1.295,0.070), V(s*0.040,1.278,0.068), V(s*0.034,1.278,0.068), P.eye, 0.03);
      quad(V(s*0.034,1.290,0.072), V(s*0.040,1.290,0.072), V(s*0.038,1.283,0.071), V(s*0.036,1.283,0.071), P.eyeCore, 0.02);
    }
  }

  /* ARMS — one raised in an old parade signal, one gripping a standard-pole */
  {
    const shR=V(0.155,1.15,0.0), elR=V(0.24,1.28,0.16), wrR=V(0.20,1.42,0.10);
    tube(shR, elR, 0.055,0.042,6,P.plate);
    tube(elR, wrR, 0.040,0.030,6,P.plateLt,{capB:{hex:P.trim,lift:0.008}});

    const shL=V(-0.155,1.13,0.0), elL=V(-0.20,0.94,0.10), wrL=V(-0.17,0.66,0.14);
    tube(shL, elL, 0.055,0.042,6,P.plate);
    tube(elL, wrL, 0.040,0.028,6,P.plateLt,{capB:{hex:P.trim,lift:0.006}});
    /* standard-pole planted at the wight-lord's side */
    const poleB=V(-0.17,0.02,0.16), poleT=V(-0.17,1.66,0.10);
    tube(poleB, poleT, 0.020, 0.016, 6, P.poleWood, {capB:{hex:P.trim, lift:0.01}});
    /* tattered processional standard-cloth */
    quad(V(-0.17,1.60,0.10), V(0.02,1.56,0.10), V(0.0,1.28,0.10), V(-0.17,1.30,0.10), P.standard, 0.05);
    quad(V(-0.10,1.44,0.10), V(0.0,1.42,0.10), V(0.0,1.30,0.10), V(-0.08,1.31,0.10), P.standardDk, 0.04);
  }

  /* LEGS — greaved, still "at attention" */
  {
    const leg=(x)=>{
      const hip=V(x,0.60,0), knee=V(x*0.9,0.32,0.03), ankle=V(x*0.85,0.06,0.02);
      tube(hip,knee,0.075,0.058,7,P.plate);
      tube(knee,ankle,0.056,0.042,7,P.plateDk,{capB:{hex:P.trim,lift:0.006}});
    };
    leg(-0.09); leg(0.09);
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
