/* dev/model-qa/creatures/mon-tarrasque.js — the TARRASQUE (bespoke ARMORED TITAN, Gargantuan Monstrosity).
   docs/CREATURE-MODELS-P2.md Wave 2: a colossal armored dinosaur-titan — a huge plated CARAPACE over
   a bipedal-leaning body, two big back-swept HORNS, a massive fanged maw, thick tail, and stubby
   powerful limbs. Iron-brown armored plates (VS desaturated, mottled), the tallest/heaviest model in
   the roster. NO eye quads (sockets are dark recesses only). Whole-object grammar: one function, one
   merged geometry frame, no anchors, no part-object transforms. Gargantuan: base disc r=0.72; the
   whole silhouette rises in +y (hunched-tall) rather than sprawling past the disc footprint. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildTarrasque(){
  /* ---------- PALETTE (VS desaturated; iron-brown armor plate, dirty mottle, bone horns/teeth) ---------- */
  const P = {
    plate:0x5c4a34, plateDk:0x3d3122, plateLt:0x71604a,         // iron-brown carapace plates
    mottleA:0x4a3d28, mottleB:0x695942,                          // dorsal mottle bands
    seam:0x27201660,                                            // (unused hex form kept simple below)
  };
  // (seam above intentionally simple; real seam color defined next to avoid alpha-string mistakes)
  P.seam = 0x241d15;
  P.hide  = 0x584b39;             // hide/underside between plates
  P.horn  = 0x9c8f6e; P.hornDk = 0x6f6448;    // pale dirty bone horns
  P.maw   = 0x1c1712; P.tooth  = 0xb8ac89; P.toothDk = 0x8a8064;
  P.claw  = 0x8f8266; P.clawDk = 0x635942;
  P.disc  = 0x3d3122; P.discTop = 0x4a3d28;

  setChannels({
    [P.plate]:'stone', [P.plateDk]:'stone', [P.plateLt]:'stone',
    [P.mottleA]:'stone', [P.mottleB]:'stone',
    [P.horn]:'bone', [P.hornDk]:'bone', [P.tooth]:'bone', [P.toothDk]:'bone',
    [P.claw]:'bone', [P.clawDk]:'bone',
    [P.hide]:'leather',
  });

  /* ---------- LANDMARKS — spine along +z, bipedal-leaning hunch: hips high, torso rising to a
     massive shouldered chest, neck arcing up+forward to a heavy-horned head. Rear/rise stays in +y
     to keep the huge silhouette inside the r0.72 disc footprint. ---------- */
  const S = {
    tailBase: V(0, 0.46, -0.52),
    hips:     V(0, 0.66, -0.34),
    loin:     V(0, 0.80, -0.14),
    chest:    V(0, 0.92,  0.08),
    shldr:    V(0, 0.98,  0.26),
    neck:     V(0, 1.10,  0.36),
    headB:    V(0, 1.28,  0.40),   // head held high, jutting slightly forward
  };
  const n=10, ph=Math.PI/n;

  /* ---------- BODY — one loft; a huge armored barrel rising from hips to a broad chest. ---------- */
  tube(S.hips,  S.loin,  0.360, 0.400, n, P.plate,   {phase:ph, capA:{hex:P.plateDk, lift:0.03}});
  tube(S.loin,  S.chest, 0.400, 0.430, n, P.plateLt, {phase:ph});
  tube(S.chest, S.shldr, 0.430, 0.400, n, P.plate,   {phase:ph});
  tube(S.shldr, S.neck,  0.330, 0.220, n, P.plateDk, {phase:ph});
  tube(S.neck,  S.headB, 0.220, 0.190, n, P.plate,   {phase:ph});

  /* pale hide strip low on the underside (soft belly between the armor) */
  {
    const by = 0.30;
    quad(V(-0.28,by,-0.28), V(0.28,by,-0.28), V(0.24,by+0.02,0.20), V(-0.24,by+0.02,0.20), P.hide, 0.05);
  }

  /* dorsal ridge of overlapping armor scutes along the spine (hips -> neck) */
  {
    const seg = [[-0.46,0.88],[-0.22,0.98],[0.02,1.06],[0.22,1.08],[0.34,1.14]];
    for(let i=0;i<seg.length;i++){
      const [z,y]=seg[i];
      quad(V(-0.10,y,z), V(0.10,y,z), V(0.075,y+0.10,z-0.05), V(-0.075,y+0.10,z-0.05), P.plateDk, 0.05);
      quad(V(-0.055,y,z), V(0.055,y,z), V(0,y+0.16,z-0.03), V(0,y+0.16,z-0.03), P.plateLt, 0.04);
    }
  }

  /* dirt-mottle patches on the flanks (VS dirty/mottled read) */
  {
    for(const [x,y,z,s] of [[-0.30,0.70,-0.20,0.13],[0.28,0.82,0.02,0.11],[-0.24,0.94,0.20,0.09],[0.26,0.60,-0.34,0.10]]){
      quad(V(x-s,y,z-s*0.6), V(x+s,y,z-s*0.6), V(x+s*0.8,y-0.01,z+s*0.6), V(x-s*0.8,y-0.01,z+s*0.6), P.mottleA, 0.10);
    }
  }

  /* flank plate seams (dark lines suggesting overlapping armor plates) */
  {
    for(const z of [-0.30,-0.06,0.18]){
      for(const s of [-1,1]){
        const x = s*0.40;
        quad(V(x,0.55,z-0.06), V(x,0.55,z+0.06), V(x*0.94,0.90,z+0.05), V(x*0.94,0.90,z-0.05), P.seam, 0.04);
      }
    }
  }

  /* ---------- HEAD — a huge, blocky armored skull with a massive fanged maw. ---------- */
  {
    const bands=[
      {y:1.14, cz:0.44, rx:0.230, rz:0.240, hex:P.plate},    // jaw/cheek (wide)
      {y:1.28, cz:0.46, rx:0.250, rz:0.250, hex:P.plateLt},  // broadest — the armored skull
      {y:1.42, cz:0.42, rx:0.200, rz:0.190, hex:P.plateDk},  // brow, heavy
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.50,0.42), P.plateDk);

    /* SNOUT — a broad blunt muzzle projecting forward (+z), housing the massive maw. */
    const snB = V(0, 1.16, 0.62);
    const snM = V(0, 1.13, 0.82);
    const snT = V(0, 1.11, 0.98);
    tube(snB, snM, 0.220, 0.170, n, P.plate,   {raz:0.200, rbz:0.150, phase:ph});
    tube(snM, snT, 0.170, 0.110, n, P.plateLt, {raz:0.150, rbz:0.090, phase:ph, capB:{hex:P.plateDk, lift:0.008}});

    /* dark socket recesses (shape, not paint) sunk into the brow — NO eye quads */
    for(const s of [-1,1]){
      const cx=s*0.12, cy=1.36, cz=0.50;
      quad(V(cx-0.05,cy+0.04,cz), V(cx+0.05,cy+0.04,cz), V(cx+0.04,cy-0.04,cz+0.04), V(cx-0.04,cy-0.04,cz+0.04), P.maw, 0.02);
    }

    /* MASSIVE FANGED MAW — a huge dark mouth slash under the snout, ringed with jagged teeth */
    quad(V(-0.20,1.02,0.66), V(0.20,1.02,0.66), V(0.15,0.98,1.02), V(-0.15,0.98,1.02), P.maw, 0.04);
    const toothCount=10;
    for(let i=0;i<toothCount;i++){
      const t=i/(toothCount-1);
      const z=0.68+t*0.32, x=-0.17+t*0.34, y=1.045;
      const h = (i%2===0)?0.075:0.05;
      quad(V(x-0.020,y,z), V(x+0.020,y,z), V(x+0.010,y-h,z+0.008), V(x-0.010,y-h,z+0.008), P.tooth, 0.05);
    }
    for(let i=0;i<toothCount-1;i++){
      const t=(i+0.5)/(toothCount-1);
      const z=0.68+t*0.32, x=-0.17+t*0.34, y=0.985;
      quad(V(x-0.017,y,z), V(x+0.017,y,z), V(x+0.008,y+0.05,z-0.006), V(x-0.008,y+0.05,z-0.006), P.toothDk, 0.05);
    }

    /* ---------- TWO BIG BACK-SWEPT HORNS — the signature; sweep up+back from the brow. ---------- */
    for(const s of [-1,1]){
      const hb = V(s*0.15, 1.44, 0.38);
      const hm = V(s*0.22, 1.68, 0.16);
      const ht = V(s*0.26, 1.92, -0.14);
      const tip= V(s*0.28, 2.10, -0.38);
      tube(hb, hm, 0.075, 0.055, 7, P.horn,   {capA:{hex:P.hornDk, lift:0.01}});
      tube(hm, ht, 0.055, 0.032, 7, P.hornDk);
      tube(ht, tip,0.032, 0.008, 7, P.horn,   {capB:{hex:P.hornDk, lift:0.006}});
    }
  }

  /* ---------- LIMBS — stubby, powerful, bipedal-leaning stance: thick forelimbs + massive haunches. ---------- */
  {
    const stumpLimb=(shoulder, footX, footZ, raU, raL, hex)=>{
      const knee = V(shoulder.x + Math.sign(shoulder.x)*0.08, shoulder.y - 0.32, shoulder.z + (footZ>shoulder.z?0.04:-0.04));
      const foot = V(footX, 0.10, footZ);
      tube(shoulder, knee, raU, raU*0.82, 8, hex,        {phase:ph, capA:{hex:P.plateDk, lift:0.02}});
      tube(knee, foot,     raU*0.82, raL, 8, P.plateDk,  {phase:ph, capB:{hex:P.hide, lift:0.01}});
      const pad = V(foot.x, 0.06, foot.z+0.05);
      for(const dx of [-0.06, 0, 0.06]){
        const cb = V(pad.x+dx*0.7, 0.065, pad.z);
        const ct = V(pad.x+dx, 0.015, pad.z+0.12);
        tube(cb, ct, 0.036, 0.014, 5, P.claw, {capB:{hex:P.clawDk, lift:0.006}});
      }
    };
    // forelimbs — thick, planted forward/wide (shoulder ~z0.20)
    stumpLimb(V(-0.36, 0.86, 0.20), -0.42, 0.34, 0.150, 0.100, P.plate);
    stumpLimb(V( 0.36, 0.86, 0.20),  0.42, 0.34, 0.150, 0.100, P.plate);
    // hind limbs — massive, powerful haunches carrying the bipedal lean (hip ~z-0.36)
    stumpLimb(V(-0.40, 0.66, -0.36), -0.46, -0.42, 0.195, 0.130, P.plateLt);
    stumpLimb(V( 0.40, 0.66, -0.36),  0.46, -0.42, 0.195, 0.130, P.plateLt);
  }

  /* ---------- TAIL — thick, heavy, armored, tapering; a stub compared to the huge frame. ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0.03, 0.40, -0.76);
    const t2 = V(0.06, 0.32, -0.98);
    const t3 = V(0.10, 0.24, -1.14);
    const tip= V(0.14, 0.18, -1.24);
    tube(t0, t1, 0.230, 0.180, n, P.plate,   {phase:ph, capA:{hex:P.plateDk}});
    tube(t1, t2, 0.180, 0.125, n, P.plateDk, {phase:ph});
    tube(t2, t3, 0.125, 0.075, n, P.plate,   {phase:ph});
    tube(t3, tip,0.075, 0.025, n, P.plateDk, {phase:ph, capB:{hex:P.plateDk, lift:0.006}});
    // small armor scutes continuing onto the tail base
    quad(V(-0.05,0.72,-0.58), V(0.05,0.72,-0.58), V(0.04,0.56,-0.76), V(-0.04,0.56,-0.76), P.plateLt, 0.04);
  }

  /* ---------- base disc (Gargantuan: r=0.72) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.70, 0.70, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
