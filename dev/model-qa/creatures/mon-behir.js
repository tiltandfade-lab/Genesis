/* dev/model-qa/creatures/mon-behir.js — the BEHIR (bespoke WORM/SERPENT-base variant, Huge Monstrosity).
   docs/CREATURE-MODELS-P2.md Wave 2. Silhouette brief: a Huge serpentine crocodile-centipede
   hybrid — a LONG snake-like reptilian body (thick, scaled) carried on MANY short clawed legs (a
   dozen small legs running down both sides, centipede-like — the signature read), rearing the
   front third UP off the disc with a long crocodilian head (wide toothy jaws, a pair of
   back-swept horns/frills). Slate blue-grey scaled hide (storm-blue lightning-creature cast),
   paler belly, dark maw, bone teeth. NO eye quads. Built the same way as mon-snake.js (single
   swept centerline path, ring cross-sections, coiled onto the disc) but with legs stitched down
   both flanks per spine sample and a crocodilian (not wedge-cobra) head. Whole-object grammar:
   one function, one merged geometry frame, no anchors. Huge size: base disc r=0.68. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildBehir(){
  /* ---------- PALETTE (VS-desaturated slate-blue/storm-grey scaled hide; pale belly; bone teeth) ---------- */
  const P = {
    hide:0x66727f, hideDk:0x49525c, hideLt:0x7d8a95,      // slate blue-grey scaled hide
    mottleA:0x58626d, mottleB:0x6e7b86,                    // dorsal mottle bands
    belly:0x8a9096, bellyDk:0x686e72,                      // pale storm-grey belly
    ridge:0x272d33,                                        // dark dorsal ridge scutes
    horn:0x6b6558, hornDk:0x453f34,                        // back-swept horns/frills, bone-ish
    snout:0x424b53, mouth:0x1c1a18, tooth:0xc8bfa0,        // dark maw, bone teeth
    claw:0x201d1a,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({ [P.hide]:'scale', [P.hideDk]:'scale', [P.hideLt]:'scale',
    [P.mottleA]:'scale', [P.mottleB]:'scale', [P.belly]:'skin', [P.bellyDk]:'skin',
    [P.horn]:'bone', [P.hornDk]:'bone', [P.tooth]:'bone', [P.mouth]:'', [P.ridge]:'scale' });

  /* ---------- THE SPINE PATH — one continuous centerline (mon-snake.js technique): the rear
     two-thirds of the body coils in one flattened loop on the disc (r=0.68, so the loop sits
     inside ~0.60), then the front third peels UP off the coil in a rising arc to the reared,
     forward-jutting crocodilian head. ---------- */
  const path = [];   /* {p:Vector3, r:radius, t:0..1 along body} */
  const TAIL_R = 0.028, MID_R = 0.145, NECK_R = 0.110, GROUND = 0.095;

  /* --- rear coil: a single flattened loop (not a tight spiral — a long body laid in one loose
     bend so the many legs read clearly along both flanks, not buried under overlap). --- */
  const COIL_SAMP = 34;
  for(let i=0;i<=COIL_SAMP;i++){
    const f = i/COIL_SAMP;                         // 0 = tail tip .. 1 = end of rear coil
    const ang = Math.PI*0.28 + f*Math.PI*1.15;      // a loose ~1.15π bend, not a full wrap
    const rad = 0.60 - f*0.16;                       // gently tightens as it nears the rise
    const thick = TAIL_R + (MID_R-TAIL_R)*Math.min(1, f*1.05);
    path.push({ p:V(Math.cos(ang)*rad, GROUND + f*0.02, Math.sin(ang)*rad*0.62 - 0.05), r:thick, t:f*0.62 });
  }

  /* --- rising fore-body: peels up off the coil's end in a shallow rearing arc (front THIRD up,
     per the brief) toward the forward-jutting croc head. Stays diagonal (never near-vertical) so
     the ring frame doesn't pinch, per the mon-snake.js lesson. --- */
  const lastCoil = path[path.length-1].p;
  const RISE = [
    { p:V(lastCoil.x*0.80, GROUND+0.05, lastCoil.z*0.80 + 0.10), r:MID_R*1.00, t:0.64 },
    { p:V(lastCoil.x*0.50, GROUND+0.16, lastCoil.z*0.50 + 0.20), r:MID_R*0.96, t:0.70 },
    { p:V(lastCoil.x*0.22, GROUND+0.34, 0.30),                   r:MID_R*0.88, t:0.77 },
    { p:V(0.02,            GROUND+0.52, 0.42),                   r:MID_R*0.76, t:0.83 },
    { p:V(0.00,            GROUND+0.68, 0.50),                   r:NECK_R*0.92, t:0.89 },
    { p:V(0.00,            GROUND+0.80, 0.56),                   r:NECK_R*0.78, t:0.94 },
    { p:V(0.00,            GROUND+0.88, 0.60),                   r:NECK_R*0.62, t:0.98 },  // base of head
  ];
  for(const s of RISE) path.push(s);

  /* ---------- LOFT THE BODY — ring cross-sections along the path, stitched, elliptical (wider
     than tall — heavy belly-down reptile mass). Diamond/mottle banding + pale belly verts. -------- */
  const NSEG = 10;
  const rings = [];
  for(let i=0;i<path.length;i++){
    const cur = path[i];
    const nxt = path[Math.min(i+1, path.length-1)].p;
    const prv = path[Math.max(i-1, 0)].p;
    const axis = new THREE.Vector3().subVectors(nxt, prv).normalize();
    const rx = cur.r * 1.05, rz = cur.r * 0.92;
    rings.push(ring(cur.p, axis, rx, rz, NSEG, Math.PI/NSEG));
  }
  const colFn = (b, i) => {
    const t = path[b].t;
    const band = Math.floor(t * 22) % 2 === 0;
    const rng = rings[b];
    const ys = rng.map(v=>v.y);
    const minY = Math.min(...ys);
    const isBelly = (rng[i].y - minY) < (Math.max(...ys)-minY)*0.30;
    if(isBelly) return band ? P.bellyDk : P.belly;
    return band ? P.mottleA : P.hide;
  };
  stitch(rings, colFn);
  capFan(rings[0], path[0].p.clone(), P.hideDk, true);          // tail tip cap

  /* DORSAL RIDGE — a line of dark scute quads along the spine top, rear coil through the rise */
  {
    for(let i=2;i<path.length-2;i+=2){
      const a = path[i].p, bnext = path[i+1].p;
      const up = V(0,1,0);
      const rTop = a.clone().addScaledVector(up, path[i].r*0.95);
      const rTop2 = bnext.clone().addScaledVector(up, path[i+1].r*0.95);
      const spike = a.clone().addScaledVector(up, path[i].r*1.28);
      quad(rTop.clone().add(V(-0.02,0,0)), rTop.clone().add(V(0.02,0,0)),
           rTop2.clone().add(V(0.016,0,0)), rTop2.clone().add(V(-0.016,0,0)), P.ridge, 0.04);
      quad(rTop.clone().add(V(-0.010,0,0)), rTop.clone().add(V(0.010,0,0)), spike, spike, P.ridge, 0.03);
    }
  }

  /* ---------- HEAD — a LONG crocodilian head: wide toothy jaws jutting forward off the reared
     neck, plus a pair of back-swept horns/frills. Built as an oriented ring-stack like
     mon-snake.js's wedge head, but elongated (croc, not cobra) with a flat wide jaw. ---------- */
  const neckEnd = path[path.length-1].p;
  const neckPrev = path[path.length-2].p;
  const HAXIS = new THREE.Vector3().subVectors(neckEnd, neckPrev).normalize();
  {
    const fwd = HAXIS.clone();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), fwd).normalize();
    const up = new THREE.Vector3().crossVectors(fwd, side).normalize();
    const HC = neckEnd.clone().addScaledVector(fwd, 0.06);

    const seg = (along, offY=0) => HC.clone().addScaledVector(fwd, along).addScaledVector(up, offY);
    const ell = (c, w, h, n=10) => {
      const pts=[];
      for(let k=0;k<n;k++){ const a=Math.PI/n + k/n*Math.PI*2;
        pts.push(c.clone().addScaledVector(side, Math.cos(a)*w).addScaledVector(up, Math.sin(a)*h)); }
      return pts;
    };
    // long flattened croc skull: neck join -> broad cranium -> long tapering jaw -> blunt snout tip
    const rBack  = ell(seg(-0.05, 0),        0.115, 0.095);
    const rCrown = ell(seg( 0.03, -0.006),   0.135, 0.100);   // widest — cranium/cheek
    const rJaw1  = ell(seg( 0.16, -0.026),   0.100, 0.062);   // jaw narrowing, flattened
    const rJaw2  = ell(seg( 0.30, -0.040),   0.072, 0.044);
    const rSnout = ell(seg( 0.42, -0.048),   0.044, 0.030);   // blunt snout ring
    const headRings = [rBack, rCrown, rJaw1, rJaw2, rSnout];
    stitch(headRings, (b)=> b===0 ? P.hideDk : (b===1 ? P.hideLt : P.snout));
    const snoutTip = seg(0.46, -0.050);
    capFan(rSnout, snoutTip, P.snout);
    capFan(rBack, seg(-0.075, 0), P.hideDk, true);

    /* BACK-SWEPT HORNS/FRILLS — a pair sweeping up+back off the crown, the lightning-behir tell */
    for(const s of [-1,1]){
      const hBase = seg(0.02, 0.05).addScaledVector(side, s*0.085);
      const hMid  = seg(-0.10, 0.16).addScaledVector(side, s*0.135);
      const hTip  = seg(-0.24, 0.24).addScaledVector(side, s*0.165);
      tube(hBase, hMid, 0.030, 0.020, 5, P.horn, {capA:{hex:P.hornDk}});
      tube(hMid, hTip, 0.020, 0.006, 5, P.hornDk, {capB:{hex:P.hornDk, lift:0.01}});
      // small frill web trailing the horn, flattened
      const wA = hBase.clone().addScaledVector(side, s*0.01);
      const wB = hMid.clone();
      const wC = hMid.clone().addScaledVector(up, -0.05);
      const wD = hBase.clone().addScaledVector(up, -0.03);
      quad(wA, wB, wC, wD, P.hornDk, 0.05);
    }

    /* WIDE TOOTHY JAWS — a dark mouth-line seam the length of the jaw + bone teeth jutting from
       both the upper and lower lines (croc underbite read). */
    {
      const m0u = seg(0.10, -0.024), m1u = seg(0.44, -0.050);
      quad(m0u.clone().addScaledVector(side,0.055), m1u.clone().addScaledVector(side,0.026),
           m1u.clone().addScaledVector(side,-0.026), m0u.clone().addScaledVector(side,-0.055), P.mouth, 0.03);
      // pale belly-toned throat under the jaw hinge
      const th0 = seg(-0.02,-0.045), th1 = seg(0.12,-0.060);
      quad(th0.clone().addScaledVector(side,0.075), th1.clone().addScaledVector(side,0.050),
           th1.clone().addScaledVector(side,-0.050), th0.clone().addScaledVector(side,-0.075), P.belly, 0.05);
      // bone teeth: small triangular tubes along the jaw line, upper + lower alternating
      const nTeeth = 6;
      for(let k=0;k<nTeeth;k++){
        const tt = 0.13 + (k/(nTeeth-1))*0.28;
        const sgn = (k%2===0) ? 1 : -1;                 // alternate which side pokes more (jagged read)
        const jawC = seg(tt, -0.030 - tt*0.045);
        for(const s of [-1,1]){
          const tb = jawC.clone().addScaledVector(side, s*0.05).addScaledVector(up, 0.006);
          const tp = jawC.clone().addScaledVector(side, s*0.045).addScaledVector(up, -0.028 + (sgn>0?0.006:0));
          tube(tb, tp, 0.011, 0.003, 4, P.tooth, {capB:{hex:P.tooth, lift:0.003}});
        }
      }
    }
  }

  /* ---------- LEGS — the CENTIPEDE signature: a dozen short clawed legs (6 pairs) running down
     BOTH flanks of the coiled rear+mid body, small and stubby (not sprawling like the lizard —
     these barely touch ground, reading as many quick little legs under a long serpent body). ------ */
  {
    const legIdxs = [];
    // pick 6 sample points along the rear-coil+early-rise portion of the path (t≈0.06..0.66)
    const nLegPairs = 6;
    for(let k=0;k<nLegPairs;k++){
      const f = 0.08 + (k/(nLegPairs-1))*0.58;                 // spread across the coiled length
      const idx = Math.round(f * (COIL_SAMP));                  // index within the rear-coil segment
      legIdxs.push(Math.min(idx, COIL_SAMP-1));
    }
    const stubLeg = (root, outward, hex)=>{
      // short: hip pokes out to the side a little, drops to a small clawed foot near the ground
      const hip  = root.clone().addScaledVector(outward, 0.10).add(V(0,-0.02,0));
      const foot = root.clone().addScaledVector(outward, 0.165).add(V(0, GROUND*-0.75, 0));
      tube(root, hip, 0.045, 0.032, 5, hex);
      tube(hip, foot, 0.032, 0.018, 5, P.hideDk, {capB:{hex:P.hideDk, lift:0.004}});
      // 3 small claws fanning forward/out from the foot
      const side = outward.clone();
      for(const dOff of [-0.02, 0, 0.02]){
        const cb = foot.clone();
        const ct = foot.clone().addScaledVector(outward, 0.045).add(V(dOff, -0.012, 0.02));
        tube(cb, ct, 0.010, 0.003, 4, P.claw, {capB:{hex:P.claw, lift:0.003}});
      }
    };
    for(const idx of legIdxs){
      const node = path[idx].p;
      const nxt = path[Math.min(idx+1, path.length-1)].p;
      const prv = path[Math.max(idx-1,0)].p;
      const axis = new THREE.Vector3().subVectors(nxt, prv).normalize();
      const worldUp = V(0,1,0);
      const outSide = new THREE.Vector3().crossVectors(axis, worldUp).normalize();  // left/right flank dir
      const r = path[idx].r;
      const rootL = node.clone().addScaledVector(outSide, r*0.85).add(V(0,-r*0.35,0));
      const rootR = node.clone().addScaledVector(outSide, -r*0.85).add(V(0,-r*0.35,0));
      stubLeg(rootL, outSide, P.hide);
      stubLeg(rootR, outSide.clone().negate(), P.hide);
    }
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
