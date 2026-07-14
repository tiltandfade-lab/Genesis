/* dev/model-qa/creatures/rlm-trench-wraith-of-the-wire.js — Trench Wraith of the Wire
   (theater/trench era-lens, Large, CR 8). A fused mass of soldiers — many overlapping ghostly
   torsos/arms melted into one tall ragged silhouette, hunting by remembered muzzle-flash (a faint
   ember-glow where its eyes would be, small and many, not one face). Trailing tatters of wire and
   uniform cloth hang off the mass like a shroud. Whole-object grammar: one merged frame, no anchors.
   VS-desaturated palette: grey-drab spectral cloth, pale ashen "flesh" hint, dull barbed-wire iron,
   faint dying-ember glow. NO eye quads (the muzzle-flash glow is small quad flecks, not eyes/sockets).
   Large size: base disc r=0.55. Abstracted — no nation/flag markers, only mud/wire/drab.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTrenchWraithOfTheWire(){
  const P = {
    shroud:0x4a4a48, shroudDk:0x2e2e2c, shroudLt:0x63635e,
    ash:0x6e685e, ashDk:0x494540,
    wire:0x2a2724, wireLt:0x413c34,
    ember:0xb85a2c, emberLt:0xe08040,
    disc:0x3a3630, discTop:0x453f36,
  };

  /* ---------- LANDMARKS — a tall ragged vertical mass, ~1.7u, wider at the base (many bodies)
     tapering upward into a hunched, hooded silhouette. ---------- */
  const S = {
    hip:   V(0, 0.30, 0),
    waist: V(0, 0.55, 0.02),
    chest: V(0.02, 0.90, 0.02),
    shldr: V(0, 1.15, 0.0),
    neck:  V(0, 1.28, -0.02),
    headB: V(0, 1.38, -0.03),
    headT: V(0, 1.58, -0.05),
  };

  /* ---------- CORE MASS — a lumpy irregular loft (many fused bodies), asymmetric radii to break
     the silhouette into a ragged non-humanoid shape. ---------- */
  {
    const n=9, ph=Math.PI/9;
    const bands=[
      {y:S.hip.y-0.06, rx:0.34, rz:0.30, hex:P.shroudDk},
      {y:S.hip.y+0.10, rx:0.30, rz:0.27, hex:P.shroud},
      {y:S.waist.y,    rx:0.26, rz:0.24, hex:P.shroudLt},
      {y:S.chest.y-0.08, rx:0.29, rz:0.25, hex:P.shroud},
      {y:S.chest.y+0.10, rx:0.24, rz:0.21, hex:P.shroudDk},
      {y:S.shldr.y,    rx:0.20, rz:0.18, hex:P.shroud},
      {y:S.neck.y,     rx:0.14, rz:0.13, hex:P.shroudDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.hip.z*0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,S.hip.y-0.14,0), P.shroudDk, true);
  }

  /* ---------- HOODED HEAD-MASS — no single face; a hunched hooded shape with small ember-glow
     flecks scattered across the front (many remembered muzzle-flashes, not eyes). ---------- */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:S.headB.y, rx:0.135, rz:0.125, hex:P.shroudDk},
      {y:S.headB.y+0.10, rx:0.150, rz:0.135, hex:P.shroud},
      {y:S.headT.y-0.04, rx:0.110, rz:0.100, hex:P.shroudDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,S.headB.z), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y+0.02,S.headB.z-0.03), P.shroudDk);
    // ashen hint of gaunt features low on the hood-front — a pale strip, not a face
    quad(V(-0.06,S.headB.y+0.02,S.headB.z+0.11), V(0.06,S.headB.y+0.02,S.headB.z+0.11),
         V(0.05,S.headB.y+0.12,S.headB.z+0.10), V(-0.05,S.headB.y+0.12,S.headB.z+0.10), P.ash, 0.05);
    // scattered small ember-glow flecks — many faint flashes, never one pair of eyes
    const flecks=[[-0.05,0.06,0.115],[0.04,0.07,0.11],[0.0,0.02,0.12],[-0.08,-0.02,0.10],[0.08,0.0,0.10]];
    for(const [fx,fy,fz] of flecks){
      const y=S.headB.y+fy+0.04;
      quad(V(fx-0.012,y-0.010,fz), V(fx+0.012,y-0.010,fz), V(fx+0.010,y+0.010,fz), V(fx-0.010,y+0.010,fz), P.ember, 0.06);
    }
  }

  /* ---------- MANY FUSED ARMS — several overlapping arm-shapes reaching from the mass at
     different heights/angles, some raised, some hanging, reinforcing the "many soldiers" read. ---------- */
  {
    const armDefs=[
      {shldr:V(-0.24,S.shldr.y-0.02,0.06), elbow:V(-0.40,S.waist.y+0.05,0.14), hand:V(-0.46,S.hip.y-0.02,0.10), hex:P.shroud},
      {shldr:V(0.22,S.shldr.y,0.02), elbow:V(0.38,S.chest.y-0.20,0.22), hand:V(0.44,S.waist.y-0.05,0.30), hex:P.shroudDk},
      {shldr:V(-0.14,S.chest.y+0.04,-0.10), elbow:V(-0.30,S.chest.y+0.22,-0.08), hand:V(-0.34,S.shldr.y+0.20,-0.02), hex:P.shroudLt},
      {shldr:V(0.10,S.neck.y-0.05,-0.06), elbow:V(0.22,S.neck.y+0.18,-0.14), hand:V(0.28,S.headB.y+0.10,-0.16), hex:P.shroud},
    ];
    for(const a of armDefs){
      tube(a.shldr, a.elbow, 0.055, 0.042, 5, a.hex, {capA:{hex:P.shroudDk}});
      tube(a.elbow, a.hand, 0.042, 0.028, 5, P.shroudDk, {capB:{hex:P.ash, lift:0.01}});
      // spread gaunt fingers
      for(const [dx,dz] of [[-0.02,0.03],[0.0,0.035],[0.02,0.03]]){
        tube(a.hand, V(a.hand.x+dx,a.hand.y-0.03,a.hand.z+dz), 0.012,0.005, 3, P.ash, {capB:{hex:P.ash}});
      }
    }
  }

  /* ---------- TRAILING WIRE + CLOTH TATTERS — barbed wire strands and ragged cloth hanging off
     the mass like a shroud, the "wire" of the name made literal. ---------- */
  {
    // ragged cloth tatters hanging from the shoulders/waist
    const tatters=[[-0.20,S.waist.y,-0.10,-0.24,S.hip.y-0.20,-0.16],
                   [0.16,S.chest.y-0.10,0.08,0.20,S.hip.y-0.10,0.14],
                   [0.0,S.hip.y+0.06,-0.20,0.02,S.hip.y-0.24,-0.26]];
    for(const [x0,y0,z0,x1,y1,z1] of tatters){
      quad(V(x0-0.05,y0,z0), V(x0+0.05,y0,z0), V(x1+0.03,y1,z1), V(x1-0.03,y1,z1), P.shroudDk, 0.06);
    }
    // barbed wire strand wrapping the lower mass — a thin twisting tube with small barb spikes
    const w0=V(-0.30,S.hip.y+0.02,0.06), w1=V(0.10,S.waist.y-0.05,0.24), w2=V(0.32,S.hip.y+0.10,0.02);
    tube(w0,w1,0.010,0.010,4,P.wire); tube(w1,w2,0.010,0.010,4,P.wireLt);
    for(const p of [w0,w1,w2]){
      tube(p, V(p.x+0.03,p.y+0.02,p.z), 0.004,0.001,3,P.wireLt, {capB:{hex:P.wireLt}});
      tube(p, V(p.x-0.02,p.y-0.02,p.z+0.02), 0.004,0.001,3,P.wireLt, {capB:{hex:P.wireLt}});
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
