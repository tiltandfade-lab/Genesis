/* dev/model-qa/creatures/prop-bandstand.js — the BANDSTAND: an octagon-ish raised commons dais
   (whole-object prop, cross-realm neutral). One function, one geometry frame, no anchors.
   Feature checklist (what the tri budget buys):
     - an OCTAGONAL raised PLATFORM (~0.42u high) — chamfered-corner box read, the "stage" itself
     - a short FLIGHT OF STEPS on the front (south) face — the one climbable side
     - EIGHT CORNER POSTS ringing the platform edge, suggesting an open rail (top+mid rail bars)
     - a pale WORN PLATFORM-TOP (the value zone) — foot-traffic-lightened boards, darker at the rim
     - a small LECTERN mid-platform (the use-tell) — angled reading-face on a post, someone was
       just addressing the green from here
   Use sentence: a town crier's lectern sits mid-platform on foot-worn boards — this dais is
   mid-speech, waiting for the next announcement.
   VS-desaturated weathered-wood palette (a few close browns + one pale worn-top + a dark accent). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropBandstand(){
  /* ---------- PALETTE (VS desaturated weathered wood) ---------- */
  const P = {
    deckLt:0x9c8f74, deck:0x7d7159, deckDk:0x5c5340,      // platform top (pale worn — value zone)
    rimDk:0x453f30, rimDkr:0x322e22,                       // platform rim/underside (shadowed)
    postLt:0x8a7c62, post:0x6b5f48, postDk:0x453d2e,       // corner posts
    railLt:0x968763,                                        // rail bars (pale-ish accent)
    stepLt:0x8f8265, step:0x6f6449, stepDk:0x4c4432,       // steps
    lecternLt:0x7a6a4d, lectern:0x584c38, lecternDk:0x362e21, // small lectern
    disc:0x3a352b, discTop:0x46402f,
  };

  /* helper: axis-aligned box, 3-tone shaded (top lit, sides mid, bottom dark). */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.04);
    quad(D,Cc,B,A, dk, 0.04);
    quad(D,H,E,A, mid, 0.04);
    quad(B,F,G,Cc, mid, 0.04);
    quad(A,E,F,B, dk, 0.04);
    quad(Cc,G,H,D, top, 0.04);
  }

  /* ===== 1) OCTAGONAL PLATFORM — footprint ~2x2 cells (1 cell ~1.25u -> ~2.4u across), chamfered
     corners give the octagon read cheaply (an 8-sided ring is a chamfered square). Height ~0.40u.
     Built on y=0.055 (ground clearance) up to the deck top. ===== */
  const R = 1.05;              // platform radius (fits inside a 2x2 cell footprint, ~2.1u across)
  const Y0 = 0.055;
  const Y1 = Y0 + 0.40;        // deck top
  {
    const rBot = ring(V(0,Y0,0), V(0,1,0), R, R, 8, Math.PI/8);
    const rTop = ring(V(0,Y1,0), V(0,1,0), R, R, 8, Math.PI/8);
    stitch([rBot, rTop], ()=>P.rimDk);          // the octagon drum side (shadowed rim)
    // pale worn deck top, darker toward the rim (two nested rings + fan)
    const rTopIn = ring(V(0,Y1+0.004,0), V(0,1,0), R*0.62, R*0.62, 8, Math.PI/8);
    stitch([rTop, rTopIn], ()=>P.deckDk);       // outer worn band (darker, less foot traffic)
    capFan(rTopIn, V(0,Y1+0.006,0), P.deckLt);  // inner pale worn boards (the value zone, foot-lightened)
    // underside close (a flat dark cap, cheap — reads as shadow when glimpsed)
    capFan(rBot, V(0,Y0-0.002,0), P.rimDkr, true);
  }

  /* ===== 2) STEPS — a short flight on the front (+z, south) face, two risers, spanning a modest
     width so the platform reads climbable from one side only. ===== */
  {
    const stepW = 0.46, zFront = R * Math.cos(Math.PI/8) - 0.02;  // roughly the flat front face
    const s0y0 = 0.055, s0y1 = Y0 + 0.16;
    box(-stepW/2, stepW/2, s0y0, s0y1, zFront, zFront+0.20, P.stepLt, P.step, P.stepDk);      // bottom riser
    box(-stepW/2*0.86, stepW/2*0.86, s0y1, Y1, zFront+0.06, zFront+0.14, P.stepLt, P.step, P.stepDk); // top riser up to deck
  }

  /* ===== 3) EIGHT CORNER POSTS — standing on the deck rim at each octagon vertex, with a top rail
     and a mid rail bar strung between adjacent posts (suggesting an open balustrade, not a wall). ===== */
  const postH = 0.62, postR = 0.035;
  const postTops = [];
  for(let i=0;i<8;i++){
    const a = Math.PI/8 + i*(Math.PI/4);
    const px = Math.sin(a)*R*0.97, pz = Math.cos(a)*R*0.97;
    // skip the two posts that would block the step gap (front-most vertex pair) — open stair mouth
    if (i===2 || i===3){ postTops.push(null); continue; }
    stack([
      {y:Y1,        rx:postR, rz:postR, cx:px, cz:pz, hex:P.postDk},
      {y:Y1+postH,  rx:postR*0.82, rz:postR*0.82, cx:px, cz:pz, hex:P.post},
    ], 6, {capTop:{hex:P.postLt, lift:0.008}});
    postTops.push({x:px, y:Y1+postH, z:pz});
  }
  // rail bars: a top rail + a mid rail between consecutive existing posts (coarse >=0.04u members)
  for(let i=0;i<8;i++){
    const a = postTops[i], b = postTops[(i+1)%8];
    if(!a || !b) continue;
    tube(V(a.x,a.y,a.z), V(b.x,b.y,b.z), 0.028, 0.028, 5, P.railLt);
    const midY = Y1 + postH*0.5;
    tube(V(a.x,midY,a.z), V(b.x,midY,b.z), 0.022, 0.022, 5, P.railLt);
  }

  /* ===== 4) LECTERN — small use-tell fixture standing mid-platform (offset toward the back so it
     reads clearly from the 3/4 front camera, not hidden behind a post), angled reading-face. ===== */
  {
    const lx=0.0, lz=-0.30, ly0=Y1+0.006;
    // stand post
    tube(V(lx,ly0,lz), V(lx,ly0+0.36,lz), 0.030, 0.024, 6, P.lectern);
    // angled reading-face (a tilted quad slab, wound to face the crowd toward +z)
    const topY = ly0+0.36, faceH=0.20, tiltZ=0.10;
    quad(
      V(lx-0.16, topY,       lz+0.02),
      V(lx+0.16, topY,       lz+0.02),
      V(lx+0.16, topY+faceH, lz+0.02-tiltZ),
      V(lx-0.16, topY+faceH, lz+0.02-tiltZ),
      P.lecternLt, 0.03
    );
    quad(  // back face of the slab (dark, closes the read)
      V(lx+0.16, topY,       lz-0.02),
      V(lx-0.16, topY,       lz-0.02),
      V(lx-0.16, topY+faceH, lz-0.02-tiltZ),
      V(lx+0.16, topY+faceH, lz-0.02-tiltZ),
      P.lecternDk, 0.03
    );
    // a little dark base foot
    box(lx-0.05, lx+0.05, ly0, ly0+0.02, lz-0.05, lz+0.05, P.lecternDk, P.lecternDk, P.lecternDk);
  }

  /* base disc — shared style (r sized a touch beyond the platform radius). */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), R+0.12, R+0.12, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), R+0.08, R+0.08, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
