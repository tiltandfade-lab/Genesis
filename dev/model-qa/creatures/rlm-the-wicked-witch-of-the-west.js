/* dev/model-qa/creatures/rlm-the-wicked-witch-of-the-west.js — THE WICKED WITCH OF THE WEST
   (bright-kingdom, Medium, CR 6). A one-eyed witch wrapped in dust-colored robes, umbrella-staff,
   no green skin. Read: a tall gaunt hooded humanoid in layered dust/ash-colored robes, a single
   visible eye-socket recess under the hood brim (the "one-eyed" tell — the other side stays
   deep shadow, no eye quads at all), gnarled bare hands, and a furled black umbrella carried
   like a staff (its ferrule planted, ribs folded tight — a witch's cane, not opened). Skin reads
   sallow/weathered, NOT green. Whole-object grammar, one merged frame, no anchors. Medium
   disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheWickedWitchOfTheWest(){
  const P = {
    robe:0x6e6558, robeDk:0x4a4438, robeLt:0x87806c,
    dust:0x9c9480,
    skin:0x9c8968, skinDk:0x6e5f45,     // sallow/weathered, NOT green
    hood:0x3a352c, hoodDk:0x24211a,
    eye:0x2a2620,
    umbrella:0x1c1a17, umbrellaDk:0x100f0c, ferrule:0x655c48,
    disc:0x453f34, discTop:0x534c40,
  };

  const spY = 0.66;
  /* ---------- ROBES — tall gaunt layered silhouette, dust/ash-colored. ---------- */
  const bands=[
    {y:0.02,  rx:0.155, hex:P.robeDk},
    {y:0.18,  rx:0.175, hex:P.robe},
    {y:0.38,  rx:0.155, hex:P.dust},
    {y:0.58,  rx:0.120, hex:P.robeDk},
    {y:0.78,  rx:0.095, hex:P.robe},     // narrow gaunt shoulders
    {y:0.90,  rx:0.070, hex:P.robeDk},
  ];
  {
    const n=10, ph=Math.PI/n;
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx*0.86, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,0.01,0), P.robeDk, true);
  }
  // tattered ragged hem
  for(const s of [-1,0,1]) quad(V(s*0.09-0.03,0.20,0.10), V(s*0.09+0.03,0.20,0.10), V(s*0.09+0.02,0.03,0.11), V(s*0.09-0.02,0.03,0.11), P.robeDk, 0.07);
  // dust-toned drape shawl over the shoulders
  quad(V(-0.10,0.90,0.06), V(0.10,0.90,0.06), V(0.16,0.55,0.09), V(-0.16,0.55,0.09), P.dust, 0.05);

  /* ---------- HEAD — deep hood, ONE visible eye-socket recess; other side stays deep shadow. --- */
  {
    const n=9, ph=Math.PI/n;
    const hb=[
      {y:0.93, cz:0.01, rx:0.075, rz:0.078, hex:P.skinDk},
      {y:1.02, cz:0.02, rx:0.078, rz:0.075, hex:P.skin},
      {y:1.10, cz:0.00, rx:0.060, rz:0.062, hex:P.skinDk},
    ];
    const rings = hb.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>hb[b].hex);
    capFan(rings.at(-1), V(0,1.12,0.00), P.hoodDk);

    // hawkish nose
    const snB=V(0,1.005,0.075), snT=V(0,0.99,0.135);
    tube(snB, snT, 0.022, 0.008, n, P.skin, {phase:ph, capB:{hex:P.skinDk, lift:0.003}});
    // ONE visible eye-socket recess (right side); left stays in hood-shadow, unmarked
    {
      const sx=0.032, sy=1.03, sz=0.062;
      quad(V(sx-0.014,sy+0.011,sz), V(sx+0.014,sy+0.011,sz), V(sx+0.011,sy-0.011,sz+0.004), V(sx-0.011,sy-0.011,sz+0.004), P.eye, 0.03);
    }
    // deep shadow patch over the other socket (unmarked, darker recess — no quad geometry, just a
    // darker skin band read into the head bands above; intentionally no second eye feature)

    // downturned grim mouth line
    quad(V(-0.020,0.965,0.078), V(0.020,0.965,0.078), V(0.014,0.958,0.082), V(-0.014,0.958,0.082), P.hoodDk, 0.03);

    /* HOOD — deep pointed hood over the head, brim casting the shadow read. */
    const hoodBands=[
      {y:1.00, cz:-0.02, rx:0.095, rz:0.100, hex:P.hood},
      {y:1.12, cz:-0.01, rx:0.088, rz:0.092, hex:P.hoodDk},
      {y:1.26, cz:0.00,  rx:0.055, rz:0.058, hex:P.hood},
    ];
    const hr = hoodBands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(hr, b=>hoodBands[b].hex, {0:[3,4,5]});   // open front where the face shows
    capFan(hr.at(-1), V(0,1.40,-0.01), P.hoodDk);
  }

  /* ---------- ARMS — one gnarled hand gripping the umbrella-staff, the other loose at her side. -- */
  {
    const sh1 = V(0.115, 0.86, 0.03);
    const el1 = V(0.20, 0.68, 0.10);
    const hd1 = V(0.24, 0.50, 0.14);
    tube(sh1, el1, 0.044, 0.034, 6, P.robe);
    tube(el1, hd1, 0.034, 0.024, 6, P.skinDk, {capB:{hex:P.skin, lift:0.008}});
    // gnarled bare knuckle bumps
    for(const dz of [-0.01,0.01]) quad(V(hd1.x-0.01,hd1.y-0.01,hd1.z+dz), V(hd1.x+0.01,hd1.y-0.01,hd1.z+dz), V(hd1.x+0.008,hd1.y-0.03,hd1.z+dz), V(hd1.x-0.008,hd1.y-0.03,hd1.z+dz), P.skin, 0.05);

    const sh2 = V(-0.115, 0.84, 0.03);
    const el2 = V(-0.16, 0.62, 0.06);
    const hd2 = V(-0.18, 0.42, 0.08);
    tube(sh2, el2, 0.044, 0.034, 6, P.robe);
    tube(el2, hd2, 0.034, 0.024, 6, P.skinDk, {capB:{hex:P.skin, lift:0.008}});
  }

  /* ---------- UMBRELLA-STAFF — planted, ribs folded tight (a cane, not opened). ---------- */
  {
    const ferB = V(0.245, 0.0, 0.145), ferT = V(0.245, 0.16, 0.145);
    tube(ferB, ferT, 0.018, 0.014, 6, P.ferrule, {capA:{hex:P.ferrule}});
    const haftT = V(0.24, 1.05, 0.14);
    tube(ferT, haftT, 0.014, 0.012, 6, P.umbrellaDk);
    // folded canopy — a slim closed bundle at the top, tapering ribs pinched together
    const capB=V(0.24,1.05,0.14), capT=V(0.235,1.24,0.135);
    tube(capB, capT, 0.030, 0.008, 6, P.umbrella, {capB:{hex:P.umbrellaDk, lift:0.004}});
    // hooked handle
    const hookT = V(0.20, 1.30, 0.13);
    tube(capT, hookT, 0.008, 0.006, 5, P.ferrule, {capB:{hex:P.ferrule, lift:0.003}});
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
