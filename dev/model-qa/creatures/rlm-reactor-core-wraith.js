/* dev/model-qa/creatures/rlm-reactor-core-wraith.js — REACTOR-CORE WRAITH (chrome, Large
   undead-construct hybrid, CR 11). Read: a translucent engineer's ghost bound to a glowing
   reactor core he still tends — a spectral humanoid torso and head trailing to nothing at the
   waist (hovering), hunched forward over a massive glowing reactor-core housing he carries/is
   fused to at chest height, cables running from the ghost's hands into the core, a heavy
   radiation-warning collar. Chrome register: cold spectral static-blue over a hot amber-orange
   reactor glow — the two-temperature contrast IS the read. NO eye quads — hollow dark sockets,
   the ghost's face lit from below by the reactor glow. Whole-object grammar: one function, one
   frame, no anchors. Large size, base disc r=0.55 (thin hover-ring). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildReactorCoreWraith(){
  const P = {
    spec:0x3a5560, specDk:0x22343c, specLt:0x5a7d88,
    cable:0x232a2c, cableDk:0x14181a,
    core:0x565d60, coreDk:0x2e3336, coreLt:0x8a9296,
    reactor:0xff8a3a, reactorDk:0x8a3f14, reactorGlow:0xffc478,
    socket:0x0a0d0e,
    disc:0x263034, discTop:0x35434a,
  };

  const S = {
    core:  V(0, 0.70, 0),
    chest: V(0, 1.05, -0.05),   // hunched forward over the reactor
    neck:  V(0, 1.28, -0.12),
    headB: V(0, 1.32, -0.13),
    headT: V(0, 1.55, -0.16),
  };

  /* spectral torso — hunched forward, dissolves below the waist (no legs, it hovers) */
  tube(S.core, S.chest, 0.170, 0.200, 8, P.spec, {phase:Math.PI/8});
  tube(S.chest, S.neck, 0.200, 0.100, 8, P.specDk, {phase:Math.PI/8, capB:{hex:P.specDk, lift:0.01}});
  /* radiation-warning collar plate at the base of the neck */
  quad(V(-0.12,1.22,0.02), V(0.12,1.22,0.02), V(0.15,1.30,-0.08), V(-0.15,1.30,-0.08), P.core, 0.05);
  quad(V(-0.03,1.245,-0.01), V(0.03,1.245,-0.01), V(0.025,1.28,-0.07), V(-0.025,1.28,-0.07), P.reactorGlow, 0.1);

  /* head — hunched, hollow sockets lit from below by the reactor glow */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, cz:-0.13,      rx:0.100, rz:0.098, hex:P.specDk},
      {y:S.headB.y+0.10, cz:-0.15, rx:0.108, rz:0.104, hex:P.spec},
      {y:S.headT.y-0.03, cz:-0.17, rx:0.092, rz:0.088, hex:P.spec},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,-0.17), P.specDk);

    /* hollow sockets, warmed by reactor bounce-light (amber tint, not the usual cold blue) */
    for(const s of [-1,1]){
      quad(V(s*0.032-0.024, S.headT.y-0.10, -0.08), V(s*0.032+0.024, S.headT.y-0.10, -0.082),
           V(s*0.032+0.020, S.headT.y-0.145, -0.085), V(s*0.032-0.020, S.headT.y-0.145, -0.083), P.socket, 0.03);
      quad(V(s*0.032-0.012, S.headT.y-0.11, -0.078), V(s*0.032+0.012, S.headT.y-0.11, -0.08),
           V(s*0.032+0.008, S.headT.y-0.13, -0.082), V(s*0.032-0.008, S.headT.y-0.13, -0.081), P.reactorDk, 0.1);
    }
  }

  /* the massive glowing reactor-core housing, fused at chest height — the centerpiece */
  {
    const rc = V(0, 0.94, 0.20);
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:rc.y-0.20, rx:0.24, rz:0.20, hex:P.coreDk},
      {y:rc.y,       rx:0.30, rz:0.24, hex:P.core},
      {y:rc.y+0.20, rx:0.24, rz:0.20, hex:P.coreDk},
    ];
    const rings=bands.map(b=>ring(V(rc.x,b.y,rc.z), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(rc.x,rc.y+0.24,rc.z), P.coreDk);
    capFan(rings[0], V(rc.x,rc.y-0.24,rc.z), P.coreDk, true);
    /* the glowing molten core visible through a viewport ring, front-facing */
    const vc = V(rc.x, rc.y, rc.z+0.20);
    const v1 = ring(vc, V(0,0,1), 0.16, 0.16, 8, Math.PI/8);
    const v2 = ring(V(vc.x,vc.y,vc.z+0.02), V(0,0,1), 0.11, 0.11, 8, Math.PI/8);
    stitch([v1,v2], ()=>P.coreDk);
    capFan(v2, V(vc.x,vc.y,vc.z+0.05), P.reactor);
    quad(V(vc.x-0.05,vc.y+0.02,vc.z+0.055), V(vc.x+0.05,vc.y+0.02,vc.z+0.055), V(vc.x+0.03,vc.y-0.03,vc.z+0.06), V(vc.x-0.03,vc.y-0.03,vc.z+0.06), P.reactorGlow, 0.15);
    /* radiator fins on the housing */
    for(let i=0;i<4;i++){
      const a = Math.PI*0.4 + i*0.5;
      const fx = rc.x+Math.cos(a)*0.28, fz = rc.z+Math.sin(a)*0.24;
      quad(V(fx-0.02,rc.y-0.15,fz), V(fx+0.02,rc.y-0.15,fz), V(fx*1.2-0.015,rc.y+0.15,fz*1.15), V(fx*1.2+0.015,rc.y+0.15,fz*1.15), P.coreLt, 0.06);
    }
  }

  /* arms — thin spectral limbs, hands trailing cables directly into the reactor core */
  {
    const shL = V(-0.20, 1.00, -0.06);
    const elL = V(-0.16, 0.85, 0.10);
    const hnL = V(-0.10, 0.80, 0.24);   // reaching toward the core
    tube(shL, elL, 0.052, 0.042, 6, P.spec, {phase:Math.PI/6});
    tube(elL, hnL, 0.042, 0.022, 6, P.specDk, {phase:Math.PI/6});
    tube(hnL, V(-0.04,0.86,0.20), 0.016, 0.014, 4, P.cable);

    const shR = V(0.19, 1.00, -0.06);
    const elR = V(0.16, 0.85, 0.10);
    const hnR = V(0.10, 0.80, 0.24);
    tube(shR, elR, 0.052, 0.042, 6, P.spec, {phase:Math.PI/6});
    tube(elR, hnR, 0.042, 0.022, 6, P.specDk, {phase:Math.PI/6});
    tube(hnR, V(0.04,0.86,0.20), 0.016, 0.014, 4, P.cable);
  }

  /* lower body — frayed cable-tendrils replacing legs, drifting below the reactor housing */
  {
    const hipL = V(-0.10, 0.60, 0.05);
    const hipR = V(0.10, 0.60, 0.06);
    const tendril=(hip, dx, dz)=>{
      const m = V(hip.x+dx*0.4, 0.32, hip.z+dz*0.4);
      const t = V(hip.x+dx,     0.10, hip.z+dz);
      tube(hip, m, 0.05, 0.026, 5, P.cable);
      tube(m, t, 0.026, 0.005, 5, P.cableDk, {capB:{hex:P.reactorDk, lift:0.01}});
    };
    tendril(hipL, -0.06, -0.02); tendril(hipL, 0.03, -0.10); tendril(hipL, -0.14, -0.08);
    tendril(hipR,  0.06, -0.02); tendril(hipR, -0.03, -0.10); tendril(hipR,  0.14, -0.08);
  }

  /* base — a hover-ring warmed by the reactor's glow beneath, Large: r=0.55 */
  {
    const r1=ring(V(0,0.02,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.05,0), V(0,1,0), 0.46, 0.46, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
