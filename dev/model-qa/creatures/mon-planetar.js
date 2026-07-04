/* dev/model-qa/creatures/mon-planetar.js — the PLANETAR (bespoke WINGED HUMANOID, Large Celestial).
   docs/CREATURE-MODELS-P2.md Wave 5: a powerful angel — tall muscular humanoid, big feathered wings
   rising off the shoulders, a GREATSWORD held ready, radiant pale-green/gold luminous skin (VS
   desaturated, not candy — the glow reads as a subtle pale-gold undertone + a soft radiant-channel
   accent, never saturated). Seeds the winged-humanoid base (deva/solar/empyrean lift from it later).
   NO eye quads (house ruling) — the brow/socket is shape only. Whole-object grammar: one function,
   one merged geometry frame, no anchors, no part-object transforms. Large size: base disc r=0.55.
   Imported by the p2mon proof-sheet set + WHOLE_OBJECT_REGISTRY. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildPlanetar(){
  /* ---------- PALETTE (VS desaturated; luminous pale-green/gold skin, white-grey feather, dull gold trim) ---------- */
  const P = {
    skin:0x9aab8c, skinDk:0x7c8f70, skinLt:0xb6c4a2,           // radiant pale-green skin, desaturated
    glow:0xcfc48a, glowDk:0xa89a68,                            // dull warm-gold glow accent (chest/brow/palms)
    hair:0xd8d0b0, hairDk:0xb0a888,                            // pale gold-white hair
    wrap:0xc4b878, wrapDk:0x8f8558,                             // simple gold-drab wrap/loincloth
    feather:0xd6d4c8, featherDk:0xa8a698, featherLt:0xe8e6dc,  // white-grey feathered wings
    quill:0x8a887c,                                             // dark feather shafts/underside
    blade:0x9aa0a0, bladeDk:0x6c7272, bladeEdge:0xc4c8c4,       // steel-grey greatsword
    hilt:0x6e5e3a, hiltDk:0x4a3d26, guard:0x8a7c50,             // worn gold-bronze hilt/guard
    mouth:0x5c4a3e, brow:0x7c8f70,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin',
    [P.glow]:'glow', [P.glowDk]:'glow',
    [P.hair]:'fur', [P.hairDk]:'fur',
    [P.wrap]:'cloth', [P.wrapDk]:'cloth',
    [P.feather]:'fur', [P.featherDk]:'fur', [P.featherLt]:'fur', [P.quill]:'bone',
    [P.blade]:'metal', [P.bladeDk]:'metal', [P.bladeEdge]:'metal',
    [P.hilt]:'wood', [P.hiltDk]:'wood', [P.guard]:'metal',
  });

  /* ---------- LANDMARKS — tall upright humanoid, Large-scaled (~2.0u to crown). ---------- */
  const L = {
    hipY:0.98, waistY:1.14, ribY:1.34, chestY:1.54, shldY:1.68, neckY:1.74,
    jawY:1.80, cheekY:1.90, browY:1.98, crownY:2.08,
    shoulderX:0.30, hipHalf:0.175,
  };

  /* ---------- TORSO — lean powerful build, broad chest tapering to a narrow waist. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.170, rz:0.150, hex:P.wrap},
      {y:L.waistY, rx:0.190, rz:0.165, hex:P.skinDk},
      {y:L.ribY,   rx:0.235, rz:0.195, hex:P.skin},
      {y:L.chestY, rx:0.270, rz:0.210, hex:P.skinLt},
      {y:L.shldY,  rx:0.300, rz:0.195, hex:P.skin},
      {y:L.neckY,  rx:0.155, rz:0.140, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* radiant glow band across the chest (subtle warm accent, not a bright stripe) */
    quad(V(-0.14,L.chestY-0.02,0.19), V(0.14,L.chestY-0.02,0.19), V(0.16,L.ribY+0.06,0.18), V(-0.16,L.ribY+0.06,0.18), P.glow, 0.06);
  }
  /* simple gold-drab wrap/loincloth at the hips */
  {
    const r1=ring(V(0,L.hipY-0.10,0), V(0,1,0), 0.190, 0.165, 8, Math.PI/8);
    const r2=ring(V(0,L.hipY+0.06,0), V(0,1,0), 0.180, 0.155, 8, Math.PI/8);
    stitch([r1,r2], ()=>P.wrapDk);
  }

  /* ---------- HEAD — solemn, near-human, faintly angular. brow/socket recess only, no eye quads. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.130, rz:0.130, hex:P.skin},
      {y:L.cheekY, rx:0.145, rz:0.140, hex:P.skinLt},
      {y:L.browY,  rx:0.135, rz:0.120, hex:P.skin},
      {y:L.crownY, rx:0.090, rz:0.085, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    /* recessed brow sockets — pull the brow band's front verts back+in (dark shape, no paint) */
    for(const i of [1,2]){ rings[2][i].z -= 0.030; rings[2][i].y -= 0.010; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.crownY+0.05, -0.01), P.skinDk);
    /* small nose ridge + solemn closed mouth line */
    quad(V(-0.018,L.cheekY+0.01,0.140), V(0.018,L.cheekY+0.01,0.140), V(0.012,L.jawY+0.04,0.150), V(-0.012,L.jawY+0.04,0.150), P.skinLt, 0.04);
    quad(V(-0.040,L.jawY-0.020,0.125), V(0.040,L.jawY-0.020,0.125), V(0.032,L.jawY-0.032,0.120), V(-0.032,L.jawY-0.032,0.120), P.mouth, 0.03);
    /* dark brow shadow line over the socket recess */
    quad(V(-0.100,L.browY+0.010,0.105), V(0.100,L.browY+0.010,0.105), V(0.085,L.browY-0.015,0.115), V(-0.085,L.browY-0.015,0.115), P.brow, 0.04);
    /* pale gold-white hair, swept back off the crown */
    for(const [dx,dz,len] of [[-0.05,-0.06,0.16],[0.05,-0.06,0.16],[0.0,-0.08,0.19]]){
      const base=V(dx,L.crownY-0.01,dz-0.02), tip=V(dx*1.4,L.crownY+0.06,dz-len);
      tube(base, tip, 0.040, 0.014, 4, P.hair, {capB:{hex:P.hairDk, lift:0.006}});
    }
  }

  /* ---------- ARMS — right grips the greatsword low/ready; left hangs relaxed at the side. ---------- */
  {
    const SR=V(L.shoulderX, L.shldY-0.02, 0.02), ER=V(0.42, 1.30, 0.16), WR=V(0.40, 1.06, 0.24);
    tube(SR, ER, 0.088, 0.068, 6, P.skin);
    tube(ER, WR, 0.066, 0.052, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.005}});
    const SL=V(-L.shoulderX, L.shldY-0.02, 0.02), EL=V(-0.38, 1.28, 0.10), WL=V(-0.36, 1.02, 0.06);
    tube(SL, EL, 0.088, 0.068, 6, P.skin);
    tube(EL, WL, 0.066, 0.050, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.005}});
    /* simple hands — a knuckle block + short fingers, both grips */
    for(const [w,dir] of [[WR,V(0.05,-0.3,1)], [WL,V(-0.03,-1,0.1)]]){
      const d=dir.clone().normalize();
      tube(w.clone().addScaledVector(d,-0.04), w.clone().addScaledVector(d,0.04), 0.052,0.046,5,P.skinDk);
      for(const off of [-0.8,0,0.8]){
        const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
        const kb=w.clone().addScaledVector(d,0.03).addScaledVector(side,off*0.028);
        const kt=kb.clone().addScaledVector(d,0.045);
        tube(kb,kt,0.014,0.006,3,P.skinDk,{capB:{hex:P.skinDk, lift:0.003}});
      }
    }
  }

  /* ---------- GREATSWORD — held low and ready in the right hand, blade angled up-forward. ---------- */
  {
    const grip = V(0.40, 1.03, 0.26);
    const pomm = V(0.40, 0.90, 0.22);
    const guardC = V(0.395, 1.14, 0.30);
    const tip = V(0.30, 1.92, 0.62);
    tube(pomm, grip, 0.030, 0.034, 6, P.hiltDk, {capA:{hex:P.hiltDk, lift:0.01}});
    tube(grip, guardC, 0.034, 0.030, 6, P.hilt);
    /* crossguard */
    quad(V(guardC.x-0.10,guardC.y+0.01,guardC.z), V(guardC.x+0.10,guardC.y+0.01,guardC.z),
         V(guardC.x+0.10,guardC.y-0.02,guardC.z+0.02), V(guardC.x-0.10,guardC.y-0.02,guardC.z+0.02), P.guard, 0.05);
    tube(V(guardC.x-0.10,guardC.y,guardC.z), V(guardC.x-0.16,guardC.y+0.03,guardC.z+0.02), 0.020,0.010,4,P.guard);
    tube(V(guardC.x+0.10,guardC.y,guardC.z), V(guardC.x+0.16,guardC.y+0.03,guardC.z+0.02), 0.020,0.010,4,P.guard);
    /* long tapering blade, angled up and slightly forward — flattened via raz/rbz for a blade cross-section */
    const bladeBase = V(guardC.x-0.005, guardC.y+0.04, guardC.z+0.01);
    tube(bladeBase, tip, 0.058, 0.010, 4, P.blade, {raz:0.014, rbz:0.003, capB:{hex:P.bladeEdge, lift:0.01}});
    /* fuller/edge highlight line down the blade face */
    quad(V(bladeBase.x-0.008,bladeBase.y,bladeBase.z+0.014), V(bladeBase.x+0.008,bladeBase.y,bladeBase.z+0.014),
         V(tip.x+0.003,tip.y,tip.z+0.004), V(tip.x-0.003,tip.y,tip.z+0.004), P.bladeEdge, 0.05);
  }

  /* ---------- WINGS — big feathered angel wings rising off the shoulders, half-spread, tall in
     silhouette. Root at shoulder, three primary spars fan up/back with broad feathered membrane
     panels + layered feather-tip quads along the trailing edge (the plumage read). ---------- */
  {
    const wing=(side)=>{
      const root = V(side*0.22, L.shldY+0.06, -0.08);
      const shoulder = V(side*0.34, L.shldY+0.22, -0.14);
      const f1 = V(side*0.50, L.crownY+0.55, -0.28);   // top primary — arcs highest, above the crown
      const f2 = V(side*0.78, L.chestY+0.40, -0.42);   // mid primary
      const f3 = V(side*0.66, L.waistY+0.10, -0.50);   // lower primary, trailing toward the hip
      tube(root, shoulder, 0.050, 0.040, 5, P.quill);
      tube(shoulder, f1, 0.038, 0.012, 5, P.quill, {capB:{hex:P.quill, lift:0.004}});
      tube(shoulder, f2, 0.034, 0.011, 5, P.quill, {capB:{hex:P.quill, lift:0.004}});
      tube(shoulder, f3, 0.028, 0.010, 4, P.quill, {capB:{hex:P.quill, lift:0.004}});
      /* broad feathered membrane panels between the primaries */
      quad(shoulder, f1, f2, shoulder, P.feather, 0.09);
      quad(shoulder, f2, f3, shoulder, P.featherDk, 0.09);
      /* layered feather-tip quads along the leading/trailing edge — sells individual pinions */
      const rim=[f1,f2,f3];
      for(let i=0;i<rim.length-1;i++){
        const a=rim[i], b=rim[i+1];
        const mid=V((a.x+b.x)/2,(a.y+b.y)/2-0.04,(a.z+b.z)/2-0.05);
        const tipOut=V(mid.x+side*0.10, mid.y-0.06, mid.z-0.08);
        quad(a, b, tipOut, mid, P.featherLt, 0.08);
      }
      /* small covert feathers near the root (softens the shoulder joint) */
      for(const k of [0.3,0.55,0.8]){
        const cb=root.clone().lerp(shoulder,k);
        const ct=V(cb.x+side*0.06, cb.y+0.10, cb.z-0.05);
        tube(cb, ct, 0.030, 0.010, 4, P.feather, {capB:{hex:P.feather, lift:0.004}});
      }
    };
    wing(-1); wing(1);
  }

  /* ---------- LEGS — long, powerful, standing steady. ---------- */
  {
    const leg=(hipX)=>{
      const hip=V(hipX, L.hipY-0.06, 0.01), knee=V(hipX*1.05, 0.52, 0.06), foot=V(hipX*1.05, 0.06, 0.10);
      tube(hip, knee, 0.115, 0.088, 6, P.skin);
      tube(knee, foot, 0.086, 0.060, 6, P.skinDk);
      /* simple sandal foot */
      const heel=V(foot.x, 0.045, foot.z-0.03), toe=V(foot.x, 0.032, foot.z+0.16);
      tube(heel, toe, 0.068, 0.058, 5, P.wrapDk, {raz:0.052, rbz:0.044, capA:{hex:P.wrapDk}});
    };
    leg(-L.hipHalf); leg(L.hipHalf);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
