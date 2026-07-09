/* dev/model-qa/creatures/rlm-suburb-bulette-pup.js — SUBURB realm, suburb-w1 wave, cell 4.
   BULETTE PUP — Medium, CR 2. Flavor: a burrowing thing under a trampoline. CORE IDENTITY = the
   bulette, the land shark — armored dome-plate shell over a shark head, the big DORSAL FIN, digger
   claws — pup-sized (family QUADRUPED, armor-plated variant, per docs/ANATOMY-CANON + the mon-bulette
   full-size exemplar this scales down and re-poses).

   FEATURE CHECKLIST (3-6 the budget buys):
   - dome-plate armored shell over a broad shark-wedge head (dark seams between plates)
   - the DORSAL FIN — SIGNATURE, high-value ridge riding the emerging back
   - gaping toothy maw (bone-pale teeth, >=140 RGB zone)
   - two front digger claws splayed wide into the torn-earth collar (grip, not resting)
   - torn-earth collar ring around the base disc — jagged raised dirt clods, dark undersides
   - stubby buried haunch (rear half implied under the soil, not fully modeled)

   POSE SENTENCE: the breach — front half erupting straight up out of the disc through a torn-earth
   collar, spine arcing from a buried low rump up through a rising back to a head thrown back and up,
   jaws cracked open mid-lunge, both front claws thrown wide and driven into the broken soil for
   purchase, fin riding the peak of the arc as the loudest silhouette break.

   SPINE-GESTURE SENTENCE: buried rump (low, back) -> loin (rising) -> shoulder (high) -> neck (higher,
   pitched back) -> head (highest, tipped up-and-back, jaw open) traces one continuous upward-and-back
   arc — a single C-curve, not a plumb column; the front legs hang off the shoulder at real
   elbow-bends, splayed out to the sides rather than folded under, per POSE-ANATOMY law 2.

   Grounded unit (not hover): the torn-earth collar + base disc sit at y=0, bbox min.y verified in
   band. Whole-object grammar: one exported fn, imports from ../probe-lib.js only. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildBulettePup(){
  /* ---------- PALETTE (suburb yard-dirt + slate armor) ---------- */
  const P = {
    plate:0x5c5e5a, plateDk:0x3e403c, plateLt:0x74766e,   // slate-grey armor plates
    seam:0x2a2b26,                                          // dark plate seams
    fin:0x565850, finDk:0x34362f, finLt:0xc4c6ba,          // dorsal fin — SIGNATURE, ridge cap >=140 RGB
    hide:0x565248,                                          // soft hide at joints/throat
    maw:0x241f19, tooth:0xd6cba6, toothDk:0xa89c78,        // gaping maw + bone-pale teeth
    claw:0xc8bc98, clawDk:0x968a68,                          // digger claws
    dirt:0x5a4a30, dirtDk:0x3a2e1c, dirtLt:0x7a6440,        // torn-earth collar clods
    grass:0x4a5c34,                                          // torn sod fringe on a few clods
  };
  setChannels({
    [P.plate]:'stone', [P.plateDk]:'stone', [P.plateLt]:'stone',
    [P.fin]:'stone', [P.finDk]:'stone', [P.finLt]:'stone',
    [P.tooth]:'bone', [P.toothDk]:'bone', [P.claw]:'bone', [P.clawDk]:'bone',
    [P.hide]:'leather',
  });

  const n = 8, ph = Math.PI / n;

  /* ---------- SPINE LANDMARKS — the breach arc, buried rump -> thrown-back head ---------- */
  const S = {
    rump:  V(0, 0.11, -0.20),   // buried low, barely above the collar
    loin:  V(0, 0.22, -0.08),   // rising out of the soil
    mid:   V(0, 0.36,  0.06),
    shldr: V(0, 0.50,  0.18),   // shoulder — front legs root here
    neck:  V(0, 0.64,  0.30),   // pitched back-and-up
    headB: V(0, 0.74,  0.40),   // head base, thrown up and clear of the body mass
  };

  /* ---------- BODY — one loft, buried rump tapering up through the emerging shoulder to the neck --- */
  tube(S.rump,  S.loin,  0.110, 0.175, n, P.plateDk, {phase:ph});
  tube(S.loin,  S.mid,   0.175, 0.190, n, P.plate,   {phase:ph});
  tube(S.mid,   S.shldr, 0.190, 0.165, n, P.plateLt, {phase:ph});
  tube(S.shldr, S.neck,  0.165, 0.125, n, P.plateDk, {phase:ph});
  tube(S.neck,  S.headB, 0.125, 0.110, n, P.plate,   {phase:ph});

  /* pale-hide throat strip under the pitched-back neck */
  quad(V(-0.07,0.50,0.24), V(0.07,0.50,0.24), V(0.055,0.58,0.34), V(-0.055,0.58,0.34), P.hide, 0.06);

  /* flank armor-plate seams (a couple dark lines suggesting overlapping plates) */
  for(const [z,y] of [[-0.02,0.28],[0.14,0.36]]){
    for(const s of [-1,1]){
      const x = s*0.17;
      quad(V(x,y-0.06,z-0.04), V(x,y-0.06,z+0.04), V(x*0.9,y+0.10,z+0.03), V(x*0.9,y+0.10,z-0.03), P.seam, 0.04);
    }
  }

  /* ---------- DORSAL FIN — SIGNATURE, riding the peak of the emerging back ---------- */
  {
    const finPts = [
      {z:-0.14, base:0.26, tip:0.36, half:0.045},
      {z:-0.02, base:0.34, tip:0.56, half:0.085},
      {z: 0.10, base:0.44, tip:0.66, half:0.095},   // apex — tallest point of the whole model
      {z: 0.22, base:0.50, tip:0.60, half:0.078},
      {z: 0.32, base:0.52, tip:0.46, half:0.048},
    ];
    for(let i=0;i<finPts.length-1;i++){
      const a=finPts[i], b=finPts[i+1];
      const ha=a.half, hb=b.half;
      const baseAL=V(-ha*0.5,a.base,a.z), baseAR=V(ha*0.5,a.base,a.z);
      const baseBL=V(-hb*0.5,b.base,b.z), baseBR=V(hb*0.5,b.base,b.z);
      const tipAL=V(-ha*0.85,a.tip-0.02,a.z), tipAR=V(ha*0.85,a.tip-0.02,a.z);
      const tipBL=V(-hb*0.85,b.tip-0.02,b.z), tipBR=V(hb*0.85,b.tip-0.02,b.z);
      quad(baseAL, baseBL, tipBL, tipAL, P.finDk, 0.05);   // left face
      quad(baseAR, baseBR, tipBR, tipAR, P.fin, 0.05);     // right face
      quad(tipAL, tipAR, tipBR, tipBL, P.finLt, 0.04);     // ridge cap — high-value edge (>=140 RGB zone)
    }
    // leading + trailing edge caps so the fin reads as a solid thick plate, not a sliver
    {
      const a=finPts[0], ha=a.half;
      quad(V(-ha*0.5,a.base,a.z), V(ha*0.5,a.base,a.z), V(ha*0.55,a.tip-0.02,a.z), V(-ha*0.55,a.tip-0.02,a.z), P.finDk, 0.05);
    }
    {
      const b=finPts.at(-1), hb=b.half;
      quad(V(hb*0.5,b.base,b.z), V(-hb*0.5,b.base,b.z), V(-hb*0.55,b.tip-0.02,b.z), V(hb*0.55,b.tip-0.02,b.z), P.fin, 0.05);
    }
    // dark seam grounding the fin's base into the back armor
    for(let i=0;i<finPts.length-1;i++){
      const a=finPts[i], b=finPts[i+1];
      const ha=a.half*1.3, hb=b.half*1.3;
      quad(V(-ha*0.5,a.base-0.012,a.z), V(ha*0.5,a.base-0.012,a.z), V(hb*0.5,b.base-0.012,b.z), V(-hb*0.5,b.base-0.012,b.z), P.seam, 0.04);
    }
  }

  /* ---------- HEAD — broad shark-wedge, thrown back-and-up, jaw CRACKED OPEN mid-lunge ---------- */
  {
    const bands = [
      {y:0.54, cz:0.44, rx:0.135, rz:0.140, hex:P.plate},
      {y:0.67, cz:0.47, rx:0.150, rz:0.150, hex:P.plateLt},  // broadest — the shovel skull
      {y:0.79, cz:0.43, rx:0.115, rz:0.115, hex:P.plateDk},  // brow, flattened, tipped back
    ];
    const rings = bands.map(b => ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b => bands[b].hex);
    capFan(rings.at(-1), V(0,0.84,0.41), P.plateDk);

    /* snout projecting forward-and-up (continuing the spine gesture), clear of the body silhouette */
    const snB = V(0, 0.56, 0.58);
    const snM = V(0, 0.54, 0.74);
    const snT = V(0, 0.53, 0.88);
    tube(snB, snM, 0.135, 0.100, n, P.plate,   {raz:0.115, rbz:0.086, phase:ph});
    tube(snM, snT, 0.100, 0.065, n, P.plateLt, {raz:0.086, rbz:0.052, phase:ph, capB:{hex:P.plateDk, lift:0.005}});

    /* GAPING MAW — upper jaw tipped up, lower jaw dropped, a real bright-lined open gap between them */
    const mawUpperA = V(-0.115, 0.51, 0.40), mawUpperB = V(0.115, 0.51, 0.40);
    const mawUpperC = V(0.085, 0.46, 0.78), mawUpperD = V(-0.085, 0.46, 0.78);
    quad(mawUpperA, mawUpperB, mawUpperC, mawUpperD, P.maw, 0.04);   // upper maw roof
    const jawA = V(-0.110, 0.24, 0.38), jawB = V(0.110, 0.24, 0.38);
    const jawC = V(0.080, 0.30, 0.74), jawD = V(-0.080, 0.30, 0.74);
    quad(jawD, jawC, jawB, jawA, P.plateDk, 0.05);   // lower jaw armor plate, dropped open
    quad(jawA, jawB, jawC, jawD, P.maw, 0.04);        // lower maw underside (dark gap reads open)

    /* teeth ringing both jaw lines — bone-pale, >=140 RGB, sized to read as an open bite at a squint */
    const toothCount = 7;
    for(let i=0;i<toothCount;i++){
      const t = i/(toothCount-1);
      const z = 0.41 + t*0.33, x = -0.10 + t*0.20, y = 0.50;
      const h = (i%2===0) ? 0.06 : 0.04;
      quad(V(x-0.014,y,z), V(x+0.014,y,z), V(x+0.008,y-h,z+0.006), V(x-0.008,y-h,z+0.006), P.tooth, 0.05);
    }
    for(let i=0;i<toothCount-1;i++){
      const t = (i+0.5)/(toothCount-1);
      const z = 0.41 + t*0.33, x = -0.10 + t*0.20, y = 0.26;
      quad(V(x-0.013,y,z), V(x+0.013,y,z), V(x+0.007,y+0.038,z-0.005), V(x-0.007,y+0.038,z-0.005), P.toothDk, 0.05);
    }

    /* two dark nostril slits on the shovel-top */
    for(const s of [-1,1]) quad(V(s*0.028-0.010,0.70,0.52), V(s*0.028+0.010,0.70,0.52),
                                V(s*0.028+0.008,0.705,0.58), V(s*0.028-0.008,0.705,0.58), P.seam, 0.02);
  }

  /* ---------- FRONT LEGS — thrown wide, elbow-bent, claws driven into the torn earth ---------- */
  {
    const frontLeg = (shoulder, sign) => {
      // upper: shoulder -> elbow, thrown WIDE out and down (real bend, ~110-130deg, law 2)
      const elbow = V(sign*0.38, 0.28, shoulder.z + 0.06);
      tube(shoulder, elbow, 0.080, 0.065, n, P.plate, {phase:ph, capA:{hex:P.plateDk, lift:0.015}});
      // lower: elbow -> paw, driven down-and-further-out into the collar
      const paw = V(sign*0.56, 0.02, shoulder.z + 0.18);
      tube(elbow, paw, 0.065, 0.050, n, P.plateDk, {phase:ph, capB:{hex:P.hide, lift:0.008}});
      // three splayed digger claws at the paw, gripping the broken soil
      const pad = V(paw.x, 0.015, paw.z + 0.02);
      for(const dx of [-0.05, 0, 0.05]){
        const cb = V(pad.x + dx*0.7, 0.02, pad.z);
        const ct = V(pad.x + dx*1.5, 0.0, pad.z + 0.09);
        tube(cb, ct, 0.024, 0.010, 5, P.claw, {capB:{hex:P.clawDk, lift:0.004}});
      }
    };
    frontLeg(V(-0.16, 0.46, 0.18), -1);
    frontLeg(V( 0.16, 0.46, 0.18),  1);
  }

  /* ---------- TORN-EARTH COLLAR — jagged raised dirt clods ringing the breach, dark undersides ---------- */
  {
    const clodCount = 12;
    for(let i=0;i<clodCount;i++){
      const t = i / clodCount;
      const ang = t * Math.PI * 2;
      const rr = 0.30 + (i % 3) * 0.03;
      const cx = Math.sin(ang) * rr, cz = Math.cos(ang) * rr;
      // skip the two clods that would sit right where the pup's body/legs erupt (front arc)
      if(Math.abs(ang - Math.PI) < 0.5 && cz < -0.1) continue;
      const h = 0.05 + (i % 4) * 0.025;
      const outX = cx * 1.22, outZ = cz * 1.22;
      const topHex = (i % 3 === 0) ? P.dirtLt : P.dirt;
      const inA = V(cx*0.82, 0.0, cz*0.82), inB = V(cx*1.02, 0.0, cz*1.02);
      const outA = V(outX*0.94, h, outZ*0.94), outB = V(outX, 0.0, outZ);
      quad(inA, inB, outB, outA, topHex, 0.12);
      quad(inA, outA, V(outA.x, 0.0, outA.z), V(inA.x, 0.0, inA.z), P.dirtDk, 0.08); // dark undercut face
      if(i % 4 === 1){
        // a torn-sod fringe cap on some clods (grass-side-up chunk)
        quad(outA, V(outA.x*1.05, h+0.02, outA.z*1.05), V(outA.x*0.9, h+0.015, outA.z*0.9), outA, P.grass, 0.08);
      }
    }
  }

  /* ---------- base disc (Medium: r=0.36) under the collar ---------- */
  {
    const r1 = ring(V(0,0.004,0), V(0,1,0), 0.36, 0.36, 16);
    const r2 = ring(V(0,0.045,0), V(0,1,0), 0.34, 0.34, 16);
    stitch([r1,r2], () => P.dirtDk);
    capFan(r2, V(0,0.047,0), P.dirt);
  }
}
