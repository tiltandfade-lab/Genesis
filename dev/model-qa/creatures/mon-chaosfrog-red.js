/* dev/model-qa/creatures/mon-chaosfrog-red.js — RED CHAOS FROG (bespoke Aberration, squat bloat-frog).
   Wave 3 (aberration) frog base + red tint. The read: a bloated squatting frog-thing hunkered low,
   a warty barrel body sagging between four splayed webbed limbs, a wide toothy maw that dominates
   the front of the head, dark socket recesses (no eye quads, house ruling 2026-07-04). DULL
   OXBLOOD-RED warty hide, VS-desaturated (mottled, never candy). Whole-object grammar: one
   function, one merged geometry frame, no anchors, no part-object transforms. Base disc r=0.55;
   the whole squat body/limbs/rear-rise stay inside that footprint (rise goes +y, not sprawled out
   past the disc). Imported by ps1-sheet.html's p2mon set + the render-gate proof sheet. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildRedChaosFrog(){
  /* ---------- PALETTE (VS desaturated; dull oxblood-red mottled warty hide) ---------- */
  const P = {
    hide:0x6e2c28, hideDk:0x4c1e1c, hideLt:0x8a3c34,     // oxblood-red warty hide
    mottleA:0x5a2420, mottleB:0x7a352e,                   // dorsal mottle bands
    belly:0x8f6255, bellyDk:0x6b4438,                     // dull pale-red underbelly
    wart:0x3f1815,                                        // dark wart nubs
    socket:0x1c0e0c, mouth:0x2a1210, tongue:0x7a3230,     // maw dark / dull tongue
    tooth:0xcabfae, web:0x532420,                         // webbed foot membrane
    disc:0x3f3128, discTop:0x4c3c30,
  };
  setChannels({ [P.hide]:'skin', [P.hideDk]:'skin', [P.hideLt]:'skin',
    [P.mottleA]:'skin', [P.mottleB]:'skin', [P.belly]:'skin', [P.bellyDk]:'skin',
    [P.tooth]:'bone' });

  /* ---------- LANDMARKS — squat body hunkered LOW, rear haunches RISE (+y), all inside r0.55. --- */
  const gy = 0.10;                              // squat ground clearance
  const S = {
    rump:  V(0, gy+0.30, -0.18),                // haunches rise up behind
    loin:  V(0, gy+0.24, -0.02),
    belly: V(0, gy+0.16,  0.14),
    chest: V(0, gy+0.20,  0.28),
    throat:V(0, gy+0.16,  0.36),
    headB: V(0, gy+0.22,  0.40),
  };

  /* ---------- BODY — one bloated horizontal loft, wide barrel sagging low between the limbs. ---------- */
  tube(S.rump,  S.loin,  0.235, 0.290, 9, P.hide,    {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.03}});
  tube(S.loin,  S.belly, 0.290, 0.310, 9, P.mottleA, {phase:Math.PI/9});
  tube(S.belly, S.chest, 0.310, 0.260, 9, P.hide,    {phase:Math.PI/9});
  tube(S.chest, S.throat,0.260, 0.170, 9, P.mottleB, {phase:Math.PI/9});
  /* pale sagging underbelly strip, low on the flanks (the bloat read) */
  {
    const by = gy-0.02;
    quad(V(-0.20,by,-0.10), V(0.20,by,-0.10), V(0.17,by+0.03,0.30), V(-0.17,by+0.03,0.30), P.belly, 0.05);
    quad(V(-0.15,by-0.03,0.02), V(0.15,by-0.03,0.02), V(0.13,by,0.24), V(-0.13,by,0.24), P.bellyDk, 0.05);
  }
  /* warty nubs scattered across the back — small dark pyramids, the "warty hide" read */
  {
    const warts = [[-0.12,gy+0.40,-0.14],[0.10,gy+0.42,-0.08],[0.16,gy+0.34,0.04],
                   [-0.17,gy+0.32,-0.02],[0.02,gy+0.44,-0.20],[-0.05,gy+0.30,0.16],[0.13,gy+0.24,0.22]];
    for(const [x,y,z] of warts){
      const b0=V(x-0.022,y,z-0.02), b1=V(x+0.022,y,z-0.02), b2=V(x+0.018,y,z+0.02), b3=V(x-0.018,y,z+0.02);
      quad(b0,b1,V(x,y+0.035,z),V(x,y+0.035,z), P.wart, 0.05);
      quad(b3,b2,V(x,y+0.035,z),V(x,y+0.035,z), P.wart, 0.05);
    }
  }

  /* ---------- HEAD — wide flat toothy-maw dominating the front, dark socket recesses (no eyes). --- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:gy+0.02,  cz:0.42, rx:0.220, rz:0.180, hex:P.hide},    // wide jaw hinge
      {y:gy+0.20,  cz:0.44, rx:0.240, rz:0.190, hex:P.hide},    // broad cranium
      {y:gy+0.32,  cz:0.40, rx:0.170, rz:0.140, hex:P.hideDk},  // low flat crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, gy+0.36, 0.38), P.hideDk);

    /* dark socket recesses (shape only, sunk into the crown — NOT painted eye quads) */
    for(const s of [-1,1]){
      const cx=s*0.135, cy2=gy+0.30, cz=0.46;
      quad(V(cx-0.035,cy2,cz-0.03), V(cx+0.035,cy2,cz-0.03), V(cx+0.028,cy2-0.045,cz+0.01), V(cx-0.028,cy2-0.045,cz+0.01), P.socket, 0.03);
    }

    /* WIDE TOOTHY MAW — a broad gash across the front of the head with jagged teeth along the rim */
    const mL=V(-0.205,gy+0.06,0.60), mR=V(0.205,gy+0.06,0.60);
    const mLb=V(-0.170,gy-0.06,0.58), mRb=V(0.170,gy-0.06,0.58);
    quad(mL, mR, mRb, mLb, P.mouth, 0.04);
    /* jagged teeth along the upper rim */
    const nTeeth=7;
    for(let i=0;i<nTeeth;i++){
      const t=i/(nTeeth-1), x=-0.185+t*0.37;
      const top=V(x,gy+0.055,0.595), b0=V(x-0.018,gy-0.01,0.585), b1=V(x+0.018,gy-0.01,0.585);
      quad(b0,b1,top,top, P.tooth, 0.05);
    }
    /* dull tongue lolling slightly forward/down out of the maw */
    tube(V(0,gy-0.01,0.58), V(0,gy-0.05,0.66), 0.045, 0.030, 5, P.tongue, {capB:{hex:P.tongue, lift:0.006}});
  }

  /* ---------- LIMBS — four short squat legs, splayed OUT to the sides, ending in webbed feet. ------ */
  {
    const squatLeg=(hip, footX, footZ, hex)=>{
      const kneeX = hip.x + Math.sign(hip.x)*0.16;
      const knee = V(kneeX, gy+0.04, hip.z + (footZ>hip.z?0.05:-0.05));
      const foot = V(footX, gy-0.06, footZ);
      tube(hip, knee, 0.100, 0.075, 7, hex);
      tube(knee, foot, 0.072, 0.050, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
      /* webbed splayed foot — a membrane fan of 3 toes joined by webbing */
      const side = Math.sign(foot.x||1);
      const toeTips=[];
      for(const [dx,dz] of [[side*0.09,0.03],[side*0.05,0.09],[-side*0.02,0.09]]){
        toeTips.push(V(foot.x+dx, gy-0.075, foot.z+dz));
      }
      const padA=V(foot.x, gy-0.06, foot.z), padB=V(foot.x, gy-0.06, foot.z+0.02);
      quad(padA, toeTips[0], toeTips[1], padB, P.web, 0.05);
      quad(padB, toeTips[1], toeTips[2], padA, P.web, 0.05);
      for(const tip of toeTips) tube(V(tip.x*0.6+foot.x*0.4, gy-0.065, tip.z*0.6+foot.z*0.4), tip, 0.014, 0.005, 4, P.hideDk, {capB:{hex:P.hideDk, lift:0.003}});
    };
    /* front limbs — short, shoulder near the chest, splayed forward-out */
    squatLeg(V(-0.235, gy+0.18, 0.24), -0.40, 0.34, P.hide);
    squatLeg(V( 0.235, gy+0.18, 0.24),  0.40, 0.34, P.hide);
    /* rear haunch limbs — thicker at hip (bloated rear), splayed back-out, driving the rear rise */
    tube(V(-0.20, gy+0.30, -0.20), V(-0.34, gy+0.10, -0.10), 0.130, 0.090, 7, P.mottleA); // haunch bulge L
    tube(V( 0.20, gy+0.30, -0.20), V( 0.34, gy+0.10, -0.10), 0.130, 0.090, 7, P.mottleA); // haunch bulge R
    squatLeg(V(-0.34, gy+0.10, -0.10), -0.46, -0.16, P.hideDk);
    squatLeg(V( 0.34, gy+0.10, -0.10),  0.46, -0.16, P.hideDk);
  }

  /* ---------- base disc (Medium-large squat footprint: r=0.55 per the brief) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
