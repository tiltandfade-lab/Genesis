/* dev/model-qa/creatures/prop-sentry-turret-mount.js — SENTRY TURRET MOUNT (CHROME set piece, Medium).
   A swivel-mounted weapon housing on a stub pillar — the read: a stubby armored PILLAR planted on
   the tile, topped by a collar-ring swivel joint, carrying a bulbous armored HOUSING with twin
   barrel-stubs poking forward and a sensor-lens node on top. Dead/dormant (no glow tell — this is
   set dressing, not a lit prop), scuffed chrome/gunmetal, VS-desaturated (Adam's chrome-register
   note: bright tech reads candy on the surface, still gritted underneath — so scuffed + oxidized,
   not showroom-clean). One function, one geometry frame, no anchors. Sits on base disc r=0.42.
   Imported by prop-sentry-turret-mount-probe.html. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropSentryTurretMount(){
  /* ---------- PALETTE (VS desaturated gunmetal/chrome, oxidized + scuffed) ---------- */
  const P = {
    hull:0x565c5f, hullDk:0x3c4144, hullLt:0x767c7f,      // gunmetal housing
    pillar:0x46494a, pillarDk:0x2f3132,                    // stub pillar
    collar:0x6d7275, collarDk:0x4a4e50,                     // swivel collar ring
    lens:0x2a3438, lensRim:0x1a2022,                        // dormant sensor lens (dark glass)
    barrel:0x232527, barrelLt:0x3a3d3f,                     // barrel stubs
    rust:0x5a4a35, scuff:0x8a8f90,                          // oxidation streaks + a scuffed highlight
    disc:0x3a3838, discTop:0x454242,
  };

  /* ---------- STUB PILLAR — a short armored post planted on the tile ---------- */
  const pillarTop = 0.42;
  {
    const b1=ring(V(0,0.05,0), V(0,1,0), 0.16, 0.16, 10, 0);
    const b2=ring(V(0,0.10,0), V(0,1,0), 0.155,0.155,10, 0);
    stitch([b1,b2], ()=>P.pillarDk);
    tube(V(0,0.10,0), V(0,pillarTop,0), 0.145, 0.135, 10, P.pillar, {phase:Math.PI/10});
    // a couple of raised armor bands
    for(const yy of [0.20, 0.32]){
      const r1=ring(V(0,yy,0), V(0,1,0), 0.150, 0.150, 10, 0);
      const r2=ring(V(0,yy+0.025,0), V(0,1,0), 0.150, 0.150, 10, 0);
      stitch([r1,r2], ()=>P.pillarDk);
    }
  }

  /* ---------- COLLAR — the swivel joint ring atop the pillar ---------- */
  const collarY = pillarTop + 0.06;
  {
    const c1=ring(V(0,pillarTop+0.01,0), V(0,1,0), 0.175,0.175,12, 0);
    const c2=ring(V(0,collarY,0), V(0,1,0), 0.19,0.19,12, 0);
    const c3=ring(V(0,collarY+0.05,0), V(0,1,0), 0.175,0.175,12, 0);
    stitch([c1,c2], ()=>P.collar);
    stitch([c2,c3], ()=>P.collarDk);
  }

  /* ---------- HOUSING — a bulbous armored body sitting on the collar, swiveled slightly off-axis
     so it reads as a turret rather than a symmetric lump. ---------- */
  const hy = collarY + 0.06;
  const yaw = 0.35; // slight swivel off dead-ahead
  const fwd = V(Math.sin(yaw), 0, Math.cos(yaw));
  {
    const bands = [
      {y:hy,       cz:0,             rx:0.20, hex:P.hullDk},
      {y:hy+0.10,  cz:fwd.z*0.02,    rx:0.235,hex:P.hull},
      {y:hy+0.22,  cz:fwd.z*0.03,    rx:0.215,hex:P.hullLt},
      {y:hy+0.32,  cz:fwd.z*0.01,    rx:0.150,hex:P.hullDk},
    ];
    const rings = bands.map(b=>ring(V(fwd.x*b.cz*0+0, b.y, b.cz), V(0,1,0), b.rx, b.rx, 12, Math.PI/12));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, hy+0.36, bands.at(-1).cz), P.hullDk);
  }

  /* ---------- TWIN BARREL STUBS — poking forward from the housing, offset either side of the yaw ---------- */
  {
    const muzzleY = hy + 0.16;
    for(const s of [-1,1]){
      const root = V(fwd.x*0.14 + s*Math.cos(yaw)*0.075, muzzleY, fwd.z*0.14 - s*Math.sin(yaw)*0.075);
      const tip  = V(fwd.x*0.44 + s*Math.cos(yaw)*0.075, muzzleY, fwd.z*0.44 - s*Math.sin(yaw)*0.075);
      tube(root, tip, 0.038, 0.030, 8, P.barrel, {capB:{hex:P.barrelLt, lift:0.01}});
      // muzzle collar
      const mc1=ring(V(root.x+(tip.x-root.x)*0.15, muzzleY, root.z+(tip.z-root.z)*0.15), V(tip.x-root.x,0,tip.z-root.z), 0.042, 0.042, 8, 0);
      const mc2=ring(V(root.x+(tip.x-root.x)*0.22, muzzleY, root.z+(tip.z-root.z)*0.22), V(tip.x-root.x,0,tip.z-root.z), 0.040, 0.040, 8, 0);
      stitch([mc1,mc2], ()=>P.barrelLt);
    }
  }

  /* ---------- SENSOR LENS NODE — a dark dormant eye-lens node on top of the housing ---------- */
  {
    const lc = V(fwd.x*0.10, hy+0.36, fwd.z*0.10);
    const l1=ring(lc, V(0,1,0), 0.062, 0.062, 10, 0);
    const l2=ring(V(lc.x,lc.y+0.03,lc.z), V(0,1,0), 0.062, 0.062, 10, 0);
    stitch([l1,l2], ()=>P.lensRim);
    capFan(l2, V(lc.x,lc.y+0.032,lc.z), P.lens);
  }

  /* ---------- scuffs + oxidation streaks (VS-gritted-tech tell) ---------- */
  quad(V(-0.10,hy+0.04,0.14), V(-0.04,hy+0.05,0.14), V(-0.05,hy+0.20,0.10), V(-0.11,hy+0.19,0.10), P.rust, 0.06);
  quad(V(0.06,hy+0.12,-0.14), V(0.13,hy+0.13,-0.14), V(0.12,hy+0.24,-0.10), V(0.05,hy+0.23,-0.10), P.scuff, 0.08);

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
