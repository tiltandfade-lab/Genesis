/* dev/model-qa/creatures/mon-orc.js — ORC WARRIOR (REBUILD, MODEL-FOUNDRY pass 1).
   Medium, CR 1/2, realm core. Tusked raider. Whole-object grammar (one build fn, probe-lib
   primitives, spine +z, ground y=0), same anatomy family (HUMANOID, PC-kit-adjacent) and
   palette intent as the prior pass — geometry replaced for the charge.

   FEATURE CHECKLIST (the 3-6 features the ~1.2-1.8k budget buys):
   1. Tusked underbite jaw — two big up-curving pale tusks off a jutting lower jaw (the family tell).
   2. Heavy brow shelf casting shadow over the eyes.
   3. Great-axe, TWO-HANDED, swung back over/behind the right shoulder mid-windup — the signature prop.
   4. Mid-run charging stride — front leg planted forward, back leg trailing/kicked-up, trunk pitched
      hard forward, off-balance lean (not a braced fighting stance).
   5. Open roaring mouth (dark cavity between the tusks) — the "most alive moment" tell alongside the axe.
   6. Green-grey hide value ladder (dark legs/torso underside -> lit chest/face) so the tusks + axe
      edge read as the brightest zones in the model (law 3).

   POSE SENTENCE: mid-charge, front foot just planted, torso hurled forward off the back leg, the
   great-axe swung back behind the head in a two-handed windup, jaw torn open in a roar — the instant
   before the downswing, not a ready stance.
*/
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildOrc(){
  /* ---------- PALETTE (VS desaturated; deep green-grey hide) ---------- */
  const P = {
    skin:0x566147, skinDk:0x3a4230, skinLt:0x687350, shin:0x76835a,   // leg-specific tier: PASS-2 boost — was 0x505c40 (nearly = skinDk in-engine, legs vanished into a single dark column); now a genuine lit tier so the stride reads as two separate limbs, not a robe-pillar
    tusk:0xe6dcb8, tuskDk:0xb4a780,                          // brightened tusk lit tier (law 3 signature)
    mouth:0x241611, mouthDk:0x140b08,
    hide:0x5c4a30, hideDk:0x3e3120, hideLt:0x6e5a3c,
    iron:0x858a8e, ironDk:0x4c5054, ironLt:0xb8bec4,         // brightened iron lit tier (axe edge)
    rust:0x6a4a34, strap:0x463522, loin:0x594936,
    paint:0x4a3236, paintDk:0x2a1e21,
    scar:0x7d8560, topknot:0x352f26, topknotDk:0x201d17,
    eye:0xd6c24a, eyeDk:0x161009, nail:0x2b2620,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS ---------- */
  const L = {
    hipY:0.72, waistY:0.80, ribY:0.92, chestY:1.03, shldY:1.13, neckY:1.175,
    hipHalf:0.180, shoulderX:0.320,   // PASS-2: was 0.145 — thighs fused right at the pelvis in-engine, no fork visible
    jawY:1.195, cheekY:1.270, browY:1.345, crownY:1.430, headTopY:1.485,
  };

  /* CHARGE lean — the whole trunk hurled forward+down off the hip line, well past the prior
     "aggressive lean" (0.15 -> 0.34 rad) so the pose reads as off-balance mid-run, not braced. */
  const lean = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.34);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- GREAT-AXE FIRST, TWO-HANDED, SWUNG BACK — the windup. Haft runs from a low-left grip
     up and back over the right shoulder; the head trails high and behind, cocked for the downswing.
     Authored in world space (both fists derive from this). ---------- */
  const GRIPLO = V(-0.12, 0.98, -0.06);                     // lead (left) hand, chest height, pulled back
  const GRIPHI = V(0.10, 1.26, -0.22);                      // trail (right) hand, up near the shoulder, back
  const HAFT = new THREE.Vector3().subVectors(GRIPHI, GRIPLO).normalize();
  const BUTT = GRIPLO.clone().addScaledVector(HAFT, -0.16);
  const HTOP = GRIPHI.clone().addScaledVector(HAFT, 0.44);   // head sits well past the trail hand, high+back
                                                              // (tightened from 0.62/-0.34 pass-1: over-reach
                                                              // widened the bbox and shrank the legs in-frame)
  {
    tube(BUTT, BUTT.clone().addScaledVector(HAFT, 0.05), 0.026, 0.024, 6, P.ironDk, {capA:{hex:P.iron, lift:0.018}});
    tube(BUTT.clone().addScaledVector(HAFT, 0.05), GRIPLO.clone().addScaledVector(HAFT,0.08), 0.024, 0.026, 6, P.strap);
    tube(GRIPLO.clone().addScaledVector(HAFT,0.08), GRIPHI.clone().addScaledVector(HAFT,-0.08), 0.025, 0.024, 6, P.rust);
    tube(GRIPHI.clone().addScaledVector(HAFT,-0.08), GRIPHI.clone().addScaledVector(HAFT,0.10), 0.026, 0.027, 6, P.strap);
    tube(GRIPHI.clone().addScaledVector(HAFT,0.10), HTOP.clone().addScaledVector(HAFT,-0.10), 0.023, 0.028, 6, P.rust);
    tube(HTOP.clone().addScaledVector(HAFT,-0.10), HTOP.clone().addScaledVector(HAFT,-0.02), 0.030, 0.048, 6, P.ironDk);

    const up=V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, HAFT).normalize();
    const w = new THREE.Vector3().crossVectors(HAFT, u).normalize();
    const HEAD_C = HTOP.clone().addScaledVector(HAFT, -0.01);
    tube(HEAD_C.clone().addScaledVector(w,-0.038), HEAD_C.clone().addScaledVector(w,0.038), 0.072, 0.072, 8, P.ironDk);
    const s = 1;
    const root = HEAD_C.clone().addScaledVector(u, s*0.05);
    const bandN = 7, innerPts=[], outerPts=[];
    for(let k=0;k<=bandN;k++){
      const t=k/bandN;
      const along = -0.20 + t*0.40;
      const reach = 0.10 + Math.sin(t*Math.PI)*0.46;
      innerPts.push(root.clone().addScaledVector(HAFT, along*0.30).addScaledVector(u, s*reach*0.16));
      outerPts.push(root.clone().addScaledVector(HAFT, along).addScaledVector(u, s*reach));
    }
    for(let k=0;k<bandN;k++){
      const a=innerPts[k], b=innerPts[k+1], c=outerPts[k+1], d=outerPts[k];
      const off=w.clone().multiplyScalar(0.014);
      quad(a.clone().add(off), b.clone().add(off), c.clone().add(off), d.clone().add(off), P.iron, 0.05);
      quad(d.clone().sub(off), c.clone().sub(off), b.clone().sub(off), a.clone().sub(off), P.iron, 0.05);
      quad(d.clone().add(off), c.clone().add(off), c.clone().sub(off), d.clone().sub(off), P.ironLt, 0.03); // bright edge rim
    }
  }

  /* ---------- TORSO — hurled forward on the charge lean. ---------- */
  stack([
    {y:L.hipY,   rx:0.240, rz:0.185, hex:P.skinDk},
    {y:L.waistY, rx:0.215, rz:0.164, hex:P.skin},
    {y:L.ribY,   rx:0.265, rz:0.194, hex:P.skin},
    {y:L.chestY, rx:0.315, rz:0.210, hex:P.skinLt},
    {y:L.shldY,  rx:0.335, rz:0.200, hex:P.skin},
    {y:L.neckY,  rx:0.138, rz:0.128, hex:P.skinDk},
  ], 8, {xform:lean, capTop:{hex:P.skinDk, lift:0.006}});

  stack([
    {y:0.50, rx:0.250, rz:0.200, hex:P.hideDk},
    {y:0.62, rx:0.238, rz:0.188, hex:P.hide},
    {y:L.hipY, rx:0.224, rz:0.174, hex:P.hide},
  ], 8, {xform:lean});
  stack([
    {y:0.76, rx:0.222, rz:0.172, hex:P.strap},
    {y:0.82, rx:0.219, rz:0.169, hex:P.strap},
  ], 8, {xform:lean});
  quad(lean(V(-0.05,0.765,0.180)), lean(V(0.05,0.765,0.180)),
       lean(V(0.05,0.815,0.175)), lean(V(-0.05,0.815,0.175)), P.iron, 0.02);

  /* ---------- ASYMMETRIC ARMOR — LEFT iron pauldron, RIGHT bare (matches the trail axe hand). ---------- */
  {
    const pivot=V(-L.shoulderX, L.shldY+0.02, 0.00);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), 0.34); return q.add(pivot); };
    stack([
      {y:L.shldY-0.05, rx:0.148, rz:0.158, cx:pivot.x, cz:pivot.z, hex:P.ironDk},
      {y:L.shldY+0.02, rx:0.133, rz:0.143, cx:pivot.x, cz:pivot.z, hex:P.iron},
      {y:L.shldY+0.09, rx:0.096, rz:0.102, cx:pivot.x, cz:pivot.z, hex:P.ironLt},
    ], 8, {xform:p=>lean(tilt(p)), capTop:{hex:P.ironLt, lift:0.03}});
    for(const [dx,dy] of [[-0.06,0.02],[0.05,0.05]]){
      const c=lean(tilt(V(pivot.x+dx, L.shldY+dy, 0.150)));
      quad(c.clone().add(V(-0.012,-0.012,0)), c.clone().add(V(0.012,-0.012,0)),
           c.clone().add(V(0.012,0.012,0.004)), c.clone().add(V(-0.012,0.012,0.004)), P.ironLt, 0.0);
    }
  }
  for(const [y,cz] of [[L.chestY+0.02,0.195],[L.ribY,0.185]]){
    const a=lean(V(0.195, y, cz)), b=lean(V(-0.02, y-0.06, cz-0.02));
    tube(a, b, 0.026, 0.020, 4, P.hideLt);
  }

  /* ---------- HEAD — heavy brow, tusked underbite, ROARING open mouth, war-paint, topknot. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.148, rz:0.146, hex:P.skinLt},
      {y:L.cheekY, rx:0.160, rz:0.148, hex:P.skin},
      {y:L.browY,  rx:0.148, rz:0.130, hex:P.skin},
      {y:L.crownY, rx:0.118, rz:0.102, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(lean));
    for(const i of [1,2]) rings[1][i].z += 0.020;
    for(const i of [1,2]){ rings[2][i].z += 0.068; rings[2][i].y -= 0.018; }
    for(const i of [0,3]){ rings[2][i].z += 0.036; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], lean(V(0, L.headTopY, 0.006)), P.skinDk);

    /* ROARING OPEN MOUTH — the underjaw drops FAR down and forward (not the tight underbite wedge of
       the ready pose) exposing a dark mouth cavity between jaw and upper lip, before the tusks. */
    const mouthBackTop = lean(V(0, L.jawY+0.030, 0.135));
    const mouthBackBot = lean(V(0, L.jawY-0.145, 0.145));
    tube(mouthBackTop, mouthBackBot, 0.115, 0.070, 6, P.mouthDk, {raz:0.095, rbz:0.055});   // cavity shell
    const jawFrontBot = lean(V(0, L.jawY-0.155, 0.185));
    tube(lean(V(0,L.jawY-0.010,0.03)), jawFrontBot, 0.128, 0.078, 6, P.skinLt, {raz:0.098, rbz:0.062, capB:{hex:P.skinDk}});
    /* dark cavity wedge visible in the gap between upper lip and lower jaw */
    quad(lean(V(-0.075,L.jawY+0.015,0.150)), lean(V(0.075,L.jawY+0.015,0.150)),
         lean(V(0.055,L.jawY-0.075,0.170)), lean(V(-0.055,L.jawY-0.075,0.170)), P.mouth, 0.03);

    /* TWO PROMINENT UP-CURVING TUSKS off the dropped jaw — bright lit tier (law 3 signature). */
    for(const s of [-1,1]){
      const base = lean(V(s*0.072, L.jawY-0.110, 0.170));
      const mid  = lean(V(s*0.082, L.jawY-0.020, 0.205));
      const tip  = lean(V(s*0.070, L.jawY+0.070, 0.192));
      tube(base, mid, 0.032, 0.025, 5, P.tusk, {capA:{hex:P.tuskDk}});
      tube(mid, tip, 0.025, 0.008, 5, P.tusk, {capB:{hex:P.tuskDk, lift:0.006}});
    }
    for(const tx of [-0.030, 0.030]){
      const b=lean(V(tx, L.jawY+0.005, 0.148)), t=lean(V(tx, L.jawY+0.032, 0.144));
      tube(b, t, 0.013, 0.006, 4, P.tuskDk, {capB:{hex:P.tusk, lift:0.003}});
    }

    /* WAR-PAINT BAND across the cheeks. */
    for(const s of [-1,1]){
      const ey = L.cheekY + 0.010;
      const a=lean(V(s*0.015, ey-0.024, 0.166));
      const b=lean(V(s*0.148, ey-0.018, 0.060));
      const c=lean(V(s*0.148, ey+0.024, 0.060));
      const d=lean(V(s*0.015, ey+0.030, 0.166));
      quad(a,b,c,d, P.paint, 0.02);
    }
    /* short back-swept ears */
    for(const s of [-1,1]){
      const eb = lean(V(s*0.153, L.cheekY+0.01, -0.02));
      const et = lean(V(s*0.212, L.cheekY+0.074, -0.112));
      tube(eb, et, 0.048, 0.006, 5, P.skin, {raz:0.028, rbz:0.004, capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.005}});
    }

    /* shaved scarred scalp + topknot, streaming back with the charge */
    for(const [sx,sz] of [[-0.03,0.02],[0.05,-0.03]]){
      const c=lean(V(sx, L.crownY+0.02, sz+0.02));
      quad(c.clone().add(V(-0.006,-0.03,0)), c.clone().add(V(0.006,-0.03,0)),
           c.clone().add(V(0.006,0.03,0)), c.clone().add(V(-0.006,0.03,0)), P.scar, 0.05);
    }
    {
      const kb = lean(V(0, L.crownY+0.02, -0.02));
      const km = lean(V(0, L.headTopY+0.10, -0.16));
      const kt = lean(V(0, L.headTopY+0.13, -0.29));         // whipped back further by the charge
      tube(kb, km, 0.038, 0.028, 5, P.topknotDk, {capA:{hex:P.topknotDk}});
      tube(km, kt, 0.028, 0.008, 5, P.topknot, {capB:{hex:P.topknotDk, lift:0.006}});
    }
  }

  /* ---------- ARMS — BOTH derive to the two-handed grip, elbows flared for the windup torque. ---------- */
  {
    /* right (trail) arm -> high-back grip */
    const S=lean(V(L.shoulderX, L.shldY-0.02, 0.00));
    const E=V(0.245, 1.10, -0.18);
    tube(S,E,0.108,0.084,6,P.skin);
    tube(E, GRIPHI.clone().addScaledVector(HAFT,-0.05), 0.080,0.062,6,P.skin);
    tube(GRIPHI.clone().addScaledVector(HAFT,-0.06), GRIPHI.clone().addScaledVector(HAFT,0.06), 0.068,0.062,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    /* left (lead) arm -> low-back grip, crossing in front of the chest */
    const S2=lean(V(-L.shoulderX, L.shldY-0.02, 0.00));
    const E2=V(-0.095, 1.00, -0.02);
    tube(S2,E2,0.106,0.082,6,P.skin);
    tube(E2, GRIPLO.clone().addScaledVector(HAFT,-0.05), 0.079,0.062,6,P.skin);
    tube(GRIPLO.clone().addScaledVector(HAFT,-0.06), GRIPLO.clone().addScaledVector(HAFT,0.06), 0.067,0.061,6,P.skin,
         {capA:{hex:P.skinDk}, capB:{hex:P.skinDk}});
  }

  /* ---------- LEGS — MID-CHARGE STRIDE: front (right, +z) foot planted well forward and wide, back
     (left, -z) leg trailing/kicked-up off the ground for the run beat. World-space (not lean()'d — the
     charge stride is authored directly, hip sockets are the only lean-relative anchor). ---------- */
  {
    const hipL=lean(V(-L.hipHalf, L.hipY-0.02, -0.01));
    const hipR=lean(V( L.hipHalf, L.hipY-0.02,  0.00));

    /* trailing (left) leg: hip -> knee kicked back+up -> foot lifted off the ground behind.
       PASS-2: pushed further back (z) rather than sideways — under the engine's dimetric camera
       (screen_x ~ x-z) a bigger z-throw separates this leg from the planted one far more than a
       sideways x-throw does; pass-1's version collapsed into one column with the planted leg. */
    const kneeL=V(-0.205, 0.46, -0.40), ankL=V(-0.185, 0.260, -0.62);
    tube(hipL,kneeL,0.122,0.088,6,P.skin);
    tube(kneeL,ankL,0.082,0.058,6,P.shin);

    /* planted (right) leg: hip -> knee driven forward -> foot slammed down well forward+wide, braced.
       PASS-2: reach extended (was x=0.360,z=0.52) for the same screen-fork reason above. */
    const kneeR=V(0.290, 0.42, 0.48), ankR=V(0.325, 0.085, 0.66);
    tube(hipR,kneeR,0.128,0.092,6,P.skin);
    tube(kneeR,ankR,0.086,0.062,6,P.shin);

    /* planted right foot: flat, braced, toes forward */
    stack([
      {y:0.015, rx:0.082, rz:0.092, cx:ankR.x, cz:ankR.z, hex:P.hideDk},
      {y:0.10,  rx:0.074, rz:0.078, cx:ankR.x, cz:ankR.z, hex:P.hide},
    ], 6, {capTop:{hex:P.hideDk, lift:0.006}, capBot:{hex:P.skinDk, lift:0.0}});
    {
      const toeA=V(ankR.x,0.05,ankR.z), d=V(0.30,0,0.95).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.068,0.052,6,P.skinDk, {capB:{hex:P.nail, lift:0.012}, raz:0.058, rbz:0.040});
    }
    /* trailing left foot: lifted, toes trailing down+back, no flat sole (mid-stride, off the ground) */
    {
      const footC = ankL.clone().add(V(0,-0.02,-0.05));
      tube(ankL, footC, 0.070, 0.058, 6, P.hideDk, {capB:{hex:P.hide, lift:0.01}});
      const toeA=footC.clone(), d=V(-0.10,-0.35,-0.93).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.120), 0.058,0.044,6,P.skinDk, {capB:{hex:P.nail, lift:0.010}, raz:0.048, rbz:0.032});
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
