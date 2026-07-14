/* dev/model-qa/creatures/rlm-bright-satyr-revelmaster.js — BRIGHT-KINGDOM SATYR REVELMASTER
   (carnival-fey herald, Medium, CR 11). Read: a piper-lord herald whose fanfare herds crowds
   toward danger — goat-legged, curling ram horns, mid-dance pied-piper strut with pipes raised
   to the lips. Saturated carnival-tent palette (bright-kingdom register: gilt gold, harlequin
   red/purple, glossy hooves) leading over the CR6 storm-song cousin's gritted antiquity tones.

   FEATURE CHECKLIST (the budget buys): (1) raised pan-pipes at the lips, (2) curling gilt ram
   horns, (3) kicked-back digitigrade goat leg + hoof shine, (4) arched showman's spine with a
   flourished free arm, (5) harlequin-striped cloak snapping off the twist.

   POSE SENTENCE: the pied-piper strut — weight planted on the left hoof mid-stomp, the right
   goat leg kicked back and up off the ground, the torso arched backward and twisted to raise the
   pipes to the mouth, the free arm flung wide and open in a showman's flourish.

   SPINE-GESTURE SENTENCE: an S-curve running hip (twisted left, weight-bearing) -> waist
   (counter-twisted right) -> chest arched BACK and up -> shoulders riding up-left with the pipe
   arm -> neck/skull tipped further back to meet the raised pipes — the gesture line a stranger's
   eye can trace from the planted hoof straight through the pipes.

   Whole-object grammar: one function, one frame, no anchors. NO eye quads — dark almond sockets
   only (see storm-song cousin convention). Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSatyrRevelmaster(){
  const P = {
    hide:0xc98a3a, hideDk:0x8f5c22, hideLt:0xe0a856,        // gilt-bronze carnival hide
    fur:0x5c3a20, furDk:0x38230f,                            // goat-leg fur
    skin:0xd9a56e, skinDk:0x9c7042,
    cloak:0x9c2848, cloakDk:0x641a30, cloakLt:0xd94e6a,      // harlequin crimson cloak
    cloakB:0x3a2c8a, cloakBDk:0x241c5c,                       // harlequin purple-blue stripe
    horn:0xe8c458, hornDk:0xa8842c,                           // gilt gold horns
    pipes:0xe0b840, pipesDk:0xa07c1e,
    socket:0x201812, mouth:0x2a1210,
    hoof:0x1c1610, hoofShine:0x4a4034,
    disc:0x4a4038, discTop:0x585047,
  };

  /* SPINE — pied-piper strut: planted hoof, kicked leg, torso arched back into the pipes */
  const S = {
    hip:   V(-0.03, 0.58, 0.02),
    waist: V(0.01, 0.78, -0.02),
    chest: V(0.05, 1.00, -0.10),
    shldr: V(0.06, 1.11, -0.14),
    neck:  V(0.04, 1.20, -0.14),
    headB: V(0.02, 1.26, -0.16),
  };

  /* TORSO — lean humanoid upper body, arched back mid-strut */
  tube(S.hip,   S.waist, 0.135,0.115, 8, P.hide,   {phase:Math.PI/8, capA:{hex:P.hideDk,lift:0.02}});
  tube(S.waist, S.chest, 0.115,0.128, 8, P.hideLt, {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.128,0.112, 8, P.hide,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.058,0.046, 6, P.skinDk, {phase:Math.PI/6});

  /* HEAD — tipped back to meet the pipes, curling gilt ram-horns, dark almond sockets */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.19, cz:-0.14, rx:0.062,rz:0.062, hex:P.skinDk},
      {y:1.25, cz:-0.15, rx:0.068,rz:0.068, hex:P.skin},
      {y:1.31, cz:-0.16, rx:0.058,rz:0.056, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.35,-0.16), P.hideDk);
    /* jaw + trimmed beard, tipped back toward the pipes */
    tube(V(0,1.19,-0.11), V(0,1.13,-0.06), 0.052,0.038,n,P.skin,{raz:0.058,rbz:0.04,phase:ph, capB:{hex:P.furDk,lift:0.006}});
    tube(V(0,1.13,-0.06), V(0,1.02,-0.02), 0.034,0.014,6,P.furDk,{capB:{hex:P.furDk,lift:0.004}});
    /* dark almond sockets */
    for(const s of [-1,1]) quad(V(s*0.026,1.275,-0.10), V(s*0.044,1.275,-0.10),
                                 V(s*0.040,1.255,-0.102), V(s*0.030,1.255,-0.102), P.socket, 0.02);
    /* lips pursed to the raised pipes */
    quad(V(-0.018,1.155,-0.055), V(0.018,1.155,-0.055), V(0.015,1.135,-0.06), V(-0.015,1.135,-0.06), P.mouth, 0.03);
    /* CURLING gilt ram-horns, sweeping back and out */
    for(const s of [-1,1]){
      const b0=V(s*0.05,1.32,-0.13), b1=V(s*0.11,1.36,-0.22), b2=V(s*0.16,1.30,-0.32), tip=V(s*0.20,1.20,-0.38);
      tube(b0,b1,0.028,0.022,5,P.horn);
      tube(b1,b2,0.022,0.015,5,P.hornDk);
      tube(b2,tip,0.015,0.006,4,P.horn,{capB:{hex:P.hornDk,lift:0.004}});
    }
  }

  /* ARMS — one raised high, pipes at the lips; one flung wide, showman's flourish */
  {
    const pipeArm={sh:V(-0.15,1.09,-0.12), el:V(-0.24,1.22,-0.02), wr:V(-0.11,1.24,-0.06)};
    tube(pipeArm.sh, pipeArm.el, 0.045,0.034,6,P.hide);
    tube(pipeArm.el, pipeArm.wr, 0.030,0.022,6,P.skinDk,{capB:{hex:P.skin,lift:0.006}});
    /* panpipes — a graduated row of THICK tubes raised to the lips, held forward of the face
       so they clear the silhouette (0.04u+ radius so they don't dissolve at 1/3-res) */
    for(let i=0;i<5;i++){
      const l=0.07+i*0.020;
      const px=-0.03+i*0.024;
      tube(V(px,1.165,-0.02), V(px,1.165-l,-0.02), 0.020,0.016,4,P.pipes,{capB:{hex:P.pipesDk,lift:0.006}});
    }
    /* binding bar across the pipe-tops — reads as one loud gold block against the dark socket */
    quad(V(-0.05,1.185,-0.02),V(0.075,1.185,-0.02),V(0.075,1.165,-0.02),V(-0.05,1.165,-0.02), P.pipesDk, 0.04);

    const flourishArm={sh:V(0.15,1.08,-0.13), el:V(0.32,1.14,-0.04), wr:V(0.44,1.02,0.08)};
    tube(flourishArm.sh, flourishArm.el, 0.045,0.034,6,P.hide);
    tube(flourishArm.el, flourishArm.wr, 0.030,0.022,6,P.skinDk,{capB:{hex:P.skin,lift:0.006}});
    /* fanned open hand read — three short splayed digits off the wrist, thickened to hold at res */
    for(const dz of [-0.05,0,0.05]) tube(flourishArm.wr, V(0.52+dz*0.4,0.98,0.15+dz), 0.022,0.010,4,P.skinDk,{capB:{hex:P.skin,lift:0.004}});

    /* harlequin cloak snapping off the shoulders, storm-caught mid-twist — authored DOUBLE-SIDED
       (both winding orders) so it reads from the dimetric camera regardless of which way the
       swept-back quad happens to face; this is the loud color contrast zone (crimson/purple vs
       gilt-gold body) */
    const cloakQuads = [
      [V(-0.13,1.13,-0.16), V(0.13,1.12,-0.16), V(0.34,0.58,-0.44), V(-0.26,0.62,-0.40), P.cloak, 0.05],
      [V(0.02,1.09,-0.16), V(0.13,1.12,-0.16), V(0.34,0.58,-0.44), V(0.12,0.60,-0.38), P.cloakB, 0.05],
      [V(-0.26,1.09,-0.16), V(-0.02,1.09,-0.16), V(0.12,0.60,-0.38), V(-0.26,0.62,-0.40), P.cloakDk, 0.04],
      [V(0.13,1.12,-0.16), V(0.19,1.11,-0.16), V(0.40,0.56,-0.46), V(0.34,0.58,-0.44), P.cloakLt, 0.04],
      [V(-0.19,1.10,-0.16), V(-0.13,1.13,-0.16), V(-0.26,0.62,-0.40), V(-0.32,0.60,-0.42), P.cloakBDk, 0.04],
    ];
    for(const [a,b,c,d,hex,j] of cloakQuads){ quad(a,b,c,d,hex,j); quad(d,c,b,a,hex,j); }
  }

  /* LEGS — goat legs, digitigrade: LEFT planted mid-stomp, RIGHT kicked back and UP off the ground */
  {
    /* planted leg — weight-bearing, hip cocked under the twisted torso */
    {
      const hip=V(-0.10,0.57,0.03);
      const knee=V(-0.12,0.31,-0.05);
      const ankle=V(-0.11,0.15,0.11);
      const foot=V(-0.13,0.045,0.20);
      tube(hip,knee,0.078,0.054,7,P.fur,{phase:Math.PI/9});
      tube(knee,ankle,0.052,0.033,7,P.furDk);
      tube(ankle,foot,0.031,0.021,6,P.hoof,{capB:{hex:P.hoofShine,lift:0.004}});
    }
    /* kicked leg — hip flexed forward, knee driven up, hoof lifted clear of the ground behind */
    {
      const hip=V(0.09,0.60,0.01);
      const knee=V(0.20,0.48,-0.22);
      const ankle=V(0.28,0.32,-0.34);
      const foot=V(0.24,0.24,-0.46);
      tube(hip,knee,0.075,0.052,7,P.fur,{phase:Math.PI/9});
      tube(knee,ankle,0.050,0.032,7,P.furDk);
      tube(ankle,foot,0.030,0.020,6,P.hoof,{capB:{hex:P.hoofShine,lift:0.004}});
    }
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
