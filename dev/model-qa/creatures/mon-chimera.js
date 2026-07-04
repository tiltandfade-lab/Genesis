/* dev/model-qa/creatures/mon-chimera.js — the CHIMERA (bespoke WINGED QUADRUPED, Large Monstrosity).
   docs/CREATURE-MODELS-P2.md Wave 2 (lifts the Wave 1 winged-quadruped base from mon-manticore.js):
   a lion-bodied quadruped carrying big leathery DRAGON WINGS off the shoulders (half-spread,
   peaking above the back, same rigging as the manticore's) and the classic THREE HEADS on the
   front — a maned LION head (center, forward), a horned GOAT head (rising up off the back/left
   of the neck), and a scaly-necked DRAGON head on a short neck (right). Tawny lion hide, grey-brown
   goat coat, dull-green dragon head/neck, dark wing membrane — all VS-desaturated. NO eye quads
   (house ruling). Whole-object grammar: one function, one merged geometry frame, no anchors.
   Large size: base disc r=0.55. Imported by the p2mon proof-sheet set + WHOLE_OBJECT_REGISTRY. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildChimera(){
  /* ---------- PALETTE (VS desaturated; tawny lion hide, grey-brown goat, dull-green dragon) ---------- */
  const P = {
    hide:0x8a7048, hideDk:0x6b5636, hideLt:0xa08659,          // tawny lion hide (body)
    mottleA:0x7c6440, mottleB:0x957a52,                        // dorsal mottle bands
    mane:0x5c4a2e, maneDk:0x3e321f,                            // shaggy lion mane/ruff
    lionFace:0x9a815a, lionFaceDk:0x6b5636,                    // lion head
    mouth:0x2a1f1a, tooth:0xcfc09a,
    goat:0x726a5c, goatDk:0x554f44, goatLt:0x8b8172,           // grey-brown goat coat
    horn:0x3a3428, hornLt:0x54493a,                            // goat horns
    drake:0x4a5a48, drakeDk:0x334031, drakeLt:0x647a5e,        // dull-green dragon head/neck scale
    fang:0xcfc09a,
    wing:0x362d24, wingDk:0x241d17, wingBone:0x584835,         // dark leathery membrane + bone struts
    claw:0x231d16,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.hide]:'fur', [P.hideDk]:'fur', [P.hideLt]:'fur', [P.mottleA]:'fur', [P.mottleB]:'fur',
    [P.mane]:'fur', [P.maneDk]:'fur', [P.lionFace]:'skin', [P.lionFaceDk]:'skin',
    [P.goat]:'fur', [P.goatDk]:'fur', [P.goatLt]:'fur', [P.horn]:'bone', [P.hornLt]:'bone',
    [P.drake]:'scale', [P.drakeDk]:'scale', [P.drakeLt]:'scale', [P.fang]:'bone',
    [P.wing]:'leather', [P.wingDk]:'leather', [P.wingBone]:'bone', [P.claw]:'bone',
  });

  /* ---------- LANDMARKS — spine along +z, lion stance (lifted from the manticore base). ---------- */
  const spY = 0.52;
  const S = {
    tailBase: V(0, spY+0.06, -0.52),
    rump:     V(0, spY+0.08, -0.34),
    loin:     V(0, spY+0.09, -0.12),
    mid:      V(0, spY+0.08,  0.10),
    shldr:    V(0, spY+0.05,  0.32),
    neck:     V(0, spY+0.02,  0.48),
    headB:    V(0, spY+0.00,  0.60),
  };

  /* ---------- BODY — one horizontal loft; a muscular lion barrel (manticore base). ---------- */
  tube(S.rump,  S.loin,  0.260, 0.290, 9, P.hide,    {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.290, 0.300, 9, P.mottleA, {phase:Math.PI/9});
  tube(S.mid,   S.shldr, 0.300, 0.270, 9, P.hide,    {phase:Math.PI/9});
  tube(S.shldr, S.neck,  0.270, 0.220, 9, P.mottleB, {phase:Math.PI/9});
  tube(S.neck,  S.headB, 0.220, 0.185, 9, P.hideDk,  {phase:Math.PI/9});

  /* pale-ish belly strip low on the flanks */
  {
    const by = spY-0.20;
    quad(V(-0.20,by,-0.28), V(0.20,by,-0.28), V(0.17,by+0.02,0.30), V(-0.17,by+0.02,0.30), P.hideLt, 0.05);
  }

  /* shaggy MANE/ruff around the neck (lion-signature — anchors the lion head read) */
  {
    const seg = [[-0.34,spY+0.30],[-0.14,spY+0.34],[0.10,spY+0.36],[0.30,spY+0.30]];
    for(let i=0;i<seg.length-1;i++){
      const [z0,y0]=seg[i], [z1,y1]=seg[i+1];
      quad(V(-0.20,y0-0.10,z0), V(0.20,y0-0.10,z0), V(0.17,y1-0.06,z1), V(-0.17,y1-0.06,z1), P.mane, 0.06);
    }
    for(const z of [-0.30,-0.10,0.12,0.30]){
      quad(V(-0.02,spY+0.30,z), V(0.02,spY+0.30,z), V(0.03,spY+0.44,z-0.03), V(-0.03,spY+0.44,z-0.03), P.maneDk, 0.05);
    }
  }

  /* ---------- LION HEAD — center, forward, the primary head (manticore head structure). ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.055, cz:0.60, rx:0.145, rz:0.150, hex:P.lionFace},
      {y:spY+0.010, cz:0.62, rx:0.168, rz:0.160, hex:P.lionFace},
      {y:spY+0.065, cz:0.60, rx:0.135, rz:0.120, hex:P.lionFaceDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.10, 0.60), P.maneDk);

    const snB = V(0, spY-0.06, 0.60);
    const snM = V(0, spY-0.075, 0.70);
    const snT = V(0, spY-0.085, 0.78);
    tube(snB, snM, 0.130, 0.096, n, P.lionFace, {raz:0.106, rbz:0.074, phase:ph});
    tube(snM, snT, 0.096, 0.060, n, P.lionFaceDk, {raz:0.074, rbz:0.046, phase:ph, capB:{hex:P.lionFaceDk, lift:0.008}});

    quad(V(-0.090,spY-0.115,0.63), V(0.090,spY-0.115,0.63), V(0.055,spY-0.120,0.76), V(-0.055,spY-0.120,0.76), P.mouth, 0.03);
    for(const s of [-1,1]){
      const tb = V(s*0.048, spY-0.108, 0.66);
      const tt = V(s*0.043, spY-0.132, 0.665);
      tube(tb, tt, 0.013, 0.004, 4, P.tooth, {capB:{hex:P.tooth, lift:0.003}});
    }
    quad(V(-0.095,spY+0.075,0.58), V(0.095,spY+0.075,0.58), V(0.085,spY+0.095,0.66), V(-0.085,spY+0.095,0.66), P.lionFaceDk, 0.04);
    for(const s of [-1,1]){
      const eb = V(s*0.150, spY+0.10, 0.55);
      const et = V(s*0.178, spY+0.20, 0.53);
      tube(eb, et, 0.042, 0.017, 5, P.lionFaceDk, {capB:{hex:P.lionFaceDk, lift:0.006}});
    }
  }

  /* ---------- GOAT HEAD — rises off the back/left of the neck, on a short upward-canted neck,
     horned, set back and to the side so it reads as a second head beside the lion's. ---------- */
  {
    const gRoot = V(-0.14, spY+0.14, 0.40);
    const gNeckT = V(-0.24, spY+0.34, 0.34);
    tube(gRoot, gNeckT, 0.088, 0.070, 7, P.goatDk, {phase:Math.PI/7});

    const n=7, ph=Math.PI/n;
    const gHeadC = V(-0.30, spY+0.42, 0.32);
    const bands=[
      {y:gHeadC.y-0.055, cz:gHeadC.z, cx:gHeadC.x, rx:0.078, rz:0.088, hex:P.goat},
      {y:gHeadC.y+0.010, cz:gHeadC.z+0.01, cx:gHeadC.x, rx:0.086, rz:0.082, hex:P.goat},
      {y:gHeadC.y+0.055, cz:gHeadC.z, cx:gHeadC.x, rx:0.066, rz:0.062, hex:P.goatDk},
    ];
    const rings=bands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(gHeadC.x, gHeadC.y+0.09, gHeadC.z), P.goatDk);

    // muzzle — narrow, blunt, projecting forward/out
    const mB = V(gHeadC.x-0.02, gHeadC.y-0.06, gHeadC.z+0.07);
    const mT = V(gHeadC.x-0.05, gHeadC.y-0.075, gHeadC.z+0.16);
    tube(mB, mT, 0.058, 0.034, n, P.goatLt, {raz:0.050, rbz:0.028, phase:ph, capB:{hex:P.mouth, lift:0.006}});
    quad(V(gHeadC.x-0.045,gHeadC.y-0.095,gHeadC.z+0.06), V(gHeadC.x+0.005,gHeadC.y-0.095,gHeadC.z+0.06),
         V(gHeadC.x-0.02,gHeadC.y-0.10,gHeadC.z+0.15), V(gHeadC.x-0.05,gHeadC.y-0.10,gHeadC.z+0.15), P.mouth, 0.03);

    // curved backswept horns — the goat signature
    for(const s of [-1,1]){
      const hb = V(gHeadC.x+s*0.05, gHeadC.y+0.075, gHeadC.z-0.03);
      const hm = V(gHeadC.x+s*0.09, gHeadC.y+0.16, gHeadC.z-0.12);
      const ht = V(gHeadC.x+s*0.10, gHeadC.y+0.24, gHeadC.z-0.22);
      tube(hb, hm, 0.026, 0.017, 5, P.horn, {capA:{hex:P.hornLt}});
      tube(hm, ht, 0.017, 0.006, 5, P.hornLt, {capB:{hex:P.hornLt, lift:0.004}});
    }
    // small pointed ears
    for(const s of [-1,1]){
      const eb = V(gHeadC.x+s*0.075, gHeadC.y+0.02, gHeadC.z-0.02);
      const et = V(gHeadC.x+s*0.115, gHeadC.y+0.05, gHeadC.z-0.06);
      tube(eb, et, 0.024, 0.008, 4, P.goatDk, {capB:{hex:P.goatDk, lift:0.004}});
    }
    // short chin tuft
    const tb = V(gHeadC.x-0.03, gHeadC.y-0.09, gHeadC.z+0.10);
    const tt = V(gHeadC.x-0.04, gHeadC.y-0.16, gHeadC.z+0.11);
    tube(tb, tt, 0.014, 0.004, 4, P.goatDk, {capB:{hex:P.goatDk, lift:0.003}});
  }

  /* ---------- DRAGON HEAD — a short scaly neck rising off the right shoulder, ending in a
     narrow reptilian head with a ridged brow and small back-swept horn-spikes. ---------- */
  {
    const dRoot = V(0.16, spY+0.10, 0.38);
    const dNeckM = V(0.28, spY+0.24, 0.44);
    const dNeckT = V(0.34, spY+0.36, 0.46);
    tube(dRoot, dNeckM, 0.086, 0.068, 7, P.drakeDk, {phase:Math.PI/7});
    tube(dNeckM, dNeckT, 0.068, 0.058, 7, P.drake, {phase:Math.PI/7});
    // scaly neck ridge — small triangular scutes running the neck
    for(const c of [dRoot, V(0.22,spY+0.17,0.41), dNeckM, V(0.31,spY+0.30,0.45)]){
      quad(V(c.x-0.018,c.y+0.05,c.z), V(c.x+0.018,c.y+0.05,c.z), V(0,c.y+0.095,c.z-0.01), V(0,c.y+0.095,c.z-0.01), P.drakeDk, 0.04);
    }

    const n=8, ph=Math.PI/n;
    const dHeadC = V(0.38, spY+0.42, 0.50);
    const bands=[
      {y:dHeadC.y-0.045, cz:dHeadC.z, cx:dHeadC.x, rx:0.062, rz:0.084, hex:P.drake},
      {y:dHeadC.y+0.010, cz:dHeadC.z+0.01, cx:dHeadC.x, rx:0.068, rz:0.078, hex:P.drakeLt},
      {y:dHeadC.y+0.045, cz:dHeadC.z, cx:dHeadC.x, rx:0.052, rz:0.056, hex:P.drakeDk},
    ];
    const rings=bands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(dHeadC.x, dHeadC.y+0.075, dHeadC.z), P.drakeDk);

    // long narrow snout, tapering to a point
    const snB = V(dHeadC.x, dHeadC.y-0.03, dHeadC.z+0.08);
    const snT = V(dHeadC.x, dHeadC.y-0.05, dHeadC.z+0.22);
    tube(snB, snT, 0.052, 0.020, n, P.drake, {raz:0.062, rbz:0.024, phase:ph, capB:{hex:P.mouth, lift:0.005}});
    quad(V(dHeadC.x-0.04,dHeadC.y-0.065,dHeadC.z+0.07), V(dHeadC.x+0.04,dHeadC.y-0.065,dHeadC.z+0.07),
         V(dHeadC.x,dHeadC.y-0.07,dHeadC.z+0.21), V(dHeadC.x,dHeadC.y-0.07,dHeadC.z+0.21), P.mouth, 0.03);
    // small fangs
    for(const s of [-1,1]){
      const fb = V(dHeadC.x+s*0.025, dHeadC.y-0.055, dHeadC.z+0.10);
      const ft = V(dHeadC.x+s*0.022, dHeadC.y-0.078, dHeadC.z+0.105);
      tube(fb, ft, 0.010, 0.003, 4, P.fang, {capB:{hex:P.fang, lift:0.002}});
    }
    // ridged brow spikes (small, back-swept) — no eyes, just bone-crest shape
    for(const s of [-1,1]){
      const bb = V(dHeadC.x+s*0.04, dHeadC.y+0.05, dHeadC.z-0.01);
      const bt = V(dHeadC.x+s*0.07, dHeadC.y+0.10, dHeadC.z-0.09);
      tube(bb, bt, 0.020, 0.006, 4, P.drakeDk, {capB:{hex:P.drakeDk, lift:0.004}});
    }
  }

  /* ---------- LEGS — lion stance (manticore base). ---------- */
  {
    const leg=(shoulder, footX, footZ, hex)=>{
      const kneeX = shoulder.x + Math.sign(shoulder.x)*0.06;
      const knee = V(kneeX, 0.26, shoulder.z + (footZ>shoulder.z?0.02:-0.02));
      const foot = V(footX, 0.075, footZ);
      tube(shoulder, knee, 0.110, 0.078, 7, hex);
      tube(knee, foot, 0.078, 0.058, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
      const pad = V(foot.x, 0.045, foot.z+0.03);
      for(const dx of [-0.05,-0.017,0.017,0.05]){
        const cb = V(pad.x+dx, 0.05, pad.z);
        const ct = V(pad.x+dx, 0.012, pad.z+0.05);
        tube(cb, ct, 0.016, 0.006, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    leg(V(-0.195, spY-0.03, 0.30), -0.28, 0.36, P.hide);
    leg(V( 0.195, spY-0.03, 0.30),  0.28, 0.36, P.hide);
    leg(V(-0.210, spY-0.01, -0.32), -0.30, -0.40, P.hide);
    leg(V( 0.210, spY-0.01, -0.32),  0.30, -0.40, P.hide);
  }

  /* ---------- WINGS — big leathery DRAGON wings off the shoulders, half-spread, peaking above
     the back (the manticore wing rig, reused verbatim per §Wave lift instruction). ---------- */
  {
    const wing=(side)=>{
      const root = V(side*0.16, spY+0.20, 0.20);

      const f1 = V(side*0.58, spY+0.86, -0.02);
      const f2 = V(side*0.86, spY+0.74, -0.22);
      const f3 = V(side*0.96, spY+0.54, -0.42);
      const f4 = V(side*0.80, spY+0.30, -0.56);

      const shoulder = V(side*0.30, spY+0.34, 0.10);
      tube(root, shoulder, 0.055, 0.042, 5, P.wingBone);
      tube(shoulder, f1, 0.042, 0.014, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.005}});
      tube(shoulder, f2, 0.040, 0.013, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.005}});
      tube(shoulder, f3, 0.036, 0.012, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});
      tube(shoulder, f4, 0.032, 0.011, 4, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});

      quad(shoulder, f1, f2, shoulder, P.wing, 0.10);
      quad(shoulder, f2, f3, shoulder, P.wingDk, 0.10);
      quad(shoulder, f3, f4, shoulder, P.wing, 0.10);
      const hTrail = V(side*0.42, spY+0.16, -0.46);
      quad(shoulder, f4, hTrail, root, P.wingDk, 0.10);

      const rim = [f1,f2,f3,f4];
      for(let i=0;i<rim.length-1;i++){
        const a = rim[i], b = rim[i+1];
        const dip = V((a.x+b.x)/2, (a.y+b.y)/2 - 0.07, (a.z+b.z)/2);
        quad(a, b, dip, dip, P.wingDk, 0.08);
      }
    };
    wing(-1); wing(1);
  }

  /* ---------- TAIL — a plain lion-hide tail (no scorpion sting — that's the manticore's signature,
     not the chimera's; sometimes drawn snake-headed, but the brief calls for THREE heads up front
     only, so this stays a simple lion tail sweeping back and up with a tufted tip). ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0.03, spY+0.02, -0.74);
    const t2 = V(0.08, spY+0.14, -0.96);
    const t3 = V(0.14, spY+0.22, -1.12);
    const tip= V(0.18, spY+0.28, -1.22);
    tube(t0, t1, 0.085, 0.062, 7, P.hide,    {phase:Math.PI/7, capA:{hex:P.hideDk}});
    tube(t1, t2, 0.062, 0.042, 7, P.mottleA, {phase:Math.PI/7});
    tube(t2, t3, 0.042, 0.026, 7, P.hide,    {phase:Math.PI/7});
    tube(t3, tip,0.026, 0.014, 7, P.hideDk,  {phase:Math.PI/7});
    // tufted tail tip
    quad(V(tip.x-0.03,tip.y+0.02,tip.z), V(tip.x+0.03,tip.y+0.02,tip.z), V(tip.x+0.02,tip.y+0.09,tip.z-0.05), V(tip.x-0.02,tip.y+0.09,tip.z-0.05), P.maneDk, 0.06);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
