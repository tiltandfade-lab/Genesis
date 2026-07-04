/* dev/model-qa/creatures/prop-sarcophagus.js — the SARCOPHAGUS: a stone tomb SET PIECE (whole-object
   prop). Not a creature — no eyes, no grip. One function, one geometry frame, no anchors. The read:
   a heavy carved stone coffin — a tapered chest with an EFFIGY LID (a stylized recumbent figure
   carved on top), shoved ASKEW / cracked open so a dark void shows at the mouth (the classic
   "the dead have risen" dungeon read). Sits on the shared base disc (r=0.48 — a bulky prop).
   Tells:
     - a tapered CHEST (wider at the head end, narrowing to the foot) on a low plinth
     - a thick effigy LID shoved partway OFF (slid + tilted), one end overhanging, exposing a dark
       gap into the black interior (the "open / cracked" tell)
     - a carved EFFIGY on the lid: a raised head-block + crossed-arms ridge + a body swell (stylized
       recumbent figure — reads as a tomb, not a trough)
     - carved panel lines + chipped corners on the chest sides; a crack running down one side
   VS-desaturated: cold sepulchral stone (a few close greys), pale chipped edges, near-black interior.
   Scale reference: figures ~1.5u; the chest tops ~0.7u (a coffin you could lie in). Long + low + heavy.
   Imported by prop-sarcophagus-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildSarcophagus(){
  /* ---------- PALETTE (VS desaturated sepulchral stone) ---------- */
  const P = {
    stone:0x807c72, stoneDk:0x605c53, stoneDkr:0x44403a, stoneLt:0x9a958a,    // chest / lid (lifted a step so the game-angle faces read)
    stoneLtr:0xaea798,                                                        // brightest lit lid facet (effigy tops)
    carve:0x4c483f, carveDk:0x322f28,                                         // recessed carved-panel lines
    chip:0xb8b3a4,                                                            // pale broken edge
    voidDk:0x120f0c, voidMid:0x211d16,                                        // black interior showing at the open gap
    plinth:0x6a675e, plinthDk:0x4c4942,
    disc:0x38332a, discTop:0x433d2e,
  };

  /* box helper (closed rectangular stone block, 3-tone). Optional taper via separate end half-widths
     handled by the caller passing explicit corners for the tapered chest below. */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05); quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05); quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);  quad(Cc,G,H,D, top, 0.05);
  }

  /* the coffin lies along Z: head end at -z (wider), foot end at +z (narrower). */
  const headZ = -0.40, footZ = 0.40;
  const headHalfX = 0.24, footHalfX = 0.17;     // tapered: wider at the head
  const plinthY = 0.055, plinthTop = 0.16;
  const chestY0 = plinthTop, chestY1 = 0.62;    // chest body
  const lidY0 = chestY1, lidY1 = chestY1 + 0.14;// lid thickness

  /* ===== 1) PLINTH — a low broad base the coffin rests on. ===== */
  box(-headHalfX-0.06, headHalfX+0.06, plinthY, plinthTop, headZ-0.06, footZ+0.06, P.plinth, P.plinthDk, P.plinthDk);
  quad(V(-headHalfX-0.06,plinthTop,footZ+0.06), V(-headHalfX+0.02,plinthTop,footZ+0.06),
       V(-headHalfX-0.06,plinthTop-0.05,footZ+0.06), V(-headHalfX-0.06,plinthTop-0.05,footZ+0.06), P.chip, 0.03);

  /* ===== 2) TAPERED CHEST — the coffin body, wider at the head, narrowing to the foot. Built as an
     explicit 8-corner tapered box (top OPEN — the lid caps it, and where the lid is slid off a dark
     void shows). ===== */
  {
    // 8 corners: bottom + top rings, tapered in x by z position
    const bHL=V(-headHalfX, chestY0, headZ), bHR=V(headHalfX, chestY0, headZ);   // head bottom L/R
    const bFL=V(-footHalfX, chestY0, footZ), bFR=V(footHalfX, chestY0, footZ);   // foot bottom L/R
    const tHL=V(-headHalfX, chestY1, headZ), tHR=V(headHalfX, chestY1, headZ);   // head top
    const tFL=V(-footHalfX, chestY1, footZ), tFR=V(footHalfX, chestY1, footZ);   // foot top
    quad(bHL,bHR,bFR,bFL, P.stoneDkr, 0.05);        // bottom
    quad(tHL,bHL,bFL,tFL, P.stone, 0.05);           // -x side
    quad(bHR,tHR,tFR,bFR, P.stoneDk, 0.05);         // +x side (shadow)
    quad(bHL,tHL,tHR,bHR, P.stone, 0.05);           // head end (-z)
    quad(tFL,tFR,bFR,bFL, P.stone, 0.05);           // foot end (+z)
    // dark interior lip visible along the top rim where the lid doesn't cover
    // (a dark inset rectangle just below the top rim, so the open gap reads into black)
    const iy = chestY1 - 0.02;
    quad(V(-headHalfX+0.04,iy,headZ+0.05), V(headHalfX-0.04,iy,headZ+0.05),
         V(footHalfX-0.04,iy,footZ-0.05), V(-footHalfX+0.04,iy,footZ-0.05), P.voidDk, 0.03);

    // carved panel lines on the -x side (recessed rectangle) + a crack on the +x side
    quad(V(-headHalfX-0.002,chestY0+0.10,headZ+0.08), V(-headHalfX-0.002,chestY0+0.10,footZ-0.08),
         V(-footHalfX-0.002,chestY1-0.10,footZ-0.08), V(-headHalfX-0.002,chestY1-0.10,headZ+0.08), P.carve, 0.04);
    // a jagged crack (thin dark quad) running diagonally down the head end
    quad(V(-0.02,chestY1,headZ-0.001), V(0.02,chestY1,headZ-0.001),
         V(0.06,chestY0+0.05,headZ-0.001), V(0.02,chestY0+0.05,headZ-0.001), P.carveDk, 0.03);
    // chipped corners
    quad(V(headHalfX,chestY1,headZ), V(headHalfX,chestY1-0.06,headZ), V(headHalfX-0.06,chestY1,headZ), V(headHalfX-0.06,chestY1,headZ), P.chip, 0.03);
  }

  /* ===== 3) THE LID (shoved ASKEW) — a thick slab capping the chest, but SLID toward the foot and
     TILTED so its head end lifts and overhangs, exposing the dark gap at the head. Built in a slid+
     tilted local frame. The effigy is carved on its top. ===== */
  const slideZ = 0.14;        // lid slid toward +z (foot)
  const tilt = -0.06;         // lid tilted so head end (-z) rises
  const lidCz = (headZ+footZ)/2 + slideZ, lidCy = (lidY0+lidY1)/2;
  const rotL = (x,y,z)=>{     // rotate about the lid center in the y-z plane by `tilt`
    const dz=z-lidCz, dy=y-lidCy;
    return V(x, lidCy + dz*Math.sin(tilt) + dy*Math.cos(tilt), lidCz + dz*Math.cos(tilt) - dy*Math.sin(tilt));
  };
  {
    const lHL=rotL(-headHalfX-0.02, lidY0, headZ+slideZ), lHR=rotL(headHalfX+0.02, lidY0, headZ+slideZ);
    const lFL=rotL(-footHalfX-0.02, lidY0, footZ+slideZ), lFR=rotL(footHalfX+0.02, lidY0, footZ+slideZ);
    const uHL=rotL(-headHalfX-0.02, lidY1, headZ+slideZ), uHR=rotL(headHalfX+0.02, lidY1, headZ+slideZ);
    const uFL=rotL(-footHalfX-0.02, lidY1, footZ+slideZ), uFR=rotL(footHalfX+0.02, lidY1, footZ+slideZ);
    quad(uHL,uHR,uFR,uFL, P.stoneLt, 0.05);      // top (lit) — the effigy sits on this
    quad(lHL,lFL,lFR,lHR, P.stoneDkr, 0.05);     // underside
    quad(uHL,lHL,lFL,uFL, P.stone, 0.05);        // -x
    quad(uHR,uFR,lFR,lHR, P.stoneDk, 0.05);      // +x
    quad(uHL,uHR,lHR,lHL, P.stoneDk, 0.05);      // head end (raised, overhanging)
    quad(uFL,lFL,lFR,uFR, P.stone, 0.05);        // foot end
    // pale broken chip where the lid grinds against the chest rim
    quad(rotL(-footHalfX-0.02,lidY0,footZ+slideZ-0.05),
         rotL(-footHalfX+0.06,lidY0,footZ+slideZ-0.05),
         rotL(-footHalfX-0.02,lidY0+0.05,footZ+slideZ-0.05),
         rotL(-footHalfX-0.02,lidY0+0.05,footZ+slideZ-0.05), P.chip, 0.03);

    /* ---- EFFIGY carved on the lid top: a raised head-block near the head end, a crossed-arms ridge
       at the chest, and a long body swell tapering to the foot. Stylized recumbent figure. ---- */
    const topY = lidY1;
    // a raised carved block on the lid top (tilted with the lid): top LIT, sides split so the relief
    // catches shadow and reads as a raised carving (not a flat painted patch).
    const eff = (x0,x1,z0,z1,h,top,side)=>{
      const a=rotL(x0,topY,z0), b=rotL(x1,topY,z0), c=rotL(x1,topY,z1), d=rotL(x0,topY,z1);
      const A=rotL(x0,topY+h,z0), B=rotL(x1,topY+h,z0), Cc=rotL(x1,topY+h,z1), D=rotL(x0,topY+h,z1);
      quad(D,Cc,B,A, top, 0.05);                 // top (lit)
      quad(a,A,B,b, side, 0.05);                 // head-side (-z)
      quad(c,Cc,D,d, top, 0.05);                 // foot-side (+z, catches light)
      quad(b,B,Cc,c, side, 0.05);                // +x flank (shadow-leaning)
      quad(d,D,A,a, top, 0.05);                  // -x flank (lit-leaning)
    };
    // head block (raised HIGHER, near the head end — the most legible tell)
    eff(-0.085, 0.085, headZ+slideZ+0.04, headZ+slideZ+0.21, 0.13, P.stoneLtr, P.stone);
    // crossed-arms ridge (a wider band across the chest, clearly proud)
    eff(-0.16, 0.16, headZ+slideZ+0.24, headZ+slideZ+0.36, 0.08, P.stoneLt, P.stoneDk);
    // body swell tapering to the foot (a long ridge, mid height)
    eff(-0.10, 0.10, headZ+slideZ+0.38, footZ+slideZ-0.04, 0.09, P.stoneLtr, P.stoneDk);
    // two dark eye recesses on the effigy head (it faces up) — sit on the raised head-block top
    const hz = headZ+slideZ+0.11, eyeY = topY+0.132;
    for(const ex of [-0.032,0.032]){
      const e0=rotL(ex-0.02, eyeY, hz-0.02), e1=rotL(ex+0.02, eyeY, hz-0.02),
            e2=rotL(ex+0.02, eyeY, hz+0.02), e3=rotL(ex-0.02, eyeY, hz+0.02);
      quad(e0,e1,e2,e3, P.carveDk, 0.03);
    }
  }

  /* base disc — bulky tomb prop (r=0.48). Darker crypt-floor tone. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.48, 0.48, 18);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.46, 0.46, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
