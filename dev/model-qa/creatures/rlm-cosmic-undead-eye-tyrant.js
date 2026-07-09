/* dev/model-qa/creatures/rlm-cosmic-undead-eye-tyrant.js — the UNDEAD EYE TYRANT (FLOATER family,
   Huge, CR 14, realm cosmic), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (cosmic
   foundry wave 1, cell 10, port 5380). Core identity: the eye tyrant landmark — one HUGE central eye
   dominating a floating orb, a wide fanged underbite maw, and a crown of writhing eyestalks. UNDEAD
   skin over that core: torn dead hide (ragged holes, not smooth flesh), an exposed bone rim ringing
   the equator where the hide has rotted away, pale bone showing through at the tears — a half-born
   twin thing straining at the seams of the world, never a clean healthy beholder.

   FEATURE CHECKLIST (the ~1,850-tri budget buys; Huge realm-apex justifies the top of the band —
   this is the cosmic realm's landmark aberration, spend the budget the brief calls for):
     1. FLOATER body — one great hovering sphere (disc-relative hover ~0.5u), built as a vertical
        loft of rings so the silhouette reads as ONE mass, not stacked parts.
     2. SIGNATURE — the central eye: a domed pale lens over a dark socket recess, HUGE relative to
        the body (law 3's >=140 RGB high-value zone lives here, the brightest/palest shape in the
        piece, dead-center on the tilted-forward face so it's the first thing the eye lands on).
     3. Wide fanged underbite maw below the eye, jaw dropped open, upper+lower fang rows.
     4. 8 eyestalks (the brief's countable feature) writhing off the crown at DIFFERENT angles —
        not a uniform radial fan like a stock beholder; angles vary (some low/splayed, some curled
        tight, some reaching straight out) so each stalk reads as its own gesture, all straining
        forward toward the viewer per the pose.
     5. UNDEAD skin — torn hide with ragged holes (quad gaps showing a darker under-layer, not
        smooth continuous flesh) scattered across the flank, an exposed BONE RIM running the
        equator where hide has rotted back to bare bone, and pale bone-tips showing at a few of
        the tears — the realm-skin distinguisher vs a healthy beholder.
     6. Value ladder — dark rotten-hide flanks clear the 60 RGB body-mass floor over the void
        (10,9,8); the eye lens + exposed bone rim carry the high end so the signature and the
        undead-tell both read at a squint. COSMIC WARNING respected: this realm's native failure
        is dark-on-dark (Creeper x2) — every dark zone here is checked against the void floor.

   POSE SENTENCE (the regard): the whole sphere is tilted down-and-forward, fixing the viewer dead
   ahead — never a level, at-rest hover. The central eye leads the tilt (aimed slightly down at an
   implied ground-level target), the maw hangs open beneath it, and all 8 eyestalks are swept
   FORWARD and DOWN off the crown, echoing the sphere's own tilt like a medusa's snakes all straining
   at once toward the same thing the central eye has fixed on — the signature (eye) and the crown
   (stalks) reinforce the same directional read instead of competing.

   SPINE-GESTURE SENTENCE (per ANATOMY-CANON POSE-ANATOMY, adapted for a FLOATER — no biped spine to
   trace, the sphere's own tilt IS the gesture line): the hover axis is not vertical — the whole body
   loft is built on an axis pitched ~22° forward-and-down from crown to belly, so the "spine" runs
   crown (tilted back-and-up, stalks rooted there) -> equator (bone rim, the widest turn of the arc)
   -> lower face (eye+maw, pitched forward-down to meet the viewer) as one continuous leaning curve,
   never a plumb vertical ball with features glued onto its front.

   Whole-object grammar: one function, one merged geometry frame, no anchors, no part-object
   transforms. Ground y=0, body hovers above an empty disc per the tabletop hover-flag convention.
   Huge size: base disc r=0.68. Imported by ps1-sheet.html (SETS['cosmic-w1'], cell 10, fn
   buildUndeadEyeTyrant). Cosmic palette garnish per data/realm-bestiary.js (cosmic array). */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

