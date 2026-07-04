/* dev/model-qa/creatures/mon-deva.js — the DEVA (bespoke WINGED HUMANOID, Medium Celestial).
   docs/CREATURE-MODELS-P2.md Wave 5: a radiant angel — a noble upright humanoid with large
   FEATHERED wings rising off the shoulders and a mace held ready. Pale gold luminous skin
   (VS-desaturated, never candy — the "glow" channel carries the luminous read, not saturation),
   white-gold feathered wings, a faint halo ring behind the head. Seeds the winged-humanoid base
   (planetar/solar/empyrean lift from it later). NO eye quads (house ruling): the face is a plain
   skin loft, no painted features. Whole-object grammar: one function, one geometry frame, no
   anchors — every part authored directly in world space, same discipline as mon-lizard.js /
   mon-manticore.js / paladin.js (vertical stack humanoid trunk + tube limbs + wing spars/membrane
   lifted from the manticore's wing pattern, feathered via layered lift-quads instead of bat sail).
   Medium size: base disc r=0.42. Imported by the p2mon proof-sheet set + WHOLE_OBJECT_REGISTRY. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildDeva(){
  /* ---------- PALETTE (VS desaturated; pale luminous gold skin, white-gold feathers, faint glow) ---------- */
  const P = {
    skin:0xcbb98e, skinDk:0x9f8f68, skinLt:0xe0d0a6,           // pale gold luminous skin
    robe:0xcfc7a8, robeDk:0x9a9274,                             // simple draped robe/wrap
    gold:0xa9863f, goldDk:0x7a5f2c,                             // gold trim/mace fittings
    feather:0xd8d2c0, featherDk:0xa8a190, featherLt:0xf0ead8,  // white-gold feather mass
    quill:0x8a8368,                                             // darker quill/rachis lines
    hair:0x6b5c3a,
    haloA:0xf5e6a8, haloB:0xd8c47a,                             // halo glow ring
    wood:0x4e3d2a, disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin',
    [P.robe]:'cloth', [P.robeDk]:'cloth',
    [P.gold]:'metal', [P.goldDk]:'metal', [P.wood]:'wood',
    [P.feather]:'fur', [P.featherDk]:'fur', [P.featherLt]:'fur', [P.quill]:'fur',
    [P.hair]:'fur',
    [P.haloA]:'glow', [P.haloB]:'glow',
  });

  /* ---------- LANDMARKS — an upright humanoid, medium build, held tall + noble. ---------- */
  const L = {
    hipY:0.62, waistY:0.70, ribY:0.80, chestY:0.90, shldY:0.965, neckY:0.995,
    hipHalf:0.100, shoulderX:0.205,
    jawY:1.025, cheekY:1.075, browY:1.125, crownY:1.165, headTopY:1.205,
  };

  /* ---------- TRUNK — a slender noble torso loft, robe-wrapped. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.150, rz:0.115, hex:P.robeDk},
      {y:L.waistY, rx:0.132, rz:0.100, hex:P.robe},
      {y:L.ribY,   rx:0.150, rz:0.112, hex:P.robe},
      {y:L.chestY, rx:0.168, rz:0.120, hex:P.robeDk},
      {y:L.shldY,  rx:0.175, rz:0.118, hex:P.robe},
      {y:L.neckY,  rx:0.068, rz:0.062, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
  }
  /* gold sash across the chest (celestial-order sigil kept plain) */
  {
    quad(V(-0.14,L.chestY+0.02,0.115), V(0.14,L.chestY+0.02,0.115), V(0.10,L.hipY-0.02,0.150), V(-0.10,L.hipY-0.02,0.150), P.gold, 0.03);
  }
  /* draped robe skirt flaring below the hips */
  {
    const seg=[[L.hipY,0.150],[0.44,0.185],[0.28,0.205],[0.14,0.210]];
    for(let i=0;i<seg.length-1;i++){
      const [y0,z0]=seg[i], [y1,z1]=seg[i+1];
      quad(V(-0.150,y0,z0-0.06), V(0.150,y0,z0-0.06), V(0.185,y1,z1-0.07), V(-0.185,y1,z1-0.07), i%2?P.robe:P.robeDk, 0.04);
    }
  }

  /* ---------- HEAD — a plain noble face loft (no eye quads; sockets are shape only). ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.078, rz:0.082, hex:P.skin},
      {y:L.cheekY, rx:0.098, rz:0.096, hex:P.skin},
      {y:L.browY,  rx:0.100, rz:0.090, hex:P.skinLt},
      {y:L.crownY, rx:0.078, rz:0.070, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY-0.01, 0.0), P.skinDk);
    /* subtle brow shadow (shape, not a painted eye) — a shallow socket recess band */
    quad(V(-0.055,L.browY-0.015,0.083), V(0.055,L.browY-0.015,0.083), V(0.05,L.browY+0.01,0.078), V(-0.05,L.browY+0.01,0.078), P.skinDk, 0.05);
    /* nose ridge */
    quad(V(-0.014,L.cheekY+0.01,0.092), V(0.014,L.cheekY+0.01,0.092), V(0.010,L.jawY+0.02,0.100), V(-0.010,L.jawY+0.02,0.100), P.skinLt, 0.04);
    /* short cropped hair cap */
    quad(V(-0.082,L.browY+0.02,-0.02), V(0.082,L.browY+0.02,-0.02), V(0.06,L.crownY+0.02,-0.04), V(-0.06,L.crownY+0.02,-0.04), P.hair, 0.05);
  }

  /* ---------- HALO — a thin glowing ring floating behind/above the head (glow channel). ---------- */
  {
    const hc = V(0, L.headTopY+0.075, -0.035);
    const r1 = ring(hc, V(0,0,1), 0.135, 0.135, 12);
    const r2 = ring(hc, V(0,0,1), 0.100, 0.100, 12);
    stitch([r1,r2], ()=>P.haloA, null);
    // thin inner rim tone for a bit of banding read
    for(let i=0;i<12;i++){
      const i2=(i+1)%12;
      quad(r2[i], r2[i2], r1[i2], r1[i], P.haloB);
    }
  }

  /* ---------- ARMS — one arm holds the mace ready (raised, cocked), the other rests at the side. ---------- */
  const S_R = V(L.shoulderX, L.shldY-0.01, 0.0);
  const E_R = V(0.315, 0.870, 0.145);
  const W_R = V(0.300, 1.010, 0.230);           // wrist/grip near the shoulder, mace raised
  tube(S_R, E_R, 0.062, 0.048, 6, P.skin);
  tube(E_R, W_R, 0.046, 0.038, 6, P.skin, {capB:{hex:P.skin, lift:0.01}});

  const S_L = V(-L.shoulderX, L.shldY-0.01, 0.0);
  const E_L = V(-0.235, 0.470, 0.05);
  const W_L = V(-0.225, 0.330, 0.06);
  tube(S_L, E_L, 0.060, 0.046, 6, P.skin);
  tube(E_L, W_L, 0.044, 0.036, 6, P.skin, {capB:{hex:P.skin, lift:0.01}});

  /* ---------- MACE — held in the raised right hand, head up-and-out. ---------- */
  {
    const grip = W_R.clone();
    const top = V(0.360, 1.230, 0.300);
    const axis = new THREE.Vector3().subVectors(top, grip).normalize();
    tube(grip, grip.clone().addScaledVector(axis,0.02), 0.026,0.026,6,P.wood, {capA:{hex:P.wood, lift:0.01}});
    const shaftEnd = grip.clone().addScaledVector(axis, 0.16);
    tube(grip.clone().addScaledVector(axis,0.02), shaftEnd, 0.024,0.028,6,P.wood);
    const headBase = shaftEnd, headTip = top;
    tube(headBase, headBase.clone().addScaledVector(axis,0.03), 0.036,0.046,6,P.goldDk);
    tube(headBase.clone().addScaledVector(axis,0.03), headTip, 0.046,0.010,7,P.gold, {capB:{hex:P.gold, lift:0.012}});
    // flanges (small gold blades around the mace head) for a readable weapon silhouette
    const up=V(0,1,0), u=new THREE.Vector3().crossVectors(up,axis).normalize(), w=new THREE.Vector3().crossVectors(axis,u).normalize();
    const hc = headBase.clone().addScaledVector(axis,0.08);
    for(const dir of [u, w, u.clone().negate(), w.clone().negate()]){
      const base=hc.clone().addScaledVector(axis,-0.02), tip=hc.clone().addScaledVector(dir,0.075).addScaledVector(axis,0.03);
      quad(base, base.clone().addScaledVector(axis,0.10), tip, tip, P.goldDk, 0.04);
    }
  }

  /* ---------- LEGS — long, robed, mostly hidden by the skirt; simple straight stance. ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.0), ankL=V(-0.085,0.06,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.0), ankR=V( 0.085,0.06,0.02);
    tube(hipL,ankL,0.062,0.040,6,P.robeDk);
    tube(hipR,ankR,0.062,0.040,6,P.robeDk);
    for(const ank of [ankL,ankR]){
      const toeA=V(ank.x,0.035,ank.z);
      tube(toeA, toeA.clone().add(V(0,0,0.10)), 0.040,0.030,6,P.skinDk, {capB:{hex:P.skinDk, lift:0.01}});
    }
  }

  /* ---------- WINGS — large feathered wings rising off the shoulders, half-spread, arcing up
     and slightly back. Bone spars fan from a shoulder root (as the manticore's bat wing) but the
     membrane is replaced with layered FEATHER courses (stacked lift-quads along each spar gap)
     for a plumage read rather than a smooth sail. Kept within the disc footprint by rising mostly
     in +y with modest lateral spread rather than sprawling far in +z/-z. ---------- */
  {
    const wing=(side)=>{
      const root = V(side*0.135, L.shldY+0.09, -0.03);
      const shoulder = V(side*0.24, L.shldY+0.20, -0.05);
      const f1 = V(side*0.44, L.shldY+0.62, -0.14);     // top spar — leading edge, highest
      const f2 = V(side*0.60, L.shldY+0.50, -0.26);     // mid spar
      const f3 = V(side*0.56, L.shldY+0.30, -0.34);     // lower spar, trailing toward the back

      tube(root, shoulder, 0.040, 0.032, 5, P.featherDk);
      tube(shoulder, f1, 0.030, 0.010, 5, P.quill, {capB:{hex:P.quill, lift:0.004}});
      tube(shoulder, f2, 0.027, 0.009, 5, P.quill, {capB:{hex:P.quill, lift:0.004}});
      tube(shoulder, f3, 0.024, 0.008, 4, P.quill, {capB:{hex:P.quill, lift:0.004}});

      /* feather courses: several banded lift-quads laid between successive spars, each course
         nudged slightly toward the viewer (+lift along the wing normal) so the plumage stacks
         visibly rather than reading as one flat membrane. */
      const courses = [
        [shoulder, f1, f2, P.feather],
        [shoulder, f2, f3, P.featherDk],
      ];
      const nrm = new THREE.Vector3().crossVectors(
        new THREE.Vector3().subVectors(f1, shoulder),
        new THREE.Vector3().subVectors(f3, shoulder)
      ).normalize().multiplyScalar(side<0?-1:1);
      for(const [a,b,c,hex] of courses){
        for(let k=0;k<3;k++){
          const t0=k/3, t1=(k+1)/3;
          const p0=a.clone().lerp(b,t0), p1=a.clone().lerp(b,t1);
          const p2=a.clone().lerp(c,t1), p3=a.clone().lerp(c,t0);
          const lift = nrm.clone().multiplyScalar(0.012*k);
          quad(p0.clone().add(lift), p1.clone().add(lift), p2.clone().add(lift), p3.clone().add(lift), k%2?hex:P.featherLt, 0.06);
        }
      }
      /* trailing covert feathers along the bottom spar back toward the shoulder, closing the wing low */
      const trail = V(side*0.30, L.shldY+0.12, -0.20);
      quad(shoulder, f3, trail, root, P.featherDk, 0.08);

      /* scalloped feather-tip notches along the leading rim */
      const rim=[f1,f2,f3];
      for(let i=0;i<rim.length-1;i++){
        const a=rim[i], b=rim[i+1];
        const dip=V((a.x+b.x)/2,(a.y+b.y)/2-0.035,(a.z+b.z)/2);
        quad(a, b, dip, dip, P.featherLt, 0.05);
      }
    };
    wing(-1); wing(1);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
