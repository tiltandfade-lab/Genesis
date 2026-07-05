/* dev/model-qa/creatures/rlm-storm-song-satyr-revelmaster-of-ruins.js — STORM-SONG SATYR
   REVELMASTER OF RUINS (lost-world, Medium Fey, CR 6). Read: a wild fey satyr caught mid-revel
   among fallen columns — goat-legged, curling horns, a wind-whipped storm-cloak of tattered
   festival ribbon, one arm raised holding a set of pipes to a howling mouth, hooves braced in a
   dancer's stomp. VS-desaturated antiquity register (fey brightness gritted down): weathered
   bronze-tan hide, faded storm-purple ribbon-cloak, dulled gold horns/pipes. NO eye quads —
   dark almond sockets only. Whole-object grammar: one function, one frame, no anchors. Medium
   size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildStormSongSatyrRevelmasterOfRuins(){
  const P = {
    hide:0x8a6b48, hideDk:0x5f4830, hideLt:0xa5835a,       // weathered bronze-tan hide
    fur:0x4a3a26, furDk:0x2e2418,                           // goat-leg fur
    skin:0x9c7f5c, skinDk:0x6e5a40,
    cloak:0x554066, cloakDk:0x362845, cloakLt:0x6e5680,     // faded storm-purple ribbon-cloak
    horn:0xb09858, hornDk:0x7c6838,                          // dulled gold horns
    pipes:0x9c8248, pipesDk:0x6c5a30,
    socket:0x201812, mouth:0x2a1a16,
    hoof:0x241d16,
    disc:0x4a4038, discTop:0x585047,
  };

  /* SPINE — a stomping dancer's brace, torso twisted mid-revel */
  const S = {
    hip:   V(0, 0.56, 0),
    waist: V(0.02, 0.76, 0.02),
    chest: V(0.03, 0.98, 0.04),
    shldr: V(0.02, 1.08, 0.02),
    neck:  V(0.01, 1.18, 0.0),
    headB: V(0, 1.25, -0.02),
  };

  /* TORSO — lean humanoid upper body */
  tube(S.hip,   S.waist, 0.135,0.115, 8, P.hide,   {phase:Math.PI/8, capA:{hex:P.hideDk,lift:0.02}});
  tube(S.waist, S.chest, 0.115,0.125, 8, P.hideLt, {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.125,0.115, 8, P.hide,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.058,0.046, 6, P.skinDk, {phase:Math.PI/6});

  /* HEAD — curling ram-horns, wild bearded jaw, dark almond sockets */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.17, cz:0.0, rx:0.062,rz:0.062, hex:P.skinDk},
      {y:1.23, cz:0.01,rx:0.068,rz:0.068, hex:P.skin},
      {y:1.29, cz:0.0, rx:0.058,rz:0.056, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.33,0.0), P.hideDk);
    /* jaw + wild beard */
    tube(V(0,1.17,0.02), V(0,1.10,0.03), 0.052,0.038,n,P.skin,{raz:0.058,rbz:0.04,phase:ph, capB:{hex:P.furDk,lift:0.006}});
    tube(V(0,1.10,0.03), V(0,0.96,0.02), 0.034,0.014,6,P.furDk,{capB:{hex:P.furDk,lift:0.004}});
    /* dark almond sockets */
    for(const s of [-1,1]) quad(V(s*0.026,1.245,0.055), V(s*0.044,1.245,0.055),
                                 V(s*0.040,1.225,0.053), V(s*0.030,1.225,0.053), P.socket, 0.02);
    /* howling open mouth (mid-song) */
    quad(V(-0.02,1.135,0.055), V(0.02,1.135,0.055), V(0.017,1.105,0.058), V(-0.017,1.105,0.058), P.mouth, 0.03);
    /* CURLING ram-horns, sweeping back and out */
    for(const s of [-1,1]){
      const b0=V(s*0.05,1.30,-0.01), b1=V(s*0.11,1.34,-0.10), b2=V(s*0.16,1.28,-0.20), tip=V(s*0.20,1.18,-0.26);
      tube(b0,b1,0.028,0.022,5,P.horn);
      tube(b1,b2,0.022,0.015,5,P.hornDk);
      tube(b2,tip,0.015,0.006,4,P.horn,{capB:{hex:P.hornDk,lift:0.004}});
    }
  }

  /* ARMS — one raised, holding pipes to the mouth; one flung wide mid-dance */
  {
    const pipeArm={sh:V(-0.14,1.06,0.0), el:V(-0.22,1.18,0.10), wr:V(-0.10,1.20,0.10)};
    tube(pipeArm.sh, pipeArm.el, 0.045,0.034,6,P.hide);
    tube(pipeArm.el, pipeArm.wr, 0.030,0.022,6,P.skinDk,{capB:{hex:P.skin,lift:0.006}});
    /* panpipes — a graduated row of tubes at the mouth */
    for(let i=0;i<5;i++){
      const l=0.05+i*0.015;
      const px=-0.02+i*0.018;
      tube(V(px,1.135,0.06), V(px,1.135-l,0.06), 0.010,0.008,4,P.pipes,{capB:{hex:P.pipesDk,lift:0.004}});
    }

    const wildArm={sh:V(0.14,1.05,0.0), el:V(0.28,0.98,-0.10), wr:V(0.36,1.08,-0.22)};
    tube(wildArm.sh, wildArm.el, 0.045,0.034,6,P.hide);
    tube(wildArm.el, wildArm.wr, 0.030,0.022,6,P.skinDk,{capB:{hex:P.skin,lift:0.006}});
    /* fluttering ribbon-cloak off the shoulders, storm-purple */
    quad(V(-0.13,1.10,-0.02), V(0.13,1.09,-0.02), V(0.30,0.55,-0.40), V(-0.24,0.60,-0.36), P.cloak, 0.05);
    quad(V(0.02,1.06,-0.02), V(0.13,1.09,-0.02), V(0.30,0.55,-0.40), V(0.10,0.58,-0.34), P.cloakLt, 0.05);
    quad(V(-0.24,1.06,-0.02), V(-0.02,1.06,-0.02), V(0.10,0.58,-0.34), V(-0.24,0.60,-0.36), P.cloakDk, 0.04);
  }

  /* LEGS — goat legs, digitigrade, braced in a stomping dance pose, cloven hooves */
  {
    const goatLeg=(x, footX, footZ)=>{
      const hip=V(x,0.55,0);
      const knee=V(x*1.1,0.30,-0.06);           // knee bends BACK (digitigrade)
      const ankle=V(x*1.05,0.14,0.10);
      const foot=V(footX,0.05,footZ);
      tube(hip,knee,0.075,0.052,7,P.fur,{phase:Math.PI/9});
      tube(knee,ankle,0.050,0.032,7,P.furDk);
      tube(ankle,foot,0.030,0.020,6,P.hoof,{capB:{hex:P.hoof,lift:0.004}});
    };
    goatLeg(-0.09, -0.14, 0.18);
    goatLeg( 0.09,  0.20,-0.06);
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
