/* dev/model-qa/creatures/rlm-raptor-pack-hunter.js — RAPTOR PACK-HUNTER (lost-world, Medium,
   CR 0.5). A feathered pack-hunting dromaeosaur, quick and coordinated. Read: a low horizontal
   bipedal dinosaur body balanced by a stiff tail, feathered arms/back, a narrow toothy snout
   (no eye quads — dark socket recesses), a raised sickle-claw on each foot held off the ground.
   Whole-object grammar, one merged frame, no anchors. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildRaptorPackHunter(){
  const P = {
    hide:0x6b5c3e, hideDk:0x473c28, hideLt:0x87754f,
    feather:0x3f4a35, featherDk:0x2a3123, featherLt:0x596840,
    belly:0xa8996f, bellyDk:0x7d7150,
    mouth:0x241d16, tooth:0xcfc49f,
    claw:0x1e1a14, sickle:0x151210,
    disc:0x453b2c, discTop:0x554a37,
  };

  /* ---------- SPINE — low horizontal balanced posture, tail stiff out back. ---------- */
  const spY = 0.42;
  const S = {
    tailTip: V(0, spY-0.08, -0.62),
    tailMid: V(0, spY-0.02, -0.34),
    haunch:  V(0, spY+0.04, -0.10),
    mid:     V(0, spY+0.06, 0.10),
    shldr:   V(0, spY+0.04, 0.28),
    neck:    V(0.02, spY+0.10, 0.42),
    headB:   V(0.02, spY+0.16, 0.54),
  };
  tube(S.haunch, S.mid,  0.135, 0.120, 8, P.hide,   {phase:Math.PI/8});
  tube(S.mid,    S.shldr,0.120, 0.100, 8, P.hideLt, {phase:Math.PI/8});
  tube(S.shldr,  S.neck, 0.100, 0.062, 8, P.hide,   {phase:Math.PI/8});
  tube(S.neck,   S.headB,0.062, 0.045, 7, P.hideDk, {phase:Math.PI/7});
  // pale belly strip
  quad(V(-0.09,spY-0.09,-0.06), V(0.09,spY-0.09,-0.06), V(0.075,spY-0.10,0.20), V(-0.075,spY-0.10,0.20), P.belly, 0.06);

  /* ---------- STIFF TAIL — long, tapering, held straight out back for balance. ---------- */
  {
    const t0 = S.haunch, t1 = S.tailMid, t2 = S.tailTip;
    const tt = V(0, spY-0.12, -0.86);
    tube(t0, t1, 0.115, 0.070, 7, P.hide);
    tube(t1, t2, 0.070, 0.038, 7, P.hideDk);
    tube(t2, tt, 0.038, 0.010, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.004}});
    // faint feather fringe along the tail top
    quad(V(-0.02,spY+0.06,-0.20), V(0.02,spY+0.06,-0.20), V(0.016,spY+0.02,-0.55), V(-0.016,spY+0.02,-0.55), P.feather, 0.06);
  }

  /* ---------- LEGS — digitigrade, one raised sickle-claw held off the ground per foot. ---------- */
  {
    const legRig = (hipX)=>{
      const hip = V(hipX, spY-0.02, -0.06);
      const knee = V(hipX*1.1, spY-0.24, -0.02);
      const ankle = V(hipX*1.05, 0.10, 0.05);
      const toe = V(hipX*0.9, 0.03, 0.16);
      tube(hip, knee, 0.075, 0.058, 6, P.hide);
      tube(knee, ankle, 0.055, 0.030, 6, P.hideDk);
      tube(ankle, toe, 0.028, 0.018, 5, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
      // two grounded forward toes
      for(const dz of [0.06,0.10]){
        const cb=V(toe.x, 0.03, toe.z);
        const ct=V(toe.x, 0.01, toe.z+dz);
        tube(cb, ct, 0.013, 0.005, 4, P.claw, {capB:{hex:P.claw, lift:0.003}});
      }
      // the raised SICKLE CLAW — held up off the ground, curving, the signature raptor feature
      const sB = V(toe.x + Math.sign(hipX)*0.03, 0.09, toe.z+0.02);
      const sT = V(toe.x + Math.sign(hipX)*0.07, 0.20, toe.z+0.10);
      tube(sB, sT, 0.018, 0.005, 5, P.sickle, {capB:{hex:P.sickle, lift:0.004}});
    };
    legRig(-0.11);
    legRig(0.11);
  }

  /* ---------- ARMS — short feathered arms folded, clawed hands. ---------- */
  for(const s of [-1,1]){
    const sh = V(s*0.10, spY+0.06, 0.22);
    const el = V(s*0.17, spY-0.06, 0.30);
    const hd = V(s*0.16, spY-0.10, 0.42);
    tube(sh, el, 0.035, 0.026, 5, P.feather);
    tube(el, hd, 0.026, 0.018, 5, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
    for(let i=0;i<3;i++){
      const dx=(i-1)*0.018;
      const cb=V(hd.x+dx, hd.y-0.01, hd.z);
      const ct=V(hd.x+dx, hd.y-0.05, hd.z+0.06);
      tube(cb, ct, 0.010, 0.004, 4, P.claw, {capB:{hex:P.claw, lift:0.003}});
    }
  }

  /* ---------- HEAD — narrow toothy snout, dark socket recesses (no eye quads). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:spY+0.10, cz:0.44, rx:0.055, rz:0.075, hex:P.hide},
      {y:spY+0.17, cz:0.46, rx:0.062, rz:0.070, hex:P.hideLt},
      {y:spY+0.23, cz:0.42, rx:0.045, rz:0.055, hex:P.hideDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+0.25,0.42), P.hideDk);

    // socket recesses (no eye quads)
    for(const s of [-1,1]){
      const sx=s*0.032, sy=spY+0.18, sz=0.49;
      quad(V(sx-0.016,sy+0.010,sz), V(sx+0.016,sy+0.010,sz), V(sx+0.013,sy-0.012,sz+0.005), V(sx-0.013,sy-0.012,sz+0.005), P.mouth, 0.03);
    }

    // narrow snout tapering forward, toothy jaw
    const snB = V(0, spY+0.11, 0.50);
    const snT = V(0, spY+0.09, 0.66);
    tube(snB, snT, 0.048, 0.020, n, P.hide, {raz:0.055, rbz:0.016, phase:ph, capB:{hex:P.hideDk, lift:0.005}});
    quad(V(-0.028,spY+0.07,0.52), V(0.028,spY+0.07,0.52), V(0.014,spY+0.055,0.64), V(-0.014,spY+0.055,0.64), P.mouth, 0.04);
    for(let i=0;i<5;i++){
      const t=i/4, tx=(t-0.5)*0.05;
      quad(V(tx-0.006,spY+0.072,0.52+t*0.12), V(tx+0.006,spY+0.072,0.52+t*0.12), V(tx+0.004,spY+0.06,0.53+t*0.12), V(tx-0.004,spY+0.06,0.53+t*0.12), P.tooth, 0.03);
    }
  }

  /* ---------- feather crest along the back of the neck/head. ---------- */
  {
    const fb = V(0, spY+0.20, 0.36);
    const ft = V(0, spY+0.34, 0.28);
    tube(fb, ft, 0.020, 0.004, 5, P.featherLt, {capB:{hex:P.featherLt, lift:0.004}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
