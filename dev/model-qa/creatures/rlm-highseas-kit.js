/* dev/model-qa/creatures/rlm-highseas-kit.js — the HIGH-SEAS REALM KIT (age of sail).
   Shared sailor substrate per BLENDER-MODEL-SPEC §6 kit grammar + REALM-MODEL-PLAN §high-seas:
   one sailor torso (loose sailcloth shirt + broad waist sash), swappable heads (bandana, tricorn,
   hood via parts.js), kit pieces (cutlass, boarding harpoon, captain's coat overlay), and the
   DROWNED channel treatment (brine-pale skin + kelp-dark cloth + streamers) for the ghost-crew line.
   Whole-object law holds: every part draws into the ONE current geometry frame (probe-lib POS/COL);
   figures are composed by the thin rlm-hs-* variant modules. Palette = the §4.2 high-seas key,
   authored HOT because the 0.85-sat / #3c7888-tint grade halves chroma. Refs brief:
   dev/model-qa/refs-highseas-NOTES.md (Pyle plates / MET tricorne / RMG captain / Ryder Dutchman). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { humanoidRig, buildHead, buildHood, buildBase } from '../parts.js';
export { humanoidRig, buildHead, buildHood, buildBase };

/* ---------- the high-seas palette (BLENDER-MODEL-SPEC §4.2, plus figure atoms) ---------- */
export const HS_P = {
  tar:0x2c2a26, tarDk:0x1e1c19,
  sailcloth:0xd0c6a8, sailclothDk:0x9a9078,
  oak:0x7a5f3e, oakDk:0x5a462e,
  navy:0x2e3a56, navyDk:0x202a40, navyLt:0x3e4c6e,
  teal:0x3c7888, tealDk:0x2a5560,
  hemp:0xa89060, hempDk:0x7a683f,
  brass:0xb08d46, blood:0xa3241e,
  skin:0xc49a72, skinDk:0x8a6a4e,
  steel:0x9aa1a6, steelDk:0x6b7176,
  boot:0x3c3226,
  disc:0x4a4038, discTop:0x585047,
};

/* ---------- the DROWNED channel: the same kit gone waterlogged (Ryder read: value + slump).
   Brine-pale grey-green skin, cloth sunk to kelp tones, sash rotted to sodden teal. A variant
   passes this OVER HS_P so every kit part recolors without re-authoring geometry. ---------- */
export const HS_DROWNED_P = Object.assign({}, HS_P, {
  skin:0x8fa08b, skinDk:0x5e6f5c,
  sailcloth:0x6f7a68, sailclothDk:0x4d5848,
  blood:0x466054,                    // the sash rotted to sodden teal-grey
  hemp:0x6e7458, hempDk:0x4c543e,
  boot:0x2e332b,
  kelp:0x3c5844, kelpDk:0x2a4032, barnacle:0xb0aa96,
});

/* =========================================================================================
   SAILOR TORSO — loose sailcloth shirt (billowed chest/shoulders), broad waist SASH (the
   identity mass: proud radius + hot accent + knot tail), wide petticoat slops to MID-CALF.
   `opts.lean` (fn p=>p) re-poses the whole trunk as a unit (the drowned slump).
   `opts.sashHex` overrides the sash accent (blood default). Draws hips→neck + slops.
   ========================================================================================= */
