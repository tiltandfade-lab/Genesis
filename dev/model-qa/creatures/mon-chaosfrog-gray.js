/* dev/model-qa/creatures/mon-chaosfrog-gray.js — the GRAY CHAOS FROG (bespoke aberration, Medium).
   Wave 3 frog base (docs/CREATURE-MODELS-P2.md §5): a bloated squatting frog-aberration, warty
   grey hide, splayed webbed limbs, wide toothy maw. GREY tint of the shared frog base — VS
   desaturated (dirty, mottled, never candy). NO eye quads (dark socket recesses only). Whole-object
   grammar: one function, one merged geometry frame, no anchors. Medium size: base disc r=0.42. */
import { V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGrayChaosFrog(){
  /* ---------- PALETTE (VS desaturated grey-mottled warty hide) ---------- */
  const P = {
    hide:0x5a5a52, hideDk:0x3d3d38, hideLt:0x71716a,     // grey warty hide scale
    mottleA:0x4c4c46, mottleB:0x656059,                   // dorsal mottle bands
    belly:0x8a8378, bellyDk:0x67615a,                     // pale grimy underbelly
    wart:0x333330,                                        // dark wart nubs
    mouth:0x231f1c, tooth:0x8c8578, tongue:0x6e4a48,
    socket:0x151412,                                      // dark eye-socket recess (no eye quad)
    web:0x484842,                                         // webbed membrane between toes
    claw:0x201d1a, disc:0x413e38, discTop:0x4c4842,
  };

  /* ---------- LANDMARKS — squatting frog, spine bowed up over haunches, low wide crouch. ---------- */
  const spY = 0.16;                                       // squat, low haunch-up crouch
  const S = {
    rump:  V(0, spY+0.20, -0.20),
    loin:  V(0, spY+0.30, -0.06),
    mid:   V(0, spY+0.32,  0.08),
    chest: V(0, spY+0.22,  0.20),
    throat:V(0, spY+0.10,  0.28),
  };

  /* ---------- BODY — one bloated loft, wide squat barrel bowed up over the haunches. ---------- */
  tube(S.rump,  S.loin,  0.230, 0.300, 9, P.hide,    {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.03}});
  tube(S.loin,  S.mid,   0.300, 0.290, 9, P.mottleA, {phase:Math.PI/9});
  tube(S.mid,   S.chest, 0.290, 0.220, 9, P.hide,    {phase:Math.PI/9});
  tube(S.chest, S.throat,0.220, 0.140, 8, P.mottleB, {phase:Math.PI/8, capB:{hex:P.belly, lift:0.02}});
  /* pale grimy belly patch low on the front */
  quad(V(-0.15,spY-0.02,0.02), V(0.15,spY-0.02,0.02), V(0.13,spY+0.02,0.26), V(-0.13,spY+0.02,0.26), P.belly, 0.05);
  /* dorsal wart nubs scattered over the back */
  {
    const spots = [[-0.12,spY+0.34,-0.10],[0.14,spY+0.33,-0.02],[-0.05,spY+0.36,0.06],
                   [0.10,spY+0.30,-0.16],[-0.18,spY+0.24,-0.04],[0.02,spY+0.30,0.14]];
    for(const [x,y,z] of spots){
      const b=V(x,y,z), t=V(x,y+0.035,z);
      tube(b,t,0.028,0.010,5,P.wart,{capB:{hex:P.wart,lift:0.004}});
    }
  }

  /* ---------- HEAD — wide flat frog skull fused into the body, wide toothy maw, socket recesses. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY+0.02, cz:0.34, rx:0.230, rz:0.190, hex:P.hide},    // jaw/cheek — very wide
      {y:spY+0.10, cz:0.32, rx:0.240, rz:0.200, hex:P.hideLt},  // broad cranium top
      {y:spY+0.17, cz:0.30, rx:0.170, rz:0.150, hex:P.hideDk},  // low flat brow
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.20, 0.28), P.hideDk);

    /* eye-socket recesses — dark carved pits, NOT painted eye quads, set into the brow */
    for(const s of [-1,1]){
      const cx=s*0.135, cy=spY+0.16, cz=0.38;
      quad(V(cx-0.032,cy+0.02,cz), V(cx+0.032,cy+0.02,cz), V(cx+0.026,cy-0.03,cz+0.03), V(cx-0.026,cy-0.03,cz+0.03), P.socket, 0.02);
    }

    /* WIDE TOOTHY MAW — the hinge line runs the full cheek width, small triangular teeth along it */
    const mL=V(-0.220,spY-0.01,0.46), mR=V(0.220,spY-0.01,0.46), mC=V(0,spY-0.05,0.56);
    quad(mL, mR, mC, mC, P.mouth, 0.03);
    quad(V(-0.220,spY-0.01,0.46), V(0.220,spY-0.01,0.46), V(0.20,spY+0.05,0.40), V(-0.20,spY+0.05,0.40), P.hide, 0.04);
    for(let i=0;i<7;i++){
      const t=i/6, x=-0.19+t*0.38;
      const tb=V(x,spY+0.01,0.44), tt=V(x,spY-0.055,0.475);
      tube(tb,tt,0.018,0.004,4,P.tooth,{capB:{hex:P.tooth,lift:0.003}});
    }
    /* small squat tongue tip just visible past the jaw */
    tube(V(0,spY-0.06,0.50), V(0,spY-0.07,0.58), 0.05,0.03,5,P.tongue,{capB:{hex:P.tongue,lift:0.01}});
  }

  /* ---------- LIMBS — squat splayed frog stance: short thick thighs out to the side, dropping to
     wide webbed feet planted forward/out. Front limbs shorter, rear haunches bulkier (frog crouch). --- */
  {
    const websFoot=(foot, side, big)=>{
      const toeLen = big?0.10:0.075;
      const spread = [[-0.06,-0.02],[-0.02,0.04],[0.03,0.045],[0.07,0.0]];
      const tips=[];
      for(const [dx,dz] of spread){
        const cb=V(foot.x, foot.y+0.015, foot.z);
        const ct=V(foot.x+side*dx, foot.y-0.01, foot.z+toeLen+dz);
        tube(cb,ct,0.020,0.008,4,P.claw,{capB:{hex:P.claw,lift:0.004}});
        tips.push(ct);
      }
      /* webbing membrane quads between adjacent toes */
      for(let i=0;i<tips.length-1;i++){
        quad(V(foot.x,foot.y+0.005,foot.z), tips[i], tips[i+1], V(foot.x,foot.y+0.005,foot.z), P.web, 0.04);
      }
    };
    const limb=(hip, footX, footZ, thighR, side)=>{
      const knee = V(hip.x + side*0.16, spY-0.02, hip.z + (footZ>hip.z?0.10:-0.10));
      const foot = V(footX, 0.045, footZ);
      tube(hip, knee, thighR, thighR*0.72, 7, P.hide);
      tube(knee, foot, thighR*0.70, 0.050, 6, P.mottleA, {capB:{hex:P.hideDk, lift:0.006}});
      websFoot(foot, side, thighR>0.13);
    };
    // front limbs — shorter, shoulder near chest
    limb(V(-0.19, spY+0.10, 0.16), -0.34, 0.32, 0.100, -1);
    limb(V( 0.19, spY+0.10, 0.16),  0.34, 0.32, 0.100,  1);
    // rear haunches — bulky squat crouch, knees pushed up+out (classic frog fold), feet planted wide
    limb(V(-0.22, spY+0.20, -0.16), -0.38, -0.30, 0.150, -1);
    limb(V( 0.22, spY+0.20, -0.16),  0.38, -0.30, 0.150,  1);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
