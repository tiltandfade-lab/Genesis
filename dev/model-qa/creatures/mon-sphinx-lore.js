/* dev/model-qa/creatures/mon-sphinx-lore.js — the SPHINX OF LORE (bespoke WINGED QUADRUPED, Large).
   docs/CREATURE-MODELS-P2.md Wave 5: lifts the manticore's winged-quadruped base. Read: a lion-
   bodied quadruped with large feathered wings rising off the shoulders, and a regal HUMAN/pharaonic
   FACE — a calm scholarly bearing, a striped headdress (nemes) framing the visage rather than a
   snarling lion muzzle. Tan lion hide (VS desaturated), tawny feathered wings, dark socket recesses
   (no eye quads, house ruling). Whole-object grammar: one function, one geometry frame, no anchors.
   Large size: base disc r=0.55. Imported by the p2mon proof-sheet set + WHOLE_OBJECT_REGISTRY. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildSphinxOfLore(){
  /* ---------- PALETTE (VS desaturated; tan lion hide, tawny feathered wings, pharaonic headdress) ---------- */
  const P = {
    hide:0x8c7a58, hideDk:0x6d5e42, hideLt:0xa3906a,          // tan lion hide
    mottleA:0x7e6d4c, mottleB:0x998661,                        // dorsal mottle bands
    face:0x9a8a68, faceDk:0x6f6247, faceLt:0xb0a07a,
    mouth:0x2c241a, socket:0x1c1712,
    headdress:0x8a6f42, headdressDk:0x5e4b2c, headdressStripe:0xc7ab6e, // gold/tan nemes headdress
    wing:0x8f7f52, wingDk:0x6a5c3c, wingLt:0xab9868,          // tawny feathered wing
    wingBone:0x584835,
    claw:0x241d16,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.hide]:'fur', [P.hideDk]:'fur', [P.hideLt]:'fur', [P.mottleA]:'fur', [P.mottleB]:'fur',
    [P.face]:'skin', [P.faceDk]:'skin', [P.faceLt]:'skin',
    [P.headdress]:'cloth', [P.headdressDk]:'cloth', [P.headdressStripe]:'cloth',
    [P.wing]:'fur', [P.wingDk]:'fur', [P.wingLt]:'fur', [P.wingBone]:'bone',
    [P.claw]:'bone',
  });

  /* ---------- LANDMARKS — spine along +z, lion stance (lifted from manticore base). ---------- */
  const spY = 0.50;
  const S = {
    tailBase: V(0, spY+0.04, -0.50),
    rump:     V(0, spY+0.06, -0.32),
    loin:     V(0, spY+0.08, -0.10),
    mid:      V(0, spY+0.07,  0.10),
    shldr:    V(0, spY+0.04,  0.30),
    neck:     V(0, spY+0.06,  0.44),
    headB:    V(0, spY+0.10,  0.54),           // held UPRIGHT + regal, not lowered like a hunting cat
  };

  /* ---------- BODY — one horizontal loft; a lean lion barrel. ---------- */
  tube(S.rump,  S.loin,  0.240, 0.270, 9, P.hide,    {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.270, 0.278, 9, P.mottleA, {phase:Math.PI/9});
  tube(S.mid,   S.shldr, 0.278, 0.250, 9, P.hide,    {phase:Math.PI/9});
  tube(S.shldr, S.neck,  0.250, 0.175, 9, P.mottleB, {phase:Math.PI/9});
  tube(S.neck,  S.headB, 0.175, 0.150, 9, P.hideDk,  {phase:Math.PI/9});

  /* pale-ish belly strip low on the flanks */
  {
    const by = spY-0.19;
    quad(V(-0.18,by,-0.26), V(0.18,by,-0.26), V(0.15,by+0.02,0.28), V(-0.15,by+0.02,0.28), P.hideLt, 0.05);
  }

  /* ---------- HEAD — regal HUMAN/pharaonic face: calm scholarly bearing, broad flat brow,
     dark socket recesses (no eye quads), a striped nemes headdress framing the visage. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.02, cz:0.56, rx:0.135, rz:0.140, hex:P.face},     // jaw/cheek (human, calm)
      {y:spY+0.05, cz:0.58, rx:0.150, rz:0.150, hex:P.face},     // broad cheekbone
      {y:spY+0.13, cz:0.56, rx:0.140, rz:0.120, hex:P.faceLt},   // brow/forehead (serene, not furrowed)
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.19, 0.56), P.faceLt);

    /* dark socket recesses — shape, not painted eyes */
    for(const s of [-1,1]){
      quad(V(s*0.075,spY+0.075,0.685), V(s*0.045,spY+0.070,0.695), V(s*0.045,spY+0.045,0.690), V(s*0.075,spY+0.050,0.680), P.socket, 0.0);
    }

    /* small human nose, straight bridge (no lion snout) */
    const nb = V(0, spY+0.03, 0.68);
    const nt = V(0, spY-0.01, 0.715);
    tube(nb, nt, 0.030, 0.018, 5, P.face, {raz:0.020, rbz:0.012, capB:{hex:P.faceDk, lift:0.004}});

    /* calm closed mouth — a thin dark line, scholarly not snarling */
    quad(V(-0.055,spY-0.075,0.665), V(0.055,spY-0.075,0.665), V(0.045,spY-0.078,0.70), V(-0.045,spY-0.078,0.70), P.mouth, 0.03);

    /* ---- NEMES HEADDRESS — striped cloth framing the face, flaring past the shoulders, with a
       central band rising over the crown. This is the pharaonic read that distinguishes the sphinx
       from the manticore's snarling lion face. ---- */
    {
      // crown band rising above the brow
      const cb0 = V(0, spY+0.21, 0.50);
      const cb1 = V(0, spY+0.34, 0.44);
      tube(cb0, cb1, 0.145, 0.100, 8, P.headdress, {raz:0.11, rbz:0.08, capB:{hex:P.headdressDk, lift:0.01}});
      // striped bands on the crown
      for(const t of [0.10,0.20,0.30]){
        const y = spY+0.22+t*0.5;
        quad(V(-0.10,y,0.47), V(0.10,y,0.47), V(0.09,y+0.02,0.45), V(-0.09,y+0.02,0.45), P.headdressStripe, 0.05);
      }
      // wing-lappets — the flaring cloth panels that fall past the shoulders/cheeks, wide at the base
      for(const s of [-1,1]){
        const top = V(s*0.13, spY+0.16, 0.52);
        const midOut = V(s*0.30, spY-0.04, 0.44);
        const botOut = V(s*0.34, spY-0.24, 0.34);
        const botIn  = V(s*0.14, spY-0.22, 0.36);
        quad(top, midOut, botOut, botIn, P.headdress, 0.06);
        // striping on the lappet
        quad(V(s*0.20,spY+0.02,0.48), V(s*0.28,spY-0.04,0.42), V(s*0.30,spY-0.10,0.40), V(s*0.22,spY-0.05,0.46), P.headdressStripe, 0.04);
      }
      // small ceremonial beard-line under the chin (pharaonic sphinx signature, subtle)
      const bd0 = V(0, spY-0.09, 0.66);
      const bd1 = V(0, spY-0.22, 0.62);
      tube(bd0, bd1, 0.028, 0.012, 4, P.headdressDk, {capB:{hex:P.headdressDk, lift:0.004}});
    }
  }

  /* ---------- LEGS — lion stance: upper leg drops mostly straight down/slightly out, paw feet. ---------- */
  {
    const leg=(shoulder, footX, footZ, hex)=>{
      const kneeX = shoulder.x + Math.sign(shoulder.x)*0.055;
      const knee = V(kneeX, 0.25, shoulder.z + (footZ>shoulder.z?0.02:-0.02));
      const foot = V(footX, 0.070, footZ);
      tube(shoulder, knee, 0.100, 0.072, 7, hex);
      tube(knee, foot, 0.072, 0.054, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
      const pad = V(foot.x, 0.042, foot.z+0.03);
      for(const dx of [-0.045,-0.015,0.015,0.045]){
        const cb = V(pad.x+dx, 0.046, pad.z);
        const ct = V(pad.x+dx, 0.011, pad.z+0.045);
        tube(cb, ct, 0.014, 0.005, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    leg(V(-0.180, spY-0.03, 0.28),  -0.26, 0.34, P.hide);
    leg(V( 0.180, spY-0.03, 0.28),   0.26, 0.34, P.hide);
    leg(V(-0.195, spY-0.01, -0.30), -0.28, -0.38, P.hide);
    leg(V( 0.195, spY-0.01, -0.30),  0.28, -0.38, P.hide);
  }

  /* ---------- WINGS — large FEATHERED wings rising off the shoulders, half-spread; lifted from
     the manticore's spar/membrane base but re-skinned as layered feather bands (tawny, VS-desat)
     rather than dark bat membrane. Kept inside the disc footprint — rise in +y, not far in +z/-z. ---------- */
  {
    const wing=(side)=>{
      const root = V(side*0.15, spY+0.18, 0.18);
      const f1 = V(side*0.50, spY+0.74, -0.02);
      const f2 = V(side*0.74, spY+0.62, -0.18);
      const f3 = V(side*0.82, spY+0.44, -0.34);
      const f4 = V(side*0.68, spY+0.24, -0.44);

      const shoulder = V(side*0.27, spY+0.30, 0.08);
      tube(root, shoulder, 0.050, 0.038, 5, P.wingBone);
      tube(shoulder, f1, 0.038, 0.013, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.005}});
      tube(shoulder, f2, 0.036, 0.012, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.005}});
      tube(shoulder, f3, 0.032, 0.011, 5, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});
      tube(shoulder, f4, 0.028, 0.010, 4, P.wingBone, {capB:{hex:P.wingBone, lift:0.004}});

      // feathered membrane panels, layered light/dark tawny to read as plumage rather than a bat sail
      quad(shoulder, f1, f2, shoulder, P.wing, 0.10);
      quad(shoulder, f2, f3, shoulder, P.wingLt, 0.10);
      quad(shoulder, f3, f4, shoulder, P.wing, 0.10);
      const hTrail = V(side*0.36, spY+0.14, -0.38);
      quad(shoulder, f4, hTrail, root, P.wingDk, 0.10);

      // feather-tip notches along the leading edge (softer scallop than the manticore's bat wing)
      const rim = [f1,f2,f3,f4];
      for(let i=0;i<rim.length-1;i++){
        const a = rim[i], b = rim[i+1];
        const dip = V((a.x+b.x)/2, (a.y+b.y)/2 - 0.05, (a.z+b.z)/2);
        quad(a, b, dip, dip, P.wingLt, 0.07);
      }
    };
    wing(-1); wing(1);
  }

  /* ---------- TAIL — simple lion tail, low sweep back, tufted tip; kept modest so the wings +
     headdress read as the silhouette's signature (not competing with a scorpion arc). ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0.04, spY-0.02, -0.68);
    const t2 = V(0.10, spY-0.06, -0.88);
    const t3 = V(0.16, spY-0.02, -1.02);
    const tip= V(0.20, spY+0.02, -1.10);
    tube(t0, t1, 0.075, 0.052, 7, P.hide,    {phase:Math.PI/7, capA:{hex:P.hideDk}});
    tube(t1, t2, 0.052, 0.034, 7, P.mottleA, {phase:Math.PI/7});
    tube(t2, t3, 0.034, 0.020, 7, P.hide,    {phase:Math.PI/7});
    // tuft at the tip
    tube(t3, tip, 0.020, 0.008, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.01}});
    for(const s of [-0.02,0,0.02]){
      const tb = V(tip.x+s, tip.y, tip.z);
      const tt = V(tip.x+s*1.6, tip.y+0.02, tip.z-0.05);
      tube(tb, tt, 0.010, 0.003, 4, P.hideDk, {capB:{hex:P.hideDk, lift:0.003}});
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
