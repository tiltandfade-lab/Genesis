/* dev/model-qa/creatures/rlm-seas-sea-hag.js — the SEA HAG (realm high-seas, Fey, CR 4, Medium),
   authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry pilot, seas-w2
   cell 0). Realm-bestiary entry "a Sea Hag of the Shoals" (frame/model "sea-hag"): "she trades
   storms for secrets and secrets for storms... she crouches at the reef line surrounded by small
   offerings left by sailors hoping she'll look away." Core identity: THE DROWNED CRONE — the third
   hag in the coven trio (night hag = iron crone hunched over a bargain, green hag = wiry crone
   arched back mid-curse, sea hag = the bloated-gaunt DROWNED crone singing a lure song off a rock).
   Must read distinct from both gloom hags at a squint: no robe (bare barnacled hide instead of
   cloth), hair streams SIDEWAYS not up/back (an underwater current, not a windswept snap), and the
   open singing mouth (not a cackle or an offer) is the loud read. HUMANOID family, bespoke bipedal
   per ANATOMY-CANON (HUMANOID = the PC-kit grammar, noted-for-completeness stub — built here as a
   bespoke rig following the hag-family cross-file conventions: hunch xform, ring-stack torso,
   3-segment claw hands, per-strand hair tubes).

   FEATURE CHECKLIST (the ~1.3-1.8k budget buys):
     1. Bloated-gaunt HUMANOID torso — a waterlogged crone build (distended belly/ribs vs the night
        hag's scrawny hunch and the green hag's wiry arch), leaning forward off a rock mass at the
        hips rather than robed and upright — bare barnacled hide is the garb, not cloth.
     2. SIGNATURE — the kelp-hair curtain streaming SIDEWAYS: long ribbon-like strands all swept to
        one side as if caught in a current (not up/back like the green hag's snap-back sheet), the
        silhouette-breaking read that has to survive the squint test (law 2).
     3. Pale drowned face + fish-belly throat — the model's dedicated high-value zone (law 3): a
        bloodless pale-green face and a pale fish-belly throat/chest patch against dark barnacled
        skin, carrying the light where the singing mouth and throat are.
     4. The open singing mouth, jaw wide mid-note — a gaping dark maw with a few peg teeth, the pose
        law 5 tell: this is a hag mid-song, not at rest.
     5. BOTH arms raised and spread, conducting her own song — mirrored gesture (unlike the night
        hag's one-offer/one-clutch asymmetry), fingers spread wide, webbed/clawed hands.
     6. Barnacle clusters + a rock mass at the base — small raised nubs across the shoulders/back/
        thigh (the "barnacled skin" checklist beat) and a jagged rock outcrop she leans off, replacing
        the base disc's usual flat read with a reef-line silhouette.

   POSE SENTENCE: leaning forward off a rock mass at the hips, both arms raised and spread wide
   conducting her own harmony, head tilted back and to one side, jaw dropped wide mid-note, kelp
   hair streaming sideways as if still underwater — the luring song, never at rest.

   Whole-object grammar per rlm-gloom-night-hag.js / rlm-gloom-green-hag.js conventions: one
   function, one geometry frame, no anchors. Spine +z (front), up +y, ground y=0, base disc r=0.42
   (Medium). Imported by ps1-sheet.html (SETS['seas-w2'], cell 0). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob, setChannels } from '../probe-lib.js';

export function buildSeaHag(){
  /* ---------- PALETTE (VS desaturated; dark barnacled hide, pale drowned face/throat as the ONE
     lit zone, dark kelp hair, warm-dark rock mass — law 3's high-value zone is the pale
     face/throat, kept well clear of the ~0x0a0908 void). ---------- */
  const P = {
    // CRITIC PASS 2 (fresh-context): measured render pixels came in far darker than raw hex
    // (~0.55-0.6x under the PS1 shader falloff) — the pale zone topped out at 130 avg RGB
    // (never cleared the 140 floor) and the legs/kelp were within ~20 RGB of the void and
    // vanished entirely. Lifted the whole palette so the shaded result clears the floors.
    skin:0x748c82, skinDk:0x56685f, skinLt:0x8ea095,          // dark barnacled sea-crone hide, lifted off void
    pale:0xd0e4d8, paleLt:0xf0faf2, paleDk:0xacc0b4,          // SIGNATURE zone — drowned face + fish-belly throat, near-white
    socket:0x1c2420,                                          // dark carved eye hollows (kept dark — reads against the now-bright pale)
    barn:0x8c8578, barnDk:0x5c574a,                            // barnacle clusters
    nail:0x3a4038, nailLt:0x525a4e,                            // dark webbed claws
    kelp:0x4a6656, kelpDk:0x35493c, kelpLt:0x6e9280,          // kelp-hair, lifted off void so strands don't dissolve
    teeth:0xc4bfa0,
    rock:0x4a453c, rockDk:0x322e28, rockLt:0x615a4c,          // rock mass she leans off
    disc:0x362f24, discTop:0x443c2c,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin',
    [P.pale]:'skin', [P.paleLt]:'skin', [P.paleDk]:'skin', [P.socket]:'skin',
    [P.barn]:'stone', [P.barnDk]:'stone',
    [P.nail]:'bone', [P.nailLt]:'bone', [P.teeth]:'bone',
    [P.kelp]:'fur', [P.kelpDk]:'fur', [P.kelpLt]:'fur',
    [P.rock]:'stone', [P.rockDk]:'stone', [P.rockLt]:'stone',
  });

  /* ---------- LANDMARKS — bloated-gaunt crone frame, forward lean off the rock at the hips. ---------- */
  const L = {
    hipY:0.66, waistY:0.80, ribY:0.95, chestY:1.08, shldY:1.14, neckY:1.18,
    hipHalf:0.135, shoulderX:0.195,
    jawY:1.20, cheekY:1.265, browY:1.325, crownY:1.40,
  };
  /* forward hip-hunch off the rock — less pitched than the night hag (leaning OFF a surface, not
     folded over a bargain), head tilts back+side separately below. */
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.34);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- ROCK MASS — jagged outcrop she leans off, replacing the flat base read with a
     reef-line silhouette (checklist item 6). ---------- */
  {
    const rings=[
      ring(V(0.02, 0.03, 0.10), V(0,1,0), 0.30, 0.26, 7, 0.2),
      ring(V(0.0, 0.20, 0.06), V(0,1,0), 0.22, 0.19, 7, 0.2),
      ring(V(-0.02, 0.34, 0.02), V(0,1,0), 0.13, 0.11, 7, 0.2),
    ];
    stitch(rings, ()=>P.rock);
    capFan(rings[0], V(0.02,0.0,0.10), P.rockDk, true);
    capFan(rings.at(-1), V(-0.02,0.40,0.02), P.rockLt);
    /* a couple of jagged secondary rock spurs breaking the base outline */
    const spur=(cx,cz,h,r)=>{
      const b = ring(V(cx,0.02,cz), V(0,1,0), r, r*0.85, 6, 0.3);
      stitch([b], ()=>P.rockDk);
      capFan(b, V(cx*1.1,h,cz*1.1), P.rock);
    };
    spur(0.24,-0.14,0.20,0.09);
    spur(-0.22,-0.06,0.15,0.07);
  }

  /* ---------- TORSO — bloated-gaunt, bare barnacled hide (no robe), leaning forward off the rock. ---------- */
  const torsoRings = stack([
    {y:L.hipY,   rx:0.150, rz:0.140, hex:P.skinDk},
    {y:L.waistY, rx:0.185, rz:0.180, hex:P.skin},              // distended belly — the "bloated" tell
    {y:L.ribY,   rx:0.168, rz:0.155, hex:P.skinLt},            // ribs show through above the bloat
    {y:L.chestY, rx:0.152, rz:0.140, hex:P.pale},              // fish-belly throat/chest patch begins — SIGNATURE zone
    {y:L.shldY,  rx:0.150, rz:0.138, hex:P.skin},
    {y:L.neckY,  rx:0.070, rz:0.066, hex:P.paleLt},            // pale throat carries up into the neck
  ], 8, {xform:hunch, capTop:{hex:P.paleLt, lift:0.006}});

  /* BARNACLE CLUSTERS — small raised nubs across shoulders/back/thigh (checklist item 6). */
  for(const [x,y,z] of [[0.11,L.shldY-0.02,-0.09],[-0.10,L.ribY,-0.11],[0.07,L.waistY-0.03,-0.14],
                          [-0.06,L.chestY+0.01,-0.10],[0.14,L.hipY+0.05,-0.06],[-0.13,L.shldY-0.05,0.02]]){
    const c = hunch(V(x,y,z));
    const tip = c.clone().add(V(0,0.012,-0.006));
    tube(c, tip, 0.016, 0.005, 4, (x>0)?P.barn:P.barnDk);
  }

  /* ---------- HEAD — pale drowned face, dark eye hollows, jaw dropped wide mid-note. Tilted BACK
     and to one SIDE (the "head tilted, jaw wide mid-note" pose beat), built as its own local xform
     stacked on the hunch so the tilt reads distinct from the torso lean. ---------- */
  const tilt = (p)=>{
    const q = p.clone().sub(V(0, L.neckY, 0));
    // CRITIC PASS 2: -0.30 tilted the face/maw plane up and away from the camera, so the
    // signature "open singing mouth" beat was invisible in the render — eased to -0.14 (still
    // reads as tilted-back-mid-note, but the maw stays camera-facing enough to register).
    q.applyAxisAngle(V(1,0,0), -0.14);   // tilt back
    q.applyAxisAngle(V(0,0,1),  0.18);   // tilt to one side
    return hunch(q.add(V(0, L.neckY, 0)));
  };
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.092, rz:0.094, hex:P.pale},
      {y:L.cheekY, rx:0.104, rz:0.096, hex:P.paleLt},
      {y:L.browY,  rx:0.100, rz:0.084, hex:P.pale},
      {y:L.crownY, rx:0.070, rz:0.062, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(tilt));
    /* sunken hollow cheeks — the gaunt half of "bloated-gaunt" */
    for(const i of [0,3,4,7]) rings[1][i].y -= 0.008;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.08);
      }
    }
    capFan(rings.at(-1), tilt(V(0, L.crownY+0.05, -0.01)), P.skinDk);

    /* DARK EYE HOLLOWS — recessed dark quads, no eye geometry.
       CRITIC PASS 2 (r2 fix): the head-band shell's own front extent at browY is ~0.01+0.084=0.094
       local z — the sockets were sitting at z=0.082, i.e. BEHIND the shell surface, so they were
       fully occluded and never rendered (the exact bug class documented as the R4 fix in
       rlm-gloom-green-hag.js: geometry recessed behind its own parent shell reads as nothing).
       Pushed to z=0.108, clear of the shell front, so they actually carve into visible skin. */
    for(const s of [-1,1]){
      const c = tilt(V(s*0.042, L.browY-0.018, 0.108));
      /* CRITIC PASS 2: winding reversed (D,C,B,A instead of A,B,C,D) — the original vertex order
         produced a normal pointing -z (away from the +x/+z dimetric camera), so the whole quad
         was backface-culled (FrontSide material, no `side:DoubleSide` set anywhere in ps1-sheet.html) —
         invisible no matter how far it was pushed forward. */
      quad(c.clone().add(V(-0.014,-0.014,-0.006)), c.clone().add(V(0.014,-0.014,-0.006)),
           c.clone().add(V(0.018,0.010,0)), c.clone().add(V(-0.018,0.010,0)), P.socket, 0.02);
    }

    /* OPEN SINGING MOUTH — jaw dropped wide, a deep dark maw with a few peg teeth (checklist item 4,
       the pose's high-expression tell — mid-note, not shut).
       CRITIC PASS 2 (r2 fix): same occlusion bug — the jaw band's front extent is ~0.01+0.094=0.104
       local z and the maw sat at z=0.088 (behind it), fully hidden inside the solid face shell.
       Pushed to z=0.120 so the dark cavity clears the shell and actually reads as an open mouth. */
    {
      const mc = tilt(V(0, L.jawY-0.028, 0.120));
      /* deep open maw — a recessed dark cavity, taller than the hag-sisters' sunken mouth line.
         CRITIC PASS 2: winding reversed (same backface-culling bug as the eye sockets above —
         the original A,B,C,D order pointed -z, away from the dimetric camera). */
      quad(mc.clone().add(V(-0.026,-0.038,-0.012)), mc.clone().add(V(0.026,-0.038,-0.012)),
           mc.clone().add(V(0.038,0.024,0)), mc.clone().add(V(-0.038,0.024,0)), P.socket, 0.03);
      /* jaw wedge dropped open, pale-lipped rim carrying the value zone around the dark maw
         (winding reversed to match, same bug). */
      const jl = tilt(V(-0.040,L.jawY-0.010,0.114)), jr = tilt(V(0.040,L.jawY-0.010,0.114));
      const jb = tilt(V(0.0, L.jawY-0.052, 0.100));
      quad(jb.clone().add(V(-0.03,0,0)), jb.clone().add(V(0.03,0,0)), jr, jl, P.paleLt, 0.04);
      for(const s of [-1,-0.4,0.4,1]){
        const tb = mc.clone().add(V(s*0.020,0.020,0.006));
        const tt = tb.clone().add(V(s*0.004,-0.026,0.008));
        tube(tb, tt, 0.008, 0.002, 3, P.teeth);
      }
    }

    /* small barnacle nub on the temple — carries the barnacled-skin motif onto the face itself */
    {
      const c = tilt(V(0.070,L.browY+0.01,0.048));
      tube(c, c.clone().add(V(0.010,0.010,-0.004)), 0.013, 0.004, 4, P.barn);
    }
  }

  /* ---------- SIGNATURE — KELP-HAIR CURTAIN streaming SIDEWAYS, as if underwater. Long ribbon
     strands all swept to the SAME side (+x), unlike the night hag's multi-directional wild hair or
     the green hag's straight-back sheet — the read that must survive the squint test. ---------- */
  /* CRITIC PASS 2: original 8-strand fan tangled visually with the raised arms and the tip taper
     (0.004 radius = 0.008u diameter) fell well under the 0.04u minimum-feature floor, so most of
     the curtain dissolved into disconnected noise instead of reading as a sideways sweep. Cut to
     6 strands, rooted lower/behind the head (clear of the arm silhouettes), radii floored at
     0.010 (0.02u dia) so no segment vanishes, and colors lifted off the void above. */
  for(const [ang,len,rise] of [[-1.1,0.36,0.02],[-0.7,0.44,-0.02],[-0.3,0.48,0.03],
                                 [0.35,0.42,0.02],[0.75,0.34,-0.02],[1.15,0.28,0.03]]){
    const root = tilt(V(Math.sin(ang)*0.06, L.crownY-0.03, Math.cos(ang)*0.05 - 0.05));
    /* strands sweep sideways (+x dominant) with only mild vertical drop — the "sideways current" tell */
    const mid  = root.clone().add(V(len*0.62, rise*len, Math.sin(ang)*0.05));
    const tip  = mid.clone().add(V(len*0.58, -0.05 + rise*len*0.4, Math.sin(ang)*0.08 - 0.03));
    tube(root, mid, 0.022, 0.015, 3, (ang%1<0.4)?P.kelp:P.kelpDk);
    tube(mid, tip, 0.015, 0.010, 3, P.kelpLt, {capB:{hex:P.kelpDk, lift:0.004}});
  }

  /* ---------- ARMS — BOTH raised and spread wide, conducting the song (mirrored gesture, unlike
     the night-hag asymmetric offer/clutch). Webbed clawed hands, fingers spread. ---------- */
  const longFinger = (base, dir, len, hex)=>{
    const d = dir.clone().normalize();
    const p1 = base.clone().addScaledVector(d, len*0.40);
    const p2 = base.clone().addScaledVector(d, len*0.74);
    const p3 = base.clone().addScaledVector(d, len);
    tube(base, p1, 0.012, 0.009, 4, hex);
    tube(p1, p2, 0.009, 0.006, 4, hex);
    tube(p2, p3, 0.006, 0.002, 4, P.nail, {capB:{hex:P.nailLt, lift:0.003}});
  };
  const spreadHand = (wrist, dir, hex)=>{
    const d = dir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(wrist.clone().addScaledVector(d,-0.02), wrist.clone().addScaledVector(d,0.022),
         0.032, 0.026, 5, hex, {capA:{hex}, capB:{hex}});
    for(const off of [-1,-0.35,0.35,1]){
      const knuckle = wrist.clone().addScaledVector(d,0.020).addScaledVector(side, off*0.026);
      const fdir = d.clone().addScaledVector(side, off*0.20).add(V(0,0.06,0));
      longFinger(knuckle, fdir, 0.105, hex);
    }
  };
  {
    /* leading RIGHT arm — raised WELL ABOVE the head and out, conducting (wrist clears crownY
       1.40 by a wide margin so the silhouette reads "raised", not "reaching sideways" — the r1
       self-correction: the first pass kept the wrist near shoulder height and vanished into the
       torso silhouette). */
    const S1 = hunch(V(L.shoulderX, L.shldY-0.01, 0.02));
    const E1 = V(0.300, 1.30, 0.10);
    const W1 = V(0.320, 1.58, 0.06);
    tube(S1, E1, 0.050, 0.038, 5, P.skin);
    tube(E1, W1, 0.038, 0.026, 5, P.skinLt);
    spreadHand(W1, V(0.35,0.85,0.20), P.skin);

    /* mirrored LEFT arm — raised well above the head the other side, conducting */
    const S2 = hunch(V(-L.shoulderX, L.shldY-0.01, 0.02));
    const E2 = V(-0.290, 1.28, 0.12);
    const W2 = V(-0.310, 1.56, 0.08);
    tube(S2, E2, 0.050, 0.038, 5, P.skin);
    tube(E2, W2, 0.038, 0.026, 5, P.skinLt);
    spreadHand(W2, V(-0.35,0.85,0.20), P.skin);
  }

  /* ---------- LEGS — bare, thin, mostly braced against the rock; feet planted low on the rock
     mass rather than a flat base disc (reinforces the "leaning off the rock" pose). ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.02), kneeL=V(-0.165,0.36,0.10), ankL=V(-0.155,0.10,0.14);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.01), kneeR=V( 0.160,0.38,0.06), ankR=V( 0.150,0.11,0.10);
    tube(hipL,kneeL,0.070,0.048,6,P.skinDk);
    tube(kneeL,ankL,0.040,0.026,6,P.skin);
    tube(hipR,kneeR,0.070,0.048,6,P.skinDk);
    tube(kneeR,ankR,0.040,0.026,6,P.skin);
    for(const [ank, toeZ] of [[ankL,0.10],[ankR,0.06]]){
      const heel=V(ank.x,ank.y-0.05,ank.z-0.02);
      const toe=V(ank.x, ank.y-0.06, ank.z+toeZ);
      tube(heel, toe, 0.028,0.018,5,P.skin,{capA:{hex:P.skinDk}});
      for(const off of [-1,0,1]){
        const tb=toe.clone().add(V(off*0.016,0,0));
        const tt=tb.clone().add(V(off*0.005,-0.005,0.020));
        tube(tb, tt, 0.007,0.002,3,P.skin,{capB:{hex:P.nail, lift:0.003}});
      }
    }
  }

  /* ---------- base disc (Medium: r=0.42) — under/around the rock mass, low profile. ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.030,0), V(0,1,0), 0.41, 0.41, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.032,0), P.discTop);
  }
}
