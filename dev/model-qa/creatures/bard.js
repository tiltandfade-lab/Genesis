/* dev/model-qa/creatures/bard.js — the traveling performer landmark table (whole-object probe).
   Same whole-object grammar as humanoid.js/mage.js/cleric_fable.js: the ENTIRE creature is one
   function of shared primitives, every vertex in one model frame, no anchors. The LUTE is authored
   FIRST — pear body, angled neck, tuning-peg block — so BOTH hands derive from it (strumming hand
   to the strings over the soundhole, fret hand gripping the neck partway up). Silhouette-first: a
   jaunty feathered cap, a short half-cape off one shoulder only, a fitted doublet + tall boots, and
   one knee bent for a relaxed performer's stance — the most casual figure of the twelve.
   Imported by both whole-body-probe.html (render) and export-obj.mjs (Blender export). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildBard(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    doublet:0x7a3b3f, doubletDk:0x5c2c2f, doubletLt:0x8f4a4d,
    linen:0xcfc4a6, linenDk:0x8d846c,
    skin:0xc49a72, skinDk:0x8a6a4e, eye:0x1a1512,
    leather:0x4e3d2a, leatherDk:0x3a2d1f,
    cape:0x3f5b63, capeDk:0x2c4147,
    boot:0x3c3226, trouser:0x53433a,
    wood:0xa3703f, woodDk:0x7a4e2a, string:0xd8cfa8,
    cap:0x384d63, capDk:0x293a4c, feather:0xb54a3a, featherDk:0x7d3226,
    brass:0xb08d46, disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS (lean performer, ~4.6 heads; relaxed stance) ---------- */
  const L = {
    hipY:0.71, waistY:0.79, ribY:0.90, chestY:1.01, shldY:1.09, neckY:1.135,
    hipHalf:0.105, shoulderX:0.230,
    jawY:1.165, cheekY:1.24, browY:1.315, crownY:1.405, headTopY:1.465,
  };

  /* ===================== LUTE FIRST — ground truth both hands meet ===================== */
  /* Body sits low-left across the torso front, neck angles up-right past the right shoulder,
     tuning-peg block near the head. Pear body = a squashed blob; neck = a tapered tube. */
  const LU_BODY = V(-0.10, 0.62, 0.30);          // pear-body center
  const LU_NECKBASE = V(0.02, 0.94, 0.24);       // where neck leaves the body
  const LU_PEGBOX = V(0.235, 1.30, 0.155);       // tuning-peg block, up past the right shoulder
  const NDIR = new THREE.Vector3().subVectors(LU_PEGBOX, LU_NECKBASE).normalize();
  const STRUM = LU_BODY.clone().add(V(0.065, 0.075, 0.145));   // right hand: over the soundhole
  const FRET  = LU_NECKBASE.clone().addScaledVector(NDIR, 0.62); // left hand: partway up the neck
  {
    /* pear body: a blob, wider at the bottom, waisted above (lute figure-eight read from a single
       blob is enough at this poly budget — the neck+pegbox carry the rest of the silhouette) */
    blob(LU_BODY.x, LU_BODY.y - 0.075, LU_BODY.z, 0.145, 0.145, 0.075, P.woodDk, 8, 5);
    blob(LU_BODY.x, LU_BODY.y + 0.095, LU_BODY.z + 0.01, 0.105, 0.110, 0.065, P.wood, 8, 4);
    /* soundhole (a small dark ring inlay on the front face) */
    {
      const oc = LU_BODY.clone().add(V(0.01, 0.01, 0.078));
      const n=8, rO=ring(oc, V(0,0,1), 0.040, 0.040, n), rI=ring(oc.clone().add(V(0,0,-0.006)), V(0,0,1), 0.026,0.026,n);
      stitch([rI, rO], ()=>P.woodDk);
      capFan(rI, oc.clone().add(V(0,0,-0.012)), 0x1e1712);
    }
    /* neck: tapered tube, body -> pegbox (slender — a lute neck, not a plank) */
    tube(LU_NECKBASE, LU_PEGBOX.clone().addScaledVector(NDIR,-0.03), 0.020, 0.015, 6, P.wood);
    /* fretboard strip (dark, hugging the +z surface of the neck tube — thin, not proud) */
    {
      const up = V(0,1,0), nu = new THREE.Vector3().crossVectors(up,NDIR).normalize(),
            nv = new THREE.Vector3().crossVectors(NDIR,nu).normalize();
      const a=LU_NECKBASE.clone().addScaledVector(nv,0.018), b=LU_PEGBOX.clone().addScaledVector(NDIR,-0.03).addScaledVector(nv,0.013);
      quad(a.clone().addScaledVector(nu,0.010), a.clone().addScaledVector(nu,-0.010),
           b.clone().addScaledVector(nu,-0.007), b.clone().addScaledVector(nu,0.007), P.woodDk, 0.02);
    }
    /* tuning-peg block: a small squared-off box with 4 peg nubs */
    {
      const c = LU_PEGBOX;
      const up=V(0,1,0), nu=new THREE.Vector3().crossVectors(up,NDIR).normalize(), nv=new THREE.Vector3().crossVectors(NDIR,nu).normalize();
      const bx=0.018, by=0.010, bz=0.036;
      const cnr=(a,b,cc)=>c.clone().addScaledVector(nu,a*bx).addScaledVector(nv,b*by).addScaledVector(NDIR,cc*bz);
      quad(cnr(-1,1,-1),cnr(1,1,-1),cnr(1,1,1),cnr(-1,1,1), P.woodDk, 0.03);
      quad(cnr(-1,-1,-1),cnr(-1,-1,1),cnr(1,-1,1),cnr(1,-1,-1), P.woodDk, 0.03);
      quad(cnr(-1,-1,-1),cnr(-1,1,-1),cnr(-1,1,1),cnr(-1,-1,1), P.wood, 0.03);
      quad(cnr(1,-1,-1),cnr(1,-1,1),cnr(1,1,1),cnr(1,1,-1), P.wood, 0.03);
      capFan(ring(c.clone().addScaledVector(NDIR,0.040), NDIR, 0.019,0.019,6), c.clone().addScaledVector(NDIR,0.052), P.woodDk);
      for(const s of [-1,1]) for(const t of [-1,1]){
        const pc = c.clone().addScaledVector(nu, s*0.019).addScaledVector(NDIR, t*0.013);
        tube(pc, pc.clone().addScaledVector(nu, s*0.013), 0.005,0.006,5, P.brass, {capB:{hex:P.brass}});
      }
    }
    /* strings: thin ribbons body -> pegbox, painted pale */
    {
      const up=V(0,1,0), nu=new THREE.Vector3().crossVectors(up,NDIR).normalize();
      for(const off of [-0.045,-0.015,0.015,0.045]){
        const a = LU_BODY.clone().add(V(0.01,0.09,0.075)).addScaledVector(nu, off*0.62);
        const b = LU_PEGBOX.clone().addScaledVector(nu, off*0.42).addScaledVector(NDIR,-0.02);
        tube(a,b, 0.004,0.004,4, P.string);
      }
    }
  }

  /* ===================== TORSO (fitted doublet, hips -> neck) ===================== */
  stack([
    {y:L.hipY,   rx:0.170, rz:0.128, hex:P.doubletDk},
    {y:L.waistY, rx:0.148, rz:0.112, hex:P.doublet},
    {y:L.ribY,   rx:0.172, rz:0.130, hex:P.doublet},
    {y:L.chestY, rx:0.195, rz:0.142, hex:P.doubletLt},
    {y:L.shldY,  rx:0.198, rz:0.130, hex:P.doublet},
    {y:L.neckY,  rx:0.078, rz:0.072, hex:P.linenDk},
  ], 8, {capTop:{hex:P.linenDk, lift:0.004}});

  /* short fitted skirt-flare at the hip (doublet hem, not a mage robe) */
  stack([
    {y:0.58, rx:0.205, rz:0.165, hex:P.doubletDk},
    {y:0.70, rx:0.182, rz:0.140, hex:P.doublet},
  ], 8, {});

  /* belt + small buckle */
  stack([
    {y:0.735, rx:0.160, rz:0.122, hex:P.leather},
    {y:0.775, rx:0.157, rz:0.119, hex:P.leather},
  ], 8, {});
  quad(V(-0.028,0.740,0.128), V(0.028,0.740,0.128), V(0.028,0.772,0.124), V(-0.028,0.772,0.124), P.brass, 0.02);

  /* laced placket down the doublet front (+z), alternating trim so it reads as fitted tailoring */
  {
    const zs=[[L.chestY,0.150],[0.92,0.160],[L.waistY,0.118],[0.74,0.148]];
    for(let i=0;i<zs.length-1;i++){
      const [y1,z1]=zs[i], [y2,z2]=zs[i+1];
      quad(V(-0.018,y1,z1), V(0.018,y1,z1), V(0.018,y2,z2), V(-0.018,y2,z2), i%2?P.linen:P.linenDk, 0.03);
    }
  }

  /* ===================== HALF-CAPE — off ONE shoulder only (the left) ===================== */
  {
    const n=7, ph=Math.PI/n;
    /* a curved panel hanging from the left shoulder down the back-left, asymmetric on purpose.
       Top band widened + recentered so its arc actually overlaps the torso's shoulder ring
       (rx 0.198/rz 0.130 at L.shldY) instead of floating as a small disc off to the side —
       that overlap is what makes the fabric read as fastened AT the shoulder/neck seam rather
       than hovering behind it. */
    const shoulderAnchor = V(-L.shoulderX+0.02, L.shldY+0.02, -0.02);
    const capeBands = [
      {y:L.shldY+0.045, cx:-0.10,             cz:-0.03, rx:0.185, rz:0.140},
      {y:0.88,         cx:-0.26,             cz:-0.09, rx:0.16, rz:0.12},
      {y:0.62,         cx:-0.28,             cz:-0.14, rx:0.20, rz:0.13},
      {y:0.40,         cx:-0.27,             cz:-0.17, rx:0.22, rz:0.13},
    ];
    /* build as a one-sided sheet: front face + back face (thin cloth, both faces visible) */
    const arc = [0,1,2,3,4,5,6].map(i=>{           // 7 points sweeping the back-left quarter only
      const t = i/6, ang = Math.PI*0.55 + t*Math.PI*0.65;               // sweeps back-left arc
      return ang;
    });
    const rowsFront = capeBands.map(b=> arc.map(a=>
      V(b.cx + Math.cos(a)*b.rx, b.y, b.cz + Math.sin(a)*b.rz)
    ));
    for(let r=0;r<rowsFront.length-1;r++){
      for(let i=0;i<arc.length-1;i++){
        const a=rowsFront[r][i], b2=rowsFront[r][i+1], c=rowsFront[r+1][i+1], d=rowsFront[r+1][i];
        quad(a,b2,c,d, r%2?P.cape:P.capeDk, 0.05);
        quad(d,c,b2,a, r%2?P.capeDk:P.cape, 0.05);   // back face (reverse winding, slightly darker read)
      }
    }
    /* shoulder yoke — a short connective strip pinning the cape's leading (front-most) top-band
       edge directly to the tunic's shoulder ring so no gap shows between garment and cloth;
       this is the fastened seam the clasp below sits on top of. */
    {
      const capeEdge = rowsFront[0][0];              // front-most vertex of the cape's top band
      const tunicPt  = V(-L.shoulderX+0.01, L.shldY+0.01, -0.01); // torso's shoulder-ring surface
      quad(tunicPt, capeEdge, capeEdge.clone().add(V(0,-0.05,0)), tunicPt.clone().add(V(0,-0.04,0.02)),
           P.capeDk, 0.03);
    }
    /* clasp at the shoulder */
    quad(V(-L.shoulderX-0.01,L.shldY+0.05,0.02), V(-L.shoulderX+0.05,L.shldY+0.05,0.00),
         V(-L.shoulderX+0.05,L.shldY+0.01,0.00), V(-L.shoulderX-0.01,L.shldY+0.01,0.02), P.brass, 0.02);
  }

  /* ===================== HEAD (skin loft; nose pushed; eyes painted) ===================== */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.078, rz:0.084, hex:P.skin},
      {y:L.cheekY, rx:0.108, rz:0.104, hex:P.skin},
      {y:L.browY,  rx:0.112, rz:0.102, hex:P.skin},
      {y:L.crownY, rx:0.086, rz:0.078, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.011), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.021;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY, 0.007), P.skinDk);
    /* eyes — two SMALL intentional quads flanking the nose, proud of the face surface (the
       house ruling: small + deliberate, not a shaded full-band eye poly that reads as a void). */
    for(const s of [-1,1]){
      const ex=s*0.050, ey=(L.cheekY+L.browY)/2-0.004, ez=0.120;
      quad(V(ex-0.013,ey-0.009,ez), V(ex+0.013,ey-0.009,ez),
           V(ex+0.013,ey+0.011,ez-0.006), V(ex-0.013,ey+0.011,ez-0.006), P.eye, 0.0);
    }
  }

  /* ===================== JAUNTY FEATHERED CAP — brim + one big angled feather ===================== */
  {
    const n=9, ph=Math.PI/n;
    /* soft cap crown, tilted slightly (offset centers as it rises). Sits ABOVE the brow with
       clearance so the brim underside can't shadow the eyes below (the earlier defect). */
    const capBands=[
      {y:L.browY+0.045, rx:0.122, rz:0.116, cx:0.0,   cz:0.0},
      {y:L.browY+0.09,  rx:0.116, rz:0.109, cx:0.006, cz:-0.006},
      {y:L.crownY+0.04, rx:0.094, rz:0.086, cx:0.016, cz:-0.014},
      {y:L.crownY+0.11, rx:0.056, rz:0.050, cx:0.026, cz:-0.024},
    ];
    const rings = capBands.map(b=>ring(V(b.cx,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, ()=>P.cap);
    capFan(rings.at(-1), V(0.032,L.crownY+0.145,-0.03), P.capDk);
    /* the brim: a flat disc ring flaring at the base, upturned on one side (jaunty). Narrower +
       higher than before, and its dark underside cap-fan sits just under the crown ring — well
       clear of the browline/eyes below. */
    const brimOut = ring(V(0,L.browY+0.04,0.0), V(0,1,0), 0.150, 0.140, n, ph).map((p,i)=>{
      if(i===1||i===2) p.y += 0.024;     // front verts of this ring flip up — the jaunty snap-brim
      return p;
    });
    const brimIn = ring(V(0,L.browY+0.048,0.0), V(0,1,0), 0.098, 0.092, n, ph);
    stitch([brimIn, brimOut], ()=>P.capDk);
    capFan(brimOut, V(0,L.browY+0.035,0.0), P.capDk, true);
    /* ONE big feather quad, canted up-back off the left side of the brim */
    {
      const root = V(-0.115, L.browY+0.06, -0.05);
      const tip  = root.clone().add(V(-0.06, 0.34, -0.10));
      const mid  = root.clone().lerp(tip,0.5).add(V(-0.025,0.01,-0.01));
      const w = 0.045;
      const side = new THREE.Vector3().crossVectors(V(0,1,0), tip.clone().sub(root)).normalize();
      quad(root.clone().addScaledVector(side,w*0.5), mid.clone().addScaledVector(side,w*0.32),
           tip.clone(), mid.clone().addScaledVector(side,-w*0.32).add(V(0,0,0)), P.feather, 0.05);
      quad(root.clone().addScaledVector(side,-w*0.5), mid.clone().addScaledVector(side,-w*0.32),
           tip.clone(), mid.clone().addScaledVector(side,w*0.32), P.featherDk, 0.05);
      /* quill spine */
      tube(root, tip, 0.008,0.003,4, P.featherDk);
    }
  }

  /* ===================== ARMS — RIGHT strums, LEFT frets. Both derive from the lute. ============ */
  {
    /* right: shoulder -> elbow -> wrist at STRUM, hand nub past that over the strings.
       Fitted doublet sleeve (slim, NOT a bell sleeve) — kept narrow so it doesn't visually
       merge with the lute neck's diagonal; a linen cuff band marks the wrist transition. */
    const S=V(L.shoulderX, L.shldY-0.01, 0.02);
    const E=V(0.235, 0.845, 0.19);
    tube(S,E,0.058,0.044,6,P.doublet);
    tube(E,STRUM.clone().add(V(-0.01,0.02,-0.02)),0.040,0.032,6,P.doubletDk,{capB:{hex:P.linenDk}});
    tube(STRUM.clone().add(V(-0.03,-0.01,0.01)), STRUM.clone().add(V(0.03,0.03,0.03)), 0.036,0.032,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});

    /* left: shoulder -> elbow -> wrist at FRET, hand nub wrapping the neck. Same slim fitted
       sleeve treatment as the right arm (kept thin so it reads apart from the lute neck). */
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02);
    const E2=V(-0.16, 0.92, 0.12);
    tube(S2,E2,0.058,0.044,6,P.doublet);
    tube(E2,FRET.clone().add(V(0.0,0.0,-0.02)),0.040,0.032,6,P.doubletDk,{capB:{hex:P.linenDk}});
    tube(FRET.clone().addScaledVector(NDIR,-0.05), FRET.clone().addScaledVector(NDIR,0.05), 0.034,0.030,6,P.skin,
         {capA:{hex:P.skin}, capB:{hex:P.skin}});
  }

  /* ===================== LEGS — one knee bent (relaxed performer's stance) ===================== */
  {
    /* left leg: straight, weight-bearing */
    const hipL=V(-L.hipHalf, L.hipY-0.01, 0.01), kneeL=V(-0.135,0.40,0.03), ankL=V(-0.14,0.085,0.015);
    tube(hipL,kneeL,0.072,0.052,6,P.trouser);
    tube(kneeL,ankL,0.050,0.038,6,P.trouser);
    /* right leg: bent + kicked slightly forward, casual weight-off stance */
    const hipR=V( L.hipHalf, L.hipY-0.01, 0.00), kneeR=V( 0.205,0.44,0.145), ankR=V( 0.165,0.085,0.075);
    tube(hipR,kneeR,0.072,0.052,6,P.trouser);
    tube(kneeR,ankR,0.050,0.038,6,P.trouser);
    /* tall boots — both legs, higher shaft than the fighter's ankle boot */
    for(const [ank,toeDir] of [[ankL,V(0.05,0,1)], [ankR,V(0.55,0,0.85).normalize()]]){
      stack([
        {y:0.012, rx:0.062, rz:0.070, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.10,  rx:0.056, rz:0.058, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.24,  rx:0.062, rz:0.060, cx:ank.x, cz:ank.z, hex:P.leatherDk},
        {y:0.34,  rx:0.066, rz:0.062, cx:ank.x, cz:ank.z, hex:P.boot},
      ], 6, {capTop:{hex:P.boot, lift:0.006}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.128), 0.052,0.040,6,P.boot, {capB:{hex:P.boot, lift:0.014}, raz:0.046, rbz:0.032});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
