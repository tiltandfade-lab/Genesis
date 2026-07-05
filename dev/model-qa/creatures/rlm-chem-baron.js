/* dev/model-qa/creatures/rlm-chem-baron.js — CHEM-BARON (ash realm, Medium biped, CR 6). No
   bespoke model needed (uses the mage stat frame only) — this module dresses that silhouette as
   a wasteland kingpin in scavenged finery: a long patched fur-trim coat over chem-stained flak
   plate, gaudy scrap-metal rings and chains, a cracked gas-mask pushed up on the brow like a
   crown, a chem-drum cane/staff topped with a sloshing toxic-green vial. Whole-object grammar,
   one merged frame, no anchors. NO eye quads. VS-desaturated ash palette with a sickly chem-green
   accent (the one saturated note against the dust-drab). Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildChemBaron(){
  /* ---------- PALETTE (dust-drab coat + scavenged gilt, one sickly chem-green accent) ---------- */
  const P = {
    skin:0x8a7458, skinDk:0x695a44,
    coat:0x5a4a3a, coatDk:0x3c3126, coatLt:0x6e5c48,          // long patched coat
    fur:0x8a7a5c, furDk:0x66593f,                              // fur trim collar/cuffs
    plate:0x625d52, plateDk:0x3f3b33,                          // chem-stained flak plate beneath
    gilt:0x9a7a3a, giltDk:0x6b5424,                             // scrap-gold rings/chains
    mask:0x2e2b25, lens:0x3a4a3a,                               // cracked gas-mask (pushed up, dark lens)
    chem:0x6e9a3a, chemDk:0x466022, chemGlow:0x9ac24a,          // the one saturated chem-green note
    cane:0x413b30, disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — a stocky, self-satisfied stance, ~1.66u tall (mage frame proportions). ---------- */
  const S = {
    hip:    V(0, 0.86, 0),
    waist:  V(0, 1.03, 0.01),
    chest:  V(0, 1.28, 0.02),
    shldr:  V(0, 1.45, 0.00),
    neck:   V(0, 1.53, 0.00),
    headB:  V(0, 1.59, -0.01),
    headT:  V(0, 1.77, -0.02),
  };

  /* ---------- TORSO — heavy coat over flak plate ---------- */
  tube(S.hip,   S.waist, 0.20, 0.175, 8, P.coat,   {phase:Math.PI/8, capA:{hex:P.coatDk, lift:0.02}});
  tube(S.waist, S.chest, 0.175, 0.225, 8, P.coatLt, {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.225, 0.205, 8, P.coat,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.205, 0.085, 8, P.coatDk, {phase:Math.PI/8});

  /* chem-stained flak plate peeking at the chest opening */
  quad(V(-0.09,1.40,0.20), V(0.09,1.40,0.20), V(0.08,1.16,0.20), V(-0.08,1.16,0.20), P.plate, 0.05);
  quad(V(-0.05,1.30,0.22), V(0.05,1.30,0.22), V(0.045,1.20,0.22), V(-0.045,1.20,0.22), P.plateDk, 0.06);

  /* FUR-TRIM COLLAR — a broad scavenged fur ruff around the neck/shoulders */
  {
    const r1=ring(V(0,1.44,0.00), V(0,1,0), 0.235, 0.225, 10, Math.PI/10);
    const r2=ring(V(0,1.51,0.00), V(0,1,0), 0.20, 0.19, 10, Math.PI/10);
    stitch([r1,r2], ()=>P.fur);
    capFan(r2, V(0,1.515,0.0), P.furDk);
  }

  /* LONG COAT SKIRT — flares below the hip, patched fabric hanging past the knee */
  {
    const rH=ring(V(0,0.86,0), V(0,1,0), 0.20, 0.19, 10, Math.PI/10);
    const rL=ring(V(0,0.44,0), V(0,1,0), 0.30, 0.28, 10, Math.PI/10);
    stitch([rH,rL], ()=>P.coatDk);
    capFan(rL, V(0,0.42,0), P.coatDk, true);
    /* a visible patch square on the skirt */
    quad(V(-0.10,0.66,0.27), V(0.02,0.66,0.28), V(0.01,0.54,0.27), V(-0.11,0.54,0.26), P.coatLt, 0.08);
  }

  /* GAUDY GILT CHAINS across the chest */
  {
    for(const dy of [0.02, -0.05]){
      const l=V(-0.16,1.38+dy,0.16), r=V(0.16,1.38+dy,0.16), mid=V(0,1.24+dy,0.24);
      tube(l, mid, 0.014, 0.012, 4, P.gilt);
      tube(mid, r, 0.012, 0.014, 4, P.gilt);
    }
    /* a heavy scrap-medallion at the chain's low point */
    blob(0, 1.20, 0.26, 0.05, 0.05, 0.02, P.gilt, 6, 3);
  }

  /* ---------- HEAD — cracked gas-mask pushed up on the brow like a crown ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.60, cz:0.00, rx:0.098, rz:0.10, hex:P.skin},
      {y:1.67, cz:0.00, rx:0.103, rz:0.10, hex:P.skin},
      {y:1.74, cz:-0.01,rx:0.090, rz:0.09, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, 1.785, -0.01), P.skinDk);

    /* jaw/smirk shading (no eye quads) */
    quad(V(-0.06,1.615,0.085), V(0.06,1.615,0.085), V(0.05,1.585,0.088), V(-0.05,1.585,0.088), P.skinDk, 0.05);

    /* GAS-MASK pushed up on the brow — a dark shell + cracked lens facing up/forward, worn like a crown */
    {
      const mc = V(0, 1.80, -0.02);
      blob(mc.x, mc.y, mc.z, 0.115, 0.075, 0.10, P.mask, 8, 4);
      quad(V(-0.06,1.79,0.07), V(0.06,1.79,0.07), V(0.05,1.75,0.06), V(-0.05,1.75,0.06), P.lens, 0.06);
      /* crack across the lens */
      quad(V(-0.04,1.785,0.075), V(0.01,1.77,0.07), V(0.005,1.765,0.068), V(-0.045,1.78,0.073), P.mask, 0.03);
      /* mask filter canister hanging off the side, unstrapped */
      tube(V(0.09,1.72,0.02), V(0.13,1.60,0.04), 0.028, 0.024, 5, P.mask, {capB:{hex:P.plateDk, lift:0.006}});
    }
  }

  /* ---------- ARMS — one resting on the chem-cane, one gesturing with rings ---------- */
  {
    const shL = V(-0.21, 1.42, 0.02), shR = V(0.21, 1.42, 0.02);
    const elL = V(-0.27, 1.16, 0.10);
    const wrL = V(-0.14, 0.92, 0.20);
    const elR = V(0.25, 1.18, 0.12);
    const wrR = V(0.20, 1.02, 0.28);
    tube(shL, elL, 0.070, 0.056, 6, P.coat);
    tube(elL, wrL, 0.056, 0.044, 6, P.coatDk, {capB:{hex:P.skinDk, lift:0.02}});
    tube(shR, elR, 0.070, 0.056, 6, P.coat);
    tube(elR, wrR, 0.056, 0.044, 6, P.coatDk, {capB:{hex:P.skinDk, lift:0.02}});
    /* scrap rings on the gesturing hand */
    for(const dz of [-0.01,0.02]) blob(wrR.x, wrR.y-0.02, wrR.z+dz, 0.018,0.015,0.015, P.gilt, 5, 3);

    /* CHEM-DRUM CANE — a scavenged drum-pipe staff topped with a sloshing toxic vial */
    const caneB = V(-0.16, 0.10, 0.24);
    const caneT = V(-0.15, 0.94, 0.22);
    tube(caneB, caneT, 0.032, 0.026, 6, P.cane, {capA:{hex:P.plateDk, lift:0.01}});
    blob(caneT.x, caneT.y+0.10, caneT.z, 0.055, 0.075, 0.05, P.chem, 7, 5);
    blob(caneT.x, caneT.y+0.12, caneT.z, 0.03, 0.04, 0.03, P.chemGlow, 5, 3);
    quad(V(caneT.x-0.03,caneT.y+0.16,caneT.z), V(caneT.x+0.03,caneT.y+0.16,caneT.z),
         V(caneT.x+0.02,caneT.y+0.02,caneT.z), V(caneT.x-0.02,caneT.y+0.02,caneT.z), P.chemDk, 0.06);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
