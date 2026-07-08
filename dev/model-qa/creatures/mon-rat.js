/* dev/model-qa/creatures/mon-rat.js — the GIANT RAT (QUADRUPED/rodent, Small, CR 1/8, realm core).
   Whole-object grammar: one function, one geometry frame, no anchors. Imported by ps1-sheet.html
   (SETS 'rebuild-w1' cell 0 + others) + the proof sheet.

   MODEL-FOUNDRY pass-1 (REBUILD, 2026-07-08). 54 live instances — 3rd most-used body; realm core.

   FEATURE CHECKLIST (the tri budget buys these — ANATOMY-CANON QUADRUPED/DIGITIGRADE, rodent read):
     1. Hunched arc-back profile — high humped shoulders/rump, spine cresting mid-back, head carried
        LOW off a short thick neck (the rat crouch, not a level canine topline).
     2. Digitigrade skitter legs — true Z-zigzag hind leg (hip->fwd->stifle->back->HIGH hock->paw),
        near-straight front column; all four legs SPLAYED wide + weight forward (mid-scurry stance).
     3. Naked segmented tail, AS LONG AS THE BODY — bare pale tube in visible ring segments (not a
        smooth taper), whipping out behind for balance.
     4. Oversized incisors + whiskery wedge snout, thrust FORWARD and slightly UP (alert sniff).
     5. Big oval ears perked upright, clear of the skull.
     6. Value ladder: pale tail / teeth / ear-inners read light against the dark greasy coat — the
        naked tail is the single loudest light shape in the silhouette.

   POSE SENTENCE: reared up mid-scurry — weight thrown onto the splayed front legs, hindquarters
   still driving off a coiled rear leg, back arched into a hump, head snapped up and forward
   sniffing the air, tail whipped out low and back for counter-balance. Never a static loaf.

   Anatomy per ANATOMY-CANON QUADRUPED-DIGITIGRADE, compressed for a hunched rodent: the hind leg
   keeps the 4-segment Z-zigzag (thigh down-fwd -> stifle -> tibia down-back -> HIGH hock -> near-
   vertical cannon -> paw) but the whole rig sits LOWER and more coiled than a canine; the topline
   humps UP over the shoulders/rump instead of running level (the arc-back is the family's rodent
   variant, not a law violation — the four zigzag hind-leg segments + high hock are preserved). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGiantRat(){
  /* ---------- PALETTE (VS desaturated; matted grey-brown vermin — kept from the prior pass) ---------- */
  const P = {
    fur:0x5e5346, furDk:0x40392f, furLt:0x8a7d6c, belly:0x9c8f7c,
    tail:0xdccbae, tailDk:0xa8927a,           // bare pale segmented tail — the loudest light shape
    ear:0xb89e88, earIn:0x8a5f56,             // fleshy pink-grey ear + darker inner cup
    snout:0x847264, nose:0x2a2320, tooth:0xd8cdb4,
    whisker:0xcabfa8,
    disc:0x342c24, discTop:0x40372c,   // darkened vs. body fur — was near-luminance-matched to
                                        // P.fur/discTop (85 vs 81), so the body silhouette vanished
                                        // into the disc it stands on (law 3). ~30pt gap now.
  };

  /* ---------- LANDMARKS — arc-back spine, low over the disc, humped over the shoulder. ----------
     Body ~0.85u long. Unlike a level canine topline, the spine RISES from a low crouched neck up
     over the shoulders, cresting again at the rump — the "hunched" read. */
  const S = {
    rump:   V(0, 0.34, -0.30),   // haunch — high, driving leg root
    crest:  V(0, 0.40, -0.14),   // topline crest #1 (over the hips)
    mid:    V(0, 0.36,  0.00),   // saddle dip between the two humps
    shldr:  V(0, 0.42,  0.16),   // topline crest #2 (over the shoulders — taller, weight-forward)
    neck:   V(0, 0.30,  0.28),   // neck dives down — head carried LOW and thrust forward
    headB:  V(0, 0.24,  0.38),
  };

  /* ---------- BODY — one arched loft (two humps + a saddle), fatter at the rump. ---------- */
  tube(S.rump,  S.crest, 0.220, 0.245, 8, P.fur,   {phase:Math.PI/8, capA:{hex:P.furDk, lift:0.02}});
  tube(S.crest, S.mid,   0.245, 0.225, 8, P.fur,   {phase:Math.PI/8});
  tube(S.mid,   S.shldr, 0.225, 0.205, 8, P.fur,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.205, 0.145, 8, P.furDk, {phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.145, 0.110, 8, P.furDk, {phase:Math.PI/8});
  /* pale belly strip under the barrel — a lighter band low on the flanks */
  {
    const by = 0.10;
    quad(V(-0.12,by,-0.24), V(0.12,by,-0.24), V(0.11,by+0.02,0.14), V(-0.11,by+0.02,0.14), P.belly, 0.05);
  }

  /* ---------- HEAD — thrust forward + UP off the low neck (alert sniff), tapering to a whiskery
     pointed snout. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:0.235, cz:0.42, rx:0.112, rz:0.118, hex:P.fur},
      {y:0.270, cz:0.45, rx:0.128, rz:0.122, hex:P.fur},
      {y:0.300, cz:0.44, rx:0.116, rz:0.105, hex:P.furDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, 0.325, 0.43), P.furDk);

    /* SNOUT — projects forward and slightly UP (sniffing), tapering to a blunt nose. Kept inside
       the disc front rim (nose tip ~z=0.555) so the mini doesn't overhang the base. */
    const snB = V(0, 0.290, 0.475);
    const snM = V(0, 0.310, 0.525);
    const snT = V(0, 0.320, 0.555);
    tube(snB, snM, 0.100, 0.072, n, P.snout, {raz:0.086, rbz:0.058, phase:ph});
    tube(snM, snT, 0.072, 0.038, n, P.snout, {raz:0.058, rbz:0.030, phase:ph, capB:{hex:P.nose, lift:0.010}});

    /* two prominent incisors under the nose tip — the rodent tell, high-value pale */
    for(const s of [-1,1]){
      const tx=s*0.016;
      quad(V(tx-0.014,0.278,0.540), V(tx+0.014,0.278,0.540),
           V(tx+0.010,0.238,0.528), V(tx-0.010,0.238,0.528), P.tooth, 0.02);
    }

    /* WHISKERS — thin quads splaying from the snout sides */
    for(const s of [-1,1]){
      for(const [dy,dz,len] of [[0.014,0.02,0.15],[-0.004,0.01,0.16],[-0.020,0.0,0.14]]){
        const a=V(s*0.040, 0.300+dy, 0.512+dz);
        const b=a.clone().add(V(s*len, dy*0.4-0.01, 0.02));
        quad(a, V(a.x,a.y-0.004,a.z), V(b.x,b.y-0.004,b.z), b, P.whisker, 0.0);
      }
    }

    /* EARS — big oval ears perked upright, lifted clear of the skull crown (signature #2). */
    for(const s of [-1,1]){
      const stubB=V(s*0.096, 0.315, 0.395);
      const base =V(s*0.126, 0.385, 0.393);
      const up   =V(s*0.34, 0.93, 0.06); up.normalize();
      tube(stubB, base, 0.030, 0.038, 6, P.ear);
      const b1=base.clone().addScaledVector(up, 0.090);
      const b2=base.clone().addScaledVector(up, 0.175);
      const r0=ring(base, up, 0.070, 0.034, 8, Math.PI/8);
      const r1=ring(b1,   up, 0.090, 0.040, 8, Math.PI/8);
      const r2=ring(b2,   up, 0.050, 0.024, 8, Math.PI/8);
      stitch([r0,r1,r2], ()=>P.ear);
      capFan(r2, base.clone().addScaledVector(up, 0.230), P.ear);
      const cupC=base.clone().addScaledVector(up, 0.095).add(V(0,0,0.030));
      const ci=ring(cupC, up, 0.058, 0.030, 8, Math.PI/8);
      capFan(ci, cupC.clone().add(V(0,0,-0.028)), P.earIn, true);
    }
  }

  /* ---------- LEGS — true digitigrade Z-zigzag (ANATOMY-CANON), splayed wide + weight forward
     for the mid-scurry pose. ---------- */
  {
    /* FRONT legs — near-straight column, but thrown forward and OUT (weight caught on the front
       pair as the body reaches into the scurry). shoulder(hip) -> carpus -> paw. */
    const frontLeg=(hip, out)=>{
      const carpus = V(hip.x + out*0.05, 0.15, hip.z + 0.10);
      const paw    = V(hip.x + out*0.07, 0.045, hip.z + 0.15);
      tube(hip, carpus, 0.052, 0.040, 6, P.fur);
      tube(carpus, paw, 0.038, 0.026, 6, P.furLt, {capB:{hex:P.snout, lift:0.007}});
      const pad=V(paw.x, 0.018, paw.z+0.05);
      tube(V(paw.x,0.05,paw.z), pad, 0.026, 0.020, 5, P.snout, {capB:{hex:P.snout, lift:0.005}});
    };
    frontLeg(V(-0.145, 0.24, 0.20), -1);
    frontLeg(V( 0.145, 0.24, 0.20),  1);

    /* REAR legs — full digitigrade 4-segment zigzag: hip -> stifle(fwd+down) -> hock(back+down,
       HIGH) -> cannon(near-vertical) -> paw. Left leg planted (driving foot back), right leg coiled
       forward mid-kick — the asymmetry sells the scurry rather than a static stand. */
    const hindLeg=(hip, kickFwd, out)=>{
      const stifle = V(hip.x + out*0.03, 0.225, hip.z + 0.075);              // fwd + down from hip
      const hock   = V(hip.x + out*0.05, 0.145, hip.z - 0.03 + kickFwd*0.10); // back + down, HIGH
      const cannon = V(hip.x + out*0.055, 0.045, hip.z - 0.02 + kickFwd*0.16);
      tube(hip, stifle, 0.062, 0.052, 6, P.fur);
      tube(stifle, hock, 0.052, 0.040, 6, P.fur);
      tube(hock, cannon, 0.036, 0.026, 6, P.furLt, {capB:{hex:P.snout, lift:0.007}});
      const pad=V(cannon.x, 0.016, cannon.z+0.045);
      tube(V(cannon.x,0.05,cannon.z), pad, 0.028, 0.022, 5, P.snout, {capB:{hex:P.snout, lift:0.006}});
    };
    hindLeg(V(-0.170, 0.35, -0.28), 0.0,  -1);   // planted / trailing
    hindLeg(V( 0.170, 0.35, -0.28), 1.0,   1);   // coiled forward mid-kick

  }

  /* ---------- TAIL — bare, pale, SEGMENTED, as long as the body; whips out low and back for
     balance (signature #1, the loudest high-value shape). A ring() collar at each segment boundary
     gives a visible joint-pulse (radius blip) so it reads as segmented rather than a smooth taper. ---------- */
  {
    const root = V(0.02, 0.30, -0.36);
    const t1   = V(0.07, 0.20, -0.52);
    const j1   = V(0.10, 0.16, -0.59);   // segment joint — slight radius pulse
    const t2   = V(0.14, 0.11, -0.66);
    const j2   = V(0.19, 0.09, -0.71);
    const t3   = V(0.24, 0.075,-0.75);
    const t4   = V(0.38, 0.065,-0.73);
    const t5   = V(0.52, 0.06, -0.62);
    const tip  = V(0.62, 0.055,-0.48);
    tube(root, t1, 0.056, 0.046, 6, P.tailDk, {phase:Math.PI/6, capA:{hex:P.furDk}});
    tube(t1,   j1, 0.046, 0.050, 6, P.tail,   {phase:Math.PI/6});   // joint bulge OUT
    tube(j1,   t2, 0.050, 0.038, 6, P.tail,   {phase:Math.PI/6});
    tube(t2,   j2, 0.038, 0.041, 6, P.tail,   {phase:Math.PI/6});   // joint bulge OUT
    tube(j2,   t3, 0.041, 0.030, 6, P.tail,   {phase:Math.PI/6});
    tube(t3,   t4, 0.030, 0.022, 6, P.tail,   {phase:Math.PI/6});
    tube(t4,   t5, 0.022, 0.015, 6, P.tail,   {phase:Math.PI/6});
    tube(t5,   tip,0.015, 0.008, 6, P.tailDk, {phase:Math.PI/6, capB:{hex:P.tailDk, lift:0.006}});
  }

  /* ---------- base disc (Small — same footprint as the prior pass). ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.35, 0.35, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.33, 0.33, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
