/* dev/model-qa/creatures/rlm-wire-fanged-cur.js — WIRE-FANGED CUR (ash realm, Medium quadruped, CR 0.5).
   Read: a barbed-wire-fanged scrap-hound — a mutated cur with jagged barbed-wire growths fused
   into its jaw as unnatural "fangs", scrap-metal shards embedded in its mangy hide, hunched
   aggressive stance, low tail. Whole-object grammar. NO eye quads — deep dark sockets only.
   Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildWireFangedCur(){
  /* ---------- PALETTE (VS-desaturated ash-grey hide, embedded rust-scrap, barbed-wire steel) ---------- */
  const P = {
    hide:0x574f42, hideDk:0x39352b, hideLt:0x6b6250,
    mange:0x7d7460, scorch:0x2a2620,
    belly:0x6d6450, snout:0x362f26, mouth:0x1e1b16,
    wire:0x716e64, wireDk:0x4a473e, rust:0x6a4a2e,
    scrap:0x807c72, claw:0x1e1b16, disc:0x443f36, discTop:0x524b3e,
  };

  /* ---------- LANDMARKS — hunched aggressive canid stance, low head thrust forward ~1.0u long ---------- */
  const spY = 0.36;
  const S = {
    tailBase: V(0, spY-0.01, -0.52),
    rump:     V(0, spY+0.08, -0.36),
    loin:     V(0, spY+0.09, -0.14),
    mid:      V(0, spY+0.07,  0.08),
    shldr:    V(0, spY+0.03,  0.28),
    neck:     V(0, spY+0.04,  0.44),
    headB:    V(0, spY+0.02,  0.56),
  };

  /* ---------- BODY — hunched barrel, higher at rump than shoulder (aggressive crouch) ---------- */
  tube(S.rump,  S.loin,  0.165, 0.175, 8, P.hide,   {phase:Math.PI/8, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.175, 0.180, 8, P.mange,  {phase:Math.PI/8});
  tube(S.mid,   S.shldr, 0.180, 0.155, 8, P.hide,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.155, 0.105, 8, P.hideDk, {phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.105, 0.088, 8, P.hide,   {phase:Math.PI/8});
  /* embedded scrap-metal shards fused into the hide */
  for(const [x,y,z,rot] of [[0.13,spY+0.16,-0.08,0],[-0.14,spY+0.14,0.06,1],[0.10,spY+0.10,0.22,0]]){
    const a=rot?0.03:-0.03;
    quad(V(x-0.03,y,z), V(x+0.03,y,z+a), V(x+0.02,y+0.05,z+a+0.02), V(x-0.02,y+0.05,z+0.02), P.scrap, 0.1);
  }
  /* pale gaunt belly */
  {
    const by = spY-0.08;
    quad(V(-0.11,by,-0.30), V(0.11,by,-0.30), V(0.10,by+0.02,0.22), V(-0.10,by+0.02,0.22), P.belly, 0.05);
  }

  /* ---------- HEAD — thrust-forward hunched skull, jagged barbed-wire fangs ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:spY-0.06, cz:0.56, rx:0.082, rz:0.088, hex:P.hide},
      {y:spY+0.01, cz:0.59, rx:0.092, rz:0.092, hex:P.hide},
      {y:spY+0.08, cz:0.56, rx:0.070, rz:0.075, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.12, 0.56), P.hideDk);

    /* snout */
    const snB = V(0, spY-0.08, 0.56);
    const snM = V(0, spY-0.105, 0.70);
    const snT = V(0, spY-0.125, 0.80);
    tube(snB, snM, 0.068, 0.044, n, P.hide,  {raz:0.060, rbz:0.036, phase:ph});
    tube(snM, snT, 0.044, 0.022, n, P.snout, {raz:0.036, rbz:0.018, phase:ph, capB:{hex:P.mouth, lift:0.008}});

    /* dark mouth gash, wide open aggressive */
    quad(V(-0.040,spY-0.15,0.60), V(0.040,spY-0.15,0.60), V(0.026,spY-0.155,0.78), V(-0.026,spY-0.155,0.78), P.mouth, 0.03);

    /* BARBED-WIRE FANGS — jagged twisted wire growths jutting from the jaw as unnatural teeth */
    for(const s of [-1,1]){
      const rb = V(s*0.026, spY-0.14, 0.62);
      const r1 = V(s*0.030, spY-0.185, 0.66);
      const r2 = V(s*0.020, spY-0.225, 0.70);
      const rt = V(s*0.034, spY-0.255, 0.72);
      tube(rb, r1, 0.010, 0.007, 4, P.wire);
      tube(r1, r2, 0.007, 0.006, 4, P.wireDk);
      tube(r2, rt, 0.006, 0.002, 4, P.wire, {capB:{hex:P.wire, lift:0.003}});
      /* barb prongs jutting sideways off the wire fang */
      const barb = V(rb.x + s*0.02, spY-0.20, 0.68);
      tube(r1, barb, 0.005, 0.002, 3, P.wireDk);
    }
    /* two smaller straight teeth alongside */
    for(const s of [-1,1]) quad(V(s*0.012,spY-0.145,0.615), V(s*0.017,spY-0.145,0.615), V(s*0.015,spY-0.175,0.625), V(s*0.010,spY-0.175,0.625), P.wire, 0.03);

    /* dark deep sockets (no eye quads) */
    for(const s of [-1,1]) quad(V(s*0.042,spY+0.075,0.60), V(s*0.062,spY+0.075,0.59), V(s*0.058,spY+0.03,0.595), V(s*0.040,spY+0.03,0.605), P.scorch, 0.04);

    /* small torn/ragged ears */
    for(const s of [-1,1]){
      const eb = V(s*0.046, spY+0.11, 0.50);
      const eTipA = V(s*0.066, spY+0.22, 0.46);
      const eTipB = V(s*0.020, spY+0.215, 0.49);
      quad(eb, V(s*0.014,spY+0.11,0.525), eTipB, eTipA, P.hideDk, 0.06);
    }
  }

  /* ---------- LEGS — bunched aggressive crouch stance ---------- */
  {
    const leg=(hipX, hipZ, footZoff, hex)=>{
      const hip   = V(hipX, spY+0.02, hipZ);
      const knee  = V(hipX*1.08, 0.17, hipZ + footZoff*0.4);
      const ankle = V(hipX*1.04, 0.08, hipZ + footZoff*0.75);
      const foot  = V(hipX*1.0,  0.02,  hipZ + footZoff);
      tube(hip, knee,  0.062, 0.042, 6, hex);
      tube(knee, ankle,0.042, 0.026, 6, P.hideDk);
      tube(ankle, foot,0.026, 0.022, 5, P.hideDk, {capB:{hex:P.claw, lift:0.006}});
    };
    leg(-0.100, 0.26, 0.10, P.hide);
    leg( 0.100, 0.26, 0.10, P.hide);
    leg(-0.110,-0.30,-0.16, P.hide);
    leg( 0.110,-0.30,-0.16, P.hide);
  }

  /* ---------- TAIL — low, stiff, bristling ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0.01, spY-0.05, -0.68);
    const t2 = V(0.02, spY-0.09, -0.82);
    const tip= V(0.03, spY-0.13, -0.92);
    tube(t0, t1, 0.050, 0.036, 6, P.hide,   {capA:{hex:P.hideDk}});
    tube(t1, t2, 0.036, 0.022, 6, P.mange, {});
    tube(t2, tip,0.022, 0.007, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
