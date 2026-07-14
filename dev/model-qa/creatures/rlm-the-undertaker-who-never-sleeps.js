/* dev/model-qa/creatures/rlm-the-undertaker-who-never-sleeps.js — THE UNDERTAKER WHO NEVER
   SLEEPS (frontier, humanoid horror, Medium, CR 15). Read: a tall, gaunt black-suited
   undertaker — stovepipe hat, long frock coat, narrow shoulders — whose hands are wrong:
   each one stitched together from dozens of smaller dead hands/fingers fused into one
   oversized mitt, a lumpy knuckled mass instead of a normal fist. Frontier register: dust,
   the noon-draw, funeral-parlor black gone dry and sun-bleached at the seams. NO eye
   quads — a gaunt hollow-socket skull-face under the hat brim, no face detail beyond bone.
   Whole-object grammar: one function, one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheUndertakerWhoNeverSleeps(){
  /* ---------- PALETTE (VS desaturated; dry sun-bleached funeral black) ---------- */
  const P = {
    coat:0x201f22, coatDk:0x121214, coatLt:0x323034,
    vest:0x2c2620, shirt:0x9a9284, shirtDk:0x6e6858,
    skin:0x8a8272, skinDk:0x5c5648, bone:0xcfc4a6, boneDk:0x8d846c,
    hat:0x171518, hatband:0x3a3226,
    stitch:0x413a2c, nail:0x1a1712,
    boot:0x141212, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — tall gaunt frame, 5+ heads, narrow shoulders ---------- */
  const L = {
    hipY:0.76, waistY:0.86, ribY:0.99, chestY:1.12, shldY:1.22, neckY:1.27,
    hipHalf:0.095, shoulderX:0.185,
    jawY:1.30, cheekY:1.365, browY:1.42, crownY:1.475, headTopY:1.515,
  };

  /* trunk — narrow gaunt frock coat body */
  stack([
    {y:L.hipY,   rx:0.155, rz:0.120, hex:P.coatDk},
    {y:L.waistY, rx:0.135, rz:0.105, hex:P.coat},
    {y:L.ribY,   rx:0.150, rz:0.115, hex:P.coat},
    {y:L.chestY, rx:0.165, rz:0.125, hex:P.coat},
    {y:L.shldY,  rx:0.175, rz:0.120, hex:P.coat},
    {y:L.neckY,  rx:0.065, rz:0.062, hex:P.shirtDk},
  ], 8, {capTop:{hex:P.shirtDk, lift:0.004}});

  /* long frock coat skirt — hangs to near the knee, split slightly at the front */
  stack([
    {y:0.30, rx:0.230, rz:0.175, hex:P.coatDk},
    {y:0.46, rx:0.210, rz:0.160, hex:P.coat},
    {y:0.62, rx:0.185, rz:0.140, hex:P.coat},
    {y:0.75, rx:0.160, rz:0.122, hex:P.coat},
  ], 8, {});
  /* dark center seam, front split of the coat-tails */
  quad(V(-0.012,0.31,0.172), V(0.012,0.31,0.172), V(0.010,0.74,0.122), V(-0.010,0.74,0.122), P.coatDk, 0.03);

  /* vest sliver + shirt collar at the chest gap */
  quad(V(-0.055,0.98,0.115), V(0.055,0.98,0.115), V(0.048,1.24,0.098), V(-0.048,1.24,0.098), P.vest, 0.03);
  quad(V(-0.030,1.19,0.112), V(0.030,1.19,0.112), V(0.026,1.26,0.100), V(-0.026,1.26,0.100), P.shirt, 0.02);

  /* head — gaunt SKULL FACE (hollow sockets, no eye quads), sun-dried skin over bone */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.068, rz:0.074, hex:P.skinDk},
      {y:L.cheekY, rx:0.090, rz:0.088, hex:P.skin},
      {y:L.browY,  rx:0.086, rz:0.080, hex:P.skin},
      {y:L.crownY, rx:0.066, rz:0.060, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.010; /* faint cheekbone ridge, gaunt */
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY, 0.004), P.skinDk);
    /* hollow eye sockets — carved-in dark pits, not quads facing outward as "eyes" */
    for(const s of [-1,1]){
      quad(V(s*0.052,L.browY-0.012,0.070), V(s*0.052+s*0.026,L.browY-0.012,0.058),
           V(s*0.052+s*0.020,L.browY-0.044,0.052), V(s*0.052-s*0.006,L.browY-0.044,0.062), 0x0a0908, 0.02);
    }
    /* sunken jaw shadow */
    quad(V(-0.040,L.jawY-0.030,0.066), V(0.040,L.jawY-0.030,0.066), V(0.030,L.jawY-0.050,0.072), V(-0.030,L.jawY-0.050,0.072), 0x100e0c, 0.02);
  }

  /* STOVEPIPE HAT — tall black cylinder, narrow brim, sun-faded band */
  {
    const n=10, ph=Math.PI/n;
    const brim = ring(V(0,L.headTopY+0.015,0), V(0,1,0), 0.135, 0.130, n, ph);
    const brimU = ring(V(0,L.headTopY+0.025,0), V(0,1,0), 0.095, 0.092, n, ph);
    stitch([brim,brimU], ()=>P.hat);
    const crownBands=[
      {y:L.headTopY+0.02,  rx:0.088, hex:P.hat},
      {y:L.headTopY+0.16,  rx:0.086, hex:P.hat},
      {y:L.headTopY+0.20,  rx:0.086, hex:P.hatband},
      {y:L.headTopY+0.24,  rx:0.083, hex:P.hat},
      {y:L.headTopY+0.34,  rx:0.078, hex:P.hat},
    ];
    const rings=crownBands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx, n, ph));
    stitch(rings, b=>crownBands[b].hex);
    capFan(rings.at(-1), V(0,L.headTopY+0.35,0), P.hat);
  }

  /* narrow shoulders + arms — end in the OVERSIZED STITCHED-HAND mitts */
  {
    const stitchedHand=(wrist, dir, side)=>{
      /* a lumpy knuckled mass — several fused finger-tubes bulging from one oversized mitt */
      const palm0 = wrist;
      const palm1 = wrist.clone().addScaledVector(dir, 0.10);
      tube(palm0, palm1, 0.062, 0.078, 7, P.skin, {capA:{hex:P.shirtDk}});
      /* the mitt bulges — lumpy secondary knuckle masses stitched onto the main hand */
      const up = V(0,1,0);
      const perp = new THREE.Vector3().crossVectors(dir, up).normalize();
      for(const [ox,oy,r] of [[0.045,0.02,0.032],[-0.040,-0.015,0.028],[0.010,0.045,0.026],[-0.015,-0.040,0.030]]){
        const c = palm1.clone().addScaledVector(perp, ox).addScaledVector(up, oy);
        const tip = c.clone().addScaledVector(dir, 0.075 + side*0.005);
        tube(c, tip, r, r*0.55, 5, P.skinDk, {capB:{hex:P.boneDk, lift:0.006}});
        /* crude stitch lines across each fused knuckle-mass */
        const mid = c.clone().lerp(tip, 0.5);
        quad(mid.clone().add(V(-0.018,0.012,0)), mid.clone().add(V(0.018,0.012,0)),
             mid.clone().add(V(0.014,-0.012,0)), mid.clone().add(V(-0.014,-0.012,0)), P.stitch, 0.04);
      }
      /* central stitched seam across the back of the mitt */
      quad(palm1.clone().add(V(-0.03,0.02,0)), palm1.clone().add(V(0.03,0.02,0)),
           palm1.clone().add(V(0.024,-0.02,-0.01)), palm1.clone().add(V(-0.024,-0.02,-0.01)), P.stitch, 0.03);
    };
    const S1=V(-L.shoulderX, L.shldY-0.01, 0.01), E1=V(-0.245,0.86,0.06), W1=V(-0.235,0.60,0.11);
    tube(S1,E1,0.062,0.050,6,P.coat);
    tube(E1,W1,0.048,0.062,6,P.coatDk);
    stitchedHand(W1, V(-0.02,-0.95,0.30).normalize(), -1);

    const S2=V(L.shoulderX, L.shldY-0.01, 0.01), E2=V(0.235,0.855,0.04), W2=V(0.225,0.575,-0.01);
    tube(S2,E2,0.062,0.050,6,P.coat);
    tube(E2,W2,0.048,0.062,6,P.coatDk);
    stitchedHand(W2, V(0.02,-1,-0.05).normalize(), 1);
  }

  /* legs — narrow trousers, dry-dusted */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.10,0.38,0.03), ankL=V(-0.105,0.075,0.02);
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.115,0.38,-0.02), ankR=V( 0.12,0.075,-0.045);
    tube(hipL,kneeL,0.068,0.048,6,P.coatDk);
    tube(kneeL,ankL,0.045,0.032,6,P.coatDk);
    tube(hipR,kneeR,0.068,0.048,6,P.coatDk);
    tube(kneeR,ankR,0.045,0.032,6,P.coatDk);
    for(const [ank,toeDir] of [[ankL,V(0.05,0,1)], [ankR,V(0.65,0,0.30).normalize()]]){
      stack([
        {y:0.010, rx:0.052, rz:0.058, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.075, rx:0.046, rz:0.048, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.004}});
      const toeA=V(ank.x,0.038,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.10), 0.042,0.032,6,P.boot, {capB:{hex:P.boot, lift:0.012}});
    }
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
