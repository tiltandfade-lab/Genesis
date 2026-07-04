/* dev/model-qa/creatures/mon-unicorn.js — the UNICORN (bespoke Large QUADRUPED, warhorse-base variant).
   Wave 5 celestial unit (docs/CREATURE-MODELS-P2.md §5): lifts the mon-horse.js equine silhouette
   (spine loft, high withers, arched neck, four haunched legs, tail) but re-palettes to a white-silver
   coat and adds the signature spiral HORN on the brow + a flowing mane/tail. NO eye quads (house eye
   ruling reversed 2026-07-04 — sockets are shape only, and the unicorn keeps no visible socket at all,
   just a smooth pale brow). Whole-object grammar: one function, one geometry frame, no anchors.
   Large: ~2.4u nose-to-tail, base disc r=0.55. Imported by ps1-sheet.html + the proof sheet. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob, setChannels } from '../probe-lib.js';

export function buildUnicorn(){
  /* ---------- PALETTE (VS desaturated; pale silvery-white coat, dirty not candy) ---------- */
  const P = {
    coat:0xcfc9bc, coatDk:0xa8a294, coatLt:0xe2ddd0,      // pale silver-white coat, mottled
    mane:0xdcd8ce, maneDk:0xb8b2a4,                        // flowing pale mane/tail
    belly:0xe6e1d4,
    muzzle:0x9a9486, nose:0x2c2822,
    hoof:0x38332c, hoofDk:0x231f1a,
    horn:0xd6c9a0, hornDk:0xa8946a, hornGlow:0xf0e6b8,     // spiral horn, faint warm glow tip
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({ [P.coat]:'fur', [P.coatDk]:'fur', [P.coatLt]:'fur', [P.mane]:'fur', [P.maneDk]:'fur',
    [P.belly]:'fur', [P.horn]:'bone', [P.hornDk]:'bone', [P.hornGlow]:'glow', [P.hoof]:'bone' });

  /* ---------- LANDMARKS — spine along +z; withers ~1.15u, croup slightly lower; ~1.5u barrel. ---------- */
  const wY = 1.15;
  const S = {
    croup:  V(0, wY-0.02, -0.58),
    back:   V(0, wY-0.01, -0.30),
    withers:V(0, wY+0.06, -0.02),
    chest:  V(0, wY+0.00,  0.22),
    neckB:  V(0, wY+0.06,  0.40),
    neckM:  V(0, wY+0.22,  0.56),
    poll:   V(0, wY+0.30,  0.70),
    headB:  V(0, wY+0.24,  0.80),
  };

  /* ---------- BODY BARREL — one horizontal loft, pale mottled coat. ---------- */
  tube(S.croup,  S.back,    0.235, 0.255, 9, P.coat,   {phase:Math.PI/9, capA:{hex:P.coatDk, lift:0.02}});
  tube(S.back,   S.withers, 0.255, 0.270, 9, P.coatLt, {phase:Math.PI/9});
  tube(S.withers,S.chest,   0.270, 0.240, 9, P.coat,   {phase:Math.PI/9});
  tube(S.chest,  S.neckB,   0.240, 0.150, 9, P.coat,   {phase:Math.PI/9});
  tube(S.neckB,  S.neckM,   0.150, 0.128, 9, P.coatLt, {phase:Math.PI/9});
  tube(S.neckM,  S.poll,    0.128, 0.100, 9, P.coatDk, {phase:Math.PI/9});

  /* pale belly + a flowing mane crest down the neck */
  quad(V(-0.16,wY-0.24,-0.42), V(0.16,wY-0.24,-0.42), V(0.14,wY-0.24,0.18), V(-0.14,wY-0.24,0.18), P.belly, 0.05);
  {
    const mane=[[S.neckB,0.18],[S.neckM,0.24],[S.poll,0.20]];
    for(let i=0;i<mane.length-1;i++){
      const [a,ha]=mane[i], [b,hb]=mane[i+1];
      const az=a.clone().add(V(0,ha,-0.02)), bz=b.clone().add(V(0,hb,-0.02));
      quad(a.clone().add(V(-0.02,0,-0.05)), a.clone().add(V(0.02,0,-0.05)), bz.clone().add(V(0.02,0,0)), bz.clone().add(V(-0.02,0,0)), P.mane, 0.05);
      quad(a.clone().add(V(0,0,-0.05)), az, bz, b.clone().add(V(0,0,-0.05)), P.maneDk, 0.05);
    }
  }

  /* ---------- HEAD — long equine skull, smooth pale brow (no eye quads), long muzzle. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:wY+0.20, cz:0.86, rx:0.088, rz:0.100, hex:P.coatDk},
      {y:wY+0.27, cz:0.84, rx:0.100, rz:0.116, hex:P.coat},
      {y:wY+0.33, cz:0.80, rx:0.092, rz:0.104, hex:P.coatLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, wY+0.37, 0.78), P.coatLt);

    const mB=V(0, wY+0.17, 0.90), mM=V(0, wY+0.09, 1.02), mT=V(0, wY+0.03, 1.10);
    tube(mB, mM, 0.086, 0.070, n, P.muzzle, {raz:0.076, rbz:0.058, phase:ph});
    tube(mM, mT, 0.070, 0.048, n, P.muzzle, {raz:0.058, rbz:0.040, phase:ph, capB:{hex:P.nose, lift:0.008}});
    for(const s of [-1,1]) quad(V(s*0.024-0.008,wY+0.05,1.08), V(s*0.024+0.008,wY+0.05,1.08),
                                V(s*0.024+0.006,wY+0.07,1.06), V(s*0.024-0.006,wY+0.07,1.06), P.nose, 0.0);

    /* two small upright ears */
    for(const s of [-1,1]){
      const eb=V(s*0.060, wY+0.36, 0.74), et=V(s*0.078, wY+0.50, 0.70);
      tube(eb, et, 0.030, 0.006, 5, P.coat, {raz:0.020, rbz:0.004, capB:{hex:P.maneDk, lift:0.006}});
    }

    /* THE SIGNATURE — a single long spiral HORN rising from the brow, curving slightly forward.
       Segmented tube climbing +y with a subtle spiral phase-twist per segment (the ridged spiral
       read), tapering to a fine point; the tip caps in a faint warm glow hex (glow channel). */
    const hornBase = V(0, wY+0.40, 0.76);
    const segs = 6;
    let prev = hornBase;
    for(let i=1;i<=segs;i++){
      const t = i/segs;
      const y = hornBase.y + t*0.62;
      const z = hornBase.z + t*0.10 - t*t*0.03;     // slight forward curve
      const x = Math.sin(t*Math.PI*2.4) * 0.010 * (1-t*0.6); // subtle spiral wag, damps near tip
      const next = V(x, y, z);
      const ra = 0.052*(1-t*0.85)+0.006;
      const rb = 0.052*(1-(t+1/segs)*0.85)+0.006;
      const isTip = i===segs;
      tube(prev, next, Math.max(ra,0.006), Math.max(rb,0.003), 6,
        isTip ? P.hornGlow : (i%2===0?P.horn:P.hornDk),
        isTip ? {capB:{hex:P.hornGlow, lift:0.01}} : {});
      prev = next;
    }
  }

  /* ---------- LEGS — 4 long haunched legs, silver-pale coat, dark hooves. ---------- */
  {
    const leg=(hipX, hipZ, footX, footZ, rear)=>{
      const hip=V(hipX, wY-0.10, hipZ);
      const knee=V(hipX*1.02, 0.58, hipZ + (rear?0.05:-0.02));
      const fet=V(footX, 0.20, footZ);
      const hoof=V(footX, 0.05, footZ+0.02);
      const upR=rear?0.130:0.108;
      tube(hip,knee,upR,0.070,7,P.coat);
      tube(knee,fet,0.052,0.040,6,P.coatDk);
      tube(fet,hoof,0.046,0.052,6,P.hoof,{capB:{hex:P.hoofDk, lift:0.006}});
    };
    leg(-0.165, 0.20, -0.175, 0.24, false);
    leg( 0.165, 0.20,  0.175, 0.20, false);
    leg(-0.180, -0.52, -0.195, -0.46, true);
    leg( 0.180, -0.52,  0.195, -0.50, true);
  }

  /* ---------- TAIL — a thick flowing pale hair sweep. ---------- */
  {
    const t0=V(0.02, wY-0.06, -0.62);
    const t1=V(0.05, wY-0.28, -0.74);
    const t2=V(0.08, 0.55,    -0.84);
    const t3=V(0.10, 0.28,    -0.88);
    const tip=V(0.11, 0.10,   -0.86);
    tube(t0,t1,0.075,0.088,8,P.mane,{phase:Math.PI/8, capA:{hex:P.maneDk}});
    tube(t1,t2,0.088,0.078,8,P.mane,{phase:Math.PI/8});
    tube(t2,t3,0.078,0.052,8,P.maneDk,{phase:Math.PI/8});
    tube(t3,tip,0.052,0.020,8,P.maneDk,{phase:Math.PI/8, capB:{hex:P.maneDk, lift:0.008}});
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
