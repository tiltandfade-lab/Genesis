/* dev/model-qa/creatures/mon-cloaker.js — the CLOAKER (bespoke DRAPING MANTA, Large Aberration).
   docs/CREATURE-MODELS-P2.md Wave 3: a living manta-cloak — a wide flat leathery cape-like body
   that hangs in draping folds, a fanged maw running along the top edge, a long thin tail trailing
   below, scalloped edges. Black-grey leather (VS desaturated), pale fang row, dark red maw
   interior. NO eye quads (house ruling — cloakers have no true eyes anyway). Whole-object
   grammar: one function, one geometry frame, no anchors. Large size: base disc r=0.55.
   Imported by the p2mon proof-sheet set + WHOLE_OBJECT_REGISTRY. */
import { V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildCloaker(){
  /* ---------- PALETTE (VS desaturated; black-grey leather cloak, pale fangs, dark red maw) ---------- */
  const P = {
    hideDk:0x2a2b2c, hide:0x3c3d3e, hideLt:0x4c4d4c,      // black-grey leather
    mottleA:0x35363a, mottleB:0x454545,                    // mottled dorsal patches
    rim:0x232426,                                          // scalloped edge, darkest
    maw:0x571f22, mawDk:0x371215,                           // dark red maw interior
    fang:0xc9c2ac, fangDk:0x9a927c,                         // pale fang row
    tail:0x2f3031, tailDk:0x232426,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.hideDk]:'leather', [P.hide]:'leather', [P.hideLt]:'leather',
    [P.mottleA]:'leather', [P.mottleB]:'leather', [P.rim]:'leather',
    [P.maw]:'skin', [P.mawDk]:'skin', [P.fang]:'bone', [P.fangDk]:'bone',
    [P.tail]:'leather', [P.tailDk]:'leather',
  });

  /* ---------- LANDMARKS — the cloak hangs vertically, its top edge (the maw rim) held near the
     disc's rise, draping DOWN in folds toward the ground; a thin tail trails below the hem. ---------- */
  const topY = 0.86;              // top edge (maw rim) — a wide hover-height for a draping cloak
  const S = {
    apex:  V(0, topY, 0.02),      // top-center of the cloak (where it "hangs from")
    ctr:   V(0, 0.50, 0.04),      // mid-body swell
    hem:   V(0, 0.16, 0.02),      // lower hem, before the trailing tail
  };

  /* ---------- BODY — the cloak mass: a broad flattened bell lofted from wide top rings down to a
     narrower hem, front-to-back very thin (leathery membrane), left-right very wide (the wingspan). ---------- */
  {
    const n = 12, ph = Math.PI/n;
    const bands = [
      {y:topY,       rx:0.50, rz:0.10, hex:P.hideDk},   // maw rim — full wingspan
      {y:topY-0.16,  rx:0.52, rz:0.13, hex:P.hide},      // shoulder swell (widest point)
      {y:0.62,       rx:0.46, rz:0.14, hex:P.mottleA},
      {y:0.40,       rx:0.36, rz:0.13, hex:P.hide},
      {y:0.22,       rx:0.24, rz:0.10, hex:P.mottleB},
      {y:0.10,       rx:0.13, rz:0.07, hex:P.hideDk},    // narrowing to the hem
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    // cap the very bottom into the tail root (small, so the tail can spring from it)
    capFan(rings.at(-1), V(0, 0.02, 0.02), P.hideDk, true);
  }

  /* ---------- DRAPING FOLDS — vertical fold lines running down the cloak face, giving the
     leathery hang-and-drape read (not a stiff flat disc). Alternating front/back ripples. ---------- */
  {
    const foldXs = [-0.40,-0.24,-0.08,0.08,0.24,0.40];
    for(let i=0;i<foldXs.length;i++){
      const x = foldXs[i];
      const dz = (i%2===0) ? 0.05 : -0.04;                // alternate the ripple direction
      const yTop = topY-0.10, yBot = 0.14;
      const xTop = x*1.02, xBot = x*0.30;
      quad(V(xTop-0.03,yTop,0.02), V(xTop+0.03,yTop,0.02),
           V(xBot+0.02,yBot,0.02+dz), V(xBot-0.02,yBot,0.02+dz), P.mottleA, 0.05);
    }
  }

  /* ---------- MAW — a fanged mouth running the length of the top edge, opening on the underside
     of the rim; a dark red interior strip with a row of pale fangs along the lip. ---------- */
  {
    const y0 = topY-0.02, y1 = topY-0.11;
    // dark maw-interior strip along the whole top rim (underside), slightly recessed in +z
    quad(V(-0.46,y0,0.05), V(0.46,y0,0.05), V(0.40,y1,0.09), V(-0.40,y1,0.09), P.mawDk, 0.05);
    quad(V(-0.40,y1,0.09), V(0.40,y1,0.09), V(0.30,y1-0.06,0.12), V(-0.30,y1-0.06,0.12), P.maw, 0.06);
    // fang row — small pale triangular teeth spaced along the rim, pointing down
    const fCount = 11;
    for(let i=0;i<fCount;i++){
      const t = i/(fCount-1);
      const x = -0.42 + t*0.84;
      const fb = V(x, y0-0.005, 0.06);
      const ft = V(x, y0-0.075, 0.065);
      tube(fb, ft, 0.018, 0.003, 4, (i%2===0?P.fang:P.fangDk), {capB:{hex:P.fang, lift:0.003}});
    }
  }

  /* ---------- SCALLOPED EDGES — the outer rim of the cloak dips in a wave pattern (left+right
     wingtip sweep, plus the lower body edge), giving the manta-cape silhouette its ragged hem. ---------- */
  {
    // upper wing-edge scallops (top rim, outer arcs toward the wingtips)
    const rim = [
      V(-0.50,topY,0.02), V(-0.38,topY-0.16,0.06), V(-0.30,0.62,0.10),
      V(-0.20,0.40,0.09), V(-0.11,0.22,0.06), V(0,0.10,0.03),
      V(0.11,0.22,0.06), V(0.20,0.40,0.09), V(0.30,0.62,0.10),
      V(0.38,topY-0.16,0.06), V(0.50,topY,0.02),
    ];
    for(let i=0;i<rim.length-1;i++){
      const a = rim[i], b = rim[i+1];
      const mid = V((a.x+b.x)/2, (a.y+b.y)/2 - 0.05, (a.z+b.z)/2 + 0.03);
      quad(a, b, mid, mid, P.rim, 0.06);
    }
  }

  /* ---------- UNDERSIDE — the back face of the cloak, a paler mottled belly-leather so the
     silhouette reads solid from behind/below too (thin membrane, opposite winding). ---------- */
  {
    const n = 10, ph = Math.PI/n;
    const bBands = [
      {y:topY-0.02, rx:0.48, rz:0.06, hex:P.mottleB},
      {y:0.55,      rx:0.40, rz:0.07, hex:P.hideLt},
      {y:0.28,      rx:0.22, rz:0.05, hex:P.mottleA},
    ];
    const rings = bBands.map(b=>ring(V(0,b.y,-0.04), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bBands[b].hex);
  }

  /* ---------- TAIL — a long thin whip trailing below the hem, drooping toward the ground. ---------- */
  {
    const t0 = V(0, 0.10, 0.0);
    const t1 = V(0.04, 0.02, -0.10);
    const t2 = V(0.07, -0.03, -0.24);   // dips near/at the ground plane
    const t3 = V(0.09, 0.02, -0.38);
    const tip = V(0.10, 0.05, -0.48);
    tube(t0, t1, 0.055, 0.038, 6, P.tail,   {capA:{hex:P.tailDk}});
    tube(t1, t2, 0.038, 0.024, 6, P.tailDk);
    tube(t2, t3, 0.024, 0.013, 6, P.tail);
    tube(t3, tip,0.013, 0.004, 6, P.tailDk, {capB:{hex:P.tailDk, lift:0.004}});
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
