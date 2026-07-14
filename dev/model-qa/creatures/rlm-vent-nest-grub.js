/* dev/model-qa/creatures/rlm-vent-nest-grub.js — the VENT-NEST GRUB (chrome realm, Small).
   A pale larval grub curled in a scrap of air-duct sheeting, feeding on waste heat. Read: a soft
   segmented C-curl body low to the ground, pallid translucent-looking hide, tucked stub head with
   a small heat-sucking maw, and a torn strip of duct sheet metal draped over its back like a shell
   flap. VS-desaturated: sickly pale grub flesh, dull galvanized duct grey. NO eye quads — a blunt
   sensory-pit snout only. Whole-object grammar: one function, one frame, no anchors. Small size:
   base disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildVentNestGrub(){
  /* ---------- PALETTE ---------- */
  const P = {
    grub:0x9a9484, grubDk:0x767060, grubLt:0xb2ac9a,     // pale sickly larval flesh
    seg:0x817b6a,                                          // segment crease shade
    belly:0xc4bfae,                                        // paler underside
    pit:0x2c2a24, maw:0x453f34,                            // sensory pit / small maw
    duct:0x6d7178, ductDk:0x4a4d52, ductLt:0x878b90,       // galvanized duct sheet
    rust:0x5c4a3a,                                          // rust streak on the duct scrap
    disc:0x423e36, discTop:0x504c42,
  };

  /* ---------- LANDMARKS — a low C-curl spine, segments coiling from tail to tucked head. ---------- */
  const bY = 0.13;
  const S = {
    tail:  V(-0.18, bY-0.02, -0.20),
    segA:  V(-0.22, bY+0.02, -0.02),
    segB:  V(-0.16, bY+0.05,  0.14),
    segC:  V(-0.02, bY+0.06,  0.22),
    segD:  V( 0.12, bY+0.04,  0.20),
    headB: V( 0.20, bY+0.00,  0.10),
    headT: V( 0.24, bY-0.02,  0.02),   // tucked stub head, curling back under
  };

  /* ---------- BODY — segmented soft loft along the curl, tapering both ends. ---------- */
  tube(S.tail,  S.segA, 0.055, 0.095, 8, P.grubDk, {phase:Math.PI/8, capA:{hex:P.grubDk, lift:0.01}});
  tube(S.segA,  S.segB, 0.095, 0.120, 8, P.grub,   {phase:Math.PI/8});
  tube(S.segB,  S.segC, 0.120, 0.128, 8, P.grubLt, {phase:Math.PI/8});
  tube(S.segC,  S.segD, 0.128, 0.108, 8, P.grub,   {phase:Math.PI/8});
  tube(S.segD,  S.headB,0.108, 0.078, 8, P.grubDk, {phase:Math.PI/8});
  tube(S.headB, S.headT,0.078, 0.050, 7, P.grub,   {phase:Math.PI/7, capB:{hex:P.grub, lift:0.01}});

  /* segment crease rings — dark grooves marking each body ring */
  for(const c of [S.segA, S.segB, S.segC, S.segD]){
    const r = ring(V(c.x, c.y, c.z), V(0,1,0.15), 0.06, 0.05, 8, Math.PI/8);
    stitch([r, ring(V(c.x,c.y-0.006,c.z), V(0,1,0.15), 0.058, 0.048, 8, Math.PI/8)], ()=>P.seg);
  }

  /* pale belly strip low along the curl's inner edge */
  {
    const by = bY-0.075;
    quad(V(-0.20,by,-0.14), V(-0.10,by,-0.02), V(0.06,by+0.01,0.16), V(-0.06,by+0.01,0.02), P.belly, 0.05);
    quad(V(-0.06,by+0.01,0.02), V(0.06,by+0.01,0.16), V(0.16,by,0.14), V(0.08,by,0.06), P.belly, 0.05);
  }

  /* ---------- HEAD — blunt tucked stub with a small sensory pit and heat-sucking maw. ---------- */
  {
    const pitC = V(0.255, bY-0.015, -0.01);
    quad(V(pitC.x-0.018,pitC.y+0.014,pitC.z), V(pitC.x+0.008,pitC.y+0.014,pitC.z-0.014),
         V(pitC.x+0.008,pitC.y-0.014,pitC.z-0.014), V(pitC.x-0.018,pitC.y-0.014,pitC.z), P.pit, 0.0);
    // small round maw at the very tip, puckered for heat-feeding
    const mawC = V(0.275, bY-0.02, -0.03);
    const r1 = ring(mawC, V(1,0.1,-0.3), 0.026, 0.026, 6, Math.PI/6);
    capFan(r1, V(mawC.x+0.012, mawC.y, mawC.z-0.01), P.maw);
  }

  /* ---------- DUCT-SHEET FLAP — a torn strip of galvanized sheet metal draped over the back. ---------- */
  {
    const dA = V(-0.20, bY+0.11, -0.08);
    const dB = V(-0.02, bY+0.15,  0.10);
    const dC = V( 0.14, bY+0.10,  0.16);
    // draped shell-flap quads, slightly bent, torn ragged edge
    quad(V(dA.x-0.06,dA.y,dA.z), V(dA.x+0.10,dA.y+0.02,dA.z+0.05), V(dB.x+0.08,dB.y,dB.z+0.02), V(dB.x-0.08,dB.y-0.01,dB.z-0.03), P.duct, 0.06);
    quad(V(dB.x-0.08,dB.y-0.01,dB.z-0.03), V(dB.x+0.08,dB.y,dB.z+0.02), V(dC.x+0.07,dC.y-0.02,dC.z+0.03), V(dC.x-0.09,dC.y-0.03,dC.z-0.02), P.ductLt, 0.06);
    // ragged torn edge teeth along the trailing side
    for(const t of [-0.16,-0.06,0.05]){
      quad(V(t,bY+0.10,-0.12), V(t+0.04,bY+0.10,-0.12), V(t+0.02,bY+0.06,-0.16), V(t-0.01,bY+0.06,-0.15), P.ductDk, 0.05);
    }
    // rust streak down the flap
    quad(V(-0.06,bY+0.13,0.0), V(-0.02,bY+0.13,0.01), V(-0.01,bY+0.08,0.10), V(-0.05,bY+0.08,0.09), P.rust, 0.04);
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.036,0), V(0,1,0), 0.305, 0.305, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.038,0), P.discTop);
  }
}
