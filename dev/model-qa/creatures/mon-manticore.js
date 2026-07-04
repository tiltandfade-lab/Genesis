/* dev/model-qa/creatures/mon-manticore.js — the MANTICORE (bespoke WINGED QUADRUPED, Large Monstrosity).
   docs/CREATURE-MODELS-P2.md Wave 1: lion-bodied quadruped + leathery bat wings folded/half-spread
   off the shoulders + a segmented scorpion-spike tail that arcs up and over the back to a barbed
   sting; a snarling near-human/lion face. Seeds the winged-quadruped base (chimera, sphinxes lift
   from it later). Tawny desaturated hide (VS palette, mottled), dark wing membrane, bone-pale spike.
   NO eye quads (house ruling). Whole-object grammar: one function, one geometry frame, no anchors.
   Large size: base disc r=0.55. Imported by the p2mon proof-sheet set + WHOLE_OBJECT_REGISTRY. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildManticore(){
  /* ---------- PALETTE (VS desaturated; tawny mottled lion-hide, dark membrane, bone spike) ---------- */
  const P = {
    hide:0x8a7048, hideDk:0x6b5636, hideLt:0xa08659,          // tawny lion hide
    mottleA:0x7c6440, mottleB:0x957a52,                        // dorsal mottle bands
    mane:0x5c4a2e, maneDk:0x3e321f,                            // shaggy mane/ruff
    face:0x9a815a, faceDk:0x6b5636,                            // near-human/lion snarling face
    mouth:0x2a1f1a, tooth:0xcfc09a,
    wing:0x362d24, wingDk:0x241d17, wingBone:0x584835,         // dark leathery membrane + bone struts
    spike:0xc9bd9a, spikeDk:0x9a8f70,                          // bone-pale scorpion spike/sting
    claw:0x231d16,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.hide]:'fur', [P.hideDk]:'fur', [P.hideLt]:'fur', [P.mottleA]:'fur', [P.mottleB]:'fur',
    [P.mane]:'fur', [P.maneDk]:'fur', [P.face]:'skin', [P.faceDk]:'skin',
    [P.wing]:'leather', [P.wingDk]:'leather', [P.wingBone]:'bone',
    [P.spike]:'bone', [P.spikeDk]:'bone', [P.claw]:'bone',
  });

  /* ---------- LANDMARKS — spine along +z, lion stance (a bit higher than a lizard's sprawl). ---------- */
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

  /* ---------- BODY — one horizontal loft; a muscular lion barrel. ---------- */
  tube(S.rump,  S.loin,  0.260, 0.290, 9, P.hide,    {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.290, 0.300, 9, P.mottleA, {phase:Math.PI/9});
  tube(S.mid,   S.shldr, 0.300, 0.270, 9, P.hide,    {phase:Math.PI/9});
  tube(S.shldr, S.neck,  0.270, 0.200, 9, P.mottleB, {phase:Math.PI/9});
  tube(S.neck,  S.headB, 0.200, 0.165, 9, P.hideDk,  {phase:Math.PI/9});

  /* pale-ish belly strip low on the flanks */
  {
    const by = spY-0.20;
    quad(V(-0.20,by,-0.28), V(0.20,by,-0.28), V(0.17,by+0.02,0.30), V(-0.17,by+0.02,0.30), P.hideLt, 0.05);
  }

  /* shaggy MANE/ruff around the neck (lion-signature) */
  {
    const seg = [[-0.34,spY+0.30],[-0.14,spY+0.34],[0.10,spY+0.36],[0.30,spY+0.30]];
    for(let i=0;i<seg.length-1;i++){
      const [z0,y0]=seg[i], [z1,y1]=seg[i+1];
      quad(V(-0.20,y0-0.10,z0), V(0.20,y0-0.10,z0), V(0.17,y1-0.06,z1), V(-0.17,y1-0.06,z1), P.mane, 0.06);
    }
    // shaggy tufts poking off the ruff
    for(const z of [-0.30,-0.10,0.12,0.30]){
      quad(V(-0.02,spY+0.30,z), V(0.02,spY+0.30,z), V(0.03,spY+0.44,z-0.03), V(-0.03,spY+0.44,z-0.03), P.maneDk, 0.05);
    }
  }

  /* ---------- HEAD — a snarling near-human/lion face: broad brow, flat man-ish visage, lion jaw. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.055, cz:0.60, rx:0.150, rz:0.155, hex:P.face},    // jaw/cheek
      {y:spY+0.010, cz:0.62, rx:0.175, rz:0.165, hex:P.face},    // broad cranium (near-human read)
      {y:spY+0.065, cz:0.60, rx:0.140, rz:0.125, hex:P.faceDk},  // brow
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.10, 0.60), P.maneDk);

    /* snarling snout — shorter/flatter than a lizard's, more man-like, lion nose-bridge */
    const snB = V(0, spY-0.06, 0.60);
    const snM = V(0, spY-0.075, 0.70);
    const snT = V(0, spY-0.085, 0.78);
    tube(snB, snM, 0.135, 0.100, n, P.face, {raz:0.110, rbz:0.078, phase:ph});
    tube(snM, snT, 0.100, 0.062, n, P.faceDk, {raz:0.078, rbz:0.048, phase:ph, capB:{hex:P.faceDk, lift:0.008}});

    /* snarling open mouth with bared teeth */
    quad(V(-0.095,spY-0.115,0.63), V(0.095,spY-0.115,0.63), V(0.058,spY-0.120,0.76), V(-0.058,spY-0.120,0.76), P.mouth, 0.03);
    for(const s of [-1,1]){
      const tb = V(s*0.05, spY-0.108, 0.66);
      const tt = V(s*0.045, spY-0.135, 0.665);
      tube(tb, tt, 0.014, 0.004, 4, P.tooth, {capB:{hex:P.tooth, lift:0.003}});
      const tb2 = V(s*0.075, spY-0.110, 0.70);
      const tt2 = V(s*0.07, spY-0.132, 0.705);
      tube(tb2, tt2, 0.012, 0.004, 4, P.tooth, {capB:{hex:P.tooth, lift:0.003}});
    }
    /* brow ridge — furrowed, angry */
    quad(V(-0.10,spY+0.075,0.58), V(0.10,spY+0.075,0.58), V(0.09,spY+0.095,0.66), V(-0.09,spY+0.095,0.66), P.faceDk, 0.04);

    /* rounded man-ish ears, small, set high on the skull */
    for(const s of [-1,1]){
      const eb = V(s*0.155, spY+0.10, 0.55);
      const et = V(s*0.185, spY+0.20, 0.53);
      tube(eb, et, 0.045, 0.018, 5, P.faceDk, {capB:{hex:P.faceDk, lift:0.006}});
    }
  }

  /* ---------- LEGS — lion stance: upper leg drops mostly straight down/slightly out, paw feet. ---------- */
  {
    const leg=(shoulder, footX, footZ, hex)=>{
      const kneeX = shoulder.x + Math.sign(shoulder.x)*0.06;
      const knee = V(kneeX, 0.26, shoulder.z + (footZ>shoulder.z?0.02:-0.02));
      const foot = V(footX, 0.075, footZ);
      tube(shoulder, knee, 0.110, 0.078, 7, hex);
      tube(knee, foot, 0.078, 0.058, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
      // lion paw — a pad + 4 short claws forward
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

  /* ---------- WINGS — the manticore's SIGNATURE feature: big leathery bat wings rising up and back
     off the shoulders, HALF-SPREAD (not folded flat). Each wing = a shoulder root + 4 splayed finger-
     spars fanning up/back, with large membrane quads stretched between them so the wing reads as a
     broad shape in silhouette (not a thin edge). Top spar arcs well above the mane/back line. ---------- */
  {
    const wing=(side)=>{
      const root = V(side*0.16, spY+0.20, 0.20);           // shoulder root, tucked near the mane

      // four finger-spars fanning from the root — top spar rises highest (above the back line ~spY+0.42),
      // bottom spar sweeps low/back so the membrane spread is tall AND wide, not a sliver.
      const f1 = V(side*0.58, spY+0.86, -0.02);            // top spar — the leading edge, arcs highest
      const f2 = V(side*0.86, spY+0.74, -0.22);            // upper-mid spar
      const f3 = V(side*0.96, spY+0.54, -0.42);            // lower-mid spar
      const f4 = V(side*0.80, spY+0.30, -0.56);            // bottom spar, trailing toward the rump

      // bone struts: a short humerus off the shoulder, then each finger-spar out to its tip
      const shoulder = V(side*0.30, spY+0.34, 0.10);
      tube(root, shoulder, 0.055, 0.042, 5, P.wingBone);
      tube(shoulder, f1, 0.042, 0.014, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.005}});
      tube(shoulder, f2, 0.040, 0.013, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.005}});
      tube(shoulder, f3, 0.036, 0.012, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});
      tube(shoulder, f4, 0.032, 0.011, 4, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});

      // membrane — large-area quads stretched spar-to-spar-to-shoulder, dark leathery, VS-desaturated.
      // Each panel spans a full gap between adjacent spars so the wing reads as one broad sail in
      // silhouette from above/side, its top edge clearly above the back/mane line.
      quad(shoulder, f1, f2, shoulder, P.wing, 0.10);
      quad(shoulder, f2, f3, shoulder, P.wingDk, 0.10);
      quad(shoulder, f3, f4, shoulder, P.wing, 0.10);
      // trailing membrane skirt from the bottom spar back down toward the body, closing the sail low
      const hTrail = V(side*0.42, spY+0.16, -0.46);
      quad(shoulder, f4, hTrail, root, P.wingDk, 0.10);

      // scalloped trailing-edge notches along the membrane's outer rim (leading edge f1→f2→f3→f4)
      const rim = [f1,f2,f3,f4];
      for(let i=0;i<rim.length-1;i++){
        const a = rim[i], b = rim[i+1];
        const dip = V((a.x+b.x)/2, (a.y+b.y)/2 - 0.07, (a.z+b.z)/2);
        quad(a, b, dip, dip, P.wingDk, 0.08);
      }
    };
    wing(-1); wing(1);
  }

  /* ---------- TAIL — segmented SCORPION-SPIKE tail, arcs up and over the back to a barbed sting.
     Roots at the rump, low at first, then curls up and forward over the haunches (classic manticore
     silhouette), ending in a bone-pale barbed stinger poised over the back. ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0, spY-0.02, -0.72);
    const t2 = V(0, spY+0.16, -0.92);
    const t3 = V(0, spY+0.42, -0.86);
    const t4 = V(0, spY+0.66, -0.58);
    const t5 = V(0, spY+0.80, -0.28);
    const tip= V(0, spY+0.88, -0.06);           // sting poised forward over the back
    // segmented plated look: alternate hex per segment (chitinous rings, not smooth like the lizard)
    tube(t0, t1, 0.150, 0.115, 8, P.hideDk,  {phase:Math.PI/8, capA:{hex:P.hideDk}});
    tube(t1, t2, 0.115, 0.088, 8, P.mottleA, {phase:Math.PI/8});
    tube(t2, t3, 0.088, 0.062, 8, P.hideDk,  {phase:Math.PI/8});
    tube(t3, t4, 0.062, 0.042, 8, P.mottleB, {phase:Math.PI/8});
    tube(t4, t5, 0.042, 0.026, 8, P.spikeDk, {phase:Math.PI/8});
    // segment plate ridges — small raised bands at each joint (scorpion-segment read)
    for(const c of [t1,t2,t3,t4,t5]){
      quad(V(-0.03,c.y-0.02,c.z), V(0.03,c.y-0.02,c.z), V(0.026,c.y+0.05,c.z), V(-0.026,c.y+0.05,c.z), P.hideDk, 0.05);
    }
    // barbed sting — a bone-pale curved spike at the tip, sharp point, with a small barb
    tube(t5, tip, 0.026, 0.006, 6, P.spike, {capB:{hex:P.spike, lift:0.004}});
    const barbBase = V(0, spY+0.82, -0.16);
    const barbTip  = V(0.04, spY+0.90, -0.20);
    tube(barbBase, barbTip, 0.012, 0.003, 4, P.spike, {capB:{hex:P.spike, lift:0.003}});
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
