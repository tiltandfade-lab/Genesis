/* dev/model-qa/creatures/mon-wraith.js — the WRAITH: the INCORPOREAL escalation of the wight.
   Whole-object grammar: one function, one geometry frame, no anchors. Where the wight STANDS
   (composed, armed, still commanding), the wraith DRIFTS — a hooded hollow-faced shade whose robe
   DISSOLVES instead of ending. The torso is a tattered floating shroud; its lower half breaks into
   5 separate trailing streamer tubes that taper to NOTHING without ever reaching the disc. Nothing
   touches the base — the miniature flying convention (like the bat): the figure hovers.
   Tells: a deep hood over a near-black void where a face should be, lit only by two COLD
   GREEN-WHITE pinprick eyes; two skeletal-thin arms ending in long reaching claw fingers, one arm
   extended toward the viewer; deep blue-black shroud paling to smoke-grey at the dissolving tips.
   The read: the zombie shambles, the ghoul pounces, the wight commands — the WRAITH DRIFTS.
   Imported by mon-wraith-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildWraith(){
  /* ---------- PALETTE (deep blue-black shroud → paler smoke-grey dissolving tips) ---------- */
  const P = {
    shroud:0x1c2230, shroudDk:0x121620, shroudDkr:0x0c0e15,   // deep blue-black robe body
    shroudLt:0x2c3446,                                         // lit shroud fold
    smoke:0x565f6e, smokeLt:0x767f8c, smokePale:0x8f96a1,      // paler smoke-grey streamer tips
    hoodDk:0x14181f, void:0x060709,                            // hood shell; the near-black face void
    bone:0x9a978c, boneDk:0x6a6860,                            // skeletal-thin arm/claw
    eye:0xbfeecf, eyeCore:0xe8fff0,                            // COLD GREEN-WHITE pinprick eyes
    disc:0x2c3038, discTop:0x363b44,
  };

  /* ---------- LANDMARKS — a hovering shade. Nothing sits on the disc; the whole figure floats.
     HOVER sets the bottom of the intact shroud; below it the streamers trail into nothing. ------ */
  const HOVER = 0.66;                 // the intact-shroud hem floats this high above the disc (big air gap)
  const L = {
    shroudBotY:HOVER, waistY:HOVER+0.30, ribY:HOVER+0.52, chestY:HOVER+0.66,
    shldY:HOVER+0.74, neckY:HOVER+0.80,
    hoodBrowY:HOVER+0.90, hoodTopY:HOVER+1.02,
    shoulderX:0.185,
  };

  /* ===== TORSO SHROUD — a tattered floating loft from the dissolving hem up to the shoulders.
     Narrow, hunched, hollow — a robe with NO BODY inside, only cloth. Blue-black, paling upward
     only slightly (the dissolve happens BELOW, in the streamers). ===== */
  stack([
    {y:L.shroudBotY, rx:0.150, rz:0.125, hex:P.shroudDkr},   // ragged floating hem (where streamers begin)
    {y:L.waistY,     rx:0.135, rz:0.110, hex:P.shroudDk},
    {y:L.ribY,       rx:0.165, rz:0.130, hex:P.shroud},
    {y:L.chestY,     rx:0.185, rz:0.140, hex:P.shroud},       // hollow chest — a caved, empty shell
    {y:L.shldY,      rx:0.180, rz:0.130, hex:P.shroudLt},
    {y:L.neckY,      rx:0.070, rz:0.066, hex:P.hoodDk},       // narrow neck into the hood
  ], 8, {capTop:{hex:P.hoodDk, lift:0.004}});

  /* the chest is CAVED — pull the two front verts of the chest ring inward + a dark hollow quad,
     so the shroud reads as empty cloth, not a filled torso. */
  {
    const cz = 0.140;
    quad(V(-0.075, L.ribY+0.02, cz-0.02), V(0.075, L.ribY+0.02, cz-0.02),
         V(0.060, L.chestY-0.02, cz-0.05), V(-0.060, L.chestY-0.02, cz-0.05), P.shroudDkr, 0.03);
  }

  /* a few draped fold-ridges down the front of the shroud (vertical tatter lines) */
  for(const fx of [-0.09, 0.0, 0.09]){
    const top=V(fx, L.chestY-0.02, 0.135), bot=V(fx*1.1, L.waistY+0.02, 0.115);
    tube(top, bot, 0.016, 0.020, 4, P.shroudDk, {});
  }

  /* ===== DISSOLVING STREAMERS — the INCORPOREAL tell. The lower shroud does NOT end in a hem;
     it BREAKS into 5 separate trailing tubes that taper to nothing, hanging below the floating
     hem WITHOUT reaching the disc. Deep blue-black at the root paling to smoke-grey at the tip.
     Their bottoms hover well above y=0 (nothing touches the base). Ragged, uneven, drifting. ===== */
  {
    /* Each streamer: root on the floating hem, then CURVES outward + trails to a wisp that ends
       HIGH above the disc (tipY ≈ 0.34–0.48 — a big air gap, never a leg on the ground). They
       SPLAY apart and drift back/out (not straight-down pillars), so the read is dissolving cloth,
       not limbs. Fat frayed root → thin midpoint bowed OUTWARD → vanishing tip (radius → ~0). */
    const streamers = [
      { ax:-0.10, az: 0.07, bowX:-0.30, tipX:-0.42, tipY:0.46, tipZ: 0.18 },  // front-left, curls far out
      { ax: 0.11, az: 0.08, bowX: 0.30, tipX: 0.44, tipY:0.40, tipZ: 0.22 },  // front-right, long trail out
      { ax: 0.02, az:-0.11, bowX: 0.03, tipX: 0.08, tipY:0.34, tipZ:-0.42 },  // rear-center, longest, drifts BACK
      { ax:-0.12, az:-0.05, bowX:-0.26, tipX:-0.38, tipY:0.49, tipZ:-0.26 },  // left-back, wisp swept out+back
      { ax: 0.12, az:-0.03, bowX: 0.32, tipX: 0.42, tipY:0.43, tipZ:-0.20 },  // right, swept out+back
    ];
    for(const s of streamers){
      const root = V(s.ax, L.shroudBotY-0.02, s.az);
      // midpoint BOWED outward + hanging, so the streamer arcs (drifting cloth, not a straight leg)
      const mid  = V(s.bowX, (L.shroudBotY + s.tipY)*0.5 - 0.02, (s.az + s.tipZ)*0.5);
      const tip  = V(s.tipX, s.tipY, s.tipZ);
      tube(root, mid, 0.048, 0.022, 5, P.shroudDk);                         // frayed root → thin waist
      tube(mid,  tip, 0.022, 0.003, 5, P.smoke, {capB:{hex:P.smokePale, lift:0.015}}); // waist → wisp (~0)
      // paler smoke-grey overlay along the lower half so the tip clearly FADES to nothing
      quad(mid.clone().add(V(-0.010,0,0)), mid.clone().add(V(0.010,0,0)),
           tip.clone().add(V(0.003,0.005,0)), tip.clone().add(V(-0.003,0.005,0)), P.smokePale, 0.05);
    }
    // extra loose wisps peeling off between the main streamers (curling out, ending high — pure tatter)
    for(const [rx,rz,bx,by,bz,tx,ty,tz] of [
      [0.0, 0.11, 0.16,0.52,0.14, 0.22,0.46,0.20],
      [-0.05,-0.09,-0.20,0.55,-0.14, -0.24,0.50,-0.20],
      [0.08,-0.02, 0.22,0.50,-0.02, 0.28,0.45,-0.02],
    ]){
      const root=V(rx,L.shroudBotY-0.02,rz), bow=V(bx,by,bz), tip=V(tx,ty,tz);
      tube(root, bow, 0.020, 0.008, 4, P.shroudDk);
      tube(bow,  tip, 0.008, 0.002, 4, P.smokeLt, {capB:{hex:P.smokePale}});
    }
  }

  /* ===== HOOD — a deep drawn cowl sitting low over a HOLLOW face. The hood shell is near-black
     cloth; inside is a VOID (no face), lit only by the two cold eyes. The cowl peaks and drapes
     back, and the front opening is a dark cavity. ===== */
  {
    const n=8, ph=Math.PI/n, faceCols=[1,2];      // +z front verts left open into the void
    const bands=[
      {y:L.neckY-0.01,  rx:0.100, rz:0.096, hex:P.hoodDk},
      {y:L.hoodBrowY-0.10, rx:0.150, rz:0.138, hex:P.shroudDk},
      {y:L.hoodBrowY,   rx:0.152, rz:0.140, hex:P.shroudDk},
      {y:L.hoodTopY,    rx:0.110, rz:0.100, hex:P.hoodDk},
    ];
    const skip={1:faceCols, 2:faceCols};          // leave the front open (the face cavity)
    const rings=bands.map(b=>ring(V(0,b.y,0.004), V(0,1,0), b.rx, b.rz, n, ph));
    rings[3].forEach(p=>p.z -= 0.030);            // the cowl peak drapes BACK
    // pull the brow front verts forward + down, hooding the void deep (a shadowed overhang)
    for(const i of [1,2]){ rings[2][i].z += 0.028; rings[2][i].y -= 0.010; }
    stitch(rings, b=>bands[b].hex, skip);
    capFan(rings[3], V(0, L.hoodTopY+0.05, -0.05), P.hoodDk);
    // dark inner lining panels down the open edges (idx 0 and 3 flank the face window)
    const inner=bands.map(b=>ring(V(0,b.y,0.004), V(0,1,0), b.rx-0.020, b.rz-0.020, n, ph));
    inner[3].forEach(p=>p.z -= 0.030);
    for(let b=1;b<3;b++) for(const edge of [0,3])
      quad(rings[b][edge], inner[b][edge], inner[b+1][edge], rings[b+1][edge], P.void, 0.02);

    /* THE FACE VOID — a near-black recessed panel filling the hood opening (no face, just dark).
       Set well back inside the cowl so the eyes read as floating in a hollow. */
    const fy = L.hoodBrowY - 0.06, fz = 0.075;
    quad(V(-0.088, fy-0.11, fz), V(0.088, fy-0.11, fz),
         V(0.082, fy+0.10, fz-0.02), V(-0.082, fy+0.10, fz-0.02), P.void, 0.0);
    // a second, deeper void plane behind it so the cavity has depth
    quad(V(-0.070, fy-0.09, fz-0.05), V(0.070, fy-0.09, fz-0.05),
         V(0.066, fy+0.08, fz-0.07), V(-0.066, fy+0.08, fz-0.07), P.shroudDkr, 0.0);

    /* COLD GREEN-WHITE PINPRICK EYES — two tiny glow quads floating in the void, each with a
       brighter core. The only light in the hollow. Small + intentional (painted-mini dot eyes). */
    for(const s of [-1,1]){
      const ex=s*0.040, ey=fy-0.005, ez=fz+0.012;
      quad(V(ex-0.011,ey-0.009,ez), V(ex+0.011,ey-0.009,ez),
           V(ex+0.011,ey+0.010,ez-0.003), V(ex-0.011,ey+0.010,ez-0.003), P.eye, 0.0);
      quad(V(ex-0.005,ey-0.004,ez+0.004), V(ex+0.005,ey-0.004,ez+0.004),
           V(ex+0.005,ey+0.005,ez+0.002), V(ex-0.005,ey+0.005,ez+0.002), P.eyeCore, 0.0);
    }
  }

  /* ===== ARMS — two SKELETAL-THIN arms emerging from the shroud, ending in long reaching claw
     fingers. The RIGHT (s=+1) is EXTENDED toward the viewer (reaching, grasping); the LEFT hangs
     lower + drifts back. Bone-pale thin tubes, NOT sleeved — the incorporeal has no flesh mass. ===== */
  {
    // extended reaching right arm
    {
      const S = V(L.shoulderX, L.shldY-0.02, 0.05);
      const E = V(0.29, L.chestY-0.06, 0.26);           // elbow out + forward
      const W = V(0.30, L.ribY-0.02, 0.44);             // wrist reaching FAR forward toward viewer
      tube(S, E, 0.038, 0.028, 6, P.shroudDk);          // a thin sleeve-wisp at the shoulder
      tube(E, W, 0.024, 0.016, 6, P.boneDk);            // skeletal forearm
      // long reaching claw fingers — 4 spread talons + a thumb, fanning forward from the wrist
      const fanDirs=[V(-0.35,0.25,1),V(-0.12,0.10,1),V(0.14,-0.05,1),V(0.38,-0.20,1)];
      for(const d of fanDirs){
        const dn=d.clone().normalize();
        const tip=W.clone().addScaledVector(dn,0.16);   // LONG fingers
        tube(W, tip, 0.012, 0.002, 4, P.bone, {capB:{hex:P.boneDk, lift:0.008}});
      }
      tube(W, W.clone().add(V(-0.06,-0.09,0.03)), 0.011, 0.002, 4, P.bone, {capB:{hex:P.boneDk}});  // thumb
    }
    // lower, drifting-back left arm (relaxed, trailing)
    {
      const S = V(-L.shoulderX, L.shldY-0.02, 0.03);
      const E = V(-0.26, L.waistY+0.02, 0.06);
      const W = V(-0.22, L.shroudBotY+0.12, -0.02);      // hangs low + drifts back
      tube(S, E, 0.038, 0.026, 6, P.shroudDk);
      tube(E, W, 0.022, 0.014, 6, P.boneDk);
      // trailing claw fingers, splayed down/back
      const fanDirs=[V(-0.30,-1,0.2),V(-0.05,-1,0.15),V(0.20,-1,0.05),V(0.42,-0.9,-0.10)];
      for(const d of fanDirs){
        const dn=d.clone().normalize();
        const tip=W.clone().addScaledVector(dn,0.15);
        tube(W, tip, 0.011, 0.002, 4, P.bone, {capB:{hex:P.boneDk, lift:0.008}});
      }
    }
    // thin sleeve-tatters hanging off each shoulder (cloth wisps trailing from the arms)
    for(const s of [-1,1]){
      const a=V(s*(L.shoulderX+0.02), L.shldY-0.04, 0.0);
      tube(a, V(s*(L.shoulderX+0.06), L.waistY, -0.04), 0.028, 0.006, 4, P.shroudDk, {capB:{hex:P.smoke}});
    }
  }

  /* base disc (Medium: r=0.42). The wraith floats WELL above it — nothing connects. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
