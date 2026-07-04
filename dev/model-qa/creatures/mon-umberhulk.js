/* dev/model-qa/creatures/mon-umberhulk.js — the UMBER HULK (bespoke BIPEDAL ARMORED DIGGER, Large Monstrosity).
   docs/CREATURE-MODELS-P2.md Wave 2 (lifts the Wave-1 armored-burrower / arthropod-biped bases): a
   hulking bipedal digger. The read: a heavy segmented CHITIN CARAPACE torso (hunched, like the
   hook-horror's beetle-brute build), huge muscular arms ending in enormous flat DIGGING CLAWS
   (mole-like, broad and flat for tunnelling — not the hook-horror's sickle hooks), a broad
   beetle-like head with big MANDIBLES/pincers at the mouth, and a low hunched stance on thick
   stumpy legs (the bulette's stumpy-leg technique). Dark umber-brown chitin plates (VS-desaturated,
   earth-stained), lighter plate edges, bone-pale mandibles + claws. NO eye quads — its four eyes
   are a lore detail only; dark sockets, no painted eyes. Whole-object grammar: one function, one
   merged geometry frame, no anchors, no part transforms. Large size: base disc r=0.55.
   Imported by ps1-sheet.html (set=p2mon) + WHOLE_OBJECT_REGISTRY["umber-hulk"]. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildUmberHulk(){
  /* ---------- PALETTE (VS desaturated; dark umber-brown chitin, earth-stained, bone-pale mandibles/claws) ---------- */
  const P = {
    chitin:0x4a3b28, chitinDk:0x2e2418, chitinLt:0x5f4e37,       // dark umber-brown carapace
    plateEdge:0x6f5c3f, plateEdgeDk:0x453a28,                     // lighter plate rims
    joint:0x1c150e,                                               // dark joint gaps between plates
    dirt:0x5a4a30, dirtDk:0x3d3121,                               // earth-stained dirt patches (digger)
    mandible:0xc7b891, mandibleDk:0x968662, mandibleTip:0x2a2116, // bone-pale mandibles/pincers, dark tips
    claw:0xcabb95, clawDk:0x998a66,                                // bone-pale flat digging claws
    socket:0x140f0a,                                              // dark eye-socket shape (no painted eyes)
    disc:0x453d2c, discTop:0x544a35,
  };
  setChannels({
    [P.chitin]:'bone', [P.chitinDk]:'bone', [P.chitinLt]:'bone',
    [P.plateEdge]:'bone', [P.plateEdgeDk]:'bone',
    [P.mandible]:'bone', [P.mandibleDk]:'bone', [P.mandibleTip]:'bone',
    [P.claw]:'bone', [P.clawDk]:'bone',
  });

  /* ---------- LANDMARKS — hunched biped, low stance, weight forward over thick stumpy legs. Torso
     pitched forward (hook-horror-style hunch) so the carapace mass reads coiled over the digging arms. ---------- */
  const L = {
    hipY:0.60, waistY:0.72, ribY:0.86, chestY:1.00, shldY:1.12, neckY:1.16,
    hipHalf:0.185, shoulderX:0.385,
    jawY:1.08, muzzleY:1.14, browY:1.24, crownY:1.32, headTopY:1.38,
  };

  /* strong forward pitch about the hips — hunched digger carry, low + hulking */
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.30);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — segmented chitin carapace, banded plates each capped with a lighter rim. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.250, rz:0.225, hex:P.chitinDk},
      {y:L.waistY, rx:0.285, rz:0.245, hex:P.chitin},
      {y:L.ribY,   rx:0.325, rz:0.270, hex:P.chitinLt},
      {y:L.chestY, rx:0.370, rz:0.295, hex:P.chitin},         // broad hunched chest
      {y:L.shldY,  rx:0.400, rz:0.285, hex:P.chitinLt},       // huge rolled carapace shoulders
      {y:L.neckY,  rx:0.190, rz:0.170, hex:P.chitinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex);
      }
    }
    capFan(rings.at(-1), hunch(V(0, L.neckY+0.02, 0)), P.chitinDk);

    /* segmented plate rims — thin raised bands riding the torso at each seam, lighter edge color */
    for(const y of [L.waistY+0.06, L.ribY+0.065, L.chestY+0.07]){
      const rr  = ring(V(0,y,0.0), V(0,1,0), 0.33, 0.28, n, ph).map(hunch);
      const rr2 = ring(V(0,y+0.032,0.0), V(0,1,0), 0.325, 0.275, n, ph).map(hunch);
      stitch([rr,rr2], ()=>P.plateEdge);
    }
    /* dark joint-gap grooves between the main plates */
    for(const [y0,y1] of [[L.waistY,L.ribY],[L.ribY,L.chestY]]){
      const a = hunch(V(-0.022,y0,0.27)), b = hunch(V(0.022,y0,0.27));
      const c = hunch(V(0.02,y1,0.30)), d = hunch(V(-0.02,y1,0.30));
      quad(a,b,c,d,P.joint,0.04);
    }
    /* earth-stained dirt patches on flanks + back (the digger read — always caked in soil) */
    for(const [x,y,z,s] of [[-0.30,L.ribY,-0.06,0.10],[0.28,L.chestY,0.10,0.09],[0.0,L.waistY,-0.20,0.11],[-0.20,L.shldY,0.14,0.07]]){
      const p0 = hunch(V(x-s,y,z-s*0.6)), p1 = hunch(V(x+s,y,z-s*0.6));
      const p2 = hunch(V(x+s*0.8,y-0.01,z+s*0.6)), p3 = hunch(V(x-s*0.8,y-0.01,z+s*0.6));
      quad(p0,p1,p2,p3,P.dirt,0.10);
    }
  }

  /* ---------- HEAD — broad BEETLE-LIKE skull, low + jutting forward on the hunched neck. Big
     MANDIBLES/pincers at the mouth. Dark eye-sockets ONLY (four eyes = lore detail, not painted). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.175, rz:0.190, hex:P.chitin},
      {y:L.muzzleY, rx:0.205, rz:0.195, hex:P.chitinLt},
      {y:L.browY,   rx:0.195, rz:0.160, hex:P.chitin},
      {y:L.crownY,  rx:0.145, rz:0.128, hex:P.chitinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* push the muzzle/brow front verts forward for a broad, jutting beetle-skull profile */
    for(const i of [1,2]){ rings[1][i].z += 0.055; }
    for(const i of [1,2]){ rings[2][i].z += 0.035; rings[2][i].y -= 0.01; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex);
      }
    }
    capFan(rings.at(-1), hunch(V(0, L.headTopY, -0.02)), P.chitinDk);

    /* dark eye-socket shapes low on the brow/cheek — four small dark dents, no painted iris/pupil */
    for(const [sx,sy] of [[-0.09,0.02],[0.09,0.02],[-0.055,-0.015],[0.055,-0.015]]){
      const cb = hunch(V(sx, L.jawY+0.06+sy, 0.155));
      const ct = hunch(V(sx, L.jawY+0.045+sy, 0.135));
      quad(V(cb.x-0.018,cb.y,cb.z), V(cb.x+0.018,cb.y,cb.z), V(ct.x+0.014,ct.y,ct.z), V(ct.x-0.014,ct.y,ct.z), P.socket, 0.03);
    }

    /* MANDIBLES/PINCERS — two broad curved pincers projecting forward from the mouth, meeting at
       the front, bone-pale with dark tips (the signature). Built as short tapered tube chains so
       each pincer reads as a curved, blade-like mandible rather than a straight spike. */
    const buildMandible = (side)=>{
      const root = hunch(V(side*0.075, L.jawY-0.01, 0.18));
      const mid  = hunch(V(side*0.095, L.jawY-0.03, 0.34));
      const tip  = hunch(V(side*0.030, L.jawY-0.045, 0.46));   // curves INWARD toward center at the tip
      tube(root, mid, 0.062, 0.044, 6, P.mandible, {raz:0.05, rbz:0.034, capA:{hex:P.mandibleDk}});
      tube(mid, tip, 0.044, 0.010, 6, P.mandibleDk, {raz:0.034, rbz:0.008, capB:{hex:P.mandibleTip, lift:0.008}});
    };
    buildMandible(-1);
    buildMandible(1);
    /* dark mouth gap between the mandible roots */
    quad(hunch(V(-0.06,L.jawY-0.03,0.185)), hunch(V(0.06,L.jawY-0.03,0.185)),
         hunch(V(0.04,L.jawY-0.06,0.24)), hunch(V(-0.04,L.jawY-0.06,0.24)), P.joint, 0.03);
  }

  /* ---------- ARMS — huge muscular arms ending in ENORMOUS FLAT DIGGING CLAWS (mole-like, broad
     paddle-claws for tunnelling — not hooks). Held out from the hunched shoulders, elbows bent,
     forearms swinging low-forward, heavy at the shoulder. ---------- */
  const buildDigArm = (side)=>{
    const S = hunch(V(side*L.shoulderX, L.shldY-0.03, 0.0));
    const E = V(side*0.52, 0.82, 0.20);                 // elbow out + forward, heavy bulge
    const W = V(side*0.50, 0.42, 0.34);                 // wrist drops low-forward
    tube(S, E, 0.155, 0.125, 8, P.chitin,   {capA:{hex:P.chitinDk}});   // huge muscular upper arm
    tube(E, W, 0.122, 0.088, 8, P.chitinLt);                            // thick forearm
    const clawRoot = V(side*0.48, 0.34, 0.42);
    tube(W, clawRoot, 0.088, 0.078, 7, P.chitinDk);

    /* THE DIGGING CLAW — a broad, FLAT paddle-claw (mole-like) fanned from the wrist: a wide flat
       palm plate plus 4 short broad flat digging talons splayed forward, all bone-pale. */
    const palmA = V(clawRoot.x - side*0.03, 0.30, 0.46);
    const palmB = V(clawRoot.x + side*0.10, 0.28, 0.50);
    tube(clawRoot, palmA, 0.076, 0.10, 5, P.claw, {raz:0.05, rbz:0.07});
    /* flat broad palm plate (paddle read) */
    quad(V(palmA.x-side*0.07,palmA.y+0.04,palmA.z-0.05), V(palmA.x+side*0.10,palmA.y+0.04,palmA.z-0.02),
         V(palmB.x+side*0.10,palmB.y-0.02,palmB.z+0.10), V(palmB.x-side*0.07,palmB.y-0.02,palmB.z+0.08), P.claw, 0.05);
    quad(V(palmA.x-side*0.07,palmA.y-0.04,palmA.z-0.05), V(palmA.x+side*0.10,palmA.y-0.04,palmA.z-0.02),
         V(palmB.x+side*0.10,palmB.y-0.06,palmB.z+0.10), V(palmB.x-side*0.07,palmB.y-0.06,palmB.z+0.08), P.clawDk, 0.05);
    /* 4 broad flat digging talons splayed forward off the palm */
    const talonRoot = V(palmB.x, palmB.y-0.02, palmB.z+0.06);
    for(const [dx,dz] of [[side*0.11,0.09],[side*0.045,0.13],[-side*0.03,0.13],[-side*0.09,0.09]]){
      const tb = V(talonRoot.x, talonRoot.y, talonRoot.z);
      const tt = V(talonRoot.x+dx, talonRoot.y-0.03, talonRoot.z+dz);
      tube(tb, tt, 0.038, 0.014, 5, P.claw, {raz:0.05, rbz:0.018, capB:{hex:P.clawDk, lift:0.006}});
    }
  };
  buildDigArm(-1);
  buildDigArm(1);

  /* ---------- LEGS — thick, stumpy, low hunched stance (bulette-style stumpy-leg technique) planted wide. ---------- */
  {
    const buildLeg = (side)=>{
      const hip  = V(side*L.hipHalf, L.hipY-0.02, 0.0);
      const knee = V(side*0.26, 0.36, 0.10);
      const foot = V(side*0.245, 0.065, -0.02);
      tube(hip, knee, 0.150, 0.118, 8, P.chitin,   {capA:{hex:P.chitinDk}});
      tube(knee, foot, 0.116, 0.084, 8, P.chitinDk, {capB:{hex:P.chitinLt, lift:0.01}});
      /* stout clawed foot — 3 short broad claws forward */
      const heel = V(foot.x, 0.05, foot.z+0.03);
      for(const dx of [-0.06, 0, 0.06]){
        const cb = V(heel.x+dx*0.6, 0.055, heel.z);
        const ct = V(heel.x+dx, 0.014, heel.z+0.10);
        tube(cb, ct, 0.030, 0.011, 5, P.claw, {capB:{hex:P.clawDk, lift:0.006}});
      }
    };
    buildLeg(-1);
    buildLeg(1);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
