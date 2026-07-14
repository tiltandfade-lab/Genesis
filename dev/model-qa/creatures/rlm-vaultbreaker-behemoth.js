/* dev/model-qa/creatures/rlm-vaultbreaker-behemoth.js — VAULTBREAKER BEHEMOTH (ash realm, Huge,
   CR 10). Read: a bare-handed vault-cracking giant — an ash-caked hulking humanoid, massively
   overbuilt forearms and knuckle-scarred fists (the vault-cracking tools), a stooped bull-necked
   stance, patchwork scrap-plate loincloth/harness, a bald scarred head with a heavy jaw. No
   weapon — the fists ARE the tool, knuckles wrapped in torn rebar-wire. Whole-object grammar:
   one function, one merged frame, no anchors. NO eye quads — deep-set dark sockets only.
   Huge size: base disc r=0.68, ~2.6u tall. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildVaultbreakerBehemoth(){
  /* ---------- PALETTE (VS-desaturated ash-caked hide, scrap-plate, rebar-wire wraps) ---------- */
  const P = {
    skin:0x8a7a62, skinDk:0x5e5344, skinLt:0x9e8e72,
    ash:0x6a6254, ashDk:0x4a4438,             // ash-caked patches over the hide
    plate:0x565248, plateDk:0x3a3730, plateLt:0x6c675a,   // scrap loincloth/harness
    wire:0x353128, wireDk:0x211e18,           // rebar-wire knuckle wraps
    scar:0x453c30,
    socket:0x110e0a,
    disc:0x4a4438, discTop:0x585247,
  };

  /* ---------- LANDMARKS — HUGE, stooped bull-necked stance (a settled forward hunch). ---------- */
  const L = {
    hipY:1.12, gutY:1.28, waistY:1.42, ribY:1.62, chestY:1.80, shldY:1.96, neckY:2.02,
    jawY:2.10, cheekY:2.20, browY:2.30, crownY:2.40, headTopY:2.48,
  };
  const stoop = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), 0.14);
    return q.add(V(0, L.hipY, 0));
  };

  /* ---------- TORSO — heavy bull-necked stoop, wide gut, patchwork ash-caked hide ---------- */
  stack([
    {y:L.hipY,   rx:0.400, rz:0.360, hex:P.skinDk},
    {y:L.gutY,   rx:0.470, rz:0.450, hex:P.ash},
    {y:L.waistY, rx:0.460, rz:0.430, hex:P.skin},
    {y:L.ribY,   rx:0.420, rz:0.350, hex:P.ashDk},
    {y:L.chestY, rx:0.450, rz:0.330, hex:P.skin},
    {y:L.shldY,  rx:0.540, rz:0.370, hex:P.skinLt},
    {y:L.neckY,  rx:0.240, rz:0.230, hex:P.skinDk},
  ], 8, {xform:stoop, capTop:{hex:P.skinDk, lift:0.008}});

  /* patchwork ash-caked scar quads across the torso */
  for(const [y,z] of [[1.55,0.30],[1.72,0.22],[1.34,0.34]]){
    quad(V(-0.18,y,z), V(0.18,y,z), V(0.14,y+0.12,z+0.10), V(-0.14,y+0.12,z+0.10), P.ashDk, 0.06);
  }

  /* ---------- SCRAP-PLATE LOINCLOTH/HARNESS — patchwork armor slung low + a chest strap ---------- */
  {
    quad(V(-0.34,1.16,0.20), V(0.34,1.16,0.20), V(0.28,0.86,0.28), V(-0.28,0.86,0.28), P.plate, 0.05);
    quad(V(-0.26,1.10,0.24), V(0.10,1.10,0.24), V(0.06,0.92,0.30), V(-0.22,0.92,0.30), P.plateDk, 0.05);
    /* chest strap harness */
    quad(V(-0.40,1.94,0.10), V(-0.30,1.94,0.12), V(0.14,1.18,0.24), V(0.02,1.18,0.22), P.plateLt, 0.05);
  }

  /* ---------- HEAD — bald, heavy jaw, scarred, deep dark eye sockets (no eye quads) ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   cz:0.02, rx:0.240, rz:0.235, hex:P.skinDk},
      {y:L.cheekY, cz:0.03, rx:0.260, rz:0.250, hex:P.skin},
      {y:L.browY,  cz:0.02, rx:0.230, rz:0.220, hex:P.skinLt},
      {y:L.crownY, cz:0.00, rx:0.190, rz:0.185, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTopY, 0.00), P.skinDk);
    /* heavy jaw underslung */
    quad(V(-0.15,L.jawY-0.10,0.15), V(0.15,L.jawY-0.10,0.15), V(0.12,L.jawY-0.22,0.14), V(-0.12,L.jawY-0.22,0.14), P.skinDk, 0.05);
    /* deep-set dark eye sockets — recessed, no eye quads */
    for(const s of [-1,1]){
      quad(V(s*0.14-0.04,L.browY-0.02,0.20), V(s*0.14+0.04,L.browY-0.02,0.20),
           V(s*0.14+0.03,L.browY-0.09,0.19), V(s*0.14-0.03,L.browY-0.09,0.19), P.socket, 0.02);
    }
    /* facial ash-scar */
    quad(V(0.02,L.cheekY-0.02,0.24), V(0.06,L.browY,0.22), V(0.03,L.browY+0.02,0.23), V(-0.01,L.cheekY,0.24), P.scar, 0.04);
  }

  /* ---------- ARMS — massively overbuilt forearms, wire-wrapped knuckle-scarred fists (the tool) --- */
  {
    const mk=(sx)=>{
      const sh = V(sx*0.56, 1.90, 0.05);
      const el = V(sx*0.66, 1.44, 0.18);
      const wr = V(sx*0.60, 1.00, 0.32);
      tube(sh, el, 0.170, 0.185, 7, P.skin);              // upper arm
      tube(el, wr, 0.185, 0.210, 7, P.skinLt);            // massively overbuilt forearm (thicker than upper arm)
      /* fist — a big blocky knuckle mass */
      blob(wr.x, wr.y-0.10, wr.z+0.04, 0.150, 0.130, 0.150, P.skinDk, 8, 5);
      /* rebar-wire wraps across the knuckles */
      for(const dy of [-0.02,0.03,0.08]){
        const w0=V(wr.x-0.14,wr.y-0.10+dy,wr.z+0.10), w1=V(wr.x+0.14,wr.y-0.10+dy,wr.z+0.10);
        tube(w0,w1,0.016,0.016,4,P.wire);
      }
      /* a stray broken wire-end jutting off */
      const we0=V(wr.x+sx*0.08,wr.y-0.06,wr.z+0.14), we1=V(wr.x+sx*0.18,wr.y+0.02,wr.z+0.20);
      tube(we0,we1,0.012,0.004,4,P.wireDk,{capB:{hex:P.wireDk,lift:0.004}});
    };
    mk(1); mk(-1);
  }

  /* ---------- LEGS — thick, planted wide, scrap-wrapped shins ---------- */
  {
    const legs=(hipX)=>{
      const hip = V(hipX, L.hipY-0.06, 0.02);
      const knee = V(hipX*1.02, 0.62, 0.10);
      const foot = V(hipX*1.05, 0.05, 0.14);
      tube(hip, knee, 0.230, 0.190, 7, P.skinDk);
      tube(knee, foot, 0.190, 0.170, 7, P.ash, {capB:{hex:P.ashDk, lift:0.02}});
      quad(V(foot.x-0.13,0.03,foot.z-0.08), V(foot.x+0.13,0.03,foot.z-0.08), V(foot.x+0.11,0.01,foot.z+0.16), V(foot.x-0.11,0.01,foot.z+0.16), P.ashDk, 0.04);
      /* scrap wrap band around the shin */
      const wb=ring(V(hipX*1.02,0.34,0.08), V(0,1,0), 0.180, 0.170, 6, Math.PI/6);
      const wb2=ring(V(hipX*1.02,0.30,0.08), V(0,1,0), 0.185, 0.175, 6, Math.PI/6);
      stitch([wb,wb2], ()=>P.plate);
    };
    legs(-0.28); legs(0.28);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
