/* dev/model-qa/creatures/rlm-fallout-toad.js — FALLOUT TOAD (ash realm, Medium, CR 0.25).
   Read: a bloated chem-runoff toad — squat wide low body, huge swollen throat sac, warty sickly
   hide with weeping chem-stain blotches, stubby splayed legs, wide flat mouth. Whole-object
   grammar. NO eye quads — bulging socket domes only (no iris/pupil quad detail). Base disc r=0.42.*/
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildFalloutToad(){
  /* ---------- PALETTE (VS-desaturated sick olive/grey, weeping chem-stain yellow-green) ---------- */
  const P = {
    hide:0x596b47, hideDk:0x3a4530, hideLt:0x6e7f56,
    wart:0x2f3a26, stain:0x8a9450, stainDk:0x6a7440,
    throat:0x9aa06a, throatDk:0x767c4c,
    mouth:0x24201a, tongue:0x7a3a3a,
    claw:0x231f1a, disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — squat wide body, very short from rump to head, low ---------- */
  const spY = 0.26;
  const S = {
    rump:  V(0, spY+0.10, -0.28),
    mid:   V(0, spY+0.14,  0.00),
    shldr: V(0, spY+0.10,  0.22),
    headB: V(0, spY+0.06,  0.36),
  };

  /* ---------- BODY — one big bloated barrel, wide & squat ---------- */
  tube(S.rump,  S.mid,   0.230, 0.290, 9, P.hide,   {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.mid,   S.shldr, 0.290, 0.240, 9, P.hideLt, {phase:Math.PI/9});
  tube(S.shldr, S.headB, 0.240, 0.190, 9, P.hide,   {phase:Math.PI/9});
  /* warty texture blotches across the back */
  for(const [x,y,z] of [[0.10,0.44,-0.10],[-0.12,0.45,-0.02],[0.14,0.42,0.10],[-0.08,0.43,0.18],[0.02,0.46,-0.20]]){
    quad(V(x-0.03,y,z-0.03), V(x+0.03,y,z-0.03), V(x+0.025,y+0.035,z+0.02), V(x-0.025,y+0.035,z+0.02), P.wart, 0.06);
  }
  /* weeping chem-stain blotches (sickly yellow-green streaks running down the flanks) */
  for(const s of [-1,1]){
    quad(V(s*0.20,0.36,-0.02), V(s*0.24,0.34,-0.06), V(s*0.22,0.12,-0.02), V(s*0.18,0.14,0.02), P.stain, 0.08);
    quad(V(s*0.17,0.30,0.10), V(s*0.21,0.28,0.08), V(s*0.19,0.10,0.10), V(s*0.15,0.12,0.13), P.stainDk, 0.08);
  }

  /* ---------- SWOLLEN THROAT SAC — huge distended pale sac bulging beneath the jaw ---------- */
  {
    blob(0, 0.14, 0.30, 0.185, 0.145, 0.175, P.throat, 8, 5);
    quad(V(-0.08,0.02,0.20), V(0.08,0.02,0.20), V(0.06,0.02,0.42), V(-0.06,0.02,0.42), P.throatDk, 0.05);
  }

  /* ---------- HEAD — wide flat toad head, huge flat mouth, bulging socket domes ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.02, cz:0.38, rx:0.195, rz:0.190, hex:P.hide},
      {y:spY+0.10, cz:0.40, rx:0.205, rz:0.195, hex:P.hideLt},
      {y:spY+0.20, cz:0.36, rx:0.150, rz:0.155, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.24, 0.36), P.hideDk);

    /* wide flat mouth line spanning nearly the whole head width */
    quad(V(-0.185,spY-0.02,0.50), V(0.185,spY-0.02,0.50), V(0.16,spY-0.05,0.56), V(-0.16,spY-0.05,0.56), P.mouth, 0.03);
    /* tongue just visible inside */
    quad(V(-0.05,spY-0.045,0.51), V(0.05,spY-0.045,0.51), V(0.04,spY-0.06,0.53), V(-0.04,spY-0.06,0.53), P.tongue, 0.05);

    /* bulging socket domes on TOP of the head (classic toad eye placement) — no eye quads, just
       dark dome bulges to read as sockets */
    for(const s of [-1,1]){
      const cb = ring(V(s*0.115, spY+0.235, 0.30), V(0,1,0), 0.055, 0.055, 7, ph);
      const capApex = V(s*0.115, spY+0.30, 0.30);
      const baseRing = ring(V(s*0.115, spY+0.195, 0.30), V(0,1,0), 0.058, 0.058, 7, ph);
      stitch([baseRing, cb], ()=>P.hideDk);
      capFan(cb, capApex, P.wart);
    }
  }

  /* ---------- LEGS — stubby splayed toad legs, wide flat webbed feet ---------- */
  {
    const stubLeg=(hipX, hipZ, footX, footZ, hex)=>{
      const hip  = V(hipX, spY+0.02, hipZ);
      const knee = V(hipX + Math.sign(hipX)*0.10, spY-0.10, hipZ + (footZ>hipZ?0.05:-0.05));
      const foot = V(footX, 0.05, footZ);
      tube(hip, knee, 0.075, 0.060, 6, hex);
      tube(knee, foot, 0.060, 0.048, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
      /* wide webbed flat foot fan */
      const side = Math.sign(foot.x||1);
      for(const [dx,dz] of [[side*0.05,0.03],[side*0.02,0.06],[-side*0.01,0.065],[-side*0.03,0.04]]){
        quad(V(foot.x,0.02,foot.z), V(foot.x+dx*0.4,0.018,foot.z+dz*0.4),
             V(foot.x+dx,0.010,foot.z+dz), V(foot.x+dx*0.6,0.010,foot.z+dz*0.7), P.claw, 0.04);
      }
    };
    stubLeg(-0.20, 0.18, -0.34, 0.30, P.hide);
    stubLeg( 0.20, 0.18,  0.34, 0.30, P.hide);
    stubLeg(-0.22,-0.20, -0.38,-0.34, P.hide);
    stubLeg( 0.22,-0.20,  0.38,-0.34, P.hide);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
