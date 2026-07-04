/* dev/model-qa/creatures/mon-owlbear.js — THE OWLBEAR, the impossible hybrid (whole-object grammar).
   Same one-function / one-geometry-frame / no-anchors law as humanoid.js + mon-wolf.js. A BEAR'S
   body REARING UP on its hind legs (~1.8u tall reared) — thick furred trunk, massive rolled
   shoulders, two heavy foreclaw arms RAISED mid-swipe with long dark claws — topped by an OWL'S
   HEAD. The head carries the whole read: a broad round FACIAL DISC (a flat ring of radiating
   feather quads framing the face), two large forward-facing amber eyes, a short sharp dark BEAK
   (small wedge tubes, NOT a muzzle), and ear tufts. Feathers transition to fur at the neck
   (layered ragged quads over the chest). Brown fur body, grey-buff facial disc. The read at a
   glance must be OWL-HEAD / BEAR-BODY — the disc + beak do it. Base disc r=0.48 (big Medium).
   Imported by mon-owlbear-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildOwlbear(){
  /* ---------- PALETTE (VS desaturated; brown bear fur, grey-buff owl facial disc) ---------- */
  const P = {
    fur:0x6f5a3d, furDk:0x463726, furLt:0x8a7250, furGrey:0x5c4f3c,   // brown bear coat, wide value spread
    belly:0x847053, chest:0x9a8763,                                    // paler chest feather bib
    disc:0xa89f88, discDk:0x7c7460, discLt:0xc4bca4,                   // grey-buff owl facial disc
    plume:0x8f8368, plumeDk:0x655c48,                                  // the framing feather ring
    beak:0x2a2622, beakLt:0x453e34,                                    // short sharp dark beak
    eyeRim:0x14100c, eye:0x161210, iris:0xd8a838, irisLt:0xf0cc60,     // huge forward amber owl eyes
    tuft:0x554836,                                                      // ear tufts (feather horns)
    claw:0x201b16, palm:0x5a4a36,                                      // long dark foreclaws
    disc0:0x4a4038, discTop:0x585047,                                  // BASE disc (the miniature stand)
  };

  /* ---------- LANDMARKS — REARED bear frame. Hind legs plant on the disc, the trunk pitches
     UP and slightly back so it reads reared-and-towering; head-top ~1.8u. The trunk leans back a
     touch (belly forward) the way a rearing bear balances on its haunches. ---------- */
  const L = {
    hipY:0.62, waistY:0.82, ribY:1.04, chestY:1.24, shldY:1.40, neckY:1.46,
    hipHalf:0.185, shoulderX:0.360,
    beakY:1.51, discCtrY:1.60, browY:1.70, crownY:1.80,               // owl head landmarks
  };

  /* slight backward recline of the reared upper body about the hips (belly thrusts forward,
     shoulders sit back over the haunches) — the balance a bear strikes when it rears. */
  const rear = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), -0.10);                                // small backward pitch
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — thick furred bear trunk, one loft, hips→neck. Deep barrel chest, massive
     rolled shoulders. Deliberately heavy so the delicate owl head reads as a shock on top. ---------- */
  stack([
    {y:L.hipY,   rx:0.290, rz:0.250, hex:P.furDk},
    {y:L.waistY, rx:0.330, rz:0.275, hex:P.fur},                     // heavy belly
    {y:L.ribY,   rx:0.360, rz:0.290, hex:P.furLt},
    {y:L.chestY, rx:0.375, rz:0.285, hex:P.fur},                     // deep barrel chest
    {y:L.shldY,  rx:0.395, rz:0.270, hex:P.furLt},                   // massive rolled shoulders
    {y:L.neckY,  rx:0.200, rz:0.185, hex:P.furGrey},                 // thick furred neck stump
  ], 8, {xform:rear, capTop:{hex:P.furGrey, lift:0.006}});

  /* lumpy fur overlay — a few bulged partial bands proud of the trunk so the coat reads shaggy,
     not smooth (the bugbear fur-mass technique) */
  for(const [y,rx,rz,cx,hex] of [
    [L.chestY+0.02, 0.190, 0.150, -0.14, P.furDk],
    [L.ribY+0.03,   0.175, 0.150,  0.16, P.furLt],
    [L.waistY+0.02, 0.170, 0.145,  0.12, P.furGrey],
    [L.shldY-0.05,  0.175, 0.150, -0.17, P.fur],
  ]){
    const rings=[
      ring(V(cx,y-0.06,0.06), V(0,1,0), rx*0.85, rz*0.85, 7, Math.PI/7).map(rear),
      ring(V(cx,y+0.06,0.06), V(0,1,0), rx, rz, 7, Math.PI/7).map(rear),
    ];
    stitch(rings, ()=>hex);
    capFan(rings[1], rear(V(cx,y+0.13,0.06)), hex);
  }

  /* ---------- FEATHER-TO-FUR TRANSITION — the pale owl chest bib: layered ragged feather quads
     cascading down the front of the chest below the neck, marking where owl becomes bear. ---------- */
  {
    const rows=[
      {y:L.neckY-0.04, half:0.140, drop:0.13, hex:P.chest},
      {y:L.chestY+0.04, half:0.180, drop:0.15, hex:P.disc},
      {y:L.chestY-0.10, half:0.200, drop:0.15, hex:P.chest},
      {y:L.ribY+0.00,  half:0.185, drop:0.14, hex:P.belly},
    ];
    for(const r of rows){
      // a row of overlapping SCALLOPED feather plates across the chest front (+z) — each a solid
      // downward-pointing rounded quad, alternating value for the layered-plumage read
      for(let k=-2;k<=2;k++){
        const cx = k*r.half*0.44;
        const zf = 0.245 - Math.abs(k)*0.022;                        // curve the bib around the barrel
        const w  = r.half*0.34;
        const tl = rear(V(cx-w, r.y, zf));
        const tr = rear(V(cx+w, r.y, zf));
        const br = rear(V(cx+w*0.55, r.y-r.drop*0.6, zf-0.015));
        const bl = rear(V(cx-w*0.55, r.y-r.drop*0.6, zf-0.015));
        const tip= rear(V(cx, r.y-r.drop, zf-0.008));
        quad(tl, tr, br, bl, (k%2? r.hex: P.disc), 0.05);            // feather body
        quad(bl, br, tip, tip, (k%2? P.disc: r.hex), 0.05);          // rounded feather tip
      }
    }
  }

  /* ---------- OWL HEAD — the read-carrier. A broad ROUND FACIAL DISC (flat feather ring framing
     a slightly concave face), two huge forward amber eyes, a short sharp dark BEAK, ear tufts.
     Sits atop the neck stump. NO muzzle — the beak is a small wedge, the disc is flat-frontal. ---------- */
  {
    const n=10, ph=Math.PI/n;

    /* ---- skull core: a squat round dome BEHIND (and set BACK from) the facial disc. Pulled back
       in z (negative cz) and kept shallow in rz so the broad frontal disc caps the face cleanly
       instead of the skull bulging out beside it — owls are almost all face. ---- */
    const bands=[
      {y:L.beakY-0.02, cz:-0.08, rx:0.175, rz:0.150, hex:P.plumeDk},  // under the disc (chin feathers)
      {y:L.discCtrY,   cz:-0.09, rx:0.210, rz:0.155, hex:P.plume},    // widest, but shallow + set back
      {y:L.browY,      cz:-0.12, rx:0.185, rz:0.140, hex:P.plume},
      {y:L.crownY-0.03,cz:-0.14, rx:0.130, rz:0.115, hex:P.plumeDk},  // rounded crown, pulled in + DOWN + BACK
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(rear));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), rear(V(0, L.crownY+0.00, -0.16)), P.plumeDk);

    /* ---- THE FACIAL DISC — a flat frontal ring of radiating feather quads. Two concentric rings
       of points on the FRONT face (a broad grey-buff disc), stitched outward from a slightly
       recessed inner face to a proud raised feather rim. This is the owl signature. ---- */
    const discC = rear(V(0, L.discCtrY-0.02, 0.14));                 // center of the face, proud +z
    const faceN = new THREE.Vector3(0,0,1).applyAxisAngle(V(1,0,0), -0.06).normalize(); // near-frontal normal
    const up = new THREE.Vector3(0,1,0);
    const uAx = new THREE.Vector3().crossVectors(up, faceN).normalize();
    const vAx = new THREE.Vector3().crossVectors(faceN, uAx).normalize();
    const discPt = (rad, ang, push)=> discC.clone()
        .addScaledVector(uAx, Math.cos(ang)*rad)
        .addScaledVector(vAx, Math.sin(ang)*rad*1.10)                // disc slightly taller than wide
        .addScaledVector(faceN, push);
    const RD = 16;                                                    // segments around the disc
    // three concentric rings: recessed inner face -> mid -> proud outer plume rim
    const inner=[], mid=[], rim=[];
    for(let i=0;i<RD;i++){
      const a = (i/RD)*Math.PI*2;
      inner.push(discPt(0.075, a, -0.020));                          // recessed center (concave face)
      mid.push(  discPt(0.200, a,  0.020));
      rim.push(  discPt(0.270, a,  0.030));                          // raised feather rim, proud
    }
    // stitch center -> inner (a small concave hub around the eyes/beak)
    const hub = discC.clone().addScaledVector(faceN,-0.045);
    for(let i=0;i<RD;i++){ const i2=(i+1)%RD;
      quad(hub, inner[i], inner[i2], inner[i2], P.discDk, 0.04);
    }
    // inner -> mid (the flat buff disc field)
    for(let i=0;i<RD;i++){ const i2=(i+1)%RD;
      quad(inner[i], mid[i], mid[i2], inner[i2], (i%2?P.disc:P.discLt), 0.05);
    }
    // mid -> rim (the radiating framing feather quads — alternating value = feather read)
    for(let i=0;i<RD;i++){ const i2=(i+1)%RD;
      quad(mid[i], rim[i], rim[i2], mid[i2], (i%2?P.plume:P.plumeDk), 0.06);
    }

    /* ---- HUGE FORWARD AMBER EYES — two big forward-facing discs set into the facial disc, close
       together (binocular owl stare). Dark rim ring + amber iris + bright fleck. ---- */
    for(const s of [-1,1]){
      const ec = discC.clone().addScaledVector(uAx, s*0.088).addScaledVector(vAx, 0.020).addScaledVector(faceN, -0.006);
      const eN = faceN;
      const eU = uAx, eV = vAx;
      const ept = (rad,ang,push)=> ec.clone().addScaledVector(eU,Math.cos(ang)*rad).addScaledVector(eV,Math.sin(ang)*rad).addScaledVector(eN,push);
      const RE=10;
      const rimR=[], irisR=[];
      for(let i=0;i<RE;i++){ const a=(i/RE)*Math.PI*2;
        rimR.push(ept(0.070,a,0.006));
        irisR.push(ept(0.050,a,0.018));
      }
      // dark eye-rim ring
      for(let i=0;i<RE;i++){ const i2=(i+1)%RE; quad(rimR[i],irisR[i],irisR[i2],rimR[i2], P.eyeRim, 0.02); }
      // amber iris field (cap fan to a proud center)
      capFan(irisR, ec.clone().addScaledVector(eN,0.030), P.iris);
      // bright amber fleck + dark pupil dot
      const pup = ec.clone().addScaledVector(eN,0.034);
      quad(pup.clone().addScaledVector(eU,-0.016).addScaledVector(eV,-0.016),
           pup.clone().addScaledVector(eU, 0.016).addScaledVector(eV,-0.016),
           pup.clone().addScaledVector(eU, 0.014).addScaledVector(eV, 0.016),
           pup.clone().addScaledVector(eU,-0.014).addScaledVector(eV, 0.016), P.eye, 0.0);
      quad(pup.clone().addScaledVector(eU,-0.006).addScaledVector(eV, 0.002),
           pup.clone().addScaledVector(eU, 0.006).addScaledVector(eV, 0.002),
           pup.clone().addScaledVector(eU, 0.005).addScaledVector(eV, 0.010),
           pup.clone().addScaledVector(eU,-0.005).addScaledVector(eV, 0.010), P.irisLt, 0.0);
    }

    /* ---- SHORT SHARP BEAK — small dark wedge tubes hanging BETWEEN and just below the eyes.
       NOT a muzzle: a compact hooked triangle. Upper mandible (down-hooked) + a hint of lower. ---- */
    {
      const beakTop = discC.clone().addScaledVector(vAx, 0.010).addScaledVector(faceN, 0.070);
      const beakMid = discC.clone().addScaledVector(vAx, -0.080).addScaledVector(faceN, 0.130);
      const beakTip = discC.clone().addScaledVector(vAx, -0.150).addScaledVector(faceN, 0.080); // hooks DOWN + back
      tube(beakTop, beakMid, 0.075, 0.048, 6, P.beakLt, {raz:0.060, rbz:0.034});
      tube(beakMid, beakTip, 0.048, 0.014, 6, P.beak, {raz:0.034, rbz:0.010, capB:{hex:P.beak, lift:0.008}});
      // lower-mandible fleck under the hook
      const lb = discC.clone().addScaledVector(vAx,-0.110).addScaledVector(faceN,0.090);
      quad(lb.clone().addScaledVector(uAx,-0.032), lb.clone().addScaledVector(uAx,0.032),
           lb.clone().addScaledVector(uAx,0.016).addScaledVector(vAx,-0.040),
           lb.clone().addScaledVector(uAx,-0.016).addScaledVector(vAx,-0.040), P.beakLt, 0.03);
    }

    /* ---- EAR TUFTS — two feather-horn tufts angling up-and-out from the crown corners
       (the great-horned-owl silhouette read). ---- */
    for(const s of [-1,1]){
      const base = rear(V(s*0.150, L.browY+0.02, -0.02));
      const tip  = rear(V(s*0.215, L.crownY+0.18, -0.06));
      tube(base, tip, 0.058, 0.006, 5, P.tuft, {raz:0.034, rbz:0.004, capB:{hex:P.plumeDk, lift:0.006}});
      // a ragged feather flick off the tuft
      const fk = rear(V(s*0.190, L.crownY+0.05, -0.04));
      quad(fk, fk.clone().add(V(s*0.05,0.09,-0.03)), fk.clone().add(V(s*0.09,0.05,-0.05)), fk, P.plume, 0.08);
    }
  }

  /* ---------- FORELIMB ARMS — two heavy bear foreclaw arms RAISED mid-swipe: both lifted to
     chest/shoulder height, elbows out, big splayed paws tipped with LONG dark claws. The menace
     pose. Thick furred upper, darker paw. ---------- */
  const clawPaw = (wrist, reach, hex)=>{
    // paw pad
    const d = reach.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    const pawC = wrist.clone().addScaledVector(d, 0.070);
    tube(wrist, pawC, 0.088, 0.076, 6, hex, {capA:{hex}});
    // FIVE long curved claws splayed off the paw front
    for(const off of [-2,-1,0,1,2]){
      const kb = pawC.clone().addScaledVector(d,0.030).addScaledVector(side, off*0.036);
      const kt = kb.clone().addScaledVector(d,0.120).addScaledVector(side, off*0.010).add(V(0,-0.020,0)); // long, hooking down
      tube(kb, kt, 0.020, 0.004, 4, P.palm, {capB:{hex:P.claw, lift:0.008}});
    }
  };
  {
    for(const s of [-1,1]){
      const S  = rear(V(s*L.shoulderX, L.shldY-0.02, 0.06));
      const E  = V(s*0.520, 1.18, 0.26);                             // elbow out + raised
      const W  = V(s*0.480, 1.36, 0.46);                             // wrist up high + wide + forward (mid-swipe)
      tube(S, E, 0.135, 0.105, 6, P.fur);                            // thick furred upper arm
      tube(E, W, 0.100, 0.078, 6, P.furDk);                         // forearm
      clawPaw(W, V(s*0.28, 0.34, 1), P.palm);                       // paw reaches up + OUT, claws splayed
      // shaggy tuft quads on the forearm
      const base=E.clone().add(V(s*0.02,-0.02,-0.04));
      quad(base, base.clone().add(V(s*0.05,0.08,-0.03)), base.clone().add(V(s*0.09,0.05,-0.05)), base, P.furDk, 0.08);
    }
  }

  /* ---------- HIND LEGS — thick plantigrade bear legs, planted on the disc bearing the reared
     weight. Bent haunch -> shank -> big flat clawed hind paw. ---------- */
  {
    const leg=(hipX, footX, footZ, s)=>{
      const hip = rear(V(hipX, L.hipY-0.02, 0.02));
      const knee= V(hipX + s*0.030, 0.40, 0.16);                    // knee pushed forward (reared crouch)
      const ank = V(footX, 0.10, footZ);
      tube(hip, knee, 0.180, 0.130, 6, P.fur);                      // thick haunch
      tube(knee, ank, 0.115, 0.088, 6, P.furDk);                    // shank
      // big flat hind paw slab planted forward
      const heel = V(ank.x, 0.055, ank.z);
      const d = V(s*0.06,0,1).normalize();
      tube(heel.clone().addScaledVector(d,-0.03), heel.clone().addScaledVector(d,0.175), 0.100, 0.070, 6, P.palm,
           {raz:0.088, rbz:0.056, capA:{hex:P.furDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.170).addScaledVector(side, off*0.058);
        const tt=tb.clone().addScaledVector(d,0.055).addScaledVector(side, off*0.010);
        tube(tb, tt, 0.024, 0.007, 4, P.palm, {capB:{hex:P.claw, lift:0.006}});
      }
    };
    leg(-L.hipHalf, -0.220, 0.14, -1);
    leg( L.hipHalf,  0.220, 0.10,  1);
  }

  /* ---------- base disc (big Medium: r=0.48) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.48, 0.48, 18);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.46, 0.46, 18);
    stitch([r1,r2], ()=>P.disc0);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
