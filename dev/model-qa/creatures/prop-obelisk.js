/* dev/model-qa/creatures/prop-obelisk.js — the INSCRIBED OBELISK: an arcane monolith SET PIECE
   (whole-object prop). Not a creature — no eyes, no grip. One function, one geometry frame, no
   anchors. The read: a tall dark monolith carved with GLOWING RUNES that channel light down its
   faces — a magical marker/ward stone, distinct from the plain stone pillar. Two variants:
     buildObelisk()  — the grounded inscribed obelisk (default): on a stepped base, planted on the disc.
     buildObeliskFloat() — the FLOATING MONOLITH variant: the same shaft HOVERING above the disc, base
                           gone, a faint glow halo beneath it (the "floating-monolith" param).
   Whole-object grammar: one function per variant (thin float wrapper), one geometry frame, no anchors.
   Sits on the shared base disc (r=0.42).
   Tells:
     - a tall TAPERED four-sided shaft (obelisk profile) capped with a PYRAMIDION (little pyramid top)
     - an EMISSIVE RUNE CHANNEL: a vertical groove down the front face filled with glowing glyph-quads
       (the sanctioned brightness exception — jitter 0 on the glow, it reads as LIGHT at board distance),
       plus a few glowing rune marks on the side faces
     - dark arcane basalt body (near-black, cold) so the glow pops; the float variant loses the base and
       gains an under-glow disc + it sits ~0.25u proud of the ground
   VS-desaturated basalt + a cold arcane cyan-white glow channel.
   Scale reference: figures ~1.5u; the obelisk ~2.3u to the pyramidion. A tall vertical landmark.
   Imported by prop-obelisk-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

/* shared palette */
const P = {
  basalt:0x2c2f33, basaltDk:0x1c1e21, basaltDkr:0x121316, basaltLt:0x3d4147,   // dark arcane stone
  edge:0x4a4f56,                                                               // lit chamfer edges
  rune:0x8fe6ff, runeCore:0xffffff, runeMid:0x4fb8e0, runeDk:0x2a7ea8,         // cold arcane glow (bright exception)
  glowHalo:0x1e4a5c,                                                           // dim under-glow (float variant)
  base:0x3a3d42, baseDk:0x26282b, baseLt:0x4c5057,
  disc:0x33302c, discTop:0x3d3a33,
};

/* box helper (closed rectangular block, 3-tone) */
function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
  const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
  const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
  quad(H,G,F,E, top, 0.05); quad(D,Cc,B,A, dk, 0.05);
  quad(D,H,E,A, mid, 0.05); quad(B,F,G,Cc, mid, 0.05);
  quad(A,E,F,B, dk, 0.05);  quad(Cc,G,H,D, top, 0.05);
}

