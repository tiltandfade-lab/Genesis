/* dev/model-qa/creatures/npc-bandit.js — MODEL-FOUNDRY REBUILD (rebuild-w1, cell 6).
   FEATURE CHECKLIST (the tris this budget buys):
     1. drawn KNIFE — bright steel blade leading the whole silhouette forward (the value-contrast zone)
     2. off-hand GRAB — open claw-fingers reaching low, the "other hand grabbing" half of the read
     3. face-scarf band across the nose/mouth (dark, proud-of-face cloth)
     4. low hood/cap pulled forward over the brow (the scarf+hood signature pairing)
     5. asymmetric ambush-lunge stance — front leg driven forward and low, back leg trailing/extended
     6. scrappy cloth/leather kit (jerkin+shirt+trousers) — deliberately drab vs a steel-armored veteran
   POSE SENTENCE: mid-lunge into an ambush — weight thrown low and forward onto the front leg, the
   knife hand driving out ahead of the body, the off hand clawed and grabbing for a collar/wrist,
   head down and locked on the target. Not a ready-crouch: a COMMITTED strike, already in motion.
   Human proportions carried from humanoid.js (head-top ~1.475 at rest); this rig SHEARS the torso
   forward band-by-band (cz increases hip->neck) rather than a full pitch-transform, cheaper and
   reads identically at this scale. Whole-object grammar: one function, probe-lib primitives, spine
   +z, ground y=0, no anchors. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildBandit(){
  /* ---------- PALETTE (VS desaturated: dirty leather/canvas, no fine trims — the veteran wears
     steel plate, this one wears cloth) ---------- */
  const P = {
    jerkin:0x5a4a34, jerkinDk:0x413425, shirt:0x7a7160, shirtDk:0x554e42,
    scarf:0x2e2a24, scarfDk:0x201d19,
    cap:0x453824, capDk:0x2f2618,
    skin:0xb08a5f, skinDk:0x7a5d3f, eye:0x1a1512,
    trouser:0x433c2e, boot:0x2a2117,
    steel:0x9aa1a6, steelLt:0xc4cace, steelDk:0x656a6e, hilt:0x2f2618, hiltWrap:0x5c4832,
    disc:0x4a4038, discTop:0x585047,
  };
  /* PASS-2 CRITIC FIX: P.trouser (0x433c2e, luminance ~60) sat almost exactly on top of P.disc
     (~65) and P.boot (0x2a2117) was darker than the void-adjacent read floor — the whole lunge
     stance (both legs + the base) melted into one undifferentiated dark blob at 1/3-res+dither,
     so the "asymmetric ambush lunge" pose (the entire point of this rebuild) did not read at all.
     Lifted both legwear tones clear of the disc value, and added a lit leather knee-wrap on the
     FRONT (driving) knee below as the pose's own high-value zone — the same "put light where the
     feature is" move the knife tip already uses. */
  P.trouser = 0x6b5c40; P.boot = 0x453922;
  P.kneeWrap = 0x9a7a4a; P.kneeWrapDk = 0x6e5734;

  /* ---------- LANDMARKS — humanoid.js rig, dropped + z-sheared band-by-band for the forward
     lunge lean (each higher band sits further forward than the one below it) ---------- */
  const L = {
    hipY:0.605, waistY:0.685, ribY:0.775, chestY:0.865, shldY:0.940, neckY:0.975,
    hipZ:0.0,   waistZ:0.020, ribZ:0.045, chestZ:0.075, shldZ:0.100, neckZ:0.110,
    hipHalf:0.125, shoulderX:0.245,
    jawY:1.010, cheekY:1.080, browY:1.150, crownY:1.235, headTopY:1.295,
    jawZ:0.108, cheekZ:0.106, browZ:0.100, crownZ:0.085, headTopZ:0.070,
  };

  /* ================= THE KNIFE — authored FIRST, LEADING the lunge (blade forward-low, the
     bright value-contrast zone) ====================================================== */
  const GRIP = V(0.345, 0.780, 0.335);
  const KNIFE_DIR = V(0.24, -0.06, 1.0).normalize();   // blade drives forward-and-slightly-down
  {
    const d = KNIFE_DIR, up = Math.abs(d.y)>0.9?V(0,0,1):V(0,1,0);
    const gu = new THREE.Vector3().crossVectors(up,d).normalize();
    const gv = new THREE.Vector3().crossVectors(d,gu).normalize();
    const pommel = GRIP.clone().addScaledVector(d,-0.062);
    tube(pommel, GRIP.clone().addScaledVector(d,-0.015), 0.017,0.015,6,P.hiltWrap,{capA:{hex:P.hilt,lift:0.010}});
    const guardC = GRIP.clone().addScaledVector(d,0.014);
    tube(guardC.clone().addScaledVector(gu,-0.040), guardC.clone().addScaledVector(gu,0.040), 0.011,0.011,5,P.steelDk,{capA:{hex:P.steelDk},capB:{hex:P.steelDk}});
    const bl=(t,w,th)=>{ const c=GRIP.clone().addScaledVector(d,0.03+t);
      return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.0,0.032,0.009), s2=bl(0.10,0.024,0.006), s3=bl(0.19,0.007,0.002);
    stitch([s1,s2], ()=>P.steel);
    stitch([s2,s3], ()=>P.steelLt);      // the tip catches the light — the single loud bright zone
    capFan(s3, GRIP.clone().addScaledVector(d,0.20), P.steelLt);
  }

  /* trunk (one loft, hips->neck, z-sheared forward) — shirt underneath, jerkin band from waist up */
  stack([
    {y:L.hipY,   rx:0.190, rz:0.145, cz:L.hipZ,   hex:P.trouser},
    {y:L.waistY, rx:0.165, rz:0.128, cz:L.waistZ, hex:P.shirtDk},
    {y:L.ribY,   rx:0.192, rz:0.145, cz:L.ribZ,   hex:P.shirt},
    {y:L.chestY, rx:0.215, rz:0.158, cz:L.chestZ, hex:P.jerkin},
    {y:L.shldY,  rx:0.220, rz:0.150, cz:L.shldZ,  hex:P.jerkin},
    {y:L.neckY,  rx:0.082, rz:0.078, cz:L.neckZ,  hex:P.shirtDk},
  ], 8, {capTop:{hex:P.shirtDk, lift:0.004}});

  /* LEATHER JERKIN — sleeveless overlayer band, open at the shirt collar, stitched edge (a second
     slightly wider loft proud of the trunk), z-sheared with the torso */
  stack([
    {y:L.waistY+0.01, rx:0.178, rz:0.138, cz:L.waistZ+0.010, hex:P.jerkinDk},
    {y:L.ribY+0.01,   rx:0.205, rz:0.155, cz:L.ribZ+0.010,   hex:P.jerkin},
    {y:L.chestY+0.01, rx:0.228, rz:0.168, cz:L.chestZ+0.010, hex:P.jerkin},
    {y:L.shldY-0.02,  rx:0.230, rz:0.158, cz:L.shldZ+0.005,  hex:P.jerkinDk},
  ], 8, {});
  // crude cross-lacing up the jerkin front (short diagonal quad "stitches")
  for(let k=0;k<3;k++){
    const y0=L.waistY+0.03+k*0.065, y1=y0+0.048, z0=L.waistZ+0.155+k*0.010, z1=L.chestZ+0.155+k*0.006;
    quad(V(-0.03,y0,z0), V(0.03,y0+0.02,z0+0.003), V(0.02,y1,z1), V(-0.04,y1-0.02,z1-0.003), P.scarfDk, 0.05);
  }

  /* belt (plain, worn) */
  stack([
    {y:L.hipY+0.05, rx:0.185, rz:0.142, cz:L.hipZ+0.010, hex:P.scarfDk},
    {y:L.hipY+0.09, rx:0.183, rz:0.140, cz:L.hipZ+0.012, hex:P.scarf},
  ], 8, {});

  /* head (skin loft; nose pushed; eyes painted, locked forward on the target). FRONT (+z) verts
     of this ring are 1 & 2 — house eye standard copied EXACTLY from humanoid.js. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.080, rz:0.086, cz:L.jawZ,   hex:P.skin},
      {y:L.cheekY, rx:0.110, rz:0.106, cz:L.cheekZ, hex:P.skin},
      {y:L.browY,  rx:0.114, rz:0.104, cz:L.browZ,  hex:P.skin},
      {y:L.crownY, rx:0.088, rz:0.080, cz:L.crownZ, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.022;           /* nose ridge on the front verts */
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, L.headTopZ), P.skinDk);
  }

  /* FACE SCARF — dark band across the lower face (nose-bridge down to under the jaw), covering
     nose/mouth, sitting BELOW the eyes, proud of the face surface so it reads as cloth. Signature
     element #1. */
  {
    const n=8, ph=Math.PI/n;
    const scarfBands=[
      {y:L.jawY-0.055,  rx:0.090, rz:0.096, cz:L.jawZ-0.004},
      {y:L.jawY+0.010,  rx:0.088, rz:0.094, cz:L.jawZ+0.002},
      {y:L.cheekY-0.040,rx:0.114, rz:0.110, cz:L.cheekZ-0.002},
    ];
    const faceCols=[0,1,2,3];  // wide +z-ish front arc — wraps most of the lower face
    const rings=scarfBands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    for(const r of rings) for(const i of faceCols) r[i].z += 0.032;   // push proud of the face
    for(let b=0;b<rings.length-1;b++){
      for(const i of faceCols){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], b===0?P.scarfDk:P.scarf, 0.04);
      }
    }
    // top edge cap so the scarf's upper rim reads as a clean band-edge, not open geometry
    for(const i of faceCols){
      const i2=(i+1)%n;
      quad(rings[2][i], rings[2][i2], rings[2][i2].clone().add(V(0,0.012,0)), rings[2][i].clone().add(V(0,0.012,0)), P.scarfDk, 0.03);
    }
    // a knot/tail hanging down past the jaw where the scarf ties off
    const knot=V(0.115, L.jawY-0.015, L.jawZ+0.030);
    tube(knot, knot.clone().add(V(0.02,-0.07,-0.015)), 0.013,0.008,5,P.scarfDk,{capB:{hex:P.scarfDk}});
  }

  /* HOOD/CAP — a low peaked hood-cap pulled forward over the brow, hanging past the scarf-knot
     so scarf+hood read as one paired signature (drab, cheaper silhouette than the rogue's full
     cloak-hood). Signature element #2. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.browY+0.030,   rx:0.126, rz:0.120, cz:L.browZ+0.014},
      {y:L.crownY+0.015,  rx:0.100, rz:0.092, cz:L.crownZ+0.006},
      {y:L.headTopY+0.015,rx:0.058, rz:0.050, cz:L.headTopZ-0.004},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=> b===0?P.cap:P.capDk);
    capFan(rings.at(-1), V(0,L.headTopY+0.05,L.headTopZ-0.01), P.capDk);
    // a floppy fold at the back (cheap-cap character detail)
    const foldA=V(0.07,L.crownY+0.03,L.crownZ-0.09), foldB=V(0.11,L.crownY-0.02,L.crownZ-0.13);
    tube(foldA, foldB, 0.028,0.014,5,P.capDk,{capB:{hex:P.capDk}});
    // the forward peak — the hood-brim shading the eyes, the "pulled forward" tell
    const peakA=V(0.0, L.browY+0.045, L.browZ+0.030), peakB=V(0.0, L.browY+0.010, L.browZ+0.075);
    tube(peakA, peakB, 0.070,0.030,6,P.capDk,{capB:{hex:P.capDk}});
  }

  /* ARMS — the whole pose lives here. RIGHT hand DERIVED from the knife grip, driven forward and
     low, leading the lunge. LEFT hand is the GRAB: reaching forward too, lower + more central,
     fingers splayed open in a clawed grasp (not a fist). */
  {
    // knife arm: shoulder -> elbow (driven out ahead of the shoulder) -> wrist at the grip
    const S=V(L.shoulderX, L.shldY-0.01, L.shldZ);
    const E=V(0.375, 0.700, 0.230);
    const W=GRIP.clone().addScaledVector(KNIFE_DIR,-0.02);
    tube(S,E,0.074,0.058,6,P.jerkin);
    tube(E,W,0.054,0.044,6,P.shirtDk,{capB:{hex:P.skin}});
    tube(GRIP.clone().addScaledVector(KNIFE_DIR,-0.045), GRIP.clone().addScaledVector(KNIFE_DIR,0.03), 0.044,0.040,6,P.skin,{capA:{hex:P.skinDk},capB:{hex:P.skinDk}});

    // grab arm: shoulder -> elbow -> wrist reaching forward-low, clawed fingers
    const S2=V(-L.shoulderX, L.shldY-0.01, L.shldZ), E2=V(-0.245,0.700,0.235), W2=V(-0.095,0.555,0.360);
    tube(S2,E2,0.074,0.058,6,P.jerkin);
    tube(E2,W2,0.054,0.042,6,P.shirtDk,{capB:{hex:P.skin}});
    const HDIR=V(0.35,-0.30,0.90).normalize();
    // palm block
    tube(W2, W2.clone().addScaledVector(HDIR,0.045), 0.034,0.032,6,P.skin,{capA:{hex:P.skin}});
    // 3 clawed splayed fingers off the palm — the "grabbing" tell
    const palmTip=W2.clone().addScaledVector(HDIR,0.045);
    const spread=[V(-0.03,0.012,0.02), V(0.0,0.020,0.03), V(0.03,0.010,0.02)];
    for(const off of spread){
      const fa=palmTip.clone().add(off);
      const fb=fa.clone().addScaledVector(HDIR,0.045).add(V(0,-0.012,0));
      tube(fa, fb, 0.012,0.007,4,P.skinDk,{capB:{hex:P.skinDk}});
    }
  }

  /* LEGS — asymmetric ambush lunge: RIGHT leg driven forward and low (the knife-side leg steps
     into the strike), LEFT leg trailing back and extended (the push-off leg). Wide low base for
     weight-thrown-forward stability, no braced/symmetric stance. */
  {
    // front (right) leg — deep forward bend, low knee, foot planted well forward
    const hipR=V( L.hipHalf, L.hipY-0.01, L.hipZ), kneeR=V( 0.235, 0.290, 0.235), ankR=V( 0.190, 0.055, 0.335);
    tube(hipR,kneeR,0.088,0.062,6,P.trouser);
    tube(kneeR,ankR,0.058,0.042,6,P.trouser);
    // lit leather knee-wrap on the front (driving) knee — the pose's own high-value zone, so the
    // lunge's lead joint pops clear of the disc/void instead of melting into shadow (PASS-2 fix)
    tube(kneeR.clone().addScaledVector(V(1,1.4,0.4).normalize(),-0.028),
         kneeR.clone().addScaledVector(V(1,1.4,0.4).normalize(),0.030),
         0.068,0.066,6,P.kneeWrap,{capA:{hex:P.kneeWrapDk},capB:{hex:P.kneeWrapDk}});

    // back (left) leg — trails behind, more extended, pushing off
    const hipL=V(-L.hipHalf, L.hipY-0.01, L.hipZ-0.01), kneeL=V(-0.185, 0.220, -0.155), ankL=V(-0.150, 0.040, -0.360);
    tube(hipL,kneeL,0.086,0.060,6,P.trouser);
    tube(kneeL,ankL,0.056,0.038,6,P.trouser);

    for(const [ank,toeDir,tag] of [[ankR,V(0.20,0,1).normalize(),'front'], [ankL,V(-0.25,0,-1).normalize(),'back']]){
      stack([
        {y:0.012, rx:0.066, rz:0.074, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.090, rx:0.058, rz:0.060, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.048,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.12), 0.052,0.038,6,P.boot, {capB:{hex:P.boot, lift:0.013}, raz:0.044, rbz:0.030});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
