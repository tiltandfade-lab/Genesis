/* dev/model-qa/creatures/mon-lizard.js — the GIANT LIZARD (bespoke QUADRUPED, Large monitor-lizard).
   Adam's QA-review ruling 2026-07-04: build a bespoke low-slung quadruped — long tail, wide stance.
   The bestiary giant-lizard is a Large Beast with Spider Climb (a big monitor/goanna). The read:
   a LOW-SLUNG horizontal body carried on SPLAYED sprawling legs (elbows/knees out to the sides,
   sprawling-gait, belly close to the ground — reptile, not mammal), a broad wedge head with a wide
   jaw + a flicking forked tongue, scaly ridged back, and a LONG heavy TAIL (as long as the body)
   tapering to a whip. NO eye quads (house eye ruling reversed 2026-07-04). Whole-object grammar:
   one function, one geometry frame, no anchors. Large size: ~2.1u long body, base disc r=0.55.
   Imported by mon-lizard-probe.html + the proof sheet. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGiantLizard(){
  /* ---------- PALETTE (VS desaturated; mottled swamp-green/olive scale, pale throat) ---------- */
  const P = {
    hide:0x5c6042, hideDk:0x3f4530, hideLt:0x767a54,          // olive-green scaly hide
    mottleA:0x515636, mottleB:0x6a6d48,                        // dorsal mottle bands
    belly:0x9a9470, bellyDk:0x757052,                          // pale throat/belly
    ridge:0x2f3324,                                            // dark dorsal ridge scutes
    snout:0x545838, nostril:0x201d16, mouth:0x2a1f1a,
    tongue:0x933a3e,                                           // forked flicking tongue
    claw:0x241f19, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — spine along +z, held LOW (belly close to ground), body ~1.3u long. ---------- */
  const spY = 0.40;                             // low horizontal spine height
  const S = {
    tailBase: V(0, spY-0.02, -0.66),
    rump:     V(0, spY+0.02, -0.46),
    loin:     V(0, spY+0.03, -0.22),
    mid:      V(0, spY+0.03,  0.02),
    shldr:    V(0, spY+0.01,  0.28),
    neck:     V(0, spY-0.02,  0.48),
    headB:    V(0, spY-0.04,  0.62),            // head held low + forward
  };

  /* ---------- BODY — one horizontal loft; a broad, dorsally-flattened reptile barrel. ---------- */
  tube(S.rump,  S.loin,  0.230, 0.255, 9, P.hide,    {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.255, 0.260, 9, P.mottleA, {phase:Math.PI/9});
  tube(S.mid,   S.shldr, 0.260, 0.235, 9, P.hide,    {phase:Math.PI/9});
  tube(S.shldr, S.neck,  0.235, 0.155, 9, P.mottleB, {phase:Math.PI/9});
  tube(S.neck,  S.headB, 0.155, 0.125, 9, P.hideDk,  {phase:Math.PI/9});
  /* pale belly strip low on the flanks (reptile underside) */
  {
    const by = spY-0.235;
    quad(V(-0.17,by,-0.40), V(0.17,by,-0.40), V(0.15,by+0.02,0.26), V(-0.15,by+0.02,0.26), P.belly, 0.05);
  }
  /* DORSAL RIDGE — a line of dark scute quads running the spine (rump->neck), reptile read */
  {
    const seg = [[-0.44,spY+0.24],[-0.20,spY+0.26],[0.04,spY+0.26],[0.28,spY+0.22]];
    for(let i=0;i<seg.length-1;i++){
      const [z0,y0]=seg[i], [z1,y1]=seg[i+1];
      quad(V(-0.028,y0,z0), V(0.028,y0,z0), V(0.024,y1,z1), V(-0.024,y1,z1), P.ridge, 0.04);
      // little spine points poking up
      quad(V(-0.014,y0,z0), V(0.014,y0,z0), V(0,y0+0.045,z0-0.01), V(0,y0+0.045,z0-0.01), P.ridge, 0.03);
    }
  }

  /* ---------- HEAD — a broad flat WEDGE with a wide jaw + flicking forked tongue. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.075, cz:0.66, rx:0.130, rz:0.135, hex:P.hide},   // jaw/cheek (wide)
      {y:spY-0.035, cz:0.69, rx:0.150, rz:0.140, hex:P.hide},   // broad cranium
      {y:spY+0.005, cz:0.66, rx:0.120, rz:0.108, hex:P.hideDk}, // brow (low, flat)
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.02, 0.66), P.hideDk);

    /* SNOUT — a broad blunt wedge projecting forward (+z) and slightly down to a blunt muzzle. */
    const snB = V(0, spY-0.085, 0.66);
    const snM = V(0, spY-0.105, 0.78);
    const snT = V(0, spY-0.120, 0.88);          // blunt muzzle tip (over the r0.55 disc: z=0.88 < 0.55? no)
    tube(snB, snM, 0.120, 0.088, n, P.snout, {raz:0.098, rbz:0.066, phase:ph});
    tube(snM, snT, 0.088, 0.052, n, P.snout, {raz:0.066, rbz:0.036, phase:ph, capB:{hex:P.mouth, lift:0.008}});
    /* two nostril pits near the tip */
    for(const s of [-1,1]) quad(V(s*0.022-0.010,spY-0.108,0.865), V(s*0.022+0.010,spY-0.108,0.865),
                                V(s*0.022+0.008,spY-0.092,0.855), V(s*0.022-0.008,spY-0.092,0.855), P.nostril, 0.0);
    /* dark mouth line + pale throat under the jaw */
    quad(V(-0.088,spY-0.135,0.70), V(0.088,spY-0.135,0.70), V(0.052,spY-0.140,0.86), V(-0.052,spY-0.140,0.86), P.mouth, 0.03);
    quad(V(-0.090,spY-0.150,0.66), V(0.090,spY-0.150,0.66), V(0.055,spY-0.160,0.84), V(-0.055,spY-0.160,0.84), P.belly, 0.05);

    /* FORKED TONGUE — a thin red tongue flicking forward out of the mouth, splitting into two tips. */
    const tRoot = V(0, spY-0.140, 0.86);
    const tMid  = V(0, spY-0.150, 0.98);
    tube(tRoot, tMid, 0.014, 0.010, 4, P.tongue, {capA:{hex:P.mouth}});
    for(const s of [-1,1]){
      const fk = V(s*0.028, spY-0.156, 1.08);
      tube(tMid, fk, 0.009, 0.004, 4, P.tongue, {capB:{hex:P.tongue, lift:0.004}});
    }
  }

  /* ---------- LEGS — SPRAWLING reptile stance: upper limb runs OUT to the side (nearly horizontal),
     then the lower limb drops to a splayed clawed foot planted WIDE of the body. Belly stays low. --- */
  {
    const sprawlLeg=(shoulder, footX, footZ, hex)=>{
      // elbow/knee pushed OUT to the side + level with the body (the sprawl), then drop to the foot
      const elbowX = shoulder.x + Math.sign(shoulder.x)*0.20;
      const elbow = V(elbowX, spY-0.10, shoulder.z + (footZ>shoulder.z?0.04:-0.04));
      const foot  = V(footX, 0.055, footZ);
      tube(shoulder, elbow, 0.078, 0.058, 7, hex);                       // upper limb OUT to the side
      tube(elbow, foot, 0.056, 0.038, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}}); // lower drops down
      // splayed clawed foot — a small pad + 4 spread claws forward/out
      const pad = V(foot.x, 0.03, foot.z+0.03);
      const side = Math.sign(foot.x||1);
      for(const [dx,dz] of [[side*0.06,0.02],[side*0.03,0.06],[-side*0.01,0.07],[-side*0.04,0.05]]){
        const cb = V(pad.x, 0.035, pad.z);
        const ct = V(pad.x+dx, 0.010, pad.z+dz+0.03);
        tube(cb, ct, 0.014, 0.005, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    // front legs (shoulder ~z0.26, splayed wide)
    sprawlLeg(V(-0.185, spY-0.03, 0.26), -0.42, 0.34, P.hide);
    sprawlLeg(V( 0.185, spY-0.03, 0.26),  0.42, 0.30, P.hide);
    // rear legs (haunch ~z-0.42, splayed wide + back)
    sprawlLeg(V(-0.200, spY-0.01, -0.42), -0.44, -0.36, P.hide);
    sprawlLeg(V( 0.200, spY-0.01, -0.42),  0.44, -0.40, P.hide);
  }

  /* ---------- TAIL — LONG + heavy at the base, tapering to a whip; as long as the body. Roots at
     the rump, sweeps back (-z) low, curving slightly to one side so it clears the rear legs. ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0.05, spY-0.06, -0.92);
    const t2 = V(0.12, spY-0.12, -1.18);
    const t3 = V(0.22, 0.20,     -1.42);
    const t4 = V(0.34, 0.13,     -1.60);
    const t5 = V(0.44, 0.085,    -1.70);
    const tip= V(0.52, 0.065,    -1.74);
    tube(t0, t1, 0.145, 0.120, 8, P.hide,    {phase:Math.PI/8, capA:{hex:P.hideDk}});
    tube(t1, t2, 0.120, 0.092, 8, P.mottleA, {phase:Math.PI/8});
    tube(t2, t3, 0.092, 0.064, 8, P.hide,    {phase:Math.PI/8});
    tube(t3, t4, 0.064, 0.040, 8, P.mottleB, {phase:Math.PI/8});
    tube(t4, t5, 0.040, 0.022, 8, P.hide,    {phase:Math.PI/8});
    tube(t5, tip,0.022, 0.008, 8, P.hideDk,  {phase:Math.PI/8, capB:{hex:P.hideDk, lift:0.006}});
    // a faint dorsal-ridge continuation on the thick tail base
    quad(V(-0.020,spY+0.12,-0.70), V(0.020,spY+0.12,-0.70), V(0.016,spY-0.02,-0.98), V(-0.016,spY-0.02,-0.98), P.ridge, 0.03);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
