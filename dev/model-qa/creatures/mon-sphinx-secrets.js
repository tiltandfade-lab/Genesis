/* dev/model-qa/creatures/mon-sphinx-secrets.js — the SPHINX OF SECRETS (bespoke WINGED QUADRUPED).
   docs/CREATURE-MODELS-P2.md Wave 5: lifts the manticore's winged-quadruped base. A lion-bodied
   quadruped with a regal, VEILED human face (a secretive, shadowed bearing — not a lion snarl) and
   broad feathered wings half-spread off the shoulders (grey-feathered, NOT bat membrane). Dusky tan
   hide (VS desaturated, mottled), dark-grey feathered wings, a dark veil-shadow across the lower
   face reading as secrecy rather than menace. NO eye quads — the socket sits in shadow (a dark
   recess, house ruling). Whole-object grammar: one function, one geometry frame, no anchors.
   Large-scale silhouette, base disc r=0.55. Imported by the p2mon proof-sheet set +
   WHOLE_OBJECT_REGISTRY (bestiary id "sphinx-of-secrets"). */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildSphinxOfSecrets(){
  /* ---------- PALETTE (VS desaturated; dusky tan hide, dark-grey feathered wings, veiled face) ---------- */
  const P = {
    hide:0x6e6048, hideDk:0x50442f, hideLt:0x847558,          // dusky tan lion hide
    mottleA:0x5f5238, mottleB:0x776a4c,                        // dorsal mottle bands
    mane:0x40382a, maneDk:0x2a251c,                            // dark shaggy ruff
    face:0x8c7a5e, faceDk:0x5f5238, veil:0x2c2620,             // regal veiled visage + dark veil-shadow
    mouth:0x211c17,
    wing:0x3a3c3c, wingDk:0x262828, wingBone:0x504e42,         // dark-grey feathered wing + bone strut
    plume:0x46474a,                                            // feather-tuft accent
    claw:0x1e1a15,
    disc:0x453c33, discTop:0x534a3f,
  };
  setChannels({
    [P.hide]:'fur', [P.hideDk]:'fur', [P.hideLt]:'fur', [P.mottleA]:'fur', [P.mottleB]:'fur',
    [P.mane]:'fur', [P.maneDk]:'fur', [P.face]:'skin', [P.faceDk]:'skin', [P.veil]:'cloth',
    [P.wing]:'feather', [P.wingDk]:'feather', [P.wingBone]:'bone', [P.plume]:'feather',
    [P.claw]:'bone',
  });

  /* ---------- LANDMARKS — spine along +z, lion stance held a touch lower/tucked (secretive bearing). ---------- */
  const spY = 0.48;
  const S = {
    tailBase: V(0, spY+0.05, -0.48),
    rump:     V(0, spY+0.07, -0.30),
    loin:     V(0, spY+0.08, -0.10),
    mid:      V(0, spY+0.07,  0.10),
    shldr:    V(0, spY+0.04,  0.30),
    neck:     V(0, spY+0.00,  0.44),
    headB:    V(0, spY-0.02,  0.56),
  };

  /* ---------- BODY — one horizontal loft; a lion barrel, kept slightly leaner than the manticore. ---------- */
  tube(S.rump,  S.loin,  0.235, 0.260, 9, P.hide,    {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.260, 0.265, 9, P.mottleA, {phase:Math.PI/9});
  tube(S.mid,   S.shldr, 0.265, 0.240, 9, P.hide,    {phase:Math.PI/9});
  tube(S.shldr, S.neck,  0.240, 0.175, 9, P.mottleB, {phase:Math.PI/9});
  tube(S.neck,  S.headB, 0.175, 0.145, 9, P.hideDk,  {phase:Math.PI/9});

  /* pale-ish belly strip, low on the flanks */
  {
    const by = spY-0.185;
    quad(V(-0.175,by,-0.24), V(0.175,by,-0.24), V(0.15,by+0.02,0.28), V(-0.15,by+0.02,0.28), P.hideLt, 0.05);
  }

  /* dark shaggy ruff around the neck (regal, not lion-mane wild) */
  {
    const seg = [[-0.30,spY+0.24],[-0.12,spY+0.28],[0.08,spY+0.30],[0.26,spY+0.24]];
    for(let i=0;i<seg.length-1;i++){
      const [z0,y0]=seg[i], [z1,y1]=seg[i+1];
      quad(V(-0.17,y0-0.08,z0), V(0.17,y0-0.08,z0), V(0.145,y1-0.05,z1), V(-0.145,y1-0.05,z1), P.mane, 0.06);
    }
  }

  /* ---------- HEAD — a regal, VEILED human face: broad brow, still visage, dark shadowed lower face. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.05,  cz:0.56, rx:0.130, rz:0.135, hex:P.veil},    // jaw/cheek — sits in veil-shadow
      {y:spY+0.015, cz:0.58, rx:0.155, rz:0.150, hex:P.face},    // broad cranium — regal human read
      {y:spY+0.065, cz:0.56, rx:0.125, rz:0.115, hex:P.faceDk},  // brow, calm/still
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.095, 0.56), P.maneDk);

    /* subtle brow ridge — still, unreadable expression */
    quad(V(-0.09,spY+0.07,0.54), V(0.09,spY+0.07,0.54), V(0.08,spY+0.088,0.61), V(-0.08,spY+0.088,0.61), P.faceDk, 0.04);

    /* dark socket recesses (NOT eye quads — shape only, shadowed pits under the brow) */
    for(const s of [-1,1]){
      const sb = V(s*0.052, spY+0.015, 0.585);
      const st = V(s*0.052, spY-0.005, 0.615);
      tube(sb, st, 0.020, 0.014, 4, P.veil, {capB:{hex:P.veil, lift:0.002}});
    }

    /* closed, composed mouth line (no bared teeth — secrecy, not menace) */
    quad(V(-0.055,spY-0.095,0.615), V(0.055,spY-0.095,0.615), V(0.045,spY-0.098,0.635), V(-0.045,spY-0.098,0.635), P.mouth, 0.03);

    /* the VEIL — a dark cloth drape hanging from the cheekbones over the lower face/jaw, secretive */
    {
      const vTop  = [V(-0.115,spY+0.005,0.545), V(0.115,spY+0.005,0.545)];
      const vBot  = [V(-0.085,spY-0.135,0.585), V(0.085,spY-0.135,0.585)];
      quad(vTop[0], vTop[1], vBot[1], vBot[0], P.veil, 0.06);
      // a small trailing fold hanging lower on one side
      quad(V(-0.06,spY-0.10,0.60), V(0.02,spY-0.10,0.60), V(0.01,spY-0.19,0.615), V(-0.05,spY-0.19,0.615), P.veil, 0.05);
    }

    /* small rounded ears, set high, mostly hidden by the ruff */
    for(const s of [-1,1]){
      const eb = V(s*0.135, spY+0.09, 0.51);
      const et = V(s*0.16,  spY+0.175,0.49);
      tube(eb, et, 0.038, 0.015, 5, P.faceDk, {capB:{hex:P.faceDk, lift:0.005}});
    }
  }

  /* ---------- LEGS — lion stance: straight-down/slightly-out upper leg, paw feet. ---------- */
  {
    const leg=(shoulder, footX, footZ, hex)=>{
      const kneeX = shoulder.x + Math.sign(shoulder.x)*0.055;
      const knee = V(kneeX, 0.245, shoulder.z + (footZ>shoulder.z?0.02:-0.02));
      const foot = V(footX, 0.07, footZ);
      tube(shoulder, knee, 0.100, 0.070, 7, hex);
      tube(knee, foot, 0.070, 0.052, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.005}});
      const pad = V(foot.x, 0.042, foot.z+0.028);
      for(const dx of [-0.045,-0.015,0.015,0.045]){
        const cb = V(pad.x+dx, 0.046, pad.z);
        const ct = V(pad.x+dx, 0.011, pad.z+0.045);
        tube(cb, ct, 0.014, 0.005, 4, P.claw, {capB:{hex:P.claw, lift:0.003}});
      }
    };
    leg(V(-0.175, spY-0.03, 0.28),  -0.25, 0.33, P.hide);
    leg(V( 0.175, spY-0.03, 0.28),   0.25, 0.33, P.hide);
    leg(V(-0.190, spY-0.01, -0.28), -0.27, -0.36, P.hide);
    leg(V( 0.190, spY-0.01, -0.28),  0.27, -0.36, P.hide);
  }

  /* ---------- WINGS — broad FEATHERED wings (grey, not bat membrane), half-spread off the shoulders. ---------- */
  {
    const wing=(side)=>{
      const root = V(side*0.145, spY+0.18, 0.18);

      const f1 = V(side*0.50, spY+0.72, -0.02);
      const f2 = V(side*0.74, spY+0.62, -0.20);
      const f3 = V(side*0.82, spY+0.46, -0.38);
      const f4 = V(side*0.68, spY+0.26, -0.50);

      const shoulder = V(side*0.26, spY+0.30, 0.09);
      tube(root, shoulder, 0.050, 0.038, 5, P.wingBone);
      tube(shoulder, f1, 0.038, 0.012, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});
      tube(shoulder, f2, 0.036, 0.011, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});
      tube(shoulder, f3, 0.032, 0.010, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});
      tube(shoulder, f4, 0.028, 0.010, 4, P.wingBone, {capB:{hex:P.wingBone, lift:0.003}});

      /* feathered panels (large flat quads read as pinion sails at PS1 texel scale) */
      quad(shoulder, f1, f2, shoulder, P.wing, 0.10);
      quad(shoulder, f2, f3, shoulder, P.wingDk, 0.10);
      quad(shoulder, f3, f4, shoulder, P.wing, 0.10);
      const hTrail = V(side*0.36, spY+0.14, -0.42);
      quad(shoulder, f4, hTrail, root, P.wingDk, 0.10);

      /* layered feather-tuft strokes along the leading edge (feather read vs. a smooth membrane) */
      const rim = [f1,f2,f3,f4];
      for(let i=0;i<rim.length-1;i++){
        const a = rim[i], b = rim[i+1];
        const mid = V((a.x+b.x)/2, (a.y+b.y)/2, (a.z+b.z)/2);
        const tuftTip = V(mid.x + side*0.06, mid.y-0.05, mid.z-0.04);
        quad(a, b, tuftTip, tuftTip, P.plume, 0.09);
      }
    };
    wing(-1); wing(1);
  }

  /* ---------- TAIL — a simple lion tail with a small tuft, low and trailing (not the manticore's spike). ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0.03, spY-0.05, -0.68);
    const t2 = V(0.08, spY-0.09, -0.88);
    const t3 = V(0.12, spY-0.08, -1.02);
    tube(t0, t1, 0.075, 0.052, 6, P.hide,    {phase:Math.PI/6, capA:{hex:P.hideDk}});
    tube(t1, t2, 0.052, 0.032, 6, P.mottleA, {phase:Math.PI/6});
    tube(t2, t3, 0.032, 0.018, 6, P.hideDk,  {phase:Math.PI/6});
    /* tuft at the tip */
    const tuftTip = V(0.14, spY-0.06, -1.10);
    tube(t3, tuftTip, 0.018, 0.028, 5, P.maneDk, {capB:{hex:P.maneDk, lift:0.02}});
  }

  /* ---------- base disc (matches the task's discR=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
