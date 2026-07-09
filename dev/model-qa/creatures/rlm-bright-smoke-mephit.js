/* dev/model-qa/creatures/rlm-bright-smoke-mephit.js — the SMOKE MEPHIT (MODEL-FOUNDRY pass).
   Bestiary: Small Elemental, CR 1/2, realm bright-kingdom — the ash-grey imp-elemental trailing
   smoke, completing the mephit pair with the ice mephit (mon-icemephit.js — SAME chassis family:
   crystalline-imp torso/head/wing/leg/tail grammar, swapped for a soft-edged sooty-smoke build).
   Bright-kingdom skin: razor-confetti carnival garnish stays SECONDARY — the core smoke-imp
   identity leads (ash-grey soot body, ember mouth/eyes, trailing wisps).

   FEATURE CHECKLIST (the ~1.1-1.7k budget buys):
   1. Soft-edged dark-grey soot pot-belly torso (rounder/softer silhouette than the ice mephit's
      hard facets — smoke reads soft, ice reads sharp; same stack-loft grammar, different profile).
   2. Grinning imp head with an EMBER MOUTH — the high-value glow the smoke needs to not vanish
      into a dark-on-dark body (law 3): a bright orange-red slot mouth + two ember-glow eyes.
   3. SIGNATURE — SMOKE-PUFF HANDS: both clawed hands squeezing a bright ember-orange smoke puff
      out between them at chest height (the choking-taunt verb) + a curling wisp trail beneath the
      hover, each wisp a soft low-poly ribbon (not a hard shard like the ice mephit's spikes).
   4. STRUT wings (bone-chain shoulder->forearm->2 finger struts, membrane hung between) — asymmetric
      mid-beat backflip read (one wing driving up, one trailing down+back).
   5. Two small back-swept soot horns, a thin soot tail trailing a wisp curl.
   6. Spindly clawed legs tucked/trailing under a low hover — never planted (elemental float).

   POSE SENTENCE: the choking taunt, caught mid-hover BACKFLIP — torso arched back and twisted, head
   thrown back grinning at the viewer upside-down-ish, both arms drawn in front of the chest with
   clawed hands squeezing a smoke puff out between them, the wisp trail curling below and behind as
   the flip carries it over. Not a static float — the spine arches through the flip, shoulders and
   hips counter-rotate against it.

   SPINE-GESTURE SENTENCE: one continuous backward C-curve from hip through chest to the thrown-back
   skull (a mid-backflip arch), shoulders riding up and back with the head, hips countering forward
   and down so the curve reads as one sweeping arc rather than a stiff lean.

   Whole-object grammar: one exported build fn, probe-lib primitives only, spine +z, ground y=0.
   Small: ~0.95u tall, hovering ~0.20u off the base disc (r=0.32), toes trailing not planted. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildSmokeMephit(){
  /* ---------- PALETTE (ash-grey soot body; deep charcoal recesses; ember-orange glow signature) --- */
  const P = {
    soot:0x4a4a4e, sootDk:0x2c2c30, sootLt:0x63636a,           // soft ash-grey soot body
    char:0x232326, charDk:0x161618,                             // deep charcoal recess / belly shadow
    ember:0xff8a2a, emberHot:0xffe0a0, emberDk:0xb84a10,        // signature ember glow (mouth/eyes/puff)
    smoke:0x7a7a82, smokeLt:0x9c9ca4, smokeSoft:0x58585e,       // soft wisp-ribbon smoke tones
    horn:0x3a3a3e, hornTip:0x59595f, claw:0x18181a,
    wing:0x3f3f44, wingDk:0x28282c, wingMemb:0x55555c,          // strut wings, sooty membrane
    disc:0x4a4038, discTop:0x585047,
    // bright-kingdom carnival garnish — a thin razor-confetti fleck seam, SECONDARY to core identity
    confetti:0xffcf3d,
  };
  // Tag the ember mouth/eyes/puff/wisp-hot-core + horn tips on the "glow" channel — law 3 value
  // contrast on an otherwise dark-on-dark body; the confetti garnish gets a light glow lick too.
  setChannels({ [P.ember]:"glow", [P.emberHot]:"glow", [P.hornTip]:"glow", [P.confetti]:"glow" });

  /* ---------- LANDMARKS — small imp, hovering ~0.20u, backflip arch: hips forward, chest/skull back. */
  const L = {
    hoverY:0.20,
    hipY:0.360, waistY:0.400, bellyY:0.440, chestY:0.500, shldY:0.545, neckY:0.575,
    hipHalf:0.078, shoulderX:0.130,
    jawY:0.600, cheekY:0.660, browY:0.720, crownY:0.795, headTopY:0.850,
  };
  // Backflip arch offsets (the spine C-curve): hips push slightly forward+down, chest/shoulders/head
  // sweep back+up — applied as z/x shears per band so the WHOLE torso+head stack reads as one arc.
  // R1 CRITIC FIX: v1 used a steep 0.62 backward-z coefficient, throwing the head/face fully behind
  // the torso and out of camera view (the dimetric rig sits at +x/+y/+z looking toward the origin —
  // pushing the face to -z buries it in self-occlusion/shadow, killing law 3 entirely: r1 rendered
  // with ZERO visible ember). Softened to a lean the camera can still see into, and the ember features
  // below get an extra forward (+z) push past the torso's own front surface to clear occlusion.
  const archZ = (y)=> -Math.max(0, (y - L.hipY)) * 0.28;   // more negative (back) the higher up the spine
  const archX = (y)=>  Math.max(0, (y - L.hipY)) * 0.10;   // slight lateral carry with the twist

  /* ---------- TORSO — soft-edged soot pot-belly loft; ROUNDER bands (n=8, no sharp facets — smoke
     reads soft where the ice mephit read faceted). Sheared back along the arch per band. */
  const tBands = [
    {y:L.hipY,    rx:0.100, rz:0.090, hex:P.sootDk},
    {y:L.waistY,  rx:0.112, rz:0.100, hex:P.soot},
    {y:L.bellyY,  rx:0.132, rz:0.118, hex:P.soot},    // belly bulge
    {y:L.chestY,  rx:0.114, rz:0.096, hex:P.soot},
    {y:L.shldY,   rx:0.102, rz:0.086, hex:P.sootDk},
    {y:L.neckY,   rx:0.050, rz:0.048, hex:P.sootDk},
  ];
  {
    const n=8, ph=Math.PI/n;
    const rings = tBands.map(b=>{
      const r = ring(V(archX(b.y), b.y, archZ(b.y)), V(0,1,0), b.rx, b.rz, n, ph);
      return r;
    });
    stitch(rings, i=>tBands[i].hex);
    capFan(rings[0], V(archX(L.hipY)-0.01, L.hipY-0.03, archZ(L.hipY)+0.02), P.charDk, true);
    capFan(rings[rings.length-1], V(archX(L.neckY), L.neckY+0.014, archZ(L.neckY)), P.sootDk);
  }
  /* charcoal belly-shadow patch on the underside (dark recess, law 3 contrast partner to the ember) */
  {
    // R2 CRITIC FIX: every hand-authored quad() below was wound CLOCKWISE-from-camera (the dimetric
    // rig sits at +x/+y/+z looking toward the origin) — three.js FrontSide culls a CW-facing quad,
    // so r1's whole ember signature (mouth/eyes/puff/wisps) built clean geometry that was 100%
    // invisible (proved with a giant test quad at r2: CW = invisible, CCW-from-camera = visible).
    // Every quad(a,b,c,d) below is now ordered a=top/near-left, b=bottom/far-left, c=bottom/far-right,
    // d=top/near-right (TL,BL,BR,TR) so the winding is CCW as the dimetric camera sees it.
    const bz = archZ(L.hipY+0.02), bz2 = archZ(L.bellyY);
    quad(V(-0.072+archX(L.hipY),L.hipY+0.02,bz+0.09), V(-0.092+archX(L.bellyY),L.bellyY,bz2+0.11),
         V(0.092+archX(L.bellyY),L.bellyY,bz2+0.11), V(0.072+archX(L.hipY),L.hipY+0.02,bz+0.09), P.char, 0.05);
  }

  /* ---------- HEAD — grinning imp skull thrown BACK (arch continues through the neck/skull), ember
     mouth + ember eyes (the loudest value contrast on the model). */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.068, rz:0.076, hex:P.soot},
      {y:L.cheekY, rx:0.100, rz:0.100, hex:P.soot},
      {y:L.browY,  rx:0.106, rz:0.096, hex:P.sootLt},
      {y:L.crownY, rx:0.080, rz:0.070, hex:P.sootDk},
    ];
    const rings=bands.map(b=>ring(V(archX(b.y), b.y, archZ(b.y)+0.010), V(0,1,0), b.rx, b.rz, n, ph));
    // extra throw-back tilt on top of the base arch shear (softened from the r1 0.30 — kept just
    // enough to sell the flip while the face stays camera-facing) — the head is the loudest point.
    for(const r of rings) for(const p of r){ p.z -= (p.y-L.jawY)*0.10; p.x += (p.y-L.jawY)*0.06; }
    for(const i of [1,2]) rings[2][i].z -= 0.006;          // brow ridge push
    stitch(rings, b=>bands[b].hex);
    const skullTop = V(archX(L.crownY)+0.06, L.headTopY, archZ(L.crownY)-0.10);
    capFan(rings[3], skullTop, P.sootDk);

    /* EMBER GRIN — a bright ember-orange slot mouth (not fangs — a molten crack of a grin). Two small
       ember-glow eyes above it flanking the brow. R2 CRITIC FIX (2nd pass): r1's mouth/eye quads were
       sub-0.04u in their SHORT axis (mouth height 0.036u, eye 0.018u — under the law-3 feature floor)
       and dissolved completely at 1/3-res + dither, on top of sitting too close to the head's own front
       surface. Both enlarged well past the floor in both axes and pushed further forward (+0.03-0.05u
       more) to clear self-occlusion from the dimetric camera. */
    const my=L.jawY+0.016, mz=archZ(L.jawY)-(my-L.jawY)*0.10, mx=archX(L.jawY)+(my-L.jawY)*0.06;
    quad(V(mx-0.066,my+0.036,mz+0.150), V(mx-0.054,my-0.038,mz+0.140),
         V(mx+0.054,my-0.038,mz+0.140), V(mx+0.066,my+0.036,mz+0.150), P.ember, 0.02);
    quad(V(mx-0.040,my+0.018,mz+0.154), V(mx-0.030,my-0.020,mz+0.146),
         V(mx+0.030,my-0.020,mz+0.146), V(mx+0.040,my+0.018,mz+0.154), P.emberHot, 0.0);
    const ey=L.browY+0.010, ez=archZ(L.browY)-(ey-L.jawY)*0.10, ex=archX(L.browY)+(ey-L.jawY)*0.06;
    for(const s of [-1,1]){
      quad(V(ex+s*0.040-0.026,ey+0.024,ez+0.140), V(ex+s*0.036-0.020,ey-0.026,ez+0.132),
           V(ex+s*0.036+0.020,ey-0.026,ez+0.132), V(ex+s*0.040+0.026,ey+0.024,ez+0.140), P.ember, 0.015);
    }

    /* TWO SMALL BACK-SWEPT SOOT HORNS off the crown, ember-tipped just enough to catch light. */
    for(const s of [-1,1]){
      const hb = V(s*0.048+archX(L.crownY), L.crownY-0.006, archZ(L.crownY)-0.010);
      const hm = V(s*0.078+archX(L.crownY)+0.02, L.crownY+0.040, archZ(L.crownY)-0.050);
      const ht = V(s*0.094+archX(L.crownY)+0.03, L.crownY+0.066, archZ(L.crownY)-0.090);
      tube(hb, hm, 0.022, 0.014, 5, P.horn);
      tube(hm, ht, 0.014, 0.005, 5, P.horn, {capB:{hex:P.hornTip, lift:0.005}});
    }
  }

  /* ---------- SIGNATURE — SMOKE-PUFF HANDS: both clawed hands drawn in front of the chest squeezing
     a bright ember-orange smoke puff out between them (the choking-taunt verb), plus a curling wisp
     trail below/behind sold as soft low-poly ribbons (never hard shard-like — smoke, not ice). ---- */
  function wispRibbon(pts, w0, w1, hex, hexEdge){
    // a soft curling ribbon: a short chain of tapering quads following the point list, one bright
    // edge strip so it isn't pure dark-on-dark against the void.
    for(let i=0;i<pts.length-1;i++){
      const a=pts[i], b=pts[i+1];
      const t0=i/(pts.length-1), t1=(i+1)/(pts.length-1);
      const w0i=w0+(w1-w0)*t0, w1i=w0+(w1-w0)*t1;
      const up=V(0,1,0);
      const dir=new THREE.Vector3(b.x-a.x,b.y-a.y,b.z-a.z).normalize();
      const side=new THREE.Vector3().crossVectors(up,dir).normalize();
      const a0=a.clone().addScaledVector(side, w0i), a1=a.clone().addScaledVector(side,-w0i);
      const b0=b.clone().addScaledVector(side, w1i), b1=b.clone().addScaledVector(side,-w1i);
      quad(a0,a1,b1,b0, hex, 0.06);
    }
    if(hexEdge) quad(pts[0], pts[pts.length-1], pts[pts.length-1], pts[1]||pts[0], hexEdge, 0.02);
  }

  /* Chest anchor for the puff, riding the arch so it sits in front of the (backward-thrown) chest. */
  const puffCtr = V(archX(L.chestY)+0.01, L.chestY+0.02, archZ(L.chestY)+0.190);

  /* ---------- ARMS — both hands drawn IN, squeezing the puff between them (elbows bent, shoulders
     riding forward/up off the arched chest — never straight sticks). ---------- */
  const clawHand=(ctr, hex)=>{
    tube(ctr.clone().add(V(0,0.018,-0.018)), ctr.clone().add(V(0,-0.018,0.018)), 0.026, 0.022, 6, hex, {capA:{hex},capB:{hex}});
    for(const off of [-0.6,0,0.6]){
      const kb=ctr.clone().add(V(off*0.018,-0.008,0.018));
      const kt=kb.clone().add(V(off*0.012,-0.026,0.032));
      tube(kb, kt, 0.007, 0.003, 4, hex, {capB:{hex:P.claw, lift:0.003}});
    }
  };
  for(const s of [-1,1]){
    const Ssh = V(s*0.130+archX(L.shldY), L.shldY-0.005, archZ(L.shldY)+0.02);
    const Eel = V(s*0.110+archX(L.chestY), L.chestY+0.03, archZ(L.chestY)+0.100);   // ~120deg elbow bend
    const Hpz = V(s*0.048+puffCtr.x, puffCtr.y-0.01, puffCtr.z-0.02);               // hand at the puff
    tube(Ssh, Eel, 0.026, 0.020, 6, P.soot);
    tube(Eel, Hpz, 0.020, 0.016, 6, P.soot);
    clawHand(Hpz, P.sootLt);
  }
  /* the squeezed ember smoke puff itself — a small hot core + a soft ribbon bursting outward */
  quad(puffCtr.clone().add(V(-0.044,0.032,0)), puffCtr.clone().add(V(-0.036,-0.032,0)),
       puffCtr.clone().add(V(0.036,-0.032,0)), puffCtr.clone().add(V(0.044,0.032,0)), P.emberHot, 0.03);
  wispRibbon([
    puffCtr.clone(),
    puffCtr.clone().add(V(0.02,0.06,0.03)),
    puffCtr.clone().add(V(-0.01,0.11,0.02)),
    puffCtr.clone().add(V(0.03,0.15,-0.02)),
  ], 0.022, 0.006, P.smoke, P.ember);

  /* ---------- WINGS — STRUT wings (bone-chain shoulder->forearm->2 finger struts, membrane hung
     between). Asymmetric mid-backflip beat: one driving UP+forward (over the flip), one trailing
     DOWN+back (whipping through the arch). Rooted off the arched shoulder line. ---------- */
  function wing(s, up){
    const rootY = L.shldY, rootZ = archZ(L.shldY), rootX = archX(L.shldY);
    const SH = V(s*0.076+rootX, rootY+0.02, rootZ-0.03);
    const EL = up ? V(s*0.17+rootX, rootY+0.15, rootZ+0.02)  : V(s*0.18+rootX, rootY-0.03, rootZ-0.12);
    const WR = up ? V(s*0.23+rootX, rootY+0.25, rootZ+0.06)  : V(s*0.25+rootX, rootY-0.18, rootZ-0.20);
    const F1 = up ? V(s*0.17+rootX, rootY+0.13, rootZ+0.10)  : V(s*0.19+rootX, rootY-0.05, rootZ-0.06);
    const F2 = up ? V(s*0.27+rootX, rootY+0.31, rootZ+0.10)  : V(s*0.29+rootX, rootY-0.26, rootZ-0.26);
    const F3 = up ? V(s*0.12+rootX, rootY+0.33, rootZ-0.00)  : V(s*0.14+rootX, rootY-0.28, rootZ-0.12);
    tube(SH, EL, 0.028, 0.020, 5, P.wing, {capA:{hex:P.wingDk}});
    tube(EL, WR, 0.020, 0.014, 5, P.wing);
    for(const [a,b] of [[WR,F1],[WR,F2],[WR,F3]]) tube(a, b, 0.016, 0.007, 4, P.wingDk, {capB:{hex:P.wingDk}});
    quad(EL, WR, F1, EL.clone().lerp(F1,0.5), P.wingMemb, 0.05);
    quad(WR, F2, F1, EL, P.wingMemb, 0.05);
    quad(WR, F3, F2, WR, P.wingMemb, 0.05);
    // thin razor-confetti fleck seam along the leading spar — bright-kingdom garnish, secondary
    const SHt = SH.clone().add(V(0,0.018,0.008));
    quad(SH, SHt, EL.clone().add(V(0,0.010,0.008)), EL, P.confetti, 0.02);
  }
  wing(-1, true);    // left wing: up-stroke, driving over the flip
  wing(1, false);    // right wing: trailing down+back through the arch

  /* ---------- LEGS — spindly clawed legs TRAILING under the hover (never planted); tucked, following
     the backflip's forward-hip carry. ---------- */
  {
    const legL=(s)=>{
      const hip=V(s*L.hipHalf+archX(L.hipY), L.hipY-0.01, archZ(L.hipY)+0.02);
      const knee=V(s*0.098+archX(L.hipY), L.hoverY+0.150, archZ(L.hipY)+0.120);
      const ankle=V(s*0.093+archX(L.hipY), L.hoverY+0.060, archZ(L.hipY)+0.080);
      const toe=V(s*0.098+archX(L.hipY), L.hoverY+0.020, archZ(L.hipY)+0.130);
      tube(hip, knee, 0.032, 0.024, 6, P.soot);
      tube(knee, ankle, 0.023, 0.017, 6, P.sootDk);
      tube(ankle, toe, 0.019, 0.013, 5, P.sootDk, {capA:{hex:P.sootDk}});
      const d=V(s*0.10,0,1).normalize();
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=V(toe.x,toe.y,toe.z).addScaledVector(side, off*0.017);
        const tt=tb.clone().addScaledVector(d,0.038).addScaledVector(V(0,-1,0),0.02).addScaledVector(side, off*0.004);
        tube(tb, tt, 0.009, 0.003, 4, P.claw, {capB:{hex:P.claw, lift:0.003}});
      }
    };
    legL(-1); legL(1);
  }

  /* ---------- TAIL — a thin soot tail trailing a soft wisp curl (echoes the hand-puff wisp motif, a
     second smaller value-contrast beat low on the silhouette). ---------- */
  {
    const t0=V(archX(L.hipY), L.hipY-0.04, archZ(L.hipY)-0.08);
    const t1=V(archX(L.hipY)+0.04, L.hoverY+0.13, archZ(L.hipY)-0.18);
    const t2=V(archX(L.hipY)+0.09, L.hoverY+0.06, archZ(L.hipY)-0.26);
    tube(t0, t1, 0.028, 0.018, 6, P.soot, {capA:{hex:P.sootDk}});
    tube(t1, t2, 0.018, 0.008, 5, P.sootDk);
    wispRibbon([t2, t2.clone().add(V(0.02,0.03,-0.03)), t2.clone().add(V(0.05,0.02,-0.06))], 0.014, 0.003, P.smokeSoft, P.ember);
  }

  /* ---------- base disc (Small: r=0.32) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.305, 0.305, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
