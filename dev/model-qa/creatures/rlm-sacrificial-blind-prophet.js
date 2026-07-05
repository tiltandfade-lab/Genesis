/* dev/model-qa/creatures/rlm-sacrificial-blind-prophet.js — the SACRIFICIAL BLIND PROPHET
   (lost-world, Medium humanoid, CR 2). A blind prophet claiming to speak for a buried god:
   ragged sackcloth robe, a bandage or ash-caked band tied over EMPTY eye sockets (the "blind" tell
   — no eyes at all under the wrap), a gnarled walking-staff for a blind man's tap-cane, and a
   ritual sacrificial dagger held reversed against the chest. Whole-object grammar: one function,
   one frame, no anchors, held staff+dagger authored first. Palette: ash-grey sackcloth, bandaged
   dun wrap, dull ritual bronze dagger. Lost-world register: sand/ash antiquity, gaunt and starved.
   Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildSacrificialBlindProphet(){
  /* ---------- PALETTE (ash-grey sackcloth; dun bandage wrap; dull ritual bronze) ---------- */
  const P = {
    sack:0x726552, sackDk:0x4f4635, sackLt:0x8c7d64,
    skin:0x8a7658, skinDk:0x5f5038,
    wrap:0xa89878, wrapDk:0x7a6c50,
    bronze:0x8a6a3a, bronzeDk:0x5f4826,
    wood:0x4a3a26,
    disc:0x453d2e, discTop:0x554c37,
  };

  const L = { hipY:0.72, waistY:0.80, chestY:0.93, shldY:1.02, neckY:1.05,
    hipHalf:0.10, shoulderX:0.20, jawY:1.08, cheekY:1.15, browY:1.21, crownY:1.28, topY:1.32 };

  /* ===== STAFF FIRST — a gnarled blind-man's tap-cane, held loose in the left hand, tip forward ===== */
  const staffGrip=V(-0.22,0.98,0.06), staffTip=V(-0.10,0.02,0.42);
  {
    tube(staffGrip, V(-0.28,1.30,-0.02), 0.020,0.016,5,P.wood);
    tube(staffGrip, staffTip, 0.020,0.012,6,P.wood,{capB:{hex:P.bronzeDk,lift:0.008}});
    /* a couple of knots/gnarls along its length */
    blob(-0.24,0.75,0.14, 0.026,0.020,0.026, P.wood, 5,3);
    blob(-0.16,0.42,0.28, 0.022,0.018,0.022, P.wood, 5,3);
  }

  /* ===== TORSO — ragged sackcloth robe, gaunt and starved ===== */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.118, hex:P.sackDk},
    {y:L.waistY, rx:0.126, rz:0.098, hex:P.sack},
    {y:L.chestY, rx:0.148, rz:0.112, hex:P.sack},
    {y:L.shldY,  rx:0.158, rz:0.108, hex:P.sackDk},
    {y:L.neckY,  rx:0.058, rz:0.052, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  /* ragged torn hem, uneven sackcloth strips */
  {
    const n=8, ph=Math.PI/n;
    const top=ring(V(0,L.hipY-0.01,0), V(0,1,0), 0.152, 0.120, n, ph);
    const hemY=[0.10,0.04,0.14,0.02,0.08,0.00,0.12,0.06];
    for(let i=0;i<n;i++){
      const i2=(i+1)%n, t=ph+(i/n)*Math.PI*2, t2=ph+(i2/n)*Math.PI*2;
      const rx=0.22, rz=0.19;
      const hem0=V(Math.cos(t)*rx, hemY[i], Math.sin(t)*rz);
      const hem1=V(Math.cos(t2)*rx, hemY[i2], Math.sin(t2)*rz);
      quad(top[i], top[i2], hem1, hem0, i&1?P.sack:P.sackDk, 0.07);
    }
  }

  /* ===== HEAD — gaunt, with a bandage/ash-caked band tied over EMPTY sockets (the blind tell) ===== */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.068, rz:0.074, hex:P.skin},
      {y:L.cheekY, rx:0.088, rz:0.086, hex:P.skin},
      {y:L.browY,  rx:0.092, rz:0.082, hex:P.skinDk},
      {y:L.crownY, rx:0.076, rz:0.068, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.topY,0.006), P.skinDk);
    /* the blind-band — a wide dun bandage wrapped straight across where the eyes should be */
    {
      const by=L.browY-0.015;
      quad(V(-0.088,by+0.026,0.055), V(0.088,by+0.026,0.055), V(0.082,by-0.026,0.068), V(-0.082,by-0.026,0.068), P.wrap, 0.05);
      /* a knot at the side where the wrap is tied off */
      blob(0.09, by, 0.045, 0.022,0.018,0.018, P.wrapDk, 5,3);
      /* trailing loose wrap-ends hanging past the knot */
      tube(V(0.09,by-0.01,0.045), V(0.11,by-0.09,0.03), 0.012,0.007,4,P.wrap,{capB:{hex:P.wrapDk}});
    }
    /* gaunt sunken cheeks — a subtle dark hollow either side of the jaw (starved read) */
    for(const s of [-1,1]) blob(s*0.055, L.jawY+0.01, 0.05, 0.020,0.016,0.014, P.skinDk, 5,3);
    /* thin slack mouth line */
    quad(V(-0.03,L.jawY-0.012,0.070), V(0.03,L.jawY-0.012,0.070), V(0.024,L.jawY-0.03,0.072), V(-0.024,L.jawY-0.03,0.072), P.skinDk, 0.04);
  }

  /* ===== ARMS — LEFT grips the staff, RIGHT holds a ritual dagger REVERSED against the chest ===== */
  {
    const Ss=(x)=>V(x,L.shldY-0.01,0.02);
    const S2=Ss(-L.shoulderX*0.9), E2=V(-0.24,0.86,0.06), W2=staffGrip.clone();
    tube(S2,E2,0.044,0.036,6,P.sackDk); tube(E2,W2,0.036,0.028,6,P.skin);

    const S=Ss(L.shoulderX*0.9), E=V(0.20,0.98,0.12), W=V(0.06,L.chestY-0.02,0.14);
    tube(S,E,0.044,0.036,6,P.sackDk); tube(E,W,0.036,0.028,6,P.skin);
    blob(W.x,W.y,W.z,0.032,0.026,0.032,P.skin,6,4);
    /* the reversed ritual dagger — blade pointing UP along the forearm, held against the chest */
    {
      const grip=W.clone().add(V(-0.01,-0.01,0.02));
      const pommel=grip.clone().add(V(0,-0.06,0));
      const tip=grip.clone().add(V(0.01,0.14,-0.01));
      tube(pommel,grip,0.016,0.014,5,P.bronzeDk);
      tube(grip,tip,0.020,0.005,5,P.bronze,{capB:{hex:P.bronze,lift:0.006}});
      /* a small crossguard */
      quad(grip.clone().add(V(-0.03,0.01,0)), grip.clone().add(V(0.03,0.01,0)), grip.clone().add(V(0.03,0.03,0)), grip.clone().add(V(-0.03,0.03,0)), P.bronzeDk, 0.03);
    }
  }

  /* ===== LEGS — gaunt, standing with a slight forward probing lean (a blind man's careful step) === */
  {
    const hipL=V(-L.hipHalf,L.hipY-0.01,0.0), kneeL=V(-0.12,0.38,0.03), ankL=V(-0.12,0.09,0.0);
    tube(hipL,kneeL,0.056,0.042,6,P.sackDk); tube(kneeL,ankL,0.040,0.030,6,P.skin);
    const hipR=V(L.hipHalf,L.hipY-0.01,0.0), kneeR=V(0.13,0.40,0.07), ankR=V(0.12,0.09,0.06);
    tube(hipR,kneeR,0.056,0.042,6,P.sackDk); tube(kneeR,ankR,0.040,0.030,6,P.skin);
    for(const [ank,d] of [[ankL,V(0.02,0,1)],[ankR,V(-0.02,0,1)]]){
      const dn=d.clone().normalize();
      tube(V(ank.x,0.045,ank.z), V(ank.x,0.045,ank.z).clone().addScaledVector(dn,0.10), 0.032,0.020,5,P.skinDk,{raz:0.026,rbz:0.015});
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
