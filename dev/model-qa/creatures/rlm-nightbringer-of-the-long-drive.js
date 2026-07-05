/* dev/model-qa/creatures/rlm-nightbringer-of-the-long-drive.js — "Nightbringer of the Long Drive"
   (frontier realm, Large fiend/undead, CR 13, disc r=0.55). A tall cattle-drive foreman in a
   blood-dark duster, wide-brim hat pulled low, with BACKWARD-bending hands (wrong-jointed at
   the wrist, fingers curling the wrong way) — the unsettling tell under the ordinary silhouette.
   VS-desaturated near-black dried-blood duster over pale gaunt skin. No eye quads. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildNightbringerOfTheLongDrive(){
  const P = {
    duster:0x38191a, dusterDk:0x210f10, dusterLt:0x4a2224,   // blood-dark duster
    skin:0x8a8272, skinDk:0x5c5648, skinLt:0x9e9686,
    hat:0x1c1614, hatDk:0x100c0b,
    socket:0x120e0d, boot:0x201412,
    disc:0x4a4038, discTop:0x584a3a,
  };

  /* tall landmark spine — Large, an imposing rangy foreman */
  const S = {
    pelvis:V(0,0.70,0), waist:V(0,0.98,0.01), chest:V(0,1.32,0.00), shldr:V(0,1.56,-0.01),
    neck:V(0,1.66,0.01), headB:V(0,1.76,0.02),
  };

  /* torso — long, lean, duster-wrapped */
  tube(S.pelvis, S.waist, 0.235, 0.255, 9, P.duster, {phase:Math.PI/9});
  tube(S.waist, S.chest, 0.255, 0.270, 9, P.dusterLt, {phase:Math.PI/9});
  tube(S.chest, S.shldr, 0.270, 0.235, 9, P.duster, {phase:Math.PI/9});
  tube(S.shldr, S.neck, 0.235, 0.105, 9, P.dusterDk, {phase:Math.PI/9});
  /* long duster hem, sweeping and split */
  {
    const hemPts=[[-0.30,0.30,0.14],[-0.16,0.20,0.20],[0,0.16,0.22],[0.16,0.22,0.18],[0.30,0.32,0.12]];
    for(let i=0;i<hemPts.length-1;i++){
      const a=hemPts[i], b=hemPts[i+1];
      quad(V(a[0],0.90,a[2]-0.04), V(b[0],0.90,b[2]-0.04), V(b[0],b[1],b[2]), V(a[0],a[1],a[2]), P.duster, 0.06);
    }
  }
  quad(V(-0.02,1.55,0.24), V(0.02,1.55,0.24), V(0.03,0.68,0.24), V(-0.03,0.68,0.24), P.dusterDk, 0.04);

  /* head — gaunt, hat pulled low, deep sockets */
  {
    const n=8, ph=Math.PI/n;
    const bands=[{y:1.70,rx:0.100,rz:0.100,hex:P.skin},{y:1.79,rx:0.108,rz:0.104,hex:P.skinLt},{y:1.87,rx:0.086,rz:0.080,hex:P.skinDk}];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.92,0.01), P.skinDk);
    for(const s of [-1,1]) quad(V(s*0.06,1.815,0.095), V(s*0.02,1.815,0.10), V(s*0.02,1.755,0.10), V(s*0.06,1.755,0.095), P.socket, 0.02);
    /* gaunt jaw shadow */
    quad(V(-0.06,1.685,0.09), V(0.06,1.685,0.09), V(0.045,1.63,0.095), V(-0.045,1.63,0.095), P.skinDk, 0.04);
  }
  /* wide-brim hat pulled low over the sockets */
  {
    const r1=ring(V(0,1.855,0.01),V(0,1,0),0.185,0.185,10);
    const r2=ring(V(0,1.865,0.01),V(0,1,0),0.10,0.10,10);
    const r3=ring(V(0,2.02,0.01),V(0,1,0),0.09,0.09,10);
    stitch([r1,r2],()=>P.hatDk); stitch([r2,r3],()=>P.hat); capFan(r3, V(0,2.08,0.01), P.hat);
    /* brim tilted down at the front, extra shadow wedge over the face */
    quad(V(-0.14,1.85,0.10), V(0.14,1.85,0.10), V(0.16,1.80,0.19), V(-0.16,1.80,0.19), P.hatDk, 0.05);
  }

  /* ARMS — normal upper arm, but the WRIST BENDS BACKWARD and fingers curl the wrong way */
  const wrongArm=(side)=>{
    const shoulder=V(side*0.30,1.50,-0.01);
    const elbow=V(side*0.36,1.24,0.14);
    const wrist=V(side*0.33,1.02,0.20);
    /* hand snaps BACKWARD from the wrist — bends up/back instead of continuing down/forward */
    const handBack=V(side*0.30,1.10,0.06);
    tube(shoulder,elbow,0.068,0.052,6,P.duster,{phase:Math.PI/6});
    tube(elbow,wrist,0.052,0.038,6,P.dusterDk,{phase:Math.PI/6});
    /* the wrong-jointed reversal */
    tube(wrist,handBack,0.038,0.030,5,P.skin,{phase:Math.PI/5,capB:{hex:P.skinDk,lift:0.012}});
    /* fingers curling the WRONG way — arcing back toward the forearm, not forward */
    for(const s2 of [-1,-0.4,0.2,0.8]){
      const fb=V(handBack.x+side*s2*0.02, handBack.y+0.02, handBack.z);
      const ft=V(fb.x, fb.y+0.09, fb.z-0.06);   // curls UP and BACK — the tell
      tube(fb,ft,0.012,0.005,4,P.skinDk,{capB:{hex:P.skinDk}});
    }
  };
  wrongArm(-1); wrongArm(1);

  /* legs — booted, long stride */
  for(const s of [-1,1]){
    const hip=V(s*0.15,0.68,0.00), knee=V(s*0.16,0.38,0.05), foot=V(s*0.16,0.06,0.12);
    tube(hip,knee,0.155,0.120,8,P.duster);
    tube(knee,foot,0.100,0.085,7,P.boot,{capB:{hex:P.boot,lift:0.02}});
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
