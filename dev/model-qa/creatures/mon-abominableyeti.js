/* dev/model-qa/creatures/mon-abominableyeti.js — the ABOMINABLE YETI (bespoke bipedal ape-man,
   Huge). Wave-2 monstrosity. The read: a HUGE shaggy white-furred hunched ape-man — massive long
   arms with big clawed hands hanging near the ankles, a broad fanged snarling face, thick ice-blue
   under-white fur (VS desaturated, mottled dirty-white/grey, never candy-white), bone-pale claws
   and fangs. Whole-object grammar: one function, one geometry frame, no anchors. NO eye quads —
   sockets are dark recesses only. Huge size: base disc r=0.68. Rear/rise stays in +y (hunched,
   not sprawled) to keep the whole hulking mass over its disc footprint. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildAbominableYeti(){
  /* ---------- PALETTE (VS desaturated; dirty ice-blue-white fur, darker undercoat, bone claws) ---------- */
  const P = {
    fur:0xaab0ac, furLt:0xc4c8c2, furDk:0x767c76,        // dirty ice-white fur, wide value spread
    under:0x585e5c, underDk:0x3c413f,                     // darker undercoat in the cavities
    hide:0x6a6862, hideDk:0x4a4844,                       // bare hide (palms, muzzle, ears)
    bone:0xcfc8ab, boneDk:0x9a9478,                        // bone claws/fangs
    mouth:0x2a201c, gum:0x6e3d3a,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.fur]:'fur', [P.furLt]:'fur', [P.furDk]:'fur',
    [P.under]:'fur', [P.underDk]:'fur',
    [P.hide]:'skin', [P.hideDk]:'skin',
    [P.bone]:'bone', [P.boneDk]:'bone',
  });

  /* ---------- LANDMARKS — hunched HUGE ape frame, spine pitched forward, mass held over origin. --- */
  const hipY=0.62, waistY=0.86, chestY=1.14, shldY=1.34, neckY=1.42, headY=1.52, crownY=1.78;
  const shoulderX=0.44, hipHalf=0.30;

  /* ---------- TORSO — a broad barrel loft, hunched (front verts pulled up/forward as we rise). --- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:hipY,   rx:0.320, rz:0.290, hex:P.furDk, zk:-0.02},
      {y:waistY, rx:0.360, rz:0.320, hex:P.fur,   zk: 0.00},
      {y:chestY, rx:0.430, rz:0.380, hex:P.furLt, zk: 0.06},   // barrel chest, bulges forward
      {y:shldY,  rx:0.470, rz:0.360, hex:P.fur,   zk: 0.08},   // huge rolled shoulders
      {y:neckY,  rx:0.230, rz:0.210, hex:P.furDk, zk: 0.05},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.zk), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* dark undercoat strip down the belly (cavity between legs, reads as depth not flat) */
    for(let b=0;b<rings.length-1;b++){
      quad(rings[b][0], rings[b][1], rings[b+1][1], rings[b+1][0], P.under, 0.08);
    }
  }

  /* shaggy tuft quads riding the shoulders + back — breaks the smooth-loft silhouette */
  for(const s of [-1,1]){
    for(const [y,len,zk] of [[shldY+0.05,0.16,-0.10],[shldY-0.05,0.13,-0.16],[chestY+0.08,0.11,-0.06]]){
      const base=V(s*0.40, y, zk);
      quad(base, base.clone().add(V(s*0.06,len,-0.04)), base.clone().add(V(s*0.11,len*0.55,-0.09)), base, s>0?P.furDk:P.fur, 0.08);
    }
  }

  /* ---------- HEAD — broad, fanged, snarling. Dark socket recesses (no eye quads). ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:headY,        rx:0.230, rz:0.230, hex:P.fur},     // heavy jaw/cheek mass
      {y:headY+0.12,   rx:0.255, rz:0.235, hex:P.furLt},   // broad brow
      {y:crownY-0.08,  rx:0.205, rz:0.190, hex:P.fur},     // skull pulling in
      {y:crownY,       rx:0.130, rz:0.120, hex:P.furDk},   // domed crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.05), V(0,1,0), b.rx, b.rz, n, ph));
    /* push the muzzle/brow front verts forward for a jutting snarling face */
    for(const i of [1,2]) rings[0][i].z += 0.10;
    for(const i of [1,2]){ rings[1][i].z += 0.06; rings[1][i].y -= 0.01; }
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, crownY+0.12, 0.02), P.furDk);

    /* dark brow-shadowed eye SOCKETS (recess, not painted eyes) */
    for(const s of [-1,1]){
      const c=V(s*0.09, headY+0.15, 0.235);
      quad(c.clone().add(V(-0.045,-0.03,0)), c.clone().add(V(0.045,-0.03,0)),
           c.clone().add(V(0.035,0.03,-0.02)), c.clone().add(V(-0.035,0.03,-0.02)), P.underDk, 0.02);
    }

    /* broad bare-hide muzzle pad + snarling open mouth with fangs */
    const muz = V(0, headY-0.06, 0.30);
    quad(muz.clone().add(V(-0.14,0.05,0)), muz.clone().add(V(0.14,0.05,0)),
         muz.clone().add(V(0.10,-0.10,-0.05)), muz.clone().add(V(-0.10,-0.10,-0.05)), P.hide, 0.05);
    quad(V(-0.11,headY-0.06,0.32), V(0.11,headY-0.06,0.32), V(0.09,headY-0.16,0.26), V(-0.09,headY-0.16,0.26), P.mouth, 0.04);
    quad(V(-0.10,headY-0.10,0.31), V(0.10,headY-0.10,0.31), V(0.08,headY-0.145,0.27), V(-0.08,headY-0.145,0.27), P.gum, 0.05);
    /* fangs — bone-pale tapered tubes jutting from the upper jaw */
    for(const s of [-1,1]){
      const fb=V(s*0.075, headY-0.08, 0.315), ft=V(s*0.085, headY-0.155, 0.30);
      tube(fb, ft, 0.024, 0.006, 4, P.bone, {capB:{hex:P.boneDk, lift:0.004}});
    }
    /* nostril pits high on the muzzle */
    for(const s of [-1,1]) quad(V(s*0.028-0.012,headY+0.02,0.335), V(s*0.028+0.012,headY+0.02,0.335),
                                V(s*0.028+0.010,headY+0.05,0.320), V(s*0.028-0.010,headY+0.05,0.320), P.underDk, 0.0);
    /* small rounded ears set back on the sides */
    for(const s of [-1,1]){
      const eb=V(s*0.205, headY+0.16, -0.02), et=V(s*0.255, headY+0.30, -0.06);
      tube(eb, et, 0.052, 0.020, 5, P.fur, {raz:0.034, rbz:0.014, capA:{hex:P.furDk}, capB:{hex:P.furDk, lift:0.006}});
    }
  }

  /* ---------- ARMS — massive, disproportionately LONG; big clawed hands hang near the ankles. --- */
  const bigHand=(ctr, faceDir, hex)=>{
    const d=faceDir.clone().normalize();
    const side=new THREE.Vector3().crossVectors(V(0,1,0), d).normalize();
    tube(ctr.clone().addScaledVector(d,-0.06), ctr.clone().addScaledVector(d,0.06),
         0.115, 0.100, 7, hex, {raz:0.075, rbz:0.075, capA:{hex}, capB:{hex}});
    for(const off of [-1.4,-0.5,0.5,1.4]){
      const kb=ctr.clone().addScaledVector(d,0.055).addScaledVector(side, off*0.055);
      const kt=kb.clone().addScaledVector(d,0.095).addScaledVector(side, off*0.018);
      tube(kb, kt, 0.026, 0.008, 4, hex, {capB:{hex:P.bone, lift:0.006}});
    }
  };
  {
    const S1=V(-shoulderX, shldY-0.03, 0.06), E1=V(-0.62, 0.98, 0.18), W1=V(-0.56, 0.52, 0.24), H1=V(-0.52, 0.20, 0.28);
    tube(S1,E1,0.185,0.150,8,P.fur);
    tube(E1,W1,0.150,0.115,8,P.furDk);
    tube(W1,H1,0.115,0.095,7,P.under);
    bigHand(H1, V(-0.10,-0.4,1), P.hide);

    const S2=V( shoulderX, shldY-0.03, 0.06), E2=V( 0.64, 0.94, 0.20), W2=V( 0.58, 0.50, 0.26), H2=V( 0.54, 0.19, 0.30);
    tube(S2,E2,0.185,0.150,8,P.fur);
    tube(E2,W2,0.150,0.115,8,P.furDk);
    tube(W2,H2,0.115,0.095,7,P.under);
    bigHand(H2, V(0.10,-0.4,1), P.hide);

    /* forearm shag tufts */
    for(const E of [E1,E2]){
      const s=Math.sign(E.x);
      const base=E.clone().add(V(s*0.02,-0.02,-0.06));
      quad(base, base.clone().add(V(s*0.05,0.10,-0.04)), base.clone().add(V(s*0.09,0.05,-0.07)), base, P.furLt, 0.08);
    }
  }

  /* ---------- LEGS — thick, bent in a hunched crouch, broad clawed feet planted wide. ---------- */
  {
    const hipL=V(-hipHalf, hipY-0.03, 0.02), kneeL=V(-0.34,0.36,0.18), ankL=V(-0.30,0.11,0.08);
    const hipR=V( hipHalf, hipY-0.03, 0.00), kneeR=V( 0.36,0.36,0.16), ankR=V( 0.32,0.11,0.06);
    tube(hipL,kneeL,0.230,0.170,7,P.fur);
    tube(kneeL,ankL,0.165,0.120,7,P.furDk);
    tube(hipR,kneeR,0.230,0.170,7,P.fur);
    tube(kneeR,ankR,0.165,0.120,7,P.furDk);
    for(const [ank,toeDir] of [[ankL,V(-0.10,0,1)],[ankR,V(0.10,0,1)]]){
      const d=toeDir.clone().normalize();
      const heel=V(ank.x,0.075,ank.z);
      tube(heel.clone().addScaledVector(d,-0.03), heel.clone().addScaledVector(d,0.20), 0.130,0.095,7,P.hide,
           {raz:0.110, rbz:0.078, capA:{hex:P.hideDk}});
      const side=new THREE.Vector3().crossVectors(V(0,1,0),d).normalize();
      for(const off of [-1,0,1]){
        const tb=heel.clone().addScaledVector(d,0.19).addScaledVector(side, off*0.07);
        const tt=tb.clone().addScaledVector(d,0.07).addScaledVector(side, off*0.012);
        tube(tb, tt, 0.032,0.008,4,P.hide,{capB:{hex:P.bone, lift:0.006}});
      }
    }
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.060,0), V(0,1,0), 0.65, 0.65, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.063,0), P.discTop);
  }
}
