/* dev/model-qa/creatures/rlm-storm-called-thunderbird.js — "Storm-Called Thunderbird"
   (frontier realm, Gargantuan monstrosity, CR 11, disc r=0.72). A storm-wreathed raptor the
   size of a barn: massive hooked-beak head, huge wingspan sweeping wide with lightning-crackle
   veins running the flight feathers, taloned feet, a short fanned tail. VS-desaturated
   storm-slate/charcoal palette with dull electric-blue crackle accents (kept desaturated —
   not neon). No eye quads — deep brow-ridge sockets. Whole-object grammar, one merged frame. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildStormCalledThunderbird(){
  const P = {
    plum:0x4a4e54, plumDk:0x2e3237, plumLt:0x62666c,        // storm-slate body plumage
    darkPlum:0x363a3f, crackle:0x5c7a86, crackleLt:0x7a9aa4, // dull desaturated electric-blue
    beak:0x2a2620, beakLt:0x3f382c, claw:0x1c1a16,
    socket:0x14161a, disc:0x4a4038, discTop:0x584a3a,
  };

  /* landmark spine — low horizontal barn-sized body */
  const S = {
    tailBase:V(0,0.68,-0.62), rump:V(0,0.72,-0.36), mid:V(0,0.76,-0.02), chest:V(0,0.80,0.30),
    neckB:V(0,0.92,0.50), neckM:V(0,1.08,0.62), headB:V(0,1.22,0.70),
  };

  /* body — broad barrel */
  tube(S.rump, S.mid, 0.34, 0.38, 10, P.plum, {phase:Math.PI/10});
  tube(S.mid, S.chest, 0.38, 0.34, 10, P.plumDk, {phase:Math.PI/10});
  tube(S.chest, S.neckB, 0.30, 0.20, 9, P.plum, {phase:Math.PI/9});
  tube(S.neckB, S.neckM, 0.20, 0.15, 9, P.plumLt, {phase:Math.PI/9});
  tube(S.neckM, S.headB, 0.15, 0.13, 9, P.plumDk, {phase:Math.PI/9});

  /* HEAD — huge hooked beak, brow-ridge sockets */
  {
    const n=9, ph=Math.PI/n;
    const bands=[{y:1.20,cz:0.68,rx:0.150,rz:0.155,hex:P.plum},{y:1.30,cz:0.70,rx:0.165,rz:0.155,hex:P.plumLt},{y:1.38,cz:0.66,rx:0.130,rz:0.125,hex:P.plumDk}];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.44,0.66), P.plumDk);
    for(const s of [-1,1]) quad(V(s*0.11,1.32,0.78), V(s*0.05,1.32,0.80), V(s*0.05,1.26,0.80), V(s*0.11,1.26,0.78), P.socket, 0.02);
    /* massive hooked beak */
    const bB=V(0,1.20,0.80), bM=V(0,1.14,0.98), bT=V(0,1.06,1.10), hook=V(0,0.98,1.14);
    tube(bB,bM,0.115,0.075,n,P.beak,{raz:0.09,rbz:0.06,phase:ph});
    tube(bM,bT,0.075,0.035,n,P.beak,{raz:0.06,rbz:0.026,phase:ph});
    tube(bT,hook,0.035,0.010,n,P.beakLt,{phase:ph,capB:{hex:P.beakLt}});
    quad(V(-0.05,1.10,0.86), V(0.05,1.10,0.86), V(0.035,1.05,1.04), V(-0.035,1.05,1.04), P.beakLt, 0.03);
  }
  /* crest feathers, storm-swept back */
  for(const s of [-1,0,1]) tube(V(s*0.05,1.40,0.60), V(s*0.10,1.58,0.44), 0.03,0.006,4,P.darkPlum,{capB:{hex:P.crackle}});

  /* MASSIVE WINGS — sweep wide out to the sides, primary feathers with crackle-vein accents */
  const wing=(side)=>{
    const root=V(side*0.32,0.86,0.10);
    const elbow=V(side*0.95,0.98,-0.02);
    const wrist=V(side*1.55,0.86,-0.18);
    const tip=V(side*2.05,0.62,-0.34);
    tube(root,elbow,0.22,0.16,8,P.plum,{phase:Math.PI/8});
    tube(elbow,wrist,0.16,0.10,8,P.plumDk,{phase:Math.PI/8});
    tube(wrist,tip,0.10,0.03,7,P.darkPlum,{phase:Math.PI/7,capB:{hex:P.darkPlum}});
    /* trailing primary feathers as flat quads fanning back from the wing */
    const featherPts=[[0.55,-0.30],[0.85,-0.55],[1.15,-0.78],[1.45,-0.98],[1.75,-1.12]];
    for(let i=0;i<featherPts.length;i++){
      const [fx,fz]=featherPts[i];
      const rx=root.x+side*fx, rz=root.z+fz*0.55, ry=0.66+i*0.01;
      quad(V(rx,ry+0.10,rz+0.10), V(rx+side*0.10,ry+0.06,rz+0.02),
           V(rx+side*0.18,ry-0.04,rz-0.30), V(rx+side*0.02,ry+0.0,rz-0.18), P.plumDk, 0.05);
    }
    /* crackle-vein accent lines along the underwing (dull electric-blue, desaturated) */
    for(const t of [0.35,0.6,0.85]){
      const a=V(root.x+(elbow.x-root.x)*t, root.y+(elbow.y-root.y)*t-0.04, root.z+(elbow.z-root.z)*t);
      const b=V(a.x+side*0.10, a.y-0.10, a.z-0.06);
      tube(a,b,0.012,0.004,3,P.crackle);
    }
  };
  wing(-1); wing(1);

  /* legs — sturdy, taloned */
  for(const s of [-1,1]){
    const hip=V(s*0.16,0.60,-0.06), knee=V(s*0.18,0.30,-0.02), foot=V(s*0.17,0.08,0.06);
    tube(hip,knee,0.185,0.135,7,P.plum);
    tube(knee,foot,0.11,0.075,6,P.plumDk,{capB:{hex:P.claw,lift:0.015}});
    for(const [dx,dz] of [[s*0.09,0.10],[s*0.02,0.13],[-s*0.06,0.10]]){
      tube(V(foot.x,foot.y+0.01,foot.z), V(foot.x+dx,foot.y-0.05,foot.z+dz), 0.03,0.008,4,P.claw,{capB:{hex:P.claw}});
    }
  }

  /* short fanned tail */
  {
    const t0=S.tailBase, t1=V(0,0.58,-0.92), tipL=V(-0.30,0.44,-1.16), tipC=V(0,0.42,-1.24), tipR=V(0.30,0.44,-1.16);
    tube(t0,t1,0.20,0.15,7,P.plum);
    for(const tp of [tipL,tipC,tipR]) tube(t1,tp,0.10,0.02,5,P.plumDk,{capB:{hex:P.darkPlum}});
  }

  /* base disc (Gargantuan: r=0.72) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.70, 0.70, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
