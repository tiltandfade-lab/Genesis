/* dev/model-qa/creatures/rlm-bloat-ghast-preacher.js — BLOAT-GHAST PREACHER (ash realm, Medium,
   CR 4). Read: a rotting bomb-cult prophet — a swollen distended undead torso wrapped in tattered
   cult vestments, strapped with lashed ordnance/canister charges (the "bomb-cult" tell), a gaunt
   sunken-cheek skull-face, one arm raised in a preaching gesture. Whole-object grammar: one
   function, one merged frame, no anchors. NO eye quads — sunken dark socket pits only, skull-shape
   only per the authoring contract. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildBloatGhastPreacher(){
  /* ---------- PALETTE (VS-desaturated rot-grey flesh, tattered cult ochre-red, dull ordnance metal) - */
  const P = {
    flesh:0x6a6656, fleshDk:0x494636, fleshLt:0x827c66,
    rot:0x4a5038, rotDk:0x323626,             /* sickly rot-green mottling */
    bone:0xb8ad8e, boneDk:0x8a8168,
    vestment:0x6e2c22, vestmentDk:0x481a14,   /* cult ochre-red rag vestments */
    charge:0x565248, chargeDk:0x38352c,       /* lashed ordnance canisters */
    strap:0x2c261c,
    socket:0x100e0b,
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — distended bloated torso, gaunt head, one arm raised ---------- */
  const S = {
    hip:   V(0, 0.48, 0),
    waist: V(0.02, 0.66, 0.02),
    belly: V(0.01, 0.88, 0.05),
    chest: V(0, 1.02, 0.02),
    shldr: V(0, 1.12, 0.00),
    neck:  V(0, 1.18, -0.01),
    headB: V(0, 1.24, -0.02),
    headT: V(0, 1.42, -0.03),
  };

  /* ---------- TORSO — swollen distended bloat-belly under tattered vestments ---------- */
  tube(S.hip,   S.waist, 0.150, 0.175, 8, P.vestmentDk, {phase:Math.PI/8});
  tube(S.waist, S.belly, 0.175, 0.235, 8, P.vestment,   {phase:Math.PI/8});   /* the bloat swell */
  tube(S.belly, S.chest, 0.235, 0.190, 8, P.flesh,      {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.190, 0.175, 8, P.vestmentDk, {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.175, 0.080, 8, P.flesh,      {phase:Math.PI/8});
  /* rot-green mottling patches on the exposed flesh belly */
  for(const [x,y,z] of [[0.10,0.90,0.20],[-0.09,0.86,0.18],[0.02,0.94,0.22]])
    quad(V(x-0.035,y,z), V(x+0.035,y,z), V(x+0.028,y-0.05,z+0.01), V(x-0.028,y-0.05,z+0.01), P.rot, 0.07);
  /* tattered rag strips hanging off the vestment hem */
  for(const s of [-1,0,1]) tube(V(s*0.10,0.60,0.10), V(s*0.12,0.30,0.12+s*0.02), 0.022, 0.006, 4, P.vestmentDk, {capB:{hex:P.vestmentDk}});

  /* ---------- LASHED ORDNANCE CHARGES — canister bombs strapped across the chest/belly ---------- */
  {
    const spots = [[-0.14,0.98,0.16],[0.13,0.96,0.18],[0.0,0.80,0.24],[-0.10,0.72,0.20]];
    for(const [x,y,z] of spots){
      const b0=V(x,y-0.07,z), b1=V(x,y+0.05,z+0.01);
      tube(b0,b1,0.045,0.038,6,P.charge, {capA:{hex:P.chargeDk}, capB:{hex:P.chargeDk, lift:0.008}});
    }
    /* crossed straps lashing the charges */
    for(const s of [-1,1]) quad(V(s*0.02,1.10,0.06), V(s*0.06,1.10,0.06), V(s*0.16,0.62,0.14), V(s*0.12,0.62,0.14), P.strap, 0.05);
  }

  /* ---------- HEAD — gaunt sunken-cheek skull-face, sockets pits only ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,      cz:0.00, rx:0.088, rz:0.090, hex:P.bone},
      {y:S.headB.y+0.10, cz:0.00, rx:0.092, rz:0.086, hex:P.boneDk},
      {y:S.headT.y-0.02, cz:-0.01,rx:0.072, rz:0.068, hex:P.bone},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headT.y+0.02, -0.01), P.boneDk);

    /* sunken cheek hollows */
    for(const s of [-1,1]) quad(V(s*0.055,S.headB.y+0.02,0.06), V(s*0.075,S.headB.y+0.03,0.05), V(s*0.07,S.headB.y-0.03,0.055), V(s*0.05,S.headB.y-0.03,0.065), P.fleshDk, 0.06);
    /* deep dark socket pits (no eye quads) */
    for(const s of [-1,1]) quad(V(s*0.038-0.014,S.headB.y+0.08,0.075), V(s*0.038+0.014,S.headB.y+0.08,0.075), V(s*0.038+0.012,S.headB.y+0.05,0.078), V(s*0.038-0.012,S.headB.y+0.05,0.078), P.socket, 0.02);
    /* gaunt jaw + torn mouth */
    quad(V(-0.05,S.headB.y-0.01,0.07), V(0.05,S.headB.y-0.01,0.07), V(0.04,S.headB.y-0.06,0.075), V(-0.04,S.headB.y-0.06,0.075), P.socket, 0.03);
  }

  /* ---------- ARMS — one raised in a preaching gesture, one hanging withered ---------- */
  {
    const shL = V(-0.185, 1.06, 0.00), shR = V(0.185, 1.06, 0.00);
    const elL = V(-0.21, 0.86, 0.05), elR = V(0.24, 1.12, 0.14);
    const hL  = V(-0.19, 0.66, 0.08), hR  = V(0.20, 1.36, 0.10);   // right arm raised high
    tube(shL, elL, 0.056, 0.044, 6, P.vestment);
    tube(elL, hL,  0.044, 0.032, 6, P.flesh, {capB:{hex:P.flesh, lift:0.01}});
    tube(shR, elR, 0.056, 0.044, 6, P.vestment);
    tube(elR, hR,  0.044, 0.032, 6, P.flesh, {capB:{hex:P.flesh, lift:0.012}});
    /* withered spread fingers on the raised hand */
    for(const dx of [-0.02,0,0.02,0.04]) tube(V(hR.x+dx*0.3,hR.y,hR.z), V(hR.x+dx,hR.y+0.09,hR.z+0.02), 0.010, 0.004, 3, P.flesh);
  }

  /* ---------- LEGS — shambling, uneven stance under the ragged vestment hem ---------- */
  {
    const legs=(hipX)=>{
      const hip = V(hipX, S.hip.y-0.02, 0);
      const knee = V(hipX*0.85, 0.26, 0.02);
      const foot = V(hipX*0.75, 0.03, 0.04);
      tube(hip, knee, 0.072, 0.056, 6, P.vestmentDk);
      tube(knee, foot, 0.056, 0.042, 6, P.fleshDk, {capB:{hex:P.fleshDk, lift:0.015}});
    };
    legs(-0.08); legs(0.08);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
