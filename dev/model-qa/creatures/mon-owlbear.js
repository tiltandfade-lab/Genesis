/* dev/model-qa/creatures/mon-owlbear.js — THE OWLBEAR (whole-object grammar), FOUNDRY REBUILD
   (docs/MODEL-FOUNDRY.md, 2026-07-08, set rebuild-w2 cell 4). Large, CR 3, realm core, 31
   instances — the iconic hybrid, flagged by MODEL-LANE-TRIAGE as the hard organic case for the
   JS lane. HYBRID QUADRUPED per ANATOMY-CANON: bear mass (heavy shoulder hump, plantigrade rear
   legs) topped by an OWL head (huge pale facial-disc eyes + hooked beak). Palette intent kept
   from the prior build (brown bear coat, grey-buff owl disc, amber eyes) — geometry replaced.

   PASS-2 CRITIC (R2, fresh context): silhouette/essence/pose read (torso+head+one arm strong,
   owl face identifiable, amber eyes carry the value-contrast law). Found law-3 violations —
   foreclaw fingertips (0.006), hind-claw tips (0.008), and the far ear-tuft tip (0.007/rbz 0.005)
   were all under the ~0.04u minimum-feature floor and dissolved into the void on the capture's
   shadowed side (classic thin-element vanish, same failure class as the Creeper). Thickened all
   three + lightened P.claw off near-black. No silhouette-shape change, so one critic round stands.

   FEATURE CHECKLIST (the ~1,000-2,000 budget buys):
     1. HEAVY BEAR TRUNK + SHOULDER HUMP — a barrel torso lofted hip->neck, mass brought down and
        forward, capped by a bulged fur-hump cresting above and behind the shoulders (the
        grizzly-hump read that sells "bear," per ANATOMY-CANON's plantigrade-mass note).
     2. OWL HEAD SIGNATURE — the loud exaggerated feature: a broad flat facial disc carrying TWO
        HUGE forward amber eye-discs (the high-value zone law 3 needs), plus ear tufts. The beak
        is rebuilt OPEN — upper and lower mandible parted around a dark throat gap — mid-screech.
     3. SPREAD FORECLAWS — both forelimbs thrown WIDE to the sides (not a raised swipe), paws
        open, five long dark claws fanned per paw — the threat-display silhouette break.
     4. FEATHER RUFF — a collar of scalloped feather plates ringing the neck/shoulder seam,
        transitioning to fur below (the owl-to-bear seam law 4 needs stated, not blurred).
     5. PLANTIGRADE HIND LEGS — thick bent haunch->shank->flat clawed hind paw bearing the reared
        weight (ANATOMY-CANON plantigrade rear stance, not a digitigrade point-foot).
     6. Shaggy fur overlay — lumpy proud-fur bands breaking the trunk's smooth silhouette so the
        coat reads furred, not a bald cylinder.

   POSE SENTENCE: reared up to its full height on its hind legs, both fore-claws thrown wide to
   the sides in a threat display, head thrown back with its beak cracked open mid-screech — the
   owlbear's ambush roar, never a standing-at-attention idle.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Large size: base disc r=0.55. Imported by ps1-sheet.html (SETS['rebuild-w2'],
   cell 4, fn buildOwlbear) + the p2mon WHOLE_OBJECT_REGISTRY. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildOwlbear(){
  /* ---------- PALETTE (VS desaturated; brown bear fur, grey-buff owl facial disc — intent kept
     from the prior build) ---------- */
  const P = {
    fur:0x6f5a3d, furDk:0x463726, furLt:0x8a7250, furGrey:0x5c4f3c,   // brown bear coat, wide value spread
    belly:0x847053, chest:0x9a8763,                                    // paler chest feather bib
    disc:0xa89f88, discDk:0x7c7460, discLt:0xc4bca4,                   // grey-buff owl facial disc
    plume:0x8f8368, plumeDk:0x655c48,                                  // the framing feather ring
    beak:0x2a2622, beakLt:0x453e34, throat:0x150f0c,                   // beak + dark open-mouth gap
    eyeRim:0x14100c, eye:0x161210, iris:0xd8a838, irisLt:0xf0cc60,     // huge forward amber owl eyes
    tuft:0x554836,                                                      // ear tufts (feather horns)
    claw:0x362c20, palm:0x5a4a36,                                      // long dark foreclaws (R2: lightened off near-black so tips hold value against the void)
    disc0:0x4a4038, discTop:0x585047,                                  // BASE disc (the miniature stand)
  };

  /* ---------- LANDMARKS — Large-scale bear frame (~1.15x the prior Medium build). Hind legs
     plant on the disc, the trunk is thick and barrel-heavy, mass down and forward. The shoulder
     band sits high and wide; a dedicated hump mass rides above it, behind the neck. ---------- */
  const L = {
    hipY:0.68, waistY:0.92, ribY:1.17, chestY:1.40, shldY:1.58, neckY:1.68,
    hipHalf:0.235, shoulderX:0.460,
    beakY:1.74, discCtrY:1.84, browY:1.96, crownY:2.08,                // owl head landmarks
    humpY:1.82,                                                        // shoulder-hump peak
  };

  /* slight backward recline of the reared upper body about the hips (belly thrusts forward,
     shoulders sit back over the haunches) — the balance a bear strikes when it rears, then the
     HEAD throws back further still for the screech (law 5's high-expression pose). */
  const rear = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), -0.10);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — a HEAVY, WIDE furred bear trunk, one loft, hips->neck. ---------- */
  stack([
    {y:L.hipY,   rx:0.365, rz:0.320, hex:P.furDk},
    {y:L.waistY, rx:0.420, rz:0.355, hex:P.fur},                     // heavy belly
    {y:L.ribY,   rx:0.465, rz:0.375, hex:P.furLt},
    {y:L.chestY, rx:0.500, rz:0.380, hex:P.fur},                     // deep barrel chest
    {y:L.shldY,  rx:0.535, rz:0.375, hex:P.furLt},                   // MASSIVE rolled shoulders
    {y:L.neckY,  rx:0.245, rz:0.228, hex:P.furGrey},                 // thick furred neck stump
  ], 8, {xform:rear, capTop:{hex:P.furGrey, lift:0.006}});

  /* SHOULDER HUMP — bulged dome of muscle+fur cresting ABOVE and behind the shoulders. */
  {
    const domeBands=[
      ring(V(0, L.shldY-0.04, -0.02), V(0,1,0), 0.455, 0.365, 9, Math.PI/9).map(rear),
      ring(V(0, L.shldY+0.09, -0.07), V(0,1,0), 0.400, 0.310, 9, Math.PI/9).map(rear),
      ring(V(0, L.shldY+0.18, -0.10), V(0,1,0), 0.320, 0.240, 9, Math.PI/9).map(rear),
      ring(V(0, L.humpY,      -0.12), V(0,1,0), 0.212, 0.170, 9, Math.PI/9).map(rear),
    ];
    stitch(domeBands, (b)=> b===0? P.furLt : (b===1? P.fur : P.furGrey));
    capFan(domeBands.at(-1), rear(V(0, L.humpY+0.12, -0.13)), P.furDk);
    for(const s of [-1,1]){
      const base = rear(V(s*0.14, L.humpY-0.02, -0.07));
      quad(base, base.clone().add(V(s*0.07,0.11,-0.03)), base.clone().add(V(s*0.11,0.07,-0.06)), base, P.furDk, 0.08);
    }
  }

  /* lumpy fur overlay — bulged partial bands proud of the trunk so the coat reads SHAGGY. */
  for(const [y,rx,rz,cx,hex] of [
    [L.chestY+0.02, 0.265, 0.212, -0.19, P.furDk],
    [L.ribY+0.03,   0.247, 0.212,  0.22, P.furLt],
    [L.waistY+0.02, 0.235, 0.201,  0.17, P.furGrey],
    [L.shldY-0.06,  0.247, 0.212, -0.23, P.fur],
    [L.ribY-0.10,   0.224, 0.196,  0.00, P.furDk],
  ]){
    const rings=[
      ring(V(cx,y-0.08,0.09), V(0,1,0), rx*0.85, rz*0.85, 7, Math.PI/7).map(rear),
      ring(V(cx,y+0.08,0.09), V(0,1,0), rx, rz, 7, Math.PI/7).map(rear),
    ];
    stitch(rings, ()=>hex);
    capFan(rings[1], rear(V(cx,y+0.17,0.09)), hex);
  }

  /* ---------- FEATHER RUFF — a collar of scalloped feather plates ringing the neck/shoulder
     seam, denser at the front/sides, transitioning to fur below. ---------- */
  {
    const ruffY = L.neckY - 0.03, ruffR = 0.270;
    const N = 12;
    for(let k=0;k<N;k++){
      const a = (k/N)*Math.PI*2;
      const front = Math.cos(a) > 0.1;
      const cx = Math.sin(a)*ruffR, cz = Math.cos(a)*ruffR*0.85;
      const drop = front ? 0.185 : 0.115;
      const w = 0.086;
      const nx = Math.sin(a), nz = Math.cos(a);
      const tl = rear(V(cx - nz*w, ruffY+0.03, cz + nx*w));
      const tr = rear(V(cx + nz*w, ruffY+0.03, cz - nx*w));
      const tip= rear(V(cx + nx*0.02, ruffY - drop, cz + nz*0.02));
      const hex = (k%2)? P.plume : P.disc;
      quad(tl, tr, tip, tip, hex, 0.06);
      const tl2 = rear(V(cx*0.8 - nz*w*0.7, ruffY+0.06, cz*0.8 + nx*w*0.7));
      const tr2 = rear(V(cx*0.8 + nz*w*0.7, ruffY+0.06, cz*0.8 - nx*w*0.7));
      const tip2= rear(V(cx*0.85, ruffY - drop*0.6, cz*0.85));
      quad(tl2, tr2, tip2, tip2, (k%2? P.discLt : P.plumeDk), 0.06);
    }
    for(let k=-2;k<=2;k++){
      const cx = k*0.086, zf = 0.345 - Math.abs(k)*0.023, y = L.neckY-0.16, drop=0.16, w=0.080;
      const tl = rear(V(cx-w, y, zf)), tr = rear(V(cx+w, y, zf));
      const br = rear(V(cx+w*0.5, y-drop*0.6, zf-0.02)), bl = rear(V(cx-w*0.5, y-drop*0.6, zf-0.02));
      const tip= rear(V(cx, y-drop, zf-0.01));
      quad(tl, tr, br, bl, (k%2? P.chest: P.disc), 0.05);
      quad(bl, br, tip, tip, (k%2? P.disc: P.belly), 0.05);
    }
  }

  /* ---------- OWL HEAD — the signature. Thrown BACK further than a level gaze (screeching up),
     broad round facial disc, two huge forward amber eyes, ear tufts, and an OPEN hooked beak. ---- */
  {
    const n=10, ph=Math.PI/n;

    /* R1 CRITIC FIX: an extra head-pitch transform here traded the disc's forward-facing +z
       projection for +y (rotating a point that sits above-AND-in-front of the neck pivot only
       ever pushes it one way or the other) — the engine render showed the whole face tucked
       back into the neck/hump mass instead of reading forward. Dropped back to plain `rear`
       (matches the body) so the eyes/disc keep the frontal projection that reads; the "mid-
       screech" beat is carried by the OPEN BEAK geometry below instead of a head-tilt. */
    const screech = rear;

    const bands=[
      {y:L.beakY-0.02, cz:-0.09, rx:0.201, rz:0.172, hex:P.plumeDk},
      {y:L.discCtrY,   cz:-0.10, rx:0.241, rz:0.178, hex:P.plume},
      {y:L.browY,      cz:-0.14, rx:0.213, rz:0.161, hex:P.plume},
      {y:L.crownY-0.03,cz:-0.16, rx:0.150, rz:0.132, hex:P.plumeDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(screech));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), screech(V(0, L.crownY+0.00, -0.18)), P.plumeDk);

    /* ---- THE FACIAL DISC ---- */
    const discC = screech(V(0, L.discCtrY-0.02, 0.16));
    const faceN = new THREE.Vector3(0,0,1).applyAxisAngle(V(1,0,0), -0.06).normalize();
    const up = new THREE.Vector3(0,1,0);
    const uAx = new THREE.Vector3().crossVectors(up, faceN).normalize();
    const vAx = new THREE.Vector3().crossVectors(faceN, uAx).normalize();
    const discPt = (rad, ang, push)=> discC.clone()
        .addScaledVector(uAx, Math.cos(ang)*rad)
        .addScaledVector(vAx, Math.sin(ang)*rad*1.10)
        .addScaledVector(faceN, push);
    const RD = 16;
    const inner=[], mid=[], rim=[];
    for(let i=0;i<RD;i++){
      const a = (i/RD)*Math.PI*2;
      inner.push(discPt(0.086, a, -0.023));
      mid.push(  discPt(0.230, a,  0.023));
      rim.push(  discPt(0.310, a,  0.034));
    }
    const hub = discC.clone().addScaledVector(faceN,-0.052);
    for(let i=0;i<RD;i++){ const i2=(i+1)%RD;
      quad(hub, inner[i], inner[i2], inner[i2], P.discDk, 0.04);
    }
    for(let i=0;i<RD;i++){ const i2=(i+1)%RD;
      quad(inner[i], mid[i], mid[i2], inner[i2], (i%2?P.disc:P.discLt), 0.05);
    }
    for(let i=0;i<RD;i++){ const i2=(i+1)%RD;
      quad(mid[i], rim[i], rim[i2], mid[i2], (i%2?P.plume:P.plumeDk), 0.06);
    }

    /* ---- HUGE FORWARD AMBER EYES — the high-value zone (law 3) ON the signature. ---- */
    for(const s of [-1,1]){
      const ec = discC.clone().addScaledVector(uAx, s*0.101).addScaledVector(vAx, 0.023).addScaledVector(faceN, -0.007);
      const eN = faceN, eU = uAx, eV = vAx;
      const ept = (rad,ang,push)=> ec.clone().addScaledVector(eU,Math.cos(ang)*rad).addScaledVector(eV,Math.sin(ang)*rad).addScaledVector(eN,push);
      const RE=10;
      const rimR=[], irisR=[];
      for(let i=0;i<RE;i++){ const a=(i/RE)*Math.PI*2;
        rimR.push(ept(0.080,a,0.007));
        irisR.push(ept(0.057,a,0.021));
      }
      for(let i=0;i<RE;i++){ const i2=(i+1)%RE; quad(rimR[i],irisR[i],irisR[i2],rimR[i2], P.eyeRim, 0.02); }
      capFan(irisR, ec.clone().addScaledVector(eN,0.034), P.iris);
      const pup = ec.clone().addScaledVector(eN,0.039);
      quad(pup.clone().addScaledVector(eU,-0.018).addScaledVector(eV,-0.018),
           pup.clone().addScaledVector(eU, 0.018).addScaledVector(eV,-0.018),
           pup.clone().addScaledVector(eU, 0.016).addScaledVector(eV, 0.018),
           pup.clone().addScaledVector(eU,-0.016).addScaledVector(eV, 0.018), P.eye, 0.0);
      quad(pup.clone().addScaledVector(eU,-0.007).addScaledVector(eV, 0.002),
           pup.clone().addScaledVector(eU, 0.007).addScaledVector(eV, 0.002),
           pup.clone().addScaledVector(eU, 0.006).addScaledVector(eV, 0.011),
           pup.clone().addScaledVector(eU,-0.006).addScaledVector(eV, 0.011), P.irisLt, 0.0);
    }

    /* ---- OPEN HOOKED BEAK — mid-screech: upper mandible hooks up-and-out, lower mandible drops
       away, a dark throat-gap quad between them carries the "open" read (silhouette break, not
       just a closed wedge). ---- */
    {
      const hingeTop = discC.clone().addScaledVector(vAx, 0.020).addScaledVector(faceN, 0.078);
      const upMid    = discC.clone().addScaledVector(vAx, -0.006).addScaledVector(faceN, 0.178);
      const upTip    = discC.clone().addScaledVector(vAx, 0.032).addScaledVector(faceN, 0.256);    // curls UP+forward — the scream hook, widened off the lower jaw
      tube(hingeTop, upMid, 0.092, 0.062, 6, P.beakLt, {raz:0.072, rbz:0.042});
      tube(upMid, upTip, 0.062, 0.017, 6, P.beak, {raz:0.042, rbz:0.012, capB:{hex:P.beak, lift:0.008}});

      const hingeBot = discC.clone().addScaledVector(vAx, -0.036).addScaledVector(faceN, 0.086);
      const loMid    = discC.clone().addScaledVector(vAx, -0.150).addScaledVector(faceN, 0.132);
      const loTip    = discC.clone().addScaledVector(vAx, -0.232).addScaledVector(faceN, 0.096);   // drops further DOWN — the gap between the mandibles is the open-mouth read
      tube(hingeBot, loMid, 0.066, 0.043, 6, P.beakLt, {raz:0.049, rbz:0.030});
      tube(loMid, loTip, 0.043, 0.013, 6, P.beak, {raz:0.030, rbz:0.009, capB:{hex:P.beak, lift:0.006}});

      /* dark throat gap between the mandibles — the open-mouth value read */
      const gA = hingeTop.clone().addScaledVector(faceN, 0.02);
      const gB = hingeBot.clone().addScaledVector(faceN, 0.02);
      const gC = loMid.clone().addScaledVector(faceN, 0.01);
      const gD = upMid.clone().addScaledVector(faceN, 0.01);
      quad(gA, gD, gC, gB, P.throat, 0.03);
    }

    /* ---- EAR TUFTS ---- */
    for(const s of [-1,1]){
      const base = screech(V(s*0.172, L.browY+0.02, -0.02));
      const tip  = screech(V(s*0.247, L.crownY+0.21, -0.07));
      /* R2 CRITIC FIX: tip 0.007/rbz 0.005 was under the 0.04u floor — the far-side tuft nearly
         vanished in the capture. Thickened slightly; still a fine feather-spike, not a shaft. */
      tube(base, tip, 0.067, 0.016, 5, P.tuft, {raz:0.039, rbz:0.012, capB:{hex:P.plumeDk, lift:0.006}});
      const fk = screech(V(s*0.218, L.crownY+0.06, -0.05));
      quad(fk, fk.clone().add(V(s*0.06,0.10,-0.03)), fk.clone().add(V(s*0.10,0.06,-0.06)), fk, P.plume, 0.08);
    }
  }

  /* ---------- FORELIMB ARMS — thrown WIDE to the sides, open paws, five splayed claws each: the
     threat-display pose (never a raised swipe). ---------- */
  const clawPaw = (wrist, reach, hex)=>{
    const d = reach.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    const pawC = wrist.clone().addScaledVector(d, 0.098);
    tube(wrist, pawC, 0.132, 0.113, 6, hex, {capA:{hex}});
    for(const off of [-2,-1,0,1,2]){
      const kb = pawC.clone().addScaledVector(d,0.041).addScaledVector(side, off*0.052);
      const kt = kb.clone().addScaledVector(d,0.160).addScaledVector(side, off*0.030).add(V(0,0.010,0)); // splayed OUT + slightly up (open display, not a downward hook)
      /* R2 CRITIC FIX: tip radius was 0.006 — well under the 0.04u minimum-feature floor (law 3),
         so the splayed claw fingers dissolved into the dark void on the far/shadowed arm in the
         engine capture. Thickened to 0.020 (still tapers off the 0.028 base, still reads as a
         point) so all five fingers survive 1/3-res + dither. */
      tube(kb, kt, 0.030, 0.020, 4, P.palm, {capB:{hex:P.claw, lift:0.008}});
    }
  };
  {
    for(const s of [-1,1]){
      const S  = rear(V(s*L.shoulderX, L.shldY-0.04, 0.09));
      /* R1 CRITIC FIX: a level-height spread arm overlapped the torso silhouette from the capture
         camera and one side read as a blob fused to the body. Raised the elbow/wrist ABOVE the
         shoulder line (out AND up, the BG3/threat-display read) so both arms clear the torso
         mass and project against open void on both sides of the capture. */
      const E  = V(s*0.780, 1.70, 0.12);                             // elbow thrown OUT wide and UP
      const W  = V(s*1.040, 1.86, 0.02);                             // wrist further out and up, paw open sideways
      tube(S, E, 0.207, 0.161, 7, P.fur);                            // MASSIVE furred upper arm
      tube(E, W, 0.161, 0.124, 7, P.furDk);                          // thick forearm
      clawPaw(W, V(s, 0.02, -0.05), P.palm);                          // paw + claws splayed straight OUT to the side
      const base=E.clone().add(V(s*0.04,-0.02,-0.06));
      quad(base, base.clone().add(V(s*0.08,0.13,-0.05)), base.clone().add(V(s*0.14,0.08,-0.07)), base, P.furDk, 0.08);
      const base2=E.clone().add(V(s*0.06,-0.11,-0.02));
      quad(base2, base2.clone().add(V(s*0.07,0.10,-0.03)), base2.clone().add(V(s*0.11,0.06,-0.06)), base2, P.furGrey, 0.08);
    }
  }

  /* ---------- HIND LEGS — thick plantigrade bear legs bearing the reared weight. ---------- */
  {
    const leg=(hipX, footX, footZ, s)=>{
      const hip = rear(V(hipX, L.hipY-0.02, 0.02));
      const knee= V(hipX + s*0.046, 0.46, 0.20);
      const ank = V(footX, 0.115, footZ);
      tube(hip, knee, 0.184, 0.136, 6, P.fur);
      tube(knee, ank, 0.121, 0.092, 6, P.furDk);
      const heel = V(ank.x, 0.063, ank.z);
      const d = V(s*0.06,0,1).normalize();
      /* paw-pad radius clamped to 0.092 (down from an earlier 0.121) — bbox gate: the ring's
         vertical extent at this shallow heel height must not dip below y=-0.01. */
      tube(heel.clone().addScaledVector(d,-0.035), heel.clone().addScaledVector(d,0.213), 0.092, 0.063, 6, P.palm,
           {raz:0.081, rbz:0.051, capA:{hex:P.furDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.207).addScaledVector(side, off*0.069);
        const tt=tb.clone().addScaledVector(d,0.063).addScaledVector(side, off*0.011);
        /* R2 CRITIC FIX: same sub-floor tip (0.008) as the foreclaws — thickened so hind claws
           don't dissolve either. */
        tube(tb, tt, 0.028, 0.018, 4, P.palm, {capB:{hex:P.claw, lift:0.006}});
      }
    };
    leg(-L.hipHalf, -0.282, 0.16, -1);
    leg( L.hipHalf,  0.282, 0.115, 1);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.060,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc0);
    capFan(r2, V(0,0.063,0), P.discTop);
  }
}
