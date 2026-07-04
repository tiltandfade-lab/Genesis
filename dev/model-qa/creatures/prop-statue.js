/* dev/model-qa/creatures/prop-statue.js — a ROBED HOODED STATUE. A SET PIECE, not a creature: it
   must read STATUE (stone, still, on a pedestal), never a living figure — so NO eyes, NO grips, and
   the face-void stays a blank shadowed hollow, not lit pinpricks. Whole-object grammar: one function,
   one geometry frame, no anchors. It sits on the same base disc (r=0.42) the humanoid figures use.

   The robe language is the wraith/cultist hooded shroud rendered IN STONE — simplified drapery
   (a few vertical fold ridges), a deep hood over an empty shadowed face, hands clasped at the waist,
   all in the gargoyle's weathered grey-stone palette with pale chipped-edge quads. On a square
   pedestal (~0.5u). Overall ~1.9u to the crown of the hood. Imported by prop-statue-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildStatue(ox = 0){
  /* weathered grey stone (the gargoyle's living-stone family) */
  const P = {
    stone:0x7d7a72, stoneDk:0x615d54, stoneDkr:0x494640, stoneLt:0x969188,
    chip:0xb4af9f,                                  // pale chipped-edge weathering
    hoodDk:0x4a4842, faceVoid:0x28261f,             // hood interior; the blank shadowed face hollow
    pedTop:0x807c72, pedLt:0x6d6a60, pedDk:0x4e4b45, pedFace:0x615d54,
    disc:0x3a352b, discTop:0x46402f,
  };

  const baseY=0.055;
  const PED = { hx:0.30, hz:0.28, y0:baseY, y1:baseY+0.46 };   // square pedestal ~0.5u
  const TOP = PED.y1;                                          // the robe stands on this

  /* ===== PEDESTAL — a square stone block (with a slim cap course) on the base disc. The robe's hem
     sits on TOP. Lit top / lit-left / shadow-right, weathered chipped corners. ===== */
  {
    const {hx,hz,y0,y1}=PED;
    const capY=y1-0.06;
    const blk=(x,z,ya,yb,top,lt,dk)=>{
      const tNW=V(ox-x,yb,-z), tNE=V(ox+x,yb,-z), tSE=V(ox+x,yb,z), tSW=V(ox-x,yb,z);
      const bNW=V(ox-x,ya,-z), bNE=V(ox+x,ya,-z), bSE=V(ox+x,ya,z), bSW=V(ox-x,ya,z);
      quad(tSW,tSE,tNE,tNW, top, 0.05);
      quad(tSW,tNW,bNW,bSW, lt,  0.05);
      quad(tNE,tSE,bSE,bNE, dk,  0.05);
      quad(tSE,tSW,bSW,bSE, lt,  0.05);
      quad(tNW,tNE,bNE,bNW, dk,  0.05);
    };
    blk(hx, hz, y0, capY, P.pedTop, P.pedLt, P.pedDk);          // main die
    blk(hx+0.03, hz+0.03, capY, y1, P.pedTop, P.pedLt, P.pedDk);// slim cap course (flared)
    // chipped corners (pale broken facets)
    quad(V(ox-hx,capY,hz), V(ox-hx+0.08,capY,hz), V(ox-hx,capY-0.10,hz), V(ox-hx,capY-0.10,hz), P.chip, 0.03);
    quad(V(ox+hx,capY,hz), V(ox+hx,capY-0.11,hz), V(ox+hx-0.09,capY,hz), V(ox+hx-0.09,capY,hz), P.chip, 0.03);
    // a weathered notch out of the front face
    quad(V(ox-0.07,capY-0.14,hz), V(ox+0.06,capY-0.14,hz), V(ox+0.04,capY-0.26,hz-0.02), V(ox-0.05,capY-0.26,hz-0.02), P.pedDk, 0.03);
  }

  /* ===== ROBE BODY — a stone loft from the pedestal-top hem up to the shoulders. A wide, heavy,
     column-like robe (a standing stone in a cloak): broad flared hem narrowing to the shoulders,
     with a hood swell above. Still and symmetric — a statue's composure. ===== */
  const L = {
    hemY:TOP,       waistY:TOP+0.42, chestY:TOP+0.72,
    shldY:TOP+0.86, neckY:TOP+0.94,
    browY:TOP+1.04, hoodTopY:TOP+1.20,
    shoulderX:0.20,
  };
  {
    stack([
      {y:L.hemY,   rx:0.255, rz:0.215, hex:P.stoneDk},    // broad flared hem on the pedestal
      {y:L.hemY+0.22, rx:0.235, rz:0.200, hex:P.stone},
      {y:L.waistY, rx:0.205, rz:0.175, hex:P.stone},      // gathered waist
      {y:L.chestY, rx:0.220, rz:0.180, hex:P.stone},      // chest broadening under the cowl
      {y:L.shldY,  rx:0.230, rz:0.180, hex:P.stoneLt},    // shoulders (lit)
      {y:L.neckY,  rx:0.110, rz:0.105, hex:P.hoodDk},     // neck into the hood
    ], 8, {phase:Math.PI/8, capTop:{hex:P.hoodDk, lift:0.004}});
  }

  /* a few draped vertical FOLD RIDGES down the front of the robe (stone drapery suggestion) */
  for(const fx of [-0.13, -0.04, 0.05, 0.14]){
    const top=V(ox+fx, L.chestY-0.04, 0.175), bot=V(ox+fx*1.25, L.hemY+0.08, 0.205);
    tube(top, bot, 0.020, 0.026, 4, (fx<0? P.stoneDk : P.stone), {});
  }
  /* a horizontal sash/cincture fold at the waist (a lit band + a shadow band) */
  {
    const w1=ring(V(ox,L.waistY-0.02,0), V(0,1,0), 0.208, 0.178, 8, Math.PI/8);
    const w2=ring(V(ox,L.waistY+0.05,0), V(0,1,0), 0.212, 0.182, 8, Math.PI/8);
    stitch([w1,w2], ()=>P.stoneLt);
  }

  /* ===== HOOD — a deep stone cowl over the head, with an OPEN FRONT WINDOW to a blank shadowed
     face-void (no eyes — it's a statue, an empty hollow). Linen-hood technique from the humanoid,
     rendered in stone. ===== */
  {
    const n=8, ph=Math.PI/n, faceCols=[0,1,2];        // +z front arc left open
    const bands=[
      {y:L.neckY-0.005, rx:0.135, rz:0.128, hex:P.hoodDk},
      {y:L.neckY+0.10,  rx:0.180, rz:0.165, hex:P.stone},
      {y:L.browY,       rx:0.188, rz:0.168, hex:P.stoneLt},   // hood brow ridge (lit)
      {y:L.hoodTopY,    rx:0.148, rz:0.135, hex:P.stone},
    ];
    const skip={1:faceCols, 2:faceCols};
    const rings=bands.map(b=>ring(V(ox,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z-=0.022);                  // crown leans back a touch
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(ox, L.hoodTopY+0.06, -0.04), P.stoneDk);
    // dark hood LINING behind the open front window (inner shell)
    const inner=bands.map(b=>ring(V(ox,b.y,0.008), V(0,1,0), b.rx-0.024, b.rz-0.024, n, ph));
    inner[3].forEach(p=>p.z-=0.022);
    for(let b=1;b<3;b++) for(const edge of [0,3])
      quad(rings[b][edge], inner[b][edge], inner[b+1][edge], rings[b+1][edge], P.hoodDk, 0.03);
    // the BLANK FACE-VOID — a single dark recessed quad set deep in the cowl (no eyes; a hollow).
    const fy=(L.neckY+L.browY)/2, fz=0.055;
    quad(V(ox-0.075, fy-0.09, fz), V(ox+0.075, fy-0.09, fz),
         V(ox+0.065, fy+0.10, fz-0.02), V(ox-0.065, fy+0.10, fz-0.02), P.faceVoid, 0.02);
  }

  /* ===== CLASPED HANDS — two stone sleeves draping down the FRONT of the robe and meeting in a
     clasp at the waist (the still, devotional pose). Roots are set close to the body-front (not out
     at the wide shoulders) so the forearms read as arms folded IN, not splayed. No fingers/grips —
     a blocky knot, reads as folded hands at board distance. ===== */
  {
    const clasp=V(ox, L.waistY+0.10, 0.205);          // where the hands meet, proud of the robe front
    for(const s of [-1,1]){
      const sh=V(ox + s*0.105, L.chestY-0.02, 0.150);       // sleeve root: on the front of the chest, tucked in
      const elb=V(ox + s*0.120, L.waistY+0.15, 0.185);      // elbow kept INSIDE the robe silhouette
      // upper sleeve down to the elbow, forearm in to the clasp — a shallow V that folds inward,
      // both segments riding on the robe FRONT so they never break the side silhouette.
      tube(sh, elb, 0.062, 0.056, 6, (s<0? P.stoneDk : P.stone));
      tube(elb, clasp, 0.056, 0.046, 6, (s<0? P.stone : P.stoneLt), {capA:{hex:P.stoneDk}});
    }
    // the clasped-hands knot (raised, centered, proud) — the focal fold of the pose
    blob(clasp.x, clasp.y+0.00, clasp.z+0.03, 0.082, 0.066, 0.072, P.stoneLt, 6, 4);
    // a couple of chipped pale facets on the knuckle knot (weathering)
    quad(V(clasp.x-0.05,clasp.y+0.04,clasp.z+0.08), V(clasp.x+0.05,clasp.y+0.04,clasp.z+0.08),
         V(clasp.x+0.02,clasp.y-0.03,clasp.z+0.09), V(clasp.x-0.02,clasp.y-0.03,clasp.z+0.09), P.chip, 0.03);
  }

  /* a couple of chipped weathering facets on the robe shoulder + hem (statue = old, damaged stone),
     hugged close to the surface so they read as chips, not projecting shards */
  quad(V(ox-0.175,L.shldY-0.01,0.135), V(ox-0.105,L.shldY+0.01,0.155),
       V(ox-0.14,L.shldY-0.09,0.145), V(ox-0.14,L.shldY-0.09,0.145), P.chip, 0.03);
  quad(V(ox+0.205,L.hemY+0.13,0.155), V(ox+0.215,L.hemY+0.03,0.155),
       V(ox+0.155,L.hemY+0.07,0.185), V(ox+0.155,L.hemY+0.07,0.185), P.chip, 0.03);

  /* ===== BASE DISC (r=0.42) ===== */
  {
    const r1=ring(V(ox,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(ox,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(ox,0.058,0), P.discTop);
  }
}
