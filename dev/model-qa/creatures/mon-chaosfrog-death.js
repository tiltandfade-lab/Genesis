/* dev/model-qa/creatures/mon-chaosfrog-death.js — DEATH CHAOS FROG (bespoke whole-object, Medium
   aberration). Seeds/tints the chaos-frog base (WAVE 3, docs/CREATURE-MODELS-P2.md §1) toward the
   necrotic variant: a gaunter, sunken frog-aberration, warty pallid grey-white hide, wide toothy
   maw, splayed webbed limbs. NO eye quads (dark socket recesses only). Whole-object grammar: one
   function, one merged geometry frame, no anchors, no part-object transforms. Medium size,
   base disc r=0.42. Body kept tight over the disc footprint — rise happens in +y (hunched squat),
   not sprawl past the disc. */
import { V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildDeathChaosFrog(){
  /* ---------- PALETTE (VS-desaturated pallid grey-white necrotic hide, mottled) ---------- */
  const P = {
    hide:0x9a9c92, hideDk:0x74766c, hideLt:0xb4b6aa,      // pallid grey-white hide, low sat
    mottleA:0x86887c, mottleB:0x8f9186,                    // dirty mottle bands
    belly:0xc2c4b8, bellyDk:0x9a9c90,                      // sunken pale underbelly
    wart:0x62645a, wartDk:0x484a42,                        // warty necrotic bumps
    socket:0x1c1c18,                                        // dark eye-socket recess (no eye quad)
    mouth:0x28241f, tooth:0xb8b4a4, tongue:0x5a3436,       // grey-brown maw, pallid teeth
    web:0x76786c, claw:0x322f2a,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — squat hunched frog spine, low over the disc, rise in +y. ---------- */
  const spY = 0.30;
  const S = {
    rump: V(0, spY-0.03, -0.20),
    mid:  V(0, spY+0.10,  0.00),
    hunch:V(0, spY+0.20,  0.14),      // sunken hunched hump, the highest point
    chest:V(0, spY+0.08,  0.24),
    headB:V(0, spY+0.06,  0.32),
  };

  /* ---------- BODY — a squat gaunt-hunched barrel loft, sunken/warty, tight over the disc. ------ */
  tube(S.rump,  S.mid,   0.220, 0.260, 9, P.hide,    {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.03}});
  tube(S.mid,   S.hunch, 0.260, 0.215, 9, P.mottleA, {phase:Math.PI/9});
  tube(S.hunch, S.chest, 0.215, 0.185, 9, P.mottleB, {phase:Math.PI/9});
  tube(S.chest, S.headB, 0.185, 0.150, 9, P.hideDk,  {phase:Math.PI/9});
  /* sunken pale belly patch, low on the underside */
  {
    const by = spY-0.155;
    quad(V(-0.15,by,-0.14), V(0.15,by,-0.14), V(0.13,by+0.02,0.24), V(-0.13,by+0.02,0.24), P.belly, 0.05);
    quad(V(-0.10,by-0.03,-0.02), V(0.10,by-0.03,-0.02), V(0.085,by-0.01,0.16), V(-0.085,by-0.01,0.16), P.bellyDk, 0.04);
  }
  /* warty necrotic bumps scattered across the back/hunch — small pyramid-ish quads poking up */
  {
    const spots = [[-0.12,spY+0.19,-0.06],[0.11,spY+0.21,0.02],[-0.06,spY+0.27,0.16],
                   [0.08,spY+0.24,0.10],[-0.15,spY+0.06,-0.16],[0.14,spY+0.04,-0.12]];
    for(const [x,y,z] of spots){
      quad(V(x-0.020,y,z), V(x+0.020,y,z), V(x,y+0.035,z-0.01), V(x,y+0.035,z-0.01), P.wart, 0.05);
      quad(V(x,y+0.035,z-0.01), V(x,y+0.035,z-0.01), V(x,y,z+0.02), V(x-0.020,y,z), P.wartDk, 0.05);
    }
  }

  /* ---------- HEAD — wide toothy maw, sunken sockets (no eye quads), squat. --------------------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.03, cz:0.34, rx:0.185, rz:0.170, hex:P.hide},    // wide jaw/cheek base
      {y:spY+0.05, cz:0.36, rx:0.205, rz:0.185, hex:P.mottleA}, // broad cranium (widest — toad face)
      {y:spY+0.12, cz:0.32, rx:0.150, rz:0.140, hex:P.hideDk},  // sunken brow
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.16, 0.30), P.hideDk);

    /* sunken dark eye-socket recesses (shape only, no eye quads) on either side of the brow */
    for(const s of [-1,1]){
      const cx = s*0.115, cy = spY+0.095, cz = 0.36;
      quad(V(cx-0.028,cy+0.020,cz), V(cx+0.028,cy+0.020,cz), V(cx+0.024,cy-0.020,cz+0.018), V(cx-0.024,cy-0.020,cz+0.018), P.socket, 0.02);
    }

    /* WIDE TOOTHY MAW — broad flat jaw hinge across the front of the head, ringed w/ small teeth. */
    const jawY = spY-0.075;
    quad(V(-0.180,jawY,0.36), V(0.180,jawY,0.36), V(0.150,jawY-0.03,0.48), V(-0.150,jawY-0.03,0.48), P.mouth, 0.03);
    quad(V(-0.150,jawY-0.03,0.48), V(0.150,jawY-0.03,0.48), V(0.120,jawY+0.02,0.50), V(-0.120,jawY+0.02,0.50), P.mouth, 0.03);
    /* pallid teeth — small triangular tube-spikes along the upper jaw line */
    for(let i=-4;i<=4;i++){
      const tx = i*0.034;
      const tb = V(tx, jawY+0.015, 0.365+Math.abs(i)*0.006);
      const tt = V(tx, jawY-0.028, 0.365+Math.abs(i)*0.006);
      tube(tb, tt, 0.010, 0.002, 3, P.tooth, {capB:{hex:P.tooth, lift:0.003}});
    }
    /* dark tongue lolling low in the maw */
    const tgB = V(0, jawY-0.015, 0.40);
    const tgT = V(0, jawY-0.045, 0.46);
    tube(tgB, tgT, 0.045, 0.030, 5, P.tongue, {capB:{hex:P.tongue, lift:0.004}});
  }

  /* ---------- LIMBS — splayed webbed frog limbs; front short + high, rear big + folded/squat. --- */
  {
    const frontLeg=(sx, sz)=>{
      const shoulder = V(sx, spY+0.04, sz);
      const elbow = V(sx + Math.sign(sx)*0.16, spY-0.10, sz+0.06);
      const foot  = V(sx + Math.sign(sx)*0.22, 0.045, sz+0.16);
      tube(shoulder, elbow, 0.058, 0.044, 6, P.hide);
      tube(elbow, foot, 0.042, 0.030, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
      /* webbed splayed toes */
      const side = Math.sign(sx||1);
      for(const [dx,dz] of [[side*0.05,0.03],[side*0.02,0.06],[-side*0.02,0.06]]){
        const ct = V(foot.x+dx, 0.010, foot.z+dz+0.02);
        tube(foot, ct, 0.014, 0.004, 3, P.web, {capB:{hex:P.web, lift:0.003}});
      }
    };
    const rearLeg=(sx, sz)=>{
      // big folded haunch pushed out wide + back, squat-crouched (rear stays close to disc edge)
      const haunch = V(sx, spY+0.02, sz);
      const knee   = V(sx + Math.sign(sx)*0.24, spY-0.06, sz-0.10);
      const foot   = V(sx + Math.sign(sx)*0.30, 0.045, sz-0.02);
      tube(haunch, knee, 0.115, 0.075, 7, P.mottleA, {phase:Math.PI/7});
      tube(knee, foot, 0.070, 0.042, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
      const side = Math.sign(sx||1);
      for(const [dx,dz] of [[side*0.06,0.02],[side*0.03,0.06],[-side*0.02,0.06]]){
        const ct = V(foot.x+dx, 0.010, foot.z+dz+0.02);
        tube(foot, ct, 0.016, 0.005, 3, P.web, {capB:{hex:P.web, lift:0.003}});
      }
    };
    frontLeg(-0.150, 0.16);
    frontLeg( 0.150, 0.16);
    rearLeg(-0.190, -0.14);
    rearLeg( 0.190, -0.14);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
