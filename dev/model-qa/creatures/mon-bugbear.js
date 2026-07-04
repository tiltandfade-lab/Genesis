/* dev/model-qa/creatures/mon-bugbear.js — TALL HUNCHED GOBLINOID AMBUSHER (whole-object grammar).
   Same one-function / one-geometry-frame / no-anchors law as humanoid.js. The top of the goblinoid
   family: TALL (~1.7u) but HUNCHED so it reads coiled and ready. Covered in shaggy FUR — the torso
   silhouette is deliberately LUMPY (uneven overlapping band radii + ragged tuft quads at the
   shoulders/forearms), NOT a smooth loft. Disproportionately LONG arms (knuckles near knee height),
   a spiked wooden CLUB held low and back (authored FIRST — cocked to swing), a wide flat nose, small
   mean eyes under a heavy fur brow, and big flat feet. Dusty brown fur, tan muzzle. The read: a huge
   sneaky wall of fur and muscle — distinct from the orc (armored, tusked) and the barbarian (human).
   Base disc r=0.42 (Medium). Imported by mon-bugbear-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildBugbear(){
  /* ---------- PALETTE (VS desaturated; dusty brown fur, TAN muzzle). Deliberately WIDE value
     spread so the shaggy silhouette separates instead of muddying into one brown blob: bright
     dusty highlights on the raised fur, deep shadow in the cavities, a clearly pale tan face. --- */
  const P = {
    fur:0x8a7350, furDk:0x4a3b28, furLt:0xa89066, furGrey:0x746850,   // dusty brown, wide value range
    muzzle:0xc2ac82, muzzleDk:0x8f7a56, muzzleLt:0xd8c299,             // PALE tan face/muzzle — pops off the fur
    nose:0x2e241d, ear:0x9a8460, earDk:0x5f4c34,
    wood:0x5a4326, woodDk:0x3f2f1a, woodLt:0x6e5432,                   // club haft
    spike:0x9299a0, spikeDk:0x565b60, spikeLt:0xbcc2c8, lash:0x463522, // iron spikes + lashing
    claw:0x241f19, palm:0x8a745a,
    eye:0xcfbb44, eyeDk:0x14100a,                                       // small mean amber eyes
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — TALL frame (~1.72 head-top if erect) but HUNCHED: the whole trunk is
     pitched forward hard and the neck/head sit LOW and jutting so it reads coiled, not upright.
     Shoulders sit high and rolled forward. ---------- */
  const L = {
    hipY:0.78, waistY:0.87, ribY:1.00, chestY:1.12, shldY:1.235, neckY:1.28,
    hipHalf:0.150, shoulderX:0.335,
    jawY:1.30, cheekY:1.375, browY:1.455, crownY:1.545, headTopY:1.61,
  };

  /* heavy hunched lean — pitch the whole upper body forward about the hips so the shoulders roll
     over and the head drops in front (coiled ambusher). Bigger angle than the orc. */
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.30);                        // strong forward pitch
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- SPIKED CLUB FIRST — held LOW and BACK in the right fist, cocked to swing. The grip
     is ground truth (the fist derives from it). A thick wooden haft studded with iron spikes. ---------- */
  const GRIP = V(0.40, 0.66, -0.02);                        // low, out to the right, pulled BACK (-z, cocked)
  const CTOP = V(0.60, 1.02, -0.42);                        // club rises up + out + further back
  const HAFT = new THREE.Vector3().subVectors(CTOP, GRIP).normalize();
  const BUTT = GRIP.clone().addScaledVector(HAFT, -0.30);
  {
    /* haft: lashed butt -> long wood shaft swelling toward the head */
    tube(BUTT, BUTT.clone().addScaledVector(HAFT,0.05), 0.030, 0.028, 6, P.lash, {capA:{hex:P.woodDk, lift:0.02}});
    tube(BUTT.clone().addScaledVector(HAFT,0.05), GRIP.clone().addScaledVector(HAFT,-0.09), 0.028, 0.030, 6, P.wood);
    tube(GRIP.clone().addScaledVector(HAFT,-0.09), GRIP.clone().addScaledVector(HAFT,0.09), 0.033, 0.033, 6, P.lash); // wrapped grip
    tube(GRIP.clone().addScaledVector(HAFT,0.09), CTOP.clone().addScaledVector(HAFT,-0.16), 0.030, 0.052, 6, P.woodLt); // swells toward the head
    tube(CTOP.clone().addScaledVector(HAFT,-0.16), CTOP, 0.052, 0.058, 6, P.wood, {capB:{hex:P.woodDk, lift:0.02}});

    /* iron spikes studding the club head — short tapered tubes projecting radially from the swollen end */
    const up=V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, HAFT).normalize();
    const w = new THREE.Vector3().crossVectors(HAFT, u).normalize();
    const spikeAt = (along, ang)=>{
      const c = CTOP.clone().addScaledVector(HAFT, -along);
      const dir = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(w, Math.sin(ang)).normalize();
      const base = c.clone().addScaledVector(dir, 0.050);
      const tip  = c.clone().addScaledVector(dir, 0.130).addScaledVector(HAFT, 0.02);
      tube(base, tip, 0.022, 0.004, 4, P.spike, {capB:{hex:P.spikeLt, lift:0.006}, capA:{hex:P.spikeDk}});
    };
    for(let r=0;r<5;r++){                                    // ring of spikes near the tip
      spikeAt(0.05, r/5*Math.PI*2);
    }
    for(let r=0;r<4;r++){                                    // a second ring further down
      spikeAt(0.14, r/4*Math.PI*2 + 0.4);
    }
  }

  /* ---------- TORSO — LUMPY shaggy fur, NOT a smooth loft. Uneven overlapping band radii (each
     band bulged a different amount) give the mangy silhouette; ragged tuft quads added after. ---------- */
  stack([
    {y:L.hipY,   rx:0.235, rz:0.195, hex:P.furDk},
    {y:L.waistY, rx:0.255, rz:0.205, hex:P.fur},             // waist BULGES wider than hips (lumpy)
    {y:L.ribY,   rx:0.290, rz:0.215, hex:P.furGrey},
    {y:L.chestY, rx:0.335, rz:0.235, hex:P.fur},             // barrel chest
    {y:L.shldY,  rx:0.360, rz:0.230, hex:P.furLt},           // huge rolled shoulders
    {y:L.neckY,  rx:0.180, rz:0.170, hex:P.furDk},           // thick furred neck stump
  ], 8, {xform:hunch, capTop:{hex:P.furDk, lift:0.006}});

  /* lumpy fur overlay — extra bulged partial bands riding proud of the torso at uneven heights,
     each offset so the silhouette never reads smooth */
  for(const [y,rx,rz,cx,hex] of [
    [L.chestY+0.02, 0.180, 0.150, -0.12, P.furDk],
    [L.ribY+0.03,   0.165, 0.140,  0.14, P.fur],
    [L.waistY+0.02, 0.150, 0.130,  0.10, P.furGrey],
    [L.shldY-0.04,  0.160, 0.140, -0.15, P.furLt],
  ]){
    const rings=[
      ring(V(cx,y-0.05,0.03), V(0,1,0), rx*0.85, rz*0.85, 7, Math.PI/7).map(hunch),
      ring(V(cx,y+0.05,0.03), V(0,1,0), rx, rz, 7, Math.PI/7).map(hunch),
    ];
    stitch(rings, ()=>hex);
    capFan(rings[1], hunch(V(cx,y+0.11,0.03)), hex);
  }

  /* ragged tuft quads at the shoulders (the shaggy fringe) */
  for(const s of [-1,1]){
    for(const [dy,len,zk] of [[0.0,0.11,0.02],[0.06,0.08,-0.03],[-0.05,0.09,0.04]]){
      const base = hunch(V(s*0.30, L.shldY+dy, 0.10+zk));
      quad(base, base.clone().add(V(s*0.05,len,zk)), base.clone().add(V(s*0.09,len*0.55,zk*1.5)), base, s>0?P.furDk:P.fur, 0.08);
    }
  }

  /* ---------- HEAD — wide flat nose, small mean eyes under a heavy FUR brow, tan muzzle. Sits LOW
     and jutting forward on the hunched neck. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.140, rz:0.150, hex:P.muzzle},        // muzzle juts forward (rz>rx)
      {y:L.cheekY, rx:0.170, rz:0.152, hex:P.muzzleLt},      // pale tan face — the bright read
      {y:L.browY,  rx:0.166, rz:0.138, hex:P.fur},           // furred upper head starts here
      {y:L.crownY-0.02, rx:0.128, rz:0.114, hex:P.fur},      // rounder skull, pulled in
      {y:L.crownY+0.05, rx:0.078, rz:0.070, hex:P.furDk},    // extra dome band → loses the flat-cap look
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.014), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* WIDE FLAT NOSE — push the jaw/muzzle front verts forward (broad, not a hook); keep it low + wide */
    for(const i of [1,2]){ rings[0][i].z += 0.048; }
    for(const i of [1,2]){ rings[1][i].z += 0.030; rings[1][i].y -= 0.010; }
    /* HEAVY FUR BROW — shove the brow front verts forward + down for a shelf over the small eyes */
    for(const i of [1,2]){ rings[2][i].z += 0.058; rings[2][i].y -= 0.016; }
    for(const i of [0,3]){ rings[2][i].z += 0.030; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.08);
      }
    }
    capFan(rings.at(-1), hunch(V(0, L.headTopY+0.02, -0.01)), P.furDk);

    /* wide flat nose pad — a dark broad quad on the muzzle front */
    {
      const c = hunch(V(0, L.jawY+0.03, 0.198));
      quad(c.clone().add(V(-0.040,-0.020,0)), c.clone().add(V(0.040,-0.020,0)),
           c.clone().add(V(0.028,0.020,-0.006)), c.clone().add(V(-0.028,0.020,-0.006)), P.nose, 0.03);
    }
    /* fur brow tufts — a couple of small tuft quads riding the brow ridge for the shaggy read */
    for(const s of [-1,1]){
      const base = hunch(V(s*0.09, L.browY+0.02, 0.16));
      quad(base, base.clone().add(V(s*0.03,0.05,-0.03)), base.clone().add(V(s*0.05,0.03,-0.05)), base, P.furDk, 0.08);
    }

    /* EARS — rounded fur-backed ears set back on the sides (bugbear = bear-ish), short */
    for(const s of [-1,1]){
      const eb = hunch(V(s*0.165, L.browY+0.02, -0.03));
      const et = hunch(V(s*0.215, L.crownY+0.03, -0.10));
      tube(eb, et, 0.052, 0.020, 5, P.ear, {raz:0.032, rbz:0.014, capA:{hex:P.earDk}, capB:{hex:P.earDk, lift:0.006}});
    }
  }

  /* ---------- ARMS — DISPROPORTIONATELY LONG (knuckles near knee height). Right derives to the
     club grip; left hangs LONG and low with a big splayed hand near the knee. Thick furred. ---------- */
  const bigPaw = (ctr, faceDir, hex)=>{
    const d = faceDir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.040), ctr.clone().addScaledVector(d,0.040),
         0.070, 0.062, 6, hex, {raz:0.045, rbz:0.045, capA:{hex}, capB:{hex}});
    for(const off of [-1,0,1]){
      const kb = ctr.clone().addScaledVector(d,0.036).addScaledVector(side, off*0.042);
      const kt = kb.clone().addScaledVector(d,0.060).addScaledVector(side, off*0.012);
      tube(kb, kt, 0.017, 0.006, 4, hex, {capB:{hex:P.claw, lift:0.005}});
    }
  };
  {
    /* right arm -> club fist (long) */
    const S=hunch(V(L.shoulderX, L.shldY-0.02, 0.02));
    const FIST=GRIP.clone();
    const E=V(0.470, 0.86, 0.02);                            // elbow low + wide (long upper arm)
    tube(S,E,0.105,0.084,6,P.fur);
    tube(E, FIST.clone().addScaledVector(HAFT,-0.04), 0.082,0.064,6,P.furDk);
    tube(FIST.clone().addScaledVector(HAFT,-0.06), FIST.clone().addScaledVector(HAFT,0.06), 0.072,0.066,6,P.palm,
         {capA:{hex:P.palm}, capB:{hex:P.palm}});
    /* forearm tuft quads (shaggy) */
    for(const [dy,len] of [[0.0,0.07],[-0.06,0.06]]){
      const base=E.clone().add(V(0.02,dy,-0.04));
      quad(base, base.clone().add(V(0.04,len,-0.03)), base.clone().add(V(0.07,len*0.5,-0.05)), base, P.furDk, 0.08);
    }

    /* left arm -> LONG hang, big splayed paw near the knee (knuckles at knee height) */
    const S2=hunch(V(-L.shoulderX, L.shldY-0.02, 0.02));
    const E2=V(-0.440, 0.78, 0.09);
    const W2=V(-0.420, 0.44, 0.14);                          // wrist drops near knee level (~0.40)
    tube(S2,E2,0.105,0.084,6,P.fur);
    tube(E2,W2,0.082,0.062,6,P.furDk);
    bigPaw(W2, V(-0.10,-0.55,1), P.palm);
    for(const [dy,len] of [[0.0,0.07],[-0.07,0.06]]){
      const base=E2.clone().add(V(-0.02,dy,-0.03));
      quad(base, base.clone().add(V(-0.04,len,-0.03)), base.clone().add(V(-0.07,len*0.5,-0.05)), base, P.fur, 0.08);
    }
  }

  /* ---------- LEGS — thick, bent in a hunched crouch, BIG FLAT FEET planted wide. ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.02), kneeL=V(-0.235,0.42,0.15), ankL=V(-0.215,0.075,0.06);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.250,0.42,0.11), ankR=V( 0.230,0.075,0.02);
    tube(hipL,kneeL,0.130,0.095,6,P.fur);
    tube(kneeL,ankL,0.090,0.066,6,P.furDk);
    tube(hipR,kneeR,0.130,0.095,6,P.fur);
    tube(kneeR,ankR,0.090,0.066,6,P.furDk);
    /* BIG FLAT FEET — broad low foot slabs with splayed clawed toes */
    for(const [ank,toeDir] of [[ankL,V(-0.10,0,1)], [ankR,V(0.10,0,1)]]){
      const d=toeDir.clone().normalize();
      const heel=V(ank.x,0.048,ank.z);
      // wide flat foot slab
      tube(heel.clone().addScaledVector(d,-0.02), heel.clone().addScaledVector(d,0.150), 0.078,0.058,6,P.palm,
           {raz:0.070, rbz:0.048, capA:{hex:P.furDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.140).addScaledVector(side, off*0.048);
        const tt=tb.clone().addScaledVector(d,0.045).addScaledVector(side, off*0.008);
        tube(tb, tt, 0.020,0.007,4,P.palm,{capB:{hex:P.claw, lift:0.005}});
      }
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
