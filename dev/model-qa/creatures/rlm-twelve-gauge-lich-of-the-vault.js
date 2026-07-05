/* dev/model-qa/creatures/rlm-twelve-gauge-lich-of-the-vault.js — "Twelve-Gauge Lich of the Vault"
   (frontier realm, Medium undead, CR 10, disc r=0.42). A skeletal bank-president lich in a
   pinstriped vault coat, a double-barrel shotgun fused directly to its bone hands/forearms
   (bone and iron grown together). VS-desaturated bone-grey + dusty black-suit palette.
   No eye quads — deep skull sockets. Whole-object grammar, one merged frame. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTwelveGaugeLichOfTheVault(){
  const P = {
    bone:0x9c927a, boneDk:0x6e6552, boneLt:0xb0a68c,
    coat:0x272420, coatDk:0x151310, pinstripe:0x453f36,
    gun:0x3a3630, gunDk:0x201d19, brass:0x8a7042,
    socket:0x120f0c, jaw:0x8c8268,
    disc:0x4a4038, discTop:0x584a3a,
  };

  const S = {
    pelvis:V(0,0.52,0), waist:V(0,0.70,0), chest:V(0,0.94,0.01), shldr:V(0,1.12,0), neck:V(0,1.20,0.01), headB:V(0,1.28,0.01), crown:V(0,1.44,0),
  };

  /* torso — narrow bone frame in a buttoned vault coat, pinstripe hint */
  tube(S.pelvis, S.waist, 0.155, 0.170, 8, P.coat, {phase:Math.PI/8});
  tube(S.waist, S.chest, 0.170, 0.195, 8, P.coatDk, {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.195, 0.175, 8, P.coat, {phase:Math.PI/8});
  tube(S.shldr, S.neck, 0.175, 0.075, 8, P.coatDk, {phase:Math.PI/8});
  /* coat lapels + pinstripe verticals */
  quad(V(-0.07,1.08,0.16), V(0.07,1.08,0.16), V(0.10,0.60,0.18), V(-0.10,0.60,0.18), P.coatDk, 0.04);
  for(const s of [-1,1]) quad(V(s*0.14,1.05,0.14), V(s*0.15,1.05,0.14), V(s*0.16,0.58,0.16), V(s*0.15,0.58,0.16), P.pinstripe, 0.03);

  /* skull head — narrow, gaunt, deep sockets, no eyes */
  {
    const n=8, ph=Math.PI/n;
    const bands=[{y:1.24,rx:0.085,rz:0.088,hex:P.bone},{y:1.32,rx:0.095,rz:0.092,hex:P.boneLt},{y:1.40,rx:0.075,rz:0.072,hex:P.boneDk}];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.44,0), P.boneDk);
    for(const s of [-1,1]) quad(V(s*0.055,1.34,0.075), V(s*0.02,1.34,0.078), V(s*0.02,1.28,0.078), V(s*0.055,1.28,0.075), P.socket, 0.02);
    /* jaw / grin */
    quad(V(-0.06,1.24,0.075), V(0.06,1.24,0.075), V(0.05,1.19,0.078), V(-0.05,1.19,0.078), P.jaw, 0.04);
    for(let i=-2;i<=2;i++) quad(V(i*0.018-0.006,1.235,0.076), V(i*0.018+0.006,1.235,0.076), V(i*0.018+0.005,1.20,0.078), V(i*0.018-0.005,1.20,0.078), P.boneDk, 0.02);
  }
  /* banker's top hat, low crown */
  {
    const r1=ring(V(0,1.44,0),V(0,1,0),0.135,0.135,10);
    const r2=ring(V(0,1.46,0),V(0,1,0),0.075,0.075,10);
    const r3=ring(V(0,1.60,0),V(0,1,0),0.075,0.075,10);
    stitch([r1,r2],()=>P.coatDk); stitch([r2,r3],()=>P.coatDk); capFan(r3, V(0,1.62,0), P.coatDk);
  }

  /* SHOTGUN-FUSED FOREARMS — bone forearm melts directly into double-barrel iron; no separate hand */
  const gunArm=(shoulder, side)=>{
    const elbow = V(shoulder.x+side*0.06, shoulder.y-0.22, shoulder.z+0.10);
    const fuse = V(shoulder.x+side*0.10, shoulder.y-0.40, shoulder.z+0.22);
    tube(shoulder, elbow, 0.062, 0.048, 6, P.coat, {phase:Math.PI/6});
    tube(elbow, fuse, 0.048, 0.040, 6, P.bone, {phase:Math.PI/6});     // bare bone forearm
    /* barrels growing from the fused wrist, side by side, pointing forward-down */
    const bEnd = V(fuse.x+side*0.02, fuse.y-0.10, fuse.z+0.46);
    for(const bo of [-0.022,0.022]){
      tube(V(fuse.x+bo,fuse.y,fuse.z), V(bEnd.x+bo,bEnd.y,bEnd.z), 0.026, 0.020, 6, P.gun, {capB:{hex:P.gunDk}});
    }
    /* stock/receiver bulge fused at the wrist joint */
    quad(V(fuse.x-0.05,fuse.y+0.04,fuse.z-0.06), V(fuse.x+0.05,fuse.y+0.04,fuse.z-0.06),
         V(fuse.x+0.045,fuse.y-0.05,fuse.z-0.02), V(fuse.x-0.045,fuse.y-0.05,fuse.z-0.02), P.gunDk, 0.04);
    /* small brass hammer/trigger detail */
    quad(V(fuse.x+side*0.02,fuse.y-0.02,fuse.z+0.02), V(fuse.x+side*0.04,fuse.y-0.02,fuse.z+0.02),
         V(fuse.x+side*0.04,fuse.y-0.06,fuse.z+0.02), V(fuse.x+side*0.02,fuse.y-0.06,fuse.z+0.02), P.brass, 0.03);
  };
  gunArm(V(-0.19,1.06,0.02), -1);
  gunArm(V( 0.19,1.06,0.02),  1);

  /* legs — bone shins under coat hem */
  for(const s of [-1,1]){
    const hip=V(s*0.09,0.50,0), knee=V(s*0.10,0.28,0.02), foot=V(s*0.10,0.04,0.06);
    tube(hip,knee,0.095,0.070,7,P.coat);
    tube(knee,foot,0.055,0.045,6,P.bone,{capB:{hex:P.boneDk,lift:0.01}});
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
