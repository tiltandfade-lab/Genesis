/* dev/model-qa/creatures/mon-chaosfrog-blue.js — the BLUE CHAOS FROG (bespoke bloated frog-aberration).
   bestiary id: blue-chaos-frog. The read: a huge bulbous warty body hunched LOW on splayed webbed
   limbs, squatting toad-like, a wide toothy maw slashed across the front, COLD BLUE warty hide
   (VS-desaturated), darker mottle, pale throat. NO eye quads (dark socket recesses only). Whole-object
   grammar: one function, one geometry frame, no anchors. Kept inside its disc footprint — the bulk
   rears in +y rather than sprawling past r=0.55. */
import { V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildBlueChaosFrog(){
  /* ---------- PALETTE (VS desaturated; cold dirty blue-grey, darker mottle, pale throat) ---------- */
  const P = {
    hide:0x3d5560, hideDk:0x2a3d46, hideLt:0x51707c,          // cold blue-grey warty hide
    mottleA:0x33474f, mottleB:0x466472,                        // dorsal mottle blotches
    belly:0x8a9a94, bellyDk:0x66766f,                          // pale sickly throat/belly
    wart:0x27373e,                                             // dark wart nubs
    socket:0x161f22, mouth:0x201814, tooth:0x87897c,
    web:0x35494f,                                              // webbed foot membrane
    claw:0x1c2528, disc:0x40474a, discTop:0x4c5457,
  };

  /* ---------- LANDMARKS — squatting frog, hunched LOW+wide, body reared in +y. ---------- */
  const groundY = 0.05;
  const S = {
    rump:   V(0, 0.20, -0.22),
    loin:   V(0, 0.30, -0.06),
    belly2: V(0, 0.34,  0.10),
    chest:  V(0, 0.30,  0.24),
    throat: V(0, 0.20,  0.34),
    head:   V(0, 0.24,  0.30),
  };

  /* ---------- BODY — one bulbous vertical-leaning loft; huge bloated barrel, hunched forward. ---------- */
  tube(S.rump,   S.loin,   0.235, 0.320, 10, P.hide,    {phase:Math.PI/10, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,   S.belly2, 0.320, 0.360, 10, P.mottleA, {phase:Math.PI/10});
  tube(S.belly2, S.chest,  0.360, 0.300, 10, P.hide,    {phase:Math.PI/10});
  tube(S.chest,  S.throat, 0.300, 0.190, 10, P.mottleB, {phase:Math.PI/10, capB:{hex:P.belly, lift:0.02}});

  /* pale throat/belly patch sagging low under the chest (sickly pale) */
  {
    const by = 0.12;
    quad(V(-0.20,by,0.02), V(0.20,by,0.02), V(0.16,by+0.05,0.34), V(-0.16,by+0.05,0.34), P.belly, 0.05);
    quad(V(-0.14,by-0.03,0.10), V(0.14,by-0.03,0.10), V(0.10,by+0.02,0.30), V(-0.10,by+0.02,0.30), P.bellyDk, 0.04);
  }

  /* dorsal wart clusters — small dark nubs across the back/shoulders (frog-aberration texture) */
  {
    const spots = [
      [-0.14,0.42,-0.14],[0.12,0.44,-0.10],[0.02,0.47,0.02],[-0.20,0.38,0.06],
      [0.20,0.40,0.02],[-0.08,0.36,-0.24],[0.10,0.34,-0.22],[0.00,0.50,0.14],
    ];
    for(const [x,y,z] of spots){
      const b=V(x,y,z), t=V(x,y+0.035,z+0.006);
      tube(b,t,0.028,0.010,5,P.wart,{capB:{hex:P.wart,lift:0.006}});
    }
  }

  /* ---------- HEAD — wide flat toad head fused low against the chest, huge across (frog silhouette). ---------- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:0.10, cz:0.30, rx:0.230, rz:0.200, hex:P.hide},     // wide jaw base
      {y:0.20, cz:0.32, rx:0.270, rz:0.230, hex:P.hide},     // broad cheeks (widest point)
      {y:0.30, cz:0.28, rx:0.210, rz:0.190, hex:P.mottleA},  // brow
      {y:0.36, cz:0.24, rx:0.140, rz:0.130, hex:P.hideDk},   // crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,0.40,0.22), P.hideDk);

    /* dark eye-socket recesses (NO eye quads — carved-in shadow pits, bulging toad-brow position) */
    for(const s of [-1,1]){
      const cb=V(s*0.16, 0.335, 0.22), ct=V(s*0.16, 0.318, 0.235);
      tube(cb,ct,0.052,0.040,6,P.socket,{capB:{hex:P.socket,lift:0.004}});
    }

    /* WIDE TOOTHY MAW — a slashed-open mouth line across the front, plus small ragged teeth. */
    quad(V(-0.22,0.135,0.44), V(0.22,0.135,0.44), V(0.20,0.155,0.55), V(-0.20,0.155,0.55), P.mouth, 0.03);
    quad(V(-0.19,0.10,0.42), V(0.19,0.10,0.42), V(0.17,0.135,0.50), V(-0.17,0.135,0.50), P.mouth, 0.02);
    for(let i=0;i<6;i++){
      const t=i/5, x=-0.19+t*0.38;
      const tb=V(x,0.145,0.44+0.008*(i%2)), tt=V(x,0.170,0.435+0.008*(i%2));
      tube(tb,tt,0.016,0.004,4,P.tooth,{capB:{hex:P.tooth,lift:0.003}});
    }
  }

  /* ---------- LIMBS — squatting splayed webbed frog-legs; thighs bunched high+wide, shins tucked,
     big webbed feet planted flat. Kept within the disc footprint (feet stay near the rump/chest). --- */
  {
    const frogLeg=(hip, footX, footZ, big)=>{
      const thighR = big?0.155:0.115;
      const knee = V(hip.x + Math.sign(hip.x)*(big?0.30:0.20), 0.10, hip.z + (footZ>hip.z?0.10:-0.06));
      const foot = V(footX, groundY, footZ);
      tube(hip, knee, thighR, thighR*0.72, 7, P.hide, {phase:Math.PI/7});           // bunched thigh, out+down
      tube(knee, foot, thighR*0.62, thighR*0.34, 6, P.hideDk, {phase:Math.PI/7});    // shin down to the foot
      // webbed foot — flattened membrane fan + short splayed toes
      const side = Math.sign(foot.x||1);
      const heel = V(foot.x, groundY+0.008, foot.z-0.03);
      const toeTips=[];
      for(const [dx,dz] of [[side*0.10,0.05],[side*0.05,0.09],[-side*0.02,0.10],[-side*0.07,0.07]]){
        const tip=V(foot.x+dx, groundY+0.004, foot.z+dz);
        tube(V(foot.x,groundY+0.01,foot.z), tip, 0.020,0.008,4,P.hideDk,{capB:{hex:P.claw,lift:0.003}});
        toeTips.push(tip);
      }
      // webbing quads fanned between adjacent toes + heel (the frog-foot read)
      for(let i=0;i<toeTips.length-1;i++){
        quad(heel, toeTips[i], toeTips[i+1], V((toeTips[i].x+toeTips[i+1].x)/2, groundY+0.006, (toeTips[i].z+toeTips[i+1].z)/2 - 0.02), P.web, 0.05);
      }
    };
    // rear legs — big and bunched high, splayed wide+back (frog's power legs)
    frogLeg(V(-0.24, 0.26, -0.18), -0.40, -0.24, true);
    frogLeg(V( 0.24, 0.26, -0.18),  0.40, -0.24, true);
    // front legs — small, planted forward+wide bracing the huge chest
    frogLeg(V(-0.20, 0.18,  0.26), -0.34,  0.34, false);
    frogLeg(V( 0.20, 0.18,  0.26),  0.34,  0.34, false);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
