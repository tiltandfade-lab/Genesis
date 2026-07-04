/* dev/model-qa/creatures/mon-mezzoloth.js — the MEZZOLOTH (bespoke BIPEDAL, Medium Fiend, yugoloth).
   CREATURE-MODELS-P2 Wave 4: an insectoid mercenary-fiend. The read: a chitinous humanoid torso
   topped with a MANTIS/beetle head (long jutting jaw + mandibles), big clawed insect ARMS ending
   in bladed forearm chitin, and gripping a long TRIDENT held diagonally across the body. Green-black
   chitin (VS desaturated, mottled), pale bone-color mandibles/trident tines standing out against the
   dark carapace. NO eye quads — the beetle-brow ridge reads as a face on its own. Seeds/extends the
   horned/chitin-humanoid base for the yugoloth family (arcanaloth/ultroloth/yochlol share the torso
   grammar). Whole-object grammar: one function, one merged geometry frame, no anchors, no part
   transforms. Medium size: base disc r=0.42. Imported by ps1-sheet.html (set=p2mon) +
   WHOLE_OBJECT_REGISTRY["mezzoloth"]. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildMezzoloth(){
  /* ---------- PALETTE (VS desaturated; green-black mottled chitin, pale bone mandibles/trident) ---------- */
  const P = {
    chitin:0x30392c, chitinDk:0x1c231a, chitinLt:0x4a5640,      // matte green-black carapace
    mottleA:0x3a4232, mottleB:0x28301f,                          // mottled patchwork on torso/limbs
    plateEdge:0x545f45, joint:0x14180f,                          // lighter rims / dark joint grooves
    mandible:0xc7bd9c, mandibleDk:0x8e8368, mandibleTip:0x2a2419,// pale bone mandibles, dark tips
    claw:0xb8ad8c, clawDk:0x24201a,                              // bone-pale claw blades
    haft:0x463c2c, haftDk:0x2d271c,                              // dark wood trident haft
    tine:0xaea78c, tineDk:0x605a46,                              // pale bone trident tines
    disc:0x342c22, discTop:0x413828,
  };
  setChannels({
    [P.mandible]:'bone', [P.mandibleDk]:'bone', [P.claw]:'bone',
    [P.tine]:'bone', [P.tineDk]:'bone',
    [P.haft]:'wood', [P.haftDk]:'wood',
  });

  /* ---------- LANDMARKS — humanoid biped, slight forward crouch (mercenary ready-stance). ---------- */
  const L = {
    hipY:0.62, waistY:0.74, chestY:0.92, shldY:1.04, neckY:1.10,
    hipHalf:0.150, shoulderX:0.290,
    jawY:1.10, muzzleY:1.16, browY:1.24, crownY:1.32,
  };
  /* slight forward pitch about the hips — coiled ready-stance */
  const crouch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.14);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — banded chitin carapace, mottled, broad hunched shoulders. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.150, rz:0.130, hex:P.chitinDk},
      {y:L.waistY, rx:0.165, rz:0.140, hex:P.mottleA},
      {y:L.chestY, rx:0.210, rz:0.165, hex:P.chitin},
      {y:L.shldY,  rx:0.235, rz:0.170, hex:P.mottleB},           // broad rolled shoulders
      {y:L.neckY,  rx:0.110, rz:0.100, hex:P.chitinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(crouch));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex);
      }
    }
    capFan(rings.at(-1), crouch(V(0, L.neckY+0.02, 0)), P.chitinDk);

    /* segmented plate rims — thin lighter bands at the seams */
    for(const y of [L.waistY+0.04, L.chestY+0.045]){
      const rr  = ring(V(0,y,0.0), V(0,1,0), 0.20, 0.155, n, ph).map(crouch);
      const rr2 = ring(V(0,y+0.025,0.0), V(0,1,0), 0.198, 0.153, n, ph).map(crouch);
      stitch([rr,rr2], ()=>P.plateEdge);
    }
    /* dark joint groove at the waist seam */
    {
      const a = crouch(V(-0.02,L.waistY,0.15)), b = crouch(V(0.02,L.waistY,0.15));
      const c = crouch(V(0.018,L.chestY,0.18)), d = crouch(V(-0.018,L.chestY,0.18));
      quad(a,b,c,d,P.joint,0.04);
    }
  }

  /* ---------- HEAD — MANTIS/beetle skull: long jutting jaw + mandibles, low brow ridge. NO eyes. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.075, rz:0.085, hex:P.chitin},
      {y:L.muzzleY, rx:0.086, rz:0.095, hex:P.mottleA},
      {y:L.browY,   rx:0.082, rz:0.072, hex:P.chitinDk},         // low heavy brow ridge
      {y:L.crownY,  rx:0.058, rz:0.055, hex:P.chitinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(crouch));
    /* push the muzzle/brow front verts forward — jutting insectoid skull profile */
    for(const i of [1,2]){ rings[1][i].z += 0.045; }
    for(const i of [1,2]){ rings[2][i].z += 0.02; rings[2][i].y -= 0.006; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex);
      }
    }
    capFan(rings.at(-1), crouch(V(0, L.crownY+0.05, -0.01)), P.chitinDk);

    /* MANDIBLES — a pair of curved pale-bone mandibles jutting from the jaw, crossing slightly. */
    for(const side of [-1,1]){
      const root = crouch(V(side*0.052, L.jawY-0.01, 0.11));
      const mid  = crouch(V(side*0.075, L.jawY-0.03, 0.24));
      const tip  = crouch(V(side*0.03,  L.jawY-0.045, 0.33));    // curls inward at the tip
      tube(root, mid, 0.028, 0.018, 5, P.mandible, {capA:{hex:P.mandibleDk}});
      tube(mid, tip, 0.018, 0.006, 5, P.mandibleDk, {capB:{hex:P.mandibleTip, lift:0.006}});
    }
    /* small vertical mouth shadow beneath the mandibles */
    quad(crouch(V(-0.032,L.jawY-0.03,0.155)), crouch(V(0.032,L.jawY-0.03,0.155)),
         crouch(V(0.02,L.jawY-0.06,0.19)), crouch(V(-0.02,L.jawY-0.06,0.19)), P.joint, 0.04);
  }

  /* ---------- ARMS — big clawed insect arms; bladed chitin forearm plates. Right hand grips the
     trident haft; left arm cocked out with claws bared. ---------- */
  {
    const buildArm = (side)=>{
      const S = crouch(V(side*L.shoulderX, L.shldY-0.02, 0.0));
      const E = V(side*0.335, 0.80, 0.10);                        // elbow out + slightly forward
      const W = V(side*0.30,  0.60, side*0.02+0.16);              // wrist drops, angled toward center
      tube(S, E, 0.075, 0.056, 6, P.chitin, {capA:{hex:P.chitinDk}});
      /* bladed forearm — a flattened chitin plate along the forearm (elliptical taper) */
      tube(E, W, 0.055, 0.040, 6, P.mottleA, {raz:0.070, rbz:0.050});

      /* CLAW HAND — three curved bone-pale claw blades splaying from the wrist */
      for(const [dx,dy,dz] of [[side*0.05,-0.02,0.10],[0,-0.05,0.11],[-side*0.045,-0.02,0.09]]){
        const cb = V(W.x, W.y-0.01, W.z);
        const ct = V(W.x+dx, W.y+dy-0.05, W.z+dz);
        tube(cb, ct, 0.024, 0.006, 4, P.claw, {capB:{hex:P.clawDk, lift:0.005}});
      }
    };
    buildArm(-1);
    buildArm(1);
  }

  /* ---------- TRIDENT — a long haft held diagonally, gripped near the right hand, three pale
     bone tines fanning at the top. ---------- */
  {
    const grip  = V(0.30, 0.58, 0.24);                            // near the right wrist
    const haftLo= V(0.13, 0.10, -0.10);                            // butt trails down-back
    const haftHi= V(0.46, 1.62, 0.55);                             // shaft rises high past the shoulder
    tube(haftLo, grip, 0.028, 0.024, 6, P.haftDk);
    tube(grip, haftHi, 0.024, 0.016, 6, P.haft, {capB:{hex:P.haftDk, lift:0.01}});

    /* tine base collar */
    const collar = V(0.455, 1.60, 0.545);
    /* three tines: center + two outer, fanning up from the collar */
    const tineDefs = [
      {dx:0.00, dz:0.00, len:0.30},
      {dx:0.085, dz:0.03, len:0.25},
      {dx:-0.085, dz:-0.03, len:0.25},
    ];
    for(const t of tineDefs){
      const base = collar;
      const mid  = V(collar.x+t.dx*0.5, collar.y+t.len*0.6, collar.z+t.dz*0.5);
      const tip  = V(collar.x+t.dx, collar.y+t.len, collar.z+t.dz);
      tube(base, mid, 0.020, 0.012, 5, P.tine, {capA:{hex:P.tineDk}});
      tube(mid, tip, 0.012, 0.003, 5, P.tineDk, {capB:{hex:P.tineDk, lift:0.005}});
    }
  }

  /* ---------- LEGS — stout digitigrade insectoid legs, planted wide. ---------- */
  {
    const buildLeg = (side)=>{
      const hip  = V(side*L.hipHalf, L.hipY-0.01, 0.00);
      const knee = V(side*0.165, 0.34, 0.09);                      // knee pushed forward (digitigrade)
      const ankle= V(side*0.150, 0.15, -0.03);
      const toe  = V(side*0.155, 0.045, 0.10);
      tube(hip, knee, 0.088, 0.062, 6, P.chitin, {capA:{hex:P.chitinDk}});
      tube(knee, ankle, 0.060, 0.040, 6, P.mottleA);
      tube(ankle, toe, 0.038, 0.026, 5, P.chitinDk);
      /* small clawed foot — short splayed claws forward */
      const heel = V(toe.x, 0.030, toe.z);
      for(const [dx,dz] of [[side*0.035,0.035],[0,0.06],[-side*0.03,0.035]]){
        const cb = V(heel.x, 0.030, heel.z);
        const ct = V(heel.x+dx, 0.008, heel.z+dz);
        tube(cb, ct, 0.014, 0.004, 4, P.claw, {capB:{hex:P.clawDk, lift:0.004}});
      }
    };
    buildLeg(-1);
    buildLeg(1);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.040,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.043,0), P.discTop);
  }
}
