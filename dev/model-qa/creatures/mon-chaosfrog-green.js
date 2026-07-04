/* dev/model-qa/creatures/mon-chaosfrog-green.js — the GREEN CHAOS-FROG (bespoke whole-object,
   Large Aberration). CREATURE-MODELS-P2.md Wave 3: "the chaos-frogs (blue/green/gray/red/death —
   one frog base, 5 tints)" — this is the green tint of that base. The read: a bloated squatting
   frog-aberration, bulbous warty body, splayed webbed limbs, a wide toothy maw. SICKLY GREEN
   warty hide, VS-desaturated (dirty/mottled, never candy). NO eye quads — dark socket recesses
   only (house eye ruling). Whole-object grammar: one function, one geometry frame, no anchors.
   Squats LOW and WIDE, rear/rise kept in +y so the silhouette stays inside its r=0.55 disc. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildGreenChaosFrog(){
  /* ---------- PALETTE (VS desaturated; sickly dirty green scale, mottled) ---------- */
  const P = {
    hide:0x51603c, hideDk:0x37411f, hideLt:0x69763f,      // sickly green warty hide
    mottleA:0x435135, mottleB:0x5c6a3a,                    // dorsal mottle patches
    wart:0x2e3a1c,                                         // dark wart bumps
    belly:0x8a8d5e, bellyDk:0x676a44,                       // pale sickly-green underside
    web:0x475233,                                          // webbed foot membrane
    mouth:0x231c17, tooth:0x9a9478, tongue:0x7a3a3a,
    socket:0x161510,                                        // dark eye-socket recess
    claw:0x201a15, disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.hide]:'skin', [P.hideDk]:'skin', [P.hideLt]:'skin',
    [P.mottleA]:'skin', [P.mottleB]:'skin', [P.wart]:'skin',
    [P.belly]:'skin', [P.bellyDk]:'skin', [P.web]:'skin',
    [P.tooth]:'bone', [P.mouth]:'skin', [P.tongue]:'skin',
  });

  /* ---------- LANDMARKS — squatting frog, low wide haunches at back (-z), maw forward (+z). ---------- */
  const gY = 0.09;                        // haunch/belly ride height (squatting low)
  const S = {
    haunchL: V(-0.24, gY+0.02, -0.20),
    haunchR: V( 0.24, gY+0.02, -0.20),
    rump:    V( 0,    gY+0.10, -0.26),
    core:    V( 0,    gY+0.30,  0.00),
    chest:   V( 0,    gY+0.28,  0.20),
    throat:  V( 0,    gY+0.16,  0.34),
  };

  /* ---------- BODY — a bulbous squatting mass; wide flat bands, bulging belly, hunched back. ---------- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:gY-0.02, cz:-0.22, rx:0.320, rz:0.300, hex:P.belly},   // low broad belly base
      {y:gY+0.16, cz:-0.14, rx:0.400, rz:0.360, hex:P.hide},    // widest bulge (bloated gut)
      {y:gY+0.34, cz: 0.00, rx:0.360, rz:0.330, hex:P.mottleA}, // rising back
      {y:gY+0.48, cz: 0.10, rx:0.280, rz:0.260, hex:P.hide},    // shoulder hunch
      {y:gY+0.54, cz: 0.16, rx:0.200, rz:0.190, hex:P.mottleB}, // nape, rising toward head
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0, gY-0.06, -0.22), P.bellyDk, true);   // close underside
  }

  /* ---------- WARTS — scattered raised bumps across the back/flanks (aberrant texture read). ---------- */
  {
    const spots=[
      [-0.22,gY+0.30,-0.06],[0.24,gY+0.28,-0.10],[0.02,gY+0.44,0.02],
      [-0.14,gY+0.40,0.14],[0.18,gY+0.38,0.10],[-0.30,gY+0.14,-0.18],
      [0.30,gY+0.16,-0.16],[0.06,gY+0.20,-0.24],[-0.08,gY+0.50,0.18],
    ];
    for(const [x,y,z] of spots){
      const b=V(x,y,z), t=V(x*1.05,y+0.045,z*1.05+0.01);
      tube(b,t,0.038,0.006,5,P.wart,{capB:{hex:P.wart,lift:0.004}});
    }
  }

  /* ---------- HEAD — wide flat frog skull, dark socket recesses (no eye quads), wide toothy maw. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:gY+0.50, cz:0.30, rx:0.230, rz:0.240, hex:P.hide},     // broad jowl base
      {y:gY+0.58, cz:0.34, rx:0.250, rz:0.250, hex:P.hideLt},   // widest cranium (frog head is flat+wide)
      {y:gY+0.62, cz:0.30, rx:0.210, rz:0.220, hex:P.mottleA},  // flat crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, gY+0.66, 0.28), P.hideLt);

    /* dark eye-socket recesses on the top of the cranium (frog eyes ride high, but recessed not bulged) */
    for(const s of [-1,1]){
      const cb = V(s*0.13, gY+0.60, 0.36);
      const ct = V(s*0.13, gY+0.545, 0.36);
      tube(cb, ct, 0.052, 0.044, 6, P.socket, {capB:{hex:P.socket, lift:0.0}});
    }

    /* WIDE MAW — a broad toothy mouth line across the front of the head, slightly open. */
    const mwL = V(-0.230, gY+0.44, 0.44), mwR = V(0.230, gY+0.44, 0.44);
    const mwLb= V(-0.190, gY+0.32, 0.46), mwRb= V(0.190, gY+0.32, 0.46);
    quad(mwL, mwR, mwRb, mwLb, P.mouth, 0.03);
    /* small ragged teeth along the top jaw line */
    for(let i=-3;i<=3;i++){
      const x = i*0.055;
      const tb = V(x, gY+0.435, 0.445);
      const tt = V(x, gY+0.395, 0.45);
      tube(tb, tt, 0.016, 0.003, 4, P.tooth, {capB:{hex:P.tooth, lift:0.003}});
    }
    /* tongue lolling slightly from the maw */
    const tgB = V(0, gY+0.34, 0.45), tgT = V(0.02, gY+0.28, 0.55);
    tube(tgB, tgT, 0.05, 0.03, 5, P.tongue, {capB:{hex:P.tongue, lift:0.01}});
    /* pale sickly throat sac under the jaw */
    quad(V(-0.14,gY+0.30,0.40), V(0.14,gY+0.30,0.40), V(0.10,gY+0.20,0.46), V(-0.10,gY+0.20,0.46), P.belly, 0.05);
  }

  /* ---------- LIMBS — splayed webbed frog legs: thick haunches out to the sides, webbed feet
     planted wide, small forelimbs propping the front of the bulk. ---------- */
  {
    const webFoot=(root, footX, footZ, big)=>{
      const knee = V(root.x + Math.sign(root.x||1)*0.16*(big?1.3:1), gY+0.02, root.z + (footZ>root.z?0.10:-0.10));
      const foot = V(footX, 0.02, footZ);
      tube(root, knee, big?0.150:0.075, big?0.110:0.052, 7, P.hide, {phase:Math.PI/7});
      tube(knee, foot, big?0.100:0.050, big?0.070:0.034, 6, P.mottleA, {capB:{hex:P.web, lift:0.006}});
      // webbed splayed toes (flat membrane wedges)
      const side = Math.sign(foot.x||1);
      const toeSpread = big? [[side*0.10,0.05],[side*0.05,0.10],[-side*0.02,0.115],[-side*0.08,0.09]]
                            : [[side*0.06,0.03],[side*0.03,0.06],[-side*0.02,0.065],[-side*0.05,0.05]];
      for(const [dx,dz] of toeSpread){
        const p0=V(foot.x, 0.014, foot.z);
        const p1=V(foot.x+dx*0.4, 0.010, foot.z+dz*0.4);
        const p2=V(foot.x+dx, 0.008, foot.z+dz);
        quad(p0, p1, p2, p0, P.web, 0.05);
      }
    };
    // rear haunches — big, splayed wide + back (frog power legs)
    webFoot(S.haunchL, -0.50, -0.42, true);
    webFoot(S.haunchR,  0.50, -0.42, true);
    // front limbs — small, propping forward, splayed less
    webFoot(V(-0.20, gY+0.16, 0.18), -0.32, 0.34, false);
    webFoot(V( 0.20, gY+0.16, 0.18),  0.32, 0.34, false);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
