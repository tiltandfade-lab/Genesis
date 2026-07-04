/* dev/model-qa/creatures/mon-empyrean.js — the EMPYREAN (bespoke HUGE biped, celestial demigod).
   Whole-object grammar: one function, one merged geometry frame, no anchors. The read: a
   towering, muscular, CROWNED demigod — bronzed radiant skin (VS desaturated, luminous, never
   candy), simple regal garb (a draped sash/kilt, no armor fuss), wielding a GREAT MAUL slung
   over one shoulder. No wings (bestiary flavor covered elsewhere; silhouette here is pure titan).
   NO eye quads — sockets are dark recesses only. Base disc r=0.68 (Huge). Built off the mon-ogre.js
   humanoid stack/tube grammar, scaled taller + leaner (regal titan, not a slumped brute). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildEmpyrean(){
  /* ---------- PALETTE (VS desaturated; bronzed radiant skin, dull gold trim, muted regal cloth) --- */
  const P = {
    skin:0xa8794a, skinDk:0x7a5636, skinLt:0xbf9066, skinMot:0x93683f,   // bronzed radiant hide
    gold:0x8f7a44, goldDk:0x6a5a30, goldLt:0xab9660,                     // dull worn gold (crown/trim)
    cloth:0x5e4a5c, clothDk:0x40334a, clothLt:0x745e70,                  // muted regal violet-grey sash
    maulHead:0x554d48, maulHeadDk:0x39332f, haft:0x4a3a28, haftDk:0x342818,
    hair:0x3a3028, hairDk:0x25201a,
    socket:0x1c1712,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — HUGE titan. Tall, upright, broad — regal not slumped. ~2.9u tall. ------ */
  const L = {
    hipY:1.10, waistY:1.30, ribY:1.56, chestY:1.82, shldY:2.00, neckY:2.10,
    hipHalf:0.230, shoulderX:0.520,
    jawY:2.18, cheekY:2.30, browY:2.42, crownY:2.54, headTopY:2.62,
  };
  /* a slight proud upright lean (chest forward, not slumped) about the hips */
  const stand = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), -0.035);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- GREAT MAUL FIRST — slung over the right shoulder, fist gripping the haft low. -------- */
  const GRIP = V(0.62, 1.62, 0.34);
  const HTOP = V(0.20, 2.86, -0.62);
  const HAFT = new THREE.Vector3().subVectors(HTOP, GRIP).normalize();
  const BUTT = GRIP.clone().addScaledVector(HAFT, -0.30);
  {
    tube(BUTT, GRIP.clone().addScaledVector(HAFT,-0.06), 0.036, 0.042, 7, P.haftDk, {capA:{hex:P.haftDk, lift:0.015}});
    tube(GRIP.clone().addScaledVector(HAFT,-0.06), GRIP.clone().addScaledVector(HAFT,0.10), 0.044, 0.046, 7, P.haft); // grip wrap
    tube(GRIP.clone().addScaledVector(HAFT,0.10), HTOP.clone().addScaledVector(HAFT,-0.34), 0.040, 0.052, 7, P.haftDk); // long haft
    /* maul head — a big blunt double-faced block at the top of the haft */
    const headC = HTOP.clone().addScaledVector(HAFT, -0.20);
    const up=V(0,1,0), u=new THREE.Vector3().crossVectors(up,HAFT).normalize(), w=new THREE.Vector3().crossVectors(HAFT,u).normalize();
    const hb1 = ring(headC.clone().addScaledVector(HAFT,-0.16), HAFT, 0.150, 0.150, 8);
    const hb2 = ring(headC.clone().addScaledVector(HAFT, 0.16), HAFT, 0.150, 0.150, 8);
    stitch([hb1,hb2], ()=>P.maulHead);
    capFan(hb1, headC.clone().addScaledVector(HAFT,-0.24), P.maulHeadDk, true);
    capFan(hb2, headC.clone().addScaledVector(HAFT, 0.24), P.maulHeadDk);
    /* a couple of dull rivets girdling the maul head */
    for(const along of [-0.08, 0.08]){
      const c = headC.clone().addScaledVector(HAFT, along);
      const r1 = ring(c.clone().addScaledVector(HAFT,-0.02), HAFT, 0.153, 0.153, 8);
      const r2 = ring(c.clone().addScaledVector(HAFT, 0.02), HAFT, 0.153, 0.153, 8);
      stitch([r1,r2], ()=>P.maulHeadDk);
    }
  }

  /* ---------- TORSO — broad, upright, heroically muscular (chest widest, waist tapers). ---------- */
  stack([
    {y:L.hipY,   rx:0.290, rz:0.260, hex:P.skinDk},
    {y:L.waistY, rx:0.320, rz:0.280, hex:P.skin},
    {y:L.ribY,   rx:0.390, rz:0.320, hex:P.skinLt},
    {y:L.chestY, rx:0.460, rz:0.340, hex:P.skin},        // widest — broad heroic chest
    {y:L.shldY,  rx:0.500, rz:0.310, hex:P.skinLt},      // shoulders flare
    {y:L.neckY,  rx:0.230, rz:0.210, hex:P.skinDk},
  ], 8, {xform:stand, capTop:{hex:P.skinDk, lift:0.008}});

  /* mottled radiant patches — subtle luminous mottle on chest/shoulder (never candy) */
  for(const [y,rx,rz,cx,hex] of [
    [L.chestY-0.04, 0.150, 0.120, -0.16, P.skinMot],
    [L.ribY+0.03,   0.130, 0.110,  0.18, P.skinLt],
  ]){
    const rings=[
      ring(V(cx,y-0.05,0.06), V(0,1,0), rx*0.85, rz*0.85, 7, Math.PI/7).map(stand),
      ring(V(cx,y+0.05,0.06), V(0,1,0), rx, rz, 7, Math.PI/7).map(stand),
    ];
    stitch(rings, ()=>hex);
    capFan(rings[1], stand(V(cx,y+0.11,0.06)), hex);
  }

  /* ---------- REGAL SASH/KILT — simple draped cloth from waist to mid-thigh, one shoulder strap. --- */
  stack([
    {y:0.78, rx:0.310, rz:0.270, hex:P.clothDk},
    {y:0.96, rx:0.300, rz:0.260, hex:P.cloth},
    {y:L.hipY-0.02, rx:0.295, rz:0.265, hex:P.clothLt},
  ], 8, {xform:stand});
  {
    const a=stand(V(-0.14, L.chestY+0.05, 0.30)), b=stand(V(0.16, L.hipY+0.02, 0.32));
    tube(a, b, 0.040, 0.034, 5, P.cloth);
  }
  /* a few draped folds at the kilt hem */
  for(const [sx,sz,w] of [[-0.22,0.22,0.11],[0.05,0.28,0.13],[0.26,0.20,0.10]]){
    const top=stand(V(sx,0.82,sz)), botL=stand(V(sx-w*0.4,0.60,sz)), botR=stand(V(sx+w*0.4,0.58,sz));
    quad(top, botL, botR, top, P.clothDk, 0.05);
  }

  /* ---------- HEAD — noble, proud, strong-jawed; dark socket recesses (no eye quads); CROWNED. ---- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.175, rz:0.170, hex:P.skinLt},
      {y:L.cheekY, rx:0.185, rz:0.178, hex:P.skin},       // strong cheekbones — widest band
      {y:L.browY,  rx:0.165, rz:0.155, hex:P.skinDk},     // brow pulls in slightly
      {y:L.crownY, rx:0.140, rz:0.130, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.02), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(stand));
    /* noble straight nose bridge — modest forward push on cheek/brow front verts */
    for(const i of [1,2]){ rings[1][i].z += 0.030; rings[2][i].z += 0.026; }
    /* dark socket recesses — pull brow front-side verts slightly IN + shadow via darker band already set */
    for(const i of [0,3]){ rings[2][i].z += 0.006; }
    /* strong jaw juts slightly forward, squared */
    for(const i of [1,2]) rings[0][i].z += 0.020;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.06);
      }
    }
    capFan(rings[3], stand(V(0, L.headTopY-0.06, 0.00)), P.skinDk);

    /* dark socket recess quads — small inset dark patches where eyes would be, NOT eye quads */
    for(const s of [-1,1]){
      const c = stand(V(s*0.075, L.browY-0.010, 0.150));
      const a = c.clone().add(V(-0.032,0.018,0)), b2 = c.clone().add(V(0.032,0.018,0));
      const d = c.clone().add(V(0.028,-0.018,0.01)), e = c.clone().add(V(-0.028,-0.018,0.01));
      quad(a,b2,d,e,P.socket,0.02);
    }

    /* small ears — modest, dignified (not brute nubs) */
    for(const s of [-1,1]){
      const eb = stand(V(s*0.175, L.cheekY, 0.00));
      const et = stand(V(s*0.205, L.cheekY+0.045, -0.04));
      tube(eb, et, 0.038, 0.020, 5, P.skin, {raz:0.026, rbz:0.014, capA:{hex:P.skinDk}, capB:{hex:P.skinDk, lift:0.003}});
    }

    /* short groomed dark hair at the back/base of the crown */
    {
      for(const [dx,dz,len] of [[-0.04,-0.06,0.09],[0.03,-0.07,0.10],[0.0,-0.09,0.08]]){
        const base=stand(V(dx, L.crownY-0.02, dz-0.06)), tip=base.clone().add(V(dx*0.3,-0.03,-len));
        tube(base, tip, 0.020, 0.006, 4, P.hair, {capA:{hex:P.hairDk}, capB:{hex:P.hairDk, lift:0.003}});
      }
    }

    /* ---------- CROWN — a simple banded gold circlet with a few peaks, worn low on the brow. ------ */
    {
      const cB = ring(stand(V(0,L.browY+0.045,0.00)), V(0,1,0), 0.175, 0.165, n, ph).map(p=>p);
      const cT = ring(stand(V(0,L.browY+0.095,0.00)), V(0,1,0), 0.170, 0.160, n, ph).map(p=>p);
      stitch([cB,cT], ()=>P.gold);
      /* crown peaks — alternate points rising off the band */
      for(let i=0;i<n;i+=2){
        const base = cT[i];
        const tip = base.clone().add(V(0,0.075,0));
        tube(base, tip, 0.022, 0.006, 4, P.goldLt, {capB:{hex:P.goldDk, lift:0.004}});
      }
    }
  }

  /* ---------- ARMS — heroic, muscular. Right raised to the maul grip; left hangs, fist loose. ----- */
  const fist = (ctr, faceDir, hex)=>{
    const d = faceDir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.058), ctr.clone().addScaledVector(d,0.058),
         0.100, 0.088, 6, hex, {raz:0.070, rbz:0.070, capA:{hex}, capB:{hex}});
    for(const off of [-1.1,0,1.1]){
      const kb = ctr.clone().addScaledVector(d,0.052).addScaledVector(side, off*0.058);
      const kt = kb.clone().addScaledVector(d,0.078).addScaledVector(side, off*0.014);
      tube(kb, kt, 0.026, 0.009, 4, hex, {capB:{hex:P.skinDk, lift:0.005}});
    }
  };
  {
    /* right arm -> maul grip (raised, shouldering the haft) */
    const S=stand(V(L.shoulderX, L.shldY-0.02, 0.03));
    const E=V(0.660, 1.98, 0.22);
    tube(S,E,0.135,0.108,6,P.skin);
    tube(E, GRIP.clone().addScaledVector(HAFT,-0.05), 0.104,0.086,6,P.skinLt);
    tube(GRIP.clone().addScaledVector(HAFT,-0.08), GRIP.clone().addScaledVector(HAFT,0.08), 0.090,0.084,6,P.skinLt,
         {capA:{hex:P.skinLt}, capB:{hex:P.skinLt}});

    /* left arm -> hangs at ease, loose fist */
    const S2=stand(V(-L.shoulderX, L.shldY-0.02, 0.03));
    const E2=V(-0.590, 1.48, 0.10);
    const W2=V(-0.560, 1.02, 0.10);
    tube(S2,E2,0.135,0.108,6,P.skin);
    tube(E2,W2,0.104,0.084,6,P.skinDk);
    fist(W2, V(0,-0.65,0.45), P.skinLt);
  }

  /* ---------- LEGS — long, strong, planted stance. Simple bare sandal-wrapped feet. ---------- */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.03, 0.02), kneeL=V(-0.290,0.62,0.10), ankL=V(-0.300,0.14,0.05);
    const hipR=V( L.hipHalf, L.hipY-0.03, 0.00), kneeR=V( 0.290,0.62,-0.04), ankR=V( 0.300,0.14,-0.08);
    tube(hipL,kneeL,0.170,0.128,6,P.skin);
    tube(kneeL,ankL,0.120,0.088,6,P.skinDk);
    tube(hipR,kneeR,0.170,0.128,6,P.skin);
    tube(kneeR,ankR,0.120,0.088,6,P.skinDk);
    /* sandal-wrapped feet — low foot slab + a gold ankle strap */
    for(const [ank,toeDir] of [[ankL,V(-0.06,0,1)], [ankR,V(0.08,0,1)]]){
      const d=toeDir.clone().normalize();
      const heel=V(ank.x,0.070,ank.z);
      tube(heel.clone().addScaledVector(d,-0.02), heel.clone().addScaledVector(d,0.190), 0.095,0.070,6,P.skinDk,
           {raz:0.084, rbz:0.058, capA:{hex:P.skinDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.175).addScaledVector(side, off*0.058);
        const tt=tb.clone().addScaledVector(d,0.050).addScaledVector(side, off*0.008);
        tube(tb, tt, 0.026,0.010,4,P.skinDk,{capB:{hex:P.skinDk, lift:0.005}});
      }
      /* gold ankle strap */
      const sb = ring(V(ank.x,0.135,ank.z), V(0,1,0), 0.100, 0.078, 6);
      const st = ring(V(ank.x,0.165,ank.z), V(0,1,0), 0.098, 0.076, 6);
      stitch([sb,st], ()=>P.gold);
    }
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 18);
    const r2=ring(V(0,0.058,0), V(0,1,0), 0.66, 0.66, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.061,0), P.discTop);
  }
}
