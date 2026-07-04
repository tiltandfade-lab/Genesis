/* dev/model-qa/creatures/mon-hookhorror.js — the HOOK HORROR (bespoke BIPEDAL, Large Monstrosity).
   CREATURE-MODELS-P2 Wave 1: a bipedal beetle-brute. The read: a hunched, chitinous CARAPACE torso
   (segmented exoskeleton plates), a vulture-ish BEAKED head sat low on hunched shoulders, and TWO
   LONG ARMS each ending in a big curved HOOK instead of a hand — the signature, pronounced sickle
   hooks. Stout digitigrade legs (backward-bent, insectile). Chitin brown-black (VS desaturated,
   matte), lighter plate edges catching what light there is, bone-pale beak + hooks standing out
   against the dark carapace. NO eye quads — the beaked skull-shape reads as a face on its own.
   Seeds the arthropod-biped base (umber-hulk, grell-adjacent). Whole-object grammar: one function,
   one merged geometry frame, no anchors, no part transforms. Large size: base disc r=0.55.
   Imported by ps1-sheet.html (set=p2mon) + WHOLE_OBJECT_REGISTRY["hook-horror"]. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildHookHorror(){
  /* ---------- PALETTE (VS desaturated; chitin brown-black, lighter plate edges, bone-pale beak/hooks) ---------- */
  const P = {
    chitin:0x3a3226, chitinDk:0x241f17, chitinLt:0x554a37,      // matte brown-black carapace
    plateEdge:0x6b5c40, plateEdgeDk:0x453a2a,                    // lighter plate rims catching light
    joint:0x1c1810,                                              // dark joint gaps between plates
    beak:0xc9bb96, beakDk:0x8f8264, beakTip:0x2a2419,            // bone-pale beak, dark tip
    hook:0xd6c9a4, hookDk:0x9c8f6c, hookTip:0x2a2419,            // bone-pale curved hooks, dark points
    claw:0x201b12,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.chitin]:'bone', [P.chitinDk]:'bone', [P.chitinLt]:'bone',
    [P.plateEdge]:'bone', [P.plateEdgeDk]:'bone',
    [P.beak]:'bone', [P.beakDk]:'bone', [P.hook]:'bone', [P.hookDk]:'bone',
  });

  /* ---------- LANDMARKS — hunched biped, weight forward over stout legs. Torso pitched forward
     hard (like the bugbear hunch) so the carapace mass reads coiled over the arms/hooks. ---------- */
  const L = {
    hipY:0.68, waistY:0.80, ribY:0.95, chestY:1.10, shldY:1.22, neckY:1.26,
    hipHalf:0.170, shoulderX:0.360,
    jawY:1.22, beakY:1.28, browY:1.36, crownY:1.44, headTopY:1.50,
  };

  /* strong forward pitch about the hips — hunched insectile carry */
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.34);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — segmented chitin carapace, banded plates each capped with a lighter rim. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.230, rz:0.205, hex:P.chitinDk},
      {y:L.waistY, rx:0.260, rz:0.225, hex:P.chitin},
      {y:L.ribY,   rx:0.300, rz:0.250, hex:P.chitinLt},
      {y:L.chestY, rx:0.340, rz:0.270, hex:P.chitin},           // broad hunched chest
      {y:L.shldY,  rx:0.365, rz:0.260, hex:P.chitinLt},         // huge rolled carapace shoulders
      {y:L.neckY,  rx:0.170, rz:0.155, hex:P.chitinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex);
      }
    }
    capFan(rings.at(-1), hunch(V(0, L.neckY+0.02, 0)), P.chitinDk);

    /* segmented plate rims — thin raised bands riding the torso at each seam, lighter edge color */
    for(const y of [L.waistY+0.055, L.ribY+0.06, L.chestY+0.065]){
      const rr = ring(V(0,y,0.0), V(0,1,0), 0.30, 0.26, n, ph).map(hunch);
      const rr2 = ring(V(0,y+0.03,0.0), V(0,1,0), 0.295, 0.255, n, ph).map(hunch);
      stitch([rr,rr2], ()=>P.plateEdge);
    }
    /* dark joint-gap grooves between the main plates (thin dark quads, front-facing) */
    for(const [y0,y1] of [[L.waistY,L.ribY],[L.ribY,L.chestY]]){
      const a = hunch(V(-0.02,y0,0.24)), b = hunch(V(0.02,y0,0.24));
      const c = hunch(V(0.018,y1,0.27)), d = hunch(V(-0.018,y1,0.27));
      quad(a,b,c,d,P.joint,0.04);
    }
  }

  /* ---------- HEAD — vulture-ish BEAKED skull, low + jutting forward on the hunched neck. NO eyes. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.130, rz:0.145, hex:P.chitin},
      {y:L.beakY,  rx:0.155, rz:0.150, hex:P.chitinLt},
      {y:L.browY,  rx:0.150, rz:0.128, hex:P.chitin},
      {y:L.crownY, rx:0.110, rz:0.100, hex:P.chitinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* push the brow/beak-band front verts forward for a jutting vulture skull profile */
    for(const i of [1,2]){ rings[1][i].z += 0.05; }
    for(const i of [1,2]){ rings[2][i].z += 0.03; rings[2][i].y -= 0.01; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex);
      }
    }
    capFan(rings.at(-1), hunch(V(0, L.headTopY, -0.02)), P.chitinDk);

    /* BEAK — a long down-curving hooked beak projecting forward, bone-pale, dark tip */
    const beakRoot = hunch(V(0, L.jawY+0.02, 0.185));
    const beakMid  = hunch(V(0, L.jawY-0.03, 0.34));
    const beakTip  = hunch(V(0, L.jawY-0.10, 0.44));
    tube(beakRoot, beakMid, 0.085, 0.055, 7, P.beak, {raz:0.070, rbz:0.042, phase:ph, capA:{hex:P.beakDk}});
    tube(beakMid, beakTip, 0.055, 0.012, 7, P.beakDk, {raz:0.042, rbz:0.014, phase:ph, capB:{hex:P.beakTip, lift:0.01}});
    /* lower mandible — a shorter under-beak plate */
    const lowRoot = hunch(V(0, L.jawY-0.05, 0.19));
    const lowTip  = hunch(V(0, L.jawY-0.11, 0.33));
    tube(lowRoot, lowTip, 0.062, 0.020, 6, P.beakDk, {raz:0.045, rbz:0.018, capB:{hex:P.beakTip, lift:0.006}});
  }

  /* ---------- ARMS — TWO LONG ARMS, each ending in a big curved sickle HOOK instead of a hand.
     Held out from the hunched shoulders, elbows bent, forearms swinging low-forward — the signature
     silhouette read. ---------- */
  const buildHookArm = (side)=>{
    const S = hunch(V(side*L.shoulderX, L.shldY-0.02, 0.02));
    const E = V(side*0.50, 0.92, 0.22);                  // elbow out + forward
    const W = V(side*0.46, 0.58, 0.36);                  // wrist drops low-forward
    tube(S, E, 0.115, 0.088, 7, P.chitin, {capA:{hex:P.chitinDk}});
    tube(E, W, 0.086, 0.058, 7, P.chitinLt);
    /* short stub wrist stump before the hook root */
    const hookRoot = V(side*0.44, 0.50, 0.44);
    tube(W, hookRoot, 0.058, 0.048, 6, P.chitinDk);

    /* THE HOOK — a big curved sickle arcing down and back from the wrist, bone-pale, dark point.
       Built as a chain of short tube segments along an arc so it reads as a pronounced curve. */
    const arcPts = [];
    const arcN = 6, arcRad = 0.30;
    for(let i=0;i<=arcN;i++){
      const t = i/arcN;                                   // 0..1 along the hook
      const ang = t * 2.05;                                // curls ~117° — pronounced sickle
      // curl downward+inward: start pointing forward/out, sweep down and back under itself
      const x = hookRoot.x + Math.sin(ang)*arcRad*side*0.9;
      const y = hookRoot.y - (1-Math.cos(ang))*arcRad*1.05;
      const z = hookRoot.z + 0.10 + Math.cos(ang*0.85)*0.05 - t*0.02;
      arcPts.push(V(x,y,z));
    }
    for(let i=0;i<arcPts.length-1;i++){
      const t=i/(arcPts.length-1);
      const ra = 0.052*(1-t*0.75)+0.010;
      const rb = 0.052*(1-(t+1/(arcPts.length-1))*0.75)+0.010;
      const isLast = i===arcPts.length-2;
      tube(arcPts[i], arcPts[i+1], Math.max(ra,0.012), Math.max(rb,0.008), 6,
        i<2?P.hook:P.hookDk,
        isLast ? {capB:{hex:P.hookTip, lift:0.006}} : {});
    }
  };
  buildHookArm(-1);
  buildHookArm(1);

  /* ---------- LEGS — stout, digitigrade (insectile backward-bent knee), planted wide. ---------- */
  {
    const buildLeg = (side)=>{
      const hip  = V(side*L.hipHalf, L.hipY-0.02, 0.00);
      const knee = V(side*0.235, 0.42, 0.20);              // knee pushed forward (digitigrade crouch)
      const ankle= V(side*0.215, 0.20, -0.06);             // ankle kicks back
      const toe  = V(side*0.225, 0.055, 0.14);             // foot plants forward again under the body
      tube(hip, knee, 0.135, 0.098, 7, P.chitin, {capA:{hex:P.chitinDk}});
      tube(knee, ankle, 0.096, 0.062, 7, P.chitinLt);
      tube(ankle, toe, 0.060, 0.040, 6, P.chitinDk);
      /* stout clawed foot — short splayed claws forward */
      const heel = V(toe.x, 0.045, toe.z);
      for(const [dx,dz] of [[side*0.05,0.05],[0,0.09],[-side*0.05,0.05]]){
        const cb = V(heel.x, 0.045, heel.z);
        const ct = V(heel.x+dx, 0.012, heel.z+dz);
        tube(cb, ct, 0.020, 0.006, 4, P.claw, {capB:{hex:P.claw, lift:0.005}});
      }
    };
    buildLeg(-1);
    buildLeg(1);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
