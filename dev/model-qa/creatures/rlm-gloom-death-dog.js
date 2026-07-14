/* dev/model-qa/creatures/rlm-gloom-death-dog.js — the DEATH DOG landmark table (QUADRUPED-
   DIGITIGRADE family, Medium, CR 1), docs/MODEL-FOUNDRY.md pass-1 AUTHOR (2026-07-08, gloom-w1).

   FLAVOR (SRD core identity kept, gloom realm read on top): a loyal farm dog that starved and
   rose wrong. SRD death dog = TWO-HEADED hound — that duality is the non-negotiable signature.
   The gloom read keeps it a risen STARVED dog: ribs showing through a hollow hide, not a healthy
   war-beast. Chassis follows the proven mon-wolf.js digitigrade rebuild (docs/ANATOMY-CANON.md
   § quadruped-digitigrade) — asymmetric belly/back torso stations, 4-segment hind Z-zigzag, near-
   straight front column — with the torso re-profiled gaunt (belly line pulled UP hard, ribs cut
   into the coat as dark grooves) and the single head swapped for TWO independent necks/heads.

   FEATURE CHECKLIST (the ~1.3-1.6k budget buys):
     1. TWO HEADS — independent necks off the same shoulders, split at different angles (one low
        and sniffing forward-down, one raised and snarling up-and-out) — the SRD identity, the one
        thing that must read at a squint.
     2. Exposed RIB BAND — 4-5 dark grooves cut across a gaunt barrel with PALE rib-edge highlights
        (the high-value zone law 3 needs) — starved-corpse-dog read, distinct from a healthy wolf.
     3. Starved digitigrade hind leg — the true 4-segment Z-zigzag (thigh fwd-down / tibia back-and-
        -up to a HIGH hock / near-vertical cannon), but thinner than a live wolf's — bone-close.
     4. Gaunt belly tuck exaggerated hard — the underline cuts up almost to the spine behind the
        ribs (starved, not merely lean).
     5. Two open maws — each head bares a fang row, one snarling (upper head) one panting-open
        (lower head) — doubles the "predator" read without doubling tri cost much (shared jaw rig).
     6. Patchy hide — a few bald/rot dark patches on the coat (rot-mottling, cheap value variety).

   POSE SENTENCE: a starved two-headed hound stalking low, weight sunk forward into a creeping
   advance — the raised head snarling up and out at the party while the low head hangs down,
   sniffing the ground for the scent it lost when it died — never a static stand, always mid-hunt.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Registered ps1-sheet.html SETS['gloom-w1'] cell 5. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDeathDog(){
  /* ---------- PALETTE (gloom Gothic-desaturated; murky-green-tinged hide per the retired
     model-recipes garnish, grey-brown fur accents, rib bone PALE for the value-contrast law) ---------- */
  const P = {
    coat:0x7c8570, coatDk:0x5c6450, saddle:0x454a3c, saddleDk:0x2c2f25,   // murky-green-grey hide (lifted r1)
    belly:0x9aa084, ruff:0x8f9478,
    rot:0x38392c, rotDk:0x24251c,                    // bald/rot mottling patches
    rib:0xf7eeca, ribDk:0x9a927a,                     // PALE exposed rib edges — the high-value zone
    sock:0x9a9a80,
    muzzle:0x5c6150, muzzleLt:0xa8ac8c, nose:0x141310,
    maw:0x2c1e1c, tongue:0x6e4442, tooth:0xe4dcc0,
    ear:0x50543f, earIn:0x27281c,
    eye:0xff8050,                                     // dead-eye glint, brightened r2 (critic pass) — measured zero-contrast in r2 engine render, pushed hotter+bigger
    claw:0x1c1a15, disc:0x3a3830, discTop:0x464438,
    // SECONDPASS FIX (batch-review flag): a distinctly lighter hide tone for the RAISED head's
    // skull bands — a material-level (not just geometry/facing-dependent) bright zone, so that
    // head reads as its own mass against the darker saddle/shoulder tones behind it even where a
    // thin glint quad might self-occlude at this pitch. >=140 RGB avg (176,184,156).
    coatHi:0xb0b89c, coatHiDk:0x8a9078,
  };

  const H = 0.74;                               // shoulder-height reference — lower than the wolf (H0.80): starved, sunk stance
  const N = 10;

  /* ---------- TORSO — asymmetric belly/back ellipse per station, gaunt: belly pulled UP hard
     behind the ribs (starved tuck exaggerated past the wolf baseline). ---------- */
  const T = [
    {z:-0.44, hw:0.170, backTop:H*0.98, belly:H*0.62, hex:P.coat},     // rump — sunk, bony haunch
    {z:-0.22, hw:0.150, backTop:H*0.97, belly:H*0.78, hex:P.saddle},   // loin — hard tuck
    {z: 0.00, hw:0.175, backTop:H*1.00, belly:H*0.66, hex:P.saddle},   // ribcage station
    {z: 0.20, hw:0.185, backTop:H*0.98, belly:H*0.54, hex:P.coat},     // chest (still hollow, not deep)
    {z: 0.32, hw:0.155, backTop:H*0.97, belly:H*0.60, hex:P.coat},     // shoulders
  ];
  const trings = T.map(s=>{
    const cy=(s.backTop+s.belly)/2, ry=(s.backTop-s.belly)/2;
    return ring(V(0,cy,s.z), V(0,0,1), s.hw, ry, N, Math.PI/N);
  });
  stitch(trings, b=>T[b].hex);
  capFan(trings[0], V(0, (T[0].backTop+T[0].belly)/2, T[0].z-0.04), T[0].hex, true);
  const backTopAt=(z)=>{
    for(let i=0;i<T.length-1;i++) if(z<=T[i+1].z) { const t=(z-T[i].z)/(T[i+1].z-T[i].z); return T[i].backTop+(T[i+1].backTop-T[i].backTop)*t; }
    return T.at(-1).backTop;
  };
  const bellyAt=(z)=>{
    for(let i=0;i<T.length-1;i++) if(z<=T[i+1].z) { const t=(z-T[i].z)/(T[i+1].z-T[i].z); return T[i].belly+(T[i+1].belly-T[i].belly)*t; }
    return T.at(-1).belly;
  };

  /* ---------- EXPOSED RIB BAND (signature #2) — dark grooves cut across the ribcage station with
     PALE rib-edge highlights riding the top of each groove: the starved-corpse read + the value-
     contrast zone the laws require. Seated on the barrel SURFACE (not the spine center). ---------- */
  {
    const z0=T[1].z+0.03, z1=T[3].z-0.02;
    const ribCount=5;
    for(let i=0;i<ribCount;i++){
      const t=i/(ribCount-1), cz=z0+(z1-z0)*t;
      const top=backTopAt(cz)-0.02, bot=(backTopAt(cz)+bellyAt(cz))/2 + 0.06;
      const hw=0.155 - 0.01*Math.abs(t-0.5);
      // a dark groove: two thin quads either side of a pale ridge line, wrapping the barrel front.
      // CRITIC PASS r3 ROOT CAUSE: this quad's point order (a,b,c,d) produces a normal facing -z
      // (measured via cross(b-a,c-a)) — BACKWARD, away from the camera/key-light's +z component —
      // so it was backface-culled the whole time, not merely dim. Reversed the perimeter winding
      // (a,d,c,b) to flip the normal to +z-facing.
      const a=V(-hw*0.85, top, cz-0.012), b=V(hw*0.85, top, cz-0.012);
      const c=V(hw*0.70, bot, cz+0.010), d=V(-hw*0.70, bot, cz+0.010);
      quad(a,d,c,b,P.saddleDk,0.04);
      // pale rib-edge highlight riding the top of the groove — same winding fix + widened/raised
      // (r2 self-correction only changed size/color, not the culled winding — didn't fix it).
      const ea=V(-hw*0.82, top+0.050, cz-0.006), eb=V(hw*0.82, top+0.050, cz-0.006);
      const ec=V(hw*0.68, top-0.010, cz+0.016), ed=V(-hw*0.68, top-0.010, cz+0.016);
      quad(ea,ed,ec,eb,P.rib,0.06);
    }
  }

  /* ---------- ROT MOTTLING (signature #6) — a few bald/dark patches on the coat, cheap value
     variety, seated on the rump/shoulder surfaces. ---------- */
  {
    const patches=[
      {z:T[0].z-0.02, side:1, w:0.055}, {z:T[2].z+0.05, side:-1, w:0.045},
      {z:T[4].z-0.04, side:1, w:0.040},
    ];
    for(const p of patches){
      const top=backTopAt(p.z), hw = p.side*0.10;
      const a=V(hw-0.03,top-0.03,p.z-p.w), b=V(hw+0.03,top-0.02,p.z-p.w*0.3);
      const c=V(hw+0.01,top-0.06,p.z+p.w), d=V(hw-0.05,top-0.07,p.z+p.w*0.2);
      quad(a,b,c,d,P.rot,0.05);
    }
  }

  /* deep-chest keel hint + pale belly under the barrel (kept subtle — this is a hollow chest, not
     a proud one) */
  {
    quad(V(-0.08,H*0.36,0.08), V(0.08,H*0.36,0.08), V(0.06,H*0.32,0.30), V(-0.06,H*0.32,0.30), P.belly, 0.05);
  }

  /* ---------- TWO NECKS / TWO HEADS (signature #1 — the SRD identity). Both necks run forward off
     the shoulder station, top edge riding the back line, but split to different angles: LEFT neck
     drops low + forward (sniffing), RIGHT neck rises high + out (snarling). Shared headBuild() so
     the tri cost of authoring two heads stays cheap. ---------- */
  /* SECONDPASS FIX (batch-review flag): the fork read one-headed at sheet distance — necks forked
     from nearly the same point (0.09u apart) and the raised head barely cleared the back topline
     (0.037u), so it blended into the shoulder mass instead of reading as a second head. Widened
     the fork base, dropped the low head further down-forward, and pushed the raised head much
     higher + pulled back toward the shoulders (clear silhouette separation, not stacked forward). */
  const shoulderBackTop = T.at(-1).backTop, neckR = 0.095;
  const neckBaseL = V(-0.085, shoulderBackTop-neckR, T.at(-1).z);
  const neckBaseR = V( 0.085, shoulderBackTop-neckR, T.at(-1).z);
  const headLowBase  = V(-0.16, H*0.40, 0.58);     // low head — down and forward, ground-sniffing
  // SECONDPASS FIX v2: the bbox-autofit camera zooms OUT to fit any height gain, erasing it —
  // so lean on SIDEWAYS projection instead (clears the torso's own half-width, 0.155, by 2x),
  // twisting the second head out past the body's own silhouette rather than stacking on top of it.
  const headHighBase = V( 0.34, H*0.98, 0.32);     // raised head — twisted OUT to the side, snarling past the shoulder

  tube(neckBaseL, headLowBase,  neckR, neckR*0.62, N, P.ruff, {phase:Math.PI/N});
  tube(neckBaseR, headHighBase, neckR, neckR*0.62, N, P.ruff, {phase:Math.PI/N});

  /* Per-head builder: author bands as explicit points along a straight axis using tube()+ring()
     directly (avoids axis-degeneracy for the near-vertical raised head). */
  function headOn(base, axis, snarlUp){
    const fwd = axis.clone().normalize();
    const n=8, ph=Math.PI/n;
    const p=(t)=>base.clone().addScaledVector(fwd,t);
    // SECONDPASS FIX: the raised (snarling) head uses the lighter coatHi/coatHiDk skull-band
    // tones — a standalone material bright-zone so it separates from the darker saddle mass
    // behind it even when a thin glint quad is grazing-angle to the key light.
    const skC = snarlUp ? P.coatHi   : P.coat;
    const skD = snarlUp ? P.coatHiDk : P.coatDk;
    const bands=[
      {t:0.00, rx:0.086, rz:0.082, hex:skC},
      {t:0.11, rx:0.072, rz:0.066, hex:skC},
      {t:0.24, rx:0.048, rz:0.042, hex:skD},
      {t:0.34, rx:0.030, rz:0.026, hex:skD},
    ];
    const rs=bands.map(b=>ring(p(b.t), fwd, b.rx, b.rz, n, ph));
    stitch(rs, b=>bands[b].hex);

    // MOUTH — a jaw pair projecting off the last band, upper/lower parted, teeth, tongue.
    const jawC = p(0.30);
    const jUp = V(0,1,0), jSide = new THREE.Vector3().crossVectors(fwd,jUp).normalize();
    const jVert = jSide.lengthSq()<0.001 ? V(1,0,0) : new THREE.Vector3().crossVectors(jSide,fwd).normalize();
    const upOff = snarlUp?0.052:0.040, lowOff = snarlUp?0.062:0.046;
    const uB = jawC.clone().addScaledVector(jVert, upOff);
    const uT = jawC.clone().addScaledVector(fwd,0.16).addScaledVector(jVert, upOff*0.55);
    const lB = jawC.clone().addScaledVector(jVert, -lowOff);
    const lT = jawC.clone().addScaledVector(fwd,0.15).addScaledVector(jVert, -lowOff*0.75);
    tube(uB, uT, 0.052, 0.026, n, P.muzzle, {capB:{hex:P.nose, lift:0.006}});
    tube(lB, lT, 0.044, 0.020, n, P.muzzleLt, {capB:{hex:P.muzzleLt, lift:0.005}});
    // dark maw gap between upper/lower jaw
    const mA=uB.clone().addScaledVector(fwd,0.03).addScaledVector(jVert,-0.01);
    const mB=mA.clone().add(jSide.clone().multiplyScalar(0.03));
    const mC=lB.clone().addScaledVector(fwd,0.10).addScaledVector(jVert,0.01).add(jSide.clone().multiplyScalar(0.02));
    const mD=lB.clone().addScaledVector(fwd,0.10).addScaledVector(jVert,0.01).add(jSide.clone().multiplyScalar(-0.02));
    quad(mA.clone().sub(jSide.clone().multiplyScalar(0.03)), mB, mC, mD, P.maw, 0.02);
    // fangs — a small pair off the upper jaw, catching the light
    for(const s of [-1,1]){
      const fb = uB.clone().addScaledVector(fwd,0.045).add(jSide.clone().multiplyScalar(s*0.03));
      const ft = fb.clone().addScaledVector(jVert,-0.045).addScaledVector(fwd,0.01);
      quad(fb.clone().add(jSide.clone().multiplyScalar(s*0.012)), fb.clone().sub(jSide.clone().multiplyScalar(s*0.012)), ft, ft, P.tooth, 0.02);
    }
    // SECONDPASS FIX (batch-review flag): a pale bone-exposed patch riding the top of the snout
    // bridge — EACH head gets its own >=140-RGB high-value zone (law 3), thematically the same
    // starved-corpse bone-showing-through read as the rib band. Same literal-offset diamond shape
    // as the proven eye-glint quad below (renders correctly front-facing on both the down-pitched
    // and up-pitched head without a fwd-dependent winding risk).
    {
      const snoutC = jawC.clone().addScaledVector(fwd, 0.11).addScaledVector(jVert, upOff*0.65);
      const sg = 0.042;
      quad(snoutC.clone().add(V(0,sg,0.006)), snoutC.clone().add(V(-sg*0.85,0,0.012)),
           snoutC.clone().add(V(0,-sg,0.006)), snoutC.clone().add(V(sg*0.85,0,0.012)), P.rib, 0.05);
    }
    // dull red dead-eye glints — CRITIC PASS r3 ROOT CAUSE: the original (top,right,bottom,left)
    // point order also produced a -z (backward) normal — backface-culled, not merely undersized.
    // Enlarged past the 0.04u floor, pushed proud along fwd to avoid self-occlusion against the
    // skull, AND reversed winding to (top,left,bottom,right) so the normal faces +z (camera/light).
    const eyeC = p(0.06).addScaledVector(jVert, 0.028);
    for(const s of [-1,1]){
      const ec = eyeC.clone().add(jSide.clone().multiplyScalar(s*0.055)).addScaledVector(fwd, 0.012);
      const gr = 0.030;
      quad(ec.clone().add(V(0,gr,0)), ec.clone().add(V(-gr,0,0.006)), ec.clone().add(V(0,-gr,0)), ec.clone().add(V(gr,0,0.006)), P.eye, 0.03);
    }
    // ears — small, tattered, seated off the crown (band0 surface)
    const crown = p(-0.02).addScaledVector(jVert, bands[0].rz-0.008);
    for(const s of [-1,1]){
      const eBase = crown.clone().add(jSide.clone().multiplyScalar(s*0.05));
      const eTip = eBase.clone().addScaledVector(jVert,0.075).addScaledVector(fwd,-0.03).add(jSide.clone().multiplyScalar(s*0.015));
      tube(eBase, eTip, 0.036, 0.008, 6, P.ear, {capB:{hex:P.ear, lift:0.005}});
    }
  }

  // SECONDPASS FIX: amplified pitch divergence (steeper down / steeper up) so the two muzzles
  // point clearly different directions, reinforcing the height/angle split from the new bases.
  headOn(headLowBase,  V(-0.36, -0.55, 0.72), false);   // low head — pitched down-forward, jaws mostly closed
  headOn(headHighBase, V( 0.62,  0.38, 0.50), true);     // raised head — twisted hard sideways+up, snarling out past the shoulder

  /* ---------- LEGS — starved digitigrade Z-zigzag hind, thinner than a live wolf; near-straight
     front. A creeping-advance stagger: front legs reach forward unevenly, hind legs coiled tight
     under the sunk haunch, driving the low stalking pose. ---------- */
  {
    const seg=8, hipX=0.115, footXh=0.130, shX=0.120, hindZ=-0.40, frontZ=0.22;
    const hindLeg=(sx, stagger)=>{
      const hip    = V(sx*hipX, H*0.86, hindZ+0.03);
      const stifle = V(sx*hipX, H*0.48, hindZ+0.10);
      const hock   = V(sx*footXh, H*0.30, hindZ-0.06);
      const paw    = V(sx*footXh, 0.05, hindZ+0.01+stagger);
      tube(hip, stifle, 0.078, 0.050, seg, P.coat);
      tube(stifle, hock, 0.046, 0.032, seg, P.coatDk);
      tube(hock, paw, 0.032, 0.022, seg, P.sock, {capB:{hex:P.sock, lift:0.005}});
      footToes(paw);
    };
    const frontLeg=(sx, stagger)=>{
      const sh     = V(sx*shX, H*0.84, frontZ);
      const elbow  = V(sx*shX, H*0.46, frontZ-0.02+stagger*0.4);
      const carpus = V(sx*shX, H*0.18, frontZ+0.01+stagger*0.7);
      const paw    = V(sx*shX, 0.05, frontZ+0.16+stagger);
      tube(sh, elbow, 0.062, 0.042, seg, P.coat);
      tube(elbow, carpus, 0.042, 0.030, seg, P.coatDk);
      tube(carpus, paw, 0.030, 0.020, seg, P.sock, {capB:{hex:P.sock, lift:0.005}});
      footToes(paw);
    };
    function footToes(paw){
      for(const cx of [-0.017,-0.006,0.006,0.017]){
        quad(V(paw.x+cx-0.004,paw.y-0.018,paw.z+0.022), V(paw.x+cx+0.004,paw.y-0.018,paw.z+0.022),
             V(paw.x+cx+0.003,paw.y-0.036,paw.z+0.042), V(paw.x+cx-0.003,paw.y-0.036,paw.z+0.042), P.claw, 0.0);
      }
    }
    // FRONT: creeping-advance stagger — right leg reaching further forward, left trailing (mid-step)
    frontLeg(-1, 0.02); frontLeg(1, 0.11);
    // HIND: coiled tight under the sunk rump, driving the low stalk
    hindLeg(-1, 0.02); hindLeg(1, -0.02);
  }

  /* ---------- TAIL — short, low, dragging (a dead thing's tail, not a proud wolf-flag) ---------- */
  {
    const rumpBackTop = T[0].backTop;
    const root = V(0.01, rumpBackTop-0.05, -0.50);
    const b1   = V(0.03, rumpBackTop-0.16, -0.60);
    const tip  = V(0.05, rumpBackTop-0.24, -0.68);
    tube(root, b1, 0.058, 0.038, N, P.coatDk, {phase:Math.PI/N, capA:{hex:P.coatDk}});
    tube(b1,   tip,0.038, 0.014, N, P.saddleDk,{phase:Math.PI/N, capB:{hex:P.saddleDk, lift:0.006}});
  }

  /* ---------- base disc (Medium: r=0.42, humanoid pattern) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