/* rotate a point around the X axis by degrees, pivoting at `piv` — the forward-tilt workhorse
   (tips the whole loft crown-back / face-forward along the pose's down-forward pitch). */
function tiltX(p, deg, piv){
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const y = p.y - piv.y, z = p.z - piv.z;
  return V(p.x, piv.y + y * c - z * s, piv.z + y * s + z * c);
}

export function buildUndeadEyeTyrant(){
  /* ---------- PALETTE (cosmic undead skin: rotten purple-grey hide climbing to bone-pale rim
     and eye-lens highlights; dark socket/maw/tear recesses checked against the void floor). ---------- */
  const P = {
    hide:0x746280, hideDk:0x4d4260, hideLt:0x8c7a98,       // rotten mottled hide ladder — R2 self-review:
                                                             // r1 sat too close to the void, brightened whole
    mottleA:0x5c4e70, mottleB:0x9282a0,
    tearDk:0x241e2a, tearBone:0xc7bda4,                     // torn hide gaps + pale bone showing through
    boneRim:0xece0c4, boneRimDk:0xb8aa8c,                   // exposed bone rim at the equator (law-3 high zone)
    lensRim:0xa89cb0, lens:0xf0f2dc, lensDk:0x9ea488,        // huge pale central eye lens (signature)
    socket:0x151018,                                        // dark socket recess (shape, not a painted quad)
    maw:0x1c1720, gum:0x4a2a34, fang:0xd4c9ac, tongue:0x5e2530,
    stalk:0x8074a0, stalkDk:0x584a78, stalkBone:0xc0b498,   // R2: stalks lightened + purpled so they read
                                                             // as their own shape against the hide, not merge in
    bulb:0x8c7cac, bulbSocket:0x120e16,
    disc:0x2c2632, discTop:0x362e3c,
  };
  setChannels({
    [P.lens]:'glass', [P.lensDk]:'glass', [P.lensRim]:'glass',
    [P.fang]:'bone', [P.tearBone]:'bone', [P.boneRim]:'bone', [P.boneRimDk]:'bone', [P.stalkBone]:'bone',
    [P.hide]:'scale', [P.hideDk]:'scale', [P.hideLt]:'scale',
  });

  /* ---------- LANDMARKS — Huge floater hovering over its disc; the whole loft axis is pitched
     forward-down per the pose sentence (tiltX pivots everything around the body core). ---------- */
  const bodyY = 0.98;                 // body center height — hovers well clear of the disc (Huge)
  const PIVOT = V(0, bodyY, 0);
  const TILT = 22;                    // forward-down pitch, crown-back / face-forward

  /* ---------- BODY — one vertical loft, a fat mottled sphere, built straight then tilted whole. ---------- */
  {
    const n = 14, ph = Math.PI/n;
    const bands = [
      {y:bodyY-0.560, r:0.150, hex:P.hideDk},   // low belly pinch
      {y:bodyY-0.470, r:0.340, hex:P.mottleA},
      {y:bodyY-0.280, r:0.520, hex:P.hide},
      {y:bodyY-0.040, r:0.620, hex:P.mottleB},   // widest — equator (bone rim rides here)
      {y:bodyY+0.220, r:0.560, hex:P.hide},
      {y:bodyY+0.440, r:0.400, hex:P.mottleA},
      {y:bodyY+0.580, r:0.220, hex:P.hideDk},   // crown base (stalks root here)
    ];
    const rings = bands.map(b => ring(V(0,b.y,0), V(0,1,0), b.r, b.r, n, ph).map(p => tiltX(p, TILT, PIVOT)));
    stitch(rings, b => bands[b].hex);
    capFan(rings[0], tiltX(V(0, bodyY-0.610, 0), TILT, PIVOT), P.hideDk, true);
    capFan(rings.at(-1), tiltX(V(0, bodyY+0.640, 0), TILT, PIVOT), P.hideDk);

    /* torn-hide gaps — ragged dark quads scattered on the flank, each with a pale bone-tip
       peeking through one edge (the undead tell). Deterministic scatter, positions pre-tilt
       then rotated with the body so they ride the same lean. */
    const tear = (ang, y, w, h) => {
      const r0 = 0.58;
      const a0=V(Math.cos(ang)*r0, y, Math.sin(ang)*r0);
      const a1=V(Math.cos(ang+w)*r0*0.96, y-h*0.4, Math.sin(ang+w)*r0*0.96);
      const a2=V(Math.cos(ang+w*0.7)*r0*0.90, y-h, Math.sin(ang+w*0.7)*r0*0.90);
      const a3=V(Math.cos(ang-w*0.2)*r0*0.94, y-h*0.6, Math.sin(ang-w*0.2)*r0*0.94);
      quad(tiltX(a0,TILT,PIVOT), tiltX(a1,TILT,PIVOT), tiltX(a2,TILT,PIVOT), tiltX(a3,TILT,PIVOT), P.tearDk, 0.03);
    };
    // bone-tip peeking through a tear, placed via a tiny tube (recess-safe, tilt-aware)
    const boneTip = (ang, y, h) => {
      const r0 = 0.58;
      const bx = Math.cos(ang)*r0*0.93, bz = Math.sin(ang)*r0*0.93;
      const p0 = tiltX(V(bx, y-h*0.5, bz), TILT, PIVOT);
      const p1 = tiltX(V(bx*1.02, y-h*0.62, bz*1.02), TILT, PIVOT);
      tube(p0, p1, 0.030, 0.010, 4, P.tearBone, {capB:{hex:P.tearBone}});
    };
    tear(0.5, bodyY+0.06, 0.34, 0.20);  boneTip(0.68, bodyY+0.06, 0.20);
    tear(2.1, bodyY-0.10, 0.30, 0.18);  boneTip(2.28, bodyY-0.10, 0.18);
    tear(3.6, bodyY+0.14, 0.32, 0.22);  boneTip(3.78, bodyY+0.14, 0.22);
    tear(5.0, bodyY-0.02, 0.28, 0.19);  boneTip(5.16, bodyY-0.02, 0.19);
    tear(1.3, bodyY-0.28, 0.26, 0.16);  boneTip(1.44, bodyY-0.28, 0.16);
  }

  /* ---------- EXPOSED BONE RIM — a ring of pale bone at the equator where hide has rotted away,
     law-3's high-value zone alongside the eye lens (checked: boneRim RGB well over the 140 floor). */
  {
    const n = 14, ph = Math.PI/n, rimY = bodyY - 0.030, rimR = 0.628;
    const rOuter = ring(V(0,rimY,0), V(0,1,0), rimR, rimR, n, ph).map(p => tiltX(p, TILT, PIVOT));
    const rInnerTop = ring(V(0,rimY+0.06,0), V(0,1,0), rimR-0.05, rimR-0.05, n, ph).map(p => tiltX(p, TILT, PIVOT));
    const rInnerBot = ring(V(0,rimY-0.06,0), V(0,1,0), rimR-0.05, rimR-0.05, n, ph).map(p => tiltX(p, TILT, PIVOT));
    stitch([rInnerTop, rOuter], () => P.boneRim);
    stitch([rOuter, rInnerBot], () => P.boneRimDk);
  }

  /* ---------- CENTRAL EYE — one huge domed pale lens over a dark socket recess, aimed along
     the tilt (forward and slightly down), fixing the viewer per the pose sentence. ---------- */
  {
    const eyeZ = 0.560, eyeY = bodyY + 0.04;
    const n = 12, ph = Math.PI/n;
    const rimOuter = ring(V(0,eyeY,eyeZ-0.03), V(0,0,1), 0.330, 0.330, n, ph).map(p => tiltX(p, TILT, PIVOT));
    const rimInner = ring(V(0,eyeY,eyeZ+0.01), V(0,0,1), 0.260, 0.260, n, ph).map(p => tiltX(p, TILT, PIVOT));
    stitch([rimOuter, rimInner], () => P.lensRim);
    capFan(rimInner, tiltX(V(0,eyeY,eyeZ-0.05), TILT, PIVOT), P.socket, true);
    const lensBase = ring(V(0,eyeY,eyeZ+0.02), V(0,0,1), 0.260, 0.260, n, ph).map(p => tiltX(p, TILT, PIVOT));
    const lensMid  = ring(V(0,eyeY,eyeZ+0.16), V(0,0,1), 0.210, 0.210, n, ph).map(p => tiltX(p, TILT, PIVOT));
    stitch([lensBase, lensMid], () => P.lens);
    capFan(lensMid, tiltX(V(0,eyeY,eyeZ+0.225), TILT, PIVOT), P.lensDk);
    // lid folds (shape wrinkles, no eye quad) framing the huge lens
    const lidA = [V(-0.34,eyeY-0.260,eyeZ-0.03), V(0.34,eyeY-0.260,eyeZ-0.03), V(0.28,eyeY-0.320,eyeZ-0.09), V(-0.28,eyeY-0.320,eyeZ-0.09)].map(p=>tiltX(p,TILT,PIVOT));
    quad(lidA[0],lidA[1],lidA[2],lidA[3], P.hideDk, 0.05);
    const lidB = [V(-0.34,eyeY+0.270,eyeZ-0.03), V(0.34,eyeY+0.270,eyeZ-0.03), V(0.28,eyeY+0.330,eyeZ-0.09), V(-0.28,eyeY+0.330,eyeZ-0.09)].map(p=>tiltX(p,TILT,PIVOT));
    quad(lidB[0],lidB[1],lidB[2],lidB[3], P.hideDk, 0.05);
  }

  /* ---------- MAW — wide fanged underbite mouth, jaw dropped open, low on the body under the eye. */
  {
    const mawY = bodyY - 0.330, mawZ = 0.460;
    const inQ = (a,b,c,d,hex,l) => quad(tiltX(a,TILT,PIVOT), tiltX(b,TILT,PIVOT), tiltX(c,TILT,PIVOT), tiltX(d,TILT,PIVOT), hex, l);
    inQ(V(-0.310,mawY+0.05,mawZ-0.07), V(0.310,mawY+0.05,mawZ-0.07), V(0.260,mawY-0.130,mawZ+0.04), V(-0.260,mawY-0.130,mawZ+0.04), P.maw, 0.05);
    inQ(V(-0.260,mawY-0.130,mawZ+0.04), V(0.260,mawY-0.130,mawZ+0.04), V(0.200,mawY-0.020,mawZ+0.15), V(-0.200,mawY-0.020,mawZ+0.15), P.gum, 0.06);
    const fangAt = (x, yTop, yTip, z) => {
      tube(tiltX(V(x,yTop,z),TILT,PIVOT), tiltX(V(x,yTip,z),TILT,PIVOT), 0.026, 0.004, 4, P.fang, {capB:{hex:P.fang, lift:0.004}});
    };
    for(const x of [-0.230,-0.135,-0.045,0.045,0.135,0.230]){
      fangAt(x, mawY+0.03, mawY-0.13, mawZ-0.03);      // upper fangs pointing down
      fangAt(x*0.9, mawY-0.09, mawY+0.02, mawZ+0.06);  // lower fangs jutting up — the underbite
    }
    tube(tiltX(V(0,mawY-0.03,mawZ+0.03),TILT,PIVOT), tiltX(V(0,mawY-0.05,mawZ+0.19),TILT,PIVOT), 0.062, 0.040, 5, P.tongue, {capB:{hex:P.tongue, lift:0.01}});
  }

  /* ---------- EYE-STALKS — 8 stalks writhing off the crown at DIFFERENT angles, all swept
     forward+down echoing the sphere's tilt (the "straining toward the viewer" pose). Each root
     angle/reach/curl is deterministic-varied so no two read as a uniform radial fan. ---------- */
  {
    const nStalks = 8, crownY = bodyY + 0.520, crownR = 0.230;
    // per-stalk: [azimuth, per-stalk extra forward-sweep deg (on top of the base body TILT,
    // applied as ONE rigid rotation to the whole stalk chain so it never self-crosses), extra
    // length, curl sign] — the sweep varies each stalk's angle so the crown reads as writhing.
    const rig = [
      [0.10, 16, 0.06, 1], [0.85, 4, -0.02, -1], [1.55, 22, 0.10, 1], [2.20, -4, -0.04, -1],
      [2.95, 18, 0.03, 1], [3.70, 8, -0.05, -1], [4.45, 24, 0.08, 1], [5.55, 2, 0.00, -1],
    ];
    for(let i=0;i<nStalks;i++){
      const [a, sweep, dLen, curl] = rig[i];
      const deg = TILT + sweep;                      // one rigid angle for this whole stalk chain
      const rootX = Math.cos(a)*crownR, rootZ = Math.sin(a)*crownR;
      const root = tiltX(V(rootX, crownY, rootZ), deg, PIVOT);
      const outX = Math.cos(a)*0.44, outZ = Math.sin(a)*0.44;
      const reach = 0.42 + dLen;
      const p1raw = V(rootX + outX*0.42, crownY+0.16, rootZ + outZ*0.42);
      const p2raw = V(rootX + outX*0.80 + curl*0.07, crownY+0.16+reach*0.35, rootZ + outZ*0.80 - curl*0.06);
      const tipraw = V(rootX + outX*0.55 + curl*0.16, crownY+0.02+reach*0.62, rootZ + outZ*0.55 - curl*0.14);
      const p1 = tiltX(p1raw, deg, PIVOT);
      const p2 = tiltX(p2raw, deg, PIVOT);
      const tip = tiltX(tipraw, deg, PIVOT);
      tube(root, p1, 0.060, 0.046, 6, P.stalk, {capA:{hex:P.stalkDk}});
      tube(p1, p2, 0.046, 0.030, 6, P.stalkDk);
      tube(p2, tip, 0.030, 0.020, 6, P.stalk);
      // a torn patch + bone-tip on ~half the stalks (undead tell carried onto the crown too)
      if(i % 2 === 0){
        const midraw = V((p1raw.x+p2raw.x)/2, (p1raw.y+p2raw.y)/2, (p1raw.z+p2raw.z)/2);
        const mid = tiltX(midraw, deg, PIVOT);
        const midB = tiltX(V(midraw.x + outX*0.10, midraw.y-0.03, midraw.z + outZ*0.10), deg, PIVOT);
        tube(mid, midB, 0.020, 0.008, 4, P.stalkBone, {capB:{hex:P.stalkBone}});
      }
      // small eye-bulb at the tip — outward direction rotated by this stalk's own angle
      const dirLocal = new THREE.Vector3(outX, 0.20, outZ).normalize();
      const dirRaw = tiltX(V(dirLocal.x, dirLocal.y, dirLocal.z), deg, V(0,0,0)).normalize();
      const bulgeTip = tip.clone().addScaledVector(dirRaw, 0.03);
      tube(tip, bulgeTip, 0.019, 0.058, 6, P.stalk, {capB:{hex:P.stalk, lift:0.012}});
      const socketC = bulgeTip.clone().addScaledVector(dirRaw, 0.03);
      const sRing = ring(socketC, dirRaw, 0.030, 0.030, 6, 0);
      capFan(sRing, socketC.clone().addScaledVector(dirRaw, -0.014), P.bulbSocket);
    }
  }

  /* ---------- base disc (Huge: r=0.68). Empty of body geometry — hover-flagged unit floats
     clear above it per the tabletop convention; the disc marks the footprint only. ---------- */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2 = ring(V(0,0.055,0), V(0,1,0), 0.65, 0.65, 20);
    stitch([r1,r2], () => P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
