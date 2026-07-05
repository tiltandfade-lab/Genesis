/* dev/model-qa/creatures/rlm-the-last-battery.js — THE LAST BATTERY (chrome, Gargantuan
   elemental/construct, CR 15). Read: a cracked, humanoid-scale power core wreathed in arcing
   blue-white current, scaled up to Gargantuan — a tall vertical cell-casing (like a giant
   battery cell standing on end), split by deep jagged cracks that leak glowing current,
   wrapped in loose branching arc-tendrils reaching outward and upward off the casing. Chrome
   register: dark scorched-gunmetal casing gone monumental, cracked to reveal the cold
   blue-white "cheap miracle" glow beneath. NO eye quads — pure energy form, no face. Whole-
   object grammar: one function, one frame, no anchors. Gargantuan size, base disc r=0.72. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheLastBattery(){
  const P = {
    cell:0x3a3e42, cellDk:0x201f22, cellLt:0x565a5e,
    crack:0x14161a,
    glow:0x9ff2ff, glowDk:0x2a8fa8, glowCore:0xd8fbff,
    cap:0x585c60, capDk:0x303336,
    disc:0x4a4038, discTop:0x585047,
  };

  const baseY = 0.30;
  const topY  = 2.5;

  /* CELL CASING — tall cylinder, humanoid-battery-cell silhouette scaled to Gargantuan */
  {
    const bands=[
      {y:baseY,       rx:0.44, hex:P.cellDk},
      {y:baseY+0.5,    rx:0.48, hex:P.cell},
      {y:baseY+1.2,    rx:0.46, hex:P.cellLt},
      {y:baseY+1.9,    rx:0.42, hex:P.cell},
      {y:topY-0.15,     rx:0.30, hex:P.cellDk},
      {y:topY,          rx:0.20, hex:P.cap},
    ];
    const n=12, ph=Math.PI/n;
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,topY+0.10,0), P.capDk);
    capFan(rings[0], V(0,baseY-0.06,0), P.cellDk, true);
    /* cell contact cap — small terminal knob on top */
    {
      const tb = ring(V(0,topY+0.06,0), V(0,1,0), 0.10, 0.10, 8, Math.PI/8);
      const tt = ring(V(0,topY+0.16,0), V(0,1,0), 0.07, 0.07, 8, Math.PI/8);
      stitch([tb,tt], ()=>P.cap);
      capFan(tt, V(0,topY+0.19,0), P.capDk);
    }
  }

  /* DEEP JAGGED CRACKS running the casing, leaking glow from within */
  {
    const crackLine=(x0z0, angJit, y0, y1)=>{
      const [x0,z0]=x0z0;
      const pts=[];
      const steps=6;
      for(let i=0;i<=steps;i++){
        const t=i/steps, y=y0+(y1-y0)*t;
        const jig=(i%2? 0.03:-0.03)*angJit;
        pts.push(V(x0+jig, y, z0+jig*0.6));
      }
      for(let i=0;i<pts.length-1;i++){
        const a=pts[i], b=pts[i+1];
        quad(V(a.x-0.02,a.y,a.z-0.01), V(a.x+0.02,a.y,a.z+0.01), V(b.x+0.018,b.y,b.z+0.01), V(b.x-0.018,b.y,b.z-0.01), P.crack, 0.04);
        /* glow leaking from inside the crack, narrower strip */
        quad(V(a.x-0.008,a.y,a.z-0.004), V(a.x+0.008,a.y,a.z+0.004), V(b.x+0.007,b.y,b.z+0.004), V(b.x-0.007,b.y,b.z-0.004), P.glow, 0.12);
      }
    };
    crackLine([0.44,0.10], 1.0, baseY+0.2, topY-0.3);
    crackLine([-0.30,0.34], 1.2, baseY+0.4, topY-0.5);
    crackLine([0.10,-0.44], 0.9, baseY+0.6, baseY+1.8);
  }

  /* wide fracture near the base — biggest crack, brightest glow, "cracked open" read */
  {
    const y0=baseY+0.15, y1=baseY+0.65;
    quad(V(0.38,y0,0.20), V(0.46,y0,0.14), V(0.30,y1,0.24), V(0.24,y1,0.30), P.crack, 0.03);
    quad(V(0.36,y0+0.05,0.19), V(0.42,y0+0.05,0.15), V(0.29,y1-0.05,0.22), V(0.25,y1-0.05,0.27), P.glowCore, 0.1);
  }

  /* ARC-TENDRILS — loose branching current reaching outward/upward off the casing surface */
  {
    const tendril=(ang, yBase, tilt, len)=>{
      const dx=Math.cos(ang), dz=Math.sin(ang);
      const surfR = 0.45;
      const p0 = V(dx*surfR, yBase, dz*surfR);
      const p1 = V(dx*(surfR+len*0.5), yBase+tilt*0.5, dz*(surfR+len*0.5));
      const p2 = V(dx*(surfR+len*0.8)-dz*0.05, yBase+tilt*0.9, dz*(surfR+len*0.8)+dx*0.05);
      const tip= V(dx*(surfR+len)+dz*0.03, yBase+tilt, dz*(surfR+len)-dx*0.03);
      tube(p0, p1, 0.040, 0.026, 5, P.glow);
      tube(p1, p2, 0.026, 0.014, 5, P.glowDk);
      tube(p2, tip, 0.014, 0.004, 5, P.glow, {capB:{hex:P.glowCore, lift:0.006}});
    };
    const specs=[
      [0.3, baseY+0.5, 0.5, 0.55], [1.2, baseY+1.3, 0.7, 0.60], [2.1, baseY+0.8, 0.4, 0.45],
      [3.0, baseY+1.7, 0.6, 0.50], [3.9, baseY+0.6, 0.55, 0.55], [4.8, baseY+1.4, 0.65, 0.62],
      [5.6, baseY+1.0, 0.45, 0.48],
    ];
    for(const [a,y,t,l] of specs) tendril(a,y,t,l);
  }

  /* base disc (Gargantuan: r=0.72) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.060,0), V(0,1,0), 0.70, 0.70, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.063,0), P.discTop);
  }
}