export function buildSailorTorso(L, P, opts = {}){
  const xf = opts.lean || (p=>p);
  const sash = opts.sashHex ?? P.blood;
  /* shirt trunk — billowed at chest/shoulders (bigger radii than the fighter's tunic) */
  stack([
    {y:L.hipY,   rx:0.190, rz:0.150, hex:P.sailclothDk},
    {y:L.waistY, rx:0.165, rz:0.130, hex:P.sailcloth},
    {y:L.ribY,   rx:0.215, rz:0.160, hex:P.sailcloth},
    {y:L.chestY, rx:0.245, rz:0.175, hex:P.sailcloth},
    {y:L.shldY,  rx:0.240, rz:0.160, hex:P.sailcloth},
    {y:L.neckY,  rx:0.085, rz:0.080, hex:P.sailclothDk},
  ], 8, {capTop:{hex:P.sailclothDk, lift:0.005}, xform:xf});
  /* the SASH — wrapped broad waist-to-hip, proud of the shirt */
  stack([
    {y:L.hipY-0.015, rx:0.200, rz:0.158, hex:sash},
    {y:L.waistY+0.02, rx:0.188, rz:0.148, hex:sash},
  ], 8, {xform:xf});
  /* sash knot + trailing tail on the left hip */
  const kn = xf(V(-0.185, L.hipY+0.01, 0.06));
  blob(kn.x, kn.y, kn.z, 0.038, 0.032, 0.034, sash, 5, 3);
  const t1=xf(V(-0.200, L.hipY-0.02, 0.055)), t2=xf(V(-0.215, 0.52, 0.070)), t3=xf(V(-0.185, 0.50, 0.045));
  quad(t1, xf(V(-0.165, L.hipY-0.02, 0.075)), t3, t2, sash, 0.05);
  /* petticoat slops — a pale bell, hip to MID-CALF (thin ankles below = the Pyle silhouette) */
  stack([
    {y:0.30, rx:0.225, rz:0.185, hex:P.sailclothDk},
    {y:0.48, rx:0.205, rz:0.165, hex:P.sailcloth},
    {y:0.66, rx:0.185, rz:0.148, hex:P.sailcloth},
    {y:L.hipY, rx:0.175, rz:0.140, hex:P.sailclothDk},
  ], 8, {xform:xf});
}

