/* dev/model-qa/creatures/mon-arcanaloth.js — the ARCANALOTH (yugoloth fiend-sorcerer, jackal-headed).
   Whole-object grammar: one function, one merged geometry frame, NO anchors. The read: a robed
   humanoid with a long-snouted JACKAL/wolf head, pointed ears, holding a bound TOME low in front —
   a scheming devil-lawyer, not a beast. Grey-tan mangy fur on the head/hands, a heavy dark robe
   swallowing the body (only head, hands, and a hem of clawed feet show). VS-desaturated, mottled —
   NO eye quads (dark socket recesses only). Medium size, base disc r=0.42.
   Imported by ps1-sheet.html's p2mon set. */
import { V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildArcanaloth(){
  /* ---------- PALETTE (VS desaturated; grey-tan mangy fur, deep dirty robe) ---------- */
  const P = {
    fur:0x8a8270, furDk:0x59543f, furLt:0xa39c82,             // grey-tan jackal fur
    muzzle:0x726a52, muzzleDk:0x423d2c, nose:0x201c16,
    socket:0x171310,                                          // dark eye socket recess (no eye quad)
    fang:0xc9c2a8,
    robe:0x2e2a30, robeDk:0x1c1a1e, robeLt:0x423c44,           // rich dark robe, mottled
    trim:0x574a34, trimDk:0x362d20,                            // tarnished trim/cording
    hand:0x746c56, handDk:0x4a4636, claw:0x1e1a15,
    book:0x4a3524, bookDk:0x2c2013, page:0x9c8f6c,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.fur]:'fur', [P.furDk]:'fur', [P.furLt]:'fur',
    [P.muzzle]:'fur', [P.muzzleDk]:'fur',
    [P.robe]:'cloth', [P.robeDk]:'cloth', [P.robeLt]:'cloth',
    [P.book]:'leather', [P.bookDk]:'leather',
    [P.hand]:'skin', [P.handDk]:'skin',
  });

  /* ---------- LANDMARKS — upright robed frame, ~1.55u tall crown, kept near +y over the disc. ---------- */
  const L = {
    hemY:0.03, kneeY:0.34, hipY:0.70, waistY:0.92, chestY:1.14, shldY:1.26, neckY:1.31,
    jawY:1.34, muzzleTipZ:0.235, browY:1.44, crownY:1.53, topY:1.585,
  };

  /* ---------- ROBE — the whole lower body: a wide flared cone from hem to shoulders, mottled dark. */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:L.hemY,   rx:0.360, rz:0.330, hex:P.robeDk},   // wide hem, pools at the floor
      {y:0.20,     rx:0.300, rz:0.275, hex:P.robe},
      {y:L.kneeY,  rx:0.255, rz:0.230, hex:P.robeLt},
      {y:L.hipY,   rx:0.225, rz:0.200, hex:P.robe},
      {y:L.waistY, rx:0.215, rz:0.190, hex:P.robeDk},
      {y:L.chestY, rx:0.230, rz:0.195, hex:P.robe},     // chest swells slightly (sorcerous bulk)
      {y:L.shldY,  rx:0.250, rz:0.205, hex:P.robeLt},   // hunched rolled shoulders
      {y:L.neckY,  rx:0.115, rz:0.105, hex:P.robeDk},   // collar cinches at the neck
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0, L.hemY-0.01, 0), P.robeDk, true); // floor-close underside
    /* mottled dirty patches on the robe (VS grit, never smooth) */
    for(const [y,rx,rz,cx,cz,hex] of [
      [0.55,0.09,0.07,-0.16,0.14,P.robeLt],[0.85,0.08,0.06,0.15,-0.13,P.robeDk],
      [1.05,0.07,0.055,-0.14,-0.10,P.robe],[0.28,0.10,0.08,0.18,0.10,P.robeDk],
    ]){
      const rs=[ring(V(cx,y-0.05,cz), V(0,1,0), rx*0.8, rz*0.8, 6, 0.4), ring(V(cx,y+0.05,cz), V(0,1,0), rx, rz, 6, 0.4)];
      stitch(rs, ()=>hex);
      capFan(rs[1], V(cx,y+0.10,cz), hex);
    }
    /* frayed hem tatters at the bottom edge */
    for(const a of [0.2,1.1,2.3,3.4,4.6,5.5]){
      const cx=Math.cos(a)*0.34, cz=Math.sin(a)*0.31;
      const top=V(cx,L.hemY+0.05,cz), tip=V(cx*1.06,L.hemY-0.09,cz*1.06);
      tube(top, tip, 0.030, 0.006, 4, P.robeDk, {capB:{hex:P.robeDk, lift:0.004}});
    }
    /* trim cording down the front seam */
    quad(V(-0.018,L.neckY,0.10), V(0.018,L.neckY,0.10), V(0.024,L.hipY,0.20), V(-0.024,L.hipY,0.20), P.trim, 0.05);
    quad(V(-0.024,L.hipY,0.20), V(0.024,L.hipY,0.20), V(0.030,L.hemY+0.04,0.26), V(-0.030,L.hemY+0.04,0.26), P.trimDk, 0.05);
  }

  /* ---------- HEAD — long jackal snout, pointed ears, dark eye sockets, tan-grey fur, hunched fwd. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   z:0.03,  rx:0.135, rz:0.150, hex:P.muzzleDk},  // jaw base, jutting fwd
      {y:L.jawY+0.05, z:0.05, rx:0.150, rz:0.165, hex:P.muzzle},  // cheeks
      {y:L.browY,  z:0.02,  rx:0.148, rz:0.140, hex:P.fur},       // brow, furred
      {y:L.crownY, z:-0.01, rx:0.110, rz:0.100, hex:P.furDk},     // skull narrows
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.z), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.topY, -0.02), P.furDk);

    /* LONG SNOUT — tapered jackal muzzle projecting forward+down, blunt dark nose tip */
    const snB = V(0, L.jawY-0.01, 0.16);
    const snM = V(0, L.jawY-0.03, L.muzzleTipZ+0.06);
    const snT = V(0, L.jawY-0.05, L.muzzleTipZ+0.16);
    tube(snB, snM, 0.100, 0.062, n, P.muzzle, {raz:0.088, rbz:0.052, phase:ph});
    tube(snM, snT, 0.062, 0.026, n, P.muzzleDk, {raz:0.052, rbz:0.020, phase:ph, capB:{hex:P.nose, lift:0.006}});
    /* jaw underline + dark mouth slit */
    quad(V(-0.055,L.jawY-0.075,0.20), V(0.055,L.jawY-0.075,0.20), V(0.024,L.jawY-0.085,0.36), V(-0.024,L.jawY-0.085,0.36), P.nose, 0.03);
    /* two small fangs at the mouth corners */
    for(const s of [-1,1]){
      const fb=V(s*0.05,L.jawY-0.07,0.22), ft=V(s*0.045,L.jawY-0.115,0.225);
      tube(fb, ft, 0.012, 0.003, 4, P.fang, {capB:{hex:P.fang, lift:0.003}});
    }
    /* DARK EYE SOCKETS — recessed dark quads under the brow, NOT painted eyes */
    for(const s of [-1,1]){
      const c=V(s*0.065, L.browY-0.02, 0.10);
      quad(c.clone().add(V(-0.026,-0.016,0)), c.clone().add(V(0.026,-0.016,0)),
           c.clone().add(V(0.020,0.018,-0.012)), c.clone().add(V(-0.020,0.018,-0.012)), P.socket, 0.02);
    }
    /* POINTED EARS — tall, erect, jackal-sharp, set high on the crown */
    for(const s of [-1,1]){
      const eb=V(s*0.085, L.browY+0.05, -0.02);
      const em=V(s*0.135, L.crownY+0.13, -0.05);
      const et=V(s*0.150, L.crownY+0.27, -0.06);
      tube(eb, em, 0.052, 0.030, 5, P.fur, {raz:0.026, rbz:0.014});
      tube(em, et, 0.030, 0.004, 5, P.furDk, {raz:0.014, rbz:0.002, capB:{hex:P.furDk, lift:0.003}});
    }
    /* fur ruff at the neck collar, a shaggy ring peeking over the robe */
    quad(V(-0.10,L.jawY-0.10,0.05), V(0.10,L.jawY-0.10,0.05), V(0.13,L.jawY-0.03,-0.10), V(-0.13,L.jawY-0.03,-0.10), P.furLt, 0.06);
  }

  /* ---------- HANDS + TOME — held low in front, emerging from wide robe sleeves. ---------- */
  {
    const bookC = V(0, 0.82, 0.24);
    /* the tome: a thick closed book with visible page-edge and dark leather cover */
    quad(V(-0.075,0.775,0.185), V(0.075,0.775,0.185), V(0.075,0.775,0.300), V(-0.075,0.775,0.300), P.page, 0.04);   // bottom edge (pages)
    quad(V(-0.078,0.868,0.18), V(0.078,0.868,0.18), V(0.078,0.868,0.305), V(-0.078,0.868,0.305), P.book, 0.04);      // cover top
    quad(V(-0.078,0.775,0.18), V(-0.078,0.868,0.18), V(-0.078,0.868,0.305), V(-0.078,0.775,0.305), P.bookDk, 0.03);  // spine-side
    quad(V(0.078,0.775,0.18), V(0.078,0.868,0.18), V(0.078,0.868,0.305), V(0.078,0.775,0.305), P.bookDk, 0.03);      // far side
    quad(V(-0.078,0.775,0.305), V(0.078,0.775,0.305), V(0.078,0.868,0.305), V(-0.078,0.868,0.305), P.book, 0.04);    // front cover face
    quad(V(-0.024,0.870,0.20), V(0.024,0.870,0.20), V(0.020,0.870,0.29), V(-0.020,0.870,0.29), P.trim, 0.05);        // brass clasp strap

    /* wide open sleeve mouths (robe swallows the forearms) */
    for(const s of [-1,1]){
      const sc=V(s*0.20, 0.86, 0.16);
      const rs=[ring(sc.clone().add(V(0,-0.05,0)), V(0,1,0), 0.075, 0.070, 6, 0.3),
                ring(sc, V(0,1,0), 0.090, 0.082, 6, 0.3)];
      stitch(rs, ()=>P.robeDk);
      capFan(rs[0], sc.clone().add(V(0,-0.07,0)), P.robeDk, true);
    }
    /* clawed grey-tan hands gripping the book edges */
    for(const s of [-1,1]){
      const wrist=V(s*0.14, 0.80, 0.20);
      const palm=V(s*0.075, 0.805, 0.235);
      tube(wrist, palm, 0.052, 0.045, 6, P.hand, {capA:{hex:P.handDk}});
      for(const d of [-1,0,1]){
        const kb=palm.clone().add(V(s*0.01, 0.01, d*0.018));
        const kt=kb.clone().add(V(s*0.045, -0.01, d*0.010));
        tube(kb, kt, 0.014, 0.005, 4, P.hand, {capB:{hex:P.claw, lift:0.004}});
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
