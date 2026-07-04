/* dev/model-qa/creatures/prop-throne.js — the THRONE: a stone SET PIECE (whole-object prop).
   Not a creature — no eyes, no grip. One function, one geometry frame, no anchors. The read:
   AUTHORITY FURNITURE — a heavy stone throne, unmistakably not a plain chair. Tells:
     - a ONE-STEP DAIS raising the throne
     - a broad worn SEAT slab + a low apron/base under it
     - two blocky ARMRESTS flanking the seat
     - a TALL TAPERING BACK (~1.7u) rising behind the seat
     - a CROWN-NOTCH silhouette at the top of the back (a battlement/crown cut — the authority tell)
     - a WORN seat top (a darker polished hollow where a body sits) + moss/age on the base
   VS-desaturated stone greys, a cold regal blue-grey accent on the back-panel, gold-worn on the seat.
   Scale reference: figures ~1.5u; the seat sits ~0.65u (chair height), the back crown ~1.7u+.
   Imported by prop-throne-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildThrone(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    stone:0x6f6c65, stoneDk:0x504d47, stoneDkr:0x37352f, stoneLt:0x8f8b7f,   // throne stone
    regal:0x53606d, regalDk:0x3c4650, regalLt:0x6d7c8a,                       // cold blue-grey back panel (rank)
    gold:0x9a7f42, goldDk:0x6f5b30,                                          // worn gilt trim
    seatWorn:0x45423a, seatWornDk:0x33302a,                                   // polished-hollow worn seat
    moss:0x556149, mossDk:0x3f492f, chip:0xacab9e,                            // age
    dais:0x605d56, daisDk:0x46433d, daisLt:0x77746a,
    disc:0x3a352b, discTop:0x46402f,
  };

  /* box helper (closed rectangular stone block, 3-tone) */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05); quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05); quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);  quad(Cc,G,H,D, top, 0.05);
  }

  /* ===== 1) ONE-STEP DAIS — a single broad step raising the throne (front +z open, throne set back). */
  const DAIS_TOP = 0.055 + 0.10;
  box(-0.40,0.40, 0.055,DAIS_TOP, -0.34,0.30, P.daisLt, P.dais, P.daisDk);
  quad(V(-0.40,DAIS_TOP,0.30), V(-0.30,DAIS_TOP,0.30), V(-0.40,DAIS_TOP-0.06,0.30), V(-0.40,DAIS_TOP-0.06,0.30), P.chip, 0.03);
  box(-0.40,0.40, 0.055,0.055+0.05, 0.28,0.30, P.moss,P.mossDk,P.mossDk);  // moss along the front step edge

  /* ===== 2) BASE / APRON — a solid stone block under the seat (the throne's plinth), narrower than
     the dais, set toward the back. The seat slab caps it. ===== */
  const BASE_Y1 = DAIS_TOP + 0.42;      // seat height on the dais (~0.62u total)
  box(-0.28,0.28, DAIS_TOP,BASE_Y1, -0.22,0.22, P.stoneLt, P.stone, P.stoneDkr);
  // a recessed dark panel on the front of the base (carved relief feel)
  quad(V(-0.18,DAIS_TOP+0.06,0.221), V(0.18,DAIS_TOP+0.06,0.221), V(0.16,BASE_Y1-0.06,0.221), V(-0.16,BASE_Y1-0.06,0.221), P.stoneDkr, 0.04);

  /* ===== 3) SEAT SLAB — a broad worn stone seat capping the base, overhanging front + sides. Its
     top has a darker WORN HOLLOW (polished by sitting). ===== */
  const SEAT_Y0 = BASE_Y1, SEAT_Y1 = BASE_Y1 + 0.09;
  box(-0.32,0.32, SEAT_Y0,SEAT_Y1, -0.24,0.26, P.stoneLt, P.stone, P.stoneDk);
  // worn hollow on the seat top (a darker inset patch, wound to face UP)
  {
    const y = SEAT_Y1 + 0.002;
    quad(V(-0.22,y,0.20), V(0.22,y,0.20), V(0.20,y,-0.14), V(-0.20,y,-0.14), P.seatWorn, 0.05);
    quad(V(-0.14,y,0.14), V(0.14,y,0.14), V(0.13,y,-0.08), V(-0.13,y,-0.08), P.seatWornDk, 0.05);  // polished core
  }
  // worn gilt trim strip along the seat front lip
  quad(V(-0.30,SEAT_Y0+0.02,0.261), V(0.30,SEAT_Y0+0.02,0.261), V(0.30,SEAT_Y0+0.06,0.261), V(-0.30,SEAT_Y0+0.06,0.261), P.gold, 0.05);

  /* ===== 4) ARMRESTS — two blocky stone armrests flanking the seat, running front-to-back, tops
     worn. They rise above the seat, ending in a squared front post. ===== */
  const ARM_Y1 = SEAT_Y1 + 0.16;
  for(const s of [-1,1]){
    box(s*0.24, s*0.24 + s*0.10, SEAT_Y1, ARM_Y1, -0.22, 0.24, P.stoneLt, P.stone, P.stoneDkr);
    // a squared front post cap on each armrest (a knob of authority)
    const ax0 = Math.min(s*0.24, s*0.24+s*0.10), ax1 = Math.max(s*0.24, s*0.24+s*0.10);
    box(ax0, ax1, ARM_Y1, ARM_Y1+0.06, 0.16, 0.24, P.stoneLt, P.stone, P.stoneDk);
    // worn gilt stud on the armrest front post
    quad(V((ax0+ax1)/2-0.03,ARM_Y1-0.01,0.241), V((ax0+ax1)/2+0.03,ARM_Y1-0.01,0.241),
         V((ax0+ax1)/2+0.03,ARM_Y1+0.04,0.241), V((ax0+ax1)/2-0.03,ARM_Y1+0.04,0.241), P.goldDk, 0.04);
  }

  /* ===== 5) TALL TAPERING BACK — the dominant tell. A slab rising ~1.7u from behind the seat,
     TAPERING inward as it climbs, faced with a cold regal blue-grey panel, topped by a CROWN-NOTCH
     silhouette (a battlement cut: high side merlons with a central notch — reads as a crown). ===== */
  const BACK_Z0 = -0.24, BACK_Z1 = -0.16;   // back slab depth (behind the seat)
  const backBotY = SEAT_Y1 - 0.02;
  const backTopY = SEAT_Y1 - 0.02 + 1.02;   // ~1.7u tall overall from ground (crown lands ~1.72)
  // the back slab as a stack of bands, tapering half-width top vs bottom (broad seat-back, gentle taper)
  {
    const bot = 0.32, top = 0.26;            // half-widths (broad — reads as a seat-back, not a spire)
    // build as a trapezoidal slab: two side quads + front + back + it caps below the crown
    const fB=V(-bot,backBotY,BACK_Z1), fBr=V(bot,backBotY,BACK_Z1);
    const fT=V(-top,backTopY,BACK_Z1), fTr=V(top,backTopY,BACK_Z1);
    const kB=V(-bot,backBotY,BACK_Z0), kBr=V(bot,backBotY,BACK_Z0);
    const kT=V(-top,backTopY,BACK_Z0), kTr=V(top,backTopY,BACK_Z0);
    quad(fB,fBr,fTr,fT, P.stone, 0.05);      // FRONT face (facing seat, +z) — base stone
    quad(kBr,kB,kT,kTr, P.stoneDk, 0.05);    // BACK face (-z)
    quad(fB,fT,kT,kB, P.stoneDk, 0.05);      // left
    quad(fBr,kBr,kTr,fTr, P.stoneDk, 0.05);  // right
    // REGAL PANEL — an inset cold blue-grey rectangle on the front face (the seat-back the sitter leans on)
    const pz = BACK_Z1 + 0.006;
    quad(V(-top+0.04,backBotY+0.10,pz), V(top-0.04,backBotY+0.10,pz),
         V(top-0.05,backTopY-0.10,pz),  V(-top+0.05,backTopY-0.10,pz), P.regal, 0.04);
    // a vertical gilt inlay stripe down the panel center
    quad(V(-0.025,backBotY+0.12,pz+0.002), V(0.025,backBotY+0.12,pz+0.002),
         V(0.020,backTopY-0.16,pz+0.002),  V(-0.020,backTopY-0.16,pz+0.002), P.gold, 0.04);
    // a lit panel highlight edge (regal light) down one side
    quad(V(-top+0.04,backBotY+0.10,pz+0.001), V(-top+0.065,backBotY+0.10,pz+0.001),
         V(-top+0.075,backTopY-0.10,pz+0.001), V(-top+0.05,backTopY-0.10,pz+0.001), P.regalLt, 0.03);

    /* CROWN-NOTCH — battlement merlons across the top of the back: high blocks at the sides + center,
       with notch gaps between (the crenellation that reads as a crown/authority). Built as small
       boxes standing on the slab top. */
    const merlonH = 0.16, mBz0=BACK_Z0, mBz1=BACK_Z1;
    // three merlons: left, center (tallest), right — with gaps between = the crown notches
    box(-top,      -top+0.10,  backTopY, backTopY+merlonH,       mBz0,mBz1, P.stoneLt,P.stone,P.stoneDk); // left merlon
    box( top-0.10,  top,       backTopY, backTopY+merlonH,       mBz0,mBz1, P.stoneLt,P.stone,P.stoneDk); // right merlon
    box(-0.07,      0.07,      backTopY, backTopY+merlonH+0.07,  mBz0,mBz1, P.stoneLt,P.stone,P.stoneDk); // center (tallest = crown point)
    // gilt cap on the center crown point
    quad(V(-0.05,backTopY+merlonH+0.05,BACK_Z1+0.002), V(0.05,backTopY+merlonH+0.05,BACK_Z1+0.002),
         V(0.04,backTopY+merlonH+0.09,BACK_Z1+0.002),  V(-0.04,backTopY+merlonH+0.09,BACK_Z1+0.002), P.gold, 0.04);
  }

  /* base disc — shared style (r=0.42). Stone tones. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
