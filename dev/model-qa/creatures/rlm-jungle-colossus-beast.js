/* dev/model-qa/creatures/rlm-jungle-colossus-beast.js — Jungle Colossus-Beast
   (theater/jungle era-lens, Huge, CR 9). A tamed prehistoric beast — a massive thick-hided
   quadruped (ceratopsian/rhino-adjacent bulk read) used as a living battering ram: a broad armored
   frill/brow, a heavy blunt horn-boss lowered forward, and crude harness/battering straps lashed
   across its shoulders. Whole-object grammar: one merged frame, no anchors. VS-desaturated palette:
   dull jungle-hide olive-grey, mud-caked underbelly, weathered leather harness, dull horn bone.
   NO eye quads (small brow ridge shadow only). Huge size: base disc r=0.68.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildJungleColossusBeast(){
  const P = {
    hide:0x565c3e, hideDk:0x3a3e28, hideLt:0x6d7350,
    mud:0x453c2c, mudDk:0x2c2519,
    horn:0x8a7a5c, hornDk:0x5c4f3a,
    harness:0x4a3626, harnessDk:0x2e2013, buckle:0x6b5c34,
    disc:0x453f34, discTop:0x524b3c,
  };

  /* ---------- LANDMARKS — low broad quadruped spine, held low, massive frontal mass. body ~2.3u. --*/
  const spY = 0.62;
  const S = {
    tailBase: V(0, spY-0.02, -0.90),
    rump:     V(0, spY+0.05, -0.60),
    loin:     V(0, spY+0.08, -0.28),
    mid:      V(0, spY+0.08,  0.05),
    shldr:    V(0, spY+0.04,  0.42),
    neck:     V(0, spY-0.02,  0.66),
    headB:    V(0, spY-0.05,  0.82),
  };

  /* ---------- BODY — a huge barrel loft, thick hide, low-slung. ---------- */
  tube(S.rump,  S.loin,  0.44, 0.48, 10, P.hide,   {phase:Math.PI/10, capA:{hex:P.hideDk,lift:0.03}});
  tube(S.loin,  S.mid,   0.48, 0.50, 10, P.hideDk, {phase:Math.PI/10});
  tube(S.mid,   S.shldr, 0.50, 0.44, 10, P.hide,   {phase:Math.PI/10});
  tube(S.shldr, S.neck,  0.44, 0.30, 10, P.hideLt, {phase:Math.PI/10});
  tube(S.neck,  S.headB, 0.30, 0.24, 10, P.hideDk, {phase:Math.PI/10});
  // mud-caked belly strip
  { const by=spY-0.44;
    quad(V(-0.32,by,-0.55), V(0.32,by,-0.55), V(0.28,by+0.03,0.36), V(-0.28,by+0.03,0.36), P.mud, 0.05); }

  /* ---------- HEAD + FRILL/BROW ARMOR + BLUNT HORN-BOSS — the battering-ram silhouette. ---------- */
  {
    const n=9, ph=Math.PI/9;
    const bands=[
      {y:spY-0.10, cz:0.86, rx:0.235, rz:0.24, hex:P.hide},
      {y:spY+0.02, cz:0.90, rx:0.27,  rz:0.26, hex:P.hideDk},   // broad armored brow shelf
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    // armored frill fanning up/back behind the brow — several wide flat plates
    for(let i=0;i<5;i++){
      const t=i/4, ang=(t-0.5)*1.5;
      const bx = Math.sin(ang)*0.30, bz = 0.80 - Math.cos(ang)*0.06;
      quad(V(bx-0.08,spY+0.06,bz), V(bx+0.08,spY+0.06,bz), V(bx+0.10,spY+0.34,bz-0.08), V(bx-0.10,spY+0.34,bz-0.08),
        (i%2===0)?P.hideDk:P.hide, 0.04);
    }
    // blunt HORN-BOSS jutting forward+low, the ram-head
    const hb0=V(0,spY-0.06,0.92), hb1=V(0,spY-0.10,1.12), hb2=V(0,spY-0.12,1.28);
    tube(hb0,hb1,0.155,0.130,8,P.hornDk,{phase:Math.PI/8});
    tube(hb1,hb2,0.130,0.095,8,P.horn,{phase:Math.PI/8, capB:{hex:P.hornDk, lift:0.02}});
    // brow-ridge shadow (no eye quad, just a dark recess suggesting a small eye without one)
    for(const s of [-1,1]) quad(V(s*0.14,spY+0.03,0.86), V(s*0.19,spY+0.03,0.86),
      V(s*0.17,spY-0.02,0.86), V(s*0.12,spY-0.02,0.86), P.hideDk, 0.05);
  }

  /* ---------- LEGS — 4 massive pillar legs, splayed slightly, deeply planted. ---------- */
  {
    const leg=(hipX, hipZ, footX, footZ)=>{
      const hip = V(hipX, spY-0.30, hipZ);
      const knee= V(hipX+Math.sign(hipX)*0.05, 0.30, hipZ*0.6+footZ*0.4);
      const foot= V(footX, 0.06, footZ);
      tube(hip, knee, 0.20, 0.17, 8, P.hide, {phase:Math.PI/8});
      tube(knee, foot, 0.17, 0.20, 8, P.hideDk, {phase:Math.PI/8, capB:{hex:P.mudDk, lift:0.03}});
      // 3 blunt toenails
      for(const dx of [-0.09,0,0.09]) quad(V(foot.x+dx-0.03,0.03,foot.z+0.14),V(foot.x+dx+0.03,0.03,foot.z+0.14),
        V(foot.x+dx+0.02,0.0,foot.z+0.20),V(foot.x+dx-0.02,0.0,foot.z+0.20), P.hornDk, 0.03);
    };
    leg(-0.32, 0.34, -0.42, 0.46);
    leg( 0.32, 0.34,  0.42, 0.42);
    leg(-0.34,-0.50, -0.44,-0.62);
    leg( 0.34,-0.50,  0.44,-0.58);
  }

  /* ---------- TAIL — short thick tapering tail, low. ---------- */
  {
    const t0=S.tailBase, t1=V(0.04,spY-0.06,-1.16), t2=V(0.06,spY-0.10,-1.34);
    tube(t0,t1,0.20,0.14,8,P.hide,{phase:Math.PI/8, capA:{hex:P.hideDk}});
    tube(t1,t2,0.14,0.06,8,P.hideDk,{phase:Math.PI/8, capB:{hex:P.hideDk,lift:0.02}});
  }

  /* ---------- HARNESS / BATTERING STRAPS — crude leather harness lashed over the shoulders,
     linking to a heavy push-beam/yoke bolted at the chest, marking it "used" not wild. ---------- */
  {
    quad(V(-0.30,spY+0.30,0.30), V(0.30,spY+0.30,0.30), V(0.26,spY-0.10,0.44), V(-0.26,spY-0.10,0.44), P.harness, 0.05);
    quad(V(-0.30,spY+0.28,0.28), V(0.30,spY+0.28,0.28), V(0.30,spY+0.22,0.28), V(-0.30,spY+0.22,0.28), P.harnessDk, 0.04);
    for(const s of [-1,1]) quad(V(s*0.20,spY+0.05,0.42),V(s*0.20+0.03,spY+0.05,0.42),
      V(s*0.20+0.02,spY-0.02,0.42),V(s*0.20-0.01,spY-0.02,0.42), P.buckle, 0.05);
    // yoke beam bolted low across the chest for pushing
    tube(V(-0.30,spY-0.05,0.44), V(0.30,spY-0.05,0.44), 0.045,0.045, 6, P.harnessDk);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
