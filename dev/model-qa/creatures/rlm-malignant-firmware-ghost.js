/* dev/model-qa/creatures/rlm-malignant-firmware-ghost.js — MALIGNANT FIRMWARE GHOST (chrome,
   Medium construct-possession spirit, CR 7). Read: a flickering corrupted subroutine possessing
   whatever machinery is nearest — modeled here mid-possession, a jagged glitch-humanoid silhouette
   made of torn data-shards and open port-tendrils that plug into a host chassis fragment it
   drags with it. Glitch-read: the "body" is a fractured, offset, semi-transparent read — jagged
   broken-glass panel shards instead of smooth limbs, seams that don't quite line up (glitch, not
   sloppy). Chrome register: cold error-red over dead gunmetal static. NO eye quads — a single
   broken scan-line visor slash instead. Whole-object grammar: one function, one frame, no
   anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildMalignantFirmwareGhost(){
  const P = {
    shard:0x3c4448, shardDk:0x24292c, shardLt:0x5c666a,     // glitch-glass shard panels
    err:0xd6303c, errDk:0x7a1620, errGlow:0xff5a62,          // corrupted error-red accents
    port:0x1a1e20, cable:0x161a1c,
    chassis:0x565d60, chassisDk:0x353b3d,                    // dragged host-chassis fragment
    visor:0x0e1112,
    disc:0x263034, discTop:0x35434a,
  };

  const S = {
    core:  V(0, 0.62, 0),
    chest: V(0, 0.94, 0.01),
    neck:  V(0, 1.12, -0.02),
    headB: V(0.02, 1.16, 0),   // offset — glitch, not centered
    headT: V(-0.02, 1.36, 0.01),
  };

  /* torso — a jagged glitch-shard column, offset panels not a smooth loft */
  tube(S.core, S.chest, 0.150, 0.185, 6, P.shard, {phase:Math.PI/6});
  tube(S.chest, S.neck, 0.185, 0.090, 6, P.shardDk, {phase:Math.PI/6, capB:{hex:P.shardDk, lift:0.01}});
  /* broken-glass shard panels stuck at wrong angles across the chest — the glitch silhouette read */
  quad(V(-0.16,0.86,0.16), V(0.02,0.98,0.20), V(-0.01,1.10,0.15), V(-0.19,1.00,0.12), P.shardLt, 0.09);
  quad(V(0.00,0.80,0.17), V(0.20,0.90,0.19), V(0.16,1.04,0.13), V(-0.02,0.96,0.12), P.err, 0.10);
  quad(V(-0.10,0.70,0.19), V(0.10,0.72,0.20), V(0.08,0.86,0.16), V(-0.09,0.85,0.155), P.shard, 0.08);

  /* head — offset glitch skull-shard, broken scan-line visor slash instead of eyes */
  {
    const n=7, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,       cx:0.02, rx:0.100, rz:0.098, hex:P.shardDk},
      {y:S.headB.y+0.10,  cx:-0.01,rx:0.108, rz:0.104, hex:P.shard},
      {y:S.headT.y-0.03,  cx:-0.02,rx:0.092, rz:0.088, hex:P.shardLt},
    ];
    const rings=bands.map(b=>ring(V(b.cx,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(-0.02,S.headT.y,0.01), P.shardDk);

    /* the broken scan-line visor — a jagged single slash, not level, cutting across the face */
    quad(V(-0.10,S.headT.y-0.08,0.088), V(0.09,S.headT.y-0.11,0.09), V(0.085,S.headT.y-0.135,0.085), V(-0.095,S.headT.y-0.10,0.083), P.visor, 0.05);
    quad(V(-0.07,S.headT.y-0.095,0.09), V(0.04,S.headT.y-0.105,0.092), V(0.03,S.headT.y-0.115,0.088), V(-0.06,S.headT.y-0.105,0.086), P.errGlow, 0.12);
    quad(V(0.02,S.headT.y-0.10,0.09), V(0.07,S.headT.y-0.125,0.088), V(0.065,S.headT.y-0.135,0.084), V(0.015,S.headT.y-0.11,0.085), P.err, 0.10);
  }

  /* port-tendrils — open cables trailing from the shoulders/back, plugging into the dragged
     host-chassis fragment — the "possessing machinery through open ports" read */
  {
    const shoulders = [V(-0.20,0.98,-0.02), V(0.18,0.96,0.00), V(0,1.06,-0.10)];
    for(const sh of shoulders){
      const mid = V(sh.x*1.4, sh.y-0.28, sh.z-0.22);
      const end = V(sh.x*1.7, 0.30, sh.z-0.42);
      tube(sh, mid, 0.026, 0.018, 5, P.cable);
      tube(mid, end, 0.018, 0.010, 5, P.port, {capB:{hex:P.errGlow, lift:0.012}});
    }
  }

  /* dragged host-chassis fragment — a broken machine-panel hull piece at the ghost's flank,
     with a torn-open port socket the tendrils plug into */
  {
    const cB = V(0.30, 0.10, -0.30);
    quad(V(cB.x-0.14,cB.y+0.02,cB.z-0.10), V(cB.x+0.14,cB.y+0.05,cB.z-0.14), V(cB.x+0.16,cB.y+0.24,cB.z+0.02), V(cB.x-0.10,cB.y+0.20,cB.z+0.06), P.chassis, 0.06);
    quad(V(cB.x-0.10,cB.y+0.06,cB.z-0.04), V(cB.x+0.06,cB.y+0.08,cB.z-0.06), V(cB.x+0.07,cB.y+0.18,cB.z+0.01), V(cB.x-0.09,cB.y+0.16,cB.z+0.02), P.chassisDk, 0.05);
    /* torn socket, glowing where a tendril plugs in */
    quad(V(cB.x-0.03,cB.y+0.10,cB.z-0.02), V(cB.x+0.03,cB.y+0.10,cB.z-0.02), V(cB.x+0.025,cB.y+0.05,cB.z-0.01), V(cB.x-0.025,cB.y+0.05,cB.z-0.01), P.errGlow, 0.15);
  }

  /* arms — thin jagged shard-limbs, one reaching toward the chassis fragment */
  {
    const shL = V(-0.20, 0.98, -0.02);
    const elL = V(-0.28, 0.76, 0.02);
    const hnL = V(-0.22, 0.56, 0.06);
    tube(shL, elL, 0.048, 0.036, 5, P.shard);
    tube(elL, hnL, 0.036, 0.016, 5, P.shardDk, {capB:{hex:P.errGlow, lift:0.015}});

    const shR = V(0.18, 0.96, 0.00);
    const elR = V(0.30, 0.62, -0.10);
    const hnR = V(0.32, 0.32, -0.22);   // reaching down toward the chassis
    tube(shR, elR, 0.048, 0.034, 5, P.shard);
    tube(elR, hnR, 0.034, 0.014, 5, P.shardDk, {capB:{hex:P.errGlow, lift:0.015}});
  }

  /* legs/lower body — dissolving glitch shards, doesn't fully resolve to feet */
  {
    const hipL = V(-0.09, 0.52, 0.00);
    const hipR = V(0.09, 0.52, 0.02);
    const legStub=(hip, dx)=>{
      const knee = V(hip.x+dx*0.4, 0.28, hip.z-0.02);
      const foot = V(hip.x+dx, 0.06, hip.z+0.02);
      tube(hip, knee, 0.060, 0.038, 5, P.shard);
      tube(knee, foot, 0.038, 0.012, 5, P.shardDk, {capB:{hex:P.err, lift:0.01}});
    };
    legStub(hipL, -0.03); legStub(hipR, 0.05);
  }

  /* base — glitch-static ring, Medium: r=0.42 */
  {
    const r1=ring(V(0,0.02,0), V(0,1,0), 0.42, 0.42, 14);
    const r2=ring(V(0,0.05,0), V(0,1,0), 0.37, 0.37, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
