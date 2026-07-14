/* dev/model-qa/creatures/mon-icemephit.js — the ICE MEPHIT (REBUILD, MODEL-FOUNDRY pass).
   Bestiary: Small Elemental, CR 1/2, realm core — the spiteful little ice-imp stand-in for the whole
   elemental-imp family. Palette intent PRESERVED from the prior build: glacial blue-white body, deep
   teal recesses, bright frost-rime highlights ("glow" channel) carrying the value contrast.

   FEATURE CHECKLIST (the ~1.1-1.6k budget buys):
   1. Crystalline pot-belly torso — faceted (hex-loft, sharp bands, no smoothing) ice-glass body.
   2. Grinning fanged imp head, two swept ice horns, brow ridge.
   3. SIGNATURE — translucent-read faceted ICE-SHARD SPIKES erupting off both shoulders + the spine,
      bright/faceted, the loudest high-value zone on the model (the family "one exaggerated feature").
   4. STRUT wings (bone-chain: shoulder→forearm→2 finger struts, membrane hung between — never a flat
      panel), held mid-beat, asymmetric (one up-stroke, one down-stroke) to sell motion.
   5. One clawed hand FLINGING an ice shard forward (the taunt gesture) — the pose's verb.
   6. Spindly clawed legs tucked/trailing under a low hover (~0.2u), thin barbed ice tail.

   POSE SENTENCE: mid-hover taunt — wings caught asymmetric mid-beat (one raised, one driving down),
   head cocked in a smirking tilt toward the viewer, off-hand flung forward mid-throw hurling a bright
   ice shard, the other clawed hand cocked back at the hip — a spiteful little imp caught in the act of
   being a nuisance, not standing at attention.

   Whole-object grammar: one exported build fn, probe-lib primitives only, spine +z, ground y=0.
   Small: ~0.95u tall, hovering ~0.2u off the base disc (r=0.32), toes trailing not planted. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildIceMephit(){
  /* ---------- PALETTE (glacial blue-white ice; teal recesses; bright frost-rime edges) ---------- */
  const P = {
    // deepened from the pass-1 draft (was too uniformly pale to leave headroom for the glow —
    // law 3: value contrast or it doesn't exist) — a darker glacial-slate body so the bright
    // frost-rime + shard signature actually reads as the loudest thing on the model.
    ice:0x4c7285, iceDk:0x2e4a58, iceLt:0x7fa6b8,             // deep glacial blue-teal body
    teal:0x27404c, tealDk:0x1a2e38,                            // deep recess / belly shadow
    rime:0xeef9ff,                                             // bright frost-rime highlight ("glow" channel)
    shard:0xcdeeff, shardEdge:0xfaffff, shardDk:0x3f6d80,     // signature ice-shard spikes (glow)
    horn:0x3f5f70, hornTip:0xdcf1f8, claw:0x1c2c34,
    wing:0x3c6072, wingDk:0x27404c, wingMemb:0x5a8698,        // strut wings, membranous ice
    mouth:0x141c22, fang:0xf2fcff,
    disc:0x4a4038, discTop:0x585047,
  };
  // Tag the bright frost-rime + fangs + horn-tips + the signature shard faces on the "glow" channel
  // so the shader renders them bright (the frost-rime / faceted-ice read). Body ice tones stay untagged.
  setChannels({ [P.rime]:"glow", [P.hornTip]:"glow", [P.fang]:"glow", [P.shard]:"glow", [P.shardEdge]:"glow" });

  /* ---------- LANDMARKS — small hunched imp, hovering ~0.2u, smirking head-tilt. ---------- */
  const L = {
    hoverY:0.20,                                              // hover offset — feet trail, never planted
    hipY:0.360, waistY:0.400, bellyY:0.440, chestY:0.500, shldY:0.545, neckY:0.575,
    hipHalf:0.078, shoulderX:0.130,
    jawY:0.600, cheekY:0.660, browY:0.720, crownY:0.795, headTopY:0.850,
  };

  /* ---------- TORSO — crystalline pot-belly loft; sharp faceted bands (no smoothing), tapers thin. */
  stack([
    {y:L.hipY,    rx:0.098, rz:0.086, hex:P.iceDk},
    {y:L.waistY,  rx:0.110, rz:0.096, hex:P.ice},
    {y:L.bellyY,  rx:0.128, rz:0.112, hex:P.ice},    // belly bulge
    {y:L.chestY,  rx:0.110, rz:0.092, hex:P.ice},
    {y:L.shldY,   rx:0.100, rz:0.082, hex:P.iceDk},
    {y:L.neckY,   rx:0.048, rz:0.046, hex:P.iceDk},
  ], 7, {capBot:{hex:P.tealDk, lift:0.006}, capTop:{hex:P.iceDk, lift:0.004}});   // n=7: low-count facets
  /* teal belly-shadow patch on the underside + a couple of bright rime cracks down the chest */
  quad(V(-0.070,L.hipY+0.02,0.088), V(0.070,L.hipY+0.02,0.088), V(0.090,L.bellyY,0.110), V(-0.090,L.bellyY,0.110), P.teal, 0.05);
  for(const s of [-1,1]) quad(V(s*0.02-0.006,L.chestY,0.100), V(s*0.02+0.006,L.chestY,0.100),
                              V(s*0.03+0.004,L.bellyY,0.116), V(s*0.03-0.004,L.bellyY,0.116), P.rime, 0.02);

  /* ---------- HEAD — lean grinning imp skull, cocked/tilted (smirk read), fanged mouth, two horns. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.066, rz:0.074, hex:P.ice},
      {y:L.cheekY, rx:0.098, rz:0.098, hex:P.ice},
      {y:L.browY,  rx:0.104, rz:0.094, hex:P.iceLt},
      {y:L.crownY, rx:0.078, rz:0.068, hex:P.iceDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    // head-tilt: shear the whole head ring stack sideways+forward (a smirking cock of the head) —
    // kept modest so the head stays plainly readable in silhouette, not sheared out of frame.
    for(const r of rings) for(const p of r){ p.x += (p.y-L.jawY)*0.16; p.z += (p.y-L.jawY)*0.03; }
    for(const i of [1,2]) rings[2][i].z += 0.010;          // brow ridge push
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(0.046, L.headTopY, 0.010), P.iceDk);

    /* WIDE FANGED GRIN — a dark grin band across the lower face, canted with the tilt + a fang row.
       Enlarged + pushed further forward (higher z) than the pass-1 draft so it clears the face
       curvature and actually reads at 1/3-res instead of dissolving into the cheek shading. */
    const my=L.jawY+0.016, tiltX=(my-L.jawY)*0.16;
    quad(V(tiltX-0.064,my+0.018,0.096), V(tiltX+0.064,my+0.018,0.096),
         V(tiltX+0.070,my-0.026,0.090), V(tiltX-0.052,my-0.026,0.090), P.mouth, 0.015);   // asymmetric = smirk
    for(let k=-2;k<=2;k++){
      const fx=tiltX+k*0.026;
      quad(V(fx-0.010,my+0.014,0.102), V(fx+0.010,my+0.014,0.102),
           V(fx+0.005,my-0.026,0.100), V(fx-0.005,my-0.026,0.100), P.fang, 0.0);   // upper fangs (glow)
    }

    /* TWO SWEPT HORNS — back-swept curved horns off the crown, rime-tipped. Thicker + shorter than
       the pass-1 draft so they read as two distinct horns, not more spikes lost among the shards. */
    for(const s of [-1,1]){
      const hb = V(s*0.052+0.020, L.crownY-0.006, -0.008);
      const hm = V(s*0.088+0.026, L.crownY+0.048, -0.052);
      const ht = V(s*0.108+0.030, L.crownY+0.082, -0.108);
      tube(hb, hm, 0.026, 0.017, 5, P.horn);
      tube(hm, ht, 0.017, 0.006, 5, P.horn, {capB:{hex:P.hornTip, lift:0.006}});   // rime-tipped (glow)
    }
  }

  /* ---------- SIGNATURE — faceted ICE-SHARD SPIKES off both shoulders + a spine row. Bright/faceted,
     the loudest high-value zone (family exaggerated feature). Each shard = a 4-sided crystal prism:
     a base ring tapering fast to a sharp point, one bright rime-edge quad seam down its face. ---- */
  function iceShard(base, tip, w){
    // a faceted 4-sided crystal prism tapering fast base→point (the tube primitive tapers cleanly).
    tube(base, tip, w, 0.002, 4, P.shard, {phase:0.3, capA:{hex:P.shardDk}, capB:{hex:P.shard}});
    // bright faceted edge seam down one face (the glow read)
    const rBack = ring(base, new THREE.Vector3(tip.x-base.x, tip.y-base.y, tip.z-base.z).normalize(), w, w*0.7, 4, 0.3);
    quad(rBack[0], rBack[1], tip, tip, P.shardEdge, 0.02);
  }
  // R2 CRITIC FIX: v1 anchored these OUT+BACK+DOWN (z going to -0.16/-0.19) off the CHEST — behind the
  // torso's own back surface (torso rz max ~0.112), so from the capture camera the stated "loudest
  // high-value zone" fell almost entirely into self-occlusion/the void and read as nothing (r5: the only
  // visible spikes at the silhouette's crown were the horns, not the shards). Re-anchored at SHOULDER
  // height (proud of the chest, clear of the wing roots) and re-angled OUT+UP+forward — erupting past
  // the shoulder line into open space above the torso silhouette, catching the camera instead of hiding
  // from it — still swept back a little (z going slightly negative) to keep the "quill" read.
  for(const s of [-1,1]){
    const root = V(s*0.100, L.shldY+0.01, 0.01);
    iceShard(root, root.clone().add(V(s*0.16, 0.13, -0.05)), 0.026);
    iceShard(root.clone().add(V(s*0.015,0.015,0.005)), root.clone().add(V(s*0.20, 0.20, -0.08)), 0.018);
  }
  // spine row — 2 smaller shards down the backbone (waist→hip), low profile, angled back+down
  for(const [y,len] of [[L.waistY,0.06],[L.hipY,0.05]]){
    const root = V(0, y, -0.10);
    iceShard(root, root.clone().add(V(0, -len*0.2, -len)), 0.012);
  }

  /* ---------- WINGS — STRUT wings (bone-chain shoulder→forearm→2 finger struts, membrane hung between
     the struts — never a flat panel). Mid-beat ASYMMETRIC: left wing raised (up-stroke), right wing
     driving down (down-stroke) — sells the caught-mid-flight taunt.
     R2 CRITIC FIX: v1 derived both wings from one shoulder-pivot rotation of a chain whose own
     pre-rotation spread was almost all X/Z (dy only ~0.08-0.14u vs dx up to 0.42u) — the same failure
     documented in rlm-gloom-raven.js's wing R2 note: a chain with real reach in only two axes projects
     as ONE thin stick from the capture camera no matter the rotation, and the far wingtip (x=0.42s)
     stretched well past the membrane's own width into a bare antenna line (also under the ~0.04u
     strut-diameter floor: 0.011→0.004 taper = 0.022u→0.008u max). Replaced with two EXPLICITLY
     authored extremes (not one rotated rig) so each wing carries genuine height (Y) spread on its own
     terms: up-stroke reaches well above the shoulder AND swings slightly forward (+z, toward camera,
     out of the torso's shadow); down-stroke drops well below the shoulder toward hip height. Strut
     radii thickened toward the 0.04u floor so the bone-chain reads as a rib, not a hairline. ---------- */
  function wing(s, up){
    const SH = V(s*0.078, L.shldY+0.02, -0.03);
    const EL = up ? V(s*0.18, L.shldY+0.16, 0.00)  : V(s*0.19, L.shldY-0.02, -0.09);
    const WR = up ? V(s*0.24, L.shldY+0.26, 0.04)  : V(s*0.26, L.shldY-0.16, -0.14);
    const F1 = up ? V(s*0.18, L.shldY+0.14, 0.08)  : V(s*0.20, L.shldY-0.04, -0.04);
    const F2 = up ? V(s*0.28, L.shldY+0.32, 0.08)  : V(s*0.30, L.shldY-0.24, -0.18);
    const F3 = up ? V(s*0.13, L.shldY+0.34, -0.02) : V(s*0.15, L.shldY-0.26, -0.08);
    tube(SH, EL, 0.030, 0.022, 5, P.wing, {capA:{hex:P.wingDk}});
    tube(EL, WR, 0.022, 0.015, 5, P.wing);
    // finger struts fanning from the wrist (the bone chain the membrane hangs between) — thickened
    for(const [a,b] of [[WR,F1],[WR,F2],[WR,F3]]) tube(a, b, 0.018, 0.008, 4, P.wingDk, {capB:{hex:P.wingDk}});
    // membrane panels hung BETWEEN the struts (never a single flat sheet — 3 separate scalloped bays)
    quad(EL, WR, F1, EL.clone().lerp(F1,0.5), P.wingMemb, 0.05);
    quad(WR, F2, F1, EL, P.wingMemb, 0.05);
    quad(WR, F3, F2, WR, P.wingMemb, 0.05);
    // a bright rime edge along the leading spar (value contrast on the wing too)
    const SHt = SH.clone().add(V(0,0.02,0.01));
    quad(SH, EL, EL.clone().add(V(0,0.012,0.01)), SHt, P.rime, 0.02);
  }
  wing(-1, true);    // left wing: up-stroke, raised well above the shoulder, swung slightly forward
  wing(1, false);     // right wing: down-stroke, driven down toward hip height

  /* ---------- ARMS — one hand FLUNG FORWARD mid-throw hurling an ice shard (the pose verb), the other
     cocked back at the hip. Spindly, clawed. ---------- */
  const clawHand=(ctr, hex)=>{
    tube(ctr.clone().add(V(0,0.02,-0.02)), ctr.clone().add(V(0,-0.02,0.02)), 0.028, 0.024, 6, hex, {capA:{hex},capB:{hex}});
    for(const off of [-0.6,0,0.6]){
      const kb=ctr.clone().add(V(off*0.020,-0.010,0.020));
      const kt=kb.clone().add(V(off*0.014,-0.030,0.036));
      tube(kb, kt, 0.008, 0.003, 4, hex, {capB:{hex:P.claw, lift:0.003}});
    }
  };
  {
    // THROWING arm (right, s=1): extended forward+up, releasing a shard off the fingertips
    const Ssh=V(0.130, L.shldY-0.005, 0.02);
    const Eel=V(0.220, L.chestY+0.02, 0.16);
    const Hth=V(0.260, L.chestY+0.10, 0.30);       // hand flung forward + up — the throw
    tube(Ssh,Eel,0.026,0.020,6,P.ice);
    tube(Eel,Hth,0.020,0.016,6,P.ice);
    clawHand(Hth, P.iceLt);
    iceShard(Hth.clone().add(V(0.02,0.01,0.02)), Hth.clone().add(V(0.09,0.05,0.16)), 0.020);   // the flung shard

    // cocked-back arm (left, s=-1): drawn back at the hip, claw flexed (the taunt's other half)
    const Ssh2=V(-0.130, L.shldY-0.005, 0.02);
    const Eel2=V(-0.180, L.chestY-0.08, -0.06);
    const Hcb=V(-0.150, L.bellyY-0.02, -0.12);     // hand cocked back behind the hip
    tube(Ssh2,Eel2,0.026,0.020,6,P.ice);
    tube(Eel2,Hcb,0.020,0.016,6,P.ice);
    clawHand(Hcb, P.iceLt);
  }

  /* ---------- LEGS — spindly clawed legs TRAILING under the hover (never planted); tucked, mid-air. */
  {
    const legL=(s)=>{
      const hip=V(s*L.hipHalf, L.hipY-0.01, 0.0);
      const knee=V(s*0.100, L.hoverY+0.150, 0.050);
      const ankle=V(s*0.095, L.hoverY+0.060, 0.010);
      const toe=V(s*0.100, L.hoverY+0.020, 0.060);
      tube(hip, knee, 0.034, 0.026, 6, P.ice);
      tube(knee, ankle, 0.024, 0.018, 6, P.iceDk);
      tube(ankle, toe, 0.020, 0.014, 5, P.iceDk, {capA:{hex:P.iceDk}});
      // 3 clawed toes, curled (not weight-bearing — the hover read)
      const d=V(s*0.10,0,1).normalize();
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=V(toe.x,toe.y,toe.z).addScaledVector(side, off*0.018);
        const tt=tb.clone().addScaledVector(d,0.040).addScaledVector(V(0,-1,0),0.02).addScaledVector(side, off*0.004);
        tube(tb, tt, 0.010, 0.003, 4, P.claw, {capB:{hex:P.claw, lift:0.003}});
      }
    };
    legL(-1); legL(1);
  }

  /* ---------- TAIL — a thin barbed ice tail curling down + back, trailing the hover. ---------- */
  {
    const t0=V(0.0, L.hipY-0.04, -0.10);
    const t1=V(0.04, L.hoverY+0.13, -0.20);
    const t2=V(0.09, L.hoverY+0.06, -0.28);
    const t3=V(0.12, L.hoverY+0.01, -0.30);
    tube(t0, t1, 0.030, 0.022, 6, P.ice, {capA:{hex:P.iceDk}});
    tube(t1, t2, 0.022, 0.014, 6, P.iceDk);
    tube(t2, t3, 0.014, 0.007, 5, P.iceDk, {capB:{hex:P.teal}});
    // a small ice barb at the tip (two little rime spikes)
    for(const s of [-1,1]) tube(t3, t3.clone().add(V(s*0.030, -0.010, -0.030)), 0.008, 0.002, 3, P.iceLt, {capB:{hex:P.rime, lift:0.003}});
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.305, 0.305, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
