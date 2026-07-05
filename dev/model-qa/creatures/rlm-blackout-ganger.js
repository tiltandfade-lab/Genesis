/* dev/model-qa/creatures/rlm-blackout-ganger.js — the BLACKOUT GANGER (chrome realm, Medium).
   A wild-eyed stim-junkie ganger fighting in adrenaline blackout. Read: a lean humanoid figure,
   hunched forward in a manic combat crouch, patchwork scrap-armor over a bare-chested jacket,
   one arm wrapped in makeshift stim-injector tubing, wielding a crude improvised blade. NO eye
   quads — "wild-eyed" reads via a gaunt sunken-socket face and a lolling open jaw, not literal
   eye geometry. VS-desaturated: grimy jacket denim-black, sallow scavenger skin, rust-red scrap
   armor plates. Whole-object grammar: one function, one frame, no anchors. Medium size: base disc
   r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildBlackoutGanger(){
  /* ---------- PALETTE ---------- */
  const P = {
    skin:0x8a7862, skinDk:0x685a48, skinSallow:0x9c8a70,      // sallow scavenger skin
    jacket:0x2a2a2c, jacketDk:0x18181a,                        // grimy denim-black jacket
    armor:0x6b3e2e, armorDk:0x4a2a1e, armorLt:0x845038,        // rust-red scrap armor plates
    strap:0x3a352c,
    tube_:0x4a6b52, tubeDk:0x334a3a,                            // stim-injector tubing
    fluid:0x9ab84a,                                              // stim fluid glow
    blade:0x767468, bladeDk:0x504e46,                           // crude improvised blade
    hair:0x1c1a17, socket:0x241f1a, mouth:0x140f0c,
    disc:0x3a362e, discTop:0x464237,
  };

  /* ---------- LANDMARKS — hunched forward crouch, weight low, one arm raised with the blade. ---------- */
  const S = {
    pelvis:  V(0, 0.42, 0.02),
    gut:     V(0, 0.58, 0.06),
    chest:   V(0.02, 0.74, 0.10),
    neck:    V(0.05, 0.86, 0.13),
    headB:   V(0.09, 0.98, 0.15),
    shR:     V( 0.16, 0.78, 0.06),
    shL:     V(-0.16, 0.76, 0.08),
    hipR:    V( 0.11, 0.40, 0.0),
    hipL:    V(-0.11, 0.40, 0.02),
  };

  /* ---------- TORSO — hunched forward lean, lean wiry frame. ---------- */
  tube(S.pelvis, S.gut,   0.145, 0.155, 8, P.jacket,   {phase:Math.PI/8});
  tube(S.gut,    S.chest, 0.155, 0.165, 8, P.jacketDk, {phase:Math.PI/8});
  tube(S.chest,  S.neck,  0.150, 0.075, 8, P.skinSallow,{phase:Math.PI/8});   // bare chest under open jacket
  tube(S.neck,   S.headB, 0.075, 0.062, 7, P.skinDk,   {phase:Math.PI/7});
  // open jacket flaps hanging either side of the bare chest
  quad(V(-0.14,0.90,0.10), V(-0.08,0.90,0.14), V(-0.11,0.56,0.10), V(-0.16,0.56,0.06), P.jacketDk, 0.06);
  quad(V(0.10,0.90,0.14), V(0.16,0.90,0.10), V(0.20,0.56,0.06), V(0.14,0.56,0.10), P.jacket, 0.06);

  /* ---------- SCRAP ARMOR — patchwork rust-red plates strapped over the torso, crude and mismatched. ---------- */
  {
    const plates=[
      [V(-0.09,0.70,0.14),V(0.04,0.72,0.16),V(0.03,0.60,0.14),V(-0.10,0.58,0.12)],
      [V(0.03,0.66,0.16),V(0.14,0.64,0.13),V(0.13,0.52,0.10),V(0.02,0.54,0.13)],
      [V(-0.13,0.55,0.09),V(-0.02,0.56,0.12),V(-0.03,0.44,0.09),V(-0.14,0.44,0.06)],
    ];
    for(let i=0;i<plates.length;i++){ const q=plates[i]; quad(q[0],q[1],q[2],q[3], i%2?P.armor:P.armorLt, 0.07); }
    // strap crossing the chest holding the plates
    quad(V(-0.12,0.80,0.10), V(0.10,0.72,0.14), V(0.08,0.68,0.13), V(-0.14,0.76,0.09), P.strap, 0.05);
  }

  /* ---------- HEAD — gaunt, sunken sockets, jaw lolling open (wild-eyed via absence, no eye quads). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:0.94, cz:0.15, rx:0.062, rz:0.066, hex:P.skinDk},
      {y:1.00, cz:0.16, rx:0.068, rz:0.070, hex:P.skinSallow},
      {y:1.06, cz:0.14, rx:0.058, rz:0.060, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(b.cz*0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.10,0.13), P.hair);
    // sunken eye sockets (dark recesses, no glow, no quad "eyeball")
    for(const s of [-1,1]) quad(V(s*0.026-0.012,1.005,0.205), V(s*0.026+0.012,1.005,0.205),
                                  V(s*0.026+0.010,0.985,0.198), V(s*0.026-0.010,0.985,0.198), P.socket, 0.0);
    // lolling open jaw
    quad(V(-0.028,0.965,0.20), V(0.028,0.965,0.20), V(0.022,0.930,0.185), V(-0.022,0.930,0.185), P.mouth, 0.04);
    // matted greasy hair shock on top
    quad(V(-0.05,1.10,0.10), V(0.05,1.10,0.10), V(0.02,1.16,0.02), V(-0.04,1.15,0.04), P.hair, 0.08);
  }

  /* ---------- ARMS — one wrapped in stim tubing hanging low, one raised gripping the blade high. ---------- */
  {
    // left arm: stim-tubing wrapped, hangs at the side, clenched fist
    const elbowL = V(-0.24, 0.58, 0.10);
    const handL  = V(-0.20, 0.40, 0.16);
    tube(S.shL, elbowL, 0.058, 0.048, 6, P.jacketDk, {phase:Math.PI/6});
    tube(elbowL, handL, 0.046, 0.034, 6, P.skinSallow, {phase:Math.PI/6, capB:{hex:P.skinDk, lift:0.01}});
    // wrapped tubing coil down the forearm
    for(let i=0;i<4;i++){
      const t=i/4;
      const a=V(elbowL.x+(handL.x-elbowL.x)*t, elbowL.y+(handL.y-elbowL.y)*t+0.02, elbowL.z+(handL.z-elbowL.z)*t);
      const b=V(elbowL.x+(handL.x-elbowL.x)*(t+0.2), elbowL.y+(handL.y-elbowL.y)*(t+0.2)-0.01, elbowL.z+(handL.z-elbowL.z)*(t+0.2));
      tube(a,b,0.020,0.020,4, i%2?P.tube_:P.tubeDk);
    }
    // stim injector unit clipped to the forearm, glowing fluid reservoir
    quad(V(-0.26,0.48,0.14), V(-0.20,0.48,0.16), V(-0.21,0.44,0.14), V(-0.27,0.44,0.12), P.fluid, 0.1);

    // right arm: raised high, gripping the crude blade
    const elbowR = V(0.24, 0.92, 0.14);
    const handR  = V(0.30, 1.12, 0.20);
    tube(S.shR, elbowR, 0.058, 0.046, 6, P.jacket, {phase:Math.PI/6});
    tube(elbowR, handR, 0.044, 0.032, 6, P.skinSallow, {phase:Math.PI/6, capB:{hex:P.skinDk, lift:0.01}});
    // crude improvised blade — a jagged sheet-metal shard, gripped overhead
    const bladeBase = V(0.32,1.14,0.22);
    const bladeTip  = V(0.40,1.46,0.30);
    tube(bladeBase, bladeTip, 0.030, 0.006, 5, P.blade, {phase:Math.PI/5, capB:{hex:P.bladeDk, lift:0.004}});
    quad(V(0.28,1.16,0.18), V(0.36,1.16,0.24), V(0.34,1.10,0.22), V(0.27,1.10,0.16), P.strap, 0.04); // grip wrap
  }

  /* ---------- LEGS — wide manic crouch stance. ---------- */
  {
    const legDown=(hip, footX, footZ, hex)=>{
      const knee = V(hip.x*1.15, 0.20, hip.z+0.08);
      const foot = V(footX, 0.03, footZ);
      tube(hip, knee, 0.075, 0.058, 6, hex, {phase:Math.PI/6});
      tube(knee, foot, 0.056, 0.040, 6, P.jacketDk, {phase:Math.PI/6, capB:{hex:P.jacketDk, lift:0.008}});
    };
    legDown(S.hipR, 0.20, 0.12, P.jacket);
    legDown(S.hipL, -0.20, 0.10, P.jacketDk);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.040,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.043,0), P.discTop);
  }
}
