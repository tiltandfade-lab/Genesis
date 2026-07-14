/* dev/model-qa/creatures/mon-wight.js — the WIGHT (HUMANOID, armored undead knight, Medium, CR 3,
   realm core). MODEL-FOUNDRY REBUILD pass-1 (2026-07-08 foundry pilot, set rebuild-w1 cell 2).
   MODEL-LANE-TRIAGE flagged the old wight as reading well — the armored+sword signature is KEPT
   (dark corroded plate, tarnished broken crown, long blade), but the pose is replaced: the old
   funeral-formal point-down two-hand clasp was a composed/at-attention read (law 5 failure by the
   new pose-expression ruling). This build is the guard-captain the cult now answers to — mid ADVANCE.

   FEATURE CHECKLIST (the ~1.3-1.6k budget buys):
     1. Armored HUMANOID core (ANATOMY-CANON: family rides on the PC kit grammar) — broad straight
        torso in corroded scale/plate over a faded-purple robe base, straight planted-but-striding legs
        in greaves+sabatons. Correctness (proportion, a real armored-body silhouette) before signature.
     2. SIGNATURE — the long notched LONGSWORD, held LOW and forward in the right hand, angled up at
        the tip (a guard about to level it at a target) — not sheathed, not funeral-still. The pale
        steel glint line down the fuller is the model's loudest value note (law 3).
     3. Off-hand raised and BECKONING — left arm out and up, gauntlet fingers splayed, palm forward
        (the "come to me" command gesture — the pose-defining read distinct from the old symmetric
        two-hand clasp).
     4. Crowned/helmed head — a broken tarnished circlet with mixed tall/snapped points riding a
        gaunt grey-parchment dead face; the pale desiccated skin against the dark plate collar is the
        second value zone (law 3 — "pale dead face inside dark armor" per direction).
     5. Burial-shroud cape off both shoulders, trailing back and to one side (motion cue — a body in
        the act of stepping forward, not standing still).
     6. Corroded scale plackart bands across the chest + a tarnished gorget collar — the "guard captain
        kit" read that separates this from the bare skeleton-family models.

   POSE SENTENCE: a commanding advance — front (right) leg planted forward mid-stride, back leg
   trailing and braced, torso leaning into the step, sword held low-forward with the tip lifting to
   level at a target, off-hand thrown up and out in a beckoning "to me" command — never at attention.

   Whole-object grammar: spine +z (front), up +y, ground y=0. Imported by ps1-sheet.html
   (SETS['rebuild-w1'], cell 2). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob, setChannels } from '../probe-lib.js';
import { buildBase } from '../parts.js';

export function buildWight(){
  /* ---------- PALETTE (VS desaturated: grey desiccation, tarnished metal, faded regalia) -------- */
  const P = {
    flesh:0x8f8a7a, fleshDk:0x6c6858, fleshDkr:0x504d40,   // grey desiccated parchment skin
    robe:0x4a3a52, robeDk:0x352838, robeLt:0x5e4d66,       // faded dark-purple regal robe
    scale:0x6a6a64, scaleDk:0x4a4a45, scaleLt:0x86867c,    // corroded grey scale/plate
    tarn:0x7a6a3e, tarnDk:0x53482a, tarnLt:0x9a8a56,       // tarnished old gold — crown, trim
    steel:0xa6acaa, steelDk:0x5e6260, steelGl:0xecf4f0,    // R2 CRITIC FIX: brightened off the scale
                                                             // armor's value so the blade separates from
                                                             // the torso/skirt silhouette instead of
                                                             // blending into it (law 3)
    grip:0x2e2820, cape:0x3a3340, capeDk:0x282430,         // sword grip wrap; burial-shroud cape
    disc:0x3a352b, discTop:0x46402f,
  };
  setChannels(null);

  /* ---------- LANDMARKS — an upright but STRIDING knight (~1.55u), a shade taller than living. ---- */
  const L = {
    hipY:0.74, waistY:0.83, ribY:0.95, chestY:1.07, shldY:1.16, neckY:1.205,
    hipHalf:0.115, shoulderX:0.255,
    jawY:1.245, cheekY:1.325, browY:1.405, crownY:1.49, headTopY:1.55,
  };

  /* ===== LONGSWORD FIRST — held LOW-FORWARD in the RIGHT fist, tip lifting up-and-out as if about
     to level it at a target (a guard mid-advance, not funeral-still). The grip is ground truth. ===== */
  const GRIP  = V(0.22, 0.85, 0.22);                   // low, off the hip on the sword side
  const BLADE = V(0.75, 0.25, 0.40).normalize();       // R2 CRITIC FIX: R1's forward-leaning blade
                                                        // sat inside the torso/skirt screen silhouette
                                                        // (steel value too close to the scale armor to
                                                        // separate). Swept mostly LATERAL so the tip
                                                        // clears the shoulder/skirt outline and reads
                                                        // against open background, still low + ready.
  const POMMEL= GRIP.clone().addScaledVector(BLADE,-0.16);
  {
    /* grip wrap + pommel */
    tube(POMMEL, GRIP.clone().addScaledVector(BLADE,0.06), 0.024,0.024,6, P.grip, {capA:{hex:P.tarn, lift:0.03}});
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE,0.075);
    /* crossguard bar — wide, tarnished, horizontal to the blade axis */
    const gx=0.115, gy=0.016, gz=0.024;
    const cnr=(a,b,c)=>g0.clone().addScaledVector(gu,a*gx).addScaledVector(gv,b*gy).addScaledVector(BLADE,c*gz);
    quad(cnr(-1,-1,-1), cnr(1,-1,-1), cnr(1,1,-1), cnr(-1,1,-1), P.tarnDk,0.04);
    quad(cnr(1,-1,1), cnr(-1,-1,1), cnr(-1,1,1), cnr(1,1,1), P.tarnDk,0.04);
    quad(cnr(-1,-1,-1), cnr(-1,-1,1), cnr(1,-1,1), cnr(1,-1,-1), P.tarn,0.04);
    quad(cnr(-1,1,-1), cnr(1,1,-1), cnr(1,1,1), cnr(-1,1,1), P.tarnLt,0.04);
    quad(cnr(-1,-1,-1), cnr(-1,1,-1), cnr(-1,1,1), cnr(-1,-1,1), P.tarn,0.04);
    quad(cnr(1,-1,-1), cnr(1,-1,1), cnr(1,1,1), cnr(1,1,-1), P.tarn,0.04);
    /* the BLADE — a long spine of cross-sections narrowing to a point. Asymmetric widths give an
       ancient NOTCHED edge; a pale central glint line runs the fuller (law 3 payload). */
    const bl=(t,wA,wB,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,wA), c.clone().addScaledVector(gv,th),
              c.clone().addScaledVector(gu,-wB), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.03,0.068,0.068,0.017), s2=bl(0.28,0.060,0.052,0.014),
          s3=bl(0.50,0.052,0.060,0.012), s4=bl(0.70,0.038,0.034,0.009);
    stitch([s1,s2,s3,s4], (b)=> b===1 ? P.steelDk : P.steel);
    capFan(s4, g0.clone().addScaledVector(BLADE,0.82), P.steel);
    /* pale glint line — a thin bright fuller stripe down the blade centerline (the loudest value note) */
    const gl=(t,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,0.006), c.clone().addScaledVector(gv,th+0.001),
              c.clone().addScaledVector(gu,-0.006), c.clone().addScaledVector(gv,th+0.001)]; };
    stitch([gl(0.05,0.017), gl(0.4,0.013), gl(0.68,0.009)], ()=>P.steelGl);
  }

  /* ===== TORSO — an armored regal loft, hips→neck: faded-purple robe base rising into corroded
     scale over the chest. Leaned slightly forward into the stride. ===== */
  stack([
    {y:L.hipY,   rx:0.205, rz:0.160, cz:-0.01, hex:P.robeDk},
    {y:L.waistY, rx:0.175, rz:0.135, cz:0.0,   hex:P.robe},
    {y:L.ribY,   rx:0.210, rz:0.160, cz:0.015, hex:P.scaleDk},
    {y:L.chestY, rx:0.240, rz:0.175, cz:0.03,  hex:P.scale},
    {y:L.shldY,  rx:0.245, rz:0.165, cz:0.04,  hex:P.scale},
    {y:L.neckY,  rx:0.090, rz:0.085, cz:0.045, hex:P.fleshDk},
  ], 8, {capTop:{hex:P.fleshDk, lift:0.005}});

  /* corroded scale plackart — three shallow ridged bands of scale across the chest (armor read) */
  for(const [y,rx,rz,hx] of [[L.chestY-0.02,0.243,0.176,P.scaleLt],[L.ribY+0.05,0.225,0.166,P.scale],[L.ribY-0.03,0.212,0.160,P.scaleDk]]){
    const r=ring(V(0.02,y,0.02), V(0,1,0), rx, rz, 8, Math.PI/8);
    const r2=ring(V(0.02,y+0.035,0.02), V(0,1,0), rx*0.99, rz*0.99, 8, Math.PI/8);
    stitch([r,r2], ()=>hx);
  }
  /* a tarnished gorget/collar ring at the neck base — the dark-plate frame around the pale face */
  { const r=ring(V(0.02,L.neckY-0.02,0.02), V(0,1,0), 0.115,0.108, 8, Math.PI/8);
    const r2=ring(V(0.02,L.neckY+0.02,0.02), V(0,1,0), 0.100,0.094, 8, Math.PI/8);
    stitch([r,r2], ()=>P.tarnDk); }

  /* ===== ROBE SKIRT — regal but caught mid-stride: the front hem is pushed back/up over the lead
     thigh, the rear hangs long — a body in motion, not a static column. ===== */
  stack([
    {y:0.42, rx:0.270, rz:0.220, cz:-0.02, hex:P.robeDk},
    {y:0.56, rx:0.248, rz:0.198, cz:-0.01, hex:P.robe},
    {y:0.72, rx:0.220, rz:0.170, cz:0.0,   hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.008}});
  /* a faded-gold hem trim line at the skirt bottom */
  { const r=ring(V(0,0.44,-0.02), V(0,1,0), 0.268,0.218, 8, Math.PI/8);
    const r2=ring(V(0,0.475,-0.02), V(0,1,0), 0.262,0.212, 8, Math.PI/8);
    stitch([r,r2], ()=>P.tarnDk); }

  /* ===== BURIAL-SHROUD CAPE — a ragged dark shroud off both shoulders, streaming BACK and slightly
     to the trailing (left) side — the motion cue that this is a body stepping forward, not still. */
  {
    const n=8, ph=Math.PI/n;
    const top=ring(V(0,L.shldY+0.02,-0.02), V(0,1,0), 0.235, 0.175, n, ph);
    const hemY=[0.34,0.58,0.70,0.60,0.38,0.28,0.24,0.28];    // rear+trailing side hangs longest
    const hem=[];
    for(let i=0;i<n;i++){
      const t=ph + (i/n)*Math.PI*2;
      const rear = (i===0||i>=5) ? 1 : 0;
      const trail = (i===6||i===7) ? 1 : 0;                  // trailing (-x, rear) side streams further
      hem.push(V(Math.cos(t)*(0.255+rear*0.03) - trail*0.05, hemY[i] - trail*0.02, -0.05 + Math.sin(t)*(0.205+rear*0.05) - trail*0.04));
    }
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      if(i===1||i===2) continue;   // skip the front two panels — sword/off-hand read there
      quad(top[i], top[i2], hem[i2], hem[i], i&1?P.cape:P.capeDk, 0.06);
    }
    tube(V(-0.02,0.28,-0.22), V(-0.05,0.10,-0.24), 0.030,0.014,4, P.capeDk, {capB:{hex:P.capeDk}});
  }

  /* ===== HEAD — a desiccated grey skull-face, level and forward-set (leading the advance). Gaunt
     cheeks, a heavy brow, a grim set mouth — the pale-flesh high-value zone against dark plate. ===== */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.078, rz:0.088, cz:0.03, hex:P.fleshDk},
      {y:L.cheekY, rx:0.104, rz:0.104, cz:0.04, hex:P.flesh},
      {y:L.browY,  rx:0.112, rz:0.106, cz:0.04, hex:P.flesh},
      {y:L.crownY, rx:0.088, rz:0.082, cz:0.035,hex:P.fleshDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;         // a spare nose ridge
    for(const i of [1,2]){ rings[2][i].z += 0.014; rings[2][i].y -= 0.008; }
    for(const i of [3,7]){ rings[1][i].x *= 0.90; }
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){
      const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.06);
    }
    capFan(rings[3], V(0, L.headTopY, 0.039), P.fleshDkr);
    /* a grim set mouth — a thin dark line */
    quad(V(-0.032,L.jawY+0.028,0.134), V(0.032,L.jawY+0.028,0.134),
         V(0.030,L.jawY+0.014,0.130), V(-0.030,L.jawY+0.014,0.130), P.fleshDkr, 0.02);
  }

  /* ===== CROWN — an ancient tarnished circlet with BROKEN points, sitting on the brow. Tall vs
     SNAPPED-stub spikes — a once-proud crown gone to ruin, the primary silhouette break. ===== */
  {
    const n=8, ph=Math.PI/n, cy=L.crownY-0.02, cz=0.035;
    const band=ring(V(0,cy,cz), V(0,1,0), 0.104, 0.100, n, ph);
    const band2=ring(V(0,cy+0.050,cz), V(0,1,0), 0.102, 0.098, n, ph);
    stitch([band,band2], (b,i)=> (i&1)?P.tarn:P.tarnDk);
    capFan(band, V(0,cy-0.006,cz), P.tarnDk, true);
    const pointH=[0.085,0.028,0.078,0.006,0.072,0.026,0.082,0.006];
    for(let i=0;i<n;i++){
      const b0=band2[i], b1=band2[(i+1)%n];
      const mid=b0.clone().lerp(b1,0.5);
      const tip=mid.clone().add(V((mid.x-0)*0.10, pointH[i], (mid.z-cz)*0.10));
      quad(b0, b1, tip, tip, (i&1)?P.tarnDk:P.tarnLt, 0.05);
      quad(b1, b0.clone().add(V(0,0,-0.008)), tip, tip, P.tarnDk, 0.05);
    }
  }

  /* ===== ARMS — asymmetric, the pose's core read. RIGHT clasps the low-forward sword grip; LEFT
     throws UP and OUT, gauntlet fingers splayed in a beckoning "come to me" command gesture. ===== */
  {
    /* right (sword) arm */
    {
      const S=V(L.shoulderX, L.shldY-0.01, 0.03);
      const E=V(0.30, 0.98, 0.22);
      const FIST=GRIP.clone().addScaledVector(BLADE,-0.02);
      tube(S,E,0.086,0.066,6,P.scale);
      tube(E,FIST,0.062,0.050,6,P.scaleDk);
      const f0=FIST.clone().addScaledVector(BLADE,0.05), f1=FIST.clone().addScaledVector(BLADE,-0.05);
      tube(f0, f1, 0.050,0.048,6, P.scaleLt, {capA:{hex:P.scaleLt},capB:{hex:P.scaleLt}});
      const pivot=V(L.shoulderX, L.shldY+0.03, 0.02);
      stack([
        {y:L.shldY-0.01, rx:0.112, rz:0.122, cx:pivot.x, cz:pivot.z, hex:P.scaleDk},
        {y:L.shldY+0.055,rx:0.090, rz:0.100, cx:pivot.x, cz:pivot.z, hex:P.scaleLt},
      ], 8, {capTop:{hex:P.scaleLt, lift:0.03}});
    }
    /* left (beckoning) arm — raised up and out, elbow bent, hand thrown open above shoulder height */
    {
      const S=V(-L.shoulderX, L.shldY-0.01, 0.02);
      const E=V(-0.36, 1.32, 0.10);
      const HAND=V(-0.28, 1.56, -0.02);
      tube(S,E,0.086,0.064,6,P.scale);
      tube(E,HAND,0.060,0.048,6,P.scaleDk);
      /* gauntlet palm — a flat plate + four splayed finger nubs */
      blob(HAND.x,HAND.y,HAND.z, 0.052,0.040,0.030, P.scaleLt, 6, 3);
      const fdir=new THREE.Vector3().subVectors(HAND,E).normalize();
      const fu=new THREE.Vector3().crossVectors(fdir,V(0,0,1)).normalize();
      for(const t of [-1.2,-0.4,0.4,1.2]){
        const base=HAND.clone().addScaledVector(fu, t*0.018);
        const tip=base.clone().addScaledVector(fdir,0.065).addScaledVector(fu, t*0.010);
        tube(base, tip, 0.011,0.007,3, P.scaleLt, {capB:{hex:P.scaleLt}});
      }
      const pivot=V(-L.shoulderX, L.shldY+0.03, 0.01);
      stack([
        {y:L.shldY-0.01, rx:0.112, rz:0.122, cx:pivot.x, cz:pivot.z, hex:P.scaleDk},
        {y:L.shldY+0.055,rx:0.090, rz:0.100, cx:pivot.x, cz:pivot.z, hex:P.scaleLt},
      ], 8, {capTop:{hex:P.scaleLt, lift:0.03}});
    }
  }

  /* ===== LEGS — a commanding STRIDE: right (sword-side) leg planted forward taking the weight,
     left leg trailing back and braced — the advance, not a sentinel's even stance. ===== */
  {
    const legF=(hip,knee,ank,thighHex,greaveHex)=>{
      tube(hip,knee,0.090,0.066,6,thighHex);
      tube(knee,ank,0.062,0.048,6,greaveHex);
      stack([
        {y:0.012, rx:0.070, rz:0.078, cx:ank.x, cz:ank.z, hex:greaveHex},
        {y:0.09,  rx:0.062, rz:0.062, cx:ank.x, cz:ank.z, hex:P.scaleLt},
        {y:0.15,  rx:0.066, rz:0.064, cx:ank.x, cz:ank.z, hex:greaveHex},
      ], 6, {capTop:{hex:greaveHex, lift:0.005}, capBot:{hex:greaveHex}});
    };
    /* RIGHT — forward, planted, bent (weight-bearing, foot flat and well ahead). R1 CRITIC FIX:
       greave lifted from scaleDk to scale (mid-value) so the legs don't melt into the ground shadow. */
    const hipR=V(L.hipHalf, L.hipY-0.02, 0.0), kneeR=V(0.155,0.40,0.24), ankR=V(0.130,0.045,0.40);
    legF(hipR,kneeR,ankR,P.robeDk,P.scale);
    const toeRA=V(ankR.x,0.045,ankR.z), dR=V(0.06,0,1).normalize();
    tube(toeRA, toeRA.clone().addScaledVector(dR,0.13), 0.058,0.044,6,P.scale,{capB:{hex:P.scaleLt, lift:0.012}});
    /* LEFT — trailing back, straighter, heel lifted (braced push-off). R3 CRITIC FIX: this leg sits on
       the far (-x,-z) side from the dimetric camera/key-light (key light is +x/+z-biased, this side only
       gets the weak 0.22 fill) AND tucks behind the torso/cape from this angle — at P.scale it nearly
       vanished into the void (law 2/3 failure spotted on wight-r3.png). Greave/boot lifted to scaleLt
       (brighter, self-lit value) and the knee/ankle swept slightly further -x (clear of the torso
       silhouette, same fix pattern as the R2 blade sweep) so the trailing leg holds a visible, separate
       silhouette instead of reading as a disconnected fleck. */
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.0), kneeL=V(-0.165,0.42,-0.18), ankL=V(-0.150,0.10,-0.28);
    legF(hipL,kneeL,ankL,P.robeDk,P.scaleLt);
    const toeLA=V(ankL.x,0.09,ankL.z), dL=V(-0.10,0,1).normalize();
    tube(toeLA, toeLA.clone().addScaledVector(dL,0.11), 0.052,0.038,6,P.scaleLt,{capB:{hex:P.scaleLt, lift:0.012}});
  }

  /* base disc — shared module (Medium: r=0.42) */
  buildBase(P);
}
