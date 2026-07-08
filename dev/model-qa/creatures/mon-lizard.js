/* dev/model-qa/creatures/mon-lizard.js — the GIANT LIZARD (bespoke QUADRUPED, Large monitor-lizard,
   REALM core, CR 1/4, 52 live instances — until this wave it also stood in for
   doppelganger/medusa). MODEL-FOUNDRY pass-1 REBUILD (2026-07-08 foundry pilot, rebuild-w1 cell 1).
   Preserves the mottled swamp-green/olive-hide palette + the pale-belly/dorsal-ridge/forked-tongue
   signature from the prior build; geometry replaced to hit the REPTILE SPRAWL anatomy + the
   mid-stride pose law.

   ANATOMY (QUADRUPED — reptile sprawl, not mammal digitigrade): the upper limb runs OUT from the
   body near-horizontal (elbow/knee pushed wide to the side, "elbows-out") THEN drops down to a
   splayed foot — never tucked under like a wolf's column leg. Belly stays low, close to the ground.

   FEATURE CHECKLIST (the ~1.1-1.6k budget buys):
     1. Low horizontal barrel torso, dorsally flattened, mottled hide bands + a pale belly strip
        low on the flanks (the reptile top-dark/bottom-pale value split, law 3's high-value zone).
     2. Dorsal ridge — a line of dark scute quads + spine points running rump->neck.
     3. Broad wedge head, HELD COCKED — tilted off-axis on the neck (not bilaterally square), with
        a wide jaw hinge and a blunt forward snout.
     4. OPEN JAW — the lower jaw drops and juts forward, separated from the upper skull by a dark
        mouth gap, with the forked tongue flicking out past the open bite (the second high-value
        beat, pale tongue against the dark mouth interior).
     5. SPRAWL LEGS in an asymmetric MID-STRIDE diagonal gait — front-left + rear-right reaching
        FORWARD, front-right + rear-left driving BACK — each leg's upper segment out-and-level,
        lower segment dropping to a splayed clawed foot. Signature = the sprawl posture itself.
     6. LONG S-CURVED TAIL dragging behind — sweeps out to one side then back to the other (not a
        single-direction curve), as long as the body, tapering to a whip tip; dorsal ridge
        continues onto the thick tail base.

   POSE SENTENCE: a big sprawling monitor lizard caught mid-stride — body carried low, head cocked
   off-axis and jaw hung open with the tongue flicking out to taste the air, the diagonal pair of
   legs planted forward while the other diagonal pair drives back, and the long tail dragging an
   S-curve trail behind it — never a static square stand.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html SETS['rebuild-w1'] cell 1. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGiantLizard(){
  /* ---------- PALETTE (VS desaturated; mottled swamp-green/olive scale, pale throat) — kept from
     the prior build (the named signature: mottled hide / pale belly / dark ridge / red tongue). */
  const P = {
    hide:0x5c6042, hideDk:0x3f4530, hideLt:0x767a54,          // olive-green scaly hide
    mottleA:0x515636, mottleB:0x6a6d48,                        // dorsal mottle bands
    belly:0x817a58, bellyDk:0x757052,                          // pale throat/belly (kept a shade DARKER
                                                                // than P.sock — pass-2 fix: belly and sock
                                                                // were near-identical values and melted into
                                                                // one undifferentiated grey slab; splitting
                                                                // them lets the legs read as their OWN shapes
                                                                // separate from the belly patch, law 3)
    ridge:0x2f3324,                                            // dark dorsal ridge scutes
    snout:0x545838, nostril:0x201d16, mouth:0x2a1f1a,
    tongue:0x933a3e,                                           // forked flicking tongue
    claw:0x241f19, disc:0x4a4038, discTop:0x585047,
    sock:0xc4bf94,                                             // pale lower-leg value-contrast band (law 3:
                                                                // the sprawled legs are the signature — they
                                                                // need a high-value zone or they vanish
                                                                // dark-on-dark against the void at 1/3-res).
                                                                // Pass-2: pushed noticeably brighter than the
                                                                // belly so the 4 legs read as distinct pale
                                                                // limbs, not folded into the belly's grey mass.
  };

  /* ---------- LANDMARKS — spine along +z, held LOW (belly close to ground), body ~1.3u long. ---------- */
  const spY = 0.40;                             // low horizontal spine height
  const S = {
    tailBase: V(0, spY-0.02, -0.66),
    rump:     V(0, spY+0.02, -0.46),
    loin:     V(0, spY+0.03, -0.22),
    mid:      V(0, spY+0.03,  0.02),
    shldr:    V(0, spY+0.01,  0.28),
    neck:     V(0, spY-0.02,  0.48),
    headB:    V(0, spY-0.04,  0.62),            // head root, before the cocked offset below
  };

  /* ---------- BODY — one horizontal loft; a broad, dorsally-flattened reptile barrel. ---------- */
  tube(S.rump,  S.loin,  0.230, 0.255, 9, P.hide,    {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.255, 0.260, 9, P.mottleA, {phase:Math.PI/9});
  tube(S.mid,   S.shldr, 0.260, 0.235, 9, P.hide,    {phase:Math.PI/9});
  tube(S.shldr, S.neck,  0.235, 0.155, 9, P.mottleB, {phase:Math.PI/9});
  tube(S.neck,  S.headB, 0.155, 0.125, 9, P.hideDk,  {phase:Math.PI/9});
  /* pale belly strip low on the flanks (reptile underside — the dark-top/pale-bottom value split).
     Pass-2: narrowed from a wide slab to a true STRIP (was reading as one undifferentiated grey
     blob merged with the leg socks below it — law 2/3 fix, keeps the belly its own thin band so
     the legs read as separate pale shapes underneath it, not the same patch). */
  {
    const by = spY-0.235;
    quad(V(-0.095,by,-0.38), V(0.095,by,-0.38), V(0.085,by+0.02,0.24), V(-0.085,by+0.02,0.24), P.belly, 0.05);
  }
  /* DORSAL RIDGE — a line of dark scute quads running the spine (rump->neck), reptile read */
  {
    const seg = [[-0.44,spY+0.24],[-0.20,spY+0.26],[0.04,spY+0.26],[0.28,spY+0.22]];
    for(let i=0;i<seg.length-1;i++){
      const [z0,y0]=seg[i], [z1,y1]=seg[i+1];
      quad(V(-0.028,y0,z0), V(0.028,y0,z0), V(0.024,y1,z1), V(-0.024,y1,z1), P.ridge, 0.04);
      // little spine points poking up
      quad(V(-0.014,y0,z0), V(0.014,y0,z0), V(0,y0+0.045,z0-0.01), V(0,y0+0.045,z0-0.01), P.ridge, 0.03);
    }
  }

  /* ---------- HEAD — a broad flat WEDGE, COCKED off-axis on the neck (tilted +x, yawed slightly),
     with a wide jaw hinge and an OPEN JAW dropped down + forward, tongue flicking past the bite. -- */
  {
    const n=9, ph=Math.PI/n;
    /* the cock: head center shifted +x and the whole wedge nudged, so it reads turned/tilted off
       the body's centerline rather than square-on — law 5's "not at attention" applied to the head. */
    const cockX = 0.055, cockY = 0.03;
    const cz = (z)=> z;                         // z stays on-axis; x/y carry the cock
    const bands=[
      {y:spY-0.075+cockY*0.3, x:cockX*0.3, cz:0.66, rx:0.130, rz:0.135, hex:P.hide},   // jaw hinge / cheek (wide)
      {y:spY-0.030+cockY*0.7, x:cockX*0.7, cz:0.69, rx:0.150, rz:0.140, hex:P.hide},   // broad cranium
      {y:spY+0.010+cockY,     x:cockX,     cz:0.66, rx:0.118, rz:0.106, hex:P.hideDk}, // brow (tilted up+over)
    ];
    const rings=bands.map(b=>ring(V(b.x,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(cockX, spY+0.03+cockY, 0.66), P.hideDk);

    /* UPPER SNOUT — a broad blunt wedge projecting forward (+z) off the cocked cranium. */
    const snB = V(cockX*0.8, spY-0.080+cockY*0.6, 0.66);
    const snM = V(cockX*0.5, spY-0.095+cockY*0.3, 0.78);
    const snT = V(cockX*0.2, spY-0.105+cockY*0.1, 0.88);   // blunt muzzle tip (upper jaw only, above the gap)
    tube(snB, snM, 0.120, 0.086, n, P.snout, {raz:0.098, rbz:0.064, phase:ph});
    tube(snM, snT, 0.086, 0.050, n, P.snout, {raz:0.064, rbz:0.034, phase:ph});
    /* two nostril pits near the upper tip */
    for(const s of [-1,1]) quad(V(s*0.022-0.010+snT.x,spY-0.088,0.865), V(s*0.022+0.010+snT.x,spY-0.088,0.865),
                                V(s*0.022+0.008+snT.x,spY-0.072,0.855), V(s*0.022-0.008+snT.x,spY-0.072,0.855), P.nostril, 0.0);

    /* OPEN JAW — the lower jaw is a SEPARATE loft dropped well below the upper snout and jutting
       forward, so a dark mouth gap opens between them (law 5's high-expression bite). */
    const jawHinge = V(0, spY-0.155, 0.62);
    const jawMid   = V(0, spY-0.205, 0.76);
    const jawTip   = V(0, spY-0.225, 0.90);
    tube(jawHinge, jawMid, 0.110, 0.078, 7, P.snout, {raz:0.075, rbz:0.052, phase:ph, capA:{hex:P.mouth}});
    tube(jawMid,   jawTip, 0.078, 0.040, 7, P.snout, {raz:0.052, rbz:0.026, phase:ph, capB:{hex:P.mouth, lift:0.006}});
    /* dark mouth-gap wall between the upper snout underside and the dropped lower jaw */
    quad(V(-0.085,spY-0.095,0.68), V(0.085,spY-0.095,0.68), V(0.070,spY-0.150,0.86), V(-0.070,spY-0.150,0.86), P.mouth, 0.03);
    /* pale throat under the dropped jaw */
    quad(V(-0.075,spY-0.215,0.66), V(0.075,spY-0.215,0.66), V(0.045,spY-0.230,0.86), V(-0.045,spY-0.230,0.86), P.belly, 0.05);

    /* FORKED TONGUE — flicks forward+down out of the open bite, splitting into two tips. */
    const tRoot = V(0, spY-0.170, 0.86);
    const tMid  = V(0, spY-0.190, 1.00);
    tube(tRoot, tMid, 0.014, 0.010, 4, P.tongue, {capA:{hex:P.mouth}});
    for(const s of [-1,1]){
      const fk = V(s*0.030, spY-0.198, 1.10);
      tube(tMid, fk, 0.009, 0.004, 4, P.tongue, {capB:{hex:P.tongue, lift:0.004}});
    }
  }

  /* ---------- LEGS — SPRAWLING reptile stance in an ASYMMETRIC MID-STRIDE diagonal gait:
     front-left + rear-right reach FORWARD (advanced), front-right + rear-left drive BACK
     (trailing) — the upper limb runs OUT to the side (near-horizontal, elbows-out), then the
     lower limb drops to a splayed clawed foot. Belly stays low throughout. ---------- */
  {
    const sprawlLeg=(shoulder, footX, footZ, strideZ, hex)=>{
      // elbow/knee pushed OUT to the side + level with the body (the sprawl), biased toward the
      // stride direction so the reaching legs read reaching and the trailing legs read pushing.
      // Pass-2: widened the outward push (0.24->0.32) — r1/r2 renders showed the sprawl silhouette
      // reading as a single collapsed blob because the elbows stayed inside the torso's screen
      // footprint from the capture camera angle; pushing the elbow further past the torso's ~0.26
      // half-width actually clears the body outline (law 2: the stance has to change the silhouette).
      const elbowX = shoulder.x + Math.sign(shoulder.x)*0.32;
      const elbow = V(elbowX, spY-0.16, shoulder.z + strideZ*0.10);
      const foot  = V(footX, 0.055, footZ);
      tube(shoulder, elbow, 0.082, 0.062, 7, hex);                       // upper limb OUT to the side
      tube(elbow, foot, 0.062, 0.044, 6, P.sock, {capB:{hex:P.sock, lift:0.006}}); // lower drops down —
        // PALE (law 3 value-contrast): the sprawl silhouette is the signature, so the drop segment
        // that actually clears the body outline against the dark void carries the light value.
      // splayed clawed foot — a small pad + 4 spread claws, oriented toward the stride direction
      const pad = V(foot.x, 0.03, foot.z + Math.sign(strideZ||1)*0.03);
      const side = Math.sign(foot.x||1);
      for(const [dx,dz] of [[side*0.07,0.025],[side*0.035,0.07],[-side*0.012,0.08],[-side*0.045,0.06]]){
        const cb = V(pad.x, 0.038, pad.z);
        const ct = V(pad.x+dx, 0.008, pad.z + Math.sign(strideZ||1)*dz*0.6);
        tube(cb, ct, 0.016, 0.006, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    // front-left REACHES forward (advanced diagonal), front-right trails back
    sprawlLeg(V(-0.185, spY-0.03, 0.26), -0.40, 0.46,  1, P.hide);
    sprawlLeg(V( 0.185, spY-0.03, 0.26),  0.44, 0.18, -1, P.hide);
    // rear-right REACHES forward (matching diagonal), rear-left trails back
    sprawlLeg(V(-0.200, spY-0.01, -0.42), -0.46, -0.52, -1, P.hide);
    sprawlLeg(V( 0.200, spY-0.01, -0.42),  0.42, -0.24,  1, P.hide);
  }

  /* ---------- TAIL — LONG + heavy at the base, tapering to a whip; an S-CURVE dragging behind:
     sweeps out to +x first, then back across through center to -x, so the outline reads a snaking
     S rather than a single bank turn. ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V( 0.10, spY-0.05, -0.90);
    const t2 = V( 0.20, spY-0.10, -1.12);        // first bank: swings out +x
    const t3 = V( 0.16, 0.14,     -1.34);        // apex of the first curve
    const t4 = V(-0.02, 0.18,     -1.52);        // crosses back through center
    const t5 = V(-0.20, 0.11,     -1.66);        // second bank: swings out -x
    const tip= V(-0.30, 0.075,    -1.74);
    tube(t0, t1, 0.145, 0.120, 8, P.hide,    {phase:Math.PI/8, capA:{hex:P.hideDk}});
    tube(t1, t2, 0.120, 0.092, 8, P.mottleA, {phase:Math.PI/8});
    tube(t2, t3, 0.092, 0.066, 8, P.hide,    {phase:Math.PI/8});
    tube(t3, t4, 0.066, 0.044, 8, P.mottleB, {phase:Math.PI/8});
    tube(t4, t5, 0.044, 0.024, 8, P.hide,    {phase:Math.PI/8});
    tube(t5, tip,0.024, 0.008, 8, P.hideDk,  {phase:Math.PI/8, capB:{hex:P.hideDk, lift:0.006}});
    // a faint dorsal-ridge continuation on the thick tail base
    quad(V(-0.020,spY+0.12,-0.70), V(0.020,spY+0.12,-0.70), V(0.016,spY-0.02,-0.98), V(-0.016,spY-0.02,-0.98), P.ridge, 0.03);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
