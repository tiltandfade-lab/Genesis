/* dev/model-qa/creatures/prop-bonewall.js — the BONE-WALL: undead architecture SET PIECE (whole-object
   prop). Not a creature — no eyes, no grip. One function, one geometry frame, no anchors. The read:
   a section of wall BUILT FROM BONE — skulls mortared into courses, long-bones laid as a lattice
   screen between them. A grim ossuary partition, waist-to-head height, that a figure could crouch
   behind. Sits on the shared base disc (r=0.48 — a wider wall-section prop).
   Tells:
     - a low PLINTH course of stacked long-bones (the footing)
     - 2 COURSES of SKULLS mortared in a row (the skull-mortared tell) — pale domes with dark eye/nose
       voids, set in a darker mortar
     - between/above the skull courses, a LATTICE SCREEN of crossed long-bones (the "lattice/screen"
       tell) — thin pale bone tubes woven in an X-grid, gaps showing dark behind
     - a ragged BROKEN top edge (the wall is a fragment, not intact) with a couple of loose bones
   VS-desaturated: dead bone-pale (warm ivory, desaturated), dark ossuary mortar, near-black gaps.
   Scale reference: figures ~1.5u; the wall crest ~1.4u. Imported by prop-bonewall-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildBoneWall(){
  /* ---------- PALETTE (VS desaturated dead bone + ossuary mortar) ---------- */
  const P = {
    bone:0xc4bda4, boneDk:0x9a9279, boneDkr:0x746d58, boneLt:0xd8d1b6,        // long-bones / skull domes
    mortar:0x413c33, mortarDk:0x2c2822,                                       // dark packed mortar between skulls
    voidDk:0x161310, voidMid:0x241f18,                                        // eye/nose sockets + lattice gaps
    plinth:0x8f886f, plinthDk:0x6a6350,
    disc:0x38332a, discTop:0x433d2e,                                          // darker crypt-floor disc
  };

  /* the wall is a SLAB in the x-z plane, thin in z, spanning x. Front face is +z. */
  const wallZ = 0.0, halfD = 0.11;                 // slab half-depth
  const zF = wallZ + halfD, zB = wallZ - halfD;    // front / back faces
  const spanX = 0.40;                              // wall reaches x=±0.40

  /* ===== 1) PLINTH COURSE — a low footing of stacked long-bones laid horizontally (bundle read).
     Two stacked bone-tubes running the span, on a thin dark mortar sill. ===== */
  const plinthY0 = 0.055, plinthY1 = 0.30;
  {
    // dark mortar sill
    const A=V(-spanX-0.02,plinthY0,zB), B=V(spanX+0.02,plinthY0,zB), Cc=V(spanX+0.02,plinthY0,zF), D=V(-spanX-0.02,plinthY0,zF);
    const E=V(-spanX-0.02,plinthY0+0.05,zB), F=V(spanX+0.02,plinthY0+0.05,zB), G=V(spanX+0.02,plinthY0+0.05,zF), H=V(-spanX-0.02,plinthY0+0.05,zF);
    quad(H,G,F,E, P.plinthDk,0.05); quad(Cc,G,H,D, P.plinth,0.05); quad(A,E,F,B, P.plinthDk,0.05);
    // two long-bone bundles laid horizontally (each a tube with knobbed ends)
    for(const by of [plinthY0+0.09, plinthY0+0.19]){
      tube(V(-spanX, by, wallZ), V(spanX, by, wallZ), 0.055, 0.055, 7, by>plinthY0+0.12?P.bone:P.boneDk);
      // knobbed epiphysis ends (a small blob at each end)
      blob(-spanX, by, wallZ, 0.06,0.055,0.06, P.boneLt, 6,3);
      blob( spanX, by, wallZ, 0.06,0.055,0.06, P.boneLt, 6,3);
    }
  }

  /* ===== 2) SKULL COURSE — a row of skulls mortared in, the signature tell. Each skull = a pale
     dome (blob) with a squarer jaw below, two dark eye-void quads + a nose-void, packed in dark
     mortar. 4 skulls across the span. ===== */
  const skullY = plinthY1 + 0.16;
  const skullXs = [-0.30, -0.10, 0.10, 0.30];
  // dark mortar band behind the skull row (so gaps + set-in read)
  {
    const A=V(-spanX,plinthY1,zB), B=V(spanX,plinthY1,zB), E=V(-spanX,skullY+0.20,zB), F=V(spanX,skullY+0.20,zB);
    quad(E,F,B,A, P.mortarDk, 0.04);   // back plane
    const Af=V(-spanX,plinthY1,zB+0.03), Bf=V(spanX,plinthY1,zB+0.03), Ef=V(-spanX,skullY+0.20,zB+0.03), Ff=V(spanX,skullY+0.20,zB+0.03);
    quad(Af,Bf,Ff,Ef, P.mortar, 0.05); // a mortar face inset behind the skulls
  }
  for(const sx of skullXs){
    // cranium dome (blob, wider than tall), pushed to the front so it reads proud of the mortar
    const cz = wallZ + 0.02;
    blob(sx, skullY+0.02, cz, 0.085, 0.085, 0.075, P.bone, 8, 4);
    // squarer jaw/maxilla below the dome
    stack([
      {y:skullY-0.075, rx:0.055, rz:0.05, cx:sx, cz, hex:P.boneDk},
      {y:skullY-0.02,  rx:0.072, rz:0.062, cx:sx, cz, hex:P.bone},
    ], 7, {phase:Math.PI/7});
    // two dark eye sockets (recessed quads on the front dome) + a nose void
    for(const ex of [-0.032, 0.032]){
      quad(V(sx+ex-0.022, skullY+0.03, cz+0.07), V(sx+ex+0.022, skullY+0.03, cz+0.07),
           V(sx+ex+0.018, skullY-0.005, cz+0.068), V(sx+ex-0.018, skullY-0.005, cz+0.068), P.voidDk, 0.03);
    }
    quad(V(sx-0.012, skullY-0.01, cz+0.072), V(sx+0.012, skullY-0.01, cz+0.072),
         V(sx+0.008, skullY-0.05, cz+0.07), V(sx-0.008, skullY-0.05, cz+0.07), P.voidMid, 0.03);
  }

  /* ===== 3) LATTICE SCREEN — the crossed-long-bone weave above the skull course (the "lattice /
     screen" tell). Thin pale bone tubes in an X-grid across the span, gaps showing the dark void
     behind. A dark back-plane so the gaps read as open screen, not solid. ===== */
  const latY0 = skullY + 0.22, latY1 = 1.30;
  {
    // dark void back-plane (the gaps read against it)
    quad(V(-spanX,latY0,zB), V(spanX,latY0,zB), V(spanX,latY1,zB), V(-spanX,latY1,zB), P.voidMid, 0.03);
    // diagonal bone struts one way
    const cols = [-0.34,-0.17,0.0,0.17,0.34];
    for(let i=0;i<cols.length-1;i++){
      // "/" strut
      tube(V(cols[i],latY0,wallZ), V(cols[i+1],latY1,wallZ), 0.022,0.020, 5, i%2?P.bone:P.boneDk);
      // "\" strut (mirror)
      tube(V(cols[i+1],latY0,wallZ), V(cols[i],latY1,wallZ), 0.022,0.020, 5, i%2?P.boneDk:P.bone);
    }
    // one horizontal binding long-bone across the middle of the lattice
    tube(V(-spanX,(latY0+latY1)/2,wallZ+0.01), V(spanX,(latY0+latY1)/2,wallZ+0.01), 0.03,0.03,6, P.boneLt);
  }

  /* ===== 4) RAGGED BROKEN CREST — the wall is a fragment. A jagged top course: 3 uneven skull/bone
     nubs at varying heights + one loose long-bone leaning across the break. ===== */
  {
    const crestBase = latY1;
    const nubs = [{x:-0.28,h:0.16},{x:-0.02,h:0.24},{x:0.26,h:0.12}];
    for(const n of nubs){
      // a broken-off bone stub (short vertical tube, ragged pale top)
      tube(V(n.x,crestBase,wallZ), V(n.x+0.02,crestBase+n.h,wallZ), 0.045,0.03, 6, P.boneDk, {capB:{hex:P.boneLt}});
    }
    // a loose long-bone leaning across the broken top (diagonal)
    tube(V(-0.18,crestBase+0.05,wallZ+0.04), V(0.22,crestBase+0.30,wallZ+0.06), 0.035,0.028, 6, P.bone);
    blob(-0.18,crestBase+0.05,wallZ+0.04, 0.05,0.045,0.05, P.boneLt,6,3);
    blob( 0.22,crestBase+0.30,wallZ+0.06, 0.05,0.045,0.05, P.boneLt,6,3);
  }

  /* base disc — wider wall-section prop (r=0.48). Darker crypt-floor tone. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.48, 0.48, 18);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.46, 0.46, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
