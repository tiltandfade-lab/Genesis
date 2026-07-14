/* dev/model-qa/creatures/rlm-scrap-hound-alpha.js — SCRAP-HOUND ALPHA (ash realm, Medium
   quadruped, CR 3). Read: an ash-stained scrap-hound pack alpha — bulkier and scarred compared
   to the common barrens jackal, patchwork scrap-plate bolted to its flanks/shoulders, a jagged
   junk-metal collar-spike ridge, wide alert ears, low tail. Whole-object grammar: one function,
   one merged frame, no anchors. NO eye quads — deep dark sockets only. Medium size, base disc
   r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildScrapHoundAlpha(){
  /* ---------- PALETTE (VS-desaturated ash-grey/dun, scrap-metal bolt-on plates) ---------- */
  const P = {
    hide:0x5a5244, hideDk:0x3a3629, hideLt:0x726955,
    mange:0x847a63, scorch:0x2a2620,
    belly:0x6e6753, snout:0x38332a, mouth:0x1e1a16, tooth:0x9a9180,
    ear:0x433d32, claw:0x1e1b16,
    plate:0x5c5648, plateDk:0x38352a, rivet:0x201d18, rust:0x6a4530,
    disc:0x443f36, discTop:0x524b3e,
  };

  /* ---------- LANDMARKS — bulkier canid frame than a common jackal, ~1.10u long ---------- */
  const spY = 0.38;
  const S = {
    tailBase: V(0, spY+0.02, -0.56),
    rump:     V(0, spY+0.07, -0.38),
    loin:     V(0, spY+0.08, -0.16),
    mid:      V(0, spY+0.07,  0.06),
    shldr:    V(0, spY+0.05,  0.28),
    neck:     V(0, spY+0.12,  0.46),
    headB:    V(0, spY+0.16,  0.57),
  };

  /* ---------- BODY — thicker ribby barrel than a common jackal, scarred ---------- */
  tube(S.rump,  S.loin,  0.180, 0.195, 8, P.hide,   {phase:Math.PI/8, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.195, 0.200, 8, P.mange,  {phase:Math.PI/8});
  tube(S.mid,   S.shldr, 0.200, 0.175, 8, P.hide,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.175, 0.118, 8, P.hideDk, {phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.118, 0.092, 8, P.hide,   {phase:Math.PI/8});
  /* pale belly strip */
  {
    const by = spY-0.12;
    quad(V(-0.12,by,-0.32), V(0.12,by,-0.32), V(0.10,by+0.02,0.22), V(-0.10,by+0.02,0.22), P.belly, 0.05);
  }
  /* scorch/mange patches */
  quad(V(0.11,spY+0.09,-0.12), V(0.19,spY+0.11,-0.02), V(0.18,spY-0.02,-0.02), V(0.10,spY-0.03,-0.12), P.scorch, 0.08);
  quad(V(-0.13,spY+0.11,0.12), V(-0.18,spY+0.12,0.20), V(-0.17,spY+0.00,0.20), V(-0.12,spY-0.01,0.12), P.mange, 0.08);

  /* PATCHWORK SCRAP-PLATE — bolted armor panels on the flanks/shoulders (pack-alpha distinguisher) */
  {
    quad(V(0.16,spY+0.06,0.08), V(0.24,spY+0.10,0.24), V(0.22,spY-0.06,0.24), V(0.15,spY-0.08,0.08), P.plate, 0.06);
    quad(V(-0.15,spY+0.08,-0.06), V(-0.22,spY+0.10,-0.24), V(-0.20,spY-0.06,-0.24), V(-0.14,spY-0.07,-0.06), P.plateDk, 0.06);
    for(const [x,y,z] of [[0.19,spY+0.02,0.14],[-0.18,spY+0.02,-0.14],[0.21,spY-0.02,0.22]]) quad(V(x-0.014,y,z),V(x+0.014,y,z),V(x+0.011,y-0.02,z-0.01),V(x-0.011,y-0.02,z-0.01),P.rivet,0.02);
    quad(V(0.18,spY,0.16),V(0.22,spY-0.01,0.20),V(0.205,spY-0.05,0.20),V(0.17,spY-0.04,0.16),P.rust,0.07);
  }
  /* junk-metal spike ridge along the collar/shoulders */
  for(const [z,y] of [[0.30,spY+0.24],[0.22,spY+0.27],[0.14,spY+0.28]]){
    tube(V(0,y,z),V(0,y+0.09,z-0.01),0.018,0.005,4,P.plateDk,{capB:{hex:P.plateDk,lift:0.004}});
  }

  /* ---------- HEAD — heavier scarred canid wedge, alert ears ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:spY+0.06, cz:0.54, rx:0.088, rz:0.093, hex:P.hide},
      {y:spY+0.14, cz:0.58, rx:0.098, rz:0.098, hex:P.hide},
      {y:spY+0.21, cz:0.55, rx:0.076, rz:0.080, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.26, 0.55), P.hideDk);

    /* SNOUT — thicker tapering muzzle, scarred */
    const snB = V(0, spY+0.09, 0.55);
    const snM = V(0, spY+0.06, 0.69);
    const snT = V(0, spY+0.04, 0.81);
    tube(snB, snM, 0.072, 0.046, n, P.hide,  {raz:0.064, rbz:0.036, phase:ph});
    tube(snM, snT, 0.046, 0.022, n, P.snout, {raz:0.036, rbz:0.017, phase:ph, capB:{hex:P.mouth, lift:0.008}});
    quad(V(-0.040,spY+0.02,0.60), V(0.040,spY+0.02,0.60), V(0.024,spY+0.01,0.79), V(-0.024,spY+0.01,0.79), P.mouth, 0.03);
    for(const s of [-1,1]) quad(V(s*0.022,spY+0.01,0.66), V(s*0.028,spY+0.01,0.66), V(s*0.026,spY-0.017,0.67), V(s*0.020,spY-0.017,0.67), P.tooth, 0.02);
    /* dark deep sockets, no eye quads */
    for(const s of [-1,1]) quad(V(s*0.042,spY+0.17,0.585), V(s*0.062,spY+0.17,0.575), V(s*0.058,spY+0.125,0.58), V(s*0.040,spY+0.125,0.585), P.scorch, 0.04);
    /* scar over the muzzle */
    quad(V(-0.008,spY+0.12,0.63),V(0.008,spY+0.12,0.63),V(0.012,spY+0.04,0.68),V(-0.012,spY+0.04,0.68), P.scorch, 0.05);

    /* EARS — large, notched/torn, upright */
    for(const s of [-1,1]){
      const eb = V(s*0.058, spY+0.245, 0.52);
      const eTipA = V(s*0.086, spY+0.39, 0.48);
      const eTipB = V(s*0.032, spY+0.38, 0.51);
      quad(eb, V(s*0.022,spY+0.245,0.555), eTipB, eTipA, P.ear, 0.06);
    }
  }

  /* ---------- LEGS — digitigrade, bulkier than a common jackal ---------- */
  {
    const leg=(hipX, hipZ, footZoff, hex)=>{
      const hip   = V(hipX, spY+0.02, hipZ);
      const knee  = V(hipX*1.05, 0.175, hipZ + footZoff*0.4);
      const ankle = V(hipX*1.02, 0.085, hipZ + footZoff*0.75);
      const foot  = V(hipX*1.0,  0.02,  hipZ + footZoff);
      tube(hip, knee,  0.066, 0.046, 6, hex);
      tube(knee, ankle,0.046, 0.030, 6, P.hideDk);
      tube(ankle, foot,0.030, 0.024, 5, P.hideDk, {capB:{hex:P.claw, lift:0.006}});
    };
    leg(-0.11, 0.26, 0.10, P.hide);
    leg( 0.11, 0.26, 0.10, P.hide);
    leg(-0.115,-0.31,-0.14, P.hide);
    leg( 0.115,-0.31,-0.14, P.hide);
  }

  /* ---------- TAIL — low, scarred, tapering ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0.02, spY-0.01, -0.76);
    const t2 = V(0.04, spY-0.06, -0.92);
    const tip= V(0.06, spY-0.11, -1.03);
    tube(t0, t1, 0.064, 0.046, 6, P.hide,   {capA:{hex:P.hideDk}});
    tube(t1, t2, 0.046, 0.028, 6, P.mange, {});
    tube(t2, tip,0.028, 0.009, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
