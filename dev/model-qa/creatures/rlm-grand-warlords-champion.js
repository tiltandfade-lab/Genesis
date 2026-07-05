/* dev/model-qa/creatures/rlm-grand-warlords-champion.js — GRAND WARLORD'S CHAMPION (ash realm,
   Medium, CR 9). Read: a hundred-duel warband champion — heavily built, layered scrap-plate over
   a broad chest, a full spiked pauldron pair (earned through duels, unlike the lesser duelist's
   single mark), a heavy two-hand scrap-cleaver held ready, trophy scalp-cords at the belt, a
   full closed war-helm with a single dark visor slit. Whole-object grammar: one function, one
   merged frame, no anchors. NO eye quads. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGrandWarlordsChampion(){
  /* ---------- PALETTE (VS-desaturated heavy scrap-plate, ochre-red warlord favor, trophy cord) --- */
  const P = {
    skin:0x7c5e44, skinDk:0x54402c,
    cloth:0x4a4434, clothDk:0x322e22,
    plate:0x686257, plateDk:0x454035, plateLt:0x7e7a68,
    favor:0x8a3428, favorDk:0x5c2018,
    leather:0x3a2c1c, bootDk:0x201910,
    blade:0x9d978a, bladeDk:0x625d52,
    cord:0x8a7a5c, cordDk:0x5c503a,
    visor:0x151210,
    disc:0x413b30, discTop:0x4e483a,
  };

  /* ---------- LANDMARKS — broad heavy-built stance, wide braced feet ---------- */
  const S = {
    hip:   V(0, 0.56, 0),
    waist: V(0.01, 0.74, 0.01),
    chest: V(0.01, 1.00, 0.03),
    shldr: V(0, 1.14, 0.01),
    neck:  V(0, 1.20, -0.01),
    headB: V(0, 1.26, -0.02),
    headT: V(0, 1.43, -0.02),
  };

  /* ---------- TORSO — broad layered scrap-plate ---------- */
  tube(S.hip,   S.waist, 0.170, 0.150, 8, P.cloth,   {phase:Math.PI/8});
  tube(S.waist, S.chest, 0.150, 0.215, 8, P.plate,   {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.215, 0.225, 8, P.plateDk, {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.225, 0.082, 8, P.plate,   {phase:Math.PI/8});
  /* layered plate seam bands across the chest */
  for(const y of [0.86,0.96,1.06]){
    quad(V(-0.16,y,0.14), V(0.16,y,0.14), V(0.14,y-0.02,0.16), V(-0.14,y-0.02,0.16), P.plateDk, 0.04);
  }
  /* trophy scalp-cords slung at the belt */
  for(const x of [-0.10,0.0,0.10]){
    const b0=V(x,0.62,0.14), b1=V(x*1.1,0.42,0.16);
    tube(b0,b1,0.014,0.006,4,P.cord,{capB:{hex:P.cordDk,lift:0.006}});
  }

  /* ---------- SPIKED PAULDRON PAIR — earned battle-honors, both shoulders ---------- */
  {
    const mk=(sx)=>{
      const c = V(sx*0.24, 1.16, 0.00);
      const outer = ring(c, V(0,1,0), 0.115, 0.100, 8, Math.PI/8);
      const lower = ring(V(c.x,c.y-0.10,c.z), V(0,1,0), 0.085, 0.072, 8, Math.PI/8);
      stitch([outer,lower], ()=>P.plateLt);
      capFan(outer, V(c.x,c.y+0.03,c.z), P.plate);
      /* spike */
      const sp0=V(c.x,c.y+0.03,c.z), sp1=V(c.x+sx*0.02,c.y+0.16,c.z-0.01);
      tube(sp0,sp1,0.028,0.006,5,P.plateDk,{capB:{hex:P.plateDk,lift:0.006}});
      /* favor-mark sigil */
      quad(V(c.x+sx*0.02,c.y+0.02,c.z+0.085), V(c.x+sx*0.08,c.y+0.02,c.z+0.06), V(c.x+sx*0.065,c.y-0.06,c.z+0.065), V(c.x+sx*0.015,c.y-0.06,c.z+0.085), P.favor, 0.04);
    };
    mk(1); mk(-1);
  }

  /* ---------- HEAD — full closed war-helm, single dark visor slit (no eye quads) ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,      cz:0.00, rx:0.100, rz:0.102, hex:P.plateDk},
      {y:S.headB.y+0.10, cz:0.00, rx:0.104, rz:0.100, hex:P.plate},
      {y:S.headT.y-0.02, cz:-0.01,rx:0.086, rz:0.082, hex:P.plateDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headT.y+0.02, -0.01), P.plate);
    /* full visor face-plate, single dark slit */
    quad(V(-0.08,S.headB.y+0.13,0.055), V(0.08,S.headB.y+0.13,0.055), V(0.075,S.headB.y-0.02,0.08), V(-0.075,S.headB.y-0.02,0.08), P.plateDk, 0.04);
    quad(V(-0.062,S.headB.y+0.075,0.082), V(0.062,S.headB.y+0.075,0.082), V(0.058,S.headB.y+0.055,0.084), V(-0.058,S.headB.y+0.055,0.084), P.visor, 0.03);
    /* helm crest ridge */
    quad(V(-0.012,S.headT.y-0.02,-0.02), V(0.012,S.headT.y-0.02,-0.02), V(0.008,S.headT.y+0.10,0.0), V(-0.008,S.headT.y+0.10,0.0), P.plateLt, 0.05);
  }

  /* ---------- ARMS — heavy two-hand scrap-cleaver gripped ready ---------- */
  {
    const shL = V(-0.22, 1.09, 0.00), shR = V(0.23, 1.09, 0.01);
    const elL = V(-0.27, 0.84, 0.10), elR = V(0.30, 0.86, 0.16);
    const hL  = V(-0.20, 0.66, 0.28), hR  = V(0.24, 0.68, 0.36);
    tube(shL, elL, 0.068, 0.054, 6, P.plate);
    tube(elL, hL,  0.054, 0.042, 6, P.skin, {capB:{hex:P.skin, lift:0.01}});
    tube(shR, elR, 0.070, 0.056, 6, P.plate);
    tube(elR, hR,  0.056, 0.042, 6, P.skin, {capB:{hex:P.skin, lift:0.01}});
    /* heavy two-hand cleaver spanning both hands, blade projecting up-forward */
    const g0=V(-0.20,0.66,0.28), g1=V(0.24,0.68,0.36);
    tube(g0,g1,0.03,0.03,5,P.leather);
    const bBase=V(0.02,0.67,0.32), bMid=V(0.05,1.00,0.55), bTip=V(0.07,1.30,0.72);
    tube(bBase,bMid,0.075,0.060,6,P.bladeDk);
    tube(bMid,bTip,0.060,0.012,6,P.blade,{capB:{hex:P.blade,lift:0.01}});
  }

  /* ---------- LEGS — wide braced heavy stance ---------- */
  {
    const legs=(hipX)=>{
      const hip = V(hipX, S.hip.y-0.02, 0);
      const knee = V(hipX*1.05, 0.30, 0.04);
      const foot = V(hipX*1.1, 0.03, 0.06);
      tube(hip, knee, 0.088, 0.070, 6, P.cloth);
      tube(knee, foot, 0.070, 0.056, 6, P.clothDk, {capB:{hex:P.bootDk, lift:0.02}});
      quad(V(foot.x-0.05,0.025,foot.z-0.03), V(foot.x+0.05,0.025,foot.z-0.03), V(foot.x+0.045,0.01,foot.z+0.09), V(foot.x-0.045,0.01,foot.z+0.09), P.bootDk, 0.04);
    };
    legs(-0.11); legs(0.11);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
