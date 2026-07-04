/* dev/model-qa/creatures/mon-grell.js — the GRELL (bespoke FLOATING ABERRATION, Medium brain-beast).
   The bestiary grell hovers: a bulbous brain-like body with a sharp beak at the front and MANY long
   thin tentacles hanging beneath it. The read: a floating brain-mass, tentacles hanging down to rest
   their tips lightly on the disc, body held up in the air above (rear/rise in +y, not sprawling past
   the disc). Pale veined pinkish-grey flesh, VS-desaturated (dirty, mottled, never candy). NO eye
   quads (dark socket recesses only — a grell has no eyes anyway, all beak+tentacle+brain-mass).
   Whole-object grammar: one function, one merged geometry frame, no anchors. Medium size: disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGrell(){
  /* ---------- PALETTE (VS desaturated pale pinkish-grey brain flesh, dirty veining) ---------- */
  const P = {
    flesh:0x8a7a78, fleshDk:0x6b5f5e, fleshLt:0x9d8d89,     // pale mottled pinkish-grey
    fold:0x59484a, foldDk:0x403234,                          // brain-fold creases (dark grooves)
    vein:0x7a4048, veinDk:0x5c2e34,                          // dirty red-pink veining
    socket:0x2a2020,                                         // dark eyeless recess pits
    beak:0x3a3330, beakDk:0x241f1c, beakLt:0x4c433e,         // sharp dark horn-beak
    tent:0x726260, tentDk:0x564a49, tentTip:0x453b3a,        // tentacle flesh, darker toward tip
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — body floats above the disc; spine runs mostly in +y. ---------- */
  const hoverY = 0.62;                       // brain-body center height (well above disc)
  const S = {
    under:  V(0, hoverY-0.20, 0.02),
    belly:  V(0, hoverY-0.06,  0.05),
    core:   V(0, hoverY+0.05,  0.00),
    crown:  V(0, hoverY+0.22, -0.06),
    beakTip:V(0, hoverY-0.16,  0.34),
  };

  /* ---------- BRAIN-BODY — a bulbous ovoid loft, wider than tall, mottled pale flesh. ---------- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:hoverY-0.22, cz:0.00, rx:0.155, rz:0.170, hex:P.fleshDk},
      {y:hoverY-0.08, cz:0.02, rx:0.270, rz:0.280, hex:P.flesh},
      {y:hoverY+0.06, cz:0.00, rx:0.310, rz:0.300, hex:P.fleshLt},
      {y:hoverY+0.18, cz:-0.03,rx:0.250, rz:0.245, hex:P.flesh},
      {y:hoverY+0.27, cz:-0.05,rx:0.140, rz:0.135, hex:P.fleshDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0, hoverY-0.30, 0.00), P.fleshDk, true);   // seal underside
    capFan(rings.at(-1), V(0, hoverY+0.33, -0.06), P.fleshDk);    // crown cap

    /* BRAIN-FOLD CREASES — dark grooved lines wandering over the top of the mass (a few arcs) */
    const foldArc = (side, y0, y1)=>{
      const z0=0.10*side, z1=-0.06*side, x0=0.16*side, x1=0.06*side;
      quad(V(x0,y0,z0), V(x0+0.03,y0,z0-0.02), V(x1+0.02,y1,z1-0.01), V(x1,y1,z1), P.foldDk, 0.05);
    };
    foldArc(1, hoverY-0.02, hoverY+0.20);
    foldArc(-1,hoverY-0.02, hoverY+0.20);
    quad(V(-0.10,hoverY+0.09,0.24), V(0.10,hoverY+0.09,0.24), V(0.06,hoverY+0.20,0.10), V(-0.06,hoverY+0.20,0.10), P.fold, 0.05);

    /* VEINING — thin dirty red-pink vein streaks over the flanks */
    for(const s of [-1,1]){
      quad(V(s*0.22,hoverY-0.10,-0.05), V(s*0.24,hoverY-0.10,-0.03), V(s*0.20,hoverY+0.10,0.06), V(s*0.18,hoverY+0.10,0.04), P.vein, 0.06);
      quad(V(s*0.14,hoverY-0.18,0.10), V(s*0.17,hoverY-0.16,0.12), V(s*0.15,hoverY-0.02,0.16), V(s*0.12,hoverY-0.04,0.14), P.veinDk, 0.06);
    }

    /* EYELESS SOCKET RECESSES — two dark pits low on the front of the mass, above the beak (shape only) */
    for(const s of [-1,1]){
      const c = V(s*0.10, hoverY-0.06, 0.24);
      quad(V(c.x-0.028,c.y+0.022,c.z), V(c.x+0.028,c.y+0.022,c.z), V(c.x+0.020,c.y-0.022,c.z-0.01), V(c.x-0.020,c.y-0.022,c.z-0.01), P.socket, 0.02);
    }
  }

  /* ---------- BEAK — a large sharp downward-hooking beak jutting from the front of the mass. ---------- */
  {
    const bB = V(0, hoverY-0.15, 0.28);
    const bM = V(0, hoverY-0.22, 0.40);
    const bT = V(0, hoverY-0.34, 0.46);        // hooked tip curls down
    tube(bB, bM, 0.105, 0.075, 8, P.beak,   {raz:0.090, rbz:0.058, phase:Math.PI/8});
    tube(bM, bT, 0.075, 0.018, 8, P.beakDk, {raz:0.058, rbz:0.020, phase:Math.PI/8, capB:{hex:P.beakDk, lift:0.006}});
    /* upper beak ridge highlight + a dark mouth seam where the beak halves meet */
    quad(V(-0.05,hoverY-0.10,0.28), V(0.05,hoverY-0.10,0.28), V(0.03,hoverY-0.24,0.42), V(-0.03,hoverY-0.24,0.42), P.beakLt, 0.05);
    quad(V(-0.03,hoverY-0.18,0.30), V(0.03,hoverY-0.18,0.30), V(0.015,hoverY-0.30,0.44), V(-0.015,hoverY-0.30,0.44), P.beakDk, 0.03);
  }

  /* ---------- TENTACLES — MANY long thin hanging tentacles under the body, tips resting on the disc. ---------- */
  {
    const NT = 9;
    for(let i=0;i<NT;i++){
      const a = (i/NT)*Math.PI*2 + 0.3;
      const rr = 0.135 + 0.03*((i*37)%5)/5;              // slight radius variance so roots scatter
      const rootX = Math.cos(a)*rr, rootZ = Math.sin(a)*rr*0.95;
      const root = V(rootX, hoverY-0.24, rootZ);
      const droop = 0.55 + 0.10*((i*53)%7)/7;             // varied length so tips don't all match
      const sway  = 0.10 + 0.06*((i*19)%4)/4;
      const midX = rootX*1.6 + Math.cos(a+1.1)*sway;
      const midZ = rootZ*1.6 + Math.sin(a+1.1)*sway;
      const midY = hoverY-0.24 - droop*0.55;
      const tipX = rootX*1.9 + Math.cos(a+0.4)*sway*0.6;
      const tipZ = rootZ*1.9 + Math.sin(a+0.4)*sway*0.6;
      const tip  = V(tipX, 0.04, tipZ);                   // tip rests on the disc
      const mid  = V(midX, midY, midZ);
      tube(root, mid, 0.032, 0.018, 5, P.tent,    {phase:Math.PI/5});
      tube(mid,  tip, 0.018, 0.006, 5, P.tentDk,  {phase:Math.PI/5, capB:{hex:P.tentTip, lift:0.005}});
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
