/* dev/model-qa/creatures/prop-shop-counter.js — SHOP COUNTER + TILL-NOOK (whole-object prop).
   Not a creature — no disc-figure, no eyes, no grip. One function, one geometry frame, no anchors.
   Footprint: 1x1 five-ft cell (~1.25u). Realm register: all (neutral cross-realm).
   The read (all at once): "you are being served here" — TRANSACTIONAL, tighter/narrower than
   A1's social bar-run. Feature checklist (what the tri budget buys), bottom->top / back->front:
     - an L-SHAPED waist-high counter (a long run + a short return leg closing the corner) —
       the tighter L is the silhouette tell vs the straight bar-run
     - a TILL/SCALE-BOX lump sitting proud on the counter top at the corner (the signature feature)
     - a small BACK-SHELF NOOK standing behind the counter, two shelves, stocked with goods —
       the use-tell (a bare counter with nothing behind it reads as unstaffed)
     - a coin/ledger clutter scatter on the counter top (secondary use-tell)
   VS-desaturated worn-wood palette (a few close warm-brown tones + one pale weathered plank +
   one dull brass accent for the till). Scale reference: figures ~1.5u tall; the counter top sits
   ~0.5u (waist height); the back nook stands ~0.9u tall behind the counter, ~0.3u further back.
   Imported by prop-shop-counter-probe.html. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPropShopCounter(){
  /* ---------- PALETTE (VS desaturated worn wood) ---------- */
  const PAL = {
    wood:0x7a5a3c, woodDk:0x5a4029, woodDkr:0x3e2c1c, woodLt:0x93724f,   // counter carcass
    plank:0x8a6a48, plankDk:0x63472c,                                    // counter top planks
    weather:0xb9a67f,                                                    // pale weathered edge
    till:0x4a4640, tillDk:0x322f2a, brass:0x9c8347, brassDk:0x6d5a30,     // till/scale box + accent
    shelf:0x6b4d31, shelfDk:0x4a3420,                                     // back nook
    goods:0x8a7550, goodsDk:0x5f4f34, sack:0xb0925f, jar:0x6f8a74,        // stocked goods (varied so it reads as stock)
    coin:0xc9a94a, ledger:0x93825f,
    disc:0x2e2419, discTop:0x3a2e1f,
  };

  /* helper: axis-aligned box (min)->(max), 3-tone shaded like the altar exemplar. */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.05);
    quad(D,Cc,B,A, dk, 0.05);
    quad(D,H,E,A, mid, 0.05);
    quad(B,F,G,Cc, mid, 0.05);
    quad(A,E,F,B, dk, 0.05);
    quad(Cc,G,H,D, top, 0.05);
  }

  const GROUND = 0.055;
  const TOP0 = GROUND;         // carcass base
  const TOP1 = GROUND + 0.48;  // carcass top / plank underside
  const PTOP = TOP1 + 0.03;    // plank top surface (counter waist height ~0.51u)

  /* ===== 1) L-SHAPED CARCASS — long run along the back edge (-z side), short return leg
     closing the corner on the +x side. Tighter L than the bar-run: short leg is stubby. ===== */
  // long run (along x, set back near -z)
  box(-0.55,0.30, TOP0,TOP1, -0.58,-0.30, PAL.woodLt, PAL.wood, PAL.woodDkr);
  // short return leg (along z, closing the corner on the +x end)
  box(0.30,0.58, TOP0,TOP1, -0.58,0.20, PAL.woodLt, PAL.wood, PAL.woodDkr);
  // plank tops (slightly overhanging the carcass, the tabletop read)
  box(-0.58,0.33, TOP1,PTOP, -0.61,-0.27, PAL.plank, PAL.plank, PAL.plankDk);      // long-run top
  box(0.27,0.61, TOP1,PTOP, -0.61,0.23, PAL.plank, PAL.plank, PAL.plankDk);        // return-leg top
  // pale weathered chip on the front lip of the long run (weathering tell)
  quad(V(-0.30,PTOP,-0.61), V(-0.14,PTOP,-0.61), V(-0.30,PTOP-0.035,-0.61), V(-0.30,PTOP-0.035,-0.61), PAL.weather, 0.03);
  quad(V(0.45,PTOP,0.23), V(0.45,PTOP-0.035,0.23), V(0.34,PTOP,0.23), V(0.34,PTOP,0.23), PAL.weather, 0.03);

  /* ===== 2) TILL / SCALE-BOX LUMP — the LOUD signature feature, sitting proud on the counter
     top right at the inner corner where the two legs meet. A squat riveted box with a brass
     scale-arm/lever poking up. ===== */
  {
    const cx=0.20, cz=-0.20, y0=PTOP+0.002;
    box(cx-0.13,cx+0.13, y0,y0+0.16, cz-0.11,cz+0.11, PAL.till, PAL.till, PAL.tillDk);   // the box body
    box(cx-0.10,cx+0.10, y0+0.16,y0+0.20, cz-0.09,cz+0.09, PAL.tillDk, PAL.tillDk, PAL.tillDk); // lid lip
    // brass scale-arm: a small tube leaning up from the box top
    tube(V(cx-0.04,y0+0.20,cz), V(cx-0.10,y0+0.34,cz), 0.014,0.010,5, PAL.brass, {capB:{hex:PAL.brassDk}});
    // a tiny brass dial-face on the box front (pale accent, min feature ~0.05u so it survives 1/3-res)
    quad(V(cx-0.06,y0+0.11,cz-0.11), V(cx+0.04,y0+0.11,cz-0.11), V(cx+0.04,y0+0.045,cz-0.11), V(cx-0.06,y0+0.045,cz-0.11), PAL.brass, 0.05);
  }

  /* ===== 3) COIN / LEDGER CLUTTER — a small scatter on the counter top away from the till,
     the secondary use-tell (someone's mid-transaction here). ===== */
  {
    const y = PTOP + 0.002;
    // ledger book (flat slab)
    quad(V(-0.42,y,-0.44), V(-0.20,y,-0.44), V(-0.20,y,-0.34), V(-0.42,y,-0.34), PAL.ledger, 0.05);
    quad(V(-0.40,y+0.012,-0.42), V(-0.24,y+0.012,-0.42), V(-0.24,y+0.012,-0.36), V(-0.40,y+0.012,-0.36), PAL.weather, 0.04);
    // a couple of coin-stack nubs (tiny cylinders)
    stack([{y, rx:0.028, rz:0.028, cx:-0.10, cz:-0.46, hex:PAL.coin}], 6, {capTop:{hex:PAL.coin, lift:0.012}});
    stack([{y, rx:0.026, rz:0.026, cx:-0.02, cz:-0.42, hex:PAL.coin}], 6, {capTop:{hex:PAL.coin, lift:0.018}});
  }

  /* ===== 4) BACK-SHELF NOOK — a small shelving unit standing behind the counter (further -z,
     against the back wall line), two shelves, stocked with goods. The strongest use-tell:
     a bare counter with nothing behind it reads as unstaffed. ===== */
  {
    const nx0=-0.30, nx1=0.30, nz0=-0.85, nz1=-0.68;
    const N0=GROUND, N1=GROUND+0.85;
    // carcass posts + back panel
    box(nx0,nx1, N0,N1, nz0,nz0+0.03, PAL.shelfDk, PAL.shelf, PAL.shelfDk);   // back panel
    box(nx0,nx0+0.04, N0,N1, nz0,nz1, PAL.shelf, PAL.shelf, PAL.shelfDk);      // left post
    box(nx1-0.04,nx1, N0,N1, nz0,nz1, PAL.shelf, PAL.shelf, PAL.shelfDk);      // right post
    // two shelf boards
    const shY0 = GROUND+0.34, shY1 = GROUND+0.62;
    box(nx0,nx1, shY0,shY0+0.03, nz0,nz1, PAL.plank, PAL.plank, PAL.plankDk);
    box(nx0,nx1, shY1,shY1+0.03, nz0,nz1, PAL.plank, PAL.plank, PAL.plankDk);
    box(nx0,nx1, N1-0.03,N1, nz0,nz1, PAL.shelf, PAL.shelf, PAL.shelfDk);      // top board
    // stocked goods on each shelf — varied lumps so it reads as stock, not empty boards
    function goodsRow(y, z){
      stack([{y, rx:0.05, rz:0.045, cx:-0.20, cz:z, hex:PAL.sack}], 5, {capTop:{hex:PAL.sack, lift:0.10}});
      box(-0.06,0.06, y,y+0.14, z-0.05,z+0.05, PAL.goods, PAL.goods, PAL.goodsDk);   // crate lump
      stack([{y, rx:0.035, rz:0.035, cx:0.19, cz:z, hex:PAL.jar}], 6, {capTop:{hex:PAL.jar, lift:0.10}}); // jar
    }
    goodsRow(shY0+0.032, nz0+0.015);
    goodsRow(shY1+0.032, nz0+0.015);
    goodsRow(N1-0.03+0.005, nz0+0.015);
  }

  /* base disc — shared style (r=0.42), sized to the 1x1 cell footprint. Worn-wood tones. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,GROUND,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>PAL.disc);
    capFan(r2, V(0,GROUND+0.003,0), PAL.discTop);
  }
}
