/* dev/model-qa/creatures/rlm-ghost-cavalry-column.js — "Ghost Cavalry Column"
   (frontier realm, Large undead, CR 8, disc r=0.55). A mounted officer-revenant leading a
   column — read as ONE piece: officer astride a translucent horse-shape, with two ghostly
   rider-silhouettes flanking just behind (partially phased, thin/washed), sabers drawn,
   a silent bugle at the officer's hip. VS-desaturated pale blue-grey ghost palette, translucent
   read via thin dim geometry (no actual alpha — palette does the work). No eye quads. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGhostCavalryColumn(){
  const P = {
    ghost:0x6b7278, ghostLt:0x8a9096, ghostDk:0x4a5054,      // pale blue-grey main officer+mount
    faint:0x565c60, faintLt:0x6e7478,                         // dimmer flanking riders (phased-back read)
    coat:0x51565a, coatDk:0x363a3d,                           // cavalry coat
    horse:0x5e6468, horseDk:0x3d4245,
    saber:0x9aa0a2, saberDk:0x5c6062,
    brass:0x8a7a4e, socket:0x1c2022,
    disc:0x4a4038, discTop:0x584a3a,
  };

  /* MOUNT — ghostly horse-shape barrel, low legs fading to nothing (no hooves = phased-through) */
  const M = {
    rump: V(0,0.62,-0.34), mid: V(0,0.68,0.02), chest: V(0,0.66,0.34), neckB: V(0,0.74,0.46), headB: V(0,0.78,0.66),
  };
  tube(M.rump, M.mid, 0.20, 0.225, 9, P.horse, {phase:Math.PI/9});
  tube(M.mid, M.chest, 0.225, 0.195, 9, P.horseDk, {phase:Math.PI/9});
  tube(M.chest, M.neckB, 0.16, 0.11, 8, P.horse, {phase:Math.PI/8});
  tube(M.neckB, M.headB, 0.11, 0.075, 8, P.horseDk, {phase:Math.PI/8, capB:{hex:P.horseDk, lift:0.02}});
  /* ghost legs — thin, fading (no hoof cap = "not fully there") */
  for(const [x,z] of [[-0.13,0.30],[0.13,0.30],[-0.13,-0.28],[0.13,-0.28]]){
    tube(V(x,0.55,z), V(x*1.1,0.14,z), 0.045, 0.020, 5, P.faint);
  }
  /* mane */
  quad(V(-0.02,0.90,0.40), V(0.02,0.90,0.40), V(0.02,0.72,0.50), V(-0.02,0.72,0.50), P.ghostDk, 0.04);

  /* OFFICER-REVENANT astride, torso up from the horse's back */
  const S = { seat:V(0,0.92,0.06), waist:V(0,1.10,0.04), chest:V(0,1.32,0.02), shldr:V(0,1.48,0.00), neck:V(0,1.55,0.02), headB:V(0,1.62,0.02) };
  tube(S.seat, S.waist, 0.19, 0.20, 9, P.coat, {phase:Math.PI/9});
  tube(S.waist, S.chest, 0.20, 0.21, 9, P.coatDk, {phase:Math.PI/9});
  tube(S.chest, S.shldr, 0.21, 0.185, 9, P.coat, {phase:Math.PI/9});
  tube(S.shldr, S.neck, 0.185, 0.095, 9, P.coatDk, {phase:Math.PI/9});
  /* officer head — gaunt, socket-shadowed (no eye quads) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[{y:1.58,rx:0.095,rz:0.095,hex:P.ghost},{y:1.66,rx:0.105,rz:0.100,hex:P.ghostLt},{y:1.74,rx:0.085,rz:0.080,hex:P.ghostDk}];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.78,0.02), P.ghostDk);
    for(const s of [-1,1]) quad(V(s*0.05,1.68,0.11), V(s*0.02,1.68,0.115), V(s*0.02,1.63,0.115), V(s*0.05,1.63,0.11), P.socket, 0.02);
  }
  /* brim hat */
  {
    const r1=ring(V(0,1.78,0.02),V(0,1,0),0.15,0.15,10);
    const r2=ring(V(0,1.80,0.02),V(0,1,0),0.09,0.09,10);
    stitch([r1,r2], ()=>P.coatDk); capFan(r2, V(0,1.90,0.02), P.coatDk);
  }
  /* saber arm, drawn forward */
  {
    const sh=V(0.20,1.44,0.04), el=V(0.30,1.20,0.16), hd=V(0.34,1.02,0.36);
    tube(sh,el,0.055,0.042,6,P.coat); tube(el,hd,0.042,0.032,6,P.ghost,{capB:{hex:P.ghost,lift:0.015}});
    const tip=V(0.48,0.94,0.62);
    tube(hd,tip,0.018,0.004,4,P.saber,{capB:{hex:P.saberDk}});
  }
  /* off arm on reins */
  tube(V(-0.20,1.44,0.04), V(-0.14,1.18,0.34), 0.052, 0.038, 6, P.coat, {capB:{hex:P.ghost,lift:0.015}});
  /* silent bugle at the hip */
  tube(V(0.16,1.00,0.10), V(0.24,0.94,0.22), 0.018, 0.032, 5, P.brass, {capB:{hex:P.brass,lift:0.015}});

  /* TWO FAINT FLANKING RIDERS — smaller, dimmer, set behind/beside (partial-phase column read) */
  const flankRider=(ox,oz,hex,hexDk)=>{
    const base=V(ox,0.58,oz);
    tube(V(ox,0.58,oz), V(ox,0.90,oz+0.02), 0.16, 0.17, 7, hex, {phase:Math.PI/7});
    tube(V(ox,0.90,oz+0.02), V(ox,1.20,oz), 0.17, 0.14, 7, hexDk, {phase:Math.PI/7});
    tube(V(ox,1.20,oz), V(ox,1.40,oz-0.02), 0.09,0.06,6,hex,{capB:{hex:hexDk,lift:0.02}});
    /* faint saber */
    tube(V(ox+0.10,1.30,oz+0.05), V(ox+0.20,1.10,oz+0.20), 0.03,0.006,4,P.faintLt);
    /* faint legs */
    for(const dx of [-0.10,0.10]) tube(V(ox+dx,0.50,oz+0.20), V(ox+dx,0.12,oz+0.20), 0.035,0.015,4,hexDk);
  };
  flankRider(-0.44, -0.20, P.faint, P.faintLt);
  flankRider( 0.44, -0.24, P.faint, P.faintLt);

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
