/* dev/model-qa/creatures/mon-eyetyrant.js — the EYE-TYRANT (bespoke ABERRATION, a beholder).
   Whole-object grammar: one function, one merged geometry frame, no anchors, no part-object
   transforms. The read: a floating SPHERICAL body hovering over its disc, dominated by ONE huge
   central EYE (a domed lens over a dark socket recess — NO eye quads, shape only), a wide fanged
   MAW below it, and many writhing EYE-STALKS sprouting off the crown, each a thin tentacle tipped
   with a small eye-bulb. Mottled purple-grey hide, VS-desaturated (dirty, never candy). Body
   centered over the disc, rising in +y rather than sprawling past the r=0.55 footprint.
   Imported by the p2mon proof sheet + the engine registry (per CREATURE-MODELS-P2.md §1/§2). */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildEyeTyrant(){
  /* ---------- PALETTE (VS desaturated — mottled purple-grey hide, dark socket, pale fangs) ---------- */
  const P = {
    hide:0x5a5262, hideDk:0x413b4a, hideLt:0x6e6678,      // mottled purple-grey hide
    mottleA:0x4c4658, mottleB:0x655d70,                    // dorsal mottle patches
    underbelly:0x746a7c,                                   // paler lower hide
    lensRim:0x847a86, lens:0x8c96a0, lensDk:0x565e68,      // domed eye lens (glassy but desaturated)
    socket:0x1c1820,                                       // dark socket recess (NOT a painted eye)
    maw:0x231e28, gum:0x4a2e34, fang:0xc9c2ae, tongue:0x6e3038,
    stalk:0x554e60, stalkDk:0x3c3746,
    bulb:0x6c6478, bulbSocket:0x1a1620,                     // small stalk-eye bulbs (recess, not a quad-eye)
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.lens]:'glass', [P.lensDk]:'glass', [P.lensRim]:'glass',
    [P.fang]:'bone', [P.hide]:'scale', [P.hideDk]:'scale', [P.hideLt]:'scale',
  });

  /* ---------- LANDMARKS — body centered over the disc, hovering; crown at +y for the stalks. ---------- */
  const bodyY = 0.62;                 // body center height (hovering above the disc)
  const C0 = V(0, bodyY, 0);

  /* ---------- BODY — one vertical loft; a fat mottled sphere, slightly flattened top/bottom. ---------- */
  {
    const n = 12, ph = Math.PI/n;
    const bands = [
      {y:bodyY-0.360, r:0.100, hex:P.hideDk},   // low belly pinch
      {y:bodyY-0.300, r:0.230, hex:P.underbelly},
      {y:bodyY-0.170, r:0.360, hex:P.hide},
      {y:bodyY-0.020, r:0.420, hex:P.mottleA},  // widest — equator
      {y:bodyY+0.150, r:0.380, hex:P.hide},
      {y:bodyY+0.300, r:0.270, hex:P.mottleB},
      {y:bodyY+0.400, r:0.150, hex:P.hideDk},   // crown base (stalks root here)
    ];
    const rings = bands.map(b => ring(V(0,b.y,0), V(0,1,0), b.r, b.r, n, ph));
    stitch(rings, b => bands[b].hex);
    capFan(rings[0], V(0, bodyY-0.400, 0), P.hideDk, true);   // seal the belly
    capFan(rings.at(-1), V(0, bodyY+0.440, 0), P.hideDk);     // low dome cap between the stalks

    /* mottle patches scattered on the flank — a few extra dirty blotch quads over the hide */
    const blot = (ang, y, w) => {
      const x0 = Math.cos(ang)*0.40, z0 = Math.sin(ang)*0.40;
      const x1 = Math.cos(ang+w)*0.38, z1 = Math.sin(ang+w)*0.38;
      quad(V(x0,y-0.05,z0), V(x1,y-0.03,z1), V(x1*0.9,y+0.09,z1*0.9), V(x0*0.9,y+0.07,z0*0.9), P.mottleA, 0.08);
    };
    blot(0.6, bodyY+0.02, 0.5); blot(2.3, bodyY-0.06, 0.4); blot(4.0, bodyY+0.10, 0.45); blot(5.2, bodyY-0.02, 0.5);
  }

  /* ---------- CENTRAL EYE — one huge domed lens over a dark socket recess, front-facing (+z). ---------- */
  {
    const eyeZ = 0.395, eyeY = bodyY + 0.04;
    const n = 10, ph = Math.PI/n;
    // dark socket recess: a shallow ring pushed slightly INTO the body (shape, not a painted quad)
    const rimOuter = ring(V(0,eyeY,eyeZ-0.02), V(0,0,1), 0.235, 0.235, n, ph);
    const rimInner = ring(V(0,eyeY,eyeZ+0.01), V(0,0,1), 0.185, 0.185, n, ph);
    stitch([rimOuter, rimInner], () => P.lensRim);
    capFan(rimInner, V(0,eyeY,eyeZ-0.03), P.socket, true);     // the dark socket floor (recess read)
    // the domed lens bulging OUT over the socket
    const lensBase = ring(V(0,eyeY,eyeZ+0.02), V(0,0,1), 0.185, 0.185, n, ph);
    const lensMid  = ring(V(0,eyeY,eyeZ+0.11), V(0,0,1), 0.150, 0.150, n, ph);
    stitch([lensBase, lensMid], () => P.lens);
    capFan(lensMid, V(0,eyeY,eyeZ+0.155), P.lensDk);           // domed tip, darker glassy highlight-shadow
    // lower + upper lid folds (shape wrinkles, no eye quad)
    quad(V(-0.24,eyeY-0.185,eyeZ-0.02), V(0.24,eyeY-0.185,eyeZ-0.02), V(0.20,eyeY-0.230,eyeZ-0.06), V(-0.20,eyeY-0.230,eyeZ-0.06), P.hideDk, 0.05);
    quad(V(-0.24,eyeY+0.195,eyeZ-0.02), V(0.24,eyeY+0.195,eyeZ-0.02), V(0.20,eyeY+0.235,eyeZ-0.06), V(-0.20,eyeY+0.235,eyeZ-0.06), P.hideDk, 0.05);
  }

  /* ---------- MAW — a wide fanged mouth low on the body, under the central eye. ---------- */
  {
    const mawY = bodyY - 0.235, mawZ = 0.320;
    // dark maw recess (a shallow lofted gash)
    quad(V(-0.220,mawY+0.03,mawZ-0.05), V(0.220,mawY+0.03,mawZ-0.05), V(0.190,mawY-0.075,mawZ+0.03), V(-0.190,mawY-0.075,mawZ+0.03), P.maw, 0.04);
    quad(V(-0.190,mawY-0.075,mawZ+0.03), V(0.190,mawY-0.075,mawZ+0.03), V(0.150,mawY-0.02,mawZ+0.10), V(-0.150,mawY-0.02,mawZ+0.10), P.gum, 0.05);
    // fangs — upper row jutting down, lower row jutting up, spread across the wide jaw
    const fangAt = (x, yTop, yTip, z) => {
      tube(V(x,yTop,z), V(x,yTip,z), 0.020, 0.003, 4, P.fang, {capB:{hex:P.fang, lift:0.003}});
    };
    for(const x of [-0.170,-0.100,-0.030,0.030,0.100,0.170]){
      fangAt(x, mawY+0.02, mawY-0.09, mawZ-0.02);      // upper fangs pointing down
      fangAt(x*0.9, mawY-0.06, mawY+0.02, mawZ+0.04);  // lower fangs pointing up
    }
    // a stub of dark tongue
    tube(V(0,mawY-0.02,mawZ+0.02), V(0,mawY-0.03,mawZ+0.14), 0.045, 0.030, 5, P.tongue, {capB:{hex:P.tongue, lift:0.01}});
  }

  /* ---------- EYE-STALKS — many writhing tentacles sprouting off the crown, each tipped with a
     small eye-bulb (a dark socket recess, no quad-eye). Roots ring the crown-base (~y bodyY+0.34),
     splay outward + curl, rising above the body but staying within the disc footprint. ---------- */
  {
    const nStalks = 7, crownY = bodyY + 0.36, crownR = 0.20;
    for(let i=0;i<nStalks;i++){
      const a = (i/nStalks) * Math.PI*2 + 0.3;
      const rootX = Math.cos(a)*crownR, rootZ = Math.sin(a)*crownR;
      const root = V(rootX, crownY, rootZ);
      const outX = Math.cos(a)*0.34, outZ = Math.sin(a)*0.34;
      const reach = 0.30 + 0.06*((i*37)%5);           // slight length variety, deterministic
      const curl  = (i%2===0) ? 1 : -1;
      const p1 = V(outX*0.55, crownY+0.16, outZ*0.55);
      const p2 = V(outX*0.95 + curl*0.05, crownY+0.30+reach*0.35, outZ*0.95 - curl*0.04);
      const tip = V(outX*0.75 + curl*0.10, crownY+0.30+reach, outZ*0.75 - curl*0.08);
      tube(root, p1, 0.048, 0.036, 6, P.stalk, {capA:{hex:P.stalkDk}});
      tube(p1, p2, 0.036, 0.024, 6, P.stalkDk);
      tube(p2, tip, 0.024, 0.017, 6, P.stalk);
      // small eye-bulb at the tip: a bulge with a tiny dark socket recess facing outward
      const bulgeTip = V(tip.x + outX*0.06, tip.y+0.03, tip.z + outZ*0.06);
      tube(tip, bulgeTip, 0.017, 0.052, 6, P.stalk, {capB:{hex:P.stalk, lift:0.01}});
      const facing = new THREE.Vector3(outX, 0.15, outZ).normalize();
      const socketC = bulgeTip.clone().addScaledVector(facing, 0.03);
      const sRing = ring(socketC, facing, 0.026, 0.026, 6, 0);
      capFan(sRing, socketC.clone().addScaledVector(facing, -0.012), P.bulbSocket);
    }
  }

  /* ---------- base disc (Large-tier footprint per §1: discR=0.55) ---------- */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2 = ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], () => P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
