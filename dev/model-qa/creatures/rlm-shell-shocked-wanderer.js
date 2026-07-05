/* dev/model-qa/creatures/rlm-shell-shocked-wanderer.js — Shell-Shocked Wanderer (theater, Medium, CR 0.25).
   A hollow-eyed survivor wandering no-man's-land muttering old orders. Whole-object bipedal grammar:
   one merged frame, a slack aimless stance (head tilted, shoulders slumped, one arm loose, one arm
   clutching a tattered coat closed), tattered greatcoat, gaunt hollow face (socket shading, no eye
   quads), a trailing loose puttee-wrap on one leg. VS-desaturated mud-drab palette (khaki-gray coat,
   ash-pale skin, dull dried-mud brown). Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildShellShockedWanderer(){
  const P = {
    coat:0x585448, coatDk:0x3a372c, coatLt:0x6c6857,
    mud:0x4a3d2c, mudDk:0x2f261b,
    skin:0x9a9082, skinDk:0x6a6155,
    hair:0x453f34,
    wrap:0x6a604c,
    disc:0x453f34, discTop:0x524b3c,
  };

  /* ---------- LANDMARKS — slack aimless posture: head tilted off-axis, torso slightly twisted. ---------- */
  const S = {
    hip:   V(0, 0.34, 0),
    waist: V(-0.01, 0.46, 0.0),
    chest: V(0.0, 0.58, -0.01),
    shldr: V(0.01, 0.64, 0.0),
    neck:  V(0.02, 0.68, 0.01),
    headB: V(0.03, 0.72, 0.02),
    headT: V(0.05, 0.85, 0.01),
  };

  /* ---------- TORSO — tattered greatcoat, slumped shoulders, off-plumb build. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.hip.y,   cx:S.hip.x,   cz:S.hip.z,   rx:0.145, hex:P.coatDk},
      {y:S.waist.y, cx:S.waist.x, cz:S.waist.z, rx:0.135, hex:P.coat},
      {y:S.chest.y, cx:S.chest.x, cz:S.chest.z, rx:0.150, hex:P.coat},
      {y:S.shldr.y, cx:S.shldr.x, cz:S.shldr.z, rx:0.125, hex:P.coatLt},
    ];
    const rings=bands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rx*0.82, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(S.hip.x,S.hip.y-0.08,S.hip.z), P.coatDk, true);
    // tattered hem strips
    for(const a of [-0.11,-0.02,0.07,0.13]){
      quad(V(a,S.hip.y-0.06,S.hip.z+0.05), V(a+0.05,S.hip.y-0.06,S.hip.z+0.05),
           V(a+0.02,S.hip.y-0.20,S.hip.z+0.04), V(a-0.02,S.hip.y-0.20,S.hip.z+0.04), P.coatDk, 0.07);
    }
    // mud stains splashed low on the coat
    quad(V(-0.08,S.hip.y-0.02,S.hip.z+0.10), V(0.02,S.hip.y-0.02,S.hip.z+0.11),
         V(0.0,S.hip.y+0.10,S.hip.z+0.08), V(-0.09,S.hip.y+0.10,S.hip.z+0.07), P.mud, 0.08);
  }

  /* ---------- HEAD — gaunt, tilted, hollow socket shading (no eye quads), matted hair. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const hx=S.headB.x;
    const bands=[
      {y:S.headB.y, r:0.078, hex:P.skinDk},
      {y:S.headB.y+0.08, r:0.084, hex:P.skin},
      {y:S.headT.y-0.03, r:0.070, hex:P.skin},
    ];
    const rings=bands.map(b=>ring(V(hx,b.y,S.headB.z), V(0.06,1,0).normalize(), b.r, b.r*0.9, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(hx+0.02,S.headT.y+0.02,S.headB.z-0.01), P.hair);
    // sunken socket shading, both sides
    quad(V(hx-0.06,S.headB.y+0.055,S.headB.z+0.06), V(hx-0.015,S.headB.y+0.055,S.headB.z+0.065),
         V(hx-0.02,S.headB.y+0.085,S.headB.z+0.06), V(hx-0.055,S.headB.y+0.085,S.headB.z+0.055), P.skinDk, 0.06);
    quad(V(hx+0.015,S.headB.y+0.055,S.headB.z+0.065), V(hx+0.06,S.headB.y+0.055,S.headB.z+0.06),
         V(hx+0.055,S.headB.y+0.085,S.headB.z+0.055), V(hx+0.02,S.headB.y+0.085,S.headB.z+0.06), P.skinDk, 0.06);
    // slack open jaw, muttering
    quad(V(hx-0.03,S.headB.y+0.005,S.headB.z+0.075), V(hx+0.03,S.headB.y+0.005,S.headB.z+0.075),
         V(hx+0.025,S.headB.y+0.03,S.headB.z+0.08), V(hx-0.025,S.headB.y+0.03,S.headB.z+0.08), P.mudDk, 0.04);
  }

  /* ---------- ARMS — one hanging slack loose, one clutching the coat closed at the chest. ---------- */
  {
    const shR = V(-0.13,0.63,0.0), elR = V(-0.18,0.48,0.02), hR = V(-0.16,0.32,0.03);
    tube(shR, elR, 0.048, 0.038, 6, P.coat);
    tube(elR, hR, 0.038, 0.028, 6, P.coatDk, {capB:{hex:P.skin, lift:0.02}});
    const shL = V(0.14,0.63,0.0), elL = V(0.14,0.56,0.10), hL = V(0.05,0.55,0.13);
    tube(shL, elL, 0.048, 0.038, 6, P.coat);
    tube(elL, hL, 0.038, 0.030, 6, P.coatDk, {capB:{hex:P.skin, lift:0.02}});
    // clutched fistful of coat lapel
    quad(V(0.02,0.50,0.10), V(0.08,0.50,0.11), V(0.06,0.60,0.08), V(0.0,0.60,0.07), P.coatLt, 0.05);
  }

  /* ---------- LEGS — uneven gait; one leg trailing a loose puttee-wrap. ---------- */
  {
    const hipL = V(-0.07,0.34,0), kneeL = V(-0.09,0.18,0.05), footL = V(-0.08,0.02,0.10);
    tube(hipL, kneeL, 0.062, 0.050, 6, P.coatDk);
    tube(kneeL, footL, 0.050, 0.038, 6, P.mud, {capB:{hex:P.mudDk, lift:0.02}});
    const hipR = V(0.07,0.34,0), kneeR = V(0.10,0.16,-0.06), footR = V(0.13,0.02,-0.12);
    tube(hipR, kneeR, 0.062, 0.050, 6, P.coatDk);
    tube(kneeR, footR, 0.050, 0.038, 6, P.mud, {capB:{hex:P.mudDk, lift:0.02}});
    // trailing loose puttee-wrap unraveling off the right shin
    const wb = V(0.10,0.14,-0.05), wt = V(0.20,0.02,-0.22);
    tube(wb, wt, 0.020, 0.010, 5, P.wrap, {capB:{hex:P.wrap, lift:0.004}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
