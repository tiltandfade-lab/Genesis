/* dev/model-qa/creatures/rlm-rogue-custodian-ai-manifested.js — ROGUE CUSTODIAN AI (MANIFESTED)
   (chrome, Large construct, CR 5). Read: a floor-spanning maintenance-arm chassis BUILT INTO
   THE WALLS — not a freestanding robot but a squat central hub anchored low with several
   jointed maintenance arms (tool-tipped: clamp, saw, welder-lens) radiating outward low to
   the ground, as if torn out of a wall socket and still trailing conduit. Chrome register:
   clean hard surfaces gone grimy — pale gunmetal, cracked white housing, a live blue-white
   glow at the welder lens. NO eye quads — the welder-lens stands in as the "face". Whole-
   object grammar: one function, one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildRogueCustodianAIManifested(){
  const P = {
    hull:0x868e96, hullDk:0x585f66, hullLt:0xa8afb5,
    poly:0xc4c9cc, polyDk:0x898e91,
    gun:0x44494e, gunDk:0x282c30, gunLt:0x5c6266,
    conduit:0x2c3238, conduitDk:0x181c20,
    weld:0x6fd8f0, weldDk:0x1c5a68,
    rivet:0x1a1c1e, disc:0x4a4038, discTop:0x585047,
  };

  const hubY = 0.42;
  const hub = V(0, hubY, 0);

  /* CENTRAL HUB — squat armored drum, the anchor mass */
  {
    const bands=[
      {y:hubY-0.20, rx:0.34, hex:P.hullDk},
      {y:hubY-0.02, rx:0.38, hex:P.hull},
      {y:hubY+0.18, rx:0.32, hex:P.hullLt},
      {y:hubY+0.30, rx:0.20, hex:P.gunDk},
    ];
    const n=10, ph=Math.PI/n;
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,hubY+0.34,0), P.gunDk);
    capFan(rings[0], V(0,hubY-0.24,0), P.hullDk, true);
    /* riveted panel seams around the hub equator */
    for(let i=0;i<10;i++){ const t=(i/10)*Math.PI*2;
      quad(V(Math.cos(t)*0.36,hubY+0.02,Math.sin(t)*0.36), V(Math.cos(t)*0.36+0.02,hubY+0.02,Math.sin(t)*0.36+0.02),
           V(Math.cos(t)*0.35+0.02,hubY-0.06,Math.sin(t)*0.35+0.02), V(Math.cos(t)*0.35,hubY-0.06,Math.sin(t)*0.35), P.rivet, 0.02);
    }
    /* welder-lens "face" set high on the hub, forward-facing */
    quad(V(-0.08,hubY+0.22,0.30), V(0.08,hubY+0.22,0.30), V(0.065,hubY+0.10,0.31), V(-0.065,hubY+0.10,0.31), P.gunDk, 0.03);
    quad(V(-0.05,hubY+0.19,0.315), V(0.05,hubY+0.19,0.315), V(0.04,hubY+0.13,0.32), V(-0.04,hubY+0.13,0.32), P.weld, 0.06);
    quad(V(-0.03,hubY+0.17,0.318), V(0.03,hubY+0.17,0.318), V(0.024,hubY+0.14,0.322), V(-0.024,hubY+0.14,0.322), P.weldDk, 0.05);
  }

  /* torn conduit stub trailing up from the hub — "built into the walls" signal */
  {
    const c0 = V(0.05, hubY+0.30, -0.20);
    const c1 = V(0.10, hubY+0.55, -0.30);
    const c2 = V(0.08, hubY+0.72, -0.34);
    tube(c0, c1, 0.055, 0.040, 6, P.conduit);
    tube(c1, c2, 0.040, 0.022, 6, P.conduitDk, {capB:{hex:P.conduitDk, lift:0.01}});
    /* frayed conduit ends, jagged */
    for(const s of [-1,1]) quad(V(c2.x,c2.y,c2.z), V(c2.x+s*0.03,c2.y+0.05,c2.z+s*0.02), V(c2.x+s*0.02,c2.y+0.02,c2.z), V(c2.x,c2.y,c2.z), P.conduitDk, 0.08);
  }

  /* FOUR MAINTENANCE ARMS radiating low and outward, each ending in a tool head */
  {
    const armSet=[
      {ang:0.5,  tool:'clamp'},
      {ang:2.0,  tool:'saw'},
      {ang:3.6,  tool:'clamp'},
      {ang:5.2,  tool:'weld'},
    ];
    for(const {ang,tool} of armSet){
      const dx=Math.cos(ang), dz=Math.sin(ang);
      const shoulder = V(dx*0.30, hubY-0.05, dz*0.30);
      const elbow    = V(dx*0.62, hubY-0.18, dz*0.62);
      const wrist    = V(dx*0.92, hubY-0.14, dz*0.92);
      tube(shoulder, elbow, 0.075, 0.055, 7, P.gun, {phase:Math.PI/7});
      tube(elbow, wrist, 0.055, 0.038, 7, P.gunLt, {phase:Math.PI/7});
      /* joint knuckle */
      const jr1 = ring(elbow, V(0,1,0), 0.065, 0.065, 6, Math.PI/6);
      const jr2 = ring(V(elbow.x,elbow.y+0.03,elbow.z), V(0,1,0), 0.060, 0.060, 6, Math.PI/6);
      stitch([jr1,jr2], ()=>P.hullDk);

      if(tool==='clamp'){
        const tipA = V(wrist.x+dx*0.10-dz*0.05, wrist.y-0.02, wrist.z+dz*0.10+dx*0.05);
        const tipB = V(wrist.x+dx*0.10+dz*0.05, wrist.y-0.02, wrist.z+dz*0.10-dx*0.05);
        tube(wrist, tipA, 0.026, 0.010, 4, P.gunDk, {capB:{hex:P.gunDk, lift:0.005}});
        tube(wrist, tipB, 0.026, 0.010, 4, P.gunDk, {capB:{hex:P.gunDk, lift:0.005}});
      } else if(tool==='saw'){
        const saw = V(wrist.x+dx*0.14, wrist.y-0.01, wrist.z+dz*0.14);
        const r1 = ring(saw, V(dx,0,dz), 0.075, 0.075, 8, Math.PI/8);
        const r2 = ring(V(saw.x,saw.y,saw.z), V(dx,0,dz), 0.075, 0.075, 8, 0);
        stitch([r1,r2], ()=>P.gunLt);
      } else {
        const tip = V(wrist.x+dx*0.14, wrist.y-0.01, wrist.z+dz*0.14);
        tube(wrist, tip, 0.022, 0.010, 5, P.gunDk, {capB:{hex:P.weld, lift:0.006}});
      }
    }
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
