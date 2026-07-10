/* dev/model-qa/creatures/prop-loading-dock.js — the LOADING DOCK: a cargo-bay shell (whole-object prop).
   Not a creature — no disc-figure, no eyes, no grip. One function, one geometry frame, no anchors.
   The read (all at once): raised dock lip + roll-door frame behind it — goods move through here.
   Feature checklist (what the tri budget buys):
     - a raised CONCRETE/STONE DOCK LIP (~0.5u high, 2 cells / ~2.5u wide) — the platform figures step onto
     - a pale SCUFFED DOCK-EDGE STRIPE running the lip's front face (the value zone / safety-paint tell)
     - a ROLL-DOOR FRAME standing behind the lip (jambs + header, door tracks visible)
     - the ROLL-DOOR itself HALF-RAISED in its tracks — the use-tell + signature: goods move through here
     - one CRATE mid-transfer, sitting proud on the lip edge (half on/half off, as if being hauled up)
     - a bumper/curb strip along the lip's ground-level front edge (dock-bumper tell)
   VS-desaturated concrete/steel palette (cool greys + a pale safety-stripe accent + worn rust on steel).
   Scale reference: figures ~1.5u; footprint 2x1 five-ft cells (1 cell ~1.25u -> ~2.5u x 1.25u plan).
   Camera reads from the +x/+z quadrant, slightly elevated — the door + crate face that quadrant. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropLoadingDock(){
  /* ---------- PALETTE (VS desaturated concrete/steel) ---------- */
  const P = {
    crete:0x6c6a63, creteDk:0x504e49, creteDkr:0x3a3835, creteLt:0x838074,   // dock lip concrete
    stripe:0xa89a5e, stripeDk:0x8a7c46,                                      // pale scuffed safety stripe
    bumper:0x2c2925, bumperDk:0x1c1a17,                                      // rubber bumper strip
    steel:0x5a5e62, steelDk:0x3e4144, steelDkr:0x2c2e30, steelLt:0x767a7d,   // door frame
    rust:0x6b4a34, rustDk:0x4a3122,                                          // worn rust accents
    door:0x969a94, doorDk:0x82867f, doorSlat:0x8f938c, doorEdge:0xb4b8b0,    // roll-door panel (pale galvanized metal)
    voidDk:0x100f0e, interior:0x232019,                                     // opening void / dim interior backplane
    crate:0x8a6a42, crateDk:0x5f4a2e, crateLt:0xa8875a,                      // crate mid-transfer
    disc:0x35322c, discTop:0x413d34,
  };

  /* helper: axis-aligned box, 3-tone shaded (top lit, sides mid, front/back split). */
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

  /* ===== 1) DOCK LIP — raised concrete platform, 2 cells wide (~2.5u) x ~1.0u deep, ~0.5u high.
     Sits on the base plane (y~0.055). The figure-scale step-up surface. ===== */
  const LIP_Y0 = 0.055;
  const LIP_Y1 = LIP_Y0 + 0.50;
  box(-1.25,1.25, LIP_Y0,LIP_Y1, -0.55,0.45, P.creteLt, P.crete, P.creteDk);
  // chipped pale weathering facets at the lip's front top corners (age)
  quad(V(-1.25,LIP_Y1,0.45), V(-1.05,LIP_Y1,0.45), V(-1.25,LIP_Y1-0.05,0.45), V(-1.25,LIP_Y1-0.05,0.45), P.creteLt, 0.04);
  quad(V(1.25,LIP_Y1,0.45), V(1.25,LIP_Y1-0.05,0.45), V(1.05,LIP_Y1,0.45), V(1.05,LIP_Y1,0.45), P.creteDkr, 0.04);

  /* ===== 2) SCUFFED DOCK-EDGE STRIPE — pale worn safety paint running the lip's front (+z) face,
     just under the top edge. THE VALUE ZONE. Desaturated pale, scuffed (uneven darker patches). ===== */
  {
    const y0 = LIP_Y1 - 0.14, y1 = LIP_Y1 - 0.04;
    quad(V(-1.22,y1,0.451), V(1.22,y1,0.451), V(1.22,y0,0.451), V(-1.22,y0,0.451), P.stripe, 0.05);
    // scuff patches (darker, irregular) breaking up the stripe
    quad(V(-0.60,y1,0.452), V(-0.30,y1,0.452), V(-0.32,y0,0.452), V(-0.62,y0,0.452), P.stripeDk, 0.04);
    quad(V(0.40,y1,0.452), V(0.75,y1,0.452), V(0.70,y0,0.452), V(0.38,y0,0.452), P.stripeDk, 0.04);
  }

  /* ===== 3) BUMPER STRIP — dark rubber curb along the lip's ground-level front edge (dock-bumper tell). ===== */
  box(-1.20,1.20, LIP_Y0-0.03,LIP_Y0+0.09, 0.44,0.50, P.bumper, P.bumper, P.bumperDk);

  /* ===== 4) ROLL-DOOR FRAME — jambs + header standing behind the lip, human-scale opening.
     Frame is steel, worn/rusted at the base. Opening centered on the lip, set back at z~-0.50. ===== */
  const JAMB_W = 0.11, OPEN_HALF = 0.85, JAMB_Z0 = -0.62, JAMB_Z1 = -0.44;
  const FRAME_Y0 = LIP_Y1, FRAME_Y1 = FRAME_Y0 + 1.95, HEADER_Y0 = FRAME_Y1 - 0.16;
  // left jamb
  box(-OPEN_HALF-JAMB_W, -OPEN_HALF, FRAME_Y0,FRAME_Y1, JAMB_Z0,JAMB_Z1, P.steelLt, P.steel, P.steelDkr);
  // right jamb
  box(OPEN_HALF, OPEN_HALF+JAMB_W, FRAME_Y0,FRAME_Y1, JAMB_Z0,JAMB_Z1, P.steelLt, P.steel, P.steelDkr);
  // header (spans the top, houses the door track)
  box(-OPEN_HALF-JAMB_W, OPEN_HALF+JAMB_W, HEADER_Y0,FRAME_Y1, JAMB_Z0,JAMB_Z1, P.steelLt, P.steel, P.steelDk);
  // rust patches low on the jambs (worn steel)
  quad(V(-OPEN_HALF-JAMB_W,FRAME_Y0+0.05,JAMB_Z1), V(-OPEN_HALF,FRAME_Y0+0.05,JAMB_Z1), V(-OPEN_HALF,FRAME_Y0+0.20,JAMB_Z1), V(-OPEN_HALF-JAMB_W,FRAME_Y0+0.20,JAMB_Z1), P.rust, 0.05);
  quad(V(OPEN_HALF,FRAME_Y0+0.05,JAMB_Z1), V(OPEN_HALF+JAMB_W,FRAME_Y0+0.05,JAMB_Z1), V(OPEN_HALF+JAMB_W,FRAME_Y0+0.18,JAMB_Z1), V(OPEN_HALF,FRAME_Y0+0.18,JAMB_Z1), P.rustDk, 0.04);
  // slot track rails (thin steel rails running up each jamb inner face — the "roll" tell)
  tube(V(-OPEN_HALF+0.02,FRAME_Y0,JAMB_Z1-0.005), V(-OPEN_HALF+0.02,HEADER_Y0,JAMB_Z1-0.005), 0.02,0.02,6, P.steelDkr);
  tube(V(OPEN_HALF-0.02,FRAME_Y0,JAMB_Z1-0.005), V(OPEN_HALF-0.02,HEADER_Y0,JAMB_Z1-0.005), 0.02,0.02,6, P.steelDkr);

  /* ===== 5) THE ROLL-DOOR — HALF-RAISED in its tracks. Signature feature: a slatted panel that
     stops partway up the opening, reading as "half-raised" (dim interior visible above the door's
     top edge, door panel filling the lower half). Pale galvanized-metal panel vs. the concrete lip
     + a dark interior backplane behind the opening so the void reads as "inside a building," not
     empty air. Coarse proud slat bands (not thin lines) survive PS1 res. ===== */
  {
    const doorTop = FRAME_Y0 + (HEADER_Y0 - FRAME_Y0) * 0.42;   // door raised to ~42% of the opening height
    const doorW = OPEN_HALF - 0.03, doorZ = JAMB_Z1 - 0.03;

    // dim interior backplane — fills the FULL opening (behind the door), dark warm grey, NOT pure void.
    // Reads as "inside a building" behind the door panel and above it in the raised gap.
    quad(V(-doorW,HEADER_Y0-0.02,doorZ-0.05), V(doorW,HEADER_Y0-0.02,doorZ-0.05), V(doorW,FRAME_Y0,doorZ-0.05), V(-doorW,FRAME_Y0,doorZ-0.05), P.interior, 0.06);
    // darker void accent deep in the upper gap (depth cue, small)
    quad(V(-doorW*0.7,HEADER_Y0-0.04,doorZ-0.06), V(doorW*0.7,HEADER_Y0-0.04,doorZ-0.06), V(doorW*0.7,doorTop+0.05,doorZ-0.06), V(-doorW*0.7,doorTop+0.05,doorZ-0.06), P.voidDk, 0.03);

    // door panel — pale galvanized metal, distinct value from both concrete lip and dark interior
    box(-doorW, doorW, FRAME_Y0, doorTop, doorZ-0.03, doorZ, P.doorEdge, P.door, P.doorDk);

    // 3 coarse proud horizontal slat bands (>=0.04u), alternating two close pale tones — survives 1/3-res
    const slatBands = 3;
    for (let i=1;i<=slatBands;i++){
      const yc = FRAME_Y0 + (doorTop-FRAME_Y0)*(i/(slatBands+1));
      const bandH = 0.05;
      const tone = (i%2===0) ? P.doorSlat : P.doorDk;
      quad(V(-doorW,yc+bandH*0.5,doorZ+0.004), V(doorW,yc+bandH*0.5,doorZ+0.004), V(doorW,yc-bandH*0.5,doorZ+0.004), V(-doorW,yc-bandH*0.5,doorZ+0.004), tone, 0.04);
    }

    // pale bottom-edge bar (the lifted edge — the "half-raised" tell) + dark gap shadow directly under it
    const edgeH = 0.06;
    quad(V(-doorW,FRAME_Y0+edgeH,doorZ+0.006), V(doorW,FRAME_Y0+edgeH,doorZ+0.006), V(doorW,FRAME_Y0,doorZ+0.006), V(-doorW,FRAME_Y0,doorZ+0.006), P.doorEdge, 0.05);
    quad(V(-doorW,FRAME_Y0,doorZ+0.008), V(doorW,FRAME_Y0,doorZ+0.008), V(doorW,FRAME_Y0-0.04,doorZ+0.008), V(-doorW,FRAME_Y0-0.04,doorZ+0.008), 0x14120f, 0.05);
  }

  /* ===== 6) CRATE MID-TRANSFER — sitting proud on the lip's front-right edge, half on/half off,
     as if being hauled up over the bumper (the "goods move through here" use-tell). ===== */
  {
    const cx=0.68, cz=0.30, cy0=LIP_Y1-0.02;
    box(cx-0.20,cx+0.20, cy0,cy0+0.34, cz-0.20,cz+0.20, P.crateLt, P.crate, P.crateDk);
    // plank lines on the crate's front face
    quad(V(cx-0.20,cy0+0.22,cz+0.201), V(cx+0.20,cy0+0.22,cz+0.201), V(cx+0.20,cy0+0.20,cz+0.201), V(cx-0.20,cy0+0.20,cz+0.201), P.crateDk, 0.03);
    quad(V(cx-0.20,cy0+0.11,cz+0.201), V(cx+0.20,cy0+0.11,cz+0.201), V(cx+0.20,cy0+0.09,cz+0.201), V(cx-0.20,cy0+0.09,cz+0.201), P.crateDk, 0.03);
  }

  /* base disc — shared style (r sized for a 2x1 footprint). Concrete tones. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 1.30, 1.30, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 1.28, 1.28, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
