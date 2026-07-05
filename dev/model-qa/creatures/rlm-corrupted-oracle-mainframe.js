/* dev/model-qa/creatures/rlm-corrupted-oracle-mainframe.js — CORRUPTED ORACLE MAINFRAME (chrome,
   Large construct, CR 9). Read: a squat mainframe server-core housed in a stolen drone-army
   chassis — a boxy central data-tower body riding on four splayed mechanical drone-legs, ringed
   by mounted turret-arms and a crown of cracked cooling-fin antennae, everything red-lit and
   armed rather than blue/calm (corrupted). Chrome register: server-rack gunmetal gone hostile-
   red. NO eye quads — a single central lens-iris on the tower face instead. Whole-object
   grammar: one function, one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildCorruptedOracleMainframe(){
  const P = {
    rack:0x565d60, rackDk:0x353b3d, rackLt:0x767d80,
    panel:0x3a4144, panelDk:0x22272a,
    err:0xd6303c, errDk:0x7a1620, errGlow:0xff5a62,
    lens:0xff4650, lensDk:0x6e1218,
    fin:0x8a9296, finDk:0x5c6266,
    leg:0x454b4e, legDk:0x2a2f31,
    disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    base:  V(0, 0.62, 0),
    mid:   V(0, 1.00, 0),
    upper: V(0, 1.36, 0),
    top:   V(0, 1.58, 0),
  };

  /* central data-tower body — a boxy server-core, wider than tall (squat), stacked rings for the
     rack-panel read */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.base.y,  rx:0.42, rz:0.38, hex:P.rackDk},
      {y:0.82,      rx:0.46, rz:0.42, hex:P.rack},
      {y:S.mid.y,   rx:0.48, rz:0.44, hex:P.panel},
      {y:1.18,      rx:0.44, rz:0.40, hex:P.rack},
      {y:S.upper.y, rx:0.36, rz:0.33, hex:P.rackDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.top.y-0.10,0), P.rackDk);

    /* server-panel seams + status-light strips running down the front face, all red-lit (corrupted) */
    for(let i=0;i<3;i++){
      const y0 = 0.72+i*0.24, y1 = y0+0.16;
      quad(V(-0.34,y0,0.40), V(-0.24,y0,0.42), V(-0.24,y1,0.44), V(-0.34,y1,0.42), P.panelDk, 0.05);
      quad(V(-0.31,y0+0.03,0.41), V(-0.27,y0+0.03,0.42), V(-0.27,y0+0.11,0.43), V(-0.31,y0+0.11,0.42), P.errGlow, 0.1);
      quad(V(0.24,y0,0.42), V(0.34,y0,0.40), V(0.34,y1,0.42), V(0.24,y1,0.44), P.panelDk, 0.05);
      quad(V(0.27,y0+0.03,0.42), V(0.31,y0+0.03,0.41), V(0.31,y0+0.11,0.42), V(0.27,y0+0.11,0.43), P.errGlow, 0.1);
    }

    /* central lens-iris — the "oracle" face, one big glowing red eye-lens (not a quad eye pair) */
    {
      const lc = V(0, 1.00, 0.44);
      const r1 = ring(lc, V(0,0,1), 0.16, 0.16, 10, Math.PI/10);
      const r2 = ring(V(lc.x,lc.y,lc.z+0.03), V(0,0,1), 0.11, 0.11, 10, Math.PI/10);
      stitch([r1,r2], ()=>P.lensDk);
      capFan(r2, V(lc.x,lc.y,lc.z+0.05), P.lens);
    }
  }

  /* crown of cracked cooling-fin antennae ringing the top */
  {
    const n=6;
    for(let i=0;i<n;i++){
      const a = (i/n)*Math.PI*2;
      const bx = Math.cos(a)*0.30, bz = Math.sin(a)*0.28;
      const fb = V(bx, S.upper.y+0.02, bz);
      const ft = V(bx*1.15, S.upper.y+0.34, bz*1.15);
      tube(fb, ft, 0.045, 0.015, 4, i%2? P.fin : P.err, {capB:{hex:P.errGlow, lift:0.01}});
    }
  }

  /* mounted turret-arms — armed rather than calm, ringing the mid-body */
  {
    const mountTurret=(ang)=>{
      const bx = Math.cos(ang)*0.46, bz = Math.sin(ang)*0.42;
      const base = V(bx, 0.92, bz);
      const joint = V(bx*1.25, 0.96, bz*1.2);
      const muzzle = V(bx*1.55, 0.94, bz*1.5);
      tube(base, joint, 0.075, 0.060, 6, P.legDk);
      tube(joint, muzzle, 0.055, 0.030, 6, P.rack, {capB:{hex:P.errDk, lift:0.01}});
      /* small red targeting glow at the muzzle tip */
      quad(V(muzzle.x-0.02,muzzle.y+0.02,muzzle.z), V(muzzle.x+0.02,muzzle.y+0.02,muzzle.z), V(muzzle.x+0.015,muzzle.y-0.02,muzzle.z), V(muzzle.x-0.015,muzzle.y-0.02,muzzle.z), P.errGlow, 0.15);
    };
    mountTurret(0.6); mountTurret(2.6); mountTurret(-1.0);
  }

  /* four splayed mechanical drone-legs carrying the tower — insectile stance, wide footprint */
  {
    const droneLeg=(ang)=>{
      const bx = Math.cos(ang)*0.28, bz = Math.sin(ang)*0.24;
      const hip  = V(bx, 0.56, bz);
      const knee = V(bx*1.9, 0.30, bz*1.9);
      const foot = V(bx*2.3, 0.04, bz*2.3);
      tube(hip, knee, 0.10, 0.075, 6, P.leg, {phase:Math.PI/6});
      tube(knee, foot, 0.075, 0.045, 6, P.legDk, {phase:Math.PI/6, capB:{hex:P.legDk, lift:0.015}});
      /* small clawed foot pads */
      quad(V(foot.x-0.05,0.03,foot.z-0.05), V(foot.x+0.05,0.03,foot.z-0.05), V(foot.x+0.045,0.01,foot.z+0.06), V(foot.x-0.045,0.01,foot.z+0.06), P.legDk, 0.03);
    };
    droneLeg(Math.PI*0.25); droneLeg(Math.PI*0.75); droneLeg(Math.PI*1.25); droneLeg(Math.PI*1.75);
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
