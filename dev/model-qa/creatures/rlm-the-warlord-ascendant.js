/* dev/model-qa/creatures/rlm-the-warlord-ascendant.js — THE WARLORD ASCENDANT (ash realm, Medium,
   CR 15). Read: a fear-united ash-flats overlord — the apex of the warlord line, towering
   presence in a full ornate suit of trophy-plate (every pauldron, spike, and cord earned), a
   cracked ceremonial crown-helm fused to the skull, a massive standard-pole banner of stitched
   enemy sigils planted at the back, twin scrap-blades crossed and ready. Whole-object grammar:
   one function, one merged frame, no anchors. NO eye quads — a single burning visor-slit only.
   Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheWarlordAscendant(){
  /* ---------- PALETTE (VS-desaturated trophy-plate ash-grey, ochre-red command mark, banner rags) - */
  const P = {
    skin:0x7c5e44, skinDk:0x54402c,
    cloth:0x4a4434, clothDk:0x322e22,
    plate:0x6e6858, plateDk:0x4a4638, plateLt:0x827c6a,
    favor:0x8a3428, favorDk:0x5c2018, glow:0xb3491f,
    leather:0x3a2c1c, bootDk:0x201910,
    blade:0xa19b8e, bladeDk:0x686356,
    banner:0x574d38, bannerDk:0x362f22, bannerSigil:0x6c3a20,
    visor:0x110d09,
    disc:0x413b30, discTop:0x4e483a,
  };

  /* ---------- LANDMARKS — commanding upright stance, wide braced, taller than the champion ---------- */
  const S = {
    hip:   V(0, 0.58, 0),
    waist: V(0.01, 0.78, 0.01),
    chest: V(0.01, 1.06, 0.03),
    shldr: V(0, 1.22, 0.01),
    neck:  V(0, 1.28, -0.01),
    headB: V(0, 1.34, -0.02),
    headT: V(0, 1.52, -0.02),
  };

  /* ---------- STANDARD-POLE BANNER — planted at the back, rises well past the head ---------- */
  {
    const base=V(-0.30, 0.05, -0.22), top=V(-0.24, 1.90, -0.24);
    tube(base, top, 0.028, 0.014, 6, P.leather, {capB:{hex:P.leather, lift:0.01}});
    /* stitched banner cloth hung from a crossbar near the top */
    const cbL=V(-0.36,1.72,-0.24), cbR=V(-0.14,1.76,-0.22);
    tube(cbL,cbR,0.012,0.012,4,P.bannerDk);
    for(const t of [0.1,0.4,0.7]){
      const bx = cbL.clone().lerp(cbR,t);
      const b0=bx.clone(), b1=bx.clone().add(V(0,-0.55,0.0));
      tube(b0,b1,0.002,0.002,3,P.bannerDk);
    }
    quad(cbL.clone().add(V(0,-0.02,0)), cbR.clone().add(V(0,-0.02,0)), cbR.clone().add(V(0.02,-0.58,0)), cbL.clone().add(V(-0.02,-0.58,0)), P.banner, 0.06);
    /* stitched enemy sigils on the banner */
    quad(V(-0.28,1.42,-0.235), V(-0.20,1.42,-0.235), V(-0.22,1.30,-0.235), V(-0.26,1.30,-0.235), P.bannerSigil, 0.04);
  }

  /* ---------- TORSO — full ornate trophy-plate suit, taller + broader than the champion ---------- */
  tube(S.hip,   S.waist, 0.180, 0.158, 8, P.cloth,   {phase:Math.PI/8});
  tube(S.waist, S.chest, 0.158, 0.225, 8, P.plate,   {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.225, 0.235, 8, P.plateDk, {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.235, 0.085, 8, P.plate,   {phase:Math.PI/8});
  /* layered ornate plate seam bands + command-mark sigil centered */
  for(const y of [0.88,0.98,1.10]){
    quad(V(-0.17,y,0.15), V(0.17,y,0.15), V(0.15,y-0.02,0.17), V(-0.15,y-0.02,0.17), P.plateLt, 0.04);
  }
  quad(V(-0.06,1.02,0.20), V(0.06,1.02,0.20), V(0.045,0.86,0.21), V(-0.045,0.86,0.21), P.favor, 0.03);
  quad(V(-0.03,0.99,0.205), V(0.03,0.99,0.205), V(0.02,0.90,0.212), V(-0.02,0.90,0.212), P.glow, 0.0);

  /* ---------- CROWN-HELM — a cracked ceremonial crown fused to the skull, spiked ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,      cz:0.00, rx:0.102, rz:0.104, hex:P.plateDk},
      {y:S.headB.y+0.11, cz:0.00, rx:0.106, rz:0.102, hex:P.plate},
      {y:S.headT.y-0.02, cz:-0.01,rx:0.088, rz:0.084, hex:P.plateDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headT.y+0.02, -0.01), P.plate);
    /* crown spikes ringing the crown-helm */
    for(let i=0;i<6;i++){
      const ang=(i/6)*Math.PI*2;
      const cx=Math.cos(ang)*0.086, cz=Math.sin(ang)*0.084;
      const b=V(cx,S.headT.y-0.02,cz), t=V(cx*1.15,S.headT.y+0.14,cz*1.15);
      tube(b,t,0.018,0.004,4,P.plateLt,{capB:{hex:P.plateLt,lift:0.004}});
    }
    /* single burning visor-slit (no eye quads) */
    quad(V(-0.07,S.headB.y+0.12,0.06), V(0.07,S.headB.y+0.12,0.06), V(0.065,S.headB.y-0.01,0.08), V(-0.065,S.headB.y-0.01,0.08), P.plateDk, 0.04);
    quad(V(-0.055,S.headB.y+0.07,0.083), V(0.055,S.headB.y+0.07,0.083), V(0.05,S.headB.y+0.05,0.085), V(-0.05,S.headB.y+0.05,0.085), P.visor, 0.02);
    quad(V(-0.04,S.headB.y+0.065,0.084), V(0.04,S.headB.y+0.065,0.084), V(0.035,S.headB.y+0.055,0.086), V(-0.035,S.headB.y+0.055,0.086), P.glow, 0.0);
    /* crack across the crown-helm */
    quad(V(0.015,S.headT.y-0.02,-0.02), V(0.025,S.headT.y-0.02,-0.02), V(-0.005,S.headB.y+0.06,0.04), V(-0.015,S.headB.y+0.06,0.04), P.visor, 0.02);
  }

  /* ---------- ARMS — twin scrap-blades crossed and held ready ---------- */
  {
    const shL = V(-0.24, 1.15, 0.00), shR = V(0.24, 1.15, 0.01);
    const elL = V(-0.30, 0.90, 0.12), elR = V(0.32, 0.92, 0.18);
    const hL  = V(-0.22, 0.72, 0.32), hR  = V(0.26, 0.72, 0.38);
    tube(shL, elL, 0.072, 0.056, 6, P.plate);
    tube(elL, hL,  0.056, 0.044, 6, P.skin, {capB:{hex:P.skin, lift:0.01}});
    tube(shR, elR, 0.074, 0.058, 6, P.plate);
    tube(elR, hR,  0.058, 0.044, 6, P.skin, {capB:{hex:P.skin, lift:0.01}});
    /* twin crossed scrap-blades */
    const bL0=V(-0.22,0.72,0.32), bL1=V(0.10,1.20,0.60);
    tube(bL0,bL1,0.026,0.008,5,P.bladeDk,{capB:{hex:P.blade,lift:0.008}});
    const bR0=V(0.26,0.72,0.38), bR1=V(-0.06,1.24,0.60);
    tube(bR0,bR1,0.026,0.008,5,P.bladeDk,{capB:{hex:P.blade,lift:0.008}});
    /* hilt guards */
    quad(V(-0.28,0.68,0.26), V(-0.16,0.70,0.30), V(-0.18,0.64,0.36), V(-0.30,0.62,0.32), P.leather, 0.05);
    quad(V(0.20,0.68,0.32), V(0.32,0.70,0.36), V(0.30,0.64,0.42), V(0.18,0.62,0.38), P.leather, 0.05);
  }

  /* ---------- LEGS — wide braced commanding stance ---------- */
  {
    const legs=(hipX)=>{
      const hip = V(hipX, S.hip.y-0.02, 0);
      const knee = V(hipX*1.05, 0.32, 0.04);
      const foot = V(hipX*1.1, 0.03, 0.06);
      tube(hip, knee, 0.090, 0.072, 6, P.cloth);
      tube(knee, foot, 0.072, 0.058, 6, P.clothDk, {capB:{hex:P.bootDk, lift:0.02}});
      quad(V(foot.x-0.05,0.025,foot.z-0.03), V(foot.x+0.05,0.025,foot.z-0.03), V(foot.x+0.045,0.01,foot.z+0.09), V(foot.x-0.045,0.01,foot.z+0.09), P.bootDk, 0.04);
    };
    legs(-0.12); legs(0.12);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
