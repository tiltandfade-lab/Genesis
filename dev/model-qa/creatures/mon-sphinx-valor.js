/* dev/model-qa/creatures/mon-sphinx-valor.js — the SPHINX OF VALOR (bespoke WINGED QUADRUPED, Large Celestial).
   docs/CREATURE-MODELS-P2.md Wave 5: winged-quadruped base (lifted from mon-manticore.js) — a
   regal lion-bodied sphinx with feathered wings (not bat membrane) and a proud human-ish face, a
   BRIGHT martial/gold bearing (Valor = the militant sphinx). Gold-tan hide (VS desaturated but
   bright relative to the other beast-hides), pale-gold feathered wings fanned up/back. NO eye
   quads (house ruling). Whole-object grammar: one function, one geometry frame, no anchors.
   Large size: base disc r=0.55. Imported by the p2mon proof-sheet set + WHOLE_OBJECT_REGISTRY. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildSphinxOfValor(){
  /* ---------- PALETTE (VS desaturated but BRIGHT gold-tan hide; pale-gold feathered wings) ---------- */
  const P = {
    hide:0xa08850, hideDk:0x7e6a3c, hideLt:0xb89e63,          // gold-tan lion hide, bright register
    mottleA:0x917a46, mottleB:0xab9258,                        // dorsal mottle bands
    mane:0x7c6738, maneDk:0x584a27,                            // regal mane/ruff, gold-dark
    face:0xb49b64, faceDk:0x836e3e,                            // proud human-ish visage
    mouth:0x2c2016, tooth:0xd8caa0,
    plume:0xd9c688, plumeDk:0xb39d5c, plumeLt:0xe8dba8,        // pale-gold feathered wing plumage
    quill:0x6d5c34,                                            // wing quill/strut
    gold:0xc7a54a, goldDk:0x977f36,                            // martial gold trim (collar/bands)
    claw:0x2a2216,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.hide]:'fur', [P.hideDk]:'fur', [P.hideLt]:'fur', [P.mottleA]:'fur', [P.mottleB]:'fur',
    [P.mane]:'fur', [P.maneDk]:'fur', [P.face]:'skin', [P.faceDk]:'skin',
    [P.plume]:'feather', [P.plumeDk]:'feather', [P.plumeLt]:'feather', [P.quill]:'bone',
    [P.gold]:'metal', [P.goldDk]:'metal', [P.claw]:'bone',
  });

  /* ---------- LANDMARKS — spine along +z, proud lion-sphinx stance, held higher than a manticore. ---------- */
  const spY = 0.54;
  const S = {
    tailBase: V(0, spY+0.05, -0.50),
    rump:     V(0, spY+0.07, -0.32),
    loin:     V(0, spY+0.08, -0.10),
    mid:      V(0, spY+0.07,  0.12),
    shldr:    V(0, spY+0.04,  0.32),
    neck:     V(0, spY+0.04,  0.48),
    headB:    V(0, spY+0.03,  0.60),
  };

  /* ---------- BODY — one horizontal loft; a proud lion barrel, held erect (not crouched). ---------- */
  tube(S.rump,  S.loin,  0.250, 0.280, 9, P.hide,    {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.280, 0.290, 9, P.mottleA, {phase:Math.PI/9});
  tube(S.mid,   S.shldr, 0.290, 0.255, 9, P.hide,    {phase:Math.PI/9});
  tube(S.shldr, S.neck,  0.255, 0.190, 9, P.mottleB, {phase:Math.PI/9});
  tube(S.neck,  S.headB, 0.190, 0.160, 9, P.hideDk,  {phase:Math.PI/9});

  /* pale-gold belly strip low on the flanks */
  {
    const by = spY-0.19;
    quad(V(-0.19,by,-0.26), V(0.19,by,-0.26), V(0.16,by+0.02,0.30), V(-0.16,by+0.02,0.30), P.hideLt, 0.05);
  }

  /* regal mane/ruff around the neck, gold-dark, framing a proud face */
  {
    const seg = [[-0.32,spY+0.30],[-0.12,spY+0.35],[0.10,spY+0.37],[0.28,spY+0.31]];
    for(let i=0;i<seg.length-1;i++){
      const [z0,y0]=seg[i], [z1,y1]=seg[i+1];
      quad(V(-0.19,y0-0.10,z0), V(0.19,y0-0.10,z0), V(0.16,y1-0.06,z1), V(-0.16,y1-0.06,z1), P.mane, 0.06);
    }
    /* martial gold collar-band at the base of the mane (Valor trim) */
    quad(V(-0.17,spY+0.15,0.34), V(0.17,spY+0.15,0.34), V(0.15,spY+0.19,0.40), V(-0.15,spY+0.19,0.40), P.gold, 0.03);
  }

  /* ---------- HEAD — a proud human-ish visage: broad brow, calm regal face, no snarl. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.045, cz:0.60, rx:0.145, rz:0.150, hex:P.face},    // jaw/cheek
      {y:spY+0.020, cz:0.62, rx:0.172, rz:0.162, hex:P.face},    // broad cranium (human read)
      {y:spY+0.078, cz:0.60, rx:0.135, rz:0.120, hex:P.faceDk},  // brow
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.12, 0.60), P.maneDk);

    /* short, dignified nose-bridge/muzzle — flatter than a manticore's snarl, calm-set */
    const snB = V(0, spY-0.05, 0.60);
    const snM = V(0, spY-0.062, 0.68);
    const snT = V(0, spY-0.070, 0.74);
    tube(snB, snM, 0.130, 0.095, n, P.face, {raz:0.105, rbz:0.072, phase:ph});
    tube(snM, snT, 0.095, 0.058, n, P.faceDk, {raz:0.072, rbz:0.044, phase:ph, capB:{hex:P.faceDk, lift:0.007}});

    /* closed, composed mouth line (no bared teeth — this face is regal, not snarling) */
    quad(V(-0.085,spY-0.105,0.62), V(0.085,spY-0.105,0.62), V(0.050,spY-0.108,0.735), V(-0.050,spY-0.108,0.735), P.mouth, 0.03);

    /* smooth brow, composed (not furrowed) */
    quad(V(-0.095,spY+0.088,0.58), V(0.095,spY+0.088,0.58), V(0.085,spY+0.100,0.66), V(-0.085,spY+0.100,0.66), P.faceDk, 0.03);

    /* a small gold circlet across the brow (martial/regal signal) */
    quad(V(-0.10,spY+0.105,0.585), V(0.10,spY+0.105,0.585), V(0.09,spY+0.118,0.63), V(-0.09,spY+0.118,0.63), P.gold, 0.03);

    /* small rounded human-ish ears, set high */
    for(const s of [-1,1]){
      const eb = V(s*0.150, spY+0.095, 0.55);
      const et = V(s*0.178, spY+0.185, 0.53);
      tube(eb, et, 0.042, 0.016, 5, P.faceDk, {capB:{hex:P.faceDk, lift:0.005}});
    }
  }

  /* ---------- LEGS — lion stance: upper leg drops mostly straight down/slightly out, paw feet. ---------- */
  {
    const leg=(shoulder, footX, footZ, hex)=>{
      const kneeX = shoulder.x + Math.sign(shoulder.x)*0.06;
      const knee = V(kneeX, 0.26, shoulder.z + (footZ>shoulder.z?0.02:-0.02));
      const foot = V(footX, 0.075, footZ);
      tube(shoulder, knee, 0.105, 0.075, 7, hex);
      tube(knee, foot, 0.075, 0.056, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
      const pad = V(foot.x, 0.045, foot.z+0.03);
      for(const dx of [-0.05,-0.017,0.017,0.05]){
        const cb = V(pad.x+dx, 0.05, pad.z);
        const ct = V(pad.x+dx, 0.012, pad.z+0.05);
        tube(cb, ct, 0.015, 0.006, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    leg(V(-0.190, spY-0.03, 0.30), -0.27, 0.35, P.hide);
    leg(V( 0.190, spY-0.03, 0.30),  0.27, 0.35, P.hide);
    leg(V(-0.205, spY-0.01, -0.32), -0.29, -0.38, P.hide);
    leg(V( 0.205, spY-0.01, -0.32),  0.29, -0.38, P.hide);
  }

  /* ---------- WINGS — feathered (not bat-membrane) wings fanned up/back off the shoulders,
     built as overlapping quill+feather quads instead of membrane sails, staying within the disc
     footprint by rising in +y rather than sprawling far past r=0.55 laterally. ---------- */
  {
    const wing=(side)=>{
      const root = V(side*0.16, spY+0.20, 0.18);
      const shoulder = V(side*0.26, spY+0.32, 0.08);
      // primary quill spars fanning from the shoulder, rising up and slightly back
      const f1 = V(side*0.34, spY+0.78, -0.06);
      const f2 = V(side*0.42, spY+0.64, -0.24);
      const f3 = V(side*0.40, spY+0.46, -0.40);
      const f4 = V(side*0.32, spY+0.30, -0.48);
      tube(root, shoulder, 0.050, 0.038, 5, P.quill);
      tube(shoulder, f1, 0.036, 0.010, 5, P.quill, {capB:{hex:P.quill, lift:0.004}});
      tube(shoulder, f2, 0.033, 0.010, 5, P.quill, {capB:{hex:P.quill, lift:0.004}});
      tube(shoulder, f3, 0.030, 0.009, 5, P.quill, {capB:{hex:P.quill, lift:0.004}});
      tube(shoulder, f4, 0.026, 0.008, 4, P.quill, {capB:{hex:P.quill, lift:0.003}});
      // layered feather panels between spars — pale-gold plumage, alternating tone bands
      quad(shoulder, f1, f2, shoulder, P.plumeLt, 0.09);
      quad(shoulder, f2, f3, shoulder, P.plume, 0.09);
      quad(shoulder, f3, f4, shoulder, P.plumeDk, 0.09);
      const trail = V(side*0.20, spY+0.14, -0.40);
      quad(shoulder, f4, trail, root, P.plumeDk, 0.09);
      // scalloped feather-tip notches along the leading rim (f1..f4), a row of small overlapping tips
      const rim = [f1,f2,f3,f4];
      for(let i=0;i<rim.length-1;i++){
        const a = rim[i], b = rim[i+1];
        const tip = V((a.x+b.x)/2, (a.y+b.y)/2 - 0.05, (a.z+b.z)/2 - 0.02);
        quad(a, b, tip, tip, P.plumeLt, 0.08);
      }
    };
    wing(-1); wing(1);
  }

  /* ---------- TAIL — a lion tail with a small tufted tip, kept short so it stays over the disc. ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0, spY-0.06, -0.66);
    const t2 = V(0.05, spY-0.08, -0.78);
    const tip= V(0.08, spY-0.06, -0.86);
    tube(t0, t1, 0.085, 0.052, 7, P.hide,    {phase:Math.PI/7, capA:{hex:P.hideDk}});
    tube(t1, t2, 0.052, 0.030, 7, P.mottleA, {phase:Math.PI/7});
    tube(t2, tip,0.030, 0.014, 6, P.mottleB, {phase:Math.PI/6, capB:{hex:P.maneDk, lift:0.02}});
    /* small tuft at the tip */
    quad(V(-0.03,spY-0.05,-0.84), V(0.03,spY-0.05,-0.84), V(0.02,spY+0.03,-0.90), V(-0.02,spY+0.03,-0.90), P.maneDk, 0.06);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
