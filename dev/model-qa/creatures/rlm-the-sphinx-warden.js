/* dev/model-qa/creatures/rlm-the-sphinx-warden.js — THE SPHINX-WARDEN (lost-world, Large, CR 9).
   Lion-bodied, human-faced, feathered-winged riddler perched atop a ruined threshold stone. Read:
   a couchant lion body (haunches down, chest up, sphinx pose) with a serene humanoid face (no eye
   quads — carved lidded sockets, statue-like calm) wearing a nemes-style headcloth, large feathered
   wings folded along the back, forepaws crossed on a broken lintel stone it perches on. Whole-
   object grammar, one merged frame. Large disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheSphinxWarden(){
  const P = {
    fur:0x9c8657, furDk:0x71603c, furLt:0xb7a06d,
    mane:0x5f4e2e,
    skin:0xa88f68, skinDk:0x7a6647,                  // human face, statue-warm tone
    headcloth:0x2f5c66, headclothDk:0x1e3f47, gold:0x9c7d3a,
    feather:0x796b4a, featherDk:0x51462f, featherLt:0x9a8a60,
    mouth:0x2a221a,
    stone:0x655a48, stoneDk:0x453c30,
    claw:0x231e18,
    disc:0x453b30, discTop:0x554839,
  };

  /* ---------- LINTEL PERCH — broken threshold stone the sphinx sits atop. ---------- */
  {
    const n=12, ph=Math.PI/n;
    const b0 = ring(V(0,0.03,0.10), V(0,1,0), 0.50, 0.34, n, ph);
    const b1 = ring(V(0,0.13,0.10), V(0,1,0), 0.48, 0.32, n, ph);
    stitch([b0,b1], ()=>P.stoneDk);
    capFan(b1, V(0,0.135,0.10), P.stone);
    // a broken chipped corner
    quad(V(0.30,0.13,-0.10), V(0.48,0.13,-0.05), V(0.44,0.05,-0.02), V(0.28,0.05,-0.08), P.stoneDk, 0.08);
  }

  /* ---------- LION BODY — couchant sphinx pose: haunches low/back, chest raised/forward. ---------- */
  const spY = 0.30;
  const S = {
    haunch: V(0, spY+0.06, -0.30),
    loin:   V(0, spY+0.10, -0.06),
    chest:  V(0, spY+0.20, 0.20),
    shldr:  V(0, spY+0.22, 0.34),
    neck:   V(0, spY+0.24, 0.44),
  };
  tube(S.haunch, S.loin,  0.190, 0.205, 9, P.fur,   {phase:Math.PI/9});
  tube(S.loin,   S.chest, 0.205, 0.210, 9, P.furLt, {phase:Math.PI/9});
  tube(S.chest,  S.shldr, 0.210, 0.175, 9, P.fur,   {phase:Math.PI/9, capB:{hex:P.fur}});

  /* ---------- TAIL — sweeps from the haunch to one side with a small tuft. ---------- */
  {
    const t0 = V(0, spY+0.08, -0.42);
    const t1 = V(0.22, spY+0.02, -0.58);
    const t2 = V(0.34, spY+0.10, -0.68);
    tube(t0,t1,0.055,0.032,6,P.fur);
    tube(t1,t2,0.032,0.020,6,P.furDk,{capB:{hex:P.mane, lift:0.03}});
  }

  /* ---------- FOREPAWS — crossed, resting forward on the lintel; lion paws with claws. ---------- */
  for(const s of [-1,1]){
    const shoulder = V(s*0.12, spY+0.13, 0.34);
    const paw = V(s*0.06, 0.19, 0.62);
    tube(shoulder, paw, 0.080, 0.062, 7, P.fur, {capB:{hex:P.furLt, lift:0.01}});
    for(let i=0;i<3;i++){
      const cx = paw.x + (i-1)*0.03;
      const cb = V(cx, 0.175, 0.66);
      const ct = V(cx, 0.15, 0.72);
      tube(cb, ct, 0.014, 0.005, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
    }
  }

  /* ---------- HAUNCH LEGS — low, tucked beneath, couchant. ---------- */
  for(const s of [-1,1]){
    const hip = V(s*0.15, spY-0.02, -0.28);
    const foot = V(s*0.17, 0.10, -0.20);
    tube(hip, foot, 0.10, 0.075, 7, P.furDk, {capB:{hex:P.furDk, lift:0.01}});
  }

  /* ---------- HUMAN FACE — serene, statue-calm, no eye quads (carved lidded sockets). ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY+0.24, cz:0.50, rx:0.098, rz:0.100, hex:P.skin},   // jaw/cheek
      {y:spY+0.32, cz:0.51, rx:0.108, rz:0.105, hex:P.skin},   // brow
      {y:spY+0.40, cz:0.48, rx:0.092, rz:0.090, hex:P.skinDk}, // crown
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.43, 0.47), P.skinDk);
    capFan(rings[0], V(0, spY+0.20, 0.51), P.skinDk, true);

    // lidded carved sockets — recessed planes, statue calm, NOT eye quads
    for(const s of [-1,1]){
      const sx=s*0.04, sy=spY+0.29, sz=0.585;
      quad(V(sx-0.024,sy+0.012,sz), V(sx+0.024,sy+0.012,sz), V(sx+0.020,sy-0.010,sz+0.006), V(sx-0.020,sy-0.010,sz+0.006), P.skinDk, 0.04);
    }
    // nose ridge
    quad(V(-0.012,spY+0.28,0.58), V(0.012,spY+0.28,0.58), V(0.008,spY+0.24,0.60), V(-0.008,spY+0.24,0.60), P.skin, 0.03);
    // calm closed mouth line
    quad(V(-0.03,spY+0.235,0.585), V(0.03,spY+0.235,0.585), V(0.024,spY+0.225,0.59), V(-0.024,spY+0.225,0.59), P.mouth, 0.04);

    /* NEMES HEADCLOTH — striped cloth draping the head + shoulders. */
    {
      const hb = ring(V(0,spY+0.35,0.47), V(0,1,0), 0.135, 0.135, n, ph);
      const ht = ring(V(0,spY+0.46,0.44), V(0,1,0), 0.100, 0.100, n, ph);
      stitch([hb,ht], ()=>P.headcloth);
      capFan(ht, V(0,spY+0.475,0.44), P.gold);
      // lappets falling to the shoulders
      for(const s of [-1,1]){
        const lb = V(s*0.10, spY+0.30, 0.42);
        const lt = V(s*0.16, spY+0.10, 0.36);
        tube(lb, lt, 0.05, 0.045, 5, (s>0?P.headclothDk:P.headcloth));
      }
      // gold band across the brow
      quad(V(-0.10,spY+0.34,0.56), V(0.10,spY+0.34,0.56), V(0.09,spY+0.31,0.575), V(-0.09,spY+0.31,0.575), P.gold, 0.05);
    }
  }

  /* ---------- WINGS — large feathered wings folded along the back, layered feather rows. ---------- */
  for(const s of [-1,1]){
    const root = V(s*0.15, spY+0.28, 0.10);
    const tip  = V(s*0.52, spY+0.05, -0.30);
    const mid  = V(s*0.36, spY+0.42, -0.06);
    quad(root, mid, tip, V(s*0.24,spY+0.10,-0.12), P.feather, 0.07);
    quad(root, V(s*0.24,spY+0.10,-0.12), tip, V(mid.x,mid.y-0.10,mid.z), P.featherDk, 0.07);
    // feather row lines
    for(let i=0;i<3;i++){
      const t=(i+1)/4;
      const fa = V(root.x+(mid.x-root.x)*t, root.y+(mid.y-root.y)*t, root.z+(mid.z-root.z)*t);
      const fb = V(root.x+(tip.x-root.x)*t, root.y+(tip.y-root.y)*t, root.z+(tip.z-root.z)*t);
      quad(V(fa.x,fa.y-0.02,fa.z), V(fb.x,fb.y-0.02,fb.z), V(fb.x,fb.y-0.05,fb.z-0.02), V(fa.x,fa.y-0.05,fa.z-0.02), P.featherLt, 0.06);
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
