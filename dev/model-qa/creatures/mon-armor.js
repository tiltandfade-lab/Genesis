/* dev/model-qa/creatures/mon-armor.js — the ANIMATED ARMOR: a haunted suit of plate mid-swing, with
   NOTHING inside. Whole-object grammar: one function, one geometry frame, no anchors. REBUILD
   (rebuild-w3): kept the palette intent + the void-gap signature, replaced the geometry for the
   wind-up pose.

   FEATURE CHECKLIST (what the budget buys):
   1. floating-plate FORMATION with dark void gaps at neck/waist/elbows/knees — the read is the
      EMPTINESS, not the steel.
   2. the great-helm's black vision-slit inside a bright brow rim — the contrast trick (void
      surrounded by the brightest steel on the model).
   3. longsword gripped two-handed, wound back over the RIGHT shoulder mid-swing (the blade is the
      loudest silhouette break, angled up-and-back past the helm).
   4. leading LEFT gauntlet, arm thrown forward and down across the body (the counter-weight to the
      wind-up — reads as a body torqued mid-strike).
   5. torqued stance: hips face forward, shoulders/ribcage rotated toward the swing, forward leg
      planted, back leg trailing — NOT at-attention.

   POSE SENTENCE: the suit has wound its blade back over its own shoulder, empty gauntlet thrown out
   in front for balance, hips already turning into the strike — caught a half-beat before it connects.

   Imported by mon-armor-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildAnimatedArmor(){
  /* ---------- PALETTE (dull steel with tarnish; the VOID is the star) ---------- */
  const P = {
    steel:0x7f858a, steelDk:0x565c61, steelDkr:0x3c4145,   // dull plate — lit, mid, shadow
    steelLt:0x9aa0a4, edge:0xb0b4b6,                        // catch-light on ridges/edges
    tarn:0x5a5236, tarnDk:0x40391f,                         // brown tarnish streaks + rivets
    brass:0x8a6f38,                                         // trim / buckle accents
    void:0x0a0b0d, voidCore:0x030304,                       // the HOLLOW — near-black recessed quads
    grip:0x2a2620, leather:0x3a3026,                        // sword grip; shield strap
    disc:0x33362f, discTop:0x40443a,
  };

  /* ---------- LANDMARKS — a torqued sentinel harness (~1.55u). The upper body (chest/shoulders/
     helm) is yawed toward the swing (+x, toward the right/sword shoulder) relative to the hips, so
     the whole formation reads as a body twisting into a strike. ------ */
  const L = {
    hipY:0.70, waistY:0.82, chestY:1.04, shldY:1.20, helmY:1.42,
    hipHalf:0.125, shoulderX:0.250, headTopY:1.60,
  };
  const TORSO_YAW = 0.30;              // upper body rotated toward the swing (about +y)
  const rotY = (p, a, cx=0, cz=0) => {
    const dx=p.x-cx, dz=p.z-cz, c=Math.cos(a), s=Math.sin(a);
    return V(cx+dx*c-dz*s, p.y, cz+dx*s+dz*c);
  };
  const T = p => rotY(p, TORSO_YAW);    // apply torso yaw to any torso/helm/shoulder point

  /* helper: a VOID PANEL — a near-black quad spanning a gap, recessed slightly so the darkness reads
     as hollow interior seen THROUGH the opening (not a solid black plate). Faces +z (camera), then
     yawed with the torso. */
  function voidGap(y0v, y1v, halfW, z, opts={}){
    const zr = z - (opts.recess ?? 0.05);
    const hx = halfW, hxT = opts.halfWTop ?? halfW;
    const tp = (x,y,zz) => T(V(x,y,zz));
    quad(tp(-hx,y0v,zr), tp(hx,y0v,zr), tp(hxT,y1v,zr), tp(-hxT,y1v,zr), opts.hex ?? P.void, 0.0);
    const cx = hx*0.6, cxT = hxT*0.6, zc = zr - 0.04;
    quad(tp(-cx,y0v+0.01,zc), tp(cx,y0v+0.01,zc), tp(cxT,y1v-0.01,zc), tp(-cxT,y1v-0.01,zc), P.voidCore, 0.0);
    quad(tp(-hx,y0v,z), tp(-hx,y0v,zr), tp(-hxT,y1v,zr), tp(-hxT,y1v,z), P.voidCore, 0.0);
    quad(tp(hx,y0v,zr), tp(hx,y0v,z), tp(hxT,y1v,z), tp(hxT,y1v,zr), P.voidCore, 0.0);
  }

  /* ===== LONGSWORD FIRST — gripped TWO-HANDED, wound back over the RIGHT shoulder mid-swing. Grip
     sits high behind the right shoulder, blade angled up-and-back past the helm — the loudest
     silhouette break on the model. ===== */
  const GRIP  = V(0.34, 1.36, -0.14);                       // behind + above the right shoulder
  const GRIP2 = V(0.20, 1.20, -0.10);                       // second (left) hand, lower on the grip
  const BLADE = V(0.18, 0.62, -0.76).normalize();            // wound back-and-up past the helm
  const POMMEL= GRIP2.clone().addScaledVector(BLADE,-0.14);
  {
    tube(POMMEL, GRIP2.clone().addScaledVector(BLADE,0.04), 0.022,0.022,6, P.grip, {capA:{hex:P.steelDk, lift:0.02}});
    tube(GRIP2.clone().addScaledVector(BLADE,0.04), GRIP.clone().addScaledVector(BLADE,0.02), 0.021,0.020,6, P.grip);
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE,0.05);
    // crossguard bar
    const gx=0.10, gy=0.015, gz=0.022;
    const cnr=(a,b,c)=>g0.clone().addScaledVector(gu,a*gx).addScaledVector(gv,b*gy).addScaledVector(BLADE,c*gz);
    quad(cnr(-1,-1,-1), cnr(1,-1,-1), cnr(1,1,-1), cnr(-1,1,-1), P.steelDk,0.04);
    quad(cnr(1,-1,1), cnr(-1,-1,1), cnr(-1,1,1), cnr(1,1,1), P.steelDk,0.04);
    quad(cnr(-1,-1,-1), cnr(-1,-1,1), cnr(1,-1,1), cnr(1,-1,-1), P.steel,0.04);
    quad(cnr(-1,1,-1), cnr(1,1,-1), cnr(1,1,1), cnr(-1,1,1), P.steelLt,0.04);
    quad(cnr(-1,-1,-1), cnr(-1,1,-1), cnr(-1,1,1), cnr(-1,-1,1), P.steel,0.04);
    quad(cnr(1,-1,-1), cnr(1,-1,1), cnr(1,1,1), cnr(1,1,-1), P.steel,0.04);
    // blade — cross-sections narrowing to a point, a pale glint line down the fuller
    const bl=(t,w,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,w), c.clone().addScaledVector(gv,th), c.clone().addScaledVector(gu,-w), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.03,0.044,0.012), s2=bl(0.38,0.038,0.010), s3=bl(0.68,0.028,0.008);
    stitch([s1,s2,s3], ()=>P.steel);
    capFan(s3, g0.clone().addScaledVector(BLADE,0.88), P.steelLt);
    const gl=(t)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,0.006), c.clone().addScaledVector(gv,0.013), c.clone().addScaledVector(gu,-0.006), c.clone().addScaledVector(gv,0.013)]; };
    stitch([gl(0.06), gl(0.8)], ()=>P.edge);
  }

  /* ===== CUIRASS — the breastplate torso, hips→shoulders, ending BELOW THE NECK (a neck gap above)
     and OPENING at the waist. Yawed toward the swing (torso torque). ===== */
  {
    const bands = [
      {y:L.chestY-0.10, rx:0.215, rz:0.155, hex:P.steelDk},
      {y:L.chestY,      rx:0.245, rz:0.175, hex:P.steel},
      {y:L.chestY+0.10, rx:0.235, rz:0.165, hex:P.steelLt},
      {y:L.shldY-0.02,  rx:0.205, rz:0.150, hex:P.steel},
    ];
    const n=8;
    const rs = bands.map(b => { const r=ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, 0); return r.map(T); });
    stitch(rs, (i)=>bands[i].hex);
    capFan(rs[rs.length-1].map(p=>V(p.x,p.y+0.005,p.z)), T(V(0,L.shldY-0.02+0.005,0)), P.steelDkr);
    // sternum ridge — a raised vertical catch-light band down the chest center
    quad(T(V(-0.022,L.chestY-0.09,0.170)), T(V(0.022,L.chestY-0.09,0.170)),
         T(V(0.026,L.chestY+0.11,0.178)), T(V(-0.026,L.chestY+0.11,0.178)), P.edge, 0.03);
    // a tarnish streak down one side of the chest
    quad(T(V(0.11,L.chestY-0.08,0.168)), T(V(0.15,L.chestY-0.08,0.166)),
         T(V(0.14,L.chestY+0.08,0.170)), T(V(0.10,L.chestY+0.08,0.172)), P.tarn, 0.04);
    // rivet row across the collarbone
    for(const rx of [-0.12,-0.04,0.04,0.12]){
      quad(T(V(rx-0.012,L.shldY-0.06,0.150)), T(V(rx+0.012,L.shldY-0.06,0.150)),
           T(V(rx+0.012,L.shldY-0.035,0.150)), T(V(rx-0.012,L.shldY-0.035,0.150)), P.tarnDk, 0.02);
    }
  }

  /* ===== THE NECK GAP — the star void: between the cuirass shoulder-yoke top and the floating helm,
     a band of HOLLOW DARKNESS where a neck should be. The helm hovers above it, torso-yawed. ===== */
  voidGap(L.shldY-0.03, L.helmY-0.11, 0.085, 0.13, {recess:0.06, halfWTop:0.075});
  { const r=ring(V(0,L.shldY-0.02,0), V(0,1,0), 0.11,0.095, 8, Math.PI/8).map(T);
    const r2=ring(V(0,L.shldY+0.02,0), V(0,1,0), 0.095,0.082, 8, Math.PI/8).map(T);
    stitch([r,r2], ()=>P.tarnDk); }

  /* ===== THE WAIST GAP — a second hollow band between the lower cuirass and the faulds (skirt).
     The upper body floats a hand's-width above the hips: pure void between. Torso-yawed. ===== */
  voidGap(L.hipY+0.10, L.chestY-0.135, 0.135, 0.145, {recess:0.055, halfWTop:0.155});

  /* ===== HELM — a full great-helm floating above the neck void, torso-yawed with the swing. A
     tapered barrel with a heavy BRIGHT brow rim framing a dark VOID VISION-SLIT (the contrast
     trick: void wrapped in the brightest steel on the model). ===== */
  {
    const n=8, ph=Math.PI/n, cy=L.helmY, cz=0.02;
    const bands=[
      {y:cy-0.11, rx:0.095, rz:0.100, hex:P.steelDk},    // jaw of the helm (narrower)
      {y:cy-0.02, rx:0.120, rz:0.118, hex:P.steel},      // cheek band
      {y:cy+0.07, rx:0.126, rz:0.117, hex:P.edge},       // heavy BRIGHT brow rim — frames the void
      {y:cy+0.15, rx:0.100, rz:0.092, hex:P.steel},      // crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph).map(T));
    stitch(rings, i=>bands[i].hex);
    capFan(rings[3], T(V(0, L.headTopY, cz-0.01)), P.steelDkr);
    capFan(rings[0], T(V(0, cy-0.15, cz)), P.steelDkr, true);   // close the underside (no neck inside)
    // crest ridge — a thin raised comb front-to-back over the crown
    { const cz0=cz-0.09, cz1=cz+0.09;
      quad(T(V(-0.012,cy+0.15,cz-0.06)), T(V(0.012,cy+0.15,cz-0.06)), T(V(0.012,cy+0.15,cz+0.06)), T(V(-0.012,cy+0.15,cz+0.06)), P.steelDk, 0.0);
      quad(T(V(0,cy+0.15,cz0)), T(V(0,cy+0.15,cz1)), T(V(0,cy+0.235,cz)), T(V(0,cy+0.235,cz)), P.tarn, 0.03); }
    // BROW SHADOW band just above the slit (deepens the contrast into the void)
    quad(T(V(-0.10,cy+0.048,cz+0.116)), T(V(0.10,cy+0.048,cz+0.116)),
         T(V(0.095,cy+0.078,cz+0.108)), T(V(-0.095,cy+0.078,cz+0.108)), P.steelDkr, 0.03);
    /* THE VOID VISION-SLIT — a dark hollow horizontal slot across the face, sitting inside the
       bright brow rim band. You see INTO an empty helm, not a visor. The "nobody home" tell. */
    quad(T(V(-0.078,cy+0.010,cz+0.120)), T(V(0.078,cy+0.010,cz+0.120)),
         T(V(0.074,cy+0.046,cz+0.114)), T(V(-0.074,cy+0.046,cz+0.114)), P.void, 0.0);
    quad(T(V(-0.062,cy+0.017,cz+0.102)), T(V(0.062,cy+0.017,cz+0.102)),
         T(V(0.060,cy+0.039,cz+0.098)), T(V(-0.060,cy+0.039,cz+0.098)), P.voidCore, 0.0);
    // a thin vertical breath-slit below (helm detail)
    quad(T(V(-0.010,cy-0.09,cz+0.104)), T(V(0.010,cy-0.09,cz+0.104)),
         T(V(0.010,cy-0.01,cz+0.108)), T(V(-0.010,cy-0.01,cz+0.108)), P.voidCore, 0.0);
  }

  /* ===== FAULDS — the plated skirt over the hips (lame bands). Broad, hanging straight, tarnished
     lower edge. Sits BELOW the waist void. NOT torso-yawed (hips face forward — the torque is
     between hips and chest). ===== */
  stack([
    {y:0.44, rx:0.205, rz:0.160, hex:P.steelDk},
    {y:0.56, rx:0.195, rz:0.150, hex:P.steel},
    {y:L.hipY+0.02, rx:0.175, rz:0.135, hex:P.steel},
  ], 8, {capTop:{hex:P.steelDkr, lift:0.004}});
  // two lame ridge lines across the faulds front (overlapping plate bands)
  for(const fy of [0.50, 0.61]){
    const r=ring(V(0,fy,0), V(0,1,0), 0.202,0.157, 8, Math.PI/8);
    const r2=ring(V(0,fy+0.02,0), V(0,1,0), 0.200,0.155, 8, Math.PI/8);
    stitch([r,r2], ()=>P.steelDkr);
  }
  // a brass buckle centered on the fauld belt
  quad(V(-0.030,0.635,0.152), V(0.030,0.635,0.152), V(0.030,0.675,0.148), V(-0.030,0.675,0.148), P.brass, 0.03);

  /* ===== PAULDRONS — big steel shoulder domes tilted out, floating just off the shoulder yoke,
     torso-yawed. The RIGHT pauldron cants back (feeding the swing), the LEFT cants forward. ===== */
  for(const s of [-1,1]){
    const pivot=T(V(s*L.shoulderX, L.shldY+0.02, 0.01));
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.34); return q.add(pivot); };
    const bands=[
      {y:L.shldY-0.01, rx:0.115, rz:0.125, hex:P.steelDk},
      {y:L.shldY+0.06, rx:0.092, rz:0.102, hex:P.steelLt},
    ];
    const n=8;
    const rs = bands.map(b=>{ const r=ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, 0)
      .map(p=>T(V(p.x + s*L.shoulderX, p.y, p.z))).map(tilt); return r; });
    stitch(rs, i=>bands[i].hex);
    capFan(rs[rs.length-1].map(p=>V(p.x,p.y+0.03,p.z)), pivot.clone().add(V(0,0.09,0)), P.steelLt);
    // a tarnish streak down the pauldron
    const base = T(V(s*L.shoulderX, L.shldY+0.05, 0.10));
    const tip  = T(V(s*L.shoulderX, L.shldY-0.05, 0.12));
    quad(base.clone().add(V(-0.02,0,0)), base.clone().add(V(0.02,0,0)),
         tip.clone().add(V(0.02,0,0)), tip.clone().add(V(-0.02,0,0)), P.tarn, 0.05);
  }

  /* ===== ARMS — plate limbs built as SEPARATED pieces with dark ELBOW GAPS.
     RIGHT arm winds the sword back over the shoulder (elbow high, cocked).
     LEFT arm is the LEADING gauntlet, thrown forward-and-down across the body — the counterweight
     to the wind-up. ===== */
  {
    const elbowVoid=(E, nrm)=>{
      const zf=E.clone().addScaledVector(nrm,0.06);
      const u=new THREE.Vector3().crossVectors(V(0,1,0),nrm).normalize();
      quad(zf.clone().addScaledVector(u,-0.055).add(V(0,0.075,0)), zf.clone().addScaledVector(u,0.055).add(V(0,0.075,0)),
           zf.clone().addScaledVector(u,0.055).add(V(0,-0.075,0)), zf.clone().addScaledVector(u,-0.055).add(V(0,-0.075,0)), P.void, 0.0);
      const zc=E.clone().addScaledVector(nrm,0.01);
      quad(zc.clone().addScaledVector(u,-0.035).add(V(0,0.055,0)), zc.clone().addScaledVector(u,0.035).add(V(0,0.055,0)),
           zc.clone().addScaledVector(u,0.035).add(V(0,-0.055,0)), zc.clone().addScaledVector(u,-0.035).add(V(0,-0.055,0)), P.voidCore, 0.0);
    };

    /* RIGHT ARM → wound back over the shoulder, high cocked elbow, gauntlet at GRIP (upper hand). */
    {
      const S = T(V(L.shoulderX-0.01, L.shldY-0.06, 0.02));
      const E = T(V(0.32, L.shldY+0.14, -0.20));                 // elbow, raised + pulled back (wind-up)
      const FIST = GRIP.clone();
      tube(S, E.clone().lerp(S,0.32), 0.078, 0.064, 6, P.steel, {capB:{hex:P.steelDkr}});
      elbowVoid(E, V(0.3,0.1,-0.95).normalize());
      tube(E.clone().lerp(FIST,0.24), FIST.clone().addScaledVector(BLADE,-0.03), 0.062, 0.050, 6, P.steelDk, {capA:{hex:P.steelDkr}});
      tube(FIST.clone().addScaledVector(BLADE,-0.06), FIST.clone().addScaledVector(BLADE,0.05), 0.052,0.048,6, P.steelLt, {capA:{hex:P.steel}, capB:{hex:P.steel}});
      for(const k of [-0.02,0.02]){
        const kp=FIST.clone().addScaledVector(BLADE,0.02).add(V(k,0.02,0.03));
        quad(kp.clone().add(V(-0.008,0,-0.01)), kp.clone().add(V(0.008,0,-0.01)),
             kp.clone().add(V(0.008,0.02,0.01)), kp.clone().add(V(-0.008,0.02,0.01)), P.steelDkr, 0.03);
      }
    }

    /* LEFT ARM → the leading gauntlet, thrown forward-and-down (empty, open hand) — the pose's
       counterweight. Elbow bent, arm extends out past the hip line but stays true-to-length
       (anatomical reach, not stretched — a too-long arm read as a disconnected floating object). */
    {
      const S = T(V(-L.shoulderX+0.01, L.shldY-0.06, 0.02));
      const E = T(V(-0.32, L.chestY-0.04, 0.15));
      const W = V(-0.27, 0.85, 0.39);                            // wrist thrown forward-down, no torso yaw (extended clear of the body)
      tube(S, E.clone().lerp(S,0.18), 0.078, 0.064, 6, P.steelLt, {capB:{hex:P.steelDkr}});
      elbowVoid(E, V(0.15,-0.1,0.98).normalize());
      tube(E.clone().lerp(W,0.12), W, 0.062, 0.052, 6, P.steelLt, {capA:{hex:P.steelDkr}});
      const HD = V(-0.24, 0.76, 0.52).sub(W).normalize();
      // open gauntlet fist — a compact block with 3 knuckle ridges (leading, empty hand)
      tube(W.clone().addScaledVector(HD,-0.05), W.clone().addScaledVector(HD,0.09), 0.054,0.050,6, P.steelLt, {capA:{hex:P.steel}, capB:{hex:P.steel, lift:0.01}});
      for(const k of [-0.022,0,0.022]){
        const kp=W.clone().addScaledVector(HD,0.06).add(V(k,0.018,0));
        quad(kp.clone().add(V(-0.008,0,-0.01)), kp.clone().add(V(0.008,0,-0.01)),
             kp.clone().add(V(0.008,0.018,0.01)), kp.clone().add(V(-0.008,0.018,0.01)), P.steelDkr, 0.03);
      }
    }
  }

  /* ===== LEGS — plate greaves as SEPARATED pieces with dark KNEE GAPS. Cuisse (thigh) + poleyn gap +
     greave (shin) + sabaton. TORQUED stance: right (sword-side) leg forward and planted, left leg
     trailing back — the body's weight caught mid-turn into the strike, not at attention. ===== */
  {
    const kneeVoid=(K)=>{
      const zf=K.z+0.055;
      quad(V(K.x-0.07,K.y+0.075,zf), V(K.x+0.07,K.y+0.075,zf),
           V(K.x+0.07,K.y-0.075,zf), V(K.x-0.07,K.y-0.075,zf), P.void, 0.0);
      quad(V(K.x-0.045,K.y+0.055,zf-0.05), V(K.x+0.045,K.y+0.055,zf-0.05),
           V(K.x+0.045,K.y-0.055,zf-0.05), V(K.x-0.045,K.y-0.055,zf-0.05), P.voidCore, 0.0);
    };
    const leg=(sign, hipOff, kneeOff, ankOff)=>{
      const hip=V(sign*L.hipHalf, L.hipY-0.06, 0.0).add(hipOff);
      const knee=V(sign*0.135, 0.40, 0.02).add(kneeOff);
      const ank=V(sign*0.140, 0.085, 0.01).add(ankOff);
      // cuisse (thigh) — stops short above the knee (gap)
      tube(hip, hip.clone().lerp(knee,0.60), 0.098, 0.076, 6, P.steel, {capB:{hex:P.steelDkr}});
      kneeVoid(knee);
      // greave (shin) — starts below the knee gap
      tube(knee.clone().lerp(ank,0.22), ank, 0.070, 0.052, 6, P.steelDk, {capA:{hex:P.steelDkr}});
      // sabaton — plated boot + squared toe
      stack([
        {y:0.012, rx:0.072, rz:0.080, cx:ank.x, cz:ank.z, hex:P.steelDk},
        {y:0.09,  rx:0.064, rz:0.064, cx:ank.x, cz:ank.z, hex:P.steel},
        {y:0.15,  rx:0.068, rz:0.066, cx:ank.x, cz:ank.z, hex:P.steelDkr},
      ], 6, {capTop:{hex:P.steelDkr, lift:0.005}, capBot:{hex:P.steelDk}});
      const toeA=V(ank.x,0.05,ank.z), d=V(sign*0.05,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.13), 0.060,0.046,6,P.steelDk,{capB:{hex:P.steel, lift:0.012},raz:0.052,rbz:0.036});
    };
    // right (sword-side) leg: forward, planted, weight-bearing
    leg( 1, V(0.02,0,0.10), V(0.03,-0.01,0.16), V(0.02,0,0.20));
    // left leg: trailing back, on the ball of the foot
    leg(-1, V(-0.01,0,-0.06), V(-0.02,0.02,-0.14), V(-0.01,0.03,-0.22));
  };

  /* base disc — Medium piece (r=0.42). The empty suit stands ON it. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
