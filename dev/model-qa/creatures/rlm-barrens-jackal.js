/* dev/model-qa/creatures/rlm-barrens-jackal.js — BARRENS JACKAL (ash realm, Medium quadruped, CR 0.25).
   Read: an ash-mangy pack jackal — lean low-slung canid, ribs showing through patchy scorched fur,
   ash-caked coat, big alert ears, low tail. Whole-object grammar, one merged frame, no anchors.
   NO eye quads — deep dark sockets only. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildBarrensJackal(){
  /* ---------- PALETTE (VS-desaturated ash-grey/dun, mangy patches, scorch marks) ---------- */
  const P = {
    hide:0x5c5448, hideDk:0x3e392f, hideLt:0x716858,
    mange:0x847a63, scorch:0x2c2822,
    belly:0x726a56, snout:0x3a352c, mouth:0x211d18, tooth:0x9c9382,
    ear:0x453f34, claw:0x201d17, disc:0x443f36, discTop:0x524b3e,
  };

  /* ---------- LANDMARKS — spine along +z, lean low-slung canid frame ~0.95u long ---------- */
  const spY = 0.34;
  const S = {
    tailBase: V(0, spY+0.02, -0.50),
    rump:     V(0, spY+0.06, -0.34),
    loin:     V(0, spY+0.07, -0.14),
    mid:      V(0, spY+0.06,  0.06),
    shldr:    V(0, spY+0.04,  0.26),
    neck:     V(0, spY+0.10,  0.42),
    headB:    V(0, spY+0.14,  0.52),
  };

  /* ---------- BODY — lean ribby barrel, narrower than a healthy canid ---------- */
  tube(S.rump,  S.loin,  0.150, 0.165, 8, P.hide,   {phase:Math.PI/8, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.165, 0.170, 8, P.mange,  {phase:Math.PI/8});
  tube(S.mid,   S.shldr, 0.170, 0.150, 8, P.hide,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.150, 0.100, 8, P.hideDk, {phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.100, 0.078, 8, P.hide,   {phase:Math.PI/8});
  /* pale gaunt belly strip — ribs-showing read */
  {
    const by = spY-0.10;
    quad(V(-0.10,by,-0.30), V(0.10,by,-0.30), V(0.09,by+0.02,0.20), V(-0.09,by+0.02,0.20), P.belly, 0.05);
    for(let i=0;i<4;i++){
      const z = -0.20 + i*0.11;
      quad(V(-0.09,by+0.01,z), V(-0.03,by+0.01,z), V(-0.03,by+0.09,z+0.02), V(-0.09,by+0.09,z+0.02), P.scorch, 0.06);
    }
  }
  /* scorch/mange patches on flank */
  quad(V(0.09,spY+0.08,-0.10), V(0.16,spY+0.10,-0.02), V(0.15,spY-0.02,-0.02), V(0.08,spY-0.03,-0.10), P.scorch, 0.08);
  quad(V(-0.11,spY+0.10,0.10), V(-0.15,spY+0.11,0.18), V(-0.14,spY+0.00,0.18), V(-0.10,spY-0.01,0.10), P.mange, 0.08);

  /* ---------- HEAD — narrow canid wedge, pointed snout, alert ears ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:spY+0.06, cz:0.50, rx:0.075, rz:0.080, hex:P.hide},
      {y:spY+0.13, cz:0.53, rx:0.085, rz:0.085, hex:P.hide},
      {y:spY+0.19, cz:0.50, rx:0.065, rz:0.070, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.23, 0.50), P.hideDk);

    /* SNOUT — narrow tapering muzzle */
    const snB = V(0, spY+0.08, 0.50);
    const snM = V(0, spY+0.055, 0.63);
    const snT = V(0, spY+0.035, 0.74);
    tube(snB, snM, 0.062, 0.040, n, P.hide,  {raz:0.055, rbz:0.032, phase:ph});
    tube(snM, snT, 0.040, 0.020, n, P.snout, {raz:0.032, rbz:0.016, phase:ph, capB:{hex:P.mouth, lift:0.008}});
    /* dark mouth line + a few glimpsed teeth */
    quad(V(-0.036,spY+0.02,0.55), V(0.036,spY+0.02,0.55), V(0.022,spY+0.01,0.72), V(-0.022,spY+0.01,0.72), P.mouth, 0.03);
    for(const s of [-1,1]) quad(V(s*0.020,spY+0.01,0.60), V(s*0.026,spY+0.01,0.60), V(s*0.024,spY-0.015,0.61), V(s*0.018,spY-0.015,0.61), P.tooth, 0.02);
    /* dark deep sockets (no eye quads) */
    for(const s of [-1,1]) quad(V(s*0.038,spY+0.155,0.535), V(s*0.056,spY+0.155,0.525), V(s*0.052,spY+0.115,0.53), V(s*0.036,spY+0.115,0.535), P.scorch, 0.04);

    /* EARS — large, alert, upright triangular */
    for(const s of [-1,1]){
      const eb = V(s*0.050, spY+0.225, 0.475);
      const eTipA = V(s*0.075, spY+0.36, 0.44);
      const eTipB = V(s*0.028, spY+0.355, 0.47);
      quad(eb, V(s*0.020,spY+0.225,0.505), eTipB, eTipA, P.ear, 0.06);
    }
  }

  /* ---------- LEGS — lean digitigrade canid legs, straighter stance than a lizard sprawl ---------- */
  {
    const leg=(hipX, hipZ, footZoff, hex)=>{
      const hip   = V(hipX, spY+0.02, hipZ);
      const knee  = V(hipX*1.05, 0.155, hipZ + footZoff*0.4);
      const ankle = V(hipX*1.02, 0.075, hipZ + footZoff*0.75);
      const foot  = V(hipX*1.0,  0.02,  hipZ + footZoff);
      tube(hip, knee,  0.055, 0.038, 6, hex);
      tube(knee, ankle,0.038, 0.024, 6, P.hideDk);
      tube(ankle, foot,0.024, 0.020, 5, P.hideDk, {capB:{hex:P.claw, lift:0.006}});
    };
    leg(-0.095, 0.24, 0.10, P.hide);
    leg( 0.095, 0.24, 0.10, P.hide);
    leg(-0.100,-0.28,-0.14, P.hide);
    leg( 0.100,-0.28,-0.14, P.hide);
  }

  /* ---------- TAIL — low, mangy, tapering ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0.02, spY-0.02, -0.68);
    const t2 = V(0.04, spY-0.06, -0.82);
    const tip= V(0.06, spY-0.10, -0.92);
    tube(t0, t1, 0.055, 0.040, 6, P.hide,   {capA:{hex:P.hideDk}});
    tube(t1, t2, 0.040, 0.024, 6, P.mange, {});
    tube(t2, tip,0.024, 0.008, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
