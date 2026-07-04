/* dev/model-qa/creatures/mon-armor.js — the ANIMATED ARMOR: a haunted suit of plate standing guard
   with NOTHING inside. Whole-object grammar: one function, one geometry frame, no anchors. Held item
   authored FIRST. The read must be "armor that should not be standing": the plate pieces (helm,
   cuirass, pauldrons, faulds, separated gauntlets + greaves) float in a body's FORMATION but with
   deliberate DARK GAPS at the neck, elbows, knees, and waist where a body should be — the golem
   seam-gap technique turned SINISTER: each gap is a near-black recessed void quad set behind the
   opening, reading as hollow darkness, not a broken joint. A longsword in one gauntlet (authored
   first); a kite shield on the other arm. Dull tarnished steel. No face — a dark void slit in the helm.
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

  /* ---------- LANDMARKS — an upright sentinel harness (~1.55u), a body's formation with air inside.
     The gaps are cut by leaving vertical space between the plate pieces + facing a void quad. ------ */
  const L = {
    hipY:0.70, waistY:0.82, chestY:1.06, shldY:1.22, neckGapY:1.28, helmY:1.44,
    hipHalf:0.125, shoulderX:0.255, headTopY:1.64,
  };

  /* helper: a VOID PANEL — a near-black quad spanning a gap, recessed slightly so the darkness reads
     as hollow interior seen THROUGH the opening (not a solid black plate). Faces +z (camera). */
  function voidGap(y0v, y1v, halfW, z, opts={}){
    const zr = z - (opts.recess ?? 0.05);        // pushed back behind the plate lips
    const hx = halfW, hxT = opts.halfWTop ?? halfW;
    // the dark cavity quad
    quad(V(-hx,y0v,zr), V(hx,y0v,zr), V(hxT,y1v,zr), V(-hxT,y1v,zr), opts.hex ?? P.void, 0.0);
    // a darker core sliver deeper in (depth cue — the hollow has no back)
    const cx = hx*0.6, cxT = hxT*0.6, zc = zr - 0.04;
    quad(V(-cx,y0v+0.01,zc), V(cx,y0v+0.01,zc), V(cxT,y1v-0.01,zc), V(-cxT,y1v-0.01,zc), P.voidCore, 0.0);
    // side walls of the recess (dark) so from 3/4 the gap still reads hollow, not a flat card
    quad(V(-hx,y0v,z), V(-hx,y0v,zr), V(-hxT,y1v,zr), V(-hxT,y1v,z), P.voidCore, 0.0);
    quad(V(hx,y0v,zr), V(hx,y0v,z), V(hxT,y1v,z), V(hxT,y1v,zr), P.voidCore, 0.0);
  }

  /* ===== LONGSWORD FIRST — held in the RIGHT gauntlet, angled point-up-and-out (a guard ready to
     strike). The grip is ground truth; the right fist derives to it. Dull notched blade. ===== */
  const GRIP  = V(0.40, 0.86, 0.24);                       // right hand, out to the side, chest-low
  const BLADE = V(0.30, 1.0, 0.18).normalize();            // angled up + out + slightly forward
  const POMMEL= GRIP.clone().addScaledVector(BLADE,-0.13);
  {
    tube(POMMEL, GRIP.clone().addScaledVector(BLADE,0.05), 0.022,0.022,6, P.grip, {capA:{hex:P.steelDk, lift:0.02}});
    const up=V(0,1,0), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE,0.06);
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
    const s1=bl(0.03,0.044,0.012), s2=bl(0.34,0.038,0.010), s3=bl(0.60,0.028,0.008);
    stitch([s1,s2,s3], ()=>P.steel);
    capFan(s3, g0.clone().addScaledVector(BLADE,0.78), P.steelLt);
    const gl=(t)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,0.006), c.clone().addScaledVector(gv,0.013), c.clone().addScaledVector(gu,-0.006), c.clone().addScaledVector(gv,0.013)]; };
    stitch([gl(0.06), gl(0.7)], ()=>P.edge);
  }

  /* ===== CUIRASS — the breastplate torso, hips→shoulders, but ENDING BELOW THE NECK (a neck gap
     above it) and OPENING at the waist (a waist gap below the chest, above the faulds). Broad-
     chested, a raised sternum ridge, tarnished. ===== */
  stack([
    {y:L.chestY-0.10, rx:0.215, rz:0.155, hex:P.steelDk},   // lower chest (above the waist gap)
    {y:L.chestY,      rx:0.245, rz:0.175, hex:P.steel},     // chest — broadest
    {y:L.chestY+0.10, rx:0.235, rz:0.165, hex:P.steelLt},   // upper chest
    {y:L.shldY-0.02,  rx:0.205, rz:0.150, hex:P.steel},     // shoulder yoke
  ], 8, {capTop:{hex:P.steelDkr, lift:0.005}});
  // sternum ridge — a raised vertical catch-light band down the chest center
  quad(V(-0.022,L.chestY-0.09,0.170), V(0.022,L.chestY-0.09,0.170),
       V(0.026,L.chestY+0.11,0.178), V(-0.026,L.chestY+0.11,0.178), P.edge, 0.03);
  // a tarnish streak down one side of the chest
  quad(V(0.11,L.chestY-0.08,0.168), V(0.15,L.chestY-0.08,0.166),
       V(0.14,L.chestY+0.08,0.170), V(0.10,L.chestY+0.08,0.172), P.tarn, 0.04);
  // rivet row across the collarbone
  for(const rx of [-0.12,-0.04,0.04,0.12]){
    quad(V(rx-0.012,L.shldY-0.06,0.150), V(rx+0.012,L.shldY-0.06,0.150),
         V(rx+0.012,L.shldY-0.035,0.150), V(rx-0.012,L.shldY-0.035,0.150), P.tarnDk, 0.02);
  }

  /* ===== THE NECK GAP — the star void: between the cuirass shoulder-yoke top and the floating helm,
     a band of HOLLOW DARKNESS where a neck should be. The helm hovers above it. ===== */
  voidGap(L.shldY-0.03, L.helmY-0.11, 0.085, 0.13, {recess:0.06, halfWTop:0.075});
  // a tarnished gorget lip on the cuirass framing the bottom of the neck void (armor edge, not flesh)
  { const r=ring(V(0,L.shldY-0.02,0), V(0,1,0), 0.11,0.095, 8, Math.PI/8);
    const r2=ring(V(0,L.shldY+0.02,0), V(0,1,0), 0.095,0.082, 8, Math.PI/8);
    stitch([r,r2], ()=>P.tarnDk); }

  /* ===== THE WAIST GAP — a second hollow band between the lower cuirass and the faulds (skirt).
     The upper body floats a hand's-width above the hips: pure void between. ===== */
  voidGap(L.hipY+0.10, L.chestY-0.135, 0.135, 0.145, {recess:0.055, halfWTop:0.155});

  /* ===== HELM — a full great-helm floating above the neck void. A tapered barrel with a heavy brow
     and a dark VOID VISION-SLIT (no face inside — just black). A small crest ridge on top. ===== */
  {
    const n=8, ph=Math.PI/n, cy=L.helmY, cz=0.02;
    const bands=[
      {y:cy-0.11, rx:0.095, rz:0.100, hex:P.steelDk},    // jaw of the helm (narrower)
      {y:cy-0.02, rx:0.120, rz:0.118, hex:P.steel},      // cheek band
      {y:cy+0.07, rx:0.124, rz:0.115, hex:P.steelDk},    // heavy brow
      {y:cy+0.15, rx:0.100, rz:0.092, hex:P.steel},      // crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]){ rings[2][i].z += 0.020; rings[2][i].y -= 0.010; }   // brow hoods the slit
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(0, L.headTopY, cz-0.01), P.steelDkr);
    capFan(rings[0], V(0, cy-0.15, cz), P.steelDkr, true);   // close the underside (no neck inside)
    // crest ridge — a thin raised comb front-to-back over the crown
    for(const t of [[-0.10,0.06],[0.0,0.09],[0.10,0.06]]){
      // small triangular comb segments; approximate with thin quads along the crown
    }
    { const c0=V(0,cy+0.15,cz-0.09), c1=V(0,cy+0.15,cz+0.09), cT=V(0,cy+0.235,cz);
      quad(V(-0.012,cy+0.15,cz-0.06), V(0.012,cy+0.15,cz-0.06), V(0.012,cy+0.15,cz+0.06), V(-0.012,cy+0.15,cz+0.06), P.steelDk, 0.0);
      quad(V(0,cy+0.15,cz-0.09), V(0,cy+0.15,cz+0.09), cT, cT, P.tarn, 0.03); }
    // BROW SHADOW band above the slit
    quad(V(-0.10,cy+0.055,cz+0.115), V(0.10,cy+0.055,cz+0.115),
         V(0.095,cy+0.095,cz+0.10), V(-0.095,cy+0.095,cz+0.10), P.steelDkr, 0.03);
    /* THE VOID VISION-SLIT — a dark hollow horizontal slot across the face. Recessed near-black with
       a deeper core: you see INTO an empty helm, not a visor. This is the "nobody home" tell. */
    quad(V(-0.075,cy+0.010,cz+0.118), V(0.075,cy+0.010,cz+0.118),
         V(0.072,cy+0.042,cz+0.112), V(-0.072,cy+0.042,cz+0.112), P.void, 0.0);
    quad(V(-0.060,cy+0.016,cz+0.10), V(0.060,cy+0.016,cz+0.10),
         V(0.058,cy+0.036,cz+0.096), V(-0.058,cy+0.036,cz+0.096), P.voidCore, 0.0);
    // a thin vertical breath-slit below (helm detail)
    quad(V(-0.010,cy-0.09,cz+0.104), V(0.010,cy-0.09,cz+0.104),
         V(0.010,cy-0.01,cz+0.108), V(-0.010,cy-0.01,cz+0.108), P.voidCore, 0.0);
  }

  /* ===== FAULDS — the plated skirt over the hips (lame bands). Broad, hanging straight, tarnished
     lower edge. Sits BELOW the waist void. ===== */
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

  /* ===== PAULDRONS — big steel shoulder domes tilted out, floating just off the shoulder yoke (a
     thin dark gap under each, so even the shoulders read detached). ===== */
  for(const s of [-1,1]){
    const pivot=V(s*L.shoulderX, L.shldY+0.02, 0.01);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.34); return q.add(pivot); };
    stack([
      {y:L.shldY-0.01, rx:0.115, rz:0.125, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.06, rx:0.092, rz:0.102, cx:pivot.x, cz:pivot.z, hex:P.steelLt},
    ], 8, {xform:tilt, capTop:{hex:P.steelLt, lift:0.03}});
    // a tarnish streak down the pauldron
    quad(V(s*L.shoulderX-0.02,L.shldY+0.05,0.10), V(s*L.shoulderX+0.02,L.shldY+0.05,0.10),
         V(s*L.shoulderX+0.02,L.shldY-0.05,0.12), V(s*L.shoulderX-0.02,L.shldY-0.05,0.12), P.tarn, 0.05);
  }

  /* ===== ARMS — plate limbs built as SEPARATED pieces with dark ELBOW GAPS. Upper-arm rerebrace +
     forearm vambrace + a gauntlet, with a void band at the elbow. RIGHT arm derives to the sword
     grip; LEFT arm holds the kite shield. ===== */
  {
    // a floating elbow-void: a small dark quad + a spacer between the two arm plates
    const elbowVoid=(E, sign)=>{
      // a clear hollow slot at the elbow: a void quad facing +z, framed by the two arm plates
      const zf=E.z+0.06;
      quad(V(E.x-0.055,E.y+0.075,zf), V(E.x+0.055,E.y+0.075,zf),
           V(E.x+0.055,E.y-0.075,zf), V(E.x-0.055,E.y-0.075,zf), P.void, 0.0);
      quad(V(E.x-0.035,E.y+0.055,zf-0.05), V(E.x+0.035,E.y+0.055,zf-0.05),
           V(E.x+0.035,E.y-0.055,zf-0.05), V(E.x-0.035,E.y-0.055,zf-0.05), P.voidCore, 0.0);
    };

    /* RIGHT ARM → the sword grip. Shoulder under the pauldron, elbow out, gauntlet at the grip. */
    {
      const S = V(L.shoulderX-0.01, L.shldY-0.06, 0.02);
      const FIST = GRIP.clone();
      const E = V(0.40, L.chestY-0.06, 0.10);                 // elbow, held out to the side
      // rerebrace (upper) — stops SHORT of the elbow (gap)
      tube(S, E.clone().lerp(S,0.34), 0.078, 0.064, 6, P.steel, {capB:{hex:P.steelDkr}});
      elbowVoid(E, 1);
      // vambrace (forearm) — starts BELOW the elbow gap, runs to the wrist
      tube(E.clone().lerp(FIST,0.26), FIST.clone().addScaledVector(BLADE,-0.02), 0.062, 0.050, 6, P.steelDk, {capA:{hex:P.steelDkr}});
      // gauntlet fist wrapping the grip
      tube(FIST.clone().addScaledVector(BLADE,-0.05), FIST.clone().addScaledVector(BLADE,0.06), 0.052,0.048,6, P.steelLt, {capA:{hex:P.steel}, capB:{hex:P.steel}});
      // a couple of knuckle ridges on the gauntlet
      for(const k of [-0.02,0.02]){
        const kp=FIST.clone().addScaledVector(BLADE,0.03).add(V(k,0.02,0.03));
        quad(kp.clone().add(V(-0.008,0,-0.01)), kp.clone().add(V(0.008,0,-0.01)),
             kp.clone().add(V(0.008,0.02,0.01)), kp.clone().add(V(-0.008,0.02,0.01)), P.steelDkr, 0.03);
      }
    }

    /* LEFT ARM → the kite shield. Shoulder under the pauldron, elbow bent so the forearm crosses the
       body front, gauntlet gripping the shield's inner strap. */
    {
      const S = V(-L.shoulderX+0.01, L.shldY-0.06, 0.02);
      const E = V(-0.34, L.chestY-0.08, 0.12);
      const W = V(-0.12, L.chestY-0.14, 0.30);               // wrist in front of the body (holding shield)
      tube(S, E.clone().lerp(S,0.34), 0.078, 0.064, 6, P.steel, {capB:{hex:P.steelDkr}});
      elbowVoid(E, -1);
      tube(E.clone().lerp(W,0.26), W, 0.062, 0.050, 6, P.steelDk, {capA:{hex:P.steelDkr}});
      tube(W.clone().add(V(-0.02,0,-0.02)), W.clone().add(V(0.06,-0.03,0.06)), 0.050,0.046,6, P.steelLt, {capB:{hex:P.steel}});
    }
  }

  /* ===== KITE SHIELD — on the LEFT arm, held in FRONT of the body facing the camera (+z). A proper
     kite: a flat slab whose outline is round-shouldered at the top and tapers to a point at the
     bottom. Built from an explicit ring of outline points → a slightly-domed FRONT face (fan to a
     raised center boss) + a rim strip pulled back to a matching BACK outline (gives it thickness so
     it reads solid from any angle). Tilted a touch about y so it faces the dimetric camera. ===== */
  {
    const cx=-0.30, cy=0.92, zFace=0.30;                     // shield center; front-left, clear of the arm
    const tiltY=0.80;                                         // yaw ≈45° so the broad face turns to the dimetric hero camera
    // KITE OUTLINE (local u=across full ±1, v=up) — points clockwise from top-center, round top → point
    const OUT = [
      [ 0.00, 1.00],[ 0.58, 0.90],[ 0.95, 0.62],[ 1.00, 0.20],[ 0.72,-0.30],
      [ 0.00,-0.95],
      [-0.72,-0.30],[-1.00, 0.20],[-0.95, 0.62],[-0.58, 0.90],
    ];
    const SW=0.20, SH=0.36;                                   // shield half-extents (u∈±1, v∈±1 → world)
    // clean orthonormal frame: u-axis across the face, N-axis is the outward normal (toward camera).
    // A yaw of tiltY about vertical turns the face to catch the dimetric camera.
    const uAx = V(Math.cos(tiltY), 0, -Math.sin(tiltY));      // horizontal-across
    const nAx = V(Math.sin(tiltY), 0,  Math.cos(tiltY));      // outward normal (+z-ish, toward camera)
    const sp=(u,v,depth=0)=>{
      const lx=u*SW, ly=v*SH;
      return V(cx + lx*uAx.x + depth*nAx.x,
               cy + ly,
               zFace + lx*uAx.z + depth*nAx.z);
    };
    const boss = sp(0, 0.12, 0.06);                           // raised center boss (proud of the face)
    // FRONT FACE — fan each outline edge to the boss (slightly convex shield face)
    for(let i=0;i<OUT.length;i++){
      const a=OUT[i], b=OUT[(i+1)%OUT.length];
      const pa=sp(a[0],a[1],0.0), pb=sp(b[0],b[1],0.0);
      const shade = (a[0]+b[0] < 0) ? P.steel : P.steelDk;    // left half lit, right half shadow
      quad(pa, pb, boss, boss, shade, 0.03);
    }
    // BACK FACE — fan each outline edge to a recessed back-boss (a shallow lens: solid from behind
    // WITHOUT a wrap-around rim, which projected as a thin edge-on sliver over the shoulder). Wound
    // opposite so it faces away. This gives the shield real depth read from the back panel too.
    const bboss = sp(0, 0.10, -0.05);                        // recessed back center
    for(let i=0;i<OUT.length;i++){
      const a=OUT[i], b=OUT[(i+1)%OUT.length];
      const pa=sp(a[0],a[1],-0.02), pb=sp(b[0],b[1],-0.02);   // back rim sits just behind the face edge
      quad(pb, pa, bboss, bboss, P.steelDkr, 0.03);           // reversed winding — back-facing
    }
    // central BOSS dome — a little raised disc at the boss point
    { const axis=V(Math.sin(tiltY),0,Math.cos(tiltY)).normalize();
      const r1=ring(boss, axis, 0.075,0.075, 8);
      const r2=ring(boss.clone().addScaledVector(axis,0.03), axis, 0.040,0.040, 8);
      stitch([r1,r2], ()=>P.steelLt);
      capFan(r2, boss.clone().addScaledVector(axis,0.05), P.edge); }
    // faded CHEVRON device — two tarnished bars angling down to the boss (heraldry, gone dull)
    quad(sp(-0.15,0.55,0.005), sp(-0.02,0.18,0.005), sp(-0.02,0.05,0.005), sp(-0.15,0.42,0.005), P.tarn, 0.04);
    quad(sp( 0.15,0.55,0.005), sp( 0.02,0.18,0.005), sp( 0.02,0.05,0.005), sp( 0.15,0.42,0.005), P.tarnDk, 0.04);
    // rivet dots around the upper rim
    for(const rr of [[-0.13,0.78],[0.13,0.78],[-0.16,0.45],[0.16,0.45]]){
      const p=sp(rr[0],rr[1],0.01);
      quad(p.clone().add(V(-0.010,-0.010,0)), p.clone().add(V(0.010,-0.010,0)),
           p.clone().add(V(0.010,0.010,0)), p.clone().add(V(-0.010,0.010,0)), P.tarnDk, 0.02);
    }
  }

  /* ===== LEGS — plate greaves as SEPARATED pieces with dark KNEE GAPS. Cuisse (thigh) + poleyn gap +
     greave (shin) + sabaton. Planted straight (a stood sentinel). ===== */
  {
    const kneeVoid=(K)=>{
      const zf=K.z+0.055;
      quad(V(K.x-0.07,K.y+0.075,zf), V(K.x+0.07,K.y+0.075,zf),
           V(K.x+0.07,K.y-0.075,zf), V(K.x-0.07,K.y-0.075,zf), P.void, 0.0);
      quad(V(K.x-0.045,K.y+0.055,zf-0.05), V(K.x+0.045,K.y+0.055,zf-0.05),
           V(K.x+0.045,K.y-0.055,zf-0.05), V(K.x-0.045,K.y-0.055,zf-0.05), P.voidCore, 0.0);
    };
    const leg=(sign)=>{
      const hip=V(sign*L.hipHalf, L.hipY-0.06, 0.0);
      const knee=V(sign*0.135, 0.40, 0.02);
      const ank=V(sign*0.140, 0.085, 0.01);
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
    leg(-1);
    leg( 1);
  }

  /* base disc — Medium piece (r=0.42). The empty suit stands ON it. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
