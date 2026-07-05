/* dev/model-qa/creatures/rlm-signal-drowned-oracle.js — SIGNAL-DROWNED ORACLE (chrome, Medium
   undead/construct-adjacent spirit, CR 6). Read: a spectral comms officer, headset still fused
   to a half-dissolved skull, looping the same warning scream forever. Translucent static-blue
   body dissolving to cable-frayed nothing at the waist (no legs — it hovers), a cracked visor-
   headset welded across the skull, a broadcast antenna jutting from the spine, an open screaming
   jaw. Chrome register: cheap-miracle tech gone ghostly — cold static-blue glow over drowned
   gunmetal. NO eye quads — hollow dark sockets behind the cracked visor lens. Whole-object
   grammar: one function, one frame, no anchors. Medium size, base disc r=0.42 (a thin static-ring
   since it hovers, not stands). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSignalDrownedOracle(){
  const P = {
    spec:0x3a5560, specDk:0x22343c, specLt:0x5a7d88,      // translucent-read static-blue "flesh"
    cable:0x232a2c, cableDk:0x14181a,                      // frayed cable-tendrils below the waist
    gunmetal:0x565d60, gunmetalDk:0x373d3f, gunmetalLt:0x767d80,
    visor:0x1c2224, crack:0x0e1214,
    glow:0x6fe0ee, glowDk:0x2c6d78,
    socket:0x0a0d0e, mouth:0x0c0f10,
    antenna:0x8a9296,
    disc:0x263034, discTop:0x35434a,
  };

  const S = {
    core:  V(0, 0.62, 0),
    chest: V(0, 0.92, -0.01),
    neck:  V(0, 1.10, 0),
    headB: V(0, 1.14, 0),
    headT: V(0, 1.34, 0),
  };

  /* torso — dissolves from a solid-ish chest into thin static wisps low down (no legs) */
  tube(S.core, S.chest, 0.150, 0.185, 8, P.spec, {phase:Math.PI/8});
  tube(S.chest, S.neck, 0.185, 0.095, 8, P.specDk, {phase:Math.PI/8, capB:{hex:P.specDk, lift:0.01}});
  /* torn uniform collar plate + a rank badge, drowned-corp read */
  quad(V(-0.12,0.98,0.15), V(0.12,0.98,0.15), V(0.09,1.10,0.12), V(-0.09,1.10,0.12), P.gunmetalDk, 0.05);
  quad(V(-0.03,1.00,0.155), V(0.03,1.00,0.155), V(0.02,1.05,0.14), V(-0.02,1.05,0.14), P.glow, 0.08);

  /* head — a cracked comms headset welded across the skull, screaming jaw open */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,       rx:0.110, rz:0.108, hex:P.specDk},
      {y:S.headB.y+0.10,  rx:0.118, rz:0.112, hex:P.spec},
      {y:S.headT.y-0.03,  rx:0.100, rz:0.094, hex:P.spec},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.specDk);

    /* two hollow sockets behind the cracked visor (no eye quads — recessed dark pits) */
    for(const s of [-1,1]){
      quad(V(s*0.035-0.026, S.headT.y-0.10, 0.095), V(s*0.035+0.026, S.headT.y-0.10, 0.093),
           V(s*0.035+0.022, S.headT.y-0.145, 0.088), V(s*0.035-0.022, S.headT.y-0.145, 0.090), P.socket, 0.03);
    }
    /* cracked visor lens plate spanning both sockets */
    quad(V(-0.095,S.headT.y-0.075,0.10), V(0.095,S.headT.y-0.075,0.10), V(0.088,S.headT.y-0.155,0.095), V(-0.088,S.headT.y-0.155,0.095), P.visor, 0.05);
    quad(V(-0.02,S.headT.y-0.08,0.102), V(0.015,S.headT.y-0.10,0.101), V(-0.005,S.headT.y-0.15,0.097), V(-0.03,S.headT.y-0.13,0.098), P.crack, 0.04);
    /* headset band arcing over the skull, one earpiece with a static glow ring */
    quad(V(-0.11,S.headT.y-0.02,0.02), V(-0.06,S.headT.y+0.05,0.05), V(-0.06,S.headB.y+0.10,0.05), V(-0.11,S.headB.y+0.06,0.02), P.gunmetal, 0.05);
    quad(V(0.02,S.headT.y+0.06,-0.06), V(0.11,S.headT.y-0.02,0.02), V(0.11,S.headB.y+0.06,0.02), V(0.02,S.headB.y+0.11,-0.06), P.gunmetal, 0.05);
    {
      const ec = V(-0.115, S.headB.y+0.06, 0.02);
      const r1=ring(ec, V(1,0,0), 0.055, 0.055, 6, Math.PI/6);
      const r2=ring(V(ec.x-0.02,ec.y,ec.z), V(1,0,0), 0.045, 0.045, 6, Math.PI/6);
      stitch([r1,r2], ()=>P.gunmetalDk);
      capFan(r2, V(ec.x-0.035,ec.y,ec.z), P.glow);
    }

    /* screaming open jaw — dark hinged mouth cavity, mid-loop scream */
    quad(V(-0.055,S.headB.y-0.02,0.09), V(0.055,S.headB.y-0.02,0.09), V(0.048,S.headB.y-0.13,0.075), V(-0.048,S.headB.y-0.13,0.075), P.mouth, 0.04);
    quad(V(-0.048,S.headB.y-0.05,0.088), V(0.048,S.headB.y-0.05,0.088), V(0.040,S.headB.y-0.10,0.078), V(-0.040,S.headB.y-0.10,0.078), P.glowDk, 0.08);
  }

  /* broadcast antenna jutting from the spine, glowing tip — the "signal" read */
  {
    const aB = V(-0.02, 1.00, -0.14);
    const aM = V(-0.05, 1.28, -0.20);
    const aT = V(-0.08, 1.52, -0.24);
    tube(aB, aM, 0.020, 0.013, 5, P.antenna);
    tube(aM, aT, 0.013, 0.005, 5, P.gunmetalLt, {capB:{hex:P.glow, lift:0.015}});
    /* two small crossbar signal prongs */
    for(const dy of [0.10, 0.20]){
      const cb = V(aB.x + (aM.x-aB.x)*(dy/0.28), aB.y+dy, aB.z + (aM.z-aB.z)*(dy/0.28));
      tube(V(cb.x-0.05,cb.y,cb.z), V(cb.x+0.05,cb.y,cb.z), 0.006, 0.006, 4, P.gunmetal);
    }
  }

  /* arms — thin, half-dissolved to static wisp at the hands, one raised as if still gesturing */
  {
    const shL = V(-0.19, 0.90, 0);
    const elL = V(-0.24, 0.68, 0.04);
    const hnL = V(-0.20, 0.46, 0.06);
    tube(shL, elL, 0.052, 0.042, 6, P.spec, {phase:Math.PI/6});
    tube(elL, hnL, 0.042, 0.020, 6, P.specDk, {phase:Math.PI/6, capB:{hex:P.glowDk, lift:0.02}});

    const shR = V(0.19, 0.90, 0);
    const elR = V(0.27, 0.78, -0.02);
    const hnR = V(0.32, 0.98, -0.05);   // raised toward the headset, frozen mid-gesture
    tube(shR, elR, 0.052, 0.040, 6, P.spec, {phase:Math.PI/6});
    tube(elR, hnR, 0.040, 0.018, 6, P.specDk, {phase:Math.PI/6, capB:{hex:P.glowDk, lift:0.02}});
  }

  /* lower body — dissolves into frayed cable-tendrils instead of legs; hovers just off the tile */
  {
    const hipL = V(-0.10, 0.52, 0.01);
    const hipR = V(0.10, 0.52, 0.01);
    const tendril=(hip, dx, dz)=>{
      const m = V(hip.x+dx*0.4, 0.30, hip.z+dz*0.4);
      const t = V(hip.x+dx,     0.10, hip.z+dz);
      tube(hip, m, 0.045, 0.024, 5, P.cable);
      tube(m, t, 0.024, 0.004, 5, P.cableDk, {capB:{hex:P.glowDk, lift:0.01}});
    };
    tendril(hipL, -0.05, 0.02); tendril(hipL, 0.02, -0.06); tendril(hipL, -0.10, -0.08);
    tendril(hipR,  0.05, 0.02); tendril(hipR, -0.02, -0.06); tendril(hipR,  0.10, -0.08);
  }

  /* base — a thin static/glow ring (it hovers, not stands), Medium: r=0.42 */
  {
    const r1=ring(V(0,0.02,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.05,0), V(0,1,0), 0.36, 0.36, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
