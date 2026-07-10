/* dev/model-qa/creatures/prop-gate-checkpoint.js — the GATE CHECKPOINT: a whole-object prop
   (barrier + guard-stand), neutral cross-realm register. One function, one geometry frame, no
   anchors. Footprint 2x1 five-ft cells (~2.5u x 1.25u).

   Feature checklist (what the budget buys):
     - TWO POSTS flanking the road gap, squared timber, banded pale/dark hazard paint at the top
     - the BARRIER ARM, hinged at the near post, HALF-DOWN (a shallow diagonal, not fully raised
       or fully lowered) — pale/dark banded stripes down its length: the use-tell AND the
       silhouette signature both at once
     - a small counterweight box at the arm's short hinge-side tail (reads as a real boom-gate)
     - a GUARD-STAND lean-to beside the near post: three-plank walls, one slanted roof panel,
       open front — the controlling presence
     - a STOOL + BRAZIER LUMP inside/beside the stand (someone sits here; a small warm coal-glow
       accent) — reinforces "someone controls this gap" without needing a figure
   Use sentence: a gate warden has cranked the boom half down for a slow patdown, propped against
   the post while the coals in the brazier still glow — the arm hangs at a blocking diagonal, the
   stand's stool still warm, so the whole gap reads "occupied checkpoint," not empty road-furniture.

   VS-desaturated neutral palette (weathered timber/iron greys + one pale hazard-band weathering +
   one warm coal accent). Scale reference: figures ~1.5u tall; posts ~1.0u; a 5-ft cell ≈1.25u.
   Imported by the theater prop registry as prop:gate-checkpoint (wired by the orchestrator). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropGateCheckpoint(){
  /* ---------- PALETTE (VS desaturated timber/iron, neutral) ---------- */
  const P = {
    post:0x5c5449, postDk:0x3e392f, postLt:0x746a5a,      // weathered post timber
    band:0xcfc3a0, bandDk:0x8f8264,                        // pale hazard-band weathering (the value zone)
    arm:0x55504a, armDk:0x38352f, armLt:0x6a655c,          // the boom itself (iron-banded timber)
    counter:0x2f2c28,                                      // counterweight box, dark
    roof:0x4a4640, roofDk:0x322f2a,                        // stand's slanted roof
    wall:0x5a5245, wallDk:0x3d382e,                         // stand's plank walls
    stool:0x4d463b,                                         // stool lump
    coal:0xb4552a, coalDk:0x6e2f16, coalGlow:0xe08a3c,      // brazier coal accent (warm)
    iron:0x2a2724,                                          // hinge/hardware
    disc:0x3a352f, discTop:0x46402f,
  };

  /* helper: axis-aligned box, 3-tone shaded like the altar exemplar. */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05);
    quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05);
    quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);
    quad(Cc,G,H,D, top, 0.05);
  }

  const GROUND = 0.055;

  /* ===== 1) THE TWO POSTS — near post (hinge side, x=-0.85) and far post (x=0.85), flanking the
     road gap along x. Squared timber, ~0.11u section, ~0.95u tall. Pale hazard band near the
     top of each (the pale weathering zone; ≥0.04u tall band so it survives at 1/3-res). ===== */
  const POST_H = 0.055 + 0.95;
  box(-0.91,-0.79, GROUND,POST_H, -0.06,0.06, P.postLt, P.post, P.postDk);   // near (hinge) post
  box( 0.79, 0.91, GROUND,POST_H, -0.06,0.06, P.postLt, P.post, P.postDk);   // far post
  // pale hazard bands, one per post, ~0.09u tall
  box(-0.91,-0.79, POST_H-0.30,POST_H-0.21, -0.062,0.062, P.band, P.band, P.bandDk);
  box( 0.79, 0.91, POST_H-0.30,POST_H-0.21, -0.062,0.062, P.band, P.band, P.bandDk);
  // post caps (small pale-topped block, weathering)
  box(-0.93,-0.77, POST_H,POST_H+0.05, -0.075,0.075, P.band, P.postLt, P.post);
  box( 0.77, 0.93, POST_H,POST_H+0.05, -0.075,0.075, P.band, P.postLt, P.post);

  /* ===== 2) THE BARRIER ARM — hinged at the near post's upper block, HALF-DOWN: a shallow
     diagonal from the hinge (high, near-post side) down toward the far post (low, ~0.42u), never
     touching the ground and never fully horizontal. This diagonal IS the silhouette signature.
     Banded pale/dark stripes down its length = the use-tell read at a glance. ===== */
  const HINGE = V(-0.79, POST_H-0.10, 0);
  const ARM_TIP = V(0.86, POST_H-0.10 - 0.50, 0);   // half-down: drops ~0.50u across the span
  // hinge hardware — small dark iron block at the pivot
  box(-0.86,-0.78, HINGE.y-0.05,HINGE.y+0.05, -0.05,0.05, P.iron, P.iron, P.iron);
  // the boom itself: tapered tube, banded by 4 short segments alternating arm/band color
  {
    const n = 4;
    for(let i=0;i<n;i++){
      const t0=i/n, t1=(i+1)/n;
      const a = V(HINGE.x+(ARM_TIP.x-HINGE.x)*t0, HINGE.y+(ARM_TIP.y-HINGE.y)*t0, 0);
      const b = V(HINGE.x+(ARM_TIP.x-HINGE.x)*t1, HINGE.y+(ARM_TIP.y-HINGE.y)*t1, 0);
      const rA = 0.05 - 0.012*t0, rB = 0.05 - 0.012*t1;
      const hex = (i%2===0) ? P.armLt : P.band;
      tube(a, b, rA, rB, 8, hex, i===n-1 ? {capB:{hex:P.armDk}} : {});
    }
  }
  // counterweight — a small dark box tail on the hinge side, past the post (boom-gate tell)
  box(-1.02,-0.90, HINGE.y-0.07,HINGE.y+0.06, -0.06,0.06, P.counter, P.counter, 0x1c1a17);

  /* ===== 3) GUARD-STAND — a small lean-to beside the near post, offset to +z so it stands clear
     of the road gap. Three low plank walls (back + two short sides), one slanted roof panel open
     to the front. Squat (~0.9u tall at back, lower at front eave). ===== */
  const SX0=-1.15, SX1=-0.60, SZ0=0.18, SZ1=0.62;
  const WALL_TOP = GROUND + 0.55;
  box(SX0,SX1, GROUND,WALL_TOP, SZ1-0.06,SZ1, P.wallDk, P.wall, P.wallDk);          // back wall (+z side, away from gap)
  box(SX0,SX0+0.06, GROUND,WALL_TOP, SZ0,SZ1, P.wall, P.wallDk, P.wallDk);          // left side wall
  box(SX1-0.06,SX1, GROUND,WALL_TOP-0.10, SZ0,SZ1, P.wall, P.wallDk, P.wallDk);     // right side wall (shorter, open-front lean)
  // slanted roof: single panel from the back-wall top sloping down toward the front (low eave)
  {
    const y=(x)=> WALL_TOP - (0.22)*((x-SX0)/(SX1-SX0));   // slopes down toward SX1 (front/open side)
    const A=V(SX0,WALL_TOP+0.03,SZ0-0.03), B=V(SX1,y(SX1)+0.03,SZ0-0.03);
    const Cc=V(SX1,y(SX1)+0.03,SZ1+0.04), D=V(SX0,WALL_TOP+0.03,SZ1+0.04);
    quad(D,Cc,B,A, P.roof, 0.05);   // topside (lit)
    quad(A,B,Cc,D, P.roofDk, 0.05); // underside
  }

  /* ===== 4) STOOL + BRAZIER LUMP — a squat stool block under the lean-to, and a small brazier
     lump with a warm coal-glow accent beside the near post (the "someone sits here" tell). ===== */
  box(-1.02,-0.88, GROUND,GROUND+0.16, 0.30,0.44, P.stool, P.stool, 0x332f27);   // stool
  {
    // brazier: a squat dark bowl (stack of 2 rings) with a glowing coal cap, set near the post
    const bx=-0.70, bz=0.28, by0=GROUND;
    stack([
      {y:by0,       rx:0.075, rz:0.075, cx:bx, cz:bz, hex:P.iron},
      {y:by0+0.03,  rx:0.085, rz:0.085, cx:bx, cz:bz, hex:0x232120},
      {y:by0+0.11,  rx:0.06,  rz:0.06,  cx:bx, cz:bz, hex:P.coalDk},
    ], 8, {capTop:{hex:P.coal, lift:0.004}});
    // a small brighter coal-glow fleck proud of the bowl top (the warm accent, ≥0.04u)
    quad(V(bx-0.035,by0+0.115,bz-0.02), V(bx+0.03,by0+0.115,bz-0.01), V(bx+0.02,by0+0.115,bz+0.03), V(bx-0.03,by0+0.115,bz+0.02), P.coalGlow, 0.08);
  }

  /* base disc — shared style, sized to the 2x1 footprint (elongated along x via two overlapping
     discs would break "one exported build fn / no anchors" simplicity, so a single generous disc
     covering the busiest cluster near the posts/stand is used instead; the whole prop is meant to
     be read against the tray floor, not the disc, per prop-altar convention). */
  {
    const r1=ring(V(-0.15,0.002,0.1), V(0,1,0), 1.05, 0.62, 20);
    const r2=ring(V(-0.15,0.055,0.1), V(0,1,0), 1.0, 0.58, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(-0.15,0.058,0.1), P.discTop);
  }
}
