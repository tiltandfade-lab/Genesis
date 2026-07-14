/* dev/model-qa/creatures/rlm-warlords-duelist.js — WARLORD'S DUELIST (ash realm, Medium, CR 3).
   Read: a warlord's arena duelist — lean, scarred, mismatched scavenged armor with a single
   ornamented pauldron (the warlord's favor-mark), a curved scrap-blade held ready, a cracked
   half-visor helm. Whole-object grammar: one function, one merged frame, no anchors. NO eye
   quads — a dark visor slit only. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildWarlordsDuelist(){
  /* ---------- PALETTE (VS-desaturated scrap-armor drab, warlord ochre-red favor accent) ---------- */
  const P = {
    skin:0x8a6a4e, skinDk:0x604832,
    cloth:0x554e3c, clothDk:0x3a352a,
    plate:0x605c50, plateDk:0x403c32, plateLt:0x76715f,
    favor:0x8a3428, favorDk:0x5c2018,     /* warlord's favor-mark ochre-red */
    leather:0x3e2e1e, bootDk:0x211a12,
    blade:0x9a9488, bladeDk:0x615d54,
    visor:0x171410,
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — lean athletic stance, weight forward (duelist ready posture) ---------- */
  const S = {
    hip:   V(0, 0.54, 0),
    waist: V(0.01, 0.70, 0.01),
    chest: V(0.01, 0.93, 0.03),
    shldr: V(0, 1.06, 0.01),
    neck:  V(0, 1.12, -0.01),
    headB: V(0, 1.18, -0.02),
    headT: V(0, 1.34, -0.02),
  };

  /* ---------- TORSO — lean, mismatched scavenged armor plates over cloth ---------- */
  tube(S.hip,   S.waist, 0.145, 0.130, 8, P.cloth,   {phase:Math.PI/8});
  tube(S.waist, S.chest, 0.130, 0.175, 8, P.plate,   {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.175, 0.180, 8, P.plateDk, {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.180, 0.075, 8, P.plate,   {phase:Math.PI/8});
  /* scar-quads on the exposed cloth flank */
  quad(V(0.09,0.86,0.10), V(0.12,0.80,0.08), V(0.10,0.68,0.10), V(0.075,0.72,0.12), P.skinDk, 0.05);

  /* ---------- SINGLE ORNAMENTED PAULDRON — the warlord's favor-mark, worn on the right shoulder --- */
  {
    const c = V(0.19, 1.08, 0.00);
    const outer = ring(c, V(0,1,0), 0.095, 0.085, 8, Math.PI/8);
    const lower = ring(V(c.x,c.y-0.09,c.z), V(0,1,0), 0.070, 0.062, 8, Math.PI/8);
    stitch([outer,lower], ()=>P.plateLt);
    capFan(outer, V(c.x,c.y+0.03,c.z), P.plate);
    /* favor-mark sigil painted on the pauldron face */
    quad(V(c.x+0.02,c.y+0.02,c.z+0.075), V(c.x+0.07,c.y+0.02,c.z+0.055), V(c.x+0.055,c.y-0.05,c.z+0.06), V(c.x+0.015,c.y-0.05,c.z+0.075), P.favor, 0.04);
  }
  /* plain scrap pauldron on the other shoulder for the mismatched read */
  quad(V(-0.21,1.10,0.05), V(-0.15,1.12,0.08), V(-0.13,0.96,0.05), V(-0.20,0.98,0.03), P.plateDk, 0.05);

  /* ---------- HEAD — cracked half-visor helm, dark slit (no eye quads) ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,      cz:0.00, rx:0.092, rz:0.095, hex:P.skin},
      {y:S.headB.y+0.09, cz:0.00, rx:0.096, rz:0.092, hex:P.plateDk},
      {y:S.headT.y-0.02, cz:-0.01,rx:0.080, rz:0.076, hex:P.plate},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headT.y+0.02, -0.01), P.plate);
    /* half-visor covering the upper face, dark slit beneath */
    quad(V(-0.075,S.headB.y+0.12,0.06), V(0.075,S.headB.y+0.12,0.06), V(0.07,S.headB.y+0.05,0.075), V(-0.07,S.headB.y+0.05,0.075), P.plateDk, 0.05);
    quad(V(-0.06,S.headB.y+0.055,0.078), V(0.06,S.headB.y+0.055,0.078), V(0.055,S.headB.y+0.035,0.08), V(-0.055,S.headB.y+0.035,0.08), P.visor, 0.03);
    /* crack in the visor */
    quad(V(0.01,S.headB.y+0.10,0.07), V(0.02,S.headB.y+0.10,0.07), V(-0.01,S.headB.y+0.04,0.078), V(-0.02,S.headB.y+0.04,0.078), P.visor, 0.02);
    /* exposed jaw + a scar */
    quad(V(-0.06,S.headB.y-0.01,0.07), V(0.06,S.headB.y-0.01,0.07), V(0.05,S.headB.y-0.06,0.075), V(-0.05,S.headB.y-0.06,0.075), P.skinDk, 0.04);
  }

  /* ---------- ARMS — one gripping a curved scrap-blade held forward-ready ---------- */
  {
    const shL = V(-0.19, 1.02, 0.00), shR = V(0.22, 1.03, 0.01);
    const elL = V(-0.22, 0.80, 0.08), elR = V(0.27, 0.86, 0.14);
    const hL  = V(-0.18, 0.62, 0.10), hR  = V(0.36, 0.82, 0.30);
    tube(shL, elL, 0.058, 0.046, 6, P.cloth);
    tube(elL, hL,  0.046, 0.036, 6, P.skin, {capB:{hex:P.skin, lift:0.01}});
    tube(shR, elR, 0.062, 0.048, 6, P.plate);
    tube(elR, hR,  0.048, 0.036, 6, P.skin, {capB:{hex:P.skin, lift:0.01}});
    /* curved scrap-blade projecting forward from the right hand */
    const b0=V(0.36,0.82,0.30), b1=V(0.46,0.90,0.52), b2=V(0.50,1.00,0.72);
    tube(b0,b1,0.026,0.020,6,P.bladeDk);
    tube(b1,b2,0.020,0.006,6,P.blade,{capB:{hex:P.blade,lift:0.008}});
    /* hilt guard */
    quad(V(0.31,0.79,0.22), V(0.40,0.80,0.24), V(0.38,0.76,0.30), V(0.30,0.75,0.28), P.leather, 0.05);
  }

  /* ---------- LEGS — lean, forward-braced duelist stance ---------- */
  {
    const legs=(hipX, forward)=>{
      const hip = V(hipX, S.hip.y-0.02, 0);
      const knee = V(hipX*0.9, 0.30, forward?0.10:0.02);
      const foot = V(hipX*0.8, 0.03, forward?0.16:0.03);
      tube(hip, knee, 0.075, 0.060, 6, P.cloth);
      tube(knee, foot, 0.060, 0.048, 6, P.clothDk, {capB:{hex:P.bootDk, lift:0.02}});
      quad(V(foot.x-0.045,0.025,foot.z-0.03), V(foot.x+0.045,0.025,foot.z-0.03), V(foot.x+0.04,0.01,foot.z+0.08), V(foot.x-0.04,0.01,foot.z+0.08), P.bootDk, 0.04);
    };
    legs(-0.09, true); legs(0.09, false);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
