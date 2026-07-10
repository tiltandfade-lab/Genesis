/* dev/model-qa/creatures/prop-careening-frame.js — CAREENING FRAME / SHIP'S-WAYS (High-Seas set piece).
   Heavy timber cradle a beached hull rests in for hull work. Whole-object grammar: one function,
   one geometry frame, no anchors. Footprint 3x2 cells (long axis = x). Tells, low→high:
     - two long SLEEPER BEAMS (ground timbers) running along x, tar-dark, the frame's foundation
     - two angled CRADLE BOWS (splayed leg-pairs + cross-brace) rising off the sleepers — the
       signature feature, reading as a big A-frame cradle from the +x/+z camera quadrant
     - WEDGE BLOCKS chocked in under the hull rib at each bow (pale-topped, jammed tight)
     - a WORK TRESTLE (small sawhorse) standing beside the frame, tools-down feel
     - the USE-TELL: a curved HULL-RIB SECTION sits cradled mid-careen — tar-dark planking with one
       broad PALE SCRAPED-CLEAN patch (the value zone) where the crew has been working the hull
   VS-desaturated tar-timber palette (near-black tarred wood + a raw-wood trestle/wedge accent +
   the pale scraped-hull patch). Scale: figures ~1.5u, 1 cell ~1.25u. Longest side (x) ~3.5u.
   Imported by prop-careening-frame-probe.html (render key prop:careening-frame, wired elsewhere). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropCareeningFrame(){
  /* ---------- PALETTE (weathered driftwood timber, tar-dark now ACCENT-only — VS law-3 fix,
     PLACE-PARTS-WAVE unit C3: prior tar-dark body tones vanished into the render void) ---------- */
  const P = {
    timber:0x7a6d55, timberDk:0x4a4030, timberLt:0x8c7f66,    // sleepers + cradle bow body (weathered grey-brown driftwood)
    timberCam:0x968870,                                       // cradle bow camera-facing (+x/+z) — lightest timber, signature A-frame read
    tar:0x2c2620, tarDk:0x1c1712,                              // ACCENT ONLY — tar-line stripe on sleepers, small shadow dabs
    wood:0x9a8a66, woodDk:0x7d6f52, woodLt:0xb0a077,          // wedge blocks + trestle — pale raw-cut wood, bright (freshly hammered)
    hull:0x574a38, hullDk:0x3a3024,                            // hull rib — tar-dark remnant patches at edges only (minority now)
    scraped:0xa8a08c, scrapedDk:0x8f8672, scrapedBright:0xb5ad98, // PALE scraped-clean patch — now DOMINATES the rib's outer face
    iron:0x35322c,                                             // a strap/nail dab
    disc:0x2c2620, discTop:0x342a1c,
  };

  /* helper: axis-aligned tarred-timber box, 3-tone shaded (matches prop-altar's box helper). */
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

  /* ===== 1) SLEEPER BEAMS — two long ground timbers running along x, one at -z one at +z, the
     foundation the whole frame stands on. Sit on the base plane (y≈0.055). ===== */
  const SLEEP_Y0 = 0.055, SLEEP_Y1 = 0.16;
  box(-1.65,1.65, SLEEP_Y0,SLEEP_Y1, -0.95,-0.68, P.timberLt, P.timber, P.timberDk);   // rear sleeper (-z)
  box(-1.65,1.65, SLEEP_Y0,SLEEP_Y1,  0.68, 0.95, P.timberLt, P.timber, P.timberDk);   // front sleeper (+z)
  // tar-line accent stripes along each sleeper's top face — the flavor lives here now, not the body tone
  quad(V(-1.60,SLEEP_Y1+0.001,-0.90), V(1.60,SLEEP_Y1+0.001,-0.90), V(1.60,SLEEP_Y1+0.001,-0.84), V(-1.60,SLEEP_Y1+0.001,-0.84), P.tar, 0.02);
  quad(V(-1.60,SLEEP_Y1+0.001, 0.90), V(1.60,SLEEP_Y1+0.001, 0.90), V(1.60,SLEEP_Y1+0.001, 0.84), V(-1.60,SLEEP_Y1+0.001, 0.84), P.tar, 0.02);

  /* ===== 2) CRADLE BOWS — two angled A-frame bows straddling the sleepers, splayed legs rising to
     meet near the top where the hull rib rests. The LOUD signature feature, front bow closer to
     +x/+z camera so its splay reads clean. ===== */
  const bow=(bx)=>{
    const apexY = 1.02, apexZ = 0.0;
    const footR = V(bx, SLEEP_Y1, -0.85), footF = V(bx, SLEEP_Y1, 0.85);
    const kneeR = V(bx*1.03, 0.62, -0.42), kneeF = V(bx*1.03, 0.62, 0.42);
    const apex  = V(bx, apexY, apexZ);
    // two-segment legs (foot->knee->apex) so the bow reads as a curved timber, not a straight strut.
    // Rear leg (-z, away from camera) = mid timber tone; front leg (+z, camera-facing) = lightest
    // timber tone so the A-frame silhouette reads clean (VS law-3 fix — was tar-dark, vanished).
    tube(footR, kneeR, 0.052,0.046, 6, P.timber, {capA:{hex:P.timberDk}});
    tube(kneeR, apex,  0.046,0.040, 6, P.timberLt);
    tube(footF, kneeF, 0.052,0.046, 6, P.timberCam, {capA:{hex:P.timberDk}});
    tube(kneeF, apex,  0.046,0.040, 6, P.timberCam);
    // cross-brace tying the two legs at mid-height (stability read) — dark timber shadow, not tar-black
    tube(V(bx,0.58,-0.35), V(bx,0.58,0.35), 0.030,0.030, 5, P.timberDk);
    // a knee gusset (small dark timber plate) at one knee — construction detail
    quad(V(bx-0.05,0.66,-0.44), V(bx+0.05,0.66,-0.44), V(bx+0.04,0.56,-0.38), V(bx-0.04,0.56,-0.38), P.iron, 0.03);
  };
  bow(-0.95);
  bow( 0.80);

  /* ===== 3) WEDGE BLOCKS — small pale-topped wood wedges chocked in at each bow, jammed under the
     rib to hold it tight mid-careen (the "occupied cradle" tell). ===== */
  const wedge=(wx,wz)=>{
    const y0=0.86, y1=1.00;
    box(wx-0.06,wx+0.06, y0,y1, wz-0.05,wz+0.05, P.woodLt, P.wood, P.woodDk);
    // pale worn top-corner chip
    quad(V(wx-0.06,y1,wz+0.05), V(wx+0.02,y1,wz+0.05), V(wx-0.06,y1-0.03,wz+0.05), V(wx-0.06,y1-0.03,wz+0.05), P.scraped, 0.03);
  };
  wedge(-0.95,-0.20); wedge(-0.95,0.22);
  wedge( 0.80,-0.20); wedge( 0.80,0.22);

  /* ===== 4) HULL-RIB SECTION — a partial curved hull rib cradled between the two bows' apexes,
     tar-dark planking with one broad PALE SCRAPED-CLEAN patch = the value zone / use-tell. Built as
     a shallow arched band of planks (a few stitched rings), curving down toward the camera face. ===== */
  {
    const n=7;
    const outer=[], inner=[];
    for(let i=0;i<n;i++){
      const t = i/(n-1);                    // 0 (left/-x) .. 1 (right/+x)
      const ang = -0.55 + t*1.10;            // sweep across the cradle
      const rx = 1.15, ry = 0.30, cx=-0.08, cy=1.18;
      const px = cx + Math.sin(ang)*rx;
      const py = cy - Math.cos(ang)*ry - 0.10*Math.abs(t-0.5);
      outer.push(V(px, py+0.09, -0.30 + 0.02*Math.sin(t*Math.PI)));
      inner.push(V(px, py-0.09,  0.30 - 0.02*Math.sin(t*Math.PI)));
    }
    // pale scraped planking now DOMINATES the rib's visible face — tar-dark remains only as a
    // remnant patch at the two far ends (VS law-3 fix — invert of the prior dark-body ratio).
    stitch([outer,inner], (i)=> (i===0 || i>=n-2) ? P.hull : P.scraped);
    // pale rim along the far (outer/top) edge so it reads as a curved timber rib, not a flat ribbon
    const outerRim = outer.map(p=>V(p.x, p.y+0.015, p.z));
    stitch([outerRim, outer], (i)=> (i===0 || i>=n-2) ? P.hullDk : P.scrapedDk);
    // bright scraped-core patch, sitting proud on the mid-span outer face (the value zone, widened
    // to carry most of the rib's length — this is the dominant tone now, not an accent)
    quad(V(outer[1].x,outer[1].y+0.006,outer[1].z), V(outer[n-2].x,outer[n-2].y+0.006,outer[n-2].z),
         V(inner[n-2].x+0.02,inner[n-2].y+0.006,inner[n-2].z), V(inner[1].x+0.02,inner[1].y+0.006,inner[1].z),
         P.scrapedBright, 0.04);
    // end caps so the rib section reads as a solid cut timber, not a hollow shell
    quad(outer[0], inner[0], inner[0], outer[0], P.hullDk, 0.02);
    quad(inner[n-1], outer[n-1], outer[n-1], inner[n-1], P.hullDk, 0.02);
  }

  /* ===== 5) WORK TRESTLE — a small sawhorse standing beside the frame (raw untarred wood, a tools-
     down read). Off to the +x end, clear of the bows. ===== */
  {
    const tx=1.42, tz=-0.05, topY=0.62;
    tube(V(tx-0.30,topY,tz), V(tx+0.30,topY,tz), 0.028,0.028, 6, P.wood, {capA:{hex:P.woodDk},capB:{hex:P.woodDk}});
    const legs=[[-0.24,-0.16],[0.24,-0.16],[-0.24,0.16],[0.24,0.16]];
    for(const [lx,lz] of legs){
      tube(V(tx+lx*0.7,topY-0.03,tz+lz*0.6), V(tx+lx,SLEEP_Y0,tz+lz), 0.026,0.020, 4, P.woodDk);
    }
    // a hand-saw laid across the trestle top (small dark tool tell)
    quad(V(tx-0.14,topY+0.012,tz-0.02), V(tx+0.16,topY+0.012,tz+0.01), V(tx+0.15,topY+0.012,tz+0.05), V(tx-0.15,topY+0.012,tz+0.02), P.iron, 0.03);
  }

  /* ===== base disc — elongated footprint (3x2 cells), tarred-yard tone. ===== */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 1.72, 1.10, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 1.68, 1.06, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
