/* dev/model-qa/creatures/mon-displacerbeast.js — the DISPLACER BEAST (bespoke QUADRUPED, Large
   Monstrosity, CREATURE-MODELS-P2 Wave 2). The read: a lithe, sleek PANTHER/big-cat body — low
   long barrel, four slim legs, a long tail — carrying the signature TWO long TENTACLES rooted at
   the SHOULDERS, arcing up and forward over the back and ending in spiked/spade-shaped barbed
   pads. The reared shoulder-tentacles are the silhouette; the cat body is the base (panther build
   lifted from the mon-wolf.js quadruped grammar — leaner, lower-slung, no ruff/haunch bulk). The
   tentacles are curved tapered tube-chains (the mon-snake.js grammar) rather than legs: root fat
   at the shoulder, taper along an S-arc, end in a flared spade pad ringed with bone-pale barbs.
   Dark blue-black desaturated fur (near-black, cold blue cast), darker tentacles, pale bone spikes.
   NO eye quads (house ruling). Whole-object grammar: one function, one merged geometry frame, no
   anchors. Large size: base disc r=0.55. Imported by ps1-sheet.html's p2mon set +
   src/ui/theater-figures.js's WHOLE_OBJECT_REGISTRY (key "displacer-beast"). */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildDisplacerBeast(){
  /* ---------- PALETTE (VS desaturated — dark blue-black fur, cold cast; darker tentacles, bone spikes) ---------- */
  const P = {
    fur:0x3f4658, furDk:0x2b3040, furLt:0x565e78,        // dark blue-black coat
    saddle:0x14151c, saddleLt:0x2b3350,                   // near-black saddle + a cold-blue sheen band
    belly:0x505468, bellyDk:0x2a2c39,                     // slightly paler blue-grey underside
    muzzle:0x333541, muzzleLt:0x2c2e3a, nose:0x0c0c10,
    maw:0x15121a, tongue:0x5a2f3a, tooth:0xc9c3ba,
    ear:0x333541, earIn:0x100f14,
    tentacle:0x363c4e, tentacleDk:0x262a38, tentacleLt:0x474e64,
    pad:0x14151c, spike:0xcfc6b0, spikeDk:0xa89d86,        // bone-pale spikes on the tentacle pad
    claw:0x0e0e12, disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.fur]:'fur', [P.furDk]:'fur', [P.furLt]:'fur', [P.saddle]:'fur', [P.saddleLt]:'fur',
    [P.belly]:'fur', [P.bellyDk]:'fur', [P.muzzle]:'fur', [P.muzzleLt]:'fur',
    [P.tentacle]:'leather', [P.tentacleDk]:'leather', [P.tentacleLt]:'leather', [P.pad]:'leather',
    [P.spike]:'bone', [P.spikeDk]:'bone', [P.tooth]:'bone',
  });

  /* ---------- LANDMARKS — spine along +z, low sleek panther carriage, shoulder ~0.66u.
     Lower + longer than the wolf's shY=0.78 (a big-cat crouch-prowl, not an upright hunting stance),
     body ~1.5u long (Large). ---------- */
  const shY = 0.62;
  const S = {
    rump:   V(0, shY+0.03, -0.58),
    loin:   V(0, shY+0.05, -0.30),
    saddle: V(0, shY+0.07, -0.02),
    shldr:  V(0, shY+0.03,  0.26),
    neckB:  V(0, shY+0.00,  0.44),
    neck:   V(0, shY-0.04,  0.58),
    headB:  V(0, shY-0.08,  0.70),
  };

  /* ---------- BODY — one horizontal loft; long lean barrel, deep chest, tucked loin. ---------- */
  tube(S.rump,   S.loin,   0.235, 0.270, 9, P.fur,    {phase:Math.PI/9, capA:{hex:P.furDk, lift:0.02}});
  tube(S.loin,   S.saddle, 0.270, 0.290, 9, P.saddle, {phase:Math.PI/9});
  tube(S.saddle, S.shldr,  0.290, 0.275, 9, P.fur,    {phase:Math.PI/9});
  tube(S.shldr,  S.neckB,  0.275, 0.195, 9, P.fur,    {phase:Math.PI/9});
  tube(S.neckB,  S.neck,   0.195, 0.160, 9, P.furDk,  {phase:Math.PI/9});
  tube(S.neck,   S.headB,  0.160, 0.128, 9, P.furDk,  {phase:Math.PI/9});
  /* cold-blue sheen strip down the spine (a subtle displacement-shimmer read, still desaturated) */
  {
    const seg = [[-0.50,shY+0.27],[-0.24,shY+0.30],[0.02,shY+0.32],[0.28,shY+0.27]];
    for(let i=0;i<seg.length-1;i++){
      const [z0,y0]=seg[i], [z1,y1]=seg[i+1];
      quad(V(-0.05,y0,z0), V(0.05,y0,z0), V(0.045,y1,z1), V(-0.045,y1,z1), P.saddleLt, 0.05);
    }
  }
  /* deep chest keel + paler belly under the barrel */
  {
    quad(V(-0.16,shY-0.28,0.10), V(0.16,shY-0.28,0.10), V(0.12,shY-0.32,0.40), V(-0.12,shY-0.32,0.40), P.belly, 0.05);
    quad(V(-0.18,shY-0.26,-0.44), V(0.18,shY-0.26,-0.44), V(0.15,shY-0.24,0.12), V(-0.15,shY-0.24,0.12), P.bellyDk, 0.05);
  }

  /* ---------- HEAD — sleek feline wedge: narrower cranium, short muzzle, small mouth. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:shY-0.100, cz:0.72, rx:0.108, rz:0.112, hex:P.fur},
      {y:shY-0.060, cz:0.75, rx:0.122, rz:0.120, hex:P.fur},
      {y:shY-0.015, cz:0.73, rx:0.108, rz:0.098, hex:P.furDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, shY+0.010, 0.71), P.furDk);

    /* short cat muzzle + small closed jaw with a hint of a fang */
    const jawY = shY-0.150;
    const uB=V(0, jawY+0.040, 0.74), uM=V(0, jawY+0.032, 0.83), uT=V(0, jawY+0.024, 0.90);
    tube(uB, uM, 0.078, 0.058, n, P.muzzle, {raz:0.058, rbz:0.042, phase:ph});
    tube(uM, uT, 0.058, 0.030, n, P.muzzle, {raz:0.042, rbz:0.022, phase:ph, capB:{hex:P.nose, lift:0.008}});
    quad(V(-0.044,jawY-0.004,0.76), V(0.044,jawY-0.004,0.76), V(0.026,jawY-0.008,0.88), V(-0.026,jawY-0.008,0.88), P.maw, 0.02);
    const lB=V(0, jawY-0.040, 0.74), lT=V(0, jawY-0.058, 0.83);
    tube(lB, lT, 0.056, 0.030, n, P.muzzleLt, {raz:0.040, rbz:0.022, phase:ph, capB:{hex:P.muzzleLt, lift:0.006}});
    // small bared fangs
    const fang=(x,y,z,w,h)=>{ quad(V(x-w,y,z+0.006), V(x+w,y,z+0.006), V(x,y-h,z+0.004), V(x,y-h,z+0.004), P.tooth, 0.02); };
    for(const s of [-1,1]) fang(s*0.036, jawY+0.002, 0.78, 0.013, 0.032);

    /* small rounded cat ears (low, alert-forward, NOT the wolf's tall pricked wedge) */
    for(const s of [-1,1]){
      const base=V(s*0.082, shY+0.020, 0.665);
      const tip =V(s*0.100, shY+0.115, 0.650);
      tube(base, tip, 0.042, 0.008, 6, P.fur, {raz:0.024, rbz:0.006, capB:{hex:P.fur, lift:0.005}});
      quad(V(s*0.072,shY+0.032,0.672), V(s*0.092,shY+0.032,0.665),
           V(s*0.098,shY+0.098,0.652), V(s*0.080,shY+0.098,0.658), P.earIn, 0.03);
    }
    /* NO eye quads (house ruling — skulls/sockets are shape, not painted eyes). */
  }

  /* ---------- LEGS — 4 slim feline legs (lither than the wolf: less haunch bulk, more taper),
     digitigrade paws, faint claw flecks. ---------- */
  {
    const leg=(hip, footX, footZ, hex, rearThick)=>{
      const upR  = rearThick ? 0.118 : 0.100;
      const midR = rearThick ? 0.066 : 0.058;
      const knee=V(hip.x + Math.sign(hip.x)*0.008, shY-0.32, hip.z + (rearThick?0.02:0.0));
      const ankle=V(footX, 0.14, footZ);
      const paw=V(footX, 0.045, footZ+0.035);
      tube(hip, knee, upR, midR, 6, hex);
      tube(knee, ankle, 0.050, 0.032, 6, P.furDk);
      tube(ankle, paw, 0.034, 0.028, 6, P.muzzle, {capB:{hex:P.muzzle, lift:0.005}});
      for(const cx of [-0.018,0,0.018]){
        quad(V(paw.x+cx-0.005,0.026,paw.z+0.026), V(paw.x+cx+0.005,0.026,paw.z+0.026),
             V(paw.x+cx+0.004,0.008,paw.z+0.048), V(paw.x+cx-0.004,0.008,paw.z+0.048), P.claw, 0.0);
      }
    };
    leg(V(-0.140, shY-0.06, 0.225), -0.155, 0.30, P.fur, false);
    leg(V( 0.140, shY-0.06, 0.225),  0.155, 0.26, P.fur, false);
    leg(V(-0.155, shY-0.08, -0.52), -0.175, -0.44, P.fur, true);
    leg(V( 0.155, shY-0.08, -0.52),  0.175, -0.48, P.fur, true);
  }

  /* ---------- TAIL — long feline tail, carried in a low sweeping curve (not bushy like the wolf,
     a slim tapering cat tail with a subtle upward flick at the tip). ---------- */
  {
    const root = V(0.00, shY+0.03, -0.66);
    const b1   = V(0.04, shY-0.02, -0.90);
    const b2   = V(0.09, shY-0.10, -1.12);
    const b3   = V(0.16, shY-0.14, -1.30);
    const tip  = V(0.22, shY-0.04, -1.44);
    tube(root, b1, 0.062, 0.050, 7, P.fur,   {phase:Math.PI/7, capA:{hex:P.furDk}});
    tube(b1,   b2, 0.050, 0.036, 7, P.furDk, {phase:Math.PI/7});
    tube(b2,   b3, 0.036, 0.022, 7, P.fur,   {phase:Math.PI/7});
    tube(b3,   tip,0.022, 0.010, 7, P.furDk, {phase:Math.PI/7, capB:{hex:P.furDk, lift:0.006}});
  }

  /* ---------- TENTACLES — the SIGNATURE feature. Two long tapered tube-chains rooted at the
     SHOULDERS (either side of S.shldr), arcing UP and FORWARD over the back in an S-curve (the
     mon-snake.js rising-fore-body grammar), each ending in a flared spade-shaped barbed pad. Root
     fat, taper along the arc, flare slightly at the pad. Splayed left/right + offset front/back so
     they read as two distinct reared limbs, not one doubled shape. ---------- */
  {
    const buildTentacle = (side, hex, hexDk, hexLt) => {
      const root = V(side*0.155, shY+0.16, 0.30);                  // rooted at the shoulder, just above the spine
      const c1   = V(side*0.230, shY+0.42, 0.22);                  // climbs up + slightly back first
      const c2   = V(side*0.260, shY+0.68, 0.10);
      const c3   = V(side*0.230, shY+0.90, 0.28);                  // arcs forward over the back — the peak
      const c4   = V(side*0.170, shY+0.98, 0.52);
      const c5   = V(side*0.110, shY+0.92, 0.74);                  // curls back down toward the front
      const neck = V(side*0.070, shY+0.80, 0.90);                  // pad approach
      const pad  = V(side*0.045, shY+0.70, 1.02);                  // spade pad center

      tube(root, c1, 0.088, 0.076, 8, hex,   {phase:Math.PI/8, capA:{hex:hexDk, lift:0.02}});
      tube(c1,   c2, 0.076, 0.062, 8, hexDk, {phase:Math.PI/8});
      tube(c2,   c3, 0.062, 0.050, 8, hex,   {phase:Math.PI/8});
      tube(c3,   c4, 0.050, 0.040, 8, hexLt, {phase:Math.PI/8});
      tube(c4,   c5, 0.040, 0.032, 8, hex,   {phase:Math.PI/8});
      tube(c5,   neck,0.032, 0.026, 8, hexDk,{phase:Math.PI/8});
      tube(neck, pad, 0.026, 0.030, 7, P.pad,{phase:Math.PI/7});   // slight flare into the pad base

      /* SPADE-SHAPED PAD — a flattened broad paddle (two wide quads back-to-back) at the tentacle
         tip, ringed with bone-pale barbed spikes. */
      const fwd = new THREE.Vector3().subVectors(pad, neck).normalize();
      const upv = V(0,1,0);
      const sideAxis = new THREE.Vector3().crossVectors(fwd, upv).normalize();
      const padTip = pad.clone().addScaledVector(fwd, 0.10);
      const wL = pad.clone().addScaledVector(sideAxis, 0.085).addScaledVector(fwd, 0.03);
      const wR = pad.clone().addScaledVector(sideAxis, -0.085).addScaledVector(fwd, 0.03);
      // the paddle face (spade): two triangular-ish quads from the wide base to the tip
      quad(wL, wR, pad.clone().addScaledVector(fwd,-0.03), pad.clone().addScaledVector(fwd,-0.03), P.pad, 0.04);
      quad(wL, padTip, wR, wR, P.pad, 0.04);
      quad(wR, padTip, wL, wL, P.pad, 0.04);
      // barbed bone-pale spikes ringing the spade edge
      const barbAt = (t, len) => {
        const base = wL.clone().lerp(wR, t);
        const outward = base.clone().sub(pad).setY(0).normalize();
        const spikeTip = base.clone().addScaledVector(outward, len).addScaledVector(fwd, 0.02);
        tube(base, spikeTip, 0.014, 0.003, 4, P.spike, {capB:{hex:P.spikeDk, lift:0.003}});
      };
      for(const t of [0.05, 0.28, 0.5, 0.72, 0.95]) barbAt(t, 0.075);
      // one forward-pointing spike off the tip itself
      tube(padTip, padTip.clone().addScaledVector(fwd, 0.09), 0.016, 0.003, 4, P.spike, {capB:{hex:P.spikeDk, lift:0.003}});
    };
    buildTentacle(-1, P.tentacle, P.tentacleDk, P.tentacleLt);
    buildTentacle( 1, P.tentacle, P.tentacleDk, P.tentacleLt);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
