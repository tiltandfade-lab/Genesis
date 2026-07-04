/* dev/model-qa/creatures/mon-orc.js — MEDIUM-but-BROAD GOBLINOID HEAVY (whole-object grammar).
   Same one-function / one-geometry-frame / no-anchors law as humanoid.js, escalating the goblin
   family: same underbite/brow language, but SMALLER ears and TRIPLE the menace. A full tusked
   underjaw (two prominent up-curving pale wedges, bigger than the half-orc's nubs), a heavy brow
   shelf, a shaved scarred scalp with a topknot, crude hide-and-iron armor scraps (ASYMMETRIC —
   one shoulder plated in beaten iron, one bare), a dark war-paint band across the face, and a
   brutal CLEAVER-AXE held one-handed (authored FIRST so the fist derives from the grip). Deep
   green-grey skin, DARKER than the half-orc. Aggressive forward lean. ~1.55u tall but wider than
   the barbarian; base disc r=0.42 (Medium). Imported by mon-orc-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildOrc(){
  /* ---------- PALETTE (VS desaturated; deep green-grey hide, darker than the half-orc) ---------- */
  const P = {
    skin:0x566147, skinDk:0x3a4230, skinLt:0x687350,       // deep green-grey, murkier than half-orc's 0x7a8a6e
    tusk:0xd6cba8, tuskDk:0xb4a780,                          // pale bone tusks
    hide:0x5c4a30, hideDk:0x3e3120, hideLt:0x6e5a3c,         // crude hide armor scraps
    iron:0x757a7e, ironDk:0x4c5054, ironLt:0x9298a0,         // beaten iron plate + cleaver
    rust:0x6a4a34, strap:0x463522, loin:0x594936,
    paint:0x3d2c30, paintDk:0x2a1e21,                        // dark red-black war-paint band
    scar:0x7d8560, topknot:0x2e2a22, topknotDk:0x201d17,     // scar tissue, black topknot
    eye:0xc4b23c, eyeDk:0x161009, nail:0x2b2620,             // sickly amber-yellow eye
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — MEDIUM height (~1.55 head-top) but BROADER than the barbarian
     (shoulderX/chest radii past barbarian's 0.300/0.310). Heavy forward lean applied to the
     whole trunk + head for the aggressive read. ---------- */
  const L = {
    hipY:0.72, waistY:0.81, ribY:0.94, chestY:1.055, shldY:1.155, neckY:1.20,
    hipHalf:0.145, shoulderX:0.330,
    jawY:1.225, cheekY:1.305, browY:1.385, crownY:1.475, headTopY:1.535,
  };

  /* aggressive forward lean — rotate everything above the hips forward about the hip line */
  const lean = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.15);                        // tip forward (chest/head jut +z)
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- CLEAVER-AXE FIRST — held ONE-HANDED low in the right fist, the grip is ground truth.
     A brutal single-bit chopping axe: a short wrapped haft and one big heavy crescent blade,
     angled down-and-out ready to swing. ---------- */
  const GRIP = V(0.375, 0.62, 0.28);                        // low, out to the right, forward
  const HTOP = V(0.505, 1.05, 0.44);                        // haft rises up + out + forward
  const HAFT = new THREE.Vector3().subVectors(HTOP, GRIP).normalize();
  const BUTT = GRIP.clone().addScaledVector(HAFT, -0.34);   // haft butt drops below the fist
  {
    /* wrapped haft: iron-capped butt -> wood -> leather grip -> wood up to the head */
    tube(BUTT, BUTT.clone().addScaledVector(HAFT, 0.06), 0.028, 0.026, 6, P.ironDk, {capA:{hex:P.iron, lift:0.02}});
    tube(BUTT.clone().addScaledVector(HAFT, 0.06), GRIP.clone().addScaledVector(HAFT,-0.09), 0.024, 0.024, 6, P.rust);
    tube(GRIP.clone().addScaledVector(HAFT,-0.09), GRIP.clone().addScaledVector(HAFT,0.09), 0.027, 0.027, 6, P.strap); // wrapped grip
    tube(GRIP.clone().addScaledVector(HAFT,0.09), HTOP.clone().addScaledVector(HAFT,-0.10), 0.023, 0.028, 6, P.rust);
    tube(HTOP.clone().addScaledVector(HAFT,-0.10), HTOP.clone().addScaledVector(HAFT,-0.02), 0.030, 0.046, 6, P.ironDk); // steel throat

    /* ONE big single-bit crescent blade off the head, perpendicular to the haft, swept to the fore.
       Built as a fan of quads (both faces) from the socket out to a curved cutting edge. */
    const up=V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, HAFT).normalize();   // blade-spread axis
    const w = new THREE.Vector3().crossVectors(HAFT, u).normalize();    // face-normal axis
    const HEAD_C = HTOP.clone().addScaledVector(HAFT, -0.01);
    /* the iron socket drum the blade roots into */
    tube(HEAD_C.clone().addScaledVector(w,-0.038), HEAD_C.clone().addScaledVector(w,0.038), 0.070, 0.070, 8, P.ironDk);
    /* single crescent, sweeping to the fore (+u picked as the forward side). BIG + HEAVY: a broad
       chopping bit that bulges out well past the haft, edge slung low toward the tip. */
    const s = 1;
    const root = HEAD_C.clone().addScaledVector(u, s*0.05);
    const bandN = 7, innerPts=[], outerPts=[];
    for(let k=0;k<=bandN;k++){
      const t=k/bandN;
      const along = -0.20 + t*0.40;                          // taller bit (more sweep along the haft)
      const reach = 0.10 + Math.sin(t*Math.PI)*0.46;         // deeper chopping bit, bulges way out
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

  /* ---------- TORSO — BROAD, heavy, leaned forward. Bare deep-green hide chest under the armor
     scraps. Widest bands past the barbarian's. ---------- */
  stack([
    {y:L.hipY,   rx:0.245, rz:0.190, hex:P.skinDk},
    {y:L.waistY, rx:0.220, rz:0.168, hex:P.skin},
    {y:L.ribY,   rx:0.270, rz:0.198, hex:P.skin},
    {y:L.chestY, rx:0.320, rz:0.215, hex:P.skinLt},
    {y:L.shldY,  rx:0.340, rz:0.205, hex:P.skin},
    {y:L.neckY,  rx:0.140, rz:0.130, hex:P.skinDk},          // thick column neck
  ], 8, {xform:lean, capTop:{hex:P.skinDk, lift:0.006}});

  /* ragged hide loin-wrap low on the hips */
  stack([
    {y:0.50, rx:0.255, rz:0.205, hex:P.hideDk},
    {y:0.62, rx:0.242, rz:0.192, hex:P.hide},
    {y:L.hipY, rx:0.228, rz:0.178, hex:P.hide},
  ], 8, {xform:lean});
  /* wide strap belt */
  stack([
    {y:0.77, rx:0.228, rz:0.178, hex:P.strap},
    {y:0.83, rx:0.225, rz:0.175, hex:P.strap},
  ], 8, {xform:lean});
  quad(lean(V(-0.05,0.778,0.185)), lean(V(0.05,0.778,0.185)),
       lean(V(0.05,0.828,0.180)), lean(V(-0.05,0.828,0.180)), P.iron, 0.02); // iron buckle

  /* ---------- ASYMMETRIC ARMOR — one shoulder plated in beaten iron, the other bare hide/skin.
     LEFT (character's left, -x) gets a big iron pauldron; RIGHT is bare (the axe arm). ---------- */
  {
    const pivot=V(-L.shoulderX, L.shldY+0.02, 0.01);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), 0.38); return q.add(pivot); };
    stack([
      {y:L.shldY-0.05, rx:0.150, rz:0.160, cx:pivot.x, cz:pivot.z, hex:P.ironDk},
      {y:L.shldY+0.02, rx:0.135, rz:0.145, cx:pivot.x, cz:pivot.z, hex:P.iron},
      {y:L.shldY+0.09, rx:0.098, rz:0.104, cx:pivot.x, cz:pivot.z, hex:P.ironLt},
    ], 8, {xform:p=>lean(tilt(p)), capTop:{hex:P.ironLt, lift:0.03}});
    /* a couple of rivet nubs on the plate */
    for(const [dx,dy] of [[-0.06,0.02],[0.05,0.05]]){
      const c=lean(tilt(V(pivot.x+dx, L.shldY+dy, 0.155)));
      quad(c.clone().add(V(-0.012,-0.012,0)), c.clone().add(V(0.012,-0.012,0)),
           c.clone().add(V(0.012,0.012,0.004)), c.clone().add(V(-0.012,0.012,0.004)), P.ironLt, 0.0);
    }
  }
  /* RIGHT shoulder: a strip of lashed hide scraps across the chest (asymmetric, not plated) */
  for(const [y,cz] of [[L.chestY+0.02,0.20],[L.ribY,0.19]]){
    const a=lean(V(0.20, y, cz)), b=lean(V(-0.02, y-0.06, cz-0.02));
    tube(a, b, 0.026, 0.020, 4, P.hideLt);
  }

  /* ---------- HEAD — heavy brow shelf, full tusked underjaw, dark war-paint band, shaved scarred
     scalp + topknot. Leaned forward with the torso so it juts on the thick neck. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.150, rz:0.148, hex:P.skinLt},        // heavy square jaw
      {y:L.cheekY, rx:0.162, rz:0.150, hex:P.skin},
      {y:L.browY,  rx:0.150, rz:0.132, hex:P.skin},          // narrower than jaw so the brow push reads as a shelf
      {y:L.crownY, rx:0.120, rz:0.104, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(lean));
    /* broad flat nose: a modest forward push on the cheek front verts (NOT a beak — orcs are flat-nosed) */
    for(const i of [1,2]) rings[1][i].z += 0.020;
    /* HEAVY BROW SHELF — shove the brow front verts forward + down HARD so it juts past the nose,
       casting a shadow over the eyes (the brutal read). Push the front-adjacent verts too for a
       wide chunky ridge, not a pinched point. */
    for(const i of [1,2]){ rings[2][i].z += 0.070; rings[2][i].y -= 0.020; }
    for(const i of [0,3]){ rings[2][i].z += 0.038; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], lean(V(0, L.headTopY, 0.006)), P.skinDk);

    /* FULL TUSKED UNDERJAW — a forward-jutting lower-jaw wedge below the jaw band, paler, wide.
       This is the goblin's underbite language ESCALATED. */
    const jawFrontBot = lean(V(0, L.jawY-0.085, 0.150));
    tube(lean(V(0,L.jawY+0.005,0.02)), jawFrontBot, 0.130, 0.082, 6, P.skinLt, {raz:0.100, rbz:0.066, capB:{hex:P.skinDk}});

    /* TWO PROMINENT UP-CURVING TUSKS rising from the underjaw — bigger than the half-orc's nubs.
       Built as tapering tubes that curve up and slightly out, tips forward. */
    for(const s of [-1,1]){
      const base = lean(V(s*0.070, L.jawY-0.055, 0.150));
      const mid  = lean(V(s*0.078, L.jawY+0.010, 0.175));
      const tip  = lean(V(s*0.068, L.jawY+0.080, 0.165));    // curls up and slightly in
      tube(base, mid, 0.030, 0.024, 5, P.tusk, {capA:{hex:P.tuskDk}});
      tube(mid, tip, 0.024, 0.008, 5, P.tusk, {capB:{hex:P.tuskDk, lift:0.006}});
    }
    /* a row of small lower teeth along the underbite lip between the tusks */
    for(const tx of [-0.028, 0.028]){
      const b=lean(V(tx, L.jawY-0.015, 0.158)), t=lean(V(tx, L.jawY+0.022, 0.154));
      tube(b, t, 0.013, 0.006, 4, P.tuskDk, {capB:{hex:P.tusk, lift:0.003}});
    }

    /* WAR-PAINT BAND across the face — a broad horizontal stripe sitting DOWN on the cheeks
       (below the brow shelf so it isn't lost in the brow shadow), spanning cheek to cheek and
       wrapping onto both sides. Thick single band, proud of the cheek plane so it catches light. */
    for(const s of [-1,1]){
      const ey = L.cheekY + 0.010;                            // low, on the lit cheek plane under the eyes
      const a=lean(V(s*0.015, ey-0.024, 0.170));
      const b=lean(V(s*0.150, ey-0.018, 0.062));
      const c=lean(V(s*0.150, ey+0.024, 0.062));
      const d=lean(V(s*0.015, ey+0.030, 0.170));
      quad(a,b,c,d, P.paint, 0.02);
    }
    /* SMALLER pointed ears than the goblin — short back-swept nubs off the cheek band */
    for(const s of [-1,1]){
      const eb = lean(V(s*0.155, L.cheekY+0.01, -0.02));
      const et = lean(V(s*0.215, L.cheekY+0.075, -0.115));   // swept back + up, short
      tube(eb, et, 0.048, 0.006, 5, P.skin, {raz:0.028, rbz:0.004, capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.005}});
    }

    /* SHAVED SCARRED SCALP + TOPKNOT — the scalp stays bare skin (no hair cap); a couple of pale
       scar lines scored across it, and a single black topknot bound at the crown rising back. */
    for(const [sx,sz] of [[-0.03,0.02],[0.05,-0.03]]){       // two scar quads on the crown
      const c=lean(V(sx, L.crownY+0.02, sz+0.02));
      quad(c.clone().add(V(-0.006,-0.03,0)), c.clone().add(V(0.006,-0.03,0)),
           c.clone().add(V(0.006,0.03,0)), c.clone().add(V(-0.006,0.03,0)), P.scar, 0.05);
    }
    {
      const kb = lean(V(0, L.crownY+0.02, -0.02));
      const km = lean(V(0, L.headTopY+0.08, -0.11));
      const kt = lean(V(0, L.headTopY+0.14, -0.20));         // topknot sweeps up + back
      tube(kb, km, 0.038, 0.030, 5, P.topknotDk, {capA:{hex:P.topknotDk}});
      tube(km, kt, 0.030, 0.008, 5, P.topknot, {capB:{hex:P.topknotDk, lift:0.006}});
    }
  }

  /* ---------- ARMS — thick, right derives to the axe grip; left hangs heavy with a clenched fist. ---------- */
  {
    /* right arm -> axe fist */
    const S=lean(V(L.shoulderX, L.shldY-0.02, 0.02));
    const FIST=GRIP.clone();
    const E=V(0.395, 0.86, 0.15);
    tube(S,E,0.110,0.086,6,P.skin);
    tube(E, FIST.clone().addScaledVector(HAFT,-0.03), 0.082,0.066,6,P.skin);
    tube(FIST.clone().addScaledVector(HAFT,-0.06), FIST.clone().addScaledVector(HAFT,0.06), 0.070,0.064,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    /* left arm -> heavy hanging fist, low + forward (menace) */
    const S2=lean(V(-L.shoulderX, L.shldY-0.02, 0.02));
    const E2=V(-0.395, 0.86, 0.10);
    const W2=V(-0.360, 0.60, 0.20);
    tube(S2,E2,0.110,0.086,6,P.skin);
    tube(E2,W2,0.082,0.066,6,P.skin);
    /* clenched fist blob */
    tube(W2.clone().add(V(0,0.03,-0.02)), W2.clone().add(V(0,-0.05,0.03)), 0.072,0.060,6,P.skin,
         {capA:{hex:P.skinDk}, capB:{hex:P.skinDk}});
  }

  /* ---------- LEGS — thick, wide braced stance (aggressive stride). ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.270,0.40,0.11), ankL=V(-0.285,0.085,0.07);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.295,0.40,-0.06), ankR=V( 0.310,0.085,-0.12);
    tube(hipL,kneeL,0.125,0.090,6,P.skin);
    tube(kneeL,ankL,0.084,0.060,6,P.skinDk);
    tube(hipR,kneeR,0.125,0.090,6,P.skin);
    tube(kneeR,ankR,0.084,0.060,6,P.skinDk);
    /* crude hide foot-wraps + splayed feet */
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,0.30).normalize()]]){
      stack([
        {y:0.015, rx:0.080, rz:0.090, cx:ank.x, cz:ank.z, hex:P.hideDk},
        {y:0.10,  rx:0.072, rz:0.076, cx:ank.x, cz:ank.z, hex:P.hide},
      ], 6, {capTop:{hex:P.hideDk, lift:0.006}, capBot:{hex:P.skinDk, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.140), 0.066,0.050,6,P.skinDk, {capB:{hex:P.nail, lift:0.012}, raz:0.056, rbz:0.038});
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
