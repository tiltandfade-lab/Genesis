/* dev/model-qa/creatures/rlm-chrome-rustbelt-marauder.js — the CHROME RUSTBELT MARAUDER (chrome
   realm, Medium). A road-gang raider in a sparking, overdue combat exosuit. Read: a bulky humanoid
   figure encased in a battered mismatched exosuit frame (shoulder pauldron actuators, forearm
   hydraulic braces, a heavy chestplate), sparking at a loose joint, standing in a wide aggressive
   ready stance with a mounted forearm weapon. NO eye quads — the exosuit "face" is a slit-vent
   visor, not eyes. VS-desaturated: rust-red/oxide exosuit plating, dull hydraulic-black joints,
   grimy chrome highlights, small live-spark accent. Whole-object grammar: one function, one frame,
   no anchors. Medium size: base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildChromeRustbeltMarauder(){
  /* ---------- PALETTE ---------- */
  const P = {
    plate:0x6e4530, plateDk:0x4a2e20, plateLt:0x8a5c40,       // rust-red/oxide exosuit plating
    frame:0x4a4c4e, frameDk:0x323436,                           // chassis frame
    joint:0x1c1c1c, jointLt:0x2e2e2e,                           // hydraulic-black joints
    chrome:0x8a8d8f,                                             // grimy chrome highlight
    visor:0x1a1c1d,                                              // slit-vent visor
    spark:0xc99a3e, sparkHot:0xe8c878,                          // live spark accent
    weapon:0x3c3d3a,
    disc:0x362f28, discTop:0x423a30,
  };

  /* ---------- LANDMARKS — wide aggressive stance, bulky exosuit torso, one arm weaponed. ---------- */
  const S = {
    pelvis: V(0, 0.44, 0.0),
    gut:    V(0, 0.62, 0.02),
    chest:  V(0, 0.82, 0.04),
    neck:   V(0, 0.96, 0.06),
    headB:  V(0, 1.06, 0.07),
    shR:    V( 0.24, 0.86, 0.02),
    shL:    V(-0.24, 0.86, 0.02),
    hipR:   V( 0.14, 0.42, 0.0),
    hipL:   V(-0.14, 0.42, 0.0),
  };

  /* ---------- TORSO — bulky exosuit chassis, chestplate + frame gaps. ---------- */
  tube(S.pelvis, S.gut,   0.175, 0.205, 8, P.frame,   {phase:Math.PI/8});
  tube(S.gut,    S.chest, 0.205, 0.235, 8, P.plate,    {phase:Math.PI/8});
  tube(S.chest,  S.neck,  0.210, 0.095, 8, P.plateDk,  {phase:Math.PI/8});
  tube(S.neck,   S.headB, 0.090, 0.075, 6, P.frameDk,  {phase:Math.PI/6});

  /* ---------- CHESTPLATE — large armored plate over the chest, riveted, battered. ---------- */
  {
    quad(V(-0.19,0.94,0.16), V(0.19,0.94,0.16), V(0.16,0.66,0.20), V(-0.16,0.66,0.20), P.plateLt, 0.06);
    // rivet dots
    for(const [x,y] of [[-0.13,0.88],[0.13,0.88],[-0.11,0.72],[0.11,0.72]]){
      quad(V(x-0.012,y+0.01,0.205), V(x+0.012,y+0.01,0.205), V(x+0.010,y-0.01,0.20), V(x-0.010,y-0.01,0.20), P.chrome, 0.05);
    }
    // battle-damage dent/scratch
    quad(V(-0.05,0.80,0.205), V(0.06,0.78,0.205), V(0.04,0.72,0.20), V(-0.06,0.74,0.20), P.plateDk, 0.08);
  }

  /* ---------- HEAD — helmet-frame with a slit-vent visor (no eye quads). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.00, cz:0.06, rx:0.078, rz:0.082, hex:P.frame},
      {y:1.09, cz:0.05, rx:0.082, rz:0.084, hex:P.frameDk},
      {y:1.17, cz:0.03, rx:0.068, rz:0.070, hex:P.frame},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.21,0.03), P.frame);
    // slit-vent visor across the front
    quad(V(-0.045,1.075,0.135), V(0.045,1.075,0.135), V(0.038,1.055,0.13), V(-0.038,1.055,0.13), P.visor, 0.0);
    quad(V(-0.038,1.045,0.128), V(0.038,1.045,0.128), V(0.032,1.028,0.122), V(-0.032,1.028,0.122), P.visor, 0.0);
  }

  /* ---------- SHOULDER PAULDRON ACTUATORS — bulky mismatched armor blocks, one sparking loose. ---------- */
  {
    for(const [sh,side,hex] of [[S.shR,1,P.plateLt],[S.shL,-1,P.plate]]){
      const n=7, ph=Math.PI/7;
      const bands=[
        {y:sh.y+0.06, cz:sh.z, cx:sh.x, rx:0.115, rz:0.105, hex:hex},
        {y:sh.y-0.06, cz:sh.z+0.02, cx:sh.x, rx:0.125, rz:0.115, hex:P.plateDk},
      ];
      const rings=bands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
      stitch(rings, b=>bands[b].hex);
      capFan(rings[0], V(sh.x,sh.y+0.10,sh.z), hex);
    }
    // sparking loose joint at the left shoulder seam
    const sparkC = V(-0.30, 0.80, 0.05);
    quad(V(sparkC.x-0.02,sparkC.y+0.03,sparkC.z), V(sparkC.x+0.02,sparkC.y+0.04,sparkC.z),
         V(sparkC.x+0.01,sparkC.y-0.02,sparkC.z+0.01), V(sparkC.x-0.03,sparkC.y-0.01,sparkC.z), P.sparkHot, 0.2);
    quad(V(sparkC.x-0.035,sparkC.y+0.05,sparkC.z-0.01), V(sparkC.x+0.01,sparkC.y+0.06,sparkC.z),
         V(sparkC.x,sparkC.y+0.02,sparkC.z), V(sparkC.x-0.04,sparkC.y+0.01,sparkC.z-0.01), P.spark, 0.2);
  }

  /* ---------- ARMS — right arm has a mounted forearm weapon, hydraulic braces on both. ---------- */
  {
    const elbowR = V(0.34, 0.62, 0.10);
    const handR  = V(0.36, 0.42, 0.22);
    tube(S.shR, elbowR, 0.095, 0.075, 7, P.plate, {phase:Math.PI/7});
    tube(elbowR, handR, 0.070, 0.055, 7, P.frame, {phase:Math.PI/7, capB:{hex:P.jointLt, lift:0.01}});
    // mounted forearm weapon barrel
    const wBase = V(0.36, 0.44, 0.24);
    const wTip  = V(0.36, 0.40, 0.52);
    tube(wBase, wTip, 0.038, 0.026, 6, P.weapon, {phase:Math.PI/6, capB:{hex:P.frameDk, lift:0.006}});

    const elbowL = V(-0.34, 0.60, 0.08);
    const handL  = V(-0.32, 0.40, 0.14);
    tube(S.shL, elbowL, 0.095, 0.072, 7, P.plateDk, {phase:Math.PI/7});
    tube(elbowL, handL, 0.068, 0.052, 7, P.frameDk, {phase:Math.PI/7, capB:{hex:P.jointLt, lift:0.01}});
    // hydraulic brace rings on both forearms
    for(const [a,b] of [[elbowR,handR],[elbowL,handL]]){
      const mid=V((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);
      const r=ring(mid, V(0,1,0.2), 0.06, 0.06, 6, Math.PI/6);
      capFan(r, V(mid.x,mid.y+0.01,mid.z), P.chrome);
    }
  }

  /* ---------- LEGS — wide aggressive combat stance, armored greaves. ---------- */
  {
    const legDown=(hip, footX, footZ, hex)=>{
      const knee=V(hip.x*1.4, 0.22, hip.z+0.10);
      const foot=V(footX, 0.03, footZ);
      tube(hip, knee, 0.115, 0.085, 7, hex, {phase:Math.PI/7});
      tube(knee, foot, 0.082, 0.062, 7, P.frame, {phase:Math.PI/7, capB:{hex:P.frameDk, lift:0.01}});
    };
    legDown(S.hipR, 0.26, 0.16, P.plate);
    legDown(S.hipL, -0.26, 0.14, P.plateDk);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.040,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.043,0), P.discTop);
  }
}