/* the shaft + runes, built with its foot at `footY`. Shared by both variants. */
function shaft(footY){
  const topY = footY + 2.02;                    // shaft top (before the pyramidion)
  const hbot = 0.17, htop = 0.105;              // tapered half-width (obelisk taper)
  const zbot = 0.15, ztop = 0.095;

  // 8 corners of the tapered shaft
  const bNW=V(-hbot,footY,-zbot), bNE=V(hbot,footY,-zbot), bSE=V(hbot,footY,zbot), bSW=V(-hbot,footY,zbot);
  const tNW=V(-htop,topY,-ztop), tNE=V(htop,topY,-ztop), tSE=V(htop,topY,ztop), tSW=V(-htop,topY,ztop);
  quad(bSW,bSE,tSE,tSW, P.basaltLt, 0.05);      // FRONT (+z, lit) — the rune channel goes here
  quad(bNE,bNW,tNW,tNE, P.basaltDkr, 0.05);     // back (-z)
  quad(bNW,bSW,tSW,tNW, P.basalt, 0.05);        // -x
  quad(bSE,bNE,tNE,tSE, P.basaltDk, 0.05);      // +x (shadow)
  // lit vertical chamfer edges (thin bright strips on the two front verticals so edges catch light)
  quad(V(-hbot,footY,zbot+0.001),V(-hbot+0.02,footY,zbot+0.001),V(-htop+0.02,topY,ztop+0.001),V(-htop,topY,ztop+0.001), P.edge, 0.03);
  quad(V(hbot-0.02,footY,zbot+0.001),V(hbot,footY,zbot+0.001),V(htop,topY,ztop+0.001),V(htop-0.02,topY,ztop+0.001), P.edge, 0.03);

  // PYRAMIDION — a little pyramid cap on top
  {
    const apex=V(0, topY+0.24, 0);
    quad(tSW,tSE,apex,apex, P.basaltLt,0.05);   // front
    quad(tNE,tNW,apex,apex, P.basaltDkr,0.05);  // back
    quad(tNW,tSW,apex,apex, P.basalt,0.05);     // -x
    quad(tSE,tNE,apex,apex, P.basaltDk,0.05);   // +x
    // a bright rune capstone glow at the pyramidion tip (bright exception)
    quad(V(-0.03,topY+0.16,0.03),V(0.03,topY+0.16,0.03),V(0,topY+0.26,0),V(0,topY+0.26,0), P.runeCore, 0.0);
  }

  /* ===== EMISSIVE RUNE CHANNEL — a vertical groove down the FRONT (+z) face filled with glowing
     glyph-quads. Jitter 0 (bright light-source read). A ladder of rune marks climbs the channel. ==== */
  {
    const fz = zbot + 0.006;                     // just proud of the front face (interpolate width per y later)
    // recessed dark channel behind the glow (so the glow reads as light IN a groove)
    quad(V(-0.05,footY+0.14,fz-0.004),V(0.05,footY+0.14,fz-0.004),V(0.035,topY-0.06,ztop+0.004),V(-0.035,topY-0.06,ztop+0.004), P.basaltDkr, 0.03);
    // glyph rungs climbing the channel — bright quads, alternating full-width bars + smaller marks
    const rungs = 9;
    for(let i=0;i<rungs;i++){
      const t=(i+0.5)/rungs;
      const y=footY+0.20 + t*(topY-footY-0.34);
      const hw=(hbot + (htop-hbot)*t)*0.28;      // channel narrows with the taper
      const zz=(zbot + (ztop-zbot)*t)+0.006;
      const bright = (i%3===0)? P.runeCore : (i%2? P.rune : P.runeMid);
      // a short glyph bar
      quad(V(-hw,y-0.018,zz),V(hw,y-0.018,zz),V(hw*0.85,y+0.018,zz),V(-hw*0.85,y+0.018,zz), bright, 0.0);
      // a tick to one side (glyph variety)
      if(i%2===0)
        quad(V(hw*0.5,y+0.02,zz),V(hw,y+0.02,zz),V(hw,y+0.05,zz),V(hw*0.5,y+0.05,zz), P.runeDk, 0.0);
    }
    // a couple of glowing rune marks on the -x side face too
    for(const [yy,sc] of [[footY+0.7,1.0],[footY+1.4,0.8]]){
      const t=(yy-footY)/(topY-footY);
      const xw=-(hbot + (htop-hbot)*t) - 0.004;
      quad(V(xw,yy-0.03*sc,-0.03),V(xw,yy-0.03*sc,0.03),V(xw,yy+0.03*sc,0.02),V(xw,yy+0.03*sc,-0.02), P.runeMid, 0.0);
    }
  }
  return topY;
}

/* ============================== 1. GROUNDED INSCRIBED OBELISK ============================== */
export function buildObelisk(){
  const baseY=0.055;
  // stepped base — two shrinking blocks
  box(-0.26,0.26, baseY, baseY+0.11, -0.24,0.24, P.baseLt, P.base, P.baseDk);
  box(-0.21,0.21, baseY+0.11, baseY+0.20, -0.19,0.19, P.baseLt, P.base, P.baseDk);
  // a faint glow bleed onto the base top from the shaft foot (arcane charge in the stone)
  quad(V(-0.06,baseY+0.201,0.06),V(0.06,baseY+0.201,0.06),V(0.05,baseY+0.201,-0.05),V(-0.05,baseY+0.201,-0.05), P.glowHalo, 0.03);
  shaft(baseY+0.20);
  baseDisc();
}

/* ============================== 2. FLOATING MONOLITH VARIANT ============================== */
export function buildObeliskFloat(){
  /* the shaft HOVERS ~0.30u above the disc — no base. A dim arcane glow-halo pools beneath it on the
     disc (the levitation tell), and the shaft's bottom face is capped + faintly glowing. */
  const hoverY=0.34;
  // under-glow halo on the disc (a soft bright ring, dim so it reads as pooled light not a lamp)
  {
    const g1=ring(V(0,0.062,0),V(0,1,0),0.20,0.20,14,0);
    const g2=ring(V(0,0.062,0),V(0,1,0),0.05,0.05,14,0);
    stitch([g1,g2], ()=>P.glowHalo);
    capFan(g2, V(0,0.064,0), P.runeDk);
  }
  // the floating shaft
  const topY=shaft(hoverY);
  topY;
  // cap the shaft BOTTOM (it floats — you can see under it) with a faintly glowing underside
  {
    const hbot=0.17, zbot=0.15;
    const bNW=V(-hbot,hoverY,-zbot), bNE=V(hbot,hoverY,-zbot), bSE=V(hbot,hoverY,zbot), bSW=V(-hbot,hoverY,zbot);
    quad(bSW,bSE,bNE,bNW, P.basaltDkr, 0.04);   // bottom face
    // a small bright rune sigil on the underside (channels the levitation)
    quad(V(-0.05,hoverY-0.002,0.05),V(0.05,hoverY-0.002,0.05),V(0.05,hoverY-0.002,-0.05),V(-0.05,hoverY-0.002,-0.05), P.runeMid, 0.0);
  }
  baseDisc();
}

/* shared base disc (r=0.42), darker arcane-floor tone. */
function baseDisc(){
  const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
  const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
  stitch([r1,r2], ()=>P.disc);
  capFan(r2, V(0,0.058,0), P.discTop);
}
