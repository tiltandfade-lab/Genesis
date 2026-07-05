/* dev/model-qa/creatures/rlm-fuel-cult-bruiser.js — FUEL-CULT BRUISER (ash realm, Medium, CR 3).
   Read: a rebar-swinging tithe enforcer — heavyset, patched scrap-plate armor over a big torso,
   a jerry-can/fuel-symbol icon lashed to the chest, a welding-mask helm, a length of bent rebar
   as a club. Whole-object grammar: one function, one merged frame, no anchors. NO eye quads —
   the welding mask has a dark slit visor, not eyes. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildFuelCultBruiser(){
  /* ---------- PALETTE (VS-desaturated rust/oil-stain drab, cult red-ochre accent, ash register) --- */
  const P = {
    skin:0x8a6a4e, skinDk:0x604832,
    plate:0x5a564a, plateDk:0x3a3830, plateLt:0x74705f,
    cloth:0x4a4234, clothDk:0x342e22,
    cult:0x7a3428, cultDk:0x4f2018,           /* fuel-cult red-ochre sigil */
    rust:0x8a5a3a, rustDk:0x5c3a24,
    visor:0x1a1712, mask:0x2b2822,
    leather:0x3a2c1e, bootDk:0x201a12,
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — big heavy-shouldered humanoid, wide stance ---------- */
  const S = {
    hip:   V(0, 0.55, 0),
    waist: V(0, 0.72, 0.01),
    chest: V(0, 0.98, 0.02),
    shldr: V(0, 1.14, 0.00),
    neck:  V(0, 1.20, -0.01),
    headB: V(0, 1.26, -0.02),
    headT: V(0, 1.44, -0.02),
  };

  /* ---------- TORSO — thick scrap-plate armor over a big frame ---------- */
  tube(S.hip,   S.waist, 0.180, 0.165, 9, P.cloth,   {phase:Math.PI/9});
  tube(S.waist, S.chest, 0.165, 0.235, 9, P.plate,   {phase:Math.PI/9});
  tube(S.chest, S.shldr, 0.235, 0.255, 9, P.plateDk, {phase:Math.PI/9});
  tube(S.shldr, S.neck,  0.255, 0.090, 9, P.plate,   {phase:Math.PI/9});
  /* riveted plate seams */
  for(const s of [-1,1]) quad(V(s*0.16,1.08,0.10), V(s*0.20,1.08,0.06), V(s*0.18,0.80,0.14), V(s*0.14,0.80,0.18), P.plateLt, 0.06);
  /* rust streaks weathering the plate */
  quad(V(-0.10,1.02,0.22), V(0.10,1.02,0.22), V(0.05,0.74,0.20), V(-0.05,0.74,0.20), P.rust, 0.08);

  /* ---------- FUEL-CULT SIGIL — a jerry-can/drip icon lashed to the chest plate ---------- */
  {
    const cy=0.92, cz=0.26;
    quad(V(-0.09,cy+0.08,cz), V(0.09,cy+0.08,cz), V(0.07,cy-0.10,cz+0.01), V(-0.07,cy-0.10,cz+0.01), P.cult, 0.05);
    quad(V(-0.03,cy+0.11,cz+0.005), V(0.03,cy+0.11,cz+0.005), V(0.02,cy+0.08,cz+0.01), V(-0.02,cy+0.08,cz+0.01), P.cultDk, 0.04);
    quad(V(-0.014,cy-0.10,cz+0.008), V(0.014,cy-0.10,cz+0.008), V(0,cy-0.18,cz+0.01), V(0,cy-0.18,cz+0.01), P.cultDk, 0.04); // drip point
  }

  /* ---------- HEAD — welding-mask helm, dark slit visor (no eye quads) ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,      cz:0.00, rx:0.115, rz:0.115, hex:P.mask},
      {y:S.headB.y+0.10, cz:0.00, rx:0.120, rz:0.118, hex:P.mask},
      {y:S.headT.y-0.02, cz:-0.01,rx:0.098, rz:0.095, hex:P.plateDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headT.y+0.02, -0.01), P.plateDk);

    /* dark slit visor across the front */
    quad(V(-0.08,S.headB.y+0.09,0.11), V(0.08,S.headB.y+0.09,0.11), V(0.075,S.headB.y+0.04,0.115), V(-0.075,S.headB.y+0.04,0.115), P.visor, 0.03);
    /* jaw guard / lower mask plate */
    quad(V(-0.075,S.headB.y-0.01,0.09), V(0.075,S.headB.y-0.01,0.09), V(0.06,S.headB.y-0.09,0.08), V(-0.06,S.headB.y-0.09,0.08), P.mask, 0.05);
  }

  /* ---------- ARMS — heavy, one gripping a bent rebar club overhead-ready ---------- */
  {
    const shL = V(-0.235, 1.10, 0.00), shR = V(0.235, 1.10, 0.00);
    const elL = V(-0.27, 0.86, 0.06), elR = V(0.28, 0.90, -0.10);
    const hL  = V(-0.24, 0.62, 0.10), hR  = V(0.34, 1.06, -0.18);
    tube(shL, elL, 0.082, 0.066, 7, P.plate);
    tube(elL, hL,  0.066, 0.052, 7, P.skin, {capB:{hex:P.skin, lift:0.012}});
    tube(shR, elR, 0.082, 0.066, 7, P.plate);
    tube(elR, hR,  0.066, 0.052, 7, P.skin, {capB:{hex:P.skin, lift:0.012}});
    /* rebar club, bent kinked profile */
    const r0=V(0.32,1.02,-0.20), r1=V(0.40,1.22,-0.30), r2=V(0.36,1.46,-0.28), r3=V(0.30,1.62,-0.16);
    tube(r0,r1,0.032,0.028,6,P.rustDk); tube(r1,r2,0.028,0.024,6,P.rust); tube(r2,r3,0.024,0.018,6,P.rustDk,{capB:{hex:P.rustDk,lift:0.01}});
  }

  /* ---------- LEGS — wide braced stance, scrap greaves ---------- */
  {
    const legs=(hipX)=>{
      const hip = V(hipX, S.hip.y-0.02, 0);
      const knee = V(hipX*1.15, 0.30, 0.05);
      const foot = V(hipX*1.05, 0.03, 0.08);
      tube(hip, knee, 0.098, 0.078, 7, P.cloth);
      tube(knee, foot, 0.078, 0.066, 7, P.plateDk, {capB:{hex:P.bootDk, lift:0.02}});
      quad(V(foot.x-0.06,0.028,foot.z-0.03), V(foot.x+0.06,0.028,foot.z-0.03), V(foot.x+0.05,0.01,foot.z+0.09), V(foot.x-0.05,0.01,foot.z+0.09), P.bootDk, 0.04);
    };
    legs(-0.10); legs(0.10);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
