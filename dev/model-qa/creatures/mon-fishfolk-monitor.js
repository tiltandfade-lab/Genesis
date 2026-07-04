/* dev/model-qa/creatures/mon-fishfolk-monitor.js — FISH-FOLK MONITOR (whole-object grammar).
   Hunched piscine humanoid ambusher/guard: fish head with gill slits, scaled hide, webbed hands,
   armed with a barbed TRIDENT/spear held ready in one fist. Grey-green mottled scales, pale dirty
   throat/belly. One function, one merged geometry frame, no anchors, no part-object transforms —
   every part authored directly in world space (mon-lizard.js / mon-bugbear.js convention). NO eye
   quads (sockets are dark recesses only). Medium, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildFishFolkMonitor(){
  /* ---------- PALETTE (VS-desaturated; dirty grey-green scale, pale mottled throat) ---------- */
  const P = {
    scale:0x5a6a5c, scaleDk:0x384238, scaleLt:0x748069,      // grey-green scaled hide
    mottleA:0x4c5a4e, mottleB:0x63705f,                       // dorsal mottle bands
    belly:0x8c9080, bellyDk:0x686f5f,                         // pale dirty throat/belly
    fin:0x455449, finDk:0x2c3730,                             // dorsal/finlet membrane
    gill:0x6e3a3a, gillDk:0x3a1e1e,                           // dark red gill slits
    socket:0x14140f,                                          // dark eye socket recess
    claw:0x201d16, web:0x51604f,                               // webbed hand membrane
    haft:0x4a4030, haftDk:0x2e281c,                            // trident wood haft
    tine:0x8b8f8a, tineDk:0x53564f, tineLt:0xa8aca6,           // iron trident tines
    lash:0x362c1e,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.scale]:'scale',[P.scaleDk]:'scale',[P.scaleLt]:'scale',
    [P.mottleA]:'scale',[P.mottleB]:'scale',
    [P.belly]:'skin',[P.bellyDk]:'skin',
    [P.fin]:'leather',[P.finDk]:'leather',
    [P.haft]:'wood',[P.haftDk]:'wood',
    [P.tine]:'metal',[P.tineDk]:'metal',[P.tineLt]:'metal',
  });

  /* ---------- LANDMARKS — hunched biped, low crouch, spine pitched forward. ---------- */
  const L = {
    hipY:0.62, waistY:0.72, chestY:0.86, shldY:0.96, neckY:1.02,
    jawY:1.05, muzzleY:1.10, browY:1.18, crownY:1.26,
    hipHalf:0.115, shoulderX:0.225,
  };
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.22);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TRIDENT — authored FIRST, held low + ready in the right fist. ---------- */
  const GRIP = V(0.30, 0.66, 0.10);
  const CTOP = V(0.40, 1.30, 0.34);
  const HAFT = new THREE.Vector3().subVectors(CTOP, GRIP).normalize();
  const BUTT = GRIP.clone().addScaledVector(HAFT, -0.34);
  {
    tube(BUTT, BUTT.clone().addScaledVector(HAFT,0.05), 0.022,0.020,6,P.lash,{capA:{hex:P.haftDk,lift:0.015}});
    tube(BUTT.clone().addScaledVector(HAFT,0.05), GRIP.clone().addScaledVector(HAFT,-0.08), 0.020,0.022,6,P.haft);
    tube(GRIP.clone().addScaledVector(HAFT,-0.08), GRIP.clone().addScaledVector(HAFT,0.08), 0.026,0.026,6,P.lash);
    tube(GRIP.clone().addScaledVector(HAFT,0.08), CTOP, 0.022,0.026,6,P.haft,{capB:{hex:P.haftDk,lift:0.015}});
    /* barbed tines — center spike + two curved outer tines, all iron */
    const up=V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up, HAFT).normalize();
    const cTip = CTOP.clone().addScaledVector(HAFT,0.30);
    tube(CTOP, cTip, 0.026,0.006,5,P.tine,{capB:{hex:P.tineLt,lift:0.01}});
    for(const barb of [0.06,0.13]){
      const bb = CTOP.clone().addScaledVector(HAFT, barb*0.9);
      for(const s of [-1,1]){
        tube(bb, bb.clone().addScaledVector(u,s*0.03).addScaledVector(HAFT,0.03), 0.010,0.003,4,P.tineDk);
      }
    }
    for(const s of [-1,1]){
      const base = CTOP.clone().addScaledVector(u, s*0.055);
      const mid  = base.clone().addScaledVector(u, s*0.05).addScaledVector(HAFT,0.16);
      const tip  = mid.clone().addScaledVector(u, s*0.015).addScaledVector(HAFT,0.13);
      tube(base, mid, 0.020,0.012,4,P.tine);
      tube(mid, tip, 0.012,0.004,4,P.tine,{capB:{hex:P.tineLt,lift:0.008}});
      // small backward barb on each outer tine
      const barbBase = mid.clone();
      const barbTip = barbBase.clone().addScaledVector(u,s*0.02).addScaledVector(HAFT,-0.05);
      tube(barbBase, barbTip, 0.008,0.002,4,P.tineDk);
    }
  }

  /* ---------- TORSO — scaled, mottled bands, hunched forward. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.150, rz:0.125, hex:P.scaleDk},
      {y:L.waistY, rx:0.170, rz:0.140, hex:P.scale},
      {y:L.chestY, rx:0.205, rz:0.160, hex:P.mottleA},
      {y:L.shldY,  rx:0.230, rz:0.155, hex:P.scaleLt},
      {y:L.neckY,  rx:0.120, rz:0.110, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), hunch(V(0,L.neckY+0.03,0)), P.scaleDk);

    /* pale belly/throat strip */
    const b1=hunch(V(-0.06,L.hipY,0.12)), b2=hunch(V(0.06,L.hipY,0.12));
    const b3=hunch(V(0.10,L.chestY,0.15)), b4=hunch(V(-0.10,L.chestY,0.15));
    quad(b1,b2,b3,b4,P.belly,0.05);

    /* small dorsal finlets running the spine */
    for(const [y,rx] of [[L.waistY,0.03],[L.chestY,0.04],[L.shldY-0.02,0.035]]){
      const c=hunch(V(0,y,-0.14));
      quad(c, c.clone().add(V(0.02,0,0)), c.clone().add(V(0.015,rx+0.05,-0.03)), c.clone().add(V(-0.015,rx+0.05,-0.03)), P.fin, 0.06);
    }
  }

  /* ---------- HEAD — fish head: broad flat skull, gill slits, dark socket recesses, blunt muzzle. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,    rx:0.115, rz:0.130, hex:P.scale},
      {y:L.muzzleY, rx:0.125, rz:0.145, hex:P.scaleLt},
      {y:L.browY,   rx:0.118, rz:0.110, hex:P.mottleB},
      {y:L.crownY,  rx:0.085, rz:0.078, hex:P.scaleDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(hunch));
    /* push muzzle/jaw fronts out for a blunt fish snout */
    for(const i of [1,2]){ rings[0][i].z += 0.05; rings[1][i].z += 0.06; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings.at(-1), hunch(V(0,L.crownY+0.05,-0.01)), P.scaleDk);

    /* dark socket recesses (no eye quads — carved-in hollows via a dark inset pair) */
    for(const s of [-1,1]){
      const c=hunch(V(s*0.075, L.browY-0.005, 0.10));
      quad(c.clone().add(V(-0.018,-0.014,0)), c.clone().add(V(0.018,-0.014,0)),
           c.clone().add(V(0.014,0.014,-0.01)), c.clone().add(V(-0.014,0.014,-0.01)), P.socket, 0.0);
    }
    /* mouth line */
    {
      const m1=hunch(V(-0.06,L.jawY-0.03,0.185)), m2=hunch(V(0.06,L.jawY-0.03,0.185));
      const m3=hunch(V(0.05,L.jawY-0.045,0.20)), m4=hunch(V(-0.05,L.jawY-0.045,0.20));
      quad(m1,m2,m3,m4,P.gillDk,0.04);
    }
    /* GILL SLITS — three dark-red angled slats on each cheek */
    for(const s of [-1,1]){
      for(const dy of [-0.03,0.0,0.03]){
        const cb=hunch(V(s*0.115, L.jawY+dy, 0.05));
        const ct=hunch(V(s*0.125, L.jawY+dy+0.035, 0.02));
        quad(cb, cb.clone().add(V(0,0,0.02)), ct.clone().add(V(0,0,0.02)), ct, s>0?P.gill:P.gillDk, 0.05);
      }
    }
  }

  /* ---------- ARMS — right derives to trident grip; left hangs with webbed hand. ---------- */
  const webbedHand=(ctr, faceDir, hex)=>{
    const d=faceDir.clone().normalize();
    const side=new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.03), ctr.clone().addScaledVector(d,0.03), 0.048,0.042,6,hex);
    /* webbing membrane fan between splayed fingers */
    const palmEdge = ctr.clone().addScaledVector(d,0.03);
    for(const off of [-1.4,-0.5,0.5,1.4]){
      const fb = palmEdge.clone().addScaledVector(side, off*0.026);
      const ft = fb.clone().addScaledVector(d,0.055).addScaledVector(side, off*0.01);
      tube(fb, ft, 0.012,0.005,4,hex,{capB:{hex:P.claw,lift:0.004}});
    }
    for(const off of [-1,0,1]){
      const w1=palmEdge.clone().addScaledVector(side,(off-0.45)*0.026);
      const w2=palmEdge.clone().addScaledVector(side,(off+0.45)*0.026);
      const w3=w2.clone().addScaledVector(d,0.045);
      const w4=w1.clone().addScaledVector(d,0.045);
      quad(w1,w2,w3,w4,P.web,0.05);
    }
  };
  {
    const S=hunch(V(L.shoulderX, L.shldY-0.01, 0.02));
    const E=V(0.36, 0.82, 0.10);
    tube(S,E,0.068,0.055,6,P.scale);
    tube(E, GRIP.clone().addScaledVector(HAFT,-0.05), 0.053,0.044,6,P.mottleA);
    tube(GRIP.clone().addScaledVector(HAFT,-0.06), GRIP.clone().addScaledVector(HAFT,0.05), 0.050,0.046,6,P.web,{capA:{hex:P.web},capB:{hex:P.web}});

    const S2=hunch(V(-L.shoulderX, L.shldY-0.01, 0.02));
    const E2=V(-0.335, 0.78, 0.12);
    const W2=V(-0.30, 0.56, 0.20);
    tube(S2,E2,0.068,0.055,6,P.scale);
    tube(E2,W2,0.053,0.044,6,P.mottleA);
    webbedHand(W2, V(-0.1,-0.6,1), P.web);
  }

  /* ---------- LEGS — bent crouch, webbed feet. ---------- */
  {
    const hipL=V(-L.hipHalf,L.hipY-0.02,0.02), kneeL=V(-0.155,0.34,0.13), ankL=V(-0.145,0.06,0.05);
    const hipR=V( L.hipHalf,L.hipY-0.02,0.00), kneeR=V( 0.165,0.34,0.10), ankR=V( 0.155,0.06,0.02);
    tube(hipL,kneeL,0.088,0.062,6,P.scale);
    tube(kneeL,ankL,0.060,0.042,6,P.mottleA);
    tube(hipR,kneeR,0.088,0.062,6,P.scale);
    tube(kneeR,ankR,0.060,0.042,6,P.mottleA);
    for(const [ank,dir] of [[ankL,V(-0.08,0,1)],[ankR,V(0.08,0,1)]]){
      const d=dir.clone().normalize();
      const heel=V(ank.x,0.036,ank.z);
      tube(heel.clone().addScaledVector(d,-0.015), heel.clone().addScaledVector(d,0.11), 0.052,0.040,5,P.web,
        {raz:0.048,rbz:0.034,capA:{hex:P.mottleA}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.10).addScaledVector(side, off*0.032);
        const tt=tb.clone().addScaledVector(d,0.035).addScaledVector(side, off*0.006);
        tube(tb,tt,0.013,0.005,4,P.web,{capB:{hex:P.claw,lift:0.004}});
      }
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
