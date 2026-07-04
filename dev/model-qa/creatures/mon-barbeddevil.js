/* dev/model-qa/creatures/mon-barbeddevil.js — the BARBED DEVIL (bespoke MEDIUM biped, Fiend).
   Whole-object grammar: one function, one merged geometry frame, no anchors. The read: a lean,
   upright humanoid devil whose ENTIRE hide is studded with short jutting BARBS/spikes — shoulders,
   forearms, shins, back — like a walking sea-urchin of horn. Fanged snarling face, small backswept
   horns, a long spiked whip-tail arcing up and over. Dull desaturated red hide, darker horn/spike
   material. NO eye quads (sockets are dark recesses, not painted). Base disc r=0.42 (Medium).
   Imported by ps1-sheet.html's p2mon SET + WHOLE_OBJECT_REGISTRY (theater-figures.js). */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildBarbedDevil(){
  /* ---------- PALETTE (VS desaturated; dull mottled brick-red hide, darker horn/spike) ---------- */
  const P = {
    hide:0x7a3a30, hideDk:0x542821, hideLt:0x8f4a3c,           // dull brick-red hide, mottled
    hideGrey:0x6a3830,
    horn:0x2a2320, hornDk:0x18110f, hornLt:0x3c332e,           // dark horn/spike material
    mouth:0x1a0d0c, fang:0xcac0a8,
    claw:0x201814, sole:0x4a2820,
    tail:0x6a352c,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({ [P.hide]:'skin', [P.hideDk]:'skin', [P.hideLt]:'skin', [P.hideGrey]:'skin',
    [P.horn]:'bone', [P.hornDk]:'bone', [P.hornLt]:'bone', [P.tail]:'skin' });

  /* ---------- LANDMARKS — upright lean biped, ~1.05u tall torso+head, held inside the r0.42 disc. */
  const L = {
    hipY:0.42, waistY:0.53, ribY:0.64, chestY:0.76, shldY:0.86, neckY:0.90,
    jawY:0.94, cheekY:1.00, browY:1.06, crownY:1.14,
    hipHalf:0.115, shoulderX:0.185,
  };

  /* small forward lean so the silhouette reads aggressive, not stiff */
  const lean = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.10);
    return q.add(V(0, L.hipY, 0));
  };

  /* generic short jutting barb — a thin tapered horn tube projecting outward from a body point */
  const barb = (base, dir, len, r0)=>{
    const d = dir.clone().normalize();
    const tip = base.clone().addScaledVector(d, len);
    tube(base, tip, r0, 0.006, 4, P.horn, {capA:{hex:P.hornDk}, capB:{hex:P.hornLt, lift:0.004}});
  };

  /* ---------- TORSO — lean humanoid barrel, narrow waist to broader shoulders. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.135, rz:0.110, hex:P.hideDk},
      {y:L.waistY, rx:0.125, rz:0.100, hex:P.hide},
      {y:L.ribY,   rx:0.150, rz:0.115, hex:P.hideGrey},
      {y:L.chestY, rx:0.175, rz:0.125, hex:P.hide},
      {y:L.shldY,  rx:0.195, rz:0.130, hex:P.hideLt},
      {y:L.neckY,  rx:0.095, rz:0.085, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(lean));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), lean(V(0, L.neckY+0.03, 0)), P.hideDk);

    /* torso barbs — rows of short spikes jutting off the chest/back/shoulders */
    for(const [y,z,sgn] of [[L.chestY,0.10,1],[L.chestY-0.05,-0.10,-1],[L.ribY,0.09,1],[L.ribY,-0.09,-1],
                             [L.waistY,0.08,1],[L.waistY,-0.08,-1]]){
      const base = lean(V(0.05*sgn===0?0:0, y, z));
      barb(lean(V(0.0, y, z)), V(0, 0.4, sgn), 0.075, 0.020);
    }
    for(const s of [-1,1]){
      barb(lean(V(s*0.15, L.shldY, 0.02)), V(s, 0.5, 0), 0.09, 0.024);
      barb(lean(V(s*0.13, L.chestY, 0.06)), V(s*0.7, 0.3, 0.5), 0.07, 0.018);
    }
  }

  /* ---------- HEAD — fanged snarling face, small backswept horns, dark socket recesses. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.088, rz:0.095, hex:P.hide},
      {y:L.cheekY, rx:0.100, rz:0.098, hex:P.hideLt},
      {y:L.browY,  rx:0.092, rz:0.082, hex:P.hideDk},
      {y:L.crownY, rx:0.062, rz:0.058, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(lean));
    /* snout push forward on the jaw/cheek bands */
    for(const i of [1,2]){ rings[0][i].z += 0.045; rings[1][i].z += 0.030; }
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){ const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.08);
      }
    }
    capFan(rings.at(-1), lean(V(0, L.crownY+0.06, -0.01)), P.hideDk);

    /* dark eye-socket recesses (NO eye quads — just a sunken dark patch under the brow) */
    for(const s of [-1,1]){
      const c = lean(V(s*0.045, L.browY-0.01, 0.075));
      quad(c.clone().add(V(-0.018,-0.012,0)), c.clone().add(V(0.018,-0.012,0)),
           c.clone().add(V(0.014,0.014,-0.004)), c.clone().add(V(-0.014,0.014,-0.004)), P.hornDk, 0.02);
    }
    /* dark mouth line + jutting lower fangs */
    const mc = lean(V(0, L.jawY-0.02, 0.13));
    quad(mc.clone().add(V(-0.05,-0.014,0)), mc.clone().add(V(0.05,-0.014,0)),
         mc.clone().add(V(0.038,0.012,-0.01)), mc.clone().add(V(-0.038,0.012,-0.01)), P.mouth, 0.03);
    for(const s of [-1,1]){
      const fb = lean(V(s*0.03, L.jawY-0.03, 0.135));
      const ft = fb.clone().add(V(0, -0.05, 0.01));
      tube(fb, ft, 0.014, 0.003, 4, P.fang, {capA:{hex:P.hideDk}});
    }
    /* small backswept horns */
    for(const s of [-1,1]){
      const hb = lean(V(s*0.05, L.crownY-0.01, -0.01));
      const ht = lean(V(s*0.09, L.crownY+0.10, -0.10));
      tube(hb, ht, 0.026, 0.006, 5, P.horn, {capA:{hex:P.hornDk}, capB:{hex:P.hornLt, lift:0.004}});
    }
    /* head/face barbs — a few short spikes along the brow/cheek */
    for(const s of [-1,1]){
      barb(lean(V(s*0.08, L.cheekY, 0.03)), V(s, 0.2, -0.3), 0.05, 0.014);
    }
  }

  /* ---------- ARMS — thin clawed hands, forearms bristling with barbs. ---------- */
  {
    const armSide = (s)=>{
      const shoulder = lean(V(s*L.shoulderX, L.shldY-0.02, 0.0));
      const elbow    = V(s*0.235, L.hipY+0.14, 0.05);
      const wrist    = V(s*0.215, L.hipY-0.10, 0.10);
      tube(shoulder, elbow, 0.058, 0.044, 6, P.hide);
      tube(elbow, wrist, 0.044, 0.032, 6, P.hideDk);
      /* clawed hand — a small palm + 3 splayed claws */
      const palm = wrist.clone().add(V(s*0.01, -0.03, 0.03));
      tube(wrist, palm, 0.032, 0.026, 5, P.hideGrey, {capB:{hex:P.hideGrey}});
      for(const off of [-1,0,1]){
        const cb = palm.clone().add(V(s*0.008*off, -0.01, 0.02));
        const ct = cb.clone().add(V(s*0.014*off, -0.05, 0.05));
        tube(cb, ct, 0.013, 0.004, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
      /* forearm barbs */
      barb(elbow.clone().add(V(s*0.02,0.01,-0.01)), V(s*0.6,0.2,-0.7), 0.05, 0.014);
      barb(elbow.clone().lerp(wrist,0.5).add(V(s*0.02,0,0)), V(s*0.7,-0.1,-0.6), 0.045, 0.012);
    };
    armSide(-1); armSide(1);
  }

  /* ---------- LEGS — digitigrade-ish, shin barbs, clawed feet planted on the disc. ---------- */
  {
    const legSide = (s)=>{
      const hip  = V(s*L.hipHalf, L.hipY-0.02, 0.0);
      const knee = V(s*0.14, 0.22, 0.03);
      const ankle= V(s*0.13, 0.075, -0.01);
      tube(hip, knee, 0.075, 0.052, 6, P.hide);
      tube(knee, ankle, 0.050, 0.034, 6, P.hideDk);
      /* clawed foot */
      const heel = V(ankle.x, 0.035, ankle.z);
      const toe  = heel.clone().add(V(0, -0.01, 0.11));
      tube(heel, toe, 0.040, 0.028, 5, P.sole, {capA:{hex:P.hideDk}});
      for(const off of [-1,0,1]){
        const cb = toe.clone().add(V(s*0.012*off, -0.005, 0.01));
        const ct = cb.clone().add(V(s*0.02*off, -0.03, 0.05));
        tube(cb, ct, 0.012, 0.004, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
      /* shin barbs */
      barb(knee.clone().lerp(ankle,0.4), V(s*0.7,0.1,-0.7), 0.045, 0.013);
      barb(knee.clone().add(V(0,-0.01,0)), V(s*0.5,0.3,-0.6), 0.04, 0.012);
    };
    legSide(-1); legSide(1);
  }

  /* ---------- TAIL — long spiked whip-tail rooted at the base of the spine, arcing up + over. --- */
  {
    const t0 = lean(V(0, L.hipY+0.01, -0.10));
    const t1 = V(-0.03, L.ribY+0.10, -0.24);
    const t2 = V(-0.02, L.shldY+0.28, -0.20);
    const t3 = V( 0.05, L.crownY+0.30, -0.04);
    const t4 = V( 0.12, L.crownY+0.20,  0.14);
    const tip= V( 0.16, L.crownY+0.06,  0.24);
    tube(t0, t1, 0.075, 0.055, 6, P.tail, {capA:{hex:P.hideDk}});
    tube(t1, t2, 0.055, 0.038, 6, P.tail);
    tube(t2, t3, 0.038, 0.024, 6, P.tail);
    tube(t3, t4, 0.024, 0.014, 6, P.tail);
    /* barbed stinger tip — a small cluster of horn spikes */
    tube(t4, tip, 0.014, 0.005, 5, P.horn, {capA:{hex:P.hornDk}});
    for(const [du,dv] of [[0.05,0.03],[-0.04,0.03],[0,0.06]]){
      const b2 = tip.clone().add(V(du*0.4, dv*0.2, 0));
      const t2p = b2.clone().add(V(du, dv, 0.02));
      tube(b2, t2p, 0.010, 0.003, 4, P.horn, {capB:{hex:P.hornLt, lift:0.003}});
    }
    /* a few spine barbs along the tail's outer curve */
    for(const p of [t1,t2,t3]) barb(p, V(0.5,0.3,-0.3), 0.05, 0.013);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
