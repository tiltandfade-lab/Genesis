/* dev/model-qa/creatures/mon-hydra.js — the HYDRA (bespoke FIVE-NECKED REPTILE, Huge Monstrosity).
   CREATURE-MODELS-P2 §5 Wave 2 brief: a broad crocodilian/dragon BODY carried on four stout legs,
   and FIVE long serpentine NECKS rising and splaying outward from the shoulders, each ending in a
   snapping reptilian wedge HEAD (jaws, bone teeth). The signature read: five heads fanned like a
   bouquet at different heights/angles. A thick tail trails behind. Bruised swamp-green scaly hide
   (VS-desaturated), paler throats, dark maws, bone teeth. NO eye quads. The necks stay inside the
   r=0.68 base-disc footprint by rising UP more than sprawling OUT (per the brief).
   Whole-object grammar: one function, one merged geometry frame, no anchors, no part transforms.
   Necks are authored per mon-snake.js's technique — a serpentine chain of tapered tubes lofted
   along a curved centerline path, one call per neck via a shared buildNeck() helper so five necks
   share one grammar but differ in path/height/angle (the "fanned bouquet" variation). */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildHydra(){
  /* ---------- PALETTE (VS desaturated — bruised swamp-green scaly hide, paler throats) ---------- */
  const P = {
    hide:0x555c3e, hideDk:0x3a4029, hideLt:0x6b7250,           // bruised swamp-green hide
    mottleA:0x4a5034, mottleB:0x616a46,                         // dorsal mottle bands
    belly:0x8a8a68, bellyDk:0x6c6c50,                           // pale throat/belly
    ridge:0x2c3020,                                             // dark dorsal ridge scutes
    maw:0x201a16, gum:0x432026,                                 // dark maw interior, dusky gumline
    tooth:0xc7bd9e, toothDk:0xa89d80,                           // bone-pale teeth
    claw:0x221d17, disc:0x4a4038, discTop:0x585047,
  };
  setChannels({ [P.hide]:"scale", [P.hideDk]:"scale", [P.hideLt]:"scale",
    [P.mottleA]:"scale", [P.mottleB]:"scale",
    [P.tooth]:"bone", [P.toothDk]:"bone" });

  /* ================= BODY — broad crocodilian barrel, low horizontal spine ================= */
  const spY = 0.30;
  const S = {
    tailBase: V(0, spY-0.02, -0.62),
    rump:     V(0, spY+0.03, -0.42),
    loin:     V(0, spY+0.05, -0.18),
    mid:      V(0, spY+0.06,  0.06),
    shldr:    V(0, spY+0.04,  0.30),
  };
  tube(S.rump,  S.loin,  0.260, 0.295, 10, P.hide,    {phase:Math.PI/10, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.295, 0.310, 10, P.mottleA, {phase:Math.PI/10});
  tube(S.mid,   S.shldr, 0.310, 0.280, 10, P.hide,    {phase:Math.PI/10});

  /* pale belly strip low on the flanks */
  {
    const by = spY-0.27;
    quad(V(-0.20,by,-0.38), V(0.20,by,-0.38), V(0.18,by+0.02,0.30), V(-0.18,by+0.02,0.30), P.belly, 0.05);
  }
  /* dorsal ridge scutes down the spine */
  {
    const seg = [[-0.40,spY+0.29],[-0.14,spY+0.32],[0.10,spY+0.32],[0.30,spY+0.28]];
    for(let i=0;i<seg.length-1;i++){
      const [z0,y0]=seg[i], [z1,y1]=seg[i+1];
      quad(V(-0.032,y0,z0), V(0.032,y0,z0), V(0.027,y1,z1), V(-0.027,y1,z1), P.ridge, 0.04);
      quad(V(-0.016,y0,z0), V(0.016,y0,z0), V(0,y0+0.05,z0-0.01), V(0,y0+0.05,z0-0.01), P.ridge, 0.03);
    }
  }

  /* ================= LEGS — four stout sprawling-crocodilian legs ================= */
  {
    const sprawlLeg=(shoulder, footX, footZ, hex)=>{
      const elbowX = shoulder.x + Math.sign(shoulder.x)*0.22;
      const elbow = V(elbowX, spY-0.12, shoulder.z + (footZ>shoulder.z?0.05:-0.05));
      const foot  = V(footX, 0.05, footZ);
      tube(shoulder, elbow, 0.115, 0.088, 8, hex);
      tube(elbow, foot, 0.086, 0.058, 7, P.hideDk, {capB:{hex:P.hideDk, lift:0.008}});
      const pad = V(foot.x, 0.03, foot.z+0.03);
      const side = Math.sign(foot.x||1);
      for(const [dx,dz] of [[side*0.07,0.02],[side*0.035,0.07],[-side*0.01,0.08],[-side*0.045,0.06]]){
        const cb = V(pad.x, 0.035, pad.z);
        const ct = V(pad.x+dx, 0.010, pad.z+dz+0.03);
        tube(cb, ct, 0.017, 0.006, 4, P.claw, {capB:{hex:P.claw, lift:0.005}});
      }
    };
    sprawlLeg(V(-0.22, spY-0.02, 0.28), -0.48, 0.36, P.hide);
    sprawlLeg(V( 0.22, spY-0.02, 0.28),  0.48, 0.32, P.hide);
    sprawlLeg(V(-0.24, spY-0.00, -0.40), -0.50, -0.34, P.hide);
    sprawlLeg(V( 0.24, spY-0.00, -0.40),  0.50, -0.38, P.hide);
  }

  /* ================= TAIL — thick, tapering, trailing behind ================= */
  {
    const t0 = S.tailBase;
    const t1 = V(0.04, spY-0.05, -0.86);
    const t2 = V(0.10, spY-0.10, -1.08);
    const t3 = V(0.16, spY-0.14, -1.28);
    const t4 = V(0.22, spY-0.16, -1.42);
    const tip= V(0.28, spY-0.17, -1.52);
    tube(t0, t1, 0.185, 0.148, 8, P.hide,    {phase:Math.PI/8, capA:{hex:P.hideDk}});
    tube(t1, t2, 0.148, 0.108, 8, P.mottleA, {phase:Math.PI/8});
    tube(t2, t3, 0.108, 0.068, 8, P.hide,    {phase:Math.PI/8});
    tube(t3, t4, 0.068, 0.036, 8, P.mottleB, {phase:Math.PI/8});
    tube(t4, tip,0.036, 0.012, 8, P.hideDk,  {phase:Math.PI/8, capB:{hex:P.hideDk, lift:0.006}});
    quad(V(-0.024,spY+0.16,-0.68), V(0.024,spY+0.16,-0.68), V(0.019,spY+0.02,-0.94), V(-0.019,spY+0.02,-0.94), P.ridge, 0.03);
  }

  /* ================= FIVE NECKS — serpentine tube chains fanning out from the shoulders =================
     Each neck is a lofted chain of tapered rings along a short curved path (mon-snake.js technique,
     compressed): rises from a shoulder root, bows through 2-3 control points, ends at a wedge head.
     The five roots are spread laterally across the shoulder line; each path leans a different
     compass direction + reaches a different height/angle so the heads fan like a bouquet, while
     staying within the r=0.68 disc (rise dominates over sprawl, per the brief). */
  const NECK_R = 0.088, HEAD_R = 0.100;

  function buildNeck(root, ctrl, tipDir, hexA, hexB){
    /* root: V at shoulder; ctrl: array of {p,r} control points (the bows); last ctrl point is the
       head-base. tipDir: forward axis the head points along (already normalized-ish). */
    const path = [{p:root, r:NECK_R*1.15}, ...ctrl];
    const NSEG = 8;
    const rings = [];
    for(let i=0;i<path.length;i++){
      const cur = path[i];
      const nxt = path[Math.min(i+1, path.length-1)].p;
      const prv = path[Math.max(i-1, 0)].p;
      const axis = new THREE.Vector3().subVectors(nxt, prv).normalize();
      rings.push(ring(cur.p ?? cur, axis, cur.r, cur.r*0.94, NSEG, Math.PI/NSEG));
    }
    const colFn = (b) => (b%2===0) ? hexA : hexB;
    stitch(rings, colFn);
    capFan(rings[0], root.clone().add(V(0,-0.02,0)), P.hideDk, true);

    /* ---------- HEAD — small wedge on the neck end, jaws + bone teeth, NO eyes ---------- */
    const headBase = path[path.length-1].p;
    const headPrev = path[path.length-2].p;
    const FWD = new THREE.Vector3().subVectors(headBase, headPrev).normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), FWD).normalize();
    const up = new THREE.Vector3().crossVectors(FWD, side).normalize();
    const seg = (along, offY=0) => headBase.clone().addScaledVector(FWD, along).addScaledVector(up, offY);
    const ell = (c, w, h, n=8) => {
      const pts=[];
      for(let k=0;k<n;k++){ const a=Math.PI/n + k/n*Math.PI*2;
        pts.push(c.clone().addScaledVector(side, Math.cos(a)*w).addScaledVector(up, Math.sin(a)*h)); }
      return pts;
    };
    const rBack  = ell(seg(-0.030), HEAD_R*0.78, HEAD_R*0.66);
    const rCheek = ell(seg( 0.020, -0.006), HEAD_R*0.92, HEAD_R*0.68);
    const rMid   = ell(seg( 0.075, -0.014), HEAD_R*0.66, HEAD_R*0.46);
    const rSnout = ell(seg( 0.130, -0.020), HEAD_R*0.34, HEAD_R*0.24);
    stitch([rBack, rCheek, rMid, rSnout], (b)=> b===1 ? P.hideLt : P.hide);
    const snoutTip = seg(0.165, -0.026);
    capFan(rSnout, snoutTip, P.hideDk);
    capFan(rBack, seg(-0.055), P.hideDk, true);

    /* jaw / mouth line */
    {
      const m0 = seg(0.040, -0.028); const m1 = seg(0.150, -0.020);
      quad(m0.clone().addScaledVector(side,0.026), m1.clone().addScaledVector(side,0.012),
           m1.clone().addScaledVector(side,-0.012), m0.clone().addScaledVector(side,-0.026), P.maw, 0.03);
      quad(m0.clone().addScaledVector(side,0.030).addScaledVector(up,-0.010),
           m1.clone().addScaledVector(side,0.014).addScaledVector(up,-0.008),
           m1.clone().addScaledVector(side,-0.014).addScaledVector(up,-0.008),
           m0.clone().addScaledVector(side,-0.030).addScaledVector(up,-0.010), P.gum, 0.03);
    }
    /* bone teeth — small cones along both jaw edges pointing inward */
    {
      const jawPts = [0.055, 0.090, 0.122].map(al=>seg(al, -0.024));
      for(const jp of jawPts){
        for(const s of [-1,1]){
          const baseP = jp.clone().addScaledVector(side, s*0.020);
          const tip = jp.clone().addScaledVector(side, s*0.006).addScaledVector(up,-0.032);
          tube(baseP, tip, 0.012, 0.002, 4, P.tooth, {capA:{hex:P.toothDk}});
        }
      }
    }
  }

  /* --- five roots spread along the shoulder line, each fanning a different direction/height ---
     Root x spans the shoulder width; each neck bows up+out then curls its head inward/forward so
     five heads read as distinct, splayed like a bouquet, all landing inside r=0.68. F1 fix pass:
     the first cut clustered all five necks into one blobby hump (heads too close, not enough
     height/lateral spread). This pass pushes each neck TALLER (0.95-1.55u), gives outer necks a
     wide lateral splay early (so they clear the body silhouette before curling back inward), and
     staggers heights so five heads land at clearly different levels — the bouquet read. */
  const rootY = spY + 0.10;
  const roots = [
    V(-0.22, rootY, 0.26),   // far left
    V(-0.11, rootY, 0.32),   // left
    V( 0.00, rootY, 0.36),   // center (tallest)
    V( 0.11, rootY, 0.32),   // right
    V( 0.22, rootY, 0.26),   // far right
  ];
  /* per-neck control chains: {p, r} — each climbs steeply then splays laterally outward before its
     head curls back in toward center, so necks separate visually before the heads converge. */
  const chains = [
    [ {p:V(-0.34, 0.42, 0.16), r:NECK_R*1.08}, {p:V(-0.48, 0.66, 0.02), r:NECK_R*0.90},
      {p:V(-0.52, 0.92, -0.06), r:NECK_R*0.72}, {p:V(-0.44, 1.10, -0.06), r:NECK_R*0.58},
      {p:V(-0.34, 1.20, -0.02), r:HEAD_R*0.92} ],
    [ {p:V(-0.20, 0.62, 0.32), r:NECK_R*1.08}, {p:V(-0.28, 0.94, 0.30), r:NECK_R*0.88},
      {p:V(-0.26, 1.24, 0.28), r:NECK_R*0.70}, {p:V(-0.16, 1.40, 0.26), r:NECK_R*0.56},
      {p:V(-0.06, 1.46, 0.24), r:HEAD_R*0.92} ],
    [ {p:V( 0.00, 0.72, 0.42), r:NECK_R*1.08}, {p:V( 0.03, 1.08, 0.46), r:NECK_R*0.88},
      {p:V( 0.00, 1.44, 0.50), r:NECK_R*0.70}, {p:V(-0.02, 1.62, 0.48), r:NECK_R*0.56},
      {p:V(-0.02, 1.70, 0.44), r:HEAD_R*0.92} ],
    [ {p:V( 0.20, 0.62, 0.32), r:NECK_R*1.08}, {p:V( 0.28, 0.94, 0.30), r:NECK_R*0.88},
      {p:V( 0.26, 1.24, 0.28), r:NECK_R*0.70}, {p:V( 0.16, 1.40, 0.26), r:NECK_R*0.56},
      {p:V( 0.06, 1.46, 0.24), r:HEAD_R*0.92} ],
    [ {p:V( 0.34, 0.42, 0.16), r:NECK_R*1.08}, {p:V( 0.48, 0.66, 0.02), r:NECK_R*0.90},
      {p:V( 0.52, 0.92, -0.06), r:NECK_R*0.72}, {p:V( 0.44, 1.10, -0.06), r:NECK_R*0.58},
      {p:V( 0.34, 1.20, -0.02), r:HEAD_R*0.92} ],
  ];
  for(let i=0;i<5;i++){
    buildNeck(roots[i], chains[i], null, i%2===0 ? P.hide : P.mottleB, P.mottleA);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