/* ---------- bare calves + flat shoes below the slops (stance via ankle offsets) ---------- */
export function buildSailorLegs(P, opts = {}){
  const xf = opts.lean || (p=>p);
  const ankL = opts.ankL || V(-0.145, 0.06, 0.02);
  const ankR = opts.ankR || V( 0.155, 0.06, -0.04);
  const calfHex = opts.calfHex ?? P.skin;      // bare calf (deckhand); boots for the captain
  for(const [ank, toeDir] of [[ankL, opts.toeL || V(0.05,0,1)], [ankR, opts.toeR || V(0.55,0,0.8).normalize()]]){
    const knee = xf(V(ank.x*1.05, 0.335, ank.z*0.5+0.015));
    tube(knee, xf(V(ank.x, 0.10, ank.z)), 0.052, 0.040, 6, calfHex);
    /* flat shoe */
    const a = xf(V(ank.x, 0.05, ank.z)), d = toeDir.clone().normalize();
    stack([
      {y:0.012, rx:0.060, rz:0.066, cx:a.x, cz:a.z, hex:P.boot},
      {y:0.095, rx:0.050, rz:0.052, cx:a.x, cz:a.z, hex:P.boot},
    ], 6, {capTop:{hex:P.boot, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
    tube(V(a.x, 0.045, a.z), V(a.x, 0.045, a.z).addScaledVector(d, 0.115), 0.048, 0.036, 6, P.boot,
         {capB:{hex:P.boot, lift:0.012}, raz:0.040, rbz:0.028});
  }
}

/* =========================================================================================
   HEADS
   ========================================================================================= */
/* BANDANA — skin head + a bright skull-dome + trailing knot tail at the nape (-z). */
export function buildBandanaHead(L, P, opts = {}){
  const xf = opts.xform || (p=>p);
  const bandana = opts.bandanaHex ?? P.blood;
  const bandanaDk = opts.bandanaDkHex ?? P.tarDk;
  buildHead(L, P, {xform:xf});
  const n=8, ph=Math.PI/n;
  const bands=[
    {y:L.browY+0.012, rx:0.122, rz:0.112, hex:bandana},
    {y:L.crownY+0.01, rx:0.096, rz:0.088, hex:bandana},
  ];
  const rings=bands.map(b=>ring(V(0,b.y,0.008), V(0,1,0), b.rx, b.rz, n, ph).map(p=>xf(p.clone())));
  stitch(rings, b=>bands[b].hex);
  capFan(rings[1], xf(V(0, L.headTopY+0.012, 0.002)), bandana);
  /* knot + tail at the nape */
  const kb = xf(V(0, L.browY+0.02, -0.115));
  blob(kb.x, kb.y, kb.z, 0.028, 0.024, 0.024, bandanaDk, 4, 3);
  quad(xf(V(-0.020, L.browY+0.01, -0.125)), xf(V(0.020, L.browY+0.01, -0.125)),
       xf(V(0.028, L.jawY-0.02, -0.150)),  xf(V(-0.028, L.jawY-0.02, -0.150)), bandana, 0.05);
}

/* TRICORN — skin head + the three-point brim plate (point FORWARD +z, mids folded UP, pale
   braid rim) + a shallow crown. The brim IS the hat at mini scale (MET DP-642-001 read). */
export function buildTricornHead(L, P, opts = {}){
  const xf = opts.xform || (p=>p);
  buildHead(L, P, {xform:xf});
  const y0 = L.browY + 0.030;
  /* star ring: 3 far points (front +z, rear-left, rear-right) alternating with 3 lifted mids */
  const far = 0.205, mid = 0.130, lift = 0.055;
  const angs = [90, 150, 210, 270, 330, 30];            // degrees, +z at 90°
  const outer = angs.map((a,i)=>{
    const r = (i%2===0) ? far : mid, t = a*Math.PI/180;
    return xf(V(Math.cos(t)*r, y0 + ((i%2===0)?0.008:lift), Math.sin(t)*r));
  });
  const inner = angs.map((a,i)=>{
    const r = ((i%2===0) ? far : mid)*0.78, t = a*Math.PI/180;
    return xf(V(Math.cos(t)*r, y0 + ((i%2===0)?0.002:lift*0.72), Math.sin(t)*r));
  });
  stitch([outer, inner], ()=>P.hemp);                    // the pale braid rim wall
  capFan(inner, xf(V(0, y0+0.030, 0)), P.tar);           // brim top
  capFan(outer, xf(V(0, y0-0.012, 0)), P.tarDk, true);   // brim underside
  /* shallow crown */
  stack([
    {y:y0+0.020, rx:0.098, rz:0.092, hex:P.tar},
    {y:L.headTopY+0.035, rx:0.082, rz:0.078, hex:P.tar},
  ], 8, {capTop:{hex:P.tarDk, lift:0.008}, xform:xf});
}

/* =========================================================================================
   KIT PIECES
   ========================================================================================= */
/* CUTLASS — the BOWL GUARD at the fist is the identifier; short broad shallow-sweep blade.
   Authored from `grip` along `dir` (normalized inside). Returns the grip for arm derivation. */
export function buildCutlass(grip, dir, P){
  const D = dir.clone().normalize();
  const up = Math.abs(D.y) > 0.9 ? V(0,0,1) : V(0,1,0);
  const gu = new THREE.Vector3().crossVectors(up, D).normalize();   // blade-width dir
  const gv = new THREE.Vector3().crossVectors(D, gu).normalize();   // curve/thickness dir
  /* grip wrap behind the fist */
  const butt = grip.clone().addScaledVector(D, -0.070);
  tube(butt, grip.clone().addScaledVector(D, 0.030), 0.016, 0.016, 6, P.oakDk, {capA:{hex:P.brass, lift:0.015}});
  /* the bowl guard — a steel knuckle-bowl swallowing the fist */
  const gc = grip.clone().addScaledVector(D, 0.020).addScaledVector(gv, -0.020);
  blob(gc.x, gc.y, gc.z, 0.062, 0.052, 0.058, P.steelDk, 6, 3);
  /* blade: broad, short, slight sweep via gv offsets on the far sections */
  const g0 = grip.clone().addScaledVector(D, 0.055);
  const sec = (t, w, th, sway)=>{
    const c = g0.clone().addScaledVector(D, t).addScaledVector(gv, sway);
    return [c.clone().addScaledVector(gu, w), c.clone().addScaledVector(gv, th),
            c.clone().addScaledVector(gu, -w), c.clone().addScaledVector(gv, -th)];
  };
  const s1 = sec(0.02, 0.045, 0.009, 0.0);
  const s2 = sec(0.24, 0.050, 0.008, 0.020);
  const s3 = sec(0.40, 0.038, 0.006, 0.048);
  stitch([s1, s2, s3], ()=>P.steel);
  capFan(s3, g0.clone().addScaledVector(D, 0.475).addScaledVector(gv, 0.070), P.steel);
  return grip.clone();
}

/* BOARDING HARPOON — a 7-ft oak shaft + steel barbed head; doubles as the sea-priest totem.
   Authored bottom→top at (x, z), vertical. Returns {low, high} grip points on the shaft. */
export function buildHarpoon(x, z, P, opts = {}){
  const yBot = opts.yBot ?? 0.06, yTop = opts.yTop ?? 1.62;
  tube(V(x, yBot, z), V(x, yTop, z), 0.020, 0.016, 6, P.oak, {capA:{hex:P.oakDk, lift:0.01}});
  /* steel head: a socket + tapering point */
  tube(V(x, yTop, z), V(x, yTop+0.06, z), 0.022, 0.018, 6, P.steelDk);
  const headRing = ring(V(x, yTop+0.06, z), V(0,1,0), 0.020, 0.020, 6, 0);
  capFan(headRing, V(x, yTop+0.20, z), P.steel);
  /* two swept barbs */
  for(const s of [-1, 1]){
    quad(V(x, yTop+0.055, z+s*0.012), V(x, yTop+0.095, z+s*0.012),
         V(x+0.020*s, yTop+0.020, z+s*0.055), V(x+0.020*s, yTop+0.000, z+s*0.050), P.steel, 0.03);
  }
  /* hemp lashing under the socket */
  stack([
    {y:yTop-0.075, rx:0.024, rz:0.024, cx:x, cz:z, hex:P.hemp},
    {y:yTop-0.020, rx:0.024, rz:0.024, cx:x, cz:z, hex:P.hemp},
  ], 6, {});
  return { low: V(x, 0.78, z), high: V(x, 1.12, z) };
}

/* CAPTAIN'S COAT OVERLAY — knee-length navy coat hanging OPEN: dark frame around a pale
   waistcoat column (the RMG value read), brass button dots, flared tails behind the legs.
   Draw AFTER the torso (it wraps it). Front gap = skip columns 0-2 (+z arc). */
export function buildCaptainCoat(L, P){
  const n=8, ph=Math.PI/n;
  /* coat body shoulders→hip — FULL ring; the open front is painted, not gapped: front columns
     (the +z arc, cols 1-2 at phase π/8) read as the pale waistcoat, everything else navy. This
     keeps the dark frame visible from EVERY angle (round-1 taste gate: the geometry-gap version
     showed the pale under-trunk across the whole front and the coat vanished). */
  const FRONT = [1, 2];
  const bands=[
    {y:L.hipY-0.02, rx:0.215, rz:0.170, hex:P.navy},
    {y:L.ribY,      rx:0.235, rz:0.180, hex:P.navy},
    {y:L.chestY,    rx:0.262, rz:0.190, hex:P.navy},
    {y:L.shldY+0.01,rx:0.258, rz:0.175, hex:P.navyLt},
  ];
  const rings=bands.map(b=>ring(V(0,b.y,0.006), V(0,1,0), b.rx, b.rz, n, ph));
  stitch(rings, (b,i)=> FRONT.includes(i) ? P.sailcloth : bands[b].hex);
  /* brass button dots down the lapel boundaries of the pale column */
  for(const s of [-1,1]) for(const y of [L.ribY+0.02, L.chestY, L.chestY+0.10])
    quad(V(s*0.100,y,0.185), V(s*0.062,y,0.195), V(s*0.062,y-0.024,0.193), V(s*0.100,y-0.024,0.183), P.brass, 0.02);
  /* white stock at the throat */
  quad(V(-0.038, L.neckY+0.005, 0.085), V(0.038, L.neckY+0.005, 0.085),
       V(0.030, L.shldY-0.005, 0.175), V(-0.030, L.shldY-0.005, 0.175), 0xe8e2d0, 0.02);
  /* coat tails — flared skirt hip→knee; front columns painted as the pale breech column */
  const tail=[
    {y:0.40, rx:0.240, rz:0.195, hex:P.navyDk},
    {y:0.56, rx:0.220, rz:0.180, hex:P.navy},
    {y:L.hipY-0.015, rx:0.195, rz:0.158, hex:P.navy},
  ];
  const tr=tail.map(b=>ring(V(0,b.y,-0.015), V(0,1,0), b.rx, b.rz, n, ph));
  stitch(tr, (b,i)=> FRONT.includes(i) ? P.sailclothDk : tail[b].hex);
  /* baldric — the diagonal rank strap across the chest (cheapest distance signal), proud of
     the coat shell (round-1: at z≈0.178 it sank beneath the full-ring coat and vanished) */
  const bd=(t)=>V(-0.16+(0.30*t), L.shldY+0.02-(0.36*t), 0.200+0.014*Math.sin(t*Math.PI));
  for(let k=0;k<4;k++){
    const a=bd(k/4), b=bd((k+1)/4);
    quad(V(a.x-0.022,a.y,a.z), V(a.x+0.022,a.y,a.z), V(b.x+0.022,b.y,b.z), V(b.x-0.022,b.y,b.z), P.oakDk, 0.03);
  }
}

/* KELP STREAMER — a hanging tapered rag of kelp (the drowned dressing). from → down. */
export function buildKelpStreamer(from, len, P, opts = {}){
  const sway = opts.sway ?? 0.03, w = opts.w ?? 0.024;
  const kelp = opts.hex ?? P.kelp ?? 0x3c5844;
  const a=from, b=V(from.x+sway, from.y-len*0.55, from.z+sway*0.4), c=V(from.x+sway*0.3, from.y-len, from.z+sway);
  quad(V(a.x-w,a.y,a.z), V(a.x+w,a.y,a.z), V(b.x+w*0.7,b.y,b.z), V(b.x-w*0.7,b.y,b.z), kelp, 0.06);
  quad(V(b.x-w*0.7,b.y,b.z), V(b.x+w*0.7,b.y,b.z), V(c.x+w*0.3,c.y,c.z), V(c.x-w*0.3,c.y,c.z),
       opts.hexDk ?? P.kelpDk ?? 0x2a4032, 0.06);
}

/* SAILOR ARM — shoulder→elbow→wrist with shirt sleeve + bare forearm, ending in a fist nub.
   Kept here so all four variants share one arm voice. */
export function buildSailorArm(shoulder, elbow, wrist, P, opts = {}){
  tube(shoulder, elbow, opts.upR ?? 0.075, 0.060, 6, opts.sleeveHex ?? P.sailcloth);
  tube(elbow, wrist, 0.052, 0.042, 6, opts.foreHex ?? P.skin, {capB:{hex:opts.foreHex ?? P.skin}});
}
export function buildFist(at, dir, P, hex){
  const D = dir.clone().normalize();
  tube(at.clone().addScaledVector(D,-0.045), at.clone().addScaledVector(D,0.045), 0.046, 0.042, 6,
       hex ?? P.skin, {capA:{hex:hex ?? P.skin}, capB:{hex:hex ?? P.skin}});
}
