/* dev/model-qa/creatures/mon-mindthief-arcanist.js — MIND THIEF ARCANIST (bespoke whole-object
   ABERRATION, an ornate-robed mind-flayer spellcaster). Same octopoid-headed robed humanoid read
   as the base mind-flayer family: a bulbous cephalopod head with FOUR down-hanging face-tentacles,
   set on a slim robed humanoid frame — but here the robe is ORNATE (a stiff high collar, trim
   bands, a hem panel) and the figure holds a tall STAFF planted at its side, arcanist not brute.
   Mauve-violet skin, dark ornate robe with dull violet-trimmed bands. NO eye quads (sockets are
   dark recesses only, per house ruling). Whole-object grammar: one function, one geometry frame,
   no anchors. Medium size, base disc r=0.42. Imported by the p2mon proof sheet. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildMindThiefArcanist(){
  /* ---------- PALETTE (VS-desaturated; mauve-violet skin, dark ornate robe, dull metal trim) --- */
  const P = {
    skin:0x746080, skinDk:0x4c3f57, skinLt:0x8d7896,           // mauve-violet flesh
    tent:0x6a5674, tentDk:0x40354a,                             // face-tentacles
    socket:0x211a26,                                            // dark eye-socket recess (NO eye quad)
    robe:0x2c2530, robeDk:0x1a1620, robeLt:0x3d3440,            // dark ornate robe body
    trim:0x5a4a68, trimDk:0x39304a,                             // dull violet-metal trim bands
    collar:0x463a54, collarDk:0x2a2333,                         // stiff high collar
    hem:0x352c3d,                                               // hem panel
    wood:0x4a3f38, woodDk:0x2e2620,                              // staff haft
    gem:0x5f7d78, gemDk:0x35443f,                                // dull glow-gem (desaturated, not candy)
    disc:0x413a45, discTop:0x4d4552,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin', [P.skinLt]:'skin',
    [P.tent]:'skin', [P.tentDk]:'skin',
    [P.robe]:'cloth', [P.robeDk]:'cloth', [P.robeLt]:'cloth', [P.hem]:'cloth',
    [P.trim]:'metal', [P.trimDk]:'metal', [P.collar]:'cloth', [P.collarDk]:'cloth',
    [P.wood]:'wood', [P.woodDk]:'wood',
    [P.gem]:'glow', [P.gemDk]:'glow',
  });

  /* ---------- LANDMARKS — slim upright humanoid spine along +y, staff planted at the right side. */
  const L = {
    hipY:0.62, waistY:0.78, chestY:0.96, shldY:1.08, neckY:1.16,
    jawY:1.20, browY:1.32, crownY:1.44, domeY:1.56,
  };

  /* ---------- ROBE BODY — a slim tapered loft, hips to shoulders, with an ORNATE trim band at the
     waist and a stiff high collar rising at the neck. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:L.hipY,   rx:0.185, rz:0.150, hex:P.robeDk},
      {y:L.waistY, rx:0.170, rz:0.140, hex:P.robe},
      {y:L.chestY, rx:0.195, rz:0.155, hex:P.robeLt},
      {y:L.shldY,  rx:0.215, rz:0.165, hex:P.robe},
      {y:L.neckY,  rx:0.110, rz:0.095, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);

    /* ornate trim band riding the waist — a proud narrow ring of dull metal trim */
    const t0=ring(V(0,L.waistY-0.03,0), V(0,1,0), 0.178, 0.146, n, ph);
    const t1=ring(V(0,L.waistY+0.035,0), V(0,1,0), 0.182, 0.150, n, ph);
    stitch([t0,t1], ()=>P.trim);

    /* hem panel flaring at the base of the robe, down to ankle height */
    const h0=ring(V(0,L.hipY-0.02,0), V(0,1,0), 0.185, 0.150, n, ph);
    const h1=ring(V(0,0.10,0), V(0,1,0), 0.235, 0.195, n, ph);
    stitch([h0,h1], ()=>P.hem);
    capFan(h1, V(0,0.10,0), P.robeDk, true);
  }

  /* ---------- STIFF HIGH COLLAR — rises behind/around the neck, ornate mind-flayer-arcanist read. */
  {
    const n=8, ph=Math.PI/n;
    const c0=ring(V(0,L.neckY-0.02,0), V(0,1,0), 0.135, 0.115, n, ph);
    const c1=ring(V(0,L.neckY+0.14,0), V(0,1,0), 0.150, 0.120, n, ph);
    /* fold the front verts down so the collar opens toward the face, rises tall at the back */
    for(const i of [1,2]){ c1[i].y -= 0.09; }
    stitch([c0,c1], ()=>P.collar);
    capFan(c1, V(0,L.neckY+0.15,-0.02), P.collarDk);
    /* a dull trim edge along the collar rim */
    const rim=ring(V(0,L.neckY+0.135,0), V(0,1,0), 0.152, 0.122, n, ph);
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(c1[i], c1[i2], rim[i2], rim[i], P.trim, 0.05);
    }
  }

  /* ---------- HEAD — bulbous octopoid cranium, dark socket recesses (NO eye quads), four hanging
     face-tentacles drooping from the lower face mass. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.140, rz:0.135, hex:P.skin},
      {y:L.browY,  rx:0.168, rz:0.158, hex:P.skinLt},
      {y:L.crownY, rx:0.175, rz:0.165, hex:P.skin},
      {y:L.domeY,  rx:0.115, rz:0.110, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.domeY+0.09,0), P.skinDk);

    /* dark socket recesses — shallow inset quads on the brow band, shape not paint */
    for(const s of [-1,1]){
      const c=V(s*0.075, L.browY+0.01, 0.145);
      quad(c.clone().add(V(-0.028,0.020,0)), c.clone().add(V(0.028,0.020,0)),
           c.clone().add(V(0.022,-0.020,-0.012)), c.clone().add(V(-0.022,-0.020,-0.012)), P.socket, 0.02);
    }

    /* FOUR face-tentacles hanging down from the lower face mass, drooping past the jaw */
    const roots=[[-0.075,0.055],[-0.026,0.075],[0.026,0.075],[0.075,0.055]];
    for(const [rx0,rz0] of roots){
      const r0=V(rx0, L.jawY-0.04, rz0+0.10);
      const r1=V(rx0*1.15, L.jawY-0.16, rz0+0.13);
      const r2=V(rx0*1.05, L.jawY-0.30, rz0*0.7+0.10);
      const tip=V(rx0*0.7, L.jawY-0.42, rz0*0.4+0.06);
      tube(r0,r1, 0.030,0.024, 5, P.tent, {capA:{hex:P.tentDk}});
      tube(r1,r2, 0.024,0.016, 5, P.tentDk);
      tube(r2,tip,0.016,0.005, 5, P.tent, {capB:{hex:P.tentDk, lift:0.005}});
    }
  }

  /* ---------- ARMS — slim robed sleeves; left arm rests at the side, right arm grips the staff. -- */
  {
    const shR=V(0.205, L.shldY-0.03, 0.0), elR=V(0.255, L.chestY-0.14, 0.03), wrR=V(0.235, L.waistY-0.04, 0.05);
    tube(shR, elR, 0.062, 0.050, 6, P.robe);
    tube(elR, wrR, 0.050, 0.040, 6, P.robeDk, {capB:{hex:P.skinDk, lift:0.01}});

    const shL=V(-0.205, L.shldY-0.03, 0.0), elL=V(-0.235, L.chestY-0.18, -0.02), wrL=V(-0.200, L.waistY-0.10, -0.01);
    tube(shL, elL, 0.062, 0.050, 6, P.robe);
    tube(elL, wrL, 0.050, 0.040, 6, P.robeDk, {capB:{hex:P.skinDk, lift:0.01}});

    /* ---------- STAFF — tall, planted at the right side, gripped by the right hand, topped with a
       dull glow-gem finial (desaturated, not candy). Authored fully in world space. ---------- */
    const base=V(0.30, 0.03, 0.08);
    const grip=wrR.clone();
    const top =V(0.335, 1.62, 0.02);
    tube(base, grip, 0.026, 0.022, 6, P.woodDk, {capA:{hex:P.woodDk}});
    tube(grip, top,  0.022, 0.017, 6, P.wood);
    /* finial: a small dull gem cradled at the staff top */
    tube(top, V(top.x,top.y+0.055,top.z), 0.020, 0.030, 6, P.gemDk, {capB:{hex:P.gem, lift:0.02}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
