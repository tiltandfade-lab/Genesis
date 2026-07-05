/* dev/model-qa/creatures/rlm-vault-sealed-revenant.js — VAULT-SEALED REVENANT (ash, Medium
   Undead, CR 4). Read: a bunker blast-door ghost — a gaunt humanoid revenant fused half-into
   a slab of scavenged blast-door plating it drags/wears like a shell, rusted vault-wheel
   fused at one shoulder, faint ash-grey translucent hide, tattered bunker-uniform rags. It
   reads as a haunting bound to the vault door it died sealing. VS-desaturated: ash-grey
   revenant pallor, rust-iron door plate, faded uniform olive-drab. NO eye quads — hollow dark
   sockets only. Whole-object grammar: one function, one frame, no anchors. Medium size, base
   disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildVaultSealedRevenant(){
  const P = {
    pallor:0x8a8a82, pallorDk:0x5e5e56, pallorLt:0xa2a298,
    socket:0x1c1a18,
    rag:0x565042, ragDk:0x363228,
    iron:0x5c584c, ironDk:0x342f24, ironLt:0x726c5a,
    rust:0x7a4a30, rustDk:0x4e2f1e,
    wheel:0x4a4638,
    bone:0xb8ae94,
    disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.62, 0),
    waist: V(0, 0.86, -0.01),
    chest: V(0, 1.16, -0.02),
    neck:  V(0, 1.32, -0.02),
    headB: V(0, 1.38, -0.02),
  };
  tube(S.hip,   S.waist, 0.130, 0.110, 8, P.pallorDk, {phase:Math.PI/8, capA:{hex:P.pallorDk, lift:0.02}});
  tube(S.waist, S.chest, 0.110, 0.150, 8, P.pallor,   {phase:Math.PI/8});
  tube(S.chest, S.neck,  0.150, 0.075, 8, P.pallorDk, {phase:Math.PI/8});

  /* tattered bunker-uniform rags draping the gaunt torso */
  quad(V(-0.16,1.14,0.10), V(0.16,1.14,0.10), V(0.10,0.62,0.14), V(-0.10,0.62,0.14), P.rag, 0.06);
  quad(V(-0.13,1.02,0.11), V(0.13,1.02,0.11), V(0.02,0.66,0.13), V(-0.16,0.70,0.13), P.ragDk, 0.06);

  /* HEAD — gaunt skull, hollow dark sockets, no eye quads */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,      cz:0, rx:0.098, rz:0.100, hex:P.pallorDk},
      {y:S.headB.y+0.13, cz:0.005, rx:0.108, rz:0.105, hex:P.pallor},
      {y:S.headB.y+0.23, cz:0, rx:0.078, rz:0.078, hex:P.pallorDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headB.y+0.28,0), P.pallorDk);
    /* hollow sockets */
    for(const s of [-1,1]) quad(V(s*0.045,S.headB.y+0.145,0.09), V(s*0.045+0.035,S.headB.y+0.145,0.09),
                                  V(s*0.045+0.030,S.headB.y+0.10,0.095), V(s*0.045-0.005,S.headB.y+0.10,0.095), P.socket, 0.02);
    /* jaw slack line */
    quad(V(-0.04,S.headB.y+0.05,0.095), V(0.04,S.headB.y+0.05,0.095), V(0.03,S.headB.y+0.02,0.098), V(-0.03,S.headB.y+0.02,0.098), P.socket, 0.02);
  }

  /* LEGS — thin, gaunt, translucent-pallor */
  {
    const leg=(hipX)=>{
      const hip=V(hipX,0.60,0), knee=V(hipX*1.05,0.30,0.03), foot=V(hipX*0.95,0.03,0.08);
      tube(hip,knee,0.075,0.058,7,P.pallor);
      tube(knee,foot,0.058,0.044,7,P.pallorDk,{capB:{hex:P.socket, lift:0.008}});
    };
    leg(-0.09); leg(0.09);
  }

  /* ARMS — one gaunt reaching, one fused into the door-slab shell it drags */
  {
    const rsh=V(0.16,1.10,0), rel=V(0.24,0.86,0.06), rhd=V(0.20,0.60,0.10);
    tube(rsh,rel,0.075,0.058,6,P.pallor);
    tube(rel,rhd,0.058,0.040,6,P.pallorDk,{capB:{hex:P.socket, lift:0.008}});
  }

  /* BLAST-DOOR SLAB SHELL — fused half-into a rusted vault plate carried on the back/left
     side, dragging as a heavy shell; the vault wheel fused at the shoulder */
  {
    const slabY0=0.10, slabY1=1.30;
    quad(V(-0.34,slabY1,-0.30), V(-0.10,slabY1,-0.16), V(-0.06,slabY0,-0.10), V(-0.36,slabY0,-0.26), P.iron, 0.05);
    quad(V(-0.34,slabY1,-0.30), V(-0.44,slabY1,-0.10), V(-0.42,slabY0,-0.06), V(-0.36,slabY0,-0.26), P.ironDk, 0.05);
    /* rivet seams on the slab */
    for(const t of [0.2,0.45,0.7,0.9]){
      const y = slabY0 + (slabY1-slabY0)*t;
      quad(V(-0.30,y,-0.24), V(-0.28,y,-0.22), V(-0.27,y-0.02,-0.21), V(-0.29,y-0.02,-0.23), P.rust, 0.03);
    }
    /* rusted vault-wheel fused at the left shoulder */
    const wheelC = V(-0.28, 1.14, -0.06);
    const wr1 = ring(wheelC, V(0,0,1), 0.12, 0.12, 8, Math.PI/8);
    const wr2 = ring(V(wheelC.x,wheelC.y,wheelC.z-0.03), V(0,0,1), 0.12, 0.12, 8, Math.PI/8);
    stitch([wr1,wr2], ()=>P.wheel);
    capFan(wr2, V(wheelC.x,wheelC.y,wheelC.z-0.045), P.rustDk);
    /* spokes */
    for(let i=0;i<4;i++){ const t=(i/4)*Math.PI*2;
      quad(V(wheelC.x,wheelC.y,wheelC.z-0.015), V(wheelC.x+Math.cos(t)*0.02,wheelC.y+Math.sin(t)*0.02,wheelC.z-0.015),
           V(wheelC.x+Math.cos(t)*0.11,wheelC.y+Math.sin(t)*0.11,wheelC.z-0.015), V(wheelC.x+Math.cos(t)*0.09,wheelC.y+Math.sin(t)*0.09,wheelC.z-0.015), P.wheel, 0.03); }
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
