/* dev/model-qa/creatures/mon-wight.js — the WIGHT: undead KNIGHT-KING (whole-object monster).
   Whole-object grammar: one function, one geometry frame, no anchors. Held item authored FIRST.
   The read must sit ABOVE the whole undead ladder — where the skeleton is loose bone, the zombie
   shambles and the ghoul crouches to pounce, the WIGHT stands UPRIGHT, COMPOSED and REGAL: an
   ancient sworn knight that death did not unseat. Tells: a broken tarnished CROWN-circlet; the ONE
   undead with LIT eyes — two cold pale-blue pinprick glow quads; a desiccated grey-parchment face;
   corroded scale/plate over faded-purple regal robes; an ancient notched LONGSWORD held POINT-DOWN
   before it in both hands, funeral-formal (authored first); a burial-shroud cape off the shoulders.
   Silhouette: a still, armed sentinel — this dead thing still commands.
   Imported by mon-wight-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { buildBase } from '../parts.js';

export function buildWight(){
  /* ---------- PALETTE (VS desaturated: grey desiccation, tarnished metal, faded regalia) -------- */
  const P = {
    flesh:0x8f8a7a, fleshDk:0x6c6858, fleshDkr:0x504d40,   // grey desiccated parchment skin
    robe:0x4a3a52, robeDk:0x352838, robeLt:0x5e4d66,       // faded dark-purple regal robe
    scale:0x6a6a64, scaleDk:0x4a4a45, scaleLt:0x86867c,    // corroded grey scale/plate
    tarn:0x7a6a3e, tarnDk:0x53482a, tarnLt:0x9a8a56,       // tarnished old gold — crown, trim
    steel:0x8a8f8c, steelDk:0x565a57, steelGl:0xc2c8be,    // the notched dark blade + pale glint line
    grip:0x2e2820, cape:0x3a3340, capeDk:0x282430,         // sword grip wrap; burial-shroud cape
    eye:0x9fd8f0, eyeCore:0xe4f6ff,                        // COLD PALE-BLUE lit eyes (the one undead lit)
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ---------- LANDMARKS — an UPRIGHT, composed knight (~1.55u), a shade taller than living. ------ */
  const L = {
    hipY:0.74, waistY:0.83, ribY:0.95, chestY:1.07, shldY:1.16, neckY:1.205,
    hipHalf:0.115, shoulderX:0.255,
    jawY:1.245, cheekY:1.325, browY:1.405, crownY:1.49, headTopY:1.55,
  };

  /* ===== LONGSWORD FIRST — held POINT-DOWN before the body in BOTH hands, funeral-formal, vertical
     down the centerline. The grip (up high, near the chest) is ground truth; both fists derive from
     it. Ancient: a dark notched blade with a single pale glint line down the fuller. ===== */
  const GRIP  = V(0, 1.02, 0.30);                 // both hands clasp here, chest-high, out front
  const BLADE = V(0, -1, 0.03).normalize();       // points DOWN + a hair forward (planted before it)
  const POMMEL= GRIP.clone().addScaledVector(BLADE,-0.16);
  {
    /* grip wrap + pommel (ABOVE the fists — the blade hangs down through them) */
    tube(POMMEL, GRIP.clone().addScaledVector(BLADE,0.06), 0.024,0.024,6, P.grip, {capA:{hex:P.tarn, lift:0.03}});
    const up=V(0,0,1), gu=new THREE.Vector3().crossVectors(up,BLADE).normalize(), gv=new THREE.Vector3().crossVectors(BLADE,gu).normalize();
    const g0=GRIP.clone().addScaledVector(BLADE,0.075);
    /* crossguard bar — wide, tarnished, horizontal */
    const gx=0.115, gy=0.016, gz=0.024;
    const cnr=(a,b,c)=>g0.clone().addScaledVector(gu,a*gx).addScaledVector(gv,b*gy).addScaledVector(BLADE,c*gz);
    quad(cnr(-1,-1,-1), cnr(1,-1,-1), cnr(1,1,-1), cnr(-1,1,-1), P.tarnDk,0.04);
    quad(cnr(1,-1,1), cnr(-1,-1,1), cnr(-1,1,1), cnr(1,1,1), P.tarnDk,0.04);
    quad(cnr(-1,-1,-1), cnr(-1,-1,1), cnr(1,-1,1), cnr(1,-1,-1), P.tarn,0.04);
    quad(cnr(-1,1,-1), cnr(1,1,-1), cnr(1,1,1), cnr(-1,1,1), P.tarnLt,0.04);
    quad(cnr(-1,-1,-1), cnr(-1,1,-1), cnr(-1,1,1), cnr(-1,-1,1), P.tarn,0.04);
    quad(cnr(1,-1,-1), cnr(1,-1,1), cnr(1,1,1), cnr(1,1,-1), P.tarn,0.04);
    /* the BLADE — a long spine of cross-sections narrowing to a point, hanging DOWN. Asymmetric
       widths give an ancient NOTCHED edge; a pale central glint line runs the fuller. */
    const bl=(t,wA,wB,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,wA), c.clone().addScaledVector(gv,th),
              c.clone().addScaledVector(gu,-wB), c.clone().addScaledVector(gv,-th)]; };
    const s1=bl(0.03,0.052,0.052,0.013), s2=bl(0.34,0.046,0.040,0.011),   // notch: one edge eaten
          s3=bl(0.62,0.040,0.046,0.009), s4=bl(0.86,0.030,0.026,0.007);   // notch the other side
    stitch([s1,s2,s3,s4], (b)=> b===1 ? P.steelDk : P.steel);
    capFan(s4, g0.clone().addScaledVector(BLADE,1.02), P.steel);
    /* pale glint line — a thin bright fuller stripe down the blade centerline (the one live edge) */
    const gl=(t,th)=>{ const c=g0.clone().addScaledVector(BLADE,t);
      return [c.clone().addScaledVector(gu,0.006), c.clone().addScaledVector(gv,th+0.001),
              c.clone().addScaledVector(gu,-0.006), c.clone().addScaledVector(gv,th+0.001)]; };
    stitch([gl(0.05,0.013), gl(0.5,0.011), gl(0.9,0.007)], ()=>P.steelGl);
  }

  /* ===== TORSO — an armored regal loft, hips→neck: faded-purple robe base rising into corroded
     scale over the chest. Broad, straight-backed, composed. ===== */
  stack([
    {y:L.hipY,   rx:0.205, rz:0.160, hex:P.robeDk},
    {y:L.waistY, rx:0.175, rz:0.135, hex:P.robe},
    {y:L.ribY,   rx:0.210, rz:0.160, hex:P.scaleDk},
    {y:L.chestY, rx:0.240, rz:0.175, hex:P.scale},
    {y:L.shldY,  rx:0.245, rz:0.165, hex:P.scale},
    {y:L.neckY,  rx:0.090, rz:0.085, hex:P.fleshDk},
  ], 8, {capTop:{hex:P.fleshDk, lift:0.005}});

  /* corroded scale plackart — three shallow ridged bands of scale across the chest (armor read) */
  for(const [y,rx,rz,hx] of [[L.chestY-0.02,0.243,0.176,P.scaleLt],[L.ribY+0.05,0.225,0.166,P.scale],[L.ribY-0.03,0.212,0.160,P.scaleDk]]){
    const r=ring(V(0,y,0), V(0,1,0), rx, rz, 8, Math.PI/8);
    const r2=ring(V(0,y+0.035,0), V(0,1,0), rx*0.99, rz*0.99, 8, Math.PI/8);
    for(const i of [1,2,3,6,7,0]){ /* only the front+sides carry the plate; rear stays robe */ }
    stitch([r,r2], ()=>hx);
  }
  /* a tarnished gorget/collar ring at the neck base */
  { const r=ring(V(0,L.neckY-0.02,0), V(0,1,0), 0.115,0.108, 8, Math.PI/8);
    const r2=ring(V(0,L.neckY+0.02,0), V(0,1,0), 0.100,0.094, 8, Math.PI/8);
    stitch([r,r2], ()=>P.tarnDk); }

  /* ===== ROBE SKIRT — regal, hanging LONG and STRAIGHT (composure, not tatters) ===== */
  stack([
    {y:0.42, rx:0.270, rz:0.220, hex:P.robeDk},
    {y:0.56, rx:0.248, rz:0.198, hex:P.robe},
    {y:0.72, rx:0.220, rz:0.170, hex:P.robe},
  ], 8, {capBot:{hex:P.robeDk, lift:0.008}});
  /* a faded-gold hem trim line at the skirt bottom */
  { const r=ring(V(0,0.44,0), V(0,1,0), 0.268,0.218, 8, Math.PI/8);
    const r2=ring(V(0,0.475,0), V(0,1,0), 0.262,0.212, 8, Math.PI/8);
    stitch([r,r2], ()=>P.tarnDk); }

  /* ===== BURIAL-SHROUD CAPE — a ragged dark shroud off both shoulders, hanging down the BACK.
     Two panels sweeping from the shoulders to a torn hem behind the figure. ===== */
  {
    const n=8, ph=Math.PI/n;
    const top=ring(V(0,L.shldY+0.02,-0.02), V(0,1,0), 0.235, 0.175, n, ph);
    /* cape hem: only the REAR arc hangs (−z verts long); front verts pulled up to the shoulders */
    const hemY=[0.36,0.62,0.66,0.62,0.40,0.30,0.26,0.30];    // rear (idx 0,5,6,7) hangs longer/torn
    const hem=[];
    for(let i=0;i<n;i++){
      const t=ph + (i/n)*Math.PI*2;
      const rear = (i===0||i>=5) ? 1 : 0;
      hem.push(V(Math.cos(t)*(0.255+rear*0.03), hemY[i], -0.03 + Math.sin(t)*(0.205+rear*0.04)));
    }
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      // only draw the rear + side panels (skip the front two, where the sword/body are)
      if(i===1||i===2) continue;
      quad(top[i], top[i2], hem[i2], hem[i], i&1?P.cape:P.capeDk, 0.06);
    }
    /* a torn hanging strip at the back-center */
    tube(V(0,0.30,-0.20), V(0.02,0.14,-0.19), 0.030,0.016,4, P.capeDk, {capB:{hex:P.capeDk}});
  }

  /* ===== HEAD — a desiccated grey skull-face, composed and level (NOT lolled/thrust). Gaunt
     cheeks, a heavy brow, a grim set mouth, and the COLD PALE-BLUE LIT EYES (the wight's tell). ===== */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.078, rz:0.088, hex:P.fleshDk},   // gaunt drawn jaw
      {y:L.cheekY, rx:0.104, rz:0.104, hex:P.flesh},     // sunken cheeks
      {y:L.browY,  rx:0.112, rz:0.106, hex:P.flesh},     // heavy brow
      {y:L.crownY, rx:0.088, rz:0.082, hex:P.fleshDk},   // crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;         // a spare nose ridge
    // heavy brow: push brow front verts forward + down, hooding the lit eyes
    for(const i of [1,2]){ rings[2][i].z += 0.014; rings[2][i].y -= 0.008; }
    // hollow the cheeks: pull the side cheek verts IN (desiccation)
    for(const i of [3,7]){ rings[1][i].x *= 0.90; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(0, L.headTopY, 0.004), P.fleshDkr);

    /* sunken shadow sockets under the brow (grey hollows the lit eyes sit inside) */
    for(const s of [-1,1]){
      const ex=s*0.052, ey=(L.cheekY+L.browY)/2-0.002, ez=0.116;
      quad(V(ex-0.026,ey-0.020,ez-0.006), V(ex+0.026,ey-0.020,ez-0.006),
           V(ex+0.024,ey+0.022,ez-0.012), V(ex-0.024,ey+0.022,ez-0.012), P.fleshDkr, 0.03);
    }
    /* THE LIT EYES — two cold pale-blue glow quads set in the dark sockets, with a brighter core
       dot. The one undead with lit eyes: pinpricks of cold flame. Proud of the recessed socket floor
       and ringed by the dark flesh so the pale-blue pops. */
    for(const s of [-1,1]){
      const ex=s*0.050, ey=(L.cheekY+L.browY)/2-0.002, ez=0.124;
      // a dark inner well behind the glow so the blue reads as LIGHT, not paint
      quad(V(ex-0.018,ey-0.014,ez-0.010), V(ex+0.018,ey-0.014,ez-0.010),
           V(ex+0.017,ey+0.014,ez-0.014), V(ex-0.017,ey+0.014,ez-0.014), 0x100e12, 0.0);
      quad(V(ex-0.015,ey-0.011,ez), V(ex+0.015,ey-0.011,ez),
           V(ex+0.015,ey+0.012,ez-0.004), V(ex-0.015,ey+0.012,ez-0.004), P.eye, 0.0);
      quad(V(ex-0.008,ey-0.005,ez+0.005), V(ex+0.008,ey-0.005,ez+0.005),
           V(ex+0.008,ey+0.006,ez+0.002), V(ex-0.008,ey+0.006,ez+0.002), P.eyeCore, 0.0);
    }
    /* a grim set mouth — a thin dark line (composed, not agape) */
    quad(V(-0.032,L.jawY+0.028,0.104), V(0.032,L.jawY+0.028,0.104),
         V(0.030,L.jawY+0.014,0.100), V(-0.030,L.jawY+0.014,0.100), P.fleshDkr, 0.02);
  }

  /* ===== CROWN — an ancient tarnished circlet with BROKEN points, sitting on the brow. Some
     spikes rise tall, some are SNAPPED to stubs — the read is a once-proud crown gone to ruin. ===== */
  {
    const n=8, ph=Math.PI/n, cy=L.crownY-0.02;
    const band=ring(V(0,cy,0.004), V(0,1,0), 0.104, 0.100, n, ph);
    const band2=ring(V(0,cy+0.050,0.004), V(0,1,0), 0.102, 0.098, n, ph);
    stitch([band,band2], (b,i)=> (i&1)?P.tarn:P.tarnDk);   // banded circlet
    capFan(band, V(0,cy-0.006,0.004), P.tarnDk, true);      // close the underside so it caps the head
    /* spikes rising from the band top — tall vs SNAPPED short (broken). Each spike is a little
       4-sided pyramid so it reads as a real point front-on, not a flat fleck. */
    const pointH=[0.085,0.028,0.078,0.006,0.072,0.026,0.082,0.006];  // broken: idx 1,3,5,7 stubbed
    for(let i=0;i<n;i++){
      const b0=band2[i], b1=band2[(i+1)%n];
      const mid=b0.clone().lerp(b1,0.5);
      const out=mid.clone().multiplyScalar(1.0); out.y=mid.y;   // outward normal proxy
      const tip=mid.clone().add(V(mid.x*0.10, pointH[i], mid.z*0.10));
      // four faces of a thin pyramid from the b0–b1 base edge up to the tip (front + back + 2 sides)
      quad(b0, b1, tip, tip, (i&1)?P.tarnDk:P.tarnLt, 0.05);          // outer face
      quad(b1, b0.clone().add(V(0,0,-0.008)), tip, tip, P.tarnDk, 0.05);  // inner/back face (darker)
    }
  }

  /* ===== ARMS — BOTH clasp the sword grip (funeral-formal, symmetric). Each derives to the GRIP:
     upper arm in scale sleeve, forearm in a vambrace, a gauntlet fist wrapping the grip. ===== */
  {
    const handAt=(fistY)=>GRIP.clone().add(V(0,fistY,0));   // two fists stacked on the grip
    const arm=(sign, fistY, elbowOut)=>{
      const S=V(sign*L.shoulderX, L.shldY-0.01, 0.02);
      const FIST=V(sign*0.055, GRIP.y+fistY, GRIP.z);         // both hands out front, near centerline
      const E=V(sign*0.235, 0.94, 0.20);                      // elbows tucked, forearms angling in+down
      tube(S,E,0.086,0.066,6,P.scale);                        // scale-sleeved upper arm
      tube(E,FIST.clone().add(V(sign*0.02,0.02,-0.02)),0.062,0.050,6,P.scaleDk);  // vambraced forearm
      // gauntlet fist wrapping the grip (short tube across the grip line)
      const f0=FIST.clone().add(V(0,0.02,0)), f1=FIST.clone().add(V(0,-0.05,0));
      tube(f0, f1, 0.050,0.048,6, P.scaleLt, {capA:{hex:P.scaleLt},capB:{hex:P.scaleLt}});
    };
    arm(-1, 0.02, 0.0);    // upper hand
    arm( 1,-0.08, 0.0);    // lower hand (offset down the grip — two-handed clasp)
    /* pauldrons — corroded scale domes tilted out over each shoulder (regal armor) */
    for(const s of [-1,1]){
      const pivot=V(s*L.shoulderX, L.shldY+0.03, 0.01);
      const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.32); return q.add(pivot); };
      stack([
        {y:L.shldY-0.01, rx:0.112, rz:0.122, cx:pivot.x, cz:pivot.z, hex:P.scaleDk},
        {y:L.shldY+0.055,rx:0.090, rz:0.100, cx:pivot.x, cz:pivot.z, hex:P.scaleLt},
      ], 8, {xform:tilt, capTop:{hex:P.scaleLt, lift:0.03}});
    }
  }

  /* ===== LEGS — planted, STRAIGHT and even (a stood sentinel, not a shambler). Robe covers the
     thighs; corroded greaves + sabatons below. ===== */
  {
    const leg=(sign)=>{
      const hip=V(sign*L.hipHalf, L.hipY-0.02, 0.0);
      const knee=V(sign*0.125, 0.40, 0.02);
      const ank=V(sign*0.130, 0.085, 0.01);
      tube(hip,knee,0.090,0.066,6,P.robeDk);        // robe-draped thigh
      tube(knee,ank,0.062,0.048,6,P.scaleDk);        // corroded greave
      // sabaton — a plated boot + a squared toe
      stack([
        {y:0.012, rx:0.070, rz:0.078, cx:ank.x, cz:ank.z, hex:P.scaleDk},
        {y:0.09,  rx:0.062, rz:0.062, cx:ank.x, cz:ank.z, hex:P.scale},
        {y:0.15,  rx:0.066, rz:0.064, cx:ank.x, cz:ank.z, hex:P.scaleDk},
      ], 6, {capTop:{hex:P.scaleDk, lift:0.005}, capBot:{hex:P.scaleDk}});
      const toeA=V(ank.x,0.05,ank.z), d=V(sign*0.06,0,1).normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.13), 0.058,0.044,6,P.scaleDk,{capB:{hex:P.scale, lift:0.012},raz:0.050,rbz:0.034});
    };
    leg(-1);
    leg( 1);
  }

  /* base disc — shared module (Medium: r=0.42) */
  buildBase(P);
}
