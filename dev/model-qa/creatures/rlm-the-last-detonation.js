/* dev/model-qa/creatures/rlm-the-last-detonation.js — THE LAST DETONATION (ash realm, Gargantuan
   walking chassis, CR 17). Read: an unexploded WARHEAD given legs — a huge cracked-fin missile
   body carried horizontal on four squat mechanical stilt-legs, a scorched nose cone forward, a
   split tail-fin cluster aft, exposed rib-strut armor plating along the flanks with a dim amber
   ARMING LIGHT pulsing in a cracked belly window, trailing rust-chain and scrap counterweights.
   Whole-object grammar, one merged frame, no anchors. NO eye quads. VS-desaturated ash palette
   (scorched steel, rust, dead ordnance-yellow stencil, dim warning amber). Base disc r=0.72
   (Gargantuan). Kept under ~200 lines. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildTheLastDetonation(){
  /* ---------- PALETTE (scorched ordnance steel, rust bloom, dead stencil-yellow, warning amber) ---------- */
  const P = {
    shell:0x555349, shellDk:0x3a3931, shellLt:0x6c6a5c,       // scorched steel casing
    scorch:0x27231d, rust:0x6b4a2e, rustDk:0x462f1c,           // scorch + rust bloom
    stencil:0x8a7a2e, stencilDk:0x5c501f,                       // faded ordnance-yellow stencil bands
    strut:0x413f38, strutDk:0x2a2822,                           // rib-strut plating
    glow:0x9a5a1e, glowCore:0xd68a34,                           // dim warning amber (arming light)
    chain:0x35322b, disc:0x39352c, discTop:0x453f33,
  };

  /* ---------- LANDMARKS — a long horizontal warhead body carried at walking-chassis height. ---------- */
  const bY = 1.55;                              // body-spine height, held aloft on stilt legs
  const S = {
    tailB: V(0, bY, -1.55),
    tailM: V(0, bY+0.02, -1.10),
    mid1:  V(0, bY+0.04, -0.55),
    mid2:  V(0, bY+0.05,  0.05),
    mid3:  V(0, bY+0.03,  0.65),
    nose1: V(0, bY-0.02,  1.10),
    noseT: V(0, bY-0.10,  1.55),
  };

  /* ---------- BODY — the warhead casing, a long tapered cylinder, thick at mid, tapering both ends. ---------- */
  tube(S.tailB, S.tailM, 0.30, 0.42, 12, P.shellDk, {phase:Math.PI/12, capA:{hex:P.scorch, lift:0.03}});
  tube(S.tailM, S.mid1,  0.42, 0.50, 12, P.shell,   {phase:Math.PI/12});
  tube(S.mid1,  S.mid2,  0.50, 0.52, 12, P.shellLt, {phase:Math.PI/12});
  tube(S.mid2,  S.mid3,  0.52, 0.44, 12, P.shell,   {phase:Math.PI/12});
  tube(S.mid3,  S.nose1, 0.44, 0.30, 12, P.shellDk, {phase:Math.PI/12});
  tube(S.nose1, S.noseT, 0.30, 0.06, 12, P.scorch,  {phase:Math.PI/12, capB:{hex:P.scorch, lift:0.02}});

  /* ---------- STENCIL BANDS — faded ordnance-yellow rings around the mid casing (bomb-marking read). ---------- */
  for(const z of [-0.35, 0.20, 0.55]){
    const r1=ring(V(0,bY+0.045,z), V(0,1,0), 0.505, 0.505, 12, Math.PI/12);
    const r2=ring(V(0,bY+0.08, z), V(0,1,0), 0.505, 0.505, 12, Math.PI/12);
    stitch([r1,r2], ()=>P.stencil);
  }
  /* rust bloom streaks running down the flanks */
  for(const s of [-1,1]){
    quad(V(s*0.46,bY+0.20,-0.60), V(s*0.50,bY+0.20,-0.20), V(s*0.48,bY-0.28,-0.15), V(s*0.44,bY-0.28,-0.55), P.rust, 0.12);
  }

  /* ---------- ARMING WINDOW — a cracked belly viewport with a pulsing amber warning core. ---------- */
  {
    const cz = 0.10, cy = bY-0.40;
    quad(V(-0.18,cy+0.14,cz-0.12), V(0.18,cy+0.14,cz-0.12), V(0.15,cy-0.14,cz+0.12), V(-0.15,cy-0.14,cz+0.12), P.scorch, 0.04);
    blob(0, cy, cz, 0.11, 0.10, 0.05, P.glow, 8, 4);
    blob(0, cy, cz+0.02, 0.05, 0.045, 0.03, P.glowCore, 6, 3);
    /* crack lines across the window */
    quad(V(-0.14,cy+0.10,cz), V(-0.02,cy-0.04,cz), V(-0.03,cy-0.06,cz), V(-0.15,cy+0.08,cz), P.scorch, 0.02);
  }

  /* ---------- RIB-STRUT PLATING — exposed structural ribs along the top/flank of the casing. ---------- */
  {
    const ribs = [-0.85,-0.45,-0.05,0.35];
    for(const z of ribs){
      const y0 = bY+0.10, y1 = bY+0.36;
      quad(V(-0.03,y0,z-0.04), V(0.03,y0,z-0.04), V(0.03,y1,z+0.02), V(-0.03,y1,z+0.02), P.strut, 0.05);
      quad(V(-0.05,y0-0.02,z-0.05), V(0.05,y0-0.02,z-0.05), V(0.045,y0+0.02,z-0.03), V(-0.045,y0+0.02,z-0.03), P.strutDk, 0.04);
    }
  }

  /* ---------- TAIL-FIN CLUSTER — a split X-fin array at the aft, cracked and rust-fused. ---------- */
  {
    const root = V(0, bY, -1.50);
    const fin=(sx, sy)=>{
      const tip = V(sx*0.62, bY+sy*0.55, -1.72);
      const mid = V(sx*0.30, bY+sy*0.30, -1.62);
      quad(root, V(sx*0.06,bY+sy*0.06,-1.55), tip, mid, P.strutDk, 0.06);
      quad(V(sx*0.06,bY+sy*0.06,-1.55), root, mid, tip, P.rustDk, 0.06);
    };
    fin(1,1); fin(1,-1); fin(-1,1); fin(-1,-1);
    /* scorch-blackened tail cap */
    quad(V(-0.28,bY+0.24,-1.56), V(0.28,bY+0.24,-1.56), V(0.20,bY-0.24,-1.56), V(-0.20,bY-0.24,-1.56), P.scorch, 0.05);
  }

  /* ---------- FOUR STILT-LEGS — squat mechanical struts planted wide, walking-chassis frame. ---------- */
  {
    const leg=(hx, hz, fx, fz)=>{
      const hip = V(hx, bY-0.30, hz);
      const knee= V(hx*1.15, 0.62, hz*1.05);
      const foot= V(fx, 0.10, fz);
      tube(hip, knee, 0.145, 0.105, 8, P.strut, {phase:Math.PI/8, capA:{hex:P.strutDk, lift:0.02}});
      tube(knee, foot, 0.105, 0.155, 8, P.strutDk, {phase:Math.PI/8, capB:{hex:P.scorch, lift:0.03}});
      /* wide flat scrap foot-plate */
      quad(V(fx-0.20,0.06,fz-0.16), V(fx+0.20,0.06,fz-0.16), V(fx+0.18,0.02,fz+0.16), V(fx-0.18,0.02,fz+0.16), P.shellDk, 0.06);
      /* hydraulic-strut piston detail at the knee */
      tube(V(hip.x*0.9,hip.y-0.05,hip.z*0.9), knee, 0.05, 0.04, 5, P.rust);
    };
    leg( 0.55, 0.60,  0.70, 0.78);
    leg(-0.55, 0.60, -0.70, 0.78);
    leg( 0.55,-0.55,  0.68,-0.75);
    leg(-0.55,-0.55, -0.68,-0.75);
  }

  /* ---------- trailing rust-chain + scrap counterweight, dragging from the tail. ---------- */
  {
    let px = 0.10, py = bY-0.35, pz = -1.55;
    for(let i=0;i<6;i++){
      const nx = px + (i%2?0.05:-0.05), ny = py - 0.16, nz = pz - 0.10;
      tube(V(px,py,pz), V(nx,ny,nz), 0.028, 0.024, 5, P.chain);
      px=nx; py=ny; pz=nz;
    }
    blob(px, py-0.06, pz-0.04, 0.10, 0.09, 0.09, P.rustDk, 7, 4);
  }

  /* ---------- base disc (Gargantuan: r=0.72) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.06,0), V(0,1,0), 0.70, 0.70, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.063,0), P.discTop);
  }
}
