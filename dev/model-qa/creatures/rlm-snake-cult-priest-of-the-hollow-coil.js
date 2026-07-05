/* dev/model-qa/creatures/rlm-snake-cult-priest-of-the-hollow-coil.js — the SNAKE-CULT PRIEST OF
   THE HOLLOW COIL (lost-world, Medium humanoid, CR 2). A chanting cult priest summoning serpents
   up from the foundations — robed figure, arms raised mid-chant, a serpent-coil headdress/staff,
   and several small SNAKES rising from the ground around the feet (the tell: literally calling
   them up out of the floor). Whole-object grammar: one function, one frame, no anchors, held
   serpent-staff authored first. NO eye quads — a shadowed cowled face. Palette: sun-bleached tomb-
   priest robes (dusty ochre/bone), dark serpent-black accents, pale bone jewelry. Lost-world
   register: sand-worn antiquity. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildSnakeCultPriestOfTheHollowCoil(){
  /* ---------- PALETTE (sun-bleached ochre/bone robes; dark serpent-black; pale bone jewelry) ---------- */
  const P = {
    robe:0x9a8358, robeDk:0x6f5c3c, robeLt:0xb69d6c,
    skin:0x8a6f52, skinDk:0x5f4c38,
    serpent:0x2f3324, serpentDk:0x1c2015, serpentLt:0x4a5138,
    bone:0xc7bc9c, boneDk:0x998e70,
    cowl:0x120d09,
    disc:0x453d2e, discTop:0x554c37,
  };

  const L = { hipY:0.72, waistY:0.80, chestY:0.94, shldY:1.03, neckY:1.06,
    hipHalf:0.11, shoulderX:0.21, jawY:1.09, cheekY:1.16, browY:1.23, crownY:1.30, topY:1.34 };

  /* ===== SERPENT-STAFF FIRST — a tall staff with a coiled serpent carved/wound around it, held
     raised in the right hand, ground truth for that arm. ===== */
  const GRIP=V(0.26,1.00,0.10), TOP=V(0.24,1.62,0.06);
  {
    tube(GRIP.clone().add(V(0,-0.30,0)), TOP, 0.024, 0.020, 6, P.robeDk);
    /* the coiled serpent winding up the staff — a ring of small blobs spiraling */
    for(let i=0;i<6;i++){
      const t=i/5;
      const y=GRIP.y-0.10+t*(TOP.y-GRIP.y+0.10);
      const ang=t*Math.PI*3;
      const cx=TOP.x+Math.cos(ang)*0.05, cz=TOP.z+Math.sin(ang)*0.05;
      blob(cx,y,cz, 0.026,0.020,0.026, i%2?P.serpent:P.serpentDk, 5,3);
    }
    /* serpent head at the staff top, jaws open */
    const hd=TOP.clone().add(V(0.02,0.06,0.02));
    blob(hd.x,hd.y,hd.z, 0.036,0.028,0.040, P.serpent, 6,3);
    quad(V(hd.x-0.018,hd.y-0.01,hd.z+0.03), V(hd.x+0.018,hd.y-0.01,hd.z+0.03), V(hd.x+0.012,hd.y-0.05,hd.z+0.05), V(hd.x-0.012,hd.y-0.05,hd.z+0.05), P.cowl, 0.0);
  }

  /* ===== ROBED TORSO — a long tomb-priest robe, hem to the ground, sun-bleached ochre ===== */
  stack([
    {y:L.hipY,   rx:0.175, rz:0.140, hex:P.robeDk},
    {y:L.waistY, rx:0.155, rz:0.118, hex:P.robe},
    {y:L.chestY, rx:0.180, rz:0.138, hex:P.robe},
    {y:L.shldY,  rx:0.190, rz:0.130, hex:P.robeDk},
    {y:L.neckY,  rx:0.065, rz:0.058, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});
  /* a bone-bead sash across the chest, priestly regalia */
  {
    const a=V(-0.14,L.chestY+0.03,0.14), b=V(0.10,L.hipY-0.02,0.12);
    tube(a,b,0.020,0.014,5,P.bone,{capA:{hex:P.boneDk},capB:{hex:P.boneDk}});
  }
  /* robe hem flares to the ground, uneven sand-worn edge */
  {
    const n=8, ph=Math.PI/n;
    const top=ring(V(0,L.hipY-0.01,0), V(0,1,0), 0.178, 0.142, n, ph);
    const hemY=[0.02,0.04,0.01,0.05,0.02,0.03,0.01,0.04];
    for(let i=0;i<n;i++){
      const i2=(i+1)%n, t=ph+(i/n)*Math.PI*2, t2=ph+(i2/n)*Math.PI*2;
      const rx=0.30, rz=0.26;
      const hem0=V(Math.cos(t)*rx, hemY[i], Math.sin(t)*rz);
      const hem1=V(Math.cos(t2)*rx, hemY[i2], Math.sin(t2)*rz);
      quad(top[i], top[i2], hem1, hem0, i&1?P.robe:P.robeDk, 0.06);
    }
  }

  /* ===== HEAD — cowled, face shadowed dark (no eye quads); serpent-coil headdress ===== */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.076, rz:0.082, hex:P.skin},
      {y:L.cheekY, rx:0.098, rz:0.098, hex:P.robeDk},
      {y:L.browY,  rx:0.108, rz:0.104, hex:P.robeDk},
      {y:L.crownY, rx:0.092, rz:0.086, hex:P.robe},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.topY,0.006), P.robe);
    /* shadowed cowl-face — a deep dark recessed panel, no eyes visible */
    quad(V(-0.05,L.browY+0.01,0.075), V(0.05,L.browY+0.01,0.075), V(0.045,L.jawY-0.03,0.078), V(-0.045,L.jawY-0.03,0.078), P.cowl, 0.0);
    /* serpent-coil headdress — small coiled serpent wound over the crown */
    for(let i=0;i<4;i++){
      const t=i/3, ang=t*Math.PI*2.2;
      blob(Math.cos(ang)*0.06, L.crownY+0.02+t*0.05, Math.sin(ang)*0.06, 0.024,0.018,0.024, i%2?P.serpent:P.serpentLt, 5,3);
    }
  }

  /* ===== ARMS — BOTH raised, mid-chant. RIGHT to the staff grip, LEFT raised open-palmed. ===== */
  {
    const Ss=(x)=>V(x,L.shldY-0.01,0.02);
    const S=Ss(L.shoulderX*0.9), E=V(0.28,1.14,0.08), W=GRIP.clone();
    tube(S,E,0.046,0.038,6,P.robeDk); tube(E,W,0.036,0.030,6,P.skin);
    const S2=Ss(-L.shoulderX*0.9), E2=V(-0.30,1.22,-0.02), W2=V(-0.24,1.40,-0.08);
    tube(S2,E2,0.046,0.038,6,P.robeDk); tube(E2,W2,0.036,0.030,6,P.skin);
    blob(W2.x,W2.y,W2.z,0.040,0.034,0.040,P.skin,6,4);
    for(const d of [V(-0.3,0.3,0.2),V(-0.1,0.4,0.1),V(0.1,0.4,0.1),V(0.3,0.3,0.2)]){
      const dn=d.clone().normalize(); const tip=W2.clone().addScaledVector(dn,0.08);
      tube(W2,tip,0.012,0.007,4,P.skin,{capB:{hex:P.skinDk}});
    }
  }

  /* ===== SUMMONED SERPENTS — small snakes rising from the ground around the feet, the tell that
     this priest calls them UP from the foundations. Each a low coiled body + a raised head. ===== */
  {
    const snake=(cx,cz,rot)=>{
      const pts=[V(cx,0.02,cz), V(cx+0.06*Math.cos(rot),0.03,cz+0.06*Math.sin(rot)), V(cx+0.04*Math.cos(rot+1.5),0.10,cz+0.04*Math.sin(rot+1.5)), V(cx+0.02*Math.cos(rot),0.20,cz)];
      for(let i=0;i<pts.length-1;i++) tube(pts[i], pts[i+1], 0.024-i*0.005, 0.020-i*0.005, 5, i%2?P.serpent:P.serpentDk);
      const hd=pts.at(-1).clone().add(V(0,0.03,0.01));
      blob(hd.x,hd.y,hd.z,0.020,0.016,0.024,P.serpent,5,3);
    };
    snake(0.18,0.24,0.4);
    snake(-0.16,0.20,2.1);
    snake(0.02,-0.22,4.0);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
