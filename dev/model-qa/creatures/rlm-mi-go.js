/* dev/model-qa/creatures/rlm-mi-go.js — MI-GO (cosmic, Medium, CR 3). Read: a fungoid
   crustacean-winged trans-void miner — a barrel-ribbed pinkish-grey fungoid torso, crab-like
   jointed pincer arms, membranous ribbed wings folded along the back, no head proper (a crown of
   short antenna-stalks instead), clawed insectoid legs. VS-desaturated: pale sick pink-grey fungus
   flesh, dark crustacean-shell ridges. NO eye quads (Mi-Go famously have none — antenna stalks
   instead). Whole-object grammar, one merged frame. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildMiGo(){
  const P = {
    fungus:0x8a7a78, fungusDk:0x5c5250, fungusLt:0xa2908c,      // pale sick pink-grey fungoid flesh
    shell:0x4a4038, shellDk:0x2e271f,                            // dark crustacean-shell ridges
    wing:0x6a625c, wingDk:0x423c36,                              // membranous ribbed wings
    claw:0x362e28,
    antenna:0x9c8c84,
    disc:0x362f2a, discTop:0x453c34,
  };

  /* ---------- LANDMARKS — a barrel fungoid torso, upright, ribbed. ---------- */
  const S = {
    base:  V(0, 0.10, 0.0),
    waist: V(0.01, 0.42, 0.0),
    chest: V(-0.01, 0.72, 0.02),
    shldr: V(0.0,  0.95, 0.0),
    neck:  V(0.0,  1.08, 0.0),
    crown: V(0.0,  1.20, 0.0),
  };

  /* ---------- FUNGOID TORSO — a barrel-ribbed body, alternating fungus bands. ---------- */
  {
    const n=10, ph=Math.PI/n;
    tube(S.base, S.waist, 0.20, 0.24, n, P.fungusDk, {phase:ph});
    tube(S.waist, S.chest,0.24, 0.26, n, P.fungus,   {phase:ph});
    tube(S.chest, S.shldr,0.26, 0.20, n, P.fungusLt, {phase:ph});
    tube(S.shldr, S.neck, 0.20, 0.13, n, P.fungusDk, {phase:ph});
    tube(S.neck, S.crown, 0.13, 0.09, n, P.fungus,   {phase:ph, capB:{hex:P.fungusLt, lift:0.02}});
    // horizontal rib-ridges (crustacean-shell segments) around the torso
    for(const ry of [0.30,0.50,0.66,0.85]){
      const rg = ring(V(0,ry,0), V(0,1,0), 0.255, 0.255, n, ph);
      const rg2 = ring(V(0,ry+0.025,0), V(0,1,0), 0.245, 0.245, n, ph);
      stitch([rg,rg2], ()=>P.shell);
    }
  }

  /* ---------- ANTENNA-CROWN — no head/eyes; a cluster of short fleshy antenna-stalks atop, the
     Mi-Go's famous headless-ness, sensory stalks instead of a face. ---------- */
  {
    const stalks=[[0,0],[0.05,0.03],[-0.05,0.03],[0.03,-0.04],[-0.03,-0.04]];
    stalks.forEach(([dx,dz],i)=>{
      const b = V(dx, S.crown.y+0.02, dz);
      const t = V(dx*1.6, S.crown.y+0.12+(i%2?0.03:0), dz*1.6);
      tube(b, t, 0.022, 0.010, 4, P.antenna, {capB:{hex:P.antenna, lift:0.008}});
    });
  }

  /* ---------- CRAB PINCER ARMS — jointed crustacean arms ending in a two-part pincer claw. ------ */
  for(const s of [-1,1]){
    const sh = V(s*0.24, S.shldr.y-0.02, 0.02);
    const elbow = V(s*0.42, S.chest.y+0.02, 0.16);
    const wrist = V(s*0.52, S.waist.y+0.06, 0.30);
    tube(sh, elbow, 0.085, 0.065, 7, P.shell, {phase:Math.PI/7});
    tube(elbow, wrist, 0.065, 0.045, 7, P.shellDk, {phase:Math.PI/7});
    // two-part pincer claw
    const pTop = V(wrist.x+s*0.10, wrist.y+0.05, wrist.z+0.12);
    const pBot = V(wrist.x+s*0.09, wrist.y-0.05, wrist.z+0.11);
    tube(wrist, pTop, 0.040, 0.012, 5, P.claw, {capB:{hex:P.claw, lift:0.006}});
    tube(wrist, pBot, 0.040, 0.012, 5, P.claw, {capB:{hex:P.claw, lift:0.006}});
  }

  /* ---------- MEMBRANOUS RIBBED WINGS — folded flat along the back, wide, veined, insectoid. --- */
  for(const s of [-1,1]){
    const root = V(s*0.10, S.chest.y+0.06, -0.10);
    const mid  = V(s*0.34, S.chest.y+0.20, -0.28);
    const tip  = V(s*0.46, S.waist.y-0.02, -0.48);
    const bot  = V(s*0.20, S.waist.y-0.06, -0.22);
    quad(root, mid, tip, bot, P.wing, 0.09);
    quad(root, bot, tip, mid, P.wingDk, 0.09);
    // wing veins (rib lines)
    for(let k=1;k<=2;k++){
      const t=k/3;
      const va=V(root.x+(mid.x-root.x)*t, root.y+(mid.y-root.y)*t, root.z+(mid.z-root.z)*t);
      const vb=V(bot.x+(tip.x-bot.x)*t, bot.y+(tip.y-bot.y)*t, bot.z+(tip.z-bot.z)*t);
      quad(V(va.x-0.01,va.y,va.z), V(va.x+0.01,va.y,va.z), V(vb.x+0.01,vb.y,vb.z), V(vb.x-0.01,vb.y,vb.z), P.wingDk, 0.06);
    }
  }

  /* ---------- CLAWED INSECTOID LEGS — thin jointed legs, splayed, clawed feet. ---------- */
  for(const s of [-1,1]){
    const hip = V(s*0.12, S.base.y+0.02, 0.0);
    const knee = V(s*0.22, 0.02, 0.10);
    const foot = V(s*0.20, -0.02, 0.14);
    tube(hip, knee, 0.075, 0.045, 6, P.fungusDk, {phase:Math.PI/6});
    tube(knee, foot, 0.045, 0.018, 6, P.shell, {phase:Math.PI/6, capB:{hex:P.claw, lift:0.006}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.047,0), P.discTop);
  }
}
